# Kong 部署运维指南

> **定位**：开源 API 网关和微服务管理平台，插件化架构
> **适用场景**：API 网关、微服务流量管理、认证限流、Serverless
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

Kong 是开源的云原生 API 网关，基于 Nginx + OpenResty，以插件化架构著称，支持 Lua/Go/JS 插件，提供 DB-less（声明式）和数据库（PostgreSQL/Cassandra）两种模式。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **插件体系** | 100+ 插件：认证/限流/日志/转换/安全 |
| **DB-less** | 声明式配置，无需数据库 |
| **多语言插件** | Lua/Go/JavaScript/Python |
| **Ingress Controller** | K8s Ingress 集成 |
| **多协议** | HTTP/gRPC/WebSocket/TCP/TLS |
| **Kong Manager** | 企业版 GUI |

### 1.3 适用场景

**最佳适用**：API 网关、K8s Ingress、认证限流、微服务流量管理

**不适用**：纯动态路由（→ APISIX 更灵活）、服务网格（→ Envoy/Istio）、简单代理（→ Nginx）

---

## 2. 部署

### 2.1 Docker 部署（DB-less）

```bash
docker run -d \
  --name kong \
  -p 8000:8000 \
  -p 8443:8443 \
  # 安全：生产环境 Admin API 应绑定内网 IP，避免将 8001 暴露到公网
  -p 8001:8001 \
  -v ./kong.yml:/kong/declarative/kong.yml \
  -e KONG_DATABASE=off \
  -e KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yml \
  --restart unless-stopped \
  kong:3.7
```

### 2.2 Docker Compose 部署（Kong + PostgreSQL）

```yaml
# docker-compose.yml
version: '3.8'

services:
  kong-db:
    image: postgres:16
    container_name: kong-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: kong
      POSTGRES_PASSWORD: KongDB!Pass
      POSTGRES_DB: kong
    volumes:
      - kong-db-data:/var/lib/postgresql/data
    networks:
      - kong-net

  kong-migration:
    image: kong:3.7
    container_name: kong-migration
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-db
      KONG_PG_PASSWORD: KongDB!Pass
    command: kong migrations bootstrap
    depends_on:
      - kong-db
    networks:
      - kong-net

  kong:
    image: kong:3.7
    container_name: kong
    restart: unless-stopped
    ports:
      - "8000:8000"
      - "8443:8443"
      # 安全：生产环境 Admin API 应绑定内网 IP，避免将 8001 暴露到公网
      - "8001:8001"
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-db
      KONG_PG_PASSWORD: KongDB!Pass
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      # 安全：生产环境应绑定内网 IP（如 192.168.x.x），禁止暴露 Admin API
      KONG_ADMIN_LISTEN: "0.0.0.0:8001"
    depends_on:
      - kong-db
      - kong-migration
    networks:
      - kong-net

volumes:
  kong-db-data:

networks:
  kong-net:
    driver: bridge
```

### 2.3 生产环境部署要点

**DB-less vs DB 模式**：

| 模式 | 存储 | 动态配置 | 适用 |
|------|------|----------|------|
| **DB-less** | YAML 文件 | 需重启 | K8s/GitOps |
| **PostgreSQL** | PG | Admin API 实时 | 传统部署 |

**安全清单**：Admin API 限制访问、认证插件（JWT/Key Auth/OAuth2）、限流插件、CORS 插件

---

## 3. 配置文件

### 3.2 DB-less 声明式配置

```yaml
# kong.yml — DB-less 声明式配置

_format_version: "3.0"
_transform: true

services:
  - name: order-service
    url: http://app-1:8080
    routes:
      - name: order-route
        paths:
          - /api/orders
        methods:
          - GET
          - POST
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: local
      - name: key-auth
      - name: prometheus

consumers:
  - username: app-client
    keyauth_creds:
      - key: "app-api-key-2024"

# 逻辑：DB-less 模式所有配置在一个 YAML 文件
# 修改后需重启 Kong 或通过 Admin API reload
```

### 3.3 生产环境配置（kong.conf）

```ini
# kong.conf — 生产环境

# === 数据库 ===
database = postgres
pg_host = kong-db
pg_port = 5432
pg_user = kong
pg_password = KongDB!Pass
pg_database = kong

# === 代理 ===
proxy_listen = 0.0.0.0:8000, 0.0.0.0:8443 http2 ssl
admin_listen = 127.0.0.1:8001

# === Worker ===
nginx_worker_processes = auto
# 逻辑：同 Nginx，auto = CPU 核数

# === 日志 ===
proxy_access_log = /var/log/kong/proxy-access.log
proxy_error_log = /var/log/kong/proxy-error.log
admin_access_log = /var/log/kong/admin-access.log
admin_error_log = /var/log/kong/admin-error.log
log_level = warn

# === DNS ===
dns_resolver = 10.0.0.1:53
dns_order = LAST,A,CNAME
# 逻辑：DNS 解析顺序影响服务发现

# === 其他 ===
client_max_body_size = 20m
client_body_buffer_size = 8k
```

---

## 4. 调优

### 4.1 Worker 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `nginx_worker_processes` | Worker 数 | auto | 同 Nginx |
| `nginx_worker_connections` | 连接数 | 16384 | Kong 底层是 Nginx，调优方式相同 |

### 4.2 数据库子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `pg_max_concurrent_queries` | PG 并发查询 | 0（不限） | 限制可防止 PG 过载 |
| `db_cache_ttl` | 配置缓存 TTL | 0（永不过期） | Kong 缓存 PG 中的配置，0 表示依赖 PG 通知 |

### 4.3 容量规划

| 规模 | Kong | CPU | 内存 | PG | QPS |
|------|------|-----|------|-----|------|
| 小型 | 2 | 4 核 | 4G | 小 | < 1 万 |
| 中型 | 4 | 8 核 | 8G | 中 | 1-5 万 |
| 大型 | 8+ | 16 核 | 16G | 大 | 5 万+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# Service 管理
curl -X POST http://localhost:8001/services \
  -d "name=order-service" \
  -d "url=http://app-1:8080"

# Route 管理
curl -X POST http://localhost:8001/services/order-service/routes \
  -d "paths[]=/api/orders"

# Plugin 管理
curl -X POST http://localhost:8001/services/order-service/plugins \
  -d "name=rate-limiting" \
  -d "config.minute=100"

# Consumer 管理
curl -X POST http://localhost:8001/consumers \
  -d "username=app-client"
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **请求速率** | Prometheus 插件 | 异常 |
| **5xx** | Prometheus 插件 | > 1% |
| **延迟** | Prometheus 插件 | P99 > 500ms |
| **DB 连接** | PG 监控 | 接近上限 |

### 5.3 备份与恢复

```bash
# 导出配置
curl http://localhost:8001/config > kong-config-backup.json

# DB 备份
pg_dump -U kong kong > kong-db-backup.sql
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：插件不生效

**排查**：检查插件是否关联到 Service/Route → 检查插件 config → 查看错误日志

#### 故障 2：503 No Route

**排查**：检查 Route 配置 → 检查 Host/Path 匹配 → 检查 DNS 解析

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| Admin API | `:8001` |
| Prometheus | `/metrics` |
| 日志 | `/var/log/kong/` |

---

## 7. 参考资料

- [Kong Documentation](https://docs.konghq.com/)
- [Kong DB-less Mode](https://docs.konghq.com/gateway/latest/production/deployment-modes/db-less-and-declarative-config/)
- [Kong Plugin Hub](https://docs.konghq.com/hub/)

# APISIX 部署运维指南

> **定位**：Apache 开源的高性能 API 网关，动态路由 + 插件化
> **适用场景**：API 网关、微服务流量管理、动态路由、限流认证
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Apache APISIX 是开源的云原生 API 网关，基于 Nginx + etcd 架构，全动态配置（无需重启）、插件热加载、支持 Lua/Go/Java/WASM 插件扩展。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **动态路由** | 路由/上游/插件全部动态，无需 reload |
| **etcd 存储** | 配置存 etcd，Watch 实时推送 |
| **插件体系** | 100+ 内置插件：限流/认证/日志/熔断/转换 |
| **多协议** | HTTP/gRPC/WebSocket/TCP/UDP/Dubbo |
| **多语言插件** | Lua/Go/Java/Python/WASM |
| **Dashboard** | 可视化路由和插件管理 |

### 1.3 适用场景

**最佳适用**：API 网关、微服务流量入口、动态路由、限流认证、灰度发布

**不适用**：纯静态资源服务（→ Nginx）、服务网格 Sidecar（→ Envoy）、简单反向代理（→ Nginx）

---

## 2. 部署

### 2.1 Docker 部署

```bash
docker run -d \
  --name apisix \
  -p 9080:9080 \
  -p 9443:9443 \
  -v ./conf/config.yaml:/usr/local/apisix/conf/config.yaml \
  --restart unless-stopped \
  apache/apisix:3.9.0-debian
```

### 2.2 Docker Compose 部署（APISIX + etcd + Dashboard）

```yaml
# docker-compose.yml
version: '3.8'

services:
  etcd:
    image: bitnami/etcd:3.5
    container_name: apisix-etcd
    restart: unless-stopped
    environment:
      ALLOW_NONE_AUTHENTICATION: "yes"
      ETCD_ADVERTISE_CLIENT_URLS: http://etcd:2379
    volumes:
      - etcd-data:/bitnami/etcd
    networks:
      - apisix-net

  apisix:
    image: apache/apisix:3.9.0-debian
    container_name: apisix
    restart: unless-stopped
    ports:
      - "9080:9080"
      - "9443:9443"
    volumes:
      - ./conf/config.yaml:/usr/local/apisix/conf/config.yaml
      - ./conf/apisix.yaml:/usr/local/apisix/conf/apisix.yaml
    # 注意：如果使用 etcd 模式配置路由（通过 Admin API / Dashboard），则不应挂载 apisix.yaml（Standalone 模式），两者互斥需二选一。
    # etcd 模式：配置存 etcd，动态推送。Standalone 模式：配置存 apisix.yaml，静态加载。
    depends_on:
      - etcd
    networks:
      - apisix-net

  dashboard:
    image: apache/apisix-dashboard:3.0.1-alpine
    container_name: apisix-dashboard
    restart: unless-stopped
    ports:
      - "9000:9000"
    volumes:
      - ./conf/dashboard.yaml:/usr/local/apisix-dashboard/conf/conf.yaml
    depends_on:
      - etcd
    networks:
      - apisix-net

volumes:
  etcd-data:

networks:
  apisix-net:
    driver: bridge
```

### 2.3 生产环境部署要点

**高可用**：APISIX 无状态，多实例 + Nginx/LB 前置；etcd ≥ 3 节点

**安全清单**：etcd 开启认证、API Key 认证插件、JWT 插件、CORS 插件、限流插件

---

## 3. 配置文件

### 3.2 开发环境配置

```yaml
# conf/config.yaml — 开发环境
apisix:
  node_listen: 9080
  enable_admin: true
  admin_key:
    - name: admin
      key: admin-key-dev
      role: admin

etcd:
  host:
    - "http://etcd:2379"
```

### 3.3 生产环境配置

```yaml
# conf/config.yaml — 生产环境

apisix:
  node_listen: 9080
  enable_admin: true
  # Admin API 认证
  admin_key:
    - name: admin
      key: "ProdAPISIX!AdminKey2024Secure"
      role: admin
  # 逻辑：admin_key 必须修改默认值，否则任何人可管理路由

  # Worker 进程
  worker_processes: auto           # 自动匹配 CPU 核数

  # 限流配置
  limit_count:
    count: 1000                    # 窗口内最大请求数
    time_window: 1                 # 1 秒窗口

  # 请求体大小
  client_max_body_size: 20m

etcd:
  host:
    - "http://etcd-1:2379"
    - "http://etcd-2:2379"
    - "http://etcd-3:2379"
  prefix: "/apisix"
  # 逻辑：etcd 多节点保证配置高可用
  # APISIX Watch etcd 前缀，配置变更实时推送

# === 插件 ===
# 逻辑：插件按需启用，未使用的插件不加载，减少内存
plugins:
  - limit-count                    # 限流
  - limit-req                      # 请求速率限制
  - key-auth                       # API Key 认证
  - jwt-auth                       # JWT 认证
  - basic-auth                     # Basic 认证
  - consumer-restriction           # 消费者限制
  - ip-restriction                 # IP 黑白名单
  - cors                           # CORS
  - proxy-rewrite                  # 请求改写
  - request-id                     # 请求 ID
  - zipkin                         # 链路追踪
  - prometheus                     # 监控指标
  - grpc-transcode                 # gRPC 转 HTTP
  - response-rewrite               # 响应改写
  - fault-injection                # 故障注入
  - echo                           # 调试

stream_plugins:
  - ip-restriction
  - limit-conn
```

**Dashboard 配置** `conf/dashboard.yaml`：

```yaml
conf:
  listen:
    host: 0.0.0.0
    port: 9000
  etcd:
    endpoints:
      - "http://etcd:2379"
    prefix: "/apisix"
authentication:
  secret: "DashboardSecret2024!"
  expire_time: 3600
  users:
    - username: admin
      password: Dashboard!Pass
```

---

## 4. 调优

### 4.1 Worker 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `worker_processes` | Worker 数 | auto | 同 Nginx，auto = CPU 核数 |
| etcd Watch 延迟 | 配置推送延迟 | < 1s | etcd Watch 机制，变更秒级推送到 APISIX |

### 4.2 插件子系统

| 原则 | 说明 |
|------|------|
| **按需启用** | 只启用使用的插件，减少内存和 CPU |
| **插件顺序** | 认证 → 限流 → 路由 → 日志，顺序影响行为 |
| **LuaJIT** | APISIX 基于 LuaJIT，JIT 加速热点路径 |

### 4.3 容量规划

| 规模 | APISIX | CPU | 内存 | etcd | QPS |
|------|--------|-----|------|------|------|
| 小型 | 2 | 4 核 | 4G | 3 | < 1 万 |
| 中型 | 4 | 8 核 | 8G | 3 | 1-5 万 |
| 大型 | 8+ | 16 核 | 16G | 5 | 5 万+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 路由管理（Admin API）
curl http://apisix:9180/apisix/admin/routes/1 \
  -H 'X-API-KEY: ProdAPISIX!AdminKey2024Secure' \
  -X PUT -d '
{
  "uri": "/api/*",
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "app-1:8080": 1,
      "app-2:8080": 1
    }
  },
  "plugins": {
    "limit-count": {
      "count": 100,
      "time_window": 1,
      "rejected_code": 429
    },
    "key-auth": {}
  }
}'

# 查看路由
curl http://apisix:9180/apisix/admin/routes \
  -H 'X-API-KEY: ProdAPISIX!AdminKey2024Secure'

# 上游管理
curl http://apisix:9180/apisix/admin/upstreams/1 \
  -H 'X-API-KEY: ProdAPISIX!AdminKey2024Secure' \
  -X PUT -d '
{
  "type": "roundrobin",
  "nodes": {
    "app-1:8080": 1,
    "app-2:8080": 1
  },
  "retries": 3,
  "timeout": {
    "connect": 5,
    "send": 5,
    "read": 60
  }
}'
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **请求速率** | Prometheus 插件 | 异常增长 |
| **5xx 比例** | Prometheus 插件 | > 1% |
| **延迟** | Prometheus 插件 | P99 > 500ms |
| **etcd 状态** | etcd metrics | 无 Leader |

**Prometheus**：`/apisix/prometheus/metrics`

### 5.3 备份与恢复

```bash
# etcd 备份
etcdctl snapshot save /backup/etcd-snapshot.db

# 恢复
etcdctl snapshot restore /backup/etcd-snapshot.db
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：路由不生效

**排查**：检查 Admin API 响应 → 检查 etcd 数据 → 检查插件配置 → 查看 error.log

#### 故障 2：503 Service Unavailable

**排查**：检查上游节点是否存活 → 检查健康检查配置 → 检查超时设置

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| Admin API | 路由/插件管理 |
| Dashboard | `:9000` |
| Prometheus | `/apisix/prometheus/metrics` |
| error.log | `/usr/local/apisix/logs/error.log` |

---

## 7. 参考资料

- [Apache APISIX Documentation](https://apisix.apache.org/docs/apisix/getting-started/)
- [APISIX Plugins](https://apisix.apache.org/docs/apisix/plugins/)
- [APISIX Dashboard](https://apisix.apache.org/docs/dashboard/USER_GUIDE/)

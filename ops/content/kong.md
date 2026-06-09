# Kong 部署指南

> 版本：3.7 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| 数据库 | PostgreSQL 15+（DB 模式必需）/ 无（DB-less） |
| 端口 | 8000（代理 HTTP）、8443（代理 HTTPS）、8001（Admin API） |
| 内存 | ≥ 512M |

> **Admin API 必须绑定内部 IP**（如 `127.0.0.1` 或内网 IP），`0.0.0.0` 只允许开发环境。

## 2. 裸机安装（通用）

```bash
# 方法一：包管理器
wget https://packages.konghq.com/public/gateway/rpm/el/9/x86_64/kong-3.7.0.el9.x86_64.rpm
sudo yum install -y kong-3.7.0.el9.x86_64.rpm

# 方法二：Docker 镜像（推荐）
docker pull kong:3.7
```

## 3. 单机部署（DB-less 模式）

**适用场景**：K8s GitOps、静态配置、无需动态管理

### 3.1 配置

```yaml
cat > kong.yml << 'EOF'
_format_version: "3.0"
_transform: true

services:
  - name: order-service
    url: http://app:8080
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
EOF
```

### 3.2 启动

```bash
docker run -d \
  --name kong \
  -p 8000:8000 \
  -p 8443:8443 \
  -p 127.0.0.1:8001:8001 \
  -v ./kong.yml:/kong/declarative/kong.yml \
  -e KONG_DATABASE=off \
  -e KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yml \
  -e KONG_ADMIN_LISTEN=127.0.0.1:8001 \
  --restart unless-stopped \
  kong:3.7
```

### 3.3 验证

```bash
curl -s http://127.0.0.1:8001/status | jq
# 预期返回数据库状态为 disconnected（DB-less 正常）

curl -s http://127.0.0.1:8000/api/orders -I
```

### 3.4 Docker Compose

```yaml
services:
  kong:
    image: kong:3.7
    container_name: kong
    restart: unless-stopped
    ports:
      - "8000:8000"
      - "8443:8443"
      - "127.0.0.1:8001:8001"
    volumes:
      - ./kong.yml:/kong/declarative/kong.yml
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/declarative/kong.yml
      KONG_ADMIN_LISTEN: 127.0.0.1:8001
```

## 4. 集群部署（DB 模式）

**适用场景**：生产环境，动态配置管理

### 4.1 节点规划

| 节点 | IP | 代理端口 | Admin 端口 |
|------|-----|----------|------------|
| kong-1 | 10.0.0.1 | 8000 | 127.0.0.1:8001 |
| kong-2 | 10.0.0.2 | 8000 | 127.0.0.1:8001 |
| postgres | 10.0.0.10 | 5432 | - |

### 4.2 配置

```bash
cat > /etc/kong/kong.conf << 'EOF'
database = postgres
pg_host = 10.0.0.10
pg_port = 5432
pg_user = kong
pg_password = KongDB!Pass
pg_database = kong

proxy_listen = 0.0.0.0:8000, 0.0.0.0:8443 http2 ssl
admin_listen = 127.0.0.1:8001

nginx_worker_processes = auto
EOF
```

**初始化数据库：**

```bash
kong migrations bootstrap -c /etc/kong/kong.conf
```

> 注意：数据库初始化只需执行一次，不要在每台 Kong 节点上重复执行。

### 4.3 启动

```bash
kong start -c /etc/kong/kong.conf
```

### 4.4 验证

```bash
curl -s http://127.0.0.1:8001/status | jq
# 预期 database 状态为 connected

curl -s http://127.0.0.1:8001/services | jq
# 预期返回服务列表

curl -s -X POST http://127.0.0.1:8001/services \
  -d "name=order-service" \
  -d "url=http://app:8080"
```

### 4.5 Docker Compose（PostgreSQL + Kong × 2）

```yaml
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
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "kong"]
      interval: 5s
      timeout: 3s
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
      kong-db:
        condition: service_healthy
    networks:
      - kong-net

  kong-1: &kong-node
    image: kong:3.7
    container_name: kong-1
    restart: unless-stopped
    ports:
      - "8000:8000"
      - "8443:8443"
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-db
      KONG_PG_PASSWORD: KongDB!Pass
      KONG_ADMIN_LISTEN: 127.0.0.1:8001
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
    depends_on:
      kong-migration:
        condition: service_completed_successfully
    networks:
      - kong-net

  kong-2:
    <<: *kong-node
    container_name: kong-2
    ports:
      - "8001:8000"
      - "8445:8443"

volumes:
  kong-db-data:

networks:
  kong-net:
    driver: bridge
```

## 5. 运维速查

```bash
# Service 管理
curl -s http://127.0.0.1:8001/services | jq
curl -X POST http://127.0.0.1:8001/services -d "name=svc" -d "url=http://target"

# Route 管理
curl -X POST http://127.0.0.1:8001/services/svc/routes -d "paths[]=/api"

# Plugin 管理
curl -X POST http://127.0.0.1:8001/services/svc/plugins \
  -d "name=rate-limiting" -d "config.minute=100"

# Consumer 管理
curl -X POST http://127.0.0.1:8001/consumers -d "username=app-client"

# 导出配置（DB-less 模式）
curl http://127.0.0.1:8001/config > kong-config-backup.json

# DB 备份
pg_dump -U kong kong > kong-db-backup.sql

# 查看日志
docker logs kong-1 -f
```

## 6. 常见故障

**插件不生效**：检查插件是否关联到 Service/Route → 检查插件 `config` → 查看 Kong 错误日志

**503 No Route**：检查 Route 配置 → 检查 Host/Path 匹配规则 → 检查 DNS 解析是否正常

**Admin API 暴露到公网**：确认 `KONG_ADMIN_LISTEN` 绑定 `127.0.0.1` 而非 `0.0.0.0`；生产环境禁止将 8001 端口暴露到外部网络

**迁移冲突**：`kong migrations bootstrap` 只执行一次；如果重复执行会报错，可用 `kong migrations up` 处理

# APISIX 部署指南

> 版本：3.9 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|---------|---------|------|
| 单机（APISIX + etcd × 1） | 2C / 2G | 4C / 4G | 20G |
| 生产集群（APISIX × 2 + etcd × 3 + Dashboard） | 4C / 8G | 8C / 16G | 50G |

## 2. 裸机安装（通用）

```bash
# etcd 3.5
wget https://github.com/etcd-io/etcd/releases/download/v3.5.14/etcd-v3.5.14-linux-amd64.tar.gz
tar xzf etcd-v3.5.14-linux-amd64.tar.gz
sudo cp etcd-v3.5.14-linux-amd64/etcd* /usr/local/bin/

# APISIX - RPM（CentOS）
sudo yum install -y https://repos.apiseven.com/packages/centos/apache-apisix-repo-1.0-1.noarch.rpm
sudo yum install -y apache-apisix-3.9.0

# APISIX - DEB（Ubuntu）
sudo apt install -y wget
wget -qO - https://repos.apiseven.com/DEB-GPG-KEY | sudo apt-key add -
echo "deb https://repos.apiseven.com/packages/deb apache-apisix main" | sudo tee /etc/apt/sources.list.d/apisix.list
sudo apt update && sudo apt install -y apache-apisix=3.9.0

# 目录
sudo mkdir -p /usr/local/apisix/conf /usr/local/apisix/logs
```

## 3. 基础部署

**适用场景**：单机开发/测试环境，APISIX + etcd 单节点

> etcd 模式与 Standalone 模式（apisix.yaml）互斥。本部署使用 etcd 模式（推荐），路由通过 Admin API / Dashboard 动态管理。

### 配置文件

```bash
cat > /usr/local/apisix/conf/config.yaml << 'EOF'
apisix:
  node_listen: 9080
  enable_admin: true
  admin_key:
    - name: admin
      key: admin-key-dev
      role: admin

etcd:
  host:
    - "http://127.0.0.1:2379"

plugins:
  - limit-count
  - limit-req
  - key-auth
  - jwt-auth
  - cors
  - prometheus
  - echo
EOF
```

### 启动

```bash
etcd --data-dir /tmp/etcd-data &
apisix start
apisix status
```

### 验证

```bash
curl http://127.0.0.1:9080/
# 预期输出：{"error_msg":"404 Route Not Found"}

curl http://127.0.0.1:9180/apisix/admin/routes \
  -H 'X-API-KEY: admin-key-dev'
# 预期输出：空路由列表
```

### Docker Compose

```yaml
services:
  etcd:
    image: bitnami/etcd:3.5
    environment:
      ALLOW_NONE_AUTHENTICATION: "yes"
      ETCD_ADVERTISE_CLIENT_URLS: http://etcd:2379

  apisix:
    image: apache/apisix:3.9.0-debian
    ports:
      - "9080:9080"
      - "9180:9180"
    volumes:
      - ./config.yaml:/usr/local/apisix/conf/config.yaml:ro
    depends_on:
      - etcd
```

## 4. 生产部署

**适用场景**：生产集群，APISIX × 2 + etcd × 3 + Dashboard

### 配置文件

```bash
cat > /usr/local/apisix/conf/config.yaml << 'EOF'
apisix:
  node_listen: 9080
  enable_admin: true
  admin_key:
    - name: admin
      key: "ProdAPISIX!AdminKey2024Secure"
      role: admin
  worker_processes: auto
  client_max_body_size: 20m

etcd:
  host:
    - "http://etcd-1:2379"
    - "http://etcd-2:2379"
    - "http://etcd-3:2379"
  prefix: "/apisix"

plugins:
  - limit-count
  - limit-req
  - key-auth
  - jwt-auth
  - basic-auth
  - consumer-restriction
  - ip-restriction
  - cors
  - proxy-rewrite
  - request-id
  - zipkin
  - prometheus
  - grpc-transcode
  - response-rewrite
  - fault-injection

stream_plugins:
  - ip-restriction
  - limit-conn
EOF
```

```bash
cat > /usr/local/apisix-dashboard/conf/conf.yaml << 'EOF'
conf:
  listen:
    host: 0.0.0.0
    port: 9000
  etcd:
    endpoints:
      - "http://etcd-1:2379"
      - "http://etcd-2:2379"
      - "http://etcd-3:2379"
    prefix: "/apisix"
authentication:
  secret: "DashboardSecret2024!"
  expire_time: 3600
  users:
    - username: admin
      password: Dashboard!Pass
EOF
```

### 启动

```bash
# etcd 集群（每台节点）
etcd --name etcd-1 \
  --initial-advertise-peer-urls http://etcd-1:2380 \
  --listen-peer-urls http://0.0.0.0:2380 \
  --advertise-client-urls http://etcd-1:2379 \
  --listen-client-urls http://0.0.0.0:2379 \
  --initial-cluster etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380,etcd-3=http://etcd-3:2380 \
  --initial-cluster-state new &

# APISIX（每台节点）
apisix start

# Dashboard
./manager-api -p /usr/local/apisix-dashboard/conf/conf.yaml &
```

### 验证

```bash
# Admin API
curl http://apisix-1:9180/apisix/admin/routes \
  -H 'X-API-KEY: ProdAPISIX!AdminKey2024Secure'

# Dashboard
curl http://dashboard:9000

# 创建路由测试
curl http://apisix-1:9180/apisix/admin/routes/1 \
  -H 'X-API-KEY: ProdAPISIX!AdminKey2024Secure' \
  -X PUT -d '{"uri":"/hello","upstream":{"nodes":{"127.0.0.1:8080":1},"type":"roundrobin"}}'

curl http://apisix-1:9080/hello
```

### Docker Compose

```yaml
services:
  etcd-1:
    image: bitnami/etcd:3.5
    hostname: etcd-1
    environment:
      ALLOW_NONE_AUTHENTICATION: "yes"
      ETCD_NAME: etcd-1
      ETCD_INITIAL_ADVERTISE_PEER_URLS: http://etcd-1:2380
      ETCD_ADVERTISE_CLIENT_URLS: http://etcd-1:2379
      ETCD_INITIAL_CLUSTER: etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380,etcd-3=http://etcd-3:2380
      ETCD_INITIAL_CLUSTER_STATE: new
    volumes:
      - etcd-1-data:/bitnami/etcd

  etcd-2:
    image: bitnami/etcd:3.5
    hostname: etcd-2
    environment:
      ALLOW_NONE_AUTHENTICATION: "yes"
      ETCD_NAME: etcd-2
      ETCD_INITIAL_ADVERTISE_PEER_URLS: http://etcd-2:2380
      ETCD_ADVERTISE_CLIENT_URLS: http://etcd-2:2379
      ETCD_INITIAL_CLUSTER: etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380,etcd-3=http://etcd-3:2380
      ETCD_INITIAL_CLUSTER_STATE: new
    volumes:
      - etcd-2-data:/bitnami/etcd

  etcd-3:
    image: bitnami/etcd:3.5
    hostname: etcd-3
    environment:
      ALLOW_NONE_AUTHENTICATION: "yes"
      ETCD_NAME: etcd-3
      ETCD_INITIAL_ADVERTISE_PEER_URLS: http://etcd-3:2380
      ETCD_ADVERTISE_CLIENT_URLS: http://etcd-3:2379
      ETCD_INITIAL_CLUSTER: etcd-1=http://etcd-1:2380,etcd-2=http://etcd-2:2380,etcd-3=http://etcd-3:2380
      ETCD_INITIAL_CLUSTER_STATE: new
    volumes:
      - etcd-3-data:/bitnami/etcd

  apisix-1:
    image: apache/apisix:3.9.0-debian
    ports:
      - "9080:9080"
      - "9180:9180"
    volumes:
      - ./config.yaml:/usr/local/apisix/conf/config.yaml:ro
    depends_on:
      - etcd-1
      - etcd-2
      - etcd-3

  apisix-2:
    image: apache/apisix:3.9.0-debian
    ports:
      - "9081:9080"
      - "9181:9180"
    volumes:
      - ./config.yaml:/usr/local/apisix/conf/config.yaml:ro
    depends_on:
      - etcd-1
      - etcd-2
      - etcd-3

  dashboard:
    image: apache/apisix-dashboard:3.0.1-alpine
    ports:
      - "9000:9000"
    volumes:
      - ./dashboard.yaml:/usr/local/apisix-dashboard/conf/conf.yaml:ro
    depends_on:
      - etcd-1
      - etcd-2
      - etcd-3

volumes:
  etcd-1-data:
  etcd-2-data:
  etcd-3-data:
```

## 5. 运维速查

### Admin API

```bash
# 创建路由
curl http://apisix:9180/apisix/admin/routes/1 \
  -H 'X-API-KEY: ProdAPISIX!AdminKey2024Secure' \
  -X PUT -d '{"uri":"/api/*","upstream":{"type":"roundrobin","nodes":{"app-1:8080":1,"app-2:8080":1}},"plugins":{"limit-count":{"count":100,"time_window":1,"rejected_code":429},"key-auth":{}}}'

# 查看路由
curl http://apisix:9180/apisix/admin/routes \
  -H 'X-API-KEY: ProdAPISIX!AdminKey2024Secure'

# 创建上游
curl http://apisix:9180/apisix/admin/upstreams/1 \
  -H 'X-API-KEY: ProdAPISIX!AdminKey2024Secure' \
  -X PUT -d '{"type":"roundrobin","nodes":{"app-1:8080":1,"app-2:8080":1},"retries":3,"timeout":{"connect":5,"send":5,"read":60}}'

# 查看已启用插件
curl http://apisix:9180/apisix/admin/plugins/list \
  -H 'X-API-KEY: ProdAPISIX!AdminKey2024Secure'
```

### 监控

| 指标 | 端点 | 告警阈值 |
|------|------|----------|
| 请求速率 | /apisix/prometheus/metrics | 异常增长 |
| 5xx 比例 | /apisix/prometheus/metrics | > 1% |
| P99 延迟 | /apisix/prometheus/metrics | > 500ms |
| etcd Leader | /etcd/metrics | 无 Leader |

### 备份

```bash
etcdctl snapshot save /backup/etcd-snapshot-$(date +%Y%m%d).db
etcdctl snapshot restore /backup/etcd-snapshot.db
```

## 6. 常见故障

| 故障 | 原因 | 解决 |
|------|------|------|
| 路由不生效 | etcd 配置未同步 | 检查 Admin API 响应；检查 etcd 数据；查看 error.log |
| 503 Service Unavailable | 上游不可达 | 检查上游节点存活；检查超时设置；检查健康检查配置 |
| Dashboard 无法登录 | etcd 连接失败 | 检查 dashboard.yaml 中 etcd.endpoints 是否正确 |

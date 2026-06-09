# Mimir 部署指南

> 版本：2.12.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| 对象存储 | S3 / MinIO | 长期存储（必需） |
| Memcached | 1.6+ | 前置缓存（生产推荐） |
| Prometheus | 2.45+ | 指标采集，remote_write 到 Mimir |

## 2. 裸机安装（通用）

```bash
# 下载二进制
wget https://github.com/grafana/mimir/releases/download/2.12.0/mimir_2.12.0_Linux_x86_64.tar.gz
tar -xzf mimir_2.12.0_Linux_x86_64.tar.gz
sudo mv mimir /usr/local/bin/

# 创建数据目录
sudo mkdir -p /data/mimir/{tsdb,tsdb-sync,compactor,rules,alertmanager}
```

## 3. 单机部署（Monolithic Mode）

### 适用场景

开发测试、小规模指标存储（< 5 万样本/秒）

### 配置

```bash
cat > /etc/mimir.yaml << 'EOF'
target: all                    # 单进程模式，运行所有组件

multitenancy_enabled: false

blocks_storage:
  backend: filesystem
  bucket_store:
    sync_dir: /data/tsdb-sync
  tsdb:
    dir: /data/tsdb

activity_tracker:
  filepath: /data/activity.log

alertmanager:
  data_dir: /data/alertmanager

ruler:
  rule_path: /data/rules
  alertmanager_url: http://localhost:9009
EOF
```

### 启动

```bash
mimir -config.file=/etc/mimir.yaml
```

### 验证

```bash
# 健康检查
curl http://localhost:9009/ready

# PromQL 查询（无多租户不需要 Header）
curl 'http://localhost:9009/prometheus/api/v1/query?query=up'
```

### Docker Compose

```yaml
services:
  mimir:
    image: grafana/mimir:2.12.0
    ports: ["9009:9009"]
    volumes: ["./conf/mimir.yaml:/etc/mimir/mimir.yaml", "mimir-data:/data"]
    command: [-config.file=/etc/mimir/mimir.yaml, -target=all]

  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: mimir
      MINIO_ROOT_PASSWORD: MimirMinIO!Pass
    command: server /data
    volumes: ["minio-data:/data"]

volumes: {mimir-data:, minio-data:}
```

## 4. 集群部署（微服务模式）

### 适用场景

生产环境，大规模指标（5 万+ 样本/秒，多租户）

### 节点规划

| 组件 | 实例数 | 说明 |
|------|--------|------|
| Distributor | 2 | 接收写入，验证数据 |
| Ingester | 2 | 内存中汇聚 Block，上传 S3 |
| Querier | 2 | PromQL 查询 |
| Store Gateway | 2 | 对象存储查询加速 |
| Compactor | 1 | Block 合并 + 过期删除 |
| Ruler | 1 | 告警规则评估 |
| Alertmanager | 1 | 告警管理 |

### 前置缓存依赖

```
Memcached （索引缓存 + Chunk 缓存） → 减少对象存储读取，加速查询
```

### 配置

```yaml
# mimir.yaml — 微服务模式
multitenancy_enabled: true

blocks_storage:
  backend: s3
  s3:
    endpoint: minio:9000
    bucket_name: mimir-blocks
    access_key_id: mimir
    secret_access_key: MimirMinIO!Pass
    insecure: true
  bucket_store:
    sync_dir: /data/tsdb-sync
    index_cache:
      backend: memcached
      memcached:
        addresses: dns+memcached:11211
    chunks_cache:
      backend: memcached
      memcached:
        addresses: dns+memcached:11211
  tsdb:
    dir: /data/tsdb
    ship_interval: 5m

limits:
  ingestion_rate: 100000
  ingestion_burst_size: 200000
  max_query_length: 8760h
  retention_period: 730d

compactor:
  data_dir: /data/compactor
  compaction_interval: 15m
  retention_enabled: true

store_gateway:
  sharding_enabled: true

distributor:
  ring:
    kvstore:
      store: memberlist

ingester:
  ring:
    kvstore:
      store: memberlist

ruler:
  rule_path: /data/rules
  alertmanager_url: http://alertmanager:9009
  evaluation_interval: 15s

alertmanager:
  data_dir: /data/alertmanager
  external_url: https://alertmanager.example.com
```

### Prometheus 远程写入配置

```yaml
# prometheus.yml 追加
remote_write:
  - url: http://<mimir-distributor>:9009/api/v1/push
    # 多租户时添加 Header
    # headers:
    #   X-Scope-OrgID: tenant-1
```

### 启动

```bash
# 每个组件指定 target
mimir -config.file=/etc/mimir.yaml -target=distributor
mimir -config.file=/etc/mimir.yaml -target=ingester
mimir -config.file=/etc/mimir.yaml -target=querier
mimir -config.file=/etc/mimir.yaml -target=store-gateway
mimir -config.file=/etc/mimir.yaml -target=compactor
mimir -config.file=/etc/mimir.yaml -target=ruler
mimir -config.file=/etc/mimir.yaml -target=alertmanager
```

### 验证

```bash
# 查询（多租户需加 Header）
curl -H "X-Scope-OrgID: tenant-1" 'http://<querier>:9009/prometheus/api/v1/query?query=up'

# 查看租户
curl http://localhost:9009/api/v1/tenant

# 查看限制
curl -H "X-Scope-OrgID: tenant-1" http://localhost:9009/api/v1/limits
```

### Docker Compose

```yaml
services:
  memcached:
    image: memcached:1.6
    command: ["-m", "1024"]

  mimir-distributor:
    image: grafana/mimir:2.12.0
    ports: ["9009:9009"]
    volumes: ["./conf/mimir.yaml:/etc/mimir/mimir.yaml"]
    command: [-config.file=/etc/mimir/mimir.yaml, -target=distributor]
    depends_on: [memcached, minio]

  mimir-ingester:
    image: grafana/mimir:2.12.0
    volumes: ["./conf/mimir.yaml:/etc/mimir/mimir.yaml", "mimir-ingester-data:/data"]
    command: [-config.file=/etc/mimir/mimir.yaml, -target=ingester]
    depends_on: [memcached, minio]

  mimir-querier:
    image: grafana/mimir:2.12.0
    ports: ["9010:9009"]
    volumes: ["./conf/mimir.yaml:/etc/mimir/mimir.yaml"]
    command: [-config.file=/etc/mimir/mimir.yaml, -target=querier]
    depends_on: [memcached, minio]

  mimir-store-gateway:
    image: grafana/mimir:2.12.0
    volumes: ["./conf/mimir.yaml:/etc/mimir/mimir.yaml"]
    command: [-config.file=/etc/mimir/mimir.yaml, -target=store-gateway]
    depends_on: [memcached, minio]

  mimir-compactor:
    image: grafana/mimir:2.12.0
    volumes: ["./conf/mimir.yaml:/etc/mimir/mimir.yaml", "mimir-compactor-data:/data"]
    command: [-config.file=/etc/mimir/mimir.yaml, -target=compactor]
    depends_on: [memcached, minio]

  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: mimir
      MINIO_ROOT_PASSWORD: MimirMinIO!Pass
    command: server /data
    volumes: ["minio-data:/data"]

volumes:
  mimir-ingester-data:
  mimir-compactor-data:
  minio-data:
```

## 5. 运维速查

```bash
# 查看 Ingester Ring 状态
curl http://localhost:9009/ingester/ring

# 查看 Store Gateway 缓存状态
curl http://localhost:9009/store-gateway/tenants

# 手动压缩（Compactor）
curl -X POST http://localhost:9009/compactor/trigger

# 调整租户写入限制（运行时）
curl -X POST -H "X-Scope-OrgID: tenant-1" \
  -d 'ingestion_rate=50000' \
  http://localhost:9009/api/v1/limits/override
```

## 6. 常见故障

**故障 1：写入限流**

- 检查 `limits.ingestion_rate` 是否过低
- 增大限制或减少 Prometheus Target 数
- 扩容 Distributor + Ingester

**故障 2：查询慢 / 超时**

- 检查 Memcached 命中率（`store_gateway` 指标）
- 索引缓存未命中时直接查询对象存储，延迟高
- 缩小查询时间范围

**故障 3：Memcached 连接失败**

- 检查 Memcached 服务是否正常
- 检查 `dns+memcached:11211` 地址解析是否正确
- Memcached 必须作为前置依赖先启动

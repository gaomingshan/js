# Mimir 部署运维指南

> **定位**：Grafana Labs 开源的 Prometheus 长期存储后端，TSDB 兼容
> **适用场景**：Prometheus 长期存储、多租户指标、全局视图
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

Grafana Mimir 是开源的 Prometheus 长期存储后端，100% 兼容 PromQL，支持多租户、水平扩展、对象存储，解决 Prometheus 单机存储和保留时间限制。

### 1.2 与 Thanos 对比

| 维度 | Mimir | Thanos |
|------|-------|--------|
| **架构** | 微服务/单进程 | Sidecar + 组件 |
| **多租户** | 原生支持 | 需额外配置 |
| **写入路径** | Push-based | Pull-based |
| **对象存储** | 必须 | 可选 |
| **部署复杂度** | 中 | 高 |

### 1.3 核心架构

```
Prometheus → remote_write → Mimir (Distributor/Ingester/Querier) → Grafana
                                    ↓
                              Storage (S3/MinIO)
```

---

## 2. 部署

### 2.1 Docker Compose 部署（单进程模式）

```yaml
# docker-compose.yml
version: '3.8'

services:
  mimir:
    image: grafana/mimir:2.12.0
    container_name: mimir
    restart: unless-stopped
    ports:
      - "9009:9009"     # HTTP API
      - "9095:9095"     # gRPC
    volumes:
      - ./conf/mimir.yaml:/etc/mimir/mimir.yaml
      - mimir-data:/data
    command: -config.file=/etc/mimir/mimir.yaml -target=all
    networks:
      - mimir-net

  minio:
    image: minio/minio
    container_name: mimir-minio
    restart: unless-stopped
    ports:
      - "9000:9000"
    environment:
      MINIO_ROOT_USER: mimir
      MINIO_ROOT_PASSWORD: MimirMinIO!Pass
    volumes:
      - minio-data:/data
    command: server /data
    networks:
      - mimir-net

volumes:
  mimir-data:
  minio-data:

networks:
  mimir-net:
    driver: bridge
```

---

## 3. 配置文件

### 3.2 开发环境配置

```yaml
# mimir.yaml — 开发环境（单进程模式）
target: all

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
```

### 3.3 生产环境配置

```yaml
# mimir.yaml — 生产环境

multitenancy_enabled: true
# 逻辑：多租户通过 X-Scope-OrgID Header 区分

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
    # 逻辑：索引缓存用 Memcached，加速查询
    chunks_cache:
      backend: memcached
      memcached:
        addresses: dns+memcached:11211
  tsdb:
    dir: /data/tsdb
    ship_interval: 5m
    # 逻辑：TSDB block 每 5 分钟上传到对象存储

limits:
  ingestion_rate: 100000           # 每租户每秒 10 万样本
  ingestion_burst_size: 200000
  max_query_length: 8760h          # 最大查询 1 年
  max_total_query_length: 8760h
  retention_period: 730d           # 保留 2 年
  # 逻辑：Mimir 的核心价值 = 长期存储
  # Prometheus 本地只能存 30 天，Mimir 可存数年

compactor:
  data_dir: /data/compactor
  compaction_interval: 15m
  retention_enabled: true
  # 逻辑：compactor 合并小 block + 执行保留策略

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
  alertmanager_url: http://localhost:9009
  evaluation_interval: 15s

alertmanager:
  data_dir: /data/alertmanager
  external_url: https://alertmanager.example.com
```

**Prometheus 远程写入配置**：

```yaml
# prometheus.yml 追加
remote_write:
  - url: http://mimir:9009/api/v1/push
    # 多租户时添加 Header
    # headers:
    #   X-Scope-OrgID: tenant-1
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `retention_period` | 数据保留 | 730d | Mimir 核心价值，长期存储 |
| `ingestion_rate` | 写入速率 | 10 万样本/s | 每租户限制 |
| 索引缓存 | Memcached | 独立部署 | 加速查询，减少对象存储读取 |
| `ship_interval` | Block 上传间隔 | 5m | 越短数据越安全但 IO 越大 |

### 4.2 容量规划

| 规模 | 样本/秒 | CPU | 内存 | 存储 | 节点 |
|------|---------|-----|------|------|------|
| 小型 | < 5 万 | 4 核 | 8G | MinIO 500G | 1 |
| 中型 | 5-50 万 | 8 核 | 16G | MinIO 2T | 3 |
| 大型 | 50 万+ | 16 核 | 32G | S3 无限 | 5+ |

---

## 5. 运维

```bash
# 查看租户
curl http://mimir:9009/api/v1/tenant

# 查看限制
curl -H "X-Scope-OrgID: tenant-1" http://mimir:9009/api/v1/limits

# PromQL 查询（兼容 Prometheus）
curl -H "X-Scope-OrgID: tenant-1" \
  'http://mimir:9009/prometheus/api/v1/query?query=up'
```

---

## 6. 故障排查

#### 故障 1：写入限流

**排查**：检查 `limits.ingestion_rate` → 增大限制 → 减少 Target 数

#### 故障 2：查询慢

**排查**：检查 Memcached 命中率 → 增大缓存 → 缩小查询范围

---

## 7. 参考资料

- [Mimir Documentation](https://grafana.com/docs/mimir/latest/)
- [Mimir Configuration](https://grafana.com/docs/mimir/latest/configure/)
- [Mimir Architecture](https://grafana.com/docs/mimir/latest/architecture/)

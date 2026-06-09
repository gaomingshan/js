# Loki 部署运维指南

> **定位**：Grafana Labs 开源的日志聚合系统，Prometheus 风格
> **适用场景**：日志采集与查询、K8s 日志、应用日志聚合
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Loki 是 Grafana Labs 开源的日志聚合系统，灵感来自 Prometheus，**只索引标签不索引日志内容**，存储成本极低，配合 Grafana Explore 和 LogQL 查询。

### 1.2 与 ELK 对比

| 维度 | Loki | Elasticsearch |
|------|------|---------------|
| **索引** | 仅标签 | 全文倒排索引 |
| **存储成本** | 低（1/10） | 高 |
| **查询** | LogQL（标签过滤+正则） | Lucene（全文搜索） |
| **适用** | 标签过滤查询 | 全文搜索 |
| **部署** | 简单 | 复杂 |

### 1.3 核心架构

```
Alloy/Promtail → Loki (Distributor/Ingester/Querier) → Grafana
                        ↓
                  Storage (S3/MinIO/本地)
```

| 组件 | 职责 |
|------|------|
| **Distributor** | 接收日志写入，校验标签 |
| **Ingester** | 写入日志到存储 |
| **Querier** | 查询日志 |
| **Alloy/Promtail** | 日志采集 Agent |
| **Ruler** | 日志告警规则 |

---

## 2. 部署

### 2.1 Docker Compose 部署（Loki + Alloy + Grafana）

```yaml
# docker-compose.yml
version: '3.8'

services:
  loki:
    image: grafana/loki:3.1.0
    container_name: loki
    restart: unless-stopped
    ports:
      - "3100:3100"
    volumes:
      - ./conf/loki.yaml:/etc/loki/config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/config.yaml
    networks:
      - loki-net

  alloy:
    image: grafana/alloy:v1.3.0
    container_name: alloy
    restart: unless-stopped
    volumes:
      - ./conf/alloy.alloy:/etc/alloy/config.alloy
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: run /etc/alloy/config.alloy
    depends_on:
      - loki
    networks:
      - loki-net

  grafana:
    image: grafana/grafana:11.2.0
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: Grafana!Pass
    depends_on:
      - loki
    networks:
      - loki-net

volumes:
  loki-data:

networks:
  loki-net:
    driver: bridge
```

---

## 3. 配置文件

### 3.2 开发环境配置

```yaml
# loki.yaml — 开发环境（单机模式）
auth_enabled: false
server:
  http_listen_port: 3100
common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: loki_index_
        period: 24h
storage_config:
  filesystem:
    directory: /loki/storage
```

### 3.3 生产环境配置

```yaml
# loki.yaml — 生产环境

auth_enabled: true
server:
  http_listen_port: 3100
  log_level: warn

common:
  path_prefix: /loki
  replication_factor: 1  # 单实例模式应设为 1，分布式模式才设为 3

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb                   # 3.x TSDB 索引
      object_store: s3             # 对象存储（MinIO/S3）
      schema: v13
      index:
        prefix: loki_index_
        period: 24h

storage_config:
  tsdb_shipper:
    active_index_directory: /loki/tsdb-index
    cache_location: /loki/tsdb-cache
  # 对象存储
  aws:
    s3: s3://access_key:secret_key@minio:9000/loki
    region: us-east-1
  # 逻辑：日志数据存对象存储，成本远低于本地磁盘
  # TSDB 索引存本地 + 缓存

ingester:
  max_chunk_age: 2h               # 日志 chunk 最大 2 小时
  chunk_idle_period: 30m          # 空闲 30 分钟刷写
  chunk_target_size: 1572864      # 目标 chunk 1.5MB
  # 逻辑：chunk 越大压缩比越好但延迟越高

limits_config:
  ingestion_rate_mb: 20           # 每租户每秒写入 20MB
  ingestion_burst_size_mb: 30
  max_query_length: 721h          # 最大查询范围 30 天
  max_query_parallelism: 32
  max_entries_limit_per_query: 10000
  retention_period: 744h          # 保留 31 天
  # 逻辑：retention_period 控制日志保留时间
  # 对象存储上的日志超过此时间自动删除

compactor:
  working_directory: /loki/compactor
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
  delete_request_cancel_period: 5m
  # 逻辑：compactor 负责合并 chunk 和执行保留策略

ruler:
  storage:
    type: local
    local:
      directory: /loki/rules
  rule_path: /loki/ruler
  alertmanager_url: http://alertmanager:9093
```

**Alloy 采集配置** `alloy.alloy`：

```hcl
loki.source.file "logs" {
  targets = [
    {__path__ = "/var/log/app/*.log"},
  ]
  forward_to = [loki.write.default.receiver]
}

loki.write "default" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `ingestion_rate_mb` | 写入速率限制 | 20MB/s | 防止日志风暴压垮集群 |
| `max_chunk_age` | Chunk 最大年龄 | 2h | 越大压缩比越好但查询延迟越高 |
| `retention_period` | 日志保留 | 31d | 按合规要求设置 |
| 对象存储 | 日志存储后端 | S3/MinIO | 比本地磁盘成本低 10 倍 |

### 4.2 容量规划

| 规模 | 日志量/天 | CPU | 内存 | 存储 |
|------|----------|-----|------|------|
| 小型 | < 50GB | 4 核 | 8G | 200G SSD |
| 中型 | 50-500GB | 8 核 | 16G | MinIO 2T |
| 大型 | 500GB+ | 16 核 | 32G | S3 无限 |

---

## 5. 运维

```bash
# LogQL 查询
# 标签过滤
{app="order-service"} |= "error" | json | line_format "{{.message}}"

# 统计
sum(count_over_time({app="order-service"} |= "error" [5m]))

# 告警规则
groups:
  - name: logs
    rules:
      - alert: HighErrorRate
        expr: sum(count_over_time({app="order-service"} |= "error" [5m])) > 100
        for: 5m
```

---

## 6. 故障排查

#### 故障 1：写入限流

**排查**：检查 `limits_config.ingestion_rate_mb` → 增大限制 → 优化日志量

#### 故障 2：查询慢

**排查**：缩小时间范围 → 增加标签过滤 → 使用 `|= ` 过滤而非 `|~` 正则

---

## 7. 参考资料

- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [LogQL](https://grafana.com/docs/loki/latest/query/)
- [Alloy](https://grafana.com/docs/alloy/latest/)

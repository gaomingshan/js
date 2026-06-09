# Tempo 部署运维指南

> **定位**：Grafana Labs 开源的分布式链路追踪后端
> **适用场景**：分布式链路追踪、Trace 查询、与 Loki/Tempo 联动
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Tempo 是 Grafana Labs 开源的高性能分布式链路追踪后端，支持 Jaeger/OpenTelemetry/Zipkin 协议，**不索引 Trace 内容**（与 Loki 理念一致），存储成本极低。

### 1.2 核心架构

```
OTel Collector → Tempo (Distributor/Ingester/Querier) → Grafana
                         ↓
                   Storage (S3/MinIO/本地)
```

### 1.3 适用场景

**最佳适用**：分布式链路追踪、Trace 查询、与 Loki/Mimir 联动（Exemplar）

**不适用**：需要 Trace 索引搜索（→ Jaeger + ES）、实时拓扑图（→ Jaeger UI）

---

## 2. 部署

### 2.1 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  tempo:
    image: grafana/tempo:2.5.0
    container_name: tempo
    restart: unless-stopped
    ports:
      - "3200:3200"     # HTTP API
      - "4317:4317"     # OTLP gRPC
      - "4318:4318"     # OTLP HTTP
      - "9411:9411"     # Zipkin
    volumes:
      - ./conf/tempo.yaml:/etc/tempo/config.yaml
      - tempo-data:/var/tempo
    command: -config.file=/etc/tempo/config.yaml
    networks:
      - tempo-net

  grafana:
    image: grafana/grafana:11.2.0
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: Grafana!Pass
    depends_on:
      - tempo
    networks:
      - tempo-net

volumes:
  tempo-data:

networks:
  tempo-net:
    driver: bridge
```

---

## 3. 配置文件

### 3.2 开发环境配置

```yaml
# tempo.yaml — 开发环境
server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: "0.0.0.0:4317"
        http:
          endpoint: "0.0.0.0:4318"

storage:
  trace:
    backend: local
    local:
      path: /var/tempo/traces
    wal:
      path: /var/tempo/wal

metrics_generator:
  registry:
    external_labels:
      source: tempo
  storage:
    path: /var/tempo/generator/wal
    remote_write:
      - url: http://prometheus:9090/api/v1/write
```

### 3.3 生产环境配置

```yaml
# tempo.yaml — 生产环境

server:
  http_listen_port: 3200
  log_level: warn

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: "0.0.0.0:4317"
          max_recv_msg_size_mib: 16
        http:
          endpoint: "0.0.0.0:4318"

ingester:
  max_block_duration: 30m          # 30 分钟切 block
  # 逻辑：block 越大压缩比越好但查询延迟越高

storage:
  trace:
    backend: s3
    s3:
      endpoint: minio:9000
      bucket: tempo-traces
      access_key: minioadmin
      secret_key: minioadmin
    wal:
      path: /var/tempo/wal
    local:
      path: /var/tempo/blocks
    # 逻辑：Trace 数据存对象存储，成本极低
    # WAL 和 Block 缓存存本地

compactor:
  compaction:
    block_retention: 720h          # 保留 30 天
    # 逻辑：Trace 保留 30 天，超过自动删除

metrics_generator:
  registry:
    external_labels:
      source: tempo
      cluster: prod
  storage:
    path: /var/tempo/generator/wal
    remote_write:
      - url: http://mimir:9009/api/v1/push
  # 逻辑：Metrics Generator 从 Trace 生成 RED 指标
  # 写入 Mimir/Prometheus，实现 Trace → Metrics 联动

querier:
  frontend_worker:
    # 单二进制模式下此项可注释掉/不需要
    frontend_address: tempo:9095
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `max_block_duration` | Block 切分间隔 | 30m | 越大压缩比越好但延迟越高 |
| `block_retention` | Trace 保留 | 30d | 按合规要求 |
| `max_recv_msg_size_mib` | 最大接收消息 | 16MB | 大 Trace 需增大 |

### 4.2 容量规划

| 规模 | Trace/天 | CPU | 内存 | 存储 |
|------|----------|-----|------|------|
| 小型 | < 1M | 4 核 | 8G | 100G SSD |
| 中型 | 1-10M | 8 核 | 16G | MinIO 500G |
| 大型 | 10M+ | 16 核 | 32G | S3 无限 |

---

## 5. 运维

```bash
# Trace 查询（通过 Grafana Explore）
# Search by Trace ID: TraceID=<trace-id>

# TraceQL 查询
{resource.service.name="order-service" && span.http.status_code=500}

# 与 Loki 联动
# Loki 日志中提取 trace_id → Tempo 查询 Trace
```

---

## 6. 故障排查

#### 故障 1：Trace 丢失

**排查**：检查采样率 → 检查 OTel Collector 配置 → 检查 Tempo 写入限流

#### 故障 2：查询慢

**排查**：缩小时间范围 → 使用 TraceID 直接查询 → 检查存储 IO

---

## 7. 参考资料

- [Tempo Documentation](https://grafana.com/docs/tempo/latest/)
- [TraceQL](https://grafana.com/docs/tempo/latest/traceql/)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)

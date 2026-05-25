# 第 34 章：分布式链路追踪 - Grafana Tempo

> **学习目标**：掌握 Tempo 完整部署与配置、理解 Tempo 低成本存储原理、能够使用 TraceQL 进行链路检索、能够分析服务拓扑与定位慢调用
> **预计时长**：4-5 小时
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. Tempo 架构设计

### 1.1 Grafana Tempo 简介

**Grafana Tempo**：Grafana Labs 开源的分布式链路追踪后端，专为低成本、对象存储和大规模场景设计。

**核心设计理念**：
- ✅ **无需索引**：Trace 数据以 Trace ID 为键直接写入对象存储
- ✅ **对象存储优先**：原生支持 S3/MinIO/GCS/Azure Blob，成本极低
- ✅ **OTLP 原生**：通过 OTel Collector 接收 OTLP 数据
- ✅ **与 Grafana 深度集成**：在 Grafana 中直接检索 Trace、查看瀑布图
- ✅ **TraceQL**：类 PromQL 的 Trace 查询语言
- ✅ **水平扩展**：组件无状态或使用对象存储，可无限水平扩展

### 1.2 架构组件

```
OTel Collector（数据管道）
        │ OTLP gRPC (4317)
        ↓
┌─────────────────────────────────┐
│         Grafana Tempo            │
│                                  │
│  Distributor（分发层）           │
│    ├─ 接收 Span 数据             │
│    ├─ 按 Trace ID 哈希路由       │
│    └─ 写入 Ingester             │
│  Ingester（写入层）              │
│    ├─ 构建 Trace（聚合 Span）    │
│    ├─ 刷写 Block 到对象存储      │
│    └─ 内存缓冲最新数据           │
│  Compactor（压缩层）             │
│    ├─ 合并小 Block 为大 Block    │
│    ├─ 后台去重与压缩             │
│    └─ 提升查询效率               │
│  Querier（查询层）               │
│    ├─ 接收 Grafana 查询请求      │
│    ├─ 搜索 Ingester + 对象存储   │
│    └─ 合并返回完整 Trace         │
│  Query Frontend（查询前端）      │
│    ├─ 查询分片与负载均衡         │
│    └─ 缓存与限流                 │
└─────────────────────────────────┘
        │ 读写
        ↓
    对象存储（S3 / MinIO / GCS / Azure Blob）
```

### 1.3 三种部署模式

| 模式 | 适用场景 | 说明 |
|------|---------|------|
| **单机模式（Monolithic）** | 开发/测试 | 所有组件打包在一个进程中 |
| **微服务模式（Scalable Monolithic）** | 生产（中等规模） | 按组件分离部署，可独立扩缩 |
| **分布式模式（Microservices）** | 大规模生产 | 每个组件独立部署，K8s StatefulSet |

---

## 2. Tempo 服务端部署

### 2.1 单机模式部署（快速体验）

**tempo.yaml**：

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317
        http:
          endpoint: 0.0.0.0:4318

ingester:
  max_block_duration: 30m
  trace_idle_period: 10s
  flush_all_on_shutdown: true

compactor:
  compaction:
    block_retention: 48h

storage:
  trace:
    backend: local
    local:
      path: /tmp/tempo/traces

querier:
  frontend_worker:
    frontend_address: 0.0.0.0:9095

query_frontend:
  max_outstanding_per_tenant: 100
```

**Docker 启动**：

```bash
docker run -d --name tempo \
  -p 3200:3200 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v $(pwd)/tempo.yaml:/etc/tempo.yaml \
  grafana/tempo:latest \
  -config.file=/etc/tempo.yaml
```

### 2.2 生产部署（对象存储 + 微服务模式）

**tempo-prod.yaml**：

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317
        http:
          endpoint: 0.0.0.0:4318

  # 可选：使用 Kafka 作为写入缓冲
  # kafka:
  #   topic: tempo-spans
  #   brokers: [kafka:9092]

ingester:
  lifecycler:
    ring:
      kvstore:
        store: consul
      replication_factor: 3
  max_block_duration: 1h
  max_block_bytes: 1_000_000_000  # 1GB

compactor:
  compaction:
    block_retention: 720h  # 30天
    compacted_block_retention: 1h

# 对象存储配置（以 MinIO 为例）
storage:
  trace:
    backend: s3
    s3:
      endpoint: minio:9000
      bucket: tempo-traces
      access_key: ${MINIO_ACCESS_KEY}
      secret_key: ${MINIO_SECRET_KEY}
      insecure: true
    pool:
      max_workers: 400
      queue_depth: 2000

# 覆盖写配置
overrides:
  max_bytes_per_trace: 50_000_000  # 单条 Trace 最大 50MB
  max_search_bytes_per_trace: 10_000_000
```

### 2.3 Docker Compose 完整部署

```yaml
version: '3'
services:
  tempo:
    image: grafana/tempo:latest
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
    ports:
      - "3200:3200"   # Tempo API
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
    command: ["-config.file=/etc/tempo.yaml"]
    depends_on:
      - minio

  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: tempo
      MINIO_ROOT_PASSWORD: tempo123
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data

  # Tempo 查询（可选，Grafana 已内置）
  tempo-query:
    image: grafana/tempo-query:latest
    ports:
      - "16686:16686"
    command: ["--grpc-storage-plugin.configuration-file=/etc/tempo-query.yaml"]
    volumes:
      - ./tempo-query.yaml:/etc/tempo-query.yaml

volumes:
  minio-data:
```

---

## 3. OTel Collector → Tempo 链路数据管道

### 3.1 端到端数据流

```
Spring Boot App
    │ OTel Java Agent
    │ OTLP gRPC (4317)
    ↓
OTel Collector
    │ 批处理 + 尾部采样
    │ OTLP gRPC (4317)
    ↓
Grafana Tempo
    │ Distributor → Ingester
    │ Block 刷写
    ↓
对象存储（MinIO / S3）
    │ Query
    ↓
Grafana
    │ Explorer / Dashboard
    ↓
用户
```

### 3.2 Collector Tempo 导出器配置

```yaml
exporters:
  otlp/tempo:
    endpoint: tempo:4317
    tls:
      insecure: true
    sending_queue:
      enabled: true
      num_consumers: 10
      queue_size: 5000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, tail_sampling]
      exporters: [otlp/tempo]
```

### 3.3 验证数据管道

```bash
# 1. 检查 Collector 是否连接到 Tempo
curl http://tempo:3200/ready

# 2. 查看 Tempo 是否正在接收数据
curl http://tempo:3200/metrics | grep tempo_distributor_spans_received_total

# 3. 在 Grafana Explorer 中搜索 Trace
# 打开 Grafana → Explore → 选择 Tempo 数据源 → 搜索 Trace ID
```

---

## 4. 链路追踪原理

### 4.1 Trace 与 Span 在 Tempo 中的表示

```
Trace ID: 4bf92f3577b34da6a3ce929d0e0e4736
├── Span A (order-service: GET /api/orders)
│   ├── startTime: 10:00:00.000
│   ├── duration: 1.2s
│   ├── Span B (order-service: SELECT orders)
│   │   ├── startTime: 10:00:00.100
│   │   └── duration: 800ms
│   └── Span C (user-service: GET /api/users/1)
│       ├── startTime: 10:00:00.200
│       └── duration: 300ms
```

### 4.2 Span 关键字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `traceId` | 全局唯一 Trace ID | `4bf92f3577b34da6a3ce929d0e0e4736` |
| `spanId` | Span 唯一 ID | `00f067aa0ba902b7` |
| `parentSpanId` | 父 Span ID | `a1b2c3d4e5f6a7b8` |
| `name` | 操作名称 | `GET /api/orders` |
| `startTimeUnixNano` | 开始时间（纳秒） | `1704067200000000000` |
| `endTimeUnixNano` | 结束时间（纳秒） | `1704067201200000000` |
| `attributes` | 属性键值对 | `http.status_code`: 200 |
| `status.code` | 状态码 | `0`=Unset, `1`=OK, `2`=Error |

### 4.3 Tempo 存储机制

Tempo 按 **Trace ID 哈希** 将属于同一 Trace 的所有 Span 路由到同一个 Ingester，Ingester 收集完整的 Trace 后将整个 Trace 序列化为一个 Block 写入对象存储。由于以 Trace ID 为键直接读写（key-value 模式），**无需为 Span 属性建立全文索引**，这是低成本的核心。

---

## 5. 对象存储后端配置

### 5.1 MinIO 配置（开发/自建环境）

```yaml
storage:
  trace:
    backend: s3
    s3:
      endpoint: minio:9000
      bucket: tempo-traces
      access_key: ${MINIO_ACCESS_KEY}
      secret_key: ${MINIO_SECRET_KEY}
      insecure: true
      # 使用路径风格访问（MinIO 需要）
      forcepathstyle: true
```

### 5.2 AWS S3 配置（生产环境）

```yaml
storage:
  trace:
    backend: s3
    s3:
      bucket: tempo-traces
      endpoint: s3.amazonaws.com
      # 使用 IAM Role 或环境变量认证
      region: us-east-1
```

### 5.3 GCS 配置

```yaml
storage:
  trace:
    backend: gcs
    gcs:
      bucket_name: tempo-traces
      # 使用 GOOGLE_APPLICATION_CREDENTIALS 环境变量
```

---

## 6. TraceQL 查询语言

### 6.1 TraceQL 概述

**TraceQL**：Tempo 的原生查询语言，灵感来源于 PromQL，用于从海量 Trace 数据中精确检索感兴趣的 Span。

### 6.2 基础查询

```traceql
# 查询所有调用 payment-service 的 Trace
{ .service.name = "payment-service" }

# 查询 HTTP 状态码为 500 的 Trace
{ .http.status_code = 500 }

# 查询耗时超过 2 秒的 Span
{ duration > 2s }

# 查询特定接口
{ .http.method = "POST" && .http.route = "/api/orders" }

# 查询包含错误的 Trace
{ status = error }
```

### 6.3 Pipeline 查询（Span 间关系）

```traceql
# 查询调用了 payment-service 并且内部调用了数据库的 Trace
{ .service.name = "payment-service" } >> { .db.system = "mysql" }

# 查询从 order-service 调用 user-service 且 user-service 返回错误的 Trace
{ .service.name = "order-service" } >> { .service.name = "user-service" && status = error }

# 查询 order-service 中耗时 > 500ms 的数据库调用
{ .service.name = "order-service" } >> { .db.system = "mysql" && duration > 500ms }
```

### 6.4 聚合查询

```traceql
# 统计每个服务的平均耗时
{ } | avg(duration) by(.service.name)

# 统计每分钟错误请求数
{ status = error } | rate() by(.service.name)

# 统计 P99 耗时按服务分组
{ } | quantile(duration, 0.99) by(.service.name)
```

### 6.5 Grafana 中的 TraceQL 使用

```
1. Grafana → Explore
2. 数据源选择 "Tempo"
3. Query type 选择 "TraceQL"
4. 输入查询：{ .service.name = "order-service" && status = error }
5. 时间范围：Last 30 minutes
6. 点击 "Run query"
7. 在结果列表中点击 Trace ID 查看瀑布图
```

---

## 7. Grafana 中 Trace 检索与瀑布图分析

### 7.1 配置 Grafana Tempo 数据源

**Grafana → Connections → Data sources → Add data source → Tempo**

```yaml
# 或通过 Grafana 配置文件
datasources:
  - name: Tempo
    type: tempo
    access: proxy
    url: http://tempo:3200
    jsonData:
      tracesToLogsV2:
        datasourceUid: "loki"        # 关联 Loki 日志
        spanStartTimeShift: "-1h"
        spanEndTimeShift: "1h"
        filterByTraceID: true
        filterBySpanID: true
        tags: [{ key: "service.name", value: "service_name" }]
      tracesToMetrics:
        datasourceUid: "prometheus"  # 关联 Mimir 指标
        queries:
          - name: "请求速率"
            query: "rate(http_requests_total{service_name='$${__span.tags.service.name}'}[5m])"
```

### 7.2 瀑布图分析

在 Grafana 中打开一条 Trace，查看瀑布图（Waterfall）：

```
瀑布图结构：
┌────────────────────────────────────────────┐
│ Span Name              │ Duration  │ 时间轴  │
├────────────────────────────────────────────┤
│ GET /api/orders         │ 1.2s     │ ████████│
│  ├─ SELECT orders       │ 800ms    │  ██████ │
│  ├─ GET /api/users/1    │ 300ms    │   ████  │
│  └─ INSERT audit_log   │ 50ms     │    █    │
└────────────────────────────────────────────┘

点击 Span 查看详情：
- Attributes：http.method, http.status_code, db.statement
- Events：自定义事件（如"订单创建成功"）
- Resource：service.name, k8s.pod.name
```

---

## 8. 服务依赖图（Service Graph）

### 8.1 Service Graph 原理

Tempo 自动分析已存储的 Span 数据，提取服务间调用关系，在 Grafana 中生成服务依赖拓扑图。**无需额外部署**，Tempo 内置此功能。

### 8.2 启用 Service Graph

```yaml
metrics_generator:
  ring:
    kvstore:
      store: consul
  processor:
    service_graphs:
      max_items: 10000
      wait: 10s
      dimensions: ["http.method", "http.status_code"]

  storage:
    path: /tmp/tempo/generator/wal
    remote_write:
      - url: http://mimir:9009/api/v1/push  # 生成的指标写入 Mimir
        headers:
          X-Scope-OrgID: anonymous
```

### 8.3 在 Grafana 中查看服务依赖图

```
1. Grafana → Explore → Tempo
2. 选择 "Service Graph" 视图
3. 查看服务间调用关系：
   order-service ──→ user-service ──→ database
          │
          └──→ payment-service ──→ kafka
4. 点击连线查看延迟、错误率
5. 点击节点钻取到具体 Trace
```

---

## 9. Span Metrics 指标派生

### 9.1 从 Span 自动生成指标

Tempo 的 Metrics Generator 从 Span 属性中自动派生 RED 指标（Rate/Errors/Duration），写入 Mimir。

```yaml
metrics_generator:
  processor:
    span_metrics:
      dimensions:
        - service.name
        - http.method
        - http.status_code
        - db.system
      # 生成 histogram 用于 P99 等分位数计算
      enable_target_info: true
      histogram_buckets: [0.05, 0.1, 0.5, 1, 2, 5, 10]

    # 本地 Span 的 RED 指标
    local_blocks:
      filter_server_spans: true
```

### 9.2 在 Grafana 中使用 Span 指标

```
# 自动生成的指标示例
traces_spanmetrics_calls_total{service_name="order-service", http_status_code="500"}  通过 Mimir 查询 QPS
traces_spanmetrics_latency_bucket{service_name="order-service"}                       通过 Mimir 查询 P99 延迟
traces_spanmetrics_calls_total{service_name="order-service", status_code="STATUS_CODE_ERROR"}  错误率
```

---

## 10. 低成本存储策略

### 10.1 为什么 Tempo 成本低

| 对比维度 | Elasticsearch / SkyWalking | Grafana Tempo |
|---------|---------------------------|---------------|
| **存储方式** | 全量索引（倒排索引） | 无索引，仅按 Trace ID 键值存储 |
| **存储后端** | 本地磁盘 / 昂贵 SSD | 对象存储（S3 约 $0.023/GB/月） |
| **扩容方式** | 垂直扩容（加 SSD） | 水平扩容（加对象存储桶） |
| **存储成本（100TB）** | 约 $3,000-5,000/月（ES 集群） | 约 $2,300/月（S3 标准存储） |

### 10.2 数据压缩

Tempo 自动对 Block 进行 ZSTD 压缩，实际压缩比约 **3-5x**。

```yaml
compactor:
  compaction:
    block_retention: 720h  # 30天保留期
    compaction_window: 1h
    max_compaction_objects: 1000000
```

---

## 11. 采样策略

### 11.1 LGTM 推荐的组合采样

```
层级1 - SDK 头部采样：
  └─ 10% 概率采样（过滤大量正常请求）

层级2 - Collector 尾部采样：
  ├─ 100% 保留错误 Trace
  ├─ 100% 保留慢请求（> 2s）
  ├─ 100% 保留关键服务
  └─ 10% 保留其他正常请求
```

### 11.2 Collector 尾部采样配置

```yaml
processors:
  tail_sampling:
    decision_wait: 30s
    policies:
      - name: errors
        type: status_code
        status_code:
          status_codes: [ERROR]

      - name: slow-requests
        type: latency
        latency:
          threshold_ms: 2000

      - name: critical-services
        type: string_attribute
        string_attribute:
          key: service.name
          values: ["payment-service", "order-service"]

      - name: probabilistic
        type: probabilistic
        probabilistic:
          sampling_percentage: 10
```

### 11.3 基于规则的采样（Tempo 侧）

```yaml
overrides:
  # 默认 10% 采样
  ingestion_rate_limit_bytes: 15_000_000
  ingestion_burst_size_bytes: 20_000_000

  # 按租户覆写
  per_tenant_override_config: /etc/tenant_overrides.yaml
```

---

## 12. Tempo vs Jaeger vs SkyWalking 对比

| 维度 | Grafana Tempo | Jaeger | SkyWalking |
|------|--------------|--------|------------|
| **存储后端** | 对象存储（S3/MinIO/GCS） | Elasticsearch/Cassandra | Elasticsearch/H2/MySQL |
| **索引方式** | 无需索引（键值存储） | 需要索引 | 需要索引 |
| **存储成本** | **低**（对象存储） | 中-高 | 中-高 |
| **查询语言** | **TraceQL**（类 PromQL） | Jaeger UI 搜索 | GraphQL / UI |
| **Grafana 集成** | **原生深度集成** | 需要数据源 | 需要数据源 |
| **APM 功能** | 配合 Mimir（指标） | 基础 | **丰富**（JVM/DB 监控） |
| **OTLP 支持** | **原生优先** | 支持 | 支持 |
| **水平扩展** | **天然支持**（对象存储） | 受 ES 集群限制 | 受数据库限制 |
| **适用场景** | LGTM 体系 / 云原生 | 独立使用 | 全功能 APM |

---

## 13. 面试要点

**Q1：Tempo 为什么存储成本低？**

Tempo 采用**无需索引的键值存储**：以 Trace ID 为键，直接查询对象存储。不需要像 Elasticsearch 那样为每个字段建立倒排索引，因此存储成本降低 50-70%。

**Q2：TraceQL 和 Kibana 查询的区别？**

TraceQL 是专门为 Trace 数据设计的查询语言，支持 Span 级别的过滤和 Pipeline 跨服务查询（`>>` 操作符）；而 Kibana KQL 是通用日志查询语言，不支持 Trace 特有的 Span 间关系查询。

**Q3：Tempo 如何处理高基数属性？**

不建立索引。查询时通过并行的 Querier 组件扫描对象存储中的 Block 进行流式过滤。由于不建索引，高基数属性不会导致存储膨胀。

**Q4：Tempo 的 Service Graph 如何生成？**

Tempo 内置 Metrics Generator，解析已存储的 Span 数据，从 Span 属性中提取服务间父子调用关系（client/server span pair），自动在 Grafana 中绘制服务依赖图。

**Q5：如何实现 Loki 日志 → Tempo Trace 跳转？**

在 Grafana 中配置 Trace-to-Logs 关联：Loki 日志中的 `trace_id` 字段可通过 Grafana 内置的 `tracesToLogsV2` 配置自动关联 Tempo 数据源，点击日志旁按钮直接跳转到对应 Trace 瀑布图。

---

## 14. 参考资料

**官方文档**：
- [Grafana Tempo 官方文档](https://grafana.com/docs/tempo/latest/)
- [TraceQL 查询指南](https://grafana.com/docs/tempo/latest/traceql/)
- [Tempo 部署最佳实践](https://grafana.com/docs/tempo/latest/operations/)

---

**下一章预告**：第 35 章将学习 Grafana Mimir & Prometheus 指标监控，包括 Prometheus 基础、Mimir 水平扩展架构、OTel Metrics 管道、PromQL 查询、Grafana Alerting 统一告警等内容。

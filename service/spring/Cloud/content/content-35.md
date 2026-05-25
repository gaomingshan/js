# 第 35 章：指标监控 - Grafana Mimir & Prometheus

> **学习目标**：掌握 Prometheus + Mimir 分层指标架构、理解 Mimir 水平扩展与高可用原理、能够设计 Grafana 监控 Dashboard、能够配置 Grafana Alerting 统一告警
> **预计时长**：4-5 小时
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. LGTM 指标架构：Prometheus → Mimir → Grafana

### 1.1 三层指标存储架构

```
                        采集层                    存储层                  可视化层
                    ┌──────────┐           ┌──────────────┐        ┌──────────┐
  Spring Boot ──→  │Prometheus│ ──remote──→│              │        │          │
  (Actuator)       │(短期存储)│   write    │  Grafana     │ ──→   │ Grafana  │
                    └──────────┘           │  Mimir       │        │          │
  Nginx / K8s ──→  │Prometheus│ ──remote──→│ (长期存储)   │ ──→   │ Dashboard│
  (Exporter)       │(HA 对)   │   write    │              │        │          │
                    └──────────┘           └──────────────┘        └──────────┘
```

**角色分工**：
- **Prometheus**：短期（2h-30d）本地存储 + 数据采集（Pull）+ 告警规则评估
- **Mimir**：长期水平扩展存储（对象存储），接收 Prometheus remote write
- **Grafana**：统一可视化 + Grafana Alerting 统一告警（替代 AlertManager）

### 1.2 为什么需要 Mimir

| 问题 | 仅用 Prometheus | Prometheus + Mimir |
|------|----------------|-------------------|
| **存储时限** | 受本地磁盘限制（通常 15d） | 对象存储，可保留 1 年+ |
| **扩展性** | 单机，垂直扩展有限 | **水平扩展**，对等架构 |
| **高可用** | 需部署 HA 对（双写） | 自带多副本复制 |
| **查询性能** | 单机限制 | Querier 水平扩展，查询分流 |
| **多租户** | 不支持 | 原生支持 `X-Scope-OrgID` |
| **成本** | 本地 SSD 成本高 | 对象存储成本低 |

---

## 2. Prometheus 架构与数据模型

### 2.1 Prometheus 架构

```
Prometheus Server
    ├─ Retrieval（服务发现 + Pull 拉取）
    │    ├─ Kubernetes SD（自动发现 Pod）
    │    ├─ Static Config（静态配置）
    │    └─ Consul / Eureka SD
    ├─ TSDB（时序数据库，本地存储）
    │    ├─ Head Block（内存 + WAL）
    │    └─ Persistent Blocks（磁盘）
    ├─ PromQL Engine（查询引擎）
    └─ Rules Engine（规则引擎）
         ├─ Recording Rules（预计算指标）
         └─ Alerting Rules（告警规则）
```

### 2.2 数据模型

Prometheus 将指标存为**时间序列**（Time Series），每条由**指标名** + **标签键值对**唯一标识。

```
指标名{标签1="值1", 标签2="值2"} 值 @时间戳

# 示例
http_requests_total{method="GET", handler="/api/orders", status="200"} 12345 @1704067200
http_requests_total{method="POST", handler="/api/orders", status="201"} 891 @1704067200
```

**标签设计原则**：
- ✅ 低基数标签：`method`(GET/POST)、`status`(200/404/500)、`service`（服务名）
- ❌ 高基数标签：`user_id`、`order_id`、`request_id`（会导致序列爆炸）

### 2.3 指标类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **Counter** | 只增不减的累计值 | `http_requests_total` 请求总数 |
| **Gauge** | 可增可减的瞬时值 | `jvm_memory_used_bytes` 内存使用 |
| **Histogram** | 按桶分布统计（服务端计算分位数） | `http_request_duration_seconds` 请求耗时分布 |
| **Summary** | 客户端分位数 | `http_request_duration_seconds{quantile="0.99"}` P99 |

**Histogram 示例**：

```
# 桶定义：0.05, 0.1, 0.5, 1, 2, 5, +Inf（秒）
http_request_duration_seconds_bucket{le="0.05"} 100    # ≤50ms: 100 次
http_request_duration_seconds_bucket{le="0.1"} 250      # ≤100ms: 250 次
http_request_duration_seconds_bucket{le="0.5"} 900      # ≤500ms: 900 次
http_request_duration_seconds_bucket{le="+Inf"} 1000    # 总计: 1000 次
```

---

## 3. Prometheus Server 部署与基础配置

### 3.1 核心配置

**prometheus.yml**：

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: production
    region: cn-east

scrape_configs:
  # Spring Boot 应用
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: (.+):(?:\d+);(\d+)
        replacement: $1:$2
        target_label: __address__

  # 静态配置
  - job_name: 'order-service'
    static_configs:
      - targets: ['order-service:8080']
        labels:
          env: production
```

### 3.2 Docker 部署

```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus:v2.50.0
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.enable-remote-write-receiver'
      - '--enable-feature=otlp-write-receiver'

  prometheus-ha-2:
    image: prom/prometheus:v2.50.0
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-ha-data:/prometheus
    ports:
      - "9091:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'

volumes:
  prometheus-data:
  prometheus-ha-data:
```

---

## 4. Grafana Mimir 架构与集群部署

### 4.1 Mimir 架构

```
┌─────────────────────────────────────────────────┐
│                  Grafana Mimir                    │
│                                                   │
│  Distributor（分发层）                             │
│    ├─ 接收 Prometheus remote write                │
│    ├─ 校验数据合法性                               │
│    └─ 按 Metric Name Hash 路由到 Ingester          │
│  Ingester（写入层）                                │
│    ├─ 内存缓冲最新数据                             │
│    ├─ TSDB Head Block + WAL（短时持久）             │
│    └─ 定期刷写 Block 到对象存储                    │
│  Querier（查询层）                                 │
│    ├─ 接收 Grafana / PromQL 查询                   │
│    ├─ 查询 Ingester（最新数据）+ Store-gateway（历史）│
│    └─ 合并去重返回结果                              │
│  Store-gateway（历史数据网关）                     │
│    ├─ 读取对象存储中的 Block                       │
│    ├─ 缓存 Block Index                            │
│    └─ 过滤不匹配的 Block                           │
│  Compactor（压缩层）                               │
│    ├─ 合并小 Block 为大 Block                      │
│    ├─ 去重与降采样（Deduplication + Downsampling） │
│    └─ 清理过期数据                                 │
│  Query Frontend（查询前端）                        │
│    ├─ 查询缓存（Query Results Cache）               │
│    ├─ 查询分片并行执行                             │
│    └─ 租户隔离                                     │
└─────────────────────────────────────────────────┘
        │ 读写
        ↓
    对象存储（S3 / MinIO / GCS / Azure Blob）
```

### 4.2 单机模式（快速体验）

**mimir.yaml**：

```yaml
target: all
server:
  http_listen_port: 9009

ingester:
  ring:
    kvstore:
      store: memberlist

blocks_storage:
  backend: filesystem
  filesystem:
    dir: /tmp/mimir/data

ruler:
  rule_path: /tmp/mimir/rules

memberlist:
  join_members:
    - mimir:7946
```

**Docker 启动**：

```bash
docker run -d --name mimir \
  -p 9009:9009 \
  -v $(pwd)/mimir.yaml:/etc/mimir.yaml \
  grafana/mimir:latest \
  -config.file=/etc/mimir.yaml
```

### 4.3 微服务模式（生产部署）

```yaml
# mimir-prod.yaml — 使用 target: 指定组件
# 每个组件单独部署一个进程

# distributor.yaml
target: distributor
distributor:
  pool:
    health_check_ingesters: true
ingester_client:
  grpc_client_config:
    max_recv_msg_size: 104857600
    max_send_msg_size: 104857600

# ingester.yaml
target: ingester
ingester:
  ring:
    replication_factor: 3
    kvstore:
      store: consul

# querier.yaml
target: querier
querier:
  max_concurrent: 50
  query_ingesters_within: 3h

# 统一的对象存储配置（所有组件共用）
blocks_storage:
  backend: s3
  s3:
    endpoint: s3.amazonaws.com
    bucket_name: mimir-metrics
    region: us-east-1
  tsdb:
    dir: /data/tsdb
  bucket_store:
    sync_dir: /data/tsdb-sync
```

### 4.4 Docker Compose 微服务部署

```yaml
version: '3'
services:
  mimir-distributor:
    image: grafana/mimir:latest
    volumes:
      - ./distributor.yaml:/etc/mimir.yaml
    ports:
      - "9009:9009"
    command: ["-config.file=/etc/mimir.yaml", "-target=distributor"]

  mimir-ingester-1:
    image: grafana/mimir:latest
    volumes:
      - ./ingester.yaml:/etc/mimir.yaml
    command: ["-config.file=/etc/mimir.yaml", "-target=ingester"]

  mimir-ingester-2:
    image: grafana/mimir:latest
    volumes:
      - ./ingester.yaml:/etc/mimir.yaml
    command: ["-config.file=/etc/mimir.yaml", "-target=ingester"]

  mimir-ingester-3:
    image: grafana/mimir:latest
    volumes:
      - ./ingester.yaml:/etc/mimir.yaml
    command: ["-config.file=/etc/mimir.yaml", "-target=ingester"]

  mimir-querier:
    image: grafana/mimir:latest
    volumes:
      - ./querier.yaml:/etc/mimir.yaml
    command: ["-config.file=/etc/mimir.yaml", "-target=querier"]

  mimir-store-gateway:
    image: grafana/mimir:latest
    volumes:
      - ./store-gateway.yaml:/etc/mimir.yaml
    command: ["-config.file=/etc/mimir.yaml", "-target=store-gateway"]

  mimir-compactor:
    image: grafana/mimir:latest
    volumes:
      - ./compactor.yaml:/etc/mimir.yaml
    command: ["-config.file=/etc/mimir.yaml", "-target=compactor"]
```

---

## 5. OTel Collector → Prometheus/Mimir 指标管道

### 5.1 两条数据通道

```
通道1：Prometheus 原生路径（Pull 模型）
  Spring Boot Actuator /metrics ──Pull──→ Prometheus ──remote_write──→ Mimir

通道2：OTel Collector 路径（Push 模型）
  应用 OTel SDK ──OTLP──→ Collector ──prometheusremotewrite──→ Mimir
```

### 5.2 Collector 配置（Metrics → Mimir）

```yaml
exporters:
  prometheusremotewrite:
    endpoint: "http://mimir:9009/api/v1/push"
    headers:
      X-Scope-OrgID: "anonymous"
    resource_to_telemetry_conversion:
      enabled: true
    target_info:
      enabled: true

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch, resource]
      exporters: [prometheusremotewrite]
```

### 5.3 Prometheus Remote Write 配置

```yaml
# prometheus.yml — 通过 remote_write 将数据写入 Mimir
remote_write:
  - url: http://mimir:9009/api/v1/push
    headers:
      X-Scope-OrgID: anonymous
    queue_config:
      capacity: 2500
      max_shards: 200
      min_shards: 1
      max_samples_per_send: 500
      batch_send_deadline: 5s
    write_relabel_configs:
      # 过滤不需要长期存储的指标
      - source_labels: [__name__]
        regex: 'go_.*|process_.*'
        action: drop
```

---

## 6. Spring Boot Actuator + Micrometer 集成

### 6.1 添加依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-otlp</artifactId>
    </dependency>
</dependencies>
```

### 6.2 应用配置

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  metrics:
    tags:
      application: ${spring.application.name}
      environment: ${spring.profiles.active}
    export:
      prometheus:
        enabled: true
      otlp:
        enabled: true
        endpoint: http://otel-collector:4318/v1/metrics
  endpoint:
    prometheus:
      enabled: true
```

### 6.3 自定义业务指标

```java
@Component
public class OrderMetrics {

    private final MeterRegistry meterRegistry;
    private final Counter orderCreatedCounter;
    private final Timer orderCreationTimer;

    public OrderMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        // 订单创建计数器
        this.orderCreatedCounter = Counter.builder("order.created.total")
            .description("订单创建总数")
            .tag("service", "order-service")
            .register(meterRegistry);

        // 订单创建耗时分布
        this.orderCreationTimer = Timer.builder("order.creation.duration")
            .description("订单创建耗时")
            .publishPercentiles(0.5, 0.95, 0.99)
            .publishPercentileHistogram(true)
            .sla(Duration.ofMillis(100), Duration.ofMillis(500), Duration.ofSeconds(1))
            .register(meterRegistry);
    }

    public Order recordOrderCreation(Supplier<Order> supplier) {
        orderCreatedCounter.increment();
        return orderCreationTimer.record(supplier);
    }

    // Gauge 示例：当前待处理订单数
    @Bean
    public MeterBinder pendingOrdersGauge(OrderQueue queue) {
        return registry -> Gauge.builder("order.pending.count", queue, OrderQueue::size)
            .description("待处理订单数")
            .register(registry);
    }
}
```

---

## 7. PromQL 查询语言

### 7.1 基础查询

```promql
# 查询所有 HTTP 请求计数
http_requests_total

# 标签过滤
http_requests_total{method="GET", status="200"}

# 正则匹配
http_requests_total{handler=~"/api/.*"}

# 排除过滤
http_requests_total{status!~"5.."}

# 时间范围查询（查询 5 分钟内的数据）
http_requests_total[5m]
```

### 7.2 运算符与函数

```promql
# rate()：计算每秒增长率（Counter 专用）
rate(http_requests_total[5m])

# irate()：瞬时增长率
irate(http_requests_total[5m])

# increase()：区间内总增长
increase(http_requests_total[1h])

# sum() by()：按标签求和
sum(rate(http_requests_total[5m])) by (service)

# topk()：取前 K 个
topk(5, sum(rate(http_requests_total[5m])) by (service))

# histogram_quantile()：从 Histogram 计算分位数
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# count() by()：计数
count(up == 0) by (service)

# absent()：检测指标缺失
absent(up{job="order-service"})
```

### 7.3 常用 SLO 查询

```promql
# 可用性（Availability = 成功请求 / 总请求）
sum(rate(http_requests_total{status=~"2..|3.."}[5m])) by (service)
  /
sum(rate(http_requests_total[5m])) by (service)
  * 100

# P99 延迟
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
)

# 错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
  /
sum(rate(http_requests_total[5m])) by (service)
  * 100

# QPS
sum(rate(http_requests_total[1m])) by (service)
```

---

## 8. Recording Rules 与 Alerting Rules

### 8.1 Recording Rules（预计算指标）

**rules/recording.yml**：

```yaml
groups:
  - name: slo_metrics
    interval: 30s
    rules:
      # 预计算 QPS
      - record: job:http_requests_per_second:rate5m
        expr: sum(rate(http_requests_total[5m])) by (service)

      # 预计算 P99 延迟
      - record: job:http_request_duration_p99:histogram_quantile
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
          )

      # 预计算错误率
      - record: job:http_requests_error_rate:rate5m
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
          /
          sum(rate(http_requests_total[5m])) by (service)
```

### 8.2 Alerting Rules

**rules/alerts.yml**：

```yaml
groups:
  - name: application_alerts
    rules:
      # 高错误率告警
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
          /
          sum(rate(http_requests_total[5m])) by (service) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "{{ $labels.service }} 错误率超过 5%"
          description: "当前错误率：{{ $value | humanizePercentage }}"

      # P99 延迟告警
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.service }} P99 延迟超过 2 秒"

      # 服务不可用
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "{{ $labels.job }} 服务不可用"

      # Mimir 专用：Ingester 内存过高
      - alert: MimirIngesterHighMemory
        expr: |
          max by(pod) (container_memory_usage_bytes{
            container="ingester",
            namespace="mimir"
          }) / 1024 / 1024 / 1024 > 4
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Mimir Ingester {{ $labels.pod }} 内存超过 4GB"
```

---

## 9. Grafana Alerting 统一告警

### 9.1 为什么用 Grafana Alerting 替代 AlertManager

| 对比维度 | AlertManager | Grafana Alerting |
|---------|-------------|-----------------|
| **配置方式** | YAML 文件（GitOps） | Grafana UI / API / Terraform |
| **数据源** | 仅 Prometheus | Prometheus + Loki + Tempo + Mimir 等任意数据源 |
| **告警管理** | 独立的 Web UI | Grafana 内置统一界面 |
| **静默与抑制** | 手动配置 | UI 操作 + API |
| **通知渠道** | Email/Slack/PagerDuty 等 | 同样支持，统一管理 |
| **多数据源告警** | 不支持 | **支持（如 Loki 日志匹配 + Prometheus 指标同时触发）** |

### 9.2 配置 Grafana Alerting

```
1. Grafana → Alerting → Alert rules → New alert rule
2. 选择数据源：Mimir / Prometheus
3. 输入 PromQL：
   sum(rate(http_requests_total{status="500"}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
4. 配置评估频率：Every 1m
5. 配置触发条件：For 5m
6. 配置标签：severity=critical, team=backend
7. 配置通知：
   - Contact point: Slack #ops-alerts
   - Message: "服务 {{ $labels.service }} 错误率 {{ $values.B.Value | humanizePercentage }}"
8. 保存
```

### 9.3 创建 Contact Point

```yaml
# 通过 Grafana 配置文件
alerting:
  contact_points:
    - name: ops-slack
      type: slack
      settings:
        url: ${SLACK_WEBHOOK_URL}
        title: "{{ .CommonLabels.alertname }}"
        text: |
          *告警：* {{ .CommonAnnotations.summary }}
          *描述：* {{ .CommonAnnotations.description }}
          *级别：* {{ .CommonLabels.severity }}

    - name: ops-pagerduty
      type: pagerduty
      settings:
        integration_key: ${PAGERDUTY_KEY}
```

---

## 10. Grafana Dashboard 设计与 SLO 面板

### 10.1 微服务性能 Dashboard

**关键面板布局**：

```
┌────────────────────────────────────────────────────┐
│  Row 1：概览                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │   QPS    │ │  P99延迟  │ │  错误率   │ │ 实例数  ││
│  │  (Stat)  │ │  (Stat)  │ │  (Stat)  │ │ (Stat) ││
│  └──────────┘ └──────────┘ └──────────┘ └────────┘│
├────────────────────────────────────────────────────┤
│  Row 2：QPS & Latency Trend                        │
│  ┌──────────────────────┐ ┌──────────────────────┐│
│  │ QPS by Service       │ │ P99 Latency by Svc   ││
│  │ (Time Series)        │ │ (Time Series)        ││
│  └──────────────────────┘ └──────────────────────┘│
├────────────────────────────────────────────────────┤
│  Row 3：错误分析                                    │
│  ┌──────────────────────┐ ┌──────────────────────┐│
│  │ Error Rate by Svc    │ │ 4xx vs 5xx           ││
│  │ (Time Series)        │ │ (Stacked Bar)        ││
│  └──────────────────────┘ └──────────────────────┘│
├────────────────────────────────────────────────────┤
│  Row 4：JVM                                         │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐│
│  │Heap 使用 │ │ GC 次数  │ │ Thread 数           ││
│  │  (Gauge) │ │ (Counter)│ │ (Gauge)            ││
│  └──────────┘ └──────────┘ └────────────────────┘│
└────────────────────────────────────────────────────┘
```

### 10.2 SLO Dashboard

```promql
# SLO：可用性 99.9%
# 时间窗口：30 天

# 当前 SLO 达标率
(
  sum(rate(http_requests_total{status=~"2..|3.."}[30d])) by (service)
  /
  sum(rate(http_requests_total[30d])) by (service)
) * 100

# 剩余错误预算
(1 - sum(rate(http_requests_total{status=~"2..|3.."}[30d])) by (service)
      / sum(rate(http_requests_total[30d])) by (service)) * 100

# 错误预算燃尽率
sum(rate(http_requests_total{status=~"5.."}[1h])) by (service)
/
(
  sum(rate(http_requests_total[30d])) by (service) * 0.001  -- 0.1% error budget
) * 100
```

---

## 11. JVM 监控面板与业务指标自定义

### 11.1 关键 JVM 指标

```promql
# 堆内存使用率
jvm_memory_used_bytes{area="heap"}
  / jvm_memory_max_bytes{area="heap"} * 100

# GC 暂停时间
rate(jvm_gc_pause_seconds_sum[5m]) / rate(jvm_gc_pause_seconds_count[5m])

# 线程数
jvm_threads_live_threads

# CPU 使用率
system_cpu_usage * 100

# 数据库连接池使用率
hikaricp_connections_active / hikaricp_connections_max * 100
```

### 11.2 Mimir 自身监控

```promql
# Mimir Ingester 写入延迟
histogram_quantile(0.99,
  sum(rate(cortex_ingester_client_request_duration_seconds_bucket[5m])) by (le, operation)
)

# Mimir 压缩速率
rate(cortex_compactor_blocks_compaction_duration_seconds_count[1h])
```

---

## 12. 高基数指标治理

### 12.1 什么是高基数问题

```
# ❌ 错误：将 user_id 设为标签
http_requests_total{user_id="user-12345", method="GET"} 1
# 如果有 100 万用户，就会产生 100 万条时间序列，Mimir 内存爆炸

# ✅ 正确：限制标签基数
http_requests_total{method="GET", handler="/api/users/{id}"} 12345
# 用 handler 模板化路径，标签基数可控
```

### 12.2 Mimir 基数限制

```yaml
limits:
  # 单租户活跃序列上限
  max_global_series_per_user: 1_000_000
  max_global_series_per_metric: 20_000

  # 单次查询最多返回序列数
  max_fetched_series_per_query: 10000

  # Label 基数限制
  max_label_names_per_series: 30
  max_label_value_length: 1024
```

### 12.3 最佳实践

- **路径模板化**：`/api/orders/{id}` 而非 `/api/orders/12345`
- **避免在标签中放用户 ID、请求 ID、IP 等**
- **使用 Exemplar** 关联具体请求而不用标签
- **启用 Cardinality Analysis**：Mimir 后端可分析基数最高的标签

---

## 13. 长期存储与对象存储成本优化

### 13.1 降采样（Downsampling）

Mimir 自动对历史数据降采样，降低存储成本：

```
原始数据（Raw）：   保存 0-6h，  全量精度
5 分钟聚合：       保存 6h-30d， 5m 分辨率
1 小时聚合：       保存 30d-1y， 1h 分辨率
```

### 13.2 对象存储配置

```yaml
blocks_storage:
  backend: s3
  s3:
    endpoint: s3.amazonaws.com
    bucket_name: mimir-metrics
    region: us-east-1

  # Bucket Store 配置
  bucket_store:
    # 索引缓存
    index_cache:
      backend: memcached
      memcached:
        addresses: memcached:11211
    # 数据块缓存
    chunks_cache:
      backend: memcached
      memcached:
        addresses: memcached-chunks:11211

  # TSDB 本地 WAL 配置
  tsdb:
    dir: /data/tsdb
    ship_interval: 1m
    block_ranges_period: [2h, 6h, 12h, 24h]
```

---

## 14. Mimir vs VictoriaMetrics vs Thanos 对比

| 维度 | Grafana Mimir | VictoriaMetrics | Thanos |
|------|--------------|-----------------|--------|
| **架构复杂度** | 中等（组件分离清晰） | **低**（单体/集群） | 高（依赖多） |
| **存储后端** | 对象存储 | 本地磁盘 / 对象存储 | 对象存储 |
| **Grafana 集成** | **原生深度集成** | 标准 Prometheus 数据源 | 标准 Prometheus 数据源 |
| **多租户** | **原生支持** | 需额外配置 | 部分支持 |
| **写入性能** | 高 | **极高** | 高 |
| **查询缓存** | **内置**（Query Frontend） | 需外部缓存 | 需外部缓存 |
| **LGTM 集成** | **天然一体** | 独立项目 | 独立项目 |
| **License** | AGPLv3 | Apache 2.0 | Apache 2.0 |

---

## 15. 面试要点

**Q1：Prometheus + Mimir 的分层架构优势是什么？**

Prometheus 负责短期采集和告警评估（热数据，本地 SSD），Mimir 负责长期存储和水平扩展查询（冷/温数据，对象存储）。两层的职责分离使得采集层低延迟、存储层低成本。

**Q2：Mimir 如何实现水平扩展？**

所有组件无状态或使用对象存储：Distributor 无状态可横向扩展，Ingester 通过一致性哈希分散写入负载，Querier 无状态可横向扩展，Store-gateway 负载均衡读取对象存储。

**Q3：PromQL 中 rate() 和 irate() 的区别？**

`rate()` 计算区间内平均每秒增长率（平滑），适合长期趋势查看；`irate()` 取区间内最后两个数据点计算瞬时增长率，适合发现突发尖刺。

**Q4：为什么用 Grafana Alerting 而非 AlertManager？**

Grafana Alerting 支持**跨数据源告警**（如 Prometheus 指标异常 + Loki 日志模式匹配同时触发），统一管理告警规则、静默和通知渠道；AlertManager 仅能消费 Prometheus 告警。

**Q5：Histogram 和 Summary 如何选择？**

- Histogram：服务端聚合 + 服务端分位数（PromQL `histogram_quantile` 可跨服务计算全局 P99）
- Summary：客户端直接计算分位数（无法跨实例聚合，但无需 PromQL 计算）
- 推荐 Histogram，更灵活且在 LGTM 中 Mimir 可高效处理

---

## 16. 参考资料

**官方文档**：
- [Grafana Mimir 官方文档](https://grafana.com/docs/mimir/latest/)
- [Prometheus 官方文档](https://prometheus.io/docs/)
- [PromQL 查询指南](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/)

---

**下一章预告**：第 36 章将学习 Grafana Loki 日志体系，包括 Loki 架构设计、Label 最佳实践、LogQL 查询语言、Loki → Tempo 联动、LGTM 三信号协同分析等内容。

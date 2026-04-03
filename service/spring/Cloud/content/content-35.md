# 第 35 章：指标监控 - Prometheus & Grafana

> **学习目标**：掌握 Prometheus + Grafana 监控体系、理解时序数据库原理、能够设计监控 Dashboard、能够配置告警策略  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. Prometheus 架构与数据模型

### 1.1 Prometheus 简介

**Prometheus**：开源的监控和告警系统，专为云原生环境设计。

**核心特性**：
- ✅ 多维数据模型（时间序列由指标名和标签定义）
- ✅ 灵活的查询语言（PromQL）
- ✅ 不依赖分布式存储
- ✅ Pull 模式采集数据
- ✅ 支持服务发现
- ✅ 丰富的可视化和告警

### 1.2 架构设计

```
Prometheus Server
    ├─ Retrieval（数据采集）
    │    ↓ Pull
    │  Targets（监控目标）
    │    ├─ Spring Boot Actuator
    │    ├─ Node Exporter
    │    ├─ MySQL Exporter
    │    └─ Custom Exporter
    │
    ├─ TSDB（时序数据库）
    │    ├─ 数据存储
    │    └─ 数据压缩
    │
    ├─ PromQL（查询引擎）
    │
    └─ HTTP Server
         ↓
    Alertmanager（告警管理）
         ↓
    Grafana（可视化）
```

### 1.3 数据模型

**时间序列**：

```
http_requests_total{method="GET", status="200", instance="localhost:8080"}  @1704096000  1234
                    ↑                                                        ↑            ↑
                  标签（Labels）                                          时间戳        值
```

**指标类型**：

1. **Counter**：只增不减的计数器
```
http_requests_total
jvm_gc_count_total
```

2. **Gauge**：可增可减的仪表盘
```
jvm_memory_used_bytes
cpu_usage_percent
```

3. **Histogram**：分布统计
```
http_request_duration_seconds_bucket{le="0.1"}  100
http_request_duration_seconds_bucket{le="0.5"}  200
http_request_duration_seconds_bucket{le="1.0"}  250
```

4. **Summary**：类似 Histogram，客户端计算分位数
```
http_request_duration_seconds{quantile="0.5"}  0.15
http_request_duration_seconds{quantile="0.9"}  0.45
http_request_duration_seconds{quantile="0.99"}  0.95
```

---

## 2. Prometheus Server 部署与配置

### 2.1 Docker 部署

```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus:v2.45.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.enable-lifecycle'

volumes:
  prometheus-data:
```

### 2.2 配置文件

**prometheus.yml**：

```yaml
global:
  scrape_interval: 15s      # 抓取间隔
  evaluation_interval: 15s  # 规则评估间隔
  external_labels:
    cluster: 'production'
    region: 'us-east-1'

# 告警配置
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# 规则文件
rule_files:
  - 'rules/*.yml'

# 抓取配置
scrape_configs:
  # Prometheus 自监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  # Spring Boot 应用
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets:
          - 'order-service:8080'
          - 'user-service:8080'
          - 'product-service:8080'
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
  
  # Node Exporter（主机监控）
  - job_name: 'node'
    static_configs:
      - targets:
          - 'node-exporter:9100'
  
  # MySQL Exporter
  - job_name: 'mysql'
    static_configs:
      - targets:
          - 'mysql-exporter:9104'
```

### 2.3 启动 Prometheus

```bash
docker-compose up -d prometheus

# 访问 UI
http://localhost:9090
```

---

## 3. OTel Metrics 导出到 Prometheus

### 3.1 OTel Collector 配置

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 10s

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
    namespace: "otel"

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

### 3.2 Prometheus 抓取 OTel Collector

```yaml
scrape_configs:
  - job_name: 'otel-collector'
    static_configs:
      - targets: ['otel-collector:8889']
```

### 3.3 应用配置

**Spring Boot 3.x**：

```yaml
management:
  otlp:
    metrics:
      export:
        enabled: true
        url: http://localhost:4318/v1/metrics
  
  metrics:
    tags:
      application: ${spring.application.name}
      environment: production
```

---

## 4. Spring Boot Actuator 集成

### 4.1 添加依赖

```xml
<dependencies>
    <!-- Spring Boot Actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Micrometer Prometheus -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
</dependencies>
```

### 4.2 配置

```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info,metrics
  
  metrics:
    export:
      prometheus:
        enabled: true
    
    tags:
      application: ${spring.application.name}
      instance: ${HOSTNAME:localhost}
      environment: ${SPRING_PROFILES_ACTIVE:dev}
    
    distribution:
      percentiles-histogram:
        http.server.requests: true
```

### 4.3 自定义指标

```java
@Component
@RequiredArgsConstructor
public class OrderMetrics {
    
    private final MeterRegistry meterRegistry;
    
    /**
     * Counter：订单创建总数
     */
    public void recordOrderCreated(Order order) {
        meterRegistry.counter("order.created.total",
            "status", order.getStatus().name(),
            "payment_method", order.getPaymentMethod()
        ).increment();
    }
    
    /**
     * Gauge：当前待处理订单数
     */
    @PostConstruct
    public void registerPendingOrdersGauge() {
        meterRegistry.gauge("order.pending.count",
            Tags.empty(),
            this,
            metrics -> orderRepository.countByStatus(OrderStatus.PENDING)
        );
    }
    
    /**
     * Timer：订单处理耗时
     */
    public void recordOrderProcessingTime(long durationMs) {
        meterRegistry.timer("order.processing.duration",
            Tags.empty()
        ).record(durationMs, TimeUnit.MILLISECONDS);
    }
    
    /**
     * Distribution Summary：订单金额分布
     */
    public void recordOrderAmount(BigDecimal amount) {
        meterRegistry.summary("order.amount",
            Tags.empty()
        ).record(amount.doubleValue());
    }
}
```

---

## 5. Micrometer 与 OTel 集成

### 5.1 Micrometer 桥接

**Spring Boot 3.x 原生支持**：

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
```

### 5.2 统一指标

```java
@Component
public class UnifiedMetrics {
    
    private final MeterRegistry meterRegistry;
    private final Tracer tracer;
    
    public void recordBusinessMetric(String operation, long duration) {
        // Micrometer 指标
        meterRegistry.timer("business.operation.duration",
            "operation", operation
        ).record(duration, TimeUnit.MILLISECONDS);
        
        // OTel Span 属性
        Span span = tracer.spanBuilder(operation).startSpan();
        try (Scope scope = span.makeCurrent()) {
            span.setAttribute("duration_ms", duration);
        } finally {
            span.end();
        }
    }
}
```

---

## 6. 核心指标类型（Counter/Gauge/Histogram/Summary）

### 6.1 Counter（计数器）

**使用场景**：统计事件发生次数

```java
@Component
public class HttpMetrics {
    
    private final Counter requestCounter;
    
    public HttpMetrics(MeterRegistry registry) {
        this.requestCounter = Counter.builder("http.requests.total")
            .description("HTTP请求总数")
            .tag("method", "GET")
            .tag("status", "200")
            .register(registry);
    }
    
    public void recordRequest() {
        requestCounter.increment();
    }
}
```

**PromQL 查询**：

```promql
# 每秒请求数（QPS）
rate(http_requests_total[5m])

# 总请求数
sum(http_requests_total)

# 按状态码分组
sum by (status) (http_requests_total)
```

### 6.2 Gauge（仪表盘）

**使用场景**：当前状态值

```java
@Component
public class SystemMetrics {
    
    public SystemMetrics(MeterRegistry registry) {
        // JVM 内存
        registry.gauge("jvm.memory.used", 
            Runtime.getRuntime(), 
            runtime -> runtime.totalMemory() - runtime.freeMemory()
        );
        
        // 线程数
        registry.gauge("jvm.threads.count",
            Thread.activeCount()
        );
    }
}
```

**PromQL 查询**：

```promql
# 当前内存使用
jvm_memory_used_bytes

# 内存使用率
jvm_memory_used_bytes / jvm_memory_max_bytes * 100
```

### 6.3 Histogram（直方图）

**使用场景**：分布统计

```java
@Component
public class LatencyMetrics {
    
    private final DistributionSummary latency;
    
    public LatencyMetrics(MeterRegistry registry) {
        this.latency = DistributionSummary.builder("http.request.duration")
            .description("HTTP请求耗时分布")
            .baseUnit("milliseconds")
            .publishPercentiles(0.5, 0.9, 0.95, 0.99)
            .publishPercentileHistogram()
            .register(registry);
    }
    
    public void recordLatency(double ms) {
        latency.record(ms);
    }
}
```

**PromQL 查询**：

```promql
# P99 延迟
histogram_quantile(0.99, 
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# 平均延迟
rate(http_request_duration_seconds_sum[5m]) / 
rate(http_request_duration_seconds_count[5m])
```

### 6.4 Summary（摘要）

**使用场景**：客户端计算分位数

```java
@Component
public class ResponseTimeMetrics {
    
    private final Timer timer;
    
    public ResponseTimeMetrics(MeterRegistry registry) {
        this.timer = Timer.builder("api.response.time")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);
    }
    
    public void record(Runnable operation) {
        timer.record(operation);
    }
}
```

---

## 7. PromQL 查询语言

### 7.1 基础查询

```promql
# 查询指标
http_requests_total

# 标签过滤
http_requests_total{method="GET"}
http_requests_total{method="GET", status="200"}

# 正则匹配
http_requests_total{instance=~".*:8080"}

# 范围查询
http_requests_total[5m]
```

### 7.2 聚合操作

```promql
# 求和
sum(http_requests_total)

# 分组求和
sum by (method) (http_requests_total)

# 平均值
avg(jvm_memory_used_bytes)

# 最大值
max(http_request_duration_seconds)

# 最小值
min(http_request_duration_seconds)

# 计数
count(up == 1)
```

### 7.3 速率计算

```promql
# 每秒增长率
rate(http_requests_total[5m])

# 平均每秒增长（适用于Counter）
irate(http_requests_total[5m])

# 增量
increase(http_requests_total[1h])
```

### 7.4 分位数

```promql
# P99 延迟
histogram_quantile(0.99, 
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, method)
)

# P95 延迟
histogram_quantile(0.95, 
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
```

### 7.5 复杂查询

```promql
# QPS 突增检测（当前 QPS > 过去1小时平均值的2倍）
rate(http_requests_total[5m]) > 
2 * avg_over_time(rate(http_requests_total[5m])[1h:5m])

# 错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) /
sum(rate(http_requests_total[5m])) * 100

# 可用性（SLA）
(1 - 
  sum(rate(http_requests_total{status=~"5.."}[5m])) /
  sum(rate(http_requests_total[5m]))
) * 100
```

---

## 8. 服务发现配置（static/file/consul/kubernetes）

### 8.1 Static 配置

```yaml
scrape_configs:
  - job_name: 'spring-boot'
    static_configs:
      - targets:
          - 'order-service:8080'
          - 'user-service:8080'
```

### 8.2 File 服务发现

**prometheus.yml**：

```yaml
scrape_configs:
  - job_name: 'spring-boot'
    file_sd_configs:
      - files:
          - 'targets/*.json'
        refresh_interval: 30s
```

**targets/services.json**：

```json
[
  {
    "targets": ["order-service:8080", "user-service:8080"],
    "labels": {
      "env": "production",
      "team": "backend"
    }
  }
]
```

### 8.3 Consul 服务发现

```yaml
scrape_configs:
  - job_name: 'consul-services'
    consul_sd_configs:
      - server: 'consul:8500'
        services: ['order-service', 'user-service']
    
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: service
      - source_labels: [__meta_consul_tags]
        target_label: tags
```

### 8.4 Kubernetes 服务发现

```yaml
scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    
    relabel_configs:
      # 只抓取有 prometheus.io/scrape=true 注解的 Pod
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      
      # 使用注解指定端口
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: (.+)
        replacement: $1
      
      # 使用注解指定路径
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
```

**Pod 注解**：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: order-service
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/actuator/prometheus"
```

---

## 9. Grafana 安装与数据源配置

### 9.1 Docker 部署

```yaml
version: '3'
services:
  grafana:
    image: grafana/grafana:10.0.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning

volumes:
  grafana-data:
```

### 9.2 配置数据源

**grafana/provisioning/datasources/prometheus.yml**：

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

### 9.3 访问 Grafana

```
URL: http://localhost:3000
默认用户名: admin
默认密码: admin
```

---

## 10. Dashboard 设计与导入

### 10.1 导入官方 Dashboard

```
1. 访问 https://grafana.com/grafana/dashboards/
2. 搜索"Spring Boot"
3. 复制 Dashboard ID（如：11378）
4. Grafana UI → Dashboards → Import
5. 输入 ID → Load
6. 选择 Prometheus 数据源 → Import
```

**推荐 Dashboard**：
- JVM (Micrometer)：ID 4701
- Spring Boot 2.1：ID 11378
- Node Exporter Full：ID 1860
- MySQL Overview：ID 7362

### 10.2 自定义 Dashboard

**创建 Panel**：

```json
{
  "title": "QPS",
  "targets": [
    {
      "expr": "sum(rate(http_server_requests_seconds_count[5m])) by (uri)",
      "legendFormat": "{{uri}}"
    }
  ],
  "type": "graph"
}
```

### 10.3 变量配置

```
Name: instance
Type: Query
Query: label_values(http_server_requests_seconds_count, instance)
```

**使用变量**：

```promql
rate(http_server_requests_seconds_count{instance="$instance"}[5m])
```

---

## 11. 告警规则配置（AlertManager）

### 11.1 告警规则

**rules/alerts.yml**：

```yaml
groups:
  - name: service_alerts
    interval: 15s
    rules:
      # 服务下线告警
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务 {{ $labels.instance }} 下线"
          description: "{{ $labels.job }} 服务已下线超过1分钟"
      
      # 高错误率告警
      - alert: HighErrorRate
        expr: |
          sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (uri) /
          sum(rate(http_server_requests_seconds_count[5m])) by (uri) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "接口 {{ $labels.uri }} 错误率过高"
          description: "错误率: {{ $value | humanizePercentage }}"
      
      # 高延迟告警
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri)
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "接口 {{ $labels.uri }} P99延迟过高"
          description: "P99延迟: {{ $value }}s"
      
      # JVM 内存告警
      - alert: HighMemoryUsage
        expr: |
          jvm_memory_used_bytes{area="heap"} /
          jvm_memory_max_bytes{area="heap"} > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "实例 {{ $labels.instance }} 堆内存使用率过高"
          description: "堆内存使用率: {{ $value | humanizePercentage }}"
```

### 11.2 AlertManager 配置

**alertmanager.yml**：

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      continue: true
    
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://webhook-service:8080/alerts'
  
  - name: 'critical'
    email_configs:
      - to: 'ops@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alertmanager@example.com'
        auth_password: 'password'
    
    webhook_configs:
      - url: 'https://oapi.dingtalk.com/robot/send?access_token=xxx'
  
  - name: 'warning'
    webhook_configs:
      - url: 'http://webhook-service:8080/alerts'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

---

## 12. JVM 监控面板

### 12.1 关键指标

**JVM 内存**：

```promql
# 堆内存使用
jvm_memory_used_bytes{area="heap"}

# 堆内存使用率
jvm_memory_used_bytes{area="heap"} / 
jvm_memory_max_bytes{area="heap"} * 100

# 各内存池使用情况
jvm_memory_used_bytes{area="heap", id=~".*Eden.*|.*Survivor.*|.*Old.*"}
```

**GC 指标**：

```promql
# GC 次数
rate(jvm_gc_pause_seconds_count[5m])

# GC 耗时
rate(jvm_gc_pause_seconds_sum[5m])

# GC 平均耗时
rate(jvm_gc_pause_seconds_sum[5m]) /
rate(jvm_gc_pause_seconds_count[5m])
```

**线程**：

```promql
# 线程总数
jvm_threads_live_threads

# 守护线程
jvm_threads_daemon_threads

# 峰值线程数
jvm_threads_peak_threads
```

### 12.2 完整 Dashboard

**导入 Dashboard JSON**：

```json
{
  "dashboard": {
    "title": "Spring Boot JVM 监控",
    "panels": [
      {
        "title": "堆内存使用率",
        "targets": [
          {
            "expr": "jvm_memory_used_bytes{area='heap'} / jvm_memory_max_bytes{area='heap'} * 100"
          }
        ]
      },
      {
        "title": "GC 次数",
        "targets": [
          {
            "expr": "rate(jvm_gc_pause_seconds_count[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## 13. 业务指标自定义（Custom Metrics）

### 13.1 订单业务指标

```java
@Component
@RequiredArgsConstructor
public class OrderBusinessMetrics {
    
    private final MeterRegistry registry;
    
    // 订单创建总数
    private final Counter orderCreated;
    
    // 订单金额分布
    private final DistributionSummary orderAmount;
    
    // 当前待支付订单数
    private final AtomicInteger pendingOrders = new AtomicInteger(0);
    
    @PostConstruct
    public void init() {
        // Counter
        orderCreated = registry.counter("business.order.created.total");
        
        // Distribution Summary
        orderAmount = DistributionSummary.builder("business.order.amount")
            .baseUnit("CNY")
            .publishPercentiles(0.5, 0.9, 0.99)
            .register(registry);
        
        // Gauge
        registry.gauge("business.order.pending.count", pendingOrders);
    }
    
    public void recordOrderCreated(Order order) {
        orderCreated.increment();
        orderAmount.record(order.getAmount().doubleValue());
        pendingOrders.incrementAndGet();
    }
}
```

### 13.2 Grafana 展示

**PromQL 查询**：

```promql
# 每分钟订单数
rate(business_order_created_total[5m]) * 60

# 订单金额 P99
business_order_amount{quantile="0.99"}

# 待支付订单数
business_order_pending_count
```

---

## 14. 高基数指标治理

### 14.1 高基数问题

**问题**：标签值过多导致时间序列爆炸

```promql
# ❌ 错误：用户ID作为标签（百万级）
http_requests_total{user_id="123456"}

# ✅ 正确：使用有限的标签
http_requests_total{user_type="vip"}
```

### 14.2 优化策略

**1. 限制标签数量**：

```java
// ❌ 错误
meterRegistry.counter("api.calls",
    "userId", userId,           // 高基数
    "orderId", orderId,         // 高基数
    "productId", productId);    // 高基数

// ✅ 正确
meterRegistry.counter("api.calls",
    "userType", getUserType(userId),  // 低基数（vip/normal）
    "category", getCategory(productId)); // 低基数
```

**2. 使用聚合**：

```promql
# 按用户类型聚合，而不是具体用户
sum by (user_type) (business_order_created_total)
```

**3. 定期清理**：

```yaml
# Prometheus 配置
global:
  scrape_interval: 15s
  
# 存储保留时间
--storage.tsdb.retention.time=15d
```

---

## 15. 性能优化与存储配置

### 15.1 性能优化

**采样配置**：

```yaml
global:
  scrape_interval: 15s      # 采样间隔
  scrape_timeout: 10s       # 采样超时
```

**查询优化**：

```promql
# ❌ 慢查询：聚合后再计算
sum(rate(http_requests_total[5m])) / sum(rate(http_requests_total[5m]))

# ✅ 快查询：先计算再聚合
sum(rate(http_requests_total[5m])) by (status) /
sum(rate(http_requests_total[5m]))
```

### 15.2 存储配置

```bash
# 启动参数
prometheus \
  --storage.tsdb.path=/data \
  --storage.tsdb.retention.time=15d \
  --storage.tsdb.retention.size=50GB \
  --storage.tsdb.min-block-duration=2h \
  --storage.tsdb.max-block-duration=24h
```

### 15.3 远程存储

**Thanos/Cortex 集成**：

```yaml
remote_write:
  - url: "http://thanos-receiver:19291/api/v1/receive"
    queue_config:
      capacity: 10000
      max_shards: 50
      min_shards: 1
      max_samples_per_send: 5000
      batch_send_deadline: 5s
```

---

## 16. 面试要点

**Q1：Prometheus 的数据模型是什么？**

时间序列，由指标名和标签唯一标识，每个时间点有一个数值。

**Q2：PromQL 中 rate 和 irate 的区别？**

- rate：计算范围内的平均速率
- irate：计算最近两个数据点的瞬时速率

**Q3：如何计算 P99 延迟？**

```promql
histogram_quantile(0.99, 
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
```

**Q4：什么是高基数问题？**

标签值过多导致时间序列数量爆炸，影响性能和存储。

**Q5：如何优化 Prometheus 性能？**

1. 限制标签基数
2. 合理配置采样间隔
3. 使用远程存储
4. 优化 PromQL 查询

---

## 17. 参考资料

**官方文档**：
- [Prometheus 官方文档](https://prometheus.io/docs/)
- [PromQL 教程](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana 官方文档](https://grafana.com/docs/)

---

**下一章预告**：第 36 章将学习 ELK 日志体系与三大信号关联，包括 ELK 架构、Logstash 日志解析、TraceId/SpanId 日志关联、Kibana 检索、Trace-Metric-Log 三大信号联动分析等内容。

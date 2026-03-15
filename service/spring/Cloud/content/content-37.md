# 第37章：指标监控 - Prometheus & Grafana

> **本章目标**：掌握 Prometheus + Grafana 监控体系，理解时序数据库原理，能够设计监控 Dashboard 与配置告警策略

---

## 1. Prometheus 架构与数据模型

### 1.1 核心架构

```
┌─────────────────────────────────────────────────┐
│              Prometheus Server                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Retrieval │  │  TSDB    │  │HTTP API  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
└───────┼─────────────┼─────────────┼─────────────┘
        │             │             │
        │ Pull        │ Store       │ Query
        ↓             ↓             ↓
┌──────────────┐  ┌──────────┐  ┌──────────────┐
│   Targets    │  │ Storage  │  │   Grafana    │
│ (Exporters)  │  │  (TSDB)  │  │ AlertManager │
└──────────────┘  └──────────┘  └──────────────┘
        ↑
┌───────┴────────────────────────────────────────┐
│  Service Discovery                             │
│  (Static/File/Consul/Kubernetes/Nacos)        │
└────────────────────────────────────────────────┘
```

**核心组件**：
- **Prometheus Server**：数据抓取、存储、查询
- **Exporter**：暴露监控指标
- **Pushgateway**：短期任务指标推送
- **AlertManager**：告警管理与分发
- **Grafana**：可视化展示

---

### 1.2 数据模型

**时间序列（Time Series）**：
```
<metric name>{<label name>=<label value>, ...} value timestamp
```

**示例**：
```
http_requests_total{method="GET", endpoint="/api/orders", status="200"} 1234 1642226400000
http_requests_total{method="POST", endpoint="/api/orders", status="201"} 567 1642226400000
```

**核心概念**：
- **Metric Name**：指标名称（如 `http_requests_total`）
- **Labels**：标签，键值对（如 `method="GET"`）
- **Sample**：样本，包含值和时间戳
- **Timestamp**：时间戳（毫秒）

**指标类型**：

| 类型 | 说明 | 示例 |
|------|------|------|
| **Counter** | 计数器，只增不减 | 请求总数、错误总数 |
| **Gauge** | 仪表盘，可增可减 | CPU使用率、内存使用量 |
| **Histogram** | 直方图，分布统计 | 请求耗时分布 |
| **Summary** | 摘要，百分位统计 | 请求耗时P99、P95 |

---

## 2. Prometheus Server 部署与配置

### 2.1 Docker 部署

**docker-compose.yml**：
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./rules:/etc/prometheus/rules
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'  # 数据保留15天
      - '--web.enable-lifecycle'  # 支持热重载
    restart: unless-stopped

volumes:
  prometheus-data:
```

**启动**：
```bash
docker-compose up -d

# 访问 UI
http://localhost:9090
```

---

### 2.2 核心配置文件

**prometheus.yml**：
```yaml
# 全局配置
global:
  scrape_interval: 15s      # 默认抓取间隔
  evaluation_interval: 15s  # 规则评估间隔
  external_labels:
    cluster: 'prod'
    region: 'cn-hangzhou'

# 告警配置
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - 'alertmanager:9093'

# 告警规则文件
rule_files:
  - 'rules/*.yml'

# 抓取配置
scrape_configs:
  # Prometheus 自监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Spring Boot 应用监控
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets:
          - 'order-service:8080'
          - 'user-service:8081'
          - 'product-service:8082'
        labels:
          env: 'prod'

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

---

### 2.3 服务发现配置

**基于文件的服务发现**：
```yaml
scrape_configs:
  - job_name: 'spring-boot'
    file_sd_configs:
      - files:
          - 'targets/spring-boot-*.yml'
        refresh_interval: 30s  # 每30秒刷新
```

**targets/spring-boot-prod.yml**：
```yaml
- targets:
    - '192.168.1.10:8080'
    - '192.168.1.11:8080'
  labels:
    env: 'prod'
    service: 'order-service'

- targets:
    - '192.168.1.20:8081'
    - '192.168.1.21:8081'
  labels:
    env: 'prod'
    service: 'user-service'
```

**基于 Consul 的服务发现**：
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

**基于 Kubernetes 的服务发现**：
```yaml
scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
```

---

## 3. Spring Boot Actuator 集成

### 3.1 依赖引入

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Actuator -->
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

---

### 3.2 配置文件

```yaml
# application.yml
spring:
  application:
    name: order-service

management:
  endpoints:
    web:
      exposure:
        include: '*'  # 暴露所有端点（生产环境建议指定）
      base-path: /actuator
  
  endpoint:
    health:
      show-details: always
    prometheus:
      enabled: true
  
  metrics:
    tags:
      application: ${spring.application.name}  # 添加应用标签
      env: prod
    
    export:
      prometheus:
        enabled: true
        step: 1m  # 采集间隔
    
    distribution:
      percentiles-histogram:
        http.server.requests: true  # 启用直方图
      sla:
        http.server.requests: 50ms,100ms,200ms,500ms,1s,2s  # SLA 阈值
```

---

### 3.3 验证接入

**访问 Prometheus 端点**：
```bash
curl http://localhost:8080/actuator/prometheus
```

**输出示例**：
```
# HELP jvm_memory_used_bytes The amount of used memory
# TYPE jvm_memory_used_bytes gauge
jvm_memory_used_bytes{application="order-service",area="heap",id="PS Eden Space",} 1.2345678E8

# HELP http_server_requests_seconds  
# TYPE http_server_requests_seconds summary
http_server_requests_seconds_count{application="order-service",method="GET",status="200",uri="/api/orders",} 1234.0
http_server_requests_seconds_sum{application="order-service",method="GET",status="200",uri="/api/orders",} 56.789
```

---

## 4. Micrometer 指标收集

### 4.1 自动收集的指标

**JVM 指标**：
- `jvm_memory_used_bytes`：内存使用量
- `jvm_gc_pause_seconds`：GC 暂停时间
- `jvm_threads_live_threads`：活跃线程数
- `jvm_classes_loaded_classes`：已加载类数量

**HTTP 指标**：
- `http_server_requests_seconds`：请求耗时
- `http_server_requests_seconds_count`：请求次数
- `http_server_requests_seconds_sum`：请求总耗时

**数据库连接池指标**：
- `hikaricp_connections_active`：活跃连接数
- `hikaricp_connections_idle`：空闲连接数
- `hikaricp_connections_pending`：等待连接数

---

### 4.2 自定义指标

**Counter 示例**：
```java
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

@Service
public class OrderService {
    
    private final Counter orderCounter;
    
    public OrderService(MeterRegistry registry) {
        this.orderCounter = Counter.builder("order.created")
            .description("订单创建总数")
            .tag("type", "normal")
            .register(registry);
    }
    
    public void createOrder(Order order) {
        // 业务逻辑
        
        // 计数器递增
        orderCounter.increment();
    }
}
```

**Gauge 示例**：
```java
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;

@Service
public class CacheService {
    
    private final Map<String, Object> cache = new ConcurrentHashMap<>();
    
    public CacheService(MeterRegistry registry) {
        Gauge.builder("cache.size", cache, Map::size)
            .description("缓存大小")
            .tag("cache", "local")
            .register(registry);
    }
}
```

**Timer 示例**：
```java
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.MeterRegistry;

@Service
public class PaymentService {
    
    private final Timer paymentTimer;
    
    public PaymentService(MeterRegistry registry) {
        this.paymentTimer = Timer.builder("payment.process")
            .description("支付处理耗时")
            .tag("type", "alipay")
            .publishPercentiles(0.5, 0.95, 0.99)  // 发布 P50、P95、P99
            .register(registry);
    }
    
    public void processPayment() {
        paymentTimer.record(() -> {
            // 支付业务逻辑
            doPayment();
        });
    }
}
```

**Histogram 示例**：
```java
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;

@Service
public class OrderAnalysisService {
    
    private final DistributionSummary orderAmountSummary;
    
    public OrderAnalysisService(MeterRegistry registry) {
        this.orderAmountSummary = DistributionSummary.builder("order.amount")
            .description("订单金额分布")
            .baseUnit("yuan")
            .publishPercentileHistogram()
            .register(registry);
    }
    
    public void recordOrderAmount(BigDecimal amount) {
        orderAmountSummary.record(amount.doubleValue());
    }
}
```

---

### 4.3 注解方式

**@Timed 注解**：
```java
import io.micrometer.core.annotation.Timed;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @Timed(value = "api.orders.create", 
           description = "创建订单接口耗时",
           percentiles = {0.5, 0.95, 0.99})
    @PostMapping
    public Result createOrder(@RequestBody OrderDTO dto) {
        // 自动记录耗时
        return orderService.create(dto);
    }
}
```

**启用注解支持**：
```java
@Configuration
public class MetricsConfig {
    
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }
}
```

---

## 5. PromQL 查询语言

### 5.1 基础查询

**查询指标**：
```promql
# 查询所有 HTTP 请求
http_server_requests_seconds_count

# 过滤标签
http_server_requests_seconds_count{method="GET"}
http_server_requests_seconds_count{method="GET", status="200"}

# 正则匹配
http_server_requests_seconds_count{uri=~"/api/.*"}
http_server_requests_seconds_count{uri!~"/actuator/.*"}
```

---

### 5.2 聚合函数

**求和**：
```promql
# 所有实例的请求总数
sum(http_server_requests_seconds_count)

# 按服务分组求和
sum(http_server_requests_seconds_count) by (application)

# 按多个标签分组
sum(http_server_requests_seconds_count) by (application, method, status)
```

**平均值**：
```promql
# 平均响应时间
avg(http_server_requests_seconds_sum / http_server_requests_seconds_count)
```

**最大/最小值**：
```promql
# 最大内存使用量
max(jvm_memory_used_bytes{area="heap"})

# 最小值
min(jvm_memory_used_bytes{area="heap"})
```

**计数**：
```promql
# 统计实例数量
count(up{job="spring-boot"})
```

---

### 5.3 速率计算

**rate**：计算每秒增长率
```promql
# QPS（每秒请求数）
rate(http_server_requests_seconds_count[5m])

# 错误率
rate(http_server_requests_seconds_count{status=~"5.."}[5m])
```

**irate**：瞬时增长率
```promql
# 瞬时 QPS
irate(http_server_requests_seconds_count[5m])
```

**increase**：增长量
```promql
# 5分钟内请求增长量
increase(http_server_requests_seconds_count[5m])
```

---

### 5.4 数学运算

```promql
# 错误率（百分比）
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) 
/ 
sum(rate(http_server_requests_seconds_count[5m])) 
* 100

# 平均响应时间
sum(rate(http_server_requests_seconds_sum[5m])) 
/ 
sum(rate(http_server_requests_seconds_count[5m]))

# 内存使用率
jvm_memory_used_bytes{area="heap"} 
/ 
jvm_memory_max_bytes{area="heap"} 
* 100
```

---

### 5.5 时间范围选择器

```promql
# 5分钟
http_server_requests_seconds_count[5m]

# 1小时
http_server_requests_seconds_count[1h]

# 1天
http_server_requests_seconds_count[1d]

# 偏移量（1小时前的数据）
http_server_requests_seconds_count offset 1h
```

---

## 6. Grafana 安装与配置

### 6.1 Docker 部署

**docker-compose.yml**：
```yaml
version: '3.8'

services:
  grafana:
    image: grafana/grafana:10.0.0
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    restart: unless-stopped

volumes:
  grafana-data:
```

**启动**：
```bash
docker-compose up -d

# 访问 UI
http://localhost:3000
# 默认用户名/密码：admin/admin123
```

---

### 6.2 添加 Prometheus 数据源

**UI 配置**：
```
1. 登录 Grafana
2. Configuration → Data Sources → Add data source
3. 选择 Prometheus
4. URL: http://prometheus:9090
5. Access: Server (default)
6. Save & Test
```

**配置文件方式**：
```yaml
# grafana/provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

---

## 7. Dashboard 设计与导入

### 7.1 导入官方 Dashboard

**步骤**：
```
1. Dashboards → Import
2. 输入 Dashboard ID：
   - 4701: JVM (Micrometer)
   - 6756: Spring Boot 2.1 Statistics
   - 11378: JVM (Actuator)
   - 12856: Spring Boot Observability
3. 选择数据源: Prometheus
4. Import
```

---

### 7.2 创建自定义 Dashboard

**面板配置示例**：

**QPS 面板**：
```
Panel Title: QPS
Visualization: Graph
Query:
  sum(rate(http_server_requests_seconds_count{application="order-service"}[1m])) by (uri)

Legend: {{uri}}
Y-Axis: requests/sec
```

**平均响应时间面板**：
```
Panel Title: 平均响应时间
Visualization: Graph
Query:
  sum(rate(http_server_requests_seconds_sum{application="order-service"}[1m])) 
  / 
  sum(rate(http_server_requests_seconds_count{application="order-service"}[1m])) 
  by (uri)

Legend: {{uri}}
Y-Axis: seconds
Unit: seconds (s)
```

**成功率面板**：
```
Panel Title: 成功率
Visualization: Stat
Query:
  (
    sum(rate(http_server_requests_seconds_count{application="order-service",status=~"2.."}[5m]))
    /
    sum(rate(http_server_requests_seconds_count{application="order-service"}[5m]))
  ) * 100

Unit: percent (0-100)
Thresholds: 
  - 99: green
  - 95: yellow
  - 0: red
```

**JVM 内存面板**：
```
Panel Title: JVM Heap Memory
Visualization: Graph
Query:
  jvm_memory_used_bytes{application="order-service",area="heap"} / 1024 / 1024

Legend: Used Memory
Y-Axis: MB
Unit: megabytes (MB)
```

---

### 7.3 Dashboard JSON 导出

**完整 Dashboard 示例**：
```json
{
  "dashboard": {
    "title": "Spring Boot Metrics",
    "tags": ["spring-boot", "prometheus"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "QPS",
        "type": "graph",
        "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8},
        "targets": [
          {
            "expr": "sum(rate(http_server_requests_seconds_count{application=\"$application\"}[1m])) by (uri)",
            "legendFormat": "{{uri}}"
          }
        ]
      },
      {
        "id": 2,
        "title": "响应时间 P99",
        "type": "graph",
        "gridPos": {"x": 12, "y": 0, "w": 12, "h": 8},
        "targets": [
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket{application=\"$application\"}[5m])) by (uri, le))",
            "legendFormat": "{{uri}} - P99"
          }
        ]
      }
    ],
    "templating": {
      "list": [
        {
          "name": "application",
          "type": "query",
          "query": "label_values(http_server_requests_seconds_count, application)",
          "refresh": 1
        }
      ]
    }
  }
}
```

---

## 8. 告警规则配置

### 8.1 Prometheus 告警规则

**rules/spring-boot-alerts.yml**：
```yaml
groups:
  - name: spring-boot-alerts
    interval: 30s
    rules:
      # 服务宕机告警
      - alert: ServiceDown
        expr: up{job="spring-boot"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务 {{ $labels.instance }} 已宕机"
          description: "{{ $labels.job }} 服务 {{ $labels.instance }} 已宕机超过1分钟"

      # 响应时间告警
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.99, 
            sum(rate(http_server_requests_seconds_bucket[5m])) by (application, uri, le)
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.application }} 响应时间过高"
          description: "{{ $labels.uri }} P99响应时间 {{ $value }}s，超过1秒"

      # 错误率告警
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (application)
            /
            sum(rate(http_server_requests_seconds_count[5m])) by (application)
          ) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "{{ $labels.application }} 错误率过高"
          description: "错误率 {{ $value | humanizePercentage }}，超过5%"

      # JVM 内存告警
      - alert: HighJvmMemoryUsage
        expr: |
          (
            jvm_memory_used_bytes{area="heap"}
            /
            jvm_memory_max_bytes{area="heap"}
          ) > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.application }} JVM 内存使用率过高"
          description: "内存使用率 {{ $value | humanizePercentage }}，超过85%"

      # GC 时间告警
      - alert: HighGCTime
        expr: |
          rate(jvm_gc_pause_seconds_sum[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.application }} GC 时间过长"
          description: "GC 时间占比 {{ $value | humanizePercentage }}，超过10%"

      # 数据库连接池告警
      - alert: LowDatabaseConnections
        expr: |
          hikaricp_connections_idle < 2
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.application }} 数据库连接池空闲连接不足"
          description: "空闲连接数 {{ $value }}，低于2"
```

---

### 8.2 AlertManager 配置

**alertmanager.yml**：
```yaml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alertmanager@example.com'
  smtp_auth_username: 'alertmanager@example.com'
  smtp_auth_password: 'password'

# 路由规则
route:
  group_by: ['alertname', 'application']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  
  routes:
    # 严重告警立即发送
    - match:
        severity: critical
      receiver: 'critical-alerts'
      group_wait: 0s
      repeat_interval: 5m
    
    # 警告级别
    - match:
        severity: warning
      receiver: 'warning-alerts'

# 接收器
receivers:
  - name: 'default'
    email_configs:
      - to: 'team@example.com'
  
  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@example.com'
    webhook_configs:
      - url: 'http://webhook-server/api/alert'
        send_resolved: true
  
  - name: 'warning-alerts'
    email_configs:
      - to: 'dev@example.com'

# 抑制规则
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'application']
```

---

### 8.3 Grafana 告警

**面板告警配置**：
```
1. 编辑面板 → Alert 选项卡
2. Create Alert
3. 条件设置：
   - WHEN: avg()
   - OF: query(A, 5m, now)
   - IS ABOVE: 1000
4. 通知：选择通知渠道
5. 消息：自定义告警消息
```

**通知渠道配置**：
```yaml
# grafana/provisioning/notifiers/email.yml
notifiers:
  - name: Email
    type: email
    uid: email
    is_default: true
    settings:
      addresses: 'team@example.com'
      uploadImage: true
```

---

## 9. JVM 监控面板

### 9.1 核心 JVM 指标

**内存指标**：
```promql
# Heap 内存使用
jvm_memory_used_bytes{area="heap"} / 1024 / 1024

# Heap 内存使用率
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100

# 各个内存区域
jvm_memory_used_bytes{id=~"PS Eden Space|PS Old Gen|PS Survivor Space"}
```

**GC 指标**：
```promql
# GC 次数
rate(jvm_gc_pause_seconds_count[5m])

# GC 总时间
rate(jvm_gc_pause_seconds_sum[5m])

# GC 平均时间
rate(jvm_gc_pause_seconds_sum[5m]) / rate(jvm_gc_pause_seconds_count[5m])
```

**线程指标**：
```promql
# 活跃线程数
jvm_threads_live_threads

# 守护线程数
jvm_threads_daemon_threads

# 峰值线程数
jvm_threads_peak_threads
```

**类加载指标**：
```promql
# 已加载类数量
jvm_classes_loaded_classes

# 已卸载类数量
jvm_classes_unloaded_classes_total
```

---

### 9.2 JVM Dashboard 模板

**推荐 Dashboard ID**：
- **4701**: JVM (Micrometer)
- **11378**: JVM (Actuator)
- **12856**: Spring Boot Observability

---

## 10. 业务指标自定义

### 10.1 订单业务指标

```java
@Component
public class OrderMetrics {
    
    private final MeterRegistry registry;
    
    private final Counter orderCreatedCounter;
    private final Counter orderPaidCounter;
    private final Counter orderCancelledCounter;
    private final Gauge orderPendingGauge;
    private final Timer orderProcessTimer;
    
    public OrderMetrics(MeterRegistry registry) {
        this.registry = registry;
        
        // 订单创建计数
        this.orderCreatedCounter = Counter.builder("order.created.total")
            .description("订单创建总数")
            .tag("type", "normal")
            .register(registry);
        
        // 订单支付计数
        this.orderPaidCounter = Counter.builder("order.paid.total")
            .description("订单支付总数")
            .register(registry);
        
        // 订单取消计数
        this.orderCancelledCounter = Counter.builder("order.cancelled.total")
            .description("订单取消总数")
            .register(registry);
        
        // 待处理订单数
        this.orderPendingGauge = Gauge.builder("order.pending.count", this, OrderMetrics::getPendingOrderCount)
            .description("待处理订单数")
            .register(registry);
        
        // 订单处理耗时
        this.orderProcessTimer = Timer.builder("order.process.duration")
            .description("订单处理耗时")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);
    }
    
    public void recordOrderCreated() {
        orderCreatedCounter.increment();
    }
    
    public void recordOrderPaid(BigDecimal amount) {
        orderPaidCounter.increment();
        // 记录订单金额
        registry.counter("order.amount.total").increment(amount.doubleValue());
    }
    
    public void recordOrderCancelled() {
        orderCancelledCounter.increment();
    }
    
    public void recordOrderProcess(Runnable task) {
        orderProcessTimer.record(task);
    }
    
    private double getPendingOrderCount() {
        // 从数据库或缓存查询
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }
}
```

---

### 10.2 缓存命中率指标

```java
@Component
public class CacheMetrics {
    
    private final AtomicLong hitCount = new AtomicLong(0);
    private final AtomicLong missCount = new AtomicLong(0);
    
    public CacheMetrics(MeterRegistry registry) {
        // 缓存命中数
        registry.gauge("cache.hit.count", hitCount);
        
        // 缓存未命中数
        registry.gauge("cache.miss.count", missCount);
        
        // 缓存命中率
        registry.gauge("cache.hit.rate", this, m -> {
            long hit = m.hitCount.get();
            long miss = m.missCount.get();
            long total = hit + miss;
            return total == 0 ? 0 : (double) hit / total * 100;
        });
    }
    
    public void recordHit() {
        hitCount.incrementAndGet();
    }
    
    public void recordMiss() {
        missCount.incrementAndGet();
    }
}
```

---

## 11. 性能优化与存储配置

### 11.1 Prometheus 存储优化

**TSDB 配置**：
```yaml
# prometheus.yml
storage:
  tsdb:
    path: /prometheus
    retention.time: 15d  # 数据保留15天
    retention.size: 50GB  # 或限制大小
```

**降低采集频率**：
```yaml
global:
  scrape_interval: 30s  # 从15s调整到30s
  scrape_timeout: 10s
```

**减少存储标签**：
```yaml
scrape_configs:
  - job_name: 'spring-boot'
    metric_relabel_configs:
      # 删除不需要的标签
      - action: labeldrop
        regex: 'instance_id|pod_name'
```

---

### 11.2 指标过滤

**只采集需要的指标**：
```yaml
scrape_configs:
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    metric_relabel_configs:
      # 只保留以下指标
      - source_labels: [__name__]
        regex: 'jvm_.*|http_.*|hikaricp_.*|order_.*'
        action: keep
      
      # 删除不需要的指标
      - source_labels: [__name__]
        regex: 'jvm_buffer_.*'
        action: drop
```

---

### 11.3 远程存储

**配置远程写入**：
```yaml
# prometheus.yml
remote_write:
  - url: "http://victoriametrics:8428/api/v1/write"
    queue_config:
      capacity: 10000
      max_shards: 10
      min_shards: 1

remote_read:
  - url: "http://victoriametrics:8428/api/v1/read"
```

---

## 12. 学习自检清单

- [ ] 理解 Prometheus 架构与数据模型
- [ ] 掌握 Prometheus Server 部署
- [ ] 掌握 Spring Boot Actuator 集成
- [ ] 理解 Micrometer 指标类型（Counter/Gauge/Timer/Summary）
- [ ] 掌握自定义业务指标收集
- [ ] 熟练使用 PromQL 查询语言
- [ ] 掌握服务发现配置（Static/File/Consul/K8s）
- [ ] 掌握 Grafana Dashboard 设计
- [ ] 能够配置 Prometheus 告警规则
- [ ] 能够配置 AlertManager 通知
- [ ] 掌握 JVM 监控指标
- [ ] 能够优化 Prometheus 存储与性能

---

## 13. 面试高频题

**Q1：Prometheus 与传统监控系统的区别？**

**参考答案**：
1. **拉模式 vs 推模式**：Prometheus 主动拉取，传统系统被动接收
2. **时序数据库**：专门为时间序列设计，查询高效
3. **多维度标签**：支持灵活的标签查询
4. **PromQL**：强大的查询语言
5. **服务发现**：支持动态服务发现
6. **云原生**：与 Kubernetes 深度集成

**Q2：如何优化 Prometheus 性能？**

**参考答案**：
1. **调整采集频率**：降低 scrape_interval
2. **指标过滤**：只采集必要指标
3. **减少标签基数**：避免高基数标签（如用户ID）
4. **数据保留策略**：合理配置 retention
5. **远程存储**：使用 VictoriaMetrics 等
6. **联邦集群**：多 Prometheus 分层

**Q3：Counter vs Gauge 的使用场景？**

**参考答案**：
- **Counter**：单调递增，如请求总数、错误总数、订单总数
- **Gauge**：可增可减，如CPU使用率、内存使用量、队列长度

**Q4：如何计算 QPS？**

**参考答案**：
```promql
rate(http_server_requests_seconds_count[5m])
```
- `rate()` 计算每秒增长率
- `[5m]` 表示5分钟时间窗口

---

**本章小结**：
- Prometheus 架构：拉模式、时序数据库、多维度标签
- 数据模型：Metric + Labels + Timestamp + Value
- 指标类型：Counter、Gauge、Histogram、Summary
- Spring Boot 集成：Actuator + Micrometer
- PromQL：强大的查询语言，支持聚合、速率计算、数学运算
- Grafana：可视化展示、Dashboard 设计、告警配置
- 告警规则：Prometheus 规则 + AlertManager 通知
- JVM 监控：内存、GC、线程、类加载
- 业务指标：自定义 Counter、Gauge、Timer
- 性能优化：采集频率、指标过滤、远程存储

**下一章预告**：第38章 - 分布式日志分析 ELK

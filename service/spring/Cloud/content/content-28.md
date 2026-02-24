# 第28章：微服务监控与告警

> **本章目标**：掌握微服务监控体系，实现 Prometheus + Grafana 监控，配置告警规则

---

## 1. 监控体系概述

### 1.1 为什么需要监控

**微服务监控挑战**：
- 服务数量多，依赖关系复杂
- 分布式环境下问题定位难
- 性能瓶颈不易发现
- 故障影响范围不明确

**监控目标**：
- 📊 实时掌握系统运行状态
- 🚨 及时发现和预警故障
- 📈 分析性能瓶颈
- 📉 优化资源使用

---

### 1.2 监控体系分层

**四个维度**：

```
┌─────────────────────────────────────────┐
│  业务监控：订单量、转化率、交易额       │
├─────────────────────────────────────────┤
│  应用监控：请求数、响应时间、错误率     │
├─────────────────────────────────────────┤
│  中间件监控：数据库、Redis、消息队列    │
├─────────────────────────────────────────┤
│  基础设施监控：CPU、内存、磁盘、网络    │
└─────────────────────────────────────────┘
```

**关键指标（黄金信号）**：
- **延迟（Latency）**：请求响应时间
- **流量（Traffic）**：请求速率（QPS/TPS）
- **错误（Errors）**：错误率
- **饱和度（Saturation）**：资源使用率

---

## 2. Prometheus 监控

### 2.1 Prometheus 简介

**架构**：
```
Spring Boot App (Micrometer) → Prometheus Server → Grafana
                ↓
          /actuator/prometheus
```

**核心概念**：
- **Metric**：指标（Counter、Gauge、Histogram、Summary）
- **Label**：标签（维度）
- **PromQL**：查询语言
- **Scrape**：抓取（Pull 模式）

---

### 2.2 Spring Boot 集成

**引入依赖**：
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

**配置 Actuator**：
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
      base-path: /actuator
  
  endpoint:
    health:
      show-details: always
    prometheus:
      enabled: true
  
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: ${spring.application.name}
      instance: ${spring.cloud.client.ip-address}:${server.port}
```

**访问指标端点**：
```bash
curl http://localhost:8001/actuator/prometheus
```

**输出示例**：
```
# HELP jvm_memory_used_bytes The amount of used memory
# TYPE jvm_memory_used_bytes gauge
jvm_memory_used_bytes{area="heap",id="PS Eden Space",} 1.2345678E8

# HELP http_server_requests_seconds
# TYPE http_server_requests_seconds summary
http_server_requests_seconds_count{method="GET",uri="/user/{id}",status="200",} 1234.0
http_server_requests_seconds_sum{method="GET",uri="/user/{id}",status="200",} 12.34
```

---

### 2.3 自定义指标

**计数器（Counter）**：
```java
@Service
public class OrderService {
    
    private final Counter orderCounter;
    
    public OrderService(MeterRegistry registry) {
        this.orderCounter = Counter.builder("order.created")
            .description("订单创建总数")
            .tag("service", "order-service")
            .register(registry);
    }
    
    public void createOrder(OrderDTO order) {
        // 业务逻辑
        orderMapper.insert(order);
        
        // 计数器+1
        orderCounter.increment();
    }
}
```

**仪表盘（Gauge）**：
```java
@Component
public class SystemMetrics {
    
    private final AtomicInteger activeUsers = new AtomicInteger(0);
    
    public SystemMetrics(MeterRegistry registry) {
        Gauge.builder("system.active.users", activeUsers, AtomicInteger::get)
            .description("当前在线用户数")
            .register(registry);
    }
    
    public void userLogin() {
        activeUsers.incrementAndGet();
    }
    
    public void userLogout() {
        activeUsers.decrementAndGet();
    }
}
```

**直方图（Histogram）**：
```java
@Service
public class UserService {
    
    private final Timer timer;
    
    public UserService(MeterRegistry registry) {
        this.timer = Timer.builder("user.query.time")
            .description("用户查询耗时")
            .publishPercentiles(0.5, 0.95, 0.99)  // P50, P95, P99
            .register(registry);
    }
    
    public UserDTO getUser(Long id) {
        return timer.record(() -> {
            return userMapper.selectById(id);
        });
    }
}
```

**摘要（Summary）**：
```java
@Component
public class OrderMetrics {
    
    private final DistributionSummary orderAmountSummary;
    
    public OrderMetrics(MeterRegistry registry) {
        this.orderAmountSummary = DistributionSummary.builder("order.amount")
            .description("订单金额分布")
            .baseUnit("yuan")
            .register(registry);
    }
    
    public void recordOrderAmount(BigDecimal amount) {
        orderAmountSummary.record(amount.doubleValue());
    }
}
```

---

### 2.4 Prometheus Server 配置

**Docker 启动**：
```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

**prometheus.yml**：
```yaml
global:
  scrape_interval: 15s  # 抓取间隔
  evaluation_interval: 15s  # 规则评估间隔

scrape_configs:
  # 静态配置
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['192.168.1.10:8001', '192.168.1.11:8001']
        labels:
          service: 'user-service'
      - targets: ['192.168.1.12:8002']
        labels:
          service: 'order-service'
  
  # Nacos 服务发现
  - job_name: 'nacos-discovery'
    nacos_sd_configs:
      - server: 'http://localhost:8848'
        namespace: 'public'
    relabel_configs:
      - source_labels: [__meta_nacos_instance_metadata_prometheus_path]
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_nacos_instance_metadata_prometheus_port]
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
```

**访问 Prometheus**：
```
http://localhost:9090
```

**PromQL 查询示例**：
```promql
# 每秒请求数（QPS）
rate(http_server_requests_seconds_count[5m])

# P95 延迟
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# 错误率
rate(http_server_requests_seconds_count{status=~"5.."}[5m]) / 
rate(http_server_requests_seconds_count[5m])

# JVM 堆内存使用率
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} * 100
```

---

## 3. Grafana 可视化

### 3.1 安装 Grafana

**Docker 启动**：
```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana
```

**访问**：
```
http://localhost:3000
默认账号：admin
默认密码：admin
```

---

### 3.2 配置数据源

**步骤**：
1. 登录 Grafana
2. Configuration → Data Sources
3. Add data source → Prometheus
4. URL：http://prometheus:9090
5. Save & Test

---

### 3.3 创建 Dashboard

**JVM 监控 Dashboard**：

**Panel 1：堆内存使用**
```json
{
  "title": "JVM Heap Memory",
  "targets": [{
    "expr": "jvm_memory_used_bytes{area=\"heap\", application=\"$application\"}"
  }],
  "yaxes": [{
    "format": "bytes"
  }]
}
```

**Panel 2：GC 次数**
```json
{
  "title": "GC Count",
  "targets": [{
    "expr": "rate(jvm_gc_pause_seconds_count{application=\"$application\"}[5m])"
  }]
}
```

**Panel 3：线程数**
```json
{
  "title": "JVM Threads",
  "targets": [{
    "expr": "jvm_threads_live{application=\"$application\"}"
  }]
}
```

---

**HTTP 监控 Dashboard**：

**Panel 1：QPS**
```json
{
  "title": "Request Rate (QPS)",
  "targets": [{
    "expr": "sum(rate(http_server_requests_seconds_count{application=\"$application\"}[5m])) by (uri)"
  }]
}
```

**Panel 2：P95 延迟**
```json
{
  "title": "P95 Latency",
  "targets": [{
    "expr": "histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{application=\"$application\"}[5m])) by (uri, le))"
  }],
  "yaxes": [{
    "format": "s"
  }]
}
```

**Panel 3：错误率**
```json
{
  "title": "Error Rate",
  "targets": [{
    "expr": "sum(rate(http_server_requests_seconds_count{application=\"$application\", status=~\"5..\"}[5m])) / sum(rate(http_server_requests_seconds_count{application=\"$application\"}[5m]))"
  }],
  "yaxes": [{
    "format": "percentunit"
  }]
}
```

---

### 3.4 导入社区 Dashboard

**推荐 Dashboard**：

1. **JVM (Micrometer)** - ID: 4701
   - JVM 内存、GC、线程监控

2. **Spring Boot Statistics** - ID: 12900
   - HTTP 请求、数据库连接池、缓存

3. **Spring Cloud Gateway** - ID: 11506
   - 网关路由、过滤器、性能

**导入步骤**：
1. Dashboards → Import
2. 输入 Dashboard ID
3. 选择数据源
4. Import

---

## 4. 告警配置

### 4.1 Prometheus 告警规则

**创建告警规则文件**：

**alert-rules.yml**：
```yaml
groups:
  - name: application-alerts
    interval: 30s
    rules:
      # 服务不可用
      - alert: ServiceDown
        expr: up{job="spring-boot"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务 {{ $labels.instance }} 不可用"
          description: "服务已经停止运行超过1分钟"
      
      # 高错误率
      - alert: HighErrorRate
        expr: |
          sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (application) 
          / 
          sum(rate(http_server_requests_seconds_count[5m])) by (application) 
          > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.application }} 错误率过高"
          description: "当前错误率：{{ $value | humanizePercentage }}"
      
      # 高延迟
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99, 
            sum(rate(http_server_requests_seconds_bucket[5m])) by (application, le)
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.application }} 延迟过高"
          description: "P99 延迟：{{ $value }}s"
      
      # JVM 内存使用率高
      - alert: HighMemoryUsage
        expr: |
          jvm_memory_used_bytes{area="heap"} 
          / 
          jvm_memory_max_bytes{area="heap"} 
          > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.instance }} 内存使用率过高"
          description: "当前使用率：{{ $value | humanizePercentage }}"
      
      # CPU 使用率高
      - alert: HighCpuUsage
        expr: system_cpu_usage > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.instance }} CPU 使用率过高"
          description: "当前使用率：{{ $value | humanizePercentage }}"
      
      # 数据库连接池耗尽
      - alert: DatabaseConnectionPoolExhausted
        expr: |
          hikaricp_connections_active / hikaricp_connections_max > 0.9
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "{{ $labels.pool }} 数据库连接池即将耗尽"
          description: "活跃连接数：{{ $value }}"
```

**Prometheus 配置引用**：
```yaml
# prometheus.yml
rule_files:
  - "alert-rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

---

### 4.2 AlertManager 告警通知

**安装 AlertManager**：
```bash
docker run -d \
  --name alertmanager \
  -p 9093:9093 \
  -v /path/to/alertmanager.yml:/etc/alertmanager/alertmanager.yml \
  prom/alertmanager
```

**alertmanager.yml**：
```yaml
global:
  resolve_timeout: 5m

# 路由规则
route:
  group_by: ['alertname', 'severity']
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
    
    # 警告告警分组发送
    - match:
        severity: warning
      receiver: 'warning-alerts'

# 接收器
receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://webhook-server:8080/alerts'
  
  - name: 'critical-alerts'
    email_configs:
      - to: 'ops-team@example.com'
        from: 'prometheus@example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'prometheus@example.com'
        auth_password: 'password'
        headers:
          Subject: '[CRITICAL] {{ .GroupLabels.alertname }}'
    
    webhook_configs:
      - url: 'http://webhook-server:8080/critical'
  
  - name: 'warning-alerts'
    webhook_configs:
      - url: 'http://webhook-server:8080/warning'

# 抑制规则（避免重复告警）
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

---

### 4.3 企业微信/钉钉告警

**Webhook 接收器**：
```java
@RestController
@RequestMapping("/alerts")
public class AlertController {
    
    @Autowired
    private DingTalkService dingTalkService;
    
    @PostMapping
    public void receiveAlert(@RequestBody AlertMessage alert) {
        // 构建消息
        String message = buildMessage(alert);
        
        // 发送到钉钉
        dingTalkService.send(message);
    }
    
    private String buildMessage(AlertMessage alert) {
        StringBuilder sb = new StringBuilder();
        sb.append("### ").append(alert.getStatus()).append("\n");
        sb.append("**告警名称**：").append(alert.getAlertName()).append("\n");
        sb.append("**严重程度**：").append(alert.getSeverity()).append("\n");
        sb.append("**描述**：").append(alert.getDescription()).append("\n");
        sb.append("**时间**：").append(alert.getStartsAt()).append("\n");
        return sb.toString();
    }
}
```

**钉钉机器人发送**：
```java
@Service
public class DingTalkService {
    
    private static final String WEBHOOK_URL = "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN";
    
    public void send(String message) {
        JSONObject json = new JSONObject();
        json.put("msgtype", "markdown");
        
        JSONObject markdown = new JSONObject();
        markdown.put("title", "监控告警");
        markdown.put("text", message);
        json.put("markdown", markdown);
        
        // 发送 HTTP 请求
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.postForObject(WEBHOOK_URL, json, String.class);
    }
}
```

---

## 5. 链路追踪监控

### 5.1 Zipkin 集成

**参考第26章**，Sleuth + Zipkin 实现链路追踪。

**关键指标**：
- Trace 数量
- 平均 Span 数量
- 各服务平均耗时
- 错误 Trace 比例

---

## 6. 日志监控（ELK）

### 6.1 ELK 架构

```
Spring Boot App → Logstash → Elasticsearch → Kibana
```

**日志规范**：
```java
// 使用 MDC 传递 TraceId
MDC.put("traceId", traceId);
log.info("User login: userId={}, ip={}", userId, ip);
MDC.remove("traceId");
```

**Logback 配置**：
```xml
<configuration>
    <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <destination>logstash:5000</destination>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"application":"${spring.application.name}"}</customFields>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="LOGSTASH" />
    </root>
</configuration>
```

---

## 7. 实战场景

### 7.1 场景1：性能分析

**问题**：用户反馈系统响应慢

**排查步骤**：
1. Grafana 查看 P95/P99 延迟
2. 找到慢接口：`/order/create`
3. Zipkin 查看调用链路
4. 发现瓶颈：库存服务响应慢
5. 数据库慢查询分析
6. 优化 SQL，添加索引

---

### 7.2 场景2：故障定位

**问题**：订单服务报错率突增

**排查步骤**：
1. Prometheus 告警：错误率 > 5%
2. Grafana 查看错误分布
3. 发现错误集中在支付接口
4. 查看 Kibana 错误日志
5. 发现支付网关超时
6. 联系支付服务商，确认故障

---

## 8. 常见问题

### 8.1 Prometheus 数据量过大

**问题**：时间序列数据过多，存储压力大

**解决方案**：
- 调整抓取间隔（15s → 30s）
- 减少标签维度
- 设置数据保留时间（15天）
- 使用 Thanos 长期存储

---

### 8.2 告警风暴

**问题**：大量告警同时触发，淹没真正的问题

**解决方案**：
- 配置告警分组
- 设置抑制规则
- 调整告警阈值
- 增加 `for` 时间窗口

---

## 9. 学习自检清单

- [ ] 理解监控体系四个维度
- [ ] 掌握 Prometheus + Micrometer 集成
- [ ] 能够自定义业务指标
- [ ] 掌握 PromQL 查询语言
- [ ] 能够配置 Grafana Dashboard
- [ ] 能够配置告警规则
- [ ] 掌握 AlertManager 告警通知
- [ ] 了解 ELK 日志监控

---

## 10. 面试高频题

**Q1：如何设计微服务监控体系？**

**参考答案**：
- 基础设施监控：CPU、内存、磁盘、网络
- 中间件监控：数据库、Redis、消息队列
- 应用监控：QPS、延迟、错误率
- 业务监控：订单量、支付成功率

**Q2：Prometheus vs Zabbix？**

| 维度 | Prometheus | Zabbix |
|------|-----------|--------|
| 定位 | 云原生监控 | 传统监控 |
| 数据模型 | 时间序列 | 关系型数据库 |
| 查询语言 | PromQL | SQL |
| 服务发现 | 支持 | 不支持 |

**Q3：如何监控微服务的健康状态？**

**参考答案**：
- Spring Boot Actuator `/health` 端点
- Prometheus `up` 指标
- 心跳检测
- 自定义健康检查

---

**本章小结**：
- 监控体系分层：基础设施、中间件、应用、业务
- Prometheus + Micrometer：指标采集
- Grafana：可视化监控
- AlertManager：告警通知
- 关键指标：延迟、流量、错误、饱和度
- 实战：性能分析、故障定位
- ELK：日志监控

**下一章预告**：第29章 - Stream 消息驱动深入

# 第 33 章：OpenTelemetry 统一可观测性标准

> **学习目标**：理解 OpenTelemetry 作为云原生可观测性标准、掌握 OTel 自动埋点与手动埋点、能够配置 OTel Collector 对接 LGTM 数据管道、具备 OTel + LGTM 全栈数据采集能力
> **预计时长**：4-5 小时
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. OpenTelemetry 架构与核心概念

### 1.1 OpenTelemetry 简介

**OpenTelemetry（OTel）**：CNCF 毕业项目，统一的可观测性标准，提供 API、SDK 和工具来采集、处理和导出遥测数据。在 LGTM 体系中，OTel 承担**统一数据采集层**的角色。

**核心价值**：
- ✅ 统一标准（Traces/Metrics/Logs 三大信号）
- ✅ 厂商中立（避免供应商锁定，可灵活切换后端）
- ✅ 语言无关（支持 11+ 编程语言）
- ✅ 自动埋点（零代码侵入，覆盖主流框架）
- ✅ OTLP 协议（统一数据传输协议，LGTM 全栈原生支持）

**OTel + LGTM 协同架构**：

```
应用程序（Spring Boot）
    ↓
OTel API / SDK / Java Agent
    ├─ Traces  ──→ OTLP ──→ Grafana Tempo（链路追踪）
    ├─ Metrics ──→ OTLP ──→ Grafana Mimir（指标存储）
    └─ Logs    ──→ OTLP ──→ Grafana Loki（日志存储）
    ↓
Grafana（统一可视化 + 统一告警）
```

### 1.2 架构设计

```
应用程序
    ↓
OpenTelemetry API/SDK
    ├─ Traces（链路追踪）
    ├─ Metrics（指标监控）
    └─ Logs（日志记录）
    ↓
OTel Collector（数据管道）
    ├─ Receivers（接收器）── 接收 OTLP 数据
    ├─ Processors（处理器）── 批处理、采样、属性增强
    └─ Exporters（导出器）── 导出到 LGTM 后端
    ↓
LGTM 后端
    ├─ Loki（日志存储，对象存储低成本）
    ├─ Tempo（链路存储，对象存储无需索引）
    ├─ Mimir（指标存储，水平扩展）
    └─ Grafana（统一可视化与告警）
```

### 1.3 核心组件

| 组件 | 说明 | LGTM 体系中的角色 |
|------|------|-------------------|
| **API** | 定义遥测数据的接口规范 | 应用程序调用入口 |
| **SDK** | API 的语言特定实现 | 生成符合 OTLP 的遥测数据 |
| **Instrumentation** | 自动埋点库（Java Agent） | 零代码采集，覆盖 Spring Boot 生态 |
| **Collector** | 独立的数据收集与处理服务 | 数据管道中枢，对接 LGTM 全栈 |
| **OTLP** | OpenTelemetry Protocol | LGTM 原生支持的统一传输协议 |

---

## 2. 三大可观测性信号（Traces/Metrics/Logs）

### 2.1 Traces（链路追踪）→ Tempo

**概念**：记录请求在分布式系统中的完整路径，最终存储到 Tempo。

**核心要素**：
- **Trace**：一次完整的请求链路（对应 Tempo 中的一条 Trace）
- **Span**：链路中的一个操作单元
- **Context**：跨服务传播的上下文信息（通过 traceparent header）

**数据模型**：

```json
{
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "parentSpanId": "0000000000000000",
  "name": "GET /api/orders",
  "kind": "SERVER",
  "startTimeUnixNano": "1704067200000000000",
  "endTimeUnixNano": "1704067201234000000",
  "attributes": {
    "http.method": "GET",
    "http.url": "/api/orders",
    "http.status_code": 200
  },
  "status": {
    "code": 1
  }
}
```

Tempo 接收 OTLP Trace 数据后，以 **Trace ID 为键** 直接写入对象存储（S3/MinIO/GCS），**无需建立索引**，这是其低成本的核心原因。

### 2.2 Metrics（指标监控）→ Mimir

**概念**：数值型数据，用于监控系统性能和健康状态，通过 Prometheus 兼容接口写入 Mimir。

**指标类型**：
- **Counter**：计数器（只增不减，如请求总数）
- **Gauge**：仪表盘（可增可减，如内存使用率）
- **Histogram**：直方图（分布统计，如 P99 延迟）
- **Summary**：摘要（客户端分位数）

**数据模型**：

```json
{
  "name": "http_requests_total",
  "description": "HTTP请求总数",
  "unit": "1",
  "dataPoints": [
    {
      "attributes": {
        "method": "GET",
        "status": "200"
      },
      "timeUnixNano": "1704067200000000000",
      "asDouble": 12345
    }
  ]
}
```

OTel Collector 将 Metrics 通过 Prometheus remote write 协议写入 Mimir，Mimir 对指标数据进行**长期水平扩展存储**。

### 2.3 Logs（日志记录）→ Loki

**概念**：结构化的事件记录，通过 OTLP 或 Promtail 写入 Loki。

**数据模型**：

```json
{
  "timeUnixNano": "1704067200000000000",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "severityText": "INFO",
  "body": {
    "stringValue": "订单创建成功"
  },
  "attributes": {
    "orderId": "123456",
    "userId": "789"
  },
  "resource": {
    "service.name": "order-service"
  }
}
```

Loki 将日志中的 `resource` 和 `attributes` 映射为 Loki Label（索引），日志正文（body）以**非索引的 chunk** 形式存入对象存储，显著降低存储成本。

---

## 3. OTel Java Agent 自动埋点

### 3.1 下载 Java Agent

```bash
# 下载 OpenTelemetry Java Agent（最新版本）
curl -L -o opentelemetry-javaagent.jar \
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### 3.2 配置 Java Agent 导出到 LGTM

```bash
# 启动应用，通过 OTLP 统一导出到 OTel Collector（再由 Collector 分发到 LGTM）
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.service.name=order-service \
     -Dotel.resource.attributes=deployment.environment=production \
     -Dotel.traces.exporter=otlp \
     -Dotel.metrics.exporter=otlp \
     -Dotel.logs.exporter=otlp \
     -Dotel.exporter.otlp.endpoint=http://localhost:4317 \
     -Dotel.exporter.otlp.protocol=grpc \
     -jar order-service.jar
```

### 3.3 环境变量配置方式

```bash
# 推荐：通过环境变量配置（K8s ConfigMap / Docker env）
export OTEL_SERVICE_NAME=order-service
export OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production
export OTEL_TRACES_EXPORTER=otlp
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc

java -javaagent:opentelemetry-javaagent.jar -jar order-service.jar
```

### 3.4 自动埋点支持的框架（LGTM 场景覆盖）

| 类别 | 自动埋点覆盖 | LGTM 信号 |
|------|-------------|-----------|
| **Web 框架** | Spring MVC / WebFlux / Servlet | Traces + Metrics |
| **HTTP 客户端** | RestTemplate / WebClient / OkHttp / Apache HttpClient | Traces |
| **数据库** | JDBC / Hibernate / MyBatis / Redis / MongoDB | Traces + Metrics |
| **消息队列** | Kafka / RabbitMQ / RocketMQ | Traces + Metrics |
| **RPC** | gRPC / Dubbo | Traces |
| **日志** | Logback / Log4j2（自动注入 TraceId） | Logs → Loki |

---

## 4. OTel SDK 手动埋点与 API

### 4.1 添加依赖

```xml
<dependencies>
    <!-- OpenTelemetry BOM -->
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-bom</artifactId>
        <version>1.36.0</version>
        <type>pom</type>
        <scope>import</scope>
    </dependency>
</dependencies>

<!-- 常用依赖 -->
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-sdk</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
```

### 4.2 手动创建 Span（Trace → Tempo）

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final Tracer tracer;

    public Order createOrder(OrderDTO dto) {
        Span span = tracer.spanBuilder("createOrder")
            .setSpanKind(SpanKind.INTERNAL)
            .startSpan();

        try (Scope scope = span.makeCurrent()) {
            span.setAttribute("order.userId", dto.getUserId());
            span.setAttribute("order.amount", dto.getAmount().doubleValue());

            Order order = saveOrder(dto);

            span.addEvent("订单创建成功",
                Attributes.of(
                    AttributeKey.stringKey("orderId"), order.getId().toString()
                ));

            return order;

        } catch (Exception e) {
            span.recordException(e);
            span.setStatus(StatusCode.ERROR, "订单创建失败");
            throw e;
        } finally {
            span.end();
        }
    }
}
```

### 4.3 自定义 Metrics（Metric → Mimir）

```java
@Component
public class OrderMetrics {

    private final Meter meter;
    private final LongCounter orderCounter;
    private final DoubleHistogram orderAmountHistogram;

    public OrderMetrics(OpenTelemetry openTelemetry) {
        this.meter = openTelemetry.getMeter("order-service");

        this.orderCounter = meter
            .counterBuilder("order.created.total")
            .setDescription("订单创建总数")
            .setUnit("1")
            .build();

        this.orderAmountHistogram = meter
            .histogramBuilder("order.amount")
            .setDescription("订单金额分布")
            .setUnit("CNY")
            .build();
    }

    public void recordOrderCreated(Order order) {
        orderCounter.add(1,
            Attributes.of(
                AttributeKey.stringKey("status"), order.getStatus().name()
            ));

        orderAmountHistogram.record(order.getAmount().doubleValue(),
            Attributes.of(
                AttributeKey.stringKey("userId"), order.getUserId().toString()
            ));
    }
}
```

### 4.4 手动日志关联（Log → Loki）

```java
@Slf4j
@Service
public class OrderService {

    public Order createOrder(OrderDTO dto) {
        Span span = Span.current();
        String traceId = span.getSpanContext().getTraceId();
        String spanId = span.getSpanContext().getSpanId();

        // 结构化日志，TraceId 自动关联 Loki ↔ Tempo
        MDC.put("trace_id", traceId);
        MDC.put("span_id", spanId);

        log.info("开始创建订单 userId={} amount={}", dto.getUserId(), dto.getAmount());

        Order order = saveOrder(dto);

        log.info("订单创建成功 orderId={}", order.getId());
        return order;
    }
}
```

---

## 5. Span、Trace、Context 传播机制

### 5.1 Span 父子关系

```java
Span parentSpan = tracer.spanBuilder("createOrder")
    .setSpanKind(SpanKind.INTERNAL)
    .startSpan();

try (Scope scope = parentSpan.makeCurrent()) {
    // 子 Span 自动关联父 Span
    Span saveSpan = tracer.spanBuilder("saveOrder")
        .setParent(Context.current())
        .startSpan();
    try {
        saveOrder(dto);
    } finally {
        saveSpan.end();
    }

    Span inventorySpan = tracer.spanBuilder("deductInventory")
        .setParent(Context.current())
        .startSpan();
    try {
        deductInventory(order);
    } finally {
        inventorySpan.end();
    }
} finally {
    parentSpan.end();
}
```

### 5.2 跨服务 Context 传播（W3C Trace Context）

OTel 默认使用 W3C Trace Context 标准，Tempo 原生兼容。

**HTTP Header 自动传播**（Java Agent 自动处理）：

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
tracestate: vendor=value
```

**消息队列传播**：

```java
@Service
public class OrderProducer {

    private final StreamBridge streamBridge;

    public void sendOrder(Order order) {
        Message<Order> message = MessageBuilder.withPayload(order).build();

        TextMapPropagator propagator = GlobalOpenTelemetry.getPropagators()
            .getTextMapPropagator();

        Map<String, String> headers = new HashMap<>();
        propagator.inject(Context.current(), headers,
            (map, key, value) -> map.put(key, value));

        Message<Order> enrichedMessage = MessageBuilder
            .fromMessage(message)
            .copyHeaders(headers.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> (Object) e.getValue())))
            .build();

        streamBridge.send("order-out-0", enrichedMessage);
    }
}
```

---

## 6. OTel Collector 数据收集与处理（LGTM 管道配置）

### 6.1 Collector 在 LGTM 中的角色

```
所有应用 → OTLP → Collector → LGTM 后端
                     │
                     ├─ 数据预处理（批处理、脱敏、过滤）
                     ├─ 采样决策（尾部采样保留错误/慢 Trace）
                     ├─ 属性增强（添加环境、集群标签）
                     └─ 多后端路由（不同环境路由到不同 LGTM 实例）
```

### 6.2 Collector 完整配置（对接 LGTM）

**otel-collector-config.yaml**：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024

  # 资源属性增强
  resource:
    attributes:
      - key: deployment.environment
        value: production
        action: upsert
      - key: service.instance.id
        value: ${env:HOSTNAME}
        action: upsert

  # 尾部采样：保留所有错误和慢请求
  tail_sampling:
    decision_wait: 30s
    num_traces: 50000
    policies:
      - name: errors-policy
        type: status_code
        status_code:
          status_codes: [ERROR]
      - name: slow-traces-policy
        type: latency
        latency:
          threshold_ms: 2000
      - name: probabilistic-policy
        type: probabilistic
        probabilistic:
          sampling_percentage: 10

  # 内存限制
  memory_limiter:
    check_interval: 1s
    limit_mib: 1024
    spike_limit_mib: 256

exporters:
  # ====== Traces → Tempo ======
  otlp/tempo:
    endpoint: tempo:4317
    tls:
      insecure: true

  # ====== Metrics → Mimir（通过 Prometheus remote write） ======
  prometheusremotewrite:
    endpoint: "http://mimir:9009/api/v1/push"
    headers:
      X-Scope-OrgID: "anonymous"

  # ====== Logs → Loki ======
  otlphttp/loki:
    endpoint: "http://loki:3100/otlp"
    tls:
      insecure: true

  # 调试输出（仅开发环境）
  debug:
    verbosity: basic

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, tail_sampling, resource]
      exporters: [otlp/tempo, debug]

    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch, resource]
      exporters: [prometheusremotewrite, debug]

    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch, resource]
      exporters: [otlphttp/loki, debug]

  telemetry:
    logs:
      level: "info"
    metrics:
      address: "0.0.0.0:8888"
```

### 6.3 Docker Compose 部署 Collector

```yaml
version: '3'
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.102.0
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317"   # OTLP gRPC（应用 → Collector）
      - "4318:4318"   # OTLP HTTP
      - "8888:8888"   # Collector 自身指标
    environment:
      - HOSTNAME=${HOSTNAME}
```

---

## 7. OTLP 协议与 LGTM 后端导出

### 7.1 为什么 OTLP 是 LGTM 最佳选择

| 协议 | Loki | Tempo | Mimir | 说明 |
|------|------|-------|-------|------|
| **OTLP** | ✅ 原生 | ✅ 原生 | ✅ 原生 | LGTM 全栈优先支持 |
| Jaeger Thrift | ❌ | ❌ | ❌ | 旧协议，不建议 |
| Zipkin | ❌ | ✅ | ❌ | 仅 Tempo 部分支持 |
| Prometheus remote write | ❌ | ❌ | ✅ 原生 | Mimir 标准写入方式 |

### 7.2 各后端导出器对比

```yaml
# 方式1：OTLP 统一导出（推荐，LGTM 全栈原生支持）
exporters:
  otlp/tempo:
    endpoint: tempo:4317
  otlphttp/loki:
    endpoint: "http://loki:3100/otlp"

# 方式2：Prometheus remote write → Mimir（Mimir 标准协议）
exporters:
  prometheusremotewrite:
    endpoint: "http://mimir:9009/api/v1/push"
```

---

## 8. 资源属性与语义约定（Semantic Conventions）

### 8.1 LGTM 中关键资源属性

在 LGTM 体系中，资源属性直接影响 Loki Label、Tempo Tag、Mimir Label 的生成。

```java
@Bean
public OpenTelemetry openTelemetry() {
    Resource resource = Resource.getDefault().merge(
        Resource.create(Attributes.of(
            ResourceAttributes.SERVICE_NAME, "order-service",
            ResourceAttributes.SERVICE_VERSION, "1.0.0",
            ResourceAttributes.SERVICE_NAMESPACE, "production",
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT, "production",
            ResourceAttributes.HOST_NAME, getHostname(),
            ResourceAttributes.K8S_NAMESPACE_NAME, getK8sNamespace(),
            ResourceAttributes.K8S_POD_NAME, getK8sPodName()
        ))
    );

    return OpenTelemetrySdk.builder()
        .setTracerProvider(
            SdkTracerProvider.builder()
                .setResource(resource)
                .build()
        )
        .build();
}
```

### 8.2 LGTM 常用语义约定

```java
// HTTP 语义约定
span.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
span.setAttribute(SemanticAttributes.HTTP_ROUTE, "/api/orders/{id}");
span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, 200);
span.setAttribute(SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH, 2048L);

// 数据库语义约定
span.setAttribute(SemanticAttributes.DB_SYSTEM, "mysql");
span.setAttribute(SemanticAttributes.DB_NAME, "order_db");
span.setAttribute(SemanticAttributes.DB_OPERATION, "SELECT");
span.setAttribute(SemanticAttributes.DB_STATEMENT, "SELECT * FROM orders WHERE id = ?");

// RPC 语义约定
span.setAttribute(SemanticAttributes.RPC_SYSTEM, "grpc");
span.setAttribute(SemanticAttributes.RPC_SERVICE, "OrderService");
span.setAttribute(SemanticAttributes.RPC_METHOD, "CreateOrder");
```

---

## 9. 采样策略（头部采样/尾部采样）

### 9.1 头部采样（SDK 层面）

```java
// 生产环境常用：基于父 Span 决策的 10% 采样
@Bean
public Sampler sampler() {
    return Sampler.parentBased(Sampler.traceIdRatioBased(0.1));
}
```

### 9.2 尾部采样（Collector 层面，推荐 LGTM 使用）

尾部采样是 **LGTM + Tempo 推荐策略**：Traces 先全部接收，完成后再决定保留哪些。

```yaml
processors:
  tail_sampling:
    decision_wait: 30s
    num_traces: 100000
    policies:
      # 100% 保留错误 Trace
      - name: errors
        type: status_code
        status_code:
          status_codes: [ERROR]

      # 100% 保留慢请求（> 2s）
      - name: slow-traces
        type: latency
        latency:
          threshold_ms: 2000

      # 关键服务 100% 保留
      - name: critical-services
        type: string_attribute
        string_attribute:
          key: service.name
          values: ["payment-service", "order-service"]

      # 其他 10% 概率保留
      - name: probabilistic
        type: probabilistic
        probabilistic:
          sampling_percentage: 10
```

**Tempo 优势**：由于 Tempo 使用对象存储且无需索引，可以承受更高的采样保留率，成本不会线性增长。

---

## 10. 性能优化与最佳实践

### 10.1 OTel Agent 优化

```bash
# 限制 Agent 自身资源消耗
export OTEL_BSP_MAX_QUEUE_SIZE=2048
export OTEL_BSP_MAX_EXPORT_BATCH_SIZE=512
export OTEL_BSP_SCHEDULE_DELAY=5000
export OTEL_METRIC_EXPORT_INTERVAL=30000

# 生产环境合理采样率
export OTEL_TRACES_SAMPLER=traceidratio
export OTEL_TRACES_SAMPLER_ARG=0.1
```

### 10.2 Collector 性能优化

```yaml
processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
    send_batch_max_size: 2048

  memory_limiter:
    check_interval: 1s
    limit_mib: 1024
    spike_limit_mib: 256
```

### 10.3 LGTM 最佳实践清单

- **采样策略**：SDK 层 10% 头部采样 + Collector 层 100% 保留错误和慢请求
- **批量导出**：使用 BatchSpanProcessor，减少网络 RPC 次数
- **异步处理**：所有 Exporter 使用异步模式，不阻塞业务线程
- **资源标签标准化**：统一 `service.name`、`deployment.environment` 命名规范
- **Collector 高可用**：部署多实例 + 负载均衡，避免单点故障

---

## 11. Spring Boot 3.x 原生集成

### 11.1 添加依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-tracing-bridge-otel</artifactId>
    </dependency>
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-exporter-otlp</artifactId>
    </dependency>
</dependencies>
```

### 11.2 配置（Spring Boot 3.x 原生属性）

```yaml
# application.yml
management:
  tracing:
    sampling:
      probability: 0.1

  otlp:
    tracing:
      endpoint: http://otel-collector:4318/v1/traces
    metrics:
      export:
        enabled: true
        endpoint: http://otel-collector:4318/v1/metrics

  metrics:
    tags:
      service: order-service
      environment: production
```

---

## 12. 面试要点

**Q1：OTel 在 LGTM 体系中扮演什么角色？**

OTel 是统一数据采集标准，应用通过 OTel SDK/Agent + OTLP 协议将 Traces/Metrics/Logs 统一发送到 Collector，再由 Collector 分发到 Loki、Tempo、Mimir。核心价值是"一次埋点，全栈覆盖"。

**Q2：为什么 LGTM 推荐 OTLP 而非 Jaeger/Prometheus 原生协议？**

OTLP 是统一协议，LGTM 全栈（Loki/Tempo/Mimir）均已原生支持 OTLP 接收。使用 OTLP 可以简化 Collector 配置，减少协议转换损耗。

**Q3：头部采样和尾部采样的区别？LGTM 推荐哪种？**

- 头部采样：在 Trace 开始时决策（SDK 层面），10% 概率采样
- 尾部采样：在 Trace 结束后决策（Collector 层面），可 100% 保留错误和慢请求
- LGTM 推荐组合使用：SDK 层头部采样 + Collector 层尾部采样，Tempo 的对象存储特性使尾部采样成本可控

**Q4：OTel Collector 如何实现到 LGTM 的数据分发？**

通过 Pipeline 配置：Traces 管道 → otlp/tempo exporter，Metrics 管道 → prometheusremotewrite exporter（Mimir），Logs 管道 → otlphttp/loki exporter。

**Q5：如何确保 TraceId 在 Loki 和 Tempo 之间关联？**

OTel Collector 同时将 TraceId 写入 Tempo（作为 Trace ID）和 Loki（作为日志属性 Label），Grafana 自动通过 TraceId 实现 Loki 日志 ↔ Tempo Trace 的联动跳转。

---

## 13. 参考资料

**官方文档**：
- [OpenTelemetry 官方文档](https://opentelemetry.io/docs/)
- [OTel Java Instrumentation](https://opentelemetry.io/docs/instrumentation/java/)
- [OTel Collector](https://opentelemetry.io/docs/collector/)
- [Grafana LGTM + OTel 集成指南](https://grafana.com/docs/opentelemetry/)

---

**下一章预告**：第 34 章将学习 Grafana Tempo 分布式链路追踪，包括 Tempo 架构设计、部署方式、OTel Collector 对接、TraceQL 查询语言、低成本存储原理、服务依赖图生成等内容。

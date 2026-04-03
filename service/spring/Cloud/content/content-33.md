# 第 33 章：OpenTelemetry 统一可观测性标准

> **学习目标**：理解 OpenTelemetry 标准化价值、掌握 OTel 自动埋点与手动埋点、能够配置 OTel Collector 数据管道、具备多后端切换能力  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. OpenTelemetry 架构与核心概念

### 1.1 OpenTelemetry 简介

**OpenTelemetry（OTel）**：统一的可观测性标准，提供 API、SDK 和工具来采集、处理和导出遥测数据。

**核心价值**：
- ✅ 统一标准（Traces/Metrics/Logs）
- ✅ 厂商中立（避免供应商锁定）
- ✅ 语言无关（支持多种编程语言）
- ✅ 自动埋点（零代码侵入）
- ✅ 灵活导出（支持多种后端）

### 1.2 架构设计

```
应用程序
    ↓
OpenTelemetry API/SDK
    ├─ Traces（链路追踪）
    ├─ Metrics（指标监控）
    └─ Logs（日志记录）
    ↓
OTel Collector（可选）
    ├─ Receivers（接收器）
    ├─ Processors（处理器）
    └─ Exporters（导出器）
    ↓
后端系统
    ├─ Jaeger（链路追踪）
    ├─ Prometheus（指标监控）
    ├─ Elasticsearch（日志存储）
    ├─ SkyWalking（APM）
    └─ Grafana（可视化）
```

### 1.3 核心组件

**1. API**：定义遥测数据的接口
**2. SDK**：API 的实现
**3. Instrumentation**：自动埋点库
**4. Collector**：数据收集和处理
**5. Exporters**：数据导出到后端

---

## 2. 三大可观测性信号（Traces/Metrics/Logs）

### 2.1 Traces（链路追踪）

**概念**：记录请求在分布式系统中的完整路径。

**核心要素**：
- **Trace**：一次完整的请求链路
- **Span**：链路中的一个操作单元
- **Context**：跨服务传播的上下文信息

**数据模型**：

```json
{
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "parentSpanId": "0000000000000000",
  "name": "GET /api/orders",
  "kind": "SERVER",
  "startTime": "2024-01-01T00:00:00.000Z",
  "endTime": "2024-01-01T00:00:01.234Z",
  "attributes": {
    "http.method": "GET",
    "http.url": "/api/orders",
    "http.status_code": 200
  },
  "events": [
    {
      "name": "查询数据库",
      "timestamp": "2024-01-01T00:00:00.500Z"
    }
  ]
}
```

### 2.2 Metrics（指标监控）

**概念**：数值型数据，用于监控系统性能和健康状态。

**指标类型**：
- **Counter**：计数器（只增不减）
- **Gauge**：仪表盘（可增可减）
- **Histogram**：直方图（分布统计）
- **Summary**：摘要（分位数统计）

**数据模型**：

```json
{
  "name": "http_requests_total",
  "description": "HTTP请求总数",
  "unit": "1",
  "type": "Counter",
  "dataPoints": [
    {
      "attributes": {
        "method": "GET",
        "status": "200"
      },
      "value": 12345,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2.3 Logs（日志记录）

**概念**：结构化的事件记录。

**数据模型**：

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "severityText": "INFO",
  "body": "订单创建成功",
  "attributes": {
    "orderId": "123456",
    "userId": "789"
  },
  "resource": {
    "service.name": "order-service"
  }
}
```

---

## 3. OTel Java Agent 自动埋点

### 3.1 下载 Java Agent

```bash
# 下载 OpenTelemetry Java Agent
wget https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v1.32.0/opentelemetry-javaagent.jar
```

### 3.2 配置 Java Agent

```bash
# 启动应用时添加 -javaagent 参数
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.service.name=order-service \
     -Dotel.traces.exporter=otlp \
     -Dotel.metrics.exporter=otlp \
     -Dotel.logs.exporter=otlp \
     -Dotel.exporter.otlp.endpoint=http://localhost:4317 \
     -jar order-service.jar
```

### 3.3 配置文件方式

**application.yml**：

```yaml
# 使用环境变量配置
otel:
  service:
    name: ${OTEL_SERVICE_NAME:order-service}
  
  traces:
    exporter: ${OTEL_TRACES_EXPORTER:otlp}
  
  metrics:
    exporter: ${OTEL_METRICS_EXPORTER:otlp}
  
  exporter:
    otlp:
      endpoint: ${OTEL_EXPORTER_OTLP_ENDPOINT:http://localhost:4317}
      protocol: ${OTEL_EXPORTER_OTLP_PROTOCOL:grpc}
```

### 3.4 自动埋点支持的框架

**支持的库和框架**：
- ✅ Spring Boot / Spring MVC / Spring WebFlux
- ✅ JDBC / Hibernate / MyBatis
- ✅ HTTP Client（OkHttp、Apache HttpClient）
- ✅ Kafka / RabbitMQ / Redis
- ✅ gRPC / Dubbo
- ✅ Servlet / Netty
- ✅ Logging（Logback、Log4j2）

---

## 4. OTel SDK 手动埋点与 API

### 4.1 添加依赖

```xml
<dependencies>
    <!-- OpenTelemetry API -->
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-api</artifactId>
        <version>1.32.0</version>
    </dependency>
    
    <!-- OpenTelemetry SDK -->
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-sdk</artifactId>
        <version>1.32.0</version>
    </dependency>
    
    <!-- OTLP Exporter -->
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-exporter-otlp</artifactId>
        <version>1.32.0</version>
    </dependency>
</dependencies>
```

### 4.2 手动创建 Span

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final Tracer tracer;
    
    public Order createOrder(OrderDTO dto) {
        // 创建 Span
        Span span = tracer.spanBuilder("createOrder")
            .setSpanKind(SpanKind.INTERNAL)
            .startSpan();
        
        try (Scope scope = span.makeCurrent()) {
            // 添加属性
            span.setAttribute("order.userId", dto.getUserId());
            span.setAttribute("order.amount", dto.getAmount().doubleValue());
            
            // 业务逻辑
            Order order = saveOrder(dto);
            
            // 添加事件
            span.addEvent("订单创建成功", 
                Attributes.of(
                    AttributeKey.stringKey("orderId"), order.getId().toString()
                ));
            
            return order;
            
        } catch (Exception e) {
            // 记录异常
            span.recordException(e);
            span.setStatus(StatusCode.ERROR, "订单创建失败");
            throw e;
            
        } finally {
            // 结束 Span
            span.end();
        }
    }
}
```

### 4.3 自定义 Metrics

```java
@Component
public class OrderMetrics {
    
    private final Meter meter;
    private final LongCounter orderCounter;
    private final DoubleHistogram orderAmountHistogram;
    
    public OrderMetrics(OpenTelemetry openTelemetry) {
        this.meter = openTelemetry.getMeter("order-service");
        
        // 计数器：订单总数
        this.orderCounter = meter
            .counterBuilder("order.created.total")
            .setDescription("订单创建总数")
            .setUnit("1")
            .build();
        
        // 直方图：订单金额分布
        this.orderAmountHistogram = meter
            .histogramBuilder("order.amount")
            .setDescription("订单金额分布")
            .setUnit("CNY")
            .build();
    }
    
    public void recordOrderCreated(Order order) {
        // 增加计数
        orderCounter.add(1, 
            Attributes.of(
                AttributeKey.stringKey("status"), order.getStatus().name()
            ));
        
        // 记录金额
        orderAmountHistogram.record(order.getAmount().doubleValue(),
            Attributes.of(
                AttributeKey.stringKey("userId"), order.getUserId().toString()
            ));
    }
}
```

---

## 5. Span、Trace、Context 传播机制

### 5.1 Span 父子关系

```java
@Service
public class OrderService {
    
    private final Tracer tracer;
    
    public Order createOrder(OrderDTO dto) {
        // 父 Span
        Span parentSpan = tracer.spanBuilder("createOrder")
            .setSpanKind(SpanKind.INTERNAL)
            .startSpan();
        
        try (Scope scope = parentSpan.makeCurrent()) {
            
            // 子 Span 1：保存订单
            Span saveSpan = tracer.spanBuilder("saveOrder")
                .setParent(Context.current())  // 自动关联父 Span
                .startSpan();
            
            try {
                Order order = saveOrder(dto);
                saveSpan.end();
                
                // 子 Span 2：扣减库存
                Span inventorySpan = tracer.spanBuilder("deductInventory")
                    .setParent(Context.current())
                    .startSpan();
                
                try {
                    deductInventory(order);
                } finally {
                    inventorySpan.end();
                }
                
                return order;
                
            } catch (Exception e) {
                saveSpan.recordException(e);
                throw e;
            }
            
        } finally {
            parentSpan.end();
        }
    }
}
```

### 5.2 跨服务 Context 传播

**HTTP 请求传播**：

```java
// 自动传播（Java Agent 自动处理）
// 通过 HTTP Header 传播：
// traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
// tracestate: ...

// 手动传播
@Component
public class HttpClientInterceptor implements ClientHttpRequestInterceptor {
    
    @Override
    public ClientHttpResponse intercept(
            HttpRequest request, 
            byte[] body, 
            ClientHttpRequestExecution execution) throws IOException {
        
        // 注入当前 Span 信息到 Header
        TextMapPropagator propagator = GlobalOpenTelemetry.getPropagators()
            .getTextMapPropagator();
        
        propagator.inject(Context.current(), request.getHeaders(), 
            (headers, key, value) -> headers.add(key, value));
        
        return execution.execute(request, body);
    }
}
```

**消息队列传播**：

```java
@Service
public class OrderProducer {
    
    private final StreamBridge streamBridge;
    
    public void sendOrder(Order order) {
        // 创建消息
        Message<Order> message = MessageBuilder
            .withPayload(order)
            .build();
        
        // 注入 Trace Context 到消息头
        TextMapPropagator propagator = GlobalOpenTelemetry.getPropagators()
            .getTextMapPropagator();
        
        MessageHeaderAccessor accessor = new MessageHeaderAccessor();
        propagator.inject(Context.current(), accessor, 
            (headers, key, value) -> headers.setHeader(key, value));
        
        Message<Order> enrichedMessage = MessageBuilder
            .fromMessage(message)
            .copyHeaders(accessor.toMessageHeaders())
            .build();
        
        streamBridge.send("order-out-0", enrichedMessage);
    }
}
```

---

## 6. OTel Collector 数据收集与处理

### 6.1 Collector 架构

```
Receivers（接收器）
    ├─ OTLP Receiver
    ├─ Jaeger Receiver
    ├─ Zipkin Receiver
    └─ Prometheus Receiver
    ↓
Processors（处理器）
    ├─ Batch Processor（批处理）
    ├─ Attributes Processor（属性处理）
    ├─ Resource Processor（资源处理）
    └─ Tail Sampling Processor（尾部采样）
    ↓
Exporters（导出器）
    ├─ OTLP Exporter
    ├─ Jaeger Exporter
    ├─ Prometheus Exporter
    └─ Logging Exporter
```

### 6.2 Collector 配置

**config.yaml**：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  
  prometheus:
    config:
      scrape_configs:
        - job_name: 'otel-collector'
          scrape_interval: 10s
          static_configs:
            - targets: ['localhost:8888']

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
  
  attributes:
    actions:
      - key: environment
        value: production
        action: upsert
  
  resource:
    attributes:
      - key: service.instance.id
        value: ${env:HOSTNAME}
        action: upsert
  
  tail_sampling:
    decision_wait: 10s
    num_traces: 100
    expected_new_traces_per_sec: 10
    policies:
      - name: errors-policy
        type: status_code
        status_code:
          status_codes: [ERROR]
      
      - name: slow-traces-policy
        type: latency
        latency:
          threshold_ms: 1000
      
      - name: probabilistic-policy
        type: probabilistic
        probabilistic:
          sampling_percentage: 10

exporters:
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  
  prometheus:
    endpoint: "0.0.0.0:8889"
  
  logging:
    loglevel: debug
  
  elasticsearch:
    endpoints: ["http://elasticsearch:9200"]
    logs_index: "otel-logs"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, attributes, tail_sampling]
      exporters: [otlp/jaeger, logging]
    
    metrics:
      receivers: [otlp, prometheus]
      processors: [batch, resource]
      exporters: [prometheus, logging]
    
    logs:
      receivers: [otlp]
      processors: [batch, attributes]
      exporters: [elasticsearch, logging]
  
  telemetry:
    logs:
      level: "info"
    metrics:
      address: "0.0.0.0:8888"
```

### 6.3 部署 Collector

**Docker Compose**：

```yaml
version: '3'
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.91.0
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "8888:8888"   # Prometheus metrics
      - "8889:8889"   # Prometheus exporter
```

---

## 7. 多后端导出器（OTLP/Jaeger/Prometheus/Zipkin）

### 7.1 导出到 Jaeger

**配置**：

```yaml
exporters:
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
```

### 7.2 导出到 Prometheus

**配置**：

```yaml
exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
    namespace: "otel"
    const_labels:
      environment: "production"

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

**Prometheus 配置**：

```yaml
scrape_configs:
  - job_name: 'otel-collector'
    scrape_interval: 15s
    static_configs:
      - targets: ['otel-collector:8889']
```

### 7.3 导出到 Elasticsearch

```yaml
exporters:
  elasticsearch:
    endpoints: ["http://elasticsearch:9200"]
    logs_index: "otel-logs-%{+yyyy.MM.dd}"
    traces_index: "otel-traces-%{+yyyy.MM.dd}"
    metrics_index: "otel-metrics-%{+yyyy.MM.dd}"

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [elasticsearch]
```

---

## 8. 资源属性与语义约定（Semantic Conventions）

### 8.1 资源属性

**资源**：描述产生遥测数据的实体。

```java
@Bean
public OpenTelemetry openTelemetry() {
    Resource resource = Resource.create(
        Attributes.of(
            // 服务信息
            ResourceAttributes.SERVICE_NAME, "order-service",
            ResourceAttributes.SERVICE_VERSION, "1.0.0",
            ResourceAttributes.SERVICE_NAMESPACE, "production",
            ResourceAttributes.SERVICE_INSTANCE_ID, getHostname(),
            
            // 部署信息
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT, "production",
            
            // 主机信息
            ResourceAttributes.HOST_NAME, getHostname(),
            ResourceAttributes.HOST_ARCH, getHostArch(),
            
            // 容器信息
            ResourceAttributes.CONTAINER_NAME, getContainerName(),
            ResourceAttributes.CONTAINER_ID, getContainerId(),
            
            // Kubernetes 信息
            ResourceAttributes.K8S_POD_NAME, getPodName(),
            ResourceAttributes.K8S_NAMESPACE_NAME, getNamespace()
        )
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

### 8.2 语义约定

**HTTP 语义约定**：

```java
span.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
span.setAttribute(SemanticAttributes.HTTP_URL, "/api/orders");
span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, 200);
span.setAttribute(SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH, 1024L);
span.setAttribute(SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH, 2048L);
```

**数据库语义约定**：

```java
span.setAttribute(SemanticAttributes.DB_SYSTEM, "mysql");
span.setAttribute(SemanticAttributes.DB_NAME, "order_db");
span.setAttribute(SemanticAttributes.DB_STATEMENT, "SELECT * FROM orders WHERE id = ?");
span.setAttribute(SemanticAttributes.DB_OPERATION, "SELECT");
```

---

## 9. 采样策略（头部采样/尾部采样）

### 9.1 头部采样

**在 Trace 开始时决定是否采样**：

```java
@Bean
public Sampler sampler() {
    // 1. 始终采样
    return Sampler.alwaysOn();
    
    // 2. 从不采样
    return Sampler.alwaysOff();
    
    // 3. 概率采样（10%）
    return Sampler.traceIdRatioBased(0.1);
    
    // 4. 父级采样
    return Sampler.parentBased(Sampler.traceIdRatioBased(0.1));
}
```

### 9.2 尾部采样

**在 Trace 结束后决定是否保留**：

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100
    policies:
      # 策略1：保留所有错误
      - name: errors-policy
        type: status_code
        status_code:
          status_codes: [ERROR]
      
      # 策略2：保留慢请求（>1秒）
      - name: slow-traces
        type: latency
        latency:
          threshold_ms: 1000
      
      # 策略3：10% 概率采样
      - name: probabilistic
        type: probabilistic
        probabilistic:
          sampling_percentage: 10
      
      # 策略4：特定服务100%采样
      - name: critical-service
        type: string_attribute
        string_attribute:
          key: service.name
          values: ["payment-service"]
```

---

## 10. 性能优化与最佳实践

### 10.1 批处理

```yaml
processors:
  batch:
    timeout: 10s              # 批次超时时间
    send_batch_size: 1024     # 批次大小
    send_batch_max_size: 2048 # 最大批次大小
```

### 10.2 异步导出

```java
@Bean
public OpenTelemetry openTelemetry() {
    return OpenTelemetrySdk.builder()
        .setTracerProvider(
            SdkTracerProvider.builder()
                .addSpanProcessor(
                    BatchSpanProcessor.builder(
                        OtlpGrpcSpanExporter.builder()
                            .setEndpoint("http://localhost:4317")
                            .build()
                    )
                    .setScheduleDelay(Duration.ofSeconds(1))
                    .setMaxQueueSize(2048)
                    .setMaxExportBatchSize(512)
                    .build()
                )
                .build()
        )
        .build();
}
```

### 10.3 最佳实践

**1. 合理采样**：
- 生产环境：10%-50% 采样
- 错误和慢请求：100% 采样

**2. 批量导出**：
- 减少网络开销
- 提高吞吐量

**3. 异步处理**：
- 避免阻塞业务逻辑
- 使用队列缓冲

**4. 资源限制**：
```yaml
processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
    spike_limit_mib: 128
```

---

## 11. Spring Boot 3.x 原生集成

### 11.1 添加依赖

```xml
<dependencies>
    <!-- Spring Boot 3.x Actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Micrometer Tracing -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-tracing-bridge-otel</artifactId>
    </dependency>
    
    <!-- OTLP Exporter -->
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-exporter-otlp</artifactId>
    </dependency>
</dependencies>
```

### 11.2 配置

```yaml
management:
  tracing:
    sampling:
      probability: 0.1  # 10% 采样
  
  otlp:
    tracing:
      endpoint: http://localhost:4318/v1/traces
  
  metrics:
    export:
      otlp:
        enabled: true
        endpoint: http://localhost:4318/v1/metrics
```

---

## 12. 面试要点

**Q1：OpenTelemetry 的核心价值是什么？**

统一的可观测性标准，厂商中立，支持 Traces/Metrics/Logs 三大信号。

**Q2：什么是 Span 和 Trace？**

- Trace：一次完整的请求链路
- Span：链路中的一个操作单元

**Q3：头部采样和尾部采样的区别？**

- 头部采样：在 Trace 开始时决定
- 尾部采样：在 Trace 结束后决定（可保留所有错误和慢请求）

**Q4：OTel Collector 的作用？**

数据收集、处理和导出，支持多种接收器和导出器。

**Q5：如何实现跨服务的链路追踪？**

通过 Context Propagation，在 HTTP Header 或消息头中传播 TraceId 和 SpanId。

---

## 13. 参考资料

**官方文档**：
- [OpenTelemetry 官方文档](https://opentelemetry.io/docs/)
- [OTel Java](https://opentelemetry.io/docs/instrumentation/java/)
- [OTel Collector](https://opentelemetry.io/docs/collector/)

---

**下一章预告**：第 34 章将学习 SkyWalking 分布式链路追踪，包括 SkyWalking 架构设计、服务端部署、接收 OTel 数据、链路追踪原理、拓扑图分析、告警配置等内容。

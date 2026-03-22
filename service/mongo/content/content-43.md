# 统一日志与审计链路

## 概述

在微服务体系中，MongoDB 操作的可观测性需要与整体链路追踪系统集成，实现从应用层到数据库层的全链路追踪，以及完善的审计日志体系。

---

## MongoDB 驱动命令监听器

```java
@Component
public class MongoCommandLogger implements CommandListener {

    private static final Logger log = LoggerFactory.getLogger("mongodb.commands");
    private static final long SLOW_QUERY_MS = 100;

    @Override
    public void commandSucceeded(CommandSucceededEvent event) {
        long elapsedMs = event.getElapsedTime(TimeUnit.MILLISECONDS);
        if (elapsedMs > SLOW_QUERY_MS) {
            log.warn("[MongoDB 慢查询] command={} db={} elapsed={}ms requestId={}",
                event.getCommandName(),
                event.getDatabaseName(),
                elapsedMs,
                event.getRequestId()
            );
        } else {
            log.debug("[MongoDB] command={} elapsed={}ms",
                event.getCommandName(), elapsedMs);
        }
    }

    @Override
    public void commandFailed(CommandFailedEvent event) {
        log.error("[MongoDB 命令失败] command={} db={} elapsed={}ms error={}",
            event.getCommandName(),
            event.getDatabaseName(),
            event.getElapsedTime(TimeUnit.MILLISECONDS),
            event.getThrowable().getMessage()
        );
    }

    @Override
    public void commandStarted(CommandStartedEvent event) {
        // 可选：记录命令开始（通常只记录结果）
    }
}

// 注册监听器
@Bean
public MongoClient mongoClient(MongoCommandLogger commandLogger) {
    MongoClientSettings settings = MongoClientSettings.builder()
        .applyConnectionString(new ConnectionString(mongoUri))
        .addCommandListener(commandLogger)
        .build();
    return MongoClients.create(settings);
}
```

---

## OpenTelemetry 链路追踪集成

```xml
<dependency>
  <groupId>io.opentelemetry.instrumentation</groupId>
  <artifactId>opentelemetry-mongo-driver-4.0</artifactId>
</dependency>
<dependency>
  <groupId>io.opentelemetry</groupId>
  <artifactId>opentelemetry-sdk</artifactId>
</dependency>
```

```java
@Bean
public MongoClient mongoClient() {
    // OTel 自动为每个 MongoDB 命令创建 Span
    MongoTelemetry mongoTelemetry = MongoTelemetry.builder(
        GlobalOpenTelemetry.get()
    ).build();

    MongoClientSettings settings = MongoClientSettings.builder()
        .applyConnectionString(new ConnectionString(mongoUri))
        .addCommandListener(mongoTelemetry.newCommandListener())
        .build();

    return MongoClients.create(settings);
}
```

```yaml
# application.yml - OTel 配置
management:
  tracing:
    sampling:
      probability: 1.0  # 100% 采样（生产可降至 0.1）
  otlp:
    tracing:
      endpoint: http://jaeger:4318/v1/traces
```

```
链路追踪效果（Jaeger/Zipkin 中可见）：

HTTP POST /api/orders  (50ms)
  └── OrderService.createOrder  (48ms)
        ├── MongoDB.insert orders  (5ms)    ← MongoDB Span
        ├── MongoDB.update inventory  (3ms) ← MongoDB Span
        └── Kafka.produce order-events  (2ms)
```

---

## 慢查询日志统一采集

```yaml
# Filebeat 配置：采集 MongoDB 慢查询日志
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/mongodb/mongod.log
    multiline.pattern: '^\.'
    multiline.negate: true
    multiline.match: after
    fields:
      service: mongodb
      env: production
    fields_under_root: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "mongodb-logs-%{+yyyy.MM.dd}"
```

```
MongoDB 慢查询日志格式（JSON 结构化）：
{
  "t": { "$date": "2024-01-15T10:30:00Z" },
  "s": "W",
  "c": "COMMAND",
  "ctx": "conn123",
  "msg": "Slow query",
  "attr": {
    "type": "command",
    "ns": "ecommerce.orders",
    "command": { "find": "orders", "filter": { "status": "pending" } },
    "planSummary": "COLLSCAN",
    "millis": 3500,
    "keysExamined": 0,
    "docsExamined": 1000000,
    "nreturned": 5
  }
}
```

### Logstash 解析 MongoDB 日志

```ruby
# logstash.conf
filter {
  if [service] == "mongodb" {
    json { source => "message" }
    # 提取关键指标
    mutate {
      add_field => {
        "mongo_millis" => "%{[attr][millis]}"
        "mongo_ns" => "%{[attr][ns]}"
        "mongo_plan" => "%{[attr][planSummary]}"
        "mongo_docs_examined" => "%{[attr][docsExamined]}"
      }
    }
  }
}
```

---

## MongoDB 审计日志

### Enterprise 版审计配置

```yaml
# mongod.conf（Enterprise 版）
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.log
  filter: |
    {
      atype: {
        $in: [
          "authenticate",
          "logout",
          "createCollection",
          "dropCollection",
          "createIndex",
          "dropIndex",
          "insert",
          "update",
          "delete",
          "find",
          "createUser",
          "dropUser",
          "grantRolesToUser"
        ]
      }
    }
```

### 社区版替代方案：应用层审计

```java
// AOP 实现应用层审计
@Aspect
@Component
@Slf4j
public class MongoAuditAspect {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Around("execution(* org.springframework.data.mongodb.core.MongoTemplate.save(..))" +
            "|| execution(* org.springframework.data.mongodb.core.MongoTemplate.remove(..))")
    public Object auditWrite(ProceedingJoinPoint pjp) throws Throwable {
        String operator = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        String traceId = MDC.get("traceId");

        Object result = pjp.proceed();

        // 异步写审计日志
        AuditLog audit = AuditLog.builder()
            .operator(operator)
            .operation(pjp.getSignature().getName())
            .target(pjp.getArgs()[0].getClass().getSimpleName())
            .traceId(traceId)
            .timestamp(LocalDateTime.now())
            .build();
        auditLogRepository.save(audit);

        return result;
    }
}
```

---

## Kibana / Grafana 可视化

```
Kibana Dashboard 推荐面板：
  - 慢查询趋势（millis > 100ms 的查询数量/时间）
  - 全表扫描分布（planSummary: COLLSCAN 的查询）
  - 慢查询 Top 10 命名空间
  - 错误率趋势

Grafana + Prometheus 推荐面板：
  - MongoDB QPS（按操作类型）
  - 副本集延迟
  - Cache 使用率
  - 连接数趋势
```

---

## 分布式追踪中的 MongoDB Span

```
标准 MongoDB Span 属性（OTel 规范）：
  db.system = "mongodb"
  db.name = "ecommerce"
  db.operation = "find"
  db.mongodb.collection = "orders"
  net.peer.name = "mongo1"
  net.peer.port = 27017
```

---

## 总结

- `CommandListener` 是 MongoDB 驱动的埋点切入点，可记录所有命令耗时
- OTel + MongoDB instrumentation 实现零侵入链路追踪
- 慢查询日志通过 Filebeat → ELK 集中收集分析
- Enterprise 版内置审计，社区版用 AOP 实现应用层审计
- Grafana + Prometheus 构建 MongoDB 运行时监控大屏

**下一步**：高并发订单与库存场景建模。

# 消息追踪与审计

## 概述

消息追踪能够记录消息的完整生命周期，便于问题排查和审计。本章介绍消息追踪的实现方法。

---

## 1. 消息 ID 设计与传递

### 1.1 全局唯一消息ID

```java
@Data
public class TraceableMessage<T> {
    
    private String messageId;
    private String traceId;
    private String spanId;
    private Long timestamp;
    private T payload;
    
    public TraceableMessage(T payload) {
        this.messageId = UUID.randomUUID().toString();
        this.traceId = MDC.get("traceId");
        this.spanId = UUID.randomUUID().toString();
        this.timestamp = System.currentTimeMillis();
        this.payload = payload;
    }
}
```

### 1.2 消息ID传递

```java
// 生产者
public void sendMessage(Order order) {
    TraceableMessage<Order> message = new TraceableMessage<>(order);
    
    // 记录发送日志
    log.info("Sending message: {}", message.getMessageId());
    
    kafkaTemplate.send("orders", message);
}

// 消费者
@KafkaListener(topics = "orders")
public void listen(TraceableMessage<Order> message) {
    // 设置MDC
    MDC.put("messageId", message.getMessageId());
    MDC.put("traceId", message.getTraceId());
    
    try {
        processOrder(message.getPayload());
        log.info("Message processed successfully");
    } finally {
        MDC.clear();
    }
}
```

---

## 2. 链路追踪（Trace ID、Span ID）

### 2.1 Sleuth集成

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>
```

```java
@Service
public class OrderService {
    
    @NewSpan("create-order")
    public void createOrder(Order order) {
        // Sleuth自动生成Trace ID和Span ID
        
        kafkaTemplate.send("orders", order);
        // Trace ID自动传递到消息头
    }
}

@Component
public class OrderListener {
    
    @KafkaListener(topics = "orders")
    @ContinueSpan
    public void listen(Order order) {
        // Sleuth自动继续Trace
        processOrder(order);
    }
}
```

### 2.2 自定义追踪

```java
@Component
public class MessageTracingInterceptor implements ProducerInterceptor<String, Object> {
    
    @Override
    public ProducerRecord<String, Object> onSend(ProducerRecord<String, Object> record) {
        // 添加追踪头
        Headers headers = record.headers();
        headers.add("traceId", MDC.get("traceId").getBytes());
        headers.add("spanId", UUID.randomUUID().toString().getBytes());
        headers.add("timestamp", String.valueOf(System.currentTimeMillis()).getBytes());
        
        return record;
    }
}
```

---

## 3. Kafka 消息追踪方案

### 3.1 拦截器追踪

```java
@Configuration
public class KafkaTracingConfig {
    
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.INTERCEPTOR_CLASSES_CONFIG, 
            MessageTracingInterceptor.class.getName());
        return new DefaultKafkaProducerFactory<>(props);
    }
}
```

### 3.2 日志追踪

```java
@Aspect
@Component
public class MessageTracingAspect {
    
    @Around("@annotation(org.springframework.kafka.annotation.KafkaListener)")
    public Object trace(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        
        try {
            Object result = pjp.proceed();
            long duration = System.currentTimeMillis() - start;
            
            log.info("Message processed in {}ms", duration);
            return result;
        } catch (Exception e) {
            log.error("Message processing failed", e);
            throw e;
        }
    }
}
```

---

## 4. RocketMQ 消息轨迹

### 4.1 启用消息轨迹

```java
DefaultMQProducer producer = new DefaultMQProducer("producer-group", true);
// 第二个参数true表示启用消息轨迹

DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group", true);
```

### 4.2 查询消息轨迹

```bash
# 按消息ID查询轨迹
mqadmin queryMsgTraceById -n localhost:9876 -i <msgId>

# 输出：
# 1. 生产轨迹
#    - Producer IP: 192.168.1.100
#    - Send Time: 2024-01-01 12:00:00
#    - Send Result: SEND_OK
#
# 2. 存储轨迹
#    - Broker: broker-a
#    - Queue: 3
#    - Offset: 12345
#
# 3. 消费轨迹
#    - Consumer Group: my-group
#    - Consumer IP: 192.168.1.101
#    - Consume Time: 2024-01-01 12:00:01
#    - Consume Result: SUCCESS
```

---

## 5. RabbitMQ Firehose 插件

### 5.1 启用Firehose

```bash
# 启用Firehose插件
rabbitmq-plugins enable rabbitmq_tracing

# 添加追踪
rabbitmqctl trace_on

# 查看追踪
rabbitmqctl trace_on -p /
```

---

## 6. 日志收集与分析（ELK）

### 6.1 日志格式

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "traceId": "abc123",
  "spanId": "def456",
  "messageId": "msg-001",
  "topic": "orders",
  "partition": 0,
  "offset": 12345,
  "event": "message.sent",
  "duration": 10,
  "status": "success"
}
```

### 6.2 Logstash配置

```conf
input {
  kafka {
    bootstrap_servers => "localhost:9092"
    topics => ["message-trace"]
    codec => json
  }
}

filter {
  if [event] == "message.sent" {
    mutate {
      add_field => { "stage" => "producer" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "message-trace-%{+YYYY.MM.dd}"
  }
}
```

---

## 7. 审计日志设计

### 7.1 审计实体

```java
@Entity
public class MessageAuditLog {
    
    @Id
    private Long id;
    
    private String messageId;
    private String topic;
    private String eventType;
    private String userId;
    private String operation;
    private String status;
    private LocalDateTime timestamp;
    private String metadata;
}
```

### 7.2 审计记录

```java
@Component
public class MessageAuditService {
    
    @Autowired
    private MessageAuditLogRepository auditRepository;
    
    @EventListener
    public void onMessageSent(MessageSentEvent event) {
        MessageAuditLog log = new MessageAuditLog();
        log.setMessageId(event.getMessageId());
        log.setTopic(event.getTopic());
        log.setEventType("SENT");
        log.setUserId(getCurrentUserId());
        log.setTimestamp(LocalDateTime.now());
        
        auditRepository.save(log);
    }
}
```

---

## 关键要点

1. **消息ID**：全局唯一，便于追踪
2. **Trace ID**：分布式追踪，关联上下游
3. **RocketMQ轨迹**：原生支持消息轨迹
4. **日志收集**：ELK收集和分析追踪日志
5. **审计日志**：记录关键操作，满足合规要求

---

## 深入一点

**消息追踪完整链路**：

```
1. Producer发送
   - 生成Message ID
   - 生成Trace ID/Span ID
   - 记录发送日志
   - 发送到Broker
   
2. Broker存储
   - 记录存储位置（Partition/Offset）
   - 记录存储时间
   
3. Consumer消费
   - 提取Trace ID
   - 记录消费开始时间
   - 处理消息
   - 记录消费结果
   - 记录消费结束时间
   
4. 日志聚合
   - 收集所有环节日志
   - 按Trace ID关联
   - 可视化展示
```

---

## 参考资料

1. [Spring Cloud Sleuth](https://spring.io/projects/spring-cloud-sleuth)
2. [RocketMQ Message Trace](https://rocketmq.apache.org/docs/featureBehavior/08messagetrack/)
3. [Distributed Tracing](https://opentracing.io/)

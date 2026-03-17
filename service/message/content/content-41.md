# Spring Kafka 基础

## 概述

Spring Kafka 简化了 Kafka 在 Spring 应用中的集成。本章介绍基础配置和使用方法。

---

## 1. 依赖配置

```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
    <version>3.0.0</version>
</dependency>
```

---

## 2. 配置

```yaml
# application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
      acks: all
      retries: 3
    consumer:
      group-id: my-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      enable-auto-commit: false
```

---

## 3. 生产者

```java
@Service
public class KafkaProducerService {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    public void send(String topic, String message) {
        kafkaTemplate.send(topic, message);
    }
    
    // 带回调
    public void sendWithCallback(String topic, String message) {
        kafkaTemplate.send(topic, message)
            .addCallback(
                result -> log.info("发送成功: {}", result.getRecordMetadata().offset()),
                ex -> log.error("发送失败", ex)
            );
    }
}
```

---

## 4. 消费者

```java
@Component
public class KafkaConsumerService {
    
    @KafkaListener(topics = "my-topic", groupId = "my-group")
    public void consume(String message) {
        log.info("收到消息: {}", message);
    }
    
    // 手动ACK
    @KafkaListener(topics = "my-topic")
    public void consumeManual(String message, Acknowledgment acknowledgment) {
        log.info("收到消息: {}", message);
        acknowledgment.acknowledge();
    }
}
```

---

## 5. 消息对象

```java
// 实体类
@Data
public class Order {
    private String orderId;
    private BigDecimal amount;
}

// 生产者
kafkaTemplate.send("orders", JsonUtils.toJson(order));

// 消费者
@KafkaListener(topics = "orders")
public void consume(String json) {
    Order order = JsonUtils.fromJson(json, Order.class);
    processOrder(order);
}
```

---

## 关键要点

1. **KafkaTemplate**：发送消息
2. **@KafkaListener**：消费消息
3. **手动ACK**：enable-auto-commit=false
4. **回调机制**：异步发送结果处理
5. **JSON序列化**：使用 Jackson

---

## 参考资料

1. [Spring Kafka](https://docs.spring.io/spring-kafka/reference/)

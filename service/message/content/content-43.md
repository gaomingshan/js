# Spring RocketMQ 集成

## 概述

RocketMQ Spring Boot Starter 简化了集成。本章介绍配置和使用。

---

## 1. 依赖配置

```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-spring-boot-starter</artifactId>
    <version>2.2.3</version>
</dependency>
```

---

## 2. 配置

```yaml
# application.yml
rocketmq:
  name-server: localhost:9876
  producer:
    group: my-producer-group
    send-message-timeout: 3000
    retry-times-when-send-failed: 2
```

---

## 3. 生产者

```java
@Service
public class RocketMQProducerService {
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    // 同步发送
    public void send(String topic, String message) {
        rocketMQTemplate.convertAndSend(topic, message);
    }
    
    // 异步发送
    public void sendAsync(String topic, String message) {
        rocketMQTemplate.asyncSend(topic, message, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                log.info("发送成功: {}", sendResult.getMsgId());
            }
            
            @Override
            public void onException(Throwable e) {
                log.error("发送失败", e);
            }
        });
    }
    
    // 延迟消息
    public void sendDelayed(String topic, String message) {
        rocketMQTemplate.syncSend(topic, 
            MessageBuilder.withPayload(message).build(), 
            3000, 3);  // 延迟级别3 = 10秒
    }
}
```

---

## 4. 消费者

```java
@Component
@RocketMQMessageListener(
    topic = "my-topic",
    consumerGroup = "my-consumer-group"
)
public class MyConsumer implements RocketMQListener<String> {
    
    @Override
    public void onMessage(String message) {
        log.info("收到消息: {}", message);
    }
}

// 顺序消费
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-consumer",
    consumeMode = ConsumeMode.ORDERLY
)
public class OrderConsumer implements RocketMQListener<String> {
    @Override
    public void onMessage(String message) {
        // 顺序处理
    }
}
```

---

## 5. 事务消息

```java
@RocketMQTransactionListener
public class OrderTransactionListener implements RocketMQLocalTransactionListener {
    
    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            // 执行本地事务
            String orderId = (String) arg;
            orderService.createOrder(orderId);
            return RocketMQLocalTransactionState.COMMIT;
        } catch (Exception e) {
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }
    
    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
        // 事务回查
        String orderId = msg.getHeaders().get("orderId", String.class);
        return orderService.exists(orderId) 
            ? RocketMQLocalTransactionState.COMMIT 
            : RocketMQLocalTransactionState.ROLLBACK;
    }
}

// 发送事务消息
rocketMQTemplate.sendMessageInTransaction("my-topic", 
    MessageBuilder.withPayload("data").build(), 
    "order-123");
```

---

## 关键要点

1. **RocketMQTemplate**：发送消息
2. **@RocketMQMessageListener**：消费消息
3. **ConsumeMode.ORDERLY**：顺序消费
4. **@RocketMQTransactionListener**：事务消息
5. **延迟消息**：syncSend 第4个参数

---

## 参考资料

1. [RocketMQ Spring](https://github.com/apache/rocketmq-spring)

# 事务与 Spring 事务整合

## 概述

消息与数据库事务的一致性是分布式系统的核心问题。本章介绍消息队列与Spring事务的整合方案。

---

## 1. Kafka 事务与 Spring 事务管理

### 1.1 配置

```java
@Configuration
public class KafkaTransactionConfig {
    
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "tx-");
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        return new DefaultKafkaProducerFactory<>(props);
    }
    
    @Bean
    public KafkaTransactionManager kafkaTransactionManager(
            ProducerFactory<String, String> producerFactory) {
        return new KafkaTransactionManager(producerFactory);
    }
}
```

### 1.2 使用

```java
@Service
public class OrderService {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    @Transactional("kafkaTransactionManager")
    public void createOrder(Order order) {
        // 多条消息在同一事务中
        kafkaTemplate.send("orders", order.toString());
        kafkaTemplate.send("audit-log", "Order created: " + order.getId());
        
        // 如果抛出异常，所有消息回滚
    }
}
```

---

## 2. RocketMQ 事务消息与本地事务

### 2.1 配置

```java
@Configuration
public class RocketMQTransactionConfig {
    
    @Bean
    public TransactionListener transactionListener() {
        return new OrderTransactionListener();
    }
}
```

### 2.2 事务监听器

```java
public class OrderTransactionListener implements RocketMQLocalTransactionListener {
    
    @Autowired
    private OrderService orderService;
    
    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            // 执行本地事务
            orderService.createOrder((Order) arg);
            return RocketMQLocalTransactionState.COMMIT;
        } catch (Exception e) {
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }
    
    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
        // 事务回查
        String orderId = msg.getHeaders().get("orderId");
        boolean exists = orderService.exists(orderId);
        return exists ? RocketMQLocalTransactionState.COMMIT 
                     : RocketMQLocalTransactionState.ROLLBACK;
    }
}
```

### 2.3 发送事务消息

```java
@Service
public class OrderService {
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    public void createOrder(Order order) {
        Message<Order> message = MessageBuilder
            .withPayload(order)
            .setHeader("orderId", order.getId())
            .build();
        
        rocketMQTemplate.sendMessageInTransaction("orders", message, order);
    }
}
```

---

## 3. RabbitMQ 事务与 Spring 事务

### 3.1 配置

```java
@Configuration
public class RabbitMQTransactionConfig {
    
    @Bean
    public RabbitTransactionManager rabbitTransactionManager(
            ConnectionFactory connectionFactory) {
        return new RabbitTransactionManager(connectionFactory);
    }
}
```

### 3.2 使用

```java
@Service
public class OrderService {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    @Transactional("rabbitTransactionManager")
    public void createOrder(Order order) {
        rabbitTemplate.convertAndSend("orders", order);
        
        // 事务回滚时，消息不会发送
    }
}
```

---

## 4. @Transactional 注解与消息发送

### 4.1 数据库事务 + 消息发送

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private KafkaTemplate<String, Order> kafkaTemplate;
    
    @Transactional
    public void createOrder(Order order) {
        // 1. 保存数据库
        orderRepository.save(order);
        
        // 2. 发送消息（不在事务中）
        kafkaTemplate.send("orders", order);
        
        // 问题：数据库提交，但消息发送失败
    }
}
```

---

## 5. 本地消息表方案

### 5.1 表结构

```sql
CREATE TABLE local_message (
    id BIGINT PRIMARY KEY,
    topic VARCHAR(100),
    content TEXT,
    status VARCHAR(20),
    retry_count INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 5.2 实现

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private LocalMessageRepository messageRepository;
    
    @Transactional
    public void createOrder(Order order) {
        // 1. 保存订单
        orderRepository.save(order);
        
        // 2. 保存本地消息（同一事务）
        LocalMessage message = new LocalMessage();
        message.setTopic("orders");
        message.setContent(JSON.toJSONString(order));
        message.setStatus("PENDING");
        messageRepository.save(message);
    }
}

@Component
public class MessageSender {
    
    @Scheduled(fixedDelay = 1000)
    public void sendPendingMessages() {
        List<LocalMessage> messages = messageRepository.findByStatus("PENDING");
        
        for (LocalMessage message : messages) {
            try {
                kafkaTemplate.send(message.getTopic(), message.getContent());
                message.setStatus("SENT");
                messageRepository.save(message);
            } catch (Exception e) {
                message.setRetryCount(message.getRetryCount() + 1);
                messageRepository.save(message);
            }
        }
    }
}
```

---

## 6. 最大努力通知

```java
@Service
public class NotificationService {
    
    public void sendNotification(String userId, String message) {
        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++) {
            try {
                kafkaTemplate.send("notifications", message).get(5, TimeUnit.SECONDS);
                return;
            } catch (Exception e) {
                log.warn("Retry {} failed", i + 1);
                Thread.sleep(1000 * (i + 1));
            }
        }
        
        // 失败后记录日志或写入死信队列
        log.error("Failed to send notification after {} retries", maxRetries);
    }
}
```

---

## 7. 最终一致性方案设计

```
方案1：本地消息表
- 数据库事务保证消息持久化
- 定时任务发送消息
- 幂等消费

方案2：RocketMQ事务消息
- 半消息机制
- 本地事务执行
- 事务回查

方案3：Saga模式
- 补偿机制
- 事件驱动
- 最终一致性
```

---

## 关键要点

1. **Kafka事务**：多条消息原子性
2. **RocketMQ事务**：本地事务与消息事务一致性
3. **本地消息表**：数据库与消息最终一致性
4. **最大努力通知**：重试机制
5. **幂等消费**：保证消息不重复处理

---

## 参考资料

1. [Kafka Transactions](https://kafka.apache.org/documentation/#transactions)
2. [RocketMQ Transaction](https://rocketmq.apache.org/docs/featureBehavior/04transactionmessage/)
3. [Spring Transaction Management](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction)

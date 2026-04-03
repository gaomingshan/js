# 第 28 章：Stream Binder 与消息可靠性

> **学习目标**：掌握 Stream 核心配置、理解消息可靠性保证、能够处理消息异常  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. Binder 配置详解

### 1.1 Kafka Binder 核心配置

**完整配置示例**：

```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          # Kafka 集群地址
          brokers: localhost:9092,localhost:9093,localhost:9094
          
          # 自动创建 Topic
          auto-create-topics: true
          
          # 自动添加分区
          auto-add-partitions: true
          
          # 事务配置
          transaction:
            transaction-id-prefix: tx-
            producer:
              configuration:
                transaction.state.log.replication.factor: 1
          
          # 消费者配置
          consumer-properties:
            max.poll.records: 500
            max.poll.interval.ms: 300000
          
          # 生产者配置
          producer-properties:
            acks: all
            retries: 3
            batch.size: 16384
            linger.ms: 1
            compression.type: lz4
          
          # 复制因子
          replication-factor: 3
          
          # 最小同步副本
          min-partition-count: 1
```

### 1.2 RabbitMQ Binder 核心配置

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    virtual-host: /
  
  cloud:
    stream:
      rabbit:
        binder:
          # 连接配置
          connection-name-prefix: stream-
          
          # 管理员用户（用于创建队列等）
          admin-addresses:
            - http://localhost:15672
          
          # 队列配置
          nodes:
            - rabbit@localhost
```

### 1.3 Binding 配置详解

```yaml
spring:
  cloud:
    stream:
      bindings:
        orderConsumer-in-0:
          # 目标（Topic/Exchange）
          destination: order-topic
          
          # 消费者组
          group: order-service
          
          # 内容类型
          content-type: application/json
          
          # Binder 类型（多 Binder 时使用）
          binder: kafka
          
          # 消费者配置
          consumer:
            # 最大重试次数
            max-attempts: 3
            
            # 重试间隔（毫秒）
            back-off-initial-interval: 1000
            
            # 重试间隔倍数
            back-off-multiplier: 2.0
            
            # 最大重试间隔
            back-off-max-interval: 10000
            
            # 并发数
            concurrency: 3
            
            # 分区配置
            partitioned: true
            
            # 实例索引
            instance-index: 0
            
            # 实例数量
            instance-count: 3
          
          # 生产者配置
          producer:
            # 分区数
            partition-count: 3
            
            # 分区键表达式
            partition-key-expression: headers['partitionKey']
            
            # 分区键提取策略
            partition-key-extractor-name: customPartitionKeyExtractor
            
            # 分区选择策略
            partition-selector-name: customPartitionSelector
```

---

## 2. 消息分区策略

### 2.1 为什么需要分区

**问题场景**：

```
场景：订单服务有3个实例
需求：同一用户的订单必须被同一实例处理（保证顺序）

无分区：
- 用户1的订单可能被实例A、B、C随机处理
- 无法保证顺序

有分区：
- 根据 userId 分区
- 用户1的订单固定路由到实例A
- 保证顺序
```

### 2.2 生产者分区配置

```yaml
spring:
  cloud:
    stream:
      bindings:
        order-out-0:
          destination: order-topic
          producer:
            partition-count: 3  # 分区数
            partition-key-expression: payload.userId  # 分区键：用户ID
```

**代码示例**：

```java
@RestController
@RequiredArgsConstructor
public class OrderController {
    
    private final StreamBridge streamBridge;
    
    @PostMapping("/orders")
    public Result<Order> createOrder(@RequestBody OrderDTO dto) {
        Order order = new Order();
        order.setUserId(dto.getUserId());
        order.setProductId(dto.getProductId());
        order.setAmount(dto.getAmount());
        
        // 发送消息（自动根据 userId 分区）
        streamBridge.send("order-out-0", order);
        
        return Result.success(order);
    }
}
```

### 2.3 消费者分区配置

```yaml
spring:
  cloud:
    stream:
      instance-index: ${INSTANCE_INDEX:0}  # 实例索引（0/1/2）
      instance-count: ${INSTANCE_COUNT:3}  # 总实例数
      
      bindings:
        orderConsumer-in-0:
          destination: order-topic
          group: order-service
          consumer:
            partitioned: true  # 启用分区
```

**部署**：

```bash
# 实例0
java -jar order-service.jar --spring.cloud.stream.instance-index=0

# 实例1
java -jar order-service.jar --spring.cloud.stream.instance-index=1

# 实例2
java -jar order-service.jar --spring.cloud.stream.instance-index=2
```

**分区分配**：

```
Topic: order-topic (3个分区)

分区0 → 实例0
分区1 → 实例1
分区2 → 实例2

userId=1 → 分区0 → 实例0
userId=2 → 分区1 → 实例1
userId=3 → 分区2 → 实例2
userId=4 → 分区0 → 实例0
```

### 2.4 自定义分区策略

**自定义分区键提取器**：

```java
@Component("customPartitionKeyExtractor")
public class CustomPartitionKeyExtractor implements PartitionKeyExtractorStrategy {
    
    @Override
    public Object extractKey(Message<?> message) {
        // 从消息中提取分区键
        Order order = (Order) message.getPayload();
        
        // 使用用户ID作为分区键
        return order.getUserId();
    }
}
```

**自定义分区选择器**：

```java
@Component("customPartitionSelector")
public class CustomPartitionSelector implements PartitionSelectorStrategy {
    
    @Override
    public int selectPartition(Object key, int partitionCount) {
        // 根据键选择分区
        Long userId = (Long) key;
        
        // 一致性Hash
        return Math.abs(userId.hashCode()) % partitionCount;
    }
}
```

**配置**：

```yaml
spring:
  cloud:
    stream:
      bindings:
        order-out-0:
          producer:
            partition-count: 3
            partition-key-extractor-name: customPartitionKeyExtractor
            partition-selector-name: customPartitionSelector
```

---

## 3. 消费者组配置

### 3.1 消费者组概念

**消费者组**：一组消费者实例的逻辑分组。

**特性**：
- 同一条消息只会被同一消费者组内的一个实例消费
- 不同消费者组可以重复消费同一条消息

**场景示例**：

```
Topic: order-topic

消费者组1（order-service）：
- 实例A
- 实例B
- 实例C
→ 每条消息只被A/B/C中的一个消费

消费者组2（notification-service）：
- 实例D
- 实例E
→ 每条消息只被D/E中的一个消费

结果：
- 同一条消息被消费2次（组1一次，组2一次）
- 实现了消息的广播
```

### 3.2 配置消费者组

```yaml
spring:
  cloud:
    stream:
      bindings:
        orderConsumer-in-0:
          destination: order-topic
          group: order-service  # 消费者组名称
          
          consumer:
            # 并发消费
            concurrency: 3
            
            # 最大并发
            max-concurrency: 10
```

### 3.3 多个消费者组示例

**订单服务（消费者组1）**：

```yaml
spring:
  application:
    name: order-service
  
  cloud:
    stream:
      bindings:
        orderConsumer-in-0:
          destination: order-topic
          group: order-service  # 组1
```

```java
@Configuration
public class OrderConsumer {
    
    @Bean
    public Consumer<Order> orderConsumer() {
        return order -> {
            log.info("订单服务消费消息：{}", order);
            // 处理订单
        };
    }
}
```

**通知服务（消费者组2）**：

```yaml
spring:
  application:
    name: notification-service
  
  cloud:
    stream:
      bindings:
        orderConsumer-in-0:
          destination: order-topic
          group: notification-service  # 组2
```

```java
@Configuration
public class NotificationConsumer {
    
    @Bean
    public Consumer<Order> orderConsumer() {
        return order -> {
            log.info("通知服务消费消息：{}", order);
            // 发送通知
        };
    }
}
```

---

## 4. 消息确认机制

### 4.1 Kafka 确认机制

**自动确认（默认）**：

```yaml
spring:
  cloud:
    stream:
      kafka:
        bindings:
          orderConsumer-in-0:
            consumer:
              # 自动提交偏移量
              enable-auto-commit: true
              
              # 自动提交间隔
              auto-commit-interval: 5000
```

**手动确认**：

```yaml
spring:
  cloud:
    stream:
      kafka:
        bindings:
          orderConsumer-in-0:
            consumer:
              # 禁用自动提交
              enable-auto-commit: false
              
              # 确认模式
              ack-mode: manual
```

**手动确认代码**：

```java
@Configuration
public class OrderConsumer {
    
    @Bean
    public Consumer<Message<Order>> orderConsumer() {
        return message -> {
            try {
                Order order = message.getPayload();
                log.info("消费消息：{}", order);
                
                // 处理业务逻辑
                processOrder(order);
                
                // 手动确认
                Acknowledgment acknowledgment = message.getHeaders()
                    .get(KafkaHeaders.ACKNOWLEDGMENT, Acknowledgment.class);
                
                if (acknowledgment != null) {
                    acknowledgment.acknowledge();
                    log.info("消息确认成功");
                }
                
            } catch (Exception e) {
                log.error("消息处理失败", e);
                // 不确认，消息会被重新消费
            }
        };
    }
}
```

### 4.2 RabbitMQ 确认机制

**自动确认**：

```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          orderConsumer-in-0:
            consumer:
              # 自动确认
              acknowledge-mode: AUTO
```

**手动确认**：

```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          orderConsumer-in-0:
            consumer:
              # 手动确认
              acknowledge-mode: MANUAL
```

---

## 5. 消息重试与死信队列

### 5.1 重试配置

```yaml
spring:
  cloud:
    stream:
      bindings:
        orderConsumer-in-0:
          destination: order-topic
          group: order-service
          
          consumer:
            # 最大重试次数
            max-attempts: 3
            
            # 初始重试间隔（毫秒）
            back-off-initial-interval: 1000
            
            # 重试间隔倍数
            back-off-multiplier: 2.0
            
            # 最大重试间隔
            back-off-max-interval: 10000
```

**重试过程**：

```
第1次失败：等待1秒后重试
第2次失败：等待2秒后重试（1s * 2）
第3次失败：等待4秒后重试（2s * 2）
第3次重试仍失败：发送到死信队列
```

### 5.2 死信队列配置

**Kafka 死信队列**：

```yaml
spring:
  cloud:
    stream:
      kafka:
        bindings:
          orderConsumer-in-0:
            consumer:
              # 启用 DLQ
              enable-dlq: true
              
              # DLQ 名称
              dlq-name: order-topic-dlq
              
              # DLQ 分区数
              dlq-partitions: 1
```

**RabbitMQ 死信队列**：

```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          orderConsumer-in-0:
            consumer:
              # 启用 DLQ
              auto-bind-dlq: true
              
              # DLQ 名称
              dead-letter-exchange: order-dlx
              dead-letter-queue-name: order-dlq
              
              # DLQ TTL
              dlq-ttl: 3600000  # 1小时
```

### 5.3 死信队列消费

```java
@Configuration
@Slf4j
public class DlqConsumer {
    
    @Bean
    public Consumer<Message<Order>> orderDlqConsumer() {
        return message -> {
            Order order = message.getPayload();
            
            // 获取错误信息
            String errorMessage = (String) message.getHeaders()
                .get("x-exception-message");
            
            log.error("死信队列消息：order={}, error={}", order, errorMessage);
            
            // 处理死信
            // 1. 记录到数据库
            // 2. 发送告警
            // 3. 人工介入
            saveDlqRecord(order, errorMessage);
        };
    }
    
    private void saveDlqRecord(Order order, String errorMessage) {
        // 保存到死信表
    }
}
```

**配置死信消费者**：

```yaml
spring:
  cloud:
    function:
      definition: orderConsumer;orderDlqConsumer
    
    stream:
      bindings:
        orderDlqConsumer-in-0:
          destination: order-topic-dlq
          group: order-dlq-service
```

---

## 6. 消息幂等性保证

### 6.1 幂等性问题

**问题场景**：

```
消息重复消费场景：
1. 消费者处理完消息，但确认前宕机
2. 消息重新投递
3. 再次处理，导致重复

示例：
订单消息重复消费 → 库存重复扣减 → 数据错误
```

### 6.2 幂等性方案1：唯一键

```java
@Configuration
@Slf4j
public class OrderConsumer {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Bean
    public Consumer<Order> orderConsumer() {
        return order -> {
            try {
                // 使用订单ID作为唯一键
                orderRepository.save(order);
                log.info("订单保存成功：{}", order.getId());
                
            } catch (DuplicateKeyException e) {
                // 重复消息，忽略
                log.warn("订单已存在，忽略重复消息：{}", order.getId());
            }
        };
    }
}
```

**数据库唯一约束**：

```sql
CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  UNIQUE KEY `uk_order_id` (`id`)  -- 唯一约束
);
```

### 6.3 幂等性方案2：消费记录表

```java
@Configuration
@Slf4j
public class OrderConsumer {
    
    @Autowired
    private MessageConsumeRecordRepository recordRepository;
    
    @Autowired
    private OrderService orderService;
    
    @Bean
    public Consumer<Message<Order>> orderConsumer() {
        return message -> {
            Order order = message.getPayload();
            
            // 生成消息唯一标识
            String messageId = (String) message.getHeaders().get("messageId");
            if (messageId == null) {
                messageId = order.getId().toString();
            }
            
            // 检查是否已消费
            if (recordRepository.existsByMessageId(messageId)) {
                log.warn("消息已消费，忽略：messageId={}", messageId);
                return;
            }
            
            // 处理消息
            orderService.processOrder(order);
            
            // 记录消费
            MessageConsumeRecord record = new MessageConsumeRecord();
            record.setMessageId(messageId);
            record.setTopic("order-topic");
            record.setConsumeTime(LocalDateTime.now());
            recordRepository.save(record);
            
            log.info("消息处理成功：messageId={}", messageId);
        };
    }
}
```

**消费记录表**：

```sql
CREATE TABLE `message_consume_record` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `message_id` VARCHAR(100) NOT NULL,
  `topic` VARCHAR(100) NOT NULL,
  `consume_time` DATETIME NOT NULL,
  UNIQUE KEY `uk_message_id` (`message_id`)
);
```

### 6.4 幂等性方案3：分布式锁

```java
@Configuration
@Slf4j
public class OrderConsumer {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Bean
    public Consumer<Order> orderConsumer() {
        return order -> {
            String lockKey = "order:lock:" + order.getId();
            
            // 尝试获取锁
            Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "1", 5, TimeUnit.MINUTES);
            
            if (Boolean.TRUE.equals(acquired)) {
                try {
                    // 处理订单
                    processOrder(order);
                    log.info("订单处理成功：{}", order.getId());
                    
                } finally {
                    // 释放锁
                    redisTemplate.delete(lockKey);
                }
            } else {
                log.warn("订单正在处理或已处理：{}", order.getId());
            }
        };
    }
}
```

---

## 7. 消息顺序性保证

### 7.1 顺序性问题

**问题场景**：

```
订单状态流转：
创建 → 支付 → 发货 → 完成

消息发送顺序：
1. 订单创建
2. 订单支付
3. 订单发货

但消费可能乱序：
1. 订单支付（消费）
2. 订单创建（消费）← 顺序错误
3. 订单发货（消费）
```

### 7.2 顺序性方案1：分区

**配置**：

```yaml
spring:
  cloud:
    stream:
      bindings:
        order-out-0:
          producer:
            partition-count: 3
            partition-key-expression: payload.orderId  # 按订单ID分区
        
        orderConsumer-in-0:
          consumer:
            partitioned: true
            concurrency: 1  # 单线程消费，保证顺序
```

**原理**：

```
同一订单的所有消息 → 同一分区 → 同一消费者 → 单线程消费 → 保证顺序
```

### 7.3 顺序性方案2：版本号

```java
@Data
public class OrderEvent {
    private Long orderId;
    private String eventType;  // CREATE/PAY/SHIP
    private Long version;      // 版本号
    private LocalDateTime timestamp;
}
```

**消费者**：

```java
@Configuration
@Slf4j
public class OrderConsumer {
    
    private final Map<Long, Long> orderVersionMap = new ConcurrentHashMap<>();
    
    @Bean
    public Consumer<OrderEvent> orderEventConsumer() {
        return event -> {
            Long currentVersion = orderVersionMap.get(event.getOrderId());
            
            if (currentVersion != null && event.getVersion() <= currentVersion) {
                // 版本号小于等于当前版本，忽略
                log.warn("消息版本过低，忽略：orderId={}, version={}", 
                    event.getOrderId(), event.getVersion());
                return;
            }
            
            // 处理事件
            processEvent(event);
            
            // 更新版本
            orderVersionMap.put(event.getOrderId(), event.getVersion());
        };
    }
}
```

---

## 8. 事务消息

### 8.1 本地事务与消息

**问题场景**：

```
订单服务：
1. 保存订单到数据库（本地事务）
2. 发送订单创建消息

问题：
- 如果步骤1成功，步骤2失败 → 消息丢失
- 如果步骤1失败，步骤2成功 → 产生脏消息
```

### 8.2 事务消息方案1：本地消息表

```java
@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OutboxMessageRepository outboxRepository;
    
    public Order createOrder(OrderDTO dto) {
        // 1. 保存订单
        Order order = new Order();
        order.setUserId(dto.getUserId());
        order.setAmount(dto.getAmount());
        order = orderRepository.save(order);
        
        // 2. 保存待发送消息到本地消息表
        OutboxMessage outboxMessage = new OutboxMessage();
        outboxMessage.setTopic("order-topic");
        outboxMessage.setPayload(JSON.toJSONString(order));
        outboxMessage.setStatus(OutboxStatus.PENDING);
        outboxMessage.setCreateTime(LocalDateTime.now());
        outboxRepository.save(outboxMessage);
        
        // 两步操作在同一事务中，要么都成功，要么都失败
        return order;
    }
}
```

**定时任务发送消息**：

```java
@Component
@Slf4j
public class OutboxMessageSender {
    
    @Autowired
    private OutboxMessageRepository outboxRepository;
    
    @Autowired
    private StreamBridge streamBridge;
    
    @Scheduled(fixedDelay = 1000)
    public void sendPendingMessages() {
        // 查询待发送消息
        List<OutboxMessage> messages = outboxRepository
            .findByStatus(OutboxStatus.PENDING);
        
        for (OutboxMessage message : messages) {
            try {
                // 发送消息
                streamBridge.send(message.getTopic(), message.getPayload());
                
                // 更新状态
                message.setStatus(OutboxStatus.SENT);
                message.setSentTime(LocalDateTime.now());
                outboxRepository.save(message);
                
                log.info("消息发送成功：id={}", message.getId());
                
            } catch (Exception e) {
                log.error("消息发送失败：id={}", message.getId(), e);
            }
        }
    }
}
```

### 8.3 事务消息方案2：Kafka 事务

```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          transaction:
            transaction-id-prefix: tx-order-
```

```java
@Configuration
public class KafkaTransactionConfig {
    
    @Bean
    public KafkaTransactionManager kafkaTransactionManager(
            ProducerFactory<String, Object> producerFactory) {
        return new KafkaTransactionManager<>(producerFactory);
    }
}

@Service
public class OrderService {
    
    @Autowired
    private StreamBridge streamBridge;
    
    @Autowired
    private KafkaTransactionManager transactionManager;
    
    @Transactional("kafkaTransactionManager")
    public void createOrder(OrderDTO dto) {
        // 1. 保存订单
        Order order = saveOrder(dto);
        
        // 2. 发送消息（在同一 Kafka 事务中）
        streamBridge.send("order-out-0", order);
        
        // 两步操作在同一 Kafka 事务中
        // 要么都提交，要么都回滚
    }
}
```

---

## 9. 错误处理策略

### 9.1 全局错误处理

```java
@Component
@Slf4j
public class GlobalErrorHandler implements ListenerErrorHandler {
    
    @Override
    public Object handleError(Message<?> message, Throwable exception) {
        log.error("消息处理失败：message={}", message, exception);
        
        // 错误分类处理
        if (exception instanceof IllegalArgumentException) {
            // 参数错误，不重试，直接发送到死信队列
            return null;
        } else if (exception instanceof TimeoutException) {
            // 超时，可以重试
            throw new RuntimeException("处理超时，等待重试", exception);
        } else {
            // 其他错误，记录日志
            saveErrorLog(message, exception);
            return null;
        }
    }
}
```

### 9.2 自定义错误处理

```java
@Configuration
@Slf4j
public class OrderConsumer {
    
    @Autowired
    private OrderService orderService;
    
    @Bean
    public Consumer<Message<Order>> orderConsumer() {
        return message -> {
            try {
                Order order = message.getPayload();
                orderService.processOrder(order);
                
            } catch (BusinessException e) {
                // 业务异常，不重试
                log.error("业务异常，不重试：{}", e.getMessage());
                sendToDlq(message, e);
                
            } catch (Exception e) {
                // 系统异常，重试
                log.error("系统异常，等待重试", e);
                throw new RuntimeException(e);
            }
        };
    }
    
    private void sendToDlq(Message<Order> message, Exception e) {
        // 手动发送到死信队列
    }
}
```

---

## 10. 面试要点

**Q1：如何保证消息的可靠性？**

1. 生产者：确认机制（acks=all）
2. 消息中间件：持久化、副本
3. 消费者：手动确认、重试机制

**Q2：如何保证消息幂等性？**

1. 唯一键
2. 消费记录表
3. 分布式锁
4. 版本号

**Q3：如何保证消息顺序性？**

1. 分区 + 单线程消费
2. 版本号控制
3. 业务层重排序

**Q4：什么是死信队列？**

- 存放无法正常消费的消息
- 用于排查问题和人工介入

**Q5：如何实现事务消息？**

1. 本地消息表
2. Kafka 事务
3. RocketMQ 事务消息

---

## 11. 参考资料

**官方文档**：
- [Spring Cloud Stream Configuration](https://docs.spring.io/spring-cloud-stream/docs/current/reference/html/spring-cloud-stream.html#_configuration_options)
- [Kafka Consumer Configuration](https://kafka.apache.org/documentation/#consumerconfigs)

---

**下一章预告**：第 29 章将学习 Stream 高级特性与最佳实践，包括动态绑定、条件绑定、多 Binder 配置、消息转换器、消息拦截器、性能优化、Kafka Stream 集成等内容。

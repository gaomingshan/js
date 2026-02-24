# 第29章：Stream 消息驱动深入

> **本章目标**：深入理解 Stream 消息处理机制，掌握高级特性和最佳实践

---

## 1. Stream 核心原理

### 1.1 架构设计

**三层架构**：
```
Application Layer（应用层）
    ↓
Binder Abstraction Layer（绑定抽象层）
    ↓
Message Middleware（消息中间件：RabbitMQ/Kafka/RocketMQ）
```

**核心组件**：
- **Binder**：绑定器，封装消息中间件
- **Binding**：绑定配置，连接应用与消息中间件
- **Message**：消息对象
- **MessageChannel**：消息通道

---

### 1.2 消息发送流程

**发送流程**：
```
业务代码 → StreamBridge.send() → 
MessageChannel → BinderFactory → 
Binder → Message Middleware
```

**源码解析**：
```java
// StreamBridge 核心方法
public boolean send(String bindingName, Object data) {
    return send(bindingName, null, data);
}

public boolean send(String bindingName, @Nullable Object headers, Object data) {
    // 1. 获取或创建 MessageChannel
    MessageChannel messageChannel = resolveDestination(bindingName);
    
    // 2. 构建 Message
    Message<?> message = MessageBuilder
        .withPayload(data)
        .copyHeaders((Map<String, Object>) headers)
        .build();
    
    // 3. 发送消息
    return messageChannel.send(message);
}
```

---

### 1.3 消息消费流程

**消费流程**：
```
Message Middleware → Binder → 
MessageChannel → StreamListener → 
@Bean Consumer/Function
```

**源码解析**：
```java
// StreamBridge 消费者绑定
@Bean
public Consumer<String> input() {
    return message -> {
        // 消息处理逻辑
        processMessage(message);
    };
}

// 实际执行流程
// 1. Binder 从中间件拉取消息
// 2. 转换为 Spring Message
// 3. 发送到 MessageChannel
// 4. 触发 Consumer 函数
```

---

## 2. 消息序列化

### 2.1 默认序列化

**JSON 序列化（默认）**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        output-out-0:
          content-type: application/json  # 默认
```

**发送对象**：
```java
@Service
public class MessageProducer {
    
    @Autowired
    private StreamBridge streamBridge;
    
    public void sendUser(UserDTO user) {
        // 自动序列化为 JSON
        streamBridge.send("user-out-0", user);
    }
}
```

**消费对象**：
```java
@Component
public class MessageConsumer {
    
    @Bean
    public Consumer<UserDTO> userInput() {
        return user -> {
            // 自动反序列化
            System.out.println("User: " + user.getName());
        };
    }
}
```

---

### 2.2 自定义序列化

**Avro 序列化**：
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-schema</artifactId>
</dependency>
```

**配置**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        output-out-0:
          content-type: application/*+avro
      
      schema:
        avro:
          schema-locations: classpath:avro/user.avsc
```

**Avro Schema**：
```json
{
  "type": "record",
  "name": "User",
  "fields": [
    {"name": "id", "type": "long"},
    {"name": "name", "type": "string"},
    {"name": "age", "type": "int"}
  ]
}
```

---

## 3. 消息分组与分区

### 3.1 消息分组（Consumer Group）

**作用**：同一组内只有一个实例消费消息，实现**负载均衡**和**防止重复消费**。

**配置**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        input-in-0:
          destination: user-topic
          group: user-service-group  # 消费者组
```

**场景**：
```
生产者 → user-topic
           ↓
    ┌──────┼──────┐
    ↓      ↓      ↓
 实例1   实例2   实例3 （user-service-group）
    ↓      ↓      ↓
  消息1  消息2  消息3 （负载均衡，每个消息只被一个实例消费）
```

**不配置分组的问题**：
```
生产者 → user-topic
           ↓
    ┌──────┼──────┐
    ↓      ↓      ↓
 实例1   实例2   实例3 （无分组）
    ↓      ↓      ↓
  消息1  消息1  消息1 （重复消费！）
```

---

### 3.2 消息分区（Partition）

**作用**：将消息按照分区键路由到固定的消费者实例，保证**顺序消费**。

**生产者配置**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        output-out-0:
          destination: order-topic
          producer:
            partition-key-expression: headers['userId']  # 分区键
            partition-count: 3  # 分区数量
```

**消费者配置**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        input-in-0:
          destination: order-topic
          group: order-service-group
          consumer:
            partitioned: true  # 启用分区
      
      instance-index: 0  # 当前实例索引（0/1/2）
      instance-count: 3  # 总实例数
```

**发送分区消息**：
```java
@Service
public class OrderProducer {
    
    @Autowired
    private StreamBridge streamBridge;
    
    public void sendOrder(OrderDTO order) {
        Message<OrderDTO> message = MessageBuilder
            .withPayload(order)
            .setHeader("userId", order.getUserId())  // 设置分区键
            .build();
        
        streamBridge.send("order-out-0", message);
    }
}
```

**分区路由规则**：
```
分区索引 = hash(userId) % partition-count
userId=1001 → hash(1001) % 3 = 0 → 实例0
userId=1002 → hash(1002) % 3 = 1 → 实例1
userId=1003 → hash(1003) % 3 = 2 → 实例2
userId=1004 → hash(1004) % 3 = 1 → 实例1
```

**场景**：保证同一用户的订单消息按顺序消费。

---

## 4. 消息确认与重试

### 4.1 消息确认机制

**RabbitMQ 手动确认**：
```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          input-in-0:
            consumer:
              acknowledge-mode: manual  # 手动确认
```

**手动确认代码**：
```java
@Component
public class MessageConsumer {
    
    @Bean
    public Consumer<Message<String>> input() {
        return message -> {
            try {
                // 处理消息
                String payload = message.getPayload();
                processMessage(payload);
                
                // 手动确认
                Channel channel = message.getHeaders().get(AmqpHeaders.CHANNEL, Channel.class);
                Long deliveryTag = message.getHeaders().get(AmqpHeaders.DELIVERY_TAG, Long.class);
                channel.basicAck(deliveryTag, false);
                
            } catch (Exception e) {
                // 拒绝消息，重新入队
                Channel channel = message.getHeaders().get(AmqpHeaders.CHANNEL, Channel.class);
                Long deliveryTag = message.getHeaders().get(AmqpHeaders.DELIVERY_TAG, Long.class);
                channel.basicNack(deliveryTag, false, true);
            }
        };
    }
}
```

---

### 4.2 消息重试

**配置重试**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        input-in-0:
          consumer:
            max-attempts: 3  # 最大重试次数
            back-off-initial-interval: 1000  # 初始退避间隔（毫秒）
            back-off-max-interval: 10000  # 最大退避间隔
            back-off-multiplier: 2.0  # 退避倍数
```

**重试流程**：
```
消息消费失败 → 1秒后重试（第1次）→ 失败
             → 2秒后重试（第2次）→ 失败
             → 4秒后重试（第3次）→ 失败
             → 进入死信队列
```

---

### 4.3 死信队列（DLQ）

**配置死信队列**：
```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          input-in-0:
            consumer:
              auto-bind-dlq: true  # 自动绑定死信队列
              dlq-ttl: 86400000  # 死信队列消息 TTL（1天）
              dlq-max-length: 10000  # 死信队列最大长度
```

**死信队列消费**：
```java
@Component
public class DlqConsumer {
    
    @RabbitListener(queues = "user-topic.user-service-group.dlq")
    public void handleDlq(Message message) {
        log.error("Dead letter message: {}", message);
        
        // 记录到数据库
        dlqMessageMapper.insert(message);
        
        // 发送告警
        alertService.send("死信队列收到消息");
    }
}
```

---

## 5. 延迟消息

### 5.1 RabbitMQ 延迟消息

**安装延迟插件**：
```bash
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

**配置**：
```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          output-out-0:
            producer:
              delayed-exchange: true
```

**发送延迟消息**：
```java
@Service
public class DelayedMessageProducer {
    
    @Autowired
    private StreamBridge streamBridge;
    
    // 延迟10秒发送
    public void sendDelayedMessage(String message) {
        Message<String> msg = MessageBuilder
            .withPayload(message)
            .setHeader("x-delay", 10000)  // 延迟时间（毫秒）
            .build();
        
        streamBridge.send("delayed-out-0", msg);
    }
}
```

**场景**：订单超时自动取消
```java
@Service
public class OrderService {
    
    public void createOrder(OrderDTO order) {
        // 保存订单
        orderMapper.insert(order);
        
        // 发送延迟消息（30分钟后检查支付状态）
        Message<Long> msg = MessageBuilder
            .withPayload(order.getId())
            .setHeader("x-delay", 30 * 60 * 1000)
            .build();
        
        streamBridge.send("order-check-out-0", msg);
    }
}

@Component
public class OrderCheckConsumer {
    
    @Bean
    public Consumer<Long> orderCheck() {
        return orderId -> {
            Order order = orderMapper.selectById(orderId);
            
            // 30分钟后仍未支付，自动取消
            if (order.getStatus() == OrderStatus.UNPAID) {
                orderService.cancelOrder(orderId);
            }
        };
    }
}
```

---

## 6. 消息幂等性

### 6.1 为什么需要幂等

**问题场景**：
- 消息重试导致重复消费
- 网络抖动导致重复发送
- 消费者宕机重启，消息重新投递

**幂等要求**：同一消息多次消费，结果一致。

---

### 6.2 幂等实现方案

**方案1：Redis 记录消息ID**
```java
@Component
public class IdempotentConsumer {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Bean
    public Consumer<Message<OrderDTO>> orderInput() {
        return message -> {
            String messageId = message.getHeaders().getId().toString();
            OrderDTO order = message.getPayload();
            
            // 检查消息是否已处理
            String key = "message:processed:" + messageId;
            Boolean isNew = redisTemplate.opsForValue().setIfAbsent(
                key, "1", 24, TimeUnit.HOURS
            );
            
            if (Boolean.TRUE.equals(isNew)) {
                // 首次消费，处理业务
                processOrder(order);
            } else {
                // 重复消费，忽略
                log.warn("Duplicate message: {}", messageId);
            }
        };
    }
}
```

**方案2：数据库唯一索引**
```sql
CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY,
  `order_no` VARCHAR(64) UNIQUE,  -- 唯一索引
  `user_id` BIGINT,
  `amount` DECIMAL(10,2)
);
```

```java
@Bean
public Consumer<OrderDTO> orderInput() {
    return order -> {
        try {
            // 插入订单（唯一索引保证幂等）
            orderMapper.insert(order);
        } catch (DuplicateKeyException e) {
            // 订单已存在，忽略
            log.warn("Duplicate order: {}", order.getOrderNo());
        }
    };
}
```

**方案3：业务逻辑幂等**
```java
// 扣减库存（UPDATE + WHERE 保证幂等）
@Update("UPDATE inventory SET stock = stock - #{quantity} " +
        "WHERE product_id = #{productId} AND stock >= #{quantity}")
int deductStock(@Param("productId") Long productId, 
                @Param("quantity") Integer quantity);

// 返回值 0 表示库存不足，1 表示扣减成功
// 多次执行，只有首次成功
```

---

## 7. 消息过滤

### 7.1 生产者过滤

**场景**：只发送特定条件的消息

```java
@Service
public class UserProducer {
    
    @Autowired
    private StreamBridge streamBridge;
    
    public void sendUser(UserDTO user) {
        // 只发送VIP用户消息
        if (user.isVip()) {
            streamBridge.send("vip-user-out-0", user);
        }
    }
}
```

---

### 7.2 消费者过滤

**RabbitMQ Selector**：
```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          input-in-0:
            consumer:
              selector-expression: headers['type'] == 'VIP'
```

**代码过滤**：
```java
@Bean
public Consumer<Message<UserDTO>> userInput() {
    return message -> {
        String type = message.getHeaders().get("type", String.class);
        UserDTO user = message.getPayload();
        
        // 过滤条件
        if ("VIP".equals(type) && user.getAge() > 18) {
            processUser(user);
        }
    };
}
```

---

## 8. 批量消费

### 8.1 配置批量消费

**Kafka 批量消费**：
```yaml
spring:
  cloud:
    stream:
      kafka:
        bindings:
          input-in-0:
            consumer:
              batch-mode: true  # 批量模式
```

**消费批量消息**：
```java
@Component
public class BatchConsumer {
    
    @Bean
    public Consumer<List<String>> batchInput() {
        return messages -> {
            log.info("Received {} messages", messages.size());
            
            // 批量处理
            messages.forEach(this::processMessage);
        };
    }
}
```

---

## 9. 实战场景

### 9.1 场景1：订单异步处理

**流程**：
```
1. 用户下单 → 保存订单 → 发送订单消息
2. 库存服务消费消息 → 扣减库存
3. 积分服务消费消息 → 增加积分
4. 通知服务消费消息 → 发送短信
```

**生产者**：
```java
@Service
public class OrderService {
    
    @Autowired
    private StreamBridge streamBridge;
    
    @Transactional
    public void createOrder(OrderDTO order) {
        // 1. 保存订单
        orderMapper.insert(order);
        
        // 2. 发送订单创建消息
        streamBridge.send("order-created-out-0", order);
    }
}
```

**消费者（库存服务）**：
```java
@Component
public class InventoryConsumer {
    
    @Bean
    public Consumer<OrderDTO> orderCreated() {
        return order -> {
            // 扣减库存
            inventoryService.deduct(order.getProductId(), order.getQuantity());
        };
    }
}
```

**消费者（积分服务）**：
```java
@Component
public class PointsConsumer {
    
    @Bean
    public Consumer<OrderDTO> orderCreated() {
        return order -> {
            // 增加积分
            pointsService.add(order.getUserId(), order.getAmount());
        };
    }
}
```

---

### 9.2 场景2：日志异步收集

**生产者**：
```java
@Component
@Aspect
public class LogAspect {
    
    @Autowired
    private StreamBridge streamBridge;
    
    @Around("@annotation(com.example.annotation.LogRecord)")
    public Object logRecord(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long duration = System.currentTimeMillis() - start;
        
        // 发送日志消息
        LogDTO log = new LogDTO();
        log.setMethod(joinPoint.getSignature().getName());
        log.setDuration(duration);
        log.setResult(result);
        
        streamBridge.send("log-out-0", log);
        
        return result;
    }
}
```

**消费者（日志服务）**：
```java
@Component
public class LogConsumer {
    
    @Bean
    public Consumer<LogDTO> logInput() {
        return log -> {
            // 保存到 Elasticsearch
            elasticsearchService.save(log);
        };
    }
}
```

---

## 10. 学习自检清单

- [ ] 理解 Stream 三层架构
- [ ] 掌握消息序列化机制
- [ ] 理解消息分组与分区
- [ ] 掌握消息确认与重试
- [ ] 能够配置死信队列
- [ ] 掌握延迟消息发送
- [ ] 能够实现消息幂等性
- [ ] 掌握消息过滤与批量消费
- [ ] 能够应用实战场景

---

## 11. 面试高频题

**Q1：Stream 如何保证消息不丢失？**

**参考答案**：
1. 生产者：消息持久化（RabbitMQ durable）
2. 消费者：手动确认（acknowledge-mode: manual）
3. 配置重试机制
4. 死信队列兜底

**Q2：如何防止消息重复消费？**

**参考答案**：
1. 配置消费者分组（group）
2. Redis 记录消息ID
3. 数据库唯一索引
4. 业务逻辑幂等

**Q3：消息分区和分组的区别？**

| 维度 | 分组 | 分区 |
|------|------|------|
| 作用 | 负载均衡 | 顺序消费 |
| 路由 | 随机/轮询 | 按分区键 |
| 场景 | 防止重复消费 | 保证消息顺序 |

---

**本章小结**：
- Stream 三层架构：应用层、绑定抽象层、消息中间件
- 消息序列化：JSON（默认）、Avro
- 消息分组：负载均衡、防止重复消费
- 消息分区：顺序消费、分区路由
- 消息确认：手动确认、重试机制、死信队列
- 延迟消息：RabbitMQ delayed-exchange
- 消息幂等：Redis记录、唯一索引、业务幂等
- 实战场景：订单异步处理、日志收集

**下一章预告**：第30章 - Stream 生产最佳实践

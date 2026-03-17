# 消息幂等性方案

## 概述

幂等性保证消息被重复消费时不会产生副作用。本章介绍常用的幂等性实现方案。

---

## 1. 幂等性的定义与重要性

**定义**：多次执行产生的结果与执行一次的结果相同。

**重要性**：
- 消息队列至少一次(At-Least-Once)语义
- 网络重试可能导致重复
- Rebalance可能导致重复消费

---

## 2. 业务幂等设计

### 2.1 唯一键约束

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    public void createOrder(OrderCreatedEvent event) {
        try {
            Order order = new Order();
            order.setId(event.getOrderId());  // 使用事件ID作为唯一键
            order.setAmount(event.getAmount());
            
            orderRepository.save(order);
        } catch (DuplicateKeyException e) {
            // 重复消息，忽略
            log.warn("Duplicate order: {}", event.getOrderId());
        }
    }
}
```

### 2.2 状态机

```java
@Entity
public class Order {
    
    @Id
    private String id;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    public void pay() {
        if (status == OrderStatus.CREATED) {
            status = OrderStatus.PAID;
        } else {
            throw new IllegalStateException("Cannot pay order in status: " + status);
        }
    }
}

@Service
public class PaymentService {
    
    public void handlePayment(PaymentEvent event) {
        Order order = orderRepository.findById(event.getOrderId());
        
        try {
            order.pay();  // 状态机保证幂等
            orderRepository.save(order);
        } catch (IllegalStateException e) {
            log.warn("Order already paid: {}", event.getOrderId());
        }
    }
}
```

---

## 3. 去重表方案

### 3.1 数据库去重

```java
@Entity
public class MessageDedup {
    
    @Id
    private String messageId;
    private String topic;
    private LocalDateTime processedAt;
    private String status;
}

@Service
public class MessageDedupService {
    
    @Autowired
    private MessageDedupRepository dedupRepository;
    
    @Transactional
    public boolean tryProcess(String messageId, Runnable processor) {
        // 1. 检查是否已处理
        if (dedupRepository.existsById(messageId)) {
            return false;
        }
        
        // 2. 记录处理状态
        MessageDedup dedup = new MessageDedup();
        dedup.setMessageId(messageId);
        dedup.setProcessedAt(LocalDateTime.now());
        dedup.setStatus("PROCESSING");
        dedupRepository.save(dedup);
        
        // 3. 处理消息
        try {
            processor.run();
            dedup.setStatus("SUCCESS");
        } catch (Exception e) {
            dedup.setStatus("FAILED");
            throw e;
        } finally {
            dedupRepository.save(dedup);
        }
        
        return true;
    }
}
```

### 3.2 Redis去重

```java
@Service
public class RedisDedupService {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    public boolean tryProcess(String messageId, Runnable processor) {
        String key = "dedup:" + messageId;
        
        // 1. 尝试设置标记（NX=不存在才设置，EX=过期时间）
        Boolean success = redisTemplate.opsForValue()
            .setIfAbsent(key, "1", 24, TimeUnit.HOURS);
        
        if (Boolean.FALSE.equals(success)) {
            // 已处理，跳过
            return false;
        }
        
        // 2. 处理消息
        try {
            processor.run();
            return true;
        } catch (Exception e) {
            // 处理失败，删除标记（允许重试）
            redisTemplate.delete(key);
            throw e;
        }
    }
}
```

---

## 4. 分布式锁方案

### 4.1 Redis分布式锁

```java
@Service
public class DistributedLockService {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    public void processWithLock(String messageId, Runnable processor) {
        String lockKey = "lock:" + messageId;
        String lockValue = UUID.randomUUID().toString();
        
        try {
            // 1. 获取锁
            Boolean locked = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, 30, TimeUnit.SECONDS);
            
            if (Boolean.FALSE.equals(locked)) {
                log.warn("Message is being processed: {}", messageId);
                return;
            }
            
            // 2. 处理消息
            processor.run();
            
        } finally {
            // 3. 释放锁（防止误删其他线程的锁）
            String currentValue = redisTemplate.opsForValue().get(lockKey);
            if (lockValue.equals(currentValue)) {
                redisTemplate.delete(lockKey);
            }
        }
    }
}
```

---

## 5. 全局唯一ID

### 5.1 消息ID作为唯一键

```java
@KafkaListener(topics = "orders")
public void handleOrder(ConsumerRecord<String, OrderEvent> record) {
    String messageId = String.format("%s-%d-%d", 
        record.topic(), 
        record.partition(), 
        record.offset());
    
    dedupService.tryProcess(messageId, () -> {
        processOrder(record.value());
    });
}
```

### 5.2 业务唯一ID

```java
@Data
public class OrderEvent {
    private String orderId;  // 业务唯一ID
    private String userId;
    private BigDecimal amount;
}

@KafkaListener(topics = "orders")
public void handleOrder(OrderEvent event) {
    dedupService.tryProcess(event.getOrderId(), () -> {
        processOrder(event);
    });
}
```

---

## 6. 幂等性的性能影响

### 6.1 性能对比

| 方案 | 性能 | 可靠性 | 复杂度 |
|------|------|--------|--------|
| 业务幂等 | 高 | 高 | 低 |
| 数据库去重 | 中 | 高 | 中 |
| Redis去重 | 高 | 中 | 中 |
| 分布式锁 | 低 | 高 | 高 |

### 6.2 优化建议

```java
// 1. 使用Bloom Filter快速判断
@Service
public class BloomFilterDedupService {
    
    private BloomFilter<String> bloomFilter = 
        BloomFilter.create(Funnels.stringFunnel(Charset.defaultCharset()), 
            10000000, 0.01);
    
    public boolean mightProcessed(String messageId) {
        return bloomFilter.mightContain(messageId);
    }
    
    public void markProcessed(String messageId) {
        bloomFilter.put(messageId);
    }
}

// 2. 先Bloom Filter，再精确查询
public boolean tryProcess(String messageId, Runnable processor) {
    // 快速判断（可能误判）
    if (bloomFilter.mightProcessed(messageId)) {
        // 精确查询
        if (dedupRepository.existsById(messageId)) {
            return false;
        }
    }
    
    // 处理消息
    processor.run();
    bloomFilter.markProcessed(messageId);
    return true;
}
```

---

## 7. 幂等性最佳实践

### 7.1 推荐方案

```
1. 优先使用业务幂等设计
2. 数据库唯一约束 + 异常捕获
3. Redis去重（高性能场景）
4. 去重表 + 定期清理
```

### 7.2 注意事项

```
1. 去重记录需要设置过期时间
2. 处理失败时需要删除去重标记
3. 考虑时钟回拨问题
4. 监控去重命中率
```

---

## 关键要点

1. **业务幂等**：优先考虑业务层面的幂等设计
2. **唯一约束**：数据库唯一键保证幂等
3. **去重表**：记录已处理的消息ID
4. **Redis去重**：高性能去重方案
5. **全局ID**：使用消息ID或业务ID作为唯一键

---

## 参考资料

1. [Idempotence](https://en.wikipedia.org/wiki/Idempotence)
2. [Message Deduplication](https://www.enterpriseintegrationpatterns.com/patterns/messaging/IdempotentReceiver.html)

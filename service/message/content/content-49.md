# 消息顺序性保证

## 概述

顺序性是某些业务场景的核心要求。本章介绍如何在高并发下保证消息顺序。

---

## 1. 顺序性需求分析

**需要顺序的场景**：
- 订单状态流转（创建→支付→发货→完成）
- 数据库Binlog同步
- 游戏操作序列
- 股票交易流水

**不需要顺序的场景**：
- 日志收集
- 数据统计
- 独立消息通知

---

## 2. 分区键（Partition Key）设计

### 2.1 Kafka分区键

```java
// 使用订单ID作为Key，保证同一订单的消息进入同一分区
ProducerRecord<String, Order> record = 
    new ProducerRecord<>("orders", order.getId(), order);

kafkaTemplate.send(record);

// 同一分区内天然有序
```

### 2.2 RocketMQ队列选择器

```java
public class OrderMessageQueueSelector implements MessageQueueSelector {
    
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        String orderId = (String) arg;
        int index = Math.abs(orderId.hashCode()) % mqs.size();
        return mqs.get(index);
    }
}

// 发送顺序消息
producer.send(msg, new OrderMessageQueueSelector(), order.getId());
```

---

## 3. 单线程消费保证顺序

### 3.1 Kafka单消费者

```java
@KafkaListener(
    topics = "orders",
    concurrency = "1"  // 单线程消费
)
public void listen(ConsumerRecord<String, Order> record) {
    processOrder(record.value());
}
```

### 3.2 RocketMQ顺序监听器

```java
consumer.registerMessageListener(new MessageListenerOrderly() {
    
    @Override
    public ConsumeOrderlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeOrderlyContext context) {
        
        // 单线程顺序消费
        for (MessageExt msg : msgs) {
            processMessage(msg);
        }
        
        return ConsumeOrderlyStatus.SUCCESS;
    }
});
```

---

## 4. 局部有序 vs 全局有序

### 4.1 局部有序（推荐）

```
订单A的消息：A1 → A2 → A3（有序）
订单B的消息：B1 → B2 → B3（有序）

但A和B之间无序关系
```

**优势**：
- 性能高（并行处理）
- 扩展性好

### 4.2 全局有序

```
所有消息：M1 → M2 → M3 → M4...（全局有序）

实现：单分区 + 单消费者
```

**劣势**：
- 性能低（单线程瓶颈）
- 无法水平扩展

---

## 5. 顺序失败重试处理

### 5.1 RocketMQ顺序重试

```java
consumer.registerMessageListener(new MessageListenerOrderly() {
    
    @Override
    public ConsumeOrderlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeOrderlyContext context) {
        
        try {
            processMessages(msgs);
            return ConsumeOrderlyStatus.SUCCESS;
        } catch (Exception e) {
            // 返回SUSPEND，暂停该队列消费
            // 其他队列继续消费
            return ConsumeOrderlyStatus.SUSPEND_CURRENT_QUEUE_A_MOMENT;
        }
    }
});
```

### 5.2 Kafka顺序重试

```java
@KafkaListener(topics = "orders", concurrency = "1")
public void listen(ConsumerRecord<String, Order> record) {
    try {
        processOrder(record.value());
        // 手动提交Offset
        consumer.commitSync();
    } catch (Exception e) {
        // 不提交Offset，下次继续消费该消息
        log.error("Process failed, will retry", e);
        throw e;
    }
}
```

---

## 6. 顺序性与性能的权衡

### 6.1 性能对比

```
并发消费：
- 吞吐量：10000 TPS
- 延迟：10ms

顺序消费（单线程）：
- 吞吐量：1000 TPS
- 延迟：5ms

性能差距：10倍
```

### 6.2 优化建议

```java
// 方案1：增加分区数，每个分区内有序
Topic: orders
Partitions: 12（每个分区1000 TPS）
总吞吐量：12000 TPS

// 方案2：按业务拆分Topic
Topic: order-created（无序）
Topic: order-status-changed（有序）
```

---

## 7. 顺序消息的最佳实践

### 7.1 设计原则

```
1. 优先考虑局部有序
2. 合理设计分区键
3. 单线程消费分区
4. 失败阻塞队列
5. 监控顺序性
```

### 7.2 实现示例

```java
@Service
public class OrderEventService {
    
    @Autowired
    private KafkaTemplate<String, OrderEvent> kafkaTemplate;
    
    public void publishEvent(OrderEvent event) {
        // 使用订单ID作为分区键
        ProducerRecord<String, OrderEvent> record = 
            new ProducerRecord<>("orders", event.getOrderId(), event);
        
        kafkaTemplate.send(record);
    }
}

@Component
public class OrderEventListener {
    
    // 单线程消费，保证分区内顺序
    @KafkaListener(
        topics = "orders",
        concurrency = "1",
        containerFactory = "orderKafkaListenerContainerFactory"
    )
    public void listen(
            ConsumerRecord<String, OrderEvent> record,
            Acknowledgment acknowledgment) {
        
        try {
            processEvent(record.value());
            acknowledgment.acknowledge();
        } catch (Exception e) {
            // 不确认，下次重试
            log.error("Failed to process event", e);
        }
    }
}
```

---

## 关键要点

1. **分区键**：使用业务键（如订单ID）作为分区键
2. **局部有序**：优先考虑局部有序，性能更好
3. **单线程消费**：每个分区单线程消费
4. **失败阻塞**：顺序消费失败时阻塞队列
5. **性能权衡**：顺序性与吞吐量的平衡

---

## 深入一点

**RocketMQ顺序消息锁机制**：

```
1. Consumer获取队列锁
   ↓
2. Broker端验证锁
   ↓
3. 单线程消费
   ↓
4. 消费成功，提交Offset
   ↓
5. 消费失败，暂停队列
   ↓
6. 延迟重试（1s, 5s, 10s...）
   ↓
7. 重试成功，继续消费
```

**Kafka分区顺序保证**：

```
生产者：
- 同一Key的消息进入同一分区
- 分区内消息顺序写入

消费者：
- 单消费者单线程消费
- 顺序读取分区消息
- 天然保证顺序
```

---

## 参考资料

1. [Kafka Message Ordering](https://kafka.apache.org/documentation/#semantics)
2. [RocketMQ Orderly Message](https://rocketmq.apache.org/docs/featureBehavior/06ordermessage/)

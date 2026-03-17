# 并发消费 vs 顺序消费

## 概述

并发消费提升吞吐量，顺序消费保证消息顺序。本章对比两种消费模式的实现和适用场景。

---

## 1. 并发消费模式

### 1.1 原理

多线程并行消费消息，提高消费速度。

**特点**：
- 高吞吐量
- 无法保证顺序
- 充分利用 CPU

### 1.2 Kafka 并发消费

```java
// Kafka 通过多线程处理消息
ExecutorService executor = Executors.newFixedThreadPool(10);

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        // 提交到线程池并发处理
        executor.submit(() -> {
            processMessage(record);
        });
    }
    
    consumer.commitSync();
}
```

**问题**：
- 可能导致 Offset 提交错乱
- 需要确保幂等性

### 1.3 RocketMQ 并发消费

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-group");

// 并发消费模式（默认）
consumer.setConsumeThreadMin(20);
consumer.setConsumeThreadMax(64);

consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
        // 多线程并发消费
        processMessages(msgs);
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
```

---

## 2. 顺序消费模式

### 2.1 原理

单线程或锁定队列，保证消息顺序消费。

**特点**：
- 保证顺序
- 吞吐量低
- 单线程消费

### 2.2 Kafka 顺序消费

```java
// Kafka 分区内顺序保证
// 单个消费者消费单个分区，天然有序

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    // 单线程处理（分区内有序）
    for (ConsumerRecord<String, String> record : records) {
        processMessage(record);
    }
    
    consumer.commitSync();
}
```

**保证顺序的前提**：
```java
// 1. 生产者使用相同 Key
ProducerRecord<String, String> record = 
    new ProducerRecord<>("topic", orderId, message);

// 2. 单个消费者消费单个分区
// 3. 单线程处理
```

### 2.3 RocketMQ 顺序消费

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-group");

// 顺序消费监听器
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

**RocketMQ 顺序保证机制**：
```
1. 生产者使用 MessageQueueSelector 选择队列
2. 消费者锁定队列（Broker 端加锁）
3. 单线程消费
```

### 2.4 RabbitMQ 顺序消费

```java
// RabbitMQ 单队列天然有序
// 单消费者单线程消费

channel.basicQos(1);  // 预取1条，保证顺序

channel.basicConsume("queue", false, (consumerTag, delivery) -> {
    // 单线程处理
    processMessage(new String(delivery.getBody()));
    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
});
```

---

## 3. 性能对比

### 3.1 吞吐量对比

```
并发消费（10线程）：
- Kafka: 50000 TPS
- RocketMQ: 40000 TPS
- RabbitMQ: 30000 TPS

顺序消费（单线程）：
- Kafka: 5000 TPS
- RocketMQ: 3000 TPS
- RabbitMQ: 2000 TPS

性能差距：10倍左右
```

### 3.2 延迟对比

```
并发消费：
- P99: 10ms
- P999: 50ms

顺序消费：
- P99: 5ms
- P999: 20ms

顺序消费延迟更稳定
```

---

## 4. 消费线程池配置

### 4.1 RocketMQ 线程池

```java
// 最小线程数
consumer.setConsumeThreadMin(20);

// 最大线程数
consumer.setConsumeThreadMax(64);

// 线程池队列容量
consumer.setPullThresholdForQueue(1000);

// 建议：
// CPU 密集：线程数 = CPU 核数 + 1
// I/O 密集：线程数 = 2 * CPU 核数
```

### 4.2 Kafka 并发控制

```java
// 方式1：多消费者实例（推荐）
// 每个实例单线程消费

// 方式2：线程池（需要注意 Offset 提交）
ExecutorService executor = Executors.newFixedThreadPool(
    Runtime.getRuntime().availableProcessors() * 2
);
```

---

## 5. 顺序消费失败处理

### 5.1 RocketMQ 顺序消费重试

```java
consumer.registerMessageListener(new MessageListenerOrderly() {
    @Override
    public ConsumeOrderlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeOrderlyContext context) {
        
        try {
            processMessages(msgs);
            return ConsumeOrderlyStatus.SUCCESS;
        } catch (Exception e) {
            // 返回 SUSPEND_CURRENT_QUEUE_A_MOMENT
            // 暂停该队列消费，稍后重试
            return ConsumeOrderlyStatus.SUSPEND_CURRENT_QUEUE_A_MOMENT;
        }
    }
});
```

**重试机制**：
```
1. 消费失败
   ↓
2. 暂停队列消费（阻塞后续消息）
   ↓
3. 延迟重试（1秒、5秒、10秒...）
   ↓
4. 重试成功，继续消费
   或
5. 超过最大重试次数，跳过该消息
```

---

## 6. 适用场景

### 6.1 并发消费场景

**适用**：
- 消息无顺序要求
- 追求高吞吐量
- 消息可并行处理

**示例**：
```
- 日志收集
- 数据同步
- 批量通知
- 统计分析
```

### 6.2 顺序消费场景

**适用**：
- 严格顺序要求
- 状态机流转
- 事务消息

**示例**：
```
- 订单状态更新（创建→支付→发货→完成）
- 数据库 Binlog 同步
- 游戏操作序列
- 股票交易流水
```

---

## 7. 两种模式对比

| 维度 | 并发消费 | 顺序消费 |
|------|---------|---------|
| 吞吐量 | 高 | 低 |
| 延迟 | 较高（队列等待） | 稳定 |
| 顺序保证 | 无 | 有 |
| 实现复杂度 | 低 | 高 |
| 适用场景 | 无顺序要求 | 严格顺序 |
| 失败处理 | 独立重试 | 阻塞队列 |

---

## 关键要点

1. **并发消费**：多线程，高吞吐量，无顺序保证
2. **顺序消费**：单线程，低吞吐量，保证顺序
3. **Kafka**：分区内天然有序
4. **RocketMQ**：MessageListenerOrderly 保证顺序
5. **权衡**：根据业务需求选择模式

---

## 深入一点

**RocketMQ 顺序消费锁机制**：

```java
// Broker 端对队列加锁
public boolean lock(MessageQueue mq, String clientId) {
    synchronized (this) {
        if (!lockedQueues.containsKey(mq)) {
            lockedQueues.put(mq, clientId);
            return true;
        }
        return lockedQueues.get(mq).equals(clientId);
    }
}

// 消费者定期续期锁（20秒）
// 锁超时时间：60秒
```

**Kafka 分区内顺序原理**：

```
1. 单分区内消息顺序写入
   ↓
2. 单消费者按 Offset 顺序读取
   ↓
3. 单线程顺序处理
   ↓
4. 天然保证顺序
```

---

## 参考资料

1. [Kafka Ordering Guarantees](https://kafka.apache.org/documentation/#semantics)
2. [RocketMQ Orderly Message](https://rocketmq.apache.org/docs/featureBehavior/06ordermessage/)
3. [RabbitMQ Message Ordering](https://www.rabbitmq.com/semantics.html)

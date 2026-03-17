# 批量发送与批量消费

## 概述

批量操作通过减少网络往返次数，显著提升消息队列的吞吐量。本章介绍三大消息队列的批量发送和批量消费实现。

---

## 1. 批量发送

### 1.1 Kafka 批量发送

**配置参数**：
```java
Properties props = new Properties();

// 批量大小（16KB）
props.put("batch.size", 16384);

// 延迟时间（10ms）
props.put("linger.ms", 10);

// 缓冲区大小（32MB）
props.put("buffer.memory", 33554432);

KafkaProducer<String, String> producer = new KafkaProducer<>(props);
```

**工作原理**：
```
1. 消息先写入 RecordAccumulator
2. 按 batch.size 或 linger.ms 触发发送
3. 一次网络请求发送整个批次
```

**性能对比**：
```
单条发送：10000 TPS
批量发送（batch.size=16KB）：50000 TPS
批量发送（batch.size=32KB）：80000 TPS
```

### 1.2 RocketMQ 批量发送

```java
DefaultMQProducer producer = new DefaultMQProducer("group");
producer.start();

// 批量发送消息
List<Message> messages = new ArrayList<>();
for (int i = 0; i < 100; i++) {
    Message msg = new Message(
        "my-topic",
        "TagA",
        ("Hello-" + i).getBytes()
    );
    messages.add(msg);
}

// 一次发送多条消息
SendResult sendResult = producer.send(messages);
```

**批量大小限制**：
```
单次批量最大 4MB（默认）
可通过 maxMessageSize 配置调整
```

### 1.3 RabbitMQ 批量发布

```java
// 批量发布
for (int i = 0; i < 1000; i++) {
    channel.basicPublish("", "queue", null, ("msg-" + i).getBytes());
}

// 批量确认（等待所有消息确认）
channel.waitForConfirmsOrDie(5000);
```

**批量确认**：
```java
channel.confirmSelect();  // 开启发布确认

for (int i = 0; i < 1000; i++) {
    channel.basicPublish("", "queue", null, msg.getBytes());
}

// 等待批量确认
channel.waitForConfirms();
```

---

## 2. 批量消费

### 2.1 Kafka 批量拉取

```java
Properties props = new Properties();

// 单次拉取最大记录数
props.put("max.poll.records", 500);

// 单次拉取最大字节数
props.put("max.partition.fetch.bytes", 1048576);

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

while (true) {
    // 一次拉取多条消息
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    // 批量处理
    processBatch(records);
    
    consumer.commitSync();
}
```

**批量处理优化**：
```java
public void processBatch(ConsumerRecords<String, String> records) {
    // 方式1：批量插入数据库
    List<Order> orders = new ArrayList<>();
    for (ConsumerRecord<String, String> record : records) {
        orders.add(parseOrder(record.value()));
    }
    orderDao.batchInsert(orders);
    
    // 方式2：批量调用API
    List<String> ids = records.stream()
        .map(r -> r.value())
        .collect(Collectors.toList());
    apiClient.batchProcess(ids);
}
```

### 2.2 RocketMQ 批量消费

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group");

// 设置批量消费数量
consumer.setConsumeMessageBatchMaxSize(10);

consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
        
        // msgs 包含最多 10 条消息
        processBatch(msgs);
        
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
```

### 2.3 RabbitMQ 批量消费

```java
// RabbitMQ 原生不支持批量消费
// 需要手动积累消息

List<String> batch = new ArrayList<>();

channel.basicConsume("queue", false, (consumerTag, delivery) -> {
    batch.add(new String(delivery.getBody()));
    
    // 达到批量大小或超时，批量处理
    if (batch.size() >= 100) {
        processBatch(batch);
        
        // 批量确认
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), true);
        
        batch.clear();
    }
});
```

---

## 3. 批量大小与延迟的权衡

### 3.1 批量大小影响

```
batch.size = 1KB:
- 延迟：5ms
- 吞吐量：10000 TPS

batch.size = 16KB:
- 延迟：15ms
- 吞吐量：50000 TPS

batch.size = 64KB:
- 延迟：50ms
- 吞吐量：100000 TPS
```

### 3.2 延迟时间影响

```
linger.ms = 0:
- 立即发送
- 批量效果差

linger.ms = 10:
- 等待10ms积累消息
- 批量效果好

linger.ms = 100:
- 延迟增加
- 批量效果更好
```

---

## 4. 批量操作最佳实践

### 4.1 Kafka 推荐配置

**高吞吐量场景**：
```java
props.put("batch.size", 32768);      // 32KB
props.put("linger.ms", 50);          // 50ms
props.put("compression.type", "lz4"); // 压缩
props.put("max.poll.records", 1000);  // 批量拉取
```

**低延迟场景**：
```java
props.put("batch.size", 1024);       // 1KB
props.put("linger.ms", 0);           // 立即发送
props.put("max.poll.records", 100);  // 小批量
```

### 4.2 批量处理模式

**数据库批量插入**：
```java
List<Order> orders = new ArrayList<>();

for (ConsumerRecord<String, String> record : records) {
    orders.add(parseOrder(record.value()));
    
    if (orders.size() >= 100) {
        orderDao.batchInsert(orders);
        orders.clear();
    }
}

// 处理剩余
if (!orders.isEmpty()) {
    orderDao.batchInsert(orders);
}
```

**批量 API 调用**：
```java
// 减少 HTTP 请求次数
apiClient.batchProcess(orders);  // 一次调用处理100条
```

---

## 5. 性能对比

### 5.1 批量 vs 单条发送

| 操作 | 单条发送 | 批量发送（100条） | 提升比例 |
|------|---------|------------------|---------|
| Kafka | 10000 TPS | 80000 TPS | 8x |
| RocketMQ | 8000 TPS | 50000 TPS | 6x |
| RabbitMQ | 5000 TPS | 30000 TPS | 6x |

### 5.2 批量 vs 单条消费

| 操作 | 单条消费 | 批量消费（100条） | 提升比例 |
|------|---------|------------------|---------|
| 数据库插入 | 1000 TPS | 10000 TPS | 10x |
| API 调用 | 500 TPS | 5000 TPS | 10x |

---

## 6. 批量操作注意事项

### 6.1 避免批量过大

```java
// ❌ 错误：批量过大导致超时
props.put("batch.size", 10485760);  // 10MB（太大）

// ✅ 正确：合理大小
props.put("batch.size", 32768);  // 32KB
```

### 6.2 处理批量失败

```java
// 批量消费失败处理
try {
    processBatch(msgs);
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
} catch (Exception e) {
    // 批量失败，单条重试
    for (MessageExt msg : msgs) {
        try {
            processMessage(msg);
        } catch (Exception ex) {
            // 记录失败消息
            logFailedMessage(msg);
        }
    }
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
}
```

---

## 关键要点

1. **批量发送**：减少网络往返，提升吞吐量
2. **批量消费**：减少数据库/API调用次数
3. **权衡**：批量大小 vs 延迟
4. **Kafka配置**：batch.size、linger.ms、max.poll.records
5. **性能提升**：6-10倍

---

## 深入一点

**Kafka 批量发送原理**：

```java
// RecordAccumulator 积累消息
public RecordAppendResult append(TopicPartition tp, byte[] key, byte[] value) {
    Deque<ProducerBatch> dq = getOrCreateDeque(tp);
    
    ProducerBatch last = dq.peekLast();
    if (last != null) {
        // 尝试追加到现有批次
        FutureRecordMetadata future = last.tryAppend(key, value);
        if (future != null) {
            return new RecordAppendResult(future, false);
        }
    }
    
    // 创建新批次
    ProducerBatch batch = new ProducerBatch(tp, batchSize);
    dq.addLast(batch);
    
    return new RecordAppendResult(batch.tryAppend(key, value), true);
}

// Sender 线程发送批次
if (batch.size() >= batchSize || 
    now - batch.createdMs >= lingerMs) {
    sendBatch(batch);
}
```

---

## 参考资料

1. [Kafka Producer Batching](https://kafka.apache.org/documentation/#producerconfigs)
2. [RocketMQ Batch Message](https://rocketmq.apache.org/docs/quickStart/02quickstart/)
3. [RabbitMQ Batch Publishing](https://www.rabbitmq.com/publishers.html)

# 消费者性能优化

## 概述

消费者性能决定了系统的消费能力。本章探讨批量消费、并发消费、预取优化等策略。

---

## 1. Kafka 消费者优化

### 1.1 批量拉取

```java
Properties props = new Properties();

// 单次拉取最大字节数（50MB）
props.put("max.partition.fetch.bytes", 52428800);

// 单次拉取最大记录数（500）
props.put("max.poll.records", 500);

// 批量处理
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    // 批量处理（提升性能）
    processBatch(records);
    
    consumer.commitSync();
}
```

### 1.2 并发消费

```java
// 多线程消费
ExecutorService executor = Executors.newFixedThreadPool(10);

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        executor.submit(() -> processMessage(record));
    }
}
```

### 1.3 预取优化

```java
// 增大预取大小
props.put("fetch.min.bytes", 1048576);  // 1MB
props.put("fetch.max.wait.ms", 500);
```

---

## 2. RocketMQ 消费者优化

### 2.1 并发消费

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group");

// 最小消费线程数
consumer.setConsumeThreadMin(20);

// 最大消费线程数
consumer.setConsumeThreadMax(64);

// 单次拉取消息数（32）
consumer.setPullBatchSize(32);

// 单次消费消息数（1）
consumer.setConsumeMessageBatchMaxSize(1);

consumer.start();
```

### 2.2 批量消费

```java
consumer.setConsumeMessageBatchMaxSize(10);  // 批量消费 10 条

consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
        // msgs 最多包含 10 条消息
        processBatch(msgs);
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
```

---

## 3. RabbitMQ 消费者优化

### 3.1 预取优化

```java
// 预取数量（20）
channel.basicQos(20);

channel.basicConsume("queue", false, (consumerTag, delivery) -> {
    processMessage(new String(delivery.getBody()));
    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
}, consumerTag -> {});
```

### 3.2 多消费者

```java
// 启动多个消费者（负载均衡）
for (int i = 0; i < 5; i++) {
    Channel channel = connection.createChannel();
    channel.basicQos(10);
    channel.basicConsume("queue", false, consumer, consumerTag -> {});
}
```

---

## 4. 性能对比

| 优化策略 | TPS 提升 | 说明 |
|---------|---------|------|
| 批量消费 | 2-3x | 减少网络开销 |
| 并发消费 | 3-5x | 充分利用 CPU |
| 预取优化 | 1.5x | 减少网络往返 |
| 连接复用 | 1.2x | 减少连接开销 |

---

## 关键要点

1. **批量消费**：减少网络开销
2. **并发消费**：提升 CPU 利用率
3. **预取优化**：减少网络往返
4. **合理配置线程数**：避免过多线程竞争

---

## 参考资料

1. [Kafka Consumer Performance](https://kafka.apache.org/documentation/#consumerconfigs)
2. [RocketMQ Consumer](https://rocketmq.apache.org/docs/domainModel/04consumer/)

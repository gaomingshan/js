# 消费进度管理

## 概述

消费进度（Offset）管理是消息队列的核心功能，决定了消息的消费位置和重复消费。本章探讨三大消息队列的 Offset 存储、提交策略和重置方法。

---

## 1. Kafka Offset 管理

### 1.1 Offset 存储

**内部 Topic（__consumer_offsets）**：

```
Kafka 将 Offset 存储在特殊 Topic：__consumer_offsets
分区数：50（默认）
副本数：3（推荐）
```

### 1.2 提交策略

**自动提交**：

```java
props.put("enable.auto.commit", "true");
props.put("auto.commit.interval.ms", "5000");
```

**手动同步提交**：

```java
props.put("enable.auto.commit", "false");

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        processMessage(record);
    }
    consumer.commitSync();  // 同步提交
}
```

**手动异步提交**：

```java
consumer.commitAsync((offsets, exception) -> {
    if (exception != null) {
        logger.error("提交失败", exception);
    }
});
```

### 1.3 Offset 重置

```bash
# 重置到最早位置
bin/kafka-consumer-groups.sh --reset-offsets \
  --group my-group \
  --topic my-topic \
  --to-earliest \
  --execute \
  --bootstrap-server localhost:9092

# 重置到最新位置
--to-latest

# 重置到指定时间
--to-datetime 2024-01-01T00:00:00.000

# 重置到指定 Offset
--to-offset 1000
```

---

## 2. RocketMQ Offset 管理

### 2.1 Offset 存储

**集群消费**：Offset 存储在 Broker
**广播消费**：Offset 存储在消费者本地

### 2.2 自动管理

```java
// RocketMQ 自动管理 Offset
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group");
consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, 
                                                   ConsumeConcurrentlyContext context) {
        // 返回 SUCCESS 自动提交 Offset
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
```

### 2.3 Offset 重置

```bash
# 重置到指定时间
sh bin/mqadmin resetOffsetByTime \
  -n localhost:9876 \
  -g my-group \
  -t my-topic \
  -s -3600000  # 1小时前

# 查看消费进度
sh bin/mqadmin consumerProgress \
  -n localhost:9876 \
  -g my-group
```

---

## 3. RabbitMQ Offset 管理

RabbitMQ 使用 ACK 机制，没有 Offset 概念。

**手动 ACK**：

```java
channel.basicConsume("my-queue", false, (consumerTag, delivery) -> {
    try {
        processMessage(new String(delivery.getBody()));
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
    } catch (Exception e) {
        channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
    }
}, consumerTag -> {});
```

---

## 关键要点

1. **Kafka**：Offset 存储在 __consumer_offsets Topic
2. **RocketMQ**：集群消费 Offset 在 Broker，广播消费在本地
3. **RabbitMQ**：基于 ACK 机制，无 Offset
4. **提交策略**：生产环境推荐手动提交
5. **重置Offset**：用于重新消费或跳过错误数据

---

## 参考资料

1. [Kafka Consumer Offsets](https://kafka.apache.org/documentation/#consumerconfigs)
2. [RocketMQ Offset](https://rocketmq.apache.org/docs/domainModel/04consumer/)

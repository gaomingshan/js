# 消费进度管理

## 概述

消费进度（Offset/Consume Offset）记录消费者的消费位置。精确管理消费进度是保证消息不丢失、不重复的关键。

---

## 1. Offset 概念

### 1.1 定义

Offset 是消息在分区/队列中的唯一标识位置。

**Kafka**：
- 每个分区内的消息有唯一递增的 Offset
- 从0开始，持续递增

**RocketMQ**：
- CommitLog Offset：消息在 CommitLog 中的物理位置
- ConsumeQueue Offset：消息在 ConsumeQueue 中的逻辑位置

**RabbitMQ**：
- 没有 Offset 概念
- 使用 ACK 机制确认消费

---

## 2. Kafka Offset 管理

### 2.1 Offset 存储

**存储位置**：
```
__consumer_offsets（内部 Topic）

Key: [group, topic, partition]
Value: offset
```

### 2.2 自动提交

```java
Properties props = new Properties();

// 启用自动提交（默认）
props.put("enable.auto.commit", "true");

// 自动提交间隔（5秒）
props.put("auto.commit.interval.ms", "5000");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        processMessage(record);
    }
    
    // 自动提交 Offset（poll 时触发）
}
```

**风险**：
- 消息处理失败但 Offset 已提交 → 消息丢失
- 消息处理成功但 Offset 未提交 → 消息重复

### 2.3 手动提交

**同步提交**：
```java
props.put("enable.auto.commit", "false");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        processMessage(record);
    }
    
    // 同步提交（阻塞，确保提交成功）
    consumer.commitSync();
}
```

**异步提交**：
```java
consumer.commitAsync((offsets, exception) -> {
    if (exception != null) {
        log.error("Offset 提交失败", exception);
    }
});
```

**按分区提交**：
```java
for (ConsumerRecord<String, String> record : records) {
    processMessage(record);
    
    // 处理完每条消息立即提交该分区 Offset
    Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();
    offsets.put(
        new TopicPartition(record.topic(), record.partition()),
        new OffsetAndMetadata(record.offset() + 1)
    );
    consumer.commitSync(offsets);
}
```

---

## 3. RocketMQ Offset 管理

### 3.1 Offset 存储

**集群消费**：
```
存储位置：Broker
路径：${ROCKETMQ_HOME}/store/config/consumerOffset.json

格式：
{
  "offsetTable": {
    "my-topic@my-group": {
      "0": 1234,  // Queue 0 的 Offset
      "1": 5678
    }
  }
}
```

**广播消费**：
```
存储位置：消费者本地
路径：${user.home}/.rocketmq_offsets/${clientId}/${group}/offsets.json
```

### 3.2 自动提交

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-group");

consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
        
        processMessages(msgs);
        
        // 返回 CONSUME_SUCCESS，自动提交 Offset
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
```

### 3.3 手动提交

```java
// Pull 模式手动管理 Offset
DefaultMQPullConsumer consumer = new DefaultMQPullConsumer("my-group");

Set<MessageQueue> mqs = consumer.fetchSubscribeMessageQueues("my-topic");

for (MessageQueue mq : mqs) {
    // 获取当前 Offset
    long offset = consumer.fetchConsumeOffset(mq, false);
    
    // 拉取消息
    PullResult pullResult = consumer.pull(mq, "*", offset, 32);
    
    if (pullResult.getPullStatus() == PullStatus.FOUND) {
        processMessages(pullResult.getMsgFoundList());
        
        // 手动更新 Offset
        consumer.updateConsumeOffset(mq, pullResult.getNextBeginOffset());
    }
}
```

---

## 4. RabbitMQ ACK 机制

### 4.1 自动 ACK

```java
// 自动确认（危险，消息可能丢失）
channel.basicConsume("queue", true, (consumerTag, delivery) -> {
    processMessage(new String(delivery.getBody()));
    // 消息已自动确认，处理失败也无法重试
});
```

### 4.2 手动 ACK

```java
channel.basicConsume("queue", false, (consumerTag, delivery) -> {
    try {
        processMessage(new String(delivery.getBody()));
        
        // 手动确认
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
    } catch (Exception e) {
        // 拒绝消息，重新入队
        channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
    }
});
```

### 4.3 批量 ACK

```java
// 批量确认（确认当前及之前所有消息）
channel.basicAck(delivery.getEnvelope().getDeliveryTag(), true);
```

---

## 5. Offset 提交策略

### 5.1 提交时机对比

| 策略 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 自动提交 | 简单 | 可能丢失/重复 | 允许少量重复 |
| 同步提交 | 可靠 | 性能较低 | 高可靠性要求 |
| 异步提交 | 性能高 | 可能丢失 | 高性能要求 |
| 按消息提交 | 精确 | 性能最低 | 完全不能丢失 |

### 5.2 推荐策略

**Kafka 推荐**：
```java
// 手动同步提交 + 异步提交兜底
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    processBatch(records);
    
    // 主要使用异步提交（性能高）
    consumer.commitAsync();
}

// 关闭前同步提交（确保提交成功）
try {
    consumer.commitSync();
} finally {
    consumer.close();
}
```

**RocketMQ 推荐**：
```java
// Push 模式自动管理，返回正确的消费状态
return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
```

---

## 6. 消费进度监控

### 6.1 Kafka 监控

```bash
# 查看消费者组 Lag
kafka-consumer-groups.sh --describe --group my-group --bootstrap-server localhost:9092

# 输出：
# TOPIC  PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# my-topic  0       1234            1534            300
# my-topic  1       5678            5678            0
```

### 6.2 RocketMQ 监控

```bash
# 查看消费进度
mqadmin consumerProgress -n localhost:9876 -g my-group

# 输出：
# Topic      QueueId  Diff(Lag)
# my-topic   0        300
# my-topic   1        0
```

### 6.3 Prometheus 监控

```yaml
# Kafka Lag 监控
- alert: KafkaConsumerLag
  expr: kafka_consumergroup_lag > 10000
  annotations:
    summary: "消费Lag超过1万"

# RocketMQ Lag 监控
- alert: RocketMQConsumerLag
  expr: rocketmq_consumer_message_accumulation > 10000
  annotations:
    summary: "消息堆积超过1万"
```

---

## 7. 消费进度告警

```yaml
告警规则：
- Lag > 1万：P2 告警（钉钉）
- Lag > 10万：P1 告警（短信）
- Lag > 100万：P0 告警（电话）

处理策略：
1. 检查消费者是否在线
2. 检查消费者处理速度
3. 临时扩容消费者
4. 优化消费逻辑
```

---

## 关键要点

1. **Kafka Offset**：存储在 __consumer_offsets
2. **RocketMQ Offset**：集群消费存 Broker，广播消费存本地
3. **手动提交**：推荐手动提交保证可靠性
4. **提交时机**：处理成功后立即提交
5. **监控 Lag**：实时监控消费进度

---

## 深入一点

**Kafka Offset 提交流程**：

```
1. Consumer 调用 commitSync()
   ↓
2. 发送 OffsetCommit 请求到 Coordinator
   ↓
3. Coordinator 写入 __consumer_offsets
   ↓
4. 返回确认给 Consumer
   ↓
5. Consumer 更新本地 Offset
```

**RocketMQ Offset 更新流程**：

```
1. Consumer 消费成功返回 CONSUME_SUCCESS
   ↓
2. 更新本地 ProcessQueue Offset
   ↓
3. 定时任务（5秒）持久化 Offset
   ↓
4. 发送更新请求到 Broker
   ↓
5. Broker 更新 consumerOffset.json
```

---

## 参考资料

1. [Kafka Offset Management](https://kafka.apache.org/documentation/#offsetmanagement)
2. [RocketMQ Offset](https://rocketmq.apache.org/docs/domainModel/04consumer/)
3. [RabbitMQ Acknowledgements](https://www.rabbitmq.com/confirms.html)

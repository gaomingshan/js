# 消费位点重置

## 概述

消费位点重置允许重新消费历史消息或跳过部分消息。本章介绍三大消息队列的位点重置方法和应用场景。

---

## 1. 位点重置场景

**常见场景**：
- 消息消费错误，需要重新消费
- 数据回溯，重新处理历史数据
- 跳过异常消息
- 消费者从指定时间点开始消费

---

## 2. Kafka 位点重置

### 2.1 重置到最早

```bash
# 重置到最早位置
kafka-consumer-groups.sh --reset-offsets \
  --group my-group \
  --topic my-topic \
  --to-earliest \
  --execute \
  --bootstrap-server localhost:9092
```

### 2.2 重置到最新

```bash
# 重置到最新位置（跳过所有未消费消息）
kafka-consumer-groups.sh --reset-offsets \
  --group my-group \
  --topic my-topic \
  --to-latest \
  --execute \
  --bootstrap-server localhost:9092
```

### 2.3 重置到指定时间

```bash
# 重置到指定时间点
kafka-consumer-groups.sh --reset-offsets \
  --group my-group \
  --topic my-topic \
  --to-datetime 2024-01-01T00:00:00.000 \
  --execute \
  --bootstrap-server localhost:9092
```

### 2.4 重置到指定 Offset

```bash
# 重置到指定 Offset
kafka-consumer-groups.sh --reset-offsets \
  --group my-group \
  --topic my-topic:0 \
  --to-offset 1000 \
  --execute \
  --bootstrap-server localhost:9092
```

### 2.5 代码重置

```java
// 代码中重置 Offset
consumer.subscribe(Arrays.asList("my-topic"));

// 手动 seek 到指定位置
consumer.poll(Duration.ofMillis(100));  // 触发分区分配

for (TopicPartition partition : consumer.assignment()) {
    // 重置到最早
    consumer.seekToBeginning(Arrays.asList(partition));
    
    // 或重置到最新
    // consumer.seekToEnd(Arrays.asList(partition));
    
    // 或重置到指定 Offset
    // consumer.seek(partition, 1000);
}
```

---

## 3. RocketMQ 位点重置

### 3.1 命令行重置

```bash
# 按时间重置
mqadmin resetOffsetByTime \
  -n localhost:9876 \
  -g my-group \
  -t my-topic \
  -s -3600000  # 1小时前（毫秒）

# 重置到最早
mqadmin resetOffsetByTime \
  -n localhost:9876 \
  -g my-group \
  -t my-topic \
  -s -1

# 重置到最新
mqadmin resetOffsetByTime \
  -n localhost:9876 \
  -g my-group \
  -t my-topic \
  -s 0
```

### 3.2 代码重置

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-group");

// 设置消费起始位置
consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
// 或
// consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_LAST_OFFSET);
// consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_TIMESTAMP);

consumer.start();
```

---

## 4. RabbitMQ 消息重放

### 4.1 消息重新入队

```java
channel.basicConsume("queue", false, (consumerTag, delivery) -> {
    try {
        processMessage(new String(delivery.getBody()));
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
    } catch (Exception e) {
        // 重新入队（消息会被重新投递）
        channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
    }
});
```

### 4.2 死信队列恢复

```bash
# 从死信队列移回原队列
rabbitmq-shovel 工具配置
```

---

## 5. 位点重置注意事项

### 5.1 Kafka 注意事项

**必须停止消费者**：
```bash
# 1. 停止所有消费者
# 2. 执行重置命令
kafka-consumer-groups.sh --reset-offsets ...

# 3. 重启消费者
```

**验证重置结果**：
```bash
# 查看重置后的 Offset
kafka-consumer-groups.sh --describe --group my-group --bootstrap-server localhost:9092
```

### 5.2 RocketMQ 注意事项

**在线重置**：
```bash
# RocketMQ 支持在线重置，但建议停止消费者
# 避免重置过程中的消息重复消费
```

---

## 6. 消息回溯

### 6.1 Kafka 消息回溯

```java
// 回溯到3小时前
long timestamp = System.currentTimeMillis() - 3 * 60 * 60 * 1000;

Map<TopicPartition, Long> timestampsToSearch = new HashMap<>();
for (TopicPartition partition : consumer.assignment()) {
    timestampsToSearch.put(partition, timestamp);
}

Map<TopicPartition, OffsetAndTimestamp> offsetsForTimes = 
    consumer.offsetsForTimes(timestampsToSearch);

for (Map.Entry<TopicPartition, OffsetAndTimestamp> entry : offsetsForTimes.entrySet()) {
    consumer.seek(entry.getKey(), entry.getValue().offset());
}
```

### 6.2 RocketMQ 消息回溯

```bash
# 回溯到指定时间
mqadmin resetOffsetByTime \
  -n localhost:9876 \
  -g my-group \
  -t my-topic \
  -s "2024-01-01 00:00:00"
```

---

## 7. 跳过异常消息

### 7.1 Kafka 跳过

```java
// 跳过当前消息，消费下一条
consumer.seek(partition, currentOffset + 1);
```

### 7.2 RocketMQ 跳过

```java
// 消费失败时返回 CONSUME_SUCCESS（慎用）
return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
```

### 7.3 RabbitMQ 跳过

```java
// 拒绝消息，不重新入队
channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, false);
```

---

## 8. 位点管理最佳实践

### 8.1 定期备份 Offset

```bash
# Kafka 导出 Offset
kafka-consumer-groups.sh --describe --group my-group --bootstrap-server localhost:9092 > offsets-backup.txt

# RocketMQ 导出
mqadmin consumerProgress -n localhost:9876 -g my-group > offsets-backup.txt
```

### 8.2 灰度重置

```bash
# 先在测试环境验证
# 再在生产环境小流量验证
# 最后全量重置
```

### 8.3 监控重置影响

```yaml
# 监控重置后的消费速度和 Lag
- kafka_consumergroup_lag
- rocketmq_consumer_tps
```

---

## 关键要点

1. **Kafka**：必须停止消费者才能重置
2. **RocketMQ**：支持在线重置
3. **重置方式**：earliest、latest、时间点、指定 Offset
4. **应用场景**：数据回溯、跳过异常、从指定时间消费
5. **谨慎操作**：重置会导致重复消费或消息丢失

---

## 深入一点

**Kafka 位点重置原理**：

```
1. 停止消费者
   ↓
2. 计算新的 Offset
   ↓
3. 更新 __consumer_offsets
   ↓
4. 消费者重启
   ↓
5. 从新 Offset 开始消费
```

**RocketMQ 位点重置原理**：

```
1. 根据时间戳查找 Offset
   ↓
2. 更新 Broker 的 consumerOffset.json
   ↓
3. 消费者下次拉取时使用新 Offset
```

---

## 参考资料

1. [Kafka Offset Reset](https://kafka.apache.org/documentation/#basic_ops_consumer_group)
2. [RocketMQ Offset Reset](https://rocketmq.apache.org/docs/cli/04admin/)
3. [RabbitMQ Message Acknowledgements](https://www.rabbitmq.com/confirms.html)

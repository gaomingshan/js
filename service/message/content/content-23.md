# 消费者重平衡

## 概述

消费者重平衡（Rebalance）确保分区/队列在消费者之间均匀分配。本章探讨 Kafka 和 RocketMQ 的重平衡机制、触发条件及优化策略。

---

## 1. Kafka 重平衡机制

### 1.1 触发条件

1. 消费者加入或离开
2. 订阅的 Topic 分区数变化
3. 消费者崩溃超时

### 1.2 重平衡流程

```
1. 消费者发送 JoinGroup 请求
   ↓
2. Coordinator 选出 Leader 消费者
   ↓
3. Leader 执行分区分配策略
   ↓
4. Coordinator 分发分配结果
   ↓
5. 消费者开始消费新分区
```

### 1.3 影响

**Stop-the-World**：
- 重平衡期间，所有消费者停止消费
- 可能导致消息重复消费
- 影响消费延迟

### 1.4 优化策略

**增量重平衡（CooperativeSticky）**：

```java
props.put("partition.assignment.strategy", 
    "org.apache.kafka.clients.consumer.CooperativeStickyAssignor");

// 特点：
// - 只停止需要迁移的分区
// - 其他分区继续消费
// - 减少重平衡影响
```

**配置优化**：

```java
// 增加会话超时，减少误判
props.put("session.timeout.ms", "30000");

// 增加心跳间隔
props.put("heartbeat.interval.ms", "10000");

// 增加拉取超时
props.put("max.poll.interval.ms", "300000");
```

---

## 2. RocketMQ 重平衡机制

### 2.1 定期重平衡

```
RocketMQ 每 20 秒自动重平衡：
1. 获取所有在线消费者
2. 获取所有 MessageQueue
3. 执行分配策略
4. 更新消费者分配结果
```

### 2.2 重平衡策略

**平均分配（默认）**：

```java
consumer.setAllocateMessageQueueStrategy(new AllocateMessageQueueAveragely());
```

**一致性哈希**：

```java
consumer.setAllocateMessageQueueStrategy(new AllocateMessageQueueConsistentHash());
```

### 2.3 优化

```java
// 禁用重平衡（不推荐）
// RocketMQ 无法完全禁用，但可通过固定消费者数量减少影响
```

---

## 3. 重平衡最佳实践

### 3.1 避免频繁重平衡

**固定消费者数量**：

```java
// 使用固定数量的消费者实例
// 避免频繁扩缩容
```

**增大超时配置**：

```java
// Kafka
props.put("session.timeout.ms", "45000");
props.put("max.poll.interval.ms", "600000");
```

### 3.2 监控重平衡

**Kafka 监控**：

```java
// 监控 JMX 指标
// kafka.consumer:type=consumer-coordinator-metrics,client-id=*
// rebalance-latency-avg
// rebalance-latency-max
// rebalance-total
```

**告警规则**：

```yaml
# Prometheus 告警
- alert: KafkaFrequentRebalance
  expr: rate(kafka_consumer_coordinator_rebalance_total[5m]) > 0.1
  annotations:
    summary: "频繁重平衡"
```

---

## 关键要点

1. **Kafka 重平衡**：Stop-the-World，影响消费
2. **增量重平衡**：CooperativeSticky 策略减少影响
3. **RocketMQ**：每 20 秒自动重平衡
4. **优化**：增大超时、固定消费者数量
5. **监控**：监控重平衡频率和延迟

---

## 参考资料

1. [Kafka Rebalance Protocol](https://kafka.apache.org/documentation/#consumerrebalance)
2. [RocketMQ Load Balance](https://rocketmq.apache.org/docs/domainModel/04consumer/)

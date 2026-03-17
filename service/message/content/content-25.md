# 消息堆积处理

## 概述

消息堆积是消息队列常见问题，影响系统性能和稳定性。本章探讨堆积原因分析、监控告警和处理方案。

---

## 1. 堆积原因分析

### 1.1 常见原因

**生产速度 > 消费速度**：
- 突发流量
- 促销活动
- 爬虫攻击

**消费者故障**：
- 消费者宕机
- 网络故障
- 数据库慢查询

**消费逻辑问题**：
- 业务逻辑耗时
- 资源竞争
- 死锁

---

## 2. 堆积监控

### 2.1 Kafka 监控

```bash
# 查看消费者组 Lag
bin/kafka-consumer-groups.sh --describe \
  --group my-group \
  --bootstrap-server localhost:9092

# 输出：
# TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# my-topic  0          1000            1500            500  ← 堆积 500 条
```

**Prometheus 监控**：

```yaml
# kafka_consumergroup_lag > 阈值告警
- alert: KafkaConsumerLag
  expr: kafka_consumergroup_lag > 10000
  annotations:
    summary: "消息堆积超过 10000"
```

### 2.2 RocketMQ 监控

```bash
# 查看消费进度
sh bin/mqadmin consumerProgress -n localhost:9876 -g my-group

# 输出：
# Topic          QueueId  Broker  Diff
# TestTopic      0        broker-a  5000  ← 堆积 5000 条
```

### 2.3 RabbitMQ 监控

```bash
# 查看队列消息数
sudo rabbitmqctl list_queues name messages

# 或通过 HTTP API
curl -u admin:admin http://localhost:15672/api/queues
```

---

## 3. 堆积处理方案

### 3.1 临时扩容消费者

**Kafka 扩容**：

```bash
# 前提：分区数 >= 消费者数

# 启动更多消费者（自动触发重平衡）
java -jar consumer.jar

# 监控 Lag 下降
bin/kafka-consumer-groups.sh --describe --group my-group
```

**RocketMQ 扩容**：

```bash
# 启动更多消费者
java -jar consumer.jar

# 增加消费线程
consumer.setConsumeThreadMin(20);
consumer.setConsumeThreadMax(64);
```

### 3.2 增加分区/队列

**Kafka 增加分区**：

```bash
# 增加分区数
bin/kafka-topics.sh --alter \
  --topic my-topic \
  --partitions 12 \
  --bootstrap-server localhost:9092

# 重启消费者（自动分配新分区）
```

**RocketMQ 增加队列**：

```bash
# 增加读写队列数
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t MyTopic \
  -r 16 \
  -w 16
```

### 3.3 优化消费逻辑

**批量处理**：

```java
// Kafka 批量提交
List<Record> batch = new ArrayList<>();
for (ConsumerRecord<String, String> record : records) {
    batch.add(record);
    if (batch.size() >= 100) {
        batchProcess(batch);
        batch.clear();
        consumer.commitSync();
    }
}
```

**异步处理**：

```java
// 异步处理消息
ExecutorService executor = Executors.newFixedThreadPool(20);

for (ConsumerRecord<String, String> record : records) {
    executor.submit(() -> {
        processMessage(record);
    });
}
```

**减少外部调用**：

```java
// ❌ 每条消息查询数据库
for (ConsumerRecord<String, String> record : records) {
    User user = userDao.findById(record.value());
    processMessage(user);
}

// ✅ 批量查询
List<String> ids = records.stream()
    .map(ConsumerRecord::value)
    .collect(Collectors.toList());
Map<String, User> users = userDao.batchFindByIds(ids);
for (ConsumerRecord<String, String> record : records) {
    processMessage(users.get(record.value()));
}
```

### 3.4 跳过堆积消息（临时方案）

**Kafka 跳过**：

```bash
# 重置到最新位置（跳过所有堆积）
bin/kafka-consumer-groups.sh --reset-offsets \
  --group my-group \
  --topic my-topic \
  --to-latest \
  --execute
```

**RocketMQ 跳过**：

```bash
# 重置到当前时间
sh bin/mqadmin resetOffsetByTime \
  -n localhost:9876 \
  -g my-group \
  -t MyTopic \
  -s 0  # 0 表示当前时间
```

---

## 4. 堆积预防

### 4.1 容量规划

```
消费能力 >= 生产峰值 × 1.5

示例：
生产峰值：10000 TPS
消费能力：15000 TPS（预留 50% 余量）
```

### 4.2 流量削峰

**限流**：

```java
// Guava RateLimiter
RateLimiter limiter = RateLimiter.create(1000);  // 1000 TPS

for (int i = 0; i < 10000; i++) {
    limiter.acquire();
    producer.send(record);
}
```

**缓冲队列**：

```java
// 本地队列缓冲
BlockingQueue<Message> buffer = new LinkedBlockingQueue<>(10000);

// 生产者：写入缓冲队列
buffer.offer(message);

// 消费者：批量发送
List<Message> batch = new ArrayList<>();
buffer.drainTo(batch, 100);
producer.send(batch);
```

### 4.3 告警策略

```yaml
# Prometheus 告警规则
groups:
  - name: mq_alerts
    rules:
      # P1：堆积超过 1 万
      - alert: MessageLagHigh
        expr: kafka_consumergroup_lag > 10000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "消息堆积超过 1 万"
      
      # P0：堆积超过 10 万
      - alert: MessageLagCritical
        expr: kafka_consumergroup_lag > 100000
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "消息堆积超过 10 万，立即处理"
```

---

## 5. 堆积处理最佳实践

### 5.1 应急预案

```
1. 监控告警 → 发现堆积
   ↓
2. 分析原因 → 定位瓶颈
   ↓
3. 临时扩容 → 快速缓解
   ↓
4. 优化逻辑 → 根治问题
   ↓
5. 复盘总结 → 预防复发
```

### 5.2 长期优化

**性能优化**：
- 批量处理
- 异步化
- 缓存预热
- 数据库索引优化

**架构优化**：
- 读写分离
- 缓存层
- 降级策略
- 熔断机制

---

## 关键要点

1. **监控**：实时监控 Lag，及时发现堆积
2. **扩容**：临时扩容消费者，增加分区/队列
3. **优化**：批量处理、异步化、减少外部调用
4. **预防**：容量规划、流量削峰、告警策略
5. **应急**：跳过堆积消息（谨慎使用）

---

## 深入一点

### 为什么不能无限扩容消费者？

**Kafka 限制**：
- 消费者数 ≤ 分区数
- 多余的消费者空闲

**RocketMQ 限制**：
- 消费者数 ≤ 队列数
- 多余的消费者空闲

**解决方案**：
1. 增加分区/队列数
2. 优化单个消费者性能（批量、异步）
3. 拆分 Topic（按业务隔离）

---

## 参考资料

1. [Kafka Consumer Lag](https://kafka.apache.org/documentation/#monitoring)
2. [RocketMQ Consumer Progress](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)
3. [消息队列性能优化实战](https://www.infoq.cn/article/message-queue-performance-optimization)

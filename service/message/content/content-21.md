# 消费者组与集群消费

## 概述

消费者组（Consumer Group）是消息队列实现水平扩展和负载均衡的关键机制。本章深入探讨三大消息队列的消费者组实现。

---

## 1. 消费者组概念

**定义**：
- 多个消费者实例组成一个组
- 每条消息只被组内一个消费者消费
- 实现负载均衡和水平扩展

**作用**：
- 提升消费能力
- 高可用（实例故障自动转移）
- 隔离不同业务

---

## 2. Kafka 消费者组

### 2.1 分区分配

```java
Properties props = new Properties();
props.put("group.id", "my-group");  // 消费者组ID
props.put("bootstrap.servers", "localhost:9092");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("my-topic"));

// 消费者组自动分配分区
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    processRecords(records);
    consumer.commitSync();
}
```

### 2.2 分区分配策略

**Range 策略**（默认）：
```
Topic: my-topic, Partitions: 6
Consumer Group: 3 consumers

Consumer-1: [0, 1]
Consumer-2: [2, 3]
Consumer-3: [4, 5]
```

**RoundRobin 策略**：
```
多 Topic 场景，按分区轮询分配
```

**Sticky 策略**：
```
尽量保持之前的分配，减少重平衡影响
```

**配置**：
```java
props.put("partition.assignment.strategy", 
    "org.apache.kafka.clients.consumer.StickyAssignor");
```

### 2.3 消费者数量与分区数

**规则**：
- 消费者数量 ≤ 分区数：每个消费者分配多个分区
- 消费者数量 = 分区数：一对一分配
- 消费者数量 > 分区数：多余消费者空闲

**示例**：
```
Partitions: 6

3 Consumers: 每个消费 2 个分区（最优）
6 Consumers: 每个消费 1 个分区
10 Consumers: 6 个有分区，4 个空闲（浪费）
```

---

## 3. RocketMQ 消费者组

### 3.1 负载均衡

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-group");
consumer.setNamesrvAddr("localhost:9876");

// 集群消费（默认）
consumer.setMessageModel(MessageModel.CLUSTERING);

consumer.subscribe("my-topic", "*");
consumer.start();
```

### 3.2 负载均衡策略

**平均分配策略**（默认）：
```
Queue: 8
Consumers: 3

Consumer-1: [0, 1, 2]
Consumer-2: [3, 4, 5]
Consumer-3: [6, 7]
```

**环形分配策略**：
```java
consumer.setAllocateMessageQueueStrategy(
    new AllocateMessageQueueAveragelyByCircle());
```

### 3.3 动态扩缩容

```java
// 新增消费者实例
DefaultMQPushConsumer consumer2 = new DefaultMQPushConsumer("my-group");
consumer2.start();  // 自动触发 Rebalance

// 移除消费者
consumer.shutdown();  // 其他消费者接管其队列
```

---

## 4. RabbitMQ 多消费者

### 4.1 Work Queue 模式

```java
// 多个消费者竞争同一队列
ConnectionFactory factory = new ConnectionFactory();
Connection connection = factory.newConnection();

// 消费者1
Channel channel1 = connection.createChannel();
channel1.basicQos(10);  // 预取10条
channel1.basicConsume("queue", false, consumer1);

// 消费者2
Channel channel2 = connection.createChannel();
channel2.basicQos(10);
channel2.basicConsume("queue", false, consumer2);

// RabbitMQ 轮询分配消息
```

### 4.2 公平分发

```java
// 默认轮询分发（可能不公平）
channel.basicQos(1);  // 每次只分配1条

// 消费完才分配下一条，避免慢消费者积压
```

---

## 5. 对比分析

| 特性 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 组概念 | Consumer Group | Consumer Group | 无（队列级别） |
| 分配单位 | Partition | MessageQueue | Message |
| 分配策略 | Range/RoundRobin/Sticky | 平均/环形 | 轮询/公平 |
| 重平衡 | 有 | 有 | 无 |
| 消费者上限 | 分区数 | 队列数 | 无限制 |

---

## 6. 最佳实践

### 6.1 消费者数量规划

**Kafka**：
```
消费者数 = 分区数（最佳）
或
消费者数 = 分区数 / 2（预留扩容空间）
```

**RocketMQ**：
```
消费者数 ≤ 队列数
建议：消费者数 = 队列数 / 2
```

### 6.2 消费者组命名

```
格式：<业务>-<服务>-consumer-group

示例：
- order-service-consumer-group
- payment-notify-consumer-group
- log-collect-consumer-group
```

### 6.3 避免常见错误

```java
// ❌ 错误：同一应用使用不同 group.id
consumer1.setGroupId("group-1");
consumer2.setGroupId("group-2");  // 重复消费

// ✅ 正确：同一应用使用相同 group.id
consumer1.setGroupId("my-app-group");
consumer2.setGroupId("my-app-group");
```

---

## 关键要点

1. **消费者组**：实现负载均衡和水平扩展
2. **分区数限制**：Kafka/RocketMQ 消费者数不超过分区数
3. **分配策略**：Range、RoundRobin、Sticky
4. **动态扩缩容**：自动触发 Rebalance
5. **RabbitMQ**：无消费者组概念，队列级别竞争消费

---

## 深入一点

**Kafka Rebalance 流程**：

```
1. 消费者加入/离开
   ↓
2. 触发 Rebalance
   ↓
3. 选举 Group Coordinator
   ↓
4. 消费者上报订阅信息
   ↓
5. Leader 计算分配方案
   ↓
6. Coordinator 下发分配
   ↓
7. 消费者连接新分区
```

**问题**：
- Rebalance 期间停止消费（Stop-the-World）
- 频繁 Rebalance 影响性能

**优化**：
- 使用 Sticky 策略减少分区迁移
- 增大 session.timeout.ms
- 减少 max.poll.interval.ms 超时

---

## 参考资料

1. [Kafka Consumer Groups](https://kafka.apache.org/documentation/#consumerconfigs)
2. [RocketMQ Load Balance](https://rocketmq.apache.org/docs/domainModel/04consumer/)
3. [RabbitMQ Work Queues](https://www.rabbitmq.com/tutorials/tutorial-two-java.html)

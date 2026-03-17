# 广播消费 vs 集群消费

## 概述

集群消费和广播消费是两种不同的消费语义。集群消费实现负载均衡，广播消费让每个消费者都能收到消息。

---

## 1. 集群消费（Clustering）

### 1.1 定义

消息负载均衡，每条消息只被消费者组内的一个实例消费。

**特点**：
- 提升消费能力
- 避免重复处理
- 水平扩展

### 1.2 Kafka 集群消费

```java
Properties props = new Properties();
props.put("group.id", "my-group");  // 同一组内集群消费

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("my-topic"));

// 消息只被组内一个消费者处理
```

### 1.3 RocketMQ 集群消费

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-group");

// 集群消费（默认）
consumer.setMessageModel(MessageModel.CLUSTERING);

consumer.subscribe("my-topic", "*");
consumer.start();

// 同一组内的消费者负载均衡消费
```

---

## 2. 广播消费（Broadcasting）

### 2.1 定义

每个消费者实例都消费所有消息。

**特点**：
- 每个实例都处理
- 适合配置更新、缓存刷新
- 消息量 × 实例数

### 2.2 RocketMQ 广播消费

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-group");

// 广播消费
consumer.setMessageModel(MessageModel.BROADCASTING);

consumer.subscribe("config-update", "*");
consumer.start();

// 每个消费者实例都会收到消息
```

### 2.3 Kafka 实现广播

Kafka 没有原生广播，通过不同消费者组实现：

```java
// 消费者1（group-1）
Properties props1 = new Properties();
props1.put("group.id", "group-1");
KafkaConsumer<String, String> consumer1 = new KafkaConsumer<>(props1);

// 消费者2（group-2）
Properties props2 = new Properties();
props2.put("group.id", "group-2");
KafkaConsumer<String, String> consumer2 = new KafkaConsumer<>(props2);

// 两个消费者都消费所有消息
```

---

## 3. RabbitMQ 实现

### 3.1 集群消费（Work Queue）

```java
// 多个消费者竞争同一队列
channel.basicConsume("queue", false, consumer1);
channel.basicConsume("queue", false, consumer2);

// RabbitMQ 轮询分配
```

### 3.2 广播消费（Fanout Exchange）

```java
// 声明 Fanout Exchange
channel.exchangeDeclare("broadcast-exchange", "fanout");

// 每个消费者创建独占队列
String queue1 = channel.queueDeclare().getQueue();
String queue2 = channel.queueDeclare().getQueue();

// 绑定到 Exchange
channel.queueBind(queue1, "broadcast-exchange", "");
channel.queueBind(queue2, "broadcast-exchange", "");

// 消费者1和2都收到所有消息
channel.basicConsume(queue1, true, consumer1);
channel.basicConsume(queue2, true, consumer2);
```

---

## 4. 对比分析

### 4.1 功能对比

| MQ | 集群消费 | 广播消费 |
|----------|---------|---------|
| Kafka | 同 group.id | 不同 group.id |
| RocketMQ | CLUSTERING | BROADCASTING |
| RabbitMQ | 同队列竞争 | Fanout Exchange |

### 4.2 特性对比

| 特性 | 集群消费 | 广播消费 |
|------|---------|---------|
| 消费次数 | 每条消息1次 | 每个实例1次 |
| 吞吐量 | 随实例数线性增长 | 不增长 |
| Offset管理 | Broker端 | 本地（RocketMQ） |
| 适用场景 | 业务处理 | 配置更新、缓存刷新 |

---

## 5. 应用场景

### 5.1 集群消费场景

**订单处理**：
```java
// 多个实例并行处理订单
consumer.setMessageModel(MessageModel.CLUSTERING);
consumer.subscribe("orders", "*");
```

**日志收集**：
```java
// 多个收集器分担日志处理
consumer.setGroupId("log-collector-group");
consumer.subscribe("logs");
```

### 5.2 广播消费场景

**配置更新**：
```java
// 所有服务实例都需要更新配置
consumer.setMessageModel(MessageModel.BROADCASTING);
consumer.subscribe("config-update", "*");

consumer.registerMessageListener((msgs, context) -> {
    reloadConfig();  // 每个实例都重新加载配置
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
});
```

**缓存刷新**：
```java
// 所有实例刷新本地缓存
consumer.subscribe("cache-invalidation", "*");
consumer.registerMessageListener((msgs, context) -> {
    clearCache();  // 清空本地缓存
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
});
```

---

## 6. Offset 管理差异

### 6.1 集群消费 Offset

**Kafka**：
```
存储位置：Broker (__consumer_offsets)
管理方式：Consumer Group 统一管理
```

**RocketMQ**：
```
存储位置：Broker
管理方式：Consumer Group 统一管理
```

### 6.2 广播消费 Offset

**RocketMQ**：
```java
// 广播消费 Offset 存储在本地
消费者本地路径：
${user.home}/.rocketmq_offsets/${clientId}/${group}/${topic}@{brokerName}#{queueId}

每个实例独立管理 Offset
```

**Kafka**：
```
使用不同 group.id，每个组独立管理 Offset
```

---

## 7. 性能影响

### 7.1 集群消费

```
消息量：10000条/秒
消费者：5个

每个消费者处理：2000条/秒
总吞吐量：10000条/秒
```

### 7.2 广播消费

```
消息量：1000条/秒
消费者：5个

每个消费者处理：1000条/秒
总处理量：5000条/秒（重复处理）
```

---

## 关键要点

1. **集群消费**：负载均衡，每条消息只被消费一次
2. **广播消费**：每个实例都消费，适合配置更新
3. **Kafka**：通过不同 group.id 实现广播
4. **RocketMQ**：原生支持 CLUSTERING/BROADCASTING
5. **RabbitMQ**：Fanout Exchange 实现广播

---

## 深入一点

**RocketMQ 广播消费实现**：

```java
// 消费者端
if (messageModel == MessageModel.BROADCASTING) {
    // 不需要锁定队列
    // Offset 存储在本地
    this.offsetStore = new LocalFileOffsetStore(
        this.mQClientFactory, this.groupName());
} else {
    // 集群消费，Offset 存储在 Broker
    this.offsetStore = new RemoteBrokerOffsetStore(
        this.mQClientFactory, this.groupName());
}

// 每个实例独立消费，不会触发 Rebalance
```

---

## 参考资料

1. [Kafka Consumer Groups](https://kafka.apache.org/documentation/#consumerapi)
2. [RocketMQ Message Model](https://rocketmq.apache.org/docs/domainModel/04consumer/)
3. [RabbitMQ Fanout Exchange](https://www.rabbitmq.com/tutorials/tutorial-three-java.html)

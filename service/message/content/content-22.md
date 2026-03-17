# 集群消费与广播消费

## 概述

集群消费和广播消费是两种不同的消息分发模式。集群消费实现负载均衡，广播消费实现全员通知。本章对比三大消息队列的消费模式实现。

---

## 1. 消费模式对比

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| 集群消费 | 消费者组内每条消息只被一个消费者消费 | 任务分发、负载均衡 |
| 广播消费 | 每个消费者都消费全量消息 | 配置更新、缓存刷新 |

---

## 2. Kafka 消费模式

**集群消费（默认）**：

```java
// 相同 group.id 的消费者形成消费者组
Properties props = new Properties();
props.put("group.id", "my-consumer-group");

KafkaConsumer<String, String> consumer1 = new KafkaConsumer<>(props);
KafkaConsumer<String, String> consumer2 = new KafkaConsumer<>(props);

// 消息在 consumer1 和 consumer2 之间负载均衡
```

**广播消费（模拟）**：

```java
// 每个消费者使用不同的 group.id
props.put("group.id", "consumer1-" + UUID.randomUUID());

// 每个消费者都消费全量消息
```

---

## 3. RocketMQ 消费模式

**集群消费（CLUSTERING，默认）**：

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-group");
consumer.setMessageModel(MessageModel.CLUSTERING);

// 消费者组内负载均衡
consumer.subscribe("TopicTest", "*");
consumer.start();
```

**广播消费（BROADCASTING）**：

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-group");
consumer.setMessageModel(MessageModel.BROADCASTING);

// 每个消费者都消费全量消息
consumer.subscribe("TopicTest", "*");
consumer.start();
```

**对比**：

| 特性 | 集群消费 | 广播消费 |
|------|---------|---------|
| Offset 存储 | Broker | 消费者本地 |
| 消费进度 | 共享 | 独立 |
| 重试 | 支持 | 不支持 |
| 消息堆积 | 可能堆积 | 不堆积（每个消费者独立） |

---

## 4. RabbitMQ 消费模式

**集群消费（Work Queue）**：

```java
// 多个消费者消费同一队列
channel.basicQos(1);  // 公平分发

channel.basicConsume("work-queue", false, consumer1, consumerTag -> {});
channel.basicConsume("work-queue", false, consumer2, consumerTag -> {});

// 消息在 consumer1 和 consumer2 之间轮询分发
```

**广播消费（Fanout Exchange）**：

```java
// 1. 声明 Fanout Exchange
channel.exchangeDeclare("broadcast-exchange", "fanout");

// 2. 每个消费者声明独立队列
channel.queueDeclare("queue1", false, true, true, null);
channel.queueBind("queue1", "broadcast-exchange", "");

channel.queueDeclare("queue2", false, true, true, null);
channel.queueBind("queue2", "broadcast-exchange", "");

// 3. 消费各自队列
channel.basicConsume("queue1", true, consumer1, consumerTag -> {});
channel.basicConsume("queue2", true, consumer2, consumerTag -> {});

// 发布消息到 Fanout Exchange，所有队列都收到
channel.basicPublish("broadcast-exchange", "", null, message.getBytes());
```

---

## 5. 应用场景

### 5.1 集群消费场景

**订单处理**：

```java
// 多个消费者处理订单，负载均衡
consumer.subscribe("OrderTopic", "*");
consumer.setMessageModel(MessageModel.CLUSTERING);
```

**任务分发**：

```java
// 分布式任务处理
consumer.subscribe("TaskTopic", "*");
```

### 5.2 广播消费场景

**配置更新**：

```java
// 所有服务实例更新配置
consumer.subscribe("ConfigTopic", "*");
consumer.setMessageModel(MessageModel.BROADCASTING);

consumer.registerMessageListener((msgs, context) -> {
    for (MessageExt msg : msgs) {
        String config = new String(msg.getBody());
        configService.update(config);
    }
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
});
```

**缓存刷新**：

```java
// 所有节点刷新缓存
consumer.subscribe("CacheTopic", "*");
consumer.setMessageModel(MessageModel.BROADCASTING);
```

---

## 关键要点

1. **Kafka**：通过 group.id 实现集群消费，广播需多个独立组
2. **RocketMQ**：原生支持 CLUSTERING 和 BROADCASTING
3. **RabbitMQ**：Work Queue 实现集群，Fanout Exchange 实现广播
4. **选择**：大多数场景使用集群消费，广播用于全员通知
5. **注意**：广播消费无重试机制，需保证幂等性

---

## 参考资料

1. [Kafka Consumer Groups](https://kafka.apache.org/documentation/#consumerconfigs)
2. [RocketMQ Message Model](https://rocketmq.apache.org/docs/domainModel/04consumer/)
3. [RabbitMQ Work Queues](https://www.rabbitmq.com/tutorials/tutorial-two-java.html)

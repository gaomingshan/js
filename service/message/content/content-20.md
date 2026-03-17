# 推拉模型对比

## 概述

消费模型决定了消息如何从 Broker 传递到消费者。推模型（Push）和拉模型（Pull）各有优劣，本章将对比三大消息队列的消费模型，并提供选型建议。

---

## 1. 推拉模型原理

**Push 模型（推模型）**：
- Broker 主动推送消息给消费者
- 实时性高
- 可能压垮慢消费者

**Pull 模型（拉模型）**：
- 消费者主动拉取消息
- 消费者控制消费速度
- 需要处理空轮询

---

## 2. Kafka 消费模型（Pull）

**纯拉模型**：

```java
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        processMessage(record);
    }
    
    consumer.commitSync();
}
```

**优势**：
- 消费者控制消费速度
- 支持批量拉取
- 减轻 Broker 压力

**长轮询优化**：

```java
// fetch.min.bytes=1（默认）
// fetch.max.wait.ms=500（默认）

// 逻辑：
// 如果有数据 → 立即返回
// 如果无数据 → 等待最多 500ms 或凑够 1 byte 再返回
```

---

## 3. RocketMQ 消费模型

**Push 模式（伪推模式）**：

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group");
consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs, 
                                                   ConsumeConcurrentlyContext context) {
        // 回调处理
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
consumer.start();
```

**本质**：底层仍是 Pull，但封装成 Push 接口。

**Pull 模式（已废弃）**：

```java
DefaultMQPullConsumer consumer = new DefaultMQPullConsumer("group");
// 手动拉取和管理 Offset（不推荐使用）
```

---

## 4. RabbitMQ 消费模型

**Push 模式（默认）**：

```java
channel.basicConsume("my-queue", false, (consumerTag, delivery) -> {
    processMessage(new String(delivery.getBody()));
    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
}, consumerTag -> {});
```

**Pull 模式（不推荐）**：

```java
GetResponse response = channel.basicGet("my-queue", false);
if (response != null) {
    processMessage(new String(response.getBody()));
    channel.basicAck(response.getEnvelope().getDeliveryTag(), false);
}
```

---

## 5. 模型对比

| 特性 | Push | Pull |
|------|------|------|
| 实时性 | 高 | 中（长轮询优化后接近 Push） |
| 流控 | Broker 控制 | 消费者控制 |
| 批量消费 | 困难 | 容易 |
| 慢消费者 | 可能压垮 | 自动降速 |
| 空轮询 | 无 | 需优化 |

---

## 关键要点

1. **Kafka**：纯拉模型，长轮询优化
2. **RocketMQ**：Push 是对 Pull 的封装
3. **RabbitMQ**：Push 为主，Pull 不推荐
4. **选择**：Pull 模型更适合高吞吐场景
5. **流控**：Push 需要流控机制防止压垮消费者

---

## 参考资料

1. [Kafka Consumer](https://kafka.apache.org/documentation/#consumerapi)
2. [RocketMQ Consumer](https://rocketmq.apache.org/docs/domainModel/04consumer/)

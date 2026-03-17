# 推模型 vs 拉模型

## 概述

推模型（Push）和拉模型（Pull）是消息消费的两种基本模式。本章对比两种模型的特点、实现和适用场景。

---

## 1. 推模型（Push）

### 1.1 原理

Broker 主动推送消息给消费者。

**特点**：
- 实时性高
- 消费者简单
- 可能压垮慢消费者
- Broker 压力大

### 1.2 RabbitMQ Push 实现

```java
// RabbitMQ 默认 Push 模式
channel.basicConsume("queue", false, new DefaultConsumer(channel) {
    @Override
    public void handleDelivery(String consumerTag, Envelope envelope,
                              AMQP.BasicProperties properties, byte[] body) {
        String message = new String(body);
        processMessage(message);
        channel.basicAck(envelope.getDeliveryTag(), false);
    }
});
```

**流控（Flow Control）**：
```java
// 预取数量限制
channel.basicQos(10);  // 最多推送10条未确认消息
```

---

## 2. 拉模型（Pull）

### 2.1 原理

消费者主动拉取消息。

**特点**：
- 消费者控制速度
- 支持批量拉取
- 需要处理空轮询
- 延迟可能较高

### 2.2 Kafka Pull 实现

```java
// Kafka 纯拉模型
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        processMessage(record);
    }
    
    consumer.commitSync();
}
```

**长轮询优化**：
```properties
# Broker 端配置
fetch.min.bytes=1
fetch.max.wait.ms=500

# 如果数据量不足 fetch.min.bytes，等待最多 500ms
```

---

## 3. RocketMQ 长轮询

### 3.1 伪推模式

RocketMQ 使用长轮询实现类似 Push 的效果。

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group");

// 底层是 Pull + 长轮询
consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
        processMessages(msgs);
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
```

**长轮询流程**：
```
1. 消费者发起 Pull 请求
2. Broker 没有新消息时，Hold 住请求（最多30秒）
3. 有新消息到达或超时，返回结果
4. 消费者立即发起下一次 Pull
```

---

## 4. 对比分析

### 4.1 性能对比

| 维度 | Push | Pull |
|------|------|------|
| 实时性 | 高（毫秒级） | 中（取决于轮询间隔） |
| 吞吐量 | 中 | 高（支持批量） |
| 消费者负载 | 被动承受 | 主动控制 |
| Broker负载 | 高（推送压力） | 低（按需拉取） |
| 实现复杂度 | 简单 | 需要轮询逻辑 |

### 4.2 三大消息队列对比

| MQ | 模型 | 说明 |
|-------|------|------|
| Kafka | Pull | 纯拉模型，长轮询优化 |
| RocketMQ | Pull（伪Push） | 长轮询实现类似 Push 效果 |
| RabbitMQ | Push | 原生 Push，prefetch 流控 |

---

## 5. 适用场景

**Push 适用场景**：
- 实时性要求高
- 消息量不大
- 消费者处理能力稳定

**Pull 适用场景**：
- 高吞吐量
- 消费者处理速度不稳定
- 需要批量处理

---

## 关键要点

1. **Push 模型**：实时性高，可能压垮慢消费者
2. **Pull 模型**：消费者控制速度，支持批量
3. **长轮询**：兼顾实时性和资源消耗
4. **Kafka**：纯拉模型
5. **RabbitMQ**：原生推模型

---

## 深入一点

**RocketMQ 长轮询实现原理**：

```java
// PullMessageService 持续拉取
public void run() {
    while (!this.isStopped()) {
        PullRequest pullRequest = this.pullRequestQueue.take();
        this.pullMessage(pullRequest);
    }
}

// Broker 端 Hold 请求
if (noNewMessage) {
    hold(request, 30000);  // Hold 30秒
}

// 新消息到达时唤醒
notifyMessageArriving();
```

---

## 参考资料

1. [Kafka Consumer Design](https://kafka.apache.org/documentation/#consumerapi)
2. [RocketMQ Long Polling](https://rocketmq.apache.org/docs/domainModel/04consumer/)
3. [RabbitMQ Consumer Prefetch](https://www.rabbitmq.com/consumer-prefetch.html)

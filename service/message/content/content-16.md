# 消息消费可靠性

## 概述

消费可靠性确保消息被正确处理且不丢失、不重复。本章将深入探讨消费确认机制、消费失败处理、重试策略以及消费幂等性设计。

---

## 1. Kafka 消费可靠性

### 1.1 Offset 提交机制

**自动提交（默认）**：

```java
Properties props = new Properties();
props.put("enable.auto.commit", "true");
props.put("auto.commit.interval.ms", "5000");  // 每 5 秒提交一次

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

// 问题：可能重复消费或丢失消息
```

**手动提交（推荐）**：

```java
props.put("enable.auto.commit", "false");

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        try {
            processMessage(record);  // 处理消息
            consumer.commitSync();   // 处理成功后提交
        } catch (Exception e) {
            // 处理失败，不提交，下次重新消费
            logger.error("处理失败", e);
        }
    }
}
```

**批量提交**：

```java
Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();

for (ConsumerRecord<String, String> record : records) {
    processMessage(record);
    
    TopicPartition partition = new TopicPartition(record.topic(), record.partition());
    offsets.put(partition, new OffsetAndMetadata(record.offset() + 1));
}

consumer.commitSync(offsets);  // 批量提交
```

### 1.2 消费失败处理

**重试策略**：

```java
int maxRetries = 3;

for (ConsumerRecord<String, String> record : records) {
    int retries = 0;
    boolean success = false;
    
    while (!success && retries < maxRetries) {
        try {
            processMessage(record);
            success = true;
            consumer.commitSync();
        } catch (RetriableException e) {
            retries++;
            logger.warn("重试 {}/{}", retries, maxRetries);
            Thread.sleep(1000 * retries);  // 指数退避
        } catch (NonRetriableException e) {
            logger.error("不可重试异常", e);
            sendToDeadLetterTopic(record);  // 发送到死信队列
            consumer.commitSync();
            break;
        }
    }
    
    if (!success) {
        sendToDeadLetterTopic(record);
        consumer.commitSync();
    }
}
```

---

## 2. RocketMQ 消费可靠性

### 2.1 消费模式

**Push 模式**：

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group");
consumer.subscribe("TopicTest", "*");

consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
        for (MessageExt msg : msgs) {
            try {
                processMessage(msg);
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            } catch (Exception e) {
                logger.error("消费失败", e);
                return ConsumeConcurrentlyStatus.RECONSUME_LATER;  // 重试
            }
        }
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});

consumer.start();
```

**返回状态**：

- `CONSUME_SUCCESS`：消费成功，提交 Offset
- `RECONSUME_LATER`：消费失败，稍后重试

### 2.2 重试机制

**配置**：

```java
// 最大重试次数（默认 16 次）
consumer.setMaxReconsumeTimes(16);

// 重试间隔：
// 第 1 次：10 秒
// 第 2 次：30 秒
// 第 3 次：1 分钟
// ...
// 第 16 次：2 小时
```

**重试流程**：

```
消费失败 → 发送到重试 Topic → 延迟消费 → 再次消费
                                  ↓
                            超过最大次数 → 发送到死信队列
```

---

## 3. RabbitMQ 消费可靠性

### 3.1 ACK 机制

**手动 ACK（推荐）**：

```java
channel.basicConsume("my-queue", false, (consumerTag, delivery) -> {
    try {
        String message = new String(delivery.getBody());
        processMessage(message);
        
        // 确认消息
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
    } catch (Exception e) {
        // 拒绝消息，重新入队
        channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
    }
}, consumerTag -> {});
```

**ACK 模式**：

- `basicAck`：确认消息，从队列删除
- `basicNack`：拒绝消息，可选择是否重新入队
- `basicReject`：拒绝单条消息

### 3.2 死信队列

**配置死信队列**：

```java
// 1. 声明死信交换机
channel.exchangeDeclare("dlx-exchange", "direct");
channel.queueDeclare("dlx-queue", true, false, false, null);
channel.queueBind("dlx-queue", "dlx-exchange", "dlx");

// 2. 声明业务队列，绑定死信交换机
Map<String, Object> args = new HashMap<>();
args.put("x-dead-letter-exchange", "dlx-exchange");
args.put("x-dead-letter-routing-key", "dlx");
args.put("x-max-length", 10000);  // 队列长度限制
channel.queueDeclare("business-queue", true, false, false, args);

// 3. 消费失败时，拒绝消息不重新入队
channel.basicNack(deliveryTag, false, false);  // 进入死信队列
```

---

## 关键要点

1. **Kafka**：手动提交 Offset，处理成功后再提交
2. **RocketMQ**：返回 RECONSUME_LATER 自动重试
3. **RabbitMQ**：手动 ACK + 死信队列
4. **幂等性**：消费者必须保证幂等性
5. **重试策略**：指数退避 + 最大重试次数
6. **死信队列**：处理无法消费的消息

---

## 参考资料

1. [Kafka Consumer](https://kafka.apache.org/documentation/#consumerapi)
2. [RocketMQ Consumer](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)
3. [RabbitMQ Consumer ACK](https://www.rabbitmq.com/confirms.html)

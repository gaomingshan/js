# 死信队列与延迟消息

## 概述

死信队列用于处理无法正常消费的消息，延迟消息支持定时投递。本章将探讨三大消息队列的死信队列实现、延迟消息机制以及典型应用场景。

---

## 1. Kafka 死信队列

Kafka 没有内置死信队列，需要手动实现。

**实现方式**：

```java
String dlqTopic = "my-topic-dlq";

for (ConsumerRecord<String, String> record : records) {
    int retries = 0;
    boolean success = false;
    
    while (!success && retries < 3) {
        try {
            processMessage(record);
            success = true;
        } catch (Exception e) {
            retries++;
        }
    }
    
    if (!success) {
        // 发送到死信队列
        ProducerRecord<String, String> dlqRecord = new ProducerRecord<>(
            dlqTopic,
            record.key(),
            record.value()
        );
        // 添加元数据
        dlqRecord.headers().add("original-topic", record.topic().getBytes());
        dlqRecord.headers().add("original-partition", 
            String.valueOf(record.partition()).getBytes());
        dlqRecord.headers().add("failure-reason", e.getMessage().getBytes());
        
        producer.send(dlqRecord);
    }
}
```

**延迟消息**：无原生支持，可用时间轮或外部调度实现。

---

## 2. RocketMQ 死信队列

**自动死信队列**：

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group");
consumer.setMaxReconsumeTimes(16);  // 最大重试次数

consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
        try {
            processMessage(msgs.get(0));
            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
        } catch (Exception e) {
            return ConsumeConcurrentlyStatus.RECONSUME_LATER;
        }
    }
});

// 超过 16 次重试后，消息自动进入死信队列
// 死信队列 Topic：%DLQ%consumer-group
```

**消费死信消息**：

```java
DefaultMQPushConsumer dlqConsumer = new DefaultMQPushConsumer("dlq-consumer-group");
dlqConsumer.subscribe("%DLQ%consumer-group", "*");

dlqConsumer.registerMessageListener((List<MessageExt> msgs, 
                                    ConsumeConcurrentlyContext context) -> {
    for (MessageExt msg : msgs) {
        logger.error("死信消息: {}", new String(msg.getBody()));
        // 人工处理或告警
    }
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
});
```

**延迟消息**：

```java
Message msg = new Message("TopicTest", "TagA", "Hello".getBytes());

// 设置延迟级别（1-18，对应不同延迟时间）
// 1=1s, 2=5s, 3=10s, 4=30s, 5=1m, 6=2m, 7=3m, 8=4m, 9=5m, 10=6m,
// 11=7m, 12=8m, 13=9m, 14=10m, 15=20m, 16=30m, 17=1h, 18=2h
msg.setDelayTimeLevel(3);  // 延迟 10 秒

producer.send(msg);
```

---

## 3. RabbitMQ 死信队列

**配置死信队列**：

```java
// 1. 声明死信交换机和队列
channel.exchangeDeclare("dlx-exchange", "direct", true);
channel.queueDeclare("dlx-queue", true, false, false, null);
channel.queueBind("dlx-queue", "dlx-exchange", "dlx-routing-key");

// 2. 业务队列绑定死信交换机
Map<String, Object> args = new HashMap<>();
args.put("x-dead-letter-exchange", "dlx-exchange");
args.put("x-dead-letter-routing-key", "dlx-routing-key");
args.put("x-message-ttl", 60000);  // 可选：消息 TTL
args.put("x-max-length", 1000);     // 可选：队列长度限制

channel.queueDeclare("business-queue", true, false, false, args);

// 3. 消息进入死信队列的条件：
// - 消息被拒绝（basicNack/basicReject）且 requeue=false
// - 消息 TTL 过期
// - 队列达到最大长度
```

**延迟队列（TTL + 死信）**：

```java
// 1. 声明延迟队列（无消费者，消息过期后进入死信队列）
Map<String, Object> delayArgs = new HashMap<>();
delayArgs.put("x-dead-letter-exchange", "business-exchange");
delayArgs.put("x-dead-letter-routing-key", "business-routing-key");
delayArgs.put("x-message-ttl", 10000);  // 10 秒延迟

channel.queueDeclare("delay-queue", true, false, false, delayArgs);

// 2. 发送消息到延迟队列
channel.basicPublish("", "delay-queue", null, message.getBytes());

// 3. 10 秒后，消息自动路由到业务队列
```

---

## 4. 应用场景

### 4.1 订单超时取消

```java
// RocketMQ 延迟消息
Message msg = new Message("OrderTopic", "order-timeout-check", orderId.getBytes());
msg.setDelayTimeLevel(15);  // 20 分钟后检查

producer.send(msg);

// 消费者：检查订单状态，未支付则取消
consumer.registerMessageListener((msgs, context) -> {
    String orderId = new String(msgs.get(0).getBody());
    if (!orderService.isPaid(orderId)) {
        orderService.cancel(orderId);
    }
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
});
```

### 4.2 失败消息告警

```java
// 消费死信队列，发送告警
dlqConsumer.registerMessageListener((msgs, context) -> {
    for (MessageExt msg : msgs) {
        String body = new String(msg.getBody());
        
        // 发送告警通知
        alertService.send("死信消息告警",
            "Topic: " + msg.getTopic() +
            ", Body: " + body +
            ", 重试次数: " + msg.getReconsumeTimes()
        );
    }
    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
});
```

---

## 关键要点

1. **Kafka**：需手动实现死信队列，无原生延迟消息
2. **RocketMQ**：自动死信队列，支持 18 个延迟级别
3. **RabbitMQ**：基于 TTL + 死信交换机实现延迟队列
4. **死信处理**：人工介入、告警通知、数据补偿
5. **延迟消息**：订单超时、定时任务、重试策略

---

## 参考资料

1. [RocketMQ Delayed Message](https://rocketmq.apache.org/docs/featureBehavior/02delaymessage)
2. [RabbitMQ Dead Letter Exchanges](https://www.rabbitmq.com/dlx.html)
3. [RabbitMQ TTL](https://www.rabbitmq.com/ttl.html)

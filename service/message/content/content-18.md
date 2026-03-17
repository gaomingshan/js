# 顺序消息

## 概述

顺序消息保证消息按照发送顺序被消费，对于订单处理、状态机流转等场景至关重要。本章将探讨三大消息队列的顺序消息实现、性能影响以及最佳实践。

---

## 1. 顺序消息类型

**全局顺序**：
- 所有消息严格有序
- 性能低（单分区/队列）
- 适用场景少

**分区顺序（推荐）**：
- 相同 Key 的消息有序
- 性能高（多分区并行）
- 适用大多数场景

---

## 2. Kafka 顺序消息

### 2.1 分区内顺序

**生产者配置**：

```java
Properties props = new Properties();
props.put("max.in.flight.requests.per.connection", 1);  // 关键：保证顺序
props.put("retries", Integer.MAX_VALUE);
props.put("enable.idempotence", true);

// 发送到同一分区
ProducerRecord<String, String> record = new ProducerRecord<>(
    "my-topic",
    "user-123",  // 相同 Key 发送到同一分区
    "message"
);
producer.send(record);
```

**消费者配置**：

```java
// 单线程消费同一分区，保证顺序
props.put("max.poll.records", 1);  // 每次拉取 1 条

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        processMessage(record);  // 顺序处理
    }
    consumer.commitSync();
}
```

### 2.2 全局顺序

**配置**：

```bash
# 创建单分区 Topic
bin/kafka-topics.sh --create \
  --topic ordered-topic \
  --partitions 1 \
  --replication-factor 3 \
  --bootstrap-server localhost:9092

# 消费者组只有 1 个消费者
```

**问题**：
- 吞吐量受限（单分区瓶颈）
- 可用性降低（单点）

---

## 3. RocketMQ 顺序消息

### 3.1 分区顺序

**发送顺序消息**：

```java
DefaultMQProducer producer = new DefaultMQProducer("producer-group");
producer.start();

// 按订单 ID 选择队列
Message msg = new Message("OrderTopic", "TagA", "orderId", "data".getBytes());

producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        String orderId = (String) arg;
        int index = Math.abs(orderId.hashCode()) % mqs.size();
        return mqs.get(index);  // 相同订单 ID 发送到同一队列
    }
}, "order-123");
```

**消费顺序消息**：

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group");
consumer.subscribe("OrderTopic", "*");

// 注册顺序消息监听器
consumer.registerMessageListener(new MessageListenerOrderly() {
    @Override
    public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, 
                                              ConsumeOrderlyContext context) {
        // RocketMQ 自动保证同一队列的消息顺序消费
        for (MessageExt msg : msgs) {
            processMessage(msg);
        }
        return ConsumeOrderlyStatus.SUCCESS;
    }
});

consumer.start();
```

**顺序保证机制**：

```
1. 分布式锁：消费者获取队列锁
2. 顺序消费：同一队列同时只有一个线程消费
3. 失败处理：消费失败时暂停当前队列，稍后重试
```

### 3.2 全局顺序

**配置**：

```bash
# 创建单队列 Topic
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t GlobalOrderTopic \
  -r 1 \
  -w 1
```

---

## 4. RabbitMQ 顺序消息

**队列天然有序**：

```java
// 1. 单消费者消费
channel.basicQos(1);  // 每次只拉取 1 条消息

channel.basicConsume("my-queue", false, (consumerTag, delivery) -> {
    processMessage(new String(delivery.getBody()));
    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
}, consumerTag -> {});

// 2. 避免并发消费
// 多个消费者会打乱顺序
```

**问题**：
- 无法并行消费（吞吐量低）
- 单消费者成为瓶颈

---

## 5. 顺序消息最佳实践

### 5.1 设计原则

**1. 合理选择顺序粒度**：

```
❌ 错误：全局顺序
- 所有订单必须顺序处理
- 吞吐量极低

✅ 正确：分区顺序
- 同一订单的消息顺序处理
- 不同订单并行处理
```

**2. 分区键设计**：

```java
// ✅ 好的分区键
String key = "order-" + orderId;     // 订单 ID
String key = "user-" + userId;       // 用户 ID
String key = "device-" + deviceId;   // 设备 ID

// ❌ 不好的分区键
String key = "vip";                  // 热点 Key
String key = UUID.randomUUID();      // 随机 Key（无法保证顺序）
```

### 5.2 性能优化

**Kafka 优化**：

```java
// 1. 允许部分乱序（提升性能）
props.put("max.in.flight.requests.per.connection", 5);  // 默认值
props.put("enable.idempotence", true);  // 启用幂等性

// 2. 批量发送
props.put("batch.size", 16384);
props.put("linger.ms", 10);
```

**RocketMQ 优化**：

```java
// 1. 增加队列数
sh bin/mqadmin updateTopic -r 16 -w 16

// 2. 多消费者并行消费不同队列
consumer.setConsumeThreadMin(20);
consumer.setConsumeThreadMax(64);
```

### 5.3 故障处理

**消费失败不阻塞**：

```java
// RocketMQ 顺序消息监听器
public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, 
                                          ConsumeOrderlyContext context) {
    for (MessageExt msg : msgs) {
        try {
            processMessage(msg);
        } catch (RetriableException e) {
            // 可重试异常，稍后重试
            context.setSuspendCurrentQueueTimeMillis(1000);  // 暂停 1 秒
            return ConsumeOrderlyStatus.SUSPEND_CURRENT_QUEUE_A_MOMENT;
        } catch (NonRetriableException e) {
            // 不可重试异常，跳过并记录
            logger.error("跳过无法处理的消息", e);
            return ConsumeOrderlyStatus.SUCCESS;
        }
    }
    return ConsumeOrderlyStatus.SUCCESS;
}
```

---

## 6. 顺序消息场景示例

### 6.1 订单状态流转

```java
// 订单生命周期：创建 → 支付 → 发货 → 完成
String orderId = "order-123";

// 发送顺序消息
producer.send(new Message("OrderTopic", "created", orderId.getBytes()), 
    (mqs, msg, arg) -> selectQueue(mqs, orderId), orderId);

producer.send(new Message("OrderTopic", "paid", orderId.getBytes()), 
    (mqs, msg, arg) -> selectQueue(mqs, orderId), orderId);

producer.send(new Message("OrderTopic", "shipped", orderId.getBytes()), 
    (mqs, msg, arg) -> selectQueue(mqs, orderId), orderId);

// 消费者顺序处理
// created → paid → shipped（保证顺序）
```

### 6.2 库存扣减

```java
// 商品库存操作：扣减 → 补货 → 扣减
String productId = "product-456";

producer.send(new Message("InventoryTopic", "reduce:10", productId.getBytes()), 
    (mqs, msg, arg) -> selectQueue(mqs, productId), productId);

producer.send(new Message("InventoryTopic", "add:5", productId.getBytes()), 
    (mqs, msg, arg) -> selectQueue(mqs, productId), productId);

// 保证同一商品的库存操作顺序执行
```

---

## 关键要点

1. **分区顺序优于全局顺序**：性能和可用性更好
2. **合理选择分区键**：业务实体 ID（订单、用户、设备）
3. **Kafka 配置**：max.in.flight.requests=1 保证严格顺序
4. **RocketMQ 顺序监听器**：MessageListenerOrderly
5. **性能影响**：顺序消息吞吐量降低 30%-50%
6. **故障处理**：消费失败不应永久阻塞队列

---

## 深入一点

### 为什么 Kafka 需要 max.in.flight.requests=1？

**问题场景**：

```
max.in.flight.requests=5（默认）

发送：
Batch 1: [msg1, msg2] → Broker（成功）
Batch 2: [msg3, msg4] → Broker（失败，重试）
Batch 3: [msg5, msg6] → Broker（成功）

Broker 存储顺序：
msg1, msg2, msg5, msg6, msg3, msg4  ← 乱序！
```

**解决方案**：

```
max.in.flight.requests=1

发送：
Batch 1: [msg1, msg2] → Broker（成功）→ 继续
Batch 2: [msg3, msg4] → Broker（失败）→ 重试 → 成功 → 继续
Batch 3: [msg5, msg6] → Broker（成功）

Broker 存储顺序：
msg1, msg2, msg3, msg4, msg5, msg6  ← 有序！
```

**幂等性改进**：

Kafka 0.11+ 启用幂等性后，即使 max.in.flight.requests=5 也能保证顺序。

---

## 参考资料

1. [Kafka Message Ordering](https://kafka.apache.org/documentation/#ordering)
2. [RocketMQ Orderly Message](https://rocketmq.apache.org/docs/featureBehavior/03orderlymessage)
3. [RabbitMQ Message Ordering](https://www.rabbitmq.com/semantics.html)

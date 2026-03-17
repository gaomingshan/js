# 事务消息

## 概述

事务消息确保本地事务与消息发送的原子性，解决分布式事务中的数据一致性问题。本章将深入探讨 RocketMQ 的事务消息机制、Kafka 的事务 API 以及 RabbitMQ 的事务实现。

---

## 1. RocketMQ 事务消息（推荐）

### 1.1 事务消息原理

**两阶段提交 + 事务回查**：

```
1. 发送半消息（Half Message）
   ↓
2. 执行本地事务
   ↓
3. 提交/回滚事务消息
   ↓
4. Broker 定期回查未确定状态的消息
```

### 1.2 实现示例

```java
TransactionMQProducer producer = new TransactionMQProducer("transaction-group");

// 设置事务监听器
producer.setTransactionListener(new TransactionListener() {
    @Override
    public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            // 执行本地事务（如：数据库操作）
            String orderId = (String) arg;
            orderService.createOrder(orderId);
            
            // 本地事务成功，提交消息
            return LocalTransactionState.COMMIT_MESSAGE;
        } catch (Exception e) {
            logger.error("本地事务失败", e);
            // 本地事务失败，回滚消息
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }
    
    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        // Broker 回查本地事务状态
        String orderId = msg.getKeys();
        boolean exists = orderService.orderExists(orderId);
        
        if (exists) {
            return LocalTransactionState.COMMIT_MESSAGE;
        } else {
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }
});

producer.start();

// 发送事务消息
Message msg = new Message("TopicTest", "TagA", "orderId", "orderData".getBytes());
producer.sendMessageInTransaction(msg, "orderId-123");
```

**完整流程**：

```
1. sendMessageInTransaction
   ↓
2. Broker 保存半消息（对消费者不可见）
   ↓
3. executeLocalTransaction（执行本地事务）
   ↓ 成功
4. COMMIT_MESSAGE → Broker 将消息对消费者可见
   ↓ 失败
5. ROLLBACK_MESSAGE → Broker 删除消息
   ↓ 超时/未知
6. Broker 定期回查 → checkLocalTransaction
```

### 1.3 配置参数

```java
// 事务回查最大次数（默认 15 次）
producer.setCheckThreadPoolMaxSize(5);

// 事务回查间隔（默认 60 秒）
// Broker 配置：transactionCheckInterval=60000
```

---

## 2. Kafka 事务消息

### 2.1 事务 API

**配置事务**：

```java
Properties props = new Properties();
props.put("transactional.id", "my-transactional-id");  // 必须唯一
props.put("enable.idempotence", true);
props.put("acks", "all");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// 初始化事务
producer.initTransactions();
```

**发送事务消息**：

```java
try {
    // 开始事务
    producer.beginTransaction();
    
    // 发送消息
    producer.send(new ProducerRecord<>("topic1", "key1", "value1"));
    producer.send(new ProducerRecord<>("topic2", "key2", "value2"));
    
    // 执行本地事务
    executeLocalTransaction();
    
    // 提交事务
    producer.commitTransaction();
} catch (Exception e) {
    // 回滚事务
    producer.abortTransaction();
}
```

### 2.2 事务消费（Exactly Once）

**消费 → 处理 → 发送（原子性）**：

```java
// 消费者配置
props.put("isolation.level", "read_committed");  // 只读已提交的消息

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
KafkaProducer<String, String> producer = new KafkaProducer<>(props);

producer.initTransactions();

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    if (!records.isEmpty()) {
        producer.beginTransaction();
        
        try {
            for (ConsumerRecord<String, String> record : records) {
                // 处理消息
                String result = processMessage(record.value());
                
                // 发送结果到下游
                producer.send(new ProducerRecord<>("output-topic", result));
            }
            
            // 提交消费位点和发送消息（原子性）
            Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();
            // ... 构建 offsets
            producer.sendOffsetsToTransaction(offsets, "consumer-group-id");
            
            producer.commitTransaction();
        } catch (Exception e) {
            producer.abortTransaction();
        }
    }
}
```

---

## 3. RabbitMQ 事务（不推荐）

### 3.1 事务模式

```java
channel.txSelect();  // 开启事务

try {
    channel.basicPublish("", "queue1", null, "msg1".getBytes());
    channel.basicPublish("", "queue2", null, "msg2".getBytes());
    
    executeLocalTransaction();
    
    channel.txCommit();  // 提交事务
} catch (Exception e) {
    channel.txRollback();  // 回滚事务
}
```

**问题**：
- 性能极低（吞吐量 < 250 msg/s）
- 不支持本地事务协调
- 已被发布确认替代

---

## 4. 最佳实践

### 4.1 RocketMQ 事务消息场景

**订单创建 + 发送通知**：

```java
// 1. 发送事务消息
Message msg = new Message("OrderTopic", "order-created", orderData);
producer.sendMessageInTransaction(msg, order.getId());

// 2. 事务监听器
public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
    String orderId = (String) arg;
    
    try {
        // 创建订单（数据库事务）
        orderService.createOrder(orderId);
        return LocalTransactionState.COMMIT_MESSAGE;
    } catch (Exception e) {
        return LocalTransactionState.ROLLBACK_MESSAGE;
    }
}

// 3. 事务回查
public LocalTransactionState checkLocalTransaction(MessageExt msg) {
    String orderId = msg.getKeys();
    return orderService.orderExists(orderId) 
        ? LocalTransactionState.COMMIT_MESSAGE 
        : LocalTransactionState.ROLLBACK_MESSAGE;
}
```

### 4.2 Kafka 事务场景

**跨 Topic 原子性写入**：

```java
producer.beginTransaction();

try {
    // 写入多个 Topic，保证原子性
    producer.send(new ProducerRecord<>("inventory-topic", "减库存"));
    producer.send(new ProducerRecord<>("order-topic", "创建订单"));
    producer.send(new ProducerRecord<>("notification-topic", "发送通知"));
    
    producer.commitTransaction();
} catch (Exception e) {
    producer.abortTransaction();
}
```

---

## 关键要点

1. **RocketMQ 事务**：适合本地事务 + 消息发送场景
2. **Kafka 事务**：适合跨 Topic 原子性写入
3. **事务回查**：RocketMQ 独有，保证最终一致性
4. **性能影响**：事务会降低吞吐量 30%-50%
5. **幂等性**：消费者仍需保证幂等性

---

## 参考资料

1. [RocketMQ Transaction](https://rocketmq.apache.org/docs/featureBehavior/04transactionmessage)
2. [Kafka Transactions](https://kafka.apache.org/documentation/#semantics)
3. [Exactly Once Semantics](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)

# 消息发送可靠性

## 概述

消息发送是消息队列可靠性的第一道防线。如果消息在发送阶段丢失，后续的存储和消费可靠性都无从谈起。本章将深入探讨三大消息队列的发送确认机制、重试策略、幂等性保证以及发送失败处理，确保消息能够可靠地到达 Broker。

---

## 1. Kafka 发送可靠性

### 1.1 ACK 确认机制

**acks 配置**：

```java
Properties props = new Properties();

// acks=0：无确认（最高性能，可能丢失）
props.put("acks", "0");

// acks=1：Leader 确认（中等性能和可靠性）
props.put("acks", "1");

// acks=all/-1：所有 ISR 确认（最高可靠性）
props.put("acks", "all");
```

**三种模式对比**：

| acks | 确认条件 | 性能 | 可靠性 | 丢失风险 |
|------|---------|------|--------|---------|
| 0 | 不等待确认 | 最高 | 最低 | Leader 写入前崩溃会丢失 |
| 1 | Leader 写入成功 | 中 | 中 | Leader 崩溃前未同步到 Follower 会丢失 |
| all | 所有 ISR 确认 | 最低 | 最高 | 配合 min.insync.replicas 可保证不丢失 |

**推荐配置**：

```java
// 生产环境推荐配置
props.put("acks", "all");
props.put("retries", Integer.MAX_VALUE);
props.put("max.in.flight.requests.per.connection", 5);
props.put("enable.idempotence", true);

// Topic 配置
min.insync.replicas=2
replication.factor=3
```

### 1.2 重试机制

**重试配置**：

```java
// 重试次数（建议设置为最大值）
props.put("retries", Integer.MAX_VALUE);

// 重试间隔（默认 100ms）
props.put("retry.backoff.ms", 100);

// 请求超时（30秒）
props.put("request.timeout.ms", 30000);

// 发送超时（120秒，包括重试）
props.put("delivery.timeout.ms", 120000);
```

**重试流程**：

```
发送消息
    ↓
写入本地缓冲区
    ↓
发送到 Broker
    ↓
等待 ACK（request.timeout.ms）
    ↓
收到 ACK？
    ├── 是 → 返回成功
    └── 否 → 重试
            ↓
        重试次数 < retries？
            ├── 是 → 等待 retry.backoff.ms → 重新发送
            └── 否 → 返回失败
```

**可重试错误**：
- 网络错误（NetworkException）
- Leader 选举中（NotEnoughReplicasException）
- 请求超时（TimeoutException）

**不可重试错误**：
- 消息过大（RecordTooLargeException）
- 序列化错误（SerializationException）
- 认证失败（AuthenticationException）

### 1.3 幂等性保证

**启用幂等性**：

```java
props.put("enable.idempotence", true);

// 幂等性要求以下配置：
// acks=all
// retries > 0
// max.in.flight.requests.per.connection <= 5
```

**幂等性原理**：

```
Producer 初始化时获得：
- Producer ID (PID)
- Sequence Number（每条消息递增）

发送消息：
Message {
    PID: 12345
    Epoch: 0
    Sequence: 0  ← 第一条消息
}

Broker 接收：
- 检查 PID + Epoch + Sequence
- 如果已存在 → 返回成功（去重）
- 如果是新消息 → 写入并返回成功

重试时：
Message {
    PID: 12345
    Epoch: 0
    Sequence: 0  ← 相同序列号
}
Broker → 检测到重复 → 去重 → 返回成功
```

**幂等性范围**：
- 单分区幂等（同一分区内）
- 单会话幂等（Producer 重启后 PID 变化）
- 不跨分区幂等

### 1.4 发送失败处理

**回调处理**：

```java
producer.send(record, new Callback() {
    @Override
    public void onCompletion(RecordMetadata metadata, Exception exception) {
        if (exception != null) {
            // 发送失败
            logger.error("发送失败: topic={}, key={}", 
                record.topic(), record.key(), exception);
            
            // 写入失败队列或数据库
            failureQueue.add(record);
        } else {
            // 发送成功
            logger.info("发送成功: partition={}, offset={}", 
                metadata.partition(), metadata.offset());
        }
    }
});
```

**异常分类处理**：

```java
try {
    producer.send(record).get();
} catch (ExecutionException e) {
    Throwable cause = e.getCause();
    
    if (cause instanceof RetriableException) {
        // 可重试异常（已自动重试失败）
        logger.error("重试失败，记录到失败队列");
        saveToFailureQueue(record);
    } else if (cause instanceof RecordTooLargeException) {
        // 消息过大（不可重试）
        logger.error("消息过大，丢弃或拆分");
        splitAndSend(record);
    } else {
        // 其他异常
        logger.error("未知异常", cause);
    }
}
```

---

## 2. RocketMQ 发送可靠性

### 2.1 发送方式

**1. 同步发送**：

```java
DefaultMQProducer producer = new DefaultMQProducer("producer-group");
producer.start();

Message msg = new Message("TopicTest", "TagA", "Hello".getBytes());

// 同步发送（等待结果）
SendResult result = producer.send(msg);

if (result.getSendStatus() == SendStatus.SEND_OK) {
    System.out.println("发送成功: " + result.getMsgId());
} else {
    System.out.println("发送失败: " + result.getSendStatus());
}
```

**2. 异步发送**：

```java
producer.send(msg, new SendCallback() {
    @Override
    public void onSuccess(SendResult sendResult) {
        System.out.println("发送成功: " + sendResult.getMsgId());
    }
    
    @Override
    public void onException(Throwable e) {
        System.err.println("发送失败: " + e.getMessage());
        // 重试或记录失败
    }
});
```

**3. 单向发送**：

```java
// 单向发送（不等待结果，性能最高）
producer.sendOneway(msg);

// 适用场景：
// - 日志收集
// - 对可靠性要求不高的场景
```

**对比**：

| 发送方式 | 等待结果 | 性能 | 可靠性 | 适用场景 |
|---------|---------|------|--------|---------|
| 同步 | 是 | 低 | 高 | 关键业务 |
| 异步 | 回调 | 中 | 高 | 高并发场景 |
| 单向 | 否 | 高 | 低 | 日志收集 |

### 2.2 发送状态

**SendStatus 枚举**：

```java
public enum SendStatus {
    SEND_OK,            // 发送成功
    FLUSH_DISK_TIMEOUT, // 刷盘超时
    FLUSH_SLAVE_TIMEOUT,// 主从同步超时
    SLAVE_NOT_AVAILABLE // Slave 不可用
}
```

**状态处理**：

```java
SendResult result = producer.send(msg);

switch (result.getSendStatus()) {
    case SEND_OK:
        // 发送成功
        break;
    case FLUSH_DISK_TIMEOUT:
        // 消息已写入内存，但刷盘超时
        // 异步刷盘模式可能出现
        logger.warn("刷盘超时，消息可能丢失: {}", result.getMsgId());
        break;
    case FLUSH_SLAVE_TIMEOUT:
        // 消息已写入 Master，但同步到 Slave 超时
        // 同步复制模式可能出现
        logger.warn("主从同步超时: {}", result.getMsgId());
        break;
    case SLAVE_NOT_AVAILABLE:
        // Slave 不可用
        logger.warn("Slave 不可用: {}", result.getMsgId());
        break;
}
```

### 2.3 重试机制

**重试配置**：

```java
// 同步发送重试次数（默认 2）
producer.setRetryTimesWhenSendFailed(3);

// 异步发送重试次数（默认 2）
producer.setRetryTimesWhenSendAsyncFailed(3);

// 发送超时（默认 3000ms）
producer.setSendMsgTimeout(5000);
```

**重试策略**：

```
发送失败 → 选择其他 Broker 重试（故障隔离）

示例：
第 1 次：发送到 Broker-A → 失败
第 2 次：发送到 Broker-B → 失败
第 3 次：发送到 Broker-C → 成功
```

**故障规避**：

```java
// RocketMQ 自动隔离故障 Broker
// 发送失败的 Broker 会被标记，后续发送优先选择其他 Broker
```

### 2.4 发送异常处理

**异常类型**：

```java
try {
    SendResult result = producer.send(msg);
} catch (MQClientException e) {
    // 客户端异常（配置错误、参数错误）
    logger.error("客户端异常", e);
} catch (RemotingException e) {
    // 网络异常
    logger.error("网络异常，重试", e);
    retryQueue.add(msg);
} catch (MQBrokerException e) {
    // Broker 异常（Topic 不存在、权限不足）
    logger.error("Broker 异常", e);
} catch (InterruptedException e) {
    // 中断异常
    Thread.currentThread().interrupt();
}
```

---

## 3. RabbitMQ 发送可靠性

### 3.1 发布确认（Publisher Confirms）

**启用发布确认**：

```java
// 1. 开启 Confirm 模式
channel.confirmSelect();

// 2. 发送消息
channel.basicPublish("my-exchange", "routing-key", null, message.getBytes());

// 3. 等待确认
boolean confirmed = channel.waitForConfirms(5000);  // 超时 5 秒

if (confirmed) {
    System.out.println("消息已确认");
} else {
    System.out.println("消息未确认");
}
```

**异步确认**：

```java
channel.confirmSelect();

// 添加确认监听器
channel.addConfirmListener(new ConfirmListener() {
    @Override
    public void handleAck(long deliveryTag, boolean multiple) {
        System.out.println("消息确认: deliveryTag=" + deliveryTag);
        // 从未确认集合中移除
    }
    
    @Override
    public void handleNack(long deliveryTag, boolean multiple) {
        System.out.println("消息拒绝: deliveryTag=" + deliveryTag);
        // 重试或记录失败
    }
});

// 发送消息
channel.basicPublish("my-exchange", "routing-key", null, message.getBytes());
```

**批量确认**：

```java
channel.confirmSelect();

// 发送多条消息
for (int i = 0; i < 100; i++) {
    channel.basicPublish("", "my-queue", null, ("message-" + i).getBytes());
}

// 批量等待确认
channel.waitForConfirmsOrDie(5000);
System.out.println("所有消息已确认");
```

### 3.2 事务模式（不推荐）

```java
// 开启事务
channel.txSelect();

try {
    // 发送消息
    channel.basicPublish("", "my-queue", null, "message1".getBytes());
    channel.basicPublish("", "my-queue", null, "message2".getBytes());
    
    // 提交事务
    channel.txCommit();
    System.out.println("事务提交成功");
} catch (Exception e) {
    // 回滚事务
    channel.txRollback();
    System.out.println("事务回滚");
}
```

**事务 vs 发布确认**：

| 特性 | 事务 | 发布确认 |
|------|------|---------|
| 性能 | 低（同步阻塞） | 高（异步） |
| 吞吐量 | 250 msg/s | 4000+ msg/s |
| 可靠性 | 高 | 高 |
| 推荐使用 | ❌ 不推荐 | ✅ 推荐 |

### 3.3 Mandatory 标志

**消息路由失败处理**：

```java
// 设置 Mandatory=true，路由失败时返回消息
channel.addReturnListener(new ReturnListener() {
    @Override
    public void handleReturn(int replyCode, String replyText,
                            String exchange, String routingKey,
                            AMQP.BasicProperties properties, byte[] body) {
        System.err.println("消息路由失败: exchange=" + exchange + 
                          ", routingKey=" + routingKey);
        // 重试或记录失败
    }
});

// 发送消息（Mandatory=true）
channel.basicPublish(
    "my-exchange",
    "non-existent-routing-key",
    true,  // mandatory
    null,
    message.getBytes()
);
```

**Immediate 标志**（已废弃）：

```java
// Immediate=true，队列无消费者时返回消息
// 注意：RabbitMQ 3.0+ 已废弃此功能
```

---

## 4. 发送可靠性最佳实践

### 4.1 Kafka 最佳实践

```java
Properties props = new Properties();

// 1. 可靠性配置
props.put("acks", "all");
props.put("retries", Integer.MAX_VALUE);
props.put("max.in.flight.requests.per.connection", 5);
props.put("enable.idempotence", true);

// 2. 超时配置
props.put("request.timeout.ms", 30000);
props.put("delivery.timeout.ms", 120000);

// 3. 压缩（提升性能）
props.put("compression.type", "lz4");

// 4. 批量配置
props.put("batch.size", 16384);
props.put("linger.ms", 10);

// 5. 缓冲区配置
props.put("buffer.memory", 33554432);  // 32MB

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// 6. 异步发送 + 回调处理
producer.send(record, (metadata, exception) -> {
    if (exception != null) {
        logger.error("发送失败", exception);
        failureHandler.handle(record, exception);
    }
});
```

### 4.2 RocketMQ 最佳实践

```java
DefaultMQProducer producer = new DefaultMQProducer("producer-group");

// 1. 重试配置
producer.setRetryTimesWhenSendFailed(3);
producer.setRetryTimesWhenSendAsyncFailed(3);

// 2. 超时配置
producer.setSendMsgTimeout(5000);

// 3. 压缩
producer.setCompressMsgBodyOverHowmuch(4096);  // 大于 4KB 压缩

producer.start();

// 4. 同步发送（关键业务）
Message msg = new Message("TopicTest", "TagA", "key", "data".getBytes());
SendResult result = producer.send(msg);

if (result.getSendStatus() != SendStatus.SEND_OK) {
    // 处理发送失败
    logger.error("发送失败: status={}", result.getSendStatus());
}

// 5. 异步发送（高并发场景）
producer.send(msg, new SendCallback() {
    @Override
    public void onSuccess(SendResult sendResult) {
        // 发送成功
    }
    
    @Override
    public void onException(Throwable e) {
        // 发送失败，重试或记录
        retryService.retry(msg);
    }
});
```

### 4.3 RabbitMQ 最佳实践

```java
ConnectionFactory factory = new ConnectionFactory();
Connection connection = factory.newConnection();
Channel channel = connection.createChannel();

// 1. 启用发布确认
channel.confirmSelect();

// 2. 添加确认监听器
ConcurrentNavigableMap<Long, String> outstandingConfirms = 
    new ConcurrentSkipListMap<>();

channel.addConfirmListener(new ConfirmListener() {
    @Override
    public void handleAck(long deliveryTag, boolean multiple) {
        if (multiple) {
            outstandingConfirms.headMap(deliveryTag, true).clear();
        } else {
            outstandingConfirms.remove(deliveryTag);
        }
    }
    
    @Override
    public void handleNack(long deliveryTag, boolean multiple) {
        String message = outstandingConfirms.get(deliveryTag);
        logger.error("消息被拒绝: {}", message);
        // 重试
    }
});

// 3. 发送消息
long nextSeqNo = channel.getNextPublishSeqNo();
channel.basicPublish("my-exchange", "routing-key", 
    MessageProperties.PERSISTENT_TEXT_PLAIN, message.getBytes());
outstandingConfirms.put(nextSeqNo, message);

// 4. 添加返回监听器（Mandatory）
channel.addReturnListener((replyCode, replyText, exchange, routingKey, properties, body) -> {
    logger.error("消息路由失败: routingKey={}", routingKey);
});
```

---

## 关键要点

1. **Kafka acks=all**：生产环境必须配置，配合 min.insync.replicas 保证不丢失
2. **幂等性**：Kafka 启用幂等性防止重复，RocketMQ 自动去重
3. **重试机制**：三大 MQ 都支持自动重试，需合理配置重试次数和超时
4. **发布确认**：RabbitMQ 必须启用 Publisher Confirms
5. **异常处理**：区分可重试和不可重试异常，针对性处理
6. **回调处理**：异步发送时必须处理回调，记录失败消息

---

## 深入一点

### Kafka 幂等性 vs RocketMQ 去重

**Kafka 幂等性**：
- Producer 级别（PID + Sequence）
- 单分区单会话幂等
- 重启后 PID 变化，无法去重

**RocketMQ 去重**：
- Message ID 级别
- Broker 端去重（内存 + 布隆过滤器）
- 有时间窗口限制（默认 3 秒）

**事务消息幂等**：
- Kafka Transaction：跨分区幂等
- RocketMQ Transaction：业务层幂等（Message Key）

---

## 参考资料

1. [Kafka Producer Configuration](https://kafka.apache.org/documentation/#producerconfigs)
2. [RocketMQ Send](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)
3. [RabbitMQ Publisher Confirms](https://www.rabbitmq.com/confirms.html)
4. [Kafka Exactly Once Semantics](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)

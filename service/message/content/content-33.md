# 消费者配置详解

## 概述

消费者配置影响消费性能、可靠性和资源使用。本章系统讲解三大消息队列消费者的核心配置参数。

---

## 1. Kafka Consumer 核心配置

### 1.1 基础配置

```java
Properties props = new Properties();

// Bootstrap服务器（必需）
props.put("bootstrap.servers", "localhost:9092");

// 消费者组ID（必需）
props.put("group.id", "my-consumer-group");

// 客户端ID
props.put("client.id", "consumer-1");

// 反序列化器（必需）
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
```

### 1.2 Offset配置

```java
// 自动提交开关
props.put("enable.auto.commit", "false");

// 自动提交间隔（5秒）
props.put("auto.commit.interval.ms", "5000");

// 初始Offset（earliest/latest/none）
props.put("auto.offset.reset", "latest");
// earliest：从最早开始
// latest：从最新开始（默认）
// none：无Offset时抛出异常
```

### 1.3 拉取配置

```java
// 单次拉取最大记录数
props.put("max.poll.records", 500);

// 拉取间隔超时（5分钟）
props.put("max.poll.interval.ms", 300000);

// 最小拉取字节数
props.put("fetch.min.bytes", 1);

// 最大等待时间
props.put("fetch.max.wait.ms", 500);

// 单分区最大拉取字节数（1MB）
props.put("max.partition.fetch.bytes", 1048576);
```

### 1.4 会话配置

```java
// 会话超时（30秒）
props.put("session.timeout.ms", 30000);

// 心跳间隔（10秒）
props.put("heartbeat.interval.ms", 10000);

// 心跳间隔必须 < session.timeout / 3
```

### 1.5 分区分配策略

```java
// 分区分配策略
props.put("partition.assignment.strategy",
    "org.apache.kafka.clients.consumer.StickyAssignor");

// 可选：
// - RangeAssignor（默认）
// - RoundRobinAssignor
// - StickyAssignor
// - CooperativeStickyAssignor
```

### 1.6 拦截器配置

```java
// 消费者拦截器
props.put("interceptor.classes", "com.example.MyConsumerInterceptor");

public class MyConsumerInterceptor implements ConsumerInterceptor<String, String> {
    @Override
    public ConsumerRecords<String, String> onConsume(ConsumerRecords<String, String> records) {
        // 消费前拦截
        return records;
    }
    
    @Override
    public void onCommit(Map<TopicPartition, OffsetAndMetadata> offsets) {
        // 提交后回调
    }
}
```

---

## 2. RocketMQ Consumer 配置

### 2.1 基础配置

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("my-consumer-group");

// NameServer地址（必需）
consumer.setNamesrvAddr("localhost:9876");

// 消费模式（集群/广播）
consumer.setMessageModel(MessageModel.CLUSTERING);

// 消费起始位置
consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_LAST_OFFSET);
```

### 2.2 线程池配置

```java
// 最小消费线程数
consumer.setConsumeThreadMin(20);

// 最大消费线程数
consumer.setConsumeThreadMax(64);

// 消费线程池队列容量
consumer.setPullThresholdForQueue(1000);
```

### 2.3 拉取配置

```java
// 单次拉取消息数（32）
consumer.setPullBatchSize(32);

// 拉取间隔（0=立即拉取）
consumer.setPullInterval(0);

// 单次消费消息数（1）
consumer.setConsumeMessageBatchMaxSize(1);
```

### 2.4 超时配置

```java
// 消费超时（15分钟）
consumer.setConsumeTimeout(15);

// 最大重试次数（16次）
consumer.setMaxReconsumeTimes(16);
```

---

## 3. RabbitMQ Consumer 配置

### 3.1 基础配置

```java
Channel channel = connection.createChannel();

// 预取数量（QoS）
channel.basicQos(10);

// 手动确认模式
boolean autoAck = false;

channel.basicConsume("queue", autoAck, (consumerTag, delivery) -> {
    processMessage(new String(delivery.getBody()));
    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
});
```

### 3.2 独占模式

```java
// 独占消费者（排他）
channel.basicConsume("queue", false, 
    "",       // consumerTag
    false,    // noLocal
    true,     // exclusive（独占）
    null,     // arguments
    deliverCallback,
    cancelCallback
);
```

### 3.3 优先级配置

```java
// 队列优先级
Map<String, Object> args = new HashMap<>();
args.put("x-max-priority", 10);
channel.queueDeclare("priority-queue", true, false, false, args);

// 消息优先级
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .priority(5)
    .build();
channel.basicPublish("", "priority-queue", props, message.getBytes());
```

---

## 4. 反序列化配置

### 4.1 Kafka 反序列化

```java
// 自定义反序列化器
public class CustomDeserializer implements Deserializer<Order> {
    @Override
    public Order deserialize(String topic, byte[] data) {
        return JsonUtils.fromJson(new String(data), Order.class);
    }
}

props.put("value.deserializer", "com.example.CustomDeserializer");
```

### 4.2 Schema Registry

```java
// 使用Avro + Schema Registry
props.put("value.deserializer", 
    "io.confluent.kafka.serializers.KafkaAvroDeserializer");
props.put("schema.registry.url", "http://localhost:8081");
```

---

## 5. 性能调优配置

### 5.1 高吞吐量配置

**Kafka**：
```java
props.put("max.poll.records", 1000);
props.put("fetch.min.bytes", 1048576);
props.put("max.partition.fetch.bytes", 10485760);
```

**RocketMQ**：
```java
consumer.setConsumeThreadMin(64);
consumer.setConsumeThreadMax(128);
consumer.setConsumeMessageBatchMaxSize(10);
```

### 5.2 低延迟配置

**Kafka**：
```java
props.put("fetch.min.bytes", 1);
props.put("fetch.max.wait.ms", 100);
props.put("max.poll.records", 100);
```

---

## 6. 配置最佳实践

### 6.1 生产环境推荐

**Kafka**：
```java
props.put("enable.auto.commit", "false");
props.put("max.poll.records", 500);
props.put("session.timeout.ms", 30000);
props.put("heartbeat.interval.ms", 10000);
props.put("max.poll.interval.ms", 300000);
props.put("auto.offset.reset", "latest");
```

**RocketMQ**：
```java
consumer.setConsumeThreadMin(20);
consumer.setConsumeThreadMax(64);
consumer.setMaxReconsumeTimes(16);
consumer.setConsumeTimeout(15);
```

### 6.2 配置检查清单

```
☑ enable.auto.commit=false（手动提交）
☑ max.poll.records适中（批量处理）
☑ session.timeout.ms合理（避免频繁Rebalance）
☑ heartbeat.interval.ms < session.timeout/3
☑ max.poll.interval.ms > 最大处理时间
☑ auto.offset.reset=latest（避免重复消费历史）
```

---

## 关键要点

1. **手动提交**：enable.auto.commit=false
2. **会话配置**：heartbeat < session.timeout/3
3. **拉取间隔**：max.poll.interval.ms > 最大处理时间
4. **批量拉取**：max.poll.records平衡性能和延迟
5. **预取配置**：RabbitMQ basicQos控制流量

---

## 深入一点

**Kafka消费者心跳机制**：

```
心跳线程（独立线程）：
- 每 heartbeat.interval.ms 发送心跳
- 心跳超时判断：session.timeout.ms

主线程（poll线程）：
- poll()调用间隔不能超过 max.poll.interval.ms
- 超时会触发Rebalance

两个独立的超时机制：
1. 心跳超时：检测Consumer是否存活
2. Poll超时：检测Consumer是否还在处理消息
```

**推荐配置关系**：
```
session.timeout.ms = 30000
heartbeat.interval.ms = 10000 (session/3)
max.poll.interval.ms = 300000 (5分钟，足够处理max.poll.records条消息)
```

---

## 参考资料

1. [Kafka Consumer Configs](https://kafka.apache.org/documentation/#consumerconfigs)
2. [RocketMQ Consumer](https://rocketmq.apache.org/docs/domainModel/04consumer/)
3. [RabbitMQ Consumer Prefetch](https://www.rabbitmq.com/consumer-prefetch.html)

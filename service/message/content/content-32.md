# 生产者配置详解

## 概述

生产者配置直接影响消息发送的可靠性、性能和延迟。本章系统讲解三大消息队列生产者的核心配置参数。

---

## 1. Kafka Producer 核心配置

### 1.1 连接配置

```java
Properties props = new Properties();

// Bootstrap服务器（必需）
props.put("bootstrap.servers", "localhost:9092,localhost:9093");

// 客户端ID
props.put("client.id", "my-producer");

// 序列化器（必需）
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
```

### 1.2 ACK配置

```java
// ACK机制（0/1/all）
props.put("acks", "all");
// acks=0：不等待确认（最快，可能丢失）
// acks=1：等待Leader确认（中等）
// acks=all：等待所有ISR确认（最慢，最可靠）

// 最小同步副本数
// min.insync.replicas=2（Broker配置）
// acks=all时，至少2个副本确认
```

### 1.3 重试配置

```java
// 重试次数
props.put("retries", Integer.MAX_VALUE);

// 重试间隔
props.put("retry.backoff.ms", 100);

// 幂等性（避免重复）
props.put("enable.idempotence", true);

// 最大并发请求数
props.put("max.in.flight.requests.per.connection", 5);
```

### 1.4 超时配置

```java
// 请求超时（30秒）
props.put("request.timeout.ms", 30000);

// 发送超时（120秒，包含重试）
props.put("delivery.timeout.ms", 120000);

// 元数据刷新超时
props.put("metadata.max.age.ms", 300000);
```

### 1.5 批量配置

```java
// 批量大小（16KB）
props.put("batch.size", 16384);

// 延迟时间（10ms）
props.put("linger.ms", 10);

// 缓冲区大小（32MB）
props.put("buffer.memory", 33554432);
```

### 1.6 压缩配置

```java
// 压缩算法
props.put("compression.type", "lz4");
// 可选：none, gzip, snappy, lz4, zstd
```

### 1.7 分区器配置

```java
// 默认分区器
props.put("partitioner.class", "org.apache.kafka.clients.producer.internals.DefaultPartitioner");

// 自定义分区器
public class CustomPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                        Object value, byte[] valueBytes, Cluster cluster) {
        // 自定义分区逻辑
        return Math.abs(key.hashCode()) % cluster.partitionCountForTopic(topic);
    }
}
```

### 1.8 拦截器配置

```java
// 拦截器（可选）
props.put("interceptor.classes", "com.example.MyProducerInterceptor");

public class MyProducerInterceptor implements ProducerInterceptor<String, String> {
    @Override
    public ProducerRecord<String, String> onSend(ProducerRecord<String, String> record) {
        // 发送前拦截
        return record;
    }
    
    @Override
    public void onAcknowledgement(RecordMetadata metadata, Exception exception) {
        // 确认后回调
    }
}
```

---

## 2. RocketMQ Producer 配置

### 2.1 基础配置

```java
DefaultMQProducer producer = new DefaultMQProducer("my-producer-group");

// NameServer地址（必需）
producer.setNamesrvAddr("localhost:9876");

// 发送超时（3秒）
producer.setSendMsgTimeout(3000);

// 实例名称
producer.setInstanceName("producer-instance-1");
```

### 2.2 重试配置

```java
// 同步发送重试次数
producer.setRetryTimesWhenSendFailed(2);

// 异步发送重试次数
producer.setRetryTimesWhenSendAsyncFailed(2);

// 发送失败是否重试其他Broker
producer.setRetryAnotherBrokerWhenNotStoreOK(false);
```

### 2.3 压缩配置

```java
// 消息体压缩阈值（4KB）
producer.setCompressMsgBodyOverHowmuch(4096);

// 压缩级别（1-9）
producer.setCompressLevel(5);
```

### 2.4 性能配置

```java
// 最大消息大小（4MB）
producer.setMaxMessageSize(4194304);

// 默认Topic队列数
producer.setDefaultTopicQueueNums(4);
```

---

## 3. RabbitMQ Producer 配置

### 3.1 连接配置

```java
ConnectionFactory factory = new ConnectionFactory();
factory.setHost("localhost");
factory.setPort(5672);
factory.setUsername("admin");
factory.setPassword("admin123");
factory.setVirtualHost("/");
```

### 3.2 发布确认配置

```java
Channel channel = connection.createChannel();

// 开启发布确认
channel.confirmSelect();

// 同步等待确认
channel.waitForConfirmsOrDie(5000);

// 异步确认
channel.addConfirmListener(new ConfirmListener() {
    @Override
    public void handleAck(long deliveryTag, boolean multiple) {
        // 确认成功
    }
    
    @Override
    public void handleNack(long deliveryTag, boolean multiple) {
        // 确认失败
    }
});
```

### 3.3 持久化配置

```java
// 消息持久化
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .deliveryMode(2)  // 2=持久化
    .build();

channel.basicPublish("", "queue", props, message.getBytes());
```

### 3.4 Mandatory配置

```java
// Mandatory=true：消息无法路由时返回
channel.basicPublish("exchange", "routing-key", true, null, message.getBytes());

// 添加返回监听器
channel.addReturnListener((replyCode, replyText, exchange, routingKey, properties, body) -> {
    log.error("消息返回：{}", new String(body));
});
```

---

## 4. 性能调优配置

### 4.1 高吞吐量配置

**Kafka**：
```java
props.put("batch.size", 32768);
props.put("linger.ms", 50);
props.put("compression.type", "lz4");
props.put("buffer.memory", 67108864);
props.put("acks", "1");
```

### 4.2 低延迟配置

**Kafka**：
```java
props.put("batch.size", 0);
props.put("linger.ms", 0);
props.put("compression.type", "none");
props.put("acks", "1");
```

### 4.3 高可靠性配置

**Kafka**：
```java
props.put("acks", "all");
props.put("retries", Integer.MAX_VALUE);
props.put("enable.idempotence", true);
props.put("max.in.flight.requests.per.connection", 5);
```

---

## 5. 配置最佳实践

### 5.1 生产环境推荐

**Kafka**：
```java
props.put("acks", "all");
props.put("retries", Integer.MAX_VALUE);
props.put("enable.idempotence", true);
props.put("compression.type", "lz4");
props.put("batch.size", 16384);
props.put("linger.ms", 10);
props.put("max.in.flight.requests.per.connection", 5);
props.put("request.timeout.ms", 30000);
props.put("delivery.timeout.ms", 120000);
```

**RocketMQ**：
```java
producer.setRetryTimesWhenSendFailed(3);
producer.setSendMsgTimeout(5000);
producer.setCompressMsgBodyOverHowmuch(4096);
```

### 5.2 配置检查清单

```
☑ acks=all（高可靠性）
☑ enable.idempotence=true（幂等性）
☑ retries > 0（重试）
☑ compression.type=lz4（压缩）
☑ batch.size适中（批量）
☑ buffer.memory足够（缓冲）
☑ 超时配置合理
```

---

## 关键要点

1. **acks配置**：all（可靠）、1（均衡）、0（快速）
2. **幂等性**：enable.idempotence=true
3. **批量配置**：batch.size + linger.ms
4. **压缩**：lz4推荐
5. **超时**：delivery.timeout.ms > request.timeout.ms

---

## 深入一点

**Kafka幂等性实现**：

```java
// 开启幂等性后，Producer会分配PID和Sequence Number
props.put("enable.idempotence", true);

// 内部实现：
// 每条消息：<PID, Partition, SequenceNumber>
// Broker检查：
// if (sequenceNumber == expectedSequence) {
//     写入消息
//     expectedSequence++
// } else if (sequenceNumber < expectedSequence) {
//     // 重复消息，丢弃
// } else {
//     // 乱序，报错
// }
```

---

## 参考资料

1. [Kafka Producer Configs](https://kafka.apache.org/documentation/#producerconfigs)
2. [RocketMQ Producer](https://rocketmq.apache.org/docs/quickStart/02quickstart/)
3. [RabbitMQ Publisher Confirms](https://www.rabbitmq.com/confirms.html)

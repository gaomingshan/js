# 生产者性能优化

## 概述

生产者性能直接影响系统吞吐量。本章探讨 Kafka、RocketMQ、RabbitMQ 的生产者优化策略，包括批量发送、压缩、异步发送等。

---

## 1. Kafka 生产者优化

### 1.1 批量发送

```java
Properties props = new Properties();

// 批量大小（16KB）
props.put("batch.size", 16384);

// 延迟时间（10ms）
props.put("linger.ms", 10);

// 缓冲区大小（32MB）
props.put("buffer.memory", 33554432);

// 批量逻辑：
// 1. 累积消息到 batch.size
// 2. 或等待 linger.ms 时间
// 3. 发送批量消息
```

### 1.2 压缩

```java
// 压缩算法：none, gzip, snappy, lz4, zstd
props.put("compression.type", "lz4");

// 压缩比对比：
// lz4: 压缩比中，速度最快（推荐）
// zstd: 压缩比最高，速度中等
// snappy: 压缩比低，速度快
// gzip: 压缩比高，速度慢
```

### 1.3 异步发送

```java
// 异步发送 + 回调
producer.send(record, (metadata, exception) -> {
    if (exception == null) {
        logger.info("发送成功: offset={}", metadata.offset());
    } else {
        logger.error("发送失败", exception);
    }
});

// 不等待结果，继续发送下一条
```

### 1.4 并发优化

```java
// 增加 I/O 线程数
// 默认值通常足够，无需调整
```

---

## 2. RocketMQ 生产者优化

### 2.1 批量发送

```java
DefaultMQProducer producer = new DefaultMQProducer("group");

// 批量发送
List<Message> messages = new ArrayList<>();
for (int i = 0; i < 100; i++) {
    messages.add(new Message("Topic", "Tag", ("msg-" + i).getBytes()));
}

SendResult result = producer.send(messages);
```

### 2.2 异步发送

```java
producer.send(msg, new SendCallback() {
    @Override
    public void onSuccess(SendResult sendResult) {
        // 成功回调
    }
    
    @Override
    public void onException(Throwable e) {
        // 失败回调
    }
});
```

### 2.3 压缩

```java
// 自动压缩（消息大于 4KB）
producer.setCompressMsgBodyOverHowmuch(4096);
```

---

## 3. RabbitMQ 生产者优化

### 3.1 批量发送

```java
// 批量发布
for (int i = 0; i < 100; i++) {
    channel.basicPublish("", "queue", null, ("msg-" + i).getBytes());
}

// 批量确认
channel.waitForConfirmsOrDie(5000);
```

### 3.2 Channel 复用

```java
// ❌ 错误：每次创建新 Channel
for (int i = 0; i < 1000; i++) {
    Channel channel = connection.createChannel();
    channel.basicPublish("", "queue", null, msg.getBytes());
    channel.close();
}

// ✅ 正确：复用 Channel
Channel channel = connection.createChannel();
for (int i = 0; i < 1000; i++) {
    channel.basicPublish("", "queue", null, msg.getBytes());
}
```

---

## 4. 性能测试

### 4.1 Kafka 性能测试

```bash
# 生产者性能测试
bin/kafka-producer-perf-test.sh \
  --topic test \
  --num-records 1000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props \
    bootstrap.servers=localhost:9092 \
    compression.type=lz4 \
    batch.size=32768 \
    linger.ms=20

# 输出示例：
# 1000000 records sent, 50000 records/sec (48.83 MB/sec)
```

### 4.2 优化前后对比

| 配置 | TPS | 延迟 |
|------|-----|------|
| 默认配置 | 10000 | 5ms |
| batch.size=32KB | 30000 | 15ms |
| + linger.ms=20 | 45000 | 25ms |
| + compression=lz4 | 60000 | 30ms |

---

## 关键要点

1. **批量发送**：显著提升吞吐量
2. **压缩**：减少网络传输，LZ4 推荐
3. **异步发送**：提升并发性能
4. **连接复用**：避免频繁创建连接
5. **权衡**：吞吐量 vs 延迟

---

## 参考资料

1. [Kafka Producer Configuration](https://kafka.apache.org/documentation/#producerconfigs)
2. [RocketMQ Best Practice](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)

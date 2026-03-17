# 延迟优化

## 概述

延迟是消息从发送到接收的时间。本章介绍如何降低端到端延迟，提升实时性。

---

## 1. 延迟的来源

### 1.1 延迟分析

```
端到端延迟 = 
  生产者延迟 + 
  网络传输延迟 + 
  Broker处理延迟 + 
  消费者拉取延迟 + 
  消费者处理延迟

典型延迟：
- 生产者：1-5ms
- 网络：1-2ms
- Broker：1-3ms
- 消费者拉取：0-100ms（取决于poll间隔）
- 消费者处理：业务相关

总延迟：5-110ms
```

---

## 2. 生产者延迟优化

### 2.1 低延迟配置

```java
Properties props = new Properties();

// 禁用批量（立即发送）
props.put("batch.size", 0);
props.put("linger.ms", 0);

// 禁用压缩
props.put("compression.type", "none");

// 快速确认
props.put("acks", "1");

// 降低延迟至 < 5ms
```

### 2.2 延迟 vs 吞吐量

| 配置 | 延迟 | 吞吐量 |
|------|------|--------|
| linger.ms=0 | 3ms | 20000 TPS |
| linger.ms=10 | 15ms | 50000 TPS |
| linger.ms=50 | 55ms | 80000 TPS |

---

## 3. Broker延迟优化

### 3.1 副本配置

```properties
# 使用 acks=1（只等Leader确认）
# 不等待副本同步，降低延迟

# 延迟对比：
# acks=0：0ms（不等待）
# acks=1：2ms（等Leader）
# acks=all：5-10ms（等所有ISR）
```

### 3.2 刷盘策略

```properties
# RocketMQ 异步刷盘（降低延迟）
flushDiskType=ASYNC_FLUSH

# 同步刷盘：10-50ms
# 异步刷盘：1-5ms
```

---

## 4. 消费者延迟优化

### 4.1 拉取间隔

```java
// Kafka 减小拉取间隔
props.put("fetch.min.bytes", 1);      // 有数据立即返回
props.put("fetch.max.wait.ms", 100);  // 最多等100ms

while (true) {
    ConsumerRecords<String, String> records = 
        consumer.poll(Duration.ofMillis(100));  // 100ms轮询
    
    // 立即处理
    processRecords(records);
}
```

### 4.2 RocketMQ 长轮询

```java
// RocketMQ 长轮询自动优化延迟
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group");

// 长轮询机制：
// 1. 有消息立即返回（延迟<10ms）
// 2. 无消息Hold住请求，等新消息到达
// 3. 最多Hold 30秒
```

---

## 5. 网络延迟优化

### 5.1 网络拓扑

```
同机房部署：
- 延迟：< 1ms
- 推荐：生产环境

跨机房部署：
- 延迟：5-20ms
- 不推荐：实时场景

跨地域部署：
- 延迟：50-200ms
- 避免：低延迟场景
```

### 5.2 网络优化

```bash
# TCP 优化
sysctl net.ipv4.tcp_low_latency=1
sysctl net.ipv4.tcp_nodelay=1

# 禁用Nagle算法（减少延迟）
```

---

## 6. 序列化延迟

### 6.1 序列化性能

| 序列化方式 | 序列化耗时 | 反序列化耗时 |
|-----------|-----------|-------------|
| JSON | 100μs | 150μs |
| Protobuf | 30μs | 40μs |
| Avro | 40μs | 50μs |
| Kryo | 25μs | 35μs |

### 6.2 优化建议

```java
// 使用二进制序列化（Protobuf、Avro）
// 避免 JSON（性能差）

// Protobuf 示例
byte[] data = message.toByteArray();
producer.send(new ProducerRecord<>("topic", data));
```

---

## 7. 低延迟场景配置

### 7.1 Kafka 低延迟配置

**生产者**：
```java
props.put("batch.size", 0);
props.put("linger.ms", 0);
props.put("compression.type", "none");
props.put("acks", "1");
```

**消费者**：
```java
props.put("fetch.min.bytes", 1);
props.put("fetch.max.wait.ms", 100);
```

**Broker**：
```properties
num.network.threads=8
num.io.threads=16
```

### 7.2 性能对比

```
默认配置：
- P99延迟：50ms
- 吞吐量：50000 TPS

低延迟配置：
- P99延迟：5ms
- 吞吐量：20000 TPS

延迟降低90%，吞吐量下降60%
```

---

## 8. 延迟监控

### 8.1 监控指标

```yaml
# Kafka Producer 延迟
- kafka.producer:type=producer-metrics,client-id=*,name=request-latency-avg

# Kafka Consumer 延迟
- kafka.consumer:type=consumer-fetch-manager-metrics,client-id=*,name=fetch-latency-avg

# 端到端延迟（自定义）
- message_e2e_latency_seconds
```

### 8.2 告警规则

```yaml
- alert: HighLatency
  expr: message_e2e_latency_seconds{quantile="0.99"} > 0.1
  annotations:
    summary: "P99延迟超过100ms"
```

---

## 9. 延迟 vs 吞吐量权衡

### 9.1 业务场景分类

**低延迟场景**（P99 < 10ms）：
```
- 实时交易
- 在线游戏
- 实时推荐
- 监控告警

配置：batch.size=0, linger.ms=0, acks=1
```

**均衡场景**（P99 < 50ms）：
```
- 订单处理
- 消息通知
- 日志收集

配置：batch.size=16KB, linger.ms=10, acks=all
```

**高吞吐场景**（P99 < 500ms）：
```
- 离线分析
- 数据同步
- 批量处理

配置：batch.size=64KB, linger.ms=100, acks=1
```

---

## 关键要点

1. **低延迟配置**：batch.size=0, linger.ms=0
2. **延迟来源**：生产者、网络、Broker、消费者
3. **权衡**：延迟与吞吐量矛盾
4. **监控**：P99、P999延迟指标
5. **场景选择**：根据业务需求配置

---

## 深入一点

**Kafka 请求延迟分解**：

```
生产者发送请求：
1. 序列化：50μs
2. 网络发送：1ms
3. Broker处理：
   - 写PageCache：100μs
   - 等待ISR同步：5ms（acks=all）
4. 网络返回：1ms
5. 生产者回调：10μs

总延迟：7.16ms
```

**优化方向**：
```
1. acks=1：跳过ISR等待，延迟降至2ms
2. 本地部署：网络延迟降至0.1ms
3. 批量序列化：均摊序列化开销
4. 异步发送：不等待响应
```

---

## 参考资料

1. [Kafka Latency](https://kafka.apache.org/documentation/#networklayer)
2. [Low Latency Messaging](https://www.confluent.io/blog/configure-kafka-to-minimize-latency/)

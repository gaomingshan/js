# 超时配置详解

## 概述

合理的超时配置是系统稳定性的关键。本章详细讲解三大消息队列的各类超时参数及配置建议。

---

## 1. Kafka 超时配置

### 1.1 Producer 超时

```java
// 请求超时（30秒）
props.put("request.timeout.ms", 30000);

// 发送超时（120秒，包含重试）
props.put("delivery.timeout.ms", 120000);

// 元数据刷新超时（60秒）
props.put("metadata.max.age.ms", 300000);

// 连接超时
props.put("connections.max.idle.ms", 540000);
```

### 1.2 Consumer 超时

```java
// 会话超时（30秒）
props.put("session.timeout.ms", 30000);

// 心跳间隔（10秒，必须 < session.timeout.ms/3）
props.put("heartbeat.interval.ms", 10000);

// 拉取间隔超时（5分钟）
props.put("max.poll.interval.ms", 300000);

// 拉取等待超时（500ms）
props.put("fetch.max.wait.ms", 500);

// 请求超时
props.put("request.timeout.ms", 30000);
```

### 1.3 Broker 超时

```properties
# 副本同步超时（10秒）
replica.lag.time.max.ms=10000

# 连接空闲超时（9分钟）
connections.max.idle.ms=540000

# 请求超时
request.timeout.ms=30000
```

---

## 2. RocketMQ 超时配置

### 2.1 Producer 超时

```java
// 发送超时（3秒）
producer.setSendMsgTimeout(3000);

// 同步复制超时（5秒，Broker 配置）
syncFlushTimeout=5000
syncMasterFlushSlaveMaxTimeout=5000
```

### 2.2 Consumer 超时

```java
// 消费超时（15分钟）
consumer.setConsumeTimeout(15);

// 拉取超时（10秒）
// 内部默认，无法配置
```

### 2.3 Broker 超时

```properties
# 刷盘超时（5秒）
syncFlushTimeout=5000

# 主从同步超时（5秒）
syncMasterFlushSlaveMaxTimeout=5000

# 长轮询超时（30秒）
longPollingEnable=true
shortPollingTimeMills=1000
```

---

## 3. RabbitMQ 超时配置

### 3.1 连接超时

```java
ConnectionFactory factory = new ConnectionFactory();

// 连接超时（60秒）
factory.setConnectionTimeout(60000);

// 握手超时（10秒）
factory.setHandshakeTimeout(10000);

// 关闭超时（10秒）
factory.setShutdownTimeout(10000);
```

### 3.2 心跳超时

```conf
# rabbitmq.conf
# 心跳超时（60秒）
heartbeat = 60
```

```java
// Java 客户端
factory.setRequestedHeartbeat(60);
```

### 3.3 消费超时

RabbitMQ 没有消费超时概念，通过 ACK 机制控制。

---

## 4. 超时配置最佳实践

### 4.1 Kafka 配置建议

```java
// Producer（可靠性优先）
props.put("request.timeout.ms", 30000);
props.put("delivery.timeout.ms", 120000);

// Producer（性能优先）
props.put("request.timeout.ms", 10000);
props.put("delivery.timeout.ms", 30000);

// Consumer
props.put("session.timeout.ms", 30000);      // 会话超时
props.put("heartbeat.interval.ms", 10000);   // 心跳间隔 = session / 3
props.put("max.poll.interval.ms", 300000);   // 拉取间隔 > 最大处理时间
```

### 4.2 RocketMQ 配置建议

```java
// Producer
producer.setSendMsgTimeout(5000);  // 5秒（默认3秒）

// Consumer
consumer.setConsumeTimeout(20);  // 20分钟（默认15分钟）
```

### 4.3 RabbitMQ 配置建议

```java
factory.setConnectionTimeout(60000);   // 60秒
factory.setRequestedHeartbeat(60);     // 60秒
```

---

## 5. 超时问题排查

### 5.1 常见超时错误

**Kafka TimeoutException**：
```
原因：
1. 网络延迟过高
2. Broker 负载过高
3. 消息体过大
4. 超时配置过小

解决：
1. 增大超时配置
2. 优化网络
3. 减小消息体
4. 扩容 Broker
```

**RocketMQ SendMessageTimeout**：
```
原因：
1. Broker 繁忙
2. 网络问题
3. 刷盘慢

解决：
1. 增大 sendMsgTimeout
2. 异步发送
3. 异步刷盘
```

### 5.2 超时监控

```yaml
# Prometheus 告警
- alert: KafkaProducerTimeout
  expr: rate(kafka_producer_request_timeout_total[5m]) > 10
  annotations:
    summary: "生产者超时频繁"

- alert: RocketMQSendTimeout
  expr: rate(rocketmq_producer_send_timeout_total[5m]) > 10
  annotations:
    summary: "发送超时频繁"
```

---

## 6. 超时配置对照表

| 超时类型 | Kafka | RocketMQ | RabbitMQ | 推荐值 |
|---------|-------|----------|----------|--------|
| 连接超时 | - | - | 60s | 60s |
| 请求超时 | 30s | 3s | - | 30s |
| 发送超时 | 120s | 3s | - | 120s/5s |
| 心跳间隔 | 10s | - | 60s | 10s/60s |
| 会话超时 | 30s | - | - | 30s |
| 拉取超时 | 300s | - | - | 300s |
| 刷盘超时 | - | 5s | - | 5s |

---

## 关键要点

1. **Kafka**：delivery.timeout.ms > request.timeout.ms
2. **心跳间隔**：heartbeat < session.timeout / 3
3. **拉取间隔**：max.poll.interval.ms > 最大处理时间
4. **超时调优**：逐步增大，观察效果
5. **监控告警**：超时次数过多需告警

---

## 参考资料

1. [Kafka Timeouts](https://kafka.apache.org/documentation/#producerconfigs)
2. [RocketMQ Configuration](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)
3. [RabbitMQ Heartbeats](https://www.rabbitmq.com/heartbeats.html)

# Kafka 核心配置

## 概述

Kafka 配置参数众多，合理配置对性能和稳定性至关重要。本章系统讲解 Broker、Producer、Consumer 的核心配置。

---

## 1. Broker 核心配置

### 1.1 基础配置

```properties
# broker.id（必须唯一）
broker.id=0

# 监听地址
listeners=PLAINTEXT://:9092
advertised.listeners=PLAINTEXT://192.168.1.100:9092

# 日志目录（支持多个目录，逗号分隔）
log.dirs=/var/kafka-logs-1,/var/kafka-logs-2

# Zookeeper 连接（Zookeeper 模式）
zookeeper.connect=localhost:2181

# 默认副本数
default.replication.factor=3
num.partitions=3
```

### 1.2 性能配置

```properties
# 网络线程数
num.network.threads=8

# I/O 线程数
num.io.threads=16

# Socket 缓冲区
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600

# 副本拉取配置
num.replica.fetchers=4
replica.fetch.max.bytes=1048576
```

### 1.3 存储配置

```properties
# 日志保留时间（7天）
log.retention.hours=168

# 日志保留大小（-1表示无限制）
log.retention.bytes=-1

# 日志段大小（1GB）
log.segment.bytes=1073741824

# 日志段时间（7天）
log.segment.ms=604800000

# 日志清理检查间隔（5分钟）
log.retention.check.interval.ms=300000
```

---

## 2. Producer 核心配置

### 2.1 连接配置

```java
Properties props = new Properties();

// Bootstrap 服务器
props.put("bootstrap.servers", "localhost:9092");

// 客户端 ID
props.put("client.id", "producer-1");

// 序列化器
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
```

### 2.2 可靠性配置

```java
// ACK 机制（0/1/all）
props.put("acks", "all");

// 重试次数
props.put("retries", Integer.MAX_VALUE);

// 幂等性
props.put("enable.idempotence", true);

// 最大并发请求数
props.put("max.in.flight.requests.per.connection", 5);

// 请求超时
props.put("request.timeout.ms", 30000);

// 发送超时
props.put("delivery.timeout.ms", 120000);
```

### 2.3 性能配置

```java
// 批量大小（16KB）
props.put("batch.size", 16384);

// 延迟时间（10ms）
props.put("linger.ms", 10);

// 压缩类型
props.put("compression.type", "lz4");

// 缓冲区大小（32MB）
props.put("buffer.memory", 33554432);

// 最大请求大小（1MB）
props.put("max.request.size", 1048576);
```

---

## 3. Consumer 核心配置

### 3.1 基础配置

```java
Properties props = new Properties();

// Bootstrap 服务器
props.put("bootstrap.servers", "localhost:9092");

// 消费者组ID
props.put("group.id", "my-consumer-group");

// 客户端ID
props.put("client.id", "consumer-1");

// 反序列化器
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
```

### 3.2 Offset 配置

```java
// 自动提交开关
props.put("enable.auto.commit", "false");

// 自动提交间隔（5秒）
props.put("auto.commit.interval.ms", "5000");

// 初始 Offset（earliest/latest/none）
props.put("auto.offset.reset", "latest");
```

### 3.3 拉取配置

```java
// 单次拉取最大记录数
props.put("max.poll.records", 500);

// 拉取间隔超时（5分钟）
props.put("max.poll.interval.ms", 300000);

// 最小拉取字节数
props.put("fetch.min.bytes", 1);

// 最大等待时间
props.put("fetch.max.wait.ms", 500);

// 单分区最大拉取字节数
props.put("max.partition.fetch.bytes", 1048576);
```

### 3.4 会话配置

```java
// 会话超时（30秒）
props.put("session.timeout.ms", 30000);

// 心跳间隔（10秒）
props.put("heartbeat.interval.ms", 10000);
```

---

## 4. Topic 级别配置

```bash
# 创建 Topic 时指定配置
bin/kafka-topics.sh --create \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 6 \
  --replication-factor 3 \
  --config retention.ms=86400000 \
  --config segment.bytes=536870912 \
  --config min.insync.replicas=2 \
  --config cleanup.policy=delete \
  --config compression.type=lz4
```

**常用 Topic 配置**：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `retention.ms` | 保留时间 | 7天 |
| `retention.bytes` | 保留大小 | -1 |
| `segment.bytes` | 段文件大小 | 1GB |
| `min.insync.replicas` | 最小同步副本数 | 1 |
| `cleanup.policy` | 清理策略 | delete |
| `compression.type` | 压缩类型 | producer |
| `max.message.bytes` | 最大消息大小 | 1MB |

---

## 5. 配置最佳实践

### 5.1 生产环境推荐配置

**Broker**：
```properties
default.replication.factor=3
min.insync.replicas=2
unclean.leader.election.enable=false
auto.create.topics.enable=false
log.retention.hours=168
```

**Producer**：
```java
props.put("acks", "all");
props.put("retries", Integer.MAX_VALUE);
props.put("enable.idempotence", true);
props.put("compression.type", "lz4");
props.put("batch.size", 16384);
props.put("linger.ms", 10);
```

**Consumer**：
```java
props.put("enable.auto.commit", "false");
props.put("max.poll.records", 500);
props.put("session.timeout.ms", 30000);
props.put("heartbeat.interval.ms", 10000);
```

### 5.2 配置调优步骤

1. **基线测试**：使用默认配置测试性能
2. **识别瓶颈**：通过监控找出瓶颈
3. **调整配置**：针对性调整参数
4. **对比测试**：验证调优效果
5. **持续优化**：根据业务变化持续调整

---

## 关键要点

1. **Broker 配置**：副本数、ISR、自动创建
2. **Producer 配置**：acks、幂等性、批量、压缩
3. **Consumer 配置**：手动提交、拉取参数、会话超时
4. **Topic 配置**：保留策略、段大小、最小同步副本
5. **生产环境**：禁用自动创建、启用幂等性

---

## 参考资料

1. [Kafka Configuration](https://kafka.apache.org/documentation/#configuration)
2. [Kafka Producer Configs](https://kafka.apache.org/documentation/#producerconfigs)
3. [Kafka Consumer Configs](https://kafka.apache.org/documentation/#consumerconfigs)

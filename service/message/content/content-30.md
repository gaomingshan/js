# 吞吐量优化

## 概述

吞吐量是衡量消息队列性能的核心指标。本章从生产者、消费者、Broker三个层面优化吞吐量。

---

## 1. 生产者吞吐优化

### 1.1 批量发送

```java
// Kafka 批量配置
props.put("batch.size", 32768);      // 32KB
props.put("linger.ms", 50);          // 等待50ms
props.put("buffer.memory", 67108864); // 64MB缓冲区

// 吞吐量提升：10000 → 80000 TPS（8倍）
```

### 1.2 压缩

```java
props.put("compression.type", "lz4");

// 网络传输量减少60%
// 吞吐量提升：50%
```

### 1.3 异步发送

```java
// 异步发送（不等待响应）
producer.send(record, (metadata, exception) -> {
    // 异步回调
});

// 吞吐量提升：30%
```

---

## 2. 消费者吞吐优化

### 2.1 批量拉取

```java
// Kafka
props.put("max.poll.records", 1000);  // 单次拉取1000条
props.put("fetch.min.bytes", 1048576); // 最少1MB

// 减少网络往返，提升吞吐量
```

### 2.2 并发消费

```java
// RocketMQ
consumer.setConsumeThreadMin(64);
consumer.setConsumeThreadMax(128);

// 吞吐量提升：10倍
```

### 2.3 预取优化

```java
// RabbitMQ
channel.basicQos(100);  // 预取100条

// 减少网络等待时间
```

---

## 3. Broker 吞吐优化

### 3.1 分区数

```
分区数 = 目标吞吐量 / 单分区吞吐量

示例：
目标：100MB/s
单分区：10MB/s
分区数 = 100 / 10 = 10
```

### 3.2 副本数

```properties
# 副本数越少，吞吐量越高
default.replication.factor=3  # 推荐

# 副本数对吞吐量的影响：
# 1副本：100%
# 2副本：80%
# 3副本：65%
```

### 3.3 网络优化

```properties
# Kafka Broker 配置
num.network.threads=8
num.io.threads=16

socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
```

---

## 4. 硬件选型

### 4.1 CPU

```
推荐：16核及以上
建议：2.5GHz+

吞吐量与CPU核数接近线性关系
```

### 4.2 内存

```
推荐：64GB+
用途：
- JVM Heap：8-16GB
- Page Cache：剩余全部

Page Cache越大，吞吐量越高
```

### 4.3 磁盘

```
SSD vs HDD：
- SSD顺序写：500 MB/s
- HDD顺序写：150 MB/s

SSD吞吐量是HDD的3倍
```

### 4.4 网络

```
推荐：10Gb/s+

网络带宽 = 峰值TPS × 消息大小 × 8

示例：
50000 TPS × 1KB × 8 = 400Mb/s
推荐：1Gb/s 网卡
```

---

## 5. 性能测试

### 5.1 Kafka 性能测试

```bash
# 生产者性能测试
bin/kafka-producer-perf-test.sh \
  --topic test \
  --num-records 10000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props \
    bootstrap.servers=localhost:9092 \
    compression.type=lz4 \
    batch.size=32768 \
    linger.ms=50

# 消费者性能测试
bin/kafka-consumer-perf-test.sh \
  --topic test \
  --messages 10000000 \
  --bootstrap-server localhost:9092
```

### 5.2 性能基线

| 配置 | 吞吐量 | 说明 |
|------|--------|------|
| 默认配置 | 20000 TPS | 单机 |
| 批量+压缩 | 80000 TPS | 4倍提升 |
| 3个Broker | 240000 TPS | 12倍提升 |
| 6个分区 | 240000 TPS | 分区并行 |

---

## 6. 分区数规划

### 6.1 计算公式

```
分区数 = max(
    目标吞吐量 / 生产者单分区吞吐量,
    目标吞吐量 / 消费者单分区吞吐量
)

示例：
目标：100MB/s
生产者单分区：20MB/s
消费者单分区：10MB/s

分区数 = max(100/20, 100/10) = 10
```

### 6.2 分区数限制

```
单Topic分区数建议：不超过1000
单Broker分区数建议：不超过4000

过多分区的问题：
- Leader选举时间长
- 文件描述符消耗大
- Rebalance时间长
```

---

## 7. 网络带宽规划

### 7.1 带宽计算

```
带宽需求 = 峰值TPS × 消息大小 × 副本数 × 8

示例：
峰值：50000 TPS
消息：1KB
副本：3

带宽 = 50000 × 1KB × 3 × 8
    = 1200Mb/s
    = 1.2Gb/s

推荐：10Gb/s网卡（预留8倍余量）
```

---

## 8. 吞吐量优化清单

### 8.1 生产者优化

```
☑ 批量发送（batch.size=32KB）
☑ 压缩（lz4）
☑ 异步发送
☑ 连接复用
☑ 增大缓冲区（buffer.memory=64MB）
```

### 8.2 消费者优化

```
☑ 批量拉取（max.poll.records=1000）
☑ 并发消费（多线程）
☑ 批量处理（批量插入DB）
☑ 增大预取（fetch.min.bytes=1MB）
```

### 8.3 Broker优化

```
☑ 增加分区数
☑ 使用SSD
☑ 增大网络线程数
☑ 增大I/O线程数
☑ 调整JVM参数
```

---

## 关键要点

1. **批量操作**：显著提升吞吐量
2. **压缩**：减少网络传输，提升50%
3. **分区数**：根据目标吞吐量计算
4. **硬件**：SSD、大内存、高带宽
5. **综合优化**：生产者+消费者+Broker

---

## 深入一点

**吞吐量瓶颈分析**：

```
1. 网络带宽饱和：
   - 现象：网络使用率100%
   - 解决：增加网络带宽、启用压缩

2. CPU饱和：
   - 现象：CPU使用率100%
   - 解决：增加CPU核数、减少压缩级别

3. 磁盘I/O饱和：
   - 现象：iowait高
   - 解决：使用SSD、增加Broker节点

4. 分区数不足：
   - 现象：单分区吞吐量达上限
   - 解决：增加分区数

5. 消费慢：
   - 现象：消息堆积
   - 解决：增加消费者、优化消费逻辑
```

---

## 参考资料

1. [Kafka Performance](https://kafka.apache.org/documentation/#performance)
2. [Benchmarking Apache Kafka](https://engineering.linkedin.com/kafka/benchmarking-apache-kafka-2-million-writes-second-three-cheap-machines)

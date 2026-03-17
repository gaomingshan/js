# 压缩算法对比

## 概述

消息压缩减少网络传输和存储空间，但会增加 CPU 开销。本章对比各种压缩算法的性能。

---

## 1. Kafka 压缩算法

### 1.1 支持的压缩算法

| 算法 | 压缩比 | 压缩速度 | 解压速度 | CPU 开销 | 推荐场景 |
|------|--------|---------|---------|---------|----------|
| none | 1.0x | - | - | 无 | 低延迟 |
| gzip | 3-5x | 慢 | 慢 | 高 | 带宽有限 |
| snappy | 2-3x | 快 | 快 | 中 | 均衡 |
| lz4 | 2-3x | 最快 | 最快 | 低 | 推荐 |
| zstd | 3-4x | 中 | 中 | 中 | 高压缩比 |

### 1.2 配置

```java
// 生产者压缩
props.put("compression.type", "lz4");

// Broker 端不解压，直接存储
// 消费者端解压
```

### 1.3 性能测试

```
测试条件：1KB 消息，100 万条

none:   吞吐量 100MB/s，CPU 10%，网络 100MB/s
lz4:    吞吐量 80MB/s，CPU 15%，网络 40MB/s
snappy: 吞吐量 75MB/s，CPU 18%，网络 45MB/s
gzip:   吞吐量 50MB/s，CPU 30%，网络 30MB/s
zstd:   吞吐量 65MB/s，CPU 25%，网络 35MB/s
```

---

## 2. RocketMQ 压缩

```java
// 自动压缩（消息大于 4KB）
producer.setCompressMsgBodyOverHowmuch(4096);

// 压缩算法：ZIP（Java 内置）
```

---

## 3. RabbitMQ 压缩

RabbitMQ 不支持内置压缩，需在应用层实现：

```java
// 应用层压缩
byte[] compressed = compress(message);
channel.basicPublish("", "queue", null, compressed);

// 消费者解压
byte[] compressed = delivery.getBody();
String message = decompress(compressed);
```

---

## 4. 选择建议

**推荐配置**：
- **Kafka**：lz4（性能最优）
- **RocketMQ**：默认 ZIP
- **RabbitMQ**：应用层 lz4

**场景选择**：
- 网络带宽充足 → none（无压缩）
- 网络带宽有限 → lz4 或 zstd
- 存储成本高 → gzip 或 zstd

---

## 关键要点

1. **LZ4**：Kafka 推荐压缩算法
2. **压缩权衡**：吞吐量 vs 带宽 vs CPU
3. **Broker 不解压**：减少 CPU 开销
4. **批量压缩**：提升压缩比

---

## 参考资料

1. [Kafka Compression](https://kafka.apache.org/documentation/#compression)
2. [LZ4 Benchmark](https://github.com/lz4/lz4)

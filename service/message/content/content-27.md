# 消息压缩

## 概述

消息压缩通过减少网络传输和存储空间，降低成本并提升性能。本章对比各种压缩算法的特点和适用场景。

---

## 1. 压缩算法对比

### 1.1 算法特性

| 算法 | 压缩比 | 压缩速度 | 解压速度 | CPU消耗 | 推荐场景 |
|------|-------|---------|---------|--------|---------|
| GZIP | 3-5x | 慢 | 慢 | 高 | 带宽受限 |
| Snappy | 2-3x | 快 | 快 | 中 | 均衡场景 |
| LZ4 | 2-3x | 最快 | 最快 | 低 | 高性能 |
| ZSTD | 3-4x | 中 | 中 | 中 | 高压缩比 |

### 1.2 性能测试

```
测试条件：1KB消息，100万条

None（无压缩）：
- 吞吐量：100000 TPS
- CPU：10%
- 网络：100MB/s

LZ4：
- 吞吐量：80000 TPS
- CPU：15%
- 网络：40MB/s（节省60%）

Snappy：
- 吞吐量：75000 TPS
- CPU：18%
- 网络：45MB/s

GZIP：
- 吞吐量：50000 TPS
- CPU：30%
- 网络：30MB/s

ZSTD：
- 吞吐量：65000 TPS
- CPU：25%
- 网络：35MB/s
```

---

## 2. Kafka 压缩

### 2.1 配置

```java
Properties props = new Properties();

// 压缩算法（none/gzip/snappy/lz4/zstd）
props.put("compression.type", "lz4");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);
```

### 2.2 压缩流程

```
1. Producer 压缩消息
   ↓
2. 发送压缩后的数据到 Broker
   ↓
3. Broker 不解压，直接存储
   ↓
4. Consumer 拉取压缩数据
   ↓
5. Consumer 解压消息
```

### 2.3 Broker 端配置

```properties
# Broker 可以重新压缩消息
compression.type=producer  # 保持生产者压缩（推荐）
# 或
compression.type=lz4  # Broker 统一压缩
```

---

## 3. RocketMQ 压缩

### 3.1 自动压缩

```java
DefaultMQProducer producer = new DefaultMQProducer("group");

// 自动压缩（消息体大于4KB）
producer.setCompressMsgBodyOverHowmuch(4096);

// 压缩级别（1-9，5为默认）
producer.setCompressLevel(5);

producer.start();
```

### 3.2 压缩算法

RocketMQ 使用 Java 内置 ZIP 压缩：
```java
// 自动判断是否需要压缩
if (msg.getBody().length > compressMsgBodyOverHowmuch) {
    byte[] compressed = UtilAll.compress(msg.getBody(), zipCompressLevel);
    msg.setBody(compressed);
    msg.setFlag(msg.getFlag() | MessageSysFlag.COMPRESSED_FLAG);
}
```

---

## 4. RabbitMQ 压缩

### 4.1 应用层压缩

RabbitMQ 不支持内置压缩，需在应用层实现：

```java
import java.util.zip.*;

// 压缩消息
public byte[] compress(String message) throws IOException {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    GZIPOutputStream gzipOS = new GZIPOutputStream(baos);
    gzipOS.write(message.getBytes("UTF-8"));
    gzipOS.close();
    return baos.toByteArray();
}

// 发送压缩消息
byte[] compressed = compress(message);
channel.basicPublish("", "queue", null, compressed);

// 解压消息
public String decompress(byte[] compressed) throws IOException {
    GZIPInputStream gzipIS = new GZIPInputStream(new ByteArrayInputStream(compressed));
    BufferedReader br = new BufferedReader(new InputStreamReader(gzipIS, "UTF-8"));
    StringBuilder sb = new StringBuilder();
    String line;
    while ((line = br.readLine()) != null) {
        sb.append(line);
    }
    return sb.toString();
}
```

---

## 5. 压缩效果分析

### 5.1 不同消息类型

```
JSON 消息（1KB）：
- LZ4：压缩比 2.5x
- GZIP：压缩比 4x

日志消息（10KB）：
- LZ4：压缩比 3x
- GZIP：压缩比 5x

二进制数据（1KB）：
- LZ4：压缩比 1.2x
- GZIP：压缩比 1.5x
```

### 5.2 成本节省

```
案例：日均10TB数据，保留7天

无压缩：
- 存储：70TB
- 成本：$7000/月（$0.1/GB）

LZ4压缩（压缩比3x）：
- 存储：23.3TB
- 成本：$2330/月
- 节省：$4670/月（67%）
```

---

## 6. 压缩算法选择

### 6.1 选择建议

**LZ4（推荐）**：
- 适合大多数场景
- 性能和压缩比平衡
- Kafka 推荐配置

**ZSTD**：
- 需要更高压缩比
- 可接受CPU开销
- 存储成本敏感

**Snappy**：
- 兼容性好
- 性能接近LZ4
- 历史原因使用

**GZIP**：
- 带宽严重受限
- 不在意CPU和延迟
- 离线数据处理

### 6.2 场景对照

| 场景 | 推荐算法 | 原因 |
|------|---------|------|
| 日志收集 | LZ4 | 高吞吐量 |
| 实时消息 | LZ4/Snappy | 低延迟 |
| 离线分析 | ZSTD/GZIP | 高压缩比 |
| 二进制数据 | None | 压缩效果差 |
| 已压缩数据 | None | 无法再压缩 |

---

## 7. 压缩配置最佳实践

### 7.1 Kafka 推荐

```java
// 生产环境推荐配置
props.put("compression.type", "lz4");

// Broker 端保持生产者压缩
compression.type=producer
```

### 7.2 RocketMQ 推荐

```java
// 自动压缩大于4KB的消息
producer.setCompressMsgBodyOverHowmuch(4096);
producer.setCompressLevel(5);
```

### 7.3 避免重复压缩

```java
// ❌ 错误：消息已压缩，不要重复压缩
String json = compress(data);  // 应用层压缩
producer.send(topic, json);     // Producer 再次压缩

// ✅ 正确：只压缩一次
producer.send(topic, data);  // 仅 Producer 压缩
```

---

## 8. 监控压缩效果

### 8.1 监控指标

```yaml
# Kafka 压缩率
- kafka_server_brokertopicmetrics_compressionratio

# 网络流量
- kafka_network_requestmetrics_requestbytes

# CPU 使用率
- process_cpu_seconds_total
```

### 8.2 效果评估

```
评估公式：
压缩效果 = (原始大小 - 压缩后大小) / 原始大小 × 100%

成本节省 = 原始成本 × 压缩效果

性能影响 = (原始TPS - 压缩TPS) / 原始TPS × 100%
```

---

## 关键要点

1. **LZ4**：Kafka推荐，性能最优
2. **压缩流程**：Producer压缩，Broker存储，Consumer解压
3. **成本节省**：50%-70%存储和带宽成本
4. **性能影响**：TPS降低10%-50%
5. **选择原则**：根据场景平衡性能和成本

---

## 深入一点

**LZ4 压缩原理**：

```
LZ4 算法特点：
1. 基于字典的压缩
2. 查找重复字符串
3. 用短引用替换重复内容
4. 解压速度极快（无需查表）

示例：
原始："hello world hello world"
压缩："hello world <ref:0,11>"
```

**Kafka 批量压缩**：

```java
// Kafka 对整个批次压缩，提升压缩比
ProducerBatch batch = new ProducerBatch();
batch.append(msg1);
batch.append(msg2);
// ...
batch.append(msg100);

byte[] compressed = compress(batch.buffer());
// 批量压缩比单条压缩效果更好
```

---

## 参考资料

1. [Kafka Compression](https://kafka.apache.org/documentation/#compression)
2. [LZ4 Benchmark](https://github.com/lz4/lz4)
3. [Compression Comparison](https://github.com/facebook/zstd#benchmarks)

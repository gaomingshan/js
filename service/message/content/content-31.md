# 吞吐量与延迟优化

## 概述

吞吐量和延迟往往是矛盾的，需要根据业务场景权衡。本章探讨如何在两者之间取得平衡。

---

## 1. 吞吐量优化

### 1.1 Kafka 高吞吐配置

```java
// 生产者配置
props.put("batch.size", 32768);       // 增大批量
props.put("linger.ms", 50);           // 增加等待时间
props.put("compression.type", "lz4"); // 启用压缩
props.put("acks", "1");               // 降低可靠性

// 消费者配置
props.put("fetch.min.bytes", 1048576);  // 增大拉取大小
props.put("max.poll.records", 1000);    // 增大批量
```

**吞吐量测试**：

```bash
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

# 结果：80000+ records/sec (78 MB/sec)
```

---

## 2. 延迟优化

### 2.1 Kafka 低延迟配置

```java
// 生产者配置
props.put("batch.size", 0);           // 禁用批量
props.put("linger.ms", 0);            // 立即发送
props.put("compression.type", "none"); // 禁用压缩
props.put("acks", "1");               // 快速确认

// 消费者配置
props.put("fetch.min.bytes", 1);      // 立即返回
props.put("fetch.max.wait.ms", 0);    // 无等待
```

**延迟测试**：

```
批量配置：P99 = 50ms
低延迟配置：P99 = 5ms
```

---

## 3. 权衡策略

### 3.1 配置对比

| 场景 | batch.size | linger.ms | acks | 压缩 | 吞吐量 | 延迟 |
|------|-----------|-----------|------|------|--------|------|
| 高吞吐 | 32KB | 50ms | 1 | lz4 | 80K/s | 50ms |
| 均衡 | 16KB | 10ms | all | lz4 | 50K/s | 15ms |
| 低延迟 | 0 | 0ms | 1 | none | 20K/s | 5ms |

### 3.2 业务场景选择

**高吞吐场景**：
- 日志收集
- 数据同步
- 离线分析

**低延迟场景**：
- 交易系统
- 实时推荐
- 监控告警

**均衡场景**：
- 订单处理
- 消息通知
- 大多数业务

---

## 4. RocketMQ 优化

### 4.1 高吞吐配置

```java
// 异步发送 + 批量
producer.send(msg, callback);
producer.send(messages);  // 批量发送

// 异步刷盘
flushDiskType=ASYNC_FLUSH
```

### 4.2 低延迟配置

```java
// 同步发送
SendResult result = producer.send(msg);

// 同步刷盘
flushDiskType=SYNC_FLUSH
```

---

## 5. 监控指标

### 5.1 吞吐量指标

```yaml
# Prometheus 监控
- kafka_server_brokertopicmetrics_messagesinpersec
- kafka_server_brokertopicmetrics_bytesinpersec
```

### 5.2 延迟指标

```yaml
- kafka_network_requestmetrics_totaltimems
- kafka_consumer_fetch_manager_metrics_fetch_latency_avg
```

---

## 关键要点

1. **吞吐量优化**：批量、压缩、异步
2. **延迟优化**：禁用批量、禁用压缩、同步
3. **权衡**：根据业务场景选择配置
4. **监控**：实时监控吞吐量和延迟指标

---

## 参考资料

1. [Kafka Performance Tuning](https://kafka.apache.org/documentation/#performance)
2. [RocketMQ Best Practice](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)

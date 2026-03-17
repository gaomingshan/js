# 保留期限与清理配置

## 概述

合理的数据保留策略既能满足业务需求，又能控制存储成本。本章详解三大消息队列的保留和清理机制。

---

## 1. Kafka 保留配置

### 1.1 时间保留

```properties
# Broker 级别（默认7天）
log.retention.hours=168
log.retention.minutes=10080
log.retention.ms=604800000  # 优先级最高

# Topic 级别
retention.ms=86400000  # 1天
```

### 1.2 大小保留

```properties
# 每个分区最大保留大小（-1=无限制）
log.retention.bytes=10737418240  # 10GB

# 组合策略：满足任一条件即清理
log.retention.ms=604800000
log.retention.bytes=10737418240
```

### 1.3 日志段配置

```properties
# 段文件大小（1GB）
log.segment.bytes=1073741824

# 段文件时间（7天）
log.segment.ms=604800000

# 说明：
# 即使 retention.ms=1 小时，如果 segment.ms=7 天
# 消息最快也要 7 天后才能被删除
```

### 1.4 清理检查

```properties
# 清理检查间隔（5分钟）
log.retention.check.interval.ms=300000

# 删除延迟（60秒）
log.segment.delete.delay.ms=60000
```

---

## 2. RocketMQ 保留配置

### 2.1 时间保留

```properties
# broker.conf
# 文件保留时间（小时，默认48小时）
fileReservedTime=48

# 删除时间点（凌晨4点）
deleteWhen=04
```

### 2.2 磁盘保护

```properties
# 磁盘使用率阈值（90%）
diskMaxUsedSpaceRatio=90

# 磁盘强制清理阈值（95%）
diskSpaceCleanForciblyRatio=0.95

# 清理逻辑：
# 1. 定时检查（每天 04:00）
# 2. 删除超过 fileReservedTime 的文件
# 3. 磁盘使用率 > 90% 时，强制删除最旧文件
```

### 2.3 文件预留

```properties
# 物理文件删除间隔（100ms）
destroyMapedFileIntervalForcibly=100

# 最大等待时间（120秒）
cleanResourceInterval=10000
```

---

## 3. RabbitMQ 保留配置

### 3.1 队列 TTL

```java
// 队列级别 TTL
Map<String, Object> args = new HashMap<>();
args.put("x-message-ttl", 86400000);  // 1天
channel.queueDeclare("my-queue", true, false, false, args);
```

### 3.2 消息 TTL

```java
// 消息级别 TTL
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .expiration("3600000")  // 1小时
    .build();
channel.basicPublish("", "queue", props, msg.getBytes());
```

### 3.3 队列长度限制

```java
Map<String, Object> args = new HashMap<>();
args.put("x-max-length", 10000);          // 最大10000条
args.put("x-max-length-bytes", 104857600); // 最大100MB
args.put("x-overflow", "drop-head");       // 删除最旧消息
channel.queueDeclare("limited-queue", true, false, false, args);
```

---

## 4. 保留策略选择

### 4.1 按业务类型

| 业务类型 | 保留时间 | 说明 |
|---------|---------|------|
| 日志收集 | 1-3天 | 快速消费，短期保留 |
| 订单消息 | 7-15天 | 对账需要，中期保留 |
| 审计日志 | 30-90天 | 合规要求，长期保留 |
| 实时推送 | 1小时 | 实时性高，超时无意义 |

### 4.2 按存储成本

```
计算公式：
存储成本 = 每日数据量 × 保留天数 × 单价

示例：
每日数据量 = 10000 TPS × 86400s × 1KB × 3 副本 = 2.59TB
保留7天 = 2.59TB × 7 = 18.13TB
存储成本 = 18.13TB × $0.1/GB/月 = $1813/月

优化方案：
1. 压缩：lz4 压缩比 2-3x，成本降至 $600-900/月
2. 缩短保留：3天，成本 $777/月
3. 减少副本：2副本，成本 $1208/月
```

---

## 5. 清理策略对比

### 5.1 删除策略（Delete）

**Kafka**：
```properties
cleanup.policy=delete

# 定期删除超时文件
# 简单高效
```

**RocketMQ**：
```properties
# 定时删除（每天凌晨4点）
# 或磁盘满时强制删除
```

**RabbitMQ**：
```java
// TTL 过期自动删除
// 或队列满时删除最旧消息
```

### 5.2 压缩策略（Compact）

**Kafka**：
```properties
cleanup.policy=compact

# 保留每个 Key 的最新值
# 适合状态存储
```

**示例**：
```
原始：
offset  key    value
0       k1     v1
1       k2     v2
2       k1     v3  ← k1 的新值
3       k2     null ← 删除标记

压缩后：
offset  key    value
2       k1     v3
3       k2     null
```

---

## 6. 监控与告警

### 6.1 存储监控

```yaml
# Prometheus 监控
# Kafka
- kafka_log_log_size_bytes

# RocketMQ
- rocketmq_broker_disk_usage_ratio

# RabbitMQ
- rabbitmq_queue_messages
- rabbitmq_node_disk_free_bytes
```

### 6.2 告警规则

```yaml
groups:
  - name: storage_alerts
    rules:
      # Kafka 磁盘使用率
      - alert: KafkaDiskFull
        expr: (kafka_log_log_size / disk_total) > 0.8
        annotations:
          summary: "Kafka 磁盘使用率超过 80%"
      
      # RocketMQ 磁盘使用率
      - alert: RocketMQDiskFull
        expr: rocketmq_broker_disk_usage_ratio > 90
        annotations:
          summary: "RocketMQ 磁盘使用率超过 90%"
      
      # RabbitMQ 队列堆积
      - alert: RabbitMQQueueFull
        expr: rabbitmq_queue_messages > 100000
        annotations:
          summary: "RabbitMQ 队列消息超过 10 万"
```

---

## 7. 配置最佳实践

### 7.1 Kafka 推荐配置

```properties
# 生产环境
log.retention.hours=168              # 7天
log.segment.bytes=1073741824         # 1GB
log.segment.ms=604800000             # 7天
log.retention.check.interval.ms=300000  # 5分钟

# 高频Topic（日志收集）
retention.ms=86400000                # 1天
segment.bytes=536870912              # 512MB

# 低频Topic（审计日志）
retention.ms=7776000000              # 90天
```

### 7.2 RocketMQ 推荐配置

```properties
# 生产环境
fileReservedTime=48                  # 2天
deleteWhen=04                        # 凌晨4点
diskMaxUsedSpaceRatio=90             # 90%

# 磁盘充足
fileReservedTime=168                 # 7天

# 磁盘紧张
fileReservedTime=24                  # 1天
diskMaxUsedSpaceRatio=85             # 85%
```

### 7.3 RabbitMQ 推荐配置

```java
// 短期消息（通知、推送）
args.put("x-message-ttl", 3600000);  // 1小时

// 中期消息（订单）
args.put("x-message-ttl", 604800000);  // 7天

// 限制队列长度
args.put("x-max-length", 100000);
args.put("x-overflow", "drop-head");
```

---

## 关键要点

1. **时间保留**：根据业务需求配置，避免过长或过短
2. **大小保留**：控制存储成本，防止磁盘撑爆
3. **定期清理**：Kafka 每5分钟，RocketMQ 每天凌晨
4. **监控告警**：磁盘使用率超过 80% 告警
5. **成本优化**：压缩、缩短保留、减少副本

---

## 参考资料

1. [Kafka Log Retention](https://kafka.apache.org/documentation/#retention)
2. [RocketMQ Store](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)
3. [RabbitMQ TTL](https://www.rabbitmq.com/ttl.html)

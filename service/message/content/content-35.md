# Topic 配置详解

## 概述

Topic是消息队列的核心概念，Topic级别的配置能够精细化控制消息的存储、保留和访问策略。本章系统讲解Topic配置参数。

---

## 1. Kafka Topic 配置

### 1.1 创建Topic时配置

```bash
kafka-topics.sh --create \
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

### 1.2 分区与副本配置

```bash
# 分区数（6个）
--partitions 6

# 副本数（3个）
--replication-factor 3

# 最小同步副本数（2个）
--config min.insync.replicas=2
```

### 1.3 保留期限配置

```bash
# 按时间保留（24小时）
--config retention.ms=86400000

# 按大小保留（10GB）
--config retention.bytes=10737418240

# 满足任一条件即清理
```

### 1.4 段文件配置

```bash
# 段文件大小（512MB）
--config segment.bytes=536870912

# 段文件时间（7天）
--config segment.ms=604800000

# 段文件索引间隔（4KB）
--config segment.index.bytes=10485760
```

### 1.5 清理策略配置

```bash
# 删除策略（delete）
--config cleanup.policy=delete

# 压缩策略（compact）
--config cleanup.policy=compact

# 组合策略
--config cleanup.policy=compact,delete
```

**Log Compaction配置**：
```bash
# 最小压缩延迟
--config min.compaction.lag.ms=0

# 最大压缩延迟
--config max.compaction.lag.ms=9223372036854775807

# 压缩比例
--config min.cleanable.dirty.ratio=0.5
```

### 1.6 压缩配置

```bash
# 压缩类型（producer/uncompressed/lz4/snappy/gzip/zstd）
--config compression.type=producer
```

### 1.7 最大消息大小

```bash
# 最大消息大小（1MB）
--config max.message.bytes=1048576
```

---

## 2. RocketMQ Topic 配置

### 2.1 创建Topic

```bash
mqadmin updateTopic \
  -n localhost:9876 \
  -t OrderTopic \
  -c DefaultCluster \
  -r 8 \
  -w 8 \
  -o true
```

### 2.2 队列配置

```bash
# 读队列数（8个）
-r 8

# 写队列数（8个）
-w 8

# 建议读队列数 = 写队列数
```

### 2.3 权限配置

```bash
# 权限（perm）
-p 6
# 2=写，4=读，6=读写
```

### 2.4 顺序消息配置

```bash
# 是否顺序消息
-o true  # 顺序消息
-o false # 非顺序消息
```

---

## 3. RabbitMQ Queue 配置

### 3.1 队列声明

```java
Map<String, Object> args = new HashMap<>();

// 持久化
boolean durable = true;

// 独占（排他）
boolean exclusive = false;

// 自动删除
boolean autoDelete = false;

channel.queueDeclare("my-queue", durable, exclusive, autoDelete, args);
```

### 3.2 TTL配置

```java
// 队列级别TTL（消息过期时间）
args.put("x-message-ttl", 86400000);  // 24小时

// 队列自身TTL（队列过期时间）
args.put("x-expires", 3600000);  // 1小时无消费者自动删除

channel.queueDeclare("ttl-queue", true, false, false, args);
```

### 3.3 长度限制

```java
// 最大消息数
args.put("x-max-length", 10000);

// 最大字节数
args.put("x-max-length-bytes", 104857600);  // 100MB

// 溢出行为（drop-head/reject-publish/reject-publish-dlx）
args.put("x-overflow", "drop-head");

channel.queueDeclare("limited-queue", true, false, false, args);
```

### 3.4 死信队列配置

```java
// 死信Exchange
args.put("x-dead-letter-exchange", "dlx-exchange");

// 死信路由键
args.put("x-dead-letter-routing-key", "dlx-routing-key");

channel.queueDeclare("business-queue", true, false, false, args);
```

### 3.5 优先级队列

```java
// 最大优先级（10）
args.put("x-max-priority", 10);

channel.queueDeclare("priority-queue", true, false, false, args);
```

### 3.6 惰性队列

```java
// 惰性模式（消息存磁盘）
args.put("x-queue-mode", "lazy");

channel.queueDeclare("lazy-queue", true, false, false, args);
```

---

## 4. 权限配置

### 4.1 Kafka ACL

```bash
# 添加权限
kafka-acls.sh --add \
  --allow-principal User:alice \
  --operation Read \
  --operation Write \
  --topic my-topic \
  --bootstrap-server localhost:9092

# 查看权限
kafka-acls.sh --list \
  --topic my-topic \
  --bootstrap-server localhost:9092
```

### 4.2 RabbitMQ权限

```bash
# 设置用户权限
rabbitmqctl set_permissions -p / alice ".*" ".*" ".*"
# 配置权限  写权限  读权限
```

---

## 5. 配置变更与生效

### 5.1 Kafka动态配置

```bash
# 修改配置
kafka-configs.sh --alter \
  --entity-type topics \
  --entity-name my-topic \
  --add-config retention.ms=172800000 \
  --bootstrap-server localhost:9092

# 查看配置
kafka-configs.sh --describe \
  --entity-type topics \
  --entity-name my-topic \
  --bootstrap-server localhost:9092

# 删除配置
kafka-configs.sh --alter \
  --entity-type topics \
  --entity-name my-topic \
  --delete-config retention.ms \
  --bootstrap-server localhost:9092
```

**生效时间**：立即生效，无需重启

### 5.2 RocketMQ配置变更

```bash
# 更新Topic配置
mqadmin updateTopic \
  -n localhost:9876 \
  -t MyTopic \
  -r 16 \
  -w 16

# 立即生效
```

### 5.3 RabbitMQ策略配置

```bash
# 设置策略（运行时生效）
rabbitmqctl set_policy ttl-policy \
  "^ttl\." \
  '{"message-ttl":86400000}' \
  --apply-to queues

# 查看策略
rabbitmqctl list_policies

# 删除策略
rabbitmqctl clear_policy ttl-policy
```

---

## 6. 配置最佳实践

### 6.1 Kafka推荐配置

**短期数据（日志收集）**：
```bash
--partitions 12 \
--replication-factor 3 \
--config retention.ms=86400000 \
--config segment.bytes=536870912 \
--config cleanup.policy=delete \
--config compression.type=lz4
```

**长期数据（审计日志）**：
```bash
--partitions 6 \
--replication-factor 3 \
--config retention.ms=7776000000 \
--config segment.bytes=1073741824 \
--config compression.type=zstd
```

**状态存储（Kafka Streams）**：
```bash
--partitions 12 \
--replication-factor 3 \
--config cleanup.policy=compact \
--config min.compaction.lag.ms=3600000 \
--config segment.ms=604800000
```

### 6.2 RocketMQ推荐配置

```bash
# 普通Topic
-r 8 -w 8 -p 6 -o false

# 顺序Topic
-r 4 -w 4 -p 6 -o true
```

### 6.3 RabbitMQ推荐配置

```java
// 普通队列
Map<String, Object> args = new HashMap<>();
args.put("x-max-length", 100000);
args.put("x-message-ttl", 86400000);

// 高可用队列（仲裁队列）
args.put("x-queue-type", "quorum");
```

---

## 关键要点

1. **Kafka分区数**：根据并发需求规划
2. **副本数**：生产环境3副本
3. **保留期限**：根据业务需求配置
4. **清理策略**：delete或compact
5. **动态配置**：Kafka支持运行时修改

---

## 深入一点

**Kafka Log Compaction原理**：

```
cleanup.policy=compact

原始日志：
Offset  Key    Value
0       k1     v1
1       k2     v2
2       k1     v3  ← k1的新值
3       k2     null ← 删除标记

压缩后：
Offset  Key    Value
2       k1     v3
3       k2     null

作用：
- 保留每个Key的最新值
- 删除标记（null）保留一段时间后删除
- 适合状态存储（Kafka Streams）
```

**RabbitMQ惰性队列**：

```
普通队列：
- 消息优先存内存
- 内存不足时写磁盘

惰性队列（x-queue-mode=lazy）：
- 消息直接写磁盘
- 减少内存占用
- 适合大量消息堆积场景
```

---

## 参考资料

1. [Kafka Topic Configs](https://kafka.apache.org/documentation/#topicconfigs)
2. [RocketMQ Topic](https://rocketmq.apache.org/docs/domainModel/02topic/)
3. [RabbitMQ Queue Properties](https://www.rabbitmq.com/queues.html)

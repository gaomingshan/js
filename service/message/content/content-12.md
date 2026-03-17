# 消息存储与清理

## 概述

消息的持久化存储和生命周期管理直接影响系统的性能和成本。本章将深入探讨三大消息队列的存储策略、消息保留策略、日志清理机制以及存储空间规划，帮助你优化存储性能并合理控制成本。

---

## 1. 消息保留策略

### 1.1 保留策略类型

**基于时间的保留**：
- 消息保留固定时长后删除
- 适合大多数场景

**基于大小的保留**：
- 分区/队列达到指定大小后删除最旧消息
- 控制磁盘使用

**基于条件的保留**：
- 根据业务规则决定是否删除
- 如：已消费的消息、过期的消息

**三大 MQ 的保留策略对比**：

| 特性 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 时间保留 | ✅ 支持 | ✅ 支持 | ✅ 支持（TTL） |
| 大小保留 | ✅ 支持 | ⚠️ 间接支持（磁盘满自动清理） | ✅ 支持（max-length-bytes） |
| 日志压缩 | ✅ 支持 | ❌ 不支持 | ❌ 不支持 |
| 自动清理 | ✅ 是 | ✅ 是 | ✅ 是 |

---

## 2. Kafka 消息存储与清理

### 2.1 存储结构

**分段日志（Segment）**：

```
/var/kafka-logs/my-topic-0/
├── 00000000000000000000.log        # Segment 0（起始 offset 0）
├── 00000000000000000000.index      # offset 索引
├── 00000000000000000000.timeindex  # 时间索引
├── 00000000000000170410.log        # Segment 1（起始 offset 170410）
├── 00000000000000170410.index
├── 00000000000000170410.timeindex
├── 00000000000000340820.log        # Segment 2（起始 offset 340820）
├── 00000000000000340820.index
├── 00000000000000340820.timeindex
└── leader-epoch-checkpoint         # Leader epoch 记录
```

**Segment 特点**：
- 固定大小（默认 1GB）
- 只有最新的 Segment 可写（Active Segment）
- 旧 Segment 只读，可以被清理

### 2.2 保留策略配置

**时间保留**：

```properties
# Topic 级别配置（优先级高）
retention.ms=604800000  # 7 天（毫秒）

# Broker 级别配置（默认）
log.retention.hours=168      # 7 天
log.retention.minutes=10080  # 7 天
log.retention.ms=604800000   # 7 天（优先级最高）

# 注意：如果同时配置，ms > minutes > hours
```

**大小保留**：

```properties
# 每个分区最大保留大小（-1 表示无限制）
retention.bytes=10737418240  # 10GB

# 超过此大小后，删除最旧的 Segment
```

**组合策略**（满足任一条件即清理）：

```properties
# 保留 7 天或 10GB，先达到哪个条件就清理
retention.ms=604800000
retention.bytes=10737418240
```

**Segment 大小配置**：

```properties
# Segment 文件大小（默认 1GB）
segment.bytes=1073741824

# Segment 时间（默认 7 天）
# 即使 Segment 未达到 segment.bytes，超过此时间也会创建新 Segment
segment.ms=604800000

# 注意：segment.ms 影响消息可被删除的最快时间
# 即使 retention.ms=1 小时，如果 segment.ms=7 天，
# 消息最快也要 7 天后才能被删除（当 Segment 关闭时）
```

**示例配置**：

```bash
# 创建 Topic 时指定保留策略
bin/kafka-topics.sh --create \
  --topic short-lived-topic \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 3 \
  --config retention.ms=86400000 \      # 1 天
  --config segment.bytes=536870912 \    # 512MB
  --config segment.ms=3600000           # 1 小时

# 修改现有 Topic 的保留策略
bin/kafka-configs.sh --alter \
  --entity-type topics \
  --entity-name my-topic \
  --add-config retention.ms=172800000 \ # 2 天
  --bootstrap-server localhost:9092
```

### 2.3 清理策略

**删除策略（Delete，默认）**：

```properties
cleanup.policy=delete

# 工作原理：
# 1. 定期检查（默认 5 分钟）
# 2. 删除超过保留期限的 Segment
# 3. Active Segment 永远不会被删除
```

**清理过程**：

```
检查周期：
├── log.retention.check.interval.ms=300000  # 5 分钟
└── 扫描所有分区的 Segment

判断是否删除：
├── 时间条件：Segment 最后修改时间 > retention.ms
├── 大小条件：分区总大小 > retention.bytes
└── 删除最旧的 Segment（从头部开始）

删除 Segment：
├── 标记 Segment 为 .deleted
├── log.segment.delete.delay.ms=60000  # 等待 60 秒
└── 物理删除文件
```

**日志压缩策略（Compact）**：

```properties
cleanup.policy=compact

# 用途：
# - 保留每个 Key 的最新值
# - 适合状态存储（如 Kafka Streams 的 State Store）
# - 类似于数据库的 UPSERT
```

**日志压缩原理**：

```
原始消息：
offset  key    value
0       user1  {name: "Alice", age: 20}
1       user2  {name: "Bob", age: 25}
2       user1  {name: "Alice", age: 21}  ← 更新
3       user3  {name: "Charlie", age: 30}
4       user2  null                      ← 删除标记

压缩后：
offset  key    value
2       user1  {name: "Alice", age: 21}  ← 保留最新值
4       user2  null                      ← 保留删除标记
3       user3  {name: "Charlie", age: 30}

删除标记（Tombstone）保留一段时间后也会被删除
```

**压缩配置**：

```properties
# 启用压缩
cleanup.policy=compact

# 或同时启用删除和压缩
cleanup.policy=compact,delete

# 压缩触发条件
min.cleanable.dirty.ratio=0.5  # 脏数据比例达到 50% 时压缩

# 压缩延迟
min.compaction.lag.ms=0  # 消息写入后多久可以被压缩
max.compaction.lag.ms=9223372036854775807  # 最长延迟

# 删除标记保留时间
delete.retention.ms=86400000  # 1 天
```

**查看清理进度**：

```bash
# 查看日志清理指标（JMX）
# kafka.log:type=LogCleaner,name=cleaner-recopy-percent
# kafka.log:type=LogCleaner,name=max-dirty-percent
```

### 2.4 磁盘空间管理

**监控磁盘使用**：

```bash
# 查看每个分区的磁盘使用
bin/kafka-log-dirs.sh --describe \
  --bootstrap-server localhost:9092 \
  --broker-list 1,2,3 \
  --topic-list my-topic

# 输出示例：
# {"broker":1,"logDir":"/var/kafka-logs","topic":"my-topic","partition":0,"size":5368709120}
```

**磁盘满处理**：

```properties
# 磁盘空间不足时停止接收消息
log.flush.scheduler.interval.ms=9223372036854775807

# 或配置告警，提前扩容
```

**容量规划**：

```
每日数据量计算：
日消息量 = 生产 TPS × 86400 秒
日数据量 = 日消息量 × 平均消息大小 × 副本数

示例：
- 生产 TPS：10000
- 平均消息大小：1KB
- 副本数：3
- 保留天数：7

容量需求 = 10000 × 86400 × 1KB × 3 × 7
         = 18,144,000,000 KB
         ≈ 18TB

推荐配置：20TB（预留 10% 余量）
```

---

## 3. RocketMQ 消息存储与清理

### 3.1 存储结构

**三层存储**：

```
/store/
├── commitlog/                      # 消息存储
│   ├── 00000000000000000000        # CommitLog 文件 0（1GB）
│   ├── 00000000001073741824        # CommitLog 文件 1
│   └── 00000000002147483648        # CommitLog 文件 2
├── consumequeue/                   # 消费队列索引
│   ├── TopicA/
│   │   ├── 0/                      # Queue 0
│   │   │   ├── 00000000000000000000
│   │   │   └── 00000000000005898240
│   │   ├── 1/                      # Queue 1
│   │   └── 2/                      # Queue 2
│   └── TopicB/
└── index/                          # 消息索引
    ├── 20240101120000000
    └── 20240101130000000
```

### 3.2 保留策略配置

**时间保留**：

```properties
# broker.conf
# 文件保留时间（小时）
fileReservedTime=48  # 2 天

# 删除文件的时间点（凌晨 4 点）
deleteWhen=04

# 强制删除文件的时间点
# 即使文件正在被使用，也会删除
destroyMapedFileIntervalForcibly=120000  # 2 分钟
```

**磁盘空间保护**：

```properties
# 磁盘使用率超过 90% 时，强制删除文件
diskMaxUsedSpaceRatio=90

# 磁盘空间不足时，拒绝写入
# cleanFileForciblyEnable=true
```

**文件大小配置**：

```properties
# CommitLog 文件大小（默认 1GB）
mappedFileSizeCommitLog=1073741824

# ConsumeQueue 文件大小（默认 6MB）
mappedFileSizeConsumeQueue=6000000
```

### 3.3 清理策略

**定时清理**：

```
清理时间点：
├── deleteWhen=04  # 凌晨 4 点触发清理
└── 扫描所有 CommitLog 文件

判断是否删除：
├── 文件创建时间 > fileReservedTime（48 小时）
├── 或磁盘使用率 > diskMaxUsedSpaceRatio（90%）
└── 删除最旧的文件（从头部开始）

删除过程：
├── 删除 CommitLog 文件
├── 自动删除对应的 ConsumeQueue
└── 自动删除对应的 IndexFile
```

**手动清理**：

```bash
# 清理过期的 ConsumeQueue
sh bin/mqadmin cleanExpiredCQ \
  -n localhost:9876 \
  -b broker-a:10911

# 清理未使用的 Topic
sh bin/mqadmin cleanUnusedTopic \
  -n localhost:9876 \
  -c DefaultCluster
```

**磁盘满时的自动清理**：

```properties
# 启用磁盘满自动清理
diskSpaceCleanForciblyRatio=0.95  # 磁盘使用率达到 95% 时强制清理

# 清理策略
# 1. 删除最旧的 CommitLog 文件
# 2. 持续删除直到磁盘使用率 < diskMaxUsedSpaceRatio
```

### 3.4 存储优化

**异步刷盘 vs 同步刷盘**：

```properties
# 异步刷盘（默认，高性能）
flushDiskType=ASYNC_FLUSH

# 刷盘间隔（500ms）
flushCommitLogInterval=500

# 同步刷盘（高可靠性）
flushDiskType=SYNC_FLUSH

# 同步刷盘超时（5 秒）
syncFlushTimeout=5000
```

**预分配文件**：

```properties
# 启用预分配（提升性能）
warmMapedFileEnable=true

# 预分配文件数量
# 提前创建文件，避免运行时创建导致的延迟
```

---

## 4. RabbitMQ 消息存储与清理

### 4.1 存储模型

**内存优先 + 磁盘持久化**：

```
消息流转：
┌─────────────────────────────┐
│ 内存队列（非持久化消息）      │ ← 快速读写
└─────────────────────────────┘
          ↓ 持久化消息
┌─────────────────────────────┐
│ 内存 + 磁盘（持久化消息）     │
│ - 索引在内存                 │
│ - 消息体可能在磁盘           │
└─────────────────────────────┘
          ↓ 内存压力
┌─────────────────────────────┐
│ 磁盘队列（Paging）           │ ← 内存不足时分页
└─────────────────────────────┘
```

**存储目录**：

```
/var/lib/rabbitmq/mnesia/rabbit@hostname/
├── msg_store_persistent/       # 持久化消息
│   ├── 0.rdq                   # 消息文件
│   ├── 1.rdq
│   └── file_summary.ets        # 文件索引
├── msg_store_transient/        # 非持久化消息（重启丢失）
├── queues/                     # 队列元数据
└── schema.DAT                  # 集群元数据
```

### 4.2 TTL（Time To Live）

**队列级别 TTL**：

```java
// 队列中所有消息的 TTL
Map<String, Object> args = new HashMap<>();
args.put("x-message-ttl", 86400000);  // 1 天（毫秒）

channel.queueDeclare("my-queue", true, false, false, args);

// 消息过期后：
// - 如果配置了死信交换机，进入死信队列
// - 否则，直接删除
```

**消息级别 TTL**：

```java
// 单条消息的 TTL
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .expiration("60000")  // 1 分钟（字符串格式）
    .build();

channel.basicPublish("", "my-queue", props, message.getBytes());

// 注意：
// - 消息级别 TTL 优先级更高
// - 过期消息在队列头部时才会被删除（惰性删除）
```

**队列 TTL**：

```java
// 队列自动删除（无消费者且无消息时）
Map<String, Object> args = new HashMap<>();
args.put("x-expires", 3600000);  // 1 小时不使用自动删除

channel.queueDeclare("temp-queue", true, false, false, args);
```

### 4.3 队列长度限制

**限制消息数量**：

```java
Map<String, Object> args = new HashMap<>();
args.put("x-max-length", 10000);  // 最多 10000 条消息

channel.queueDeclare("limited-queue", true, false, false, args);

// 超过限制时：
// - 删除最旧的消息（队列头部）
// - 或进入死信队列（如果配置了 DLX）
```

**限制队列大小（字节）**：

```java
Map<String, Object> args = new HashMap<>();
args.put("x-max-length-bytes", 104857600);  // 100MB

channel.queueDeclare("sized-queue", true, false, false, args);
```

**溢出行为**：

```java
Map<String, Object> args = new HashMap<>();
args.put("x-max-length", 10000);
args.put("x-overflow", "drop-head");  // 删除最旧的消息（默认）
// 或 "reject-publish"  # 拒绝新消息

channel.queueDeclare("my-queue", true, false, false, args);
```

### 4.4 惰性队列（Lazy Queue）

惰性队列将消息尽快写入磁盘，减少内存使用。

**配置惰性队列**：

```java
Map<String, Object> args = new HashMap<>();
args.put("x-queue-mode", "lazy");

channel.queueDeclare("lazy-queue", true, false, false, args);
```

**特点**：
- 消息优先写入磁盘
- 内存占用小
- 吞吐量较低（磁盘 I/O）
- 适合消息堆积场景

**普通队列 vs 惰性队列**：

| 特性 | 普通队列 | 惰性队列 |
|------|---------|---------|
| 存储位置 | 内存优先 | 磁盘优先 |
| 内存占用 | 高 | 低 |
| 吞吐量 | 高 | 中 |
| 延迟 | 低 | 中 |
| 适用场景 | 实时消息 | 消息堆积 |

### 4.5 消息持久化

**三重持久化**：

```java
// 1. 声明持久化 Exchange
channel.exchangeDeclare("my-exchange", "direct", true);  // durable=true

// 2. 声明持久化 Queue
channel.queueDeclare("my-queue", true, false, false, null);  // durable=true

// 3. 发送持久化消息
channel.basicPublish(
    "my-exchange",
    "routing-key",
    MessageProperties.PERSISTENT_TEXT_PLAIN,  // 持久化
    message.getBytes()
);

// 注意：三者必须同时持久化，消息才能在重启后恢复
```

---

## 5. 存储空间规划

### 5.1 容量计算

**Kafka 容量计算**：

```
每日数据量 = 生产 TPS × 86400 × 平均消息大小 × 副本数
总容量需求 = 每日数据量 × 保留天数

示例：
- 生产 TPS：10000
- 平均消息大小：1KB
- 副本数：3
- 保留天数：7

每日数据量 = 10000 × 86400 × 1KB × 3 = 2.59TB
总容量需求 = 2.59TB × 7 = 18.13TB

推荐配置：20TB（预留 10% 余量）
```

**RocketMQ 容量计算**：

```
总容量需求 = 每日数据量 × 保留天数 × 节点数

示例：
- 生产 TPS：5000
- 平均消息大小：1KB
- 保留天数：2
- 主从节点：2（1 Master + 1 Slave）

每日数据量 = 5000 × 86400 × 1KB = 432GB
总容量需求 = 432GB × 2 × 2 = 1.73TB

推荐配置：2TB
```

**RabbitMQ 容量计算**：

```
内存容量 = 峰值消息数 × 平均消息大小 + 元数据开销
磁盘容量 = 持久化消息数 × 平均消息大小

示例：
- 峰值消息数：100 万
- 平均消息大小：1KB
- 持久化比例：100%

内存容量 = 1000000 × 1KB + 100MB = 1.1GB
磁盘容量 = 1000000 × 1KB = 1GB

推荐配置：
- 内存：4GB（预留余量）
- 磁盘：10GB（考虑堆积）
```

### 5.2 存储优化建议

**Kafka 优化**：
1. **合理设置保留时间**：根据业务需求，不要过长
2. **启用压缩**：使用 LZ4 或 ZSTD 压缩
3. **使用 SSD**：提升 I/O 性能
4. **定期清理 Topic**：删除不用的 Topic
5. **监控磁盘使用率**：提前扩容

**RocketMQ 优化**：
1. **异步刷盘**：性能优先场景
2. **同步刷盘**：可靠性优先场景
3. **定期清理过期 ConsumeQueue**
4. **监控 CommitLog 文件数**
5. **预分配文件**：减少运行时开销

**RabbitMQ 优化**：
1. **使用惰性队列**：消息堆积场景
2. **配置合理的 TTL**：避免消息长期堆积
3. **限制队列长度**：防止内存溢出
4. **定期清理队列**：删除不用的队列
5. **监控内存使用率**：避免内存告警

---

## 关键要点

1. **保留策略**：根据业务需求配置时间或大小保留
2. **清理机制**：Kafka 支持删除和压缩两种策略
3. **磁盘管理**：监控磁盘使用率，提前扩容
4. **容量规划**：根据 TPS、消息大小、保留天数计算
5. **性能优化**：使用压缩、SSD、合理配置刷盘策略
6. **RabbitMQ TTL**：队列级别和消息级别 TTL

---

## 深入一点

### Kafka 日志压缩的应用场景

**场景 1：数据库 CDC（Change Data Capture）**：

```
MySQL Binlog → Kafka (compact topic) → 下游系统

消息：
offset  key      value
0       user:1   {"id":1,"name":"Alice","age":20}
1       user:2   {"id":2,"name":"Bob","age":25}
2       user:1   {"id":1,"name":"Alice","age":21}  ← 更新
3       user:2   null                              ← 删除

压缩后：
offset  key      value
2       user:1   {"id":1,"name":"Alice","age":21}
3       user:2   null

下游系统重启后，可以快速恢复到最新状态
```

**场景 2：Kafka Streams State Store**：

```java
// KTable 底层使用 compact topic
StreamsBuilder builder = new StreamsBuilder();
KTable<String, String> table = builder.table("user-state");

// 每个 Key 只保留最新值
// 重启后从 compact topic 恢复状态
```

### RocketMQ 为什么没有日志压缩？

**原因**：
1. **设计理念不同**：RocketMQ 定位于消息队列，而非状态存储
2. **消费模式**：消费完即可删除，无需长期保留
3. **实现复杂度**：日志压缩实现复杂，维护成本高

**替代方案**：
- 使用数据库或 Redis 存储状态
- 定期快照，清理旧消息

---

## 参考资料

1. [Kafka Log Retention](https://kafka.apache.org/documentation/#retention)
2. [Kafka Log Compaction](https://kafka.apache.org/documentation/#compaction)
3. [RocketMQ Store](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)
4. [RabbitMQ TTL](https://www.rabbitmq.com/ttl.html)
5. [RabbitMQ Lazy Queues](https://www.rabbitmq.com/lazy-queues.html)

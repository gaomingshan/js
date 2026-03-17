# 消息存储可靠性

## 概述

消息成功发送到 Broker 后，持久化存储是保证数据不丢失的关键。本章将深入探讨三大消息队列的刷盘策略、存储冗余机制以及存储故障恢复，确保消息在存储层面的可靠性。

---

## 1. Kafka 存储可靠性

### 1.1 刷盘机制

**Page Cache 机制**：

```
消息写入流程：
Producer → Broker
          ↓
    写入 Page Cache（内存）
          ↓
    立即返回 ACK（默认）
          ↓
    OS 异步刷盘（定时或内存满）
```

**刷盘配置**：

```properties
# Broker 配置
# 刷盘策略（默认依赖 OS）
log.flush.interval.messages=Long.MAX_VALUE  # 消息数阈值
log.flush.interval.ms=Long.MAX_VALUE        # 时间阈值

# 推荐：依赖 OS 异步刷盘 + 副本机制
# 不建议：强制同步刷盘（性能下降严重）
```

**可靠性保证**：

Kafka 不依赖强制刷盘，而是通过**副本机制**保证可靠性。

```properties
# Topic 配置
replication.factor=3        # 3 个副本
min.insync.replicas=2       # 至少 2 个副本确认

# Producer 配置
acks=all                    # 等待所有 ISR 确认

# 即使 Leader 宕机未刷盘，Follower 已有数据副本
```

### 1.2 副本同步保证

**ISR 机制**：

```
Leader 写入 → Follower 拉取 → Follower 写入 → 更新 HW

只有所有 ISR 副本都确认，Producer 才收到成功响应
```

**配置示例**：

```properties
# 副本落后时间阈值
replica.lag.time.max.ms=10000

# 不允许非 ISR 副本成为 Leader
unclean.leader.election.enable=false
```

---

## 2. RocketMQ 存储可靠性

### 2.1 刷盘策略

**异步刷盘（ASYNC_FLUSH，默认）**：

```properties
# broker.conf
flushDiskType=ASYNC_FLUSH

# 刷盘间隔（500ms）
flushCommitLogInterval=500

# 流程：
# 1. 消息写入内存 MappedFile
# 2. 立即返回成功
# 3. 后台线程定时刷盘
```

**同步刷盘（SYNC_FLUSH）**：

```properties
flushDiskType=SYNC_FLUSH

# 同步刷盘超时（5秒）
syncFlushTimeout=5000

# 流程：
# 1. 消息写入内存
# 2. 等待刷盘完成
# 3. 刷盘成功后返回
```

**对比**：

| 刷盘策略 | 性能 | 可靠性 | 适用场景 |
|---------|------|--------|---------|
| 异步刷盘 | 高（TPS 万级） | 中（断电丢失少量数据） | 普通业务 |
| 同步刷盘 | 低（TPS 千级） | 高（不丢失） | 金融业务 |

### 2.2 主从同步

**异步复制（ASYNC_MASTER）**：

```properties
brokerRole=ASYNC_MASTER

# 流程：
# Master 写入 → 返回成功 → 异步通知 Slave
```

**同步复制（SYNC_MASTER）**：

```properties
brokerRole=SYNC_MASTER
syncMasterFlushSlaveMaxTimeout=5000

# 流程：
# Master 写入 → 等待 Slave 确认 → 返回成功
```

**组合策略**：

| 刷盘策略 | 主从策略 | 可靠性 | 性能 | 说明 |
|---------|---------|--------|------|------|
| 异步刷盘 + 异步复制 | 最低 | 最高 | Master 断电可能丢失 |
| 异步刷盘 + 同步复制 | 高 | 中 | 推荐配置 |
| 同步刷盘 + 异步复制 | 高 | 中 | Master 不丢，Slave 可能丢 |
| 同步刷盘 + 同步复制 | 最高 | 最低 | 金融级配置 |

---

## 3. RabbitMQ 存储可靠性

### 3.1 持久化配置

**三重持久化**：

```java
// 1. 持久化 Exchange
channel.exchangeDeclare("my-exchange", "direct", true);

// 2. 持久化 Queue
channel.queueDeclare("my-queue", true, false, false, null);

// 3. 持久化消息
channel.basicPublish(
    "my-exchange",
    "routing-key",
    MessageProperties.PERSISTENT_TEXT_PLAIN,
    message.getBytes()
);
```

### 3.2 刷盘策略

**配置**：

```conf
# rabbitmq.conf
# 每隔 N 条消息刷盘一次（默认无限制，依赖 OS）
queue_index_embed_msgs_below = 4096
```

**仲裁队列（推荐）**：

仲裁队列基于 Raft，强制同步刷盘到多数派节点。

```java
Map<String, Object> args = new HashMap<>();
args.put("x-queue-type", "quorum");
channel.queueDeclare("quorum-queue", true, false, false, args);

// 特点：
// - 强一致性
// - 多数派确认后才返回
// - 数据不丢失
```

---

## 关键要点

1. **Kafka**：依赖副本机制而非强制刷盘保证可靠性
2. **RocketMQ**：同步刷盘 + 同步复制 = 金融级可靠性
3. **RabbitMQ**：仲裁队列提供强一致性保证
4. **性能权衡**：同步刷盘性能下降 50%-90%
5. **推荐配置**：异步刷盘 + 多副本 + 同步复制

---

## 参考资料

1. [Kafka Replication](https://kafka.apache.org/documentation/#replication)
2. [RocketMQ Store](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)
3. [RabbitMQ Persistence](https://www.rabbitmq.com/persistence-conf.html)

# 副本与数据同步

## 概述

副本机制是消息队列实现高可用和数据可靠性的核心。通过在多个节点上保存消息副本，即使部分节点故障，数据仍然可以访问。本章将深入探讨 Kafka、RocketMQ、RabbitMQ 的副本机制、数据同步策略、Leader 选举以及故障恢复流程。

---

## 1. 副本核心概念

### 1.1 什么是副本

**定义**：
- 副本（Replica）是分区/队列数据的完整拷贝
- 多个副本分布在不同的 Broker 上
- 一个 Leader 副本处理读写请求
- 多个 Follower 副本同步 Leader 数据

**副本的作用**：
1. **高可用**：Leader 故障时，Follower 可以接管
2. **数据冗余**：防止数据丢失
3. **读扩展**（部分场景）：Follower 可以提供读服务
4. **故障恢复**：快速恢复服务

**三大 MQ 的副本实现**：

| 特性 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 副本单位 | Partition Replica | Broker Master/Slave | Queue Mirror/Quorum |
| 默认副本数 | 1（需配置） | 1 Master + 0 Slave | 1（需配置） |
| 同步方式 | ISR 同步复制 | 同步/异步可配置 | 同步复制（镜像队列）、Raft（仲裁队列） |
| 自动故障转移 | ✅ 是 | ⚠️ DLedger 模式支持 | ✅ 是 |
| Follower 读 | ❌ 否（2.4+ 支持） | ✅ 可配置 | ❌ 否 |

---

## 2. Kafka 副本机制

### 2.1 ISR（In-Sync Replicas）

**ISR 定义**：
- ISR 是与 Leader 保持同步的副本集合
- 包括 Leader 自己和所有"跟得上"的 Follower
- 只有 ISR 中的副本才能被选为 Leader

**同步条件**：

副本需要同时满足以下条件才能留在 ISR 中：

1. **时间条件**：
```properties
# 副本落后时间不超过 10 秒
replica.lag.time.max.ms=10000
```
- Follower 在 10 秒内没有拉取消息 → 从 ISR 移除

2. **通信条件**：
- Follower 必须定期向 Leader 发送 Fetch 请求
- Leader 通过 Fetch 请求判断 Follower 是否存活

**ISR 变化流程**：

```
初始状态：
Partition 0, Leader: Broker 1, ISR: [1, 2, 3]

Broker 3 网络故障，超过 10 秒未拉取消息：
ISR: [1, 2, 3] → [1, 2]  (Broker 3 移除)

Broker 3 恢复，追上 Leader：
ISR: [1, 2] → [1, 2, 3]  (Broker 3 重新加入)
```

**查看 ISR 状态**：
```bash
bin/kafka-topics.sh --describe --topic my-topic --bootstrap-server localhost:9092

# 输出示例：
# Topic: my-topic	Partition: 0	Leader: 1	Replicas: 1,2,3	Isr: 1,2,3
# Topic: my-topic	Partition: 1	Leader: 2	Replicas: 2,3,1	Isr: 2,3,1
```

**关键配置**：

```properties
# Topic 级别配置
# 最小 ISR 副本数（Producer acks=all 时生效）
min.insync.replicas=2

# Broker 级别配置
# 副本落后时间阈值
replica.lag.time.max.ms=10000

# 是否允许非 ISR 副本被选为 Leader
unclean.leader.election.enable=false
```

### 2.2 数据同步流程

**生产者发送消息**：

```
Producer → Leader Broker
            ↓
        写入本地日志
            ↓
    返回 ACK（根据 acks 配置）
            ↓
        并行通知 Follower
            ↓
    Follower 拉取并写入日志
            ↓
        更新 High Watermark
```

**Follower 同步流程**：

```java
// Follower 定期发送 Fetch 请求
while (true) {
    FetchRequest request = new FetchRequest(
        partition,
        fetchOffset,  // 当前 Follower 的 offset
        maxBytes
    );
    
    FetchResponse response = leader.fetch(request);
    
    // 写入本地日志
    writeToLog(response.messages);
    
    // 更新 fetchOffset
    fetchOffset += response.messages.size();
    
    // 发送 ACK 给 Leader
    sendAck(fetchOffset);
}
```

**High Watermark（HW）**：

- **定义**：所有 ISR 副本都已同步的最大 offset
- **作用**：消费者只能读取到 HW 之前的消息
- **更新时机**：所有 ISR 副本都同步到某个 offset 时，HW 更新到该 offset

```
Leader Log:   [msg0, msg1, msg2, msg3, msg4, msg5]  ← LEO (Log End Offset) = 6
Follower 1:   [msg0, msg1, msg2, msg3, msg4]        ← LEO = 5
Follower 2:   [msg0, msg1, msg2, msg3]              ← LEO = 4

High Watermark = min(ISR LEO) = 4
消费者只能读取到 msg0-msg3
```

**Leader Epoch**：

Kafka 使用 Leader Epoch 防止日志截断导致的数据丢失。

```
场景：Leader 切换时的数据丢失

旧 Leader (Broker 1):  [msg0, msg1, msg2, msg3]  ← 崩溃前 HW=2
Follower (Broker 2):   [msg0, msg1]              ← 追赶中

Broker 1 崩溃，Broker 2 成为 Leader：
新 Leader (Broker 2):  [msg0, msg1, msg4, msg5]  ← 接受新消息

Broker 1 恢复后，发现自己的 msg2, msg3 不在新 Leader 中：
使用 Leader Epoch 判断：
- msg2, msg3 是旧 Epoch 的消息，需要截断
- 从新 Leader 同步 msg4, msg5

最终：[msg0, msg1, msg4, msg5]
```

### 2.3 Leader 选举

**触发条件**：
1. Leader Broker 宕机
2. Leader Partition 被删除
3. 手动触发（优先副本选举）

**选举流程**：

```
1. Controller 检测到 Leader 故障
   ↓
2. 从 ISR 中选择新 Leader
   ↓
3. 更新元数据（Zookeeper/KRaft）
   ↓
4. 通知所有 Broker 新 Leader 信息
   ↓
5. Producer/Consumer 连接到新 Leader
```

**选举规则**：

**1. 优先从 ISR 中选举**：
```properties
# 禁止非 ISR 副本成为 Leader
unclean.leader.election.enable=false

# 选举顺序：
# 1. ISR 中第一个副本（按 Replica ID 排序）
# 2. 如果 ISR 为空且 unclean.leader.election.enable=true，从所有副本中选择
```

**2. 优先副本（Preferred Replica）**：
```
Partition 0, Replicas: [1, 2, 3]
Preferred Replica: 1（第一个副本）

Leader: 2（当前 Leader）
      ↓ 优先副本选举
Leader: 1（恢复到 Preferred Replica）
```

**手动触发优先副本选举**：
```bash
bin/kafka-preferred-replica-election.sh \
  --bootstrap-server localhost:9092 \
  --path-to-json-file election.json

# election.json
{
  "partitions": [
    {"topic": "my-topic", "partition": 0}
  ]
}
```

**自动平衡**：
```properties
# 启用自动 Leader 平衡
auto.leader.rebalance.enable=true

# Leader 不平衡容忍度（10%）
leader.imbalance.per.broker.percentage=10

# 检查间隔（5 分钟）
leader.imbalance.check.interval.seconds=300
```

### 2.4 ACK 机制与可靠性

**Producer acks 配置**：

**acks=0（无确认）**：
```java
props.put("acks", "0");

// 流程：
// Producer → Leader
// Producer 不等待任何确认，立即返回

// 特点：
// - 最高性能
// - 可能丢失消息（Leader 写入前崩溃）
// - 适合日志收集等对可靠性要求不高的场景
```

**acks=1（Leader 确认）**：
```java
props.put("acks", "1");

// 流程：
// Producer → Leader
//            ↓ 写入本地日志
//            ↓ 返回 ACK
// Producer ← Leader

// 特点：
// - 较高性能
// - Leader 写入成功即返回
// - Leader 崩溃前未同步到 Follower 可能丢失
```

**acks=all / acks=-1（ISR 确认，推荐）**：
```java
props.put("acks", "all");  // 或 "acks", "-1"

// 流程：
// Producer → Leader
//            ↓ 写入本地日志
//            ↓ 等待 ISR 副本同步
//            ↓ 所有 ISR 副本确认
//            ↓ 返回 ACK
// Producer ← Leader

// 特点：
// - 最高可靠性
// - 性能较低（等待同步）
// - 需要配合 min.insync.replicas 使用
```

**min.insync.replicas 配置**：

```properties
# Topic 级别配置
min.insync.replicas=2

# 含义：
# - acks=all 时，至少 2 个副本（包括 Leader）确认才返回成功
# - ISR 副本数 < 2 时，Producer 发送失败

# 推荐配置：
# - 副本数：3
# - min.insync.replicas：2
# - acks：all
# 保证至少 2 个副本有数据，允许 1 个副本故障
```

**可靠性示例**：

```java
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("acks", "all");                      // 等待所有 ISR 确认
props.put("retries", 3);                       // 失败重试 3 次
props.put("max.in.flight.requests.per.connection", 1); // 保证顺序
props.put("enable.idempotence", true);         // 启用幂等性

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// Topic 配置
// min.insync.replicas=2
// replication.factor=3

// 保证：
// - 至少 2 个副本有数据
// - 消息不丢失、不重复、有序
```

---

## 3. RocketMQ 副本机制

### 3.1 主从模式

**架构**：
```
Master（主节点）
  ├── 处理读写请求
  ├── 持久化消息到 CommitLog
  └── 通知 Slave 同步数据

Slave（从节点）
  ├── 同步 Master 数据
  ├── 可选提供读服务
  └── Master 故障时手动切换
```

**主从配置**：

**Master 配置**（`conf/broker-a.properties`）：
```properties
brokerName=broker-a
brokerId=0                    # 0 表示 Master
brokerRole=ASYNC_MASTER       # 异步主节点
flushDiskType=ASYNC_FLUSH     # 异步刷盘

namesrvAddr=localhost:9876
listenPort=10911
storePathRootDir=/data/rocketmq/store
```

**Slave 配置**（`conf/broker-a-slave.properties`）：
```properties
brokerName=broker-a           # 主从名称必须相同
brokerId=1                    # 非 0 表示 Slave
brokerRole=SLAVE
flushDiskType=ASYNC_FLUSH

namesrvAddr=localhost:9876
listenPort=10911
storePathRootDir=/data/rocketmq/store-slave
```

### 3.2 数据同步策略

**异步复制（ASYNC_MASTER）**：

```
Producer → Master
            ↓ 写入 CommitLog
            ↓ 返回 ACK（不等待 Slave）
Producer ← Master
            ↓ 异步通知 Slave
         Slave ← 同步数据

特点：
- 高性能（不等待 Slave）
- Master 故障可能丢失少量数据
- 适合性能优先场景
```

**同步复制（SYNC_MASTER）**：

```
Producer → Master
            ↓ 写入 CommitLog
            ↓ 等待 Slave 同步
         Slave → 同步数据
         Slave → 返回 ACK
Master ← Slave
            ↓ 返回 ACK
Producer ← Master

特点：
- 高可靠性（至少 2 份数据）
- 性能下降 50%-70%
- 适合金融等高可靠性场景
```

**配置**：

```properties
# Master 配置
brokerRole=SYNC_MASTER           # 同步主节点

# 等待 Slave 确认超时（5 秒）
syncMasterFlushSlaveMaxTimeout=5000
```

**Slave 读负载均衡**：

```properties
# 允许 Slave 提供读服务
slaveReadEnable=true

# 主从读写分离比例（0-100）
# 当 Master 与 Slave 之间差距小于此值时，从 Slave 读取
accessMessageInMemoryMaxRatio=40
```

### 3.3 DLedger 模式（自动故障转移）

DLedger 基于 Raft 协议，实现自动 Leader 选举和故障转移。

**架构**：
```
Broker Group（DLedger）
  ├── Node 0（Leader）     ← 处理读写
  ├── Node 1（Follower）   ← 同步数据
  └── Node 2（Follower）   ← 同步数据

Leader 故障：
  ↓ 自动选举
Node 1 成为 Leader         ← 无需人工干预
```

**DLedger 配置**（`conf/dledger/broker-n0.properties`）：

```properties
brokerName=broker-dledger
brokerId=0

# 启用 DLedger
enableDLegerCommitLog=true

# DLedger 组名
dLegerGroup=broker-dledger

# DLedger 节点列表
dLegerPeers=n0-192.168.1.101:40911;n1-192.168.1.102:40911;n2-192.168.1.103:40911

# 当前节点 ID
dLegerSelfId=n0

# NameServer 地址
namesrvAddr=localhost:9876

# 存储路径
storePathRootDir=/data/rocketmq/dledger-store
```

**启动集群**：
```bash
# 节点 0
nohup sh bin/mqbroker -c conf/dledger/broker-n0.properties &

# 节点 1（修改 dLegerSelfId=n1）
nohup sh bin/mqbroker -c conf/dledger/broker-n1.properties &

# 节点 2（修改 dLegerSelfId=n2）
nohup sh bin/mqbroker -c conf/dledger/broker-n2.properties &
```

**Leader 选举**：

**Raft 协议选举流程**：
```
1. 初始状态：所有节点都是 Follower
   ↓
2. 超时后，节点变为 Candidate，发起投票
   ↓
3. 获得半数以上投票的节点成为 Leader
   ↓
4. Leader 定期发送心跳维持地位
   ↓
5. Leader 故障，重新选举
```

**查看 Leader**：
```bash
sh bin/mqadmin clusterList -n localhost:9876

# 输出示例：
# Broker Name: broker-dledger
# BID: 0, Address: 192.168.1.101:10911, Role: LEADER
# BID: 1, Address: 192.168.1.102:10911, Role: FOLLOWER
# BID: 2, Address: 192.168.1.103:10911, Role: FOLLOWER
```

**故障转移测试**：
```bash
# 停止当前 Leader（节点 0）
sh bin/mqshutdown broker

# 等待选举完成（约 10 秒）
sh bin/mqadmin clusterList -n localhost:9876

# 新 Leader 自动接管，无需人工干预
# BID: 1, Address: 192.168.1.102:10911, Role: LEADER
```

### 3.4 主从切换

**手动切换（主从模式）**：

```bash
# 步骤 1：停止 Master
sh bin/mqshutdown broker

# 步骤 2：修改 Slave 配置为 Master
vi conf/broker-a-slave.properties
# brokerId=0
# brokerRole=ASYNC_MASTER

# 步骤 3：重启节点
nohup sh bin/mqbroker -c conf/broker-a-slave.properties &
```

**自动切换（DLedger 模式）**：
- 无需人工干预
- 自动选举新 Leader
- 切换时间：约 10 秒

---

## 4. RabbitMQ 副本机制

### 4.1 仲裁队列（Quorum Queue，推荐）

RabbitMQ 3.8+ 引入基于 Raft 的仲裁队列，提供强一致性和高可用。

**创建仲裁队列**：

```java
Map<String, Object> args = new HashMap<>();
args.put("x-queue-type", "quorum");

channel.queueDeclare("my-quorum-queue",
    true,    // durable
    false,   // exclusive
    false,   // autoDelete
    args);
```

**特点**：
- 基于 Raft 协议
- 强一致性
- 自动故障转移
- 默认副本数 = 集群节点数（最多 5 个）

**副本分布**：
```bash
# 3 节点集群，创建仲裁队列
# 队列自动在 3 个节点上创建副本

sudo rabbitmqctl list_queues name type leader members

# 输出示例：
# my-quorum-queue  quorum  rabbit@node1  [rabbit@node1, rabbit@node2, rabbit@node3]
```

**Leader 选举**：
```
初始状态：
Leader: rabbit@node1
Followers: rabbit@node2, rabbit@node3

node1 故障：
   ↓ 自动选举（约 1 秒）
Leader: rabbit@node2
Followers: rabbit@node3

node1 恢复：
Leader: rabbit@node2
Followers: rabbit@node1, rabbit@node3
```

### 4.2 镜像队列（已废弃，3.8+ 不推荐）

镜像队列在多个节点上同步复制队列数据。

**创建镜像队列（通过策略）**：

```bash
sudo rabbitmqctl set_policy ha-all "^ha\." \
  '{"ha-mode":"all","ha-sync-mode":"automatic"}' \
  --priority 1 \
  --apply-to queues

# 策略说明：
# - 名称：ha-all
# - 匹配：队列名以 "ha." 开头
# - ha-mode: all（所有节点镜像）
# - ha-sync-mode: automatic（自动同步）
```

**ha-mode 选项**：

| 模式 | 说明 | 示例 |
|------|------|------|
| `all` | 所有节点镜像 | `{"ha-mode":"all"}` |
| `exactly` | 指定副本数 | `{"ha-mode":"exactly","ha-params":2}` |
| `nodes` | 指定节点 | `{"ha-mode":"nodes","ha-params":["rabbit@node1","rabbit@node2"]}` |

**同步模式**：

| 模式 | 说明 |
|------|------|
| `manual` | 手动同步（默认） |
| `automatic` | 自动同步新加入的镜像 |

**问题**：
- 性能开销大（同步复制）
- 网络分区问题
- 已被仲裁队列替代

---

## 5. 副本数规划与最佳实践

### 5.1 副本数规划

**Kafka 副本数**：

| 环境 | 副本数 | min.insync.replicas | 说明 |
|------|--------|---------------------|------|
| 开发 | 1 | 1 | 单副本，数据可能丢失 |
| 测试 | 2 | 1 | 允许 1 个副本故障 |
| 生产 | 3 | 2 | 允许 1 个副本故障，推荐 |
| 金融 | 5 | 3 | 允许 2 个副本故障 |

**RocketMQ 主从数**：

| 环境 | 配置 | 说明 |
|------|------|------|
| 开发 | 1 Master | 单节点 |
| 测试 | 1 Master + 1 Slave（异步） | 基本高可用 |
| 生产 | 1 Master + 1 Slave（同步） | 高可用，数据不丢失 |
| 生产 | DLedger（3 节点） | 自动故障转移，推荐 |

**RabbitMQ 副本数**：

| 环境 | 配置 | 说明 |
|------|------|------|
| 开发 | 单节点 | 无副本 |
| 测试 | 2 节点 + 仲裁队列 | 基本高可用 |
| 生产 | 3 节点 + 仲裁队列 | 推荐 |
| 金融 | 5 节点 + 仲裁队列 | 最高可用性 |

### 5.2 性能 vs 可靠性权衡

**高性能配置（Kafka）**：
```properties
# Producer
acks=1
retries=0
compression.type=lz4

# Topic
min.insync.replicas=1
unclean.leader.election.enable=true

# 特点：高性能，可能丢失数据
```

**高可靠性配置（Kafka）**：
```properties
# Producer
acks=all
retries=Integer.MAX_VALUE
enable.idempotence=true
max.in.flight.requests.per.connection=1

# Topic
min.insync.replicas=2
replication.factor=3
unclean.leader.election.enable=false

# 特点：数据不丢失，性能较低
```

### 5.3 故障恢复时间

**Kafka**：
- Leader 选举时间：< 1 秒（小集群）到 10 秒（大集群）
- 受分区数影响（分区越多，选举越慢）

**RocketMQ**：
- 主从模式：手动切换，分钟级
- DLedger 模式：自动选举，约 10 秒

**RabbitMQ**：
- 仲裁队列：自动选举，1-3 秒
- 镜像队列：自动切换，秒级

---

## 关键要点

1. **ISR 机制**（Kafka）：只有 ISR 副本才能被选为 Leader
2. **acks=all**：生产环境必须配置，保证数据不丢失
3. **min.insync.replicas**：配合 acks=all 使用，推荐值为 2
4. **DLedger 模式**（RocketMQ）：支持自动故障转移，推荐使用
5. **仲裁队列**（RabbitMQ）：基于 Raft，强一致性，3.8+ 推荐
6. **副本数规划**：生产环境推荐 3 副本，金融级 5 副本

---

## 深入一点

### Kafka 为什么不支持 Follower 读？

**原因**：
1. **一致性保证**：Follower 可能未同步最新数据，读取会不一致
2. **设计简化**：所有读写由 Leader 处理，简化实现
3. **性能考虑**：Kafka 通过分区并行提升性能，而非 Follower 读

**Kafka 2.4+ 支持 Follower Fetch**：
- 仅限于跨数据中心场景
- 消费者从最近的副本读取，降低跨 DC 流量
- 需要配置 `replica.selector.class`

**对比 RocketMQ**：
- RocketMQ 支持 Slave 读
- 适合读多写少场景
- 需要权衡一致性（Slave 可能有延迟）

### Raft vs Paxos

**Raft 特点**（RocketMQ DLedger、RabbitMQ Quorum Queue）：
- 易理解、易实现
- 强 Leader（所有写操作通过 Leader）
- 日志复制简单

**Paxos 特点**：
- 理论更通用
- 无强 Leader（任何节点可以提出提案）
- 实现复杂

**选择**：
- 工程实践：Raft 更流行（etcd、RocketMQ、RabbitMQ）
- 理论研究：Paxos 是基础

---

## 参考资料

1. [Kafka Replication](https://kafka.apache.org/documentation/#replication)
2. [RocketMQ DLedger](https://github.com/openmessaging/openmessaging-storage-dledger)
3. [RabbitMQ Quorum Queues](https://www.rabbitmq.com/quorum-queues.html)
4. [Raft Consensus Algorithm](https://raft.github.io/)
5. [Designing Data-Intensive Applications - Replication](https://dataintensive.net/)

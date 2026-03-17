# 存储模型与持久化

## 概述

存储模型是消息队列性能和可靠性的基石。三大消息队列采用了完全不同的存储策略：Kafka 的分段日志、RocketMQ 的三层存储、RabbitMQ 的内存优先策略。本章将深入探讨这些存储模型的设计原理、实现细节及性能优化技术。

---

## 1. Kafka 存储模型

### 1.1 分段日志（Segment Log）

Kafka 使用**分段日志**（Segment）作为存储单元，这是其高性能的核心设计。

**核心设计**：
- 每个 Partition 对应一个物理目录
- 消息按顺序追加写入日志文件（`.log`）
- 日志文件达到一定大小后，创建新的 Segment
- 每个 Segment 包含：数据文件、索引文件、时间索引文件

```
/var/kafka-logs/my-topic-0/
├── 00000000000000000000.log        # Segment 数据文件（消息）
├── 00000000000000000000.index      # offset 索引
├── 00000000000000000000.timeindex  # 时间索引
├── 00000000000000170410.log        # 下一个 Segment
├── 00000000000000170410.index
├── 00000000000000170410.timeindex
└── leader-epoch-checkpoint         # Leader epoch 记录
```

**文件命名规则**：
- 文件名为该 Segment 的起始 Offset
- `00000000000000170410.log` 表示从 Offset 170410 开始的消息

### 1.2 消息存储格式

Kafka 的消息在磁盘上按照紧凑的二进制格式存储。

**消息格式（Record Batch，V2）**：
```
Record Batch Header:
├── baseOffset: 8 bytes          (起始 offset)
├── batchLength: 4 bytes         (批次长度)
├── partitionLeaderEpoch: 4 bytes
├── magic: 1 byte                (版本号，当前为 2)
├── crc: 4 bytes                 (校验和)
├── attributes: 2 bytes          (压缩类型、时间戳类型等)
├── lastOffsetDelta: 4 bytes     (批次最后一条消息的 offset 增量)
├── firstTimestamp: 8 bytes      (批次第一条消息的时间戳)
├── maxTimestamp: 8 bytes        (批次最大时间戳)
├── producerId: 8 bytes          (生产者 ID，用于幂等性)
├── producerEpoch: 2 bytes
├── baseSequence: 4 bytes        (序列号，用于幂等性)
├── recordCount: 4 bytes         (批次消息数量)

Records:
├── Record 1
│   ├── length: varint
│   ├── attributes: 1 byte
│   ├── timestampDelta: varint   (相对于 firstTimestamp 的增量)
│   ├── offsetDelta: varint      (相对于 baseOffset 的增量)
│   ├── keyLength: varint
│   ├── key: byte[]
│   ├── valueLength: varint
│   ├── value: byte[]
│   └── headers: Header[]
├── Record 2
└── ...
```

**设计亮点**：
1. **批量存储**：多条消息打包成 Record Batch，减少元数据开销
2. **增量编码**：offset 和 timestamp 使用增量编码（varint），节省空间
3. **压缩支持**：整个 Batch 可以压缩（GZIP、Snappy、LZ4、ZSTD）
4. **CRC 校验**：保证数据完整性

### 1.3 索引机制

Kafka 使用**稀疏索引**加速消息查找。

**Offset 索引（.index）**：
- 存储 `<relative_offset, physical_position>` 映射
- 稀疏索引，每隔一定字节数（默认 4KB）建立一个索引项
- 二分查找定位 Offset

```
Index File Structure:
┌────────────────────────────────┐
│ relative_offset: 4 bytes       │
│ physical_position: 4 bytes     │  索引项 1
├────────────────────────────────┤
│ relative_offset: 4 bytes       │
│ physical_position: 4 bytes     │  索引项 2
├────────────────────────────────┤
│ ...                            │
└────────────────────────────────┘

示例：
相对 Offset 0    → 物理位置 0
相对 Offset 1024 → 物理位置 512000
相对 Offset 2048 → 物理位置 1024000
```

**查找流程**：
1. 根据 Offset 找到对应的 Segment（文件名二分查找）
2. 在 Segment 的 Index 文件中二分查找最近的索引项
3. 从索引项的物理位置开始顺序扫描

**时间索引（.timeindex）**：
- 存储 `<timestamp, relative_offset>` 映射
- 支持按时间查询消息

```java
// 按时间查询消息
Map<TopicPartition, Long> timestampsToSearch = new HashMap<>();
timestampsToSearch.put(new TopicPartition("my-topic", 0), 
                      System.currentTimeMillis() - 3600000); // 1小时前

Map<TopicPartition, OffsetAndTimestamp> result = 
    consumer.offsetsForTimes(timestampsToSearch);

for (Map.Entry<TopicPartition, OffsetAndTimestamp> entry : result.entrySet()) {
    consumer.seek(entry.getKey(), entry.getValue().offset());
}
```

### 1.4 顺序写与零拷贝

**顺序写优化**：
- 所有消息顺序追加到日志文件末尾
- 避免随机写，充分利用磁盘顺序写性能
- 顺序写性能可达 600MB/s，接近内存写入

**零拷贝（Zero Copy）**：
- 使用 `sendfile` 系统调用
- 数据从磁盘 → 页缓存 → 网络，无需经过用户空间
- 减少 4 次上下文切换和 4 次数据拷贝

```
传统拷贝：
磁盘 → 内核缓冲区 → 用户缓冲区 → Socket 缓冲区 → 网卡
      (DMA拷贝)    (CPU拷贝)      (CPU拷贝)      (DMA拷贝)

零拷贝（sendfile）：
磁盘 → 内核缓冲区 → 网卡
      (DMA拷贝)    (DMA拷贝)
```

**Java 实现**：
```java
// Kafka 底层使用 FileChannel.transferTo
FileChannel fileChannel = new FileInputStream(file).getChannel();
long position = 0;
long count = fileChannel.size();
long transferred = fileChannel.transferTo(position, count, socketChannel);
```

### 1.5 页缓存（Page Cache）

Kafka 不维护内存缓存，完全依赖操作系统的页缓存。

**优势**：
1. **简化设计**：无需管理缓存失效、淘汰策略
2. **利用系统优化**：操作系统的页缓存高度优化
3. **避免 GC**：不占用 JVM 堆内存，减少 GC 压力
4. **重启快速恢复**：页缓存由操作系统管理，重启后自动预热

**写入流程**：
```
Producer → Kafka Broker → Page Cache → 磁盘
                           ↓
                        Consumer（从 Page Cache 读取，无磁盘 IO）
```

**刷盘策略**：
- **异步刷盘**（默认）：依赖操作系统刷盘，性能高
- **同步刷盘**：每条消息强制刷盘，可靠性高但性能低

```properties
# Kafka 配置
# 每隔多少条消息刷盘（0 表示禁用）
log.flush.interval.messages=10000

# 每隔多久刷盘（ms）
log.flush.interval.ms=1000

# 推荐：依赖副本机制保证可靠性，而非同步刷盘
# 设置为 Long.MAX_VALUE（禁用同步刷盘）
```

---

## 2. RocketMQ 存储模型

### 2.1 三层存储架构

RocketMQ 采用**三层存储**架构，分离消息存储和消费索引。

```
存储层次：
┌─────────────────────────────────────┐
│ CommitLog（消息存储）                │ ← 所有 Topic 混合存储
│ - 顺序写入                          │
│ - 单个文件 1GB                      │
└─────────────────────────────────────┘
            ↓ 异步构建索引
┌─────────────────────────────────────┐
│ ConsumeQueue（消费队列索引）         │ ← 每个 Topic-Queue 一个文件
│ - 存储消息在 CommitLog 的位置       │
│ - 每条索引 20 字节                  │
└─────────────────────────────────────┘
            ↓ 异步构建索引（可选）
┌─────────────────────────────────────┐
│ IndexFile（消息索引）                │ ← 按 Key 查询消息
│ - Hash 索引                         │
│ - 可选功能                          │
└─────────────────────────────────────┘
```

### 2.2 CommitLog（消息存储）

**核心设计**：
- 所有 Topic 的消息混合存储在同一个 CommitLog 文件
- 顺序写入，性能高
- 单个文件默认 1GB（可配置）

```
/store/commitlog/
├── 00000000000000000000  (第 1 个文件，0-1GB)
├── 00000000001073741824  (第 2 个文件，1GB-2GB)
└── 00000000002147483648  (第 3 个文件，2GB-3GB)
```

**消息格式**：
```
Message Structure:
├── totalSize: 4 bytes           (消息总长度)
├── magicCode: 4 bytes           (魔数，0xdaa320a7)
├── bodyCRC: 4 bytes             (消息体 CRC)
├── queueId: 4 bytes             (Queue ID)
├── flag: 4 bytes                (消息标志)
├── queueOffset: 8 bytes         (消息在 Queue 中的逻辑 offset)
├── physicalOffset: 8 bytes      (消息在 CommitLog 中的物理 offset)
├── sysFlag: 4 bytes             (系统标志)
├── bornTimestamp: 8 bytes       (消息生成时间戳)
├── bornHost: 8 bytes            (生产者地址)
├── storeTimestamp: 8 bytes      (消息存储时间戳)
├── storeHost: 8 bytes           (Broker 地址)
├── reconsumeTimes: 4 bytes      (重试次数)
├── preparedTransactionOffset: 8 bytes (事务消息使用)
├── bodyLength: 4 bytes          (消息体长度)
├── body: byte[]                 (消息体)
├── topicLength: 1 byte          (Topic 长度)
├── topic: byte[]                (Topic 名称)
├── propertiesLength: 2 bytes    (属性长度)
└── properties: byte[]           (消息属性，如 Key、Tag 等)
```

### 2.3 ConsumeQueue（消费队列索引）

**核心设计**：
- 每个 Topic 的每个 Queue 对应一个 ConsumeQueue 文件
- 存储消息在 CommitLog 中的位置
- 轻量级索引，加速消费

```
/store/consumequeue/
├── TopicA/
│   ├── 0/  (Queue 0)
│   │   ├── 00000000000000000000
│   │   └── 00000000000005898240
│   ├── 1/  (Queue 1)
│   └── 2/  (Queue 2)
└── TopicB/
    └── 0/
```

**索引格式**：
```
ConsumeQueue Entry (20 bytes):
├── commitLogOffset: 8 bytes   (消息在 CommitLog 的物理位置)
├── size: 4 bytes              (消息大小)
└── tagsCode: 8 bytes          (Tag 的 Hash 值，用于过滤)
```

**查找流程**：
1. 消费者从 ConsumeQueue 读取索引（20 字节）
2. 根据 commitLogOffset 从 CommitLog 读取完整消息
3. 如果启用 Tag 过滤，先比对 tagsCode

### 2.4 IndexFile（消息索引）

**核心设计**：
- 支持按 Message Key 查询消息
- Hash 索引结构
- 可选功能，默认启用

```
IndexFile Structure:
├── Header (40 bytes)
│   ├── beginTimestamp: 8 bytes
│   ├── endTimestamp: 8 bytes
│   ├── beginPhyoffset: 8 bytes
│   ├── endPhyoffset: 8 bytes
│   ├── hashSlotCount: 4 bytes
│   └── indexCount: 4 bytes
├── Hash Slots (500万个，每个 4 bytes)
│   ├── Slot 0: 索引项位置
│   ├── Slot 1: 索引项位置
│   └── ...
└── Index Entries
    ├── Entry 1
    │   ├── keyHash: 4 bytes
    │   ├── phyOffset: 8 bytes
    │   ├── timeDiff: 4 bytes
    │   └── nextIndexOffset: 4 bytes (链表，解决 Hash 冲突)
    └── ...
```

**查询示例**：
```java
// 按 Key 查询消息
QueryMessageResult result = defaultMQAdminExt.queryMessage(
    "TopicTest", 
    "order-12345",  // Message Key
    32,             // 最大返回数量
    0,              // 起始时间
    System.currentTimeMillis());

for (MessageExt msg : result.getMessageList()) {
    System.out.println(new String(msg.getBody()));
}
```

### 2.5 存储流程与刷盘策略

**写入流程**：
```
Producer → Broker → CommitLog (顺序写)
                        ↓
                    Page Cache
                        ↓ 异步刷盘/同步刷盘
                      磁盘
                        ↓ 异步构建索引
                ConsumeQueue + IndexFile
```

**刷盘策略**：

**1. 异步刷盘（默认）**：
```properties
# broker.conf
flushDiskType=ASYNC_FLUSH
```
- 消息写入 Page Cache 后立即返回
- 后台线程定时刷盘（默认 500ms）
- 性能高，但可能丢失少量数据（宕机时）

**2. 同步刷盘**：
```properties
flushDiskType=SYNC_FLUSH
```
- 消息刷盘后才返回成功
- 可靠性高，但性能下降 50%-70%

**刷盘配置**：
```properties
# 异步刷盘间隔（ms）
flushCommitLogInterval=500

# 每次刷盘至少写入的页数（默认 4，即 16KB）
flushCommitLogLeastPages=4

# 同步刷盘超时时间（ms）
syncFlushTimeout=5000
```

---

## 3. RabbitMQ 存储模型

### 3.1 内存优先策略

RabbitMQ 优先将消息存储在内存中，持久化消息才会写入磁盘。

**核心设计**：
- 消息优先存储在内存（Erlang 进程堆）
- 持久化消息异步写入磁盘
- 内存不足时，消息分页到磁盘（Paging）

```
消息流转：
┌──────────────────────────────────┐
│ 内存队列（非持久化消息）          │ ← 快速读写
└──────────────────────────────────┘
           ↓ 持久化消息
┌──────────────────────────────────┐
│ 内存 + 磁盘队列（持久化消息）     │
│ - 消息索引在内存                 │
│ - 消息体可能在磁盘               │
└──────────────────────────────────┘
           ↓ 内存压力
┌──────────────────────────────────┐
│ 磁盘队列（Paging）                │ ← 内存不足时分页
└──────────────────────────────────┘
```

### 3.2 持久化机制

**三重持久化**：

**1. Queue 持久化**：
```java
// 声明持久化队列
channel.queueDeclare(
    "my-queue",
    true,   // durable: 队列持久化
    false,  // exclusive
    false,  // autoDelete
    null);
```

**2. Exchange 持久化**：
```java
// 声明持久化 Exchange
channel.exchangeDeclare(
    "my-exchange",
    "direct",
    true,   // durable: Exchange 持久化
    false,  // autoDelete
    null);
```

**3. Message 持久化**：
```java
// 发送持久化消息
channel.basicPublish(
    "my-exchange",
    "routing-key",
    MessageProperties.PERSISTENT_TEXT_PLAIN, // 持久化
    "Hello".getBytes());

// 或自定义属性
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .deliveryMode(2) // 1=非持久化, 2=持久化
    .build();
channel.basicPublish("", "my-queue", props, message.getBytes());
```

**注意**：
- 必须同时持久化 Queue、Exchange、Message，消息才能在 Broker 重启后恢复
- 持久化会降低性能（约 10 倍）

### 3.3 消息分页（Paging）

**触发条件**：
- 内存占用超过阈值（默认 40%）
- 消息堆积导致内存压力

**分页机制**：
```
内存队列状态：
┌────────────────────────────────────┐
│ Message 1 (index + body in memory) │
│ Message 2 (index + body in memory) │
│ Message 3 (index + body in memory) │
│ ...                                │
└────────────────────────────────────┘
         ↓ 内存压力，触发分页
┌────────────────────────────────────┐
│ Message 1 (index in memory, body on disk) │
│ Message 2 (index in memory, body on disk) │
│ Message 3 (index + body in memory)        │
│ ...                                        │
└────────────────────────────────────┘
```

**性能影响**：
- 分页后读取消息需要磁盘 IO，性能下降
- 大量分页可能导致"死亡螺旋"（消费慢 → 堆积 → 分页 → 更慢）

**配置调优**：
```conf
# rabbitmq.conf
# 内存阈值（相对于总内存）
vm_memory_high_watermark.relative = 0.4

# 内存阈值（绝对值）
vm_memory_high_watermark.absolute = 2GB

# 分页阈值（队列消息数量）
vm_memory_high_watermark_paging_ratio = 0.5
```

### 3.4 存储文件结构

RabbitMQ 使用 **Mnesia**（Erlang 分布式数据库）存储元数据，使用**消息存储（Message Store）**存储消息。

```
/var/lib/rabbitmq/mnesia/
├── rabbit@hostname/
│   ├── msg_store_persistent/    (持久化消息)
│   │   ├── 0.rdq                (消息文件)
│   │   ├── 1.rdq
│   │   └── file_summary.ets     (文件索引)
│   ├── msg_store_transient/     (非持久化消息，内存优先)
│   ├── queues/                  (队列元数据)
│   └── schema.DAT               (集群元数据)
```

---

## 4. 三大消息队列存储对比

### 4.1 核心差异表

| 特性 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 存储策略 | 全部持久化 | 全部持久化 | 可选持久化 |
| 存储结构 | 分段日志（Segment） | 三层存储（CommitLog+ConsumeQueue+Index） | 内存 + 磁盘 |
| 写入方式 | 顺序写 | 顺序写 | 随机写 |
| 索引机制 | Offset + Time 稀疏索引 | ConsumeQueue 密集索引 + IndexFile Hash 索引 | 无（内存队列） |
| 零拷贝 | ✅ sendfile | ✅ mmap | ❌ |
| 页缓存 | ✅ 完全依赖 | ✅ 充分利用 | ❌ 自管理内存 |
| 刷盘策略 | 异步刷盘（默认） | 异步/同步可配置 | 异步刷盘 |
| 消息堆积能力 | 千亿级（受磁盘限制） | 百亿级（受磁盘限制） | 受内存限制 |

### 4.2 性能对比

**写入性能**（单机，1KB 消息）：
- **Kafka**：60万 TPS（3副本，异步刷盘）
- **RocketMQ**：10万 TPS（异步刷盘），5万 TPS（同步刷盘）
- **RabbitMQ**：5000 TPS（持久化），5万 TPS（非持久化）

**读取性能**：
- **Kafka**：从页缓存读取，零拷贝，性能接近内存
- **RocketMQ**：从页缓存读取，mmap，性能接近内存
- **RabbitMQ**：内存读取快，分页后性能下降

**堆积能力**：
- **Kafka**：千亿级消息（TB 级磁盘）
- **RocketMQ**：百亿级消息（TB 级磁盘）
- **RabbitMQ**：百万到千万级（GB 级内存）

### 4.3 可靠性对比

**消息丢失风险**：

**Kafka**：
- 风险：异步刷盘 + 单副本 Leader 宕机
- 防护：多副本 + `acks=all` + `min.insync.replicas=2`

**RocketMQ**：
- 风险：异步刷盘 + 主节点宕机
- 防护：同步刷盘 + 同步复制 + DLedger 自动切换

**RabbitMQ**：
- 风险：非持久化消息 + Broker 宕机
- 防护：持久化 + 镜像队列 + 发布确认

---

## 关键要点

1. **Kafka**：分段日志 + 顺序写 + 零拷贝 + 页缓存，性能最高
2. **RocketMQ**：三层存储，分离消息存储和索引，支持按 Key 查询
3. **RabbitMQ**：内存优先，持久化可选，低延迟但堆积能力弱
4. **顺序写**：Kafka 和 RocketMQ 都采用顺序写，性能接近内存
5. **索引机制**：Kafka 稀疏索引、RocketMQ 密集索引、RabbitMQ 无索引
6. **刷盘策略**：异步刷盘高性能，同步刷盘高可靠，需权衡

---

## 深入一点

### 为什么 Kafka 不需要内存缓存？

**传统消息队列设计**：
```
消息 → 内存缓存 → 磁盘持久化
       ↓ 消费
    Consumer
```
- 需要管理缓存淘汰、失效策略
- 占用 JVM 堆内存，增加 GC 压力
- Broker 重启后缓存失效，性能下降

**Kafka 设计**：
```
消息 → Page Cache → 磁盘
       ↓ 消费（从 Page Cache）
    Consumer
```
- 完全依赖操作系统页缓存
- 无需管理缓存，简化设计
- 不占用 JVM 堆，减少 GC
- Broker 重启后，页缓存由操作系统管理，自动预热

**为什么页缓存够用**？
1. **顺序读写**：页缓存对顺序 IO 优化极好
2. **预读**：操作系统自动预读后续数据
3. **写合并**：多次小写合并成大写
4. **容量大**：现代服务器内存达 128GB+，页缓存充足

### RocketMQ 为什么采用 CommitLog + ConsumeQueue？

**纯 CommitLog 的问题**（Kafka 模式）：
- 多个 Topic 混合存储时，消费某个 Topic 需要扫描整个 CommitLog
- 性能下降

**CommitLog + ConsumeQueue 的优势**：
- CommitLog：所有 Topic 混合存储，顺序写，性能高
- ConsumeQueue：每个 Topic-Queue 独立索引，消费时只读索引，性能高
- 兼顾写入性能和消费性能

**对比**：
```
Kafka（每个 Topic 独立日志）：
├── TopicA-0.log
├── TopicA-1.log
├── TopicB-0.log
└── TopicB-1.log
写入：多个文件，可能随机写
消费：顺序读单个文件

RocketMQ（混合存储 + 索引）：
├── CommitLog（所有 Topic 混合）
└── ConsumeQueue（每个 Topic-Queue 独立索引）
写入：单个文件，顺序写
消费：读索引 + 读 CommitLog
```

---

## 参考资料

1. [Kafka 官方文档 - Log](https://kafka.apache.org/documentation/#log)
2. [RocketMQ 设计文档 - Store](https://rocketmq.apache.org/zh/docs/deploymentOperations/01deploy)
3. [RabbitMQ 官方文档 - Persistence](https://www.rabbitmq.com/persistence-conf.html)
4. [The Log: What every software engineer should know about real-time data's unifying abstraction](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)
5. 《Kafka 权威指南》- Chapter 5: The Kafka Storage Internals
6. [RocketMQ 技术内幕](https://github.com/apache/rocketmq/tree/develop/docs/cn)

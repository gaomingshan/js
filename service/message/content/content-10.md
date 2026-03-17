# 分区机制

## 概述

分区（Partition）是消息队列实现高吞吐量和水平扩展的核心机制。通过将 Topic 划分为多个分区，消息队列可以并行处理、负载均衡并提供更好的容错能力。本章将深入探讨 Kafka、RocketMQ 的分区机制，包括分区策略、分区分配、负载均衡以及动态扩容等核心内容。

---

## 1. 分区核心概念

### 1.1 什么是分区

**定义**：
- 分区是 Topic 的物理分片
- 每个分区是一个有序的消息队列
- 同一分区内消息严格有序
- 不同分区之间并行处理

**分区的作用**：
1. **并行处理**：多个分区并行读写，提升吞吐量
2. **水平扩展**：增加分区数提升并发度
3. **负载均衡**：消息均匀分布到各分区
4. **容错能力**：分区独立，单个分区故障不影响其他分区

**三大 MQ 的分区实现**：

| 特性 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 分区单元 | Partition | MessageQueue | 无（可用分片队列插件） |
| 默认数量 | 需指定 | 4 读队列 + 4 写队列 | 1 Queue = 1 单元 |
| 扩展性 | 只能增加 | 可动态调整 | 创建新 Queue |
| 顺序保证 | 分区内有序 | Queue 内有序 | Queue 内有序 |

---

## 2. Kafka 分区机制

### 2.1 分区分配策略

生产者决定消息发送到哪个分区，Kafka 提供多种分区策略。

**1. 轮询策略（Round Robin，默认）**

消息依次发送到各个分区，实现负载均衡。

```java
// 未指定 Key 时使用轮询
ProducerRecord<String, String> record = new ProducerRecord<>(
    "my-topic",
    null,        // key = null，使用轮询
    "message"
);

producer.send(record);

// 发送流程：
// msg1 → Partition 0
// msg2 → Partition 1
// msg3 → Partition 2
// msg4 → Partition 0
// ...
```

**优点**：
- 消息均匀分布
- 简单高效

**缺点**：
- 无法保证顺序（消息分散在不同分区）

**2. Key Hash 策略（默认，Key 不为空时）**

根据 Key 的哈希值决定分区，相同 Key 的消息发送到同一分区。

```java
// 指定 Key
ProducerRecord<String, String> record = new ProducerRecord<>(
    "my-topic",
    "user-123",  // key
    "message"
);

producer.send(record);

// 分区计算：
// partition = hash(key) % numPartitions
// partition = hash("user-123") % 3 = 1
// 所有 user-123 的消息都发送到 Partition 1
```

**优点**：
- 相同 Key 的消息有序
- 适合需要顺序处理的场景

**缺点**：
- Key 分布不均可能导致热点分区

**3. 指定分区策略**

手动指定消息发送到哪个分区。

```java
// 指定 Partition
ProducerRecord<String, String> record = new ProducerRecord<>(
    "my-topic",
    2,           // partition
    "user-123",  // key
    "message"
);

producer.send(record);
```

**4. 自定义分区器**

实现 `Partitioner` 接口自定义分区逻辑。

```java
public class VIPPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                        Object value, byte[] valueBytes, Cluster cluster) {
        String keyStr = (String) key;
        
        // VIP 用户发送到 Partition 0（专用分区）
        if (keyStr.startsWith("vip-")) {
            return 0;
        }
        
        // 普通用户哈希分配到其他分区
        int numPartitions = cluster.partitionCountForTopic(topic);
        return Math.abs(keyStr.hashCode()) % (numPartitions - 1) + 1;
    }
    
    @Override
    public void close() {}
    
    @Override
    public void configure(Map<String, ?> configs) {}
}

// 使用自定义分区器
Properties props = new Properties();
props.put("partitioner.class", "com.example.VIPPartitioner");
KafkaProducer<String, String> producer = new KafkaProducer<>(props);
```

**自定义分区器场景**：
- 业务优先级分区（VIP 用户专用分区）
- 地域分区（按地域路由）
- 时间分区（按时间段路由）
- 负载均衡（自定义负载算法）

### 2.2 消费者分区分配

消费者组内的消费者会自动分配分区，Kafka 提供多种分配策略。

**1. Range 策略（默认）**

按范围分配，每个消费者分配连续的分区。

```
Topic: my-topic (7 Partitions)
Consumer Group: 3 Consumers

分配结果：
Consumer 1: Partition 0, 1, 2   (7/3 = 2 余 1，多分配 1 个)
Consumer 2: Partition 3, 4
Consumer 3: Partition 5, 6

特点：
- 简单直观
- 可能导致分配不均（第一个消费者多分配）
- 多个 Topic 时容易导致倾斜
```

**2. RoundRobin 策略**

轮询分配所有分区。

```
Topic: my-topic (7 Partitions)
Consumer Group: 3 Consumers

分配结果：
Consumer 1: Partition 0, 3, 6
Consumer 2: Partition 1, 4
Consumer 3: Partition 2, 5

特点：
- 分配更均匀
- 跨 Topic 也能均匀分配
```

**3. Sticky 策略**

尽量保持原有分配，减少重平衡时的分区迁移。

```
初始分配：
Consumer 1: Partition 0, 1, 2
Consumer 2: Partition 3, 4
Consumer 3: Partition 5, 6

Consumer 2 下线后（Sticky 策略）：
Consumer 1: Partition 0, 1, 2, 3    (新增 Partition 3)
Consumer 3: Partition 5, 6, 4       (新增 Partition 4)

如果是 Range 策略，会重新分配：
Consumer 1: Partition 0, 1, 2, 3
Consumer 3: Partition 4, 5, 6
→ Partition 4, 5, 6 都需要从 Consumer 1 迁移到 Consumer 3
```

**特点**：
- 减少分区迁移，降低重平衡开销
- 减少消息重复消费
- Kafka 2.4+ 推荐使用

**4. CooperativeSticky 策略（Kafka 2.4+）**

增量重平衡，不停止所有消费者。

```
传统重平衡（Stop-the-World）：
1. 停止所有消费者
2. 重新分配分区
3. 恢复消费
→ 期间所有消费停止

增量重平衡：
1. 只停止需要迁移的分区
2. 其他分区继续消费
3. 迁移完成后恢复
→ 大部分消费者不受影响
```

**配置分区分配策略**：

```java
Properties props = new Properties();

// 单一策略
props.put("partition.assignment.strategy", 
    "org.apache.kafka.clients.consumer.RoundRobinAssignor");

// 多策略（按优先级尝试）
props.put("partition.assignment.strategy", 
    "org.apache.kafka.clients.consumer.CooperativeStickyAssignor," +
    "org.apache.kafka.clients.consumer.StickyAssignor," +
    "org.apache.kafka.clients.consumer.RangeAssignor");
```

### 2.3 分区数量规划

**计算公式**：

```
分区数 = max(
    目标生产吞吐量 / 单分区生产吞吐量,
    目标消费吞吐量 / 单分区消费吞吐量
)
```

**性能测试**：

**测试单分区生产吞吐量**：
```bash
bin/kafka-producer-perf-test.sh \
  --topic test-topic \
  --num-records 1000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props bootstrap.servers=localhost:9092

# 输出示例：
# 50000 records sent, 10000.0 records/sec (9.77 MB/sec)
# → 单分区生产吞吐量：10 MB/sec
```

**测试单分区消费吞吐量**：
```bash
bin/kafka-consumer-perf-test.sh \
  --topic test-topic \
  --messages 1000000 \
  --threads 1 \
  --bootstrap-server localhost:9092

# 输出示例：
# data.consumed.in.MB: 976.5625
# MB.sec: 48.8281
# → 单分区消费吞吐量：50 MB/sec
```

**示例计算**：
```
业务需求：
- 目标生产吞吐量：100 MB/s
- 目标消费吞吐量：80 MB/s

性能测试结果：
- 单分区生产吞吐量：10 MB/s
- 单分区消费吞吐量：20 MB/s

分区数计算：
- 按生产：100 / 10 = 10 个分区
- 按消费：80 / 20 = 4 个分区
- 取最大值：max(10, 4) = 10 个分区

最终分区数：10-12 个分区（预留余量）
```

**分区数限制**：

**过少的问题**：
- 并发度低，无法充分利用集群资源
- 单分区成为瓶颈
- 消费者数量受限（不能超过分区数）

**过多的问题**：
- Zookeeper 负载增加
- Leader 选举时间增长
- 文件句柄数增加
- 端到端延迟增加

**推荐值**：
- 单 Broker：< 4000 个分区
- 单集群：< 20000 个分区
- 单 Topic：< 100 个分区

### 2.4 动态扩容分区

**增加分区数**：

```bash
bin/kafka-topics.sh --alter \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 12

# 注意：
# 1. 分区只能增加，不能减少
# 2. 已有消息不会重新分配
# 3. 新消息会分布到所有分区（包括新增分区）
```

**影响分析**：

**对生产者的影响**：
```java
// 扩容前：6 个分区
hash("user-123") % 6 = 3  → Partition 3

// 扩容后：12 个分区
hash("user-123") % 12 = 9  → Partition 9

// 影响：
// - 相同 Key 的新消息进入不同分区
// - 顺序被打破
```

**解决方案**：
1. **自定义分区器**：保持老 Key 的分区不变
2. **迁移数据**：创建新 Topic，迁移所有数据
3. **接受乱序**：如果业务允许

**对消费者的影响**：
```
扩容前：
6 个分区，3 个消费者
Consumer 1: Partition 0, 1
Consumer 2: Partition 2, 3
Consumer 3: Partition 4, 5

扩容后：
12 个分区，3 个消费者 → 触发重平衡
Consumer 1: Partition 0, 1, 2, 3
Consumer 2: Partition 4, 5, 6, 7
Consumer 3: Partition 8, 9, 10, 11

影响：
- 触发重平衡，短暂停止消费
- 可能重复消费（重平衡期间未提交的消息）
```

**最佳实践**：
- 初期合理规划分区数，避免频繁扩容
- 扩容时选择低峰期
- 使用 Sticky 或 CooperativeSticky 策略减少影响
- 监控重平衡次数和时间

---

## 3. RocketMQ 分区机制（MessageQueue）

### 3.1 MessageQueue 概念

RocketMQ 的 MessageQueue 类似 Kafka 的 Partition。

**核心特性**：
- 一个 Topic 包含多个 MessageQueue
- 默认每个 Broker 创建 4 个读队列 + 4 个写队列
- 读队列数和写队列数可以不同（用于平滑扩缩容）

**Queue 命名**：
```
Topic: MyTopic
Broker: broker-a

MessageQueue:
MyTopic@broker-a#0
MyTopic@broker-a#1
MyTopic@broker-a#2
MyTopic@broker-a#3
```

### 3.2 消息发送到 Queue

**1. 默认策略（轮询）**

```java
DefaultMQProducer producer = new DefaultMQProducer("producer-group");
producer.start();

Message msg = new Message("MyTopic", "TagA", "Hello".getBytes());
SendResult result = producer.send(msg);

// 默认轮询发送到各个 Queue
// msg1 → Queue 0
// msg2 → Queue 1
// msg3 → Queue 2
// msg4 → Queue 3
// msg5 → Queue 0
// ...
```

**2. 选择指定 Queue**

```java
// 使用 MessageQueueSelector
Message msg = new Message("MyTopic", "TagA", "Hello".getBytes());

SendResult result = producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        // arg 是传入的参数（如订单 ID）
        String orderId = (String) arg;
        
        // 根据订单 ID 选择 Queue，保证同一订单的消息有序
        int index = Math.abs(orderId.hashCode()) % mqs.size();
        return mqs.get(index);
    }
}, "order-123");  // 传入订单 ID

// 所有 order-123 的消息都发送到同一个 Queue
```

**3. 自定义 Queue 选择器**

```java
public class VIPQueueSelector implements MessageQueueSelector {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        String tag = msg.getTags();
        
        // VIP 消息发送到第一个 Queue
        if ("VIP".equals(tag)) {
            return mqs.get(0);
        }
        
        // 普通消息轮询发送到其他 Queue
        int index = Math.abs(msg.hashCode()) % (mqs.size() - 1) + 1;
        return mqs.get(index);
    }
}

// 使用自定义选择器
SendResult result = producer.send(msg, new VIPQueueSelector(), null);
```

### 3.3 消费者 Queue 分配

**分配策略**：

**1. 平均分配（AllocateMessageQueueAveragely，默认）**

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group");
consumer.setAllocateMessageQueueStrategy(new AllocateMessageQueueAveragely());

// 示例：
// 8 个 Queue，3 个消费者
// Consumer 1: Queue 0, 1, 2
// Consumer 2: Queue 3, 4, 5
// Consumer 3: Queue 6, 7
```

**2. 环形分配（AllocateMessageQueueAveragelyByCircle）**

```java
consumer.setAllocateMessageQueueStrategy(new AllocateMessageQueueAveragelyByCircle());

// 示例：
// 8 个 Queue，3 个消费者
// Consumer 1: Queue 0, 3, 6
// Consumer 2: Queue 1, 4, 7
// Consumer 3: Queue 2, 5
```

**3. 机房就近（AllocateMessageQueueByMachineRoom）**

```java
consumer.setAllocateMessageQueueStrategy(new AllocateMessageQueueByMachineRoom());

// 优先分配同机房的 Queue，降低网络延迟
```

**4. 一致性哈希（AllocateMessageQueueConsistentHash）**

```java
consumer.setAllocateMessageQueueStrategy(new AllocateMessageQueueConsistentHash());

// 使用一致性哈希算法，减少重平衡时的 Queue 迁移
```

**5. 配置分配（AllocateMessageQueueByConfig）**

```java
consumer.setAllocateMessageQueueStrategy(new AllocateMessageQueueByConfig());

// 手动指定消费者与 Queue 的对应关系
```

### 3.4 读写队列动态调整

RocketMQ 支持独立调整读队列数和写队列数，实现平滑扩缩容。

**扩容示例**：

**初始状态**：
```bash
# 读队列：4，写队列：4
sh bin/mqadmin updateTopic -n localhost:9876 -t MyTopic -r 4 -w 4
```

**扩容到 8 个队列**：

**Step 1：增加写队列**
```bash
sh bin/mqadmin updateTopic -n localhost:9876 -t MyTopic -r 4 -w 8

# 状态：
# - 新消息写入 8 个队列（Queue 0-7）
# - 消费者从 4 个队列读取（Queue 0-3）
# - Queue 4-7 暂时无法消费
```

**Step 2：等待旧队列消费完成**
```bash
# 监控消费进度
sh bin/mqadmin consumerProgress -n localhost:9876 -g my-consumer-group

# 等待 Queue 0-3 的消息消费完成
```

**Step 3：增加读队列**
```bash
sh bin/mqadmin updateTopic -n localhost:9876 -t MyTopic -r 8 -w 8

# 状态：
# - 消费者从 8 个队列读取（Queue 0-7）
# - 扩容完成
```

**缩容示例**：

**初始状态**：
```bash
# 读队列：8，写队列：8
```

**缩容到 4 个队列**：

**Step 1：减少写队列**
```bash
sh bin/mqadmin updateTopic -n localhost:9876 -t MyTopic -r 8 -w 4

# 状态：
# - 新消息写入 4 个队列（Queue 0-3）
# - 消费者从 8 个队列读取（Queue 0-7）
# - Queue 4-7 只读，不再写入新消息
```

**Step 2：等待旧队列消费完成**
```bash
# 等待 Queue 4-7 的消息消费完成
```

**Step 3：减少读队列**
```bash
sh bin/mqadmin updateTopic -n localhost:9876 -t MyTopic -r 4 -w 4

# 状态：
# - 消费者从 4 个队列读取（Queue 0-3）
# - 缩容完成
```

**优势**：
- 平滑扩缩容，不丢失消息
- 不触发重平衡
- 灵活调整并发度

---

## 4. 分区负载均衡

### 4.1 生产者负载均衡

**Kafka 生产者负载均衡**：

**轮询策略**：
```java
// 自动负载均衡到所有分区
for (int i = 0; i < 100; i++) {
    producer.send(new ProducerRecord<>("my-topic", "message-" + i));
}

// 结果：
// Partition 0: 约 33 条消息
// Partition 1: 约 33 条消息
// Partition 2: 约 34 条消息
```

**Key Hash 策略**：
```java
// 相同 Key 的消息发送到同一分区
for (int i = 0; i < 100; i++) {
    String key = "user-" + (i % 10);  // 10 个不同的 Key
    producer.send(new ProducerRecord<>("my-topic", key, "message-" + i));
}

// 结果（3 个分区）：
// Partition 0: user-0, user-3, user-6, user-9 的消息（约 40 条）
// Partition 1: user-1, user-4, user-7 的消息（约 30 条）
// Partition 2: user-2, user-5, user-8 的消息（约 30 条）
```

**RocketMQ 生产者负载均衡**：

**默认轮询**：
```java
// 自动轮询发送到所有 Queue
for (int i = 0; i < 100; i++) {
    Message msg = new Message("MyTopic", ("message-" + i).getBytes());
    producer.send(msg);
}
```

**故障隔离**：
```java
// RocketMQ 自动隔离故障 Broker
// 发送失败时，自动切换到其他 Broker
```

### 4.2 消费者负载均衡

**Kafka 消费者负载均衡**：

**自动分配**：
```java
// 3 个消费者，6 个分区
// 自动分配：
// Consumer 1: Partition 0, 1
// Consumer 2: Partition 2, 3
// Consumer 3: Partition 4, 5

// 消费者数量 > 分区数时，部分消费者空闲
// 4 个消费者，3 个分区
// Consumer 1: Partition 0
// Consumer 2: Partition 1
// Consumer 3: Partition 2
// Consumer 4: 无分区（空闲）
```

**重平衡触发**：
- 消费者加入或离开
- 订阅的 Topic 分区数变化
- 消费者组成员超时

**RocketMQ 消费者负载均衡**：

**定期重平衡**：
```java
// RocketMQ 每 20 秒重新平衡一次
// 自动适应消费者变化
```

**平衡策略**：
```java
// 平均分配（默认）
consumer.setAllocateMessageQueueStrategy(new AllocateMessageQueueAveragely());

// 环形分配
consumer.setAllocateMessageQueueStrategy(new AllocateMessageQueueAveragelyByCircle());
```

---

## 5. 分区最佳实践

### 5.1 分区数规划原则

1. **初期合理规划**：避免频繁扩容
2. **预留余量**：按 1.5-2 倍峰值规划
3. **考虑消费者数量**：分区数 >= 消费者数
4. **单 Broker 限制**：< 4000 个分区

### 5.2 分区键设计

**好的分区键**：
- 分布均匀（避免热点）
- 有业务意义（便于调试）
- 稳定不变（避免重新路由）

**示例**：
```java
// ✅ 好的分区键
String key = "user-" + userId;            // 用户 ID
String key = "order-" + orderId;          // 订单 ID
String key = UUID.randomUUID().toString(); // UUID

// ❌ 不好的分区键
String key = "vip";                       // 所有 VIP 用户同一个键（热点）
String key = System.currentTimeMillis();  // 时间戳（不稳定）
```

### 5.3 避免热点分区

**检测热点分区**：
```bash
# Kafka：查看每个分区的消息数量
bin/kafka-run-class.sh kafka.tools.GetOffsetShell \
  --broker-list localhost:9092 \
  --topic my-topic \
  --time -1

# 输出：
# my-topic:0:50000   ← 热点分区（消息量远超其他分区）
# my-topic:1:10000
# my-topic:2:10000
```

**解决方案**：
1. **重新设计分区键**：使用更均匀的键
2. **增加分区数**：提高并发度
3. **自定义分区器**：手动控制分配

---

## 关键要点

1. **分区是并行处理的基础**：分区数决定并发度和吞吐量
2. **分区数规划**：根据吞吐量和消费者数量计算
3. **分区策略**：轮询、Key Hash、自定义分区器
4. **消费者分配**：Range、RoundRobin、Sticky、CooperativeSticky
5. **动态扩容**：Kafka 只能增加，RocketMQ 可平滑扩缩容
6. **避免热点**：合理设计分区键，均匀分布消息

---

## 深入一点

### Kafka 为什么消费者数量不能超过分区数？

**原因**：
- Kafka 的设计：一个分区只能被消费者组内的一个消费者消费
- 保证顺序性：同一分区的消息顺序处理
- 简化实现：避免复杂的协调逻辑

**对比 RabbitMQ**：
- RabbitMQ 一个队列可以被多个消费者竞争消费
- 无法保证顺序
- 实现更复杂

**扩展消费能力**：
1. **增加分区数**（推荐）
2. **增加 Topic 副本**（不增加并发度）
3. **异步处理**：消费者快速拉取，异步处理

### RocketMQ 读写队列分离的设计优势

**对比 Kafka**：
- Kafka 扩容：增加分区 → 触发重平衡 → 可能重复消费
- RocketMQ 扩容：先增加写队列 → 等待消费完成 → 再增加读队列 → 无重平衡

**优势**：
1. **平滑扩缩容**：不触发重平衡
2. **避免消息重复**：重平衡可能导致重复消费
3. **灵活调整**：独立控制读写并发度

---

## 参考资料

1. [Kafka Partitions](https://kafka.apache.org/documentation/#intro_topics)
2. [RocketMQ MessageQueue](https://rocketmq.apache.org/docs/domainModel/03messagemodel/)
3. [Kafka Consumer Rebalance](https://kafka.apache.org/documentation/#consumerconfigs_partition.assignment.strategy)
4. [RocketMQ Load Balance](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)
5. [Designing Data-Intensive Applications - Partitioning](https://dataintensive.net/)

# Topic 管理

## 概述

Topic 是消息队列的核心抽象，是消息的逻辑分类。合理的 Topic 设计和管理直接影响系统的可维护性和性能。本章将深入探讨 Topic 的创建、配置、管理以及最佳实践，帮助你掌握 Topic 管理的核心技能。

---

## 1. Topic 核心概念

### 1.1 什么是 Topic

**定义**：
- Topic 是消息的逻辑分类单位
- 生产者发送消息到特定 Topic
- 消费者订阅 Topic 接收消息

**三大 MQ 的 Topic 实现差异**：

| 特性 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| Topic 类型 | 物理 Topic | 物理 Topic | 逻辑 Topic（通过 Exchange 路由） |
| 默认分区/队列 | 需指定 | 4 读队列 + 4 写队列 | Exchange 路由到 Queue |
| 命名规范 | 字母、数字、下划线、连字符、句点 | 字母、数字、下划线、连字符 | Exchange 和 Queue 分别命名 |
| 最大长度 | 249 字符 | 255 字符 | 255 字符 |

---

## 2. Kafka Topic 管理

### 2.1 创建 Topic

**基本创建**：
```bash
bin/kafka-topics.sh --create \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 6 \
  --replication-factor 3
```

**参数说明**：
- `--topic`：Topic 名称
- `--partitions`：分区数（影响并发度和性能）
- `--replication-factor`：副本数（影响可靠性）

**高级创建（带配置）**：
```bash
bin/kafka-topics.sh --create \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 6 \
  --replication-factor 3 \
  --config retention.ms=86400000 \
  --config segment.bytes=536870912 \
  --config min.insync.replicas=2 \
  --config cleanup.policy=delete
```

**常用 Topic 配置**：

| 配置项 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `retention.ms` | 消息保留时间（毫秒） | 168 小时 | 86400000（1天） |
| `retention.bytes` | 每个分区最大字节数 | -1（无限制） | 1073741824（1GB） |
| `segment.bytes` | 日志段大小 | 1GB | 536870912（512MB） |
| `min.insync.replicas` | 最小同步副本数 | 1 | 2 |
| `cleanup.policy` | 清理策略 | delete | delete / compact |
| `compression.type` | 压缩类型 | producer | gzip / snappy / lz4 / zstd |
| `max.message.bytes` | 最大消息大小 | 1MB | 10485760（10MB） |

**使用配置文件创建**：
```bash
# 创建 topic-config.properties
cat > topic-config.properties << EOF
cleanup.policy=delete
retention.ms=604800000
segment.ms=86400000
min.insync.replicas=2
EOF

# 创建 Topic
bin/kafka-topics.sh --create \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 6 \
  --replication-factor 3 \
  --config-file topic-config.properties
```

### 2.2 查询 Topic

**查看 Topic 列表**：
```bash
bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

**查看 Topic 详情**：
```bash
bin/kafka-topics.sh --describe \
  --topic my-topic \
  --bootstrap-server localhost:9092

# 输出示例：
# Topic: my-topic	PartitionCount: 6	ReplicationFactor: 3	Configs: retention.ms=86400000
# 	Topic: my-topic	Partition: 0	Leader: 1	Replicas: 1,2,3	Isr: 1,2,3
# 	Topic: my-topic	Partition: 1	Leader: 2	Replicas: 2,3,1	Isr: 2,3,1
```

**查看所有 Topic 详情**：
```bash
bin/kafka-topics.sh --describe --bootstrap-server localhost:9092
```

**查看 Topic 配置**：
```bash
bin/kafka-configs.sh --describe \
  --entity-type topics \
  --entity-name my-topic \
  --bootstrap-server localhost:9092
```

### 2.3 修改 Topic

**增加分区**：
```bash
bin/kafka-topics.sh --alter \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 12

# 注意：分区只能增加，不能减少
```

**修改配置**：
```bash
# 修改保留时间
bin/kafka-configs.sh --alter \
  --entity-type topics \
  --entity-name my-topic \
  --add-config retention.ms=172800000 \
  --bootstrap-server localhost:9092

# 删除配置（恢复默认值）
bin/kafka-configs.sh --alter \
  --entity-type topics \
  --entity-name my-topic \
  --delete-config retention.ms \
  --bootstrap-server localhost:9092

# 批量修改配置
bin/kafka-configs.sh --alter \
  --entity-type topics \
  --entity-name my-topic \
  --add-config retention.ms=172800000,segment.bytes=268435456 \
  --bootstrap-server localhost:9092
```

**修改副本因子**（需要重分配）：
```bash
# 创建重分配计划 reassignment.json
cat > reassignment.json << EOF
{
  "version": 1,
  "partitions": [
    {"topic": "my-topic", "partition": 0, "replicas": [1,2,3,4]},
    {"topic": "my-topic", "partition": 1, "replicas": [2,3,4,1]}
  ]
}
EOF

# 执行重分配
bin/kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --reassignment-json-file reassignment.json \
  --execute
```

### 2.4 删除 Topic

**标记删除**：
```bash
bin/kafka-topics.sh --delete \
  --topic my-topic \
  --bootstrap-server localhost:9092
```

**确保删除生效**：
```properties
# server.properties 中必须配置
delete.topic.enable=true
```

**强制删除（ZooKeeper 模式）**：
```bash
# 1. 停止 Kafka
# 2. 删除 Zookeeper 中的 Topic 元数据
zkCli.sh
rmr /brokers/topics/my-topic
rmr /config/topics/my-topic

# 3. 删除磁盘上的数据
rm -rf /var/kafka-logs/my-topic-*

# 4. 重启 Kafka
```

---

## 3. RocketMQ Topic 管理

### 3.1 创建 Topic

**基本创建**：
```bash
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t MyTopic \
  -c DefaultCluster
```

**高级创建（指定参数）**：
```bash
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t MyTopic \
  -c DefaultCluster \
  -r 4 \              # 读队列数
  -w 4 \              # 写队列数
  -p 6                # 权限（2=只写, 4=只读, 6=读写）
```

**指定 Broker 创建**：
```bash
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t MyTopic \
  -b broker-a:10911
```

**创建顺序 Topic**：
```bash
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t OrderTopic \
  -c DefaultCluster \
  -o true             # 顺序消息
```

**Topic 配置参数**：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-r` | 读队列数 | 4 |
| `-w` | 写队列数 | 4 |
| `-p` | 权限 | 6（读写） |
| `-o` | 顺序消息 | false |
| `-u` | 单元化 | false |

### 3.2 查询 Topic

**查看 Topic 列表**：
```bash
sh bin/mqadmin topicList -n localhost:9876
```

**查看 Topic 详情**：
```bash
sh bin/mqadmin topicStatus -n localhost:9876 -t MyTopic

# 输出示例：
# Broker Name: broker-a
# Queue Id: 0
# Min Offset: 0
# Max Offset: 12345
# Last Updated: 2024-01-01 12:00:00
```

**查看 Topic 路由信息**：
```bash
sh bin/mqadmin topicRoute -n localhost:9876 -t MyTopic

# 输出示例：
# Broker: broker-a
# Queue Id: 0, 1, 2, 3
# Master: broker-a:10911
# Slave: broker-a-s:10911
```

**查看 Topic 配置**：
```bash
sh bin/mqadmin examineTopicConfig -n localhost:9876 -t MyTopic -c DefaultCluster
```

### 3.3 修改 Topic

**修改队列数**：
```bash
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t MyTopic \
  -c DefaultCluster \
  -r 8 \
  -w 8
```

**修改权限**：
```bash
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t MyTopic \
  -c DefaultCluster \
  -p 4    # 只读
```

**修改顺序属性**：
```bash
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t MyTopic \
  -c DefaultCluster \
  -o true
```

### 3.4 删除 Topic

**删除 Topic**：
```bash
sh bin/mqadmin deleteTopic \
  -n localhost:9876 \
  -t MyTopic \
  -c DefaultCluster
```

**清理 Topic 数据**：
```bash
# RocketMQ 会在删除 Topic 后自动清理数据
# 也可以手动清理
sh bin/mqadmin cleanExpiredCQ \
  -n localhost:9876 \
  -b broker-a:10911
```

---

## 4. RabbitMQ Topic 管理

RabbitMQ 中的 "Topic" 概念与 Kafka/RocketMQ 不同，它通过 Exchange 和 Queue 组合实现。

### 4.1 创建 Exchange

**使用管理界面**：
1. 访问 http://localhost:15672
2. 进入 Exchanges 页面
3. 点击 "Add a new exchange"
4. 填写参数：
   - Name: my-exchange
   - Type: topic / direct / fanout / headers
   - Durability: Durable
   - Auto delete: No

**使用命令行**：
```bash
sudo rabbitmqctl eval 'rabbit_exchange:declare(
  {resource, <<"/">>, exchange, <<"my-exchange">>},
  topic,
  true,  % durable
  false, % auto_delete
  false, % internal
  []
).'
```

**使用 Java 客户端**：
```java
channel.exchangeDeclare(
    "my-exchange",      // exchange name
    "topic",            // exchange type
    true,               // durable
    false,              // autoDelete
    null);              // arguments
```

**Exchange 类型**：

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| Direct | 精确匹配 routing key | 点对点消息 |
| Fanout | 广播到所有绑定的队列 | 广播消息 |
| Topic | 模式匹配 routing key | 发布订阅 |
| Headers | 根据消息头属性路由 | 复杂路由 |

### 4.2 创建 Queue

**使用管理界面**：
1. 进入 Queues 页面
2. 点击 "Add a new queue"
3. 填写参数：
   - Name: my-queue
   - Durability: Durable
   - Auto delete: No
   - Arguments: 可选（TTL、Max length 等）

**使用命令行**：
```bash
sudo rabbitmqctl eval 'rabbit_amqqueue:declare(
  {resource, <<"/">>, queue, <<"my-queue">>},
  true,  % durable
  false, % exclusive
  [],    % arguments
  none,  % owner
  <<"admin">>
).'
```

**使用 Java 客户端**：
```java
Map<String, Object> args = new HashMap<>();
args.put("x-message-ttl", 86400000);        // 消息 TTL（1天）
args.put("x-max-length", 10000);            // 最大消息数
args.put("x-max-length-bytes", 104857600);  // 最大字节数（100MB）
args.put("x-dead-letter-exchange", "dlx");  // 死信交换机
args.put("x-max-priority", 10);             // 最大优先级

channel.queueDeclare(
    "my-queue",         // queue name
    true,               // durable
    false,              // exclusive
    false,              // autoDelete
    args);              // arguments
```

**Queue 参数**：

| 参数 | 说明 | 示例 |
|------|------|------|
| `x-message-ttl` | 消息 TTL（毫秒） | 86400000（1天） |
| `x-expires` | 队列 TTL（毫秒） | 3600000（1小时） |
| `x-max-length` | 最大消息数 | 10000 |
| `x-max-length-bytes` | 最大字节数 | 104857600（100MB） |
| `x-dead-letter-exchange` | 死信交换机 | "dlx" |
| `x-dead-letter-routing-key` | 死信路由键 | "dead" |
| `x-max-priority` | 最大优先级 | 10 |
| `x-queue-mode` | 队列模式 | "lazy"（延迟队列） |

### 4.3 绑定 Exchange 和 Queue

**使用管理界面**：
1. 进入 Exchange 页面
2. 点击 Exchange 名称
3. 在 Bindings 部分添加绑定

**使用命令行**：
```bash
sudo rabbitmqctl eval 'rabbit_binding:add({
  binding,
  {resource, <<"/">>, exchange, <<"my-exchange">>},
  <<"order.#">>,  % routing key
  {resource, <<"/">>, queue, <<"my-queue">>},
  []
}).'
```

**使用 Java 客户端**：
```java
// Direct Exchange
channel.queueBind("my-queue", "my-exchange", "order.created");

// Topic Exchange（支持通配符）
channel.queueBind("my-queue", "my-exchange", "order.*");
channel.queueBind("my-queue", "my-exchange", "order.#");

// Fanout Exchange（忽略 routing key）
channel.queueBind("my-queue", "my-exchange", "");
```

**Topic Exchange 通配符规则**：
- `*`：匹配一个词（word）
- `#`：匹配零个或多个词

**示例**：
```
Routing Key: "order.created.vip"

Binding Key "order.*.*"      → 匹配
Binding Key "order.#"         → 匹配
Binding Key "order.created.#" → 匹配
Binding Key "*.created.*"     → 匹配
Binding Key "order.updated.*" → 不匹配
```

### 4.4 删除 Exchange 和 Queue

**删除 Exchange**：
```bash
# 使用命令行
sudo rabbitmqctl eval 'rabbit_exchange:delete(
  {resource, <<"/">>, exchange, <<"my-exchange">>},
  false  % if-unused
).'

# 使用 Java 客户端
channel.exchangeDelete("my-exchange", false);
```

**删除 Queue**：
```bash
# 使用命令行
sudo rabbitmqctl delete_queue my-queue

# 使用 Java 客户端
channel.queueDelete("my-queue", false, false);
```

---

## 5. Topic 配置最佳实践

### 5.1 分区/队列数规划

**Kafka 分区数规划**：

**计算公式**：
```
分区数 = max(生产者吞吐量 / 单分区生产吞吐量, 消费者吞吐量 / 单分区消费吞吐量)
```

**示例**：
```
目标生产吞吐量：100 MB/s
单分区生产吞吐量：20 MB/s
目标消费吞吐量：80 MB/s
单分区消费吞吐量：10 MB/s

分区数 = max(100/20, 80/10) = max(5, 8) = 8
```

**经验值**：
- 小 Topic（< 1 MB/s）：3-6 个分区
- 中 Topic（1-10 MB/s）：6-12 个分区
- 大 Topic（> 10 MB/s）：12-50 个分区
- 超大 Topic（> 100 MB/s）：50-100+ 个分区

**注意事项**：
- 分区数不宜过多（影响 ZK 性能、选举时间）
- 消费者数量不能超过分区数
- 增加分区后无法减少

**RocketMQ 队列数规划**：

**默认配置**：
- 读队列数：4
- 写队列数：4

**调优建议**：
- 小 Topic：4-8 个队列
- 中 Topic：8-16 个队列
- 大 Topic：16-32 个队列

**注意**：
- 队列数可以动态调整
- 读写队列数可以不同（读 > 写用于扩容，读 < 写用于缩容）

### 5.2 副本数规划

**Kafka 副本数**：

**推荐配置**：
- 开发环境：1 副本
- 测试环境：2 副本
- 生产环境：3 副本（推荐）
- 金融级：5 副本

**配合 `min.insync.replicas` 配置**：
```properties
# 副本数 3，min.insync.replicas 2
default.replication.factor=3
min.insync.replicas=2

# 保证：
# - 至少 2 个副本同步成功才返回
# - 允许 1 个副本故障
```

**RocketMQ 主从配置**：

**主从模式**：
- 1 Master + 1 Slave（最低配置）
- 1 Master + 2 Slave（推荐）

**DLedger 模式**：
- 3 节点（最低配置）
- 5 节点（推荐）

### 5.3 保留期限配置

**Kafka 保留策略**：

**按时间保留**：
```properties
# Topic 级别配置
retention.ms=604800000  # 7天

# Broker 级别配置（默认）
log.retention.hours=168  # 7天
```

**按大小保留**：
```properties
# 每个分区最大 10GB
retention.bytes=10737418240
```

**组合策略**（满足任一条件即清理）：
```properties
retention.ms=604800000
retention.bytes=10737418240
```

**RocketMQ 保留策略**：

```properties
# 文件保留时间（小时）
fileReservedTime=48

# 删除文件的时间点（凌晨4点）
deleteWhen=04
```

**RabbitMQ TTL 配置**：

**队列级别 TTL**：
```java
Map<String, Object> args = new HashMap<>();
args.put("x-message-ttl", 86400000);  // 1天
channel.queueDeclare("my-queue", true, false, false, args);
```

**消息级别 TTL**：
```java
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .expiration("86400000")  // 1天
    .build();
channel.basicPublish("", "my-queue", props, message.getBytes());
```

### 5.4 Topic 命名规范

**推荐命名规则**：
```
<业务域>.<业务类型>.<事件类型>

示例：
order.payment.success
order.shipment.created
user.registration.completed
notification.email.sent
```

**命名规范**：
1. 使用小写字母和连字符
2. 避免使用特殊字符
3. 名称具有描述性
4. 保持一致性

**反模式**：
```
❌ TOPIC1, TEST, TEMP
❌ my_topic_12345
❌ order-payment-success-event-for-downstream-systems
✅ order.payment.success
```

### 5.5 自动创建 vs 手动创建

**自动创建（开发环境）**：
```properties
# Kafka
auto.create.topics.enable=true

# RocketMQ
autoCreateTopicEnable=true
```

**优点**：
- 快速开发，无需手动创建
- 灵活，适合快速迭代

**缺点**：
- 生产环境风险大（拼写错误创建错误 Topic）
- 默认配置可能不合理
- 难以统一管理

**手动创建（生产环境，推荐）**：
```properties
# Kafka
auto.create.topics.enable=false

# RocketMQ
autoCreateTopicEnable=false
```

**优点**：
- 配置可控，避免默认配置问题
- 统一管理，便于审计
- 避免误创建

**缺点**：
- 需要提前规划
- 增加运维成本

---

## 6. Topic 管理工具对比

### 6.1 命令行工具

| 操作 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 创建 | kafka-topics.sh --create | mqadmin updateTopic | rabbitmqctl eval |
| 查询 | kafka-topics.sh --describe | mqadmin topicStatus | rabbitmqctl list_queues |
| 修改 | kafka-configs.sh --alter | mqadmin updateTopic | 重新声明 |
| 删除 | kafka-topics.sh --delete | mqadmin deleteTopic | rabbitmqctl delete_queue |

### 6.2 Web 管理工具

| MQ | 工具 | 功能 |
|------|------|------|
| Kafka | Kafka Manager / Kafdrop | Topic 创建、查看、配置 |
| RocketMQ | Dashboard | Topic 管理、消息查询 |
| RabbitMQ | Management Plugin | Exchange、Queue、Binding 管理 |

---

## 关键要点

1. **Topic 是消息分类单元**：合理设计 Topic 提升可维护性
2. **分区/队列数规划**：根据吞吐量和并发度计算
3. **副本数规划**：生产环境推荐 3 副本
4. **保留期限**：根据业务需求和存储成本配置
5. **命名规范**：统一命名规则，便于管理
6. **手动创建**：生产环境禁用自动创建

---

## 深入一点

### Kafka 为什么不能减少分区？

**技术原因**：
1. **数据分布**：消息已经分布在多个分区，减少分区需要迁移数据
2. **消费者位点**：Consumer Offset 基于分区号，减少分区会导致位点混乱
3. **顺序保证**：减少分区会打乱消息顺序

**解决方案**：
- 创建新 Topic，迁移流量
- 保持旧 Topic 直到消息过期
- 删除旧 Topic

### RocketMQ 读队列 vs 写队列

**场景 1：扩容**
```
初始：读队列 4，写队列 4
扩容：读队列 8，写队列 8

新消息写入 8 个队列，旧消息仍在前 4 个队列
消费者从 8 个队列拉取，逐步消费完旧数据
```

**场景 2：缩容**
```
初始：读队列 8，写队列 8
缩容：读队列 8，写队列 4

新消息写入 4 个队列，旧消息仍在 8 个队列
消费者从 8 个队列拉取，直到后 4 个队列数据消费完
再次修改：读队列 4，写队列 4
```

**优势**：
- 平滑扩缩容，不丢失消息
- 避免消息重复消费

---

## 参考资料

1. [Kafka Topic Configuration](https://kafka.apache.org/documentation/#topicconfigs)
2. [RocketMQ Topic Management](https://rocketmq.apache.org/docs/bestPractice/06bestpractice)
3. [RabbitMQ Queues](https://www.rabbitmq.com/queues.html)
4. [RabbitMQ Exchanges](https://www.rabbitmq.com/tutorials/amqp-concepts.html)
5. Martin Fowler - [Messaging Patterns](https://www.enterpriseintegrationpatterns.com/patterns/messaging/)

# 集群高可用部署

## 概述

生产环境必须部署高可用集群以保证服务的可靠性和稳定性。本章将详细介绍 Kafka、RocketMQ、RabbitMQ 的集群部署方案、副本机制、故障转移、以及集群扩缩容操作，帮助你构建企业级消息队列集群。

---

## 1. Kafka 集群部署

### 1.1 集群架构

**典型 3 节点集群**：
```
┌─────────────────────────────────────────────┐
│           Zookeeper 集群（3节点）            │
│  zk1:2181    zk2:2181    zk3:2181          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Kafka Broker 集群（3节点）         │
│  broker1:9092  broker2:9092  broker3:9092  │
└─────────────────────────────────────────────┘
                    ↓
         Topic-0 (3 Partitions, 3 Replicas)
         ├── P0: Leader@broker1, Follower@broker2,3
         ├── P1: Leader@broker2, Follower@broker1,3
         └── P2: Leader@broker3, Follower@broker1,2
```

### 1.2 Zookeeper 集群部署

**节点规划**：
- 最少 3 个节点（奇数个，支持半数以上选举）
- 推荐 5 个节点（更高可用性）

**配置文件**（`config/zookeeper.properties`）：

**节点 1**（192.168.1.101）：
```properties
dataDir=/var/zookeeper/data
dataLogDir=/var/zookeeper/logs
clientPort=2181

# 集群配置
server.1=192.168.1.101:2888:3888
server.2=192.168.1.102:2888:3888
server.3=192.168.1.103:2888:3888

# 其他配置
tickTime=2000
initLimit=10
syncLimit=5
maxClientCnxns=60
```

**节点 2、3**：同上配置，修改 IP 地址

**创建 myid 文件**：
```bash
# 节点 1
echo "1" > /var/zookeeper/data/myid

# 节点 2
echo "2" > /var/zookeeper/data/myid

# 节点 3
echo "3" > /var/zookeeper/data/myid
```

**启动集群**：
```bash
# 在每个节点上启动 Zookeeper
bin/zookeeper-server-start.sh -daemon config/zookeeper.properties

# 检查状态
echo stat | nc localhost 2181
# 输出包含 Mode: follower 或 Mode: leader
```

### 1.3 Kafka 集群部署

**配置文件**（`config/server.properties`）：

**Broker 1**（192.168.1.101）：
```properties
# Broker ID（集群内唯一）
broker.id=1

# 监听地址
listeners=PLAINTEXT://192.168.1.101:9092
advertised.listeners=PLAINTEXT://192.168.1.101:9092

# Zookeeper 集群地址
zookeeper.connect=192.168.1.101:2181,192.168.1.102:2181,192.168.1.103:2181

# 日志目录
log.dirs=/var/kafka-logs

# 副本配置
default.replication.factor=3
min.insync.replicas=2
unclean.leader.election.enable=false

# 分区配置
num.partitions=3
auto.create.topics.enable=false

# 日志保留
log.retention.hours=168
log.segment.bytes=1073741824

# 网络配置
num.network.threads=8
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
```

**Broker 2、3**：同上配置，修改 `broker.id` 和 `listeners`

**启动集群**：
```bash
# 在每个节点上启动 Kafka
bin/kafka-server-start.sh -daemon config/server.properties

# 检查集群状态
bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### 1.4 KRaft 模式集群部署

**配置文件**（`config/kraft/server.properties`）：

**节点 1**：
```properties
# 节点 ID
node.id=1

# 角色（combined 表示同时是 Broker 和 Controller）
process.roles=broker,controller

# Controller 集群配置（投票成员）
controller.quorum.voters=1@192.168.1.101:9093,2@192.168.1.102:9093,3@192.168.1.103:9093

# 监听地址
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
advertised.listeners=PLAINTEXT://192.168.1.101:9092
controller.listener.names=CONTROLLER

# 日志目录
log.dirs=/var/kafka-logs

# 其他配置同 Zookeeper 模式
```

**初始化集群**：
```bash
# 生成集群 ID（所有节点使用相同 ID）
KAFKA_CLUSTER_ID="$(bin/kafka-storage.sh random-uuid)"

# 在每个节点上格式化存储
bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c config/kraft/server.properties

# 启动每个节点
bin/kafka-server-start.sh -daemon config/kraft/server.properties
```

### 1.5 副本机制与故障转移

**副本策略**：
- **Leader Replica**：处理所有读写请求
- **Follower Replica**：从 Leader 复制数据
- **ISR（In-Sync Replicas）**：与 Leader 保持同步的副本集合

**创建高可用 Topic**：
```bash
bin/kafka-topics.sh --create \
  --topic orders \
  --bootstrap-server localhost:9092 \
  --partitions 6 \
  --replication-factor 3 \
  --config min.insync.replicas=2
```

**查看副本分布**：
```bash
bin/kafka-topics.sh --describe --topic orders --bootstrap-server localhost:9092

# 输出示例：
# Topic: orders  PartitionCount: 6  ReplicationFactor: 3
# Topic: orders  Partition: 0  Leader: 1  Replicas: 1,2,3  Isr: 1,2,3
# Topic: orders  Partition: 1  Leader: 2  Replicas: 2,3,1  Isr: 2,3,1
```

**故障转移流程**：
1. Leader 宕机
2. Controller 从 ISR 中选举新 Leader
3. 新 Leader 开始处理请求
4. 客户端自动连接新 Leader

**配置调优**：
```properties
# Leader 不平衡容忍度（10%）
leader.imbalance.per.broker.percentage=10

# 自动平衡开关
auto.leader.rebalance.enable=true

# 平衡检查间隔（5分钟）
leader.imbalance.check.interval.seconds=300

# 副本落后阈值（10秒）
replica.lag.time.max.ms=10000
```

### 1.6 集群扩容与缩容

**扩容（添加新 Broker）**：

**Step 1：启动新 Broker**
```bash
# 新 Broker 配置（broker.id=4）
bin/kafka-server-start.sh -daemon config/server.properties
```

**Step 2：创建分区重分配计划**
```bash
# 创建 topics-to-move.json
cat > topics-to-move.json << EOF
{
  "topics": [{"topic": "orders"}],
  "version": 1
}
EOF

# 生成重分配计划
bin/kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --topics-to-move-json-file topics-to-move.json \
  --broker-list "1,2,3,4" \
  --generate
```

**Step 3：执行重分配**
```bash
# 将生成的计划保存到 reassignment.json
# 执行重分配
bin/kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --reassignment-json-file reassignment.json \
  --execute

# 验证重分配
bin/kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --reassignment-json-file reassignment.json \
  --verify
```

**缩容（移除 Broker）**：

**Step 1：迁移分区到其他 Broker**
```bash
# 生成迁移计划（不包含要移除的 Broker）
bin/kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --topics-to-move-json-file topics-to-move.json \
  --broker-list "1,2,3" \
  --generate
```

**Step 2：执行迁移并验证**
```bash
# 执行迁移
bin/kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --reassignment-json-file reassignment.json \
  --execute

# 验证迁移完成
bin/kafka-topics.sh --describe --topic orders --bootstrap-server localhost:9092
# 确保没有副本在 Broker 4 上
```

**Step 3：停止并移除 Broker**
```bash
bin/kafka-server-stop.sh
```

---

## 2. RocketMQ 集群部署

### 2.1 集群架构

**典型集群架构**：
```
┌─────────────────────────────────────────────┐
│           NameServer 集群（3节点）           │
│  ns1:9876    ns2:9876    ns3:9876          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Broker 集群（主从模式）            │
│  ┌──────────────┐      ┌──────────────┐    │
│  │  Broker-A    │      │  Broker-B    │    │
│  │  Master      │      │  Master      │    │
│  │  (broker-a-0)│      │  (broker-b-0)│    │
│  └──────────────┘      └──────────────┘    │
│  ┌──────────────┐      ┌──────────────┐    │
│  │  Broker-A    │      │  Broker-B    │    │
│  │  Slave       │      │  Slave       │    │
│  │  (broker-a-1)│      │  (broker-b-1)│    │
│  └──────────────┘      └──────────────┘    │
└─────────────────────────────────────────────┘
```

### 2.2 NameServer 集群部署

**配置文件**（`conf/namesrv.properties`）：
```properties
# 监听端口
listenPort=9876

# KV 配置文件路径
kvConfigPath=/root/namesrv/kvConfig.json

# 删除过期路由信息间隔（ms）
deleteTopicWithNameServer=true
```

**启动 NameServer**（在每个节点）：
```bash
# 节点 1
nohup sh bin/mqnamesrv &

# 节点 2
nohup sh bin/mqnamesrv &

# 节点 3
nohup sh bin/mqnamesrv &

# 验证
telnet 192.168.1.101 9876
```

### 2.3 Broker 主从模式部署

**Master-Slave 架构**：
- 一个 Master 负责读写
- 一个或多个 Slave 负责备份和读（可选）
- 主从数据同步（异步或同步）

**Master 配置**（`conf/broker-a.properties`）：
```properties
# Broker 名称（主从名称必须相同）
brokerName=broker-a

# Broker ID（0 表示 Master，非0 表示 Slave）
brokerId=0

# Broker 角色
brokerRole=ASYNC_MASTER

# 刷盘策略
flushDiskType=ASYNC_FLUSH

# NameServer 地址（多个用分号分隔）
namesrvAddr=192.168.1.101:9876;192.168.1.102:9876;192.168.1.103:9876

# 监听端口
listenPort=10911

# 存储路径
storePathRootDir=/data/rocketmq/store
storePathCommitLog=/data/rocketmq/store/commitlog

# 是否允许自动创建 Topic
autoCreateTopicEnable=false

# 删除文件时间（凌晨4点）
deleteWhen=04

# 文件保留时间（48小时）
fileReservedTime=48

# 主从同步配置
brokerIP1=192.168.1.101
```

**Slave 配置**（`conf/broker-a-slave.properties`）：
```properties
brokerName=broker-a
brokerId=1
brokerRole=SLAVE
flushDiskType=ASYNC_FLUSH

namesrvAddr=192.168.1.101:9876;192.168.1.102:9876;192.168.1.103:9876

listenPort=10911
storePathRootDir=/data/rocketmq/store-slave
storePathCommitLog=/data/rocketmq/store-slave/commitlog

autoCreateTopicEnable=false
deleteWhen=04
fileReservedTime=48

brokerIP1=192.168.1.102
```

**启动 Broker**：
```bash
# 启动 Master
nohup sh bin/mqbroker -c conf/broker-a.properties &

# 启动 Slave
nohup sh bin/mqbroker -c conf/broker-a-slave.properties &

# 验证集群状态
sh bin/mqadmin clusterList -n localhost:9876
```

**同步复制配置**（高可靠性）：
```properties
# Master 配置
brokerRole=SYNC_MASTER

# 等待 Slave 确认超时（5秒）
syncMasterFlushSlaveMaxTimeout=5000
```

### 2.4 DLedger 模式部署（自动主从切换）

DLedger 基于 Raft 协议，支持自动 Leader 选举和故障转移。

**配置文件**（`conf/dledger/broker-n0.properties`）：
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

namesrvAddr=192.168.1.101:9876;192.168.1.102:9876;192.168.1.103:9876

storePathRootDir=/data/rocketmq/dledger-store
```

**启动 DLedger 集群**：
```bash
# 节点 1
nohup sh bin/mqbroker -c conf/dledger/broker-n0.properties &

# 节点 2（修改 dLegerSelfId=n1）
nohup sh bin/mqbroker -c conf/dledger/broker-n1.properties &

# 节点 3（修改 dLegerSelfId=n2）
nohup sh bin/mqbroker -c conf/dledger/broker-n2.properties &
```

### 2.5 故障转移

**主从模式**：
- Slave 不会自动升级为 Master
- Master 宕机后，需要手动切换或重启
- 生产环境推荐使用 DLedger 模式

**DLedger 模式**：
- 自动 Leader 选举
- Master 宕机后，自动选举新 Leader
- 无需人工干预

**测试故障转移**：
```bash
# 查看当前 Leader
sh bin/mqadmin clusterList -n localhost:9876

# 停止当前 Leader
sh bin/mqshutdown broker

# 等待选举完成（约10秒）
sh bin/mqadmin clusterList -n localhost:9876
# 查看新 Leader
```

### 2.6 集群扩容

**添加新 Broker**：

**Step 1：启动新 Broker**
```bash
# 配置新 Broker（broker-c）
nohup sh bin/mqbroker -c conf/broker-c.properties &
```

**Step 2：NameServer 自动发现**
- NameServer 会自动发现新 Broker
- 无需手动注册

**Step 3：创建 Topic 时指定新 Broker**
```bash
sh bin/mqadmin updateTopic \
  -n localhost:9876 \
  -t NewTopic \
  -c DefaultCluster \
  -b broker-c:10911
```

---

## 3. RabbitMQ 集群部署

### 3.1 集群架构

**RabbitMQ 集群类型**：
1. **普通集群**：元数据共享，队列数据不共享
2. **镜像队列**：队列数据复制到多个节点（已废弃，3.8+）
3. **仲裁队列**（Quorum Queue）：基于 Raft，推荐使用（3.8+）

```
┌─────────────────────────────────────────────┐
│           RabbitMQ 集群（3节点）             │
│  rabbit@node1  rabbit@node2  rabbit@node3  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 仲裁队列 │  │ 仲裁队列 │  │ 仲裁队列 │  │
│  │ (Leader) │  │(Follower)│  │(Follower)│  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

### 3.2 普通集群部署

**准备工作**：
- 所有节点使用相同的 Erlang Cookie
- 所有节点能够互相解析主机名

**配置 Erlang Cookie**：
```bash
# 在所有节点上设置相同的 Cookie
echo "SHARED_SECRET_COOKIE" > /var/lib/rabbitmq/.erlang.cookie
chmod 400 /var/lib/rabbitmq/.erlang.cookie
```

**配置主机名解析**（`/etc/hosts`）：
```
192.168.1.101 node1
192.168.1.102 node2
192.168.1.103 node3
```

**启动节点**：
```bash
# 在每个节点上启动 RabbitMQ
sudo systemctl start rabbitmq-server
```

**组建集群**：

**在 node2 上**：
```bash
# 停止应用（但保持 Erlang 运行）
sudo rabbitmqctl stop_app

# 重置节点
sudo rabbitmqctl reset

# 加入集群
sudo rabbitmqctl join_cluster rabbit@node1

# 启动应用
sudo rabbitmqctl start_app
```

**在 node3 上**：
```bash
sudo rabbitmqctl stop_app
sudo rabbitmqctl reset
sudo rabbitmqctl join_cluster rabbit@node1
sudo rabbitmqctl start_app
```

**验证集群**：
```bash
sudo rabbitmqctl cluster_status
# 输出包含所有节点信息
```

### 3.3 仲裁队列（Quorum Queue）部署

仲裁队列基于 Raft 协议，提供强一致性和高可用性。

**创建仲裁队列**：
```bash
# 使用管理界面创建
# Queue Type: Quorum

# 使用命令行创建
sudo rabbitmqctl eval 'rabbit_quorum_queue:declare({resource, <<"/">>, queue, <<"my-quorum-queue">>}, durable, []).'
```

**使用 Java 客户端创建**：
```java
Map<String, Object> args = new HashMap<>();
args.put("x-queue-type", "quorum");

channel.queueDeclare("my-quorum-queue", 
    true,    // durable
    false,   // exclusive
    false,   // autoDelete
    args);   // arguments
```

**配置副本数**：
```java
// 默认副本数为集群节点数（最多5个）
// 最少需要3个节点才能保证高可用
args.put("x-quorum-initial-group-size", 3);
```

### 3.4 故障转移

**仲裁队列故障转移**：
- 基于 Raft 协议，自动选举 Leader
- 需要半数以上节点存活
- Leader 宕机后，自动选举新 Leader

**测试故障转移**：
```bash
# 停止当前 Leader 节点
sudo systemctl stop rabbitmq-server

# 查看集群状态
sudo rabbitmqctl cluster_status

# 仲裁队列自动选举新 Leader，继续提供服务
```

**恢复节点**：
```bash
# 启动节点
sudo systemctl start rabbitmq-server

# 节点自动重新加入集群并同步数据
```

### 3.5 集群扩容

**添加新节点**：

**Step 1：安装 RabbitMQ**
```bash
# 在新节点上安装 RabbitMQ
sudo apt-get install -y rabbitmq-server
```

**Step 2：配置 Erlang Cookie**
```bash
# 复制现有节点的 Cookie
sudo scp node1:/var/lib/rabbitmq/.erlang.cookie /var/lib/rabbitmq/
sudo chmod 400 /var/lib/rabbitmq/.erlang.cookie
```

**Step 3：加入集群**
```bash
sudo rabbitmqctl stop_app
sudo rabbitmqctl reset
sudo rabbitmqctl join_cluster rabbit@node1
sudo rabbitmqctl start_app
```

**移除节点**：

**Step 1：在要移除的节点上**
```bash
sudo rabbitmqctl stop_app
sudo rabbitmqctl reset
```

**Step 2：在其他节点上删除记录**
```bash
sudo rabbitmqctl forget_cluster_node rabbit@node4
```

---

## 4. 集群监控与健康检查

### 4.1 Kafka 集群监控

**JMX 监控指标**：
```bash
# 启用 JMX（在 server.properties 中）
export JMX_PORT=9999

# 使用 JConsole 或 Prometheus 采集指标
```

**关键指标**：
- UnderReplicatedPartitions：副本未同步分区数
- OfflinePartitionsCount：离线分区数
- ActiveControllerCount：活跃 Controller 数量（应为1）
- LeaderElectionRate：Leader 选举频率

**健康检查脚本**：
```bash
#!/bin/bash
# 检查 Broker 是否健康
bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Kafka is healthy"
    exit 0
else
    echo "Kafka is unhealthy"
    exit 1
fi
```

### 4.2 RocketMQ 集群监控

**查看集群状态**：
```bash
sh bin/mqadmin clusterList -n localhost:9876
```

**关键指标**：
- Broker 在线状态
- 消息堆积量
- 消费延迟
- 发送/消费 TPS

**使用 Dashboard 监控**：
- 访问 Dashboard Web 界面
- 查看实时监控指标
- 配置告警规则

### 4.3 RabbitMQ 集群监控

**查看集群状态**：
```bash
sudo rabbitmqctl cluster_status
sudo rabbitmqctl list_queues
sudo rabbitmqctl list_connections
```

**使用管理界面**：
- 访问 http://localhost:15672
- 查看节点状态、队列状态
- 监控消息速率、连接数

**健康检查**：
```bash
# HTTP API 健康检查
curl -u admin:admin http://localhost:15672/api/healthchecks/node

# 输出 {"status":"ok"}
```

---

## 关键要点

1. **Kafka 集群**：推荐 KRaft 模式，副本数≥3，`min.insync.replicas=2`
2. **RocketMQ 集群**：DLedger 模式支持自动故障转移，主从模式需要手动切换
3. **RabbitMQ 集群**：使用仲裁队列（Quorum Queue）实现高可用
4. **副本机制**：所有集群都支持副本，保证数据不丢失
5. **故障转移**：Kafka 和 RabbitMQ 自动故障转移，RocketMQ 需要 DLedger 模式
6. **扩容缩容**：Kafka 需要手动迁移分区，RocketMQ 和 RabbitMQ 相对简单

---

## 深入一点

### Kafka ISR 机制详解

**ISR（In-Sync Replicas）**：
- 与 Leader 保持同步的副本集合
- 只有 ISR 中的副本才能被选举为 Leader
- 保证数据不丢失

**副本同步条件**：
```properties
# 副本落后阈值（10秒）
replica.lag.time.max.ms=10000
```
- Follower 在 10 秒内没有拉取消息 → 从 ISR 中移除
- Follower 追上 Leader → 重新加入 ISR

**ACK 配置与 ISR 的关系**：
```properties
# acks=all：等待所有 ISR 副本确认
# min.insync.replicas=2：ISR 最少副本数
```
- 如果 ISR 副本数 < 2，生产者发送失败
- 保证数据至少在 2 个副本上

**不完整 Leader 选举**：
```properties
# 是否允许非 ISR 副本被选举为 Leader
unclean.leader.election.enable=false
```
- `false`：只有 ISR 副本能被选举，保证数据不丢失，但可能导致分区不可用
- `true`：允许非 ISR 副本被选举，保证可用性，但可能丢失数据

---

## 参考资料

1. [Kafka 官方文档 - Replication](https://kafka.apache.org/documentation/#replication)
2. [RocketMQ 部署文档](https://rocketmq.apache.org/docs/deploymentOperations/01deploy)
3. [RabbitMQ 集群指南](https://www.rabbitmq.com/clustering.html)
4. [Kafka KRaft](https://kafka.apache.org/documentation/#kraft)
5. [RocketMQ DLedger](https://github.com/apache/rocketmq/blob/develop/docs/cn/dledger/deploy_guide.md)
6. [RabbitMQ Quorum Queues](https://www.rabbitmq.com/quorum-queues.html)

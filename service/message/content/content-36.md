# 集群配置详解

## 概述

集群配置确保消息队列的高可用性和容错能力。本章系统讲解三大消息队列的集群配置。

---

## 1. Kafka Zookeeper/KRaft 配置

### 1.1 Zookeeper模式

```properties
# server.properties

# Zookeeper连接
zookeeper.connect=zk1:2181,zk2:2181,zk3:2181/kafka

# Zookeeper会话超时
zookeeper.session.timeout.ms=18000

# Zookeeper连接超时
zookeeper.connection.timeout.ms=18000
```

**Zookeeper配置（zoo.cfg）**：
```properties
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/var/zookeeper
clientPort=2181

server.1=zk1:2888:3888
server.2=zk2:2888:3888
server.3=zk3:2888:3888
```

### 1.2 KRaft模式（去Zookeeper）

```properties
# server.properties

# 节点角色（broker/controller/broker,controller）
process.roles=broker,controller

# 节点ID
node.id=1

# Controller quorum voters
controller.quorum.voters=1@kafka1:9093,2@kafka2:9093,3@kafka3:9093

# Controller监听地址
controller.listener.names=CONTROLLER
listeners=PLAINTEXT://:9092,CONTROLLER://:9093

# 日志目录
log.dirs=/var/kafka-data

# 集群ID（首次格式化生成）
cluster.id=MkU3OEVBNTcwNTJENDM2Qk
```

**格式化存储**：
```bash
# 生成集群ID
bin/kafka-storage.sh random-uuid

# 格式化存储
bin/kafka-storage.sh format \
  -t <cluster-id> \
  -c config/kraft/server.properties
```

---

## 2. RocketMQ NameServer 配置

### 2.1 NameServer配置

```properties
# namesrv.properties

# 监听端口
listenPort=9876

# KV配置文件路径
kvConfigPath=/root/namesrv/kvConfig.json

# 删除Topic时从NameServer删除
deleteTopicWithNameServer=true
```

### 2.2 集群部署

```bash
# NameServer1
nohup sh bin/mqnamesrv &

# NameServer2
nohup sh bin/mqnamesrv &

# NameServer3
nohup sh bin/mqnamesrv &

# Broker配置所有NameServer
namesrvAddr=ns1:9876;ns2:9876;ns3:9876
```

---

## 3. RabbitMQ 集群配置

### 3.1 节点类型

**普通集群**：
- 元数据同步（队列、Exchange、绑定）
- 消息不复制（存储在声明节点）

**镜像队列**：
- 消息在多节点复制
- 主节点故障，从节点升主

**仲裁队列（Quorum Queue）**：
- 基于Raft协议
- 强一致性，自动选举

### 3.2 集群搭建

```bash
# 节点1
rabbitmq-server -detached

# 节点2加入集群
rabbitmqctl stop_app
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app

# 节点3加入集群
rabbitmqctl stop_app
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app

# 查看集群状态
rabbitmqctl cluster_status
```

### 3.3 网络分区处理

```conf
# rabbitmq.conf

# 分区处理策略
cluster_partition_handling = autoheal
# 可选：
# - ignore：忽略（不推荐）
# - pause_minority：暂停少数节点
# - autoheal：自动修复（推荐）
```

### 3.4 镜像队列策略

```bash
# 设置镜像策略（所有节点）
rabbitmqctl set_policy ha-all \
  "^ha\." \
  '{"ha-mode":"all","ha-sync-mode":"automatic"}' \
  --priority 1 \
  --apply-to queues

# 设置镜像策略（指定数量）
rabbitmqctl set_policy ha-two \
  "^two\." \
  '{"ha-mode":"exactly","ha-params":2,"ha-sync-mode":"automatic"}' \
  --apply-to queues
```

### 3.5 仲裁队列

```java
// 声明仲裁队列
Map<String, Object> args = new HashMap<>();
args.put("x-queue-type", "quorum");

channel.queueDeclare("quorum-queue", true, false, false, args);
```

---

## 4. Controller 配置

### 4.1 Kafka Controller

```properties
# Zookeeper模式：自动选举Controller
# 无需额外配置

# KRaft模式：指定Controller节点
process.roles=controller
# 或
process.roles=broker,controller
```

**Controller职责**：
- 分区Leader选举
- ISR管理
- 元数据管理

### 4.2 RocketMQ DLedger模式

```properties
# 启用DLedger
enableDLegerCommitLog=true

# DLedger组
dLegerGroup=broker-a

# DLedger节点
dLegerPeers=n0-127.0.0.1:40911;n1-127.0.0.1:40912;n2-127.0.0.1:40913

# 当前节点ID
dLegerSelfId=n0
```

**DLedger优势**：
- 基于Raft协议
- 自动选举
- 无需手动配置主从

---

## 5. 选举配置

### 5.1 Kafka Leader选举

```properties
# 不洁选举（不推荐）
unclean.leader.election.enable=false

# 首选副本选举（自动）
auto.leader.rebalance.enable=true

# 选举检查间隔（5分钟）
leader.imbalance.check.interval.seconds=300
```

### 5.2 RabbitMQ Master选举

仲裁队列自动选举，无需配置。

---

## 6. 动态配置管理

### 6.1 Kafka动态配置

```bash
# 查看Broker配置
kafka-configs.sh --describe \
  --entity-type brokers \
  --entity-name 0 \
  --bootstrap-server localhost:9092

# 修改Broker配置
kafka-configs.sh --alter \
  --entity-type brokers \
  --entity-name 0 \
  --add-config num.network.threads=16 \
  --bootstrap-server localhost:9092
```

### 6.2 配置中心集成

```yaml
# Spring Cloud Config集成
spring:
  cloud:
    config:
      uri: http://config-server:8888
  kafka:
    bootstrap-servers: ${kafka.bootstrap-servers}
```

---

## 7. 集群健康检查

### 7.1 Kafka健康检查

```bash
# 查看Broker列表
kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# 查看Topic列表
kafka-topics.sh --list --bootstrap-server localhost:9092

# 查看消费者组
kafka-consumer-groups.sh --list --bootstrap-server localhost:9092
```

### 7.2 RocketMQ健康检查

```bash
# 查看集群状态
mqadmin clusterList -n localhost:9876

# 查看Broker状态
mqadmin brokerStatus -n localhost:9876 -b broker-a
```

### 7.3 RabbitMQ健康检查

```bash
# 查看集群状态
rabbitmqctl cluster_status

# 查看节点状态
rabbitmqctl node_health_check
```

---

## 关键要点

1. **Kafka KRaft**：去Zookeeper，简化运维
2. **RocketMQ NameServer**：无状态，任意节点可用
3. **RabbitMQ仲裁队列**：Raft协议，强一致性
4. **自动选举**：Controller/Master自动选举
5. **动态配置**：运行时修改配置

---

## 深入一点

**Kafka KRaft vs Zookeeper**：

```
Zookeeper模式：
- 依赖Zookeeper
- 元数据存储在Zookeeper
- Controller从Zookeeper选举
- 运维复杂

KRaft模式：
- 去Zookeeper
- 元数据存储在Kafka
- Controller基于Raft选举
- 简化运维
- 性能更好
```

**RabbitMQ仲裁队列vs镜像队列**：

```
镜像队列：
- 主从复制
- 最终一致性
- 性能较高

仲裁队列：
- Raft协议
- 强一致性
- 自动选举
- 性能略低
- 推荐使用
```

---

## 参考资料

1. [Kafka KRaft](https://kafka.apache.org/documentation/#kraft)
2. [RocketMQ DLedger](https://rocketmq.apache.org/docs/deploymentOperations/01deploy/)
3. [RabbitMQ Clustering](https://www.rabbitmq.com/clustering.html)

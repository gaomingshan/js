# Kafka 部署指南

> 版本：3.7+ | 系统：CentOS 7.9+ / Ubuntu 22.04+
> 部署模式：KRaft（去 ZooKeeper）

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|---------|---------|------|
| 单机 KRaft | 1 核 / 2G | 2 核 / 4G | 50G SSD |
| 3 节点 KRaft 集群 | 3 × 2 核 / 4G | 3 × 4 核 / 16G | 3 × 200G SSD |
| 生产集群（3+3） | 6 × 2 核 / 4G | 6 × 8 核 / 32G | 6 × 500G SSD |

---

## 2. 裸机安装（通用）

```bash
# 下载（以 3.7.0 为例）
wget https://downloads.apache.org/kafka/3.7.0/kafka_2.13-3.7.0.tgz
tar xzf kafka_2.13-3.7.0.tgz -C /opt
ln -s /opt/kafka_2.13-3.7.0 /opt/kafka

# 创建数据目录
mkdir -p /data/kafka/data
```

---

## 3. 单机部署

**适用场景**：开发测试、本地验证

### 配置文件

```bash
cat > /opt/kafka/config/server.properties << 'EOF'
node.id=1
process.roles=broker,controller
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
advertised.listeners=PLAINTEXT://localhost:9092
controller.listener.names=CONTROLLER
listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
controller.quorum.voters=1@localhost:9093

log.dirs=/data/kafka/data
num.partitions=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1
auto.create.topics.enable=true
EOF
```

### 启动

```bash
# 生成 Cluster ID
KAFKA_CLUSTER_ID=$(/opt/kafka/bin/kafka-storage.sh random-uuid)

# 格式化存储目录
/opt/kafka/bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c /opt/kafka/config/server.properties

# 启动
/opt/kafka/bin/kafka-server-start.sh -daemon /opt/kafka/config/server.properties
```

### 验证

```bash
# 创建测试 topic
/opt/kafka/bin/kafka-topics.sh --create --topic test --partitions 1 --replication-factor 1 --bootstrap-server localhost:9092

# 列出 topic
/opt/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092

# 生产-消费验证
echo "hello" | /opt/kafka/bin/kafka-console-producer.sh --topic test --bootstrap-server localhost:9092
/opt/kafka/bin/kafka-console-consumer.sh --topic test --from-beginning --bootstrap-server localhost:9092
```

### Docker Compose

```yaml
services:
  kafka:
    image: apache/kafka:3.7.0
    container_name: kafka
    hostname: kafka
    restart: unless-stopped
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@localhost:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      CLUSTER_ID: MkU3OEVBNTcwNTJENDxCRkpIQ0ZQ
    volumes:
      - kafka-data:/var/lib/kafka/data

volumes:
  kafka-data:
```

---

## 4. 集群部署

### 4.1 KRaft 集群（combined 角色）

**适用场景**：中小规模生产，节点数 3-5

### 节点规划

| 节点 | hostname | IP | 角色 | 端口 |
|------|----------|----|------|------|
| 1 | kafka-1 | 192.168.1.10 | broker,controller | 9092 / 9093 |
| 2 | kafka-2 | 192.168.1.11 | broker,controller | 9092 / 9093 |
| 3 | kafka-3 | 192.168.1.12 | broker,controller | 9092 / 9093 |

### 配置文件

节点 1 (kafka-1)：

```bash
cat > /opt/kafka/config/server.properties << 'EOF'
node.id=1
process.roles=broker,controller
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
advertised.listeners=PLAINTEXT://kafka-1:9092
controller.listener.names=CONTROLLER
listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
controller.quorum.voters=1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093

log.dirs=/data/kafka/data
num.partitions=6
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=2
min.insync.replicas=2

log.retention.hours=168
log.segment.bytes=1073741824

num.network.threads=8
num.io.threads=16

auto.create.topics.enable=false
EOF
```

节点 2 (kafka-2)：`node.id=2`，`advertised.listeners=PLAINTEXT://kafka-2:9092`

节点 3 (kafka-3)：`node.id=3`，`advertised.listeners=PLAINTEXT://kafka-3:9092`

其余配置相同。

### 启动

```bash
# 任选一个节点生成 Cluster ID（全局唯一）
KAFKA_CLUSTER_ID=$(/opt/kafka/bin/kafka-storage.sh random-uuid)
echo $KAFKA_CLUSTER_ID  # 记下此值，所有节点共用

# 所有节点格式化
/opt/kafka/bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c /opt/kafka/config/server.properties

# 所有节点启动
/opt/kafka/bin/kafka-server-start.sh -daemon /opt/kafka/config/server.properties
```

### 验证

```bash
/opt/kafka/bin/kafka-topics.sh --create --topic test --partitions 3 --replication-factor 3 --bootstrap-server kafka-1:9092
/opt/kafka/bin/kafka-topics.sh --describe --topic test --bootstrap-server kafka-1:9092
# 确认 3 个副本都在 ISR 中
```

### Docker Compose

```yaml
services:
  kafka-1:
    image: apache/kafka:3.7.0
    container_name: kafka-1
    hostname: kafka-1
    restart: unless-stopped
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-1:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      CLUSTER_ID: MkU3OEVBNTcwNTJENDxCRkpIQ0ZQ
    volumes:
      - kafka-1-data:/var/lib/kafka/data
    networks:
      - kafka-net

  kafka-2:
    image: apache/kafka:3.7.0
    container_name: kafka-2
    hostname: kafka-2
    restart: unless-stopped
    environment:
      KAFKA_NODE_ID: 2
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-2:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      CLUSTER_ID: MkU3OEVBNTcwNTJENDxCRkpIQ0ZQ
    volumes:
      - kafka-2-data:/var/lib/kafka/data
    networks:
      - kafka-net

  kafka-3:
    image: apache/kafka:3.7.0
    container_name: kafka-3
    hostname: kafka-3
    restart: unless-stopped
    environment:
      KAFKA_NODE_ID: 3
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-3:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      CLUSTER_ID: MkU3OEVBNTcwNTJENDxCRkpIQ0ZQ
    volumes:
      - kafka-3-data:/var/lib/kafka/data
    networks:
      - kafka-net

volumes:
  kafka-1-data:
  kafka-2-data:
  kafka-3-data:

networks:
  kafka-net:
    driver: bridge
```

### 4.2 生产集群（3 Controller + 3 Broker 分离）

**适用场景**：大规模生产，元数据与数据负载分离

### 节点规划

| 节点 | hostname | IP | 角色 | 端口 |
|------|----------|----|------|------|
| C1 | controller-1 | 192.168.1.10 | controller | 9093 |
| C2 | controller-2 | 192.168.1.11 | controller | 9093 |
| C3 | controller-3 | 192.168.1.12 | controller | 9093 |
| B1 | broker-1 | 192.168.1.20 | broker | 9092 |
| B2 | broker-2 | 192.168.1.21 | broker | 9092 |
| B3 | broker-3 | 192.168.1.22 | broker | 9092 |

### 配置文件

Controller 节点（所有 3 个 Controller 配置相同，仅 `node.id` 不同）：

```bash
cat > /opt/kafka/config/controller.properties << 'EOF'
node.id=1
process.roles=controller
listeners=CONTROLLER://:9093
controller.listener.names=CONTROLLER
listener.security.protocol.map=CONTROLLER:PLAINTEXT
controller.quorum.voters=1@controller-1:9093,2@controller-2:9093,3@controller-3:9093

log.dirs=/data/kafka/controller-data
EOF
```

Controller 2：`node.id=2`
Controller 3：`node.id=3`

Broker 节点（所有 3 个 Broker 配置相同，仅 `node.id` 和 `advertised.listeners` 不同）：

```bash
cat > /opt/kafka/config/broker.properties << 'EOF'
node.id=101
process.roles=broker
listeners=PLAINTEXT://:9092
advertised.listeners=PLAINTEXT://broker-1:9092
controller.quorum.voters=1@controller-1:9093,2@controller-2:9093,3@controller-3:9093

log.dirs=/data/kafka/broker-data
num.partitions=6
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=2
min.insync.replicas=2

log.retention.hours=168
log.segment.bytes=1073741824

num.network.threads=8
num.io.threads=16

auto.create.topics.enable=false
EOF
```

Broker 2：`node.id=102`，`advertised.listeners=PLAINTEXT://broker-2:9092`
Broker 3：`node.id=103`，`advertised.listeners=PLAINTEXT://broker-3:9092`

### 启动

```bash
# 生成 Cluster ID
KAFKA_CLUSTER_ID=$(/opt/kafka/bin/kafka-storage.sh random-uuid)

# 所有 6 个节点格式化（各自的配置文件）
/opt/kafka/bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c /opt/kafka/config/controller.properties  # controller 节点
/opt/kafka/bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c /opt/kafka/config/broker.properties      # broker 节点

# 先启动所有 Controller
/opt/kafka/bin/kafka-server-start.sh -daemon /opt/kafka/config/controller.properties

# 再启动所有 Broker
/opt/kafka/bin/kafka-server-start.sh -daemon /opt/kafka/config/broker.properties
```

### 验证

```bash
# 查看 broker 列表（应显示 3 个 broker）
/opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server broker-1:9092

# 创建 topic 验证
/opt/kafka/bin/kafka-topics.sh --create --topic orders --partitions 6 --replication-factor 3 --bootstrap-server broker-1:9092
/opt/kafka/bin/kafka-topics.sh --describe --topic orders --bootstrap-server broker-1:9092
```

---

## 5. 运维速查

### 常用命令

```bash
# Topic 管理
kafka-topics.sh --create --topic <name> --partitions <n> --replication-factor <n> --bootstrap-server localhost:9092
kafka-topics.sh --describe --topic <name> --bootstrap-server localhost:9092
kafka-topics.sh --alter --topic <name> --partitions <n> --bootstrap-server localhost:9092  # 只能增加

# 消费者组
kafka-consumer-groups.sh --list --bootstrap-server localhost:9092
kafka-consumer-groups.sh --describe --group <group> --bootstrap-server localhost:9092

# 重置 offset
kafka-consumer-groups.sh --reset-offsets --group <group> --topic <topic> --to-earliest --execute --bootstrap-server localhost:9092

# 动态配置
kafka-configs.sh --alter --entity-type topics --entity-name <topic> --add-config retention.ms=86400000 --bootstrap-server localhost:9092

# 日志目录信息
kafka-log-dirs.sh --describe --bootstrap-server localhost:9092
```

### 关键告警指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| 消费者堆积 | Consumer Group Lag | 持续增长 |
| 副本不同步 | `UnderReplicatedPartitions` | > 0 |
| 离线分区 | `OfflinePartitionsCount` | > 0 |
| 主节点数量 | `ActiveControllerCount` | ≠ 1 |
| 请求排队 | `RequestQueueSize` | 持续 > 0 |
| 磁盘使用率 | OS `df` | > 80% |

---

## 6. 常见故障

### 故障 1：消息堆积（Consumer Lag）

**排查链路**：

```
现象：Consumer Lag 持续增长
  → kafka-consumer-groups.sh --describe
    → 消费者在线？
      → 否 → 启动消费者
      → 是 → 消费速度 < 生产速度
        → 增加分区 + 消费者实例
        → 优化消费逻辑
```

### 故障 2：ISR 收缩

```bash
kafka-topics.sh --describe --topic <topic> --bootstrap-server localhost:9092
# 对比 Replicas 和 ISR 列表
```

**解决**：检查落后 Broker 磁盘 IO / 网络带宽 → 重启落后 Broker → 等待同步追赶

### 故障 3：磁盘写满

```bash
# 紧急处理：临时调整保留时间
kafka-configs.sh --alter --entity-type topics --entity-name <topic> \
  --add-config retention.ms=3600000 --bootstrap-server localhost:9092

# 长期：扩容磁盘或增加 log.dirs 多目录
```

### 故障 4：Controller 选举异常

```bash
# 查看集群元数据状态
kafka-metadata-shell.sh --snapshot /tmp/kafka-metadata.log
```

**解决**：检查 Controller 节点网络连通性 → 确保 `controller.quorum.voters` 配置正确 → 重启故障 Controller

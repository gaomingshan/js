# Kafka 部署运维指南

> **定位**：分布式流处理平台，高吞吐消息队列的事实标准
> **适用场景**：日志收集、事件流、实时数据管道、流处理
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

Apache Kafka 是分布式流处理平台，以 Topic-Partition-Offset 模型组织数据，顺序写磁盘 + 零拷贝实现极高吞吐。KRaft 模式（3.3+）去除了 ZooKeeper 依赖。

### 1.2 核心概念

```
Producer → Topic (分区) → Consumer Group
              ↓
         Broker (存储)
              ↓
         KRaft Controller (元数据)
```

| 概念 | 说明 |
|------|------|
| **Broker** | Kafka 服务节点 |
| **Topic** | 消息类别，逻辑分区 |
| **Partition** | 有序消息序列，并行度单元 |
| **Consumer Group** | 消费者组，组内分区单消费 |
| **Offset** | 分区内消息偏移量 |
| **KRaft** | 内置共识协议，替代 ZooKeeper |

### 1.3 适用场景

**最佳适用**：日志收集、事件流、实时数据管道、CDC、流处理（Kafka Streams/Flink）

**不适用**：复杂路由（→ RabbitMQ）、RPC（→ gRPC）、海量 IoT 连接（→ EMQX）

---

## 2. 部署

### 2.1 裸机部署（KRaft 模式，Kafka 3.7）

```bash
# 下载
wget https://downloads.apache.org/kafka/3.7.0/kafka_2.13-3.7.0.tgz
tar xzf kafka_2.13-3.7.0.tgz && cd kafka_2.13-3.7.0

# 生成 Cluster UUID
KAFKA_CLUSTER_ID=$(/bin/kafka-storage.sh random-uuid)

# 格式化存储（每个 Controller/Broker 节点）
bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c config/kraft/server.properties

# 启动
bin/kafka-server-start.sh -daemon config/kraft/server.properties
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name kafka \
  -p 9092:9092 \
  -v kafka-data:/var/lib/kafka/data \
  -v ./conf/server.properties:/opt/kafka/config/server.properties \
  --restart unless-stopped \
  apache/kafka:3.7.0
```

### 2.3 Docker Compose 部署（3 Broker KRaft 集群）

```yaml
# docker-compose.yml
version: '3.8'

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
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      CLUSTER_ID: "MkU3OEVBNTcwNTJENDxCRkpIQ0ZQ"   # 预生成的 Cluster ID
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
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      CLUSTER_ID: "MkU3OEVBNTcwNTJENDxCRkpIQ0ZQ"
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
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      CLUSTER_ID: "MkU3OEVBNTcwNTJENDxCRkpIQ0ZQ"
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

### 2.4 生产环境部署要点

**分区规划**：
- 分区数 = 目标吞吐 / 单分区吞吐
- 单分区顺序写入约 10-20MB/s
- 分区数不宜过多（影响选举和恢复时间）

**安全清单**：SASL 认证（PLAIN/SCRAM）、TLS 加密、ACL 权限控制、网络隔离

---

## 3. 配置文件

> **核心原则**：Kafka 通过 `server.properties` 配置，以下按场景提供完整配置。

### 3.2 开发环境配置

```properties
# conf/server-dev.properties — 开发环境（单节点 KRaft）

node.id=1
process.roles=broker,controller
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
advertised.listeners=PLAINTEXT://localhost:9092
controller.listener.names=CONTROLLER
listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
controller.quorum.voters=1@localhost:9093

log.dirs=/tmp/kafka-logs
num.partitions=1
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1
```

### 3.3 测试环境配置

```properties
# conf/server-test.properties — 测试环境

node.id=1
process.roles=broker,controller
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
advertised.listeners=PLAINTEXT://kafka-1:9092
controller.listener.names=CONTROLLER
listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
controller.quorum.voters=1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093

log.dirs=/var/lib/kafka/data
num.partitions=3
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=2

# === 日志保留 ===
log.retention.hours=72            # 保留 3 天
log.segment.bytes=1073741824      # 1GB 一个 segment

# === 自动创建 ===
auto.create.topics.enable=true     # 测试环境允许自动创建
```

### 3.4 生产环境配置

```properties
# conf/server-prod.properties — 生产环境

node.id=1
process.roles=broker,controller
listeners=SASL_PLAINTEXT://:9092,CONTROLLER://:9093
advertised.listeners=SASL_PLAINTEXT://kafka-1:9092
controller.listener.names=CONTROLLER
listener.security.protocol.map=CONTROLLER:PLAINTEXT,SASL_PLAINTEXT:SASL_PLAINTEXT
controller.quorum.voters=1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093

log.dirs=/data/kafka/log1,/data/kafka/log2   # 多目录多磁盘

# === 分区 ===
num.partitions=6                   # 默认分区数（按需调整）
num.recovery.threads.per.data.dir=2  # 恢复线程

# === 副本 ===
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=2
min.insync.replicas=2              # 最小同步副本数，与 acks=all 配合保证不丢

# === 日志保留 ===
log.retention.hours=168            # 保留 7 天
log.retention.check.interval.ms=300000
log.segment.bytes=1073741824       # 1GB 一个 segment
log.segment.delete.delay.ms=60000

# === 日志压缩（可选，Change Log 场景）===
# log.cleanup.policy=compact
# log.cleaner.min.cleanable.ratio=0.5

# === 网络 ===
num.network.threads=8              # 网络线程数（处理请求）
num.io.threads=16                  # IO 线程数（磁盘操作）
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600 # 最大请求 100MB

# === 消息大小 ===
message.max.bytes=1048576          # 单消息最大 1MB
# 大消息场景需增大此值，但影响内存使用和磁盘 IO

# === 拉取配置 ===
fetch.max.bytes=5767168            # 消费者单次拉取最大 5MB
max.partition.fetch.bytes=1048576

# === 复制 ===
replica.fetch.max.bytes=1048576
replica.fetch.wait.max.ms=500
replica.lag.time.max.ms=10000      # 副本落后超过 10 秒移出 ISR

# === 组协调 ===
group.initial.rebalance.delay.ms=3000  # 初始再平衡等待 3 秒
group.min.session.timeout.ms=6000
group.max.session.timeout.ms=300000

# === 自动创建 ===
auto.create.topics.enable=false    # 生产禁止自动创建

# === 安全（SASL）===
sasl.enabled.mechanisms=PLAIN
sasl.mechanism.inter.broker.protocol=PLAIN
sasl.mechanism.controller.protocol=PLAIN

# === JVM（通过环境变量 KAFKA_HEAP_OPTS）===
# KAFKA_HEAP_OPTS=-Xmx6g -Xms6g
```

---

## 4. 调优

### 4.1 内存子系统（JVM）

**核心逻辑**：Kafka 依赖 OS 页缓存而非 JVM 堆。JVM 堆只需 6-8G，剩余内存留给 OS 做页缓存。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `KAFKA_HEAP_OPTS` | JVM 堆大小 | 6G-8G | **不要设太大**。Kafka 数据缓存依赖 OS 页缓存，JVM 堆太大反而减少 OS 缓存 |
| `log.dirs` | 日志目录 | 多目录多磁盘 | 多磁盘并行 IO，提升吞吐。`/disk1/kafka,/disk2/kafka` |
| 文件系统 | 底层文件系统 | XFS | XFS 对大文件顺序写性能优于 ext4。**必须 noatime 挂载** |

### 4.2 IO 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `num.io.threads` | IO 线程数 | 磁盘数 × 2 | 处理磁盘读写请求。SSD 可设更高 |
| `log.flush.interval.messages` | 刷盘消息数 | 不设（依赖 OS） | Kafka 设计依赖 OS 刷盘而非应用 fsync。设太小严重降低性能 |
| `log.flush.interval.ms` | 刷盘间隔 | 不设 | 同上。让 OS 管理刷盘时机 |
| `log.segment.bytes` | Segment 大小 | 1GB | 太小 → 频繁滚动；太大 → 文件过大 |

### 4.3 网络子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `num.network.threads` | 网络线程 | 8+ | 处理入站/出站请求。CPU 使用率高时增大 |
| `socket.send/receive.buffer` | Socket 缓冲 | 102400 | 高延迟网络需增大 |
| `message.max.bytes` | 最大消息 | 1MB | 增大需同步调整 `replica.fetch.max.bytes` 和消费者 `fetch.max.bytes` |

### 4.4 副本子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `min.insync.replicas` | 最小同步副本 | 2 | 配合 `acks=all` 保证至少 2 副本写入成功。设 1 可能丢数据 |
| `replica.lag.time.max.ms` | 副本落后超时 | 10000 | 超过此时间未追赶则移出 ISR。设太小 → ISR 频繁收缩 |
| `unclean.leader.election.enable` | 脏选举 | false | 非 ISR 副本能否当选 Leader。设 true 可能丢数据；设 false 可能不可用 |

### 4.5 容量规划

| 规模 | Broker | CPU | 内存 | 磁盘 | 分区/ Broker | TPS |
|------|--------|-----|------|------|-------------|-----|
| 小型 | 3 | 4 核 | 16G | 500G SSD | 100 | < 5 万 |
| 中型 | 5 | 8 核 | 32G | 2T SSD | 500 | 5-20 万 |
| 大型 | 10+ | 16 核 | 64G | 4T NVMe | 1000 | 20 万+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# Topic 管理
bin/kafka-topics.sh --create --topic orders --partitions 6 --replication-factor 3 --bootstrap-server localhost:9092
bin/kafka-topics.sh --describe --topic orders --bootstrap-server localhost:9092
bin/kafka-topics.sh --alter --topic orders --partitions 12 --bootstrap-server localhost:9092  # 只能增不能减

# 消费者组
bin/kafka-consumer-groups.sh --list --bootstrap-server localhost:9092
bin/kafka-consumer-groups.sh --describe --group order-group --bootstrap-server localhost:9092

# 重置 Offset
bin/kafka-consumer-groups.sh --reset-offsets --group order-group --topic orders --to-earliest --execute --bootstrap-server localhost:9092

# 配置修改
bin/kafka-configs.sh --alter --entity-type topics --entity-name orders --add-config retention.ms=86400000 --bootstrap-server localhost:9092
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **消息堆积** | Consumer Group Lag | 持续增长 |
| **ISR 缩小** | `UnderReplicatedPartitions` | > 0 |
| **Offline 分区** | `OfflinePartitionsCount` | > 0 |
| **活跃 Controller** | `ActiveControllerCount` | ≠ 1 |
| **网络请求队列** | `RequestQueueSize` | 持续 > 0 |
| **磁盘使用率** | OS `df` | > 80% |

**Prometheus（kafka_exporter）**：

```bash
docker run -d \
  --name kafka-exporter \
  -p 9308:9308 \
  -e KAFKA_SERVER=kafka-1:9092 \
  danielqsj/kafka-exporter
```

### 5.3 备份与恢复

```bash
# MirrorMaker 2（跨集群复制）
bin/kafka-mirror-maker-2.sh \
  --replication.config.file mm2.properties

# Topic 数据导出
bin/kafka-console-consumer.sh --topic orders --from-beginning --bootstrap-server localhost:9092 > orders_backup.txt
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：消息堆积（Consumer Lag）

**排查链路**：

```
现象：Consumer Lag 持续增长
  → kafka-consumer-groups.sh --describe
    → 消费者是否在线？
      → 否 → 重启消费者
      → 是 → 消费速度 < 生产速度
        → 增加分区数 + 消费者实例
        → 优化消费者处理逻辑
```

#### 故障 2：ISR 缩小

**排查**：

```bash
bin/kafka-topics.sh --describe --topic orders --bootstrap-server localhost:9092
# ISR 列表 < 副本列表 → 有副本落后
```

**解决**：检查落后 Broker 磁盘/网络 → 重启落后 Broker → 等待自动追赶

#### 故障 3：Leader 均衡

```bash
# 查看分区 Leader 分布
bin/kafka-topics.sh --describe --topic orders --bootstrap-server localhost:9092

# 重新均衡
bin/kafka-leader-election.sh --bootstrap-server localhost:9092 \
  --election-type preferred-replica
```

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `kafka-topics.sh` | Topic 管理 |
| `kafka-consumer-groups.sh` | 消费者组管理 |
| `kafka-configs.sh` | 动态配置 |
| `kafka-log-dirs.sh` | 日志目录查询 |
| JMX + Prometheus | 指标监控 |

---

## 7. 参考资料

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Kafka KRaft Mode](https://kafka.apache.org/documentation/#kraft)
- [Kafka Configuration](https://kafka.apache.org/documentation/#brokerconfigs)
- [kafka_exporter](https://github.com/danielqsj/kafka-exporter)

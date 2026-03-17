# Broker 配置详解

## 概述

Broker是消息队列的核心组件，合理的配置直接影响集群的性能、可靠性和稳定性。本章系统讲解三大消息队列Broker的核心配置参数。

---

## 1. Kafka Broker 核心配置

### 1.1 基础配置

```properties
# server.properties

# Broker ID（集群内唯一）
broker.id=0

# 监听地址
listeners=PLAINTEXT://:9092

# 广播地址（客户端连接地址）
advertised.listeners=PLAINTEXT://192.168.1.100:9092

# 日志目录（支持多个，逗号分隔）
log.dirs=/var/kafka-logs-1,/var/kafka-logs-2

# Zookeeper连接（Zookeeper模式）
zookeeper.connect=localhost:2181/kafka

# KRaft模式配置
process.roles=broker,controller
node.id=1
controller.quorum.voters=1@localhost:9093
```

### 1.2 副本配置

```properties
# 默认副本数
default.replication.factor=3

# 最小同步副本数
min.insync.replicas=2

# 副本拉取线程数
num.replica.fetchers=4

# 副本拉取最大字节数
replica.fetch.max.bytes=1048576

# 副本同步超时（10秒）
replica.lag.time.max.ms=10000

# 不洁选举（不推荐）
unclean.leader.election.enable=false
```

### 1.3 网络配置

```properties
# 网络线程数
num.network.threads=8

# I/O线程数
num.io.threads=16

# Socket缓冲区
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600

# 连接空闲超时（9分钟）
connections.max.idle.ms=540000
```

### 1.4 日志配置

```properties
# 日志保留时间（7天）
log.retention.hours=168

# 日志保留大小（-1=无限制）
log.retention.bytes=-1

# 日志段大小（1GB）
log.segment.bytes=1073741824

# 日志段时间（7天）
log.segment.ms=604800000

# 日志清理检查间隔（5分钟）
log.retention.check.interval.ms=300000

# 日志清理策略（delete/compact）
log.cleanup.policy=delete
```

### 1.5 Topic自动创建

```properties
# 自动创建Topic（生产环境建议禁用）
auto.create.topics.enable=false

# 默认分区数
num.partitions=3
```

### 1.6 JVM配置

```bash
# kafka-server-start.sh
export KAFKA_HEAP_OPTS="-Xmx6G -Xms6G"
export KAFKA_JVM_PERFORMANCE_OPTS="-XX:+UseG1GC -XX:MaxGCPauseMillis=20"
```

---

## 2. RocketMQ Broker 配置

### 2.1 基础配置

```properties
# broker.conf

# Broker名称（主从必须相同）
brokerName=broker-a

# Broker ID（0=Master，非0=Slave）
brokerId=0

# NameServer地址
namesrvAddr=192.168.1.101:9876;192.168.1.102:9876

# 监听端口
listenPort=10911
```

### 2.2 存储配置

```properties
# 存储路径
storePathRootDir=/data/rocketmq/store
storePathCommitLog=/data/rocketmq/store/commitlog
storePathConsumeQueue=/data/rocketmq/store/consumequeue
storePathIndex=/data/rocketmq/store/index

# CommitLog文件大小（1GB）
mappedFileSizeCommitLog=1073741824

# ConsumeQueue文件大小（6MB）
mappedFileSizeConsumeQueue=6000000

# 是否启用索引
messageIndexEnable=true
```

### 2.3 HA配置

```properties
# Broker角色
brokerRole=ASYNC_MASTER
# 可选：ASYNC_MASTER, SYNC_MASTER, SLAVE

# 刷盘策略
flushDiskType=ASYNC_FLUSH
# 可选：ASYNC_FLUSH, SYNC_FLUSH

# 同步刷盘超时（5秒）
syncFlushTimeout=5000

# 主从同步超时（5秒）
syncMasterFlushSlaveMaxTimeout=5000
```

### 2.4 清理配置

```properties
# 文件保留时间（48小时）
fileReservedTime=48

# 删除文件的时间点（凌晨4点）
deleteWhen=04

# 磁盘使用率阈值（90%）
diskMaxUsedSpaceRatio=90

# 强制清理阈值（95%）
diskSpaceCleanForciblyRatio=0.95
```

### 2.5 性能配置

```properties
# 发送消息线程池
sendMessageThreadPoolNums=16

# 拉取消息线程池
pullMessageThreadPoolNums=16

# 查询消息线程池
queryMessageThreadPoolNums=8

# 是否预分配文件
warmMapedFileEnable=true
```

---

## 3. RabbitMQ Broker 配置

### 3.1 基础配置

```conf
# rabbitmq.conf

# 监听地址
listeners.tcp.default = 5672

# 管理插件端口
management.tcp.port = 15672

# 虚拟主机
default_vhost = /

# 日志级别
log.console.level = info
log.file.level = info
```

### 3.2 内存配置

```conf
# 内存阈值（相对值，40%）
vm_memory_high_watermark.relative = 0.6

# 内存阈值（绝对值）
# vm_memory_high_watermark.absolute = 2GB

# 内存阈值Paging（90%）
vm_memory_high_watermark_paging_ratio = 0.9
```

### 3.3 磁盘配置

```conf
# 磁盘空间阈值
disk_free_limit.absolute = 50GB

# 或相对值
# disk_free_limit.relative = 0.5
```

### 3.4 集群配置

```conf
# 集群名称
cluster_name = rabbitmq-cluster

# 集群分区处理（autoheal/pause_minority/ignore）
cluster_partition_handling = autoheal
```

### 3.5 性能配置

```conf
# 连接最大数
# connection_max = 65536

# 通道最大数
channel_max = 2047

# 心跳超时（60秒）
heartbeat = 60

# 消息最大大小（128MB）
max_message_size = 134217728
```

---

## 4. 配置对比

| 配置项 | Kafka | RocketMQ | RabbitMQ |
|--------|-------|----------|----------|
| 副本数 | default.replication.factor | - | 镜像队列 |
| 存储路径 | log.dirs | storePathRootDir | mnesia目录 |
| 保留时间 | log.retention.hours | fileReservedTime | TTL |
| 刷盘策略 | OS控制 | SYNC/ASYNC_FLUSH | fsync |
| 网络线程 | num.network.threads | - | 默认 |
| I/O线程 | num.io.threads | sendMessageThreadPoolNums | - |

---

## 5. 配置最佳实践

### 5.1 Kafka生产环境

```properties
broker.id=0
default.replication.factor=3
min.insync.replicas=2
unclean.leader.election.enable=false
auto.create.topics.enable=false
log.retention.hours=168
num.network.threads=8
num.io.threads=16
```

### 5.2 RocketMQ生产环境

```properties
brokerRole=SYNC_MASTER
flushDiskType=ASYNC_FLUSH
fileReservedTime=72
deleteWhen=04
autoCreateTopicEnable=false
sendMessageThreadPoolNums=16
```

### 5.3 RabbitMQ生产环境

```conf
vm_memory_high_watermark.relative = 0.6
disk_free_limit.absolute = 50GB
cluster_partition_handling = autoheal
heartbeat = 60
```

---

## 关键要点

1. **副本配置**：default.replication.factor=3
2. **自动创建**：生产环境禁用auto.create.topics.enable
3. **网络线程**：根据负载调整num.network.threads
4. **内存配置**：RabbitMQ内存阈值60%
5. **刷盘策略**：RocketMQ异步刷盘平衡性能和可靠性

---

## 深入一点

**Kafka ISR机制**：

```
ISR（In-Sync Replicas）：
- Leader维护ISR列表
- Follower落后超过replica.lag.time.max.ms，移出ISR
- acks=all时，等待所有ISR确认

ISR收缩：
- Follower网络延迟
- Follower处理慢
- 影响：可能降低可靠性

ISR扩张：
- Follower追上Leader
- 自动加入ISR
```

**RocketMQ主从同步**：

```
SYNC_MASTER：
- 同步复制，等待Slave确认
- 高可靠性，性能较低

ASYNC_MASTER：
- 异步复制，不等Slave
- 高性能，Master故障可能丢失

DLedger模式：
- 基于Raft协议
- 自动选举，高可用
```

---

## 参考资料

1. [Kafka Broker Configs](https://kafka.apache.org/documentation/#brokerconfigs)
2. [RocketMQ Broker](https://rocketmq.apache.org/docs/deploymentOperations/01deploy/)
3. [RabbitMQ Configuration](https://www.rabbitmq.com/configure.html)

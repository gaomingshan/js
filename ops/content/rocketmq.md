# RocketMQ 部署运维指南

> **定位**：阿里开源的分布式消息中间件，金融级可靠消息
> **适用场景**：交易消息、顺序消息、延迟消息、事务消息
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

Apache RocketMQ 是阿里开源的分布式消息中间件，以高可靠、低延迟著称，原生支持顺序消息、事务消息、延迟消息、消息回溯等金融级特性。

### 1.2 核心架构

```
Producer → NameServer (路由) → Broker (存储) → Consumer
                 ↓
           Topic + Queue
```

| 组件 | 职责 | 部署数量 |
|------|------|----------|
| **NameServer** | 路由注册与发现，无状态 | ≥ 2（独立部署） |
| **Broker** | 消息存储，Master+Slave | ≥ 2（主从对） |
| **Producer** | 消息发送 | 应用侧 |
| **Consumer** | 消息消费 | 应用侧 |

### 1.3 适用场景

**最佳适用**：金融交易消息（事务消息）、顺序消息、延迟消息、消息回溯、高可靠场景

**不适用**：超高吞吐日志（→ Kafka）、IoT 海量连接（→ EMQX）、复杂路由（→ RabbitMQ）

---

## 2. 部署

### 2.1 裸机部署

```bash
# 下载
wget https://archive.apache.org/dist/rocketmq/5.2.0/rocketmq-all-5.2.0-bin-release.zip
unzip rocketmq-all-5.2.0-bin-release.zip && cd rocketmq-all-5.2.0

# 启动 NameServer
nohup bin/mqnamesrv &

# 启动 Broker
nohup bin/mqbroker -n localhost:9876 &

# 验证
bin/mqadmin clusterList -n localhost:9876
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name rocketmq-namesrv \
  -p 9876:9876 \
  -v rmq-namesrv-logs:/home/rocketmq/logs \
  apache/rocketmq:5.2.0 \
  sh mqnamesrv

docker run -d \
  --name rocketmq-broker \
  -p 10911:10911 \
  -v rmq-broker-logs:/home/rocketmq/logs \
  -v rmq-broker-store:/home/rocketmq/store \
  -v ./conf/broker.conf:/home/rocketmq/conf/broker.conf \
  apache/rocketmq:5.2.0 \
  sh mqbroker -n rocketmq-namesrv:9876 -c /home/rocketmq/conf/broker.conf
```

### 2.3 Docker Compose 部署（主从）

```yaml
# docker-compose.yml
version: '3.8'

services:
  namesrv:
    image: apache/rocketmq:5.2.0
    container_name: rmq-namesrv
    restart: unless-stopped
    ports:
      - "9876:9876"
    command: sh mqnamesrv
    networks:
      - rmq-net

  broker-master:
    image: apache/rocketmq:5.2.0
    container_name: rmq-broker-master
    restart: unless-stopped
    ports:
      - "10911:10911"
    environment:
      NAMESRV_ADDR: namesrv:9876
    volumes:
      - broker-master-store:/home/rocketmq/store
      - broker-master-logs:/home/rocketmq/logs
      - ./conf/broker-master.conf:/home/rocketmq/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/conf/broker.conf
    depends_on:
      - namesrv
    networks:
      - rmq-net

  broker-slave:
    image: apache/rocketmq:5.2.0
    container_name: rmq-broker-slave
    restart: unless-stopped
    ports:
      - "10921:10911"
    environment:
      NAMESRV_ADDR: namesrv:9876
    volumes:
      - broker-slave-store:/home/rocketmq/store
      - broker-slave-logs:/home/rocketmq/logs
      - ./conf/broker-slave.conf:/home/rocketmq/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/conf/broker.conf
    depends_on:
      - namesrv
      - broker-master
    networks:
      - rmq-net

  dashboard:
    image: apacherocketmq/rocketmq-dashboard:latest
    container_name: rmq-dashboard
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      JAVA_OPTS: "-Drocketmq.namesrv.addr=namesrv:9876"
    depends_on:
      - namesrv
    networks:
      - rmq-net

volumes:
  broker-master-store:
  broker-slave-store:
  broker-master-logs:
  broker-slave-logs:

networks:
  rmq-net:
    driver: bridge
```

### 2.4 生产环境部署要点

**Broker 集群模式**：

| 模式 | 架构 | 自动故障转移 | 推荐场景 |
|------|------|-------------|----------|
| **主从** | 1 Master + 1 Slave | 否（手动切换） | 简单场景 |
| **Dledger** | 主从 + Dledger | 是（自动选举） | 生产推荐 |
| **Controller** | 5.x + Controller 模式 | 是（自动选举） | 5.x 新部署 |

**安全清单**：ACL 权限控制、TLS 加密、NameServer 内网部署

---

## 3. 配置文件

### 3.2 开发环境配置

```properties
# conf/broker-dev.conf — 开发环境
brokerClusterName=DefaultCluster
brokerName=broker-a
brokerId=0
namesrvAddr=localhost:9876
defaultTopicQueueNums=4
autoCreateTopicEnable=true
autoCreateSubscriptionGroup=true
storePathRootDir=/home/rocketmq/store
storePathCommitLog=/home/rocketmq/store/commitlog
```

### 3.3 生产环境配置 — Master

```properties
# conf/broker-master.conf — 生产 Master

brokerClusterName=ProdCluster
brokerName=broker-a
brokerId=0                          # 0 = Master
namesrvAddr=10.0.0.1:9876;10.0.0.2:9876

# === 网络 ===
brokerIP1=10.0.0.10                # 对外 IP（多网卡必须指定）
listenPort=10911

# === 存储 ===
storePathRootDir=/data/rocketmq/store
storePathCommitLog=/data/rocketmq/store/commitlog
storePathConsumeQueue=/data/rocketmq/store/consumequeue
storePathIndex=/data/rocketmq/store/index
storeCheckpoint=/data/rocketmq/store/checkpoint
abortFile=/data/rocketmq/store/abort

# === 刷盘策略 ===
# ASYNC_FLUSH → 异步刷盘，性能好，最多丢少量数据
# SYNC_FLUSH → 同步刷盘，最安全但性能差
flushDiskType=ASYNC_FLUSH

# === 复制策略 ===
# ASYNC_MASTER → 异步复制，低延迟，主故障可能丢少量数据
# SYNC_MASTER → 同步复制，主从一致，主故障不丢数据
brokerRole=SYNC_MASTER

# === 消息大小 ===
maxMessageSize=4194304             # 4MB

# === 线程池 ===
sendMessageThreadPoolNums=16       # 发送线程数
pullMessageThreadPoolNums=16       # 拉取线程数
queryThreadPoolNums=8

# === 内存 ===
# RocketMQ 使用 mmap + 堆外内存，JVM 堆不需太大
# 通过 JAVA_OPT 调整：-server -Xmx4g -Xms4g -Xmn2g

# === 自动创建 ===
autoCreateTopicEnable=false        # 生产禁止自动创建
autoCreateSubscriptionGroup=false

# === 删除策略 ===
deleteWhen=04                      # 凌晨 4 点删除过期文件
fileReservedTime=72                # 保留 72 小时
deleteCommitLogFilesInterval=100
deleteConsumeQueueFilesInterval=50

# === 其他 ===
maxTopicSize=1024
defaultTopicQueueNums=8
```

### 3.4 生产环境配置 — Slave

```properties
# conf/broker-slave.conf — 生产 Slave

brokerClusterName=ProdCluster
brokerName=broker-a                 # 与 Master 同名
brokerId=1                          # 非 0 = Slave
namesrvAddr=10.0.0.1:9876;10.0.0.2:9876

brokerIP1=10.0.0.11
listenPort=10911

# === 复制 ===
brokerRole=SLAVE                   # Slave 角色
flushDiskType=ASYNC_FLUSH

# === 存储（独立目录）===
storePathRootDir=/data/rocketmq/store
storePathCommitLog=/data/rocketmq/store/commitlog

# === 其他同 Master ===
autoCreateTopicEnable=false
autoCreateSubscriptionGroup=false
deleteWhen=04
fileReservedTime=72
```

---

## 4. 调优

### 4.1 IO 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `flushDiskType` | 刷盘策略 | ASYNC_FLUSH | 异步刷盘性能好，最多丢页缓存中少量数据。金融场景用 SYNC_FLUSH |
| `brokerRole` | 复制策略 | SYNC_MASTER | 同步复制保证主从一致。ASYNC_MASTER 性能更好但可能丢数据 |
| `sendMessageThreadPoolNums` | 发送线程 | 16 | 增大可提高发送并发度 |
| `osPageCacheBusyTimeMills` | 页缓存忙超时 | 1000 | 超时后降级为堆外内存写入 |

### 4.2 JVM 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `-Xmx` | 堆最大值 | 4G-8G | RocketMQ 主要用堆外内存（mmap），JVM 堆不需太大 |
| `-Xms` | 堆初始值 | = Xmx | 避免堆动态伸缩 |
| `-XX:MaxDirectMemorySize` | 堆外内存 | 8G+ | CommitLog 写入使用堆外内存，需保证足够 |

### 4.3 容量规划

| 规模 | Broker | CPU | 内存 | 磁盘 | TPS |
|------|--------|-----|------|------|-----|
| 小型 | 2（主从） | 4 核 | 8G | 200G SSD | < 2 万 |
| 中型 | 4（2主2从） | 8 核 | 16G | 1T SSD | 2-10 万 |
| 大型 | 6+ | 16 核 | 32G | 2T NVMe | 10 万+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 集群状态
bin/mqadmin clusterList -n namesrv:9876
bin/mqadmin brokerStatus -n namesrv:9876 -b broker-a

# Topic 管理
bin/mqadmin topicList -n namesrv:9876
bin/mqadmin topicStatus -n namesrv:9876 -t orders
bin/mqadmin topicRoute -n namesrv:9876 -t orders

# 消费者组
bin/mqadmin consumerProgress -n namesrv:9876 -g order-group
bin/mqadmin consumerStatus -n namesrv:9876 -g order-group

# 发送/消费测试
bin/mqadmin sendMessage -n namesrv:9876 -t orders -p "test message"
bin/mqadmin consumeMessage -n namesrv:9876 -t orders
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **消息堆积** | `consumerProgress → Diff` | 持续增长 |
| **Broker TPS** | `brokerStatus` | 异常波动 |
| **磁盘使用率** | `brokerStatus → commitLogDirCapacity` | > 80% |
| **Slave 延迟** | `brokerStatus → masterFlushOffset` | 差距大 |

### 5.3 备份与恢复

```bash
# Topic 级别：消费进度导出
bin/mqadmin exportConsumerProgress -n namesrv:9876 -g order-group -f /backup/offset.json

# 全量：备份 store 目录（需停 Broker）
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：消息堆积

**排查**：

```bash
bin/mqadmin consumerProgress -n namesrv:9876 -g order-group
# Diff 列显示各 Queue 堆积量
```

**解决**：增加消费者实例 → 检查消费者处理性能 → 增加 Topic 队列数

#### 故障 2：Broker 磁盘满

**排查**：

```bash
bin/mqadmin brokerStatus -n namesrv:9876 -b broker-a
# commitLogDirCapacity 查看磁盘使用
```

**解决**：调整 `fileReservedTime` 缩短保留时间 → 手动清理 → 扩容磁盘

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `mqadmin` | 命令行管理 |
| RocketMQ Dashboard | Web 管理 |
| `mqtrace` | 消息轨迹追踪 |

---

## 7. 参考资料

- [Apache RocketMQ Documentation](https://rocketmq.apache.org/docs/)
- [RocketMQ Broker Configuration](https://rocketmq.apache.org/docs/4.x/broker/0brokerConfig/)
- [RocketMQ 5.x Controller Mode](https://rocketmq.apache.org/docs/5.x/controller/00controller/)

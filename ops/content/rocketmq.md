# RocketMQ 部署指南

> 版本：5.2.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| JDK | 1.8+（推荐 11） |
| 内存 | Namesrv ≥ 1G，Broker ≥ 4G |
| 磁盘 | SSD，建议独立数据盘 |
| 端口 | 9876（Namesrv），10911（Broker），10909（HA） |
| 用户 | 禁止 root 运行，创建 rocketmq 用户 |

## 2. 裸机安装（通用）

```bash
# 创建用户
useradd rocketmq -d /home/rocketmq -s /bin/bash

# 下载解压
wget https://archive.apache.org/dist/rocketmq/5.2.0/rocketmq-all-5.2.0-bin-release.zip
unzip rocketmq-all-5.2.0-bin-release.zip -d /usr/local/
ln -sf /usr/local/rocketmq-all-5.2.0 /usr/local/rocketmq

# 目录权限
mkdir -p /data/rocketmq/{store,logs}
chown -R rocketmq:rocketmq /usr/local/rocketmq /data/rocketmq

# 环境变量
cat >> /etc/profile << 'EOF'
export ROCKETMQ_HOME=/usr/local/rocketmq
export PATH=$PATH:$ROCKETMQ_HOME/bin
EOF

# JVM（开发环境缩小堆）
sed -i 's/-Xms8g -Xmx8g -Xmn4g/-Xms1g -Xmx1g -Xmn512m/g' /usr/local/rocketmq/bin/runserver.sh
sed -i 's/-Xms8g -Xmx8g/-Xms4g -Xmx4g/g' /usr/local/rocketmq/bin/runbroker.sh
```

## 3. 单机部署

**适用场景**：开发测试、功能验证

### 配置

```bash
cat > broker.conf << 'EOF'
brokerClusterName=DefaultCluster
brokerName=broker-a
brokerId=0
namesrvAddr=127.0.0.1:9876
listenPort=10911
storePathRootDir=/data/rocketmq/store
flushDiskType=ASYNC_FLUSH
autoCreateTopicEnable=true
autoCreateSubscriptionGroup=true
defaultTopicQueueNums=4
EOF
```

### 启动

```bash
su - rocketmq
nohup mqnamesrv > /data/rocketmq/logs/namesrv.log 2>&1 &
nohup mqbroker -c broker.conf > /data/rocketmq/logs/broker.log 2>&1 &
```

### 验证

```bash
mqadmin clusterList -n 127.0.0.1:9876
# BID: 0（Master）状态为 RUNNING
```

### Docker Compose

```yaml
services:
  namesrv:
    image: apache/rocketmq:5.2.0
    container_name: rmq-namesrv
    ports: ["9876:9876"]
    command: sh mqnamesrv
  broker:
    image: apache/rocketmq:5.2.0
    container_name: rmq-broker
    depends_on: [namesrv]
    ports: ["10911:10911", "10909:10909"]
    environment:
      NAMESRV_ADDR: namesrv:9876
    volumes:
      - ./broker.conf:/home/rocketmq/rocketmq-5.2.0/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/rocketmq-5.2.0/conf/broker.conf
  dashboard:
    image: apacherocketmq/rocketmq-dashboard:latest
    container_name: rmq-dashboard
    depends_on: [namesrv]
    ports: ["8080:8080"]
    environment:
      JAVA_OPTS: -Drocketmq.namesrv.addr=namesrv:9876
```

## 4. 集群部署

### 4.1 双主双从（2 Master + 2 Slave）

**适用场景**：生产环境主备容灾，主节点故障 Slave 接管，秒级恢复

**节点规划**：

| 节点 | 组件 | brokerName | brokerId | IP |
|------|------|-----------|----------|----|
| node1 | Namesrv1 + Broker-a Master | broker-a | 0 | 10.0.0.1 |
| node2 | Namesrv2 + Broker-a Slave | broker-a | 1 | 10.0.0.2 |
| node3 | Namesrv3 + Broker-b Master | broker-b | 0 | 10.0.0.3 |
| node4 | Namesrv4 + Broker-b Slave | broker-b | 1 | 10.0.0.4 |

**复制策略**：`ASYNC_MASTER`（异步复制，性能优先）或 `SYNC_MASTER`（同步复制，数据优先）

#### 配置

```bash
cat > broker-master-a.conf << 'EOF'
brokerClusterName=ProdCluster
brokerName=broker-a
brokerId=0
namesrvAddr=10.0.0.1:9876;10.0.0.2:9876;10.0.0.3:9876;10.0.0.4:9876
brokerIP1=10.0.0.1
listenPort=10911
storePathRootDir=/data/rocketmq/store
flushDiskType=ASYNC_FLUSH
brokerRole=SYNC_MASTER
autoCreateTopicEnable=false
deleteWhen=04
fileReservedTime=72
maxMessageSize=4194304
EOF

cat > broker-slave-a.conf << 'EOF'
brokerClusterName=ProdCluster
brokerName=broker-a
brokerId=1
namesrvAddr=10.0.0.1:9876;10.0.0.2:9876;10.0.0.3:9876;10.0.0.4:9876
brokerIP1=10.0.0.2
listenPort=10911
storePathRootDir=/data/rocketmq/store
flushDiskType=ASYNC_FLUSH
brokerRole=SLAVE
autoCreateTopicEnable=false
EOF
```

broker-master-b.conf / broker-slave-b.conf 同上，brokerName 改为 `broker-b`，brokerIP1 对应 node3/node4 的 IP。

#### 启动

```bash
# 每台节点
su - rocketmq
nohup mqnamesrv > /data/rocketmq/logs/namesrv.log 2>&1 &

# 先启动 Master，再启动 Slave
nohup mqbroker -c broker-master-a.conf > /data/rocketmq/logs/broker.log 2>&1 &
nohup mqbroker -c broker-slave-a.conf > /data/rocketmq/logs/broker.log 2>&1 &
```

#### 验证

```bash
mqadmin clusterList -n "10.0.0.1:9876;10.0.0.2:9876;10.0.0.3:9876;10.0.0.4:9876"
# broker-a    0  MASTER  RUNNING
# broker-a    1  SLAVE   RUNNING
# broker-b    0  MASTER  RUNNING
# broker-b    1  SLAVE   RUNNING
```

#### Docker Compose

```yaml
services:
  namesrv1: &namesrv
    image: apache/rocketmq:5.2.0
    command: sh mqnamesrv
  namesrv2: *namesrv
  namesrv3: *namesrv
  namesrv4: *namesrv

  broker-ma:
    image: apache/rocketmq:5.2.0
    container_name: broker-ma
    depends_on: [namesrv1, namesrv2, namesrv3, namesrv4]
    ports: ["10911:10911"]
    environment:
      NAMESRV_ADDR: namesrv1:9876;namesrv2:9876;namesrv3:9876;namesrv4:9876
    volumes:
      - ./conf/broker-master-a.conf:/home/rocketmq/rocketmq-5.2.0/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/rocketmq-5.2.0/conf/broker.conf

  broker-sa:
    image: apache/rocketmq:5.2.0
    container_name: broker-sa
    depends_on: [namesrv1, namesrv2, namesrv3, namesrv4, broker-ma]
    ports: ["10921:10911"]
    environment:
      NAMESRV_ADDR: namesrv1:9876;namesrv2:9876;namesrv3:9876;namesrv4:9876
    volumes:
      - ./conf/broker-slave-a.conf:/home/rocketmq/rocketmq-5.2.0/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/rocketmq-5.2.0/conf/broker.conf

  broker-mb:
    image: apache/rocketmq:5.2.0
    container_name: broker-mb
    depends_on: [namesrv1, namesrv2, namesrv3, namesrv4]
    ports: ["10931:10911"]
    environment:
      NAMESRV_ADDR: namesrv1:9876;namesrv2:9876;namesrv3:9876;namesrv4:9876
    volumes:
      - ./conf/broker-master-b.conf:/home/rocketmq/rocketmq-5.2.0/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/rocketmq-5.2.0/conf/broker.conf

  broker-sb:
    image: apache/rocketmq:5.2.0
    container_name: broker-sb
    depends_on: [namesrv1, namesrv2, namesrv3, namesrv4, broker-mb]
    ports: ["10941:10911"]
    environment:
      NAMESRV_ADDR: namesrv1:9876;namesrv2:9876;namesrv3:9876;namesrv4:9876
    volumes:
      - ./conf/broker-slave-b.conf:/home/rocketmq/rocketmq-5.2.0/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/rocketmq-5.2.0/conf/broker.conf

  dashboard:
    image: apacherocketmq/rocketmq-dashboard:latest
    depends_on: [namesrv1]
    ports: ["8080:8080"]
    environment:
      JAVA_OPTS: -Drocketmq.namesrv.addr=namesrv1:9876;namesrv2:9876;namesrv3:9876;namesrv4:9876
```

### 4.2 DLedger 模式（3 节点自动选主）

**适用场景**：生产环境推荐，Leader 故障自动选举，无需人工干预

**节点规划**：

| 节点 | 组件 | dLegerSelfId | IP |
|------|------|-------------|----|
| node1 | Namesrv1 + Broker1 | n0 | 10.0.0.1 |
| node2 | Namesrv2 + Broker2 | n1 | 10.0.0.2 |
| node3 | Broker3 | n2 | 10.0.0.3 |

#### 配置

```bash
# broker-d1.conf（node1）
cat > broker-d1.conf << 'EOF'
brokerClusterName=DLedgerCluster
brokerName=RaftNode
brokerId=0
namesrvAddr=10.0.0.1:9876;10.0.0.2:9876
brokerIP1=10.0.0.1
listenPort=10911
storePathRootDir=/data/rocketmq/store

# DLedger 配置
enableDLegerCommitLog=true
dLegerGroup=RaftGroup
dLegerPeers=n0-10.0.0.1:40911;n1-10.0.0.2:40911;n2-10.0.0.3:40911
dLegerSelfId=n0

flushDiskType=ASYNC_FLUSH
autoCreateTopicEnable=false
deleteWhen=04
fileReservedTime=72
EOF

# broker-d2.conf（node2）
cat > broker-d2.conf << 'EOF'
brokerClusterName=DLedgerCluster
brokerName=RaftNode
brokerId=0
namesrvAddr=10.0.0.1:9876;10.0.0.2:9876
brokerIP1=10.0.0.2
listenPort=10911
storePathRootDir=/data/rocketmq/store
enableDLegerCommitLog=true
dLegerGroup=RaftGroup
dLegerPeers=n0-10.0.0.1:40911;n1-10.0.0.2:40911;n2-10.0.0.3:40911
dLegerSelfId=n1
flushDiskType=ASYNC_FLUSH
autoCreateTopicEnable=false
EOF

# broker-d3.conf（node3）
cat > broker-d3.conf << 'EOF'
brokerClusterName=DLedgerCluster
brokerName=RaftNode
brokerId=0
namesrvAddr=10.0.0.1:9876;10.0.0.2:9876
brokerIP1=10.0.0.3
listenPort=10911
storePathRootDir=/data/rocketmq/store
enableDLegerCommitLog=true
dLegerGroup=RaftGroup
dLegerPeers=n0-10.0.0.1:40911;n1-10.0.0.2:40911;n2-10.0.0.3:40911
dLegerSelfId=n2
flushDiskType=ASYNC_FLUSH
autoCreateTopicEnable=false
EOF
```

#### 启动

```bash
# node1、node2 先启动 Namesrv，再启动 Broker；node3 只需 Broker
su - rocketmq
nohup mqnamesrv > /data/rocketmq/logs/namesrv.log 2>&1 &
nohup mqbroker -c broker-d1.conf > /data/rocketmq/logs/broker.log 2>&1 &
```

#### 验证

```bash
mqadmin clusterList -n "10.0.0.1:9876;10.0.0.2:9876"
# 三个 Broker 角色均显示 MASTER（DLedger 模式下每个节点都是 Leader/Follower 角色）
mqadmin getBrokerConfig -n 10.0.0.1:9876 -b 10.0.0.1:10911 | grep enableDLegerCommitLog
# 确认 enableDLegerCommitLog=true
```

#### Docker Compose

```yaml
services:
  namesrv1:
    image: apache/rocketmq:5.2.0
    container_name: rmq-ns1
    command: sh mqnamesrv
  namesrv2:
    image: apache/rocketmq:5.2.0
    container_name: rmq-ns2
    command: sh mqnamesrv

  broker-d1:
    image: apache/rocketmq:5.2.0
    container_name: rmq-d1
    hostname: broker-d1
    depends_on: [namesrv1, namesrv2]
    ports: ["10911:10911", "40911:40911"]
    environment:
      NAMESRV_ADDR: namesrv1:9876;namesrv2:9876
    volumes:
      - ./conf/broker-d1.conf:/home/rocketmq/rocketmq-5.2.0/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/rocketmq-5.2.0/conf/broker.conf

  broker-d2:
    image: apache/rocketmq:5.2.0
    container_name: rmq-d2
    hostname: broker-d2
    depends_on: [namesrv1, namesrv2]
    ports: ["10921:10911", "40921:40911"]
    environment:
      NAMESRV_ADDR: namesrv1:9876;namesrv2:9876
    volumes:
      - ./conf/broker-d2.conf:/home/rocketmq/rocketmq-5.2.0/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/rocketmq-5.2.0/conf/broker.conf

  broker-d3:
    image: apache/rocketmq:5.2.0
    container_name: rmq-d3
    hostname: broker-d3
    depends_on: [namesrv1, namesrv2]
    ports: ["10931:10911", "40931:40911"]
    environment:
      NAMESRV_ADDR: namesrv1:9876;namesrv2:9876
    volumes:
      - ./conf/broker-d3.conf:/home/rocketmq/rocketmq-5.2.0/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/rocketmq-5.2.0/conf/broker.conf

  dashboard:
    image: apacherocketmq/rocketmq-dashboard:latest
    depends_on: [namesrv1]
    ports: ["8080:8080"]
    environment:
      JAVA_OPTS: -Drocketmq.namesrv.addr=namesrv1:9876;namesrv2:9876
```

## 5. 运维速查

```bash
# 集群状态
mqadmin clusterList -n localhost:9876
mqadmin brokerStatus -n localhost:9876 -b broker-a

# Topic
mqadmin topicList -n localhost:9876
mqadmin topicStatus -n localhost:9876 -t TopicName
mqadmin updateTopic -n localhost:9876 -t TopicName -r 8 -w 8
mqadmin deleteTopic -n localhost:9876 -t TopicName

# 消费者
mqadmin consumerProgress -n localhost:9876 -g ConsumerGroup
mqadmin consumerStatus -n localhost:9876 -g ConsumerGroup

# 消息
mqadmin queryMsgByKey -n localhost:9876 -t TopicName -k msgKey

# 日志：$STORE_ROOT/config、$STORE_ROOT/consumerOffset.json、$STORE_ROOT/subscriptionGroup.json
```

**关键监控指标**：

| 指标 | 命令/来源 | 告警阈值 |
|------|----------|----------|
| 消息堆积 | `consumerProgress` Diff | 持续增长 |
| 磁盘使用 | `brokerStatus` commitLogDirCapacity | > 80% |
| Slave 延迟 | `brokerStatus` masterFlushOffset | 差距持续增大 |
| TPS 波动 | `brokerStatus` getPutMessageTimesTotal | 突降 → 检查 |

## 6. 常见故障

### 6.1 Broker 启动闪退

```
# 查看日志
tail -100 /data/rocketmq/logs/broker.log
# 常见原因：JVM 堆不足、端口被占、store 目录权限
# 解决：调整 runbroker.sh 的 -Xms/-Xmx，检查端口，chown 目录
```

### 6.2 生产者发送超时

```bash
# 排查 Broker 负载
mqadmin brokerStatus -n localhost:9876 -b broker-a
# 检查 putMessageTimesTotal 和 sendThreadPoolQueueSize
# 解决：扩容 Broker、减少 sendMessageThreadPoolNums 防队列过长
```

### 6.3 主从同步延迟大

```bash
mqadmin brokerStatus -n localhost:9876 -b broker-a
# masterFlushOffset - slaveFlushOffset = 延迟字节
# 解决：检查 Slave 磁盘 IO、网络延迟、改为 ASYNC_FLUSH（异步复制）
```

### 6.4 DLedger 选主失败

```
# 检查 dLegerPeers 配置是否正确，确保 3 节点网络互通
# 至少需要 2 个节点存活才能选出 Leader（多数派）
# 解决：使用 `mqadmin getBrokerConfig` 验证 DLedger 配置
```

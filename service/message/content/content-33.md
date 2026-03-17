# RocketMQ 核心配置

## 概述

RocketMQ 配置分为 NameServer、Broker、Producer、Consumer 四部分。本章系统讲解各组件的核心配置。

---

## 1. NameServer 配置

```properties
# conf/namesrv.properties

# 监听端口
listenPort=9876

# KV 配置文件路径
kvConfigPath=/root/namesrv/kvConfig.json

# 日志保留时间
deleteTopicWithNameServer=true
```

---

## 2. Broker 配置

### 2.1 基础配置

```properties
# conf/broker.conf

# Broker 名称（主从名称必须相同）
brokerName=broker-a

# Broker ID（0=Master，非0=Slave）
brokerId=0

# Broker 角色（ASYNC_MASTER/SYNC_MASTER/SLAVE）
brokerRole=ASYNC_MASTER

# 刷盘策略（ASYNC_FLUSH/SYNC_FLUSH）
flushDiskType=ASYNC_FLUSH

# NameServer 地址
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

# CommitLog 文件大小（1GB）
mappedFileSizeCommitLog=1073741824

# ConsumeQueue 文件大小（6MB）
mappedFileSizeConsumeQueue=6000000

# 是否启用索引
messageIndexEnable=true

# 是否允许自动创建 Topic
autoCreateTopicEnable=false
```

### 2.3 清理配置

```properties
# 文件保留时间（小时）
fileReservedTime=48

# 删除文件的时间点（凌晨4点）
deleteWhen=04

# 磁盘使用率阈值（90%）
diskMaxUsedSpaceRatio=90
```

### 2.4 刷盘配置

```properties
# 异步刷盘间隔（500ms）
flushCommitLogInterval=500

# 同步刷盘超时（5秒）
syncFlushTimeout=5000

# 主从同步超时（5秒）
syncMasterFlushSlaveMaxTimeout=5000
```

---

## 3. Producer 配置

### 3.1 基础配置

```java
DefaultMQProducer producer = new DefaultMQProducer("producer-group");

// NameServer 地址
producer.setNamesrvAddr("localhost:9876");

// 发送超时（3秒）
producer.setSendMsgTimeout(3000);

// 同步发送重试次数（2次）
producer.setRetryTimesWhenSendFailed(2);

// 异步发送重试次数（2次）
producer.setRetryTimesWhenSendAsyncFailed(2);
```

### 3.2 压缩配置

```java
// 消息体压缩阈值（4KB）
producer.setCompressMsgBodyOverHowmuch(4096);

// 压缩级别（5）
producer.setCompressLevel(5);
```

### 3.3 批量配置

```java
// 批量发送最大消息数（128）
producer.setMaxMessageSize(4194304);  // 4MB
```

---

## 4. Consumer 配置

### 4.1 Push 模式配置

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group");

// NameServer 地址
consumer.setNamesrvAddr("localhost:9876");

// 消费模式（CLUSTERING/BROADCASTING）
consumer.setMessageModel(MessageModel.CLUSTERING);

// 消费起始位置（CONSUME_FROM_LAST_OFFSET/CONSUME_FROM_FIRST_OFFSET）
consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_LAST_OFFSET);
```

### 4.2 线程池配置

```java
// 最小消费线程数
consumer.setConsumeThreadMin(20);

// 最大消费线程数
consumer.setConsumeThreadMax(64);

// 消费线程池队列容量
consumer.setPullThresholdForQueue(1000);
```

### 4.3 拉取配置

```java
// 单次拉取消息数（32）
consumer.setPullBatchSize(32);

// 拉取间隔（0=立即拉取）
consumer.setPullInterval(0);

// 单次消费消息数（1）
consumer.setConsumeMessageBatchMaxSize(1);
```

### 4.4 重试配置

```java
// 最大重试次数（16次）
consumer.setMaxReconsumeTimes(16);

// 消费超时（15分钟）
consumer.setConsumeTimeout(15);
```

---

## 5. 配置示例

### 5.1 高可靠性配置

**Broker**：
```properties
brokerRole=SYNC_MASTER
flushDiskType=SYNC_FLUSH
fileReservedTime=72
autoCreateTopicEnable=false
```

**Producer**：
```java
producer.setRetryTimesWhenSendFailed(3);
producer.setSendMsgTimeout(5000);
```

### 5.2 高性能配置

**Broker**：
```properties
brokerRole=ASYNC_MASTER
flushDiskType=ASYNC_FLUSH
flushCommitLogInterval=1000
warmMapedFileEnable=true
```

**Consumer**：
```java
consumer.setConsumeThreadMin(64);
consumer.setConsumeThreadMax(128);
consumer.setConsumeMessageBatchMaxSize(10);
```

---

## 关键要点

1. **Broker 角色**：SYNC_MASTER/ASYNC_MASTER/SLAVE
2. **刷盘策略**：SYNC_FLUSH/ASYNC_FLUSH
3. **自动创建**：生产环境禁用 autoCreateTopicEnable
4. **重试次数**：合理配置避免风暴
5. **线程池**：根据机器配置调整

---

## 参考资料

1. [RocketMQ Configuration](https://rocketmq.apache.org/docs/deploymentOperations/01deploy)
2. [RocketMQ Best Practice](https://rocketmq.apache.org/docs/bestPractice/06bestpractice/)

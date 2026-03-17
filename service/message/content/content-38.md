# RocketMQ 命令行工具

## 概述

RocketMQ通过mqadmin工具提供了完整的命令行管理功能。本章系统介绍RocketMQ命令行工具的使用方法。

---

## 1. mqadmin updateTopic：Topic管理

### 1.1 创建/更新Topic

```bash
mqadmin updateTopic \
  -n localhost:9876 \
  -t OrderTopic \
  -c DefaultCluster \
  -r 8 \
  -w 8 \
  -p 6 \
  -o false

# 参数说明：
# -n: NameServer地址
# -t: Topic名称
# -c: 集群名称
# -r: 读队列数
# -w: 写队列数
# -p: 权限（2=写，4=读，6=读写）
# -o: 是否顺序消息
```

### 1.2 删除Topic

```bash
mqadmin deleteTopic \
  -n localhost:9876 \
  -t OrderTopic \
  -c DefaultCluster
```

### 1.3 查询Topic

```bash
# 列出所有Topic
mqadmin topicList -n localhost:9876

# 查看Topic详情
mqadmin topicStatus \
  -n localhost:9876 \
  -t OrderTopic

# 查看Topic路由信息
mqadmin topicRoute \
  -n localhost:9876 \
  -t OrderTopic
```

---

## 2. mqadmin clusterList/brokerStatus：集群管理

### 2.1 查看集群列表

```bash
mqadmin clusterList -n localhost:9876

# 输出示例：
# Cluster Name: DefaultCluster
# Broker Name: broker-a
# BID: 0 (MASTER)
# Addr: 192.168.1.100:10911
```

### 2.2 查看Broker状态

```bash
mqadmin brokerStatus \
  -n localhost:9876 \
  -b broker-a

# 输出：内存、磁盘、TPS等信息
```

### 2.3 查看Broker配置

```bash
mqadmin getBrokerConfig \
  -n localhost:9876 \
  -b broker-a
```

---

## 3. mqadmin consumerProgress：消费进度查询

### 3.1 查看消费进度

```bash
mqadmin consumerProgress \
  -n localhost:9876 \
  -g my-consumer-group

# 输出示例：
# Topic             Queue  Broker Offset  Consumer Offset  Diff
# OrderTopic        0      1000            950              50
# OrderTopic        1      2000            2000             0
```

### 3.2 查看所有消费者组

```bash
mqadmin consumerProgress -n localhost:9876
```

---

## 4. mqadmin resetOffsetByTime：位点重置

### 4.1 按时间重置

```bash
# 重置到1小时前
mqadmin resetOffsetByTime \
  -n localhost:9876 \
  -g my-consumer-group \
  -t OrderTopic \
  -s -3600000

# -s参数：
# -1：重置到最早
# 0：重置到最新
# 负数：相对当前时间的毫秒数
# 时间戳：指定时间点
```

### 4.2 重置指定队列

```bash
mqadmin resetOffsetByTime \
  -n localhost:9876 \
  -g my-consumer-group \
  -t OrderTopic:0,1,2 \
  -s -1
```

---

## 5. mqadmin sendMessage/queryMsgById：消息管理

### 5.1 发送消息

```bash
mqadmin sendMessage \
  -n localhost:9876 \
  -t TestTopic \
  -p "Hello RocketMQ"

# 发送带Tag的消息
mqadmin sendMessage \
  -n localhost:9876 \
  -t TestTopic \
  -p "Hello" \
  -T TagA
```

### 5.2 查询消息

**按ID查询**：
```bash
mqadmin queryMsgById \
  -n localhost:9876 \
  -i 0A0B0C0D00002A9F0000000000000000
```

**按Key查询**：
```bash
mqadmin queryMsgByKey \
  -n localhost:9876 \
  -t OrderTopic \
  -k ORDER_12345
```

**按时间查询**：
```bash
mqadmin queryMsgByOffset \
  -n localhost:9876 \
  -t OrderTopic \
  -b broker-a \
  -i 0 \
  -o 100
```

---

## 6. mqadmin updateBrokerConfig：配置管理

### 6.1 更新Broker配置

```bash
mqadmin updateBrokerConfig \
  -n localhost:9876 \
  -b broker-a \
  -k flushDiskType \
  -v ASYNC_FLUSH
```

### 6.2 查看配置

```bash
mqadmin getBrokerConfig \
  -n localhost:9876 \
  -b broker-a
```

---

## 7. mqadmin cleanExpiredCQ：清理过期队列

```bash
mqadmin cleanExpiredCQ \
  -n localhost:9876 \
  -c DefaultCluster
```

---

## 8. 其他常用命令

### 8.1 查看消息轨迹

```bash
mqadmin queryMsgTraceById \
  -n localhost:9876 \
  -i <msgId>
```

### 8.2 打印消息

```bash
mqadmin printMsg \
  -n localhost:9876 \
  -t OrderTopic \
  -c 10
```

### 8.3 克隆消费组

```bash
mqadmin cloneGroupOffset \
  -n localhost:9876 \
  -s source-group \
  -d dest-group \
  -t OrderTopic
```

### 8.4 导出元数据

```bash
mqadmin exportMetadata \
  -n localhost:9876 \
  -f /tmp/metadata.json
```

---

## 9. 运维脚本

### 9.1 批量创建Topic

```bash
#!/bin/bash
# batch-create-topics.sh

TOPICS=("orders" "payments" "notifications")
NAMESRV="localhost:9876"

for topic in "${TOPICS[@]}"; do
  mqadmin updateTopic \
    -n $NAMESRV \
    -t "$topic" \
    -c DefaultCluster \
    -r 8 \
    -w 8 \
    -p 6
done
```

### 9.2 监控消费Lag

```bash
#!/bin/bash
# monitor-consumer-lag.sh

NAMESRV="localhost:9876"
THRESHOLD=10000

mqadmin consumerProgress -n $NAMESRV | \
  awk -v th=$THRESHOLD 'NR>1 && $NF>th {print $0}'
```

### 9.3 健康检查

```bash
#!/bin/bash
# health-check.sh

NAMESRV="localhost:9876"

# 检查集群状态
if mqadmin clusterList -n $NAMESRV > /dev/null 2>&1; then
  echo "Cluster OK"
else
  echo "Cluster ERROR"
  exit 1
fi

# 检查Broker状态
mqadmin brokerStatus -n $NAMESRV -b broker-a | grep "bootTime"
```

---

## 关键要点

1. **mqadmin updateTopic**：Topic创建和管理
2. **mqadmin consumerProgress**：消费进度监控
3. **mqadmin resetOffsetByTime**：位点重置
4. **mqadmin queryMsgById**：消息查询
5. **运维脚本**：批量操作和监控自动化

---

## 深入一点

**消费进度监控**：

```bash
mqadmin consumerProgress -n localhost:9876 -g my-group

输出字段：
- Topic: Topic名称
- Queue: 队列ID
- Broker Offset: Broker最新Offset
- Consumer Offset: 消费者当前Offset
- Diff: 堆积量（Broker Offset - Consumer Offset）

告警策略：
- Diff > 10000: 警告
- Diff > 100000: 严重
- Diff持续增长: 消费异常
```

**消息轨迹**：

```
mqadmin queryMsgTraceById -i <msgId>

轨迹信息：
1. 生产轨迹：
   - 生产者IP
   - 发送时间
   - 发送结果
   
2. 存储轨迹：
   - Broker
   - 队列ID
   - Offset
   
3. 消费轨迹：
   - 消费者组
   - 消费者IP
   - 消费时间
   - 消费结果
```

---

## 参考资料

1. [RocketMQ mqadmin](https://rocketmq.apache.org/docs/cli/04admin/)
2. [RocketMQ Operations](https://rocketmq.apache.org/docs/deploymentOperations/01deploy/)

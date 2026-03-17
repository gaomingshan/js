# RocketMQ 命令行工具

## 概述

RocketMQ mqadmin 提供全面的集群管理功能。本章介绍常用命令。

---

## 1. Topic 管理

```bash
# 创建 Topic
mqadmin updateTopic -n localhost:9876 -t MyTopic -c DefaultCluster -r 4 -w 4

# 查看 Topic 列表
mqadmin topicList -n localhost:9876

# 查看 Topic 详情
mqadmin topicStatus -n localhost:9876 -t MyTopic

# 查看 Topic 路由
mqadmin topicRoute -n localhost:9876 -t MyTopic

# 删除 Topic
mqadmin deleteTopic -n localhost:9876 -t MyTopic -c DefaultCluster
```

---

## 2. 消费者组管理

```bash
# 查看消费进度
mqadmin consumerProgress -n localhost:9876 -g my-group

# 查看消费者连接
mqadmin consumerConnection -n localhost:9876 -g my-group

# 重置 Offset
mqadmin resetOffsetByTime -n localhost:9876 -g my-group -t MyTopic -s -3600000

# 删除消费者组
mqadmin deleteSubGroup -n localhost:9876 -g my-group -c DefaultCluster
```

---

## 3. 消息管理

```bash
# 按 ID 查询消息
mqadmin queryMsgById -n localhost:9876 -i C0A8010100002A9F0000000000000000

# 按 Key 查询消息
mqadmin queryMsgByKey -n localhost:9876 -t MyTopic -k order-123

# 发送测试消息
mqadmin sendMessage -n localhost:9876 -t MyTopic -p "Test Message"
```

---

## 4. 集群管理

```bash
# 查看集群列表
mqadmin clusterList -n localhost:9876

# 查看 Broker 状态
mqadmin brokerStatus -n localhost:9876 -b broker-a

# 查看 Broker 配置
mqadmin getBrokerConfig -n localhost:9876 -b broker-a

# 更新 Broker 配置
mqadmin updateBrokerConfig -n localhost:9876 -b broker-a -k sendMessageThreadPoolNums -v 32
```

---

## 5. 运维命令

```bash
# 清理过期 ConsumeQueue
mqadmin cleanExpiredCQ -n localhost:9876 -b broker-a:10911

# 清理未使用的 Topic
mqadmin cleanUnusedTopic -n localhost:9876 -c DefaultCluster

# 查看 NameServer 状态
mqadmin getNamesrvConfig -n localhost:9876
```

---

## 关键要点

1. **-n 参数**：NameServer 地址，必须指定
2. **Topic 管理**：updateTopic、deleteTopic
3. **消费进度**：consumerProgress 查看 Lag
4. **消息查询**：支持按 ID 和 Key 查询
5. **集群运维**：clusterList、brokerStatus

---

## 参考资料

1. [RocketMQ Admin Tool](https://rocketmq.apache.org/docs/deploymentOperations/02admin)

# 监控指标查询

## 概述

通过命令行查询监控指标是运维的重要手段。本章介绍如何使用命令行工具查询三大消息队列的监控指标。

---

## 1. Kafka JMX 指标查询

### 1.1 启用JMX

```bash
# 启动Kafka时启用JMX
export JMX_PORT=9999
bin/kafka-server-start.sh config/server.properties
```

### 1.2 使用jconsole查询

```bash
# 启动jconsole
jconsole localhost:9999
```

### 1.3 使用kafka-run-class查询

```bash
# 查询Broker指标
kafka-run-class.sh kafka.tools.JmxTool \
  --object-name kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec \
  --jmx-url service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi

# 查询消费者Lag
kafka-run-class.sh kafka.tools.JmxTool \
  --object-name kafka.consumer:type=consumer-fetch-manager-metrics,client-id=* \
  --jmx-url service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi
```

### 1.4 常用JMX指标

```
# Broker指标
kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec
kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec
kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec

# 网络指标
kafka.network:type=RequestMetrics,name=RequestsPerSec,request=Produce
kafka.network:type=RequestMetrics,name=TotalTimeMs,request=Produce

# 副本指标
kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions
kafka.server:type=ReplicaManager,name=PartitionCount
```

---

## 2. RocketMQ Broker 状态查询

### 2.1 查询Broker运行时信息

```bash
# 查询Broker状态
mqadmin brokerStatus -n localhost:9876 -b broker-a

# 输出示例：
# bootTime: 2024-01-01 00:00:00
# runtime: 24 hours
# msgPutTotalTodayNow: 1000000
# msgGetTotalTodayNow: 950000
# commitLogDiskRatio: 0.45
```

### 2.2 查询Topic统计

```bash
# 查询Topic统计信息
mqadmin topicStatus -n localhost:9876 -t OrderTopic

# 输出：
# - 消息总数
# - 最小Offset
# - 最大Offset
```

### 2.3 查询集群运行时信息

```bash
# 查询集群统计
mqadmin statsAll -n localhost:9876
```

---

## 3. RabbitMQ 管理 API 查询

### 3.1 使用rabbitmqadmin

```bash
# 查询队列统计
rabbitmqadmin list queues name messages consumers memory

# 查询连接数
rabbitmqadmin list connections name state

# 查询通道数
rabbitmqadmin list channels name consumer_count
```

### 3.2 使用curl查询API

```bash
# 获取集群概览
curl -u admin:admin http://localhost:15672/api/overview

# 获取队列信息
curl -u admin:admin http://localhost:15672/api/queues

# 获取特定队列信息
curl -u admin:admin http://localhost:15672/api/queues/%2F/my-queue

# 输出示例：
{
  "name": "my-queue",
  "messages": 1000,
  "messages_ready": 800,
  "messages_unacknowledged": 200,
  "consumers": 5
}
```

---

## 4. 吞吐量、延迟、堆积查询

### 4.1 Kafka吞吐量查询

```bash
# 查询Producer吞吐量
kafka-run-class.sh kafka.tools.JmxTool \
  --object-name kafka.producer:type=producer-metrics,client-id=* \
  --attributes record-send-rate

# 查询Consumer吞吐量
kafka-run-class.sh kafka.tools.JmxTool \
  --object-name kafka.consumer:type=consumer-fetch-manager-metrics,client-id=* \
  --attributes records-consumed-rate
```

### 4.2 查询延迟

```bash
# Producer延迟
kafka-run-class.sh kafka.tools.JmxTool \
  --object-name kafka.producer:type=producer-metrics,client-id=* \
  --attributes request-latency-avg

# Consumer延迟
kafka-run-class.sh kafka.tools.JmxTool \
  --object-name kafka.consumer:type=consumer-fetch-manager-metrics,client-id=* \
  --attributes fetch-latency-avg
```

### 4.3 查询消息堆积

**Kafka**：
```bash
kafka-consumer-groups.sh --describe \
  --group my-group \
  --bootstrap-server localhost:9092 | \
  awk 'NR>1 {sum+=$6} END {print "Total Lag:", sum}'
```

**RocketMQ**：
```bash
mqadmin consumerProgress -n localhost:9876 -g my-group | \
  awk 'NR>1 {sum+=$NF} END {print "Total Lag:", sum}'
```

**RabbitMQ**：
```bash
rabbitmqctl list_queues name messages | \
  awk '{sum+=$2} END {print "Total Messages:", sum}'
```

---

## 5. 消费者组状态查询

### 5.1 Kafka消费者组状态

```bash
# 查看消费者组列表
kafka-consumer-groups.sh --list --bootstrap-server localhost:9092

# 查看消费者组详情
kafka-consumer-groups.sh --describe \
  --group my-group \
  --bootstrap-server localhost:9092

# 查看消费者组成员
kafka-consumer-groups.sh --describe \
  --group my-group \
  --members \
  --verbose \
  --bootstrap-server localhost:9092
```

### 5.2 RocketMQ消费者组状态

```bash
# 查看消费进度
mqadmin consumerProgress -n localhost:9876 -g my-group

# 查看消费者连接
mqadmin consumerConnection -n localhost:9876 -g my-group
```

### 5.3 RabbitMQ消费者状态

```bash
# 查看队列消费者
rabbitmqctl list_consumers

# 使用API查询
curl -u admin:admin http://localhost:15672/api/consumers
```

---

## 6. 集群健康检查

### 6.1 Kafka集群健康检查

```bash
#!/bin/bash
# kafka-health-check.sh

BOOTSTRAP="localhost:9092"

# 检查Broker列表
echo "Checking Brokers..."
kafka-broker-api-versions.sh --bootstrap-server $BOOTSTRAP

# 检查未充分复制的分区
echo "Checking Under-Replicated Partitions..."
kafka-run-class.sh kafka.tools.JmxTool \
  --object-name kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions \
  --jmx-url service:jmx:rmi:///jndi/rmi://localhost:9999/jmxrmi

# 检查ISR
echo "Checking ISR..."
kafka-topics.sh --describe --bootstrap-server $BOOTSTRAP | \
  grep "Isr:" | grep -v "Isr: [0-9,]*$" || echo "All partitions in-sync"
```

### 6.2 RocketMQ集群健康检查

```bash
#!/bin/bash
# rocketmq-health-check.sh

NAMESRV="localhost:9876"

# 检查集群状态
echo "Checking Cluster..."
mqadmin clusterList -n $NAMESRV

# 检查Broker状态
echo "Checking Broker Status..."
mqadmin brokerStatus -n $NAMESRV -b broker-a | grep "bootTime"

# 检查消费堆积
echo "Checking Consumer Lag..."
mqadmin consumerProgress -n $NAMESRV | \
  awk 'NR>1 && $NF>10000 {print "WARNING: "$0}'
```

### 6.3 RabbitMQ集群健康检查

```bash
#!/bin/bash
# rabbitmq-health-check.sh

# 检查节点健康
echo "Checking Node Health..."
rabbitmq-diagnostics node_health_check

# 检查集群状态
echo "Checking Cluster Status..."
rabbitmqctl cluster_status

# 检查队列堆积
echo "Checking Queue Backlog..."
rabbitmqctl list_queues name messages | \
  awk '$2>10000 {print "WARNING: "$0}'
```

---

## 7. 指标导出与监控集成

### 7.1 Kafka Prometheus Exporter

```bash
# 启动Kafka Exporter
docker run -d \
  --name kafka-exporter \
  -p 9308:9308 \
  danielqsj/kafka-exporter \
  --kafka.server=kafka:9092

# 查询导出的指标
curl http://localhost:9308/metrics
```

### 7.2 RocketMQ Prometheus Exporter

```bash
# 启动RocketMQ Exporter
java -jar rocketmq-exporter.jar \
  --rocketmq.config.namesrvAddr=localhost:9876

# 查询指标
curl http://localhost:5557/metrics
```

### 7.3 RabbitMQ Prometheus Plugin

```bash
# 启用Prometheus插件
rabbitmq-plugins enable rabbitmq_prometheus

# 查询指标
curl http://localhost:15692/metrics
```

---

## 关键要点

1. **Kafka JMX**：通过JMX查询详细指标
2. **命令行工具**：kafka-consumer-groups、mqadmin、rabbitmqctl
3. **API查询**：RabbitMQ Management API
4. **健康检查**：自动化脚本定期检查
5. **Prometheus**：统一监控指标导出

---

## 深入一点

**Kafka关键指标计算**：

```bash
# 计算消费速率
records_consumed_rate = records_consumed / time_period

# 计算消费Lag增长率
lag_growth_rate = (current_lag - previous_lag) / time_interval

# 判断消费是否正常
if lag_growth_rate > 0:
    # 消费速度 < 生产速度，需要扩容
elif lag_growth_rate < 0:
    # 消费速度 > 生产速度，正常追赶
else:
    # 消费速度 = 生产速度，稳定
```

**监控指标优先级**：

```
P0（最关键）：
- 消费Lag
- 未充分复制分区
- Broker可用性

P1（重要）：
- 磁盘使用率
- 内存使用率
- CPU使用率

P2（次要）：
- 吞吐量
- 延迟
- 连接数
```

---

## 参考资料

1. [Kafka Monitoring](https://kafka.apache.org/documentation/#monitoring)
2. [RocketMQ Metrics](https://rocketmq.apache.org/docs/deploymentOperations/04Dashboard/)
3. [RabbitMQ Monitoring](https://www.rabbitmq.com/monitoring.html)

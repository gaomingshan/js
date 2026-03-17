# 监控与运维工具

## 概述

完善的监控体系是保障消息队列稳定运行的关键。本章将介绍 Kafka、RocketMQ、RabbitMQ 的专用管理工具、监控指标采集方案、告警策略设计以及常用的运维工具，帮助你建立全面的监控与运维体系。

---

## 1. Kafka 监控与管理工具

### 1.1 Kafka Manager（CMAK）

CMAK（Cluster Manager for Apache Kafka）是雅虎开源的 Kafka 集群管理工具。

**安装部署**：

**Docker 部署**：
```bash
docker run -d \
  --name cmak \
  -p 9000:9000 \
  -e ZK_HOSTS="zookeeper:2181" \
  hlebalbau/kafka-manager:stable
```

**手动部署**：
```bash
# 下载
wget https://github.com/yahoo/CMAK/releases/download/3.0.0.6/cmak-3.0.0.6.zip
unzip cmak-3.0.0.6.zip
cd cmak-3.0.0.6

# 配置 Zookeeper
vi conf/application.conf
# kafka-manager.zkhosts="localhost:2181"

# 启动
bin/cmak -Dconfig.file=conf/application.conf -Dhttp.port=9000
```

**核心功能**：
- 集群管理：添加、查看、删除集群
- Topic 管理：创建、查看、修改、删除 Topic
- Consumer Group 监控：查看消费进度、Lag
- Broker 管理：查看 Broker 状态、配置
- 分区管理：重分配分区、优先副本选举
- ACL 管理：管理权限控制

**使用示例**：
```
访问 http://localhost:9000

1. 添加集群
   Cluster → Add Cluster
   - Cluster Name: my-kafka
   - Cluster Zookeeper Hosts: zookeeper:2181
   - Kafka Version: 3.6.0
   - Enable JMX Polling: Yes

2. 查看 Topic
   Topic → List
   - 查看 Topic 列表、分区分布、副本状态

3. 查看 Consumer Group
   Consumer → List
   - 查看消费进度、Lag、Owner
```

### 1.2 Kafdrop

Kafdrop 是一个现代化的 Kafka Web UI，界面友好。

**Docker 部署**：
```bash
docker run -d \
  --name kafdrop \
  -p 9001:9000 \
  -e KAFKA_BROKERCONNECT=kafka:9092 \
  -e JVM_OPTS="-Xms32M -Xmx64M" \
  obsidiandynamics/kafdrop:latest
```

**核心功能**：
- Topic 浏览：查看 Topic 详情、分区、配置
- 消息浏览：实时查看消息内容
- Consumer Group 监控：查看消费进度
- 搜索功能：按 Key/Value 搜索消息
- JSON 格式化：自动格式化 JSON 消息

**访问**：
```
http://localhost:9001
```

### 1.3 Kafka Exporter（Prometheus）

Kafka Exporter 用于导出 Kafka 指标到 Prometheus。

**部署**：
```bash
docker run -d \
  --name kafka-exporter \
  -p 9308:9308 \
  danielqsj/kafka-exporter:latest \
  --kafka.server=kafka:9092
```

**核心指标**：
```
# Consumer Group 指标
kafka_consumergroup_lag                    # 消费延迟（重要）
kafka_consumergroup_current_offset         # 当前消费位点
kafka_consumergroup_lag_sum                # 总延迟

# Topic 指标
kafka_topic_partitions                     # 分区数
kafka_topic_partition_current_offset       # 分区当前 offset
kafka_topic_partition_oldest_offset        # 分区最早 offset
kafka_topic_partition_replicas             # 副本数
kafka_topic_partition_in_sync_replica      # ISR 副本数

# Broker 指标（需要启用 JMX）
kafka_broker_info                          # Broker 信息
kafka_controller_active_count              # Controller 数量（应为1）
kafka_server_replicamanager_underreplicatedpartitions  # 未同步分区数
kafka_server_replicamanager_partitioncount             # 分区总数
```

**Prometheus 配置**：
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka-exporter:9308']
```

**Grafana Dashboard**：
```bash
# 导入 Kafka Dashboard（ID: 7589）
# https://grafana.com/grafana/dashboards/7589
```

### 1.4 JMX 监控

Kafka 使用 JMX 暴露详细的性能指标。

**启用 JMX**：
```bash
# 在 server.properties 中配置
export JMX_PORT=9999
bin/kafka-server-start.sh config/server.properties
```

**使用 JConsole 查看**：
```bash
jconsole localhost:9999
```

**关键 JMX 指标**：

**Broker 指标**：
```
kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec          # 消息流入速率
kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec             # 字节流入速率
kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec            # 字节流出速率
kafka.network:type=RequestMetrics,name=RequestsPerSec               # 请求速率
kafka.network:type=RequestMetrics,name=TotalTimeMs                  # 请求延迟
kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions     # 未同步分区
kafka.controller:type=KafkaController,name=OfflinePartitionsCount   # 离线分区
kafka.controller:type=KafkaController,name=ActiveControllerCount    # 活跃 Controller
```

**Consumer 指标**：
```
kafka.consumer:type=consumer-fetch-manager-metrics,client-id=*      # 消费指标
records-lag-max                                                     # 最大延迟
fetch-latency-avg                                                   # 拉取延迟
```

**Producer 指标**：
```
kafka.producer:type=producer-metrics,client-id=*                    # 生产指标
record-send-rate                                                    # 发送速率
record-error-rate                                                   # 错误率
request-latency-avg                                                 # 请求延迟
```

### 1.5 Cruise Control

Cruise Control 是 LinkedIn 开源的 Kafka 集群自动化管理工具。

**核心功能**：
- 自动负载均衡
- 异常检测和自愈
- 集群扩缩容
- 磁盘故障处理

**部署**：
```bash
git clone https://github.com/linkedin/cruise-control.git
cd cruise-control
./gradlew jar
```

**配置**：
```properties
# config/cruisecontrol.properties
bootstrap.servers=kafka:9092
zookeeper.connect=zookeeper:2181
webserver.http.port=9090
```

**使用示例**：
```bash
# 查看集群状态
curl http://localhost:9090/kafkacruisecontrol/state

# 生成负载均衡方案
curl http://localhost:9090/kafkacruisecontrol/rebalance?dryrun=true

# 执行负载均衡
curl http://localhost:9090/kafkacruisecontrol/rebalance?dryrun=false
```

---

## 2. RocketMQ 监控与管理工具

### 2.1 RocketMQ Dashboard

RocketMQ Dashboard 是官方提供的 Web 管理界面。

**部署**：

**Docker 部署**：
```bash
docker run -d \
  --name rocketmq-dashboard \
  -e "JAVA_OPTS=-Drocketmq.namesrv.addr=namesrv:9876" \
  -p 8080:8080 \
  apacherocketmq/rocketmq-dashboard:latest
```

**手动部署**：
```bash
git clone https://github.com/apache/rocketmq-dashboard.git
cd rocketmq-dashboard

# 修改配置
vi src/main/resources/application.yml
# rocketmq.config.namesrvAddr: localhost:9876

# 编译
mvn clean package -Dmaven.test.skip=true

# 运行
java -jar target/rocketmq-dashboard-1.0.0.jar
```

**核心功能**：

**1. 集群管理**：
- 查看 Broker 集群状态
- 查看 NameServer 列表
- 查看集群配置

**2. Topic 管理**：
- 创建、删除、修改 Topic
- 查看 Topic 配置和统计信息
- Topic 路由信息

**3. Consumer 管理**：
- 查看消费者组列表
- 查看消费进度和堆积
- 重置消费位点
- 查看消费者连接信息

**4. 消息管理**：
- 按 Message ID 查询消息
- 按 Message Key 查询消息
- 按 Topic 查询消息
- 发送测试消息

**5. 运维功能**：
- 集群监控（TPS、消息量）
- Broker 配置管理
- NameServer 配置管理

**访问**：
```
http://localhost:8080
```

### 2.2 RocketMQ Exporter（Prometheus）

RocketMQ Exporter 用于导出指标到 Prometheus。

**部署**：
```bash
git clone https://github.com/apache/rocketmq-exporter.git
cd rocketmq-exporter

# 编译
mvn clean package -Dmaven.test.skip=true

# 运行
java -jar target/rocketmq-exporter-0.0.2-SNAPSHOT.jar \
  --rocketmq.config.namesrvAddr=localhost:9876 \
  --server.port=5557
```

**核心指标**：
```
# Producer 指标
rocketmq_producer_tps                      # 生产 TPS
rocketmq_producer_message_size             # 消息大小
rocketmq_producer_offset                   # 生产 offset

# Consumer 指标
rocketmq_consumer_tps                      # 消费 TPS
rocketmq_consumer_message_accumulation     # 消息堆积（重要）
rocketmq_consumer_offset                   # 消费 offset
rocketmq_consumer_lag                      # 消费延迟

# Broker 指标
rocketmq_broker_tps                        # Broker TPS
rocketmq_broker_qps                        # Broker QPS
rocketmq_brokeruntime_commitlog_disk_ratio # CommitLog 磁盘使用率
rocketmq_brokeruntime_pull_threadpool_headway_time  # 拉取线程池队列头部等待时间
```

**Grafana Dashboard**：
```bash
# 导入 RocketMQ Dashboard（ID: 10477）
# https://grafana.com/grafana/dashboards/10477
```

### 2.3 命令行工具（mqadmin）

RocketMQ 提供了强大的命令行工具。

**常用命令**：

**集群管理**：
```bash
# 查看集群列表
sh bin/mqadmin clusterList -n localhost:9876

# 查看 Broker 状态
sh bin/mqadmin brokerStatus -n localhost:9876 -b broker-a

# 查看 Broker 配置
sh bin/mqadmin getBrokerConfig -n localhost:9876 -b broker-a
```

**Topic 管理**：
```bash
# 创建 Topic
sh bin/mqadmin updateTopic -n localhost:9876 -t TestTopic -c DefaultCluster

# 删除 Topic
sh bin/mqadmin deleteTopic -n localhost:9876 -t TestTopic -c DefaultCluster

# 查看 Topic 列表
sh bin/mqadmin topicList -n localhost:9876

# 查看 Topic 状态
sh bin/mqadmin topicStatus -n localhost:9876 -t TestTopic
```

**Consumer 管理**：
```bash
# 查看消费进度
sh bin/mqadmin consumerProgress -n localhost:9876 -g my-consumer-group

# 重置消费位点（按时间）
sh bin/mqadmin resetOffsetByTime -n localhost:9876 -g my-consumer-group -t TestTopic -s -1

# 查看消费者连接
sh bin/mqadmin consumerConnection -n localhost:9876 -g my-consumer-group
```

**消息管理**：
```bash
# 按 ID 查询消息
sh bin/mqadmin queryMsgById -n localhost:9876 -i 0A0B0C0D00002A9F0000000000000000

# 按 Key 查询消息
sh bin/mqadmin queryMsgByKey -n localhost:9876 -t TestTopic -k order-123

# 发送消息
sh bin/mqadmin sendMessage -n localhost:9876 -t TestTopic -p "Hello RocketMQ"
```

---

## 3. RabbitMQ 监控与管理工具

### 3.1 Management Plugin

RabbitMQ 自带的 Web 管理界面。

**启用插件**：
```bash
sudo rabbitmq-plugins enable rabbitmq_management

# 重启服务
sudo systemctl restart rabbitmq-server
```

**访问**：
```
http://localhost:15672
默认用户名/密码：guest/guest（仅限 localhost）
```

**核心功能**：

**1. 概览（Overview）**：
- 集群状态
- 消息速率（发布、确认、投递）
- 连接数、通道数、队列数
- 节点信息

**2. 连接（Connections）**：
- 查看所有连接
- 连接详情（通道、消息速率）
- 关闭连接

**3. 通道（Channels）**：
- 查看所有通道
- 通道详情（消息速率、未确认消息）

**4. 交换机（Exchanges）**：
- 创建、删除交换机
- 查看交换机绑定
- 发布消息测试

**5. 队列（Queues）**：
- 创建、删除队列
- 查看队列消息数量
- 查看消费者
- 获取消息、清空队列

**6. 管理（Admin）**：
- 用户管理
- 虚拟主机管理
- 策略管理
- 集群管理

### 3.2 HTTP API

RabbitMQ 提供 RESTful API 用于监控和管理。

**API 端点**：
```bash
# 基础 URL
http://localhost:15672/api/

# 获取集群概览
curl -u admin:admin http://localhost:15672/api/overview

# 获取所有队列
curl -u admin:admin http://localhost:15672/api/queues

# 获取指定队列详情
curl -u admin:admin http://localhost:15672/api/queues/%2F/my-queue

# 获取所有连接
curl -u admin:admin http://localhost:15672/api/connections

# 创建队列
curl -u admin:admin -X PUT \
  http://localhost:15672/api/queues/%2F/new-queue \
  -H 'content-type: application/json' \
  -d '{"durable":true,"auto_delete":false}'

# 发布消息
curl -u admin:admin -X POST \
  http://localhost:15672/api/exchanges/%2F/amq.default/publish \
  -H 'content-type: application/json' \
  -d '{"properties":{},"routing_key":"my-queue","payload":"Hello","payload_encoding":"string"}'
```

### 3.3 RabbitMQ Prometheus Plugin

官方 Prometheus 插件。

**启用插件**：
```bash
sudo rabbitmq-plugins enable rabbitmq_prometheus

# 访问指标端点
curl http://localhost:15692/metrics
```

**核心指标**：
```
# 队列指标
rabbitmq_queue_messages                    # 队列消息总数
rabbitmq_queue_messages_ready              # 待消费消息数
rabbitmq_queue_messages_unacknowledged     # 未确认消息数
rabbitmq_queue_consumers                   # 消费者数量

# 节点指标
rabbitmq_node_mem_used                     # 内存使用
rabbitmq_node_disk_free                    # 磁盘剩余空间
rabbitmq_node_fd_used                      # 文件描述符使用
rabbitmq_node_sockets_used                 # Socket 使用

# 连接指标
rabbitmq_connections                       # 连接数
rabbitmq_channels                          # 通道数

# 消息指标
rabbitmq_channel_messages_published_total  # 发布消息总数
rabbitmq_channel_messages_confirmed_total  # 确认消息总数
rabbitmq_channel_messages_delivered_total  # 投递消息总数
```

**Prometheus 配置**：
```yaml
scrape_configs:
  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['localhost:15692']
```

**Grafana Dashboard**：
```bash
# 导入 RabbitMQ Dashboard（ID: 10991）
# https://grafana.com/grafana/dashboards/10991
```

### 3.4 命令行工具（rabbitmqctl）

**集群管理**：
```bash
# 查看集群状态
sudo rabbitmqctl cluster_status

# 查看节点状态
sudo rabbitmqctl status

# 查看环境信息
sudo rabbitmqctl environment
```

**队列管理**：
```bash
# 查看所有队列
sudo rabbitmqctl list_queues

# 查看队列详情（消息数、消费者数）
sudo rabbitmqctl list_queues name messages consumers

# 清空队列
sudo rabbitmqctl purge_queue my-queue
```

**用户管理**：
```bash
# 添加用户
sudo rabbitmqctl add_user admin admin123

# 设置用户标签
sudo rabbitmqctl set_user_tags admin administrator

# 设置权限
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# 查看用户列表
sudo rabbitmqctl list_users
```

**连接管理**：
```bash
# 查看所有连接
sudo rabbitmqctl list_connections

# 关闭连接
sudo rabbitmqctl close_connection "<connection_name>" "Closed by admin"
```

---

## 4. 核心监控指标体系

### 4.1 通用监控指标

**生产者指标**：
- **发送 TPS**：每秒发送消息数
- **发送延迟**：从发送到确认的时间
- **失败率**：发送失败消息占比
- **重试次数**：发送重试统计

**消费者指标**：
- **消费 TPS**：每秒消费消息数
- **消费延迟**：消息产生到消费的时间差
- **消息堆积量**：未消费消息数（最重要）
- **消费失败率**：消费失败消息占比

**Broker 指标**：
- **CPU 使用率**：Broker 进程 CPU 占用
- **内存使用率**：JVM 堆内存使用
- **磁盘使用率**：数据目录磁盘占用
- **网络流量**：入站/出站流量
- **连接数**：活跃连接数
- **线程数**：活跃线程数

**集群指标**：
- **节点状态**：在线/离线节点数
- **分区状态**：Leader 分布、ISR 状态
- **副本同步状态**：未同步副本数
- **Controller 状态**：Controller 选举次数

### 4.2 Kafka 关键监控指标

**必须监控**（P0）：
```
UnderReplicatedPartitions > 0                   # 未同步分区
OfflinePartitionsCount > 0                      # 离线分区
ActiveControllerCount != 1                      # Controller 异常
kafka_consumergroup_lag > threshold             # 消费延迟过大
```

**重要监控**（P1）：
```
LeaderElectionRate 持续增长                     # 频繁选举
RequestsPerSec 异常波动                        # 请求量异常
BytesInPerSec / BytesOutPerSec 异常            # 流量异常
FetchConsumerRequestsPerSec 下降               # 消费停滞
```

### 4.3 RocketMQ 关键监控指标

**必须监控**（P0）：
```
rocketmq_consumer_message_accumulation > threshold  # 消息堆积
rocketmq_broker_tps 突降                           # TPS 异常下降
Broker 宕机                                        # 节点不可用
消费者离线                                         # 消费停滞
```

**重要监控**（P1）：
```
rocketmq_brokeruntime_commitlog_disk_ratio > 90%   # 磁盘将满
rocketmq_producer_tps 异常                        # 生产异常
消费延迟持续增长                                   # 消费慢
发送/消费失败率 > 1%                               # 错误率高
```

### 4.4 RabbitMQ 关键监控指标

**必须监控**（P0）：
```
rabbitmq_queue_messages_ready 持续增长             # 消息堆积
rabbitmq_node_mem_used / limit > 0.9              # 内存告警
rabbitmq_node_disk_free < threshold               # 磁盘不足
节点宕机                                          # 节点不可用
```

**重要监控**（P1）：
```
rabbitmq_queue_messages_unacknowledged 持续增长    # 未确认消息堆积
rabbitmq_connections 异常                         # 连接异常
rabbitmq_node_fd_used / limit > 0.9               # 文件描述符不足
消息发布/投递速率异常                              # 吞吐量异常
```

---

## 5. 告警策略设计

### 5.1 告警级别

**P0（紧急）**：
- 服务不可用
- 数据丢失风险
- 需要立即处理

**P1（重要）**：
- 服务降级
- 性能严重下降
- 需要 1 小时内处理

**P2（一般）**：
- 性能轻微下降
- 资源使用偏高
- 需要 4 小时内处理

**P3（提醒）**：
- 潜在风险
- 建议优化
- 工作时间处理

### 5.2 Prometheus 告警规则

**Kafka 告警规则**：

```yaml
groups:
  - name: kafka_alerts
    interval: 30s
    rules:
      # P0：未同步分区
      - alert: KafkaUnderReplicatedPartitions
        expr: kafka_server_replicamanager_underreplicatedpartitions > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Kafka 存在未同步分区"
          description: "Broker {{ $labels.instance }} 有 {{ $value }} 个未同步分区"

      # P0：离线分区
      - alert: KafkaOfflinePartitions
        expr: kafka_controller_kafkacontroller_offlinepartitionscount > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Kafka 存在离线分区"
          description: "集群有 {{ $value }} 个离线分区"

      # P0：消费延迟过大
      - alert: KafkaConsumerLagHigh
        expr: kafka_consumergroup_lag > 10000
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Kafka 消费延迟过大"
          description: "消费者组 {{ $labels.consumergroup }} Topic {{ $labels.topic }} 延迟 {{ $value }} 条消息"

      # P1：磁盘使用率高
      - alert: KafkaDiskUsageHigh
        expr: (kafka_log_log_size / 1024 / 1024 / 1024) > 500
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "Kafka 磁盘使用率高"
          description: "Broker {{ $labels.instance }} 磁盘使用 {{ $value }} GB"
```

**RocketMQ 告警规则**：

```yaml
groups:
  - name: rocketmq_alerts
    interval: 30s
    rules:
      # P0：消息堆积
      - alert: RocketMQMessageAccumulation
        expr: rocketmq_consumer_message_accumulation > 100000
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "RocketMQ 消息堆积严重"
          description: "消费者组 {{ $labels.group }} Topic {{ $labels.topic }} 堆积 {{ $value }} 条消息"

      # P0：Broker 宕机
      - alert: RocketMQBrokerDown
        expr: up{job="rocketmq"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "RocketMQ Broker 宕机"
          description: "Broker {{ $labels.instance }} 不可用"

      # P1：磁盘使用率高
      - alert: RocketMQDiskUsageHigh
        expr: rocketmq_brokeruntime_commitlog_disk_ratio > 90
        for: 30m
        labels:
          severity: warning
        annotations:
          summary: "RocketMQ 磁盘使用率高"
          description: "Broker {{ $labels.cluster }} 磁盘使用率 {{ $value }}%"
```

**RabbitMQ 告警规则**：

```yaml
groups:
  - name: rabbitmq_alerts
    interval: 30s
    rules:
      # P0：内存告警
      - alert: RabbitMQMemoryAlarm
        expr: rabbitmq_node_mem_alarm == 1
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "RabbitMQ 内存告警"
          description: "节点 {{ $labels.node }} 触发内存告警"

      # P0：磁盘告警
      - alert: RabbitMQDiskAlarm
        expr: rabbitmq_node_disk_free_alarm == 1
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "RabbitMQ 磁盘告警"
          description: "节点 {{ $labels.node }} 触发磁盘告警"

      # P1：消息堆积
      - alert: RabbitMQQueueMessagesHigh
        expr: rabbitmq_queue_messages_ready > 10000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "RabbitMQ 队列消息堆积"
          description: "队列 {{ $labels.queue }} 堆积 {{ $value }} 条消息"
```

---

## 关键要点

1. **专用工具**：Kafka Manager、RocketMQ Dashboard、RabbitMQ Management Plugin
2. **Prometheus 集成**：三大 MQ 都支持 Prometheus Exporter
3. **核心指标**：消息堆积、消费延迟、TPS、资源使用率
4. **告警分级**：P0（紧急）、P1（重要）、P2（一般）、P3（提醒）
5. **命令行工具**：熟练使用 mqadmin、rabbitmqctl 等命令
6. **可视化**：使用 Grafana 构建监控大盘

---

## 深入一点

### 消息堆积的根因分析

**堆积原因**：
1. **消费速度慢**：业务逻辑耗时、数据库慢查询
2. **消费者故障**：消费者宕机、网络故障
3. **生产速度过快**：突发流量、未限流
4. **分区/队列不足**：并发度不够

**排查步骤**：
```bash
# 1. 查看消费者是否在线
kafka: bin/kafka-consumer-groups.sh --describe --group my-group --bootstrap-server localhost:9092
rocketmq: sh bin/mqadmin consumerConnection -n localhost:9876 -g my-group
rabbitmq: sudo rabbitmqctl list_consumers

# 2. 查看消费速率
# 对比生产速率和消费速率

# 3. 查看消费延迟
# 分析是业务逻辑慢还是消费者不足

# 4. 扩容消费者
# 增加消费者实例（不超过分区/队列数）

# 5. 优化业务逻辑
# 减少耗时操作、批量处理、异步化
```

### 监控最佳实践

**1. 监控数据分层**：
- **实时监控**：1 分钟粒度，保留 7 天
- **历史监控**：5 分钟粒度，保留 90 天
- **长期存储**：1 小时粒度，保留 1 年

**2. 告警降噪**：
- 使用 `for` 子句避免瞬时告警
- 设置合理阈值，避免过度告警
- 告警聚合，避免告警风暴

**3. 自动化运维**：
- 自动扩容消费者
- 自动清理过期数据
- 自动故障转移

---

## 参考资料

1. [Kafka Manager](https://github.com/yahoo/CMAK)
2. [RocketMQ Dashboard](https://github.com/apache/rocketmq-dashboard)
3. [RabbitMQ Management Plugin](https://www.rabbitmq.com/management.html)
4. [Prometheus Kafka Exporter](https://github.com/danielqsj/kafka_exporter)
5. [RabbitMQ Prometheus Plugin](https://www.rabbitmq.com/prometheus.html)
6. [Grafana Dashboards](https://grafana.com/grafana/dashboards/)

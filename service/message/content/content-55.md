# 监控指标体系

完善的监控体系是稳定运行的基础。本章介绍三大消息队列的核心监控指标。

## 1. Kafka 监控指标

### 1.1 Broker 指标

```yaml
# 基础指标
- kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec     # 消息流入速率
- kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec        # 字节流入速率
- kafka.server:type=BrokerTopicMetrics,name=BytesOutPerSec       # 字节流出速率

# 资源指标
- kafka.server:type=BrokerTopicMetrics,name=TotalFetchRequestsPerSec
- kafka.server:type=BrokerTopicMetrics,name=TotalProduceRequestsPerSec
- process_cpu_seconds_total                                       # CPU使用率
- jvm_memory_bytes_used                                          # JVM内存使用

# 副本指标
- kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions  # 未充分复制的分区
- kafka.server:type=ReplicaManager,name=PartitionCount            # 分区数
- kafka.server:type=ReplicaManager,name=LeaderCount               # Leader数
```

### 1.2 生产者指标

```yaml
- kafka.producer:type=producer-metrics,client-id=*,name=record-send-rate
- kafka.producer:type=producer-metrics,client-id=*,name=record-error-rate
- kafka.producer:type=producer-metrics,client-id=*,name=request-latency-avg
```

### 1.3 消费者指标

```yaml
- kafka.consumer:type=consumer-fetch-manager-metrics,client-id=*,name=records-lag-max
- kafka.consumer:type=consumer-fetch-manager-metrics,client-id=*,name=fetch-latency-avg
- kafka_consumergroup_lag                                         # 消费Lag（最重要）
```

## 2. RocketMQ 监控指标

```yaml
# Broker指标
- rocketmq_broker_tps                          # 消息吞吐量
- rocketmq_broker_qps                          # 查询速率
- rocketmq_broker_message_size                 # 消息大小
- rocketmq_broker_put_latency                  # 发送延迟
- rocketmq_broker_get_latency                  # 消费延迟

# 存储指标
- rocketmq_broker_commitlog_disk_ratio         # CommitLog磁盘使用率
- rocketmq_broker_commitlog_behind_bytes       # CommitLog落后字节数

# 消费指标
- rocketmq_consumer_tps                        # 消费TPS
- rocketmq_consumer_message_accumulation       # 消息堆积
```

## 3. RabbitMQ 监控指标

```yaml
# 连接指标
- rabbitmq_connections                         # 连接数
- rabbitmq_channels                            # 通道数

# 队列指标
- rabbitmq_queue_messages                      # 队列消息数
- rabbitmq_queue_messages_ready                # 就绪消息数
- rabbitmq_queue_messages_unacknowledged       # 未确认消息数
- rabbitmq_queue_consumers                     # 消费者数

# 节点指标
- rabbitmq_node_mem_used                       # 内存使用
- rabbitmq_node_disk_free                      # 磁盘剩余
- rabbitmq_node_fd_used                        # 文件描述符使用
```

## 4. Prometheus 配置

### 4.1 Kafka Exporter

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'kafka'
    static_configs:
      - targets: ['localhost:9308']
    
  - job_name: 'kafka-lag-exporter'
    static_configs:
      - targets: ['localhost:9999']
```

### 4.2 Grafana 面板

```json
{
  "dashboard": {
    "title": "Kafka Monitoring",
    "panels": [
      {
        "title": "Messages In Per Sec",
        "targets": [
          {
            "expr": "rate(kafka_server_brokertopicmetrics_messagesinpersec[5m])"
          }
        ]
      },
      {
        "title": "Consumer Lag",
        "targets": [
          {
            "expr": "kafka_consumergroup_lag"
          }
        ]
      }
    ]
  }
}
```

## 5. 关键指标告警阈值

| 指标 | 告警阈值 | 级别 |
|------|---------|------|
| 消费Lag | > 10000 | P2 |
| 消费Lag | > 100000 | P0 |
| 磁盘使用率 | > 80% | P2 |
| 磁盘使用率 | > 90% | P1 |
| CPU使用率 | > 80% | P2 |
| 内存使用率 | > 85% | P2 |
| 未充分复制分区 | > 0 | P1 |

## 关键要点
1. **消费Lag**：最重要的业务指标
2. **吞吐量**：TPS、QPS监控
3. **资源使用**：CPU、内存、磁盘
4. **副本状态**：未充分复制分区
5. **延迟指标**：P99延迟

## 参考资料
1. [Kafka Monitoring](https://kafka.apache.org/documentation/#monitoring)
2. [Prometheus Kafka Exporter](https://github.com/danielqsj/kafka_exporter)

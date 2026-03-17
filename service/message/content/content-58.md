# 容量规划与扩容

合理的容量规划避免资源浪费和性能问题。本章介绍容量规划方法。

## 1. 容量评估

### 1.1 消息量评估

```
日消息量 = 业务TPS × 86400秒

示例：
- 订单系统TPS：1000
- 日消息量 = 1000 × 86400 = 8640万条
```

### 1.2 存储容量

```
存储需求 = 日消息量 × 平均消息大小 × 保留天数 × 副本数

示例：
- 日消息量：8640万条
- 平均消息大小：1KB
- 保留天数：7天
- 副本数：3

存储需求 = 86400000 × 1KB × 7 × 3
         = 1,814,400,000 KB
         ≈ 1.8TB

推荐配置：2TB（预留10%余量）
```

### 1.3 网络带宽

```
网络带宽 = 峰值TPS × 平均消息大小 × 8

示例：
- 峰值TPS：5000（为平均TPS的5倍）
- 平均消息大小：1KB

网络带宽 = 5000 × 1KB × 8
         = 40Mb/s

推荐配置：100Mb/s（预留足够余量）
```

### 1.4 CPU和内存

```
CPU核数 = 分区数 / 每核处理能力

示例：
- 分区数：100
- 每核处理能力：10个分区

CPU核数 = 100 / 10 = 10核

内存 = Page Cache + JVM Heap + OS
     = 4GB + 8GB + 2GB
     = 14GB

推荐配置：16GB内存
```

## 2. Kafka容量规划

### 2.1 分区数规划

```
分区数 = 目标吞吐量 / 单分区吞吐量

示例：
- 目标吞吐量：100MB/s
- 单分区吞吐量：10MB/s（经验值）

分区数 = 100 / 10 = 10个分区

建议：
- 单Topic不超过1000个分区
- 单Broker不超过4000个分区
```

### 2.2 Broker数量

```
Broker数量 = 总分区数 / 单Broker分区数

示例：
- 总分区数：300
- 单Broker分区数：100（经验值）

Broker数量 = 300 / 100 = 3个Broker

最小副本数：3（生产环境推荐）
```

### 2.3 硬件配置

```yaml
# 入门级（开发/测试）
cpu: 4核
memory: 8GB
disk: 500GB HDD
network: 1Gb/s

# 生产级
cpu: 16核
memory: 64GB
disk: 2TB SSD
network: 10Gb/s

# 大规模
cpu: 32核
memory: 128GB
disk: 10TB SSD
network: 25Gb/s
```

## 3. 扩容方案

### 3.1 垂直扩容

```
增加单机资源：
- 增加CPU核数
- 增加内存
- 更换SSD
- 升级网卡

优点：简单，无需迁移
缺点：有上限，成本高
```

### 3.2 水平扩容

**Kafka水平扩容**：

```bash
# 1. 添加新Broker
# 修改broker.id，启动新Broker

# 2. 创建分区重分配计划
cat > reassignment.json << EOF
{
  "version": 1,
  "partitions": [
    {"topic": "my-topic", "partition": 0, "replicas": [0, 1, 2]},
    {"topic": "my-topic", "partition": 1, "replicas": [1, 2, 3]},
    {"topic": "my-topic", "partition": 2, "replicas": [2, 3, 0]}
  ]
}
EOF

# 3. 执行重分配
kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \
  --reassignment-json-file reassignment.json \
  --execute

# 4. 验证重分配
kafka-reassign-partitions.sh --bootstrap-server localhost:9092 \
  --reassignment-json-file reassignment.json \
  --verify
```

**RocketMQ水平扩容**：

```bash
# 1. 启动新Broker
nohup sh bin/mqbroker -n localhost:9876 &

# 2. 增加队列数（自动负载均衡）
mqadmin updateTopic -n localhost:9876 -t MyTopic -r 16 -w 16

# 3. 消费者自动重平衡，无需额外操作
```

## 4. 缩容方案

```bash
# Kafka缩容

# 1. 停止要移除的Broker
kafka-server-stop.sh

# 2. 重新分配其上的分区到其他Broker
# 使用reassign-partitions工具

# 3. 确认分区迁移完成后，从集群中移除

# RocketMQ缩容

# 1. 停止Broker
sh bin/mqshutdown broker

# 2. 删除Broker注册信息
mqadmin deleteBroker -n localhost:9876 -b broker-a -c DefaultCluster
```

## 5. 性能测试

### 5.1 Kafka性能测试

```bash
# 生产者测试
kafka-producer-perf-test.sh \
  --topic test \
  --num-records 10000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props bootstrap.servers=localhost:9092

# 消费者测试
kafka-consumer-perf-test.sh \
  --topic test \
  --messages 10000000 \
  --bootstrap-server localhost:9092
```

### 5.2 压测建议

```
1. 模拟真实业务场景
2. 测试峰值流量（平均流量的3-5倍）
3. 测试长时间运行（24小时以上）
4. 监控各项指标
5. 记录性能基线
```

## 6. 容量监控

```yaml
# Grafana面板
- 磁盘使用率
- 网络带宽使用率
- CPU使用率
- 内存使用率
- 消息吞吐量
- 消费Lag

# 告警阈值
- 磁盘使用率 > 80% → 扩容告警
- 网络带宽 > 70% → 扩容告警
- CPU使用率 > 80% → 扩容告警
```

## 关键要点
1. **提前规划**：基于业务增长预测
2. **预留余量**：资源预留30%以上
3. **定期review**：每季度评估容量
4. **灰度扩容**：先小规模测试
5. **监控驱动**：基于监控数据决策

## 参考资料
1. [Kafka Hardware Selection](https://kafka.apache.org/documentation/#hwandos)
2. [Capacity Planning](https://www.confluent.io/blog/how-choose-number-topics-partitions-kafka-cluster/)

# Kafka 命令行工具

## 概述

Kafka提供了丰富的命令行工具用于集群管理和运维。本章系统介绍常用命令行工具的使用方法。

---

## 1. kafka-topics：Topic管理

### 1.1 创建Topic

```bash
kafka-topics.sh --create \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 6 \
  --replication-factor 3 \
  --config retention.ms=86400000 \
  --config segment.bytes=536870912
```

### 1.2 查询Topic

```bash
# 列出所有Topic
kafka-topics.sh --list --bootstrap-server localhost:9092

# 查看Topic详情
kafka-topics.sh --describe \
  --topic my-topic \
  --bootstrap-server localhost:9092

# 输出示例：
# Topic: my-topic  PartitionCount: 6  ReplicationFactor: 3
# Topic: my-topic  Partition: 0  Leader: 1  Replicas: 1,2,3  Isr: 1,2,3
```

### 1.3 修改Topic

```bash
# 增加分区数（只能增加，不能减少）
kafka-topics.sh --alter \
  --topic my-topic \
  --partitions 12 \
  --bootstrap-server localhost:9092
```

### 1.4 删除Topic

```bash
kafka-topics.sh --delete \
  --topic my-topic \
  --bootstrap-server localhost:9092
```

---

## 2. kafka-configs：配置管理

### 2.1 查询配置

```bash
# 查询Topic配置
kafka-configs.sh --describe \
  --entity-type topics \
  --entity-name my-topic \
  --bootstrap-server localhost:9092

# 查询Broker配置
kafka-configs.sh --describe \
  --entity-type brokers \
  --entity-name 0 \
  --bootstrap-server localhost:9092
```

### 2.2 修改配置

```bash
# 添加配置
kafka-configs.sh --alter \
  --entity-type topics \
  --entity-name my-topic \
  --add-config retention.ms=172800000 \
  --bootstrap-server localhost:9092

# 修改多个配置
kafka-configs.sh --alter \
  --entity-type topics \
  --entity-name my-topic \
  --add-config retention.ms=172800000,segment.bytes=1073741824 \
  --bootstrap-server localhost:9092
```

### 2.3 删除配置

```bash
kafka-configs.sh --alter \
  --entity-type topics \
  --entity-name my-topic \
  --delete-config retention.ms \
  --bootstrap-server localhost:9092
```

---

## 3. kafka-console-producer/consumer：消息生产与消费

### 3.1 控制台生产

```bash
# 基础生产
kafka-console-producer.sh \
  --topic my-topic \
  --bootstrap-server localhost:9092

# 指定Key
kafka-console-producer.sh \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --property "parse.key=true" \
  --property "key.separator=:"

# 输入格式：key:value
```

### 3.2 控制台消费

```bash
# 从最新开始消费
kafka-console-consumer.sh \
  --topic my-topic \
  --bootstrap-server localhost:9092

# 从最早开始消费
kafka-console-consumer.sh \
  --topic my-topic \
  --from-beginning \
  --bootstrap-server localhost:9092

# 显示Key
kafka-console-consumer.sh \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --property print.key=true \
  --property key.separator=":"
```

---

## 4. kafka-consumer-groups：消费者组管理

### 4.1 列出消费者组

```bash
kafka-consumer-groups.sh --list --bootstrap-server localhost:9092
```

### 4.2 查看消费者组详情

```bash
kafka-consumer-groups.sh --describe \
  --group my-group \
  --bootstrap-server localhost:9092

# 输出示例：
# GROUP     TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# my-group  my-topic  0          1234            1534            300
```

### 4.3 查看消费者组成员

```bash
kafka-consumer-groups.sh --describe \
  --group my-group \
  --members \
  --bootstrap-server localhost:9092

# 查看详细成员信息
kafka-consumer-groups.sh --describe \
  --group my-group \
  --members \
  --verbose \
  --bootstrap-server localhost:9092
```

### 4.4 删除消费者组

```bash
kafka-consumer-groups.sh --delete \
  --group my-group \
  --bootstrap-server localhost:9092
```

---

## 5. kafka-reassign-partitions：分区重分配

### 5.1 生成重分配计划

```bash
# 创建topics-to-move.json
cat > topics-to-move.json << EOF
{
  "topics": [
    {"topic": "my-topic"}
  ],
  "version": 1
}
EOF

# 生成重分配计划
kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --topics-to-move-json-file topics-to-move.json \
  --broker-list "0,1,2,3" \
  --generate
```

### 5.2 执行重分配

```bash
# 创建reassignment.json（从上一步生成）
kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --reassignment-json-file reassignment.json \
  --execute
```

### 5.3 验证重分配

```bash
kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --reassignment-json-file reassignment.json \
  --verify
```

---

## 6. kafka-preferred-replica-election：优先副本选举

```bash
# 触发优先副本选举（所有Topic）
kafka-leader-election.sh \
  --bootstrap-server localhost:9092 \
  --election-type preferred \
  --all-topic-partitions

# 触发特定Topic
kafka-leader-election.sh \
  --bootstrap-server localhost:9092 \
  --election-type preferred \
  --topic my-topic \
  --partition 0
```

---

## 7. kafka-log-dirs：日志目录查询

```bash
# 查看Broker日志目录
kafka-log-dirs.sh \
  --describe \
  --bootstrap-server localhost:9092 \
  --broker-list 0,1,2

# 查看特定Topic
kafka-log-dirs.sh \
  --describe \
  --bootstrap-server localhost:9092 \
  --topic-list my-topic
```

---

## 8. 其他常用工具

### 8.1 kafka-broker-api-versions

```bash
# 查看Broker API版本
kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### 8.2 kafka-dump-log

```bash
# 查看日志文件内容
kafka-dump-log.sh \
  --files /var/kafka-logs/my-topic-0/00000000000000000000.log \
  --print-data-log
```

### 8.3 kafka-delete-records

```bash
# 删除指定Offset之前的消息
cat > delete-records.json << EOF
{
  "partitions": [
    {"topic": "my-topic", "partition": 0, "offset": 1000}
  ],
  "version": 1
}
EOF

kafka-delete-records.sh \
  --bootstrap-server localhost:9092 \
  --offset-json-file delete-records.json
```

---

## 9. 常用运维脚本

### 9.1 批量创建Topic

```bash
#!/bin/bash
# batch-create-topics.sh

TOPICS=("orders" "payments" "notifications")

for topic in "${TOPICS[@]}"; do
  kafka-topics.sh --create \
    --topic "$topic" \
    --bootstrap-server localhost:9092 \
    --partitions 6 \
    --replication-factor 3 \
    --config retention.ms=86400000
done
```

### 9.2 监控消费Lag

```bash
#!/bin/bash
# monitor-lag.sh

kafka-consumer-groups.sh --describe \
  --group my-group \
  --bootstrap-server localhost:9092 | \
  awk 'NR>1 {if($6>10000) print $1,$2,$3,$6}'
```

### 9.3 导出Offset

```bash
#!/bin/bash
# export-offsets.sh

kafka-consumer-groups.sh --describe \
  --all-groups \
  --bootstrap-server localhost:9092 > offsets-backup.txt
```

---

## 关键要点

1. **kafka-topics**：Topic创建、查询、修改、删除
2. **kafka-configs**：配置查询和修改
3. **kafka-consumer-groups**：消费者组管理和Lag监控
4. **kafka-reassign-partitions**：分区重分配
5. **运维脚本**：批量操作和自动化

---

## 深入一点

**分区重分配流程**：

```
1. 生成重分配计划
   kafka-reassign-partitions.sh --generate
   
2. 编辑reassignment.json（可选）
   
3. 执行重分配
   kafka-reassign-partitions.sh --execute
   
4. 验证重分配
   kafka-reassign-partitions.sh --verify
   
5. 监控进度
   - 副本同步
   - 日志迁移
   - 流量影响
```

**消费Lag计算**：

```
LAG = LOG-END-OFFSET - CURRENT-OFFSET

示例：
LOG-END-OFFSET: 10000（生产者写到的位置）
CURRENT-OFFSET: 9500（消费者读到的位置）
LAG: 10000 - 9500 = 500（堆积500条）

告警：
- LAG > 10000：P2告警
- LAG > 100000：P1告警
```

---

## 参考资料

1. [Kafka Tools](https://kafka.apache.org/documentation/#tools)
2. [Kafka Operations](https://kafka.apache.org/documentation/#operations)

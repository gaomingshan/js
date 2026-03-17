# Kafka 命令行工具

## 概述

Kafka 提供了丰富的命令行工具用于集群管理。本章介绍常用命令及实战技巧。

---

## 1. Topic 管理

```bash
# 创建 Topic
kafka-topics.sh --create \
  --topic my-topic \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 2

# 查看 Topic 列表
kafka-topics.sh --list --bootstrap-server localhost:9092

# 查看 Topic 详情
kafka-topics.sh --describe --topic my-topic --bootstrap-server localhost:9092

# 增加分区
kafka-topics.sh --alter --topic my-topic --partitions 6 --bootstrap-server localhost:9092

# 删除 Topic
kafka-topics.sh --delete --topic my-topic --bootstrap-server localhost:9092
```

---

## 2. 消费者组管理

```bash
# 查看消费者组列表
kafka-consumer-groups.sh --list --bootstrap-server localhost:9092

# 查看消费者组详情（Lag）
kafka-consumer-groups.sh --describe --group my-group --bootstrap-server localhost:9092

# 重置 Offset（最早）
kafka-consumer-groups.sh --reset-offsets --group my-group --topic my-topic --to-earliest --execute --bootstrap-server localhost:9092

# 重置到指定时间
kafka-consumer-groups.sh --reset-offsets --group my-group --topic my-topic --to-datetime 2024-01-01T00:00:00.000 --execute --bootstrap-server localhost:9092

# 删除消费者组
kafka-consumer-groups.sh --delete --group my-group --bootstrap-server localhost:9092
```

---

## 3. 生产消费测试

```bash
# 生产者
kafka-console-producer.sh --topic my-topic --bootstrap-server localhost:9092

# 消费者（从最新）
kafka-console-consumer.sh --topic my-topic --bootstrap-server localhost:9092

# 消费者（从头开始）
kafka-console-consumer.sh --topic my-topic --from-beginning --bootstrap-server localhost:9092

# 性能测试
kafka-producer-perf-test.sh --topic test --num-records 1000000 --record-size 1024 --throughput -1 --producer-props bootstrap.servers=localhost:9092
```

---

## 4. 配置管理

```bash
# 查看 Topic 配置
kafka-configs.sh --describe --entity-type topics --entity-name my-topic --bootstrap-server localhost:9092

# 修改配置
kafka-configs.sh --alter --entity-type topics --entity-name my-topic --add-config retention.ms=86400000 --bootstrap-server localhost:9092

# 删除配置
kafka-configs.sh --alter --entity-type topics --entity-name my-topic --delete-config retention.ms --bootstrap-server localhost:9092
```

---

## 5. 集群管理

```bash
# 查看 Broker 版本
kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# 查看日志目录
kafka-log-dirs.sh --describe --bootstrap-server localhost:9092

# 分区重分配
kafka-reassign-partitions.sh --bootstrap-server localhost:9092 --reassignment-json-file reassignment.json --execute
```

---

## 关键要点

1. **Topic 管理**：create、describe、alter、delete
2. **消费者组**：查看 Lag、重置 Offset
3. **性能测试**：perf-test 工具
4. **配置管理**：kafka-configs.sh
5. **批量操作**：使用脚本封装

---

## 参考资料

1. [Kafka Tools](https://kafka.apache.org/documentation/#tools)

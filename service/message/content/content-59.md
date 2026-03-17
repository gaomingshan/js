# 备份与恢复

数据备份是灾难恢复的最后防线。本章介绍消息队列的备份恢复方案。

## 1. Kafka备份

### 1.1 MirrorMaker备份

```bash
# 使用MirrorMaker 2.0将主集群数据同步到备份集群

# connect-mirror-maker.properties
clusters = primary, backup

primary.bootstrap.servers = primary-kafka:9092
backup.bootstrap.servers = backup-kafka:9092

primary->backup.enabled = true
primary->backup.topics = .*

# 启动MirrorMaker
bin/connect-mirror-maker.sh connect-mirror-maker.properties
```

### 1.2 数据目录备份

```bash
#!/bin/bash
# kafka-backup.sh

BACKUP_DIR="/backup/kafka"
DATE=$(date +%Y%m%d_%H%M%S)

# 1. 停止Kafka（可选，建议在低峰期）
# bin/kafka-server-stop.sh

# 2. 备份数据目录
tar -czf "$BACKUP_DIR/kafka-data-$DATE.tar.gz" /var/kafka-logs

# 3. 备份配置文件
tar -czf "$BACKUP_DIR/kafka-config-$DATE.tar.gz" /opt/kafka/config

# 4. 重启Kafka
# bin/kafka-server-start.sh config/server.properties

echo "Backup completed: $BACKUP_DIR"
```

### 1.3 Topic元数据备份

```bash
# 导出Topic配置
kafka-topics.sh --describe --bootstrap-server localhost:9092 > topics-backup.txt

# 备份消费者组Offset
kafka-consumer-groups.sh --describe --all-groups --bootstrap-server localhost:9092 > offsets-backup.txt
```

## 2. RocketMQ备份

### 2.1 数据备份

```bash
#!/bin/bash
# rocketmq-backup.sh

BACKUP_DIR="/backup/rocketmq"
DATE=$(date +%Y%m%d_%H%M%S)

# 1. 停止Broker（可选）
# sh bin/mqshutdown broker

# 2. 备份CommitLog
tar -czf "$BACKUP_DIR/commitlog-$DATE.tar.gz" /data/rocketmq/store/commitlog

# 3. 备份ConsumeQueue
tar -czf "$BACKUP_DIR/consumequeue-$DATE.tar.gz" /data/rocketmq/store/consumequeue

# 4. 备份配置
tar -czf "$BACKUP_DIR/config-$DATE.tar.gz" /data/rocketmq/conf

# 5. 重启Broker
# nohup sh bin/mqbroker -c conf/broker.conf &

echo "Backup completed: $BACKUP_DIR"
```

### 2.2 Topic元数据备份

```bash
# 导出Topic配置
mqadmin topicList -n localhost:9876 > topics-backup.txt

# 导出消费进度
mqadmin consumerProgress -n localhost:9876 > consumer-progress-backup.txt
```

## 3. RabbitMQ备份

### 3.1 定义导出

```bash
# 导出所有定义（队列、Exchange、绑定等）
rabbitmqadmin export backup.json

# 导入定义
rabbitmqadmin import backup.json
```

### 3.2 数据备份

```bash
#!/bin/bash
# rabbitmq-backup.sh

BACKUP_DIR="/backup/rabbitmq"
DATE=$(date +%Y%m%d_%H%M%S)

# 1. 停止RabbitMQ
sudo systemctl stop rabbitmq-server

# 2. 备份数据目录
tar -czf "$BACKUP_DIR/rabbitmq-data-$DATE.tar.gz" /var/lib/rabbitmq

# 3. 备份配置
tar -czf "$BACKUP_DIR/rabbitmq-config-$DATE.tar.gz" /etc/rabbitmq

# 4. 重启RabbitMQ
sudo systemctl start rabbitmq-server

echo "Backup completed: $BACKUP_DIR"
```

## 4. 恢复方案

### 4.1 Kafka恢复

```bash
# 1. 停止Kafka
bin/kafka-server-stop.sh

# 2. 恢复数据目录
tar -xzf kafka-data-20240101.tar.gz -C /

# 3. 恢复配置
tar -xzf kafka-config-20240101.tar.gz -C /

# 4. 启动Kafka
bin/kafka-server-start.sh config/server.properties

# 5. 验证数据
kafka-topics.sh --list --bootstrap-server localhost:9092
```

### 4.2 RocketMQ恢复

```bash
# 1. 停止Broker
sh bin/mqshutdown broker

# 2. 恢复CommitLog
tar -xzf commitlog-20240101.tar.gz -C /

# 3. 恢复ConsumeQueue
tar -xzf consumequeue-20240101.tar.gz -C /

# 4. 启动Broker
nohup sh bin/mqbroker -c conf/broker.conf &

# 5. 验证数据
mqadmin topicList -n localhost:9876
```

### 4.3 RabbitMQ恢复

```bash
# 1. 停止RabbitMQ
sudo systemctl stop rabbitmq-server

# 2. 恢复数据目录
tar -xzf rabbitmq-data-20240101.tar.gz -C /

# 3. 启动RabbitMQ
sudo systemctl start rabbitmq-server

# 4. 恢复定义（如需）
rabbitmqadmin import backup.json
```

## 5. 增量备份

```bash
# 使用rsync增量备份
rsync -avz --delete /var/kafka-logs/ backup-server:/backup/kafka/

# 定时任务
# crontab -e
0 2 * * * /scripts/incremental-backup.sh
```

## 6. 云端备份

```bash
# 备份到OSS/S3
aws s3 sync /var/kafka-logs s3://my-kafka-backup/$(date +%Y%m%d)/

# 阿里云OSS
ossutil cp -r /var/kafka-logs oss://my-kafka-backup/$(date +%Y%m%d)/
```

## 7. 备份策略

**3-2-1原则**：
- 3份副本
- 2种不同介质（磁盘+OSS）
- 1份异地备份

**保留策略**：
- 全量备份：每周一次，保留4周
- 增量备份：每天一次，保留7天
- 配置备份：每次变更，永久保留

**验证策略**：
- 每月一次恢复演练
- 验证备份完整性
- 记录恢复时间

## 8. 容灾演练

```bash
#!/bin/bash
# disaster-recovery-drill.sh

echo "容灾演练开始"

# 1. 模拟故障
echo "1. 模拟主集群故障"
# 停止主集群

# 2. 切换到备份集群
echo "2. 切换到备份集群"
# 修改应用配置，指向备份集群

# 3. 验证服务
echo "3. 验证服务可用性"
kafka-topics.sh --list --bootstrap-server backup-kafka:9092

# 4. 恢复主集群
echo "4. 恢复主集群"
# 从备份恢复

# 5. 切回主集群
echo "5. 切回主集群"
# 修改应用配置

echo "容灾演练完成"
```

## 关键要点
1. **定期备份**：每天增量，每周全量
2. **异地备份**：防止机房级故障
3. **验证恢复**：定期演练恢复流程
4. **自动化**：使用脚本自动备份
5. **监控告警**：备份失败及时告警

## 参考资料
1. [Kafka Disaster Recovery](https://docs.confluent.io/platform/current/kafka/disaster-recovery.html)
2. [RabbitMQ Backup](https://www.rabbitmq.com/backup.html)

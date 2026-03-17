# 集群运维脚本

## 概述

自动化运维脚本提升运维效率。本章提供实用的运维脚本模板。

---

## 1. Kafka 运维脚本

### 1.1 批量创建 Topic

```bash
#!/bin/bash
# create-topics.sh

BOOTSTRAP_SERVERS="localhost:9092"

topics=(
  "order-topic:6:3"
  "payment-topic:6:3"
  "notification-topic:3:3"
)

for topic_config in "${topics[@]}"; do
  IFS=':' read -r topic partitions replicas <<< "$topic_config"
  
  kafka-topics.sh --create \
    --topic "$topic" \
    --partitions "$partitions" \
    --replication-factor "$replicas" \
    --bootstrap-server "$BOOTSTRAP_SERVERS"
  
  echo "Created topic: $topic"
done
```

### 1.2 监控 Lag 脚本

```bash
#!/bin/bash
# monitor-lag.sh

BOOTSTRAP_SERVERS="localhost:9092"
THRESHOLD=10000

kafka-consumer-groups.sh --describe --all-groups --bootstrap-server "$BOOTSTRAP_SERVERS" | \
awk -v threshold=$THRESHOLD '
  /GROUP/ { next }
  $6 ~ /^[0-9]+$/ && $6 > threshold {
    printf "ALERT: Group=%s Topic=%s Partition=%s Lag=%s\n", $1, $2, $3, $6
  }
'
```

---

## 2. RocketMQ 运维脚本

### 2.1 批量创建 Topic

```bash
#!/bin/bash
# create-topics.sh

NAMESRV="localhost:9876"
CLUSTER="DefaultCluster"

topics=(
  "OrderTopic:8:8"
  "PaymentTopic:8:8"
)

for topic_config in "${topics[@]}"; do
  IFS=':' read -r topic read_queues write_queues <<< "$topic_config"
  
  sh mqadmin updateTopic \
    -n "$NAMESRV" \
    -t "$topic" \
    -c "$CLUSTER" \
    -r "$read_queues" \
    -w "$write_queues"
  
  echo "Created topic: $topic"
done
```

### 2.2 消费进度监控

```bash
#!/bin/bash
# monitor-consumer.sh

NAMESRV="localhost:9876"
THRESHOLD=10000

sh mqadmin consumerProgress -n "$NAMESRV" | \
awk -v threshold=$THRESHOLD '
  /Diff/ { next }
  $4 ~ /^[0-9]+$/ && $4 > threshold {
    printf "ALERT: Topic=%s QueueId=%s Diff=%s\n", $1, $2, $4
  }
'
```

---

## 3. RabbitMQ 运维脚本

### 3.1 批量创建队列

```bash
#!/bin/bash
# create-queues.sh

queues=(
  "order-queue"
  "payment-queue"
  "notification-queue"
)

for queue in "${queues[@]}"; do
  rabbitmqadmin declare queue name="$queue" durable=true
  echo "Created queue: $queue"
done
```

### 3.2 队列监控

```bash
#!/bin/bash
# monitor-queues.sh

THRESHOLD=10000

rabbitmqctl list_queues name messages | \
awk -v threshold=$THRESHOLD '
  $2 ~ /^[0-9]+$/ && $2 > threshold {
    printf "ALERT: Queue=%s Messages=%s\n", $1, $2
  }
'
```

---

## 4. 通用运维脚本

### 4.1 健康检查

```bash
#!/bin/bash
# health-check.sh

check_kafka() {
  kafka-broker-api-versions.sh --bootstrap-server localhost:9092 &>/dev/null
  if [ $? -eq 0 ]; then
    echo "✓ Kafka is healthy"
  else
    echo "✗ Kafka is down"
    return 1
  fi
}

check_rocketmq() {
  telnet localhost 9876 &>/dev/null
  if [ $? -eq 0 ]; then
    echo "✓ RocketMQ is healthy"
  else
    echo "✗ RocketMQ is down"
    return 1
  fi
}

check_rabbitmq() {
  rabbitmqctl status &>/dev/null
  if [ $? -eq 0 ]; then
    echo "✓ RabbitMQ is healthy"
  else
    echo "✗ RabbitMQ is down"
    return 1
  fi
}

check_kafka
check_rocketmq
check_rabbitmq
```

### 4.2 自动备份

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/mq"
DATE=$(date +%Y%m%d_%H%M%S)

# Kafka 配置备份
cp -r /var/kafka/config "$BACKUP_DIR/kafka_config_$DATE"

# RocketMQ 配置备份
cp -r /data/rocketmq/conf "$BACKUP_DIR/rocketmq_conf_$DATE"

# RabbitMQ 定义导出
rabbitmqadmin export "$BACKUP_DIR/rabbitmq_definitions_$DATE.json"

echo "Backup completed: $BACKUP_DIR"
```

---

## 5. Cron 定时任务

```bash
# crontab -e

# 每5分钟监控 Lag
*/5 * * * * /opt/scripts/monitor-lag.sh

# 每天凌晨2点备份
0 2 * * * /opt/scripts/backup.sh

# 每小时健康检查
0 * * * * /opt/scripts/health-check.sh
```

---

## 关键要点

1. **批量操作**：使用脚本批量创建资源
2. **监控告警**：定期检查 Lag 和堆积
3. **健康检查**：自动化检测服务状态
4. **定时备份**：防止配置丢失
5. **日志记录**：所有操作记录日志

---

## 参考资料

1. [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)

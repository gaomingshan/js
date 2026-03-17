# 故障排查与诊断

快速定位和解决故障是运维的核心能力。本章介绍常见故障排查方法。

## 1. 消息发送失败

**症状**：
```
TimeoutException: Failed to update metadata after 60000 ms
```

**排查步骤**：

```bash
# 1. 检查Broker是否可访问
telnet kafka-broker 9092

# 2. 检查Topic是否存在
kafka-topics.sh --list --bootstrap-server localhost:9092

# 3. 查看Broker日志
tail -f /var/log/kafka/server.log

# 4. 检查网络
ping kafka-broker
netstat -an | grep 9092
```

**常见原因**：
- Broker不可用
- 网络问题
- Topic不存在
- 配置错误

## 2. 消费Lag持续增长

**症状**：
```
kafka_consumergroup_lag 持续上升
```

**排查步骤**：

```bash
# 1. 查看消费者状态
kafka-consumer-groups.sh --describe --group my-group --bootstrap-server localhost:9092

# 2. 检查消费者是否在线
kafka-consumer-groups.sh --describe --group my-group --members --bootstrap-server localhost:9092

# 3. 查看消费者日志
tail -f application.log | grep ERROR

# 4. 检查下游依赖
# 数据库慢查询、第三方服务超时等
```

**解决方案**：
1. 增加消费者实例
2. 增加分区数
3. 优化消费逻辑
4. 批量处理

## 3. Broker宕机

**症状**：
```
java.io.IOException: Connection to broker-1 failed
```

**排查步骤**：

```bash
# 1. 检查Broker进程
ps aux | grep kafka

# 2. 检查磁盘空间
df -h

# 3. 检查内存
free -m

# 4. 查看系统日志
dmesg | tail
journalctl -u kafka -n 100

# 5. 检查JVM内存
jstat -gcutil <pid> 1000
```

**常见原因**：
- OOM（内存溢出）
- 磁盘满
- 网络分区
- 硬件故障

## 4. 消息重复消费

**症状**：
```
同一条消息被处理多次
```

**排查步骤**：

```bash
# 1. 检查消费者配置
enable.auto.commit=false  # 是否手动提交

# 2. 查看消费日志
# 确认是否正确提交Offset

# 3. 检查消费者重启记录
# 重启可能导致重复消费
```

**解决方案**：
1. 确保幂等性
2. 正确提交Offset
3. 使用唯一ID去重

## 5. 性能下降

**症状**：
```
P99延迟上升，吞吐量下降
```

**排查步骤**：

```bash
# 1. 检查CPU使用率
top
htop

# 2. 检查磁盘I/O
iostat -x 1

# 3. 检查网络
iftop
nethogs

# 4. 检查GC
jstat -gc <pid> 1000

# 5. 查看慢查询
# Kafka慢请求日志
grep "Request.*took.*ms" server.log
```

**优化建议**：
1. 增加Broker节点
2. 使用SSD
3. 调整JVM参数
4. 启用压缩

## 6. 诊断工具

### 6.1 Kafka诊断

```bash
# 查看Topic详情
kafka-topics.sh --describe --topic my-topic --bootstrap-server localhost:9092

# 查看消费者组
kafka-consumer-groups.sh --describe --group my-group --bootstrap-server localhost:9092

# 查看Broker配置
kafka-configs.sh --describe --entity-type brokers --entity-name 0 --bootstrap-server localhost:9092

# 日志目录大小
kafka-log-dirs.sh --describe --bootstrap-server localhost:9092
```

### 6.2 RocketMQ诊断

```bash
# 查看集群状态
mqadmin clusterList -n localhost:9876

# 查看Broker状态
mqadmin brokerStatus -n localhost:9876 -b broker-a

# 查看消费进度
mqadmin consumerProgress -n localhost:9876 -g my-group

# 查询消息
mqadmin queryMsgById -n localhost:9876 -i <msgId>
```

### 6.3 RabbitMQ诊断

```bash
# 查看集群状态
rabbitmqctl cluster_status

# 查看队列
rabbitmqctl list_queues name messages consumers

# 查看连接
rabbitmqctl list_connections

# 查看内存使用
rabbitmqctl status | grep memory
```

## 7. 常见错误码

| 错误码 | 说明 | 解决方法 |
|--------|------|---------|
| UNKNOWN_TOPIC_OR_PARTITION | Topic不存在 | 创建Topic |
| OFFSET_OUT_OF_RANGE | Offset越界 | 重置Offset |
| NOT_LEADER_FOR_PARTITION | 不是Leader | 重试或刷新元数据 |
| REQUEST_TIMED_OUT | 请求超时 | 增大超时配置 |
| BROKER_NOT_AVAILABLE | Broker不可用 | 检查Broker状态 |

## 关键要点
1. **日志优先**：先查看日志
2. **分层排查**：网络→Broker→客户端
3. **工具辅助**：善用命令行工具
4. **监控数据**：结合监控定位
5. **记录过程**：故障处理记录

## 参考资料
1. [Kafka Troubleshooting](https://kafka.apache.org/documentation/#troubleshooting)
2. [RocketMQ FAQ](https://rocketmq.apache.org/docs/faq/)

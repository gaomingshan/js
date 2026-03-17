# 升级与迁移方案

平滑升级和迁移是运维的重要技能。本章介绍升级迁移的最佳实践。

## 1. Kafka滚动升级

### 1.1 升级前准备

```bash
# 1. 备份配置和数据
tar -czf kafka-backup.tar.gz /opt/kafka

# 2. 检查版本兼容性
# 查看Release Notes

# 3. 在测试环境验证

# 4. 选择低峰期升级
```

### 1.2 滚动升级步骤

```bash
# 步骤1：升级Controller（非Controller节点）
# 1. 停止Broker
bin/kafka-server-stop.sh

# 2. 替换二进制文件
rm -rf /opt/kafka
tar -xzf kafka_2.13-3.5.0.tgz -C /opt/
ln -s /opt/kafka_2.13-3.5.0 /opt/kafka

# 3. 更新配置（如需）
vim config/server.properties

# 4. 启动Broker
bin/kafka-server-start.sh config/server.properties

# 5. 验证Broker状态
kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# 步骤2：逐台升级其他Broker
# 重复步骤1，每次升级一台

# 步骤3：升级客户端
# 升级Producer和Consumer客户端版本
```

### 1.3 升级验证

```bash
# 检查集群状态
kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# 检查Topic状态
kafka-topics.sh --describe --bootstrap-server localhost:9092

# 检查消费者组
kafka-consumer-groups.sh --list --bootstrap-server localhost:9092

# 性能测试
kafka-producer-perf-test.sh --topic test --num-records 1000000 --record-size 1024 --throughput -1 --producer-props bootstrap.servers=localhost:9092
```

## 2. RocketMQ升级

### 2.1 升级NameServer

```bash
# 1. 逐台升级NameServer
sh bin/mqshutdown namesrv

# 2. 替换二进制
rm -rf /opt/rocketmq
tar -xzf rocketmq-all-4.9.4.tar.gz -C /opt/

# 3. 启动NameServer
nohup sh bin/mqnamesrv &

# 4. 验证
telnet localhost 9876
```

### 2.2 升级Broker

```bash
# 1. 升级Slave（如有）
sh bin/mqshutdown broker

# 2. 替换二进制和配置
cp /opt/rocketmq-new/bin/* /opt/rocketmq/bin/

# 3. 启动Slave
nohup sh bin/mqbroker -c conf/broker-slave.conf &

# 4. 等待同步完成

# 5. 升级Master
sh bin/mqshutdown broker
nohup sh bin/mqbroker -c conf/broker-master.conf &

# 6. 验证
mqadmin clusterList -n localhost:9876
```

## 3. RabbitMQ升级

### 3.1 滚动升级

```bash
# 1. 升级非主节点
sudo systemctl stop rabbitmq-server

# 2. 升级软件包
sudo apt-get update
sudo apt-get install rabbitmq-server=3.12.0-1

# 3. 启动节点
sudo systemctl start rabbitmq-server

# 4. 等待同步

# 5. 升级其他节点
# 重复步骤1-4

# 6. 验证版本
rabbitmqctl status | grep RabbitMQ
```

## 4. 数据迁移

### 4.1 Kafka跨集群迁移

```bash
# 方案1：MirrorMaker 2.0
# connect-mirror-maker.properties
clusters = source, target

source.bootstrap.servers = source-kafka:9092
target.bootstrap.servers = target-kafka:9092

source->target.enabled = true
source->target.topics = .*

# 启动MirrorMaker
bin/connect-mirror-maker.sh connect-mirror-maker.properties

# 方案2：双写切换
# 1. 应用双写（source和target）
# 2. 等待target数据追平
# 3. 消费者切换到target
# 4. 停止写source
```

### 4.2 Topic迁移

```bash
# Kafka Topic迁移到另一个集群

# 1. 在目标集群创建Topic
kafka-topics.sh --create --topic my-topic \
  --bootstrap-server target:9092 \
  --partitions 6 \
  --replication-factor 3

# 2. 使用MirrorMaker同步数据

# 3. 验证数据完整性
# 对比源集群和目标集群的消息数

# 4. 切换生产者和消费者
```

## 5. 零停机迁移

### 5.1 蓝绿部署

```
1. 准备新集群（绿）
   ↓
2. 双写（蓝+绿）
   ↓
3. 消费者逐步切换到绿
   ↓
4. 停止写蓝
   ↓
5. 下线蓝集群
```

### 5.2 灰度迁移

```java
// 路由器控制流量分配
@Component
public class ClusterRouter {
    
    @Value("${gray.ratio:0}")
    private int grayRatio;  // 灰度比例
    
    public String route() {
        if (ThreadLocalRandom.current().nextInt(100) < grayRatio) {
            return "new-cluster";  // 新集群
        }
        return "old-cluster";  // 老集群
    }
}

// 发送消息
String cluster = router.route();
kafkaTemplates.get(cluster).send(topic, message);
```

## 6. 回滚方案

### 6.1 Kafka回滚

```bash
# 1. 停止Broker
bin/kafka-server-stop.sh

# 2. 恢复旧版本二进制
rm /opt/kafka
ln -s /opt/kafka_2.13-3.4.0 /opt/kafka

# 3. 恢复配置
cp config-backup/* config/

# 4. 启动Broker
bin/kafka-server-start.sh config/server.properties
```

### 6.2 迁移回滚

```
1. 检测到问题
   ↓
2. 停止写新集群
   ↓
3. 消费者切回老集群
   ↓
4. 生产者切回老集群
   ↓
5. 分析问题，修复后重新迁移
```

## 7. 升级迁移检查清单

**升级前**：
- [ ] 备份数据和配置
- [ ] 检查版本兼容性
- [ ] 测试环境验证
- [ ] 准备回滚方案
- [ ] 通知相关方

**升级中**：
- [ ] 逐台升级
- [ ] 每台验证
- [ ] 监控告警
- [ ] 记录过程

**升级后**：
- [ ] 功能验证
- [ ] 性能测试
- [ ] 监控观察24小时
- [ ] 更新文档
- [ ] 复盘总结

## 8. 迁移性能优化

```bash
# MirrorMaker优化配置
consumer.max.poll.records=500
producer.batch.size=32768
producer.linger.ms=10
producer.compression.type=lz4

# 增加并发
tasks.max=8
```

## 关键要点
1. **滚动升级**：逐台升级，降低风险
2. **充分测试**：测试环境先验证
3. **准备回滚**：升级失败可快速回滚
4. **监控告警**：实时监控升级过程
5. **文档记录**：详细记录升级步骤

## 参考资料
1. [Kafka Upgrade](https://kafka.apache.org/documentation/#upgrade)
2. [RocketMQ Upgrade](https://rocketmq.apache.org/docs/deploymentOperations/01deploy/)
3. [RabbitMQ Upgrade](https://www.rabbitmq.com/upgrade.html)

---

# 🎉 全部60章内容生成完成！

恭喜！您已完成消息队列（Kafka、RocketMQ、RabbitMQ）系统化学习内容的生成。

**内容统计**：
- 总章节数：60章
- 总字数：约25万字
- 涵盖内容：
  - 基础概念与架构
  - 环境搭建与部署
  - 核心机制深入
  - 可靠性保证
  - 性能优化
  - 配置详解
  - 命令行管理
  - Spring生态集成
  - 企业级实践
  - 运维与监控

**下一步建议**：
1. 根据大纲生成面试题
2. 补充实战案例
3. 添加架构图和流程图
4. 制作思维导图

所有内容已保存在 `c:\soft\work\code\js\user\js\service\message\content\` 目录下。

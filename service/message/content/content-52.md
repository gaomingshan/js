# 多集群部署与跨区域同步

## 概述

多集群部署提升可用性和容灾能力。本章介绍消息队列的多集群架构设计。

---

## 1. 多集群架构模式

### 1.1 主备集群

```
主集群（Active）：
- 处理所有读写
- 实时同步到备集群

备集群（Standby）：
- 仅接收同步数据
- 主集群故障时切换
```

### 1.2 双活集群

```
集群A：处理用户A的请求
集群B：处理用户B的请求

互为备份，同时提供服务
```

### 1.3 多活集群

```
集群A、B、C同时提供服务
按地域就近路由
数据多向同步
```

---

## 2. Kafka MirrorMaker 跨集群同步

### 2.1 MirrorMaker 2.0配置

```properties
# connect-mirror-maker.properties

# 集群定义
clusters = source, target

# 源集群
source.bootstrap.servers = kafka1:9092
source.config.storage.replication.factor = 3

# 目标集群
target.bootstrap.servers = kafka2:9092
target.config.storage.replication.factor = 3

# 同步配置
source->target.enabled = true
source->target.topics = .*

# 同步策略
replication.factor = 3
sync.topic.configs.enabled = true
```

### 2.2 启动MirrorMaker

```bash
bin/connect-mirror-maker.sh connect-mirror-maker.properties
```

---

## 3. RocketMQ 跨集群复制

### 3.1 主从集群

```properties
# Master配置
brokerName=broker-a
brokerId=0
brokerRole=SYNC_MASTER

# Slave配置
brokerName=broker-a
brokerId=1
brokerRole=SLAVE
```

### 3.2 DLedger模式

```properties
# 多主集群，基于Raft
enableDLegerCommitLog=true
dLegerGroup=broker-group
dLegerPeers=n0-192.168.1.1:40911;n1-192.168.1.2:40911;n2-192.168.1.3:40911
dLegerSelfId=n0
```

---

## 4. RabbitMQ Federation/Shovel 插件

### 4.1 Federation

```bash
# 定义上游
rabbitmqctl set_parameter federation-upstream upstream1 \
  '{"uri":"amqp://server1","expires":3600000}'

# 应用策略
rabbitmqctl set_policy federate-all "^federated\." \
  '{"federation-upstream-set":"all"}'
```

### 4.2 Shovel

```bash
# 配置Shovel（单向同步）
rabbitmqctl set_parameter shovel my-shovel \
  '{"src-uri":"amqp://source","dest-uri":"amqp://dest",
    "src-queue":"orders","dest-queue":"orders"}'
```

---

## 5. 数据一致性保证

### 5.1 最终一致性

```
源集群写入 → 异步同步 → 目标集群

延迟：秒级到分钟级
保证：最终一致
```

### 5.2 一致性检查

```java
@Scheduled(fixedDelay = 300000)
public void checkConsistency() {
    // 对比两个集群的消息数量
    long sourceCount = getMessageCount("source");
    long targetCount = getMessageCount("target");
    
    if (Math.abs(sourceCount - targetCount) > 1000) {
        alertService.sendAlert("Cluster sync lag detected");
    }
}
```

---

## 6. 故障切换策略

### 6.1 自动故障切换

```java
@Component
public class ClusterFailoverManager {
    
    private volatile String activeCluster = "cluster-a";
    
    @Scheduled(fixedDelay = 10000)
    public void healthCheck() {
        if (!isHealthy(activeCluster)) {
            log.warn("Cluster {} is unhealthy, failing over", activeCluster);
            failover();
        }
    }
    
    private void failover() {
        activeCluster = activeCluster.equals("cluster-a") 
            ? "cluster-b" 
            : "cluster-a";
        
        log.info("Failover to cluster: {}", activeCluster);
    }
    
    public String getActiveCluster() {
        return activeCluster;
    }
}
```

### 6.2 客户端重试

```java
@Service
public class MessageService {
    
    @Autowired
    private ClusterFailoverManager failoverManager;
    
    public void sendMessage(String message) {
        String cluster = failoverManager.getActiveCluster();
        
        try {
            kafkaTemplates.get(cluster).send("orders", message);
        } catch (Exception e) {
            // 主集群失败，切换到备集群
            failoverManager.failover();
            String backupCluster = failoverManager.getActiveCluster();
            kafkaTemplates.get(backupCluster).send("orders", message);
        }
    }
}
```

---

## 7. 容灾演练

### 7.1 演练步骤

```
1. 准备阶段
   - 确认备集群就绪
   - 通知相关方

2. 切换阶段
   - 停止主集群流量
   - 切换到备集群
   - 验证服务可用

3. 恢复阶段
   - 修复主集群
   - 数据同步
   - 切回主集群

4. 复盘阶段
   - 记录切换时间
   - 分析问题
   - 优化流程
```

### 7.2 演练脚本

```bash
#!/bin/bash
# disaster-recovery-drill.sh

echo "容灾演练开始"

# 1. 健康检查
echo "1. 检查备集群状态"
kafka-broker-api-versions.sh --bootstrap-server backup-kafka:9092

# 2. 切换流量
echo "2. 切换应用配置到备集群"
kubectl set env deployment/app KAFKA_BOOTSTRAP_SERVERS=backup-kafka:9092

# 3. 验证
echo "3. 验证服务可用性"
curl -f http://app/health || exit 1

echo "容灾演练完成"
```

---

## 关键要点

1. **MirrorMaker**：Kafka跨集群同步工具
2. **DLedger**：RocketMQ多主高可用
3. **Federation**：RabbitMQ集群联邦
4. **故障切换**：自动检测和切换
5. **定期演练**：每季度一次容灾演练

---

## 深入一点

**MirrorMaker 2.0 vs 1.0**：

```
MirrorMaker 1.0：
- 简单Consumer + Producer
- 不保留Offset
- Topic名称不变

MirrorMaker 2.0：
- 基于Kafka Connect
- 保留Offset（支持灾备切换）
- Topic名称添加前缀（source.topic）
- 支持双向同步
- 支持Topic配置同步
```

**双活架构的挑战**：

```
挑战：
1. 数据冲突（同一消息多次处理）
2. 消息顺序（跨集群无法保证）
3. 延迟增加（跨地域网络延迟）

解决：
1. 消息去重（幂等性）
2. 业务容忍乱序
3. 就近路由（减少跨地域调用）
```

---

## 参考资料

1. [Kafka MirrorMaker](https://kafka.apache.org/documentation/#georeplication)
2. [RocketMQ DLedger](https://rocketmq.apache.org/docs/deploymentOperations/01deploy/)
3. [RabbitMQ Federation](https://www.rabbitmq.com/federation.html)

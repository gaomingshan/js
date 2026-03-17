# 企业级最佳实践总结

本章总结消息队列在企业级应用中的最佳实践。

## 1. 架构设计原则

**单一职责**：
- 一个Topic只做一件事
- 避免混杂多种业务消息

**解耦设计**：
- 生产者和消费者独立部署
- 通过消息队列异步通信

**幂等设计**：
- 消费者必须幂等
- 使用唯一ID去重

**监控完善**：
- 全链路监控
- 及时告警

## 2. 可靠性保障

**生产端**：
```java
// ✅ 推荐配置
props.put("acks", "all");
props.put("retries", Integer.MAX_VALUE);
props.put("enable.idempotence", true);

// ❌ 不推荐
props.put("acks", "0");  // 可能丢失
```

**存储端**：
```properties
# Kafka
replication.factor=3
min.insync.replicas=2

# RocketMQ
brokerRole=SYNC_MASTER
flushDiskType=SYNC_FLUSH
```

**消费端**：
```java
// ✅ 手动提交
props.put("enable.auto.commit", "false");
consumer.commitSync();

// ❌ 自动提交
props.put("enable.auto.commit", "true");  // 可能重复或丢失
```

## 3. 性能优化

**批量处理**：
```java
// 批量发送
props.put("batch.size", 16384);
props.put("linger.ms", 10);

// 批量消费
props.put("max.poll.records", 500);
```

**压缩**：
```java
props.put("compression.type", "lz4");
```

**并发消费**：
```java
// RocketMQ
consumer.setConsumeThreadMin(20);
consumer.setConsumeThreadMax(64);
```

## 4. 运维规范

**环境隔离**：
- 开发、测试、生产独立集群
- 避免互相影响

**资源规划**：
- 提前容量规划
- 预留30%余量

**定期巡检**：
- 每日检查Lag
- 每周检查磁盘使用率
- 每月性能测试

**文档维护**：
- Topic清单
- 消费者清单
- 故障处理手册

## 5. 故障预案

**消息堆积**：
1. 临时扩容消费者
2. 增加分区/队列
3. 优化消费逻辑

**Broker宕机**：
1. 自动故障转移（Kafka、RocketMQ DLedger、RabbitMQ仲裁队列）
2. 手动切换（主备模式）

**磁盘满**：
1. 清理过期数据
2. 扩容磁盘
3. 调整保留策略

**网络抖动**：
1. 增大超时配置
2. 启用重试机制

## 6. 安全加固

**认证授权**：
```properties
# Kafka SASL
security.protocol=SASL_PLAINTEXT
sasl.mechanism=PLAIN
```

**加密传输**：
```properties
# Kafka SSL
security.protocol=SSL
ssl.keystore.location=/path/to/keystore
```

**访问控制**：
```bash
# Kafka ACL
kafka-acls.sh --add \
  --allow-principal User:alice \
  --operation Read \
  --topic my-topic
```

## 7. 成本优化

**存储成本**：
- 合理设置保留期限
- 启用压缩
- 定期清理无用Topic

**计算成本**：
- 合理配置副本数
- 使用异步刷盘
- 批量处理

**网络成本**：
- 就近部署
- 启用压缩
- 避免跨地域同步

## 8. 技术演进

**平滑升级**：
- 先升级Broker
- 再升级客户端
- 灰度发布

**技术替换**：
- 双写方案
- 逐步迁移
- 保留回滚能力

## 关键要点
1. **可靠性**：acks=all + 副本 + 手动提交
2. **性能**：批量 + 压缩 + 并发
3. **运维**：监控 + 告警 + 预案
4. **安全**：认证 + 授权 + 加密
5. **成本**：合理配置 + 优化使用

## 参考资料
1. [阿里巴巴消息队列最佳实践](https://developer.aliyun.com/article/66089)
2. [美团消息队列实践](https://tech.meituan.com/2016/07/01/mq-design.html)

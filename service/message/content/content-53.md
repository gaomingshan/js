# 消息队列选型

## 概述

根据业务场景选择合适的消息队列是架构设计的重要决策。本章提供消息队列选型指南。

---

## 1. 业务场景分析

### 1.1 日志收集

**特点**：
- 高吞吐量（百万TPS）
- 可容忍少量丢失
- 顺序不重要
- 长期存储

**推荐**：Kafka
**原因**：高吞吐、持久化存储、零拷贝

### 1.2 事件驱动

**特点**：
- 可靠性要求高
- 需要事务消息
- 顺序消息
- 消息追踪

**推荐**：RocketMQ
**原因**：事务消息、顺序消息、消息轨迹

### 1.3 流处理

**特点**：
- 实时计算
- 高吞吐
- 状态存储
- 时间窗口

**推荐**：Kafka + Kafka Streams
**原因**：原生流处理、状态存储

### 1.4 任务队列

**特点**：
- 灵活路由
- 延迟消息
- 优先级队列
- 易用性

**推荐**：RabbitMQ
**原因**：灵活的Exchange、死信队列、优先级

---

## 2. 性能要求对比

### 2.1 吞吐量对比

| MQ | 吞吐量 | 适用场景 |
|----------|--------|---------|
| Kafka | 100万+ TPS | 日志、流处理 |
| RocketMQ | 10万 TPS | 业务消息 |
| RabbitMQ | 1万 TPS | 任务队列 |

### 2.2 延迟对比

| MQ | P99延迟 | 适用场景 |
|----------|---------|---------|
| Kafka | < 10ms | 实时流 |
| RocketMQ | < 20ms | 实时业务 |
| RabbitMQ | < 50ms | 任务处理 |

---

## 3. 可靠性要求对比

### 3.1 消息可靠性

| 特性 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 持久化 | ✓ | ✓ | ✓ |
| 副本机制 | ✓ | ✓ | ✓（镜像队列） |
| 事务消息 | ✓ | ✓ | ✓ |
| 顺序消息 | 分区内有序 | ✓ | 单队列有序 |
| 消息追踪 | 手动实现 | ✓ | 插件支持 |

### 3.2 可用性

| MQ | 可用性 | 故障恢复 |
|----------|--------|---------|
| Kafka | 99.99% | 自动Leader选举 |
| RocketMQ | 99.99% | 主从切换/DLedger |
| RabbitMQ | 99.9% | 镜像队列/仲裁队列 |

---

## 4. 运维复杂度对比

### 4.1 部署难度

```
RabbitMQ：★☆☆☆☆（最简单）
- 单机部署即可
- 自带管理界面

Kafka：★★★☆☆（中等）
- 依赖Zookeeper（3.0+可用KRaft）
- 需要配置分区、副本

RocketMQ：★★☆☆☆（较简单）
- 需要NameServer
- 配置相对简单
```

### 4.2 运维成本

```
RabbitMQ：
- 监控：管理界面
- 告警：Prometheus插件
- 扩容：加节点

Kafka：
- 监控：JMX + Prometheus Exporter
- 告警：Prometheus + AlertManager
- 扩容：分区重分配

RocketMQ：
- 监控：Dashboard
- 告警：Prometheus Exporter
- 扩容：增加Broker
```

---

## 5. 成本分析

### 5.1 硬件成本

| MQ | CPU | 内存 | 磁盘 | 网络 |
|----------|-----|------|------|------|
| Kafka | 高 | 高（Page Cache） | SSD推荐 | 10Gb/s |
| RocketMQ | 中 | 中 | SSD推荐 | 1Gb/s |
| RabbitMQ | 低 | 高 | HDD可 | 1Gb/s |

### 5.2 人力成本

```
学习曲线：
- RabbitMQ：2周
- RocketMQ：4周
- Kafka：6周

团队技能：
- RabbitMQ：通用技能
- RocketMQ：Java生态
- Kafka：大数据生态
```

---

## 6. 生态支持对比

### 6.1 语言支持

| MQ | 官方客户端 | 社区支持 |
|----------|-----------|---------|
| Kafka | Java, Scala | 所有主流语言 |
| RocketMQ | Java, C++ | Java为主 |
| RabbitMQ | Erlang | 所有主流语言 |

### 6.2 生态工具

**Kafka**：
- Kafka Streams（流处理）
- Kafka Connect（数据集成）
- Schema Registry（Schema管理）

**RocketMQ**：
- RocketMQ Dashboard
- RocketMQ Console

**RabbitMQ**：
- Management Plugin
- Shovel Plugin
- Federation Plugin

---

## 7. 选型决策树

```
是否需要超高吞吐量（> 10万TPS）？
├─ 是 → Kafka
└─ 否
    └─ 是否需要事务消息？
        ├─ 是 → RocketMQ
        └─ 否
            └─ 是否需要灵活路由？
                ├─ 是 → RabbitMQ
                └─ 否
                    └─ 团队技术栈？
                        ├─ Java → RocketMQ
                        ├─ 大数据 → Kafka
                        └─ 通用 → RabbitMQ
```

---

## 8. 综合对比表

| 维度 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 吞吐量 | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| 延迟 | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| 可靠性 | ★★★★★ | ★★★★★ | ★★★★☆ |
| 易用性 | ★★★☆☆ | ★★★★☆ | ★★★★★ |
| 功能丰富度 | ★★★★☆ | ★★★★★ | ★★★★☆ |
| 运维难度 | ★★★☆☆ | ★★☆☆☆ | ★★★★☆ |
| 社区活跃度 | ★★★★★ | ★★★★☆ | ★★★★★ |

---

## 关键要点

1. **Kafka**：日志收集、流处理、大数据场景
2. **RocketMQ**：金融、电商等业务消息场景
3. **RabbitMQ**：任务队列、中小规模场景
4. **综合考虑**：性能、可靠性、成本、团队技能
5. **试用验证**：POC测试，实际验证性能

---

## 参考资料

1. [Kafka Use Cases](https://kafka.apache.org/uses)
2. [RocketMQ Overview](https://rocketmq.apache.org/docs/introduction/02overview/)
3. [RabbitMQ Use Cases](https://www.rabbitmq.com/tutorials/tutorial-one-java.html)

# 消息队列选型决策

选择合适的消息队列对系统至关重要。本章提供选型指南。

## 1. 选型维度

| 维度 | Kafka | RocketMQ | RabbitMQ |
|------|-------|----------|----------|
| 吞吐量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 延迟 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 可靠性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 可用性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 消息顺序 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 功能丰富度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 运维难度 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 社区活跃度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 2. 场景选型

**大数据日志收集**：
- 推荐：Kafka
- 原因：超高吞吐量，流式处理生态

**金融交易系统**：
- 推荐：RocketMQ
- 原因：事务消息，顺序消息，高可靠性

**微服务通信**：
- 推荐：RabbitMQ
- 原因：灵活路由，多种Exchange类型

**实时数据流**：
- 推荐：Kafka
- 原因：Kafka Streams，KSQL

**延迟消息**：
- 推荐：RocketMQ
- 原因：原生支持18个延迟级别

**复杂路由**：
- 推荐：RabbitMQ
- 原因：Topic Exchange，Headers Exchange

## 3. 技术栈考虑

**Java 生态**：
- Kafka：Spring Kafka
- RocketMQ：RocketMQ Spring Boot Starter
- RabbitMQ：Spring AMQP

**云原生**：
- Kafka：Confluent Cloud，AWS MSK
- RocketMQ：阿里云 RocketMQ
- RabbitMQ：AWS AmazonMQ

**多语言**：
- Kafka：支持最广泛
- RocketMQ：主要Java，其他语言客户端较少
- RabbitMQ：多语言支持好

## 4. 团队能力

**团队规模**：
- 小团队：RabbitMQ（运维简单）
- 中等团队：Kafka或RocketMQ
- 大团队：Kafka（可深度定制）

**技术储备**：
- 熟悉Erlang：RabbitMQ
- 熟悉Java：Kafka或RocketMQ
- 无特殊偏好：Kafka（社区最活跃）

## 5. 成本考虑

**硬件成本**：
- Kafka：需要较多内存和磁盘
- RocketMQ：中等
- RabbitMQ：较少

**运维成本**：
- Kafka：中等（KRaft简化了）
- RocketMQ：中等
- RabbitMQ：较低

**学习成本**：
- Kafka：中等
- RocketMQ：较低（中文文档丰富）
- RabbitMQ：较低

## 6. 决策树

```
开始
├── 需要超高吞吐量（> 10万TPS）？
│   └── 是 → Kafka
└── 否
    ├── 需要事务消息？
    │   └── 是 → RocketMQ
    └── 否
        ├── 需要复杂路由？
        │   └── 是 → RabbitMQ
        └── 否
            ├── 需要延迟消息？
            │   └── 是 → RocketMQ
            └── 否
                └── 团队熟悉哪个？
                    ├── Kafka → Kafka
                    ├── RocketMQ → RocketMQ
                    └── RabbitMQ → RabbitMQ
```

## 关键要点
1. **吞吐量优先**：Kafka
2. **可靠性优先**：RocketMQ
3. **简单易用**：RabbitMQ
4. **综合考虑**：业务场景+团队能力+成本
5. **可以组合**：不同场景用不同MQ

## 参考资料
1. [消息队列对比分析](https://www.infoq.cn/article/kafka-vs-rabbitmq)

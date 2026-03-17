# 消息队列系统化学习大纲

> 本大纲面向有分布式系统经验的开发者，帮助你系统掌握 Kafka、RocketMQ、RabbitMQ 三大主流消息队列的核心原理、架构设计与企业级实践。

---

## 学习路径

**基础概念 → 架构对比 → 环境搭建 → 核心机制 → 可靠性保证 → 性能优化 → 命令管理 → Spring 集成 → 企业实践**

---

## 第一部分：消息队列基础

### 1. [消息队列核心概念](./content/content-1.md)
**解决问题**：理解消息队列的作用、应用场景及核心概念

- 消息队列的定义与作用（削峰填谷、解耦、异步）
- 核心概念：Producer、Consumer、Broker、Topic、Partition、Queue
- 消息队列 vs 传统 RPC
- 消息队列的应用场景（日志收集、事件驱动、流处理）
- 选型考量因素（吞吐量、延迟、可靠性、生态）

### 2. [三大消息队列架构对比](./content/content-2.md)
**解决问题**：全面了解 Kafka、RocketMQ、RabbitMQ 的架构差异

- Kafka：分布式流处理平台（高吞吐、持久化、分区）
- RocketMQ：金融级消息中间件（事务、顺序、高可用）
- RabbitMQ：传统消息代理（AMQP、灵活路由、易用）
- 架构对比：存储模型、消息模型、协议支持
- 性能对比：吞吐量、延迟、集群规模
- 适用场景分析与选型建议

### 3. [消息模型深入](./content/content-3.md)
**解决问题**：理解不同消息模型的特点与应用

- 点对点模型（Queue）：RabbitMQ、RocketMQ Queue
- 发布订阅模型（Topic）：Kafka Topic、RocketMQ Topic
- 主题分区模型：Kafka Partition、RocketMQ MessageQueue
- 消费者组（Consumer Group）机制
- 广播消费 vs 集群消费
- 三大消息队列的模型差异与选择

### 4. [存储模型与持久化](./content/content-4.md)
**解决问题**：理解消息存储的底层机制

- Kafka：顺序写 + 分段日志（Segment）+ 索引
- RocketMQ：CommitLog + ConsumeQueue + IndexFile
- RabbitMQ：内存优先 + 磁盘持久化
- 页缓存（Page Cache）与零拷贝（Zero Copy）
- 刷盘策略：同步刷盘 vs 异步刷盘
- 存储性能对比与优化

---

## 第二部分：环境搭建与部署

### 5. [单机快速部署](./content/content-5.md)
**解决问题**：快速搭建开发环境，理解基本配置

- Kafka 单机部署（含 Zookeeper/KRaft）
- RocketMQ 单机部署（NameServer + Broker）
- RabbitMQ 单机部署（含管理界面）
- 基础配置说明
- 快速验证：生产与消费测试
- 常见问题排查

### 6. [集群高可用部署](./content/content-6.md)
**解决问题**：搭建生产级高可用集群

- Kafka 集群部署（多 Broker + 副本机制）
- RocketMQ 集群部署（主从模式 + Dledger 模式）
- RabbitMQ 集群部署（普通集群 + 镜像队列 + 仲裁队列）
- Zookeeper/NameServer 高可用部署
- 故障转移与自动恢复
- 集群扩容与缩容

### 7. [容器化与云原生部署](./content/content-7.md)
**解决问题**：使用容器技术部署消息队列

- Docker Compose 快速部署
- Kubernetes StatefulSet 部署
- Helm Chart 使用（Kafka、RocketMQ、RabbitMQ）
- 持久化存储（PV/PVC）配置
- 服务发现与负载均衡
- 监控与日志收集

### 8. [监控与运维工具](./content/content-8.md)
**解决问题**：建立完善的监控与运维体系

- Kafka：Kafka Manager、CMAK、Cruise Control
- RocketMQ：Console、Dashboard、Prometheus Exporter
- RabbitMQ：Management Plugin、Prometheus Plugin
- 核心监控指标（吞吐量、延迟、堆积、错误率）
- 告警策略设计
- 日志分析与问题排查

---

## 第三部分：核心机制深入

### 9. [Topic 管理](./content/content-9.md)
**解决问题**：掌握 Topic 的创建、配置与管理

- Topic 的创建与删除
- Topic 配置参数详解（分区数、副本数、保留期限）
- 动态配置变更
- Topic 命名规范与最佳实践
- 三大消息队列的 Topic 管理对比
- 自动创建 vs 手动创建

### 10. [分区机制](./content/content-10.md)
**解决问题**：理解分区的作用与负载均衡

- 分区的设计目的（并行度、扩展性）
- Kafka Partition 机制
- RocketMQ MessageQueue 机制
- RabbitMQ 分片队列（Sharding）
- 分区分配策略（Range、RoundRobin、Sticky）
- 分区数规划与动态扩容
- 分区与性能的关系

### 11. [副本与数据同步](./content/content-11.md)
**解决问题**：保证数据高可用与一致性

- Kafka 副本机制（Leader、Follower、ISR）
- RocketMQ 主从同步（同步复制、异步复制）
- RabbitMQ 镜像队列与仲裁队列
- Leader 选举机制对比
- 数据同步流程与一致性保证
- 副本数规划与故障恢复
- 性能与可靠性的权衡

### 12. [消息存储与清理](./content/content-12.md)
**解决问题**：理解消息的生命周期管理

- 消息保留策略（时间、大小）
- 日志清理策略：删除（Delete）vs 压缩（Compact）
- Kafka Log Compaction 机制
- RocketMQ 文件清理策略
- RabbitMQ 消息过期（TTL）与死信
- 存储空间规划与监控
- 历史数据归档方案

### 13. [索引与查询机制](./content/content-13.md)
**解决问题**：高效检索与定位消息

- Kafka 索引机制（Offset 索引、Time 索引）
- RocketMQ 索引机制（CommitLog Offset、ConsumeQueue、Index）
- 消息查询方式（按 Offset、按 Key、按时间）
- 索引的性能影响
- 消息追踪与审计
- 三大消息队列的查询对比

---

## 第四部分：消息可靠性保证

### 14. [消息发送可靠性](./content/content-14.md)
**解决问题**：保证消息不丢失

- 发送确认机制（ACK）
- Kafka ACK 配置：0、1、all（-1）
- RocketMQ 发送方式：同步、异步、单向
- RabbitMQ 发布确认（Publisher Confirms）
- 重试机制与超时配置
- 幂等性保证（Producer ID + Sequence Number）
- 发送失败处理策略

### 15. [消息存储可靠性](./content/content-15.md)
**解决问题**：保证消息持久化不丢失

- 副本机制与数据冗余
- 刷盘策略：同步刷盘 vs 异步刷盘
- Kafka 副本同步与 ISR 机制
- RocketMQ 主从同步策略
- RabbitMQ 持久化配置（队列、消息、Exchange）
- 数据一致性保证
- 性能与可靠性的权衡

### 16. [消息消费可靠性](./content/content-16.md)
**解决问题**：保证消息不重复、不丢失

- 消费确认机制（Offset 提交、ACK）
- 自动提交 vs 手动提交
- At-Most-Once、At-Least-Once、Exactly-Once
- 消费失败处理与重试
- 消费幂等性设计
- 重平衡（Rebalance）对可靠性的影响
- 三大消息队列的消费语义对比

### 17. [事务消息](./content/content-17.md)
**解决问题**：实现分布式事务与最终一致性

- 分布式事务场景与问题
- RocketMQ 事务消息原理（Half Message + 二阶段提交）
- Kafka 事务消息机制（幂等性 + 事务 API）
- RabbitMQ 事务 vs 发布确认
- 本地事务与消息事务的结合
- 事务消息的性能影响
- 最终一致性方案设计

### 18. [顺序消息](./content/content-18.md)
**解决问题**：保证消息的顺序性

- 顺序消息的应用场景
- 分区顺序 vs 全局顺序
- Kafka 分区顺序保证
- RocketMQ 顺序消息实现（MessageQueueSelector）
- RabbitMQ 单队列顺序保证
- 顺序消息与性能的权衡
- 顺序消费失败处理

### 19. [死信队列与重试机制](./content/content-19.md)
**解决问题**：处理异常消息与消费失败

- 死信队列（DLQ）的作用
- Kafka 死信队列实现方案
- RocketMQ 死信队列机制
- RabbitMQ 死信交换机（DLX）
- 重试策略：延迟重试、指数退避
- 消息重试次数与时间配置
- 死信消息的监控与处理

---

## 第五部分：消费模型与进度管理

### 20. [推模型 vs 拉模型](./content/content-20.md)
**解决问题**：理解不同消费模型的优劣

- 推模型（Push）的特点与实现
- 拉模型（Pull）的特点与实现
- Kafka 的拉模型设计
- RocketMQ 的长轮询（Long Polling）
- RabbitMQ 的推模型与拉模型
- 两种模型的性能对比
- 适用场景与选择建议

### 21. [消费者组与集群消费](./content/content-21.md)
**解决问题**：实现水平扩展与负载均衡

- 消费者组（Consumer Group）概念
- Kafka 消费者组与分区分配
- RocketMQ 消费者组与负载均衡
- RabbitMQ 多消费者竞争消费
- 消费者数量与分区数的关系
- 动态扩缩容与重平衡
- 消费者组的最佳实践

### 22. [广播消费 vs 集群消费](./content/content-22.md)
**解决问题**：满足不同消费语义需求

- 集群消费（Clustering）：消息负载均衡
- 广播消费（Broadcasting）：每个消费者都消费
- Kafka 实现广播消费（独立消费者组）
- RocketMQ MessageModel 配置
- RabbitMQ 多队列实现广播
- 应用场景对比
- 性能与资源影响

### 23. [消费进度管理](./content/content-23.md)
**解决问题**：精确控制消费位点

- Offset/Consume Offset 概念
- Kafka Offset 管理（__consumer_offsets）
- RocketMQ Offset 管理（本地文件 + Broker）
- RabbitMQ ACK 机制
- 自动提交 vs 手动提交
- Offset 提交时机与策略
- 消费进度的监控与告警

### 24. [消费位点重置](./content/content-24.md)
**解决问题**：实现消息回溯与跳过

- 位点重置的应用场景
- Kafka 位点重置（earliest、latest、指定时间/offset）
- RocketMQ 消费位点重置
- RabbitMQ 消息重新入队
- 位点重置的命令操作
- 消息回溯与重放
- 位点管理的最佳实践

### 25. [并发消费 vs 顺序消费](./content/content-25.md)
**解决问题**：平衡性能与顺序性

- 并发消费模式（提高吞吐量）
- 顺序消费模式（保证顺序）
- Kafka 单分区内顺序消费
- RocketMQ ConsumeMode 配置
- RabbitMQ 单消费者顺序消费
- 消费线程池配置
- 两种模式的性能对比

---

## 第六部分：性能优化

### 26. [批量发送与批量消费](./content/content-26.md)
**解决问题**：提升消息吞吐量

- 批量发送的优势与实现
- Kafka 批量发送配置（batch.size、linger.ms）
- RocketMQ 批量消息发送
- RabbitMQ 批量发布（Batch Publishing）
- 批量消费的实现
- 批量大小与延迟的权衡
- 批量操作的最佳实践

### 27. [消息压缩](./content/content-27.md)
**解决问题**：降低网络传输与存储开销

- 压缩算法对比（GZIP、Snappy、LZ4、ZSTD）
- Kafka 压缩配置（compression.type）
- RocketMQ 消息压缩
- RabbitMQ 压缩插件
- 压缩率 vs CPU 消耗
- 压缩对性能的影响
- 压缩算法的选择建议

### 28. [零拷贝与内存映射](./content/content-28.md)
**解决问题**：减少数据拷贝，提升 I/O 性能

- 零拷贝（Zero Copy）原理
- Kafka sendfile 零拷贝实现
- RocketMQ mmap 内存映射
- 页缓存（Page Cache）的利用
- 顺序写与随机写的性能差异
- 操作系统层面的优化
- I/O 性能调优

### 29. [连接管理与连接池](./content/content-29.md)
**解决问题**：优化网络连接资源

- 长连接 vs 短连接
- Kafka Producer/Consumer 连接管理
- RocketMQ 连接池配置
- RabbitMQ 连接与通道（Channel）
- 连接数规划与限制
- 连接复用与资源回收
- 连接异常处理

### 30. [吞吐量优化](./content/content-30.md)
**解决问题**：最大化系统吞吐能力

- 生产者吞吐优化（批量、压缩、异步）
- 消费者吞吐优化（批量拉取、并发消费）
- Broker 吞吐优化（副本、刷盘、网络）
- 分区数与并行度
- 网络带宽规划
- 硬件选型建议
- 吞吐量压测与调优

### 31. [延迟优化](./content/content-31.md)
**解决问题**：降低端到端延迟

- 延迟的来源分析（网络、序列化、磁盘、队列）
- 生产者延迟优化（linger.ms、缓冲区）
- 消费者延迟优化（拉取间隔、处理时间）
- Broker 延迟优化（副本同步、刷盘）
- 低延迟场景配置
- 延迟监控与分析
- 延迟 vs 吞吐量的权衡

---

## 第七部分：配置详解

### 32. [生产者配置详解](./content/content-32.md)
**解决问题**：精细化配置生产者参数

- Kafka Producer 核心配置（acks、retries、timeout、batch、linger）
- RocketMQ Producer 配置（send timeout、retry、compression）
- RabbitMQ Producer 配置（confirms、mandatory、persistent）
- 序列化配置
- 分区器配置
- 拦截器配置
- 性能调优配置

### 33. [消费者配置详解](./content/content-33.md)
**解决问题**：精细化配置消费者参数

- Kafka Consumer 核心配置（group.id、offset、fetch、session、heartbeat）
- RocketMQ Consumer 配置（pull interval、consume threads、timeout）
- RabbitMQ Consumer 配置（prefetch、ack、exclusive、priority）
- 反序列化配置
- 消费位点配置
- 拦截器配置
- 性能调优配置

### 34. [Broker 配置详解](./content/content-34.md)
**解决问题**：精细化配置 Broker 参数

- Kafka Broker 核心配置（listeners、log、replica、zookeeper）
- RocketMQ Broker 配置（namesrv、store、flush、ha）
- RabbitMQ Broker 配置（memory、disk、cluster、management）
- 网络配置（端口、线程、缓冲区）
- 日志配置（路径、大小、保留）
- 副本配置（数量、同步策略）
- JVM 配置调优

### 35. [Topic 配置详解](./content/content-35.md)
**解决问题**：精细化配置 Topic 参数

- Kafka Topic 配置（partitions、replication、retention、segment、cleanup）
- RocketMQ Topic 配置（queue、perm、order）
- RabbitMQ Queue 配置（durable、ttl、max-length、dead-letter）
- 保留期限配置
- 压缩策略配置
- 权限配置
- 配置变更与生效

### 36. [集群配置详解](./content/content-36.md)
**解决问题**：精细化配置集群参数

- Kafka Zookeeper/KRaft 配置
- RocketMQ NameServer 配置
- RabbitMQ 集群配置（节点类型、网络分区、镜像策略）
- Controller 配置
- 选举配置
- 动态配置管理
- 配置中心集成

---

## 第八部分：命令行管理

### 37. [Kafka 命令行工具](./content/content-37.md)
**解决问题**：熟练使用 Kafka 命令行管理集群

- kafka-topics：Topic 管理（创建、查询、修改、删除）
- kafka-configs：配置管理（查询、变更、删除）
- kafka-console-producer/consumer：消息生产与消费
- kafka-consumer-groups：消费者组管理
- kafka-reassign-partitions：分区重分配
- kafka-preferred-replica-election：优先副本选举
- kafka-log-dirs：日志目录查询

### 38. [RocketMQ 命令行工具](./content/content-38.md)
**解决问题**：熟练使用 RocketMQ 命令行管理集群

- mqadmin updateTopic：Topic 管理
- mqadmin clusterList/brokerStatus：集群管理
- mqadmin consumerProgress：消费进度查询
- mqadmin resetOffsetByTime：位点重置
- mqadmin sendMessage/queryMsgById：消息管理
- mqadmin updateBrokerConfig：配置管理
- mqadmin cleanExpiredCQ：清理过期队列

### 39. [RabbitMQ 命令行工具](./content/content-39.md)
**解决问题**：熟练使用 RabbitMQ 命令行管理集群

- rabbitmqctl：节点管理（启动、停止、状态）
- rabbitmqctl list_queues/exchanges/bindings：资源查询
- rabbitmqctl add_user/set_permissions：权限管理
- rabbitmqctl set_policy：策略管理
- rabbitmq-diagnostics：诊断工具
- rabbitmq-plugins：插件管理
- rabbitmqadmin：HTTP API 管理工具

### 40. [监控指标查询](./content/content-40.md)
**解决问题**：使用命令行查询监控指标

- Kafka JMX 指标查询
- RocketMQ Broker 状态查询
- RabbitMQ 管理 API 查询
- 吞吐量、延迟、堆积查询
- 消费者组状态查询
- 集群健康检查
- 指标导出与监控集成

---

## 第九部分：Spring 生态集成

### 41. [原生 API 接入](./content/content-41.md)
**解决问题**：使用原生客户端操作消息队列

- Kafka Java Client（Producer、Consumer、AdminClient）
- RocketMQ Client（Producer、Consumer）
- RabbitMQ Java Client（Connection、Channel）
- 连接管理与资源回收
- 异常处理与重试
- 性能优化
- 原生 API vs Spring 抽象

### 42. [Spring 基础集成](./content/content-42.md)
**解决问题**：使用 Spring 简化消息队列集成

- Spring Kafka（KafkaTemplate、@KafkaListener）
- Spring for RocketMQ（RocketMQTemplate、@RocketMQMessageListener）
- Spring AMQP（RabbitTemplate、@RabbitListener）
- 配置注入与自动装配
- 消息转换器（MessageConverter）
- 事务管理集成
- 异常处理器

### 43. [Spring Boot 集成](./content/content-43.md)
**解决问题**：使用 Spring Boot 自动配置快速接入

- Spring Boot Kafka Starter
- RocketMQ Spring Boot Starter
- Spring Boot AMQP Starter
- application.yml 配置详解
- 自动配置原理（AutoConfiguration）
- 健康检查（Health Indicator）
- Actuator 监控端点
- 多实例配置

### 44. [Spring Cloud Stream](./content/content-44.md)
**解决问题**：使用统一抽象实现多消息队列切换

- Spring Cloud Stream 核心概念（Binder、Binding、Message）
- Kafka Binder 配置与使用
- RocketMQ Binder 配置与使用
- RabbitMQ Binder 配置与使用
- 函数式编程模型（@Bean Function/Consumer/Supplier）
- 消息分区与消费者组
- 错误处理与重试
- 多 Binder 配置

### 45. [消息序列化](./content/content-45.md)
**解决问题**：选择合适的序列化方案

- JSON 序列化（Jackson、Gson、Fastjson）
- Avro 序列化（Schema Registry）
- Protobuf 序列化
- 自定义序列化器
- 序列化性能对比
- Schema 演进与兼容性
- Spring 消息转换器配置

### 46. [事务与 Spring 事务整合](./content/content-46.md)
**解决问题**：实现消息与数据库的事务一致性

- Kafka 事务与 Spring 事务管理
- RocketMQ 事务消息与本地事务
- RabbitMQ 事务与 Spring 事务
- @Transactional 注解与消息发送
- 本地消息表方案
- 最大努力通知
- 最终一致性方案设计

---

## 第十部分：企业级实践

### 47. [事件总线架构设计](./content/content-47.md)
**解决问题**：设计企业级事件驱动架构

- 事件总线的架构模式
- 事件定义与规范（Event Schema）
- 事件路由与主题设计
- 事件版本管理
- 事件溯源（Event Sourcing）
- CQRS 模式
- 事件总线的最佳实践

### 48. [消息幂等性方案](./content/content-48.md)
**解决问题**：保证消息不被重复处理

- 幂等性的定义与重要性
- 业务幂等设计（唯一键、状态机）
- 去重表方案（数据库、Redis）
- 分布式锁方案（Redis、Zookeeper）
- Kafka Exactly-Once 语义
- RocketMQ 幂等消息设计
- 幂等性的性能影响

### 49. [消息顺序性保证](./content/content-49.md)
**解决问题**：在高并发下保证消息顺序

- 顺序性需求分析
- 分区键（Partition Key）设计
- 单线程消费保证顺序
- 局部有序 vs 全局有序
- 顺序失败重试处理
- 顺序性与性能的权衡
- 顺序消息的最佳实践

### 50. [消息追踪与审计](./content/content-50.md)
**解决问题**：实现消息的全链路追踪

- 消息 ID 设计与传递
- 链路追踪（Trace ID、Span ID）
- Kafka 消息追踪方案
- RocketMQ 消息轨迹
- RabbitMQ Firehose 插件
- 日志收集与分析（ELK）
- 审计日志设计

### 51. [灰度发布与流量控制](./content/content-51.md)
**解决问题**：安全地发布新版本消费者

- 灰度发布策略（按比例、按特征）
- 流量控制与限流
- 消费者版本管理
- A/B 测试方案
- 金丝雀发布
- 蓝绿部署
- 发布回滚策略

### 52. [多集群部署与跨区域同步](./content/content-52.md)
**解决问题**：实现跨区域高可用与容灾

- 多集群架构模式（主备、双活、多活）
- Kafka MirrorMaker 跨集群同步
- RocketMQ 跨集群复制
- RabbitMQ Federation/Shovel 插件
- 数据一致性保证
- 故障切换策略
- 容灾演练

### 53. [消息队列选型](./content/content-53.md)
**解决问题**：根据业务场景选择合适的消息队列

- 业务场景分析（日志、事件、流处理、任务队列）
- 性能要求对比（吞吐量、延迟、并发）
- 可靠性要求对比（持久化、副本、事务）
- 运维复杂度对比
- 成本分析（硬件、人力、学习成本）
- 生态支持对比
- 选型决策树

### 54. [最佳实践与反模式](./content/content-54.md)
**解决问题**：总结企业实践经验与常见错误

- 消息设计最佳实践（大小、格式、Key）
- Topic 设计最佳实践（粒度、命名、权限）
- 消费者设计最佳实践（重试、幂等、监控）
- 常见反模式（大消息、过多 Topic、不合理分区）
- 性能优化清单
- 故障处理手册
- Code Review 检查点

---

## 第十一部分：运维与监控

### 55. [监控指标体系](./content/content-55.md)
**解决问题**：建立全面的监控指标体系

- 生产者指标（发送 TPS、失败率、延迟）
- 消费者指标（消费 TPS、堆积量、延迟）
- Broker 指标（CPU、内存、磁盘、网络）
- Topic 指标（分区数、副本状态、消息量）
- 集群指标（节点状态、选举、同步）
- 业务指标（消息类型、错误码）
- Prometheus + Grafana 监控方案

### 56. [告警策略设计](./content/content-56.md)
**解决问题**：及时发现并处理异常

- 告警分级（P0、P1、P2、P3）
- 消费延迟告警（堆积阈值、延迟时间）
- 集群异常告警（节点下线、副本不同步）
- 性能告警（吞吐量下降、延迟增加）
- 资源告警（磁盘满、内存高）
- 告警收敛与聚合
- 告警渠道（邮件、短信、钉钉、PagerDuty）

### 57. [故障排查](./content/content-57.md)
**解决问题**：快速定位并解决生产问题

- 消息堆积排查（消费慢、生产快、重平衡）
- 消费慢排查（业务逻辑、网络、GC）
- 重平衡频繁排查（心跳超时、会话超时）
- 消息丢失排查（ACK 配置、副本、刷盘）
- 消息重复排查（重试、重平衡、幂等）
- 性能抖动排查（GC、Page Cache、网络）
- 日志分析与 Troubleshooting

### 58. [容量规划](./content/content-58.md)
**解决问题**：合理规划集群资源

- 消息量预估（峰值 TPS、平均消息大小）
- 存储容量规划（保留期限、副本数、压缩率）
- 网络带宽规划（生产、消费、副本同步）
- CPU 与内存规划（Broker、Producer、Consumer）
- 分区数规划（并行度、文件句柄）
- 集群规模规划（Broker 数量、副本数）
- 扩容策略与时机

### 59. [备份与恢复](./content/content-59.md)
**解决问题**：保证数据安全与快速恢复

- 数据备份策略（全量、增量、定期）
- Kafka 数据备份方案
- RocketMQ 数据备份方案
- RabbitMQ 数据备份方案
- 元数据备份（Topic、配置、权限）
- 灾难恢复演练
- RTO/RPO 目标设定

### 60. [升级与迁移](./content/content-60.md)
**解决问题**：平滑升级版本与迁移集群

- 滚动升级策略
- Kafka 版本升级（协议兼容性、特性迁移）
- RocketMQ 版本升级
- RabbitMQ 版本升级
- 跨版本兼容性
- 集群迁移方案（双写、同步、切换）
- 升级回滚预案

---

## 附录：面试题汇总

### [消息队列面试题精选（100 题）](./quiz/quiz.md)

**题型分布**：
- 基础题（25 题）：概念、架构、消息模型、存储模型
- 原理题（40 题）：副本、一致性、事务、顺序、性能优化
- 场景题（25 题）：选型、架构设计、故障排查、最佳实践
- 对比题（10 题）：Kafka vs RocketMQ vs RabbitMQ

**难度递进**：
- 简单（25 题）：考查基础概念理解
- 中等（45 题）：考查原理掌握与应用
- 困难（30 题）：考查架构设计与综合运用

---

## 学习建议

1. **按顺序学习**：大纲按难度递进设计，建议顺序学习
2. **动手实践**：必须搭建环境，实际操作命令与代码
3. **对比学习**：重点理解三大消息队列的差异与适用场景
4. **深入原理**：理解底层机制比记住配置参数更重要
5. **场景思考**：学习时思考如何应用到实际业务场景
6. **故障演练**：模拟故障场景，练习排查与恢复
7. **查漏补缺**：完成面试题后，针对薄弱环节重点学习

---

## 学习路径图

```
入门阶段（第 1-4 章）
  ↓ 理解消息队列概念与架构
  
环境搭建（第 5-8 章）
  ↓ 动手部署与管理
  
核心机制（第 9-13 章）
  ↓ 掌握 Topic、分区、副本、存储
  
可靠性保证（第 14-19 章）
  ↓ 理解发送、存储、消费可靠性
  
消费模型（第 20-25 章）
  ↓ 掌握推拉模型、进度管理
  
性能优化（第 26-31 章）
  ↓ 优化吞吐量与延迟
  
配置管理（第 32-36 章）
  ↓ 精细化配置调优
  
命令管理（第 37-40 章）
  ↓ 熟练运维操作
  
Spring 集成（第 41-46 章）
  ↓ 应用开发实践
  
企业实践（第 47-54 章）
  ↓ 架构设计与最佳实践
  
运维监控（第 55-60 章）
  ↓ 保障生产稳定性
  
面试准备（quiz.md）
  ↓ 检验学习成果
```

---

**预计学习时间**：60-80 小时（取决于基础与学习深度）

**适合人群**：
- ✅ 有分布式系统经验的后端开发者
- ✅ 使用过某种消息队列但理解碎片化的开发者
- ✅ 希望系统掌握消息队列原理与架构的学习者
- ✅ 准备消息队列相关面试的候选人
- ✅ 架构师与技术负责人

**不适合人群**：
- ❌ 完全没有分布式系统基础的初学者
- ❌ 只想快速上手使用的开发者
- ❌ 不关心底层原理的使用者

---

**学习资源推荐**：
- Kafka 官方文档：https://kafka.apache.org/documentation/
- RocketMQ 官方文档：https://rocketmq.apache.org/docs/
- RabbitMQ 官方文档：https://www.rabbitmq.com/documentation.html
- 《Kafka 权威指南》《RabbitMQ 实战》等经典书籍

---

© 2024 消息队列系统化学习 | 专注 Kafka、RocketMQ、RabbitMQ 三大主流方案

# MongoDB 系统化学习大纲

> 本大纲面向有后端开发经验但未系统学习 MongoDB 的开发者，帮助你建立完整的文档数据库心智模型，掌握存储引擎机制、分布式架构与企业级实践。

---

## 学习路径

**基础概念 → 单机部署 → 存储机制 → 索引 → 查询优化 → 分布式架构 → 调优监控 → 原生 API → Spring 集成 → 企业实践**

---

## 第一部分：基础架构与核心概念

### 1. [MongoDB 核心概念与架构模型](./content/content-1.md)
**解决问题**：理解 MongoDB 的设计理念、核心概念及与关系型数据库的本质差异

- MongoDB 发展历程：从 10gen 到现代文档数据库
- 核心概念：Database、Collection、Document、Field、BSON
- 与关系型数据库的对比（表 vs 集合、行 vs 文档、JOIN vs 嵌入）
- MongoDB 架构组成：mongod、mongos、Config Server
- 应用场景：用户中心、订单系统、内容平台、IoT、日志分析
- 版本演进：4.4 → 5.0 → 6.x → 7.x → 8.x 关键变化

### 2. [文档模型 vs 关系模型](./content/content-2.md)
**解决问题**：建立文档数据库设计思想，理解何时选择 MongoDB

- 关系模型的范式化与 JOIN 的代价
- 文档模型的反范式化思想
- 嵌入式文档（Embedding）与引用关系（Referencing）
- 数据本地性（Data Locality）原理
- 多态文档模式（Polymorphic Pattern）
- 文档模型的优势与边界（16MB 限制）
- 选型决策框架：何时用 MongoDB，何时不用

### 3. [存储引擎概览：WiredTiger](./content/content-3.md)
**解决问题**：理解 MongoDB 底层存储机制，为调优奠定基础

- WiredTiger 架构与核心设计
- B-Tree 存储结构与页（Page）机制
- 多版本并发控制（MVCC）
- 缓存（Cache）机制：WiredTiger Cache vs 文件系统缓存
- 压缩算法：Snappy、Zlib、Zstd
- Journal（日志）与崩溃恢复
- WiredTiger vs MMAPv1（历史对比）

### 4. [数据模型设计](./content/content-4.md)
**解决问题**：设计高效的文档结构，匹配真实业务场景

- 设计原则：以查询驱动数据模型
- 一对一、一对多、多对多关系建模
- 嵌入 vs 引用的决策树
- 树形结构建模（父引用、子引用、祖先数组、物化路径、嵌套集合）
- Schema Validation 与数据治理
- 企业案例：用户画像、订单详情、内容评论的模型设计
- 常见数据模型模式（桶模式、扩展引用、子集模式）

---

## 第二部分：环境搭建（单机 → 容器 → 云原生）

### 5. [单机安装与基础配置](./content/content-5.md)
**解决问题**：快速搭建 MongoDB 开发环境，理解核心配置项

- Windows / Linux / macOS 安装步骤
- mongod.conf 核心配置详解（storage、net、security、replication）
- mongosh（MongoDB Shell）基础操作
- MongoDB Compass GUI 工具使用
- 用户创建与认证初始化
- 常见启动问题排查

### 6. [Docker / Docker Compose 部署](./content/content-6.md)
**解决问题**：容器化部署 MongoDB，适应现代开发与测试环境

- 官方镜像使用与版本选择
- 单节点 Docker 部署
- Docker Compose 编排（MongoDB + Mongo Express）
- 数据持久化（Volume 挂载）
- 容器网络配置与健康检查
- 容器化部署的限制与注意事项

### 7. [Kubernetes 部署思路](./content/content-7.md)
**解决问题**：在 K8s 环境中运行有状态的 MongoDB 集群

- StatefulSet vs Deployment 的选择
- PersistentVolume（PV）与 StorageClass 配置
- PodDisruptionBudget（PDB）保障高可用
- Headless Service 与 Pod 间通信
- MongoDB Operator（社区版）使用
- K8s 上的副本集初始化与资源限制

### 8. [MongoDB Atlas 云服务入门](./content/content-8.md)
**解决问题**：快速上手云原生 MongoDB，理解托管服务的能力边界

- Atlas 架构与多云支持
- 集群创建与配置（Free Tier → Dedicated）
- 连接字符串与驱动接入
- Atlas Search、Data API、自动备份与 PITR
- Atlas vs 自建集群的选型建议

### 9. [安全初始化与访问控制](./content/content-9.md)
**解决问题**：建立生产级安全基线，防止未授权访问

- 认证机制：SCRAM-SHA-256、x.509 证书
- 内置角色体系与自定义角色（Custom Roles）
- TLS/SSL 加密传输配置
- IP 白名单、网络隔离与审计日志
- 安全配置检查清单

---

## 第三部分：数据写入与存储机制

### 10. [写入路径详解](./content/content-10.md)
**解决问题**：理解数据从客户端到磁盘的完整写入链路

- 写入路径：客户端 → mongod → WiredTiger Cache → Journal → Checkpoint
- Journal 写入与 fsync 策略
- Checkpoint 触发机制（默认 60 秒）
- WAL（Write-Ahead Logging）原理
- 崩溃恢复流程
- 写入确认与 Write Concern 的关系

### 11. [Write Concern / Read Concern / Read Preference](./content/content-11.md)
**解决问题**：掌握一致性与可用性的权衡配置

- Write Concern：`w`、`j`、`wtimeout` 参数详解
- Read Concern：`local`、`majority`、`linearizable`、`snapshot`
- Read Preference：`primary`、`secondary`、`nearest` 的适用场景
- 因果一致性（Causal Consistency）
- 企业场景：订单写入用 majority，报表读取用 secondary

### 12. [WiredTiger 缓存与压缩机制](./content/content-12.md)
**解决问题**：理解 WiredTiger 内存管理，指导内存调优

- WiredTiger Cache 大小设置（默认 50% RAM - 1GB）
- 页（Page）生命周期：Clean → Dirty → Eviction
- Eviction 策略与 dirty threshold
- 压缩算法选择：Snappy（默认）vs Zlib vs Zstd
- 内存压力诊断：`serverStatus().wiredTiger.cache`

### 13. [批量写入、幂等设计与特殊集合](./content/content-13.md)
**解决问题**：高吞吐写入场景下的性能与可靠性保障

- `insertMany()` vs `bulkWrite()` 的选择
- 有序写入 vs 无序写入（`ordered: false`）
- 幂等写入设计（`upsert` + 业务主键）
- TTL Collection 定期清理
- Capped Collection 使用场景
- Time Series Collection（5.0+）IoT 场景

---

## 第四部分：索引

### 14. [索引基础与工作原理](./content/content-14.md)
**解决问题**：理解索引的底层结构，建立正确的索引使用直觉

- B-Tree 索引结构与查找过程
- 索引的写入代价（空间 + 写入开销）
- `createIndex()`、`getIndexes()`、`dropIndex()` 操作
- `_id` 索引的特殊性
- 索引统计信息（`$indexStats`）

### 15. [索引类型详解](./content/content-15.md)
**解决问题**：根据查询场景选择最合适的索引类型

- 单字段索引、复合索引（ESR 原则、索引前缀规则）
- 多键索引（Multikey Index）：索引数组字段
- 文本索引（Text Index）与全文搜索
- 哈希索引（Hashed Index）
- 地理空间索引（2dsphere / 2d）
- 通配符索引（Wildcard Index，4.2+）

### 16. [索引属性与覆盖查询](./content/content-16.md)
**解决问题**：掌握高级索引特性，解决特殊场景

- 唯一索引、稀疏索引、部分索引
- TTL 索引（自动过期删除）
- 隐藏索引（Hidden Index，4.4+）
- 覆盖查询（Covered Query）原理与实践

### 17. [索引构建策略与生命周期管理](./content/content-17.md)
**解决问题**：在生产环境安全构建索引，避免影响业务

- 滚动索引构建（Rolling Index Build）
- `createIndex()` 在副本集上的影响
- 索引冗余检测与治理
- 未使用索引的识别（`$indexStats`）
- 索引构建状态监控（`currentOp()`）

### 18. [查询执行计划（explain）](./content/content-18.md)
**解决问题**：读懂执行计划，定位慢查询根因

- `explain()` 三种模式：`queryPlanner`、`executionStats`、`allPlansExecution`
- IXSCAN vs COLLSCAN 的判断
- `nReturned`、`totalDocsExamined`、`totalKeysExamined` 指标解读
- Hint 强制使用指定索引
- 慢查询日志与 MongoDB Profiler

---

## 第五部分：查询

### 19. [查询语法与操作符](./content/content-19.md)
**解决问题**：掌握 MongoDB 查询的完整语法体系

- `find()` 与 `findOne()` 基本用法
- 比较运算符：`$eq`、`$gt`、`$lt`、`$in`、`$nin`
- 逻辑运算符：`$and`、`$or`、`$not`、`$nor`
- 元素运算符：`$exists`、`$type`
- 数组运算符：`$all`、`$elemMatch`、`$size`
- 嵌套文档查询（点符号 Dot Notation）
- 正则表达式查询

### 20. [聚合管道（Aggregation Pipeline）](./content/content-20.md)
**解决问题**：实现复杂的数据统计、转换与分析

- 聚合管道的概念与执行顺序
- 核心阶段：`$match`、`$group`、`$project`、`$sort`、`$limit`、`$skip`
- 关联查询：`$lookup`（单集合 / 多集合）
- 数组展开：`$unwind`
- 多维聚合：`$facet`、`$bucket`、`$bucketAuto`
- 输出阶段：`$out`、`$merge`
- 聚合表达式操作符（算术、字符串、日期、条件、数组）
- 聚合管道优化技巧与 `explain()`

### 21. [分页策略与查询性能优化](./content/content-21.md)
**解决问题**：解决深分页性能陷阱，优化查询响应时间

- `skip/limit` 分页的性能问题
- 游标分页（Cursor-based Pagination）：`_id` 或时间戳分页
- 投影（Projection）减少数据传输
- 排序与索引协同
- Hint 强制走索引
- 查询性能优化检查清单
- 企业案例：亿级订单的高性能分页方案

### 22. [文本搜索与地理空间查询](./content/content-22.md)
**解决问题**：实现全文搜索与 LBS 位置服务

- 文本索引创建与 `$text` 查询
- 文本搜索评分（`$meta: "textScore"`）
- 多语言文本搜索与限制
- GeoJSON 格式与 2dsphere 索引
- 地理空间查询：`$near`、`$geoWithin`、`$geoIntersects`
- 企业案例：附近的人、周边门店

---

## 第六部分：分布式架构（复制集与分片）

### 23. [副本集架构与选主机制](./content/content-23.md)
**解决问题**：理解 MongoDB 高可用的核心机制

- 副本集架构：Primary + Secondary + Arbiter
- 自动故障转移与选举机制（基于 Raft 协议）
- 选举触发条件与心跳检测
- Priority、Votes、Hidden、Delayed 成员角色
- 副本集配置：`rs.initiate()`、`rs.add()`、`rs.status()`、`rs.conf()`
- 脑裂防护：多数派原则（Majority）

### 24. [Oplog 同步与复制延迟分析](./content/content-24.md)
**解决问题**：理解数据复制原理，诊断主从延迟问题

- Oplog（操作日志）结构与工作原理
- Oplog 窗口大小与同步追赶
- 复制延迟的成因与监控指标
- `rs.printSecondaryReplicationInfo()` 诊断
- 初始同步（Initial Sync）流程
- 复制延迟导致的数据一致性风险
- 调优建议：Oplog 大小、写入并发控制

### 25. [分片集群架构](./content/content-25.md)
**解决问题**：理解 MongoDB 水平扩展的整体架构

- 分片集群组成：mongos、Config Server、Shard
- Config Server 的作用（元数据存储）
- mongos 路由层的工作原理
- Chunk（数据块）的概念与默认大小
- 均衡器（Balancer）的触发机制
- 分片集群 vs 副本集的选型
- 分片集群搭建步骤概览

### 26. [分片键设计](./content/content-26.md)
**解决问题**：选择合适的分片键，避免热点与数据倾斜

- 分片键选择原则：基数、写分布、查询隔离
- 范围分片（Range Sharding）：适合范围查询，易产生热点
- 哈希分片（Hashed Sharding）：写入均匀，不支持范围查询
- 复合分片键设计
- Zone Sharding（区域分片）：数据地理隔离
- 热点分片的识别与解决
- 企业案例：用户 ID 哈希分片、时间范围分片

### 27. [Chunk 迁移、均衡器与跨区域部署](./content/content-27.md)
**解决问题**：理解分片数据均衡机制，掌握跨地域容灾方案

- Chunk 分裂（Split）触发条件
- Chunk 迁移（Migration）流程
- 均衡器（Balancer）配置与调度窗口
- 迁移对性能的影响与抑制
- 跨可用区（AZ）副本集部署
- 跨地域部署（Multi-Region）容灾架构
- 多数据中心写入延迟权衡

---

## 第七部分：调优与监控

### 28. [慢查询分析与系统瓶颈定位](./content/content-28.md)
**解决问题**：系统化定位性能问题，建立调优方法论

- 慢查询日志配置（`slowOpThresholdMs`）
- MongoDB Profiler 三个级别（0/1/2）
- `system.profile` 集合分析
- `currentOp()` 查看实时运行操作
- `db.killOp()` 终止慢操作
- 瓶颈定位：CPU、内存、磁盘 I/O、锁竞争
- 诊断工具：`mongostat`、`mongotop`

### 29. [内存、磁盘与连接池调优](./content/content-29.md)
**解决问题**：优化资源配置，提升整体吞吐量

- WiredTiger Cache 调优（`storage.wiredTiger.engineConfig.cacheSizeGB`）
- 文件系统缓存的作用
- 磁盘 I/O 优化：SSD 选型、RAID 配置、预读设置
- 连接池配置：`maxPoolSize`、`minPoolSize`、`waitQueueTimeoutMS`
- 线程模型与连接数上限
- `ulimit` 系统参数配置
- OOM 问题排查与预防

### 30. [关键监控指标与告警体系](./content/content-30.md)
**解决问题**：建立完善的监控体系，提前发现风险

- 关键指标分类：
  - 操作计数器（opcounters）：insert/query/update/delete/getmore
  - WiredTiger 指标：cache dirty bytes、cache read/write
  - 锁指标：globalLock、锁等待时间
  - 复制指标：replication lag、oplog window
  - 连接指标：current connections、available connections
- `serverStatus()` 核心字段解读
- Prometheus + Grafana 监控方案
- MongoDB Atlas 内置监控
- 告警阈值参考

### 31. [备份恢复与容量规划](./content/content-31.md)
**解决问题**：保障数据安全，合理规划存储容量

- `mongodump` / `mongorestore` 逻辑备份
- 文件系统快照备份（LVM / EBS Snapshot）
- PITR（Point-in-Time Recovery）原理与实施
- Atlas 自动备份策略
- 备份恢复演练规范
- 容量规划：数据增长预测、分片扩容时机
- 冷热数据分层与归档策略

---

## 第八部分：原生 API 接入

### 32. [mongosh 常用操作](./content/content-32.md)
**解决问题**：熟练使用 MongoDB Shell，满足日常开发与运维需求

- 数据库与集合管理命令
- CRUD 完整操作示例
- 聚合管道调试技巧
- 索引管理命令
- 副本集与分片管理命令
- mongosh 脚本化与批处理
- 常用诊断命令速查表

### 33. [原生 CRUD API](./content/content-33.md)
**解决问题**：掌握 MongoDB 驱动层 CRUD 操作的完整 API

- `insertOne()` / `insertMany()` 插入操作
- `find()` / `findOne()` 查询操作
- `updateOne()` / `updateMany()` / `replaceOne()` 更新操作
- `deleteOne()` / `deleteMany()` 删除操作
- `findOneAndUpdate()` / `findOneAndDelete()` 原子操作
- 返回结果结构解析（`InsertOneResult`、`UpdateResult` 等）
- 错误处理与重试策略

### 34. [Bulk Write、事务 API 与 Change Streams](./content/content-34.md)
**解决问题**：掌握高级 API，应对批量写入、事务与事件驱动场景

- `bulkWrite()` 混合批量操作
- 多文档事务：`startSession()`、`startTransaction()`、`commitTransaction()`、`abortTransaction()`
- 事务重试模式（Transient Transaction Error Handling）
- Change Streams 监听数据变更
- Change Streams 过滤与恢复点（Resume Token）
- 企业案例：订单状态变更事件驱动

### 35. [聚合 API、索引 API 与管理 API](./content/content-35.md)
**解决问题**：掌握驱动层聚合、索引管理与集群管理接口

- `aggregate()` 聚合 API 与游标处理
- `createIndex()` / `listIndexes()` 索引管理
- `listCollections()` / `listDatabases()` 元数据查询
- `runCommand()` 执行原始命令
- `watch()` Change Streams API
- 超时控制（`maxTimeMS`）与操作取消
- 完整错误码参考与调试技巧

---

## 第九部分：Spring Boot 集成

### 36. [Spring Data MongoDB 架构](./content/content-36.md)
**解决问题**：理解 Spring 与 MongoDB 的集成方式与组件关系

- MongoDB Java Driver（同步 vs 响应式）
- Spring Data MongoDB 架构层次
- `MongoClient` vs `MongoTemplate` vs `Repository` 的关系
- Spring Boot Starter 自动装配原理
- 版本对应关系（Spring Boot 3.x + Spring Data 4.x + Driver 5.x）
- 同步驱动 vs Reactive 驱动（Spring WebFlux）

### 37. [配置与连接管理](./content/content-37.md)
**解决问题**：正确配置连接串、认证与连接池

- `application.yml` 配置详解（uri、database、auto-index-creation）
- 连接串格式（SRV 格式 vs 标准格式）
- 连接池参数：`maxPoolSize`、`minPoolSize`、`connectTimeoutMS`
- 认证配置（用户名密码、x.509）
- 多数据源配置
- SSL/TLS 安全连接
- 健康检查与连接重试配置

### 38. [Repository 模式与 MongoTemplate](./content/content-38.md)
**解决问题**：选择合适的数据访问方式，实现高效的数据操作

- `MongoRepository` 接口与方法命名查询
- 注解映射：`@Document`、`@Field`、`@Id`、`@Indexed`、`@DBRef`
- `MongoTemplate` 原生操作
- Repository vs MongoTemplate 的选择原则
- 分页与排序：`Pageable`、`Sort`
- 批量操作优化
- 实战：构建用户中心数据访问层

### 39. [聚合查询封装与事务支持](./content/content-39.md)
**解决问题**：在 Spring 中实现复杂聚合与事务

- `Aggregation` 构建器 API
- 自定义聚合阶段（`CustomProjectionOperation`）
- 聚合结果映射（`AggregationResults`）
- `@Query` 注解自定义查询
- Spring 事务管理（`@Transactional`）与 MongoDB 事务的适配
- 事务限制（仅副本集/分片集群支持）
- 企业案例：订单统计报表聚合

---

## 第十部分：Spring Cloud 集成

### 40. [微服务中 MongoDB 的边界与职责](./content/content-40.md)
**解决问题**：在微服务架构中合理使用 MongoDB，避免跨服务数据耦合

- 每个微服务独占 MongoDB 实例/数据库
- 领域驱动设计（DDD）与 MongoDB 的映射
- CQRS 模式在 MongoDB 中的实践
- 跨服务查询替代方案（数据冗余、读模型）
- 服务间数据一致性的权衡

### 41. [配置中心与服务发现集成](./content/content-41.md)
**解决问题**：集成 Spring Cloud 生态，实现动态配置与多集群管理

- Spring Cloud Config 管理 MongoDB 连接参数
- 动态刷新连接配置（`@RefreshScope`）
- Nacos / Eureka 服务发现
- 多 MongoDB 集群访问管理
- 客户端负载均衡策略
- 熔断降级（Sentinel / Resilience4j）

### 42. [分布式事务替代方案](./content/content-42.md)
**解决问题**：在微服务场景下实现跨服务数据一致性

- MongoDB 多文档事务的边界与限制
- Saga 模式（编排式 vs 协调式）
- 事件驱动架构（Event-Driven）+ Change Streams
- 本地消息表（Outbox Pattern）
- 幂等消费与消息去重
- 企业案例：跨服务订单支付一致性

### 43. [统一日志与审计链路](./content/content-43.md)
**解决问题**：在微服务体系中建立可观测性，整合 MongoDB 操作日志

- MongoDB 审计日志与 ELK 对接
- OpenTelemetry（OTel）链路追踪集成
- MongoDB 驱动命令监听器（`CommandListener`）
- 慢查询日志统一采集
- Kibana / Grafana 可视化
- 分布式追踪中的 MongoDB Span

---

## 第十一部分：企业最佳实践

### 44. [高并发订单与库存场景建模](./content/content-44.md)
**解决问题**：解决电商核心场景的数据模型与并发写入挑战

- 订单文档模型设计（订单头 + 订单行嵌入）
- 库存扣减的原子性保证（`$inc` + 条件更新）
- 超卖防护：乐观锁 vs 悲观锁
- 高峰写入削峰：写入队列 + 批量落库
- 订单状态机与 Change Streams 事件驱动
- 亿级订单的分片策略
- 完整企业架构案例

### 45. [用户画像与内容推荐场景](./content/content-45.md)
**解决问题**：构建灵活的用户标签体系与内容检索能力

- 用户画像文档模型（属性模式 + 桶模式）
- 标签体系的动态扩展设计
- 内容平台文档模型（多态文档）
- 全文搜索（文本索引 vs Atlas Search）
- 推荐系统数据管道：Change Streams → 特征计算
- 冷热数据分离：活跃用户 vs 沉睡用户

### 46. [多租户隔离方案](./content/content-46.md)
**解决问题**：SaaS 场景下实现安全、高效的多租户数据隔离

- 库级隔离（Database-per-Tenant）
- 集合级隔离（Collection-per-Tenant）
- 字段级隔离（TenantId 字段过滤）
- 各方案的成本、性能与安全性对比
- 部分索引实现租户数据隔离
- 资源配额控制与监控
- 企业案例：SaaS CRM 多租户架构

### 47. [安全合规与数据生命周期](./content/content-47.md)
**解决问题**：满足企业安全合规要求，管理数据生命周期

- 最小权限原则（Principle of Least Privilege）
- 字段级加密（Field Level Encryption，FLE）
- 静态数据加密（Encryption at Rest）
- 数据脱敏策略
- GDPR / 等保合规要点
- 数据冷热分层（TTL + 归档集合）
- 数据清理规范与软删除设计

### 48. [生产变更规范与故障演练](./content/content-48.md)
**解决问题**：建立安全的生产变更流程，提升故障恢复能力

- Schema 变更的灰度策略（双写、双读）
- 索引变更的滚动发布
- 分片键变更（6.0+ reshard）
- 版本升级路径（4.4 → 5.0 → 6.x → 7.x → 8.x）
- 故障注入与混沌工程
- 主节点切换演练
- 数据恢复演练（RTO / RPO 验证）

---

## 第十二部分：高级特性

### 49. [多文档事务与一致性边界](./content/content-49.md)
**解决问题**：理解 MongoDB 事务的能力边界，正确应用事务

- 事务的 ACID 保证与实现机制
- 单文档原子性 vs 多文档事务
- 事务性能开销（锁、快照、Oplog）
- 跨分片事务（Distributed Transaction）
- 事务超时与重试模式
- 何时不需要事务（文档内嵌代替事务）
- 企业案例：转账场景事务实现

### 50. [Change Streams 事件驱动架构](./content/content-50.md)
**解决问题**：利用 Change Streams 构建实时响应的事件驱动系统

- Change Streams 原理（基于 Oplog）
- 支持级别：集合、数据库、集群
- 过滤条件与聚合管道
- Resume Token 与断点续传
- 全文档预镜像（Pre/Post Image，6.0+）
- 高可用消费模式
- 企业案例：数据同步、缓存失效、审计日志

### 51. [Time Series 与 IoT 场景](./content/content-51.md)
**解决问题**：高效存储与查询时序数据

- Time Series Collection（5.0+）的存储优化
- `timeField`、`metaField`、`granularity` 配置
- 时序数据的自动分桶与压缩
- 与桶模式（Bucket Pattern）的对比
- TTL 自动过期配置
- 时序数据查询性能
- 企业案例：设备监控、传感器数据存储

### 52. [Atlas Search 与向量检索](./content/content-52.md)
**解决问题**：在 MongoDB 中实现全文搜索与 AI 向量检索

- Atlas Search 架构（基于 Lucene）
- 搜索索引（Search Index）定义
- `$search` 聚合阶段
- 模糊查询、自动补全、高亮
- Atlas Vector Search（向量检索）
- 向量索引（`vectorSearch` 索引类型）
- RAG（检索增强生成）场景应用
- Atlas Search vs 文本索引的选择

### 53. [Field Level Encryption（FLE）](./content/content-53.md)
**解决问题**：在客户端实现字段级加密，满足数据隐私合规要求

- FLE 架构：客户端加密 + KMS 密钥管理
- CSFLE（Client-Side Field Level Encryption）原理
- 加密算法：确定性加密 vs 随机加密
- 可查询加密（Queryable Encryption，6.0+）
- KMS 集成（AWS KMS、Azure Key Vault、GCP KMS）
- FLE 的性能影响与使用限制
- 企业案例：身份证号、银行卡号加密存储

### 54. [Schema Validation 与数据治理](./content/content-54.md)
**解决问题**：在灵活文档模型上建立数据质量保障机制

- `$jsonSchema` 验证规则定义
- 验证级别（`validationLevel`）：`strict` vs `moderate`
- 验证动作（`validationAction`）：`error` vs `warn`
- 正则表达式与枚举值校验
- 必填字段与类型约束
- Schema 版本演进策略
- 企业案例：订单数据质量治理

---

## 附录：面试题汇总

### [MongoDB 面试题精选（约 120 题）](./quiz/quiz.md)

**题型分布**：
- 基础概念题（25 题）：核心概念、文档模型、BSON、ObjectId
- 原理机制题（40 题）：存储引擎、索引、写入路径、查询执行、复制、分片
- 性能调优题（30 题）：慢查询、索引优化、内存调优、连接池
- 架构设计题（15 题）：副本集、分片集群、多租户、高并发
- 实战应用题（10 题）：Spring 集成、事务、Change Streams

**难度递进**：
- 基础（35 题）：考查核心概念理解
- 中等（50 题）：考查原理掌握与配置能力
- 困难（35 题）：考查架构设计与问题解决能力

**必备面试题**：
- MongoDB 与关系型数据库的核心区别
- WiredTiger 存储引擎的工作原理
- 副本集选举机制与脑裂防护
- 分片键选择的核心原则
- 聚合管道的执行流程与优化
- 如何解决热点分片问题
- 多文档事务的实现原理与限制
- 设计支撑亿级用户与高峰写入的 MongoDB 平台

---

## 学习建议

1. **按路径学习**：遵循"基础 → 存储 → 索引 → 查询 → 分布式 → 实践"的递进路径
2. **动手实操**：每个章节都要搭建环境、执行命令、观察结果
3. **理解原理**：存储引擎、复制集与分片是核心，必须深入理解
4. **关注版本**：注意 4.4、5.0、6.x、7.x、8.x 的重大特性差异
5. **实战为主**：结合真实场景（订单、用户、IoT）学习，避免纸上谈兵
6. **性能意识**：始终思考索引与查询的性能影响
7. **对比学习**：与关系型数据库对比，理解文档模型的特殊性

---

## 学习路径图

```
入门阶段（第 1-4 章）
  ↓ 理解文档模型与存储引擎基础

环境搭建（第 5-9 章）
  ↓ 从单机到容器、K8s、云原生的完整部署

写入机制（第 10-13 章）
  ↓ 掌握写入路径、一致性配置与批量写入

索引体系（第 14-18 章）
  ↓ 建立完整的索引选择与优化能力

查询优化（第 19-22 章）
  ↓ 掌握查询语法、聚合管道与分页优化

分布式架构（第 23-27 章）
  ↓ 理解副本集选主、Oplog、分片设计

调优监控（第 28-31 章）
  ↓ 建立完善的监控、调优与备份体系

原生 API（第 32-35 章）
  ↓ 熟练使用 mongosh 与驱动 API

Spring 集成（第 36-39 章）
  ↓ 掌握 Spring Data MongoDB 与事务

Spring Cloud 集成（第 40-43 章）
  ↓ 在微服务架构中应用 MongoDB

企业实践（第 44-48 章）
  ↓ 解决真实业务场景的复杂问题

高级特性（第 49-54 章）
  ↓ 探索事务、Change Streams、FLE、向量检索

面试准备（quiz.md）
  ↓ 检验学习成果与查漏补缺
```

---

**预计学习时间**：80-120 小时（取决于基础与实践深度）

**适合人群**：
- ✅ 有 Java / Node.js / Python 后端开发经验的开发者
- ✅ 使用过 MongoDB 但理解碎片化的工程师
- ✅ 希望系统掌握文档数据库与分布式架构的学习者
- ✅ 需要构建企业级数据平台的架构师
- ✅ 准备 MongoDB 相关岗位面试的候选人

**前置知识要求**：
- ✅ Java 基础（Spring 集成部分需要）
- ✅ Linux 基本操作
- ✅ 数据库基础知识（SQL 基础）
- ✅ 分布式系统基本概念（推荐但非必需）

**学习资源推荐**：
- 官方文档：https://www.mongodb.com/docs/
- MongoDB University：https://learn.mongodb.com/
- mongosh 参考：https://www.mongodb.com/docs/mongodb-shell/
- Spring Data MongoDB：https://spring.io/projects/spring-data-mongodb
 
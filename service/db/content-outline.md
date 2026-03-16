# 关系数据库系统化学习大纲

> 本大纲面向有编程经验但未系统学习关系数据库的开发者，帮助你建立完整的数据库心智模型，掌握 MySQL、Oracle、PostgreSQL 核心原理与生产实践。

---

## 学习路径

**SQL 语法 → 存储与索引 → 查询优化 → 事务并发 → 存储引擎 → 性能调优 → 高可用架构 → 备份安全**

---

## 第一部分：SQL 语言基础

### 1. [DDL 数据定义语言](./content/content-1.md)
**解决问题**：掌握数据库对象的创建、修改与删除

- CREATE：创建数据库、表、索引
- ALTER：修改表结构、添加约束
- DROP：删除对象及级联删除
- TRUNCATE vs DELETE 的区别
- 三大数据库的 DDL 语法差异
- DDL 事务性与自动提交

### 2. [DML 数据操作语言](./content/content-2.md)
**解决问题**：高效进行数据增删改操作

- INSERT：单行插入、批量插入、INSERT SELECT
- UPDATE：单表更新、多表关联更新
- DELETE：删除数据、批量删除优化
- MERGE/UPSERT：存在则更新，不存在则插入
- 三大数据库的 UPSERT 语法差异
- 大批量数据操作的性能优化

### 3. [DQL 数据查询语言基础](./content/content-3.md)
**解决问题**：掌握 SQL 查询的核心语法

- SELECT 基础：投影、过滤、排序
- WHERE 条件：比较运算符、逻辑运算符、LIKE、IN、BETWEEN
- 聚合函数：COUNT、SUM、AVG、MAX、MIN
- GROUP BY 与 HAVING
- DISTINCT 去重与性能影响
- ORDER BY 排序优化

### 4. [JOIN 关联查询](./content/content-4.md)
**解决问题**：掌握多表关联查询的原理与优化

- JOIN 类型：INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL OUTER JOIN
- CROSS JOIN 笛卡尔积
- SELF JOIN 自关联
- JOIN 的执行顺序与优化器选择
- 关联条件与过滤条件的区别
- 三大数据库的 JOIN 语法差异

### 5. [子查询与 CTE](./content/content-5.md)
**解决问题**：理解子查询的类型与优化策略

- 标量子查询、列子查询、表子查询
- 相关子查询 vs 非相关子查询
- EXISTS vs IN 的性能对比
- CTE（公共表表达式）：WITH 子句
- 递归 CTE 的应用场景
- 子查询改写为 JOIN

### 6. [窗口函数](./content/content-6.md)
**解决问题**：掌握高级分析函数的使用

- 窗口函数基础：OVER、PARTITION BY、ORDER BY
- 排名函数：ROW_NUMBER、RANK、DENSE_RANK
- 聚合窗口函数：SUM OVER、AVG OVER
- 偏移函数：LAG、LEAD、FIRST_VALUE、LAST_VALUE
- 窗口帧（ROWS vs RANGE）
- 三大数据库的窗口函数支持

### 7. [DCL 权限控制与 TCL 事务控制](./content/content-7.md)
**解决问题**：掌握权限管理与事务控制语句

- GRANT 授权语句
- REVOKE 撤销权限
- 角色管理：CREATE ROLE、DROP ROLE
- COMMIT、ROLLBACK、SAVEPOINT
- 自动提交 vs 手动提交
- 三大数据库的权限体系差异

### 8. [用户管理与初始化脚本](./content/content-8.md)
**解决问题**：掌握数据库用户创建与初始化流程

- MySQL 用户管理：CREATE USER、SET PASSWORD、FLUSH PRIVILEGES
- Oracle 用户管理：CREATE USER、ALTER USER、表空间配置
- PostgreSQL 用户管理：CREATE USER/ROLE、权限继承
- 默认初始化脚本编写
- 权限最小化原则
- 连接限制与资源配额

### 9. [字符集与排序规则](./content/content-9.md)
**解决问题**：理解字符集对存储与查询的影响

- 字符集选择：UTF-8、UTF8MB4、GBK
- 排序规则（Collation）：大小写敏感、二进制排序
- 字符集转换与乱码问题
- 三大数据库的字符集配置
- 字符集对索引与性能的影响
- 最佳实践与常见陷阱

---

## 第二部分：数据库对象与存储

### 10. [数据类型详解](./content/content-10.md)
**解决问题**：选择合适的数据类型，优化存储与性能

- 数值类型：INT、BIGINT、DECIMAL、FLOAT、DOUBLE
- 字符类型：CHAR、VARCHAR、TEXT、CLOB
- 日期时间类型：DATE、TIME、DATETIME、TIMESTAMP
- 二进制类型：BLOB、BYTEA、RAW
- JSON/XML 类型的支持与应用
- 三大数据库的数据类型对比

### 11. [表结构设计](./content/content-11.md)
**解决问题**：设计高效、可维护的表结构

- 主键设计：自增 ID、UUID、雪花算法
- 外键约束：级联更新、级联删除
- 唯一约束与检查约束
- 默认值与 NOT NULL
- 范式与反范式设计
- 冷热数据分离策略

### 12. [索引机制概览](./content/content-12.md)
**解决问题**：理解索引类型与适用场景

- B+Tree 索引：最常用的索引类型
- Hash 索引：等值查询优化
- 位图索引：低基数列优化
- 全文索引：文本搜索
- 函数索引与表达式索引
- 部分索引（Partial Index）
- 空间索引（GIS）

### 13. [B+Tree 索引原理深入](./content/content-13.md)
**解决问题**：掌握 B+Tree 索引的底层结构与查询过程

- B+Tree 数据结构原理
- 叶子节点与非叶子节点的存储
- 索引树的高度与性能影响
- 顺序 I/O vs 随机 I/O
- 索引页分裂与合并
- 索引的物理存储

### 14. [聚簇索引与非聚簇索引](./content/content-14.md)
**解决问题**：理解 InnoDB 与 MyISAM 的核心差异

- 聚簇索引：数据与索引一起存储
- 非聚簇索引：索引与数据分离
- InnoDB 的聚簇索引特性
- MyISAM 的非聚簇索引特性
- 主键选择对性能的影响
- 辅助索引的回表过程

### 15. [索引优化技术](./content/content-15.md)
**解决问题**：掌握高级索引优化技术

- 索引覆盖（Covering Index）：避免回表
- 联合索引与最左前缀原则
- 索引下推（ICP）：减少回表次数
- 索引合并（Index Merge）：多索引同时使用
- MRR（Multi-Range Read）：减少随机 I/O
- 松散索引扫描（Loose Index Scan）
- 索引排序优化

### 16. [索引选择性与基数](./content/content-16.md)
**解决问题**：评估索引质量，合理创建索引

- 索引选择性的定义与计算
- 基数统计（Cardinality）
- 索引区分度与命中率
- 低选择性列的索引策略
- 直方图与统计信息
- 三大数据库的统计信息收集

### 17. [索引失效场景](./content/content-17.md)
**解决问题**：识别并避免索引失效

- 隐式类型转换导致索引失效
- 函数操作导致索引失效
- LIKE 前缀匹配 vs 模糊查询
- OR 条件与索引选择
- NOT、!=、<> 的索引使用
- NULL 值对索引的影响
- 联合索引的失效场景

### 18. [索引维护与优化](./content/content-18.md)
**解决问题**：保持索引健康，避免性能下降

- 索引碎片的产生原因
- REBUILD vs REORGANIZE（重建 vs 重组）
- 在线索引重建（Online Index Rebuild）
- 索引监控与诊断
- 无效索引识别与清理
- 索引创建的最佳实践

### 19. [视图与物化视图](./content/content-19.md)
**解决问题**：使用视图简化查询，使用物化视图提升性能

- 视图的创建与使用
- 可更新视图的条件
- 视图的性能影响
- 物化视图：预计算结果集
- 物化视图的刷新策略
- 三大数据库的物化视图支持

### 20. [分区表](./content/content-20.md)
**解决问题**：管理超大表，提升查询性能

- 分区表的类型：Range、List、Hash、Key
- 分区裁剪（Partition Pruning）
- 分区维护：添加、删除、合并分区
- 分区索引：本地索引 vs 全局索引
- 分区表的适用场景
- 三大数据库的分区支持

### 21. [临时表与表空间](./content/content-21.md)
**解决问题**：使用临时表优化复杂查询

- 临时表的类型：会话级、事务级
- 临时表的使用场景
- 临时表空间管理
- 表空间的概念与配置（Oracle、PostgreSQL）
- 表空间性能优化
- 临时表 vs CTE

### 22. [存储过程、函数与触发器](./content/content-22.md)
**解决问题**：使用存储对象封装业务逻辑

- 存储过程 vs 函数
- PL/SQL（Oracle）、PL/pgSQL（PostgreSQL）、存储过程（MySQL）
- 参数传递：IN、OUT、INOUT
- 游标的使用与性能影响
- 触发器：BEFORE、AFTER、INSTEAD OF
- 存储对象的优缺点

---

## 第三部分：查询执行与优化

### 23. [SQL 执行流程](./content/content-23.md)
**解决问题**：理解 SQL 从输入到结果的完整流程

- 连接器：连接管理与认证
- 解析器：词法分析、语法分析、语义分析
- 优化器：生成执行计划
- 执行器：调用存储引擎执行
- 查询缓存（MySQL 已废弃）
- 三大数据库的执行流程对比

### 24. [查询优化器原理](./content/content-24.md)
**解决问题**：理解优化器如何选择执行计划

- 基于成本优化（CBO）：成本模型
- 基于规则优化（RBO）：规则集合
- 逻辑优化：谓词下推、投影下推、列裁剪
- 物理优化：访问路径选择、JOIN 顺序选择
- 优化器统计信息的作用
- 三大数据库的优化器差异

### 25. [执行计划分析](./content/content-25.md)
**解决问题**：读懂执行计划，定位性能问题

- EXPLAIN 输出解读
- 关键指标：type、rows、filtered、Extra
- 访问类型：ALL、index、range、ref、eq_ref、const
- Extra 信息：Using index、Using where、Using filesort
- Oracle 执行计划：DBMS_XPLAN
- PostgreSQL 执行计划：EXPLAIN ANALYZE

### 26. [成本估算与统计信息](./content/content-26.md)
**解决问题**：理解优化器的成本计算依据

- I/O 成本 vs CPU 成本
- 表扫描成本、索引扫描成本
- JOIN 成本估算
- 直方图：数据分布统计
- NDV（Number of Distinct Values）
- 统计信息的采样与更新
- 过期统计信息的影响

### 27. [查询优化技巧](./content/content-27.md)
**解决问题**：掌握 SQL 优化的实战技巧

- 索引优化：选择合适的索引
- JOIN 优化：驱动表选择、JOIN 算法
- 子查询优化：改写为 JOIN
- 分页优化：LIMIT OFFSET 的陷阱
- IN vs EXISTS 的选择策略
- UNION vs UNION ALL
- 查询改写技巧

### 28. [JOIN 算法详解](./content/content-28.md)
**解决问题**：理解数据库如何执行关联查询

- Nested Loop Join：嵌套循环连接
- Hash Join：哈希连接
- Merge Join：归并连接
- BKA（Batched Key Access）：批量连接优化
- JOIN 算法的选择条件
- 三大数据库的 JOIN 算法支持

### 29. [高级优化技术](./content/content-29.md)
**解决问题**：掌握数据库的高级优化特性

- 索引条件下推（ICP）应用
- MRR（Multi-Range Read）原理
- 子查询物化（Subquery Materialization）
- 半连接优化（Semi-Join）
- 谓词下推（Predicate Pushdown）
- 常量折叠与表达式化简

### 30. [Hint 提示符](./content/content-30.md)
**解决问题**：手动干预执行计划

- Oracle Hint：USE_NL、USE_HASH、INDEX、PARALLEL
- MySQL Optimizer Hint：FORCE INDEX、USE INDEX、STRAIGHT_JOIN
- PostgreSQL pg_hint_plan 插件
- Hint 的使用场景与注意事项
- 强制索引 vs 优化器自动选择
- Hint 的维护成本

---

## 第四部分：事务与并发控制

### 31. [ACID 特性详解](./content/content-31.md)
**解决问题**：理解事务的核心特性与实现原理

- 原子性（Atomicity）：Undo Log 实现
- 一致性（Consistency）：约束与触发器
- 隔离性（Isolation）：锁与 MVCC
- 持久性（Durability）：Redo Log 与 WAL
- ACID 的实现机制
- 三大数据库的 ACID 保证

### 32. [事务隔离级别](./content/content-32.md)
**解决问题**：掌握隔离级别与并发问题的关系

- 读未提交（Read Uncommitted）
- 读已提交（Read Committed）
- 可重复读（Repeatable Read）
- 串行化（Serializable）
- 隔离级别与性能的权衡
- 三大数据库的默认隔离级别

### 33. [并发问题详解](./content/content-33.md)
**解决问题**：识别并解决并发场景下的数据问题

- 脏读（Dirty Read）
- 不可重复读（Non-Repeatable Read）
- 幻读（Phantom Read）
- 丢失更新（Lost Update）
- 写偏斜（Write Skew）
- 隔离级别如何解决这些问题

### 34. [锁机制详解](./content/content-34.md)
**解决问题**：理解锁的类型与加锁规则

- 锁的粒度：表锁、页锁、行锁
- 锁的类型：共享锁（S）、排他锁（X）
- 意向锁（IS、IX）
- 间隙锁（Gap Lock）
- 临键锁（Next-Key Lock）
- 三大数据库的锁机制差异

### 35. [InnoDB 锁机制](./content/content-35.md)
**解决问题**：深入理解 InnoDB 的加锁规则

- 行锁的实现：Record Lock
- 间隙锁：防止幻读
- 临键锁：Record Lock + Gap Lock
- 插入意向锁
- 加锁规则：唯一索引 vs 非唯一索引
- 锁等待与死锁

### 36. [死锁处理](./content/content-36.md)
**解决问题**：识别、预防与解决死锁

- 死锁的产生条件
- 死锁检测算法
- 死锁的处理策略：超时回滚、死锁检测回滚
- 死锁预防：锁顺序、锁粒度
- 死锁日志分析
- 三大数据库的死锁检测机制

### 37. [MVCC 多版本并发控制](./content/content-37.md)
**解决问题**：理解 MVCC 如何实现高并发

- MVCC 的基本思想
- Undo Log 与版本链
- Read View 与可见性判断
- 快照读 vs 当前读
- MVCC 如何解决并发问题
- InnoDB vs PostgreSQL 的 MVCC 实现

### 38. [Undo Log 与 Redo Log](./content/content-38.md)
**解决问题**：理解事务日志的作用与实现

- Undo Log：回滚与 MVCC
- Redo Log：崩溃恢复与持久性
- 日志的写入时机
- 日志的刷盘策略
- 双写缓冲（Doublewrite Buffer）
- 三大数据库的日志机制

### 39. [乐观锁与悲观锁](./content/content-39.md)
**解决问题**：选择合适的并发控制策略

- 悲观锁：SELECT FOR UPDATE
- 乐观锁：版本号、时间戳
- CAS（Compare-And-Swap）
- 乐观锁的应用场景
- 乐观锁的 ABA 问题
- 悲观锁 vs 乐观锁的选择

---

## 第五部分：存储引擎与内部机制

### 40. [MySQL 存储引擎对比](./content/content-40.md)
**解决问题**：理解 InnoDB、MyISAM 等存储引擎的差异

- InnoDB：事务支持、行锁、外键
- MyISAM：表锁、全文索引、高并发读
- Memory：内存存储、临时表
- Archive、CSV 等特殊引擎
- 存储引擎的选择建议
- 存储引擎的切换

### 41. [InnoDB 架构深入](./content/content-41.md)
**解决问题**：掌握 InnoDB 的核心组件与工作原理

- Buffer Pool：缓冲池结构与管理
- Redo Log Buffer：日志缓冲
- Undo Log：回滚段
- Change Buffer：写入优化
- Adaptive Hash Index：自适应哈希索引
- InnoDB 线程模型

### 42. [PostgreSQL 架构](./content/content-42.md)
**解决问题**：理解 PostgreSQL 的进程模型与存储

- 进程架构：Postmaster、Backend 进程
- 共享内存：shared_buffers、WAL buffers
- MVCC 实现：元组版本链
- VACUUM：垃圾回收与空间回收
- 自动清理（Autovacuum）
- TOAST：大字段存储

### 43. [Oracle 架构](./content/content-43.md)
**解决问题**：掌握 Oracle 的内存结构与后台进程

- SGA（System Global Area）：共享池、缓冲区缓存、日志缓冲
- PGA（Program Global Area）：私有内存
- 后台进程：DBWR、LGWR、CKPT、SMON、PMON
- Redo Log：联机日志、归档日志
- Undo Tablespace：回滚段管理
- Oracle 实例 vs 数据库

### 44. [WAL 日志先行机制](./content/content-44.md)
**解决问题**：理解 WAL 如何保证数据持久性

- WAL 的基本原理
- 日志先行写入的必要性
- LSN（Log Sequence Number）
- 顺序写日志 vs 随机写数据
- WAL 的刷盘时机
- 三大数据库的 WAL 实现

### 45. [Checkpoint 检查点机制](./content/content-45.md)
**解决问题**：理解检查点如何平衡性能与恢复

- Checkpoint 的触发时机
- 脏页刷新策略
- Fuzzy Checkpoint vs Sharp Checkpoint
- Checkpoint 对性能的影响
- 检查点优化策略
- 三大数据库的 Checkpoint 机制

### 46. [崩溃恢复机制](./content/content-46.md)
**解决问题**：理解数据库如何从崩溃中恢复

- 崩溃恢复的流程
- Redo Log 的回放
- Undo Log 的回滚
- 恢复到一致性状态
- 恢复时间优化
- 三大数据库的恢复机制

---

## 第六部分：性能调优

### 47. [硬件层优化](./content/content-47.md)
**解决问题**：选择合适的硬件配置

- CPU：核心数、主频、缓存
- 内存：容量、频率、ECC
- 磁盘：SSD vs HDD、IOPS、吞吐量
- RAID 配置：RAID 0、1、5、10
- 网络：带宽、延迟
- 硬件配置建议

### 48. [配置参数优化](./content/content-48.md)
**解决问题**：调整数据库参数提升性能

- 缓冲池大小：innodb_buffer_pool_size、shared_buffers
- 连接数配置：max_connections
- 日志配置：日志大小、刷盘策略
- 并发控制：线程池、连接池
- 刷盘策略：innodb_flush_log_at_trx_commit
- 三大数据库的关键参数

### 49. [SQL 调优实战](./content/content-49.md)
**解决问题**：系统性地优化慢查询

- 慢查询日志分析
- 执行计划分析与优化
- 索引优化：添加、删除、调整索引
- 查询改写：消除子查询、优化 JOIN
- 分页查询优化：延迟关联、游标分页
- SQL 调优的完整流程

### 50. [表设计优化](./content/content-50.md)
**解决问题**：通过表设计提升性能

- 范式设计：第一、第二、第三范式
- 反范式设计：冗余换性能
- 垂直拆分：列拆分
- 水平拆分：行拆分
- 冷热数据分离
- 字段类型选择与优化

### 51. [监控与诊断工具](./content/content-51.md)
**解决问题**：建立完善的监控体系

- 慢查询日志（Slow Query Log）
- MySQL：Performance Schema、sys schema、show status
- Oracle：AWR、ASH、ADDM、Statspack
- PostgreSQL：pg_stat_statements、pg_stat_activity
- 等待事件分析
- 锁等待与死锁监控

### 52. [连接池管理](./content/content-52.md)
**解决问题**：优化数据库连接管理

- 连接池原理
- 连接复用机制
- 连接池大小配置
- 连接泄漏检测与处理
- 连接池中间件：HikariCP、Druid、PgBouncer
- 连接池监控与调优

### 53. [性能测试与基准测试](./content/content-53.md)
**解决问题**：科学评估数据库性能

- 基准测试工具：sysbench、pgbench、HammerDB
- TPS/QPS 测试
- 压力测试与容量规划
- 性能瓶颈识别
- 性能测试最佳实践
- 测试结果分析

---

## 第七部分：高可用与分布式架构

### 54. [主从复制原理](./content/content-54.md)
**解决问题**：理解数据复制的核心机制

- 异步复制、半同步复制、同步复制
- MySQL Binlog 复制：Row、Statement、Mixed
- GTID（全局事务标识符）
- PostgreSQL 流复制
- Oracle Data Guard
- 复制延迟问题

### 55. [复制拓扑与配置](./content/content-55.md)
**解决问题**：搭建主从复制环境

- 一主一从、一主多从
- 级联复制、双主复制
- 复制过滤：库级、表级
- 并行复制：多线程复制
- 复制监控与故障处理
- 三大数据库的复制配置

### 56. [读写分离](./content/content-56.md)
**解决问题**：通过读写分离提升吞吐量

- 读写分离架构
- 代理中间件：ProxySQL、MaxScale、Atlas
- 应用层实现：Spring、MyBatis
- 一致性问题：主从延迟处理
- 读写分离的适用场景
- 故障转移策略

### 57. [高可用方案](./content/content-57.md)
**解决问题**：构建高可用数据库架构

- MySQL：MHA、MGR（MySQL Group Replication）、Orchestrator
- Oracle：RAC、Data Guard、GoldenGate
- PostgreSQL：Patroni、Repmgr、Pgpool-II
- 主备切换：手动、自动、快速切换
- 故障检测与自动故障转移
- 高可用方案对比

### 58. [分库分表概述](./content/content-58.md)
**解决问题**：应对海量数据的扩展挑战

- 垂直拆分：按业务拆分
- 水平拆分：按数据拆分
- 分片键选择：范围、哈希、一致性哈希
- 分库分表的时机
- 分库分表带来的问题
- 分库分表方案对比

### 59. [分库分表实战](./content/content-59.md)
**解决问题**：实施分库分表方案

- 路由规则：单库单表、单库多表、多库多表
- 分片策略：Range、Hash、地理位置、自定义
- 多维分片与复合分片
- 全局表、广播表、ER 分片
- 跨分片查询：全局查询、二级索引
- 分库分表中间件：ShardingSphere、MyCAT、Vitess

### 60. [分布式 ID 生成](./content/content-60.md)
**解决问题**：在分布式环境下生成全局唯一 ID

- 数据库自增 ID 的问题
- 雪花算法（Snowflake）
- 数据库号段模式
- UUID/GUID
- Redis 生成 ID
- 各方案对比与选择

### 61. [分布式事务](./content/content-61.md)
**解决问题**：保证分布式环境下的数据一致性

- 两阶段提交（2PC）
- 三阶段提交（3PC）
- TCC（Try-Confirm-Cancel）
- Saga 模式
- 本地消息表
- 最终一致性方案
- 分布式事务框架：Seata

### 62. [数据迁移](./content/content-62.md)
**解决问题**：安全平滑地迁移数据

- 全量迁移：导出导入、物理备份
- 增量同步：Binlog、CDC
- 双写验证：数据一致性校验
- 灰度切换：流量切换策略
- 回滚方案：快速回退
- 数据迁移工具：DTS、Flyway、Liquibase

---

## 第八部分：备份恢复与安全

### 63. [备份策略](./content/content-63.md)
**解决问题**：设计完善的备份方案

- 全量备份、增量备份、差异备份
- 备份周期：每日、每周、每月
- 备份窗口与业务影响
- 冷备份 vs 热备份
- 备份数据的存储与管理
- 备份策略的设计原则

### 64. [备份工具详解](./content/content-64.md)
**解决问题**：掌握各数据库的备份工具

- MySQL：mysqldump、mysqlpump、Xtrabackup
- Oracle：RMAN、Data Pump
- PostgreSQL：pg_dump、pg_basebackup
- 逻辑备份 vs 物理备份
- 一致性备份与非一致性备份
- 备份工具的选择

### 65. [恢复策略](./content/content-65.md)
**解决问题**：快速恢复数据，减少损失

- 完全恢复：恢复到备份点
- 时间点恢复（PITR）：Binlog、归档日志
- 表级恢复与数据恢复
- Flashback（Oracle）：闪回技术
- 恢复演练：定期验证备份
- RTO/RPO 目标设定

### 66. [安全加固](./content/content-66.md)
**解决问题**：保护数据库免受攻击

- 权限最小化原则
- 网络隔离：防火墙、VPC
- SQL 注入防护：参数化查询
- 审计日志：操作记录与审计
- 敏感数据脱敏
- 数据库加固检查清单

### 67. [数据加密](./content/content-67.md)
**解决问题**：保护数据的机密性

- 透明数据加密（TDE）：表空间加密
- 传输加密：SSL/TLS
- 列加密与字段加密
- 密钥管理：密钥轮换、密钥存储
- 加密对性能的影响
- 三大数据库的加密支持

### 68. [审计与合规](./content/content-68.md)
**解决问题**：满足审计与合规要求

- 审计日志配置
- 审计内容：DDL、DML、登录、权限变更
- 审计日志分析
- 合规要求：等保、GDPR
- 审计工具：MySQL Enterprise Audit、Oracle Audit Vault
- 审计最佳实践

---

## 附录：面试题汇总

### [关系数据库面试题精选（150 题）](./quiz/quiz.md)

**题型分布**：
- SQL 基础题（30 题）：DDL、DML、DQL、JOIN、子查询
- 索引与优化题（30 题）：索引原理、执行计划、查询优化
- 事务与锁题（30 题）：ACID、隔离级别、MVCC、死锁
- 存储引擎题（20 题）：InnoDB、MVCC、日志机制
- 高可用架构题（20 题）：主从复制、读写分离、分库分表
- 性能调优题（20 题）：监控、诊断、SQL 优化

**难度递进**：
- 基础（50 题）：考查核心概念理解
- 进阶（60 题）：考查原理掌握与应用
- 高级（40 题）：考查深度理解与架构设计

**三大数据库对比**：
- 每题涉及三大数据库差异时会明确标注
- SQL 题目提供三大数据库的不同写法
- 架构题目对比不同数据库的实现方案

---

## 学习建议

1. **按顺序学习**：大纲按难度递进设计，建议顺序学习
2. **动手实践**：安装三大数据库，自己编写并执行 SQL
3. **深入思考**：理解"为什么这样设计"比记住语法更重要
4. **对比学习**：持续对比三大数据库的差异与特点
5. **生产视角**：学习时思考如何应用到实际生产环境
6. **查漏补缺**：完成面试题后，针对薄弱环节重点学习

---

## 学习路径图

```
入门阶段（第 1-9 章）
  ↓ 掌握 SQL 语法与权限管理
  
数据库对象（第 10-22 章）
  ↓ 理解存储、索引、分区等核心对象
  
查询优化（第 23-30 章）
  ↓ 掌握执行计划分析与优化技巧
  
事务并发（第 31-39 章）
  ↓ 理解事务、锁、MVCC 机制
  
存储引擎（第 40-46 章）
  ↓ 深入数据库内部实现
  
性能调优（第 47-53 章）
  ↓ 建立系统化调优能力
  
高可用架构（第 54-62 章）
  ↓ 掌握分布式与高可用方案
  
备份安全（第 63-68 章）
  ↓ 保障数据安全与合规
  
面试准备（quiz.md）
  ↓ 检验学习成果
```

---

## 三大数据库学习重点

**MySQL**（互联网高并发场景）
- InnoDB 存储引擎特性：行锁、MVCC、外键
- Binlog 复制：GTID、半同步复制、MGR
- 分库分表生态：ShardingSphere、MyCAT
- 高并发优化：索引优化、读写分离、分库分表

**Oracle**（企业核心系统）
- 企业级特性：RAC、Data Guard、Flashback、RMAN
- 高级 SQL：分析函数、层次查询、Pivot/Unpivot
- PL/SQL 编程：存储过程、包、游标、异常处理
- 性能诊断：AWR、ASH、ADDM

**PostgreSQL**（开源最先进特性）
- 丰富数据类型：JSON、数组、hstore、PostGIS
- 扩展性：插件机制、自定义类型/函数、外部数据包装器
- MVCC 实现：VACUUM、Autovacuum
- 逻辑复制、分区表、并行查询

---

**预计学习时间**：60-80 小时（取决于基础与学习深度）

**适合人群**：
- ✅ 有编程经验但未系统学习数据库的开发者
- ✅ 使用过数据库但理解碎片化的后端开发者
- ✅ 希望系统掌握数据库原理与调优的学习者
- ✅ 准备数据库相关面试的候选人
- ✅ 需要掌握多种数据库的架构师

**不适合人群**：
- ❌ 完全没有编程经验的初学者
- ❌ 只想快速完成业务需求的开发者
- ❌ 不关注数据库原理只会基础 CRUD 的学习者

---

**核心原则**：始终围绕"数据库如何高效、可靠地存储和查询数据"这一核心问题

© 2024 关系数据库系统化学习 | 覆盖 MySQL、Oracle、PostgreSQL 三大主流数据库

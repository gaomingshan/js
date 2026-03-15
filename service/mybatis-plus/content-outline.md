# MyBatis Plus 系统化学习大纲

> 本大纲适用于有 Java 基础和 MyBatis 经验的开发者，系统学习 MyBatis Plus 框架及其在企业级项目中的最佳实践。

---

## 第一部分：快速入门与核心理念

### 1. MyBatis Plus 概述
[1.1 MyBatis Plus 是什么](./content/content-1.md)
- MyBatis Plus 的诞生背景与设计理念
- 与原生 MyBatis 的关系与差异
- 核心特性一览
- 适用场景与不适用场景

[1.2 快速开始](./content/content-2.md)
- 依赖引入与版本选择
- Spring Boot 集成配置
- 第一个 CRUD 示例
- 配置文件详解（application.yml）

---

## 第二部分：核心组件与基础功能

### 2. CRUD 接口体系
[2.1 BaseMapper 接口](./content/content-3.md)
- BaseMapper 提供的内置方法
- 泛型设计与类型安全
- 方法命名规范与语义
- 与 MyBatis Mapper 的对比

[2.2 IService 与 ServiceImpl](./content/content-4.md)
- 服务层接口设计
- 批量操作方法（saveBatch、updateBatchById 等）
- 链式调用与 Lambda 支持
- Service 层最佳实践

### 3. 实体类配置
[3.1 注解体系](./content/content-5.md)
- @TableName：表名映射
- @TableId：主键策略
- @TableField：字段映射与排除
- @Version、@TableLogic 等特殊注解

[3.2 主键生成策略](./content/content-6.md)
- IdType 枚举详解（AUTO、ASSIGN_ID、ASSIGN_UUID 等）
- 雪花算法（Snowflake）原理与配置
- 自定义主键生成器
- 分布式 ID 方案选型

### 4. 条件构造器（Wrapper）
[4.1 QueryWrapper 与 UpdateWrapper](./content/content-7.md)
- 基本查询条件构造
- 复杂条件组合（and、or、nested）
- 字段选择与排除
- 排序、分组、聚合

[4.2 LambdaQueryWrapper 与 LambdaUpdateWrapper](./content/content-8.md)
- Lambda 表达式的优势（类型安全、重构友好）
- 常用方法与链式调用
- 动态条件构造技巧
- 性能对比与选择建议

[4.3 Wrapper 最佳实践](./content/content-9.md)
- 避免 SQL 注入风险
- 复杂查询的拆分与组合
- Wrapper 复用与封装
- 常见错误与陷阱

---

## 第三部分：高级特性

### 5. 分页功能
[5.1 分页插件配置与使用](./content/content-10.md)
- PaginationInnerInterceptor 原理
- Page 对象与分页参数
- 自定义分页查询
- 前端分页组件对接

[5.2 分页性能优化](./content/content-11.md)
- count 查询优化
- 大数据量分页问题（深分页）
- 游标分页方案
- 缓存策略

### 6. 代码生成器
[6.1 代码生成器使用](./content/content-12.md)
- AutoGenerator 配置详解
- 模板引擎选择（Velocity、Freemarker）
- 自定义生成模板
- 生成策略配置

[6.2 企业级代码生成实践](./content/content-13.md)
- 统一代码风格与规范
- 自定义字段类型映射
- 多模块项目生成
- 增量生成与版本管理

### 7. 插件机制
[7.1 内置插件详解](./content/content-14.md)
- 分页插件（PaginationInnerInterceptor）
- 多租户插件（TenantLineInnerInterceptor）
- 动态表名插件（DynamicTableNameInnerInterceptor）
- 乐观锁插件（OptimisticLockerInnerInterceptor）
- 防全表更新删除插件（BlockAttackInnerInterceptor）

[7.2 自定义插件开发](./content/content-15.md)
- MyBatis 拦截器原理
- InnerInterceptor 接口详解
- 自定义 SQL 拦截与改写
- 插件执行顺序与性能影响

### 8. 自动填充
[8.1 MetaObjectHandler 机制](./content/content-16.md)
- 自动填充原理与时机
- 创建时间、更新时间自动填充
- 创建人、更新人字段填充
- 多租户字段自动填充

[8.2 自动填充最佳实践](./content/content-17.md)
- 审计字段设计规范
- 与 Spring Security 集成获取当前用户
- 批量操作中的自动填充
- 性能优化建议

### 9. 逻辑删除
[9.1 逻辑删除机制](./content/content-18.md)
- @TableLogic 注解详解
- 逻辑删除的实现原理
- 查询时的自动过滤
- 逻辑删除字段设计

[9.2 逻辑删除实践问题](./content/content-19.md)
- 唯一索引冲突问题
- 统计与报表查询
- 物理删除场景
- 软删除数据的清理策略

### 10. 乐观锁
[10.1 乐观锁实现](./content/content-20.md)
- @Version 注解与原理
- 乐观锁插件配置
- 更新失败处理
- 与悲观锁的对比

[10.2 并发控制实践](./content/content-21.md)
- 高并发场景下的乐观锁策略
- 重试机制设计
- CAS 操作与 ABA 问题
- 分布式场景下的并发控制

---

## 第四部分：扩展与定制

### 11. SQL 注入器
[11.1 SQL 注入器原理](./content/content-22.md)
- AbstractMethod 与 AbstractSqlInjector
- 内置方法的实现原理
- SQL 模板与参数绑定
- MybatisConfiguration 配置

[11.2 自定义通用方法](./content/content-23.md)
- 扩展 BaseMapper 方法
- 批量插入优化（insertBatchSomeColumn）
- 自定义更新方法
- 通用方法的版本兼容性

### 12. ActiveRecord 模式
[12.1 ActiveRecord 使用](./content/content-24.md)
- Model 类继承与使用
- AR 模式的优缺点
- 适用场景分析
- 与传统 DAO 模式对比

### 13. 多数据源
[13.1 动态数据源配置](./content/content-25.md)
- dynamic-datasource-spring-boot-starter 集成
- 主从数据源配置
- @DS 注解使用
- 数据源切换原理（ThreadLocal）

[13.2 多数据源实践](./content/content-26.md)
- 读写分离方案
- 分库分表场景
- 事务管理与一致性
- 数据源监控与故障转移

---

## 第五部分：性能优化

### 14. 性能优化实践
[14.1 批量操作优化](./content/content-27.md)
- saveBatch 与 JDBC batch 的区别
- 批量大小调优
- rewriteBatchedStatements 参数
- 批量插入性能测试

[14.2 查询性能优化](./content/content-28.md)
- N+1 查询问题识别与解决
- 关联查询优化
- 索引使用建议
- 慢 SQL 分析与定位

[14.3 SQL 性能分析](./content/content-29.md)
- 性能分析插件（PerformanceInterceptor）
- SQL 执行时间监控
- 慢查询日志
- SQL 优化建议工具

### 15. 缓存策略
[15.1 MyBatis 缓存机制](./content/content-30.md)
- 一级缓存与二级缓存
- MyBatis Plus 与缓存的关系
- 缓存失效场景
- 缓存穿透与雪崩

[15.2 分布式缓存集成](./content/content-31.md)
- Redis 缓存集成
- 缓存注解使用（@Cacheable）
- 缓存更新策略
- 缓存一致性保证

---

## 第六部分：企业实战

### 16. 数据权限控制
[16.1 多租户方案](./content/content-32.md)
- 多租户架构设计（共享数据库、独立数据库、Schema 隔离）
- TenantLineInnerInterceptor 使用
- 租户 ID 自动填充
- 租户数据隔离验证

[16.2 数据权限实现](./content/content-33.md)
- 基于部门/角色的数据权限
- 数据权限插件开发
- 动态 WHERE 条件注入
- 权限规则配置化

### 17. 事务管理
[17.1 本地事务管理](./content/content-34.md)
- @Transactional 注解详解
- 事务传播行为
- 事务隔离级别
- 事务失效场景

[17.2 分布式事务](./content/content-35.md)
- 分布式事务问题与挑战
- Seata 集成方案
- TCC、SAGA 模式
- 最终一致性保证

### 18. 异常处理与日志
[18.1 异常处理规范](./content/content-36.md)
- MyBatis Plus 异常体系
- 全局异常处理
- 自定义异常与错误码
- 错误信息国际化

[18.2 SQL 日志管理](./content/content-37.md)
- 日志级别配置
- SQL 参数打印
- p6spy 集成
- 生产环境日志优化

### 19. 测试与质量保证
[19.1 单元测试](./content/content-38.md)
- H2 内存数据库测试
- @MybatisPlusTest 注解
- Mock 测试技巧
- 测试数据准备

[19.2 集成测试](./content/content-39.md)
- Testcontainers 使用
- 数据库迁移工具（Flyway、Liquibase）
- 测试覆盖率
- 性能基准测试

### 20. 项目实战案例
[20.1 电商订单系统](./content/content-40.md)
- 订单表设计
- 高并发下的库存扣减
- 订单状态机管理
- 分页查询优化

[20.2 权限管理系统](./content/content-41.md)
- RBAC 模型设计
- 用户、角色、权限表结构
- 权限查询优化
- 数据权限实现

---

## 第七部分：进阶主题

### 21. 源码分析
[21.1 核心组件源码](./content/content-42.md)
- MybatisSqlSessionFactoryBean 初始化流程
- MapperScan 注解原理
- Wrapper 构建流程
- SQL 注入器执行机制

[21.2 插件机制源码](./content/content-43.md)
- InterceptorChain 责任链模式
- Invocation 对象与反射
- 插件代理机制
- 性能优化细节

### 22. 版本升级与兼容性
[22.1 版本变更历史](./content/content-44.md)
- 3.x 版本重大变更
- 插件机制升级
- API 废弃与替代
- 升级指南与最佳实践

[22.2 与其他框架集成](./content/content-45.md)
- Spring Boot 版本兼容
- Spring Cloud 微服务集成
- JPA 与 MyBatis Plus 混用
- 国产数据库适配（达梦、人大金仓等）

### 23. 安全实践
[23.1 SQL 注入防护](./content/content-46.md)
- 参数化查询原理
- Wrapper 安全使用
- 动态 SQL 风险点
- 安全扫描工具

[23.2 敏感数据保护](./content/content-47.md)
- 字段加密存储
- 脱敏插件开发
- 审计日志记录
- 数据备份与恢复

### 24. 未来展望
[24.1 MyBatis Plus 发展趋势](./content/content-48.md)
- 社区活跃度与版本迭代
- 与 MyBatis 官方的关系
- 竞品对比（JPA、JOOQ、Fluent MyBatis）
- 技术选型建议

---

## 附录

### 学习路径建议
- **初学者**：第 1-4 章（快速入门 + 核心组件）
- **进阶开发者**：第 5-11 章（高级特性 + 扩展定制）
- **架构师**：第 12-20 章（性能优化 + 企业实战）
- **源码爱好者**：第 21-24 章（源码分析 + 进阶主题）

### 参考资料
- [MyBatis Plus 官方文档](https://baomidou.com/)
- [MyBatis 官方文档](https://mybatis.org/mybatis-3/zh/index.html)
- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- 相关开源项目与最佳实践

---

**总计 48 个小节，覆盖从入门到精通的完整学习路径**

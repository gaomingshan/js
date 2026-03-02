# Spring TX 源码指引

> spring-tx 提供声明式和编程式事务管理，是 Spring 数据访问的核心模块。

---

## 1. 事务抽象（PlatformTransactionManager）

### 核心接口
- **PlatformTransactionManager** - 事务管理器接口
  - `getTransaction()` - 获取事务
  - `commit()` - 提交事务
  - `rollback()` - 回滚事务
- **TransactionDefinition** - 事务定义接口
- **TransactionStatus** - 事务状态接口

### 核心实现
- **AbstractPlatformTransactionManager** - 事务管理器抽象基类
- **DataSourceTransactionManager** - JDBC 数据源事务管理器
- **JtaTransactionManager** - JTA 事务管理器
- **HibernateTransactionManager** - Hibernate 事务管理器（spring-orm）
- **JpaTransactionManager** - JPA 事务管理器（spring-orm）

### 设计目的
提供统一的事务管理抽象，屏蔽不同数据访问技术的差异（JDBC、JPA、Hibernate、JTA 等）。

### 使用限制与风险
- 不同事务管理器不可混用
- 嵌套事务需数据库支持（如 Savepoint）
- JTA 事务管理器适用于分布式事务

---

## 2. 声明式事务（@Transactional）

### 核心注解
- **@Transactional** - 声明式事务注解
- **@EnableTransactionManagement** - 启用事务管理

### 核心类
- **TransactionInterceptor** - 事务拦截器
- **TransactionAspectSupport** - 事务切面支持基类
- **BeanFactoryTransactionAttributeSourceAdvisor** - 事务通知器
- **AnnotationTransactionAttributeSource** - 注解事务属性源

### 注解属性
- **propagation** - 传播行为
- **isolation** - 隔离级别
- **timeout** - 超时时间（秒）
- **readOnly** - 只读事务
- **rollbackFor** - 回滚异常类
- **noRollbackFor** - 不回滚异常类

### 设计目的
通过注解声明事务边界，简化事务管理代码，实现事务与业务逻辑的解耦。

### 使用限制与风险
- 基于 AOP 代理，内部方法调用不生效
- 默认仅回滚 RuntimeException 和 Error
- @Transactional 可用于类级别（所有 public 方法）或方法级别
- 事务方法必须是 public（Spring AOP 限制）

---

## 3. 编程式事务（TransactionTemplate）

### 核心类
- **TransactionTemplate** - 事务模板
- **TransactionCallback** - 有返回值的事务回调
- **TransactionCallbackWithoutResult** - 无返回值的事务回调

### 使用示例
```java
transactionTemplate.execute(new TransactionCallback<Void>() {
    public Void doInTransaction(TransactionStatus status) {
        // 事务逻辑
        return null;
    }
});
```

或 Lambda 方式：
```java
transactionTemplate.execute(status -> {
    // 事务逻辑
    return result;
});
```

### 设计目的
提供编程式事务管理 API，适合需要细粒度控制事务的场景。

### 使用限制与风险
- 代码侵入性强，不如声明式事务简洁
- 适合动态事务边界或复杂事务逻辑
- 需手动管理事务状态

---

## 4. 事务传播行为（REQUIRED、REQUIRES_NEW 等）

### 传播行为枚举
- **REQUIRED（默认）** - 有事务则加入，无事务则新建
- **REQUIRES_NEW** - 始终新建事务，挂起当前事务
- **SUPPORTS** - 有事务则加入，无事务则非事务执行
- **NOT_SUPPORTED** - 非事务执行，挂起当前事务
- **MANDATORY** - 必须在事务内执行，否则抛异常
- **NEVER** - 必须非事务执行，否则抛异常
- **NESTED** - 嵌套事务（使用 Savepoint）

### 传播行为表格

| 传播行为 | 有事务 | 无事务 |
|---------|--------|--------|
| REQUIRED | 加入 | 新建 |
| REQUIRES_NEW | 挂起，新建 | 新建 |
| SUPPORTS | 加入 | 非事务 |
| NOT_SUPPORTED | 挂起 | 非事务 |
| MANDATORY | 加入 | 抛异常 |
| NEVER | 抛异常 | 非事务 |
| NESTED | 嵌套（Savepoint） | 新建 |

### 设计目的
控制事务边界和嵌套行为，满足复杂业务场景的事务需求。

### 使用限制与风险
- REQUIRES_NEW 会挂起外层事务，性能开销大
- NESTED 依赖数据库 Savepoint 支持（如 Oracle、PostgreSQL），MySQL InnoDB 支持
- 外层事务回滚会影响 NESTED 事务，但不影响 REQUIRES_NEW
- NESTED 内层回滚不影响外层，REQUIRED 内层回滚会导致外层标记 rollback-only

---

## 5. 事务隔离级别（READ_COMMITTED、REPEATABLE_READ 等）

### 隔离级别枚举
- **DEFAULT** - 使用数据库默认隔离级别
- **READ_UNCOMMITTED** - 读未提交（最低隔离级别）
- **READ_COMMITTED** - 读已提交（Oracle、SQL Server 默认）
- **REPEATABLE_READ** - 可重复读（MySQL InnoDB 默认）
- **SERIALIZABLE** - 串行化（最高隔离级别）

### 并发问题

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---------|------|-----------|------|
| READ_UNCOMMITTED | 可能 | 可能 | 可能 |
| READ_COMMITTED | 不可能 | 可能 | 可能 |
| REPEATABLE_READ | 不可能 | 不可能 | 可能（MySQL InnoDB 通过 MVCC 解决） |
| SERIALIZABLE | 不可能 | 不可能 | 不可能 |

### 设计目的
控制事务的隔离程度，平衡一致性和并发性能。

### 使用限制与风险
- 隔离级别越高，并发性能越低
- 不同数据库支持的隔离级别不同
- READ_UNCOMMITTED 几乎不使用（脏读风险）
- SERIALIZABLE 性能极差（串行执行）

---

## 6. 事务回滚规则（rollbackFor、noRollbackFor）

### 默认回滚规则
- **RuntimeException** - 回滚
- **Error** - 回滚
- **CheckedException** - 不回滚

### 自定义回滚规则
```java
@Transactional(rollbackFor = Exception.class) // 所有异常回滚
@Transactional(noRollbackFor = BusinessException.class) // 业务异常不回滚
```

### 核心类
- **RollbackRuleAttribute** - 回滚规则属性
- **NoRollbackRuleAttribute** - 不回滚规则属性
- **RuleBasedTransactionAttribute** - 基于规则的事务属性

### 设计目的
灵活控制哪些异常触发事务回滚，满足不同业务需求。

### 使用限制与风险
- 默认不回滚 CheckedException，需显式配置
- rollbackFor 和 noRollbackFor 可同时配置，noRollbackFor 优先级更高
- 异常被捕获后事务不会回滚（需重新抛出或手动标记）

---

## 7. 事务同步（TransactionSynchronization）

### 核心接口
- **TransactionSynchronization** - 事务同步回调接口
  - `beforeCommit()` - 提交前回调
  - `afterCommit()` - 提交后回调
  - `beforeCompletion()` - 完成前回调
  - `afterCompletion()` - 完成后回调

### 核心类
- **TransactionSynchronizationManager** - 事务同步管理器（ThreadLocal 存储）
- **TransactionSynchronizationAdapter** - 事务同步适配器（简化实现）

### 注册同步
```java
TransactionSynchronizationManager.registerSynchronization(
    new TransactionSynchronizationAdapter() {
        @Override
        public void afterCommit() {
            // 提交后执行
        }
    }
);
```

### 设计目的
在事务的不同阶段执行自定义逻辑，如清理缓存、发送消息等。

### 使用限制与风险
- 仅在存在事务时生效
- afterCommit 在事务提交后执行，适合触发异步操作
- afterCompletion 无论提交还是回滚都会执行
- 同步回调异常不会影响事务提交

---

## 8. 事务事件监听（@TransactionalEventListener）

### 核心注解
- **@TransactionalEventListener** - 事务事件监听器

### 事件阶段
- **BEFORE_COMMIT** - 提交前
- **AFTER_COMMIT（默认）** - 提交后
- **AFTER_ROLLBACK** - 回滚后
- **AFTER_COMPLETION** - 完成后（无论提交或回滚）

### 使用示例
```java
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void handleOrderCreated(OrderCreatedEvent event) {
    // 事务提交后执行
}
```

### 设计目的
将事件监听与事务生命周期绑定，确保事件处理在正确的事务阶段执行。

### 使用限制与风险
- 需在事务上下文中发布事件
- AFTER_COMMIT 确保事务成功提交后才执行监听器
- 监听器异常不会影响事务（已提交）

---

## 9. 事务属性解析（TransactionAttributeSource）

### 核心接口
- **TransactionAttributeSource** - 事务属性源接口
  - `getTransactionAttribute()` - 获取方法的事务属性
- **TransactionAttribute** - 事务属性接口（继承 TransactionDefinition）

### 核心实现
- **AnnotationTransactionAttributeSource** - 注解事务属性源（解析 @Transactional）
- **NameMatchTransactionAttributeSource** - 方法名匹配事务属性源
- **MethodMapTransactionAttributeSource** - 方法映射事务属性源
- **CompositeTransactionAttributeSource** - 组合事务属性源

### 设计目的
抽象事务属性的获取逻辑，支持注解、XML、编程式等多种配置方式。

### 使用限制与风险
- 注解配置是主流
- 多个事务属性源可组合使用

---

## 10. 事务拦截器与代理（TransactionInterceptor）

### 核心类
- **TransactionInterceptor** - 事务拦截器（实现 MethodInterceptor）
- **TransactionAspectSupport** - 事务切面支持基类
- **BeanFactoryTransactionAttributeSourceAdvisor** - 事务通知器

### 工作流程
1. 方法调用时，TransactionInterceptor 拦截
2. 通过 TransactionAttributeSource 获取事务属性
3. 根据传播行为决定是否创建新事务
4. 执行目标方法
5. 根据结果提交或回滚事务

### 设计目的
基于 AOP 实现声明式事务，将事务管理逻辑与业务逻辑分离。

### 使用限制与风险
- 基于代理，内部方法调用不生效
- 代理对象获取可通过 AopContext.currentProxy()

---

## 11. 事务状态管理（TransactionStatus）

### 核心接口
- **TransactionStatus** - 事务状态接口
  - `isNewTransaction()` - 是否新事务
  - `hasSavepoint()` - 是否有保存点
  - `setRollbackOnly()` - 标记为仅回滚
  - `isRollbackOnly()` - 是否仅回滚
  - `isCompleted()` - 是否已完成

### 核心实现
- **DefaultTransactionStatus** - 默认事务状态实现
- **AbstractTransactionStatus** - 事务状态抽象基类

### 设计目的
封装事务的运行时状态，提供事务控制 API。

### 使用限制与风险
- setRollbackOnly() 标记后，事务只能回滚，不能提交
- TransactionStatus 通常在 TransactionCallback 中使用

---

## 12. 保存点机制（Savepoint）

### 核心接口
- **SavepointManager** - 保存点管理器接口
  - `createSavepoint()` - 创建保存点
  - `rollbackToSavepoint()` - 回滚到保存点
  - `releaseSavepoint()` - 释放保存点

### 实现类
- **JdbcTransactionObjectSupport** - JDBC 事务对象支持（实现 SavepointManager）

### NESTED 传播行为
- 使用 Savepoint 实现嵌套事务
- 内层事务回滚到保存点，不影响外层事务

### 设计目的
实现真正的嵌套事务，内层事务可独立回滚。

### 使用限制与风险
- 需数据库支持 Savepoint（Oracle、PostgreSQL、MySQL InnoDB 等）
- Savepoint 有性能开销
- 外层事务回滚会导致内层事务一起回滚

---

## 13. 事务管理器扩展

### 自定义事务管理器
继承 `AbstractPlatformTransactionManager`，实现：
- `doGetTransaction()` - 获取事务对象
- `doBegin()` - 开始事务
- `doCommit()` - 提交事务
- `doRollback()` - 回滚事务
- `doSuspend()` - 挂起事务（可选）
- `doResume()` - 恢复事务（可选）

### 设计目的
支持自定义数据访问技术的事务管理。

### 使用限制与风险
- 实现复杂，需深入理解事务语义
- 大多数场景使用内置事务管理器即可

---

## 14. 多数据源事务（ChainedTransactionManager）

### 核心类
- **ChainedTransactionManager** - 链式事务管理器（已废弃）

### 替代方案
- **JTA 事务管理器** - 分布式事务标准
- **Seata** - 阿里开源分布式事务解决方案
- **手动控制多数据源事务** - 编程式管理

### 设计目的
管理多个数据源的事务，但实现有局限性（非真正的分布式事务）。

### 使用限制与风险
- ChainedTransactionManager 已在 Spring 5.3 废弃
- 非 XA 事务，可能出现数据不一致
- 建议使用 JTA 或分布式事务中间件

---

## 15. 事务日志与调试

### 日志配置
```properties
logging.level.org.springframework.transaction=DEBUG
logging.level.org.springframework.jdbc.datasource.DataSourceTransactionManager=DEBUG
```

### 调试信息
- 事务开始、提交、回滚
- 事务传播行为决策
- 事务同步回调执行

### 设计目的
帮助排查事务问题，理解事务执行流程。

### 使用限制与风险
- DEBUG 日志量大，生产环境需谨慎
- 敏感 SQL 可能泄露

---

## 📚 总结

spring-tx 提供了完整的事务管理解决方案：
- **事务抽象**：PlatformTransactionManager 统一不同数据访问技术
- **声明式事务**：@Transactional 简化事务管理
- **编程式事务**：TransactionTemplate 提供细粒度控制
- **传播行为**：7 种传播行为满足各种嵌套场景
- **隔离级别**：4 种隔离级别平衡一致性和性能
- **事务同步**：TransactionSynchronization 支持事务生命周期回调
- **事务事件**：@TransactionalEventListener 与事件机制集成
- **保存点**：Savepoint 实现嵌套事务

Spring 事务管理是数据访问层的核心基础设施，广泛应用于企业级应用。

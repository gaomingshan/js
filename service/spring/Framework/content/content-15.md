# 第 15 章：事务传播行为详解

> **学习目标**：深入理解 7 种事务传播行为的原理和应用场景  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐⭐ 高级  
> **源码入口**：`AbstractPlatformTransactionManager.handleExistingTransaction()`

---

## 1. 核心概念

**事务传播行为（Transaction Propagation）** 定义了当一个事务方法被另一个事务方法调用时，应该如何处理事务。

**问题场景**：
```java
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
    
    @Transactional
    public void methodA() {
        // 执行 A 的业务逻辑
        serviceB.methodB();  // 调用 B 的事务方法
    }
}

@Service
public class ServiceB {
    @Transactional
    public void methodB() {
        // 执行 B 的业务逻辑
    }
}
```

**问题**：
- methodB 应该加入 methodA 的事务吗？
- 如果 methodB 抛异常，methodA 会回滚吗？
- 如果 methodA 抛异常，methodB 会回滚吗？

**答案**：取决于**事务传播行为**。

---

## 2. 七种传播行为

### 2.1 传播行为定义

```java
public enum Propagation {
    
    /**
     * 默认：支持当前事务，不存在则创建新事务
     */
    REQUIRED(TransactionDefinition.PROPAGATION_REQUIRED),
    
    /**
     * 支持当前事务，不存在则以非事务方式执行
     */
    SUPPORTS(TransactionDefinition.PROPAGATION_SUPPORTS),
    
    /**
     * 必须在事务中运行，不存在则抛异常
     */
    MANDATORY(TransactionDefinition.PROPAGATION_MANDATORY),
    
    /**
     * 创建新事务，挂起当前事务（如果存在）
     */
    REQUIRES_NEW(TransactionDefinition.PROPAGATION_REQUIRES_NEW),
    
    /**
     * 以非事务方式执行，挂起当前事务（如果存在）
     */
    NOT_SUPPORTED(TransactionDefinition.PROPAGATION_NOT_SUPPORTED),
    
    /**
     * 以非事务方式执行，存在事务则抛异常
     */
    NEVER(TransactionDefinition.PROPAGATION_NEVER),
    
    /**
     * 如果当前存在事务，则在嵌套事务中执行；否则创建新事务
     */
    NESTED(TransactionDefinition.PROPAGATION_NESTED);
}
```

### 2.2 对比表

| 传播行为 | 当前有事务 | 当前无事务 | 应用场景 |
|---------|-----------|-----------|----------|
| **REQUIRED** | 加入当前事务 | 创建新事务 | 默认，最常用 |
| **SUPPORTS** | 加入当前事务 | 非事务执行 | 查询操作 |
| **MANDATORY** | 加入当前事务 | 抛异常 | 必须在事务中 |
| **REQUIRES_NEW** | 挂起当前事务，创建新事务 | 创建新事务 | 独立事务 |
| **NOT_SUPPORTED** | 挂起当前事务，非事务执行 | 非事务执行 | 不需要事务 |
| **NEVER** | 抛异常 | 非事务执行 | 禁止事务 |
| **NESTED** | 嵌套事务（SavePoint） | 创建新事务 | 部分回滚 |

---

## 3. REQUIRED（默认）

### 3.1 行为说明

**有事务**：加入当前事务  
**无事务**：创建新事务

```
外层方法（有事务）→ 内层方法（REQUIRED）
    ↓
加入同一个事务
    ↓
任何一个方法抛异常，整个事务回滚
```

### 3.2 示例代码

```java
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
    
    @Transactional
    public void methodA() {
        // 操作1
        userDao.save(user1);
        
        // 调用 B（加入当前事务）
        serviceB.methodB();
        
        // 操作2
        userDao.save(user2);
    }
}

@Service
public class ServiceB {
    @Transactional(propagation = Propagation.REQUIRED)
    public void methodB() {
        // 操作3（与 A 在同一个事务）
        orderDao.save(order);
    }
}
```

**场景 1：B 抛异常**
```java
public void methodA() {
    userDao.save(user1);  // 操作1
    serviceB.methodB();   // 抛异常
    userDao.save(user2);  // 不会执行
}

// 结果：user1、order 都回滚
```

**场景 2：A 抛异常**
```java
public void methodA() {
    userDao.save(user1);  // 操作1
    serviceB.methodB();   // 操作2
    throw new RuntimeException();  // 抛异常
}

// 结果：user1、order 都回滚
```

### 3.3 源码分析

```java
// AbstractPlatformTransactionManager.getTransaction()
public final TransactionStatus getTransaction(@Nullable TransactionDefinition definition) {
    Object transaction = doGetTransaction();
    
    // 如果已存在事务
    if (isExistingTransaction(transaction)) {
        return handleExistingTransaction(definition, transaction, debugEnabled);
    }
    
    // 检查超时
    if (definition.getTimeout() < TransactionDefinition.TIMEOUT_DEFAULT) {
        throw new InvalidTimeoutException("Invalid transaction timeout", definition.getTimeout());
    }
    
    // REQUIRED：创建新事务
    if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRED) {
        SuspendedResourcesHolder suspendedResources = suspend(null);
        try {
            return startTransaction(definition, transaction, debugEnabled, suspendedResources);
        } catch (RuntimeException | Error ex) {
            resume(null, suspendedResources);
            throw ex;
        }
    }
    
    // ...
}

private TransactionStatus handleExistingTransaction(
        TransactionDefinition definition, Object transaction, boolean debugEnabled) {
    
    // REQUIRED：加入当前事务
    if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRED) {
        return newTransactionStatus(definition, transaction, false, false, debugEnabled, null);
    }
    
    // ...
}
```

---

## 4. REQUIRES_NEW

### 4.1 行为说明

**有事务**：挂起当前事务，创建新事务  
**无事务**：创建新事务

```
外层方法（事务A）→ 内层方法（REQUIRES_NEW，事务B）
    ↓
挂起事务A，创建事务B
    ↓
B 提交/回滚与 A 无关
```

### 4.2 示例代码

```java
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
    
    @Transactional
    public void methodA() {
        userDao.save(user1);  // 事务A
        serviceB.methodB();   // 事务B（独立）
        userDao.save(user2);  // 事务A
    }
}

@Service
public class ServiceB {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void methodB() {
        orderDao.save(order);  // 独立事务
    }
}
```

**场景 1：B 抛异常**
```java
public void methodA() {
    userDao.save(user1);  // 事务A
    serviceB.methodB();   // 事务B 抛异常并回滚
    userDao.save(user2);  // 不会执行
}

// 结果：
// - order 回滚（事务B）
// - user1 回滚（事务A 因 B 抛异常而回滚）
// - user2 未执行
```

**场景 2：A 抛异常**
```java
public void methodA() {
    userDao.save(user1);  // 事务A
    serviceB.methodB();   // 事务B 成功提交
    throw new RuntimeException();  // 事务A 抛异常
}

// 结果：
// - order 已提交（事务B 独立）
// - user1 回滚（事务A）
```

### 4.3 应用场景

**场景：记录操作日志**
```java
@Service
public class UserService {
    @Autowired
    private LogService logService;
    
    @Transactional
    public void deleteUser(Long userId) {
        userDao.delete(userId);
        
        // 记录日志（独立事务，即使删除失败也要记录）
        logService.log("删除用户: " + userId);
        
        // 模拟异常
        throw new RuntimeException("删除失败");
    }
}

@Service
public class LogService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String message) {
        logDao.save(new Log(message));
    }
}

// 结果：
// - 用户未删除（回滚）
// - 日志已保存（独立事务，已提交）
```

### 4.4 源码分析

```java
private TransactionStatus handleExistingTransaction(
        TransactionDefinition definition, Object transaction, boolean debugEnabled) {
    
    // REQUIRES_NEW：挂起当前事务，创建新事务
    if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW) {
        // 挂起当前事务
        SuspendedResourcesHolder suspendedResources = suspend(transaction);
        try {
            // 创建新事务
            return startTransaction(definition, transaction, debugEnabled, suspendedResources);
        } catch (RuntimeException | Error beginEx) {
            resumeAfterBeginException(transaction, suspendedResources, beginEx);
            throw beginEx;
        }
    }
    
    // ...
}

protected final SuspendedResourcesHolder suspend(@Nullable Object transaction) {
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
        List<TransactionSynchronization> suspendedSynchronizations = doSuspendSynchronization();
        try {
            Object suspendedResources = null;
            if (transaction != null) {
                // 挂起事务资源
                suspendedResources = doSuspend(transaction);
            }
            
            // 清空 ThreadLocal
            String name = TransactionSynchronizationManager.getCurrentTransactionName();
            TransactionSynchronizationManager.setCurrentTransactionName(null);
            boolean readOnly = TransactionSynchronizationManager.isCurrentTransactionReadOnly();
            TransactionSynchronizationManager.setCurrentTransactionReadOnly(false);
            Integer isolationLevel = TransactionSynchronizationManager.getCurrentTransactionIsolationLevel();
            TransactionSynchronizationManager.setCurrentTransactionIsolationLevel(null);
            boolean wasActive = TransactionSynchronizationManager.isActualTransactionActive();
            TransactionSynchronizationManager.setActualTransactionActive(false);
            
            return new SuspendedResourcesHolder(
                suspendedResources, suspendedSynchronizations, name, readOnly, isolationLevel, wasActive);
        } catch (RuntimeException | Error ex) {
            doResumeSynchronization(suspendedSynchronizations);
            throw ex;
        }
    } else if (transaction != null) {
        Object suspendedResources = doSuspend(transaction);
        return new SuspendedResourcesHolder(suspendedResources);
    } else {
        return null;
    }
}
```

---

## 5. NESTED

### 5.1 行为说明

**有事务**：在嵌套事务中执行（使用 SavePoint）  
**无事务**：创建新事务

```
外层方法（事务A）→ 内层方法（NESTED，嵌套事务）
    ↓
创建 SavePoint
    ↓
内层异常：回滚到 SavePoint
外层异常：整个事务回滚
```

### 5.2 示例代码

```java
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
    
    @Transactional
    public void methodA() {
        userDao.save(user1);  // 操作1
        
        try {
            serviceB.methodB();  // 嵌套事务
        } catch (Exception e) {
            // 捕获异常，继续执行
        }
        
        userDao.save(user2);  // 操作2
    }
}

@Service
public class ServiceB {
    @Transactional(propagation = Propagation.NESTED)
    public void methodB() {
        orderDao.save(order);
        throw new RuntimeException("B 抛异常");
    }
}

// 结果：
// - order 回滚（回滚到 SavePoint）
// - user1、user2 提交（外层事务正常）
```

### 5.3 NESTED vs REQUIRES_NEW

| 特性 | NESTED | REQUIRES_NEW |
|------|--------|--------------|
| **实现方式** | SavePoint | 独立事务 |
| **事务数量** | 1 个事务 | 2 个事务 |
| **内层回滚** | 回滚到 SavePoint | 回滚独立事务 |
| **外层回滚** | 整个事务回滚 | 外层事务回滚，内层已提交 |
| **连接数** | 1 个连接 | 2 个连接 |
| **性能** | 更好 | 稍差 |

### 5.4 源码分析

```java
// DataSourceTransactionManager
@Override
protected void doBegin(Object transaction, TransactionDefinition definition) {
    DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
    
    // ...
    
    // NESTED：使用 SavePoint
    if (definition.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NESTED) {
        if (!isNestedTransactionAllowed()) {
            throw new NestedTransactionNotSupportedException(
                "Transaction manager does not allow nested transactions by default");
        }
        
        // 创建 SavePoint
        if (useSavepointForNestedTransaction()) {
            DefaultTransactionStatus status = prepareTransactionStatus(
                definition, transaction, false, false, debugEnabled, null);
            status.createAndHoldSavepoint();
            return status;
        }
    }
    
    // ...
}

// DefaultTransactionStatus
public void createAndHoldSavepoint() throws TransactionException {
    setSavepoint(getSavepointManager().createSavepoint());
}

// JdbcTransactionObjectSupport
@Override
public Object createSavepoint() throws TransactionException {
    ConnectionHolder conHolder = getConnectionHolderForSavepoint();
    try {
        if (!conHolder.supportsSavepoints()) {
            throw new NestedTransactionNotSupportedException(
                "Cannot create a nested transaction because savepoints are not supported by your JDBC driver");
        }
        // 创建 JDBC SavePoint
        return conHolder.createSavepoint();
    } catch (SQLException ex) {
        throw new CannotCreateTransactionException("Could not create JDBC savepoint", ex);
    }
}

// 回滚到 SavePoint
@Override
protected void doRollback(DefaultTransactionStatus status) {
    if (status.hasSavepoint()) {
        try {
            // 回滚到 SavePoint
            status.rollbackToHeldSavepoint();
        } catch (Throwable ex) {
            throw new TransactionSystemException("Could not roll back to JDBC savepoint", ex);
        }
    } else {
        // 回滚整个事务
        DataSourceTransactionObject txObject = (DataSourceTransactionObject) status.getTransaction();
        Connection con = txObject.getConnectionHolder().getConnection();
        try {
            con.rollback();
        } catch (SQLException ex) {
            throw new TransactionSystemException("Could not roll back JDBC transaction", ex);
        }
    }
}
```

---

## 6. 其他传播行为

### 6.1 SUPPORTS

```java
@Service
public class ServiceB {
    @Transactional(propagation = Propagation.SUPPORTS)
    public void methodB() {
        // 有事务：加入事务
        // 无事务：非事务执行
    }
}

// 场景1：有事务
@Transactional
public void methodA() {
    serviceB.methodB();  // 加入事务
}

// 场景2：无事务
public void methodA() {
    serviceB.methodB();  // 非事务执行
}
```

### 6.2 MANDATORY

```java
@Service
public class ServiceB {
    @Transactional(propagation = Propagation.MANDATORY)
    public void methodB() {
        // 必须在事务中执行
    }
}

// 场景1：有事务
@Transactional
public void methodA() {
    serviceB.methodB();  // ✅ 成功
}

// 场景2：无事务
public void methodA() {
    serviceB.methodB();  // ❌ 抛异常：IllegalTransactionStateException
}
```

### 6.3 NOT_SUPPORTED

```java
@Service
public class ServiceB {
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void methodB() {
        // 挂起当前事务，以非事务方式执行
    }
}

@Transactional
public void methodA() {
    userDao.save(user1);  // 事务
    serviceB.methodB();   // 非事务（挂起）
    userDao.save(user2);  // 事务
}
```

### 6.4 NEVER

```java
@Service
public class ServiceB {
    @Transactional(propagation = Propagation.NEVER)
    public void methodB() {
        // 不能在事务中执行
    }
}

// 场景1：有事务
@Transactional
public void methodA() {
    serviceB.methodB();  // ❌ 抛异常：IllegalTransactionStateException
}

// 场景2：无事务
public void methodA() {
    serviceB.methodB();  // ✅ 成功
}
```

---

## 7. 实际落地场景（工作实战）

### 场景 1：批量操作部分失败

```java
@Service
public class OrderService {
    @Autowired
    private OrderItemService orderItemService;
    
    @Transactional
    public void createOrder(Order order) {
        // 保存订单
        orderDao.save(order);
        
        // 保存订单项（部分失败不影响订单）
        for (OrderItem item : order.getItems()) {
            try {
                orderItemService.saveItem(item);
            } catch (Exception e) {
                log.error("保存订单项失败: " + item.getId(), e);
                // 继续处理下一个
            }
        }
    }
}

@Service
public class OrderItemService {
    @Transactional(propagation = Propagation.NESTED)
    public void saveItem(OrderItem item) {
        orderItemDao.save(item);
        // 可能抛异常
    }
}
```

### 场景 2：审计日志

```java
@Service
public class UserService {
    @Autowired
    private AuditService auditService;
    
    @Transactional
    public void updateUser(User user) {
        userDao.update(user);
        
        // 记录审计日志（独立事务，确保一定记录）
        auditService.log("更新用户: " + user.getId());
    }
}

@Service
public class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action) {
        auditDao.save(new AuditLog(action, new Date()));
    }
}
```

### 场景 3：积分奖励

```java
@Service
public class OrderService {
    @Autowired
    private PointsService pointsService;
    
    @Transactional
    public void createOrder(Order order) {
        // 创建订单
        orderDao.save(order);
        
        // 赠送积分（失败不影响订单）
        try {
            pointsService.awardPoints(order.getUserId(), order.getAmount());
        } catch (Exception e) {
            log.error("赠送积分失败", e);
            // 不抛异常，订单正常创建
        }
    }
}

@Service
public class PointsService {
    @Transactional(propagation = Propagation.NESTED)
    public void awardPoints(Long userId, BigDecimal amount) {
        int points = amount.intValue();
        pointsDao.add(userId, points);
    }
}
```

---

## 8. 面试准备专项

### 高频面试题：Spring 事务传播行为有哪些？

**第一层（基础回答 - 60分）**：
7 种传播行为：REQUIRED、REQUIRES_NEW、NESTED、SUPPORTS、MANDATORY、NOT_SUPPORTED、NEVER。

**第二层（深入原理 - 80分）**：
详细说明每种传播行为：

1. **REQUIRED**（默认）：支持当前事务，不存在则创建
2. **REQUIRES_NEW**：创建新事务，挂起当前事务
3. **NESTED**：嵌套事务，使用 SavePoint
4. **SUPPORTS**：支持当前事务，不存在则非事务执行
5. **MANDATORY**：必须在事务中，不存在则抛异常
6. **NOT_SUPPORTED**：非事务执行，挂起当前事务
7. **NEVER**：非事务执行，存在事务则抛异常

**第三层（扩展延伸 - 95分）**：
从源码和应用场景角度说明：

**REQUIRED vs REQUIRES_NEW vs NESTED**：

| 对比项 | REQUIRED | REQUIRES_NEW | NESTED |
|--------|----------|--------------|--------|
| **事务数** | 1 | 2 | 1 |
| **连接数** | 1 | 2 | 1 |
| **内层回滚** | 整个事务回滚 | 独立事务回滚 | 回滚到 SavePoint |
| **外层回滚** | 整个事务回滚 | 外层回滚，内层已提交 | 整个事务回滚 |
| **应用场景** | 默认 | 独立事务 | 部分回滚 |

**追问应对**：

**追问 1：NESTED 和 REQUIRES_NEW 的区别？**
- NESTED：1 个事务，使用 SavePoint，内层异常可回滚到 SavePoint
- REQUIRES_NEW：2 个独立事务，内层已提交的不受外层影响

**追问 2：什么场景使用 REQUIRES_NEW？**
- 记录操作日志（即使业务失败也要记录）
- 发送通知（独立于业务事务）
- 审计跟踪

**加分项**：
- 能画出传播行为的执行流程图
- 能说出 SavePoint 的实现原理
- 能举出实际应用场景

---

## 9. 学习自检清单

- [ ] 能够说出 7 种事务传播行为
- [ ] 能够区分 REQUIRED、REQUIRES_NEW、NESTED
- [ ] 能够说出每种传播行为的应用场景
- [ ] 能够解释 SavePoint 的工作原理
- [ ] 能够分析传播行为的组合效果
- [ ] 能够解决实际的事务传播问题

**学习建议**：
- **预计学习时长**：3 小时
- **重点难点**：传播行为组合、SavePoint 机制
- **前置知识**：事务管理架构、@Transactional
- **实践建议**：
  - 实验不同传播行为的组合
  - 调试 handleExistingTransaction() 方法
  - 分析 SavePoint 创建和回滚

---

## 10. 参考资料

**Spring 官方文档**：
- [Transaction Propagation](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#tx-propagation)

**源码位置**：
- `org.springframework.transaction.support.AbstractPlatformTransactionManager`
- `org.springframework.jdbc.datasource.DataSourceTransactionManager`
- `org.springframework.transaction.support.DefaultTransactionStatus`

---

**上一章** ← [第 14 章：@Transactional 实现原理](./content-14.md)  
**下一章** → [第 16 章：事务隔离级别与并发问题](./content-16.md)  
**返回目录** → [学习大纲](../content-outline.md)

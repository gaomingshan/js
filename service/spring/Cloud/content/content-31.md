# 第 31 章：Seata TCC/SAGA 与场景选型

> **学习目标**：理解4种事务模式、掌握分布式事务最佳实践、能够根据场景选型  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. AT/TCC/SAGA/XA 模式对比

### 1.1 四种模式概述

| 模式 | 一致性 | 性能 | 侵入性 | 适用场景 |
|------|--------|------|--------|----------|
| **AT** | 最终一致性 | 高 | 低 | 通用场景，关系型数据库 |
| **TCC** | 最终一致性 | 中 | 高 | 核心业务，需要精确控制 |
| **SAGA** | 最终一致性 | 高 | 中 | 长流程，复杂业务 |
| **XA** | 强一致性 | 低 | 低 | 强一致性要求 |

### 1.2 AT 模式

**特点**：
- 自动生成反向 SQL
- 无业务侵入
- 仅支持关系型数据库

**工作流程**：
```
一阶段：
- 执行本地事务
- 生成前后镜像
- 提交本地事务

二阶段：
- 提交：异步删除 undo_log
- 回滚：根据前镜像回滚
```

### 1.3 TCC 模式

**特点**：
- Try-Confirm-Cancel
- 业务侵入性强
- 完全由业务控制

**工作流程**：
```
Try（预留资源）：
- 检查资源
- 预留资源
- 返回成功/失败

Confirm（确认）：
- 使用预留的资源
- 完成业务

Cancel（取消）：
- 释放预留的资源
- 回滚操作
```

### 1.4 SAGA 模式

**特点**：
- 长事务场景
- 正向服务 + 补偿服务
- 最终一致性

**工作流程**：
```
正向流程：
S1 → S2 → S3 → ... → Sn

补偿流程（任意节点失败）：
... → C3 → C2 → C1
```

### 1.5 XA 模式

**特点**：
- 强一致性
- 基于 XA 协议
- 性能较差

**工作流程**：
```
一阶段（prepare）：
- 执行 SQL
- 不提交事务

二阶段：
- commit：提交所有事务
- rollback：回滚所有事务
```

---

## 2. TCC 模式实践

### 2.1 TCC 基本概念

**三个阶段**：

1. **Try**：尝试执行业务，预留业务资源
2. **Confirm**：确认执行业务，真正使用资源
3. **Cancel**：取消执行业务，释放预留资源

### 2.2 添加依赖

```xml
<dependency>
    <groupId>io.seata</groupId>
    <artifactId>seata-spring-boot-starter</artifactId>
</dependency>
```

### 2.3 TCC 接口定义

```java
/**
 * 账户 TCC 接口
 */
@LocalTCC
public interface AccountTccService {
    
    /**
     * Try：预留余额
     */
    @TwoPhaseBusinessAction(
        name = "accountTcc",
        commitMethod = "confirm",
        rollbackMethod = "cancel"
    )
    boolean try(
        @BusinessActionContextParameter(paramName = "userId") Long userId,
        @BusinessActionContextParameter(paramName = "amount") BigDecimal amount
    );
    
    /**
     * Confirm：确认扣减
     */
    boolean confirm(BusinessActionContext context);
    
    /**
     * Cancel：取消，释放预留
     */
    boolean cancel(BusinessActionContext context);
}
```

### 2.4 TCC 实现

**数据库设计**：

```sql
CREATE TABLE `account` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `balance` DECIMAL(10,2) NOT NULL COMMENT '可用余额',
    `frozen` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '冻结金额',
    UNIQUE KEY `uk_user_id` (`user_id`)
);
```

**TCC 实现**：

```java
@Service
@Slf4j
public class AccountTccServiceImpl implements AccountTccService {
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private TccTransactionRepository tccTransactionRepository;
    
    /**
     * Try：冻结金额
     */
    @Override
    @Transactional
    public boolean try(Long userId, BigDecimal amount) {
        String xid = RootContext.getXID();
        log.info("TCC Try：userId={}, amount={}, xid={}", userId, amount, xid);
        
        // 1. 检查幂等性
        if (tccTransactionRepository.existsByXid(xid)) {
            log.warn("TCC Try 重复调用：xid={}", xid);
            return true;
        }
        
        // 2. 查询账户
        Account account = accountRepository.findByUserId(userId)
            .orElseThrow(() -> new BusinessException("账户不存在"));
        
        // 3. 检查余额
        if (account.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("余额不足");
        }
        
        // 4. 冻结金额（余额 → 冻结）
        account.setBalance(account.getBalance().subtract(amount));
        account.setFrozen(account.getFrozen().add(amount));
        accountRepository.save(account);
        
        // 5. 记录 TCC 事务
        TccTransaction tccTransaction = new TccTransaction();
        tccTransaction.setXid(xid);
        tccTransaction.setUserId(userId);
        tccTransaction.setAmount(amount);
        tccTransaction.setStatus(TccStatus.TRY);
        tccTransaction.setCreateTime(LocalDateTime.now());
        tccTransactionRepository.save(tccTransaction);
        
        log.info("TCC Try 成功：冻结金额={}", amount);
        return true;
    }
    
    /**
     * Confirm：扣减冻结金额
     */
    @Override
    @Transactional
    public boolean confirm(BusinessActionContext context) {
        String xid = context.getXid();
        Long userId = context.getActionContext("userId", Long.class);
        BigDecimal amount = context.getActionContext("amount", BigDecimal.class);
        
        log.info("TCC Confirm：userId={}, amount={}, xid={}", userId, amount, xid);
        
        // 1. 检查幂等性
        TccTransaction tccTransaction = tccTransactionRepository.findByXid(xid)
            .orElse(null);
        
        if (tccTransaction == null) {
            log.warn("TCC Confirm：事务不存在，xid={}", xid);
            return true;
        }
        
        if (tccTransaction.getStatus() == TccStatus.CONFIRM) {
            log.warn("TCC Confirm 重复调用：xid={}", xid);
            return true;
        }
        
        // 2. 查询账户
        Account account = accountRepository.findByUserId(userId)
            .orElseThrow(() -> new BusinessException("账户不存在"));
        
        // 3. 扣减冻结金额
        account.setFrozen(account.getFrozen().subtract(amount));
        accountRepository.save(account);
        
        // 4. 更新事务状态
        tccTransaction.setStatus(TccStatus.CONFIRM);
        tccTransaction.setUpdateTime(LocalDateTime.now());
        tccTransactionRepository.save(tccTransaction);
        
        log.info("TCC Confirm 成功：扣减冻结金额={}", amount);
        return true;
    }
    
    /**
     * Cancel：释放冻结金额
     */
    @Override
    @Transactional
    public boolean cancel(BusinessActionContext context) {
        String xid = context.getXid();
        Long userId = context.getActionContext("userId", Long.class);
        BigDecimal amount = context.getActionContext("amount", BigDecimal.class);
        
        log.info("TCC Cancel：userId={}, amount={}, xid={}", userId, amount, xid);
        
        // 1. 检查幂等性
        TccTransaction tccTransaction = tccTransactionRepository.findByXid(xid)
            .orElse(null);
        
        if (tccTransaction == null) {
            log.warn("TCC Cancel：事务不存在，xid={}", xid);
            return true;
        }
        
        if (tccTransaction.getStatus() == TccStatus.CANCEL) {
            log.warn("TCC Cancel 重复调用：xid={}", xid);
            return true;
        }
        
        // 2. 查询账户
        Account account = accountRepository.findByUserId(userId)
            .orElseThrow(() -> new BusinessException("账户不存在"));
        
        // 3. 释放冻结金额（冻结 → 余额）
        account.setBalance(account.getBalance().add(amount));
        account.setFrozen(account.getFrozen().subtract(amount));
        accountRepository.save(account);
        
        // 4. 更新事务状态
        tccTransaction.setStatus(TccStatus.CANCEL);
        tccTransaction.setUpdateTime(LocalDateTime.now());
        tccTransactionRepository.save(tccTransaction);
        
        log.info("TCC Cancel 成功：释放冻结金额={}", amount);
        return true;
    }
}
```

### 2.5 TCC 调用

```java
@Service
@Slf4j
public class OrderService {
    
    @Autowired
    private AccountTccService accountTccService;
    
    @GlobalTransactional(name = "create-order-tcc")
    public Order createOrder(OrderDTO dto) {
        // 1. 创建订单
        Order order = saveOrder(dto);
        
        // 2. TCC Try：冻结余额
        boolean tryResult = accountTccService.try(
            dto.getUserId(), 
            dto.getAmount()
        );
        
        if (!tryResult) {
            throw new BusinessException("余额冻结失败");
        }
        
        // 3. 其他业务逻辑...
        
        // 4. 提交全局事务
        // Seata 自动调用 Confirm
        
        return order;
    }
}
```

---

## 3. SAGA 长事务实践

### 3.1 SAGA 基本概念

**SAGA 模式**：将长事务拆分为多个本地短事务，每个本地事务都有对应的补偿事务。

**状态机配置**（JSON）：

```json
{
  "Name": "orderStateMachine",
  "Comment": "订单SAGA状态机",
  "StartState": "CreateOrder",
  "Version": "1.0.0",
  "States": {
    "CreateOrder": {
      "Type": "ServiceTask",
      "ServiceName": "orderService",
      "ServiceMethod": "createOrder",
      "CompensateState": "CancelOrder",
      "Next": "DeductInventory"
    },
    "DeductInventory": {
      "Type": "ServiceTask",
      "ServiceName": "inventoryService",
      "ServiceMethod": "deduct",
      "CompensateState": "RestoreInventory",
      "Next": "DeductAccount"
    },
    "DeductAccount": {
      "Type": "ServiceTask",
      "ServiceName": "accountService",
      "ServiceMethod": "deduct",
      "CompensateState": "RestoreAccount",
      "Next": "Succeed"
    },
    "Succeed": {
      "Type": "Succeed"
    },
    "CancelOrder": {
      "Type": "ServiceTask",
      "ServiceName": "orderService",
      "ServiceMethod": "cancelOrder"
    },
    "RestoreInventory": {
      "Type": "ServiceTask",
      "ServiceName": "inventoryService",
      "ServiceMethod": "restore"
    },
    "RestoreAccount": {
      "Type": "ServiceTask",
      "ServiceName": "accountService",
      "ServiceMethod": "restore"
    }
  }
}
```

### 3.2 SAGA 服务实现

**订单服务**：

```java
@Service
@Slf4j
public class OrderSagaService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    /**
     * 正向：创建订单
     */
    public Order createOrder(OrderDTO dto) {
        log.info("SAGA：创建订单，dto={}", dto);
        
        Order order = new Order();
        order.setUserId(dto.getUserId());
        order.setProductId(dto.getProductId());
        order.setAmount(dto.getAmount());
        order.setStatus(OrderStatus.INIT);
        order = orderRepository.save(order);
        
        log.info("SAGA：订单创建成功，orderId={}", order.getId());
        return order;
    }
    
    /**
     * 补偿：取消订单
     */
    public void cancelOrder(Long orderId) {
        log.info("SAGA：取消订单，orderId={}", orderId);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new BusinessException("订单不存在"));
        
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        log.info("SAGA：订单取消成功");
    }
}
```

**库存服务**：

```java
@Service
@Slf4j
public class InventorySagaService {
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private InventoryLogRepository inventoryLogRepository;
    
    /**
     * 正向：扣减库存
     */
    public void deduct(Long productId, Integer count) {
        log.info("SAGA：扣减库存，productId={}, count={}", productId, count);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
            .orElseThrow(() -> new BusinessException("商品不存在"));
        
        if (inventory.getStock() < count) {
            throw new BusinessException("库存不足");
        }
        
        // 扣减库存
        inventory.setStock(inventory.getStock() - count);
        inventoryRepository.save(inventory);
        
        // 记录扣减日志
        InventoryLog log = new InventoryLog();
        log.setProductId(productId);
        log.setCount(count);
        log.setType(InventoryLogType.DEDUCT);
        log.setCreateTime(LocalDateTime.now());
        inventoryLogRepository.save(log);
        
        log.info("SAGA：库存扣减成功");
    }
    
    /**
     * 补偿：恢复库存
     */
    public void restore(Long productId, Integer count) {
        log.info("SAGA：恢复库存，productId={}, count={}", productId, count);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
            .orElseThrow(() -> new BusinessException("商品不存在"));
        
        // 恢复库存
        inventory.setStock(inventory.getStock() + count);
        inventoryRepository.save(inventory);
        
        // 记录恢复日志
        InventoryLog log = new InventoryLog();
        log.setProductId(productId);
        log.setCount(count);
        log.setType(InventoryLogType.RESTORE);
        log.setCreateTime(LocalDateTime.now());
        inventoryLogRepository.save(log);
        
        log.info("SAGA：库存恢复成功");
    }
}
```

---

## 4. 全局锁机制

### 4.1 全局锁概念

**全局锁**：Seata 在 AT 模式下提供的锁机制，防止脏写。

**工作流程**：

```
事务1：
1. 开启全局事务
2. 执行 UPDATE order SET status='PAID' WHERE id=1
3. 提交本地事务
4. 获取全局锁（锁住 order 表的 id=1 行）
5. 等待 TC 决定提交或回滚

事务2（在事务1未完成时）：
1. 开启全局事务
2. 执行 UPDATE order SET status='SHIPPED' WHERE id=1
3. 提交本地事务
4. 尝试获取全局锁
5. 获取失败，等待（默认等待30次，每次10ms）
6. 超时后回滚本地事务，抛出异常
```

### 4.2 全局锁配置

```yaml
seata:
  client:
    rm:
      lock:
        retry-interval: 10  # 锁重试间隔（毫秒）
        retry-times: 30     # 锁重试次数
```

### 4.3 全局锁示例

```java
@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @GlobalTransactional
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        // 1. 查询订单
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new BusinessException("订单不存在"));
        
        // 2. 更新状态
        order.setStatus(status);
        orderRepository.save(order);
        
        // 3. 提交本地事务，获取全局锁
        // 如果其他事务已持有全局锁，则等待
    }
}
```

---

## 5. 事务隔离级别

### 5.1 读未提交

**Seata AT 模式默认隔离级别**：读未提交。

**问题**：可能读到未提交的数据。

```java
// 事务1
@GlobalTransactional
public void updateOrder(Long orderId) {
    order.setStatus(OrderStatus.PAID);  // 未提交
}

// 事务2
@Transactional
public Order getOrder(Long orderId) {
    return orderRepository.findById(orderId);  // 可能读到 PAID 状态
    // 但事务1可能回滚
}
```

### 5.2 读已提交

**使用 @GlobalLock + SELECT FOR UPDATE**：

```java
@Service
public class OrderService {
    
    /**
     * 读已提交
     */
    @GlobalLock
    @Transactional
    public Order getOrder(Long orderId) {
        // SELECT FOR UPDATE 会获取全局锁
        return orderRepository.findByIdForUpdate(orderId);
    }
}
```

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Order findByIdForUpdate(@Param("id") Long id);
}
```

---

## 6. 业务一致性边界与取舍

### 6.1 一致性级别

**强一致性**：
- XA 模式
- 性能差
- 适用场景：金融核心交易

**最终一致性**：
- AT/TCC/SAGA 模式
- 性能好
- 适用场景：大部分业务

### 6.2 CAP 权衡

```
CAP 定理：
- C（Consistency）：一致性
- A（Availability）：可用性
- P（Partition tolerance）：分区容错性

分布式系统只能满足其中两个

选择：
- CP：牺牲可用性，保证一致性（XA 模式）
- AP：牺牲一致性，保证可用性（AT/TCC/SAGA 模式）
```

### 6.3 业务场景选型

**场景1：电商下单**

```
需求：
- 扣库存
- 扣余额
- 创建订单

选型：AT 模式
理由：
- 性能要求高
- 可接受短暂不一致
- 库存、余额都是数据库操作
```

**场景2：支付**

```
需求：
- 强一致性
- 不能出现多扣或少扣

选型：TCC 模式
理由：
- 核心业务
- 需要精确控制
- 可接受性能损耗
```

**场景3：长流程审批**

```
需求：
- 多个审批节点
- 流程长
- 可能需要回滚

选型：SAGA 模式
理由：
- 长事务
- 复杂流程
- 需要补偿机制
```

---

## 7. 模式选型决策树

```
开始
  ↓
是否需要强一致性？
  ├─ 是 → XA 模式
  └─ 否 ↓
     是否都是数据库操作？
       ├─ 是 → AT 模式
       └─ 否 ↓
          是否需要精确控制资源？
            ├─ 是 → TCC 模式
            └─ 否 → SAGA 模式
```

---

## 8. 面试要点

**Q1：AT 和 TCC 的区别？**

| 维度 | AT | TCC |
|------|-----|-----|
| 侵入性 | 低 | 高 |
| 一致性 | 最终一致性 | 最终一致性 |
| 性能 | 高 | 中 |
| 实现复杂度 | 低 | 高 |

**Q2：什么是全局锁？**

Seata 在 AT 模式下提供的锁机制，防止并发修改同一数据导致的脏写。

**Q3：如何选择事务模式？**

1. 强一致性 → XA
2. 数据库操作 + 性能要求 → AT
3. 核心业务 + 精确控制 → TCC
4. 长流程 + 复杂业务 → SAGA

**Q4：TCC 的三个阶段分别做什么？**

- Try：预留资源
- Confirm：使用资源
- Cancel：释放资源

**Q5：SAGA 模式的优缺点？**

优点：
- 支持长事务
- 性能好
- 灵活

缺点：
- 需要实现补偿逻辑
- 不保证隔离性

---

## 9. 参考资料

**官方文档**：
- [Seata TCC 模式](https://seata.io/zh-cn/docs/dev/mode/tcc-mode.html)
- [Seata SAGA 模式](https://seata.io/zh-cn/docs/dev/mode/saga-mode.html)

---

**下一章预告**：第 32 章将学习分布式事务最佳实践，包括性能优化、最终一致性方案、事务消息模式、本地消息表、Outbox 模式、一致性监控与兜底策略等内容。

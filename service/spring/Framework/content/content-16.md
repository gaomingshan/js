# 第 16 章：事务隔离级别与并发问题

> **学习目标**：理解事务隔离级别和并发问题的本质及解决方案  
> **预计时长**：2.5 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

### 1.1 事务并发问题

当多个事务并发访问数据库时，可能出现以下问题：

```
并发问题：
1. 脏读 (Dirty Read)
2. 不可重复读 (Non-Repeatable Read)
3. 幻读 (Phantom Read)
```

### 1.2 问题示例

**脏读**：读取到未提交的数据

```
时间线：
T1: BEGIN
T1: UPDATE balance = 100 WHERE id = 1
T2:     BEGIN
T2:     SELECT balance FROM account WHERE id = 1  → 100 (脏读)
T1: ROLLBACK  (回滚)
T2:     使用了 100（错误的数据）
```

**不可重复读**：同一事务内多次读取数据不一致

```
时间线：
T1: BEGIN
T1: SELECT balance FROM account WHERE id = 1  → 100
T2:     BEGIN
T2:     UPDATE balance = 200 WHERE id = 1
T2:     COMMIT
T1: SELECT balance FROM account WHERE id = 1  → 200 (不可重复读)
T1: COMMIT
```

**幻读**：同一事务内查询结果集行数不一致

```
时间线：
T1: BEGIN
T1: SELECT COUNT(*) FROM account WHERE balance > 100  → 5 行
T2:     BEGIN
T2:     INSERT INTO account VALUES (6, 150)
T2:     COMMIT
T1: SELECT COUNT(*) FROM account WHERE balance > 100  → 6 行 (幻读)
T1: COMMIT
```

---

## 2. 事务隔离级别

### 2.1 四种隔离级别

```java
public enum Isolation {
    
    /**
     * 使用数据库默认隔离级别
     */
    DEFAULT(TransactionDefinition.ISOLATION_DEFAULT),
    
    /**
     * 读未提交（最低级别，性能最好）
     * 允许脏读、不可重复读、幻读
     */
    READ_UNCOMMITTED(TransactionDefinition.ISOLATION_READ_UNCOMMITTED),
    
    /**
     * 读已提交（Oracle 默认）
     * 避免脏读，允许不可重复读、幻读
     */
    READ_COMMITTED(TransactionDefinition.ISOLATION_READ_COMMITTED),
    
    /**
     * 可重复读（MySQL 默认）
     * 避免脏读、不可重复读，允许幻读
     */
    REPEATABLE_READ(TransactionDefinition.ISOLATION_REPEATABLE_READ),
    
    /**
     * 串行化（最高级别，性能最差）
     * 避免所有并发问题
     */
    SERIALIZABLE(TransactionDefinition.ISOLATION_SERIALIZABLE);
}
```

### 2.2 隔离级别对比

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
|---------|------|-----------|------|------|
| **READ_UNCOMMITTED** | ✅ 可能 | ✅ 可能 | ✅ 可能 | 最好 |
| **READ_COMMITTED** | ❌ 避免 | ✅ 可能 | ✅ 可能 | 较好 |
| **REPEATABLE_READ** | ❌ 避免 | ❌ 避免 | ✅ 可能 | 较差 |
| **SERIALIZABLE** | ❌ 避免 | ❌ 避免 | ❌ 避免 | 最差 |

---

## 3. 隔离级别实现机制

### 3.1 READ UNCOMMITTED

**实现**：不加锁，直接读取

```sql
-- 事务1
BEGIN;
UPDATE account SET balance = 100 WHERE id = 1;  -- 未提交

-- 事务2（可以读到未提交的数据）
SELECT balance FROM account WHERE id = 1;  -- 100
```

**问题**：脏读

### 3.2 READ COMMITTED

**实现**：**读加共享锁，读完立即释放**

```sql
-- 事务1
BEGIN;
UPDATE account SET balance = 100 WHERE id = 1;  -- 加排他锁

-- 事务2
SELECT balance FROM account WHERE id = 1;  -- 阻塞，等待事务1提交
-- 事务1 COMMIT 后，读到 100

-- 事务2 再次查询
SELECT balance FROM account WHERE id = 1;  -- 可能读到不同的值
```

**解决**：脏读  
**问题**：不可重复读

### 3.3 REPEATABLE READ

**实现**：**读加共享锁，事务结束才释放**

```sql
-- 事务1
BEGIN;
SELECT balance FROM account WHERE id = 1;  -- 加共享锁（持有到事务结束）

-- 事务2
UPDATE account SET balance = 200 WHERE id = 1;  -- 阻塞（等待共享锁释放）

-- 事务1 再次查询
SELECT balance FROM account WHERE id = 1;  -- 读到相同的值
COMMIT;  -- 释放共享锁

-- 事务2 现在可以更新了
```

**解决**：脏读、不可重复读  
**问题**：幻读

**MySQL InnoDB 的增强**：

MySQL InnoDB 通过 **MVCC（多版本并发控制）+ Next-Key Lock** 在 REPEATABLE READ 级别下也避免了幻读。

### 3.4 SERIALIZABLE

**实现**：**串行执行**

```sql
-- 事务1
BEGIN;
SELECT * FROM account;  -- 锁表

-- 事务2
INSERT INTO account VALUES (6, 150);  -- 阻塞（等待事务1结束）
```

**解决**：所有并发问题  
**代价**：性能最差

---

## 4. MVCC（多版本并发控制）

### 4.1 核心思想

**MVCC** 通过保存数据的多个版本，让读写操作不冲突，提高并发性能。

**实现原理**：
```
每行数据包含：
- 数据本身
- DB_TRX_ID：创建/修改该行的事务ID
- DB_ROLL_PTR：回滚指针，指向 undo log 中的旧版本

读操作：
- 读取数据时，根据事务ID和ReadView判断应该读取哪个版本
- 不加锁

写操作：
- 生成新版本
- 加排他锁
```

### 4.2 ReadView

**ReadView** 记录了当前事务开始时的活跃事务列表，用于判断数据版本的可见性。

```java
// 简化的 ReadView 结构
class ReadView {
    long creator_trx_id;        // 创建该 ReadView 的事务ID
    List<Long> trx_ids;         // 活跃事务ID列表
    long low_limit_id;          // 最小活跃事务ID
    long up_limit_id;           // 下一个要分配的事务ID
}
```

**可见性判断**：
```java
boolean isVisible(long db_trx_id, ReadView readView) {
    // 1. 如果是当前事务修改的，可见
    if (db_trx_id == readView.creator_trx_id) {
        return true;
    }
    
    // 2. 如果小于最小活跃事务ID，已提交，可见
    if (db_trx_id < readView.low_limit_id) {
        return true;
    }
    
    // 3. 如果大于等于下一个事务ID，未开始，不可见
    if (db_trx_id >= readView.up_limit_id) {
        return false;
    }
    
    // 4. 在活跃事务列表中，未提交，不可见
    if (readView.trx_ids.contains(db_trx_id)) {
        return false;
    }
    
    // 5. 其他情况，已提交，可见
    return true;
}
```

### 4.3 MVCC + REPEATABLE READ 避免幻读

**示例**：
```sql
-- 事务1（ID=100）
BEGIN;
SELECT * FROM account WHERE balance > 100;  -- 创建 ReadView

-- 此时 ReadView:
-- creator_trx_id = 100
-- trx_ids = [100]
-- low_limit_id = 100
-- up_limit_id = 101

-- 事务2（ID=101）
BEGIN;
INSERT INTO account VALUES (6, 150);  -- DB_TRX_ID = 101
COMMIT;

-- 事务1 再次查询
SELECT * FROM account WHERE balance > 100;
-- 判断新插入行的可见性：
-- db_trx_id (101) >= up_limit_id (101)  → 不可见
-- 结果：看不到新插入的行，避免幻读

COMMIT;
```

---

## 5. Spring 配置隔离级别

### 5.1 @Transactional

```java
@Service
public class UserService {
    
    // 1. 读未提交
    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public void method1() {
        // 性能最好，但可能脏读
    }
    
    // 2. 读已提交（Oracle 默认）
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void method2() {
        // 避免脏读
    }
    
    // 3. 可重复读（MySQL 默认）
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void method3() {
        // 避免脏读、不可重复读
    }
    
    // 4. 串行化
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void method4() {
        // 性能最差，但完全隔离
    }
}
```

### 5.2 源码实现

```java
// DataSourceTransactionManager.doBegin()
@Override
protected void doBegin(Object transaction, TransactionDefinition definition) {
    DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
    Connection con = null;
    
    try {
        // ...
        
        con = txObject.getConnectionHolder().getConnection();
        
        // 设置隔离级别
        Integer previousIsolationLevel = DataSourceUtils.prepareConnectionForTransaction(con, definition);
        txObject.setPreviousIsolationLevel(previousIsolationLevel);
        
        // ...
    } catch (Throwable ex) {
        // ...
    }
}

// DataSourceUtils.prepareConnectionForTransaction()
@Nullable
public static Integer prepareConnectionForTransaction(Connection con, @Nullable TransactionDefinition definition) {
    Integer previousIsolationLevel = null;
    
    if (definition != null && definition.getIsolationLevel() != TransactionDefinition.ISOLATION_DEFAULT) {
        int currentIsolation = con.getTransactionIsolation();
        if (currentIsolation != definition.getIsolationLevel()) {
            previousIsolationLevel = currentIsolation;
            // 设置隔离级别
            con.setTransactionIsolation(definition.getIsolationLevel());
        }
    }
    
    return previousIsolationLevel;
}
```

---

## 6. 实际落地场景（工作实战）

### 场景 1：账户转账（避免脏读）

```java
@Service
public class AccountService {
    
    // 使用 READ_COMMITTED 避免脏读
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        // 扣款
        Account from = accountDao.findById(fromId);
        from.setBalance(from.getBalance().subtract(amount));
        accountDao.update(from);
        
        // 加款
        Account to = accountDao.findById(toId);
        to.setBalance(to.getBalance().add(amount));
        accountDao.update(to);
    }
}
```

### 场景 2：库存扣减（避免超卖）

```java
@Service
public class InventoryService {
    
    // 使用 SERIALIZABLE 避免超卖
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void deduct(Long productId, int quantity) {
        Inventory inventory = inventoryDao.findByProductId(productId);
        
        if (inventory.getStock() < quantity) {
            throw new InsufficientStockException();
        }
        
        inventory.setStock(inventory.getStock() - quantity);
        inventoryDao.update(inventory);
    }
}
```

**更好的方案：乐观锁**

```java
@Service
public class InventoryService {
    
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deduct(Long productId, int quantity) {
        // 使用版本号实现乐观锁
        int updated = inventoryDao.deductWithVersion(productId, quantity);
        
        if (updated == 0) {
            throw new ConcurrentModificationException("库存已被修改，请重试");
        }
    }
}

// DAO
public interface InventoryDao {
    @Update("UPDATE inventory SET stock = stock - #{quantity}, version = version + 1 " +
            "WHERE product_id = #{productId} AND stock >= #{quantity} AND version = #{version}")
    int deductWithVersion(@Param("productId") Long productId, 
                          @Param("quantity") int quantity,
                          @Param("version") int version);
}
```

### 场景 3：报表统计（一致性读）

```java
@Service
public class ReportService {
    
    // 使用 REPEATABLE_READ 保证统计数据一致
    @Transactional(isolation = Isolation.REPEATABLE_READ, readOnly = true)
    public Report generateReport(Date startDate, Date endDate) {
        // 多次查询，保证读到一致的数据
        long orderCount = orderDao.countByDate(startDate, endDate);
        BigDecimal totalAmount = orderDao.sumAmountByDate(startDate, endDate);
        List<ProductSales> topProducts = orderDao.findTopProducts(startDate, endDate);
        
        return new Report(orderCount, totalAmount, topProducts);
    }
}
```

### 场景 4：防止重复提交

```java
@Service
public class OrderService {
    
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void createOrder(String orderNo, Order order) {
        // 检查订单是否存在
        if (orderDao.existsByOrderNo(orderNo)) {
            throw new DuplicateOrderException("订单已存在");
        }
        
        // 创建订单
        orderDao.save(order);
    }
}
```

**更好的方案：唯一索引**

```sql
-- 数据库层面保证唯一性
CREATE UNIQUE INDEX idx_order_no ON `order` (order_no);
```

---

## 7. 隔离级别选择建议

### 7.1 选择原则

```
性能要求高 ← → 一致性要求高
    ↓              ↓
READ_UNCOMMITTED → READ_COMMITTED → REPEATABLE_READ → SERIALIZABLE
```

### 7.2 常见场景

| 场景 | 推荐隔离级别 | 原因 |
|------|-------------|------|
| **普通查询** | READ_COMMITTED | 避免脏读，性能较好 |
| **报表统计** | REPEATABLE_READ | 保证数据一致性 |
| **账户转账** | READ_COMMITTED + 悲观锁 | 平衡性能和一致性 |
| **库存扣减** | READ_COMMITTED + 乐观锁 | 避免超卖 |
| **防重复提交** | 唯一索引 | 数据库保证 |
| **批量导入** | READ_UNCOMMITTED | 性能优先 |

### 7.3 数据库默认隔离级别

| 数据库 | 默认隔离级别 |
|--------|-------------|
| **MySQL** | REPEATABLE_READ |
| **Oracle** | READ_COMMITTED |
| **SQL Server** | READ_COMMITTED |
| **PostgreSQL** | READ_COMMITTED |

---

## 8. 面试准备专项

### 高频面试题：事务隔离级别有哪些？分别解决什么问题？

**第一层（基础回答 - 60分）**：
四种隔离级别：READ_UNCOMMITTED、READ_COMMITTED、REPEATABLE_READ、SERIALIZABLE。分别解决脏读、不可重复读、幻读问题。

**第二层（深入原理 - 80分）**：
详细说明：

1. **READ_UNCOMMITTED**：
   - 最低级别，不加锁
   - 可能：脏读、不可重复读、幻读
   - 性能最好

2. **READ_COMMITTED**：
   - Oracle 默认
   - 读加共享锁，读完释放
   - 避免脏读，可能不可重复读、幻读

3. **REPEATABLE_READ**：
   - MySQL 默认
   - 读加共享锁，事务结束释放
   - 避免脏读、不可重复读，可能幻读
   - MySQL InnoDB 通过 MVCC 也避免了幻读

4. **SERIALIZABLE**：
   - 最高级别，串行执行
   - 避免所有并发问题
   - 性能最差

**第三层（扩展延伸 - 95分）**：
从实现机制角度说明：

**MVCC 实现**：
- 每行数据包含 DB_TRX_ID（事务ID）和 DB_ROLL_PTR（回滚指针）
- 读操作创建 ReadView，判断数据版本可见性
- 写操作生成新版本，加排他锁
- 读写不冲突，提高并发性能

**MySQL InnoDB 避免幻读**：
- MVCC：读取数据的快照版本
- Next-Key Lock：锁定范围，防止插入

**追问应对**：

**追问 1：不可重复读和幻读的区别？**
- 不可重复读：同一行数据，前后读取值不同（UPDATE）
- 幻读：同一查询，前后读取行数不同（INSERT/DELETE）

**追问 2：如何解决超卖问题？**
- SERIALIZABLE：性能差
- 悲观锁：SELECT ... FOR UPDATE
- 乐观锁：版本号机制（推荐）
- 数据库约束：库存字段 >= 0

**加分项**：
- 能说出 MVCC 的实现原理
- 能举出实际应用场景
- 能说出不同隔离级别的性能影响

---

## 9. 学习自检清单

- [ ] 能够说出四种隔离级别及其区别
- [ ] 能够解释脏读、不可重复读、幻读
- [ ] 能够说出 MVCC 的实现原理
- [ ] 能够配置 Spring 事务隔离级别
- [ ] 能够根据场景选择合适的隔离级别
- [ ] 能够解决实际的并发问题

**学习建议**：
- **预计学习时长**：2.5 小时
- **重点难点**：MVCC 机制、隔离级别选择
- **前置知识**：事务管理、数据库锁
- **实践建议**：
  - 实验不同隔离级别的并发行为
  - 分析 MVCC 的可见性判断
  - 解决实际的超卖问题

---

## 10. 参考资料

**MySQL 官方文档**：
- [InnoDB Transaction Model](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-model.html)
- [InnoDB Locking](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html)

**Spring 官方文档**：
- [Transaction Isolation](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#tx-decl-explained)

**源码位置**：
- `org.springframework.jdbc.datasource.DataSourceUtils`
- `org.springframework.jdbc.datasource.DataSourceTransactionManager`

---

**上一章** ← [第 15 章：事务传播行为详解](./content-15.md)  
**下一章** → [第 17 章：DispatcherServlet 核心流程](./content-17.md)  
**返回目录** → [学习大纲](../content-outline.md)

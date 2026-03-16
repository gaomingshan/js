# 事务隔离级别

## 概述

事务隔离级别定义了一个事务可能受其他并发事务影响的程度。SQL 标准定义了四个隔离级别，不同级别在并发性能和数据一致性之间权衡。理解隔离级别是处理并发事务的关键。

**四个隔离级别**：
- **读未提交（Read Uncommitted）**：最低级别，允许脏读
- **读已提交（Read Committed）**：避免脏读
- **可重复读（Repeatable Read）**：避免脏读和不可重复读
- **串行化（Serializable）**：最高级别，完全隔离

**三种并发问题**：
- **脏读（Dirty Read）**：读到未提交的数据
- **不可重复读（Non-Repeatable Read）**：同一查询多次执行结果不同
- **幻读（Phantom Read）**：范围查询结果集发生变化

---

## 并发问题详解

### 1. 脏读（Dirty Read）

**定义**：一个事务读到另一个事务未提交的数据。

**示例**：
```sql
-- 时间线：
-- T1                           T2
-- BEGIN;
--                              BEGIN;
-- UPDATE accounts 
-- SET balance = 900
-- WHERE id = 1;
--                              SELECT balance FROM accounts WHERE id = 1;
--                              -- 读到 900（未提交的数据）
-- ROLLBACK;
--                              -- T2 读到的数据是脏数据（已回滚）
```

**问题**：
- T2 读到的数据不存在（T1 回滚了）
- 基于脏数据的后续操作可能错误

### 2. 不可重复读（Non-Repeatable Read）

**定义**：同一事务内，多次读取同一数据，结果不同。

**示例**：
```sql
-- 时间线：
-- T1                           T2
-- BEGIN;
-- SELECT balance FROM accounts WHERE id = 1;
-- -- 读到 1000
--                              BEGIN;
--                              UPDATE accounts SET balance = 900 WHERE id = 1;
--                              COMMIT;
-- SELECT balance FROM accounts WHERE id = 1;
-- -- 读到 900（与第一次不同）
-- COMMIT;
```

**问题**：
- 同一事务内两次读取结果不一致
- 影响基于多次读取的业务逻辑

### 3. 幻读（Phantom Read）

**定义**：同一事务内，多次范围查询，结果集行数不同。

**示例**：
```sql
-- 时间线：
-- T1                           T2
-- BEGIN;
-- SELECT * FROM accounts WHERE balance > 500;
-- -- 返回 3 行
--                              BEGIN;
--                              INSERT INTO accounts VALUES (4, 600);
--                              COMMIT;
-- SELECT * FROM accounts WHERE balance > 500;
-- -- 返回 4 行（多了一行"幻影"）
-- COMMIT;
```

**问题**：
- 范围查询结果不稳定
- 影响统计和聚合查询

**不可重复读 vs 幻读**：
```
不可重复读：
- 针对已存在的行
- 同一行的值变化（UPDATE）
- 行级锁可以解决

幻读：
- 针对结果集
- 行数变化（INSERT/DELETE）
- 需要范围锁或间隙锁
```

---

## 四个隔离级别

### 1. 读未提交（Read Uncommitted）

**特性**：
```
- 最低隔离级别
- 允许读取未提交的数据
- 不加读锁
- 并发性能最好
- 数据一致性最差
```

**设置隔离级别**：
```sql
-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

-- Oracle（不支持 Read Uncommitted）

-- PostgreSQL
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
-- 实际按 Read Committed 处理
```

**示例**：
```sql
-- 会话1
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
BEGIN;
SELECT balance FROM accounts WHERE id = 1;
-- 可能读到其他事务未提交的数据
COMMIT;
```

**并发问题**：
```
✗ 脏读：允许
✗ 不可重复读：允许
✗ 幻读：允许
```

**使用场景**：
```
极少使用
只在以下情况考虑：
- 对数据一致性要求极低
- 追求极致并发性能
- 数据仅用于统计参考
```

### 2. 读已提交（Read Committed）

**特性**：
```
- 只能读取已提交的数据
- 每次读取都获取新快照
- 避免脏读
- 允许不可重复读
```

**设置隔离级别**：
```sql
-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Oracle（默认）
-- 无需设置

-- PostgreSQL（默认）
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

**示例**：
```sql
-- 会话1
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;

-- 第一次读取
SELECT balance FROM accounts WHERE id = 1;
-- 返回 1000

-- 等待会话2提交...

-- 第二次读取
SELECT balance FROM accounts WHERE id = 1;
-- 返回 900（已提交的新值）

COMMIT;
```

**并发问题**：
```
✓ 脏读：避免
✗ 不可重复读：允许
✗ 幻读：允许
```

**使用场景**：
```
常用场景：
- OLTP 系统
- 高并发读写
- 对一致性要求适中
- Oracle、PostgreSQL 默认级别
```

### 3. 可重复读（Repeatable Read）

**特性**：
```
- 同一事务内多次读取结果一致
- 事务开始时创建快照
- 避免脏读和不可重复读
- MySQL InnoDB 通过 MVCC 避免幻读
```

**设置隔离级别**：
```sql
-- MySQL（默认）
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- Oracle（不支持 Repeatable Read，使用 Serializable）

-- PostgreSQL
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

**示例**：
```sql
-- 会话1
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;

-- 第一次读取
SELECT balance FROM accounts WHERE id = 1;
-- 返回 1000

-- 会话2 修改并提交了数据

-- 第二次读取
SELECT balance FROM accounts WHERE id = 1;
-- 仍然返回 1000（快照隔离）

COMMIT;
```

**InnoDB 幻读处理**：
```sql
-- InnoDB 在 Repeatable Read 下避免幻读

-- 会话1
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;

-- 第一次范围查询
SELECT * FROM accounts WHERE balance > 500;
-- 返回 3 行

-- 会话2 插入新行并提交

-- 第二次范围查询
SELECT * FROM accounts WHERE balance > 500;
-- 仍然返回 3 行（通过 MVCC 和 Next-Key Lock）

COMMIT;
```

**并发问题**：
```
✓ 脏读：避免
✓ 不可重复读：避免
✓/✗ 幻读：InnoDB 避免，标准 SQL 允许
```

**使用场景**：
```
常用场景：
- 需要事务内一致性读取
- 报表统计
- 批量处理
- MySQL InnoDB 默认级别
```

### 4. 串行化（Serializable）

**特性**：
```
- 最高隔离级别
- 事务串行执行
- 完全避免并发问题
- 性能最差
- 通过锁或快照隔离实现
```

**设置隔离级别**：
```sql
-- MySQL
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Oracle
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- PostgreSQL
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**示例**：
```sql
-- 会话1
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;

SELECT * FROM accounts WHERE balance > 500;
-- 锁定范围，其他事务无法插入/修改满足条件的行

-- 会话2 尝试插入
INSERT INTO accounts VALUES (4, 600);
-- 阻塞，等待会话1提交

COMMIT;
-- 会话2 的插入才能继续
```

**并发问题**：
```
✓ 脏读：避免
✓ 不可重复读：避免
✓ 幻读：避免
```

**使用场景**：
```
罕见场景：
- 严格的数据一致性要求
- 金融交易关键操作
- 并发度低的系统
- 通常不建议使用
```

---

## 隔离级别对比

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 | 并发 |
|---------|------|-----------|------|------|------|
| Read Uncommitted | 允许 | 允许 | 允许 | 最高 | 最高 |
| Read Committed | 避免 | 允许 | 允许 | 高 | 高 |
| Repeatable Read | 避免 | 避免 | 允许* | 中 | 中 |
| Serializable | 避免 | 避免 | 避免 | 最低 | 最低 |

\* InnoDB 在 Repeatable Read 下通过 Next-Key Lock 避免幻读

---

## 不同数据库的实现

### 1. MySQL InnoDB

**默认隔离级别**：
```sql
-- Repeatable Read
SHOW VARIABLES LIKE 'transaction_isolation';
```

**MVCC（多版本并发控制）**：
```
InnoDB 使用 MVCC 实现非锁定读：
- 每行记录多个版本
- 事务看到特定版本的快照
- 读不加锁，写不阻塞读

优点：
- 读写不冲突
- 高并发性能
```

**Next-Key Lock**：
```
InnoDB 在 Repeatable Read 下使用 Next-Key Lock：
- Record Lock：锁定索引记录
- Gap Lock：锁定索引间隙
- Next-Key Lock = Record Lock + Gap Lock

作用：
- 避免幻读
- 锁定范围内的已有行和间隙
```

**示例**：
```sql
-- Repeatable Read + Next-Key Lock
BEGIN;

SELECT * FROM accounts WHERE id BETWEEN 10 AND 20 FOR UPDATE;
-- 锁定：
-- - id = 10, 15, 20 的记录（Record Lock）
-- - (10, 15), (15, 20) 的间隙（Gap Lock）
-- - 其他事务无法插入 id = 11-19 的记录

COMMIT;
```

### 2. Oracle

**默认隔离级别**：
```sql
-- Read Committed
SELECT name, value FROM v$parameter WHERE name = 'isolation_level';
```

**Serializable 实现**：
```sql
-- Oracle 的 Serializable 使用快照隔离
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

BEGIN
    -- 读取事务开始时的快照
    SELECT * FROM accounts;
    
    -- 写入时检查冲突
    UPDATE accounts SET balance = 900 WHERE id = 1;
    -- 如果其他事务已修改此行，报错
    
COMMIT;
```

**读一致性**：
```
Oracle 通过 Undo 段实现读一致性：
- 所有查询看到一致性快照
- 即使在 Read Committed 下
- 单个查询内部一致
```

### 3. PostgreSQL

**默认隔离级别**：
```sql
-- Read Committed
SHOW default_transaction_isolation;
```

**Serializable Snapshot Isolation (SSI)**：
```sql
-- PostgreSQL 9.1+ 真正的 Serializable
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

BEGIN;
    SELECT SUM(balance) FROM accounts;
    -- 记录读取依赖
    
    INSERT INTO accounts VALUES (4, 1000);
    -- 检测写入冲突
    
COMMIT;
-- 如果检测到冲突，事务失败
```

**并发控制**：
```
PostgreSQL 使用 MVCC：
- Tuple 版本链
- 事务 ID 判断可见性
- 无需读锁
```

---

## 选择隔离级别

### 1. 业务需求分析

**OLTP 系统**：
```
特点：
- 高并发短事务
- 读写混合
- 要求低延迟

推荐：
- Read Committed（Oracle、PostgreSQL 默认）
- Repeatable Read（MySQL 默认）
```

**OLAP 系统**：
```
特点：
- 复杂查询
- 大范围扫描
- 要求一致性快照

推荐：
- Repeatable Read
- Serializable（如果并发度低）
```

**金融系统**：
```
特点：
- 严格一致性
- 不能容忍数据错误

推荐：
- Serializable
- 或 Repeatable Read + 乐观锁
```

### 2. 性能考虑

**隔离级别与性能**：
```
Read Uncommitted：
- 性能最好
- 几乎不用

Read Committed：
- 性能好
- 常用

Repeatable Read：
- 性能中等
- MySQL 默认

Serializable：
- 性能最差
- 谨慎使用
```

**锁竞争**：
```sql
-- Serializable 可能导致大量锁等待
-- 会话1
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
SELECT * FROM accounts;
-- 锁定全表

-- 会话2
BEGIN;
INSERT INTO accounts VALUES (4, 1000);
-- 阻塞，等待会话1

-- 改用 Repeatable Read
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- 减少锁竞争
```

---

## 隔离级别异常处理

### 1. 更新丢失

**问题**：
```sql
-- 两个事务同时读取并更新

-- T1                           T2
-- BEGIN;
-- SELECT balance FROM accounts WHERE id = 1;
-- -- balance = 1000
--                              BEGIN;
--                              SELECT balance FROM accounts WHERE id = 1;
--                              -- balance = 1000
-- UPDATE accounts SET balance = 1000 - 100 WHERE id = 1;
-- COMMIT;
--                              UPDATE accounts SET balance = 1000 - 50 WHERE id = 1;
--                              COMMIT;

-- 结果：balance = 950
-- 期望：balance = 850
-- 问题：T1 的更新丢失
```

**解决方案**：
```sql
-- 使用 FOR UPDATE 锁定行
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
-- 加锁，其他事务等待
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;
```

### 2. 写偏斜

**问题**：
```sql
-- 业务规则：至少保留一个管理员

-- T1                           T2
-- BEGIN;
-- SELECT COUNT(*) FROM users WHERE role = 'admin';
-- -- count = 2
--                              BEGIN;
--                              SELECT COUNT(*) FROM users WHERE role = 'admin';
--                              -- count = 2
-- UPDATE users SET role = 'user' WHERE id = 1;
-- COMMIT;
--                              UPDATE users SET role = 'user' WHERE id = 2;
--                              COMMIT;

-- 结果：0 个管理员
-- 问题：两个事务都认为还有另一个管理员
```

**解决方案**：
```sql
-- 方案1：Serializable
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 方案2：显式锁定
BEGIN;
SELECT COUNT(*) FROM users WHERE role = 'admin' FOR UPDATE;
-- ...
COMMIT;

-- 方案3：应用层检查
BEGIN;
UPDATE users SET role = 'user' WHERE id = 1;
-- 重新检查
IF (SELECT COUNT(*) FROM users WHERE role = 'admin') = 0 THEN
    ROLLBACK;
END IF;
COMMIT;
```

---

## 隔离级别最佳实践

### 1. 设置原则

```
1. 使用数据库默认级别
   - MySQL: Repeatable Read
   - Oracle/PostgreSQL: Read Committed
   
2. 根据业务需求调整
   - 需要快照一致性：Repeatable Read
   - 需要最新数据：Read Committed
   
3. 避免频繁切换
   - 统一使用一个级别
   - 特殊场景临时调整
   
4. 谨慎使用 Serializable
   - 性能影响大
   - 优先考虑其他方案
```

### 2. 代码示例

```python
import mysql.connector

# 使用默认隔离级别
def query_default():
    conn = mysql.connector.connect(...)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    # 使用 Repeatable Read（MySQL 默认）
    cursor.close()
    conn.close()

# 临时调整隔离级别
def query_read_committed():
    conn = mysql.connector.connect(...)
    
    # 设置为 Read Committed
    conn.start_transaction(isolation_level='READ COMMITTED')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    conn.commit()
    
    cursor.close()
    conn.close()

# 关键操作使用 Serializable
def transfer_money(from_id, to_id, amount):
    conn = mysql.connector.connect(...)
    
    try:
        # 使用 Serializable 确保一致性
        conn.start_transaction(isolation_level='SERIALIZABLE')
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE accounts SET balance = balance - %s WHERE id = %s",
            (amount, from_id)
        )
        cursor.execute(
            "UPDATE accounts SET balance = balance + %s WHERE id = %s",
            (amount, to_id)
        )
        
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()
```

---

## 参考资料

1. **SQL 标准**：
   - ANSI SQL-92: Transaction Isolation Levels

2. **MySQL 官方文档**：
   - Transaction Isolation Levels: https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html

3. **Oracle 官方文档**：
   - Data Concurrency and Consistency: https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html

4. **PostgreSQL 官方文档**：
   - Transaction Isolation: https://www.postgresql.org/docs/current/transaction-iso.html

5. **推荐论文**：
   - "A Critique of ANSI SQL Isolation Levels" (Berenson et al., 1995)

6. **最佳实践**：
   - 使用数据库默认隔离级别
   - 理解业务一致性需求
   - 避免过高隔离级别
   - 使用锁解决特定并发问题
   - 监控死锁和锁等待
   - 测试并发场景

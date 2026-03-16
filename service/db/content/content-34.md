# 锁机制与死锁

## 概述

锁（Lock）是数据库实现并发控制的重要机制，用于协调多个事务对同一资源的并发访问。理解锁机制和死锁处理，对于开发高并发应用至关重要。

**核心概念**：
- **锁类型**：共享锁、排他锁、意向锁
- **锁粒度**：表锁、页锁、行锁
- **锁模式**：悲观锁、乐观锁
- **死锁**：多个事务互相等待对方释放锁
- **死锁检测与预防**

---

## 锁的类型

### 1. 共享锁（Shared Lock, S Lock）

**定义**：
```
也称读锁（Read Lock）
允许多个事务同时持有
阻止其他事务获取排他锁
允许读取，不允许修改
```

**MySQL**：
```sql
-- 加共享锁
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 或 MySQL 8.0+
SELECT * FROM users WHERE id = 1 FOR SHARE;

-- 多个事务可以同时持有共享锁
-- 事务1
BEGIN;
SELECT * FROM users WHERE id = 1 FOR SHARE;
-- 加共享锁

-- 事务2
BEGIN;
SELECT * FROM users WHERE id = 1 FOR SHARE;
-- 也能加共享锁（不阻塞）

-- 但排他锁会被阻塞
-- 事务3
BEGIN;
UPDATE users SET name = 'Alice' WHERE id = 1;
-- 阻塞，等待共享锁释放
```

**PostgreSQL**：
```sql
-- 加共享锁
BEGIN;
SELECT * FROM users WHERE id = 1 FOR SHARE;
COMMIT;
```

**Oracle**：
```sql
-- Oracle 读取默认不加锁（MVCC）
-- 手动加共享锁
SELECT * FROM users WHERE id = 1 FOR UPDATE;
LOCK TABLE users IN SHARE MODE;
```

### 2. 排他锁（Exclusive Lock, X Lock）

**定义**：
```
也称写锁（Write Lock）
只允许一个事务持有
阻止其他事务获取任何锁
允许读取和修改
```

**MySQL**：
```sql
-- 加排他锁
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- 或 DML 语句自动加排他锁
UPDATE users SET name = 'Alice' WHERE id = 1;
DELETE FROM users WHERE id = 1;
INSERT INTO users VALUES (1, 'Alice');

-- 排他锁互斥
-- 事务1
BEGIN;
SELECT * FROM users WHERE id = 1 FOR UPDATE;
-- 加排他锁

-- 事务2
BEGIN;
SELECT * FROM users WHERE id = 1 FOR UPDATE;
-- 阻塞，等待事务1释放锁

-- 事务3
BEGIN;
SELECT * FROM users WHERE id = 1 FOR SHARE;
-- 也阻塞，等待排他锁释放
```

### 3. 意向锁（Intention Lock）

**定义**：
```
表级锁，表明事务打算在表的某些行上加锁
分为：
- 意向共享锁（IS Lock）：打算加共享锁
- 意向排他锁（IX Lock）：打算加排他锁

作用：
- 快速判断表级锁是否冲突
- 避免逐行检查行锁
```

**MySQL InnoDB**：
```sql
-- 加行锁时，自动加意向锁

-- 事务1：加行级共享锁
BEGIN;
SELECT * FROM users WHERE id = 1 FOR SHARE;
-- 自动在表上加 IS 锁
-- 在行上加 S 锁

-- 事务2：尝试加表级排他锁
BEGIN;
LOCK TABLES users WRITE;
-- 检查表上的 IS 锁，发现冲突，阻塞
```

**锁兼容性矩阵**：
```
当前锁 \ 请求锁 | IS | IX | S  | X  |
----------------|----|----|----|----|
IS              | ✓  | ✓  | ✓  | ✗  |
IX              | ✓  | ✓  | ✗  | ✗  |
S               | ✓  | ✗  | ✓  | ✗  |
X               | ✗  | ✗  | ✗  | ✗  |

✓ 兼容（可以共存）
✗ 不兼容（会阻塞）
```

---

## 锁的粒度

### 1. 表锁（Table Lock）

**定义**：
```
锁定整张表
粒度最大
开销最小
并发度最低
```

**MySQL**：
```sql
-- 加表级共享锁
LOCK TABLES users READ;
-- 允许其他会话读取，不允许写入

-- 加表级排他锁
LOCK TABLES users WRITE;
-- 其他会话无法读取和写入

-- 释放表锁
UNLOCK TABLES;
```

**使用场景**：
```
适用：
- 全表扫描
- 批量数据导入/导出
- DDL 操作

不适用：
- OLTP 高并发场景
- 需要细粒度并发控制
```

### 2. 行锁（Row Lock）

**定义**：
```
锁定单行记录
粒度最小
开销最大
并发度最高
```

**MySQL InnoDB**：
```sql
-- 行锁
BEGIN;
SELECT * FROM users WHERE id = 1 FOR UPDATE;
-- 只锁定 id=1 的行

-- 其他行不受影响
-- 事务2
BEGIN;
SELECT * FROM users WHERE id = 2 FOR UPDATE;
-- 不阻塞

COMMIT;
```

**行锁类型**：
```
Record Lock：
- 锁定单个索引记录

Gap Lock：
- 锁定索引记录之间的间隙
- 防止插入

Next-Key Lock：
- Record Lock + Gap Lock
- 锁定记录和前面的间隙
```

### 3. 页锁（Page Lock）

**定义**：
```
锁定数据页（通常 8KB 或 16KB）
粒度介于表锁和行锁之间
并发度中等
```

**MySQL**：
```
InnoDB 不使用页锁
BDB 存储引擎使用页锁（已废弃）
```

---

## 锁的实现

### 1. MySQL InnoDB 锁

**Record Lock（记录锁）**：
```sql
-- 精确匹配，锁定单行
BEGIN;
SELECT * FROM users WHERE id = 10 FOR UPDATE;
-- 锁定 id=10 的索引记录
COMMIT;
```

**Gap Lock（间隙锁）**：
```sql
-- Repeatable Read 隔离级别下
BEGIN;
SELECT * FROM users WHERE id > 10 AND id < 20 FOR UPDATE;

-- 假设存在 id = 11, 15, 19
-- 锁定：
-- - (10, 11) 间隙
-- - (11, 15) 间隙
-- - (15, 19) 间隙
-- - (19, 20) 间隙

-- 其他事务无法插入 id = 12-18
INSERT INTO users VALUES (12, 'Alice');
-- 阻塞

COMMIT;
```

**Next-Key Lock**：
```sql
-- Next-Key Lock = Record Lock + Gap Lock
BEGIN;
SELECT * FROM users WHERE id >= 10 AND id <= 20 FOR UPDATE;

-- 锁定：
-- - id = 10, 15, 20 的记录（Record Lock）
-- - (10, 15), (15, 20) 的间隙（Gap Lock）

COMMIT;
```

**Insert Intention Lock（插入意向锁）**：
```sql
-- 插入时加插入意向锁
BEGIN;
INSERT INTO users VALUES (12, 'Alice');
-- 加插入意向锁在 (10, 15) 间隙

-- 与 Gap Lock 冲突，但与其他插入意向锁不冲突
-- 允许多个事务在同一间隙插入不同位置
COMMIT;
```

**Auto-Inc Lock（自增锁）**：
```sql
-- 自增列的表级锁
INSERT INTO users (name) VALUES ('Alice');
-- 临时加 Auto-Inc Lock
-- 分配自增 ID
-- 释放锁

-- 配置
SHOW VARIABLES LIKE 'innodb_autoinc_lock_mode';
-- 0: 传统模式（表锁）
-- 1: 连续模式（轻量级锁）
-- 2: 交叉模式（无锁，并发最好，但主从复制可能不一致）
```

### 2. PostgreSQL 锁

**行级锁**：
```sql
-- FOR UPDATE：排他锁
BEGIN;
SELECT * FROM users WHERE id = 1 FOR UPDATE;
COMMIT;

-- FOR SHARE：共享锁
BEGIN;
SELECT * FROM users WHERE id = 1 FOR SHARE;
COMMIT;

-- FOR NO KEY UPDATE：允许其他事务加 FOR KEY SHARE
-- FOR KEY SHARE：允许其他事务 UPDATE（不包括键列）
```

**表级锁**：
```sql
-- 显式加表锁
BEGIN;
LOCK TABLE users IN ACCESS SHARE MODE;  -- 最弱
LOCK TABLE users IN ROW SHARE MODE;
LOCK TABLE users IN ROW EXCLUSIVE MODE;
LOCK TABLE users IN SHARE UPDATE EXCLUSIVE MODE;
LOCK TABLE users IN SHARE MODE;
LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE users IN EXCLUSIVE MODE;
LOCK TABLE users IN ACCESS EXCLUSIVE MODE;  -- 最强
COMMIT;
```

**咨询锁（Advisory Lock）**：
```sql
-- 应用层自定义锁
-- 获取锁
SELECT pg_advisory_lock(123);

-- 释放锁
SELECT pg_advisory_unlock(123);

-- 尝试获取锁（不阻塞）
SELECT pg_try_advisory_lock(123);
```

---

## 死锁

### 1. 死锁概念

**定义**：
```
两个或多个事务互相等待对方释放锁
形成循环等待
导致事务无法继续执行
```

**示例**：
```sql
-- 事务1                       事务2
-- BEGIN;
-- UPDATE users SET name='A' WHERE id=1;
-- -- 持有 id=1 的锁
--                             BEGIN;
--                             UPDATE users SET name='B' WHERE id=2;
--                             -- 持有 id=2 的锁
-- UPDATE users SET name='C' WHERE id=2;
-- -- 等待 id=2 的锁...
--                             UPDATE users SET name='D' WHERE id=1;
--                             -- 等待 id=1 的锁...

-- 死锁：事务1 等待事务2，事务2 等待事务1
```

### 2. 死锁检测

**MySQL**：
```sql
-- 查看最近一次死锁
SHOW ENGINE INNODB STATUS\G

-- 输出包含：
-- LATEST DETECTED DEADLOCK
-- 死锁涉及的事务
-- 等待的锁
-- 持有的锁
-- 回滚的事务

-- 示例输出：
-- *** (1) TRANSACTION:
-- TRANSACTION 421, ACTIVE 10 sec starting index read
-- UPDATE users SET name='A' WHERE id=2
-- *** (1) WAITING FOR THIS LOCK TO BE GRANTED:
-- RECORD LOCKS on users, index PRIMARY (id=2)

-- *** (2) TRANSACTION:
-- TRANSACTION 422, ACTIVE 5 sec updating
-- UPDATE users SET name='B' WHERE id=1
-- *** (2) HOLDS THE LOCK(S):
-- RECORD LOCKS on users, index PRIMARY (id=2)
-- *** (2) WAITING FOR THIS LOCK TO BE GRANTED:
-- RECORD LOCKS on users, index PRIMARY (id=1)

-- *** WE ROLL BACK TRANSACTION (2)
```

**PostgreSQL**：
```sql
-- 查看锁等待
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.query AS blocked_query,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- 死锁日志
-- postgresql.conf
log_lock_waits = on
deadlock_timeout = 1s
```

### 3. 死锁处理

**自动回滚**：
```sql
-- 数据库自动选择一个事务回滚
-- 通常选择代价较小的事务

-- 事务1 和事务2 死锁
-- 数据库选择事务2 回滚
-- 事务1 继续执行
-- 事务2 返回错误：Deadlock found when trying to get lock
```

**应用层重试**：
```python
import mysql.connector
import time

def update_with_retry(conn, max_retries=3):
    for attempt in range(max_retries):
        try:
            cursor = conn.cursor()
            conn.start_transaction()
            
            cursor.execute("UPDATE users SET name = 'Alice' WHERE id = 1")
            cursor.execute("UPDATE users SET name = 'Bob' WHERE id = 2")
            
            conn.commit()
            return True
        
        except mysql.connector.errors.DatabaseError as e:
            conn.rollback()
            if e.errno == 1213:  # Deadlock
                if attempt < max_retries - 1:
                    time.sleep(0.1 * (attempt + 1))  # 指数退避
                    continue
                else:
                    raise
            else:
                raise
        
        finally:
            cursor.close()
    
    return False
```

---

## 死锁预防

### 1. 固定加锁顺序

**问题**：
```sql
-- 事务以不同顺序加锁，容易死锁

-- 事务1
BEGIN;
UPDATE users SET name='A' WHERE id=1;  -- 先锁 id=1
UPDATE users SET name='B' WHERE id=2;  -- 再锁 id=2
COMMIT;

-- 事务2
BEGIN;
UPDATE users SET name='C' WHERE id=2;  -- 先锁 id=2
UPDATE users SET name='D' WHERE id=1;  -- 再锁 id=1
COMMIT;

-- 容易死锁
```

**解决方案**：
```sql
-- 统一按 id 升序加锁

-- 事务1
BEGIN;
UPDATE users SET name='A' WHERE id=1;  -- 先锁 id=1
UPDATE users SET name='B' WHERE id=2;  -- 再锁 id=2
COMMIT;

-- 事务2
BEGIN;
UPDATE users SET name='C' WHERE id=1;  -- 先锁 id=1
UPDATE users SET name='D' WHERE id=2;  -- 再锁 id=2
COMMIT;

-- 不会死锁（顺序一致）
```

### 2. 减少事务时间

```sql
-- ❌ 不好：长事务
BEGIN;
-- 大量操作
-- 持有锁时间长
-- 增加死锁概率
COMMIT;

-- ✅ 好：短事务
BEGIN;
-- 只包含必须的操作
-- 快速释放锁
COMMIT;
```

### 3. 降低隔离级别

```sql
-- Serializable 容易死锁
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 改为 Read Committed
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- 减少锁范围，降低死锁概率
```

### 4. 使用乐观锁

```sql
-- 悲观锁（易死锁）
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- 加锁，持有到事务结束
-- ...
COMMIT;

-- 乐观锁（无锁，无死锁）
-- 1. 读取数据和版本号
SELECT id, balance, version FROM accounts WHERE id = 1;
-- balance = 1000, version = 5

-- 2. 更新时检查版本号
UPDATE accounts
SET balance = 900, version = 6
WHERE id = 1 AND version = 5;

-- 3. 如果更新失败（版本号不匹配），重试
```

---

## 锁监控与诊断

### 1. 查看当前锁

**MySQL**：
```sql
-- 查看当前锁（MySQL 8.0+）
SELECT 
    locked_table,
    locked_type,
    waiting_pid,
    waiting_query,
    blocking_pid,
    blocking_query
FROM sys.innodb_lock_waits;

-- 查看行锁
SELECT * FROM performance_schema.data_locks;

-- 查看锁等待
SELECT * FROM performance_schema.data_lock_waits;
```

**PostgreSQL**：
```sql
-- 查看当前锁
SELECT 
    locktype,
    relation::regclass,
    mode,
    granted,
    pid
FROM pg_locks
WHERE NOT granted;

-- 查看阻塞会话
SELECT 
    activity.pid,
    activity.usename,
    activity.query,
    blocking.pid AS blocking_pid
FROM pg_stat_activity AS activity
JOIN pg_stat_activity AS blocking ON blocking.pid = ANY(pg_blocking_pids(activity.pid))
WHERE activity.pid != pg_backend_pid();
```

### 2. 分析死锁

**死锁日志分析**：
```sql
-- MySQL
SHOW ENGINE INNODB STATUS\G

-- 分析：
-- 1. 找出涉及的事务
-- 2. 查看等待的锁
-- 3. 查看持有的锁
-- 4. 确定死锁原因
-- 5. 优化 SQL 或调整加锁顺序
```

---

## 锁优化策略

### 1. 使用合适的索引

```sql
-- ❌ 不好：无索引，锁表
UPDATE users SET status = 1 WHERE email = 'alice@example.com';
-- 全表扫描，锁定所有扫描的行

-- ✅ 好：有索引，锁行
CREATE INDEX idx_email ON users(email);
UPDATE users SET status = 1 WHERE email = 'alice@example.com';
-- 索引扫描，只锁定匹配的行
```

### 2. 避免大事务

```sql
-- ❌ 不好：大事务
BEGIN;
UPDATE large_table SET status = 1;  -- 更新百万行
-- 持有大量锁
COMMIT;

-- ✅ 好：分批更新
WHILE (SELECT COUNT(*) FROM large_table WHERE status = 0) > 0 DO
    BEGIN;
    UPDATE large_table SET status = 1 WHERE id IN (
        SELECT id FROM large_table WHERE status = 0 LIMIT 1000
    );
    COMMIT;
    SELECT SLEEP(0.1);
END WHILE;
```

### 3. 使用低隔离级别

```sql
-- 默认 Repeatable Read
-- 改为 Read Committed
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 减少 Gap Lock
-- 降低锁冲突
```

---

## 生产环境案例

### 1. 案例：订单处理死锁

**问题**：
```sql
-- 并发创建订单导致死锁

-- 事务1
BEGIN;
INSERT INTO orders VALUES (...);  -- 订单 ID=100
UPDATE inventory SET stock = stock - 1 WHERE product_id = 10;
UPDATE inventory SET stock = stock - 1 WHERE product_id = 20;
COMMIT;

-- 事务2
BEGIN;
INSERT INTO orders VALUES (...);  -- 订单 ID=101
UPDATE inventory SET stock = stock - 1 WHERE product_id = 20;  -- 先锁 20
UPDATE inventory SET stock = stock - 1 WHERE product_id = 10;  -- 再锁 10
COMMIT;

-- 死锁
```

**解决方案**：
```sql
-- 统一按 product_id 升序更新
BEGIN;
INSERT INTO orders VALUES (...);
-- 排序后更新
UPDATE inventory SET stock = stock - 1 WHERE product_id IN (10, 20) ORDER BY product_id;
COMMIT;
```

### 2. 案例：高并发扣库存

**问题**：
```sql
-- 高并发扣库存，锁竞争严重
BEGIN;
SELECT stock FROM inventory WHERE product_id = 10 FOR UPDATE;
UPDATE inventory SET stock = stock - 1 WHERE product_id = 10;
COMMIT;
```

**解决方案**：
```sql
-- 方案1：直接更新（无需 SELECT）
BEGIN;
UPDATE inventory SET stock = stock - 1 WHERE product_id = 10 AND stock > 0;
IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    -- 库存不足
ELSE
    COMMIT;
END IF;

-- 方案2：乐观锁
SELECT stock, version FROM inventory WHERE product_id = 10;
-- stock = 100, version = 5

UPDATE inventory
SET stock = stock - 1, version = version + 1
WHERE product_id = 10 AND version = 5;
-- 如果 version 不匹配，重试
```

---

## 最佳实践

### 1. 锁使用原则

```
□ 尽量使用低隔离级别
□ 减少事务时间
□ 固定加锁顺序
□ 使用合适的索引
□ 避免大事务
□ 及时提交或回滚
□ 监控锁等待和死锁
```

### 2. 死锁预防

```
□ 统一加锁顺序
□ 拆分大事务
□ 降低隔离级别
□ 考虑使用乐观锁
□ 合理设计索引
□ 应用层重试机制
```

### 3. 锁监控

```
□ 监控锁等待时间
□ 监控死锁频率
□ 分析死锁日志
□ 优化高冲突查询
□ 定期审查锁使用
```

---

## 参考资料

1. **MySQL 官方文档**：
   - InnoDB Locking: https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html

2. **PostgreSQL 官方文档**：
   - Explicit Locking: https://www.postgresql.org/docs/current/explicit-locking.html

3. **推荐书籍**：
   - 《MySQL技术内幕：InnoDB存储引擎》
   - 《数据库系统实现》

4. **最佳实践**：
   - 理解锁类型和粒度
   - 预防死锁
   - 监控锁性能
   - 优化锁使用
   - 合理选择隔离级别
   - 应用层处理死锁

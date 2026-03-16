# ACID 事务特性

## 概述

事务（Transaction）是数据库操作的基本单元，ACID 是事务必须满足的四个特性：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）、持久性（Durability）。理解 ACID 特性是掌握数据库事务处理的基础。

**核心特性**：
- **原子性（Atomicity）**：事务全部成功或全部失败
- **一致性（Consistency）**：事务保持数据一致性
- **隔离性（Isolation）**：并发事务互不干扰
- **持久性（Durability）**：提交后永久保存

---

## 原子性（Atomicity）

### 1. 概念

**定义**：
```
事务是一个不可分割的工作单元
事务中的所有操作要么全部成功，要么全部失败回滚
不存在部分成功的状态
```

**示例**：
```sql
-- 银行转账事务
START TRANSACTION;

-- 操作1：A账户扣款
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- 操作2：B账户加款
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;

-- 原子性保证：
-- 两个操作要么都成功，要么都失败
-- 不会出现只扣款不加款的情况
```

### 2. 实现机制

**Undo Log（回滚日志）**：
```
1. 事务开始前，记录原始数据到 Undo Log
2. 执行事务操作，修改数据
3. 如果失败或回滚：
   - 使用 Undo Log 恢复原始数据
4. 如果成功提交：
   - 清理 Undo Log（或标记为已提交）

示例：
BEGIN
  undo_log: accounts.id=1, balance=1000
  UPDATE accounts SET balance = 900 WHERE id = 1
  
  发生错误...
  
ROLLBACK
  从 undo_log 恢复: balance = 1000
```

**MySQL InnoDB 实现**：
```sql
-- 查看 Undo Log 使用情况
SHOW ENGINE INNODB STATUS\G

-- Undo Log 相关参数
SHOW VARIABLES LIKE 'innodb_undo%';

-- innodb_undo_tablespaces: Undo 表空间数量
-- innodb_undo_logs: Undo 日志数量
-- innodb_undo_log_truncate: 是否自动截断
```

### 3. 回滚操作

**手动回滚**：
```sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- 发现错误，回滚
ROLLBACK;

-- 所有修改被撤销
```

**自动回滚**：
```sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- 发生错误（如约束违反）
UPDATE accounts SET balance = -100 WHERE id = 2;
-- ERROR: Check constraint violated

-- 事务自动回滚
-- 两个操作都被撤销
```

**保存点（Savepoint）**：
```sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;

SAVEPOINT sp1;

UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 只回滚到保存点
ROLLBACK TO SAVEPOINT sp1;

-- id=1 的修改保留
-- id=2 的修改被撤销

COMMIT;
```

---

## 一致性（Consistency）

### 1. 概念

**定义**：
```
事务执行前后，数据库从一个一致性状态转换到另一个一致性状态
数据库的完整性约束不会被破坏
```

**一致性约束**：
- 主键约束
- 外键约束
- 唯一约束
- 检查约束
- 业务规则

### 2. 数据库约束

**主键约束**：
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50) NOT NULL
);

-- 一致性保证：不会有重复的 id
INSERT INTO users VALUES (1, 'alice');
INSERT INTO users VALUES (1, 'bob');  -- ERROR: Duplicate entry
```

**外键约束**：
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 一致性保证：订单的 user_id 必须存在
INSERT INTO orders VALUES (1, 999);  -- ERROR: Foreign key constraint
```

**检查约束**：
```sql
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY,
    balance DECIMAL(10,2) CHECK (balance >= 0)
);

-- 一致性保证：余额不能为负
UPDATE accounts SET balance = -100 WHERE id = 1;
-- ERROR: Check constraint violated
```

### 3. 应用层一致性

**业务规则**：
```sql
-- 业务规则：转账金额不能超过账户余额

START TRANSACTION;

-- 检查余额
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
-- balance = 500

-- 判断余额是否足够
IF balance >= 100 THEN
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;
    COMMIT;
ELSE
    ROLLBACK;  -- 余额不足，回滚
END IF;
```

**复合约束**：
```sql
-- 业务规则：同一用户在同一商品上只能有一个未完成订单

START TRANSACTION;

-- 检查是否存在未完成订单
SELECT COUNT(*) FROM orders 
WHERE user_id = 1 AND product_id = 100 AND status != 'completed'
FOR UPDATE;

IF count = 0 THEN
    INSERT INTO orders (user_id, product_id, status) VALUES (1, 100, 'pending');
    COMMIT;
ELSE
    ROLLBACK;  -- 已存在未完成订单
END IF;
```

---

## 隔离性（Isolation）

### 1. 概念

**定义**：
```
并发执行的事务之间相互隔离
一个事务的中间状态对其他事务不可见
```

**并发问题**：
- **脏读（Dirty Read）**：读到未提交的数据
- **不可重复读（Non-Repeatable Read）**：两次读取结果不同
- **幻读（Phantom Read）**：范围查询结果集变化

### 2. 隔离级别

**读未提交（Read Uncommitted）**：
```sql
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

START TRANSACTION;
SELECT balance FROM accounts WHERE id = 1;  -- 可能读到未提交的数据
COMMIT;

-- 问题：脏读
-- 其他事务未提交的修改也能读到
```

**读已提交（Read Committed）**：
```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

START TRANSACTION;
SELECT balance FROM accounts WHERE id = 1;  -- 只读已提交的数据
COMMIT;

-- 解决：脏读
-- 问题：不可重复读
-- 同一事务内多次读取可能不同
```

**可重复读（Repeatable Read）**：
```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

START TRANSACTION;
SELECT balance FROM accounts WHERE id = 1;  -- 100
-- 其他事务修改了 balance
SELECT balance FROM accounts WHERE id = 1;  -- 仍然是 100
COMMIT;

-- 解决：脏读、不可重复读
-- 问题：幻读（范围查询可能出现）
```

**串行化（Serializable）**：
```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

START TRANSACTION;
SELECT * FROM accounts WHERE balance > 100;
-- 其他事务无法插入或修改满足条件的行
COMMIT;

-- 解决：所有并发问题
-- 缺点：性能最差
```

### 3. 默认隔离级别

```sql
-- MySQL InnoDB：Repeatable Read
SHOW VARIABLES LIKE 'transaction_isolation';

-- Oracle：Read Committed
SELECT name, value FROM v$parameter WHERE name = 'isolation_level';

-- PostgreSQL：Read Committed
SHOW default_transaction_isolation;
```

---

## 持久性（Durability）

### 1. 概念

**定义**：
```
事务一旦提交，其修改就永久保存到数据库
即使系统崩溃，已提交的数据也不会丢失
```

### 2. 实现机制

**Redo Log（重做日志）**：
```
1. 事务修改数据，先写入内存
2. 同时记录修改到 Redo Log（WAL: Write-Ahead Logging）
3. Redo Log 持久化到磁盘（fsync）
4. 返回事务提交成功
5. 后台异步将内存数据刷新到磁盘

崩溃恢复：
1. 重启后读取 Redo Log
2. 重做已提交但未刷盘的事务
3. 恢复数据
```

**MySQL InnoDB**：
```sql
-- Redo Log 配置
SHOW VARIABLES LIKE 'innodb_log%';

-- innodb_log_file_size: 单个 Redo Log 文件大小
-- innodb_log_files_in_group: Redo Log 文件数量
-- innodb_log_buffer_size: Redo Log 缓冲区大小

-- 刷盘策略
SHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit';

-- 0: 每秒刷盘一次（性能最好，可能丢失1秒数据）
-- 1: 每次提交都刷盘（最安全，性能最差）
-- 2: 每次提交写入文件系统缓存，每秒刷盘（折中）
```

**Oracle**：
```sql
-- Redo Log
SELECT group#, members, bytes, status FROM v$log;

-- 归档模式（Archive Mode）
SELECT log_mode FROM v$database;
-- ARCHIVELOG: 启用归档，保留所有 Redo Log
-- NOARCHIVELOG: 不归档，Redo Log 循环覆盖
```

**PostgreSQL**：
```sql
-- WAL (Write-Ahead Log)
SHOW wal_level;  -- minimal, replica, logical
SHOW fsync;      -- on/off
SHOW synchronous_commit;  -- on/off/remote_write/remote_apply/local

-- WAL 文件位置
SHOW data_directory;
-- WAL 文件在 pg_wal 目录
```

### 3. 双写缓冲（Double Write Buffer）

**MySQL InnoDB**：
```
问题：
- 数据页 16KB
- 操作系统页 4KB
- 写入可能被中断（部分写）

解决：
1. 先将数据页写入 Double Write Buffer（顺序写）
2. Double Write Buffer 刷盘
3. 再写入实际数据文件（随机写）

崩溃恢复：
- 如果数据文件页损坏，从 Double Write Buffer 恢复
```

---

## 事务操作

### 1. 开始事务

**显式事务**：
```sql
-- MySQL/PostgreSQL
START TRANSACTION;
-- 或
BEGIN;

-- Oracle
-- 事务隐式开始，无需显式声明
```

**隐式事务**：
```sql
-- MySQL 默认自动提交
SHOW VARIABLES LIKE 'autocommit';  -- ON

-- 每个 SQL 语句自动开始和提交事务
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- 自动提交

-- 关闭自动提交
SET autocommit = 0;
-- 需要手动 COMMIT
```

### 2. 提交事务

```sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 提交事务
COMMIT;

-- 所有修改持久化
```

### 3. 回滚事务

```sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- 发现错误
IF error THEN
    ROLLBACK;  -- 回滚所有修改
END IF;
```

### 4. 保存点

```sql
START TRANSACTION;

INSERT INTO logs VALUES (1, 'log1');

SAVEPOINT sp1;

INSERT INTO logs VALUES (2, 'log2');

SAVEPOINT sp2;

INSERT INTO logs VALUES (3, 'log3');

-- 回滚到 sp2
ROLLBACK TO SAVEPOINT sp2;
-- log3 被撤销，log1 和 log2 保留

-- 回滚到 sp1
ROLLBACK TO SAVEPOINT sp1;
-- log2 和 log3 被撤销，log1 保留

COMMIT;
```

---

## 事务特性保障

### 1. ACID 特性关系

```
原子性（Atomicity）
  ↓ 通过 Undo Log 实现
一致性（Consistency）
  ↓ 原子性、隔离性、持久性共同保证
隔离性（Isolation）
  ↓ 通过锁和 MVCC 实现
持久性（Durability）
  ↓ 通过 Redo Log 实现

一致性是目标
原子性、隔离性、持久性是手段
```

### 2. CAP 定理

**分布式系统中的权衡**：
```
CAP 定理：
- Consistency（一致性）
- Availability（可用性）
- Partition Tolerance（分区容错性）

最多同时满足两个

单机数据库：
- 不存在分区问题
- 可以同时满足 C 和 A
- ACID 保证一致性

分布式数据库：
- 必须容忍分区（P）
- 在 C 和 A 之间权衡
- 通常选择 CP 或 AP
```

---

## 事务使用最佳实践

### 1. 事务范围

```sql
-- ❌ 不好：事务范围过大
START TRANSACTION;
-- 大量业务逻辑
-- 外部 API 调用
-- 文件操作
-- ...
COMMIT;

-- ✅ 好：事务范围最小化
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- 只包含必须原子执行的数据库操作
```

### 2. 事务时间

```sql
-- ❌ 不好：长事务
START TRANSACTION;
-- 执行 10 分钟
COMMIT;

-- 问题：
-- - 长时间持有锁
-- - 阻塞其他事务
-- - Undo Log 膨胀

-- ✅ 好：短事务
START TRANSACTION;
-- 执行 < 1 秒
COMMIT;
```

### 3. 只读事务

```sql
-- 声明只读事务（性能优化）
START TRANSACTION READ ONLY;
SELECT * FROM users WHERE id = 1;
COMMIT;

-- 只读事务不需要：
-- - 分配事务 ID
-- - 记录 Undo Log
-- - 加写锁
```

### 4. 错误处理

```python
import mysql.connector

def transfer(from_id, to_id, amount):
    conn = mysql.connector.connect(...)
    cursor = conn.cursor()
    
    try:
        # 开始事务
        conn.start_transaction()
        
        # 扣款
        cursor.execute(
            "UPDATE accounts SET balance = balance - %s WHERE id = %s",
            (amount, from_id)
        )
        
        # 加款
        cursor.execute(
            "UPDATE accounts SET balance = balance + %s WHERE id = %s",
            (amount, to_id)
        )
        
        # 提交
        conn.commit()
        return True
    
    except Exception as e:
        # 回滚
        conn.rollback()
        print(f"Transfer failed: {e}")
        return False
    
    finally:
        cursor.close()
        conn.close()
```

---

## 生产环境案例

### 1. 案例：转账事务

```sql
-- 转账事务
DELIMITER //
CREATE PROCEDURE sp_transfer(
    IN p_from_account BIGINT,
    IN p_to_account BIGINT,
    IN p_amount DECIMAL(10,2),
    OUT p_result VARCHAR(20)
)
BEGIN
    DECLARE v_balance DECIMAL(10,2);
    
    -- 异常处理
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'error';
    END;
    
    START TRANSACTION;
    
    -- 检查余额（加锁）
    SELECT balance INTO v_balance
    FROM accounts
    WHERE id = p_from_account
    FOR UPDATE;
    
    IF v_balance < p_amount THEN
        ROLLBACK;
        SET p_result = 'insufficient_balance';
    ELSE
        -- 扣款
        UPDATE accounts
        SET balance = balance - p_amount
        WHERE id = p_from_account;
        
        -- 加款
        UPDATE accounts
        SET balance = balance + p_amount
        WHERE id = p_to_account;
        
        COMMIT;
        SET p_result = 'success';
    END IF;
END //
DELIMITER ;

-- 调用
CALL sp_transfer(1, 2, 100, @result);
SELECT @result;
```

### 2. 案例：库存扣减

```sql
-- 电商下单扣库存
START TRANSACTION;

-- 检查库存并加锁
SELECT stock INTO @stock
FROM products
WHERE id = 100
FOR UPDATE;

IF @stock >= 5 THEN
    -- 扣减库存
    UPDATE products
    SET stock = stock - 5
    WHERE id = 100;
    
    -- 创建订单
    INSERT INTO orders (product_id, quantity, user_id)
    VALUES (100, 5, 1);
    
    COMMIT;
ELSE
    -- 库存不足
    ROLLBACK;
END IF;
```

---

## 参考资料

1. **理论基础**：
   - ACID 论文：Jim Gray, "The Transaction Concept"
   - CAP 定理：Eric Brewer

2. **MySQL 官方文档**：
   - InnoDB Transaction: https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-model.html

3. **Oracle 官方文档**：
   - Transaction Management: https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/transactions.html

4. **PostgreSQL 官方文档**：
   - Transaction Isolation: https://www.postgresql.org/docs/current/transaction-iso.html

5. **推荐书籍**：
   - 《数据库系统概念》
   - 《MySQL技术内幕：InnoDB存储引擎》

6. **最佳实践**：
   - 事务范围最小化
   - 避免长事务
   - 合理选择隔离级别
   - 正确处理异常和回滚
   - 只读事务声明为 READ ONLY
   - 监控事务执行时间

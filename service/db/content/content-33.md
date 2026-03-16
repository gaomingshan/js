# MVCC 多版本并发控制

## 概述

MVCC（Multi-Version Concurrency Control，多版本并发控制）是一种并发控制机制，通过保存数据的多个版本来实现高并发读写。MVCC 使得读操作不需要加锁，写操作也不会阻塞读操作，极大提升了数据库的并发性能。

**核心思想**：
- **多版本存储**：同一数据保存多个版本
- **快照读**：读取特定版本的快照
- **写不阻塞读**：读写并发执行
- **版本可见性**：通过事务 ID 判断版本可见性

**主要数据库实现**：
- MySQL InnoDB：基于 Undo Log
- PostgreSQL：基于 Tuple 版本链
- Oracle：基于 Undo 段

---

## MySQL InnoDB MVCC

### 1. 实现原理

**隐藏列**：
```
InnoDB 为每行记录添加三个隐藏列：

DB_TRX_ID（6字节）：
- 最后修改此行的事务 ID
- 每个事务有唯一递增的事务 ID

DB_ROLL_PTR（7字节）：
- 回滚指针，指向 Undo Log 中的旧版本

DB_ROW_ID（6字节）：
- 隐藏的行 ID（如果没有主键）
```

**Undo Log 版本链**：
```
当前行：
| id | name  | DB_TRX_ID | DB_ROLL_PTR |
|----|-------|-----------|-------------|
| 1  | Alice | 100       | ptr -> v2   |

Undo Log 版本链：
v2: id=1, name=Alice, trx_id=80, ptr -> v1
v1: id=1, name=Bob, trx_id=60, ptr -> NULL

版本链：当前行 -> v2 -> v1 -> NULL
```

**Read View（读视图）**：
```
Read View 包含：
- m_ids：创建 Read View 时活跃事务 ID 列表
- min_trx_id：m_ids 中最小的事务 ID
- max_trx_id：系统下一个将分配的事务 ID
- creator_trx_id：创建此 Read View 的事务 ID

可见性判断：
if (trx_id == creator_trx_id):
    可见（自己的修改）
elif (trx_id < min_trx_id):
    可见（早于所有活跃事务）
elif (trx_id >= max_trx_id):
    不可见（未来事务）
elif (trx_id in m_ids):
    不可见（并发活跃事务）
else:
    可见（已提交事务）
```

### 2. 快照读与当前读

**快照读（Snapshot Read）**：
```sql
-- 不加锁的普通查询
SELECT * FROM users WHERE id = 1;

-- 读取快照版本
-- 使用 MVCC
-- 不加锁
-- 读到的是一致性快照
```

**当前读（Current Read）**：
```sql
-- 加锁的查询
SELECT * FROM users WHERE id = 1 FOR UPDATE;
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 或 DML 语句
UPDATE users SET name = 'Alice' WHERE id = 1;
DELETE FROM users WHERE id = 1;
INSERT INTO users VALUES (1, 'Alice');

-- 读取最新版本
-- 加锁
-- 不使用 MVCC
```

### 3. MVCC 工作流程

**Repeatable Read 下的 MVCC**：
```sql
-- 事务1（TRX_ID = 100）
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;

-- 创建 Read View
-- m_ids = [101, 102]  -- 活跃事务
-- min_trx_id = 101
-- max_trx_id = 103
-- creator_trx_id = 100

SELECT * FROM users WHERE id = 1;
-- 查找可见的版本：
-- 当前版本 trx_id = 102（在 m_ids 中，不可见）
-- -> Undo Log v1, trx_id = 90（< min_trx_id，可见）
-- 返回 v1 版本

-- 事务2（TRX_ID = 101）提交
-- 事务1 再次查询
SELECT * FROM users WHERE id = 1;
-- 仍使用相同的 Read View
-- 仍返回 v1 版本（可重复读）

COMMIT;
```

**Read Committed 下的 MVCC**：
```sql
-- 事务1
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;

-- 第一次查询，创建 Read View
SELECT * FROM users WHERE id = 1;
-- Read View: m_ids = [101, 102]
-- 返回 trx_id = 90 的版本

-- 事务2（TRX_ID = 101）提交

-- 第二次查询，重新创建 Read View
SELECT * FROM users WHERE id = 1;
-- Read View: m_ids = [102]  -- 101 已提交
-- 返回 trx_id = 101 的版本（读已提交）

COMMIT;
```

### 4. 更新操作

**更新流程**：
```sql
-- 事务1（TRX_ID = 100）
BEGIN;

UPDATE users SET name = 'Alice' WHERE id = 1;
-- 1. 对行加 X 锁（排他锁）
-- 2. 将旧版本写入 Undo Log
-- 3. 修改当前行：
--    name = 'Alice'
--    DB_TRX_ID = 100
--    DB_ROLL_PTR = ptr_to_undo_log
-- 4. 记录 Redo Log

COMMIT;
-- 5. 释放锁
-- 6. 提交事务
```

**更新冲突处理**：
```sql
-- 事务1
BEGIN;
UPDATE users SET name = 'Alice' WHERE id = 1;
-- 加锁，但未提交

-- 事务2
BEGIN;
UPDATE users SET name = 'Bob' WHERE id = 1;
-- 尝试加锁，等待事务1释放锁
-- 阻塞...

-- 事务1 提交
COMMIT;

-- 事务2 获得锁，继续执行
-- 更新成功
COMMIT;
```

---

## PostgreSQL MVCC

### 1. 实现原理

**Tuple 版本**：
```
PostgreSQL 通过 Tuple 版本实现 MVCC：

每个 Tuple 包含：
- xmin：创建此 Tuple 的事务 ID
- xmax：删除此 Tuple 的事务 ID（0 表示未删除）
- cmin/cmax：命令 ID（事务内部序号）
- ctid：指向新版本的 Tuple（更新时）

示例：
Tuple v1: (xmin=100, xmax=0, data='Alice')
-- 事务 100 创建，未删除

Tuple v2: (xmin=200, xmax=0, data='Bob', ctid->v2)
-- 事务 200 更新，创建新版本
-- v1 的 xmax 设置为 200
```

**可见性判断**：
```python
def is_visible(tuple, snapshot):
    # 创建事务未提交或在快照之后
    if tuple.xmin > snapshot.xmax or not is_committed(tuple.xmin):
        return False
    
    # 创建事务在活跃列表中
    if tuple.xmin in snapshot.active_xids:
        return False
    
    # 已被删除
    if tuple.xmax != 0:
        # 删除事务已提交且在快照之前
        if is_committed(tuple.xmax) and tuple.xmax < snapshot.xmax:
            return False
    
    return True
```

### 2. 更新操作

**更新流程**：
```sql
-- 原始 Tuple
-- (xmin=100, xmax=0, id=1, name='Alice')

-- 事务 200 更新
BEGIN;
UPDATE users SET name = 'Bob' WHERE id = 1;

-- 1. 创建新 Tuple
--    (xmin=200, xmax=0, id=1, name='Bob')
-- 2. 标记旧 Tuple 已删除
--    (xmin=100, xmax=200, id=1, name='Alice')
-- 3. 旧 Tuple 的 ctid 指向新 Tuple

COMMIT;
```

**删除操作**：
```sql
-- 删除只是标记 xmax
BEGIN;
DELETE FROM users WHERE id = 1;

-- 设置 xmax = 当前事务 ID
-- Tuple: (xmin=100, xmax=200, id=1, name='Alice')

COMMIT;
-- Tuple 标记为已删除，但仍然存在（等待 VACUUM 清理）
```

### 3. VACUUM

**作用**：
```
VACUUM 清理死 Tuple：
- 标记为已删除的 Tuple
- 所有事务都不可见的旧版本
- 回收空间
- 更新统计信息
```

**手动 VACUUM**：
```sql
-- 清理表
VACUUM users;

-- 清理并分析
VACUUM ANALYZE users;

-- 完全清理（锁表，返还空间给操作系统）
VACUUM FULL users;
```

**自动 VACUUM**：
```ini
# postgresql.conf
autovacuum = on
autovacuum_max_workers = 3
autovacuum_vacuum_threshold = 50
autovacuum_vacuum_scale_factor = 0.2

# 触发条件：
# 死 Tuple 数量 > threshold + table_size * scale_factor
```

**监控 VACUUM**：
```sql
-- 查看表的死 Tuple 数量
SELECT 
    schemaname,
    relname,
    n_live_tup,
    n_dead_tup,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_ratio,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;
```

---

## Oracle MVCC

### 1. 实现原理

**Undo 段**：
```
Oracle 使用 Undo 段（Undo Tablespace）存储旧版本：

当前数据块：
| rowid | data  | SCN    |
|-------|-------|--------|
| r1    | Alice | 1000   |

Undo 段：
SCN 900: data = 'Bob'
SCN 800: data = 'Charlie'

版本链：当前(1000) -> Undo(900) -> Undo(800)
```

**SCN（System Change Number）**：
```
Oracle 使用 SCN 而非事务 ID：
- 全局递增的系统变更号
- 每次事务提交分配新 SCN
- 通过 SCN 判断版本可见性

查询 SCN：
SELECT current_scn FROM v$database;
```

**读一致性**：
```sql
-- 查询开始时获取 SCN
BEGIN
    -- 查询 SCN = 1000
    SELECT * FROM users WHERE id = 1;
    
    -- 其他事务提交了更新（SCN = 1100）
    
    -- 查询仍使用 SCN = 1000
    SELECT * FROM users WHERE id = 1;
    -- 从 Undo 段读取 SCN <= 1000 的版本
    
COMMIT;
```

### 2. 闪回查询

**使用 Undo 数据查询历史**：
```sql
-- 查询 5 分钟前的数据
SELECT * FROM users AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '5' MINUTE);

-- 查询指定 SCN 的数据
SELECT * FROM users AS OF SCN 1000;

-- 闪回版本查询
SELECT 
    versions_starttime,
    versions_endtime,
    versions_xid,
    versions_operation,
    id,
    name
FROM users 
VERSIONS BETWEEN TIMESTAMP 
    (SYSTIMESTAMP - INTERVAL '1' HOUR) AND SYSTIMESTAMP
WHERE id = 1;
```

---

## MVCC 优势与劣势

### 1. 优势

**读写并发**：
```
传统锁机制：
- 读加共享锁
- 写加排他锁
- 读写互斥

MVCC：
- 读不加锁
- 写不阻塞读
- 读写并发

性能提升：
- 高并发场景下显著提升
- 读多写少的场景更明显
```

**一致性快照**：
```sql
-- 事务内部看到一致性快照
BEGIN;

SELECT SUM(balance) FROM accounts;
-- 返回 1000

-- 其他事务修改了数据

SELECT SUM(balance) FROM accounts;
-- 仍返回 1000（Repeatable Read 下）

COMMIT;
```

**无锁读取**：
```
- 减少锁竞争
- 降低死锁概率
- 提升响应速度
```

### 2. 劣势

**空间开销**：
```
- 存储多个版本
- Undo Log 空间增长
- PostgreSQL 表膨胀

示例：
原始表：100 MB
频繁更新后：
- MySQL Undo Log: +50 MB
- PostgreSQL: 表大小 200 MB（死 Tuple）
```

**版本清理开销**：
```
MySQL：
- Undo Log 清理（Purge 线程）

PostgreSQL：
- VACUUM 清理死 Tuple
- VACUUM FULL 锁表

Oracle：
- Undo 段空间管理
```

**长事务问题**：
```sql
-- 长事务阻止版本清理
BEGIN;

SELECT * FROM users WHERE id = 1;

-- 事务一直不提交（几小时）

-- 问题：
-- - Undo Log 无法清理（事务可能需要）
-- - PostgreSQL 死 Tuple 无法清理
-- - 空间持续增长
```

---

## MVCC 与锁的配合

### 1. Next-Key Lock（MySQL）

**Gap Lock + Record Lock**：
```sql
-- Repeatable Read 下
BEGIN;

SELECT * FROM users WHERE id BETWEEN 10 AND 20 FOR UPDATE;

-- 锁定：
-- - id = 10, 15, 20 的记录（Record Lock）
-- - (10, 15), (15, 20) 的间隙（Gap Lock）
-- - 其他事务无法插入 id = 11-19

COMMIT;
```

**避免幻读**：
```sql
-- 会话1
BEGIN;
SELECT * FROM users WHERE id > 10 FOR UPDATE;
-- 锁定 id > 10 的所有记录和间隙

-- 会话2
INSERT INTO users VALUES (15, 'Alice');
-- 阻塞，等待会话1提交

-- 结果：避免幻读
```

### 2. 乐观锁与 MVCC

**版本号方式**：
```sql
-- 添加版本号列
ALTER TABLE accounts ADD COLUMN version INT DEFAULT 0;

-- 更新时检查版本号
UPDATE accounts
SET balance = balance - 100, version = version + 1
WHERE id = 1 AND version = 5;

-- 如果 version 不匹配（其他事务已更新），更新失败
-- 应用层重试
```

**时间戳方式**：
```sql
-- 添加时间戳列
ALTER TABLE accounts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 更新时检查时间戳
UPDATE accounts
SET balance = balance - 100
WHERE id = 1 AND updated_at = '2024-03-16 10:00:00';

-- 时间戳不匹配则更新失败
```

---

## MVCC 性能优化

### 1. 控制事务时长

```sql
-- ❌ 不好：长事务
BEGIN;
-- 执行几小时
-- Undo Log 无法清理
COMMIT;

-- ✅ 好：短事务
BEGIN;
-- 执行 < 1 秒
COMMIT;

-- 拆分大事务
FOR i IN 1..1000 LOOP
    BEGIN;
    -- 处理 1000 条记录
    COMMIT;
END LOOP;
```

### 2. 及时清理版本

**MySQL**：
```sql
-- 查看 Undo Log 使用
SHOW ENGINE INNODB STATUS\G

-- Purge 线程自动清理
-- 配置 Purge 线程数
SET GLOBAL innodb_purge_threads = 4;
```

**PostgreSQL**：
```sql
-- 定期 VACUUM
VACUUM ANALYZE users;

-- 监控死 Tuple
SELECT 
    schemaname,
    relname,
    n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000;

-- 自动 VACUUM 调优
ALTER TABLE users SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_vacuum_threshold = 1000
);
```

### 3. 避免大批量更新

```sql
-- ❌ 不好：一次更新百万行
UPDATE users SET status = 1;
-- 生成大量 Undo Log

-- ✅ 好：分批更新
WHILE 1 DO
    UPDATE users SET status = 1 WHERE id BETWEEN @start AND @end LIMIT 10000;
    IF ROW_COUNT() = 0 THEN BREAK; END IF;
    COMMIT;
    SELECT SLEEP(0.1);
END WHILE;
```

---

## 监控与诊断

### 1. MySQL 监控

```sql
-- 查看 Undo Log
SHOW ENGINE INNODB STATUS\G

-- History list length: Undo Log 长度
-- 正常：< 1000
-- 告警：> 10000

-- 查看长事务
SELECT 
    trx_id,
    trx_state,
    trx_started,
    TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS duration_sec,
    trx_query
FROM information_schema.innodb_trx
WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 60
ORDER BY trx_started;
```

### 2. PostgreSQL 监控

```sql
-- 查看膨胀表
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_dead_tup,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_ratio
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND n_dead_tup > 1000
ORDER BY dead_ratio DESC;

-- 查看 VACUUM 进度
SELECT 
    pid,
    phase,
    heap_blks_total,
    heap_blks_scanned,
    heap_blks_vacuumed,
    index_vacuum_count
FROM pg_stat_progress_vacuum;
```

---

## 最佳实践

### 1. 事务管理

```
□ 保持事务简短
□ 避免长事务
□ 及时提交或回滚
□ 不在事务中执行外部调用
□ 监控长时间运行的事务
```

### 2. 版本清理

```
□ MySQL: 监控 History list length
□ PostgreSQL: 定期 VACUUM
□ 避免大批量更新
□ 分批处理大事务
□ 监控空间使用
```

### 3. 隔离级别选择

```
□ 利用 MVCC 优势（Read Committed/Repeatable Read）
□ 避免不必要的 Serializable
□ 理解不同隔离级别的 MVCC 行为
□ 测试并发场景
```

---

## 参考资料

1. **MySQL 官方文档**：
   - InnoDB Multi-Versioning: https://dev.mysql.com/doc/refman/8.0/en/innodb-multi-versioning.html

2. **PostgreSQL 官方文档**：
   - MVCC: https://www.postgresql.org/docs/current/mvcc.html

3. **Oracle 官方文档**：
   - Read Consistency: https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html

4. **推荐论文**：
   - "Concurrency Control in Distributed Database Systems" (Bernstein & Goodman, 1981)

5. **推荐书籍**：
   - 《MySQL技术内幕：InnoDB存储引擎》
   - 《PostgreSQL 技术内幕》

6. **最佳实践**：
   - 理解 MVCC 原理
   - 控制事务时长
   - 定期清理版本
   - 监控空间使用
   - 选择合适隔离级别
   - 避免长事务

# 并行查询与执行优化

## 概述

并行查询通过利用多核 CPU 和多线程技术，将查询任务分解为多个子任务并行执行，显著提升大数据量查询的性能。理解并行查询原理和配置方法，对于优化 OLAP 场景和复杂查询至关重要。

**核心概念**：
- **并行度**：同时执行的线程数
- **并行扫描**：多线程扫描表
- **并行聚合**：多线程执行聚合计算
- **并行 JOIN**：多线程执行连接操作
- **协调器**：分配任务和合并结果

---

## MySQL 并行查询

### 1. MySQL 并行支持

**限制**：
```
MySQL 5.7/8.0：
- 不支持查询级别的并行
- 只有 InnoDB 只读事务有限的并行支持
- 主要依赖分区表的并行扫描
```

**替代方案**：
```
1. 使用分区表
2. 应用层并行（分片查询）
3. 使用 MySQL 8.0 的并行 DDL
4. 考虑使用 MPP 数据库（如 ClickHouse、Greenplum）
```

### 2. 分区表并行扫描

**原理**：
```
不同分区可以被不同线程扫描
实现伪并行
```

**示例**：
```sql
-- 创建分区表
CREATE TABLE orders (
    id BIGINT,
    created_at DATE,
    amount BIGINT
) PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025)
);

-- 查询时，不同分区可能被并行扫描
SELECT SUM(amount) FROM orders;
-- InnoDB 可能并行读取不同分区
```

### 3. 应用层并行查询

**手动分片查询**：
```python
import concurrent.futures
import mysql.connector

def query_partition(start_date, end_date):
    conn = mysql.connector.connect(...)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT SUM(amount) 
        FROM orders 
        WHERE created_at >= %s AND created_at < %s
    """, (start_date, end_date))
    result = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return result

# 并行查询多个时间范围
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    futures = [
        executor.submit(query_partition, '2024-01-01', '2024-04-01'),
        executor.submit(query_partition, '2024-04-01', '2024-07-01'),
        executor.submit(query_partition, '2024-07-01', '2024-10-01'),
        executor.submit(query_partition, '2024-10-01', '2025-01-01')
    ]
    
    total = sum(f.result() for f in futures)
    print(f"Total: {total}")
```

---

## Oracle 并行查询

### 1. 并行查询原理

**架构**：
```
协调进程（Query Coordinator）
    ↓ 分配任务
并行服务器进程（Parallel Servers）
    - PX001, PX002, PX003, ...
    ↓ 执行子任务
    ↓ 返回结果
协调进程
    ↓ 合并结果
返回最终结果
```

### 2. 启用并行查询

**表级并行度**：
```sql
-- 创建表时指定并行度
CREATE TABLE orders (
    id NUMBER,
    amount NUMBER
) PARALLEL 4;

-- 修改表的并行度
ALTER TABLE orders PARALLEL 8;

-- 禁用并行
ALTER TABLE orders NOPARALLEL;
```

**查询级并行提示**：
```sql
-- 使用并行提示
SELECT /*+ PARALLEL(orders, 4) */ 
    COUNT(*), SUM(amount)
FROM orders;

-- 自动并行度
SELECT /*+ PARALLEL(AUTO) */ 
    COUNT(*), SUM(amount)
FROM orders;

-- 指定并行度和表
SELECT /*+ PARALLEL(o, 8) PARALLEL(u, 4) */
    o.*, u.username
FROM orders o
JOIN users u ON o.user_id = u.id;
```

**会话级并行**：
```sql
-- 启用会话并行
ALTER SESSION ENABLE PARALLEL DML;
ALTER SESSION ENABLE PARALLEL DDL;
ALTER SESSION ENABLE PARALLEL QUERY;

-- 设置并行度
ALTER SESSION SET parallel_degree_policy = AUTO;
ALTER SESSION SET parallel_degree_limit = 8;
```

### 3. 并行操作类型

**并行全表扫描**：
```sql
SELECT /*+ PARALLEL(orders, 4) */ * FROM orders;

-- 执行计划：
-- PX COORDINATOR
--   PX SEND
--     PX BLOCK ITERATOR
--       TABLE ACCESS FULL (PARALLEL)
```

**并行索引扫描**：
```sql
SELECT /*+ PARALLEL_INDEX(orders, idx_created_at, 4) */
    * FROM orders 
WHERE created_at > DATE '2024-01-01';
```

**并行 JOIN**：
```sql
SELECT /*+ PARALLEL(4) */
    o.*, u.username
FROM orders o
JOIN users u ON o.user_id = u.id;

-- 执行计划：
-- PX COORDINATOR
--   PX SEND
--     HASH JOIN (PARALLEL)
--       PX RECEIVE
--         PX SEND HASH
--           TABLE ACCESS FULL orders (PARALLEL)
--       PX RECEIVE
--         PX SEND HASH
--           TABLE ACCESS FULL users (PARALLEL)
```

**并行聚合**：
```sql
SELECT /*+ PARALLEL(4) */
    city, COUNT(*), SUM(amount)
FROM orders
GROUP BY city;

-- 两阶段聚合：
-- 1. 每个并行进程局部聚合
-- 2. 协调进程合并结果
```

### 4. 并行 DML

**并行插入**：
```sql
ALTER SESSION ENABLE PARALLEL DML;

INSERT /*+ PARALLEL(orders, 4) */ INTO orders
SELECT * FROM orders_staging;
```

**并行更新**：
```sql
ALTER SESSION ENABLE PARALLEL DML;

UPDATE /*+ PARALLEL(orders, 4) */ orders
SET status = 1
WHERE created_at < DATE '2024-01-01';
```

**并行删除**：
```sql
ALTER SESSION ENABLE PARALLEL DML;

DELETE /*+ PARALLEL(orders, 4) */ FROM orders
WHERE created_at < DATE '2023-01-01';
```

### 5. 并行参数配置

```sql
-- 查看并行参数
SHOW PARAMETER parallel;

-- 最大并行度
ALTER SYSTEM SET parallel_max_servers = 64;

-- 并行最小执行时间（秒）
ALTER SYSTEM SET parallel_min_time_threshold = 10;

-- 自动并行度
ALTER SYSTEM SET parallel_degree_policy = AUTO;

-- 并行度限制
ALTER SYSTEM SET parallel_degree_limit = 8;
```

---

## PostgreSQL 并行查询

### 1. 并行查询支持

**PostgreSQL 9.6+ 支持**：
- 并行顺序扫描
- 并行聚合
- 并行 JOIN

**PostgreSQL 11+ 增强**：
- 并行哈希 JOIN
- 并行 CREATE INDEX
- 并行分区表扫描

### 2. 并行查询配置

**全局配置**：
```ini
# postgresql.conf

# 最大并行工作进程数
max_parallel_workers_per_gather = 4

# 全局最大并行工作进程
max_parallel_workers = 8

# 最大后台工作进程
max_worker_processes = 8

# 并行维护工作进程
max_parallel_maintenance_workers = 4
```

**会话级配置**：
```sql
-- 设置并行度
SET max_parallel_workers_per_gather = 4;

-- 禁用并行
SET max_parallel_workers_per_gather = 0;

-- 最小表大小（8MB 以下不并行）
SET min_parallel_table_scan_size = '8MB';

-- 最小索引大小
SET min_parallel_index_scan_size = '512kB';
```

### 3. 并行查询示例

**并行顺序扫描**：
```sql
-- 大表全表扫描自动并行
EXPLAIN ANALYZE
SELECT COUNT(*) FROM large_table;

-- 执行计划：
-- Finalize Aggregate
--   -> Gather
--         Workers Planned: 4
--         -> Partial Aggregate
--               -> Parallel Seq Scan on large_table
```

**并行聚合**：
```sql
EXPLAIN ANALYZE
SELECT city, COUNT(*), SUM(amount)
FROM orders
GROUP BY city;

-- 执行计划：
-- Finalize GroupAggregate
--   -> Gather Merge
--         Workers Planned: 4
--         -> Partial GroupAggregate
--               -> Sort
--                     -> Parallel Seq Scan on orders
```

**并行 JOIN**：
```sql
EXPLAIN ANALYZE
SELECT o.*, u.username
FROM orders o
JOIN users u ON o.user_id = u.id;

-- 执行计划：
-- Gather
--   Workers Planned: 2
--   -> Parallel Hash Join
--         -> Parallel Seq Scan on orders o
--         -> Parallel Hash
--               -> Parallel Seq Scan on users u
```

### 4. 强制并行

**调整成本参数**：
```sql
-- 降低并行启动成本
SET parallel_setup_cost = 0;
SET parallel_tuple_cost = 0;

-- 强制小表也并行
SET min_parallel_table_scan_size = 0;
```

---

## 并行查询优化

### 1. 何时使用并行

**适用场景**：
```
✅ 大数据量查询（GB/TB 级别）
✅ 全表扫描
✅ 复杂聚合计算
✅ 大表 JOIN
✅ OLAP 分析查询
✅ 批量数据处理

❌ 小数据量（< 1GB）
❌ OLTP 高并发场景
❌ 需要快速响应的交互查询
❌ 系统资源不足
```

### 2. 并行度选择

**计算公式**：
```
理想并行度 = CPU 核心数 / 并发查询数

示例：
16 核 CPU
同时 2 个并行查询
并行度 = 16 / 2 = 8

实际：
考虑系统负载
预留一定余量
并行度 = 4-6
```

**过高并行度问题**：
```
- CPU 竞争加剧
- 上下文切换开销
- 内存消耗增加
- 性能反而下降
```

### 3. 监控并行查询

**Oracle**：
```sql
-- 查看并行执行统计
SELECT 
    name,
    value
FROM v$sysstat
WHERE name LIKE '%parallel%';

-- 查看当前并行查询
SELECT 
    qcsid,
    server_group,
    server_set,
    degree
FROM v$px_session
WHERE qcsid IS NOT NULL;
```

**PostgreSQL**：
```sql
-- 查看并行工作进程
SELECT 
    pid,
    query,
    state,
    query_start
FROM pg_stat_activity
WHERE backend_type LIKE '%parallel%';

-- 查看并行查询统计
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
WHERE query LIKE '%Parallel%'
ORDER BY total_time DESC;
```

---

## 并行查询调优案例

### 1. 案例：大表聚合

**问题**：
```sql
-- 单线程查询慢
SELECT 
    city,
    COUNT(*) AS user_count,
    SUM(total_spent) AS total_revenue
FROM users
GROUP BY city;
-- 执行时间：120秒（1亿行数据）
```

**优化（Oracle）**：
```sql
-- 启用并行
SELECT /*+ PARALLEL(users, 8) */
    city,
    COUNT(*) AS user_count,
    SUM(total_spent) AS total_revenue
FROM users
GROUP BY city;
-- 执行时间：15秒
-- 性能提升：8倍
```

**优化（PostgreSQL）**：
```sql
-- 调整并行参数
SET max_parallel_workers_per_gather = 8;

SELECT 
    city,
    COUNT(*) AS user_count,
    SUM(total_spent) AS total_revenue
FROM users
GROUP BY city;
-- 自动并行
-- 执行时间：18秒
```

### 2. 案例：大表 JOIN

**问题**：
```sql
-- 两个大表 JOIN
SELECT 
    o.order_no,
    u.username,
    o.amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.created_at >= '2024-01-01';
-- 执行时间：300秒
```

**优化（Oracle）**：
```sql
SELECT /*+ PARALLEL(8) */
    o.order_no,
    u.username,
    o.amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.created_at >= '2024-01-01';
-- 执行时间：45秒
```

### 3. 案例：批量数据处理

**问题**：
```sql
-- 批量更新慢
UPDATE orders
SET status = 'completed'
WHERE created_at < '2024-01-01'
    AND status = 'pending';
-- 执行时间：600秒（1000万行）
```

**优化（Oracle）**：
```sql
ALTER SESSION ENABLE PARALLEL DML;

UPDATE /*+ PARALLEL(orders, 8) */ orders
SET status = 'completed'
WHERE created_at < '2024-01-01'
    AND status = 'pending';
-- 执行时间：80秒
```

---

## 查询执行优化技巧

### 1. 减少数据传输

**投影下推**：
```sql
-- 不好：传输所有列
SELECT * FROM large_table WHERE condition;

-- 好：只传输需要的列
SELECT id, name, amount FROM large_table WHERE condition;
```

### 2. 谓词下推

**提前过滤**：
```sql
-- 不好：JOIN 后过滤
SELECT * FROM (
    SELECT * FROM orders
) o
JOIN users u ON o.user_id = u.id
WHERE o.status = 1;

-- 好：过滤后 JOIN
SELECT * FROM (
    SELECT * FROM orders WHERE status = 1
) o
JOIN users u ON o.user_id = u.id;
```

### 3. 避免数据倾斜

**问题**：
```
某些分区或某些值的数据量远大于其他
导致并行不均衡
某些线程任务重，某些轻
```

**解决**：
```sql
-- 使用更合理的分区键
-- 避免热点数据集中在某个分区

-- 或增加随机性
SELECT /*+ PARALLEL(4) */
    city,
    CASE WHEN RANDOM() < 0.5 THEN 'A' ELSE 'B' END AS group_flag,
    COUNT(*)
FROM users
GROUP BY city, group_flag;
```

---

## 参考资料

1. **Oracle 官方文档**：
   - Parallel Execution: https://docs.oracle.com/en/database/oracle/oracle-database/19/vldbg/parallel-exec-intro.html

2. **PostgreSQL 官方文档**：
   - Parallel Query: https://www.postgresql.org/docs/current/parallel-query.html

3. **最佳实践**：
   - 大数据量查询使用并行
   - 合理设置并行度
   - 监控并行查询性能
   - 避免过度并行
   - 考虑系统资源限制
   - OLTP 场景谨慎使用并行

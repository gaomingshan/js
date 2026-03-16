# EXPLAIN 执行计划分析

## 概述

EXPLAIN 是分析 SQL 查询性能最重要的工具，通过查看执行计划可以了解查询如何执行、是否使用索引、预计扫描多少行等关键信息，从而找出性能瓶颈并优化查询。

**核心作用**：
- **查看执行计划**：了解 SQL 如何执行
- **识别性能问题**：发现全表扫描、索引失效
- **优化验证**：确认优化是否生效
- **成本估算**：评估查询开销

---

## MySQL EXPLAIN

### 1. 基础语法

```sql
-- 查看执行计划
EXPLAIN SELECT * FROM users WHERE username = 'alice';

-- 查看详细信息（MySQL 8.0.18+）
EXPLAIN ANALYZE SELECT * FROM users WHERE username = 'alice';

-- 查看 JSON 格式（更详细）
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE username = 'alice';

-- 查看树形格式（MySQL 8.0.16+）
EXPLAIN FORMAT=TREE SELECT * FROM users WHERE username = 'alice';
```

### 2. EXPLAIN 输出字段

**id**：
```
查询的序列号

id=1: 第一个 SELECT
id=2: 第二个 SELECT（子查询或 UNION）
id 相同：执行顺序从上到下
id 不同：id 大的先执行
```

**select_type**：
```sql
-- SIMPLE：简单查询
EXPLAIN SELECT * FROM users WHERE id = 1;
-- select_type: SIMPLE

-- PRIMARY：主查询
EXPLAIN SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
-- select_type: PRIMARY（外层）
-- select_type: SUBQUERY（子查询）

-- SUBQUERY：子查询
EXPLAIN SELECT * FROM users WHERE id = (SELECT user_id FROM orders LIMIT 1);

-- DERIVED：派生表（FROM 子句中的子查询）
EXPLAIN SELECT * FROM (SELECT * FROM users WHERE status = 1) t;
-- select_type: DERIVED

-- UNION：UNION 后面的查询
EXPLAIN SELECT * FROM users WHERE id = 1 UNION SELECT * FROM users WHERE id = 2;
-- select_type: PRIMARY（第一个）
-- select_type: UNION（第二个）

-- UNION RESULT：UNION 的结果
-- select_type: UNION RESULT
```

**table**：
```
访问的表名

正常表名：users
派生表：<derivedN>
UNION 结果：<unionM,N>
```

**partitions**：
```
匹配的分区

partitions: p2024,p2025  -- 访问这些分区
partitions: NULL  -- 非分区表
```

**type**：
```
访问类型（从最优到最差）

system > const > eq_ref > ref > range > index > ALL

system: 表只有一行（系统表）
const: 通过主键或唯一索引查询，最多返回一行
eq_ref: JOIN 时使用主键或唯一索引
ref: 使用非唯一索引
range: 范围扫描（BETWEEN, >, <, IN）
index: 全索引扫描
ALL: 全表扫描（最差）
```

**示例**：
```sql
-- type: const
EXPLAIN SELECT * FROM users WHERE id = 1;
-- 主键查询，返回一行

-- type: eq_ref
EXPLAIN SELECT * FROM orders o JOIN users u ON o.user_id = u.id;
-- JOIN 使用主键

-- type: ref
EXPLAIN SELECT * FROM users WHERE username = 'alice';
-- 使用非唯一索引

-- type: range
EXPLAIN SELECT * FROM users WHERE age BETWEEN 18 AND 30;
-- 范围查询

-- type: index
EXPLAIN SELECT id FROM users;
-- 全索引扫描（覆盖索引）

-- type: ALL
EXPLAIN SELECT * FROM users WHERE age > 18;
-- 全表扫描（age 无索引）
```

**possible_keys**：
```
可能使用的索引

possible_keys: idx_username,idx_email
-- 优化器考虑使用这些索引

possible_keys: NULL
-- 没有合适的索引
```

**key**：
```
实际使用的索引

key: idx_username
-- 使用了 idx_username 索引

key: NULL
-- 没有使用索引（全表扫描）
```

**key_len**：
```
使用的索引长度（字节数）

用于判断联合索引使用了哪几列

示例：
idx_city_age (city VARCHAR(20), age INT)

key_len: 83
-- VARCHAR(20): 20*4(utf8mb4) + 2(长度) + 1(NULL) = 83
-- 只使用了 city 列

key_len: 88
-- 83 + 4(INT) + 1(NULL) = 88
-- 使用了 city 和 age 两列
```

**ref**：
```
索引查找时使用的列或常量

ref: const
-- 使用常量

ref: mydb.orders.user_id
-- 使用 orders.user_id 列

ref: func
-- 使用函数
```

**rows**：
```
预计扫描的行数

rows: 1
-- 预计扫描 1 行（非常好）

rows: 10000
-- 预计扫描 10000 行

rows: 1000000
-- 预计扫描 100 万行（需要优化）

注意：这是估算值，不是精确值
```

**filtered**：
```
过滤后的行数百分比

filtered: 100.00
-- 100% 的行满足条件

filtered: 10.00
-- 只有 10% 的行满足条件（可能需要优化）

实际返回行数 = rows × filtered / 100
```

**Extra**：
```
额外信息（非常重要）

Using index: 覆盖索引，无需回表（好）
Using where: 使用 WHERE 过滤
Using index condition: 索引下推（ICP）
Using temporary: 使用临时表（需要优化）
Using filesort: 需要排序（需要优化）
Using join buffer: 使用 JOIN 缓冲
Impossible WHERE: WHERE 条件总是 FALSE
Select tables optimized away: 优化器直接返回结果
```

### 3. EXPLAIN 示例分析

**优秀的执行计划**：
```sql
EXPLAIN SELECT * FROM users WHERE id = 100\G

-- 输出：
id: 1
select_type: SIMPLE
table: users
type: const          ← 最优访问类型
possible_keys: PRIMARY
key: PRIMARY         ← 使用主键
key_len: 8
ref: const
rows: 1              ← 只扫描 1 行
filtered: 100.00
Extra: NULL

-- 分析：
-- 1. 使用主键查询
-- 2. 访问类型 const
-- 3. 只扫描 1 行
-- 4. 性能极佳
```

**需要优化的执行计划**：
```sql
EXPLAIN SELECT * FROM users WHERE age > 18 ORDER BY created_at\G

-- 输出：
id: 1
select_type: SIMPLE
table: users
type: ALL            ← 全表扫描
possible_keys: NULL  ← 没有可用索引
key: NULL            ← 未使用索引
key_len: NULL
ref: NULL
rows: 1000000        ← 扫描 100 万行
filtered: 33.33      ← 只有 33% 满足条件
Extra: Using where; Using filesort  ← 需要排序

-- 问题：
-- 1. 全表扫描（type: ALL）
-- 2. 扫描 100 万行
-- 3. 需要额外排序（Using filesort）

-- 优化：
CREATE INDEX idx_age_created ON users(age, created_at);

EXPLAIN SELECT * FROM users WHERE age > 18 ORDER BY created_at\G

-- 优化后：
type: range          ← 范围扫描
key: idx_age_created ← 使用索引
rows: 330000         ← 减少扫描行数
Extra: Using index condition  ← 索引下推
-- 无 Using filesort（利用索引排序）
```

**JOIN 查询分析**：
```sql
EXPLAIN SELECT * FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = 1\G

-- 输出：
-- 表1（驱动表）
id: 1
table: o
type: ref
key: idx_status
rows: 10000

-- 表2（被驱动表）
id: 1
table: u
type: eq_ref        ← JOIN 使用主键
key: PRIMARY
rows: 1             ← 每次 JOIN 只访问 1 行

-- 分析：
-- 1. orders 作为驱动表（先访问）
-- 2. 通过 idx_status 过滤
-- 3. 对每行使用主键 JOIN users
-- 4. 执行效率高
```

### 4. EXPLAIN ANALYZE（MySQL 8.0.18+）

```sql
-- 实际执行并显示时间
EXPLAIN ANALYZE 
SELECT * FROM users WHERE username LIKE 'alice%';

-- 输出（简化）：
-> Filter: (users.username like 'alice%')  (cost=100.75 rows=10) (actual time=0.045..0.198 rows=5 loops=1)
    -> Index range scan on users using idx_username  (cost=100.75 rows=10) (actual time=0.042..0.192 rows=5 loops=1)

-- 信息：
-- cost: 估算成本
-- rows: 估算行数
-- actual time: 实际执行时间（毫秒）
-- actual rows: 实际返回行数
-- loops: 循环次数
```

---

## Oracle EXPLAIN PLAN

### 1. 查看执行计划

```sql
-- 生成执行计划
EXPLAIN PLAN FOR
SELECT * FROM users WHERE username = 'alice';

-- 查看执行计划
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- 或使用
SELECT plan_table_output FROM TABLE(DBMS_XPLAN.DISPLAY());
```

### 2. 输出字段

```sql
-- 示例输出：
PLAN_TABLE_OUTPUT
--------------------------------------------------------------------------------
Plan hash value: 2728161189

------------------------------------------------------------------------------
| Id  | Operation         | Name         | Rows  | Bytes | Cost (%CPU)| Time     |
------------------------------------------------------------------------------
|   0 | SELECT STATEMENT  |              |     1 |   100 |     2   (0)| 00:00:01 |
|*  1 |  INDEX RANGE SCAN | IDX_USERNAME |     1 |   100 |     2   (0)| 00:00:01 |
------------------------------------------------------------------------------

Predicate Information (identified by operation id):
---------------------------------------------------
   1 - access("USERNAME"='alice')
```

**关键列**：
- **Id**：操作序号
- **Operation**：操作类型
- **Name**：对象名（表名、索引名）
- **Rows**：预计行数
- **Bytes**：预计字节数
- **Cost**：估算成本
- **Time**：预计时间

**常见 Operation**：
```
TABLE ACCESS FULL: 全表扫描
TABLE ACCESS BY INDEX ROWID: 通过索引访问表
INDEX UNIQUE SCAN: 唯一索引扫描
INDEX RANGE SCAN: 索引范围扫描
INDEX FULL SCAN: 全索引扫描
NESTED LOOPS: 嵌套循环 JOIN
HASH JOIN: 哈希 JOIN
MERGE JOIN: 归并 JOIN
```

### 3. 实时执行计划

```sql
-- 查看实际执行计划（包含实际行数）
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST'));

-- 先执行查询
SELECT * FROM users WHERE username = 'alice';

-- 再查看执行计划
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST'));

-- 输出包含：
-- A-Rows: 实际返回行数
-- A-Time: 实际执行时间
```

---

## PostgreSQL EXPLAIN

### 1. 基础用法

```sql
-- 查看执行计划
EXPLAIN SELECT * FROM users WHERE username = 'alice';

-- 查看详细信息
EXPLAIN VERBOSE SELECT * FROM users WHERE username = 'alice';

-- 实际执行并显示时间
EXPLAIN ANALYZE SELECT * FROM users WHERE username = 'alice';

-- 显示缓冲区信息
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE username = 'alice';

-- JSON 格式
EXPLAIN (FORMAT JSON) SELECT * FROM users WHERE username = 'alice';
```

### 2. 输出解读

```sql
EXPLAIN SELECT * FROM users WHERE id = 100;

-- 输出：
Seq Scan on users  (cost=0.00..18334.00 rows=1 width=100)
  Filter: (id = 100)

-- 字段说明：
-- Seq Scan: 顺序扫描（全表扫描）
-- cost=0.00..18334.00: 启动成本..总成本
-- rows=1: 预计返回 1 行
-- width=100: 每行平均字节数
```

**cost 解释**：
```
cost=启动成本..总成本

启动成本：开始返回第一行前的成本
总成本：返回所有行的总成本

单位：任意的成本单位（非时间）
```

**常见操作类型**：
```
Seq Scan: 顺序扫描（全表扫描）
Index Scan: 索引扫描
Index Only Scan: 只读索引（覆盖索引）
Bitmap Heap Scan: 位图堆扫描
Nested Loop: 嵌套循环
Hash Join: 哈希连接
Merge Join: 归并连接
```

### 3. EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE username = 'alice';

-- 输出：
Index Scan using idx_username on users  
  (cost=0.42..8.44 rows=1 width=100) 
  (actual time=0.015..0.016 rows=1 loops=1)
  Index Cond: (username = 'alice'::text)
Planning Time: 0.082 ms
Execution Time: 0.031 ms

-- actual time: 实际时间（启动..总时间）
-- actual rows: 实际行数
-- loops: 循环次数
-- Planning Time: 计划时间
-- Execution Time: 执行时间
```

---

## 执行计划优化案例

### 1. 索引失效优化

**问题**：
```sql
EXPLAIN SELECT * FROM users WHERE YEAR(created_at) = 2024;

-- MySQL 输出：
type: ALL
key: NULL
rows: 1000000
Extra: Using where

-- 问题：索引失效，全表扫描
```

**优化**：
```sql
-- 改为范围查询
EXPLAIN SELECT * FROM users 
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- 输出：
type: range
key: idx_created_at
rows: 100000
Extra: Using index condition

-- 结果：使用索引，扫描行数减少 10 倍
```

### 2. JOIN 优化

**问题**：
```sql
EXPLAIN SELECT * FROM orders o LEFT JOIN users u ON o.user_id = u.id;

-- 输出：
-- 表 orders
type: ALL
rows: 1000000

-- 表 users
type: ALL
rows: 100000
Extra: Using join buffer (Block Nested Loop)

-- 问题：两表都全表扫描，使用 JOIN 缓冲
```

**优化**：
```sql
-- 在 JOIN 列创建索引
CREATE INDEX idx_user_id ON orders(user_id);

EXPLAIN SELECT * FROM orders o LEFT JOIN users u ON o.user_id = u.id;

-- 输出：
-- 表 orders
type: index
key: idx_user_id

-- 表 users
type: eq_ref
key: PRIMARY
rows: 1

-- 结果：使用索引 JOIN，性能大幅提升
```

### 3. 子查询优化

**问题**：
```sql
EXPLAIN SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE status = 1);

-- 输出：
type: ALL
Extra: Using where; Using join buffer (hash join)

-- 问题：可能使用临时表
```

**优化**：
```sql
-- 改为 JOIN
EXPLAIN SELECT DISTINCT u.* FROM users u 
JOIN orders o ON u.id = o.user_id 
WHERE o.status = 1;

-- 或使用 EXISTS
EXPLAIN SELECT * FROM users u 
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 1);

-- 结果：避免子查询，性能更好
```

### 4. 排序优化

**问题**：
```sql
EXPLAIN SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 10;

-- 输出：
type: ref
key: idx_status
Extra: Using where; Using filesort

-- 问题：Using filesort，需要额外排序
```

**优化**：
```sql
-- 创建联合索引
CREATE INDEX idx_status_created ON orders(status, created_at);

EXPLAIN SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 10;

-- 输出：
type: ref
key: idx_status_created
Extra: Using index condition; Backward index scan

-- 结果：利用索引排序，无 Using filesort
```

---

## 性能分析技巧

### 1. 识别慢查询

```sql
-- 关注以下指标：
-- 1. type: ALL（全表扫描）
-- 2. rows: 大量行
-- 3. Extra: Using filesort, Using temporary
-- 4. key: NULL（未使用索引）
```

### 2. 优化优先级

```
1. 解决全表扫描（type: ALL）
   → 添加索引

2. 减少扫描行数（rows）
   → 优化索引、添加过滤条件

3. 消除 Using filesort
   → 创建支持排序的索引

4. 消除 Using temporary
   → 优化 GROUP BY、DISTINCT
```

### 3. 对比优化前后

```sql
-- 优化前
EXPLAIN SELECT ...;
-- 记录 type, rows, Extra

-- 执行优化

-- 优化后
EXPLAIN SELECT ...;
-- 对比改善情况
```

---

## 最佳实践

### 1. 定期分析执行计划

```sql
-- 对重要查询定期 EXPLAIN
-- 监控执行计划变化
-- 发现性能退化及时优化
```

### 2. 关注关键指标

```sql
-- MySQL
-- type: 尽量 const, eq_ref, ref
-- rows: 尽量小
-- Extra: 避免 Using filesort, Using temporary

-- Oracle
-- Cost: 尽量低
-- Operation: 避免 TABLE ACCESS FULL

-- PostgreSQL
-- cost: 尽量低
-- actual time: 实际执行时间
```

### 3. 使用 EXPLAIN ANALYZE

```sql
-- 不仅看执行计划，还要看实际执行
-- 对比估算值和实际值
-- 发现优化器估算偏差
```

---

## 参考资料

1. **MySQL 官方文档**：
   - EXPLAIN Output: https://dev.mysql.com/doc/refman/8.0/en/explain-output.html
   - EXPLAIN ANALYZE: https://dev.mysql.com/doc/refman/8.0/en/explain.html#explain-analyze

2. **Oracle 官方文档**：
   - EXPLAIN PLAN: https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/generating-and-displaying-execution-plans.html

3. **PostgreSQL 官方文档**：
   - EXPLAIN: https://www.postgresql.org/docs/current/sql-explain.html
   - Using EXPLAIN: https://www.postgresql.org/docs/current/using-explain.html

4. **最佳实践**：
   - 每个重要查询都要 EXPLAIN
   - 关注 type, rows, Extra
   - 优化全表扫描和大量行扫描
   - 消除 Using filesort 和 Using temporary
   - 定期审查执行计划

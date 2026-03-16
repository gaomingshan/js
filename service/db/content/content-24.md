# 查询优化器原理

## 概述

查询优化器（Query Optimizer）是数据库的核心组件，负责将 SQL 语句转换为最优的执行计划。理解优化器的工作原理，有助于编写高效的 SQL、理解执行计划、解决性能问题。

**核心职责**：
- **解析 SQL**：语法分析、语义检查
- **生成执行计划**：多种方案对比
- **成本估算**：计算每个方案的代价
- **选择最优方案**：选择成本最低的执行计划

**优化器类型**：
- **基于规则（RBO）**：根据预定义规则优化
- **基于成本（CBO）**：根据统计信息估算成本

---

## 优化器工作流程

### 1. SQL 执行流程

```
SQL 语句
  ↓
解析器（Parser）
  ↓ 解析树（Parse Tree）
优化器（Optimizer）
  ↓ 执行计划（Execution Plan）
执行引擎（Executor）
  ↓
结果集
```

### 2. 优化器处理步骤

**逻辑优化**：
```
1. 视图展开
   将视图替换为实际的 SELECT 语句

2. 子查询优化
   子查询转 JOIN、半连接等

3. 谓词推导
   根据已知条件推导新条件

4. 等价变换
   OR 转 IN、IN 转 JOIN 等

5. 常量折叠
   计算常量表达式
```

**物理优化**：
```
1. 访问路径选择
   全表扫描 vs 索引扫描

2. JOIN 顺序选择
   确定多表连接顺序

3. JOIN 方法选择
   Nested Loop、Hash Join、Merge Join

4. 索引选择
   选择最优索引

5. 并行度选择
   是否使用并行查询
```

---

## 基于成本的优化器（CBO）

### 1. 成本模型

**I/O 成本**：
```
读取数据页的成本

全表扫描成本 = 数据页数 × 顺序读成本
索引扫描成本 = 索引页数 × 随机读成本 + 回表次数 × 随机读成本

顺序读 < 随机读
SSD < HDD
```

**CPU 成本**：
```
处理数据的成本

比较操作成本
排序成本
聚合成本
JOIN 成本
```

**成本计算示例**：
```sql
-- 查询
SELECT * FROM users WHERE age > 18;

-- 方案1：全表扫描
成本 = 数据页数 × 顺序读成本 + 行数 × CPU 比较成本
     = 10000 × 1.0 + 1000000 × 0.01
     = 20000

-- 方案2：索引扫描（假设 age 有索引，结果返回 80 万行）
成本 = 索引页数 × 随机读成本 + 回表次数 × 随机读成本 + CPU 成本
     = 1000 × 4.0 + 800000 × 4.0 + 800000 × 0.01
     = 3212000

-- 结论：全表扫描成本更低（返回数据多时）
-- 优化器选择全表扫描
```

### 2. 统计信息

**表统计信息**：
```sql
-- MySQL
SELECT 
    table_name,
    table_rows,  -- 行数（估算）
    avg_row_length,  -- 平均行长度
    data_length,  -- 数据大小
    index_length  -- 索引大小
FROM information_schema.tables
WHERE table_schema = 'mydb';
```

**列统计信息**：
```sql
-- MySQL
SHOW INDEX FROM users;
-- Cardinality: 列的不重复值数量（估算）

-- Oracle
SELECT 
    column_name,
    num_distinct,  -- 不重复值数量
    low_value,  -- 最小值
    high_value,  -- 最大值
    density,  -- 密度
    num_nulls,  -- NULL 值数量
    histogram  -- 直方图类型
FROM user_tab_col_statistics
WHERE table_name = 'USERS';
```

**直方图**：
```sql
-- MySQL 8.0+
ANALYZE TABLE users UPDATE HISTOGRAM ON age, city;

-- 查看直方图
SELECT * FROM information_schema.column_statistics
WHERE table_name = 'users';

-- 直方图帮助优化器更准确估算：
-- - 数据分布不均匀时
-- - 有数据倾斜时
```

### 3. 基数估算

**选择性（Selectivity）**：
```
选择性 = 满足条件的行数 / 总行数

WHERE age = 25
选择性 = COUNT(DISTINCT age) / COUNT(*) ≈ 1 / 不重复值数量

WHERE age > 18
选择性 = (最大值 - 18) / (最大值 - 最小值)
```

**多条件基数估算**：
```sql
-- AND 条件
WHERE age > 18 AND city = 'Beijing'

-- 假设独立：
选择性 = 选择性(age > 18) × 选择性(city = 'Beijing')

-- OR 条件
WHERE age > 18 OR city = 'Beijing'

-- 选择性 = 选择性(age > 18) + 选择性(city = 'Beijing') 
--          - 选择性(age > 18) × 选择性(city = 'Beijing')
```

**相关性问题**：
```sql
-- 问题：列之间有相关性，独立性假设不准确

-- 例如：
WHERE gender = 'F' AND pregnant = true

-- gender 和 pregnant 高度相关
-- 优化器假设独立，估算不准确

-- 解决：多列统计信息、扩展统计（PostgreSQL）
CREATE STATISTICS stat_gender_pregnant ON gender, pregnant FROM users;
```

---

## JOIN 优化

### 1. JOIN 顺序

**多表 JOIN 顺序问题**：
```sql
SELECT * FROM t1 JOIN t2 ON ... JOIN t3 ON ... JOIN t4 ON ...;

-- 可能的 JOIN 顺序：
-- (((t1 ⋈ t2) ⋈ t3) ⋈ t4)  左深树
-- ((t1 ⋈ t2) ⋈ (t3 ⋈ t4))  右深树
-- ...

-- n 个表的 JOIN 顺序数量：(2n-2)! / (n-1)!
-- 4 表：5040 种
-- 10 表：17亿种

-- 优化器使用启发式算法减少搜索空间
```

**小表驱动大表原则**：
```sql
-- t1: 100 行
-- t2: 10000 行

-- 方案1：t1 驱动 t2（好）
for row in t1:
    lookup t2 by join_key  -- 100 次查找

-- 方案2：t2 驱动 t1（差）
for row in t2:
    lookup t1 by join_key  -- 10000 次查找

-- 优化器选择小表驱动大表
```

**动态规划优化 JOIN 顺序**：
```
1. 枚举所有单表访问路径
2. 枚举两表 JOIN
3. 枚举三表 JOIN（基于两表结果）
4. ...

使用动态规划避免重复计算
```

### 2. JOIN 算法

**Nested Loop Join**：
```python
# 嵌套循环
for r1 in table1:
    for r2 in table2:
        if r1.join_key == r2.join_key:
            output(r1, r2)

# 成本：O(n × m)
# 适用：小表 JOIN，被驱动表有索引
```

**Block Nested Loop**：
```python
# 块嵌套循环（使用 JOIN 缓冲）
load block of table1 into memory
for each row r1 in block:
    for r2 in table2:
        if r1.join_key == r2.join_key:
            output(r1, r2)

# 减少外表扫描次数
```

**Hash Join**：
```python
# 构建阶段：小表构建哈希表
hash_table = {}
for r1 in small_table:
    hash_table[r1.join_key].append(r1)

# 探测阶段：大表探测哈希表
for r2 in large_table:
    if r2.join_key in hash_table:
        for r1 in hash_table[r2.join_key]:
            output(r1, r2)

# 成本：O(n + m)
# 适用：等值 JOIN，内存足够
# MySQL 8.0.18+ 支持
```

**Merge Join**：
```python
# 归并连接（两表都已排序）
sort table1 by join_key
sort table2 by join_key

i1, i2 = 0, 0
while i1 < len(table1) and i2 < len(table2):
    if table1[i1].key == table2[i2].key:
        output(table1[i1], table2[i2])
        i1, i2 += 1, 1
    elif table1[i1].key < table2[i2].key:
        i1 += 1
    else:
        i2 += 1

# 成本：O(n log n + m log m)（含排序）
# 适用：已排序或有序索引
```

**优化器选择 JOIN 算法**：
```sql
-- 小表 JOIN，有索引 → Nested Loop
SELECT * FROM small_table s JOIN large_table l ON s.id = l.fk;

-- 大表等值 JOIN → Hash Join
SELECT * FROM t1 JOIN t2 ON t1.id = t2.id;

-- 已排序 → Merge Join
SELECT * FROM t1 JOIN t2 ON t1.sorted_col = t2.sorted_col;
```

---

## 子查询优化

### 1. 子查询类型

**相关子查询**：
```sql
-- 每行都执行一次子查询
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 优化：转换为 JOIN
SELECT DISTINCT u.* FROM users u
JOIN orders o ON u.id = o.user_id;
```

**IN 子查询**：
```sql
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);

-- 优化器可能转换为：
-- 1. JOIN
-- 2. Semi-Join
-- 3. Materialization（物化）

-- Materialization：
-- 1. 执行子查询，结果存入临时表
-- 2. 在临时表上创建索引
-- 3. JOIN 临时表
```

**标量子查询**：
```sql
SELECT 
    username,
    (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count
FROM users;

-- 优化：转换为 LEFT JOIN
SELECT 
    u.username,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

### 2. 子查询展开

**条件下推（Predicate Pushdown）**：
```sql
-- 原查询
SELECT * FROM (
    SELECT * FROM users WHERE age > 18
) t WHERE city = 'Beijing';

-- 优化后
SELECT * FROM users WHERE age > 18 AND city = 'Beijing';

-- 条件下推到子查询内部
```

**投影下推（Projection Pushdown）**：
```sql
-- 原查询
SELECT id, username FROM (
    SELECT * FROM users WHERE age > 18
) t;

-- 优化后
SELECT id, username FROM users WHERE age > 18;

-- 只查询需要的列
```

---

## 优化器提示（Hint）

### 1. MySQL 优化器提示

**索引提示**：
```sql
-- 强制使用索引
SELECT * FROM users USE INDEX (idx_username) WHERE username = 'alice';

-- 忽略索引
SELECT * FROM users IGNORE INDEX (idx_age) WHERE age > 18;

-- 强制使用特定索引
SELECT * FROM users FORCE INDEX (idx_username) WHERE username = 'alice';
```

**JOIN 提示**：
```sql
-- 强制 JOIN 顺序
SELECT /*+ JOIN_ORDER(t1, t2, t3) */ ...

-- 使用特定 JOIN 算法
SELECT /*+ NO_BNL(t1, t2) */ ...  -- 不使用 Block Nested Loop

-- MySQL 8.0+ Optimizer Hints
SELECT /*+ BKA(t1) */ ...  -- 使用 Batched Key Access
```

### 2. Oracle 优化器提示

```sql
-- 使用索引
SELECT /*+ INDEX(users idx_username) */ * FROM users WHERE username = 'alice';

-- 全表扫描
SELECT /*+ FULL(users) */ * FROM users WHERE id = 1;

-- JOIN 方法
SELECT /*+ USE_HASH(t1 t2) */ ...  -- Hash Join
SELECT /*+ USE_NL(t1 t2) */ ...     -- Nested Loop
SELECT /*+ USE_MERGE(t1 t2) */ ...  -- Merge Join

-- JOIN 顺序
SELECT /*+ LEADING(t1 t2 t3) */ ...

-- 并行查询
SELECT /*+ PARALLEL(users, 4) */ ...  -- 4 个并行进程
```

### 3. PostgreSQL 优化器提示

PostgreSQL 不直接支持 Hint，但可以调整优化器参数：

```sql
-- 临时调整优化器参数
SET enable_seqscan = off;  -- 禁用顺序扫描
SET enable_hashjoin = off;  -- 禁用 Hash Join

-- 执行查询
SELECT ...;

-- 恢复默认
RESET enable_seqscan;
RESET enable_hashjoin;

-- 或使用会话级别设置
SET LOCAL enable_seqscan = off;
```

**注意**：
- 提示应谨慎使用
- 可能绕过优化器，导致性能下降
- 数据变化后可能不再是最优方案
- 应优先优化 SQL 和索引

---

## 优化器限制与问题

### 1. 统计信息过期

```sql
-- 问题：统计信息不准确，优化器估算错误

-- 表初始：100 万行
ANALYZE TABLE orders;

-- 新增 900 万行
-- 统计信息仍显示 100 万行
-- 优化器选择错误的执行计划

-- 解决：定期更新统计信息
ANALYZE TABLE orders;
```

### 2. 相关性估算错误

```sql
-- 问题：多列相关，优化器假设独立

SELECT * FROM users WHERE city = 'Beijing' AND province = 'Beijing';

-- city 和 province 高度相关
-- 优化器假设独立，估算不准确

-- 解决：创建多列统计信息（PostgreSQL）
CREATE STATISTICS stat_city_province ON city, province FROM users;
```

### 3. 复杂表达式无法估算

```sql
-- 问题：复杂 WHERE 条件难以估算

SELECT * FROM users 
WHERE CONCAT(first_name, ' ', last_name) = 'Alice Wang';

-- 优化器无法准确估算
-- 可能选择全表扫描

-- 解决：简化查询或创建函数索引
```

### 4. JOIN 顺序选择失误

```sql
-- 问题：优化器选择错误的 JOIN 顺序

-- 实际：t1 很小，t2 很大
-- 但统计信息显示 t1 很大

-- 优化器可能选择 t2 驱动 t1（错误）

-- 解决：
-- 1. 更新统计信息
-- 2. 使用 JOIN 提示
SELECT /*+ LEADING(t1 t2) */ ...
```

---

## 查询优化技巧

### 1. 帮助优化器

**提供准确的统计信息**：
```sql
-- 定期 ANALYZE
ANALYZE TABLE users;

-- 数据倾斜时使用直方图
ANALYZE TABLE users UPDATE HISTOGRAM ON city;
```

**简化查询**：
```sql
-- 避免复杂表达式
-- 不好
WHERE YEAR(created_at) = 2024

-- 好
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
```

**合理使用索引**：
```sql
-- 创建支持查询的索引
CREATE INDEX idx_status_created ON orders(status, created_at);

-- 避免索引失效
-- 不好：函数导致索引失效
WHERE UPPER(username) = 'ALICE'

-- 好：使用函数索引
CREATE INDEX idx_upper_username ON users((UPPER(username)));
```

### 2. 理解优化器决策

**查看执行计划**：
```sql
EXPLAIN SELECT ...;

-- 理解优化器为什么选择这个计划
-- 是否使用索引
-- JOIN 顺序是否合理
-- 估算的行数是否准确
```

**对比实际执行**：
```sql
EXPLAIN ANALYZE SELECT ...;

-- 对比估算值和实际值
-- 发现估算偏差
-- 找出问题根源
```

---

## 生产环境案例

### 1. 统计信息导致的性能问题

**问题**：
```sql
-- 查询突然变慢
SELECT * FROM orders WHERE status = 'pending';

-- EXPLAIN 显示：全表扫描
-- 但 status = 'pending' 只有 1% 的数据

-- 原因：统计信息显示 50% 是 pending（过期）
-- 优化器认为全表扫描更快
```

**解决**：
```sql
-- 更新统计信息
ANALYZE TABLE orders;

-- EXPLAIN 显示：使用索引
-- 性能恢复
```

### 2. JOIN 顺序优化

**问题**：
```sql
-- 三表 JOIN 性能差
SELECT * FROM t1 
JOIN t2 ON t1.id = t2.t1_id
JOIN t3 ON t2.id = t3.t2_id
WHERE t1.status = 1;

-- EXPLAIN 显示：
-- 1. t2 (1000万行) 作为驱动表
-- 2. JOIN t1 (10万行)
-- 3. JOIN t3 (100万行)

-- 性能很差
```

**解决**：
```sql
-- 使用 STRAIGHT_JOIN 固定顺序
SELECT * FROM t1 STRAIGHT_JOIN t2 ON t1.id = t2.t1_id
STRAIGHT_JOIN t3 ON t2.id = t3.t2_id
WHERE t1.status = 1;

-- 或使用 JOIN 提示
SELECT /*+ LEADING(t1 t2 t3) */ ...

-- 结果：
-- 1. t1 过滤后 1000 行
-- 2. JOIN t2
-- 3. JOIN t3
-- 性能提升 100 倍
```

### 3. 子查询优化

**问题**：
```sql
-- 相关子查询，性能差
SELECT 
    u.username,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u;

-- 每个用户都执行一次子查询
-- 100 万用户 = 100 万次查询
```

**解决**：
```sql
-- 改为 LEFT JOIN
SELECT 
    u.username,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- 性能提升 1000 倍
```

---

## 优化器发展趋势

### 1. 自适应查询优化

```
- 运行时调整执行计划
- 根据实际数据分布调整
- 机器学习辅助优化
```

### 2. 向量化执行

```
- 批量处理数据
- 利用 CPU 向量指令
- 提升 OLAP 性能
```

### 3. 智能统计信息

```
- 自动检测数据倾斜
- 自动创建直方图
- 自动更新统计信息
```

---

## 参考资料

1. **经典论文**：
   - "Access Path Selection in a Relational Database Management System" (Selinger et al., 1979)
   - System R 优化器

2. **MySQL 官方文档**：
   - Query Optimizer: https://dev.mysql.com/doc/refman/8.0/en/optimizer.html

3. **Oracle 官方文档**：
   - SQL Tuning: https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/

4. **PostgreSQL 官方文档**：
   - Query Planning: https://www.postgresql.org/docs/current/planner-optimizer.html

5. **推荐书籍**：
   - 《数据库系统实现》
   - 《高性能MySQL》

6. **最佳实践**：
   - 定期更新统计信息
   - 理解执行计划
   - 谨慎使用优化器提示
   - 简化查询逻辑
   - 创建合适的索引

# 索引选择性与基数

## 概述

索引选择性（Index Selectivity）和基数（Cardinality）是衡量索引质量的重要指标。理解这两个概念有助于判断是否应该创建索引、选择哪些列创建索引，以及如何优化索引设计。

**核心概念**：
- **基数**：列中不重复值的数量
- **选择性**：不重复值数量占总行数的比例
- **高选择性**：区分度高，适合建索引
- **低选择性**：区分度低，不适合建索引

---

## 基数（Cardinality）

### 1. 基数的定义

```
基数 = 列中不重复值的数量

示例：
users 表有 10000 行数据

id 列：10000 个不同值 → 基数 = 10000
gender 列：2 个不同值（M/F） → 基数 = 2
city 列：50 个不同值 → 基数 = 50
status 列：3 个不同值（0/1/2） → 基数 = 3
```

### 2. 查看基数

**MySQL**：
```sql
-- 查看索引基数
SHOW INDEX FROM users;

-- 输出：
-- Table | Key_name    | Cardinality
-- users | PRIMARY     | 10000
-- users | idx_gender  | 2
-- users | idx_city    | 50
-- users | idx_status  | 3

-- Cardinality：优化器估算的不重复值数量
```

**手动计算基数**：
```sql
-- 计算列的基数
SELECT COUNT(DISTINCT gender) AS cardinality FROM users;
-- 结果：2

SELECT COUNT(DISTINCT city) AS cardinality FROM users;
-- 结果：50

SELECT COUNT(DISTINCT id) AS cardinality FROM users;
-- 结果：10000
```

**Oracle**：
```sql
-- 查看索引统计信息
SELECT 
    index_name,
    table_name,
    distinct_keys,
    num_rows
FROM user_indexes
WHERE table_name = 'USERS';

-- distinct_keys = 基数
```

**PostgreSQL**：
```sql
-- 查看统计信息
SELECT 
    tablename,
    attname,
    n_distinct,
    most_common_vals
FROM pg_stats
WHERE tablename = 'users';

-- n_distinct：
-- > 0：实际不重复值数量
-- < 0：不重复值占总行数的比例（负数）
```

### 3. 基数的重要性

**优化器使用基数**：
```
优化器根据基数估算查询成本：
- 基数高 → 选择性好 → 适合使用索引
- 基数低 → 选择性差 → 可能全表扫描更快

示例：
SELECT * FROM users WHERE id = 100;
-- id 基数 10000，选择性高，使用索引

SELECT * FROM users WHERE gender = 'M';
-- gender 基数 2，选择性低，可能全表扫描
```

---

## 索引选择性（Selectivity）

### 1. 选择性的定义

```
选择性 = 基数 / 总行数

取值范围：0 ~ 1
- 1：每行都不同（如主键）
- 0：所有行都相同

示例（总行数 10000）：
id 列：10000 / 10000 = 1.0 （选择性极高）
city 列：50 / 10000 = 0.005 （选择性较低）
gender 列：2 / 10000 = 0.0002 （选择性极低）
```

### 2. 计算选择性

```sql
-- 计算列的选择性
SELECT 
    COUNT(DISTINCT gender) / COUNT(*) AS selectivity
FROM users;
-- 结果：0.0002

SELECT 
    COUNT(DISTINCT city) / COUNT(*) AS selectivity
FROM users;
-- 结果：0.005

SELECT 
    COUNT(DISTINCT email) / COUNT(*) AS selectivity
FROM users;
-- 结果：1.0（假设 email 唯一）
```

### 3. 选择性阈值

**经验法则**：
```
选择性 > 0.05（5%）：适合建索引
选择性 < 0.05（5%）：不适合建索引（除非特殊场景）

示例：
email（1.0）  → 非常适合索引
username（0.95） → 非常适合索引
city（0.005）  → 不太适合索引
gender（0.0002） → 不适合索引
```

**特殊场景**：
```sql
-- 即使选择性低，如果查询只需要少量数据，也适合索引

-- 场景：只查询 1% 的数据
SELECT * FROM users WHERE status = 1;
-- 假设 status=1 只占 1% 的数据
-- 即使 status 基数只有 3，也适合建索引

-- 场景：配合其他条件
SELECT * FROM users WHERE city = 'Beijing' AND status = 1;
-- 联合索引 idx_city_status 仍然有效
```

---

## 索引区分度

### 1. 区分度的概念

```
区分度 = 选择性 × 100%

区分度越高，索引效果越好

分类：
90%+ ：非常好（主键、唯一索引）
50%-90%：好（适合建索引）
10%-50%：一般（根据查询模式决定）
<10%：差（不适合建索引）
```

### 2. 评估区分度

```sql
-- 评估多个列的区分度
SELECT 
    'id' AS column_name,
    COUNT(DISTINCT id) / COUNT(*) * 100 AS distinction_degree
FROM users

UNION ALL

SELECT 
    'username',
    COUNT(DISTINCT username) / COUNT(*) * 100
FROM users

UNION ALL

SELECT 
    'city',
    COUNT(DISTINCT city) / COUNT(*) * 100
FROM users

UNION ALL

SELECT 
    'gender',
    COUNT(DISTINCT gender) / COUNT(*) * 100
FROM users;

-- 结果：
-- column_name | distinction_degree
-- id          | 100.00
-- username    | 99.95
-- city        | 0.50
-- gender      | 0.02
```

### 3. 联合索引的区分度

```sql
-- 单列区分度
SELECT COUNT(DISTINCT city) / COUNT(*) * 100 FROM users;
-- 结果：0.5%

-- 两列组合区分度
SELECT COUNT(DISTINCT city, age) / COUNT(*) * 100 FROM users;
-- 结果：可能达到 10%

-- 三列组合区分度
SELECT COUNT(DISTINCT city, age, gender) / COUNT(*) * 100 FROM users;
-- 结果：可能达到 30%

-- 结论：
-- 单列区分度低，但组合后区分度可以接受
-- 适合创建联合索引
```

---

## 统计信息

### 1. 统计信息的作用

```
数据库维护统计信息，用于：
- 估算查询成本
- 选择最优执行计划
- 决定是否使用索引

统计信息包括：
- 表的行数
- 列的基数
- 数据分布（直方图）
- 索引的叶子节点数
```

### 2. 更新统计信息

**MySQL**：
```sql
-- 分析表，更新统计信息
ANALYZE TABLE users;

-- 查看统计信息
SHOW TABLE STATUS LIKE 'users'\G

-- 查看索引统计
SHOW INDEX FROM users;
```

**Oracle**：
```sql
-- 收集表统计信息
EXEC DBMS_STATS.GATHER_TABLE_STATS('SCHEMA_NAME', 'USERS');

-- 收集索引统计信息
EXEC DBMS_STATS.GATHER_INDEX_STATS('SCHEMA_NAME', 'IDX_USERNAME');

-- 查看统计信息
SELECT 
    table_name,
    num_rows,
    blocks,
    avg_row_len,
    last_analyzed
FROM user_tables
WHERE table_name = 'USERS';
```

**PostgreSQL**：
```sql
-- 收集统计信息
ANALYZE users;

-- 查看统计信息
SELECT * FROM pg_stats WHERE tablename = 'users';

-- 查看表统计
SELECT 
    relname,
    n_live_tup,
    n_dead_tup,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE relname = 'users';
```

### 3. 过期统计信息的影响

```sql
-- 问题：统计信息过期

-- 初始状态：
-- users 表 1000 行，gender='M' 占 50%

-- 创建索引
CREATE INDEX idx_gender ON users(gender);

-- 收集统计信息
ANALYZE TABLE users;

-- 数据变化：
-- 新增 100 万行数据，gender='M' 占 1%

-- 但统计信息未更新：
-- 优化器仍认为 gender='M' 占 50%
-- 可能错误地使用索引

-- 解决方案：定期更新统计信息
ANALYZE TABLE users;
```

---

## 直方图（Histogram）

### 1. 直方图的作用

```
直方图：记录数据分布的统计信息

作用：
- 更精确地估算查询成本
- 处理数据倾斜
- 优化器做出更好的选择

类型：
- 频率直方图：记录每个值的频率
- 等高直方图：将数据分成N个桶
```

### 2. MySQL 直方图（8.0+）

```sql
-- 创建直方图
ANALYZE TABLE users UPDATE HISTOGRAM ON city, age;

-- 查看直方图
SELECT 
    schema_name,
    table_name,
    column_name,
    JSON_EXTRACT(histogram, '$.buckets') AS buckets
FROM information_schema.column_statistics
WHERE table_name = 'users';

-- 删除直方图
ANALYZE TABLE users DROP HISTOGRAM ON city;
```

**示例**：
```sql
-- 数据分布不均匀
-- Beijing: 50%
-- Shanghai: 30%
-- Other cities: 20%

-- 没有直方图：
-- 优化器假设每个城市平均分布
SELECT * FROM users WHERE city = 'Beijing';
-- 可能错误地选择全表扫描

-- 有直方图：
-- 优化器知道 Beijing 占 50%
-- 选择全表扫描（正确）

SELECT * FROM users WHERE city = 'Guangzhou';
-- 优化器知道 Guangzhou 很少
-- 选择索引（正确）
```

### 3. Oracle 直方图

```sql
-- 创建直方图
EXEC DBMS_STATS.GATHER_TABLE_STATS(
    ownname => 'SCHEMA_NAME',
    tabname => 'USERS',
    method_opt => 'FOR COLUMNS city SIZE 50'
);

-- SIZE：直方图的桶数
-- AUTO：自动决定是否创建直方图

-- 查看直方图
SELECT 
    column_name,
    histogram,
    num_buckets,
    num_distinct
FROM user_tab_columns
WHERE table_name = 'USERS' AND histogram != 'NONE';
```

---

## 索引设计决策

### 1. 是否创建索引的判断

**适合创建索引**：
```sql
-- ✅ 高选择性列
CREATE INDEX idx_email ON users(email);
-- 选择性：99%+

-- ✅ WHERE 条件频繁使用
CREATE INDEX idx_status ON orders(status);
-- 即使选择性低，但查询频繁且只返回少量数据

-- ✅ JOIN 连接列
CREATE INDEX idx_user_id ON orders(user_id);

-- ✅ ORDER BY 排序列
CREATE INDEX idx_created_at ON orders(created_at);
```

**不适合创建索引**：
```sql
-- ❌ 低选择性且全表扫描更快
-- gender 基数 2，总行数 100万
CREATE INDEX idx_gender ON users(gender);
-- 查询 gender='M' 返回 50万行，全表扫描更快

-- ❌ 很少使用的列
CREATE INDEX idx_rarely_used ON users(rarely_used);

-- ❌ 频繁更新的列
CREATE INDEX idx_updated_at ON users(updated_at);
-- 每次更新都需维护索引

-- ❌ 小表（几百行）
CREATE INDEX idx_small_table ON small_table(column);
-- 全表扫描更快
```

### 2. 联合索引列顺序

**原则**：
```
1. 选择性高的列在前
2. 查询频率高的列在前
3. 精确匹配的列在范围查询列之前
4. 考虑最左前缀原则
```

**示例**：
```sql
-- 查询场景：
-- WHERE city = ? AND age > ? AND gender = ?

-- 选择性：
-- city: 0.5%
-- age: 50%
-- gender: 0.02%

-- 方案1：按选择性排序
CREATE INDEX idx_age_city_gender ON users(age, city, gender);
-- 不好：age 是范围查询，city 和 gender 无法使用

-- 方案2：精确匹配在前
CREATE INDEX idx_city_gender_age ON users(city, gender, age);
-- 好：city 和 gender 精确匹配，age 范围查询在后

-- 方案3：考虑查询频率
-- 如果 WHERE city = ? 查询非常频繁
CREATE INDEX idx_city_age ON users(city, age);
-- 牺牲一点组合区分度，换取更广的适用性
```

---

## 监控索引效率

### 1. 索引使用情况

**MySQL**：
```sql
-- 查看索引使用统计
SELECT 
    object_schema,
    object_name,
    index_name,
    count_star,
    count_read,
    count_insert,
    count_update,
    count_delete
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'mydb'
ORDER BY count_star DESC;

-- 查找未使用的索引
SELECT 
    object_schema,
    object_name,
    index_name
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE index_name IS NOT NULL
    AND count_star = 0
    AND object_schema = 'mydb';
```

**Oracle**：
```sql
-- 监控索引使用
ALTER INDEX idx_username MONITORING USAGE;

-- 查看使用情况
SELECT 
    index_name,
    table_name,
    monitoring,
    used,
    start_monitoring,
    end_monitoring
FROM v$object_usage;

-- 停止监控
ALTER INDEX idx_username NOMONITORING USAGE;
```

**PostgreSQL**：
```sql
-- 查看索引使用统计
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 查找未使用的索引
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND indexrelname NOT LIKE 'pg_toast%';
```

### 2. 索引命中率

```sql
-- 计算索引命中率
SELECT 
    index_name,
    count_read / NULLIF(count_read + count_fetch, 0) * 100 AS hit_ratio
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'mydb';

-- 命中率 > 80%：索引效果好
-- 命中率 < 50%：考虑优化或删除索引
```

---

## 生产实践示例

### 1. 评估是否创建索引

```sql
-- 评估 status 列是否适合创建索引

-- 步骤1：查看基数
SELECT COUNT(DISTINCT status) AS cardinality FROM orders;
-- 结果：5（5个不同状态）

-- 步骤2：查看总行数
SELECT COUNT(*) AS total_rows FROM orders;
-- 结果：1000000

-- 步骤3：计算选择性
SELECT COUNT(DISTINCT status) / COUNT(*) AS selectivity FROM orders;
-- 结果：0.000005（0.0005%）

-- 步骤4：查看数据分布
SELECT status, COUNT(*) AS count, COUNT(*) / 1000000 * 100 AS percentage
FROM orders
GROUP BY status;

-- 结果：
-- status | count  | percentage
-- 0      | 10000  | 1%
-- 1      | 900000 | 90%
-- 2      | 80000  | 8%
-- 3      | 9000   | 0.9%
-- 4      | 1000   | 0.1%

-- 结论：
-- - 选择性极低（0.0005%）
-- - 但如果经常查询 status=0 或 status=4（少量数据）
-- - 可以创建索引
CREATE INDEX idx_status ON orders(status);

-- 或使用部分索引（PostgreSQL）
CREATE INDEX idx_status_pending ON orders(status) WHERE status IN (0, 3, 4);
```

### 2. 优化低区分度索引

```sql
-- 问题：city 列区分度低（50个城市，100万用户）

-- 方案1：单列索引（效果一般）
CREATE INDEX idx_city ON users(city);
-- 选择性：0.005%

-- 方案2：联合索引（提高区分度）
CREATE INDEX idx_city_age ON users(city, age);
-- 组合选择性：可能达到 10%

-- 方案3：加入更多列
CREATE INDEX idx_city_age_gender ON users(city, age, gender);
-- 进一步提高区分度

-- 权衡：
-- - 索引越长，维护成本越高
-- - 根据实际查询模式选择
```

### 3. 定期维护统计信息

```sql
-- MySQL：定期 ANALYZE
-- 建议：每天或每周
ANALYZE TABLE orders;

-- Oracle：自动统计收集
-- 检查自动统计任务
SELECT 
    job_name,
    state,
    last_start_date,
    next_run_date
FROM dba_scheduler_jobs
WHERE job_name LIKE 'GATHER_STATS%';

-- PostgreSQL：自动 ANALYZE
-- 检查 autovacuum 配置
SHOW autovacuum;
```

---

## 易错点与边界

### 1. 误判低基数列不能建索引

```sql
-- 错误认知：gender 基数只有2，不能建索引

-- 实际：取决于查询模式
-- 如果只查询少量数据，仍然有效
SELECT * FROM users WHERE gender = 'M' AND vip_level > 5;
-- 如果 vip_level > 5 只占 1%，索引仍然高效

-- 联合索引
CREATE INDEX idx_gender_vip ON users(gender, vip_level);
```

### 2. 忽略数据倾斜

```sql
-- 数据倾斜：某些值占大部分数据

-- city 列：
-- Beijing: 80% 的用户
-- Other: 20% 的用户

-- 查询 Beijing：应该全表扫描
SELECT * FROM users WHERE city = 'Beijing';

-- 查询其他城市：应该使用索引
SELECT * FROM users WHERE city = 'Shanghai';

-- 解决方案：创建直方图
ANALYZE TABLE users UPDATE HISTOGRAM ON city;
```

### 3. 统计信息过期

```sql
-- 初始：100万行
ANALYZE TABLE users;

-- 新增 900万行
-- 但未更新统计信息

-- 优化器仍认为只有 100万行
-- 执行计划可能错误

-- 解决：定期更新
ANALYZE TABLE users;
```

---

## 参考资料

1. **MySQL 官方文档**：
   - ANALYZE TABLE: https://dev.mysql.com/doc/refman/8.0/en/analyze-table.html
   - Histogram Statistics: https://dev.mysql.com/doc/refman/8.0/en/optimizer-statistics.html

2. **Oracle 官方文档**：
   - DBMS_STATS: https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_STATS.html

3. **PostgreSQL 官方文档**：
   - Statistics: https://www.postgresql.org/docs/current/planner-stats.html

4. **最佳实践**：
   - 选择性 > 5% 适合建索引
   - 定期更新统计信息
   - 使用直方图处理数据倾斜
   - 监控索引使用情况
   - 删除未使用的索引

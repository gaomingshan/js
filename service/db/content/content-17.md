# 索引失效场景

## 概述

索引失效是指虽然创建了索引，但查询时无法使用索引，导致全表扫描，严重影响性能。理解索引失效的常见场景，避免编写导致索引失效的 SQL，是数据库优化的重要技能。

**常见失效场景**：
- 对索引列使用函数或表达式
- 隐式类型转换
- LIKE 前缀匹配问题
- OR 条件使用不当
- NOT、!=、<> 操作符
- NULL 值处理
- 联合索引最左前缀破坏

---

## 函数操作导致索引失效

### 1. 索引列上使用函数

```sql
-- 创建索引
CREATE INDEX idx_username ON users(username);

-- ❌ 索引失效：对索引列使用函数
SELECT * FROM users WHERE UPPER(username) = 'ALICE';
SELECT * FROM users WHERE SUBSTRING(username, 1, 3) = 'ali';
SELECT * FROM users WHERE LENGTH(username) > 5;

-- EXPLAIN：
-- type: ALL（全表扫描）
-- key: NULL

-- 原因：索引存储的是原始值，不是函数计算后的值
```

**解决方案**：

**方案1：函数索引**（MySQL 8.0+, Oracle, PostgreSQL）
```sql
-- MySQL 8.0+
CREATE INDEX idx_upper_username ON users((UPPER(username)));
SELECT * FROM users WHERE UPPER(username) = 'ALICE';
-- 可以使用索引

-- Oracle
CREATE INDEX idx_upper_username ON users(UPPER(username));
SELECT * FROM users WHERE UPPER(username) = 'ALICE';

-- PostgreSQL
CREATE INDEX idx_upper_username ON users(UPPER(username));
SELECT * FROM users WHERE UPPER(username) = 'ALICE';
```

**方案2：虚拟列**（MySQL 5.7+）
```sql
-- 添加虚拟列
ALTER TABLE users ADD COLUMN username_upper VARCHAR(50) 
AS (UPPER(username)) STORED;

-- 创建索引
CREATE INDEX idx_username_upper ON users(username_upper);

-- 查询
SELECT * FROM users WHERE username_upper = 'ALICE';
-- 使用索引
```

**方案3：修改查询逻辑**
```sql
-- 不使用函数
SELECT * FROM users WHERE username = 'alice';
-- 应用层处理大小写

-- 或使用 COLLATE
SELECT * FROM users WHERE username COLLATE utf8mb4_general_ci = 'alice';
```

### 2. 日期函数导致索引失效

```sql
-- 索引
CREATE INDEX idx_created_at ON orders(created_at);

-- ❌ 索引失效
SELECT * FROM orders WHERE YEAR(created_at) = 2024;
SELECT * FROM orders WHERE DATE(created_at) = '2024-03-16';
SELECT * FROM orders WHERE DATE_FORMAT(created_at, '%Y-%m') = '2024-03';

-- ✅ 使用索引：改为范围查询
SELECT * FROM orders 
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

SELECT * FROM orders 
WHERE created_at >= '2024-03-16' AND created_at < '2024-03-17';

SELECT * FROM orders 
WHERE created_at >= '2024-03-01' AND created_at < '2024-04-01';
```

### 3. 数学运算导致索引失效

```sql
-- 索引
CREATE INDEX idx_price ON products(price);

-- ❌ 索引失效
SELECT * FROM products WHERE price * 0.9 > 100;
SELECT * FROM products WHERE price + 10 = 110;

-- ✅ 使用索引：移除运算
SELECT * FROM products WHERE price > 100 / 0.9;
SELECT * FROM products WHERE price = 110 - 10;
```

---

## 隐式类型转换

### 1. 字符串转数字

```sql
-- 表结构
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    phone VARCHAR(20),  -- 字符串类型
    INDEX idx_phone (phone)
);

-- ❌ 索引失效：字符串列与数字比较
SELECT * FROM users WHERE phone = 13800138000;
-- MySQL 将 phone 转换为数字：CAST(phone AS UNSIGNED)
-- 相当于：WHERE CAST(phone AS UNSIGNED) = 13800138000
-- 索引失效

-- ✅ 使用索引：使用字符串
SELECT * FROM users WHERE phone = '13800138000';
```

### 2. 数字转字符串

```sql
-- 表结构
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,  -- 数字类型
    INDEX idx_user_id (user_id)
);

-- ✅ 可以使用索引：数字列与字符串比较
SELECT * FROM orders WHERE user_id = '100';
-- MySQL 将字符串转换为数字：CAST('100' AS SIGNED)
-- 相当于：WHERE user_id = 100
-- 可以使用索引

-- 规则：
-- 字符串列 vs 数字值 → 索引失效（转换列）
-- 数字列 vs 字符串值 → 可以使用索引（转换值）
```

### 3. 字符集不同导致失效

```sql
-- 表1
CREATE TABLE t1 (
    name VARCHAR(50) CHARACTER SET utf8mb4
);

-- 表2
CREATE TABLE t2 (
    name VARCHAR(50) CHARACTER SET latin1
);

-- ❌ JOIN 可能失效
SELECT * FROM t1 JOIN t2 ON t1.name = t2.name;
-- 需要字符集转换，可能导致索引失效

-- ✅ 统一字符集
ALTER TABLE t2 MODIFY name VARCHAR(50) CHARACTER SET utf8mb4;
```

---

## LIKE 模糊查询

### 1. 前缀匹配 vs 后缀匹配

```sql
-- 索引
CREATE INDEX idx_username ON users(username);

-- ✅ 可以使用索引：前缀匹配
SELECT * FROM users WHERE username LIKE 'alice%';
-- 索引可以快速定位以 'alice' 开头的范围

-- ❌ 索引失效：后缀匹配
SELECT * FROM users WHERE username LIKE '%alice';
-- 无法利用 B+Tree 索引的有序性

-- ❌ 索引失效：中间匹配
SELECT * FROM users WHERE username LIKE '%alice%';
```

### 2. LIKE 优化方案

**方案1：全文索引**
```sql
-- 创建全文索引
CREATE FULLTEXT INDEX ft_username ON users(username);

-- 全文搜索
SELECT * FROM users WHERE MATCH(username) AGAINST('alice' IN BOOLEAN MODE);
```

**方案2：反向索引**（PostgreSQL）
```sql
-- 创建反向列
ALTER TABLE users ADD COLUMN username_reverse VARCHAR(50);
UPDATE users SET username_reverse = REVERSE(username);

-- 创建索引
CREATE INDEX idx_username_reverse ON users(username_reverse);

-- 后缀搜索
SELECT * FROM users WHERE username_reverse LIKE REVERSE('alice') || '%';
-- 相当于 username LIKE '%alice'
```

**方案3：ElasticSearch**
```
对于复杂的模糊搜索，使用专门的搜索引擎
```

---

## OR 条件

### 1. OR 连接不同列

```sql
-- 索引
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);

-- ❌ 可能索引失效或性能差
SELECT * FROM users WHERE username = 'alice' OR email = 'alice@example.com';

-- 优化器可能使用索引合并（Index Merge）
-- 但性能不如单一索引

-- ✅ 改写为 UNION
SELECT * FROM users WHERE username = 'alice'
UNION
SELECT * FROM users WHERE email = 'alice@example.com';
```

### 2. OR 连接相同列

```sql
-- ✅ 可以使用索引
SELECT * FROM users WHERE city = 'Beijing' OR city = 'Shanghai';

-- 等价于（更好）
SELECT * FROM users WHERE city IN ('Beijing', 'Shanghai');
```

### 3. OR 与 AND 混合

```sql
-- 索引：idx_city_age (city, age)

-- ❌ 索引可能失效
SELECT * FROM users WHERE city = 'Beijing' OR age > 18;
-- OR 的两个条件无法同时使用一个索引

-- ✅ 拆分查询
SELECT * FROM users WHERE city = 'Beijing'
UNION
SELECT * FROM users WHERE age > 18;
```

---

## NOT、!=、<> 操作符

### 1. 不等于操作

```sql
-- 索引
CREATE INDEX idx_status ON orders(status);

-- ❌ 可能不使用索引
SELECT * FROM orders WHERE status != 1;
SELECT * FROM orders WHERE status <> 1;

-- 原因：
-- 不等于可能返回大量数据
-- 优化器可能选择全表扫描

-- ✅ 改写为 IN（如果值域小）
SELECT * FROM orders WHERE status IN (0, 2, 3, 4);
```

### 2. NOT IN

```sql
-- ❌ 通常不使用索引
SELECT * FROM orders WHERE user_id NOT IN (1, 2, 3);

-- ✅ 改写为 NOT EXISTS
SELECT * FROM orders o
WHERE NOT EXISTS (
    SELECT 1 FROM (SELECT 1 AS id UNION SELECT 2 UNION SELECT 3) t
    WHERE t.id = o.user_id
);

-- 或使用 LEFT JOIN
SELECT o.* FROM orders o
LEFT JOIN (SELECT 1 AS id UNION SELECT 2 UNION SELECT 3) t ON o.user_id = t.id
WHERE t.id IS NULL;
```

### 3. NOT LIKE

```sql
-- ❌ 索引失效
SELECT * FROM users WHERE username NOT LIKE 'admin%';

-- 如果需要，只能全表扫描
```

---

## NULL 值处理

### 1. IS NULL 查询

```sql
-- 索引
CREATE INDEX idx_email ON users(email);

-- ✅ 可以使用索引（取决于 NULL 值数量）
SELECT * FROM users WHERE email IS NULL;

-- MySQL：索引可以存储 NULL
-- Oracle：普通索引不存储 NULL，需要特殊处理
```

### 2. IS NOT NULL

```sql
-- ✅ 通常可以使用索引
SELECT * FROM users WHERE email IS NOT NULL;

-- 如果 NULL 值很少，可以高效使用索引
-- 如果 NULL 值很多，可能全表扫描
```

### 3. NULL 值比较

```sql
-- ❌ 错误：NULL 无法用 = 比较
SELECT * FROM users WHERE email = NULL;  -- 永远返回空结果

-- ✅ 正确：使用 IS NULL
SELECT * FROM users WHERE email IS NULL;

-- ❌ 索引可能失效
SELECT * FROM users WHERE COALESCE(email, 'default') = 'default';
-- 使用了函数，索引失效
```

---

## 联合索引失效

### 1. 破坏最左前缀原则

```sql
-- 索引：idx_city_age_gender (city, age, gender)

-- ✅ 使用索引
SELECT * FROM users WHERE city = 'Beijing';
SELECT * FROM users WHERE city = 'Beijing' AND age > 18;
SELECT * FROM users WHERE city = 'Beijing' AND age > 18 AND gender = 'M';

-- ❌ 索引失效：跳过最左列
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE gender = 'M';
SELECT * FROM users WHERE age > 18 AND gender = 'M';
```

### 2. 范围查询后的列失效

```sql
-- 索引：idx_city_age_gender (city, age, gender)

-- ✅ city 和 age 使用索引
SELECT * FROM users WHERE city = 'Beijing' AND age > 18 AND gender = 'M';
-- city：精确匹配，使用索引
-- age：范围查询，使用索引
-- gender：范围查询后，无法使用索引

-- EXPLAIN：
-- key_len：显示只使用了 city 和 age 的索引长度
```

### 3. 索引列顺序不匹配

```sql
-- 索引：idx_a_b_c (a, b, c)

-- ✅ 可以使用索引（优化器会调整顺序）
SELECT * FROM t WHERE c = 3 AND a = 1 AND b = 2;

-- ✅ 部分使用索引
SELECT * FROM t WHERE a = 1 AND c = 3;
-- 只使用 a 列的索引
```

---

## 其他失效场景

### 1. 数据量过小

```sql
-- 表只有 100 行数据
SELECT * FROM small_table WHERE id > 50;

-- 优化器可能选择全表扫描
-- 原因：表太小，全表扫描更快
```

### 2. 返回数据过多

```sql
-- 表有 100 万行
SELECT * FROM users WHERE age > 18;
-- 如果结果返回 90 万行（90%）

-- 优化器可能选择全表扫描
-- 原因：返回数据太多，全表扫描更快
```

### 3. 索引列参与计算

```sql
-- ❌ 索引失效
SELECT * FROM products WHERE price - discount > 100;

-- ✅ 使用索引
SELECT * FROM products WHERE price > 100 + discount;
-- 但如果 discount 也是列，仍然失效

-- ✅ 最好的方式
ALTER TABLE products ADD COLUMN final_price DECIMAL(10,2) 
AS (price - discount) STORED;
CREATE INDEX idx_final_price ON products(final_price);
```

### 4. ORDER BY 不使用索引

```sql
-- 索引：idx_city (city)

-- ❌ 排序无法使用索引
SELECT * FROM users WHERE city = 'Beijing' ORDER BY age;
-- Using filesort

-- ✅ 排序使用索引
CREATE INDEX idx_city_age ON users(city, age);
SELECT * FROM users WHERE city = 'Beijing' ORDER BY age;
-- 无 Using filesort
```

---

## 索引失效检测

### 1. EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM users WHERE UPPER(username) = 'ALICE'\G

-- 关键字段：
-- type: ALL（全表扫描）
-- possible_keys: NULL
-- key: NULL（未使用索引）
-- rows: 1000000（扫描行数）
-- Extra: Using where（只能用 WHERE 过滤）
```

### 2. 慢查询日志

```sql
-- 启用慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过1秒记录

-- 查看慢查询
-- Linux: /var/log/mysql/slow.log
-- 分析慢查询找出索引失效的 SQL
```

### 3. 性能监控

```sql
-- 查看表扫描情况
SELECT 
    table_schema,
    table_name,
    rows_examined,
    rows_sent
FROM sys.statement_analysis
WHERE table_schema = 'mydb'
ORDER BY rows_examined DESC;

-- rows_examined 远大于 rows_sent：可能索引失效
```

---

## 避免索引失效的最佳实践

### 1. 编码规范

```sql
-- ✅ 好的实践
-- 1. 不在索引列上使用函数
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'

-- 2. 避免隐式转换
WHERE user_id = 100  -- 而非 '100'

-- 3. 前缀匹配
WHERE username LIKE 'alice%'  -- 而非 '%alice%'

-- 4. 使用 IN 代替 OR
WHERE city IN ('Beijing', 'Shanghai')  -- 而非 OR

-- 5. 等值条件在前
WHERE city = 'Beijing' AND age > 18  -- city 精确匹配在前
```

### 2. 索引设计

```sql
-- 高频查询：WHERE city = ? AND age > ?
CREATE INDEX idx_city_age ON users(city, age);
-- 精确匹配列在前，范围查询列在后

-- 如果经常使用函数
CREATE INDEX idx_upper_username ON users((UPPER(username)));

-- 考虑覆盖索引
CREATE INDEX idx_city_age_gender ON users(city, age, gender);
```

### 3. 代码审查检查点

```
□ 索引列是否使用了函数？
□ 是否有隐式类型转换？
□ LIKE 是否前缀匹配？
□ OR 条件是否优化？
□ 联合索引是否遵循最左前缀？
□ WHERE 和 ORDER BY 是否都能用索引？
□ 是否有不必要的 SELECT *？
```

---

## 生产环境案例

### 1. 案例：日期查询索引失效

**问题**：
```sql
-- 慢查询
SELECT * FROM orders 
WHERE DATE(created_at) = '2024-03-16';
-- 执行时间：5秒，扫描100万行
```

**分析**：
```sql
EXPLAIN SELECT * FROM orders WHERE DATE(created_at) = '2024-03-16';
-- type: ALL
-- key: NULL
-- rows: 1000000
-- Extra: Using where
```

**优化**：
```sql
-- 改为范围查询
SELECT * FROM orders 
WHERE created_at >= '2024-03-16' AND created_at < '2024-03-17';
-- 执行时间：0.1秒，扫描1000行
-- type: range
-- key: idx_created_at
```

### 2. 案例：隐式转换

**问题**：
```sql
-- 表结构
CREATE TABLE users (
    phone VARCHAR(20),
    INDEX idx_phone (phone)
);

-- 慢查询
SELECT * FROM users WHERE phone = 13800138000;
-- 执行时间：3秒
```

**分析**：
```sql
EXPLAIN SELECT * FROM users WHERE phone = 13800138000;
-- type: ALL（全表扫描）
-- Extra: Using where
-- 隐式转换：CAST(phone AS UNSIGNED) = 13800138000
```

**优化**：
```sql
SELECT * FROM users WHERE phone = '13800138000';
-- 执行时间：0.01秒
-- type: ref
-- key: idx_phone
```

### 3. 案例：联合索引失效

**问题**：
```sql
-- 索引
CREATE INDEX idx_city_age ON users(city, age);

-- 慢查询
SELECT * FROM users WHERE age > 18;
-- 索引失效
```

**优化**：
```sql
-- 方案1：调整索引顺序（如果age查询频繁）
CREATE INDEX idx_age_city ON users(age, city);

-- 方案2：单独创建索引
CREATE INDEX idx_age ON users(age);

-- 方案3：使用覆盖索引减少回表
CREATE INDEX idx_age_id ON users(age, id);
SELECT id FROM users WHERE age > 18;
```

---

## 总结表：索引失效场景

| 场景 | 示例 | 解决方案 |
|------|------|----------|
| 索引列使用函数 | `WHERE YEAR(date) = 2024` | 改为范围查询或函数索引 |
| 隐式类型转换 | `WHERE varchar_col = 123` | 使用正确类型 |
| LIKE 后缀匹配 | `WHERE col LIKE '%abc'` | 全文索引或搜索引擎 |
| OR 不同列 | `WHERE a=1 OR b=2` | UNION 或索引合并 |
| NOT/!= | `WHERE col != 1` | 改为 IN 或范围查询 |
| 破坏最左前缀 | 跳过联合索引最左列 | 调整查询或索引 |
| 范围后的列 | 联合索引范围查询后的列 | 调整列顺序 |
| 索引列计算 | `WHERE col + 1 = 10` | 移动计算到右侧 |

---

## 参考资料

1. **MySQL 官方文档**：
   - Index Optimization: https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html
   - Type Conversion: https://dev.mysql.com/doc/refman/8.0/en/type-conversion.html

2. **最佳实践**：
   - 避免在索引列上使用函数
   - 注意隐式类型转换
   - LIKE 使用前缀匹配
   - 理解联合索引最左前缀原则
   - 使用 EXPLAIN 分析执行计划
   - 定期审查慢查询日志

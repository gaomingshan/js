# DQL 数据查询语言基础

## 概述

DQL（Data Query Language，数据查询语言）是 SQL 中使用最频繁的部分，主要用于从数据库中检索数据。掌握 DQL 是数据库应用开发的基础，也是 SQL 优化的重点领域。

**核心关键字**：
- **SELECT**：指定要查询的列
- **FROM**：指定数据来源表
- **WHERE**：过滤条件
- **GROUP BY**：分组聚合
- **HAVING**：分组后过滤
- **ORDER BY**：排序
- **LIMIT/OFFSET**：分页

---

## 核心概念

### 1. SELECT 基础

#### 查询所有列

```sql
-- 查询所有列（不推荐生产环境使用）
SELECT * FROM users;

-- 明确指定列名（推荐）
SELECT id, username, email, created_at FROM users;
```

#### 列别名

```sql
-- 使用 AS 关键字
SELECT username AS name, email AS mail FROM users;

-- 省略 AS
SELECT username name, email mail FROM users;

-- 别名包含空格或特殊字符
SELECT username AS "User Name", email AS `E-Mail` FROM users;
```

#### 计算列

```sql
-- 算术运算
SELECT 
    username,
    price,
    quantity,
    price * quantity AS total_price
FROM order_items;

-- 字符串拼接
-- MySQL
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users;

-- Oracle
SELECT first_name || ' ' || last_name AS full_name FROM users;

-- PostgreSQL（支持两种）
SELECT first_name || ' ' || last_name AS full_name FROM users;
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users;
```

#### DISTINCT 去重

```sql
-- 去除重复行
SELECT DISTINCT city FROM users;

-- 多列去重
SELECT DISTINCT city, country FROM users;

-- 统计不重复值的数量
SELECT COUNT(DISTINCT city) FROM users;
```

### 2. WHERE 条件过滤

#### 比较运算符

```sql
-- 等于
SELECT * FROM users WHERE age = 25;

-- 不等于
SELECT * FROM users WHERE age != 25;
SELECT * FROM users WHERE age <> 25;

-- 大于、小于
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE age <= 65;

-- 范围查询
SELECT * FROM users WHERE age >= 18 AND age <= 65;
```

#### BETWEEN 范围

```sql
-- 包含边界值
SELECT * FROM users WHERE age BETWEEN 18 AND 65;

-- 等价于
SELECT * FROM users WHERE age >= 18 AND age <= 65;

-- NOT BETWEEN
SELECT * FROM users WHERE age NOT BETWEEN 18 AND 65;
```

#### IN 列表

```sql
-- 在列表中
SELECT * FROM users WHERE city IN ('Beijing', 'Shanghai', 'Guangzhou');

-- NOT IN
SELECT * FROM users WHERE city NOT IN ('Beijing', 'Shanghai');

-- 使用子查询
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
```

#### LIKE 模糊查询

```sql
-- % 匹配任意字符（0个或多个）
SELECT * FROM users WHERE username LIKE 'admin%';  -- admin开头
SELECT * FROM users WHERE username LIKE '%admin';  -- admin结尾
SELECT * FROM users WHERE username LIKE '%admin%'; -- 包含admin

-- _ 匹配单个字符
SELECT * FROM users WHERE username LIKE 'user_';   -- user1, user2等
SELECT * FROM users WHERE phone LIKE '138____5678'; -- 138开头，5678结尾的11位

-- 转义特殊字符
SELECT * FROM users WHERE email LIKE '%\_%' ESCAPE '\';  -- 查找包含下划线的邮箱
```

#### NULL 值处理

```sql
-- 判断 NULL
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;

-- 错误写法（不会返回任何结果）
SELECT * FROM users WHERE email = NULL;  -- 错误
SELECT * FROM users WHERE email != NULL; -- 错误

-- COALESCE：返回第一个非 NULL 值
SELECT username, COALESCE(email, 'no-email@example.com') AS email FROM users;

-- IFNULL/ISNULL/NVL（不同数据库）
SELECT username, IFNULL(email, 'N/A') FROM users;        -- MySQL
SELECT username, NVL(email, 'N/A') FROM users;           -- Oracle
SELECT username, COALESCE(email, 'N/A') FROM users;      -- PostgreSQL/通用
```

#### 逻辑运算符

```sql
-- AND
SELECT * FROM users WHERE age > 18 AND city = 'Beijing';

-- OR
SELECT * FROM users WHERE city = 'Beijing' OR city = 'Shanghai';

-- NOT
SELECT * FROM users WHERE NOT (age < 18);

-- 优先级：NOT > AND > OR
SELECT * FROM users 
WHERE age > 18 AND city = 'Beijing' OR country = 'USA';
-- 等价于：(age > 18 AND city = 'Beijing') OR country = 'USA'

-- 使用括号明确优先级
SELECT * FROM users 
WHERE age > 18 AND (city = 'Beijing' OR country = 'USA');
```

### 3. 聚合函数

#### 常用聚合函数

```sql
-- COUNT：计数
SELECT COUNT(*) FROM users;                    -- 所有行
SELECT COUNT(email) FROM users;                -- 非 NULL email
SELECT COUNT(DISTINCT city) FROM users;        -- 不重复的城市数

-- SUM：求和
SELECT SUM(amount) FROM orders;

-- AVG：平均值
SELECT AVG(age) FROM users;

-- MAX/MIN：最大值/最小值
SELECT MAX(age), MIN(age) FROM users;

-- 组合使用
SELECT 
    COUNT(*) AS total_users,
    AVG(age) AS avg_age,
    MIN(age) AS min_age,
    MAX(age) AS max_age
FROM users;
```

#### 聚合函数与 NULL

```sql
-- COUNT(*) 包含 NULL 行
SELECT COUNT(*) FROM users;           -- 10

-- COUNT(column) 不包含 NULL
SELECT COUNT(email) FROM users;       -- 8（假设2个NULL）

-- SUM/AVG 忽略 NULL
SELECT SUM(amount) FROM orders;       -- NULL值不参与计算
```

### 4. GROUP BY 分组

#### 基础分组

```sql
-- 按城市分组，统计每个城市的用户数
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city;

-- 按多个字段分组
SELECT city, country, COUNT(*) AS user_count
FROM users
GROUP BY city, country;
```

#### GROUP BY 规则

```sql
-- 错误：SELECT 中的列必须在 GROUP BY 中或是聚合函数
SELECT city, username, COUNT(*) 
FROM users 
GROUP BY city;  -- 错误：username 不在 GROUP BY 中

-- 正确写法
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city;
```

#### HAVING 过滤分组

```sql
-- HAVING：对分组后的结果过滤
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city
HAVING COUNT(*) > 10;

-- WHERE vs HAVING
SELECT city, COUNT(*) AS user_count
FROM users
WHERE age > 18              -- 分组前过滤
GROUP BY city
HAVING COUNT(*) > 10;       -- 分组后过滤
```

#### GROUP BY 与聚合

```sql
-- 复杂聚合示例
SELECT 
    city,
    COUNT(*) AS total_users,
    AVG(age) AS avg_age,
    MIN(created_at) AS first_registration,
    MAX(created_at) AS last_registration
FROM users
GROUP BY city
HAVING COUNT(*) >= 100
ORDER BY total_users DESC;
```

### 5. ORDER BY 排序

#### 单列排序

```sql
-- 升序（默认）
SELECT * FROM users ORDER BY age;
SELECT * FROM users ORDER BY age ASC;

-- 降序
SELECT * FROM users ORDER BY age DESC;
```

#### 多列排序

```sql
-- 先按 city 升序，再按 age 降序
SELECT * FROM users 
ORDER BY city ASC, age DESC;
```

#### 按别名或位置排序

```sql
-- 按别名排序
SELECT username, age * 12 AS age_months
FROM users
ORDER BY age_months DESC;

-- 按列位置排序（不推荐，可读性差）
SELECT username, email, age
FROM users
ORDER BY 3 DESC;  -- 按第3列（age）排序
```

#### NULL 值排序

```sql
-- MySQL：NULL 值排在最前
SELECT * FROM users ORDER BY email;

-- Oracle/PostgreSQL：可以指定 NULL 位置
SELECT * FROM users ORDER BY email NULLS FIRST;   -- NULL 在前
SELECT * FROM users ORDER BY email NULLS LAST;    -- NULL 在后
```

#### 自定义排序

```sql
-- 使用 CASE 自定义排序
SELECT * FROM users
ORDER BY 
    CASE city
        WHEN 'Beijing' THEN 1
        WHEN 'Shanghai' THEN 2
        WHEN 'Guangzhou' THEN 3
        ELSE 4
    END;
```

### 6. LIMIT 分页

#### MySQL LIMIT

```sql
-- 前 10 条
SELECT * FROM users LIMIT 10;

-- 从第 20 条开始，取 10 条（OFFSET）
SELECT * FROM users LIMIT 10 OFFSET 20;

-- 简写形式
SELECT * FROM users LIMIT 20, 10;  -- 跳过20条，取10条
```

#### Oracle ROWNUM/FETCH

```sql
-- ROWNUM（Oracle 11g 及之前）
SELECT * FROM users WHERE ROWNUM <= 10;

-- 分页（需要子查询）
SELECT * FROM (
    SELECT u.*, ROWNUM rn FROM users u WHERE ROWNUM <= 30
) WHERE rn > 20;

-- Oracle 12c+ FETCH
SELECT * FROM users 
ORDER BY id
FETCH FIRST 10 ROWS ONLY;

SELECT * FROM users 
ORDER BY id
OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;
```

#### PostgreSQL LIMIT

```sql
-- 与 MySQL 相同
SELECT * FROM users LIMIT 10 OFFSET 20;

-- SQL 标准语法（PostgreSQL、Oracle 12c+）
SELECT * FROM users
OFFSET 20 ROWS
FETCH NEXT 10 ROWS ONLY;
```

---

## 易错点与边界

### 1. SELECT * 的性能问题

```sql
-- 不推荐：查询所有列
SELECT * FROM large_table;

-- 推荐：明确指定需要的列
SELECT id, username, email FROM large_table;
```

**原因**：
- 传输不必要的数据
- 无法利用覆盖索引
- 列增加时可能影响应用程序

### 2. DISTINCT 的性能开销

```sql
-- DISTINCT 需要排序或哈希，有性能开销
SELECT DISTINCT city FROM users;  -- 如果 users 表很大，会很慢

-- 如果可能，使用 GROUP BY
SELECT city FROM users GROUP BY city;  -- 可能更快
```

### 3. WHERE 条件顺序

```sql
-- 错误思维：条件顺序影响性能
SELECT * FROM users 
WHERE age > 18 AND city = 'Beijing';  -- 哪个条件在前？

-- 实际：优化器会自动调整顺序，重点是使用索引
-- 应该关注：是否有合适的索引
```

### 4. COUNT(*) vs COUNT(column)

```sql
-- COUNT(*) 统计所有行
SELECT COUNT(*) FROM users;  -- 10 行

-- COUNT(column) 统计非 NULL 行
SELECT COUNT(email) FROM users;  -- 8 行（2个 NULL）

-- COUNT(DISTINCT column)
SELECT COUNT(DISTINCT city) FROM users;  -- 不重复的城市数
```

### 5. LIMIT 深分页问题

```sql
-- 深分页性能问题
SELECT * FROM users ORDER BY id LIMIT 1000000, 10;
-- 需要扫描 1000010 行，然后丢弃前 1000000 行

-- 优化：使用上次查询的最大 id
SELECT * FROM users WHERE id > 1000000 ORDER BY id LIMIT 10;
```

---

## 生产实践示例

### 1. 分页查询优化

**传统分页（性能差）**：
```sql
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 1000000, 20;
```

**延迟关联优化**：
```sql
SELECT o.* FROM orders o
INNER JOIN (
    SELECT id FROM orders 
    ORDER BY created_at DESC 
    LIMIT 1000000, 20
) t ON o.id = t.id;
```

**游标分页（推荐）**：
```sql
-- 第一页
SELECT * FROM orders 
WHERE created_at < '2024-03-16 00:00:00'
ORDER BY created_at DESC 
LIMIT 20;

-- 第二页（使用上一页的最后一条记录的 created_at）
SELECT * FROM orders 
WHERE created_at < '2024-03-15 23:30:00'
ORDER BY created_at DESC 
LIMIT 20;
```

### 2. 统计查询

```sql
-- 用户统计仪表板
SELECT 
    COUNT(*) AS total_users,
    COUNT(CASE WHEN status = 1 THEN 1 END) AS active_users,
    COUNT(CASE WHEN status = 0 THEN 1 END) AS inactive_users,
    AVG(age) AS avg_age,
    COUNT(CASE WHEN age < 18 THEN 1 END) AS minor_users,
    COUNT(CASE WHEN age BETWEEN 18 AND 65 THEN 1 END) AS adult_users,
    COUNT(CASE WHEN age > 65 THEN 1 END) AS senior_users
FROM users;
```

### 3. TopN 查询

```sql
-- 查询每个城市的前3名用户（按年龄）
SELECT * FROM (
    SELECT 
        city,
        username,
        age,
        ROW_NUMBER() OVER (PARTITION BY city ORDER BY age DESC) AS rn
    FROM users
) t
WHERE rn <= 3;
```

### 4. 数据去重

```sql
-- 查找重复数据
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 删除重复数据（保留 id 最小的）
DELETE FROM users
WHERE id NOT IN (
    SELECT MIN(id) FROM users GROUP BY email
);
```

---

## 三大数据库的 DQL 差异

| 特性 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| 字符串拼接 | CONCAT() | \|\| | CONCAT() 或 \|\| |
| 分页 | LIMIT OFFSET | ROWNUM/FETCH | LIMIT OFFSET/FETCH |
| NULL 排序 | NULL 在前 | NULLS FIRST/LAST | NULLS FIRST/LAST |
| DISTINCT | DISTINCT | DISTINCT/UNIQUE | DISTINCT |
| 大小写敏感 | 取决于字符集 | 默认不敏感 | 默认敏感 |

---

## 查询执行顺序

SQL 查询的逻辑执行顺序：

```sql
SELECT city, COUNT(*) AS user_count     -- 5. 选择列
FROM users                               -- 1. FROM：确定数据源
WHERE age > 18                          -- 2. WHERE：行过滤
GROUP BY city                           -- 3. GROUP BY：分组
HAVING COUNT(*) > 10                    -- 4. HAVING：分组过滤
ORDER BY user_count DESC                -- 6. ORDER BY：排序
LIMIT 10;                               -- 7. LIMIT：限制行数
```

理解执行顺序有助于：
- 理解别名的作用域（WHERE 不能用 SELECT 别名）
- 优化查询性能
- 避免逻辑错误

---

## 参考资料

1. **MySQL 官方文档**：
   - SELECT Syntax: https://dev.mysql.com/doc/refman/8.0/en/select.html
   - Aggregate Functions: https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html

2. **Oracle 官方文档**：
   - SELECT Statement: https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/SELECT.html

3. **PostgreSQL 官方文档**：
   - SELECT: https://www.postgresql.org/docs/current/sql-select.html
   - Aggregate Functions: https://www.postgresql.org/docs/current/functions-aggregate.html

4. **最佳实践**：
   - 避免 SELECT *，明确指定列
   - 合理使用索引，避免全表扫描
   - 深分页使用游标分页
   - WHERE 条件尽量使用索引列
   - 聚合查询注意性能，必要时使用汇总表

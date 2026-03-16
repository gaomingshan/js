# SQL 改写与重构

## 概述

SQL 改写是在不改变查询结果的前提下，通过调整 SQL 语句结构来提升性能的优化方法。掌握常见的 SQL 改写技巧，可以有效解决性能问题，避免慢查询。

**核心技巧**：
- **等价变换**：利用 SQL 语义等价性改写
- **消除冗余**：去除不必要的操作
- **访问路径优化**：改变数据访问方式
- **谓词优化**：优化过滤条件
- **子查询优化**：转换子查询形式

---

## 子查询改写

### 1. IN/EXISTS 互转

**IN 转 EXISTS**：
```sql
-- 原查询
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE status = 1);

-- 改写为 EXISTS
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id AND o.status = 1
);

-- 何时使用：
-- IN：子查询结果集小（几千行）
-- EXISTS：主表小，子查询结果集大
```

**EXISTS 转 JOIN**：
```sql
-- 原查询
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 改写为 JOIN
SELECT DISTINCT u.* FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 或使用半连接（MySQL 5.6+）
SELECT u.* FROM users u
WHERE u.id IN (SELECT user_id FROM orders);
-- 优化器可能自动转换为半连接
```

### 2. 标量子查询改写

**问题**：
```sql
-- 相关子查询，每行都执行一次
SELECT 
    u.id,
    u.username,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count,
    (SELECT SUM(amount) FROM orders WHERE user_id = u.id) AS total_amount
FROM users u;

-- 执行次数 = users 表行数 × 2
-- 性能差
```

**优化**：
```sql
-- 方案1：LEFT JOIN
SELECT 
    u.id,
    u.username,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.amount), 0) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- 方案2：两次 LEFT JOIN（如果聚合函数不同）
SELECT 
    u.id,
    u.username,
    COALESCE(oc.order_count, 0) AS order_count,
    COALESCE(oa.total_amount, 0) AS total_amount
FROM users u
LEFT JOIN (
    SELECT user_id, COUNT(*) AS order_count
    FROM orders
    GROUP BY user_id
) oc ON u.id = oc.user_id
LEFT JOIN (
    SELECT user_id, SUM(amount) AS total_amount
    FROM orders
    GROUP BY user_id
) oa ON u.id = oa.user_id;
```

### 3. NOT IN 改写

**问题**：
```sql
-- NOT IN 遇到 NULL 会失效
SELECT * FROM users 
WHERE id NOT IN (SELECT user_id FROM orders);

-- 如果 orders.user_id 有 NULL，返回空结果
```

**优化**：
```sql
-- 方案1：NOT EXISTS
SELECT * FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- 方案2：LEFT JOIN + NULL 判断
SELECT u.* FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;

-- 方案3：NOT IN 加 NULL 过滤
SELECT * FROM users 
WHERE id NOT IN (
    SELECT user_id FROM orders WHERE user_id IS NOT NULL
);
```

---

## JOIN 改写

### 1. JOIN 转子查询

**适用场景：只需判断存在性**：
```sql
-- 原查询：JOIN
SELECT DISTINCT u.* FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 改写为子查询（更清晰）
SELECT * FROM users
WHERE id IN (SELECT DISTINCT user_id FROM orders);

-- 或使用 EXISTS
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

### 2. 多次 JOIN 转一次 JOIN

**问题**：
```sql
-- 重复 JOIN 同一个表
SELECT 
    u.username,
    o1.order_no AS first_order,
    o2.order_no AS last_order
FROM users u
LEFT JOIN orders o1 ON u.id = o1.user_id AND o1.id = (
    SELECT MIN(id) FROM orders WHERE user_id = u.id
)
LEFT JOIN orders o2 ON u.id = o2.user_id AND o2.id = (
    SELECT MAX(id) FROM orders WHERE user_id = u.id
);
```

**优化**：
```sql
-- 使用窗口函数（MySQL 8.0+）
SELECT 
    u.username,
    MAX(CASE WHEN o.rn_first = 1 THEN o.order_no END) AS first_order,
    MAX(CASE WHEN o.rn_last = 1 THEN o.order_no END) AS last_order
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        order_no,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id) AS rn_first,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id DESC) AS rn_last
    FROM orders
) o ON u.id = o.user_id AND (o.rn_first = 1 OR o.rn_last = 1)
GROUP BY u.id, u.username;
```

### 3. 大表 JOIN 优化

**问题**：
```sql
-- 两个大表直接 JOIN
SELECT * FROM large_table1 t1
JOIN large_table2 t2 ON t1.id = t2.t1_id;
```

**优化**：
```sql
-- 先过滤再 JOIN
SELECT t1.* FROM (
    SELECT * FROM large_table1 WHERE status = 1
) t1
JOIN (
    SELECT * FROM large_table2 WHERE created_at > '2024-01-01'
) t2 ON t1.id = t2.t1_id;

-- 或使用临时表
CREATE TEMPORARY TABLE tmp_t1 AS
SELECT * FROM large_table1 WHERE status = 1;

CREATE INDEX idx_id ON tmp_t1(id);

SELECT t1.* FROM tmp_t1 t1
JOIN large_table2 t2 ON t1.id = t2.t1_id
WHERE t2.created_at > '2024-01-01';
```

---

## UNION 改写

### 1. UNION vs UNION ALL

**区别**：
```sql
-- UNION：自动去重（需要排序）
SELECT id FROM table1
UNION
SELECT id FROM table2;
-- 执行：合并 + 排序去重

-- UNION ALL：不去重（更快）
SELECT id FROM table1
UNION ALL
SELECT id FROM table2;
-- 执行：直接合并

-- 选择：
-- 确定无重复：使用 UNION ALL
-- 需要去重：使用 UNION
```

### 2. OR 转 UNION

**问题**：
```sql
-- OR 连接不同列
SELECT * FROM users 
WHERE username = 'alice' OR email = 'alice@example.com';
-- 可能无法有效使用索引
```

**优化**：
```sql
-- 改为 UNION
SELECT * FROM users WHERE username = 'alice'
UNION
SELECT * FROM users WHERE email = 'alice@example.com';
-- 分别使用 idx_username 和 idx_email
```

### 3. UNION 转 CASE

**问题**：
```sql
-- 多次查询同一表
SELECT 'VIP' AS type, COUNT(*) AS count FROM users WHERE vip_level >= 3
UNION ALL
SELECT 'Normal' AS type, COUNT(*) AS count FROM users WHERE vip_level < 3;
-- 扫描表两次
```

**优化**：
```sql
-- 一次扫描
SELECT 
    SUM(CASE WHEN vip_level >= 3 THEN 1 ELSE 0 END) AS vip_count,
    SUM(CASE WHEN vip_level < 3 THEN 1 ELSE 0 END) AS normal_count
FROM users;
```

---

## DISTINCT 改写

### 1. DISTINCT 转 GROUP BY

**等价改写**：
```sql
-- DISTINCT
SELECT DISTINCT city FROM users;

-- GROUP BY
SELECT city FROM users GROUP BY city;

-- 性能相似，GROUP BY 更灵活
SELECT city, COUNT(*) AS user_count 
FROM users 
GROUP BY city;
```

### 2. 消除不必要的 DISTINCT

**问题**：
```sql
-- 不必要的 DISTINCT
SELECT DISTINCT u.* FROM users u
JOIN orders o ON u.id = o.user_id;
-- users.id 是主键，本身唯一
```

**优化**：
```sql
-- 如果不需要去重
SELECT u.* FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 或使用半连接
SELECT u.* FROM users u
WHERE u.id IN (SELECT DISTINCT user_id FROM orders);
```

### 3. DISTINCT 优化

**使用聚合代替**：
```sql
-- 计算唯一值数量
-- 不好
SELECT COUNT(*) FROM (
    SELECT DISTINCT user_id FROM orders
) t;

-- 好
SELECT COUNT(DISTINCT user_id) FROM orders;
```

---

## 分页查询改写

### 1. 深分页优化

**问题**：
```sql
-- OFFSET 大时性能差
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000000, 10;
-- 扫描 1000010 行
```

**优化1：延迟关联**：
```sql
SELECT o.* FROM orders o
INNER JOIN (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 1000000, 10
) t ON o.id = t.id;
-- 子查询使用覆盖索引
```

**优化2：游标分页**：
```sql
-- 记录上次最后一条的 id 或时间
SELECT * FROM orders 
WHERE created_at < '2024-03-15 10:00:00'  -- 上次最后一条的时间
ORDER BY created_at DESC 
LIMIT 10;
-- 避免 OFFSET，性能稳定
```

**优化3：反向查询**：
```sql
-- 如果查询倒数第N页
-- 不好：正向查询
SELECT * FROM orders ORDER BY created_at DESC LIMIT 9999990, 10;

-- 好：反向查询
SELECT * FROM (
    SELECT * FROM orders ORDER BY created_at ASC LIMIT 10
) t ORDER BY created_at DESC;
```

### 2. COUNT 优化

**问题**：
```sql
-- COUNT(*) 大表很慢
SELECT COUNT(*) FROM large_table WHERE status = 1;
```

**优化**：
```sql
-- 方案1：近似值
SELECT table_rows FROM information_schema.tables 
WHERE table_name = 'large_table';
-- 估算值，不精确

-- 方案2：缓存
-- 使用 Redis 缓存计数
-- 插入/删除时更新计数

-- 方案3：只统计必要的
-- 如果只需判断是否大于某个值
SELECT EXISTS(
    SELECT 1 FROM large_table WHERE status = 1 LIMIT 1
) AS has_records;
```

---

## 条件优化

### 1. 范围条件优化

**合并范围**：
```sql
-- 不好：多个范围条件
SELECT * FROM orders 
WHERE (created_at >= '2024-01-01' AND created_at < '2024-02-01')
   OR (created_at >= '2024-03-01' AND created_at < '2024-04-01');

-- 好：如果可以合并
SELECT * FROM orders 
WHERE created_at >= '2024-01-01' AND created_at < '2024-04-01'
  AND (MONTH(created_at) = 1 OR MONTH(created_at) = 3);
-- 或分两次查询用 UNION ALL
```

### 2. NULL 处理优化

**IS NULL 优化**：
```sql
-- 不好：OR NULL
SELECT * FROM users WHERE email = 'test@example.com' OR email IS NULL;

-- 好：使用 COALESCE
SELECT * FROM users WHERE COALESCE(email, '') IN ('test@example.com', '');

-- 或分开查询
SELECT * FROM users WHERE email = 'test@example.com'
UNION ALL
SELECT * FROM users WHERE email IS NULL;
```

### 3. LIKE 优化

**前缀匹配**：
```sql
-- 不好：LIKE 两边都有 %
SELECT * FROM users WHERE username LIKE '%alice%';
-- 无法使用索引

-- 好：只后缀有 %
SELECT * FROM users WHERE username LIKE 'alice%';
-- 可以使用索引

-- 模糊搜索：使用全文索引
CREATE FULLTEXT INDEX ft_username ON users(username);
SELECT * FROM users WHERE MATCH(username) AGAINST('alice');
```

---

## 聚合查询改写

### 1. GROUP BY 优化

**消除不必要的 GROUP BY**：
```sql
-- 不好：不必要的 GROUP BY
SELECT user_id, username FROM users GROUP BY user_id, username;
-- user_id 是主键，已经唯一

-- 好：去掉 GROUP BY
SELECT user_id, username FROM users;
```

**减少分组列**：
```sql
-- 不好：包含大字段
SELECT content, COUNT(*) FROM articles GROUP BY content;
-- content 是 TEXT，分组慢

-- 好：使用 hash 或 id 分组
SELECT id, content, COUNT(*) FROM (
    SELECT id, content FROM articles
) t GROUP BY id, content;
```

### 2. HAVING 转 WHERE

**提前过滤**：
```sql
-- 不好：HAVING 过滤
SELECT city, COUNT(*) AS cnt
FROM users
GROUP BY city
HAVING city = 'Beijing';
-- 先分组所有城市，再过滤

-- 好：WHERE 过滤
SELECT city, COUNT(*) AS cnt
FROM users
WHERE city = 'Beijing'
GROUP BY city;
-- 先过滤，再分组
```

### 3. 窗口函数代替自连接

**问题**：
```sql
-- 自连接计算排名
SELECT 
    u1.username,
    u1.score,
    COUNT(u2.id) + 1 AS rank
FROM users u1
LEFT JOIN users u2 ON u1.score < u2.score
GROUP BY u1.id, u1.username, u1.score
ORDER BY rank;
-- 性能差
```

**优化**：
```sql
-- 使用窗口函数（MySQL 8.0+）
SELECT 
    username,
    score,
    RANK() OVER (ORDER BY score DESC) AS rank
FROM users;
-- 性能好
```

---

## 临时表与派生表

### 1. 物化派生表

**问题**：
```sql
-- 派生表可能被多次计算
SELECT t1.*, t2.*
FROM (SELECT * FROM users WHERE status = 1) t1
JOIN (SELECT * FROM users WHERE status = 1) t2 ON t1.city = t2.city;
-- 相同的派生表计算两次
```

**优化**：
```sql
-- 使用临时表
CREATE TEMPORARY TABLE tmp_users AS
SELECT * FROM users WHERE status = 1;

CREATE INDEX idx_city ON tmp_users(city);

SELECT t1.*, t2.*
FROM tmp_users t1
JOIN tmp_users t2 ON t1.city = t2.city;

DROP TEMPORARY TABLE tmp_users;
```

### 2. CTE 优化

**使用 CTE 提高可读性**：
```sql
-- 不好：嵌套子查询
SELECT * FROM (
    SELECT * FROM (
        SELECT * FROM users WHERE status = 1
    ) t1 WHERE age > 18
) t2 WHERE city = 'Beijing';

-- 好：CTE
WITH 
active_users AS (
    SELECT * FROM users WHERE status = 1
),
adult_users AS (
    SELECT * FROM active_users WHERE age > 18
)
SELECT * FROM adult_users WHERE city = 'Beijing';
```

---

## 批量操作优化

### 1. 批量插入

**问题**：
```sql
-- 逐条插入
for data in dataset:
    INSERT INTO users VALUES (...);
```

**优化**：
```sql
-- 批量插入
INSERT INTO users VALUES
    (1, 'user1', 'email1'),
    (2, 'user2', 'email2'),
    ...
    (1000, 'user1000', 'email1000');

-- 或使用 LOAD DATA
LOAD DATA INFILE '/path/to/data.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';
```

### 2. 批量更新

**使用 CASE WHEN**：
```sql
-- 不好：多次更新
UPDATE users SET vip_level = 3 WHERE id = 1;
UPDATE users SET vip_level = 2 WHERE id = 2;
UPDATE users SET vip_level = 1 WHERE id = 3;

-- 好：一次更新
UPDATE users
SET vip_level = CASE id
    WHEN 1 THEN 3
    WHEN 2 THEN 2
    WHEN 3 THEN 1
END
WHERE id IN (1, 2, 3);
```

---

## SQL 改写检查清单

### 1. 改写前检查

```
□ 查看执行计划（EXPLAIN）
□ 记录当前性能指标
□ 确认查询结果正确性
□ 了解数据特征（数据量、分布）
```

### 2. 改写后验证

```
□ 执行计划是否改善
□ 查询时间是否减少
□ 结果是否完全一致
□ 资源消耗是否降低
```

### 3. 常见改写技巧

```
□ 子查询 → JOIN
□ IN → EXISTS
□ OR → UNION
□ DISTINCT → GROUP BY
□ 标量子查询 → LEFT JOIN
□ 深分页 → 延迟关联/游标分页
□ NOT IN → NOT EXISTS / LEFT JOIN
□ 多次计算 → 临时表/CTE
```

---

## 生产环境案例

### 1. 案例：相关子查询优化

**问题**：
```sql
-- 慢查询
SELECT 
    u.id,
    u.username,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u
LIMIT 1000;

-- 执行时间：5秒
```

**优化**：
```sql
-- 改写为 LEFT JOIN
SELECT 
    u.id,
    u.username,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
LIMIT 1000;

-- 执行时间：0.1秒
-- 性能提升：50倍
```

### 2. 案例：深分页优化

**问题**：
```sql
-- 深分页慢查询
SELECT * FROM orders ORDER BY created_at DESC LIMIT 900000, 10;
-- 执行时间：30秒
```

**优化**：
```sql
-- 延迟关联
SELECT o.* FROM orders o
INNER JOIN (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 900000, 10
) t ON o.id = t.id;

-- 执行时间：1秒
-- 性能提升：30倍
```

### 3. 案例：OR 条件优化

**问题**：
```sql
-- OR 连接导致索引失效
SELECT * FROM users 
WHERE username = 'alice' OR email = 'alice@example.com';
-- 执行时间：2秒
```

**优化**：
```sql
-- 改为 UNION
SELECT * FROM users WHERE username = 'alice'
UNION
SELECT * FROM users WHERE email = 'alice@example.com';

-- 执行时间：0.05秒
-- 性能提升：40倍
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Query Optimization: https://dev.mysql.com/doc/refman/8.0/en/optimization.html

2. **推荐书籍**：
   - 《SQL优化核心思想》
   - 《高性能MySQL》

3. **最佳实践**：
   - 先 EXPLAIN 再改写
   - 改写后验证结果一致性
   - 在测试环境充分测试
   - 监控改写后的性能
   - 保留改写前后的对比数据
   - 建立 SQL 改写规范

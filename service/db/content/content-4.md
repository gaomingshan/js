# JOIN 关联查询

## 概述

JOIN 是 SQL 中最强大也最复杂的特性之一，用于从多个表中组合数据。理解 JOIN 的原理和类型对于编写高效的查询至关重要。

**JOIN 类型**：
- **INNER JOIN**：内连接，返回两表匹配的行
- **LEFT JOIN**：左外连接，返回左表所有行
- **RIGHT JOIN**：右外连接，返回右表所有行
- **FULL OUTER JOIN**：全外连接，返回两表所有行
- **CROSS JOIN**：交叉连接，笛卡尔积
- **SELF JOIN**：自连接

---

## 核心概念

### 1. INNER JOIN 内连接

返回两个表中满足连接条件的行。

**基础语法**：
```sql
SELECT u.username, o.order_id, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- INNER 可以省略
SELECT u.username, o.order_id, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id;
```

**多表 JOIN**：
```sql
SELECT 
    u.username,
    o.order_id,
    p.product_name,
    oi.quantity
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id;
```

**使用 WHERE 条件**：
```sql
SELECT u.username, o.order_id, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.amount > 100 AND u.city = 'Beijing';
```

**多个连接条件**：
```sql
SELECT *
FROM users u
INNER JOIN orders o 
    ON u.id = o.user_id 
    AND u.status = 1 
    AND o.status = 'completed';
```

### 2. LEFT JOIN 左外连接

返回左表的所有行，即使右表没有匹配的行（右表字段为 NULL）。

**基础语法**：
```sql
-- 查询所有用户及其订单（包括没有订单的用户）
SELECT u.username, o.order_id, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

**查找没有订单的用户**：
```sql
SELECT u.username
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;
```

**多表 LEFT JOIN**：
```sql
SELECT 
    u.username,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.amount), 0) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

### 3. RIGHT JOIN 右外连接

返回右表的所有行，即使左表没有匹配的行（左表字段为 NULL）。

```sql
-- 查询所有订单及其用户（包括没有用户的订单）
SELECT u.username, o.order_id, o.amount
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- 通常可以转换为 LEFT JOIN（推荐）
SELECT u.username, o.order_id, o.amount
FROM orders o
LEFT JOIN users u ON u.id = o.user_id;
```

**注意**：RIGHT JOIN 可读性较差，建议统一使用 LEFT JOIN。

### 4. FULL OUTER JOIN 全外连接

返回两个表的所有行，匹配的行显示两边的数据，不匹配的行另一侧显示 NULL。

**Oracle/PostgreSQL**：
```sql
SELECT u.username, o.order_id, o.amount
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;
```

**MySQL 不直接支持 FULL OUTER JOIN，使用 UNION 模拟**：
```sql
SELECT u.username, o.order_id, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id

UNION

SELECT u.username, o.order_id, o.amount
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id
WHERE u.id IS NULL;
```

### 5. CROSS JOIN 交叉连接

返回两个表的笛卡尔积，即左表每一行与右表每一行组合。

```sql
-- 显式 CROSS JOIN
SELECT u.username, p.product_name
FROM users u
CROSS JOIN products p;

-- 隐式 CROSS JOIN（逗号语法）
SELECT u.username, p.product_name
FROM users u, products p;

-- 结果行数 = users 表行数 × products 表行数
```

**实际应用场景**：
```sql
-- 生成日期序列与用户的组合（用于报表）
SELECT u.id, d.date
FROM users u
CROSS JOIN (
    SELECT DATE_ADD('2024-01-01', INTERVAL n DAY) AS date
    FROM numbers
    WHERE n < 31
) d;
```

### 6. SELF JOIN 自连接

表与自身进行连接，通常用于处理层级或递归数据。

**员工与经理关系**：
```sql
-- 查询员工及其经理
SELECT 
    e.name AS employee,
    m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

**查找同城用户**：
```sql
-- 查找与 Alice 同城的其他用户
SELECT u2.username
FROM users u1
INNER JOIN users u2 ON u1.city = u2.city
WHERE u1.username = 'Alice' AND u2.username != 'Alice';
```

**树形结构查询**：
```sql
-- 查询部门层级关系
SELECT 
    d1.name AS department,
    d2.name AS parent_department
FROM departments d1
LEFT JOIN departments d2 ON d1.parent_id = d2.id;
```

---

## JOIN 执行原理

### 1. 驱动表的选择

**小表驱动大表原则**：
```sql
-- 假设 users 表有 10 行，orders 表有 10000 行

-- 优化器通常选择 users 作为驱动表
SELECT *
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.city = 'Beijing';

-- 驱动表：users（过滤后可能只有几行）
-- 被驱动表：orders
```

### 2. JOIN 算法

#### Nested Loop Join（嵌套循环连接）
```
for each row in table1:
    for each row in table2:
        if join_condition:
            output row
```

**适用场景**：
- 驱动表较小
- 被驱动表在连接列上有索引

#### Hash Join（哈希连接）
```
1. 构建阶段：遍历小表，构建哈希表
2. 探测阶段：遍历大表，在哈希表中查找匹配
```

**适用场景**：
- 大表连接
- 等值连接
- 内存足够

#### Merge Join（归并连接）
```
1. 两个表都按连接列排序
2. 同时遍历两个有序集合，匹配连接
```

**适用场景**：
- 两表都已排序或有索引
- 大表连接

---

## ON vs WHERE

### 连接条件 vs 过滤条件

**INNER JOIN 中差异不大**：
```sql
-- 写法1：连接条件在 ON 中
SELECT *
FROM users u
INNER JOIN orders o ON u.id = o.user_id AND u.status = 1;

-- 写法2：过滤条件在 WHERE 中（推荐）
SELECT *
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 1;
```

**LEFT JOIN 中差异很大**：
```sql
-- ON 中的条件：先过滤右表，再左连接
SELECT u.username, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed';
-- 结果：所有用户都会返回，订单只返回已完成的

-- WHERE 中的条件：先左连接，再过滤结果
SELECT u.username, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed';
-- 结果：只返回有已完成订单的用户
```

**最佳实践**：
- ON 子句：只放连接条件
- WHERE 子句：放过滤条件
- 这样语义更清晰，避免混淆

---

## 易错点与边界

### 1. 笛卡尔积陷阱

```sql
-- 错误：忘记 JOIN 条件，产生笛卡尔积
SELECT u.username, o.order_id
FROM users u, orders o;
-- 结果：users 表 10 行 × orders 表 10000 行 = 100000 行

-- 正确：添加 JOIN 条件
SELECT u.username, o.order_id
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

### 2. NULL 值处理

```sql
-- LEFT JOIN 中右表字段为 NULL
SELECT u.username, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- 统计时注意 NULL
SELECT 
    u.username,
    COUNT(o.id) AS order_count,  -- 正确：COUNT(column) 不计 NULL
    COUNT(*) AS total_rows       -- 错误：会计入 NULL 行
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

### 3. 重复行问题

```sql
-- 一对多关联可能产生重复
SELECT u.username, u.email
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
-- 如果用户有多个订单，用户信息会重复

-- 解决方案1：只查询需要的列
SELECT DISTINCT u.username, u.email
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 解决方案2：使用子查询
SELECT u.username, u.email
FROM users u
WHERE u.id IN (SELECT DISTINCT user_id FROM orders);
```

### 4. JOIN 顺序

```sql
-- 三表 JOIN 的不同写法结果可能不同

-- 写法1
SELECT *
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN products p ON o.product_id = p.id;

-- 写法2（结果可能不同）
SELECT *
FROM orders o
LEFT JOIN (
    users u
    INNER JOIN products p ON u.city = p.origin_city
) ON o.user_id = u.id;
```

---

## 生产实践示例

### 1. 订单报表查询

```sql
-- 查询用户订单统计
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(DISTINCT o.id) AS order_count,
    COALESCE(SUM(o.amount), 0) AS total_amount,
    MAX(o.created_at) AS last_order_time
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
WHERE u.status = 1
GROUP BY u.id, u.username, u.email
HAVING COUNT(DISTINCT o.id) > 0
ORDER BY total_amount DESC
LIMIT 100;
```

### 2. 查找孤儿记录

```sql
-- 查找没有关联用户的订单（数据不一致）
SELECT o.*
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- 查找没有订单的用户
SELECT u.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;
```

### 3. 多维度统计

```sql
-- 按城市和产品类别统计订单
SELECT 
    u.city,
    p.category,
    COUNT(DISTINCT o.id) AS order_count,
    COUNT(DISTINCT o.user_id) AS user_count,
    SUM(oi.quantity) AS total_quantity,
    SUM(oi.amount) AS total_amount
FROM orders o
INNER JOIN users u ON o.user_id = u.id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.created_at >= '2024-01-01'
GROUP BY u.city, p.category
ORDER BY total_amount DESC;
```

### 4. 层级查询（递归 CTE）

**PostgreSQL/Oracle**：
```sql
-- 查询组织架构（递归查询）
WITH RECURSIVE org_tree AS (
    -- 基础查询：顶级部门
    SELECT id, name, parent_id, 0 AS level
    FROM departments
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- 递归查询：子部门
    SELECT d.id, d.name, d.parent_id, ot.level + 1
    FROM departments d
    INNER JOIN org_tree ot ON d.parent_id = ot.id
)
SELECT * FROM org_tree ORDER BY level, id;
```

**MySQL 8.0+**：
```sql
-- MySQL 8.0 支持递归 CTE
WITH RECURSIVE employee_tree AS (
    SELECT id, name, manager_id, 0 AS level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    SELECT e.id, e.name, e.manager_id, et.level + 1
    FROM employees e
    INNER JOIN employee_tree et ON e.manager_id = et.id
)
SELECT * FROM employee_tree;
```

---

## 三大数据库的 JOIN 差异

| 特性 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| INNER JOIN | ✓ | ✓ | ✓ |
| LEFT/RIGHT JOIN | ✓ | ✓ | ✓ |
| FULL OUTER JOIN | ✗（用 UNION） | ✓ | ✓ |
| CROSS JOIN | ✓ | ✓ | ✓ |
| NATURAL JOIN | ✓ | ✓ | ✓ |
| 递归 CTE | ✓（8.0+） | ✓ | ✓ |
| (+) 外连接语法 | ✗ | ✓（旧语法） | ✗ |

**Oracle 旧式外连接语法**（不推荐）：
```sql
-- 左外连接
SELECT u.username, o.order_id
FROM users u, orders o
WHERE u.id = o.user_id(+);

-- 推荐使用标准语法
SELECT u.username, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

---

## JOIN 优化技巧

### 1. 小表驱动大表

```sql
-- 优化前：大表驱动小表
SELECT *
FROM large_table l
INNER JOIN small_table s ON l.id = s.large_id;

-- 优化后：小表驱动大表（如果优化器未自动优化）
SELECT *
FROM small_table s
INNER JOIN large_table l ON s.large_id = l.id;
```

### 2. 确保连接列有索引

```sql
-- 在连接列上创建索引
CREATE INDEX idx_user_id ON orders(user_id);

-- 然后执行 JOIN
SELECT *
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

### 3. 避免 JOIN 过多表

```sql
-- 不推荐：JOIN 超过 5 个表
SELECT *
FROM t1
JOIN t2 ON ...
JOIN t3 ON ...
JOIN t4 ON ...
JOIN t5 ON ...
JOIN t6 ON ...;

-- 推荐：拆分为多个查询或使用临时表
```

### 4. 使用子查询优化

```sql
-- 优化前：先 JOIN 再 GROUP BY
SELECT u.username, COUNT(o.id)
FROM users u
INNER JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- 优化后：先聚合再 JOIN
SELECT u.username, o.order_count
FROM users u
INNER JOIN (
    SELECT user_id, COUNT(*) AS order_count
    FROM orders
    GROUP BY user_id
) o ON u.id = o.user_id;
```

---

## 参考资料

1. **MySQL 官方文档**：
   - JOIN Syntax: https://dev.mysql.com/doc/refman/8.0/en/join.html
   - JOIN Optimization: https://dev.mysql.com/doc/refman/8.0/en/join-optimization.html

2. **Oracle 官方文档**：
   - Joins: https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Joins.html

3. **PostgreSQL 官方文档**：
   - Joins Between Tables: https://www.postgresql.org/docs/current/tutorial-join.html

4. **最佳实践**：
   - 连接条件放 ON，过滤条件放 WHERE
   - 统一使用 LEFT JOIN，避免 RIGHT JOIN
   - 确保连接列有索引
   - 避免笛卡尔积
   - 注意 NULL 值处理
   - 使用 EXPLAIN 分析执行计划

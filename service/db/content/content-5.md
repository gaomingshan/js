# 子查询与 CTE

## 概述

子查询（Subquery）是嵌套在其他 SQL 语句中的 SELECT 语句，它可以出现在 SELECT、FROM、WHERE、HAVING 等多个位置。CTE（Common Table Expression，公共表表达式）是一种更现代、更易读的子查询替代方案。

**核心类型**：
- **标量子查询**：返回单个值
- **列子查询**：返回单列多行
- **表子查询**：返回多列多行
- **相关子查询**：依赖外部查询的子查询
- **CTE**：临时命名的结果集

---

## 核心概念

### 1. 标量子查询

返回单个值（一行一列），可以出现在任何需要单值的地方。

**在 SELECT 中**：
```sql
-- 查询每个用户的订单数
SELECT 
    id,
    username,
    (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count
FROM users;
```

**在 WHERE 中**：
```sql
-- 查询订单金额大于平均值的订单
SELECT *
FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders);
```

**在 HAVING 中**：
```sql
-- 查询订单数超过平均订单数的用户
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > (SELECT AVG(cnt) FROM (
    SELECT COUNT(*) AS cnt FROM orders GROUP BY user_id
) t);
```

### 2. 列子查询

返回单列多行，通常与 IN、ANY、ALL 等操作符一起使用。

**使用 IN**：
```sql
-- 查询有订单的用户
SELECT *
FROM users
WHERE id IN (SELECT DISTINCT user_id FROM orders);

-- 查询没有订单的用户
SELECT *
FROM users
WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL);
```

**使用 ANY/SOME**：
```sql
-- 查询订单金额大于任意北京用户订单金额的订单
SELECT *
FROM orders
WHERE amount > ANY (
    SELECT o.amount 
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE u.city = 'Beijing'
);

-- SOME 与 ANY 等价
SELECT *
FROM orders
WHERE amount > SOME (SELECT amount FROM orders WHERE city = 'Beijing');
```

**使用 ALL**：
```sql
-- 查询订单金额大于所有北京用户订单金额的订单
SELECT *
FROM orders
WHERE amount > ALL (
    SELECT o.amount 
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE u.city = 'Beijing'
);
```

### 3. 表子查询

返回多列多行，可以作为临时表使用。

**在 FROM 中（派生表）**：
```sql
-- 查询每个城市订单金额前10的用户
SELECT city, username, total_amount
FROM (
    SELECT 
        u.city,
        u.username,
        SUM(o.amount) AS total_amount,
        ROW_NUMBER() OVER (PARTITION BY u.city ORDER BY SUM(o.amount) DESC) AS rn
    FROM users u
    JOIN orders o ON u.id = o.user_id
    GROUP BY u.city, u.username
) ranked
WHERE rn <= 10;
```

**派生表必须有别名**：
```sql
-- 错误：没有别名
SELECT * FROM (SELECT * FROM users);

-- 正确：有别名
SELECT * FROM (SELECT * FROM users) AS u;
```

### 4. 相关子查询 vs 非相关子查询

#### 非相关子查询

子查询独立于外部查询，可以单独执行。

```sql
-- 非相关子查询：先执行子查询，再执行外部查询
SELECT *
FROM users
WHERE id IN (SELECT user_id FROM orders);
```

#### 相关子查询

子查询引用外部查询的列，对外部查询的每一行都执行一次。

```sql
-- 相关子查询：外部查询每一行都执行一次子查询
SELECT 
    id,
    username,
    (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count
FROM users;
```

**性能对比**：
- **非相关子查询**：执行一次，性能通常较好
- **相关子查询**：执行 N 次（N = 外部查询行数），性能可能较差

### 5. EXISTS vs IN

#### EXISTS

检查子查询是否返回至少一行。

```sql
-- 查询有订单的用户
SELECT *
FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- 查询没有订单的用户
SELECT *
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

**EXISTS 优化**：
- 一旦找到匹配行就停止
- SELECT 子句内容不重要，通常写 `SELECT 1` 或 `SELECT *`
- 对 NULL 友好

#### IN vs EXISTS 性能对比

**IN 的问题**：
```sql
-- 如果子查询有 NULL，结果可能不符合预期
SELECT *
FROM users
WHERE id NOT IN (SELECT user_id FROM orders);
-- 如果 orders.user_id 有 NULL，结果为空

-- EXISTS 不受 NULL 影响
SELECT *
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

**选择建议**：
- **小表驱动大表**：用 IN
- **大表驱动小表**：用 EXISTS
- **有 NULL 值**：用 EXISTS
- **需要精确匹配**：用 IN

```sql
-- 小表 IN 大表
SELECT * FROM small_table WHERE id IN (SELECT fk FROM large_table);

-- 大表 EXISTS 小表
SELECT * FROM large_table l 
WHERE EXISTS (SELECT 1 FROM small_table s WHERE s.id = l.fk);
```

---

## CTE（公共表表达式）

CTE 是一种更现代、更易读的临时结果集定义方式。

### 1. 基础 CTE

**语法**：
```sql
WITH cte_name AS (
    SELECT ...
)
SELECT * FROM cte_name;
```

**示例**：
```sql
-- 使用 CTE 计算用户订单统计
WITH user_orders AS (
    SELECT 
        user_id,
        COUNT(*) AS order_count,
        SUM(amount) AS total_amount
    FROM orders
    GROUP BY user_id
)
SELECT 
    u.username,
    uo.order_count,
    uo.total_amount
FROM users u
JOIN user_orders uo ON u.id = uo.user_id
WHERE uo.order_count > 5;
```

### 2. 多个 CTE

```sql
-- 定义多个 CTE
WITH 
user_stats AS (
    SELECT 
        user_id,
        COUNT(*) AS order_count,
        SUM(amount) AS total_amount
    FROM orders
    GROUP BY user_id
),
product_stats AS (
    SELECT 
        product_id,
        COUNT(*) AS sale_count,
        SUM(quantity) AS total_quantity
    FROM order_items
    GROUP BY product_id
)
SELECT 
    u.username,
    us.order_count,
    us.total_amount
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE us.order_count > 10;
```

### 3. CTE 引用其他 CTE

```sql
WITH 
monthly_sales AS (
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(amount) AS total
    FROM orders
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
),
avg_monthly_sales AS (
    SELECT AVG(total) AS avg_total
    FROM monthly_sales
)
SELECT 
    ms.month,
    ms.total,
    ms.total - ams.avg_total AS diff_from_avg
FROM monthly_sales ms
CROSS JOIN avg_monthly_sales ams
WHERE ms.total > ams.avg_total;
```

### 4. 递归 CTE

用于处理层级或树形数据。

**PostgreSQL/Oracle/MySQL 8.0+**：
```sql
-- 查询组织架构树
WITH RECURSIVE org_tree AS (
    -- 基础查询（锚点成员）
    SELECT 
        id,
        name,
        parent_id,
        1 AS level,
        CAST(name AS CHAR(200)) AS path
    FROM departments
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- 递归查询（递归成员）
    SELECT 
        d.id,
        d.name,
        d.parent_id,
        ot.level + 1,
        CONCAT(ot.path, ' > ', d.name)
    FROM departments d
    INNER JOIN org_tree ot ON d.parent_id = ot.id
    WHERE ot.level < 10  -- 防止无限递归
)
SELECT * FROM org_tree ORDER BY path;
```

**员工层级查询**：
```sql
WITH RECURSIVE employee_hierarchy AS (
    -- 查找 CEO
    SELECT 
        id,
        name,
        manager_id,
        0 AS level,
        name AS path
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- 递归查找下属
    SELECT 
        e.id,
        e.name,
        e.manager_id,
        eh.level + 1,
        CONCAT(eh.path, ' -> ', e.name)
    FROM employees e
    INNER JOIN employee_hierarchy eh ON e.manager_id = eh.id
)
SELECT 
    REPEAT('  ', level) || name AS hierarchy,
    level
FROM employee_hierarchy
ORDER BY path;
```

**递归求和（计算连续和）**：
```sql
WITH RECURSIVE running_total AS (
    SELECT 
        id,
        amount,
        amount AS total,
        1 AS rn
    FROM orders
    WHERE id = (SELECT MIN(id) FROM orders)
    
    UNION ALL
    
    SELECT 
        o.id,
        o.amount,
        rt.total + o.amount,
        rt.rn + 1
    FROM orders o
    INNER JOIN running_total rt ON o.id > rt.id
    WHERE o.id = (
        SELECT MIN(id) FROM orders WHERE id > rt.id
    )
)
SELECT * FROM running_total;
```

---

## 子查询优化

### 1. 子查询改写为 JOIN

**优化前**：
```sql
-- 相关子查询，性能差
SELECT 
    id,
    username,
    (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count
FROM users;
```

**优化后**：
```sql
-- 改写为 LEFT JOIN，性能好
SELECT 
    u.id,
    u.username,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

### 2. IN 改写为 EXISTS

**优化前**：
```sql
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
```

**优化后**：
```sql
SELECT * FROM users u 
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

### 3. 避免在 WHERE 中使用标量子查询

**优化前**：
```sql
-- 每行都执行一次子查询
SELECT *
FROM orders
WHERE user_id = (SELECT id FROM users WHERE username = 'alice');
```

**优化后**：
```sql
-- 先计算子查询结果
WITH target_user AS (
    SELECT id FROM users WHERE username = 'alice'
)
SELECT o.*
FROM orders o
CROSS JOIN target_user u
WHERE o.user_id = u.id;

-- 或使用 JOIN
SELECT o.*
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.username = 'alice';
```

### 4. 使用临时表替代复杂子查询

**优化前**：
```sql
SELECT *
FROM (
    SELECT 
        user_id,
        COUNT(*) AS cnt
    FROM orders
    GROUP BY user_id
    HAVING COUNT(*) > 100
) large_users
JOIN users u ON large_users.user_id = u.id;
```

**优化后**：
```sql
-- 创建临时表
CREATE TEMPORARY TABLE large_users AS
SELECT user_id, COUNT(*) AS cnt
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 100;

-- 创建索引
CREATE INDEX idx_user_id ON large_users(user_id);

-- 查询
SELECT *
FROM large_users lu
JOIN users u ON lu.user_id = u.id;

-- 清理
DROP TEMPORARY TABLE large_users;
```

---

## 易错点与边界

### 1. NOT IN 与 NULL

```sql
-- 陷阱：如果子查询有 NULL，NOT IN 返回空结果
SELECT * FROM users WHERE id NOT IN (1, 2, NULL);
-- 结果为空，因为 id NOT IN (NULL) 总是 UNKNOWN

-- 解决方案1：过滤 NULL
SELECT * FROM users 
WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL);

-- 解决方案2：使用 NOT EXISTS
SELECT * FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

### 2. 标量子查询返回多行

```sql
-- 错误：子查询返回多行
SELECT 
    username,
    (SELECT order_id FROM orders WHERE user_id = users.id) AS order_id
FROM users;
-- ERROR: Subquery returns more than 1 row

-- 解决方案：限制返回一行或使用聚合
SELECT 
    username,
    (SELECT MAX(order_id) FROM orders WHERE user_id = users.id) AS last_order
FROM users;
```

### 3. CTE 只能引用一次（部分数据库）

**MySQL 8.0+ 和 PostgreSQL** 允许多次引用：
```sql
WITH user_stats AS (
    SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id
)
SELECT * FROM user_stats
UNION ALL
SELECT * FROM user_stats WHERE cnt > 10;
```

**某些数据库**可能需要重复定义或使用临时表。

### 4. 递归 CTE 无限循环

```sql
-- 危险：没有终止条件，可能无限递归
WITH RECURSIVE infinite AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM infinite
)
SELECT * FROM infinite;

-- 安全：添加终止条件
WITH RECURSIVE safe AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM safe WHERE n < 100
)
SELECT * FROM safe;
```

---

## 生产实践示例

### 1. 计算同比环比增长

```sql
WITH monthly_sales AS (
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(amount) AS total
    FROM orders
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
),
sales_with_prev AS (
    SELECT 
        month,
        total,
        LAG(total, 1) OVER (ORDER BY month) AS prev_month,
        LAG(total, 12) OVER (ORDER BY month) AS prev_year
    FROM monthly_sales
)
SELECT 
    month,
    total,
    ROUND((total - prev_month) / prev_month * 100, 2) AS mom_growth,
    ROUND((total - prev_year) / prev_year * 100, 2) AS yoy_growth
FROM sales_with_prev;
```

### 2. 查找连续登录用户

```sql
WITH RECURSIVE login_streaks AS (
    SELECT 
        user_id,
        login_date,
        login_date AS streak_start,
        1 AS streak_length
    FROM user_logins
    WHERE login_date = (
        SELECT MIN(login_date) FROM user_logins ul WHERE ul.user_id = user_logins.user_id
    )
    
    UNION ALL
    
    SELECT 
        ul.user_id,
        ul.login_date,
        CASE 
            WHEN DATEDIFF(ul.login_date, ls.login_date) = 1 
            THEN ls.streak_start
            ELSE ul.login_date
        END,
        CASE 
            WHEN DATEDIFF(ul.login_date, ls.login_date) = 1 
            THEN ls.streak_length + 1
            ELSE 1
        END
    FROM user_logins ul
    INNER JOIN login_streaks ls ON ul.user_id = ls.user_id
    WHERE ul.login_date > ls.login_date
)
SELECT 
    user_id,
    MAX(streak_length) AS max_streak
FROM login_streaks
GROUP BY user_id
HAVING MAX(streak_length) >= 7;
```

### 3. 分层数据统计

```sql
WITH RECURSIVE category_tree AS (
    -- 顶级分类
    SELECT 
        id,
        name,
        parent_id,
        0 AS level
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- 子分类
    SELECT 
        c.id,
        c.name,
        c.parent_id,
        ct.level + 1
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
),
category_sales AS (
    SELECT 
        p.category_id,
        SUM(oi.amount) AS total_sales
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.category_id
)
SELECT 
    ct.name,
    ct.level,
    COALESCE(cs.total_sales, 0) AS direct_sales,
    -- 计算包含子分类的总销售额需要进一步处理
    ct.id
FROM category_tree ct
LEFT JOIN category_sales cs ON ct.id = cs.category_id
ORDER BY ct.level, ct.name;
```

---

## 三大数据库的差异

| 特性 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| CTE | ✓（8.0+） | ✓ | ✓ |
| 递归 CTE | ✓（8.0+） | ✓ | ✓ |
| LATERAL 子查询 | ✗ | ✓（APPLY） | ✓ |
| CONNECT BY | ✗ | ✓ | ✗ |
| WITH 子句位置 | 开头 | 开头或子查询中 | 开头 |

**Oracle CONNECT BY（层级查询）**：
```sql
-- Oracle 特有语法
SELECT 
    LEVEL,
    id,
    name,
    parent_id
FROM departments
START WITH parent_id IS NULL
CONNECT BY PRIOR id = parent_id
ORDER SIBLINGS BY name;
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Subqueries: https://dev.mysql.com/doc/refman/8.0/en/subqueries.html
   - CTE: https://dev.mysql.com/doc/refman/8.0/en/with.html

2. **Oracle 官方文档**：
   - Subqueries: https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/SELECT.html
   - Hierarchical Queries: https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Hierarchical-Queries.html

3. **PostgreSQL 官方文档**：
   - WITH Queries: https://www.postgresql.org/docs/current/queries-with.html

4. **最佳实践**：
   - 优先使用 CTE 而非嵌套子查询（可读性更好）
   - 避免 NOT IN 配合可能有 NULL 的子查询
   - 复杂子查询考虑改写为 JOIN
   - 递归 CTE 必须有终止条件
   - 使用 EXPLAIN 分析子查询性能

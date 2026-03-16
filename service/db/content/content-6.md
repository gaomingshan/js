# 窗口函数

## 概述

窗口函数（Window Function），也称为分析函数，是 SQL 中强大的数据分析工具。与聚合函数不同，窗口函数对一组行进行计算，但不会将结果合并成单行，而是为每一行返回一个值。

**核心概念**：
- **窗口**：函数计算时考虑的行集合
- **分区**：将数据分组，每个分组独立计算
- **排序**：窗口内的行顺序
- **窗口帧**：当前行周围的行范围

**常用窗口函数**：
- **排名函数**：ROW_NUMBER、RANK、DENSE_RANK、NTILE
- **偏移函数**：LAG、LEAD、FIRST_VALUE、LAST_VALUE
- **聚合窗口函数**：SUM、AVG、COUNT、MAX、MIN

---

## 核心概念

### 1. 基础语法

```sql
<window_function> OVER (
    [PARTITION BY partition_expression]
    [ORDER BY sort_expression]
    [ROWS|RANGE frame_clause]
)
```

**示例**：
```sql
SELECT 
    username,
    city,
    age,
    ROW_NUMBER() OVER (PARTITION BY city ORDER BY age DESC) AS rank_in_city
FROM users;
```

### 2. PARTITION BY - 分区

将数据分成多个独立的组，每个组内独立计算。

```sql
-- 按城市分区，计算每个城市内的排名
SELECT 
    city,
    username,
    age,
    ROW_NUMBER() OVER (PARTITION BY city ORDER BY age DESC) AS rank
FROM users;

-- 不使用 PARTITION BY，所有行作为一个窗口
SELECT 
    username,
    age,
    ROW_NUMBER() OVER (ORDER BY age DESC) AS overall_rank
FROM users;
```

### 3. ORDER BY - 排序

指定窗口内的行顺序。

```sql
SELECT 
    username,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) AS registration_order
FROM users;

-- 多列排序
SELECT 
    username,
    city,
    age,
    ROW_NUMBER() OVER (ORDER BY city, age DESC) AS rank
FROM users;
```

---

## 排名函数

### 1. ROW_NUMBER()

为每一行分配唯一的序号，即使有相同值也不重复。

```sql
SELECT 
    username,
    age,
    ROW_NUMBER() OVER (ORDER BY age DESC) AS row_num
FROM users;

-- 结果示例：
-- username | age | row_num
-- alice    | 30  | 1
-- bob      | 30  | 2  -- 年龄相同，但序号不同
-- charlie  | 25  | 3
```

**应用场景：分页、去重**

```sql
-- 每个城市取前3名用户
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

### 2. RANK()

相同值获得相同排名，后续排名会跳过。

```sql
SELECT 
    username,
    age,
    RANK() OVER (ORDER BY age DESC) AS rank
FROM users;

-- 结果示例：
-- username | age | rank
-- alice    | 30  | 1
-- bob      | 30  | 1  -- 相同排名
-- charlie  | 25  | 3  -- 跳过了 2
```

### 3. DENSE_RANK()

相同值获得相同排名，后续排名不跳过。

```sql
SELECT 
    username,
    age,
    DENSE_RANK() OVER (ORDER BY age DESC) AS dense_rank
FROM users;

-- 结果示例：
-- username | age | dense_rank
-- alice    | 30  | 1
-- bob      | 30  | 1  -- 相同排名
-- charlie  | 25  | 2  -- 不跳过
```

### 4. 三种排名函数对比

```sql
SELECT 
    username,
    score,
    ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num,
    RANK() OVER (ORDER BY score DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM exam_scores;

-- 结果对比：
-- username | score | row_num | rank | dense_rank
-- alice    | 95    | 1       | 1    | 1
-- bob      | 95    | 2       | 1    | 1
-- charlie  | 90    | 3       | 3    | 2
-- david    | 85    | 4       | 4    | 3
```

### 5. NTILE(n)

将数据分成 n 个桶，返回桶编号。

```sql
-- 将用户分成 4 组（四分位数）
SELECT 
    username,
    age,
    NTILE(4) OVER (ORDER BY age) AS quartile
FROM users;

-- 应用：数据分析、分层抽样
SELECT 
    quartile,
    COUNT(*) AS user_count,
    AVG(age) AS avg_age
FROM (
    SELECT age, NTILE(4) OVER (ORDER BY age) AS quartile
    FROM users
) t
GROUP BY quartile;
```

---

## 偏移函数

### 1. LAG() - 访问前一行

```sql
-- 查看上一条记录
SELECT 
    username,
    created_at,
    LAG(created_at, 1) OVER (ORDER BY created_at) AS prev_registration
FROM users;

-- 指定默认值
SELECT 
    username,
    amount,
    LAG(amount, 1, 0) OVER (ORDER BY created_at) AS prev_amount
FROM orders;

-- 计算环比增长
SELECT 
    month,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY month) AS prev_month_revenue,
    revenue - LAG(revenue, 1) OVER (ORDER BY month) AS growth
FROM monthly_revenue;
```

### 2. LEAD() - 访问后一行

```sql
-- 查看下一条记录
SELECT 
    username,
    created_at,
    LEAD(created_at, 1) OVER (ORDER BY created_at) AS next_registration
FROM users;

-- 计算时间间隔
SELECT 
    user_id,
    login_time,
    LEAD(login_time, 1) OVER (PARTITION BY user_id ORDER BY login_time) AS next_login,
    TIMESTAMPDIFF(MINUTE, login_time, 
        LEAD(login_time, 1) OVER (PARTITION BY user_id ORDER BY login_time)
    ) AS minutes_until_next_login
FROM user_logins;
```

### 3. FIRST_VALUE() - 窗口第一个值

```sql
-- 获取每个城市第一个注册的用户
SELECT 
    city,
    username,
    created_at,
    FIRST_VALUE(username) OVER (
        PARTITION BY city 
        ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS first_user_in_city
FROM users;
```

### 4. LAST_VALUE() - 窗口最后一个值

```sql
-- 获取每个城市最后一个注册的用户
SELECT 
    city,
    username,
    created_at,
    LAST_VALUE(username) OVER (
        PARTITION BY city 
        ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS last_user_in_city
FROM users;
```

**注意**：LAST_VALUE 需要正确定义窗口帧，否则结果可能不符合预期。

---

## 聚合窗口函数

### 1. SUM OVER - 累计求和

```sql
-- 计算累计销售额
SELECT 
    order_date,
    amount,
    SUM(amount) OVER (ORDER BY order_date) AS cumulative_sales
FROM orders;

-- 按用户分区计算累计
SELECT 
    user_id,
    order_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY user_id 
        ORDER BY order_date
    ) AS user_cumulative_sales
FROM orders;
```

### 2. AVG OVER - 移动平均

```sql
-- 计算7天移动平均
SELECT 
    order_date,
    daily_sales,
    AVG(daily_sales) OVER (
        ORDER BY order_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS ma_7_days
FROM daily_sales;
```

### 3. COUNT OVER - 累计计数

```sql
-- 计算每个用户的订单序号
SELECT 
    user_id,
    order_id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS order_sequence,
    COUNT(*) OVER (PARTITION BY user_id ORDER BY created_at) AS orders_so_far
FROM orders;
```

### 4. MAX/MIN OVER

```sql
-- 比较当前值与历史最大值
SELECT 
    order_date,
    amount,
    MAX(amount) OVER (ORDER BY order_date) AS max_amount_so_far,
    amount - MAX(amount) OVER (ORDER BY order_date) AS diff_from_max
FROM orders;
```

---

## 窗口帧（Frame Clause）

窗口帧定义了窗口函数计算时考虑的行范围。

### 1. ROWS vs RANGE

**ROWS**：基于物理行数
**RANGE**：基于逻辑值范围

```sql
-- ROWS：物理行
SELECT 
    order_date,
    amount,
    SUM(amount) OVER (
        ORDER BY order_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS sum_last_3_rows
FROM orders;

-- RANGE：逻辑范围
SELECT 
    order_date,
    amount,
    SUM(amount) OVER (
        ORDER BY order_date
        RANGE BETWEEN INTERVAL 7 DAY PRECEDING AND CURRENT ROW
    ) AS sum_last_7_days
FROM orders;
```

### 2. 窗口帧边界

```sql
-- 从窗口开始到当前行
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW

-- 从当前行到窗口结束
ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING

-- 整个窗口
ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING

-- 前N行到后M行
ROWS BETWEEN 3 PRECEDING AND 2 FOLLOWING

-- 当前行
ROWS BETWEEN CURRENT ROW AND CURRENT ROW
```

### 3. 默认窗口帧

```sql
-- 有 ORDER BY 时，默认窗口帧是：
-- RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW

-- 无 ORDER BY 时，默认窗口帧是：
-- ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
```

---

## 命名窗口

定义一次，多次使用，提高可读性。

```sql
SELECT 
    username,
    city,
    age,
    ROW_NUMBER() OVER w AS row_num,
    RANK() OVER w AS rank,
    DENSE_RANK() OVER w AS dense_rank
FROM users
WINDOW w AS (PARTITION BY city ORDER BY age DESC);
```

---

## 生产实践示例

### 1. TopN 查询

```sql
-- 每个类别销量前3的产品
SELECT *
FROM (
    SELECT 
        category,
        product_name,
        sales,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) AS rn
    FROM products
) ranked
WHERE rn <= 3;
```

### 2. 同比环比分析

```sql
-- 计算月度销售的同比和环比
WITH monthly_sales AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS month,
        SUM(amount) AS revenue
    FROM orders
    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
)
SELECT 
    month,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY month) AS prev_month,
    LAG(revenue, 12) OVER (ORDER BY month) AS prev_year,
    ROUND((revenue - LAG(revenue, 1) OVER (ORDER BY month)) 
        / LAG(revenue, 1) OVER (ORDER BY month) * 100, 2) AS mom_growth,
    ROUND((revenue - LAG(revenue, 12) OVER (ORDER BY month)) 
        / LAG(revenue, 12) OVER (ORDER BY month) * 100, 2) AS yoy_growth
FROM monthly_sales;
```

### 3. 留存率分析

```sql
-- 计算用户注册后的活跃留存
WITH user_first_date AS (
    SELECT 
        user_id,
        MIN(DATE(created_at)) AS first_date
    FROM user_activities
    GROUP BY user_id
),
daily_active AS (
    SELECT DISTINCT
        user_id,
        DATE(activity_date) AS active_date
    FROM user_activities
),
retention AS (
    SELECT 
        ufd.first_date,
        DATEDIFF(da.active_date, ufd.first_date) AS day_diff,
        COUNT(DISTINCT da.user_id) AS active_users
    FROM user_first_date ufd
    LEFT JOIN daily_active da ON ufd.user_id = da.user_id
    GROUP BY ufd.first_date, DATEDIFF(da.active_date, ufd.first_date)
)
SELECT 
    first_date,
    day_diff,
    active_users,
    FIRST_VALUE(active_users) OVER (
        PARTITION BY first_date ORDER BY day_diff
    ) AS day0_users,
    ROUND(active_users * 100.0 / FIRST_VALUE(active_users) OVER (
        PARTITION BY first_date ORDER BY day_diff
    ), 2) AS retention_rate
FROM retention
WHERE day_diff BETWEEN 0 AND 30
ORDER BY first_date, day_diff;
```

### 4. 连续登录检测

```sql
-- 查找连续登录7天以上的用户
WITH login_sequences AS (
    SELECT 
        user_id,
        login_date,
        DATE_SUB(login_date, INTERVAL ROW_NUMBER() OVER (
            PARTITION BY user_id ORDER BY login_date
        ) DAY) AS group_date
    FROM (
        SELECT DISTINCT user_id, DATE(login_time) AS login_date
        FROM user_logins
    ) daily_logins
)
SELECT 
    user_id,
    MIN(login_date) AS streak_start,
    MAX(login_date) AS streak_end,
    COUNT(*) AS streak_days
FROM login_sequences
GROUP BY user_id, group_date
HAVING COUNT(*) >= 7;
```

### 5. 库存预警

```sql
-- 计算产品库存消耗速度，预测缺货时间
WITH daily_sales AS (
    SELECT 
        product_id,
        DATE(order_date) AS sale_date,
        SUM(quantity) AS daily_quantity
    FROM order_items
    WHERE order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    GROUP BY product_id, DATE(order_date)
),
avg_sales AS (
    SELECT 
        product_id,
        AVG(daily_quantity) AS avg_daily_sales,
        STDDEV(daily_quantity) AS stddev_sales
    FROM daily_sales
    GROUP BY product_id
)
SELECT 
    p.product_id,
    p.product_name,
    p.current_stock,
    a.avg_daily_sales,
    ROUND(p.current_stock / NULLIF(a.avg_daily_sales, 0), 0) AS days_until_stockout
FROM products p
JOIN avg_sales a ON p.product_id = a.product_id
WHERE a.avg_daily_sales > 0
    AND p.current_stock / NULLIF(a.avg_daily_sales, 0) < 30
ORDER BY days_until_stockout;
```

---

## 易错点与边界

### 1. LAST_VALUE 的窗口帧陷阱

```sql
-- 错误：默认窗口帧只到当前行
SELECT 
    username,
    age,
    LAST_VALUE(age) OVER (ORDER BY age) AS last_age
FROM users;
-- last_age 总是等于当前行的 age

-- 正确：显式指定窗口帧到结尾
SELECT 
    username,
    age,
    LAST_VALUE(age) OVER (
        ORDER BY age
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS last_age
FROM users;
```

### 2. 窗口函数不能在 WHERE 中使用

```sql
-- 错误：WHERE 子句不能使用窗口函数
SELECT username, age
FROM users
WHERE ROW_NUMBER() OVER (ORDER BY age) <= 10;

-- 正确：使用子查询
SELECT username, age
FROM (
    SELECT 
        username, 
        age,
        ROW_NUMBER() OVER (ORDER BY age) AS rn
    FROM users
) t
WHERE rn <= 10;
```

### 3. 分区字段为 NULL

```sql
-- NULL 值会被分到同一个分区
SELECT 
    city,  -- 有 NULL 值
    username,
    ROW_NUMBER() OVER (PARTITION BY city ORDER BY age) AS rn
FROM users;
-- city 为 NULL 的行会在同一个分区
```

### 4. ORDER BY 与窗口函数的顺序

```sql
-- 窗口函数在 SELECT 后执行，但在最终 ORDER BY 前执行
SELECT 
    username,
    age,
    ROW_NUMBER() OVER (ORDER BY age DESC) AS rank_by_age
FROM users
ORDER BY username;  -- 最终结果按 username 排序，rank_by_age 按 age 排序
```

---

## 三大数据库的窗口函数支持

| 函数 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| ROW_NUMBER | ✓（8.0+） | ✓ | ✓ |
| RANK | ✓（8.0+） | ✓ | ✓ |
| DENSE_RANK | ✓（8.0+） | ✓ | ✓ |
| NTILE | ✓（8.0+） | ✓ | ✓ |
| LAG/LEAD | ✓（8.0+） | ✓ | ✓ |
| FIRST_VALUE/LAST_VALUE | ✓（8.0+） | ✓ | ✓ |
| NTH_VALUE | ✓（8.0+） | ✓ | ✓ |
| CUME_DIST | ✓（8.0+） | ✓ | ✓ |
| PERCENT_RANK | ✓（8.0+） | ✓ | ✓ |
| 命名窗口 | ✓（8.0+） | ✗ | ✓ |

**注意**：
- MySQL 8.0 之前不支持窗口函数
- Oracle 一直支持窗口函数（称为分析函数）
- PostgreSQL 对窗口函数支持最完善

---

## 窗口函数 vs 聚合函数

| 对比项 | 聚合函数 | 窗口函数 |
|--------|----------|----------|
| 结果行数 | 减少（分组） | 不变 |
| GROUP BY | 必须 | 不需要 |
| 每行结果 | 一组的聚合值 | 独立计算 |
| 使用场景 | 汇总统计 | 排名、趋势分析 |

```sql
-- 聚合函数：每个城市一行
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city;

-- 窗口函数：每个用户一行，显示所在城市的总人数
SELECT 
    city,
    username,
    COUNT(*) OVER (PARTITION BY city) AS user_count_in_city
FROM users;
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Window Functions: https://dev.mysql.com/doc/refman/8.0/en/window-functions.html
   - Window Function Concepts: https://dev.mysql.com/doc/refman/8.0/en/window-functions-usage.html

2. **Oracle 官方文档**：
   - Analytic Functions: https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Analytic-Functions.html

3. **PostgreSQL 官方文档**：
   - Window Functions: https://www.postgresql.org/docs/current/tutorial-window.html
   - Window Function Processing: https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS

4. **最佳实践**：
   - 窗口函数通常比自连接或子查询性能更好
   - 使用命名窗口提高可读性
   - 注意 LAST_VALUE 的窗口帧定义
   - 合理使用 PARTITION BY 减少计算范围
   - 窗口函数结果需要过滤时使用子查询

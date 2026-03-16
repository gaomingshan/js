# 视图与物化视图

## 概述

视图（View）是基于 SQL 查询结果的虚拟表，物化视图（Materialized View）则是将查询结果物理存储的表。两者都用于简化复杂查询、提供数据抽象层、控制数据访问权限，但在性能和数据实时性上有本质区别。

**核心概念**：
- **普通视图**：虚拟表，查询时动态计算
- **物化视图**：物理表，存储查询结果
- **视图优势**：简化查询、安全控制、逻辑独立性
- **物化视图优势**：查询性能提升、预计算结果

---

## 普通视图（View）

### 1. 视图基础

**创建视图**：
```sql
-- MySQL
CREATE VIEW v_user_orders AS
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.amount), 0) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username, u.email;

-- 查询视图
SELECT * FROM v_user_orders WHERE order_count > 10;

-- Oracle
CREATE VIEW v_user_orders AS
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(o.id) AS order_count,
    NVL(SUM(o.amount), 0) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username, u.email;

-- PostgreSQL
CREATE VIEW v_user_orders AS
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.amount), 0) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username, u.email;
```

**修改视图**：
```sql
-- MySQL/PostgreSQL
CREATE OR REPLACE VIEW v_user_orders AS
SELECT 
    u.id,
    u.username,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- Oracle
CREATE OR REPLACE VIEW v_user_orders AS
SELECT 
    u.id,
    u.username,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

**删除视图**：
```sql
DROP VIEW v_user_orders;

-- 如果存在则删除
DROP VIEW IF EXISTS v_user_orders;
```

### 2. 视图的优势

**简化复杂查询**：
```sql
-- 复杂查询
SELECT 
    u.username,
    COUNT(DISTINCT o.id) AS order_count,
    SUM(oi.quantity * oi.price) AS total_amount,
    AVG(o.amount) AS avg_order_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY u.id, u.username;

-- 创建视图简化
CREATE VIEW v_user_sales_summary AS
SELECT 
    u.username,
    COUNT(DISTINCT o.id) AS order_count,
    SUM(oi.quantity * oi.price) AS total_amount,
    AVG(o.amount) AS avg_order_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY u.id, u.username;

-- 简化后的查询
SELECT * FROM v_user_sales_summary WHERE order_count > 10;
```

**数据安全控制**：
```sql
-- 创建只包含部分列的视图
CREATE VIEW v_public_users AS
SELECT id, username, avatar_url, created_at
FROM users;

-- 授权用户只能访问视图，不能访问原表
GRANT SELECT ON v_public_users TO 'app_user'@'%';

-- 用户看不到敏感信息（email, password_hash 等）
```

**逻辑独立性**：
```sql
-- 表结构变化时，视图可以保持接口不变

-- 原表
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    full_name VARCHAR(100)
);

-- 视图
CREATE VIEW v_users AS
SELECT id, full_name AS name FROM users;

-- 应用程序使用视图
SELECT * FROM v_users;

-- 表结构变更
ALTER TABLE users 
DROP COLUMN full_name,
ADD COLUMN first_name VARCHAR(50),
ADD COLUMN last_name VARCHAR(50);

-- 更新视图定义
CREATE OR REPLACE VIEW v_users AS
SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM users;

-- 应用程序代码无需修改
SELECT * FROM v_users;
```

### 3. 可更新视图

**可更新的条件**：
```
视图满足以下条件时可以 INSERT/UPDATE/DELETE：
1. SELECT 不包含聚合函数、DISTINCT、GROUP BY、HAVING
2. SELECT 不包含 UNION
3. FROM 只包含一个基表
4. 没有子查询
```

**示例**：
```sql
-- 可更新视图
CREATE VIEW v_active_users AS
SELECT id, username, email
FROM users
WHERE status = 1;

-- 可以更新
UPDATE v_active_users SET email = 'new@example.com' WHERE id = 1;
-- 实际执行：UPDATE users SET email = 'new@example.com' WHERE id = 1 AND status = 1;

-- 可以插入
INSERT INTO v_active_users (username, email) VALUES ('alice', 'alice@example.com');
-- 问题：status 列没有值，可能插入失败或 status != 1

-- 使用 WITH CHECK OPTION 确保数据一致性
CREATE OR REPLACE VIEW v_active_users AS
SELECT id, username, email
FROM users
WHERE status = 1
WITH CHECK OPTION;

-- 现在插入会失败（因为 status 不是 1）
INSERT INTO v_active_users (username, email) VALUES ('alice', 'alice@example.com');
-- ERROR
```

**不可更新的视图**：
```sql
-- 包含聚合函数
CREATE VIEW v_city_stats AS
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city;

-- 不可更新
UPDATE v_city_stats SET user_count = 100 WHERE city = 'Beijing';
-- ERROR

-- 包含 JOIN
CREATE VIEW v_user_orders AS
SELECT u.username, o.order_id, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id;

-- 可能不可更新（取决于数据库）
```

### 4. 视图的性能

**视图不存储数据**：
```sql
-- 视图查询
SELECT * FROM v_user_orders WHERE order_count > 10;

-- 实际执行（展开视图定义）
SELECT * FROM (
    SELECT 
        u.id,
        u.username,
        COUNT(o.id) AS order_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id, u.username
) t
WHERE order_count > 10;

-- 性能：
-- - 每次查询都执行完整的 JOIN 和 GROUP BY
-- - 无法利用索引（在视图上）
-- - 性能等同于直接查询
```

**视图性能优化**：
```sql
-- 问题：视图查询慢
SELECT * FROM v_user_orders WHERE username = 'alice';

-- 优化：确保基表有索引
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_user_id ON orders(user_id);

-- 视图查询会利用基表索引
```

---

## 物化视图（Materialized View）

### 1. 物化视图基础

物化视图将查询结果物理存储，查询时直接读取结果，不需要重新计算。

**Oracle**：
```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW mv_user_orders
BUILD IMMEDIATE
REFRESH FAST ON COMMIT
AS
SELECT 
    u.id,
    u.username,
    COUNT(o.id) AS order_count,
    SUM(o.amount) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- 查询物化视图（快速，直接读取存储的数据）
SELECT * FROM mv_user_orders WHERE order_count > 10;

-- 刷新物化视图
EXEC DBMS_MVIEW.REFRESH('MV_USER_ORDERS');
```

**PostgreSQL**：
```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW mv_user_orders AS
SELECT 
    u.id,
    u.username,
    COUNT(o.id) AS order_count,
    SUM(o.amount) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- 创建索引
CREATE INDEX idx_mv_username ON mv_user_orders(username);

-- 查询物化视图
SELECT * FROM mv_user_orders WHERE order_count > 10;

-- 刷新物化视图
REFRESH MATERIALIZED VIEW mv_user_orders;

-- 并发刷新（不阻塞查询）
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_orders;
```

**MySQL**：
```sql
-- MySQL 不直接支持物化视图
-- 可以用表模拟

-- 创建表存储结果
CREATE TABLE mv_user_orders AS
SELECT 
    u.id,
    u.username,
    COUNT(o.id) AS order_count,
    SUM(o.amount) AS total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- 创建索引
CREATE INDEX idx_username ON mv_user_orders(username);

-- 定期刷新（通过事件或定时任务）
CREATE EVENT evt_refresh_mv_user_orders
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    TRUNCATE TABLE mv_user_orders;
    INSERT INTO mv_user_orders
    SELECT 
        u.id,
        u.username,
        COUNT(o.id) AS order_count,
        SUM(o.amount) AS total_amount
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id, u.username;
END;
```

### 2. 物化视图刷新策略

**完全刷新（COMPLETE）**：
```sql
-- Oracle
CREATE MATERIALIZED VIEW mv_user_orders
REFRESH COMPLETE ON DEMAND
AS
SELECT ...;

-- 完全删除并重建
-- 适用：数据变化大，增量刷新不划算
```

**快速刷新（FAST）**：
```sql
-- Oracle
CREATE MATERIALIZED VIEW mv_user_orders
REFRESH FAST ON COMMIT
AS
SELECT ...;

-- 只刷新变化的数据
-- 要求：基表有物化视图日志

-- 创建物化视图日志
CREATE MATERIALIZED VIEW LOG ON users
WITH ROWID, SEQUENCE (id, username)
INCLUDING NEW VALUES;

CREATE MATERIALIZED VIEW LOG ON orders
WITH ROWID, SEQUENCE (id, user_id, amount)
INCLUDING NEW VALUES;
```

**PostgreSQL 增量刷新**：
```sql
-- PostgreSQL 原生不支持增量刷新
-- 可以手动实现

-- 方案1：使用触发器
CREATE OR REPLACE FUNCTION refresh_mv_user_orders()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_orders;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_mv
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_mv_user_orders();

-- 方案2：定期刷新
-- 使用 pg_cron
SELECT cron.schedule('refresh-mv', '0 * * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_orders');
```

**刷新时机**：
```sql
-- ON DEMAND：手动刷新
CREATE MATERIALIZED VIEW mv_user_orders
REFRESH ON DEMAND
AS SELECT ...;

-- ON COMMIT：提交时刷新（实时，但影响性能）
CREATE MATERIALIZED VIEW mv_user_orders
REFRESH FAST ON COMMIT
AS SELECT ...;

-- 定时刷新
BEGIN
    DBMS_SCHEDULER.CREATE_JOB(
        job_name => 'refresh_mv_job',
        job_type => 'PLSQL_BLOCK',
        job_action => 'BEGIN DBMS_MVIEW.REFRESH(''MV_USER_ORDERS''); END;',
        start_date => SYSTIMESTAMP,
        repeat_interval => 'FREQ=HOURLY; INTERVAL=1',
        enabled => TRUE
    );
END;
```

### 3. 物化视图的优势

**查询性能提升**：
```sql
-- 复杂聚合查询
-- 普通视图：每次查询都重新计算
SELECT * FROM v_sales_summary WHERE region = 'North';
-- 执行时间：5 秒

-- 物化视图：直接读取预计算结果
SELECT * FROM mv_sales_summary WHERE region = 'North';
-- 执行时间：0.01 秒

-- 性能提升：500 倍
```

**减轻数据库负载**：
```sql
-- 场景：实时仪表板，每秒查询 100 次

-- 使用普通视图：
-- 每秒执行 100 次复杂 JOIN 和聚合
-- CPU 使用率：80%

-- 使用物化视图：
-- 每秒只是简单的索引查找
-- CPU 使用率：5%
-- 物化视图每小时刷新一次
```

**支持复杂计算**：
```sql
-- 物化视图可以包含复杂计算
CREATE MATERIALIZED VIEW mv_sales_analysis AS
SELECT 
    date_trunc('month', order_date) AS month,
    region,
    product_category,
    COUNT(DISTINCT user_id) AS unique_customers,
    COUNT(*) AS order_count,
    SUM(amount) AS total_revenue,
    AVG(amount) AS avg_order_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median_order_value
FROM orders
JOIN order_items USING (order_id)
JOIN products USING (product_id)
GROUP BY month, region, product_category;

-- 查询非常快
SELECT * FROM mv_sales_analysis 
WHERE month >= '2024-01-01' AND region = 'North';
```

### 4. 物化视图的劣势

**数据不是实时的**：
```sql
-- 物化视图显示的是上次刷新时的数据

-- 基表更新
INSERT INTO orders VALUES (...);

-- 物化视图未刷新，看不到新数据
SELECT * FROM mv_user_orders;  -- 不包括新订单

-- 需要刷新
REFRESH MATERIALIZED VIEW mv_user_orders;

-- 现在可以看到新数据
SELECT * FROM mv_user_orders;
```

**占用存储空间**：
```sql
-- 物化视图存储完整的查询结果

-- 查看物化视图大小
SELECT 
    schemaname,
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) AS size
FROM pg_matviews
WHERE schemaname = 'public';

-- 可能占用大量空间
```

**刷新成本**：
```sql
-- 完全刷新可能很慢
REFRESH MATERIALIZED VIEW mv_large_summary;
-- 如果基表数据量大，刷新可能需要几分钟甚至几小时

-- 刷新期间可能锁表（取决于刷新方式）
```

---

## 视图 vs 物化视图

| 特性 | 普通视图 | 物化视图 |
|------|----------|----------|
| 数据存储 | 不存储，虚拟表 | 物理存储 |
| 查询性能 | 等同于原查询 | 快速，直接读取 |
| 数据实时性 | 实时 | 取决于刷新频率 |
| 存储空间 | 几乎不占用 | 占用存储 |
| 维护成本 | 低 | 高（需要刷新） |
| 适用场景 | 简化查询、权限控制 | 复杂查询、报表、仪表板 |

---

## 使用场景

### 1. 普通视图适用场景

**权限控制**：
```sql
-- 限制用户只能看到部分数据
CREATE VIEW v_department_users AS
SELECT id, username, email, department
FROM users
WHERE department = 'Sales';

GRANT SELECT ON v_department_users TO 'sales_manager'@'%';
```

**简化查询**：
```sql
-- 封装复杂 JOIN
CREATE VIEW v_order_details AS
SELECT 
    o.id,
    o.order_no,
    u.username,
    u.email,
    p.product_name,
    oi.quantity,
    oi.price
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;

-- 简化应用层查询
SELECT * FROM v_order_details WHERE order_no = 'ORD001';
```

**数据抽象**：
```sql
-- 提供统一接口
CREATE VIEW v_customer_info AS
SELECT 
    id AS customer_id,
    CONCAT(first_name, ' ', last_name) AS customer_name,
    email,
    phone
FROM users
WHERE user_type = 'customer';
```

### 2. 物化视图适用场景

**数据仓库/报表**：
```sql
-- 每日销售汇总
CREATE MATERIALIZED VIEW mv_daily_sales AS
SELECT 
    DATE(order_date) AS sale_date,
    region,
    SUM(amount) AS daily_revenue,
    COUNT(*) AS order_count
FROM orders
GROUP BY DATE(order_date), region;

-- 每天凌晨刷新一次
-- 白天查询非常快
```

**仪表板/BI**：
```sql
-- 实时仪表板（每 5 分钟刷新）
CREATE MATERIALIZED VIEW mv_dashboard_metrics AS
SELECT 
    COUNT(DISTINCT user_id) AS active_users,
    COUNT(*) AS total_orders,
    SUM(amount) AS total_revenue,
    AVG(amount) AS avg_order_value
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days';

-- 定时刷新
SELECT cron.schedule('refresh-dashboard', '*/5 * * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_metrics');
```

**复杂聚合查询**：
```sql
-- 用户行为分析
CREATE MATERIALIZED VIEW mv_user_behavior AS
SELECT 
    user_id,
    COUNT(DISTINCT DATE(login_time)) AS login_days,
    COUNT(*) AS total_logins,
    MAX(login_time) AS last_login,
    COUNT(DISTINCT session_id) AS session_count,
    AVG(session_duration) AS avg_session_duration
FROM user_activities
GROUP BY user_id;

-- 查询快速
SELECT * FROM mv_user_behavior WHERE login_days > 20;
```

---

## 最佳实践

### 1. 视图设计

```sql
-- ✅ 好的视图设计
-- 1. 明确命名
CREATE VIEW v_active_users AS ...

-- 2. 添加注释
COMMENT ON VIEW v_active_users IS '活跃用户视图，仅包含 status=1 的用户';

-- 3. 合理的列选择
CREATE VIEW v_public_users AS
SELECT id, username, avatar_url, created_at  -- 只包含必要的列
FROM users;

-- 4. 使用 WITH CHECK OPTION
CREATE VIEW v_admin_users AS
SELECT * FROM users WHERE role = 'admin'
WITH CHECK OPTION;

-- ❌ 不好的设计
-- 1. SELECT *
CREATE VIEW v_users AS SELECT * FROM users;  -- 耦合度高

-- 2. 过于复杂
CREATE VIEW v_complex AS
SELECT ... FROM t1 
JOIN t2 ON ... 
JOIN t3 ON ...
JOIN t4 ON ...
WHERE ... ;  -- 太复杂，难以维护
```

### 2. 物化视图刷新策略

```sql
-- 根据数据更新频率选择刷新策略

-- 实时性要求高（分钟级）
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_real_time EVERY 5 MINUTES;

-- 实时性要求中等（小时级）
REFRESH MATERIALIZED VIEW mv_hourly EVERY 1 HOUR;

-- 实时性要求低（天级）
REFRESH MATERIALIZED VIEW mv_daily AT 02:00 DAILY;

-- 大数据量：使用增量刷新
REFRESH MATERIALIZED VIEW FAST mv_large;
```

### 3. 性能优化

```sql
-- 1. 在物化视图上创建索引
CREATE INDEX idx_mv_region ON mv_sales_summary(region);
CREATE INDEX idx_mv_date ON mv_sales_summary(sale_date);

-- 2. 分区物化视图（Oracle）
CREATE MATERIALIZED VIEW mv_sales_partitioned
PARTITION BY RANGE (sale_date) (...)
AS SELECT ...;

-- 3. 并发刷新（PostgreSQL）
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_summary;
-- 需要唯一索引

-- 4. 监控刷新时间
-- 如果刷新时间过长，考虑优化查询或增加刷新间隔
```

---

## 生产环境案例

### 1. 电商销售分析

```sql
-- 场景：销售仪表板，展示各维度销售数据

-- 物化视图
CREATE MATERIALIZED VIEW mv_sales_analysis AS
SELECT 
    DATE_TRUNC('day', created_at) AS sale_date,
    region,
    category,
    COUNT(DISTINCT user_id) AS unique_buyers,
    COUNT(*) AS order_count,
    SUM(amount) AS total_revenue,
    AVG(amount) AS avg_order_value
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'completed'
GROUP BY sale_date, region, category;

-- 创建索引
CREATE INDEX idx_mv_sales_date ON mv_sales_analysis(sale_date);
CREATE INDEX idx_mv_sales_region ON mv_sales_analysis(region);

-- 每小时刷新
SELECT cron.schedule('refresh-sales', '0 * * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_analysis');

-- 查询（毫秒级）
SELECT * FROM mv_sales_analysis 
WHERE sale_date >= CURRENT_DATE - 30 
    AND region = 'North';
```

### 2. 用户权限视图

```sql
-- 场景：不同角色看到不同数据

-- 管理员视图
CREATE VIEW v_admin_users AS
SELECT * FROM users;

GRANT SELECT ON v_admin_users TO 'admin'@'%';

-- 普通用户视图
CREATE VIEW v_public_users AS
SELECT id, username, avatar_url, bio, created_at
FROM users
WHERE status = 1;

GRANT SELECT ON v_public_users TO 'app_user'@'%';

-- 部门经理视图
CREATE VIEW v_department_users AS
SELECT id, username, email, phone, department
FROM users
WHERE department = (
    SELECT department FROM users WHERE username = CURRENT_USER()
);

GRANT SELECT ON v_department_users TO 'manager'@'%';
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Views: https://dev.mysql.com/doc/refman/8.0/en/views.html

2. **Oracle 官方文档**：
   - Materialized Views: https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/managing-materialized-views.html

3. **PostgreSQL 官方文档**：
   - Materialized Views: https://www.postgresql.org/docs/current/sql-creatematerializedview.html

4. **最佳实践**：
   - 视图用于简化查询和权限控制
   - 物化视图用于提升复杂查询性能
   - 合理选择刷新策略
   - 在物化视图上创建索引
   - 监控刷新性能和数据延迟

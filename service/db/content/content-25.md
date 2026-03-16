# 查询优化技巧

## 概述

查询优化是提升数据库性能最直接有效的手段。掌握常见的查询优化技巧，可以在不增加硬件成本的情况下，显著提升系统性能。本章介绍实战中最常用的查询优化方法。

**核心技巧**：
- **索引优化**：合理使用索引
- **查询改写**：优化 SQL 语句
- **减少数据量**：只查询必要的数据
- **避免函数计算**：减少 CPU 开销
- **利用缓存**：减少数据库压力

---

## SELECT 优化

### 1. 避免 SELECT *

**问题**：
```sql
-- 不好：查询所有列
SELECT * FROM users WHERE id = 100;

-- 问题：
-- 1. 传输不需要的数据
-- 2. 无法利用覆盖索引
-- 3. 增加网络传输
-- 4. 增加内存消耗
```

**优化**：
```sql
-- 好：只查询需要的列
SELECT id, username, email FROM users WHERE id = 100;

-- 优势：
-- 1. 减少数据传输
-- 2. 可能利用覆盖索引
-- 3. 提升查询性能
```

**覆盖索引示例**：
```sql
-- 创建覆盖索引
CREATE INDEX idx_username_email ON users(username, email);

-- 利用覆盖索引（无需回表）
SELECT username, email FROM users WHERE username = 'alice';
-- EXPLAIN: Using index

-- 无法利用覆盖索引（需要回表）
SELECT * FROM users WHERE username = 'alice';
-- EXPLAIN: Using where
```

### 2. 限制返回行数

**使用 LIMIT**：
```sql
-- 不好：返回所有数据
SELECT * FROM orders WHERE status = 1;
-- 可能返回几百万行

-- 好：限制返回行数
SELECT * FROM orders WHERE status = 1 LIMIT 100;
-- 只返回 100 行

-- 更好：分页查询
SELECT * FROM orders WHERE status = 1 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;
```

**EXISTS 代替 COUNT**：
```sql
-- 不好：只需判断存在性却 COUNT
SELECT COUNT(*) FROM orders WHERE user_id = 100;
-- 扫描所有匹配行

-- 好：使用 EXISTS
SELECT EXISTS(SELECT 1 FROM orders WHERE user_id = 100 LIMIT 1);
-- 找到一行即停止
```

### 3. 避免重复查询

**使用 JOIN 代替多次查询**：
```sql
-- 不好：N+1 查询
SELECT * FROM users;
-- 应用层循环
for user in users:
    SELECT * FROM orders WHERE user_id = user.id;

-- 好：一次 JOIN 查询
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

**使用 IN 代替多次查询**：
```sql
-- 不好：多次查询
SELECT * FROM users WHERE id = 1;
SELECT * FROM users WHERE id = 2;
SELECT * FROM users WHERE id = 3;

-- 好：一次查询
SELECT * FROM users WHERE id IN (1, 2, 3);
```

---

## WHERE 优化

### 1. 索引列避免函数计算

**问题**：
```sql
-- 不好：索引列使用函数
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- 索引失效，全表扫描

SELECT * FROM users WHERE UPPER(username) = 'ALICE';
-- 索引失效
```

**优化**：
```sql
-- 好：改为范围查询
SELECT * FROM users 
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
-- 使用索引

-- 好：创建函数索引或改应用层逻辑
CREATE INDEX idx_upper_username ON users((UPPER(username)));
SELECT * FROM users WHERE UPPER(username) = 'ALICE';
-- 使用函数索引
```

### 2. 避免隐式类型转换

**问题**：
```sql
-- 表结构
CREATE TABLE users (
    phone VARCHAR(20),
    INDEX idx_phone (phone)
);

-- 不好：隐式转换
SELECT * FROM users WHERE phone = 13800138000;
-- 字符串列与数字比较，索引失效

-- 好：使用正确类型
SELECT * FROM users WHERE phone = '13800138000';
-- 使用索引
```

### 3. 优化 OR 条件

**问题**：
```sql
-- 不好：OR 连接不同列
SELECT * FROM users WHERE username = 'alice' OR email = 'alice@example.com';
-- 可能无法有效使用索引
```

**优化**：
```sql
-- 好：改为 UNION
SELECT * FROM users WHERE username = 'alice'
UNION
SELECT * FROM users WHERE email = 'alice@example.com';
-- 分别使用索引
```

**IN 代替 OR**：
```sql
-- 不好
SELECT * FROM users WHERE id = 1 OR id = 2 OR id = 3;

-- 好
SELECT * FROM users WHERE id IN (1, 2, 3);
```

### 4. 避免 NOT、!=、<>

**问题**：
```sql
-- 不好：不等于通常不使用索引
SELECT * FROM orders WHERE status != 1;
SELECT * FROM orders WHERE status <> 1;
SELECT * FROM orders WHERE NOT status = 1;

-- 可能全表扫描
```

**优化**：
```sql
-- 好：改为 IN（如果值域小）
SELECT * FROM orders WHERE status IN (0, 2, 3, 4);

-- 或使用范围查询
SELECT * FROM orders WHERE status > 1 OR status < 1;
```

### 5. LIKE 优化

**前缀匹配**：
```sql
-- 好：前缀匹配可以使用索引
SELECT * FROM users WHERE username LIKE 'alice%';
-- 使用索引

-- 不好：后缀或中间匹配无法使用索引
SELECT * FROM users WHERE username LIKE '%alice';
SELECT * FROM users WHERE username LIKE '%alice%';
-- 全表扫描
```

**全文索引**：
```sql
-- 对于模糊搜索，使用全文索引
CREATE FULLTEXT INDEX ft_username ON users(username);

SELECT * FROM users WHERE MATCH(username) AGAINST('alice' IN BOOLEAN MODE);
```

---

## JOIN 优化

### 1. 小表驱动大表

**原则**：
```sql
-- 小表作为驱动表，大表作为被驱动表

-- 表大小：
-- users: 100 行
-- orders: 10000 行

-- 好：小表驱动大表
SELECT * FROM users u
JOIN orders o ON u.id = o.user_id;
-- users 作为驱动表

-- 不好：大表驱动小表（如果优化器选择错误）
-- 使用 STRAIGHT_JOIN 强制顺序
SELECT * FROM users u
STRAIGHT_JOIN orders o ON u.id = o.user_id;
```

### 2. JOIN 列创建索引

**必须建索引**：
```sql
-- 不好：JOIN 列无索引
SELECT * FROM orders o
JOIN users u ON o.user_id = u.id;
-- users.id 有主键索引（好）
-- orders.user_id 无索引（差）

-- 好：在 JOIN 列创建索引
CREATE INDEX idx_user_id ON orders(user_id);

SELECT * FROM orders o
JOIN users u ON o.user_id = u.id;
-- 两边都有索引，性能大幅提升
```

### 3. 避免多表 JOIN

**减少 JOIN 表数**：
```sql
-- 不好：JOIN 过多表
SELECT * FROM t1
JOIN t2 ON ...
JOIN t3 ON ...
JOIN t4 ON ...
JOIN t5 ON ...
JOIN t6 ON ...;
-- 优化器难以选择最优方案
-- 执行计划复杂
-- 性能差

-- 好：拆分查询或使用临时表
-- 或考虑数据冗余减少 JOIN
```

---

## 子查询优化

### 1. JOIN 代替子查询

**问题**：
```sql
-- 不好：相关子查询
SELECT 
    id,
    username,
    (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count
FROM users;
-- 每行都执行一次子查询
```

**优化**：
```sql
-- 好：改为 JOIN
SELECT 
    u.id,
    u.username,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
-- 一次 JOIN 完成
```

### 2. EXISTS 代替 IN

**大数据量时优化**：
```sql
-- IN：子查询结果可能很大
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders);
-- 子查询可能返回百万行

-- EXISTS：找到即停止
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id LIMIT 1);
-- 找到一行即停止
```

---

## 排序优化

### 1. 利用索引排序

**创建支持排序的索引**：
```sql
-- 查询
SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 10;

-- 不好：无索引支持排序
-- EXPLAIN: Using filesort

-- 好：创建联合索引
CREATE INDEX idx_status_created ON orders(status, created_at);

SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 10;
-- EXPLAIN: 无 Using filesort
-- 利用索引顺序，无需额外排序
```

### 2. 减少排序数据量

**先过滤再排序**：
```sql
-- 不好：全表排序
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
-- 排序 100 万行

-- 好：先过滤再排序
SELECT * FROM orders 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC 
LIMIT 10;
-- 只排序近 7 天的数据
```

### 3. 避免排序大字段

**只排序必要的列**：
```sql
-- 不好：排序包含大字段
SELECT * FROM articles ORDER BY content DESC;
-- content 是 TEXT 类型，排序慢

-- 好：排序小字段
SELECT * FROM articles ORDER BY created_at DESC;
```

---

## 分组聚合优化

### 1. 索引优化 GROUP BY

**创建索引**：
```sql
-- 查询
SELECT city, COUNT(*) FROM users GROUP BY city;

-- 创建索引
CREATE INDEX idx_city ON users(city);

-- 可能利用松散索引扫描（Loose Index Scan）
-- 只扫描每个 city 的第一条记录
```

### 2. 减少分组数据量

**先过滤再分组**：
```sql
-- 不好：全表分组
SELECT city, COUNT(*) FROM users GROUP BY city;
-- 分组 100 万行

-- 好：先过滤
SELECT city, COUNT(*) 
FROM users 
WHERE status = 1
GROUP BY city;
-- 只分组活跃用户
```

### 3. 避免 HAVING 大量过滤

**WHERE 代替 HAVING**：
```sql
-- 不好：HAVING 过滤
SELECT city, COUNT(*) AS cnt
FROM users
GROUP BY city
HAVING city = 'Beijing';
-- 先分组所有 city，再过滤

-- 好：WHERE 过滤
SELECT city, COUNT(*) AS cnt
FROM users
WHERE city = 'Beijing'
GROUP BY city;
-- 先过滤 Beijing，再分组
```

---

## 分页查询优化

### 1. 深分页问题

**问题**：
```sql
-- 不好：深分页
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000000, 10;
-- 需要扫描 1000010 行，丢弃前 1000000 行
-- 性能极差
```

**优化方案1：延迟关联**：
```sql
-- 好：延迟关联
SELECT o.* FROM orders o
INNER JOIN (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 1000000, 10
) t ON o.id = t.id;

-- 子查询使用覆盖索引，快速定位 ID
-- 只对最终 10 行回表
```

**优化方案2：游标分页**：
```sql
-- 记录上次查询的最后一条记录的 ID 或时间
SELECT * FROM orders 
WHERE created_at < '2024-01-01 00:00:00'  -- 上次最后一条的时间
ORDER BY created_at DESC 
LIMIT 10;

-- 避免 OFFSET，性能稳定
```

### 2. 只统计必要的总数

**问题**：
```sql
-- 不好：每次都 COUNT
SELECT COUNT(*) FROM orders WHERE status = 1;
-- 如果数据量大，COUNT 很慢
```

**优化**：
```sql
-- 方案1：缓存总数
-- 使用 Redis 缓存总数
-- 定期或触发更新

-- 方案2：估算总数
-- 对于不需要精确值的场景
SELECT table_rows FROM information_schema.tables 
WHERE table_name = 'orders';

-- 方案3：只统计前N页
-- 如果总数超过 10000，显示 "10000+"
SELECT COUNT(*) FROM (
    SELECT 1 FROM orders WHERE status = 1 LIMIT 10000
) t;
```

---

## 临时表优化

### 1. 避免创建临时表

**问题标志**：
```sql
-- EXPLAIN 显示：Using temporary

-- 常见原因：
-- 1. DISTINCT 大量数据
-- 2. GROUP BY 未优化
-- 3. UNION
-- 4. 子查询
```

**优化**：
```sql
-- DISTINCT 优化
-- 不好
SELECT DISTINCT user_id FROM orders;

-- 好：如果只需存在性
SELECT user_id FROM orders GROUP BY user_id;

-- 或使用 EXISTS
SELECT u.id FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```

### 2. 内存临时表 vs 磁盘临时表

**配置**：
```ini
# my.cnf
[mysqld]
tmp_table_size = 64M
max_heap_table_size = 64M

# 超过此大小，临时表会转换为磁盘临时表（InnoDB）
# 性能显著下降
```

**优化**：
```sql
-- 减少临时表大小
-- 1. 只查询必要的列
-- 2. 增加 WHERE 过滤
-- 3. 调大临时表大小配置
```

---

## 批量操作优化

### 1. 批量插入

**问题**：
```sql
-- 不好：逐条插入
for data in dataset:
    INSERT INTO users VALUES (...);
-- 1000 次插入 = 1000 次网络往返 + 1000 次事务

-- 好：批量插入
INSERT INTO users VALUES
    (1, 'alice', 'alice@example.com'),
    (2, 'bob', 'bob@example.com'),
    (3, 'charlie', 'charlie@example.com'),
    ...
    (1000, 'user1000', 'user1000@example.com');
-- 1 次网络往返 + 1 次事务
-- 性能提升几十倍
```

**LOAD DATA**：
```sql
-- 大批量数据导入
LOAD DATA INFILE '/path/to/data.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';

-- 性能远超 INSERT
```

### 2. 批量更新

**问题**：
```sql
-- 不好：逐条更新
for id in ids:
    UPDATE users SET status = 1 WHERE id = id;

-- 好：批量更新
UPDATE users SET status = 1 WHERE id IN (1, 2, 3, ..., 1000);

-- 或使用 CASE WHEN
UPDATE users
SET vip_level = CASE id
    WHEN 1 THEN 3
    WHEN 2 THEN 2
    WHEN 3 THEN 1
    ELSE vip_level
END
WHERE id IN (1, 2, 3);
```

### 3. 批量删除

**问题**：
```sql
-- 不好：一次删除大量数据
DELETE FROM logs WHERE created_at < '2023-01-01';
-- 可能删除几百万行
-- 长时间锁表
-- 产生大量 binlog

-- 好：分批删除
WHILE 1 DO
    DELETE FROM logs WHERE created_at < '2023-01-01' LIMIT 1000;
    IF ROW_COUNT() = 0 THEN BREAK; END IF;
    SLEEP(0.1);  -- 间隔，减轻压力
END WHILE;
```

---

## 缓存优化

### 1. 查询结果缓存

**应用层缓存**：
```python
# 使用 Redis 缓存查询结果
def get_user(user_id):
    # 先查缓存
    cache_key = f"user:{user_id}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # 缓存未命中，查数据库
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    
    # 写入缓存
    redis.setex(cache_key, 3600, json.dumps(user))
    
    return user
```

### 2. 计数器缓存

**实时计数优化**：
```python
# 不好：每次都查数据库
def get_order_count(user_id):
    return db.query("SELECT COUNT(*) FROM orders WHERE user_id = ?", user_id)

# 好：使用 Redis 计数器
def get_order_count(user_id):
    cache_key = f"order_count:{user_id}"
    count = redis.get(cache_key)
    if count is None:
        # 初始化计数器
        count = db.query("SELECT COUNT(*) FROM orders WHERE user_id = ?", user_id)
        redis.set(cache_key, count)
    return int(count)

# 新增订单时增加计数
def create_order(user_id, ...):
    db.execute("INSERT INTO orders ...")
    redis.incr(f"order_count:{user_id}")
```

---

## 监控与诊断

### 1. 慢查询日志

**启用慢查询日志**：
```ini
# my.cnf
[mysqld]
slow_query_log = ON
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1  -- 超过 1 秒记录
log_queries_not_using_indexes = ON  -- 记录未使用索引的查询
```

**分析慢查询**：
```bash
# 使用 mysqldumpslow 分析
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log
# -s t: 按时间排序
# -t 10: 显示前 10 条

# 或使用 pt-query-digest（Percona Toolkit）
pt-query-digest /var/log/mysql/slow.log
```

### 2. 性能监控

**查询性能指标**：
```sql
-- MySQL
SELECT 
    query_sample_text,
    count_star,
    avg_timer_wait / 1000000000000 AS avg_time_sec,
    sum_rows_examined,
    sum_rows_sent
FROM performance_schema.events_statements_summary_by_digest
ORDER BY avg_timer_wait DESC
LIMIT 10;

-- 找出最耗时的查询
```

---

## 最佳实践总结

### 1. 查询优化清单

```
□ 只查询需要的列（避免 SELECT *）
□ 只查询需要的行（使用 LIMIT）
□ WHERE 条件有索引支持
□ 索引列避免函数计算
□ 避免隐式类型转换
□ JOIN 列有索引
□ 利用索引排序
□ 避免深分页
□ 批量操作代替逐条操作
□ 使用缓存减轻数据库压力
```

### 2. 性能优化步骤

```
1. 使用 EXPLAIN 查看执行计划
2. 识别性能瓶颈
   - 全表扫描
   - 索引失效
   - Using filesort
   - Using temporary
3. 针对性优化
   - 添加索引
   - 改写 SQL
   - 调整配置
4. 验证优化效果
5. 持续监控
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Optimization: https://dev.mysql.com/doc/refman/8.0/en/optimization.html

2. **推荐书籍**：
   - 《高性能MySQL》
   - 《MySQL技术内幕：InnoDB存储引擎》

3. **工具推荐**：
   - pt-query-digest: 慢查询分析
   - mysqldumpslow: MySQL 自带工具
   - EXPLAIN: 执行计划分析

4. **最佳实践**：
   - 定期审查慢查询
   - 监控查询性能
   - 合理使用索引
   - 简化查询逻辑
   - 使用缓存减轻数据库压力

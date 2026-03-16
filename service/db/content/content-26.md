# 慢查询分析与诊断

## 概述

慢查询是影响数据库性能的主要原因之一。通过分析慢查询日志、识别性能瓶颈、定位问题根源，可以有针对性地优化数据库性能。掌握慢查询分析方法是数据库性能调优的关键技能。

**核心内容**：
- **慢查询日志**：记录执行慢的 SQL
- **日志分析工具**：自动化分析慢查询
- **性能指标**：识别关键性能问题
- **诊断方法**：找出慢查询原因
- **优化策略**：解决慢查询问题

---

## MySQL 慢查询日志

### 1. 启用慢查询日志

**配置文件方式**：
```ini
# my.cnf
[mysqld]
# 启用慢查询日志
slow_query_log = ON

# 慢查询日志文件位置
slow_query_log_file = /var/log/mysql/slow.log

# 慢查询时间阈值（秒）
long_query_time = 1

# 记录未使用索引的查询
log_queries_not_using_indexes = ON

# 限制每分钟记录的未使用索引的查询数量
log_throttle_queries_not_using_indexes = 10

# 记录管理语句（ALTER TABLE, OPTIMIZE TABLE 等）
log_slow_admin_statements = ON

# 记录从库的慢查询
log_slow_slave_statements = ON
```

**动态设置**：
```sql
-- 查看当前配置
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- 启用慢查询日志
SET GLOBAL slow_query_log = ON;

-- 设置慢查询时间阈值（1秒）
SET GLOBAL long_query_time = 1;

-- 记录未使用索引的查询
SET GLOBAL log_queries_not_using_indexes = ON;
```

### 2. 慢查询日志格式

**日志示例**：
```
# Time: 2024-03-16T10:30:45.123456Z
# User@Host: app_user[app_user] @ localhost [127.0.0.1]
# Query_time: 5.123456  Lock_time: 0.000123  Rows_sent: 100  Rows_examined: 1000000
SET timestamp=1710584445;
SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 100;
```

**字段说明**：
```
Time: 查询执行时间
User@Host: 执行用户和主机
Query_time: 查询执行时间（秒）
Lock_time: 锁等待时间（秒）
Rows_sent: 返回的行数
Rows_examined: 扫描的行数
```

**关键指标**：
```
Query_time: 执行时间长 → 查询慢
Rows_examined: 扫描行数多 → 可能缺少索引
Rows_sent vs Rows_examined: 比值小 → 过滤效率低
Lock_time: 锁等待时间长 → 锁竞争
```

### 3. 查看慢查询统计

```sql
-- 查看慢查询数量
SHOW GLOBAL STATUS LIKE 'Slow_queries';

-- 查看慢查询日志是否启用
SHOW VARIABLES LIKE 'slow_query_log';

-- 查看慢查询阈值
SHOW VARIABLES LIKE 'long_query_time';
```

---

## 慢查询日志分析工具

### 1. mysqldumpslow（MySQL 自带）

**基础用法**：
```bash
# 查看帮助
mysqldumpslow --help

# 分析慢查询日志
mysqldumpslow /var/log/mysql/slow.log

# 按查询时间排序，显示前 10 条
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

# 按执行次数排序
mysqldumpslow -s c -t 10 /var/log/mysql/slow.log

# 按平均查询时间排序
mysqldumpslow -s at -t 10 /var/log/mysql/slow.log

# 只显示包含特定关键字的查询
mysqldumpslow -g "SELECT.*orders" /var/log/mysql/slow.log
```

**排序选项**：
```
-s t: 按查询时间排序（总时间）
-s at: 按平均查询时间排序
-s c: 按执行次数排序
-s l: 按锁等待时间排序
-s r: 按返回行数排序
-s ar: 按平均返回行数排序
```

**输出示例**：
```
Count: 245  Time=5.12s (1254s)  Lock=0.00s (0s)  Rows=100.0 (24500), app_user[app_user]@localhost
  SELECT * FROM orders WHERE status = N ORDER BY created_at DESC LIMIT N

Count: 执行次数
Time: 平均时间（总时间）
Lock: 平均锁时间
Rows: 平均返回行数（总行数）
```

### 2. pt-query-digest（Percona Toolkit）

**安装**：
```bash
# CentOS/RHEL
yum install percona-toolkit

# Ubuntu/Debian
apt-get install percona-toolkit
```

**基础用法**：
```bash
# 分析慢查询日志
pt-query-digest /var/log/mysql/slow.log

# 输出到文件
pt-query-digest /var/log/mysql/slow.log > slow_report.txt

# 只分析最近 1 小时的日志
pt-query-digest --since 1h /var/log/mysql/slow.log

# 只分析特定时间范围
pt-query-digest --since '2024-03-16 10:00:00' --until '2024-03-16 12:00:00' /var/log/mysql/slow.log

# 过滤特定数据库
pt-query-digest --filter '$event->{db} eq "mydb"' /var/log/mysql/slow.log

# 只显示前 10 个查询
pt-query-digest --limit 10 /var/log/mysql/slow.log
```

**输出报告**：
```
# 总体统计
Overall: 1.2k total, 45 unique, 0.2 QPS, 0.5x concurrency
Time range: 2024-03-16 00:00:00 to 2024-03-16 23:59:59
Attribute          total     min     max     avg     95%  stddev  median
==================  ======= ======= ======= ======= ======= ======= =======
Exec time           2500s     1s     10s     2.08s   5.1s    1.2s   1.8s
Lock time           12s       0s     2s      0.01s   0.05s   0.08s  0.00s
Rows sent           12.5k     1      1k      10      50      25      5
Rows examine        1.5M      100    2M      1.25k   5k      2k      500

# Query 1: 0.05 QPS, 0.25x concurrency, ID 0x8E3F...
# Attribute    pct   total     min     max     avg     95%  stddev  median
# ============ === ======= ======= ======= ======= ======= ======= =======
# Count         20     245
# Exec time     50  1254s     3s     10s     5.12s   7.5s    1.5s   4.8s
# Lock time      5   0.6s     0s    0.1s   0.002s  0.01s  0.005s  0.001s
# Rows sent     20   24.5k   100     100     100     100       0     100
# Rows examine  40   600k    2.4k   2.5k    2.45k   2.5k     50    2.4k
# Query_time distribution
#   1us
#  10us
# 100us
#   1ms
#  10ms
# 100ms
#    1s  ################################
#  10s+

SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 100\G
```

**关键信息**：
```
Count: 执行次数（越大影响越大）
Exec time: 执行时间（total 大说明影响大）
Rows examine: 扫描行数（大说明需要优化）
Rows sent: 返回行数
Rows examine / Rows sent: 比值大说明过滤效率低
```

### 3. 将慢查询存入表

**启用慢查询表**：
```sql
-- 查看当前输出方式
SHOW VARIABLES LIKE 'log_output';

-- 输出到表（可以同时输出到文件和表）
SET GLOBAL log_output = 'TABLE';
-- 或
SET GLOBAL log_output = 'FILE,TABLE';

-- 慢查询会记录到 mysql.slow_log 表
```

**查询慢查询表**：
```sql
-- 查看最近的慢查询
SELECT 
    start_time,
    user_host,
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log
ORDER BY start_time DESC
LIMIT 10;

-- 按查询时间排序
SELECT 
    sql_text,
    COUNT(*) AS count,
    AVG(query_time) AS avg_time,
    MAX(query_time) AS max_time,
    SUM(rows_examined) AS total_rows_examined
FROM mysql.slow_log
GROUP BY sql_text
ORDER BY avg_time DESC
LIMIT 10;
```

**清理慢查询表**：
```sql
-- 慢查询表会不断增长，需要定期清理
TRUNCATE TABLE mysql.slow_log;

-- 或删除旧数据
DELETE FROM mysql.slow_log 
WHERE start_time < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

---

## 性能监控与诊断

### 1. Performance Schema

**启用 Performance Schema**：
```ini
# my.cnf
[mysqld]
performance_schema = ON
```

**查询执行统计**：
```sql
-- 查看最耗时的 SQL（摘要）
SELECT 
    DIGEST_TEXT,
    COUNT_STAR AS exec_count,
    ROUND(AVG_TIMER_WAIT / 1000000000000, 3) AS avg_time_sec,
    ROUND(SUM_TIMER_WAIT / 1000000000000, 3) AS total_time_sec,
    SUM_ROWS_EXAMINED AS total_rows_examined,
    SUM_ROWS_SENT AS total_rows_sent
FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 10;

-- 查看最近执行的 SQL
SELECT 
    THREAD_ID,
    EVENT_ID,
    ROUND(TIMER_WAIT / 1000000000000, 3) AS exec_time_sec,
    ROWS_EXAMINED,
    ROWS_SENT,
    SQL_TEXT
FROM performance_schema.events_statements_history
ORDER BY TIMER_WAIT DESC
LIMIT 10;
```

**表访问统计**：
```sql
-- 查看表扫描统计
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    COUNT_STAR AS total_access,
    COUNT_READ AS read_count,
    COUNT_WRITE AS write_count,
    SUM_TIMER_WAIT / 1000000000000 AS total_time_sec
FROM performance_schema.table_io_waits_summary_by_table
WHERE OBJECT_SCHEMA NOT IN ('mysql', 'performance_schema', 'information_schema')
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 10;
```

**索引使用统计**：
```sql
-- 查看索引使用情况
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_STAR AS access_count,
    COUNT_READ,
    COUNT_FETCH
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'mydb'
ORDER BY COUNT_STAR DESC;

-- 查找未使用的索引
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'mydb'
    AND INDEX_NAME IS NOT NULL
    AND INDEX_NAME != 'PRIMARY'
    AND COUNT_STAR = 0;
```

### 2. 实时监控慢查询

**使用 SHOW PROCESSLIST**：
```sql
-- 查看当前执行的查询
SHOW FULL PROCESSLIST;

-- 查看执行时间超过 5 秒的查询
SELECT 
    id,
    user,
    host,
    db,
    command,
    time,
    state,
    info
FROM information_schema.processlist
WHERE time > 5 AND command != 'Sleep'
ORDER BY time DESC;

-- 杀死慢查询
KILL QUERY 12345;  -- 12345 是进程 ID
```

**监控脚本**：
```bash
#!/bin/bash
# monitor_slow_queries.sh

while true; do
    echo "=== $(date) ==="
    mysql -u root -p'password' -e "
        SELECT id, user, time, state, LEFT(info, 100) AS query
        FROM information_schema.processlist
        WHERE time > 5 AND command != 'Sleep'
        ORDER BY time DESC;
    "
    sleep 10
done
```

---

## 慢查询诊断方法

### 1. 执行计划分析

**EXPLAIN 分析**：
```sql
-- 对慢查询执行 EXPLAIN
EXPLAIN SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 100;

-- 关注：
-- type: ALL（全表扫描）→ 需要添加索引
-- key: NULL（未使用索引）→ 需要添加索引
-- rows: 大量行 → 需要优化过滤条件
-- Extra: Using filesort, Using temporary → 需要优化
```

**EXPLAIN ANALYZE**（MySQL 8.0.18+）：
```sql
-- 查看实际执行情况
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 100;

-- 对比估算值和实际值
-- 发现优化器估算偏差
```

### 2. 分析扫描行数

**Rows_examined vs Rows_sent**：
```
-- 慢查询日志
Rows_sent: 100
Rows_examined: 1000000

-- 问题：
-- 扫描 100 万行，只返回 100 行
-- 过滤效率：100 / 1000000 = 0.01%
-- 非常低效，需要优化

-- 解决：
-- 1. 添加索引减少扫描行数
-- 2. 优化 WHERE 条件
```

### 3. 分析锁等待

**Lock_time 分析**：
```
-- 慢查询日志
Query_time: 5.123456
Lock_time: 4.500000

-- 问题：
-- 锁等待时间占总时间的 88%
-- 主要是锁竞争导致慢查询

-- 解决：
-- 1. 优化锁粒度
-- 2. 减少事务时间
-- 3. 使用乐观锁
```

### 4. 分析查询模式

**识别查询类型**：
```sql
-- 深分页查询
SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;
-- 问题：扫描 1000010 行
-- 优化：使用延迟关联或游标分页

-- 大量 OR 条件
SELECT * FROM users WHERE id = 1 OR id = 2 OR ... OR id = 1000;
-- 问题：可能无法有效使用索引
-- 优化：改为 IN

-- 函数导致索引失效
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- 问题：索引失效
-- 优化：改为范围查询

-- 相关子查询
SELECT u.*, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) 
FROM users u;
-- 问题：每行都执行子查询
-- 优化：改为 JOIN
```

---

## 优化策略

### 1. 索引优化

**添加缺失索引**：
```sql
-- 慢查询
SELECT * FROM orders WHERE user_id = 100 AND status = 1;
-- Rows_examined: 100000

-- 添加索引
CREATE INDEX idx_user_status ON orders(user_id, status);

-- 优化后
-- Rows_examined: 10
```

**删除冗余索引**：
```sql
-- 查找未使用的索引
SELECT 
    object_schema,
    object_name,
    index_name
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'mydb'
    AND index_name IS NOT NULL
    AND index_name != 'PRIMARY'
    AND count_star = 0;

-- 删除未使用的索引
DROP INDEX idx_unused ON table_name;
```

### 2. 查询改写

**子查询转 JOIN**：
```sql
-- 优化前
SELECT * FROM users u
WHERE id IN (SELECT user_id FROM orders WHERE status = 1);

-- 优化后
SELECT DISTINCT u.* FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 1;
```

**OR 转 UNION**：
```sql
-- 优化前
SELECT * FROM users WHERE username = 'alice' OR email = 'alice@example.com';

-- 优化后
SELECT * FROM users WHERE username = 'alice'
UNION
SELECT * FROM users WHERE email = 'alice@example.com';
```

### 3. 分页优化

**延迟关联**：
```sql
-- 优化前
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000000, 10;

-- 优化后
SELECT o.* FROM orders o
INNER JOIN (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 1000000, 10
) t ON o.id = t.id;
```

### 4. 批量操作

**分批处理**：
```sql
-- 优化前：一次删除大量数据
DELETE FROM logs WHERE created_at < '2023-01-01';

-- 优化后：分批删除
DELIMITER //
CREATE PROCEDURE batch_delete_logs()
BEGIN
    DECLARE affected INT DEFAULT 1;
    
    WHILE affected > 0 DO
        DELETE FROM logs WHERE created_at < '2023-01-01' LIMIT 10000;
        SET affected = ROW_COUNT();
        SELECT SLEEP(0.1);  -- 间隔，避免锁竞争
    END WHILE;
END //
DELIMITER ;

CALL batch_delete_logs();
```

---

## 慢查询预防

### 1. 开发规范

**SQL 编写规范**：
```sql
-- ✅ 好的实践
-- 1. 只查询需要的列
SELECT id, username, email FROM users WHERE id = 1;

-- 2. WHERE 条件使用索引列
SELECT * FROM orders WHERE status = 1;  -- status 有索引

-- 3. 避免函数计算
SELECT * FROM users 
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- 4. 使用 LIMIT
SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 100;

-- ❌ 不好的实践
-- 1. SELECT *
SELECT * FROM users;

-- 2. 索引列使用函数
SELECT * FROM users WHERE YEAR(created_at) = 2024;

-- 3. 深分页
SELECT * FROM orders LIMIT 1000000, 10;

-- 4. 没有 LIMIT
SELECT * FROM large_table WHERE condition;
```

### 2. Code Review

**SQL 审查清单**：
```
□ 是否使用 SELECT *
□ WHERE 条件是否有索引
□ 是否使用函数导致索引失效
□ 是否有隐式类型转换
□ JOIN 是否过多
□ 是否有深分页
□ 是否有 LIMIT
□ 是否需要分批处理
```

### 3. 测试环境验证

**性能测试**：
```sql
-- 在测试环境模拟生产数据量
-- 执行 EXPLAIN 查看执行计划
EXPLAIN SELECT ...;

-- 执行实际查询，记录执行时间
SELECT BENCHMARK(1000, (SELECT ...));

-- 如果超过阈值，优化后再上线
```

---

## 监控告警

### 1. 慢查询监控

**监控指标**：
```
- 慢查询数量（每分钟）
- 慢查询占比
- 平均查询时间
- 最长查询时间
- 扫描行数
```

**告警规则**：
```
- 慢查询数量超过阈值
- 单个查询超过 10 秒
- 慢查询占比超过 5%
```

### 2. 自动化处理

**自动 KILL 慢查询**：
```bash
#!/bin/bash
# auto_kill_slow_queries.sh

THRESHOLD=60  # 60秒

mysql -u root -p'password' -e "
    SELECT CONCAT('KILL QUERY ', id, ';') AS kill_command
    FROM information_schema.processlist
    WHERE time > $THRESHOLD 
        AND command != 'Sleep'
        AND user != 'root'
    INTO OUTFILE '/tmp/kill_queries.sql';
"

if [ -f /tmp/kill_queries.sql ]; then
    mysql -u root -p'password' < /tmp/kill_queries.sql
    rm /tmp/kill_queries.sql
fi
```

---

## 生产环境案例

### 1. 案例：突发慢查询

**问题**：
```
应用突然变慢，大量请求超时

-- 查看慢查询日志
pt-query-digest --since 1h /var/log/mysql/slow.log

-- 发现：某个查询执行次数暴增
Query: SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
Count: 10000 (1小时内)
Avg time: 5.2s

-- 原因：user_id 索引失效或缺失
```

**解决**：
```sql
-- 检查索引
SHOW INDEX FROM orders;

-- 发现：user_id 无索引

-- 添加索引
CREATE INDEX idx_user_id ON orders(user_id);

-- 优化后
-- Avg time: 0.05s
-- 性能提升 100 倍
```

### 2. 案例：深分页慢查询

**问题**：
```
-- 慢查询日志
Query_time: 30.5
SELECT * FROM articles ORDER BY created_at DESC LIMIT 1000000, 10
```

**解决**：
```sql
-- 延迟关联优化
SELECT a.* FROM articles a
INNER JOIN (
    SELECT id FROM articles ORDER BY created_at DESC LIMIT 1000000, 10
) t ON a.id = t.id;

-- Query_time: 0.5s
-- 性能提升 60 倍
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Slow Query Log: https://dev.mysql.com/doc/refman/8.0/en/slow-query-log.html

2. **工具文档**：
   - Percona Toolkit: https://www.percona.com/doc/percona-toolkit/

3. **推荐书籍**：
   - 《高性能MySQL》
   - 《MySQL故障排查与性能优化》

4. **最佳实践**：
   - 启用慢查询日志
   - 定期分析慢查询
   - 建立性能监控
   - 优化高频慢查询
   - 制定开发规范
   - 持续优化和改进

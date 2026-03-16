# 查询性能监控与诊断

## 概述

查询性能监控是保障数据库稳定运行的重要手段。通过实时监控、性能指标分析、问题诊断，可以及时发现和解决性能问题，避免系统故障。本章介绍数据库性能监控的方法和工具。

**核心内容**：
- **实时监控**：监控当前执行的查询
- **性能指标**：关键性能指标分析
- **诊断工具**：使用内置工具诊断问题
- **监控系统**：搭建监控告警系统
- **性能基线**：建立性能基准和对比

---

## MySQL 性能监控

### 1. Performance Schema

**启用 Performance Schema**：
```ini
# my.cnf
[mysqld]
performance_schema = ON

# 启用特定监控
performance-schema-instrument='statement/%=ON'
performance-schema-consumer-events-statements-history=ON
performance-schema-consumer-events-statements-history-long=ON
```

**查询执行统计**：
```sql
-- 查看最耗时的 SQL（摘要）
SELECT 
    DIGEST_TEXT,
    COUNT_STAR AS exec_count,
    ROUND(AVG_TIMER_WAIT / 1000000000000, 3) AS avg_sec,
    ROUND(MAX_TIMER_WAIT / 1000000000000, 3) AS max_sec,
    ROUND(SUM_TIMER_WAIT / 1000000000000, 3) AS total_sec,
    SUM_ROWS_EXAMINED AS total_rows_examined,
    SUM_ROWS_SENT AS total_rows_sent,
    ROUND(SUM_ROWS_EXAMINED / NULLIF(SUM_ROWS_SENT, 0), 2) AS examine_send_ratio
FROM performance_schema.events_statements_summary_by_digest
WHERE SCHEMA_NAME = 'mydb'
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 10;
```

**当前执行的查询**：
```sql
-- 查看当前执行的 SQL
SELECT 
    t.processlist_id,
    t.processlist_user,
    t.processlist_host,
    t.processlist_db,
    t.processlist_command,
    t.processlist_time,
    t.processlist_state,
    SUBSTRING(t.processlist_info, 1, 100) AS query,
    es.timer_wait / 1000000000000 AS elapsed_sec
FROM performance_schema.threads t
LEFT JOIN performance_schema.events_statements_current es 
    ON t.thread_id = es.thread_id
WHERE t.processlist_command != 'Sleep'
    AND t.processlist_id IS NOT NULL
ORDER BY t.processlist_time DESC;
```

**表访问统计**：
```sql
-- 查看表的读写统计
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    COUNT_STAR AS total_io,
    COUNT_READ,
    COUNT_WRITE,
    COUNT_FETCH,
    COUNT_INSERT,
    COUNT_UPDATE,
    COUNT_DELETE,
    ROUND(SUM_TIMER_WAIT / 1000000000000, 2) AS total_time_sec
FROM performance_schema.table_io_waits_summary_by_table
WHERE OBJECT_SCHEMA = 'mydb'
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
    COUNT_FETCH,
    ROUND(SUM_TIMER_WAIT / 1000000000000, 2) AS total_time_sec
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'mydb'
    AND INDEX_NAME IS NOT NULL
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

**锁等待分析**：
```sql
-- 查看锁等待
SELECT 
    r.trx_id AS waiting_trx_id,
    r.trx_mysql_thread_id AS waiting_thread,
    r.trx_query AS waiting_query,
    b.trx_id AS blocking_trx_id,
    b.trx_mysql_thread_id AS blocking_thread,
    b.trx_query AS blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
```

### 2. sys Schema

**查看最耗时的语句**：
```sql
-- 使用 sys.statement_analysis 视图
SELECT 
    query,
    exec_count,
    total_latency,
    avg_latency,
    rows_sent,
    rows_examined,
    rows_affected
FROM sys.statement_analysis
ORDER BY total_latency DESC
LIMIT 10;
```

**查看全表扫描**：
```sql
-- 查找全表扫描的查询
SELECT 
    query,
    exec_count,
    no_index_used_count,
    no_good_index_used_count,
    rows_sent,
    rows_examined
FROM sys.statements_with_full_table_scans
ORDER BY exec_count DESC
LIMIT 10;
```

**查看临时表使用**：
```sql
-- 查找使用临时表的查询
SELECT 
    query,
    exec_count,
    memory_tmp_tables,
    disk_tmp_tables,
    avg_tmp_table_size
FROM sys.statements_with_temp_tables
WHERE disk_tmp_tables > 0
ORDER BY disk_tmp_tables DESC
LIMIT 10;
```

**查看等待事件**：
```sql
-- 查看等待最多的事件
SELECT 
    event_name,
    count_star,
    ROUND(sum_timer_wait / 1000000000000, 2) AS total_wait_sec,
    ROUND(avg_timer_wait / 1000000000000, 6) AS avg_wait_sec
FROM performance_schema.events_waits_summary_global_by_event_name
WHERE count_star > 0
ORDER BY sum_timer_wait DESC
LIMIT 10;
```

### 3. SHOW STATUS

**查看服务器状态**：
```sql
-- 连接数
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';

-- 查询统计
SHOW STATUS LIKE 'Questions';  -- 总查询数
SHOW STATUS LIKE 'Queries';    -- 包括存储过程中的查询
SHOW STATUS LIKE 'Slow_queries';  -- 慢查询数

-- 表锁
SHOW STATUS LIKE 'Table_locks_immediate';  -- 立即获得的表锁
SHOW STATUS LIKE 'Table_locks_waited';     -- 需要等待的表锁

-- InnoDB 状态
SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests';  -- 读请求
SHOW STATUS LIKE 'Innodb_buffer_pool_reads';          -- 物理读
SHOW STATUS LIKE 'Innodb_rows_read';
SHOW STATUS LIKE 'Innodb_rows_inserted';
SHOW STATUS LIKE 'Innodb_rows_updated';
SHOW STATUS LIKE 'Innodb_rows_deleted';
```

**计算缓冲池命中率**：
```sql
-- Buffer Pool 命中率
SHOW STATUS LIKE 'Innodb_buffer_pool_read%';

-- 计算命中率
SELECT 
    ROUND((1 - reads / read_requests) * 100, 2) AS buffer_pool_hit_rate
FROM (
    SELECT 
        VARIABLE_VALUE AS reads
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads'
) r,
(
    SELECT 
        VARIABLE_VALUE AS read_requests
    FROM performance_schema.global_status
    WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests'
) rr;

-- 命中率 > 99% 理想
-- 命中率 < 95% 考虑增加 buffer pool
```

---

## Oracle 性能监控

### 1. AWR（Automatic Workload Repository）

**生成 AWR 报告**：
```sql
-- 创建 AWR 快照
EXEC DBMS_WORKLOAD_REPOSITORY.CREATE_SNAPSHOT;

-- 生成 AWR 报告
@?/rdbms/admin/awrrpt.sql

-- 查看快照列表
SELECT 
    snap_id,
    begin_interval_time,
    end_interval_time
FROM dba_hist_snapshot
ORDER BY snap_id DESC;

-- 生成指定时间段的报告
@?/rdbms/admin/awrrpti.sql
-- 输入起始和结束 snap_id
```

**AWR 报告内容**：
```
- 负载概况
- 等待事件 Top N
- SQL 统计 Top N（按执行时间、逻辑读、物理读等）
- 实例统计
- 表空间 I/O 统计
- Segment 统计
- 参数变化
```

### 2. ASH（Active Session History）

**查询活动会话**：
```sql
-- 查看当前活动会话
SELECT 
    session_id,
    session_serial#,
    user_id,
    sql_id,
    event,
    wait_class,
    wait_time,
    time_waited
FROM v$active_session_history
WHERE sample_time > SYSDATE - INTERVAL '5' MINUTE
ORDER BY sample_time DESC;

-- Top SQL（按等待时间）
SELECT 
    sql_id,
    COUNT(*) AS sample_count,
    ROUND(COUNT(*) * 10 / 60, 2) AS estimated_sec
FROM v$active_session_history
WHERE sample_time > SYSDATE - INTERVAL '1' HOUR
GROUP BY sql_id
ORDER BY sample_count DESC
FETCH FIRST 10 ROWS ONLY;
```

### 3. V$ 动态视图

**查看当前 SQL**：
```sql
-- 查看当前执行的 SQL
SELECT 
    s.sid,
    s.serial#,
    s.username,
    s.status,
    s.machine,
    s.program,
    t.sql_text,
    s.last_call_et AS elapsed_sec
FROM v$session s
JOIN v$sqlarea t ON s.sql_id = t.sql_id
WHERE s.status = 'ACTIVE'
    AND s.username IS NOT NULL
ORDER BY s.last_call_et DESC;
```

**Top SQL 统计**：
```sql
-- 按执行次数
SELECT 
    sql_id,
    sql_text,
    executions,
    elapsed_time / 1000000 AS elapsed_sec,
    cpu_time / 1000000 AS cpu_sec,
    buffer_gets,
    disk_reads,
    rows_processed
FROM v$sqlarea
WHERE executions > 0
ORDER BY executions DESC
FETCH FIRST 10 ROWS ONLY;

-- 按执行时间
ORDER BY elapsed_time DESC

-- 按物理读
ORDER BY disk_reads DESC

-- 按逻辑读
ORDER BY buffer_gets DESC
```

**等待事件分析**：
```sql
-- 查看等待事件统计
SELECT 
    event,
    total_waits,
    total_timeouts,
    time_waited / 100 AS time_waited_sec,
    average_wait / 100 AS avg_wait_sec
FROM v$system_event
WHERE wait_class != 'Idle'
ORDER BY time_waited DESC
FETCH FIRST 10 ROWS ONLY;
```

---

## PostgreSQL 性能监控

### 1. pg_stat 视图

**查询统计**：
```sql
-- 数据库级别统计
SELECT 
    datname,
    numbackends AS connections,
    xact_commit AS commits,
    xact_rollback AS rollbacks,
    blks_read AS disk_blocks_read,
    blks_hit AS buffer_blocks_hit,
    ROUND(blks_hit::numeric / NULLIF(blks_hit + blks_read, 0) * 100, 2) AS cache_hit_ratio
FROM pg_stat_database
WHERE datname = current_database();

-- 表统计
SELECT 
    schemaname,
    relname,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_ratio
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan + idx_scan DESC
LIMIT 10;
```

**索引统计**：
```sql
-- 索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 未使用的索引
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND schemaname = 'public'
    AND indexrelname NOT LIKE 'pg_toast%';
```

**当前活动查询**：
```sql
-- 查看当前执行的查询
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    EXTRACT(EPOCH FROM (NOW() - query_start)) AS elapsed_sec,
    query
FROM pg_stat_activity
WHERE state = 'active'
    AND pid != pg_backend_pid()
ORDER BY query_start;

-- 长时间运行的查询
SELECT 
    pid,
    usename,
    EXTRACT(EPOCH FROM (NOW() - query_start)) AS elapsed_sec,
    query
FROM pg_stat_activity
WHERE state = 'active'
    AND EXTRACT(EPOCH FROM (NOW() - query_start)) > 60
ORDER BY query_start;
```

**锁等待分析**：
```sql
-- 查看锁等待
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_query,
    blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

### 2. pg_stat_statements

**启用扩展**：
```sql
-- 创建扩展
CREATE EXTENSION pg_stat_statements;

-- 配置
-- postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all
```

**查询统计**：
```sql
-- Top SQL（按总时间）
SELECT 
    queryid,
    LEFT(query, 100) AS query,
    calls,
    ROUND(total_exec_time::numeric / 1000, 2) AS total_sec,
    ROUND(mean_exec_time::numeric, 2) AS mean_ms,
    ROUND(max_exec_time::numeric, 2) AS max_ms,
    rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Top SQL（按平均时间）
ORDER BY mean_exec_time DESC

-- Top SQL（按调用次数）
ORDER BY calls DESC

-- 重置统计
SELECT pg_stat_statements_reset();
```

---

## 性能监控系统

### 1. 监控指标体系

**系统层面**：
```
- CPU 使用率
- 内存使用率
- 磁盘 I/O
- 网络流量
- 磁盘空间
```

**数据库层面**：
```
- 连接数
- QPS/TPS
- 查询响应时间
- 慢查询数量
- 缓冲池命中率
- 锁等待
- 复制延迟
```

**应用层面**：
```
- 接口响应时间
- 错误率
- 吞吐量
```

### 2. Prometheus + Grafana

**mysqld_exporter 配置**：
```yaml
# docker-compose.yml
services:
  mysqld-exporter:
    image: prom/mysqld-exporter
    environment:
      - DATA_SOURCE_NAME=exporter:password@(mysql:3306)/
    ports:
      - "9104:9104"
    restart: always

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

**prometheus.yml**：
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysqld-exporter:9104']
```

**Grafana Dashboard**：
```
导入 MySQL Overview Dashboard
ID: 7362

关键指标：
- MySQL Uptime
- Connections
- QPS
- InnoDB Buffer Pool
- Slow Queries
- Table Locks
```

### 3. 告警规则

**Prometheus 告警**：
```yaml
# alerts.yml
groups:
  - name: mysql_alerts
    rules:
      # 慢查询告警
      - alert: HighSlowQueries
        expr: rate(mysql_global_status_slow_queries[5m]) > 10
        for: 5m
        annotations:
          summary: "High slow queries rate"
          description: "Slow queries > 10/s for 5 minutes"
      
      # 连接数告警
      - alert: HighConnections
        expr: mysql_global_status_threads_connected > 200
        for: 2m
        annotations:
          summary: "High connection count"
          description: "Connections > 200"
      
      # 缓冲池命中率告警
      - alert: LowBufferPoolHitRate
        expr: (mysql_global_status_innodb_buffer_pool_read_requests / (mysql_global_status_innodb_buffer_pool_read_requests + mysql_global_status_innodb_buffer_pool_reads)) < 0.95
        for: 5m
        annotations:
          summary: "Low buffer pool hit rate"
          description: "Hit rate < 95%"
```

---

## 性能基线与对比

### 1. 建立性能基线

**收集基线数据**：
```sql
-- 在正常负载时收集
-- 1. QPS
SELECT 
    VARIABLE_VALUE AS questions_per_sec
FROM performance_schema.global_status
WHERE VARIABLE_NAME = 'Questions';

-- 2. 平均响应时间
SELECT 
    ROUND(AVG_TIMER_WAIT / 1000000000000, 3) AS avg_response_sec
FROM performance_schema.events_statements_summary_by_digest;

-- 3. 慢查询率
SELECT 
    VARIABLE_VALUE AS slow_queries
FROM performance_schema.global_status
WHERE VARIABLE_NAME = 'Slow_queries';

-- 4. 连接数
SELECT 
    VARIABLE_VALUE AS connections
FROM performance_schema.global_status
WHERE VARIABLE_NAME = 'Threads_connected';
```

**记录基线**：
```
日期：2024-03-16
负载：正常工作日 10:00-11:00
QPS：5000
平均响应时间：0.05s
慢查询：< 10/min
连接数：50-80
Buffer Pool 命中率：99.5%
```

### 2. 性能对比

**对比当前与基线**：
```python
import mysql.connector

def get_current_metrics():
    conn = mysql.connector.connect(...)
    cursor = conn.cursor()
    
    # QPS
    cursor.execute("SHOW GLOBAL STATUS LIKE 'Questions'")
    qps = cursor.fetchone()[1]
    
    # 慢查询
    cursor.execute("SHOW GLOBAL STATUS LIKE 'Slow_queries'")
    slow_queries = cursor.fetchone()[1]
    
    # 连接数
    cursor.execute("SHOW GLOBAL STATUS LIKE 'Threads_connected'")
    connections = cursor.fetchone()[1]
    
    cursor.close()
    conn.close()
    
    return {
        'qps': qps,
        'slow_queries': slow_queries,
        'connections': connections
    }

# 对比基线
baseline = {'qps': 5000, 'slow_queries': 10, 'connections': 65}
current = get_current_metrics()

for metric, value in current.items():
    baseline_value = baseline[metric]
    change = (value - baseline_value) / baseline_value * 100
    print(f"{metric}: {value} ({change:+.1f}% vs baseline)")
```

---

## 诊断工具与脚本

### 1. 一键诊断脚本

```bash
#!/bin/bash
# mysql_health_check.sh

echo "=== MySQL Health Check ==="
echo "Date: $(date)"
echo

echo "=== Connections ==="
mysql -u root -p'password' -e "
    SHOW STATUS LIKE 'Threads_connected';
    SHOW STATUS LIKE 'Max_used_connections';
    SHOW VARIABLES LIKE 'max_connections';
"

echo
echo "=== Slow Queries ==="
mysql -u root -p'password' -e "
    SHOW STATUS LIKE 'Slow_queries';
"

echo
echo "=== Buffer Pool Hit Rate ==="
mysql -u root -p'password' -e "
    SELECT ROUND((1 - reads / read_requests) * 100, 2) AS hit_rate
    FROM (
        SELECT VARIABLE_VALUE AS reads
        FROM performance_schema.global_status
        WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads'
    ) r,
    (
        SELECT VARIABLE_VALUE AS read_requests
        FROM performance_schema.global_status
        WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests'
    ) rr;
"

echo
echo "=== Current Queries ==="
mysql -u root -p'password' -e "
    SELECT id, user, host, db, command, time, state, LEFT(info, 50)
    FROM information_schema.processlist
    WHERE command != 'Sleep'
    ORDER BY time DESC
    LIMIT 10;
"
```

### 2. 性能监控脚本

```python
#!/usr/bin/env python3
# monitor.py

import mysql.connector
import time
import json

def collect_metrics():
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='password'
    )
    cursor = conn.cursor()
    
    metrics = {}
    
    # QPS
    cursor.execute("SHOW GLOBAL STATUS LIKE 'Questions'")
    metrics['questions'] = int(cursor.fetchone()[1])
    
    # 慢查询
    cursor.execute("SHOW GLOBAL STATUS LIKE 'Slow_queries'")
    metrics['slow_queries'] = int(cursor.fetchone()[1])
    
    # 连接数
    cursor.execute("SHOW GLOBAL STATUS LIKE 'Threads_connected'")
    metrics['connections'] = int(cursor.fetchone()[1])
    
    # InnoDB 行操作
    for op in ['read', 'inserted', 'updated', 'deleted']:
        cursor.execute(f"SHOW GLOBAL STATUS LIKE 'Innodb_rows_{op}'")
        metrics[f'rows_{op}'] = int(cursor.fetchone()[1])
    
    cursor.close()
    conn.close()
    
    metrics['timestamp'] = time.time()
    return metrics

# 监控循环
previous = None
while True:
    current = collect_metrics()
    
    if previous:
        elapsed = current['timestamp'] - previous['timestamp']
        qps = (current['questions'] - previous['questions']) / elapsed
        slow_qps = (current['slow_queries'] - previous['slow_queries']) / elapsed
        
        print(f"QPS: {qps:.2f}, Slow: {slow_qps:.2f}, Connections: {current['connections']}")
        
        # 告警
        if qps > 10000:
            print("WARNING: High QPS!")
        if slow_qps > 10:
            print("WARNING: High slow queries!")
        if current['connections'] > 200:
            print("WARNING: High connections!")
    
    previous = current
    time.sleep(10)
```

---

## 最佳实践

### 1. 监控清单

```
□ 启用 Performance Schema
□ 启用慢查询日志
□ 配置 Prometheus + Grafana
□ 设置告警规则
□ 建立性能基线
□ 定期性能审查
□ 记录性能变化
```

### 2. 告警策略

```
级别1（P1 - 紧急）：
- 数据库宕机
- 主从复制中断
- 连接数耗尽

级别2（P2 - 重要）：
- 慢查询激增
- 锁等待严重
- 缓冲池命中率低

级别3（P3 - 一般）：
- 磁盘空间不足
- 表空间使用率高
- 统计信息过期
```

### 3. 定期巡检

```
每日：
- 检查慢查询日志
- 查看系统资源使用
- 检查告警

每周：
- 性能报告
- 索引使用分析
- 清理过期数据

每月：
- 容量规划
- 性能基线更新
- 优化建议
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Performance Schema: https://dev.mysql.com/doc/refman/8.0/en/performance-schema.html
   - sys Schema: https://dev.mysql.com/doc/refman/8.0/en/sys-schema.html

2. **Oracle 官方文档**：
   - AWR: https://docs.oracle.com/en/database/oracle/oracle-database/19/tgdba/automatic-workload-repository.html

3. **PostgreSQL 官方文档**：
   - Statistics: https://www.postgresql.org/docs/current/monitoring-stats.html

4. **工具推荐**：
   - Prometheus + Grafana: 开源监控方案
   - PMM (Percona Monitoring and Management): MySQL 专用
   - pgBadger: PostgreSQL 日志分析

5. **最佳实践**：
   - 实时监控关键指标
   - 建立性能基线
   - 设置合理告警
   - 定期性能分析
   - 持续优化改进

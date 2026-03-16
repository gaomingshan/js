# 性能诊断工具

## 概述

性能诊断工具是数据库运维和优化的重要辅助手段。掌握各种诊断工具的使用方法，可以快速定位性能瓶颈，提升问题排查效率。

**工具分类**：
- **官方工具**：MySQL 自带工具
- **Percona Toolkit**：专业工具集
- **第三方工具**：开源诊断工具
- **监控工具**：性能监控方案
- **分析工具**：日志分析工具

---

## MySQL 官方工具

### 1. mysqladmin

**常用命令**：
```bash
# 查看服务器状态
mysqladmin -u root -p status

# 查看变量
mysqladmin -u root -p variables

# 查看扩展状态
mysqladmin -u root -p extended-status

# 查看进程列表
mysqladmin -u root -p processlist

# 刷新操作
mysqladmin -u root -p flush-logs
mysqladmin -u root -p flush-tables

# Ping 测试
mysqladmin -u root -p ping

# 关闭服务器
mysqladmin -u root -p shutdown
```

**实时监控**：
```bash
# 每 2 秒显示一次状态
mysqladmin -u root -p -i 2 -r status

# 监控特定变量
mysqladmin -u root -p -i 1 extended-status | grep "Threads_connected\|Questions"
```

### 2. mysqlshow

**查看数据库信息**：
```bash
# 列出所有数据库
mysqlshow -u root -p

# 列出数据库中的表
mysqlshow -u root -p mydb

# 列出表的列
mysqlshow -u root -p mydb users

# 查看表状态
mysqlshow -u root -p --status mydb users
```

### 3. mysqlslap

**压力测试**：
```bash
# 基本测试
mysqlslap -u root -p \
  --auto-generate-sql \
  --concurrency=50 \
  --iterations=10 \
  --number-of-queries=1000

# 自定义 SQL 测试
mysqlslap -u root -p \
  --query="SELECT * FROM users WHERE id = FLOOR(RAND() * 1000)" \
  --concurrency=100 \
  --iterations=10

# 创建测试数据
mysqlslap -u root -p \
  --create-schema=testdb \
  --auto-generate-sql \
  --auto-generate-sql-add-autoincrement \
  --auto-generate-sql-load-type=write \
  --number-of-queries=1000 \
  --concurrency=50
```

### 4. mysqldumpslow

**慢查询分析**：
```bash
# 按查询时间排序，显示前 10 条
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

# 按平均查询时间排序
mysqldumpslow -s at -t 10 /var/log/mysql/slow.log

# 按锁定时间排序
mysqldumpslow -s l -t 10 /var/log/mysql/slow.log

# 按执行次数排序
mysqldumpslow -s c -t 10 /var/log/mysql/slow.log

# 过滤特定数据库
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log | grep "mydb"
```

---

## Percona Toolkit

### 1. pt-query-digest

**慢查询分析**：
```bash
# 分析慢查询日志
pt-query-digest /var/log/mysql/slow.log

# 输出到文件
pt-query-digest /var/log/mysql/slow.log > slow_report.txt

# 分析最近 1 小时的慢查询
pt-query-digest \
  --since '1h' \
  /var/log/mysql/slow.log

# 只分析 SELECT 查询
pt-query-digest \
  --filter '$event->{fingerprint} =~ m/^select/i' \
  /var/log/mysql/slow.log

# 保存到数据库
pt-query-digest \
  --review h=localhost,D=percona,t=query_review \
  --history h=localhost,D=percona,t=query_history \
  /var/log/mysql/slow.log

# 分析 tcpdump 抓包
tcpdump -i eth0 -s 65535 -x -n -q -tttt port 3306 > mysql.tcp
pt-query-digest --type tcpdump mysql.tcp
```

**报告内容**：
```
1. Overall（总体统计）
   - 查询总数
   - 唯一查询数
   - 总执行时间
   - 平均执行时间

2. Profile（查询剖析）
   - 按执行时间排序的查询列表
   - 每个查询的执行次数
   - 总时间占比

3. Query Details（查询详情）
   - 查询指纹（抽象 SQL）
   - 执行时间统计（95th、99th）
   - 锁等待时间
   - 返回行数
   - 扫描行数
   - 示例 SQL
```

### 2. pt-online-schema-change

**在线 DDL**：
```bash
# 在线添加索引
pt-online-schema-change \
  --alter="ADD INDEX idx_name (name)" \
  D=mydb,t=users \
  --execute

# 在线修改表结构
pt-online-schema-change \
  --alter="ADD COLUMN phone VARCHAR(20)" \
  D=mydb,t=users \
  --execute

# 设置限制（避免影响生产）
pt-online-schema-change \
  --alter="ADD INDEX idx_email (email)" \
  D=mydb,t=users \
  --max-load="Threads_running=50" \
  --critical-load="Threads_running=100" \
  --chunk-time=0.5 \
  --execute
```

### 3. pt-table-checksum

**主从数据一致性检查**：
```bash
# 检查数据一致性
pt-table-checksum \
  h=master_host,u=root,p=password \
  --databases=mydb

# 输出示例：
# DATABASE  TABLE  CHUNK  THIS_CRC  MASTER_CRC  MASTER_CNT  DIFF_CNT
# mydb      users  1      a1b2c3d4  a1b2c3d4    1000        0

# DIFF_CNT > 0 表示主从数据不一致
```

### 4. pt-table-sync

**主从数据同步**：
```bash
# 同步不一致的数据
pt-table-sync \
  --execute \
  --sync-to-master \
  h=slave_host,u=root,p=password

# 打印 SQL（不执行）
pt-table-sync \
  --print \
  --sync-to-master \
  h=slave_host,u=root,p=password
```

### 5. pt-duplicate-key-checker

**检查重复索引**：
```bash
# 检查重复和冗余索引
pt-duplicate-key-checker \
  h=localhost,u=root,p=password

# 输出示例：
# mydb.users
# Key idx_name (name) is a duplicate of PRIMARY (id, name)
# Key idx_email_name (email, name) is a left-prefix of idx_email_name_age (email, name, age)
```

### 6. pt-index-usage

**索引使用分析**：
```bash
# 分析慢查询日志中的索引使用
pt-index-usage \
  /var/log/mysql/slow.log

# 输出：
# - 使用的索引
# - 未使用的索引
# - 索引使用频率
```

### 7. pt-kill

**杀死慢查询**：
```bash
# 杀死运行超过 60 秒的查询
pt-kill \
  --busy-time 60 \
  --kill \
  --print

# 杀死匹配特定模式的查询
pt-kill \
  --match-command Query \
  --match-state "Locked" \
  --kill \
  --victims all

# 杀死空闲连接
pt-kill \
  --match-command Sleep \
  --idle-time 3600 \
  --kill
```

### 8. pt-visual-explain

**可视化执行计划**：
```bash
# 可视化 EXPLAIN 输出
EXPLAIN SELECT * FROM users WHERE name = 'Alice' | pt-visual-explain

# 或从文件读取
pt-visual-explain explain_output.txt
```

---

## 系统诊断工具

### 1. top / htop

**实时监控**：
```bash
# top
top

# 按 CPU 排序：P
# 按内存排序：M
# 显示线程：H

# htop（更友好）
htop

# 功能：
# - 彩色显示
# - 鼠标支持
# - 树状进程视图
# - 更多排序选项
```

### 2. iostat

**I/O 统计**：
```bash
# 安装
yum install sysstat

# 显示 I/O 统计
iostat -x 1

# 输出：
# Device  rrqm/s  wrqm/s  r/s   w/s   rkB/s  wkB/s  avgrq-sz  avgqu-sz  await  r_await  w_await  svctm  %util
# sda     0.00    0.00    10.0  20.0  100.0  200.0  20.00     0.50      16.67  10.00    20.00    5.00   15.00

# 关键指标：
# %util：磁盘利用率（> 80% 说明 I/O 繁忙）
# await：平均等待时间（> 20ms 说明 I/O 慢）
# svctm：平均服务时间
```

### 3. vmstat

**虚拟内存统计**：
```bash
# 每秒显示一次
vmstat 1

# 输出：
# r  b  swpd  free  buff  cache  si  so  bi  bo  in  cs  us  sy  id  wa  st
# 2  0  0     1024  200   800    0   0   10  20  50  100 20  5   70  5   0

# 关键指标：
# r：运行队列长度（> CPU 核数说明负载高）
# b：阻塞进程数
# si/so：swap in/out（> 0 说明内存不足）
# bi/bo：块设备读写（KB/s）
# wa：I/O 等待时间（> 20% 说明 I/O 瓶颈）
```

### 4. sar

**系统活动报告**：
```bash
# CPU 使用率
sar -u 1 10

# 内存使用
sar -r 1 10

# I/O 统计
sar -d 1 10

# 网络统计
sar -n DEV 1 10

# 查看历史数据
sar -u -f /var/log/sa/sa15
```

### 5. dstat

**综合监控**：
```bash
# 安装
yum install dstat

# 综合显示
dstat -tcmsnd

# 参数：
# -t：时间
# -c：CPU
# -m：内存
# -s：swap
# -n：网络
# -d：磁盘
```

---

## MySQL 性能诊断

### 1. sys Schema

**系统诊断视图**：
```sql
-- 最耗时的语句
SELECT * FROM sys.statement_analysis
ORDER BY total_latency DESC
LIMIT 10;

-- 全表扫描的语句
SELECT * FROM sys.statements_with_full_table_scans
ORDER BY exec_count DESC
LIMIT 10;

-- 使用临时表的语句
SELECT * FROM sys.statements_with_temp_tables
WHERE disk_tmp_tables > 0
ORDER BY disk_tmp_tables DESC
LIMIT 10;

-- 未使用索引的查询
SELECT * FROM sys.statements_with_sorting
ORDER BY total_latency DESC
LIMIT 10;

-- 表访问统计
SELECT * FROM sys.schema_table_statistics
WHERE table_schema = 'mydb'
ORDER BY total_latency DESC;

-- 索引使用统计
SELECT * FROM sys.schema_unused_indexes
WHERE object_schema = 'mydb';

-- I/O 统计
SELECT * FROM sys.io_global_by_file_by_bytes
ORDER BY total DESC
LIMIT 10;

-- 等待事件
SELECT * FROM sys.waits_global_by_latency
ORDER BY total_latency DESC
LIMIT 10;
```

### 2. Performance Schema

**性能诊断**：
```sql
-- 当前正在执行的查询
SELECT 
    t.processlist_id,
    t.processlist_user,
    t.processlist_host,
    t.processlist_db,
    t.processlist_command,
    t.processlist_time,
    t.processlist_state,
    ess.sql_text,
    ess.timer_wait / 1000000000000 AS elapsed_sec
FROM performance_schema.threads t
LEFT JOIN performance_schema.events_statements_current ess 
    ON t.thread_id = ess.thread_id
WHERE t.processlist_command != 'Sleep'
    AND t.processlist_id IS NOT NULL
ORDER BY ess.timer_wait DESC;

-- 锁等待分析
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

### 3. innotop

**InnoDB 监控**：
```bash
# 安装
cpan Term::ReadKey
cpan DBD::mysql

# 运行
innotop -u root -p password

# 界面模式：
# Q：查询列表
# T：InnoDB 事务
# L：锁等待
# B：InnoDB Buffer Pool
# D：InnoDB I/O
```

### 4. mytop

**实时监控**：
```bash
# 安装
yum install mytop

# 运行
mytop -u root -p password

# 类似 top，显示：
# - 当前查询
# - 线程状态
# - 查询统计
# - 锁信息
```

---

## 日志分析工具

### 1. pt-query-digest

已在前文介绍

### 2. pgBadger（PostgreSQL）

**日志分析**：
```bash
# 分析 PostgreSQL 日志
pgbadger /var/log/postgresql/postgresql.log

# 输出 HTML 报告
pgbadger -o report.html /var/log/postgresql/postgresql.log

# 增量分析
pgbadger --incremental --outdir /var/www/html/pgbadger /var/log/postgresql/postgresql.log
```

---

## 网络诊断工具

### 1. tcpdump

**抓包分析**：
```bash
# 抓取 MySQL 流量
tcpdump -i eth0 -s 65535 -x -n -q -tttt port 3306 > mysql.tcp

# 分析抓包
pt-query-digest --type tcpdump mysql.tcp
```

### 2. Wireshark

**图形化抓包分析**：
```
过滤器：
- mysql：显示 MySQL 协议
- tcp.port == 3306：显示 MySQL 端口流量

功能：
- 查看 SQL 语句
- 分析响应时间
- 查看数据包详情
```

---

## 综合诊断脚本

### 1. MySQL Tuner

**自动诊断**：
```bash
# 下载
wget https://raw.githubusercontent.com/major/MySQLTuner-perl/master/mysqltuner.pl

# 运行
perl mysqltuner.pl --user root --pass password

# 输出包括：
# - 服务器信息
# - 性能指标
# - 配置建议
# - 安全建议
```

### 2. 自定义诊断脚本

**健康检查脚本**：
```bash
#!/bin/bash

echo "=== MySQL Health Check ==="
echo "Date: $(date)"
echo

# 连接测试
echo "=== Connection Test ==="
mysql -u root -p'password' -e "SELECT 1" &>/dev/null && echo "OK" || echo "FAILED"
echo

# 版本信息
echo "=== Version Info ==="
mysql -u root -p'password' -e "SELECT VERSION()"
echo

# 运行时间
echo "=== Uptime ==="
mysql -u root -p'password' -e "SHOW STATUS LIKE 'Uptime'"
echo

# 连接数
echo "=== Connections ==="
mysql -u root -p'password' -e "
    SELECT 
        VARIABLE_VALUE AS current_connections
    FROM performance_schema.global_status 
    WHERE VARIABLE_NAME = 'Threads_connected'
    UNION ALL
    SELECT 
        VARIABLE_VALUE AS max_connections
    FROM performance_schema.global_variables
    WHERE VARIABLE_NAME = 'max_connections'
"
echo

# Buffer Pool 命中率
echo "=== Buffer Pool Hit Rate ==="
mysql -u root -p'password' -e "
    SELECT 
        ROUND((1 - reads / read_requests) * 100, 2) AS hit_rate_pct
    FROM (
        SELECT 
            (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') AS reads,
            (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') AS read_requests
    ) t
"
echo

# 慢查询
echo "=== Slow Queries ==="
mysql -u root -p'password' -e "SHOW STATUS LIKE 'Slow_queries'"
echo

# 复制状态
echo "=== Replication Status ==="
mysql -u root -p'password' -e "SHOW SLAVE STATUS\G" | grep -E "Slave_IO_Running|Slave_SQL_Running|Seconds_Behind_Master"
echo

echo "=== Health Check Complete ==="
```

---

## 最佳实践

### 1. 工具选择

```
日常监控：
- Prometheus + Grafana
- PMM

性能诊断：
- pt-query-digest（慢查询）
- sys Schema（实时诊断）
- EXPLAIN（执行计划）

在线 DDL：
- pt-online-schema-change

数据一致性：
- pt-table-checksum
- pt-table-sync

系统监控：
- iostat（I/O）
- vmstat（内存）
- sar（综合）
```

### 2. 诊断流程

```
1. 确定问题现象
   - 慢查询
   - 高 CPU
   - 高 I/O
   - 锁等待

2. 收集信息
   - 慢查询日志
   - Performance Schema
   - 系统指标

3. 分析原因
   - EXPLAIN 分析
   - 索引使用
   - 锁分析

4. 制定方案
   - SQL 优化
   - 索引优化
   - 配置调整

5. 验证效果
   - 性能对比
   - 监控指标
```

### 3. 工具清单

```
□ pt-query-digest
□ MySQLTuner
□ sys Schema
□ Performance Schema
□ iostat
□ vmstat
□ sar
□ dstat
□ innotop/mytop
□ EXPLAIN
```

---

## 参考资料

1. **Percona Toolkit**：
   - 文档：https://www.percona.com/doc/percona-toolkit/
   - 下载：https://www.percona.com/downloads/percona-toolkit/

2. **MySQL 文档**：
   - sys Schema：https://dev.mysql.com/doc/refman/8.0/en/sys-schema.html
   - Performance Schema：https://dev.mysql.com/doc/refman/8.0/en/performance-schema.html

3. **推荐工具**：
   - MySQLTuner：https://github.com/major/MySQLTuner-perl
   - innotop：https://github.com/innotop/innotop

4. **最佳实践**：
   - 选择合适的工具
   - 建立诊断流程
   - 定期性能审查
   - 文档化问题和解决方案
   - 持续学习和改进

# MySQL 参数调优

## 概述

MySQL 提供了数百个配置参数，合理配置这些参数对数据库性能有决定性影响。本章介绍核心参数的含义、调优方法和最佳实践。

**核心参数分类**：
- **连接参数**：最大连接数、超时设置
- **缓冲参数**：Buffer Pool、各种缓冲区
- **日志参数**：Redo Log、Binlog、慢查询日志
- **I/O 参数**：I/O 线程、容量
- **其他参数**：查询缓存、表缓存等

---

## 连接参数

### 1. max_connections

**作用**：
```
最大并发连接数
包括：活动连接 + 空闲连接

默认值：151
```

**计算公式**：
```
max_connections = 预期并发数 × 1.2

示例：
- 预期并发：500
- max_connections = 500 × 1.2 = 600

考虑因素：
- 应用连接池大小
- 服务器资源（每个连接占用内存）
- 峰值流量
```

**配置**：
```ini
[mysqld]
max_connections = 1000

# 查看当前值
SHOW VARIABLES LIKE 'max_connections';

# 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';

# 查看历史最大连接数
SHOW STATUS LIKE 'Max_used_connections';

# 动态调整
SET GLOBAL max_connections = 1000;
```

**内存估算**：
```
每个连接内存占用：
= thread_stack 
+ sort_buffer_size 
+ read_buffer_size 
+ read_rnd_buffer_size 
+ join_buffer_size 
+ binlog_cache_size

示例：
= 256K + 2M + 2M + 4M + 2M + 32K
= 10.28 MB

1000 个连接：
= 1000 × 10.28 MB
= 10 GB
```

### 2. 超时参数

**wait_timeout**：
```sql
-- 非交互连接超时（秒）
wait_timeout = 28800  # 8小时（默认）

-- 推荐：600-3600（10分钟-1小时）
[mysqld]
wait_timeout = 3600

-- 作用：
-- 超时后自动关闭空闲连接
-- 释放资源
```

**interactive_timeout**：
```sql
-- 交互式连接超时（秒）
interactive_timeout = 28800

-- 推荐与 wait_timeout 相同
interactive_timeout = 3600
```

**connect_timeout**：
```sql
-- 连接建立超时（秒）
connect_timeout = 10

-- 推荐：10-30
connect_timeout = 10
```

---

## Buffer Pool 参数

### 1. innodb_buffer_pool_size

**最重要的参数**：
```ini
# Buffer Pool 大小
innodb_buffer_pool_size = 8G

# 推荐：物理内存的 70-80%

# 计算示例：
# 物理内存：16 GB
# 操作系统：2 GB
# 其他组件：2 GB
# Buffer Pool：16 - 2 - 2 = 12 GB

# 动态调整（MySQL 5.7.5+）
SET GLOBAL innodb_buffer_pool_size = 8589934592;
```

**相关参数**：
```ini
# Buffer Pool 实例数
innodb_buffer_pool_instances = 8

# 建议：
# Buffer Pool < 1GB：1 个实例
# Buffer Pool >= 1GB：4-16 个实例
# 每个实例至少 1GB

# Chunk 大小（MySQL 5.7.5+）
innodb_buffer_pool_chunk_size = 134217728  # 128MB

# Buffer Pool 大小必须是 chunk_size × instances 的倍数
```

### 2. innodb_log_buffer_size

**Redo Log 缓冲**：
```ini
# Redo Log 缓冲大小
innodb_log_buffer_size = 16M

# 默认：16MB
# 推荐：16MB-64MB

# 大事务场景：增大
innodb_log_buffer_size = 64M

# 查看使用情况
SHOW STATUS LIKE 'Innodb_log_waits';
# 如果 > 0，考虑增大
```

### 3. 其他缓冲参数

**排序缓冲**：
```ini
# 排序缓冲（每个连接）
sort_buffer_size = 2M

# 默认：256KB
# 推荐：2MB-8MB
# 不要设置过大（浪费内存）

# 查看排序统计
SHOW STATUS LIKE 'Sort_%';
# Sort_merge_passes > 0 较多时，考虑增大
```

**读取缓冲**：
```ini
# 顺序读缓冲（每个连接）
read_buffer_size = 2M

# 随机读缓冲（每个连接）
read_rnd_buffer_size = 4M

# JOIN 缓冲（每个连接）
join_buffer_size = 2M

# 推荐：2MB-8MB
```

**临时表**：
```ini
# 内存临时表最大大小
tmp_table_size = 64M
max_heap_table_size = 64M

# 两者取较小值
# 推荐：64MB-256MB

# 查看临时表统计
SHOW STATUS LIKE 'Created_tmp%';
# Created_tmp_disk_tables / Created_tmp_tables > 25%
# 考虑增大
```

---

## 日志参数

### 1. Redo Log

**日志文件大小**：
```ini
# Redo Log 文件大小（MySQL 5.7）
innodb_log_file_size = 512M

# Redo Log 文件数量
innodb_log_files_in_group = 2

# 总大小 = innodb_log_file_size × innodb_log_files_in_group
# 总大小 = 512MB × 2 = 1GB

# MySQL 8.0+
innodb_redo_log_capacity = 1G

# 推荐：
# 小型：256MB-512MB
# 中型：1GB-2GB
# 大型：4GB-8GB

# 考虑因素：
# - 写入负载
# - 崩溃恢复时间（日志越大，恢复越慢）
# - 磁盘空间
```

**刷盘策略**：
```ini
# Redo Log 刷盘策略
innodb_flush_log_at_trx_commit = 1

# 0：每秒刷盘（性能最好，可能丢1秒数据）
# 1：每次提交刷盘（最安全，性能最差）
# 2：每次提交写OS缓存，每秒刷盘（折中）

# 推荐：
# 生产环境：1（安全）
# 非关键数据：2（性能）
# 测试环境：0（性能）
```

### 2. Binary Log

**启用 Binlog**：
```ini
# 启用 Binlog
log_bin = /data/mysql/binlog/mysql-bin

# Binlog 格式
binlog_format = ROW

# ROW：记录每行数据变化（推荐）
# STATEMENT：记录 SQL 语句
# MIXED：混合模式

# Binlog 过期时间（天）
binlog_expire_logs_seconds = 604800  # 7天（MySQL 8.0+）
expire_logs_days = 7  # MySQL 5.7

# 单个 Binlog 文件最大大小
max_binlog_size = 1G
```

**Binlog 刷盘**：
```ini
# Binlog 刷盘策略
sync_binlog = 1

# 0：依赖操作系统（性能好，可能丢失）
# 1：每次提交刷盘（最安全）
# N：每 N 次提交刷盘

# 推荐：
# 主库：1（安全）
# 从库：0 或 10（性能）
```

**Binlog 缓存**：
```ini
# Binlog 缓存大小（每个连接）
binlog_cache_size = 32K

# 默认：32KB
# 推荐：32KB-256KB

# 查看缓存统计
SHOW STATUS LIKE 'Binlog_cache%';
# Binlog_cache_disk_use > 0 较多时，考虑增大
```

### 3. 慢查询日志

**启用慢查询日志**：
```ini
# 启用慢查询日志
slow_query_log = 1

# 日志文件位置
slow_query_log_file = /data/mysql/log/slow.log

# 慢查询阈值（秒）
long_query_time = 1

# 推荐：0.5-2秒

# 记录未使用索引的查询
log_queries_not_using_indexes = 1

# 限制未使用索引查询的记录速率
log_throttle_queries_not_using_indexes = 10
```

---

## I/O 参数

### 1. I/O 线程

**线程数配置**：
```ini
# 读 I/O 线程数
innodb_read_io_threads = 8

# 写 I/O 线程数
innodb_write_io_threads = 8

# 默认：4
# 推荐：
# HDD：4
# SSD：8-16
# 根据磁盘性能和并发度调整
```

### 2. I/O 容量

**I/O 容量配置**：
```ini
# I/O 容量（IOPS）
innodb_io_capacity = 2000

# 默认：200
# 推荐：
# HDD：200
# SATA SSD：2000
# NVMe SSD：5000-10000

# 最大 I/O 容量
innodb_io_capacity_max = 4000

# 推荐：innodb_io_capacity × 2

# 刷脏页时可达到的最大 IOPS
```

**自适应刷新**：
```ini
# 启用自适应刷新
innodb_adaptive_flushing = ON

# 根据负载动态调整刷新速度
```

### 3. 刷脏页参数

**脏页比例**：
```ini
# 脏页比例阈值
innodb_max_dirty_pages_pct = 75

# 默认：75%
# 脏页超过此比例时，加速刷新

# 低水位阈值
innodb_max_dirty_pages_pct_lwm = 10

# 脏页低于此比例时，停止刷新
```

---

## 查询缓存（已废弃）

### 1. MySQL 5.7

**查询缓存**：
```ini
# 查询缓存（MySQL 5.7 及更早版本）
query_cache_type = 0  # 禁用（推荐）

# 查询缓存大小
query_cache_size = 0

# MySQL 8.0 已完全移除
# 不推荐使用查询缓存
# 使用应用层缓存（Redis）代替
```

---

## 表和表空间参数

### 1. 表缓存

**table_open_cache**：
```ini
# 表缓存大小
table_open_cache = 4000

# 默认：4000
# 推荐：根据表数量调整

# 计算公式：
# table_open_cache = max_connections × N
# N = 平均每个连接打开的表数（2-4）

# 示例：
# max_connections = 1000
# table_open_cache = 1000 × 4 = 4000

# 查看使用情况
SHOW STATUS LIKE 'Open_tables';
SHOW STATUS LIKE 'Opened_tables';

# Opened_tables 持续增长：缓存不足，增大
```

### 2. 表空间

**独立表空间**：
```ini
# 启用独立表空间
innodb_file_per_table = ON

# 默认：ON（MySQL 5.6+）
# 推荐：ON

# 优点：
# - DROP TABLE 立即释放空间
# - 可单独备份表
# - 可单独优化表
```

---

## 其他重要参数

### 1. 事务隔离级别

**隔离级别**：
```ini
# 事务隔离级别
transaction_isolation = REPEATABLE-READ

# READ-UNCOMMITTED
# READ-COMMITTED
# REPEATABLE-READ（默认）
# SERIALIZABLE

# 推荐：
# OLTP：READ-COMMITTED
# 默认：REPEATABLE-READ
```

### 2. 字符集

**字符集配置**：
```ini
# 服务器字符集
character_set_server = utf8mb4

# 排序规则
collation_server = utf8mb4_unicode_ci

# 推荐：utf8mb4（支持 emoji）
```

### 3. SQL Mode

**SQL Mode**：
```ini
# SQL Mode
sql_mode = STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

# 推荐：严格模式
# 避免数据不一致
```

### 4. 并发控制

**并发线程数**：
```ini
# InnoDB 并发线程数
innodb_thread_concurrency = 0

# 0：不限制（推荐）
# > 0：限制并发线程数

# 一般不需要设置
```

---

## 完整配置示例

### 1. 小型数据库（16GB 内存）

```ini
[mysqld]
# 基本配置
port = 3306
datadir = /data/mysql/data
socket = /tmp/mysql.sock

# 字符集
character_set_server = utf8mb4
collation_server = utf8mb4_unicode_ci

# 连接
max_connections = 500
wait_timeout = 3600
interactive_timeout = 3600

# Buffer Pool
innodb_buffer_pool_size = 10G
innodb_buffer_pool_instances = 8

# 日志
innodb_log_file_size = 512M
innodb_log_files_in_group = 2
innodb_log_buffer_size = 32M
innodb_flush_log_at_trx_commit = 1

# Binlog
log_bin = /data/mysql/binlog/mysql-bin
binlog_format = ROW
sync_binlog = 1
expire_logs_days = 7

# I/O
innodb_read_io_threads = 8
innodb_write_io_threads = 8
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000

# 其他
innodb_file_per_table = ON
table_open_cache = 4000
tmp_table_size = 64M
max_heap_table_size = 64M
```

### 2. 中型数据库（64GB 内存）

```ini
[mysqld]
# 基本配置
port = 3306
datadir = /data/mysql/data

# 连接
max_connections = 1000
wait_timeout = 3600

# Buffer Pool
innodb_buffer_pool_size = 48G
innodb_buffer_pool_instances = 16

# 日志
innodb_log_file_size = 2G
innodb_log_files_in_group = 2
innodb_log_buffer_size = 64M

# Binlog
log_bin = /data/mysql/binlog/mysql-bin
max_binlog_size = 1G
sync_binlog = 1

# I/O
innodb_read_io_threads = 16
innodb_write_io_threads = 16
innodb_io_capacity = 5000
innodb_io_capacity_max = 10000

# 缓冲
sort_buffer_size = 4M
read_buffer_size = 4M
read_rnd_buffer_size = 8M
join_buffer_size = 4M

# 其他
table_open_cache = 8000
tmp_table_size = 256M
max_heap_table_size = 256M
```

### 3. 大型数据库（256GB 内存）

```ini
[mysqld]
# 连接
max_connections = 2000

# Buffer Pool
innodb_buffer_pool_size = 200G
innodb_buffer_pool_instances = 32

# 日志
innodb_redo_log_capacity = 8G  # MySQL 8.0+
innodb_log_buffer_size = 128M

# I/O
innodb_read_io_threads = 32
innodb_write_io_threads = 32
innodb_io_capacity = 10000
innodb_io_capacity_max = 20000

# Purge
innodb_purge_threads = 8
innodb_page_cleaners = 16

# 其他
table_open_cache = 16000
tmp_table_size = 512M
max_heap_table_size = 512M
```

---

## 调优流程

### 1. 性能基线

**建立基线**：
```bash
# 收集性能指标
sysbench oltp_read_write \
  --mysql-host=localhost \
  --mysql-user=root \
  --mysql-password=password \
  --mysql-db=testdb \
  --tables=10 \
  --table-size=100000 \
  --threads=16 \
  --time=60 \
  run

# 记录：
# - QPS
# - TPS
# - 延迟（95th, 99th）
```

### 2. 调整参数

**逐项调整**：
```
1. 确定瓶颈（CPU、内存、I/O、锁）
2. 调整相关参数
3. 重启 MySQL（部分参数需重启）
4. 重新测试
5. 对比性能变化
6. 记录结果
```

### 3. 监控验证

**关键指标**：
```sql
-- Buffer Pool 命中率
SHOW STATUS LIKE 'Innodb_buffer_pool_read%';

-- 慢查询
SHOW STATUS LIKE 'Slow_queries';

-- 连接数
SHOW STATUS LIKE 'Threads%';

-- 临时表
SHOW STATUS LIKE 'Created_tmp%';

-- 表缓存
SHOW STATUS LIKE 'Open%tables';
```

---

## 常见问题

### 1. Buffer Pool 过小

**症状**：
```
- 命中率低（< 95%）
- 物理读频繁
- 查询慢
```

**解决**：
```ini
# 增大 Buffer Pool
innodb_buffer_pool_size = 16G  # 从 8G 增加到 16G
```

### 2. 连接数不足

**症状**：
```
ERROR 1040: Too many connections
```

**解决**：
```ini
# 增大最大连接数
max_connections = 1000  # 从 500 增加到 1000

# 同时检查：
# - 应用是否正确关闭连接
# - 是否有连接泄漏
# - 连接池配置
```

### 3. 临时表过多使用磁盘

**症状**：
```
Created_tmp_disk_tables / Created_tmp_tables > 25%
```

**解决**：
```ini
# 增大临时表大小
tmp_table_size = 256M
max_heap_table_size = 256M

# 或优化查询（避免临时表）
```

---

## 最佳实践

### 1. 配置原则

```
□ 从默认值开始
□ 逐步调整
□ 测试验证
□ 监控效果
□ 文档化修改
□ 定期审查
```

### 2. 调优重点

```
□ Buffer Pool 大小（最重要）
□ Redo Log 大小
□ I/O 参数
□ 连接数
□ 刷盘策略
□ 字符集
```

### 3. 注意事项

```
□ 备份配置文件
□ 逐项调整
□ 建立性能基线
□ 监控关键指标
□ 避免过度调优
□ 根据实际负载调整
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Server System Variables: https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html

2. **推荐工具**：
   - MySQLTuner：配置分析工具
   - pt-variable-advisor：参数建议

3. **最佳实践**：
   - 理解参数含义
   - 根据硬件和负载调整
   - 测试验证效果
   - 持续监控优化
   - 文档化配置
   - 定期审查

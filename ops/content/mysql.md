# MySQL 部署运维指南

> **定位**：全球最流行的开源关系型数据库，Web 应用的数据存储基石  
> **适用场景**：OLTP 业务数据库、读写分离架构、分库分表存储节点  
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

MySQL 是 Oracle 公司维护的开源关系型数据库管理系统，采用多线程架构，支持 InnoDB/MyISAM 等多种存储引擎，以 InnoDB 的 ACID 事务和 MVCC 并发控制为核心。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **存储引擎插件化** | InnoDB（事务）、MyISAM（读密集）、Memory（临时表） |
| **主从复制** | 异步/半同步复制，基于 Binlog |
| **InnoDB Cluster** | Group Replication + MySQL Router + MySQL Shell |
| **窗口函数 / CTE** | 8.0+ 排名、聚合窗口、递归公用表表达式 |
| **JSON 支持** | 5.7+ 原生 JSON 类型与函数 |

### 1.3 适用场景

**最佳适用**：中小规模 OLTP（单表 < 5000 万行）、读写分离主库、分库分表节点

**不适用**：大规模 OLAP（→ ClickHouse）、文档型灵活 Schema（→ MongoDB）、时序高频写入（→ TDengine）

---

## 2. 部署

### 2.1 裸机部署

**系统要求**：CentOS 7+ / Ubuntu 18.04+，最低 2 核 4G，生产建议 8 核 16G+，SSD

**CentOS（MySQL 8.0）**：

```bash
sudo rpm -Uvh https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
sudo yum install -y mysql-community-server
sudo systemctl start mysqld && sudo systemctl enable mysqld
sudo grep 'temporary password' /var/log/mysqld.log
sudo mysql_secure_installation
```

**Ubuntu**：

```bash
sudo apt update && sudo apt install -y mysql-server-8.0
sudo systemctl start mysql && sudo systemctl enable mysql
sudo mysql_secure_installation
```

**关键目录**：

| 路径 | 用途 |
|------|------|
| `/etc/my.cnf` | 主配置文件 |
| `/var/lib/mysql/` | 数据目录 |
| `/var/log/mysqld.log` | 错误日志 |

### 2.2 Docker 部署

```bash
docker run -d \
  --name mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=YourStr0ng!Pass \
  -v mysql-data:/var/lib/mysql \
  -v ./conf/my.cnf:/etc/mysql/conf.d/my.cnf \
  --restart unless-stopped \
  mysql:8.0
```

### 2.3 Docker Compose 部署（主从复制）

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql-master:
    image: mysql:8.0
    container_name: mysql-master
    restart: unless-stopped
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: MasterStr0ng!Pass
    volumes:
      - master-data:/var/lib/mysql
      - ./conf/master.cnf:/etc/mysql/conf.d/my.cnf
      - ./sql/init-master.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - mysql-net

  mysql-slave:
    image: mysql:8.0
    container_name: mysql-slave
    restart: unless-stopped
    ports:
      - "3307:3306"
    environment:
      MYSQL_ROOT_PASSWORD: SlaveStr0ng!Pass
    volumes:
      - slave-data:/var/lib/mysql
      - ./conf/slave.cnf:/etc/mysql/conf.d/my.cnf
    depends_on:
      - mysql-master
    networks:
      - mysql-net

volumes:
  master-data:
  slave-data:

networks:
  mysql-net:
    driver: bridge
```

**初始化 SQL** `sql/init-master.sql`：

```sql
-- 创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED BY 'ReplStr0ng!Pass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- 创建应用用户
CREATE USER 'appuser'@'%' IDENTIFIED BY 'AppUser!Pass';
GRANT ALL PRIVILEGES ON appdb.* TO 'appuser'@'%';
FLUSH PRIVILEGES;
```

**从库配置复制**（启动后执行）：

```sql
CHANGE MASTER TO
  MASTER_HOST='mysql-master',
  MASTER_USER='repl',
  MASTER_PASSWORD='ReplStr0ng!Pass',
  MASTER_AUTO_POSITION=1;
START SLAVE;
SHOW SLAVE STATUS\G
```

### 2.4 生产环境部署要点

**高可用方案**：

| 方案 | 架构 | 自动故障转移 | 推荐场景 |
|------|------|-------------|----------|
| **MHA** | 一主多从 + Manager | 是（30s） | 传统主从 |
| **InnoDB Cluster** | Group Replication + Router | 是（内置） | MySQL 8.0+ 新部署 |
| **Orchestrator** | 拓扑管理 + 自动恢复 | 是 | 大规模集群 |

**安全清单**：禁用 `LOCAL_INFILE`、移除匿名用户和测试库、密码策略 ≥ 8 位、TLS 加密、网络隔离、审计日志

**资源规划**：

| 规模 | CPU | 内存 | 磁盘 | 并发连接 |
|------|-----|------|------|----------|
| 小型 | 4 核 | 8G | 100G SSD | 200 |
| 中型 | 8 核 | 32G | 500G SSD | 500 |
| 大型 | 16 核 | 64G | 1T NVMe | 1000+ |

---

## 3. 配置文件

> **核心原则**：配置文件是部署的灵魂。以下按场景提供完整可用的配置，直接复制到 `/etc/mysql/conf.d/my.cnf` 或挂载到 Docker 容器。

### 3.1 配置文件加载机制

```
MySQL 启动时按以下顺序读取配置，后加载的覆盖先加载的：
/etc/my.cnf → /etc/mysql/my.cnf → /usr/etc/my.cnf → ~/.my.cnf
Docker 额外加载：/etc/mysql/conf.d/*.cnf
```

> **最佳实践**：不修改默认 `my.cnf`，所有自定义配置放在 `/etc/mysql/conf.d/` 目录下，便于升级和维护。

### 3.2 开发环境配置

> **目标**：轻量、快速启动、宽松限制，适合本地开发

```ini
# conf/dev.cnf — MySQL 开发环境配置
# 适用：本地开发机，2-4G 内存

[mysqld]
# === 基础 ===
server-id = 1
port = 3306
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default_authentication_plugin = mysql_native_password  # 兼容旧客户端

# === 内存（小内存开发机） ===
innodb_buffer_pool_size = 512M
innodb_buffer_pool_instances = 1
innodb_log_buffer_size = 16M
key_buffer_size = 64M

# === 连接 ===
max_connections = 100
wait_timeout = 28800

# === 日志（开发环境全开） ===
slow_query_log = ON
long_query_time = 2
log_queries_not_using_indexes = ON
general_log = ON              # 开发环境可开通用日志
general_log_file = /var/log/mysql/general.log

# === 宽松模式（方便开发） ===
sql_mode = ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
# 移除 STRICT_TRANS_TABLES，允许部分非严格数据写入

# === 其他 ===
innodb_flush_log_at_trx_commit = 1   # 开发机数据安全优先
lower_case_table_names = 1           # 表名不区分大小写（Windows/macOS 开发兼容）
```

### 3.3 测试环境配置

> **目标**：模拟生产行为，但资源适中，开启完整日志便于排查

```ini
# conf/test.cnf — MySQL 测试环境配置
# 适用：CI/CD 测试、QA 环境，4-8G 内存

[mysqld]
# === 基础 ===
server-id = 1
port = 3306
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default_authentication_plugin = mysql_native_password

# === 内存 ===
innodb_buffer_pool_size = 2G
innodb_buffer_pool_instances = 2
innodb_log_buffer_size = 32M
key_buffer_size = 128M

# === 连接 ===
max_connections = 200
thread_cache_size = 32
wait_timeout = 28800

# === 日志（测试环境全开） ===
slow_query_log = ON
long_query_time = 1
log_queries_not_using_indexes = ON
slow_query_log_file = /var/log/mysql/slow.log

# 错误日志详细
log_error_verbosity = 3

# === 复制（测试主从） ===
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
max-binlog-size = 200M
binlog-expire-logs-seconds = 604800    # 7 天

# === 严格模式（模拟生产） ===
sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

# === InnoDB ===
innodb_flush_log_at_trx_commit = 1
innodb_file_per_table = ON
innodb_flush_method = O_DIRECT
innodb_io_capacity = 1000
```

### 3.4 生产环境配置 — 小型（8G 内存）

> **目标**：4 核 8G，单机或简单主从，QPS < 2000

```ini
# conf/prod-small.cnf — MySQL 生产小型配置
# 适用：4 核 8G 内存，100G SSD

[mysqld]
# === 基础 ===
server-id = 1
port = 3306
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default_authentication_plugin = caching_sha2_password

# === 内存分配逻辑 ===
# 物理内存 8G 分配策略：
#   OS 保留：1G（12%）
#   InnoDB 缓冲池：4G（50%）— 最关键参数，存热数据和索引
#   连接内存：2G（25%）— max_connections × 单连接内存
#   其他（log buffer/key buffer/临时表）：1G（13%）
innodb_buffer_pool_size = 4G
innodb_buffer_pool_instances = 4      # 每个实例 ≥ 1G
innodb_log_buffer_size = 32M
key_buffer_size = 64M
tmp_table_size = 64M
max_heap_table_size = 64M

# === 连接 ===
max_connections = 200
thread_cache_size = 32
wait_timeout = 28800
interactive_timeout = 28800
max_connect_errors = 1000

# 单连接内存上限 = sort_buffer + join_buffer + read_buffer + read_rnd_buffer
sort_buffer_size = 2M
join_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 4M
# 200 连接 × 10M ≈ 2G，在预算内

# === InnoDB 核心 ===
innodb_flush_log_at_trx_commit = 2    # 非金融场景：每秒 fsync，最多丢 1 秒
sync_binlog = 100                      # 每 100 次提交 fsync binlog
innodb_flush_method = O_DIRECT         # 绕过 OS 页缓存，避免双缓存
innodb_file_per_table = ON            # 每表独立表空间，便于回收空间
innodb_io_capacity = 1000              # SSD I/O 能力
innodb_io_capacity_max = 2000
innodb_lock_wait_timeout = 30

# === Redo Log ===
innodb_log_file_size = 512M            # redo log 单文件大小
# innodb_log_file_size 逻辑：
#   太小 → 频繁 checkpoint，写入性能下降
#   太大 → 崩溃恢复时间长
#   经验值：1 小时 redo 量的 25%-50%，小型库 512M 足够

# === 复制 ===
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
max-binlog-size = 500M
binlog-expire-logs-seconds = 604800
binlog-cache-size = 1M
sync_binlog = 100

# === 慢查询 ===
slow_query_log = ON
long_query_time = 1
log_queries_not_using_indexes = ON
slow_query_log_file = /var/log/mysql/slow.log

# === 安全 ===
local_infile = OFF
skip-name-resolve = ON                 # 跳过 DNS 反查，加速连接
# validate_password.length = 8         # 按需开启密码策略

# === 严格模式 ===
sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

### 3.5 生产环境配置 — 中型（32G 内存）

> **目标**：8 核 32G，主从架构，QPS 2000-8000

```ini
# conf/prod-medium.cnf — MySQL 生产中型配置
# 适用：8 核 32G 内存，500G SSD

[mysqld]
# === 基础 ===
server-id = 1
port = 3306
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default_authentication_plugin = caching_sha2_password

# === 内存分配逻辑 ===
# 物理内存 32G 分配策略：
#   OS 保留：4G（12%）
#   InnoDB 缓冲池：20G（62%）— 存热数据和索引页
#   连接内存：5G（16%）— 500 连接 × 10M
#   其他：3G（10%）— log buffer/临时表/排序等
innodb_buffer_pool_size = 20G
innodb_buffer_pool_instances = 10      # 每个实例 2G
innodb_log_buffer_size = 64M
key_buffer_size = 64M
tmp_table_size = 128M
max_heap_table_size = 128M

# === 连接 ===
max_connections = 500
thread_cache_size = 64
wait_timeout = 28800
interactive_timeout = 28800
max_connect_errors = 1000

sort_buffer_size = 4M
join_buffer_size = 4M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
# 500 连接 × 18M ≈ 9G 峰值，但平均远低于峰值，5G 预算合理

# === InnoDB 核心 ===
innodb_flush_log_at_trx_commit = 2
sync_binlog = 100
innodb_flush_method = O_DIRECT
innodb_file_per_table = ON
innodb_io_capacity = 2000              # 更好的 SSD
innodb_io_capacity_max = 4000
innodb_lock_wait_timeout = 30
innodb_thread_concurrency = 0          # 0 = 不限制（通常最优，OS 调度更高效）

# === Redo Log ===
innodb_log_file_size = 1G              # 中型库写入更频繁，增大 redo log
innodb_log_files_in_group = 2          # 默认 2 个 redo log 文件

# === 并发线程 ===
innodb_read_io_threads = 8
innodb_write_io_threads = 8

# === 复制 ===
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
max-binlog-size = 500M
binlog-expire-logs-seconds = 604800
binlog-cache-size = 1M

# 半同步复制（推荐中型库开启）
plugin-load-add = "rpl_semi_sync_master=semisync_master.so"
rpl_semi_sync_master_enabled = 1
rpl_semi_sync_master_timeout = 1000    # 1 秒超时后降级为异步

# === 慢查询 ===
slow_query_log = ON
long_query_time = 1
log_queries_not_using_indexes = ON
slow_query_log_file = /var/log/mysql/slow.log

# === 安全 ===
local_infile = OFF
skip-name-resolve = ON

# === 严格模式 ===
sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

### 3.6 生产环境配置 — 大型（64G 内存）

> **目标**：16 核 64G，InnoDB Cluster 或 MHA，QPS 8000+

```ini
# conf/prod-large.cnf — MySQL 生产大型配置
# 适用：16 核 64G 内存，1T NVMe

[mysqld]
# === 基础 ===
server-id = 1
port = 3306
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default_authentication_plugin = caching_sha2_password

# === 内存分配逻辑 ===
# 物理内存 64G 分配策略：
#   OS 保留：6G（9%）
#   InnoDB 缓冲池：42G（66%）— 大缓冲池是性能基石
#   连接内存：10G（16%）— 1000 连接 × 10M
#   其他：6G（9%）
innodb_buffer_pool_size = 42G
innodb_buffer_pool_instances = 21      # 每个实例 2G
innodb_log_buffer_size = 128M
key_buffer_size = 64M
tmp_table_size = 256M
max_heap_table_size = 256M

# === 连接 ===
max_connections = 1000
thread_cache_size = 128
wait_timeout = 28800
interactive_timeout = 28800
max_connect_errors = 1000

sort_buffer_size = 4M
join_buffer_size = 4M
read_buffer_size = 2M
read_rnd_buffer_size = 8M

# === InnoDB 核心 ===
innodb_flush_log_at_trx_commit = 1     # 大型库建议设 1，金融级安全
sync_binlog = 1                         # 配合 flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT
innodb_file_per_table = ON
innodb_io_capacity = 5000               # NVMe 高 IOPS
innodb_io_capacity_max = 10000
innodb_lock_wait_timeout = 30
innodb_thread_concurrency = 0

# === Redo Log ===
innodb_log_file_size = 2G               # 大型库写入量大，2G 减少 checkpoint 频率
innodb_log_files_in_group = 2

# === 并发线程 ===
innodb_read_io_threads = 16
innodb_write_io_threads = 16

# === 自适应哈希索引 ===
innodb_adaptive_hash_index = ON         # 大缓冲池下 AHT 可加速等值查询
# 但如果等值查询占比低，建议 OFF，AHT 本身有维护开销

# === Change Buffer ===
innodb_change_buffer_max_size = 25      # 默认 25，非插入密集场景可降到 10
innodb_change_buffering = all

# === 复制 ===
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
max-binlog-size = 1G
binlog-expire-logs-seconds = 604800
binlog-cache-size = 4M                  # 大事务需要更大 binlog cache

# 半同步复制
plugin-load-add = "rpl_semi_sync_master=semisync_master.so"
rpl_semi_sync_master_enabled = 1
rpl_semi_sync_master_timeout = 1000

# 多线程复制（从库配置）
# slave_parallel_type = LOGICAL_CLOCK   # 8.0+ 按组提交并行
# slave_parallel_workers = 8

# === 慢查询 ===
slow_query_log = ON
long_query_time = 0.5                   # 大型库阈值更严格
log_queries_not_using_indexes = ON
slow_query_log_file = /var/log/mysql/slow.log

# === 安全 ===
local_infile = OFF
skip-name-resolve = ON

# === 严格模式 ===
sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

### 3.7 从库专用配置

> **目标**：在主库配置基础上追加从库特有参数

```ini
# conf/slave.cnf — MySQL 从库追加配置
# 在主库同级别配置基础上，修改以下参数

[mysqld]
# === 身份 ===
server-id = 2                           # 必须与主库不同
# read-only 对 SUPER 权限用户无效，需配合 super-read-only
read-only = ON
super-read-only = ON                    # 禁止 SUPER 用户写操作

# === Relay Log ===
relay-log = relay-bin
relay-log-recovery = ON                 # 崩溃后自动重建 relay log，防止复制断裂
max-relay-log-size = 500M

# === 多线程复制 ===
# 逻辑：从库单线程应用 relay log 是复制延迟的主因
# LOGICAL_CLOCK 模式按主库组提交边界并行，比 DATABASE 模式更高效
slave_parallel_type = LOGICAL_CLOCK     # 8.0+ 推荐
slave_parallel_workers = 8              # 并行工作线程数
slave_preserve_commit_order = ON        # 保持提交顺序，避免从库数据不一致

# === 半同步复制 ===
plugin-load-add = "rpl_semi_sync_slave=semisync_slave.so"
rpl_semi_sync_slave_enabled = 1

# === 从库优化 ===
# 从库通常承载读请求，可适当调大排序缓冲
sort_buffer_size = 8M
join_buffer_size = 8M

# 从库不需要通用日志
general_log = OFF
```

---

## 4. 调优

> **调优逻辑**：先定位瓶颈（CPU/IO/锁/连接），再按子系统逐层优化。参数不是越大越好，而是根据数据特征和硬件能力合理分配。

### 4.1 调优方法论

```
1. 定位瓶颈 → SHOW ENGINE INNODB STATUS / 慢查询 / OS 指标
2. 分层调优 → 连接层 → 内存层 → IO 层 → 锁层
3. 量化验证 → 修改前后对比 QPS/TPS/延迟
4. 持续观察 → 参数变更后观察 24-48 小时
```

### 4.2 内存子系统

**核心逻辑**：MySQL 性能的本质是"尽量让操作在内存中完成，减少磁盘 IO"。内存分配的核心是 InnoDB 缓冲池。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `innodb_buffer_pool_size` | 缓存数据页和索引页 | 物理内存 60%-70% | **最重要的参数**。设太小 → 磁盘 IO 飙升；设太大 → OS OOM。必须为 `chunk_size × instances` 的倍数 |
| `innodb_buffer_pool_instances` | 缓冲池分区数 | 每 1G 缓冲池 1 个实例 | 减少内部锁争用。多实例并行读写不同分区 |
| `innodb_log_buffer_size` | redo log 内存缓冲 | 16M-128M | 大事务（大量 UPDATE/INSERT）需增大，避免日志缓冲溢出写临时文件 |
| `innodb_change_buffer_max_size` | Change Buffer 占缓冲池比例 | 25（默认） | 插入密集型保持 25；等值查询为主降到 10，给缓冲池腾空间 |
| `innodb_adaptive_hash_index` | 自适应哈希索引 | ON/OFF | 等值查询占比高 → ON（加速索引定位）；范围查询/写密集 → OFF（AHT 维护开销大） |

**缓冲池命中率诊断**：

```sql
-- 命中率 = 1 - 物理读 / 逻辑读
SELECT 
  ROUND(1 - Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests, 4) * 100 AS hit_rate_pct
FROM (
  SELECT 
    (SELECT variable_value FROM performance_schema.global_status WHERE variable_name = 'Innodb_buffer_pool_reads') AS Innodb_buffer_pool_reads,
    (SELECT variable_value FROM performance_schema.global_status WHERE variable_name = 'Innodb_buffer_pool_read_requests') AS Innodb_buffer_pool_read_requests
) t;
-- 命中率 < 95% → 缓冲池不够，需增大或优化索引
-- 命中率 > 99% → 缓冲池充足
```

### 4.3 IO 子系统

**核心逻辑**：IO 瓶颈表现为"写延迟高"或"刷脏页慢"。调优方向是减少不必要的 fsync、增大 IO 能力配置。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `innodb_flush_log_at_trx_commit` | 事务提交时 redo log 刷盘策略 | 1（金融）/ 2（互联网） | **1** = 每次提交 fsync，最安全最慢；**2** = 写 OS 缓存每秒 fsync，最多丢 1 秒；**0** = 每秒写并 fsync，最多丢 1 秒 |
| `sync_binlog` | Binlog 刷盘频率 | 1（金融）/ 100（互联网） | **1** = 每次提交 fsync；**N** = 每 N 次提交 fsync。与 `flush_log_at_trx_commit` 配合：双 1 最安全，双 N 性能最好 |
| `innodb_flush_method` | InnoDB 读写文件方式 | O_DIRECT | 绕过 OS 页缓存，避免 InnoDB 缓冲池和 OS cache 双缓存。Linux 必须 |
| `innodb_io_capacity` | InnoDB 后台刷脏页 IOPS | SSD:2000 / NVMe:5000 | 告诉 InnoDB 磁盘 IO 能力，影响刷脏页速度。设太低 → 脏页堆积；设太高 → IO 抢占前台查询 |
| `innodb_io_capacity_max` | IO 能力上限 | `innodb_io_capacity` 的 2 倍 | 紧急刷脏页时的最大 IOPS |
| `innodb_log_file_size` | 单个 redo log 文件大小 | 512M-2G | 太小 → 频繁 checkpoint；太大 → 崩溃恢复慢。经验：1 小时 redo 量的 25%-50% |

**刷盘策略组合**：

| 场景 | flush_log | sync_binlog | 数据安全 | 性能 | 说明 |
|------|-----------|-------------|----------|------|------|
| 金融核心 | 1 | 1 | 最高 | 最低 | 双 1，每次提交都 fsync |
| 互联网业务 | 2 | 100 | 高 | 高 | 最多丢 1 秒数据，性能提升 5-10 倍 |
| 开发测试 | 2 | 0 | 中 | 最高 | 不 fsync binlog |

### 4.4 连接子系统

**核心逻辑**：连接数 × 单连接内存 = 总连接内存。连接数不是越多越好，过多连接导致上下文切换开销和内存压力。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `max_connections` | 最大并发连接数 | 200-1000 | 根据应用连接池配置。公式：应用实例数 × 每实例最大池大小 + 预留（50） |
| `thread_cache_size` | 线程缓存数 | ≥ max_connections × 0.1 | 减少线程创建销毁开销。观察 `Threads_created/Connections` 比率，> 0.01 则需增大 |
| `wait_timeout` | 非交互连接超时 | 28800（8h） | 过短 → 连接池断连报错；过长 → 空闲连接占资源。配合连接池 `maxWait` 使用 |
| `sort_buffer_size` | 单连接排序缓冲 | 2M-8M | ORDER BY / GROUP BY 使用。**不是越大越好**：每个连接独立分配，过大导致内存浪费 |
| `join_buffer_size` | 单连接 JOIN 缓冲 | 2M-8M | 无索引 JOIN 时使用。有索引 JOIN 不用此缓冲 |
| `table_open_cache` | 表文件描述符缓存 | 4000-8000 | 观察 `Opened_tables/Open_table_definitions` 增长，持续增长则需增大 |
| `skip-name-resolve` | 跳过 DNS 反查 | ON | 每次连接都做 DNS 反查，高并发时严重影响性能。**生产必须开启** |

### 4.5 锁与事务子系统

**核心逻辑**：锁瓶颈表现为"行锁等待超时"或"死锁"。调优方向是缩短事务、减少锁范围。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `innodb_lock_wait_timeout` | 行锁等待超时 | 30s | 超时后返回错误而非无限等待。过短 → 正常事务被误杀；过长 → 阻塞其他事务 |
| `innodb_deadlock_detect` | 死锁检测 | ON（默认） | 高并发场景死锁检测本身有开销，但一般保持 ON。关闭后需靠 `lock_wait_timeout` 兜底 |
| `tx_isolation` | 事务隔离级别 | REPEATABLE-READ | RR（默认）有间隙锁防幻读；READ-COMMITTED 无间隙锁，并发更好但需应用处理幻读 |
| `innodb_print_all_deadlocks` | 打印所有死锁信息 | ON（生产推荐） | 死锁日志写入 error log，便于分析死锁模式 |

### 4.6 容量规划

**存储估算**：

```
数据大小 = 行数 × 平均行大小
索引大小 ≈ 数据大小 × 30%-50%
Binlog 空间 ≈ 日写入量 × 保留天数
总磁盘需求 = (数据 + 索引) × 1.5（预留） + Binlog + 临时表空间
```

**内存估算**：

```
InnoDB 缓冲池 = 物理内存 × 60%-70%
连接内存 = max_connections × (sort_buffer + join_buffer + read_buffer + read_rnd_buffer)
剩余 = 物理内存 - 缓冲池 - 连接内存 - OS 保留（10%-15%）
```

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 服务管理
sudo systemctl start mysqld
sudo systemctl stop mysqld
sudo systemctl restart mysqld
sudo systemctl status mysqld

# 连接
mysql -u root -p -h 127.0.0.1 -P 3306

# 查看当前连接
SHOW FULL PROCESSLIST;

# 杀掉异常连接
KILL <id>;
```

**配置热更新**：

```sql
-- 动态修改（运行时生效，重启失效）
SET GLOBAL max_connections = 500;

-- 持久化修改（8.0+，同时写入 mysqld-auto.cnf）
SET PERSIST max_connections = 500;
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **QPS** | `SHOW STATUS LIKE 'Queries'` | 持续 > 80% 容量 |
| **TPS** | `Com_commit + Com_rollback` | 持续 > 80% 容量 |
| **连接数** | `SHOW STATUS LIKE 'Threads_connected'` | > 80% max_connections |
| **缓冲池命中率** | 见 4.2 诊断 SQL | < 95% |
| **复制延迟** | `SHOW SLAVE STATUS\G → Seconds_Behind_Master` | > 30s |
| **慢查询数** | `SHOW STATUS LIKE 'Slow_queries'` | 增长速率异常 |

**Prometheus 采集（mysqld_exporter）**：

```bash
docker run -d \
  --name mysqld-exporter \
  -p 9104:9104 \
  -e DATA_SOURCE_NAME="exporter:Exp0rt!Pass@(mysql-host:3306)/" \
  prom/mysqld-exporter \
  --collect.info_schema.processlist \
  --collect.info_schema.innodb_metrics \
  --collect.engine_innodb_status \
  --collect.slave_status
```

```sql
CREATE USER 'exporter'@'%' IDENTIFIED BY 'Exp0rt!Pass';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';
FLUSH PRIVILEGES;
```

### 5.3 备份与恢复

**逻辑备份（mysqldump）**：

```bash
# 单库备份（--single-transaction 不锁表，InnoDB 必须）
mysqldump -u root -p --single-transaction --routines --triggers mydb | gzip > mydb_$(date +%Y%m%d).sql.gz

# 恢复
gunzip < mydb_20240101.sql.gz | mysql -u root -p mydb
```

**物理备份（Percona XtraBackup）**：

```bash
# 全量备份
xtrabackup --backup --target-dir=/backup/full -u root -p
xtrabackup --prepare --target-dir=/backup/full

# 恢复（需先停止 MySQL）
sudo systemctl stop mysqld
xtrabackup --copy-back --target-dir=/backup/full
sudo chown -R mysql:mysql /var/lib/mysql
sudo systemctl start mysqld
```

**Binlog 时间点恢复（PITR）**：

```bash
mysqlbinlog --start-datetime="2024-01-01 10:00:00" \
            --stop-datetime="2024-01-01 11:00:00" \
            /var/lib/mysql/mysql-bin.000123 | mysql -u root -p
```

**备份策略**：

| 策略 | 频率 | 保留 | 适用 |
|------|------|------|------|
| XtraBackup 全量 | 每日 02:00 | 7 天 | 中大型库 |
| XtraBackup 增量 | 每 6 小时 | 3 天 | 大型库 |
| mysqldump 逻辑 | 每日 03:00 | 14 天 | 小型库 |
| Binlog 归档 | 实时 | 7 天 | PITR 恢复 |

### 5.4 版本升级

**5.7 → 8.0 关键变更**：
- 默认字符集 latin1 → utf8mb4
- 默认认证插件 mysql_native_password → caching_sha2_password
- 移除 Query Cache
- `sql_mode` 默认更严格
- 新增保留字（RANK、SYSTEM 等）

**升级步骤**：备份 → 兼容性检查（`util.checkForServerUpgrade()`）→ 停机 → 升级包 → 启动 → 验证

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：连接数耗尽

**现象**：`ERROR 1040 (HY000): Too many connections`

**排查链路**：

```
现象：Too many connections
  → SHOW FULL PROCESSLIST（看谁占连接）
    → 按用户统计：SELECT USER, HOST, COUNT(*) FROM information_schema.PROCESSLIST GROUP BY USER, HOST
      → 找到占连接最多的用户
        → 排查该用户查询是否慢查询阻塞
          → 是 → 优化慢查询
          → 否 → 检查应用连接池是否泄漏
```

**解决**：临时 `SET GLOBAL max_connections = 600;` → 排查慢查询/连接泄漏 → 引入连接池

#### 故障 2：主从延迟

**现象**：`Seconds_Behind_Master` 持续增长

**排查链路**：

```
现象：从库延迟
  → SHOW SLAVE STATUS\G
    → Seconds_Behind_Master 持续增长
      → Exec_Master_Log_Pos 与 Read_Master_Log_Pos 差距大？
        → 是 → 从库 IO 瓶颈（网络/磁盘）
        → 否 → 从库 SQL 执行慢
          → 从库慢查询日志 / 无索引
            → 开启多线程复制：slave_parallel_type=LOGICAL_CLOCK, slave_parallel_workers=8
```

#### 故障 3：锁等待超时

**现象**：`ERROR 1205 (HY000): Lock wait timeout exceeded`

**排查**：

```sql
-- 8.0+ 查看锁等待
SELECT * FROM performance_schema.data_lock_waits;
SELECT * FROM performance_schema.data_locks;

-- 找阻塞事务
SELECT r.trx_mysql_thread_id AS waiting_thread,
       b.trx_mysql_thread_id AS blocking_thread,
       b.trx_query AS blocking_query
FROM performance_schema.data_lock_waits w
JOIN information_schema.INNODB_TRX r ON w.WAITING_THREAD_ID = r.trx_mysql_thread_id
JOIN information_schema.INNODB_TRX b ON w.BLOCKING_THREAD_ID = b.trx_mysql_thread_id;
```

**解决**：`KILL <blocking_thread>;` → 缩短事务范围 → 按索引访问避免间隙锁

#### 故障 4：磁盘空间不足

**排查**：

```bash
df -h /var/lib/mysql

# 查看大表
mysql -e "SELECT table_schema, table_name,
  ROUND(data_length/1024/1024/1024, 2) AS data_gb,
  ROUND(index_length/1024/1024/1024, 2) AS index_gb
FROM information_schema.TABLES
ORDER BY data_length DESC LIMIT 20;"
```

**清理**：
1. 清理 Binlog：`PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 7 DAY);`
2. 回收碎片：`ALTER TABLE large_table ENGINE=InnoDB;`
3. 截断临时表：`TRUNCATE TABLE temp_table;`

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `SHOW ENGINE INNODB STATUS\G` | 缓冲池/事务/锁/redo log 状态 |
| `sys schema` | `SELECT * FROM sys.statements_with_runtimes_in_95th_percentile;` |
| `pt-query-digest` | 慢查询分析 |
| `pt-mysql-summary` | MySQL 配置摘要 |
| `innotop` | 实时监控 |
| `EXPLAIN (ANALYZE)` | 8.0+ 执行计划分析 |

### 6.3 应急处理

```sql
-- 只读模式
SET GLOBAL read_only = ON;
SET GLOBAL super_read_only = ON;

-- 断开非必要连接
SELECT CONCAT('KILL ', id, ';')
FROM information_schema.PROCESSLIST
WHERE USER NOT IN ('root', 'repl', 'exporter')
INTO OUTFILE '/tmp/kill.sql';
SOURCE /tmp/kill.sql;
```

**数据恢复流程**：只读 → XtraBackup 恢复 → Binlog PITR → 验证

---

## 7. 参考资料

- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [MySQL 8.0 Server System Variables](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html)
- [Percona XtraBackup Documentation](https://docs.percona.com/percona-xtrabackup/8.0/)
- [Percona Toolkit Documentation](https://docs.percona.com/percona-toolkit/)
- [sys schema GitHub](https://github.com/mysql/mysql-sys)

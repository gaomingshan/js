# PostgreSQL 部署运维指南

> **定位**：功能最强大的开源对象-关系型数据库，以扩展性和标准合规性著称
> **适用场景**：复杂查询、GIS、JSONB 混合存储、高并发 OLTP、数据完整性要求高的系统
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

PostgreSQL 是功能最强大的开源 ORDBMS，以 MVCC 实现高并发、扩展性极强著称。支持丰富索引（B-tree/GiST/GIN/BRIN）、JSONB、分区表、逻辑复制，可通过扩展机制自定义类型、操作符和索引方法。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **MVCC** | 多版本并发控制，读不阻塞写、写不阻塞读 |
| **丰富索引** | B-tree、Hash、GiST、GIN、BRIN、SP-GiST |
| **JSONB** | 二进制 JSON + GIN 索引，功能远超 MySQL JSON |
| **PostGIS** | 业界最强 GIS 扩展 |
| **逻辑复制** | 表级复制、多主复制基础 |
| **分区表** | 12+ 声明式分区（Range/List/Hash），自动维护 |
| **扩展机制** | 自定义类型、操作符、索引方法、存储过程语言 |

### 1.3 适用场景

**最佳适用**：复杂查询和数据分析、GIS、混合结构数据（关系+JSONB）、数据完整性要求高的金融/政务

**不适用**：简单读写且团队只熟悉 MySQL（→ MySQL）、超大规模 OLAP（→ ClickHouse）、嵌入式（→ SQLite）

---

## 2. 部署

### 2.1 裸机部署

**CentOS（PostgreSQL 16）**：

```bash
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo yum install -y postgresql16-server postgresql16-contrib
sudo /usr/pgsql-16/bin/postgresql-16-setup initdb
sudo systemctl enable postgresql-16 && sudo systemctl start postgresql-16
sudo -iu postgres psql
```

**Ubuntu**：

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update && sudo apt install -y postgresql-16 postgresql-contrib-16
```

**关键目录**：

| 路径 | 用途 |
|------|------|
| `/var/lib/pgsql/16/data/` | 数据目录 |
| `/var/lib/pgsql/data/postgresql.conf` | 主配置 |
| `/var/lib/pgsql/data/pg_hba.conf` | 访问控制 |
| `/var/log/postgresql/` | 日志目录 |

### 2.2 Docker 部署

```bash
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=Str0ng!Pass \
  -e POSTGRES_DB=appdb \
  -v pg-data:/var/lib/postgresql/data \
  -v ./conf/postgresql.conf:/etc/postgresql/postgresql.conf \
  --restart unless-stopped \
  postgres:16 \
  -c config_file=/etc/postgresql/postgresql.conf
```

### 2.3 Docker Compose 部署（主从流复制）

```yaml
# docker-compose.yml
version: '3.8'

services:
  pg-master:
    image: postgres:16
    container_name: pg-master
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: MasterStr0ng!Pass
      POSTGRES_DB: appdb
    volumes:
      - master-data:/var/lib/postgresql/data
      - ./conf/master.conf:/etc/postgresql/postgresql.conf
      - ./init/01-create-repl-user.sh:/docker-entrypoint-initdb.d/01-create-repl-user.sh
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    networks:
      - pg-net

  pg-replica:
    image: postgres:16
    container_name: pg-replica
    restart: unless-stopped
    ports:
      - "5433:5432"
    environment:
      POSTGRES_PASSWORD: ReplicaStr0ng!Pass
      PGUSER: postgres
    volumes:
      - replica-data:/var/lib/postgresql/data
      - ./conf/replica.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    depends_on:
      - pg-master
    networks:
      - pg-net

volumes:
  master-data:
  replica-data:

networks:
  pg-net:
    driver: bridge
```

**初始化脚本** `init/01-create-repl-user.sh`：

```bash
#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'ReplStr0ng!Pass';
EOSQL
```

**从库初始化**（启动后执行一次）：

```bash
docker exec -it pg-replica bash
pg_basebackup -h pg-master -U replicator -D /var/lib/postgresql/data -Fp -Xs -P -R
# -R 自动创建 standby.signal 和配置复制连接
```

### 2.4 生产环境部署要点

**高可用方案**：

| 方案 | 架构 | 自动故障转移 | 推荐场景 |
|------|------|-------------|----------|
| **Patroni + etcd** | 流复制 + DCS | 是 | 生产首选 |
| **repmgr** | 流复制 + 见证节点 | 是（需配置） | 中小规模 |
| **PgPool-II** | 连接池 + 流复制 | 是 | 需要连接池 |
| **Citus** | 水平分片 | N/A | 分布式 PostgreSQL |

**安全清单**：`pg_hba.conf` 使用 `scram-sha-256`、SSL 连接、最小权限、RLS 行级安全、pgaudit 审计扩展

**资源规划**：

| 规模 | CPU | 内存 | shared_buffers | 磁盘 |
|------|-----|------|----------------|------|
| 小型 | 4 核 | 8G | 2G | 100G SSD |
| 中型 | 8 核 | 32G | 8G | 500G SSD |
| 大型 | 16 核 | 64G | 16G | 1T NVMe |

---

## 3. 配置文件

> **核心原则**：PostgreSQL 配置文件是部署的灵魂。以下按场景提供完整可用配置，直接复制到 `postgresql.conf` 或挂载到 Docker 容器。

### 3.1 配置文件加载机制

```
PostgreSQL 启动时读取配置：
  命令行 -c 参数 → 最高优先级
  data_directory/postgresql.conf → 主配置
  data_directory/postgresql.auto.conf → ALTER SYSTEM 写入，优先级高于手动配置
```

> **最佳实践**：手动配置写在 `postgresql.conf`，`ALTER SYSTEM` 写入 `postgresql.auto.conf`。`postgresql.auto.conf` 优先级更高，调试时注意是否被覆盖。

### 3.2 开发环境配置

> **目标**：轻量、宽松、全日志，适合本地开发

```ini
# conf/dev.conf — PostgreSQL 开发环境配置
# 适用：本地开发机，2-4G 内存

# === 基础 ===
listen_addresses = '*'
port = 5432
max_connections = 100

# === 内存（小内存开发机） ===
shared_buffers = 512MB
effective_cache_size = 1536MB       # 开发机 OS 缓存少，设 shared_buffers 的 3 倍
work_mem = 16MB
maintenance_work_mem = 256MB

# === WAL ===
wal_level = replica                 # 开发环境也开 replica，方便测试复制
max_wal_size = 256MB
min_wal_size = 128MB

# === 日志（开发全开） ===
logging_collector = ON
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_statement = 'all'               # 记录所有 SQL，开发调试用
log_min_duration_statement = 0      # 记录所有语句耗时
log_connections = ON
log_disconnections = ON

# === 宽松模式 ===
# 不强制密码（本地 trust 认证，在 pg_hba.conf 配置）
```

### 3.3 测试环境配置

> **目标**：模拟生产行为，资源适中，完整日志便于排查

```ini
# conf/test.conf — PostgreSQL 测试环境配置
# 适用：CI/CD、QA 环境，4-8G 内存

# === 基础 ===
listen_addresses = '*'
port = 5432
max_connections = 200

# === 内存 ===
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 32MB
maintenance_work_mem = 512MB

# === WAL ===
wal_level = replica
max_wal_size = 1GB
min_wal_size = 512MB
wal_compression = lz4               # 15+ 支持 lz4，压缩 WAL

# === 复制 ===
max_wal_senders = 5
wal_keep_size = 256MB

# === 日志（测试全开） ===
logging_collector = ON
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_min_duration_statement = 500     # 超过 500ms 记录
log_statement = 'ddl'               # 只记录 DDL
log_lock_waits = ON                  # 记录锁等待
log_temp_files = 0                   # 记录所有临时文件使用

# === 自动清理 ===
autovacuum = ON
autovacuum_max_workers = 3
log_autovacuum_min_duration = 0      # 记录所有 autovacuum 操作

# === 严格模式（模拟生产） ===
# sql_mode 在 PG 中通过标准 SQL 合规性保证，无需额外配置
```

### 3.4 生产环境配置 — 小型（8G 内存）

> **目标**：4 核 8G，单机或简单主从，QPS < 2000

```ini
# conf/prod-small.conf — PostgreSQL 生产小型配置
# 适用：4 核 8G 内存，100G SSD

# === 基础 ===
listen_addresses = '*'
port = 5432
max_connections = 200
superuser_reserved_connections = 3

# === 内存分配逻辑 ===
# 物理内存 8G 分配策略：
#   OS 保留：1.5G（19%）
#   shared_buffers：2G（25%）— PG 共享缓冲池，存热数据页
#   effective_cache_size：6G（75%）— 告知优化器 OS+PG 总缓存大小，影响执行计划
#   work_mem：每操作 32M — 排序/哈希用，200 连接不会同时排序
#   maintenance_work_mem：512M — VACUUM/CREATE INDEX 专用
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 32MB
maintenance_work_mem = 512MB
huge_pages = try                     # 启用大页减少 TLB miss，PG 需 OS 预留

# === WAL ===
wal_level = replica
max_wal_size = 2GB
min_wal_size = 512MB
wal_compression = lz4
wal_buffers = 64MB
wal_keep_size = 256MB

# === 检查点 ===
# checkpoint 逻辑：检查点越频繁，崩溃恢复越快，但写入放大越多
checkpoint_timeout = 10min           # 默认 5min 太频繁，10min 减少写入放大
checkpoint_completion_target = 0.9   # 在下一个检查点到来前 90% 时间完成刷脏

# === 复制 ===
max_wal_senders = 5
wal_sender_timeout = 60s

# === 查询计划 ===
random_page_cost = 1.1               # SSD 随机读接近顺序读，默认 4.0 会导致优化器倾向全表扫描
effective_io_concurrency = 200       # SSD 并发 IO 能力
max_parallel_workers_per_gather = 2  # 小型库 2 个并行工作进程

# === 自动清理 ===
autovacuum = ON
autovacuum_max_workers = 3
autovacuum_naptime = 30s
autovacuum_vacuum_scale_factor = 0.1   # 10% 死元组触发 VACUUM
autovacuum_analyze_scale_factor = 0.05 # 5% 变更触发 ANALYZE

# === 日志 ===
logging_collector = ON
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_min_duration_statement = 1000    # 超过 1 秒记录慢查询
log_lock_waits = ON
log_checkpoints = ON
log_autovacuum_min_duration = 1000   # 超过 1 秒的 autovacuum 记录

# === 安全 ===
ssl = ON                             # 需配置证书
# password_encryption = scram-sha-256  # 在 pg_hba.conf 中配置认证方式
```

### 3.5 生产环境配置 — 中型（32G 内存）

> **目标**：8 核 32G，主从架构，QPS 2000-8000

```ini
# conf/prod-medium.conf — PostgreSQL 生产中型配置
# 适用：8 核 32G 内存，500G SSD

# === 基础 ===
listen_addresses = '*'
port = 5432
max_connections = 300
superuser_reserved_connections = 3

# === 内存分配逻辑 ===
# 物理内存 32G 分配策略：
#   OS 保留：4G（12%）
#   shared_buffers：8G（25%）— PG 缓冲池
#   effective_cache_size：24G（75%）— 优化器参考值
#   work_mem：每操作 64M
#   maintenance_work_mem：1G
shared_buffers = 8GB
effective_cache_size = 24GB
work_mem = 64MB
maintenance_work_mem = 1GB
huge_pages = try

# === WAL ===
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB
wal_compression = lz4
wal_buffers = 64MB
wal_keep_size = 512MB

# === 检查点 ===
checkpoint_timeout = 10min
checkpoint_completion_target = 0.9

# === 复制 ===
max_wal_senders = 10
wal_sender_timeout = 60s
# 逻辑复制（如需表级复制）
# max_replication_slots = 10

# === 查询计划 ===
random_page_cost = 1.1
effective_io_concurrency = 200
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
jit = ON                             # 14+ JIT 编译加速复杂查询

# === 自动清理 ===
autovacuum = ON
autovacuum_max_workers = 4
autovacuum_naptime = 30s
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
# 大表单独降低阈值
# ALTER TABLE large_table SET (autovacuum_vacuum_scale_factor = 0.02);

# === 日志 ===
logging_collector = ON
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_min_duration_statement = 500     # 中型库阈值更严格
log_lock_waits = ON
log_checkpoints = ON
log_autovacuum_min_duration = 500

# === 统计信息 ===
track_activities = ON
track_counts = ON
track_io_timing = ON                 # 跟踪 IO 耗时，诊断 IO 瓶颈
track_functions = all                # 跟踪函数调用耗时

# === pg_stat_statements（必开） ===
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.max = 10000
```

### 3.6 生产环境配置 — 大型（64G 内存）

> **目标**：16 核 64G，Patroni 高可用，QPS 8000+

```ini
# conf/prod-large.conf — PostgreSQL 生产大型配置
# 适用：16 核 64G 内存，1T NVMe

# === 基础 ===
listen_addresses = '*'
port = 5432
max_connections = 500
superuser_reserved_connections = 3

# === 内存分配逻辑 ===
# 物理内存 64G 分配策略：
#   OS 保留：6G（9%）
#   shared_buffers：16G（25%）— 大缓冲池是性能基石
#   effective_cache_size：48G（75%）
#   work_mem：每操作 128M — 大型复杂查询需要更多排序空间
#   maintenance_work_mem：2G
shared_buffers = 16GB
effective_cache_size = 48GB
work_mem = 128MB
maintenance_work_mem = 2GB
huge_pages = try

# === WAL ===
wal_level = replica
max_wal_size = 8GB
min_wal_size = 2GB
wal_compression = lz4
wal_buffers = 128MB
wal_keep_size = 1GB
wal_log_hints = ON                  # Full-page writes for hint bits，Patroni 需要

# === 检查点 ===
checkpoint_timeout = 15min           # 大型库延长检查点间隔
checkpoint_completion_target = 0.9

# === 复制 ===
max_wal_senders = 15
wal_sender_timeout = 60s
max_replication_slots = 15

# === 查询计划 ===
random_page_cost = 1.1
effective_io_concurrency = 200
max_parallel_workers_per_gather = 8
max_parallel_workers = 16
jit = ON
jit_above_cost = 100000              # 只对高代价查询启用 JIT

# === 自动清理 ===
autovacuum = ON
autovacuum_max_workers = 6           # 大型库更多清理工作进程
autovacuum_naptime = 15s             # 更频繁检查
autovacuum_vacuum_scale_factor = 0.05  # 大型库降低阈值
autovacuum_analyze_scale_factor = 0.02
autovacuum_vacuum_cost_limit = 2000  # 提高清理 IO 限制，加速清理

# === 日志 ===
logging_collector = ON
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_min_duration_statement = 200     # 大型库阈值更严格
log_lock_waits = ON
log_checkpoints = ON
log_autovacuum_min_duration = 200

# === 统计 ===
track_activities = ON
track_counts = ON
track_io_timing = ON
track_functions = all

# === 扩展 ===
shared_preload_libraries = 'pg_stat_statements,pgaudit'
pg_stat_statements.track = all
pg_stat_statements.max = 50000
# pgaudit 配置
pgaudit.log = 'ddl,role'
pgaudit.log_level = warning
```

### 3.7 从库专用配置

> **目标**：在主库配置基础上追加从库特有参数

```ini
# conf/replica.conf — PostgreSQL 从库追加配置
# 在主库同级别配置基础上，修改/追加以下参数

# === 身份 ===
# standby.signal 文件存在即表示从库（pg_basebackup -R 自动创建）

# === 从库特有 ===
hot_standby = ON                     # 允许从库执行只读查询
max_standby_streaming_delay = 30s    # 从库查询冲突时等待时间，超时取消查询
wal_receiver_status_interval = 10s   # 从库向主库报告状态间隔

# === 从库反馈 ===
# 逻辑：从库查询可能需要旧版本数据，反馈信息让主库保留所需 WAL
hot_standby_feedback = ON            # 从库向主库反馈最旧事务 ID，防止主库清理从库需要的行

# === 从库优化 ===
# 从库承载读请求，可适当调大排序缓冲
work_mem = 128MB

# 从库不需要记录所有日志
log_statement = 'none'
log_min_duration_statement = 1000    # 只记慢查询
```

---

## 4. 调优

> **调优逻辑**：PostgreSQL 调优的核心是"让优化器做出正确决策"和"减少不必要的 IO"。参数按子系统组织，每个参数说明为什么这样设。

### 4.1 调优方法论

```
1. 定位瓶颈 → pg_stat_statements / EXPLAIN ANALYZE / OS 指标
2. 分层调优 → 内存层 → IO 层 → 查询计划层 → 连接层
3. 量化验证 → 修改前后对比 TPS/延迟/缓冲池命中率
4. 持续观察 → 参数变更后观察 24-48 小时
```

### 4.2 内存子系统

**核心逻辑**：PostgreSQL 的 `shared_buffers` 是共享缓冲池，与 MySQL 的 `innodb_buffer_pool_size` 类似但机制不同。PG 依赖 OS 页缓存做二级缓存，所以 `shared_buffers` 只需物理内存的 25%，不像 MySQL 设 60%-70%。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `shared_buffers` | 共享缓冲池，缓存数据页 | 物理内存 25% | **最重要的参数**。PG 依赖 OS 做二级缓存，设 25% 即可（与 MySQL 不同）。设太大 → OS 缓存减少，双缓存浪费 |
| `effective_cache_size` | 告知优化器的总缓存大小 | 物理内存 75% | **不是实际分配**，只影响执行计划选择。设太小 → 优化器倾向顺序扫描；设太大 → 优化器过度乐观 |
| `work_mem` | 单操作排序/哈希内存 | 32M-128M | ORDER BY / GROUP BY / HASH JOIN 使用。**注意**：每个操作独立分配，复杂查询可能同时多个操作 |
| `maintenance_work_mem` | 维护操作内存 | 512M-2G | VACUUM / CREATE INDEX / ALTER TABLE 使用。VACUUM 大表时影响速度 |
| `huge_pages` | 大页内存 | try | 减少 TLB miss，大内存（>8G shared_buffers）效果显著。需 OS 预留大页 |

**缓冲池命中率诊断**：

```sql
-- 缓冲池命中率
SELECT 
  ROUND(100.0 * sum(blks_hit) / NULLIF(sum(blks_hit + blks_read), 0), 2) AS cache_hit_ratio_pct
FROM pg_stat_database;
-- < 99% → shared_buffers 不够或查询缺少索引
-- > 99.5% → 缓冲池充足
```

### 4.3 IO 子系统

**核心逻辑**：IO 瓶颈表现为"WAL 写入慢"或"检查点抖动"。调优方向是优化 WAL 配置、平滑检查点写入。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `wal_level` | WAL 记录详细程度 | replica | logical 支持逻辑复制但 WAL 量更大。无复制需求可用 minimal |
| `max_wal_size` | WAL 最大总量 | 2G-8G | 检查点之间 WAL 允许增长的上限。太小 → 频繁检查点；太大 → 恢复时间长 |
| `min_wal_size` | WAL 最小保留 | 512M-2G | WAL 回收的底线，避免频繁删除重建 WAL 文件 |
| `wal_compression` | WAL 压缩 | lz4 | 15+ 支持 lz4，压缩 full-page writes，减少 WAL IO。CPU 开销极小 |
| `wal_buffers` | WAL 内存缓冲 | 64M-128M | 事务提交先写缓冲再写 WAL 文件。大缓冲减少 WAL 写入次数 |
| `checkpoint_timeout` | 检查点间隔 | 10min-15min | 默认 5min 太频繁。延长间隔减少写入放大，但崩溃恢复时间增加 |
| `checkpoint_completion_target` | 检查点完成目标 | 0.9 | 在下一个检查点 90% 时间均匀刷脏页，避免最后集中写入 |

### 4.4 查询计划子系统

**核心逻辑**：优化器依赖统计信息和成本参数做决策。错误的成本参数会导致优化器选择糟糕的执行计划。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `random_page_cost` | 随机页 IO 成本 | 1.1（SSD）/ 4.0（机械盘） | **SSD 必须修改**。默认 4.0 假设随机 IO 是顺序 IO 的 4 倍，SSD 上不成立。不改 → 优化器过度倾向全表扫描 |
| `effective_io_concurrency` | 并发 IO 能力 | 200（SSD） | 告知优化器磁盘预读能力。SSD 设 200 |
| `max_parallel_workers_per_gather` | 单查询并行度 | 2-8 | 并行查询工作进程数。CPU 核数 / 4 为起点 |
| `jit` | JIT 编译 | ON（14+） | 复杂查询（大量表达式）JIT 编译可加速 10%-30%。简单查询无收益 |
| `cpu_tuple_cost` | 处理一行 CPU 成本 | 0.01（默认） | 一般不改，除非优化器倾向全表扫描 |

**EXPLAIN ANALYZE 诊断**：

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, count(o.id)
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at > '2024-01-01'
GROUP BY u.name;

-- 关键观察点：
-- actual time=X..Y → 真实耗时，关注最慢的节点
-- rows=N (actual) vs rows=N (planned) → 估算偏差大则需 ANALYZE
-- Buffers: shared hit=N read=N → read 多则缓冲池不够或缺少索引
-- Seq Scan → 应该用索引扫描却用了全表扫描，检查 random_page_cost
```

### 4.5 连接子系统

**核心逻辑**：每个 PG 连接是独立进程（非线程），内存开销大。生产环境必须使用连接池。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `max_connections` | 最大连接数 | 200-500 | PG 每连接是进程，开销大。**不要设太大**，用连接池控制 |
| `superuser_reserved_connections` | 超级用户保留连接 | 3 | 紧急时保证 superuser 能连接 |

**连接池（PgBouncer）**：

```ini
; pgbouncer.ini
[databases]
appdb = host=127.0.0.1 port=5432 dbname=appdb

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction          ; 事务级池化（推荐）
max_client_conn = 1000
default_pool_size = 50
reserve_pool_size = 10
reserve_pool_timeout = 3
server_idle_timeout = 300
```

> **为什么 `pool_mode = transaction`**：事务级池化在事务结束时归还连接，比会话级池化节省 10-50 倍后端连接。大多数 Web 应用请求短、事务小，事务级最优。

### 4.6 自动清理子系统

**核心逻辑**：PostgreSQL 的 MVCC 中 UPDATE/DELETE 不立即回收旧版本，产生"死元组"。autovacuum 自动清理死元组并更新统计信息。**不开 autovacuum = 表持续膨胀**。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `autovacuum` | 是否开启自动清理 | ON | **生产必须开启** |
| `autovacuum_max_workers` | 清理工作进程数 | 3-6 | 多个表同时需要清理时并行处理 |
| `autovacuum_naptime` | 检查间隔 | 15s-30s | 更频繁检查，及时发现需要清理的表 |
| `autovacuum_vacuum_scale_factor` | 死元组占比触发阈值 | 0.05-0.1 | 大表应降低：`ALTER TABLE t SET (autovacuum_vacuum_scale_factor = 0.02)` |
| `autovacuum_analyze_scale_factor` | 变更占比触发统计 | 0.02-0.05 | 统计信息过时 → 优化器选错计划 |
| `autovacuum_vacuum_cost_limit` | 清理 IO 限制 | 200-2000 | 默认 200 太保守，大型库需提高，加速清理 |

### 4.7 容量规划

| 规模 | CPU | 内存 | shared_buffers | effective_cache_size | 磁盘 |
|------|-----|------|----------------|---------------------|------|
| 小型 | 4 核 | 8G | 2G | 6G | 100G SSD |
| 中型 | 8 核 | 32G | 8G | 24G | 500G SSD |
| 大型 | 16 核 | 64G | 16G | 48G | 1T NVMe |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 服务管理
sudo systemctl start postgresql-16
sudo systemctl stop postgresql-16
sudo systemctl reload postgresql-16   # 重载配置（不断连）

# 连接
sudo -iu postgres psql
psql -h 127.0.0.1 -U postgres -d appdb

# 查看活动
SELECT pid, usename, datname, state, query, query_start
FROM pg_stat_activity WHERE state = 'active';

# 终止连接
SELECT pg_terminate_backend(pid);     # 断开连接
SELECT pg_cancel_backend(pid);        # 取消当前查询，不断连
```

**配置热更新**：

```sql
-- 重新加载配置文件（无需重启）
SELECT pg_reload_conf();

-- 区分参数类型
SELECT name, context FROM pg_settings;
-- postmaster = 需重启 | sighup = 需 reload | user = 会话级
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **TPS** | `pg_stat_database.xact_commit + xact_rollback` | 持续 > 80% 容量 |
| **缓存命中率** | 见 4.2 诊断 SQL | < 99% |
| **死锁数** | `pg_stat_database.deadlocks` | > 0 |
| **复制延迟** | `pg_stat_replication.sent_lsn - replay_lsn` | > 10MB |
| **活跃连接数** | `pg_stat_activity WHERE state='active'` | > 80% max_connections |
| **膨胀率** | `n_dead_tup / n_live_tup` | > 10% |
| **长事务** | `now() - xact_start > interval` | > 5 分钟 |

**Prometheus 采集（postgres_exporter）**：

```bash
docker run -d \
  --name postgres-exporter \
  -p 9187:9187 \
  -e DATA_SOURCE_NAME="postgresql://exporter:Exp0rt!Pass@pg-host:5432/postgres?sslmode=disable" \
  prometheuscommunity/postgres-exporter
```

```sql
CREATE USER exporter WITH PASSWORD 'Exp0rt!Pass';
GRANT pg_monitor TO exporter;         -- 16+ 内置监控角色
```

### 5.3 备份与恢复

**逻辑备份（pg_dump）**：

```bash
# 单库备份（-Fc 自定义格式，支持并行恢复）
pg_dump -h localhost -U postgres -d appdb -Fc -j 4 -f appdb_$(date +%Y%m%d).dump

# 恢复
pg_restore -h localhost -U postgres -d appdb -j 4 appdb.dump

# 所有数据库
pg_dumpall -h localhost -U postgres > all_dbs_$(date +%Y%m%d).sql
```

**物理备份（pg_basebackup）**：

```bash
# 全量基础备份
pg_basebackup -h localhost -U replicator -D /backup/full -Ft -z -P

# 恢复
sudo systemctl stop postgresql-16
rm -rf /var/lib/pgsql/16/data/*
tar -xf /backup/full/base.tar.gz -C /var/lib/pgsql/16/data/
sudo systemctl start postgresql-16
```

**WAL 归档（PITR 基础）**：

```ini
# postgresql.conf
archive_mode = ON
archive_command = 'cp %p /var/lib/pgsql/16/archive/%f'
archive_timeout = 300               # 5 分钟强制归档
```

**备份策略**：

| 策略 | 频率 | 保留 | 适用 |
|------|------|------|------|
| pg_basebackup 全量 | 每日 02:00 | 7 天 | 中大型库 |
| WAL 归档 | 持续 | 14 天 | PITR 恢复 |
| pg_dump 逻辑 | 每日 03:00 | 14 天 | 小型库 / 跨版本迁移 |

### 5.4 版本升级

**大版本升级（15 → 16）**：

```bash
# 方式 1：pg_upgrade（原地升级，速度快）
sudo yum install -y postgresql16-server postgresql16-contrib
sudo /usr/pgsql-16/bin/postgresql-16-setup initdb
sudo systemctl stop postgresql-15
su - postgres
/usr/pgsql-16/bin/pg_upgrade -b /usr/pgsql-15/bin -B /usr/pgsql-16/bin \
  -d /var/lib/pgsql/15/data -D /var/lib/pgsql/16/data --check
/usr/pgsql-16/bin/pg_upgrade -b /usr/pgsql-15/bin -B /usr/pgsql-16/bin \
  -d /var/lib/pgsql/15/data -D /var/lib/pgsql/16/data
sudo systemctl start postgresql-16

# 方式 2：逻辑复制（零停机）
CREATE SUBSCRIPTION migrator
  CONNECTION 'host=old-pg port=5432 dbname=appdb'
  PUBLICATION all_tables;
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：连接数耗尽

**现象**：`FATAL: sorry, too many clients already`

**排查链路**：

```
现象：too many clients
  → SELECT count(*), state FROM pg_stat_activity GROUP BY state
    → 找到 idle 连接占比
      → SELECT pid, now()-query_start AS idle_duration FROM pg_stat_activity WHERE state='idle' ORDER BY idle_duration DESC
        → 清理长空闲连接 → 引入 PgBouncer
```

#### 故障 2：表膨胀

**现象**：查询变慢、磁盘持续增长，VACUUM 后空间不回收

**排查链路**：

```
现象：表膨胀
  → SELECT schemaname, relname, n_dead_tup, n_live_tup,
      ROUND(n_dead_tup*100.0/NULLIF(n_live_tup+n_dead_tup,0),2) AS bloat_pct
    FROM pg_stat_user_tables ORDER BY n_dead_tup DESC
    → 找到膨胀最严重的表
      → 查找阻止 VACUUM 的长事务：
        SELECT pid, now()-xact_start, query FROM pg_stat_activity
          WHERE state IN ('idle in transaction','active') ORDER BY xact_start
        → 终止长事务 → 手动 VACUUM VERBOSE ANALYZE table_name
          → 严重膨胀用 pg_repack（在线重组，不锁表）
```

#### 故障 3：复制延迟

**排查**：

```sql
-- 主库查看
SELECT client_addr, state, sent_lsn, replay_lsn,
  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes
FROM pg_stat_replication;

-- 从库查看
SELECT now() - pg_last_xact_replay_timestamp() AS replay_delay;
```

**解决**：从库硬件对齐主库 → 调整 `max_wal_size`/`wal_keep_size` → 检查复制槽

#### 故障 4：锁等待

**排查**：

```sql
SELECT blocked.pid AS blocked_pid,
       blocker.pid AS blocker_pid,
       blocked.query AS blocked_query,
       blocker.query AS blocker_query,
       blocked.locktype, blocked.relation::regclass
FROM pg_locks blocked
JOIN pg_locks blocker ON blocker.locktype = blocked.locktype
  AND blocker.database IS NOT DISTINCT FROM blocked.database
  AND blocker.relation IS NOT DISTINCT FROM blocked.relation
  AND blocker.pid != blocked.pid AND NOT blocker.granted
WHERE NOT blocked.granted;
```

**解决**：`SELECT pg_terminate_backend(blocker_pid);` → 设置 `lock_timeout` → 优化事务顺序

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `pg_stat_statements` | SQL 执行统计（Top N 慢查询） |
| `EXPLAIN (ANALYZE, BUFFERS)` | 执行计划 + 真实耗时 + IO 统计 |
| `pg_stat_activity` | 活动连接和查询 |
| `pg_locks` | 当前锁信息 |
| `pg_stat_user_tables` | 表级统计（死元组/扫描次数） |
| `pg_stat_replication` | 复制状态 |
| `pg_stat_database` | 库级统计（TPS/缓存命中率/死锁） |

**Top 慢查询**：

```sql
SELECT query, calls, total_exec_time, mean_exec_time, rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

### 6.3 应急处理

```sql
-- 全局只读
ALTER SYSTEM SET default_transaction_read_only = ON;
SELECT pg_reload_conf();

-- 断开非必要连接
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE usename NOT IN ('postgres', 'replicator', 'exporter')
  AND pid <> pg_backend_pid();
```

---

## 7. 参考资料

- [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/)
- [PostgreSQL Wiki - Tuning](https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server)
- [Patroni Documentation](https://patroni.readthedocs.io/)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [pg_repack](https://github.com/reorg/pg_repack)
- [postgres_exporter](https://github.com/prometheus-community/postgres_exporter)

# Oracle 部署运维指南

> **定位**：企业级关系型数据库，以高可用、高性能和丰富特性著称
> **适用场景**：金融核心系统、大型 ERP、高并发 OLTP、数据仓库
> **难度级别**：⭐⭐⭐⭐ 较高
> **说明**：本文以 Oracle XE（免费社区版）为主，商业版差异单独标注

---

## 1. 概述

### 1.1 是什么

Oracle Database 是 Oracle 公司的商业关系型数据库，长期占据企业级数据库市场首位。Oracle XE（Express Edition）是免费社区版，适合开发测试和小型生产部署。

### 1.2 版本对比

| 版本 | 内存限制 | 磁盘限制 | CPU 限制 | 价格 | RAC | Data Guard |
|------|----------|----------|----------|------|-----|------------|
| **XE 21c** | 2GB SGA + 2GB PGA | 12GB 用户数据 | 不限核 | 免费 | ❌ | ❌ |
| **SE2** | 不限 | 不限 | 最多 16 核 | 按核心 | ❌ | ✅ |
| **EE** | 不限 | 不限 | 不限 | 按核心 | ✅ | ✅ |

### 1.3 适用场景

**最佳适用**：金融核心交易（ACID + RAC + Data Guard）、大型 ERP/CRM、数据安全合规要求高的行业

**不适用**：预算有限（→ PostgreSQL）、简单 Web 应用（→ MySQL）、文档型数据（→ MongoDB）

---

## 2. 部署

### 2.1 裸机部署（Oracle XE 21c）

**系统要求**：Oracle Linux 8 / CentOS 8 / Ubuntu 20.04+，最低 2 核 4G，推荐 4 核 8G+，SWAP ≥ 2G

```bash
# Oracle Linux
sudo yum install -y oracle-database-xe-21c-1.0-1.ol8.x86_64.rpm
sudo /etc/init.d/oracle-xe-21c configure  # 按提示设置密码和端口

# 环境变量
export ORACLE_HOME=/opt/oracle/product/21c/dbhomeXE
export ORACLE_SID=XE
export PATH=$ORACLE_HOME/bin:$PATH

# 连接
sqlplus sys as sysdba
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name oracle-xe \
  -p 1521:1521 \
  -p 5500:5500 \
  -e ORACLE_PWD=Str0ngOracle!Pass \
  -e ORACLE_CHARACTERSET=AL32UTF8 \
  -v oracle-data:/opt/oracle/oradata \
  --shm-size=2g \
  --restart unless-stopped \
  container-registry.oracle.com/database/express:21.3.0-xe
```

> **`--shm-size=2g`**：Oracle 依赖共享内存（/dev/shm），Docker 默认 64M 远远不够，必须调大。

### 2.3 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  oracle-xe:
    image: container-registry.oracle.com/database/express:21.3.0-xe
    container_name: oracle-xe
    restart: unless-stopped
    ports:
      - "1521:1521"
      - "5500:5500"
    environment:
      ORACLE_PWD: Str0ngOracle!Pass
      ORACLE_CHARACTERSET: AL32UTF8
    volumes:
      - oracle-data:/opt/oracle/oradata
      - ./init:/opt/oracle/scripts/startup   # 启动后自动执行的 SQL
    shm_size: 2g
    deploy:
      resources:
        limits:
          memory: 8g

volumes:
  oracle-data:
```

**初始化脚本** `init/01_create_user.sql`：

```sql
ALTER SESSION SET CONTAINER = XEPDB1;
CREATE USER appuser IDENTIFIED BY "AppUser!Pass"
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;
GRANT CONNECT, RESOURCE, CREATE VIEW TO appuser;
```

### 2.4 生产环境部署要点

**商业版高可用方案**：

| 方案 | 架构 | RPO | RTO | 说明 |
|------|------|-----|-----|------|
| **Data Guard** | 主备物理复制 | ≈0 | 分钟级 | 最常用灾备 |
| **RAC** | 共享存储多节点 | 0 | 秒级 | 最高可用性，成本高 |
| **GoldenGate** | 逻辑复制 | 秒级 | 分钟级 | 异构数据库同步 |
| **Active Data Guard** | 主备 + 只读查询 | ≈0 | 分钟级 | 备库可读 |

**安全清单**：密码策略（PROFILE）、审计（AUDIT/Unified Auditing）、TDE 透明数据加密、网络加密（sqlnet.ora TLS）、VPD 行级安全

---

## 3. 配置文件

> **核心原则**：Oracle 的配置通过初始化参数（SPFILE/PFILE）管理，XE 版本受内存限制，配置空间有限但仍需合理分配。

### 3.1 参数文件机制

```
Oracle 启动时读取参数文件：
  spfile<SID>.ora（二进制，ALTER SYSTEM 写入）→ 优先
  init<SID>.ora（文本，手动编辑）→ 备选

XE 默认位置：/opt/oracle/product/21c/dbhomeXE/dbs/spfileXE.ora
```

> **最佳实践**：使用 SPFILE（`ALTER SYSTEM SET ... SCOPE=SPFILE`），不手动编辑 PFILE。`ALTER SYSTEM` 修改自动持久化到 SPFILE。

### 3.2 开发环境配置

> **目标**：XE 默认配置即可满足开发，以下为关键调优参数

```sql
-- 开发环境参数设置（XE 受 2G SGA 限制）
ALTER SYSTEM SET open_cursors = 300 SCOPE=SPFILE;
ALTER SYSTEM SET processes = 200 SCOPE=SPFILE;
ALTER SYSTEM SET sessions = 400 SCOPE=SPFILE;  -- sessions ≈ processes × 1.5 + 22

-- 开启审计（开发环境可选）
ALTER SYSTEM SET audit_trail = DB SCOPE=SPFILE;

-- 开启闪回（开发环境方便回退数据）
ALTER DATABASE FLASHBACK ON;
```

### 3.3 测试环境配置

```sql
-- 测试环境参数（XE 受限，重点调优 SGA 分配）
-- XE SGA 上限 2G，需精细分配

-- === SGA 分配逻辑 ===
-- XE 总 SGA ≈ 2G
--   Shared Pool：800M（40%）— SQL 解析、执行计划缓存
--   Buffer Cache：1G（50%）— 数据块缓存，最关键
--   其他（log buffer/large pool/java pool）：200M（10%）
ALTER SYSTEM SET sga_target = 2G SCOPE=SPFILE;
ALTER SYSTEM SET shared_pool_size = 800M SCOPE=SPFILE;
ALTER SYSTEM SET db_cache_size = 1G SCOPE=SPFILE;
ALTER SYSTEM SET log_buffer = 128M SCOPE=SPFILE;

-- === PGA ===
-- XE PGA 上限 2G
ALTER SYSTEM SET pga_aggregate_target = 1G SCOPE=SPFILE;

-- === 连接 ===
ALTER SYSTEM SET processes = 300 SCOPE=SPFILE;
ALTER SYSTEM SET sessions = 600 SCOPE=SPFILE;
ALTER SYSTEM SET open_cursors = 500 SCOPE=SPFILE;

-- === 诊断 ===
ALTER SYSTEM SET sql_trace = FALSE SCOPE=SPFILE;
ALTER SYSTEM SET timed_statistics = TRUE SCOPE=SPFILE;
ALTER SYSTEM SET statistics_level = TYPICAL SCOPE=SPFILE;

-- 日志
ALTER SYSTEM SET audit_trail = DB SCOPE=SPFILE;
```

### 3.4 生产环境配置 — XE（8G 内存）

> **目标**：XE 受 2G SGA + 2G PGA 限制，重点是在限制内最大化利用

```sql
-- 生产 XE 配置（受限于 XE 许可）
-- === SGA（最大 2G）===
ALTER SYSTEM SET sga_target = 2G SCOPE=SPFILE;
ALTER SYSTEM SET shared_pool_size = 600M SCOPE=SPFILE;   -- 生产需更多解析缓存
ALTER SYSTEM SET db_cache_size = 1.1G SCOPE=SPFILE;       -- 尽量大，缓冲数据块
ALTER SYSTEM SET log_buffer = 64M SCOPE=SPFILE;
ALTER SYSTEM SET large_pool_size = 128M SCOPE=SPFILE;     -- RMAN 备份用

-- === PGA（最大 2G）===
ALTER SYSTEM SET pga_aggregate_target = 1.5G SCOPE=SPFILE;
-- PGA 逻辑：
--   work_area_size_policy = AUTO（默认）→ PGA 自动管理
--   排序/哈希操作从 PGA 分配，设太小 → 临时表空间 IO 飙升

-- === 连接 ===
ALTER SYSTEM SET processes = 500 SCOPE=SPFILE;
ALTER SYSTEM SET sessions = 1000 SCOPE=SPFILE;
ALTER SYSTEM SET open_cursors = 1000 SCOPE=SPFILE;

-- === 优化器 ===
ALTER SYSTEM SET optimizer_mode = ALL_ROWS SCOPE=SPFILE;  -- OLTP 场景用 ALL_ROWS
ALTER SYSTEM SET cursor_sharing = EXACT SCOPE=SPFILE;     -- 不自动替换字面量，保证执行计划稳定

-- === 安全 ===
ALTER SYSTEM SET audit_trail = DB,EXTENDED SCOPE=SPFILE;  -- 扩展审计
ALTER SYSTEM SET sec_max_failed_login_attempts = 5 SCOPE=SPFILE;
ALTER SYSTEM SET sec_password_grace_time = 1 SCOPE=SPFILE;

-- === 诊断 ===
ALTER SYSTEM SET statistics_level = ALL SCOPE=SPFILE;      -- 收集详细统计
ALTER SYSTEM SET timed_statistics = TRUE SCOPE=SPFILE;
```

### 3.5 商业版生产配置 — 中型（32G 内存）

> **目标**：8 核 32G，Data Guard 灾备，不受 XE 限制

```sql
-- 商业版 EE/SE2 配置（32G 内存）
-- === SGA 分配逻辑 ===
-- 物理内存 32G 分配策略：
--   OS 保留：4G（12%）
--   SGA：20G（62%）
--     Buffer Cache：12G（60% of SGA）— 数据块缓存
--     Shared Pool：6G（30% of SGA）— SQL 解析/库缓存
--     其他：2G（10% of SGA）
--   PGA：6G（19%）— 排序/哈希
--   其他：2G（7%）
ALTER SYSTEM SET memory_target = 0 SCOPE=SPFILE;           -- 关闭 AMM，手动管理
ALTER SYSTEM SET sga_target = 20G SCOPE=SPFILE;
ALTER SYSTEM SET sga_max_size = 20G SCOPE=SPFILE;
ALTER SYSTEM SET shared_pool_size = 6G SCOPE=SPFILE;
ALTER SYSTEM SET db_cache_size = 12G SCOPE=SPFILE;
ALTER SYSTEM SET log_buffer = 256M SCOPE=SPFILE;
ALTER SYSTEM SET large_pool_size = 512M SCOPE=SPFILE;
ALTER SYSTEM SET java_pool_size = 256M SCOPE=SPFILE;

-- === PGA ===
ALTER SYSTEM SET pga_aggregate_target = 6G SCOPE=SPFILE;
ALTER SYSTEM SET pga_aggregate_limit = 8G SCOPE=SPFILE;    -- PGA 硬上限

-- === 连接 ===
ALTER SYSTEM SET processes = 1000 SCOPE=SPFILE;
ALTER SYSTEM SET sessions = 2000 SCOPE=SPFILE;
ALTER SYSTEM SET open_cursors = 2000 SCOPE=SPFILE;

-- === Redo Log ===
-- redo log 大小影响检查点频率
-- 经验值：20 分钟切换一次 redo log
-- ALTER DATABASE ADD LOGFILE GROUP 4 SIZE 1G;  -- 需在 SQL 中执行

-- === 优化器 ===
ALTER SYSTEM SET optimizer_mode = ALL_ROWS SCOPE=SPFILE;
ALTER SYSTEM SET cursor_sharing = EXACT SCOPE=SPFILE;
ALTER SYSTEM SET optimizer_index_cost_adj = 100 SCOPE=SPFILE;  -- 默认 100，OLTP 可降到 50-80
ALTER SYSTEM SET optimizer_features_enable = '21.1.0' SCOPE=SPFILE;

-- === 归档模式 ===
-- 生产必须开启归档模式（ARCHIVELOG）
-- SHUTDOWN IMMEDIATE → STARTUP MOUNT → ALTER DATABASE ARCHIVELOG → ALTER DATABASE OPEN

-- === 安全 ===
ALTER SYSTEM SET audit_trail = DB,EXTENDED SCOPE=SPFILE;
ALTER SYSTEM SET unified_audit_sga_queue_size = 1048576 SCOPE=SPFILE;
```

### 3.6 商业版生产配置 — 大型（64G 内存）

```sql
-- 商业版 EE 配置（64G 内存，RAC 或 Data Guard）
-- === SGA ===
ALTER SYSTEM SET memory_target = 0 SCOPE=SPFILE;
ALTER SYSTEM SET sga_target = 40G SCOPE=SPFILE;
ALTER SYSTEM SET sga_max_size = 40G SCOPE=SPFILE;
ALTER SYSTEM SET shared_pool_size = 12G SCOPE=SPFILE;
ALTER SYSTEM SET db_cache_size = 24G SCOPE=SPFILE;
ALTER SYSTEM SET log_buffer = 512M SCOPE=SPFILE;
ALTER SYSTEM SET large_pool_size = 1G SCOPE=SPFILE;
ALTER SYSTEM SET db_keep_cache_size = 2G SCOPE=SPFILE;     -- KEEP 池：热表常驻内存
ALTER SYSTEM SET db_recycle_cache_size = 512M SCOPE=SPFILE; -- RECYCLE 池：大表扫描

-- === PGA ===
ALTER SYSTEM SET pga_aggregate_target = 12G SCOPE=SPFILE;
ALTER SYSTEM SET pga_aggregate_limit = 16G SCOPE=SPFILE;

-- === 连接 ===
ALTER SYSTEM SET processes = 2000 SCOPE=SPFILE;
ALTER SYSTEM SET sessions = 4000 SCOPE=SPFILE;
ALTER SYSTEM SET open_cursors = 4000 SCOPE=SPFILE;

-- === 并行 ===
ALTER SYSTEM SET parallel_max_servers = 32 SCOPE=SPFILE;
ALTER SYSTEM SET parallel_min_servers = 4 SCOPE=SPFILE;
ALTER SYSTEM SET parallel_degree_policy = AUTO SCOPE=SPFILE;  -- 自动并行度

-- === RAC 特有（如适用）===
-- ALTER SYSTEM SET cluster_database = TRUE SCOPE=SPFILE;
-- ALTER SYSTEM SET cluster_database_instances = 2 SCOPE=SPFILE;
-- ALTER SYSTEM SET gc_server_processes = 4 SCOPE=SPFILE;
```

---

## 4. 调优

### 4.1 调优方法论

```
1. 定位瓶颈 → AWR 报告 / ASH / 等待事件 / OS 指标
2. 分层调优 → SGA 层 → PGA 层 → IO 层 → 优化器层
3. 量化验证 → AWR 对比修改前后
4. 持续观察 → 参数变更后观察 24-48 小时
```

### 4.2 SGA 子系统

**核心逻辑**：SGA 是共享内存区，Buffer Cache 缓存数据块，Shared Pool 缓存 SQL 执行计划。分配不当导致"库缓存命中低"或"物理读过多"。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `sga_target` | SGA 总大小 | 物理内存 60%-65% | 自动管理 SGA 内各组件分配。设 0 则完全手动管理 |
| `db_cache_size` | 数据块缓冲 | SGA 的 50%-60% | **最关键的 SGA 组件**。命中率 < 95% → 需增大 |
| `shared_pool_size` | SQL 解析/库缓存 | SGA 的 25%-35% | 太小 → 硬解析多（library cache miss）；太大 → 管理开销 |
| `log_buffer` | redo log 缓冲 | 64M-512M | 大量 DML 时需增大。超过 1M 后收益递减 |
| `large_pool_size` | 大池 | 128M-1G | RMAN 备份、Shared Server 模式使用。专用服务器模式可不设 |
| `db_keep_cache_size` | KEEP 缓冲池 | 按需 | 热小表常驻内存，避免被挤出默认池 |

**Buffer Cache 命中率诊断**：

```sql
SELECT ROUND(1 - (physical_reads / (db_block_gets + consistent_gets)), 4) * 100 AS hit_ratio_pct
FROM (
  SELECT SUM(value) AS physical_reads FROM v$sysstat WHERE name = 'physical reads'
), (
  SELECT SUM(value) AS db_block_gets FROM v$sysstat WHERE name = 'db block gets'
), (
  SELECT SUM(value) AS consistent_gets FROM v$sysstat WHERE name = 'consistent gets'
);
-- < 95% → db_cache_size 不够
-- > 99% → 充足
```

### 4.3 PGA 子系统

**核心逻辑**：PGA 是每个会话私有内存，排序和哈希操作使用。PGA 不够 → 临时表空间 IO 飙升。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `pga_aggregate_target` | PGA 总目标 | 物理内存 15%-20% | 自动管理每个会话的排序/哈希内存 |
| `pga_aggregate_limit` | PGA 硬上限 | `pga_aggregate_target` 的 1.5-2 倍 | 12c+ 防止 PGA 无限增长导致 OOM |
| `workarea_size_policy` | 工作区策略 | AUTO | 自动分配排序/哈希内存。设 MANUAL 则按 `sort_area_size` 等手动分配 |

**PGA 使用诊断**：

```sql
SELECT name, value / 1024 / 1024 AS mb
FROM v$pgastat
WHERE name IN ('aggregate PGA target parameter',
               'total PGA inuse',
               'total PGA allocated',
               'over allocation count');
-- over allocation count > 0 → pga_aggregate_target 不够
```

### 4.4 IO 子系统

**核心逻辑**：Oracle IO 瓶颈表现为"log file sync"等待或"db file sequential read"过多。

| 等待事件 | 含义 | 调优方向 |
|----------|------|----------|
| `log file sync` | 事务提交等待 redo 落盘 | 增大 `log_buffer`、使用更快的 redo 磁盘、调整 `commit_write` |
| `db file sequential read` | 单块读（索引访问） | 增大 `db_cache_size`、优化索引、SSD |
| `db file scattered read` | 多块读（全表扫描） | 优化 SQL 避免全表扫描、增大 `db_cache_size` |
| `db file parallel write` | DBWn 写脏块 | 增大 `db_writer_processes`、SSD |
| `log file parallel write` | LGWR 写 redo | 更快的 redo 磁盘、增大 `log_buffer` |

**Redo Log 大小调优**：

```sql
-- 查看 redo log 切换频率（应 20-30 分钟切换一次）
SELECT b.sequence#, b.first_time, a.first_time AS next_time,
  ROUND((a.first_time - b.first_time) * 24 * 60, 2) AS minutes_between
FROM v$log_history a, v$log_history b
WHERE a.sequence# = b.sequence# + 1
ORDER BY b.sequence# DESC
FETCH FIRST 20 ROWS ONLY;
-- 切换间隔 < 5 分钟 → redo log 太小，需增大
```

### 4.5 优化器子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `optimizer_mode` | 优化器模式 | ALL_ROWS | OLTP 用 ALL_ROWS（吞吐优先）；FIRST_ROWS_N 用于响应优先场景 |
| `optimizer_index_cost_adj` | 索引访问成本调整 | 50-100 | 默认 100。OLTP 降到 50-80 让优化器更倾向索引扫描。**谨慎调整** |
| `cursor_sharing` | 字面量替换 | EXACT | EXACT 不替换（推荐，执行计划稳定）；FORCE 替换（减少硬解析但可能选错计划） |
| `statistics_level` | 统计收集级别 | TYPICAL | ALL 收集最全但开销大；TYPICAL 平衡；BASIC 最少（不推荐） |

### 4.6 容量规划

| 规模 | CPU | 内存 | SGA | PGA | 磁盘 |
|------|-----|------|-----|-----|------|
| XE | 4 核 | 8G | 2G（上限） | 2G（上限） | 100G SSD |
| SE2 中型 | 8 核 | 32G | 20G | 6G | 500G SSD |
| EE 大型 | 16 核 | 64G | 40G | 12G | 1T NVMe |

---

## 5. 运维

### 5.1 日常运维操作

```sql
-- 启动 / 停止
STARTUP
SHUTDOWN IMMEDIATE     -- 等待会话完成
SHUTDOWN ABORT         -- 紧急（需恢复）

-- 监听管理（命令行）
lsnrctl status
lsnrctl start / stop

-- 实例状态
SELECT instance_name, status, database_status FROM v$instance;

-- 会话
SELECT sid, serial#, username, program, status, sql_id
FROM v$session WHERE username IS NOT NULL;

-- 杀掉会话
ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **活跃会话** | `v$session WHERE status='ACTIVE'` | > 80% processes |
| **等待事件** | `v$session_wait WHERE wait_class<>'Idle'` | Top 等待异常 |
| **表空间使用率** | `dba_tablespace_usage_metrics` | > 85% |
| **Buffer Cache 命中率** | 见 4.2 | < 95% |
| **redo 切换频率** | `v$log_history` | > 10 次/小时 |
| **锁等待** | `v$lock WHERE block=1` | 持续存在 |

**XE 替代 AWR 的监控**（XE 无 AWR）：

```sql
-- Top 等待事件
SELECT event, total_waits, time_waited, wait_class
FROM v$system_event
WHERE wait_class <> 'Idle'
ORDER BY time_waited DESC
FETCH FIRST 10 ROWS ONLY;

-- 慢 SQL
SELECT sql_id, sql_text, elapsed_time/1000000 AS elapsed_sec,
  executions, elapsed_time/NULLIF(executions,0)/1000000 AS avg_sec
FROM v$sql
WHERE elapsed_time/NULLIF(executions,0) > 1000000
ORDER BY elapsed_time DESC
FETCH FIRST 20 ROWS ONLY;
```

### 5.3 备份与恢复

**RMAN 备份**：

```bash
rman target /
RMAN> BACKUP DATABASE PLUS ARCHIVELOG;
RMAN> BACKUP INCREMENTAL LEVEL 1 DATABASE;
RMAN> VALIDATE BACKUPSET;
```

**逻辑备份（expdp）**：

```bash
# 全 Schema 导出
expdp system/Str0ngOracle!Pass@xepdb1 \
  DIRECTORY=DATA_PUMP_DIR \
  DUMPFILE=appuser_$(date +%Y%m%d).dmp \
  SCHEMAS=APPUSER \
  PARALLEL=4

# 导入
impdp system/Str0ngOracle!Pass@xepdb1 \
  DIRECTORY=DATA_PUMP_DIR \
  DUMPFILE=appuser_20240101.dmp \
  SCHEMAS=APPUSER
```

**Flashback 恢复**：

```sql
-- 闪回查询（查看过去某个时间的数据）
SELECT * FROM orders AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '1' HOUR)
WHERE order_id = 12345;

-- 闪回表（回退表到过去时间点）
FLASHBACK TABLE orders TO TIMESTAMP (SYSTIMESTAMP - INTERVAL '30' MINUTE);

-- 闪回数据库（需开启 FLASHBACK）
FLASHBACK DATABASE TO TIMESTAMP (SYSTIMESTAMP - INTERVAL '1' HOUR);
```

**备份策略**：

| 策略 | 频率 | 保留 | 适用 |
|------|------|------|------|
| RMAN 全量 | 每日 02:00 | 7 天 | 生产必须 |
| RMAN 增量 | 每 6 小时 | 3 天 | 大型库 |
| expdp 逻辑 | 每日 03:00 | 14 天 | 跨版本迁移 |
| 归档日志 | 实时 | 7 天 | PITR 恢复 |

### 5.4 版本升级

**大版本升级步骤**：备份 → 兼容性检查（`DBUA` 或 `preupgrd.sql`）→ 停机 → 升级软件 → 运行 `catctl.pl` → 验证

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：ORA-00018 最大会话数

**现象**：`ORA-00018: maximum number of sessions exceeded`

**排查链路**：

```
现象：maximum sessions
  → SELECT count(*), username FROM v$session GROUP BY username ORDER BY count(*) DESC
    → 找到占会话最多的用户
      → 检查应用连接池配置
        → 增大 processes/sessions → 引入连接池（DRCP）
```

#### 故障 2：表空间满

**现象**：`ORA-01653: unable to extend table`

**排查**：

```sql
SELECT tablespace_name, ROUND(used_space/1024/1024, 2) AS used_gb,
  ROUND(tablespace_size/1024/1024, 2) AS total_gb,
  ROUND(used_percent, 2) AS used_pct
FROM dba_tablespace_usage_metrics
ORDER BY used_percent DESC;
```

**解决**：
1. 增大数据文件：`ALTER DATABASE DATAFILE '/path/to/file.dbf' RESIZE 10G;`
2. 开启自扩展：`ALTER DATABASE DATAFILE '/path/to/file.dbf' AUTOEXTEND ON NEXT 100M MAXSIZE 30G;`
3. 添加数据文件：`ALTER TABLESPACE users ADD DATAFILE '/path/to/file2.dbf' SIZE 5G;`

#### 故障 3：锁等待

**排查**：

```sql
-- 查看阻塞会话
SELECT blocking_session, sid, serial#, wait_class, seconds_in_wait
FROM v$session WHERE blocking_session IS NOT NULL;

-- 查看锁详情
SELECT s.sid, s.serial#, s.username, l.type, l.id1, l.id2, l.lmode, l.request
FROM v$lock l JOIN v$session s ON l.sid = s.sid
WHERE l.block = 1;
```

**解决**：`ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;`

#### 故障 4：归档日志满

**现象**：`ORA-00257: archiver error`

**排查**：

```bash
# 检查归档目录空间
df -h /opt/oracle/oradata/XE/archivelog
```

**解决**：
1. 删除旧归档：`RMAN> DELETE ARCHIVELOG ALL COMPLETED BEFORE 'SYSDATE-7';`
2. 增大磁盘空间
3. 开启归档压缩

### 6.2 诊断工具

| 工具 | 用途 | XE 支持 |
|------|------|---------|
| `AWR` | 工作负载报告 | ❌ |
| `ASH` | 活动会话历史 | ❌ |
| `v$system_event` | 系统等待事件 | ✅ |
| `v$sql` | SQL 执行统计 | ✅ |
| `EXPLAIN PLAN` | 执行计划 | ✅ |
| `TKPROF` | SQL Trace 格式化 | ✅ |
| `RMAN` | 备份恢复 | ✅ |
| `Data Dictionary` | `dba_*` / `v$*` 视图 | ✅ |

### 6.3 应急处理

```sql
-- 只读模式
ALTER DATABASE OPEN READ ONLY;

-- 限制会话模式（只允许有 RESTRICTED SESSION 权限的用户连接）
ALTER SYSTEM ENABLE RESTRICTED SESSION;

-- 杀掉所有非必要会话
BEGIN
  FOR r IN (SELECT sid, serial# FROM v$session WHERE username NOT IN ('SYS','SYSTEM')) LOOP
    EXECUTE IMMEDIATE 'ALTER SYSTEM KILL SESSION ''' || r.sid || ',' || r.serial# || ''' IMMEDIATE';
  END LOOP;
END;
/
```

---

## 7. 参考资料

- [Oracle Database Documentation](https://docs.oracle.com/en/database/oracle/oracle-database/)
- [Oracle XE Documentation](https://docs.oracle.com/en/database/oracle/oracle-database/21/xeinl/)
- [Oracle Database Reference](https://docs.oracle.com/en/database/oracle/oracle-database/21/refrn/)
- [Oracle Performance Tuning Guide](https://docs.oracle.com/en/database/oracle/oracle-database/21/tgdba/)
- [Oracle RMAN Reference](https://docs.oracle.com/en/database/oracle/oracle-database/21/rcmrf/)

# Oracle 部署指南

> 版本：21c XE / 19c EE | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 最低 | 推荐 |
|------|------|------|
| CPU | 2 核 | 8 核+ |
| 内存 | 4G（XE 2G SGA + 2G PGA） | 32G+（EE） |
| SWAP | 2G | 4G |
| /dev/shm | 2G | 内存的 50% |
| 磁盘 | 20G | 100G+ SSD |
| 系统 | CentOS 7.9+ / Oracle Linux 8+ / Ubuntu 22.04+ | |

依赖包：
```bash
# CentOS
sudo yum install -y binutils compat-libcap1 compat-libstdc++ gcc make libaio-devel elfutils-libelf-devel ksh
# Ubuntu
sudo apt install -y binutils libaio1 libaio-dev ksh
```

---

## 2. 裸机安装（通用）

```bash
# CentOS — Oracle XE 21c
sudo yum install -y oracle-database-xe-21c-1.0-1.ol8.x86_64.rpm
sudo /etc/init.d/oracle-xe-21c configure

# 环境变量
cat >> ~/.bashrc << 'EOF'
export ORACLE_HOME=/opt/oracle/product/21c/dbhomeXE
export ORACLE_SID=XE
export PATH=$ORACLE_HOME/bin:$PATH
EOF
source ~/.bashrc

# Ubuntu — Oracle XE 21c
sudo apt install -y ./oracle-database-xe-21c-1.0-1.ol8.x86_64.deb
sudo /etc/init.d/oracle-xe-21c configure

# 验证
sqlplus / as sysdba <<< "SELECT instance_name, status FROM v\$instance;"
```

---

## 3. 单机部署

### 适用场景

开发测试、小型生产（4 核 8G 以内）、学习环境。使用 CDB + PDB 架构。

### 配置

**初始化参数（CDB 级别）**：
```sql
-- SGA
ALTER SYSTEM SET sga_target = 2G SCOPE=SPFILE;
ALTER SYSTEM SET shared_pool_size = 600M SCOPE=SPFILE;
ALTER SYSTEM SET db_cache_size = 1.1G SCOPE=SPFILE;
ALTER SYSTEM SET log_buffer = 64M SCOPE=SPFILE;

-- PGA
ALTER SYSTEM SET pga_aggregate_target = 1.5G SCOPE=SPFILE;

-- 连接
ALTER SYSTEM SET processes = 500 SCOPE=SPFILE;
ALTER SYSTEM SET sessions = 1000 SCOPE=SPFILE;
ALTER SYSTEM SET open_cursors = 1000 SCOPE=SPFILE;

-- 优化器
ALTER SYSTEM SET statistics_level = ALL SCOPE=SPFILE;
ALTER SYSTEM SET optimizer_mode = ALL_ROWS SCOPE=SPFILE;
ALTER SYSTEM SET cursor_sharing = EXACT SCOPE=SPFILE;

-- 审计
ALTER SYSTEM SET audit_trail = DB,EXTENDED SCOPE=SPFILE;
```

**重启生效**：
```sql
SHUTDOWN IMMEDIATE;
STARTUP;
ALTER PLUGGABLE DATABASE XEPDB1 OPEN;
ALTER PLUGGABLE DATABASE XEPDB1 SAVE STATE;
```

**创建 PDB 用户**：
```sql
ALTER SESSION SET CONTAINER = XEPDB1;
CREATE USER app IDENTIFIED BY "App!Pass"
  DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;
GRANT CONNECT, RESOURCE, CREATE VIEW TO app;
```

### 启动

```bash
# 启动数据库
sqlplus / as sysdba <<< "STARTUP"
# 启动监听
lsnrctl start
```

### 验证

```bash
sqlplus app/App!Pass@//localhost:1521/XEPDB1 <<< "SELECT 1 FROM DUAL;"
```

### Docker Compose

```yaml
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
      - ./init:/opt/oracle/scripts/startup
    shm_size: 2g

volumes:
  oracle-data:
```

初始化脚本 `init/01_init.sql`：
```sql
ALTER SESSION SET CONTAINER = XEPDB1;
CREATE USER app IDENTIFIED BY "App!Pass"
  DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;
GRANT CONNECT, RESOURCE, CREATE VIEW TO app;
```

---

## 4. RAC 集群部署

### 适用场景

生产核心系统，要求高可用（RPO=0, RTO 秒级），共享存储架构。

### 节点规划

| 节点 | 主机名 | IP（Public） | IP（Private） | VIP | SCAN IP |
|------|--------|-------------|-------------|-----|---------|
| 1 | rac1 | 10.0.0.1 | 192.168.1.1 | 10.0.0.11 | 10.0.0.10 |
| 2 | rac2 | 10.0.0.2 | 192.168.1.2 | 10.0.0.12 | 10.0.0.10 |

- 共享存储：ASM（OCR + Voting + DATA）
- 网络：Public + Private（心跳）隔离
- 系统：Oracle Linux 8 / CentOS 8，相同版本

### 配置

**系统参数**（两节点执行）：
```bash
cat >> /etc/sysctl.conf << 'EOF'
fs.aio-max-nr = 1048576
fs.file-max = 6815744
kernel.shmall = 1073741824
kernel.shmmax = 4398046511104
kernel.sem = 250 32000 100 128
net.ipv4.ip_local_port_range = 9000 65500
net.core.rmem_default = 262144
net.core.wmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_max = 4194304
EOF
sysctl -p
```

**GI（Grid Infrastructure）初始化参数**：
```sql
-- RAC 参数（两节点一致）
ALTER SYSTEM SET cluster_database = TRUE SCOPE=SPFILE;
ALTER SYSTEM SET cluster_database_instances = 2 SCOPE=SPFILE;
ALTER SYSTEM SET statistics_level = ALL SCOPE=SPFILE;
ALTER SYSTEM SET optimizer_mode = ALL_ROWS SCOPE=SPFILE;
ALTER SYSTEM SET sga_target = 20G SCOPE=SPFILE;
ALTER SYSTEM SET pga_aggregate_target = 6G SCOPE=SPFILE;
ALTER SYSTEM SET processes = 1500 SCOPE=SPFILE;
ALTER SYSTEM SET parallel_max_servers = 16 SCOPE=SPFILE;
ALTER SYSTEM SET gc_server_processes = 4 SCOPE=SPFILE;
```

**实例区分参数**（各节点不同）：
```sql
-- rac1
ALTER SYSTEM SET instance_number = 1 SCOPE=SPFILE;
ALTER SYSTEM SET thread = 1 SCOPE=SPFILE;
ALTER SYSTEM SET local_listener = '(ADDRESS=(PROTOCOL=TCP)(HOST=10.0.0.11)(PORT=1521))' SCOPE=SPFILE;

-- rac2
ALTER SYSTEM SET instance_number = 2 SCOPE=SPFILE;
ALTER SYSTEM SET thread = 2 SCOPE=SPFILE;
ALTER SYSTEM SET local_listener = '(ADDRESS=(PROTOCOL=TCP)(HOST=10.0.0.12)(PORT=1521))' SCOPE=SPFILE;
```

### 启动

```bash
# 启动 GI
crsctl start crs
# 检查
crsctl stat res -t

# 启动数据库
srvctl start database -d ORCL
srvctl status database -d ORCL
```

### 验证

```bash
sqlplus sys as sysdba <<< "SELECT instance_name, host_name, status FROM gv\$instance;"
# RAC 应返回两行
```

### 说明

RAC 部署依赖 ASM、共享存储（SAN/NFS）、DNS（SCAN），建议使用 Oracle 官方 `crsctl` / `srvctl` 管理，不适合 Docker Compose 方式部署。

---

## 5. 运维速查

```sql
-- 启动 / 停止
STARTUP;                                    -- 启动实例
SHUTDOWN IMMEDIATE;                         -- 正常关闭
STARTUP MOUNT; ALTER DATABASE OPEN;         -- 分步启动
ALTER DATABASE OPEN READ ONLY;             -- 只读模式

-- 监听
lsnrctl status
lsnrctl start / stop

-- 实例状态
SELECT instance_name, status FROM v$instance;
SELECT name, open_mode FROM v$pdbs;

-- 会话
SELECT sid, serial#, username, status, sql_id, event
FROM v$session WHERE username IS NOT NULL;
ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;

-- 表空间
SELECT tablespace_name, ROUND(used_percent, 2) FROM dba_tablespace_usage_metrics
ORDER BY used_percent DESC;

-- 锁
SELECT blocking_session, sid, serial#, event, seconds_in_wait
FROM v$session WHERE blocking_session IS NOT NULL;

-- Top 等待事件
SELECT event, total_waits, time_waited_micro
FROM v$system_event WHERE wait_class <> 'Idle'
ORDER BY time_waited_micro DESC FETCH FIRST 10 ROWS ONLY;

-- 慢 SQL
SELECT sql_id, ROUND(elapsed_time/1000000, 2) sec, executions,
  ROUND(elapsed_time/NULLIF(executions,0)/1000000, 4) avg_sec
FROM v$sql WHERE executions > 0
ORDER BY elapsed_time DESC FETCH FIRST 10 ROWS ONLY;
```

**RMAN 备份**：
```bash
rman target /
RMAN> BACKUP DATABASE PLUS ARCHIVELOG DELETE INPUT;
RMAN> VALIDATE BACKUPSET;
RMAN> DELETE ARCHIVELOG ALL COMPLETED BEFORE 'SYSDATE-7';
```

---

## 6. 常见故障

### 故障 1：ORA-00018 最大会话数超限

```sql
SELECT count(*), username FROM v$session GROUP BY username ORDER BY 1 DESC;
ALTER SYSTEM SET processes = 800 SCOPE=SPFILE;  -- 需重启
```

### 故障 2：表空间满 ORA-01653

```sql
SELECT tablespace_name, used_percent FROM dba_tablespace_usage_metrics;
ALTER TABLESPACE users ADD DATAFILE '/opt/oracle/oradata/users02.dbf' SIZE 5G AUTOEXTEND ON NEXT 500M MAXSIZE 30G;
```

### 故障 3：归档日志满 ORA-00257

```bash
rman target /
RMAN> DELETE ARCHIVELOG ALL COMPLETED BEFORE 'SYSDATE-7';
```

### 故障 4：RAC 节点驱逐

排查方向：检查私有网络心跳 → 查看 `$GRID_HOME/log/<hostname>/cssd/ocssd.log` → 调整 `misscount` / `disktimeout`

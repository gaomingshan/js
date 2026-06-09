# PostgreSQL 部署指南

> 版本：16 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|---------|---------|------|
| 单机 | 2C 4G | 4C 8G | 100G SSD |
| 流复制主从 | 2C 4G × 3 | 4C 8G × 3 | 100G SSD × 3 |
| Patroni 高可用 | 4C 8G × 3 + etcd | 8C 16G × 3 + etcd | 500G SSD × 3 |

---

## 2. 裸机安装（通用）

以下安装过程在所有节点执行一次。

```bash
# CentOS
yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm
yum install -y postgresql16-server postgresql16-contrib

# Ubuntu
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -q -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update && apt install -y postgresql-16 postgresql-contrib-16

# 创建数据目录
mkdir -p /data/pg/{data,wal,archive,log}
chown -R postgres:postgres /data/pg
```

---

## 3. 单机部署

**适用场景**：开发测试、低负载

### 配置文件 `/data/pg/data/postgresql.conf`

```bash
su - postgres
/usr/pgsql-16/bin/initdb -D /data/pg/data
cat > /data/pg/data/postgresql.conf << 'EOF'
listen_addresses = '*'
port = 5432
max_connections = 100
superuser_reserved_connections = 3

# Memory
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 16MB
maintenance_work_mem = 256MB
huge_pages = try

# WAL
wal_level = replica
max_wal_size = 1GB
min_wal_size = 512MB
wal_buffers = 16MB
wal_compression = lz4

# Checkpoint
checkpoint_timeout = 10min
checkpoint_completion_target = 0.9

# Planner
random_page_cost = 1.1
effective_io_concurrency = 200
max_parallel_workers_per_gather = 2

# Autovacuum
autovacuum = ON
autovacuum_max_workers = 2
autovacuum_naptime = 30s

# Log
logging_collector = ON
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_min_duration_statement = 1000
log_lock_waits = ON
log_checkpoints = ON
log_autovacuum_min_duration = 1000

# Security
ssl = on
password_encryption = scram-sha-256
EOF
```

### `pg_hba.conf`

```bash
cat > /data/pg/data/pg_hba.conf << 'EOF'
# TYPE  DATABASE  USER      ADDRESS         METHOD
local   all       postgres                  peer
local   all       all                       scram-sha-256
host    all       all       127.0.0.1/32    scram-sha-256
host    all       all       0.0.0.0/0       scram-sha-256
host    replication all     0.0.0.0/0       scram-sha-256
EOF
```

### 启动

```bash
systemctl start postgresql-16
systemctl enable postgresql-16

# 设置密码
su - postgres -c "psql -c \"ALTER USER postgres PASSWORD 'Postgres123!@#';\""
```

### 验证

```bash
su - postgres -c "psql -c 'SELECT version();'"
psql -h 127.0.0.1 -U postgres -d postgres -c "\l"
```

### Docker Compose

```yaml
services:
  postgres:
    image: postgres:16
    container_name: postgres
    ports: ["5432:5432"]
    environment:
      POSTGRES_PASSWORD: Postgres123!@#
      POSTGRES_DB: appdb
    volumes:
      - pg-data:/var/lib/postgresql/data
    restart: unless-stopped
volumes:
  pg-data:
```

---

## 4. 流复制主从部署

**适用场景**：QPS 5-10 万，高可用基础

### 节点规划

| 主机名 | IP | 角色 |
|--------|-----|------|
| pg-primary | 192.168.1.10 | Primary |
| pg-standby1 | 192.168.1.11 | Standby |
| pg-standby2 | 192.168.1.12 | Standby |

### Primary 配置文件

```bash
su - postgres
/usr/pgsql-16/bin/initdb -D /data/pg/data
cat > /data/pg/data/postgresql.conf << 'EOF'
listen_addresses = '*'
port = 5432
max_connections = 300
superuser_reserved_connections = 3

# Memory
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 32MB
maintenance_work_mem = 512MB
huge_pages = try

# WAL
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB
wal_buffers = 64MB
wal_compression = lz4
wal_keep_size = 1GB
wal_log_hints = on

# Replication
max_wal_senders = 10
wal_sender_timeout = 60s
max_replication_slots = 10
hot_standby = on

# Checkpoint
checkpoint_timeout = 10min
checkpoint_completion_target = 0.9

# Planner
random_page_cost = 1.1
effective_io_concurrency = 200
max_parallel_workers_per_gather = 4
max_parallel_workers = 8

# Autovacuum
autovacuum = ON
autovacuum_max_workers = 3
autovacuum_naptime = 30s

# Log
logging_collector = ON
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_min_duration_statement = 500
log_lock_waits = ON
log_checkpoints = ON

# Extensions
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.max = 10000

# Security
ssl = on
password_encryption = scram-sha-256
EOF
```

### pg_hba.conf（Primary）

```bash
cat > /data/pg/data/pg_hba.conf << 'EOF'
local   all       postgres                  peer
local   all       all                       scram-sha-256
host    all       all       127.0.0.1/32    scram-sha-256
host    all       all       0.0.0.0/0       scram-sha-256
host    replication all     192.168.1.0/24  scram-sha-256
EOF
```

### 启动 Primary

```bash
systemctl start postgresql-16

su - postgres -c "psql << 'SQL'
ALTER USER postgres PASSWORD 'Postgres123!@#';
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'ReplStr0ng!Pass';
SQL"
```

### 初始化 Standby（两台重复）

```bash
systemctl stop postgresql-16
rm -rf /data/pg/data/*
su - postgres -c "pg_basebackup -h 192.168.1.10 -U replicator -D /data/pg/data -Fp -Xs -P -R"
# -R 自动创建 standby.signal 和 primary_conninfo

# 若未自动生成，手动写入：
cat > /data/pg/data/standby.signal << 'EOF'
EOF
cat >> /data/pg/data/postgresql.conf << 'EOF'
primary_conninfo = 'host=192.168.1.10 port=5432 user=replicator password=ReplStr0ng!Pass application=pg-standby1'
primary_slot_name = 'standby1'
EOF

systemctl start postgresql-16
```

### 创建复制槽（Primary 上执行）

```sql
SELECT pg_create_physical_replication_slot('standby1');
SELECT pg_create_physical_replication_slot('standby2');
```

### 验证

```bash
# Primary
su - postgres -c "psql -c \"SELECT client_addr, state, sync_state, pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS lag FROM pg_stat_replication;\""

# Standby
su - postgres -c "psql -c \"SELECT pg_is_in_recovery(), pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();\""
```

### Docker Compose

```yaml
services:
  pg-primary:
    image: postgres:16
    container_name: pg-primary
    ports: ["5432:5432"]
    environment:
      POSTGRES_PASSWORD: Postgres123!@#
      POSTGRES_DB: appdb
    volumes:
      - primary-data:/var/lib/postgresql/data
      - ./primary.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
  pg-standby1:
    image: postgres:16
    container_name: pg-standby1
    ports: ["5433:5432"]
    environment:
      POSTGRES_PASSWORD: Postgres123!@#
      PGUSER: postgres
    volumes:
      - standby1-data:/var/lib/postgresql/data
      - ./standby.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    depends_on: [pg-primary]
  pg-standby2:
    image: postgres:16
    container_name: pg-standby2
    ports: ["5434:5432"]
    environment:
      POSTGRES_PASSWORD: Postgres123!@#
      PGUSER: postgres
    volumes:
      - standby2-data:/var/lib/postgresql/data
      - ./standby.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    depends_on: [pg-primary]
volumes:
  primary-data:  standby1-data:  standby2-data:
```

---

## 5. Patroni 高可用部署

**适用场景**：QPS 10 万+，自动故障转移，生产首选

### 节点规划

| 主机名 | IP | 角色 |
|--------|-----|------|
| etcd1 / pg-node1 | 192.168.1.10 | etcd + Patroni / PG Primary |
| etcd2 / pg-node2 | 192.168.1.11 | etcd + Patroni / PG Standby |
| etcd3 / pg-node3 | 192.168.1.12 | etcd + Patroni / PG Standby |

### 安装 etcd（三节点）

```bash
yum install -y etcd

cat > /etc/etcd/etcd.conf << 'EOF'
ETCD_NAME=etcd1
ETCD_DATA_DIR=/var/lib/etcd
ETCD_LISTEN_PEER_URLS=http://0.0.0.0:2380
ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379
ETCD_INITIAL_ADVERTISE_PEER_URLS=http://192.168.1.10:2380
ETCD_ADVERTISE_CLIENT_URLS=http://192.168.1.10:2379
ETCD_INITIAL_CLUSTER=etcd1=http://192.168.1.10:2380,etcd2=http://192.168.1.11:2380,etcd3=http://192.168.1.12:2380
ETCD_INITIAL_CLUSTER_STATE=new
ETCD_INITIAL_CLUSTER_TOKEN=pg-patroni
EOF

systemctl start etcd && systemctl enable etcd
# 验证：etcdctl member list
```

三节点需各自修改 `ETCD_NAME` 和 IP 地址。

### 安装 Patroni（三节点）

```bash
yum install -y python3-pip
pip3 install patroni[etcd] psycopg2-binary

mkdir -p /etc/patroni
```

### Patroni 配置文件 `/etc/patroni/patroni.yml`

```yaml
scope: pg-cluster
namespace: /db/
name: pg-node1

restapi:
  listen: 0.0.0.0:8008
  connect_address: 192.168.1.10:8008

etcd:
  host: 192.168.1.10:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      use_slots: true
      parameters:
        listen_addresses: '0.0.0.0'
        port: 5432
        max_connections: 500
        superuser_reserved_connections: 3
        shared_buffers: 4GB
        effective_cache_size: 12GB
        work_mem: 32MB
        maintenance_work_mem: 512MB
        wal_level: replica
        wal_log_hints: on
        max_wal_senders: 10
        max_replication_slots: 10
        wal_keep_size: 1GB
        hot_standby: on
        max_parallel_workers_per_gather: 4
        random_page_cost: 1.1
        effective_io_concurrency: 200
        autovacuum_max_workers: 3
        logging_collector: on
        log_min_duration_statement: 500
        shared_preload_libraries: 'pg_stat_statements'
  initdb:
  - encoding: UTF8
  - data-checksums
  pg_hba:
  - host all all 0.0.0.0/0 scram-sha-256
  - host replication replicator 192.168.1.0/24 scram-sha-256
  users:
    postgres:
      password: Postgres123!@#
    replicator:
      password: ReplStr0ng!Pass
        options: [replication, bypassrls]

postgresql:
  listen: 0.0.0.0:5432
  connect_address: 192.168.1.10:5432
  data_dir: /data/pg/data
  bin_dir: /usr/pgsql-16/bin
  use_unix_socket: true
  pgpass: /tmp/pgpass
  authentication:
    replication:
      username: replicator
      password: ReplStr0ng!Pass
    superuser:
      username: postgres
      password: Postgres123!@#
    rewind:
      username: replicator
      password: ReplStr0ng!Pass
  parameters:
    unix_socket_directories: '/var/run/postgresql'

tags:
  nofailover: false
  noloadbalance: false
  clonefrom: false
  nosync: false
```

三节点需修改 `name`、`connect_address`、`restapi.connect_address`。

### 启动 Patroni

```bash
systemctl stop postgresql-16 2>/dev/null || true
systemctl disable postgresql-16 2>/dev/null || true

su - postgres -c "patroni /etc/patroni/patroni.yml" &

# 建议使用 systemd 管理
cat > /etc/systemd/system/patroni.service << 'EOF'
[Unit]
Description=Patroni HA for PostgreSQL
After=etcd.service
Wants=etcd.service

[Service]
User=postgres
Group=postgres
ExecStart=/usr/local/bin/patroni /etc/patroni/patroni.yml
KillMode=process
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload && systemctl enable patroni && systemctl start patroni
```

### 验证

```bash
# Rest API
curl http://192.168.1.10:8008/cluster | jq .

# 查看成员
curl -s http://192.168.1.10:8008/cluster | jq '.members[] | {name, role, host, port, state}'

# 故障转移测试
patronictl -c /etc/patroni/patroni.yml switchover pg-cluster

# 查看 Leader
patronictl -c /etc/patroni/patroni.yml list pg-cluster
```

### Docker Compose

```yaml
services:
  etcd:
    image: bitnami/etcd:3.5
    container_name: etcd
    ports: ["2379:2379", "2380:2380"]
    environment:
      ALLOW_NONE_AUTHENTICATION: "yes"
      ETCD_NAME: etcd0
      ETCD_INITIAL_CLUSTER: etcd0=http://etcd:2380
      ETCD_INITIAL_ADVERTISE_PEER_URLS: http://etcd:2380
      ETCD_ADVERTISE_CLIENT_URLS: http://etcd:2379
      ETCD_LISTEN_CLIENT_URLS: http://0.0.0.0:2379
      ETCD_LISTEN_PEER_URLS: http://0.0.0.0:2380
    healthcheck:
      test: etcdctl endpoint health

  pg-patroni:
    image: postgres:16
    container_name: pg-patroni
    ports: ["5432:5432"]
    environment:
      PATRONI_SCOPE: pg-cluster
      PATRONI_NAME: pg-node1
      PATRONI_RESTAPI_LISTEN: 0.0.0.0:8008
      PATRONI_RESTAPI_CONNECT_ADDRESS: pg-patroni:8008
      PATRONI_ETCD_HOST: etcd:2379
      PATRONI_POSTGRESQL_LISTEN: 0.0.0.0:5432
      PATRONI_POSTGRESQL_CONNECT_ADDRESS: pg-patroni:5432
      PATRONI_POSTGRESQL_DATA_DIR: /var/lib/postgresql/data
      PATRONI_POSTGRESQL_PGPASS: /tmp/pgpass
      PATRONI_SUPERUSER_USERNAME: postgres
      PATRONI_SUPERUSER_PASSWORD: Postgres123!@#
      PATRONI_REPLICATION_USERNAME: replicator
      PATRONI_REPLICATION_PASSWORD: ReplStr0ng!Pass
    volumes:
      - pg-patroni-data:/var/lib/postgresql/data
    depends_on: [etcd]

volumes:
  pg-patroni-data:
```

实际多节点部署需启动多个 Patroni 容器分别指定不同的 `PATRONI_NAME`。

---

## 6. 运维速查

| 操作 | 命令 |
|------|------|
| 启动 | `systemctl start postgresql-16` |
| 停止 | `systemctl stop postgresql-16` |
| 重启 | `systemctl restart postgresql-16` |
| 重载配置 | `systemctl reload postgresql-16` |
| 连接 | `psql -h 127.0.0.1 -U postgres -d postgres` |
| 热更新 | `SELECT pg_reload_conf();` |
| 查看连接 | `SELECT pid, usename, state, query FROM pg_stat_activity;` |
| 取消查询 | `SELECT pg_cancel_backend(pid);` |
| 断开连接 | `SELECT pg_terminate_backend(pid);` |
| 复制状态 | `SELECT * FROM pg_stat_replication;` |
| Patroni 列表 | `patronictl list pg-cluster` |
| Patroni 切换 | `patronictl switchover pg-cluster` |

| 告警指标 | 阈值 | 查询 |
|----------|------|------|
| 缓存命中率 | < 99% | `blks_hit / (blks_hit + blks_read)` from `pg_stat_database` |
| 复制延迟 | > 10MB | `pg_wal_lsn_diff(sent_lsn, replay_lsn)` |
| 活跃连接 | > 80% | `count(*) WHERE state='active' / max_connections` |
| 表膨胀率 | > 10% | `n_dead_tup / (n_live_tup + n_dead_tup)` |
| 长事务 | > 5min | `now() - xact_start` |
| 死锁数 | > 0 | `deadlocks` from `pg_stat_database` |

---

## 7. 常见故障

### 故障 1：连接数耗尽

`FATAL: sorry, too many clients already`

**排查**：
```sql
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
SELECT pid, now()-query_start AS idle_time FROM pg_stat_activity WHERE state='idle' ORDER BY idle_time DESC;
```

**解决**：终止空闲连接 → 接入 PgBouncer 连接池。

### 故障 2：表膨胀

查询变慢，磁盘持续增长

**排查**：
```sql
SELECT schemaname, relname, n_dead_tup, n_live_tup,
  ROUND(n_dead_tup*100.0/NULLIF(n_live_tup+n_dead_tup,0),2) AS bloat_pct
FROM pg_stat_user_tables ORDER BY n_dead_tup DESC;
```

**解决**：终止长事务 → `VACUUM VERBOSE ANALYZE table_name;` → 严重膨胀用 `pg_repack`。

### 故障 3：复制延迟

**排查**：
```sql
-- Primary
SELECT client_addr, state, pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes FROM pg_stat_replication;
-- Standby
SELECT now() - pg_last_xact_replay_timestamp() AS replay_delay;
```

**解决**：从库硬件对齐主库 → 调整 `max_wal_size` / `wal_keep_size` → 检查复制槽。

### 故障 4：锁等待

查询阻塞

**排查**：
```sql
SELECT blocked.pid AS blocked_pid, blocker.pid AS blocker_pid,
  blocked.query AS blocked_query, blocker.query AS blocker_query
FROM pg_locks blocked
JOIN pg_locks blocker ON blocker.locktype = blocked.locktype
  AND blocker.database IS NOT DISTINCT FROM blocked.database
  AND blocker.relation IS NOT DISTINCT FROM blocked.relation
  AND blocker.pid != blocked.pid AND NOT blocker.granted
WHERE NOT blocked.granted;
```

**解决**：`SELECT pg_terminate_backend(blocker_pid);` → 设置 `lock_timeout`。

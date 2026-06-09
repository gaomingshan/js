# MySQL 部署指南

> 版本：8.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|---------|---------|------|
| 单机 | 2C 4G | 4C 8G | 100G SSD |
| 主从 | 2C 4G × 3 | 4C 8G × 3 | 100G SSD × 3 |
| MGR 集群 | 4C 8G × 3 | 8C 16G × 3 | 500G SSD × 3 |

---

## 2. 裸机安装（通用）

以下安装过程在所有节点执行一次。

```bash
# CentOS
rpm -Uvh https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
yum install -y mysql-community-server

# Ubuntu
wget -q https://repo.mysql.com/mysql-apt-config_0.8.29-1_all.deb
dpkg -i mysql-apt-config_0.8.29-1_all.deb
apt update && apt install -y mysql-server

# 创建数据/日志目录
mkdir -p /data/mysql/{data,binlog,relaylog,log,tmp}
mkdir -p /data/mysql/{undo,ibdata}
chown -R mysql:mysql /data/mysql
```

---

## 3. 单机部署

**适用场景**：开发测试、低负载

### 配置文件 `/etc/my.cnf`

```bash
cat > /etc/my.cnf << 'EOF'
[mysqld]
server-id = 1
port = 3306
user = mysql
basedir = /usr
datadir = /data/mysql/data
socket = /tmp/mysql.sock
pid-file = /var/run/mysqld/mysqld.pid
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default_authentication_plugin = caching_sha2_password
skip-name-resolve
lower_case_table_names = 1

# Memory
innodb_buffer_pool_size = 4G
innodb_buffer_pool_instances = 4
innodb_log_buffer_size = 32M
key_buffer_size = 64M
tmp_table_size = 64M
max_heap_table_size = 64M

# Connection
max_connections = 200
thread_cache_size = 32
wait_timeout = 28800
interactive_timeout = 28800
max_connect_errors = 1000
sort_buffer_size = 2M
join_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 4M

# InnoDB
innodb_flush_log_at_trx_commit = 2
sync_binlog = 100
innodb_flush_method = O_DIRECT
innodb_file_per_table = ON
innodb_io_capacity = 1000
innodb_io_capacity_max = 2000
innodb_lock_wait_timeout = 30

# Redo
innodb_log_file_size = 512M

# Binlog
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
max-binlog-size = 500M
binlog-expire-logs-seconds = 604800

# Slow log
slow_query_log = ON
long_query_time = 1
log_queries_not_using_indexes = ON
slow_query_log_file = /data/mysql/log/slow.log

# Error log
log_error = /data/mysql/log/error.log

# Secure
local_infile = OFF

sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

[client]
default-character-set = utf8mb4
socket = /tmp/mysql.sock
EOF
```

### 启动

```bash
mysqld --initialize-insecure --user=mysql --datadir=/data/mysql/data
chown -R mysql:mysql /data/mysql
systemctl start mysqld
systemctl enable mysqld

# 设置 root 密码
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Root123!@#'; FLUSH PRIVILEGES;"
```

### 验证

```bash
mysql -u root -p'Root123!@#' -h 127.0.0.1 -P 3306 -e "SHOW DATABASES; SELECT VERSION();"
```

### Docker Compose

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    ports: ["3306:3306"]
    environment:
      MYSQL_ROOT_PASSWORD: Root123!@#
      MYSQL_DATABASE: appdb
    volumes:
      - mysql-data:/var/lib/mysql
      - ./my.cnf:/etc/mysql/conf.d/my.cnf
    restart: unless-stopped
volumes:
  mysql-data:
```

---

## 4. 主从复制部署

**适用场景**：QPS 5-10 万，高可用基础

### 节点规划

| 主机名 | IP | 角色 |
|--------|-----|------|
| db-master | 192.168.1.10 | Master |
| db-slave1 | 192.168.1.11 | Slave |
| db-slave2 | 192.168.1.12 | Slave |

### Master 配置文件 `/etc/my.cnf`

```bash
cat > /etc/my.cnf << 'EOF'
[mysqld]
server-id = 1
port = 3306
user = mysql
basedir = /usr
datadir = /data/mysql/data
socket = /tmp/mysql.sock
pid-file = /var/run/mysqld/mysqld.pid
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default_authentication_plugin = caching_sha2_password
skip-name-resolve

# Memory
innodb_buffer_pool_size = 4G
innodb_buffer_pool_instances = 4
innodb_log_buffer_size = 32M
key_buffer_size = 64M

# Connection
max_connections = 500
thread_cache_size = 64
wait_timeout = 28800
sort_buffer_size = 4M
join_buffer_size = 4M
read_buffer_size = 2M
read_rnd_buffer_size = 8M

# InnoDB
innodb_flush_log_at_trx_commit = 1
sync_binlog = 1
innodb_flush_method = O_DIRECT
innodb_file_per_table = ON
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000
innodb_lock_wait_timeout = 30
innodb_log_file_size = 1G

# Binlog
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
max-binlog-size = 500M
binlog-expire-logs-seconds = 604800
binlog-cache-size = 1M

# Semi-sync
plugin-load-add = "rpl_semi_sync_master=semisync_master.so"
rpl_semi_sync_master_enabled = 1
rpl_semi_sync_master_timeout = 1000

# Slow log
slow_query_log = ON
long_query_time = 1
slow_query_log_file = /data/mysql/log/slow.log
log_error = /data/mysql/log/error.log
local_infile = OFF

sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
EOF
```

### Slave 配置文件 `/etc/my.cnf`

```bash
cat > /etc/my.cnf << 'EOF'
[mysqld]
server-id = 2
port = 3306
user = mysql
basedir = /usr
datadir = /data/mysql/data
socket = /tmp/mysql.sock
pid-file = /var/run/mysqld/mysqld.pid
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
skip-name-resolve
read-only = ON
super-read-only = ON

# Memory
innodb_buffer_pool_size = 4G
innodb_buffer_pool_instances = 4
innodb_log_buffer_size = 32M
key_buffer_size = 64M

# Connection
max_connections = 500
thread_cache_size = 64
wait_timeout = 28800
sort_buffer_size = 8M
join_buffer_size = 8M
read_buffer_size = 2M
read_rnd_buffer_size = 8M

# InnoDB
innodb_flush_log_at_trx_commit = 2
sync_binlog = 100
innodb_flush_method = O_DIRECT
innodb_file_per_table = ON
innodb_io_capacity = 2000
innodb_lock_wait_timeout = 30
innodb_log_file_size = 1G

# Binlog
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
max-binlog-size = 500M
binlog-expire-logs-seconds = 604800

# Relay log
relay-log = relay-bin
relay-log-recovery = ON
max-relay-log-size = 500M

# Multi-threaded slave
slave_parallel_type = LOGICAL_CLOCK
slave_parallel_workers = 8
slave_preserve_commit_order = ON

# Semi-sync
plugin-load-add = "rpl_semi_sync_slave=semisync_slave.so"
rpl_semi_sync_slave_enabled = 1

# Slow log
slow_query_log = ON
long_query_time = 1
slow_query_log_file = /data/mysql/log/slow.log
log_error = /data/mysql/log/error.log
local_infile = OFF

sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
EOF
```

### 启动 Master

```bash
mysqld --initialize-insecure --user=mysql --datadir=/data/mysql/data
chown -R mysql:mysql /data/mysql
systemctl start mysqld

mysql -u root << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Root123!@#';
CREATE USER 'repl'@'%' IDENTIFIED BY 'ReplStr0ng!Pass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;
EOF
```

### 启动 Slave（两台重复执行）

```bash
mysqld --initialize-insecure --user=mysql --datadir=/data/mysql/data
chown -R mysql:mysql /data/mysql
systemctl start mysqld

# 修改 server-id：slave1=2, slave2=3
mysql -u root -p'Root123!@#' << 'EOF'
CHANGE MASTER TO
  MASTER_HOST='192.168.1.10',
  MASTER_PORT=3306,
  MASTER_USER='repl',
  MASTER_PASSWORD='ReplStr0ng!Pass',
  MASTER_AUTO_POSITION=1;
START SLAVE;
EOF
```

### 验证

```bash
# Master
mysql -u root -p'Root123!@#' -e "SHOW MASTER STATUS;"

# Slave
mysql -u root -p'Root123!@#' -e "SHOW SLAVE STATUS\G" | grep -E "Slave_IO_Running|Slave_SQL_Running|Seconds_Behind_Master"
```

### Docker Compose

```yaml
services:
  mysql-master:
    image: mysql:8.0
    container_name: mysql-master
    ports: ["3306:3306"]
    environment:
      MYSQL_ROOT_PASSWORD: Root123!@#
    volumes:
      - master-data:/var/lib/mysql
      - ./master.cnf:/etc/mysql/conf.d/my.cnf
    healthcheck:
      test: mysqladmin ping -uroot -pRoot123!@#
      interval: 5s
  mysql-slave1:
    image: mysql:8.0
    container_name: mysql-slave1
    ports: ["3307:3306"]
    environment:
      MYSQL_ROOT_PASSWORD: Root123!@#
    volumes:
      - slave1-data:/var/lib/mysql
      - ./slave.cnf:/etc/mysql/conf.d/my.cnf
    depends_on: [mysql-master]
  mysql-slave2:
    image: mysql:8.0
    container_name: mysql-slave2
    ports: ["3308:3306"]
    environment:
      MYSQL_ROOT_PASSWORD: Root123!@#
    volumes:
      - slave2-data:/var/lib/mysql
      - ./slave.cnf:/etc/mysql/conf.d/my.cnf
    depends_on: [mysql-master]
volumes:
  master-data:  slave1-data:  slave2-data:
```

---

## 5. MGR 集群部署

**适用场景**：QPS 10 万+，水平扩展，自动故障转移

### 节点规划

| 主机名 | IP | 角色 | 端口 |
|--------|-----|------|------|
| mgr-node1 | 192.168.1.10 | PRIMARY | 3306 / 33061 |
| mgr-node2 | 192.168.1.11 | SECONDARY | 3306 / 33061 |
| mgr-node3 | 192.168.1.12 | SECONDARY | 3306 / 33061 |

### 配置文件 `/etc/my.cnf`（三节点一致）

```bash
cat > /etc/my.cnf << 'EOF'
[mysqld]
server-id = 1
port = 3306
user = mysql
basedir = /usr
datadir = /data/mysql/data
socket = /tmp/mysql.sock
pid-file = /var/run/mysqld/mysqld.pid
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
skip-name-resolve

# Memory
innodb_buffer_pool_size = 8G
innodb_buffer_pool_instances = 8
innodb_log_buffer_size = 64M
key_buffer_size = 64M

# Connection
max_connections = 500
thread_cache_size = 64
sort_buffer_size = 4M
join_buffer_size = 4M

# InnoDB
innodb_flush_log_at_trx_commit = 1
sync_binlog = 1
innodb_flush_method = O_DIRECT
innodb_file_per_table = ON
innodb_io_capacity = 5000
innodb_io_capacity_max = 10000
innodb_lock_wait_timeout = 30
innodb_log_file_size = 2G

# Binlog
log-bin = mysql-bin
binlog-format = ROW
gtid-mode = ON
enforce-gtid-consistency = ON
max-binlog-size = 1G
binlog-expire-logs-seconds = 604800

# MGR
plugin-load-add = group_replication.so
group_replication_group_name = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
group_replication_start_on_boot = OFF
group_replication_local_address = "192.168.1.10:33061"
group_replication_group_seeds = "192.168.1.10:33061,192.168.1.11:33061,192.168.1.12:33061"
group_replication_bootstrap_group = OFF
group_replication_recovery_get_public_key = ON

# Slow log
slow_query_log = ON
long_query_time = 1
slow_query_log_file = /data/mysql/log/slow.log
log_error = /data/mysql/log/error.log
local_infile = OFF

sql_mode = STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
EOF
```

⚠️ 三节点 `server-id` 和 `group_replication_local_address` 的 IP 需各自修改为对应节点。

### 启动引导节点（node1）

```bash
mysqld --initialize-insecure --user=mysql --datadir=/data/mysql/data
chown -R mysql:mysql /data/mysql
systemctl start mysqld

mysql -u root << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Root123!@#';
SET SQL_LOG_BIN=0;
CREATE USER 'repl'@'%' IDENTIFIED BY 'ReplStr0ng!Pass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
GRANT BACKUP_ADMIN ON *.* TO 'repl'@'%';
GRANT GROUP_REPLICATION_STREAM ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;
SET SQL_LOG_BIN=1;

CHANGE REPLICATION SOURCE TO
  SOURCE_USER='repl',
  SOURCE_PASSWORD='ReplStr0ng!Pass'
  FOR CHANNEL 'group_replication_recovery';

SET GLOBAL group_replication_bootstrap_group = ON;
START GROUP_REPLICATION;
SET GLOBAL group_replication_bootstrap_group = OFF;
SELECT * FROM performance_schema.replication_group_members;
EOF
```

### 加入其余节点（node2, node3）

```bash
mysqld --initialize-insecure --user=mysql --datadir=/data/mysql/data
chown -R mysql:mysql /data/mysql
systemctl start mysqld

mysql -u root << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Root123!@#';
SET SQL_LOG_BIN=0;
CREATE USER 'repl'@'%' IDENTIFIED BY 'ReplStr0ng!Pass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
GRANT BACKUP_ADMIN ON *.* TO 'repl'@'%';
GRANT GROUP_REPLICATION_STREAM ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;
SET SQL_LOG_BIN=1;

CHANGE REPLICATION SOURCE TO
  SOURCE_USER='repl',
  SOURCE_PASSWORD='ReplStr0ng!Pass'
  FOR CHANNEL 'group_replication_recovery';

START GROUP_REPLICATION;
SELECT * FROM performance_schema.replication_group_members;
EOF
```

### 验证

```bash
# 任意节点查看成员状态
mysql -u root -p'Root123!@#' -e "SELECT * FROM performance_schema.replication_group_members\G"

# 查看组复制状态
mysql -u root -p'Root123!@#' -e "SHOW STATUS LIKE 'group_replication_primary_member';"
```

### Docker Compose

```yaml
services:
  mgr-node1:
    image: mysql:8.0
    container_name: mgr-node1
    hostname: mgr-node1
    ports: ["3306:3306", "33061:33061"]
    environment:
      MYSQL_ROOT_PASSWORD: Root123!@#
      MYSQL_INITDB_SKIP_TZINFO: "yes"
    volumes:
      - mgr1-data:/var/lib/mysql
      - ./mgr.cnf:/etc/mysql/conf.d/my.cnf
      - ./init-mgr-node1.sql:/docker-entrypoint-initdb.d/init.sql
    cap_add: [NET_ADMIN]
  mgr-node2:
    image: mysql:8.0
    container_name: mgr-node2
    hostname: mgr-node2
    ports: ["3307:3306", "33062:33061"]
    environment:
      MYSQL_ROOT_PASSWORD: Root123!@#
    volumes:
      - mgr2-data:/var/lib/mysql
      - ./mgr.cnf:/etc/mysql/conf.d/my.cnf
      - ./init-mgr-node2.sql:/docker-entrypoint-initdb.d/init.sql
    cap_add: [NET_ADMIN]
  mgr-node3:
    image: mysql:8.0
    container_name: mgr-node3
    hostname: mgr-node3
    ports: ["3308:3306", "33063:33061"]
    environment:
      MYSQL_ROOT_PASSWORD: Root123!@#
    volumes:
      - mgr3-data:/var/lib/mysql
      - ./mgr.cnf:/etc/mysql/conf.d/my.cnf
      - ./init-mgr-node3.sql:/docker-entrypoint-initdb.d/init.sql
    cap_add: [NET_ADMIN]
volumes:
  mgr1-data:  mgr2-data:  mgr3-data:
```

---

## 6. 运维速查

| 操作 | 命令 |
|------|------|
| 启动 | `systemctl start mysqld` |
| 停止 | `systemctl stop mysqld` |
| 重启 | `systemctl restart mysqld` |
| 状态 | `systemctl status mysqld` |
| 连接 | `mysql -u root -p -h 127.0.0.1 -P 3306` |
| 热更新 | `SET PERSIST <var>=<val>;` |
| 查看连接 | `SHOW FULL PROCESSLIST;` |
| 杀连接 | `KILL <id>;` |
| Master 状态 | `SHOW MASTER STATUS;` |
| Slave 状态 | `SHOW SLAVE STATUS\G` |
| MGR 成员 | `SELECT * FROM performance_schema.replication_group_members;` |

| 告警指标 | 阈值 | 查询 |
|----------|------|------|
| 连接数使用率 | > 80% | `Threads_connected / max_connections` |
| 缓冲池命中率 | < 95% | `1 - Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests` |
| 复制延迟 | > 30s | `Seconds_Behind_Master` |
| 慢查询 | 持续增长 | `SHOW STATUS LIKE 'Slow_queries'` |
| QPS/TPS | > 80% 容量 | `Queries / Uptime` |

---

## 7. 常见故障

### 故障 1：连接数耗尽

`ERROR 1040 (HY000): Too many connections`

**排查**：
```sql
SHOW FULL PROCESSLIST;
SELECT USER, HOST, COUNT(*) FROM information_schema.PROCESSLIST GROUP BY USER, HOST;
```

**解决**：
```sql
SET GLOBAL max_connections = 600;
-- 排查慢查询或连接泄漏
```

### 故障 2：主从延迟

`Seconds_Behind_Master` 持续增长

**排查**：
```sql
SHOW SLAVE STATUS\G
-- 看 Exec_Master_Log_Pos vs Read_Master_Log_Pos
```

**解决**：开启多线程复制或升级从库硬件。

### 故障 3：锁等待超时

`ERROR 1205 (HY000): Lock wait timeout exceeded`

**排查**：
```sql
SELECT * FROM performance_schema.data_lock_waits;
```

**解决**：`KILL <blocking_thread>;` → 缩短事务范围。

### 故障 4：磁盘空间不足

**排查**：
```bash
df -h /data/mysql
# 查看大表
SELECT table_schema, table_name, ROUND(data_length/1024/1024/1024, 2) AS data_gb FROM information_schema.TABLES ORDER BY data_length DESC LIMIT 20;
```

**解决**：
```sql
PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 7 DAY);
ALTER TABLE large_table ENGINE=InnoDB;
```

# 日常运维命令速查

这部分没有原理，不讲机制，只有你**可能需要百度**的那些命令。

---

## MySQL

### 服务启停

```bash
# systemd (Linux)
systemctl start mysqld
systemctl stop mysqld
systemctl restart mysqld
systemctl status mysqld

# 直接 (Windows)
net start MySQL80
net stop MySQL80

# 命令行连接/关闭
mysqladmin -u root -p shutdown
```

### 登录

```bash
mysql -h 127.0.0.1 -u root -p
mysql -h 127.0.0.1 -u root -p mydb  # 直接指定数据库

# 带端口
mysql -h 127.0.0.1 -P 3306 -u root -p
```

### 用户管理

```sql
-- 创建用户
CREATE USER 'app_user'@'%' IDENTIFIED BY 'your_password';

-- 授权
GRANT SELECT, INSERT, UPDATE, DELETE ON mydb.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON mydb.* TO 'app_user'@'%';

-- 刷新权限（修改权限后执行）
FLUSH PRIVILEGES;

-- 查看用户权限
SHOW GRANTS FOR 'app_user'@'%';

-- 修改密码
ALTER USER 'app_user'@'%' IDENTIFIED BY 'new_password';

-- 删除用户
DROP USER 'app_user'@'%';

-- 查看所有用户
SELECT user, host FROM mysql.user;
```

### 日常排障

```sql
-- 查看当前连接（谁在干什么）
SHOW FULL PROCESSLIST;
-- Kill 某条连接
KILL 12345;  -- 12345 是 Thread ID

-- 查看事务和锁
SHOW ENGINE INNODB STATUS\G

-- 查看死锁信息（8.0 更方便）
SELECT * FROM performance_schema.data_locks;
SELECT * FROM performance_schema.data_lock_waits;

-- 慢查询相关
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过 1 秒的记录

-- 查看正在跑的查询（比 PROCESSLIST 更详细）
SELECT * FROM sys.session WHERE conn_id != CONNECTION_ID();

-- 查看表大小
SELECT 
    table_name,
    ROUND(data_length / 1024 / 1024) AS data_mb,
    ROUND(index_length / 1024 / 1024) AS index_mb
FROM information_schema.tables
WHERE table_schema = 'mydb'
ORDER BY data_length DESC;

-- 执行计划
EXPLAIN SELECT * FROM users WHERE id = 1;
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE id = 1;  -- 详细 JSON 格式
```

### Binlog 相关

```sql
-- 查看 binlog 是否开启
SHOW VARIABLES LIKE 'log_bin';

-- 查看当前 binlog 文件
SHOW MASTER STATUS;

-- 查看所有 binlog 文件
SHOW BINARY LOGS;

-- 查看 binlog 内容
SHOW BINLOG EVENTS IN 'mysql-bin.000001' LIMIT 10;

-- 用 mysqlbinlog 解析（命令行）
-- mysqlbinlog /var/lib/mysql/mysql-bin.000001
```

### 数据库导出/导入

```bash
# 导出单库
mysqldump -u root -p mydb > mydb.sql

# 导出单表
mysqldump -u root -p mydb users > users.sql

# 导出结构（不含数据）
mysqldump -u root -p --no-data mydb > schema.sql

# 导入
mysql -u root -p mydb < mydb.sql
```

---

## PostgreSQL

### 服务启停

```bash
# systemd
systemctl start postgresql
systemctl stop postgresql
systemctl restart postgresql

# pg_ctl (需要指定数据目录)
pg_ctl -D /var/lib/postgresql/data start
pg_ctl -D /var/lib/postgresql/data stop

# 检查状态
pg_isready
```

### 登录

```bash
# 默认系统用户 postgres
sudo -u postgres psql

# 指定主机和用户
psql -h 127.0.0.1 -U myuser -d mydb

# 带端口
psql -h 127.0.0.1 -p 5432 -U myuser -d mydb
```

### 用户和角色管理

```sql
-- 创建角色（可登录）
CREATE ROLE app_user WITH LOGIN PASSWORD 'your_password';

-- 创建数据库
CREATE DATABASE mydb OWNER app_user;

-- 授权（所有权限）
GRANT ALL PRIVILEGES ON DATABASE mydb TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 查看角色
\du

-- 修改密码
ALTER ROLE app_user WITH PASSWORD 'new_password';

-- 删除角色
DROP ROLE app_user;
```

### 日常排障

```sql
-- 查看当前连接
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- 查看等待事件
SELECT pid, wait_event_type, wait_event, query
FROM pg_stat_activity
WHERE wait_event IS NOT NULL;

-- Kill 连接
SELECT pg_terminate_backend(12345);  -- 12345 是 pid

-- 查看表大小
SELECT
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- 查看索引大小
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- 查看慢查询
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 需要先安装 pg_stat_statements 扩展

-- 手动收集统计信息
ANALYZE my_table;

-- 执行计划
EXPLAIN SELECT * FROM users WHERE id = 1;
EXPLAIN ANALYZE SELECT * FROM users WHERE id = 1;  -- 实际执行并返回统计
```

### 备份恢复

```bash
# 导出单库
pg_dump -U myuser mydb > mydb.sql

# 导出单表
pg_dump -U myuser -t users mydb > users.sql

# 导出结构（不含数据）
pg_dump -U myuser --schema-only mydb > schema.sql

# 导入
psql -U myuser mydb < mydb.sql

# pg_dump 也支持自定义格式（压缩、并行）
pg_dump -U myuser -Fc mydb > mydb.dump
pg_restore -U myuser -d mydb mydb.dump
```

---

## Oracle

### 服务启停

```sql
-- 以 sysdba 身份登录
sqlplus / as sysdba

-- 启动
SQL> startup;

-- 停止
SQL> shutdown immediate;  -- 正常关闭
SQL> shutdown abort;      -- 强制关闭（类似断电），重启需要恢复

-- 启动监听
-- lsnrctl start

-- 停止监听
-- lsnrctl stop
```

### 登录

```bash
# 本机 SYSDBA
sqlplus / as sysdba

# 远程
sqlplus username/password@host:1521/servicename

# 或使用 tnsnames.ora
sqlplus username/password@tns_alias
```

### 用户管理

```sql
-- 创建用户
CREATE USER app_user IDENTIFIED BY your_password;

-- 授权
GRANT CONNECT, RESOURCE TO app_user;
GRANT CREATE SESSION TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON mytable TO app_user;

-- 查看用户权限
SELECT * FROM user_sys_privs;
SELECT * FROM user_tab_privs;

-- 修改密码
ALTER USER app_user IDENTIFIED BY new_password;

-- 解锁用户（多次失败后被锁）
ALTER USER app_user ACCOUNT UNLOCK;

-- 删除用户
DROP USER app_user CASCADE;
```

### 日常排障

```sql
-- 查看当前会话
SELECT sid, serial#, username, status, machine
FROM v$session
WHERE username IS NOT NULL;

-- 查看执行的 SQL
SELECT sid, sql_text
FROM v$session s, v$sql q
WHERE s.sql_id = q.sql_id;

-- Kill 会话
ALTER SYSTEM KILL SESSION 'sid,serial#';

-- 查看锁等待
SELECT
    blocking_session,
    sid,
    serial#,
    wait_class,
    seconds_in_wait
FROM v$session
WHERE blocking_session IS NOT NULL;

-- 表空间使用
SELECT
    tablespace_name,
    ROUND(used_space * 8 / 1024) AS used_mb,
    ROUND(tablespace_size * 8 / 1024) AS total_mb
FROM dba_tablespace_usage_metrics;

-- 查看表大小
SELECT
    segment_name,
    ROUND(bytes / 1024 / 1024) AS size_mb
FROM user_segments
WHERE segment_type = 'TABLE'
ORDER BY bytes DESC;

-- AWR 报告（分析性能）
-- @?/rdbms/admin/awrrpt.sql

-- 执行计划
EXPLAIN PLAN FOR SELECT * FROM users WHERE id = 1;
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

---

## 快速参考

### 连接命令

| 数据库 | 命令 |
|--------|------|
| MySQL | `mysql -h host -u user -p` |
| PostgreSQL | `psql -h host -U user -d dbname` |
| Oracle | `sqlplus user/pass@host:port/sid` |

### 查看当前所有连接

| 数据库 | 命令 |
|--------|------|
| MySQL | `SHOW FULL PROCESSLIST;` |
| PostgreSQL | `SELECT * FROM pg_stat_activity;` |
| Oracle | `SELECT sid,serial#,username,status FROM v$session;` |

### 查看锁/死锁

| 数据库 | 命令 |
|--------|------|
| MySQL | `SHOW ENGINE INNODB STATUS\G` |
| PostgreSQL | `SELECT * FROM pg_locks;` |
| Oracle | `SELECT blocking_session, sid FROM v$session WHERE blocking_session IS NOT NULL;` |

### 执行计划

| 数据库 | 命令 |
|--------|------|
| MySQL | `EXPLAIN SELECT ...;` |
| PostgreSQL | `EXPLAIN ANALYZE SELECT ...;` |
| Oracle | `EXPLAIN PLAN FOR SELECT ...;` → `SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);` |

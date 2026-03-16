# 表空间与存储管理

## 概述

表空间（Tablespace）是数据库物理存储的逻辑抽象，管理着数据文件的分配和使用。理解表空间和存储管理对于优化数据库性能、规划存储容量、实现数据隔离至关重要。

**核心概念**：
- **表空间**：逻辑存储单元，包含一个或多个数据文件
- **数据文件**：物理存储文件，实际存储数据
- **段（Segment）**：表、索引等对象的存储单元
- **区（Extent）**：连续的数据块集合
- **块（Block/Page）**：最小的 I/O 单元

**注意**：MySQL InnoDB 不使用传统表空间概念，本章主要关注 Oracle 和 PostgreSQL。

---

## Oracle 表空间

### 1. 表空间类型

**永久表空间**：
```sql
-- 存储永久数据（表、索引等）
CREATE TABLESPACE users_data
DATAFILE '/u01/app/oracle/oradata/orcl/users01.dbf' SIZE 100M
AUTOEXTEND ON NEXT 10M MAXSIZE 1G
EXTENT MANAGEMENT LOCAL UNIFORM SIZE 1M
SEGMENT SPACE MANAGEMENT AUTO;
```

**临时表空间**：
```sql
-- 存储排序、临时表等临时数据
CREATE TEMPORARY TABLESPACE temp_data
TEMPFILE '/u01/app/oracle/oradata/orcl/temp01.dbf' SIZE 50M
AUTOEXTEND ON NEXT 10M MAXSIZE 500M;

-- 为用户指定临时表空间
ALTER USER app_user TEMPORARY TABLESPACE temp_data;
```

**UNDO 表空间**：
```sql
-- 存储事务回滚数据
CREATE UNDO TABLESPACE undo_data
DATAFILE '/u01/app/oracle/oradata/orcl/undo01.dbf' SIZE 100M
AUTOEXTEND ON;

-- 切换 UNDO 表空间
ALTER SYSTEM SET UNDO_TABLESPACE = undo_data;
```

### 2. 创建表空间

**基础创建**：
```sql
CREATE TABLESPACE myapp_data
DATAFILE '/u01/app/oracle/oradata/orcl/myapp_data01.dbf' SIZE 100M
AUTOEXTEND ON
NEXT 10M
MAXSIZE UNLIMITED;
```

**高级选项**：
```sql
CREATE TABLESPACE myapp_data
DATAFILE 
    '/u01/app/oracle/oradata/orcl/myapp_data01.dbf' SIZE 100M,
    '/u01/app/oracle/oradata/orcl/myapp_data02.dbf' SIZE 100M
AUTOEXTEND ON NEXT 10M MAXSIZE 1G
EXTENT MANAGEMENT LOCAL  -- 本地管理
UNIFORM SIZE 1M           -- 统一区大小
SEGMENT SPACE MANAGEMENT AUTO  -- 自动段空间管理
LOGGING                   -- 记录日志
ONLINE;                   -- 在线
```

**BIGFILE 表空间**：
```sql
-- 单个大文件（最大 128TB）
CREATE BIGFILE TABLESPACE large_data
DATAFILE '/u01/app/oracle/oradata/orcl/large_data01.dbf' SIZE 10G
AUTOEXTEND ON NEXT 1G MAXSIZE UNLIMITED;

-- 优点：
-- - 简化管理（单个文件）
-- - 支持超大表空间
-- 缺点：
-- - I/O 性能可能受限
-- - 备份恢复时间长
```

### 3. 修改表空间

**添加数据文件**：
```sql
ALTER TABLESPACE myapp_data
ADD DATAFILE '/u01/app/oracle/oradata/orcl/myapp_data03.dbf' SIZE 100M;
```

**调整数据文件大小**：
```sql
-- 手动调整大小
ALTER DATABASE DATAFILE '/u01/app/oracle/oradata/orcl/myapp_data01.dbf'
RESIZE 200M;

-- 修改自动扩展
ALTER DATABASE DATAFILE '/u01/app/oracle/oradata/orcl/myapp_data01.dbf'
AUTOEXTEND ON NEXT 20M MAXSIZE 2G;
```

**表空间状态管理**：
```sql
-- 离线表空间
ALTER TABLESPACE myapp_data OFFLINE;

-- 在线表空间
ALTER TABLESPACE myapp_data ONLINE;

-- 只读表空间
ALTER TABLESPACE myapp_data READ ONLY;

-- 读写表空间
ALTER TABLESPACE myapp_data READ WRITE;
```

### 4. 删除表空间

```sql
-- 删除空表空间
DROP TABLESPACE myapp_data;

-- 删除表空间及其内容
DROP TABLESPACE myapp_data INCLUDING CONTENTS;

-- 删除表空间、内容和数据文件
DROP TABLESPACE myapp_data INCLUDING CONTENTS AND DATAFILES;

-- 级联删除约束
DROP TABLESPACE myapp_data INCLUDING CONTENTS AND DATAFILES CASCADE CONSTRAINTS;
```

### 5. 表空间配额

```sql
-- 授予用户在表空间上的配额
ALTER USER app_user QUOTA 500M ON myapp_data;

-- 授予无限配额
ALTER USER app_user QUOTA UNLIMITED ON myapp_data;

-- 撤销配额
ALTER USER app_user QUOTA 0 ON myapp_data;

-- 查看用户配额
SELECT 
    tablespace_name,
    bytes / 1024 / 1024 AS used_mb,
    max_bytes / 1024 / 1024 AS quota_mb
FROM user_ts_quotas;
```

### 6. 表空间监控

```sql
-- 查看表空间使用情况
SELECT 
    tablespace_name,
    ROUND(SUM(bytes) / 1024 / 1024, 2) AS size_mb,
    ROUND(SUM(maxbytes) / 1024 / 1024, 2) AS max_size_mb
FROM dba_data_files
GROUP BY tablespace_name;

-- 查看表空间剩余空间
SELECT 
    tablespace_name,
    ROUND(SUM(bytes) / 1024 / 1024, 2) AS free_mb
FROM dba_free_space
GROUP BY tablespace_name;

-- 查看表空间使用率
SELECT 
    df.tablespace_name,
    ROUND(df.total_mb, 2) AS total_mb,
    ROUND(fs.free_mb, 2) AS free_mb,
    ROUND((df.total_mb - fs.free_mb) / df.total_mb * 100, 2) AS used_pct
FROM (
    SELECT tablespace_name, SUM(bytes) / 1024 / 1024 AS total_mb
    FROM dba_data_files
    GROUP BY tablespace_name
) df
LEFT JOIN (
    SELECT tablespace_name, SUM(bytes) / 1024 / 1024 AS free_mb
    FROM dba_free_space
    GROUP BY tablespace_name
) fs ON df.tablespace_name = fs.tablespace_name;
```

---

## PostgreSQL 表空间

### 1. 创建表空间

**基础创建**：
```sql
-- 创建目录（操作系统层面）
-- mkdir -p /data/pg_tablespaces/myapp_data
-- chown postgres:postgres /data/pg_tablespaces/myapp_data

-- 创建表空间
CREATE TABLESPACE myapp_data
LOCATION '/data/pg_tablespaces/myapp_data';
```

**设置表空间参数**：
```sql
-- 创建表空间并设置参数
CREATE TABLESPACE myapp_data
LOCATION '/data/pg_tablespaces/myapp_data'
WITH (
    seq_page_cost = 1.0,
    random_page_cost = 4.0
);

-- 修改表空间参数
ALTER TABLESPACE myapp_data SET (random_page_cost = 2.0);
```

### 2. 使用表空间

**创建表时指定**：
```sql
-- 在特定表空间创建表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    order_no VARCHAR(32),
    amount BIGINT,
    created_at TIMESTAMP
) TABLESPACE myapp_data;

-- 在特定表空间创建索引
CREATE INDEX idx_created_at ON orders(created_at) TABLESPACE myapp_data;
```

**移动表到不同表空间**：
```sql
-- 移动表
ALTER TABLE orders SET TABLESPACE new_tablespace;

-- 移动索引
ALTER INDEX idx_created_at SET TABLESPACE new_tablespace;

-- 移动数据库的所有对象
ALTER DATABASE mydb SET TABLESPACE new_tablespace;
```

**设置默认表空间**：
```sql
-- 为用户设置默认表空间
ALTER USER app_user SET default_tablespace = myapp_data;

-- 为数据库设置默认表空间
ALTER DATABASE mydb SET default_tablespace = myapp_data;
```

### 3. 表空间管理

**删除表空间**：
```sql
-- 删除空表空间
DROP TABLESPACE myapp_data;

-- 注意：表空间必须为空才能删除
-- 需要先移动或删除其中的对象
```

**查看表空间**：
```sql
-- 查看所有表空间
\db

-- 或使用 SQL
SELECT 
    spcname,
    pg_tablespace_location(oid) AS location,
    pg_size_pretty(pg_tablespace_size(spcname)) AS size
FROM pg_tablespace;

-- 查看表空间中的对象
SELECT 
    schemaname,
    tablename,
    tablespace
FROM pg_tables
WHERE tablespace = 'myapp_data';
```

---

## MySQL InnoDB 存储管理

### 1. 系统表空间

**ibdata 文件**：
```ini
# my.cnf
[mysqld]
# 系统表空间
innodb_data_file_path = ibdata1:12M:autoextend

# 多个文件
innodb_data_file_path = ibdata1:100M;ibdata2:100M:autoextend
```

**系统表空间用途**：
```
- 数据字典
- DoubleWrite Buffer
- Change Buffer
- UNDO 日志（MySQL 5.7 之前）
- 表数据（file-per-table 关闭时）
```

### 2. 独立表空间（File-Per-Table）

**启用独立表空间**：
```ini
# my.cnf
[mysqld]
innodb_file_per_table = ON  -- 默认开启
```

**独立表空间特点**：
```
每个表有自己的 .ibd 文件：
users.ibd
orders.ibd
products.ibd

优点：
- 删除表立即释放空间
- 可以单独备份表
- 可以单独优化表

缺点：
- 文件数量多
- 可能产生碎片
```

**查看表空间文件**：
```sql
SELECT 
    table_schema,
    table_name,
    ROUND(data_length / 1024 / 1024, 2) AS data_mb,
    ROUND(index_length / 1024 / 1024, 2) AS index_mb,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS total_mb
FROM information_schema.tables
WHERE table_schema = 'mydb'
ORDER BY (data_length + index_length) DESC;
```

### 3. 通用表空间（MySQL 5.7.6+）

**创建通用表空间**：
```sql
-- 创建表空间
CREATE TABLESPACE myapp_data
ADD DATAFILE '/var/lib/mysql/myapp_data.ibd'
ENGINE=InnoDB;

-- 在表空间中创建表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    amount BIGINT
) TABLESPACE myapp_data;

-- 移动表到表空间
ALTER TABLE users TABLESPACE myapp_data;

-- 删除表空间
DROP TABLESPACE myapp_data;
```

### 4. UNDO 表空间（MySQL 8.0+）

**独立 UNDO 表空间**：
```sql
-- 创建 UNDO 表空间
CREATE UNDO TABLESPACE undo_002
ADD DATAFILE 'undo_002.ibu';

-- 设置活动 UNDO 表空间
ALTER UNDO TABLESPACE undo_001 SET INACTIVE;
ALTER UNDO TABLESPACE undo_002 SET ACTIVE;

-- 删除 UNDO 表空间
DROP UNDO TABLESPACE undo_001;
```

### 5. 临时表空间

**配置临时表空间**：
```ini
# my.cnf
[mysqld]
innodb_temp_data_file_path = ibtmp1:12M:autoextend:max:5G
```

**查看临时表空间使用**：
```sql
SELECT 
    FILE_NAME,
    TABLESPACE_NAME,
    ENGINE,
    ROUND(TOTAL_EXTENTS * EXTENT_SIZE / 1024 / 1024, 2) AS size_mb
FROM information_schema.FILES
WHERE TABLESPACE_NAME = 'innodb_temporary';
```

---

## 存储结构

### 1. Oracle 存储层次

```
数据库
  └─ 表空间 (Tablespace)
       └─ 段 (Segment) - 表、索引等对象
            └─ 区 (Extent) - 连续的块
                 └─ 块 (Block) - 最小I/O单元（默认8KB）
```

**查看段信息**：
```sql
SELECT 
    segment_name,
    segment_type,
    tablespace_name,
    ROUND(bytes / 1024 / 1024, 2) AS size_mb,
    extents
FROM user_segments
WHERE segment_type = 'TABLE'
ORDER BY bytes DESC;
```

**查看区信息**：
```sql
SELECT 
    segment_name,
    extent_id,
    bytes / 1024 AS size_kb,
    blocks
FROM user_extents
WHERE segment_name = 'USERS'
ORDER BY extent_id;
```

### 2. PostgreSQL 存储结构

```
数据库集群 (Cluster)
  └─ 数据库 (Database)
       └─ 模式 (Schema)
            └─ 表 (Table)
                 └─ 页 (Page) - 默认8KB
```

**查看表文件**：
```sql
SELECT 
    schemaname,
    tablename,
    pg_relation_filepath(schemaname||'.'||tablename) AS file_path,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public';
```

### 3. InnoDB 存储结构

```
表空间 (Tablespace)
  └─ 段 (Segment) - 索引段、数据段
       └─ 区 (Extent) - 1MB（64个连续页）
            └─ 页 (Page) - 16KB（默认）
```

**页大小配置**：
```ini
# my.cnf
[mysqld]
innodb_page_size = 16384  -- 16KB（默认）
# 可选：4K, 8K, 16K, 32K, 64K
```

---

## 空间回收与碎片整理

### 1. Oracle 空间回收

**收缩表空间**：
```sql
-- 启用行移动
ALTER TABLE users ENABLE ROW MOVEMENT;

-- 收缩表
ALTER TABLE users SHRINK SPACE;

-- 收缩表和索引
ALTER TABLE users SHRINK SPACE CASCADE;

-- 禁用行移动
ALTER TABLE users DISABLE ROW MOVEMENT;
```

**重组表**：
```sql
-- 在线重组
ALTER TABLE users MOVE ONLINE;

-- 重组到新表空间
ALTER TABLE users MOVE TABLESPACE new_tablespace;

-- 重建索引
ALTER INDEX idx_username REBUILD ONLINE;
```

### 2. PostgreSQL 空间回收

**VACUUM**：
```sql
-- 回收死元组空间
VACUUM users;

-- 回收并分析
VACUUM ANALYZE users;

-- 完全回收（锁表，返还空间给操作系统）
VACUUM FULL users;

-- 自动 VACUUM（默认启用）
SHOW autovacuum;
```

**监控膨胀**：
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_dead_tup,
    n_live_tup,
    ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_pct DESC;
```

### 3. MySQL 空间回收

**OPTIMIZE TABLE**：
```sql
-- 重建表，回收碎片空间
OPTIMIZE TABLE users;

-- 注意：
-- - 锁表操作
-- - 需要临时空间
-- - 重建聚簇索引
```

**ALTER TABLE 重建**：
```sql
-- 重建表（更安全）
ALTER TABLE users ENGINE=InnoDB;

-- 或使用在线 DDL
ALTER TABLE users ENGINE=InnoDB, ALGORITHM=INPLACE, LOCK=NONE;
```

---

## 最佳实践

### 1. 表空间规划

**Oracle 表空间设计**：
```sql
-- 系统表空间
SYSTEM: 系统数据
SYSAUX: 辅助数据
TEMP: 临时数据
UNDO: 回滚数据

-- 业务表空间（按类型分离）
USERS_DATA: 用户表
ORDERS_DATA: 订单表
LOGS_DATA: 日志表
USERS_INDEX: 用户索引
ORDERS_INDEX: 订单索引

-- 优点：
-- - 便于管理和备份
-- - 可以分配到不同磁盘
-- - 隔离I/O压力
```

**PostgreSQL 表空间设计**：
```sql
-- 按磁盘性能分配
fast_ssd: 热数据表
normal_disk: 普通表
archive_disk: 归档表

-- 按业务模块分配
users_space: 用户相关表
orders_space: 订单相关表
logs_space: 日志表
```

### 2. 自动扩展配置

**Oracle**：
```sql
-- 合理设置自动扩展
CREATE TABLESPACE myapp_data
DATAFILE '/path/to/datafile.dbf' SIZE 100M
AUTOEXTEND ON
NEXT 10M          -- 每次扩展10MB
MAXSIZE 1G;       -- 最大1GB

-- 避免：
-- - NEXT 太小（频繁扩展）
-- - NEXT 太大（浪费空间）
-- - MAXSIZE UNLIMITED（可能撑爆磁盘）
```

**MySQL**：
```ini
# my.cnf
[mysqld]
# 系统表空间自动扩展
innodb_data_file_path = ibdata1:100M:autoextend:max:10G

# 监控空间使用
# 设置告警阈值
```

### 3. 空间监控

**监控表空间使用率**：
```sql
-- Oracle
SELECT 
    tablespace_name,
    ROUND(used_pct, 2) AS used_pct
FROM (
    SELECT 
        df.tablespace_name,
        (df.total_mb - NVL(fs.free_mb, 0)) / df.total_mb * 100 AS used_pct
    FROM (
        SELECT tablespace_name, SUM(bytes)/1024/1024 AS total_mb
        FROM dba_data_files
        GROUP BY tablespace_name
    ) df
    LEFT JOIN (
        SELECT tablespace_name, SUM(bytes)/1024/1024 AS free_mb
        FROM dba_free_space
        GROUP BY tablespace_name
    ) fs ON df.tablespace_name = fs.tablespace_name
)
WHERE used_pct > 80;  -- 告警阈值
```

**设置告警**：
```sql
-- 当表空间使用率超过阈值时告警
-- 使用监控工具（Zabbix、Prometheus等）
-- 或数据库作业定期检查
```

### 4. 定期维护

**Oracle**：
```sql
-- 每月重组大表
ALTER TABLE large_table MOVE ONLINE;
ALTER INDEX idx_large REBUILD ONLINE;

-- 每季度清理旧数据
-- 使用分区表，直接删除旧分区
ALTER TABLE orders DROP PARTITION p2023;
```

**PostgreSQL**：
```sql
-- 每天自动 VACUUM（autovacuum）
-- 每周 VACUUM ANALYZE
-- 每月 VACUUM FULL（根据需要）
```

**MySQL**：
```sql
-- 每月 OPTIMIZE TABLE（低峰期）
OPTIMIZE TABLE large_table;

-- 或使用 pt-online-schema-change
pt-online-schema-change --alter "ENGINE=InnoDB" D=mydb,t=large_table
```

---

## 生产环境案例

### 1. Oracle 表空间规划

```sql
-- 创建应用表空间
CREATE TABLESPACE app_data
DATAFILE 
    '/u01/oradata/app_data01.dbf' SIZE 500M,
    '/u02/oradata/app_data02.dbf' SIZE 500M
AUTOEXTEND ON NEXT 50M MAXSIZE 5G
EXTENT MANAGEMENT LOCAL UNIFORM SIZE 1M
SEGMENT SPACE MANAGEMENT AUTO;

CREATE TABLESPACE app_index
DATAFILE '/u03/oradata/app_index01.dbf' SIZE 200M
AUTOEXTEND ON NEXT 20M MAXSIZE 2G
EXTENT MANAGEMENT LOCAL UNIFORM SIZE 1M;

-- 设置默认表空间
ALTER USER app_user DEFAULT TABLESPACE app_data;
ALTER USER app_user QUOTA UNLIMITED ON app_data;
ALTER USER app_user QUOTA UNLIMITED ON app_index;
```

### 2. PostgreSQL 表空间使用

```sql
-- 创建表空间（SSD）
CREATE TABLESPACE fast_data
LOCATION '/ssd/pg_tablespaces/fast_data';

-- 创建表空间（HDD）
CREATE TABLESPACE archive_data
LOCATION '/hdd/pg_tablespaces/archive_data';

-- 热数据放 SSD
CREATE TABLE current_orders (...) TABLESPACE fast_data;

-- 归档数据放 HDD
CREATE TABLE historical_orders (...) TABLESPACE archive_data;
```

### 3. MySQL 空间管理

```sql
-- 查看大表
SELECT 
    table_name,
    ROUND(data_length / 1024 / 1024, 2) AS data_mb,
    ROUND(index_length / 1024 / 1024, 2) AS index_mb,
    ROUND(data_free / 1024 / 1024, 2) AS free_mb
FROM information_schema.tables
WHERE table_schema = 'mydb'
    AND data_free > 100 * 1024 * 1024  -- 碎片 > 100MB
ORDER BY data_free DESC;

-- 定期优化
-- 使用 pt-online-schema-change 在线优化
```

---

## 参考资料

1. **Oracle 官方文档**：
   - Tablespace Management: https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/managing-tablespaces.html

2. **PostgreSQL 官方文档**：
   - Tablespaces: https://www.postgresql.org/docs/current/manage-ag-tablespaces.html

3. **MySQL 官方文档**：
   - InnoDB Tablespaces: https://dev.mysql.com/doc/refman/8.0/en/innodb-tablespace.html

4. **最佳实践**：
   - 合理规划表空间
   - 分离数据和索引
   - 监控空间使用率
   - 定期维护和优化
   - 设置合理的自动扩展参数

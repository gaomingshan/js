# MyISAM 与其他存储引擎

## 概述

MySQL 支持多种存储引擎，不同存储引擎有不同的特性和适用场景。虽然 InnoDB 是默认和最常用的存储引擎，但了解其他存储引擎的特性，有助于在特定场景下做出正确选择。

**主要存储引擎**：
- **InnoDB**：默认引擎，支持事务
- **MyISAM**：早期默认引擎，性能高但无事务
- **Memory**：内存表，速度极快
- **CSV**：CSV 文件存储
- **Archive**：归档存储，高压缩比
- **其他**：Federated、Merge、NDB 等

---

## MyISAM 存储引擎

### 1. 特性

**核心特性**：
```
✓ 表级锁
✓ 不支持事务
✓ 不支持外键
✓ 支持全文索引
✓ 表压缩
✓ 空间占用小
✗ 崩溃后需要修复
✗ 不支持 MVCC
```

**文件结构**：
```
每个表3个文件：
- table_name.frm：表结构定义
- table_name.MYD：数据文件（MyData）
- table_name.MYI：索引文件（MyIndex）

示例：
users.frm
users.MYD
users.MYI
```

### 2. 锁机制

**表级锁**：
```sql
-- 读锁（共享锁）
LOCK TABLES users READ;
SELECT * FROM users;
UNLOCK TABLES;
-- 允许其他会话读取，阻止写入

-- 写锁（排他锁）
LOCK TABLES users WRITE;
UPDATE users SET status = 1 WHERE id = 1;
UNLOCK TABLES;
-- 阻止其他会话读取和写入
```

**并发插入**：
```sql
-- concurrent_insert 参数
SHOW VARIABLES LIKE 'concurrent_insert';

-- 0：禁用并发插入
-- 1：允许在表末尾并发插入（默认）
-- 2：总是允许并发插入

-- 场景：
-- 会话1：读取表
SELECT * FROM users;

-- 会话2：插入（在表末尾）
INSERT INTO users VALUES (...);
-- 不阻塞
```

**问题**：
```
表级锁导致：
✗ 并发度低
✗ 写操作阻塞所有读写
✗ 不适合高并发场景
```

### 3. 索引结构

**非聚簇索引**：
```
B+Tree 索引：
- 叶子节点存储数据文件指针
- 索引和数据分离

主键索引：
- 叶子节点：主键值 + 数据文件地址

二级索引：
- 叶子节点：索引列值 + 数据文件地址

查询流程：
1. 索引查找数据文件地址
2. 根据地址读取数据文件
```

**对比 InnoDB**：
```
InnoDB（聚簇索引）：
- 主键索引叶子节点存储完整行数据
- 二级索引存储主键值（需要回表）

MyISAM（非聚簇索引）：
- 所有索引都存储数据文件地址
- 不需要回表
```

### 4. 全文索引

**创建全文索引**：
```sql
-- MyISAM 支持全文索引
CREATE TABLE articles (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    FULLTEXT (title, content)
) ENGINE=MyISAM;

-- 全文搜索
SELECT * FROM articles
WHERE MATCH(title, content) AGAINST('database' IN NATURAL LANGUAGE MODE);

-- 布尔模式
WHERE MATCH(title, content) AGAINST('+MySQL -Oracle' IN BOOLEAN MODE);

-- 查询扩展
WHERE MATCH(title, content) AGAINST('database' WITH QUERY EXPANSION);
```

**注意**：
```
InnoDB 5.6+ 也支持全文索引
推荐使用 InnoDB 代替 MyISAM
```

### 5. 表压缩

**压缩表**：
```bash
# 使用 myisampack 压缩表
myisampack table_name

# 压缩后只读
# 节省空间，适合归档数据

# 重建索引
myisamchk -rq table_name
```

**压缩比**：
```
通常可以压缩 40-70%
特别适合：
- 历史数据
- 日志数据
- 归档数据
```

### 6. 修复表

**崩溃后修复**：
```sql
-- 检查表
CHECK TABLE users;

-- 修复表
REPAIR TABLE users;

-- 或使用命令行
myisamchk -r table_name
```

**问题**：
```
MyISAM 崩溃恢复：
- 需要手动修复
- 可能丢失数据
- 修复耗时

InnoDB 崩溃恢复：
- 自动恢复
- 不丢失已提交数据
- 恢复速度快
```

### 7. MyISAM 配置

```ini
# my.cnf
[mysqld]
# 键缓冲大小（索引缓存）
key_buffer_size = 256M

# 排序缓冲大小
myisam_sort_buffer_size = 64M

# 修复线程数
myisam_repair_threads = 1

# 延迟键写入
delay_key_write = ALL

# 并发插入
concurrent_insert = 2
```

---

## Memory 存储引擎

### 1. 特性

**核心特性**：
```
✓ 数据存储在内存
✓ 速度极快
✓ 表级锁
✓ 支持 Hash 索引和 B-Tree 索引
✗ 不支持事务
✗ 服务器重启数据丢失
✗ 不支持 TEXT/BLOB
✗ 不支持自增列持久化
```

**适用场景**：
```
✓ 临时数据
✓ 缓存表
✓ 会话数据
✓ 中间结果集
✗ 重要数据
✗ 需要持久化的数据
```

### 2. 创建 Memory 表

```sql
-- 创建 Memory 表
CREATE TABLE cache_data (
    id INT PRIMARY KEY,
    data VARCHAR(100),
    created_at TIMESTAMP
) ENGINE=Memory;

-- 插入数据
INSERT INTO cache_data VALUES (1, 'test', NOW());

-- 查询（极快）
SELECT * FROM cache_data WHERE id = 1;

-- 重启后数据丢失
-- 但表结构保留
```

### 3. 索引类型

**Hash 索引（默认）**：
```sql
-- 创建 Hash 索引
CREATE TABLE users_cache (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    INDEX (username) USING HASH
) ENGINE=Memory;

-- Hash 索引特点：
-- ✓ 等值查询极快：O(1)
-- ✗ 不支持范围查询
-- ✗ 不支持排序
-- ✗ 不支持部分匹配
```

**B-Tree 索引**：
```sql
-- 使用 B-Tree 索引
CREATE TABLE users_cache (
    id INT PRIMARY KEY,
    age INT,
    INDEX (age) USING BTREE
) ENGINE=Memory;

-- B-Tree 索引特点：
-- ✓ 支持范围查询
-- ✓ 支持排序
-- ✓ 支持部分匹配
-- ✗ 速度比 Hash 慢
```

### 4. 大小限制

**配置最大表大小**：
```sql
-- 查看默认大小
SHOW VARIABLES LIKE 'max_heap_table_size';

-- 设置会话级别
SET max_heap_table_size = 1024 * 1024 * 1024;  -- 1GB

-- 设置全局
SET GLOBAL max_heap_table_size = 1073741824;

-- 配置文件
[mysqld]
max_heap_table_size = 1G
```

**超过限制**：
```sql
-- 自动转换为磁盘临时表
-- 使用 InnoDB 或 MyISAM

-- 查看转换次数
SHOW STATUS LIKE 'Created_tmp_disk_tables';
SHOW STATUS LIKE 'Created_tmp_tables';

-- 如果 Created_tmp_disk_tables 很高
-- 考虑增大 max_heap_table_size
```

---

## CSV 存储引擎

### 1. 特性

**核心特性**：
```
✓ 数据存储为 CSV 文件
✓ 可以直接编辑 CSV 文件
✓ 便于数据交换
✗ 不支持索引
✗ 不支持 NULL
✗ 性能差
```

**文件结构**：
```
table_name.frm：表结构
table_name.CSV：数据文件
table_name.CSM：元数据
```

### 2. 使用示例

```sql
-- 创建 CSV 表
CREATE TABLE export_data (
    id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
) ENGINE=CSV;

-- 插入数据
INSERT INTO export_data VALUES
    (1, 'Alice', 'alice@example.com'),
    (2, 'Bob', 'bob@example.com');

-- 数据文件内容（export_data.CSV）：
-- 1,"Alice","alice@example.com"
-- 2,"Bob","bob@example.com"

-- 可以直接编辑 CSV 文件
-- 刷新表
FLUSH TABLES export_data;
```

**适用场景**：
```
✓ 数据导入导出
✓ 与外部系统交换数据
✓ 日志存储
✗ 频繁查询
✗ 需要索引的场景
```

---

## Archive 存储引擎

### 1. 特性

**核心特性**：
```
✓ 高压缩比（zlib 压缩）
✓ 只支持 INSERT 和 SELECT
✓ 适合归档数据
✗ 不支持 UPDATE 和 DELETE
✗ 不支持索引（除主键）
✗ 查询性能差
```

**压缩比**：
```
通常可以压缩 75-85%
比 MyISAM 压缩表更高

示例：
原始数据：1GB
压缩后：150-250MB
```

### 2. 使用示例

```sql
-- 创建 Archive 表
CREATE TABLE logs_archive (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_time TIMESTAMP,
    level VARCHAR(10),
    message TEXT
) ENGINE=Archive;

-- 插入数据
INSERT INTO logs_archive (log_time, level, message)
VALUES (NOW(), 'INFO', 'Application started');

-- 查询（扫描全表）
SELECT * FROM logs_archive WHERE level = 'ERROR';

-- 不支持更新和删除
UPDATE logs_archive SET level = 'WARN' WHERE id = 1;  -- 错误
DELETE FROM logs_archive WHERE id = 1;  -- 错误
```

**适用场景**：
```
✓ 日志归档
✓ 历史数据归档
✓ 审计数据
✗ 需要更新的数据
✗ 频繁查询
```

---

## Federated 存储引擎

### 1. 特性

**核心特性**：
```
✓ 访问远程 MySQL 服务器的表
✓ 类似数据库链接
✗ 不缓存数据
✗ 性能依赖网络
✗ 默认禁用
```

### 2. 使用示例

```sql
-- 启用 Federated 引擎
-- my.cnf
[mysqld]
federated

-- 重启 MySQL

-- 创建远程表的本地代理
CREATE TABLE remote_users (
    id INT PRIMARY KEY,
    username VARCHAR(50)
) ENGINE=Federated
CONNECTION='mysql://user:password@remote_host:3306/dbname/users';

-- 查询（实际查询远程表）
SELECT * FROM remote_users WHERE id = 1;

-- 插入（实际插入远程表）
INSERT INTO remote_users VALUES (2, 'Bob');
```

**适用场景**：
```
✓ 访问远程数据
✓ 数据联邦
✗ 高性能要求
✗ 不稳定网络环境
```

---

## 存储引擎对比

| 特性 | InnoDB | MyISAM | Memory | CSV | Archive |
|------|--------|--------|--------|-----|---------|
| 事务 | ✓ | ✗ | ✗ | ✗ | ✗ |
| 外键 | ✓ | ✗ | ✗ | ✗ | ✗ |
| 锁粒度 | 行锁 | 表锁 | 表锁 | 表锁 | 行锁 |
| MVCC | ✓ | ✗ | ✗ | ✗ | ✗ |
| 全文索引 | ✓ | ✓ | ✗ | ✗ | ✗ |
| 压缩 | ✓ | ✓ | ✗ | ✗ | ✓ |
| 崩溃恢复 | 自动 | 手动 | N/A | 手动 | 自动 |
| 空间占用 | 大 | 中 | 小 | 大 | 极小 |
| 性能 | 高 | 高 | 极高 | 低 | 低 |
| 适用场景 | OLTP | OLAP | 缓存 | 交换 | 归档 |

---

## 选择存储引擎

### 1. 决策树

```
需要事务？
  ├─ 是 → InnoDB
  └─ 否 ↓

需要高并发写入？
  ├─ 是 → InnoDB
  └─ 否 ↓

数据是临时的？
  ├─ 是 → Memory
  └─ 否 ↓

只需要插入和查询（归档）？
  ├─ 是 → Archive
  └─ 否 ↓

需要与外部系统交换数据？
  ├─ 是 → CSV
  └─ 否 ↓

只读或读多写少？
  └─ MyISAM（或 InnoDB）
```

### 2. 推荐方案

**OLTP 应用**：
```sql
-- 使用 InnoDB
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    amount DECIMAL(10,2),
    status VARCHAR(20),
    INDEX (user_id)
) ENGINE=InnoDB;
```

**OLAP 应用**：
```sql
-- 可以使用 InnoDB 或列存储引擎
-- InnoDB 也适合分析查询（5.7+）
CREATE TABLE sales_fact (
    ...
) ENGINE=InnoDB;
```

**日志表**：
```sql
-- 使用 Archive（归档）
CREATE TABLE access_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_time TIMESTAMP,
    ip VARCHAR(45),
    url VARCHAR(500)
) ENGINE=Archive;
```

**缓存表**：
```sql
-- 使用 Memory
CREATE TABLE session_cache (
    session_id CHAR(32) PRIMARY KEY,
    data TEXT,
    expire_time TIMESTAMP,
    INDEX (expire_time) USING BTREE
) ENGINE=Memory;
```

**临时结果**：
```sql
-- 使用临时表（自动选择引擎）
CREATE TEMPORARY TABLE tmp_results (
    ...
);
```

---

## 迁移存储引擎

### 1. ALTER TABLE

```sql
-- 最简单的方法
ALTER TABLE users ENGINE=InnoDB;

-- 问题：
-- - 锁表
-- - 重建表
-- - 耗时长（大表）
```

### 2. 导出导入

```bash
# 导出数据
mysqldump -u root -p mydb users > users.sql

# 修改表定义
sed -i 's/ENGINE=MyISAM/ENGINE=InnoDB/g' users.sql

# 导入数据
mysql -u root -p mydb < users.sql
```

### 3. pt-online-schema-change

```bash
# 使用 Percona Toolkit 在线迁移
pt-online-schema-change \
  --alter="ENGINE=InnoDB" \
  D=mydb,t=users \
  --execute

# 优点：
# - 不锁表
# - 在线操作
# - 可以取消
```

### 4. 创建新表

```sql
-- 创建新表（InnoDB）
CREATE TABLE users_new LIKE users;
ALTER TABLE users_new ENGINE=InnoDB;

-- 复制数据
INSERT INTO users_new SELECT * FROM users;

-- 切换表名
RENAME TABLE users TO users_old, users_new TO users;

-- 删除旧表
DROP TABLE users_old;
```

---

## 最佳实践

### 1. 存储引擎选择

```
推荐：
□ 默认使用 InnoDB
□ 特殊场景才考虑其他引擎

不推荐：
□ 混用多种存储引擎（维护复杂）
□ 使用 MyISAM 存储重要数据
□ 使用 Memory 存储持久数据
```

### 2. MyISAM 使用建议

```
如果必须使用 MyISAM：
□ 定期备份
□ 监控表损坏
□ 配置崩溃恢复
□ 考虑只读场景
□ 规划迁移到 InnoDB
```

### 3. Memory 使用建议

```
□ 只用于临时数据
□ 设置合理的表大小限制
□ 监控内存使用
□ 重启后重新加载数据
□ 考虑使用 Redis 代替
```

### 4. 监控维护

```
□ 检查表健康状态
□ 监控空间使用
□ 定期优化表
□ 审查存储引擎选择
□ 测试崩溃恢复
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Storage Engines: https://dev.mysql.com/doc/refman/8.0/en/storage-engines.html

2. **推荐工具**：
   - Percona Toolkit
   - MySQL Utilities

3. **最佳实践**：
   - 优先使用 InnoDB
   - 理解不同引擎特性
   - 根据场景选择引擎
   - 定期维护和优化
   - 制定迁移计划
   - 充分测试

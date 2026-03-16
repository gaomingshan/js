# DDL 数据定义语言

## 概述

DDL（Data Definition Language，数据定义语言）是 SQL 的核心组成部分，用于定义和管理数据库的结构。DDL 操作包括创建、修改、删除数据库对象，如数据库、表、索引、视图等。理解 DDL 是掌握数据库管理的第一步。

**核心命令**：
- **CREATE**：创建数据库对象
- **ALTER**：修改已存在的对象结构
- **DROP**：删除数据库对象
- **TRUNCATE**：清空表数据但保留结构

---

## 核心概念

### 1. CREATE - 创建对象

#### 创建数据库

**MySQL**：
```sql
CREATE DATABASE mydb 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

**Oracle**：
```sql
-- Oracle 中数据库概念不同，通常创建用户和表空间
CREATE TABLESPACE mydata
DATAFILE '/u01/app/oracle/oradata/mydata01.dbf' SIZE 100M
AUTOEXTEND ON NEXT 10M MAXSIZE 1G;
```

**PostgreSQL**：
```sql
CREATE DATABASE mydb
ENCODING 'UTF8'
LC_COLLATE 'zh_CN.UTF-8'
LC_CTYPE 'zh_CN.UTF-8'
TEMPLATE template0;
```

#### 创建表

**通用语法**：
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,  -- MySQL
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_email UNIQUE (email)
);
```

**Oracle 版本**：
```sql
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    username VARCHAR2(50) NOT NULL UNIQUE,
    email VARCHAR2(100),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- Oracle 需要手动创建序列
CREATE SEQUENCE user_id_seq START WITH 1 INCREMENT BY 1;
```

**PostgreSQL 版本**：
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,  -- SERIAL 自动创建序列
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 创建索引

```sql
-- 普通索引
CREATE INDEX idx_username ON users(username);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 联合索引
CREATE INDEX idx_name_email ON users(username, email);

-- 函数索引（Oracle 和 PostgreSQL）
CREATE INDEX idx_upper_username ON users(UPPER(username));
```

### 2. ALTER - 修改结构

#### 添加列

**MySQL**：
```sql
ALTER TABLE users ADD COLUMN age INT;
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email;
```

**Oracle/PostgreSQL**：
```sql
ALTER TABLE users ADD age INT;
-- Oracle/PostgreSQL 不支持 AFTER 关键字
```

#### 修改列

**MySQL**：
```sql
ALTER TABLE users MODIFY COLUMN age BIGINT;
ALTER TABLE users CHANGE COLUMN age user_age INT;
```

**Oracle**：
```sql
ALTER TABLE users MODIFY (age NUMBER(10));
```

**PostgreSQL**：
```sql
ALTER TABLE users ALTER COLUMN age TYPE BIGINT;
ALTER TABLE users RENAME COLUMN age TO user_age;
```

#### 删除列

```sql
ALTER TABLE users DROP COLUMN age;
```

#### 添加约束

```sql
-- 添加主键
ALTER TABLE users ADD PRIMARY KEY (id);

-- 添加外键
ALTER TABLE orders 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- 添加唯一约束
ALTER TABLE users ADD CONSTRAINT uk_username UNIQUE (username);

-- 添加检查约束
ALTER TABLE users ADD CONSTRAINT chk_age CHECK (age >= 0 AND age <= 150);
```

#### 删除约束

```sql
-- MySQL
ALTER TABLE users DROP INDEX uk_username;
ALTER TABLE orders DROP FOREIGN KEY fk_user_id;

-- Oracle/PostgreSQL
ALTER TABLE users DROP CONSTRAINT uk_username;
ALTER TABLE orders DROP CONSTRAINT fk_user_id;
```

### 3. DROP - 删除对象

```sql
-- 删除表
DROP TABLE users;

-- 删除表（如果存在）
DROP TABLE IF EXISTS users;

-- 级联删除（删除依赖对象）
DROP TABLE users CASCADE;

-- 删除数据库
DROP DATABASE mydb;

-- 删除索引
DROP INDEX idx_username;  -- MySQL 需要指定表名
DROP INDEX idx_username ON users;  -- MySQL
```

### 4. TRUNCATE vs DELETE

**TRUNCATE**：
```sql
TRUNCATE TABLE users;
```

**特点**：
- 删除所有行，但保留表结构
- 不记录单行删除日志，性能更高
- 重置自增计数器
- 不能回滚（在某些数据库中）
- 不触发 DELETE 触发器

**DELETE**：
```sql
DELETE FROM users;
```

**特点**：
- 逐行删除，记录日志
- 可以回滚
- 可以使用 WHERE 条件
- 触发 DELETE 触发器
- 不重置自增计数器

---

## 三大数据库的 DDL 差异

### 1. 自增列

| 数据库 | 语法 | 说明 |
|--------|------|------|
| MySQL | `AUTO_INCREMENT` | 内置支持 |
| Oracle | `SEQUENCE` + 触发器 或 `IDENTITY`（12c+） | 需要手动创建序列 |
| PostgreSQL | `SERIAL` 或 `IDENTITY` | SERIAL 是简写 |

### 2. 数据类型

| 类型 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| 整数 | INT | NUMBER | INTEGER |
| 字符串 | VARCHAR | VARCHAR2 | VARCHAR |
| 文本 | TEXT | CLOB | TEXT |
| 日期时间 | DATETIME | DATE/TIMESTAMP | TIMESTAMP |

### 3. 字符串长度

- **MySQL**：VARCHAR(50) 表示 50 个字符
- **Oracle**：VARCHAR2(50) 表示 50 字节或字符（取决于配置）
- **PostgreSQL**：VARCHAR(50) 表示 50 个字符

### 4. IF EXISTS/IF NOT EXISTS

- **MySQL**：支持 `IF EXISTS` 和 `IF NOT EXISTS`
- **Oracle**：不直接支持，需要 PL/SQL 块
- **PostgreSQL**：支持 `IF EXISTS` 和 `IF NOT EXISTS`

---

## DDL 事务性

### MySQL（InnoDB）
- DDL 操作会隐式提交当前事务
- DDL 本身不能回滚
- MySQL 8.0+ 支持原子 DDL（Atomic DDL）

```sql
START TRANSACTION;
INSERT INTO users (username) VALUES ('alice');
ALTER TABLE users ADD COLUMN age INT;  -- 隐式提交
ROLLBACK;  -- 无法回滚 INSERT
```

### Oracle
- DDL 操作自动提交
- DDL 前后的事务都会被提交
- 无法在事务中回滚 DDL

### PostgreSQL
- DDL 操作是事务性的
- 可以在事务中回滚 DDL
- 这是 PostgreSQL 的重要特性

```sql
BEGIN;
CREATE TABLE test (id INT);
INSERT INTO test VALUES (1);
ROLLBACK;  -- 表创建和数据插入都会回滚
```

---

## 易错点与边界

### 1. 级联删除的风险

```sql
-- 危险操作：级联删除会删除所有依赖对象
DROP TABLE users CASCADE;
```

**最佳实践**：
- 删除前检查依赖关系
- 使用 `RESTRICT` 选项防止意外删除
- 在生产环境谨慎使用 CASCADE

### 2. ALTER TABLE 锁表问题

**MySQL**：
- 传统 ALTER TABLE 会锁表
- Online DDL（5.6+）减少锁表时间
- 使用 `ALGORITHM=INPLACE` 和 `LOCK=NONE`

```sql
ALTER TABLE users 
ADD COLUMN age INT,
ALGORITHM=INPLACE, 
LOCK=NONE;
```

**PostgreSQL**：
- 某些 ALTER 操作会长时间锁表
- 使用并发索引创建：`CREATE INDEX CONCURRENTLY`

```sql
CREATE INDEX CONCURRENTLY idx_username ON users(username);
```

### 3. TRUNCATE 的限制

**不能使用 WHERE 条件**：
```sql
-- 错误
TRUNCATE TABLE users WHERE age > 30;

-- 应该使用
DELETE FROM users WHERE age > 30;
```

**外键约束的影响**：
```sql
-- 如果 orders 表有外键引用 users，则 TRUNCATE 会失败
TRUNCATE TABLE users;  -- ERROR

-- 需要级联或先删除外键
TRUNCATE TABLE users CASCADE;  -- PostgreSQL
```

### 4. 字符集不匹配

```sql
-- 创建表时未指定字符集，使用数据库默认
CREATE TABLE users (name VARCHAR(50));

-- 插入中文可能乱码
INSERT INTO users VALUES ('张三');
```

**最佳实践**：
```sql
-- 明确指定字符集
CREATE TABLE users (
    name VARCHAR(50) CHARACTER SET utf8mb4
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 生产实践示例

### 1. 数据库初始化脚本

```sql
-- MySQL 完整初始化脚本
CREATE DATABASE IF NOT EXISTS myapp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE myapp;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status TINYINT DEFAULT 1 COMMENT '1:active, 0:inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 2. 安全的表结构变更

```sql
-- 第一步：备份
CREATE TABLE users_backup AS SELECT * FROM users;

-- 第二步：在测试环境验证
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 第三步：生产环境执行（非高峰期）
ALTER TABLE users 
ADD COLUMN phone VARCHAR(20),
ALGORITHM=INPLACE,
LOCK=NONE;

-- 第四步：验证
SELECT COUNT(*) FROM users;
```

### 3. 分批删除大表数据

```sql
-- 不要直接 TRUNCATE 大表
-- TRUNCATE TABLE large_table;

-- 分批删除
WHILE (SELECT COUNT(*) FROM large_table) > 0 DO
    DELETE FROM large_table LIMIT 10000;
    -- 暂停，避免锁表时间过长
    SELECT SLEEP(1);
END WHILE;
```

### 4. 使用临时表测试

```sql
-- 创建临时表测试 DDL 变更
CREATE TEMPORARY TABLE users_test LIKE users;

ALTER TABLE users_test ADD COLUMN phone VARCHAR(20);

-- 验证无误后再在正式表执行
```

---

## 参考资料

1. **MySQL 官方文档**：
   - DDL Statements: https://dev.mysql.com/doc/refman/8.0/en/sql-data-definition-statements.html
   - Online DDL: https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl.html

2. **Oracle 官方文档**：
   - SQL Language Reference: https://docs.oracle.com/en/database/oracle/oracle-database/

3. **PostgreSQL 官方文档**：
   - DDL: https://www.postgresql.org/docs/current/ddl.html
   - Transactional DDL: https://wiki.postgresql.org/wiki/Transactional_DDL_in_PostgreSQL

4. **最佳实践**：
   - 在生产环境执行 DDL 前先在测试环境验证
   - 使用版本控制管理 DDL 脚本
   - 大表变更考虑使用在线工具（pt-online-schema-change、gh-ost）
   - 始终备份数据后再执行 DDL 操作

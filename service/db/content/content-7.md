# DCL 权限控制与 TCL 事务控制

## 概述

DCL（Data Control Language，数据控制语言）用于管理数据库的访问权限，TCL（Transaction Control Language，事务控制语言）用于管理事务的提交和回滚。这两类语言是数据库安全和数据一致性的基础。

**DCL 核心命令**：
- **GRANT**：授予权限
- **REVOKE**：撤销权限

**TCL 核心命令**：
- **COMMIT**：提交事务
- **ROLLBACK**：回滚事务
- **SAVEPOINT**：设置保存点

---

## DCL - 权限控制

### 1. 权限类型

#### 系统权限（Oracle）
控制用户能执行的操作类型。

```sql
-- Oracle 系统权限示例
CREATE SESSION          -- 连接数据库
CREATE TABLE            -- 创建表
CREATE USER             -- 创建用户
ALTER ANY TABLE         -- 修改任意表
DROP ANY TABLE          -- 删除任意表
```

#### 对象权限
控制对特定对象的访问。

**常见对象权限**：
```sql
SELECT          -- 查询
INSERT          -- 插入
UPDATE          -- 更新
DELETE          -- 删除
ALTER           -- 修改结构
INDEX           -- 创建索引
REFERENCES      -- 创建外键
EXECUTE         -- 执行存储过程/函数
```

### 2. GRANT 授权

#### MySQL 授权

**授予数据库权限**：
```sql
-- 授予所有权限
GRANT ALL PRIVILEGES ON mydb.* TO 'user1'@'localhost';

-- 授予特定权限
GRANT SELECT, INSERT, UPDATE ON mydb.users TO 'user1'@'localhost';

-- 授予单表权限
GRANT SELECT, INSERT ON mydb.users TO 'user1'@'localhost';

-- 授予特定列权限
GRANT SELECT (id, username), UPDATE (email) ON mydb.users TO 'user1'@'localhost';

-- 授予执行权限
GRANT EXECUTE ON PROCEDURE mydb.update_user TO 'user1'@'localhost';

-- WITH GRANT OPTION：允许转授权限
GRANT SELECT ON mydb.users TO 'user1'@'localhost' WITH GRANT OPTION;

-- 刷新权限（使权限生效）
FLUSH PRIVILEGES;
```

**授予全局权限**：
```sql
-- 授予所有数据库的权限
GRANT SELECT ON *.* TO 'readonly_user'@'%';

-- 授予管理权限
GRANT SUPER, RELOAD, PROCESS ON *.* TO 'admin'@'localhost';
```

#### Oracle 授权

**系统权限**：
```sql
-- 授予系统权限
GRANT CREATE SESSION TO user1;
GRANT CREATE TABLE TO user1;
GRANT UNLIMITED TABLESPACE TO user1;

-- 授予角色
GRANT CONNECT, RESOURCE TO user1;

-- WITH ADMIN OPTION：允许转授系统权限
GRANT CREATE TABLE TO user1 WITH ADMIN OPTION;
```

**对象权限**：
```sql
-- 授予表权限
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO user1;

-- 授予视图权限
GRANT SELECT ON user_view TO user1;

-- 授予存储过程权限
GRANT EXECUTE ON update_user_proc TO user1;

-- WITH GRANT OPTION：允许转授对象权限
GRANT SELECT ON users TO user1 WITH GRANT OPTION;
```

#### PostgreSQL 授权

```sql
-- 授予数据库权限
GRANT CONNECT ON DATABASE mydb TO user1;
GRANT CREATE ON DATABASE mydb TO user1;

-- 授予模式权限
GRANT USAGE ON SCHEMA public TO user1;
GRANT CREATE ON SCHEMA public TO user1;

-- 授予表权限
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO user1;
GRANT ALL PRIVILEGES ON users TO user1;

-- 授予序列权限
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO user1;

-- 授予所有表权限
GRANT SELECT ON ALL TABLES IN SCHEMA public TO user1;

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO user1;
```

### 3. REVOKE 撤销权限

#### MySQL 撤销权限

```sql
-- 撤销特定权限
REVOKE INSERT, UPDATE ON mydb.users FROM 'user1'@'localhost';

-- 撤销所有权限
REVOKE ALL PRIVILEGES ON mydb.* FROM 'user1'@'localhost';

-- 撤销转授权限
REVOKE GRANT OPTION FOR SELECT ON mydb.users FROM 'user1'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;
```

#### Oracle 撤销权限

```sql
-- 撤销系统权限
REVOKE CREATE TABLE FROM user1;

-- 撤销对象权限
REVOKE SELECT, INSERT ON users FROM user1;

-- 级联撤销（撤销用户转授的权限）
REVOKE SELECT ON users FROM user1 CASCADE CONSTRAINTS;
```

#### PostgreSQL 撤销权限

```sql
-- 撤销表权限
REVOKE SELECT, INSERT ON users FROM user1;

-- 撤销所有权限
REVOKE ALL PRIVILEGES ON users FROM user1;

-- 撤销并级联
REVOKE SELECT ON users FROM user1 CASCADE;
```

### 4. 角色管理

角色是一组权限的集合，简化权限管理。

#### MySQL 角色（8.0+）

```sql
-- 创建角色
CREATE ROLE 'app_read', 'app_write', 'app_admin';

-- 授予权限给角色
GRANT SELECT ON mydb.* TO 'app_read';
GRANT INSERT, UPDATE, DELETE ON mydb.* TO 'app_write';
GRANT ALL PRIVILEGES ON mydb.* TO 'app_admin';

-- 将角色授予用户
GRANT 'app_read' TO 'user1'@'localhost';
GRANT 'app_write' TO 'user2'@'localhost';

-- 设置默认角色
SET DEFAULT ROLE 'app_read' TO 'user1'@'localhost';

-- 激活角色（会话级别）
SET ROLE 'app_read';

-- 删除角色
DROP ROLE 'app_read';
```

#### Oracle 角色

```sql
-- 创建角色
CREATE ROLE app_read;
CREATE ROLE app_write;

-- 授予权限给角色
GRANT SELECT ON users TO app_read;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_write;

-- 将角色授予用户
GRANT app_read TO user1;

-- 设置默认角色
ALTER USER user1 DEFAULT ROLE app_read;

-- 删除角色
DROP ROLE app_read;
```

#### PostgreSQL 角色

PostgreSQL 中用户和角色概念统一。

```sql
-- 创建角色（不能登录）
CREATE ROLE app_read;

-- 创建角色（可以登录）
CREATE ROLE app_user WITH LOGIN PASSWORD 'password';

-- 授予权限给角色
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_read;

-- 角色继承
GRANT app_read TO app_user;

-- 删除角色
DROP ROLE app_read;
```

---

## TCL - 事务控制

### 1. 事务基础

事务是一组 SQL 操作的逻辑单元，遵循 ACID 特性。

#### 开启事务

**MySQL**：
```sql
-- 显式开启事务
START TRANSACTION;
-- 或
BEGIN;

-- 设置自动提交
SET autocommit = 0;  -- 关闭自动提交
SET autocommit = 1;  -- 开启自动提交（默认）
```

**Oracle**：
```sql
-- Oracle 没有显式的 BEGIN TRANSACTION
-- 事务在第一条 DML 语句时自动开启
INSERT INTO users VALUES (...);
```

**PostgreSQL**：
```sql
-- 开启事务
BEGIN;
-- 或
START TRANSACTION;
```

### 2. COMMIT 提交事务

将事务中的所有更改永久保存。

```sql
START TRANSACTION;

INSERT INTO users (username, email) VALUES ('alice', 'alice@example.com');
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2;

COMMIT;  -- 提交所有更改
```

### 3. ROLLBACK 回滚事务

撤销事务中的所有更改。

```sql
START TRANSACTION;

INSERT INTO users (username, email) VALUES ('bob', 'bob@example.com');
DELETE FROM orders WHERE user_id = 999;

ROLLBACK;  -- 撤销所有更改
```

### 4. SAVEPOINT 保存点

在事务内设置保存点，可以回滚到特定保存点。

```sql
START TRANSACTION;

INSERT INTO users (username, email) VALUES ('alice', 'alice@example.com');

SAVEPOINT sp1;

UPDATE users SET email = 'newemail@example.com' WHERE username = 'alice';

SAVEPOINT sp2;

DELETE FROM users WHERE username = 'bob';

-- 回滚到 sp2
ROLLBACK TO SAVEPOINT sp2;

-- 回滚到 sp1
ROLLBACK TO SAVEPOINT sp1;

COMMIT;
```

**PostgreSQL 语法**：
```sql
BEGIN;

INSERT INTO users VALUES (...);

SAVEPOINT my_savepoint;

UPDATE users SET email = 'new@example.com';

-- 回滚到保存点
ROLLBACK TO my_savepoint;

-- 释放保存点
RELEASE SAVEPOINT my_savepoint;

COMMIT;
```

### 5. 自动提交与手动提交

#### MySQL

```sql
-- 查看自动提交状态
SELECT @@autocommit;

-- 关闭自动提交
SET autocommit = 0;

-- 此时每条语句需要手动 COMMIT
INSERT INTO users VALUES (...);
COMMIT;

-- 开启自动提交（默认）
SET autocommit = 1;
```

#### Oracle

Oracle 默认不自动提交，需要手动 COMMIT。

```sql
-- DDL 语句会自动提交
CREATE TABLE test (id INT);  -- 自动提交

-- DML 语句不会自动提交
INSERT INTO test VALUES (1);  -- 不会自动提交
COMMIT;  -- 手动提交
```

#### PostgreSQL

PostgreSQL 默认自动提交，事务需要显式开启。

```sql
-- 自动提交（默认）
INSERT INTO users VALUES (...);  -- 自动提交

-- 显式事务
BEGIN;
INSERT INTO users VALUES (...);
COMMIT;  -- 手动提交
```

---

## 权限查看

### MySQL 查看权限

```sql
-- 查看当前用户权限
SHOW GRANTS;
SHOW GRANTS FOR CURRENT_USER;

-- 查看指定用户权限
SHOW GRANTS FOR 'user1'@'localhost';

-- 查看所有用户
SELECT User, Host FROM mysql.user;

-- 查看表权限
SELECT * FROM mysql.tables_priv WHERE User = 'user1';

-- 查看列权限
SELECT * FROM mysql.columns_priv WHERE User = 'user1';
```

### Oracle 查看权限

```sql
-- 查看当前用户系统权限
SELECT * FROM user_sys_privs;

-- 查看当前用户对象权限
SELECT * FROM user_tab_privs;

-- 查看角色权限
SELECT * FROM user_role_privs;

-- 查看所有用户
SELECT username FROM dba_users;

-- 查看用户权限（需要 DBA 权限）
SELECT * FROM dba_sys_privs WHERE grantee = 'USER1';
SELECT * FROM dba_tab_privs WHERE grantee = 'USER1';
```

### PostgreSQL 查看权限

```sql
-- 查看数据库权限
\l
SELECT datname, datacl FROM pg_database;

-- 查看表权限
\dp
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'users';

-- 查看角色
\du
SELECT rolname FROM pg_roles;

-- 查看角色成员
SELECT * FROM pg_auth_members;
```

---

## 易错点与边界

### 1. MySQL 权限修改后不生效

```sql
-- 错误：修改权限后忘记刷新
GRANT SELECT ON mydb.users TO 'user1'@'localhost';
-- 用户连接可能看不到新权限

-- 正确：刷新权限
FLUSH PRIVILEGES;
```

### 2. % 通配符的理解

```sql
-- 'user1'@'%' 不包括 localhost
GRANT SELECT ON mydb.* TO 'user1'@'%';
-- 从 localhost 连接仍然会被拒绝

-- 需要分别授权
GRANT SELECT ON mydb.* TO 'user1'@'localhost';
GRANT SELECT ON mydb.* TO 'user1'@'%';
```

### 3. DDL 语句自动提交

```sql
-- 危险：DDL 会自动提交前面的事务
START TRANSACTION;
INSERT INTO users VALUES (...);
CREATE TABLE test (id INT);  -- 自动提交 INSERT
ROLLBACK;  -- 无法回滚 INSERT
```

### 4. SAVEPOINT 与嵌套事务

```sql
-- 数据库不支持真正的嵌套事务
-- SAVEPOINT 只是事务内的标记点

START TRANSACTION;  -- 外部事务

SAVEPOINT sp1;
INSERT INTO users VALUES (...);

START TRANSACTION;  -- 错误：不能嵌套
```

### 5. NOT IN 与 NULL 权限

```sql
-- Oracle/PostgreSQL
REVOKE SELECT ON users FROM PUBLIC;
-- 所有用户（包括未来创建的）都无法访问

GRANT SELECT ON users TO user1;
-- 只有 user1 可以访问
```

---

## 生产实践示例

### 1. 最小权限原则

```sql
-- 应用程序只读账号
CREATE USER 'app_readonly'@'%' IDENTIFIED BY 'password';
GRANT SELECT ON mydb.* TO 'app_readonly'@'%';

-- 应用程序读写账号
CREATE USER 'app_rw'@'%' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE ON mydb.* TO 'app_rw'@'%';

-- 禁止 DROP、TRUNCATE
REVOKE DROP ON mydb.* FROM 'app_rw'@'%';
```

### 2. 安全的转账事务

```sql
START TRANSACTION;

-- 检查余额
SELECT balance INTO @from_balance 
FROM accounts 
WHERE user_id = 1 FOR UPDATE;

IF @from_balance >= 100 THEN
    -- 扣款
    UPDATE accounts 
    SET balance = balance - 100 
    WHERE user_id = 1;
    
    -- 加款
    UPDATE accounts 
    SET balance = balance + 100 
    WHERE user_id = 2;
    
    COMMIT;
ELSE
    ROLLBACK;
END IF;
```

### 3. 批量操作的保存点

```sql
START TRANSACTION;

-- 批量插入
INSERT INTO logs SELECT * FROM temp_logs WHERE batch_id = 1;
SAVEPOINT batch1;

INSERT INTO logs SELECT * FROM temp_logs WHERE batch_id = 2;
SAVEPOINT batch2;

INSERT INTO logs SELECT * FROM temp_logs WHERE batch_id = 3;
-- 如果这批有问题，回滚到 batch2
ROLLBACK TO SAVEPOINT batch2;

COMMIT;
```

### 4. 角色权限体系

```sql
-- MySQL 8.0+ 角色体系
CREATE ROLE 'dev_read', 'dev_write', 'qa_read', 'qa_write', 'prod_read';

-- 开发环境权限
GRANT SELECT ON dev_db.* TO 'dev_read';
GRANT SELECT, INSERT, UPDATE, DELETE ON dev_db.* TO 'dev_write';

-- QA 环境权限
GRANT SELECT ON qa_db.* TO 'qa_read';
GRANT SELECT, INSERT, UPDATE, DELETE ON qa_db.* TO 'qa_write';

-- 生产环境权限（只读）
GRANT SELECT ON prod_db.* TO 'prod_read';

-- 分配给用户
GRANT 'dev_read', 'dev_write' TO 'developer1'@'%';
GRANT 'qa_read', 'qa_write' TO 'qa_engineer1'@'%';
GRANT 'prod_read' TO 'developer1'@'%';

-- 设置默认角色
SET DEFAULT ROLE ALL TO 'developer1'@'%';
```

---

## 三大数据库的差异

| 特性 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| 角色支持 | ✓（8.0+） | ✓ | ✓ |
| 列级权限 | ✓ | ✓ | ✓ |
| 默认提交模式 | 自动提交 | 手动提交 | 自动提交 |
| DDL 事务性 | 否 | 否 | 是 |
| SAVEPOINT | ✓ | ✓ | ✓ |
| 用户@主机 | ✓ | ✗ | ✗ |
| PUBLIC 角色 | ✗ | ✓ | ✓ |

**特殊说明**：
- **MySQL**：权限粒度精细到主机，`'user'@'host'` 形式
- **Oracle**：系统权限和对象权限分离，PUBLIC 角色自动授予所有用户
- **PostgreSQL**：用户和角色概念统一，支持事务性 DDL

---

## 参考资料

1. **MySQL 官方文档**：
   - GRANT Statement: https://dev.mysql.com/doc/refman/8.0/en/grant.html
   - REVOKE Statement: https://dev.mysql.com/doc/refman/8.0/en/revoke.html
   - Transaction Statements: https://dev.mysql.com/doc/refman/8.0/en/commit.html

2. **Oracle 官方文档**：
   - GRANT: https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/GRANT.html
   - Transaction Control: https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/transactions.html

3. **PostgreSQL 官方文档**：
   - GRANT: https://www.postgresql.org/docs/current/sql-grant.html
   - Transaction Control: https://www.postgresql.org/docs/current/tutorial-transactions.html

4. **最佳实践**：
   - 遵循最小权限原则
   - 使用角色管理权限
   - 生产环境禁用 root/超级用户直接操作
   - 定期审计权限
   - 事务中避免 DDL 操作
   - 长事务及时提交或回滚

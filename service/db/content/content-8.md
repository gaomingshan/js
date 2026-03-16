# 用户管理与初始化脚本

## 概述

用户管理是数据库安全的第一道防线。合理的用户权限设计和标准化的初始化流程，能够有效防止数据泄露和误操作。本章将详细介绍三大数据库的用户创建、权限配置和初始化脚本编写。

**核心内容**：
- 用户创建与删除
- 密码管理与安全策略
- 权限体系设计
- 默认初始化脚本
- 连接限制与资源配额

---

## MySQL 用户管理

### 1. 创建用户

```sql
-- 基础语法
CREATE USER 'username'@'host' IDENTIFIED BY 'password';

-- 示例
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'StrongPass123!';
CREATE USER 'app_user'@'%' IDENTIFIED BY 'StrongPass123!';
CREATE USER 'readonly'@'192.168.1.%' IDENTIFIED BY 'ReadOnly123!';

-- 创建用户时指定密码插件（MySQL 8.0+）
CREATE USER 'user1'@'localhost' 
IDENTIFIED WITH mysql_native_password BY 'password';

CREATE USER 'user2'@'localhost' 
IDENTIFIED WITH caching_sha2_password BY 'password';

-- 创建用户但不设置密码（需要后续设置）
CREATE USER 'user3'@'localhost';
```

### 2. 修改密码

```sql
-- 修改当前用户密码
ALTER USER USER() IDENTIFIED BY 'NewPassword123!';

-- 修改指定用户密码
ALTER USER 'app_user'@'localhost' IDENTIFIED BY 'NewPassword123!';

-- 使用 SET PASSWORD（旧语法）
SET PASSWORD FOR 'app_user'@'localhost' = 'NewPassword123!';

-- 修改 root 密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewRootPass123!';
```

### 3. 删除用户

```sql
-- 删除用户
DROP USER 'app_user'@'localhost';

-- 删除多个用户
DROP USER 'user1'@'localhost', 'user2'@'localhost';

-- 如果存在则删除
DROP USER IF EXISTS 'app_user'@'localhost';
```

### 4. 用户账户管理

```sql
-- 锁定用户
ALTER USER 'app_user'@'localhost' ACCOUNT LOCK;

-- 解锁用户
ALTER USER 'app_user'@'localhost' ACCOUNT UNLOCK;

-- 设置密码过期
ALTER USER 'app_user'@'localhost' PASSWORD EXPIRE;

-- 设置密码永不过期
ALTER USER 'app_user'@'localhost' PASSWORD EXPIRE NEVER;

-- 设置密码有效期（天）
ALTER USER 'app_user'@'localhost' PASSWORD EXPIRE INTERVAL 90 DAY;

-- 设置密码历史（不能重复使用最近N个密码）
ALTER USER 'app_user'@'localhost' PASSWORD HISTORY 5;

-- 设置密码重用间隔（天）
ALTER USER 'app_user'@'localhost' PASSWORD REUSE INTERVAL 365 DAY;

-- 要求密码验证
ALTER USER 'app_user'@'localhost' PASSWORD REQUIRE CURRENT;
```

### 5. 连接限制

```sql
-- 创建用户时设置连接限制
CREATE USER 'app_user'@'localhost' 
IDENTIFIED BY 'password'
WITH 
    MAX_QUERIES_PER_HOUR 10000
    MAX_UPDATES_PER_HOUR 5000
    MAX_CONNECTIONS_PER_HOUR 100
    MAX_USER_CONNECTIONS 10;

-- 修改连接限制
ALTER USER 'app_user'@'localhost' 
WITH MAX_USER_CONNECTIONS 20;

-- 取消限制（设置为 0）
ALTER USER 'app_user'@'localhost' 
WITH MAX_USER_CONNECTIONS 0;
```

### 6. MySQL 初始化脚本示例

```sql
-- ========================================
-- MySQL 数据库初始化脚本
-- 版本：8.0+
-- 用途：创建应用数据库、用户及权限
-- ========================================

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS myapp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 2. 创建用户
-- 应用读写用户
CREATE USER IF NOT EXISTS 'app_rw'@'%' 
IDENTIFIED WITH caching_sha2_password BY 'AppRW_Pass_2024!';

-- 应用只读用户
CREATE USER IF NOT EXISTS 'app_ro'@'%' 
IDENTIFIED WITH caching_sha2_password BY 'AppRO_Pass_2024!';

-- 管理员用户（仅本地）
CREATE USER IF NOT EXISTS 'app_admin'@'localhost' 
IDENTIFIED WITH caching_sha2_password BY 'AppAdmin_Pass_2024!';

-- 3. 授予权限
-- 读写用户权限
GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.* TO 'app_rw'@'%';

-- 只读用户权限
GRANT SELECT ON myapp.* TO 'app_ro'@'%';

-- 管理员权限（包括 DDL）
GRANT ALL PRIVILEGES ON myapp.* TO 'app_admin'@'localhost';

-- 4. 设置连接限制
ALTER USER 'app_rw'@'%' WITH MAX_USER_CONNECTIONS 100;
ALTER USER 'app_ro'@'%' WITH MAX_USER_CONNECTIONS 50;

-- 5. 设置密码策略
ALTER USER 'app_rw'@'%' PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'app_ro'@'%' PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'app_admin'@'localhost' PASSWORD EXPIRE INTERVAL 60 DAY;

-- 6. 刷新权限
FLUSH PRIVILEGES;

-- 7. 验证用户创建
SELECT User, Host FROM mysql.user WHERE User LIKE 'app_%';

-- 8. 验证权限
SHOW GRANTS FOR 'app_rw'@'%';
SHOW GRANTS FOR 'app_ro'@'%';
SHOW GRANTS FOR 'app_admin'@'localhost';
```

---

## Oracle 用户管理

### 1. 创建用户

```sql
-- 基础语法
CREATE USER username IDENTIFIED BY password;

-- 指定表空间
CREATE USER app_user IDENTIFIED BY StrongPass123
DEFAULT TABLESPACE users
TEMPORARY TABLESPACE temp
QUOTA UNLIMITED ON users;

-- 设置密码过期
CREATE USER app_user IDENTIFIED BY StrongPass123
PASSWORD EXPIRE;

-- 锁定用户
CREATE USER app_user IDENTIFIED BY StrongPass123
ACCOUNT LOCK;
```

### 2. 修改用户

```sql
-- 修改密码
ALTER USER app_user IDENTIFIED BY NewPassword123;

-- 修改表空间配额
ALTER USER app_user QUOTA 500M ON users;

-- 设置默认表空间
ALTER USER app_user DEFAULT TABLESPACE users;

-- 锁定/解锁用户
ALTER USER app_user ACCOUNT LOCK;
ALTER USER app_user ACCOUNT UNLOCK;

-- 设置密码过期
ALTER USER app_user PASSWORD EXPIRE;
```

### 3. 删除用户

```sql
-- 删除用户
DROP USER app_user;

-- 级联删除（删除用户拥有的对象）
DROP USER app_user CASCADE;
```

### 4. 密码管理

```sql
-- 创建密码配置文件
CREATE PROFILE app_profile LIMIT
    SESSIONS_PER_USER 10
    CPU_PER_SESSION UNLIMITED
    CPU_PER_CALL 3000
    CONNECT_TIME 45
    IDLE_TIME 30
    LOGICAL_READS_PER_SESSION UNLIMITED
    LOGICAL_READS_PER_CALL 1000
    PRIVATE_SGA 102400
    FAILED_LOGIN_ATTEMPTS 3
    PASSWORD_LIFE_TIME 90
    PASSWORD_REUSE_TIME 365
    PASSWORD_REUSE_MAX 5
    PASSWORD_LOCK_TIME 1/24  -- 1小时
    PASSWORD_GRACE_TIME 7;

-- 应用配置文件到用户
ALTER USER app_user PROFILE app_profile;

-- 查看密码配置
SELECT * FROM dba_profiles WHERE profile = 'APP_PROFILE';
```

### 5. Oracle 初始化脚本示例

```sql
-- ========================================
-- Oracle 数据库初始化脚本
-- 版本：19c
-- 用途：创建应用用户、表空间及权限
-- ========================================

-- 1. 创建表空间
CREATE TABLESPACE myapp_data
DATAFILE '/u01/app/oracle/oradata/myapp_data01.dbf' 
SIZE 100M
AUTOEXTEND ON NEXT 10M MAXSIZE 1G
EXTENT MANAGEMENT LOCAL
SEGMENT SPACE MANAGEMENT AUTO;

CREATE TABLESPACE myapp_index
DATAFILE '/u01/app/oracle/oradata/myapp_index01.dbf' 
SIZE 50M
AUTOEXTEND ON NEXT 10M MAXSIZE 500M
EXTENT MANAGEMENT LOCAL;

-- 2. 创建密码配置文件
CREATE PROFILE app_profile LIMIT
    FAILED_LOGIN_ATTEMPTS 5
    PASSWORD_LIFE_TIME 90
    PASSWORD_REUSE_TIME 365
    PASSWORD_LOCK_TIME 1
    PASSWORD_GRACE_TIME 7;

-- 3. 创建用户
-- 应用读写用户
CREATE USER app_rw IDENTIFIED BY AppRW_Pass_2024
DEFAULT TABLESPACE myapp_data
TEMPORARY TABLESPACE temp
QUOTA UNLIMITED ON myapp_data
QUOTA 500M ON myapp_index
PROFILE app_profile;

-- 应用只读用户
CREATE USER app_ro IDENTIFIED BY AppRO_Pass_2024
DEFAULT TABLESPACE myapp_data
TEMPORARY TABLESPACE temp
QUOTA 0 ON myapp_data  -- 只读不需要配额
PROFILE app_profile;

-- 4. 授予系统权限
GRANT CREATE SESSION TO app_rw;
GRANT CREATE TABLE TO app_rw;
GRANT CREATE VIEW TO app_rw;
GRANT CREATE SEQUENCE TO app_rw;
GRANT CREATE PROCEDURE TO app_rw;

GRANT CREATE SESSION TO app_ro;

-- 5. 创建角色并授权
CREATE ROLE app_read_role;
CREATE ROLE app_write_role;

-- 授予角色权限（后续在创建表后授予对象权限）
GRANT app_read_role TO app_ro;
GRANT app_read_role, app_write_role TO app_rw;

-- 6. 设置默认角色
ALTER USER app_rw DEFAULT ROLE app_read_role, app_write_role;
ALTER USER app_ro DEFAULT ROLE app_read_role;

-- 7. 验证用户创建
SELECT username, default_tablespace, temporary_tablespace, profile
FROM dba_users
WHERE username IN ('APP_RW', 'APP_RO');

-- 8. 验证配额
SELECT username, tablespace_name, max_bytes
FROM dba_ts_quotas
WHERE username IN ('APP_RW', 'APP_RO');

-- 9. 验证权限
SELECT * FROM dba_sys_privs WHERE grantee IN ('APP_RW', 'APP_RO');
SELECT * FROM dba_role_privs WHERE grantee IN ('APP_RW', 'APP_RO');
```

---

## PostgreSQL 用户管理

### 1. 创建用户/角色

在 PostgreSQL 中，用户和角色概念统一。

```sql
-- 创建角色（不能登录）
CREATE ROLE app_role;

-- 创建用户（可以登录）
CREATE USER app_user WITH PASSWORD 'StrongPass123!';

-- 或使用 CREATE ROLE WITH LOGIN
CREATE ROLE app_user WITH LOGIN PASSWORD 'StrongPass123!';

-- 创建超级用户
CREATE USER admin_user WITH SUPERUSER PASSWORD 'AdminPass123!';

-- 创建用户并设置连接限制
CREATE USER app_user WITH 
    PASSWORD 'StrongPass123!'
    CONNECTION LIMIT 10
    VALID UNTIL '2025-12-31';

-- 创建角色并设置权限
CREATE ROLE app_readonly WITH
    LOGIN
    PASSWORD 'ReadOnly123!'
    CONNECTION LIMIT 20
    IN ROLE app_read_group;
```

### 2. 修改用户

```sql
-- 修改密码
ALTER USER app_user WITH PASSWORD 'NewPassword123!';

-- 修改连接限制
ALTER USER app_user WITH CONNECTION LIMIT 20;

-- 设置密码有效期
ALTER USER app_user VALID UNTIL '2025-12-31';

-- 取消密码有效期
ALTER USER app_user VALID UNTIL 'infinity';

-- 重命名用户
ALTER USER app_user RENAME TO app_user_new;

-- 设置用户属性
ALTER USER app_user WITH CREATEDB;
ALTER USER app_user WITH CREATEROLE;
ALTER USER app_user WITH SUPERUSER;
```

### 3. 删除用户

```sql
-- 删除用户
DROP USER app_user;

-- 删除角色
DROP ROLE app_role;

-- 如果存在则删除
DROP USER IF EXISTS app_user;

-- 删除前需要先撤销权限和所属对象
REASSIGN OWNED BY app_user TO postgres;
DROP OWNED BY app_user;
DROP USER app_user;
```

### 4. 角色继承与成员

```sql
-- 将角色授予用户
GRANT app_read_role TO app_user;

-- 撤销角色
REVOKE app_read_role FROM app_user;

-- 创建角色层级
CREATE ROLE app_base;
CREATE ROLE app_read INHERIT;
CREATE ROLE app_write INHERIT;

GRANT app_base TO app_read;
GRANT app_read TO app_write;
GRANT app_write TO app_user;

-- 设置角色继承
ALTER ROLE app_user INHERIT;
ALTER ROLE app_user NOINHERIT;
```

### 5. PostgreSQL 初始化脚本示例

```sql
-- ========================================
-- PostgreSQL 数据库初始化脚本
-- 版本：14+
-- 用途：创建应用数据库、用户及权限
-- ========================================

-- 1. 创建数据库
CREATE DATABASE myapp
WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'zh_CN.UTF-8'
    LC_CTYPE = 'zh_CN.UTF-8'
    TEMPLATE = template0
    CONNECTION LIMIT = -1;

-- 连接到新数据库
\c myapp

-- 2. 创建角色（权限组）
CREATE ROLE app_read_role;
CREATE ROLE app_write_role;

-- 3. 创建用户
-- 应用读写用户
CREATE USER app_rw WITH
    PASSWORD 'AppRW_Pass_2024!'
    CONNECTION LIMIT 100
    VALID UNTIL '2025-12-31'
    IN ROLE app_read_role, app_write_role;

-- 应用只读用户
CREATE USER app_ro WITH
    PASSWORD 'AppRO_Pass_2024!'
    CONNECTION LIMIT 50
    VALID UNTIL '2025-12-31'
    IN ROLE app_read_role;

-- 管理员用户
CREATE USER app_admin WITH
    PASSWORD 'AppAdmin_Pass_2024!'
    CONNECTION LIMIT 5
    CREATEDB
    CREATEROLE;

-- 4. 授予数据库权限
GRANT CONNECT ON DATABASE myapp TO app_rw, app_ro, app_admin;
GRANT CREATE ON DATABASE myapp TO app_admin;

-- 5. 授予模式权限
GRANT USAGE ON SCHEMA public TO app_read_role, app_write_role;
GRANT CREATE ON SCHEMA public TO app_write_role;

-- 6. 授予表权限（对现有表）
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_read_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_write_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;

-- 7. 授予序列权限
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_read_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO app_write_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- 8. 设置默认权限（对未来创建的表）
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO app_read_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_write_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO app_write_role;

-- 9. 限制 public schema 的 CREATE 权限
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- 10. 验证用户创建
SELECT 
    usename,
    usecreatedb,
    usesuper,
    valuntil,
    useconnlimit
FROM pg_user
WHERE usename LIKE 'app_%';

-- 11. 验证角色成员
SELECT 
    r.rolname AS role,
    m.rolname AS member
FROM pg_roles r
JOIN pg_auth_members am ON r.oid = am.roleid
JOIN pg_roles m ON am.member = m.oid
WHERE r.rolname LIKE 'app_%' OR m.rolname LIKE 'app_%';

-- 12. 验证权限
\du app_rw
\du app_ro
\du app_admin
```

---

## 安全最佳实践

### 1. 密码强度要求

```sql
-- MySQL 密码验证插件
INSTALL COMPONENT 'file://component_validate_password';

SET GLOBAL validate_password.policy = STRONG;
SET GLOBAL validate_password.length = 12;
SET GLOBAL validate_password.mixed_case_count = 1;
SET GLOBAL validate_password.number_count = 1;
SET GLOBAL validate_password.special_char_count = 1;

-- PostgreSQL 使用扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 密码复杂度检查（应用层实现）
```

### 2. 最小权限原则

```sql
-- 错误：授予过多权限
GRANT ALL PRIVILEGES ON *.* TO 'app_user'@'%';

-- 正确：只授予必要权限
GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.* TO 'app_user'@'%';

-- 更精细：只授予特定表权限
GRANT SELECT, INSERT ON myapp.users TO 'app_user'@'%';
GRANT SELECT ON myapp.config TO 'app_user'@'%';
```

### 3. 网络访问限制

```sql
-- 限制特定 IP 段
CREATE USER 'app_user'@'192.168.1.%' IDENTIFIED BY 'password';

-- 只允许本地访问
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'password';

-- PostgreSQL pg_hba.conf 配置
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    myapp           app_rw          192.168.1.0/24          scram-sha-256
host    myapp           app_ro          0.0.0.0/0               scram-sha-256
local   all             postgres                                peer
```

### 4. 定期审计与清理

```sql
-- 查找长期未使用的用户（MySQL）
SELECT 
    user, 
    host,
    password_last_changed,
    DATEDIFF(NOW(), password_last_changed) AS days_since_change
FROM mysql.user
WHERE DATEDIFF(NOW(), password_last_changed) > 90;

-- 查找无权限用户
SELECT user, host
FROM mysql.user u
WHERE NOT EXISTS (
    SELECT 1 FROM mysql.db WHERE user = u.user AND host = u.host
)
AND NOT EXISTS (
    SELECT 1 FROM mysql.tables_priv WHERE user = u.user AND host = u.host
);

-- 定期备份权限配置
mysqldump -u root -p --no-data --databases mysql > mysql_grants_backup.sql
```

---

## 易错点与边界

### 1. MySQL 的 % 不包括 localhost

```sql
-- 错误：认为这样可以从任何地方连接
CREATE USER 'app_user'@'%' IDENTIFIED BY 'password';
-- 实际：从 localhost 连接会失败

-- 正确：分别创建
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'app_user'@'%' IDENTIFIED BY 'password';
```

### 2. Oracle 用户名默认大写

```sql
-- 创建用户
CREATE USER app_user IDENTIFIED BY password;

-- 查询时需要大写
SELECT * FROM dba_users WHERE username = 'APP_USER';  -- 正确
SELECT * FROM dba_users WHERE username = 'app_user';  -- 错误
```

### 3. PostgreSQL 角色与用户的区别

```sql
-- 角色不能登录
CREATE ROLE app_role;

-- 用户可以登录
CREATE USER app_user WITH PASSWORD 'password';
-- 等价于
CREATE ROLE app_user WITH LOGIN PASSWORD 'password';
```

### 4. 删除用户前需要清理对象

```sql
-- 错误：用户拥有对象时无法删除
DROP USER app_user;  -- ERROR: user has objects

-- 正确：先转移或删除对象（PostgreSQL）
REASSIGN OWNED BY app_user TO postgres;
DROP OWNED BY app_user;
DROP USER app_user;
```

---

## 三大数据库用户管理对比

| 特性 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| 用户@主机 | ✓ | ✗ | ✗ |
| 密码过期 | ✓ | ✓ | ✓ |
| 连接限制 | ✓ | ✓ | ✓ |
| 资源配额 | ✓ | ✓ | ✗ |
| 配置文件 | ✗ | ✓ | ✗ |
| 角色继承 | ✗ | ✓ | ✓ |
| 表空间 | ✗ | ✓ | ✓ |

---

## 参考资料

1. **MySQL 官方文档**：
   - User Management: https://dev.mysql.com/doc/refman/8.0/en/user-management.html
   - Password Management: https://dev.mysql.com/doc/refman/8.0/en/password-management.html

2. **Oracle 官方文档**：
   - Managing Users: https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/managing-security-for-oracle-database-users.html

3. **PostgreSQL 官方文档**：
   - Database Roles: https://www.postgresql.org/docs/current/user-manag.html
   - Client Authentication: https://www.postgresql.org/docs/current/client-authentication.html

4. **安全规范**：
   - 使用强密码策略
   - 定期更换密码
   - 限制网络访问
   - 最小权限原则
   - 定期审计用户和权限

# DML 数据操作语言

## 概述

DML（Data Manipulation Language，数据操作语言）用于对数据库中的数据进行增、删、改操作。与 DDL 不同，DML 操作的是表中的数据而非表结构，且 DML 操作通常是事务性的，可以回滚。

**核心命令**：
- **INSERT**：插入数据
- **UPDATE**：更新数据
- **DELETE**：删除数据
- **MERGE/UPSERT**：存在则更新，不存在则插入

---

## 核心概念

### 1. INSERT - 插入数据

#### 单行插入

**标准语法**：
```sql
INSERT INTO users (username, email, age) 
VALUES ('alice', 'alice@example.com', 25);
```

**省略列名**（不推荐）：
```sql
-- 必须提供所有列的值，顺序必须匹配
INSERT INTO users 
VALUES (1, 'alice', 'alice@example.com', 25, CURRENT_TIMESTAMP);
```

**插入部分列**：
```sql
-- 未指定的列使用默认值或 NULL
INSERT INTO users (username, email) 
VALUES ('bob', 'bob@example.com');
```

#### 批量插入

**MySQL**：
```sql
INSERT INTO users (username, email, age) VALUES
('alice', 'alice@example.com', 25),
('bob', 'bob@example.com', 30),
('charlie', 'charlie@example.com', 28);
```

**Oracle**：
```sql
-- 方式1：INSERT ALL
INSERT ALL
    INTO users (username, email, age) VALUES ('alice', 'alice@example.com', 25)
    INTO users (username, email, age) VALUES ('bob', 'bob@example.com', 30)
    INTO users (username, email, age) VALUES ('charlie', 'charlie@example.com', 28)
SELECT 1 FROM DUAL;

-- 方式2：多次 INSERT（低效）
INSERT INTO users (username, email, age) VALUES ('alice', 'alice@example.com', 25);
INSERT INTO users (username, email, age) VALUES ('bob', 'bob@example.com', 30);
```

**PostgreSQL**：
```sql
-- 支持 MySQL 语法
INSERT INTO users (username, email, age) VALUES
('alice', 'alice@example.com', 25),
('bob', 'bob@example.com', 30),
('charlie', 'charlie@example.com', 28);
```

#### INSERT SELECT

从其他表或查询结果插入数据：

```sql
-- 从另一个表插入
INSERT INTO users_backup (username, email, age)
SELECT username, email, age FROM users WHERE age > 25;

-- 从复杂查询插入
INSERT INTO user_stats (user_id, order_count, total_amount)
SELECT 
    user_id, 
    COUNT(*) as order_count,
    SUM(amount) as total_amount
FROM orders
GROUP BY user_id;
```

#### 插入并返回自增 ID

**MySQL**：
```sql
INSERT INTO users (username, email) VALUES ('alice', 'alice@example.com');
SELECT LAST_INSERT_ID();
```

**Oracle**：
```sql
-- 方式1：使用 RETURNING 子句
INSERT INTO users (id, username, email) 
VALUES (user_seq.NEXTVAL, 'alice', 'alice@example.com')
RETURNING id INTO :new_id;

-- 方式2：查询序列当前值
INSERT INTO users (id, username, email) 
VALUES (user_seq.NEXTVAL, 'alice', 'alice@example.com');
SELECT user_seq.CURRVAL FROM DUAL;
```

**PostgreSQL**：
```sql
-- 方式1：RETURNING 子句
INSERT INTO users (username, email) 
VALUES ('alice', 'alice@example.com')
RETURNING id;

-- 方式2：currval
INSERT INTO users (username, email) 
VALUES ('alice', 'alice@example.com');
SELECT currval('users_id_seq');
```

### 2. UPDATE - 更新数据

#### 单表更新

**基本语法**：
```sql
UPDATE users 
SET email = 'newemail@example.com', age = 26
WHERE username = 'alice';
```

**使用表达式**：
```sql
-- 年龄增加1
UPDATE users SET age = age + 1 WHERE id = 1;

-- 使用函数
UPDATE users SET username = UPPER(username);

-- 使用 CASE 表达式
UPDATE users 
SET status = CASE 
    WHEN age < 18 THEN 'minor'
    WHEN age >= 18 AND age < 65 THEN 'adult'
    ELSE 'senior'
END;
```

**更新所有行**（危险操作）：
```sql
-- 没有 WHERE 条件会更新所有行
UPDATE users SET status = 1;
```

#### 多表关联更新

**MySQL**：
```sql
-- 使用 JOIN 更新
UPDATE users u
INNER JOIN orders o ON u.id = o.user_id
SET u.order_count = u.order_count + 1
WHERE o.created_at > '2024-01-01';

-- 使用子查询更新
UPDATE users 
SET order_count = (
    SELECT COUNT(*) FROM orders WHERE user_id = users.id
)
WHERE id IN (SELECT DISTINCT user_id FROM orders);
```

**Oracle**：
```sql
-- 使用子查询
UPDATE users u
SET u.order_count = (
    SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id
)
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 使用 MERGE（更高效）
MERGE INTO users u
USING (
    SELECT user_id, COUNT(*) as cnt FROM orders GROUP BY user_id
) o
ON (u.id = o.user_id)
WHEN MATCHED THEN
    UPDATE SET u.order_count = o.cnt;
```

**PostgreSQL**：
```sql
-- 使用 FROM 子句
UPDATE users u
SET order_count = o.cnt
FROM (
    SELECT user_id, COUNT(*) as cnt FROM orders GROUP BY user_id
) o
WHERE u.id = o.user_id;
```

### 3. DELETE - 删除数据

#### 基本删除

```sql
-- 删除特定行
DELETE FROM users WHERE id = 1;

-- 删除满足条件的多行
DELETE FROM users WHERE age < 18;

-- 删除所有行（危险）
DELETE FROM users;
```

#### 使用子查询删除

```sql
-- 删除没有订单的用户
DELETE FROM users 
WHERE id NOT IN (SELECT DISTINCT user_id FROM orders);

-- 使用 EXISTS
DELETE FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

#### 关联删除

**MySQL**：
```sql
-- 使用 JOIN 删除
DELETE u FROM users u
INNER JOIN user_logs l ON u.id = l.user_id
WHERE l.last_login < '2023-01-01';
```

**PostgreSQL**：
```sql
-- 使用 USING 子句
DELETE FROM users u
USING user_logs l
WHERE u.id = l.user_id AND l.last_login < '2023-01-01';
```

#### DELETE 并返回删除的数据

**PostgreSQL**：
```sql
DELETE FROM users 
WHERE age < 18
RETURNING id, username, email;
```

**Oracle**：
```sql
DELETE FROM users 
WHERE age < 18
RETURNING id, username, email INTO :id_var, :username_var, :email_var;
```

### 4. MERGE/UPSERT - 插入或更新

当记录存在时更新，不存在时插入，这种操作在不同数据库中有不同的实现方式。

#### MySQL - ON DUPLICATE KEY UPDATE

```sql
INSERT INTO users (id, username, email, age) 
VALUES (1, 'alice', 'alice@example.com', 25)
ON DUPLICATE KEY UPDATE 
    email = VALUES(email),
    age = VALUES(age);

-- MySQL 8.0+ 推荐使用别名
INSERT INTO users (id, username, email, age) 
VALUES (1, 'alice', 'alice@example.com', 25) AS new
ON DUPLICATE KEY UPDATE 
    email = new.email,
    age = new.age;
```

#### MySQL - REPLACE INTO

```sql
-- 先删除再插入（不推荐，会影响自增 ID）
REPLACE INTO users (id, username, email, age) 
VALUES (1, 'alice', 'alice@example.com', 25);
```

#### PostgreSQL - ON CONFLICT

```sql
-- 基于主键冲突
INSERT INTO users (id, username, email, age) 
VALUES (1, 'alice', 'alice@example.com', 25)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    age = EXCLUDED.age;

-- 基于唯一索引冲突
INSERT INTO users (username, email, age) 
VALUES ('alice', 'alice@example.com', 25)
ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    age = EXCLUDED.age;

-- 冲突时不做任何操作
INSERT INTO users (username, email) 
VALUES ('alice', 'alice@example.com')
ON CONFLICT (username) DO NOTHING;
```

#### Oracle - MERGE

```sql
MERGE INTO users u
USING (
    SELECT 1 as id, 'alice' as username, 'alice@example.com' as email, 25 as age FROM DUAL
) src
ON (u.id = src.id)
WHEN MATCHED THEN
    UPDATE SET u.email = src.email, u.age = src.age
WHEN NOT MATCHED THEN
    INSERT (id, username, email, age) 
    VALUES (src.id, src.username, src.email, src.age);
```

---

## 大批量数据操作优化

### 1. 批量插入优化

**单条插入（低效）**：
```sql
-- 每次插入都是一个事务，性能差
INSERT INTO users (username, email) VALUES ('user1', 'user1@example.com');
INSERT INTO users (username, email) VALUES ('user2', 'user2@example.com');
-- ... 重复10000次
```

**批量插入（高效）**：
```sql
-- 一次插入多行，性能提升10-100倍
INSERT INTO users (username, email) VALUES
('user1', 'user1@example.com'),
('user2', 'user2@example.com'),
('user3', 'user3@example.com')
-- ... 一次插入500-1000行
;
```

**分批插入**：
```sql
-- 避免单次插入过多导致锁表时间过长
-- 分批插入，每批1000行
```

### 2. 批量更新优化

**逐行更新（低效）**：
```sql
UPDATE users SET status = 1 WHERE id = 1;
UPDATE users SET status = 1 WHERE id = 2;
-- ... 重复10000次
```

**批量更新（高效）**：
```sql
-- 使用 IN 子句
UPDATE users SET status = 1 WHERE id IN (1, 2, 3, ..., 10000);

-- 使用 CASE 表达式批量更新不同值
UPDATE users 
SET status = CASE id
    WHEN 1 THEN 2
    WHEN 2 THEN 3
    WHEN 3 THEN 1
END
WHERE id IN (1, 2, 3);
```

### 3. 批量删除优化

```sql
-- 分批删除，避免长时间锁表
DELETE FROM users WHERE id <= 100000 LIMIT 1000;
-- 循环执行，每次删除1000行
```

### 4. LOAD DATA 批量导入（MySQL）

```sql
-- 最快的数据导入方式
LOAD DATA INFILE '/path/to/users.csv'
INTO TABLE users
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(username, email, age);
```

**PostgreSQL 等效命令**：
```sql
COPY users (username, email, age)
FROM '/path/to/users.csv'
WITH (FORMAT csv, HEADER true);
```

---

## 易错点与边界

### 1. 更新/删除忘记 WHERE 条件

```sql
-- 危险：更新所有行
UPDATE users SET password = '123456';

-- 危险：删除所有行
DELETE FROM users;
```

**防护措施**：
- 启用 SQL 安全模式（MySQL）
- 先用 SELECT 验证条件
- 在事务中执行，验证后再提交

```sql
START TRANSACTION;
UPDATE users SET status = 0 WHERE age < 18;
SELECT * FROM users WHERE age < 18;  -- 验证
COMMIT;  -- 或 ROLLBACK
```

### 2. INSERT 时主键冲突

```sql
-- 错误：主键已存在
INSERT INTO users (id, username) VALUES (1, 'alice');
-- ERROR: Duplicate entry '1' for key 'PRIMARY'
```

**解决方案**：
```sql
-- 方案1：使用 ON DUPLICATE KEY UPDATE
INSERT INTO users (id, username) VALUES (1, 'alice')
ON DUPLICATE KEY UPDATE username = 'alice';

-- 方案2：使用 IGNORE
INSERT IGNORE INTO users (id, username) VALUES (1, 'alice');

-- 方案3：先检查再插入
INSERT INTO users (id, username) 
SELECT 1, 'alice' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);
```

### 3. NULL 值处理

```sql
-- NULL 的比较需要使用 IS NULL
DELETE FROM users WHERE email = NULL;  -- 错误，删除0行
DELETE FROM users WHERE email IS NULL;  -- 正确

-- UPDATE 设置 NULL
UPDATE users SET email = NULL WHERE id = 1;
```

### 4. 字符串转义

```sql
-- 单引号需要转义
INSERT INTO users (username) VALUES ('O''Reilly');  -- O'Reilly

-- 或使用双单引号
INSERT INTO users (username) VALUES ('O\'Reilly');  -- MySQL
```

---

## 生产实践示例

### 1. 安全的数据更新流程

```sql
-- 第一步：开启事务
START TRANSACTION;

-- 第二步：备份要更新的数据
CREATE TABLE users_backup_20240316 AS
SELECT * FROM users WHERE age < 18;

-- 第三步：执行更新
UPDATE users SET status = 0 WHERE age < 18;

-- 第四步：验证更新结果
SELECT COUNT(*) FROM users WHERE age < 18 AND status = 0;

-- 第五步：确认无误后提交
COMMIT;
```

### 2. 高性能批量插入

```sql
-- 关闭自动提交
SET autocommit = 0;

-- 禁用索引（可选，仅适用于空表）
ALTER TABLE users DISABLE KEYS;

-- 批量插入（每批1000行）
INSERT INTO users (username, email) VALUES (...);  -- 1000行
COMMIT;

INSERT INTO users (username, email) VALUES (...);  -- 1000行
COMMIT;

-- 重建索引
ALTER TABLE users ENABLE KEYS;

-- 恢复自动提交
SET autocommit = 1;
```

### 3. 避免死锁的更新顺序

```sql
-- 错误：两个事务以不同顺序更新，可能死锁
-- 事务1
UPDATE users SET status = 1 WHERE id = 1;
UPDATE users SET status = 1 WHERE id = 2;

-- 事务2
UPDATE users SET status = 1 WHERE id = 2;
UPDATE users SET status = 1 WHERE id = 1;

-- 正确：按固定顺序（如 id 升序）更新
UPDATE users SET status = 1 WHERE id IN (1, 2) ORDER BY id;
```

### 4. 软删除 vs 物理删除

```sql
-- 物理删除（不可恢复）
DELETE FROM users WHERE id = 1;

-- 软删除（推荐）
UPDATE users SET deleted = 1, deleted_at = NOW() WHERE id = 1;

-- 查询时过滤已删除记录
SELECT * FROM users WHERE deleted = 0;
```

---

## 三大数据库的 DML 差异总结

| 特性 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| UPSERT | ON DUPLICATE KEY UPDATE | MERGE | ON CONFLICT |
| 批量插入 | VALUES (...), (...) | INSERT ALL | VALUES (...), (...) |
| LIMIT 删除 | DELETE ... LIMIT n | ROWNUM | DELETE ... WHERE id IN (...) |
| 返回结果 | 不支持 | RETURNING INTO | RETURNING |
| 多表 UPDATE | JOIN 语法 | 子查询 | FROM 子句 |

---

## 参考资料

1. **MySQL 官方文档**：
   - DML Statements: https://dev.mysql.com/doc/refman/8.0/en/sql-data-manipulation-statements.html
   - INSERT ON DUPLICATE: https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html

2. **Oracle 官方文档**：
   - MERGE Statement: https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/MERGE.html

3. **PostgreSQL 官方文档**：
   - INSERT ON CONFLICT: https://www.postgresql.org/docs/current/sql-insert.html

4. **性能优化**：
   - 大批量操作使用批量语法
   - 关闭索引后批量插入，再重建索引
   - 使用 LOAD DATA/COPY 导入大量数据
   - 合理使用事务，避免过大或过小的事务

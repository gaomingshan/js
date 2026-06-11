# 附录 A：SQL 语法速查（三大数据库对照）

> 纯参考性质。写 SQL 时忘了语法就翻这里。按分类速查。

---

## 一、DDL 数据定义语言

### 1.1 数据库操作

```sql
-- === MySQL ===
CREATE DATABASE IF NOT EXISTS mydb
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DROP DATABASE IF EXISTS mydb;

-- === PostgreSQL ===
CREATE DATABASE mydb
  ENCODING 'UTF8' LC_COLLATE 'zh_CN.UTF-8' LC_CTYPE 'zh_CN.UTF-8';
DROP DATABASE IF EXISTS mydb;

-- === Oracle ===
-- Oracle 中"数据库"是实例级概念，通常建表空间和用户
CREATE TABLESPACE mydata
  DATAFILE '/u01/app/oracle/oradata/mydata01.dbf' SIZE 100M
  AUTOEXTEND ON NEXT 10M MAXSIZE 1G;
DROP TABLESPACE mydata INCLUDING CONTENTS AND DATAFILES;
```

### 1.2 创建表

**MySQL：**
```sql
CREATE TABLE [IF NOT EXISTS] users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    email VARCHAR(100) NOT NULL,
    status TINYINT DEFAULT 1,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_email (email),
    INDEX idx_status_created (status, created_at),
    CONSTRAINT uk_username UNIQUE (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;
```

**PostgreSQL：**
```sql
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uk_username ON users(username);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_status_created ON users(status, created_at);
```

**Oracle：**
```sql
CREATE TABLE users (
    id NUMBER(19) PRIMARY KEY,
    username VARCHAR2(50) NOT NULL,
    email VARCHAR2(100) NOT NULL,
    status NUMBER(3) DEFAULT 1,
    created_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT SYSTIMESTAMP
);
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1 CACHE 100;
CREATE UNIQUE INDEX uk_username ON users(username);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_status_created ON users(status, created_at);

-- 用触发器模拟自增
CREATE OR REPLACE TRIGGER users_bi
BEFORE INSERT ON users FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := users_seq.NEXTVAL;
    END IF;
END;
/
```

### 1.3 ALTER TABLE

| 操作 | MySQL | PostgreSQL | Oracle |
|------|-------|-----------|--------|
| 添加列 | `ADD [COLUMN] col type [AFTER col]` | `ADD [COLUMN] col type` | `ADD (col type)` |
| 修改列类型 | `MODIFY [COLUMN] col new_type` | `ALTER COLUMN col TYPE new_type` | `MODIFY (col new_type)` |
| 重命名列 | `CHANGE col old_name new_name type` | `RENAME COLUMN old_name TO new_name` | `RENAME COLUMN old_name TO new_name` |
| 删除列 | `DROP [COLUMN] col` | `DROP [COLUMN] col` | `DROP (col)` |
| 添加默认值 | `ALTER COLUMN col SET DEFAULT val` | `ALTER COLUMN col SET DEFAULT val` | `MODIFY (col DEFAULT val)` |
| 重命名表 | `RENAME TABLE old TO new` | `ALTER TABLE old RENAME TO new` | `RENAME old TO new` |

```sql
-- === MySQL ===
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email;
ALTER TABLE users MODIFY COLUMN phone VARCHAR(30);
ALTER TABLE users CHANGE COLUMN phone mobile VARCHAR(30);
ALTER TABLE users DROP COLUMN mobile;
ALTER TABLE users RENAME TO members;

-- === PostgreSQL ===
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(30);
ALTER TABLE users RENAME COLUMN phone TO mobile;
ALTER TABLE users DROP COLUMN mobile;
ALTER TABLE users RENAME TO members;

-- === Oracle ===
ALTER TABLE users ADD (phone VARCHAR2(20));
ALTER TABLE users MODIFY (phone VARCHAR2(30));
ALTER TABLE users RENAME COLUMN phone TO mobile;
ALTER TABLE users DROP (mobile);
ALTER TABLE users RENAME TO members;
```

### 1.4 约束操作

```sql
-- 添加主键（三者通用）
ALTER TABLE users ADD PRIMARY KEY (id);

-- 添加外键（三者通用）
ALTER TABLE orders ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

-- 添加唯一约束
ALTER TABLE users ADD CONSTRAINT uk_username UNIQUE (username);

-- 添加 CHECK 约束（三者通用）
ALTER TABLE users ADD CONSTRAINT chk_age CHECK (age >= 0 AND age <= 150);

-- 删除约束
ALTER TABLE users DROP INDEX uk_username;   -- MySQL（通过索引删）
ALTER TABLE users DROP CONSTRAINT uk_username;  -- PostgreSQL / Oracle
```

### 1.5 DROP / TRUNCATE

```sql
-- 删除表
DROP TABLE IF EXISTS users CASCADE;    -- MySQL 8+ / PostgreSQL
DROP TABLE users CASCADE CONSTRAINTS;  -- Oracle

-- 清空表
TRUNCATE TABLE users;          -- 三者通用
TRUNCATE TABLE users CASCADE;  -- PostgreSQL（级联清空关联表）
```

### 1.6 自增列/序列

```sql
-- MySQL: AUTO_INCREMENT
CREATE TABLE t (id BIGINT PRIMARY KEY AUTO_INCREMENT);
ALTER TABLE t AUTO_INCREMENT = 1000;  -- 重置起始值

-- PostgreSQL: SERIAL / IDENTITY
CREATE TABLE t (id BIGSERIAL PRIMARY KEY);
CREATE TABLE t (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY);
ALTER SEQUENCE t_id_seq RESTART WITH 1000;

-- Oracle: SEQUENCE
CREATE SEQUENCE t_seq START WITH 1 INCREMENT BY 1 CACHE 100;
SELECT t_seq.NEXTVAL FROM DUAL;
ALTER SEQUENCE t_seq RESTART START WITH 1000;  -- 12c+
-- 19c 支持 IDENTITY 语法
CREATE TABLE t (id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY);
```

---

## 二、DML 数据操作语言

### 2.1 INSERT

```sql
-- 单行插入（三者通用）
INSERT INTO users (username, email) VALUES ('alice', 'alice@example.com');

-- 多行插入
INSERT INTO users (username, email) VALUES       -- MySQL / PostgreSQL
  ('bob', 'bob@example.com'),
  ('carol', 'carol@example.com');

INSERT ALL                                       -- Oracle
  INTO users (username, email) VALUES ('bob', 'bob@example.com')
  INTO users (username, email) VALUES ('carol', 'carol@example.com')
SELECT * FROM DUAL;

-- 插入查询结果（三者通用）
INSERT INTO users_archive SELECT * FROM users WHERE created_at < '2023-01-01';
```

### 2.2 UPSERT（存在则更新）

```sql
-- === MySQL ===
INSERT INTO users (id, username, email)
VALUES (1, 'alice', 'new@example.com')
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  updated_at = NOW();

-- === PostgreSQL ===
INSERT INTO users (id, username, email)
VALUES (1, 'alice', 'new@example.com')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- === Oracle ===
MERGE INTO users u
USING (SELECT 1 AS id, 'alice' AS username, 'new@example.com' AS email FROM DUAL) s
ON (u.id = s.id)
WHEN MATCHED THEN UPDATE SET
  u.email = s.email,
  u.updated_at = SYSTIMESTAMP
WHEN NOT MATCHED THEN INSERT (id, username, email)
  VALUES (s.id, s.username, s.email);
```

### 2.3 UPDATE

```sql
-- 单表更新（三者通用）
UPDATE users SET email = 'new@example.com', updated_at = NOW() WHERE id = 1;

-- 关联更新
-- MySQL
UPDATE users u
JOIN orders o ON u.id = o.user_id
SET u.status = 2
WHERE o.created_at < '2023-01-01';

-- PostgreSQL
UPDATE users
SET status = 2
FROM orders
WHERE users.id = orders.user_id AND orders.created_at < '2023-01-01';

-- Oracle
UPDATE users u SET status = 2
WHERE EXISTS (SELECT 1 FROM orders o
  WHERE o.user_id = u.id AND o.created_at < DATE '2023-01-01');
```

### 2.4 DELETE

```sql
-- 单表删除（三者通用）
DELETE FROM users WHERE id = 1;

-- 关联删除
-- MySQL
DELETE u FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at < '2020-01-01';

-- PostgreSQL
DELETE FROM users
USING orders
WHERE users.id = orders.user_id AND orders.created_at < '2020-01-01';

-- Oracle
DELETE FROM users WHERE id IN (
  SELECT user_id FROM orders WHERE created_at < DATE '2020-01-01'
);
```

---

## 三、DQL 数据查询语言

### 3.1 SELECT 基本结构

```sql
SELECT [DISTINCT] column1, column2, ...
FROM table1
[JOIN table2 ON condition]
[WHERE condition]
[GROUP BY column1, column2]
[HAVING condition]
[ORDER BY column1 [ASC|DESC], column2 [ASC|DESC]]
[LIMIT n [OFFSET m]]           -- MySQL / PostgreSQL
[OFFSET m ROWS FETCH NEXT n ROWS ONLY]  -- SQL 标准（Oracle / PostgreSQL）
```

### 3.2 SELECT 子句内的子查询

```sql
-- 标量子查询（返回单值）
SELECT
  username,
  (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS order_count
FROM users;
```

### 3.3 WHERE 过滤

```sql
-- 比较
WHERE age > 18
WHERE age BETWEEN 18 AND 30
WHERE name IN ('alice', 'bob', 'carol')
WHERE name LIKE 'ali%'        -- 前缀匹配，可用索引
WHERE name LIKE '%ali%'       -- 模糊匹配，索引失效

-- NULL
WHERE email IS NULL
WHERE email IS NOT NULL

-- 逻辑
WHERE age > 18 AND status = 1
WHERE age > 18 OR status = 1
```

### 3.4 JOIN

```sql
-- INNER JOIN（三者通用）
SELECT u.*, o.order_no
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN（三者通用）
SELECT u.*, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- FULL OUTER JOIN
-- PostgreSQL / Oracle
SELECT u.*, o.order_no
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;
-- MySQL 不支持，用 UNION 模拟
SELECT u.*, o.order_no FROM users u LEFT JOIN orders o ON u.id = o.user_id
UNION
SELECT u.*, o.order_no FROM users u RIGHT JOIN orders o ON u.id = o.user_id;

-- CROSS JOIN（三者通用）
SELECT * FROM users CROSS JOIN departments;
```

### 3.5 聚合与分组

```sql
-- 聚合函数（三者通用）
SELECT
  COUNT(*),
  COUNT(DISTINCT user_id),
  SUM(amount),
  AVG(price),
  MAX(created_at),
  MIN(created_at)
FROM orders;

-- GROUP BY + HAVING
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_spent
FROM orders
GROUP BY user_id
HAVING COUNT(*) >= 5
ORDER BY total_spent DESC;
```

### 3.6 排序与分页

```sql
-- 排序（三者通用）
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM users ORDER BY status ASC, created_at DESC;

-- 分页
-- MySQL / PostgreSQL
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 0;    -- 第 1 页
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 20;   -- 第 2 页

-- Oracle (12c+)
SELECT * FROM users ORDER BY id OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;
SELECT * FROM users ORDER BY id OFFSET 20 ROWS FETCH NEXT 20 ROWS ONLY;

-- Oracle (12c 之前，用 ROWNUM 嵌套)
SELECT * FROM (
  SELECT t.*, ROWNUM AS rn FROM (
    SELECT * FROM users ORDER BY id
  ) t WHERE ROWNUM <= 40
) WHERE rn > 20;
```

### 3.7 子查询

```sql
-- WHERE IN（三者通用）
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);

-- EXISTS（三者通用）
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 派生表（FROM 子句中的子查询，三者通用）
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM orders
) WHERE rn <= 3;
```

### 3.8 CTE（公用表表达式）

```sql
-- 基本 CTE（MySQL 8+ / PostgreSQL / Oracle）
WITH dept_avg AS (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees GROUP BY department_id
)
SELECT e.name, e.salary, d.avg_salary
FROM employees e
JOIN dept_avg d ON e.department_id = d.department_id
WHERE e.salary > d.avg_salary;

-- 递归 CTE
WITH RECURSIVE org_tree AS (   -- MySQL / PostgreSQL 用 RECURSIVE
    -- 锚点
    SELECT id, name, manager_id, 1 AS level
    FROM employees WHERE manager_id IS NULL
    UNION ALL
    -- 递归
    SELECT e.id, e.name, e.manager_id, t.level + 1
    FROM employees e
    JOIN org_tree t ON e.manager_id = t.id
)
SELECT * FROM org_tree;

-- Oracle 还可以用 CONNECT BY
SELECT id, name, manager_id, LEVEL
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;
```

### 3.9 窗口函数

```sql
-- 排名
SELECT
  name, salary, department_id,
  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn,
  RANK()       OVER (PARTITION BY department_id ORDER BY salary DESC) AS rk,
  DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dr
FROM employees;

-- 聚合窗口
SELECT
  order_date, amount,
  SUM(amount)   OVER (ORDER BY order_date) AS running_total,
  SUM(amount)   OVER (PARTITION BY user_id) AS total_by_user,
  AVG(amount)   OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7d
FROM orders;

-- 偏移
SELECT
  order_date, amount,
  LAG(amount, 1)  OVER (ORDER BY order_date) AS prev_amount,
  LAG(amount, 7)  OVER (ORDER BY order_date) AS prev_7d,
  LEAD(amount, 1) OVER (ORDER BY order_date) AS next_amount
FROM orders;

-- 窗口帧（ROWS vs RANGE）
SUM(amount) OVER (ORDER BY order_date ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)
  -- ROWS：物理行数，前后各 1 行
SUM(amount) OVER (ORDER BY order_date RANGE BETWEEN INTERVAL '7' DAY PRECEDING AND CURRENT ROW)
  -- RANGE：逻辑范围，前后 7 天内的所有行
```

### 3.10 UNION / INTERSECT / EXCEPT

```sql
-- UNION（三者通用）
SELECT id, username FROM users_active
UNION           -- 去重
SELECT id, username FROM users_archived;

UNION ALL       -- 不去重，更快

-- INTERSECT / EXCEPT
-- PostgreSQL / Oracle 支持
SELECT id FROM users
INTERSECT SELECT user_id FROM orders;   -- 交集
SELECT id FROM users
EXCEPT SELECT user_id FROM orders;      -- 差集
-- MySQL 不支持，用子查询模拟
-- 交集: SELECT id FROM users WHERE id IN (SELECT user_id FROM orders)
-- 差集: SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM orders)
```

---

## 四、TCL 事务控制

```sql
START TRANSACTION;                    -- MySQL / PostgreSQL
-- 或
BEGIN;                                 -- PostgreSQL

SAVEPOINT sp1;                         -- 设置保存点（三者通用）
ROLLBACK TO SAVEPOINT sp1;             -- 回滚到保存点
COMMIT;                                -- 提交
ROLLBACK;                              -- 回滚

-- Oracle 不需要显式 START TRANSACTION，第一个 DML 自动开始事务
```

---

## 五、三大数据库语法差异速查表

| 功能 | MySQL | PostgreSQL | Oracle |
|------|-------|-----------|--------|
| 自增列 | `AUTO_INCREMENT` | `SERIAL` / `IDENTITY` | `SEQUENCE`（12c+ 支持 IDENTITY） |
| 字符串 | `VARCHAR(n)` / `TEXT` | `VARCHAR(n)` / `TEXT` | `VARCHAR2(n)` / `CLOB` |
| 字符串长度单位 | 字符 | 字符 | 字节（默认） |
| UPSERT | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT ... DO UPDATE` | `MERGE` |
| 分页 | `LIMIT n OFFSET m` | `LIMIT n OFFSET m` | `OFFSET m ROWS FETCH NEXT n ROWS ONLY` |
| 递归 CTE | `WITH RECURSIVE` | `WITH RECURSIVE` | `WITH ... CONNECT BY` / `WITH RECURSIVE` |
| FULL JOIN | 不支持（UNION 模拟） | 支持 | 支持 |
| INTERSECT / EXCEPT | 不支持 | 支持 | 支持 |
| DDL 事务 | 隐式提交 | 支持回滚 | 隐式提交 |
| BOOLEAN 类型 | `TINYINT` 模拟 | 原生 `BOOLEAN` | `NUMBER(1)` 模拟 |
| 函数索引 | `((expr))` 8.0+ | `(expr)` | `(expr)` |
| 部分索引 | 不支持 | 支持 `WHERE` | 不支持 |
| 只读事务 | 不支持 | `READ ONLY` | `READ ONLY` |

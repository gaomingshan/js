# 数据类型详解

## 概述

数据类型定义了列可以存储的数据种类和格式。选择合适的数据类型不仅影响存储空间，还直接关系到查询性能、索引效率和数据完整性。三大数据库在数据类型上既有共性也有差异。

**核心分类**：
- **数值类型**：整数、小数、浮点数
- **字符类型**：定长、变长、文本
- **日期时间类型**：日期、时间、时间戳
- **二进制类型**：BLOB、二进制数据
- **特殊类型**：JSON、XML、数组、枚举

---

## 数值类型

### 1. 整数类型

#### MySQL 整数类型

| 类型 | 字节 | 范围（有符号） | 范围（无符号） |
|------|------|----------------|----------------|
| TINYINT | 1 | -128 ~ 127 | 0 ~ 255 |
| SMALLINT | 2 | -32768 ~ 32767 | 0 ~ 65535 |
| MEDIUMINT | 3 | -8388608 ~ 8388607 | 0 ~ 16777215 |
| INT/INTEGER | 4 | -2147483648 ~ 2147483647 | 0 ~ 4294967295 |
| BIGINT | 8 | -2^63 ~ 2^63-1 | 0 ~ 2^64-1 |

```sql
-- 创建整数列
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    views BIGINT UNSIGNED DEFAULT 0
);

-- UNSIGNED：无符号，只存储非负数
-- ZEROFILL：零填充（已废弃，MySQL 8.0.17+）
```

#### Oracle 整数类型

Oracle 没有单独的整数类型，使用 NUMBER。

```sql
-- NUMBER(p,s)
-- p: 精度（总位数）
-- s: 小数位数

CREATE TABLE products (
    id NUMBER(10) PRIMARY KEY,      -- 10位整数
    stock NUMBER(8,0),               -- 8位整数
    price NUMBER(10,2)               -- 10位数，2位小数
);

-- 常用整数定义
id NUMBER(10)           -- 等同于 INT
id NUMBER(19)           -- 等同于 BIGINT
```

#### PostgreSQL 整数类型

| 类型 | 字节 | 范围 |
|------|------|------|
| SMALLINT | 2 | -32768 ~ 32767 |
| INTEGER | 4 | -2147483648 ~ 2147483647 |
| BIGINT | 8 | -2^63 ~ 2^63-1 |
| SERIAL | 4 | 自增整数（1 ~ 2^31-1） |
| BIGSERIAL | 8 | 自增长整数 |

```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,       -- 自增
    stock INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1
);
```

### 2. 小数类型

#### DECIMAL/NUMERIC - 精确小数

```sql
-- MySQL/PostgreSQL
DECIMAL(10,2)  -- 总共10位，2位小数
NUMERIC(10,2)  -- 等同于 DECIMAL

-- Oracle
NUMBER(10,2)

-- 示例
CREATE TABLE products (
    price DECIMAL(10,2) NOT NULL,    -- 最大 99999999.99
    tax_rate DECIMAL(5,4)             -- 最大 9.9999
);

-- 适用场景：货币、精确计算
-- 优点：精确，无舍入误差
-- 缺点：占用空间大，计算较慢
```

#### FLOAT/DOUBLE - 浮点数

```sql
-- MySQL
FLOAT       -- 4字节，单精度
DOUBLE      -- 8字节，双精度

-- PostgreSQL
REAL        -- 4字节，单精度
DOUBLE PRECISION  -- 8字节，双精度

-- Oracle
FLOAT
BINARY_FLOAT    -- 4字节
BINARY_DOUBLE   -- 8字节

-- 示例
CREATE TABLE measurements (
    latitude DOUBLE,
    longitude DOUBLE,
    temperature FLOAT
);

-- 适用场景：科学计算、非精确数值
-- 优点：占用空间小，计算快
-- 缺点：有舍入误差，不适合货币
```

**重要提示**：
```sql
-- 错误：使用浮点数存储货币
price FLOAT  -- 可能出现 0.01 的误差

-- 正确：使用 DECIMAL
price DECIMAL(10,2)
```

---

## 字符类型

### 1. 定长字符串 CHAR

```sql
-- 固定长度，不足时用空格填充
CHAR(10)  -- 总是占用10个字符的空间

-- MySQL
CREATE TABLE users (
    country_code CHAR(2),    -- 'CN', 'US'
    postal_code CHAR(6)      -- '100000'
);

-- 优点：查询效率高（定长）
-- 缺点：浪费空间
-- 适用：长度固定的字段（国家代码、邮编等）
```

### 2. 变长字符串 VARCHAR

```sql
-- 可变长度，按实际长度存储
VARCHAR(50)  -- 最多50个字符

-- MySQL
CREATE TABLE users (
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- Oracle
CREATE TABLE users (
    username VARCHAR2(50) NOT NULL,  -- Oracle 使用 VARCHAR2
    email VARCHAR2(100) NOT NULL
);

-- PostgreSQL
CREATE TABLE users (
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- 优点：节省空间
-- 缺点：查询可能略慢于 CHAR
-- 适用：长度不固定的字段
```

**VARCHAR 长度选择**：
```sql
-- 错误：过长的 VARCHAR
username VARCHAR(1000)  -- 浪费空间，索引效率低

-- 正确：根据业务合理设置
username VARCHAR(50)    -- 大多数用户名不超过50
email VARCHAR(100)      -- 邮箱地址通常不超过100
url VARCHAR(500)        -- URL 可能较长
```

### 3. 文本类型 TEXT/CLOB

#### MySQL TEXT 类型

| 类型 | 最大长度 | 说明 |
|------|----------|------|
| TINYTEXT | 255 字节 | 很少使用 |
| TEXT | 64 KB | 短文本 |
| MEDIUMTEXT | 16 MB | 中等文本 |
| LONGTEXT | 4 GB | 长文本 |

```sql
CREATE TABLE articles (
    title VARCHAR(200),
    summary TEXT,              -- 摘要
    content MEDIUMTEXT,        -- 正文
    metadata LONGTEXT          -- 大量数据
);

-- 注意：TEXT 类型不能有默认值
-- 注意：TEXT 索引需要指定前缀长度
CREATE INDEX idx_summary ON articles(summary(100));
```

#### Oracle CLOB

```sql
CREATE TABLE articles (
    title VARCHAR2(200),
    content CLOB               -- 最大 4 GB
);

-- CLOB: Character Large Object
-- NCLOB: National Character Large Object (Unicode)
```

#### PostgreSQL TEXT

```sql
CREATE TABLE articles (
    title VARCHAR(200),
    content TEXT               -- 无大小限制
);

-- PostgreSQL 的 TEXT 性能优于 VARCHAR
-- 推荐使用 TEXT 而非超长 VARCHAR
```

---

## 日期时间类型

### 1. DATE - 日期

```sql
-- MySQL
CREATE TABLE events (
    event_date DATE            -- YYYY-MM-DD
);

-- 范围：'1000-01-01' 到 '9999-12-31'
INSERT INTO events VALUES ('2024-03-16');

-- Oracle
CREATE TABLE events (
    event_date DATE            -- YYYY-MM-DD HH24:MI:SS
);

-- 注意：Oracle DATE 包含时间部分

-- PostgreSQL
CREATE TABLE events (
    event_date DATE            -- YYYY-MM-DD
);
```

### 2. TIME - 时间

```sql
-- MySQL
CREATE TABLE schedules (
    start_time TIME,           -- HH:MM:SS
    end_time TIME(3)           -- HH:MM:SS.SSS（毫秒）
);

-- PostgreSQL
CREATE TABLE schedules (
    start_time TIME,
    end_time TIME WITH TIME ZONE
);

-- Oracle 没有 TIME 类型，使用 DATE 或 TIMESTAMP
```

### 3. DATETIME/TIMESTAMP - 日期时间

#### MySQL

```sql
CREATE TABLE logs (
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- DATETIME:
-- - 范围：'1000-01-01 00:00:00' 到 '9999-12-31 23:59:59'
-- - 不受时区影响
-- - 占用 8 字节

-- TIMESTAMP:
-- - 范围：'1970-01-01 00:00:01' UTC 到 '2038-01-19 03:14:07' UTC
-- - 受时区影响
-- - 占用 4 字节
-- - 2038年问题
```

#### Oracle

```sql
CREATE TABLE logs (
    created_at DATE DEFAULT SYSDATE,
    updated_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- DATE: 精度到秒
-- TIMESTAMP: 精度到纳秒（9位小数）
-- TIMESTAMP WITH TIME ZONE: 包含时区信息
-- TIMESTAMP WITH LOCAL TIME ZONE: 自动转换时区
```

#### PostgreSQL

```sql
CREATE TABLE logs (
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TIMESTAMP: 不含时区
-- TIMESTAMP WITH TIME ZONE (TIMESTAMPTZ): 含时区（推荐）
```

**时区问题**：
```sql
-- 推荐：使用 UTC 存储，应用层转换显示时区
-- MySQL
SET time_zone = '+00:00';

-- PostgreSQL
SET TIME ZONE 'UTC';
```

### 4. YEAR - 年份（MySQL）

```sql
CREATE TABLE users (
    birth_year YEAR            -- YYYY, 范围：1901-2155
);

INSERT INTO users VALUES (2024);
```

---

## 二进制类型

### 1. BINARY/VARBINARY - 二进制字符串

```sql
-- MySQL
CREATE TABLE files (
    file_hash BINARY(32),      -- MD5: 16字节 * 2 = 32
    thumbnail VARBINARY(1000)
);

-- PostgreSQL
CREATE TABLE files (
    file_hash BYTEA
);
```

### 2. BLOB - 二进制大对象

#### MySQL BLOB

| 类型 | 最大长度 |
|------|----------|
| TINYBLOB | 255 字节 |
| BLOB | 64 KB |
| MEDIUMBLOB | 16 MB |
| LONGBLOB | 4 GB |

```sql
CREATE TABLE files (
    file_name VARCHAR(255),
    file_data MEDIUMBLOB       -- 存储文件内容
);

-- 注意：不推荐在数据库中存储大文件
-- 推荐：存储文件路径，文件放在对象存储
```

#### Oracle BLOB

```sql
CREATE TABLE files (
    file_name VARCHAR2(255),
    file_data BLOB             -- 最大 4 GB
);

-- BLOB: Binary Large Object
-- BFILE: 外部文件引用
```

#### PostgreSQL BYTEA

```sql
CREATE TABLE files (
    file_name VARCHAR(255),
    file_data BYTEA            -- 无大小限制
);
```

---

## 特殊类型

### 1. JSON 类型

#### MySQL JSON（5.7+）

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    metadata JSON
);

INSERT INTO users VALUES (
    1, 
    'alice', 
    '{"age": 25, "city": "Beijing", "tags": ["developer", "blogger"]}'
);

-- 查询 JSON 字段
SELECT 
    username,
    metadata->'$.age' AS age,
    metadata->'$.city' AS city
FROM users;

-- JSON 函数
SELECT JSON_EXTRACT(metadata, '$.age') FROM users;
SELECT JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.city')) FROM users;

-- 创建虚拟列索引
ALTER TABLE users ADD COLUMN age INT AS (metadata->'$.age');
CREATE INDEX idx_age ON users(age);
```

#### PostgreSQL JSON/JSONB

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    metadata JSON,             -- 存储为文本，每次解析
    settings JSONB             -- 二进制格式，支持索引（推荐）
);

-- 查询
SELECT 
    username,
    metadata->>'age' AS age,
    settings->'preferences'->>'theme' AS theme
FROM users;

-- JSONB 索引
CREATE INDEX idx_settings ON users USING GIN (settings);

-- 条件查询
SELECT * FROM users WHERE settings @> '{"vip": true}';
```

#### Oracle JSON（12c+）

```sql
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    username VARCHAR2(50),
    metadata CLOB CHECK (metadata IS JSON)
);

-- 查询
SELECT 
    username,
    JSON_VALUE(metadata, '$.age') AS age
FROM users;
```

### 2. XML 类型

```sql
-- MySQL
CREATE TABLE documents (
    id INT PRIMARY KEY,
    content TEXT,
    xml_data XML               -- MySQL 8.0+
);

-- PostgreSQL
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    xml_data XML
);

-- Oracle
CREATE TABLE documents (
    id NUMBER PRIMARY KEY,
    xml_data XMLTYPE
);
```

### 3. 枚举类型 ENUM（MySQL）

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled')
);

INSERT INTO orders VALUES (1, 'pending');

-- 优点：节省空间（内部存储为整数）
-- 缺点：修改枚举值需要 ALTER TABLE
-- 替代方案：使用 TINYINT + 应用层映射
```

### 4. 数组类型（PostgreSQL）

```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    tags TEXT[]                -- 文本数组
);

INSERT INTO articles VALUES (1, 'Hello', ARRAY['tech', 'tutorial']);

-- 查询
SELECT * FROM articles WHERE 'tech' = ANY(tags);
SELECT * FROM articles WHERE tags @> ARRAY['tech'];

-- 创建 GIN 索引
CREATE INDEX idx_tags ON articles USING GIN(tags);
```

### 5. 布尔类型

```sql
-- MySQL（没有真正的布尔类型）
CREATE TABLE users (
    is_active TINYINT(1),      -- 0 或 1
    is_verified BOOLEAN        -- 等同于 TINYINT(1)
);

-- PostgreSQL
CREATE TABLE users (
    is_active BOOLEAN,         -- TRUE, FALSE, NULL
    is_verified BOOL           -- 等同于 BOOLEAN
);

-- Oracle（没有布尔类型）
CREATE TABLE users (
    is_active NUMBER(1),       -- 0 或 1
    is_verified CHAR(1)        -- 'Y' 或 'N'
);
```

---

## 数据类型选择指南

### 1. 整数类型选择

```sql
-- 主键 ID
id BIGINT                      -- 推荐，避免溢出

-- 状态、类型
status TINYINT                 -- 值域小（0-255）

-- 计数器（可能很大）
view_count BIGINT UNSIGNED     -- 只需非负数

-- 金额（分）
amount BIGINT                  -- 避免小数，以分为单位
```

### 2. 字符类型选择

```sql
-- 固定长度
country_code CHAR(2)
postal_code CHAR(6)

-- 常规字符串
username VARCHAR(50)
email VARCHAR(100)
url VARCHAR(500)

-- 长文本
summary TEXT                   -- 摘要
content MEDIUMTEXT             -- 文章内容
```

### 3. 日期时间选择

```sql
-- 只需日期
birthday DATE

-- 需要时间
created_at DATETIME            -- MySQL，不受时区影响
created_at TIMESTAMP WITH TIME ZONE  -- PostgreSQL，推荐

-- 需要高精度
logged_at TIMESTAMP(6)         -- 微秒精度
```

### 4. 小数类型选择

```sql
-- 货币、精确计算
price DECIMAL(10,2)

-- 科学计算、非精确
temperature DOUBLE
```

---

## 易错点与边界

### 1. CHAR vs VARCHAR 陷阱

```sql
-- CHAR 会去除尾部空格
CREATE TABLE test (c CHAR(5));
INSERT INTO test VALUES ('ab   ');
SELECT c, LENGTH(c) FROM test;  -- 'ab', 2（空格被去除）

-- VARCHAR 保留空格
CREATE TABLE test (c VARCHAR(5));
INSERT INTO test VALUES ('ab   ');
SELECT c, LENGTH(c) FROM test;  -- 'ab   ', 5
```

### 2. TIMESTAMP 2038年问题（MySQL）

```sql
-- 错误：使用 TIMESTAMP 存储遥远未来的日期
expiry_date TIMESTAMP  -- 2038年后会溢出

-- 正确：使用 DATETIME
expiry_date DATETIME   -- 可到 9999年
```

### 3. DECIMAL 精度问题

```sql
-- 定义 DECIMAL(10,2)
-- 整数部分最多 8 位，小数部分 2 位

INSERT INTO products (price) VALUES (123456789.99);  -- 错误：超出范围
INSERT INTO products (price) VALUES (12345678.999);  -- 自动四舍五入为 12345678.00
```

### 4. JSON 性能问题

```sql
-- 错误：频繁查询 JSON 字段
SELECT * FROM users WHERE metadata->>'$.city' = 'Beijing';  -- 全表扫描

-- 正确：创建虚拟列和索引
ALTER TABLE users ADD COLUMN city VARCHAR(50) AS (metadata->>'$.city');
CREATE INDEX idx_city ON users(city);
```

---

## 生产实践示例

### 1. 电商订单表设计

```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    -- 金额以分为单位，避免小数
    total_amount BIGINT NOT NULL COMMENT '总金额（分）',
    discount_amount BIGINT NOT NULL DEFAULT 0 COMMENT '优惠金额（分）',
    final_amount BIGINT NOT NULL COMMENT '实付金额（分）',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '0:待付款,1:已付款,2:已发货,3:已完成,4:已取消',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    -- 使用 DATETIME 存储时间
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME DEFAULT NULL,
    shipped_at DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    -- 扩展字段使用 JSON
    extra_info JSON DEFAULT NULL COMMENT '扩展信息',
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
```

### 2. 用户表设计

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone CHAR(11) DEFAULT NULL COMMENT '手机号',
    avatar_url VARCHAR(500) DEFAULT NULL,
    gender TINYINT DEFAULT 0 COMMENT '0:未知,1:男,2:女',
    birthday DATE DEFAULT NULL,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1:正常,0:禁用',
    vip_level TINYINT NOT NULL DEFAULT 0 COMMENT 'VIP等级',
    balance BIGINT NOT NULL DEFAULT 0 COMMENT '余额（分）',
    -- JSON 存储扩展信息
    profile JSON DEFAULT NULL COMMENT '用户资料',
    settings JSON DEFAULT NULL COMMENT '用户设置',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME DEFAULT NULL,
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_phone (phone),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

---

## 三大数据库数据类型对比

| 用途 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| 整数 | INT, BIGINT | NUMBER(10,0) | INTEGER, BIGINT |
| 小数 | DECIMAL(10,2) | NUMBER(10,2) | DECIMAL(10,2) |
| 字符串 | VARCHAR(50) | VARCHAR2(50) | VARCHAR(50) |
| 文本 | TEXT, MEDIUMTEXT | CLOB | TEXT |
| 日期 | DATE | DATE | DATE |
| 时间 | TIME | - | TIME |
| 日期时间 | DATETIME | TIMESTAMP | TIMESTAMP |
| 二进制 | BLOB | BLOB | BYTEA |
| JSON | JSON | CLOB (IS JSON) | JSON, JSONB |
| 布尔 | TINYINT(1) | NUMBER(1) | BOOLEAN |
| 数组 | - | - | ARRAY |

---

## 参考资料

1. **MySQL 官方文档**：
   - Data Types: https://dev.mysql.com/doc/refman/8.0/en/data-types.html
   - JSON Functions: https://dev.mysql.com/doc/refman/8.0/en/json-functions.html

2. **Oracle 官方文档**：
   - Data Types: https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Data-Types.html

3. **PostgreSQL 官方文档**：
   - Data Types: https://www.postgresql.org/docs/current/datatype.html
   - JSON Types: https://www.postgresql.org/docs/current/datatype-json.html

4. **最佳实践**：
   - 选择最小满足需求的类型
   - 金额使用整数（分）或 DECIMAL
   - 优先使用 UTF8MB4 字符集
   - 避免在数据库存储大文件
   - 合理使用 JSON 类型，注意索引

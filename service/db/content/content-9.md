# 字符集与排序规则

## 概述

字符集（Character Set）定义了数据库能存储哪些字符，排序规则（Collation）定义了字符的比较和排序方式。正确配置字符集和排序规则对于支持多语言、避免乱码、确保查询正确性至关重要。

**核心概念**：
- **字符集**：字符到二进制编码的映射
- **排序规则**：字符的比较、排序和匹配规则
- **多级配置**：服务器、数据库、表、列级别
- **常见问题**：乱码、大小写敏感、性能影响

---

## 核心概念

### 1. 字符集基础

#### 常见字符集

| 字符集 | 说明 | 字节数 | 支持语言 |
|--------|------|--------|----------|
| ASCII | 基础ASCII | 1 | 英文 |
| Latin1 | 西欧字符 | 1 | 西欧语言 |
| GBK | 简体中文 | 1-2 | 简体中文、英文 |
| UTF-8 | Unicode | 1-4 | 全球所有语言 |
| UTF8MB4 | MySQL 完整UTF-8 | 1-4 | 全球所有语言+Emoji |
| UTF-16 | Unicode | 2-4 | 全球所有语言 |

#### UTF-8 vs UTF8MB4（MySQL）

**UTF-8**：
- MySQL 的 `utf8` 是"伪 UTF-8"，最多3字节
- 不支持 Emoji、生僻字等4字节字符

**UTF8MB4**：
- MySQL 5.5.3+ 引入，真正的 UTF-8
- 最多4字节，支持所有 Unicode 字符
- **推荐使用**

```sql
-- 错误：使用 utf8
CREATE DATABASE mydb CHARACTER SET utf8;

-- 正确：使用 utf8mb4
CREATE DATABASE mydb CHARACTER SET utf8mb4;
```

### 2. 排序规则基础

排序规则控制字符的比较方式。

#### 命名规则

```
<字符集>_<语言>_<类型>
```

**示例**：
- `utf8mb4_general_ci`：通用、不区分大小写
- `utf8mb4_unicode_ci`：Unicode标准、不区分大小写
- `utf8mb4_bin`：二进制比较、区分大小写
- `utf8mb4_zh_0900_as_cs`：中文、区分重音和大小写

#### CI vs CS vs BIN

| 类型 | 说明 | 示例 |
|------|------|------|
| CI (Case Insensitive) | 不区分大小写 | 'A' = 'a' |
| CS (Case Sensitive) | 区分大小写 | 'A' != 'a' |
| BIN (Binary) | 二进制比较 | 按字节值比较 |
| AI (Accent Insensitive) | 不区分重音 | 'é' = 'e' |
| AS (Accent Sensitive) | 区分重音 | 'é' != 'e' |

---

## MySQL 字符集与排序规则

### 1. 查看字符集和排序规则

```sql
-- 查看支持的字符集
SHOW CHARACTER SET;
SHOW CHARACTER SET LIKE 'utf8%';

-- 查看支持的排序规则
SHOW COLLATION;
SHOW COLLATION LIKE 'utf8mb4%';

-- 查看当前设置
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- 查看数据库字符集
SELECT 
    SCHEMA_NAME,
    DEFAULT_CHARACTER_SET_NAME,
    DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA;

-- 查看表字符集
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'mydb';

-- 查看列字符集
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'mydb' AND CHARACTER_SET_NAME IS NOT NULL;
```

### 2. 设置字符集和排序规则

#### 服务器级别

```ini
# my.cnf / my.ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

[client]
default-character-set=utf8mb4
```

#### 数据库级别

```sql
-- 创建数据库时指定
CREATE DATABASE mydb
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 修改已存在的数据库
ALTER DATABASE mydb
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

#### 表级别

```sql
-- 创建表时指定
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改表
ALTER TABLE users
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 注意：只影响新列，不影响已有列
```

#### 列级别

```sql
-- 创建表时指定列字符集
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
);

-- 修改列字符集
ALTER TABLE users
MODIFY COLUMN username VARCHAR(50)
CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
```

#### 连接字符集

```sql
-- 设置客户端连接字符集
SET NAMES utf8mb4;

-- 等价于
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- 指定排序规则
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 字符集转换

```sql
-- 转换表和所有列的字符集
ALTER TABLE users
CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 只转换特定列
ALTER TABLE users
MODIFY COLUMN username VARCHAR(50)
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 排序规则在查询中的应用

```sql
-- 使用表的默认排序规则
SELECT * FROM users WHERE username = 'Alice';

-- 临时指定排序规则（不区分大小写）
SELECT * FROM users 
WHERE username COLLATE utf8mb4_general_ci = 'alice';

-- 临时指定排序规则（区分大小写）
SELECT * FROM users 
WHERE username COLLATE utf8mb4_bin = 'Alice';

-- 排序时指定排序规则
SELECT * FROM users 
ORDER BY username COLLATE utf8mb4_unicode_ci;
```

---

## Oracle 字符集与排序规则

### 1. Oracle 字符集

Oracle 在数据库创建时设置字符集，之后修改较复杂。

#### 常用字符集

| 字符集 | 说明 |
|--------|------|
| US7ASCII | 7位ASCII |
| WE8ISO8859P1 | 西欧Latin-1 |
| ZHS16GBK | 简体中文GBK |
| AL32UTF8 | Unicode UTF-8（推荐） |
| UTF8 | Oracle的UTF-8（最多3字节） |

**注意**：Oracle 的 `AL32UTF8` 才是真正的 UTF-8，`UTF8` 是旧版本。

#### 查看字符集

```sql
-- 查看数据库字符集
SELECT * FROM nls_database_parameters 
WHERE parameter IN ('NLS_CHARACTERSET', 'NLS_NCHAR_CHARACTERSET');

-- 查看会话字符集
SELECT * FROM nls_session_parameters
WHERE parameter LIKE 'NLS%';

-- 查看实例字符集
SELECT * FROM nls_instance_parameters;
```

#### 设置会话字符集

```sql
-- 设置会话NLS参数
ALTER SESSION SET NLS_LANGUAGE = 'SIMPLIFIED CHINESE';
ALTER SESSION SET NLS_TERRITORY = 'CHINA';
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD';
ALTER SESSION SET NLS_SORT = 'BINARY';
ALTER SESSION SET NLS_COMP = 'BINARY';
```

### 2. Oracle 排序规则（NLS_SORT）

```sql
-- 二进制排序（默认，区分大小写）
ALTER SESSION SET NLS_SORT = BINARY;

-- 语言排序（不区分大小写）
ALTER SESSION SET NLS_SORT = BINARY_CI;

-- 简体中文排序
ALTER SESSION SET NLS_SORT = SCHINESE_PINYIN_M;

-- 查询时指定排序
SELECT * FROM users 
ORDER BY NLSSORT(username, 'NLS_SORT=BINARY_CI');
```

### 3. Oracle 字符集转换

修改数据库字符集需要使用 DMU（Database Migration Utility）或导出/导入。

```sql
-- 查看字符集转换是否安全
SELECT * FROM v$nls_valid_values WHERE parameter = 'CHARACTERSET';

-- 使用 CSSCAN 扫描
-- 需要使用 Oracle 工具，不是 SQL 命令
```

---

## PostgreSQL 字符集与排序规则

### 1. PostgreSQL 字符集

#### 常用字符集

- **UTF8**：Unicode UTF-8（推荐）
- **LATIN1**：ISO-8859-1西欧
- **GBK**：简体中文
- **SQL_ASCII**：不验证编码

#### 查看字符集

```sql
-- 查看数据库字符集
SELECT 
    datname,
    pg_encoding_to_char(encoding) AS encoding,
    datcollate,
    datctype
FROM pg_database;

-- 查看服务器字符集
SHOW server_encoding;

-- 查看客户端字符集
SHOW client_encoding;
```

#### 设置字符集

```sql
-- 创建数据库时指定
CREATE DATABASE mydb
WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'zh_CN.UTF-8'
    LC_CTYPE = 'zh_CN.UTF-8'
    TEMPLATE = template0;

-- 设置客户端字符集
SET client_encoding = 'UTF8';
```

### 2. PostgreSQL 排序规则

#### Locale 设置

```sql
-- 查看可用的 locale
SELECT * FROM pg_collation;

-- 创建数据库时指定 locale
CREATE DATABASE mydb
WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'zh_CN.UTF-8'
    LC_CTYPE = 'zh_CN.UTF-8';

-- 查询时指定排序规则
SELECT * FROM users 
ORDER BY username COLLATE "zh_CN.UTF-8";

-- 不区分大小写比较
SELECT * FROM users 
WHERE LOWER(username) = LOWER('Alice');
```

#### 创建自定义排序规则

```sql
-- PostgreSQL 13+ 支持
CREATE COLLATION case_insensitive (
    provider = icu,
    locale = 'und-u-ks-level2',
    deterministic = false
);

-- 使用自定义排序规则
SELECT * FROM users 
WHERE username COLLATE case_insensitive = 'alice';
```

---

## 易错点与边界

### 1. MySQL 乱码问题

**原因**：字符集设置不一致

```sql
-- 检查字符集设置
SHOW VARIABLES LIKE 'character_set%';

-- 常见问题：
-- character_set_client    : utf8mb4  (客户端)
-- character_set_connection: latin1   (连接) ← 不一致导致乱码
-- character_set_results   : utf8mb4  (结果)

-- 解决方案
SET NAMES utf8mb4;
```

### 2. Emoji 存储失败

```sql
-- 错误：使用 utf8
CREATE TABLE posts (
    content TEXT CHARACTER SET utf8
);

INSERT INTO posts VALUES ('Hello 😀');  -- ERROR

-- 正确：使用 utf8mb4
CREATE TABLE posts (
    content TEXT CHARACTER SET utf8mb4
);

INSERT INTO posts VALUES ('Hello 😀');  -- OK
```

### 3. 大小写敏感问题

```sql
-- 默认不区分大小写
CREATE TABLE users (
    username VARCHAR(50) COLLATE utf8mb4_general_ci
);

INSERT INTO users VALUES ('Alice');

SELECT * FROM users WHERE username = 'alice';  -- 找到
SELECT * FROM users WHERE username = 'ALICE';  -- 找到

-- 区分大小写
CREATE TABLE users (
    username VARCHAR(50) COLLATE utf8mb4_bin
);

INSERT INTO users VALUES ('Alice');

SELECT * FROM users WHERE username = 'alice';  -- 找不到
SELECT * FROM users WHERE username = 'Alice';  -- 找到
```

### 4. 索引长度限制

```sql
-- utf8mb4 字符最多4字节
CREATE TABLE users (
    email VARCHAR(255) CHARACTER SET utf8mb4
);

-- 索引长度限制（InnoDB 最大767字节）
CREATE INDEX idx_email ON users(email);  -- 可能失败

-- 解决方案1：限制索引长度
CREATE INDEX idx_email ON users(email(191));  -- 191*4=764字节

-- 解决方案2：启用大前缀索引（MySQL 5.7+）
SET GLOBAL innodb_large_prefix = 1;
SET GLOBAL innodb_file_format = Barracuda;

ALTER TABLE users ROW_FORMAT=DYNAMIC;
CREATE INDEX idx_email ON users(email);
```

### 5. 排序规则性能影响

```sql
-- utf8mb4_unicode_ci：符合Unicode标准，但性能较差
-- utf8mb4_general_ci：性能好，但排序不够精确
-- utf8mb4_bin：性能最好，但区分大小写

-- 性能对比（相对）
-- utf8mb4_bin: 1.0x
-- utf8mb4_general_ci: 1.2x
-- utf8mb4_unicode_ci: 2.0x

-- 建议：
-- - 需要精确排序：utf8mb4_unicode_ci
-- - 性能优先且不需要精确排序：utf8mb4_general_ci
-- - 区分大小写：utf8mb4_bin
```

---

## 生产实践示例

### 1. 标准数据库初始化

```sql
-- MySQL 标准字符集配置
CREATE DATABASE myapp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE myapp;

-- 创建表时明确指定
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL COLLATE utf8mb4_bin,  -- 区分大小写
    email VARCHAR(100) NOT NULL COLLATE utf8mb4_general_ci,  -- 不区分大小写
    nickname VARCHAR(50) COLLATE utf8mb4_unicode_ci,  -- Unicode标准排序
    bio TEXT CHARACTER SET utf8mb4  -- 支持Emoji
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. 字符集迁移脚本

```sql
-- 备份数据库
-- mysqldump -u root -p --default-character-set=utf8mb4 mydb > mydb_backup.sql

-- 转换数据库字符集
ALTER DATABASE mydb 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 转换所有表
SELECT CONCAT(
    'ALTER TABLE `', TABLE_NAME, '` ',
    'CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
)
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'mydb' AND TABLE_TYPE = 'BASE TABLE';

-- 执行生成的语句
```

### 3. 连接配置（应用层）

**JDBC（Java）**：
```
jdbc:mysql://localhost:3306/mydb?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=UTC
```

**Python（pymysql）**：
```python
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='password',
    database='mydb',
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)
```

**Node.js（mysql2）**：
```javascript
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mydb',
    charset: 'utf8mb4'
});
```

### 4. 字符集检查脚本

```sql
-- 检查数据库配置
SELECT 
    '数据库' AS level,
    SCHEMA_NAME AS name,
    DEFAULT_CHARACTER_SET_NAME AS charset,
    DEFAULT_COLLATION_NAME AS collation
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'mydb'

UNION ALL

-- 检查表配置
SELECT 
    '表' AS level,
    TABLE_NAME AS name,
    TABLE_COLLATION AS charset,
    TABLE_COLLATION AS collation
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'mydb' AND TABLE_TYPE = 'BASE TABLE'

UNION ALL

-- 检查列配置
SELECT 
    '列' AS level,
    CONCAT(TABLE_NAME, '.', COLUMN_NAME) AS name,
    CHARACTER_SET_NAME AS charset,
    COLLATION_NAME AS collation
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'mydb' 
    AND CHARACTER_SET_NAME IS NOT NULL
    AND (CHARACTER_SET_NAME != 'utf8mb4' 
        OR COLLATION_NAME NOT LIKE 'utf8mb4%');
```

---

## 三大数据库字符集对比

| 特性 | MySQL | Oracle | PostgreSQL |
|------|-------|--------|------------|
| 推荐字符集 | utf8mb4 | AL32UTF8 | UTF8 |
| 伪UTF-8 | utf8（3字节） | UTF8（3字节） | 无 |
| 动态修改 | 较容易 | 很困难 | 较容易 |
| 列级字符集 | ✓ | ✗ | ✗ |
| 排序规则 | Collation | NLS_SORT | Locale/Collation |
| 大小写敏感控制 | 简单（_ci/_cs） | NLS_COMP | LOWER()或自定义 |

---

## 最佳实践

### 1. 统一使用 UTF-8

- **MySQL**：`utf8mb4`
- **Oracle**：`AL32UTF8`
- **PostgreSQL**：`UTF8`

### 2. 明确指定字符集

```sql
-- 在创建时明确指定，不依赖默认值
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE users (...) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 连接时设置字符集

```sql
-- 每次连接后设置
SET NAMES utf8mb4;
```

### 4. 区分场景选择排序规则

- **用户名、密码**：`utf8mb4_bin`（区分大小写）
- **邮箱**：`utf8mb4_general_ci`（不区分大小写）
- **中文内容**：`utf8mb4_unicode_ci`（Unicode标准）

### 5. 定期检查和审计

```sql
-- 检查是否有非标准字符集的表或列
-- 及时发现配置错误
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Character Sets and Collations: https://dev.mysql.com/doc/refman/8.0/en/charset.html
   - utf8mb4: https://dev.mysql.com/doc/refman/8.0/en/charset-unicode-utf8mb4.html

2. **Oracle 官方文档**：
   - Globalization Support: https://docs.oracle.com/en/database/oracle/oracle-database/19/nlspg/

3. **PostgreSQL 官方文档**：
   - Character Set Support: https://www.postgresql.org/docs/current/multibyte.html
   - Collation Support: https://www.postgresql.org/docs/current/collation.html

4. **Unicode 标准**：
   - Unicode.org: https://www.unicode.org/

5. **排错指南**：
   - 乱码问题排查：检查服务器、数据库、表、列、连接的字符集一致性
   - Emoji 存储：必须使用 utf8mb4 或 AL32UTF8
   - 大小写问题：明确业务需求，选择合适的排序规则

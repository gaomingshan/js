# 索引机制概览

## 概述

索引是数据库中最重要的性能优化手段。合理的索引设计可以将查询性能提升数十倍甚至数百倍，而不恰当的索引则可能拖累系统性能。理解索引的类型、原理和使用场景是数据库优化的基础。

**核心概念**：
- **索引**：帮助数据库快速定位数据的数据结构
- **类似书籍目录**：通过索引快速找到数据位置
- **空间换时间**：用存储空间换取查询速度
- **维护成本**：写入时需要更新索引

---

## 索引的作用

### 1. 加速查询

```sql
-- 无索引：全表扫描
SELECT * FROM users WHERE username = 'alice';
-- 扫描 100万行，耗时 1000ms

-- 有索引：索引查找
CREATE INDEX idx_username ON users(username);
SELECT * FROM users WHERE username = 'alice';
-- 通过索引直接定位，耗时 5ms
```

### 2. 排序优化

```sql
-- 无索引：需要排序操作（Using filesort）
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 有索引：利用索引顺序，无需排序
CREATE INDEX idx_created_at ON users(created_at);
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

### 3. 分组优化

```sql
-- 索引可以优化 GROUP BY
CREATE INDEX idx_city ON users(city);
SELECT city, COUNT(*) FROM users GROUP BY city;
```

### 4. 避免回表

```sql
-- 覆盖索引：查询字段都在索引中，无需回表
CREATE INDEX idx_username_email ON users(username, email);
SELECT username, email FROM users WHERE username = 'alice';
-- Using index（无需访问表数据）
```

---

## B+Tree 索引

最常用的索引类型，适用于大部分场景。

### 1. B+Tree 特点

```
- 多路平衡搜索树
- 叶子节点存储数据或指针
- 非叶子节点只存储索引
- 叶子节点之间有链表
- 查询、插入、删除时间复杂度 O(log n)
```

### 2. 适用场景

```sql
-- 精确查询
SELECT * FROM users WHERE id = 100;

-- 范围查询
SELECT * FROM users WHERE age BETWEEN 18 AND 30;

-- 前缀匹配
SELECT * FROM users WHERE username LIKE 'alice%';

-- 排序
SELECT * FROM users ORDER BY created_at DESC;
```

### 3. 创建 B+Tree 索引

**MySQL**：
```sql
-- 单列索引
CREATE INDEX idx_username ON users(username);

-- 联合索引
CREATE INDEX idx_city_age ON users(city, age);

-- 唯一索引
CREATE UNIQUE INDEX uk_email ON users(email);

-- 主键索引（自动创建）
CREATE TABLE users (
    id BIGINT PRIMARY KEY  -- 自动创建聚簇索引
);
```

**Oracle**：
```sql
-- 标准索引
CREATE INDEX idx_username ON users(username);

-- 唯一索引
CREATE UNIQUE INDEX uk_email ON users(email);

-- 复合索引
CREATE INDEX idx_city_age ON users(city, age);

-- 降序索引
CREATE INDEX idx_salary_desc ON employees(salary DESC);
```

**PostgreSQL**：
```sql
-- 标准索引（默认 B-tree）
CREATE INDEX idx_username ON users(username);

-- 指定索引方法
CREATE INDEX idx_username ON users USING BTREE (username);

-- 并发创建索引（不锁表）
CREATE INDEX CONCURRENTLY idx_username ON users(username);
```

---

## Hash 索引

基于哈希表的索引，适合等值查询。

### 1. Hash 索引特点

```
- 基于哈希函数
- 只能用于等值查询（=）
- 不支持范围查询
- 不支持排序
- 查询速度极快 O(1)
```

### 2. 适用场景

```sql
-- 等值查询
SELECT * FROM users WHERE id = 100;

-- 不适用：范围查询
SELECT * FROM users WHERE id > 100;  -- 无法使用 Hash 索引

-- 不适用：排序
SELECT * FROM users ORDER BY id;  -- 无法使用 Hash 索引

-- 不适用：前缀匹配
SELECT * FROM users WHERE username LIKE 'alice%';  -- 无法使用 Hash 索引
```

### 3. 创建 Hash 索引

**MySQL**：
```sql
-- Memory 引擎默认使用 Hash 索引
CREATE TABLE cache (
    id INT PRIMARY KEY,
    data VARCHAR(100),
    KEY (data) USING HASH
) ENGINE=MEMORY;

-- InnoDB 不支持显式 Hash 索引
-- InnoDB 有自适应哈希索引（Adaptive Hash Index）
```

**PostgreSQL**：
```sql
-- 创建 Hash 索引
CREATE INDEX idx_user_id ON sessions USING HASH (user_id);

-- 适合：等值查询
SELECT * FROM sessions WHERE user_id = 100;
```

**Oracle**：
```sql
-- Oracle 使用 Hash 集群表
CREATE CLUSTER user_cluster (user_id NUMBER) HASHKEYS 1000;

CREATE TABLE users (
    user_id NUMBER,
    username VARCHAR2(50)
) CLUSTER user_cluster (user_id);
```

---

## 位图索引（Bitmap Index）

适用于低基数列的索引。

### 1. 位图索引特点

```
- 使用位图（bitmap）存储
- 适合低基数列（重复值多）
- 占用空间小
- 适合数据仓库（OLAP）
- 不适合高并发写入（OLTP）
```

### 2. 适用场景

```sql
-- 低基数列：性别、状态、类型等
gender: 男/女/未知 (3种值)
status: 正常/禁用 (2种值)
vip_level: 0-10 (11种值)

-- 不适用：高基数列
user_id: 唯一值
email: 几乎唯一值
```

### 3. 创建位图索引

**Oracle**：
```sql
-- 创建位图索引
CREATE BITMAP INDEX idx_gender ON users(gender);
CREATE BITMAP INDEX idx_status ON users(status);
CREATE BITMAP INDEX idx_vip_level ON users(vip_level);

-- 适合：低基数列查询
SELECT * FROM users WHERE gender = 'M' AND status = 1;

-- 位图索引可以高效组合多个条件
```

**MySQL/PostgreSQL**：
- 不直接支持位图索引
- PostgreSQL 可以在内存中动态生成位图

---

## 全文索引（Full-Text Index）

用于文本搜索的特殊索引。

### 1. 全文索引特点

```
- 用于文本搜索
- 支持自然语言搜索
- 支持布尔搜索
- 分词、停用词处理
```

### 2. 创建全文索引

**MySQL**：
```sql
-- 创建全文索引
CREATE TABLE articles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200),
    content TEXT,
    FULLTEXT INDEX ft_title_content (title, content)
) ENGINE=InnoDB;

-- 使用全文索引查询
SELECT * FROM articles 
WHERE MATCH(title, content) AGAINST('数据库索引' IN NATURAL LANGUAGE MODE);

-- 布尔搜索
SELECT * FROM articles 
WHERE MATCH(title, content) AGAINST('+MySQL -Oracle' IN BOOLEAN MODE);

-- 查询扩展
SELECT * FROM articles 
WHERE MATCH(title, content) AGAINST('索引' WITH QUERY EXPANSION);
```

**PostgreSQL**：
```sql
-- 使用 tsvector 和 tsquery
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    tsv tsvector
);

-- 创建 GIN 索引
CREATE INDEX idx_tsv ON articles USING GIN(tsv);

-- 更新 tsvector
UPDATE articles SET tsv = to_tsvector('english', title || ' ' || content);

-- 搜索
SELECT * FROM articles 
WHERE tsv @@ to_tsquery('english', 'database & index');
```

**Oracle**：
```sql
-- 使用 Oracle Text
CREATE INDEX idx_content ON articles(content) 
INDEXTYPE IS CTXSYS.CONTEXT;

-- 搜索
SELECT * FROM articles 
WHERE CONTAINS(content, 'database AND index') > 0;
```

---

## 函数索引/表达式索引

对表达式或函数结果创建索引。

### 1. 函数索引特点

```
- 对函数或表达式的结果建立索引
- 适用于经常使用函数查询的场景
- 需要确保查询使用相同的函数
```

### 2. 创建函数索引

**MySQL**：
```sql
-- MySQL 8.0+ 支持函数索引
CREATE INDEX idx_upper_username ON users((UPPER(username)));

-- 使用索引
SELECT * FROM users WHERE UPPER(username) = 'ALICE';

-- 虚拟列索引（另一种方式）
ALTER TABLE users ADD COLUMN username_upper VARCHAR(50) AS (UPPER(username));
CREATE INDEX idx_username_upper ON users(username_upper);
```

**Oracle**：
```sql
-- 函数索引
CREATE INDEX idx_upper_username ON users(UPPER(username));

-- 使用索引
SELECT * FROM users WHERE UPPER(username) = 'ALICE';

-- 表达式索引
CREATE INDEX idx_year_month ON orders(EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at));
```

**PostgreSQL**：
```sql
-- 表达式索引
CREATE INDEX idx_lower_email ON users(LOWER(email));

-- 使用索引
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- 复杂表达式
CREATE INDEX idx_full_name ON users((first_name || ' ' || last_name));
```

---

## 部分索引/过滤索引

只对表中部分数据创建索引。

### 1. 部分索引特点

```
- 只索引满足条件的行
- 减少索引大小
- 提高索引效率
- 适用于只查询部分数据的场景
```

### 2. 创建部分索引

**PostgreSQL**：
```sql
-- 部分索引
CREATE INDEX idx_active_users ON users(username) WHERE status = 1;

-- 只对活跃用户创建索引
SELECT * FROM users WHERE username = 'alice' AND status = 1;
-- 使用部分索引

-- 示例：只索引未删除的数据
CREATE INDEX idx_articles_title ON articles(title) WHERE deleted_at IS NULL;
```

**MySQL**：
- 不直接支持部分索引
- 可以使用虚拟列变通实现

**Oracle**：
```sql
-- Oracle 不直接支持部分索引
-- 可以使用函数索引变通实现
CREATE INDEX idx_active_users ON users(CASE WHEN status = 1 THEN username END);
```

---

## 空间索引（Spatial Index）

用于地理空间数据的索引。

### 1. 空间索引特点

```
- 用于 GIS 数据
- 支持空间查询（距离、包含、相交等）
- 使用 R-Tree 数据结构
```

### 2. 创建空间索引

**MySQL**：
```sql
-- 创建空间索引
CREATE TABLE locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    location POINT NOT NULL,
    SPATIAL INDEX idx_location (location)
) ENGINE=InnoDB;

-- 插入数据
INSERT INTO locations (name, location) 
VALUES ('北京', ST_GeomFromText('POINT(116.4074 39.9042)'));

-- 空间查询
SELECT name FROM locations 
WHERE ST_Distance_Sphere(location, ST_GeomFromText('POINT(116.4 39.9)')) < 1000;
```

**PostgreSQL (PostGIS)**：
```sql
-- 安装 PostGIS 扩展
CREATE EXTENSION postgis;

-- 创建表
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    location GEOMETRY(Point, 4326)
);

-- 创建空间索引
CREATE INDEX idx_location ON locations USING GIST(location);

-- 空间查询
SELECT name FROM locations 
WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(116.4, 39.9), 4326), 1000);
```

---

## 索引类型对比

| 索引类型 | 适用场景 | 优点 | 缺点 | 数据库支持 |
|---------|---------|------|------|-----------|
| B+Tree | 通用 | 支持范围、排序 | 占用空间 | MySQL/Oracle/PG |
| Hash | 等值查询 | 速度极快 | 不支持范围 | Memory/PG |
| Bitmap | 低基数列 | 空间小、组合高效 | 不适合OLTP | Oracle |
| Full-Text | 文本搜索 | 自然语言搜索 | 占用空间大 | MySQL/Oracle/PG |
| Spatial | GIS数据 | 空间查询 | 专用场景 | MySQL/PG |
| Function | 函数查询 | 优化函数查询 | 维护成本 | MySQL8+/Oracle/PG |
| Partial | 部分数据 | 减少索引大小 | 有限制 | PostgreSQL |

---

## 索引命名规范

```sql
-- 单列索引：idx_<表名>_<列名>
CREATE INDEX idx_users_username ON users(username);

-- 联合索引：idx_<表名>_<列名1>_<列名2>
CREATE INDEX idx_users_city_age ON users(city, age);

-- 唯一索引：uk_<表名>_<列名>
CREATE UNIQUE INDEX uk_users_email ON users(email);

-- 全文索引：ft_<表名>_<列名>
CREATE FULLTEXT INDEX ft_articles_content ON articles(content);

-- 空间索引：sp_<表名>_<列名>
CREATE SPATIAL INDEX sp_locations_point ON locations(point);
```

---

## 索引查看

### MySQL

```sql
-- 查看表的索引
SHOW INDEX FROM users;

-- 查看索引统计信息
SHOW INDEX FROM users;

-- 查看索引使用情况
SELECT * FROM sys.schema_unused_indexes;
```

### Oracle

```sql
-- 查看用户索引
SELECT index_name, table_name, uniqueness 
FROM user_indexes 
WHERE table_name = 'USERS';

-- 查看索引列
SELECT index_name, column_name, column_position
FROM user_ind_columns
WHERE table_name = 'USERS'
ORDER BY index_name, column_position;
```

### PostgreSQL

```sql
-- 查看表的索引
\d users

-- 查看索引定义
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'users';

-- 查看索引大小
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public';
```

---

## 索引使用原则

### 1. 适合创建索引的场景

```sql
-- WHERE 条件频繁使用的列
CREATE INDEX idx_status ON users(status);
SELECT * FROM users WHERE status = 1;

-- ORDER BY 排序的列
CREATE INDEX idx_created_at ON orders(created_at);
SELECT * FROM orders ORDER BY created_at DESC;

-- JOIN 连接的列
CREATE INDEX idx_user_id ON orders(user_id);
SELECT * FROM orders o JOIN users u ON o.user_id = u.id;

-- GROUP BY 分组的列
CREATE INDEX idx_city ON users(city);
SELECT city, COUNT(*) FROM users GROUP BY city;
```

### 2. 不适合创建索引的场景

```sql
-- 小表（几百行）
-- 全表扫描更快

-- 重复值很多的列（除非位图索引）
-- 如：性别（只有男/女）

-- 频繁更新的列
-- 索引维护成本高

-- 很少使用的列
-- 浪费空间
```

---

## 易错点与边界

### 1. 过多索引

```sql
-- 错误：为每个列都创建索引
CREATE INDEX idx_col1 ON table(col1);
CREATE INDEX idx_col2 ON table(col2);
CREATE INDEX idx_col3 ON table(col3);
-- ... 10个索引

-- 问题：
-- - 占用大量空间
-- - 插入/更新变慢
-- - 优化器选择困难
```

### 2. 索引列顺序错误

```sql
-- 错误：顺序不对
CREATE INDEX idx_age_city ON users(age, city);
SELECT * FROM users WHERE city = 'Beijing';  -- 无法使用索引

-- 正确：查询条件在前
CREATE INDEX idx_city_age ON users(city, age);
SELECT * FROM users WHERE city = 'Beijing';  -- 使用索引
```

### 3. 索引失效

```sql
-- 使用函数导致索引失效
SELECT * FROM users WHERE UPPER(username) = 'ALICE';  -- 索引失效

-- 使用函数索引
CREATE INDEX idx_upper_username ON users((UPPER(username)));
SELECT * FROM users WHERE UPPER(username) = 'ALICE';  -- 使用索引
```

---

## 生产实践示例

### 1. 电商订单索引设计

```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL,
    user_id BIGINT NOT NULL,
    status TINYINT NOT NULL,
    total_amount BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    -- 索引设计
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status_created (status, created_at),  -- 组合索引
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- 覆盖常见查询
-- 按用户查询
SELECT * FROM orders WHERE user_id = 100;

-- 按状态和时间查询
SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC;

-- 按订单号查询
SELECT * FROM orders WHERE order_no = 'ORD20240316001';
```

### 2. 用户表索引设计

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone CHAR(11),
    status TINYINT NOT NULL,
    created_at DATETIME NOT NULL,
    -- 索引设计
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_phone (phone),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Indexes: https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html
   - Index Types: https://dev.mysql.com/doc/refman/8.0/en/create-index.html

2. **Oracle 官方文档**：
   - Indexes: https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/indexes-and-index-organized-tables.html

3. **PostgreSQL 官方文档**：
   - Indexes: https://www.postgresql.org/docs/current/indexes.html
   - Index Types: https://www.postgresql.org/docs/current/indexes-types.html

4. **最佳实践**：
   - 根据查询模式创建索引
   - 避免过多索引
   - 定期分析索引使用情况
   - 删除无用索引
   - 监控索引大小和碎片

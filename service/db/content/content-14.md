# 聚簇索引与非聚簇索引

## 概述

聚簇索引（Clustered Index）和非聚簇索引（Non-Clustered Index）是索引的两种物理存储方式。理解它们的区别对于数据库性能优化至关重要，特别是在选择主键、设计索引策略时。

**核心区别**：
- **聚簇索引**：索引和数据存储在一起，数据按索引顺序物理排列
- **非聚簇索引**：索引和数据分开存储，索引存储指向数据的指针

**典型代表**：
- InnoDB：使用聚簇索引（主键索引）
- MyISAM：使用非聚簇索引（所有索引）

---

## 聚簇索引（Clustered Index）

### 1. 聚簇索引原理

```
聚簇索引的 B+Tree 叶子节点直接存储完整的行数据

B+Tree 结构：
                [50, 100]
               /    |    \
         [10,30]  [70,90]  [120]
          /  \      /  \      \
    [叶子节点]  [叶子节点]  [叶子节点]

叶子节点内容：
| PK=1 | Row(id=1, name='alice', age=25, ...) |
| PK=2 | Row(id=2, name='bob', age=30, ...) |
| PK=3 | Row(id=3, name='charlie', age=28, ...) |

特点：
- 数据和索引在一起
- 数据按主键顺序物理存储
- 一个表只能有一个聚簇索引（通常是主键）
```

### 2. InnoDB 聚簇索引

**主键作为聚簇索引**：
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    age INT
) ENGINE=InnoDB;

-- 主键 id 自动成为聚簇索引
-- 数据按 id 顺序存储
```

**没有主键时的处理**：
```sql
-- 如果没有主键，InnoDB 选择第一个唯一非空索引作为聚簇索引
CREATE TABLE users (
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL
) ENGINE=InnoDB;
-- email 成为聚簇索引

-- 如果没有主键也没有唯一索引，InnoDB 创建隐藏的 6 字节 ROW_ID 作为聚簇索引
CREATE TABLE users (
    username VARCHAR(50) NOT NULL
) ENGINE=InnoDB;
-- InnoDB 内部维护隐藏的 ROW_ID
```

### 3. 聚簇索引的优点

**主键查询极快**：
```sql
-- 一次 I/O 直接获取完整数据
SELECT * FROM users WHERE id = 100;

-- 执行过程：
-- 1. 通过 B+Tree 定位到叶子节点
-- 2. 叶子节点直接包含完整行数据
-- 3. 返回结果

-- I/O 次数：约 3 次（树高为 3）
```

**范围查询高效**：
```sql
-- 叶子节点链表，顺序读取
SELECT * FROM users WHERE id BETWEEN 100 AND 200;

-- 执行过程：
-- 1. 定位到 id=100 的叶子节点
-- 2. 沿着叶子节点链表顺序扫描
-- 3. 直到 id > 200

-- 优点：顺序 I/O，性能好
```

**排序查询无需排序**：
```sql
-- 数据本身已按主键排序
SELECT * FROM users ORDER BY id LIMIT 10;

-- EXPLAIN: 无 Using filesort
-- 直接读取前 10 条记录即可
```

### 4. 聚簇索引的缺点

**插入性能问题**：
```sql
-- 顺序插入（自增主键）：性能好
INSERT INTO users (id, username) VALUES (101, 'alice');
-- 插入到表尾，很少页分裂

-- 随机插入（UUID 主键）：性能差
INSERT INTO users (id, username) VALUES (UUID(), 'bob');
-- 随机位置插入，频繁页分裂
```

**二级索引回表开销**：
```sql
-- 二级索引需要回表
SELECT * FROM users WHERE username = 'alice';

-- 执行过程：
-- 1. 通过 username 索引找到主键 id=100
-- 2. 再通过主键 id=100 查询聚簇索引获取完整数据
-- 3. 返回结果

-- 两次 I/O：索引查询 + 回表查询
```

**更新主键代价高**：
```sql
-- 更新主键需要移动数据
UPDATE users SET id = 999 WHERE id = 1;

-- 执行过程：
-- 1. 删除 id=1 的记录
-- 2. 在 id=999 位置插入记录
-- 3. 可能引起页分裂
-- 4. 更新所有二级索引

-- 建议：避免更新主键
```

---

## 非聚簇索引（Non-Clustered Index）

### 1. 非聚簇索引原理

```
非聚簇索引的 B+Tree 叶子节点存储索引键值和指向数据的指针

B+Tree 结构：
                [50, 100]
               /    |    \
         [10,30]  [70,90]  [120]
          /  \      /  \      \
    [叶子节点]  [叶子节点]  [叶子节点]

叶子节点内容：
| Key=1 | Pointer -> Row Address |
| Key=2 | Pointer -> Row Address |
| Key=3 | Pointer -> Row Address |

数据文件（独立存储）：
[Row1: id=1, name='alice', age=25, ...]
[Row2: id=2, name='bob', age=30, ...]
[Row3: id=3, name='charlie', age=28, ...]

特点：
- 索引和数据分离
- 数据存储顺序不受索引影响
- 可以有多个非聚簇索引
```

### 2. MyISAM 非聚簇索引

**所有索引都是非聚簇的**：
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=MyISAM;

-- 主键索引：非聚簇索引
-- 二级索引：非聚簇索引
-- 所有索引地位平等
```

**文件结构**：
```
users.frm  -- 表结构定义
users.MYD  -- 数据文件（MyISAM Data）
users.MYI  -- 索引文件（MyISAM Index）

索引文件（.MYI）：
- 存储所有索引的 B+Tree
- 叶子节点存储行指针

数据文件（.MYD）：
- 按插入顺序存储数据
- 不受索引影响
```

### 3. 非聚簇索引的优点

**插入性能好**：
```sql
-- 数据按插入顺序存储
-- 不需要维护物理顺序
-- 很少页分裂

INSERT INTO users VALUES (UUID(), 'alice', 'alice@example.com');
-- 直接追加到数据文件末尾
```

**更新主键无需移动数据**：
```sql
-- 更新主键只需更新索引
UPDATE users SET id = 999 WHERE id = 1;

-- MyISAM 执行过程：
-- 1. 更新主键索引（修改索引项）
-- 2. 数据文件不移动（指针仍指向同一位置）

-- 性能好于聚簇索引
```

**所有索引地位平等**：
```sql
-- 主键查询
SELECT * FROM users WHERE id = 100;

-- 二级索引查询
SELECT * FROM users WHERE username = 'alice';

-- 两者查询性能相似（都需要回表）
```

### 4. 非聚簇索引的缺点

**查询需要两次 I/O**：
```sql
-- 主键查询也需要回表
SELECT * FROM users WHERE id = 100;

-- 执行过程：
-- 1. 查询主键索引，获取行指针
-- 2. 通过指针访问数据文件，获取完整数据

-- 两次 I/O：索引 + 数据
-- 比聚簇索引多一次 I/O
```

**范围查询性能差**：
```sql
-- 范围查询需要随机 I/O
SELECT * FROM users WHERE id BETWEEN 100 AND 200;

-- 执行过程：
-- 1. 索引范围扫描，获取所有行指针
-- 2. 对每个指针，访问数据文件（随机 I/O）

-- 如果结果集大，随机 I/O 次数多，性能差
```

---

## InnoDB 二级索引（非聚簇）

### 1. InnoDB 二级索引结构

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    age INT,
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- 主键索引（聚簇索引）：
-- 叶子节点：| id | 完整行数据 |

-- username 索引（二级索引，非聚簇）：
-- 叶子节点：| username | 主键id |
-- 注意：存储的是主键值，而不是行指针
```

**二级索引结构**：
```
二级索引叶子节点：
| username='alice' | PK=1 |
| username='bob'   | PK=2 |
| username='charlie' | PK=3 |

特点：
- 存储主键值而不是行指针
- 回表时通过主键查询聚簇索引
```

### 2. 回表（Table Lookup）

```sql
-- 二级索引查询
SELECT * FROM users WHERE username = 'alice';

-- 执行过程：
-- 1. 查询 username 索引，找到 username='alice' 的主键 id=100
-- 2. 通过主键 id=100 查询聚簇索引，获取完整行数据
-- 3. 返回结果

-- 两次 B+Tree 查询：
-- - username 索引查询
-- - 聚簇索引回表查询
```

**回表的代价**：
```sql
-- 查询结果集越大，回表次数越多
SELECT * FROM users WHERE age > 18;

-- 如果结果有 10000 行：
-- 需要回表 10000 次
-- 性能较差

-- 解决方案：
-- 1. 使用覆盖索引（避免回表）
-- 2. 限制返回行数
```

### 3. 覆盖索引（避免回表）

```sql
-- 创建覆盖索引
CREATE INDEX idx_username_age ON users(username, age);

-- 覆盖索引查询（无需回表）
SELECT username, age FROM users WHERE username = 'alice';

-- 执行过程：
-- 1. 查询 idx_username_age 索引
-- 2. 索引已包含 username 和 age
-- 3. 直接返回，无需回表

-- EXPLAIN: Using index
```

---

## 主键选择的影响

### 1. 自增主键 vs UUID

**自增主键（推荐）**：
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL
) ENGINE=InnoDB;

-- 优点：
-- - 顺序插入，很少页分裂
-- - 主键占用空间小（8字节）
-- - 二级索引占用空间小（存储8字节主键）
-- - B+Tree 高度低

-- 缺点：
-- - 分布式环境可能冲突
-- - 暴露数据量
```

**UUID 主键（不推荐）**：
```sql
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_no VARCHAR(32) NOT NULL
) ENGINE=InnoDB;

-- 优点：
-- - 全局唯一
-- - 不暴露数据量

-- 缺点：
-- - 随机插入，频繁页分裂
-- - 主键占用空间大（36字节）
-- - 二级索引占用空间大（存储36字节主键）
-- - B+Tree 高度高
-- - 索引碎片化严重
```

**性能对比**：
```
插入 100 万条记录：

自增主键：
- 插入时间：10 秒
- 索引大小：50 MB
- 页分裂次数：100

UUID 主键：
- 插入时间：60 秒
- 索引大小：300 MB
- 页分裂次数：50000

UUID 性能下降 6 倍
```

### 2. 业务字段作为主键

```sql
-- 不推荐：使用业务字段作为主键
CREATE TABLE users (
    email VARCHAR(100) PRIMARY KEY,
    username VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 问题：
-- 1. 业务字段可能需要修改（email 可能变更）
-- 2. 主键占用空间大（100字节）
-- 3. 二级索引占用空间大
-- 4. 更新主键代价高

-- 推荐：使用代理主键
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL
) ENGINE=InnoDB;
```

---

## 聚簇索引 vs 非聚簇索引对比

| 特性 | 聚簇索引 | 非聚簇索引 |
|------|----------|-----------|
| 数据存储 | 索引叶子节点存储完整数据 | 索引叶子节点存储指针 |
| 数据顺序 | 按索引顺序物理排列 | 按插入顺序存储 |
| 每表数量 | 只能有一个 | 可以有多个 |
| 主键查询 | 一次I/O | 两次I/O |
| 范围查询 | 高效（顺序I/O） | 较差（随机I/O） |
| 插入性能 | 随机插入性能差 | 插入性能好 |
| 更新主键 | 需移动数据 | 只需更新索引 |
| 空间占用 | 较大 | 较小 |
| 代表数据库 | InnoDB | MyISAM |

---

## 索引组织表（IOT）

### 1. Oracle 索引组织表

Oracle 的 IOT（Index-Organized Table）类似 InnoDB 的聚簇索引。

```sql
-- 创建索引组织表
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    username VARCHAR2(50) NOT NULL,
    email VARCHAR2(100) NOT NULL
) ORGANIZATION INDEX;

-- 特点：
-- - 数据按主键顺序存储
-- - 主键查询高效
-- - 适合范围查询
```

### 2. 堆组织表（Heap Table）

Oracle 的默认表类型，类似 MyISAM。

```sql
-- 创建堆组织表（默认）
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    username VARCHAR2(50) NOT NULL,
    email VARCHAR2(100) NOT NULL
);

-- 特点：
-- - 数据无序存储
-- - 所有索引都是非聚簇的
```

---

## 易错点与边界

### 1. 误认为 InnoDB 所有索引都是聚簇的

```sql
-- 错误理解
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50),
    INDEX idx_username (username)  -- 误认为也是聚簇索引
);

-- 正确理解
-- id 主键：聚簇索引
-- username 索引：非聚簇索引（二级索引）
-- 一个表只有一个聚簇索引
```

### 2. 二级索引的回表开销

```sql
-- 查询所有列（需要回表）
SELECT * FROM users WHERE username = 'alice';
-- 两次B+Tree查询

-- 只查询索引列（无需回表）
SELECT id, username FROM users WHERE username = 'alice';
-- 一次B+Tree查询（覆盖索引）
```

### 3. 主键更新的隐藏成本

```sql
-- 更新主键
UPDATE users SET id = 999 WHERE id = 1;

-- InnoDB 执行过程：
-- 1. 删除 id=1 的记录（从聚簇索引删除）
-- 2. 在 id=999 位置插入记录（插入到聚簇索引）
-- 3. 更新所有二级索引中的主键值

-- 成本：
-- - 删除+插入聚簇索引（可能页分裂）
-- - 更新所有二级索引
-- - 如果有外键，还需更新外键表

-- 建议：避免更新主键
```

---

## 生产实践示例

### 1. 主键设计建议

```sql
-- 推荐：自增主键
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    total_amount BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- 优点：
-- - 顺序插入，性能好
-- - 占用空间小
-- - 二级索引效率高

-- order_no 作为业务主键（唯一索引）
-- id 作为物理主键（聚簇索引）
```

### 2. 覆盖索引优化

```sql
-- 常见查询
SELECT id, username, email FROM users WHERE username = 'alice';

-- 创建覆盖索引
CREATE INDEX idx_username_email ON users(username, email);

-- 查询优化
SELECT id, username, email FROM users WHERE username = 'alice';
-- Using index（无需回表）

-- 性能提升：
-- 优化前：2 次 I/O（索引 + 回表）
-- 优化后：1 次 I/O（只查索引）
```

### 3. 分页查询优化

```sql
-- 深分页问题
SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;
-- 需要扫描 1000010 行，然后丢弃前 1000000 行

-- 优化：延迟关联
SELECT o.* FROM orders o
INNER JOIN (
    SELECT id FROM orders ORDER BY id LIMIT 1000000, 10
) t ON o.id = t.id;

-- 子查询使用覆盖索引（无需回表）
-- 只对最终 10 条记录回表
```

---

## 存储引擎选择建议

### 1. InnoDB（推荐）

```sql
-- 适用场景：
-- - OLTP 系统（事务处理）
-- - 需要外键约束
-- - 需要 MVCC
-- - 需要行级锁
-- - 高并发读写

CREATE TABLE users (...) ENGINE=InnoDB;
```

### 2. MyISAM

```sql
-- 适用场景：
-- - 只读或读多写少
-- - 不需要事务
-- - 全文索引（MySQL 5.6 之前）
-- - 表级锁可接受

CREATE TABLE logs (...) ENGINE=MyISAM;

-- 注意：MySQL 8.0 已逐步废弃 MyISAM
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Clustered and Secondary Indexes: https://dev.mysql.com/doc/refman/8.0/en/innodb-index-types.html
   - InnoDB Table and Index Structures: https://dev.mysql.com/doc/refman/8.0/en/innodb-table-and-index.html

2. **经典书籍**：
   - 《MySQL技术内幕：InnoDB存储引擎》
   - 《高性能MySQL》

3. **最佳实践**：
   - 使用自增主键，避免 UUID
   - 合理设计二级索引，避免过多回表
   - 使用覆盖索引优化查询
   - 监控页分裂和索引碎片
   - 定期优化表（OPTIMIZE TABLE）

# 分区表

## 概述

分区表（Partitioned Table）将大表按照一定规则拆分成多个物理分区，每个分区独立存储和管理。分区表是处理超大表（TB 级别）的重要手段，可以显著提升查询性能、简化数据管理、优化维护操作。

**核心概念**：
- **分区键**：用于分区的列
- **分区策略**：Range、List、Hash、Key
- **分区裁剪**：只扫描相关分区
- **分区维护**：添加、删除、合并分区
- **本地索引 vs 全局索引**

---

## 分区类型

### 1. Range 分区（范围分区）

按列值的范围划分分区，最常用的分区方式。

**MySQL**：
```sql
-- 按日期范围分区
CREATE TABLE orders (
    id BIGINT NOT NULL,
    order_no VARCHAR(32) NOT NULL,
    user_id BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id, created_at)
) ENGINE=InnoDB
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_max VALUES LESS THAN MAXVALUE
);

-- 按数值范围分区
CREATE TABLE users (
    id BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB
PARTITION BY RANGE (id) (
    PARTITION p0 VALUES LESS THAN (1000000),
    PARTITION p1 VALUES LESS THAN (2000000),
    PARTITION p2 VALUES LESS THAN (3000000),
    PARTITION p_max VALUES LESS THAN MAXVALUE
);
```

**Oracle**：
```sql
-- 范围分区
CREATE TABLE orders (
    id NUMBER(19),
    order_no VARCHAR2(32),
    created_at DATE,
    amount NUMBER(12,2)
)
PARTITION BY RANGE (created_at) (
    PARTITION p2022 VALUES LESS THAN (TO_DATE('2023-01-01', 'YYYY-MM-DD')),
    PARTITION p2023 VALUES LESS THAN (TO_DATE('2024-01-01', 'YYYY-MM-DD')),
    PARTITION p2024 VALUES LESS THAN (TO_DATE('2025-01-01', 'YYYY-MM-DD'))
);

-- 间隔分区（自动创建分区）
CREATE TABLE orders (
    id NUMBER(19),
    created_at DATE,
    amount NUMBER(12,2)
)
PARTITION BY RANGE (created_at)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
(
    PARTITION p_start VALUES LESS THAN (TO_DATE('2024-01-01', 'YYYY-MM-DD'))
);
-- 自动为每个月创建分区
```

**PostgreSQL**：
```sql
-- 声明式分区（PostgreSQL 10+）
CREATE TABLE orders (
    id BIGINT NOT NULL,
    order_no VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    amount BIGINT NOT NULL
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE orders_2022 PARTITION OF orders
    FOR VALUES FROM ('2022-01-01') TO ('2023-01-01');

CREATE TABLE orders_2023 PARTITION OF orders
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- 创建默认分区
CREATE TABLE orders_default PARTITION OF orders DEFAULT;
```

### 2. List 分区（列表分区）

按离散的列值列表划分分区。

**MySQL**：
```sql
-- 按地区分区
CREATE TABLE users (
    id BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    region VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id, region)
) ENGINE=InnoDB
PARTITION BY LIST COLUMNS (region) (
    PARTITION p_north VALUES IN ('Beijing', 'Tianjin', 'Hebei'),
    PARTITION p_east VALUES IN ('Shanghai', 'Jiangsu', 'Zhejiang'),
    PARTITION p_south VALUES IN ('Guangdong', 'Fujian', 'Hainan'),
    PARTITION p_west VALUES IN ('Chongqing', 'Sichuan', 'Shaanxi')
);
```

**Oracle**：
```sql
-- 列表分区
CREATE TABLE sales (
    id NUMBER(19),
    region VARCHAR2(20),
    amount NUMBER(12,2)
)
PARTITION BY LIST (region) (
    PARTITION p_north VALUES ('Beijing', 'Tianjin'),
    PARTITION p_east VALUES ('Shanghai', 'Nanjing'),
    PARTITION p_south VALUES ('Guangzhou', 'Shenzhen'),
    PARTITION p_default VALUES (DEFAULT)
);
```

**PostgreSQL**：
```sql
-- 列表分区
CREATE TABLE sales (
    id BIGINT,
    region VARCHAR(20),
    amount BIGINT
) PARTITION BY LIST (region);

CREATE TABLE sales_north PARTITION OF sales
    FOR VALUES IN ('Beijing', 'Tianjin', 'Hebei');

CREATE TABLE sales_east PARTITION OF sales
    FOR VALUES IN ('Shanghai', 'Jiangsu', 'Zhejiang');

CREATE TABLE sales_default PARTITION OF sales DEFAULT;
```

### 3. Hash 分区（哈希分区）

按列值的哈希结果划分分区，数据分布均匀。

**MySQL**：
```sql
-- Hash 分区
CREATE TABLE users (
    id BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB
PARTITION BY HASH (id)
PARTITIONS 8;  -- 8 个分区

-- 使用表达式
CREATE TABLE orders (
    id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id, created_at)
) ENGINE=InnoDB
PARTITION BY HASH (YEAR(created_at))
PARTITIONS 4;
```

**Oracle**：
```sql
-- Hash 分区
CREATE TABLE users (
    id NUMBER(19),
    username VARCHAR2(50)
)
PARTITION BY HASH (id)
PARTITIONS 8;
```

**PostgreSQL**：
```sql
-- Hash 分区（PostgreSQL 11+）
CREATE TABLE users (
    id BIGINT,
    username VARCHAR(50)
) PARTITION BY HASH (id);

-- 创建分区
CREATE TABLE users_p0 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);

CREATE TABLE users_p1 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 1);

CREATE TABLE users_p2 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 2);

CREATE TABLE users_p3 PARTITION OF users
    FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

### 4. Key 分区（MySQL）

类似 Hash 分区，但使用 MySQL 内部的哈希函数。

```sql
-- Key 分区
CREATE TABLE users (
    id BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB
PARTITION BY KEY (id)
PARTITIONS 8;

-- 不指定列，使用主键
CREATE TABLE users (
    id BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB
PARTITION BY KEY()
PARTITIONS 8;
```

### 5. 复合分区（子分区）

组合多种分区策略。

**Oracle**：
```sql
-- Range-Hash 复合分区
CREATE TABLE sales (
    id NUMBER(19),
    sale_date DATE,
    region VARCHAR2(20),
    amount NUMBER(12,2)
)
PARTITION BY RANGE (sale_date)
SUBPARTITION BY HASH (region)
SUBPARTITIONS 4
(
    PARTITION p2023 VALUES LESS THAN (TO_DATE('2024-01-01', 'YYYY-MM-DD')),
    PARTITION p2024 VALUES LESS THAN (TO_DATE('2025-01-01', 'YYYY-MM-DD'))
);
```

**PostgreSQL**：
```sql
-- Range-List 复合分区
CREATE TABLE sales (
    id BIGINT,
    sale_date DATE,
    region VARCHAR(20),
    amount BIGINT
) PARTITION BY RANGE (sale_date);

CREATE TABLE sales_2024 PARTITION OF sales
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01')
    PARTITION BY LIST (region);

CREATE TABLE sales_2024_north PARTITION OF sales_2024
    FOR VALUES IN ('Beijing', 'Tianjin');

CREATE TABLE sales_2024_south PARTITION OF sales_2024
    FOR VALUES IN ('Guangzhou', 'Shenzhen');
```

---

## 分区裁剪（Partition Pruning）

分区裁剪是分区表最重要的性能优化，查询时只扫描相关分区。

### 1. 分区裁剪原理

```sql
-- 分区表
CREATE TABLE orders (
    id BIGINT,
    created_at DATE,
    amount BIGINT
) PARTITION BY RANGE (created_at) (
    PARTITION p2022 VALUES LESS THAN ('2023-01-01'),
    PARTITION p2023 VALUES LESS THAN ('2024-01-01'),
    PARTITION p2024 VALUES LESS THAN ('2025-01-01')
);

-- 查询 2024 年数据
SELECT * FROM orders WHERE created_at >= '2024-01-01';

-- 分区裁剪：
-- 1. 优化器分析 WHERE 条件
-- 2. 确定只需扫描 p2024 分区
-- 3. 跳过 p2022、p2023 分区
-- 4. 性能提升：只扫描 1/3 的数据
```

### 2. 查看分区裁剪

**MySQL**：
```sql
-- 查看执行计划
EXPLAIN PARTITIONS
SELECT * FROM orders WHERE created_at >= '2024-01-01';

-- 输出：
-- partitions: p2024
-- 只扫描 p2024 分区
```

**Oracle**：
```sql
-- 查看执行计划
EXPLAIN PLAN FOR
SELECT * FROM orders WHERE created_at >= DATE '2024-01-01';

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- 输出：
-- Pstart: 3  Pstop: 3
-- 只访问第 3 个分区
```

**PostgreSQL**：
```sql
-- 查看执行计划
EXPLAIN
SELECT * FROM orders WHERE created_at >= '2024-01-01';

-- 输出：
-- Append on orders
--   -> Seq Scan on orders_2024
-- 只扫描 orders_2024 分区
```

### 3. 分区裁剪失效

```sql
-- ❌ 分区裁剪失效：使用函数
SELECT * FROM orders WHERE YEAR(created_at) = 2024;
-- 无法确定扫描哪个分区，全表扫描

-- ✅ 分区裁剪生效：直接比较
SELECT * FROM orders 
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
-- 只扫描 p2024 分区

-- ❌ 分区裁剪失效：OR 条件跨分区
SELECT * FROM orders 
WHERE created_at = '2023-12-31' OR created_at = '2024-01-01';
-- 扫描 p2023 和 p2024 两个分区

-- ❌ 分区裁剪失效：不包含分区键
SELECT * FROM orders WHERE user_id = 100;
-- 不包含分区键 created_at，全表扫描
```

---

## 分区维护

### 1. 添加分区

**MySQL**：
```sql
-- 添加新分区
ALTER TABLE orders
ADD PARTITION (PARTITION p2025 VALUES LESS THAN (2026));

-- List 分区添加值
ALTER TABLE users
REORGANIZE PARTITION p_north INTO (
    PARTITION p_north VALUES IN ('Beijing', 'Tianjin', 'Hebei', 'Shanxi')
);
```

**Oracle**：
```sql
-- 添加分区
ALTER TABLE orders
ADD PARTITION p2025 VALUES LESS THAN (TO_DATE('2026-01-01', 'YYYY-MM-DD'));

-- 分割分区
ALTER TABLE orders
SPLIT PARTITION p_max AT (TO_DATE('2026-01-01', 'YYYY-MM-DD'))
INTO (PARTITION p2025, PARTITION p_max);
```

**PostgreSQL**：
```sql
-- 添加分区
CREATE TABLE orders_2025 PARTITION OF orders
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 2. 删除分区

**MySQL**：
```sql
-- 删除分区（数据也删除）
ALTER TABLE orders DROP PARTITION p2022;

-- 截断分区（清空数据，保留分区）
ALTER TABLE orders TRUNCATE PARTITION p2022;
```

**Oracle**：
```sql
-- 删除分区
ALTER TABLE orders DROP PARTITION p2022;

-- 截断分区
ALTER TABLE orders TRUNCATE PARTITION p2022;
```

**PostgreSQL**：
```sql
-- 分离分区（不删除数据）
ALTER TABLE orders DETACH PARTITION orders_2022;

-- 删除分区
DROP TABLE orders_2022;
```

### 3. 合并分区

**MySQL**：
```sql
-- 重组分区（合并）
ALTER TABLE orders
REORGANIZE PARTITION p2022, p2023 INTO (
    PARTITION p2022_2023 VALUES LESS THAN (2024)
);
```

**Oracle**：
```sql
-- 合并分区
ALTER TABLE orders
MERGE PARTITIONS p2022, p2023 INTO PARTITION p2022_2023;
```

### 4. 交换分区

快速移动数据，常用于数据归档。

**MySQL**：
```sql
-- 创建临时表
CREATE TABLE orders_archive LIKE orders;

-- 交换分区
ALTER TABLE orders
EXCHANGE PARTITION p2022 WITH TABLE orders_archive;

-- 结果：
-- p2022 分区的数据移到 orders_archive
-- orders_archive 的数据移到 p2022 分区
```

**Oracle**：
```sql
-- 交换分区
ALTER TABLE orders
EXCHANGE PARTITION p2022
WITH TABLE orders_archive;
```

**PostgreSQL**：
```sql
-- 分离分区
ALTER TABLE orders DETACH PARTITION orders_2022;

-- 重命名为归档表
ALTER TABLE orders_2022 RENAME TO orders_archive_2022;
```

---

## 分区索引

### 1. 本地索引（Local Index）

每个分区有自己的索引分区。

**Oracle**：
```sql
-- 本地索引
CREATE INDEX idx_local_created ON orders (created_at) LOCAL;

-- 每个分区都有对应的索引分区
-- orders.p2022 -> idx_local_created.p2022
-- orders.p2023 -> idx_local_created.p2023
-- orders.p2024 -> idx_local_created.p2024

-- 优点：
-- - 分区独立，维护方便
-- - 删除分区时，索引分区自动删除

-- 缺点：
-- - 全局查询可能需要扫描所有索引分区
```

**MySQL**：
```sql
-- MySQL 的分区表索引都是本地索引
CREATE INDEX idx_user_id ON orders (user_id);

-- 每个分区都有独立的索引
```

### 2. 全局索引（Global Index）

一个索引覆盖所有分区。

**Oracle**：
```sql
-- 全局索引
CREATE INDEX idx_global_user ON orders (user_id) GLOBAL;

-- 一个索引包含所有分区的数据

-- 优点：
-- - 查询性能好（单一索引）

-- 缺点：
-- - 分区维护复杂
-- - 删除分区需要重建全局索引
```

**MySQL/PostgreSQL**：
- 不支持全局索引
- 所有索引都是本地索引

### 3. 分区索引选择

```sql
-- 场景1：经常按分区键查询
-- 使用本地索引
CREATE INDEX idx_local ON orders (created_at) LOCAL;

SELECT * FROM orders WHERE created_at >= '2024-01-01';
-- 只需扫描对应分区的索引

-- 场景2：经常按非分区键查询
-- Oracle 使用全局索引
CREATE INDEX idx_global ON orders (user_id) GLOBAL;

SELECT * FROM orders WHERE user_id = 100;
-- 快速定位，不需要扫描所有分区
```

---

## 分区表的优势

### 1. 提升查询性能

```sql
-- 非分区表：扫描 10 亿行
SELECT * FROM orders WHERE created_at >= '2024-01-01';
-- 扫描 10 亿行，耗时 60 秒

-- 分区表：只扫描相关分区
SELECT * FROM orders WHERE created_at >= '2024-01-01';
-- 分区裁剪，只扫描 2024 年分区（1 亿行）
-- 耗时 6 秒

-- 性能提升：10 倍
```

### 2. 简化数据管理

```sql
-- 删除旧数据

-- 非分区表：DELETE 很慢
DELETE FROM orders WHERE created_at < '2022-01-01';
-- 需要逐行删除，可能需要几小时

-- 分区表：直接删除分区
ALTER TABLE orders DROP PARTITION p2021;
-- 几秒钟完成

-- 归档数据

-- 非分区表：INSERT ... SELECT 很慢
INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < '2022-01-01';
DELETE FROM orders WHERE created_at < '2022-01-01';

-- 分区表：交换分区
ALTER TABLE orders EXCHANGE PARTITION p2021 WITH TABLE orders_archive;
-- 瞬间完成
```

### 3. 提升维护效率

```sql
-- 重建索引

-- 非分区表：全表重建
OPTIMIZE TABLE orders;
-- 需要几小时

-- 分区表：只重建特定分区
ALTER TABLE orders REBUILD PARTITION p2024;
-- 只需几分钟

-- 备份恢复

-- 非分区表：备份整个表
mysqldump orders > orders.sql;  -- 几个小时

-- 分区表：只备份特定分区
-- 可以分区并行备份，速度更快
```

---

## 分区表的限制

### 1. 主键/唯一键限制

**必须包含分区键**：
```sql
-- ❌ 错误：主键不包含分区键
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    created_at DATE
) PARTITION BY RANGE (created_at) (...);
-- ERROR: 主键必须包含分区键

-- ✅ 正确：主键包含分区键
CREATE TABLE orders (
    id BIGINT NOT NULL,
    created_at DATE NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at) (...);

-- 或使用唯一索引
CREATE TABLE orders (
    id BIGINT NOT NULL,
    order_no VARCHAR(32) NOT NULL,
    created_at DATE NOT NULL,
    UNIQUE KEY (order_no, created_at)
) PARTITION BY RANGE (created_at) (...);
```

### 2. 外键限制

**MySQL**：
```sql
-- InnoDB 分区表不支持外键
CREATE TABLE orders (
    id BIGINT,
    user_id BIGINT,
    created_at DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)  -- ERROR
) PARTITION BY RANGE (created_at) (...);
```

### 3. 全文索引限制

```sql
-- MySQL 分区表不支持全文索引
CREATE TABLE articles (
    id BIGINT,
    content TEXT,
    created_at DATE,
    FULLTEXT INDEX (content)  -- ERROR
) PARTITION BY RANGE (created_at) (...);
```

---

## 分区表最佳实践

### 1. 选择合适的分区键

```sql
-- ✅ 好的分区键
-- 1. 查询经常使用的列
CREATE TABLE orders (...) PARTITION BY RANGE (created_at);
-- 查询经常按日期范围查询

-- 2. 数据分布均匀
CREATE TABLE users (...) PARTITION BY HASH (id);
-- id 分布均匀

-- 3. 易于维护
CREATE TABLE logs (...) PARTITION BY RANGE (log_date);
-- 按日期分区，方便删除旧数据

-- ❌ 不好的分区键
-- 1. 数据倾斜
CREATE TABLE orders (...) PARTITION BY LIST (status);
-- status 分布不均（99% 是 'completed'）

-- 2. 查询很少使用
CREATE TABLE users (...) PARTITION BY RANGE (birthday);
-- 查询很少按生日范围查询
```

### 2. 合理设置分区数量

```sql
-- 分区数量建议：

-- 太少（< 10）：
-- - 分区裁剪效果不明显
-- - 单个分区仍然很大

-- 太多（> 1000）：
-- - 元数据开销大
-- - 查询优化器压力大
-- - 维护复杂

-- 推荐：
-- - 日分区：保留 1-3 个月（30-90 个分区）
-- - 月分区：保留 2-5 年（24-60 个分区）
-- - 年分区：长期保存（10-20 个分区）
```

### 3. 定期维护分区

```sql
-- 自动添加新分区（每月1号）
CREATE EVENT evt_add_partition
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-01-01 01:00:00'
DO
BEGIN
    SET @next_month = DATE_ADD(CURDATE(), INTERVAL 1 MONTH);
    SET @partition_name = CONCAT('p', DATE_FORMAT(@next_month, '%Y%m'));
    SET @sql = CONCAT('ALTER TABLE orders ADD PARTITION (PARTITION ', 
        @partition_name, 
        ' VALUES LESS THAN (', 
        YEAR(@next_month) * 100 + MONTH(@next_month) + 1, 
        '))');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END;

-- 定期删除旧分区（每月1号删除2年前的分区）
CREATE EVENT evt_drop_old_partition
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-01-01 02:00:00'
DO
BEGIN
    SET @old_month = DATE_SUB(CURDATE(), INTERVAL 24 MONTH);
    SET @partition_name = CONCAT('p', DATE_FORMAT(@old_month, '%Y%m'));
    SET @sql = CONCAT('ALTER TABLE orders DROP PARTITION ', @partition_name);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END;
```

---

## 生产环境案例

### 1. 订单表分区设计

```sql
-- 场景：订单表，每天 100 万条记录，保留 2 年

-- 按月分区
CREATE TABLE orders (
    id BIGINT NOT NULL,
    order_no VARCHAR(32) NOT NULL,
    user_id BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    status TINYINT NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id, created_at),
    KEY idx_user_id (user_id),
    KEY idx_status (status),
    UNIQUE KEY uk_order_no (order_no, created_at)
) ENGINE=InnoDB
PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p202401 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (TO_DAYS('2024-03-01')),
    PARTITION p202403 VALUES LESS THAN (TO_DAYS('2024-04-01')),
    -- ... 24 个月的分区
    PARTITION p_max VALUES LESS THAN MAXVALUE
);

-- 查询性能：
-- 按日期查询：分区裁剪，只扫描 1-2 个分区
SELECT * FROM orders WHERE created_at >= '2024-03-01';

-- 删除旧数据：
-- 每月删除 24 个月前的分区，瞬间完成
ALTER TABLE orders DROP PARTITION p202201;
```

### 2. 日志表分区设计

```sql
-- 场景：日志表，每天 1000 万条记录，保留 3 个月

-- 按天分区
CREATE TABLE access_logs (
    id BIGINT NOT NULL,
    user_id BIGINT,
    action VARCHAR(50),
    ip VARCHAR(50),
    log_time DATETIME NOT NULL,
    PRIMARY KEY (id, log_time)
) ENGINE=InnoDB
PARTITION BY RANGE (TO_DAYS(log_time)) (
    -- 90 个分区（3 个月）
    PARTITION p20240301 VALUES LESS THAN (TO_DAYS('2024-03-02')),
    PARTITION p20240302 VALUES LESS THAN (TO_DAYS('2024-03-03')),
    -- ...
    PARTITION p_max VALUES LESS THAN MAXVALUE
);

-- 每天自动添加明天的分区，删除 90 天前的分区
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Partitioning: https://dev.mysql.com/doc/refman/8.0/en/partitioning.html
   - Partition Pruning: https://dev.mysql.com/doc/refman/8.0/en/partitioning-pruning.html

2. **Oracle 官方文档**：
   - Partitioning: https://docs.oracle.com/en/database/oracle/oracle-database/19/vldbg/partition-intro.html

3. **PostgreSQL 官方文档**：
   - Table Partitioning: https://www.postgresql.org/docs/current/ddl-partitioning.html

4. **最佳实践**：
   - 选择合适的分区策略
   - 确保查询包含分区键
   - 定期维护分区
   - 监控分区数量
   - 主键/唯一键包含分区键

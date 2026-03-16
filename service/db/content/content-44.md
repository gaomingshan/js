# 行格式与记录结构

## 概述

行格式（Row Format）定义了数据行在磁盘和内存中的存储方式。不同的行格式在空间利用率、性能、功能支持等方面有不同的特点。理解行格式对于优化表结构、提升性能至关重要。

**InnoDB 行格式**：
- **Redundant**：MySQL 5.0 之前的格式（已废弃）
- **Compact**：MySQL 5.0 引入（默认 5.0-5.7）
- **Dynamic**：MySQL 5.7+ 默认
- **Compressed**：压缩格式

---

## Compact 行格式

### 1. 整体结构

**Compact 格式组成**：
```
+------------------+
| 变长字段长度列表 |
+------------------+
| NULL 值列表      |
+------------------+
| 记录头信息       |
+------------------+
| 隐藏列           |
+------------------+
| 列1数据          |
+------------------+
| 列2数据          |
+------------------+
| ...              |
+------------------+
```

### 2. 变长字段长度列表

**作用**：
```
记录变长字段的实际长度：
- VARCHAR
- VARBINARY
- TEXT（前缀）
- BLOB（前缀）
```

**存储方式**：
```
逆序存储：
最后一个变长字段的长度在前
第一个变长字段的长度在后

示例：
表结构：
  col1 VARCHAR(10)
  col2 VARCHAR(20)
  col3 VARCHAR(30)

数据：
  col1 = 'abc'      (3字节)
  col2 = 'hello'    (5字节)
  col3 = 'world'    (5字节)

长度列表：
  05 05 03  (逆序)
  ↑  ↑  ↑
  │  │  └─ col1 长度
  │  └──── col2 长度
  └─────── col3 长度
```

**长度字节数**：
```
单字节（0-127）：
- 字段最大长度 <= 255
- 实际长度 <= 127

双字节（128-16383）：
- 字段最大长度 > 255
- 或实际长度 > 127
```

### 3. NULL 值列表

**作用**：
```
记录哪些列为 NULL：
- 节省空间（NULL 不存储数据）
- 位图方式
```

**存储方式**：
```
每个可为 NULL 的列占 1 位：
- 1：NULL
- 0：非 NULL

逆序存储：
最后一列在前，第一列在后

示例：
表结构：
  id INT NOT NULL          -- 不可 NULL，不在位图中
  col1 VARCHAR(10)         -- 可 NULL
  col2 INT                 -- 可 NULL
  col3 VARCHAR(20)         -- 可 NULL

数据：
  col1 = 'abc'
  col2 = NULL
  col3 = 'hello'

NULL 位图：
  010  (逆序：col3, col2, col1)
   ↑
   └─ col2 为 NULL

字节存储：
  00000010 = 0x02

注意：
- 不足 8 位补 0
- 以字节为单位
```

**优化**：
```
只存储可为 NULL 的列：
- NOT NULL 列不占位
- 节省空间

如果所有列都 NOT NULL：
- NULL 值列表为空
```

### 4. 记录头信息

**结构（5 字节）**：
```
名称                位数    说明
------------------  ----    ------------------------
预留位1             1       未使用
预留位2             1       未使用
delete_flag         1       删除标记（1=已删除）
min_rec_flag        1       B+Tree 非叶子节点最小记录
n_owned             4       槽拥有的记录数
heap_no             13      堆中的位置
record_type         3       记录类型
                            0=普通记录
                            1=B+Tree 非叶子节点
                            2=Infimum
                            3=Supremum
next_record         16      下一条记录的相对位置
```

**delete_flag**：
```
逻辑删除标记：
- 0：未删除
- 1：已删除

删除流程：
1. 设置 delete_flag = 1
2. 加入 PAGE_FREE 链表
3. 空间可重用
4. OPTIMIZE TABLE 后物理删除
```

**next_record**：
```
指向下一条记录：
- 相对偏移量
- 正数：向后
- 负数：向前（Supremum 指向 Infimum）

记录链表：
Infimum -> Record1 -> Record2 -> ... -> Supremum
           ↑
      next_record
```

**n_owned**：
```
Page Directory 使用：
- 每组最后一条记录记录组内记录数
- 其他记录为 0

示例：
Group1: Record1(0), Record2(0), Record3(0), Record4(4)
        ↑                                      ↑
        n_owned=0                         n_owned=4
```

### 5. 隐藏列

**三个隐藏列**：
```
DB_ROW_ID（6字节）：
- 行 ID
- 如果没有主键且没有唯一非 NULL 索引
- InnoDB 自动生成

DB_TRX_ID（6字节）：
- 事务 ID
- 最后修改此行的事务 ID
- MVCC 使用

DB_ROLL_PTR（7字节）：
- 回滚指针
- 指向 Undo Log 中的记录
- MVCC 版本链
```

**示例**：
```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

实际存储：
id | name | DB_TRX_ID | DB_ROLL_PTR
-------------------------------------------
1  | Alice | 100       | ptr_to_undo_log

无 DB_ROW_ID（有主键）
```

```sql
CREATE TABLE logs (
    message VARCHAR(100)
);

实际存储：
message | DB_ROW_ID | DB_TRX_ID | DB_ROLL_PTR
---------------------------------------------------
Log1    | 1         | 100       | ptr_to_undo_log

有 DB_ROW_ID（无主键）
```

### 6. 列数据

**存储顺序**：
```
按表定义顺序存储：
- 定长字段
- 变长字段

示例：
CREATE TABLE t (
    id INT,           -- 4 字节
    name VARCHAR(20), -- 变长
    age INT           -- 4 字节
);

存储：
id(4) | age(4) | name(变长) | DB_TRX_ID(6) | DB_ROLL_PTR(7)
```

---

## Dynamic 行格式

### 1. 特点

**与 Compact 的区别**：
```
相同点：
- 基本结构相同
- 变长字段长度列表
- NULL 值列表
- 记录头信息

不同点：
- 大字段（TEXT/BLOB）存储方式不同
```

### 2. 大字段存储

**Compact 格式**：
```
TEXT/BLOB 字段：
- 前 768 字节存储在数据页
- 剩余部分存储在溢出页

示例：
TEXT 字段 10KB：
- 数据页：768 字节 + 20 字节指针
- 溢出页：9KB+
```

**Dynamic 格式**：
```
TEXT/BLOB 字段：
- 完全存储在溢出页
- 数据页只存储 20 字节指针

示例：
TEXT 字段 10KB：
- 数据页：20 字节指针
- 溢出页：10KB

优点：
- 数据页可以存储更多记录
- 减少页分裂
- 提升缓存效率
```

**阈值**：
```
字段长度 > 某个阈值：
- 存储到溢出页

阈值计算：
- 页大小（16KB）的一半
- 约 8KB
```

### 3. 溢出页

**结构**：
```
+------------------+
| FIL_PAGE_TYPE_BLOB |
+------------------+
| 数据长度         |
+------------------+
| 下一页指针       |
+------------------+
| 实际数据         |
+------------------+

单个溢出页：约 16KB - 头信息 ≈ 16350 字节

大字段分多个溢出页：
Page1 -> Page2 -> Page3 -> ...
```

**访问流程**：
```
查询包含大字段的记录：
1. 读取数据页
2. 获取溢出页指针
3. 读取溢出页
4. 如果有多个溢出页，逐个读取
5. 组装完整数据

性能影响：
- 额外的磁盘 I/O
- 查询变慢
```

---

## Compressed 行格式

### 1. 特点

**压缩机制**：
```
基于 Dynamic 格式：
- 页级别压缩
- 使用 zlib 算法
- 减少磁盘空间
- 减少 I/O

配置：
ROW_FORMAT=COMPRESSED
KEY_BLOCK_SIZE=8  (压缩页大小：1, 2, 4, 8, 16KB)
```

**创建压缩表**：
```sql
CREATE TABLE compressed_table (
    id INT PRIMARY KEY,
    data TEXT
) ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;

-- 或
ALTER TABLE users ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8;
```

### 2. 压缩原理

**压缩流程**：
```
1. 数据写入 Buffer Pool（16KB 未压缩页）
2. 压缩页（8KB 压缩页）
3. 写入磁盘（8KB）

读取流程：
1. 从磁盘读取压缩页（8KB）
2. 解压到 Buffer Pool（16KB）
3. 返回数据

Buffer Pool 中：
- 同时存储压缩页和未压缩页
- 压缩页用于刷盘
- 未压缩页用于查询
```

### 3. 优缺点

**优点**：
```
✓ 节省磁盘空间（30-70%）
✓ 减少 I/O（读写更少数据）
✓ 适合归档数据
✓ 适合读多写少
```

**缺点**：
```
✗ CPU 开销（压缩/解压）
✗ Buffer Pool 占用增加（两份数据）
✗ 压缩失败时性能下降
✗ 不适合频繁更新
```

### 4. 监控压缩

**查看压缩统计**：
```sql
-- 压缩操作统计
SHOW STATUS LIKE 'Innodb_num_pages_page_compressed';
SHOW STATUS LIKE 'Innodb_num_pages_page_decompressed';

-- 压缩失败次数
SHOW STATUS LIKE 'Innodb_num_page_compressed_trim_op';

-- 查看表压缩信息
SELECT 
    table_schema,
    table_name,
    row_format,
    create_options,
    table_rows,
    data_length / 1024 / 1024 AS data_mb
FROM information_schema.tables
WHERE row_format = 'Compressed';
```

---

## Redundant 行格式

### 1. 特点

**早期格式（MySQL 5.0 之前）**：
```
已废弃，不推荐使用

与 Compact 的区别：
- 字段长度列表不同
- NULL 值处理不同
- 记录头信息不同
- 空间效率低
```

### 2. 结构

**组成**：
```
+------------------+
| 字段偏移列表     |
+------------------+
| 记录头信息       |
+------------------+
| 隐藏列           |
+------------------+
| 列数据           |
+------------------+

字段偏移列表：
- 存储每个字段的结束位置
- 不是长度，而是偏移量
- 占用空间更多
```

---

## 行格式选择

### 1. 对比

| 特性 | Redundant | Compact | Dynamic | Compressed |
|------|-----------|---------|---------|------------|
| 空间效率 | 低 | 中 | 高 | 最高 |
| 性能 | 中 | 高 | 高 | 中 |
| 大字段处理 | 差 | 一般 | 好 | 好 |
| CPU 开销 | 低 | 低 | 低 | 高 |
| 默认版本 | < 5.0 | 5.0-5.6 | 5.7+ | - |
| 推荐场景 | 不推荐 | 通用 | 推荐 | 归档 |

### 2. 选择建议

**通用场景**：
```sql
-- 使用默认（Dynamic）
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50)
);
-- 自动使用 Dynamic
```

**大字段场景**：
```sql
-- 明确指定 Dynamic
CREATE TABLE articles (
    id BIGINT PRIMARY KEY,
    title VARCHAR(200),
    content TEXT
) ROW_FORMAT=Dynamic;
```

**归档场景**：
```sql
-- 使用压缩
CREATE TABLE logs_archive (
    id BIGINT PRIMARY KEY,
    log_time TIMESTAMP,
    message TEXT
) ROW_FORMAT=Compressed KEY_BLOCK_SIZE=8;
```

**修改行格式**：
```sql
-- 修改现有表
ALTER TABLE users ROW_FORMAT=Dynamic;

-- 注意：重建表，锁表
```

---

## 行溢出

### 1. 触发条件

**页大小限制**：
```
单个页（16KB）必须至少存储 2 条记录
单条记录最大：约 8KB

超过阈值：
- VARCHAR/TEXT/BLOB 字段
- 存储到溢出页
```

### 2. 示例

**VARCHAR 溢出**：
```sql
CREATE TABLE t (
    id INT PRIMARY KEY,
    col1 VARCHAR(8000),
    col2 VARCHAR(8000)
) ROW_FORMAT=Compact;

INSERT INTO t VALUES (1, REPEAT('a', 8000), REPEAT('b', 8000));

存储：
数据页：
- col1 前 768 字节 + 指针
- col2 前 768 字节 + 指针

溢出页：
- col1 剩余数据
- col2 剩余数据
```

**Dynamic 溢出**：
```sql
CREATE TABLE t (
    id INT PRIMARY KEY,
    col1 VARCHAR(8000),
    col2 VARCHAR(8000)
) ROW_FORMAT=Dynamic;

INSERT INTO t VALUES (1, REPEAT('a', 8000), REPEAT('b', 8000));

存储：
数据页：
- col1 指针（20 字节）
- col2 指针（20 字节）

溢出页：
- col1 完整数据
- col2 完整数据
```

---

## 性能优化

### 1. 减少行溢出

**避免过大字段**：
```sql
-- 不好：单个字段过大
CREATE TABLE users (
    id INT PRIMARY KEY,
    profile TEXT  -- 可能很大
);

-- 好：拆分大字段
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    profile TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**使用合适的数据类型**：
```sql
-- 不好：VARCHAR 过长
col1 VARCHAR(10000)

-- 好：根据实际需要
col1 VARCHAR(255)  -- 足够的长度
```

### 2. 选择合适的行格式

**考虑因素**：
```
数据特征：
- 大字段多：Dynamic
- 归档数据：Compressed
- 通用场景：Dynamic

性能要求：
- OLTP 高并发：Dynamic
- 磁盘空间紧张：Compressed
- CPU 资源有限：Dynamic

负载类型：
- 读多写少：Compressed
- 写多读少：Dynamic
```

### 3. 监控行大小

**估算行大小**：
```sql
-- 查看平均行大小
SELECT 
    table_name,
    table_rows,
    data_length / table_rows AS avg_row_length
FROM information_schema.tables
WHERE table_schema = 'mydb'
    AND table_rows > 0
ORDER BY avg_row_length DESC;
```

**警告阈值**：
```
avg_row_length > 8000：
- 可能频繁溢出
- 考虑拆分表或字段
- 检查是否有不必要的大字段
```

---

## 最佳实践

### 1. 表设计

```
□ 使用 Dynamic 行格式（默认）
□ 避免过长的 VARCHAR
□ 大字段考虑独立表
□ 选择合适的数据类型
□ 所有列尽量 NOT NULL
```

### 2. 性能优化

```
□ 减少行溢出
□ 避免频繁更新大字段
□ 归档数据使用压缩
□ 监控行大小
□ 定期分析表
```

### 3. 空间管理

```
□ 合理使用压缩
□ 清理过期数据
□ 监控磁盘空间
□ 定期重建表
```

---

## 参考资料

1. **MySQL 官方文档**：
   - InnoDB Row Formats: https://dev.mysql.com/doc/refman/8.0/en/innodb-row-format.html

2. **推荐书籍**：
   - 《MySQL技术内幕：InnoDB存储引擎》

3. **最佳实践**：
   - 使用 Dynamic 行格式
   - 避免行溢出
   - 合理使用压缩
   - 监控行大小
   - 优化表结构
   - 定期维护

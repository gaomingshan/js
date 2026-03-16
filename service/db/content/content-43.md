# 数据页结构

## 概述

数据页（Page）是 InnoDB 存储引擎管理存储空间的基本单位，也是磁盘与内存交互的最小单位。理解数据页的内部结构，对于深入理解数据库的存储机制、优化性能、排查问题至关重要。

**核心概念**：
- **页**：固定大小的存储单元（默认 16KB）
- **页类型**：数据页、索引页、Undo 页等
- **页内结构**：文件头、页头、记录、目录、文件尾
- **行格式**：记录在页内的存储格式
- **页分裂与合并**：页空间管理机制

---

## 页的基本概念

### 1. 页大小

**默认大小**：
```
InnoDB 页大小：16KB（16384 字节）

配置：
innodb_page_size = 16384

可选值：
- 4KB (4096)
- 8KB (8192)
- 16KB (16384)  -- 默认
- 32KB (32768)
- 64KB (65536)

注意：
- 创建实例时指定
- 创建后无法修改
- 影响所有表
```

**查看页大小**：
```sql
-- 查看当前页大小
SHOW VARIABLES LIKE 'innodb_page_size';

-- 计算表的页数
SELECT 
    table_name,
    (data_length + index_length) / @@innodb_page_size AS total_pages,
    data_length / @@innodb_page_size AS data_pages,
    index_length / @@innodb_page_size AS index_pages
FROM information_schema.tables
WHERE table_schema = 'mydb'
ORDER BY total_pages DESC;
```

**页大小选择**：
```
4KB：
✓ OLTP 高并发
✓ SSD
✗ 页分裂频繁

8KB：
✓ 平衡选择

16KB（推荐）：
✓ 通用场景
✓ 平衡性能和空间

32KB/64KB：
✓ OLAP 分析
✓ 大记录
✗ 浪费空间
✗ Buffer Pool 效率降低
```

### 2. 页类型

**常见页类型**：
```
数据页（INDEX）：
- 存储表数据
- B+Tree 叶子节点

索引页（INDEX）：
- 存储索引
- B+Tree 非叶子节点

Undo 页：
- 存储 Undo Log

系统页：
- 存储系统信息

事务数据页：
- 存储事务信息

Insert Buffer 页：
- 存储 Change Buffer

空闲页：
- 未使用的页

其他：
- BLOB 页
- 压缩页
- 日志页
```

**查看页类型分布**：
```sql
SELECT 
    PAGE_TYPE,
    COUNT(*) AS page_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS pct
FROM information_schema.innodb_buffer_page
GROUP BY PAGE_TYPE
ORDER BY page_count DESC;
```

---

## 数据页结构

### 1. 整体结构

**页组成（16KB）**：
```
+------------------------+  0 字节
| File Header (38字节)   |  文件头
+------------------------+  38
| Page Header (56字节)   |  页头
+------------------------+  94
| Infimum + Supremum     |  最小/最大记录
| (26字节)               |
+------------------------+  120
| User Records           |  用户记录（实际数据）
| (动态大小)             |
+------------------------+
| Free Space             |  空闲空间
| (动态大小)             |
+------------------------+
| Page Directory         |  页目录
| (动态大小)             |
+------------------------+
| File Trailer (8字节)   |  文件尾
+------------------------+  16384

实际可用空间：16384 - 38 - 56 - 26 - 8 = 16256 字节
```

### 2. File Header（文件头）

**作用**：
```
存储页的元信息：
- 页类型
- 页号
- 校验和
- LSN（日志序列号）
- 前后页指针
```

**结构（38 字节）**：
```
字段                    大小    说明
--------------------    ----    ---------------------------
FIL_PAGE_SPACE          4       表空间 ID
FIL_PAGE_OFFSET         4       页号
FIL_PAGE_PREV           4       前一页页号
FIL_PAGE_NEXT           4       后一页页号
FIL_PAGE_LSN            8       最后修改的 LSN
FIL_PAGE_TYPE           2       页类型
FIL_PAGE_FILE_FLUSH_LSN 8       仅系统表空间第一页使用
FIL_PAGE_ARCH_LOG_NO    4       归档日志号
FIL_PAGE_SPACE_OR_CHKSUM 4      校验和
```

**页类型（FIL_PAGE_TYPE）**：
```
0x45BF  数据页（INDEX）
0x0002  Undo Log 页
0x0003  系统页
0x0005  事务系统页
0x0006  File Space Header
0x0008  Insert Buffer 空闲列表
0x0009  Insert Buffer 位图
0x000A  系统页
0xFFFF  未初始化
```

**页链表**：
```
双向链表连接同一层级的页：

Page1 ←→ Page2 ←→ Page3 ←→ Page4
  ↑                           ↑
PREV                        NEXT

通过 FIL_PAGE_PREV 和 FIL_PAGE_NEXT 连接
支持顺序扫描
```

### 3. Page Header（页头）

**作用**：
```
存储页内数据的状态信息：
- 记录数
- 空闲空间
- 已删除记录
- 目录槽数
```

**结构（56 字节）**：
```
字段                        大小    说明
--------------------------  ----    -----------------------
PAGE_N_DIR_SLOTS            2       页目录中的槽数
PAGE_HEAP_TOP               2       堆中第一个空闲记录的地址
PAGE_N_HEAP                 2       堆中的记录数
PAGE_FREE                   2       空闲记录链表头
PAGE_GARBAGE                2       已删除记录的字节数
PAGE_LAST_INSERT            2       最后插入记录的位置
PAGE_DIRECTION              2       最后插入的方向
PAGE_N_DIRECTION            2       同一方向连续插入的数量
PAGE_N_RECS                 2       页中用户记录的数量
PAGE_MAX_TRX_ID             8       修改此页的最大事务 ID
PAGE_LEVEL                  2       B+Tree 的层级（叶子=0）
PAGE_INDEX_ID               8       索引 ID
PAGE_BTR_SEG_LEAF           10      叶子节点段的信息
PAGE_BTR_SEG_TOP            10      非叶子节点段的信息
```

**重要字段说明**：
```
PAGE_N_RECS：
- 页中实际记录数
- 不包括 Infimum 和 Supremum

PAGE_FREE：
- 指向删除记录链表
- 空间回收利用

PAGE_LEVEL：
- B+Tree 层级
- 0 = 叶子节点（数据页）
- > 0 = 非叶子节点（索引页）

PAGE_DIRECTION：
- PAGE_LEFT：左插入
- PAGE_RIGHT：右插入
- PAGE_NO_DIRECTION：无方向
```

### 4. Infimum 和 Supremum

**作用**：
```
虚拟记录，标记边界：

Infimum：
- 最小记录
- 比页中任何记录都小

Supremum：
- 最大记录
- 比页中任何记录都大

记录链表：
Infimum -> Record1 -> Record2 -> ... -> RecordN -> Supremum
```

**结构（26 字节）**：
```
Infimum (13字节)：
- 5 字节记录头
- 8 字节 "infimum\0"

Supremum (13字节)：
- 5 字节记录头
- 8 字节 "supremum"
```

### 5. User Records（用户记录）

**作用**：
```
存储实际的数据行
按主键顺序排列（聚簇索引）
通过指针形成单向链表
```

**记录格式**：
```
每条记录包含：
- 记录头（Record Header）
- 隐藏列
- 实际数据列

记录头信息：
- 删除标记
- 记录类型
- 下一条记录的偏移量
- 堆序号
```

**记录链表**：
```
Infimum
  ↓
Record1 (主键=1)
  ↓
Record2 (主键=5)
  ↓
Record3 (主键=10)
  ↓
Supremum

按主键有序
通过 next_record 指针连接
```

### 6. Free Space（空闲空间）

**作用**：
```
未使用的空间
新记录插入到这里
从 User Records 向 Page Directory 增长
```

**空间分配**：
```
插入新记录：
1. 检查 PAGE_FREE（删除记录链表）
2. 如果有合适的空间，重用
3. 否则从 Free Space 分配
4. Free Space 不足时，页分裂
```

### 7. Page Directory（页目录）

**作用**：
```
记录的索引
加速页内查找
稀疏索引（不是每条记录都有）
```

**结构**：
```
槽（Slot）数组：
- 每个槽 2 字节
- 指向记录的偏移量
- 从页尾向前增长

槽分组：
- Infimum 一组（1条）
- 中间记录分组（4-8条/组）
- Supremum 一组（1-8条）
```

**二分查找**：
```
页内查找流程：
1. 在 Page Directory 二分查找槽
2. 找到所在槽
3. 在槽内线性查找
4. 定位到记录

时间复杂度：O(log n) + O(m)
n = 槽数
m = 每组记录数（4-8）
```

**示例**：
```
记录：1, 5, 10, 15, 20, 25, 30

Page Directory：
Slot0 -> Infimum
Slot1 -> Record(10)  -- 包含 1, 5, 10
Slot2 -> Record(20)  -- 包含 15, 20
Slot3 -> Supremum    -- 包含 25, 30

查找记录 15：
1. 二分查找槽：Slot1(10) < 15 <= Slot2(20)
2. 从 Record(10) 线性查找到 Record(15)
```

### 8. File Trailer（文件尾）

**作用**：
```
校验页的完整性
防止部分写入（Partial Write）
```

**结构（8 字节）**：
```
前 4 字节：校验和（与 File Header 中的一致）
后 4 字节：LSN 的低 4 字节（与 File Header 中的一致）

校验流程：
1. 读取页
2. 比较 File Header 和 File Trailer 的校验和
3. 比较 LSN
4. 如果不一致，页损坏
```

---

## 页的操作

### 1. 页内记录插入

**顺序插入**：
```
INSERT INTO users VALUES (1, 'Alice');
INSERT INTO users VALUES (2, 'Bob');
INSERT INTO users VALUES (3, 'Charlie');

页内布局：
Infimum -> 1 -> 2 -> 3 -> Supremum
           ↑
    PAGE_LAST_INSERT

空间利用率高
不产生碎片
```

**乱序插入**：
```
INSERT INTO users VALUES (1, 'Alice');
INSERT INTO users VALUES (10, 'Bob');
INSERT INTO users VALUES (5, 'Charlie');

页内布局：
Infimum -> 1 -> 5 -> 10 -> Supremum

插入 5 时：
1. 找到插入位置（1 和 10 之间）
2. 修改指针
3. 可能产生碎片
```

### 2. 页内记录删除

**逻辑删除**：
```sql
DELETE FROM users WHERE id = 5;

操作：
1. 标记记录为删除（delete_flag = 1）
2. 加入 PAGE_FREE 链表
3. 不立即回收空间
4. 后续插入可重用

页内布局：
Infimum -> 1 -> [5 deleted] -> 10 -> Supremum
                     ↓
                PAGE_FREE链表

PAGE_GARBAGE 增加
```

**空间回收**：
```
重用删除的空间：
1. 插入新记录
2. 检查 PAGE_FREE
3. 如果有合适大小的空间，重用
4. 否则从 Free Space 分配

OPTIMIZE TABLE：
- 重建表
- 回收碎片空间
```

### 3. 页分裂

**触发条件**：
```
插入记录时，Free Space 不足
```

**分裂流程**：
```
原页（Page1）：
| Record1 | Record2 | Record3 | Record4 | Record5 |
                           ↑
                    Free Space 不足

分裂：
1. 分配新页（Page2）
2. 移动部分记录到 Page2
3. 调整指针

结果：
Page1: | Record1 | Record2 | Record3 |
                              ↑
                         Free Space

Page2: | Record4 | Record5 |
                    ↑
               Free Space

链表：Page1 ←→ Page2
```

**分裂策略**：
```
顺序插入：
- 在页尾分裂
- 旧页保留所有记录
- 新页为空，接收新记录

乱序插入：
- 在中间分裂
- 记录平均分配
- 两页都有 Free Space
```

**性能影响**：
```
✗ 降低性能
- 分配新页
- 移动记录
- 更新索引

✗ 空间浪费
- 两个半满的页

✗ 碎片增加
```

**优化**：
```
1. 使用自增主键（减少分裂）
2. 预留 Free Space
3. 合理设置填充因子
4. 定期重建索引
```

### 4. 页合并

**触发条件**：
```
删除记录后，页使用率过低
相邻页可以合并
```

**合并流程**：
```
Page1: | Record1 | ............ |  -- 使用率低
Page2: | Record2 | Record3 | .. |  -- 使用率低

合并：
1. 将 Page2 的记录移到 Page1
2. 释放 Page2
3. 调整指针

结果：
Page1: | Record1 | Record2 | Record3 | .. |
                                    ↑
                               Free Space
```

**合并阈值**：
```
MERGE_THRESHOLD：
- 默认 50%
- 页使用率 < 50% 时尝试合并

配置：
ALTER TABLE users COMMENT='MERGE_THRESHOLD=40';
```

---

## 页的优化

### 1. 减少页分裂

**使用自增主键**：
```sql
-- 推荐
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE,
    name VARCHAR(50)
);

-- 顺序插入，在页尾追加
-- 很少分裂

-- 不推荐
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,  -- UUID
    name VARCHAR(50)
);

-- 乱序插入，频繁分裂
```

**预留空间**：
```sql
-- 设置填充因子（Oracle）
CREATE INDEX idx_name ON users(name)
PCTFREE 20;  -- 预留 20% 空间

-- InnoDB 无直接配置
-- 通过 MERGE_THRESHOLD 间接控制
```

### 2. 减少碎片

**定期优化**：
```sql
-- 重建表（回收碎片）
ALTER TABLE users ENGINE=InnoDB;

-- 或
OPTIMIZE TABLE users;

-- 注意：锁表，谨慎操作
```

**在线重建**：
```bash
# 使用 pt-online-schema-change
pt-online-schema-change \
  --alter="ENGINE=InnoDB" \
  D=mydb,t=users \
  --execute
```

### 3. 监控页使用

**查看表的页数**：
```sql
SELECT 
    table_name,
    (data_length + index_length) / @@innodb_page_size AS total_pages,
    data_length / data_free AS fragmentation_ratio
FROM information_schema.tables
WHERE table_schema = 'mydb'
    AND data_free > 0
ORDER BY fragmentation_ratio DESC;

-- fragmentation_ratio > 2：碎片较多，考虑优化
```

**分析页填充率**：
```sql
-- 使用 innodb_ruby 等工具分析
-- 或查看 information_schema.innodb_tablespaces
```

---

## 最佳实践

### 1. 表设计

```
□ 使用自增主键
□ 主键不要过大
□ 避免随机插入
□ 合理设计索引
□ 选择合适的数据类型
```

### 2. 索引维护

```
□ 定期分析表
□ 重建碎片化索引
□ 监控索引使用情况
□ 删除冗余索引
```

### 3. 空间管理

```
□ 监控表空间增长
□ 定期清理过期数据
□ 回收碎片空间
□ 设置合理的 MERGE_THRESHOLD
```

### 4. 性能优化

```
□ 批量操作减少页分裂
□ 顺序插入优于乱序
□ 避免频繁更新大字段
□ 使用覆盖索引减少回表
```

---

## 参考资料

1. **MySQL 官方文档**：
   - InnoDB Page Structure: https://dev.mysql.com/doc/refman/8.0/en/innodb-physical-structure.html

2. **推荐书籍**：
   - 《MySQL技术内幕：InnoDB存储引擎》

3. **分析工具**：
   - innodb_ruby：分析 InnoDB 页结构
   - mysqlpump：备份和分析

4. **最佳实践**：
   - 理解页结构
   - 优化表设计
   - 减少页分裂
   - 监控页使用
   - 定期维护优化

# 数据存储 — 一行数据到底存在哪

你可以熟练地写 SQL、设计表、建索引，但有一天排查一个奇怪的性能问题，最后发现根源是**一行数据在磁盘上是怎么存的**——这种经历会彻底改变你对数据库的理解。

这一节不讲存储引擎全部细节，只讲你写出来的 SQL 和数据在磁盘上的组织形式之间那条**因果链**。

---

## InnoDB 行格式

InnoDB 的默认行格式是 DYNAMIC（MySQL 5.7+），还有 COMPACT、REDUNDANT、COMPRESSED。你不需要记它们的细节，但需要知道它们都遵循同一个结构。

### 一行数据在磁盘上的结构

```
| 变长字段长度列表 | NULL 标志位 | 行头 | 字段1值 | 字段2值 | ... |
```

- **变长字段长度列表**：记录 VARCHAR、TEXT、BLOB 这类变长字段的实际长度。MySQL 用 1-2 字节存这个长度值。
- **NULL 标志位**：用一个 bit 标记"这个字段是 NULL"，不是用值存的。所以 NULL 不占用值的空间。
- **行头**：固定 5-6 字节，包含行的元信息（比如当前行的事务 ID、回滚指针等）。

### 行溢出

如果一个 VARCHAR 字段值太长（超过页大小 16KB），InnoDB 不会把整行塞在一个页里。它会：

1. 在当前页只存前 768 字节（COMPACT 格式）或只是存一个 20 字节的指针（DYNAMIC 格式）
2. 剩余内容存到**溢出页**（另外的页）

这就是为什么 TEXT/BLOB 的读取在物理上更慢——不仅要读当前页，还要读溢出页。

### 行格式对日常的影响

一个你需要知道的实战结论：**每行数据占用的空间越小，一个页能存的行数越多，Buffer Pool 的利用率越高，查询越快。**

这也是为什么字段类型选型（第三部分）不是无意义的精打细算——它是实实在在影响性能的。

---

## 页结构 — 理解 IO 的最小单位

### 页 = 16KB

InnoDB 里最小的 IO 单位是**页**（page），不是行。不管你读一条记录还是十条，InnoDB 都读取整页数据（16KB）到 Buffer Pool。

```
一条 SELECT 在 InnoDB 里的路径：
WHERE id = 100
  → 找到 id=100 所在的 B+Tree 叶子页
  → 把整页（16KB）加载到 Buffer Pool
  → 在页内二分查找定位到具体行
  → 返回行数据
```

这解释了为什么一次读一页的 100 条记录和只读一条记录，IO 开销几乎一样。

### 页的内部结构

```
页 = 16KB
├── 文件头（38 字节）：页号、上一页、下一页指针
├── 页头（56 字节）：槽数、空闲空间位置
├── Infimum + Supremum：最大最小记录（虚拟行）
├── 用户记录 ← 你存的数据
├── 空闲空间
├── 页目录（Page Directory）：槽（slot），每个槽指向一组记录
└── 文件尾（8 字节）：校验和
```

页目录的结构让你能理解：**在一个页内找一行数据，不是顺序扫描，而是在页目录里二分查找 O(log n)。**

### 一页能存多少行？

一个简单的计算：

```
可用空间 ≈ 16KB - 固定开销 ≈ 15.5KB
一行大小 ≈ 字段长度 + 变长长度列表 + NULL 标志 + 行头

如果一行 ≈ 200 字节（常见的小行）：
一页 ≈ 15500 / 200 ≈ 75 行

如果一行 ≈ 500 字节：
一页 ≈ 15500 / 500 ≈ 30 行
```

这引出了重要的概念——**B+Tree 的树高**。

---

## 树高 = IO 次数

假设你的 users 有 200 万行数据。

- 非叶子节点：每页存几百个键值对（只有主键值和指针，不存数据行）
- 叶子节点：每页存几十行数据

```
树高 = log_扇出(总行数)

扇出 ≈ 一页能存的非叶子节点条目数
      ≈ 16KB / (主键长度 + 指针长度)
      ≈ 16384 / (8 + 6) ≈ 1170

树高 = log_1170(200万) ≈ 2.2
```

这意味着：**200 万行的表，通过主键查一行，只需要 3 次 IO**（根节点 1 次 + 中间节点 1 次 + 叶子节点 1 次）。

如果换成 UUID 主键（16 字节）：

```
扇出 ≈ 16384 / (16 + 6) ≈ 744
树高 = log_744(200万) ≈ 2.4
```

差别不大？但写入时的代价不一样——UUID 是随机的，会频繁触发页分裂。这部分在索引部分细讲。

### 核心结论

**B+Tree 的查询效率来源于它将最多 IO 次数限制在树高以内。** 不管表多大，通过索引查一行就是 3-4 次 IO（绝大多数情况）。

---

## 聚簇索引 = InnoDB 表本身

这是一句非常重要的话，读三遍：

**InnoDB 的表本身就是一棵 B+Tree 聚簇索引。**

- 你的数据行存在 B+Tree 的叶子节点里
- 主键就是这棵 B+Tree 的排序依据
- 整张表就是一个以主键排序的索引

### 主键 = 表

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,       -- 聚簇索引的排序键
    username VARCHAR(50),
    email VARCHAR(100)
);
```

这行代码背后发生的是：

1. InnoDB 创建一棵 B+Tree
2. 非叶子节点存 (id, 指针)
3. 叶子节点存 (id, username, email) — **整行数据**

所以查询 `WHERE id = 1` 走聚簇索引，直接在叶子节点拿到全部数据，不需要"回表"。

而查询 `WHERE username = 'alice'` 走的是二级索引（如果你建了 idx_username）。二级索引的叶子存的是 (username, id)，然后根据 id 回聚簇索引拿整行。

### 主键选错 = 写入性能崩了

如果你选 UUID 做主键：

```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,  -- '550e8400-e29b-41d4-a716-446655440000'
    username VARCHAR(50)
);
```

每一行插入时：
1. UUID 是随机的，新插入的行大概率在现有数据**中间位置**
2. B+Tree 要在中间分裂叶子页（页分裂）
3. 页分裂涉及大量数据移动和索引调整
4. 而且 UUID 占 36 字节，比 INT（4 字节）多 9 倍，同样的页能存的键更少，树更高

如果换成自增 INT/BIGINT：
1. 新行永远追加在叶子节点的**最右边**
2. 只有当前页满了才创建新页（顺序追加）
3. 没有页分裂的额外开销

**在插入密集型场景里，自增主键比 UUID 主键快 3-5 倍不是什么新鲜事。**

但自增主键在分布式场景里又不能用（多个数据库实例各自自增 ID 会冲突）。这就是分布式 ID 生成器存在的意义。

---

## 这条 SQL 的背后

现在，当你执行这条 SQL：

```sql
SELECT username, email FROM users WHERE id = 100000;
```

你脑子里应该浮现出：

1. 检查 id=100000 是不是在 Buffer Pool 里
2. 不在 → 从磁盘读取包含 id=100000 的 B+Tree 根节点页（16KB）到 Buffer Pool
3. 在非叶子节点二分查找，找到下一级页号
4. 读取那个页，重复直到找到叶子节点页
5. 在叶子节点页内通过页目录二分查找定位到具体行
6. 返回 username 和 email

总共 3 次 IO（对于 100 万行级别的表），每次读 16KB。

这样你就理解了：

- **为什么 SELECT *** 比 **SELECT 具体字段** 慢？因为 CPU cache 和网络传输，但底层 IO 次数一样，都是读整页。
- **为什么索引能加速？** 本质上是用额外维护的 B+Tree 把全表扫描（大量 IO）变成了树查找（少量 IO）。
- **为什么大字段影响性能？** 行越大，一页能存的行越少，树越高，IO 次数越多。

---

## 这一节的核心思维

理解数据存储的最终目的不是为了背页结构，而是为了建立一条**从 SQL 到磁盘 IO 的因果链**：

```
你的 SQL
  → 优化器选索引
    → 索引是 B+Tree
      → B+Tree 叶子节点存数据或主键
        → 每次查索引要读页（16KB）
          → 页在 Buffer Pool 里命中还是从磁盘读
            → 磁盘 IO 次数决定查询性能
```

你写的每一行 SQL，最终都落在这条链的最后一环。

---

## 速查：InnoDB 行格式字节结构

InnoDB 的行格式（以 DYNAMIC 为例）在磁盘上是这样的：

```
| 变长字段长度列表（1-2字节/字段） | NULL位图（1-2字节） | 行头信息（5-6字节） | 字段1 | 字段2 | ... |
```

**1. 变长字段长度列表：**
- 只有 VARCHAR、VARBINARY、TEXT、BLOB 等变长字段会在此记录
- 长度 ≤ 255 字节：用 1 字节存
- 长度 > 255 字节：用 2 字节存
- 列表**逆序**存放（从最后一个变长字段到第一个）

**2. NULL 位图：**
- 每个允许为 NULL 的字段占 1 bit
- 总 bit 数 = NULL 字段数，向上取整到字节
- 8 个字段以内占 1 字节，16 个以内占 2 字节

**3. 行头（固定 5-6 字节）**
- `DB_TRX_ID`（6 字节）：最后修改这行的事务 ID
- `DB_ROLL_PTR`（7 字节）：指向 Undo Log 的回滚指针
- `REC_INFO`：记录类型（普通行/索引根/索引叶/最小/最大）
- `N_OWNED`：拥有的记录数（Page Directory 相关）

**4. 实际字段值：**
- NULL 的字段不占空间（由位图标记）
- 每个字段按创建表时的顺序排列

**示例计算：**
```sql
CREATE TABLE t (
    id INT,              -- 4 字节，NOT NULL
    name VARCHAR(50),    -- 变长
    age TINYINT,         -- 1 字节，可为 NULL
    email VARCHAR(100)   -- 变长，可为 NULL
);
-- 一行中 "alice", 25, NULL 的存储：
-- 变长长度列表: name=5(1字节) + email=0(在NULL位图标记) → 1 字节
-- NULL位图: 3个NULL字段(age,email) → 1 字节（只用3bit）
-- 行头: 5 字节
-- 字段: id(4) + "alice"(5) → age=NULL 不存 + email=NULL 不存
-- 总计: 1 + 1 + 5 + 4 + 5 = 16 字节（不含行首的变长列表）
```

## 速查：页内部布局

InnoDB 每页 16KB，内部结构：

```
| Fil Header(38) | Page Header(56) | Infimum+Supremum | User Records | Free Space | Page Directory | Fil Trailer(8) |
```

**1. File Header（38 字节）：**
- FIL_PAGE_OFFSET：页号
- FIL_PAGE_PREV / FIL_PAGE_NEXT：上一页/下一页指针（形成 B+Tree 叶子节点的双向链表）
- FIL_PAGE_TYPE：页类型（索引页、Undo 页、系统页等）
- FIL_PAGE_LSN：页最近修改的 LSN

**2. Page Header（56 字节）：**
- PAGE_N_RECS：记录数
- PAGE_LEVEL：页在 B+Tree 中的层级（0=叶子）
- PAGE_INDEX_ID：索引 ID
- PAGE_DIRECTION：插入方向（left/right/none）

**3. User Records：**
你存的数据行，物理上顺序不一定连续（有碎片空间）。

**4. Page Directory（页目录）：**
- 由 slot 组成，每个 slot 指向一组记录（1-8 条记录）
- slot 按主键顺序排列
- **在一个页内找某行时，先在 Page Directory 二分查找找到 slot，再在 slot 内顺序遍历**
- 这就是"页内查找也是 O(log n) 而不是 O(n)"的原因

**5. 页空间分配：**
- User Records 从页的底部向中间增长
- Page Directory 从页的顶部向中间增长
- Free Space 在中间，被两者"蚕食"
- 当你插入新行时，从 Free Space 中分配

## 速查：区（Extent）、段（Segment）、表空间

### 区（Extent）

- 64 个连续的页组成一个区（1MB）
- InnoDB 分配空间的最小单位是区，不是页
- 当一个段需要新空间时，一次分配一整区

为什么要用区？**为了让数据在磁盘上尽量连续。** 连续的数据在顺序读取时性能远好于离散的数据。

### 段（Segment）

- 一个索引对应两个段：**叶子节点段** + **非叶子节点段**
- 叶子节点段管理所有叶子页的空间
- 非叶子节点段管理所有内部节点页的空间

把叶子和非叶子分开存储的好处：**叶子节点的访问频率远高于非叶子节点，分开可以独立管理缓存策略。**

### 表空间

- `ibd` 文件就是一个表空间
- 一个 InnoDB 表对应一个 .ibd 文件（独立表空间模式）
- 表空间由若干个区（extent）组成
- 系统表空间（ibdata1）存放数据字典、Undo 信息等

```sql
-- 查看表空间模式
SHOW VARIABLES LIKE 'innodb_file_per_table';  -- ON=独立表空间

-- 查看表空间文件大小
SELECT file_name, round(bytes/1024/1024) as size_mb
FROM information_schema.files
WHERE file_name LIKE '%.ibd';
```

## 速查：碎片产生与回收

### 碎片是怎么来的

```
1. DELETE 行 → 页中留下"空洞"（行只是标记删除，不回收空间）
2. UPDATE 变长字段 → 新值比旧值长，旧位置放不下了，行移动到新页，原位变空洞
3. 页分裂 → 原页数据分到两页，两页都只剩约 50% 利用率
```

### 怎么看碎片

```sql
-- MySQL: 比较 data_free 字段
SELECT table_name, data_length, index_length, data_free,
       ROUND(data_free / (data_length + index_length) * 100) AS free_pct
FROM information_schema.tables
WHERE table_schema = 'mydb' AND table_name = 'users';

-- 如果 data_free 占比超过 20%，可以考虑重建
```

### 回收碎片

```sql
-- MySQL
ALTER TABLE users ENGINE = InnoDB;  -- 重建表（会锁表，谨慎）
OPTIMIZE TABLE users;                -- 同上，但可以在备库做

-- PostgreSQL
VACUUM FULL users;    -- 完全回收（锁表）
CLUSTER users;        -- 按索引重排（需先建索引）

-- Oracle
ALTER TABLE users MOVE;
ALTER INDEX idx_users REBUILD;
```

不是所有碎片都需要回收。小碎片（data_free < 10%）忽略，只在批量删除后 or 数据文件明显膨胀时做。

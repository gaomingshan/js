# 索引 — 全文核心

索引是数据库性能的命门。你遇到的大部分慢查询，根因都可以追溯到索引问题。

这一节的篇幅会比其他节都长，因为它是你在生产环境中**最常打交道的部分**。我按六个子节来组织：

- 5.1 索引的本质与类型
- 5.2 聚簇索引 vs 辅助索引（回表与覆盖索引）
- 5.3 联合索引与最左前缀
- 5.4 索引创建与代价
- 5.5 索引失效
- 5.6 索引优化策略

---

## 5.1 索引的本质与类型

### 索引的本质：把"遍历"变成"查找"

没有索引时你要找一行数据，数据库只能**全表扫描**——从第一页读到最后一页，逐行对比。这就是遍历。

有索引时，数据库走 B+Tree——从根节点开始**二分查找**，每一层排除掉大部分数据。这就是查找。

把 O(n) 变成 O(log n)，就是索引的全部秘密。

### 为什么是 B+Tree 不是其他数据结构？

| 数据结构 | 查询 | 范围查询 | 磁盘友好 |
|---------|------|---------|---------|
| 哈希表 | O(1) | ❌ 不支持 | 一次定位 |
| 二叉树 | O(log n) | 需要回溯 | ❌ 节点分散 |
| B-Tree | O(log n) | 需要回溯 | 节点=页大小 |
| **B+Tree** | **O(log n)** | **✅ 叶子链表** | **节点=页大小** |

B+Tree 胜出的两个关键原因：

**1. 叶子节点之间有链表**：找 `age BETWEEN 18 AND 30`，不需要反复在树里回溯。找到 18 的叶子节点后，顺着链表往后读到 30 即可。

**2. 一个节点 = 一个页（16KB）**：磁盘的最小 IO 单位就是页，所以一次 IO 刚好读取一个节点。B-Tree 每个节点存数据和指针，同样大小下能装的指针更少，树更高，IO 更多。

### Hash 索引为什么几乎用不上？

Hash 索引的查询是 O(1)，比 B+Tree 的 O(log n) 快。但它在数据库里是配角，原因很简单：

**Hash 索引不支持范围查询和排序。**

```sql
SELECT * FROM users WHERE age > 18;       -- ❌ 不能用 Hash
SELECT * FROM users ORDER BY created_at;   -- ❌ 不能用 Hash
```

以及 Hash 冲突、Hash 碰撞的处理成本。

MySQL 的 InnoDB 提供**自适应哈希索引（AHI）**——InnoDB 自动监控热点查询，如果你频繁 `WHERE id = xxx`，InnoDB 在内存里对这个 B+Tree 索引建一层 Hash 索引。你不需要手动创建。

PostgreSQL 允许手动创建 Hash 索引，但除了 `WHERE id = xxx` 这种纯等值场景，大部分场景 B+Tree 更通用。

### 全文索引和空间索引

**全文索引**用于文本搜索。MySQL 的 FULLTEXT、PostgreSQL 的 GIN + tsvector、Oracle 的 Oracle Text。

```sql
-- MySQL 全文索引
SELECT * FROM articles
WHERE MATCH(title, content) AGAINST('数据库' IN NATURAL LANGUAGE MODE);
```

**空间索引**用于 GIS 数据。PostgreSQL + PostGIS 是目前最强的组合。

这两个类型你大概率不会经常用到。知道它们的存在，用到时查文档就够了。

---

## 5.2 聚簇索引 vs 辅助索引

### 聚簇索引

InnoDB 的每张表有且只有一个聚簇索引：
- 你定义了主键 → 主键就是聚簇索引
- 你没定义主键 → InnoDB 选第一个非空 UNIQUE 列
- 都没有 → InnoDB 自动生成一个隐藏的 ROW_ID

聚簇索引的叶子节点存的是**整行数据**。所以一次 `WHERE id = 1` 就能拿到全部字段，不需要额外操作。

### 辅助索引（二级索引）

你手动创建的索引都是辅助索引：

```sql
CREATE INDEX idx_username ON users(username);
```

辅助索引的叶子节点存的是 **（索引列的值, 主键值）**。

所以通过辅助索引查数据，要做两步：

1. 在辅助索引 B+Tree 里找到匹配的索引值和对应的主键值
2. **用主键值去聚簇索引里查整行数据**

第二步就叫**回表**。

### 回表 = 随机 IO

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100)
);

CREATE INDEX idx_username ON users(username);

-- 这条 SQL 走了 idx_username，但需要回表
SELECT * FROM users WHERE username = 'alice';
```

执行过程：
1. idx_username 找到 username='alice' 的叶子节点 → 拿到 id=123
2. 用 id=123 到聚簇索引查整行 → 回表

如果只返回 1 行，回表 1 次没问题。但如果查询匹配了 10 万行，就要回表 10 万次——这就是随机 IO，性能灾难。

### 覆盖索引：不回表的秘密

```sql
-- 这条 SQL 不需要回表
SELECT username FROM users WHERE username = 'alice';
```

因为 idx_username 的叶子节点已经存了 `(username, id)`，你要的字段 username 就在索引里。执行计划会显示 `Using index`，表示"不需要回表，索引已经覆盖了查询需求"。

再看一个例子：

```sql
CREATE INDEX idx_username_email ON users(username, email);

-- 也覆盖了
SELECT username, email FROM users WHERE username = 'alice';
```

idx_username_email 的叶子存的是 `(username, email, id)`，你要的 username 和 email 都在索引里，不用回表。

**覆盖索引是索引优化里最便宜的"免费午餐"**——不用额外创建新索引，只是调整现有索引的列顺序或包含一些额外列，就能省掉大量回表 IO。

### 索引下推（ICP）

这是 MySQL 5.6 引入的优化，理解它有助于你理解"数据库是怎么优化回表的"。

```sql
CREATE INDEX idx_city_age ON users(city, age);

-- MySQL 5.6 之前的执行方式
SELECT * FROM users WHERE city = 'Beijing' AND age >= 18;
```

没有 ICP 时：
1. 在 idx_city_age 找到 city='Beijing' 的叶子节点
2. 对每个匹配行，**回表**拿到整行数据
3. 在 Server 层检查 age >= 18

有 ICP 时：
1. 在 idx_city_age 找到 city='Beijing' 的叶子节点
2. **在索引层面**检查 age >= 18（索引里有 age 值）
3. **只对通过 age 过滤的行**回表

区别是：**先过滤再回表 vs 先回表再过滤**。ICP 减少了回表次数，但不能消除回表。

---

## 5.3 联合索引与最左前缀

### (a, b, c) 能命中哪些查询？

建一个联合索引：

```sql
CREATE INDEX idx_a_b_c ON t(a, b, c);
```

B+Tree 的排序规则是：先按 a 排，a 相同按 b 排，b 相同按 c 排。

这意味着：

| 查询条件 | 能否用索引 | 原因 |
|---------|-----------|------|
| WHERE a = 1 | ✅ 用 a | 第一列有确定值 |
| WHERE a = 1 AND b = 2 | ✅ 用 a,b | 前两列有确定值 |
| WHERE a = 1 AND b = 2 AND c = 3 | ✅ 用全部 | 三列都有 |
| WHERE a = 1 AND c = 3 | ✅ 用 a，❌ 不用 c | b 没确定值，c 无法定位 |
| WHERE b = 2 | ❌ 不能用 | 第一列就没条件，无法走 B+Tree 根节点 |
| WHERE a > 1 AND b = 2 | ✅ 用 a，❌ 不用 b | a 是范围，b 在范围后的无序区间里不能用 |

### 为什么"最左前缀"不是规则，是结构决定的？

很多人背"最左前缀原则"，但不知道为什么。

想象 B+Tree 的一个联合索引节点：

```
| (1, 'a', 'x') | (1, 'b', 'y') | (2, 'a', 'z') | (3, 'c', 'w') |
```

这个节点是按 (a, b, c) 排序的。你来找 `b = 2`——没有 a 的值，你无法确定从哪找起，因为 `b = 2` 的行散落在各个 `a` 值下面。这就是为什么没有 a 的条件就无法使用联合索引。

但如果你找 `a = 1` —— 不管 b 和 c 的条件有没有，你能立刻定位到 a=1 的区间。

**理解了排序结构，就不需要背"最左前缀"了。**

### 常见误区：三个单列索引 ≠ 一个联合索引

```sql
-- 方式一：三个单列索引
CREATE INDEX idx_a ON t(a);
CREATE INDEX idx_b ON t(b);
CREATE INDEX idx_c ON t(c);

-- 方式二：一个联合索引
CREATE INDEX idx_a_b_c ON t(a, b, c);
```

方式一不是方式二的替代。方式一只能各自独立使用（或者 MySQL 做 Index Merge 合并使用，但有限制）。

方式二在查询 `WHERE a = 1 AND b = 2 AND c = 3` 时能用一棵 B+Tree **精确过滤**到目标行。方式一定要做 Index Merge（取三个索引的交集），代价更高。

### 联合索引设计原则

高频查询条件建在最左边。比如你的查询 80% 都带 `city` 条件，那就把 `city` 放第一列。

```sql
-- 如果你的查询模式是：
SELECT * FROM users WHERE city = 'Beijing' ORDER BY created_at DESC;
-- 索引应该建 (city, created_at)，不是 (created_at, city)
```

哪些列放前面？区分度高的、等值查询的、频繁在 WHERE 中出现的。

---

## 5.4 索引创建与代价

### 索引不是免费的

每创建一个索引，InnoDB 就额外维护一棵 B+Tree。

- **空间代价**：每个索引占用磁盘空间（一棵 B+Tree 的叶子节点存索引列 + 主键）
- **写入代价**：INSERT 每行要插入所有索引 B+Tree；UPDATE 如果更新了索引列，要移动索引树里的位置
- **优化器代价**：索引越多，优化器要考虑的执行计划越多，优化时间越长

### 什么时候该建索引？

**该建的场景：**
- WHERE 条件频繁使用的列
- JOIN 的连接列（外键）
- ORDER BY 经常排序的列
- 需要去重（UNIQUE）的列

**不该建的场景：**
- 小表（几百行），全表扫描比索引查找更快
- 频繁更新的列（索引维护成本超过查询收益）
- 低选择性的列（比如性别只有男/女，建索引也过滤不掉多少数据）
- 几乎不查询的列

### 索引命名规范

虽然不是必须的，但约定俗成的命名让 DBA 和维护者一目了然：

```
idx_表名_列名    → 普通索引
uk_表名_列名     → 唯一索引
ft_表名_列名     → 全文索引
```

例子：

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX uk_users_username ON users(username);
```

---

## 5.5 索引失效

### 所有索引失效的本质：破坏了 B+Tree 的有序性

B+Tree 能加速查询靠的是数据排好序了。一旦你破坏了这种有序性，索引就帮不上忙了。

### 类型转换

```sql
CREATE INDEX idx_phone ON users(phone);  -- phone 是 VARCHAR

SELECT * FROM users WHERE phone = 13800138000;  -- ❌ 索引失效
```

`phone` 是 VARCHAR，但你传了一个数字。MySQL 做了隐式类型转换（相当于 `CAST(phone AS INT)`），函数操作导致有序性破坏。

正确写法：

```sql
SELECT * FROM users WHERE phone = '13800138000';  -- ✅
```

### 函数操作

```sql
SELECT * FROM users WHERE UPPER(username) = 'ALICE';  -- ❌ 索引失效
```

`UPPER(username)` 改变了列的值，B+Tree 存的是原始值，无法按转换后的值查找。

解决方案：函数索引（MySQL 8.0+、Oracle、PostgreSQL）：

```sql
CREATE INDEX idx_upper_username ON users((UPPER(username)));
```

### LIKE 前缀模糊匹配

```sql
SELECT * FROM users WHERE username LIKE '%alice%';  -- ❌ 索引失效
```

% 在开头意味着你不知道字符串从哪开始，B+Tree 的有序性帮不上忙。

```sql
SELECT * FROM users WHERE username LIKE 'alice%';  -- ✅ 能用索引
```

### OR 条件

```sql
SELECT * FROM users WHERE id = 1 OR username = 'alice';
-- 如果 username 没有索引 → 索引失效，走全表扫描
```

OR 的任一条件不是索引列，优化器可能选择全表扫描。如果两边都能用到索引，MySQL 可以做 Index Merge。

### NOT、!=、<>

```sql
SELECT * FROM users WHERE status != 1;
```

不等于操作在 B+Tree 上无法精确定位。但优化器可能选择**索引扫描**（遍历索引树）来代替全表扫描，这取决于数据分布。

### 索引失效的排查方法论

你有一条 SQL 慢，怀疑索引没生效：

1. `EXPLAIN` 看 type 字段和 key 字段
2. 如果 `type = ALL`（全表扫描） 或 `type = index`（全索引扫描），说明有问题
3. 检查 WHERE 条件里是否有函数、类型转换、OR、LIKE 前缀匹配
4. 检查联合索引的列顺序是否符合最左前缀

---

## 5.6 索引优化策略

### 索引选择性

索引选择性 = 不同值的数量 / 总行数。选择性越高（接近 1），索引效果越好。

```sql
SELECT COUNT(DISTINCT column_name) / COUNT(*) FROM table_name;
```

性别列：男性、女性、未知——最多 3 个不同值，选择性很低。性别列建索引几乎没必要。

邮箱列：几乎每行都不同——选择性接近 1，建索引收益极高。

### Cardinality

`SHOW INDEX FROM table_name` 会显示 Cardinality 列。它表示索引列的不同值的估计数量。这个值是优化器判断"走不走这个索引"的重要依据。

注意是**估计值**，不是精确值。MySQL 通过采样统计来获取，不是每次更新表都重新算。

### MRR（Multi-Range Read）

MRR 是 MySQL 5.6 引入的优化，目的就是把回表产生的**随机 IO 变成顺序 IO**。

```sql
SELECT * FROM users WHERE age BETWEEN 18 AND 25;
-- 假设 age 上有二级索引
```

没有 MRR 时：在索引里找到一批主键值，然后依次回表。由于主键值不是顺序的，回表产生大量随机 IO。

有 MRR 时：把找到的主键值先排序，再按顺序回表。顺序读比随机读快得多。

MRR 由 `optimizer_switch` 中的 `mrr=on` 控制，通常是默认开启的。

### Index Merge

MySQL 可以在一条查询中同时使用多个索引，然后合并结果。

```sql
-- 假设 (a) 和 (b) 分别有索引
SELECT * FROM t WHERE a = 1 OR b = 2;
```

MySQL 可以：
1. 用 idx_a 找到 a=1 的行，得到主键集合 A
2. 用 idx_b 找到 b=2 的行，得到主键集合 B
3. 取 A ∪ B（并集），再去回表

但 Index Merge 不是银弹。很多时候建一个联合索引 (a, b) 比两个单列索引 + Index Merge 更高效。

### 索引碎片

增删改会让 B+Tree 产生空闲空间（页分裂后有空位、删除的行只是打标记）：

```sql
-- 查看索引碎片情况
SELECT
    table_name,
    ROUND(data_length / 1024 / 1024) AS data_mb,
    ROUND(index_length / 1024 / 1024) AS index_mb
FROM information_schema.tables
WHERE table_schema = 'mydb';
```

如果索引碎片严重，可以重建索引：

```sql
-- MySQL
ALTER TABLE tablename ENGINE=InnoDB;
-- 或
OPTIMIZE TABLE tablename;

-- PostgreSQL
REINDEX INDEX index_name;

-- Oracle
ALTER INDEX index_name REBUILD;
```

但不要没事就重建。只在大量删除后做——日常的碎片率对性能影响不大。

---

## 速查：B+Tree 查询路径详解

> 纯参考，理解这一块就不怕别人问"B+Tree 怎么工作的"。

### 树的结构

```
根节点（第 2 层）
  ├── [key_min, key_1) → 指向中间节点 A
  ├── [key_1, key_2) → 指向中间节点 B
  └── [key_2, key_max) → 指向中间节点 C

中间节点（第 1 层）
  ├── [min, k1) → 指向叶子节点 A1
  ├── [k1, k2) → 指向叶子节点 A2
  └── ...

叶子节点（第 0 层）
  └── 存实际数据行 或 (索引列, 主键)
  └── 每个叶子有 next/prev 指针连成双向链表
```

### 精确匹配（WHERE id = 100）

```
1. 根节点（页）加载到内存
2. 在根节点的键列表中二分查找
   找到 100 落在哪个区间的指针
3. 沿指针到下一层节点
4. 重复二分查找，直到叶子节点
5. 在叶子节点内通过 Page Directory 二分定位到行
```

总 IO 次数 = 树高（通常 3-4）。树高计算：

```
树高 = 1 + log_{扇出}(行数)
扇出 ≈ 16KB / (key_size + 指针大小)
     ≈ 16384 / (8 + 6) ≈ 1170（BIGINT 主键）

示例：
  100万行 → log_1170(1M) ≈ 2.0 → 树高 3
  1亿行  → log_1170(100M) ≈ 2.7 → 树高 4
  10亿行 → log_1170(1B) ≈ 3.2 → 树高 5
```

**不需要记公式，记结论：十亿行以内最多 5 次 IO。**

### 范围查询（WHERE id BETWEEN 100 AND 200）

```
1. 找到 id=100 的叶子节点（同精确匹配）
2. 在叶子节点的链表中**顺序后移**
3. 每次读取相邻叶子节点，直到 id > 200
```

这就是 B+Tree 比 B-Tree 更适合数据库的关键原因——**叶子链表让范围查询不需要反复回溯树**，性能稳定。

### 插入与页分裂

```sql
INSERT INTO users VALUES (42, 'alice');
```

当叶子页满了，需要插入一条"在中间位置"的新记录时：

```
1. 当前叶子页（假设 B+Tree 非叶子存 [1-100]）满了
2. 分配一个新页
3. 将原页的一半记录移动到新页
4. 在非叶子节点添加新页的入口键（通常是新页的最小值）
5. 非叶子节点也可能分裂 → 波及上一层 → 直到根
```

**自增主键 vs UUID 在插入时的差异：**

| 对比 | 自增主键 | UUID |
|------|---------|------|
| 插入位置 | 永远追加到最右页 | 随机落在中间页 |
| 页分裂 | 很少（只有最右页满了才分裂） | 每次都可能触发 |
| 页利用率 | 接近 100% | 约 69%（半页分裂导致） |
| Buffer Pool 污染 | 只有最右页热点 | 随机页，热点分散 |

---

## 速查：索引分类总表

| 索引类型 | 数据结构 | 特性 | 适用场景 | 支持 |
|---------|---------|------|---------|------|
| B+Tree 索引 | B+Tree | 支持等值/范围/排序/前缀查询 | 通用场景（90%+） | 所有数据库 |
| Hash 索引 | 哈希表 | 等值查询 O(1)，不支持范围/排序 | 纯等值查询 | Memory、InnoDB(AHI)、PG |
| 聚簇索引 | B+Tree | 数据行存叶子节点，一张表一个 | InnoDB 主键（自动） | InnoDB |
| 辅助索引 | B+Tree | 叶子存(索引列, 主键)，需回表 | 非主键查询 | 通用 |
| 覆盖索引 | B+Tree | 索引包含查询所有字段，不回表 | 高频查询优化 | 所有 |
| 联合索引 | B+Tree | 多列排序，最左前缀原则 | 多条件过滤 | 所有 |
| 唯一索引 | B+Tree | 值唯一，可做约束 | 唯一标识（邮箱、身份证） | 所有 |
| 全文索引 | 倒排索引 | 分词+关键词匹配 | 文本搜索 | MySQL(PG GIN) / Oracle Text |
| 空间索引 | R-Tree | 空间坐标/区域查询 | GIS、地理 | MySQL / PG(PostGIS) / Oracle |
| 函数索引 | B+Tree | 对表达式建索引 | UPPER/DATE/表达式查询 | MySQL8+ / PG / Oracle |
| 部分索引 | B+Tree | 只索引 WHERE 条件指定的行 | 过滤索引（活跃数据） | PostgreSQL |
| 位图索引 | 位图 | 空间小、组合查询极快 | 低基数 OLAP | Oracle |
| 自适应哈希 | 哈希表 | InnoDB 自动维护 | 热点等值查询 | InnoDB（自动） |

### 索引选择速查

```
查询模式                          → 推荐索引类型
等值查询 WHERE id = ?             → 主键或唯一索引
范围查询 WHERE id BETWEEN         → B+Tree + 聚簇
排序   ORDER BY created_at        → B+Tree + 覆盖
模糊   LIKE 'abc%'                → B+Tree
模糊   LIKE '%abc%'               → 全文索引
文本   MATCH ... AGAINST           → 全文索引
坐标   ST_DWithin(...)             → 空间索引
JSON   @> '{"k":"v"}'             → GIN（PG JSONB）
大小写  WHERE UPPER(name) = ?     → 函数索引
部分数据 WHERE status=1 AND ...   → 部分索引（PG）
```

---

## 速查：索引优化手段一览

| 优化手段 | 解决的问题 | 原理 | 启用条件 | 效果 |
|---------|-----------|------|---------|------|
| 覆盖索引 | 回表导致的大量随机 IO | 索引本身包含查询所需的所有字段 | 查询字段全部在索引中 | 大幅减少 IO |
| 索引下推（ICP） | 过多回表 | 在索引层面先过滤，减少回表行数 | MySQL 5.6+，extra 显示 Using index condition | 减少回表次数 |
| MRR（Multi-Range Read） | 随机 IO | 把回表的主键排序，变随机读为顺序读 | MySQL 5.6+，extra 显示 Using MRR | 回表性能提升 3-5 倍 |
| Index Merge | 单索引无法覆盖 OR/AND 条件 | 同时使用多个索引取交集/并集 | 查询条件能分别走不同索引 | 替代部分联合索引场景 |
| 索引排序优化 | filesort | 利用 B+Tree 有序性避免额外排序 | ORDER BY 列符合最左前缀 | 消除 filesort |
| 前缀索引 | 大字段索引用不完 | 只索引前 N 个字符 | LIKE 'abc%' 或短索引 | 减少索引空间 |
| 函数索引 | 函数导致索引失效 | 对函数结果预计算并索引 | UPPER/DATE(column) 查询 | 恢复索引使用 |
| 部分索引 | 低频数据占索引空间 | 只索引 WHERE status=1 的行 | 只查某部分数据（PG 特有） | 索引变小，写入快 |
| 索引碎片整理 | 空洞浪费空间 | 重建索引 | 大量 DELETE 后 | 空间回收 + 查询微优化 |

### 各优化手段优先级

```
遇到慢查询时，按这个顺序排：
1. 加索引（最直接）
2. 改覆盖索引（现有索引加 include 列，无需新增）
3. 检查是否有索引失效（类型转换、函数）
4. 重写 SQL（子查询→JOIN、OR→UNION）
5. 检查统计信息（ANALYZE TABLE）
6. 应用层优化（缓存、改写业务逻辑）
7. Hint（最后手段）
```



索引优化不是"多建几个索引"就能解决的。它是一个**权衡系统**：

- 读多写少 → 多建索引
- 写多读少 → 少建索引
- 查询模式集中 → 精确建联合索引
- 查询模式分散 → 覆盖通用查询条件

**索引不是你对抗慢查询的武器库，而是你在读性能和写性能之间做的每一笔交易。**

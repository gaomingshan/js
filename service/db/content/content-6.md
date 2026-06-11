# 查询优化器 — 你的 SQL 是怎么被"分析"的

你写完一条 SQL，数据库不会直接按你写的顺序执行。它会有个"中间人"来帮你决定：怎么跑最快。

这个中间人就是优化器。理解它的工作方式，你才能知道**为什么有时候 SQL 会突然变慢**，以及**在它选错的时候怎么纠正它**。

---

## CBO：基于成本的优化

### 核心逻辑

现代数据库都用 CBO（Cost-Based Optimizer），逻辑很简单：

1. 枚举各种可能的执行计划（走哪个索引、哪种 JOIN 顺序、哪种 JOIN 算法）
2. 用统计信息估算每个执行计划的**成本**
3. 选成本最低的那个

这里的"成本"是一组相对值，不是绝对时间。它的计算因素包括：
- IO 成本：从磁盘读数据（IO 是最贵的，单位时间内差了好几个数量级）
- CPU 成本：内存中的比较、排序、聚合

### 优化器不是在"选对的"，是在"选成本低的"

这个区别很重要。优化器不知道你的业务意图，它只看成本数字。

举个例子：

```sql
SELECT * FROM orders WHERE user_id = 100 ORDER BY created_at DESC LIMIT 10;
```

假设 orders 表有以下索引：
- 主键索引 (id)
- idx_user_id (user_id)
- idx_created_at (created_at)

优化器的选择：

**方案一：走 idx_user_id**
1. 在 idx_user_id 里找到 user_id=100 的所有行（可能 500 行）
2. 按 created_at 排序（filesort）
3. 取前 10 行返回

成本 ≈ 索引查找 + 回表 500 行 + 排序 500 行

**方案二：走 idx_created_at**
1. 从 idx_created_at 倒序遍历（从最新开始）
2. 回表检查 user_id=100
3. 找到 10 行就停

成本 ≈ 索引扫描 + 回表检查

如果用户数据分布是大部分行都是同一个 user_id（比如 user_id=100 的订单占了 50% 以上），方案一很亏——要先找 500 行再排序。方案二可能查 20 行就找到了 10 条目标数据。

优化器会根据统计信息选方案二。但如果统计信息不对，它可能选错。

---

## 统计信息：优化器的"眼睛"

### 统计信息是什么

对于每张表和索引，数据库会记录这些信息：

- **行数**（rows）：表有多少行
- **索引基数**（Cardinality）：索引列有多少个不同值
- **数据分布**：某些值占多大比例（用直方图表示）

优化器靠这些信息估算"某个索引能过滤掉多少数据"。

### 统计信息过期了，SQL 就会突然变慢

典型场景：

1. 你的表有 100 万行，统计信息显示 status=1 占 50%
2. 某次批量更新把 80% 的行改成 status=0
3. 但统计信息没更新
4. 优化器以为 status=1 还有 50 万行，走了全表扫描
5. 实际上 status=1 只剩 2 万行了，走索引更快

统计信息不会在每次数据变化后立刻更新。MySQL 默认通过 `innodb_stats_auto_recalc` 自动收集，但不是实时的。大量数据变更后，手动收集是个好习惯：

```sql
-- MySQL
ANALYZE TABLE orders;

-- PostgreSQL
ANALYZE orders;

-- Oracle
EXEC DBMS_STATS.GATHER_TABLE_STATS('schema', 'orders');
```

---

## 读懂执行计划

### 关键指标

```sql
EXPLAIN SELECT * FROM users WHERE id = 1\G
```

**1. type —— 访问类型（从好到坏排序）**

```
const       → 最多返回一行（主键/唯一索引等值查询）
eq_ref      → JOIN 时，被驱动表用主键/唯一索引匹配（每次最多一行）
ref         → 普通索引等值查询（可能返回多行）
range       → 索引范围查询（>, <, BETWEEN, LIKE 'abc%'）
index       → 遍历索引树（全索引扫描）
ALL         → 全表扫描（最差的情况）
```

面试常问：写 `ORDER BY` 怎么看有没有走索引排序？

如果 Extra 里有 `Using filesort`，表示没有用到索引排序，做了额外的排序操作。

**2. rows —— 估计扫描的行数**

优化器认为这个执行计划会扫描多少行。这个数字越小越好。

**3. Extra —— 重要的额外信息**

| 信息 | 含义 | 好坏 |
|------|------|------|
| Using index | 覆盖索引，不需要回表 | ✅ |
| Using index condition | ICP 索引下推 | ✅ |
| Using where | 先读数据再在 Server 层过滤 | 🟡 |
| Using filesort | 需要额外排序（没用到索引排序） | ❌ |
| Using temporary | 需要临时表（通常 GROUP BY 或 DISTINCT） | ❌ |

### 如何快速定位慢 SQL 的优化点

1. 看 type——如果是 ALL（全表扫描），优先考虑加索引
2. 看 Extra——如果有 Using filesort 或 Using temporary，考虑优化索引覆盖排序或分组
3. 看 rows——实际扫描行数远大于结果行数，说明过滤条件不够精确

---

## 优化器为什么会选错

除了统计信息过期，还有几个常见原因：

### 搜索空间太大

复杂查询（比如 JOIN 多个表、子查询嵌套）的可能执行计划数量爆炸。优化器不可能枚举所有可能，只能用启发式算法缩小搜索范围，有些选择是"近似最优但不一定最优"。

### 参数设置不当

MySQL 的 `join_buffer_size`、`sort_buffer_size` 等参数影响优化器对成本的判断。比如 Hash Join 需要一定内存才能用，如果内存参数太小，优化器会避免选择 Hash Join。

### 内存限制

查询优化本身也消耗 CPU 和内存。某些数据库对优化器的搜索深度做了限制（不是无限枚举），超过限制就取"还行"的方案。

### 怎么干预？

**1. 更新统计信息（最安全的做法）**

```sql
ANALYZE TABLE tablename;
```

**2. 改写 SQL**

有时候同样的逻辑，换一种写法能让优化器找到更好的路径。比如把子查询改写成 JOIN，或者把 OR 改写成 UNION。

**3. 用 Hint（不到万不得已不用）**

```sql
-- MySQL 强制走指定索引
SELECT * FROM users FORCE INDEX (idx_username) WHERE username = 'alice';

-- PostgreSQL
SET enable_seqscan = off;
```

Hint 的问题是：数据分布变了之后，强制走的索引可能不再是好选择。所以 Hint 是最后手段，不是常规优化手段。

---

## 高级优化技术（了解即可）

这部分内容不需要背，知道数据库有这些优化能力，遇到特定问题时能想到就行了。

### 谓词下推

```sql
SELECT * FROM users u JOIN orders o ON u.id = o.user_id
WHERE u.city = 'Beijing';
```

优化器会先把 `city='Beijing'` 过滤条件应用到 users 表上，减少参与 JOIN 的行数。

### 子查询物化

MySQL 5.7+ 引入。优化器发现子查询的结果集很小，会先执行子查询生成一个临时表，再跟外层做 JOIN。这比你手动改写成 JOIN 更高效。

### 半连接优化

```sql
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
```

优化器会把 IN + 子查询改写成半连接（semi-join），只需返回匹配的行，不需要像 JOIN 那样返回两表数据。MySQL 5.6+ 支持。

---

## 实战案例：一条慢 SQL 的完整排查过程

### 场景

订单列表页，查询某个用户最近的订单，接口响应时间从 50ms 突然变成 5 秒。

```sql
-- 原始 SQL（在 Java MyBatis 里自动生成）
SELECT o.*, u.username
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 1
  AND o.created_at >= '2024-01-01'
  AND o.created_at < '2024-04-01'
  AND u.vip_level IN (1, 2, 3)
ORDER BY o.created_at DESC
LIMIT 20;
```

### 第一步：看执行计划

```sql
EXPLAIN SELECT ...\G
```

结果：

| id | select_type | table | type | key | rows | Extra |
|----|------------|-------|------|-----|------|-------|
| 1 | SIMPLE | o | ALL | NULL | 2,000,000 | Using where; Using filesort |
| 1 | SIMPLE | u | eq_ref | PRIMARY | 1 | |

**问题定位：**
- `orders` 表是 **ALL（全表扫描）**，扫描 200 万行
- 虽然 `users` 表走了主键（eq_ref），但被驱动表快没有意义——驱动表太慢了
- `Using filesort` 表示排序也没用到索引

### 第二步：检查表结构和索引

```sql
SHOW CREATE TABLE orders\G
```

orders 表有 200 万行，索引情况：
- `PRIMARY KEY (id)`
- `INDEX idx_user_id (user_id)`
- `INDEX idx_created_at (created_at)` ✅

问题：`WHERE` 同时有 `status`、`created_at` 条件，但查询只用了全表扫描——没有索引同时覆盖 `status` 和 `created_at`。

### 第三步：建联合索引

```sql
ALTER TABLE orders ADD INDEX idx_status_created (status, created_at);
```

再查执行计划：

| id | select_type | table | type | key | rows | Extra |
|----|------------|-------|------|-----|------|-------|
| 1 | SIMPLE | o | **ref** | idx_status_created | 15,000 | Using index condition |
| 1 | SIMPLE | u | eq_ref | PRIMARY | 1 | |

注意：
- `type` 从 ALL 变成 **ref**
- `rows` 从 2,000,000 降到 15,000（只需要扫描 0.75% 的数据）
- `Extra` 显示 `Using index condition`（走了 ICP 下推）
- 但仍有 `Using filesort`——排序还在

### 第四步：优化排序

`idx_status_created(status, created_at)` 已经在索引里先按 status 排，再按 created_at 排，但 `ORDER BY o.created_at` 匹配的是**第二列**，无法直接用索引排序。

改成覆盖排序——把 `ORDER BY` 延后，先通过索引过滤并拿到主键，再排序：

```sql
-- 最终优化版本
SELECT o.*, u.username
FROM (
    SELECT id
    FROM orders
    WHERE status = 1
      AND created_at >= '2024-01-01'
      AND created_at < '2024-04-01'
    ORDER BY created_at DESC
    LIMIT 20
) tmp
JOIN orders o ON tmp.id = o.id
JOIN users u ON o.user_id = u.id;
```

执行计划：

| id | select_type | table | type | key | rows | Extra |
|----|------------|-------|------|-----|------|-------|
| 1 | PRIMARY | `<derived2>` | ALL | | 20 | |
| 1 | PRIMARY | o | eq_ref | PRIMARY | 1 | |
| 1 | PRIMARY | u | eq_ref | PRIMARY | 1 | |
| 2 | DERIVED | o | **range** | idx_status_created | 15,000 | **Using index condition** |

最终执行时间：从 **5 秒 → 15 毫秒**。

### 案例要点

1. 第一步永远是 `EXPLAIN`，看 `type` 是不是 ALL
2. 联合索引要把等值查询列放前面，范围查询列放后面（status=1 是等值，created_at 是范围）
3. 分页/排序在 LIMIT 时，先只查主键再回表，可以大幅减少排序成本
4. 每加一个索引都很谨慎——`idx_status_created` 多了 15MB 空间和写入代价，但换来了 300 倍的查询提升，值得

---

## 这一节的核心思维

优化器不是万能的，但你理解它的工作方式后，能少很多"SQL 为什么突然慢"的迷茫时刻：

- 优化器做决定靠的是**成本估算**
- 成本估算靠的是**统计信息**
- 统计信息不准 = 优化器可能选错
- 选错了先 ANALYZE TABLE，再考虑改写 SQL，最后考虑 Hint
- 读懂执行计划 = 知道优化器在做什么决定

**你不会每天都跟优化器打交道，但你每次打交道的时候，都是最着急的时候。提前理解它，能救你一次。**

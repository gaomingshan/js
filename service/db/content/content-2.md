# SQL 执行模型 — 你写的不只是"代码"

你每天都在写 SQL。但如果你问一个写了三年 CRUD 的开发者"SELECT 的执行顺序是什么"，能答对的人不多。

不理解执行顺序，你就很难解释：
- 为什么 WHERE 条件里不能直接用聚合函数？
- 为什么 `WHERE salary > 5000 AND ROW_NUM < 10` 这种"直觉写法"行不通？
- 为什么同样的 SQL，加了个索引就快了几十倍？

这一节把 SQL 执行模型的底层逻辑讲清楚。

---

## SELECT 执行顺序（最重要的 SQL 知识）

一条 SELECT 语句看上去是一行一行写的（SELECT → FROM → WHERE → ORDER BY），但数据库执行它是按这个顺序走的：

```
FROM/JOIN       → 确定数据来源
WHERE           → 过滤行
GROUP BY        → 分组
HAVING          → 过滤分组
SELECT          → 投影（选哪些列）
DISTINCT        → 去重
ORDER BY        → 排序
LIMIT/OFFSET    → 分页
```

### 为什么这个顺序这么重要？

**1. 别名在 WHERE 里不能用**

```sql
SELECT salary * 12 AS annual_salary
FROM employees
WHERE annual_salary > 100000;  -- ❌ 错误
```

为什么？因为 WHERE 在 SELECT 之前执行。当 WHERE 执行的时候，`annual_salary` 这个别名根本还不存在。

正确写法：

```sql
SELECT salary * 12 AS annual_salary
FROM employees
WHERE salary * 12 > 100000;  -- ✅
```

**2. WHERE 里不能放聚合函数**

```sql
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
WHERE AVG(salary) > 5000  -- ❌ 错误
GROUP BY department_id;
```

为什么？因为 WHERE 在 GROUP BY 之前执行。当你还在过滤行的时候，分组还没发生，哪来的平均值？

如果想过滤分组结果，用 HAVING：

```sql
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id
HAVING AVG(salary) > 5000;  -- ✅ 分组之后再过滤
```

**3. LIMIT 为什么不一定返回"前 N 条"**

如果你不写 ORDER BY，数据库返回顺序取决于存储引擎怎么读的数据——可能是主键顺序、插入顺序、甚至每次不一样。

```sql
SELECT * FROM users LIMIT 5;
-- 这次返回 id=1,2,3,4,5
-- 下次 DELETE 了几条再查，可能返回 id=3,6,7,8,9
```

没有 ORDER BY 的 LIMIT 是没有语义保证的。这在新手分页时最常见——"第一页和第二页的数据怎么重复了？"

---

## 了解 SELECT 执行顺序，这能解决你什么问题

面试题只是表面，实际价值更大：

- 你在写链式查询时，知道每一步会产生什么中间结果
- 你在优化慢查询时，能判断瓶颈出在哪个阶段（是 WHERE 过滤不够？还是 GROUP BY 太慢？）
- 你在对比两条 SQL 时，能快速看出"执行顺序"差异导致的性能区别

---

## DML 的底层流程

INSERT、UPDATE、DELETE 底层逻辑比 SELECT 多一步——**它们都涉及先读再改。**

### UPDATE 的执行路径

```sql
UPDATE users SET balance = balance - 100 WHERE id = 1;
```

这条语句的执行步骤：

1. 执行器调用存储引擎，按 WHERE 条件找到 id=1 这行
2. 存储引擎在 Buffer Pool 里找到这行所在的数据页（没找到就从磁盘加载）
3. 记录 Undo Log（用于事务回滚和 MVCC）
4. 记录 Redo Log（用于持久性保证和崩溃恢复）
5. 在内存里修改这行数据（标记为脏页）
6. 写入 Change Buffer（如果有二级索引要更新）
7. 后台异步刷脏页到磁盘

注意：没有"先 SELECT 出来看到 balance=1000，再 UPDATE"这个步骤。数据库内部是在一次索引查找中定位到行，直接在内存改值。

### DELETE 的行不是真的消失

```sql
DELETE FROM users WHERE id = 1;
```

InnoDB 的 DELETE 实际上是给这行数据打了一个**"已删除"标签**，不会立即回收物理空间。什么时候回收？后台 purge 线程定期清理。

这就是为什么你删了 100 万行数据，但 ibd 文件大小没变。要让空间真正释放，需要：

```sql
OPTIMIZE TABLE users;  -- 重建表，释放空间
-- 或者 ALTER TABLE ... ENGINE=InnoDB;
```

### INSERT 的性能关键点

```sql
INSERT INTO users VALUES (1, 'alice'), (2, 'bob');
```

INSERT 的核心开销不在写入数据行本身，而在**维护索引**。

- 每建一个二级索引，INSERT 就要多维护一棵 B+Tree
- 主键如果不是自增的（比如 UUID），字符集的随机性会导致频繁的页分裂

你的表如果有 5 个二级索引，一次 INSERT 其实是在写 6 棵 B+Tree（1 棵聚簇索引 + 5 棵二级索引）。

---

## DDL 事务差异

这是一个实际工作中经常遇到的坑。

### MySQL：DDL 会隐式提交当前事务

```sql
START TRANSACTION;
INSERT INTO users VALUES (1, 'alice');
ALTER TABLE users ADD COLUMN age INT;  -- 此处隐式 COMMIT
ROLLBACK;  -- ❌ 无法回滚前面的 INSERT
```

MySQL 的每个 DDL 语句开始前都会隐式提交当前事务，DDL 本身也不能回滚。

**8.0 有原子 DDL**：DDL 本身是原子的（比如 CREATE TABLE 中途不会留下一半），但 DDL 依然会提交之前的事务。

### PostgreSQL：DDL 可以在事务里回滚

```sql
BEGIN;
INSERT INTO users VALUES (1, 'alice');
ALTER TABLE users ADD COLUMN age INT;
ROLLBACK;  -- ✅ 连 ALTER 带 INSERT 全部回滚
```

PostgreSQL 是唯一一个支持事务型 DDL 的主流数据库。这意味着在 PostgreSQL 里，你可以安全地在一个事务里做表结构变更，出错了全回滚。

### Oracle：DDL 也会自动提交

Oracle 跟 MySQL 类似，执行 DDL 前会隐式提交当前事务。

### 这个差异对日常工作的影响

你在 MySQL 里做数据迁移或初始化脚本时，记住：**不要在 DDL 前后依赖事务的连续性。**

例如这个脚本在 MySQL 里是有问题的：

```sql
START TRANSACTION;
-- 做一些数据清理
DELETE FROM temp_data WHERE created_at < '2023-01-01';
-- 改表结构
ALTER TABLE temp_data ADD COLUMN processed TINYINT;  -- ❌ 这里隐式提交了
-- 如果后面报错，前面的 DELETE 也回不去了
ROLLBACK;
```

而在 PostgreSQL 里，这是完全安全的。

---

## JOIN 的本质与算法选择

### JOIN 不是"把两张表拼在一起"

很多教程用韦恩图来教 JOIN，那个用来理解结果是没问题的，但用来理解性能就错了。

**JOIN 的本质是"从一张表取一行，去另一张表找匹配行"。** 数据库不知道什么叫"交集"，它只知道从 A 取一行，去 B 找对应行。

### 三种 JOIN 算法

数据库内部有三种方式实现这个"找对应行"的动作：

**1. Nested Loop Join（嵌套循环）**

最直观的方式：

```
for each row in table_A:
    for each row in table_B:
        if match(A.row, B.row):
            output
```

问题是：如果 A 有 1 万行，B 有 10 万行，那就要比较 1 万 × 10 万 = 10 亿次。

**优化版——索引嵌套循环**：

如果 B 的关联列有索引，内层的"遍历 B"就变成了"从索引找一行"：

```
for each row in table_A:
    lookup in table_B's index     -- O(log n)，不是全表扫描
    if found:
        output
```

这样 1 万次 × 1 次索引查找，代价可以接受。

**2. Hash Join**

把一张表的关联列全部读出来，在内存里构建一个哈希表。然后扫描另一张表，每一行去哈希表里找匹配。

适合场景：**大表 JOIN、没有索引、等值连接。**

MySQL 8.0 才支持 Hash Join。在这之前，MySQL 遇到大表 JOIN 没有索引时特别慢——因为它只能用 Nested Loop，走全表扫描。

PostgreSQL 和 Oracle 早已支持。所以 MySQL 8.0 用户升级后，有些 SQL 突然变快了，就是这个原因。

**3. Merge Join**

先把两张表按关联列排好序，然后像合并两个有序数组一样，各走各的，一次搞定。

适合场景：**关联列本身就有索引（天然有序），或者结果集需要排序。**

### 数据库怎么选算法？

优化器根据这些因素选：
- 表的大小
- 有没有索引
- 关联列的数据分布（统计信息）
- 可用的内存大小（Hash Join 需要足够内存建哈希表）

对于你来说，需要知道的是：**大部分 JOIN 慢的问题，归根结底是 Nested Loop 在被驱动表上走了全表扫描**。解决方案就是在被驱动表的关联列上加索引。

---

## 子查询 vs JOIN vs CTE

### 子查询的问题

```sql
SELECT * FROM users
WHERE department_id IN (
    SELECT id FROM departments WHERE name = 'Engineering'
);
```

子查询的常见问题：优化器可能选择"先执行子查询，再对外层做全表扫描"，导致外层索引用不上。

以前 MySQL 5.6 之前，子查询性能普遍比 JOIN 差。现在优化器已经能很好地把子查询改写成 JOIN 了，但不是 100% 都能改写。

### CTE：不是语法糖，是优化边界

```sql
WITH engineering_dept AS (
    SELECT id FROM departments WHERE name = 'Engineering'
)
SELECT * FROM users
WHERE department_id IN (SELECT id FROM engineering_dept);
```

CTE（Common Table Expression）和子查询的区别在于：

- 子查询在每次引用时都重新执行
- CTE 在某些数据库里可以只执行一次、复用结果
- CTE 在 PostgreSQL 里是一个**优化边界**：优化器不会把 CTE 内部的逻辑和外部的优化在一起，这对复杂查询来说是控制优化器的武器

### 什么时候用什么

| 场景 | 推荐 |
|------|------|
| 简单子查询 | JOIN（显式连接条件，性能更可控） |
| 递归查询 | CTE（只有 CTE 支持递归） |
| 多次引用同一个子查询结果 | CTE |
| 需要控制优化器行为 | CTE（作为优化边界） |

---

## 这一节的核心思维

现在你写一条 SQL 时，脑子里应该是这样的：

- SELECT 不是先执行的，FROM/JOIN 才是
- WHERE 不能放聚合函数，不是"规则"，是"顺序决定的"
- UPDATE 不是直接改磁盘，是在内存里改，日志先写
- DDL 在不同数据库里对事务的影响不一样
- JOIN 慢的本质是在被驱动表上走了全表扫描
- 子查询、CTE、JOIN 各有适用场景

**理解执行模型，你才不是在"写 SQL"，而是在跟数据库协商一条执行路径。**

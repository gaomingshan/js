# 数据库架构全貌 — 先在心里画一张地图

大部分开发者接触数据库是从写 SQL 开始的。SELECT、INSERT、UPDATE、DELETE 都会写，但你有没有想过：**当你敲下回车的那一瞬间，数据库内部到底发生了什么？**

这一节我们不谈具体语法，先在你脑子里建一张完整的**数据库请求路径图**。

---

## 一条 SQL 的一生

无论 MySQL、PostgreSQL 还是 Oracle，一条 SQL 从输入到返回结果，大致经过这么几个阶段：

```
客户端 → 连接器 → 解析器 → 优化器 → 执行器 → 存储引擎 → 磁盘
```

### 1. 连接器

你 `mysql -h 127.0.0.1 -u root -p` 敲完密码，数据库先做的事情是：
- 校验身份（用户名 + 密码）
- 检查权限（你有权访问这张表吗？）
- 分配一个数据库连接（对应一个线程/进程）

这就是为什么 `max_connections` 不能设太大——每个连接都要消耗资源。你遇到过 `Too many connections` 报错吗？多半是应用层连接池泄漏了，不是真的需要几万个连接。

### 2. 解析器

SQL 到了解析器，它要回答第一个问题：**"这串字符是什么意思？"**

解析器做的事：
- 词法分析：把 `SELECT * FROM users WHERE id = 1` 拆成一个个 token（SELECT、*、FROM、users、WHERE、id、=、1）
- 语法分析：检查 token 组合是否符合 SQL 语法，生成**解析树**
- 语义分析：检查表和字段存不存在、你有没有权限

如果这一步报错，你看到的就是 `Unknown column` 或 `Table not found`。**SQL 还没真正执行就已经死了**。

### 3. 优化器

这是最关键的一步。解析器只是"懂了你的 SQL"，优化器要回答第二个问题：**"怎么执行最快？"**

同样一条 `SELECT * FROM users WHERE id = 1;`
- 是直接全表扫描，还是走主键索引？
- 如果 JOIN 三张表，先查哪一张做驱动表？
- 子查询是先执行还是先改写成 JOIN？

优化器根据**统计信息**（表的行数、索引选择度、数据分布）计算各种执行计划的**成本**，选成本最低的那个。

这里有个现实问题：**优化器不是全能的**。统计信息过期了、索引选择度不准、复杂查询的搜索空间太大——优化器都可能选错。后文第六部分会展开讲。

### 4. 执行器

优化器选好了路径（执行计划），执行器按这个路径**真正干活**。

它做的事情比看上去复杂：

**1. 按执行计划调存储引擎接口**

优化器输出的执行计划类似"第一步：走 idx_username 索引找 username='alice'，第二步：回表取整行"。

执行器把这个翻译成对存储引擎的 API 调用：

```sql
-- 执行器内部流程大致是这样
row = storage_engine.index_read('idx_username', 'alice')  -- 从索引拿主键
row = storage_engine.row_read_by_id(123)                   -- 按主键回表
return row
```

**2. 行式读取 vs 批量读取**

执行器可以一行一行从存储引擎取（迭代器模式），也可以一次取一批。MySQL 的 `prefetch` 就是批量读取的优化，减少调用次数。

**3. 应用 Server 层的过滤条件**

不是所有条件都能在索引层过滤掉。比如：

```sql
SELECT * FROM users WHERE username = 'alice' AND status = 1;
```

如果索引只有 `idx_username`，执行器从存储引擎拿到 `username='alice'` 的行后，还要在 Server 层检查 `status=1`。`Extra` 里的 `Using where` 就是告诉你"这里做了一层额外过滤"。

**4. LIMIT 控制**

执行器不需要把存储引擎返回的所有行都取出来再截断。它可以告诉存储引擎"够了，后面不需要了"——这就是 `LIMIT` 能优化查询的底层原因。

**5. 排序**

`ORDER BY` 如果索引帮不了忙（Extra 里有 `Using filesort`），执行器会自己排序。排序发生在 Server 层，不涉及存储引擎。数据量小时在内存排（`sort_buffer_size`），大了用磁盘临时文件排。

```sql
-- 这条 SQL：
SELECT * FROM users WHERE city = 'Beijing' ORDER BY created_at DESC LIMIT 10;
-- 执行器的工作：
-- 1. 调存储引擎：走 idx_city 找到 city='Beijing' 的所有行
-- 2. Server 层按 created_at 排序（filesort）
-- 3. 取前 10 条返回
```

> 执行器本身不做"优化决策"——那是优化器的事。执行器只管**忠实地执行优化器给的方案**。优化器选错了，执行器也执行得很"快"——只是快在执行了一个坏方案上。

### 5. 存储引擎

MySQL 管这层叫"存储引擎"，PostgreSQL 和 Oracle 叫"数据存取层"。**这里才是数据真正被读写的层面。**

对于一条读取请求：
1. 在 Buffer Pool 里找——找到了直接返回（内存命中）
2. 没找到——从磁盘读页到 Buffer Pool
3. 返回结果

对于一条写入请求：
1. 先写 Redo Log（顺序写，很快）
2. 再修改 Buffer Pool 里的内存页（这页变成"脏页"）
3. 脏页在后台刷回磁盘

等等，这里有个重要的概念——**WAL（Write-Ahead Logging）**。所有主流数据库都遵循 WAL 原则：**先写日志，再写数据**。为什么？下一节讲。

### 6. 整个流程串起来

以一条 `SELECT` 为例：

```
你敲下 SELECT * FROM users WHERE username = 'alice' LIMIT 10;

1. 连接器：验证你有权访问 users 表
2. 解析器：拆成 token，检查 username 列存在，生成解析树
3. 优化器：看统计信息→发现 idx_username 选择性高→选 idx_username
4. 执行器：调 storage_engine.index_read('idx_username', 'alice')
5. 存储引擎：在 B+Tree 中找到叶子节点，返回主键
6. 执行器：回表拿整行 → 发现够了10条 → 告诉引擎"别查了"
7. 存储引擎：返回结果
```

以一条 `UPDATE` 为例：

```
UPDATE users SET balance = 900 WHERE id = 1;

1-3：同上
4. 执行器：调 storage_engine.index_read('PRIMARY', 1) 找到行
5. 存储引擎：
   a. 记录 Undo Log（旧值 balance=1000）
   b. 记录 Redo Log（写日志，WAL）
   c. 修改 Buffer Pool 中的 balance=900（脏页）
6. 执行器：告诉客户端"更新成功"
7. 后台：Checkpoint 触发时脏页刷盘
```

---

## 理解这个流程有什么用？

你现在看到一条慢查询，脑子里应该会沿着这个路径排查：

- 连接阶段卡？→ 检查连接池、网络延迟
- 解析阶段慢？→ SQL 太复杂、没有绑定变量
- 优化器选错？→ 统计信息过旧、需要加 Hint
- 执行阶段慢？→ 索引缺失、Buffer Pool 太小、磁盘 IO 瓶颈

**遇到问题能定位是哪一层的问题**，这就是第一张地图的价值。

---

## InnoDB 架构速写

如果你主要用 MySQL，InnoDB 是你打交道最多的存储引擎。它的核心组件不多，但每个都对应着一个优化点：

### Buffer Pool

InnoDB 读写数据，有一个前提：**所有操作都在内存里完成**。

Buffer Pool 就是 InnoDB 的内存区域，它缓存了你访问过的数据页。当你查一条记录时，InnoDB 把整页数据（16KB）加载到 Buffer Pool 里，然后从内存返回。

看几个相关的 MySQL 变量：

```
innodb_buffer_pool_size       # Buffer Pool 大小（通常是物理内存的 60-80%）
innodb_buffer_pool_instances  # Buffer Pool 分多少实例（减少锁争用）
```

性能调优里最划算的操作：**把 Buffer Pool 设大**。少了这块内存，数据就要频繁读磁盘——磁盘 IO 比内存慢几个数量级。

### Redo Log Buffer

InnoDB 的持久性保证来自 Redo Log。事务提交时，InnoDB 不急着把数据页写入磁盘（太慢了），而是先写 Redo Log（顺序写，快得多）。

理解这个顺序很重要：

```
事务提交
  ↓
写入 Redo Log（顺序写磁盘）  ← 这一步完成后返回"提交成功"
  ↓
后台刷新脏页到磁盘（随机写，耗时）  ← 这一步是异步的
```

相关变量：

```
innodb_log_file_size           # Redo Log 文件大小
innodb_log_files_in_group      # Redo Log 文件组数量
innodb_flush_log_at_trx_commit # 刷盘策略（0/1/2）
```

`innodb_flush_log_at_trx_commit=1` 的意思是：每次提交都刷盘。这是最安全的设置，也是 MySQL 默认值。如果你能接受丢失 1 秒的数据（比如日志表），设成 2 能提高不少性能。

### Change Buffer

这是一个容易被人忽视的优化。当你 INSERT/UPDATE 一行时，不仅要改聚簇索引（主键），还要改二级索引（如果有）。

但问题来了：**如果二级索引对应的数据页在 Buffer Pool 里找不到呢？** 按常规流程，你要立刻把磁盘上的那页读到内存里再改——这很慢。

Change Buffer 的思路：先记录下来"这个二级索引的修改暂缓"，等下次查询真的读到这页时，再把这些修改合并进去。省了一次磁盘读。

对写密集的场景（尤其是 INSERT 很多、二级索引很多），Change Buffer 能带来可观的性能提升。

相关变量：

```
innodb_change_buffer_max_size   # Change Buffer 占 Buffer Pool 的百分比（默认 25%）
```

### Adaptive Hash Index

InnoDB 会自动监控索引查询的模式，如果发现某个索引的等值查询非常频繁，它会自动在 B+Tree 索引上建立一层**内存中的 Hash 索引**，让等值查询从 B+Tree 的 O(log n) 降为 Hash 的 O(1)。

你不需要配置它，知道它在就行。而且它也不总是好事——在高并发写入时，AHI 的维护本身也有成本。MySQL 8.0 提供了 `innodb_adaptive_hash_index` 参数，可以在极端场景下关闭它。

---

## 速查：MySQL 存储引擎对比

MySQL 跟其他数据库最大的不同是**插件式存储引擎**——同一张数据库里不同表可以用不同引擎。但平时你几乎只用 InnoDB，其他引擎只需要了解它们在什么场景下出现。

| 引擎 | 事务 | 锁粒度 | 特点 | 适用场景 | 现状 |
|------|------|--------|------|---------|------|
| **InnoDB** | ✅ | 行锁 | ACID、MVCC、外键、崩溃恢复 | **通用场景首选** | 默认引擎 |
| MyISAM | ❌ | 表锁 | 全文索引、压缩表、count(*)极快 | 只读表、日志汇总、数据仓库 | 逐渐淘汰 |
| Memory | ❌ | 表锁 | 数据全在内存，重启丢数据 | 临时表、缓存、会话数据 | 少量场景 |
| CSV | ❌ | 表锁 | 文件就是 CSV 格式，可直接编辑 | 数据交换、导出 | 极少用 |
| Archive | ❌ | 行锁 | 高压缩比、只支持 INSERT + SELECT | 日志归档 | 极少用 |
| NDB Cluster | ✅ | 行锁 | 分布式、内存、高可用 | 高可用强一致集群 | 特定场景 |
| Merge | ❌ | 表锁 | MyISAM 表的集合视图 | 分表查询（已过时） | 淘汰 |

### InnoDB vs MyISAM 经典对比

在 MySQL 5.5 之前 MyISAM 是默认引擎，很多老系统还在用。

```sql
-- MyISAM 表
CREATE TABLE t (id INT, name VARCHAR(50)) ENGINE=MyISAM;
```

**MyISAM 比你想象中快的地方：**
- `SELECT COUNT(*)`：MyISAM 维护了行数计数器，不扫描表直接返回
- 压缩表：MyISAM 支持 `myisampack` 压缩为只读，空间极小
- 全文索引：在 InnoDB 支持全文索引之前，MyISAM 是唯一选择

**MyISAM 的致命弱点：**
- **没有事务**：写入中途崩了，表可能损坏（需要 `REPAIR TABLE`）
- **表锁**：`UPDATE` 锁整张表，写入并发基本为零
- **没有崩溃恢复**：异常断电后 MyISAM 表损坏概率远高于 InnoDB

```sql
-- 检查表引擎
SELECT table_name, engine FROM information_schema.tables
WHERE table_schema = 'mydb';

-- 切换引擎（会重建表，注意锁表）
ALTER TABLE users ENGINE = InnoDB;
```

**结论：所有新项目，全部用 InnoDB。遇到 MyISAM 的老表，尽早迁移。**

### InnoDB vs Memory

Memory 引擎的数据全在内存里，读写极快，但：

```sql
CREATE TABLE cache (id INT PRIMARY KEY, data VARCHAR(100)) ENGINE=MEMORY;
```

- 重启后数据全丢
- 支持 `HASH` 索引（等值查询 O(1)）
- 表锁（不是行锁）
- 不能存 TEXT/BLOB 字段

MySQL 8.0 之前，`GROUP BY` 的临时表默认用 Memory 引擎，超限后转磁盘 MyISAM。8.0 之后改了。

Memory 引擎如今很少手动使用，它的功能场景基本被 Redis 覆盖。了解即可。

---

## 三大数据库的思维模型

很多教程喜欢放三种数据库的架构图让你对比。但那样只是增加了记忆负担。

更有效的做法是：**每种数据库用一句话抓住它的思维模型。**

### MySQL：插件式引擎，简单就是生产力

MySQL 的设计哲学是"把存储这件事留给引擎决定"。InnoDB、MyISAM、Memory 可以替换，甚至能在同一张数据库里混合使用不同引擎。

MySQL 的强项：
- 部署简单，运维轻量
- 主从复制生态成熟
- 互联网场景经验丰富（读写分离、分库分表）

弱项也很明显：
- 优化器比较"天真"（Oracle 和 PG 在很多场景下优化得更好）
- 存储过程能力弱（别在 MySQL 里写复杂的存储过程）
- 并行查询能力有限（8.0 才开始有这个功能，不如 PG 和 Oracle）

**一句话**：如果你的场景是互联网常见应用（CRUD + 读写分离），MySQL 是最省心的选择。

### PostgreSQL：扩展驱动，标准化先行者

PostgreSQL 的设计哲学是"我们要做最符合 SQL 标准的数据库，而且你可以扩展任何东西"。

PostgreSQL 的强项：
- SQL 标准覆盖率最高（窗口函数、CTE、递归查询都是原生支持）
- 扩展性极强（插件机制，PostGIS、TimescaleDB、Citus 都是插件）
- 数据类型最丰富（JSONB 比 MySQL 的 JSON 强、数组、hstore、自定义类型）
- 优化器能力优秀
- DDL 是事务型的（能回滚！MySQL 做不到）

弱项：
- 复制生态不如 MySQL 成熟（逻辑复制是后来才完善的）
- 社区中文资源偏少
- 运维复杂度比 MySQL 高一点点

**一句话**：你的场景涉及复杂查询、数据分析、GIS、超大表（分区），或者你希望一个数据库解决很多问题，PostgreSQL 是更好的选择。

### Oracle：企业堆料，只负责稳定

Oracle 不是开源数据库，这里只简单提一下。它的设计哲学是"用硬件和内核线程堆出稳定性"。

Oracle 的强项：
- RAC（Real Application Cluster）：多台服务器共享一个数据库
- Data Guard：物理/逻辑同步，灾备能力极强
- AWR/ASH/ADDM：性能诊断工具链最完善
- Flashback：误操作恢复到过去某个时间点

**一句话**：如果你在金融、电信这类"不能出一点错"的行业，Oracle 的贵是有道理的。

---

## WAL + Checkpoint + 崩溃恢复 —— 所有数据库的共同语言

不管哪个数据库，写入数据的核心逻辑是一样的。

### WAL：先写日志，再写数据

想象一个场景：你要更新一行数据。数据库怎么做才安全？

最简单的办法是直接改磁盘数据——但太慢，磁盘随机写入是灾难。数据库的做法：

1. 把"要把 id=1 的 balance 改成 900"这条记录追加到日志文件（顺序写，很快）
2. 确认日志落盘后，告诉客户端"提交成功"
3. 在后台慢慢把数据页刷新到磁盘

这就是 WAL。**写入的实时性能来自顺序写日志，持久性来自日志落盘，吞吐量来自异步刷脏页。**

### Checkpoint：定期做一次"总结"

日志可以无限追加，但不能无限增长。Checkpoint 就是那个"清理节点"。

- 在 Checkpoint 之前：日志里的修改，有些已经写到磁盘了，有些还没写
- 执行 Checkpoint：把当前所有脏页强制刷到磁盘
- Checkpoint 之后：对应的日志就可以被覆盖或删除了

Checkpoint 触发条件：日志文件满了 70-80%、或者距离上次 Checkpoint 太久。

如果 Checkpoint 太频繁，影响正常写入性能。如果不频繁，日志膨胀恢复慢。这是一个需要权衡的参数。

### 崩溃恢复

如果数据库在你提交后、脏页刷盘前突然崩了：

1. 重启时扫描 Redo Log 最后一个 Checkpoint 之后的所有日志
2. 对已经提交的写入，重放（Redo）——这就是 WAL 保证的持久性
3. 对未提交的事务，用 Undo Log 回滚

恢复时间取决于需要重放的日志量。所以我说前面 Checkpoint 的原理你理解了，你就知道为什么恢复时间会变长。

---

## 这一节的核心思维

现在你脑子里应该有一张图了：

```
你写 SQL
  → 连接器检查身份
  → 解析器搞懂你什么意思  
  → 优化器选最快路径
  → 执行器执行
  → 存储引擎读写内存或磁盘
    → WAL 保证不改丢
    → Checkpoint 保证不会太大
    → 崩了也能恢复
```

以后不管学什么数据库，你都是在学这张图在不同产品里的具体实现。

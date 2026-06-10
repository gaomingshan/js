# 事务与并发 — 你的 SQL 为什么卡住了

写了几年 CRUD，你可能没遇到过锁等待和死锁。但一旦遇到，往往是线上事故。

这一节不讲全部事务理论，只讲**遇到并发问题时你需要知道的东西**。

---

## ACID 怎么实现的

ACID 不是四个需要背的特性，它们是数据库为了实现"事务安全"而设计的四个机制。

### 原子性 — Undo Log

原子性保证"事务内的操作，要么全成功，要么全失败"。

怎么保证？如果事务执行一半崩了，怎么回到执行前的状态？

InnoDB 的答案是 **Undo Log**：

```
执行 UPDATE users SET balance = 900 WHERE id = 1
  1. 先在 Undo Log 里记录 "id=1 原来的 balance=1000"
  2. 再修改内存里的 balance=900
  3. 如果事务回滚 → 从 Undo Log 恢复 balance=1000
```

Undo Log 不只用于回滚，还用于 MVCC——这是后面要讲的内容。

### 持久性 — Redo Log

持久性保证"事务一旦提交，数据不会丢"。

怎么保证？如果提交后数据库崩了，怎么恢复？

InnoDB 的答案是 **Redo Log + WAL**（这在第一部分讲过）：

```sql
START TRANSACTION;
UPDATE accounts SET balance = 900 WHERE id = 1;
COMMIT;  -- 这步做了啥？
           -- 1. 把 "UPDATE id=1 SET balance=900" 写入 Redo Log（顺序写磁盘）
           -- 2. Redo Log 落盘后返回 "提交成功"
           -- 3. 脏页（内存里修改过的数据页）在后台慢慢刷盘
```

如果第 3 步完成之前数据库崩了：
1. 重启后读取 Redo Log
2. 找到 "UPDATE id=1 SET balance=900" 这条记录
3. 重放这条修改（数据恢复）

### 隔离性 — MVCC + 锁

隔离性保证"并发事务之间互不干扰"。这是 ACID 里最复杂的一部分，下面单独展开。

### 一致性

一致性不是通过一个具体机制保证的，而是原子性 + 隔离性 + 持久性 + 数据库约束（主键、外键、CHECK）共同作用的结果。

---

## MVCC — 数据库的高并发秘诀

### 没有 MVCC 会怎样

假设两个事务同时执行：

```
事务 A: 
  SELECT balance FROM accounts WHERE id = 1;  -- 读到 1000
  -- 做一些业务判断
  SELECT balance FROM accounts WHERE id = 1;  -- 又读到...多少？
  
事务 B:
  UPDATE accounts SET balance = 900 WHERE id = 1;
  COMMIT;
```

如果事务 A 两次读到不一样的值，就是**不可重复读**。

如果事务 B 还没提交，事务 A 就能读到它的修改，就是**脏读**。

为了解决这些问题，最粗暴的方式是：事务 A 读数据时，禁止任何写入——这就是**串行化**。但串行化性能太差。

MVCC 的解决方式：**给每行数据保存多个版本，事务只看到自己该看到的版本。**

### 行数据的版本链

InnoDB 的每行数据除了存储实际字段值外，还隐藏了两个列：

- `DB_TRX_ID`：最近修改这行的事务 ID
- `DB_ROLL_PTR`：指向 Undo Log 的指针，通过它可以找到这行之前的历史版本

当一行被修改时，旧版本不会立刻删除，而是通过 Undo Log 保留下来，形成一条版本链：

```
当前版本 (balance=900, 由事务B修改) 
  ↑ DB_ROLL_PTR
旧版本 (balance=1000, 由事务A修改)
  ↑ DB_ROLL_PTR
更旧版本 (balance=500, 由事务C修改) ...
```

### Read View — 事务的"时间快照"

当事务启动时，InnoDB 会生成一个 Read View（读视图），里面记录了：

- 当前所有活跃的、未提交的事务 ID 列表
- 当前最小的活跃事务 ID
- 已经创建过的最大事务 ID

然后一条数据的版本是否对当前事务可见，判断规则是：

- 如果这行的 `DB_TRX_ID` 比 Read View 的最小 ID 还小 → 这行在事务启动前就已经提交了 → **可见**
- 如果这行的 `DB_TRX_ID` 在 Read View 的活跃事务列表里 → 这行是另一个未提交事务修改的 → **不可见**，要沿着版本链找上一个版本
- 如果这行的 `DB_TRX_ID` 比最大 ID 还大 → 这行是未来事务修改的 → **不可见**

### 快照读 vs 当前读

```sql
-- 快照读（不加锁）
SELECT * FROM users WHERE id = 1;
-- 读的是事务启动时的快照版本

-- 当前读（加锁）
SELECT * FROM users WHERE id = 1 FOR UPDATE;
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;
-- 读的是最新的已提交版本，并且加锁
```

MVCC 只对快照读有效。如果你用了 `FOR UPDATE` 或 `LOCK IN SHARE MODE`，就绕过 MVCC 了，读的是当前最新数据。

### 为什么 InnoDB 默认隔离级别是 RR？

MySQL 的默认隔离级别是 **可重复读（Repeatable Read）**。Oracle 和 PostgreSQL 默认是**读已提交（Read Committed）**。

这是历史原因：MySQL 的 Binlog 在 Statement 模式下，RC 级别可能导致主从数据不一致。为了兼容这个场景，MySQL 选择了 RR 为默认。

在 RC 级别下，MVCC 的 Read View 是**每条语句**重新生成的。在 RR 级别下，Read View 是**事务开始时**生成的。

所以同一事务内多次查询，RR 保证结果一致，RC 可能读到其他事务已提交的新数据。

---

## 锁

MVCC 解决了快照读的并发问题，但写入和当前读仍然需要锁。

### 行锁

InnoDB 的行锁是在索引上实现的，不是直接锁数据行。

```sql
SELECT * FROM users WHERE id = 1 FOR UPDATE;
-- 锁住 id=1 这行的聚簇索引

DELETE FROM users WHERE id = 1;
-- 同样锁住 id=1 这行的聚簇索引
```

**如果 WHERE 条件没有索引，InnoDB 会锁住所有行（退化为表锁）。**

```sql
SELECT * FROM users WHERE username = 'alice' FOR UPDATE;
-- 如果 username 没有索引，InnoDB 无法精确定位行
-- 会锁住所有行（但 MySQL 8.0 做了优化，不再 lock all）
```

### 间隙锁

InnoDB 的 RR 级别用间隙锁来解决幻读。

```sql
-- 事务 A：
SELECT * FROM users WHERE age BETWEEN 20 AND 30 FOR UPDATE;
-- 锁住了 age 在 (20, 30) 这个范围内的所有行
-- 也锁住了这个范围本身（间隙锁）

-- 事务 B 尝试插入 age=25 的行：
INSERT INTO users (id, age) VALUES (100, 25);  -- ❌ 被阻塞
-- 因为事务 A 锁住了 20-30 这个范围
```

间隙锁锁的是"范围"，不是具体的行。这就是为什么 RR 级别下你感觉不到幻读——新插入的行进不来了。

### 临键锁

临键锁 = 行锁 + 间隙锁。InnoDB 的默认锁算法。

```sql
-- 锁住的是 "前开后闭" 区间
-- 比如索引值有 10, 20, 30
-- 临键锁锁住的是：(-∞, 10], (10, 20], (20, 30], (30, +∞)
```

这就是 InnoDB RR 级别下防止幻读的完整手段。

### 死锁

死锁的本质是两个事务互相等待对方释放锁：

```
事务 A: UPDATE users SET balance=900 WHERE id=1;  -- 锁 id=1
事务 B: UPDATE users SET balance=800 WHERE id=2;  -- 锁 id=2
事务 A: UPDATE users SET balance=700 WHERE id=2;  -- 等待 B 释放 id=2
事务 B: UPDATE users SET balance=600 WHERE id=1;  -- 等待 A 释放 id=1
→ 死锁
```

InnoDB 会检测死锁，自动回滚其中**代价较小的事务**（修改行数少的那个）。

```sql
-- 你看不到死锁日志，但如果你怀疑有死锁：
SHOW ENGINE INNODB STATUS\G
-- 看 LATEST DETECTED DEADLOCK 部分
```

### 怎么减少死锁

1. **保持一致的锁顺序**：所有事务先锁 id=1 再锁 id=2，就不会形成循环等待
2. **缩短事务时间**：锁持有越久，冲突概率越高
3. **尽量用低隔离级别**：RC 级别不用间隙锁，死锁概率更低

---

## Oracle 和 PostgreSQL 的差异

### Oracle

Oracle 没有 MVCC 的 Undo 版本链，而是把 Undo 信息存在专门的 **Undo 表空间**里。读不会阻塞写（跟 InnoDB 一样），但 Oracle 的 Undo 管理是 DBA 需要关注的事情（Undo 表空间满了会影响查询）。

Oracle 默认隔离级别是 RC。Oracle 不阻止幻读（因为它不用间隙锁）。

### PostgreSQL

PostgreSQL 的 MVCC 实现跟 InnoDB 不同。它是在磁盘上保存数据行的多个物理版本（不是用 Undo Log 链）。旧版本在 VACUUM 时清理。

这意味着 PostgreSQL 的 MVCC 没有 Undo Log 回滚段的概念，旧版本只要没人需要就可以立刻清理。但也因此 PostgreSQL 需要定期执行 VACUUM，否则表会膨胀。

---

## 这一节的核心思维

事务并发的核心矛盾是：**并行度高 = 数据一致性低，数据一致性高 = 并行度低。**

MVCC 是在这条线上最优雅的平衡——快照读不加锁，写入只在必要时加行锁，间隙锁只在必要的隔离级别才启用。

你在写并发代码时，应该记住：
- 大部分查询不需要加锁（快照读就够了）
- 更新操作前确认用了索引（否则行锁退化成表锁）
- 保持事务短小精悍
- 所有操作按相同顺序加锁

**锁不是性能问题本身，锁的争用才是。**

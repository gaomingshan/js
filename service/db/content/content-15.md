# 索引优化技术

## 概述

索引优化技术是提升数据库查询性能的关键手段。掌握索引覆盖、索引下推、索引合并、最左前缀等高级优化技术，可以显著提升查询效率，减少 I/O 开销。

**核心技术**：
- **索引覆盖**：避免回表查询
- **联合索引**：优化多列查询
- **最左前缀原则**：联合索引的使用规则
- **索引下推（ICP）**：减少回表次数
- **索引合并**：组合使用多个索引
- **MRR**：优化随机 I/O

---

## 索引覆盖（Covering Index）

### 1. 概念

查询所需的所有列都包含在索引中，无需访问表数据。

```sql
-- 创建覆盖索引
CREATE INDEX idx_username_age_email ON users(username, age, email);

-- 覆盖索引查询
SELECT username, age, email FROM users WHERE username = 'alice';

-- EXPLAIN 输出：
-- Extra: Using index
-- 说明：只访问索引，无需回表
```

### 2. 工作原理

```
普通查询流程：
1. 查询索引树，获取主键
2. 回表查询聚簇索引，获取完整数据
3. 返回结果

覆盖索引查询流程：
1. 查询索引树，索引已包含所需列
2. 直接返回结果（跳过回表）

性能提升：
- 减少 I/O 次数（从 2 次减少到 1 次）
- 提升查询速度（可能提升 50%-100%）
```

### 3. 覆盖索引设计

**场景1：只查询索引列**：
```sql
-- 常见查询
SELECT id, username FROM users WHERE username = 'alice';

-- 覆盖索引（InnoDB 主键自动包含）
CREATE INDEX idx_username ON users(username);
-- 索引叶子节点：| username | 主键id |
-- 已包含 username 和 id，无需回表
```

**场景2：添加常用列到索引**：
```sql
-- 常见查询
SELECT username, email, age FROM users WHERE username = 'alice';

-- 覆盖索引
CREATE INDEX idx_username_email_age ON users(username, email, age);
-- 查询所需的所有列都在索引中
```

**场景3：统计查询**：
```sql
-- COUNT 查询
SELECT COUNT(*) FROM users WHERE status = 1;

-- 覆盖索引
CREATE INDEX idx_status ON users(status);
-- 只需扫描索引，无需访问表数据
```

### 4. 覆盖索引的权衡

**优点**：
```
- 减少 I/O
- 提升查询性能
- 减少锁竞争
```

**缺点**：
```
- 索引占用空间增大
- 插入/更新性能略有下降
- 维护成本增加
```

**选择建议**：
```sql
-- 不推荐：包含所有列
CREATE INDEX idx_all ON users(id, username, email, age, address, phone, ...);
-- 索引过大，维护成本高

-- 推荐：只包含常用查询列
CREATE INDEX idx_common ON users(username, email, status);
-- 平衡性能和空间
```

---

## 联合索引与最左前缀原则

### 1. 联合索引

对多个列创建的索引。

```sql
-- 创建联合索引
CREATE INDEX idx_city_age_gender ON users(city, age, gender);

-- 索引 B+Tree 结构：
-- 先按 city 排序，city 相同再按 age 排序，age 相同再按 gender 排序
```

### 2. 最左前缀原则

联合索引遵循最左前缀原则：从最左边的列开始匹配。

**原则说明**：
```sql
-- 索引：idx_city_age_gender (city, age, gender)

-- ✅ 可以使用索引（符合最左前缀）
WHERE city = 'Beijing'
WHERE city = 'Beijing' AND age = 25
WHERE city = 'Beijing' AND age = 25 AND gender = 'M'
WHERE city = 'Beijing' AND gender = 'M'  -- 只用到 city 部分

-- ❌ 无法使用索引（不符合最左前缀）
WHERE age = 25
WHERE gender = 'M'
WHERE age = 25 AND gender = 'M'
```

**示例验证**：
```sql
-- 创建测试索引
CREATE INDEX idx_city_age ON users(city, age);

-- 可以使用索引
EXPLAIN SELECT * FROM users WHERE city = 'Beijing';
-- key: idx_city_age

EXPLAIN SELECT * FROM users WHERE city = 'Beijing' AND age > 18;
-- key: idx_city_age

-- 无法使用索引
EXPLAIN SELECT * FROM users WHERE age > 18;
-- key: NULL（全表扫描）
```

### 3. 列顺序的重要性

**查询模式**：
```sql
-- 常见查询1：按城市查询
SELECT * FROM users WHERE city = 'Beijing';

-- 常见查询2：按城市和年龄查询
SELECT * FROM users WHERE city = 'Beijing' AND age > 18;

-- 常见查询3：按年龄查询
SELECT * FROM users WHERE age > 18;
```

**索引设计**：
```sql
-- 方案1：city, age
CREATE INDEX idx_city_age ON users(city, age);
-- 查询1：✅ 使用索引
-- 查询2：✅ 使用索引
-- 查询3：❌ 无法使用索引

-- 方案2：age, city
CREATE INDEX idx_age_city ON users(age, city);
-- 查询1：❌ 无法使用索引
-- 查询2：✅ 使用索引
-- 查询3：✅ 使用索引

-- 选择建议：
-- - 根据查询频率决定列顺序
-- - 高频查询的列放在前面
-- - 区分度高的列放在前面
```

### 4. 索引列数量建议

```sql
-- 不推荐：过多列
CREATE INDEX idx_too_many ON users(city, age, gender, status, vip_level, created_at);
-- 问题：
-- - 索引过大
-- - 维护成本高
-- - 很少能用到所有列

-- 推荐：2-3 列
CREATE INDEX idx_city_age ON users(city, age);
CREATE INDEX idx_status_created ON orders(status, created_at);
-- 平衡实用性和维护成本
```

---

## 索引下推（ICP）

### 1. 概念

Index Condition Pushdown（索引条件下推）：在索引遍历过程中，对索引包含的列先做判断，过滤掉不符合条件的记录，减少回表次数。

**MySQL 5.6+ 支持 ICP**

### 2. 工作原理

**没有 ICP**：
```sql
-- 索引：idx_city_age (city, age)
SELECT * FROM users WHERE city = 'Beijing' AND age > 18;

-- 执行过程（无 ICP）：
-- 1. 通过索引找到所有 city='Beijing' 的记录
-- 2. 对每条记录回表
-- 3. 在表数据上判断 age > 18
-- 4. 返回符合条件的记录

-- 问题：所有 city='Beijing' 的记录都要回表
```

**有 ICP**：
```sql
-- 索引：idx_city_age (city, age)
SELECT * FROM users WHERE city = 'Beijing' AND age > 18;

-- 执行过程（有 ICP）：
-- 1. 通过索引找到 city='Beijing' 的记录
-- 2. 在索引层面判断 age > 18（索引下推）
-- 3. 只对符合条件的记录回表
-- 4. 返回结果

-- 优点：减少回表次数
```

### 3. ICP 生效条件

```sql
-- ✅ 生效：范围查询 + 索引列条件
CREATE INDEX idx_city_age ON users(city, age);
SELECT * FROM users WHERE city = 'Beijing' AND age > 18;
-- Using index condition

-- ✅ 生效：LIKE 查询 + 索引列条件
CREATE INDEX idx_name_age ON users(name, age);
SELECT * FROM users WHERE name LIKE 'alice%' AND age > 18;
-- Using index condition

-- ❌ 不生效：非索引列条件
CREATE INDEX idx_city ON users(city);
SELECT * FROM users WHERE city = 'Beijing' AND age > 18;
-- age 不在索引中，无法下推
```

### 4. 验证 ICP

```sql
-- 查看是否启用 ICP
SHOW VARIABLES LIKE 'optimizer_switch';
-- index_condition_pushdown=on

-- EXPLAIN 查看
EXPLAIN SELECT * FROM users WHERE city = 'Beijing' AND age > 18;
-- Extra: Using index condition（ICP 生效）
```

---

## 索引合并（Index Merge）

### 1. 概念

同时使用多个索引，将结果合并。

**MySQL 支持三种索引合并**：
- **intersection**：交集
- **union**：并集
- **sort-union**：先排序再并集

### 2. 索引交集（Intersection）

```sql
-- 两个索引
CREATE INDEX idx_city ON users(city);
CREATE INDEX idx_age ON users(age);

-- 查询使用两个索引
SELECT * FROM users WHERE city = 'Beijing' AND age = 25;

-- 执行计划：
-- type: index_merge
-- Extra: Using intersect(idx_city, idx_age); Using where

-- 执行过程：
-- 1. 通过 idx_city 找到 city='Beijing' 的主键集合 S1
-- 2. 通过 idx_age 找到 age=25 的主键集合 S2
-- 3. 求交集 S1 ∩ S2
-- 4. 回表获取数据
```

### 3. 索引并集（Union）

```sql
-- OR 查询
SELECT * FROM users WHERE city = 'Beijing' OR age = 25;

-- 执行计划：
-- type: index_merge
-- Extra: Using union(idx_city, idx_age); Using where

-- 执行过程：
-- 1. 通过 idx_city 找到 city='Beijing' 的主键集合 S1
-- 2. 通过 idx_age 找到 age=25 的主键集合 S2
-- 3. 求并集 S1 ∪ S2（去重）
-- 4. 回表获取数据
```

### 4. 索引合并 vs 联合索引

```sql
-- 场景：WHERE city = 'Beijing' AND age = 25

-- 方案1：索引合并
CREATE INDEX idx_city ON users(city);
CREATE INDEX idx_age ON users(age);
-- 两个单列索引 + 索引合并

-- 方案2：联合索引（推荐）
CREATE INDEX idx_city_age ON users(city, age);
-- 一个联合索引

-- 性能对比：
-- 联合索引更优：
-- - 只需访问一个索引
-- - 无需合并操作
-- - I/O 次数更少
```

**建议**：
```
优先使用联合索引，而非依赖索引合并
索引合并通常是索引设计不佳的信号
```

---

## MRR（Multi-Range Read）

### 1. 概念

Multi-Range Read（多范围读取）：优化随机 I/O，将随机 I/O 转换为顺序 I/O。

**MySQL 5.6+ 支持 MRR**

### 2. 工作原理

**没有 MRR**：
```sql
SELECT * FROM users WHERE age BETWEEN 18 AND 30;

-- 执行过程（无 MRR）：
-- 1. 通过索引找到符合条件的主键：[1, 5, 3, 9, 2, 8, ...]
-- 2. 按主键顺序回表：1 → 5 → 3 → 9 → 2 → 8
-- 3. 随机 I/O（主键无序）

-- 问题：大量随机 I/O
```

**有 MRR**：
```sql
SELECT * FROM users WHERE age BETWEEN 18 AND 30;

-- 执行过程（有 MRR）：
-- 1. 通过索引找到符合条件的主键：[1, 5, 3, 9, 2, 8, ...]
-- 2. 对主键排序：[1, 2, 3, 5, 8, 9, ...]
-- 3. 按排序后的主键顺序回表：1 → 2 → 3 → 5 → 8 → 9
-- 4. 顺序 I/O（主键有序）

-- 优点：将随机 I/O 转换为顺序 I/O
```

### 3. MRR 配置

```sql
-- 查看 MRR 状态
SHOW VARIABLES LIKE 'optimizer_switch';
-- mrr=on, mrr_cost_based=on

-- 启用 MRR
SET optimizer_switch='mrr=on,mrr_cost_based=off';

-- 验证 MRR
EXPLAIN SELECT * FROM users WHERE age BETWEEN 18 AND 30;
-- Extra: Using MRR
```

### 4. MRR 适用场景

```sql
-- ✅ 适用：范围查询，结果集较大
SELECT * FROM users WHERE age BETWEEN 18 AND 30;

-- ✅ 适用：IN 查询，主键无序
SELECT * FROM users WHERE id IN (100, 5, 200, 10, 50);

-- ❌ 不适用：结果集很小
SELECT * FROM users WHERE id = 100;
-- 只有一条记录，无需排序
```

---

## BKA（Batched Key Access）

### 1. 概念

Batched Key Access（批量键访问）：优化 JOIN 操作，结合 MRR 减少随机 I/O。

**MySQL 5.6+ 支持 BKA**

### 2. 工作原理

```sql
-- JOIN 查询
SELECT * FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 1;

-- 传统 Nested Loop Join：
-- for each order in orders:
--     lookup user by user_id  -- 随机 I/O

-- BKA 优化：
-- 1. 扫描 orders 表，收集一批 user_id
-- 2. 对 user_id 排序
-- 3. 批量查询 users 表（顺序 I/O）
-- 4. 返回结果

-- 优点：减少随机 I/O
```

### 3. BKA 配置

```sql
-- 启用 BKA
SET optimizer_switch='mrr=on,mrr_cost_based=off,batched_key_access=on';

-- 验证 BKA
EXPLAIN SELECT * FROM orders o
JOIN users u ON o.user_id = u.id;
-- Extra: Using join buffer (Batched Key Access)
```

---

## 索引排序优化

### 1. 利用索引排序

```sql
-- 创建索引
CREATE INDEX idx_created_at ON orders(created_at);

-- 排序查询
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- EXPLAIN：
-- Extra: 无 Using filesort
-- 说明：利用索引顺序，无需额外排序
```

### 2. 联合索引排序

```sql
-- 索引：idx_status_created (status, created_at)
CREATE INDEX idx_status_created ON orders(status, created_at);

-- ✅ 可以利用索引排序
SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC;

-- ✅ 可以利用索引排序
SELECT * FROM orders ORDER BY status, created_at;

-- ❌ 无法利用索引排序
SELECT * FROM orders ORDER BY created_at, status;
-- 顺序不匹配
```

### 3. 多列排序

```sql
-- 索引：idx_city_age (city, age)

-- ✅ 可以利用索引
SELECT * FROM users ORDER BY city, age;

-- ❌ 无法利用索引（排序方向不一致）
SELECT * FROM users ORDER BY city ASC, age DESC;

-- 解决方案（MySQL 8.0+）：创建降序索引
CREATE INDEX idx_city_age_desc ON users(city ASC, age DESC);
SELECT * FROM users ORDER BY city ASC, age DESC;
-- 可以利用索引
```

---

## 松散索引扫描（Loose Index Scan）

### 1. 概念

跳过索引中不需要的部分，只扫描必要的键值。

```sql
-- 查询每个城市的最小年龄
SELECT city, MIN(age) FROM users GROUP BY city;

-- 松散索引扫描：
-- 1. 扫描索引，跳到第一个 city
-- 2. 读取该 city 的第一个 age（最小值）
-- 3. 跳到下一个 city
-- 4. 重复

-- 索引：idx_city_age (city, age)
-- 只需扫描每个 city 的第一条记录
```

### 2. 适用场景

```sql
-- ✅ MIN/MAX 查询
SELECT city, MIN(age) FROM users GROUP BY city;

-- ✅ DISTINCT 查询
SELECT DISTINCT city FROM users;

-- EXPLAIN：
-- Extra: Using index for group-by (scanning)
```

---

## 索引优化综合示例

### 1. 电商订单查询优化

```sql
-- 常见查询场景
-- 1. 按用户查询订单
-- 2. 按状态和时间查询
-- 3. 统计用户订单数

-- 索引设计
CREATE INDEX idx_user_status_created ON orders(user_id, status, created_at);

-- 查询1：按用户查询（覆盖索引）
SELECT user_id, status, created_at FROM orders WHERE user_id = 100;
-- Using index（无需回表）

-- 查询2：按用户和状态查询
SELECT * FROM orders WHERE user_id = 100 AND status = 1 ORDER BY created_at DESC;
-- 使用索引，利用索引排序

-- 查询3：统计订单数（覆盖索引）
SELECT user_id, COUNT(*) FROM orders GROUP BY user_id;
-- Using index（无需回表）
```

### 2. 用户搜索优化

```sql
-- 查询场景
SELECT * FROM users 
WHERE city = 'Beijing' AND age > 18 AND gender = 'M';

-- 索引设计
CREATE INDEX idx_city_gender_age ON users(city, gender, age);

-- 为什么 gender 在 age 前面？
-- 1. city = 精确匹配
-- 2. gender = 精确匹配
-- 3. age > 范围查询

-- 范围查询的列放在最后
-- 精确匹配的列放在前面
```

---

## 易错点与边界

### 1. 误用索引合并

```sql
-- 不好：依赖索引合并
CREATE INDEX idx_city ON users(city);
CREATE INDEX idx_age ON users(age);
SELECT * FROM users WHERE city = 'Beijing' AND age = 25;

-- 好：使用联合索引
CREATE INDEX idx_city_age ON users(city, age);
SELECT * FROM users WHERE city = 'Beijing' AND age = 25;
```

### 2. 联合索引列顺序错误

```sql
-- 查询：WHERE age > 18 AND city = 'Beijing'

-- 错误：范围列在前
CREATE INDEX idx_age_city ON users(age, city);
-- age 范围查询后，city 无法使用索引

-- 正确：精确列在前
CREATE INDEX idx_city_age ON users(city, age);
```

### 3. 过度依赖覆盖索引

```sql
-- 不好：包含所有列
CREATE INDEX idx_all ON users(username, email, age, address, phone, status);
-- 索引过大，维护成本高

-- 好：只包含常用列
CREATE INDEX idx_username_email_status ON users(username, email, status);
```

---

## 参考资料

1. **MySQL 官方文档**：
   - Index Condition Pushdown: https://dev.mysql.com/doc/refman/8.0/en/index-condition-pushdown-optimization.html
   - MRR Optimization: https://dev.mysql.com/doc/refman/8.0/en/mrr-optimization.html

2. **最佳实践**：
   - 优先使用联合索引
   - 覆盖索引优化常见查询
   - 启用 ICP 和 MRR
   - 合理设计索引列顺序
   - 定期分析索引使用情况

# 索引基础与工作原理

## 概述

索引是 MongoDB 查询性能的核心。没有索引，查询需要全集合扫描（COLLSCAN）；有合适的索引，只需扫描极少量数据（IXSCAN）。

---

## B-Tree 索引结构

```
B-Tree（age 字段索引示意）：

              [28]
             /    \
        [22,25]   [30,35]
       /  |   \   /  |  \
     [20][23][26][29][31][38]
      ↓   ↓   ↓   ↓   ↓   ↓
    Docs Docs Docs Docs Docs Docs
```

查询 `{age:28}` 路径：根节点 → 内部节点 → 叶子节点 → 文档指针
时间复杂度：**O(log n)** vs 全扫描 **O(n)**

---

## 索引的写入代价

```
集合有 5 个索引时，插入 1 条文档：
  1次数据写入 + 5次索引更新 = 6次 I/O
```

**建议**：生产集合索引控制在 **5~10 个以内**。

---

## 索引管理操作

```js
// 创建索引
db.users.createIndex({ age: 1 })
db.users.createIndex({ email: 1 }, { unique: true, name: "idx_email" })
db.users.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })  // TTL

// 查看索引
db.users.getIndexes()
db.users.stats().indexSizes  // 各索引占用空间

// 删除索引
db.users.dropIndex("age_1")       // 按名称
db.users.dropIndex({ age: 1 })    // 按键
db.users.dropIndexes()            // 删除所有（_id 除外）
```

---

## _id 索引的特殊性

```
✅ 自动创建，不可删除
✅ 唯一索引
✅ ObjectId 自带时间戳，天然按插入时间有序

// 利用 _id 排序（免排序开销）
db.events.find().sort({ _id: 1 })  // 按插入时间升序，直接走 _id 索引
```

---

## 索引使用统计

```js
// 查看每个索引的访问次数
db.users.aggregate([{ $indexStats: {} }])

// 输出
[
  { name: "_id_",  accesses: { ops: 15234 } },
  { name: "age_1", accesses: { ops: 0 } }  // ops:0 = 从未使用，考虑删除
]
```

---

## Query Planner（查询计划选择）

```
查询到来 → 分析候选索引 → 小批量试跑 → 选最优 → 缓存计划

计划缓存失效：
  - 数据量变化超 1000 条
  - 索引新增/删除
  - mongod 重启
```

---

## 易错点

```
❌ 单字段索引方向：升/降对单字段查询无差别
   { age: 1 } 和 { age: -1 } 查询效果相同

❌ 复合索引方向影响多字段排序
   { userId:1, createdAt:-1 } 适合按 userId 筛选后 createdAt 降序
   不适合 createdAt 升序（需内存排序）

❌ 索引过多拖慢写入
   每个索引都增加写入 I/O，定期用 $indexStats 清理冗余索引
```

---

## 总结

- B-Tree 结构，查询 O(log n)
- 每索引都有写入代价，按需建立
- `$indexStats` 定期审查，清理未用索引
- `_id` 索引天然有序，善加利用

**下一步**：各种索引类型详解。

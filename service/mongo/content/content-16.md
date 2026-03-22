# 索引属性与覆盖查询

## 概述

除了索引类型，MongoDB 还提供多种索引属性来处理特殊场景：唯一性约束、稀疏数据、条件索引、自动过期等。覆盖查询则是极致查询优化的利器。

---

## 唯一索引（Unique Index）

```js
// 单字段唯一
db.users.createIndex({ email: 1 }, { unique: true })

// 复合唯一（组合唯一）
db.orders.createIndex(
  { userId: 1, orderId: 1 },
  { unique: true }
)

// 插入重复值时报错
// MongoServerError: E11000 duplicate key error

// 允许多个 null 值（null 不参与唯一检查）
// 但同一字段多个文档都有 null 只允许一个，需配合 sparse
db.users.createIndex(
  { phone: 1 },
  { unique: true, sparse: true }  // sparse: null 文档不进入索引
)
```

---

## 稀疏索引（Sparse Index）

只为**包含该字段**的文档建立索引条目，忽略字段缺失的文档。

```js
// 创建稀疏索引
db.users.createIndex({ phone: 1 }, { sparse: true })

// 集合数据
{ _id: 1, name: "张三", phone: "138xxx" }  // 进入索引
{ _id: 2, name: "李四" }                   // 不进入索引（无 phone 字段）
{ _id: 3, name: "王五", phone: null }       // 不进入索引（phone 为 null）

// 查询有 phone 的用户（走稀疏索引）
db.users.find({ phone: { $exists: true } })

// 注意：稀疏索引不能用于 sort 查询（会跳过缺失字段的文档）
// ❌ 以下查询结果不完整
db.users.find().sort({ phone: 1 })  // 缺少 phone 的文档被忽略！
```

---

## 部分索引（Partial Index）

只为**满足条件的文档**建立索引，比稀疏索引更灵活，也更省空间。

```js
// 只为状态为 active 的用户建立索引
db.users.createIndex(
  { lastLoginAt: -1 },
  {
    partialFilterExpression: { status: "active" },
    name: "idx_active_users_login"
  }
)

// 只为未支付的订单建立索引（减少索引体积）
db.orders.createIndex(
  { createdAt: 1 },
  {
    partialFilterExpression: {
      status: { $in: ["pending", "processing"] }
    }
  }
)

// 查询必须包含过滤条件才走部分索引
// ✅ 走索引
db.orders.find({ status: "pending", createdAt: { $gt: yesterday } })

// ❌ 不走索引（查询条件不包含 partialFilterExpression）
db.orders.find({ createdAt: { $gt: yesterday } })
```

**部分索引 vs 稀疏索引**：
- 稀疏索引：按字段是否存在过滤
- 部分索引：按任意条件过滤，更灵活，**推荐优先使用**

---

## TTL 索引（自动过期）

```js
// 文档在 createdAt 后 3600 秒自动删除
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
)

// 动态过期：expireAfterSeconds:0 + 文档内指定过期时间
db.tokens.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0 }
)
db.tokens.insertOne({
  token: "abc",
  expireAt: new Date(Date.now() + 10 * 60 * 1000)  // 10 分钟后过期
})

// 修改 TTL 时间（无需重建）
db.runCommand({
  collMod: "sessions",
  index: { name: "createdAt_1", expireAfterSeconds: 7200 }  // 改为 2 小时
})
```

**注意**：TTL 删除由后台线程每 60 秒运行一次，删除有最多 60 秒延迟。

---

## 隐藏索引（Hidden Index，4.4+）

索引存在但对 Query Planner 不可见，用于**安全测试删除索引的影响**。

```js
// 创建隐藏索引
db.users.createIndex({ age: 1 }, { hidden: true })

// 隐藏现有索引（测试删除影响）
db.runCommand({
  collMod: "users",
  index: { name: "age_1", hidden: true }
})

// 观察性能变化（如性能未下降，说明该索引确实无用）
// 确认可删除后
db.users.dropIndex("age_1")

// 恢复可见
db.runCommand({
  collMod: "users",
  index: { name: "age_1", hidden: false }
})
```

**最佳实践**：删除生产索引前，先隐藏观察 24~48 小时，确认无影响再删除。

---

## 覆盖查询（Covered Query）

查询所需的所有字段都在索引中，**完全不需要读取文档数据**，只扫描索引即可返回结果。

```js
// 创建复合索引
db.orders.createIndex({ userId: 1, status: 1, totalAmount: 1 })

// 覆盖查询：查询和投影字段都在索引中
db.orders.find(
  { userId: "u001", status: "paid" },       // 查询字段：在索引中 ✅
  { status: 1, totalAmount: 1, _id: 0 }     // 投影字段：在索引中，排除 _id ✅
)
// → 只扫描索引，不读数据文件，速度极快

// 验证是否覆盖查询
db.orders.find(
  { userId: "u001", status: "paid" },
  { status: 1, totalAmount: 1, _id: 0 }
).explain("executionStats")
// 关注：executionStats.totalDocsExamined === 0 → 覆盖查询成功
```

**覆盖查询的条件**：
1. 查询条件字段全部在索引中
2. 返回字段（投影）全部在索引中
3. 必须明确排除 `_id`（除非 `_id` 也在索引中）
4. 文档中没有数组字段（多键索引不支持覆盖查询）

**性能收益**：覆盖查询比普通索引查询快 **2~10 倍**（省去文档读取 I/O）。

---

## 实战：为查询设计覆盖索引

```js
// 高频查询：统计用户各状态订单数
db.orders.aggregate([
  { $match: { userId: "u001" } },
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// 设计覆盖索引
db.orders.createIndex({ userId: 1, status: 1 })
// → 聚合只需扫描索引，totalDocsExamined = 0
```

---

## 总结

| 索引属性 | 作用 | 典型场景 |
|----------|------|----------|
| unique | 唯一性约束 | email、手机号 |
| sparse | 跳过缺失字段文档 | 可选字段 |
| partial | 按条件过滤索引文档 | 活跃用户、未完成订单 |
| TTL | 自动过期删除 | Session、验证码 |
| hidden | 隐藏测试删除影响 | 索引清理前验证 |
| 覆盖查询 | 纯索引返回，零文档读取 | 高频聚合统计 |

**下一步**：索引构建策略与生命周期管理。

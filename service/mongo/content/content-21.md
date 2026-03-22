# 分页策略与查询性能优化

## 概述

分页是最常见的查询场景，但错误的分页实现会造成严重性能问题。本章对比各种分页方案，并给出完整的查询性能优化清单。

---

## skip/limit 分页的性能问题

```js
// 传统分页（危险！）
const page = 100
const pageSize = 20
db.orders.find({ status: "paid" })
  .sort({ createdAt: -1 })
  .skip((page - 1) * pageSize)  // skip(1980)
  .limit(pageSize)
```

**问题根源**：
```
skip(N) 的实现：
  → 扫描并丢弃前 N 条文档
  → N 越大，扫描越多，性能越差

第 1 页：扫描 0 + 20 = 20 条
第 100 页：扫描 1980 + 20 = 2000 条
第 1000 页：扫描 19980 + 20 = 20000 条
```

**结论**：`skip/limit` 只适合页数不超过 **100 页**（数据量不超过几千）的场景。

---

## 游标分页（Cursor-based Pagination）

基于上一页最后一条记录的锚点字段，避免 skip 扫描。

### 基于 _id 的游标分页

```js
// 第一页
const firstPage = db.orders.find({ status: "paid" })
  .sort({ _id: -1 })
  .limit(20)

// 获取最后一条的 _id
const lastId = firstPage[firstPage.length - 1]._id

// 下一页：查询 _id < lastId 的文档
const nextPage = db.orders.find({
  status: "paid",
  _id: { $lt: lastId }     // 游标条件
})
  .sort({ _id: -1 })
  .limit(20)

// 继续翻页：始终基于上一页最后一条 _id
```

### 基于时间戳 + _id 的复合游标（推荐）

```js
// 业务场景：按 createdAt 降序分页
// 问题：createdAt 可能重复，需要 _id 作为二级排序打破平局

// 第一页
const page1 = db.orders.find({ userId: "u001" })
  .sort({ createdAt: -1, _id: -1 })
  .limit(20)

// 获取游标（最后一条的 createdAt 和 _id）
const lastDoc = page1[page1.length - 1]
const cursor = { createdAt: lastDoc.createdAt, _id: lastDoc._id }

// 下一页
db.orders.find({
  userId: "u001",
  $or: [
    { createdAt: { $lt: cursor.createdAt } },
    { createdAt: cursor.createdAt, _id: { $lt: cursor._id } }
  ]
})
  .sort({ createdAt: -1, _id: -1 })
  .limit(20)

// 对应索引
db.orders.createIndex({ userId: 1, createdAt: -1, _id: -1 })
```

**游标分页特点**：
- ✅ 性能稳定，第 N 页与第 1 页耗时相同
- ✅ 适合亿级数据分页
- ❌ 不支持跳页（只能上一页/下一页）
- ❌ 数据变化时可能有重复或遗漏（需业务容忍）

---

## 分页方案选型

| 方案 | 性能 | 支持跳页 | 适用场景 |
|------|------|----------|----------|
| skip/limit | 差（大页数）| ✅ | 小数据量，页数 < 100 |
| 游标分页 | 优秀 | ❌ | 大数据量，Feed 流，无限滚动 |
| 搜索引擎分页 | 优秀 | ✅ | 全文搜索场景，用 Atlas Search |

---

## 投影优化

```js
// ❌ 返回全部字段（浪费网络带宽和内存）
db.users.find({ city: "深圳" })

// ✅ 只返回需要的字段
db.users.find(
  { city: "深圳" },
  { name: 1, phone: 1, avatar: 1, _id: 0 }
)

// 排除大字段（如详情内容）
db.articles.find(
  { category: "技术" },
  { content: 0 }  // 排除大字段，列表页只需标题摘要
)
```

---

## 排序与索引协同

```js
// 排序能走索引的条件：
// 索引：{ userId: 1, createdAt: -1 }

// ✅ 走索引排序（免内存排序）
db.orders.find({ userId: "u1" }).sort({ createdAt: -1 })
db.orders.find({ userId: "u1" }).sort({ userId: 1, createdAt: -1 })

// ❌ 不走索引排序（触发 SORT 阶段）
db.orders.find({ userId: "u1" }).sort({ amount: -1 })  // amount 不在索引中

// 内存排序上限（超出报错）
// 默认 100MB，超过需要 allowDiskUse
db.orders.find().sort({ amount: -1 }).allowDiskUse(true)
```

---

## Hint 强制使用索引

```js
// Query Planner 选错索引时强制指定
db.orders.find({ userId: "u1", status: "paid" })
  .hint({ userId: 1, status: 1 })
  .explain("executionStats")

// 按索引名指定
db.orders.find({ userId: "u1" })
  .hint("idx_user_status")

// 验证：配合 explain 确认索引是否生效
```

---

## 查询性能优化检查清单

```
✅ 1. 高频查询字段有索引（explain 无 COLLSCAN）
✅ 2. 复合索引遵循 ESR 原则
✅ 3. 排序字段在索引中（无 SORT 阶段）
✅ 4. 只返回需要的字段（投影）
✅ 5. 深分页改用游标分页
✅ 6. 统计计数用 estimatedDocumentCount()（快速）
           或 countDocuments() + 索引（精确）
✅ 7. 大聚合加 allowDiskUse: true
✅ 8. $match 在聚合管道最前
✅ 9. totalDocsExamined / nReturned ≈ 1
✅ 10. 定期查看 Profiler 发现慢查询
```

---

## 企业案例：亿级订单高性能分页

```js
// 场景：用户查看自己的订单列表（亿级订单，无限下拉）

// 索引设计
db.orders.createIndex({ userId: 1, createdAt: -1, _id: -1 })

// API 实现
async function getOrderList(userId, cursor, limit = 20) {
  const query = { userId }

  // 非第一页时添加游标条件
  if (cursor) {
    query.$or = [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: new ObjectId(cursor.id) } }
    ]
  }

  const orders = await db.orders.find(query, {
    projection: { orderId: 1, status: 1, amount: 1, createdAt: 1 }  // 投影
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)  // 多取一条判断是否有下一页
    .toArray()

  const hasMore = orders.length > limit
  if (hasMore) orders.pop()

  const nextCursor = hasMore ? {
    createdAt: orders[orders.length - 1].createdAt,
    id: orders[orders.length - 1]._id.toString()
  } : null

  return { orders, nextCursor, hasMore }
}
```

---

## 总结

- `skip` 大页数性能差，亿级数据必须用游标分页
- 游标分页结合复合索引，性能稳定与数据量无关
- 投影减少网络传输，排序字段必须在索引中
- `explain()` 是优化的起点，目标是消灭 COLLSCAN 和 SORT

**下一步**：文本搜索与地理空间查询。

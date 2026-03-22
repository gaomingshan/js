# 批量写入、幂等设计与特殊集合

## 概述

高吞吐写入场景下，正确使用批量 API、幂等设计和特殊集合类型，是保障性能与可靠性的关键。

---

## insertMany vs bulkWrite

### insertMany（同类批量插入）

```js
// 一次网络往返插入多条文档
db.orders.insertMany([
  { orderId: "ORD001", userId: "u1", amount: 100 },
  { orderId: "ORD002", userId: "u2", amount: 200 },
  { orderId: "ORD003", userId: "u3", amount: 300 }
], {
  ordered: false,          // 无序写入：失败不阻塞后续，吞吐更高
  writeConcern: { w: 1 }
})
```

### bulkWrite（混合批量操作）

```js
// 同时包含 insert / update / delete
db.inventory.bulkWrite([
  { insertOne: { document: { sku: "SKU001", qty: 100 } } },
  { updateOne: {
      filter: { sku: "SKU002" },
      update: { $inc: { qty: -1 } }
  }},
  { deleteOne: { filter: { sku: "SKU003", qty: 0 } } },
  { replaceOne: {
      filter: { sku: "SKU004" },
      replacement: { sku: "SKU004", qty: 50, updatedAt: new Date() }
  }}
], { ordered: false })
```

### 有序 vs 无序写入

| | `ordered: true`（默认）| `ordered: false` |
|--|------------------------|-------------------|
| 失败处理 | 遇到错误立即停止 | 继续执行后续操作 |
| 并行度 | 串行 | 可并行 |
| 吞吐量 | 较低 | 较高 |
| 适用场景 | 有依赖关系的操作 | 独立操作批量写入 |

**最佳实践**：批量写入日志、事件等独立数据时，使用 `ordered: false` 可提升 2~5 倍吞吐。

---

## 幂等写入设计

幂等设计保证同一请求重试多次，结果与执行一次相同，是分布式系统可靠性的基础。

### upsert + 业务主键

```js
// 用业务 ID 作为唯一标识，重复写入安全
db.orders.updateOne(
  { orderId: "ORD-20240115-001" },   // 业务主键作为查询条件
  {
    $set: {
      userId: "user_001",
      amount: 299.00,
      status: "pending",
      updatedAt: new Date()
    },
    $setOnInsert: {                   // 仅首次插入时设置
      createdAt: new Date()
    }
  },
  { upsert: true }                   // 不存在则插入，存在则更新
)
```

### $setOnInsert 的作用

```js
// $setOnInsert 只在 upsert 创建新文档时执行
// 重试时不会覆盖 createdAt

// 第一次执行（文档不存在）：
// → 创建文档，设置 createdAt 和 updatedAt

// 第二次执行（文档已存在）：
// → 仅更新 updatedAt，createdAt 不变 ✅
```

### 错误重试模式

```js
const MAX_RETRIES = 3
let retries = 0

while (retries < MAX_RETRIES) {
  try {
    await db.orders.updateOne(
      { orderId: externalOrderId },
      { $set: orderData, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    )
    break  // 成功则退出
  } catch (err) {
    if (err.code === 11000) break  // 重复键：并发 upsert 冲突，忽略
    if (retries++ >= MAX_RETRIES) throw err
    await sleep(100 * retries)     // 指数退避
  }
}
```

---

## TTL Collection（自动过期）

TTL 索引让文档在指定时间后自动删除，适合 Session、验证码、日志等有时效性的数据。

```js
// 创建 TTL 索引（expireAfterSeconds 后自动删除）
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }  // 1 小时后删除
)

// 插入带过期时间的文档
db.sessions.insertOne({
  token: "abc123",
  userId: "user_001",
  createdAt: new Date()  // TTL 索引基于此字段
})

// 动态过期：使用 expireAt 字段精确控制
db.verification_codes.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0 }  // expireAt 时间点立即删除
)
db.verification_codes.insertOne({
  phone: "138xxx",
  code: "123456",
  expireAt: new Date(Date.now() + 5 * 60 * 1000)  // 5 分钟后过期
})
```

**注意**：TTL 删除由后台线程每 60 秒执行一次，实际删除有最多 60 秒延迟。

---

## Capped Collection（固定大小集合）

固定容量、按插入顺序循环覆盖旧文档，天然支持 FIFO。

```js
// 创建 Capped Collection（最多 1000 条，最大 10MB）
db.createCollection("event_log", {
  capped: true,
  size: 10 * 1024 * 1024,  // 10MB（必须指定）
  max: 1000                // 最多文档数（可选）
})

// 插入（超出限制自动删除最旧文档）
db.event_log.insertOne({ event: "login", userId: "u1", ts: new Date() })

// 自然顺序查询（按插入顺序）
db.event_log.find().sort({ $natural: -1 })  // 最新在前
```

**适用场景**：操作日志、实时事件流、循环缓冲区。
**限制**：不能删除单条文档，不能更新导致文档增大，不支持分片。

---

## Time Series Collection（时序集合，5.0+）

专为时序数据优化的集合类型，自动分桶压缩，查询性能显著优于普通集合。

```js
// 创建时序集合
db.createCollection("sensor_data", {
  timeseries: {
    timeField: "timestamp",     // 时间字段（必须）
    metaField: "metadata",      // 元数据字段（设备 ID、标签等）
    granularity: "seconds"       // 时间粒度：seconds / minutes / hours
  },
  expireAfterSeconds: 86400 * 90  // 90 天自动过期
})

// 写入传感器数据
db.sensor_data.insertMany([
  {
    timestamp: new Date(),
    metadata: { sensorId: "sensor_001", location: "上海" },
    temperature: 36.5,
    humidity: 65
  },
  {
    timestamp: new Date(),
    metadata: { sensorId: "sensor_002", location: "北京" },
    temperature: 28.3,
    humidity: 55
  }
])

// 时序聚合查询
db.sensor_data.aggregate([
  { $match: {
    "metadata.sensorId": "sensor_001",
    timestamp: { $gte: new Date(Date.now() - 3600000) }  // 最近 1 小时
  }},
  { $group: {
    _id: { $dateTrunc: { date: "$timestamp", unit: "minute" } },
    avgTemp: { $avg: "$temperature" },
    maxTemp: { $max: "$temperature" }
  }},
  { $sort: { _id: 1 } }
])
```

**与普通集合对比**：
- 存储：自动分桶压缩，空间减少 **50~80%**
- 查询：时间范围查询性能提升 **5~10 倍**
- 限制：不支持修改/删除单条文档，不支持事务内写入

---

## 批量写入性能建议

```
1. 批次大小：每批 100~1000 条，单批不超过 16MB
2. 无序写入：ordered: false 提升并行度
3. Write Concern 分级：批量日志用 w:1，关键数据用 w:"majority"
4. 网络：客户端与 MongoDB 同机房，减少 RTT
5. 索引：批量写入前临时移除非必要索引，写完后重建
```

---

## 总结

- `bulkWrite` + `ordered:false` 是高吞吐批量写入的标配
- 幂等设计：`upsert` + 业务主键 + `$setOnInsert`
- TTL 索引：Session、验证码等有时效数据的首选
- Time Series Collection：IoT、监控等时序数据场景的最优选择

**下一步**：索引基础与工作原理。

# 原生 CRUD API

## 概述

本章以 Node.js（官方 MongoDB Driver）为主，覆盖完整的 CRUD API，包括返回值结构、错误处理和重试策略。Java/Python 驱动的 API 结构与之类似。

---

## 连接与初始化

```js
const { MongoClient, ObjectId } = require('mongodb')

const client = new MongoClient('mongodb://admin:pass@localhost:27017', {
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true
})

let db
async function connect() {
  await client.connect()
  db = client.db('ecommerce')
  console.log('MongoDB connected')
}

// 优雅关闭
process.on('SIGINT', async () => {
  await client.close()
  process.exit(0)
})
```

---

## 插入操作

### insertOne

```js
const result = await db.collection('users').insertOne({
  name: '张三',
  email: 'zhangsan@example.com',
  age: 28,
  createdAt: new Date()
})

console.log(result)
// InsertOneResult:
// {
//   acknowledged: true,
//   insertedId: ObjectId('64f1a2b3c4d5e6f7a8b9c0d1')
// }
```

### insertMany

```js
const result = await db.collection('products').insertMany([
  { sku: 'P001', name: 'iPhone 15', price: 6999 },
  { sku: 'P002', name: '手机壳',    price: 49   },
  { sku: 'P003', name: '充电器',    price: 99   }
], { ordered: false })

console.log(result)
// InsertManyResult:
// {
//   acknowledged: true,
//   insertedCount: 3,
//   insertedIds: { '0': ObjectId('...'), '1': ObjectId('...'), '2': ObjectId('...') }
// }
```

---

## 查询操作

### find / findOne

```js
// findOne
const user = await db.collection('users').findOne(
  { email: 'zhangsan@example.com' },
  { projection: { password: 0 } }  // 排除敏感字段
)
// 返回文档对象，未找到返回 null

// find（返回游标）
const cursor = db.collection('orders').find(
  { userId: 'u001', status: { $in: ['paid', 'shipped'] } },
  { projection: { orderId: 1, status: 1, amount: 1 } }
)
  .sort({ createdAt: -1 })
  .limit(20)

// 方式1：toArray（小数据量）
const orders = await cursor.toArray()

// 方式2：流式处理（大数据量，节省内存）
for await (const order of cursor) {
  // 逐条处理
  await processOrder(order)
}

// 方式3：forEach
await cursor.forEach(order => {
  console.log(order.orderId)
})
```

### 计数

```js
// 精确计数（走索引过滤）
const count = await db.collection('orders').countDocuments({ status: 'paid' })

// 快速估算（利用集合元数据，不过滤）
const total = await db.collection('orders').estimatedDocumentCount()
```

---

## 更新操作

### updateOne / updateMany

```js
// updateOne
const result = await db.collection('users').updateOne(
  { _id: new ObjectId('64f1a2b3c4d5e6f7a8b9c0d1') },
  {
    $set:  { age: 29, updatedAt: new Date() },
    $inc:  { loginCount: 1 },
    $push: { tags: 'VIP' }
  }
)

console.log(result)
// UpdateResult:
// {
//   acknowledged: true,
//   matchedCount: 1,   // 匹配到的文档数
//   modifiedCount: 1,  // 实际修改的文档数（若值未变则为 0）
//   upsertedCount: 0,
//   upsertedId: null
// }

// updateMany
const bulkResult = await db.collection('products').updateMany(
  { category: '手机', stock: { $lt: 10 } },
  { $set: { lowStock: true, updatedAt: new Date() } }
)
console.log(`修改了 ${bulkResult.modifiedCount} 条文档`)

// upsert（不存在则插入）
const upsertResult = await db.collection('carts').updateOne(
  { userId: 'u001', sku: 'P001' },
  {
    $inc: { qty: 1 },
    $setOnInsert: { createdAt: new Date() }
  },
  { upsert: true }
)
```

### replaceOne

```js
// 替换整个文档（保留 _id）
const result = await db.collection('users').replaceOne(
  { _id: userId },
  { name: '新名字', email: 'new@test.com', updatedAt: new Date() }  // 不含 _id，自动保留
)
```

### findOneAndUpdate（原子操作）

```js
// 原子地查找、更新并返回文档
const updated = await db.collection('orders').findOneAndUpdate(
  { orderId: 'ORD001', status: 'pending' },
  { $set: { status: 'processing', processedAt: new Date() } },
  {
    returnDocument: 'after',  // 'before'=返回更新前，'after'=返回更新后
    upsert: false
  }
)
// updated 是更新后的完整文档（或 null 如果未找到）
```

---

## 删除操作

```js
// deleteOne
const result = await db.collection('sessions').deleteOne(
  { token: 'expired-token-xxx' }
)
console.log(result)
// DeleteResult: { acknowledged: true, deletedCount: 1 }

// deleteMany
const bulkDel = await db.collection('logs').deleteMany({
  createdAt: { $lt: new Date(Date.now() - 30 * 24 * 3600 * 1000) }  // 30天前
})
console.log(`删除了 ${bulkDel.deletedCount} 条日志`)

// findOneAndDelete（删除并返回被删文档）
const deleted = await db.collection('queue').findOneAndDelete(
  { status: 'pending' },
  { sort: { priority: -1, createdAt: 1 } }  // 按优先级取队列头
)
if (deleted) {
  await processTask(deleted)
}
```

---

## 错误处理与重试

```js
const { MongoError, MongoServerError } = require('mongodb')

async function upsertWithRetry(collection, filter, update, maxRetries = 3) {
  let attempt = 0
  while (attempt < maxRetries) {
    try {
      return await collection.updateOne(filter, update, { upsert: true })
    } catch (err) {
      // E11000: 并发 upsert 导致的重复键错误（可安全忽略或重试）
      if (err.code === 11000) {
        attempt++
        if (attempt >= maxRetries) throw err
        await new Promise(resolve => setTimeout(resolve, 50 * attempt))
        continue
      }
      // 瞬时错误（网络抖动、Primary 切换）
      if (err.hasErrorLabel('TransientTransactionError') ||
          err.hasErrorLabel('RetryableWriteError')) {
        attempt++
        await new Promise(resolve => setTimeout(resolve, 100 * attempt))
        continue
      }
      throw err  // 其他错误直接抛出
    }
  }
}

// 常见错误码
// 11000: 唯一索引冲突
// 16500: 速率限制（Atlas）
// 112:   写冲突（事务）
// 251:   事务过期
```

---

## 总结

| 操作 | 方法 | 返回值 |
|------|------|--------|
| 插入单条 | `insertOne` | `insertedId` |
| 插入多条 | `insertMany` | `insertedCount`, `insertedIds` |
| 查询单条 | `findOne` | 文档或 null |
| 查询多条 | `find` | Cursor |
| 更新单条 | `updateOne` | `matchedCount`, `modifiedCount` |
| 更新多条 | `updateMany` | `matchedCount`, `modifiedCount` |
| 删除单条 | `deleteOne` | `deletedCount` |
| 删除多条 | `deleteMany` | `deletedCount` |
| 原子更新 | `findOneAndUpdate` | 更新前/后的文档 |
| 原子删除 | `findOneAndDelete` | 被删除的文档 |

**下一步**：Bulk Write、事务 API 与 Change Streams。

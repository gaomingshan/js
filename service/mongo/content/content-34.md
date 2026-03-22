# Bulk Write、事务 API 与 Change Streams

## 概述

本章覆盖 MongoDB 高级 API：批量混合操作（bulkWrite）、多文档事务（Transaction）和数据变更监听（Change Streams）。

---

## Bulk Write（混合批量操作）

```js
const { ObjectId } = require('mongodb')
const orders = db.collection('orders')
const inventory = db.collection('inventory')

// bulkWrite 支持 insertOne/updateOne/updateMany/replaceOne/deleteOne/deleteMany
const result = await inventory.bulkWrite([
  // 插入
  { insertOne: { document: { sku: 'NEW001', qty: 100, warehouse: 'WH1' } } },
  // 更新单条
  { updateOne: {
      filter: { sku: 'P001' },
      update: { $inc: { qty: -5 } }
  }},
  // 更新多条
  { updateMany: {
      filter: { qty: 0 },
      update: { $set: { status: 'out_of_stock' } }
  }},
  // 替换
  { replaceOne: {
      filter: { sku: 'P002' },
      replacement: { sku: 'P002', qty: 50, updatedAt: new Date() }
  }},
  // 删除
  { deleteOne: { filter: { sku: 'OBSOLETE001' } } }
], {
  ordered: false,                            // 无序：并行执行，提升吞吐
  writeConcern: { w: 'majority', j: true }   // 写关注
})

console.log(result)
// BulkWriteResult:
// {
//   insertedCount: 1,
//   matchedCount: 3,
//   modifiedCount: 3,
//   deletedCount: 1,
//   upsertedCount: 0,
//   insertedIds: { '0': ObjectId('...') },
//   upsertedIds: {}
// }
```

**bulkWrite vs insertMany**：
- `insertMany`：只能插入，同类操作
- `bulkWrite`：混合增删改，更灵活
- 两者都支持 `ordered: false` 提升吞吐

---

## 多文档事务 API

### 基础事务

```js
// 场景：转账（从账户 A 扣款，账户 B 入账）
async function transfer(fromId, toId, amount) {
  const session = client.startSession()
  try {
    const result = await session.withTransaction(async () => {
      const accounts = db.collection('accounts')

      // 扣款
      const debit = await accounts.updateOne(
        { _id: fromId, balance: { $gte: amount } },  // 余额检查
        { $inc: { balance: -amount } },
        { session }
      )
      if (debit.modifiedCount === 0) {
        throw new Error('余额不足')
      }

      // 入账
      await accounts.updateOne(
        { _id: toId },
        { $inc: { balance: amount } },
        { session }
      )

      // 记录流水
      await db.collection('transactions').insertOne({
        fromId, toId, amount,
        createdAt: new Date()
      }, { session })
    }, {
      // 事务选项
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority', j: true },
      maxCommitTimeMS: 5000
    })
    console.log('转账成功')
  } catch (err) {
    console.error('转账失败:', err.message)
    throw err
  } finally {
    await session.endSession()
  }
}
```

### 手动事务控制（更精细）

```js
async function manualTransaction() {
  const session = client.startSession()
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' }
  })
  try {
    await db.collection('orders').insertOne(order, { session })
    await db.collection('inventory').updateOne(
      { sku: order.sku },
      { $inc: { qty: -order.qty } },
      { session }
    )
    await session.commitTransaction()
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    await session.endSession()
  }
}
```

### 事务注意事项

```
✅ 支持：副本集、分片集群（4.2+）
❌ 不支持：独立 mongod（非副本集）

⚠️ 事务限制：
  - 默认超时 60 秒（maxTransactionLockRequestTimeoutMillis）
  - 事务内文档总大小限制 16MB
  - 避免长事务（持锁时间长）
  - 事务内不能创建/删除集合
  - 分片集群事务跨 Shard 时性能开销更大

性能建议：
  - 能用单文档原子操作解决的，不要用事务
  - 事务内操作数尽量少，减少持锁时间
```

---

## Change Streams（变更流）

### 基础监听

```js
// 监听集合级别变更
const collection = db.collection('orders')
const changeStream = collection.watch()

changeStream.on('change', (change) => {
  console.log('变更事件:', JSON.stringify(change, null, 2))
})

changeStream.on('error', (err) => {
  console.error('Change Stream 错误:', err)
})

// 变更事件结构
// {
//   _id: { ... },                    // Resume Token
//   operationType: 'insert',          // insert/update/delete/replace
//   ns: { db: 'ecommerce', coll: 'orders' },
//   documentKey: { _id: ObjectId('...') },
//   fullDocument: { ... },            // 完整文档（insert/replace）
//   updateDescription: {              // 仅 update
//     updatedFields: { status: 'paid' },
//     removedFields: []
//   }
// }
```

### 带过滤的变更流

```js
// 只监听特定操作类型和字段变更
const pipeline = [
  {
    $match: {
      operationType: { $in: ['insert', 'update'] },
      // 只关注状态变为 paid 的更新
      'updateDescription.updatedFields.status': 'paid'
    }
  }
]

const filteredStream = db.collection('orders').watch(pipeline, {
  fullDocument: 'updateLookup'  // update 时返回完整文档（需额外查询）
})
```

### 断点续传（Resume Token）

```js
// 保存 Resume Token（持久化到数据库或 Redis）
let resumeToken = null

const stream = db.collection('orders').watch([], {
  resumeAfter: resumeToken  // 从断点处继续（首次为 null）
})

stream.on('change', async (change) => {
  // 处理变更
  await handleChange(change)

  // 持久化 Resume Token（处理完成后再保存，保证 at-least-once）
  resumeToken = change._id
  await saveResumeToken(resumeToken)
})

// 应用重启后，从上次位置继续
resumeToken = await loadResumeToken()
const stream = db.collection('orders').watch([], { resumeAfter: resumeToken })
```

### 企业案例：订单状态驱动通知

```js
// 监听订单状态变更，触发推送通知
const orderStream = db.collection('orders').watch(
  [{ $match: { operationType: 'update' } }],
  { fullDocument: 'updateLookup' }
)

orderStream.on('change', async (change) => {
  const status = change.updateDescription?.updatedFields?.status
  if (!status) return

  const order = change.fullDocument
  switch (status) {
    case 'paid':
      await notifyUser(order.userId, `订单 ${order.orderId} 支付成功`)
      await triggerFulfillment(order)
      break
    case 'shipped':
      await notifyUser(order.userId, `订单已发货，快递单号：${order.trackingNo}`)
      break
    case 'delivered':
      await notifyUser(order.userId, '您的订单已送达，请确认收货')
      break
  }
})
```

---

## 总结

- `bulkWrite` 支持混合操作，`ordered:false` 提升吞吐
- 事务 `withTransaction` 自动处理重试，推荐使用
- 事务代价高，能用单文档原子操作则不用事务
- Change Streams 基于 Oplog，支持断点续传
- Resume Token 必须持久化，确保应用重启后不丢事件

**下一步**：聚合 API、索引 API 与管理 API。

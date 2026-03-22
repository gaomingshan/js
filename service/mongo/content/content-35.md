# 聚合 API、索引 API 与管理 API

## 概述

本章覆盖驱动层的聚合管道 API、索引管理接口、集合/数据库管理命令，以及超时控制和错误调试技巧。

---

## 聚合 API

### 基本用法

```js
// aggregate 返回 AggregationCursor
const cursor = db.collection('orders').aggregate([
  { $match: { status: 'paid', userId: 'u001' } },
  { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  { $sort: { total: -1 } }
], {
  allowDiskUse: true,         // 允许磁盘溢出（大数据量聚合）
  maxTimeMS: 30000,           // 超时 30 秒
  comment: 'order-stats-api'  // 标注注释，便于 Profiler 识别
})

// 收集结果
const results = await cursor.toArray()

// 流式处理（大数据量）
for await (const doc of cursor) {
  await processDoc(doc)
}
```

### 分页聚合

```js
async function pagedAggregate(page, pageSize) {
  const pipeline = [
    { $match: { status: 'paid' } },
    { $sort: { createdAt: -1 } },
    { $facet: {
        data:  [{ $skip: (page-1) * pageSize }, { $limit: pageSize }],
        total: [{ $count: 'count' }]
    }}
  ]
  const [result] = await db.collection('orders').aggregate(pipeline).toArray()
  return {
    data:  result.data,
    total: result.total[0]?.count ?? 0,
    page, pageSize
  }
}
```

---

## 索引 API

### 创建索引

```js
const collection = db.collection('orders')

// 创建单个索引
await collection.createIndex(
  { userId: 1, status: 1, createdAt: -1 },
  {
    name: 'idx_user_status_created',
    unique: false,
    background: true,   // 4.2- 兼容，4.4+ 默认即并发
    sparse: false
  }
)

// 批量创建（推荐，减少网络往返）
await collection.createIndexes([
  { key: { userId: 1 },           name: 'idx_userId' },
  { key: { email: 1 },            name: 'idx_email', unique: true },
  { key: { createdAt: 1 },        name: 'idx_ttl', expireAfterSeconds: 86400 },
  { key: { location: '2dsphere' }, name: 'idx_geo' }
])
```

### 查看索引

```js
// 列出所有索引
const indexes = await collection.listIndexes().toArray()
console.log(indexes)

// 查看索引大小
const stats = await collection.stats()
console.log(stats.indexSizes)  // { _id_: 12345, idx_userId: 67890, ... }
```

### 删除索引

```js
// 按名称删除
await collection.dropIndex('idx_userId')

// 按键删除
await collection.dropIndex({ userId: 1 })

// 删除所有索引（保留 _id）
await collection.dropIndexes()
```

---

## 集合管理 API

```js
// 创建集合（带选项）
await db.createCollection('sessions', {
  capped: false,
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'token', 'createdAt']
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
})

// 列出所有集合
const collections = await db.listCollections().toArray()
const collectionNames = await db.listCollections({}, { nameOnly: true }).toArray()

// 集合统计
const stats = await db.collection('orders').stats()
console.log({
  count: stats.count,
  size: (stats.size / 1024 / 1024).toFixed(2) + 'MB',
  storageSize: (stats.storageSize / 1024 / 1024).toFixed(2) + 'MB'
})

// 重命名集合
await db.collection('old_orders').rename('archived_orders')

// 删除集合
await db.collection('temp_data').drop()
```

---

## 数据库管理 API

```js
// 列出所有数据库
const adminDb = client.db('admin')
const dbList = await adminDb.admin().listDatabases()
console.log(dbList.databases.map(d => d.name))

// 数据库统计
const stats = await db.stats()
console.log({
  collections: stats.collections,
  dataSize: (stats.dataSize / 1024 / 1024).toFixed(2) + 'MB',
  storageSize: (stats.storageSize / 1024 / 1024).toFixed(2) + 'MB'
})

// 删除数据库
await db.dropDatabase()
```

---

## runCommand（执行原始命令）

```js
// 执行任意 MongoDB 命令
const result = await db.command({ ping: 1 })
const serverStatus = await db.admin().command({ serverStatus: 1 })

// 设置 Profiler
await db.command({ profile: 1, slowms: 100 })

// 修改集合验证器
await db.command({
  collMod: 'orders',
  validator: { $jsonSchema: { /* 新的 schema */ } }
})

// 修改 TTL 索引时间
await db.command({
  collMod: 'sessions',
  index: { name: 'idx_ttl', expireAfterSeconds: 7200 }
})
```

---

## 超时控制

```js
// 操作级别超时（maxTimeMS）
await collection.findOne(
  { userId: 'u001' },
  { maxTimeMS: 5000 }   // 5 秒超时
)

await collection.aggregate(pipeline, { maxTimeMS: 30000 })

await collection.updateMany(
  { status: 'pending' },
  { $set: { status: 'expired' } },
  { maxTimeMS: 60000 }
)

// 连接级别超时（socketTimeoutMS）
const client = new MongoClient(uri, {
  socketTimeoutMS: 30000,      // Socket 读写超时
  connectTimeoutMS: 10000,     // 连接建立超时
  serverSelectionTimeoutMS: 5000  // 服务器选择超时
})
```

---

## Change Streams watch API

```js
// 集合级别监听
const stream = db.collection('orders').watch(pipeline, options)

// 数据库级别监听（所有集合）
const dbStream = db.watch(pipeline)

// 集群级别监听（所有数据库）
const clusterStream = client.watch(pipeline)

// 关闭 Change Stream
await stream.close()
```

---

## 错误码参考

```js
// 常见错误码
const MONGO_ERRORS = {
  11000: '唯一索引冲突（E11000 duplicate key）',
  112:   '写冲突（事务）',
  251:   '事务过期',
  16500: '速率限制（Atlas Serverless）',
  50:    '操作超时（maxTimeMS 触发）',
  6:     '主机不可达',
  89:    '网络超时',
  13:    '权限不足',
  26:    '集合不存在（NamespaceNotFound）'
}

// 错误处理示例
try {
  await collection.insertOne(doc)
} catch (err) {
  if (err.code === 11000) {
    // 解析重复的字段
    const field = Object.keys(err.keyValue)[0]
    throw new Error(`${field} 已存在`)
  }
  throw err
}
```

---

## 总结

- `aggregate` 返回游标，大数据量用 `for await` 流式处理，加 `allowDiskUse:true`
- `createIndexes`（复数）批量创建索引，减少网络往返
- `runCommand` 是访问所有 MongoDB 命令的通用接口
- 所有操作都应设置 `maxTimeMS`，防止慢操作长时间阻塞
- 熟悉常见错误码（11000、112、50）加速故障排查

**下一步**：Spring Data MongoDB 架构详解。

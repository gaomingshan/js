# mongosh 常用操作

## 概述

mongosh 是 MongoDB 官方交互式 Shell，基于 Node.js 构建，支持完整的 JavaScript 语法。熟练掌握 mongosh 是日常开发和运维的必备技能。

---

## 连接与基础命令

```bash
# 连接本地
mongosh

# 连接远程（带认证）
mongosh "mongodb://admin:pass@10.0.0.1:27017/admin"

# 连接副本集
mongosh "mongodb://admin:pass@mongo1:27017,mongo2:27017,mongo3:27017/?replicaSet=rs0&authSource=admin"

# 连接 Atlas
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/ecommerce"

# 执行单条命令后退出
mongosh --eval "db.serverStatus().version" --quiet
```

---

## 数据库与集合管理

```js
// 数据库操作
show dbs                    // 列出所有数据库
use ecommerce               // 切换（不存在则首次写入时创建）
db                          // 显示当前数据库
db.dropDatabase()           // 删除当前数据库
db.stats()                  // 数据库统计信息

// 集合操作
show collections
db.createCollection("orders", {
  validator: { $jsonSchema: { bsonType: "object", required: ["orderId"] } }
})
db.orders.drop()
db.orders.renameCollection("old_orders")
db.orders.stats()           // 集合统计（大小、文档数、索引）
db.orders.countDocuments()  // 文档总数（精确）
db.orders.estimatedDocumentCount()  // 估算文档数（快速）
```

---

## CRUD 完整示例

```js
// ===== 插入 =====
db.users.insertOne({ name: "张三", age: 28, city: "深圳", createdAt: new Date() })

db.users.insertMany([
  { name: "李四", age: 32, city: "北京" },
  { name: "王五", age: 25, city: "上海" }
], { ordered: false })

// ===== 查询 =====
db.users.find()                                  // 所有文档
db.users.find({ city: "深圳" })                   // 过滤
db.users.find({ age: { $gt: 25 } }, { name: 1, age: 1, _id: 0 })  // 投影
db.users.find().sort({ age: -1 }).limit(10).skip(0)  // 排序分页
db.users.findOne({ name: "张三" })                // 返回第一条

// 查询嵌套字段
db.orders.find({ "address.city": "深圳" })

// 数组查询
db.products.find({ tags: "手机" })
db.products.find({ tags: { $all: ["手机", "Apple"] } })
db.orders.find({ items: { $elemMatch: { sku: "P001", qty: { $gte: 2 } } } })

// ===== 更新 =====
// 更新单条
db.users.updateOne(
  { name: "张三" },
  { $set: { age: 29, updatedAt: new Date() } }
)

// 更新多条
db.users.updateMany(
  { city: "深圳" },
  { $inc: { loginCount: 1 } }
)

// upsert（不存在则插入）
db.users.updateOne(
  { email: "new@test.com" },
  { $set: { name: "新用户" }, $setOnInsert: { createdAt: new Date() } },
  { upsert: true }
)

// 原子操作：更新并返回更新后的文档
db.orders.findOneAndUpdate(
  { orderId: "ORD001", status: "pending" },
  { $set: { status: "processing", processedAt: new Date() } },
  { returnDocument: "after" }  // 返回更新后文档
)

// ===== 删除 =====
db.users.deleteOne({ name: "张三" })
db.users.deleteMany({ status: "inactive" })
db.users.findOneAndDelete({ name: "王五" })  // 删除并返回被删文档
```

---

## 聚合管道调试技巧

```js
// 逐步添加阶段，调试每步结果
db.orders.aggregate([
  { $match: { status: "paid" } }
])  // 先验证过滤结果

db.orders.aggregate([
  { $match: { status: "paid" } },
  { $group: { _id: "$userId", total: { $sum: "$amount" } } }
])  // 再验证分组结果

// 添加 $limit 快速预览
db.orders.aggregate([
  { $match: { status: "paid" } },
  { $limit: 5 },  // 调试时只看 5 条
  { $group: { _id: "$userId", total: { $sum: "$amount" } } }
])

// explain 分析聚合性能
db.orders.explain("executionStats").aggregate([
  { $match: { status: "paid", userId: "u001" } },
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

---

## 索引管理命令

```js
// 查看索引
db.orders.getIndexes()
db.orders.stats().indexSizes          // 各索引占用空间

// 创建索引
db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 }, {
  name: "idx_user_status_created",
  background: true
})

// 删除索引
db.orders.dropIndex("idx_user_status_created")
db.orders.dropIndexes()               // 删除所有（保留 _id）

// 索引使用统计
db.orders.aggregate([{ $indexStats: {} }])
```

---

## 副本集管理命令

```js
// 状态查看
rs.status()                           // 副本集状态
rs.conf()                             // 副本集配置
rs.isMaster()                         // 当前节点信息
rs.printReplicationInfo()            // Oplog 信息
rs.printSecondaryReplicationInfo()   // 复制延迟

// 配置管理
rs.add("mongo4:27017")
rs.remove("mongo4:27017")
rs.stepDown(60)                       // 主动降级（60s 内不参与竞选）

// 修改配置
const cfg = rs.conf()
cfg.members[0].priority = 3
rs.reconfig(cfg)
```

---

## 分片集群命令

```js
// 查看分片状态
sh.status()                            // 完整分片集群状态
sh.getBalancerState()                  // 均衡器状态

// 分片操作
sh.enableSharding("ecommerce")
sh.shardCollection("ecommerce.orders", { userId: "hashed" })
sh.addShard("shard2RS/shard2a:27018,shard2b:27018")

// 均衡器
sh.stopBalancer()
sh.startBalancer()
```

---

## 诊断命令速查表

```js
// 服务器状态
db.serverStatus()                     // 全量状态
db.serverStatus().opcounters          // 操作计数
db.serverStatus().connections         // 连接数
db.serverStatus().wiredTiger.cache    // Cache 状态

// 实时操作
db.currentOp()                        // 当前运行操作
db.currentOp({ secs_running: { $gte: 5 } })  // 慢操作
db.killOp(12345)                      // 终止操作

// Profiler
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)
db.setProfilingLevel(0)

// 数据库锁
db.adminCommand({ lockInfo: 1 })

// 参数查询
db.adminCommand({ getParameter: "*" })  // 所有参数
db.adminCommand({ getParameter: 1, wiredTigerCacheSizeGB: 1 })
```

---

## mongosh 脚本化

```bash
# 执行 JS 文件
mongosh --file /scripts/daily-stats.js

# 或管道输入
mongosh <<EOF
use ecommerce
db.orders.aggregate([
  { \$match: { status: "paid" } },
  { \$count: "total" }
])
EOF

# 结合 cron 定时执行
# crontab: 0 9 * * * mongosh --eval "load('/scripts/morning-check.js')" --quiet
```

---

## 总结

- mongosh 完全支持 JavaScript，可用变量、循环、函数
- `db.serverStatus()` 是诊断的万能入口
- 聚合调试：逐步添加阶段，配合 `$limit` 快速预览
- 生产运维常备：`currentOp`、`killOp`、`rs.status()`、`rs.printSecondaryReplicationInfo()`

**下一步**：原生 CRUD API 详解。

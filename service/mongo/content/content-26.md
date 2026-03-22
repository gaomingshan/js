# 分片键设计

## 概述

分片键（Shard Key）是分片集群中最关键的设计决策。一旦选定，几乎无法修改（6.0+ 支持 reshard，但代价很高）。错误的分片键会导致热点、数据倾斜、查询全分片扫描等严重问题。

---

## 分片键选择原则

### 三个核心维度

```
1. 基数（Cardinality）：分片键的唯一值数量
   → 基数越高，Chunk 划分越细，扩展性越好
   → 基数低（如 status 只有 5 个值）→ 无法均匀分布

2. 写分布（Write Distribution）：写入是否均匀分散到所有 Shard
   → 写入集中到少数 Shard = 热点（Hot Spot）
   → 目标：写入均匀分布所有 Shard

3. 查询隔离（Query Isolation）：查询能否路由到单个 Shard
   → 带分片键的查询 → 单 Shard 查询（高效）
   → 不带分片键的查询 → 广播到所有 Shard（低效）
```

### 选择决策矩阵

| 分片键类型 | 基数 | 写分布 | 查询隔离 | 适用场景 |
|-----------|------|--------|----------|----------|
| 单调递增（时间戳、自增ID）| 高 | ❌ 热点 | ✅ | 不推荐作主分片键 |
| 低基数字段（status、type）| 低 | ❌ 倾斜 | ✅ | 不推荐单独使用 |
| 高基数随机字段（UUID）| 高 | ✅ 均匀 | ❌ 广播 | 仅写入场景 |
| 哈希分片键 | 高 | ✅ 均匀 | 部分 | 通用高写入 |
| 复合分片键 | 高 | ✅ | ✅ | **推荐** |

---

## 范围分片（Range Sharding）

按分片键值的连续范围划分 Chunk。

```js
// 按 userId 范围分片
sh.shardCollection("ecommerce.orders", { userId: 1 })

// Chunk 分布（有序）：
// [MinKey, "user_1000")  → Shard 1
// ["user_1000", "user_2000") → Shard 2
// ["user_2000", MaxKey)  → Shard 3
```

**优势**：范围查询高效，能路由到单个或少数 Shard

**劣势**：单调递增键（如时间戳）会造成写入热点

```
❌ 热点场景：分片键为 createdAt（时间戳）
   新数据总是写入最大时间戳所在的 Shard
   → 该 Shard 成为热点，其他 Shard 闲置
```

---

## 哈希分片（Hashed Sharding）

对分片键值取哈希，按哈希值范围划分 Chunk，实现均匀分布。

```js
// 哈希分片
sh.shardCollection("ecommerce.orders", { userId: "hashed" })

// 内部实现：
// hash("user_001") = 3456789 → Shard 2
// hash("user_002") = 1234567 → Shard 1
// hash("user_003") = 7654321 → Shard 3
// 即使 userId 连续，哈希后随机分布
```

**优势**：写入均匀，彻底消除热点

**劣势**：范围查询（如 userId BETWEEN）必须广播到所有 Shard

---

## 复合分片键（推荐方案）

结合多个字段，兼顾写分布和查询隔离。

### 方案一：低基数 + 高基数

```js
// 用户订单：按 userId + _id 分片
sh.shardCollection("ecommerce.orders", { userId: 1, _id: 1 })

// 优势：
// - userId 提供查询隔离（按用户查询走单 Shard）
// - _id 提供高基数，避免 userId 热点
// - 同一用户的订单在同一 Shard，$lookup 效率高
```

### 方案二：哈希 + 范围

```js
// 日志数据：按 hash(appId) + timestamp
sh.shardCollection("logs.access", { appId: "hashed", timestamp: 1 })

// 优势：
// - appId 哈希确保写入均匀
// - timestamp 范围支持时间范围查询
```

---

## Zone Sharding（区域分片）

将特定数据路由到指定 Shard，适合数据地理隔离和合规要求。

```js
// 场景：中国用户数据存储在中国机房，欧洲用户在欧洲

// 1. 为 Shard 添加 Zone 标签
sh.addShardToZone("shard1", "CN")
sh.addShardToZone("shard2", "EU")

// 2. 配置 Zone 键范围
sh.updateZoneKeyRange(
  "ecommerce.users",
  { region: "CN", userId: MinKey },
  { region: "CN", userId: MaxKey },
  "CN"
)
sh.updateZoneKeyRange(
  "ecommerce.users",
  { region: "EU", userId: MinKey },
  { region: "EU", userId: MaxKey },
  "EU"
)

// 3. 分片键必须包含 region
sh.shardCollection("ecommerce.users", { region: 1, userId: 1 })

// 效果：region=CN 的用户数据只存储在 shard1（中国机房）
```

---

## 热点分片的识别与解决

```js
// 识别热点 Shard
use admin
db.runCommand({ serverStatus: 1 }).opcounters

// 或查看各 Shard 的 Chunk 数量分布
use config
db.chunks.aggregate([
  { $match: { ns: "ecommerce.orders" } },
  { $group: { _id: "$shard", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// 若某个 Shard 的 Chunk 数量远多于其他 → 数据倾斜
// 若某个 Shard 的写入 QPS 远高于其他 → 写入热点
```

### 解决热点的方案

```
1. 更换分片键（需要 reshard，代价大）
   MongoDB 6.0+ 支持在线 reshard

2. 改为哈希分片（消除单调递增热点）

3. 添加随机前缀（应用层处理）
   orderId = random(0,9) + "-" + originalId
   → 写入分散到 10 个不同 Chunk

4. Zone Sharding 手动分配热点数据
```

---

## 企业案例

### 案例一：亿级订单系统

```js
// ❌ 错误：按 createdAt 分片
sh.shardCollection("orders", { createdAt: 1 })
// → 新订单全写最新 Chunk，热点！

// ✅ 正确：按 userId 哈希 + _id
sh.shardCollection("orders", { userId: "hashed", _id: 1 })
// → 写入均匀，按用户查询高效
```

### 案例二：多租户 SaaS

```js
// 按 tenantId 范围分片 + Zone 隔离
sh.shardCollection("saas.data", { tenantId: 1, _id: 1 })
// → 同一租户数据在同一 Shard，查询高效
// → 可用 Zone 将大客户路由到专属 Shard
```

---

## 总结

- 分片键选择：高基数 + 写均匀 + 查询隔离，三者权衡
- 单调递增键（时间戳、自增ID）单独作分片键会造成热点
- 哈希分片写入均匀但牺牲范围查询，复合键两者兼顾
- Zone Sharding 实现数据地理隔离和合规要求
- 分片键选定后修改代价极高，设计阶段要充分评审

**下一步**：Chunk 迁移、均衡器与跨区域部署。

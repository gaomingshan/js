# 分片集群架构

## 概述

当单个副本集无法承载数据量或写入压力时，MongoDB 通过分片（Sharding）实现水平扩展。分片集群将数据分散到多个副本集（Shard），每个 Shard 只存储整体数据的一个子集。

---

## 分片集群组成

```
客户端应用
    ↓
┌─────────────────────┐
│   mongos（路由层）   │  ← 可部署多个，无状态
└─────────────────────┘
    ↓ 查询路由
┌────────────┬─────────────────────┐
│Config Server│     Shard 层        │
│（副本集）   │                     │
│存储元数据   │  Shard 1（副本集）  │
│分片键范围   │  Shard 2（副本集）  │
│Chunk 分布   │  Shard N（副本集）  │
└────────────┴─────────────────────┘
```

### 三大组件详解

#### 1. mongos（路由进程）

```
职责：
  - 接收客户端请求
  - 从 Config Server 获取路由表
  - 将请求转发到正确的 Shard
  - 汇总多个 Shard 的结果返回客户端

特点：
  - 无状态，可横向扩展（部署多个 mongos 实现负载均衡）
  - 路由表缓存在内存，定期从 Config Server 刷新
  - 应用程序连接 mongos，无感知后端 Shard 细节
```

#### 2. Config Server（配置服务器）

```
职责：
  - 存储分片集群的元数据
  - 记录哪个 Chunk 在哪个 Shard 上
  - 管理分片键范围映射

部署要求：
  - 必须是副本集（3节点）
  - 生产环境独立部署，不与 Shard 混用
  - 3.4+ 版本 Config Server 只能是副本集
```

```yaml
# Config Server mongod.conf
sharding:
  clusterRole: configsvr
replication:
  replSetName: configReplSet
```

#### 3. Shard（数据分片）

```
职责：
  - 存储实际数据（数据子集）
  - 每个 Shard 是一个副本集（保障高可用）
  - 执行 mongos 转发来的查询
```

```yaml
# Shard mongod.conf
sharding:
  clusterRole: shardsvr
replication:
  replSetName: shard1ReplSet
```

---

## Chunk（数据块）

```
Chunk 是 MongoDB 分片的基本单位：
  - 每个 Chunk 包含一段连续的分片键范围
  - 默认大小：128MB（可配置 1~1024MB）
  - Chunk 按分片键范围分配到各 Shard

示例（按 userId 范围分片）：
  Chunk 1：userId [MinKey, "user_1000")  → Shard 1
  Chunk 2：userId ["user_1000", "user_2000") → Shard 2
  Chunk 3：userId ["user_2000", MaxKey)  → Shard 3
```

```js
// 查看 Chunk 分布
use config
db.chunks.find({ ns: "ecommerce.orders" }).pretty()

// 输出
{
  _id: "ecommerce.orders-userId_MinKey",
  ns: "ecommerce.orders",
  min: { userId: MinKey },
  max: { userId: "user_1000" },
  shard: "shard1",
  jumbo: false
}
```

---

## 均衡器（Balancer）

```
均衡器自动将 Chunk 在 Shard 间迁移，保持数据均衡

触发条件：
  Shard 间 Chunk 数量差 > 阈值（默认 2~8，取决于总 Chunk 数）

工作方式：
  1. 检测各 Shard 的 Chunk 数量
  2. 若不均衡，选择最多和最少的 Shard
  3. 迁移 Chunk：源 Shard → 目标 Shard
  4. 更新 Config Server 的路由表
```

```js
// 查看均衡器状态
sh.getBalancerState()       // true/false
sh.isBalancerRunning()      // 是否正在均衡
sh.getBalancerWindow()      // 均衡时间窗口

// 配置均衡时间窗口（避开业务高峰）
use config
db.settings.updateOne(
  { _id: "balancer" },
  { $set: { activeWindow: { start: "02:00", stop: "06:00" } } },
  { upsert: true }
)

// 临时停止均衡器（维护期间）
sh.stopBalancer()
sh.startBalancer()
```

---

## 分片集群搭建步骤

```bash
# 1. 启动 Config Server 副本集（3节点）
mongod --configsvr --replSet configRS --port 27019 --dbpath /data/configdb

# 2. 初始化 Config Server 副本集
mongosh --port 27019
rs.initiate({ _id: "configRS", configsvr: true, members: [
  { _id: 0, host: "config1:27019" },
  { _id: 1, host: "config2:27019" },
  { _id: 2, host: "config3:27019" }
]})

# 3. 启动各 Shard 副本集
mongod --shardsvr --replSet shard1RS --port 27018 --dbpath /data/shard1

# 4. 启动 mongos
mongos --configdb configRS/config1:27019,config2:27019,config3:27019 --port 27017

# 5. 连接 mongos，添加 Shard
mongosh --port 27017
sh.addShard("shard1RS/shard1a:27018,shard1b:27018,shard1c:27018")
sh.addShard("shard2RS/shard2a:27018,shard2b:27018,shard2c:27018")

# 6. 开启数据库分片
sh.enableSharding("ecommerce")

# 7. 对集合分片
sh.shardCollection("ecommerce.orders", { userId: "hashed" })
```

---

## 分片 vs 副本集选型

| 维度 | 副本集 | 分片集群 |
|------|--------|----------|
| 数据量 | < 2TB | > 2TB 或需水平扩展 |
| 写入压力 | 单节点承受 | 需多节点分担 |
| 运维复杂度 | 低 | 高（3个组件）|
| 查询灵活性 | 高 | 受分片键限制 |
| 成本 | 低 | 高 |
| 适用场景 | 大多数业务 | 超大数据量/高写入 |

**建议**：不要过早分片，副本集能撑住就不要分片。

---

## 总结

- 分片集群 = mongos（路由）+ Config Server（元数据）+ Shard（数据）
- Chunk 是数据迁移的最小单位，均衡器自动维持各 Shard 均衡
- 每个 Shard 是副本集，保障分片内高可用
- 均衡器建议设置维护窗口，避开业务高峰
- 分片增加复杂度，仅在真正需要时使用

**下一步**：分片键设计原则与实践。

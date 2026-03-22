# Chunk 迁移、均衡器与跨区域部署

## 概述

Chunk 迁移和均衡器是分片集群自动维持数据均衡的核心机制。跨区域部署则是企业级高可用和容灾的重要方案。

---

## Chunk 分裂（Split）

```
触发条件：
  Chunk 大小超过 chunkSize 阈值（默认 128MB）

分裂过程：
  1. mongos 检测到 Chunk 过大
  2. 找到中间分片键值作为分裂点
  3. 将一个 Chunk 分成两个
  4. 更新 Config Server 元数据
  注意：分裂不移动数据，只更新元数据边界

配置 chunkSize：
use config
db.settings.updateOne(
  { _id: "chunksize" },
  { $set: { value: 64 } },  // 改为 64MB
  { upsert: true }
)
```

### Jumbo Chunk（超大块）

```
问题：某分片键范围内文档数量极多，即使超过 chunkSize 也无法分裂
（分片键值完全相同，无法找到中间分裂点）

症状：config.chunks 中 jumbo: true

危害：
  - Jumbo Chunk 无法被均衡器迁移
  - 导致数据严重倾斜

解决：
  1. 根本解决：选择更高基数的分片键（重新设计）
  2. 临时处理：手动清除 jumbo 标记
  db.adminCommand({ clearJumboFlag: "ecommerce.orders",
                    bounds: [{ userId: "hot_user" }, { userId: "hot_user_next" }] })
```

---

## Chunk 迁移（Migration）

```
迁移流程：
  1. 均衡器选择源 Shard（Chunk 最多）和目标 Shard（Chunk 最少）
  2. 目标 Shard 从源 Shard 复制 Chunk 数据
  3. 复制期间，写操作仍在源 Shard 执行，变更追踪到迁移日志
  4. 追赶迁移日志（增量同步）
  5. 短暂加锁，完成最后的增量同步
  6. 更新 Config Server：Chunk 归属从源 → 目标
  7. 源 Shard 删除已迁移的数据（后台异步）
```

### 迁移对性能的影响

```
影响：
  - 增加源和目标 Shard 的网络和 I/O 负载
  - 大 Chunk 迁移时间长，期间写入延迟可能上升
  - 并发迁移数过多会严重影响性能

控制并发迁移数：
use config
db.settings.updateOne(
  { _id: "balancer" },
  { $set: { _secondaryThrottle: true,
            _waitForDelete: false } },
  { upsert: true }
)

// 查看当前迁移状态
sh.isBalancerRunning()
db.adminCommand({ balancerStatus: 1 })
```

---

## 均衡器（Balancer）配置

```js
// 查看均衡器状态
sh.getBalancerState()     // 是否启用
sh.isBalancerRunning()    // 是否正在运行

// 设置均衡时间窗口（避开业务高峰）
use config
db.settings.updateOne(
  { _id: "balancer" },
  {
    $set: {
      activeWindow: {
        start: "02:00",   // UTC 时间
        stop:  "06:00"
      }
    }
  },
  { upsert: true }
)

// 停止/启动均衡器
sh.stopBalancer()
sh.startBalancer()

// 手动移动特定 Chunk（运维操作）
db.adminCommand({
  moveChunk: "ecommerce.orders",
  find: { userId: "user_001" },
  to: "shard2"
})
```

---

## 跨可用区（AZ）副本集部署

```
三可用区部署（推荐）：
  AZ-1：Primary（priority: 2）
  AZ-2：Secondary（priority: 1）
  AZ-3：Secondary（priority: 1）

故障场景：
  AZ-1 故障 → AZ-2 或 AZ-3 自动接管（多数派仍可用）
  AZ-1 + AZ-2 同时故障 → 服务中断（少数派，无法选主）

配置：
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "az1-host:27017", priority: 2 },
    { _id: 1, host: "az2-host:27017", priority: 1 },
    { _id: 2, host: "az3-host:27017", priority: 1 }
  ]
})
```

---

## 跨地域部署（Multi-Region）

### 主备多地域

```
架构：
  主地域（中国）：Primary + 2 Secondary（处理写请求）
  备地域（香港）：1 Secondary（priority: 0，只读）
  灾备地域（新加坡）：1 Secondary（priority: 0，hidden）

连接字符串：
mongodb://china1,china2,china3,hk1/?replicaSet=rs0&readPreference=nearest

特点：
  - 写入延迟：主地域内（< 5ms）
  - 读取延迟：就近读（nearest），香港用户读香港节点
  - 容灾：主地域整体故障时，手动提升备地域
```

### 写入延迟权衡

```
w:"majority" 跨地域的代价：
  中国 → 香港 RTT：约 30~50ms
  若 majority 需要香港节点确认 → 写入延迟 30~50ms

解决方案：
  1. 主地域部署 3 节点，majority=2 只需主地域内确认
  2. 备地域节点 priority:0，votes:0（不参与投票）
     → majority 计算只在主地域节点间

cfg.members[3].votes = 0  // 备地域节点不参与投票
rs.reconfig(cfg)
```

---

## 多数据中心写入一致性

```
5节点跨两地域部署（3+2）：
  主数据中心：3节点（majority=3 时需要跨中心）
  备数据中心：2节点

  问题：majority(5)=3，跨中心写入
  解决：主中心 3节点 votes=1，备中心 2节点 votes=0
        → majority(3)=2，只需主中心 2节点确认

推荐架构（云原生）：
  同一地域 3 可用区各一节点（majority 在同城）
  + 异地 1-2 节点（votes:0，异步同步，不影响写入延迟）
```

---

## 总结

- Chunk 分裂只更新元数据，不移动数据；迁移才真正移动数据
- Jumbo Chunk 无法均衡，根本解决是设计高基数分片键
- 均衡器设置维护窗口，避开业务高峰
- 跨可用区至少 3 AZ 部署，防单 AZ 故障
- 跨地域写入延迟通过调整 votes 数控制 majority 范围

**下一步**：慢查询分析与系统瓶颈定位。

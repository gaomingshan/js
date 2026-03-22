# 副本集架构与选主机制

## 概述

副本集（Replica Set）是 MongoDB 高可用的基础，通过多节点数据冗余和自动故障转移，保障服务的连续性。理解选主机制，是正确配置副本集和诊断故障的核心。

---

## 副本集架构

```
┌─────────────────────────────────────────┐
│              副本集（rs0）               │
│                                         │
│  ┌──────────┐    ┌──────────┐    ┌────┐ │
│  │ Primary  │←→  │Secondary │    │Arb │ │
│  │（主节点）│    │（从节点）│    │仲裁│ │
│  └──────────┘    └──────────┘    └────┘ │
│       ↓ Oplog 同步                      │
│  ┌──────────┐                           │
│  │Secondary │                           │
│  │（从节点）│                           │
│  └──────────┘                           │
└─────────────────────────────────────────┘
```

### 节点角色

| 角色 | 说明 | 投票权 |
|------|------|--------|
| **Primary** | 接受所有写操作，同步 Oplog 到 Secondary | ✅ |
| **Secondary** | 同步 Primary 的 Oplog，可承担读请求 | ✅ |
| **Arbiter** | 只参与选举投票，不存储数据 | ✅ |
| **Hidden** | 不接受客户端读请求，用于备份 | ✅ |
| **Delayed** | 滞后同步（如延迟 1 小时），防误操作 | ✅ |

**最佳实践**：生产环境至少 3 个数据节点（不含 Arbiter），奇数个投票节点。

---

## 副本集配置

```js
// 初始化三节点副本集
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 2 },  // 高优先级，倾向成为 Primary
    { _id: 1, host: "mongo2:27017", priority: 1 },
    { _id: 2, host: "mongo3:27017", priority: 1 }
  ]
})

// 查看副本集状态
rs.status()

// 查看配置
rs.conf()

// 添加节点
rs.add("mongo4:27017")
rs.add({ host: "mongo4:27017", priority: 0, hidden: true })  // 隐藏节点

// 删除节点
rs.remove("mongo4:27017")

// 修改配置（直接修改 conf 对象后 reconfig）
const cfg = rs.conf()
cfg.members[0].priority = 3
rs.reconfig(cfg)
```

---

## 选举机制（基于 Raft 协议改进）

### 选举触发条件

```
触发选举的场景：
  1. Primary 节点宕机或网络不可达
  2. Primary 主动降级（rs.stepDown()）
  3. 副本集初始化
  4. 新节点加入或配置变更
```

### 选举过程

```
1. 检测：Secondary 心跳超时（默认 10 秒未收到 Primary 心跳）
2. 等待：随机等待 0~1 秒（减少同时竞选）
3. 候选：节点将自己的 term（任期号）+1，向其他节点请求投票
4. 投票规则：
   - 同一任期只投一票
   - 候选节点的 Oplog 必须不落后于投票节点
   - Priority 为 0 的节点不能成为 Primary
5. 当选：获得多数票（majority）的节点成为新 Primary
6. 通知：新 Primary 广播自己的身份

典型耗时：10~30 秒（心跳超时 + 选举过程）
```

### Priority 的影响

```js
// priority: 0  → 永远不会成为 Primary
// priority: 1  → 默认，参与选举
// priority: 2  → 更倾向成为 Primary（其他条件相同时优先）
// priority: 10 → 强烈倾向成为 Primary

// 场景：主数据中心优先级高，灾备中心优先级低
{ host: "primary-dc:27017",   priority: 10 }
{ host: "primary-dc2:27017",  priority: 5  }
{ host: "dr-datacenter:27017", priority: 0  }  // 灾备节点不做 Primary
```

---

## 脑裂防护：多数派原则

```
网络分区场景（3节点）：

  分区A：Primary + 1 Secondary（2节点）
  分区B：1 Secondary（1节点）

  分区A：2节点 > majority(3)=2 → Primary 继续服务 ✅
  分区B：1节点 < majority(3)=2 → 无法选出新 Primary ❌

→ 整个集群只有一个 Primary，防止脑裂

5节点副本集网络分区（3+2）：
  3节点分区：majority=3，可选出 Primary ✅
  2节点分区：不足 majority，只读 ❌
```

**关键**：副本集节点数必须保证能形成多数派（奇数节点或使用 Arbiter 补充投票权）。

---

## 常用监控命令

```js
// 查看副本集状态（最常用）
rs.status()
// 关键字段：
// members[].stateStr：PRIMARY / SECONDARY / ARBITER / DOWN
// members[].optime：节点 Oplog 位置
// members[].optimeDate：最后同步时间
// members[].lastHeartbeat：最后心跳时间
// members[].health：1=健康 0=不健康

// 查看复制延迟
rs.printSecondaryReplicationInfo()
// 输出：
// source: mongo2:27017
// syncedTo: Mon Jan 15 2024 10:30:00
// 0 secs (0 hrs) behind the primary

// Primary 主动降级（滚动重启时使用）
rs.stepDown(60)  // 60秒内不参与竞选

// 查看是否是 Primary
db.isMaster()  // 或 db.hello()
```

---

## 易错点

```
❌ 使用 2 节点副本集（无 Arbiter）
   → 一个节点挂掉，另一个无法形成 majority → 服务中断
   → 至少用 3 节点，或 2节点 + 1 Arbiter

❌ Arbiter 部署在与 Primary 同一台机器
   → 机器宕机时，Arbiter 也挂掉，无法参与投票
   → Arbiter 必须部署在独立机器

❌ Priority 设置不当导致频繁切主
   → 灾备节点 priority 应设为 0

❌ 心跳超时参数未调整（云环境网络抖动）
   → 调整 heartbeatTimeoutSecs（默认 10s）
   → 或使用 electionTimeoutMillis（默认 10000ms）
```

---

## 总结

- 副本集 = 高可用 + 数据冗余 + 读扩展
- 选举基于多数派，防止脑裂，典型耗时 10~30 秒
- Priority 控制选主倾向，0 表示永不成为 Primary
- 生产最少 3 个数据节点，关键业务 5 节点
- `rs.status()` 和 `rs.printSecondaryReplicationInfo()` 是日常运维必备

**下一步**：Oplog 同步与复制延迟分析。

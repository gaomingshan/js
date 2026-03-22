# Write Concern / Read Concern / Read Preference

## 概述

这三个配置项共同决定 MongoDB 在分布式环境下的**一致性与可用性权衡**，是理解副本集数据保障的核心。

---

## Write Concern（写关注）

控制写操作需要多少节点确认才返回成功。

```js
// 完整格式
{ w: <value>, j: <boolean>, wtimeout: <number> }
```

| 参数 | 说明 |
|------|------|
| `w: 0` | 不等待确认 |
| `w: 1` | 等待 Primary 确认（默认）|
| `w: "majority"` | 等待多数节点确认（推荐）|
| `j: true` | 等 Journal 刷盘 |
| `wtimeout: 5000` | 写超时（ms）|

```js
// 订单支付：最高安全
db.orders.insertOne(order, {
  writeConcern: { w: "majority", j: true, wtimeout: 5000 }
})

// 日志：追求吞吐
db.logs.insertOne(log, { writeConcern: { w: 0 } })
```

### w:"majority" 保障原理

```
3 节点副本集：majority = 2
  写入 Primary + 至少 1 个 Secondary 确认
  即使 Primary 崩溃，新 Primary 一定包含该数据
  → 数据不会丢失
```

---

## Read Concern（读关注）

| Read Concern | 说明 | 场景 |
|-------------|------|------|
| `local` | 读本地最新数据（默认）| 低延迟读 |
| `majority` | 只读多数节点已确认数据 | 关键业务读 |
| `linearizable` | 最强一致性，只用于 Primary | 极端需求 |
| `snapshot` | 事务快照读 | 多文档事务 |

```js
// 读取多数节点已确认的数据
db.orders.find({ orderId: "ORD001" }).readConcern("majority")
```

---

## Read Preference（读偏好）

| Read Preference | 说明 | 场景 |
|----------------|------|------|
| `primary`（默认）| 只读 Primary | 强一致性 |
| `primaryPreferred` | 优先 Primary | 高容错 |
| `secondary` | 只读 Secondary | 报表分析 |
| `secondaryPreferred` | 优先 Secondary | 读扩展 |
| `nearest` | 读延迟最低节点 | 多地域 |

```js
// 连接字符串配置
mongodb://host1,host2,host3/db?replicaSet=rs0&readPreference=secondaryPreferred

// 代码中配置（Node.js Driver）
const col = db.collection('reports')
col.find(query).withReadPreference('secondary')
```

---

## 因果一致性（Causal Consistency）

保证同一 Session 内，后续操作能看到前一操作的结果。

```js
const session = client.startSession({ causalConsistency: true })

// 写入 Primary
await db.users.updateOne(
  { _id: userId }, { $set: { status: "verified" } },
  { session, writeConcern: { w: "majority" } }
)

// 立即从 Secondary 读，仍能看到上面的写入
const user = await db.users.findOne(
  { _id: userId },
  { session, readPreference: "secondary" }
)
// user.status === "verified" ✅
```

---

## 企业场景配置方案

### 订单支付

```js
// 写：等待多数节点
{ writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
// 读：Primary，强一致
{ readPreference: "primary", readConcern: { level: "majority" } }
```

### 报表分析

```js
// 读：Secondary，不影响 Primary
{ readPreference: "secondary", readConcern: { level: "majority" } }
```

### 日志写入

```js
// 写：追求吞吐
{ writeConcern: { w: 1, j: false } }
// 读：就近读
{ readPreference: "nearest" }
```

---

## 易错点

```
❌ Secondary 读 + local read concern
   → 可能读到已回滚的数据（脏读）
   → 应使用 readConcern: "majority"

❌ w:"majority" 不设 wtimeout
   → Secondary 全挂时永久等待
   → 生产必须设置 wtimeout

❌ 用 w:0 写关键业务数据
   → 网络错误无感知，数据静默丢失
```

---

## 总结

| 配置 | 控制维度 | 核心选项 |
|------|----------|----------|
| Write Concern | 写入可靠性 | `w:"majority", j:true` |
| Read Concern | 读取一致性 | `majority` |
| Read Preference | 读取路由 | `secondary`（报表）/ `primary`（业务）|

**关键原则**：关键业务数据写用 `majority`，读从 Primary，日志/报表可放宽。

**下一步**：WiredTiger 缓存与压缩机制深入解析。

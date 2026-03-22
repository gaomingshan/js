# 慢查询分析与系统瓶颈定位

## 概述

性能问题的定位需要系统化的方法：先用监控工具发现异常，再用 Profiler 和 explain 定位根因，最后针对性优化。本章提供完整的调优方法论。

---

## 慢查询日志配置

```yaml
# mongod.conf
operationProfiling:
  slowOpThresholdMs: 100   # 超过 100ms 记录为慢查询
  mode: slowOp             # off=关闭 slowOp=记录慢查询 all=记录所有
  slowOpSampleRate: 1.0    # 采样率（1.0=100%，0.5=50%）
```

```js
// 动态修改（无需重启）
db.setProfilingLevel(1, { slowms: 100, sampleRate: 1.0 })

// 0 = 关闭
// 1 = 只记录慢查询（生产推荐）
// 2 = 记录所有操作（调试用，高 I/O，谨慎使用）

// 查看当前配置
db.getProfilingStatus()
```

---

## 分析 system.profile

```js
// 查看最近 10 条慢查询（按时间倒序）
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty()

// 关键字段说明
{
  op: "query",                    // 操作类型：query/update/insert/delete/command
  ns: "ecommerce.orders",         // 命名空间
  command: { find: "orders", filter: { userId: "u1" } },
  keysExamined: 0,                // 索引键扫描数（0=全表）
  docsExamined: 1000000,          // 文档扫描数（远大于 nreturned = 问题！）
  nreturned: 5,
  millis: 3500,                   // 执行耗时（ms）
  planSummary: "COLLSCAN",        // 执行计划摘要
  ts: ISODate("2024-01-15T10:30:00Z"),
  client: "10.0.0.1:50123"
}

// 找出最慢的查询
db.system.profile.find().sort({ millis: -1 }).limit(20)

// 找出全表扫描的查询
db.system.profile.find({ planSummary: "COLLSCAN" }).sort({ millis: -1 })

// 按命名空间统计慢查询次数
db.system.profile.aggregate([
  { $group: { _id: { ns: "$ns", op: "$op" }, count: { $sum: 1 }, avgMs: { $avg: "$millis" } } },
  { $sort: { avgMs: -1 } }
])

// 清理 profile 集合
db.system.profile.drop()
```

---

## currentOp：实时查看运行操作

```js
// 查看所有当前运行操作
db.currentOp()

// 过滤慢操作（运行超过 5 秒）
db.currentOp({ secs_running: { $gte: 5 } })

// 过滤特定类型
db.currentOp({ op: "query", ns: /ecommerce/ })

// 关键字段
{
  opid: 12345,
  op: "query",
  ns: "ecommerce.orders",
  secs_running: 15,           // 已运行 15 秒（告警！）
  planSummary: "COLLSCAN",    // 全表扫描
  client: "10.0.0.1:50123",
  "command": { find: "orders", filter: { amount: { $gt: 1000 } } }
}

// 终止慢操作（紧急情况）
db.killOp(12345)
```

---

## 瓶颈定位：四大方向

### 1. CPU 瓶颈

```bash
# 系统层面
top -p $(pidof mongod)  # 查看 mongod CPU 占用

# MongoDB 层面（高 CPU 通常是大量全表扫描或复杂聚合）
# 表现：CPU 持续 > 80%，mongod 进程 CPU 高
# 解决：
#   - 找出全表扫描查询，添加索引
#   - 减少复杂聚合，分批处理
#   - 升级 CPU 或水平分片
```

### 2. 内存瓶颈

```js
// 检查 WiredTiger Cache 状态
const cache = db.serverStatus().wiredTiger.cache
const usageRatio = cache["bytes currently in the cache"] / cache["maximum bytes configured"]
console.log("Cache 使用率:", (usageRatio * 100).toFixed(1) + "%")
console.log("App 线程 Eviction:", cache["pages evicted by application threads"])

// 表现：Cache 使用率 > 90%，app 线程 eviction 持续增长
// 解决：增加 cacheSizeGB 或扩容内存
```

### 3. 磁盘 I/O 瓶颈

```bash
# 系统层面
iostat -x 1 5    # 查看磁盘 I/O 利用率
# await > 10ms 或 %util > 80% → I/O 瓶颈

# MongoDB 层面
db.serverStatus().wiredTiger["block manager"]
# blocks read / blocks written 速率
```

```
磁盘 I/O 优化：
  - 使用 NVMe SSD 替换 HDD 或 SATA SSD
  - 增大 WiredTiger Cache（减少磁盘 I/O）
  - Journal 和数据文件分别挂载独立磁盘
  - 关闭透明大页（THP）
```

### 4. 锁竞争

```js
// 查看锁信息
db.serverStatus().locks
db.serverStatus().globalLock

// 关键指标
{
  globalLock: {
    currentQueue: {
      total: 15,      // 等待锁的操作数（> 5 告警）
      readers: 10,
      writers: 5
    },
    activeClients: {
      total: 20
    }
  }
}

// 锁等待高的原因：
// - 长事务持锁（检查多文档事务）
// - 大量写操作竞争同一文档
// - 低效索引导致长时间持有读锁
```

---

## 诊断工具

### mongostat（实时监控）

```bash
# 每秒输出一次统计
mongostat --host localhost:27017 -u admin -p password --authenticationDatabase admin

# 关键列说明
# insert/query/update/delete：每秒操作次数
# getmore：游标操作
# command：命令数
# dirty：WiredTiger 脏页比例（> 20% 告警）
# used：Cache 使用率（> 90% 告警）
# conn：当前连接数
# set：副本集名称
# repl：节点角色（PRI/SEC/ARB）
```

### mongotop（热表监控）

```bash
# 每 5 秒输出各集合的读写耗时
mongotop 5 --host localhost:27017 -u admin -p password --authenticationDatabase admin

# 输出：
# ns                    total    read    write
# ecommerce.orders      500ms   200ms   300ms  ← 热点集合
# ecommerce.users        50ms    40ms    10ms
```

---

## 调优方法论总结

```
1. 发现问题：
   mongostat/mongotop 实时监控 → 发现异常指标

2. 定位慢操作：
   system.profile + currentOp → 找出具体慢查询

3. 分析根因：
   explain("executionStats") → COLLSCAN/SORT/大扫描比

4. 针对性修复：
   - COLLSCAN → 建立合适索引
   - SORT → 将排序字段加入索引
   - Cache 不足 → 增加 cacheSizeGB
   - 磁盘 I/O 高 → 换 SSD 或增大 Cache

5. 验证效果：
   监控指标恢复正常
```

---

## 总结

- Profiler Level 1 是生产环境的标准配置，阈值 100ms
- `currentOp` 实时发现并终止长时间运行的操作
- 四大瓶颈：CPU（全扫描）、内存（Cache 不足）、I/O（磁盘慢）、锁竞争
- mongostat/mongotop 是日常运维监控的基础工具

**下一步**：内存、磁盘与连接池调优。

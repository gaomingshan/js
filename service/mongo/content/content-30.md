# 关键监控指标与告警体系

## 概述

完善的监控体系是 MongoDB 稳定运行的保障。本章梳理关键监控指标、`serverStatus` 核心字段、Prometheus 监控方案和告警阈值参考。

---

## 关键指标分类

### 1. 操作计数器（opcounters）

```js
const op = db.serverStatus().opcounters
printjson(op)
// 输出：
// { insert: 1000, query: 5000, update: 800, delete: 200, getmore: 50, command: 3000 }
// 这是累计值，需要计算每秒增量（QPS）

// 实践：通过 mongostat 直接看实时 QPS
mongostat --host localhost:27017
```

**告警规则**：
- `update` 或 `delete` QPS 异常飙升 → 可能误操作或攻击
- 所有指标骤降至 0 → 服务可能宕机

### 2. WiredTiger 指标

```js
const wt = db.serverStatus().wiredTiger

// Cache 相关
const cache = wt.cache
const cacheUsed  = cache["bytes currently in the cache"]
const cacheMax   = cache["maximum bytes configured"]
const dirtyBytes = cache["tracked dirty bytes in the cache"]
const appEvict   = cache["pages evicted by application threads"]

console.log({
  cacheUsageRatio: (cacheUsed / cacheMax * 100).toFixed(1) + "%",
  dirtyRatio: (dirtyBytes / cacheMax * 100).toFixed(1) + "%",
  appEvictions: appEvict  // 应为 0！
})
```

| 指标 | 正常 | 告警 | 严重 |
|------|------|------|------|
| Cache 使用率 | < 75% | 75~90% | > 90% |
| 脏页比例 | < 10% | 10~20% | > 20% |
| App 线程 Eviction | 0 | 有增长 | 持续增长 |

### 3. 锁指标

```js
const globalLock = db.serverStatus().globalLock
printjson({
  currentQueueTotal:   globalLock.currentQueue.total,
  currentQueueReaders: globalLock.currentQueue.readers,
  currentQueueWriters: globalLock.currentQueue.writers
})

// currentQueue.total > 5 → 告警：存在锁等待积压
// currentQueue.total > 20 → 严重：锁竞争严重
```

### 4. 复制指标

```js
// 复制延迟（在 Primary 上执行）
rs.printSecondaryReplicationInfo()
// "X secs behind the primary" → X > 60 告警，X > 300 严重

// Oplog 窗口
rs.printReplicationInfo()
// log length start to end: X secs → X < 14400(4h) 告警

// 程序化获取延迟
const status = rs.status()
status.members.filter(m => m.stateStr === "SECONDARY").forEach(m => {
  const lagSecs = (new Date() - m.optimeDate) / 1000
  print(m.name, "lag:", lagSecs, "secs")
})
```

### 5. 连接指标

```js
const conn = db.serverStatus().connections
printjson({
  current:   conn.current,
  available: conn.available,
  usageRatio: (conn.current / (conn.current + conn.available) * 100).toFixed(1) + "%"
})

// usageRatio > 80% → 告警：连接池接近上限
// available < 100  → 严重：连接耗尽风险
```

---

## serverStatus 核心字段速查

```js
// 获取完整 serverStatus
const s = db.serverStatus()

// 常用字段路径
s.uptime                          // 启动时长（秒）
s.opcounters                      // 操作计数器
s.opcountersRepl                  // 副本集复制操作计数
s.connections                     // 连接数
s.globalLock.currentQueue         // 锁等待队列
s.wiredTiger.cache                // Cache 状态
s.wiredTiger.transaction          // 事务统计
s.wiredTiger["block manager"]     // 磁盘 I/O 统计
s.repl                            // 副本集信息
s.mem                             // 内存使用（MB）
s.network                         // 网络 I/O
s.metrics.cursor                  // 游标统计
```

---

## Prometheus + Grafana 监控方案

### 部署 mongodb_exporter

```bash
# 使用 Percona mongodb_exporter
docker run -d \
  --name mongodb-exporter \
  -p 9216:9216 \
  -e MONGODB_URI="mongodb://monitor_user:pass@localhost:27017" \
  percona/mongodb_exporter:0.40 \
  --mongodb.global-conn-pool
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']
    scrape_interval: 15s
```

### 核心 Prometheus 指标

```
# 操作 QPS
rate(mongodb_op_counters_total[5m])

# 连接数
mongodb_connections{state="current"}

# Cache 使用率
mongodb_wiredtiger_cache_bytes{type="currently_in_cache"} /
mongodb_wiredtiger_cache_bytes{type="maximum_bytes_configured"}

# 复制延迟
mongodb_rs_members_optimeDate{state="SECONDARY"} - on() group_left
mongodb_rs_members_optimeDate{state="PRIMARY"}

# 慢查询数
rate(mongodb_mongod_metrics_operation_total{type="scanAndOrder"}[5m])
```

### Grafana Dashboard

```
推荐 Dashboard ID：
  - 2583：MongoDB Overview（经典）
  - 7353：MongoDB Monitoring（Percona）

导入方式：
  Grafana → Dashboards → Import → 输入 Dashboard ID
```

---

## 告警阈值参考

| 指标 | 告警阈值 | 严重阈值 | 处理动作 |
|------|----------|----------|----------|
| Cache 使用率 | > 80% | > 90% | 扩大 cacheSizeGB |
| 脏页比例 | > 15% | > 25% | 检查磁盘 I/O |
| App 线程 Eviction | > 0 | 持续增长 | 紧急扩容内存 |
| 复制延迟 | > 60s | > 300s | 检查 Secondary 负载 |
| Oplog 窗口 | < 4h | < 1h | 扩大 oplogSizeMB |
| 连接使用率 | > 75% | > 90% | 扩大 maxPoolSize |
| 锁等待队列 | > 5 | > 20 | 查 currentOp 终止慢操作 |
| 慢查询数/分钟 | > 100 | > 500 | 分析 Profiler，优化索引 |

---

## 健康检查脚本

```js
// 综合健康检查（可定期执行）
function mongoHealthCheck() {
  const s = db.serverStatus()
  const cache = s.wiredTiger.cache
  const conn = s.connections
  const queue = s.globalLock.currentQueue

  const report = {
    cacheUsage:  (cache["bytes currently in the cache"] / cache["maximum bytes configured"] * 100).toFixed(1) + "%",
    appEvictions: cache["pages evicted by application threads"],
    connUsage:   (conn.current / (conn.current + conn.available) * 100).toFixed(1) + "%",
    lockQueue:   queue.total,
    uptime:      Math.floor(s.uptime / 3600) + "h"
  }

  // 副本集延迟
  if (rs.status) {
    const members = rs.status().members
    const primary = members.find(m => m.stateStr === "PRIMARY")
    const secondaries = members.filter(m => m.stateStr === "SECONDARY")
    report.replicationLag = secondaries.map(s => ({
      host: s.name,
      lagSecs: Math.floor((primary.optimeDate - s.optimeDate) / 1000)
    }))
  }

  printjson(report)
}

mongoHealthCheck()
```

---

## 总结

- 监控五大维度：操作 QPS、WiredTiger Cache、锁、复制延迟、连接数
- `serverStatus()` 是所有指标的数据源
- Prometheus + mongodb_exporter + Grafana 是生产标准监控方案
- 建立完善的告警规则，提前发现风险而不是故障后被动响应

**下一步**：备份恢复与容量规划。

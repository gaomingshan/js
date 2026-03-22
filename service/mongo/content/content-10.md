# 写入路径详解

## 概述

理解 MongoDB 的写入路径，是进行性能调优和故障排查的基础。数据从客户端到持久化磁盘，经历多个层次，每一层都有性能与安全的权衡。

---

## 完整写入路径

```
客户端 (Driver)
  ↓ 写请求（TCP）
mongod 网络层 → 命令解析 → 文档级锁（MVCC）
  ↓
WiredTiger Cache（内存，极快）
  ↓ 同步追加
Journal（WAL 顺序写，快）
  ↓ 返回确认（根据 Write Concern）
客户端收到确认
  ↓ 后台异步
Checkpoint（每 60s 将 Cache 刷入 .wt 数据文件）
```

**关键**：
- `j:false`（默认）：写入 Cache 即返回，Journal 异步刷盘
- `j:true`：等 Journal 刷盘后返回，崩溃安全
- Checkpoint：数据真正持久化到数据文件

---

## Journal 机制

```yaml
# mongod.conf
storage:
  journal:
    enabled: true
    commitIntervalMs: 100  # 默认每 100ms 刷盘
```

**崩溃恢复流程**：
```
mongod 重启
  → 读取最新 Checkpoint
  → 重放 Checkpoint 后的 Journal
  → 数据恢复完成
```

---

## Checkpoint 机制

```
触发条件：
  ├── 定时（默认 60 秒）
  ├── Journal 超过 2GB
  └── 手动：db.adminCommand({ fsync: 1 })

过程：
  1. 脏页写入 .wt 数据文件
  2. 更新文件头（记录 Checkpoint 位置）
  3. 旧 Journal 可安全删除
```

---

## Write Concern 对照

```js
// w:0 - 不等确认（日志/统计场景）
db.logs.insertOne(doc, { writeConcern: { w: 0 } })

// w:1, j:false（默认，Cache 写入即确认）
db.events.insertOne(doc)

// w:1, j:true（Journal 刷盘后确认）
db.users.insertOne(doc, { writeConcern: { w: 1, j: true } })

// w:"majority", j:true（生产推荐，多数节点确认）
db.orders.insertOne(doc, { writeConcern: { w: "majority", j: true } })
```

| Write Concern | 性能 | 安全性 | 适用场景 |
|---------------|------|--------|----------|
| `{w:0}` | 最高 | 最低 | 日志统计 |
| `{w:1,j:false}` | 高 | 低 | 非关键数据 |
| `{w:1,j:true}` | 中 | 中 | 单节点安全 |
| `{w:"majority",j:true}` | 较低 | 最高 | 订单支付 |

---

## 副本集写入路径

```
Primary
  ├── 写入本地 Cache + Journal
  └── 写入 Oplog（固定集合，记录所有写操作）
              ↓ 异步复制
         Secondary 拉取 Oplog → 重放 → 同步数据

若 w:"majority"：
  Primary 等待多数 Secondary 确认后才返回客户端
```

---

## 易错点

### 1. 认为写入即持久化

```
默认（j:false）：写入 Cache 后返回
若 mongod 在 Checkpoint 前崩溃 → 数据丢失
生产关键数据必须使用 j:true
```

### 2. Checkpoint 影响写入延迟

```bash
# 监控 Checkpoint 耗时
db.serverStatus().wiredTiger.transaction
# 关注：transaction checkpoint total time (msecs)
# 若耗时过长 → 检查磁盘 I/O，考虑使用 SSD
```

### 3. Journal 目录与数据目录同盘

```
❌ 错误：Journal 和数据文件在同一块磁盘
   磁盘故障时数据和日志同时丢失

✅ 最佳：Journal 和数据文件分别挂载独立磁盘
   storage.dbPath → 数据 SSD
   storage.journal → 日志 SSD（低延迟）
```

---

## 写入性能优化建议

```
1. 批量写入：使用 insertMany() 或 bulkWrite() 替代循环 insertOne()
2. 有序写入关闭：{ ordered: false } 允许并行写入，提升吞吐
3. Write Concern 按业务分级：日志用 w:0，订单用 w:majority
4. 磁盘选型：Journal 所在磁盘使用 NVMe SSD
5. 避免大文档：单文档超过 100KB 需考虑拆分
```

---

## 总结

- 写入路径：Cache → Journal → Checkpoint，三层保障
- Journal 是崩溃恢复的核心，生产必须开启
- Write Concern 决定写入的可靠性级别，按业务场景选择
- Checkpoint 每 60 秒触发，期间 I/O 增加需关注

**下一步**：Write Concern / Read Concern / Read Preference 深入解析。

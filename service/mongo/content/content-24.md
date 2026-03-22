# Oplog 同步与复制延迟分析

## 概述

Oplog（Operations Log）是副本集数据同步的核心机制。理解 Oplog 的工作原理，是诊断复制延迟、保障数据一致性的基础。

---

## Oplog 的工作原理

### Oplog 是什么

```
Oplog 是 local.oplog.rs 集合，一个固定大小的循环队列
  - Primary 将每次写操作转化为 Oplog 条目
  - Secondary 持续拉取 Primary 的 Oplog 并重放
  - Oplog 是幂等的：重放多次结果相同
```

### Oplog 条目结构

```js
// 查看 Oplog
use local
db.oplog.rs.find().sort({ $natural: -1 }).limit(5)

// 典型条目
{
  ts: Timestamp(1705312200, 1),  // 时间戳（秒 + 序号）
  t: NumberLong(5),              // 任期号（选举轮次）
  h: NumberLong(0),
  v: 2,
  op: "i",                       // 操作类型：i=insert, u=update, d=delete, c=command
  ns: "ecommerce.orders",        // 命名空间
  ui: UUID("..."),
  o: {                           // 操作内容
    _id: ObjectId("..."),
    orderId: "ORD001",
    amount: 299
  }
}

// op 类型说明
// "i" → insert
// "u" → update
// "d" → delete
// "c" → command（createCollection, createIndex 等）
// "n" → no-op（心跳）
```

### Oplog 的幂等性

```
原始操作：$inc: { qty: -1 }（qty 从 100 减到 99）
Oplog 存储：$set: { qty: 99 }（绝对值，幂等）

无论重放多少次，qty 都等于 99
```

---

## Oplog 窗口（Oplog Window）

```
Oplog 是固定大小集合，新条目覆盖最旧条目

Oplog 窗口 = Oplog 能保存多长时间的操作记录

计算：
  Oplog 大小 / 每秒写入量 = 窗口时长
  10GB Oplog / 100MB/s 写入 = 约 100 秒窗口
  10GB Oplog / 1MB/s  写入 = 约 10000 秒（~2.7 小时）
```

```js
// 查看 Oplog 大小和窗口
rs.printReplicationInfo()
// 输出：
// configured oplog size: 10240 MB
// log length start to end: 86400 secs (24 hrs)
// oplog first event time:  Mon Jan 14 2024 10:00:00
// oplog last event time:   Tue Jan 15 2024 10:00:00
// now:                     Tue Jan 15 2024 10:00:00
```

### 配置 Oplog 大小

```yaml
# mongod.conf
replication:
  replSetName: rs0
  oplogSizeMB: 51200  # 50GB（高写入场景建议加大）
```

```js
// 动态修改 Oplog 大小（4.0+，无需重启）
db.adminCommand({ replSetResizeOplog: 1, size: 51200 })
```

**建议**：Oplog 窗口至少保持 **24 小时**，防止 Secondary 短暂离线后无法追赶。

---

## 复制延迟分析

### 查看复制延迟

```js
// 方法1：rs.printSecondaryReplicationInfo()
rs.printSecondaryReplicationInfo()
// 输出：
// source: mongo2:27017
// syncedTo: Tue Jan 15 2024 10:29:58
// 2 secs (0 hrs) behind the primary  ← 延迟 2 秒（正常）

// source: mongo3:27017
// syncedTo: Tue Jan 15 2024 10:00:00
// 1800 secs (0.5 hrs) behind the primary  ← 延迟 30 分钟（告警！）

// 方法2：rs.status() 中查看
rs.status().members.forEach(m => {
  if (m.stateStr === "SECONDARY") {
    print(m.name, "delay:", m.optimeDate)
  }
})
```

### 复制延迟的成因

```
1. 写入量过大
   Primary 写入速度 > Secondary 回放速度
   → 扩展 Secondary 硬件，增加回放线程

2. Secondary 磁盘 I/O 不足
   → Secondary 使用与 Primary 同等规格的 SSD

3. 大文档更新/索引构建
   → 索引构建期间 Secondary Oplog 回放变慢

4. 网络带宽不足
   → 优化 Oplog 传输（压缩）

5. Secondary 执行了高负载查询（读分离场景）
   → 将分析查询与复制流量分离
```

---

## 初始同步（Initial Sync）

新节点加入副本集时，需要先完成初始同步：

```
初始同步流程：
  1. 克隆同步源的所有数据（全量复制）
  2. 记录克隆期间的 Oplog 起始点
  3. 应用克隆期间产生的 Oplog（增量追赶）
  4. 进入正常复制状态
```

```js
// 监控初始同步进度
db.adminCommand({ replSetGetStatus: 1 }).members
// 状态：STARTUP2（正在初始同步）

// 强制指定同步源
rs.syncFrom("mongo1:27017")
```

**注意**：初始同步期间 Oplog 窗口若被填满，初始同步失败需重新开始。高写入场景下，初始同步前应扩大 Oplog。

---

## Oplog 与 Change Streams 的关系

```
Change Streams 基于 Oplog 实现：
  应用订阅 Change Streams
    → MongoDB 监听 Oplog 变化
    → 过滤并转换为变更事件
    → 推送给应用

Resume Token 本质是 Oplog 中的时间戳位置
  → 断线重连后从 Resume Token 处继续读取
  → 要求 Resume Token 对应的 Oplog 条目仍在窗口内
```

---

## 调优建议

```
1. Oplog 大小：
   生产环境建议 10~50GB，高写入场景 100GB+
   公式：峰值写入速率(MB/s) × 期望窗口(s) × 2（安全系数）

2. 回放并发：
   MongoDB 4.0+ 支持并发 Oplog 回放
   可通过 replWriterThreadCount 调整（默认 16）

3. 监控告警：
   复制延迟 > 60s → 告警
   Oplog 窗口 < 4h  → 告警（扩大 Oplog）

4. 禁止在 Secondary 上执行大查询：
   大查询占用 Secondary I/O，导致复制延迟
   分析类查询应路由到专用的 Hidden 节点
```

---

## 总结

- Oplog 是固定大小循环队列，Secondary 通过拉取 Oplog 保持数据同步
- Oplog 条目是幂等的，保证重放安全
- Oplog 窗口至少保持 24 小时，防止节点短暂离线后无法追赶
- 复制延迟主要原因：写入量大、磁盘慢、大查询占用 Secondary
- Change Streams 基于 Oplog 实现，Resume Token 依赖 Oplog 窗口

**下一步**：分片集群架构详解。

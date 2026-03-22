# WiredTiger 缓存与压缩机制

## 概述

WiredTiger Cache 是 MongoDB 性能的核心，直接决定读写速度。压缩算法则决定磁盘占用与 CPU 开销的平衡。理解这两个机制，是内存调优的基础。

---

## WiredTiger Cache 架构

```
数据访问路径（速度从快到慢）：

1. WiredTiger Cache（内存，B-Tree 页，解压状态）    ← 最快
2. 文件系统缓存（OS Page Cache，压缩状态）
3. 磁盘 I/O（.wt 数据文件）                        ← 最慢
```

### Cache 大小默认值

```
cacheSizeGB = max(0.5 × (RAM - 1GB), 256MB)

示例：
  32GB 内存 → Cache = max(0.5 × 31, 0.25) = 15.5GB
  8GB  内存 → Cache = max(0.5 × 7, 0.25)  = 3.5GB
```

### 手动配置

```yaml
# mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 8  # 显式设置
```

**配置建议**：
- 专用 MongoDB 服务器：`(总内存 - 2GB) × 0.6`
- 与其他进程共享：`总内存 × 0.3 ~ 0.4`
- 容器环境：必须显式设置，否则按宿主机总内存计算

---

## 页（Page）生命周期

```
磁盘读取（Page Fault）
        ↓
  Clean Page（干净页）
  内存中与磁盘一致
        ↓ 写操作
  Dirty Page（脏页）
  内存中已修改，未写磁盘
        ↓ Cache 压力 / Checkpoint
  Eviction（淘汰）
  ├── Clean Page → 直接丢弃
  └── Dirty Page → 先写磁盘，再丢弃
```

### Eviction 策略

```
触发条件（Cache 使用率阈值）：
  eviction_target    = 80%  → 后台线程开始淘汰
  eviction_trigger   = 95%  → 应用线程被迫参与淘汰（严重告警！）
  dirty_target       = 5%   → 脏页比例目标
  dirty_trigger      = 20%  → 脏页比例超此值触发积极淘汰
```

⚠️ **关键信号**：若 `pages evicted by application threads` 持续增长，说明 Cache 严重不足，写入性能将急剧下降（应用线程被迫做 Cache 管理工作）。

---

## 内存压力诊断

```js
// 查看 Cache 状态
const wt = db.serverStatus().wiredTiger.cache

console.log({
  cacheUsedGB:    (wt["bytes currently in the cache"] / 1e9).toFixed(2),
  cacheMaxGB:     (wt["maximum bytes configured"] / 1e9).toFixed(2),
  usageRatio:     (wt["bytes currently in the cache"] / wt["maximum bytes configured"] * 100).toFixed(1) + "%",
  dirtyBytes:     (wt["tracked dirty bytes in the cache"] / 1e9).toFixed(2),
  appEvictions:   wt["pages evicted by application threads"],  // 关键指标！
  pagesReadIntoCache: wt["pages read into cache"]
})
```

**诊断标准**：

| 指标 | 正常 | 告警 |
|------|------|------|
| Cache 使用率 | < 80% | > 90% |
| 脏页比例 | < 10% | > 20% |
| App 线程 Eviction | 0 或极少 | 持续增长 |

---

## 压缩算法

### 算法对比

| 算法 | 压缩率 | 速度 | CPU 开销 | 推荐场景 |
|------|--------|------|----------|----------|
| **none** | 无 | 最快 | 无 | 极低延迟，磁盘充足 |
| **Snappy**（默认）| 中（2~3x）| 快 | 低 | 通用场景 |
| **Zlib** | 高（3~5x）| 慢 | 中 | 磁盘紧张，CPU 充裕 |
| **Zstd**（4.2+）| 高（3~5x）| 中 | 低 | **推荐**，压缩率接近 Zlib，速度接近 Snappy |

### 配置压缩

```yaml
storage:
  wiredTiger:
    collectionConfig:
      blockCompressor: zstd      # 集合数据压缩（推荐）
    indexConfig:
      prefixCompression: true    # 索引前缀压缩（默认开启，节省 40%+ 索引空间）
    engineConfig:
      journalCompressor: snappy  # Journal 压缩
```

### 修改现有集合的压缩算法

```js
// 需要重建集合（无法原地修改）
// 方法：导出 → 删除 → 重建（新压缩算法）→ 导入
// 或使用 mongodump/mongorestore

// 验证集合压缩设置
db.orders.stats().wiredTiger.creationString
// 输出包含：block_compressor=zstd
```

---

## 索引前缀压缩

```
普通存储（无前缀压缩）：
  "user:00001" → pointer
  "user:00002" → pointer
  "user:00003" → pointer

前缀压缩（共享前缀）：
  "user:" + "00001" → pointer
            "00002" → pointer
            "00003" → pointer

节省空间：40%~60%（对于字符串键）
```

---

## 内存规划实战

```
服务器：128GB RAM，专用 MongoDB

规划：
  WiredTiger Cache：50GB（~40%）
  文件系统缓存：~65GB（OS 自动使用剩余）
  MongoDB 工作内存（排序、连接池）：~8GB
  OS 及其他：5GB

配置：
  cacheSizeGB: 50

注：文件系统缓存也有效，热数据可能在 OS Cache 命中
    总有效缓存 ≈ WiredTiger Cache + OS Page Cache
```

---

## 易错点

```
❌ 将 cacheSizeGB 设置为 RAM 的 80%+
   → 导致 OS 无内存可用，频繁 Swap，性能急剧下降

❌ 容器环境不设置 cacheSizeGB
   → WiredTiger 按宿主机总内存计算，超出容器内存限制触发 OOM

❌ 频繁执行大型聚合占满 Cache
   → 使用 allowDiskUse:true 让聚合溢出到磁盘
   db.orders.aggregate(pipeline, { allowDiskUse: true })
```

---

## 总结

- WiredTiger Cache 是性能核心，合理配置是调优第一步
- 监控 `pages evicted by application threads`，为零最佳
- 压缩算法推荐 **Zstd**（4.2+），兼顾压缩率和速度
- 容器环境必须显式设置 `cacheSizeGB`
- 预留足够内存给 OS Page Cache，双层缓存提升命中率

**下一步**：批量写入、幂等设计与特殊集合。

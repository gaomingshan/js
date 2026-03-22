# 存储引擎概览：WiredTiger

## 概述

WiredTiger 是 MongoDB 3.2 起的默认存储引擎，也是目前唯一官方支持的存储引擎。它提供文档级并发控制、压缩存储、崩溃安全写入等核心能力，直接决定了 MongoDB 的读写性能与数据安全性。

理解 WiredTiger，是进行 MongoDB 性能调优的基础。

---

## WiredTiger 架构

```
应用层
  ↓ 写请求
mongod 进程
  ↓
WiredTiger 存储引擎
  ├── 内存层（Cache）
  │     ├── WiredTiger Cache（默认 50% RAM - 1GB）
  │     └── 文件系统缓存（OS Page Cache）
  ├── Journal（WAL 日志）
  │     └── journal/ 目录（默认每 100ms 刷盘）
  └── 数据文件（.wt 文件）
        └── collection-*.wt / index-*.wt
```

---

## B-Tree 存储结构与页（Page）机制

WiredTiger 使用 **B-Tree** 作为核心数据结构，数据按键（`_id` 或索引键）有序组织。

### 页的类型

```
B-Tree
  ├── Root Page（根页）
  ├── Internal Page（内部页，存储路由键）
  └── Leaf Page（叶子页，存储实际数据）
```

### 页的生命周期

```
磁盘（.wt 文件）
    ↓ 读取（Page Fault）
WiredTiger Cache（内存）
    ├── Clean Page（干净页，与磁盘一致）
    ├── Dirty Page（脏页，内存已修改，未刷盘）
    └── Eviction（淘汰）
          ├── Clean Page → 直接淘汰
          └── Dirty Page → 先写入磁盘，再淘汰
```

**关键参数**：
- `dirty_trigger`：脏页占比超过此值触发后台 Eviction（默认 20%）
- `dirty_target`：后台 Eviction 目标脏页比例（默认 5%）
- `eviction_trigger`：Cache 总使用率超过此值触发强制 Eviction（默认 95%）

---

## 多版本并发控制（MVCC）

WiredTiger 使用 **MVCC（Multi-Version Concurrency Control）** 实现文档级并发，读写操作互不阻塞。

### 工作原理

```
时间轴：
  T1: 读事务开始，看到版本 V1
  T2: 写事务修改文档，创建版本 V2
  T3: 读事务仍然读取 V1（快照隔离）
  T4: 读事务结束，V1 可以被回收
```

**优势**：
- 读操作不阻塞写操作
- 写操作不阻塞读操作
- 支持快照级别的一致性读（Read Concern `snapshot`）

**代价**：
- 需要维护多个版本，增加内存和磁盘开销
- 长事务会阻止旧版本回收，导致 Cache 膨胀

---

## 缓存机制

### WiredTiger Cache vs 文件系统缓存

```
数据访问路径：
  查询 → WiredTiger Cache？
             ├── 命中 → 直接返回（最快）
             └── 未命中 → 文件系统缓存？
                            ├── 命中 → 加载到 WiredTiger Cache
                            └── 未命中 → 磁盘 I/O（最慢）
```

| 缓存层 | 管理者 | 存储内容 | 大小控制 |
|--------|--------|----------|----------|
| WiredTiger Cache | WiredTiger | 解压后的 B-Tree 页 | `cacheSizeGB` 配置 |
| 文件系统缓存 | 操作系统 | 压缩后的原始文件块 | 剩余内存自动使用 |

### Cache 大小配置

```yaml
# mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 8  # 默认：max(0.5 * (RAM - 1GB), 256MB)
```

**配置建议**：
- 专用 MongoDB 服务器：`cacheSizeGB = (总内存 - 2GB) × 0.6`
- 与其他进程共享：`cacheSizeGB = (总内存 × 0.4)`
- 预留内存给文件系统缓存（OS Page Cache）

### 内存压力诊断

```js
// 查看 WiredTiger Cache 状态
db.serverStatus().wiredTiger.cache

// 关键指标
{
  "bytes currently in the cache": 4294967296,       // 当前 Cache 使用量
  "maximum bytes configured": 8589934592,            // Cache 上限
  "bytes dirty in the cache cumulative": 536870912,  // 脏数据量
  "pages evicted by application threads": 1024,      // 应用线程被迫 Evict（危险信号！）
  "unmodified pages evicted": 50000,                 // 正常淘汰
  "modified pages evicted": 1000                     // 脏页淘汰
}
```

⚠️ **警告信号**：`pages evicted by application threads` 持续增长，说明 Cache 严重不足，读写请求被迫参与 Eviction，性能急剧下降。

---

## 压缩算法

WiredTiger 对数据文件和 Journal 分别支持多种压缩算法。

| 算法 | 压缩率 | CPU 开销 | 适用场景 |
|------|--------|----------|----------|
| **Snappy**（默认）| 中 | 低 | 通用场景，平衡性能与空间 |
| **Zlib** | 高 | 中 | 磁盘空间紧张，CPU 充裕 |
| **Zstd**（4.2+）| 很高 | 低-中 | 推荐替代 Zlib，压缩率更高，速度更快 |
| **none** | 无 | 无 | 对延迟极敏感，磁盘充足 |

```yaml
# 配置压缩算法
storage:
  wiredTiger:
    collectionConfig:
      blockCompressor: zstd      # 集合数据压缩
    indexConfig:
      prefixCompression: true    # 索引前缀压缩（默认开启）
```

**实际效果**（典型 JSON 数据）：
- Snappy：压缩比约 2:1 ~ 3:1
- Zstd：压缩比约 3:1 ~ 5:1

---

## Journal 与崩溃恢复

### Journal 的作用

Journal 是 WiredTiger 的 **WAL（Write-Ahead Log）**，保证崩溃后数据可恢复。

```
写入流程：
1. 写入 WiredTiger Cache（内存，极快）
2. 写入 Journal 文件（磁盘，可配置同步策略）
3. 确认写入成功（根据 Write Concern 决定）
4. 后台 Checkpoint（每 60 秒将 Cache 刷到数据文件）
```

### Journal 同步策略

```yaml
storage:
  journal:
    enabled: true
    commitIntervalMs: 100  # 默认每 100ms 刷盘
```

**Write Concern 与 Journal 的关系**：
```js
// j:false（默认）：写入 Cache 即返回，Journal 异步刷盘
db.orders.insertOne(doc, { writeConcern: { w: 1, j: false } })

// j:true：等待 Journal 刷盘后才返回，保证崩溃安全
db.orders.insertOne(doc, { writeConcern: { w: 1, j: true } })
```

### 崩溃恢复流程

```
mongod 启动
  ↓
读取最新 Checkpoint（数据文件状态）
  ↓
重放 Checkpoint 之后的 Journal 记录
  ↓
数据恢复完成，接受新请求
```

**关键原理**：Journal 确保从 Checkpoint 到崩溃时刻之间的所有写入都能恢复，Checkpoint 之前的 Journal 可以安全删除。

---

## Checkpoint 机制

```
Checkpoint 触发条件：
  ├── 定时触发（默认每 60 秒）
  ├── Journal 文件大小超过 2GB
  └── 手动触发：db.fsync() 或 db.adminCommand({fsync:1})

Checkpoint 过程：
  1. 将所有脏页（Dirty Pages）写入数据文件（.wt）
  2. 更新数据文件头（记录 Checkpoint 位置）
  3. 旧 Checkpoint 之前的 Journal 可以删除
```

**性能影响**：
- Checkpoint 期间 I/O 增加，可能造成写入抖动
- 脏数据比例高时 Checkpoint 耗时更长
- 建议使用 SSD 以减少 Checkpoint 的 I/O 延迟

---

## WiredTiger vs MMAPv1（历史对比）

| 特性 | WiredTiger | MMAPv1（已废弃）|
|------|------------|----------------|
| 并发控制 | 文档级锁（MVCC）| 集合级锁 |
| 压缩 | 支持（Snappy/Zlib/Zstd）| 不支持 |
| 内存管理 | 自管理 Cache | 依赖 OS mmap |
| 崩溃恢复 | Journal（WAL）| Journal |
| 性能 | 显著更好 | 较差（写锁粒度大）|
| 状态 | 默认，持续演进 | MongoDB 4.2 移除 |

**结论**：MMAPv1 已于 MongoDB 4.2 正式移除，所有版本均使用 WiredTiger。

---

## 企业级最佳实践

### 生产环境配置建议

```yaml
storage:
  dbPath: /data/mongodb
  journal:
    enabled: true
    commitIntervalMs: 100
  wiredTiger:
    engineConfig:
      cacheSizeGB: 16          # 根据实际内存调整
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: zstd    # 推荐 zstd
    indexConfig:
      prefixCompression: true
```

### 内存规划原则

```
服务器总内存：64GB
  WiredTiger Cache：24GB（约 40%）
  文件系统缓存：~30GB（OS 自动管理剩余内存）
  MongoDB 运行内存：~5GB（连接池、排序缓冲等）
  系统保留：5GB
```

### 监控关键指标

```js
db.serverStatus().wiredTiger

// 重点关注：
// cache.bytes currently in the cache / maximum bytes configured（Cache 使用率）
// cache.bytes dirty in the 
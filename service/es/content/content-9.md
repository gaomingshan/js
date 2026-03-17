# Translog 与数据持久化

## 概述

Translog（Transaction Log，事务日志）是 Elasticsearch 保证数据不丢失的核心机制。理解 Translog 的工作原理、刷盘策略和与 Lucene 段的协作关系，是掌握 ES 数据持久化的关键。

## Translog 的作用

### 为什么需要 Translog？

**问题场景**：

```
1. 文档写入内存缓冲（Memory Buffer）
2. 还未刷盘（写入磁盘段）
3. 节点突然崩溃（断电、OOM、进程 kill）
→ 内存中的数据全部丢失
```

**Translog 解决方案**：

```
写入流程：
  1. 文档写入内存缓冲
  2. 同时写入 Translog（磁盘）
  3. 节点崩溃后，从 Translog 恢复未持久化的数据
```

### Translog 的核心功能

1. **数据持久化保证**：确保已确认的写入不会因节点崩溃而丢失
2. **故障恢复**：节点重启时，从 Translog 重放未提交的操作
3. **实时性支持**：Get API 可直接从 Translog 读取最新数据

## 写入流程详解

### 完整的写入与持久化流程

```
客户端写入请求
  ↓
写入内存缓冲（Lucene In-Memory Buffer）
  ↓
同时写入 Translog（磁盘 or OS Cache）
  ↓
返回客户端（写入成功）
  ↓ （每 1 秒，默认）
Refresh：内存缓冲 → 新的 Segment（OS Cache）
  ↓
文档可搜索（Segment 在文件系统缓存中）
  ↓ （每 30 分钟 or Translog 达到 512MB，默认）
Flush：Segment → 磁盘持久化 + 清空 Translog
  ↓
数据完全持久化
```

### 三个关键阶段

#### 1. 写入阶段（Write）

```
文档 → 内存缓冲 + Translog

特点：
  - 数据在内存中，速度快
  - 尚未可搜索
  - 已写入 Translog，保证不丢失
```

#### 2. 刷新阶段（Refresh）

```
内存缓冲 → Segment（文件系统缓存）

特点：
  - 生成新的 Lucene Segment
  - Segment 在 OS Cache 中（尚未 fsync 到磁盘）
  - 文档变为可搜索
  - Translog 保留（未清空）
```

**Refresh 间隔**：

```bash
# 默认 1 秒
GET /products/_settings

{
  "products": {
    "settings": {
      "index": {
        "refresh_interval": "1s"
      }
    }
  }
}

# 修改 Refresh 间隔
PUT /products/_settings
{
  "refresh_interval": "30s"
}

# 禁用自动 Refresh
PUT /products/_settings
{
  "refresh_interval": "-1"
}

# 手动 Refresh
POST /products/_refresh
```

**Near Real-Time 原因**：默认 1 秒刷新间隔，文档写入后最多 1 秒可搜索。

#### 3. 刷盘阶段（Flush）

```
Segment（OS Cache）→ fsync 到磁盘
清空 Translog
创建新的 Translog

特点：
  - Segment 完全持久化到磁盘
  - Translog 被清空（生成新的 Translog）
  - 创建 Commit Point
```

**Flush 触发条件**：

1. **Translog 大小达到阈值**（默认 512MB）

```bash
PUT /products/_settings
{
  "index.translog.flush_threshold_size": "512mb"
}
```

2. **定期自动 Flush**（默认 30 分钟）

```bash
PUT /products/_settings
{
  "index.translog.sync_interval": "30s"
}
```

3. **手动触发 Flush**

```bash
POST /products/_flush
```

4. **索引关闭时**

```bash
POST /products/_close
```

## Translog 的结构

### Translog 文件

```
索引分片目录/
  ├── translog/
  │     ├── translog-1.tlog      # 当前活跃的 Translog
  │     ├── translog-1.ckp       # Checkpoint 文件
  │     ├── translog-2.tlog      # 旧的 Translog（未清空）
  │     └── translog-2.ckp
```

**文件说明**：
- **`.tlog`**：事务日志文件，存储操作记录
- **`.ckp`**：Checkpoint 文件，记录 Translog 的元数据

### Translog 记录的内容

每个操作记录包含：

```
- 操作类型（index、delete、update）
- 文档 ID
- 文档内容（index、update）
- 序列号（Sequence Number）
- Primary Term
```

### Checkpoint 机制

**Checkpoint 文件记录**：

```
- 当前 Translog 的代数（Generation）
- 全局 Checkpoint（已持久化的序列号）
- 本地 Checkpoint（已写入的最大序列号）
```

**作用**：
- 故障恢复时，确定从哪里开始重放 Translog
- 避免重复应用已持久化的操作

## Translog 的刷盘策略

### 刷盘策略类型

#### 1. 同步刷盘（request）

**默认策略**，每次写入操作后立即 fsync Translog 到磁盘。

```bash
PUT /products/_settings
{
  "index.translog.durability": "request"
}
```

**特点**：
- **优点**：数据安全性最高，即使节点崩溃也不会丢失数据
- **缺点**：性能较低（每次写入都 fsync）
- **适用场景**：金融、订单等关键数据

#### 2. 异步刷盘（async）

**每 5 秒（默认）fsync 一次 Translog**。

```bash
PUT /products/_settings
{
  "index.translog.durability": "async",
  "index.translog.sync_interval": "5s"
}
```

**特点**：
- **优点**：性能高（减少 fsync 次数）
- **缺点**：节点崩溃可能丢失最近 5 秒的数据
- **适用场景**：日志、监控数据等可容忍少量丢失的场景

### 性能 vs 安全性权衡

| 策略 | 数据丢失风险 | 写入性能 | 适用场景 |
|------|-------------|---------|---------|
| **request（同步）** | 无 | 低 | 金融、订单、用户数据 |
| **async（异步）** | 最多 5 秒数据 | 高 | 日志、指标、非关键数据 |

**生产建议**：
- 默认使用 `request`（安全优先）
- 高吞吐日志场景可使用 `async`
- 根据业务重要性选择

## Translog 与数据恢复

### 故障恢复流程

**节点崩溃后重启**：

```
1. 节点启动，读取分片目录
2. 加载最后一个 Commit Point（segments_N 文件）
3. 打开已持久化的 Segment
4. 读取 Translog Checkpoint
5. 从 Checkpoint 位置开始重放 Translog
6. 恢复未持久化的操作
7. 分片恢复完成，变为可用状态
```

**示例**：

```
崩溃前状态：
  - 已持久化的 Segment：包含文档 1-1000
  - Translog：包含文档 1001-1200（未 Flush）
  
崩溃后恢复：
  1. 加载 Segment（文档 1-1000）
  2. 重放 Translog（文档 1001-1200）
  3. 恢复完成（文档 1-1200 全部可用）
```

### Translog 的保留策略

**问题**：Flush 后，Translog 是否立即删除？

**答案**：不是，有保留策略。

```bash
# Translog 保留时间（默认 12 小时）
PUT /products/_settings
{
  "index.translog.retention.age": "12h"
}

# Translog 保留大小（默认 512MB）
PUT /products/_settings
{
  "index.translog.retention.size": "512mb"
}
```

**保留原因**：
- 支持副本分片恢复（Peer Recovery）
- 副本分片重启时，可从主分片的 Translog 快速恢复
- 避免重新复制整个分片

**清理时机**：
- 超过保留时间
- 超过保留大小
- Merge 操作完成后

## Flush 操作详解

### 手动 Flush

```bash
# Flush 指定索引
POST /products/_flush

# Flush 所有索引
POST /_flush

# 等待所有 Flush 完成
POST /products/_flush?wait_if_ongoing=true

# 强制 Flush（即使没有新数据）
POST /products/_flush?force=true
```

### Flush 的影响

**好处**：
- 释放 Translog 占用的磁盘空间
- 减少故障恢复时间（Translog 更小）
- 生成持久化的 Segment

**成本**：
- 消耗 I/O 资源（fsync 操作）
- 短暂影响写入性能

### 自动 Flush vs 手动 Flush

**自动 Flush**（推荐）：
- ES 自动管理，无需人工干预
- 根据 Translog 大小和时间触发

**手动 Flush**（特殊场景）：
- 索引关闭前
- 节点维护前（确保数据持久化）
- 性能测试（排除 Translog 影响）

## Translog 与 Get API

### 实时读取

**Get API 可直接从 Translog 读取最新数据**，无需等待 Refresh。

```bash
# 写入文档
PUT /products/_doc/1
{
  "name": "iPhone"
}

# 立即读取（无需等待 Refresh）
GET /products/_doc/1

# 响应：成功返回文档
{
  "_id": "1",
  "_source": {
    "name": "iPhone"
  }
}
```

**原理**：
- Get API 先查询内存缓冲和 Translog
- 如果未找到，再查询 Segment

**对比**：
- **Get API**：实时读取（从 Translog）
- **Search API**：近实时读取（需等待 Refresh）

## 实战：Translog 配置优化

### 场景 1：日志写入（高吞吐）

**需求**：每秒写入 10000 条日志，可容忍少量丢失。

**优化配置**：

```bash
PUT /logs/_settings
{
  # 异步刷盘
  "index.translog.durability": "async",
  "index.translog.sync_interval": "30s",
  
  # 增大 Flush 阈值
  "index.translog.flush_threshold_size": "1gb",
  
  # 增大 Refresh 间隔
  "refresh_interval": "30s"
}
```

**效果**：
- 写入性能提升 3-5 倍
- 最多丢失 30 秒数据

### 场景 2：订单数据（高安全性）

**需求**：保证数据完全不丢失。

**配置**：

```bash
PUT /orders/_settings
{
  # 同步刷盘（默认）
  "index.translog.durability": "request",
  
  # 较小的 Flush 阈值
  "index.translog.flush_threshold_size": "256mb",
  
  # 保持默认 Refresh 间隔
  "refresh_interval": "1s"
}
```

**效果**：
- 数据安全性最高
- 写入性能略低

### 场景 3：批量导入

**需求**：一次性导入 1 亿条历史数据。

**优化配置**：

```bash
# 导入前
PUT /archive/_settings
{
  "index.translog.durability": "async",
  "index.translog.sync_interval": "120s",
  "index.translog.flush_threshold_size": "2gb",
  "refresh_interval": "-1",  # 禁用自动 Refresh
  "number_of_replicas": 0    # 临时禁用副本
}

# 批量导入数据
POST /_bulk
...

# 导入完成后
POST /archive/_refresh
POST /archive/_flush

# 恢复配置
PUT /archive/_settings
{
  "index.translog.durability": "request",
  "refresh_interval": "1s",
  "number_of_replicas": 1
}
```

## Translog 故障排查

### 问题 1：Translog 文件过大

**现象**：

```bash
# 查看 Translog 大小
GET /_cat/shards?v&h=index,shard,prirep,translog.size

index    shard prirep translog.size
products 0     p      5.2gb
```

**原因**：
- Flush 阈值过大
- Flush 失败（磁盘空间不足）

**解决方案**：

```bash
# 手动 Flush
POST /products/_flush

# 降低 Flush 阈值
PUT /products/_settings
{
  "index.translog.flush_threshold_size": "512mb"
}
```

### 问题 2：节点恢复时间过长

**现象**：节点重启后，分片恢复需要很长时间。

**原因**：Translog 过大，重放时间长。

**解决方案**：

```bash
# 定期 Flush（减少 Translog 大小）
POST /products/_flush

# 降低 Translog 保留时间
PUT /products/_settings
{
  "index.translog.retention.age": "6h",
  "index.translog.retention.size": "256mb"
}
```

### 问题 3：数据丢失

**现象**：节点崩溃后，部分数据丢失。

**原因**：使用 `async` 刷盘策略，崩溃时 Translog 未 fsync。

**解决方案**：

```bash
# 改为同步刷盘
PUT /critical_data/_settings
{
  "index.translog.durability": "request"
}
```

## Translog vs WAL（Write-Ahead Log）

**相似性**：
- 都是预写日志（Write-Ahead Log）
- 写操作先写日志，再写数据
- 用于故障恢复

**差异**：

| 特性 | Translog（ES） | WAL（MySQL、PostgreSQL） |
|------|---------------|-------------------------|
| **用途** | 保证写入持久化 + 故障恢复 | 保证事务持久化 + 故障恢复 |
| **刷盘策略** | 同步 or 异步 | 通常同步 |
| **清理时机** | Flush 后清空 | Checkpoint 后归档 |
| **实时读取** | 支持（Get API） | 不支持 |

## 监控 Translog

### 查看 Translog 信息

```bash
# 查看索引 Translog 统计
GET /products/_stats/translog

{
  "indices": {
    "products": {
      "primaries": {
        "translog": {
          "operations": 1500,           # 操作数量
          "size_in_bytes": 15728640,    # Translog 大小
          "uncommitted_operations": 50, # 未提交的操作
          "uncommitted_size_in_bytes": 524288,
          "earliest_last_modified_age": 0
        }
      }
    }
  }
}

# Cat API 查看
GET /_cat/shards?v&h=index,shard,prirep,translog.operations,translog.size
```

### 关键指标

- **translog.operations**：Translog 中的操作数量
- **translog.size_in_bytes**：Translog 占用磁盘空间
- **uncommitted_operations**：未提交到磁盘的操作数
- **uncommitted_size**：未提交的数据大小

**告警阈值建议**：
- Translog 大小 > 2GB → 警告
- Translog 大小 > 5GB → 紧急告警

## 总结

**Translog 的作用**：
- 保证数据不丢失（已确认的写入持久化到磁盘）
- 故障恢复（节点崩溃后从 Translog 重放）
- 实时读取（Get API 从 Translog 读取最新数据）

**写入与持久化流程**：
1. 写入 → 内存缓冲 + Translog
2. Refresh（1秒）→ 内存缓冲 → Segment（OS Cache）
3. Flush（30分钟 or 512MB）→ Segment → 磁盘 + 清空 Translog

**刷盘策略**：
- **request（同步）**：每次写入 fsync，安全性高，性能低
- **async（异步）**：定期 fsync，性能高，可能丢失 5 秒数据

**性能优化**：
- 日志场景：`async` + 大 Flush 阈值 + 长 Refresh 间隔
- 关键数据：`request`（默认）
- 批量导入：`async` + 禁用 Refresh + 禁用副本

**故障恢复**：
- 节点重启 → 加载 Segment → 重放 Translog → 恢复完成
- Translog 越大，恢复时间越长

**监控指标**：
- Translog 大小（避免过大）
- 未提交操作数（监控写入积压）

**下一步**：学习 Refresh、Flush、Merge 机制，深入理解 Near Real-Time 搜索的实现原理。

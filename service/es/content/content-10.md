# Refresh、Flush、Merge 机制

## 概述

Elasticsearch 的 Near Real-Time（准实时）搜索和高性能写入依赖于 Refresh、Flush、Merge 三个核心机制的协作。理解这三个机制的工作原理、触发时机和性能影响，是优化 ES 写入和查询性能的关键。

## Refresh 操作

### 什么是 Refresh？

**Refresh 将内存缓冲区的文档写入到新的 Segment（文件系统缓存），使文档变为可搜索**。

```
写入流程：
  文档写入
    ↓
  内存缓冲（Lucene In-Memory Buffer）
    ↓ Refresh（默认 1 秒）
  新 Segment（OS Cache）
    ↓
  文档可搜索
```

### Refresh 的详细过程

```
1. 内存缓冲区包含多个未提交的文档
2. Refresh 触发
3. 创建新的 Segment
   - 构建倒排索引
   - 写入文件系统缓存（OS Cache）
   - 尚未 fsync 到磁盘
4. 新 Segment 加入搜索器（Searcher）
5. 文档变为可搜索
6. 内存缓冲区清空
7. Translog 保留（未清空）
```

**重点**：
- Segment 在**文件系统缓存**中，不是磁盘
- 比直接写磁盘快得多
- 节点崩溃会丢失（但有 Translog 保证）

### 为什么是 Near Real-Time？

**Near Real-Time（准实时）**：写入后最多 1 秒可搜索。

**原因**：

```
写入时刻 T0：
  - 文档写入内存缓冲
  - 文档不可搜索

T0 + 1s（Refresh）：
  - 内存缓冲 → Segment
  - 文档变为可搜索

延迟：最多 1 秒
```

**对比真正的实时**：
- 真正实时：写入即可搜索（延迟 < 1ms）
- ES：默认 1 秒延迟（性能与实时性的权衡）

### Refresh 间隔配置

```bash
# 查看 Refresh 间隔
GET /products/_settings

{
  "products": {
    "settings": {
      "index": {
        "refresh_interval": "1s"  # 默认 1 秒
      }
    }
  }
}

# 修改 Refresh 间隔
PUT /products/_settings
{
  "refresh_interval": "30s"  # 改为 30 秒
}

# 禁用自动 Refresh
PUT /products/_settings
{
  "refresh_interval": "-1"
}

# 恢复默认值
PUT /products/_settings
{
  "refresh_interval": null
}
```

### 手动 Refresh

```bash
# Refresh 指定索引
POST /products/_refresh

# Refresh 所有索引
POST /_refresh

# 写入时立即 Refresh
PUT /products/_doc/1?refresh=true
{
  "name": "iPhone"
}

# 写入后等待 Refresh
PUT /products/_doc/1?refresh=wait_for
{
  "name": "iPhone"
}
```

**`refresh` 参数选项**：

| 参数值 | 行为 | 适用场景 |
|--------|------|---------|
| **false**（默认） | 等待自动 Refresh | 正常写入 |
| **true** | 写入后立即 Refresh | 测试、演示 |
| **wait_for** | 写入后等待下一次 Refresh | 需要立即搜索的场景 |

**性能影响**：
- `refresh=true`：每次写入都 Refresh，严重影响性能
- `refresh=wait_for`：等待下一次自动 Refresh，影响较小

### Refresh 的性能影响

**Refresh 的成本**：
- 创建新 Segment（构建倒排索引）
- 打开新 Searcher（重新加载搜索器）
- 消耗 CPU 和内存

**优化建议**：

```bash
# 场景 1：批量导入数据
# 导入前：禁用 Refresh
PUT /bulk_data/_settings
{
  "refresh_interval": "-1"
}

# 批量写入
POST /_bulk
...

# 导入后：手动 Refresh 一次
POST /bulk_data/_refresh

# 恢复自动 Refresh
PUT /bulk_data/_settings
{
  "refresh_interval": "1s"
}

# 场景 2：高吞吐日志写入
# 增加 Refresh 间隔
PUT /logs/_settings
{
  "refresh_interval": "30s"
}
```

**效果**：
- 禁用 Refresh：写入性能提升 3-5 倍
- 增加间隔：性能提升 20%-50%

## Flush 操作

### 什么是 Flush？

**Flush 将文件系统缓存中的 Segment 持久化到磁盘，并清空 Translog**。

```
Flush 流程：
  Segment（OS Cache）
    ↓ Flush
  fsync 到磁盘
    ↓
  创建 Commit Point（segments_N 文件）
    ↓
  清空 Translog
    ↓
  创建新 Translog
```

### Flush 的详细过程

```
1. 执行 Refresh（确保所有内存数据写入 Segment）
2. 所有 Segment（OS Cache）fsync 到磁盘
3. 创建 Commit Point：
   - 记录所有有效的 Segment
   - 写入 segments_N 文件
4. 清空 Translog
5. 创建新的 Translog
6. Flush 完成
```

**结果**：
- Segment 完全持久化
- Translog 被清空，释放磁盘空间
- 故障恢复时间缩短（Translog 更小）

### Flush 触发条件

**自动 Flush 触发**：

1. **Translog 大小达到阈值**（默认 512MB）

```bash
PUT /products/_settings
{
  "index.translog.flush_threshold_size": "512mb"
}
```

2. **定期 Flush**（默认 30 分钟）

```bash
# 通过 Translog sync_interval 间接控制
PUT /products/_settings
{
  "index.translog.sync_interval": "30s"
}
```

3. **索引关闭时**

```bash
POST /products/_close
```

### 手动 Flush

```bash
# Flush 指定索引
POST /products/_flush

# Flush 所有索引
POST /_flush

# 同步 Flush（等待所有副本 Flush 完成）
POST /products/_flush?wait_if_ongoing=true

# 强制 Flush
POST /products/_flush?force=true
```

### Flush 的性能影响

**Flush 的成本**：
- fsync 操作（磁盘 I/O）
- 创建 Commit Point
- 短暂阻塞写入

**优化建议**：
- 保持默认配置（自动 Flush）
- 避免频繁手动 Flush
- 维护前手动 Flush（确保数据持久化）

## Merge 操作

### 什么是 Merge？

**Merge 将多个小 Segment 合并为一个大 Segment**，同时删除已标记删除的文档。

```
Merge 流程：
  多个小 Segment
    ↓ Merge
  合并为大 Segment
    ↓
  删除旧 Segment
    ↓
  减少 Segment 数量
```

### 为什么需要 Merge？

**问题**：

```
写入过程：
  每次 Refresh → 新 Segment
  1 秒 1 次 Refresh → 每秒 1 个 Segment
  1 天 → 86400 个 Segment
```

**Segment 过多的影响**：
- 查询需要遍历所有 Segment（性能下降）
- 文件句柄数量增加（可能耗尽）
- 内存占用增加（每个 Segment 的元数据）

**Merge 解决方案**：

```
定期合并小 Segment：
  Segment1 (1MB) + Segment2 (1MB) + Segment3 (1MB)
    ↓ Merge
  Segment4 (3MB)
    ↓
  删除 Segment1、2、3
```

### Merge 的详细过程

```
1. 选择要合并的 Segment（根据合并策略）
2. 读取所有待合并的 Segment
3. 合并倒排索引：
   - 重新构建词典和倒排表
   - 跳过已删除的文档
   - 生成新的 Segment
4. 写入新 Segment 到磁盘
5. 更新 Commit Point（segments_N）
6. 删除旧 Segment
```

**重点**：
- Merge 是后台异步进行
- 不影响查询和写入（但消耗资源）
- 彻底删除已删除的文档（释放空间）

### Segment 的不可变性

**Lucene Segment 是不可变的**：一旦创建，不会修改。

**删除操作的处理**：

```bash
# 删除文档
DELETE /products/_doc/1

# 实际处理：
# 1. 在 .del 文件中标记文档已删除
# 2. Segment 本身不变
# 3. 查询时跳过已删除的文档
```

**更新操作的处理**：

```bash
# 更新文档
PUT /products/_doc/1
{
  "name": "iPhone 14 Pro"
}

# 实际处理：
# 1. 标记旧文档已删除
# 2. 写入新文档到新 Segment
# 3. 查询返回新文档
```

**Merge 时的处理**：
- 合并时跳过已删除的文档
- 只复制有效文档到新 Segment
- 彻底释放空间

### Merge 策略

#### TieredMergePolicy（默认）

**按 Segment 大小分层合并**。

```
策略：
  - 将相似大小的 Segment 合并
  - 小 Segment 优先合并
  - 避免合并过大的 Segment
```

**配置参数**：

```bash
PUT /products/_settings
{
  "index.merge.policy.max_merged_segment": "5gb",  # 单个 Segment 最大大小
  "index.merge.policy.segments_per_tier": 10,      # 每层的 Segment 数量
  "index.merge.policy.max_merge_at_once": 10       # 每次最多合并的 Segment 数
}
```

#### 其他策略（了解）

- **LogByteSizeMergePolicy**：按字节大小合并
- **LogDocMergePolicy**：按文档数量合并

### Merge 的触发

**自动 Merge**：
- ES 后台线程自动触发
- 根据 Segment 数量和大小决定

**手动 Merge**（Force Merge）：

```bash
# Force Merge：合并为指定数量的 Segment
POST /products/_forcemerge?max_num_segments=1

# 仅合并已删除文档比例高的 Segment
POST /products/_forcemerge?only_expunge_deletes=true

# Force Merge 所有索引
POST /_forcemerge?max_num_segments=1
```

### Force Merge 的使用场景

**适用场景**：
- 不再写入的索引（如历史日志）
- 删除大量文档后（释放空间）
- 查询性能优化（减少 Segment 数量）

**不适用场景**：
- 频繁写入的索引
- 实时索引

**原因**：
- Force Merge 消耗大量 CPU 和 I/O
- 合并期间影响性能
- 新写入会立即生成新 Segment（破坏合并效果）

**最佳实践**：

```bash
# 示例：每日日志索引
# 日期滚动后，对旧索引执行 Force Merge

# 1. 关闭旧索引的写入（切换到新索引）
POST /_aliases
{
  "actions": [
    { "remove": { "index": "logs-2024.01.15", "alias": "logs-write" } },
    { "add": { "index": "logs-2024.01.16", "alias": "logs-write" } }
  ]
}

# 2. Force Merge 旧索引
POST /logs-2024.01.15/_forcemerge?max_num_segments=1

# 3. 可选：冷数据迁移到 Warm 节点
PUT /logs-2024.01.15/_settings
{
  "index.routing.allocation.require.data": "warm"
}
```

### Merge 的性能影响

**资源消耗**：
- CPU：重建倒排索引
- I/O：读取旧 Segment、写入新 Segment
- 磁盘空间：合并期间需要额外空间

**性能影响**：
- 查询性能：合并期间略有下降
- 写入性能：与 Merge 线程争抢资源
- 合并后：查询性能提升（Segment 减少）

**优化配置**：

```bash
# 限制 Merge 线程数（默认：Math.max(1, Math.min(4, CPU核心数 / 2))）
PUT /_cluster/settings
{
  "persistent": {
    "index.merge.scheduler.max_thread_count": 1
  }
}

# 限制 Merge 带宽（限制 I/O）
PUT /_cluster/settings
{
  "persistent": {
    "indices.store.throttle.max_bytes_per_sec": "20mb"
  }
}
```

## 删除文档的处理

### 逻辑删除 vs 物理删除

**逻辑删除**（标记删除）：

```bash
DELETE /products/_doc/1

# 处理：
# 1. 在 .del 文件中标记删除
# 2. 文档仍在 Segment 中
# 3. 查询时跳过
```

**物理删除**（Merge 时）：

```
Merge 过程：
  - 读取 Segment 中的有效文档
  - 跳过已删除的文档
  - 写入新 Segment
  - 删除旧 Segment
  → 已删除的文档彻底移除
```

### 已删除文档的空间占用

```bash
# 查看已删除文档统计
GET /products/_stats

{
  "indices": {
    "products": {
      "primaries": {
        "docs": {
          "count": 8000,     # 有效文档数
          "deleted": 2000    # 已删除文档数
        },
        "store": {
          "size_in_bytes": 10485760  # 总大小（包含已删除文档）
        }
      }
    }
  }
}

# 已删除文档比例：2000 / (8000 + 2000) = 20%
```

**释放空间**：

```bash
# Force Merge，彻底删除已删除的文档
POST /products/_forcemerge?only_expunge_deletes=true
```

## 综合示例：三者协作

### 完整的写入、刷新、持久化流程

```
T0: 写入文档
  ↓
  内存缓冲 + Translog

T1: Refresh（1秒后）
  ↓
  内存缓冲 → Segment（OS Cache）
  文档可搜索
  Translog 保留

T2-T29: 继续写入和 Refresh
  ↓
  生成多个小 Segment
  Translog 持续增长

T30: Translog 达到 512MB（或 30 分钟）
  ↓
  Flush 触发：
    - Segment → 磁盘
    - 创建 Commit Point
    - 清空 Translog

后台: Merge 线程
  ↓
  定期合并小 Segment
  删除已删除的文档
  减少 Segment 数量
```

### 时间线示例

```
00:00 - 写入 1000 文档 → 内存缓冲
00:01 - Refresh → Segment1 (1000 docs, OS Cache)
00:02 - 写入 1000 文档 → 内存缓冲
00:03 - Refresh → Segment2 (1000 docs, OS Cache)
...
00:30 - Translog 达到 512MB
      - Flush → Segment1-30 持久化到磁盘
      - 清空 Translog
...
01:00 - Merge 触发
      - Segment1-10 合并为 Segment31
      - 删除 Segment1-10
```

## 性能优化实战

### 场景 1：高吞吐日志写入

**目标**：每秒写入 10000 条日志

**优化配置**：

```bash
PUT /logs/_settings
{
  # 1. 增加 Refresh 间隔
  "refresh_interval": "30s",
  
  # 2. 异步 Translog
  "index.translog.durability": "async",
  "index.translog.sync_interval": "30s",
  
  # 3. 增大 Flush 阈值
  "index.translog.flush_threshold_size": "1gb",
  
  # 4. 限制 Merge 线程（避免影响写入）
  "index.merge.scheduler.max_thread_count": 1
}
```

**效果**：
- 写入性能提升 5-10 倍
- 延迟增加到 30 秒

### 场景 2：批量导入历史数据

**目标**：一次性导入 1 亿条历史数据

**优化步骤**：

```bash
# 1. 导入前：禁用影响性能的功能
PUT /archive/_settings
{
  "refresh_interval": "-1",           # 禁用 Refresh
  "number_of_replicas": 0,            # 禁用副本
  "index.translog.durability": "async"
}

# 2. 批量写入（使用 Bulk API）
POST /_bulk
...

# 3. 导入完成后：手动 Refresh 和 Flush
POST /archive/_refresh
POST /archive/_flush

# 4. Force Merge 为 1 个 Segment
POST /archive/_forcemerge?max_num_segments=1

# 5. 恢复副本
PUT /archive/_settings
{
  "number_of_replicas": 1
}

# 6. 恢复自动 Refresh
PUT /archive/_settings
{
  "refresh_interval": "1s",
  "index.translog.durability": "request"
}
```

**效果**：
- 导入时间缩短 80%
- 最终索引只有 1 个 Segment（查询性能最优）

### 场景 3：查询性能优化

**目标**：优化历史索引的查询性能

**操作**：

```bash
# 1. 查看 Segment 数量
GET /_cat/segments/logs-2024.01.01?v

index           shard prirep segment generation docs.count size
logs-2024.01.01 0     p      _0      0          1000       1mb
logs-2024.01.01 0     p      _1      1          1200       1.2mb
...
logs-2024.01.01 0     p      _99     99         800        0.8mb

# Segment 数量：100

# 2. Force Merge 为 1 个 Segment
POST /logs-2024.01.01/_forcemerge?max_num_segments=1

# 3. 验证
GET /_cat/segments/logs-2024.01.01?v

index           shard prirep segment generation docs.count size
logs-2024.01.01 0     p      _100    100        100000     100mb

# Segment 数量：1
```

**效果**：
- 查询延迟降低 30%-50%
- 内存占用减少

## 监控与调试

### 查看 Segment 信息

```bash
# Cat API
GET /_cat/segments?v

# 详细信息
GET /products/_segments

{
  "indices": {
    "products": {
      "shards": {
        "0": [
          {
            "routing": {
              "state": "STARTED",
              "primary": true,
              "node": "node-1"
            },
            "segments": {
              "_0": {
                "generation": 0,
                "num_docs": 1000,
                "deleted_docs": 100,
                "size_in_bytes": 1048576,
                "memory_in_bytes": 2048,
                "committed": true,
                "search": true,
                "version": "9.0.0",
                "compound": true
              }
            }
          }
        ]
      }
    }
  }
}
```

### 监控 Merge 进度

```bash
# 查看正在进行的 Merge
GET /_cat/tasks?v&actions=*merge*

# Merge 统计信息
GET /products/_stats/merge

{
  "indices": {
    "products": {
      "primaries": {
        "merges": {
          "current": 1,              # 当前正在进行的 Merge
          "current_docs": 5000,      # 正在合并的文档数
          "current_size_in_bytes": 5242880,
          "total": 50,               # 总 Merge 次数
          "total_time_in_millis": 120000,
          "total_docs": 250000,
          "total_size_in_bytes": 262144000
        }
      }
    }
  }
}
```

### 关键指标

**Refresh 指标**：
- `refresh.total`：Refresh 总次数
- `refresh.total_time_in_millis`：Refresh 总耗时

**Flush 指标**：
- `flush.total`：Flush 总次数
- `flush.total_time_in_millis`：Flush 总耗时

**Merge 指标**：
- `merges.current`：当前 Merge 数量
- `merges.total_docs`：已合并的文档数
- `merges.total_time_in_millis`：Merge 总耗时

## 总结

**Refresh**：
- 内存缓冲 → Segment（OS Cache）
- 使文档可搜索
- 默认 1 秒间隔（Near Real-Time）
- 优化：增加间隔或禁用（批量导入）

**Flush**：
- Segment → 磁盘持久化
- 清空 Translog
- Translog 达到 512MB 或 30 分钟触发
- 优化：保持默认，避免频繁手动 Flush

**Merge**：
- 合并小 Segment 为大 Segment
- 删除已删除的文档
- 后台自动执行
- 优化：不再写入的索引执行 Force Merge

**三者协作**：
1. 写入 → 内存缓冲 + Translog
2. Refresh → Segment（OS Cache），可搜索
3. Flush → Segment 持久化，清空 Translog
4. Merge → 合并 Segment，优化查询

**性能优化原则**：
- 批量导入：禁用 Refresh、副本，完成后 Force Merge
- 日志场景：增加 Refresh 间隔，使用 async Translog
- 历史索引：Force Merge 为 1 个 Segment

**下一步**：学习索引管理基础，掌握索引的完整生命周期管理。

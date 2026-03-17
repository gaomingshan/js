# 索引性能调优

## 概述

索引性能直接影响数据写入吞吐量和存储效率。本章介绍分片规划、批量写入优化、配置调优等策略，提升索引性能。

## 分片数量规划

### 分片不是越多越好

**常见误区**：

```
错误认知：分片越多性能越好
  - 更多分片 → 更高并行度 → 更快

实际情况：
  - 分片过多 → 元数据开销大
  - 每个分片是独立的 Lucene 索引
  - 查询需要遍历所有分片
```

**问题示例**：

```
场景：100GB 数据，配置 50 个主分片

问题：
  - 单分片仅 2GB（过小）
  - 查询需要查询 50 个分片
  - 元数据管理开销大
  - 恢复时间长

优化：
  - 调整为 5-10 个主分片
  - 单分片 10-20GB
  - 查询仅需查询 5-10 个分片
```

### 分片大小建议

**推荐范围**：

```
单分片大小：20-40GB

理想配置：
  - 搜索场景：20-30GB
  - 日志场景：30-40GB
  - 时序数据：40-50GB
```

**计算示例**：

```
数据量：500GB
单分片目标：30GB
主分片数 = 500 / 30 ≈ 17

推荐配置：
  number_of_shards: 15-20
```

### 分片数量限制

**集群级别限制**：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.max_shards_per_node": 1000
  }
}
```

**计算总分片数**：

```
公式：
  总分片数 = 主分片数 × (1 + 副本数) × 索引数

示例：
  10 个索引
  每个索引：5 主分片，1 副本
  总分片数 = 5 × 2 × 10 = 100 分片

节点需求：
  最少节点数 = 100 / 1000 = 1（理论）
  推荐节点数 = 3-5（实际）
```

## 副本数量的权衡

### 可用性 vs 性能

**副本数量影响**：

```
number_of_replicas: 0
  - 写入最快（无副本同步）
  - 无高可用保证
  - 适合：临时数据、批量导入

number_of_replicas: 1
  - 平衡性能与可用性
  - 推荐配置

number_of_replicas: 2+
  - 更高可用性
  - 写入性能下降
  - 适合：关键数据
```

### 动态调整副本数

**批量导入优化**：

```bash
# 导入前：禁用副本
PUT /products/_settings
{
  "number_of_replicas": 0
}

# 批量写入数据
POST /_bulk
...

# 导入后：恢复副本
PUT /products/_settings
{
  "number_of_replicas": 1
}
```

**效果**：写入速度提升 50%-100%

## 批量写入优化

### Bulk API 最佳实践

**批次大小调优**：

```bash
# 推荐批次大小
批次大小：5-15 MB
文档数量：500-5000 条

测试方法：
1. 从 1000 条开始
2. 测试 2000、5000、10000
3. 观察吞吐量和延迟
4. 选择最优值
```

**批量写入示例**：

```bash
POST /_bulk
{ "index": { "_index": "products", "_id": "1" } }
{ "name": "iPhone 14", "price": 7999 }
{ "index": { "_index": "products", "_id": "2" } }
{ "name": "iPad Pro", "price": 6999 }
...
# 1000 条文档
```

### 并发批量写入

```java
// 伪代码
ExecutorService executor = Executors.newFixedThreadPool(8);

List<List<Document>> batches = splitIntoBatches(documents, 1000);

for (List<Document> batch : batches) {
    executor.submit(() -> {
        bulkIndex(batch);
    });
}

executor.shutdown();
executor.awaitTermination(1, TimeUnit.HOURS);
```

**并发数建议**：
- 单节点：2-4 并发
- 3 节点集群：4-8 并发
- 大集群：8-16 并发

### 错误处理

```bash
POST /_bulk
...

# 响应
{
  "errors": true,
  "items": [
    {
      "index": {
        "status": 201,
        "result": "created"
      }
    },
    {
      "index": {
        "status": 409,
        "error": {
          "type": "version_conflict_engine_exception"
        }
      }
    }
  ]
}

# 处理：
# 1. 检查 errors 字段
# 2. 遍历 items，找出失败项
# 3. 记录失败文档，稍后重试
```

## Refresh Interval 调优

### 实时性 vs 性能

**Refresh 机制**：

```
默认：每 1 秒 Refresh
  - 文档写入后最多 1 秒可搜索
  - 每秒生成新 Segment
  - 性能开销

优化：增加 Refresh 间隔
  - 减少 Segment 生成频率
  - 提升写入性能
```

### 配置调整

```bash
# 默认配置
PUT /products/_settings
{
  "refresh_interval": "1s"
}

# 高吞吐场景：增加间隔
PUT /logs/_settings
{
  "refresh_interval": "30s"
}

# 批量导入：禁用 Refresh
PUT /bulk_import/_settings
{
  "refresh_interval": "-1"
}

# 导入后：手动 Refresh
POST /bulk_import/_refresh

# 恢复自动 Refresh
PUT /bulk_import/_settings
{
  "refresh_interval": "1s"
}
```

**性能提升**：
- 30s 间隔：20%-30% 提升
- 禁用：50%-100% 提升

## Translog 配置优化

### 同步 vs 异步

```bash
# 同步刷盘（默认）
PUT /products/_settings
{
  "index.translog.durability": "request"
}
# 每次写入后 fsync
# 安全性高，性能较低

# 异步刷盘
PUT /logs/_settings
{
  "index.translog.durability": "async",
  "index.translog.sync_interval": "30s"
}
# 定期 fsync
# 性能高，可能丢失 30 秒数据
```

### Flush 阈值调整

```bash
PUT /products/_settings
{
  "index.translog.flush_threshold_size": "1gb"
}
# 默认：512mb
# 增大阈值：减少 Flush 频率
```

### 使用场景

```
金融/订单数据：
  - durability: request
  - 数据安全优先

日志/监控数据：
  - durability: async
  - 性能优先
  - 可容忍少量丢失

批量导入：
  - durability: async
  - flush_threshold_size: 1-2gb
```

## 索引缓冲区调整

### 配置缓冲区大小

```yaml
# elasticsearch.yml
indices.memory.index_buffer_size: 20%  # 默认 10%
```

**缓冲区作用**：
- 存储待写入的文档
- 缓冲区满时触发 Refresh
- 增大缓冲区 → 减少 Refresh 频率

**配置建议**：

```
默认：10%（堆内存）
  - 16GB 堆：1.6GB 缓冲区

高吞吐场景：20%
  - 16GB 堆：3.2GB 缓冲区

计算：
  缓冲区 = 堆内存 × 百分比 / 活跃分片数
```

## 禁用不必要的功能

### 优化映射配置

```bash
PUT /logs
{
  "mappings": {
    "properties": {
      "message": {
        "type": "text",
        "norms": false,           # 禁用字段长度归一化
        "index_options": "freqs"  # 仅存储词频，不存储位置
      },
      "timestamp": {
        "type": "date"
      },
      "trace_id": {
        "type": "keyword",
        "doc_values": false,      # 不用于排序/聚合
        "index": false            # 不索引，仅存储
      }
    }
  }
}
```

**优化说明**：
- **norms: false**：节省空间，禁用评分归一化
- **index_options: freqs**：仅存储词频，不存储位置
- **doc_values: false**：不用于聚合/排序
- **index: false**：不索引，仅存储

### 禁用 _source

```bash
# 仅需存储部分字段
PUT /metrics
{
  "mappings": {
    "_source": {
      "enabled": false
    },
    "properties": {
      "timestamp": {
        "type": "date",
        "store": true
      },
      "value": {
        "type": "double",
        "store": true
      }
    }
  }
}
```

**注意**：禁用 _source 后无法 Reindex

## 使用最佳压缩

```bash
PUT /archive
{
  "settings": {
    "codec": "best_compression"
  }
}
```

**效果**：
- 磁盘占用减少 30%-50%
- CPU 开销增加 10%-20%
- 适合：冷数据、归档数据

## 实战优化案例

### 案例1：每秒 10000 条日志写入

**需求**：
- 写入速率：10000 docs/s
- 单文档大小：2KB
- 吞吐量：20MB/s

**优化配置**：

```bash
PUT /logs
{
  "settings": {
    "number_of_shards": 10,
    "number_of_replicas": 1,
    "refresh_interval": "30s",
    "index.translog.durability": "async",
    "index.translog.sync_interval": "30s",
    "index.translog.flush_threshold_size": "1gb"
  },
  "mappings": {
    "properties": {
      "message": {
        "type": "text",
        "norms": false,
        "index_options": "freqs"
      },
      "level": {
        "type": "keyword"
      },
      "timestamp": {
        "type": "date"
      }
    }
  }
}

# 批量写入（1000 条/批，8 并发）
```

**效果**：
- 吞吐量：12000+ docs/s
- 延迟：< 100ms

### 案例2：批量导入 1 亿条历史数据

**优化步骤**：

```bash
# 1. 创建索引（临时优化配置）
PUT /archive
{
  "settings": {
    "number_of_shards": 30,
    "number_of_replicas": 0,     # 禁用副本
    "refresh_interval": "-1",     # 禁用 Refresh
    "index.translog.durability": "async",
    "index.translog.flush_threshold_size": "2gb"
  }
}

# 2. 批量写入（5000 条/批，16 并发）

# 3. 导入完成后优化
POST /archive/_refresh
POST /archive/_flush
POST /archive/_forcemerge?max_num_segments=1

# 4. 恢复生产配置
PUT /archive/_settings
{
  "number_of_replicas": 1,
  "refresh_interval": "30s",
  "index.translog.durability": "request"
}
```

**效果**：
- 导入时间：从 10 小时降低到 2 小时
- 最终索引：单 Segment，查询性能最优

## 监控索引性能

### 关键指标

```bash
GET /_nodes/stats

{
  "nodes": {
    "node-1": {
      "indices": {
        "indexing": {
          "index_total": 10000000,
          "index_time_in_millis": 300000,
          "index_current": 10,
          "index_failed": 0
        },
        "refresh": {
          "total": 1000,
          "total_time_in_millis": 50000
        },
        "flush": {
          "total": 100,
          "total_time_in_millis": 30000
        }
      }
    }
  }
}

# 计算指标
平均写入时间 = index_time_in_millis / index_total
            = 300000 / 10000000
            = 0.03ms

平均 Refresh 时间 = total_time_in_millis / total
                 = 50000 / 1000
                 = 50ms
```

### 告警阈值

```
告警规则：
1. 写入拒绝率 > 1%
2. 平均写入延迟 > 50ms
3. Refresh 时间 > 1s
4. Flush 时间 > 10s
5. 索引失败率 > 0.1%
```

## 索引优化清单

### 配置层面

```
✓ 合理分片数量（单分片 20-40GB）
✓ 动态调整副本数（导入时为 0）
✓ 增加 Refresh 间隔（30s 或禁用）
✓ 使用 async Translog
✓ 增大 Flush 阈值（1-2GB）
✓ 增加索引缓冲区（20%）
✓ 禁用不必要功能（norms、doc_values）
✓ 使用最佳压缩（冷数据）
```

### 应用层面

```
✓ 使用 Bulk API
✓ 合理批次大小（5-15MB）
✓ 并发批量写入（4-16 线程）
✓ 使用自动生成 ID
✓ 错误处理与重试
```

### 硬件层面

```
✓ 使用 SSD
✓ RAID 0 配置
✓ 增加内存（文件系统缓存）
✓ 万兆网卡
```

## 总结

**分片规划**：
- 单分片大小：20-40GB
- 分片不是越多越好
- 控制总分片数 < 1000/节点

**副本策略**：
- 批量导入时禁用副本
- 生产环境：1-2 个副本

**Refresh 优化**：
- 增加间隔到 30s
- 批量导入时禁用
- 导入后手动 Refresh

**Translog 优化**：
- 日志场景使用 async
- 增大 Flush 阈值

**批量写入**：
- 使用 Bulk API
- 批次大小：5-15MB
- 并发写入：4-16 线程

**映射优化**：
- 禁用不必要功能
- 使用最佳压缩

**监控指标**：
- 写入速率
- 拒绝率
- 平均延迟

**下一步**：学习查询性能调优，提升搜索响应速度。

# 冷热数据分离架构

## 概述

冷热数据分离是优化存储成本和查询性能的重要手段。本章介绍如何根据数据访问频率，将数据分配到不同性能的节点上。

## 冷热数据定义

### 数据温度分级

```
Hot（热数据）：
  - 最近写入（0-7天）
  - 高频查询
  - 实时性要求高
  - 存储：NVMe SSD

Warm（温数据）：
  - 较旧数据（7-30天）
  - 偶尔查询
  - 实时性要求一般
  - 存储：SATA SSD

Cold（冷数据）：
  - 历史数据（30-90天）
  - 很少查询
  - 可接受慢查询
  - 存储：HDD

Frozen（冻结数据）：
  - 归档数据（>90天）
  - 极少查询
  - 存储：对象存储（S3/HDFS）
```

## 节点属性配置

### 设置节点属性

**Hot 节点**：

```yaml
# elasticsearch.yml
node.roles: [data_hot, data_content]
node.attr.data: hot
```

**Warm 节点**：

```yaml
node.roles: [data_warm, data_content]
node.attr.data: warm
```

**Cold 节点**：

```yaml
node.roles: [data_cold, data_content]
node.attr.data: cold
```

### 验证节点属性

```bash
GET /_cat/nodeattrs?v&h=node,attr,value

node     attr  value
node-1   data  hot
node-2   data  hot
node-3   data  warm
node-4   data  cold
```

## 分片分配过滤规则

### 索引级别分配

```bash
# 创建索引时指定
PUT /logs-hot
{
  "settings": {
    "index.routing.allocation.require.data": "hot",
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

# 修改现有索引
PUT /logs-2024.01.01/_settings
{
  "index.routing.allocation.require.data": "warm"
}
```

### 集群级别分配

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "data"
  }
}
```

## 索引生命周期管理（ILM）

### 完整 ILM 策略

```bash
PUT /_ilm/policy/logs_policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "50GB",
            "max_docs": 1000000
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "allocate": {
            "require": {
              "data": "warm"
            },
            "number_of_replicas": 1
          },
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "allocate": {
            "require": {
              "data": "cold"
            },
            "number_of_replicas": 0
          },
          "freeze": {},
          "set_priority": {
            "priority": 0
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

### 应用 ILM 策略

**索引模板**：

```bash
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs_policy",
      "index.lifecycle.rollover_alias": "logs"
    }
  }
}
```

**创建初始索引**：

```bash
PUT /logs-000001
{
  "aliases": {
    "logs": {
      "is_write_index": true
    }
  }
}
```

## 冷节点配置优化

### 硬件配置

```
Hot 节点：
  - CPU：32 核
  - 内存：128GB
  - 磁盘：4TB NVMe SSD

Warm 节点：
  - CPU：16 核
  - 内存：64GB
  - 磁盘：8TB SATA SSD

Cold 节点：
  - CPU：8 核
  - 内存：32GB
  - 磁盘：16TB HDD
```

### JVM 配置

**Cold 节点**：

```yaml
# jvm.options
-Xms16g
-Xmx16g

# elasticsearch.yml
indices.memory.index_buffer_size: 10%
indices.queries.cache.size: 5%
```

## 数据自动迁移

### Rollover 自动滚动

```bash
# 配置 Rollover
PUT /logs-000001
{
  "aliases": {
    "logs": {
      "is_write_index": true
    }
  }
}

# ILM 自动 Rollover
# 当满足条件时：
# - max_age: 1d
# - max_size: 50GB
# 自动创建 logs-000002，并将 is_write_index 转移
```

### 手动迁移

```bash
# 1. 迁移到 Warm
POST /logs-2024.01.01/_ilm/move/warm

# 2. 验证
GET /logs-2024.01.01/_ilm/explain
```

## 冷热分离架构实战

### 架构设计

```
写入层（Hot）        查询层（Warm/Cold）      归档层（Frozen）
┌──────────┐        ┌──────────┐           ┌──────────┐
│ Hot      │──7d──▶ │ Warm     │──30d───▶  │ Cold     │──90d──▶ 删除/S3
│ 节点 × 3 │        │ 节点 × 3 │           │ 节点 × 2 │
│ NVMe SSD │        │ SATA SSD │           │ HDD      │
└──────────┘        └──────────┘           └──────────┘
    ↓                   ↓                      ↓
  实时查询            偶尔查询              很少查询
  100% 查询           20% 查询              1% 查询
```

### 成本收益分析

```
场景：10TB 日志数据

全 SSD 方案：
  - 10TB × $300/TB = $3,000

冷热分离方案：
  - Hot（2TB NVMe）：$800
  - Warm（3TB SATA）：$450
  - Cold（5TB HDD）：$250
  - 总成本：$1,500
  - 节省：50%

性能对比：
  - Hot 查询延迟：50ms（不变）
  - Warm 查询延迟：100ms（+50ms，可接受）
  - Cold 查询延迟：500ms（+450ms，很少查询）
```

### 监控指标

```bash
# 查看索引分布
GET /_cat/shards?v&h=index,shard,prirep,state,node,disk

# 查看 ILM 状态
GET /_ilm/status

# 查看索引生命周期
GET /logs-*/_ilm/explain
```

## 最佳实践

### 分层策略

```
按时间分层：
  - 0-7天：Hot
  - 7-30天：Warm
  - 30-90天：Cold
  - >90天：删除或归档

按访问频率分层：
  - 高频（80% 查询）：Hot
  - 中频（15% 查询）：Warm
  - 低频（5% 查询）：Cold
```

### 查询优化

```bash
# 优先查询 Hot 数据
GET /logs-hot,logs-warm/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-7d"
            }
          }
        }
      ]
    }
  }
}

# 跨冷热查询时使用 preference
GET /logs-*/_search?preference=_only_local
{
  "query": {...}
}
```

### 容量规划

```
评估方法：
  1. 统计最近 30 天查询分布
  2. 计算各时间段查询占比
  3. 确定冷热分界线
  4. 规划节点容量

示例：
  - Hot（7天，2TB）：70% 查询
  - Warm（23天，3TB）：25% 查询
  - Cold（60天，5TB）：5% 查询
```

## 总结

**冷热数据定义**：
- 按时间划分
- 按访问频率
- 四层架构

**节点配置**：
- 节点属性设置
- 硬件差异化
- JVM 优化

**分片分配**：
- 索引级过滤
- 集群级策略
- 动态调整

**ILM 策略**：
- 自动滚动
- 自动迁移
- 自动删除

**架构实战**：
- 三层分离
- 成本优化
- 性能平衡

**最佳实践**：
- 合理分层
- 查询优化
- 容量规划
- 监控告警

**下一步**：学习多租户隔离方案。

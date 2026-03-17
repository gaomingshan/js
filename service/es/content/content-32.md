# Cluster APIs

## 概述

Cluster APIs 用于查询和管理集群状态、节点信息、任务管理和分片分配。这些 API 是集群运维的核心工具。

## Cluster Health API

### 集群健康状态

```bash
GET /_cluster/health

# 响应
{
  "cluster_name": "production",
  "status": "green",
  "timed_out": false,
  "number_of_nodes": 5,
  "number_of_data_nodes": 3,
  "active_primary_shards": 50,
  "active_shards": 100,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 0,
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks": 0,
  "number_of_in_flight_fetch": 0,
  "task_max_waiting_in_queue_millis": 0,
  "active_shards_percent_as_number": 100.0
}
```

**状态说明**：
- **green**：所有主副分片都已分配
- **yellow**：所有主分片已分配，部分副本未分配
- **red**：部分主分片未分配

### 索引级别健康

```bash
GET /_cluster/health/products

# 响应
{
  "cluster_name": "production",
  "status": "green",
  "indices": {
    "products": {
      "status": "green",
      "number_of_shards": 5,
      "number_of_replicas": 1,
      "active_primary_shards": 5,
      "active_shards": 10,
      "relocating_shards": 0,
      "initializing_shards": 0,
      "unassigned_shards": 0
    }
  }
}
```

### 等待状态

```bash
# 等待集群变为 green（最多 30 秒）
GET /_cluster/health?wait_for_status=green&timeout=30s

# 等待指定数量的节点
GET /_cluster/health?wait_for_nodes=3&timeout=30s

# 等待分片分配完成
GET /_cluster/health?wait_for_no_relocating_shards=true
```

**使用场景**：
- 启动后等待集群就绪
- 节点重启后等待恢复
- 自动化脚本中的同步点

## Cluster State API

### 获取集群完整状态

```bash
GET /_cluster/state

# 响应（精简）
{
  "cluster_name": "production",
  "cluster_uuid": "abc123",
  "version": 156,
  "state_uuid": "def456",
  "master_node": "node-1-uuid",
  "nodes": {
    "node-1-uuid": {
      "name": "node-1",
      "transport_address": "10.0.0.1:9300"
    }
  },
  "metadata": {
    "indices": { ... },
    "templates": { ... }
  },
  "routing_table": {
    "indices": { ... }
  }
}
```

**注意**：返回数据量大，生产环境慎用

### 指定返回信息

```bash
# 仅返回 metadata
GET /_cluster/state/metadata

# 仅返回 routing_table
GET /_cluster/state/routing_table

# 仅返回特定索引的路由信息
GET /_cluster/state/routing_table/products

# 组合查询
GET /_cluster/state/metadata,routing_table/products
```

### 常用场景

```bash
# 查看主节点
GET /_cluster/state/master_node

# 查看索引元数据
GET /_cluster/state/metadata/products

# 查看分片路由
GET /_cluster/state/routing_table/products
```

## Cluster Stats API

### 集群统计信息

```bash
GET /_cluster/stats

# 响应
{
  "cluster_name": "production",
  "cluster_uuid": "abc123",
  "timestamp": 1704201600000,
  "status": "green",
  "indices": {
    "count": 100,
    "shards": {
      "total": 500,
      "primaries": 250,
      "replication": 1.0
    },
    "docs": {
      "count": 10000000,
      "deleted": 50000
    },
    "store": {
      "size_in_bytes": 107374182400  # 100GB
    },
    "fielddata": {
      "memory_size_in_bytes": 0
    },
    "query_cache": {
      "memory_size_in_bytes": 104857600  # 100MB
    }
  },
  "nodes": {
    "count": {
      "total": 5,
      "data": 3,
      "master": 3,
      "coordinating_only": 0
    },
    "versions": ["8.1.0"],
    "os": {
      "mem": {
        "total_in_bytes": 107374182400
      }
    },
    "jvm": {
      "max_uptime_in_millis": 86400000,
      "mem": {
        "heap_used_in_bytes": 16106127360,
        "heap_max_in_bytes": 33285996544
      }
    }
  }
}
```

**用途**：
- 集群容量规划
- 性能监控
- 趋势分析

## Nodes Info API

### 获取节点信息

```bash
GET /_nodes

# 响应（精简）
{
  "cluster_name": "production",
  "nodes": {
    "node-1-uuid": {
      "name": "node-1",
      "transport_address": "10.0.0.1:9300",
      "host": "10.0.0.1",
      "ip": "10.0.0.1",
      "version": "8.1.0",
      "roles": ["data", "master", "ingest"],
      "os": {
        "name": "Linux",
        "arch": "amd64",
        "version": "5.10.0"
      },
      "jvm": {
        "version": "17.0.1",
        "vm_name": "OpenJDK 64-Bit Server VM",
        "vm_version": "17.0.1+12"
      },
      "settings": {
        "cluster": {
          "name": "production"
        },
        "node": {
          "name": "node-1"
        }
      }
    }
  }
}
```

### 指定节点

```bash
# 单个节点
GET /_nodes/node-1

# 多个节点
GET /_nodes/node-1,node-2

# 按角色筛选
GET /_nodes/_master
GET /_nodes/data:true
```

### 指定信息类型

```bash
# 仅 JVM 信息
GET /_nodes/jvm

# 仅操作系统信息
GET /_nodes/os

# 仅进程信息
GET /_nodes/process

# 组合查询
GET /_nodes/jvm,os,process
```

## Nodes Stats API

### 获取节点统计

```bash
GET /_nodes/stats

# 响应（精简）
{
  "cluster_name": "production",
  "nodes": {
    "node-1-uuid": {
      "timestamp": 1704201600000,
      "name": "node-1",
      "indices": {
        "docs": {
          "count": 3333333,
          "deleted": 10000
        },
        "store": {
          "size_in_bytes": 35791394816  # 33GB
        },
        "indexing": {
          "index_total": 1000000,
          "index_time_in_millis": 300000,
          "index_current": 10
        },
        "search": {
          "query_total": 500000,
          "query_time_in_millis": 250000,
          "query_current": 5
        }
      },
      "jvm": {
        "mem": {
          "heap_used_percent": 65,
          "heap_used_in_bytes": 10737418240,
          "heap_max_in_bytes": 16106127360
        },
        "gc": {
          "collectors": {
            "young": {
              "collection_count": 1000,
              "collection_time_in_millis": 50000
            },
            "old": {
              "collection_count": 10,
              "collection_time_in_millis": 2000
            }
          }
        }
      },
      "os": {
        "cpu": {
          "percent": 25
        },
        "mem": {
          "used_percent": 75
        }
      },
      "thread_pool": {
        "write": {
          "threads": 8,
          "queue": 0,
          "active": 2,
          "rejected": 0,
          "completed": 500000
        },
        "search": {
          "threads": 13,
          "queue": 0,
          "active": 3,
          "rejected": 0,
          "completed": 250000
        }
      }
    }
  }
}
```

### 指定统计类型

```bash
# 仅索引统计
GET /_nodes/stats/indices

# 仅 JVM 统计
GET /_nodes/stats/jvm

# 仅线程池统计
GET /_nodes/stats/thread_pool

# 组合查询
GET /_nodes/stats/indices,jvm,os
```

### 计算性能指标

```bash
# 平均索引时间
avg_index_time = index_time_in_millis / index_total
               = 300000 / 1000000
               = 0.3ms

# 平均查询时间
avg_query_time = query_time_in_millis / query_total
               = 250000 / 500000
               = 0.5ms

# 拒绝率
reject_rate = rejected / (rejected + completed)
            = 0 / (0 + 500000)
            = 0%
```

## Task Management API

### 查看当前任务

```bash
GET /_tasks

# 响应
{
  "nodes": {
    "node-1-uuid": {
      "name": "node-1",
      "tasks": {
        "node-1-uuid:12345": {
          "node": "node-1-uuid",
          "id": 12345,
          "type": "transport",
          "action": "indices:data/write/bulk",
          "start_time_in_millis": 1704201600000,
          "running_time_in_nanos": 5000000000
        }
      }
    }
  }
}
```

### 查看详细任务信息

```bash
GET /_tasks?detailed=true&actions=*reindex

# 查看特定任务
GET /_tasks/node-1-uuid:12345
```

### 取消任务

```bash
POST /_tasks/node-1-uuid:12345/_cancel

# 取消所有 reindex 任务
POST /_tasks/_cancel?actions=*reindex
```

**使用场景**：
- 取消长时间运行的查询
- 取消 Reindex 任务
- 监控任务执行

## Allocation Explain API

### 解释分片分配

```bash
GET /_cluster/allocation/explain

# 响应
{
  "index": "products",
  "shard": 0,
  "primary": true,
  "current_state": "unassigned",
  "unassigned_info": {
    "reason": "INDEX_CREATED",
    "at": "2024-01-15T10:00:00.000Z"
  },
  "can_allocate": "no",
  "allocate_explanation": "cannot allocate because allocation is not permitted to any of the nodes",
  "node_allocation_decisions": [
    {
      "node_name": "node-1",
      "node_decision": "no",
      "deciders": [
        {
          "decider": "same_shard",
          "decision": "NO",
          "explanation": "a copy of this shard is already allocated to this node"
        }
      ]
    }
  ]
}
```

### 指定分片

```bash
GET /_cluster/allocation/explain
{
  "index": "products",
  "shard": 0,
  "primary": true
}
```

**用途**：
- 诊断分片未分配原因
- 理解分片分配决策
- 解决 Yellow/Red 状态问题

## Cat APIs

### 轻量级查询

**Cat Nodes**：

```bash
GET /_cat/nodes?v

name    heap.percent ram.percent cpu load_1m node.role master
node-1  45           60          5   0.50    dim       *
node-2  38           55          3   0.30    dim       -
node-3  42           58          4   0.35    dim       -
```

**Cat Indices**：

```bash
GET /_cat/indices?v&s=store.size:desc

health status index    pri rep docs.count store.size
green  open   products 5   1   1000000    100gb
green  open   orders   3   1   500000     50gb
```

**Cat Shards**：

```bash
GET /_cat/shards/products?v

index    shard prirep state   docs   store node
products 0     p      STARTED 200000 20gb  node-1
products 0     r      STARTED 200000 20gb  node-2
products 1     p      STARTED 200000 20gb  node-2
products 1     r      STARTED 200000 20gb  node-3
```

**Cat Allocation**：

```bash
GET /_cat/allocation?v

shards disk.indices disk.used disk.avail disk.total disk.percent node
    50        900gb      1.5tb      500gb       2tb           75 node-1
    48        850gb      1.4tb      600gb       2tb           70 node-2
```

**Cat Thread Pool**：

```bash
GET /_cat/thread_pool/write?v

node   name  active queue rejected
node-1 write 2      0     0
node-2 write 1      0     0
```

**Cat Health**：

```bash
GET /_cat/health?v

epoch      timestamp cluster    status node.total node.data shards pri relo init unassign
1704201600 10:00:00  production green  5          3         100    50  0    0    0
```

### Cat API 特点

```
优势：
  - 输出简洁
  - 易于阅读
  - 适合命令行
  - 支持脚本解析

常用参数：
  - v：显示表头
  - h：指定列
  - s：排序
  - format=json：JSON 格式
```

## 实战案例

### 案例1：诊断 Yellow 状态

```bash
# 1. 检查集群健康
GET /_cluster/health

{
  "status": "yellow",
  "unassigned_shards": 5
}

# 2. 查看未分配分片
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason

index    shard prirep state       unassigned.reason
products 0     r      UNASSIGNED  NODE_LEFT

# 3. 查看分配解释
GET /_cluster/allocation/explain
{
  "index": "products",
  "shard": 0,
  "primary": false
}

# 原因：节点数不足，副本无法分配
# 解决：增加节点 或 减少副本数

PUT /products/_settings
{
  "number_of_replicas": 0
}
```

### 案例2：监控集群性能

```bash
# 1. 查看节点负载
GET /_cat/nodes?v&h=name,cpu,heap.percent,ram.percent,load_1m

# 2. 查看索引性能
GET /_nodes/stats/indices/indexing

# 3. 查看查询性能
GET /_nodes/stats/indices/search

# 4. 检查线程池
GET /_cat/thread_pool/write,search?v

# 5. 查看拒绝情况
GET /_nodes/stats/thread_pool
```

### 案例3：取消长时间运行的查询

```bash
# 1. 查看当前任务
GET /_tasks?detailed=true

# 2. 找到耗时查询
{
  "nodes": {
    "node-1": {
      "tasks": {
        "node-1:12345": {
          "action": "indices:data/read/search",
          "running_time_in_nanos": 60000000000  # 60秒
        }
      }
    }
  }
}

# 3. 取消任务
POST /_tasks/node-1:12345/_cancel
```

## Cluster APIs 最佳实践

### 监控关键指标

```
集群级别：
  ✓ Cluster Health（status）
  ✓ 未分配分片数（unassigned_shards）
  ✓ 集群统计（Cluster Stats）

节点级别：
  ✓ JVM 堆内存（heap.percent）
  ✓ CPU 使用率（cpu）
  ✓ 系统负载（load_1m）
  ✓ 线程池拒绝率

性能指标：
  ✓ 索引速率
  ✓ 查询速率
  ✓ 平均延迟
```

### 定期巡检

```bash
#!/bin/bash
# cluster_check.sh

echo "=== Cluster Health ==="
curl -s "http://localhost:9200/_cluster/health?pretty"

echo "=== Nodes Status ==="
curl -s "http://localhost:9200/_cat/nodes?v"

echo "=== Disk Usage ==="
curl -s "http://localhost:9200/_cat/allocation?v"

echo "=== Thread Pool ==="
curl -s "http://localhost:9200/_cat/thread_pool/write,search?v"
```

### 告警规则

```
关键告警：
  - status = red
  - unassigned_shards > 0
  - heap.percent > 85%
  - disk.percent > 85%
  - thread_pool.rejected > 0

警告告警：
  - status = yellow（持续 30 分钟）
  - heap.percent > 75%
  - cpu > 70%
  - load_1m > CPU 核心数
```

## 总结

**集群健康**：
- Cluster Health API：集群状态
- 支持等待特定状态
- Green/Yellow/Red 状态

**集群信息**：
- Cluster State API：完整状态
- Cluster Stats API：统计信息
- 用于容量规划

**节点管理**：
- Nodes Info API：节点信息
- Nodes Stats API：节点统计
- 性能监控

**任务管理**：
- Task Management API：查看/取消任务
- 管理长时间运行的任务

**诊断工具**：
- Allocation Explain API：分片分配诊断
- 解决 Yellow/Red 问题

**Cat APIs**：
- 轻量级查询
- 易于阅读
- 适合命令行和脚本

**最佳实践**：
- 定期监控关键指标
- 配置告警规则
- 定期巡检
- 诊断问题

**下一步**：学习 Snapshot 与 Restore APIs，掌握备份恢复接口。

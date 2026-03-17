# 索引管理基础

## 概述

索引是 Elasticsearch 中数据的逻辑容器，掌握索引的完整生命周期管理（创建、配置、状态查询、删除、打开/关闭）是日常运维的基础技能。

## 索引的创建

### 显式创建索引

```bash
# 创建索引（最基本）
PUT /products

# 创建索引并指定配置
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "price": { "type": "double" },
      "category": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}
```

### 自动创建索引

```bash
# 写入文档时自动创建索引
POST /auto_index/_doc/1
{
  "title": "Auto Created"
}

# 响应：索引自动创建
```

**控制自动创建**：

```bash
# 禁用自动创建索引
PUT /_cluster/settings
{
  "persistent": {
    "action.auto_create_index": "false"
  }
}

# 允许特定模式的索引自动创建
PUT /_cluster/settings
{
  "persistent": {
    "action.auto_create_index": "+logs-*,-temp-*,+*"
  }
}
# +logs-*: 允许 logs- 开头的索引
# -temp-*: 禁止 temp- 开头的索引
# +*: 允许其他索引
```

**最佳实践**：
- 生产环境禁用自动创建（`false`）
- 显式创建索引，预先定义映射和配置

### 索引命名规范

**命名规则**：
- 必须小写
- 不能包含：`\`, `/`, `*`, `?`, `"`, `<`, `>`, `|`, ` ` (空格), `,`, `#`
- 不能以 `-`, `_`, `+` 开头
- 不能是 `.` 或 `..`
- 长度不超过 255 字节

**推荐命名模式**：

```
应用场景命名：
  products          # 商品
  users             # 用户
  orders            # 订单

时间序列命名：
  logs-2024.01.15   # 按日期
  metrics-2024.01   # 按月份
  events-2024-w03   # 按周

环境区分：
  products-dev      # 开发环境
  products-prod     # 生产环境

版本控制：
  products-v1       # 版本1
  products-v2       # 版本2
```

## 索引设置（Settings）

### 静态设置 vs 动态设置

**静态设置**：索引创建时指定，后续不可修改

```bash
PUT /products
{
  "settings": {
    "number_of_shards": 3,           # 静态：主分片数
    "codec": "best_compression"       # 静态：压缩算法
  }
}
```

**动态设置**：可随时修改

```bash
PUT /products/_settings
{
  "number_of_replicas": 2,           # 动态：副本数
  "refresh_interval": "30s"          # 动态：刷新间隔
}
```

### 核心索引设置

#### 分片配置

```bash
PUT /products
{
  "settings": {
    # 主分片数（静态，不可修改）
    "number_of_shards": 3,
    
    # 副本分片数（动态，可修改）
    "number_of_replicas": 1
  }
}

# 动态调整副本数
PUT /products/_settings
{
  "number_of_replicas": 2
}
```

**为什么主分片数不可修改？**

```
原因：路由算法依赖主分片数
  shard = hash(_id) % number_of_primary_shards
  
修改主分片数 → 路由失效 → 数据找不到
```

**解决方案**：使用 Reindex 重建索引

```bash
# 1. 创建新索引（新的分片数）
PUT /products_new
{
  "settings": {
    "number_of_shards": 5
  }
}

# 2. 重建索引
POST /_reindex
{
  "source": { "index": "products" },
  "dest": { "index": "products_new" }
}

# 3. 切换别名
POST /_aliases
{
  "actions": [
    { "remove": { "index": "products", "alias": "products_alias" } },
    { "add": { "index": "products_new", "alias": "products_alias" } }
  ]
}
```

#### 刷新间隔

```bash
PUT /products/_settings
{
  "refresh_interval": "1s"    # 默认1秒
}

# 其他选项
"refresh_interval": "30s"     # 30秒
"refresh_interval": "-1"      # 禁用自动刷新
"refresh_interval": null      # 恢复默认值
```

#### Translog 配置

```bash
PUT /products/_settings
{
  # 同步策略
  "index.translog.durability": "request",  # 或 "async"
  
  # Flush 阈值
  "index.translog.flush_threshold_size": "512mb",
  
  # 同步间隔（async 模式）
  "index.translog.sync_interval": "5s"
}
```

#### 分析器配置

```bash
PUT /products
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "my_stop"]
        }
      },
      "filter": {
        "my_stop": {
          "type": "stop",
          "stopwords": ["the", "a"]
        }
      }
    }
  }
}
```

### 查看索引设置

```bash
# 查看所有设置
GET /products/_settings

# 查看特定设置
GET /products/_settings/index.number_of_shards,index.number_of_replicas

# 包含默认值
GET /products/_settings?include_defaults=true

# 查看多个索引
GET /products,orders/_settings
```

## 索引状态查询

### 索引列表

```bash
# Cat API（简洁）
GET /_cat/indices?v

health status index    uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   products abc123...              3   1     100000         1000     50mb          25mb
yellow open   logs     def456...              5   1     500000         5000    200mb         100mb

# 字段说明：
# health: green/yellow/red
# status: open/close
# pri: 主分片数
# rep: 副本数
# docs.count: 文档总数
# docs.deleted: 已删除文档数
# store.size: 总大小
# pri.store.size: 主分片大小
```

**排序和过滤**：

```bash
# 按大小排序
GET /_cat/indices?v&s=store.size:desc

# 按文档数排序
GET /_cat/indices?v&s=docs.count:desc

# 筛选特定索引
GET /_cat/indices/logs-*?v

# 仅显示指定列
GET /_cat/indices?v&h=index,health,docs.count,store.size
```

### 详细索引信息

```bash
# 详细信息（JSON）
GET /products

{
  "products": {
    "aliases": {},
    "mappings": { ... },
    "settings": {
      "index": {
        "creation_date": "1705305600000",
        "number_of_shards": "3",
        "number_of_replicas": "1",
        "uuid": "abc123...",
        "version": { "created": "8120000" },
        "provided_name": "products"
      }
    }
  }
}
```

### 索引统计信息

```bash
# 索引统计
GET /products/_stats

{
  "indices": {
    "products": {
      "primaries": {
        "docs": {
          "count": 100000,
          "deleted": 1000
        },
        "store": {
          "size_in_bytes": 52428800
        },
        "indexing": {
          "index_total": 100000,
          "index_time_in_millis": 60000
        },
        "search": {
          "query_total": 50000,
          "query_time_in_millis": 30000
        }
      }
    }
  }
}

# 特定统计类型
GET /products/_stats/docs,store,indexing,search
```

### 索引是否存在

```bash
# 检查索引是否存在
HEAD /products

# 响应：
# 200: 存在
# 404: 不存在
```

## 索引的删除

### 删除单个索引

```bash
DELETE /products

# 响应
{
  "acknowledged": true
}
```

### 删除多个索引

```bash
# 使用逗号分隔
DELETE /products,orders,logs

# 使用通配符
DELETE /logs-*

# 删除所有索引（危险）
DELETE /_all
DELETE /*
```

### 防止误删除

```bash
# 禁止删除所有索引
PUT /_cluster/settings
{
  "persistent": {
    "action.destructive_requires_name": "true"
  }
}

# 启用后，以下操作会失败：
DELETE /_all    # 错误
DELETE /*       # 错误

# 必须明确指定索引名
DELETE /products  # 正确
```

### 删除前的确认

```bash
# 1. 检查索引信息
GET /products/_stats

# 2. 备份重要数据（快照）
PUT /_snapshot/my_backup/products_backup
{
  "indices": "products"
}

# 3. 确认后删除
DELETE /products
```

## 打开与关闭索引

### 关闭索引

```bash
# 关闭索引
POST /products/_close

# 响应
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "indices": {
    "products": {
      "closed": true
    }
  }
}
```

**关闭索引的影响**：
- **查询/写入**：被阻止，返回错误
- **资源占用**：释放内存，保留磁盘数据
- **分片状态**：分片关闭，不占用集群资源
- **元数据**：保留在 Cluster State

**使用场景**：
- 长期不使用的历史数据
- 节省集群资源
- 维护期间临时关闭

### 打开索引

```bash
# 打开索引
POST /products/_open

# 响应
{
  "acknowledged": true,
  "shards_acknowledged": true
}
```

**打开索引的过程**：
1. 分配分片到节点
2. 恢复分片数据
3. 索引变为可用

### 批量操作

```bash
# 关闭多个索引
POST /logs-2024.01.*/_close

# 打开所有已关闭的索引
POST /_all/_open?expand_wildcards=closed
```

## 索引生命周期管理（ILM）

### ILM 概述

**Index Lifecycle Management（ILM）**：自动管理索引的生命周期。

**生命周期阶段**：

```
Hot（热）→ Warm（温）→ Cold（冷）→ Frozen（冻结）→ Delete（删除）
```

**阶段说明**：
- **Hot**：活跃写入和查询，高性能硬件
- **Warm**：不再写入，查询较少，中等硬件
- **Cold**：很少查询，低成本硬件
- **Frozen**：极少查询，归档存储
- **Delete**：删除索引

### ILM 策略示例

```bash
# 创建 ILM 策略
PUT /_ilm/policy/logs_policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "7d",
            "max_size": "50gb"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "allocate": {
            "number_of_replicas": 1,
            "require": {
              "data": "warm"
            }
          },
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "allocate": {
            "number_of_replicas": 0,
            "require": {
              "data": "cold"
            }
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

# 应用 ILM 策略到索引模板
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

### Rollover 机制

```bash
# 创建初始索引
PUT /logs-000001
{
  "aliases": {
    "logs": {
      "is_write_index": true
    }
  }
}

# 写入数据到别名
POST /logs/_doc
{
  "message": "log entry"
}

# 触发 Rollover（手动）
POST /logs/_rollover
{
  "conditions": {
    "max_age": "7d",
    "max_docs": 1000000,
    "max_size": "50gb"
  }
}

# 响应：如果条件满足，创建 logs-000002
```

## 索引别名（Alias）

### 创建别名

```bash
# 创建别名
POST /_aliases
{
  "actions": [
    { "add": { "index": "products", "alias": "products_alias" } }
  ]
}

# 创建索引时指定别名
PUT /products
{
  "aliases": {
    "products_alias": {}
  }
}
```

### 别名用途

**1. 零停机重建索引**

```bash
# 1. 创建新索引
PUT /products_v2
{
  "mappings": { ... }
}

# 2. 重建数据
POST /_reindex
{
  "source": { "index": "products_v1" },
  "dest": { "index": "products_v2" }
}

# 3. 原子性切换别名
POST /_aliases
{
  "actions": [
    { "remove": { "index": "products_v1", "alias": "products" } },
    { "add": { "index": "products_v2", "alias": "products" } }
  ]
}
```

**2. 多索引聚合查询**

```bash
# 别名指向多个索引
POST /_aliases
{
  "actions": [
    { "add": { "index": "logs-2024.01.15", "alias": "logs_recent" } },
    { "add": { "index": "logs-2024.01.16", "alias": "logs_recent" } }
  ]
}

# 查询别名
GET /logs_recent/_search
{
  "query": { "match_all": {} }
}
```

**3. 写入别名（Write Index）**

```bash
# 指定写入索引
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "logs-000001",
        "alias": "logs",
        "is_write_index": true
      }
    }
  ]
}

# 写入到别名
POST /logs/_doc
{
  "message": "log"
}
# 实际写入到 logs-000001
```

### 过滤别名

```bash
# 创建带过滤条件的别名
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "products",
        "alias": "electronics",
        "filter": {
          "term": { "category": "electronics" }
        }
      }
    }
  ]
}

# 查询别名时自动应用过滤
GET /electronics/_search
{
  "query": { "match_all": {} }
}
# 仅返回 category=electronics 的文档
```

## 监控索引状态

### 关键指标

```bash
# 文档数量
GET /_cat/indices?v&h=index,docs.count,docs.deleted

# 存储大小
GET /_cat/indices?v&h=index,store.size,pri.store.size

# 分片分布
GET /_cat/shards/products?v

# 索引健康状态
GET /_cluster/health/products?level=indices
```

### 告警建议

```
告警规则：
1. 索引状态从 Green 变为 Yellow 或 Red
2. 单索引大小 > 100GB（考虑拆分）
3. 删除文档比例 > 30%（考虑 Force Merge）
4. 分片数量 > 1000（考虑减少索引数量）
5. 查询延迟 P95 > 1s
```

## 最佳实践

### 1. 分片数量规划

```
单分片大小：20-40GB（建议）
节点分片数：每 GB 堆内存 ≤ 20 个分片

示例：
  数据量：500GB
  单分片：30GB
  主分片数 = 500 / 30 ≈ 17
  
  节点堆内存：16GB
  最大分片数 = 16 × 20 = 320
  节点数 = (17主 + 17副) / 320 = 1（单节点可承载）
```

### 2. 副本数量配置

```
最小副本数：1（高可用）
推荐副本数：1-2

场景：
  - 开发环境：0（节省资源）
  - 生产环境：1-2（高可用）
  - 关键数据：2（更高可用性）
```

### 3. 索引命名规范

```
推荐模式：
  {应用}-{环境}-{版本}
  products-prod-v1
  
  {类型}-{日期}
  logs-2024.01.15
  
  {业务}-{类型}
  order-summary
```

### 4. 定期维护

```bash
# 1. 查看索引统计
GET /products/_stats

# 2. 删除过期索引
DELETE /logs-2024.01.01

# 3. Force Merge 历史索引
POST /logs-2024.01.15/_forcemerge?max_num_segments=1

# 4. 清理快照
DELETE /_snapshot/my_backup/old_snapshot
```

## 总结

**索引创建**：
- 显式创建（推荐）vs 自动创建
- 预先定义 mappings 和 settings

**索引设置**：
- **静态设置**：`number_of_shards`（不可修改）
- **动态设置**：`number_of_replicas`、`refresh_interval`（可修改）

**主分片数不可修改原因**：
- 路由算法依赖：`hash(_id) % num_shards`
- 解决方案：Reindex 重建索引

**副本数动态调整**：
- 随时修改，无需重建索引
- 根据负载和可用性需求调整

**索引生命周期管理（ILM）**：
- Hot → Warm → Cold → Delete
- 自动化索引管理
- Rollover 机制

**索引别名**：
- 零停机重建索引
- 多索引聚合查询
- 写入别名

**最佳实践**：
- 合理规划分片数量（单分片 20-40GB）
- 使用别名实现灵活的索引管理
- 定期维护：Force Merge、删除过期索引
- 生产环境禁用自动创建索引

**下一步**：学习映射（Mapping）设计，掌握字段类型和索引策略。

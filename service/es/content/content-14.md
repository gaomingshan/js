# 索引模板与别名

## 概述

索引模板（Index Templates）和索引别名（Index Aliases）是 Elasticsearch 中重要的索引管理工具。模板用于自动化索引创建和配置，别名用于实现零停机重建索引和灵活的索引管理。

## 索引模板（Index Templates）

### 模板的作用

**自动应用预定义的配置到新创建的索引**。

```
场景：每日日志索引
  logs-2024.01.15
  logs-2024.01.16
  logs-2024.01.17
  ...

问题：每个索引都需要相同的配置（分片数、映射）

解决：使用索引模板，自动应用配置
```

### 创建索引模板

```json
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "refresh_interval": "30s"
    },
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text" },
        "host": { "type": "keyword" }
      }
    },
    "aliases": {
      "logs": {}
    }
  },
  "priority": 100
}
```

**字段说明**：
- **index_patterns**：匹配哪些索引名（支持通配符）
- **template**：应用的配置（settings、mappings、aliases）
- **priority**：优先级（数字越大优先级越高）

### 模板匹配规则

```json
# 模板1：优先级 100
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "priority": 100,
  "template": {
    "settings": { "number_of_shards": 3 }
  }
}

# 模板2：优先级 200（更高）
PUT /_index_template/logs_prod_template
{
  "index_patterns": ["logs-prod-*"],
  "priority": 200,
  "template": {
    "settings": { "number_of_shards": 5 }
  }
}

# 创建索引
PUT /logs-prod-2024.01.15

# 结果：匹配模板2（优先级更高）
# number_of_shards = 5
```

**优先级规则**：
- 多个模板匹配时，使用优先级最高的
- 相同优先级时，配置会合并

### 查看和管理模板

```bash
# 查看所有模板
GET /_index_template

# 查看特定模板
GET /_index_template/logs_template

# 删除模板
DELETE /_index_template/logs_template

# 模拟模板匹配
POST /_index_template/_simulate_index/logs-2024.01.15

# 模拟模板效果
POST /_index_template/_simulate/logs_template
```

### 组件模板（Component Templates）

**可复用的模板片段**（ES 7.8+）。

```json
# 1. 创建组件模板：分片配置
PUT /_component_template/shard_settings
{
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1
    }
  }
}

# 2. 创建组件模板：日期字段
PUT /_component_template/timestamp_mappings
{
  "template": {
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "created_at": { "type": "date" }
      }
    }
  }
}

# 3. 创建索引模板，组合组件模板
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "composed_of": ["shard_settings", "timestamp_mappings"],
  "template": {
    "mappings": {
      "properties": {
        "message": { "type": "text" }
      }
    }
  }
}
```

**优势**：
- 配置复用
- 模块化管理
- 易于维护

### 动态模板（Dynamic Templates）

**根据字段名称或类型动态应用映射**。

```json
PUT /my_index
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_keywords": {
          "match_mapping_type": "string",
          "mapping": {
            "type": "keyword"
          }
        }
      },
      {
        "longs_as_integers": {
          "match_mapping_type": "long",
          "mapping": {
            "type": "integer"
          }
        }
      },
      {
        "strings_starting_with_num": {
          "match": "num_*",
          "unmatch": "*_text",
          "mapping": {
            "type": "long"
          }
        }
      }
    ]
  }
}

# 插入文档
POST /my_index/_doc/1
{
  "name": "Alice",           # 匹配 strings_as_keywords → keyword
  "num_value": "123",        # 匹配 strings_starting_with_num → long
  "description_text": "..."  # 不匹配（unmatch）
}
```

**匹配规则**：
- **match**：字段名匹配模式
- **unmatch**：字段名不匹配模式
- **match_mapping_type**：字段类型匹配
- **path_match** / **path_unmatch**：嵌套字段路径匹配

**使用场景**：
- 自动将所有字符串字段设为 keyword
- 将特定前缀的字段设为特定类型
- 处理动态字段结构

## 索引别名（Index Aliases）

### 别名的作用

1. **零停机重建索引**
2. **多索引聚合查询**
3. **读写分离**
4. **过滤视图**

### 创建别名

```bash
# 方式1：创建索引时指定
PUT /products_v1
{
  "aliases": {
    "products": {}
  }
}

# 方式2：通过 _aliases API
POST /_aliases
{
  "actions": [
    { "add": { "index": "products_v1", "alias": "products" } }
  ]
}

# 方式3：单索引别名操作
PUT /products_v1/_alias/products
```

### 查看别名

```bash
# 查看所有别名
GET /_cat/aliases?v

alias    index        filter routing.index routing.search is_write_index
products products_v1  -      -             -              -

# 查看特定别名
GET /_alias/products

# 查看索引的别名
GET /products_v1/_alias
```

### 零停机重建索引

**场景**：修改映射，需要重建索引

```bash
# 1. 创建新索引（新映射）
PUT /products_v2
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "price": { "type": "double" },  # 原来是 long，改为 double
      "category": { "type": "keyword" }
    }
  }
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

# 4. 验证
GET /products/_search

# 5. 删除旧索引（可选）
DELETE /products_v1
```

**优势**：
- 应用始终使用别名 `products`
- 切换瞬间完成，无停机时间
- 可回滚（重新切换别名）

### 多索引别名

**将多个索引聚合到一个别名**：

```bash
# 创建别名指向多个索引
POST /_aliases
{
  "actions": [
    { "add": { "index": "logs-2024.01.15", "alias": "logs_recent" } },
    { "add": { "index": "logs-2024.01.16", "alias": "logs_recent" } },
    { "add": { "index": "logs-2024.01.17", "alias": "logs_recent" } }
  ]
}

# 查询别名（查询所有3个索引）
GET /logs_recent/_search
{
  "query": { "match_all": {} }
}
```

**使用场景**：
- 查询最近N天的日志
- 聚合多个时间段的数据

### 写入别名（Write Index）

**指定哪个索引接收写入**：

```bash
# 设置写入索引
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "logs-2024.01.15",
        "alias": "logs_write",
        "is_write_index": true
      }
    }
  ]
}

# 写入到别名
POST /logs_write/_doc
{
  "message": "log entry"
}
# 实际写入到 logs-2024.01.15

# 切换写入索引（如日期滚动）
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "logs-2024.01.16",
        "alias": "logs_write",
        "is_write_index": true
      }
    },
    {
      "add": {
        "index": "logs-2024.01.15",
        "alias": "logs_write",
        "is_write_index": false
      }
    }
  ]
}
```

### 过滤别名（Filtered Aliases）

**创建带过滤条件的别名**：

```bash
# 创建过滤别名
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
    },
    {
      "add": {
        "index": "products",
        "alias": "books",
        "filter": {
          "term": { "category": "books" }
        }
      }
    }
  ]
}

# 查询别名（自动应用过滤）
GET /electronics/_search
{
  "query": { "match_all": {} }
}
# 仅返回 category=electronics 的文档

GET /books/_search
{
  "query": { "match_all": {} }
}
# 仅返回 category=books 的文档
```

**使用场景**：
- 多租户数据隔离
- 数据权限控制
- 简化查询逻辑

### 路由别名

**指定别名的路由参数**：

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "orders",
        "alias": "user_123_orders",
        "routing": "user_123"
      }
    }
  ]
}

# 查询时自动使用路由
GET /user_123_orders/_search
{
  "query": { "match_all": {} }
}
# 仅查询 routing=user_123 的分片
```

## 时间序列数据的索引设计

### Rollover 索引滚动

**自动创建新索引**：

```bash
# 1. 创建初始索引
PUT /logs-000001
{
  "aliases": {
    "logs_write": {
      "is_write_index": true
    },
    "logs": {}
  }
}

# 2. 写入数据到别名
POST /logs_write/_doc
{
  "message": "log entry"
}

# 3. 触发 Rollover（手动）
POST /logs_write/_rollover
{
  "conditions": {
    "max_age": "7d",
    "max_docs": 1000000,
    "max_size": "50gb"
  }
}

# 响应：如果满足条件，创建 logs-000002
{
  "old_index": "logs-000001",
  "new_index": "logs-000002",
  "rolled_over": true,
  "conditions": {
    "[max_age: 7d]": false,
    "[max_docs: 1000000]": true,  # 满足条件
    "[max_size: 50gb]": false
  }
}
```

**Rollover 条件**：
- **max_age**：索引存在时间
- **max_docs**：文档数量
- **max_size**：索引大小

**自动 Rollover**（配合 ILM）：

```json
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
      }
    }
  }
}
```

### 索引命名模式

**推荐模式**：

```
时间序列（按日期）：
  logs-2024.01.15
  logs-2024.01.16
  
时间序列（按月）：
  logs-2024.01
  logs-2024.02
  
滚动索引：
  logs-000001
  logs-000002
  ...
  
版本化：
  products-v1
  products-v2
```

## 实战案例

### 案例1：电商商品索引

```bash
# 1. 创建组件模板：通用设置
PUT /_component_template/common_settings
{
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "refresh_interval": "1s"
    }
  }
}

# 2. 创建索引模板
PUT /_index_template/products_template
{
  "index_patterns": ["products-*"],
  "composed_of": ["common_settings"],
  "template": {
    "mappings": {
      "properties": {
        "name": {
          "type": "text",
          "analyzer": "ik_max_word",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "price": { "type": "double" },
        "category": { "type": "keyword" },
        "tags": { "type": "keyword" },
        "created_at": { "type": "date" }
      }
    },
    "aliases": {
      "products": {}
    }
  }
}

# 3. 创建索引（自动应用模板）
PUT /products-v1

# 4. 写入数据
POST /products/_doc/1
{
  "name": "iPhone 14 Pro",
  "price": 7999,
  "category": "electronics",
  "tags": ["phone", "apple"],
  "created_at": "2024-01-15"
}

# 5. 重建索引（修改映射）
PUT /products-v2
POST /_reindex
{
  "source": { "index": "products-v1" },
  "dest": { "index": "products-v2" }
}

# 6. 切换别名
POST /_aliases
{
  "actions": [
    { "remove": { "index": "products-v1", "alias": "products" } },
    { "add": { "index": "products-v2", "alias": "products" } }
  ]
}
```

### 案例2：每日日志索引

```bash
# 1. 创建索引模板
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 5,
      "number_of_replicas": 1,
      "refresh_interval": "30s",
      "index.lifecycle.name": "logs_policy",
      "index.lifecycle.rollover_alias": "logs_write"
    },
    "mappings": {
      "properties": {
        "timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text", "analyzer": "standard" },
        "host": { "type": "keyword" },
        "ip": { "type": "ip" }
      }
    }
  }
}

# 2. 创建初始索引
PUT /logs-2024.01.15
{
  "aliases": {
    "logs_write": { "is_write_index": true },
    "logs": {}
  }
}

# 3. 写入日志
POST /logs_write/_doc
{
  "timestamp": "2024-01-15T10:30:00",
  "level": "ERROR",
  "message": "Connection timeout",
  "host": "server-1",
  "ip": "192.168.1.100"
}

# 4. 每日滚动（定时任务）
# Cron: 0 0 * * * curl -X POST "localhost:9200/logs_write/_rollover"

# 5. 查询最近7天日志
GET /logs/_search
{
  "query": {
    "range": {
      "timestamp": {
        "gte": "now-7d"
      }
    }
  }
}
```

## 最佳实践

### 1. 使用模板标准化配置

```
- 生产环境：所有索引使用模板
- 集中管理：配置、映射、别名
- 版本控制：模板更新要测试
```

### 2. 别名命名规范

```
读别名：
  products              # 主别名
  products_read         # 读别名

写别名：
  products_write        # 写别名

过滤别名：
  products_electronics  # 电子产品
  products_books        # 图书
```

### 3. 时间序列索引管理

```
- 使用 Rollover 自动滚动
- 配合 ILM 管理生命周期
- 定期删除过期索引
```

### 4. 索引版本管理

```
命名：
  products-v1
  products-v2
  
别名：
  products → products-v1
  
升级：
  创建 products-v2
  重建数据
  切换别名
  删除 products-v1
```

## 总结

**索引模板**：
- **作用**：自动应用配置到新索引
- **组件模板**：可复用的配置片段
- **动态模板**：根据字段名/类型动态映射

**索引别名**：
- **零停机重建**：原子性切换别名
- **多索引聚合**：一个别名指向多个索引
- **写入别名**：指定写入目标索引
- **过滤别名**：数据视图和权限控制

**Rollover 机制**：
- 自动创建新索引
- 基于条件触发（时间、文档数、大小）
- 配合 ILM 自动管理

**最佳实践**：
- 生产环境使用模板标准化配置
- 使用别名实现灵活的索引管理
- 时间序列数据使用 Rollover
- 索引重建使用别名实现零停机

**下一步**：学习 Query DSL 核心语法，掌握 Elasticsearch 的查询语言。

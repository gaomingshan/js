# Indices APIs

## 概述

Indices APIs 用于管理索引的创建、删除、查询、映射和设置等操作。掌握这些 API 是进行索引管理的基础。

## Create Index API

### 创建索引

**基本创建**：

```bash
PUT /products
```

**带配置创建**：

```bash
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "refresh_interval": "1s"
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "price": {
        "type": "float"
      },
      "created_at": {
        "type": "date"
      }
    }
  },
  "aliases": {
    "products_alias": {}
  }
}
```

### 索引已存在处理

```bash
PUT /products

# 响应（索引已存在）
{
  "error": {
    "type": "resource_already_exists_exception",
    "reason": "index [products/abc123] already exists"
  }
}
```

**避免错误**：

```bash
PUT /products?include_type_name=false
{
  "settings": { ... }
}

# 或先检查索引是否存在
HEAD /products
```

## Delete Index API

### 删除索引

```bash
DELETE /products

# 响应
{
  "acknowledged": true
}
```

### 删除多个索引

```bash
# 通配符删除
DELETE /logs-2023-*

# 删除多个指定索引
DELETE /products,orders,users
```

### 删除所有索引（危险）

```bash
DELETE /*

# 或
DELETE /_all
```

**保护措施**：

```yaml
# elasticsearch.yml
action.destructive_requires_name: true
```

配置后，必须指定具体索引名，不能使用 `*` 或 `_all`

## Get Index API

### 获取索引信息

```bash
GET /products

# 响应
{
  "products": {
    "aliases": {},
    "mappings": {
      "properties": {
        "name": { "type": "text" },
        "price": { "type": "float" }
      }
    },
    "settings": {
      "index": {
        "number_of_shards": "3",
        "number_of_replicas": "1",
        "creation_date": "1704201600000",
        "uuid": "abc123",
        "version": {
          "created": "8010099"
        }
      }
    }
  }
}
```

### 获取多个索引

```bash
GET /products,orders

# 或使用通配符
GET /logs-*
```

### 仅获取特定信息

```bash
# 仅获取 mappings
GET /products/_mapping

# 仅获取 settings
GET /products/_settings

# 仅获取 aliases
GET /products/_alias
```

## Index Exists API

### 检查索引是否存在

```bash
HEAD /products

# 存在：返回 200
# 不存在：返回 404
```

**使用场景**：

```java
// 创建索引前检查
if (!client.indices().exists(new GetIndexRequest("products"))) {
    client.indices().create(new CreateIndexRequest("products"));
}
```

## Open/Close Index API

### 关闭索引

```bash
POST /products/_close

# 响应
{
  "acknowledged": true,
  "shards_acknowledged": true
}
```

**关闭后的效果**：
- 不可读写
- 释放内存资源
- 保留磁盘数据

### 打开索引

```bash
POST /products/_open

# 响应
{
  "acknowledged": true,
  "shards_acknowledged": true
}
```

### 使用场景

```
适用场景：
  - 临时禁用索引
  - 节省资源
  - 维护期间

示例：
  - 历史数据索引（不常用）
  - 定期关闭旧索引
  - 维护时关闭索引
```

## Put/Get Mapping API

### 创建映射

```bash
PUT /products/_mapping
{
  "properties": {
    "description": {
      "type": "text",
      "analyzer": "ik_max_word"
    },
    "tags": {
      "type": "keyword"
    }
  }
}
```

**注意**：只能新增字段，不能修改已有字段类型

### 获取映射

```bash
GET /products/_mapping

# 响应
{
  "products": {
    "mappings": {
      "properties": {
        "name": { "type": "text" },
        "price": { "type": "float" },
        "description": { "type": "text" }
      }
    }
  }
}
```

### 获取特定字段映射

```bash
GET /products/_mapping/field/name

# 响应
{
  "products": {
    "mappings": {
      "name": {
        "full_name": "name",
        "mapping": {
          "name": {
            "type": "text"
          }
        }
      }
    }
  }
}
```

### 更新映射（仅新增字段）

```bash
# ✅ 新增字段
PUT /products/_mapping
{
  "properties": {
    "stock": {
      "type": "integer"
    }
  }
}

# ❌ 修改字段类型（报错）
PUT /products/_mapping
{
  "properties": {
    "price": {
      "type": "integer"  # 原类型是 float
    }
  }
}
```

**修改字段类型的方法**：
1. 创建新索引（新映射）
2. Reindex 数据
3. 切换别名
4. 删除旧索引

## Update Settings API

### 更新索引设置

```bash
PUT /products/_settings
{
  "number_of_replicas": 2,
  "refresh_interval": "30s"
}
```

### 可动态修改的设置

```bash
PUT /products/_settings
{
  "number_of_replicas": 2,           # 副本数
  "refresh_interval": "30s",         # 刷新间隔
  "index.max_result_window": 20000,  # 最大结果窗口
  "index.translog.durability": "async"
}
```

### 不可动态修改的设置

```
不可修改：
  - number_of_shards（主分片数）
  - codec（压缩算法）
  
修改方法：
  1. 创建新索引
  2. Reindex 数据
```

### 获取设置

```bash
GET /products/_settings

# 响应
{
  "products": {
    "settings": {
      "index": {
        "number_of_shards": "3",
        "number_of_replicas": "2",
        "refresh_interval": "30s"
      }
    }
  }
}
```

## Index Aliases API

### 添加别名

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "products",
        "alias": "products_alias"
      }
    }
  ]
}
```

### 删除别名

```bash
POST /_aliases
{
  "actions": [
    {
      "remove": {
        "index": "products",
        "alias": "products_alias"
      }
    }
  ]
}
```

### 原子切换别名

```bash
POST /_aliases
{
  "actions": [
    {
      "remove": {
        "index": "products_v1",
        "alias": "products"
      }
    },
    {
      "add": {
        "index": "products_v2",
        "alias": "products"
      }
    }
  ]
}
```

**用途**：零停机索引切换

### 过滤别名

```bash
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "products",
        "alias": "active_products",
        "filter": {
          "term": {
            "status": "active"
          }
        }
      }
    }
  ]
}

# 查询别名（自动应用过滤）
GET /active_products/_search
{
  "query": {
    "match_all": {}
  }
}
# 只返回 status=active 的文档
```

### 写入别名

```bash
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
```

### 获取别名

```bash
# 获取索引的所有别名
GET /products/_alias

# 获取特定别名
GET /products/_alias/products_alias

# 获取所有别名
GET /_alias
```

## 实战案例

### 案例1：零停机索引重建

```bash
# 1. 创建新索引（优化映射）
PUT /products_v2
{
  "settings": {
    "number_of_shards": 5
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "price": {
        "type": "scaled_float",
        "scaling_factor": 100
      }
    }
  }
}

# 2. Reindex 数据
POST /_reindex
{
  "source": {
    "index": "products_v1"
  },
  "dest": {
    "index": "products_v2"
  }
}

# 3. 原子切换别名
POST /_aliases
{
  "actions": [
    {
      "remove": {
        "index": "products_v1",
        "alias": "products"
      }
    },
    {
      "add": {
        "index": "products_v2",
        "alias": "products"
      }
    }
  ]
}

# 4. 验证
GET /products/_search

# 5. 删除旧索引
DELETE /products_v1
```

### 案例2：按日期滚动索引

```bash
# 1. 创建今天的索引
PUT /logs-2024.01.15
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "message": { "type": "text" },
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" }
    }
  },
  "aliases": {
    "logs": {},
    "logs_write": {
      "is_write_index": true
    }
  }
}

# 2. 写入数据（使用别名）
POST /logs_write/_doc
{
  "message": "Application started",
  "timestamp": "2024-01-15T10:00:00",
  "level": "INFO"
}

# 3. 第二天创建新索引
PUT /logs-2024.01.16
{
  "settings": { ... },
  "aliases": {
    "logs": {}
  }
}

# 4. 切换写入别名
POST /_aliases
{
  "actions": [
    {
      "remove": {
        "index": "logs-2024.01.15",
        "alias": "logs_write"
      }
    },
    {
      "add": {
        "index": "logs-2024.01.16",
        "alias": "logs_write",
        "is_write_index": true
      }
    }
  ]
}

# 5. 定期删除旧索引
DELETE /logs-2024.01.01
```

### 案例3：修改字段类型

```bash
# 问题：price 字段原类型是 float，需改为 scaled_float

# 1. 创建新索引
PUT /products_new
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "price": {
        "type": "scaled_float",
        "scaling_factor": 100
      }
    }
  }
}

# 2. Reindex（转换数据）
POST /_reindex
{
  "source": {
    "index": "products"
  },
  "dest": {
    "index": "products_new"
  }
}

# 3. 验证数据
GET /products_new/_count

# 4. 切换别名
POST /_aliases
{
  "actions": [
    { "remove": { "index": "products", "alias": "products_alias" } },
    { "add": { "index": "products_new", "alias": "products_alias" } }
  ]
}

# 5. 删除旧索引
DELETE /products
```

## Indices APIs 最佳实践

### 索引命名规范

```
推荐命名：
  - 使用小写字母
  - 使用中划线分隔：products-2024-01
  - 避免特殊字符
  - 包含版本号：products_v1

时间序列索引：
  - 日志：logs-2024.01.15
  - 指标：metrics-2024.01.15
```

### 索引设置规范

```bash
# 生产环境推荐配置
PUT /products
{
  "settings": {
    "number_of_shards": 5,           # 根据数据量规划
    "number_of_replicas": 1,         # 至少 1 个副本
    "refresh_interval": "1s",        # 默认即可
    "index.translog.durability": "request",  # 数据安全
    "index.codec": "best_compression"  # 冷数据压缩
  }
}
```

### 别名使用规范

```
✓ 使用别名而非直接索引名
✓ 读写分离别名
✓ 版本化索引 + 别名
✓ 过滤别名用于权限控制
```

### 避免的操作

```
❌ 直接删除所有索引（DELETE /*）
❌ 频繁修改 settings
❌ 修改主分片数
❌ 在生产环境直接修改映射
```

## 总结

**索引创建**：
- Create Index API：创建索引
- 支持 settings、mappings、aliases
- 索引已存在时报错

**索引删除**：
- Delete Index API：删除索引
- 支持通配符
- 配置保护避免误删

**索引查询**：
- Get Index API：获取索引信息
- Index Exists API：检查存在性
- 支持获取 mappings、settings、aliases

**索引状态**：
- Open/Close Index API：打开/关闭索引
- 关闭后释放资源

**映射管理**：
- Put Mapping API：新增字段
- Get Mapping API：获取映射
- 不能修改已有字段类型

**设置管理**：
- Update Settings API：更新设置
- 部分设置可动态修改
- 主分片数不可修改

**别名管理**：
- Index Aliases API：管理别名
- 支持过滤别名、写入别名
- 零停机索引切换

**最佳实践**：
- 使用别名
- 版本化索引
- 合理命名
- 避免误删

**下一步**：学习 Cluster APIs，掌握集群管理接口。

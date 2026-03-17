# Document APIs

## 概述

Document APIs 是 Elasticsearch 最常用的接口，用于单文档和批量文档的增删改查操作。掌握这些 API 是使用 ES 的基础。

## Index API

### 单文档索引

**指定 ID**：

```bash
PUT /products/_doc/1
{
  "name": "iPhone 14 Pro",
  "price": 7999,
  "category": "electronics",
  "stock": 100
}

# 响应
{
  "_index": "products",
  "_id": "1",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 2,
    "failed": 0
  }
}
```

**自动生成 ID**：

```bash
POST /products/_doc
{
  "name": "iPad Pro",
  "price": 6999
}

# 响应
{
  "_id": "qwer1234asdf",  # 自动生成的 ID
  "result": "created"
}
```

### 覆盖 vs 创建

**覆盖文档（PUT）**：

```bash
# 无论文档是否存在，都会覆盖
PUT /products/_doc/1
{
  "name": "iPhone 15 Pro"
}
```

**仅创建（op_type=create）**：

```bash
# 文档存在时返回错误
PUT /products/_create/1
{
  "name": "iPhone 14 Pro"
}

# 或使用 _create 端点
POST /products/_doc/1?op_type=create
{
  "name": "iPhone 14 Pro"
}

# 文档已存在时响应
{
  "error": {
    "type": "version_conflict_engine_exception",
    "reason": "[1]: version conflict, document already exists"
  }
}
```

### 路由参数

```bash
# 自定义路由
PUT /orders/_doc/1?routing=user_123
{
  "user_id": "user_123",
  "product": "iPhone",
  "amount": 7999
}

# 查询时也需要指定路由
GET /orders/_doc/1?routing=user_123
```

**路由作用**：
- 相关文档分配到同一分片
- 查询时只需查询一个分片
- 提升查询性能

## Get API

### 根据 ID 获取文档

```bash
GET /products/_doc/1

# 响应
{
  "_index": "products",
  "_id": "1",
  "_version": 1,
  "_seq_no": 0,
  "_primary_term": 1,
  "found": true,
  "_source": {
    "name": "iPhone 14 Pro",
    "price": 7999
  }
}
```

### 仅获取部分字段

```bash
GET /products/_doc/1?_source=name,price

# 或使用 _source_includes
GET /products/_doc/1?_source_includes=name,price

# 排除字段
GET /products/_doc/1?_source_excludes=stock
```

### 禁用 _source

```bash
# 不返回 _source
GET /products/_doc/1?_source=false

# 响应
{
  "_index": "products",
  "_id": "1",
  "found": true
  # 无 _source 字段
}
```

### 文档不存在

```bash
GET /products/_doc/999

# 响应
{
  "_index": "products",
  "_id": "999",
  "found": false
}
```

## Update API

### 部分更新

```bash
POST /products/_update/1
{
  "doc": {
    "price": 6999,
    "stock": 50
  }
}

# 响应
{
  "_index": "products",
  "_id": "1",
  "_version": 2,
  "result": "updated"
}
```

**注意**：Update API 实际是读取 → 修改 → 写入的过程

### 脚本更新

**增加库存**：

```bash
POST /products/_update/1
{
  "script": {
    "source": "ctx._source.stock += params.count",
    "params": {
      "count": 10
    }
  }
}
```

**条件更新**：

```bash
POST /products/_update/1
{
  "script": {
    "source": """
      if (ctx._source.stock < 10) {
        ctx._source.status = 'low_stock'
      }
    """
  }
}
```

**删除字段**：

```bash
POST /products/_update/1
{
  "script": "ctx._source.remove('discount')"
}
```

### Upsert

**文档不存在时创建**：

```bash
POST /products/_update/1
{
  "script": {
    "source": "ctx._source.views += 1"
  },
  "upsert": {
    "name": "New Product",
    "views": 1
  }
}
```

### 部分更新冲突

```bash
POST /products/_update/1?retry_on_conflict=3
{
  "doc": {
    "stock": 100
  }
}
```

**retry_on_conflict**：版本冲突时重试次数

## Delete API

### 删除文档

```bash
DELETE /products/_doc/1

# 响应
{
  "_index": "products",
  "_id": "1",
  "_version": 3,
  "result": "deleted"
}
```

### 删除不存在的文档

```bash
DELETE /products/_doc/999

# 响应
{
  "result": "not_found"
}
```

### 删除后查询

```bash
GET /products/_doc/1

# 响应
{
  "found": false
}
```

**注意**：删除是标记删除，实际空间在 Merge 时释放

## Bulk API

### 批量操作

```bash
POST /_bulk
{ "index": { "_index": "products", "_id": "1" } }
{ "name": "iPhone 14", "price": 5999 }
{ "create": { "_index": "products", "_id": "2" } }
{ "name": "iPad Pro", "price": 6999 }
{ "update": { "_index": "products", "_id": "1" } }
{ "doc": { "price": 5799 } }
{ "delete": { "_index": "products", "_id": "3" } }
```

### 操作类型

**index**：创建或覆盖

```bash
{ "index": { "_index": "products", "_id": "1" } }
{ "name": "iPhone" }
```

**create**：仅创建

```bash
{ "create": { "_index": "products", "_id": "2" } }
{ "name": "iPad" }
```

**update**：部分更新

```bash
{ "update": { "_index": "products", "_id": "1" } }
{ "doc": { "price": 5999 } }
```

**delete**：删除

```bash
{ "delete": { "_index": "products", "_id": "3" } }
```

### Bulk 响应

```bash
{
  "took": 30,
  "errors": false,
  "items": [
    {
      "index": {
        "_index": "products",
        "_id": "1",
        "_version": 1,
        "result": "created",
        "status": 201
      }
    },
    {
      "create": {
        "_index": "products",
        "_id": "2",
        "status": 409,
        "error": {
          "type": "version_conflict_engine_exception"
        }
      }
    }
  ]
}
```

**错误处理**：

```
errors: true 表示有失败项
遍历 items 数组，检查每项的 status
2xx：成功
4xx/5xx：失败
```

### Bulk 最佳实践

**批次大小**：

```
推荐：5-15 MB
文档数：500-5000 条

测试方法：
1. 从 1000 条开始
2. 测试不同批次大小
3. 选择最优值
```

**并发控制**：

```java
// 伪代码
ExecutorService executor = Executors.newFixedThreadPool(4);

for (List<Doc> batch : batches) {
    executor.submit(() -> bulkIndex(batch));
}
```

## Multi-Get API

### 批量获取

```bash
GET /_mget
{
  "docs": [
    {
      "_index": "products",
      "_id": "1"
    },
    {
      "_index": "products",
      "_id": "2"
    },
    {
      "_index": "orders",
      "_id": "100"
    }
  ]
}
```

### 同一索引批量获取

```bash
GET /products/_mget
{
  "docs": [
    { "_id": "1" },
    { "_id": "2" },
    { "_id": "3" }
  ]
}

# 或简化形式
GET /products/_mget
{
  "ids": ["1", "2", "3"]
}
```

### 指定返回字段

```bash
GET /products/_mget
{
  "docs": [
    {
      "_id": "1",
      "_source": ["name", "price"]
    },
    {
      "_id": "2",
      "_source": false
    }
  ]
}
```

### Multi-Get 响应

```bash
{
  "docs": [
    {
      "_index": "products",
      "_id": "1",
      "found": true,
      "_source": { ... }
    },
    {
      "_index": "products",
      "_id": "999",
      "found": false
    }
  ]
}
```

## Reindex API

### 基本用法

```bash
POST /_reindex
{
  "source": {
    "index": "products_old"
  },
  "dest": {
    "index": "products_new"
  }
}
```

### 部分数据重建

```bash
POST /_reindex
{
  "source": {
    "index": "products",
    "query": {
      "range": {
        "price": {
          "gte": 1000
        }
      }
    }
  },
  "dest": {
    "index": "expensive_products"
  }
}
```

### 修改字段

```bash
POST /_reindex
{
  "source": {
    "index": "products_old"
  },
  "dest": {
    "index": "products_new"
  },
  "script": {
    "source": "ctx._source.price = ctx._source.price * 0.9"
  }
}
```

### 版本冲突处理

```bash
POST /_reindex
{
  "conflicts": "proceed",  # 忽略版本冲突
  "source": {
    "index": "products_old"
  },
  "dest": {
    "index": "products_new"
  }
}
```

### 远程 Reindex

```bash
POST /_reindex
{
  "source": {
    "remote": {
      "host": "http://old-cluster:9200",
      "username": "user",
      "password": "pass"
    },
    "index": "products"
  },
  "dest": {
    "index": "products"
  }
}
```

**前提条件**：

```yaml
# elasticsearch.yml
reindex.remote.whitelist: "old-cluster:9200"
```

## Update By Query

### 批量更新

```bash
POST /products/_update_by_query
{
  "script": {
    "source": "ctx._source.price *= 0.9",
    "lang": "painless"
  },
  "query": {
    "term": {
      "category": "electronics"
    }
  }
}
```

### 更新所有文档

```bash
POST /products/_update_by_query
{
  "script": {
    "source": "ctx._source.updated_at = params.now",
    "params": {
      "now": "2024-01-15"
    }
  }
}
```

### 冲突处理

```bash
POST /products/_update_by_query?conflicts=proceed
{
  "script": {
    "source": "ctx._source.stock += 10"
  }
}
```

### 限流

```bash
POST /products/_update_by_query?requests_per_second=1000
{
  "script": {
    "source": "ctx._source.updated = true"
  }
}
```

## Delete By Query

### 批量删除

```bash
POST /products/_delete_by_query
{
  "query": {
    "range": {
      "created_at": {
        "lt": "2023-01-01"
      }
    }
  }
}
```

### 删除所有文档

```bash
POST /products/_delete_by_query
{
  "query": {
    "match_all": {}
  }
}
```

**注意**：删除所有文档时，推荐直接删除索引后重建

### 响应

```bash
{
  "took": 147,
  "timed_out": false,
  "total": 119,
  "deleted": 119,
  "batches": 1,
  "version_conflicts": 0,
  "noops": 0,
  "failures": []
}
```

## 实战案例

### 案例1：商品库存更新

```bash
# 1. 单个商品库存增加
POST /products/_update/1
{
  "script": {
    "source": "ctx._source.stock += params.count",
    "params": {
      "count": 100
    }
  }
}

# 2. 批量库存更新
POST /_bulk
{ "update": { "_index": "products", "_id": "1" } }
{ "script": { "source": "ctx._source.stock += 100" } }
{ "update": { "_index": "products", "_id": "2" } }
{ "script": { "source": "ctx._source.stock += 50" } }
```

### 案例2：数据迁移

```bash
# 1. 创建新索引（优化映射）
PUT /products_v2
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "price": { "type": "scaled_float", "scaling_factor": 100 }
    }
  }
}

# 2. Reindex 数据
POST /_reindex
{
  "source": { "index": "products" },
  "dest": { "index": "products_v2" }
}

# 3. 切换别名
POST /_aliases
{
  "actions": [
    { "remove": { "index": "products", "alias": "products_alias" } },
    { "add": { "index": "products_v2", "alias": "products_alias" } }
  ]
}

# 4. 删除旧索引
DELETE /products
```

### 案例3：批量数据清理

```bash
# 删除过期订单（90 天前）
POST /orders/_delete_by_query
{
  "query": {
    "range": {
      "created_at": {
        "lt": "now-90d"
      }
    }
  }
}
```

## API 使用最佳实践

### 选择合适的 API

```
单文档操作：
  - 创建：PUT /index/_doc/id
  - 查询：GET /index/_doc/id
  - 更新：POST /index/_update/id
  - 删除：DELETE /index/_doc/id

批量操作：
  - 批量写入：POST /_bulk
  - 批量查询：GET /_mget
  - 批量更新：POST /index/_update_by_query
  - 批量删除：POST /index/_delete_by_query

索引迁移：
  - Reindex API
```

### 性能优化

```
✓ 使用 Bulk API 批量操作
✓ 合理设置批次大小（5-15MB）
✓ 并发批量写入
✓ Update By Query 使用限流
✓ Reindex 时处理冲突
```

### 错误处理

```java
// Bulk API 错误处理
BulkResponse response = client.bulk(request);
if (response.hasFailures()) {
    for (BulkItemResponse item : response.getItems()) {
        if (item.isFailed()) {
            // 记录失败项
            logger.error("Failed: {}", item.getFailureMessage());
        }
    }
}
```

## 总结

**单文档操作**：
- Index API：创建/覆盖文档
- Get API：获取文档
- Update API：部分更新
- Delete API：删除文档

**批量操作**：
- Bulk API：批量增删改
- Multi-Get API：批量查询
- Update By Query：批量更新
- Delete By Query：批量删除

**数据迁移**：
- Reindex API：索引重建
- 支持远程 Reindex
- 支持脚本转换

**最佳实践**：
- 批量操作优先
- 合理批次大小
- 错误处理
- 版本冲突处理

**下一步**：学习 Search APIs，掌握搜索相关接口。

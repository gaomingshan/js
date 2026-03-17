# 版本控制与并发控制

## 概述

Elasticsearch 使用版本号机制实现乐观并发控制，解决多客户端同时更新同一文档的冲突问题。理解版本控制机制是处理并发场景的关键。

## 版本号机制

### 内部版本号（_version）

**每次更新自动递增**：

```bash
# 首次创建文档
PUT /products/_doc/1
{
  "name": "iPhone",
  "price": 7999
}

# 响应
{
  "_index": "products",
  "_id": "1",
  "_version": 1,
  "result": "created"
}

# 更新文档
PUT /products/_doc/1
{
  "name": "iPhone 14",
  "price": 8999
}

# 响应
{
  "_version": 2,
  "result": "updated"
}

# 再次更新
PUT /products/_doc/1
{
  "name": "iPhone 14 Pro",
  "price": 9999
}

# 响应
{
  "_version": 3,
  "result": "updated"
}
```

### 序列号与主要项（7.0+）

**新版本控制机制**：

```bash
GET /products/_doc/1

# 响应
{
  "_index": "products",
  "_id": "1",
  "_version": 3,
  "_seq_no": 5,
  "_primary_term": 1,
  "_source": { ... }
}
```

**字段说明**：
- **_seq_no**：序列号，每个操作递增
- **_primary_term**：主要项，主分片选举时递增
- **_version**：版本号（向后兼容）

**为什么引入新机制？**

```
问题：_version 在主分片切换后重置
  
解决：_seq_no + _primary_term 组合
  - _seq_no：操作的全局顺序
  - _primary_term：主分片的任期
  - 组合唯一标识每个操作
```

## 乐观并发控制

### 使用 _version（已废弃）

```bash
# ES 7.0 之前的方式
PUT /products/_doc/1?version=2&version_type=internal
{
  "name": "iPhone 14",
  "price": 8999
}

# 如果当前版本不是 2，返回 409 冲突
{
  "error": {
    "type": "version_conflict_engine_exception",
    "reason": "[1]: version conflict, current version [3] is different than the one provided [2]"
  },
  "status": 409
}
```

### 使用 if_seq_no 和 if_primary_term（推荐）

```bash
# 1. 获取文档当前版本
GET /products/_doc/1

{
  "_seq_no": 5,
  "_primary_term": 1,
  "_source": {
    "name": "iPhone 14",
    "price": 8999
  }
}

# 2. 基于版本更新
PUT /products/_doc/1?if_seq_no=5&if_primary_term=1
{
  "name": "iPhone 14 Pro",
  "price": 9999
}

# 成功响应
{
  "_seq_no": 6,
  "_primary_term": 1,
  "result": "updated"
}

# 如果版本不匹配，返回 409 冲突
PUT /products/_doc/1?if_seq_no=5&if_primary_term=1
{
  "name": "iPhone 15",
  "price": 10999
}

# 错误响应
{
  "error": {
    "type": "version_conflict_engine_exception",
    "reason": "[1]: version conflict, required seqNo [5], primary term [1]. current document has seqNo [6] and primary term [1]"
  },
  "status": 409
}
```

## 并发更新场景

### 场景 1：两个客户端同时更新

```
时间线：
T1: 客户端A 读取文档（seq_no=5, primary_term=1）
T2: 客户端B 读取文档（seq_no=5, primary_term=1）
T3: 客户端A 更新文档（seq_no=5 → 6）✓
T4: 客户端B 更新文档（基于 seq_no=5）✗ 冲突
```

**客户端A**：

```bash
# 1. 读取
GET /products/_doc/1
# seq_no=5, primary_term=1

# 2. 更新成功
PUT /products/_doc/1?if_seq_no=5&if_primary_term=1
{
  "name": "iPhone 14 Pro",
  "price": 9999
}
# seq_no=6, result=updated
```

**客户端B**：

```bash
# 1. 读取（同一时刻）
GET /products/_doc/1
# seq_no=5, primary_term=1

# 2. 更新失败（seq_no 已变为 6）
PUT /products/_doc/1?if_seq_no=5&if_primary_term=1
{
  "name": "iPhone 14 Max",
  "price": 10999
}
# 错误：409 冲突
```

### 场景 2：重试逻辑

**客户端B 处理冲突**：

```bash
# 1. 捕获 409 冲突
# 2. 重新读取文档
GET /products/_doc/1
# seq_no=6, primary_term=1, name="iPhone 14 Pro", price=9999

# 3. 合并更改（业务逻辑决定）
# 4. 基于新版本更新
PUT /products/_doc/1?if_seq_no=6&if_primary_term=1
{
  "name": "iPhone 14 Pro Max",
  "price": 10999
}
# seq_no=7, result=updated
```

**伪代码**：

```java
int maxRetries = 3;
for (int i = 0; i < maxRetries; i++) {
    // 1. 读取文档
    GetResponse response = client.get(new GetRequest("products", "1"));
    long seqNo = response.getSeqNo();
    long primaryTerm = response.getPrimaryTerm();
    Map<String, Object> source = response.getSourceAsMap();
    
    // 2. 修改数据
    source.put("price", (Integer) source.get("price") + 100);
    
    // 3. 尝试更新
    try {
        UpdateRequest updateRequest = new UpdateRequest("products", "1")
            .setIfSeqNo(seqNo)
            .setIfPrimaryTerm(primaryTerm)
            .doc(source);
        client.update(updateRequest);
        break; // 成功，退出循环
    } catch (VersionConflictEngineException e) {
        // 冲突，重试
        if (i == maxRetries - 1) {
            throw e; // 最后一次重试失败，抛出异常
        }
    }
}
```

## 部分更新

### Update API

**部分更新文档**：

```bash
POST /products/_update/1
{
  "doc": {
    "price": 10999
  }
}

# 响应
{
  "_seq_no": 8,
  "_primary_term": 1,
  "result": "updated"
}
```

### 带版本控制的部分更新

```bash
POST /products/_update/1?if_seq_no=7&if_primary_term=1
{
  "doc": {
    "price": 10999
  }
}

# 版本不匹配时返回 409 冲突
```

### 脚本更新

```bash
POST /products/_update/1
{
  "script": {
    "source": "ctx._source.price += params.increment",
    "params": {
      "increment": 100
    }
  }
}
```

### 带版本控制的脚本更新

```bash
POST /products/_update/1?if_seq_no=8&if_primary_term=1
{
  "script": {
    "source": "ctx._source.price += params.increment",
    "params": {
      "increment": 100
    }
  }
}
```

### Upsert（不存在则插入）

```bash
POST /products/_update/1
{
  "doc": {
    "price": 10999
  },
  "upsert": {
    "name": "iPhone 14",
    "price": 8999
  }
}

# 文档不存在时，插入 upsert 内容
# 文档存在时，更新 doc 内容
```

## 外部版本号

### 使用场景

**从外部系统同步数据**：

```
外部系统：
  文档ID: 1, version: 1234
  
Elasticsearch：
  使用外部版本号，确保仅更新版本号更大的数据
```

### 外部版本号更新

```bash
# 使用外部版本号
PUT /products/_doc/1?version=1234&version_type=external
{
  "name": "iPhone 14",
  "price": 8999
}

# 规则：外部版本号必须 > 当前版本号
# 当前版本：1234

# 更新成功（版本号更大）
PUT /products/_doc/1?version=1235&version_type=external
{
  "name": "iPhone 14 Pro",
  "price": 9999
}

# 更新失败（版本号更小）
PUT /products/_doc/1?version=1233&version_type=external
{
  "name": "iPhone 13",
  "price": 7999
}
# 错误：版本冲突
```

### version_type 参数

```
- internal（默认）：内部版本号，自动递增
- external：外部版本号，必须更大
- external_gte：外部版本号，大于等于即可
```

## Update By Query

### 批量更新

```bash
POST /products/_update_by_query
{
  "query": {
    "term": {
      "brand": "Apple"
    }
  },
  "script": {
    "source": "ctx._source.price *= 1.1",
    "lang": "painless"
  }
}

# 响应
{
  "took": 147,
  "updated": 500,
  "version_conflicts": 2,
  "failures": []
}
```

### 处理版本冲突

```bash
# 遇到冲突时中止（默认）
POST /products/_update_by_query?conflicts=abort
{
  "query": { ... },
  "script": { ... }
}

# 遇到冲突时继续
POST /products/_update_by_query?conflicts=proceed
{
  "query": { ... },
  "script": { ... }
}
```

## Delete By Query

```bash
POST /products/_delete_by_query
{
  "query": {
    "range": {
      "created_at": {
        "lte": "2023-01-01"
      }
    }
  }
}

# 响应
{
  "took": 123,
  "deleted": 100,
  "version_conflicts": 0,
  "failures": []
}
```

## 实战案例

### 案例1：库存扣减

```bash
# 1. 读取当前库存
GET /products/_doc/1

{
  "_seq_no": 10,
  "_primary_term": 1,
  "_source": {
    "name": "iPhone 14",
    "stock": 100
  }
}

# 2. 扣减库存（乐观锁）
POST /products/_update/1?if_seq_no=10&if_primary_term=1
{
  "script": {
    "source": """
      if (ctx._source.stock >= params.quantity) {
        ctx._source.stock -= params.quantity;
      } else {
        ctx.op = 'noop';
      }
    """,
    "params": {
      "quantity": 5
    }
  }
}

# 成功响应
{
  "_seq_no": 11,
  "_primary_term": 1,
  "result": "updated"
}

# 冲突响应（其他客户端已修改）
{
  "error": {
    "type": "version_conflict_engine_exception"
  },
  "status": 409
}

# 业务层重试逻辑
```

### 案例2：计数器更新

```bash
# 原子递增
POST /statistics/_update/page_views
{
  "script": {
    "source": "ctx._source.count += params.increment",
    "params": {
      "increment": 1
    }
  },
  "upsert": {
    "count": 0
  }
}

# 无需版本控制（Update API 内部处理冲突）
```

### 案例3：数据同步

```bash
# 从外部系统同步数据
def syncFromExternal(externalDoc):
    PUT /products/_doc/{externalDoc.id}?version={externalDoc.version}&version_type=external
    {
      "name": externalDoc.name,
      "price": externalDoc.price
    }

# 仅当外部版本号更大时更新
```

## 性能考量

### 1. 批量操作中的冲突

```bash
# Bulk API 中的版本控制
POST /_bulk
{ "update": { "_index": "products", "_id": "1", "if_seq_no": 10, "if_primary_term": 1 } }
{ "doc": { "price": 9999 } }
{ "update": { "_index": "products", "_id": "2", "if_seq_no": 5, "if_primary_term": 1 } }
{ "doc": { "price": 8999 } }

# 部分成功、部分失败
{
  "items": [
    {
      "update": {
        "_index": "products",
        "_id": "1",
        "status": 200,
        "result": "updated"
      }
    },
    {
      "update": {
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

### 2. 重试策略

```
指数退避重试：
  第1次：立即重试
  第2次：等待 100ms
  第3次：等待 200ms
  第4次：等待 400ms
  ...
  
最大重试次数：3-5次
```

### 3. 避免过度乐观

```
高并发场景：
  - 冲突率过高 → 性能下降
  - 考虑业务重新设计
  - 使用队列削峰
  - 分散热点数据
```

## 监控版本冲突

### 查看冲突统计

```bash
GET /products/_stats

{
  "indices": {
    "products": {
      "primaries": {
        "indexing": {
          "index_total": 10000,
          "index_failed": 0,
          "version_conflicts": 150  # 版本冲突次数
        }
      }
    }
  }
}
```

### 冲突率计算

```
冲突率 = version_conflicts / index_total
       = 150 / 10000
       = 1.5%

告警阈值建议：
  - 冲突率 > 5%：需要优化
  - 冲突率 > 10%：严重问题
```

## 最佳实践

### 1. 总是使用版本控制

```bash
# ✅ 推荐
PUT /products/_doc/1?if_seq_no=10&if_primary_term=1
{
  "name": "iPhone"
}

# ❌ 不推荐（并发场景）
PUT /products/_doc/1
{
  "name": "iPhone"
}
```

### 2. 合理处理冲突

```
策略：
  1. 重试（适合大多数场景）
  2. 放弃（非关键操作）
  3. 记录日志（人工介入）
```

### 3. 避免长事务

```
✗ 错误：长时间持有版本号
  1. 读取文档（seq_no=10）
  2. 复杂业务逻辑（耗时 10 秒）
  3. 更新文档（seq_no=10）→ 高概率冲突

✓ 正确：缩短事务时间
  1. 读取文档
  2. 快速计算
  3. 立即更新
```

### 4. Update API vs 完整文档更新

```bash
# ✅ 推荐：部分更新（Update API）
POST /products/_update/1
{
  "doc": {
    "price": 9999
  }
}
# 内部自动处理冲突和重试

# ❌ 不推荐：完整文档更新（需要手动处理冲突）
PUT /products/_doc/1?if_seq_no=10&if_primary_term=1
{
  "name": "iPhone",
  "price": 9999,
  "stock": 100,
  ...
}
```

## 总结

**版本号机制**：
- **_version**：内部版本号（向后兼容）
- **_seq_no + _primary_term**：新版本控制（ES 7.0+）

**乐观并发控制**：
- 读取时获取版本号
- 更新时校验版本号
- 冲突时重试

**版本控制方式**：
- **if_seq_no + if_primary_term**：推荐
- **version + version_type=external**：外部系统同步

**Update API**：
- 部分更新
- 内部自动处理冲突
- 支持脚本和 upsert

**最佳实践**：
- 总是使用版本控制
- 合理处理冲突（重试）
- 避免长事务
- 优先使用 Update API

**下一步**：学习数据一致性保证，理解 ES 的一致性模型。

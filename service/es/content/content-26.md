# 查询性能调优

## 概述

查询性能直接影响用户体验。本章介绍 Filter 优先、查询缓存、深度分页优化等策略，大幅提升查询响应速度。

## Filter vs Query

### 优先使用 Filter

**核心原则**：不需要评分的条件使用 filter

```bash
# ❌ 不推荐：全部使用 must
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "iPhone" } },
        { "term": { "status": "active" } },
        { "range": { "price": { "gte": 5000 } } }
      ]
    }
  }
}

# ✅ 推荐：精确条件使用 filter
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "iPhone" } }  # 需要评分
      ],
      "filter": [
        { "term": { "status": "active" } },      # 不需要评分
        { "range": { "price": { "gte": 5000 } } }  # 不需要评分
      ]
    }
  }
}
```

**filter 的优势**：
- 不计算相关性得分
- 查询结果可缓存
- 性能提升明显（20%-50%）

### 使用场景

```
filter 使用场景：
  - 精确匹配：term、terms
  - 范围查询：range
  - 存在性查询：exists
  - 地理位置查询：geo_distance
  - 布尔值过滤

query 使用场景：
  - 全文搜索：match、match_phrase
  - 需要相关性排序
  - 模糊查询：fuzzy
```

## 查询缓存机制

### Shard Request Cache

**缓存聚合结果**：

```bash
# 启用缓存（默认启用）
PUT /products/_settings
{
  "index.requests.cache.enable": true
}

# 使用缓存
GET /products/_search?request_cache=true
{
  "size": 0,
  "aggs": {
    "avg_price": {
      "avg": { "field": "price" }
    }
  }
}
```

**缓存条件**：
- `size=0` 的查询
- 不包含 `now` 的查询
- Refresh 后缓存失效

**缓存配置**：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "indices.requests.cache.size": "2%"  # 堆内存的 2%
  }
}
```

### Query Cache

**自动缓存 filter 查询**：

```bash
# filter 查询自动缓存
GET /products/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "status": "active" } }
      ]
    }
  }
}
```

**缓存策略**：
- 仅缓存 filter 查询
- LRU 淘汰机制
- 自动管理

**缓存配置**：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "indices.queries.cache.size": "10%"
  }
}
```

### 清理缓存

```bash
# 清理查询缓存
POST /_cache/clear?query=true

# 清理请求缓存
POST /_cache/clear?request=true

# 清理所有缓存
POST /_cache/clear
```

## 字段数据 vs Doc Values

### Fielddata vs Doc Values

**区别**：

```
Doc Values（推荐）：
  - 列式存储在磁盘
  - 默认启用（除 text 字段）
  - 内存友好
  - 支持排序和聚合

Fielddata（避免使用）：
  - 堆内存存储
  - 仅 text 字段
  - 内存占用大
  - 可能导致 OOM
```

### 正确使用方式

```bash
# ❌ 错误：text 字段聚合
GET /articles/_search
{
  "aggs": {
    "top_words": {
      "terms": { "field": "content" }  # text 字段，需要 fielddata
    }
  }
}
# 错误：Fielddata is disabled on text fields

# ✅ 正确：使用 keyword 子字段
PUT /articles
{
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      }
    }
  }
}

GET /articles/_search
{
  "aggs": {
    "top_words": {
      "terms": { "field": "content.keyword" }  # keyword 字段
    }
  }
}
```

### Fielddata 配置（不推荐）

```bash
PUT /articles/_mapping
{
  "properties": {
    "content": {
      "type": "text",
      "fielddata": true  # 启用 fielddata
    }
  }
}

# 限制 Fielddata 大小
PUT /_cluster/settings
{
  "persistent": {
    "indices.fielddata.cache.size": "20%"
  }
}
```

## 深度分页优化

### 避免大 from 值

**问题**：

```bash
# ❌ 性能极差
GET /products/_search
{
  "from": 10000,
  "size": 10
}

# 每个分片需要维护 10010 个结果
# 协调节点需要排序大量数据
```

**性能影响**：

```
from=0, size=10：快
from=100, size=10：较快
from=1000, size=10：慢
from=10000, size=10：极慢
```

### Search After（推荐）

```bash
# 1. 首次查询
GET /products/_search
{
  "size": 10,
  "query": { "match_all": {} },
  "sort": [
    { "price": "asc" },
    { "_id": "asc" }  # 保证唯一性
  ]
}

# 响应
{
  "hits": {
    "hits": [
      ...,
      {
        "_id": "100",
        "sort": [5999, "100"]  # 最后一个文档的排序值
      }
    ]
  }
}

# 2. 下一页查询
GET /products/_search
{
  "size": 10,
  "query": { "match_all": {} },
  "sort": [
    { "price": "asc" },
    { "_id": "asc" }
  ],
  "search_after": [5999, "100"]  # 使用上一页最后的排序值
}
```

**优势**：
- 性能稳定（不受 from 影响）
- 无状态
- 实时数据

**限制**：
- 不支持跳页
- 必须有排序字段

### Scroll API

```bash
# 1. 初始化 Scroll
POST /products/_search?scroll=1m
{
  "size": 100,
  "query": { "match_all": {} }
}

# 响应
{
  "_scroll_id": "abc123...",
  "hits": { ... }
}

# 2. 获取下一批
POST /_search/scroll
{
  "scroll": "1m",
  "scroll_id": "abc123..."
}

# 3. 清理 Scroll
DELETE /_search/scroll
{
  "scroll_id": "abc123..."
}
```

**适用场景**：
- 数据导出
- 批量处理
- 不需要跳页

## 查询重写与优化

### 减少返回字段

```bash
# ❌ 返回所有字段
GET /products/_search
{
  "query": { "match_all": {} }
}

# ✅ 仅返回需要的字段
GET /products/_search
{
  "query": { "match_all": {} },
  "_source": ["name", "price", "image"]
}

# ✅ 禁用 _source（仅聚合）
GET /products/_search
{
  "size": 0,
  "_source": false,
  "aggs": {
    "avg_price": { "avg": { "field": "price" } }
  }
}
```

### 避免通配符开头

```bash
# ❌ 极慢
{
  "query": {
    "wildcard": {
      "name": "*phone"
    }
  }
}

# ✅ 较快
{
  "query": {
    "wildcard": {
      "name": "phone*"
    }
  }
}

# ✅ 更好：使用 prefix
{
  "query": {
    "prefix": {
      "name": "phone"
    }
  }
}
```

### 限制聚合深度

```bash
# ❌ 聚合嵌套过深
{
  "aggs": {
    "level1": {
      "terms": { "field": "category" },
      "aggs": {
        "level2": {
          "terms": { "field": "brand" },
          "aggs": {
            "level3": {
              "terms": { "field": "color" },
              "aggs": {
                "level4": {
                  "terms": { "field": "size" }  # 4 层嵌套
                }
              }
            }
          }
        }
      }
    }
  }
}

# ✅ 限制嵌套层数（< 3 层）
{
  "aggs": {
    "by_category": {
      "terms": { "field": "category", "size": 10 },
      "aggs": {
        "avg_price": {
          "avg": { "field": "price" }
        }
      }
    }
  }
}
```

### 使用 Constant Score

```bash
# 不需要评分时使用
{
  "query": {
    "constant_score": {
      "filter": {
        "term": { "status": "active" }
      },
      "boost": 1.0
    }
  }
}
```

## Profile API 性能分析

### 分析查询性能

```bash
GET /products/_search
{
  "profile": true,
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "iPhone" } }
      ],
      "filter": [
        { "range": { "price": { "gte": 5000 } } }
      ]
    }
  }
}
```

**响应分析**：

```json
{
  "profile": {
    "shards": [
      {
        "searches": [
          {
            "query": [
              {
                "type": "BooleanQuery",
                "time_in_nanos": 1234567,
                "breakdown": {
                  "build_scorer": 123456,
                  "match": 234567,
                  "score": 345678,
                  "advance": 123456
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**关键指标**：
- **time_in_nanos**：总耗时
- **build_scorer**：构建评分器耗时
- **match**：匹配文档耗时
- **score**：计算得分耗时

### 优化建议

```
根据 Profile 结果优化：
  - time_in_nanos 大：查询复杂度高
  - match 耗时长：考虑增加过滤条件
  - score 耗时长：考虑使用 filter
  - advance 耗时长：索引设计问题
```

## 查询优化清单

### Query 层面

```
✓ 使用 filter 代替不需要评分的条件
✓ 减少返回字段（_source 过滤）
✓ 避免深度分页（使用 Search After）
✓ 避免通配符开头查询
✓ 限制聚合深度（< 3 层）
✓ 限制聚合桶数量（size 参数）
✓ 使用 Constant Score
✓ 合理设置 size（< 100）
```

### 索引层面

```
✓ 使用 keyword 子字段聚合
✓ 启用 Doc Values
✓ 禁用不必要的功能
✓ 合理设置分片数量
✓ 定期 Force Merge（只读索引）
```

### 缓存层面

```
✓ 启用 Query Cache
✓ 启用 Request Cache
✓ 使用 size=0 的聚合查询
✓ 避免查询包含 now
```

### 集群层面

```
✓ 使用 SSD
✓ 增加内存（文件系统缓存）
✓ 优化网络
✓ 监控慢查询
```

## 慢查询分析

### 配置慢查询日志

```bash
PUT /products/_settings
{
  "index.search.slowlog.threshold.query.warn": "2s",
  "index.search.slowlog.threshold.query.info": "1s",
  "index.search.slowlog.threshold.query.debug": "500ms",
  "index.search.slowlog.threshold.fetch.warn": "1s"
}
```

### 慢查询日志示例

```
[2024-01-15T10:30:00,123][WARN][index.search.slowlog.query] 
[products/0] took[2.5s], types[], stats[], 
search_type[QUERY_THEN_FETCH], total_shards[3], 
source[{"query":{"match":{"name":"phone"}}}]
```

### 分析与优化

```
慢查询优化步骤：
1. 记录慢查询
2. 使用 Profile API 分析
3. 识别瓶颈（查询复杂度、数据量、聚合）
4. 优化查询条件
5. 验证效果
```

## 实战优化案例

### 案例：电商商品搜索

**优化前**：

```bash
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "phone" } },
        { "term": { "status": "active" } },
        { "range": { "stock": { "gt": 0 } } }
      ]
    }
  },
  "from": 100,
  "size": 20
}
# 延迟：500ms
```

**优化后**：

```bash
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "phone" } }
      ],
      "filter": [
        { "term": { "status": "active" } },
        { "range": { "stock": { "gt": 0 } } }
      ]
    }
  },
  "from": 100,
  "size": 20,
  "_source": ["name", "price", "image"]
}
# 延迟：100ms（提升 80%）
```

## 监控查询性能

### 关键指标

```bash
GET /_nodes/stats

{
  "nodes": {
    "node-1": {
      "indices": {
        "search": {
          "query_total": 100000,
          "query_time_in_millis": 500000,
          "query_current": 10,
          "fetch_total": 50000,
          "fetch_time_in_millis": 100000
        }
      }
    }
  }
}

# 计算平均查询时间
avg_query_time = query_time_in_millis / query_total
               = 500000 / 100000
               = 5ms
```

### 告警阈值

```
告警规则：
1. 平均查询延迟 > 100ms
2. P95 查询延迟 > 500ms
3. 当前查询数 > 100（积压）
4. 查询拒绝率 > 1%
5. 慢查询数量 > 10/分钟
```

## 总结

**Filter vs Query**：
- filter：不评分，可缓存
- query：计算相关性
- 优先使用 filter

**查询缓存**：
- Request Cache：聚合结果
- Query Cache：filter 查询
- 自动管理

**深度分页**：
- 避免大 from 值
- Search After：深度分页
- Scroll：批量处理

**查询优化**：
- 减少返回字段
- 避免通配符开头
- 限制聚合深度
- 使用 Constant Score

**性能分析**：
- Profile API
- 慢查询日志
- 监控指标

**下一步**：学习硬件选型与容量规划，合理配置集群资源。

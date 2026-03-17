# Search APIs

## 概述

Search APIs 是 Elasticsearch 的核心功能，提供强大的搜索能力。本章介绍 Search API、URI Search、Multi Search、Count、Validate、Explain、Scroll 和 Search Template 等接口。

## Search API

### 基本搜索

**Request Body Search**：

```bash
GET /products/_search
{
  "query": {
    "match": {
      "name": "iPhone"
    }
  }
}

# 响应
{
  "took": 5,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 100,
      "relation": "eq"
    },
    "max_score": 1.5,
    "hits": [
      {
        "_index": "products",
        "_id": "1",
        "_score": 1.5,
        "_source": {
          "name": "iPhone 14 Pro",
          "price": 7999
        }
      }
    ]
  }
}
```

**响应字段说明**：
- **took**：查询耗时（毫秒）
- **timed_out**：是否超时
- **_shards**：分片统计
- **hits.total.value**：匹配文档数
- **hits.max_score**：最高得分
- **hits.hits**：文档数组

### 分页

```bash
GET /products/_search
{
  "from": 0,
  "size": 10,
  "query": {
    "match_all": {}
  }
}
```

**注意**：深度分页性能差，推荐使用 Search After

### 排序

```bash
GET /products/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    { "price": "desc" },
    { "_score": "desc" }
  ]
}
```

### 指定返回字段

```bash
GET /products/_search
{
  "query": {
    "match_all": {}
  },
  "_source": ["name", "price"]
}

# 或使用 includes/excludes
GET /products/_search
{
  "query": {
    "match_all": {}
  },
  "_source": {
    "includes": ["name", "price"],
    "excludes": ["internal_*"]
  }
}
```

### 高亮

```bash
GET /products/_search
{
  "query": {
    "match": {
      "name": "iPhone"
    }
  },
  "highlight": {
    "fields": {
      "name": {}
    }
  }
}

# 响应
{
  "hits": {
    "hits": [
      {
        "_source": { "name": "iPhone 14 Pro" },
        "highlight": {
          "name": [
            "<em>iPhone</em> 14 Pro"
          ]
        }
      }
    ]
  }
}
```

## URI Search vs Request Body Search

### URI Search

```bash
# 基本查询
GET /products/_search?q=iPhone

# 指定字段
GET /products/_search?q=name:iPhone

# 范围查询
GET /products/_search?q=price:>5000

# 布尔查询
GET /products/_search?q=name:iPhone AND category:electronics

# 分页和排序
GET /products/_search?q=iPhone&from=0&size=10&sort=price:desc
```

**优点**：
- 简单快速
- 适合临时查询

**缺点**：
- 功能有限
- 不支持复杂查询
- 难以维护

### Request Body Search（推荐）

```bash
POST /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "iPhone" } }
      ],
      "filter": [
        { "term": { "category": "electronics" } },
        { "range": { "price": { "gte": 5000 } } }
      ]
    }
  },
  "from": 0,
  "size": 10,
  "sort": [
    { "price": "desc" }
  ]
}
```

**优点**：
- 功能完整
- 支持复杂查询
- 易于维护和版本控制

## Multi Search API

### 批量搜索

```bash
POST /_msearch
{ "index": "products" }
{ "query": { "match": { "name": "iPhone" } } }
{ "index": "orders" }
{ "query": { "match": { "status": "completed" } } }
{ "index": "products" }
{ "query": { "range": { "price": { "gte": 5000 } } } }
```

**响应**：

```bash
{
  "responses": [
    {
      "took": 5,
      "hits": {
        "total": { "value": 10 },
        "hits": [ ... ]
      }
    },
    {
      "took": 3,
      "hits": {
        "total": { "value": 50 },
        "hits": [ ... ]
      }
    },
    {
      "took": 4,
      "hits": {
        "total": { "value": 20 },
        "hits": [ ... ]
      }
    }
  ]
}
```

### 使用场景

```
适用场景：
  - Dashboard 多个图表数据
  - 多维度搜索
  - 批量查询不同索引

优势：
  - 减少网络往返
  - 提升性能
```

## Count API

### 统计文档数量

```bash
GET /products/_count

# 响应
{
  "count": 1000,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  }
}
```

### 带条件统计

```bash
GET /products/_count
{
  "query": {
    "range": {
      "price": {
        "gte": 5000
      }
    }
  }
}

# 响应
{
  "count": 150
}
```

### 多索引统计

```bash
GET /products,orders/_count
{
  "query": {
    "match_all": {}
  }
}
```

## Validate API

### 验证查询语法

```bash
GET /products/_validate/query
{
  "query": {
    "match": {
      "name": "iPhone"
    }
  }
}

# 响应
{
  "valid": true
}
```

### 查看查询解释

```bash
GET /products/_validate/query?explain=true
{
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

# 响应
{
  "valid": true,
  "explanations": [
    {
      "index": "products",
      "valid": true,
      "explanation": "+name:iphone #price:[5000 TO *]"
    }
  ]
}
```

### 验证错误查询

```bash
GET /products/_validate/query
{
  "query": {
    "match": {
      "invalid_field": "value"
    }
  }
}

# 响应
{
  "valid": false,
  "error": "no mapping found for field [invalid_field]"
}
```

## Explain API

### 解释文档得分

```bash
GET /products/_explain/1
{
  "query": {
    "match": {
      "name": "iPhone"
    }
  }
}

# 响应
{
  "matched": true,
  "explanation": {
    "value": 1.5,
    "description": "weight(name:iphone in 0) [PerFieldSimilarity], result of:",
    "details": [
      {
        "value": 1.5,
        "description": "score(freq=1.0), computed as boost * idf * tf from:",
        "details": [
          {
            "value": 2.2,
            "description": "idf, computed as log(1 + (N - n + 0.5) / (n + 0.5))"
          },
          {
            "value": 0.68,
            "description": "tf, computed as freq / (freq + k1 * (1 - b + b * dl / avgdl))"
          }
        ]
      }
    ]
  }
}
```

**用途**：
- 理解文档得分计算
- 调试相关性问题
- 优化查询权重

## Scroll API

### 深度分页

**初始化 Scroll**：

```bash
POST /products/_search?scroll=1m
{
  "size": 100,
  "query": {
    "match_all": {}
  }
}

# 响应
{
  "_scroll_id": "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAA...",
  "hits": {
    "total": { "value": 10000 },
    "hits": [ ... ]  # 前 100 条
  }
}
```

**获取下一批**：

```bash
POST /_search/scroll
{
  "scroll": "1m",
  "scroll_id": "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAA..."
}
```

**清理 Scroll**：

```bash
DELETE /_search/scroll
{
  "scroll_id": "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAA..."
}

# 或清理所有 Scroll
DELETE /_search/scroll/_all
```

### Scroll 使用注意

```
适用场景：
  - 数据导出
  - 批量处理
  - 遍历所有文档

不适用场景：
  - 实时搜索
  - 用户分页

注意事项：
  - 占用内存
  - 定期清理
  - 设置合理的 scroll 时间
```

### Scroll Slice

**并行 Scroll**：

```bash
# Slice 0
POST /products/_search?scroll=1m
{
  "size": 100,
  "slice": {
    "id": 0,
    "max": 5
  },
  "query": {
    "match_all": {}
  }
}

# Slice 1
POST /products/_search?scroll=1m
{
  "size": 100,
  "slice": {
    "id": 1,
    "max": 5
  },
  "query": {
    "match_all": {}
  }
}

# ... Slice 2-4
```

**并行提升性能**：5 个 Slice 并行处理

## Search Template

### 创建搜索模板

```bash
POST /_scripts/product_search
{
  "script": {
    "lang": "mustache",
    "source": {
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "{{field}}": "{{value}}"
              }
            }
          ],
          "filter": [
            {
              "range": {
                "price": {
                  "gte": "{{min_price}}",
                  "lte": "{{max_price}}"
                }
              }
            }
          ]
        }
      }
    }
  }
}
```

### 使用搜索模板

```bash
GET /products/_search/template
{
  "id": "product_search",
  "params": {
    "field": "name",
    "value": "iPhone",
    "min_price": 5000,
    "max_price": 10000
  }
}
```

### 内联模板

```bash
GET /products/_search/template
{
  "source": {
    "query": {
      "match": {
        "{{field}}": "{{value}}"
      }
    }
  },
  "params": {
    "field": "name",
    "value": "iPhone"
  }
}
```

### 条件渲染

```bash
POST /_scripts/flexible_search
{
  "script": {
    "lang": "mustache",
    "source": {
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "name": "{{query}}"
              }
            }
          ]
          {{#filter_price}}
          ,
          "filter": [
            {
              "range": {
                "price": {
                  "gte": "{{min_price}}"
                }
              }
            }
          ]
          {{/filter_price}}
        }
      }
    }
  }
}

# 使用
GET /products/_search/template
{
  "id": "flexible_search",
  "params": {
    "query": "iPhone",
    "filter_price": true,
    "min_price": 5000
  }
}
```

## 实战案例

### 案例1：电商商品搜索

```bash
POST /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "iPhone 14",
            "fields": ["name^3", "description"]
          }
        }
      ],
      "filter": [
        { "term": { "status": "active" } },
        { "range": { "stock": { "gt": 0 } } },
        { "range": { "price": { "gte": 5000, "lte": 10000 } } }
      ]
    }
  },
  "sort": [
    { "_score": "desc" },
    { "sales_count": "desc" }
  ],
  "from": 0,
  "size": 20,
  "_source": ["name", "price", "image", "stock"],
  "highlight": {
    "fields": {
      "name": {},
      "description": {}
    }
  }
}
```

### 案例2：日志查询

```bash
POST /logs-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "error" } }
      ],
      "filter": [
        { "term": { "level": "ERROR" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "sort": [
    { "@timestamp": "desc" }
  ],
  "size": 100
}
```

### 案例3：批量导出数据

```bash
# 1. 初始化 Scroll
POST /products/_search?scroll=5m
{
  "size": 1000,
  "query": {
    "match_all": {}
  }
}

# 2. 循环获取数据
while (has_more_data) {
    POST /_search/scroll
    {
      "scroll": "5m",
      "scroll_id": "..."
    }
    
    # 处理数据
    process_data(response.hits.hits)
    
    # 检查是否还有数据
    has_more_data = response.hits.hits.length > 0
}

# 3. 清理 Scroll
DELETE /_search/scroll
{
  "scroll_id": "..."
}
```

## Search API 最佳实践

### 性能优化

```
✓ 使用 filter 代替 query（可缓存）
✓ 减少返回字段（_source）
✓ 合理设置 size（< 100）
✓ 避免深度分页（使用 Search After）
✓ 使用 Multi Search 批量查询
✓ 为常用查询创建 Search Template
```

### 查询优化

```
✓ 精确查询使用 term
✓ 全文搜索使用 match
✓ 多字段搜索使用 multi_match
✓ 布尔查询合理组合 must/filter/should
✓ 使用 constant_score 避免不必要的评分
```

### 错误处理

```java
try {
    SearchResponse response = client.search(request);
    
    if (response.getHits().getTotalHits().value == 0) {
        // 无结果处理
    }
    
    for (SearchHit hit : response.getHits()) {
        // 处理结果
    }
} catch (ElasticsearchException e) {
    logger.error("Search failed: {}", e.getMessage());
}
```

## 总结

**Search API**：
- Request Body Search：功能完整
- URI Search：简单快速
- 支持分页、排序、高亮

**批量查询**：
- Multi Search API：批量搜索
- 减少网络开销

**辅助 API**：
- Count API：统计数量
- Validate API：验证查询
- Explain API：解释得分

**深度分页**：
- Scroll API：遍历所有文档
- Scroll Slice：并行处理

**模板化**：
- Search Template：参数化查询
- 提高可维护性

**最佳实践**：
- 使用 filter
- 减少返回字段
- 避免深度分页
- 批量查询

**下一步**：学习 Indices APIs，掌握索引管理接口。

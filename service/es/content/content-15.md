# Query DSL 核心语法

## 概述

Query DSL（Domain Specific Language）是 Elasticsearch 的查询语言，基于 JSON 格式，提供了强大而灵活的查询能力。掌握 Query DSL 是使用 Elasticsearch 的核心技能。

## Query DSL 基本结构

### 标准查询格式

```json
GET /index_name/_search
{
  "query": {
    "查询类型": {
      "字段名": "查询值"
    }
  }
}
```

### 完整查询结构

```json
GET /products/_search
{
  "query": { ... },           // 查询条件
  "from": 0,                  // 分页起始位置
  "size": 10,                 // 返回文档数量
  "sort": [ ... ],            // 排序
  "_source": [ ... ],         // 返回字段
  "highlight": { ... },       // 高亮
  "aggs": { ... }            // 聚合
}
```

## 查询类型分类

### 全文查询 vs 词项查询

**全文查询（Full Text Queries）**：
- 查询文本会被分词
- 用于 `text` 类型字段
- 支持相关性评分
- 示例：match、match_phrase、multi_match

**词项查询（Term-level Queries）**：
- 查询文本不分词
- 用于 `keyword`、数值、日期等类型
- 精确匹配
- 示例：term、terms、range、exists

## 全文查询

### match 查询

**最常用的全文查询**：

```json
GET /articles/_search
{
  "query": {
    "match": {
      "title": "Elasticsearch tutorial"
    }
  }
}
```

**查询过程**：
1. 查询文本分词：["elasticsearch", "tutorial"]
2. 匹配包含任一词项的文档（OR 关系）
3. 计算相关性得分

**operator 参数**：

```json
// OR（默认）：包含任一词项
GET /articles/_search
{
  "query": {
    "match": {
      "title": {
        "query": "Elasticsearch tutorial",
        "operator": "or"
      }
    }
  }
}

// AND：必须包含所有词项
GET /articles/_search
{
  "query": {
    "match": {
      "title": {
        "query": "Elasticsearch tutorial",
        "operator": "and"
      }
    }
  }
}
```

**minimum_should_match 参数**：

```json
// 至少匹配 75% 的词项
GET /articles/_search
{
  "query": {
    "match": {
      "title": {
        "query": "quick brown fox jumps",
        "minimum_should_match": "75%"
      }
    }
  }
}

// 至少匹配 2 个词项
GET /articles/_search
{
  "query": {
    "match": {
      "title": {
        "query": "quick brown fox",
        "minimum_should_match": 2
      }
    }
  }
}
```

### match_phrase 查询

**短语查询**，要求词项顺序一致：

```json
GET /articles/_search
{
  "query": {
    "match_phrase": {
      "content": "quick brown fox"
    }
  }
}
// 仅匹配包含完整短语 "quick brown fox" 的文档
```

**slop 参数**（允许词项间的距离）：

```json
GET /articles/_search
{
  "query": {
    "match_phrase": {
      "content": {
        "query": "quick fox",
        "slop": 1
      }
    }
  }
}
// 匹配 "quick brown fox"（slop=1 允许中间隔1个词）
```

### multi_match 查询

**多字段查询**：

```json
GET /articles/_search
{
  "query": {
    "multi_match": {
      "query": "Elasticsearch",
      "fields": ["title", "content"]
    }
  }
}
```

**字段权重（boosting）**：

```json
GET /articles/_search
{
  "query": {
    "multi_match": {
      "query": "Elasticsearch",
      "fields": ["title^3", "content"]  // title 权重 × 3
    }
  }
}
```

**type 参数**：

```json
// best_fields（默认）：取最佳匹配字段的得分
{
  "multi_match": {
    "query": "quick brown fox",
    "fields": ["title", "content"],
    "type": "best_fields"
  }
}

// most_fields：合并所有匹配字段的得分
{
  "multi_match": {
    "query": "quick brown fox",
    "fields": ["title", "content", "summary"],
    "type": "most_fields"
  }
}

// cross_fields：跨字段匹配
{
  "multi_match": {
    "query": "Will Smith",
    "fields": ["first_name", "last_name"],
    "type": "cross_fields"
  }
}

// phrase：短语查询
{
  "multi_match": {
    "query": "quick brown fox",
    "fields": ["title", "content"],
    "type": "phrase"
  }
}
```

### match_all 查询

**匹配所有文档**：

```json
GET /products/_search
{
  "query": {
    "match_all": {}
  }
}
```

### match_none 查询

**不匹配任何文档**：

```json
GET /products/_search
{
  "query": {
    "match_none": {}
  }
}
```

## 精确查询

### term 查询

**精确匹配**，不分词：

```json
GET /products/_search
{
  "query": {
    "term": {
      "status": "active"
    }
  }
}
// 仅匹配 status 字段完全等于 "active" 的文档
```

**注意事项**：

```json
// ❌ 错误：在 text 字段上使用 term 查询
GET /articles/_search
{
  "query": {
    "term": {
      "title": "Elasticsearch"  // title 是 text 类型，会被分词为 "elasticsearch"
    }
  }
}
// 无法匹配（大小写不一致）

// ✅ 正确：使用 match 查询
GET /articles/_search
{
  "query": {
    "match": {
      "title": "Elasticsearch"
    }
  }
}

// ✅ 或使用 keyword 子字段
GET /articles/_search
{
  "query": {
    "term": {
      "title.keyword": "Elasticsearch Tutorial"
    }
  }
}
```

### terms 查询

**匹配多个值**（IN 查询）：

```json
GET /products/_search
{
  "query": {
    "terms": {
      "status": ["active", "pending", "processing"]
    }
  }
}
// 匹配 status 为 active、pending 或 processing 的文档
```

### range 查询

**范围查询**：

```json
GET /products/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 100,   // >=
        "lte": 200    // <=
      }
    }
  }
}
```

**范围操作符**：
- **gte**：大于等于（>=）
- **gt**：大于（>）
- **lte**：小于等于（<=）
- **lt**：小于（<）

**日期范围**：

```json
GET /logs/_search
{
  "query": {
    "range": {
      "timestamp": {
        "gte": "2024-01-01",
        "lte": "2024-01-31"
      }
    }
  }
}

// 使用相对时间
GET /logs/_search
{
  "query": {
    "range": {
      "timestamp": {
        "gte": "now-7d/d",  // 最近7天
        "lte": "now/d"
      }
    }
  }
}
```

**日期数学表达式**：
- `now`：当前时间
- `+1h`：加1小时
- `-1d`：减1天
- `/d`：向下取整到天

### exists 查询

**字段存在查询**：

```json
GET /products/_search
{
  "query": {
    "exists": {
      "field": "description"
    }
  }
}
// 匹配包含 description 字段的文档
```

**字段不存在**：

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must_not": {
        "exists": {
          "field": "description"
        }
      }
    }
  }
}
```

### prefix 查询

**前缀查询**：

```json
GET /products/_search
{
  "query": {
    "prefix": {
      "name": "iphone"
    }
  }
}
// 匹配 name 以 "iphone" 开头的文档
```

### wildcard 查询

**通配符查询**：

```json
GET /products/_search
{
  "query": {
    "wildcard": {
      "name": "*phone*"
    }
  }
}
```

**通配符**：
- `*`：匹配零个或多个字符
- `?`：匹配单个字符

**性能警告**：通配符查询性能较低，避免以通配符开头。

### regexp 查询

**正则表达式查询**：

```json
GET /products/_search
{
  "query": {
    "regexp": {
      "name": "iphone[0-9]+"
    }
  }
}
```

## 布尔查询（Bool Query）

**组合多个查询条件**：

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [ ... ],       // 必须匹配（AND，影响得分）
      "filter": [ ... ],     // 必须匹配（AND，不影响得分）
      "should": [ ... ],     // 至少匹配一个（OR，影响得分）
      "must_not": [ ... ]    // 必须不匹配（NOT，不影响得分）
    }
  }
}
```

### must 子句

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "iPhone" } },
        { "range": { "price": { "gte": 5000 } } }
      ]
    }
  }
}
// name 包含 "iPhone" AND price >= 5000
```

### filter 子句

```json
GET /products/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "status": "active" } },
        { "range": { "stock": { "gt": 0 } } }
      ]
    }
  }
}
// status = "active" AND stock > 0（不计算得分）
```

### should 子句

```json
GET /products/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "category": "electronics" } },
        { "match": { "category": "phones" } }
      ]
    }
  }
}
// category = "electronics" OR category = "phones"
```

**minimum_should_match**：

```json
GET /products/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "tags": "sale" } },
        { "match": { "tags": "new" } },
        { "match": { "tags": "popular" } }
      ],
      "minimum_should_match": 2
    }
  }
}
// 至少匹配 2 个 should 条件
```

### must_not 子句

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must_not": [
        { "term": { "status": "deleted" } },
        { "range": { "price": { "lt": 0 } } }
      ]
    }
  }
}
// status != "deleted" AND price >= 0
```

### 复杂布尔查询示例

```json
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
      ],
      "should": [
        { "term": { "tags": "sale" } },
        { "term": { "brand": "Apple" } }
      ],
      "must_not": [
        { "term": { "category": "refurbished" } }
      ],
      "minimum_should_match": 1
    }
  }
}
```

## query vs filter 的区别

### 核心差异

| 特性 | query | filter |
|------|-------|--------|
| **评分** | 计算相关性得分 | 不计算得分（得分为0） |
| **缓存** | 不缓存 | 自动缓存 |
| **性能** | 较慢 | 更快 |
| **使用场景** | 全文搜索、相关性排序 | 精确过滤、结构化数据 |

### 使用建议

```json
// ✅ 推荐：filter 用于精确过滤
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "phone" } }  // 需要评分
      ],
      "filter": [
        { "term": { "status": "active" } },  // 不需要评分
        { "range": { "price": { "gte": 1000 } } }
      ]
    }
  }
}

// ❌ 不推荐：must 用于精确过滤
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "phone" } },
        { "term": { "status": "active" } },  // 应该用 filter
        { "range": { "price": { "gte": 1000 } } }
      ]
    }
  }
}
```

## 常量分数查询（Constant Score）

**包装 filter 查询，返回固定得分**：

```json
GET /products/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": { "status": "active" }
      },
      "boost": 1.2
    }
  }
}
// 所有匹配文档的得分都是 1.2
```

## 查询结果结构

```json
{
  "took": 5,                 // 查询耗时（毫秒）
  "timed_out": false,        // 是否超时
  "_shards": {
    "total": 5,              // 总分片数
    "successful": 5,         // 成功的分片数
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 100,          // 匹配的文档总数
      "relation": "eq"       // "eq"（精确）或 "gte"（大于等于）
    },
    "max_score": 1.5,        // 最高得分
    "hits": [
      {
        "_index": "products",
        "_id": "1",
        "_score": 1.5,       // 相关性得分
        "_source": { ... }   // 文档内容
      }
    ]
  }
}
```

## 实战案例

### 案例1：电商商品搜索

```json
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "iPhone 14",
            "fields": ["name^3", "description"],
            "type": "best_fields"
          }
        }
      ],
      "filter": [
        { "term": { "status": "active" } },
        { "range": { "stock": { "gt": 0 } } },
        { "range": { "price": { "gte": 5000, "lte": 10000 } } }
      ],
      "should": [
        { "term": { "brand": "Apple" } },
        { "term": { "tags": "sale" } }
      ],
      "minimum_should_match": 1
    }
  },
  "sort": [
    { "_score": "desc" },
    { "sales_count": "desc" }
  ],
  "from": 0,
  "size": 20
}
```

### 案例2：日志查询

```json
GET /logs/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "message": "error" } }
      ],
      "filter": [
        {
          "range": {
            "timestamp": {
              "gte": "now-1h",
              "lte": "now"
            }
          }
        },
        { "term": { "level": "ERROR" } }
      ],
      "must_not": [
        { "term": { "host": "test-server" } }
      ]
    }
  },
  "sort": [
    { "timestamp": "desc" }
  ],
  "size": 100
}
```

## 总结

**Query DSL 核心概念**：
- **全文查询**：match、match_phrase、multi_match（分词）
- **精确查询**：term、terms、range、exists（不分词）
- **布尔查询**：must、filter、should、must_not

**query vs filter**：
- **query**：计算得分，用于全文搜索
- **filter**：不计算得分，可缓存，用于精确过滤

**布尔查询子句**：
- **must**：必须匹配，影响得分
- **filter**：必须匹配，不影响得分
- **should**：至少匹配一个（可选）
- **must_not**：必须不匹配

**最佳实践**：
- 全文搜索用 match/multi_match
- 精确过滤用 term/range + filter
- 组合条件用 bool 查询
- 优先使用 filter（性能更好）

**下一步**：学习查询执行流程，理解分布式查询的协调过程。

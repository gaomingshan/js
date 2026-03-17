# 高级查询特性

## 概述

Elasticsearch 提供了丰富的高级查询特性，包括高亮显示、搜索建议、模糊查询、地理位置查询等，满足各种复杂的搜索需求。

## 高亮（Highlight）

### 基本高亮

```json
GET /articles/_search
{
  "query": {
    "match": {
      "content": "elasticsearch"
    }
  },
  "highlight": {
    "fields": {
      "content": {}
    }
  }
}

// 响应
{
  "hits": {
    "hits": [
      {
        "_source": {
          "content": "Elasticsearch is a powerful search engine..."
        },
        "highlight": {
          "content": [
            "<em>Elasticsearch</em> is a powerful search engine..."
          ]
        }
      }
    ]
  }
}
```

### 自定义高亮标签

```json
{
  "highlight": {
    "pre_tags": ["<strong>"],
    "post_tags": ["</strong>"],
    "fields": {
      "content": {}
    }
  }
}

// 结果
"<strong>Elasticsearch</strong> is a powerful search engine..."
```

### 多字段高亮

```json
{
  "highlight": {
    "fields": {
      "title": {},
      "content": {},
      "summary": {}
    }
  }
}
```

### 片段大小与数量

```json
{
  "highlight": {
    "fields": {
      "content": {
        "fragment_size": 150,     // 片段大小（字符数）
        "number_of_fragments": 3  // 返回片段数量
      }
    }
  }
}
```

### 高亮器类型

```json
{
  "highlight": {
    "type": "unified",  // unified, plain, fvh
    "fields": {
      "content": {}
    }
  }
}
```

**高亮器对比**：

| 类型 | 性能 | 功能 | 推荐场景 |
|------|------|------|---------|
| **unified** | 快 | 强大 | 默认推荐 |
| **plain** | 中 | 基础 | 简单场景 |
| **fvh** | 最快 | 需要 term_vector | 大文档 |

### 高亮策略

```json
{
  "highlight": {
    "fields": {
      "content": {
        "type": "fvh",
        "matched_fields": ["content", "content.plain"]
      }
    }
  }
}
```

## 搜索建议（Suggester）

### Term Suggester（词项建议）

**拼写纠错**：

```json
POST /articles/_search
{
  "suggest": {
    "text": "elasticsearc",  // 拼写错误
    "my_suggestion": {
      "term": {
        "field": "title"
      }
    }
  }
}

// 响应
{
  "suggest": {
    "my_suggestion": [
      {
        "text": "elasticsearc",
        "offset": 0,
        "length": 12,
        "options": [
          {
            "text": "elasticsearch",
            "score": 0.8,
            "freq": 100
          }
        ]
      }
    ]
  }
}
```

### Phrase Suggester（短语建议）

**短语纠错**：

```json
{
  "suggest": {
    "text": "elastic serch",
    "my_phrase": {
      "phrase": {
        "field": "title",
        "size": 3,
        "gram_size": 2,
        "direct_generator": [
          {
            "field": "title",
            "suggest_mode": "always"
          }
        ]
      }
    }
  }
}
```

### Completion Suggester（自动补全）

**索引时配置**：

```json
PUT /products
{
  "mappings": {
    "properties": {
      "name_suggest": {
        "type": "completion"
      }
    }
  }
}

POST /products/_doc/1
{
  "name": "iPhone 14 Pro",
  "name_suggest": {
    "input": ["iPhone 14 Pro", "iPhone 14", "iPhone"]
  }
}
```

**查询**：

```json
POST /products/_search
{
  "suggest": {
    "product_suggest": {
      "prefix": "iph",
      "completion": {
        "field": "name_suggest",
        "size": 5,
        "skip_duplicates": true
      }
    }
  }
}

// 响应
{
  "suggest": {
    "product_suggest": [
      {
        "text": "iph",
        "offset": 0,
        "length": 3,
        "options": [
          {
            "text": "iPhone 14 Pro",
            "_score": 1.0,
            "_source": { ... }
          },
          {
            "text": "iPhone 14",
            "_score": 1.0,
            "_source": { ... }
          }
        ]
      }
    ]
  }
}
```

### Context Suggester（上下文建议）

**按类别区分的自动补全**：

```json
PUT /products
{
  "mappings": {
    "properties": {
      "name_suggest": {
        "type": "completion",
        "contexts": [
          {
            "name": "category",
            "type": "category"
          }
        ]
      }
    }
  }
}

POST /products/_doc/1
{
  "name": "iPhone 14",
  "category": "electronics",
  "name_suggest": {
    "input": ["iPhone 14"],
    "contexts": {
      "category": ["electronics"]
    }
  }
}

// 查询时指定上下文
POST /products/_search
{
  "suggest": {
    "product_suggest": {
      "prefix": "iph",
      "completion": {
        "field": "name_suggest",
        "contexts": {
          "category": ["electronics"]
        }
      }
    }
  }
}
```

## 模糊查询（Fuzzy Query）

### 基本模糊查询

```json
GET /products/_search
{
  "query": {
    "fuzzy": {
      "name": {
        "value": "iphon",  // 拼写错误
        "fuzziness": "AUTO"
      }
    }
  }
}
// 匹配 "iPhone"
```

**fuzziness 参数**：
- **0**：完全匹配
- **1**：允许 1 个字符差异
- **2**：允许 2 个字符差异
- **AUTO**：自动根据词长度调整（推荐）
  - 0-2 字符：0
  - 3-5 字符：1
  - 5+ 字符：2

### match 查询的模糊匹配

```json
{
  "query": {
    "match": {
      "name": {
        "query": "iphon",
        "fuzziness": "AUTO",
        "prefix_length": 0,
        "max_expansions": 50
      }
    }
  }
}
```

**参数说明**：
- **prefix_length**：前缀必须匹配的字符数
- **max_expansions**：最大扩展词项数

## 地理位置查询（Geo Query）

### Geo Point 类型

```json
PUT /locations
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      }
    }
  }
}

POST /locations/_doc/1
{
  "name": "Forbidden City",
  "location": {
    "lat": 39.9163,
    "lon": 116.3972
  }
}

// 或数组格式
"location": [116.3972, 39.9163]  // [lon, lat]

// 或字符串格式
"location": "39.9163,116.3972"   // "lat,lon"
```

### geo_distance（距离查询）

```json
GET /locations/_search
{
  "query": {
    "geo_distance": {
      "distance": "5km",
      "location": {
        "lat": 39.9042,
        "lon": 116.4074
      }
    }
  }
}
// 查询距离天安门 5 公里内的位置
```

**距离单位**：
- **km**：千米
- **m**：米
- **mi**：英里
- **ft**：英尺

### geo_bounding_box（矩形范围查询）

```json
{
  "query": {
    "geo_bounding_box": {
      "location": {
        "top_left": {
          "lat": 40.73,
          "lon": -74.1
        },
        "bottom_right": {
          "lat": 40.01,
          "lon": -71.12
        }
      }
    }
  }
}
```

### geo_polygon（多边形查询）

```json
{
  "query": {
    "geo_polygon": {
      "location": {
        "points": [
          { "lat": 40.73, "lon": -74.1 },
          { "lat": 40.01, "lon": -71.12 },
          { "lat": 50.56, "lon": -90.58 }
        ]
      }
    }
  }
}
```

### 地理距离排序

```json
{
  "sort": [
    {
      "_geo_distance": {
        "location": {
          "lat": 39.9042,
          "lon": 116.4074
        },
        "order": "asc",
        "unit": "km",
        "mode": "min",
        "distance_type": "arc"
      }
    }
  ]
}
```

### 地理距离聚合

```json
{
  "aggs": {
    "distance_ranges": {
      "geo_distance": {
        "field": "location",
        "origin": "39.9042,116.4074",
        "unit": "km",
        "ranges": [
          { "to": 1 },
          { "from": 1, "to": 5 },
          { "from": 5, "to": 10 },
          { "from": 10 }
        ]
      }
    }
  }
}
```

## 嵌套文档查询（Nested Query）

```json
GET /company/_search
{
  "query": {
    "nested": {
      "path": "employees",
      "query": {
        "bool": {
          "must": [
            { "match": { "employees.name": "Alice" } },
            { "range": { "employees.age": { "gte": 30 } } }
          ]
        }
      },
      "inner_hits": {
        "name": "matched_employees"
      }
    }
  }
}

// 响应包含匹配的嵌套对象
{
  "hits": {
    "hits": [
      {
        "_source": { ... },
        "inner_hits": {
          "matched_employees": {
            "hits": {
              "hits": [
                {
                  "_source": {
                    "name": "Alice",
                    "age": 35
                  }
                }
              ]
            }
          }
        }
      }
    ]
  }
}
```

## 父子文档查询（Parent-Child）

### has_child 查询

```json
// 查询有满足条件的子文档的父文档
GET /company/_search
{
  "query": {
    "has_child": {
      "type": "employee",
      "query": {
        "range": {
          "age": { "gte": 30 }
        }
      },
      "inner_hits": {}
    }
  }
}
```

### has_parent 查询

```json
// 查询父文档满足条件的子文档
GET /company/_search
{
  "query": {
    "has_parent": {
      "parent_type": "company",
      "query": {
        "match": {
          "name": "Tech Corp"
        }
      }
    }
  }
}
```

## 搜索模板（Search Template）

**参数化查询**：

```json
// 创建搜索模板
POST /_scripts/product_search_template
{
  "script": {
    "lang": "mustache",
    "source": {
      "query": {
        "bool": {
          "must": [
            { "match": { "name": "{{query_string}}" } }
          ],
          "filter": [
            { "range": { "price": { "gte": "{{min_price}}", "lte": "{{max_price}}" } } }
          ]
        }
      }
    }
  }
}

// 使用模板
GET /products/_search/template
{
  "id": "product_search_template",
  "params": {
    "query_string": "phone",
    "min_price": 1000,
    "max_price": 5000
  }
}
```

## 多索引查询

```json
// 查询多个索引
GET /products,orders/_search
{
  "query": { "match_all": {} }
}

// 使用通配符
GET /logs-*/_search
{
  "query": { "match_all": {} }
}

// 排除特定索引
GET /logs-*,-logs-2024.01.01/_search
{
  "query": { "match_all": {} }
}
```

## 返回字段控制

### _source 过滤

```json
// 不返回 _source
GET /products/_search
{
  "query": { "match_all": {} },
  "_source": false
}

// 返回特定字段
{
  "_source": ["name", "price"]
}

// 包含/排除字段
{
  "_source": {
    "includes": ["name", "price"],
    "excludes": ["internal_*"]
  }
}
```

### stored_fields

```json
{
  "stored_fields": ["name", "price"],
  "query": { "match_all": {} }
}
```

### docvalue_fields

```json
{
  "docvalue_fields": ["price", "created_at"],
  "query": { "match_all": {} }
}
```

## 实战案例

### 案例1：电商商品搜索（综合）

```json
GET /products/_search
{
  "query": {
    "function_score": {
      "query": {
        "bool": {
          "must": [
            {
              "multi_match": {
                "query": "iPhone 14",
                "fields": ["name^3", "description"],
                "fuzziness": "AUTO"
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
      "functions": [
        {
          "field_value_factor": {
            "field": "sales_count",
            "modifier": "log1p"
          }
        }
      ]
    }
  },
  "highlight": {
    "fields": {
      "name": {},
      "description": {
        "fragment_size": 150,
        "number_of_fragments": 2
      }
    }
  },
  "suggest": {
    "product_suggest": {
      "text": "iph",
      "completion": {
        "field": "name_suggest",
        "size": 5
      }
    }
  },
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 5000 },
          { "from": 5000, "to": 10000 },
          { "from": 10000 }
        ]
      }
    },
    "top_brands": {
      "terms": {
        "field": "brand.keyword",
        "size": 10
      }
    }
  },
  "from": 0,
  "size": 20,
  "_source": ["name", "price", "brand", "image"]
}
```

### 案例2：LBS 附近门店搜索

```json
GET /stores/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "type": "restaurant" } }
      ],
      "filter": [
        {
          "geo_distance": {
            "distance": "5km",
            "location": {
              "lat": 39.9042,
              "lon": 116.4074
            }
          }
        }
      ]
    }
  },
  "sort": [
    {
      "_geo_distance": {
        "location": {
          "lat": 39.9042,
          "lon": 116.4074
        },
        "order": "asc",
        "unit": "km"
      }
    }
  ],
  "aggs": {
    "distance_distribution": {
      "geo_distance": {
        "field": "location",
        "origin": "39.9042,116.4074",
        "unit": "km",
        "ranges": [
          { "to": 1 },
          { "from": 1, "to": 3 },
          { "from": 3, "to": 5 }
        ]
      }
    }
  }
}
```

## 总结

**高亮显示**：
- 自定义高亮标签
- 控制片段大小和数量
- 选择合适的高亮器（unified、plain、fvh）

**搜索建议**：
- **Term Suggester**：拼写纠错
- **Phrase Suggester**：短语纠错
- **Completion Suggester**：自动补全
- **Context Suggester**：上下文建议

**模糊查询**：
- fuzziness 参数（AUTO 推荐）
- 编辑距离容错

**地理位置查询**：
- **geo_distance**：距离查询
- **geo_bounding_box**：矩形范围
- **geo_polygon**：多边形
- 地理距离排序和聚合

**嵌套与父子文档**：
- **Nested**：保持数组对象关联
- **Parent-Child**：独立更新

**搜索模板**：
- 参数化查询
- 复用查询逻辑

**下一步**：学习分布式读写流程详解，理解分布式环境下的数据操作。

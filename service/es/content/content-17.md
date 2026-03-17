# 相关性算分与排序

## 概述

Elasticsearch 的搜索结果按相关性得分（_score）排序，理解算分机制和排序方法是优化搜索体验的关键。

## 相关性算分算法

### TF-IDF 算法（ES 5.0 之前）

**词频-逆文档频率算法**：

```
score = TF × IDF

TF (Term Frequency)：词频
  - 词在文档中出现的次数
  - 出现越多，得分越高

IDF (Inverse Document Frequency)：逆文档频率
  - 词在所有文档中的稀有程度
  - 越稀有，得分越高
```

**公式**：

```
TF(t, d) = √frequency
IDF(t) = 1 + ln(maxDocs / (docCount + 1))
score = TF × IDF × fieldNorm
```

### BM25 算法（ES 5.0+ 默认）

**Best Match 25 算法**，改进的 TF-IDF：

```
score = IDF × (TF × (k1 + 1)) / (TF + k1 × (1 - b + b × (dl / avgdl)))
```

**参数说明**：
- **TF**：词频
- **IDF**：逆文档频率
- **dl**：文档长度
- **avgdl**：平均文档长度
- **k1**：词频饱和参数（默认 1.2）
- **b**：长度归一化参数（默认 0.75）

**BM25 优势**：
- 解决词频饱和问题（词频增加，得分增益递减）
- 考虑文档长度（长文档不会因为词频高而得分过高）
- 更符合实际搜索体验

### 配置相似度算法

```json
PUT /my_index
{
  "settings": {
    "index": {
      "similarity": {
        "default": {
          "type": "BM25",
          "k1": 1.2,
          "b": 0.75
        }
      }
    }
  }
}

// 字段级别配置
PUT /my_index
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "similarity": "BM25"
      },
      "content": {
        "type": "text",
        "similarity": "classic"  // TF-IDF
      }
    }
  }
}
```

## 字段权重（Boosting）

### 查询时 Boosting

```json
// 单字段 Boosting
GET /articles/_search
{
  "query": {
    "match": {
      "title": {
        "query": "elasticsearch",
        "boost": 2.0  // title 权重 × 2
      }
    }
  }
}

// 多字段 Boosting
GET /articles/_search
{
  "query": {
    "multi_match": {
      "query": "elasticsearch tutorial",
      "fields": ["title^3", "summary^2", "content"]
    }
  }
}
// title 权重 × 3
// summary 权重 × 2
// content 权重 × 1（默认）
```

### Bool 查询 Boosting

```json
GET /products/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "name": {
              "query": "phone",
              "boost": 2.0
            }
          }
        },
        {
          "match": {
            "description": {
              "query": "phone",
              "boost": 1.0
            }
          }
        }
      ]
    }
  }
}
```

### 索引时 Boosting（不推荐）

```json
// 已废弃，不推荐使用
PUT /articles/_doc/1
{
  "title": {
    "value": "Elasticsearch Tutorial",
    "boost": 2.0  // 索引时权重
  }
}
```

## 函数评分（Function Score）

### 基本语法

```json
GET /products/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "name": "phone" } },
      "functions": [
        {
          "filter": { "range": { "price": { "lte": 1000 } } },
          "weight": 2
        }
      ],
      "score_mode": "sum",
      "boost_mode": "multiply"
    }
  }
}
```

### 评分函数类型

#### 1. weight（权重）

```json
{
  "function_score": {
    "query": { "match": { "name": "phone" } },
    "functions": [
      {
        "filter": { "term": { "brand": "Apple" } },
        "weight": 3  // Apple 品牌的文档得分 × 3
      }
    ]
  }
}
```

#### 2. field_value_factor（字段值因子）

```json
// 根据字段值影响得分
{
  "function_score": {
    "query": { "match": { "name": "phone" } },
    "functions": [
      {
        "field_value_factor": {
          "field": "sales_count",  // 销量字段
          "factor": 1.2,           // 乘数
          "modifier": "log1p",     // 修饰符
          "missing": 1             // 字段缺失时的默认值
        }
      }
    ]
  }
}
```

**modifier 选项**：
- **none**：不修改
- **log**：log(value)
- **log1p**：log(1 + value)
- **log2p**：log(2 + value)
- **ln**：ln(value)
- **ln1p**：ln(1 + value)
- **ln2p**：ln(2 + value)
- **square**：value²
- **sqrt**：√value
- **reciprocal**：1 / value

#### 3. random_score（随机分数）

```json
// 随机打乱结果
{
  "function_score": {
    "query": { "match_all": {} },
    "random_score": {
      "seed": 12345,  // 随机种子（相同种子结果相同）
      "field": "_seq_no"
    }
  }
}
```

#### 4. decay functions（衰减函数）

**根据数值、日期、地理距离衰减得分**：

```json
// 日期衰减：越新的文档得分越高
{
  "function_score": {
    "query": { "match": { "name": "phone" } },
    "functions": [
      {
        "gauss": {
          "created_at": {
            "origin": "2024-01-15",  // 基准日期
            "scale": "10d",          // 衰减范围
            "offset": "5d",          // 不衰减的范围
            "decay": 0.5             // 衰减系数
          }
        }
      }
    ]
  }
}

// 地理距离衰减：距离越近得分越高
{
  "function_score": {
    "query": { "match": { "type": "restaurant" } },
    "functions": [
      {
        "gauss": {
          "location": {
            "origin": "39.9042,116.4074",  // 当前位置
            "scale": "5km",
            "offset": "1km",
            "decay": 0.5
          }
        }
      }
    ]
  }
}
```

**衰减函数类型**：
- **linear**：线性衰减
- **exp**：指数衰减
- **gauss**：高斯衰减（推荐）

### score_mode 和 boost_mode

**score_mode**：多个函数得分的组合方式

```json
{
  "function_score": {
    "functions": [ ... ],
    "score_mode": "sum"  // multiply, avg, max, min, sum, first
  }
}
```

**boost_mode**：函数得分与查询得分的组合方式

```json
{
  "function_score": {
    "query": { ... },
    "functions": [ ... ],
    "boost_mode": "multiply"  // multiply, replace, sum, avg, max, min
  }
}
```

**组合示例**：

```
原始查询得分：10
函数得分：5

boost_mode = multiply：10 × 5 = 50
boost_mode = sum：10 + 5 = 15
boost_mode = replace：5（使用函数得分）
```

### 实战案例：电商搜索排序

```json
GET /products/_search
{
  "query": {
    "function_score": {
      "query": {
        "multi_match": {
          "query": "iPhone 14",
          "fields": ["name^3", "description"]
        }
      },
      "functions": [
        {
          "filter": { "term": { "is_official": true } },
          "weight": 1.5  // 官方旗舰店权重
        },
        {
          "field_value_factor": {
            "field": "sales_count",
            "factor": 0.1,
            "modifier": "log1p"  // 销量影响
          }
        },
        {
          "gauss": {
            "created_at": {
              "origin": "now",
              "scale": "30d",  // 30天内的新品得分高
              "decay": 0.5
            }
          }
        }
      ],
      "score_mode": "sum",
      "boost_mode": "multiply"
    }
  }
}
```

## 脚本评分（Script Score）

**使用 Painless 脚本自定义评分逻辑**：

```json
GET /products/_search
{
  "query": {
    "script_score": {
      "query": { "match": { "name": "phone" } },
      "script": {
        "source": "Math.log(2 + doc['sales_count'].value) * params.factor",
        "params": {
          "factor": 1.2
        }
      }
    }
  }
}
```

**复杂脚本示例**：

```json
{
  "script_score": {
    "query": { "match_all": {} },
    "script": {
      "source": """
        double price = doc['price'].value;
        double discount = doc['discount'].value;
        double finalPrice = price * (1 - discount);
        return _score * (1 / (1 + finalPrice / 1000));
      """
    }
  }
}
```

## 排序（Sort）

### 单字段排序

```json
GET /products/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "price": "asc" }  // 价格升序
  ]
}

// 降序
{
  "sort": [
    { "price": "desc" }
  ]
}
```

### 多字段排序

```json
GET /products/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "_score": "desc" },      // 先按得分降序
    { "sales_count": "desc" }, // 再按销量降序
    { "price": "asc" }         // 最后按价格升序
  ]
}
```

### 缺失值处理

```json
{
  "sort": [
    {
      "price": {
        "order": "asc",
        "missing": "_last"  // 缺失值排最后（_first 排最前）
      }
    }
  ]
}
```

### 脚本排序

```json
{
  "sort": {
    "_script": {
      "type": "number",
      "script": {
        "source": "doc['price'].value * (1 - doc['discount'].value)"
      },
      "order": "asc"
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
        "unit": "km"
      }
    }
  ]
}
```

### 嵌套字段排序

```json
{
  "sort": [
    {
      "comments.rating": {
        "order": "desc",
        "mode": "avg",  // avg, min, max, sum, median
        "nested": {
          "path": "comments"
        }
      }
    }
  ]
}
```

## Explain API

**解释文档得分计算**：

```bash
GET /products/_explain/1
{
  "query": {
    "function_score": {
      "query": { "match": { "name": "phone" } },
      "functions": [
        {
          "field_value_factor": {
            "field": "sales_count",
            "factor": 0.1
          }
        }
      ]
    }
  }
}
```

**响应示例**：

```json
{
  "matched": true,
  "_explanation": {
    "value": 5.2,
    "description": "function score, product of:",
    "details": [
      {
        "value": 2.5,
        "description": "weight(name:phone in 0) [PerFieldSimilarity]"
      },
      {
        "value": 2.08,
        "description": "Math.min(weight, 3.4028235E38), result of:",
        "details": [
          {
            "value": 2.08,
            "description": "field value function: log1p(doc['sales_count'].value?:0.0 * factor=0.1)"
          }
        ]
      }
    ]
  }
}
```

## 最佳实践

### 1. 合理使用 Boosting

```json
// ✅ 推荐：适度 Boosting
{
  "multi_match": {
    "query": "elasticsearch",
    "fields": ["title^2", "content"]  // title 权重 × 2
  }
}

// ❌ 不推荐：过度 Boosting
{
  "multi_match": {
    "query": "elasticsearch",
    "fields": ["title^100", "content"]  // 过高的权重
  }
}
```

### 2. 使用 Function Score 实现业务逻辑

```json
// 电商排序：相关性 + 销量 + 新品
{
  "function_score": {
    "query": { "match": { "name": "phone" } },
    "functions": [
      { "field_value_factor": { "field": "sales_count", "modifier": "log1p" } },
      { "gauss": { "created_at": { "origin": "now", "scale": "30d" } } }
    ],
    "score_mode": "sum",
    "boost_mode": "multiply"
  }
}
```

### 3. 排序优化

```json
// ✅ 推荐：使用 Doc Values 字段排序
{
  "sort": [
    { "price": "asc" }  // keyword、数值、日期字段
  ]
}

// ❌ 不推荐：text 字段排序
{
  "sort": [
    { "title": "asc" }  // text 字段需要 fielddata（内存占用大）
  ]
}

// ✅ 正确：使用 keyword 子字段
{
  "sort": [
    { "title.keyword": "asc" }
  ]
}
```

### 4. 避免过度复杂的评分逻辑

```
- 函数不宜过多（< 5个）
- 脚本评分影响性能
- 评测实际效果，避免过度优化
```

## 监控与调优

### 查看查询得分分布

```bash
GET /products/_search
{
  "query": { ... },
  "aggs": {
    "score_distribution": {
      "histogram": {
        "script": "_score",
        "interval": 1
      }
    }
  }
}
```

### A/B 测试不同评分策略

```
1. 记录原始得分
2. 应用新评分策略
3. 对比点击率、转化率等业务指标
4. 选择效果最好的策略
```

## 总结

**相关性算分**：
- **TF-IDF**：词频 × 逆文档频率（ES 5.0 之前）
- **BM25**：改进的 TF-IDF，考虑词频饱和和文档长度（ES 5.0+ 默认）

**字段权重**：
- 查询时 Boosting：`title^3`
- Bool 查询中的权重
- 不推荐索引时 Boosting

**函数评分**：
- **weight**：固定权重
- **field_value_factor**：根据字段值影响得分
- **random_score**：随机排序
- **decay functions**：衰减函数（日期、距离）

**排序**：
- 单字段、多字段排序
- 缺失值处理
- 地理距离排序
- 嵌套字段排序

**最佳实践**：
- 适度使用 Boosting
- 业务逻辑使用 Function Score
- 使用 Doc Values 字段排序
- 避免过度复杂的评分逻辑

**下一步**：学习聚合分析（Aggregations），实现复杂的数据统计与分析。

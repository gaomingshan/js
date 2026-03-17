# 聚合分析（Aggregations）

## 概述

聚合分析是 Elasticsearch 的核心功能之一，提供了强大的数据统计和分析能力，类似于 SQL 的 GROUP BY 和聚合函数。

## 聚合类型

### 三大类聚合

```
1. Metrics Aggregations（度量聚合）
   - 计算数值统计：sum、avg、min、max、stats、cardinality
   
2. Bucket Aggregations（桶聚合）
   - 分组统计：terms、range、date_histogram、histogram
   
3. Pipeline Aggregations（管道聚合）
   - 对聚合结果再聚合：derivative、cumulative_sum、moving_avg
```

## Metrics Aggregations（度量聚合）

### avg（平均值）

```json
GET /products/_search
{
  "size": 0,
  "aggs": {
    "avg_price": {
      "avg": {
        "field": "price"
      }
    }
  }
}

// 响应
{
  "aggregations": {
    "avg_price": {
      "value": 5999.5
    }
  }
}
```

### sum（求和）

```json
{
  "aggs": {
    "total_sales": {
      "sum": {
        "field": "sales_amount"
      }
    }
  }
}
```

### min / max（最小值 / 最大值）

```json
{
  "aggs": {
    "min_price": {
      "min": { "field": "price" }
    },
    "max_price": {
      "max": { "field": "price" }
    }
  }
}
```

### stats（统计）

```json
{
  "aggs": {
    "price_stats": {
      "stats": {
        "field": "price"
      }
    }
  }
}

// 响应
{
  "aggregations": {
    "price_stats": {
      "count": 100,
      "min": 999.0,
      "max": 9999.0,
      "avg": 5999.5,
      "sum": 599950.0
    }
  }
}
```

### extended_stats（扩展统计）

```json
{
  "aggs": {
    "price_extended_stats": {
      "extended_stats": {
        "field": "price"
      }
    }
  }
}

// 响应：包含方差、标准差等
{
  "aggregations": {
    "price_extended_stats": {
      "count": 100,
      "min": 999.0,
      "max": 9999.0,
      "avg": 5999.5,
      "sum": 599950.0,
      "sum_of_squares": 4.5E9,
      "variance": 5000000.0,
      "std_deviation": 2236.07,
      "std_deviation_bounds": {
        "upper": 10471.64,
        "lower": 1527.36
      }
    }
  }
}
```

### cardinality（去重计数）

```json
{
  "aggs": {
    "unique_users": {
      "cardinality": {
        "field": "user_id"
      }
    }
  }
}

// 响应：唯一用户数
{
  "aggregations": {
    "unique_users": {
      "value": 1250
    }
  }
}
```

**注意**：cardinality 是近似算法（HyperLogLog++），大数据集误差约 3%。

### percentiles（百分位数）

```json
{
  "aggs": {
    "price_percentiles": {
      "percentiles": {
        "field": "price",
        "percents": [25, 50, 75, 95, 99]
      }
    }
  }
}

// 响应
{
  "aggregations": {
    "price_percentiles": {
      "values": {
        "25.0": 2999.0,
        "50.0": 5999.0,
        "75.0": 7999.0,
        "95.0": 9499.0,
        "99.0": 9899.0
      }
    }
  }
}
```

### value_count（计数）

```json
{
  "aggs": {
    "count_prices": {
      "value_count": {
        "field": "price"
      }
    }
  }
}
```

## Bucket Aggregations（桶聚合）

### terms（词项聚合）

**分组统计**，类似 SQL 的 GROUP BY：

```json
GET /products/_search
{
  "size": 0,
  "aggs": {
    "popular_brands": {
      "terms": {
        "field": "brand.keyword",
        "size": 10,
        "order": { "_count": "desc" }
      }
    }
  }
}

// 响应
{
  "aggregations": {
    "popular_brands": {
      "buckets": [
        { "key": "Apple", "doc_count": 500 },
        { "key": "Samsung", "doc_count": 350 },
        { "key": "Huawei", "doc_count": 200 }
      ]
    }
  }
}
```

**参数**：
- **size**：返回桶数量（默认 10）
- **order**：排序方式（`_count`、`_key`）
- **min_doc_count**：最小文档数（默认 1）

### range（范围聚合）

```json
{
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 1000 },
          { "from": 1000, "to": 5000 },
          { "from": 5000, "to": 10000 },
          { "from": 10000 }
        ]
      }
    }
  }
}

// 响应
{
  "aggregations": {
    "price_ranges": {
      "buckets": [
        { "key": "*-1000.0", "to": 1000.0, "doc_count": 50 },
        { "key": "1000.0-5000.0", "from": 1000.0, "to": 5000.0, "doc_count": 200 },
        { "key": "5000.0-10000.0", "from": 5000.0, "to": 10000.0, "doc_count": 150 },
        { "key": "10000.0-*", "from": 10000.0, "doc_count": 100 }
      ]
    }
  }
}
```

### date_histogram（日期直方图）

```json
{
  "aggs": {
    "sales_over_time": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "day",
        "format": "yyyy-MM-dd",
        "min_doc_count": 0
      }
    }
  }
}

// 响应
{
  "aggregations": {
    "sales_over_time": {
      "buckets": [
        { "key_as_string": "2024-01-15", "key": 1705276800000, "doc_count": 120 },
        { "key_as_string": "2024-01-16", "key": 1705363200000, "doc_count": 95 },
        { "key_as_string": "2024-01-17", "key": 1705449600000, "doc_count": 110 }
      ]
    }
  }
}
```

**interval 类型**：
- **calendar_interval**：日历间隔（year、quarter、month、week、day、hour、minute）
- **fixed_interval**：固定间隔（1d、12h、30m、1s）

### histogram（数值直方图）

```json
{
  "aggs": {
    "price_histogram": {
      "histogram": {
        "field": "price",
        "interval": 1000,
        "min_doc_count": 0
      }
    }
  }
}

// 响应
{
  "aggregations": {
    "price_histogram": {
      "buckets": [
        { "key": 0, "doc_count": 30 },
        { "key": 1000, "doc_count": 50 },
        { "key": 2000, "doc_count": 80 },
        { "key": 3000, "doc_count": 120 }
      ]
    }
  }
}
```

### filter（过滤聚合）

```json
{
  "aggs": {
    "apple_products": {
      "filter": {
        "term": { "brand": "Apple" }
      },
      "aggs": {
        "avg_price": {
          "avg": { "field": "price" }
        }
      }
    }
  }
}
```

### filters（多过滤器聚合）

```json
{
  "aggs": {
    "brand_stats": {
      "filters": {
        "filters": {
          "apple": { "term": { "brand": "Apple" } },
          "samsung": { "term": { "brand": "Samsung" } }
        }
      },
      "aggs": {
        "avg_price": {
          "avg": { "field": "price" }
        }
      }
    }
  }
}
```

## 嵌套聚合（Sub-aggregations）

**桶聚合中嵌套度量聚合**：

```json
GET /products/_search
{
  "size": 0,
  "aggs": {
    "group_by_brand": {
      "terms": {
        "field": "brand.keyword"
      },
      "aggs": {
        "avg_price": {
          "avg": { "field": "price" }
        },
        "max_price": {
          "max": { "field": "price" }
        },
        "total_sales": {
          "sum": { "field": "sales_amount" }
        }
      }
    }
  }
}

// 响应
{
  "aggregations": {
    "group_by_brand": {
      "buckets": [
        {
          "key": "Apple",
          "doc_count": 500,
          "avg_price": { "value": 7999.0 },
          "max_price": { "value": 12999.0 },
          "total_sales": { "value": 3999500.0 }
        },
        {
          "key": "Samsung",
          "doc_count": 350,
          "avg_price": { "value": 5999.0 },
          "max_price": { "value": 9999.0 },
          "total_sales": { "value": 2099650.0 }
        }
      ]
    }
  }
}
```

### 多层嵌套

```json
{
  "aggs": {
    "group_by_category": {
      "terms": { "field": "category.keyword" },
      "aggs": {
        "group_by_brand": {
          "terms": { "field": "brand.keyword" },
          "aggs": {
            "avg_price": {
              "avg": { "field": "price" }
            }
          }
        }
      }
    }
  }
}

// 响应：类别 → 品牌 → 平均价格
```

## Pipeline Aggregations（管道聚合）

**对聚合结果再聚合**：

### avg_bucket（桶平均值）

```json
{
  "aggs": {
    "sales_per_day": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "day"
      },
      "aggs": {
        "total_sales": {
          "sum": { "field": "sales_amount" }
        }
      }
    },
    "avg_daily_sales": {
      "avg_bucket": {
        "buckets_path": "sales_per_day>total_sales"
      }
    }
  }
}

// 响应：每天平均销售额
```

### derivative（导数）

```json
{
  "aggs": {
    "sales_per_day": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "day"
      },
      "aggs": {
        "total_sales": {
          "sum": { "field": "sales_amount" }
        },
        "sales_derivative": {
          "derivative": {
            "buckets_path": "total_sales"
          }
        }
      }
    }
  }
}

// 响应：每天销售额的变化量
```

### cumulative_sum（累计和）

```json
{
  "aggs": {
    "sales_per_day": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "day"
      },
      "aggs": {
        "daily_sales": {
          "sum": { "field": "sales_amount" }
        },
        "cumulative_sales": {
          "cumulative_sum": {
            "buckets_path": "daily_sales"
          }
        }
      }
    }
  }
}

// 响应：累计销售额
```

### moving_avg（移动平均）

```json
{
  "aggs": {
    "sales_per_day": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "day"
      },
      "aggs": {
        "daily_sales": {
          "sum": { "field": "sales_amount" }
        },
        "moving_avg_sales": {
          "moving_avg": {
            "buckets_path": "daily_sales",
            "window": 7,
            "model": "simple"
          }
        }
      }
    }
  }
}

// 响应：7天移动平均
```

## 实战案例

### 案例1：电商销售分析

```json
GET /orders/_search
{
  "size": 0,
  "query": {
    "range": {
      "created_at": {
        "gte": "2024-01-01",
        "lte": "2024-01-31"
      }
    }
  },
  "aggs": {
    "daily_sales": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "day"
      },
      "aggs": {
        "total_amount": {
          "sum": { "field": "amount" }
        },
        "order_count": {
          "value_count": { "field": "_id" }
        },
        "avg_amount": {
          "avg": { "field": "amount" }
        },
        "top_products": {
          "terms": {
            "field": "product_id",
            "size": 5
          }
        }
      }
    },
    "category_stats": {
      "terms": {
        "field": "category.keyword",
        "size": 10
      },
      "aggs": {
        "total_sales": {
          "sum": { "field": "amount" }
        },
        "avg_price": {
          "avg": { "field": "price" }
        }
      }
    }
  }
}
```

### 案例2：用户行为分析

```json
GET /user_events/_search
{
  "size": 0,
  "aggs": {
    "active_users": {
      "cardinality": { "field": "user_id" }
    },
    "event_distribution": {
      "terms": {
        "field": "event_type.keyword"
      }
    },
    "hourly_activity": {
      "date_histogram": {
        "field": "timestamp",
        "calendar_interval": "hour"
      },
      "aggs": {
        "unique_users": {
          "cardinality": { "field": "user_id" }
        }
      }
    },
    "conversion_funnel": {
      "filters": {
        "filters": {
          "view": { "term": { "event_type": "view" } },
          "click": { "term": { "event_type": "click" } },
          "purchase": { "term": { "event_type": "purchase" } }
        }
      }
    }
  }
}
```

### 案例3：日志分析

```json
GET /logs/_search
{
  "size": 0,
  "query": {
    "range": {
      "timestamp": {
        "gte": "now-1h"
      }
    }
  },
  "aggs": {
    "error_count": {
      "filter": {
        "term": { "level": "ERROR" }
      }
    },
    "log_levels": {
      "terms": {
        "field": "level.keyword"
      }
    },
    "errors_per_minute": {
      "date_histogram": {
        "field": "timestamp",
        "fixed_interval": "1m"
      },
      "aggs": {
        "error_count": {
          "filter": {
            "term": { "level": "ERROR" }
          }
        }
      }
    },
    "top_error_messages": {
      "filter": {
        "term": { "level": "ERROR" }
      },
      "aggs": {
        "messages": {
          "terms": {
            "field": "message.keyword",
            "size": 10
          }
        }
      }
    }
  }
}
```

## 聚合性能优化

### 1. 使用 Doc Values

```json
// ✅ 推荐：keyword、数值、日期字段默认启用 doc_values
{
  "aggs": {
    "group_by_category": {
      "terms": { "field": "category.keyword" }
    }
  }
}

// ❌ 不推荐：text 字段需要 fielddata（内存占用大）
{
  "aggs": {
    "group_by_title": {
      "terms": { "field": "title" }  // 需要启用 fielddata
    }
  }
}
```

### 2. 限制聚合深度

```
- 避免过深的嵌套（< 3层）
- 限制桶数量（size 参数）
- 使用过滤器减少聚合范围
```

### 3. 禁用 _source

```json
GET /products/_search
{
  "size": 0,  // 仅需要聚合结果，不需要文档
  "aggs": { ... }
}
```

### 4. 使用 Composite Aggregation

**分页聚合，避免一次性返回大量桶**：

```json
{
  "aggs": {
    "composite_agg": {
      "composite": {
        "size": 100,
        "sources": [
          { "category": { "terms": { "field": "category.keyword" } } },
          { "brand": { "terms": { "field": "brand.keyword" } } }
        ]
      }
    }
  }
}

// 下一页
{
  "aggs": {
    "composite_agg": {
      "composite": {
        "size": 100,
        "sources": [ ... ],
        "after": { "category": "electronics", "brand": "Apple" }
      }
    }
  }
}
```

## 常见问题

### 1. 聚合结果不准确

**问题**：terms 聚合可能丢失部分桶

**原因**：每个分片返回 top N，协调节点合并可能遗漏

**解决**：增加 `size` 参数或使用 `shard_size`

```json
{
  "aggs": {
    "top_brands": {
      "terms": {
        "field": "brand.keyword",
        "size": 10,
        "shard_size": 50  // 每个分片返回 50 个
      }
    }
  }
}
```

### 2. 内存不足

**问题**：聚合占用大量内存

**解决**：
- 使用 Doc Values 字段
- 减少聚合深度
- 增加堆内存

### 3. 性能慢

**问题**：聚合查询慢

**解决**：
- 使用过滤器缩小范围
- 避免在 text 字段聚合
- 使用 Composite Aggregation 分页

## 总结

**聚合类型**：
- **Metrics**：统计数值（avg、sum、min、max、stats、cardinality）
- **Bucket**：分组统计（terms、range、date_histogram、histogram）
- **Pipeline**：对聚合结果再聚合（avg_bucket、derivative、cumulative_sum）

**嵌套聚合**：
- 桶聚合中嵌套度量聚合
- 多层分组统计

**性能优化**：
- 使用 Doc Values 字段
- 限制聚合深度和桶数量
- 禁用 _source（size=0）
- 使用 Composite Aggregation 分页

**实战应用**：
- 电商销售分析
- 用户行为分析
- 日志分析

**下一步**：学习高级查询特性，掌握高亮、搜索建议等功能。

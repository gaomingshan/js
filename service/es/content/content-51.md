# Painless 脚本语言

## 概述

Painless 是 Elasticsearch 专用的脚本语言，具有类似 Java 的语法，安全、快速且易于使用。本章介绍 Painless 的语法、使用场景和最佳实践。

## Painless 语法基础

### 基本语法

```javascript
// 变量声明
def x = 10;
int y = 20;
String name = "Elasticsearch";

// 条件语句
if (x > 5) {
    return "large";
} else {
    return "small";
}

// 循环
for (int i = 0; i < 10; i++) {
    // do something
}

// 函数
def add(int a, int b) {
    return a + b;
}
```

### 数据类型

```javascript
// 基本类型
int age = 25;
long timestamp = 1704201600000L;
double price = 99.99;
boolean active = true;

// 字符串
String text = "Hello";
String concat = text + " World";

// 列表
def list = [1, 2, 3, 4, 5];
list.add(6);
int first = list[0];

// Map
def map = ['key1': 'value1', 'key2': 'value2'];
String val = map['key1'];
```

## 脚本使用场景

### 更新脚本

**简单更新**：

```bash
POST /products/_update/1
{
  "script": {
    "source": "ctx._source.price *= params.discount",
    "params": {
      "discount": 0.9
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
      if (ctx._source.stock > 0) {
        ctx._source.stock -= 1;
        ctx._source.sales_count += 1;
      } else {
        ctx.op = 'noop';
      }
    """
  }
}
```

**添加字段**：

```bash
POST /products/_update/1
{
  "script": {
    "source": """
      ctx._source.last_updated = params.now;
      if (!ctx._source.containsKey('tags')) {
        ctx._source.tags = [];
      }
      ctx._source.tags.add(params.tag);
    """,
    "params": {
      "now": "2024-01-15T10:00:00",
      "tag": "bestseller"
    }
  }
}
```

### 查询脚本

**Script Query**：

```bash
GET /products/_search
{
  "query": {
    "script": {
      "script": {
        "source": "doc['price'].value * doc['discount'].value < params.threshold",
        "params": {
          "threshold": 1000
        }
      }
    }
  }
}
```

**Script Field**：

```bash
GET /products/_search
{
  "script_fields": {
    "final_price": {
      "script": {
        "source": "doc['price'].value * (1 - doc['discount'].value)"
      }
    }
  }
}
```

### 聚合脚本

**Scripted Metric Aggregation**：

```bash
GET /orders/_search
{
  "size": 0,
  "aggs": {
    "total_revenue": {
      "scripted_metric": {
        "init_script": "state.transactions = []",
        "map_script": """
          state.transactions.add(doc['amount'].value)
        """,
        "combine_script": """
          double sum = 0;
          for (t in state.transactions) {
            sum += t;
          }
          return sum;
        """,
        "reduce_script": """
          double total = 0;
          for (s in states) {
            total += s;
          }
          return total;
        """
      }
    }
  }
}
```

**Bucket Script**：

```bash
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "month"
      },
      "aggs": {
        "total_sales": {
          "sum": {
            "field": "amount"
          }
        },
        "total_cost": {
          "sum": {
            "field": "cost"
          }
        },
        "profit": {
          "bucket_script": {
            "buckets_path": {
              "sales": "total_sales",
              "cost": "total_cost"
            },
            "script": "params.sales - params.cost"
          }
        }
      }
    }
  }
}
```

### 评分脚本

**Script Score Query**：

```bash
GET /products/_search
{
  "query": {
    "script_score": {
      "query": {
        "match": {
          "name": "iPhone"
        }
      },
      "script": {
        "source": """
          double score = _score;
          score *= Math.log(doc['sales_count'].value + 1);
          score *= (1 + doc['rating'].value / 5.0);
          return score;
        """
      }
    }
  }
}
```

**Function Score**：

```bash
GET /products/_search
{
  "query": {
    "function_score": {
      "query": {
        "match": {
          "category": "electronics"
        }
      },
      "functions": [
        {
          "script_score": {
            "script": {
              "source": "Math.log(doc['sales_count'].value + 1)"
            }
          }
        }
      ],
      "boost_mode": "multiply"
    }
  }
}
```

## 脚本上下文与可用 API

### 可用变量

```javascript
// 文档字段访问
doc['field_name'].value

// _source 访问（更新脚本）
ctx._source.field_name

// 参数访问
params.param_name

// 评分
_score

// 文档 ID
_id
```

### 常用 API

**Math API**：

```javascript
Math.abs(-10)       // 10
Math.max(5, 10)     // 10
Math.min(5, 10)     // 5
Math.sqrt(16)       // 4.0
Math.pow(2, 3)      // 8.0
Math.log(10)        // 2.302...
Math.exp(1)         // 2.718...
```

**String API**：

```javascript
String text = "Elasticsearch";
text.length()           // 13
text.substring(0, 6)    // "Elasti"
text.toLowerCase()      // "elasticsearch"
text.toUpperCase()      // "ELASTICSEARCH"
text.indexOf("search")  // 6
text.contains("search") // true
```

**Collection API**：

```javascript
def list = [1, 2, 3];
list.size()        // 3
list.add(4)        // [1, 2, 3, 4]
list.remove(0)     // [2, 3, 4]
list.contains(2)   // true
```

## 脚本性能优化

### 使用参数化

```bash
# ❌ 不推荐（每次编译）
POST /products/_update/1
{
  "script": {
    "source": "ctx._source.price = ctx._source.price * 0.9"
  }
}

# ✅ 推荐（参数化，可缓存）
POST /products/_update/1
{
  "script": {
    "source": "ctx._source.price *= params.discount",
    "params": {
      "discount": 0.9
    }
  }
}
```

### 使用 doc 而非 _source

```bash
# ❌ 慢（需要解析 _source）
GET /products/_search
{
  "script_fields": {
    "discounted_price": {
      "script": "_source.price * 0.9"
    }
  }
}

# ✅ 快（使用 doc values）
GET /products/_search
{
  "script_fields": {
    "discounted_price": {
      "script": "doc['price'].value * 0.9"
    }
  }
}
```

### 避免复杂逻辑

```javascript
// ❌ 复杂
def score = 0;
for (int i = 0; i < doc['tags'].length; i++) {
    if (doc['tags'][i] == 'hot') {
        score += 10;
    }
}
return score;

// ✅ 简洁
return doc['tags'].contains('hot') ? 10 : 0;
```

## 脚本缓存机制

### 缓存配置

```yaml
# elasticsearch.yml
script.cache.max_size: 100
script.cache.expire: 60m
```

### 存储脚本

**创建存储脚本**：

```bash
POST /_scripts/calculate_discount
{
  "script": {
    "lang": "painless",
    "source": "doc['price'].value * (1 - params.discount)"
  }
}
```

**使用存储脚本**：

```bash
GET /products/_search
{
  "script_fields": {
    "final_price": {
      "script": {
        "id": "calculate_discount",
        "params": {
          "discount": 0.1
        }
      }
    }
  }
}
```

**删除存储脚本**：

```bash
DELETE /_scripts/calculate_discount
```

## 安全性考量

### 脚本沙箱

```
Painless 限制：
  - 无文件系统访问
  - 无网络访问
  - 无反射
  - 有限的类访问
  - 循环次数限制
```

### 禁用动态脚本

```yaml
# elasticsearch.yml
script.allowed_types: none
script.allowed_types: inline
script.allowed_types: stored
```

### 脚本白名单

```yaml
script.allowed_contexts:
  - update
  - search
  - aggs
```

## 实战：复杂业务逻辑

### 动态定价

```bash
POST /products/_update/1
{
  "script": {
    "source": """
      // 基础价格
      double basePrice = ctx._source.base_price;
      
      // 库存系数
      double stockRatio = ctx._source.stock / params.max_stock;
      double stockFactor = stockRatio > 0.2 ? 1.0 : 1.1;
      
      // 销量系数
      double salesFactor = Math.log(ctx._source.sales_count + 1) / 10.0 + 1.0;
      
      // 季节系数
      double seasonFactor = params.season_factor;
      
      // 计算最终价格
      ctx._source.price = Math.round(basePrice * stockFactor * salesFactor * seasonFactor);
    """,
    "params": {
      "max_stock": 1000,
      "season_factor": 1.2
    }
  }
}
```

### 推荐评分

```bash
GET /products/_search
{
  "query": {
    "script_score": {
      "query": {
        "match_all": {}
      },
      "script": {
        "source": """
          double score = 1.0;
          
          // 用户偏好品牌
          if (params.favorite_brands.contains(doc['brand'].value)) {
            score *= 2.0;
          }
          
          // 价格区间偏好
          double price = doc['price'].value;
          if (price >= params.min_price && price <= params.max_price) {
            score *= 1.5;
          }
          
          // 销量加权
          score *= Math.log(doc['sales_count'].value + 1);
          
          // 评分加权
          score *= (doc['rating'].value / 5.0 + 0.5);
          
          return score;
        """,
        "params": {
          "favorite_brands": ["Apple", "Samsung"],
          "min_price": 3000,
          "max_price": 8000
        }
      }
    }
  }
}
```

## 总结

**语法基础**：
- 类 Java 语法
- 强类型支持
- 丰富的 API

**使用场景**：
- 文档更新
- 查询过滤
- 聚合计算
- 评分调整

**上下文 API**：
- doc 访问
- _source 访问
- params 参数
- 内置函数

**性能优化**：
- 参数化脚本
- 使用 doc values
- 避免复杂逻辑
- 脚本缓存

**安全性**：
- 沙箱机制
- 禁用动态脚本
- 白名单控制

**最佳实践**：
- 存储常用脚本
- 合理使用缓存
- 注意性能影响
- 安全配置

**下一步**：学习 Ingest Pipeline 数据预处理。

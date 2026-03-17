# 映射（Mapping）设计

## 概述

映射（Mapping）定义了索引中文档的结构、字段类型和索引方式，类似于关系型数据库的 Schema。合理的映射设计直接影响搜索性能、存储效率和查询能力。

## 映射的概念与作用

### 什么是映射？

**映射是文档字段与数据类型的定义**：

```json
PUT /products
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "standard"
      },
      "price": {
        "type": "double"
      },
      "tags": {
        "type": "keyword"
      },
      "created_at": {
        "type": "date"
      }
    }
  }
}
```

### 映射的作用

1. **定义字段类型**：text、keyword、数值、日期等
2. **控制索引方式**：是否索引、是否存储、分词器选择
3. **优化存储和查询**：Doc Values、压缩、缓存策略
4. **数据验证**：插入时验证字段类型

## 静态映射 vs 动态映射

### 静态映射（Explicit Mapping）

**预先定义字段类型**：

```json
PUT /products
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "price": { "type": "double" },
      "stock": { "type": "integer" }
    }
  }
}

POST /products/_doc/1
{
  "title": "iPhone",
  "price": 7999.0,
  "stock": 100
}
```

**优点**：
- 类型明确，避免推断错误
- 性能优化（提前配置）
- 字段控制更精确

**缺点**：
- 需要提前规划
- 新字段需要更新映射

### 动态映射（Dynamic Mapping）

**自动推断字段类型**：

```json
POST /auto_products/_doc/1
{
  "title": "iPhone",
  "price": 7999,
  "in_stock": true,
  "tags": ["electronics", "phone"]
}

# 自动生成的映射
GET /auto_products/_mapping

{
  "auto_products": {
    "mappings": {
      "properties": {
        "title": { "type": "text" },         # 字符串 → text
        "price": { "type": "long" },         # 整数 → long
        "in_stock": { "type": "boolean" },   # 布尔 → boolean
        "tags": { "type": "text" }           # 数组字符串 → text
      }
    }
  }
}
```

**类型推断规则**：

| JSON 类型 | ES 推断类型 | 示例 |
|-----------|-----------|------|
| `null` | 无映射 | `null` |
| `true` / `false` | `boolean` | `true` |
| 整数 | `long` | `123` |
| 浮点数 | `double` | `123.45` |
| 字符串（日期格式） | `date` 或 `text` | `"2024-01-15"` |
| 字符串（其他） | `text` + `keyword`（多字段） | `"hello"` |
| 对象 | `object` | `{"key": "value"}` |
| 数组 | 元素类型 | `[1, 2, 3]` → `long` |

**优点**：
- 快速上手，无需预先定义
- 灵活适应数据变化

**缺点**：
- 类型推断可能错误
- 字符串默认 text + keyword（浪费空间）
- 性能不如静态映射

### 动态映射配置

```json
PUT /products
{
  "mappings": {
    # 动态映射策略
    "dynamic": "strict",  # 或 "true"、"false"
    "properties": {
      "name": { "type": "text" }
    }
  }
}
```

**dynamic 参数选项**：

| 选项 | 行为 | 适用场景 |
|------|------|---------|
| **true**（默认） | 自动添加新字段 | 开发环境 |
| **false** | 忽略新字段（不索引，但存储在 `_source`） | 部分字段已知 |
| **strict** | 拒绝新字段（抛出错误） | 生产环境（严格模式） |

**示例**：

```json
PUT /strict_index
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "title": { "type": "text" }
    }
  }
}

# 插入包含未定义字段的文档
POST /strict_index/_doc/1
{
  "title": "iPhone",
  "price": 7999    # 未定义的字段
}

# 错误响应
{
  "error": {
    "type": "strict_dynamic_mapping_exception",
    "reason": "mapping set to strict, dynamic introduction of [price] within [_doc] is not allowed"
  }
}
```

## 字段类型详解

### 文本类型

#### text 类型

**全文搜索，会分词**：

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "standard",              # 索引时分词器
        "search_analyzer": "standard",       # 搜索时分词器
        "fields": {
          "keyword": {
            "type": "keyword",               # 多字段映射
            "ignore_above": 256
          }
        }
      }
    }
  }
}
```

**特性**：
- 分词索引，支持全文搜索
- 不支持聚合、排序（除非使用 fielddata）
- 适合：文章内容、商品描述、日志消息

#### keyword 类型

**精确匹配，不分词**：

```json
PUT /users
{
  "mappings": {
    "properties": {
      "status": {
        "type": "keyword"
      },
      "email": {
        "type": "keyword",
        "ignore_above": 256    # 超过长度不索引
      }
    }
  }
}
```

**特性**：
- 不分词，完整存储
- 支持聚合、排序、精确匹配
- 适合：状态字段、标签、邮箱、ID

#### text vs keyword 选择

| 场景 | 推荐类型 | 原因 |
|------|---------|------|
| 搜索文章内容 | text | 需要分词、全文搜索 |
| 订单状态 | keyword | 精确匹配、聚合统计 |
| 用户邮箱 | keyword | 精确查询、去重 |
| 商品标签 | keyword | 精确匹配、聚合 |
| 标题搜索 | text + keyword（多字段） | 搜索 + 聚合 |

### 数值类型

```json
PUT /metrics
{
  "mappings": {
    "properties": {
      "byte_val": { "type": "byte" },       # -128 ~ 127
      "short_val": { "type": "short" },     # -32768 ~ 32767
      "integer_val": { "type": "integer" }, # -2^31 ~ 2^31-1
      "long_val": { "type": "long" },       # -2^63 ~ 2^63-1
      "float_val": { "type": "float" },     # 32位浮点
      "double_val": { "type": "double" },   # 64位浮点
      "half_float_val": { "type": "half_float" },  # 16位浮点
      "scaled_float_val": {
        "type": "scaled_float",
        "scaling_factor": 100    # 实际值 = 存储值 / 100
      }
    }
  }
}
```

**类型选择建议**：

```
整数：
  - 小范围（< 32767）：short
  - 一般情况：integer
  - 大数值（ID、时间戳）：long

浮点数：
  - 一般情况：float
  - 高精度需求：double
  - 价格（固定小数位）：scaled_float
```

### 日期类型

```json
PUT /events
{
  "mappings": {
    "properties": {
      "created_at": {
        "type": "date",
        "format": "strict_date_optional_time||epoch_millis"
      },
      "updated_at": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      }
    }
  }
}
```

**支持的格式**：

```json
# ISO 8601
"2024-01-15T10:30:00Z"
"2024-01-15T10:30:00+08:00"

# 自定义格式
"2024-01-15 10:30:00"
"2024-01-15"

# 时间戳（毫秒）
1705305600000
```

**内部存储**：统一转换为 UTC 时间戳（毫秒）

### 布尔类型

```json
PUT /products
{
  "mappings": {
    "properties": {
      "in_stock": { "type": "boolean" }
    }
  }
}

# 接受的值：
# true: true, "true"
# false: false, "false", ""
```

### 对象类型（Object）

```json
PUT /users
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "address": {
        "properties": {
          "city": { "type": "keyword" },
          "street": { "type": "text" }
        }
      }
    }
  }
}

POST /users/_doc/1
{
  "name": "Alice",
  "address": {
    "city": "Beijing",
    "street": "Zhongguancun"
  }
}

# 扁平化存储：
{
  "name": "Alice",
  "address.city": "Beijing",
  "address.street": "Zhongguancun"
}
```

### 嵌套类型（Nested）

```json
PUT /company
{
  "mappings": {
    "properties": {
      "employees": {
        "type": "nested",
        "properties": {
          "name": { "type": "keyword" },
          "age": { "type": "integer" }
        }
      }
    }
  }
}

# 查询嵌套对象
GET /company/_search
{
  "query": {
    "nested": {
      "path": "employees",
      "query": {
        "bool": {
          "must": [
            { "term": { "employees.name": "Alice" } },
            { "term": { "employees.age": 30 } }
          ]
        }
      }
    }
  }
}
```

### 地理位置类型

```json
PUT /locations
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      },
      "area": {
        "type": "geo_shape"
      }
    }
  }
}

# geo_point 示例
POST /locations/_doc/1
{
  "name": "Beijing",
  "location": {
    "lat": 39.9042,
    "lon": 116.4074
  }
}

# 或数组格式
"location": [116.4074, 39.9042]  # [lon, lat]

# 或字符串格式
"location": "39.9042,116.4074"   # "lat,lon"
```

## 映射参数

### index 参数

**控制字段是否索引**：

```json
PUT /products
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "index": true    # 默认：索引
      },
      "internal_id": {
        "type": "keyword",
        "index": false   # 不索引，不可搜索
      }
    }
  }
}
```

**使用场景**：
- `index: false`：仅存储，不搜索的字段（节省空间）

### store 参数

**控制字段是否单独存储**：

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "store": true    # 单独存储
      },
      "content": {
        "type": "text",
        "store": false   # 默认：不单独存储
      }
    }
  }
}
```

**说明**：
- 默认情况下，字段存储在 `_source` 中
- `store: true`：额外单独存储（增加空间，加快部分字段检索）
- 使用场景：大文档中仅需检索部分字段

### doc_values 参数

**列式存储，用于排序和聚合**：

```json
PUT /products
{
  "mappings": {
    "properties": {
      "price": {
        "type": "double",
        "doc_values": true   # 默认：启用
      },
      "description": {
        "type": "text",
        "doc_values": false  # text 类型默认禁用
      }
    }
  }
}
```

**特性**：
- 默认对大多数类型启用（text 除外）
- 支持磁盘访问，不完全加载到内存
- 禁用可节省空间，但无法排序/聚合

### fielddata 参数

**text 类型的内存加载方式**：

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "fielddata": true   # 默认：false
      }
    }
  }
}
```

**警告**：
- fielddata 会将整个倒排索引加载到内存
- 内存占用大，容易 OOM
- 推荐：使用 keyword 子字段代替

```json
# 推荐方式
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

# 聚合时使用 keyword 子字段
GET /articles/_search
{
  "aggs": {
    "top_words": {
      "terms": { "field": "content.keyword" }
    }
  }
}
```

### enabled 参数

**禁用字段索引**：

```json
PUT /sessions
{
  "mappings": {
    "properties": {
      "metadata": {
        "type": "object",
        "enabled": false   # 不索引，仅存储在 _source
      }
    }
  }
}
```

### null_value 参数

**为 null 值提供默认值**：

```json
PUT /products
{
  "mappings": {
    "properties": {
      "stock": {
        "type": "integer",
        "null_value": 0    # null 替换为 0
      }
    }
  }
}

POST /products/_doc/1
{
  "stock": null
}

# 查询：stock = 0
GET /products/_search
{
  "query": {
    "term": { "stock": 0 }
  }
}
```

### copy_to 参数

**复制字段值到另一个字段**：

```json
PUT /products
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "copy_to": "full_text"
      },
      "description": {
        "type": "text",
        "copy_to": "full_text"
      },
      "full_text": {
        "type": "text"
      }
    }
  }
}

# 搜索 full_text 可匹配 title 和 description
GET /products/_search
{
  "query": {
    "match": { "full_text": "iPhone" }
  }
}
```

## 映射设计最佳实践

### 1. 预先定义映射（生产环境）

```json
# ✅ 推荐
PUT /products
{
  "settings": {
    "number_of_shards": 3
  },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "name": { "type": "text" },
      "price": { "type": "double" },
      "tags": { "type": "keyword" }
    }
  }
}

# ❌ 不推荐（生产环境）
# 依赖动态映射，可能类型错误
```

### 2. 合理使用多字段映射

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          },
          "pinyin": {
            "type": "text",
            "analyzer": "pinyin"
          }
        }
      }
    }
  }
}

# 使用场景：
# title: 全文搜索
# title.keyword: 聚合、排序
# title.pinyin: 拼音搜索
```

### 3. 选择合适的数值类型

```json
PUT /metrics
{
  "mappings": {
    "properties": {
      "user_id": { "type": "long" },         # ID 用 long
      "count": { "type": "integer" },        # 计数用 integer
      "price": { "type": "scaled_float", "scaling_factor": 100 },  # 价格用 scaled_float
      "percentage": { "type": "float" }      # 百分比用 float
    }
  }
}
```

### 4. 禁用不需要的功能

```json
PUT /logs
{
  "mappings": {
    "properties": {
      "message": {
        "type": "text",
        "norms": false,     # 禁用评分（节省空间）
        "index_options": "freqs"  # 仅存储词频（不存储位置）
      },
      "trace_id": {
        "type": "keyword",
        "doc_values": false,  # 不排序/聚合
        "index": false        # 不搜索（仅存储）
      }
    }
  }
}
```

### 5. 避免字段爆炸

```json
# ❌ 错误：动态字段导致字段数爆炸
POST /metrics/_doc/1
{
  "user_123_click": 10,
  "user_456_click": 20,
  ...
}

# ✅ 正确：使用嵌套结构
POST /metrics/_doc/1
{
  "clicks": [
    { "user_id": "123", "count": 10 },
    { "user_id": "456", "count": 20 }
  ]
}
```

### 6. 合理使用 ignore_above

```json
PUT /logs
{
  "mappings": {
    "properties": {
      "url": {
        "type": "keyword",
        "ignore_above": 512   # 超过 512 字符不索引
      }
    }
  }
}
```

## 更新映射

### 添加新字段

```json
PUT /products/_mapping
{
  "properties": {
    "new_field": {
      "type": "keyword"
    }
  }
}
```

### 映射不可修改的限制

**已有字段的类型不可修改**：

```json
# ❌ 错误：无法修改已有字段类型
PUT /products/_mapping
{
  "properties": {
    "price": {
      "type": "keyword"   # 原类型：double
    }
  }
}

# 错误响应
{
  "error": {
    "type": "illegal_argument_exception",
    "reason": "mapper [price] cannot be changed from type [double] to [keyword]"
  }
}
```

**解决方案**：Reindex 重建索引

```json
# 1. 创建新索引（新映射）
PUT /products_v2
{
  "mappings": {
    "properties": {
      "price": { "type": "keyword" }
    }
  }
}

# 2. 重建数据
POST /_reindex
{
  "source": { "index": "products" },
  "dest": { "index": "products_v2" }
}

# 3. 切换别名
POST /_aliases
{
  "actions": [
    { "remove": { "index": "products", "alias": "products_current" } },
    { "add": { "index": "products_v2", "alias": "products_current" } }
  ]
}
```

## 查看映射

```bash
# 查看索引映射
GET /products/_mapping

# 查看特定字段映射
GET /products/_mapping/field/name

# 查看多个索引映射
GET /products,orders/_mapping
```

## 总结

**映射的作用**：
- 定义字段类型
- 控制索引方式
- 优化存储和查询

**静态 vs 动态映射**：
- **静态**：预先定义，类型明确（推荐生产环境）
- **动态**：自动推断，灵活但可能错误

**核心字段类型**：
- **text**：全文搜索，分词
- **keyword**：精确匹配，聚合
- **数值**：选择合适的范围类型
- **date**：日期时间
- **nested**：保持数组对象关联
- **geo_point**：地理位置

**重要映射参数**：
- **index**：是否索引
- **doc_values**：是否支持排序/聚合
- **store**：是否单独存储
- **fields**：多字段映射

**最佳实践**：
- 预先定义映射（`dynamic: strict`）
- 使用多字段映射（text + keyword）
- 选择合适的数值类型
- 禁用不需要的功能（节省空间）
- 避免字段爆炸

**映射限制**：
- 已有字段类型不可修改
- 解决方案：Reindex 重建索引

**下一步**：学习分词器（Analyzer）原理与配置，掌握文本分析的完整过程。

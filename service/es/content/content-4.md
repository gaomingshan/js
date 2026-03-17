# 数据模型设计

## 概述

Elasticsearch 使用灵活的 JSON 文档存储数据，与关系型数据库的表结构不同，ES 的数据模型设计需要考虑去范式化、嵌套关系、数组处理等特性。合理的数据模型设计直接影响查询性能和存储效率。

## 文档（Document）与 JSON 结构

### 文档的基本结构

**文档是 ES 的最小数据单元**，以 JSON 格式存储：

```json
{
  "_index": "products",
  "_id": "1",
  "_version": 1,
  "_seq_no": 0,
  "_primary_term": 1,
  "_source": {
    "name": "iPhone 14 Pro",
    "price": 7999,
    "brand": "Apple",
    "category": "electronics",
    "tags": ["smartphone", "5G", "iOS"],
    "specs": {
      "screen": "6.1 inch",
      "storage": "256GB",
      "color": "Deep Purple"
    },
    "in_stock": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**元数据字段**：
- **`_index`**：文档所属索引
- **`_id`**：文档唯一标识（自动生成或手动指定）
- **`_source`**：原始 JSON 数据
- **`_version`**：版本号（乐观并发控制）
- **`_seq_no`** / **`_primary_term`**：7.0+ 新版本控制字段

### 自包含设计

**ES 文档应该是自包含的**，包含查询所需的全部信息。

```json
// ✅ 推荐：自包含设计
{
  "order_id": "20240115001",
  "user_id": "user123",
  "user_name": "张三",           // 冗余用户信息
  "user_email": "zhang@example.com",
  "product_id": "prod456",
  "product_name": "iPhone 14",    // 冗余商品信息
  "product_price": 7999,
  "quantity": 1,
  "total_amount": 7999,
  "status": "paid",
  "created_at": "2024-01-15T10:30:00Z"
}

// ❌ 不推荐：需要关联查询
{
  "order_id": "20240115001",
  "user_id": "user123",           // 仅存储 ID
  "product_id": "prod456",        // 仅存储 ID
  "quantity": 1,
  "total_amount": 7999
}
```

**冗余数据的权衡**：
- **优点**：查询快速，无需 JOIN
- **缺点**：数据重复，更新复杂
- **适用场景**：读多写少的业务

## 字段类型概览

### 基本类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **text** | 全文本，分词索引 | "Elasticsearch is great" |
| **keyword** | 精确值，不分词 | "elasticsearch" |
| **long** | 64位整数 | 1234567890 |
| **integer** | 32位整数 | 12345 |
| **short** | 16位整数 | 123 |
| **byte** | 8位整数 | 1 |
| **double** | 64位浮点数 | 123.45 |
| **float** | 32位浮点数 | 12.3 |
| **boolean** | 布尔值 | true / false |
| **date** | 日期时间 | "2024-01-15" |
| **binary** | 二进制数据（Base64） | "U29tZSBiaW5hcnkgYmxvYg==" |

### 复杂类型

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| **object** | 嵌套对象（扁平化存储） | 简单嵌套结构 |
| **nested** | 嵌套对象（独立存储） | 需要保持数组对象关系 |
| **geo_point** | 地理坐标点 | LBS 应用 |
| **geo_shape** | 地理形状 | 区域搜索 |
| **ip** | IP 地址 | 日志分析 |
| **range** | 范围类型 | 价格区间、日期范围 |

### text vs keyword 详解

**text 类型**：全文搜索，会分词

```json
PUT /articles
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "standard"
      }
    }
  }
}

// 索引时分词
"Elasticsearch Tutorial" → ["elasticsearch", "tutorial"]

// 查询：支持模糊匹配
GET /articles/_search
{
  "query": {
    "match": {
      "title": "elastic"    // 可以匹配到 "Elasticsearch"
    }
  }
}
```

**keyword 类型**：精确匹配，不分词

```json
PUT /users
{
  "mappings": {
    "properties": {
      "status": {
        "type": "keyword"
      }
    }
  }
}

// 不分词
"Active User" → ["Active User"]

// 查询：必须完全匹配
GET /users/_search
{
  "query": {
    "term": {
      "status": "Active User"    // 完全匹配
    }
  }
}
```

**使用场景**：

```
text：适合全文搜索
  - 文章标题、内容
  - 商品描述
  - 日志消息

keyword：适合精确匹配、聚合、排序
  - 状态字段（status、type）
  - 标签（tags）
  - 用户名、邮箱
  - ID 字段
```

**多字段映射（Multi-fields）**：

```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "keyword": {           // 子字段
            "type": "keyword"
          }
        }
      }
    }
  }
}

// 使用：
// 全文搜索
GET /_search { "query": { "match": { "title": "elastic" } } }

// 精确匹配、聚合
GET /_search { "query": { "term": { "title.keyword": "Elasticsearch Tutorial" } } }
```

## 扁平化 vs 嵌套文档 vs 父子文档

### 1. 扁平化（Object 类型）

**默认的嵌套方式**，对象会被扁平化存储。

```json
PUT /company/_doc/1
{
  "name": "Tech Corp",
  "employees": [
    { "name": "Alice", "age": 30 },
    { "name": "Bob", "age": 25 }
  ]
}

// 实际存储（扁平化）：
{
  "name": "Tech Corp",
  "employees.name": ["Alice", "Bob"],
  "employees.age": [30, 25]
}
```

**问题**：丢失对象间的关联关系

```json
// 查询：age=30 且 name="Bob" 的员工
GET /company/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "employees.name": "Bob" } },
        { "match": { "employees.age": 30 } }
      ]
    }
  }
}

// 错误地匹配到文档1（Bob的age是25，不是30）
// 因为扁平化后，name 和 age 的关联丢失了
```

### 2. 嵌套文档（Nested 类型）

**保持数组对象的独立性**，解决扁平化的问题。

```json
PUT /company
{
  "mappings": {
    "properties": {
      "employees": {
        "type": "nested",      // 使用 nested 类型
        "properties": {
          "name": { "type": "keyword" },
          "age": { "type": "integer" }
        }
      }
    }
  }
}

PUT /company/_doc/1
{
  "name": "Tech Corp",
  "employees": [
    { "name": "Alice", "age": 30 },
    { "name": "Bob", "age": 25 }
  ]
}
```

**存储结构**：每个 nested 对象作为独立的隐藏文档存储

```
主文档：
  { "name": "Tech Corp" }

隐藏文档1（员工1）：
  { "name": "Alice", "age": 30 }

隐藏文档2（员工2）：
  { "name": "Bob", "age": 25 }
```

**查询方式**：使用 `nested` 查询

```json
GET /company/_search
{
  "query": {
    "nested": {
      "path": "employees",
      "query": {
        "bool": {
          "must": [
            { "term": { "employees.name": "Bob" } },
            { "term": { "employees.age": 30 } }
          ]
        }
      }
    }
  }
}

// 正确：不会匹配到文档1（Bob 的 age 是 25）
```

**性能影响**：
- nested 文档独立索引，增加存储开销
- 查询性能略低于普通查询
- 建议 nested 文档数量 < 100 per document

### 3. 父子文档（Parent-Child）

**完全独立的文档**，通过 join 字段建立关系。

```json
PUT /company
{
  "mappings": {
    "properties": {
      "my_join_field": {
        "type": "join",
        "relations": {
          "company": "employee"    // 父：公司，子：员工
        }
      },
      "name": { "type": "text" }
    }
  }
}

// 父文档：公司
PUT /company/_doc/1
{
  "name": "Tech Corp",
  "my_join_field": "company"
}

// 子文档：员工
PUT /company/_doc/2?routing=1
{
  "name": "Alice",
  "age": 30,
  "my_join_field": {
    "name": "employee",
    "parent": "1"              // 指定父文档 ID
  }
}

PUT /company/_doc/3?routing=1
{
  "name": "Bob",
  "age": 25,
  "my_join_field": {
    "name": "employee",
    "parent": "1"
  }
}
```

**查询方式**：

```json
// 通过父文档查找子文档
GET /company/_search
{
  "query": {
    "has_parent": {
      "parent_type": "company",
      "query": {
        "match": { "name": "Tech Corp" }
      }
    }
  }
}

// 通过子文档查找父文档
GET /company/_search
{
  "query": {
    "has_child": {
      "type": "employee",
      "query": {
        "range": { "age": { "gte": 30 } }
      }
    }
  }
}
```

**性能影响**：
- 父子文档必须在同一分片（通过 routing 保证）
- 查询性能较低（需要额外的 JOIN 操作）
- 适合一对多关系，子文档数量大的场景

### 三种方式对比

| 方式 | 适用场景 | 性能 | 更新灵活性 |
|------|---------|------|-----------|
| **Object（扁平化）** | 简单嵌套，不需要保持数组对象关联 | 最高 | 低（需更新整个文档） |
| **Nested** | 需要保持数组对象关联，数量 < 100 | 中等 | 低（需更新整个文档） |
| **Parent-Child** | 一对多关系，子文档独立更新 | 最低 | 高（子文档独立更新） |

## 数组字段的处理

### 自动支持数组

ES 自动支持数组，无需特殊定义：

```json
PUT /products/_doc/1
{
  "tags": ["electronics", "smartphone", "Apple"]
}

// 查询：匹配任意一个元素即可
GET /products/_search
{
  "query": {
    "term": {
      "tags": "smartphone"
    }
  }
}
```

### 数组字段类型一致性

**数组中所有元素必须是同一类型**：

```json
// ✅ 正确
{
  "tags": ["tag1", "tag2", "tag3"]
}

// ❌ 错误：混合类型
{
  "tags": ["tag1", 123, true]
}
```

### 空数组与 null

```json
{
  "tags": []           // 空数组
}

{
  "tags": null         // null 值
}

// 两者都表示字段无值，查询时需使用 exists 查询
GET /_search
{
  "query": {
    "bool": {
      "must_not": {
        "exists": { "field": "tags" }
      }
    }
  }
}
```

## 多值字段与关联关系设计

### 场景：电商商品与 SKU

**需求**：一个商品（SPU）有多个规格（SKU），如何设计？

#### 方案1：嵌套数组（Nested）

```json
PUT /products
{
  "mappings": {
    "properties": {
      "spu_name": { "type": "text" },
      "skus": {
        "type": "nested",
        "properties": {
          "sku_id": { "type": "keyword" },
          "color": { "type": "keyword" },
          "size": { "type": "keyword" },
          "price": { "type": "integer" },
          "stock": { "type": "integer" }
        }
      }
    }
  }
}

PUT /products/_doc/1
{
  "spu_name": "iPhone 14 Pro",
  "skus": [
    { "sku_id": "sku1", "color": "黑色", "size": "128GB", "price": 7999, "stock": 100 },
    { "sku_id": "sku2", "color": "紫色", "size": "256GB", "price": 8999, "stock": 50 }
  ]
}

// 查询：价格在 8000-9000 且有库存的 SKU
GET /products/_search
{
  "query": {
    "nested": {
      "path": "skus",
      "query": {
        "bool": {
          "must": [
            { "range": { "skus.price": { "gte": 8000, "lte": 9000 } } },
            { "range": { "skus.stock": { "gt": 0 } } }
          ]
        }
      }
    }
  }
}
```

#### 方案2：去范式化

```json
PUT /skus/_doc/1
{
  "sku_id": "sku1",
  "spu_id": "spu1",
  "spu_name": "iPhone 14 Pro",    // 冗余 SPU 信息
  "color": "黑色",
  "size": "128GB",
  "price": 7999,
  "stock": 100
}

// 查询更简单
GET /skus/_search
{
  "query": {
    "bool": {
      "must": [
        { "range": { "price": { "gte": 8000, "lte": 9000 } } },
        { "range": { "stock": { "gt": 0 } } }
      ]
    }
  }
}
```

**方案选择**：
- **Nested**：适合 SKU 数量少（< 100），需要 SPU 维度聚合
- **去范式化**：适合 SKU 独立查询，数据量大

## 数据建模最佳实践

### 1. 去范式化优先

**原则**：尽量避免多索引关联，冗余数据。

```json
// ✅ 推荐
{
  "order_id": "O001",
  "user_name": "张三",
  "product_name": "iPhone",
  "product_category": "电子产品"
}

// ❌ 不推荐
{
  "order_id": "O001",
  "user_id": "U001",      // 需要查询 users 索引
  "product_id": "P001"    // 需要查询 products 索引
}
```

### 2. 合理使用 Nested

**何时使用**：
- 需要保持数组对象的关联关系
- 数组元素数量 < 100
- 需要在 nested 对象上执行聚合

**何时避免**：
- 数组元素数量过多（> 100）
- 更新频繁的场景

### 3. 字段类型选择

```
text：
  - 需要全文搜索的长文本
  - 分析、分词

keyword：
  - 精确匹配、过滤、排序、聚合
  - 状态、标签、ID、邮箱

数值类型：
  - 选择最小满足需求的类型（byte < short < integer < long）
  - 范围查询、聚合

date：
  - 时间字段统一使用 date 类型
  - 格式："strict_date_optional_time||epoch_millis"

boolean：
  - 布尔标志（启用/禁用、是/否）
```

### 4. 避免动态映射陷阱

**问题**：字段类型推断错误

```json
// 自动推断为 long
PUT /products/_doc/1
{
  "price": 100
}

// 后续插入浮点数报错
PUT /products/_doc/2
{
  "price": 99.99    // 错误：类型不匹配
}
```

**解决**：预先定义映射

```json
PUT /products
{
  "mappings": {
    "properties": {
      "price": { "type": "double" }
    }
  }
}
```

### 5. 多字段映射（Multi-fields）

**同一字段支持多种用途**：

```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",              // 全文搜索
        "fields": {
          "keyword": {
            "type": "keyword"        // 聚合、排序
          },
          "pinyin": {
            "type": "text",
            "analyzer": "pinyin"     // 拼音搜索
          }
        }
      }
    }
  }
}
```

## 实战案例：电商订单数据模型

```json
PUT /orders
{
  "mappings": {
    "properties": {
      "order_id": { "type": "keyword" },
      "user": {
        "properties": {
          "user_id": { "type": "keyword" },
          "user_name": { "type": "keyword" },
          "email": { "type": "keyword" }
        }
      },
      "items": {
        "type": "nested",
        "properties": {
          "product_id": { "type": "keyword" },
          "product_name": { "type": "text" },
          "sku_id": { "type": "keyword" },
          "price": { "type": "double" },
          "quantity": { "type": "integer" },
          "subtotal": { "type": "double" }
        }
      },
      "total_amount": { "type": "double" },
      "status": { "type": "keyword" },
      "payment_method": { "type": "keyword" },
      "shipping_address": {
        "properties": {
          "province": { "type": "keyword" },
          "city": { "type": "keyword" },
          "district": { "type": "keyword" },
          "detail": { "type": "text" },
          "location": { "type": "geo_point" }
        }
      },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  }
}
```

**设计说明**：
- **user**：Object 类型，冗余用户基本信息
- **items**：Nested 类型，保持商品明细的关联
- **shipping_address**：Object 类型，包含地理坐标
- **status、payment_method**：keyword 类型，支持聚合统计

## 总结

**数据模型设计原则**：
- **去范式化**：优先数据冗余，避免 JOIN
- **自包含**：文档包含查询所需的全部信息
- **选择合适的类型**：text vs keyword、nested vs object

**字段类型选择**：
- **text**：全文搜索
- **keyword**：精确匹配、聚合、排序
- **nested**：保持数组对象关联
- **object**：简单嵌套结构

**关联关系处理**：
- **Object（扁平化）**：性能最高，适合简单嵌套
- **Nested**：保持数组对象关联，适合数量 < 100
- **Parent-Child**：完全独立，适合子文档频繁更新

**最佳实践**：
- 预先定义映射，避免动态推断错误
- 使用 Multi-fields 支持多种查询方式
- 合理规划 nested 字段数量
- 冗余常用查询字段，优化查询性能

**下一步**：学习单节点环境的安装与配置，开始实战操作。

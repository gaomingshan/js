# 索引类型详解

## 概述

MongoDB 提供多种索引类型，满足不同查询场景的需求。选错索引类型会导致索引失效或性能低下。

---

## 单字段索引（Single Field Index）

```js
// 升序
db.users.createIndex({ age: 1 })
// 降序（单字段查询时与升序等效）
db.users.createIndex({ createdAt: -1 })

// 嵌套字段索引（点符号）
db.users.createIndex({ "address.city": 1 })
```

---

## 复合索引（Compound Index）

多个字段组合的索引，字段顺序至关重要。

### ESR 原则（最重要的设计原则）

```
E - Equality（等值查询字段）放最前
S - Sort（排序字段）放中间
R - Range（范围查询字段）放最后
```

```js
// 查询：{ status: "paid", userId: "u001" }，按 createdAt 降序
// ✅ 正确顺序（ESR）
db.orders.createIndex({ status: 1, userId: 1, createdAt: -1 })

// ❌ 错误顺序（Range 在前）
db.orders.createIndex({ createdAt: -1, status: 1, userId: 1 })
// → createdAt 是范围字段，放前面导致后续字段索引利用率低
```

### 索引前缀规则

```js
// 复合索引：{ a:1, b:1, c:1 }
// 可以走索引的查询前缀：
//   { a: ... }               ✅
//   { a: ..., b: ... }       ✅
//   { a: ..., b: ..., c: ... } ✅
//   { b: ... }               ❌ 跳过了 a
//   { b: ..., c: ... }       ❌ 跳过了 a

db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 })

// 以下查询都能走该索引：
db.orders.find({ userId: "u1" })
db.orders.find({ userId: "u1", status: "paid" })
db.orders.find({ userId: "u1", status: "paid" }).sort({ createdAt: -1 })

// 以下查询走不了：
db.orders.find({ status: "paid" })           // 缺少前缀 userId
db.orders.find({ createdAt: { $gt: t } })    // 缺少前缀
```

---

## 多键索引（Multikey Index）

为数组字段的每个元素建立索引条目，自动识别，无需特殊声明。

```js
// tags 是数组字段
db.products.createIndex({ tags: 1 })

// 文档
{ _id: 1, name: "iPhone", tags: ["电子", "手机", "Apple"] }

// 索引条目：
// "Apple" → Doc1
// "手机"  → Doc1
// "电子"  → Doc1

// 查询（走多键索引）
db.products.find({ tags: "手机" })
db.products.find({ tags: { $all: ["手机", "Apple"] } })
```

**限制**：复合索引中最多一个字段是数组（多键），否则创建失败。

---

## 文本索引（Text Index）

支持全文搜索，对字段内容进行分词索引。

```js
// 创建文本索引
db.articles.createIndex(
  { title: "text", content: "text" },
  {
    weights: { title: 10, content: 1 },  // 标题权重更高
    default_language: "none",            // 禁用语言分析（中文必须）
    name: "idx_fulltext"
  }
)

// 全文搜索
db.articles.find(
  { $text: { $search: "MongoDB 索引" } },
  { score: { $meta: "textScore" } }      // 相关性得分
).sort({ score: { $meta: "textScore" } })

// 短语搜索（双引号）
db.articles.find({ $text: { $search: '"副本集"' } })

// 排除词
db.articles.find({ $text: { $search: "MongoDB -安装" } })
```

**限制**：每个集合只能有一个文本索引；不支持数值范围查询。

---

## 哈希索引（Hashed Index）

对字段值取哈希后建立索引，主要用于分片键。

```js
// 创建哈希索引
db.users.createIndex({ userId: "hashed" })

// 主要用途：分片集合时作为分片键
sh.shardCollection("ecommerce.users", { userId: "hashed" })
```

**特点**：
- 写入均匀分布（哈希打散热点）
- 只支持等值查询，不支持范围查询
- 不支持多键索引（数组字段）

---

## 地理空间索引（2dsphere / 2d）

```js
// 2dsphere：球面地理查询（推荐，支持 GeoJSON）
db.stores.createIndex({ location: "2dsphere" })

// 文档格式（GeoJSON）
db.stores.insertOne({
  name: "门店A",
  location: {
    type: "Point",
    coordinates: [116.4074, 39.9042]  // [经度, 纬度]
  }
})

// 附近查询
db.stores.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [116.4, 39.9] },
      $maxDistance: 5000   // 5000 米内
    }
  }
})
```

---

## 通配符索引（Wildcard Index，4.2+）

为文档中所有字段或指定前缀下所有字段建立索引，适合动态 Schema。

```js
// 为所有字段建立通配符索引
db.products.createIndex({ "$**": 1 })

// 为 attributes 下所有字段建立索引
db.products.createIndex({ "attributes.$**": 1 })

// 适用场景：字段名不固定的动态属性
// 文档：
{ attributes: { color: "red", size: "XL", material: "棉" } }
{ attributes: { storage: "256GB", color: "黑色" } }

// 查询任意属性都能走索引
db.products.find({ "attributes.color": "red" })
db.products.find({ "attributes.storage": "256GB" })
```

**注意**：通配符索引不能用于排序和覆盖查询。

---

## 索引类型选择指南

| 场景 | 推荐索引类型 |
|------|-------------|
| 普通字段查询 | 单字段索引 |
| 多条件组合查询 | 复合索引（ESR 顺序）|
| 数组字段查询 | 多键索引（自动）|
| 全文搜索 | 文本索引 |
| 分片键（均匀分布）| 哈希索引 |
| 地理位置查询 | 2dsphere 索引 |
| 动态字段查询 | 通配符索引 |
| 过期数据自动删除 | TTL 索引（见 content-16）|

---

## 总结

- 复合索引遵循 **ESR 原则**，字段顺序决定索引利用率
- 多键索引自动识别数组字段，复合索引中最多一个数组字段
- 文本索引中文场景需设置 `default_language: "none"`
- 哈希索引主要用于分片键，不支持范围查询
- 通配符索引适合动态 Schema，不替代针对性的复合索引

**下一步**：索引属性与覆盖查询。

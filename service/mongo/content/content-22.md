# 文本搜索与地理空间查询

## 概述

MongoDB 内置文本索引支持基础全文搜索，2dsphere 索引支持球面地理空间查询。这两类能力覆盖了大量业务场景，复杂需求可升级到 Atlas Search。

---

## 文本索引与全文搜索

### 创建文本索引

```js
// 单字段文本索引
db.articles.createIndex({ content: "text" })

// 多字段文本索引（每个集合只能有一个文本索引）
db.articles.createIndex(
  { title: "text", content: "text", tags: "text" },
  {
    weights: { title: 10, content: 3, tags: 5 }, // 权重（影响相关性得分）
    default_language: "none",   // 中文必须设置 none，禁用英文词干提取
    name: "idx_fulltext"
  }
)
```

### $text 查询

```js
// 基础搜索（空格分隔多词，OR 关系）
db.articles.find({ $text: { $search: "MongoDB 索引" } })

// 短语搜索（双引号，精确匹配）
db.articles.find({ $text: { $search: '"副本集选主"' } })

// 排除词（-前缀）
db.articles.find({ $text: { $search: "MongoDB -安装" } })

// 混合搜索
db.articles.find({ $text: { $search: '"MongoDB" 索引 -基础' } })

// 按相关性得分排序
db.articles.find(
  { $text: { $search: "MongoDB 性能" } },
  { score: { $meta: "textScore" } }   // 返回得分
).sort({ score: { $meta: "textScore" } })  // 按得分排序
```

### 文本索引的限制

```
❌ 每个集合只能有一个文本索引
❌ 不支持中文分词（需要 Atlas Search + IK 分词器）
❌ 文本索引不支持覆盖查询
❌ $text 不能与 hint() 共用
❌ $text 必须是 $match 的第一个阶段（聚合中）
```

### 中文全文搜索方案对比

| 方案 | 中文分词 | 复杂度 | 适用 |
|------|----------|--------|------|
| 文本索引 | ❌ 无 | 低 | 英文/简单场景 |
| Atlas Search | ✅ 支持 | 中 | Atlas 用户 |
| 应用层分词 + 数组字段 | ✅ 自定义 | 高 | 自建集群 |
| Elasticsearch | ✅ IK 分词 | 高 | 专业搜索 |

---

## 地理空间索引与查询

### GeoJSON 格式

```js
// Point（点）
{ type: "Point", coordinates: [116.4074, 39.9042] }  // [经度, 纬度]

// LineString（线）
{ type: "LineString", coordinates: [[116.4, 39.9], [116.5, 40.0]] }

// Polygon（多边形）
{
  type: "Polygon",
  coordinates: [[
    [116.3, 39.8], [116.5, 39.8],
    [116.5, 40.0], [116.3, 40.0],
    [116.3, 39.8]  // 首尾相同，闭合
  ]]
}
```

### 创建 2dsphere 索引

```js
db.stores.createIndex({ location: "2dsphere" })

// 插入带位置信息的文档
db.stores.insertOne({
  name: "深圳南山门店",
  address: "科技园南路1号",
  location: {
    type: "Point",
    coordinates: [113.9442, 22.5429]  // 深圳南山区
  },
  category: "电子产品"
})
```

### $near（附近排序）

```js
// 查询 5km 内的门店，按距离从近到远排序
db.stores.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [113.9300, 22.5400]  // 用户当前位置
      },
      $maxDistance: 5000,   // 最大距离（米）
      $minDistance: 0       // 最小距离（米）
    }
  }
}).limit(10)
```

### $geoWithin（区域内查询）

```js
// 查询某多边形区域内的门店（不排序，性能更好）
db.stores.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [[
          [113.90, 22.52], [113.98, 22.52],
          [113.98, 22.56], [113.90, 22.56],
          [113.90, 22.52]
        ]]
      }
    }
  }
})

// 使用 $centerSphere（球面圆形区域）
db.stores.find({
  location: {
    $geoWithin: {
      $centerSphere: [
        [113.9300, 22.5400],  // 中心点
        5 / 6378.1            // 半径（5km / 地球半径）
      ]
    }
  }
})
```

### $geoIntersects（区域相交）

```js
// 查询与指定区域相交的配送区域
db.deliveryZones.find({
  area: {
    $geoIntersects: {
      $geometry: {
        type: "Point",
        coordinates: [113.9300, 22.5400]  // 用户位置
      }
    }
  }
})
// 常用于：判断用户是否在某配送范围内
```

---

## 聚合管道中的地理查询

```js
// 附近门店 + 距离计算
db.stores.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [113.93, 22.54] },
      distanceField: "distance",     // 距离结果字段（米）
      maxDistance: 5000,
      spherical: true,
      query: { category: "电子产品" } // 附加过滤
    }
  },
  { $limit: 10 },
  {
    $project: {
      name: 1,
      address: 1,
      distanceKm: { $divide: ["$distance", 1000] }  // 转换为公里
    }
  }
])
// $geoNear 必须是聚合管道的第一个阶段
```

---

## 企业案例：外卖平台附近餐厅

```js
// 索引
db.restaurants.createIndex({ location: "2dsphere" })
db.restaurants.createIndex({ location: "2dsphere", category: 1, rating: -1 })

// 查询：3km 内，中餐类型，评分 >= 4.0，按距离排序
db.restaurants.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [userLng, userLat] },
      distanceField: "distance",
      maxDistance: 3000,
      spherical: true,
      query: { category: "中餐", rating: { $gte: 4.0 }, isOpen: true }
    }
  },
  { $limit: 20 },
  {
    $project: {
      name: 1, rating: 1, deliveryTime: 1,
      distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 1] }
    }
  }
])
```

---

## 总结

- 文本索引适合简单英文全文搜索，中文场景需 Atlas Search 或自建方案
- `$near` 按距离排序，`$geoWithin` 区域过滤（无排序，性能更好）
- `$geoNear` 在聚合管道中使用，可附加过滤条件并返回距离字段
- 2dsphere 索引支持球面计算，坐标格式为 **[经度, 纬度]**（注意顺序）

**下一步**：副本集架构与选主机制。

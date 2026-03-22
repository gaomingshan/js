# 用户画像与内容推荐场景

## 概述

用户画像和内容推荐是 MongoDB 的经典应用场景，文档模型的灵活性天然适合存储结构各异的用户标签和行为数据。本章覆盖完整的建模方案。

---

## 用户画像文档模型

### 基础画像结构

```js
{
  "_id": "user_001",
  "userId": "user_001",

  // 基础信息
  "basic": {
    "age": 28,
    "gender": "male",
    "city": "深圳",
    "registeredAt": ISODate("2022-03-01")
  },

  // 消费特征
  "consumption": {
    "level": "high",           // low/mid/high
    "totalSpent": 58600,
    "avgOrderAmount": 1395,
    "orderCount": 42,
    "lastOrderAt": ISODate("2024-01-10")
  },

  // 兴趣标签（属性模式）
  "interests": ["手机数码", "运动健身", "咖啡"],

  // 行为特征
  "behavior": {
    "activeTime": "evening",    // morning/afternoon/evening/night
    "deviceType": "ios",
    "avgSessionMinutes": 8.5,
    "preferredCategories": ["electronics", "sports"]
  },

  // RFM 模型（近度/频度/金额）
  "rfm": {
    "recency": 5,              // 最近购买距今天数（越小越好）
    "frequency": 42,           // 购买频次
    "monetary": 58600,         // 累计消费金额
    "rfmScore": "HHH",        // H=高 M=中 L=低
    "updatedAt": ISODate("2024-01-15")
  },

  // 动态属性（属性模式，便于索引任意属性）
  "attrs": [
    { "k": "preferredBrand", "v": "Apple" },
    { "k": "lastLoginCity",  "v": "深圳" },
    { "k": "couponSensitivity", "v": "high" }
  ]
}
```

### 属性模式索引

```js
// 为动态属性建立复合索引
db.user_profiles.createIndex({ "attrs.k": 1, "attrs.v": 1 })

// 查询有特定属性的用户
db.user_profiles.find({
  attrs: { $elemMatch: { k: "preferredBrand", v: "Apple" } }
})

// 多属性筛选（营销人群包）
db.user_profiles.find({
  $and: [
    { attrs: { $elemMatch: { k: "preferredBrand",    v: "Apple" } } },
    { attrs: { $elemMatch: { k: "couponSensitivity", v: "high" } } },
    { "rfm.rfmScore": { $in: ["HHH", "HHM"] } },
    { "basic.city": "深圳" }
  ]
})
```

---

## 用户行为事件模型

```js
// 行为事件集合（高写入，Time Series Collection）
db.createCollection("user_events", {
  timeseries: {
    timeField: "timestamp",
    metaField: "meta",
    granularity: "seconds"
  },
  expireAfterSeconds: 86400 * 90  // 保留 90 天
})

// 行为事件文档
{
  "timestamp": ISODate("2024-01-15T14:23:00Z"),
  "meta": {
    "userId": "user_001",
    "eventType": "view_product",   // view_product/add_cart/purchase/search/click
    "platform": "ios_app"
  },
  "data": {
    "productId": "prod_001",
    "category": "electronics",
    "brand": "Apple",
    "price": 9999,
    "dwellSeconds": 45             // 停留时长
  }
}
```

### 用户行为分析

```js
// 统计用户最近 7 天各品类浏览次数
db.user_events.aggregate([
  { $match: {
    "meta.userId": "user_001",
    "meta.eventType": "view_product",
    timestamp: { $gte: new Date(Date.now() - 7 * 86400000) }
  }},
  { $group: {
    _id: "$data.category",
    viewCount: { $sum: 1 },
    avgDwell: { $avg: "$data.dwellSeconds" }
  }},
  { $sort: { viewCount: -1 } }
])
```

---

## 内容推荐建模

### 内容（文章/商品）文档

```js
{
  "_id": "article_001",
  "title": "2024 最值得买的手机",
  "category": "electronics",
  "tags": ["手机", "测评", "Apple", "数码"],
  "author": { "id": "author_001", "name": "数码君" },

  // 内容特征向量（用于相似度计算，Atlas Vector Search）
  "embedding": [0.23, 0.78, -0.12, ...]  // 1536 维向量

  "stats": {
    "views": 15280,
    "likes": 892,
    "comments": 156,
    "shares": 234
  },
  "publishedAt": ISODate("2024-01-10")
}
```

### 推荐记录文档

```js
// 用户推荐列表（预计算，实时刷新）
{
  "_id": "rec_user_001",
  "userId": "user_001",
  "recommendations": [
    { "itemId": "prod_001", "score": 0.95, "reason": "interest_match" },
    { "itemId": "article_003", "score": 0.88, "reason": "behavior_based" },
    { "itemId": "prod_007", "score": 0.82, "reason": "collaborative_filter" }
  ],
  "updatedAt": ISODate("2024-01-15T06:00:00Z"),
  "expireAt": ISODate("2024-01-16T06:00:00Z")  // TTL 过期
}

// TTL 索引：推荐列表每天重新生成
db.user_recommendations.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0 }
)
```

---

## 实时用户画像更新

```js
// 用户浏览商品时，实时更新画像
db.user_profiles.updateOne(
  { userId: "user_001" },
  {
    // 更新浏览品类偏好
    $inc: { "categoryViews.electronics": 1 },

    // 维护最近浏览的 10 个商品
    $push: {
      recentlyViewed: {
        $each: [{ productId: "prod_001", viewedAt: new Date() }],
        $slice: -10
      }
    },

    // 更新活跃时间
    $set: {
      "behavior.lastActiveAt": new Date(),
      updatedAt: new Date()
    }
  },
  { upsert: true }
)
```

---

## 营销人群包生成

```js
// 生成「Apple 高消费用户 + 深圳」人群包
db.user_profiles.aggregate([
  { $match: {
    "basic.city": "深圳",
    "consumption.level": "high",
    "interests": "手机数码",
    attrs: { $elemMatch: { k: "preferredBrand", v: "Apple" } }
  }},
  { $project: { userId: 1, "basic.phone": 1, _id: 0 } },
  { $out: "audience_apple_highvalue_shenzhen" }  // 导出人群包集合
])

// 查询人群包大小
db.audience_apple_highvalue_shenzhen.estimatedDocumentCount()
```

---

## 用户画像更新策略

```
实时更新：
  - 触发条件：用户行为事件
  - 更新字段：recentlyViewed、lastActiveAt
  - 方案：原子操作 $push、$inc、$set

近实时更新（分钟级）：
  - 触发条件：订单完成
  - 更新字段：totalSpent、orderCount、RFM
  - 方案：消息队列驱动异步更新

批量更新（每日）：
  - 触发条件：定时任务（凌晨低峰）
  - 更新字段：rfmScore、consumption.level、推荐列表
  - 方案：聚合管道 + $merge
```

---

## 总结

- 用户画像文档嵌入基础信息、消费特征、RFM 指标，属性模式存储动态标签
- 属性模式索引 `{ "attrs.k": 1, "attrs.v": 1 }` 支持任意属性的高效查询
- 行为事件用 Time Series Collection，自动压缩，高效时序查询
- 推荐列表预计算存储，TTL 索引自动过期刷新
- 画像更新分实时/近实时/批量三层，按字段重要性选择更新策略

**下一步**：多租户隔离方案。

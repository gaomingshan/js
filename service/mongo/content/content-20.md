# 聚合管道（Aggregation Pipeline）

## 概述

聚合管道是 MongoDB 最强大的数据处理能力，通过将多个阶段（Stage）串联，对数据进行过滤、转换、分组、关联和统计。理解聚合管道是 MongoDB 进阶的必经之路。

---

## 管道执行模型

```
集合数据 → [$match] → [$group] → [$sort] → [$limit] → 结果

每个阶段：
  输入：上一阶段的文档流
  输出：处理后的文档流
  支持：并行执行、内存溢出到磁盘（allowDiskUse）
```

**优化原则**：`$match` 和 `$limit` 放在管道最前面，尽早减少文档数量。

---

## 核心阶段

### $match（过滤）

```js
// 语法与 find() 完全相同
db.orders.aggregate([
  { $match: {
    status: "paid",
    createdAt: { $gte: ISODate("2024-01-01") },
    amount: { $gt: 100 }
  }}
])
// ✅ $match 放最前面才能走索引
```

### $group（分组统计）

```js
db.orders.aggregate([
  { $match: { status: "paid" } },
  {
    $group: {
      _id: "$userId",                    // 分组键（null = 全部）
      orderCount:  { $sum: 1 },          // 订单数
      totalAmount: { $sum: "$amount" },  // 总金额
      avgAmount:   { $avg: "$amount" },  // 平均金额
      maxAmount:   { $max: "$amount" },  // 最大金额
      firstOrder:  { $min: "$createdAt" },// 最早订单时间
      statusList:  { $addToSet: "$status" } // 去重收集
    }
  },
  { $sort: { totalAmount: -1 } },
  { $limit: 10 }
])
```

### $project（字段映射）

```js
db.orders.aggregate([
  {
    $project: {
      _id: 0,
      orderId: 1,
      amount: 1,
      // 计算字段
      tax: { $multiply: ["$amount", 0.13] },
      // 字符串操作
      statusUpper: { $toUpper: "$status" },
      // 条件
      isHighValue: { $cond: { if: { $gt: ["$amount", 1000] }, then: true, else: false } },
      // 日期格式化
      dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
    }
  }
])
```

### $lookup（多集合关联）

```js
// 基础 $lookup（相当于 LEFT JOIN）
db.orders.aggregate([
  {
    $lookup: {
      from: "users",          // 关联集合
      localField: "userId",   // 当前集合字段
      foreignField: "_id",    // 关联集合字段
      as: "user"              // 结果字段名（数组）
    }
  },
  { $unwind: "$user" }        // 展开数组（1对1关联用）
])

// 管道式 $lookup（5.0+，支持复杂关联条件）
db.orders.aggregate([
  {
    $lookup: {
      from: "orderItems",
      let: { orderId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$orderId", "$$orderId"] } } },
        { $match: { qty: { $gte: 2 } } },
        { $project: { sku: 1, qty: 1, price: 1 } }
      ],
      as: "items"
    }
  }
])
```

### $unwind（展开数组）

```js
// 将数组字段展开，每个元素生成一条文档
db.orders.aggregate([
  { $unwind: {
    path: "$items",
    preserveNullAndEmptyArrays: true,  // 保留空数组/无此字段的文档
    includeArrayIndex: "itemIndex"      // 包含数组索引
  }},
  { $group: {
    _id: "$items.sku",
    totalQty: { $sum: "$items.qty" }
  }}
])
```

### $addFields / $set（添加/修改字段）

```js
db.orders.aggregate([
  {
    $addFields: {
      totalWithTax: { $multiply: ["$amount", 1.13] },
      processedAt: "$$NOW"
    }
  }
])
// $set 是 $addFields 的别名（6.0+）
```

---

## 多维聚合

### $facet（并行多维统计）

```js
// 一次查询返回多个维度的统计结果
db.products.aggregate([
  { $match: { status: "active" } },
  {
    $facet: {
      // 维度1：按分类统计
      byCategory: [
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ],
      // 维度2：价格区间分布
      priceDistribution: [
        { $bucket: {
          groupBy: "$price",
          boundaries: [0, 100, 500, 1000, 5000],
          default: "5000+",
          output: { count: { $sum: 1 } }
        }}
      ],
      // 维度3：总数
      total: [
        { $count: "count" }
      ]
    }
  }
])
```

### $bucket（区间分组）

```js
db.orders.aggregate([
  {
    $bucket: {
      groupBy: "$amount",
      boundaries: [0, 100, 500, 1000, 5000],
      default: "超过5000",
      output: {
        count: { $sum: 1 },
        total: { $sum: "$amount" }
      }
    }
  }
])
```

---

## 输出阶段

```js
// $out：结果写入新集合（覆盖）
db.orders.aggregate([
  { $match: { status: "paid" } },
  { $group: { _id: "$userId", total: { $sum: "$amount" } } },
  { $out: "user_order_stats" }  // 写入 user_order_stats 集合
])

// $merge：结果合并到已有集合（5.0+）
db.orders.aggregate([
  { $group: { _id: "$userId", total: { $sum: "$amount" } } },
  { $merge: {
    into: "user_stats",
    on: "_id",
    whenMatched: "merge",     // 匹配时合并
    whenNotMatched: "insert"  // 不匹配时插入
  }}
])
```

---

## 常用聚合表达式

```js
// 算术
$add, $subtract, $multiply, $divide, $mod, $abs, $ceil, $floor

// 字符串
$concat, $toLower, $toUpper, $substr, $trim, $split, $indexOfCP

// 日期
$year, $month, $dayOfMonth, $hour, $minute,
$dateTrunc,      // 按时间粒度截断（5.0+）
$dateToString    // 格式化日期

// 条件
$cond,    // 三元运算
$ifNull,  // 空值替换
$switch   // 多条件分支

// 数组
$size, $arrayElemAt, $filter, $map, $reduce, $first, $last
```

---

## 聚合性能优化

```js
// 1. $match 放最前，走索引
{ $match: { userId: "u1", status: "paid" } }  // 先过滤

// 2. $project 放 $lookup 前，减少传输字段
{ $project: { userId: 1, amount: 1 } }  // 只保留需要的字段

// 3. 大数据量允许磁盘溢出
db.orders.aggregate(pipeline, { allowDiskUse: true })

// 4. 分析聚合执行计划
db.orders.explain("executionStats").aggregate(pipeline)
```

---

## 企业案例：订单报表

```js
// 统计最近 30 天各省销售额 TOP 10
db.orders.aggregate([
  // 1. 过滤最近 30 天已支付订单
  { $match: {
    status: "paid",
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) }
  }},
  // 2. 展开省份（嵌套字段）
  { $group: {
    _id: "$shippingAddress.province",
    totalSales: { $sum: "$amount" },
    orderCount: { $sum: 1 },
    avgOrder:   { $avg: "$amount" }
  }},
  // 3. 排序取 TOP 10
  { $sort: { totalSales: -1 } },
  { $limit: 10 },
  // 4. 格式化输出
  { $project: {
    province: "$_id",
    totalSales: { $round: ["$totalSales", 2] },
    orderCount: 1,
    avgOrder: { $round: ["$avgOrder", 2] },
    _id: 0
  }}
])
```

---

## 总结

- 聚合管道是流式处理，每阶段输出是下一阶段的输入
- `$match` 放最前面，尽早过滤走索引
- `$facet` 实现一次查询多维统计，减少往返
- `$lookup` 实现跨集合关联，但频繁使用说明模型设计需优化
- 大数据量聚合加 `allowDiskUse: true`

**下一步**：分页策略与查询性能优化。

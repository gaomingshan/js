# 查询语法与操作符

## 概述

MongoDB 查询语言（MQL）以 JSON 为载体，通过操作符组合实现各种复杂查询条件。本章覆盖完整的查询语法体系。

---

## 基本查询

```js
// find(filter, projection)
db.users.find()                          // 查所有
db.users.find({ city: "深圳" })           // 精确匹配
db.users.findOne({ email: "a@b.com" })   // 返回第一条

// 投影：1 = 返回，0 = 排除
db.users.find(
  { city: "深圳" },
  { name: 1, age: 1, _id: 0 }           // 只返回 name 和 age
)

// 排序、限制、跳过
db.users.find({ city: "深圳" })
  .sort({ age: -1 })     // 按 age 降序
  .limit(10)             // 最多 10 条
  .skip(20)              // 跳过前 20 条（深分页有性能问题）
```

---

## 比较操作符

```js
// $eq / $ne
db.orders.find({ status: { $eq: "paid" } })   // 等价于 { status: "paid" }
db.orders.find({ status: { $ne: "cancelled" } })

// $gt / $gte / $lt / $lte（数值、日期均适用）
db.orders.find({ amount: { $gt: 1000 } })
db.orders.find({ amount: { $gte: 100, $lte: 500 } })
db.orders.find({ createdAt: { $gte: ISODate("2024-01-01") } })

// $in / $nin
db.orders.find({ status: { $in: ["paid", "shipped", "delivered"] } })
db.users.find({ city: { $nin: ["北京", "上海"] } })
```

---

## 逻辑操作符

```js
// $and（默认，多条件直接组合即为 and）
db.orders.find({
  $and: [
    { status: "paid" },
    { amount: { $gt: 1000 } }
  ]
})
// 等价简写：
db.orders.find({ status: "paid", amount: { $gt: 1000 } })

// $or
db.orders.find({
  $or: [
    { status: "pending" },
    { status: { $exists: false } }
  ]
})

// $not（对单个条件取反）
db.orders.find({ amount: { $not: { $gt: 1000 } } })
// 等价于：amount <= 1000

// $nor（所有条件都不满足）
db.users.find({
  $nor: [
    { age: { $lt: 18 } },
    { status: "banned" }
  ]
})
// → 年龄 >= 18 且 status != "banned"
```

---

## 元素操作符

```js
// $exists：字段是否存在
db.users.find({ phone: { $exists: true } })   // 有 phone 字段
db.users.find({ phone: { $exists: false } })  // 无 phone 字段

// $type：字段类型匹配
db.products.find({ price: { $type: "double" } })
db.products.find({ price: { $type: ["int", "double"] } })  // 数值类型

// BSON 类型名称常用列表
// "double", "string", "object", "array", "bool",
// "date", "null", "int", "objectId", "decimal"
```

---

## 数组操作符

```js
// $all：数组包含所有指定值
db.products.find({ tags: { $all: ["手机", "Apple"] } })

// $elemMatch：数组元素满足多个条件（同一元素）
db.orders.find({
  items: {
    $elemMatch: {
      sku: "SKU001",
      qty: { $gte: 2 }
    }
  }
})
// 注意：不用 $elemMatch 时，条件可能匹配不同元素
// { items.sku: "SKU001", items.qty: { $gte: 2 } }
// → sku 和 qty 可能来自不同数组元素！

// $size：数组长度匹配
db.orders.find({ items: { $size: 3 } })  // 恰好 3 个订单行

// 数组索引查询
db.orders.find({ "items.0.sku": "SKU001" })  // 第一个元素的 sku
```

---

## 嵌套文档查询（点符号）

```js
// 文档结构
{ address: { province: "广东", city: "深圳", district: "南山" } }

// 点符号查询
db.users.find({ "address.city": "深圳" })
db.users.find({ "address.province": "广东", "address.city": "深圳" })

// 嵌套对象精确匹配（顺序和字段必须完全一致，不推荐）
db.users.find({ address: { province: "广东", city: "深圳", district: "南山" } })
```

---

## 正则表达式查询

```js
// $regex
db.users.find({ name: { $regex: "^张" } })           // 以"张"开头
db.users.find({ email: { $regex: "@gmail\.com$" } }) // gmail 邮箱
db.products.find({ name: { $regex: "iPhone", $options: "i" } })  // 不区分大小写

// 简写
db.users.find({ name: /^张/ })
db.products.find({ name: /iPhone/i })

// 注意：正则查询走不了普通索引（COLLSCAN）
// 仅前缀正则 /^xxx/ 可以利用索引（IXSCAN）
db.users.find({ name: /^张三/ })  // ✅ 可走索引
db.users.find({ name: /张三/ })   // ❌ 不走索引，全扫描
```

---

## 更新操作符

```js
// $set / $unset
db.users.updateOne({ _id: id }, {
  $set: { age: 29, "address.city": "广州" },
  $unset: { temporaryField: "" }
})

// $inc（递增）/ $mul（乘法）
db.products.updateOne({ _id: id }, { $inc: { stock: -1, viewCount: 1 } })
db.products.updateOne({ _id: id }, { $mul: { price: 0.9 } })  // 打九折

// $min / $max（只在新值更小/更大时才更新）
db.stats.updateOne({ _id: id }, { $min: { lowestPrice: 99 } })

// $push / $pull / $addToSet
db.users.updateOne({ _id: id }, { $push: { tags: "VIP" } })          // 追加
db.users.updateOne({ _id: id }, { $addToSet: { tags: "VIP" } })      // 去重追加
db.users.updateOne({ _id: id }, { $pull: { tags: "试用" } })          // 删除指定值
db.users.updateOne({ _id: id }, { $pop: { tags: 1 } })               // 删除最后一个

// $push + $each + $slice（维护固定长度数组）
db.users.updateOne({ _id: id }, {
  $push: {
    recentOrders: {
      $each: ["order_new"],
      $slice: -10    // 只保留最新 10 条
    }
  }
})
```

---

## 计数与游标

```js
// 计数
db.orders.countDocuments({ status: "paid" })       // 精确计数（走过滤器）
db.orders.estimatedDocumentCount()                 // 快速估算（走集合元数据）

// 游标操作
const cursor = db.orders.find({ status: "paid" })
while (cursor.hasNext()) {
  const doc = cursor.next()
  // 处理 doc
}

// forEach（mongosh 中常用）
db.orders.find({ status: "pending" }).forEach(order => {
  print(order.orderId)
})
```

---

## 总结

| 操作符类别 | 常用操作符 |
|-----------|----------|
| 比较 | `$eq` `$ne` `$gt` `$gte` `$lt` `$lte` `$in` `$nin` |
| 逻辑 | `$and` `$or` `$not` `$nor` |
| 元素 | `$exists` `$type` |
| 数组 | `$all` `$elemMatch` `$size` |
| 更新 | `$set` `$unset` `$inc` `$push` `$pull` `$addToSet` |

**关键陷阱**：
- 数组多条件查询必须用 `$elemMatch`
- 正则只有前缀 `/^xxx/` 才能走索引
- `$or` 的每个条件都需要独立索引才高效

**下一步**：聚合管道详解。

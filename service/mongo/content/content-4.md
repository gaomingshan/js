# 数据模型设计

## 概述

文档模型设计是 MongoDB 使用的核心技能。与关系型数据库「先设计规范化 Schema，再适配查询」不同，MongoDB 的设计哲学是**以查询驱动数据模型**——先明确应用的读写模式，再决定如何组织数据。

---

## 设计原则：以查询驱动

在设计文档结构前，先回答以下问题：

```
1. 应用最常执行什么查询？（影响：嵌入 vs 引用）
2. 读写比例是多少？（影响：冗余程度）
3. 数据量会增长到多大？（影响：是否分片）
4. 哪些字段需要过滤/排序？（影响：索引设计）
5. 数据的生命周期是什么？（影响：TTL、归档策略）
```

**核心原则**：
- 将**一起使用的数据**存储在一起（Data Locality）
- 优先减少查询次数，而非减少数据冗余
- 文档大小控制在合理范围（建议 < 1MB，硬限制 16MB）

---

## 一对一关系建模

**最常见的选择：嵌入**

```js
// 用户与实名认证信息（一对一，总是一起查询）
{
  "_id": "user_001",
  "name": "张三",
  "email": "zhangsan@example.com",
  "kyc": {                        // 嵌入实名信息
    "realName": "张三",
    "idNumber": "44010119900101xxxx",
    "verifiedAt": ISODate("2024-01-01")
  }
}
```

**何时引用**：若认证信息由独立服务管理，或有单独的访问权限控制，则引用。

---

## 一对多关系建模

### 场景一：一对少（One-to-Few）→ 嵌入

```js
// 订单（一）与订单行（少）
{
  "_id": "order_2024001",
  "userId": "user_001",
  "status": "paid",
  "items": [
    { "sku": "P001", "name": "iPhone 15", "qty": 1, "price": 6999 },
    { "sku": "P002", "name": "手机壳",    "qty": 2, "price": 49  }
  ],
  "totalAmount": 7097
}
```

### 场景二：一对多（One-to-Many）→ 引用（子引用父）

```js
// 文章评论（多）引用文章（一）
// articles 集合
{ "_id": "article_001", "title": "MongoDB 最佳实践", "authorId": "user_001" }

// comments 集合
{ "_id": "comment_001", "articleId": "article_001", "content": "很有帮助！" }
{ "_id": "comment_002", "articleId": "article_001", "content": "写得不错" }

// 查询文章的所有评论
db.comments.find({ articleId: "article_001" }).sort({ createdAt: -1 })
```

### 场景三：一对超多 → 桶模式（Bucket Pattern）

```js
// 设备日志：每个桶存储一小时内的数据
{
  "_id": "log_device001_2024011510",
  "deviceId": "device_001",
  "hour": ISODate("2024-01-15T10:00:00Z"),
  "count": 60,
  "measurements": [
    { "ts": ISODate("2024-01-15T10:00:05Z"), "temp": 36.5 },
    { "ts": ISODate("2024-01-15T10:01:05Z"), "temp": 36.6 }
  ]
}
```

---

## 多对多关系建模

### 方案一：双向引用

```js
// 商品与标签（多对多）
{ "_id": "prod_001", "name": "iPhone 15", "tagIds": ["tag_electronics", "tag_phone"] }
{ "_id": "tag_electronics", "name": "电子产品", "productIds": ["prod_001", "prod_002"] }
```

### 方案二：中间集合（关系本身有属性）

```js
// 学生与课程：关系本身有成绩
{
  "_id": "enroll_001",
  "studentId": "student_001",
  "courseId": "course_math",
  "score": 95,
  "enrolledAt": ISODate("2024-09-01")
}
```

---

## 树形结构建模

### 1. 父节点引用（最通用）

```js
{ "_id": "cat_phone",       "name": "手机",    "parentId": "cat_electronics" }
{ "_id": "cat_electronics", "name": "电子产品", "parentId": null }

// 查询直接子节点
db.categories.find({ parentId: "cat_electronics" })
```

### 2. 祖先数组（适合多级分类查询）

```js
{
  "_id": "cat_iphone15",
  "name": "iPhone 15",
  "ancestors": ["cat_root", "cat_electronics", "cat_phone"],
  "parentId": "cat_phone"
}

// 查询所有属于"电子产品"的节点（任意层级）
db.categories.find({ ancestors: "cat_electronics" })
```

### 3. 物化路径（支持正则路径查询）

```js
{ "_id": "cat_iphone15", "path": "/electronics/phone/iphone15", "name": "iPhone 15" }

// 查询手机下所有子分类
db.categories.find({ path: /^\/electronics\/phone/ })
```

**选型建议**：

| 模式 | 读祖先 | 读后代 | 写入 | 适用 |
|------|--------|--------|------|------|
| 父节点引用 | O(depth) | O(n) | 快 | 通用 |
| 祖先数组 | O(1) | O(n) | 中 | 多级分类 |
| 物化路径 | O(1) | O(n) | 中 | 路径查询 |
| 嵌套集合 | O(1) | O(1) | 慢 | 只读树 |

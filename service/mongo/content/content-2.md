# 文档模型 vs 关系模型

## 概述

选择数据库的核心问题不是「哪个数据库更好」，而是「哪种数据模型更匹配业务需求」。关系模型与文档模型代表两种根本不同的数据组织哲学，理解它们的差异，是正确使用 MongoDB 的前提。

---

## 关系模型：范式化与 JOIN

### 设计思想

关系模型的核心是**范式化（Normalization）**：消除数据冗余，将数据分散到多张表中，通过外键和 JOIN 关联。

```sql
-- 关系模型：订单拆分为多张表
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  status VARCHAR(20),
  created_at DATETIME
);

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY,
  order_id BIGINT,  -- 外键
  sku VARCHAR(50),
  qty INT,
  price DECIMAL(10,2)
);

-- 查询完整订单需要 JOIN
SELECT o.*, i.sku, i.qty, i.price
FROM orders o
JOIN order_items i ON o.id = i.order_id
WHERE o.id = 1001;
```

### 范式化的代价

| 问题 | 说明 |
|------|------|
| **查询复杂** | 多表 JOIN，SQL 难以维护 |
| **性能开销** | JOIN 在大数据量下性能急剧下降 |
| **分布式困难** | 跨节点 JOIN 代价极高，分布式数据库中几乎不可行 |
| **Schema 僵化** | 新增字段需 ALTER TABLE，影响生产 |

---

## 文档模型：反范式化与嵌入

### 设计思想

文档模型的核心是**以查询驱动设计（Query-Driven Design）**：根据应用如何读取数据来组织数据结构，允许适度冗余，优先减少查询次数。

```json
// 文档模型：订单与订单行嵌入一个文档
{
  "_id": "order_1001",
  "userId": "user_123",
  "status": "paid",
  "createdAt": "2024-01-15T10:30:00Z",
  "items": [
    { "sku": "PHONE-001", "qty": 1, "price": 1299.00 },
    { "sku": "CASE-002",  "qty": 2, "price": 49.00  }
  ],
  "totalAmount": 1397.00
}
```

**一次查询，获取完整数据，无需 JOIN。**

---

## 嵌入（Embedding）vs 引用（Referencing）

文档模型的核心决策：**何时嵌入，何时引用？**

### 嵌入（Embedding）

将相关数据直接嵌入父文档，适合「强关联、一起读取」的场景。

```json
// 用户地址嵌入用户文档
{
  "_id": "user_001",
  "name": "张三",
  "addresses": [
    { "type": "home",   "city": "深圳", "street": "南山区xxx" },
    { "type": "office", "city": "广州", "street": "天河区xxx" }
  ]
}
```

**适用场景**：
- 一对一关系（用户 → 实名信息）
- 一对少关系（订单 → 订单行，通常 < 100 条）
- 子数据不会独立访问
- 子数据随父文档一起创建/删除

**优势**：单次查询、写入原子性、数据本地性好

### 引用（Referencing）

存储另一个文档的 `_id`，通过 `$lookup` 或应用层关联，适合「弱关联、独立访问」的场景。

```json
// 文章引用作者（作者独立维护）
{
  "_id": "article_001",
  "title": "MongoDB 最佳实践",
  "authorId": "user_001",   // 引用
  "tags": ["数据库", "NoSQL"]
}

// 查询时通过 $lookup 关联
db.articles.aggregate([
  { $match: { _id: "article_001" } },
  { $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "author"
  }}
])
```

**适用场景**：
- 一对多关系（作者 → 无限文章）
- 多对多关系（商品 → 标签）
- 子数据会独立访问或更新
- 子数据量不确定（可能无限增长）
- 数据被多个父文档共享

### 决策树

```
两个实体是否总是一起读取？
  ├── 是 → 子文档会无限增长吗？
  │         ├── 不会（< 数百条）→ 嵌入
  │         └── 会（评论、日志）→ 引用
  └── 否 → 子文档会被独立访问/更新吗？
            ├── 是 → 引用
            └── 否 → 考虑嵌入（简化查询）
```

---

## 数据本地性（Data Locality）

MongoDB 将文档完整存储在连续磁盘空间，读取一个文档只需**一次 I/O**。

```
关系模型：
  读取订单 = 读 orders 表 + 读 order_items 表 = 2次 I/O（最少）

文档模型：
  读取订单 = 读订单文档 = 1次 I/O
```

**结论**：嵌入模型充分利用数据本地性，是文档数据库的核心性能优势。

---

## 多态文档模式（Polymorphic Pattern）

同一集合中存储结构不同的文档，通过类型字段区分。

```json
// 商品集合：手机与服装结构不同
{ "_id": "prod_001", "type": "phone",   "brand": "Apple", "storage": "256GB", "color": "黑色" }
{ "_id": "prod_002", "type": "clothing", "brand": "Nike",  "size": "XL",     "material": "棉" }
```

**关系模型处理方式（复杂）**：
- 方案 A：单表继承（空列浪费）
- 方案 B：多表（需多次 JOIN）
- 方案 C：JSON 字段（失去结构化优势）

**MongoDB 处理方式**：天然支持，无需额外设计。

---

## 文档模型的优势与边界

### 优势

| 优势 | 说明 |
|------|------|
| **Schema 灵活** | 字段可随时增减，无需 ALTER TABLE |
| **查询简单** | 相关数据聚合存储，减少 JOIN |
| **水平扩展** | 文档是独立单元，天然适合分片 |
| **开发效率** | 数据结构与代码对象（JSON）直接映射 |
| **读性能** | 数据本地性，单次 I/O 获取完整数据 |

### 边界与限制

```
⚠️  16MB 文档大小限制
    → 无限增长的数组（如评论）不应嵌入

⚠️  缺乏强制引用完整性
    → MongoDB 不像 SQL 有外键约束，引用关系完整性由应用层保证

⚠️  $lookup 性能有限
    → 跨集合关联查询性能不如内嵌，频繁 JOIN 说明模型设计有问题

⚠️  数据冗余带来更新困难
    → 若 authorName 嵌入所有文章，作者改名需批量更新所有文章
```

---

## 选型决策框架

### 何时选 MongoDB

```
✅ 业务快速迭代，数据结构频繁变化
✅ 数据天然是层级/嵌套结构（订单、简历、配置）
✅ 需要水平扩展，数据量 TB 级以上
✅ 内容管理、用户画像、IoT、日志分析
✅ 读多写少，以查询驱动设计
✅ 团队熟悉 JSON，希望减少 ORM 复杂度
```

### 何时不选 MongoDB

```
❌ 业务依赖复杂多表 JOIN（报表、ERP）
❌ 强 ACID 事务需求（银行转账、核心账务）
❌ 数据高度规范化，关系复杂
❌ 团队 SQL 技能强，迁移成本高于收益
```

### 混合使用

实际企业中，MongoDB 常与关系型数据库共存：

```
MySQL：订单主数据、账务、用户核心信息（强事务）
MongoDB：用户画像、内容、配置、日志、IoT 数据（灵活扩展）
Redis：缓存、Session、排行榜
```

---

## 企业案例：电商订单系统建模对比

### 关系模型（MySQL）

```sql
-- 5张表，查询需 JOIN
orders → order_items → products
      → users
      → addresses
      → payments
```

### 文档模型（MongoDB）

```json
{
  "_id": "order_2024001",
  "user": { "id": "u001", "name": "张三", "phone": "138xxx" },
  "items": [
    { "productId": "p001", "name": "iPhone 15", "qty": 1, "price": 6999 }
  ],
  "shippingAddress": { "province": "广东", "city": "深圳", "detail": "xxx" },
  "payment": { "method": "alipay", "transactionId": "TX001", "paidAt": "..." },
  "status": "delivered",
  "totalAmount": 6999,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**结果**：
- 查询单个订单：1次读取 vs 5次 JOIN
- 订单快照不受用户信息变更影响（冗余的价值）
- 新增字段（如物流单号）无需变更 Schema

---

## 易错点

### 1. 过度嵌入

```json
// ❌ 错误：将无限增长的评论嵌入文章
{
  "_id": "article_001",
  "title": "...",
  "comments": [ ...可能有数万条... ]  // 触发 16MB 限制
}

// ✅ 正确：评论单独集合，引用文章 ID
{ "_id": "comment_001", "articleId": "article_001", "content": "..." }
```

### 2. 过度引用（像 SQL 一样设计）

```json
// ❌ 错误：拆分过细，查询需多次往返
{ "_id": "order_001", "itemIds": ["item_001", "item_002"] }
// 
# MongoDB 核心概念与架构模型

## 概述

MongoDB 是一款基于文档模型的 NoSQL 数据库，由 10gen 公司（现 MongoDB Inc.）于 2009 年发布。它以 BSON（Binary JSON）格式存储数据，天然支持灵活的数据结构、水平扩展与高可用部署，是现代应用开发中最广泛使用的非关系型数据库之一。

理解 MongoDB 的核心概念与架构模型，是掌握文档数据库设计思想的第一步。

---

## 核心概念

### 1. Database（数据库）

MongoDB 中的数据库是集合（Collection）的逻辑容器，类似于关系型数据库中的 Schema 或 Database。

```js
// 切换/创建数据库
use ecommerce

// 查看所有数据库
show dbs

// 查看当前数据库
db
```

**关键特性**：
- 数据库在首次写入数据时自动创建
- 每个 MongoDB 实例可承载多个数据库
- 系统保留数据库：`admin`（权限管理）、`local`（副本集 Oplog）、`config`（分片元数据）

### 2. Collection（集合）

集合是文档的逻辑分组，相当于关系型数据库中的表（Table），但**无需预定义结构**。

```js
// 创建集合（首次插入时自动创建）
db.createCollection("orders")

// 查看当前数据库所有集合
show collections
```

**关键特性**：
- 同一集合中的文档可以有不同字段
- 集合名称区分大小写
- 可通过 Schema Validation 约束文档结构

### 3. Document（文档）

**文档是 MongoDB 的最小数据单元**，以 BSON 格式存储，逻辑上表现为 JSON。

```json
{
  "_id": ObjectId("64f1a2b3c4d5e6f7a8b9c0d1"),
  "orderId": "ORD-20240115-001",
  "userId": "user_123",
  "status": "paid",
  "totalAmount": 1299.00,
  "items": [
    { "sku": "PHONE-001", "name": "iPhone 15", "qty": 1, "price": 1299.00 }
  ],
  "address": {
    "province": "广东省",
    "city": "深圳市",
    "street": "科技园南路1号"
  },
  "createdAt": ISODate("2024-01-15T10:30:00Z")
}
```

**关键特性**：
- 每个文档必须有唯一的 `_id` 字段（默认由 ObjectId 自动生成）
- 文档大小上限为 **16MB**
- 支持嵌套文档与数组
- 字段名区分大小写

### 4. Field（字段）

字段是文档中的键值对，值可以是多种 BSON 类型。

| BSON 类型 | 示例 | 说明 |
|-----------|------|------|
| String | `"name": "张三"` | UTF-8 字符串 |
| Int32/Int64 | `"age": 28` | 整数 |
| Double | `"price": 99.9` | 浮点数 |
| Boolean | `"active": true` | 布尔值 |
| Date | `ISODate("2024-01-15")` | 日期时间 |
| ObjectId | `ObjectId("64f1...")` | 12字节唯一标识 |
| Array | `"tags": ["电子", "手机"]` | 数组 |
| Object | `"address": {...}` | 嵌套文档 |
| Null | `"deletedAt": null` | 空值 |
| Decimal128 | `NumberDecimal("99.99")` | 高精度小数（金融场景）|

### 5. BSON（Binary JSON）

BSON 是 MongoDB 内部使用的二进制序列化格式，在 JSON 基础上扩展了更多数据类型。

**BSON vs JSON**：
```
JSON：文本格式，仅支持 String/Number/Boolean/Array/Object/Null
BSON：二进制格式，额外支持 Date/ObjectId/Binary/Decimal128/Regex 等
```

**BSON 的优势**：
- 二进制编码，解析速度快
- 支持更丰富的数据类型
- 支持有序的键值对
- 字段长度前置，跳过字段更高效

### 6. ObjectId

ObjectId 是 MongoDB 默认的 `_id` 类型，12 字节结构如下：

```
| 4 bytes        | 3 bytes    | 2 bytes  | 3 bytes  |
| Unix 时间戳     | 机器标识符  | 进程 PID | 随机计数器 |
```

```js
// 从 ObjectId 提取创建时间
ObjectId("64f1a2b3c4d5e6f7a8b9c0d1").getTimestamp()
// ISODate("2023-09-01T12:00:00Z")
```

**应用价值**：
- 全局唯一，无需数据库协调生成
- 包含时间戳，天然有序（按插入时间排序）
- 客户端生成，减少数据库压力

---

## MongoDB 架构组成

### 单机模式：mongod

`mongod` 是 MongoDB 的核心进程，负责数据存储与管理。

```
客户端 → mongod（单机）
         ├── 存储引擎（WiredTiger）
         ├── 查询引擎
         ├── 复制管理器
         └── 分片路由（可选）
```

### 副本集模式（高可用）

```
客户端
  ↓
Primary（主节点）← 自动选举 → Secondary（从节点 × N）
  ↓ Oplog 同步
Secondary / Arbiter
```

### 分片集群模式（水平扩展）

```
客户端
  ↓
mongos（路由层）← Config Server（元数据）
  ↓ 路由转发
Shard 1（副本集） | Shard 2（副本集） | Shard N（副本集）
```

**三大核心组件**：

| 组件 | 职责 |
|------|------|
| `mongod` | 数据存储进程，处理读写请求 |
| `mongos` | 分片路由进程，将请求分发到正确的 Shard |
| Config Server | 存储分片集群的元数据（集合路由信息、Chunk 分布）|

---

## 与关系型数据库的对比

| 概念 | MongoDB | 关系型数据库 | 核心差异 |
|------|---------|-------------|----------|
| 数据容器 | Database | Database | 基本一致 |
| 数据组织 | Collection | Table | 无固定 Schema |
| 数据单元 | Document | Row | JSON 文档 vs 结构化行 |
| 字段定义 | 无需预定义 | Column（固定）| 灵活 vs 严格 |
| 关联查询 | `$lookup`（有限）| JOIN | 推荐嵌入代替 JOIN |
| 主键 | `_id`（自动）| Primary Key | ObjectId vs 自增整数 |
| 事务 | 多文档事务（4.0+）| 完整 ACID | 能力相近但代价不同 |
| 扩展方式 | 水平分片 | 垂直为主 | 天然支持水平扩展 |
| 查询语言 | MQL（JSON 风格）| SQL | 声明式 vs 声明式 |

---

## 应用场景

### 1. 用户中心

用户信息字段差异大（普通用户/企业用户/VIP），文档模型天然适合多态数据。

```json
// 普通用户
{ "_id": "user_001", "type": "personal", "name": "张三", "phone": "138xxx" }

// 企业用户
{ "_id": "user_002", "type": "enterprise", "companyName": "ABC科技", "taxId": "91440xxx", "contacts": [...] }
```

### 2. 订单系统

订单与订单行天然嵌套，一次读取获取完整订单，避免 JOIN。

```json
{
  "_id": "order_001",
  "status": "shipped",
  "items": [
    { "sku": "SKU001", "qty": 2, "price": 99 },
    { "sku": "SKU002", "qty": 1, "price": 299 }
  ]
}
```

### 3. 内容平台

文章、评论、标签结构差异大，适合文档模型存储。

### 4. IoT 与时序数据

Time Series Collection（5.0+）原生支持时序数据高效存储与查询。

### 5. 日志与审计

非结构化日志直接存储为文档，支持灵活查询与聚合分析。

---

## 版本演进关键变化

| 版本 | 关键特性 |
|------|----------|
| **4.0** | 多文档事务（副本集）、可重试写入 |
| **4.2** | 分布式事务（分片集群）、通配符索引 |
| **4.4** | 隐藏索引、复合 Hashed 分片键、Hedged Reads |
| **5.0** | Time Series Collection、实时采样、可重试性改进 |
| **6.0** | Change Streams Pre/Post Image、可查询加密（QE）、分片键重分片 |
| **7.0** | 复合向量索引、Sharded Cluster 性能提升、`$percentile` 聚合 |
| **8.0** | 批量写入性能大幅提升、新查询执行引擎（Slot-Based Execution）全面启用 |

---

## 易错点与注意事项

### 1. MongoDB 不是银弹

```
✅ 适合 MongoDB：
  - 数据结构多变、快速迭代的业务
  - 嵌套/层级数据（订单、用户画像）
  - 需要水平扩展的大数据量场景
  - 内容管理、IoT、日志分析

❌ 不适合 MongoDB：
  - 强事务需求（银行核心账务）
  - 复杂多表关联查询
  - 数据高度规范化的场景
```

### 2. 16MB 文档限制

嵌入过多数据会触发文档大小上限，对于"无限增长"的数组（如评论列表），应改用引用关系。

### 3. `_id` 不可修改

文档的 `_id` 一旦插入不可更改，业务主键应单独设计字段。

### 4. 数据库与集合懒创建

MongoDB 在首次写入时才真正创建数据库和集合，`use mydb` 不会立即创建数据库。

---

## 总结

**MongoDB 核心概念速查**：
- **Database**：数据库，集合的逻辑容器
- **Collection**：集合，文档的逻辑分组，无固定 Schema
- **Document**：文档，BSON 格式的最小数据单元（上限 16MB）
- **Field**：字段，支持丰富的 BSON 类型
- 
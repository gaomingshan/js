# Elasticsearch 核心概念与架构模型

## 概述

Elasticsearch 是一个基于 Apache Lucene 构建的分布式搜索与分析引擎，专为处理大规模数据的实时搜索、日志分析和复杂聚合而设计。理解其核心概念和架构模型，是掌握 Elasticsearch 的第一步。

## 核心概念

### 1. 文档（Document）

**文档是 ES 中的最小数据单元**，以 JSON 格式存储，类似于关系型数据库中的一行记录。

```json
{
  "_index": "products",
  "_id": "1",
  "_source": {
    "name": "iPhone 14 Pro",
    "price": 7999,
    "category": "electronics",
    "brand": "Apple",
    "in_stock": true,
    "created_at": "2024-01-15"
  }
}
```

**关键特性**：
- 每个文档有唯一的 `_id`（可自动生成或手动指定）
- `_source` 字段存储原始 JSON 数据
- 文档是自包含的（self-contained），包含所有必要信息
- 支持嵌套结构和数组

### 2. 索引（Index）

**索引是文档的逻辑容器**，类似于关系型数据库中的"数据库"或"表"。

```bash
# 索引命名规范
products           # 商品索引
logs-2024.01.15   # 按日期分割的日志索引
user_profiles     # 用户档案索引
```

**重要概念**：
- 索引名必须小写
- 一个索引可以包含多个类型的文档（7.0+ 移除了 Type 概念）
- 每个索引由多个分片（Shard）组成

### 3. 类型（Type）- 已废弃

**历史概念**：在 ES 6.x 及之前，一个索引可以包含多个 Type，类似于数据库中的表。

**7.0+ 重大变化**：Type 概念被完全移除，一个索引只能有一个映射（Mapping）。

**迁移建议**：
- 旧版本：`/index/type/id`
- 新版本：`/index/_doc/id`

### 4. 分片（Shard）

**分片是索引的物理分割单元**，将数据水平切分到多个 Lucene 实例。

```
索引 products (1000万文档)
  ├── 主分片 0 (200万文档)
  ├── 主分片 1 (200万文档)
  ├── 主分片 2 (200万文档)
  ├── 主分片 3 (200万文档)
  └── 主分片 4 (200万文档)
```

**分片类型**：
- **主分片（Primary Shard）**：负责写入和查询，索引创建时确定数量，后续不可更改
- **副本分片（Replica Shard）**：主分片的完整副本，提供高可用和读性能扩展

**关键特性**：
- 每个分片本质上是一个独立的 Lucene 索引
- 分片数量影响集群的扩展能力和查询性能
- 默认配置：5个主分片，1个副本（ES 7.0+ 改为 1 个主分片）

### 5. 副本（Replica）

**副本提供数据冗余和查询性能提升**。

```
集群配置示例：
  - 主分片数：3
  - 副本数：2
  - 总分片数：3 (primary) + 6 (replica) = 9 个分片
```

**副本的作用**：
- **高可用**：主分片故障时，副本分片可提升为主分片
- **负载均衡**：查询请求可分发到副本分片
- **数据安全**：多份数据副本防止数据丢失

## 与关系型数据库的对比

| 概念 | Elasticsearch | 关系型数据库 | 说明 |
|------|--------------|-------------|------|
| 数据单元 | Document | Row | JSON vs 结构化行 |
| 数据容器 | Index | Database/Table | 逻辑分组 |
| 结构定义 | Mapping | Schema | 动态 vs 静态 |
| 查询语言 | Query DSL (JSON) | SQL | 声明式查询 |
| 数据分布 | Shard | Partition | 自动分片 |
| 主键 | _id | Primary Key | 唯一标识 |
| 关系处理 | Nested/Parent-Child | JOIN | 去范式化设计 |

**核心差异**：
- **ES 是搜索引擎，非数据库**：优化目标是全文搜索和聚合分析
- **无事务支持**：不支持跨文档的 ACID 事务
- **去范式化设计**：推荐数据冗余，避免 JOIN 操作
- **倒排索引 vs B+树索引**：文本搜索 vs 精确查询

## Elasticsearch 的设计理念

### 1. 分布式优先

从设计之初就考虑分布式场景，自动处理数据分片、副本和故障转移。

```
单机容量有限 → 水平扩展 → 分布式架构
```

### 2. 实时性（Near Real-Time）

通过 Refresh 机制实现准实时搜索（默认1秒刷新间隔）。

```
写入 → 内存缓冲 → Refresh (1s) → 可搜索
```

### 3. Schema-less（动态映射）

支持动态映射，自动推断字段类型，降低使用门槛。

```json
PUT /products/_doc/1
{
  "name": "iPhone",    // 自动识别为 text
  "price": 7999,       // 自动识别为 long
  "in_stock": true     // 自动识别为 boolean
}
```

### 4. RESTful API

所有操作通过 HTTP RESTful API 完成，语言无关，易于集成。

```bash
# CRUD 操作
PUT    /index/_doc/1      # 创建/更新
GET    /index/_doc/1      # 查询
DELETE /index/_doc/1      # 删除
POST   /index/_search     # 搜索
```

## ELK Stack 生态体系

Elasticsearch 是 ELK（现称 Elastic Stack）的核心组件。

```
数据流向：
数据源 → Beats/Logstash → Elasticsearch → Kibana
```

**组件说明**：
- **Elasticsearch**：存储、搜索、分析引擎
- **Logstash**：数据采集、转换、输出管道
- **Kibana**：可视化与管理界面
- **Beats**：轻量级数据采集器（Filebeat、Metricbeat 等）

## 应用场景

### 1. 全文搜索引擎

**典型场景**：电商商品搜索、内容管理系统、文档检索

```json
// 搜索"苹果手机"
GET /products/_search
{
  "query": {
    "match": {
      "name": "苹果手机"
    }
  }
}
```

**优势**：
- 强大的分词和相关性算分
- 支持拼音、同义词、纠错
- 毫秒级响应

### 2. 日志分析与监控

**典型场景**：应用日志、系统日志、安全日志分析

```
应用 → Filebeat → Logstash → Elasticsearch → Kibana
```

**优势**：
- 处理海量日志数据（PB 级）
- 实时查询和告警
- 强大的时间序列聚合

### 3. 数据分析与可视化

**典型场景**：业务指标分析、用户行为分析、APM

```json
// 按日期统计订单量
GET /orders/_search
{
  "aggs": {
    "orders_by_date": {
      "date_histogram": {
        "field": "created_at",
        "interval": "day"
      }
    }
  }
}
```

**优势**：
- 强大的聚合分析能力
- 实时数据分析
- Kibana 丰富的可视化

### 4. 指标监控

**典型场景**：服务器监控、应用性能监控、业务指标

```
Metricbeat → Elasticsearch → Kibana Dashboard
```

### 5. 地理位置应用

**典型场景**：LBS 服务、物流跟踪、地图搜索

```json
// 查询附近5公里的门店
GET /stores/_search
{
  "query": {
    "geo_distance": {
      "distance": "5km",
      "location": {
        "lat": 39.9042,
        "lon": 116.4074
      }
    }
  }
}
```

## 发展历程

```
2010年  Elasticsearch 0.4 发布（基于 Lucene）
2012年  1.0 版本发布，生产可用
2014年  Elastic 公司成立，整合 ELK Stack
2015年  2.0 版本，引入 Pipeline Aggregations
2016年  5.0 版本，版本号与 Logstash、Kibana 统一
2017年  6.0 版本，开始废弃 Type
2019年  7.0 版本，完全移除 Type
2022年  8.0 版本，重写网络层，移除 TransportClient
```

## 易错点与注意事项

### 1. ES 不是数据库

**错误认知**：把 ES 当作主数据库使用

**正确做法**：
- ES 作为搜索和分析引擎
- 关系型数据库存储主数据
- 通过 CDC 或 MQ 同步数据到 ES

### 2. 分片数量规划

**常见错误**：创建索引时设置过多或过少的分片

**最佳实践**：
- 单个分片大小：20-40GB
- 节点分片数：每 GB 堆内存对应 20 个分片
- 小数据量索引：1 个主分片即可

### 3. 文档设计去范式化

**错误做法**：像关系型数据库一样范式化设计

```json
// ❌ 错误：拆分成多个索引，需要 JOIN
索引 users: { "id": 1, "name": "张三" }
索引 orders: { "user_id": 1, "product": "iPhone" }

// ✅ 正确：冗余存储用户信息
索引 orders: {
  "user_id": 1,
  "user_name": "张三",
  "product": "iPhone"
}
```

### 4. 实时性认知

**错误认知**：ES 是完全实时的

**实际情况**：
- 默认 1 秒 Refresh 间隔
- 写入后需等待 Refresh 才可搜索
- 可通过 `?refresh=true` 强制刷新（影响性能）

## 关键设计决策

### 为什么选择 Lucene？

Lucene 是成熟的全文搜索库，提供：
- 倒排索引实现
- 强大的分词和查询能力
- 高性能的搜索算法

### 为什么去范式化？

- 避免分布式 JOIN 的复杂性和性能问题
- 提高查询性能（单次查询获取所有数据）
- 适应搜索场景的读多写少特性

### 为什么是 Near Real-Time？

- 平衡实时性和性能
- Refresh 操作成本高（创建新 Segment）
- 1 秒延迟满足大多数业务场景

## 总结

Elasticsearch 核心概念：
- **文档（Document）**：JSON 格式的数据单元
- **索引（Index）**：文档的逻辑容器
- **分片（Shard）**：数据的物理分割，支持水平扩展
- **副本（Replica）**：数据冗余，提供高可用

核心设计理念：
- 分布式优先，自动分片和故障转移
- 准实时搜索，平衡性能与实时性
- 去范式化，优化搜索性能
- RESTful API，易于集成

应用场景：
- 全文搜索引擎
- 日志分析与监控
- 数据分析与可视化
- 指标监控与告警

**下一步**：深入理解 Elasticsearch 的底层数据结构——倒排索引原理。

# 查询执行流程

## 概述

Elasticsearch 查询在分布式环境下的执行流程涉及多个阶段的协调，理解 Query Then Fetch 两阶段查询机制是优化查询性能的基础。

## Query Then Fetch 两阶段查询

### 完整查询流程

```
客户端
  ↓ 1. 发送查询请求
协调节点（Coordinating Node）
  ↓ 2. 广播查询到所有相关分片
各分片节点（Shard Nodes）
  ↓ 3. 查询阶段（Query Phase）
  ↓ 4. 返回文档ID和得分
协调节点
  ↓ 5. 合并排序结果
  ↓ 6. 确定最终返回的文档
  ↓ 7. 取回阶段（Fetch Phase）
各分片节点
  ↓ 8. 返回完整文档
协调节点
  ↓ 9. 组装最终结果
  ↓ 10. 返回给客户端
客户端
  ✓ 11. 接收结果
```

### 查询阶段（Query Phase）

**目标**：找出匹配的文档ID和得分

```
1. 协调节点接收查询请求
2. 确定需要查询的分片（主分片或副本）
3. 并发发送查询到所有相关分片
4. 每个分片：
   - 执行查询
   - 计算匹配文档的得分
   - 构建优先级队列（from + size）
   - 返回文档ID和得分
5. 协调节点收集所有分片的结果
```

**示例**：

```json
GET /products/_search
{
  "query": { "match": { "name": "phone" } },
  "from": 0,
  "size": 10
}

// 查询阶段：
// 每个分片返回：
[
  { "_id": "1", "_score": 2.5 },
  { "_id": "5", "_score": 2.3 },
  { "_id": "9", "_score": 2.1 },
  ...
  // 每个分片返回 from + size = 10 个结果
]
```

### 取回阶段（Fetch Phase）

**目标**：获取完整的文档内容

```
1. 协调节点合并所有分片的结果
2. 排序并截取 top from+size 个文档
3. 确定最终需要返回的文档ID
4. 向对应分片请求完整文档（multi-get）
5. 各分片返回 _source 字段
6. 协调节点组装最终结果
```

**示例**：

```
假设3个分片，from=0, size=10

查询阶段：
  分片0返回：[doc1:2.5, doc2:2.3, ...]（10个）
  分片1返回：[doc5:2.8, doc6:2.1, ...]（10个）
  分片2返回：[doc8:2.6, doc9:2.0, ...]（10个）

协调节点合并排序：
  [doc5:2.8, doc8:2.6, doc1:2.5, doc2:2.3, ...]

取回阶段：
  请求分片1获取 doc5
  请求分片2获取 doc8
  请求分片0获取 doc1
  ...

最终返回10个文档
```

## 分片选择策略

### 轮询（Round Robin）

**默认策略**，均匀分配查询到主分片和副本分片。

```
请求1 → 分片0的主分片
请求2 → 分片0的副本分片
请求3 → 分片0的主分片
...
```

### preference 参数

**控制分片选择偏好**：

```bash
# 优先查询本地分片
GET /products/_search?preference=_local
{
  "query": { "match_all": {} }
}

# 仅查询主分片
GET /products/_search?preference=_primary
{
  "query": { "match_all": {} }
}

# 仅查询副本分片
GET /products/_search?preference=_replica
{
  "query": { "match_all": {} }
}

# 使用自定义字符串（相同字符串路由到相同分片）
GET /products/_search?preference=user_123
{
  "query": { "match_all": {} }
}
```

**使用场景**：
- `_local`：减少网络跳转
- `_primary`：确保读取最新数据
- 自定义值：缓存友好（相同用户总是查询相同分片）

## 深度分页问题

### 问题原因

```
查询：from=10000, size=10

查询阶段：
  每个分片需要维护 10010 个结果
  3个分片：3 × 10010 = 30030 个结果

协调节点：
  合并排序 30030 个结果
  仅返回最后 10 个

问题：
  - 内存占用大
  - 排序开销大
  - 性能随 from 增加急剧下降
```

### 解决方案1：Scroll API

**适用场景**：遍历大量数据，不需要跳页

```bash
# 1. 初始化 Scroll
POST /products/_search?scroll=1m
{
  "size": 100,
  "query": { "match_all": {} }
}

# 响应包含 _scroll_id
{
  "_scroll_id": "abc123...",
  "hits": {
    "total": { "value": 10000 },
    "hits": [ ... ]  // 前100个文档
  }
}

# 2. 获取下一批数据
POST /_search/scroll
{
  "scroll": "1m",
  "scroll_id": "abc123..."
}

# 3. 继续滚动直到无数据

# 4. 清理 Scroll
DELETE /_search/scroll
{
  "scroll_id": "abc123..."
}
```

**特点**：
- 维护快照，数据一致
- 不支持跳页
- 需要手动清理
- 适合：数据导出、批量处理

### 解决方案2：Search After

**适用场景**：深度分页，需要实时数据

```bash
# 1. 首次查询
GET /products/_search
{
  "size": 10,
  "query": { "match_all": {} },
  "sort": [
    { "price": "asc" },
    { "_id": "asc" }  // 保证排序唯一性
  ]
}

# 响应
{
  "hits": {
    "hits": [
      {
        "_id": "10",
        "_source": { ... },
        "sort": [100, "10"]  // 最后一个文档的排序值
      }
    ]
  }
}

# 2. 下一页查询
GET /products/_search
{
  "size": 10,
  "query": { "match_all": {} },
  "sort": [
    { "price": "asc" },
    { "_id": "asc" }
  ],
  "search_after": [100, "10"]  // 使用上一页最后的排序值
}
```

**优点**：
- 性能稳定（不受 from 影响）
- 实时数据（无快照）
- 无状态（无需清理）

**限制**：
- 不支持跳页
- 必须有排序字段

### 解决方案3：限制 from 值

```bash
# 索引级别限制
PUT /products/_settings
{
  "max_result_window": 10000  // 默认 10000
}

# 超过限制会报错
GET /products/_search
{
  "from": 10001,
  "size": 10
}

# 错误响应
{
  "error": {
    "type": "illegal_argument_exception",
    "reason": "Result window is too large, from + size must be less than or equal to: [10000]"
  }
}
```

### 深度分页对比

| 方案 | from+size | Scroll | Search After |
|------|-----------|--------|--------------|
| **跳页** | 支持 | 不支持 | 不支持 |
| **实时性** | 实时 | 快照 | 实时 |
| **性能** | 随from增加变差 | 稳定 | 稳定 |
| **状态** | 无状态 | 有状态 | 无状态 |
| **使用场景** | 浅分页（< 10000） | 数据导出 | 深度分页 |

## 查询性能分析

### Profile API

**分析查询各阶段的耗时**：

```bash
GET /products/_search
{
  "profile": true,
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "phone" } }
      ],
      "filter": [
        { "range": { "price": { "gte": 1000 } } }
      ]
    }
  }
}
```

**响应**：

```json
{
  "profile": {
    "shards": [
      {
        "id": "[...]",
        "searches": [
          {
            "query": [
              {
                "type": "BooleanQuery",
                "description": "+(name:phone) #(price:[1000 TO *])",
                "time_in_nanos": 1234567,
                "breakdown": {
                  "score": 56789,
                  "build_scorer": 123456,
                  "match": 234567,
                  ...
                },
                "children": [
                  {
                    "type": "TermQuery",
                    "description": "name:phone",
                    "time_in_nanos": 567890
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**分析指标**：
- **time_in_nanos**：总耗时
- **breakdown**：各阶段耗时
  - **create_weight**：创建权重
  - **build_scorer**：构建评分器
  - **match**：匹配文档
  - **score**：计算得分

### Explain API

**解释文档得分计算**：

```bash
GET /products/_explain/1
{
  "query": {
    "match": {
      "name": "phone"
    }
  }
}

# 响应
{
  "matched": true,
  "_explanation": {
    "value": 2.5,
    "description": "sum of:",
    "details": [
      {
        "value": 2.5,
        "description": "weight(name:phone in 0) [PerFieldSimilarity], result of:",
        "details": [
          {
            "value": 2.5,
            "description": "score(freq=1.0), computed as boost * idf * tf from:",
            "details": [
              { "value": 2.2, "description": "boost" },
              { "value": 1.5, "description": "idf, computed as log(1 + (N - n + 0.5) / (n + 0.5))" },
              { "value": 0.76, "description": "tf, computed as freq / (freq + k1 * (1 - b + b * dl / avgdl))" }
            ]
          }
        ]
      }
    ]
  }
}
```

## 慢查询日志

### 配置慢查询日志

```bash
# 索引级别配置
PUT /products/_settings
{
  "index.search.slowlog.threshold.query.warn": "2s",
  "index.search.slowlog.threshold.query.info": "1s",
  "index.search.slowlog.threshold.query.debug": "500ms",
  "index.search.slowlog.threshold.query.trace": "200ms",
  
  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.search.slowlog.threshold.fetch.info": "500ms",
  "index.search.slowlog.threshold.fetch.debug": "200ms",
  "index.search.slowlog.threshold.fetch.trace": "100ms"
}
```

### 慢查询日志示例

```
[2024-01-15T10:30:00,123][WARN ][i.s.slowlog.query] [products/0]
took[2.5s], took_millis[2500], total_hits[100000], types[], stats[], 
search_type[QUERY_THEN_FETCH], total_shards[3], 
source[{"query":{"match":{"name":"phone"}}}]
```

**分析慢查询**：
- 优化查询条件
- 增加过滤条件
- 调整分片数量
- 增加硬件资源

## 查询缓存

### Shard Request Cache

**缓存整个分片的查询结果**：

```bash
# 启用缓存（默认启用）
PUT /products/_settings
{
  "index.requests.cache.enable": true
}

# 查询时使用缓存
GET /products/_search?request_cache=true
{
  "query": { "match_all": {} },
  "size": 0,  // size=0 的查询会被缓存
  "aggs": { ... }
}
```

**缓存条件**：
- `size=0` 的查询
- Refresh 后缓存失效
- 仅缓存精确查询（不包含 `now`）

### Query Cache

**缓存过滤器（filter）查询结果**：

```bash
# 启用查询缓存（默认启用）
PUT /_cluster/settings
{
  "persistent": {
    "indices.queries.cache.size": "10%"  // 堆内存的10%
  }
}
```

**缓存策略**：
- 仅缓存 filter 查询
- LRU 缓存策略
- 自动管理

### Fielddata Cache

**text 字段聚合时的内存缓存**：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "indices.fielddata.cache.size": "20%"
  }
}
```

**警告**：fielddata 占用大量内存，推荐使用 keyword 子字段。

## 查询优化技巧

### 1. 优先使用 filter

```json
// ✅ 推荐
{
  "bool": {
    "must": [
      { "match": { "title": "elasticsearch" } }
    ],
    "filter": [
      { "term": { "status": "published" } },
      { "range": { "date": { "gte": "2024-01-01" } } }
    ]
  }
}

// ❌ 不推荐
{
  "bool": {
    "must": [
      { "match": { "title": "elasticsearch" } },
      { "term": { "status": "published" } },
      { "range": { "date": { "gte": "2024-01-01" } } }
    ]
  }
}
```

### 2. 减少返回字段

```json
GET /products/_search
{
  "query": { "match_all": {} },
  "_source": ["name", "price"],  // 仅返回需要的字段
  "size": 10
}
```

### 3. 使用 Scroll 或 Search After 代替深度分页

### 4. 避免通配符开头的查询

```json
// ❌ 慢
{ "wildcard": { "name": "*phone" } }

// ✅ 快
{ "wildcard": { "name": "phone*" } }
```

### 5. 合理设置 size

```json
// ❌ 不推荐
GET /products/_search
{
  "size": 10000  // 过大
}

// ✅ 推荐
GET /products/_search
{
  "size": 20  // 合理大小
}
```

## 监控查询性能

### 关键指标

```bash
# 查询统计
GET /products/_stats/search

{
  "indices": {
    "products": {
      "primaries": {
        "search": {
          "query_total": 50000,           # 查询总数
          "query_time_in_millis": 120000, # 查询总耗时
          "query_current": 5,             # 当前查询数
          "fetch_total": 10000,
          "fetch_time_in_millis": 30000,
          "scroll_total": 100,
          "scroll_time_in_millis": 5000
        }
      }
    }
  }
}
```

**计算平均查询时间**：

```
平均查询时间 = query_time_in_millis / query_total
            = 120000 / 50000
            = 2.4ms
```

### 告警阈值建议

```
告警规则：
1. 平均查询延迟 > 100ms
2. P95 查询延迟 > 500ms
3. 当前查询数 > 100（查询积压）
4. 查询拒绝率 > 1%
```

## 总结

**查询执行流程**：
1. **查询阶段**：并发查询所有分片，返回文档ID和得分
2. **取回阶段**：获取完整文档内容

**深度分页问题**：
- **from + size**：浅分页（< 10000）
- **Scroll**：数据导出、批量处理
- **Search After**：深度分页、实时数据

**查询性能分析**：
- **Profile API**：分析查询各阶段耗时
- **Explain API**：解释得分计算
- **慢查询日志**：记录慢查询

**查询缓存**：
- **Shard Request Cache**：缓存整个分片的查询结果
- **Query Cache**：缓存 filter 查询结果
- **Fielddata Cache**：text 字段聚合缓存

**优化技巧**：
- 优先使用 filter（可缓存）
- 减少返回字段（`_source` 过滤）
- 避免深度分页
- 避免通配符开头查询
- 合理设置 size

**下一步**：学习相关性算分与排序，理解搜索结果的相关性计算。

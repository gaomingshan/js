# 文档写入流程

## 概述

理解文档从客户端提交到最终可搜索的完整流程，是掌握 Elasticsearch 写入性能优化和故障排查的基础。本章详细剖析分布式环境下的写入流程、路由机制、版本控制和批量写入优化。

## 文档写入的完整流程

### 单文档写入流程

```
客户端
  ↓ 1. 发送写入请求
协调节点（Coordinating Node）
  ↓ 2. 计算路由，确定目标分片
  ↓ 3. 转发请求到主分片所在节点
主分片节点（Primary Shard）
  ↓ 4. 写入主分片（内存 + Translog）
  ↓ 5. 并发复制到副本分片
副本分片节点（Replica Shard）
  ↓ 6. 写入副本分片（内存 + Translog）
  ↓ 7. 副本确认写入成功
主分片节点
  ↓ 8. 汇总副本响应，确认写入
  ↓ 9. 返回响应给协调节点
协调节点
  ↓ 10. 返回响应给客户端
客户端
  ✓ 11. 接收响应
```

### 详细步骤解析

#### 1. 路由计算

**协调节点接收请求后，计算文档应该存储在哪个分片**。

```bash
# 写入文档
PUT /products/_doc/1
{
  "name": "iPhone 14",
  "price": 7999
}
```

**路由算法**：

```java
shard_num = hash(_routing) % number_of_primary_shards

// 默认使用文档 ID 作为路由值
shard_num = hash("1") % 5 = 3

// 文档存储在主分片 3
```

**自定义路由**：

```bash
# 使用 user_id 作为路由，确保同一用户的文档在同一分片
PUT /orders/_doc/order_123?routing=user_456
{
  "user_id": "user_456",
  "product": "iPhone",
  "amount": 7999
}
```

**优势**：
- 同一用户的订单存储在同一分片
- 查询该用户的订单时，只需查询一个分片

#### 2. 转发到主分片

协调节点查询 Cluster State，找到主分片 3 所在的节点，将请求转发过去。

```
Cluster State:
  主分片 3 → 节点2（192.168.1.102）
  
协调节点 → 节点2
```

#### 3. 主分片写入

**主分片节点执行写入操作**：

```
1. 验证文档（检查字段类型、映射）
2. 分配序列号（_seq_no）和主要项（_primary_term）
3. 写入内存缓冲（Memory Buffer）
4. 写入 Translog（事务日志）
5. 返回写入确认
```

**内存缓冲**：
- 文档先写入内存中的 Lucene 缓冲区
- 此时文档**尚未可搜索**

**Translog**：
- 同时写入事务日志（磁盘），保证数据不丢失
- 即使节点崩溃，也可通过 Translog 恢复

#### 4. 副本同步

**主分片并发将写入请求复制到所有副本分片**。

```
主分片（节点2）
  ├─→ 副本分片1（节点1）
  └─→ 副本分片2（节点3）
```

**副本写入过程**：
1. 副本分片写入内存缓冲
2. 副本分片写入 Translog
3. 副本分片返回确认

#### 5. 等待副本确认

**主分片等待副本响应**，根据一致性级别决定何时返回成功。

**wait_for_active_shards 参数**：

```bash
# 默认：等待主分片写入成功即可（wait_for_active_shards=1）
PUT /products/_doc/1
{
  "name": "iPhone"
}

# 等待 1 个主分片 + 1 个副本分片写入成功
PUT /products/_doc/1?wait_for_active_shards=2
{
  "name": "iPhone"
}

# 等待所有分片（主 + 所有副本）写入成功
PUT /products/_doc/1?wait_for_active_shards=all
{
  "name": "iPhone"
}
```

**参数说明**：
- **1**（默认）：仅主分片写入成功
- **2**：主分片 + 至少 1 个副本成功
- **all**：主分片 + 所有副本成功
- **quorum**（已废弃）：多数分片成功

**权衡**：
- 更高的 `wait_for_active_shards` → 数据更安全，但写入延迟更高
- 默认值（1）→ 性能最优，但存在数据丢失风险（主分片宕机且 Translog 未刷盘）

#### 6. 返回响应

```json
{
  "_index": "products",
  "_id": "1",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "_seq_no": 0,
  "_primary_term": 1
}
```

**响应字段**：
- **_version**：版本号（每次更新递增）
- **result**：`created`（新建）或 `updated`（更新）
- **_shards**：分片写入状态
- **_seq_no** / **_primary_term**：序列号和主要项（7.0+ 版本控制）

## 文档 ID 生成策略

### 自动生成 ID

```bash
# POST 请求，自动生成 ID
POST /products/_doc
{
  "name": "iPhone"
}

# 响应
{
  "_id": "AWxyz123...",  // 自动生成的 22 字符 Base64 UUID
  "result": "created"
}
```

**自动 ID 特性**：
- 使用 Base64 编码的 UUID
- 保证全局唯一
- 长度：22 字符

### 手动指定 ID

```bash
# PUT 请求，指定 ID
PUT /products/_doc/1
{
  "name": "iPhone"
}
```

**手动 ID 优势**：
- 幂等性：重复执行结果一致
- 便于引用：外部系统可直接通过 ID 查询

**手动 ID 注意事项**：
- 需确保 ID 唯一性
- 相同 ID 的写入会覆盖原文档（更新操作）

### ID 生成策略选择

| 场景 | 推荐策略 | 原因 |
|------|---------|------|
| 日志、事件流 | 自动生成 | 无需幂等性，自动 ID 性能更高 |
| 业务数据（订单、用户） | 手动指定 | 使用业务 ID，便于查询和更新 |
| 数据同步 | 手动指定 | 使用源系统 ID，保持一致性 |

## 路由（Routing）参数

### 默认路由

**使用文档 ID 作为路由值**：

```bash
PUT /products/_doc/12345
{
  "name": "iPhone"
}

# 路由计算：hash("12345") % num_primary_shards
```

### 自定义路由

**指定路由字段**：

```bash
PUT /orders/_doc/order_123?routing=user_456
{
  "user_id": "user_456",
  "product": "iPhone"
}

# 路由计算：hash("user_456") % num_primary_shards
# 同一用户的所有订单存储在同一分片
```

**查询时也需指定路由**：

```bash
GET /orders/_doc/order_123?routing=user_456

# 查询该用户的所有订单（仅查询一个分片）
GET /orders/_search?routing=user_456
{
  "query": {
    "term": {
      "user_id": "user_456"
    }
  }
}
```

### 自定义路由的优势与劣势

**优势**：
- 相关文档存储在同一分片，查询性能提升
- 减少跨分片查询（只需查询一个分片）

**劣势**：
- 可能导致数据倾斜（某些分片数据过多）
- 查询时必须指定路由，否则需要查询所有分片
- 增加复杂性

**适用场景**：
- 多租户系统（按租户路由）
- 用户相关数据（按用户路由）
- 时间序列数据（按时间范围路由）

## 版本控制（Version）与乐观并发

### 内部版本号

**每次更新，版本号递增**：

```bash
# 首次写入
PUT /products/_doc/1
{
  "name": "iPhone",
  "price": 7999
}

# 响应：_version=1

# 更新
PUT /products/_doc/1
{
  "name": "iPhone 14",
  "price": 8999
}

# 响应：_version=2
```

### 乐观并发控制

**使用版本号防止并发更新冲突**：

```bash
# 基于 _version（7.0 之前）
PUT /products/_doc/1?version=1&version_type=internal
{
  "name": "iPhone 14",
  "price": 8999
}

# 如果当前版本不是 1，返回 409 冲突错误
```

**7.0+ 新版本控制**：使用 `if_seq_no` 和 `if_primary_term`

```bash
# 1. 获取文档当前版本
GET /products/_doc/1

{
  "_seq_no": 5,
  "_primary_term": 1,
  "_source": {
    "name": "iPhone",
    "price": 7999
  }
}

# 2. 基于 seq_no 和 primary_term 更新
PUT /products/_doc/1?if_seq_no=5&if_primary_term=1
{
  "name": "iPhone 14",
  "price": 8999
}

# 如果版本不匹配，返回 409 冲突
```

### 外部版本号

**使用外部系统的版本号**：

```bash
PUT /products/_doc/1?version=12345&version_type=external
{
  "name": "iPhone"
}

# 规则：外部版本号必须 > 当前版本号
# 适用于从其他系统同步数据
```

### 并发更新场景

**问题**：两个客户端同时更新同一文档

```
时间线：
T1: 客户端A 读取文档（version=1）
T2: 客户端B 读取文档（version=1）
T3: 客户端A 更新文档（version=1 → 2）✓
T4: 客户端B 更新文档（基于 version=1）✗ 冲突
```

**解决方案**：

```bash
# 客户端B 重试
1. 重新读取文档（version=2）
2. 合并更改
3. 基于新版本更新（if_seq_no=6, if_primary_term=1）
```

## 批量写入（Bulk API）

### Bulk API 语法

```bash
POST /_bulk
{ "index": { "_index": "products", "_id": "1" } }
{ "name": "iPhone 14", "price": 7999 }
{ "create": { "_index": "products", "_id": "2" } }
{ "name": "MacBook Pro", "price": 15999 }
{ "update": { "_index": "products", "_id": "1" } }
{ "doc": { "price": 8999 } }
{ "delete": { "_index": "products", "_id": "3" } }
```

**操作类型**：
- **index**：创建或更新文档
- **create**：仅创建，ID 已存在则失败
- **update**：部分更新
- **delete**：删除文档

### Bulk 响应

```json
{
  "took": 30,
  "errors": false,
  "items": [
    {
      "index": {
        "_index": "products",
        "_id": "1",
        "_version": 1,
        "result": "created",
        "status": 201
      }
    },
    {
      "create": {
        "_index": "products",
        "_id": "2",
        "_version": 1,
        "result": "created",
        "status": 201
      }
    },
    {
      "update": {
        "_index": "products",
        "_id": "1",
        "_version": 2,
        "result": "updated",
        "status": 200
      }
    },
    {
      "delete": {
        "_index": "products",
        "_id": "3",
        "_version": 2,
        "result": "deleted",
        "status": 200
      }
    }
  ]
}
```

**响应字段**：
- **took**：总耗时（毫秒）
- **errors**：是否有错误
- **items**：每个操作的结果

### Bulk 优化建议

**1. 合理的批次大小**

```
推荐批次大小：
  - 文档数量：500-5000 条
  - 数据量：5-15 MB
  
避免：
  - 单次过大（> 100MB）→ 内存压力，超时
  - 单次过小（< 100条）→ 网络开销大
```

**2. 并发批量写入**

```java
// 伪代码
ExecutorService executor = Executors.newFixedThreadPool(4);

for (List<Document> batch : batches) {
    executor.submit(() -> {
        bulkRequest(batch);
    });
}
```

**并发数建议**：
- 单节点：2-4 个并发
- 多节点集群：可适当增加

**3. 错误处理**

```bash
# 检查 errors 字段
if (response.errors) {
    // 遍历 items，找出失败的操作
    for (item in response.items) {
        if (item.status >= 400) {
            // 记录失败的文档，稍后重试
            log.error(item.error);
        }
    }
}
```

**4. 使用 _bulk 端点而非多次单文档写入**

```bash
# ❌ 不推荐：循环单文档写入
for (doc in docs) {
    PUT /products/_doc/doc.id
    { ...doc }
}

# ✅ 推荐：批量写入
POST /_bulk
{ "index": { "_index": "products", "_id": "1" } }
{ ...doc1 }
{ "index": { "_index": "products", "_id": "2" } }
{ ...doc2 }
```

**性能提升**：批量写入比单文档写入快 5-10 倍。

## 写入一致性保证

### wait_for_active_shards

```bash
# 索引级别设置
PUT /products/_settings
{
  "index.write.wait_for_active_shards": "2"
}

# 请求级别设置
PUT /products/_doc/1?wait_for_active_shards=all
{
  "name": "iPhone"
}
```

**一致性级别**：

| 参数值 | 含义 | 数据安全性 | 写入延迟 |
|--------|------|-----------|---------|
| 1（默认） | 仅主分片成功 | 低 | 最低 |
| 2 | 主分片 + 1 个副本成功 | 中 | 中等 |
| all | 主分片 + 所有副本成功 | 高 | 最高 |

### timeout 参数

```bash
# 设置写入超时时间（默认 1 分钟）
PUT /products/_doc/1?timeout=30s
{
  "name": "iPhone"
}
```

**超时行为**：
- 超时不会回滚已写入的数据
- 主分片写入成功，但副本同步超时 → 返回超时错误
- 后台副本同步会继续进行

## 实战：优化写入性能

### 场景：每秒写入 10000 条日志

**优化策略**：

1. **批量写入**

```java
BulkRequest bulkRequest = new BulkRequest();

for (int i = 0; i < 1000; i++) {
    bulkRequest.add(new IndexRequest("logs")
        .source(document));
}

client.bulk(bulkRequest);
```

2. **降低副本数**

```bash
# 写入期间，临时降低副本数为 0
PUT /logs/_settings
{
  "number_of_replicas": 0
}

# 写入完成后，恢复副本数
PUT /logs/_settings
{
  "number_of_replicas": 1
}
```

3. **增加 Refresh 间隔**

```bash
# 默认 1 秒，增加到 30 秒
PUT /logs/_settings
{
  "refresh_interval": "30s"
}

# 写入完成后，手动 refresh
POST /logs/_refresh

# 恢复默认值
PUT /logs/_settings
{
  "refresh_interval": "1s"
}
```

4. **禁用 Translog 同步刷盘**（谨慎）

```bash
PUT /logs/_settings
{
  "index.translog.durability": "async",
  "index.translog.sync_interval": "30s"
}
```

**风险**：节点崩溃可能丢失最近 30 秒的数据。

5. **增加索引缓冲区**

```yaml
# elasticsearch.yml
indices.memory.index_buffer_size: 20%  # 默认 10%
```

6. **使用自动生成 ID**

```bash
# ✓ 自动 ID（性能更高）
POST /logs/_doc
{ "message": "log entry" }

# ✗ 手动 ID（需检查是否存在）
PUT /logs/_doc/12345
{ "message": "log entry" }
```

## 总结

**文档写入流程**：
1. 协调节点接收请求
2. 计算路由，确定目标分片
3. 转发到主分片节点
4. 主分片写入（内存 + Translog）
5. 并发复制到副本分片
6. 等待副本确认（根据 `wait_for_active_shards`）
7. 返回响应

**路由机制**：
- 默认：`hash(_id) % num_primary_shards`
- 自定义：使用 `routing` 参数，优化查询性能

**版本控制**：
- 内部版本号：每次更新递增
- 乐观并发控制：`if_seq_no` + `if_primary_term`
- 外部版本号：使用外部系统版本

**批量写入优化**：
- 批次大小：500-5000 条，5-15 MB
- 并发批量写入
- 错误处理和重试

**写入性能优化**：
- 批量写入（Bulk API）
- 降低副本数（临时）
- 增加 Refresh 间隔
- 使用自动生成 ID
- 增加索引缓冲区

**下一步**：学习 Translog 与数据持久化机制，理解如何保证数据不丢失。

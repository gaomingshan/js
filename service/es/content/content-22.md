# 数据一致性保证

## 概述

Elasticsearch 作为分布式系统，需要在一致性、可用性和分区容错性之间做出权衡。理解 ES 的一致性模型和保证机制，是构建可靠系统的基础。

## CAP 理论与 ES 的选择

### CAP 理论

```
C (Consistency)：一致性
  - 所有节点同一时间看到相同数据

A (Availability)：可用性  
  - 每个请求都能得到响应（成功或失败）

P (Partition Tolerance)：分区容错性
  - 网络分区时系统继续运行
```

**CAP 定理**：分布式系统最多同时满足两项。

### ES 的选择

**Elasticsearch 选择 AP（可用性 + 分区容错性）**：

```
优先保证：
  - 可用性：集群始终可读写
  - 分区容错性：网络分区时继续服务

牺牲：
  - 强一致性：允许短暂的数据不一致
```

**实际表现**：

```
- 默认配置：最终一致性
- 可调配置：准强一致性
- 网络分区：优先可用性
```

## 一致性级别

### 最终一致性（Eventual Consistency）

**ES 的默认行为**：

```
写入流程：
  1. 主分片写入成功
  2. 异步复制到副本分片
  3. 立即返回成功响应

读取流程：
  1. 读取任意分片（主或副本）
  2. 可能读到旧数据（副本未同步）
  3. 最终所有副本一致
```

**场景**：

```
T0: 写入文档（主分片）
T1: 返回成功
T2: 副本1同步中...
T3: 读取副本1 → 旧数据
T4: 副本1同步完成
T5: 读取副本1 → 新数据
```

### 准强一致性

**通过配置提升一致性**：

```bash
# 方式1：wait_for_active_shards
PUT /products/_doc/1?wait_for_active_shards=all
{
  "name": "iPhone"
}
# 等待所有副本写入成功

# 方式2：preference=_primary
GET /products/_search?preference=_primary
{
  "query": { "match_all": {} }
}
# 仅读取主分片（强一致性）

# 方式3：refresh=wait_for
PUT /products/_doc/1?refresh=wait_for
{
  "name": "iPhone"
}
# 等待 Refresh 后返回（可搜索）
```

### 一致性级别对比

| 级别 | 写入 | 读取 | 一致性 | 性能 | 可用性 |
|------|------|------|--------|------|--------|
| **最终一致** | wait_for_active_shards=1 | 任意分片 | 弱 | 高 | 高 |
| **准强一致** | wait_for_active_shards=all | preference=_primary | 强 | 低 | 低 |

## 写入一致性配置

### wait_for_active_shards

```bash
# 索引级别默认值
PUT /products/_settings
{
  "index.write.wait_for_active_shards": "1"
}

# 可选值：
# - 1：仅主分片（默认）
# - 2：主分片 + 1个副本
# - all：主分片 + 所有副本
# - quorum：多数分片（已废弃）
```

**计算公式**：

```
副本数 = number_of_replicas
总分片数 = 1 (主) + number_of_replicas

wait_for_active_shards = 2：
  - 1个副本配置：等待主分片 + 1个副本（全部）
  - 2个副本配置：等待主分片 + 1个副本（部分）
```

### refresh 参数

```bash
# false（默认）：异步 Refresh
PUT /products/_doc/1
{
  "name": "iPhone"
}

# true：立即 Refresh（性能影响大）
PUT /products/_doc/1?refresh=true
{
  "name": "iPhone"
}

# wait_for：等待下一次 Refresh
PUT /products/_doc/1?refresh=wait_for
{
  "name": "iPhone"
}
```

**使用场景**：

```
- false：正常写入（推荐）
- wait_for：需要立即搜索（测试、演示）
- true：避免使用（性能差）
```

## 副本同步机制

### 同步复制流程

```
主分片
  ↓ 1. 写入本地（内存 + Translog）
  ↓ 2. 并发发送到所有副本
副本分片（并发）
  ↓ 3. 写入本地（内存 + Translog）
  ↓ 4. 返回确认
主分片
  ↓ 5. 收集确认
  ↓ 6. 判断是否满足 wait_for_active_shards
  ↓ 7. 返回成功或超时
```

### 副本滞后处理

**副本写入失败**：

```
场景：副本节点故障或网络超时

处理：
  1. 主分片记录失败的副本
  2. 通知 Master 节点
  3. Master 更新路由表
  4. 副本标记为未分配
  5. 自动在其他节点创建新副本
```

**副本恢复**：

```
节点恢复后：
  1. 检测到副本过期
  2. 从主分片同步差异数据
  3. 使用 Translog 快速恢复
  4. 副本变为活跃状态
```

## 集群状态一致性

### Cluster State

**集群元数据**：

```
Cluster State 包含：
  - 集群配置
  - 节点列表
  - 索引元数据（mappings、settings）
  - 分片路由表
  - 别名配置
```

**存储位置**：

```
- Master 节点：权威副本
- 其他节点：缓存副本
```

### Cluster State 更新

**更新流程**：

```
1. 操作请求（如创建索引）
2. 转发到 Master 节点
3. Master 节点验证和应用更改
4. 递增版本号
5. 广播新 Cluster State 到所有节点
6. 节点确认接收
7. Master 返回成功
```

**版本号机制**：

```
每次更新递增版本号：
  version: 1234 → 1235 → 1236

节点比较版本号：
  本地版本 < Master 版本 → 更新
  本地版本 = Master 版本 → 忽略
  本地版本 > Master 版本 → 异常
```

### 脑裂后的一致性

**场景**：

```
网络分区导致脑裂：
  子集群A：节点1（Master A）
  子集群B：节点2、3（Master B）

问题：
  - 两个 Master 分别处理请求
  - Cluster State 分叉
  - 数据不一致
```

**恢复机制**：

```
网络恢复后：
  1. 检测到多个 Master
  2. 比较 Cluster State 版本号
  3. 选择版本号高的 Master
  4. 其他 Master 降级为普通节点
  5. 同步 Cluster State
  6. 数据冲突需要人工处理
```

**Quorum 防护**：

```
通过 Quorum 机制避免脑裂：
  - 子集群A（1个节点）：< Quorum，无法选举
  - 子集群B（2个节点）：>= Quorum，选举成功

结果：仅一个 Master，避免分叉
```

## 数据一致性场景

### 场景1：写后立即读

**问题**：

```
T0: 写入文档
T1: 返回成功（主分片写入）
T2: 查询文档 → 未找到（查询到未刷新的副本）
```

**解决方案**：

```bash
# 方案1：refresh=wait_for
PUT /products/_doc/1?refresh=wait_for
{
  "name": "iPhone"
}

# 方案2：Get API（实时读取）
GET /products/_doc/1
# Get API 从 Translog 读取，无需 Refresh

# 方案3：preference=_primary
GET /products/_search?preference=_primary
{
  "query": {
    "term": { "_id": "1" }
  }
}
```

### 场景2：主分片故障

**问题**：

```
T0: 写入主分片成功
T1: 主分片节点宕机
T2: 副本提升为新主分片
T3: 读取数据 → 可能读到旧数据（副本未完全同步）
```

**保证**：

```
使用 wait_for_active_shards：
  - wait_for_active_shards=all：所有副本同步
  - 主分片故障时，副本已有最新数据
  - 数据不丢失
```

### 场景3：网络分区

**问题**：

```
网络分区：
  分区A：主分片
  分区B：副本分片

写入：仅分区A可写
读取：两个分区都可读 → 数据不一致
```

**处理**：

```
优先可用性：
  - 允许短暂不一致
  - 网络恢复后自动同步
  - 业务层处理冲突
```

## Translog 与一致性

### Translog 的作用

```
1. 数据持久化：
   - 写入内存后立即写 Translog
   - 节点崩溃后从 Translog 恢复

2. 副本同步：
   - 副本从 Translog 快速恢复
   - 避免完整分片复制
```

### Translog 同步策略

```bash
# 同步策略（默认：request）
PUT /products/_settings
{
  "index.translog.durability": "request"
}

# request：每次写入后 fsync Translog
#   - 数据安全性高
#   - 性能略低

# async：定期 fsync Translog（5秒）
{
  "index.translog.durability": "async",
  "index.translog.sync_interval": "5s"
}
#   - 性能高
#   - 可能丢失 5 秒数据
```

## 实战：不同场景的一致性配置

### 金融交易系统

**要求**：数据不能丢失，一致性优先

```bash
PUT /transactions
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2,
    "index.write.wait_for_active_shards": "all",
    "index.translog.durability": "request",
    "refresh_interval": "1s"
  }
}

# 写入
PUT /transactions/_doc/1?wait_for_active_shards=all
{
  "amount": 10000,
  "status": "completed"
}

# 查询（读取主分片）
GET /transactions/_search?preference=_primary
{
  "query": { "match_all": {} }
}
```

### 日志分析系统

**要求**：高吞吐，可容忍少量丢失

```bash
PUT /logs
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1,
    "index.write.wait_for_active_shards": "1",
    "index.translog.durability": "async",
    "index.translog.sync_interval": "30s",
    "refresh_interval": "30s"
  }
}

# 批量写入
POST /_bulk
{ "index": { "_index": "logs" } }
{ "message": "log entry 1" }
{ "index": { "_index": "logs" } }
{ "message": "log entry 2" }
```

### 电商商品系统

**要求**：平衡性能和一致性

```bash
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "index.write.wait_for_active_shards": "2",
    "index.translog.durability": "request",
    "refresh_interval": "1s"
  }
}

# 写入（等待主分片 + 1个副本）
PUT /products/_doc/1
{
  "name": "iPhone 14",
  "price": 7999
}

# 查询（默认轮询）
GET /products/_search
{
  "query": { "match": { "name": "iPhone" } }
}
```

## 监控一致性

### 关键指标

```bash
# 索引统计
GET /products/_stats

{
  "indices": {
    "products": {
      "primaries": {
        "docs": {
          "count": 10000,
          "deleted": 100
        }
      },
      "total": {
        "docs": {
          "count": 20000,  # 主分片 + 副本
          "deleted": 200
        }
      }
    }
  }
}

# 检查一致性
主分片文档数 = 10000
副本分片文档数 = 20000 / 2 = 10000
一致性：✓
```

### 分片级别检查

```bash
GET /_cat/shards/products?v

index    shard prirep state   docs  store
products 0     p      STARTED 3000  10mb
products 0     r      STARTED 3000  10mb  # 一致
products 1     p      STARTED 3500  12mb
products 1     r      STARTED 3480  12mb  # 略有差异（正常）
```

**差异原因**：

```
1. Refresh 未完成
2. Merge 进行中
3. 删除文档未合并
```

## 最佳实践

### 1. 根据业务选择一致性级别

```
金融/订单：
  - wait_for_active_shards=all
  - translog.durability=request
  - preference=_primary

日志/监控：
  - wait_for_active_shards=1
  - translog.durability=async
  - 默认读取

一般应用：
  - wait_for_active_shards=2
  - translog.durability=request
  - 默认读取
```

### 2. 理解一致性权衡

```
强一致性：
  ✓ 数据安全
  ✗ 性能低
  ✗ 可用性低

最终一致性：
  ✓ 性能高
  ✓ 可用性高
  ✗ 可能读到旧数据
```

### 3. 使用 Get API 实现强一致性

```bash
# ✓ Get API 实时读取
GET /products/_doc/1

# ✗ Search API 可能读到旧数据
GET /products/_search
{
  "query": {
    "term": { "_id": "1" }
  }
}
```

### 4. 监控副本同步状态

```bash
# 检查未分配分片
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason

# 告警：unassigned_shards > 0
```

## 总结

**一致性模型**：
- ES 选择 AP（可用性 + 分区容错性）
- 默认：最终一致性
- 可配置：准强一致性

**一致性级别**：
- **写入**：wait_for_active_shards（1、2、all）
- **读取**：preference（任意、_primary）
- **Refresh**：refresh 参数

**副本同步**：
- 同步复制模型
- Translog 保证数据不丢失
- 副本故障自动恢复

**场景配置**：
- **金融系统**：强一致性（all + request + _primary）
- **日志系统**：弱一致性（1 + async）
- **一般应用**：平衡（2 + request）

**最佳实践**：
- 根据业务选择一致性级别
- 理解性能与一致性的权衡
- 使用 Get API 实现强一致性
- 监控副本同步状态

**下一步**：学习跨集群搜索与集群间通信，实现多集群数据查询。

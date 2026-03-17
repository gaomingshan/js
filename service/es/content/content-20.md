# 分布式读写流程详解

## 概述

深入理解 Elasticsearch 在分布式环境下的读写协调机制，包括路由、副本同步、一致性保证等，是优化性能和保障数据安全的关键。

## 写请求流程

### 完整写入流程

```
客户端
  ↓ 1. 发送写入请求 PUT /index/_doc/1
协调节点（任意节点）
  ↓ 2. 计算路由：shard = hash(_id) % num_primary_shards
  ↓ 3. 确定主分片所在节点
  ↓ 4. 转发请求到主分片节点
主分片节点
  ↓ 5. 验证请求（版本号、mapping）
  ↓ 6. 写入主分片（内存缓冲 + Translog）
  ↓ 7. 并发复制到所有副本分片
副本分片节点（并发）
  ↓ 8. 写入副本分片（内存缓冲 + Translog）
  ↓ 9. 返回确认给主分片
主分片节点
  ↓ 10. 等待副本确认（根据 wait_for_active_shards）
  ↓ 11. 返回成功响应给协调节点
协调节点
  ↓ 12. 返回响应给客户端
```

### 路由计算

```java
// 路由算法
shard_num = hash(_routing) % number_of_primary_shards

// 默认使用文档 ID
_routing = _id

// 自定义路由
PUT /orders/_doc/order_123?routing=user_456
```

**路由字段选择**：
- 默认：文档 `_id`
- 自定义：`routing` 参数

### 主副本同步模型

**同步复制（Synchronous Replication）**：

```
主分片写入成功后，同步复制到副本分片
  ↓
等待副本确认
  ↓
返回成功响应
```

**特点**：
- 保证数据一致性
- 写入延迟略高
- 副本故障影响写入性能

### wait_for_active_shards 参数

**控制写入一致性级别**：

```bash
# 默认：仅主分片成功
PUT /products/_doc/1
{
  "name": "iPhone"
}

# 等待主分片 + 1个副本
PUT /products/_doc/1?wait_for_active_shards=2
{
  "name": "iPhone"
}

# 等待所有分片（主 + 所有副本）
PUT /products/_doc/1?wait_for_active_shards=all
{
  "name": "iPhone"
}

# 索引级别设置
PUT /products/_settings
{
  "index.write.wait_for_active_shards": "2"
}
```

**参数值**：
- **1**（默认）：仅主分片成功
- **2**：主分片 + 1个副本
- **all**：主分片 + 所有副本
- **quorum**（已废弃）：多数分片

### 写入超时

```bash
# 设置超时时间
PUT /products/_doc/1?timeout=30s
{
  "name": "iPhone"
}
```

**超时行为**：
- 主分片写入成功，但副本同步超时 → 返回超时错误
- 后台副本同步继续进行
- 不会回滚主分片的写入

## 读请求流程

### Get API 流程

```
客户端
  ↓ 1. GET /index/_doc/1
协调节点
  ↓ 2. 计算路由：确定分片
  ↓ 3. 选择分片（主或副本）
  ↓ 4. 转发到目标节点
目标分片节点
  ↓ 5. 从内存/Translog/Segment 读取
  ↓ 6. 返回文档
协调节点
  ↓ 7. 返回给客户端
```

**实时性**：Get API 实时读取（从 Translog 读取最新数据）

### Search API 流程

**Query Then Fetch**（详见第16章）：

```
1. 查询阶段：查询所有分片
2. 协调节点合并排序
3. 取回阶段：获取完整文档
```

### 分片选择策略

**轮询（Round Robin）**：

```
请求1 → 主分片
请求2 → 副本分片1
请求3 → 副本分片2
请求4 → 主分片
...
```

**Adaptive Replica Selection（自适应副本选择）**：

```
考虑因素：
  - 节点响应时间
  - 队列长度
  - 网络延迟

选择最优分片执行查询
```

**启用自适应选择**：

```bash
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.use_adaptive_replica_selection": true
  }
}
```

## 一致性保证

### 写入一致性

**默认行为**（`wait_for_active_shards=1`）：

```
主分片写入成功即返回
  ↓
副本异步同步

风险：主分片故障可能丢失未同步数据
```

**强一致性**（`wait_for_active_shards=all`）：

```
主分片 + 所有副本写入成功
  ↓
数据完全冗余

优点：数据安全
缺点：写入延迟高，可用性降低
```

### 读一致性

**默认行为**：

```
读取任意分片（主或副本）
  ↓
可能读到旧数据（Refresh 前）
```

**preference 参数**：

```bash
# 仅读取主分片（强一致性）
GET /products/_search?preference=_primary
{
  "query": { "match_all": {} }
}

# 自定义偏好（相同偏好路由到相同分片）
GET /products/_search?preference=user_123
{
  "query": { "match_all": {} }
}
```

### 版本控制

**乐观并发控制**（见第21章）：

```bash
# 基于版本号更新
PUT /products/_doc/1?if_seq_no=5&if_primary_term=1
{
  "name": "iPhone 14"
}
```

## 分片分配与路由

### 分片分配决策

**分片分配器（Shard Allocator）**：

```
决策因素：
  1. 过滤（Filtering）：检查分配规则
  2. 平衡（Balancing）：均衡分片分布
  3. 磁盘空间：检查磁盘水位
  4. 同分片约束：主副本不在同一节点
```

### 分片分配配置

```bash
PUT /_cluster/settings
{
  "persistent": {
    # 并发恢复数量
    "cluster.routing.allocation.node_concurrent_recoveries": 2,
    
    # 并发再平衡数量
    "cluster.routing.allocation.cluster_concurrent_rebalance": 2,
    
    # 启用/禁用分片分配
    "cluster.routing.allocation.enable": "all",
    
    # 磁盘水位
    "cluster.routing.allocation.disk.watermark.low": "85%",
    "cluster.routing.allocation.disk.watermark.high": "90%",
    "cluster.routing.allocation.disk.watermark.flood_stage": "95%"
  }
}
```

### 分片路由约束

**主副本分离**：

```
规则：副本分片不与对应的主分片在同一节点

示例：
  节点1：主分片0
  节点2：副本分片0 ✓
  节点1：副本分片0 ✗（不允许）
```

**感知分配（Shard Allocation Awareness）**：

```yaml
# elasticsearch.yml
cluster.routing.allocation.awareness.attributes: zone
node.attr.zone: zone1

PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.awareness.attributes": "zone"
  }
}
```

**效果**：

```
zone1：
  - 主分片0
  - 副本分片1

zone2：
  - 副本分片0
  - 主分片1

保证副本分片与主分片不在同一可用区
```

## 网络分区与脑裂

### 脑裂问题

**场景**：

```
原始集群（3个 Master-eligible 节点）：
  节点1（Master）
  节点2
  节点3

网络分区：
  子集群A：节点1（Master）
  子集群B：节点2、节点3（选举新 Master）

问题：
  - 两个 Master 同时存在
  - 分别处理写入请求
  - 数据不一致
```

### Quorum 机制

**最小主节点数**：

```
Quorum = (master_eligible_nodes / 2) + 1

5个节点：Quorum = (5 / 2) + 1 = 3

网络分区：
  子集群A（2个节点）：< Quorum，无法选举
  子集群B（3个节点）：>= Quorum，可以选举

结果：只有子集群B有 Master，避免脑裂
```

**ES 7.0+ 自动处理**：

```
不再需要手动配置 minimum_master_nodes
自动计算 Quorum
```

### 选主流程

**Bully 算法**：

```
1. 节点启动，加入集群
2. 检测当前是否有活跃 Master
3. 如果无 Master，发起选举
4. Master-eligible 节点投票
5. 获得多数票（Quorum）的节点当选
6. 广播自己为 Master
```

**选举时间**：通常 < 1 秒

## 跨集群搜索（Cross-Cluster Search）

### 配置远程集群

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.remote.cluster_two.seeds": [
      "192.168.1.201:9300",
      "192.168.1.202:9300"
    ]
  }
}
```

### 跨集群查询

```bash
GET /cluster_two:products/_search
{
  "query": {
    "match": { "name": "phone" }
  }
}

# 查询多个集群
GET /products,cluster_two:products/_search
{
  "query": {
    "match": { "name": "phone" }
  }
}
```

### 跨集群复制（CCR）

```bash
PUT /_ccr/auto_follow/remote_cluster_pattern
{
  "remote_cluster": "cluster_two",
  "leader_index_patterns": ["logs-*"],
  "follow_index_pattern": "{{leader_index}}_copy"
}
```

## 性能优化

### 写入优化

```bash
# 1. 批量写入
POST /_bulk
{ "index": { "_index": "products", "_id": "1" } }
{ "name": "iPhone" }
{ "index": { "_index": "products", "_id": "2" } }
{ "name": "iPad" }

# 2. 降低一致性级别（非关键数据）
PUT /logs/_doc/1?wait_for_active_shards=1
{
  "message": "log entry"
}

# 3. 增加刷新间隔
PUT /logs/_settings
{
  "refresh_interval": "30s"
}
```

### 读取优化

```bash
# 1. 使用 filter 缓存
{
  "query": {
    "bool": {
      "must": [ { "match": { "title": "elasticsearch" } } ],
      "filter": [ { "term": { "status": "published" } } ]
    }
  }
}

# 2. 自适应副本选择
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.use_adaptive_replica_selection": true
  }
}

# 3. 限制返回字段
{
  "query": { "match_all": {} },
  "_source": ["name", "price"]
}
```

## 故障场景处理

### 主分片故障

```
1. 主分片所在节点宕机
2. Master 检测到故障
3. 提升副本分片为新的主分片
4. 集群恢复正常
5. 新节点加入后，创建新的副本分片
```

### 网络抖动

```
短暂的网络中断：
  - 节点暂时不可达
  - Master 延迟判定故障（delayed_timeout）
  - 网络恢复，节点重新加入
  - 无需分片迁移
```

### 数据节点扩容

```
1. 新节点加入集群
2. Master 分配分片到新节点
3. 分片数据从源节点复制
4. 分片激活
5. 集群再平衡完成
```

## 监控分布式状态

### 集群状态 API

```bash
GET /_cluster/state

# 响应包含：
# - 集群 UUID
# - Master 节点
# - 节点列表
# - 路由表
# - 元数据
```

### 分片分配解释

```bash
GET /_cluster/allocation/explain
{
  "index": "products",
  "shard": 0,
  "primary": true
}

# 解释分片为何未分配或分配到特定节点
```

### 监控指标

```bash
# 待处理任务
GET /_cat/pending_tasks?v

# 集群统计
GET /_cluster/stats

# 节点统计
GET /_nodes/stats
```

## 总结

**写请求流程**：
1. 协调节点路由到主分片
2. 主分片写入并同步副本
3. 等待确认（wait_for_active_shards）
4. 返回响应

**读请求流程**：
- **Get API**：实时读取（Translog）
- **Search API**：Query Then Fetch

**一致性保证**：
- **写入**：wait_for_active_shards 控制
- **读取**：preference 控制分片选择
- **并发**：版本号乐观锁

**分片分配**：
- 主副本分离
- 感知分配（跨可用区）
- 磁盘水位控制

**脑裂防护**：
- Quorum 机制
- 自动计算（ES 7.0+）

**性能优化**：
- 批量写入
- 调整一致性级别
- 使用 filter 缓存
- 自适应副本选择

**下一步**：学习版本控制与并发控制，处理并发更新场景。

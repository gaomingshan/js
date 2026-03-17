# 容量规划与扩容

本章内容已在第27章"硬件选型与容量规划"中详细介绍。本章补充实战中的容量评估方法和扩容最佳实践。

## 数据量评估方法

### 实际测量法

```bash
# 1. 采集样本数据
# 索引 10000 条实际数据

# 2. 查看索引大小
GET /_cat/indices/sample?v&h=index,docs.count,store.size

# 输出示例
index   docs.count store.size
sample  10000      50mb

# 3. 计算膨胀系数
膨胀系数 = 索引大小 / 原始数据大小
        = 50MB / 30MB
        = 1.67

# 4. 预估总容量
总文档数 = 1亿
单文档大小 = 3KB
原始数据 = 100,000,000 × 3KB = 300GB
索引存储 = 300GB × 1.67 = 500GB
总存储 = 500GB × (1 + 副本数)
```

### 压力测试法

```bash
# 使用 esrally 压测
esrally race \
  --distribution-version=7.17.9 \
  --track=http_logs \
  --target-throughput=10000 \
  --pipeline=benchmark-only

# 观察指标
- 索引速率（docs/s）
- 查询延迟（P50、P95、P99）
- CPU/内存使用率
- 磁盘 I/O
```

## 性能需求分析

### QPS 容量计算

```
需求：
  - 查询 QPS：10000
  - 平均响应时间：100ms

单节点能力：
  - 简单查询：500 QPS
  - 复杂查询：200 QPS

节点数量 = QPS需求 / 单节点QPS
        = 10000 / 300（取中间值）
        = 34 节点（最少）

推荐配置：
  - 40-50 个 Data 节点
  - 考虑高峰、冗余、扩展
```

### TPS 容量计算

```
需求：
  - 写入 TPS：20000 docs/s
  - 单文档大小：2KB

单节点能力：
  - 中等文档：5000-8000 docs/s

节点数量 = TPS需求 / 单节点TPS
        = 20000 / 6000
        = 4 节点（最少）

推荐配置：
  - 6-8 个 Data 节点
  - 考虑副本、高峰
```

## 集群规模计算

### 完整示例

```
业务需求：
  - 数据量：10TB（含副本）
  - 查询 QPS：5000
  - 写入 TPS：10000 docs/s
  - 文档数：50亿

计算过程：

1. 存储容量：
   单节点容量：2TB
   节点数 = 10TB / 2TB = 5（最少）

2. 查询性能：
   单节点 QPS：300
   节点数 = 5000 / 300 = 17（最少）

3. 写入性能：
   单节点 TPS：6000
   节点数 = 10000 / 6000 = 2（最少）

4. 分片数量：
   总数据：10TB
   单分片：30GB
   主分片数 = 10000GB / 30GB = 334

   每节点分片数：1000
   总分片数 = 334 × 2（副本）= 668
   节点数 = 668 / 1000 = 1（最少）

综合评估：
  - 最少节点：17（由查询性能决定）
  - 推荐配置：20-25 个 Data 节点
  - 主分片数：334（或调整为 300-350）
  - 副本数：1
```

## 分片数量规划

### 分片规划原则

```
1. 单分片大小：20-50GB（理想 30GB）
2. 单节点分片数：< 1000
3. 分片总数：集群节点数 × 20

示例：
  数据量：3TB
  单分片：30GB
  主分片数 = 3000GB / 30GB = 100

  副本数：1
  总分片数 = 100 × 2 = 200
  
  节点数 = 200 / 20 = 10
  推荐：12-15 个节点
```

### 动态调整

```bash
# 1. 创建时预留空间
PUT /products
{
  "settings": {
    "number_of_shards": 10,
    "number_of_replicas": 1
  }
}

# 2. 后期增加副本
PUT /products/_settings
{
  "number_of_replicas": 2
}

# 3. 无法修改主分片（需 Reindex）
# 创建新索引
PUT /products_v2
{
  "settings": {
    "number_of_shards": 20
  }
}

# Reindex
POST /_reindex
{
  "source": {"index": "products"},
  "dest": {"index": "products_v2"}
}
```

## 水平扩容方案

### 扩容步骤

```
1. 准备新节点
   - 相同版本的 ES
   - 相同配置（cluster.name）
   - 足够的硬件资源

2. 加入集群
   - 启动新节点
   - 自动发现并加入

3. 分片再平衡
   - ES 自动迁移分片
   - 平衡各节点负载

4. 验证
   - 检查集群健康
   - 验证分片分布
   - 监控性能指标
```

### 控制再平衡

```bash
# 暂停分片分配
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "none"
  }
}

# 添加节点后启用
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "all"
  }
}

# 限制并发迁移
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.cluster_concurrent_rebalance": 2,
    "cluster.routing.allocation.node_concurrent_recoveries": 2
  }
}
```

## 数据迁移策略

### 滚动重启

```bash
# 1. 禁用分片分配
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}

# 2. 停止节点
systemctl stop elasticsearch

# 3. 升级/维护

# 4. 启动节点
systemctl start elasticsearch

# 5. 等待节点加入
# 重复 2-4 直到所有节点完成

# 6. 启用分片分配
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "all"
  }
}
```

### 蓝绿部署

```
1. 创建新集群（绿）
2. 配置 CCR 同步数据
3. 验证数据一致性
4. 切换应用流量
5. 保留旧集群一段时间
6. 下线旧集群（蓝）
```

## 成本优化建议

### 冷热分离

```
成本对比：

全 SSD 方案：
  - 10TB 数据
  - SSD 成本：$300/TB
  - 总成本：$3000

冷热分离方案：
  - Hot（2TB SSD）：$600
  - Warm（3TB SATA）：$450
  - Cold（5TB HDD）：$250
  - 总成本：$1300
  - 节省：57%
```

### 压缩优化

```bash
# 使用最佳压缩
PUT /archive_logs
{
  "settings": {
    "codec": "best_compression"
  }
}

# 节省 30%-50% 存储
```

### 按需扩容

```
阶段性扩容：
  - 初期：10 节点
  - 3 个月：15 节点
  - 6 个月：20 节点
  - 1 年：30 节点

优势：
  - 降低初期投入
  - 根据实际需求调整
  - 避免资源浪费
```

## 监控与告警

### 容量告警

```yaml
# 磁盘使用率告警
name: Disk Usage Alert
type: metric threshold

filter:
  - range:
      node.disk.percent: 
        gte: 80

alert:
  - email
  - slack
```

### 性能告警

```yaml
# 查询延迟告警
name: Query Latency Alert
type: metric threshold

metric: search.query_time_in_millis
threshold: 1000
timeframe: 5m

alert:
  - pagerduty
```

## 总结

**数据量评估**：
- 实际测量法
- 压力测试法
- 膨胀系数计算

**性能分析**：
- QPS 容量
- TPS 容量
- 综合评估

**集群规模**：
- 存储容量
- 性能需求
- 分片规划

**扩容方案**：
- 水平扩容
- 控制再平衡
- 验证监控

**数据迁移**：
- 滚动重启
- 蓝绿部署
- 数据同步

**成本优化**：
- 冷热分离
- 压缩存储
- 按需扩容

详细硬件选型请参考第27章。

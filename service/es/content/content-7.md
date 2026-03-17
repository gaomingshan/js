# 集群管理与监控

## 概述

集群日常运维包括健康状态监控、节点管理、分片分配、集群设置调整等操作。掌握集群管理技能是保障 Elasticsearch 稳定运行的关键。

## 集群健康状态

### 健康状态等级

```bash
GET /_cluster/health

{
  "cluster_name": "production-cluster",
  "status": "green",
  "timed_out": false,
  "number_of_nodes": 5,
  "number_of_data_nodes": 3,
  "active_primary_shards": 50,
  "active_shards": 100,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 0,
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks": 0,
  "number_of_in_flight_fetch": 0,
  "task_max_waiting_in_queue_millis": 0,
  "active_shards_percent_as_number": 100.0
}
```

**状态字段说明**：

| 字段 | 说明 |
|------|------|
| **status** | 集群健康状态：green、yellow、red |
| **number_of_nodes** | 集群节点总数 |
| **number_of_data_nodes** | 数据节点数量 |
| **active_primary_shards** | 活跃的主分片数 |
| **active_shards** | 活跃的总分片数（主+副本） |
| **relocating_shards** | 正在迁移的分片数 |
| **initializing_shards** | 正在初始化的分片数 |
| **unassigned_shards** | 未分配的分片数 |

### 索引级别健康状态

```bash
# 查看特定索引的健康状态
GET /_cluster/health/products?level=shards

{
  "cluster_name": "production-cluster",
  "status": "green",
  "indices": {
    "products": {
      "status": "green",
      "number_of_shards": 5,
      "number_of_replicas": 1,
      "active_primary_shards": 5,
      "active_shards": 10,
      "relocating_shards": 0,
      "initializing_shards": 0,
      "unassigned_shards": 0
    }
  }
}
```

**level 参数**：
- **cluster**（默认）：集群级别
- **indices**：索引级别
- **shards**：分片级别

### 健康状态诊断

**Green → Yellow 原因**：

```
常见原因：
1. 副本分片未分配（节点不足）
2. 节点故障导致副本丢失
3. 新创建索引，副本尚未分配

检查命令：
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason
```

**Yellow → Red 原因**：

```
常见原因：
1. 主分片丢失（节点故障）
2. 磁盘空间不足，分片无法分配
3. 分片损坏

检查命令：
GET /_cluster/allocation/explain
```

## 节点管理

### 查看节点信息

```bash
# 节点列表（简洁）
GET /_cat/nodes?v

ip             heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
192.168.1.101           25          60   5    0.50    0.40     0.30 dim       *      node-1
192.168.1.102           30          55   3    0.30    0.25     0.20 dim       -      node-2
192.168.1.103           28          58   4    0.35    0.30     0.25 dim       -      node-3
```

**字段说明**：
- **heap.percent**：JVM 堆内存使用率
- **ram.percent**：系统内存使用率
- **cpu**：CPU 使用率
- **load_1m/5m/15m**：系统负载
- **node.role**：节点角色（d=data, i=ingest, m=master）
- **master**：`*` 表示当前活跃的 Master

### 节点详细信息

```bash
# 所有节点详细信息
GET /_nodes

# 指定节点
GET /_nodes/node-1,node-2

# 节点统计信息
GET /_nodes/stats

# 特定指标
GET /_nodes/stats/jvm,os,process
```

### 添加节点

**步骤**：

1. 在新服务器安装 Elasticsearch
2. 配置相同的 `cluster.name`
3. 配置 `discovery.seed_hosts` 指向现有节点
4. 启动节点

```yaml
# 新节点配置
cluster.name: production-cluster
node.name: node-4
node.roles: [ data ]

discovery.seed_hosts: ["192.168.1.101", "192.168.1.102", "192.168.1.103"]
```

5. 启动后，新节点自动加入集群
6. 分片自动再平衡到新节点

### 移除节点

**优雅移除步骤**：

1. **排空节点**（将分片迁移到其他节点）

```bash
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.exclude._name": "node-4"
  }
}
```

2. **等待分片迁移完成**

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,node | grep node-4
# 确认 node-4 上没有分片
```

3. **停止节点**

```bash
# 在 node-4 上执行
kill $(cat pid)
```

4. **清除排除规则**

```bash
PUT /_cluster/settings
{
  "transient": {
    "cluster.routing.allocation.exclude._name": null
  }
}
```

### 重启节点

**滚动重启**（避免服务中断）：

```bash
# 1. 禁用分片分配（避免重启期间重新平衡）
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}

# 2. 停止节点
kill $(cat pid)

# 3. 执行维护操作（如升级、配置修改）

# 4. 启动节点
./bin/elasticsearch -d

# 5. 等待节点恢复
GET /_cat/health

# 6. 重复步骤 2-5 重启其他节点

# 7. 重新启用分片分配
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": null
  }
}
```

## 分片分配策略与再平衡

### 分片分配机制

**分片分配决策过程**：

```
1. 过滤阶段（Filtering）
   - 检查分片分配规则
   - 排除不符合条件的节点

2. 评分阶段（Scoring）
   - 计算每个节点的适合度
   - 考虑磁盘使用率、分片数量等

3. 分配阶段（Allocation）
   - 选择得分最高的节点
   - 分配分片
```

### 分片分配设置

```bash
PUT /_cluster/settings
{
  "persistent": {
    # 并发恢复数量（默认 2）
    "cluster.routing.allocation.node_concurrent_recoveries": 4,
    
    # 并发再平衡数量（默认 2）
    "cluster.routing.allocation.cluster_concurrent_rebalance": 2,
    
    # 启用/禁用分片分配
    "cluster.routing.allocation.enable": "all",
    
    # 启用/禁用再平衡
    "cluster.routing.rebalance.enable": "all"
  }
}
```

**allocation.enable 选项**：
- **all**（默认）：允许所有分片分配
- **primaries**：仅允许主分片分配
- **new_primaries**：仅允许新索引的主分片分配
- **none**：禁用所有分片分配

**rebalance.enable 选项**：
- **all**（默认）：允许所有分片再平衡
- **primaries**：仅允许主分片再平衡
- **replicas**：仅允许副本分片再平衡
- **none**：禁用再平衡

### 分片分配过滤

**基于节点属性过滤**：

```yaml
# 节点配置
node.attr.size: large
node.attr.rack: rack1
```

```bash
# 索引级别过滤
PUT /logs-2024.01/_settings
{
  "index.routing.allocation.require.size": "large",
  "index.routing.allocation.require.rack": "rack1"
}
```

**过滤规则**：
- **require**：必须匹配
- **include**：至少匹配一个
- **exclude**：不能匹配

### 分片再平衡策略

**平衡策略**：

```bash
PUT /_cluster/settings
{
  "persistent": {
    # 分片数量平衡权重
    "cluster.routing.allocation.balance.shard": 0.45,
    
    # 索引分片数量平衡权重
    "cluster.routing.allocation.balance.index": 0.55,
    
    # 启动再平衡的阈值
    "cluster.routing.allocation.balance.threshold": 1.0
  }
}
```

**查看分片分配解释**：

```bash
GET /_cluster/allocation/explain
{
  "index": "products",
  "shard": 0,
  "primary": true
}

# 响应：为什么分片分配到当前节点，或为什么未分配
```

### 磁盘水位控制

```bash
PUT /_cluster/settings
{
  "persistent": {
    # 低水位：85% 时禁止分配新分片到该节点
    "cluster.routing.allocation.disk.watermark.low": "85%",
    
    # 高水位：90% 时尝试迁移分片离开该节点
    "cluster.routing.allocation.disk.watermark.high": "90%",
    
    # 洪水水位：95% 时索引变为只读
    "cluster.routing.allocation.disk.watermark.flood_stage": "95%"
  }
}
```

**磁盘空间不足时的表现**：

```
低水位触发：
  - 不再分配新分片到该节点
  - 现有分片继续工作

高水位触发：
  - 尝试将分片迁移到其他节点
  
洪水水位触发：
  - 索引变为只读（index.blocks.read_only_allow_delete=true）
  - 需手动解除只读限制
```

**解除只读限制**：

```bash
PUT /my-index/_settings
{
  "index.blocks.read_only_allow_delete": null
}
```

## 集群设置（Cluster Settings）

### 设置类型

**持久化设置（Persistent）**：
- 集群重启后仍然有效
- 存储在 Cluster State 中

**临时设置（Transient）**：
- 集群重启后失效
- 用于临时调整

**优先级**：
```
Transient > Persistent > elasticsearch.yml
```

### 常用集群设置

```bash
GET /_cluster/settings?include_defaults=true

PUT /_cluster/settings
{
  "persistent": {
    # 分片分配设置
    "cluster.routing.allocation.enable": "all",
    "cluster.routing.allocation.node_concurrent_recoveries": 2,
    
    # 慢查询阈值
    "search.default_search_timeout": "30s",
    
    # 最大分片数限制
    "cluster.max_shards_per_node": 1000,
    
    # 自动创建索引
    "action.auto_create_index": "true"
  },
  "transient": {
    # 临时禁用再平衡（维护期间）
    "cluster.routing.rebalance.enable": "none"
  }
}
```

### 重置设置

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": null  # 重置为默认值
  }
}
```

## 集群监控工具

### 1. Kibana Monitoring

**启用 X-Pack Monitoring**（免费功能）：

```yaml
# elasticsearch.yml
xpack.monitoring.collection.enabled: true
```

**访问**：Kibana → Stack Monitoring

**监控指标**：
- 集群健康状态
- 节点 CPU、内存、磁盘使用率
- 索引和查询速率
- JVM 堆内存使用
- 分片分布

### 2. Cerebro

**开源集群管理工具**，提供 Web UI。

**功能**：
- 集群健康状态可视化
- 索引管理
- 节点信息
- 分片分配查看
- REST API 调用

**安装**：

```bash
# 下载
wget https://github.com/lmenezes/cerebro/releases/download/v0.9.4/cerebro-0.9.4.tgz

# 解压
tar -xzf cerebro-0.9.4.tgz
cd cerebro-0.9.4

# 启动
./bin/cerebro

# 访问：http://localhost:9000
```

### 3. ElasticHQ

**功能类似 Cerebro**，界面更现代。

**安装**：

```bash
docker run -p 5000:5000 elastichq/elasticsearch-hq
```

### 4. Cat APIs（轻量级监控）

**常用 Cat APIs**：

```bash
# 节点信息
GET /_cat/nodes?v

# 索引列表
GET /_cat/indices?v&s=index

# 分片分布
GET /_cat/shards?v

# 分片分配
GET /_cat/allocation?v

# 线程池
GET /_cat/thread_pool?v

# 主节点
GET /_cat/master?v

# 任务
GET /_cat/tasks?v

# 插件
GET /_cat/plugins?v

# 健康状态
GET /_cat/health?v
```

**格式化输出**：

```bash
# 表格格式（默认）
GET /_cat/nodes?v

# JSON 格式
GET /_cat/nodes?format=json

# 自定义列
GET /_cat/nodes?v&h=name,heap.percent,ram.percent,cpu,load_1m
```

### 5. Prometheus + Grafana

**使用 Elasticsearch Exporter 导出指标到 Prometheus**。

**安装 Exporter**：

```bash
docker run -d \
  -p 9114:9114 \
  quay.io/prometheuscommunity/elasticsearch-exporter:latest \
  --es.uri=http://192.168.1.101:9200
```

**Prometheus 配置**：

```yaml
scrape_configs:
  - job_name: 'elasticsearch'
    static_configs:
      - targets: ['localhost:9114']
```

**Grafana Dashboard**：导入社区 Dashboard（ID: 2322）

## 集群备份与恢复策略

### 快照（Snapshot）

**配置快照仓库**：

```bash
# 文件系统仓库
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mount/backups/elasticsearch"
  }
}

# S3 仓库
PUT /_snapshot/s3_backup
{
  "type": "s3",
  "settings": {
    "bucket": "my-es-backups",
    "region": "us-east-1"
  }
}
```

**创建快照**：

```bash
# 备份所有索引
PUT /_snapshot/my_backup/snapshot_1?wait_for_completion=true

# 备份指定索引
PUT /_snapshot/my_backup/snapshot_2
{
  "indices": "products,orders",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

**查看快照**：

```bash
GET /_snapshot/my_backup/_all

GET /_snapshot/my_backup/snapshot_1
```

**恢复快照**：

```bash
# 恢复所有索引
POST /_snapshot/my_backup/snapshot_1/_restore

# 恢复指定索引
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "products",
  "ignore_unavailable": true,
  "include_global_state": false,
  "rename_pattern": "(.+)",
  "rename_replacement": "restored_$1"
}
```

**删除快照**：

```bash
DELETE /_snapshot/my_backup/snapshot_1
```

### 备份策略建议

**备份频率**：
- 关键数据：每小时或每 4 小时
- 一般数据：每天
- 归档数据：每周或每月

**保留策略**：
- 最近 7 天：保留所有快照
- 最近 30 天：每天保留一个快照
- 最近 1 年：每月保留一个快照

**自动化备份**：

```bash
# 使用 Cron 定时任务
0 2 * * * curl -X PUT "localhost:9200/_snapshot/my_backup/snapshot_$(date +\%Y\%m\%d)?wait_for_completion=true"
```

## 常见运维操作

### 1. 清理旧数据

```bash
# 删除7天前的日志索引
DELETE /logs-2024.01.01,logs-2024.01.02

# 使用 Curator 自动清理
curator --config config.yml delete_old_indices.yml
```

### 2. 索引重建

```bash
# 创建新索引
PUT /products_v2
{
  "mappings": { ... }
}

# 重建索引
POST /_reindex
{
  "source": {
    "index": "products"
  },
  "dest": {
    "index": "products_v2"
  }
}

# 切换别名
POST /_aliases
{
  "actions": [
    { "remove": { "index": "products", "alias": "products_current" } },
    { "add": { "index": "products_v2", "alias": "products_current" } }
  ]
}
```

### 3. 强制合并段

```bash
# 强制合并段（减少段数量，优化查询）
POST /products/_forcemerge?max_num_segments=1

# 仅合并已删除文档比例高的段
POST /products/_forcemerge?only_expunge_deletes=true
```

**注意**：
- 仅对不再写入的索引执行
- 消耗大量 I/O 资源
- 建议在低峰期执行

### 4. 清理缓存

```bash
# 清理所有缓存
POST /_cache/clear

# 清理特定缓存
POST /products/_cache/clear?query=true
POST /products/_cache/clear?fielddata=true
POST /products/_cache/clear?request=true
```

### 5. 刷新索引

```bash
# 手动刷新（使最新写入可搜索）
POST /products/_refresh

# 刷新所有索引
POST /_refresh
```

## 监控告警

### 关键指标

**集群级别**：
- 集群健康状态（Green/Yellow/Red）
- 未分配分片数量
- 待处理任务数量

**节点级别**：
- JVM 堆内存使用率（< 75%）
- CPU 使用率（< 80%）
- 磁盘使用率（< 85%）
- 系统负载

**索引级别**：
- 索引速率（docs/s）
- 查询速率（queries/s）
- 查询延迟（ms）
- 拒绝查询数量

### 告警规则示例

```
告警规则：
1. 集群状态 Red 持续 5 分钟 → 紧急告警
2. 集群状态 Yellow 持续 30 分钟 → 警告
3. JVM 堆内存使用率 > 85% 持续 10 分钟 → 警告
4. 磁盘使用率 > 90% → 紧急告警
5. 查询延迟 > 1s（P95）持续 10 分钟 → 警告
6. 索引拒绝率 > 5% → 警告
```

## 总结

**集群健康监控**：
- **Green**：所有分片正常
- **Yellow**：部分副本分片未分配
- **Red**：部分主分片未分配

**节点管理**：
- 添加节点：配置相同集群名，自动加入
- 移除节点：先排空分片，再停止
- 重启节点：使用滚动重启，避免中断

**分片分配**：
- 并发恢复和再平衡控制
- 基于节点属性的过滤规则
- 磁盘水位保护机制

**集群设置**：
- **Persistent**：持久化设置
- **Transient**：临时设置
- 优先级：Transient > Persistent > elasticsearch.yml

**监控工具**：
- Kibana Monitoring：官方监控
- Cerebro/ElasticHQ：第三方 Web UI
- Cat APIs：命令行监控
- Prometheus + Grafana：企业级监控

**备份策略**：
- 配置快照仓库（文件系统、S3）
- 定期创建快照
- 自动化备份和清理

**下一步**：学习文档写入流程，理解数据如何从写入到可搜索的完整过程。

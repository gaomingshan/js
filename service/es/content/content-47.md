# 备份恢复与容灾

本章内容已在第33章"Snapshot 与 Restore APIs"中详细介绍了快照备份的基础知识。本章补充企业级备份恢复策略和高可用架构设计。

## 快照备份策略

### 备份级别

**全量备份**：
- 首次备份所有数据
- 作为基准备份
- 建议频率：每周/每月

**增量备份**：
- 仅备份变化的 Segment
- 节省存储空间
- 建议频率：每天

### 备份策略设计

```
3-2-1 备份原则：
  - 3 份数据副本
  - 2 种不同存储介质
  - 1 份异地备份

示例策略：
  - 每日增量快照（本地 NFS）
  - 每周全量快照（本地 S3）
  - 每月归档快照（异地 S3）
```

## 跨集群复制（CCR）

### CCR 架构

```
主集群（Leader）         从集群（Follower）
┌──────────┐            ┌──────────┐
│ products │ ───CCR───▶ │ products │
│  索引    │            │  (只读)  │
└──────────┘            └──────────┘
```

### 配置 CCR

**1. 配置远程集群**：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster": {
      "remote": {
        "follower_cluster": {
          "seeds": [
            "follower-node1:9300",
            "follower-node2:9300"
          ]
        }
      }
    }
  }
}
```

**2. 创建跟随索引**：

```bash
PUT /products/_ccr/follow
{
  "remote_cluster": "leader_cluster",
  "leader_index": "products"
}
```

**3. 自动跟随模式**：

```bash
PUT /_ccr/auto_follow/my_auto_follow_pattern
{
  "remote_cluster": "leader_cluster",
  "leader_index_patterns": [
    "products-*",
    "orders-*"
  ],
  "follow_index_pattern": "{{leader_index}}"
}
```

### CCR 监控

```bash
GET /products/_ccr/stats
```

## 数据恢复演练

### 恢复流程

```
1. 创建新集群或清理现有集群
2. 配置快照仓库（与备份时相同）
3. 列出可用快照
4. 选择恢复点
5. 执行恢复
6. 验证数据完整性
7. 切换流量
```

### 恢复演练脚本

```bash
#!/bin/bash
# disaster_recovery_drill.sh

# 1. 配置仓库
curl -X PUT "http://localhost:9200/_snapshot/backup_repo" \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "s3",
    "settings": {
      "bucket": "es-backups"
    }
  }'

# 2. 列出快照
SNAPSHOTS=$(curl -s "http://localhost:9200/_snapshot/backup_repo/_all")
echo "Available snapshots: $SNAPSHOTS"

# 3. 选择最新快照
LATEST_SNAPSHOT=$(echo $SNAPSHOTS | jq -r '.snapshots[-1].snapshot')
echo "Restoring from: $LATEST_SNAPSHOT"

# 4. 恢复数据
curl -X POST "http://localhost:9200/_snapshot/backup_repo/$LATEST_SNAPSHOT/_restore" \
  -H 'Content-Type: application/json' \
  -d '{
    "indices": "*",
    "include_global_state": true
  }'

# 5. 等待恢复完成
while true; do
  STATUS=$(curl -s "http://localhost:9200/_cat/recovery?format=json")
  IN_PROGRESS=$(echo $STATUS | jq '[.[] | select(.stage != "done")] | length')
  
  if [ $IN_PROGRESS -eq 0 ]; then
    echo "Recovery completed"
    break
  fi
  
  echo "Recovery in progress..."
  sleep 10
done

# 6. 验证数据
EXPECTED_COUNT=1000000
ACTUAL_COUNT=$(curl -s "http://localhost:9200/products/_count" | jq '.count')

if [ $ACTUAL_COUNT -eq $EXPECTED_COUNT ]; then
  echo "Data verification passed"
else
  echo "Data verification failed: expected $EXPECTED_COUNT, got $ACTUAL_COUNT"
  exit 1
fi
```

## RPO 与 RTO 目标

### RPO（Recovery Point Objective）

```
RPO = 数据恢复点目标（可接受的数据丢失时间）

示例：
  - RPO = 1小时：最多丢失 1 小时数据
  - RPO = 1天：最多丢失 1 天数据

实现方式：
  - RPO = 0：实时同步（CCR）
  - RPO = 1小时：每小时快照
  - RPO = 1天：每天快照
```

### RTO（Recovery Time Objective）

```
RTO = 恢复时间目标（系统恢复所需时间）

示例：
  - RTO = 1小时：1 小时内恢复服务
  - RTO = 4小时：4 小时内恢复服务

影响因素：
  - 数据量大小
  - 网络带宽
  - 集群规模
  - 恢复并发度
```

### 优化 RTO

```bash
# 1. 并行恢复多个索引
POST /_snapshot/backup/snapshot_1/_restore
{
  "indices": "products,orders,users",
  "max_restore_bytes_per_sec": "500mb"
}

# 2. 预先创建索引映射
PUT /products
{
  "mappings": { ... }
}

# 3. 恢复时排除不必要的索引
POST /_snapshot/backup/snapshot_1/_restore
{
  "indices": "products,orders",
  "ignore_unavailable": true
}
```

## 高可用架构设计

### 三数据中心架构

```
数据中心 A（主）       数据中心 B（从）      数据中心 C（从）
┌─────────────┐      ┌─────────────┐     ┌─────────────┐
│ Master × 3  │      │ Master × 0  │     │ Master × 0  │
│ Data × 3    │      │ Data × 3    │     │ Data × 3    │
│ 副本数: 1   │ ───▶ │ 副本数: 0   │     │ 副本数: 0   │
└─────────────┘      └─────────────┘     └─────────────┘
       │                    │                    │
       └────────────────────┴────────────────────┘
                    跨数据中心复制（CCR）
```

### 双活架构

```
集群 A（主）                集群 B（主）
┌─────────────┐            ┌─────────────┐
│ Master × 3  │            │ Master × 3  │
│ Data × 5    │  ◀───CCR──▶│ Data × 5    │
│ 副本数: 1   │            │ 副本数: 1   │
└─────────────┘            └─────────────┘
       │                          │
       └──────────┬───────────────┘
                  ▼
           ┌──────────────┐
           │  负载均衡器   │
           └──────────────┘
```

### 容灾切换流程

```
1. 检测主集群故障
2. 停止写入主集群
3. 提升备集群为主集群
4. 切换应用流量到备集群
5. 验证服务可用性
6. 恢复原主集群（可选）
7. 配置反向 CCR（可选）
```

## 监控告警

### 备份监控

```bash
# 检查快照状态
GET /_snapshot/_status

# 检查 SLM 策略
GET /_slm/policy

# 检查最近快照
GET /_snapshot/backup_repo/_all?sort=start_time&order=desc&size=10
```

### 告警规则

```yaml
# 快照失败告警
name: Snapshot Failed Alert
type: any
index: .slm-history-*

filter:
  - term:
      success: false

alert:
  - email:
      to: "ops@example.com"
      subject: "Elasticsearch Snapshot Failed"
```

## 总结

**备份策略**：
- 全量 + 增量备份
- 3-2-1 原则
- 定期备份

**CCR 复制**：
- 实时同步
- 跨集群复制
- 灾备集群

**恢复演练**：
- 定期演练
- 验证可用性
- 优化 RTO

**RPO/RTO**：
- 明确目标
- 优化实现
- 持续改进

**高可用**：
- 多数据中心
- 双活架构
- 容灾切换

**监控告警**：
- 备份监控
- 恢复监控
- 及时告警

详细快照操作请参考第33章。

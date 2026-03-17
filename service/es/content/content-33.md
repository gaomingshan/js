# Snapshot 与 Restore APIs

## 概述

Snapshot（快照）是 Elasticsearch 数据备份的标准方式，用于灾难恢复和数据迁移。本章介绍快照仓库配置、快照创建、恢复和管理等操作。

## 快照仓库配置

### 文件系统仓库

**配置共享文件系统**：

```yaml
# elasticsearch.yml
path.repo: ["/mnt/backups"]
```

**创建仓库**：

```bash
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mnt/backups/elasticsearch",
    "compress": true,
    "max_snapshot_bytes_per_sec": "50mb",
    "max_restore_bytes_per_sec": "50mb"
  }
}
```

**参数说明**：
- **location**：备份路径（必须在 path.repo 配置的目录下）
- **compress**：是否压缩（默认 true）
- **max_snapshot_bytes_per_sec**：快照速率限制
- **max_restore_bytes_per_sec**：恢复速率限制

### S3 仓库

**安装 S3 插件**：

```bash
./bin/elasticsearch-plugin install repository-s3
```

**配置 S3 凭证**：

```bash
./bin/elasticsearch-keystore add s3.client.default.access_key
./bin/elasticsearch-keystore add s3.client.default.secret_key
```

**创建 S3 仓库**：

```bash
PUT /_snapshot/s3_backup
{
  "type": "s3",
  "settings": {
    "bucket": "my-elasticsearch-backups",
    "region": "us-east-1",
    "base_path": "snapshots",
    "compress": true
  }
}
```

### HDFS 仓库

**安装 HDFS 插件**：

```bash
./bin/elasticsearch-plugin install repository-hdfs
```

**创建 HDFS 仓库**：

```bash
PUT /_snapshot/hdfs_backup
{
  "type": "hdfs",
  "settings": {
    "uri": "hdfs://namenode:8020",
    "path": "/elasticsearch/backups",
    "compress": true
  }
}
```

### 查看仓库

```bash
GET /_snapshot

# 响应
{
  "my_backup": {
    "type": "fs",
    "settings": {
      "location": "/mnt/backups/elasticsearch",
      "compress": "true"
    }
  }
}

# 获取特定仓库
GET /_snapshot/my_backup
```

### 验证仓库

```bash
POST /_snapshot/my_backup/_verify

# 响应
{
  "nodes": {
    "node-1-uuid": {
      "name": "node-1"
    },
    "node-2-uuid": {
      "name": "node-2"
    }
  }
}
```

**作用**：验证所有节点都能访问仓库

### 删除仓库

```bash
DELETE /_snapshot/my_backup
```

**注意**：删除仓库不会删除快照数据

## 创建快照

### 完整快照

```bash
PUT /_snapshot/my_backup/snapshot_1

# 响应
{
  "accepted": true
}
```

**默认行为**：
- 备份所有打开的索引
- 异步执行

### 指定索引

```bash
PUT /_snapshot/my_backup/snapshot_2
{
  "indices": "products,orders",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

**参数说明**：
- **indices**：要备份的索引（支持通配符）
- **ignore_unavailable**：忽略不存在的索引
- **include_global_state**：是否包含集群状态

### 部分快照

```bash
PUT /_snapshot/my_backup/snapshot_3
{
  "indices": "logs-2024-*",
  "partial": true
}
```

**partial**：允许部分分片失败

### 同步快照

```bash
PUT /_snapshot/my_backup/snapshot_4?wait_for_completion=true
{
  "indices": "products"
}

# 等待快照完成后返回
{
  "snapshot": {
    "snapshot": "snapshot_4",
    "uuid": "abc123",
    "state": "SUCCESS",
    "indices": ["products"],
    "start_time": "2024-01-15T10:00:00.000Z",
    "end_time": "2024-01-15T10:05:00.000Z",
    "duration_in_millis": 300000,
    "failures": [],
    "shards": {
      "total": 5,
      "failed": 0,
      "successful": 5
    }
  }
}
```

### 自动快照命名

```bash
# 使用日期格式
PUT /_snapshot/my_backup/<snapshot-{now/d}>
{
  "indices": "logs-*"
}

# 生成名称如：snapshot-2024.01.15
```

## 查询快照

### 查看所有快照

```bash
GET /_snapshot/my_backup/_all

# 响应
{
  "snapshots": [
    {
      "snapshot": "snapshot_1",
      "uuid": "abc123",
      "state": "SUCCESS",
      "start_time": "2024-01-15T10:00:00.000Z",
      "end_time": "2024-01-15T10:10:00.000Z",
      "duration_in_millis": 600000,
      "indices": ["products", "orders"],
      "shards": {
        "total": 10,
        "failed": 0,
        "successful": 10
      }
    }
  ]
}
```

### 查看特定快照

```bash
GET /_snapshot/my_backup/snapshot_1

# 响应
{
  "snapshots": [
    {
      "snapshot": "snapshot_1",
      "uuid": "abc123",
      "state": "SUCCESS",
      "indices": ["products", "orders"],
      "include_global_state": true,
      "start_time": "2024-01-15T10:00:00.000Z",
      "end_time": "2024-01-15T10:10:00.000Z",
      "duration_in_millis": 600000,
      "failures": [],
      "shards": {
        "total": 10,
        "failed": 0,
        "successful": 10
      }
    }
  ]
}
```

### 查看快照状态

```bash
GET /_snapshot/my_backup/snapshot_1/_status

# 响应
{
  "snapshots": [
    {
      "snapshot": "snapshot_1",
      "repository": "my_backup",
      "state": "SUCCESS",
      "shards_stats": {
        "initializing": 0,
        "started": 0,
        "finalizing": 0,
        "done": 10,
        "failed": 0,
        "total": 10
      },
      "stats": {
        "incremental": {
          "file_count": 100,
          "size_in_bytes": 1073741824
        },
        "total": {
          "file_count": 100,
          "size_in_bytes": 1073741824
        },
        "start_time_in_millis": 1704201600000,
        "time_in_millis": 600000
      }
    }
  ]
}
```

**状态类型**：
- **IN_PROGRESS**：进行中
- **SUCCESS**：成功
- **FAILED**：失败
- **PARTIAL**：部分成功

## 恢复快照

### 恢复所有索引

```bash
POST /_snapshot/my_backup/snapshot_1/_restore

# 响应
{
  "accepted": true
}
```

### 恢复指定索引

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "products,orders",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

### 重命名恢复

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "products",
  "rename_pattern": "(.+)",
  "rename_replacement": "restored_$1"
}

# products -> restored_products
```

### 部分恢复

```bash
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "products",
  "partial": true
}
```

### 同步恢复

```bash
POST /_snapshot/my_backup/snapshot_1/_restore?wait_for_completion=true
{
  "indices": "products"
}
```

### 恢复到不同集群

```bash
# 在目标集群配置相同仓库
PUT /_snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mnt/backups/elasticsearch"
  }
}

# 恢复快照
POST /_snapshot/my_backup/snapshot_1/_restore
{
  "indices": "products"
}
```

## 删除快照

### 删除单个快照

```bash
DELETE /_snapshot/my_backup/snapshot_1

# 响应
{
  "acknowledged": true
}
```

### 删除多个快照

```bash
DELETE /_snapshot/my_backup/snapshot_1,snapshot_2
```

**注意**：
- 删除快照会释放存储空间
- 增量快照可能共享数据段
- 删除快照可能需要较长时间

## 增量快照机制

### 增量备份原理

```
第一次快照（全量）：
  - 备份所有数据
  - 大小：10GB

第二次快照（增量）：
  - 仅备份变化的 Segment
  - 新增数据：2GB
  - 快照大小：2GB
  - 总存储：12GB（共享 8GB）

第三次快照（增量）：
  - 仅备份新变化
  - 新增数据：1GB
  - 快照大小：1GB
  - 总存储：13GB
```

### 查看快照大小

```bash
GET /_snapshot/my_backup/snapshot_2/_status

{
  "stats": {
    "incremental": {
      "file_count": 50,
      "size_in_bytes": 2147483648  # 2GB（增量）
    },
    "total": {
      "file_count": 150,
      "size_in_bytes": 10737418240  # 10GB（总计）
    }
  }
}
```

## 实战案例

### 案例1：每日增量备份

```bash
# 1. 配置仓库
PUT /_snapshot/daily_backup
{
  "type": "fs",
  "settings": {
    "location": "/mnt/backups/daily",
    "compress": true
  }
}

# 2. 创建每日快照脚本
#!/bin/bash
DATE=$(date +%Y.%m.%d)

curl -X PUT "http://localhost:9200/_snapshot/daily_backup/snapshot_$DATE" \
  -H 'Content-Type: application/json' \
  -d '{
    "indices": "*",
    "ignore_unavailable": true,
    "include_global_state": true
  }'

# 3. 配置 Cron
# crontab -e
0 2 * * * /opt/scripts/daily_snapshot.sh

# 4. 定期清理旧快照（保留 30 天）
#!/bin/bash
CUTOFF_DATE=$(date -d "30 days ago" +%Y.%m.%d)

curl -X DELETE "http://localhost:9200/_snapshot/daily_backup/snapshot_$CUTOFF_DATE"
```

### 案例2：索引迁移

```bash
# 源集群
# 1. 创建快照
PUT /_snapshot/migration_backup/migrate_snapshot
{
  "indices": "products,orders"
}

# 2. 等待完成
GET /_snapshot/migration_backup/migrate_snapshot/_status

# 目标集群
# 3. 配置相同仓库（共享存储或复制快照）
PUT /_snapshot/migration_backup
{
  "type": "fs",
  "settings": {
    "location": "/mnt/backups/migration"
  }
}

# 4. 恢复数据
POST /_snapshot/migration_backup/migrate_snapshot/_restore
{
  "indices": "products,orders"
}
```

### 案例3：灾难恢复

```bash
# 灾难发生前（定期备份）
# 每天全量快照
PUT /_snapshot/disaster_recovery/snapshot_<{now/d}>
{
  "indices": "*",
  "include_global_state": true
}

# 灾难发生后（恢复）
# 1. 重建集群

# 2. 配置仓库
PUT /_snapshot/disaster_recovery
{
  "type": "s3",
  "settings": {
    "bucket": "disaster-recovery-backups"
  }
}

# 3. 查看可用快照
GET /_snapshot/disaster_recovery/_all

# 4. 恢复最新快照
POST /_snapshot/disaster_recovery/snapshot_2024.01.14/_restore
{
  "indices": "*",
  "include_global_state": true
}

# 5. 验证数据
GET /_cat/indices?v
GET /products/_count
```

### 案例4：定期清理快照

```bash
#!/bin/bash
# cleanup_snapshots.sh

REPO="daily_backup"
KEEP_DAYS=30

# 获取所有快照
SNAPSHOTS=$(curl -s "http://localhost:9200/_snapshot/$REPO/_all" | \
    jq -r '.snapshots[].snapshot')

CUTOFF=$(date -d "$KEEP_DAYS days ago" +%s)

for snapshot in $SNAPSHOTS; do
    # 提取快照日期
    snapshot_date=$(echo $snapshot | sed 's/snapshot_//')
    snapshot_ts=$(date -d "$snapshot_date" +%s 2>/dev/null)
    
    if [ $? -eq 0 ] && [ $snapshot_ts -lt $CUTOFF ]; then
        echo "Deleting $snapshot"
        curl -X DELETE "http://localhost:9200/_snapshot/$REPO/$snapshot"
    fi
done
```

## Snapshot Lifecycle Management (SLM)

### 创建快照策略

```bash
PUT /_slm/policy/daily-snapshots
{
  "schedule": "0 2 * * *",
  "name": "<daily-snap-{now/d}>",
  "repository": "my_backup",
  "config": {
    "indices": ["*"],
    "ignore_unavailable": true,
    "include_global_state": true
  },
  "retention": {
    "expire_after": "30d",
    "min_count": 5,
    "max_count": 50
  }
}
```

**参数说明**：
- **schedule**：Cron 表达式
- **name**：快照名称模板
- **repository**：仓库名
- **config**：快照配置
- **retention**：保留策略

### 查看 SLM 策略

```bash
GET /_slm/policy

# 响应
{
  "daily-snapshots": {
    "version": 1,
    "modified_date": "2024-01-15T10:00:00.000Z",
    "policy": {
      "schedule": "0 2 * * *",
      "name": "<daily-snap-{now/d}>",
      "repository": "my_backup",
      "config": { ... },
      "retention": { ... }
    },
    "next_execution": "2024-01-16T02:00:00.000Z",
    "stats": {
      "snapshots_taken": 30,
      "snapshots_failed": 0,
      "snapshots_deleted": 5
    }
  }
}
```

### 手动执行策略

```bash
POST /_slm/policy/daily-snapshots/_execute
```

### 删除策略

```bash
DELETE /_slm/policy/daily-snapshots
```

## 最佳实践

### 备份策略

```
频率：
  - 生产环境：每天一次
  - 关键系统：每天多次
  - 开发环境：每周一次

保留期限：
  - 每日快照：保留 30 天
  - 每周快照：保留 12 周
  - 每月快照：保留 12 个月

存储位置：
  - 使用远程存储（S3、HDFS）
  - 避免单点故障
  - 异地备份
```

### 性能优化

```
✓ 设置速率限制（避免影响业务）
✓ 在业务低峰期执行
✓ 使用压缩（节省存储空间）
✓ 增量快照（减少备份时间）
✓ 并行恢复多个分片
```

### 监控告警

```
监控指标：
  - 快照成功率
  - 快照耗时
  - 存储空间使用
  - 快照大小趋势

告警规则：
  - 快照失败：立即告警
  - 快照耗时超过阈值：警告
  - 存储空间不足：紧急
```

### 恢复演练

```
定期演练（每季度）：
  1. 选择最新快照
  2. 在测试集群恢复
  3. 验证数据完整性
  4. 测试应用功能
  5. 记录恢复时间

目的：
  - 验证备份可用性
  - 评估恢复时间
  - 熟悉恢复流程
```

## 故障排查

### 快照失败

```bash
# 查看失败原因
GET /_snapshot/my_backup/snapshot_failed

{
  "failures": [
    {
      "index": "products",
      "shard_id": 0,
      "reason": "IndexShardSnapshotFailedException",
      "node_id": "node-1-uuid"
    }
  ]
}

# 常见原因：
# - 磁盘空间不足
# - 权限问题
# - 网络问题（远程仓库）
# - 分片故障
```

### 恢复失败

```bash
# 查看恢复状态
GET /_recovery

# 常见原因：
# - 索引已存在（先删除或重命名）
# - 集群版本不兼容
# - 磁盘空间不足
# - 分片分配失败
```

### 仓库访问问题

```bash
# 验证仓库
POST /_snapshot/my_backup/_verify

# 检查权限
# ls -la /mnt/backups/elasticsearch
# 确保 elasticsearch 用户有读写权限
```

## 总结

**仓库配置**：
- 文件系统仓库：本地/NFS
- S3 仓库：云存储
- HDFS 仓库：大数据平台
- 验证仓库可访问性

**创建快照**：
- 全量 vs 增量
- 指定索引
- 同步 vs 异步
- 自动命名

**恢复快照**：
- 恢复所有/部分索引
- 重命名恢复
- 跨集群恢复
- 等待完成

**SLM 策略**：
- 自动化快照
- 保留策略
- 定期清理

**最佳实践**：
- 每日增量备份
- 异地存储
- 定期演练
- 监控告警

**性能优化**：
- 速率限制
- 低峰期执行
- 压缩存储
- 并行恢复

至此，第八部分"原生 REST API"（第29-33章）已全部完成。

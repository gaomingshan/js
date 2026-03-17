# 集群监控与运维

## 概述

完善的监控体系是保障集群稳定运行的基础。本章介绍关键指标监控、监控工具使用、常见问题诊断和运维自动化实践。

## 关键指标监控

### 集群健康

**集群健康状态**：

```bash
GET /_cluster/health

{
  "cluster_name": "production",
  "status": "green",  # green、yellow、red
  "timed_out": false,
  "number_of_nodes": 5,
  "number_of_data_nodes": 3,
  "active_primary_shards": 50,
  "active_shards": 100,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 0
}
```

**健康状态含义**：

```
Green（绿色）：
  - 所有主分片和副本分片都已分配
  - 集群完全可用

Yellow（黄色）：
  - 所有主分片已分配
  - 部分副本分片未分配
  - 集群可用，但有风险

Red（红色）：
  - 部分主分片未分配
  - 部分数据不可用
  - 集群部分功能不可用
```

**告警规则**：

```
告警级别：
  - Red 状态：紧急告警，立即处理
  - Yellow 状态持续 30 分钟：警告
  - unassigned_shards > 0：警告
```

### 节点状态

**节点列表**：

```bash
GET /_cat/nodes?v

name    heap.percent ram.percent cpu load_1m node.role master
node-1  45           60          5   0.50    dim       *
node-2  38           55          3   0.30    dim       -
node-3  42           58          4   0.35    dim       -
```

**关键指标**：
- **heap.percent**：JVM 堆内存使用率
- **ram.percent**：系统内存使用率
- **cpu**：CPU 使用率
- **load_1m**：系统负载

**告警阈值**：

```
JVM 堆内存：
  - > 75%：警告
  - > 85%：严重
  - > 95%：紧急

CPU 使用率：
  - > 70%：警告
  - > 85%：严重

系统负载（load_1m）：
  - > CPU 核心数：警告
  - > CPU 核心数 × 2：严重
```

### 分片分布

**分片状态**：

```bash
GET /_cat/shards?v&h=index,shard,prirep,state,docs,store,node

index    shard prirep state   docs   store  node
products 0     p      STARTED 10000  50mb   node-1
products 0     r      STARTED 10000  50mb   node-2
products 1     p      STARTED 12000  60mb   node-2
products 1     r      STARTED 12000  60mb   node-3
```

**检查项**：

```
分片状态：
  - STARTED：正常
  - INITIALIZING：初始化中
  - RELOCATING：迁移中
  - UNASSIGNED：未分配（问题）

分片分布：
  - 均匀分布在所有节点
  - 主副本不在同一节点
```

### 磁盘使用

**磁盘空间**：

```bash
GET /_cat/allocation?v

shards disk.indices disk.used disk.avail disk.total disk.percent node
    50        900gb      1.5tb      500gb       2tb           75 node-1
    48        850gb      1.4tb      600gb       2tb           70 node-2
```

**告警阈值**：

```
磁盘使用率：
  - > 80%：警告
  - > 85%：严重（禁止分配新分片）
  - > 90%：紧急（尝试迁移分片）
  - > 95%：索引只读
```

**磁盘水位配置**：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.disk.watermark.low": "85%",
    "cluster.routing.allocation.disk.watermark.high": "90%",
    "cluster.routing.allocation.disk.watermark.flood_stage": "95%"
  }
}
```

### 性能指标

**索引性能**：

```bash
GET /_nodes/stats/indices/indexing

{
  "nodes": {
    "node-1": {
      "indices": {
        "indexing": {
          "index_total": 1000000,
          "index_time_in_millis": 300000,
          "index_current": 10,
          "index_failed": 0,
          "delete_total": 50000,
          "delete_time_in_millis": 10000
        }
      }
    }
  }
}

# 计算指标
平均索引时间 = index_time_in_millis / index_total
            = 300000 / 1000000
            = 0.3ms
```

**查询性能**：

```bash
GET /_nodes/stats/indices/search

{
  "indices": {
    "search": {
      "query_total": 100000,
      "query_time_in_millis": 500000,
      "query_current": 10,
      "fetch_total": 50000,
      "fetch_time_in_millis": 100000
    }
  }
}

# 计算指标
平均查询时间 = query_time_in_millis / query_total
            = 500000 / 100000
            = 5ms
```

**告警阈值**：

```
索引性能：
  - 平均索引时间 > 50ms：警告
  - 索引拒绝率 > 1%：严重

查询性能：
  - 平均查询时间 > 100ms：警告
  - P95 查询时间 > 500ms：严重
  - 查询拒绝率 > 1%：严重
```

### JVM 监控

**JVM 统计**：

```bash
GET /_nodes/stats/jvm

{
  "jvm": {
    "mem": {
      "heap_used_percent": 65,
      "heap_max_in_bytes": 17179869184
    },
    "gc": {
      "collectors": {
        "young": {
          "collection_count": 1000,
          "collection_time_in_millis": 50000
        },
        "old": {
          "collection_count": 10,
          "collection_time_in_millis": 2000
        }
      }
    }
  }
}
```

**告警阈值**：

```
堆内存：
  - > 75%：警告
  - > 85%：严重

GC 频率：
  - Old GC > 1 次/分钟：警告
  - 连续 Full GC：紧急

GC 耗时：
  - GC 总耗时 > 10%（运行时间）：警告
  - 单次 GC > 1 秒：警告
```

## Kibana Monitoring 使用

### 启用 Monitoring

```yaml
# elasticsearch.yml
xpack.monitoring.collection.enabled: true
xpack.monitoring.collection.interval: 10s
```

### Monitoring 界面

**访问路径**：

```
Kibana → Stack Monitoring → Elasticsearch
```

**监控内容**：

```
集群概览：
  - 集群健康状态
  - 节点数量
  - 索引数量
  - 文档数量

节点监控：
  - CPU、内存、磁盘使用
  - JVM 堆内存
  - GC 统计
  - 线程池状态

索引监控：
  - 索引大小
  - 文档数量
  - 索引速率
  - 查询速率

性能监控：
  - 索引吞吐量
  - 查询延迟
  - 聚合性能
```

## X-Pack Monitoring 配置

### 配置监控

```yaml
# elasticsearch.yml
xpack.monitoring.enabled: true
xpack.monitoring.collection.enabled: true
```

### 监控数据保留

```bash
PUT /_cluster/settings
{
  "persistent": {
    "xpack.monitoring.history.duration": "7d"
  }
}
```

### 告警配置

```bash
# 创建告警规则
PUT _watcher/watch/cluster_health_watch
{
  "trigger": {
    "schedule": {
      "interval": "1m"
    }
  },
  "input": {
    "http": {
      "request": {
        "url": "http://localhost:9200/_cluster/health"
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.status": {
        "not_eq": "green"
      }
    }
  },
  "actions": {
    "send_email": {
      "email": {
        "to": "admin@example.com",
        "subject": "Cluster Health Alert",
        "body": "Cluster status is {{ctx.payload.status}}"
      }
    }
  }
}
```

## 第三方监控工具

### Cerebro

**安装**：

```bash
wget https://github.com/lmenezes/cerebro/releases/download/v0.9.4/cerebro-0.9.4.tgz
tar -xzf cerebro-0.9.4.tgz
cd cerebro-0.9.4
./bin/cerebro

# 访问：http://localhost:9000
```

**功能**：
- 集群健康可视化
- 索引管理
- 节点信息查看
- 分片分配查看
- REST API 调用

### ElasticHQ

**安装**：

```bash
docker run -p 5000:5000 elastichq/elasticsearch-hq

# 访问：http://localhost:5000
```

**功能**：
- 现代化界面
- 集群监控
- 索引管理
- 查询构建器

### Prometheus + Grafana

**Elasticsearch Exporter**：

```bash
docker run -d \
  -p 9114:9114 \
  quay.io/prometheuscommunity/elasticsearch-exporter:latest \
  --es.uri=http://localhost:9200
```

**Prometheus 配置**：

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'elasticsearch'
    static_configs:
      - targets: ['localhost:9114']
```

**Grafana Dashboard**：
- 导入社区 Dashboard（ID: 2322）
- 自定义指标面板

## 慢查询日志分析

### 配置慢查询日志

```bash
PUT /products/_settings
{
  "index.search.slowlog.threshold.query.warn": "2s",
  "index.search.slowlog.threshold.query.info": "1s",
  "index.search.slowlog.threshold.query.debug": "500ms",
  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.search.slowlog.level": "info"
}
```

### 慢查询日志位置

```
日志文件：
  logs/[cluster_name]_index_search_slowlog.log

日志示例：
[2024-01-15T10:30:00,123][WARN][index.search.slowlog.query] 
[products/0] took[2.5s], took_millis[2500], types[], stats[], 
search_type[QUERY_THEN_FETCH], total_shards[3], 
source[{"query":{"match":{"name":"phone"}}}]
```

### 慢查询分析

```
分析步骤：
1. 收集慢查询日志
2. 识别高频慢查询
3. 使用 Profile API 分析
4. 优化查询条件
5. 验证优化效果
```

## 常见问题诊断

### 集群 Yellow 状态

**原因排查**：

```bash
# 1. 检查未分配分片
GET /_cat/shards?v&h=index,shard,prirep,state,unassigned.reason

# 2. 查看分片分配解释
GET /_cluster/allocation/explain
{
  "index": "products",
  "shard": 0,
  "primary": false
}
```

**常见原因**：
- 节点数不足（副本无法分配）
- 磁盘空间不足
- 分片分配规则限制

**解决方案**：

```bash
# 增加节点 或 降低副本数
PUT /products/_settings
{
  "number_of_replicas": 0
}
```

### 查询性能下降

**诊断步骤**：

```bash
# 1. 检查慢查询日志
tail -f logs/cluster_index_search_slowlog.log

# 2. 使用 Profile API
GET /products/_search
{
  "profile": true,
  "query": { ... }
}

# 3. 检查系统资源
GET /_cat/nodes?v&h=name,cpu,heap.percent,ram.percent

# 4. 检查缓存命中率
GET /_nodes/stats/indices/query_cache
```

**常见原因**：
- 深度分页
- 聚合深度过深
- 缓存失效
- 系统资源不足

### 写入拒绝

**诊断**：

```bash
# 检查线程池状态
GET /_cat/thread_pool/write?v

name   active queue rejected
write  8      150   100

# 检查拒绝率
GET /_nodes/stats/thread_pool

{
  "thread_pool": {
    "write": {
      "rejected": 100,
      "completed": 10000
    }
  }
}

# 拒绝率 = 100 / (100 + 10000) = 0.99%
```

**解决方案**：

```yaml
# 增加线程池队列大小
elasticsearch.yml
thread_pool.write.queue_size: 1000

# 或增加节点数量
# 或优化批量写入策略
```

### 节点离线

**诊断**：

```bash
# 检查集群状态
GET /_cluster/health

# 检查节点列表
GET /_cat/nodes?v

# 检查节点日志
tail -f logs/elasticsearch.log
```

**常见原因**：
- 进程崩溃（OOM）
- 网络分区
- 硬件故障

**处理**：
- 重启节点
- 检查日志分析原因
- 修复底层问题

## 运维自动化实践

### 自动化脚本

**健康检查脚本**：

```bash
#!/bin/bash
# health_check.sh

CLUSTER_URL="http://localhost:9200"

# 检查集群健康
status=$(curl -s "$CLUSTER_URL/_cluster/health" | jq -r '.status')

if [ "$status" != "green" ]; then
    echo "Cluster status is $status"
    # 发送告警
    send_alert "Cluster health is $status"
fi

# 检查磁盘使用
disk_percent=$(curl -s "$CLUSTER_URL/_cat/allocation?format=json" | \
    jq '[.[].disk.percent | tonumber] | max')

if [ "$disk_percent" -gt 80 ]; then
    echo "Disk usage is $disk_percent%"
    send_alert "Disk usage exceeded 80%: $disk_percent%"
fi
```

**定期清理脚本**：

```bash
#!/bin/bash
# cleanup_old_indices.sh

# 删除 30 天前的日志索引
DATE_30_DAYS_AGO=$(date -d "30 days ago" +%Y.%m.%d)

curl -X DELETE "http://localhost:9200/logs-*" \
    -H 'Content-Type: application/json' \
    -d "{
      \"query\": {
        \"range\": {
          \"@timestamp\": {
            \"lt\": \"$DATE_30_DAYS_AGO\"
          }
        }
      }
    }"
```

### Cron 定时任务

```bash
# crontab -e

# 每 5 分钟健康检查
*/5 * * * * /opt/scripts/health_check.sh

# 每天凌晨 2 点清理旧索引
0 2 * * * /opt/scripts/cleanup_old_indices.sh

# 每天凌晨 3 点创建快照
0 3 * * * /opt/scripts/snapshot.sh

# 每小时检查分片分配
0 * * * * /opt/scripts/check_shards.sh
```

### 告警通知

**集成告警渠道**：

```bash
# 邮件告警
send_email_alert() {
    echo "$1" | mail -s "ES Cluster Alert" admin@example.com
}

# 钉钉告警
send_dingtalk_alert() {
    curl -X POST "https://oapi.dingtalk.com/robot/send?access_token=xxx" \
        -H 'Content-Type: application/json' \
        -d "{
          \"msgtype\": \"text\",
          \"text\": {
            \"content\": \"$1\"
          }
        }"
}

# Slack 告警
send_slack_alert() {
    curl -X POST "https://hooks.slack.com/services/xxx" \
        -H 'Content-Type: application/json' \
        -d "{\"text\": \"$1\"}"
}
```

## 运维最佳实践

### 监控清单

```
集群层面：
  ✓ 集群健康状态
  ✓ 节点数量
  ✓ 未分配分片数

节点层面：
  ✓ CPU 使用率
  ✓ 内存使用率
  ✓ 磁盘使用率
  ✓ JVM 堆内存
  ✓ GC 统计

性能层面：
  ✓ 索引速率
  ✓ 查询速率
  ✓ 查询延迟（平均、P95、P99）
  ✓ 拒绝率

业务层面：
  ✓ 文档数量
  ✓ 索引大小
  ✓ 查询 QPS
  ✓ 慢查询数量
```

### 告警策略

```
紧急告警（立即处理）：
  - 集群 Red 状态
  - 磁盘使用率 > 90%
  - 连续 Full GC
  - 所有节点 CPU > 90%

严重告警（30 分钟内处理）：
  - 集群 Yellow 状态持续
  - 磁盘使用率 > 85%
  - JVM 堆内存 > 85%
  - 查询拒绝率 > 5%

警告告警（24 小时内处理）：
  - 磁盘使用率 > 80%
  - JVM 堆内存 > 75%
  - P95 查询延迟 > 500ms
```

### 运维规范

```
日常巡检：
  - 每天检查集群健康
  - 每天查看慢查询日志
  - 每周检查磁盘使用趋势

定期维护：
  - 每月清理过期数据
  - 每月 Force Merge 历史索引
  - 每季度评估容量规划

备份策略：
  - 每天增量快照
  - 每周全量快照
  - 保留 30 天快照

应急预案：
  - 集群 Red 状态处理流程
  - 节点故障处理流程
  - 磁盘满处理流程
  - OOM 处理流程
```

## 总结

**关键指标**：
- 集群健康（green/yellow/red）
- 节点状态（CPU、内存、磁盘）
- 性能指标（索引速率、查询延迟）
- JVM 监控（堆内存、GC）

**监控工具**：
- Kibana Monitoring：官方监控
- X-Pack Monitoring：企业级监控
- Cerebro/ElasticHQ：第三方工具
- Prometheus + Grafana：通用监控

**告警阈值**：
- 堆内存 > 85%
- 磁盘使用率 > 85%
- CPU 使用率 > 70%
- 查询延迟 P95 > 500ms

**运维自动化**：
- 健康检查脚本
- 定期清理脚本
- 告警通知集成
- Cron 定时任务

**最佳实践**：
- 完善的监控体系
- 分级告警策略
- 定期巡检维护
- 应急预案准备

至此，第七部分"性能调优与监控"（第24-28章）已全部完成。

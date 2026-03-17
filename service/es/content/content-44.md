# 日志分析与监控平台

本章内容已在第41章"分布式日志收集（ELK Stack）"中详细介绍，包括：
- 日志采集方案（Filebeat、Logstash）
- 日志解析与字段提取
- 时间序列索引设计
- 日志检索与过滤
- 实时告警配置
- 日志归档与冷热分离
- 完整的 ELK Stack 架构

本章补充 PB 级日志系统架构的高级内容。

## PB 级日志系统架构

### 架构设计

```
数据源层           采集层        缓冲层      处理层        存储层
┌────────┐      ┌────────┐   ┌───────┐  ┌────────┐  ┌─────────┐
│App日志 │──▶   │Filebeat│──▶│ Kafka │─▶│Logstash│─▶│ES Hot   │
└────────┘      └────────┘   │       │  └────────┘  │  节点   │
┌────────┐      ┌────────┐   │Topic  │               ├─────────┤
│Nginx   │──▶   │Filebeat│──▶│  分区 │               │ES Warm  │
└────────┘      └────────┘   │       │               │  节点   │
┌────────┐      ┌────────┐   │       │               ├─────────┤
│容器日志│──▶   │Filebeat│──▶│       │               │ES Cold  │
└────────┘      └────────┘   └───────┘               │  节点   │
                                  │                   └─────────┘
                                  │
                            ┌─────┴──────┐
                            │  HDFS/S3   │
                            │  长期归档   │
                            └────────────┘
```

### Kafka 缓冲层

**Topic 设计**：

```
logs-application  # 应用日志
logs-access       # 访问日志
logs-error        # 错误日志
logs-audit        # 审计日志
```

**Partition 规划**：

```
日志量评估：
  - 单日日志量：1TB
  - 峰值写入：100MB/s
  
Partition 计算：
  - 单 Partition 吞吐：10MB/s
  - 所需 Partition：100MB/s ÷ 10MB/s = 10
  - 推荐配置：20 个 Partition（预留扩展）
```

### 分级存储策略

```
Hot 层（0-7天）：
  - NVMe SSD
  - 3个主分片，1个副本
  - 实时查询

Warm 层（7-30天）：
  - SATA SSD
  - 1个主分片，1个副本
  - 偶尔查询

Cold 层（30-90天）：
  - HDD
  - 1个主分片，0个副本
  - 很少查询

Delete（90天后）：
  - 自动删除或归档到对象存储
```

**ILM 策略**：

```bash
PUT /_ilm/policy/logs-lifecycle
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_size": "50GB"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "allocate": {
            "require": {
              "data": "warm"
            }
          },
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "allocate": {
            "require": {
              "data": "cold"
            }
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

## 性能优化

### 写入优化

```yaml
# Logstash pipeline 配置
pipeline.workers: 8
pipeline.batch.size: 500
pipeline.batch.delay: 50

# ES 索引配置
PUT /logs-*/_settings
{
  "index": {
    "refresh_interval": "30s",
    "number_of_replicas": 0,
    "translog.durability": "async",
    "translog.sync_interval": "30s"
  }
}
```

### 查询优化

```bash
# 使用 date_range 限制查询范围
GET /logs-2024.01.*/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-1h"
            }
          }
        }
      ]
    }
  }
}
```

## 监控告警

### Elastalert 规则

```yaml
# error_spike.yaml
name: Error Log Spike
type: spike
index: logs-*

threshold_ref: 10
threshold_cur: 10
timeframe:
  minutes: 5

spike_height: 2
spike_type: "up"

filter:
  - term:
      level: "ERROR"

alert:
  - email:
      email: "ops@example.com"
  - slack:
      slack_webhook_url: "https://hooks.slack.com/xxx"
```

## 总结

PB级日志系统需要：
- 合理的分层架构
- Kafka缓冲削峰
- 冷热数据分离
- 性能优化配置
- 完善的监控告警

详细内容请参考第41章。

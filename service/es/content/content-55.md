# Machine Learning 特性

## 概述

Elasticsearch Machine Learning（ML）提供了无监督机器学习能力，可用于异常检测、数据帧分析等场景。本章介绍 ML 的核心功能和实际应用。

## Machine Learning 功能概览

### 主要功能

```
异常检测（Anomaly Detection）：
- 时间序列异常检测
- 自动发现异常模式
- 实时告警

数据帧分析（Data Frame Analytics）：
- 回归分析
- 分类
- 异常值检测（Outlier Detection）
```

### 启用 ML

```yaml
# elasticsearch.yml
xpack.ml.enabled: true
xpack.ml.max_machine_memory_percent: 30
```

## 异常检测（Anomaly Detection）

### 创建异常检测作业

```bash
PUT _ml/anomaly_detectors/log_rate_detector
{
  "description": "Detect anomalies in log rate",
  "analysis_config": {
    "bucket_span": "15m",
    "detectors": [
      {
        "detector_description": "Count anomalies",
        "function": "count"
      }
    ]
  },
  "data_description": {
    "time_field": "@timestamp"
  }
}
```

### 常用检测函数

```
count：计数异常
high_count/low_count：高/低计数
mean/high_mean/low_mean：均值异常
sum/high_sum/low_sum：总和异常
median/high_median/low_median：中位数异常
min/max：最小/最大值
rare：罕见值检测
freq_rare：频繁/罕见组合
```

### 启动作业

```bash
# 创建数据馈送
PUT _ml/datafeeds/datafeed-log_rate_detector
{
  "job_id": "log_rate_detector",
  "indices": ["logs-*"],
  "query": {
    "match_all": {}
  }
}

# 打开作业
POST _ml/anomaly_detectors/log_rate_detector/_open

# 启动数据馈送
POST _ml/datafeeds/datafeed-log_rate_detector/_start
```

### 查看结果

```bash
# 获取异常结果
GET _ml/anomaly_detectors/log_rate_detector/results/records
{
  "sort": "record_score",
  "desc": true
}

# 获取异常桶
GET _ml/anomaly_detectors/log_rate_detector/results/buckets
```

## 高级异常检测

### 多变量检测

```bash
PUT _ml/anomaly_detectors/response_time_detector
{
  "analysis_config": {
    "bucket_span": "10m",
    "detectors": [
      {
        "detector_description": "High response time by URL",
        "function": "high_mean",
        "field_name": "response_time",
        "by_field_name": "url"
      }
    ]
  },
  "data_description": {
    "time_field": "@timestamp"
  }
}
```

### 分区检测

```bash
PUT _ml/anomaly_detectors/partitioned_detector
{
  "analysis_config": {
    "bucket_span": "15m",
    "detectors": [
      {
        "function": "mean",
        "field_name": "cpu_usage",
        "partition_field_name": "host.name"
      }
    ]
  },
  "data_description": {
    "time_field": "@timestamp"
  }
}
```

### 影响因子分析

```bash
PUT _ml/anomaly_detectors/influencer_detector
{
  "analysis_config": {
    "bucket_span": "15m",
    "detectors": [
      {
        "function": "high_count",
        "by_field_name": "status_code"
      }
    ],
    "influencers": ["client_ip", "user_agent"]
  },
  "data_description": {
    "time_field": "@timestamp"
  }
}
```

## 数据帧分析

### 异常值检测（Outlier Detection）

```bash
PUT _ml/data_frame/analytics/outlier_detection
{
  "source": {
    "index": "products"
  },
  "dest": {
    "index": "products_outliers"
  },
  "analysis": {
    "outlier_detection": {
      "n_neighbors": 10,
      "method": "distance",
      "feature_influence_threshold": 0.1
    }
  },
  "analyzed_fields": {
    "includes": ["price", "sales_count", "rating"]
  }
}

# 启动分析
POST _ml/data_frame/analytics/outlier_detection/_start

# 查看结果
GET products_outliers/_search
{
  "sort": {
    "ml.outlier_score": "desc"
  }
}
```

### 回归分析

```bash
PUT _ml/data_frame/analytics/price_prediction
{
  "source": {
    "index": "products"
  },
  "dest": {
    "index": "products_predictions"
  },
  "analysis": {
    "regression": {
      "dependent_variable": "price",
      "training_percent": 80
    }
  },
  "analyzed_fields": {
    "includes": ["brand", "category", "specs.*"]
  }
}
```

### 分类

```bash
PUT _ml/data_frame/analytics/category_classification
{
  "source": {
    "index": "products"
  },
  "dest": {
    "index": "products_classified"
  },
  "analysis": {
    "classification": {
      "dependent_variable": "category",
      "training_percent": 80,
      "num_top_classes": 5
    }
  },
  "analyzed_fields": {
    "includes": ["name", "description", "price"]
  }
}
```

## ML Job 配置与管理

### Job 配置选项

```bash
PUT _ml/anomaly_detectors/advanced_detector
{
  "description": "Advanced anomaly detection",
  "analysis_config": {
    "bucket_span": "15m",
    "summary_count_field_name": "doc_count",
    "detectors": [
      {
        "function": "mean",
        "field_name": "response_time",
        "by_field_name": "endpoint"
      }
    ],
    "influencers": ["client_ip", "user_id"]
  },
  "data_description": {
    "time_field": "@timestamp",
    "time_format": "epoch_ms"
  },
  "analysis_limits": {
    "model_memory_limit": "512mb",
    "categorization_examples_limit": 4
  },
  "model_plot_config": {
    "enabled": true
  }
}
```

### Job 管理

```bash
# 停止数据馈送
POST _ml/datafeeds/datafeed-log_rate_detector/_stop

# 关闭作业
POST _ml/anomaly_detectors/log_rate_detector/_close

# 删除作业
DELETE _ml/anomaly_detectors/log_rate_detector

# 获取作业统计
GET _ml/anomaly_detectors/log_rate_detector/_stats

# 更新作业
POST _ml/anomaly_detectors/log_rate_detector/_update
{
  "description": "Updated description",
  "analysis_limits": {
    "model_memory_limit": "1024mb"
  }
}
```

## 实战：日志异常检测

### 场景设计

```
目标：检测应用日志中的异常
数据：应用访问日志
指标：
  - 请求速率异常
  - 响应时间异常
  - 错误率异常
```

### 创建检测作业

```bash
# 1. 请求速率异常检测
PUT _ml/anomaly_detectors/request_rate_anomaly
{
  "description": "Detect anomalies in request rate",
  "analysis_config": {
    "bucket_span": "5m",
    "detectors": [
      {
        "detector_description": "High request count",
        "function": "high_count",
        "by_field_name": "endpoint"
      },
      {
        "detector_description": "Low request count",
        "function": "low_count",
        "by_field_name": "endpoint"
      }
    ],
    "influencers": ["client_ip", "user_agent"]
  },
  "data_description": {
    "time_field": "@timestamp"
  }
}

# 2. 响应时间异常检测
PUT _ml/anomaly_detectors/response_time_anomaly
{
  "analysis_config": {
    "bucket_span": "5m",
    "detectors": [
      {
        "function": "high_mean",
        "field_name": "response_time_ms",
        "by_field_name": "endpoint"
      }
    ],
    "influencers": ["endpoint", "status_code"]
  },
  "data_description": {
    "time_field": "@timestamp"
  }
}

# 3. 错误率异常检测
PUT _ml/anomaly_detectors/error_rate_anomaly
{
  "analysis_config": {
    "bucket_span": "5m",
    "detectors": [
      {
        "function": "high_count",
        "by_field_name": "status_code",
        "partition_field_name": "endpoint",
        "detector_description": "High error count per endpoint"
      }
    ]
  },
  "data_description": {
    "time_field": "@timestamp"
  }
}
```

### 配置数据馈送

```bash
PUT _ml/datafeeds/datafeed-request_rate_anomaly
{
  "job_id": "request_rate_anomaly",
  "indices": ["logs-*"],
  "query": {
    "bool": {
      "filter": [
        {"range": {"@timestamp": {"gte": "now-7d"}}}
      ]
    }
  },
  "frequency": "1m",
  "query_delay": "60s"
}
```

### 告警配置

```bash
# 使用 Watcher 配置告警
PUT _watcher/watch/ml_anomaly_alert
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": [".ml-anomalies-*"],
        "body": {
          "query": {
            "bool": {
              "filter": [
                {"term": {"job_id": "request_rate_anomaly"}},
                {"range": {"record_score": {"gte": 75}}},
                {"range": {"timestamp": {"gte": "now-10m"}}}
              ]
            }
          },
          "sort": [{"record_score": "desc"}]
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {
        "gt": 0
      }
    }
  },
  "actions": {
    "send_email": {
      "email": {
        "to": "ops@example.com",
        "subject": "ML Anomaly Detected",
        "body": {
          "text": "Anomaly detected with score: {{ctx.payload.hits.hits.0._source.record_score}}"
        }
      }
    }
  }
}
```

## ML 应用场景

### 适用场景

```
✓ 日志异常检测
✓ 性能指标监控
✓ 用户行为异常
✓ 安全威胁检测
✓ 业务指标预测
✓ 欺诈检测
```

### 不适用场景

```
✗ 确定性规则检测
✗ 实时性要求极高（<1分钟）
✗ 小数据量场景
✗ 需要可解释性的场景
```

## 性能优化

### 资源配置

```yaml
# elasticsearch.yml
xpack.ml.max_machine_memory_percent: 30
xpack.ml.max_open_jobs: 20
xpack.ml.max_model_memory_limit: 1gb
```

### Job 优化

```
✓ 合理设置 bucket_span
✓ 限制 model_memory_limit
✓ 使用合适的 detector 函数
✓ 减少 influencers 数量
✓ 定期清理旧作业
```

## 总结

**ML 功能**：
- 异常检测
- 数据帧分析
- 回归和分类

**异常检测**：
- 时间序列分析
- 多变量检测
- 影响因子分析

**数据帧分析**：
- 异常值检测
- 回归分析
- 分类

**Job 管理**：
- 创建和配置
- 启动和停止
- 监控和优化

**实战应用**：
- 日志异常检测
- 性能监控
- 告警配置

**适用场景**：
- 无监督学习
- 模式发现
- 预测分析

**最佳实践**：
- 合理配置资源
- 选择合适函数
- 定期清理

**下一步**：学习 Beats 数据采集。

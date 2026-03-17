# Ingest Pipeline 数据预处理

## 概述

Ingest Pipeline 允许在文档索引前对数据进行预处理和转换。相比 Logstash，Ingest Pipeline 更轻量，适合简单的数据处理场景。

## Ingest Pipeline 概念

### 架构

```
数据源 → Ingest Node → Pipeline → Processors → Index
```

### 基本结构

```bash
PUT /_ingest/pipeline/my_pipeline
{
  "description": "My pipeline description",
  "processors": [
    {
      "set": {
        "field": "processed",
        "value": true
      }
    }
  ]
}
```

## 常用处理器

### set 处理器

```bash
PUT /_ingest/pipeline/add_fields
{
  "processors": [
    {
      "set": {
        "field": "environment",
        "value": "production"
      }
    },
    {
      "set": {
        "field": "timestamp",
        "value": "{{_ingest.timestamp}}"
      }
    }
  ]
}
```

### remove 处理器

```bash
PUT /_ingest/pipeline/remove_fields
{
  "processors": [
    {
      "remove": {
        "field": "sensitive_data"
      }
    },
    {
      "remove": {
        "field": ["temp1", "temp2"]
      }
    }
  ]
}
```

### rename 处理器

```bash
PUT /_ingest/pipeline/rename_fields
{
  "processors": [
    {
      "rename": {
        "field": "old_field_name",
        "target_field": "new_field_name"
      }
    }
  ]
}
```

### convert 处理器

```bash
PUT /_ingest/pipeline/convert_types
{
  "processors": [
    {
      "convert": {
        "field": "price",
        "type": "float"
      }
    },
    {
      "convert": {
        "field": "quantity",
        "type": "integer"
      }
    }
  ]
}
```

## 日期解析

### date 处理器

```bash
PUT /_ingest/pipeline/parse_dates
{
  "processors": [
    {
      "date": {
        "field": "log_time",
        "target_field": "@timestamp",
        "formats": ["ISO8601", "yyyy-MM-dd HH:mm:ss"],
        "timezone": "Asia/Shanghai"
      }
    }
  ]
}
```

### date_index_name 处理器

```bash
PUT /_ingest/pipeline/date_based_index
{
  "processors": [
    {
      "date_index_name": {
        "field": "@timestamp",
        "index_name_prefix": "logs-",
        "date_rounding": "d",
        "date_formats": ["yyyy-MM-dd'T'HH:mm:ss.SSSZ"]
      }
    }
  ]
}
```

## Grok 模式匹配

### grok 处理器

```bash
PUT /_ingest/pipeline/parse_logs
{
  "processors": [
    {
      "grok": {
        "field": "message",
        "patterns": [
          "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} \\[%{DATA:thread}\\] %{DATA:logger} - %{GREEDYDATA:msg}"
        ]
      }
    }
  ]
}

# 输入
# 2024-01-15T10:00:00.123+0800 INFO [main] com.example.Service - Application started

# 输出
{
  "timestamp": "2024-01-15T10:00:00.123+0800",
  "level": "INFO",
  "thread": "main",
  "logger": "com.example.Service",
  "msg": "Application started"
}
```

### 常用 Grok 模式

```
%{IP:client_ip}
%{NUMBER:response_time}
%{WORD:method}
%{URIPATH:path}
%{HTTPDATE:timestamp}
%{COMBINEDAPACHELOG}
```

## User Agent 解析

### user_agent 处理器

```bash
PUT /_ingest/pipeline/parse_user_agent
{
  "processors": [
    {
      "user_agent": {
        "field": "user_agent",
        "target_field": "ua"
      }
    }
  ]
}

# 输入
{
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

# 输出
{
  "ua": {
    "name": "Chrome",
    "version": "120.0",
    "os": {
      "name": "Windows",
      "version": "10",
      "full": "Windows 10"
    },
    "device": {
      "name": "Other"
    }
  }
}
```

## GeoIP 地理位置解析

### geoip 处理器

```bash
PUT /_ingest/pipeline/geoip_enrichment
{
  "processors": [
    {
      "geoip": {
        "field": "client_ip",
        "target_field": "geo",
        "properties": [
          "continent_name",
          "country_name",
          "city_name",
          "location"
        ]
      }
    }
  ]
}

# 输入
{
  "client_ip": "8.8.8.8"
}

# 输出
{
  "geo": {
    "continent_name": "North America",
    "country_name": "United States",
    "city_name": "Mountain View",
    "location": {
      "lat": 37.386,
      "lon": -122.0838
    }
  }
}
```

## 条件处理

### if 条件

```bash
PUT /_ingest/pipeline/conditional_processing
{
  "processors": [
    {
      "set": {
        "if": "ctx.level == 'ERROR'",
        "field": "priority",
        "value": "high"
      }
    },
    {
      "set": {
        "if": "ctx.response_time > 1000",
        "field": "slow_request",
        "value": true
      }
    }
  ]
}
```

### script 处理器

```bash
PUT /_ingest/pipeline/script_processing
{
  "processors": [
    {
      "script": {
        "source": """
          if (ctx.price != null && ctx.quantity != null) {
            ctx.total = ctx.price * ctx.quantity;
          }
        """
      }
    }
  ]
}
```

## Pipeline 组合

### 嵌套 Pipeline

```bash
PUT /_ingest/pipeline/parse_json
{
  "processors": [
    {
      "json": {
        "field": "message",
        "target_field": "json"
      }
    }
  ]
}

PUT /_ingest/pipeline/main_pipeline
{
  "processors": [
    {
      "pipeline": {
        "name": "parse_json"
      }
    },
    {
      "set": {
        "field": "processed_at",
        "value": "{{_ingest.timestamp}}"
      }
    }
  ]
}
```

## 使用 Pipeline

### 索引时使用

```bash
# 单个文档
PUT /my_index/_doc/1?pipeline=my_pipeline
{
  "message": "test"
}

# 批量操作
POST /_bulk
{"index": {"_index": "my_index", "pipeline": "my_pipeline"}}
{"message": "test1"}
{"index": {"_index": "my_index", "pipeline": "my_pipeline"}}
{"message": "test2"}
```

### 索引模板中指定

```bash
PUT /_index_template/logs_template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "default_pipeline": "logs_pipeline"
    }
  }
}
```

## 测试 Pipeline

### simulate API

```bash
POST /_ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      {
        "set": {
          "field": "level",
          "value": "INFO"
        }
      },
      {
        "uppercase": {
          "field": "level"
        }
      }
    ]
  },
  "docs": [
    {
      "_source": {
        "message": "test"
      }
    }
  ]
}
```

### 调试已存在的 Pipeline

```bash
POST /_ingest/pipeline/my_pipeline/_simulate
{
  "docs": [
    {
      "_source": {
        "message": "2024-01-15 10:00:00 INFO Application started"
      }
    }
  ]
}
```

## 完整示例

### 日志处理 Pipeline

```bash
PUT /_ingest/pipeline/application_logs
{
  "description": "Parse application logs",
  "processors": [
    {
      "grok": {
        "field": "message",
        "patterns": [
          "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} \\[%{DATA:thread}\\] %{DATA:logger} - %{GREEDYDATA:log_message}"
        ],
        "ignore_failure": true
      }
    },
    {
      "date": {
        "field": "timestamp",
        "target_field": "@timestamp",
        "formats": ["ISO8601"],
        "ignore_failure": true
      }
    },
    {
      "remove": {
        "field": "timestamp",
        "ignore_failure": true
      }
    },
    {
      "set": {
        "if": "ctx.level == 'ERROR' || ctx.level == 'FATAL'",
        "field": "priority",
        "value": "high"
      }
    },
    {
      "set": {
        "field": "processed_at",
        "value": "{{_ingest.timestamp}}"
      }
    }
  ],
  "on_failure": [
    {
      "set": {
        "field": "error.message",
        "value": "Pipeline processing failed: {{_ingest.on_failure_message}}"
      }
    }
  ]
}
```

## Pipeline 最佳实践

### 性能优化

```
✓ 尽量减少处理器数量
✓ 避免复杂的正则表达式
✓ 使用 ignore_failure 容错
✓ 合理使用条件判断
✓ 考虑使用 Logstash 处理复杂逻辑
```

### 错误处理

```bash
PUT /_ingest/pipeline/with_error_handling
{
  "processors": [
    {
      "convert": {
        "field": "price",
        "type": "float",
        "ignore_failure": true
      }
    }
  ],
  "on_failure": [
    {
      "set": {
        "field": "tags",
        "value": ["_pipeline_failure"]
      }
    },
    {
      "set": {
        "field": "error_message",
        "value": "{{_ingest.on_failure_message}}"
      }
    }
  ]
}
```

### Logstash vs Ingest Pipeline

```
使用 Ingest Pipeline：
  ✓ 简单的数据转换
  ✓ 字段添加/删除/重命名
  ✓ 日期解析
  ✓ GeoIP 解析
  ✓ User Agent 解析

使用 Logstash：
  ✓ 复杂的数据转换
  ✓ 多数据源聚合
  ✓ 外部服务查询
  ✓ 复杂的条件逻辑
  ✓ 需要缓冲队列
```

## 总结

**Ingest Pipeline**：
- 轻量级预处理
- 无需额外组件
- 适合简单转换

**常用处理器**：
- set/remove/rename
- convert 类型转换
- date 日期解析
- grok 模式匹配

**特殊处理器**：
- user_agent 解析
- geoip 地理位置
- script 脚本处理

**Pipeline 管理**：
- 创建/更新/删除
- 模拟测试
- 错误处理

**最佳实践**：
- 性能优化
- 错误容错
- 合理选择工具

**下一步**：学习地理位置查询。

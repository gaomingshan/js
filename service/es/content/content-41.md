# 分布式日志收集（ELK Stack）

## 概述

ELK Stack（Elasticsearch + Logstash + Kibana）是业界主流的日志分析解决方案。本章介绍如何构建完整的日志收集、处理、存储和可视化系统。

## ELK Stack 架构

### 标准架构

```
应用服务器                    日志处理层              存储与查询层        可视化层
┌─────────┐               ┌────────────┐          ┌──────────────┐   ┌─────────┐
│ App 1   │──log file──▶  │  Filebeat  │──────▶   │              │   │         │
└─────────┘               └────────────┘          │              │   │         │
┌─────────┐               ┌────────────┐          │              │   │         │
│ App 2   │──log file──▶  │  Filebeat  │──────▶   │  Logstash    │──▶│ Elastic │──▶│ Kibana  │
└─────────┘               └────────────┘          │              │   │ search  │   │         │
┌─────────┐               ┌────────────┐          │              │   │         │   │         │
│ App 3   │──log file──▶  │  Filebeat  │──────▶   │              │   │         │   │         │
└─────────┘               └────────────┘          └──────────────┘   └──────────┘   └─────────┘
```

### 高级架构（带消息队列）

```
应用层          采集层          缓冲层         处理层         存储层        可视化层
┌──────┐     ┌─────────┐    ┌────────┐    ┌─────────┐   ┌──────┐    ┌────────┐
│ App  │──▶  │Filebeat │──▶ │ Kafka  │──▶ │Logstash │──▶│  ES  │──▶ │ Kibana │
└──────┘     └─────────┘    └────────┘    └─────────┘   └──────┘    └────────┘
                                  │
                                  ├──▶ 备份存储（HDFS/S3）
                                  └──▶ 实时计算（Flink）
```

### 组件职责

**Filebeat**：
- 轻量级日志采集器
- 监控日志文件变化
- 支持多种输出

**Logstash**：
- 数据处理管道
- 过滤、解析、转换
- 丰富的插件生态

**Elasticsearch**：
- 分布式搜索引擎
- 日志存储和检索
- 聚合分析

**Kibana**：
- 数据可视化
- 日志查询界面
- Dashboard 展示

## Filebeat 日志采集配置

### 安装 Filebeat

```bash
# CentOS/RHEL
wget https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.17.9-x86_64.rpm
rpm -ivh filebeat-7.17.9-x86_64.rpm

# Ubuntu/Debian
wget https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.17.9-amd64.deb
dpkg -i filebeat-7.17.9-amd64.deb

# 启动服务
systemctl start filebeat
systemctl enable filebeat
```

### 基本配置

**filebeat.yml**：

```yaml
# 输入配置
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/app/*.log
    
    # 字段添加
    fields:
      app: product-service
      env: production
    fields_under_root: true
    
    # 多行日志处理
    multiline.pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
    multiline.negate: true
    multiline.match: after

# 输出到 Logstash
output.logstash:
  hosts: ["logstash:5044"]
  
# 输出到 Elasticsearch（直连）
# output.elasticsearch:
#   hosts: ["es-node1:9200", "es-node2:9200"]
#   index: "logs-%{[fields.app]}-%{+yyyy.MM.dd}"

# 日志级别
logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
```

### 高级配置

**多输入源**：

```yaml
filebeat.inputs:
  # 应用日志
  - type: log
    paths:
      - /var/log/app/application.log
    fields:
      log_type: application
      app: product-service
    
  # 访问日志
  - type: log
    paths:
      - /var/log/nginx/access.log
    fields:
      log_type: access
      app: nginx
    
  # 错误日志
  - type: log
    paths:
      - /var/log/app/error.log
    fields:
      log_type: error
      app: product-service
      severity: high
```

**日志过滤**：

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/app/*.log
    
    # 排除特定行
    exclude_lines: ['^DEBUG', '^TRACE']
    
    # 包含特定行
    include_lines: ['^ERROR', '^WARN']
    
    # 排除特定文件
    exclude_files: ['\.gz$', '\.zip$']
```

**处理器（Processors）**：

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/app/*.log
    
    processors:
      # 添加主机信息
      - add_host_metadata: ~
      
      # 添加云元数据
      - add_cloud_metadata: ~
      
      # 删除字段
      - drop_fields:
          fields: ["agent.ephemeral_id", "agent.id"]
      
      # 重命名字段
      - rename:
          fields:
            - from: "message"
              to: "log_message"
      
      # 解析 JSON
      - decode_json_fields:
          fields: ["message"]
          target: "json"
```

### Docker 部署

**docker-compose.yml**：

```yaml
version: '3.8'

services:
  filebeat:
    image: docker.elastic.co/beats/filebeat:7.17.9
    user: root
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/log/app:/var/log/app:ro
      - filebeat-data:/usr/share/filebeat/data
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
      - LOGSTASH_HOSTS=logstash:5044
    depends_on:
      - elasticsearch
      - logstash

volumes:
  filebeat-data:
```

## Logstash 数据处理管道

### 安装 Logstash

```bash
# CentOS/RHEL
wget https://artifacts.elastic.co/downloads/logstash/logstash-7.17.9-x86_64.rpm
rpm -ivh logstash-7.17.9-x86_64.rpm

# 启动服务
systemctl start logstash
systemctl enable logstash
```

### Pipeline 配置

**基本 Pipeline**：

```ruby
# /etc/logstash/conf.d/app-logs.conf

input {
  beats {
    port => 5044
  }
}

filter {
  # Grok 解析
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} \[%{DATA:thread}\] %{DATA:logger} - %{GREEDYDATA:log_message}"
    }
  }
  
  # 日期解析
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }
  
  # 添加字段
  mutate {
    add_field => {
      "processed_at" => "%{@timestamp}"
    }
  }
}

output {
  elasticsearch {
    hosts => ["es-node1:9200", "es-node2:9200"]
    index => "logs-%{app}-%{+YYYY.MM.dd}"
    document_id => "%{[@metadata][_id]}"
  }
  
  # 调试输出
  # stdout {
  #   codec => rubydebug
  # }
}
```

### 复杂过滤器

**JSON 日志解析**：

```ruby
filter {
  # 解析 JSON
  json {
    source => "message"
  }
  
  # 提取字段
  mutate {
    rename => {
      "[json][timestamp]" => "timestamp"
      "[json][level]" => "level"
      "[json][message]" => "log_message"
    }
  }
  
  # 删除原始 message
  mutate {
    remove_field => ["message", "json"]
  }
}
```

**条件处理**：

```ruby
filter {
  if [log_type] == "access" {
    # 访问日志处理
    grok {
      match => {
        "message" => "%{COMBINEDAPACHELOG}"
      }
    }
  } else if [log_type] == "application" {
    # 应用日志处理
    grok {
      match => {
        "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} - %{GREEDYDATA:log_message}"
      }
    }
  }
  
  # 错误级别额外处理
  if [level] == "ERROR" {
    mutate {
      add_tag => ["error"]
      add_field => {
        "alert" => "true"
      }
    }
  }
}
```

**多输出**：

```ruby
output {
  # 所有日志到 ES
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-all-%{+YYYY.MM.dd}"
  }
  
  # 错误日志单独索引
  if "error" in [tags] {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "logs-error-%{+YYYY.MM.dd}"
    }
  }
  
  # 告警日志发送到 Kafka
  if [level] == "ERROR" or [level] == "FATAL" {
    kafka {
      bootstrap_servers => "kafka:9092"
      topic_id => "log-alerts"
    }
  }
}
```

### 性能优化

**Pipeline 配置**：

```yaml
# /etc/logstash/logstash.yml

pipeline.workers: 4
pipeline.batch.size: 125
pipeline.batch.delay: 50

queue.type: persisted
queue.max_bytes: 1gb
```

**多 Pipeline**：

```yaml
# /etc/logstash/pipelines.yml

- pipeline.id: app-logs
  path.config: "/etc/logstash/conf.d/app-logs.conf"
  pipeline.workers: 2
  
- pipeline.id: access-logs
  path.config: "/etc/logstash/conf.d/access-logs.conf"
  pipeline.workers: 2
  
- pipeline.id: error-logs
  path.config: "/etc/logstash/conf.d/error-logs.conf"
  pipeline.workers: 1
```

## 日志索引设计与模板

### 索引命名规范

```
命名格式：logs-{service}-{env}-{date}

示例：
  - logs-product-service-prod-2024.01.15
  - logs-order-service-prod-2024.01.15
  - logs-user-service-dev-2024.01.15

优点：
  - 按服务分离
  - 按环境隔离
  - 按日期滚动
```

### 索引模板

**创建索引模板**：

```bash
PUT /_index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "refresh_interval": "5s",
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "logs"
    },
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        },
        "level": {
          "type": "keyword"
        },
        "app": {
          "type": "keyword"
        },
        "env": {
          "type": "keyword"
        },
        "host": {
          "type": "keyword"
        },
        "log_message": {
          "type": "text",
          "analyzer": "standard"
        },
        "logger": {
          "type": "keyword"
        },
        "thread": {
          "type": "keyword"
        },
        "stack_trace": {
          "type": "text"
        }
      }
    }
  }
}
```

### ILM 生命周期策略

```bash
PUT /_ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_size": "50GB"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "freeze": {},
          "set_priority": {
            "priority": 0
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

## Kibana 可视化配置

### 安装 Kibana

```bash
# CentOS/RHEL
wget https://artifacts.elastic.co/downloads/kibana/kibana-7.17.9-x86_64.rpm
rpm -ivh kibana-7.17.9-x86_64.rpm

# 配置
vi /etc/kibana/kibana.yml

# 启动
systemctl start kibana
systemctl enable kibana
```

### Kibana 配置

**kibana.yml**：

```yaml
server.port: 5601
server.host: "0.0.0.0"
server.name: "kibana-server"

elasticsearch.hosts: ["http://es-node1:9200", "http://es-node2:9200"]
elasticsearch.username: "kibana_system"
elasticsearch.password: "${KIBANA_PASSWORD}"

# 国际化
i18n.locale: "zh-CN"

# 日志
logging.dest: /var/log/kibana/kibana.log
```

### 创建 Index Pattern

1. 访问 Kibana：`http://kibana:5601`
2. 进入 Management → Index Patterns
3. 创建 Index Pattern：`logs-*`
4. 选择时间字段：`@timestamp`

### Discover 日志查询

**基本查询**：

```
# 按级别过滤
level: "ERROR"

# 按应用过滤
app: "product-service"

# 组合查询
level: "ERROR" AND app: "product-service"

# 时间范围
@timestamp: [now-1h TO now]

# 包含关键词
log_message: *exception*

# 精确匹配
logger: "com.example.service.ProductService"
```

**KQL 查询**：

```
# 字段查询
level: ERROR

# 通配符
app: product-*

# 范围查询
response_time >= 1000

# 布尔运算
level: ERROR and app: product-service

# 存在性
stack_trace: *

# 正则表达式
log_message: /NullPointerException|IllegalArgumentException/
```

### 创建 Visualization

**日志量趋势图**：

```
1. 选择 Line Chart
2. Metrics: Count
3. Buckets: Date Histogram on @timestamp
4. Interval: Auto
```

**错误日志分布**：

```
1. 选择 Pie Chart
2. Metrics: Count
3. Buckets: Terms on level
4. Size: 10
```

**应用日志统计**：

```
1. 选择 Data Table
2. Metrics: Count
3. Buckets: Terms on app
4. Sub-buckets: Terms on level
```

### 创建 Dashboard

**操作步骤**：

1. 进入 Dashboard
2. Create new dashboard
3. Add panels
   - 添加已创建的 Visualization
   - 调整布局和大小
4. Save dashboard

**实战 Dashboard**：

```
日志监控 Dashboard：

┌─────────────────────────────┬─────────────────────────────┐
│ 总日志量（24h）              │ 错误日志量（24h）             │
│ Line Chart                  │ Line Chart                  │
└─────────────────────────────┴─────────────────────────────┘
┌─────────────────────────────┬─────────────────────────────┐
│ 日志级别分布                 │ 应用日志统计                 │
│ Pie Chart                   │ Data Table                  │
└─────────────────────────────┴─────────────────────────────┘
┌───────────────────────────────────────────────────────────┐
│ 最近错误日志                                               │
│ Data Table (level=ERROR)                                  │
└───────────────────────────────────────────────────────────┘
```

## 日志查询与分析

### 复杂查询

**聚合查询**：

```bash
GET /logs-*/_search
{
  "size": 0,
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-24h"
      }
    }
  },
  "aggs": {
    "levels": {
      "terms": {
        "field": "level",
        "size": 10
      },
      "aggs": {
        "apps": {
          "terms": {
            "field": "app",
            "size": 10
          }
        }
      }
    }
  }
}
```

**错误日志分析**：

```bash
GET /logs-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "ERROR" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "aggs": {
    "error_types": {
      "terms": {
        "field": "logger",
        "size": 20
      }
    },
    "error_timeline": {
      "date_histogram": {
        "field": "@timestamp",
        "fixed_interval": "5m"
      }
    }
  }
}
```

## 微服务日志聚合方案

### Spring Boot 集成

**依赖配置**：

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.3</version>
</dependency>
```

**logback-spring.xml**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <destination>logstash:5000</destination>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"app":"product-service","env":"production"}</customFields>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>/var/log/app/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>/var/log/app/application.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %level [%thread] %logger - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="LOGSTASH"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

### 链路追踪集成

**添加追踪ID**：

```xml
<appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>logstash:5000</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <provider class="net.logstash.logback.composite.loggingevent.LoggingEventPatternJsonProvider">
            <pattern>
                {
                  "trace_id": "%X{X-B3-TraceId}",
                  "span_id": "%X{X-B3-SpanId}",
                  "parent_span_id": "%X{X-B3-ParentSpanId}"
                }
            </pattern>
        </provider>
    </encoder>
</appender>
```

## 总结

**ELK 架构**：
- Filebeat：日志采集
- Logstash：数据处理
- Elasticsearch：存储检索
- Kibana：数据可视化

**日志采集**：
- Filebeat 轻量级
- 多输入源配置
- 日志过滤处理

**数据处理**：
- Logstash Pipeline
- Grok 模式解析
- 条件过滤

**索引设计**：
- 命名规范
- 索引模板
- ILM 生命周期

**可视化**：
- Index Pattern
- Discover 查询
- Visualization 图表
- Dashboard 仪表盘

**微服务集成**：
- Spring Boot 集成
- 链路追踪
- 日志聚合

**最佳实践**：
- 日志分级存储
- 定期清理
- 性能优化
- 告警配置

**下一步**：学习分布式追踪与监控。

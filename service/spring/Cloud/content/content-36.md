# 第 36 章：日志体系与三大信号关联

> **学习目标**：掌握 ELK 完整部署、理解日志收集与分析流程、能够实现日志与链路关联、掌握三大信号协同分析能力、能够优化日志存储与检索  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. OTel Logs 规范与数据模型

### 1.1 OTel Logs 概述

**OpenTelemetry Logs**：统一的日志数据模型，与 Traces 和 Metrics 无缝集成。

**核心特性**：
- ✅ 结构化日志
- ✅ 与 Trace 关联（TraceId/SpanId）
- ✅ 统一的资源属性
- ✅ 多后端导出

### 1.2 日志数据模型

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "observedTimestamp": "2024-01-01T00:00:00.001Z",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "severityText": "ERROR",
  "severityNumber": 17,
  "body": "订单创建失败",
  "attributes": {
    "orderId": "123456",
    "userId": "789",
    "error.type": "BusinessException",
    "error.message": "库存不足"
  },
  "resource": {
    "service.name": "order-service",
    "service.version": "1.0.0",
    "deployment.environment": "production",
    "host.name": "server-001"
  }
}
```

### 1.3 严重级别

```
TRACE = 1
DEBUG = 5
INFO = 9
WARN = 13
ERROR = 17
FATAL = 21
```

---

## 2. ELK 架构设计（Elasticsearch/Logstash/Kibana）

### 2.1 ELK 架构

```
应用服务
    ↓ 日志输出
Filebeat（轻量级采集器）
    ↓ 采集日志
Logstash（日志处理）
    ├─ Input（输入）
    ├─ Filter（过滤解析）
    └─ Output（输出）
    ↓
Elasticsearch（存储与搜索）
    ├─ 索引管理
    ├─ 数据存储
    └─ 全文检索
    ↓
Kibana（可视化）
    ├─ 日志检索
    ├─ 可视化分析
    └─ Dashboard
```

### 2.2 组件职责

**Filebeat**：
- 轻量级日志采集
- 文件监控
- 多行日志处理
- 背压机制

**Logstash**：
- 日志解析（Grok）
- 数据转换
- 数据增强
- 多源聚合

**Elasticsearch**：
- 分布式存储
- 全文检索
- 聚合分析
- 索引管理

**Kibana**：
- 日志搜索
- 可视化
- Dashboard
- 告警

---

## 3. Elasticsearch 集群部署

### 3.1 Docker Compose 部署

```yaml
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - cluster.name=logs-cluster
      - node.name=es-node-1
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms2g -Xmx2g
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - es-data:/usr/share/elasticsearch/data
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 65536
        hard: 65536

volumes:
  es-data:
```

### 3.2 集群配置

**3节点集群**：

```yaml
version: '3'
services:
  es-node-1:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - cluster.name=logs-cluster
      - node.name=es-node-1
      - discovery.seed_hosts=es-node-2,es-node-3
      - cluster.initial_master_nodes=es-node-1,es-node-2,es-node-3
      - node.roles=master,data,ingest
    ports:
      - "9200:9200"
  
  es-node-2:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - cluster.name=logs-cluster
      - node.name=es-node-2
      - discovery.seed_hosts=es-node-1,es-node-3
      - cluster.initial_master_nodes=es-node-1,es-node-2,es-node-3
      - node.roles=master,data,ingest
  
  es-node-3:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - cluster.name=logs-cluster
      - node.name=es-node-3
      - discovery.seed_hosts=es-node-1,es-node-2
      - cluster.initial_master_nodes=es-node-1,es-node-2,es-node-3
      - node.roles=master,data,ingest
```

### 3.3 索引模板

```json
PUT _index_template/logs-template
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "logs"
    },
    "mappings": {
      "properties": {
        "@timestamp": {"type": "date"},
        "level": {"type": "keyword"},
        "logger": {"type": "keyword"},
        "message": {"type": "text"},
        "traceId": {"type": "keyword"},
        "spanId": {"type": "keyword"},
        "service": {"type": "keyword"},
        "host": {"type": "keyword"}
      }
    }
  }
}
```

---

## 4. Logstash 日志收集与解析

### 4.1 Logstash 配置

**logstash.conf**：

```ruby
input {
  beats {
    port => 5044
  }
  
  tcp {
    port => 5000
    codec => json_lines
  }
}

filter {
  # 解析 JSON 日志
  if [message] =~ /^\{.*\}$/ {
    json {
      source => "message"
    }
  }
  
  # Grok 解析普通日志
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} \[%{DATA:traceId},%{DATA:spanId}\] %{DATA:logger} - %{GREEDYDATA:msg}"
    }
  }
  
  # 日期解析
  date {
    match => ["timestamp", "ISO8601", "yyyy-MM-dd HH:mm:ss.SSS"]
    target => "@timestamp"
  }
  
  # 添加字段
  mutate {
    add_field => {
      "[@metadata][index]" => "logs-%{service}-%{+YYYY.MM.dd}"
    }
    remove_field => ["host", "agent", "ecs"]
  }
  
  # GeoIP 解析
  if [clientIp] {
    geoip {
      source => "clientIp"
      target => "geo"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index]}"
    template_name => "logs-template"
  }
  
  # 调试输出
  stdout {
    codec => rubydebug
  }
}
```

### 4.2 Grok 模式

**自定义模式**：

```
# patterns/custom
TRACE_ID [0-9a-f]{32}
SPAN_ID [0-9a-f]{16}
SERVICE_LOG %{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} \[%{TRACE_ID:traceId},%{SPAN_ID:spanId}\] %{DATA:logger} - %{GREEDYDATA:message}
```

**使用自定义模式**：

```ruby
filter {
  grok {
    patterns_dir => ["/usr/share/logstash/patterns"]
    match => {
      "message" => "%{SERVICE_LOG}"
    }
  }
}
```

---

## 5. Filebeat 轻量级采集

### 5.1 Filebeat 配置

**filebeat.yml**：

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/app/*.log
    
    # 多行日志处理
    multiline.type: pattern
    multiline.pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
    multiline.negate: true
    multiline.match: after
    
    # 字段添加
    fields:
      service: order-service
      environment: production
    fields_under_root: true
    
    # 日志类型
    tags: ["application-logs"]

# 输出到 Logstash
output.logstash:
  hosts: ["logstash:5044"]
  compression_level: 3
  loadbalance: true

# 输出到 Elasticsearch
# output.elasticsearch:
#   hosts: ["elasticsearch:9200"]
#   index: "logs-%{[service]}-%{+yyyy.MM.dd}"

# 日志处理
processors:
  - add_host_metadata: ~
  - add_cloud_metadata: ~
  - add_docker_metadata: ~
```

### 5.2 Docker 日志采集

```yaml
filebeat.inputs:
  - type: container
    enabled: true
    paths:
      - '/var/lib/docker/containers/*/*.log'
    
    # 解码 Docker JSON 日志
    processors:
      - add_docker_metadata:
          host: "unix:///var/run/docker.sock"
      
      - decode_json_fields:
          fields: ["message"]
          target: ""
          overwrite_keys: true
```

---

## 6. Spring Boot 日志集成（Logback/Log4j2）

### 6.1 Logback 配置

**logback-spring.xml**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %level [%X{traceId},%X{spanId}] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>/var/log/app/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>/var/log/app/application.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %level [%X{traceId},%X{spanId}] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <!-- JSON 格式输出 -->
    <appender name="JSON" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>/var/log/app/application.json</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>/var/log/app/application.%d{yyyy-MM-dd}.json</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"service":"order-service","environment":"production"}</customFields>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
        <appender-ref ref="JSON"/>
    </root>
</configuration>
```

### 6.2 添加依赖

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

---

## 7. 日志格式规范（JSON 结构化日志）

### 7.1 JSON 日志格式

**标准格式**：

```json
{
  "@timestamp": "2024-01-01T00:00:00.000Z",
  "level": "ERROR",
  "logger": "com.example.OrderService",
  "message": "订单创建失败",
  "thread": "http-nio-8080-exec-1",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "service": "order-service",
  "environment": "production",
  "host": "server-001",
  "application": {
    "name": "order-service",
    "version": "1.0.0"
  },
  "error": {
    "type": "BusinessException",
    "message": "库存不足",
    "stackTrace": "..."
  },
  "context": {
    "orderId": "123456",
    "userId": "789",
    "productId": "100"
  }
}
```

### 7.2 自定义 JSON 日志

```java
@Slf4j
@Component
public class StructuredLogger {
    
    public void logOrderCreated(Order order) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("event", "order_created");
        logData.put("orderId", order.getId());
        logData.put("userId", order.getUserId());
        logData.put("amount", order.getAmount());
        logData.put("status", order.getStatus());
        
        log.info(marker("ORDER"), "{}", toJson(logData));
    }
    
    public void logError(String operation, Throwable error, Map<String, Object> context) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("event", "error");
        logData.put("operation", operation);
        logData.put("error", Map.of(
            "type", error.getClass().getSimpleName(),
            "message", error.getMessage(),
            "stackTrace", getStackTrace(error)
        ));
        logData.putAll(context);
        
        log.error(marker("ERROR"), "{}", toJson(logData), error);
    }
}
```

---

## 8. TraceId/SpanId 日志关联

### 8.1 MDC 自动注入

**Logback MDC**：

```java
@Component
public class TraceIdFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                         FilterChain chain) throws IOException, ServletException {
        
        // 从 OTel 获取 TraceId 和 SpanId
        Span span = Span.current();
        SpanContext spanContext = span.getSpanContext();
        
        // 注入 MDC
        MDC.put("traceId", spanContext.getTraceId());
        MDC.put("spanId", spanContext.getSpanId());
        
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

### 8.2 日志输出

```java
@Service
@Slf4j
public class OrderService {
    
    public Order createOrder(OrderDTO dto) {
        // TraceId 和 SpanId 自动输出到日志
        log.info("开始创建订单：userId={}, amount={}", dto.getUserId(), dto.getAmount());
        
        Order order = saveOrder(dto);
        
        log.info("订单创建成功：orderId={}", order.getId());
        
        return order;
    }
}
```

**日志输出**：

```
2024-01-01 00:00:00.000 INFO [4bf92f3577b34da6a3ce929d0e0e4736,00f067aa0ba902b7] com.example.OrderService - 开始创建订单：userId=1, amount=100.00
```

---

## 9. Kibana 日志检索与可视化

### 9.1 Kibana 部署

```yaml
version: '3'
services:
  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
      - ELASTICSEARCH_USERNAME=elastic
      - ELASTICSEARCH_PASSWORD=changeme
```

### 9.2 创建索引模式

```
1. Kibana UI → Stack Management → Index Patterns
2. 点击 "Create index pattern"
3. 输入模式：logs-*
4. 选择时间字段：@timestamp
5. 点击 "Create index pattern"
```

### 9.3 日志检索

**KQL（Kibana Query Language）**：

```
# 基础查询
level: ERROR

# 组合查询
level: ERROR AND service: order-service

# 范围查询
@timestamp >= "2024-01-01" AND @timestamp < "2024-01-02"

# 通配符
message: *库存不足*

# 存在性
traceId: *

# 排除
NOT level: DEBUG
```

**Lucene 查询**：

```
# 精确匹配
traceId:"4bf92f3577b34da6a3ce929d0e0e4736"

# 模糊匹配
message:订单~2

# 范围查询
response_time:[100 TO 500]

# 布尔查询
level:ERROR AND (service:order-service OR service:user-service)
```

### 9.4 可视化

**创建可视化**：

```
1. Kibana → Visualize → Create visualization
2. 选择类型：
   - Line Chart（趋势图）
   - Bar Chart（柱状图）
   - Pie Chart（饼图）
   - Data Table（数据表）
3. 配置指标和聚合
4. 保存
```

**示例：错误日志趋势**：

```
Visualization Type: Line Chart
Y-Axis: Count
X-Axis: Date Histogram (@timestamp, interval: 1h)
Filters: level: ERROR
```

---

## 10. 索引生命周期管理（ILM）

### 10.1 ILM 策略

**创建策略**：

```json
PUT _ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_size": "50GB",
            "max_age": "1d",
            "max_docs": 10000000
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

### 10.2 应用策略

```json
PUT logs-000001
{
  "aliases": {
    "logs": {
      "is_write_index": true
    }
  },
  "settings": {
    "index.lifecycle.name": "logs-policy",
    "index.lifecycle.rollover_alias": "logs"
  }
}
```

---

## 11. 日志告警配置（ElastAlert）

### 11.1 ElastAlert 配置

**config.yaml**：

```yaml
rules_folder: /etc/elastalert/rules
run_every:
  minutes: 1

buffer_time:
  minutes: 15

es_host: elasticsearch
es_port: 9200

writeback_index: elastalert_status
writeback_alias: elastalert_alerts

alert_time_limit:
  days: 2
```

### 11.2 告警规则

**rules/error_spike.yaml**：

```yaml
name: Error Spike Alert
type: spike
index: logs-*

# 查询条件
filter:
  - term:
      level: "ERROR"

# 阈值配置
threshold_ref: 2
spike_height: 2
spike_type: "up"
timeframe:
  minutes: 5

# 告警方式
alert:
  - "email"
  - "dingtalk"

# 邮件配置
email:
  - "ops@example.com"

# 钉钉配置
dingtalk_webhook: "https://oapi.dingtalk.com/robot/send?access_token=xxx"
dingtalk_msgtype: "markdown"

# 告警内容
alert_subject: "错误日志激增告警"
alert_text: |
  服务: {service}
  时间: {timestamp}
  错误数: {num_hits}
  
  最近错误日志:
  {logs}
```

---

## 12. Trace-Metric-Log 三大信号联动分析

### 12.1 关联查询

**从 Trace 查日志**：

```
1. SkyWalking → 查看 Trace
2. 复制 TraceId：4bf92f3577b34da6a3ce929d0e0e4736
3. Kibana → Discover
4. 查询：traceId:"4bf92f3577b34da6a3ce929d0e0e4736"
5. 查看相关日志
```

**从日志查 Trace**：

```
1. Kibana → 发现错误日志
2. 点击日志，查看 traceId
3. SkyWalking → 输入 traceId 查询
4. 查看完整调用链
```

**从指标查日志**：

```
1. Grafana → 发现 P99 延迟突增
2. 查看时间范围：2024-01-01 10:00-10:05
3. Kibana → 查询该时间范围的日志
4. 分析慢请求原因
```

### 12.2 统一 Dashboard

**Grafana + Elasticsearch 数据源**：

```yaml
# Grafana 数据源配置
apiVersion: 1
datasources:
  - name: Elasticsearch-Logs
    type: elasticsearch
    access: proxy
    url: http://elasticsearch:9200
    database: "[logs-]YYYY.MM.DD"
    jsonData:
      timeField: "@timestamp"
      esVersion: "8.0.0"
      interval: Daily
```

**创建联动 Dashboard**：

```
Panel 1: Prometheus 指标（QPS）
Panel 2: Elasticsearch 错误日志数量
Panel 3: SkyWalking 链路追踪（通过变量关联）

点击 Panel 1 某个时间点 → 自动过滤 Panel 2 和 Panel 3 的时间范围
```

### 12.3 根因分析流程

```
1. 告警触发：P99 延迟 > 1秒

2. 查看指标（Grafana）：
   - 确认延迟突增时间：10:00-10:05
   - 查看 QPS：正常
   - 查看错误率：5%

3. 查看日志（Kibana）：
   - 时间过滤：10:00-10:05
   - level: ERROR
   - 发现大量"数据库连接超时"

4. 查看链路（SkyWalking）：
   - 查询慢 Trace
   - 发现 MySQL 查询耗时 5秒
   - SQL: SELECT * FROM orders WHERE status=?

5. 根因：
   - status 字段未建索引
   - 导致全表扫描

6. 解决方案：
   - CREATE INDEX idx_status ON orders(status);
```

---

## 13. 统一可观测性平台搭建

### 13.1 完整架构

```
应用服务（Spring Boot）
    ↓
OTel Agent / SDK
    ├─ Traces → OTel Collector → Jaeger / SkyWalking
    ├─ Metrics → OTel Collector → Prometheus
    └─ Logs → Filebeat → Logstash → Elasticsearch
    
可视化层：
    ├─ SkyWalking UI（链路追踪）
    ├─ Grafana（指标监控 + 统一 Dashboard）
    └─ Kibana（日志检索）

告警层：
    ├─ Prometheus Alertmanager
    ├─ ElastAlert
    └─ SkyWalking Alarm
```

### 13.2 Docker Compose 完整部署

```yaml
version: '3'
services:
  # 链路追踪
  skywalking-oap:
    image: apache/skywalking-oap-server:9.5.0
  
  skywalking-ui:
    image: apache/skywalking-ui:9.5.0
  
  # 指标监控
  prometheus:
    image: prom/prometheus:v2.45.0
  
  grafana:
    image: grafana/grafana:10.0.0
  
  # 日志系统
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
  
  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
  
  filebeat:
    image: docker.elastic.co/beats/filebeat:8.10.0
  
  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
  
  # OTel Collector
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.91.0
```

---

## 14. Grafana Loki vs ELK 对比

### 14.1 功能对比

| 功能 | ELK | Grafana Loki |
|------|-----|--------------|
| **架构复杂度** | 高 | 低 |
| **资源消耗** | 高 | 低 |
| **全文检索** | ✅ 强大 | ⚠️ 有限 |
| **标签查询** | ⚠️ 有限 | ✅ 强大 |
| **与 Grafana 集成** | ⚠️ 需配置 | ✅ 原生 |
| **存储成本** | 高 | 低 |
| **查询性能** | 快 | 较快 |

### 14.2 Loki 架构

```
应用服务
    ↓
Promtail（日志采集）
    ↓
Loki（日志存储）
    ├─ Distributor
    ├─ Ingester
    └─ Querier
    ↓
对象存储（S3/MinIO）
    ↑
Grafana（查询与可视化）
```

### 14.3 选型建议

**选择 ELK**：
- ✅ 需要强大的全文检索
- ✅ 复杂的日志分析
- ✅ 已有 ELK 技术栈

**选择 Loki**：
- ✅ 与 Grafana/Prometheus 集成
- ✅ 资源受限
- ✅ 主要基于标签查询
- ✅ 云原生环境

---

## 15. 日志采集性能优化

### 15.1 Filebeat 优化

```yaml
# 批量发送
output.elasticsearch:
  bulk_max_size: 2048
  worker: 4
  compression_level: 3

# 队列配置
queue.mem:
  events: 4096
  flush.min_events: 512
  flush.timeout: 1s
```

### 15.2 Logstash 优化

```yaml
# pipeline.yml
pipeline.workers: 8
pipeline.batch.size: 1000
pipeline.batch.delay: 50
```

### 15.3 Elasticsearch 优化

```json
PUT _cluster/settings
{
  "persistent": {
    "indices.memory.index_buffer_size": "20%",
    "thread_pool.write.queue_size": 1000
  }
}
```

---

## 16. 日志分析最佳实践

### 16.1 日志规范

**1. 统一日志格式**：JSON 结构化日志

**2. 必备字段**：
- timestamp
- level
- message
- traceId/spanId
- service
- host

**3. 上下文信息**：
- 业务ID（orderId/userId）
- 操作类型
- 错误详情

**4. 敏感信息脱敏**：
```java
log.info("用户登录：userId={}, phone={}", userId, maskPhone(phone));
```

### 16.2 日志级别使用

```
ERROR：严重错误，需要立即处理
WARN：警告信息，需要关注
INFO：关键业务流程
DEBUG：调试信息（生产禁用）
TRACE：详细追踪（开发环境）
```

### 16.3 监控告警

**关键指标**：
- 错误日志数量
- 特定错误类型
- 日志量突增
- 慢查询日志

---

## 17. 面试要点

**Q1：ELK 的核心组件有哪些？**

Elasticsearch（存储）、Logstash（处理）、Kibana（可视化），通常还包括 Filebeat（采集）。

**Q2：如何实现日志与链路追踪关联？**

在日志中输出 TraceId 和 SpanId，在 Kibana 中通过 TraceId 查询相关日志。

**Q3：ILM 的作用是什么？**

索引生命周期管理，自动管理索引的不同阶段（Hot/Warm/Cold/Delete），优化存储成本。

**Q4：ELK 和 Loki 如何选择？**

ELK：强大的全文检索和复杂分析；Loki：轻量级、与 Grafana 集成好、成本低。

**Q5：如何优化 Elasticsearch 性能？**

- 合理分片
- 批量写入
- 定期归档旧数据
- 使用 ILM
- 优化查询

---

## 18. 参考资料

**官方文档**：
- [Elasticsearch 官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Logstash 官方文档](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Kibana 官方文档](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Filebeat 官方文档](https://www.elastic.co/guide/en/beats/filebeat/current/index.html)

---

**下一章预告**：第 37 章是本系列最后一章，将系统总结微服务架构综合面试题，涵盖组件选型、原理深入、场景分析、架构设计、实战问题、对比分析等6大类120道面试题。

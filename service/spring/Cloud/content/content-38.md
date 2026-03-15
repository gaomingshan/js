# 第38章：分布式日志分析 - ELK

> **本章目标**：掌握 ELK 完整部署，理解日志收集与分析流程，能够实现日志与链路关联，优化日志存储与检索

---

## 1. ELK 架构设计

### 1.1 核心组件

**Elasticsearch**：
- 分布式搜索引擎
- 日志存储与检索
- 基于 Lucene
- RESTful API

**Logstash**：
- 日志收集与处理
- 数据解析与转换
- 数据过滤与增强
- 多种输入输出插件

**Kibana**：
- 数据可视化
- 日志检索与分析
- Dashboard 展示
- 告警管理

**Filebeat**：
- 轻量级日志采集器
- 低资源占用
- 可靠传输
- 背压处理

---

### 1.2 整体架构

```
┌──────────────────────────────────────────────────┐
│              微服务应用                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Service A │  │Service B │  │Service C │        │
│  │ Logback  │  │ Logback  │  │ Logback  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼─────────────┼─────────────┼──────────────┘
        │ JSON        │ JSON        │ JSON
        ↓             ↓             ↓
┌──────────────────────────────────────────────────┐
│              Filebeat (采集器)                    │
│  - 监控日志文件                                    │
│  - 读取新增日志                                    │
│  - 发送到 Logstash                                │
└────────────────────┬─────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────┐
│              Logstash (处理器)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Input   │→ │  Filter  │→ │  Output  │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│  - 解析 JSON    - 字段提取    - 写入 ES            │
│  - 多行合并     - 数据转换    - 批量发送           │
└────────────────────┬─────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────┐
│           Elasticsearch (存储)                    │
│  ┌──────────┬──────────┬──────────┐              │
│  │  Node 1  │  Node 2  │  Node 3  │  (集群)      │
│  └──────────┴──────────┴──────────┘              │
│  - 索引管理   - 分片副本   - 数据检索              │
└────────────────────┬─────────────────────────────┘
                     ↑
┌────────────────────┴─────────────────────────────┐
│              Kibana (可视化)                      │
│  - Discover (日志检索)                            │
│  - Dashboard (可视化面板)                         │
│  - Dev Tools (开发工具)                           │
└──────────────────────────────────────────────────┘
```

---

## 2. Elasticsearch 集群部署

### 2.1 Docker Compose 部署

**docker-compose.yml**：
```yaml
version: '3.8'

services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false  # 简化配置，生产环境建议启用
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - es01-data:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - elastic

  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - es02-data:/usr/share/elasticsearch/data
    networks:
      - elastic

  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - es03-data:/usr/share/elasticsearch/data
    networks:
      - elastic

volumes:
  es01-data:
  es02-data:
  es03-data:

networks:
  elastic:
    driver: bridge
```

**启动集群**：
```bash
docker-compose up -d

# 验证集群状态
curl http://localhost:9200/_cluster/health?pretty
```

**集群健康状态**：
```json
{
  "cluster_name" : "es-cluster",
  "status" : "green",  // green: 健康, yellow: 部分可用, red: 不可用
  "number_of_nodes" : 3,
  "number_of_data_nodes" : 3,
  "active_primary_shards" : 5,
  "active_shards" : 10
}
```

---

### 2.2 单节点部署

**适用场景**：开发测试环境

```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -e "xpack.security.enabled=false" \
  -v es-data:/usr/share/elasticsearch/data \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

---

### 2.3 索引管理

**创建索引模板**：
```bash
curl -X PUT "http://localhost:9200/_index_template/logs-template" \
-H 'Content-Type: application/json' \
-d '{
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
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "application": { "type": "keyword" },
        "traceId": { "type": "keyword" },
        "spanId": { "type": "keyword" },
        "thread": { "type": "keyword" },
        "logger": { "type": "keyword" },
        "message": { "type": "text" },
        "stack_trace": { "type": "text" }
      }
    }
  }
}'
```

**查看索引**：
```bash
# 查看所有索引
curl http://localhost:9200/_cat/indices?v

# 查看索引详情
curl http://localhost:9200/logs-2024.01.15?pretty
```

---

## 3. Logstash 日志收集与解析

### 3.1 Logstash 部署

**docker-compose.yml**：
```yaml
services:
  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: logstash
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml
    ports:
      - "5044:5044"  # Filebeat 输入
      - "9600:9600"  # API 端口
    environment:
      - "LS_JAVA_OPTS=-Xms512m -Xmx512m"
    networks:
      - elastic
    depends_on:
      - es01
```

---

### 3.2 Pipeline 配置

**logstash/pipeline/logs.conf**：
```ruby
input {
  # 接收 Filebeat 数据
  beats {
    port => 5044
    codec => json
  }
  
  # 直接接收 TCP 日志
  tcp {
    port => 5000
    codec => json_lines
  }
}

filter {
  # 解析 JSON 日志
  if [message] =~ /^\{/ {
    json {
      source => "message"
      target => "parsed"
    }
    
    # 提取字段
    mutate {
      add_field => {
        "application" => "%{[parsed][application]}"
        "level" => "%{[parsed][level]}"
        "traceId" => "%{[parsed][traceId]}"
        "spanId" => "%{[parsed][spanId]}"
        "thread" => "%{[parsed][thread]}"
        "logger" => "%{[parsed][logger]}"
      }
      remove_field => ["parsed"]
    }
  }
  
  # 解析时间戳
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }
  
  # 添加地理位置（如果有 IP）
  if [clientIp] {
    geoip {
      source => "clientIp"
      target => "geoip"
    }
  }
  
  # 过滤掉心跳日志
  if [logger] =~ /actuator/ or [uri] =~ /actuator/ {
    drop { }
  }
  
  # 数据清洗
  mutate {
    # 删除不需要的字段
    remove_field => ["host", "agent", "ecs", "input"]
    # 字段重命名
    rename => { "message" => "log_message" }
  }
}

output {
  # 输出到 Elasticsearch
  elasticsearch {
    hosts => ["http://es01:9200"]
    index => "logs-%{[application]}-%{+YYYY.MM.dd}"
    document_type => "_doc"
  }
  
  # 调试输出（可选）
  # stdout {
  #   codec => rubydebug
  # }
}
```

---

### 3.3 Grok 模式匹配

**解析自定义格式日志**：
```ruby
filter {
  grok {
    match => {
      "message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{DATA:traceId}\] \[%{DATA:thread}\] %{LOGLEVEL:level} %{DATA:logger} - %{GREEDYDATA:log_message}"
    }
  }
}
```

**示例日志**：
```
2024-01-15 10:30:45.123 [TID:123.456.789] [http-nio-8080-exec-1] INFO com.example.OrderController - 创建订单成功
```

**解析结果**：
```json
{
  "timestamp": "2024-01-15 10:30:45.123",
  "traceId": "TID:123.456.789",
  "thread": "http-nio-8080-exec-1",
  "level": "INFO",
  "logger": "com.example.OrderController",
  "log_message": "创建订单成功"
}
```

---

## 4. Filebeat 轻量级采集

### 4.1 Filebeat 部署

**docker-compose.yml**：
```yaml
services:
  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    container_name: filebeat
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./logs:/logs:ro  # 应用日志目录
    command: filebeat -e -strict.perms=false
    networks:
      - elastic
    depends_on:
      - logstash
```

---

### 4.2 Filebeat 配置

**filebeat/filebeat.yml**：
```yaml
# 输入配置
filebeat.inputs:
  # 监控文件
  - type: log
    enabled: true
    paths:
      - /logs/order-service/*.log
      - /logs/user-service/*.log
    
    # 字段添加
    fields:
      application: order-service
      env: prod
    fields_under_root: true
    
    # JSON 解析
    json.keys_under_root: true
    json.add_error_key: true
    
    # 多行合并（异常堆栈）
    multiline.pattern: '^\d{4}-\d{2}-\d{2}'
    multiline.negate: true
    multiline.match: after
    
    # 排除文件
    exclude_files: ['\.gz$']

  # Docker 容器日志
  - type: container
    enabled: true
    paths:
      - /var/lib/docker/containers/*/*.log
    
    # 容器过滤
    processors:
      - add_docker_metadata:
          host: "unix:///var/run/docker.sock"
      - decode_json_fields:
          fields: ["message"]
          target: ""
          overwrite_keys: true

# 处理器
processors:
  - drop_event:
      when:
        regexp:
          message: "actuator|health|metrics"

# 输出到 Logstash
output.logstash:
  hosts: ["logstash:5044"]
  bulk_max_size: 2048
  worker: 2
  compression_level: 3

# 直接输出到 Elasticsearch（可选）
# output.elasticsearch:
#   hosts: ["http://es01:9200"]
#   index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"

# 日志配置
logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
```

---

### 4.3 启动 Filebeat

```bash
docker-compose up -d filebeat

# 查看日志
docker logs -f filebeat

# 验证连接
curl http://localhost:5066/stats?pretty
```

---

## 5. Spring Boot 日志集成

### 5.1 Logback 配置

**logback-spring.xml**：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 引入 Spring Boot 默认配置 -->
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    
    <!-- 属性定义 -->
    <springProperty scope="context" name="applicationName" source="spring.application.name"/>
    <property name="LOG_FILE" value="logs/${applicationName}/${applicationName}.log"/>
    <property name="LOG_PATTERN" value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%tid] [%thread] %-5level %logger{36} - %msg%n"/>
    
    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
            <layout class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.TraceIdPatternLogbackLayout">
                <pattern>${LOG_PATTERN}</pattern>
            </layout>
        </encoder>
    </appender>
    
    <!-- 文件输出 - JSON 格式 -->
    <appender name="FILE_JSON" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 每天滚动 -->
            <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <!-- 保留 30 天 -->
            <maxHistory>30</maxHistory>
            <!-- 单个文件最大 100MB -->
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        
        <!-- JSON 格式编码器 -->
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"application":"${applicationName}","env":"${ENV:-dev}"}</customFields>
            <includeMdcKeyName>traceId</includeMdcKeyName>
            <includeMdcKeyName>spanId</includeMdcKeyName>
            <fieldNames>
                <timestamp>@timestamp</timestamp>
                <version>[ignore]</version>
                <levelValue>[ignore]</levelValue>
            </fieldNames>
        </encoder>
    </appender>
    
    <!-- 异步输出 -->
    <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
        <discardingThreshold>0</discardingThreshold>
        <queueSize>512</queueSize>
        <appender-ref ref="FILE_JSON"/>
    </appender>
    
    <!-- 根日志配置 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ASYNC_FILE"/>
    </root>
    
    <!-- 特定包日志级别 -->
    <logger name="com.example" level="DEBUG"/>
    <logger name="org.springframework.web" level="INFO"/>
    <logger name="org.hibernate" level="WARN"/>
</configuration>
```

---

### 5.2 依赖配置

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Logback JSON 编码器 -->
    <dependency>
        <groupId>net.logstash.logback</groupId>
        <artifactId>logstash-logback-encoder</artifactId>
        <version>7.4</version>
    </dependency>
    
    <!-- SkyWalking Logback 插件（TraceId） -->
    <dependency>
        <groupId>org.apache.skywalking</groupId>
        <artifactId>apm-toolkit-logback-1.x</artifactId>
        <version>9.3.0</version>
    </dependency>
</dependencies>
```

---

### 5.3 JSON 日志格式

**日志输出示例**：
```json
{
  "@timestamp": "2024-01-15T10:30:45.123+08:00",
  "application": "order-service",
  "env": "prod",
  "level": "INFO",
  "thread": "http-nio-8080-exec-1",
  "logger": "com.example.controller.OrderController",
  "message": "创建订单成功",
  "traceId": "123.456.789",
  "spanId": "789",
  "method": "createOrder",
  "class": "com.example.controller.OrderController",
  "line": 45
}
```

---

## 6. TraceId 日志关联

### 6.1 SkyWalking TraceId 集成

**自动注入 TraceId**：
```xml
<!-- logback-spring.xml -->
<encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
    <layout class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.TraceIdPatternLogbackLayout">
        <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%tid] [%thread] %-5level %logger{36} - %msg%n</pattern>
    </layout>
</encoder>
```

**%tid 占位符**：自动替换为 SkyWalking TraceId

---

### 6.2 MDC 手动传递

**在代码中设置 TraceId**：
```java
import org.slf4j.MDC;

@Component
public class TraceIdFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        try {
            // 从请求头获取 TraceId
            String traceId = ((HttpServletRequest) request).getHeader("X-Trace-Id");
            
            if (traceId == null) {
                // 生成新的 TraceId
                traceId = UUID.randomUUID().toString().replace("-", "");
            }
            
            // 设置到 MDC
            MDC.put("traceId", traceId);
            
            // 设置到响应头
            ((HttpServletResponse) response).setHeader("X-Trace-Id", traceId);
            
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

**在 Feign 中传递**：
```java
@Component
public class FeignTraceInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        String traceId = MDC.get("traceId");
        if (traceId != null) {
            template.header("X-Trace-Id", traceId);
        }
    }
}
```

---

### 6.3 Kibana 查询链路日志

**通过 TraceId 查询**：
```
Kibana → Discover → 搜索框输入：
traceId: "123.456.789"
```

**时间范围过滤**：
```
traceId: "123.456.789" AND @timestamp >= "2024-01-15T10:00:00" AND @timestamp <= "2024-01-15T11:00:00"
```

**多条件查询**：
```
traceId: "123.456.789" AND level: "ERROR"
```

---

## 7. Kibana 日志检索与可视化

### 7.1 Kibana 部署

**docker-compose.yml**：
```yaml
services:
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://es01:9200
      - I18N_LOCALE=zh-CN  # 中文界面
    networks:
      - elastic
    depends_on:
      - es01
```

**访问**：
```
http://localhost:5601
```

---

### 7.2 索引模式创建

**步骤**：
```
1. Kibana → Management → Stack Management → Index Patterns
2. Create index pattern
3. Index pattern name: logs-*
4. Time field: @timestamp
5. Create index pattern
```

---

### 7.3 Discover 日志检索

**KQL 查询语法**：

**基础查询**：
```
# 查询特定应用
application: "order-service"

# 查询错误日志
level: "ERROR"

# 查询特定时间段
@timestamp >= "2024-01-15T10:00:00" AND @timestamp <= "2024-01-15T11:00:00"
```

**通配符查询**：
```
# 模糊匹配
message: *exception*

# 前缀匹配
logger: com.example.*
```

**范围查询**：
```
# 响应时间大于1秒
duration > 1000
```

**组合查询**：
```
application: "order-service" AND level: "ERROR" AND message: *timeout*
```

**排除查询**：
```
NOT message: *actuator*
```

---

### 7.4 Dashboard 创建

**常用可视化类型**：

**1. 日志趋势图**：
```
Visualization: Area/Line
Data Source: logs-*
Metrics: Count
Buckets: Date Histogram (@timestamp, interval: auto)
```

**2. 日志级别分布**：
```
Visualization: Pie Chart
Data Source: logs-*
Metrics: Count
Buckets: Terms (field: level)
```

**3. Top 10 错误日志**：
```
Visualization: Data Table
Data Source: logs-*
Filter: level: "ERROR"
Metrics: Count
Buckets: Terms (field: logger, size: 10)
```

**4. 应用日志量对比**：
```
Visualization: Vertical Bar
Data Source: logs-*
Metrics: Count
Buckets: 
  - Date Histogram (@timestamp)
  - Split Series: Terms (application)
```

**5. 响应时间热力图**：
```
Visualization: Heat Map
Data Source: logs-*
Metrics: Average (duration)
Buckets:
  - X-axis: Date Histogram (@timestamp)
  - Y-axis: Terms (uri)
```

---

## 8. 索引生命周期管理（ILM）

### 8.1 ILM 策略配置

**创建 ILM 策略**：
```bash
curl -X PUT "http://localhost:9200/_ilm/policy/logs-policy" \
-H 'Content-Type: application/json' \
-d '{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "50gb"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "3d",
        "actions": {
          "forcemerge": {
            "max_num_segments": 1
          },
          "shrink": {
            "number_of_shards": 1
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "7d",
        "actions": {
          "set_priority": {
            "priority": 0
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'
```

**阶段说明**：
- **Hot**：活跃数据，每天滚动或达到 50GB
- **Warm**：3天后，合并段、缩小分片
- **Cold**：7天后，降低优先级
- **Delete**：30天后删除

---

### 8.2 应用 ILM 策略

**创建索引模板**：
```bash
curl -X PUT "http://localhost:9200/_index_template/logs-template" \
-H 'Content-Type: application/json' \
-d '{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "logs"
    }
  }
}'
```

**创建初始索引**：
```bash
curl -X PUT "http://localhost:9200/logs-000001" \
-H 'Content-Type: application/json' \
-d '{
  "aliases": {
    "logs": {
      "is_write_index": true
    }
  }
}'
```

---

### 8.3 查看 ILM 状态

```bash
# 查看策略
curl http://localhost:9200/_ilm/policy/logs-policy?pretty

# 查看索引 ILM 状态
curl http://localhost:9200/logs-*/_ilm/explain?pretty

# 手动触发 rollover
curl -X POST "http://localhost:9200/logs/_rollover"
```

---

## 9. 日志告警配置

### 9.1 ElastAlert 部署

**docker-compose.yml**：
```yaml
services:
  elastalert:
    image: jertel/elastalert2:2.12.0
    container_name: elastalert
    volumes:
      - ./elastalert/config:/opt/elastalert/config
      - ./elastalert/rules:/opt/elastalert/rules
    networks:
      - elastic
    depends_on:
      - es01
```

---

### 9.2 告警规则配置

**config/elastalert.yaml**：
```yaml
# 连接 Elasticsearch
es_host: es01
es_port: 9200

# 规则目录
rules_folder: /opt/elastalert/rules

# 运行间隔
run_every:
  minutes: 1

# 查询时间窗口
buffer_time:
  minutes: 15

# 告警索引
writeback_index: elastalert_status
writeback_alias: elastalert_alerts
```

**rules/error-rate-alert.yaml**：
```yaml
# 规则名称
name: High Error Rate Alert

# 规则类型
type: frequency

# 索引
index: logs-*

# 查询条件
filter:
  - term:
      level: "ERROR"

# 触发条件：5分钟内超过10次错误
num_events: 10
timeframe:
  minutes: 5

# 告警方式
alert:
  - email
  - slack

# 邮件配置
email:
  - "oncall@example.com"

# Slack 配置
slack_webhook_url: "https://hooks.slack.com/services/xxx"
slack_username_override: "ElastAlert"
slack_channel_override: "#alerts"

# 告警内容
alert_subject: "服务 {0} 错误率过高"
alert_subject_args:
  - application

alert_text: |
  应用: {0}
  错误数: {1}
  时间范围: {2}
  
alert_text_args:
  - application
  - num_hits
  - "@timestamp"

# 聚合字段
aggregation:
  hours: 1

# 真实告警
realert:
  minutes: 30
```

**rules/response-time-alert.yaml**：
```yaml
name: High Response Time Alert

type: metric_aggregation

index: logs-*

filter:
  - range:
      duration:
        gte: 1000  # 响应时间 >= 1秒

metric_agg_key: duration
metric_agg_type: avg

# 平均响应时间超过2秒
max_threshold: 2000

timeframe:
  minutes: 5

alert:
  - email

email:
  - "dev@example.com"

alert_subject: "接口 {0} 响应时间过长"
alert_subject_args:
  - uri
```

---

### 9.3 Kibana Alerting

**创建告警规则**：
```
1. Kibana → Stack Management → Rules and Connectors
2. Create rule
3. 选择规则类型：
   - Logs threshold
   - ES query
   - Index threshold
4. 配置条件与动作
5. Save
```

**示例：错误日志告警**：
```
Rule type: Logs threshold
Index: logs-*
Condition: 
  - level is ERROR
  - Count >= 10 in the last 5 minutes
Actions:
  - Send email
  - Post to Slack
```

---

## 10. 日志采集性能优化

### 10.1 Filebeat 优化

**批量配置**：
```yaml
# filebeat.yml
output.logstash:
  bulk_max_size: 2048  # 每批最大事件数
  worker: 4            # 并发工作线程
  compression_level: 3 # 压缩级别 (0-9)
  pipelining: 2        # 管道数量
```

**内存优化**：
```yaml
queue.mem:
  events: 4096        # 内存队列大小
  flush.min_events: 512
  flush.timeout: 1s
```

---

### 10.2 Logstash 优化

**管道配置**：
```yaml
# logstash.yml
pipeline.workers: 4           # 工作线程数
pipeline.batch.size: 125      # 批大小
pipeline.batch.delay: 50      # 批延迟（毫秒）
```

**JVM 优化**：
```bash
# 启动参数
LS_JAVA_OPTS="-Xms2g -Xmx2g"
```

**输出优化**：
```ruby
output {
  elasticsearch {
    hosts => ["http://es01:9200"]
    index => "logs-%{+YYYY.MM.dd}"
    workers => 2
    flush_size => 500
    idle_flush_time => 1
  }
}
```

---

### 10.3 Elasticsearch 优化

**写入优化**：
```bash
curl -X PUT "http://localhost:9200/logs-*/_settings" \
-H 'Content-Type: application/json' \
-d '{
  "index": {
    "refresh_interval": "30s",       # 刷新间隔
    "number_of_replicas": 0,         # 写入时临时设为0
    "translog.durability": "async",  # 异步事务日志
    "translog.sync_interval": "5s"
  }
}'
```

**批量索引**：
```bash
# 使用 _bulk API
curl -X POST "http://localhost:9200/_bulk" \
-H 'Content-Type: application/x-ndjson' \
--data-binary @bulk-data.json
```

---

## 11. ELK vs EFK

### 11.1 EFK 架构

**Fluentd 替代 Logstash**：
- 更轻量（Ruby vs JRuby）
- 内存占用更低
- 插件生态丰富
- 云原生（CNCF 项目）

**架构对比**：
```
ELK: Application → Filebeat → Logstash → Elasticsearch → Kibana
EFK: Application → Fluentd → Elasticsearch → Kibana
```

---

### 11.2 对比分析

| 维度 | Logstash | Fluentd |
|------|----------|---------|
| **语言** | JRuby | Ruby + C |
| **内存** | 高（JVM） | 低 |
| **CPU** | 高 | 低 |
| **插件** | 200+ | 500+ |
| **配置** | 复杂 | 简单 |
| **性能** | 中 | 高 |
| **社区** | Elastic | CNCF |
| **适用场景** | 复杂转换 | 云原生、K8s |

---

### 11.3 选型建议

**选择 ELK**：
- 已有 Elastic Stack 生态
- 需要复杂的日志处理与转换
- 团队熟悉 Logstash

**选择 EFK**：
- Kubernetes 环境
- 追求轻量级
- 多数据源聚合
- 云原生架构

---

## 12. 日志分析最佳实践

### 12.1 日志规范

**日志级别**：
- **TRACE**：最细粒度，调试专用
- **DEBUG**：调试信息
- **INFO**：关键流程信息
- **WARN**：潜在问题
- **ERROR**：错误，需要处理

**日志内容**：
```java
// 好的日志
log.info("创建订单成功, orderId={}, userId={}, amount={}", orderId, userId, amount);

// 不好的日志
log.info("创建订单成功");
log.info("订单ID:" + orderId);  // 避免字符串拼接
```

---

### 12.2 结构化日志

**使用 JSON 格式**：
```json
{
  "@timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "message": "创建订单成功",
  "context": {
    "orderId": "123456",
    "userId": "789",
    "amount": 99.99
  }
}
```

**好处**：
- 易于检索
- 易于解析
- 易于聚合统计

---

### 12.3 日志采样

**高流量场景**：
```java
// 采样率：10%
if (ThreadLocalRandom.current().nextInt(100) < 10) {
    log.info("高频操作日志, key={}", key);
}
```

---

### 12.4 敏感信息脱敏

**配置脱敏规则**：
```ruby
# Logstash filter
filter {
  mutate {
    gsub => [
      "message", "\d{15,19}", "****",        # 银行卡号
      "message", "\d{11}", "138****5678",    # 手机号
      "message", "password=\S+", "password=***"  # 密码
    ]
  }
}
```

---

## 13. 学习自检清单

- [ ] 理解 ELK 架构（Elasticsearch/Logstash/Kibana/Filebeat）
- [ ] 掌握 Elasticsearch 集群部署
- [ ] 掌握索引模板与 ILM 配置
- [ ] 掌握 Logstash Pipeline 配置
- [ ] 掌握 Grok 模式匹配
- [ ] 掌握 Filebeat 日志采集
- [ ] 掌握 Spring Boot Logback JSON 配置
- [ ] 理解 TraceId 日志关联机制
- [ ] 掌握 Kibana Discover 检索
- [ ] 掌握 Kibana Dashboard 设计
- [ ] 掌握 ElastAlert 告警配置
- [ ] 能够优化日志采集性能
- [ ] 了解 ELK vs EFK 区别

---

## 14. 面试高频题

**Q1：ELK 与 EFK 的区别？**

**参考答案**：
- **组件**：ELK 使用 Logstash，EFK 使用 Fluentd
- **性能**：Fluentd 更轻量，内存占用更低
- **场景**：ELK 适合复杂处理，EFK 适合云原生/K8s
- **社区**：Logstash 属于 Elastic，Fluentd 属于 CNCF

**Q2：如何实现日志与链路追踪关联？**

**参考答案**：
1. 在日志中记录 TraceId（SkyWalking/Sleuth）
2. 使用 MDC 或 %tid 占位符
3. JSON 格式日志包含 traceId 字段
4. Kibana 通过 traceId 查询日志
5. 关联 SkyWalking UI 与 Kibana

**Q3：如何优化 Elasticsearch 写入性能？**

**参考答案**：
1. **批量写入**：使用 _bulk API
2. **调整刷新间隔**：refresh_interval 设为 30s
3. **减少副本**：写入时 replicas=0
4. **异步事务日志**：translog.durability=async
5. **合理分片**：分片数 = 节点数 × (1~3)
6. **索引生命周期**：使用 ILM 自动管理

**Q4：Logstash vs Filebeat？**

**参考答案**：
- **Logstash**：功能强大、资源占用高、适合复杂处理
- **Filebeat**：轻量级、资源占用低、适合日志采集
- **最佳实践**：Filebeat 采集 → Logstash 处理 → ES 存储

---

**本章小结**：
- ELK 架构：Elasticsearch 存储、Logstash 处理、Kibana 可视化、Filebeat 采集
- Elasticsearch：集群部署、索引管理、ILM 生命周期
- Logstash：Pipeline 配置、Grok 解析、数据转换
- Filebeat：轻量级采集、多行合并、容器日志
- Spring Boot：Logback JSON 配置、TraceId 关联
- Kibana：Discover 检索、Dashboard 设计、告警规则
- 性能优化：批量写入、采集优化、存储优化
- 最佳实践：日志规范、结构化日志、敏感信息脱敏
- ELK vs EFK：Logstash vs Fluentd 选型

**恭喜完成微服务可观测性三件套学习！🎉**

**下一章预告**：第39章 - 微服务架构综合面试题

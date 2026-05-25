# 第 36 章：日志体系 - Grafana Loki

> **学习目标**：掌握 Loki 完整部署与 Label 设计、理解 Loki 低成本日志存储原理、能够使用 LogQL 进行日志检索与分析、掌握 Trace-Metric-Log 三信号联动分析能力、能够搭建 LGTM 统一可观测性平台
> **预计时长**：4-5 小时
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. Loki 架构设计

### 1.1 Grafana Loki 简介

**Grafana Loki**：受 Prometheus 启发的日志聚合系统，专为低成本、标签驱动和 Grafana 集成设计。

**核心设计哲学**：
- ✅ **索引低成本**：只索引 Label（元数据），不索引日志正文
- ✅ **标签驱动**：与 Prometheus 指标标签模型一致
- ✅ **对象存储优先**：日志正文以 chunk 形式存入 S3/MinIO/GCS
- ✅ **与 Grafana 深度集成**：在 Grafana 中直接搜索、过滤和可视化日志
- ✅ **LogQL**：类 PromQL 的日志查询语言
- ✅ **TraceId 原生关联**：通过 OTLP / Label 自动关联 Tempo 链路

### 1.2 架构组件

```
日志来源
    ├─ Spring Boot 应用（Logback JSON → 文件）
    ├─ Docker / K8s（容器日志）
    └─ OTel Collector（OTLP Logs）
        │ Push
        ↓
┌─────────────────────────────────────┐
│           Grafana Loki               │
│                                      │
│  Distributor（分发层）               │
│    ├─ 接收日志流                     │
│    ├─ 校验合法性                     │
│    ├─ 按 Label 哈希路由到 Ingester   │
│    └─ 速率限制与背压                  │
│  Ingester（写入层）                  │
│    ├─ 构建日志流（Log Stream）       │
│    ├─ 压缩为 Chunk（gzip/zstd）       │
│    └─ 定期刷写 Chunk 到对象存储       │
│  Querier（查询层）                   │
│    ├─ 接收 Grafana / LogQL 查询       │
│    ├─ 同时查询 Ingester + 对象存储   │
│    └─ 合并去重返回结果                │
│  Compactor（压缩层）                 │
│    ├─ 合并旧 Chunk                    │
│    └─ 去重日志条目                    │
│  Ruler（告警规则评估）               │
│    ├─ 持续评估 LogQL 告警规则        │
│    └─ 将告警发送到 Grafana Alerting   │
└─────────────────────────────────────┘
        │ 写入 / 读取
        ↓
    对象存储（S3 / MinIO / GCS / Azure Blob）
```

### 1.3 三种部署模式

| 模式 | 适用场景 | 说明 |
|------|---------|------|
| **单机模式（Monolithic）** | 开发/测试/小规模 | 所有组件打包在一个进程中 |
| **微服务模式（Scalable）** | 生产（中等-大规模） | 读写路径分离，独立扩缩 |
| **简单可扩展模式（Simple Scalable）** | 生产（推荐） | Read/Write/Backend 三种角色分离 |

---

## 2. Loki 核心设计哲学

### 2.1 与 Prometheus 一致的 Label 模型

```
# Prometheus 时间序列
http_requests_total{service="order-service", method="GET"} 12345 @1704067200

# Loki 日志流（Log Stream）
{service="order-service", env="production"} |  |  |
                                             日志行1 日志行2 日志行3
```

Loki 中一个日志流由**唯一的一组 Label 键值对**标识。日志正文本身不被索引，Loki 在查询时按流读取并实时过滤。

### 2.2 为什么不索引日志正文

| 对比 | Elasticsearch（全文索引） | Loki（Label 索引） |
|------|--------------------------|---------------------|
| **索引大小** | 原文的 100-200%（倒排索引） | 原文的 <1%（仅 Label） |
| **写入延迟** | 中（需要建索引） | **低**（直接压缩写入） |
| **全文搜索** | **极快**（索引命中） | 较慢（需扫描 Chunk，但可并行） |
| **存储成本** | 高（昂贵的 SSD + 索引膨胀） | **低**（对象存储 + 无索引膨胀） |
| **标签过滤查询** | 有限 | **极快**（与 Prometheus 同模型） |

---

## 3. Loki 服务端部署

### 3.1 单机模式

**loki-config.yaml**：

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

common:
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory
  replication_factor: 1

ingester:
  chunk_idle_period: 5m
  chunk_retain_period: 30s
  max_chunk_age: 1h
  chunk_target_size: 1536000
  chunk_encoding: snappy

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: loki_index_
        period: 24h

storage_config:
  filesystem:
    directory: /tmp/loki/chunks
  tsdb_shipper:
    active_index_directory: /tmp/loki/tsdb-index
    cache_location: /tmp/loki/tsdb-cache

limits_config:
  allow_structured_metadata: true
  volume_enabled: true
```

**Docker 启动**：

```bash
docker run -d --name loki \
  -p 3100:3100 \
  -v $(pwd)/loki-config.yaml:/etc/loki/config.yaml \
  grafana/loki:latest \
  -config.file=/etc/loki/config.yaml
```

### 3.2 生产部署（Simple Scalable 模式）

```
Read 节点 × N     Write 节点 × M     Backend 节点 × K
(Querier)          (Distributor       (Compactor + Ruler
 + Query Frontend   + Ingester)        + Index Gateway)
```

**Docker Compose（Simple Scalable）**：

```yaml
version: '3'
services:
  # Write 路径：接收 + 写入
  loki-write:
    image: grafana/loki:latest
    volumes:
      - ./loki-write.yaml:/etc/loki/config.yaml
    ports:
      - "3100:3100"
    command: ["-config.file=/etc/loki/config.yaml", "-target=write"]

  # Read 路径：查询
  loki-read:
    image: grafana/loki:latest
    volumes:
      - ./loki-read.yaml:/etc/loki/config.yaml
    command: ["-config.file=/etc/loki/config.yaml", "-target=read"]

  # Backend：压缩 + 告警评估
  loki-backend:
    image: grafana/loki:latest
    volumes:
      - ./loki-backend.yaml:/etc/loki/config.yaml
    command: ["-config.file=/etc/loki/config.yaml", "-target=backend"]

  # 对象存储
  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: loki
      MINIO_ROOT_PASSWORD: loki123
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data

volumes:
  minio-data:
```

### 3.3 对象存储配置

```yaml
# 以 S3 为例
storage_config:
  aws:
    s3: s3://ap-east-1
    bucketnames: loki-logs
    access_key_id: ${AWS_ACCESS_KEY_ID}
    secret_access_key: ${AWS_SECRET_ACCESS_KEY}

# 以 MinIO 为例
storage_config:
  s3:
    endpoint: minio:9000
    bucketnames: loki-logs
    access_key_id: ${MINIO_ACCESS_KEY}
    secret_access_key: ${MINIO_SECRET_KEY}
    insecure: true
    s3forcepathstyle: true
```

---

## 4. 日志采集：OTel Collector & Promtail & Grafana Alloy

### 4.1 OTel Collector → Loki（OTLP 路径）

```yaml
# otel-collector-config.yaml
exporters:
  otlphttp/loki:
    endpoint: "http://loki:3100/otlp"
    tls:
      insecure: true

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch, resource]
      exporters: [otlphttp/loki]
```

### 4.2 Promtail（标签驱动采集，推荐）

**promtail-config.yaml**：

```yaml
server:
  http_listen_port: 9080

clients:
  - url: http://loki:3100/loki/api/v1/push

positions:
  filename: /tmp/positions.yaml

scrape_configs:
  # Spring Boot 应用日志
  - job_name: spring-boot-logs
    static_configs:
      - targets:
          - localhost
        labels:
          service: order-service
          env: production
          __path__: /var/log/app/*.json

    # JSON 日志解析
    pipeline_stages:
      - json:
          expressions:
            level: level
            message: message
            trace_id: trace_id
            span_id: span_id
            logger: logger
      - labels:
          level:
          trace_id:
      - timestamp:
          source: "@timestamp"
          format: RFC3339
```

**Docker 部署 Promtail**：

```yaml
services:
  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./promtail-config.yaml:/etc/promtail/config.yaml
      - /var/log/app:/var/log/app:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: ["-config.file=/etc/promtail/config.yaml"]
```

### 4.3 Grafana Alloy（新一代采集器，推荐未来使用）

```alloy
// config.alloy — Grafana Alloy 配置
logging {
  level = "info"
}

prometheus.scrape "spring_boot" {
  targets = [
    {"__address__" = "order-service:8080"},
  ]
  forward_to = [prometheus.remote_write.mimir.receiver]
}

prometheus.remote_write "mimir" {
  endpoint {
    url = "http://mimir:9009/api/v1/push"
  }
}

loki.source.file "app_logs" {
  targets {
    __path__ = "/var/log/app/*.json"
    labels = {
      service = "order-service",
      env     = "production",
    }
  }
  forward_to = [loki.write.default.receiver]
}

loki.write "default" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}
```

---

## 5. Spring Boot 日志集成（JSON 结构化日志）

### 5.1 Logback 配置（输出 JSON + OTLP）

**logback-spring.xml**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 控制台：可读格式 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} %level [%X{trace_id},%X{span_id}] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 文件：JSON 格式 → Promtail 采集 → Loki -->
    <appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>/var/log/app/application.json</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>/var/log/app/application.%d{yyyy-MM-dd}.json</fileNamePattern>
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"service":"order-service","env":"production"}</customFields>
            <includeMdcKeyName>trace_id</includeMdcKeyName>
            <includeMdcKeyName>span_id</includeMdcKeyName>
        </encoder>
    </appender>

    <!-- OTLP 日志附加器（直接推送 → OTel Collector → Loki） -->
    <appender name="OTLP" class="io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender">
        <captureExperimentalAttributes>true</captureExperimentalAttributes>
        <captureKeyValuePairAttributes>true</captureKeyValuePairAttributes>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="JSON_FILE"/>
        <appender-ref ref="OTLP"/>
    </root>
</configuration>
```

### 5.2 添加依赖

```xml
<dependencies>
    <!-- JSON 日志编码器 -->
    <dependency>
        <groupId>net.logstash.logback</groupId>
        <artifactId>logstash-logback-encoder</artifactId>
        <version>7.4</version>
    </dependency>
    <!-- OTel Logback Appender（直接推送 OTLP Logs） -->
    <dependency>
        <groupId>io.opentelemetry.instrumentation</groupId>
        <artifactId>opentelemetry-logback-appender-1.0</artifactId>
        <version>2.2.0-alpha</version>
    </dependency>
</dependencies>
```

### 5.3 结构化 JSON 日志格式

```json
{
  "@timestamp": "2024-01-01T10:00:00.123Z",
  "level": "ERROR",
  "logger": "com.example.OrderService",
  "message": "订单创建失败：库存不足",
  "thread": "http-nio-8080-exec-1",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "service": "order-service",
  "env": "production",
  "error": {
    "type": "BusinessException",
    "message": "库存不足",
    "stack_trace": "com.example.BusinessException: 库存不足\n\tat ..."
  },
  "context": {
    "order_id": "123456",
    "user_id": "789",
    "product_id": "100"
  }
}
```

---

## 6. Label 设计与最佳实践

### 6.1 Label 设计原则

| 原则 | 说明 | 示例 |
|------|------|------|
| **静态标签少而精** | 仅用于分区和过滤的元数据 | `service`、`env`、`cluster` |
| **动态标签慎用** | 可能导致日志流爆炸 | ❌ `user_id`、❌ `request_id` |
| **全文搜索用 LogQL** | 日志正文内容用 LogQL filter | `|= "ERROR"`、`|~ "timeout"` |
| **模仿 Prometheus 标签** | 与 Metrics 标签对齐方便关联 | `service="order-service"` |

### 6.2 静态标签 vs 动态标签

```yaml
# ✅ 好的 Label 设计
scrape_configs:
  - job_name: app-logs
    static_configs:
      - targets:
          - localhost
        labels:
          service: order-service  # 静态：服务名
          env: production         # 静态：环境
          cluster: cn-east        # 静态：集群
          __path__: /var/log/app/*.json

# ❌ 坏的 Label 设计（高基数）
        # labels:
        #   user_id: ${USER_ID}     # 动态！百万用户 = 百万日志流
        #   request_id: ${REQ_ID}    # 动态！每个请求不同
```

### 6.3 Promtail Pipeline 提取 Label

```yaml
pipeline_stages:
  # Stage 1：解析 JSON
  - json:
      expressions:
        level: level
        trace_id: trace_id
        service: service

  # Stage 2：将低基数字段提升为 Label
  - labels:
      level:      # ✅ 低基数（INFO/WARN/ERROR）
      service:    # ✅ 低基数（几十个微服务）

  # Stage 3：高基数字段留在日志正文中（用 LogQL 搜索）
  # trace_id 不提升为 Label，通过 structured_metadata 存储
  - structured_metadata:
      trace_id:   # ⚠️ 高基数但需关联查询 → structured_metadata
```

---

## 7. LogQL 查询语言

### 7.1 Log Pipeline（日志管道）

```logql
# 基础：选择日志流
{service="order-service"}

# 标签过滤
{service="order-service", env="production"}

# 标签正则匹配
{service=~"order-.*", env="production"}

# ========== 管道操作符 ==========

# 行过滤器（|= 包含，!= 不包含）
{service="order-service"} |= "ERROR"

# 正则过滤器（|~ 匹配，!~ 不匹配）
{service="order-service"} |~ "(?i)timeout|connection\\s+refused"

# JSON 解析 + 字段过滤
{service="order-service"}
  | json
  | level = "ERROR"

# 解析 logfmt
{service="order-service"}
  | logfmt
  | duration > 1s

# 多个管道组合
{service="order-service"}
  |= "ERROR"
  | json
  | context_order_id = "123456"
  | line_format "{{.message}} (userId: {{.context_user_id}})"
```

### 7.2 Metric Query（指标查询）

```logql
# 统计错误日志速率（每分钟）
rate({service="order-service"} |= "ERROR" [5m])

# 统计各服务日志量
sum by(service) (rate({env="production"} [5m]))

# 统计日志级别分布
sum by(level) (count_over_time({service="order-service"} | json | unwrap level [5m]))

# P99 日志行长度（需要 unwrap 数值）
quantile_over_time(0.99,
  {service="order-service"} | json | unwrap response_time [5m]
)

# 错误日志占比
sum(rate({service="order-service"} |= "ERROR" [5m]))
  /
sum(rate({service="order-service"} [5m])) * 100
```

### 7.3 Grafana 中的 LogQL 使用

```
1. Grafana → Explore
2. 数据源选择 "Loki"
3. 输入 LogQL：
   {service="order-service"} |= "ERROR" | json
4. 时间范围：Last 1 hour
5. 点击 "Run query"
6. 结果展示为日志行列表，点击单行展开详情
7. 切换到 "Metrics" 视图：查看 rate() 或 count_over_time() 图表
```

---

## 8. Grafana 中日志检索、过滤与实时追踪

### 8.1 配置 Grafana Loki 数据源

**Grafana → Connections → Data sources → Add data source → Loki**

```yaml
datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    jsonData:
      # Loki → Tempo 关联
      derivedFields:
        - name: trace_id
          matcherRegex: "trace_id\":\"(\\w+)\""
          datasourceUid: tempo         # 关联 Tempo 数据源
          url: "$${__value.raw}"
        - name: span_id
          matcherRegex: "span_id\":\"(\\w+)\""
          datasourceUid: tempo
```

### 8.2 日志过滤面板

```
Grafana Dashboard → Add Panel → Loki 数据源

Panel 1：错误日志计数
  LogQL: sum(rate({service=~"$service", env="production"} |= "ERROR" [$__rate_interval]))
  Type: Time Series

Panel 2：日志级别分布
  LogQL: sum by(level) (count_over_time({service=~"$service"} | json | unwrap level [$__interval]))
  Type: Bar Chart

Panel 3：最近错误日志
  LogQL: {service=~"$service"} |= "ERROR"
  Type: Logs
  Options: Time (descending), Max Lines: 50
```

### 8.3 实时日志追踪（Live Tail）

```
Grafana → Explore → Loki → 输入 LogQL → 点击 "Live" 按钮

功能：
- 实时流式显示日志（类似 tail -f）
- 支持 LogQL 过滤
- 暂停/恢复
- 从特定时间点开始
```

---

## 9. TraceId 日志关联（Loki → Tempo 联动）

### 9.1 Derived Fields 自动关联

配置 Derived Fields 后，Grafana 自动识别 Loki 日志中的 `trace_id` 字段，生成可点击的链接跳转到 Tempo。

```yaml
# grafana.ini 或 datasource 配置
- name: Loki
  jsonData:
    derivedFields:
      - name: trace_id
        matcherRegex: '"trace_id":"(\\w+)"'
        datasourceUid: tempo
        url: '$${__value.raw}'   # 点击跳转到 Tempo Trace 视图
```

### 9.2 交叉查询流程

```
问题：用户反馈订单创建超时

Step 1 — 从 Metric 入手（Grafana + Mimir）：
  查看 order-service P99 延迟突增面板
  定位到异常时间窗：10:23-10:28

Step 2 — 从日志定位（Grafana + Loki）：
  LogQL: {service="order-service"} |= "ERROR"
  时间范围：10:23-10:28
  找到关键错误日志：trace_id = 4bf92f...

Step 3 — 从 Trace 深挖（Grafana + Tempo）：
  点击日志旁的 Tempo 链接
  打开完整 Trace 瀑布图
  发现 checkout 服务 MySQL 慢查询导致整体超时

Step 4 — 根因修复：
  对慢 SQL 添加索引
```

---

## 10. 日志解析

### 10.1 Pattern Parser

```logql
# 非结构化日志 → 提取字段
{service="nginx"}
  | pattern "<ip> - - <_> \"<method> <url> <_>\" <status> <size> \"<_>\" \"<user_agent>\" <response_time>"
  | method = "POST"
  | status >= 400
  | response_time > 1
```

### 10.2 JSON Parser

```logql
{service="order-service"}
  | json
  | level = "ERROR"
  | line_format "{{.message}} [orderId: {{.context_order_id}}]"
```

### 10.3 Regexp Parser

```logql
{service="java-app"}
  | regexp `(?P<timestamp>\S+)\s+(?P<level>\w+)\s+\[(?P<trace_id>\w+),(?P<span_id>\w+)\]\s+(?P<logger>\S+)\s+-\s+(?P<message>.*)`
  | level = "ERROR"
```

### 10.4 Unpack Parser

```logql
# 处理 Logback LogstashEncoder 输出的 JSON
{service="order-service"}
  | unpack
  | level = "ERROR"
```

---

## 11. 日志保留策略与存储后端

### 11.1 保留策略

```yaml
# loki-config.yaml
ingester:
  chunk_idle_period: 30m      # chunk 闲置 30 分钟刷写
  max_chunk_age: 2h           # chunk 最长保留 2 小时后刷写
  chunk_target_size: 1536000  # 1.5MB chunk 刷写阈值

# 保留期配置（全局）
compactor:
  retention_enabled: true
  retention_delete_delay: 2h
  delete_request_store: s3

limits_config:
  retention_period: 720h      # 日志保留 30 天
  max_query_length: 30d       # 查询最大范围 30 天

# 按租户配置不同保留期
overrides:
  production:
    retention_period: 2160h   # 生产 90 天
  staging:
    retention_period: 168h    # 预发 7 天
  development:
    retention_period: 24h     # 开发 1 天
```

### 11.2 存储后端配置

```yaml
schema_config:
  configs:
    # 使用 TSDB 索引（推荐，v13 schema）
    - from: 2024-01-01
      store: tsdb
      object_store: s3         # 对象存储
      schema: v13
      index:
        prefix: loki_tsdb_index_
        period: 24h

storage_config:
  # TSDB 索引 Shipped 到对象存储
  tsdb_shipper:
    active_index_directory: /data/loki/tsdb-index
    cache_location: /data/loki/tsdb-cache
    cache_ttl: 24h

  # 对象存储（S3 示例）
  aws:
    s3: s3://ap-east-1
    bucketnames: loki-logs-prod
    sse_encryption: true
```

---

## 12. Ruler 日志告警配置

### 12.1 Loki Ruler 配置

Loki Ruler 持续评估 LogQL 规则，告警**直接发送到 Grafana Alerting**，无需 AlertManager。

```yaml
ruler:
  alertmanager_url: ""                  # 不使用外部 AlertManager
  enable_alertmanager_v2: false
  enable_api: true
  enable_sharding: true

  # 告警规则存储路径（可指向对象存储或本地）
  storage:
    type: local
    local:
      directory: /etc/loki/rules

  ring:
    kvstore:
      store: consul
```

### 12.2 告警规则

**/etc/loki/rules/fake/rules.yml**：

```yaml
groups:
  - name: application-logs
    rules:
      # 错误日志速率告警
      - alert: HighErrorLogRate
        expr: |
          sum(rate({env="production"} |= "ERROR" [5m])) by (service) > 10
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "{{ $labels.service }} 错误日志速率异常"
          description: "过去 5 分钟错误日志速率：{{ $value | printf \"%.1f\" }}/s"
          runbook_url: "https://wiki.internal.runbooks/error-alert"

      # 特定异常模式告警
      - alert: DatabaseConnectionTimeout
        expr: |
          sum(rate({env="production"} |~ "connection timeout|too many connections" [5m])) > 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "数据库连接超时告警"
          description: "发现数据库连接超时日志"

      # 日志量突增（可能是攻击或异常流量）
      - alert: LogVolumeSpike
        expr: |
          sum(rate({env="production"}[5m])) by (service)
            > 3 * sum(rate({env="production"}[1h] offset 2h)) by (service)
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.service }} 日志量异常突增"
```

---

## 13. 索引与 Chunk 存储优化

### 13.1 Query Frontend 查询加速

```yaml
query_frontend:
  max_outstanding_per_tenant: 2048

  # 查询结果缓存（Memcached / Redis）
  results_cache:
    cache:
      memcached_client:
        addresses: memcached:11211
        timeout: 500ms

  # 请求分片（并行查询大时间范围）
  split_queries_by_interval: 30m

  # 查询重试
  max_retries: 2
```

### 13.2 Index Gateway（大规模场景）

```yaml
# 为 Read 路径添加 Index Gateway，降低 Querier 直接扫描对象存储的压力
index_gateway:
  mode: ring
  ring:
    kvstore:
      store: consul
```

### 13.3 性能调优 Checklist

```yaml
# 写入路径优化
ingester:
  max_chunk_age: 2h              # 增大可减少刷写频率
  chunk_target_size: 3_000_000   # 增大 chunk 可减少对象存储请求数

# 查询路径优化
querier:
  max_concurrent: 20             # 增加并发度
  query_ingesters_within: 3h     # 限定查询 Ingester 的时间窗

# 缓存配置
query_range:
  results_cache:
    cache:
      memcached_client:
        addresses: memcached:11211
```

---

## 14. LGTM 三信号联动：Trace → Metric → Log 协同分析

### 14.1 联动配置总览

```
                    ┌──────────────┐
                    │   Grafana    │
                    │  (统一 UI)   │
                    └──────┬───────┘
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
  ┌─────────┐        ┌─────────┐        ┌──────────┐
  │  Loki   │◄─────►│  Tempo  │◄─────►│  Mimir   │
  │ (日志)  │TraceID│ (链路)  │Metric │ (指标)   │
  └─────────┘        └─────────┘Label  └──────────┘
       │                   │                   │
       │ OTLP              │ OTLP              │ remote write
       └───────────────────┴───────────────────┘
                           │
                    ┌──────┴──────┐
                    │OTel Collector│
                    └─────────────┘
```

### 14.2 联动实战案例

**场景**：生产环境 P99 延迟突然飙升至 3 秒

```
Step 1：Grafana Dashboard（Mimir 指标）
  ├─ 面板 "P99 Latency by Service" 显示 alert
  ├─ 点击时间点 10:25 钻取
  └─ 发现 order-service P99 = 3.2s

Step 2：Grafana → Loki（日志）
  ├─ LogQL: {service="order-service"} |= "ERROR" (10:20-10:30)
  ├─ 发现大量 "MySQL connection timeout" 错误
  ├─ 日志中 trace_id = abc123def456...
  └─ 点击 trace_id 旁的 Tempo 链接

Step 3：Grafana → Tempo（链路）
  ├─ 打开 Trace abc123def456...
  ├─ 瀑布图显示：
  │   order-service  (1.2s 正常)
  │   └─ MySQL SELECT (3.1s) ← 慢查询！
  ├─ Span 属性：db.statement = "SELECT * FROM orders WHERE status=? AND ..."
  └─ 判断：status 字段未建索引 → 全表扫描

Step 4：修复
  └─ CREATE INDEX idx_status ON orders(status);

Step 5：验证（回到 Mimir）
  ├─ 等待部署后 5 分钟
  └─ P99 Latency 面板恢复正常（<500ms）
```

### 14.3 统一 Dashboard 设计

```yaml
# LGTM 一体化 Dashboard 示例
dashboard:
  title: "服务全景可观测 - order-service"
  rows:
    - name: "RED 指标（Mimir）"
      panels:
        - title: QPS
          expr: sum(rate(http_requests_total{service="order-service"}[1m]))
        - title: Error Rate
          expr: sum(rate(http_requests_total{service="order-service",status=~"5.."}[1m]))
        - title: P99 Latency
          expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

    - name: "日志面板（Loki）"
      panels:
        - title: Error Logs Rate
          expr: sum(rate({service="order-service"} |= "ERROR" [5m]))
        - title: Recent Errors
          expr: '{service="order-service"} |= "ERROR"'
          type: logs

    - name: "链路面板（Tempo）"
      panels:
        - title: Service Graph
          type: nodeGraph
          datasource: Tempo
```

---

## 15. Grafana 统一可观测平台实战

### 15.1 完整 Docker Compose（LGTM + OTel）

```yaml
version: '3'
services:
  # ===== 数据采集层 =====
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.102.0
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317"
      - "4318:4318"

  # ===== 日志存储 =====
  loki:
    image: grafana/loki:latest
    volumes:
      - ./loki-config.yaml:/etc/loki/config.yaml
    ports:
      - "3100:3100"

  # ===== 链路存储 =====
  tempo:
    image: grafana/tempo:latest
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
    ports:
      - "3200:3200"

  # ===== 指标存储 =====
  mimir:
    image: grafana/mimir:latest
    volumes:
      - ./mimir.yaml:/etc/mimir.yaml
    ports:
      - "9009:9009"

  # ===== 统一可视化 =====
  grafana:
    image: grafana/grafana:latest
    environment:
      GF_AUTH_ANONYMOUS_ENABLED: "true"
    ports:
      - "3000:3000"
    volumes:
      - ./grafana-datasources.yaml:/etc/grafana/provisioning/datasources/datasources.yaml

volumes:
  minio-data:
```

### 15.2 Grafana 数据源配置

**grafana-datasources.yaml**：

```yaml
apiVersion: 1
datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    jsonData:
      derivedFields:
        - name: trace_id
          matcherRegex: '"trace_id":"(\w+)"'
          datasourceUid: tempo
          url: '$${__value.raw}'

  - name: Tempo
    type: tempo
    access: proxy
    url: http://tempo:3200
    uid: tempo
    jsonData:
      tracesToLogsV2:
        datasourceUid: loki
        spanStartTimeShift: "-1h"
        spanEndTimeShift: "1h"
        filterByTraceID: true
        tags: [{ key: "service.name", value: "service" }]

  - name: Mimir
    type: prometheus
    access: proxy
    url: http://mimir:9009/prometheus
    uid: mimir
    isDefault: true
    jsonData:
      httpMethod: POST
      prometheusType: Mimir
```

---

## 16. Loki vs ELK vs Grafana Cloud Logs 对比

| 维度 | Grafana Loki | Elasticsearch (ELK) | Grafana Cloud Logs |
|------|-------------|---------------------|--------------------|
| **索引方式** | 仅 Label 索引 | **全文索引** | 同 Loki |
| **全文搜索** | 较慢（Chunk 扫描） | **极快**（倒排索引） | 同 Loki + 托管优化 |
| **存储成本** | **低**（对象存储） | 高（SSD + 索引） | 按量付费 |
| **运维复杂度** | **低** | 高（集群管理） | **极低**（全托管） |
| **Grafana 集成** | **原生深度集成** | 需配置数据源 | **原生 + SaaS** |
| **查询语言** | **LogQL**（类 PromQL） | KQL / Lucene | LogQL |
| **水平扩展** | **天然支持** | 需手动管理分片 | 自动 |
| **多租户** | **原生支持**（X-Scope-OrgID） | Kibana Spaces | 按 Stack 隔离 |
| **适用场景** | LGTM / 云原生 / 成本敏感 | 复杂全文搜索 / 大数据分析 | 免运维 / 中小团队 |

**选型建议**：
- **LGTM 体系** → 选 Loki（标签模型一致，集成最紧密）
- **需要复杂全文搜索和聚合** → 选 ELK
- **不想运维任何基础设施** → 选 Grafana Cloud Logs

---

## 17. 面试要点

**Q1：Loki 为什么存储成本远低于 Elasticsearch？**

Loki 只索引 Label（元数据），不索引日志正文。日志正文经压缩后（gzip/zstd）以 chunk 形式直接写入对象存储（S3），省去了全文索引的巨大存储和内存开销。同等日志量下，Loki 存储成本约为 ELK 的 20-30%。

**Q2：如何在 Loki 中实现全文搜索？**

通过 LogQL 的行过滤操作符：`|=`（包含）、`|~`（正则匹配）。Loki Querier 并行扫描匹配的日志流 Chunk，在内存中实时过滤日志行。配合 Query Frontend 的分片和缓存，可以达到较好的搜索性能。

**Q3：LGTM 三信号联动的核心是什么？**

核心是 **Trace ID 作为关联键**：OTel 将同一个 Trace ID 同时注入 Loki 日志（作为属性）、Tempo Trace（作为存储键）和 Mimir 指标（作为 Exemplar）。Grafana 通过数据源的 derivedFields 和 tracesToLogs 配置实现跨信号一键跳转。

**Q4：什么字段应该设为 Loki Label？**

只有**低基数**的元数据字段应设为 Label：`service`（几十个微服务）、`env`（prod/staging/dev）、`level`（ERROR/WARN/INFO）。高基数字段（`trace_id`、`user_id`）应留在日志正文中，需要时用 LogQL filter 搜索，或通过 `structured_metadata` 存储以便关联但不建索引。

**Q5：Loki Ruler 和 Grafana Alerting 的关系？**

Loki Ruler 负责**持续评估 LogQL 规则**（如错误日志速率、特定日志模式），产生告警后自动发送到 Grafana Alerting。Grafana Alerting 统一管理来自 Loki + Mimir + Tempo 的所有告警，实现告警路由、静默、通知的集中管理。

---

## 18. 参考资料

**官方文档**：
- [Grafana Loki 官方文档](https://grafana.com/docs/loki/latest/)
- [LogQL 查询指南](https://grafana.com/docs/loki/latest/logql/)
- [Promtail 配置](https://grafana.com/docs/loki/latest/send-data/promtail/)
- [Grafana LGTM Stack 部署指南](https://grafana.com/docs/)

---

**下一章预告**：第 37 章将系统总结微服务架构综合面试题，涵盖组件选型、原理深入、场景分析、架构设计、实战问题、对比分析等 6 大类 120+ 道面试题。

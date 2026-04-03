# 第 34 章：分布式链路追踪 - SkyWalking

> **学习目标**：掌握 SkyWalking 完整部署、理解链路追踪核心原理、能够分析服务拓扑与性能瓶颈、能够配置告警与自定义监控  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. SkyWalking 架构设计（OAP/UI/Agent）

### 1.1 SkyWalking 简介

**Apache SkyWalking**：开源的 APM（Application Performance Monitoring）系统，专为微服务、云原生和容器化架构设计。

**核心能力**：
- ✅ 分布式链路追踪
- ✅ 服务拓扑图
- ✅ 性能指标监控
- ✅ 告警通知
- ✅ 日志分析
- ✅ 数据库监控

### 1.2 架构组件

```
SkyWalking Agent（探针）
    ├─ Java Agent
    ├─ .NET Agent
    ├─ Node.js Agent
    └─ Python Agent
    ↓
SkyWalking OAP（分析平台）
    ├─ Receiver（接收器）
    ├─ Aggregation（聚合）
    ├─ Analysis（分析）
    └─ Storage（存储）
    ↓
Storage（存储）
    ├─ Elasticsearch
    ├─ MySQL
    ├─ TiDB
    └─ BanyanDB
    ↓
SkyWalking UI（可视化界面）
    ├─ 服务拓扑
    ├─ 链路追踪
    ├─ 性能指标
    └─ 告警管理
```

### 1.3 数据流

```
应用服务
    ↓ Agent 拦截
Trace/Metrics/Logs
    ↓ gRPC/HTTP
OAP Server
    ├─ 实时聚合
    ├─ 数据分析
    └─ 持久化存储
    ↓
Elasticsearch/MySQL
    ↑ 查询
SkyWalking UI
```

---

## 2. SkyWalking 服务端部署（单机/集群）

### 2.1 单机部署

**下载 SkyWalking**：

```bash
# 下载 SkyWalking 9.5.0
wget https://dlcdn.apache.org/skywalking/9.5.0/apache-skywalking-apm-9.5.0.tar.gz

# 解压
tar -zxvf apache-skywalking-apm-9.5.0.tar.gz
cd apache-skywalking-apm-bin
```

**配置 OAP**（`config/application.yml`）：

```yaml
cluster:
  standalone:
    # 单机模式

core:
  default:
    # 服务名称
    restHost: ${SW_CORE_REST_HOST:0.0.0.0}
    restPort: ${SW_CORE_REST_PORT:12800}
    restContextPath: ${SW_CORE_REST_CONTEXT_PATH:/}
    
    # gRPC 配置
    gRPCHost: ${SW_CORE_GRPC_HOST:0.0.0.0}
    gRPCPort: ${SW_CORE_GRPC_PORT:11800}

storage:
  selector: ${SW_STORAGE:elasticsearch}
  elasticsearch:
    namespace: ${SW_NAMESPACE:"skywalking"}
    clusterNodes: ${SW_STORAGE_ES_CLUSTER_NODES:localhost:9200}
    protocol: ${SW_STORAGE_ES_HTTP_PROTOCOL:"http"}
    # 索引设置
    indexShardsNumber: ${SW_STORAGE_ES_INDEX_SHARDS_NUMBER:1}
    indexReplicasNumber: ${SW_STORAGE_ES_INDEX_REPLICAS_NUMBER:0}
    # 数据保留时间
    recordDataTTL: ${SW_STORAGE_ES_RECORD_DATA_TTL:7}  # 7天
    metricsDataTTL: ${SW_STORAGE_ES_METRICS_DATA_TTL:7}

receiver-sharing-server:
  default:

receiver-trace:
  default:
    bufferPath: ${SW_RECEIVER_BUFFER_PATH:../trace-buffer/}
    bufferOffsetMaxFileSize: ${SW_RECEIVER_BUFFER_OFFSET_MAX_FILE_SIZE:100}
    bufferDataMaxFileSize: ${SW_RECEIVER_BUFFER_DATA_MAX_FILE_SIZE:500}
    bufferFileCleanWhenRestart: ${SW_RECEIVER_BUFFER_FILE_CLEAN_WHEN_RESTART:false}
    sampleRate: ${SW_TRACE_SAMPLE_RATE:10000}  # 采样率（10000 = 100%）

receiver-otel:
  default:
    enabledHandlers: ${SW_OTEL_RECEIVER_ENABLED_HANDLERS:"oc"}  # 启用 OTel
    enabledOtelMetricsRules: ${SW_OTEL_RECEIVER_ENABLED_OTEL_METRICS_RULES:""}
```

**启动 OAP**：

```bash
# Linux/Mac
bin/oapService.sh

# Windows
bin\oapService.bat
```

**启动 UI**：

```bash
# Linux/Mac
bin/webappService.sh

# Windows
bin\webappService.bat
```

**访问 UI**：http://localhost:8080

### 2.2 集群部署

**配置集群模式**（`config/application.yml`）：

```yaml
cluster:
  selector: ${SW_CLUSTER:zookeeper}
  zookeeper:
    namespace: ${SW_NAMESPACE:"skywalking"}
    hostPort: ${SW_CLUSTER_ZK_HOST_PORT:localhost:2181}
    # Zookeeper 集群配置
    baseSleepTimeMs: ${SW_CLUSTER_ZK_SLEEP_TIME:1000}
    maxRetries: ${SW_CLUSTER_ZK_MAX_RETRIES:3}
```

**Docker Compose 集群部署**：

```yaml
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
  
  oap1:
    image: apache/skywalking-oap-server:9.5.0
    environment:
      - SW_STORAGE=elasticsearch
      - SW_STORAGE_ES_CLUSTER_NODES=elasticsearch:9200
      - SW_CLUSTER=zookeeper
      - SW_CLUSTER_ZK_HOST_PORT=zookeeper:2181
    ports:
      - "11800:11800"
      - "12800:12800"
    depends_on:
      - elasticsearch
      - zookeeper
  
  oap2:
    image: apache/skywalking-oap-server:9.5.0
    environment:
      - SW_STORAGE=elasticsearch
      - SW_STORAGE_ES_CLUSTER_NODES=elasticsearch:9200
      - SW_CLUSTER=zookeeper
      - SW_CLUSTER_ZK_HOST_PORT=zookeeper:2181
    ports:
      - "11801:11800"
      - "12801:12800"
    depends_on:
      - elasticsearch
      - zookeeper
  
  ui:
    image: apache/skywalking-ui:9.5.0
    environment:
      - SW_OAP_ADDRESS=http://oap1:12800,http://oap2:12800
    ports:
      - "8080:8080"
    depends_on:
      - oap1
      - oap2
  
  zookeeper:
    image: zookeeper:3.8
    ports:
      - "2181:2181"
```

---

## 3. 接收 OTel 数据（OTel Receiver 配置）

### 3.1 启用 OTel Receiver

**配置**（`config/application.yml`）：

```yaml
receiver-otel:
  default:
    enabledHandlers: ${SW_OTEL_RECEIVER_ENABLED_HANDLERS:"otlp-metrics,otlp-traces"}
    enabledOtelMetricsRules: ${SW_OTEL_RECEIVER_ENABLED_OTEL_METRICS_RULES:"oap,vm,k8s-node,k8s-cluster,k8s/*"}

receiver-sharing-server:
  default:
    restHost: ${SW_RECEIVER_SHARING_REST_HOST:0.0.0.0}
    restPort: ${SW_RECEIVER_SHARING_REST_PORT:12800}
    restContextPath: ${SW_RECEIVER_SHARING_REST_CONTEXT_PATH:/}
    gRPCHost: ${SW_RECEIVER_SHARING_GRPC_HOST:0.0.0.0}
    gRPCPort: ${SW_RECEIVER_SHARING_GRPC_PORT:11800}
```

### 3.2 应用配置 OTel

```yaml
# 使用 OTel Java Agent 发送数据到 SkyWalking
otel:
  exporter:
    otlp:
      endpoint: http://localhost:11800
      protocol: grpc
  
  resource:
    attributes:
      service.name: order-service
      service.namespace: production
```

### 3.3 OTel Collector 转发

**OTel Collector 配置**：

```yaml
exporters:
  otlp/skywalking:
    endpoint: skywalking-oap:11800
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/skywalking]
    
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/skywalking]
```

---

## 4. 链路追踪原理（TraceId/SpanId/Segment）

### 4.1 核心概念

**TraceId**：全局唯一标识一次请求链路

**Segment**：一个服务内的链路片段

**Span**：链路中的一个操作单元

**数据模型**：

```
Trace
  ├─ Segment 1（服务A）
  │    ├─ Span 1（HTTP请求）
  │    ├─ Span 2（数据库查询）
  │    └─ Span 3（Redis操作）
  │
  ├─ Segment 2（服务B）
  │    ├─ Span 1（HTTP请求）
  │    └─ Span 2（数据库查询）
  │
  └─ Segment 3（服务C）
       └─ Span 1（HTTP请求）
```

### 4.2 Agent 拦截原理

**字节码增强**：

```
SkyWalking Agent（基于 Byte Buddy）
    ↓
拦截目标方法
    ├─ HTTP请求/响应
    ├─ JDBC操作
    ├─ Redis操作
    ├─ Kafka消息
    └─ RPC调用
    ↓
创建 Span
    ├─ 开始时间
    ├─ 操作类型
    ├─ Tags（标签）
    └─ Logs（日志）
    ↓
上报到 OAP
```

### 4.3 跨服务传播

**HTTP Header 传播**：

```
请求 Header：
sw8: 1-MQ==-MQ==-3-bWVzaC1zdmM=-MS4yMzQ1Njc4OTAuMTIzNDU2Nzg5MC4xMjM0NTY3ODkwLjEyMzQ1Njc4OTA=-MS4xLjEuMS4xMjM0NTY3ODkw-MS4xMjM0NTY3ODkw-L2FwaS91c2Vycw==

解析：
- TraceId: 1-MQ==-MQ==-3
- ParentSegmentId: bWVzaC1zdmM=
- ParentSpanId: 0
- ...
```

---

## 5. 拓扑图与服务依赖分析

### 5.1 服务拓扑图

**查看拓扑**：

```
SkyWalking UI → Dashboard → Topology

显示内容：
- 服务节点
- 服务调用关系
- 调用次数
- 响应时间
- 错误率
```

**拓扑示例**：

```
[Gateway]
    ↓ 100 cpm, 50ms, 0.1% error
[Order Service]
    ├─ → [Inventory Service] (50 cpm, 30ms)
    ├─ → [Account Service] (50 cpm, 40ms)
    └─ → [MySQL] (100 cpm, 10ms)

[Inventory Service]
    └─ → [Redis] (100 cpm, 2ms)

[Account Service]
    └─ → [MySQL] (50 cpm, 15ms)
```

### 5.2 服务依赖分析

**依赖关系**：

```sql
-- 查询服务依赖（Elasticsearch）
GET /skywalking-service_relation-*/_search
{
  "query": {
    "match_all": {}
  }
}
```

**响应**：

```json
{
  "source": "order-service",
  "dest": "inventory-service",
  "componentId": 1,
  "latency": 30,
  "status": true,
  "cpm": 50
}
```

### 5.3 关键路径分析

**查找最慢的调用链**：

```
SkyWalking UI → Trace → Query

过滤条件：
- Duration: > 1000ms
- Service: order-service
- Endpoint: GET /api/orders

结果：
- TraceId: xxx
- 总耗时: 1234ms
- Spans: 15个
- 最慢操作: MySQL查询（800ms）
```

---

## 6. 慢调用定位与根因分析

### 6.1 慢调用查询

**查询慢Trace**：

```
SkyWalking UI → Trace → Query

条件：
- Min Duration: 1000ms
- Time Range: 最近1小时
- Service: order-service

排序：Duration DESC
```

### 6.2 Trace 详情分析

**Trace 视图**：

```
TraceId: 4bf92f3577b34da6a3ce929d0e0e4736
Total Duration: 1234ms

Timeline:
├─ [0-1234ms] GET /api/orders (order-service)
│   ├─ [10-50ms] Feign: GET /inventory/check (inventory-service)
│   ├─ [50-90ms] Feign: GET /account/balance (account-service)
│   ├─ [90-890ms] MySQL: SELECT * FROM orders WHERE user_id=? ← 慢！
│   └─ [890-900ms] Redis: SET order:123
│
├─ [10-50ms] GET /inventory/check (inventory-service)
│   └─ [20-45ms] Redis: GET inventory:100
│
└─ [50-90ms] GET /account/balance (account-service)
    └─ [60-85ms] MySQL: SELECT * FROM account WHERE user_id=?
```

### 6.3 根因分析

**分析步骤**：

```
1. 识别慢操作
   → MySQL 查询耗时 800ms

2. 查看 SQL 语句
   → SELECT * FROM orders WHERE user_id=?

3. 检查执行计划
   → EXPLAIN SELECT * FROM orders WHERE user_id=?
   → type: ALL（全表扫描）

4. 根因
   → user_id 字段未建索引

5. 解决方案
   → CREATE INDEX idx_user_id ON orders(user_id);
```

### 6.4 性能优化建议

**SkyWalking 自动分析**：

```
Performance Insight:
- 慢SQL检测
- 慢HTTP请求
- 高错误率接口
- 内存泄漏风险
```

---

## 7. 性能指标采集（响应时间/吞吐量/错误率）

### 7.1 服务指标

**查看服务指标**：

```
SkyWalking UI → Service → 选择服务 → Metrics

指标：
- Response Time（响应时间）
  - P99: 500ms
  - P95: 300ms
  - P50: 150ms
  - Avg: 200ms

- Throughput（吞吐量）
  - CPM: 1000（每分钟调用次数）

- Success Rate（成功率）
  - 99.9%

- SLA（服务等级协议）
  - 99.95%
```

### 7.2 端点指标

**查看端点指标**：

```
SkyWalking UI → Endpoint → 选择端点

端点：GET /api/orders

指标：
- Response Time: 150ms
- CPM: 500
- Success Rate: 99.8%
```

### 7.3 实例指标

**查看实例指标**：

```
SkyWalking UI → Instance → 选择实例

实例：order-service-001

指标：
- JVM CPU: 45%
- JVM Memory: 1.2GB / 2GB
- JVM GC Time: 50ms
- Thread Count: 120
```

### 7.4 数据库指标

**查看数据库指标**：

```
SkyWalking UI → Database → 选择数据库

数据库：MySQL-order-db

指标：
- Slow SQL Count: 10
- Average Response Time: 15ms
- Top 10 Slow SQLs
```

---

## 8. 告警规则配置与通知

### 8.1 告警规则配置

**配置文件**（`config/alarm-settings.yml`）：

```yaml
rules:
  # 服务响应时间告警
  service_resp_time_rule:
    metrics-name: service_resp_time
    op: ">"
    threshold: 1000  # 响应时间 > 1秒
    period: 10       # 检查周期：10分钟
    count: 3         # 连续3次触发
    silence-period: 5  # 静默期：5分钟
    message: "服务 {name} 响应时间过长"
  
  # 服务成功率告警
  service_sla_rule:
    metrics-name: service_sla
    op: "<"
    threshold: 9500  # 成功率 < 95%
    period: 10
    count: 2
    silence-period: 3
    message: "服务 {name} 成功率过低: {value}%"
  
  # 端点响应时间告警
  endpoint_resp_time_rule:
    metrics-name: endpoint_resp_time
    op: ">"
    threshold: 1000
    period: 10
    count: 2
    message: "端点 {name} 响应时间过长: {value}ms"
  
  # JVM 内存告警
  instance_jvm_memory_pool_heap_usage_rule:
    metrics-name: instance_jvm_memory_pool_heap_usage
    op: ">"
    threshold: 90  # 堆内存使用率 > 90%
    period: 10
    count: 3
    message: "实例 {name} 堆内存使用率过高: {value}%"
  
  # 数据库慢SQL告警
  database_access_resp_time_rule:
    metrics-name: database_access_resp_time
    threshold: 1000
    op: ">"
    period: 10
    count: 2
    message: "数据库 {name} 响应时间过长: {value}ms"

webhooks:
  - http://webhook.example.com/skywalking/alert

dingtalkHooks:
  - url: https://oapi.dingtalk.com/robot/send?access_token=xxx
    secret: SEC***

wechatHooks:
  - url: https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx

slackHooks:
  - url: https://hooks.slack.com/services/xxx
```

### 8.2 Webhook 告警

**实现 Webhook 接收器**：

```java
@RestController
@RequestMapping("/skywalking")
@Slf4j
public class SkyWalkingAlertController {
    
    @PostMapping("/alert")
    public void receiveAlert(@RequestBody List<AlarmMessage> alarmMessages) {
        for (AlarmMessage alarm : alarmMessages) {
            log.error("SkyWalking 告警：{}", alarm);
            
            // 处理告警
            handleAlert(alarm);
        }
    }
    
    private void handleAlert(AlarmMessage alarm) {
        // 1. 记录到数据库
        saveAlertToDb(alarm);
        
        // 2. 发送钉钉通知
        sendDingTalkNotification(alarm);
        
        // 3. 发送邮件
        sendEmailNotification(alarm);
        
        // 4. 创建工单
        createTicket(alarm);
    }
}

@Data
public class AlarmMessage {
    private int scopeId;
    private String scope;
    private String name;
    private String id0;
    private String id1;
    private String ruleName;
    private String alarmMessage;
    private long startTime;
}
```

### 8.3 钉钉告警

**钉钉机器人消息格式**：

```java
@Service
public class DingTalkNotifier {
    
    private final RestTemplate restTemplate;
    private final String webhookUrl = "https://oapi.dingtalk.com/robot/send?access_token=xxx";
    
    public void sendAlert(AlarmMessage alarm) {
        Map<String, Object> message = new HashMap<>();
        message.put("msgtype", "markdown");
        
        Map<String, String> markdown = new HashMap<>();
        markdown.put("title", "SkyWalking 告警");
        markdown.put("text", String.format(
            "### SkyWalking 告警通知\n\n" +
            "- **告警规则**：%s\n" +
            "- **服务名称**：%s\n" +
            "- **告警内容**：%s\n" +
            "- **触发时间**：%s\n" +
            "\n> 请及时处理！",
            alarm.getRuleName(),
            alarm.getName(),
            alarm.getAlarmMessage(),
            formatTime(alarm.getStartTime())
        ));
        
        message.put("markdown", markdown);
        
        restTemplate.postForEntity(webhookUrl, message, String.class);
    }
}
```

---

## 9. 自定义插件开发

### 9.1 插件开发基础

**创建自定义插件**：

```java
@PluginConfig(namespace = "custom-plugin")
public class CustomInstrumentation extends ClassInstanceMethodsEnhancePluginDefine {
    
    @Override
    protected ClassMatch enhanceClass() {
        // 指定要增强的类
        return NameMatch.byName("com.example.CustomService");
    }
    
    @Override
    public ConstructorInterceptPoint[] getConstructorsInterceptPoints() {
        return new ConstructorInterceptPoint[0];
    }
    
    @Override
    public InstanceMethodsInterceptPoint[] getInstanceMethodsInterceptPoints() {
        return new InstanceMethodsInterceptPoint[] {
            new InstanceMethodsInterceptPoint() {
                @Override
                public ElementMatcher<MethodDescription> getMethodsMatcher() {
                    // 指定要拦截的方法
                    return named("customMethod");
                }
                
                @Override
                public String getMethodsInterceptor() {
                    // 指定拦截器类
                    return "com.example.CustomMethodInterceptor";
                }
                
                @Override
                public boolean isOverrideArgs() {
                    return false;
                }
            }
        };
    }
}
```

**实现拦截器**：

```java
public class CustomMethodInterceptor implements InstanceMethodsAroundInterceptor {
    
    @Override
    public void beforeMethod(EnhancedInstance objInst, Method method, 
                             Object[] allArguments, Class<?>[] argumentsTypes,
                             MethodInterceptResult result) {
        // 方法执行前
        AbstractSpan span = ContextManager.createLocalSpan("customMethod");
        span.setComponent(new StringTag(1, "CustomComponent"));
        span.tag(new StringTag(0, "custom.tag"), "value");
    }
    
    @Override
    public Object afterMethod(EnhancedInstance objInst, Method method, 
                              Object[] allArguments, Class<?>[] argumentsTypes,
                              Object ret) {
        // 方法执行后
        ContextManager.stopSpan();
        return ret;
    }
    
    @Override
    public void handleMethodException(EnhancedInstance objInst, Method method,
                                       Object[] allArguments, Class<?>[] argumentsTypes,
                                       Throwable t) {
        // 异常处理
        AbstractSpan span = ContextManager.activeSpan();
        span.log(t);
        span.errorOccurred();
    }
}
```

---

## 10. SkyWalking vs Jaeger vs Zipkin 对比

### 10.1 功能对比

| 功能 | SkyWalking | Jaeger | Zipkin |
|------|------------|--------|--------|
| **链路追踪** | ✅ | ✅ | ✅ |
| **服务拓扑** | ✅ | ⚠️ 有限 | ❌ |
| **性能指标** | ✅ | ⚠️ 基础 | ❌ |
| **告警通知** | ✅ | ❌ | ❌ |
| **日志分析** | ✅ | ❌ | ❌ |
| **JVM监控** | ✅ | ❌ | ❌ |
| **数据库监控** | ✅ | ❌ | ❌ |
| **OTel支持** | ✅ | ✅ | ✅ |
| **Agent侵入** | 低 | 低 | 低 |
| **性能开销** | 低 | 低 | 低 |

### 10.2 存储对比

| 存储 | SkyWalking | Jaeger | Zipkin |
|------|------------|--------|--------|
| **Elasticsearch** | ✅ | ✅ | ✅ |
| **MySQL** | ✅ | ❌ | ✅ |
| **Cassandra** | ❌ | ✅ | ✅ |
| **Kafka** | ❌ | ✅ | ❌ |
| **自研存储** | ✅ BanyanDB | ❌ | ❌ |

### 10.3 使用场景

**SkyWalking**：
- ✅ 全功能 APM 需求
- ✅ 需要服务拓扑和告警
- ✅ Java 微服务架构

**Jaeger**：
- ✅ 专注链路追踪
- ✅ Kubernetes 环境
- ✅ 高性能要求

**Zipkin**：
- ✅ 轻量级需求
- ✅ 多语言支持
- ✅ 简单部署

---

## 11. 面试要点

**Q1：SkyWalking 的核心组件有哪些？**

- Agent：探针，负责数据采集
- OAP：分析平台，负责数据处理和存储
- UI：可视化界面，负责数据展示

**Q2：SkyWalking 如何实现跨服务追踪？**

通过在 HTTP Header 中传播 TraceId、SegmentId、SpanId 等信息。

**Q3：SkyWalking 和 Zipkin 的区别？**

SkyWalking 是全功能 APM，提供链路追踪、服务拓扑、告警等；Zipkin 专注于链路追踪。

**Q4：如何排查慢调用？**

1. 在 UI 中查询慢 Trace
2. 分析 Trace 详情，找到慢操作
3. 查看 SQL、HTTP 等具体调用
4. 优化对应代码或配置

**Q5：如何配置告警？**

编辑 `alarm-settings.yml`，配置告警规则、阈值、通知方式（Webhook/钉钉/邮件）。

---

## 12. 参考资料

**官方文档**：
- [SkyWalking 官方文档](https://skywalking.apache.org/docs/)
- [SkyWalking GitHub](https://github.com/apache/skywalking)

---

**下一章预告**：第 35 章将学习 Prometheus + Grafana 指标监控，包括 Prometheus 架构、OTel Metrics 导出、PromQL 查询语言、Grafana Dashboard 设计、JVM 监控面板等内容。

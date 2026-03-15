# 第36章：分布式链路追踪 - SkyWalking

> **本章目标**：深入理解 SkyWalking 链路追踪原理，掌握完整部署与配置，能够分析服务拓扑与性能瓶颈

---

## 1. SkyWalking 架构设计

### 1.1 核心组件

**OAP（Observability Analysis Platform）**：
- 数据接收与处理
- 数据聚合与分析
- 数据存储
- 告警规则执行

**UI（管理控制台）**：
- 拓扑图展示
- 链路追踪查询
- 性能指标展示
- 告警管理

**Agent（探针）**：
- 字节码增强
- 数据采集
- 数据上报

**存储（Storage）**：
- Elasticsearch（推荐）
- H2（测试）
- MySQL
- TiDB

---

### 1.2 整体架构

```
┌─────────────────────────────────────────┐
│         微服务应用                        │
│  ┌──────────┐  ┌──────────┐             │
│  │ Service A │  │ Service B │  ...       │
│  │ + Agent  │  │ + Agent  │             │
│  └────┬─────┘  └────┬─────┘             │
└───────┼─────────────┼───────────────────┘
        │             │
        │ gRPC/HTTP   │
        ↓             ↓
┌─────────────────────────────────────────┐
│            SkyWalking OAP               │
│  ┌──────────┐  ┌──────────┐            │
│  │ Receiver │  │ Analyzer │            │
│  └────┬─────┘  └────┬─────┘            │
│       │             │                   │
│       ↓             ↓                   │
│  ┌──────────────────────┐              │
│  │     Aggregator       │              │
│  └──────────┬───────────┘              │
└─────────────┼──────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Elasticsearch                    │
│  (存储 Trace、Metrics、Logs)             │
└─────────────────────────────────────────┘
              ↑
┌─────────────┼──────────────────────────┐
│    SkyWalking UI                        │
│  - 拓扑图  - 链路追踪  - 性能监控        │
└─────────────────────────────────────────┘
```

---

## 2. SkyWalking OAP 部署

### 2.1 单机部署

**下载安装**：
```bash
# 下载（以 9.3.0 为例）
wget https://archive.apache.org/dist/skywalking/9.3.0/apache-skywalking-apm-9.3.0.tar.gz

# 解压
tar -zxvf apache-skywalking-apm-9.3.0.tar.gz
cd apache-skywalking-apm-bin
```

**目录结构**：
```
apache-skywalking-apm-bin/
├── bin/                    # 启动脚本
│   ├── oapService.sh      # OAP 启动脚本
│   └── webappService.sh   # UI 启动脚本
├── config/                 # 配置文件
│   ├── application.yml    # OAP 配置
│   └── alarm-settings.yml # 告警配置
├── oap-libs/              # OAP 依赖
└── webapp/                # UI
```

---

### 2.2 Elasticsearch 存储配置

**安装 Elasticsearch**：
```bash
# Docker 方式
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  elasticsearch:7.17.0
```

**配置 OAP**：
```yaml
# config/application.yml
storage:
  selector: ${SW_STORAGE:elasticsearch}
  elasticsearch:
    nameSpace: ${SW_NAMESPACE:"skywalking"}
    clusterNodes: ${SW_STORAGE_ES_CLUSTER_NODES:localhost:9200}
    protocol: ${SW_STORAGE_ES_HTTP_PROTOCOL:"http"}
    trustStorePath: ${SW_STORAGE_ES_SSL_JKS_PATH:""}
    trustStorePass: ${SW_STORAGE_ES_SSL_JKS_PASS:""}
    user: ${SW_ES_USER:""}
    password: ${SW_ES_PASSWORD:""}
    secretsManagementFile: ${SW_ES_SECRETS_MANAGEMENT_FILE:""}
    dayStep: ${SW_STORAGE_DAY_STEP:1}
    indexShardsNumber: ${SW_STORAGE_ES_INDEX_SHARDS_NUMBER:1}
    indexReplicasNumber: ${SW_STORAGE_ES_INDEX_REPLICAS_NUMBER:0}
    bulkActions: ${SW_STORAGE_ES_BULK_ACTIONS:5000}
    flushInterval: ${SW_STORAGE_ES_FLUSH_INTERVAL:15}
    concurrentRequests: ${SW_STORAGE_ES_CONCURRENT_REQUESTS:2}
```

---

### 2.3 启动服务

**启动 OAP**：
```bash
# Linux/Mac
bin/oapService.sh

# Windows
bin/oapService.bat

# 查看日志
tail -f logs/skywalking-oap-server.log
```

**启动 UI**：
```bash
# Linux/Mac
bin/webappService.sh

# Windows
bin/webappService.bat

# 访问 UI
http://localhost:8080
```

**验证服务**：
```bash
# 检查 OAP 健康状态
curl http://localhost:12800/internal/l7check

# 检查 UI
curl http://localhost:8080
```

---

### 2.4 集群部署

**OAP 集群配置**：
```yaml
# config/application.yml
cluster:
  selector: ${SW_CLUSTER:nacos}
  nacos:
    serviceName: ${SW_SERVICE_NAME:"SkyWalking_OAP_Cluster"}
    hostPort: ${SW_CLUSTER_NACOS_HOST_PORT:localhost:8848}
    namespace: ${SW_CLUSTER_NACOS_NAMESPACE:"public"}
    username: ${SW_CLUSTER_NACOS_USERNAME:""}
    password: ${SW_CLUSTER_NACOS_PASSWORD:""}
    accessKey: ${SW_CLUSTER_NACOS_ACCESSKEY:""}
    secretKey: ${SW_CLUSTER_NACOS_SECRETKEY:""}
```

**部署架构**：
```
┌──────────────────────────────────────┐
│         Nacos 注册中心               │
└────────────┬─────────────────────────┘
             ↓
┌────────────┴─────────────────────────┐
│  ┌──────────┬──────────┬──────────┐  │
│  │  OAP-1   │  OAP-2   │  OAP-3   │  │ (集群)
│  └──────────┴──────────┴──────────┘  │
└────────────┬─────────────────────────┘
             ↓
┌────────────────────────────────────┐
│       Elasticsearch 集群           │
└────────────────────────────────────┘
```

---

## 3. Java Agent 接入

### 3.1 Agent 下载与配置

**目录结构**：
```
skywalking-agent/
├── skywalking-agent.jar    # Agent 主程序
├── config/
│   └── agent.config        # Agent 配置
├── plugins/                # 插件目录
└── optional-plugins/       # 可选插件
```

**核心配置**：
```properties
# config/agent.config

# 应用名称（服务名）
agent.service_name=${SW_AGENT_NAME:your-service-name}

# OAP 服务地址
collector.backend_service=${SW_AGENT_COLLECTOR_BACKEND_SERVICES:127.0.0.1:11800}

# 采样率（-1=全采样，其他=按百分比采样）
agent.sample_n_per_3_secs=${SW_AGENT_SAMPLE:-1}

# 日志级别
logging.level=${SW_LOGGING_LEVEL:INFO}

# 日志输出
logging.file_name=${SW_LOGGING_FILE_NAME:skywalking-api.log}
logging.max_file_size=${SW_LOGGING_MAX_FILE_SIZE:314572800}
logging.max_history_files=${SW_LOGGING_MAX_HISTORY_FILES:5}

# 忽略路径（多个用逗号分隔）
agent.ignore_suffix=${SW_AGENT_IGNORE_SUFFIX:.jpg,.jpeg,.js,.css,.png,.bmp,.gif,.ico,.mp3,.mp4,.html,.svg}
```

---

### 3.2 Spring Boot 应用接入

**方式一：JVM 参数**：
```bash
java -javaagent:/path/to/skywalking-agent/skywalking-agent.jar \
     -Dskywalking.agent.service_name=order-service \
     -Dskywalking.collector.backend_service=localhost:11800 \
     -jar order-service.jar
```

**方式二：IDEA 配置**：
```
Run → Edit Configurations → VM options：
-javaagent:D:\skywalking-agent\skywalking-agent.jar
-Dskywalking.agent.service_name=order-service
-Dskywalking.collector.backend_service=localhost:11800
```

**方式三：Docker 部署**：
```dockerfile
FROM openjdk:8-jre-alpine

# 复制 Agent
COPY skywalking-agent /skywalking-agent

# 复制应用
COPY target/order-service.jar /app.jar

# 启动参数
ENV JAVA_OPTS="-javaagent:/skywalking-agent/skywalking-agent.jar"
ENV SW_AGENT_NAME=order-service
ENV SW_AGENT_COLLECTOR_BACKEND_SERVICES=skywalking-oap:11800

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app.jar"]
```

**验证接入**：
```
1. 启动应用
2. 访问应用接口
3. 打开 SkyWalking UI
4. 在"服务"列表中查看服务是否出现
```

---

## 4. 链路追踪原理

### 4.1 核心概念

**TraceId（链路ID）**：
- 全局唯一标识一次请求
- 贯穿整个调用链路
- 格式：`SegmentId.SpanId.ParentSegmentId.ParentSpanId`

**Segment（段）**：
- 一个服务内的调用片段
- 包含多个 Span

**Span（跨度）**：
- 一次方法调用或 RPC 调用
- 记录开始时间、结束时间、标签

**类型**：
- **Entry Span**：服务入口（如接收 HTTP 请求）
- **Local Span**：本地方法调用
- **Exit Span**：服务出口（如调用 RPC、数据库）

---

### 4.2 链路传播机制

**跨进程传播**：
```
Service A                  Service B
────────────────           ────────────────
TraceId: 123              TraceId: 123
SegmentId: A-1            SegmentId: B-1
├─ Entry Span             ├─ Entry Span
│  SpanId: 0              │  SpanId: 0
├─ Local Span             │  ParentSpanId: A-1.1
│  SpanId: 1              ├─ Local Span
└─ Exit Span ──────────>  │  SpanId: 1
   SpanId: 2              └─ Exit Span
   (调用 Service B)          SpanId: 2
```

**HTTP 请求头传播**：
```
sw8: 1-<TraceId>-<SegmentId>-<SpanId>-<ServiceName>-<ServiceInstanceName>-<EntryEndpoint>-<TargetAddress>
```

**示例**：
```
GET /order/1 HTTP/1.1
Host: order-service
sw8: 1-MTIzNDU2Nzg5MA==-QS0x-Mg==-b3JkZXItc2VydmljZQ==-aW5zdGFuY2UtMQ==-L29yZGVy-dXNlci1zZXJ2aWNl
```

---

### 4.3 字节码增强原理

**增强方式**：
- 基于 Byte Buddy 进行字节码增强
- 拦截目标方法的执行
- 在方法前后插入追踪代码

**插件机制**：
```java
// SkyWalking 插件示例（简化）
@PluginDefine
public class SpringMVCInstrumentation extends ClassInstanceMethodsEnhancePluginDefine {
    
    @Override
    protected ClassMatch enhanceClass() {
        // 增强 Controller 类
        return byClassAnnotationMatch("org.springframework.stereotype.Controller");
    }
    
    @Override
    public InstanceMethodsInterceptPoint[] getInstanceMethodsInterceptPoints() {
        return new InstanceMethodsInterceptPoint[]{
            new InstanceMethodsInterceptPoint() {
                @Override
                public ElementMatcher<MethodDescription> getMethodsMatcher() {
                    // 拦截所有标注 @RequestMapping 的方法
                    return isAnnotatedWith(named("org.springframework.web.bind.annotation.RequestMapping"));
                }
                
                @Override
                public String getMethodsInterceptor() {
                    return "org.apache.skywalking.apm.plugin.spring.mvc.SpringMVCInterceptor";
                }
            }
        };
    }
}
```

**拦截器实现**：
```java
public class SpringMVCInterceptor implements InstanceMethodsAroundInterceptor {
    
    @Override
    public void beforeMethod(EnhancedInstance objInst, Method method, 
                            Object[] allArguments, Class<?>[] argumentsTypes,
                            MethodInterceptResult result) {
        // 1. 获取 HTTP 请求
        HttpServletRequest request = (HttpServletRequest) allArguments[0];
        
        // 2. 提取 TraceId（从请求头）
        ContextCarrier contextCarrier = new ContextCarrier();
        CarrierItem next = contextCarrier.items();
        while (next.hasNext()) {
            next = next.next();
            next.setHeadValue(request.getHeader(next.getHeadKey()));
        }
        
        // 3. 创建 Entry Span
        AbstractSpan span = ContextManager.createEntrySpan(
            request.getRequestURI(), 
            contextCarrier
        );
        
        // 4. 设置标签
        Tags.URL.set(span, request.getRequestURL().toString());
        Tags.HTTP.METHOD.set(span, request.getMethod());
        span.setComponent(ComponentsDefine.SPRING_MVC_ANNOTATION);
    }
    
    @Override
    public Object afterMethod(EnhancedInstance objInst, Method method, 
                             Object[] allArguments, Class<?>[] argumentsTypes,
                             Object ret) {
        // 1. 获取响应
        HttpServletResponse response = (HttpServletResponse) allArguments[1];
        
        // 2. 获取当前 Span
        AbstractSpan span = ContextManager.activeSpan();
        
        // 3. 设置响应状态
        Tags.HTTP_RESPONSE_STATUS_CODE.set(span, response.getStatus());
        if (response.getStatus() >= 400) {
            span.errorOccurred();
        }
        
        // 4. 停止 Span
        ContextManager.stopSpan();
        
        return ret;
    }
}
```

---

## 5. 拓扑图与服务依赖分析

### 5.1 拓扑图展示

**UI 查看**：
```
SkyWalking UI → Dashboard → Topology
```

**拓扑图信息**：
- 服务节点
- 服务调用关系
- 调用次数（CPM - Calls Per Minute）
- 响应时间
- 错误率

**示例**：
```
┌──────────────┐      200 cpm      ┌──────────────┐
│              │  ───────────────>  │              │
│   Gateway    │   Avg: 50ms        │ Order Service│
│              │   Error: 0.5%      │              │
└──────────────┘                    └──────┬───────┘
                                           │
                                  150 cpm  │
                                           ↓
                                    ┌──────────────┐
                                    │              │
                                    │ User Service │
                                    │              │
                                    └──────────────┘
```

---

### 5.2 服务依赖分析

**依赖深度分析**：
```
SkyWalking UI → Topology → 点击服务节点 → Dependency
```

**指标**：
- **上游服务**：调用当前服务的服务列表
- **下游服务**：当前服务调用的服务列表
- **CPM**：每分钟调用次数
- **Avg Response Time**：平均响应时间
- **SLA**：服务可用性

---

## 6. 性能指标采集

### 6.1 核心指标

**服务级别指标**：
- **SLA**：服务可用性（成功率）
- **CPM**：每分钟调用次数
- **Avg Response Time**：平均响应时间
- **P99/P95/P90**：响应时间百分位

**实例级别指标**：
- **JVM 内存**：Heap/NonHeap/GC
- **JVM 线程**：线程数、死锁
- **CPU**：使用率
- **GC**：GC 次数、GC 时间

---

### 6.2 查看性能指标

**服务性能**：
```
SkyWalking UI → Service → 选择服务 → Overview

指标：
- Service Apdex Score（应用性能指数）
- Service Avg Response Time
- Service CPM
- Service Successful Rate
- Service Load（负载）
```

**实例性能**：
```
SkyWalking UI → Service → Instance → 选择实例

指标：
- JVM CPU
- JVM Memory (Heap/NonHeap)
- JVM GC (Count/Time)
- JVM Thread (Live/Peak/Daemon)
```

---

### 6.3 自定义指标

**自定义 Metrics**：
```java
import org.apache.skywalking.apm.toolkit.meter.MeterFactory;

@Service
public class OrderService {
    
    // 计数器
    private Counter orderCounter = MeterFactory
        .counter("order_total")
        .tag("type", "create")
        .build();
    
    // 直方图
    private Histogram responseTime = MeterFactory
        .histogram("order_response_time")
        .tag("api", "createOrder")
        .build();
    
    public void createOrder() {
        long start = System.currentTimeMillis();
        
        try {
            // 业务逻辑
            orderCounter.increment(1);
        } finally {
            long duration = System.currentTimeMillis() - start;
            responseTime.addValue(duration);
        }
    }
}
```

---

## 7. 日志收集与关联

### 7.1 日志关联配置

**Logback 配置**：
```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="ch.qos.logback.core.encoder.LayoutWrappingEncoder">
            <layout class="org.apache.skywalking.apm.toolkit.log.logback.v1.x.TraceIdPatternLogbackLayout">
                <pattern>
                    %d{yyyy-MM-dd HH:mm:ss.SSS} [%tid] [%thread] %-5level %logger{36} - %msg%n
                </pattern>
            </layout>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

**依赖**：
```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-logback-1.x</artifactId>
    <version>9.3.0</version>
</dependency>
```

**日志输出**：
```
2024-01-15 10:30:45.123 [TID:123.456.789] [http-nio-8080-exec-1] INFO  c.e.OrderController - 创建订单成功
```

---

### 7.2 日志查询

**通过 TraceId 查询日志**：
```
1. SkyWalking UI → Trace → 查询链路
2. 复制 TraceId
3. 在日志系统（Kibana/Grafana Loki）中搜索：TID:xxx
4. 关联链路与日志
```

---

## 8. 告警规则配置

### 8.1 告警配置文件

**config/alarm-settings.yml**：
```yaml
rules:
  # 服务响应时间告警
  service_resp_time_rule:
    metrics-name: service_resp_time
    op: ">"
    threshold: 1000  # 超过 1000ms
    period: 10       # 10 分钟
    count: 3         # 连续 3 次
    silence-period: 5  # 沉默期 5 分钟
    message: 服务 {name} 响应时间过高，当前值：{value}ms

  # 服务可用性告警
  service_sla_rule:
    metrics-name: service_sla
    op: "<"
    threshold: 95    # 低于 95%
    period: 10
    count: 2
    silence-period: 10
    message: 服务 {name} 可用性过低，当前值：{value}%

  # 实例 JVM 内存告警
  service_instance_resp_time_rule:
    metrics-name: service_instance_jvm_memory_heap_used
    op: ">"
    threshold: 80    # 超过 80%
    period: 5
    count: 3
    silence-period: 5
    message: 实例 {name} JVM 堆内存使用率过高：{value}%

webhooks:
  - http://alertmanager:9093/api/v1/alerts  # 发送到 AlertManager
  - http://your-webhook-server/api/alert    # 自定义 Webhook
```

---

### 8.2 Webhook 告警接收

**自定义告警接收**：
```java
@RestController
@RequestMapping("/api/alert")
public class AlarmWebhookController {
    
    @PostMapping
    public void receiveAlarm(@RequestBody List<AlarmMessage> alarms) {
        for (AlarmMessage alarm : alarms) {
            log.error("收到告警：{}", alarm.getMessage());
            
            // 发送钉钉通知
            sendDingTalk(alarm);
            
            // 发送邮件
            sendEmail(alarm);
        }
    }
}
```

**AlarmMessage 结构**：
```json
{
  "scopeId": 1,
  "scope": "SERVICE",
  "name": "order-service",
  "id0": "b3JkZXItc2VydmljZQ==",
  "id1": "",
  "ruleName": "service_resp_time_rule",
  "alarmMessage": "服务 order-service 响应时间过高，当前值：1200ms",
  "startTime": 1642226400000,
  "tags": []
}
```

---

## 9. 自定义插件开发

### 9.1 插件开发步骤

**1. 创建插件项目**：
```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-agent-core</artifactId>
    <version>9.3.0</version>
    <scope>provided</scope>
</dependency>
```

**2. 定义增强点**：
```java
public class MyFrameworkInstrumentation extends ClassInstanceMethodsEnhancePluginDefine {
    
    @Override
    protected ClassMatch enhanceClass() {
        // 指定要增强的类
        return named("com.example.MyFramework");
    }
    
    @Override
    public InstanceMethodsInterceptPoint[] getInstanceMethodsInterceptPoints() {
        return new InstanceMethodsInterceptPoint[]{
            new InstanceMethodsInterceptPoint() {
                @Override
                public ElementMatcher<MethodDescription> getMethodsMatcher() {
                    // 指定要拦截的方法
                    return named("execute");
                }
                
                @Override
                public String getMethodsInterceptor() {
                    return "com.example.skywalking.MyFrameworkInterceptor";
                }
            }
        };
    }
}
```

**3. 实现拦截器**：
```java
public class MyFrameworkInterceptor implements InstanceMethodsAroundInterceptor {
    
    @Override
    public void beforeMethod(EnhancedInstance objInst, Method method, 
                            Object[] allArguments, Class<?>[] argumentsTypes,
                            MethodInterceptResult result) {
        // 创建 Span
        AbstractSpan span = ContextManager.createLocalSpan("MyFramework/execute");
        span.setComponent(new ComponentsDefine.Component(100, "MyFramework"));
    }
    
    @Override
    public Object afterMethod(EnhancedInstance objInst, Method method, 
                             Object[] allArguments, Class<?>[] argumentsTypes,
                             Object ret) {
        // 停止 Span
        ContextManager.stopSpan();
        return ret;
    }
    
    @Override
    public void handleMethodException(EnhancedInstance objInst, Method method, 
                                      Object[] allArguments, Class<?>[] argumentsTypes,
                                      Throwable t) {
        // 记录异常
        ContextManager.activeSpan().log(t);
    }
}
```

**4. 配置插件定义文件**：
```
# resources/skywalking-plugin.def
myframework=com.example.skywalking.MyFrameworkInstrumentation
```

**5. 打包部署**：
```bash
# 打包
mvn clean package

# 将 jar 放入 plugins 目录
cp target/myframework-plugin-1.0.0.jar /path/to/skywalking-agent/plugins/
```

---

## 10. SkyWalking vs Zipkin

### 10.1 对比分析

| 维度 | SkyWalking | Zipkin |
|------|-----------|--------|
| **语言支持** | Java、.NET、Node.js、Go 等 | 多语言（通过不同库） |
| **侵入性** | 无侵入（字节码增强） | 需引入依赖 |
| **功能** | 链路追踪 + 指标 + 拓扑图 + 告警 | 主要是链路追踪 |
| **存储** | ES、H2、MySQL | ES、Cassandra、MySQL |
| **性能** | 高 | 中 |
| **UI** | 功能丰富 | 简洁 |
| **部署复杂度** | 中等 | 简单 |
| **社区** | Apache 顶级项目 | OpenZipkin |

---

### 10.2 选型建议

**选择 SkyWalking**：
- Java 技术栈为主
- 需要全方位的可观测性（链路 + 指标 + 日志）
- 需要拓扑图和告警
- 追求无侵入

**选择 Zipkin**：
- 多语言混合环境
- 只需要链路追踪
- 追求简单轻量
- 已有 Spring Cloud Sleuth

---

## 11. 生产最佳实践

### 11.1 性能优化

**采样率配置**：
```properties
# 低流量服务：全采样
agent.sample_n_per_3_secs=-1

# 高流量服务：每3秒采样1000次
agent.sample_n_per_3_secs=1000
```

**数据保留策略**：
```yaml
# config/application.yml
core:
  default:
    # Trace 数据保留天数
    recordDataTTL: ${SW_CORE_RECORD_DATA_TTL:7}
    # Metrics 数据保留天数
    metricsDataTTL: ${SW_CORE_METRICS_DATA_TTL:7}
```

**批量上报**：
```properties
# Agent 批量上报配置
collector.batch_size=3000
collector.buffer_size=10000
```

---

### 11.2 高可用部署

**OAP 集群**：
- 至少 3 个节点
- 通过 Nacos/Zookeeper 协调
- 无状态，可水平扩展

**Elasticsearch 集群**：
- 至少 3 个节点
- 1 个主节点 + 2 个数据节点
- 副本数量 >= 1

---

### 11.3 监控告警

**关键告警规则**：
- 服务响应时间 > 1s
- 服务可用性 < 95%
- 服务错误率 > 5%
- JVM 堆内存 > 80%
- GC 时间 > 1s

---

## 12. 常见问题

### 12.1 Agent 不生效

**排查步骤**：
```bash
# 1. 检查 JVM 参数
jps -v | grep skywalking

# 2. 查看 Agent 日志
tail -f skywalking-agent/logs/skywalking-api.log

# 3. 检查 OAP 连接
curl http://localhost:11800/
```

**常见原因**：
- Agent 路径错误
- OAP 地址配置错误
- 服务名未配置
- Agent 版本与 OAP 不兼容

---

### 12.2 链路断裂

**原因分析**：
- 异步调用未传递 TraceId
- 线程池未配置追踪
- 消息队列未配置

**解决方案**：
```java
// 手动传递 TraceId
@Async
public void asyncMethod() {
    // 获取当前 TraceId
    String traceId = ContextManager.getGlobalTraceId();
    
    // 在异步线程中继续传递
    CompletableFuture.runAsync(() -> {
        // 恢复 TraceId
        ContextManager.setTraceId(traceId);
        // 业务逻辑
    });
}
```

---

## 13. 学习自检清单

- [ ] 理解 SkyWalking 架构（OAP/UI/Agent/Storage）
- [ ] 掌握 OAP 单机与集群部署
- [ ] 掌握 Java Agent 接入方式
- [ ] 理解链路追踪原理（TraceId/Segment/Span）
- [ ] 掌握字节码增强机制
- [ ] 能够查看拓扑图与服务依赖
- [ ] 能够分析性能指标
- [ ] 掌握日志关联配置
- [ ] 能够配置告警规则
- [ ] 了解自定义插件开发
- [ ] 能够对比 SkyWalking 与 Zipkin
- [ ] 掌握生产最佳实践

---

## 14. 面试高频题

**Q1：SkyWalking 如何实现无侵入的链路追踪？**

**参考答案**：
1. 基于 Java Agent 技术
2. 使用 Byte Buddy 进行字节码增强
3. 在目标方法前后织入追踪代码
4. 通过插件机制支持各种框架（Spring MVC、Dubbo、JDBC 等）
5. 无需修改业务代码

**Q2：TraceId 如何在微服务间传播？**

**参考答案**：
1. HTTP：通过请求头 `sw8` 传递
2. RPC：通过 RPC 上下文传递
3. MQ：通过消息头传递
4. 异步：需要手动传递或使用 Toolkit

**Q3：如何优化 SkyWalking 性能？**

**参考答案**：
1. **采样率**：高流量服务降低采样率
2. **批量上报**：增加批量大小和缓冲区
3. **数据保留**：缩短 TTL
4. **ES 优化**：增加分片、副本数
5. **OAP 集群**：水平扩展

---

**本章小结**：
- SkyWalking 架构：OAP、UI、Agent、Storage 四大组件
- 部署方式：单机部署、集群部署、Elasticsearch 存储
- Agent 接入：JVM 参数、无侵入、字节码增强
- 链路追踪：TraceId、Segment、Span、跨进程传播
- 拓扑图：服务依赖、调用关系、性能指标
- 指标采集：服务级、实例级、自定义指标
- 日志关联：TraceId 关联、Logback 配置
- 告警配置：规则配置、Webhook 接收
- 自定义插件：增强点定义、拦截器实现
- 最佳实践：采样率、数据保留、高可用部署

**下一章预告**：第37章 - 指标监控 Prometheus & Grafana

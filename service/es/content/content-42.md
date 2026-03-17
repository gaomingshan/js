# 分布式追踪与监控

## 概述

分布式追踪（Distributed Tracing）是微服务架构中不可或缺的监控手段。本章介绍如何集成 Elastic APM、Spring Cloud Sleuth + Zipkin 和 SkyWalking，实现全链路监控。

## Elastic APM 集成

### APM 架构

```
应用服务                APM Server            Elasticsearch         Kibana
┌─────────┐           ┌──────────┐          ┌──────────┐        ┌──────────┐
│ App 1   │──APM──▶   │          │──────▶   │          │   ◀──  │   APM    │
│ + Agent │           │   APM    │          │   ES     │        │   UI     │
└─────────┘           │  Server  │          │          │        │          │
┌─────────┐           │          │          │          │        │          │
│ App 2   │──APM──▶   │          │──────▶   │          │   ◀──  │          │
│ + Agent │           │          │          │          │        │          │
└─────────┘           └──────────┘          └──────────┘        └──────────┘
```

### APM Server 部署

**docker-compose.yml**：

```yaml
version: '3.8'

services:
  apm-server:
    image: docker.elastic.co/apm/apm-server:7.17.9
    ports:
      - "8200:8200"
    environment:
      - output.elasticsearch.hosts=["http://elasticsearch:9200"]
      - apm-server.rum.enabled=true
      - setup.kibana.host=kibana:5601
    depends_on:
      - elasticsearch
      - kibana
    volumes:
      - ./apm-server.yml:/usr/share/apm-server/apm-server.yml:ro
```

**apm-server.yml**：

```yaml
apm-server:
  host: "0.0.0.0:8200"
  
  # RUM（Real User Monitoring）
  rum:
    enabled: true
    event_rate.limit: 300
    allow_origins: ['*']
  
  # 认证
  secret_token: "${APM_SECRET_TOKEN}"

output.elasticsearch:
  hosts: ["http://elasticsearch:9200"]
  username: "elastic"
  password: "${ES_PASSWORD}"
  indices:
    - index: "apm-%{[observer.version]}-sourcemap"
    - index: "apm-%{[observer.version]}-error-%{+yyyy.MM.dd}"
    - index: "apm-%{[observer.version]}-transaction-%{+yyyy.MM.dd}"
    - index: "apm-%{[observer.version]}-span-%{+yyyy.MM.dd}"
    - index: "apm-%{[observer.version]}-metric-%{+yyyy.MM.dd}"

setup.kibana:
  host: "kibana:5601"

logging.level: info
```

### Java Agent 集成

**下载 Agent**：

```bash
wget https://repo1.maven.org/maven2/co/elastic/apm/elastic-apm-agent/1.38.0/elastic-apm-agent-1.38.0.jar
```

**启动参数**：

```bash
java -javaagent:/path/to/elastic-apm-agent-1.38.0.jar \
     -Delastic.apm.service_name=product-service \
     -Delastic.apm.server_urls=http://apm-server:8200 \
     -Delastic.apm.secret_token=your-secret-token \
     -Delastic.apm.environment=production \
     -Delastic.apm.application_packages=com.example \
     -jar application.jar
```

**配置文件方式**：

```properties
# elasticapm.properties
elastic.apm.service_name=product-service
elastic.apm.server_urls=http://apm-server:8200
elastic.apm.secret_token=your-secret-token
elastic.apm.environment=production
elastic.apm.application_packages=com.example
elastic.apm.log_level=INFO

# 采样率（0.0-1.0）
elastic.apm.transaction_sample_rate=1.0

# 记录 body
elastic.apm.capture_body=all

# 记录 headers
elastic.apm.capture_headers=true
```

### Spring Boot 集成

**依赖配置**：

```xml
<dependency>
    <groupId>co.elastic.apm</groupId>
    <artifactId>apm-agent-attach</artifactId>
    <version>1.38.0</version>
</dependency>
```

**自动附加 Agent**：

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        // 程序化附加 Agent
        ElasticApmAttacher.attach();
        
        SpringApplication.run(Application.class, args);
    }
}
```

**application.yml**：

```yaml
elastic.apm:
  service-name: product-service
  server-urls: http://apm-server:8200
  secret-token: ${APM_SECRET_TOKEN}
  environment: production
  application-packages: com.example
  transaction-sample-rate: 1.0
  capture-body: all
```

### 自定义追踪

**手动创建 Span**：

```java
@Service
public class ProductService {
    
    public Product getProduct(String id) {
        Span span = ElasticApm.currentSpan()
            .startSpan("external", "http", null)
            .setName("Get Product from Cache");
        
        try {
            // 业务逻辑
            Product product = cache.get(id);
            
            span.setLabel("cache_hit", product != null);
            
            return product;
        } finally {
            span.end();
        }
    }
}
```

**捕获异常**：

```java
@Service
public class OrderService {
    
    public Order createOrder(OrderRequest request) {
        Transaction transaction = ElasticApm.currentTransaction();
        
        try {
            // 创建订单
            return orderMapper.insert(request);
        } catch (Exception e) {
            transaction.captureException(e);
            throw e;
        }
    }
}
```

**添加自定义标签**：

```java
@RestController
public class ProductController {
    
    @GetMapping("/products/{id}")
    public Product get(@PathVariable String id) {
        Transaction transaction = ElasticApm.currentTransaction();
        
        // 添加自定义标签
        transaction.setLabel("product_id", id);
        transaction.setLabel("user_id", getCurrentUserId());
        transaction.setUser(getCurrentUserId(), 
                           getCurrentUserEmail(), 
                           getCurrentUserName());
        
        return productService.getProduct(id);
    }
}
```

## Spring Cloud Sleuth + Zipkin

### Sleuth 集成

**依赖配置**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>
```

**自动追踪**：

```yaml
spring:
  application:
    name: product-service
  
  sleuth:
    sampler:
      probability: 1.0  # 采样率 100%
    
    # 传播格式
    propagation:
      type: B3  # B3, W3C
    
    # 不追踪的路径
    web:
      skip-pattern: /actuator.*|/health
```

**日志输出**：

```
2024-01-15 10:00:00.123  INFO [product-service,a1b2c3d4e5f6,a1b2c3d4e5f6] ...
                                  ↑              ↑          ↑
                              服务名         Trace ID    Span ID
```

### Zipkin 集成

**启动 Zipkin Server**：

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

**Spring Boot 集成**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-sleuth-zipkin</artifactId>
</dependency>
```

**配置**：

```yaml
spring:
  zipkin:
    base-url: http://zipkin-server:9411
    sender:
      type: web  # web, rabbit, kafka
  
  sleuth:
    sampler:
      probability: 1.0
```

### Zipkin + Elasticsearch

**配置 Zipkin 存储**：

```bash
docker run -d \
  -e STORAGE_TYPE=elasticsearch \
  -e ES_HOSTS=http://elasticsearch:9200 \
  -e ES_USERNAME=elastic \
  -e ES_PASSWORD=changeme \
  -p 9411:9411 \
  openzipkin/zipkin
```

**docker-compose.yml**：

```yaml
version: '3.8'

services:
  zipkin:
    image: openzipkin/zipkin
    ports:
      - "9411:9411"
    environment:
      - STORAGE_TYPE=elasticsearch
      - ES_HOSTS=http://elasticsearch:9200
      - ES_USERNAME=elastic
      - ES_PASSWORD=${ES_PASSWORD}
      - ES_INDEX=zipkin
      - ES_DATE_SEPARATOR=-
    depends_on:
      - elasticsearch
```

### 自定义 Span

```java
@Service
public class ProductService {
    
    @Autowired
    private Tracer tracer;
    
    public Product getProduct(String id) {
        Span span = tracer.nextSpan().name("getProductFromDB").start();
        
        try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
            span.tag("product.id", id);
            span.tag("db.type", "mysql");
            
            Product product = productMapper.selectById(id);
            
            span.tag("product.found", String.valueOf(product != null));
            
            return product;
        } finally {
            span.end();
        }
    }
}
```

## SkyWalking 与 ES 整合

### SkyWalking 架构

```
应用服务                 OAP Server           Elasticsearch          UI
┌─────────┐           ┌───────────┐         ┌──────────┐        ┌─────────┐
│ App 1   │──gRPC──▶  │           │──────▶  │          │   ◀──  │         │
│ + Agent │           │    OAP    │         │    ES    │        │   UI    │
└─────────┘           │  Server   │         │          │        │         │
┌─────────┐           │           │         │          │        │         │
│ App 2   │──gRPC──▶  │           │──────▶  │          │   ◀──  │         │
│ + Agent │           │           │         │          │        │         │
└─────────┘           └───────────┘         └──────────┘        └─────────┘
```

### SkyWalking OAP 部署

**docker-compose.yml**：

```yaml
version: '3.8'

services:
  oap:
    image: apache/skywalking-oap-server:9.3.0
    ports:
      - "11800:11800"  # gRPC
      - "12800:12800"  # HTTP
    environment:
      SW_STORAGE: elasticsearch
      SW_STORAGE_ES_CLUSTER_NODES: elasticsearch:9200
      SW_ES_USER: elastic
      SW_ES_PASSWORD: ${ES_PASSWORD}
      SW_NAMESPACE: skywalking
    depends_on:
      - elasticsearch
  
  ui:
    image: apache/skywalking-ui:9.3.0
    ports:
      - "8080:8080"
    environment:
      SW_OAP_ADDRESS: http://oap:12800
    depends_on:
      - oap
```

### Java Agent 集成

**下载 Agent**：

```bash
wget https://archive.apache.org/dist/skywalking/9.3.0/apache-skywalking-apm-9.3.0.tar.gz
tar -xzf apache-skywalking-apm-9.3.0.tar.gz
```

**启动参数**：

```bash
java -javaagent:/path/to/skywalking-agent/skywalking-agent.jar \
     -Dskywalking.agent.service_name=product-service \
     -Dskywalking.collector.backend_service=oap-server:11800 \
     -jar application.jar
```

**配置文件**：

```properties
# agent/config/agent.config

# 服务名
agent.service_name=${SW_AGENT_NAME:product-service}

# OAP 地址
collector.backend_service=${SW_AGENT_COLLECTOR_BACKEND_SERVICES:oap-server:11800}

# 采样率
agent.sample_n_per_3_secs=${SW_AGENT_SAMPLE:-1}

# 日志级别
logging.level=${SW_LOGGING_LEVEL:INFO}
```

### 插件配置

**可选插件**：

```
plugins/
├── apm-dubbo-plugin-9.3.0.jar
├── apm-elasticsearch-7.x-plugin-9.3.0.jar
├── apm-feign-default-http-9.x-plugin-9.3.0.jar
├── apm-httpclient-4.x-plugin-9.3.0.jar
├── apm-jdbc-commons-9.3.0.jar
├── apm-kafka-commons-9.3.0.jar
├── apm-mongodb-3.x-plugin-9.3.0.jar
├── apm-mysql-8.x-plugin-9.3.0.jar
├── apm-rabbitmq-5.x-plugin-9.3.0.jar
└── apm-spring-webflux-5.x-plugin-9.3.0.jar
```

### 自定义追踪

**@Trace 注解**：

```java
@Service
public class ProductService {
    
    @Trace
    @Tag(key = "product_id", value = "arg[0]")
    public Product getProduct(String id) {
        return productMapper.selectById(id);
    }
    
    @Trace(operationName = "createProduct")
    @Tags({
        @Tag(key = "category", value = "arg[0].category"),
        @Tag(key = "price", value = "arg[0].price")
    })
    public Product createProduct(Product product) {
        return productMapper.insert(product);
    }
}
```

**手动创建 Span**：

```java
import org.apache.skywalking.apm.toolkit.trace.TraceContext;
import org.apache.skywalking.apm.toolkit.trace.Tracer;

@Service
public class OrderService {
    
    public Order createOrder(OrderRequest request) {
        // 获取 Trace ID
        String traceId = TraceContext.traceId();
        
        // 创建本地 Span
        try {
            Tracer.createLocalSpan("validateOrder");
            
            // 业务逻辑
            validateOrder(request);
            
        } finally {
            Tracer.stopSpan();
        }
        
        return saveOrder(request);
    }
}
```

## 链路追踪数据存储

### Elasticsearch 索引设计

**APM 索引**：

```
apm-7.17.9-error-2024.01.15
apm-7.17.9-transaction-2024.01.15
apm-7.17.9-span-2024.01.15
apm-7.17.9-metric-2024.01.15
```

**Zipkin 索引**：

```
zipkin:span-2024-01-15
zipkin:dependency-2024-01-15
```

**SkyWalking 索引**：

```
skywalking_segment-20240115
skywalking_service_traffic-20240115
skywalking_service_instance_traffic-20240115
skywalking_endpoint_traffic-20240115
```

### 索引模板配置

**APM 索引模板**：

```bash
PUT /_index_template/apm-template
{
  "index_patterns": ["apm-*"],
  "priority": 100,
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "apm-policy"
    }
  }
}
```

**生命周期策略**：

```bash
PUT /_ilm/policy/apm-policy
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
        "min_age": "3d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
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
}
```

## 性能指标监控

### Micrometer 集成

**依赖配置**：

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-elastic</artifactId>
</dependency>
```

**配置**：

```yaml
management:
  metrics:
    export:
      elastic:
        enabled: true
        host: http://elasticsearch:9200
        index: metrics
        step: 1m
        user-name: elastic
        password: ${ES_PASSWORD}
```

### 自定义指标

```java
@Service
public class ProductService {
    
    private final Counter productCreatedCounter;
    private final Timer searchTimer;
    
    public ProductService(MeterRegistry registry) {
        this.productCreatedCounter = Counter.builder("product.created")
            .tag("service", "product-service")
            .register(registry);
        
        this.searchTimer = Timer.builder("product.search")
            .tag("service", "product-service")
            .register(registry);
    }
    
    public Product createProduct(Product product) {
        Product created = productMapper.insert(product);
        productCreatedCounter.increment();
        return created;
    }
    
    public List<Product> search(String keyword) {
        return searchTimer.record(() -> {
            return productMapper.search(keyword);
        });
    }
}
```

### Prometheus + Grafana

**Prometheus 配置**：

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['product-service:8080', 'order-service:8080']
```

**Grafana Dashboard**：

```
JVM Dashboard：
  - 堆内存使用
  - GC 次数
  - 线程数
  - CPU 使用率

应用 Dashboard：
  - QPS
  - 响应时间（P50、P95、P99）
  - 错误率
  - 并发数
```

## 告警配置

### Kibana Watcher

```bash
PUT _watcher/watch/apm_error_alert
{
  "trigger": {
    "schedule": {
      "interval": "1m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["apm-*-error-*"],
        "body": {
          "query": {
            "range": {
              "@timestamp": {
                "gte": "now-5m"
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {
        "gt": 10
      }
    }
  },
  "actions": {
    "send_email": {
      "email": {
        "to": "admin@example.com",
        "subject": "APM Error Alert",
        "body": "Error count exceeded threshold: {{ctx.payload.hits.total}}"
      }
    }
  }
}
```

### ElastAlert

**配置文件**：

```yaml
# error_alert.yaml
name: High Error Rate Alert
type: frequency
index: apm-*-error-*
num_events: 10
timeframe:
  minutes: 5

filter:
  - term:
      service.name: "product-service"

alert:
  - email:
      email: "admin@example.com"
  - slack:
      slack_webhook_url: "https://hooks.slack.com/services/xxx"
```

## 全链路监控实战

### 完整示例

**场景**：用户下单流程

```
用户 → API Gateway → Order Service → Product Service → Inventory Service
                         ↓               ↓                  ↓
                      订单库          商品库            库存库
```

**追踪数据**：

```
Trace ID: a1b2c3d4e5f6g7h8

Span 1 (API Gateway):
  - Duration: 250ms
  - Tags: http.method=POST, http.url=/api/orders

Span 2 (Order Service):
  - Duration: 200ms
  - Tags: service=order-service, operation=createOrder

Span 3 (Product Service):
  - Duration: 50ms
  - Tags: service=product-service, operation=getProduct

Span 4 (Inventory Service):
  - Duration: 100ms
  - Tags: service=inventory-service, operation=reduceStock
```

### 性能分析

**查询追踪数据**：

```bash
GET /apm-*-transaction-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "trace.id": "a1b2c3d4e5f6g7h8" } }
      ]
    }
  },
  "sort": [
    { "timestamp.us": "asc" }
  ]
}
```

**性能瓶颈识别**：

```
1. 按 Duration 排序找出慢服务
2. 分析 Span 分布
3. 查看数据库查询耗时
4. 检查外部调用延迟
```

## 总结

**Elastic APM**：
- 官方 APM 方案
- 与 ELK 无缝集成
- 自动追踪

**Sleuth + Zipkin**：
- Spring Cloud 生态
- 轻量级追踪
- 支持多种存储

**SkyWalking**：
- 国产开源 APM
- 功能强大
- 插件丰富

**数据存储**：
- Elasticsearch 存储
- 索引设计
- 生命周期管理

**性能监控**：
- Micrometer 指标
- Prometheus 集成
- Grafana 可视化

**告警配置**：
- Watcher 告警
- ElastAlert 规则
- 多渠道通知

**最佳实践**：
- 合理采样率
- 自定义标签
- 性能优化
- 全链路监控

至此，第十部分"Spring Cloud 集成与高级应用"（第39-42章）已全部完成。接下来将继续生成第十一部分和第十二部分的剩余章节（第43-60章）。

# 第31章：Sleuth + Zipkin 链路追踪深入

> **本章目标**：深入理解分布式链路追踪原理，掌握 Sleuth + Zipkin 高级特性和最佳实践

---

## 1. 链路追踪核心原理

### 1.1 分布式追踪模型

**Google Dapper 论文核心概念**：

**Trace（追踪）**：
- 表示一次完整的请求调用链路
- 由多个 Span 组成
- 拥有全局唯一的 Trace ID

**Span（跨度）**：
- 表示一次服务调用
- 包含开始时间、结束时间、标签、日志
- 拥有唯一的 Span ID

**调用关系**：
```
Trace ID: abc123

Span A (Gateway)
├─ Span B (User Service)
│  ├─ Span D (MySQL Query)
│  └─ Span E (Redis Get)
└─ Span C (Order Service)
   └─ Span F (MySQL Query)
```

---

### 1.2 Sleuth 核心组件

**Tracer**：追踪器，创建 Span
**Span**：跨度对象
**SpanReporter**：Span 上报器
**Sampler**：采样器

**工作流程**：
```
1. 请求到达 → Tracer 创建 Root Span
2. 调用下游服务 → 创建 Child Span
3. Span 完成 → SpanReporter 上报到 Zipkin
4. Sampler 决定是否采样
```

---

### 1.3 Trace ID 传递机制

**HTTP 传递**：
```
请求头：
X-B3-TraceId: abc123
X-B3-SpanId: def456
X-B3-ParentSpanId: xyz789
X-B3-Sampled: 1
```

**消息队列传递**：
```
消息头：
spanTraceId: abc123
spanId: def456
spanParentSpanId: xyz789
spanSampled: 1
```

**源码解析**：
```java
// TracingFilter 拦截 HTTP 请求
public class TracingFilter extends GenericFilterBean {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        // 提取或创建 Trace 上下文
        TraceContext context = extractor.extract(httpRequest);
        
        if (context == null) {
            // 创建新的 Trace
            context = tracer.nextSpan().context();
        }
        
        // 创建 Span
        Span span = tracer.nextSpan(context);
        span.kind(Span.Kind.SERVER);
        span.name(httpRequest.getMethod() + " " + httpRequest.getRequestURI());
        span.start();
        
        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span)) {
            chain.doFilter(request, response);
        } finally {
            span.finish();
        }
    }
}
```

---

## 2. Sleuth 高级配置

### 2.1 采样策略

**概率采样**：
```yaml
spring:
  sleuth:
    sampler:
      probability: 0.1  # 10% 采样率
```

**速率限制采样**：
```yaml
spring:
  sleuth:
    sampler:
      rate: 100  # 每秒最多采样 100 个 Trace
```

**自定义采样器**：
```java
@Bean
public Sampler customSampler() {
    return new Sampler() {
        @Override
        public boolean isSampled(long traceId) {
            // 自定义采样逻辑
            // 例如：只采样特定用户的请求
            String userId = getCurrentUserId();
            return "vip-user".equals(userId);
        }
    };
}
```

**路径采样**：
```java
@Bean
public Sampler pathBasedSampler() {
    return new Sampler() {
        @Override
        public boolean isSampled(long traceId) {
            HttpServletRequest request = getCurrentRequest();
            String path = request.getRequestURI();
            
            // 采样关键接口
            return path.startsWith("/order") || path.startsWith("/payment");
        }
    };
}
```

---

### 2.2 Span 标签与日志

**添加标签（Tag）**：
```java
@Service
public class UserService {
    
    @Autowired
    private Tracer tracer;
    
    public UserDTO getUser(Long id) {
        Span span = tracer.currentSpan();
        
        // 添加标签
        span.tag("user.id", String.valueOf(id));
        span.tag("user.type", "vip");
        
        UserDTO user = userMapper.selectById(id);
        
        span.tag("user.name", user.getName());
        
        return user;
    }
}
```

**添加日志事件（Event）**：
```java
@Service
public class OrderService {
    
    @Autowired
    private Tracer tracer;
    
    public void createOrder(OrderDTO order) {
        Span span = tracer.currentSpan();
        
        // 记录事件
        span.annotate("order.validation.start");
        validateOrder(order);
        span.annotate("order.validation.end");
        
        span.annotate("order.save.start");
        orderMapper.insert(order);
        span.annotate("order.save.end");
    }
}
```

---

### 2.3 异步任务追踪

**@Async 方法追踪**：
```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean
    public Executor taskExecutor(BeanFactory beanFactory) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("async-");
        
        // 使用 LazyTraceExecutor 包装，自动传递 Trace 上下文
        return new LazyTraceExecutor(beanFactory, executor);
    }
}
```

**手动传递 Trace 上下文**：
```java
@Service
public class AsyncService {
    
    @Autowired
    private Tracer tracer;
    
    public void processAsync() {
        Span span = tracer.currentSpan();
        TraceContext context = span.context();
        
        CompletableFuture.runAsync(() -> {
            // 恢复 Trace 上下文
            try (Tracer.SpanInScope ws = tracer.withSpanInScope(tracer.toSpan(context))) {
                // 业务逻辑
                doSomething();
            }
        });
    }
}
```

---

### 2.4 数据库查询追踪

**自动追踪 JDBC**：
```yaml
spring:
  sleuth:
    jdbc:
      enabled: true  # 开启 JDBC 追踪
      datasource-proxy:
        slow-query-threshold: 500  # 慢查询阈值（毫秒）
```

**慢查询标记**：
```java
// Sleuth 自动为慢查询添加标签
span.tag("sql.slow", "true");
span.tag("sql.query", "SELECT * FROM user WHERE id = ?");
span.tag("sql.duration", "1234ms");
```

---

## 3. Zipkin 高级特性

### 3.1 Zipkin 架构

**组件**：
```
Collector（收集器）→ Storage（存储）→ Web UI（查询）
                      ↓
              Elasticsearch/MySQL/Cassandra
```

**部署方式**：
```bash
# Docker 部署（内存存储）
docker run -d -p 9411:9411 openzipkin/zipkin

# Docker 部署（Elasticsearch 存储）
docker run -d -p 9411:9411 \
  -e STORAGE_TYPE=elasticsearch \
  -e ES_HOSTS=http://elasticsearch:9200 \
  openzipkin/zipkin
```

---

### 3.2 数据持久化

**Elasticsearch 存储**：
```yaml
# zipkin-server 配置
zipkin:
  storage:
    type: elasticsearch
    elasticsearch:
      hosts: http://localhost:9200
      index: zipkin
      max-requests: 64
```

**MySQL 存储**：
```sql
-- Zipkin 数据库表
CREATE TABLE zipkin_spans (
  trace_id_high BIGINT NOT NULL DEFAULT 0,
  trace_id BIGINT NOT NULL,
  id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  parent_id BIGINT,
  timestamp_millis BIGINT,
  duration BIGINT,
  PRIMARY KEY (trace_id_high, trace_id, id)
);

CREATE TABLE zipkin_annotations (
  trace_id_high BIGINT NOT NULL DEFAULT 0,
  trace_id BIGINT NOT NULL,
  span_id BIGINT NOT NULL,
  a_key VARCHAR(255) NOT NULL,
  a_value BLOB,
  a_timestamp BIGINT NOT NULL,
  endpoint_ipv4 INT,
  endpoint_port SMALLINT,
  endpoint_service_name VARCHAR(255)
);
```

**配置 MySQL 存储**：
```yaml
zipkin:
  storage:
    type: mysql
    mysql:
      host: localhost
      port: 3306
      username: zipkin
      password: zipkin
      db: zipkin
```

---

### 3.3 服务依赖分析

**依赖关系图**：
```
Zipkin UI → Dependencies

Gateway (100 req/s)
├─ User Service (80 req/s, P95: 50ms, Error: 2%)
│  ├─ MySQL (80 req/s, P95: 10ms)
│  └─ Redis (60 req/s, P95: 2ms)
└─ Order Service (50 req/s, P95: 100ms, Error: 5%)
   └─ MySQL (50 req/s, P95: 30ms)
```

**关键指标**：
- 调用次数
- 平均延迟
- P95/P99 延迟
- 错误率

---

### 3.4 Trace 搜索与分析

**Zipkin UI 搜索**：
```
1. 服务名：user-service
2. Span 名：GET /user/{id}
3. 标签：http.status_code=500
4. 时间范围：最近1小时
5. 最小耗时：> 1000ms
```

**关键功能**：
- **Trace 时间轴**：可视化 Span 调用顺序
- **Span 详情**：查看标签、日志、错误信息
- **依赖分析**：服务调用关系图
- **性能分析**：识别慢服务

---

## 4. 性能优化

### 4.1 采样率优化

**问题**：100% 采样导致性能下降、存储压力大

**解决方案**：
```yaml
spring:
  sleuth:
    sampler:
      probability: 0.1  # 生产环境 10% 采样
```

**动态采样**：
```java
@Bean
public Sampler dynamicSampler() {
    return new Sampler() {
        private double probability = 0.1;
        
        @Override
        public boolean isSampled(long traceId) {
            // 根据系统负载动态调整采样率
            double cpuUsage = getCpuUsage();
            if (cpuUsage > 0.8) {
                probability = 0.01;  // 高负载降低采样率
            } else {
                probability = 0.1;
            }
            
            return Math.random() < probability;
        }
    };
}
```

---

### 4.2 异步上报

**配置异步上报**：
```yaml
spring:
  zipkin:
    sender:
      type: rabbit  # 使用 RabbitMQ 异步上报
```

**依赖**：
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-sleuth-zipkin</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.amqp</groupId>
    <artifactId>spring-rabbit</artifactId>
</dependency>
```

**配置 RabbitMQ**：
```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

**优势**：
- 降低对应用性能的影响
- 提高上报可靠性
- 削峰填谷

---

### 4.3 Span 数据压缩

**配置压缩**：
```yaml
spring:
  zipkin:
    compression:
      enabled: true  # 开启压缩
```

---

## 5. 实战场景

### 5.1 场景1：性能分析

**问题**：用户反馈订单创建慢

**排查步骤**：
1. Zipkin 搜索订单创建 Trace
2. 按耗时排序，找到慢 Trace
3. 查看 Trace 时间轴
4. 发现瓶颈：库存服务响应 800ms
5. 进一步分析库存服务 Span
6. 发现慢 SQL：SELECT * FROM inventory WHERE product_id = ?
7. 优化：添加索引

**Trace 示例**：
```
POST /order/create (1200ms)
├─ User Service: GET /user/1 (50ms)
├─ Inventory Service: POST /inventory/deduct (800ms) ← 瓶颈
│  └─ MySQL: SELECT * FROM inventory (750ms) ← 慢查询
└─ Order Service: INSERT INTO order (100ms)
```

---

### 5.2 场景2：故障定位

**问题**：订单服务报错率突增

**排查步骤**：
1. Zipkin 搜索错误 Trace（http.status_code=500）
2. 查看 Span 标签，发现错误：Payment Service Timeout
3. 查看支付服务 Span，发现超时配置 5s
4. 联系支付服务商，确认故障
5. 临时方案：增加超时时间到 10s

**Trace 示例**：
```
POST /order/create (5200ms) - ERROR
├─ User Service: GET /user/1 (50ms) - OK
├─ Inventory Service: POST /inventory/deduct (100ms) - OK
└─ Payment Service: POST /payment/pay (5000ms) - TIMEOUT
   Tag: error=true
   Tag: error.message=Read timeout
```

---

### 5.3 场景3：依赖分析

**场景**：评估服务下线影响

**步骤**：
1. Zipkin Dependencies 查看依赖关系
2. 识别上游服务（调用者）
3. 评估影响范围
4. 通知相关团队

**依赖图示例**：
```
Gateway
├─ User Service (调用 100 次/分钟)
├─ Order Service (调用 200 次/分钟)
└─ Product Service (调用 50 次/分钟) ← 计划下线
   └─ 影响：Gateway、Search Service
```

---

## 6. 自定义追踪

### 6.1 自定义 Span

**创建 Span**：
```java
@Service
public class CustomTracingService {
    
    @Autowired
    private Tracer tracer;
    
    public void complexOperation() {
        // 创建自定义 Span
        Span span = tracer.nextSpan().name("complex-operation");
        
        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span.start())) {
            // 添加标签
            span.tag("operation.type", "batch");
            span.tag("batch.size", "100");
            
            // 业务逻辑
            step1();
            step2();
            step3();
            
        } catch (Exception e) {
            span.tag("error", "true");
            span.tag("error.message", e.getMessage());
            throw e;
        } finally {
            span.finish();
        }
    }
    
    private void step1() {
        Span span = tracer.nextSpan().name("step-1").start();
        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span)) {
            // 步骤1逻辑
        } finally {
            span.finish();
        }
    }
}
```

---

### 6.2 追踪 Redis 操作

**自定义 Redis 追踪**：
```java
@Component
@Aspect
public class RedisTracingAspect {
    
    @Autowired
    private Tracer tracer;
    
    @Around("execution(* org.springframework.data.redis.core.RedisTemplate.*(..))")
    public Object trace(ProceedingJoinPoint joinPoint) throws Throwable {
        Span span = tracer.nextSpan().name("redis." + joinPoint.getSignature().getName());
        
        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span.start())) {
            span.tag("redis.operation", joinPoint.getSignature().getName());
            span.tag("redis.key", getKey(joinPoint.getArgs()));
            
            return joinPoint.proceed();
            
        } catch (Exception e) {
            span.tag("error", "true");
            throw e;
        } finally {
            span.finish();
        }
    }
    
    private String getKey(Object[] args) {
        return args.length > 0 ? String.valueOf(args[0]) : "unknown";
    }
}
```

---

## 7. 监控告警

### 7.1 Trace 指标监控

**关键指标**：
```promql
# Trace 总数
sum(rate(zipkin_collector_messages_total[5m]))

# Span 总数
sum(rate(zipkin_collector_spans_total[5m]))

# 错误 Trace 比例
sum(rate(zipkin_collector_spans_total{error="true"}[5m])) 
/ 
sum(rate(zipkin_collector_spans_total[5m]))
```

---

### 7.2 告警规则

**Prometheus 告警**：
```yaml
groups:
  - name: tracing-alerts
    rules:
      # 错误率告警
      - alert: HighTraceErrorRate
        expr: |
          sum(rate(zipkin_collector_spans_total{error="true"}[5m])) 
          / 
          sum(rate(zipkin_collector_spans_total[5m])) 
          > 0.05
        for: 5m
        annotations:
          summary: "Trace 错误率超过 5%"
      
      # Zipkin 存储空间告警
      - alert: ZipkinStorageFull
        expr: zipkin_storage_utilization > 0.9
        for: 5m
        annotations:
          summary: "Zipkin 存储空间使用率超过 90%"
```

---

## 8. 学习自检清单

- [ ] 理解分布式追踪核心原理
- [ ] 掌握 Sleuth 采样策略
- [ ] 能够添加自定义标签和日志
- [ ] 掌握异步任务追踪
- [ ] 了解 Zipkin 数据持久化
- [ ] 能够使用 Zipkin 分析性能
- [ ] 掌握性能优化技巧
- [ ] 能够自定义追踪逻辑
- [ ] 掌握监控告警配置

---

## 9. 面试高频题

**Q1：Sleuth 如何传递 Trace ID？**

**参考答案**：
- HTTP：通过请求头（X-B3-TraceId、X-B3-SpanId）
- 消息队列：通过消息头
- 线程池：通过 TraceContext 传递
- 核心：ThreadLocal + InheritableThreadLocal

**Q2：如何优化链路追踪性能？**

**参考答案**：
1. 降低采样率（0.1）
2. 异步上报（RabbitMQ）
3. 数据压缩
4. 减少标签和日志
5. 使用高性能存储（Elasticsearch）

**Q3：如何通过 Zipkin 定位性能瓶颈？**

**参考答案**：
1. 搜索慢 Trace（最小耗时 > 1000ms）
2. 查看 Trace 时间轴
3. 识别耗时最长的 Span
4. 查看 Span 标签（SQL、Redis 等）
5. 优化瓶颈点

---

**本章小结**：
- 核心原理：Trace、Span、TraceContext
- Sleuth 配置：采样策略、标签日志、异步追踪
- Zipkin 特性：数据持久化、依赖分析、Trace 搜索
- 性能优化：采样率、异步上报、数据压缩
- 实战场景：性能分析、故障定位、依赖分析
- 自定义追踪：自定义 Span、Redis 追踪
- 监控告警：Trace 指标、错误率告警

**下一章预告**：第32章 - Seata 分布式事务深入

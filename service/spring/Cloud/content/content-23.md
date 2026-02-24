# 第23章：Gateway 性能优化与生产实践

> **本章目标**：掌握 Gateway 性能优化技巧，解决生产环境常见问题，确保网关高可用

---

## 1. 性能优化

### 1.1 Netty 优化

**配置线程池**：
```yaml
spring:
  cloud:
    gateway:
      httpclient:
        pool:
          type: FIXED  # 连接池类型：FIXED/ELASTIC
          max-connections: 1000  # 最大连接数
          max-idle-time: 10000  # 最大空闲时间（毫秒）
        connect-timeout: 2000  # 连接超时
        response-timeout: 5000  # 响应超时
```

**代码配置**：
```java
@Configuration
public class NettyConfig {
    
    @Bean
    public NettyReactiveWebServerFactory nettyReactiveWebServerFactory() {
        NettyReactiveWebServerFactory factory = new NettyReactiveWebServerFactory();
        factory.addServerCustomizers(httpServer -> 
            httpServer
                .option(ChannelOption.SO_BACKLOG, 1024)  // TCP 连接队列
                .option(ChannelOption.SO_REUSEADDR, true)  // 地址复用
                .childOption(ChannelOption.SO_KEEPALIVE, true)  // 保持连接
                .childOption(ChannelOption.TCP_NODELAY, true)  // 禁用 Nagle 算法
        );
        return factory;
    }
}
```

---

### 1.2 日志优化

**生产环境日志配置**：
```yaml
logging:
  level:
    root: INFO
    org.springframework.cloud.gateway: INFO
    reactor.netty: INFO
  
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

**只记录必要日志**：
```java
@Component
@Order(0)
public class AccessLogFilter implements GlobalFilter {
    
    private static final Logger log = LoggerFactory.getLogger(AccessLogFilter.class);
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        
        return chain.filter(exchange).then(
            Mono.fromRunnable(() -> {
                long duration = System.currentTimeMillis() - startTime;
                
                // 只记录慢请求
                if (duration > 1000) {
                    String path = exchange.getRequest().getURI().getPath();
                    log.warn("Slow request: {} took {}ms", path, duration);
                }
            })
        );
    }
}
```

---

### 1.3 缓存优化

**路由缓存**：
```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      
      # 缓存路由定义
      routes-cache-ttl: 600  # 路由缓存时间（秒）
```

**服务实例缓存**：
```java
@Configuration
public class LoadBalancerConfig {
    
    @Bean
    public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        return ServiceInstanceListSupplier.builder()
            .withDiscoveryClient()
            .withCaching()  // 开启缓存
            .build(context);
    }
}
```

---

## 2. 高可用架构

### 2.1 Gateway 集群部署

**架构**：
```
Nginx/LVS（负载均衡）
    ↓
┌─────────┬─────────┬─────────┐
│Gateway-1│Gateway-2│Gateway-3│（集群）
└─────────┴─────────┴─────────┘
    ↓
微服务集群
```

**Nginx 配置**：
```nginx
upstream gateway-cluster {
    server 192.168.1.10:8000 weight=1 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8000 weight=1 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:8000 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.demo.com;
    
    location / {
        proxy_pass http://gateway-cluster;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # 超时配置
        proxy_connect_timeout 5s;
        proxy_read_timeout 30s;
        proxy_send_timeout 30s;
    }
}
```

---

### 2.2 健康检查

**配置 Actuator**：
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
  
  health:
    redis:
      enabled: true
    diskspace:
      enabled: true
```

**自定义健康检查**：
```java
@Component
public class GatewayHealthIndicator implements HealthIndicator {
    
    @Autowired
    private RouteDefinitionLocator routeDefinitionLocator;
    
    @Override
    public Health health() {
        try {
            long routeCount = routeDefinitionLocator.getRouteDefinitions().count().block();
            
            if (routeCount > 0) {
                return Health.up()
                    .withDetail("routeCount", routeCount)
                    .build();
            } else {
                return Health.down()
                    .withDetail("reason", "No routes configured")
                    .build();
            }
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}
```

---

### 2.3 优雅停机

**配置**：
```yaml
server:
  shutdown: graceful  # 优雅停机

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s  # 停机超时时间
```

**实现**：
```java
@Component
public class GracefulShutdown implements ApplicationListener<ContextClosedEvent> {
    
    private static final Logger log = LoggerFactory.getLogger(GracefulShutdown.class);
    
    @Override
    public void onApplicationEvent(ContextClosedEvent event) {
        log.info("Gateway is shutting down gracefully...");
        
        try {
            // 等待请求处理完成
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        log.info("Gateway shutdown complete");
    }
}
```

---

## 3. 监控告警

### 3.1 Prometheus + Grafana

**引入依赖**：
```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**配置**：
```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: ${spring.application.name}
```

**关键指标**：
```
- gateway_requests_total：总请求数
- gateway_requests_duration：请求耗时
- gateway_requests_active：当前活跃请求数
- http_server_requests_seconds：HTTP 请求耗时
```

**Grafana Dashboard**：
```json
{
  "panels": [
    {
      "title": "Request Rate",
      "targets": [{
        "expr": "rate(gateway_requests_total[5m])"
      }]
    },
    {
      "title": "P99 Latency",
      "targets": [{
        "expr": "histogram_quantile(0.99, rate(gateway_requests_duration_bucket[5m]))"
      }]
    },
    {
      "title": "Error Rate",
      "targets": [{
        "expr": "rate(gateway_requests_total{status=~\"5..\"}[5m])"
      }]
    }
  ]
}
```

---

### 3.2 告警规则

**Prometheus 告警**：
```yaml
groups:
  - name: gateway
    rules:
      - alert: GatewayHighErrorRate
        expr: rate(gateway_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Gateway 错误率过高"
      
      - alert: GatewayHighLatency
        expr: histogram_quantile(0.99, rate(gateway_requests_duration_bucket[5m])) > 1000
        for: 5m
        annotations:
          summary: "Gateway P99 延迟 > 1s"
      
      - alert: GatewayDown
        expr: up{job="api-gateway"} == 0
        for: 1m
        annotations:
          summary: "Gateway 服务不可用"
```

---

## 4. 安全加固

### 4.1 防 SQL 注入

**过滤器**：
```java
@Component
@Order(-150)
public class SqlInjectionFilter implements GlobalFilter {
    
    private static final Pattern SQL_PATTERN = Pattern.compile(
        "('.+--)|(--)|(\\|)|(%7C)|(;)|(union)|(select)|(drop)|(insert)|(update)|(delete)|(exec)",
        Pattern.CASE_INSENSITIVE
    );
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String queryString = exchange.getRequest().getURI().getQuery();
        
        if (queryString != null && SQL_PATTERN.matcher(queryString).find()) {
            return forbidden(exchange, "Potential SQL injection detected");
        }
        
        return chain.filter(exchange);
    }
    
    private Mono<Void> forbidden(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }
}
```

---

### 4.2 防 XSS 攻击

**过滤器**：
```java
@Component
@Order(-149)
public class XssFilter implements GlobalFilter {
    
    private static final Pattern XSS_PATTERN = Pattern.compile(
        "(<script>)|(</script>)|(<iframe>)|(</iframe>)|(javascript:)|(onerror=)|(onload=)",
        Pattern.CASE_INSENSITIVE
    );
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String queryString = exchange.getRequest().getURI().getQuery();
        
        if (queryString != null && XSS_PATTERN.matcher(queryString).find()) {
            return forbidden(exchange, "Potential XSS attack detected");
        }
        
        return chain.filter(exchange);
    }
    
    private Mono<Void> forbidden(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }
}
```

---

### 4.3 IP 黑白名单

**实现**：
```java
@Component
@Order(-200)
public class IpFilterFilter implements GlobalFilter {
    
    @Value("${gateway.ip.whitelist:}")
    private List<String> whitelist;
    
    @Value("${gateway.ip.blacklist:}")
    private List<String> blacklist;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String ip = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
        
        // 黑名单拦截
        if (blacklist.contains(ip)) {
            return forbidden(exchange, "IP blocked");
        }
        
        // 白名单检查（如果配置了白名单）
        if (!whitelist.isEmpty() && !whitelist.contains(ip)) {
            return forbidden(exchange, "IP not allowed");
        }
        
        return chain.filter(exchange);
    }
    
    private Mono<Void> forbidden(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }
}
```

**配置**：
```yaml
gateway:
  ip:
    whitelist:
      - 192.168.1.0/24
    blacklist:
      - 10.0.0.100
```

---

## 5. 常见问题排查

### 5.1 路由不生效

**排查清单**：
```
□ 检查路由配置是否正确
□ 检查断言是否匹配
□ 检查服务是否注册到 Nacos
□ 检查 Gateway 日志
□ 使用 /actuator/gateway/routes 查看路由
```

**查看路由**：
```bash
curl http://localhost:8000/actuator/gateway/routes | jq .
```

---

### 5.2 504 Gateway Timeout

**原因**：
- 下游服务响应慢
- 超时配置不合理

**排查**：
```yaml
# 增加超时时间
spring:
  cloud:
    gateway:
      httpclient:
        connect-timeout: 5000
        response-timeout: 30000
```

---

### 5.3 内存溢出

**原因**：
- 请求响应体过大
- 未设置内存限制

**解决方案**：
```yaml
# 限制请求体大小
spring:
  codec:
    max-in-memory-size: 10MB

# JVM 参数
# -Xms2g -Xmx2g -XX:+UseG1GC
```

---

## 6. 压测与调优

### 6.1 压测工具

**JMeter 压测**：
```
线程数：1000
循环次数：10000
请求：GET http://localhost:8000/user/1
```

**结果分析**：
```
TPS：5000
平均响应时间：20ms
P99 响应时间：50ms
错误率：0%
```

---

### 6.2 调优参数

**JVM 参数**：
```bash
java -jar gateway.jar \
  -Xms4g \
  -Xmx4g \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/tmp/gateway-heap.hprof
```

**Netty 参数**：
```yaml
spring:
  cloud:
    gateway:
      httpclient:
        pool:
          max-connections: 2000
        wiretap: false  # 关闭网络调试
```

---

## 7. 最佳实践总结

### 7.1 生产环境清单

```
✅ Gateway 集群部署（至少3个实例）
✅ Nginx 负载均衡
✅ 健康检查配置
✅ 优雅停机
✅ 监控告警（Prometheus + Grafana）
✅ 日志收集（ELK）
✅ 链路追踪（Sleuth + Zipkin）
✅ 限流配置
✅ 熔断配置
✅ 安全加固（防注入、防XSS、IP过滤）
✅ 压测验证
```

---

### 7.2 配置推荐

**开发环境**：
```yaml
spring:
  cloud:
    gateway:
      httpclient:
        connect-timeout: 5000
        response-timeout: 10000
      discovery:
        locator:
          enabled: true

logging:
  level:
    org.springframework.cloud.gateway: DEBUG
```

**生产环境**：
```yaml
spring:
  cloud:
    gateway:
      httpclient:
        pool:
          max-connections: 2000
        connect-timeout: 2000
        response-timeout: 5000
      discovery:
        locator:
          enabled: false  # 禁用自动路由

logging:
  level:
    org.springframework.cloud.gateway: INFO

management:
  endpoints:
    web:
      exposure:
        include: health,prometheus
```

---

## 8. 学习自检清单

- [ ] 掌握 Netty 优化配置
- [ ] 掌握日志优化策略
- [ ] 理解 Gateway 集群部署
- [ ] 能够配置健康检查
- [ ] 能够配置监控告警
- [ ] 掌握安全加固措施
- [ ] 能够排查常见问题
- [ ] 掌握压测与调优

---

**本章小结**：
- 性能优化：Netty 配置、日志优化、缓存优化
- 高可用：集群部署、健康检查、优雅停机
- 监控告警：Prometheus + Grafana、关键指标、告警规则
- 安全加固：防 SQL 注入、防 XSS、IP 黑白名单
- 问题排查：路由不生效、504 超时、内存溢出
- 压测调优：JMeter 压测、JVM 参数、Netty 参数
- 最佳实践：生产环境清单、配置推荐

**Gateway 部分完成（第21-23章），继续生成 Sentinel 部分...**

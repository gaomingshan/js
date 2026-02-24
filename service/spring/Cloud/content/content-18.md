# 第18章：OpenFeign 性能优化与降级

> **本章目标**：掌握 Feign 性能优化技巧，实现服务降级和容错，确保生产环境稳定性

---

## 1. 连接池优化

### 1.1 问题分析

**默认 HttpURLConnection 问题**：
- 不支持连接池
- 每次请求都创建新连接
- 性能差

**测试对比**：
```
HttpURLConnection：  
- QPS: 500
- P99延迟: 200ms

OkHttp（连接池）：
- QPS: 2000
- P99延迟: 50ms
```

---

### 1.2 替换为 OkHttp

**pom.xml**：
```xml
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
</dependency>
```

**配置**：
```yaml
feign:
  okhttp:
    enabled: true
  httpclient:
    enabled: false
```

**高级配置**：
```java
@Configuration
public class FeignOkHttpConfig {
    
    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
            // 连接超时
            .connectTimeout(2, TimeUnit.SECONDS)
            // 读取超时
            .readTimeout(5, TimeUnit.SECONDS)
            // 写入超时
            .writeTimeout(5, TimeUnit.SECONDS)
            // 连接池（最大空闲连接数、存活时间）
            .connectionPool(new ConnectionPool(200, 5, TimeUnit.MINUTES))
            // 重试
            .retryOnConnectionFailure(true)
            // 拦截器
            .addInterceptor(new LoggingInterceptor())
            .build();
    }
}
```

---

### 1.3 连接池参数调优

**关键参数**：
```java
new ConnectionPool(
    maxIdleConnections,  // 最大空闲连接数
    keepAliveDuration,   // 连接存活时间
    timeUnit            // 时间单位
)
```

**推荐配置**：
```
开发环境：50个空闲连接，5分钟存活
测试环境：100个空闲连接，5分钟存活
生产环境：200个空闲连接，10分钟存活
```

---

## 2. 超时优化

### 2.1 超时时间设置原则

**原则**：
```
连接超时 < 读取超时 < 业务超时

推荐值：
- 连接超时：1-2秒
- 读取超时：3-5秒
- 业务超时（Hystrix/Sentinel）：10秒
```

**配置**：
```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 2000
        readTimeout: 5000
      
      slow-service:
        connectTimeout: 3000
        readTimeout: 10000
```

---

### 2.2 避免超时堆积

**问题**：
- 大量请求超时
- 线程池耗尽
- 服务雪崩

**解决方案**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Request.Options options() {
        return new Request.Options(
            2000,   // 连接超时
            5000,   // 读取超时
            true    // 跟随重定向
        );
    }
    
    @Bean
    public Retryer retryer() {
        // 快速失败，不重试
        return Retryer.NEVER_RETRY;
    }
}
```

---

## 3. 序列化优化

### 3.1 默认序列化性能

**Jackson 性能测试**：
```
序列化 10000 次：200ms
反序列化 10000 次：250ms
```

---

### 3.2 替换为 Fastjson

**pom.xml**：
```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>2.0.25</version>
</dependency>
```

**自定义编解码器**：
```java
public class FastjsonEncoder implements Encoder {
    
    @Override
    public void encode(Object object, Type bodyType, RequestTemplate template) {
        String json = JSON.toJSONString(object);
        template.body(json, StandardCharsets.UTF_8);
    }
}

public class FastjsonDecoder implements Decoder {
    
    @Override
    public Object decode(Response response, Type type) throws IOException {
        if (response.body() == null) {
            return null;
        }
        
        String json = Util.toString(response.body().asReader(StandardCharsets.UTF_8));
        return JSON.parseObject(json, type);
    }
}
```

**配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Encoder feignEncoder() {
        return new FastjsonEncoder();
    }
    
    @Bean
    public Decoder feignDecoder() {
        return new FastjsonDecoder();
    }
}
```

**性能对比**：
```
Fastjson：
序列化 10000 次：100ms
反序列化 10000 次：120ms

性能提升：约 2 倍
```

---

## 4. 压缩优化

### 4.1 请求压缩

**配置**：
```yaml
feign:
  compression:
    request:
      enabled: true
      mime-types: application/json,text/xml
      min-request-size: 2048  # 超过 2KB 才压缩
```

**效果**：
```
原始请求：10KB
压缩后：3KB
压缩比：70%
```

---

### 4.2 响应压缩

**配置**：
```yaml
feign:
  compression:
    response:
      enabled: true
      useGzipDecoder: true
```

**服务端配置**：
```yaml
server:
  compression:
    enabled: true
    mime-types: application/json,text/xml
    min-response-size: 2048
```

---

## 5. 日志优化

### 5.1 生产环境日志配置

**问题**：
- FULL 日志级别会记录请求响应体，影响性能
- 大量日志影响磁盘 I/O

**推荐配置**：
```yaml
# 开发环境
feign:
  client:
    config:
      default:
        loggerLevel: FULL

logging:
  level:
    com.demo.order.client: DEBUG

# 生产环境
feign:
  client:
    config:
      default:
        loggerLevel: BASIC  # 只记录方法、URL、状态码、耗时

logging:
  level:
    com.demo.order.client: INFO
```

---

### 5.2 自定义日志

**实现**：
```java
public class CustomFeignLogger extends Logger {
    
    private static final org.slf4j.Logger log = 
        LoggerFactory.getLogger(CustomFeignLogger.class);
    
    @Override
    protected void log(String configKey, String format, Object... args) {
        // 只记录关键信息
        log.info(String.format(methodTag(configKey) + format, args));
    }
    
    @Override
    protected void logRequest(String configKey, Level logLevel, Request request) {
        // 记录请求摘要
        log.info("{} {} {}", request.httpMethod(), request.url(), request.headers());
    }
    
    @Override
    protected Response logAndRebufferResponse(
            String configKey, Level logLevel, Response response, long elapsedTime) {
        
        // 记录响应摘要
        log.info("{} {} in {}ms", response.status(), configKey, elapsedTime);
        
        return response;
    }
}
```

**配置**：
```java
@Bean
public Logger feignLogger() {
    return new CustomFeignLogger();
}
```

---

## 6. 服务降级

### 6.1 使用 fallback

**Feign 客户端**：
```java
@FeignClient(
    name = "user-service",
    fallback = UserClientFallback.class
)
public interface UserClient {
    
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}
```

**降级实现**：
```java
@Component
public class UserClientFallback implements UserClient {
    
    @Override
    public UserDTO getUser(Long id) {
        // 返回默认值
        UserDTO user = new UserDTO();
        user.setId(id);
        user.setName("默认用户");
        return user;
    }
}
```

**开启降级**：
```yaml
feign:
  circuitbreaker:
    enabled: true
```

---

### 6.2 使用 fallbackFactory

**优势**：可以获取异常信息。

**实现**：
```java
@Component
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    
    @Override
    public UserClient create(Throwable cause) {
        return new UserClient() {
            @Override
            public UserDTO getUser(Long id) {
                // 记录异常
                log.error("Failed to get user {}", id, cause);
                
                // 根据异常类型返回不同结果
                if (cause instanceof FeignException.NotFound) {
                    throw new NotFoundException("User not found: " + id);
                }
                
                if (cause instanceof FeignException.ServiceUnavailable) {
                    // 返回默认值
                    UserDTO user = new UserDTO();
                    user.setId(id);
                    user.setName("服务暂时不可用");
                    return user;
                }
                
                // 其他异常抛出
                throw new RuntimeException("Failed to get user", cause);
            }
        };
    }
}
```

**配置**：
```java
@FeignClient(
    name = "user-service",
    fallbackFactory = UserClientFallbackFactory.class
)
public interface UserClient {
}
```

---

### 6.3 结合 Sentinel 熔断

**pom.xml**：
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

**配置**：
```yaml
feign:
  sentinel:
    enabled: true

spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
```

**Feign 客户端**：
```java
@FeignClient(
    name = "user-service",
    fallback = UserClientFallback.class
)
public interface UserClient {
    
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}
```

**熔断规则**（Sentinel 控制台配置）：
```
资源名：GET:http://user-service/user/{id}
熔断策略：慢调用比例
最大RT：500ms
比例阈值：0.5（50%）
熔断时长：10秒
最小请求数：5
```

---

## 7. 批量调用优化

### 7.1 问题分析

**串行调用**：
```java
List<Long> userIds = Arrays.asList(1L, 2L, 3L);
List<UserDTO> users = new ArrayList<>();

for (Long userId : userIds) {
    UserDTO user = userClient.getUser(userId);  // 3次网络调用
    users.add(user);
}

// 总耗时：3 * 100ms = 300ms
```

---

### 7.2 并行调用

**使用 CompletableFuture**：
```java
List<Long> userIds = Arrays.asList(1L, 2L, 3L);

List<CompletableFuture<UserDTO>> futures = userIds.stream()
    .map(userId -> CompletableFuture.supplyAsync(() -> 
        userClient.getUser(userId)))
    .collect(Collectors.toList());

List<UserDTO> users = futures.stream()
    .map(CompletableFuture::join)
    .collect(Collectors.toList());

// 总耗时：100ms（并行）
```

**使用线程池**：
```java
@Configuration
public class AsyncConfig {
    
    @Bean
    public Executor feignExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("feign-");
        executor.initialize();
        return executor;
    }
}

@Service
public class UserService {
    
    @Autowired
    private UserClient userClient;
    
    @Autowired
    @Qualifier("feignExecutor")
    private Executor executor;
    
    public List<UserDTO> batchGetUsers(List<Long> userIds) {
        List<CompletableFuture<UserDTO>> futures = userIds.stream()
            .map(userId -> CompletableFuture.supplyAsync(
                () -> userClient.getUser(userId), 
                executor))
            .collect(Collectors.toList());
        
        return futures.stream()
            .map(CompletableFuture::join)
            .collect(Collectors.toList());
    }
}
```

---

### 7.3 批量接口

**服务端提供批量接口**：
```java
@RestController
public class UserController {
    
    @PostMapping("/user/batch")
    public List<UserDTO> batchGetUsers(@RequestBody List<Long> userIds) {
        return userService.batchGetUsers(userIds);
    }
}
```

**Feign 客户端**：
```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    @PostMapping("/user/batch")
    List<UserDTO> batchGetUsers(@RequestBody List<Long> userIds);
}
```

**调用**：
```java
List<Long> userIds = Arrays.asList(1L, 2L, 3L);
List<UserDTO> users = userClient.batchGetUsers(userIds);

// 总耗时：1次网络调用
```

---

## 8. 缓存策略

### 8.1 本地缓存

**使用 Caffeine**：
```xml
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

**配置**：
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(5, TimeUnit.MINUTES));
        return cacheManager;
    }
}
```

**使用**：
```java
@Service
public class UserService {
    
    @Autowired
    private UserClient userClient;
    
    @Cacheable(value = "users", key = "#userId")
    public UserDTO getUser(Long userId) {
        return userClient.getUser(userId);
    }
    
    @CacheEvict(value = "users", key = "#userId")
    public void updateUser(Long userId, UserDTO userDTO) {
        userClient.updateUser(userId, userDTO);
    }
}
```

---

### 8.2 分布式缓存

**使用 Redis**：
```java
@Service
public class UserService {
    
    @Autowired
    private UserClient userClient;
    
    @Autowired
    private RedisTemplate<String, UserDTO> redisTemplate;
    
    public UserDTO getUser(Long userId) {
        String key = "user:" + userId;
        
        // 从 Redis 获取
        UserDTO user = redisTemplate.opsForValue().get(key);
        
        if (user != null) {
            return user;
        }
        
        // 从远程服务获取
        user = userClient.getUser(userId);
        
        // 写入 Redis
        if (user != null) {
            redisTemplate.opsForValue().set(key, user, 5, TimeUnit.MINUTES);
        }
        
        return user;
    }
}
```

---

## 9. 监控与告警

### 9.1 Feign 监控指标

**关键指标**：
- 请求总数
- 成功/失败次数
- 平均响应时间
- P99 响应时间
- 降级次数

**集成 Micrometer**：
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
    tags:
      application: ${spring.application.name}
```

**自定义指标**：
```java
@Component
public class FeignMetricsInterceptor implements RequestInterceptor {
    
    private final MeterRegistry registry;
    
    @Autowired
    public FeignMetricsInterceptor(MeterRegistry registry) {
        this.registry = registry;
    }
    
    @Override
    public void apply(RequestTemplate template) {
        Timer.Sample sample = Timer.start(registry);
        
        template.interceptor(new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                sample.stop(Timer.builder("feign.requests")
                    .tag("service", template.feignTarget().name())
                    .tag("method", template.method())
                    .register(registry));
            }
        });
    }
}
```

---

### 9.2 告警规则

**Prometheus 告警**：
```yaml
groups:
  - name: feign
    rules:
      - alert: FeignHighErrorRate
        expr: rate(feign_requests_total{status="error"}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Feign 错误率过高"
      
      - alert: FeignHighLatency
        expr: histogram_quantile(0.99, rate(feign_requests_duration_bucket[5m])) > 1000
        for: 5m
        annotations:
          summary: "Feign P99 延迟 > 1s"
```

---

## 10. 最佳实践总结

### 10.1 性能优化清单

```
✅ 使用 OkHttp 替代默认客户端
✅ 配置连接池（200个空闲连接）
✅ 合理设置超时时间（连接2秒，读取5秒）
✅ 开启请求/响应压缩
✅ 生产环境使用 BASIC 日志级别
✅ 批量调用使用并行或批量接口
✅ 使用缓存减少远程调用
✅ 配置服务降级
✅ 配置监控和告警
✅ 禁用重试或谨慎配置重试
```

---

### 10.2 降级容错清单

```
✅ 配置 fallback 或 fallbackFactory
✅ 结合 Sentinel 熔断
✅ 设置合理的超时时间
✅ 快速失败，避免线程堆积
✅ 监控降级次数
✅ 提供降级开关（动态配置）
✅ 降级后记录日志和告警
```

---

## 11. 学习自检清单

- [ ] 掌握连接池优化（OkHttp 配置）
- [ ] 掌握超时优化原则
- [ ] 理解序列化性能优化
- [ ] 掌握压缩配置
- [ ] 掌握日志优化
- [ ] 能够实现服务降级（fallback、fallbackFactory）
- [ ] 能够优化批量调用
- [ ] 掌握缓存策略
- [ ] 能够配置监控和告警

**学习建议**：
- **预计学习时长**：3-4 小时
- **重点难点**：连接池优化、服务降级、批量调用优化
- **前置知识**：第16-17章 OpenFeign
- **实践建议**：替换 OkHttp、实现服务降级、配置监控

---

**本章小结**：
- 连接池优化：使用 OkHttp，配置连接池（200个空闲连接，10分钟存活）
- 超时优化：连接2秒，读取5秒，业务10秒
- 序列化优化：可替换为 Fastjson，性能提升2倍
- 压缩优化：请求/响应压缩，压缩比70%
- 日志优化：生产环境 BASIC 级别
- 服务降级：fallback（简单降级）、fallbackFactory（获取异常）、Sentinel（熔断）
- 批量调用优化：并行调用（CompletableFuture）、批量接口
- 缓存策略：本地缓存（Caffeine）、分布式缓存（Redis）
- 监控告警：Micrometer + Prometheus

**下一章预告**：第19章将介绍 Feign 最佳实践，包括接口设计规范、参数传递最佳实践、异常处理、安全认证、版本管理、测试策略。

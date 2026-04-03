# 第 17 章：Feign 超时重试与性能优化

> **学习目标**：掌握 Feign 性能优化方案、理解超时重试最佳实践、能够排查 Feign 性能问题  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. 超时配置最佳实践

### 1.1 超时时间设置原则

**合理的超时配置**：

```
Gateway 超时 > Feign 超时 > 下游服务处理时间

示例：
Gateway：30秒
Feign：10秒
下游服务：5秒处理完成

确保超时时间逐层递减，避免请求堆积
```

### 1.2 不同场景的超时配置

**快速查询接口**：

```yaml
feign:
  client:
    config:
      user-service:
        connectTimeout: 3000   # 3秒连接超时
        readTimeout: 5000      # 5秒读取超时
```

**慢查询接口（如报表）**：

```yaml
feign:
  client:
    config:
      report-service:
        connectTimeout: 5000   # 5秒连接超时
        readTimeout: 30000     # 30秒读取超时
```

**文件上传下载**：

```yaml
feign:
  client:
    config:
      file-service:
        connectTimeout: 5000   # 5秒连接超时
        readTimeout: 60000     # 60秒读取超时
```

### 1.3 动态超时配置

```java
@Service
public class DynamicTimeoutService {
    
    @Autowired
    private ApplicationContext applicationContext;
    
    public <T> T executeWithTimeout(Class<T> feignClientClass, 
                                     int connectTimeout, 
                                     int readTimeout,
                                     Function<T, Object> function) {
        
        // 1. 获取原始FeignClient
        T originalClient = applicationContext.getBean(feignClientClass);
        
        // 2. 创建自定义超时配置
        Request.Options options = new Request.Options(
            connectTimeout, TimeUnit.MILLISECONDS,
            readTimeout, TimeUnit.MILLISECONDS,
            true
        );
        
        // 3. 重新构建FeignClient（使用新超时配置）
        T customClient = Feign.builder()
            .options(options)
            .target(feignClientClass, getServiceUrl(feignClientClass));
        
        // 4. 执行调用
        return (T) function.apply(customClient);
    }
}
```

---

## 2. 重试机制深入（Retryer）

### 2.1 默认重试策略分析

**Retryer.Default 源码**：

```java
public static class Default implements Retryer {
    private final int maxAttempts;      // 最大重试次数
    private final long period;          // 初始间隔
    private final long maxPeriod;       // 最大间隔
    int attempt;
    long sleptForMillis;
    
    public Default() {
        this(100, SECONDS.toMillis(1), 5);
    }
    
    public Default(long period, long maxPeriod, int maxAttempts) {
        this.period = period;
        this.maxPeriod = maxPeriod;
        this.maxAttempts = maxAttempts;
        this.attempt = 1;
    }
    
    @Override
    public void continueOrPropagate(RetryableException e) {
        if (attempt++ >= maxAttempts) {
            throw e;
        }
        
        long interval;
        if (e.retryAfter() != null) {
            interval = e.retryAfter().getTime() - currentTimeMillis();
            if (interval > maxPeriod) {
                interval = maxPeriod;
            }
            if (interval < 0) {
                return;
            }
        } else {
            interval = nextMaxInterval();
        }
        
        try {
            Thread.sleep(interval);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
            throw e;
        }
        sleptForMillis += interval;
    }
    
    long nextMaxInterval() {
        long interval = (long) (period * Math.pow(1.5, attempt - 2));
        return Math.min(interval, maxPeriod);
    }
}
```

### 2.2 自定义指数退避重试

```java
public class ExponentialBackoffRetryer implements Retryer {
    
    private final int maxAttempts;
    private final long initialInterval;
    private final double multiplier;
    private final long maxInterval;
    private int attempt;
    
    public ExponentialBackoffRetryer() {
        this(3, 1000L, 2.0, 10000L);
    }
    
    public ExponentialBackoffRetryer(int maxAttempts, 
                                      long initialInterval,
                                      double multiplier, 
                                      long maxInterval) {
        this.maxAttempts = maxAttempts;
        this.initialInterval = initialInterval;
        this.multiplier = multiplier;
        this.maxInterval = maxInterval;
        this.attempt = 1;
    }
    
    @Override
    public void continueOrPropagate(RetryableException e) {
        if (attempt++ >= maxAttempts) {
            throw e;
        }
        
        // 计算退避时间：initialInterval * multiplier ^ (attempt - 1)
        long interval = (long) (initialInterval * Math.pow(multiplier, attempt - 2));
        interval = Math.min(interval, maxInterval);
        
        // 添加随机抖动（避免惊群效应）
        long jitter = (long) (interval * 0.1 * Math.random());
        interval += jitter;
        
        try {
            Thread.sleep(interval);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
            throw e;
        }
    }
    
    @Override
    public Retryer clone() {
        return new ExponentialBackoffRetryer(
            maxAttempts, initialInterval, multiplier, maxInterval);
    }
}
```

### 2.3 条件重试

```java
public class ConditionalRetryer implements Retryer {
    
    private final Retryer delegate;
    private final Predicate<RetryableException> retryPredicate;
    
    public ConditionalRetryer(Retryer delegate, 
                               Predicate<RetryableException> retryPredicate) {
        this.delegate = delegate;
        this.retryPredicate = retryPredicate;
    }
    
    @Override
    public void continueOrPropagate(RetryableException e) {
        // 判断是否应该重试
        if (!retryPredicate.test(e)) {
            throw e;
        }
        delegate.continueOrPropagate(e);
    }
    
    @Override
    public Retryer clone() {
        return new ConditionalRetryer(delegate.clone(), retryPredicate);
    }
}

// 使用示例
@Configuration
public class FeignConfig {
    
    @Bean
    public Retryer feignRetryer() {
        // 只对网络错误重试，不对业务错误重试
        return new ConditionalRetryer(
            new Retryer.Default(100, 1000, 3),
            e -> {
                // 只重试 503/504 错误
                if (e.getCause() instanceof FeignException) {
                    int status = ((FeignException) e.getCause()).status();
                    return status == 503 || status == 504;
                }
                return true;
            }
        );
    }
}
```

### 2.4 重试最佳实践

**⚠️ 重试注意事项**：

```java
/**
 * 幂等操作才能重试
 */
// ✅ 可以重试
GET  /api/users/1       // 查询
PUT  /api/users/1       // 更新（幂等）
DELETE /api/users/1     // 删除（幂等）

// ❌ 不应该重试
POST /api/orders        // 创建订单（非幂等）
POST /api/payments      // 支付（非幂等）

/**
 * 配置建议
 */
// 1. 设置合理的重试次数（2-3次）
// 2. 使用指数退避策略
// 3. 添加随机抖动
// 4. 记录重试日志
// 5. 监控重试率
```

---

## 3. HTTP 客户端选择（HttpClient/OkHttp）

### 3.1 默认客户端（HttpURLConnection）

**特点**：
- JDK 内置，无需额外依赖
- 性能一般
- 连接池支持有限

**不推荐生产使用**

### 3.2 Apache HttpClient（推荐）

**引入依赖**：

```xml
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-httpclient</artifactId>
</dependency>
```

**配置**：

```yaml
feign:
  httpclient:
    enabled: true                      # 启用HttpClient
    max-connections: 200               # 最大连接数
    max-connections-per-route: 50      # 每个路由最大连接数
    connection-timeout: 5000           # 连接超时
    connection-timer-repeat: 3000      # 连接检查间隔
    time-to-live: 900                  # 连接存活时间
    time-to-live-unit: seconds         # 时间单位
```

**自定义配置**：

```java
@Configuration
public class HttpClientConfig {
    
    @Bean
    public CloseableHttpClient httpClient() {
        return HttpClients.custom()
            .setMaxConnTotal(200)           // 最大连接数
            .setMaxConnPerRoute(50)         // 每个路由最大连接数
            .setConnectionTimeToLive(900, TimeUnit.SECONDS)  // 连接存活时间
            .evictIdleConnections(30, TimeUnit.SECONDS)      // 清除空闲连接
            .disableAutomaticRetries()      // 禁用自动重试
            .setKeepAliveStrategy((response, context) -> 30 * 1000)  // Keep-Alive策略
            .build();
    }
}
```

### 3.3 OkHttp（高性能）

**引入依赖**：

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
    enabled: false  # 禁用HttpClient
```

**自定义配置**：

```java
@Configuration
public class OkHttpConfig {
    
    @Bean
    public okhttp3.OkHttpClient okHttpClient() {
        return new okhttp3.OkHttpClient.Builder()
            .connectTimeout(5, TimeUnit.SECONDS)       // 连接超时
            .readTimeout(10, TimeUnit.SECONDS)         // 读取超时
            .writeTimeout(10, TimeUnit.SECONDS)        // 写入超时
            .connectionPool(new ConnectionPool(
                200,                    // 最大空闲连接数
                5, TimeUnit.MINUTES     // 连接保持时间
            ))
            .retryOnConnectionFailure(true)           // 连接失败重试
            .followRedirects(true)                    // 跟随重定向
            .addInterceptor(chain -> {
                Request request = chain.request();
                Response response = chain.proceed(request);
                // 自定义拦截逻辑
                return response;
            })
            .build();
    }
}
```

### 3.4 性能对比

| 客户端 | QPS | 响应时间 | 内存占用 | 推荐度 |
|--------|-----|---------|---------|--------|
| HttpURLConnection | 5000 | 50ms | 低 | ⭐⭐ |
| Apache HttpClient | 8000 | 30ms | 中 | ⭐⭐⭐⭐ |
| OkHttp | 10000 | 25ms | 中 | ⭐⭐⭐⭐⭐ |

---

## 4. 连接池配置优化

### 4.1 连接池核心参数

**max-connections（最大连接数）**：
- 所有路由的总连接数上限
- 建议值：200-500
- 计算公式：`max-connections = 并发请求数 * 1.5`

**max-connections-per-route（每个路由最大连接数）**：
- 单个服务的最大连接数
- 建议值：50-100
- 计算公式：`max-connections-per-route = max-connections / 服务数量 * 0.8`

**time-to-live（连接存活时间）**：
- 连接的最大存活时间
- 建议值：900秒（15分钟）
- 避免连接长期占用

### 4.2 连接池优化配置

**HttpClient 连接池优化**：

```java
@Configuration
public class HttpClientConfig {
    
    @Bean
    public CloseableHttpClient httpClient() {
        // 1. 创建连接管理器
        PoolingHttpClientConnectionManager connectionManager = 
            new PoolingHttpClientConnectionManager(
                30, TimeUnit.SECONDS  // 连接存活时间
            );
        
        // 2. 配置连接池
        connectionManager.setMaxTotal(200);              // 最大连接数
        connectionManager.setDefaultMaxPerRoute(50);     // 每个路由最大连接数
        connectionManager.setValidateAfterInactivity(2000);  // 空闲连接检查
        
        // 3. 创建HttpClient
        return HttpClients.custom()
            .setConnectionManager(connectionManager)
            .setConnectionManagerShared(false)          // 不共享连接管理器
            .evictExpiredConnections()                  // 清除过期连接
            .evictIdleConnections(30, TimeUnit.SECONDS) // 清除空闲连接
            .setKeepAliveStrategy((response, context) -> {
                // 自定义Keep-Alive策略
                HeaderElementIterator it = new BasicHeaderElementIterator(
                    response.headerIterator(HTTP.CONN_KEEP_ALIVE));
                
                while (it.hasNext()) {
                    HeaderElement he = it.nextElement();
                    String param = he.getName();
                    String value = he.getValue();
                    
                    if (value != null && param.equalsIgnoreCase("timeout")) {
                        return Long.parseLong(value) * 1000;
                    }
                }
                
                return 30 * 1000;  // 默认30秒
            })
            .setRetryHandler(new DefaultHttpRequestRetryHandler(0, false))  // 禁用重试
            .build();
    }
    
    /**
     * 定时清理空闲连接
     */
    @Bean
    public IdleConnectionEvictor idleConnectionEvictor(CloseableHttpClient httpClient) {
        return new IdleConnectionEvictor(httpClient);
    }
}

@Component
@Slf4j
class IdleConnectionEvictor {
    
    private final CloseableHttpClient httpClient;
    
    public IdleConnectionEvictor(CloseableHttpClient httpClient) {
        this.httpClient = httpClient;
    }
    
    @Scheduled(fixedDelay = 30000)  // 每30秒执行一次
    public void evictIdleConnections() {
        try {
            if (httpClient instanceof CloseableHttpClient) {
                HttpClientConnectionManager connectionManager = 
                    ((CloseableHttpClient) httpClient).getConnectionManager();
                
                if (connectionManager instanceof PoolingHttpClientConnectionManager) {
                    PoolingHttpClientConnectionManager poolManager = 
                        (PoolingHttpClientConnectionManager) connectionManager;
                    
                    poolManager.closeExpiredConnections();
                    poolManager.closeIdleConnections(30, TimeUnit.SECONDS);
                    
                    log.debug("清理空闲连接完成");
                }
            }
        } catch (Exception e) {
            log.error("清理空闲连接失败", e);
        }
    }
}
```

---

## 5. GZIP 压缩

### 5.1 启用 GZIP 压缩

```yaml
feign:
  compression:
    request:
      enabled: true                    # 启用请求压缩
      mime-types:                      # 压缩的MIME类型
        - text/xml
        - application/xml
        - application/json
      min-request-size: 2048           # 最小压缩大小（字节）
    
    response:
      enabled: true                    # 启用响应压缩
      useGzipDecoder: true             # 使用GZIP解码器
```

### 5.2 压缩效果

**压缩前后对比**：

```
JSON 响应（10KB）
- 未压缩：10240 字节
- GZIP压缩：1024 字节（压缩率 90%）

传输时间（100Mbps 带宽）
- 未压缩：0.8ms
- GZIP压缩：0.08ms（提升 10 倍）
```

### 5.3 压缩注意事项

```
✅ 适合压缩的场景：
- 响应体较大（>2KB）
- JSON/XML 格式数据
- 网络带宽有限

❌ 不适合压缩的场景：
- 响应体很小（<1KB）
- 图片/视频等已压缩格式
- CPU 资源紧张
```

---

## 6. 日志性能影响

### 6.1 日志级别对性能的影响

**性能测试**：

| 日志级别 | QPS | 响应时间 | CPU使用率 |
|---------|-----|---------|----------|
| NONE | 10000 | 10ms | 20% |
| BASIC | 9500 | 11ms | 25% |
| HEADERS | 8000 | 13ms | 35% |
| FULL | 5000 | 20ms | 50% |

**结论**：
- FULL 级别性能下降 50%
- 生产环境建议使用 BASIC 或 NONE

### 6.2 条件日志

```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Logger.Level feignLoggerLevel(Environment environment) {
        // 根据环境动态设置日志级别
        String env = environment.getProperty("spring.profiles.active");
        
        if ("prod".equals(env)) {
            return Logger.Level.NONE;      // 生产环境：不记录
        } else if ("test".equals(env)) {
            return Logger.Level.BASIC;     // 测试环境：基本信息
        } else {
            return Logger.Level.FULL;      // 开发环境：完整日志
        }
    }
}
```

---

## 7. 批量调用优化

### 7.1 并行调用

```java
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserClient userClient;
    private final OrderClient orderClient;
    private final ProductClient productClient;
    
    /**
     * 串行调用（耗时：300ms）
     */
    public UserDetailVO getUserDetailSerial(Long userId) {
        User user = userClient.getUser(userId);              // 100ms
        List<Order> orders = orderClient.getUserOrders(userId);  // 100ms
        List<Product> products = productClient.getProducts();    // 100ms
        
        return buildUserDetail(user, orders, products);
    }
    
    /**
     * 并行调用（耗时：100ms）
     */
    public UserDetailVO getUserDetailParallel(Long userId) {
        CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(
            () -> userClient.getUser(userId)
        );
        
        CompletableFuture<List<Order>> orderFuture = CompletableFuture.supplyAsync(
            () -> orderClient.getUserOrders(userId)
        );
        
        CompletableFuture<List<Product>> productFuture = CompletableFuture.supplyAsync(
            () -> productClient.getProducts()
        );
        
        // 等待所有请求完成
        CompletableFuture.allOf(userFuture, orderFuture, productFuture).join();
        
        return buildUserDetail(
            userFuture.join(),
            orderFuture.join(),
            productFuture.join()
        );
    }
}
```

### 7.2 批量接口

```java
// ❌ 不推荐：循环调用
public List<User> getUsers(List<Long> userIds) {
    List<User> users = new ArrayList<>();
    for (Long userId : userIds) {
        users.add(userClient.getUser(userId));  // N 次调用
    }
    return users;
}

// ✅ 推荐：批量接口
public List<User> getUsers(List<Long> userIds) {
    return userClient.batchGetUsers(userIds);  // 1 次调用
}

@FeignClient(name = "user-service")
public interface UserClient {
    
    @PostMapping("/api/users/batch")
    List<User> batchGetUsers(@RequestBody List<Long> userIds);
}
```

---

## 8. 性能监控与指标

### 8.1 自定义性能监控

```java
@Aspect
@Component
@Slf4j
public class FeignPerformanceAspect {
    
    private final MeterRegistry meterRegistry;
    
    @Around("@within(org.springframework.cloud.openfeign.FeignClient)")
    public Object monitorPerformance(ProceedingJoinPoint pjp) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = pjp.getSignature().toShortString();
        
        try {
            Object result = pjp.proceed();
            
            // 记录成功调用
            long duration = System.currentTimeMillis() - startTime;
            
            Timer.builder("feign.client.calls")
                .tag("method", methodName)
                .tag("status", "success")
                .register(meterRegistry)
                .record(duration, TimeUnit.MILLISECONDS);
            
            log.info("Feign调用成功: {} 耗时: {}ms", methodName, duration);
            
            return result;
            
        } catch (Exception e) {
            // 记录失败调用
            long duration = System.currentTimeMillis() - startTime;
            
            Counter.builder("feign.client.errors")
                .tag("method", methodName)
                .tag("exception", e.getClass().getSimpleName())
                .register(meterRegistry)
                .increment();
            
            log.error("Feign调用失败: {} 耗时: {}ms 异常: {}", 
                methodName, duration, e.getMessage());
            
            throw e;
        }
    }
}
```

### 8.2 Prometheus 指标

```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,metrics
  metrics:
    tags:
      application: ${spring.application.name}
```

**指标查询**：

```promql
# Feign 调用成功率
sum(rate(feign_client_calls_total{status="success"}[5m])) 
/ 
sum(rate(feign_client_calls_total[5m]))

# Feign 平均响应时间
rate(feign_client_calls_sum[5m]) 
/ 
rate(feign_client_calls_count[5m])

# Feign 错误率
rate(feign_client_errors_total[5m])
```

---

## 9. 性能优化清单

### 9.1 配置优化

```yaml
feign:
  # ✅ 使用OkHttp或HttpClient
  okhttp:
    enabled: true
  
  # ✅ 配置连接池
  httpclient:
    max-connections: 200
    max-connections-per-route: 50
  
  # ✅ 启用GZIP压缩
  compression:
    request:
      enabled: true
      min-request-size: 2048
    response:
      enabled: true
  
  # ✅ 合理的超时配置
  client:
    config:
      default:
        connectTimeout: 3000
        readTimeout: 10000
  
  # ⚠️ 生产环境禁用详细日志
  # loggerLevel: NONE
```

### 9.2 代码优化

```java
// ✅ 使用批量接口
userClient.batchGetUsers(userIds);

// ✅ 并行调用
CompletableFuture.allOf(future1, future2).join();

// ✅ 合理的重试策略
@Bean
public Retryer retryer() {
    return new Retryer.Default(100, 1000, 3);
}

// ✅ 条件重试（只重试网络错误）
@Bean
public Retryer conditionalRetryer() {
    return new ConditionalRetryer(
        new Retryer.Default(),
        e -> isNetworkError(e)
    );
}
```

---

## 10. 面试要点

### 10.1 基础问题

**Q1：如何优化 Feign 性能？**

1. 使用 OkHttp/HttpClient 替换默认客户端
2. 配置连接池（max-connections/max-connections-per-route）
3. 启用 GZIP 压缩
4. 合理设置超时时间
5. 生产环境禁用详细日志
6. 使用批量接口
7. 并行调用

**Q2：Feign 重试有什么注意事项？**

1. 只对幂等操作重试（GET/PUT/DELETE）
2. 不要对 POST 重试（非幂等）
3. 设置合理的重试次数（2-3次）
4. 使用指数退避策略
5. 记录重试日志

### 10.2 进阶问题

**Q3：OkHttp 和 HttpClient 的区别？**

| 特性 | OkHttp | HttpClient |
|------|--------|------------|
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 连接池 | ✅ 优秀 | ✅ 良好 |
| HTTP/2 | ✅ 支持 | ✅ 支持 |
| 生态 | Android 主流 | Java 主流 |

**Q4：如何排查 Feign 性能问题？**

1. 查看日志（响应时间、错误率）
2. 监控指标（Prometheus/Grafana）
3. 检查超时配置
4. 检查连接池配置
5. 分析慢查询
6. 检查网络延迟

### 10.3 架构问题

**Q5：如何设计高性能的 Feign 调用？**

1. 客户端：使用 OkHttp + 连接池
2. 超时：合理的超时配置
3. 重试：条件重试 + 指数退避
4. 压缩：启用 GZIP
5. 并发：并行调用
6. 批量：批量接口
7. 监控：Prometheus + Grafana

---

## 11. 参考资料

**官方文档**：
- [Feign Performance](https://github.com/OpenFeign/feign/wiki/FAQ#what-is-the-performance-of-feign)
- [OkHttp](https://square.github.io/okhttp/)
- [Apache HttpClient](https://hc.apache.org/httpcomponents-client-4.5.x/)

---

**下一章预告**：第 18 章将学习 Feign 最佳实践与故障排查，包括 Feign 降级处理最佳实践、Feign 异常处理、请求头传递、文件上传下载、常见问题排查等内容。

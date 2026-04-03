# 第 26 章：Resilience4j 实践

> **学习目标**：掌握 Resilience4j 使用、理解容错模式、能够对比两种熔断方案  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. Resilience4j 快速入门

### 1.1 Resilience4j 简介

**Resilience4j** 是一个轻量级的容错库，灵感来源于 Netflix Hystrix。

**核心模块**：
- ✅ CircuitBreaker（熔断器）
- ✅ RateLimiter（限流器）
- ✅ Bulkhead（隔离舱）
- ✅ Retry（重试）
- ✅ TimeLimiter（超时）
- ✅ Cache（缓存）

**Resilience4j vs Hystrix**：

| 特性 | Resilience4j | Hystrix |
|------|--------------|---------|
| 依赖 | 无依赖 | 依赖 RxJava |
| 隔离策略 | 信号量 | 线程池/信号量 |
| 实时监控 | ✅ Micrometer | ⚠️ 有限 |
| 函数式编程 | ✅ | ❌ |
| 维护状态 | ✅ 活跃 | ❌ 停止维护 |

### 1.2 添加依赖

```xml
<dependencies>
    <!-- Resilience4j Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
    </dependency>
    
    <!-- Resilience4j Reactor（WebFlux） -->
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-reactor</artifactId>
    </dependency>
    
    <!-- Micrometer（监控） -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
</dependencies>
```

### 1.3 基础配置

```yaml
resilience4j:
  circuitbreaker:
    instances:
      userService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
  
  ratelimiter:
    instances:
      userService:
        limitForPeriod: 10
        limitRefreshPeriod: 1s
  
  bulkhead:
    instances:
      userService:
        maxConcurrentCalls: 5
  
  retry:
    instances:
      userService:
        maxAttempts: 3
        waitDuration: 1s
```

---

## 2. CircuitBreaker 熔断器

### 2.1 基础使用

```java
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final CircuitBreakerFactory circuitBreakerFactory;
    private final UserClient userClient;
    
    public User getUserById(Long id) {
        CircuitBreaker circuitBreaker = circuitBreakerFactory.create("userService");
        
        return circuitBreaker.run(
            () -> userClient.getUser(id).getData(),  // 正常逻辑
            throwable -> createDefaultUser(id)        // 降级逻辑
        );
    }
    
    private User createDefaultUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setUsername("默认用户");
        return user;
    }
}
```

### 2.2 注解方式

```java
@Service
public class UserService {
    
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
    public User getUserById(Long id) {
        return userClient.getUser(id).getData();
    }
    
    /**
     * 降级方法
     * 参数：原方法参数 + Exception
     */
    private User getUserFallback(Long id, Exception ex) {
        log.error("getUserById 熔断降级，ID：{}", id, ex);
        return createDefaultUser(id);
    }
}
```

### 2.3 配置详解

```yaml
resilience4j:
  circuitbreaker:
    configs:
      default:  # 默认配置
        slidingWindowType: COUNT_BASED         # 滑动窗口类型：基于计数
        slidingWindowSize: 10                  # 滑动窗口大小：10个请求
        minimumNumberOfCalls: 5                # 最小调用次数：5
        failureRateThreshold: 50               # 失败率阈值：50%
        slowCallRateThreshold: 100             # 慢调用率阈值：100%
        slowCallDurationThreshold: 1s          # 慢调用时间阈值：1秒
        waitDurationInOpenState: 10s           # 熔断持续时间：10秒
        permittedNumberOfCallsInHalfOpenState: 3  # 半开状态允许调用次数：3
        automaticTransitionFromOpenToHalfOpenEnabled: true  # 自动转换
        recordExceptions:                      # 记录的异常
          - java.io.IOException
          - java.util.concurrent.TimeoutException
        ignoreExceptions:                      # 忽略的异常
          - java.lang.IllegalArgumentException
    
    instances:
      userService:
        baseConfig: default
```

### 2.4 熔断状态

**状态转换**：

```
CLOSED（关闭）
    ↓ 失败率 >= 50%
OPEN（熔断）
    ↓ 等待10秒
HALF_OPEN（半开）
    ↓ 
    ├─ 3次调用成功 → CLOSED
    └─ 任意调用失败 → OPEN
```

**监听状态变化**：

```java
@Component
public class CircuitBreakerEventListener {
    
    @PostConstruct
    public void init() {
        CircuitBreakerRegistry registry = CircuitBreakerRegistry.ofDefaults();
        CircuitBreaker circuitBreaker = registry.circuitBreaker("userService");
        
        circuitBreaker.getEventPublisher()
            .onStateTransition(event -> {
                log.info("熔断器状态变化：{} → {}", 
                    event.getStateTransition().getFromState(),
                    event.getStateTransition().getToState()
                );
            })
            .onSuccess(event -> log.debug("调用成功：{}", event))
            .onError(event -> log.error("调用失败：{}", event))
            .onIgnoredError(event -> log.debug("忽略错误：{}", event));
    }
}
```

---

## 3. RateLimiter 限流器

### 3.1 基础使用

```java
@Service
public class UserService {
    
    @RateLimiter(name = "userService", fallbackMethod = "getRateLimitFallback")
    public User getUserById(Long id) {
        return userClient.getUser(id).getData();
    }
    
    private User getRateLimitFallback(Long id, RequestNotPermitted ex) {
        log.warn("请求被限流，ID：{}", id);
        return createDefaultUser(id);
    }
}
```

### 3.2 配置

```yaml
resilience4j:
  ratelimiter:
    configs:
      default:
        limitForPeriod: 10              # 每个周期允许的请求数
        limitRefreshPeriod: 1s          # 周期时长
        timeoutDuration: 0              # 等待令牌超时时间（0=不等待）
    
    instances:
      userService:
        baseConfig: default
```

**限流算法**：

```
令牌桶算法：
- 每秒生成10个令牌
- 请求消耗1个令牌
- 无令牌时拒绝请求
```

### 3.3 编程式使用

```java
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final RateLimiterRegistry rateLimiterRegistry;
    
    public User getUserById(Long id) {
        RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter("userService");
        
        return RateLimiter.decorateSupplier(rateLimiter, () -> {
            return userClient.getUser(id).getData();
        }).get();
    }
}
```

---

## 4. Bulkhead 隔离舱

### 4.1 信号量隔离

**限制并发调用数**：

```java
@Service
public class UserService {
    
    @Bulkhead(name = "userService", fallbackMethod = "getBulkheadFallback")
    public User getUserById(Long id) {
        return userClient.getUser(id).getData();
    }
    
    private User getBulkheadFallback(Long id, BulkheadFullException ex) {
        log.warn("并发数已满，ID：{}", id);
        return createDefaultUser(id);
    }
}
```

**配置**：

```yaml
resilience4j:
  bulkhead:
    configs:
      default:
        maxConcurrentCalls: 5           # 最大并发调用数
        maxWaitDuration: 100ms          # 最大等待时间
    
    instances:
      userService:
        baseConfig: default
```

### 4.2 线程池隔离

```yaml
resilience4j:
  thread-pool-bulkhead:
    configs:
      default:
        coreThreadPoolSize: 5           # 核心线程数
        maxThreadPoolSize: 10           # 最大线程数
        queueCapacity: 100              # 队列容量
        keepAliveDuration: 20s          # 线程存活时间
    
    instances:
      userService:
        baseConfig: default
```

**使用**：

```java
@Bulkhead(name = "userService", type = Bulkhead.Type.THREADPOOL)
public CompletableFuture<User> getUserByIdAsync(Long id) {
    return CompletableFuture.supplyAsync(
        () -> userClient.getUser(id).getData()
    );
}
```

---

## 5. Retry 重试

### 5.1 基础使用

```java
@Service
public class UserService {
    
    @Retry(name = "userService", fallbackMethod = "getRetryFallback")
    public User getUserById(Long id) {
        return userClient.getUser(id).getData();
    }
    
    private User getRetryFallback(Long id, Exception ex) {
        log.error("重试失败，ID：{}", id, ex);
        return createDefaultUser(id);
    }
}
```

### 5.2 配置

```yaml
resilience4j:
  retry:
    configs:
      default:
        maxAttempts: 3                  # 最大重试次数
        waitDuration: 1s                # 重试间隔
        enableExponentialBackoff: true  # 启用指数退避
        exponentialBackoffMultiplier: 2 # 退避倍数
        retryExceptions:                # 重试的异常
          - java.io.IOException
          - java.util.concurrent.TimeoutException
        ignoreExceptions:               # 忽略的异常
          - java.lang.IllegalArgumentException
    
    instances:
      userService:
        baseConfig: default
```

**重试策略**：

```
指数退避：
第1次失败：等待1秒重试
第2次失败：等待2秒重试（1s * 2）
第3次失败：等待4秒重试（2s * 2）
```

### 5.3 监听重试事件

```java
@Component
public class RetryEventListener {
    
    @PostConstruct
    public void init() {
        RetryRegistry registry = RetryRegistry.ofDefaults();
        Retry retry = registry.retry("userService");
        
        retry.getEventPublisher()
            .onRetry(event -> {
                log.warn("重试：第{}次，异常：{}", 
                    event.getNumberOfRetryAttempts(),
                    event.getLastThrowable().getMessage()
                );
            })
            .onSuccess(event -> {
                log.info("重试成功：第{}次", event.getNumberOfRetryAttempts());
            })
            .onError(event -> {
                log.error("重试失败：第{}次", event.getNumberOfRetryAttempts());
            });
    }
}
```

---

## 6. TimeLimiter 超时

### 6.1 基础使用

```java
@Service
public class UserService {
    
    @TimeLimiter(name = "userService", fallbackMethod = "getTimeoutFallback")
    public CompletableFuture<User> getUserByIdAsync(Long id) {
        return CompletableFuture.supplyAsync(
            () -> userClient.getUser(id).getData()
        );
    }
    
    private CompletableFuture<User> getTimeoutFallback(Long id, TimeoutException ex) {
        log.warn("调用超时，ID：{}", id);
        return CompletableFuture.completedFuture(createDefaultUser(id));
    }
}
```

### 6.2 配置

```yaml
resilience4j:
  timelimiter:
    configs:
      default:
        timeoutDuration: 3s             # 超时时间
        cancelRunningFuture: true       # 取消运行中的Future
    
    instances:
      userService:
        baseConfig: default
```

---

## 7. 与 Spring Boot 集成

### 7.1 组合使用

```java
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserClient userClient;
    
    /**
     * 组合使用多个容错模式
     */
    @CircuitBreaker(name = "userService")
    @RateLimiter(name = "userService")
    @Bulkhead(name = "userService")
    @Retry(name = "userService")
    @TimeLimiter(name = "userService")
    public CompletableFuture<User> getUserById(Long id) {
        return CompletableFuture.supplyAsync(
            () -> userClient.getUser(id).getData()
        );
    }
}
```

**执行顺序**：

```
请求 → Retry → CircuitBreaker → RateLimiter → TimeLimiter → Bulkhead → 实际调用
```

### 7.2 Actuator 监控

**暴露端点**：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,circuitbreakers,ratelimiters
  
  health:
    circuitbreakers:
      enabled: true
    ratelimiters:
      enabled: true
  
  metrics:
    export:
      prometheus:
        enabled: true
```

**查看指标**：

```bash
# 查看熔断器状态
curl http://localhost:8080/actuator/circuitbreakers

# 查看限流器状态
curl http://localhost:8080/actuator/ratelimiters

# 查看健康状态
curl http://localhost:8080/actuator/health
```

### 7.3 Prometheus 指标

**配置**：

```yaml
management:
  metrics:
    tags:
      application: ${spring.application.name}
    export:
      prometheus:
        enabled: true
```

**指标示例**：

```promql
# 熔断器状态
resilience4j_circuitbreaker_state{name="userService"}

# 熔断器调用次数
resilience4j_circuitbreaker_calls_total{name="userService", kind="successful"}
resilience4j_circuitbreaker_calls_total{name="userService", kind="failed"}

# 限流器使用率
resilience4j_ratelimiter_available_permissions{name="userService"}
resilience4j_ratelimiter_waiting_threads{name="userService"}

# 重试次数
resilience4j_retry_calls_total{name="userService", kind="successful_with_retry"}
```

---

## 8. Resilience4j vs Sentinel 对比

### 8.1 功能对比

| 功能 | Resilience4j | Sentinel |
|------|--------------|----------|
| **熔断器** | ✅ | ✅ |
| **限流** | ✅ | ✅ |
| **隔离** | ✅ 信号量/线程池 | ✅ 信号量 |
| **重试** | ✅ | ❌ |
| **超时** | ✅ | ❌ |
| **热点限流** | ❌ | ✅ |
| **系统保护** | ❌ | ✅ |
| **集群限流** | ❌ | ✅ |

### 8.2 架构对比

**Resilience4j**：

```
优点：
- 轻量级，无外部依赖
- 函数式编程
- 灵活的组合使用
- 丰富的监控指标

缺点：
- 无控制台
- 无集群限流
- 无热点限流
```

**Sentinel**：

```
优点：
- 完善的控制台
- 集群限流
- 热点限流
- 系统自适应保护
- 规则动态配置

缺点：
- 需要额外部署控制台
- 配置较复杂
```

### 8.3 使用场景

**Resilience4j 适用场景**：

```
✅ 轻量级微服务
✅ 无需控制台
✅ 需要函数式编程
✅ 需要灵活组合
✅ Spring Boot 项目
```

**Sentinel 适用场景**：

```
✅ 需要控制台管理
✅ 需要集群限流
✅ 需要热点限流
✅ 需要系统保护
✅ 阿里云生态
```

### 8.4 性能对比

**吞吐量测试**：

| 场景 | Resilience4j | Sentinel |
|------|--------------|----------|
| 无容错 | 100000 QPS | 100000 QPS |
| 熔断器 | 95000 QPS | 92000 QPS |
| 限流器 | 90000 QPS | 88000 QPS |
| 组合使用 | 85000 QPS | 80000 QPS |

**结论**：
- Resilience4j 性能略优
- 两者性能都很好
- 实际差异可忽略

---

## 9. 实战案例

### 9.1 完整容错方案

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class OrderService {
    
    private final UserClient userClient;
    private final ProductClient productClient;
    private final PaymentClient paymentClient;
    
    /**
     * 创建订单
     */
    @CircuitBreaker(name = "orderService", fallbackMethod = "createOrderFallback")
    @RateLimiter(name = "orderService")
    @Bulkhead(name = "orderService")
    public Order createOrder(OrderDTO dto) {
        // 1. 查询用户（带重试）
        User user = getUserWithRetry(dto.getUserId());
        
        // 2. 查询商品（带超时）
        Product product = getProductWithTimeout(dto.getProductId());
        
        // 3. 创建订单
        Order order = new Order();
        order.setUserId(user.getId());
        order.setProductId(product.getId());
        order.setAmount(product.getPrice());
        
        // 4. 调用支付（异步）
        CompletableFuture<Payment> paymentFuture = 
            paymentClient.createPaymentAsync(order);
        
        return order;
    }
    
    @Retry(name = "userService")
    private User getUserWithRetry(Long userId) {
        return userClient.getUser(userId).getData();
    }
    
    @TimeLimiter(name = "productService")
    private CompletableFuture<Product> getProductWithTimeout(Long productId) {
        return CompletableFuture.supplyAsync(
            () -> productClient.getProduct(productId).getData()
        );
    }
    
    private Order createOrderFallback(OrderDTO dto, Exception ex) {
        log.error("创建订单失败，降级处理", ex);
        // 返回默认订单或抛出业务异常
        throw new BusinessException("订单创建失败，请稍后重试");
    }
}
```

**配置**：

```yaml
resilience4j:
  circuitbreaker:
    instances:
      orderService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
  
  ratelimiter:
    instances:
      orderService:
        limitForPeriod: 100
        limitRefreshPeriod: 1s
  
  bulkhead:
    instances:
      orderService:
        maxConcurrentCalls: 50
  
  retry:
    instances:
      userService:
        maxAttempts: 3
        waitDuration: 1s
        enableExponentialBackoff: true
  
  timelimiter:
    instances:
      productService:
        timeoutDuration: 3s
```

---

## 10. 面试要点

### 10.1 基础问题

**Q1：Resilience4j 有哪些核心模块？**

1. CircuitBreaker（熔断器）
2. RateLimiter（限流器）
3. Bulkhead（隔离舱）
4. Retry（重试）
5. TimeLimiter（超时）

**Q2：Resilience4j 和 Hystrix 的区别？**

- Resilience4j：轻量级，无依赖，函数式
- Hystrix：重量级，依赖 RxJava，已停止维护

### 10.2 进阶问题

**Q3：Resilience4j 的容错模式执行顺序？**

```
Retry → CircuitBreaker → RateLimiter → TimeLimiter → Bulkhead → 实际调用
```

**Q4：如何选择 Resilience4j 和 Sentinel？**

- 轻量级项目、无需控制台 → Resilience4j
- 需要控制台、集群限流、热点限流 → Sentinel

### 10.3 架构问题

**Q5：如何设计完整的容错方案？**

1. 熔断器：保护下游服务
2. 限流器：保护自身服务
3. 隔离舱：防止资源耗尽
4. 重试：处理临时故障
5. 超时：防止长时间等待
6. 监控：实时观察系统状态

---

## 11. 参考资料

**官方文档**：
- [Resilience4j GitHub](https://github.com/resilience4j/resilience4j)
- [Resilience4j 文档](https://resilience4j.readme.io/)

**Spring Cloud 集成**：
- [Spring Cloud CircuitBreaker](https://spring.io/projects/spring-cloud-circuitbreaker)

---

**熔断降级部分完成！下一章预告**：第 27 章将开始学习 Spring Cloud Stream，包括 Stream 架构设计、Binder 抽象概念、生产者和消费者开发等内容。

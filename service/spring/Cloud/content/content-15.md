# 第15章：负载均衡最佳实践

> **本章目标**：掌握负载均衡的生产最佳实践，能够根据场景选择合适的策略，实现高可用负载均衡

---

## 1. 负载均衡策略选择

### 1.1 策略选择矩阵

| 场景 | 推荐策略 | 理由 |
|------|----------|------|
| **通用场景** | 轮询（RoundRobin） | 简单、公平、性能好 |
| **性能差异大** | 加权响应时间 | 自动调整权重 |
| **会话保持** | IP Hash | 同一客户端路由到同一实例 |
| **高可用** | 可用过滤 + 重试 | 自动过滤故障实例 |
| **同机房优先** | 自定义（Zone Aware） | 降低延迟 |
| **灰度发布** | 自定义（版本路由） | 按比例分配流量 |

---

### 1.2 轮询策略（推荐）

**适用场景**：
- 服务实例性能相近
- 无会话保持需求
- 通用场景

**配置**：
```java
@Bean
public ReactorLoadBalancer<ServiceInstance> loadBalancer(
        Environment environment,
        LoadBalancerClientFactory loadBalancerClientFactory) {
    
    String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
    return new RoundRobinLoadBalancer(
        loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
        name);
}
```

---

### 1.3 加权策略

**适用场景**：
- 服务实例性能差异大
- 需要手动控制流量分配

**实现**：
```java
public class WeightedLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(this::getInstanceByWeight);
    }
    
    private Response<ServiceInstance> getInstanceByWeight(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 计算总权重
        int totalWeight = instances.stream()
            .mapToInt(this::getWeight)
            .sum();
        
        // 随机选择
        int random = ThreadLocalRandom.current().nextInt(totalWeight);
        
        int currentWeight = 0;
        for (ServiceInstance instance : instances) {
            currentWeight += getWeight(instance);
            if (random < currentWeight) {
                return new DefaultResponse(instance);
            }
        }
        
        return new DefaultResponse(instances.get(0));
    }
    
    private int getWeight(ServiceInstance instance) {
        String weight = instance.getMetadata().get("weight");
        return weight != null ? Integer.parseInt(weight) : 1;
    }
}
```

**配置权重**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          weight: 5  # 权重为5（默认1）
```

---

### 1.4 同机房优先策略

**适用场景**：
- 多机房部署
- 需要降低跨机房网络延迟

**实现**：
```java
public class SameZoneLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Value("${spring.cloud.nacos.discovery.metadata.zone}")
    private String currentZone;
    
    private AtomicInteger position = new AtomicInteger(0);
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(this::chooseSameZone);
    }
    
    private Response<ServiceInstance> chooseSameZone(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 过滤同机房实例
        List<ServiceInstance> sameZone = instances.stream()
            .filter(i -> currentZone.equals(i.getMetadata().get("zone")))
            .collect(Collectors.toList());
        
        // 如果同机房无实例，使用全部实例
        List<ServiceInstance> targets = sameZone.isEmpty() ? instances : sameZone;
        
        // 轮询选择
        int pos = Math.abs(position.incrementAndGet());
        ServiceInstance instance = targets.get(pos % targets.size());
        
        return new DefaultResponse(instance);
    }
}
```

**配置机房标识**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          zone: zone-beijing-1
```

---

## 2. 健康检查配置

### 2.1 Actuator 健康检查

**引入依赖**：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**配置**：
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: always
```

**自定义健康检查**：
```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        // 检查数据库连接
        if (isDatabaseConnected()) {
            return Health.up()
                .withDetail("database", "connected")
                .build();
        } else {
            return Health.down()
                .withDetail("database", "disconnected")
                .build();
        }
    }
    
    private boolean isDatabaseConnected() {
        // 实际检查逻辑
        return true;
    }
}
```

---

### 2.2 Nacos 健康检查

**配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        # 心跳间隔（秒）
        heart-beat-interval: 5
        # 心跳超时时间（秒）
        heart-beat-timeout: 15
        # IP删除超时时间（秒）
        ip-delete-timeout: 30
```

**健康检查流程**：
```
1. 服务实例每5秒发送心跳到 Nacos Server
    ↓
2. Nacos Server 15秒未收到心跳 → 标记为不健康
    ↓
3. Nacos Server 30秒未收到心跳 → 删除实例
    ↓
4. LoadBalancer 只获取健康实例
```

---

### 2.3 自定义健康检查端点

**实现**：
```java
@RestController
public class HealthController {
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @GetMapping("/health/custom")
    public Map<String, Object> customHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // 检查数据库
        boolean dbHealthy = checkDatabase();
        health.put("database", dbHealthy ? "UP" : "DOWN");
        
        // 检查 Redis
        boolean redisHealthy = checkRedis();
        health.put("redis", redisHealthy ? "UP" : "DOWN");
        
        // 整体状态
        boolean overall = dbHealthy && redisHealthy;
        health.put("status", overall ? "UP" : "DOWN");
        
        return health;
    }
    
    private boolean checkDatabase() {
        try {
            dataSource.getConnection().close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    private boolean checkRedis() {
        try {
            redisTemplate.opsForValue().get("health-check");
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

---

## 3. 超时与重试配置

### 3.1 RestTemplate 超时配置

**配置**：
```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        
        // 连接超时（毫秒）
        factory.setConnectTimeout(2000);
        
        // 读取超时（毫秒）
        factory.setReadTimeout(5000);
        
        return new RestTemplate(factory);
    }
}
```

---

### 3.2 Spring Retry 重试配置

**引入依赖**：
```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
```

**配置**：
```yaml
spring:
  cloud:
    loadbalancer:
      retry:
        enabled: true
        max-retries-on-same-service-instance: 0  # 同一实例重试次数
        max-retries-on-next-service-instance: 1  # 切换实例重试次数
        retry-on-all-operations: false  # 是否对所有操作重试（POST等）
```

**代码配置**：
```java
@Configuration
@EnableRetry
public class RetryConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class UserService {
    
    @Autowired
    @LoadBalanced
    private RestTemplate restTemplate;
    
    @Retryable(
        value = {RestClientException.class},  // 重试的异常类型
        maxAttempts = 3,  // 最大重试次数
        backoff = @Backoff(delay = 1000, multiplier = 2)  // 重试间隔：1s, 2s, 4s
    )
    public String getUser(Long id) {
        return restTemplate.getForObject("http://user-service/user/" + id, String.class);
    }
    
    @Recover
    public String recover(RestClientException e, Long id) {
        // 重试失败后的回退逻辑
        return "User service unavailable";
    }
}
```

---

### 3.3 超时与重试最佳实践

**超时时间设置原则**：
```
连接超时 < 读取超时 < 业务超时

推荐值：
- 连接超时：1-2秒
- 读取超时：3-5秒
- 业务超时：10秒
```

**重试策略**：
```
✅ 推荐重试：
- GET 请求
- 幂等的 POST/PUT/DELETE 请求
- 网络异常、超时异常

❌ 不推荐重试：
- 非幂等的 POST 请求
- 业务异常（如参数错误）
```

---

## 4. 灰度发布

### 4.1 基于版本的灰度发布

**场景**：新版本发布时，先让10%流量访问新版本，验证无问题后全量发布。

**实现**：
```java
public class GrayLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private AtomicInteger position = new AtomicInteger(0);
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(instances -> chooseWithGray(instances, request));
    }
    
    private Response<ServiceInstance> chooseWithGray(
            List<ServiceInstance> instances, Request request) {
        
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 区分灰度和正式实例
        List<ServiceInstance> grayInstances = instances.stream()
            .filter(i -> "gray".equals(i.getMetadata().get("version")))
            .collect(Collectors.toList());
        
        List<ServiceInstance> normalInstances = instances.stream()
            .filter(i -> !"gray".equals(i.getMetadata().get("version")))
            .collect(Collectors.toList());
        
        // 10%流量走灰度
        int grayPercent = 10;
        boolean useGray = ThreadLocalRandom.current().nextInt(100) < grayPercent;
        
        List<ServiceInstance> targets;
        if (useGray && !grayInstances.isEmpty()) {
            targets = grayInstances;
        } else {
            targets = normalInstances.isEmpty() ? instances : normalInstances;
        }
        
        // 轮询选择
        int pos = Math.abs(position.incrementAndGet());
        return new DefaultResponse(targets.get(pos % targets.size()));
    }
}
```

**灰度实例配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: gray  # 标记为灰度版本
```

**正式实例配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: stable  # 标记为正式版本
```

---

### 4.2 基于用户的灰度发布

**场景**：特定用户访问新版本，其他用户访问旧版本。

**实现**：
```java
public class UserGrayLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    // 灰度用户列表
    private static final Set<String> GRAY_USERS = Set.of("user1", "user2", "user3");
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(instances -> chooseByUser(instances, request));
    }
    
    private Response<ServiceInstance> chooseByUser(
            List<ServiceInstance> instances, Request request) {
        
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 获取当前用户（从请求头或上下文）
        String userId = getCurrentUserId(request);
        
        // 判断是否灰度用户
        boolean isGrayUser = GRAY_USERS.contains(userId);
        
        // 过滤实例
        List<ServiceInstance> targets = instances.stream()
            .filter(i -> {
                String version = i.getMetadata().get("version");
                return isGrayUser ? "gray".equals(version) : !"gray".equals(version);
            })
            .collect(Collectors.toList());
        
        if (targets.isEmpty()) {
            targets = instances;
        }
        
        // 轮询选择
        int pos = Math.abs(position.incrementAndGet());
        return new DefaultResponse(targets.get(pos % targets.size()));
    }
    
    private String getCurrentUserId(Request request) {
        // 从请求头获取用户ID
        DefaultRequest<?> defaultRequest = (DefaultRequest<?>) request;
        HttpHeaders headers = defaultRequest.getContext();
        return headers.getFirst("X-User-Id");
    }
}
```

**使用**：
```java
@RestController
public class OrderController {
    
    @GetMapping("/order/{id}")
    public String getOrder(@PathVariable Long id, @RequestHeader("X-User-Id") String userId) {
        // 请求会根据 userId 路由到灰度或正式版本
        return "Order " + id;
    }
}
```

---

## 5. 性能优化

### 5.1 服务列表缓存

**问题**：频繁从注册中心拉取服务列表，性能差。

**解决方案**：LoadBalancer 自动缓存服务列表，定期刷新。

**配置刷新间隔**：
```yaml
spring:
  cloud:
    loadbalancer:
      cache:
        enabled: true
        ttl: 35s  # 缓存有效期
        capacity: 256  # 缓存容量
```

---

### 5.2 健康检查优化

**问题**：频繁的健康检查影响性能。

**优化**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 10  # 增加心跳间隔（默认5秒）
```

**建议**：
- 开发环境：5秒
- 测试环境：10秒
- 生产环境：5-10秒

---

### 5.3 连接池优化

**问题**：RestTemplate 默认使用简单连接工厂，性能差。

**优化**：使用 HttpClient 连接池。

**引入依赖**：
```xml
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
</dependency>
```

**配置**：
```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        // 配置连接池
        PoolingHttpClientConnectionManager connectionManager = 
            new PoolingHttpClientConnectionManager();
        
        // 最大连接数
        connectionManager.setMaxTotal(200);
        
        // 每个路由的最大连接数
        connectionManager.setDefaultMaxPerRoute(20);
        
        // 配置超时
        RequestConfig requestConfig = RequestConfig.custom()
            .setConnectTimeout(2000)
            .setSocketTimeout(5000)
            .build();
        
        // 创建 HttpClient
        CloseableHttpClient httpClient = HttpClients.custom()
            .setConnectionManager(connectionManager)
            .setDefaultRequestConfig(requestConfig)
            .build();
        
        // 创建 RestTemplate
        HttpComponentsClientHttpRequestFactory factory = 
            new HttpComponentsClientHttpRequestFactory(httpClient);
        
        return new RestTemplate(factory);
    }
}
```

---

## 6. 故障隔离与降级

### 6.1 快速失败

**配置**：
```yaml
spring:
  cloud:
    loadbalancer:
      retry:
        enabled: false  # 禁用重试，快速失败
```

**适用场景**：
- 对可用性要求不高的场景
- 希望快速返回错误的场景

---

### 6.2 熔断降级

**结合 Sentinel/Resilience4j**：
```java
@Service
public class UserService {
    
    @Autowired
    @LoadBalanced
    private RestTemplate restTemplate;
    
    @SentinelResource(
        value = "getUser",
        fallback = "getUserFallback"
    )
    public String getUser(Long id) {
        return restTemplate.getForObject("http://user-service/user/" + id, String.class);
    }
    
    public String getUserFallback(Long id, Throwable ex) {
        return "Default user";
    }
}
```

---

## 7. 监控与告警

### 7.1 负载均衡监控指标

**关键指标**：
- 请求总数
- 请求成功率
- 请求平均耗时
- 各实例的请求分布
- 负载均衡策略执行时间

**实现**：
```java
@Component
public class LoadBalancerMetrics {
    
    private final Counter requestCounter;
    private final Counter successCounter;
    private final Counter failureCounter;
    private final Timer requestTimer;
    
    public LoadBalancerMetrics(MeterRegistry registry) {
        this.requestCounter = Counter.builder("loadbalancer.requests.total")
            .description("Total requests")
            .register(registry);
        
        this.successCounter = Counter.builder("loadbalancer.requests.success")
            .description("Success requests")
            .register(registry);
        
        this.failureCounter = Counter.builder("loadbalancer.requests.failure")
            .description("Failed requests")
            .register(registry);
        
        this.requestTimer = Timer.builder("loadbalancer.requests.duration")
            .description("Request duration")
            .register(registry);
    }
    
    public void recordRequest(String serviceName, boolean success, long duration) {
        requestCounter.increment();
        
        if (success) {
            successCounter.increment();
        } else {
            failureCounter.increment();
        }
        
        requestTimer.record(duration, TimeUnit.MILLISECONDS);
    }
}
```

---

### 7.2 告警规则

**告警场景**：
1. **服务不可用**：所有实例都不可用
2. **成功率低**：成功率 < 95%
3. **响应时间长**：P99 响应时间 > 1秒
4. **负载不均衡**：某个实例流量占比 > 50%

**Prometheus 告警规则**：
```yaml
groups:
  - name: loadbalancer
    rules:
      - alert: ServiceUnavailable
        expr: up{job="user-service"} == 0
        for: 1m
        annotations:
          summary: "Service {{ $labels.instance }} is down"
      
      - alert: LowSuccessRate
        expr: rate(loadbalancer_requests_success[5m]) / rate(loadbalancer_requests_total[5m]) < 0.95
        for: 5m
        annotations:
          summary: "Success rate < 95%"
      
      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(loadbalancer_requests_duration_bucket[5m])) > 1000
        for: 5m
        annotations:
          summary: "P99 latency > 1s"
```

---

## 8. 常见问题排查

### 8.1 负载不均衡

**现象**：某个实例流量特别大，其他实例流量很小。

**排查步骤**：
```bash
# 1. 检查负载均衡策略
# 确认是否使用轮询策略

# 2. 检查实例健康状态
curl http://nacos:8848/nacos/v1/ns/instance/list?serviceName=user-service

# 3. 检查实例权重
# 查看 Nacos 控制台

# 4. 启用监控
# 查看各实例的请求分布
```

**解决方案**：
- 确认使用轮询策略
- 检查权重配置
- 检查网络延迟（可能是同机房优先导致）

---

### 8.2 调用失败

**现象**：LoadBalancer 选择了不可用的实例。

**排查步骤**：
```bash
# 1. 检查实例健康状态
curl http://instance-ip:port/actuator/health

# 2. 检查 Nacos 健康检查
# Nacos 控制台查看实例状态

# 3. 检查心跳配置
# spring.cloud.nacos.discovery.heart-beat-interval
```

**解决方案**：
- 确保实例正常心跳
- 配置合理的心跳超时时间
- 使用健康检查过滤不可用实例

---

### 8.3 性能问题

**现象**：负载均衡性能差，响应慢。

**排查步骤**：
```bash
# 1. 检查服务列表缓存
# 确认是否开启缓存

# 2. 检查连接池配置
# 是否使用连接池

# 3. 检查超时配置
# 连接超时、读取超时是否合理
```

**解决方案**：
- 开启服务列表缓存
- 使用 HttpClient 连接池
- 优化超时配置

---

## 9. 学习自检清单

- [ ] 能够根据场景选择合适的负载均衡策略
- [ ] 掌握健康检查配置
- [ ] 掌握超时与重试配置
- [ ] 能够实现同机房优先策略
- [ ] 能够实现灰度发布
- [ ] 掌握负载均衡性能优化
- [ ] 能够配置监控和告警
- [ ] 能够排查负载均衡常见问题

**学习建议**：
- **预计学习时长**：3-4 小时
- **重点难点**：策略选择、灰度发布、性能优化
- **前置知识**：第13-14章负载均衡
- **实践建议**：实现同机房优先、灰度发布

---

**本章小结**：
- 策略选择：根据场景选择轮询、加权、同机房优先、灰度等策略
- 健康检查：Actuator + Nacos 心跳，自定义健康检查端点
- 超时重试：RestTemplate 超时配置，Spring Retry 重试策略
- 灰度发布：基于版本、基于用户的灰度策略
- 性能优化：服务列表缓存、连接池优化、心跳优化
- 监控告警：关键指标监控、Prometheus 告警规则
- 问题排查：负载不均衡、调用失败、性能问题

**负载均衡部分完成**：第13-15章已完成，涵盖 LoadBalancer 快速入门、Ribbon 原理、负载均衡最佳实践。接下来进入服务调用部分（OpenFeign）。

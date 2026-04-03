# 第 12 章：Spring Cloud LoadBalancer 原理

> **学习目标**：掌握客户端负载均衡原理，理解 LoadBalancer 核心机制  
> **预计时长**：2-3 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. 负载均衡概述

### 1.1 服务端 vs 客户端负载均衡

**服务端负载均衡**（Nginx、F5）：

```
客户端 → Nginx（负载均衡器） → 服务实例
                ↓
         选择实例（轮询/随机）
```

**客户端负载均衡**（LoadBalancer）：

```
客户端（集成LoadBalancer）
    ↓
从注册中心获取服务列表
    ↓
本地选择实例（轮询/随机）
    ↓
直接调用服务实例
```

**对比**：

| 特性 | 服务端负载均衡 | 客户端负载均衡 |
|------|---------------|---------------|
| 位置 | 独立服务器 | 客户端进程内 |
| 性能 | 多一跳网络开销 | 无额外开销 |
| 灵活性 | 集中配置 | 可定制策略 |
| 单点故障 | 存在 | 不存在 |
| 适用场景 | 传统架构 | 微服务架构 |

### 1.2 Ribbon vs LoadBalancer

**为什么要替换 Ribbon**：

```
Ribbon 问题：
- ❌ Netflix 已停止维护（2018）
- ❌ 不支持响应式编程
- ❌ 配置复杂
- ❌ 与 Spring Cloud 集成不够深入

LoadBalancer 优势：
- ✅ Spring Cloud 官方维护
- ✅ 支持响应式（WebFlux）
- ✅ 配置简单
- ✅ 与服务发现无缝集成
```

**版本对应**：

| Spring Cloud | Ribbon | LoadBalancer |
|--------------|--------|--------------|
| 2020.0.0之前 | ✅ 默认 | ⚠️ 可选 |
| 2020.0.0之后 | ❌ 移除 | ✅ 默认 |

---

## 2. LoadBalancer 核心架构

### 2.1 核心接口

**ReactorLoadBalancer 接口**：

```java
public interface ReactorServiceInstanceLoadBalancer extends ReactorLoadBalancer<ServiceInstance> {
    
    /**
     * 选择服务实例
     * 
     * @param request 请求上下文
     * @return 选中的服务实例
     */
    Mono<Response<ServiceInstance>> choose(Request request);
}
```

**Response 响应**：

```java
public class Response<T> {
    private final T server;           // 选中的实例
    private final boolean hasServer;  // 是否有可用实例
    
    public Response(T server) {
        this.server = server;
        this.hasServer = (server != null);
    }
}
```

**ServiceInstance 实例**：

```java
public interface ServiceInstance {
    String getServiceId();    // 服务名称
    String getHost();         // IP地址
    int getPort();           // 端口
    boolean isSecure();      // 是否HTTPS
    URI getUri();            // 完整URI
    Map<String, String> getMetadata();  // 元数据
}
```

### 2.2 组件关系图

```
@LoadBalanced RestTemplate
        ↓
LoadBalancerInterceptor（拦截器）
        ↓
LoadBalancerClient
        ↓
ReactorLoadBalancer（负载均衡器）
        ↓
ServiceInstanceListSupplier（实例提供者）
        ↓
DiscoveryClient（服务发现）
        ↓
Nacos/Eureka（注册中心）
```

---

## 3. RoundRobinLoadBalancer 源码分析

### 3.1 轮询算法实现

**源码**：

```java
public class RoundRobinLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private final String serviceId;
    private final ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    private final AtomicInteger position;  // 当前位置（线程安全）
    
    public RoundRobinLoadBalancer(
            ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider,
            String serviceId) {
        this(serviceInstanceListSupplierProvider, serviceId, new Random().nextInt(1000));
    }
    
    public RoundRobinLoadBalancer(
            ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider,
            String serviceId,
            int seedPosition) {
        this.serviceId = serviceId;
        this.serviceInstanceListSupplierProvider = serviceInstanceListSupplierProvider;
        this.position = new AtomicInteger(seedPosition);
    }
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(serviceInstances -> processInstanceResponse(supplier, serviceInstances));
    }
    
    private Response<ServiceInstance> processInstanceResponse(
            ServiceInstanceListSupplier supplier,
            List<ServiceInstance> serviceInstances) {
        
        Response<ServiceInstance> serviceInstanceResponse = getInstanceResponse(serviceInstances);
        
        if (supplier instanceof SelectedInstanceCallback && serviceInstanceResponse.hasServer()) {
            ((SelectedInstanceCallback) supplier).selectedServiceInstance(serviceInstanceResponse.getServer());
        }
        
        return serviceInstanceResponse;
    }
    
    private Response<ServiceInstance> getInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 轮询选择实例
        int pos = this.position.incrementAndGet() & Integer.MAX_VALUE;
        ServiceInstance instance = instances.get(pos % instances.size());
        
        return new DefaultResponse(instance);
    }
}
```

### 3.2 轮询算法详解

**核心逻辑**：

```java
// 1. 使用 AtomicInteger 保证线程安全
private final AtomicInteger position = new AtomicInteger(0);

// 2. 递增并取模
int pos = position.incrementAndGet() & Integer.MAX_VALUE;
ServiceInstance instance = instances.get(pos % instances.size());

// 示例：
// instances.size() = 3
// 调用1：pos = 1, index = 1 % 3 = 1
// 调用2：pos = 2, index = 2 % 3 = 2
// 调用3：pos = 3, index = 3 % 3 = 0
// 调用4：pos = 4, index = 4 % 3 = 1
```

**& Integer.MAX_VALUE 的作用**：

```java
// 防止 position 溢出导致负数
position.incrementAndGet() & Integer.MAX_VALUE

// 示例：
Integer.MAX_VALUE = 2147483647 (0x7FFFFFFF)
-1 & 0x7FFFFFFF = 2147483647
-100 & 0x7FFFFFFF = 2147483548
```

### 3.3 轮询测试

**测试代码**：

```java
@SpringBootTest
class RoundRobinLoadBalancerTest {
    
    @Autowired
    private LoadBalancerClient loadBalancerClient;
    
    @Test
    void testRoundRobin() {
        // 模拟10次调用
        Map<String, Integer> instanceCount = new HashMap<>();
        
        for (int i = 0; i < 10; i++) {
            ServiceInstance instance = loadBalancerClient.choose("user-service");
            String key = instance.getHost() + ":" + instance.getPort();
            instanceCount.merge(key, 1, Integer::sum);
        }
        
        // 验证：每个实例被调用的次数应该相近
        System.out.println("调用分布：" + instanceCount);
        
        // 假设有3个实例，每个应该被调用3-4次
        instanceCount.values().forEach(count -> {
            assertTrue(count >= 3 && count <= 4);
        });
    }
}
```

**输出示例**：

```
调用分布：{
  192.168.1.1:8081=3,
  192.168.1.2:8081=3,
  192.168.1.3:8081=4
}
```

---

## 4. RandomLoadBalancer 源码分析

### 4.1 随机算法实现

**源码**：

```java
public class RandomLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private final String serviceId;
    private final ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    private final Random random;  // 随机数生成器
    
    public RandomLoadBalancer(
            ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider,
            String serviceId) {
        this.serviceId = serviceId;
        this.serviceInstanceListSupplierProvider = serviceInstanceListSupplierProvider;
        this.random = new Random();
    }
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(this::getInstanceResponse);
    }
    
    private Response<ServiceInstance> getInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 随机选择实例
        int index = random.nextInt(instances.size());
        ServiceInstance instance = instances.get(index);
        
        return new DefaultResponse(instance);
    }
}
```

### 4.2 随机算法详解

**核心逻辑**：

```java
// 生成 [0, instances.size()) 范围内的随机数
int index = random.nextInt(instances.size());
ServiceInstance instance = instances.get(index);

// 示例：
// instances.size() = 3
// 调用1：index = 2, 选择实例2
// 调用2：index = 0, 选择实例0
// 调用3：index = 1, 选择实例1
// 调用4：index = 2, 选择实例2
```

### 4.3 轮询 vs 随机

**对比**：

| 特性 | RoundRobin | Random |
|------|------------|--------|
| 分布均匀性 | ✅ 均匀 | ⚠️ 长期均匀 |
| 短期分布 | ✅ 可预测 | ❌ 不可预测 |
| 性能 | ✅ 高（无随机计算） | ⚠️ 略低（随机计算） |
| 适用场景 | 实例性能相同 | 无特殊要求 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**测试对比**：

```java
@Test
void compareLoadBalancers() {
    // 轮询：连续10次调用
    RoundRobin: [1, 2, 3, 1, 2, 3, 1, 2, 3, 1]
    
    // 随机：连续10次调用
    Random: [2, 1, 3, 2, 2, 1, 3, 1, 3, 2]
    
    // 结论：轮询更均匀，随机有波动
}
```

---

## 5. ServiceInstanceListSupplier

### 5.1 实例提供者接口

**接口定义**：

```java
public interface ServiceInstanceListSupplier extends Supplier<Flux<List<ServiceInstance>>> {
    
    String getServiceId();
    
    /**
     * 获取服务实例列表
     */
    @Override
    default Flux<List<ServiceInstance>> get() {
        return get(Request.DEFAULT_REQUEST);
    }
    
    /**
     * 获取服务实例列表（带请求上下文）
     */
    Flux<List<ServiceInstance>> get(Request request);
}
```

### 5.2 实现类

**DiscoveryClientServiceInstanceListSupplier**（从注册中心获取）：

```java
public class DiscoveryClientServiceInstanceListSupplier 
    implements ServiceInstanceListSupplier {
    
    private final String serviceId;
    private final DiscoveryClient discoveryClient;
    
    @Override
    public Flux<List<ServiceInstance>> get() {
        return Flux.defer(() -> {
            // 从服务发现客户端获取实例列表
            List<ServiceInstance> instances = discoveryClient.getInstances(serviceId);
            return Flux.just(instances);
        });
    }
}
```

**CachingServiceInstanceListSupplier**（缓存实例列表）：

```java
public class CachingServiceInstanceListSupplier 
    implements ServiceInstanceListSupplier {
    
    private final ServiceInstanceListSupplier delegate;
    private final Flux<List<ServiceInstance>> serviceInstances;
    
    public CachingServiceInstanceListSupplier(ServiceInstanceListSupplier delegate) {
        this.delegate = delegate;
        
        // 缓存实例列表
        this.serviceInstances = delegate.get()
            .cache(Duration.ofSeconds(35))  // 缓存35秒
            .onErrorResume(error -> {
                log.error("获取实例列表失败", error);
                return Flux.just(Collections.emptyList());
            });
    }
    
    @Override
    public Flux<List<ServiceInstance>> get() {
        return serviceInstances;
    }
}
```

**HealthCheckServiceInstanceListSupplier**（健康检查）：

```java
public class HealthCheckServiceInstanceListSupplier 
    implements ServiceInstanceListSupplier {
    
    private final ServiceInstanceListSupplier delegate;
    private final WebClient webClient;
    
    @Override
    public Flux<List<ServiceInstance>> get() {
        return delegate.get()
            .flatMap(instances -> {
                // 并发健康检查
                return Flux.fromIterable(instances)
                    .flatMap(this::checkHealth)
                    .filter(HealthCheck::isHealthy)
                    .map(HealthCheck::getInstance)
                    .collectList();
            });
    }
    
    private Mono<HealthCheck> checkHealth(ServiceInstance instance) {
        String healthUrl = instance.getUri() + "/actuator/health";
        
        return webClient.get()
            .uri(healthUrl)
            .retrieve()
            .bodyToMono(HealthResponse.class)
            .map(response -> new HealthCheck(instance, response.isUp()))
            .timeout(Duration.ofSeconds(3))
            .onErrorReturn(new HealthCheck(instance, false));
    }
}
```

### 5.3 组合模式

**链式构建**：

```java
@Configuration
public class LoadBalancerConfig {
    
    @Bean
    public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        
        return ServiceInstanceListSupplier.builder()
            .withDiscoveryClient()        // 1. 从注册中心获取
            .withCaching()                // 2. 缓存实例列表
            .withHealthChecks()           // 3. 健康检查
            .withSameInstancePreference() // 4. 同实例优先
            .build(context);
    }
}
```

---

## 6. LoadBalancerClient 使用

### 6.1 RestTemplate 集成

**配置**：

```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced  // 启用负载均衡
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

**使用**：

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final RestTemplate restTemplate;
    
    public User getUser(Long userId) {
        // 使用服务名调用
        String url = "http://user-service/api/users/" + userId;
        return restTemplate.getForObject(url, User.class);
    }
}
```

**拦截器原理**：

```java
public class LoadBalancerInterceptor implements ClientHttpRequestInterceptor {
    
    private final LoadBalancerClient loadBalancer;
    
    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body,
                                         ClientHttpRequestExecution execution) throws IOException {
        
        final URI originalUri = request.getURI();
        String serviceName = originalUri.getHost();
        
        // 1. 选择实例
        ServiceInstance instance = loadBalancer.choose(serviceName);
        
        if (instance == null) {
            throw new IllegalStateException("No instances available for " + serviceName);
        }
        
        // 2. 替换URL
        URI uri = loadBalancer.reconstructURI(instance, originalUri);
        
        // 3. 发起真实请求
        return execution.execute(
            new DelegatingHttpRequest(request, uri),
            body
        );
    }
}
```

### 6.2 WebClient 集成

**配置**：

```java
@Configuration
public class WebClientConfig {
    
    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
```

**使用**：

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final WebClient.Builder webClientBuilder;
    
    public Mono<User> getUser(Long userId) {
        return webClientBuilder.build()
            .get()
            .uri("http://user-service/api/users/{id}", userId)
            .retrieve()
            .bodyToMono(User.class);
    }
}
```

### 6.3 Feign 集成

**配置**：

```yaml
spring:
  cloud:
    loadbalancer:
      ribbon:
        enabled: false  # 禁用Ribbon
```

**Feign 自动使用 LoadBalancer**：

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
}

// Feign 内部自动使用 LoadBalancer 选择实例
```

---

## 7. 负载均衡策略配置

### 7.1 全局配置

**application.yml**：

```yaml
spring:
  cloud:
    loadbalancer:
      # 缓存配置
      cache:
        enabled: true
        ttl: 35s
        capacity: 256
      
      # 健康检查
      health-check:
        initial-delay: 0
        interval: 25s
        path: /actuator/health
      
      # 重试配置
      retry:
        enabled: true
        max-retries-on-same-service-instance: 0
        max-retries-on-next-service-instance: 1
```

### 7.2 服务级配置

**指定服务的负载均衡器**：

```java
@Configuration
@LoadBalancerClient(name = "user-service", configuration = UserServiceLoadBalancerConfig.class)
public class LoadBalancerConfiguration {
}

@Configuration
class UserServiceLoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name
        );
    }
}
```

---

## 8. 实战案例

### 8.1 多实例负载均衡测试

**启动多个实例**：

```bash
# 实例1
java -jar user-service.jar --server.port=8081

# 实例2
java -jar user-service.jar --server.port=8082

# 实例3
java -jar user-service.jar --server.port=8083
```

**测试代码**：

```java
@RestController
@RequiredArgsConstructor
public class TestController {
    
    private final RestTemplate restTemplate;
    
    @GetMapping("/test-lb")
    public Map<String, Integer> testLoadBalance() {
        Map<String, Integer> result = new HashMap<>();
        
        // 调用100次
        for (int i = 0; i < 100; i++) {
            String response = restTemplate.getForObject(
                "http://user-service/api/info",
                String.class
            );
            
            result.merge(response, 1, Integer::sum);
        }
        
        return result;
    }
}
```

**响应示例**：

```json
{
  "8081": 33,
  "8082": 34,
  "8083": 33
}
```

---

## 9. 面试要点

### 9.1 基础问题

**Q1：客户端负载均衡和服务端负载均衡的区别？**

| 维度 | 客户端 | 服务端 |
|------|-------|--------|
| 位置 | 进程内 | 独立服务 |
| 性能 | 无额外开销 | 多一跳 |
| 单点 | 无 | 有 |

**Q2：RoundRobin 和 Random 的区别？**

- RoundRobin：轮询，分布均匀
- Random：随机，长期均匀

### 9.2 进阶问题

**Q3：LoadBalancer 的工作原理是什么？**

**流程**：
1. 拦截器拦截请求
2. 从注册中心获取实例列表
3. 负载均衡器选择实例
4. 替换URL
5. 发起真实请求

**Q4：如何自定义负载均衡策略？**

**方案**：
1. 实现 ReactorServiceInstanceLoadBalancer
2. 重写 choose() 方法
3. 注册为 Bean

### 9.3 架构问题

**Q5：如何保证负载均衡的高可用？**

**措施**：
1. 缓存实例列表
2. 健康检查
3. 重试机制
4. 优雅降级

---

## 10. 参考资料

**官方文档**：
- [Spring Cloud LoadBalancer](https://docs.spring.io/spring-cloud-commons/docs/current/reference/html/#spring-cloud-loadbalancer)

**源码分析**：
- [LoadBalancer GitHub](https://github.com/spring-cloud/spring-cloud-commons)

---

**下一章预告**：第 13 章将学习负载均衡策略与自定义，包括权重负载均衡、Zone Aware 负载均衡、同实例优先、自定义负载均衡算法、负载均衡器性能优化等内容。

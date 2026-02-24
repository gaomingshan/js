# Spring Cloud 微服务架构面试题宝典

> 系统化面试准备 | 120+ 题目覆盖初/中/高/架构四个级别

---

## 📋 目录

- [初级岗位题库（25题）](#初级岗位题库) - 0-2年经验
- [中级岗位题库（45题）](#中级岗位题库) - 2-5年经验
- [高级岗位题库（30题）](#高级岗位题库) - 5+年经验
- [架构岗位题库（20题）](#架构岗位题库) - 架构师/技术专家

---

## 初级岗位题库

### 1. 什么是 Spring Cloud？它与 Spring Boot 有什么关系？

**标准答案：**

Spring Cloud 是基于 Spring Boot 的微服务开发工具集，为分布式系统提供一站式解决方案。

**核心关系：**
- Spring Boot 提供快速开发单体应用的能力
- Spring Cloud 在 Spring Boot 基础上提供分布式系统组件
- Spring Cloud 依赖 Spring Boot 的自动配置机制

**主要功能：**
- 服务注册与发现（Eureka、Nacos）
- 配置管理（Config、Nacos Config）
- 负载均衡（Ribbon、LoadBalancer）
- 服务调用（OpenFeign）
- 服务网关（Gateway）
- 熔断降级（Sentinel、Hystrix）

**原理深挖：**
```java
// Spring Cloud 通过 spring.factories 自动配置
// META-INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  org.springframework.cloud.netflix.eureka.EurekaClientAutoConfiguration,\
  org.springframework.cloud.openfeign.FeignAutoConfiguration
```

**追问方向：**
- Q: Spring Cloud 和 Dubbo 有什么区别？
- A: Spring Cloud 是完整微服务生态（服务治理+配置+网关），Dubbo 专注于 RPC；Spring Cloud 基于 HTTP/REST，Dubbo 基于自定义 TCP 协议

**加分项：**
- 说出 Spring Cloud 和 Spring Boot 的版本对应关系（如 Boot 2.6.x → Cloud 2021.0.x）
- 提到 Spring Cloud Alibaba 生态的补充

**实战关联：**
在电商项目中，用 Spring Boot 开发单个服务（如订单服务），用 Spring Cloud 实现服务间调用、配置管理、网关路由等分布式能力。

**常见错误回答：**
- ❌ "Spring Cloud 是一个框架" —— 应该说是微服务工具集/生态
- ❌ 只说组件名称，不说解决的问题

---

### 2. 什么是服务注册与发现？为什么需要它？

**标准答案：**

服务注册与发现是微服务架构的核心机制，用于动态管理服务实例的地址信息。

**核心概念：**
- **服务注册**：服务启动时将自己的信息（IP、端口、服务名）注册到注册中心
- **服务发现**：服务调用时从注册中心查询目标服务的实例列表
- **健康检查**：注册中心定期检查服务实例状态，剔除不健康实例

**为什么需要：**
1. **动态性**：容器化环境下 IP/端口动态分配
2. **解耦**：调用方不需要硬编码服务地址
3. **高可用**：自动剔除故障实例，实现故障转移

**原理深挖：**
```java
// Nacos 服务注册示例
@SpringBootApplication
@EnableDiscoveryClient
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

// 启动时自动注册
// NacosNamingService.registerInstance()
// 定时发送心跳
// beatReactor.addBeatInfo(serviceName, beatInfo)
```

**追问方向：**
- Q: 客户端如何发现服务？
- A: 通过 DiscoveryClient 从注册中心获取服务实例列表，结合负载均衡策略选择实例

**加分项：**
- 提到 CAP 理论：Eureka（AP）、Consul（CP）、Nacos（支持 AP/CP 切换）
- 说出心跳机制：客户端定时发送心跳，超时未续约则剔除

**实战关联：**
订单服务调用商品服务时，不配置固定 IP，而是通过服务名 `product-service` 从 Nacos 获取可用实例。

**常见错误回答：**
- ❌ "用来查找服务地址的" —— 太简单，需要说明注册、发现、健康检查完整流程
- ❌ 不知道为什么需要（动态性、高可用）

---

### 3. Nacos 和 Eureka 的主要区别是什么？

**标准答案：**

| 对比维度 | Nacos | Eureka |
|---------|-------|--------|
| **CAP 模型** | 支持 AP/CP 切换 | AP（可用性优先） |
| **功能** | 注册中心 + 配置中心 | 仅注册中心 |
| **健康检查** | TCP/HTTP/MySQL | 客户端心跳 |
| **负载均衡** | 内置权重配置 | 客户端 Ribbon |
| **控制台** | 功能强大 | 简单 |
| **维护状态** | 阿里持续维护 | Netflix 停止维护 |

**原理深挖：**
```yaml
# Nacos 切换 CP/AP 模式
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false  # false=CP模式（持久化实例）
                          # true=AP模式（临时实例）
```

**追问方向：**
- Q: 什么场景选 Nacos，什么场景选 Eureka？
- A: 新项目推荐 Nacos（功能更全、社区活跃）；老项目已用 Eureka 可继续；金融场景需要强一致性用 Nacos CP 模式

**加分项：**
- 提到 Nacos 2.0 的长连接改造，性能提升显著
- 说出 Eureka 的自我保护机制

**实战关联：**
项目从 Eureka 迁移到 Nacos，除了服务注册功能，还能把配置中心统一到 Nacos，减少组件数量。

**常见错误回答：**
- ❌ "Nacos 比 Eureka 好" —— 要说具体好在哪里
- ❌ 只知道一个组件的特性

---

### 4. 如何在项目中引入 Nacos 服务注册？

**标准答案：**

**步骤一：添加依赖**
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

**步骤二：配置 Nacos 地址**
```yaml
spring:
  application:
    name: order-service  # 服务名
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848  # Nacos 地址
```

**步骤三：启用服务发现**
```java
@SpringBootApplication
@EnableDiscoveryClient
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

**步骤四：验证**
- 启动服务，访问 Nacos 控制台 `http://127.0.0.1:8848/nacos`
- 在"服务管理 → 服务列表"中看到 `order-service`

**原理深挖：**
```java
// NacosAutoServiceRegistration 自动注册
// 实现 AbstractAutoServiceRegistration
public void register() {
    serviceRegistry.register(getRegistration());
}

// 定时心跳
beatReactor.addBeatInfo(serviceName, beatInfo);
```

**追问方向：**
- Q: 如果不想自动注册怎么办？
- A: 设置 `spring.cloud.nacos.discovery.register-enabled=false`

**加分项：**
- 提到可配置命名空间、分组实现环境隔离
- 说出心跳间隔默认 5 秒

**实战关联：**
多环境部署时配置不同命名空间：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        namespace: dev  # 开发环境
```

**常见错误回答：**
- ❌ 只说加依赖，不说配置和验证
- ❌ 不知道 `@EnableDiscoveryClient` 的作用

---

### 5. OpenFeign 是什么？如何使用？

**标准答案：**

OpenFeign 是声明式的 HTTP 客户端，用于简化微服务间的 REST 调用。

**核心特性：**
- 声明式接口定义
- 集成 Ribbon 负载均衡
- 集成 Hystrix 熔断降级
- 支持请求/响应压缩

**使用步骤：**

**步骤一：添加依赖**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

**步骤二：启用 Feign**
```java
@SpringBootApplication
@EnableFeignClients
public class OrderServiceApplication {
    // ...
}
```

**步骤三：定义 Feign 接口**
```java
@FeignClient(name = "product-service")  // 服务名
public interface ProductClient {
    
    @GetMapping("/api/products/{id}")
    Product getProductById(@PathVariable("id") Long id);
    
    @PostMapping("/api/products")
    Product createProduct(@RequestBody Product product);
}
```

**步骤四：注入使用**
```java
@Service
public class OrderService {
    
    @Autowired
    private ProductClient productClient;
    
    public Order createOrder(Long productId) {
        Product product = productClient.getProductById(productId);
        // 创建订单...
        return order;
    }
}
```

**原理深挖：**
```java
// Feign 通过动态代理生成实现类
// FeignClientFactoryBean.getObject()
Object target = targeter.target(this, builder, context,
    new HardCodedTarget<>(type, name, url));

// 最终调用 SynchronousMethodHandler.invoke()
```

**追问方向：**
- Q: Feign 如何实现负载均衡？
- A: 集成 Ribbon/LoadBalancer，根据服务名从注册中心获取实例列表，按策略选择

**加分项：**
- 提到 Feign 底层用 Ribbon 或 Spring Cloud LoadBalancer
- 说出可配置超时时间、日志级别、编解码器

**实战关联：**
订单服务调用商品服务查询商品信息，用 Feign 只需定义接口，无需 RestTemplate 手写 HTTP 调用。

**常见错误回答：**
- ❌ "Feign 是用来调用接口的" —— 应该说是声明式 HTTP 客户端
- ❌ 不知道 `@FeignClient` 的 name 属性是服务名

---

### 6. Spring Cloud Gateway 的作用是什么？

**标准答案：**

Spring Cloud Gateway 是微服务架构的 API 网关，作为统一入口处理所有外部请求。

**核心功能：**
1. **路由转发**：根据规则将请求转发到后端服务
2. **负载均衡**：集成 LoadBalancer 自动负载
3. **认证授权**：统一鉴权
4. **限流熔断**：保护后端服务
5. **日志监控**：统一日志记录
6. **协议转换**：HTTP/WebSocket 支持

**基础配置：**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: product-route
          uri: lb://product-service  # lb:// 表示负载均衡
          predicates:
            - Path=/api/products/**  # 路径匹配
          filters:
            - StripPrefix=1  # 去掉前缀
```

**原理深挖：**
```java
// Gateway 基于 WebFlux 响应式
// RoutePredicateHandlerMapping.getHandlerInternal()
Route route = lookupRoute(exchange);

// FilteringWebHandler 执行过滤器链
return new FilteringWebHandler(globalFilters).handle(exchange);
```

**追问方向：**
- Q: Gateway 和 Zuul 的区别？
- A: Gateway 基于 WebFlux（异步非阻塞），Zuul 1.x 基于 Servlet（同步阻塞）；Gateway 性能更高

**加分项：**
- 提到 Gateway 的三大核心：Route（路由）、Predicate（断言）、Filter（过滤器）
- 说出支持动态路由

**实战关联：**
前端请求统一发到网关 `gateway.example.com`，网关根据路径 `/api/products/**` 转发到商品服务。

**常见错误回答：**
- ❌ "网关就是转发请求的" —— 要说明路由、鉴权、限流等核心功能
- ❌ 不知道 `lb://` 的作用

---

### 7. 什么是服务熔断？Sentinel 如何实现？

**标准答案：**

服务熔断是一种保护机制，当依赖服务异常率超过阈值时，自动切断调用，返回降级结果，避免雪崩。

**熔断状态：**
1. **关闭（Closed）**：正常调用
2. **打开（Open）**：熔断，直接返回降级结果
3. **半开（Half-Open）**：尝试恢复，放行部分请求

**Sentinel 使用：**

**步骤一：添加依赖**
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

**步骤二：配置 Sentinel**
```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080  # 控制台地址
```

**步骤三：定义资源**
```java
@Service
public class OrderService {
    
    @SentinelResource(value = "createOrder", 
                      blockHandler = "createOrderFallback")
    public Order createOrder(Long productId) {
        // 调用商品服务
        return order;
    }
    
    public Order createOrderFallback(Long productId, BlockException ex) {
        // 降级逻辑
        return new Order("降级订单");
    }
}
```

**原理深挖：**
```java
// Sentinel 滑动窗口算法
// StatisticSlot 统计 QPS、异常数
// DegradeSlot 根据熔断规则判断
if (rule.passCheck(context, node, acquireCount)) {
    return;
} else {
    throw new DegradeException(rule.getLimitApp(), rule);
}
```

**追问方向：**
- Q: 熔断和降级有什么区别？
- A: 熔断是主动切断调用链路；降级是提供兜底方案。熔断会触发降级。

**加分项：**
- 提到熔断策略：慢调用比例、异常比例、异常数
- 说出半开状态的恢复机制

**实战关联：**
商品服务异常时，订单服务熔断，直接返回"商品服务繁忙"，避免大量请求堆积导致订单服务崩溃。

**常见错误回答：**
- ❌ "熔断就是服务挂了" —— 熔断是保护机制，主动断开
- ❌ 不知道熔断状态机

---

### 8. 如何配置 Feign 的超时时间？

**标准答案：**

Feign 的超时时间分为**连接超时**和**读取超时**，可通过配置文件或代码设置。

**方式一：配置文件（推荐）**
```yaml
feign:
  client:
    config:
      default:  # 默认配置
        connectTimeout: 5000  # 连接超时 5 秒
        readTimeout: 10000    # 读取超时 10 秒
      product-service:  # 针对特定服务
        connectTimeout: 3000
        readTimeout: 8000
```

**方式二：代码配置**
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Request.Options options() {
        return new Request.Options(
            5000,  // 连接超时
            10000  // 读取超时
        );
    }
}
```

**原理深挖：**
```java
// Feign 底层使用 HttpURLConnection 或 OkHttp
// FeignClientFactoryBean 创建客户端时设置超时
Options options = new Options(
    connectTimeoutMillis, TimeUnit.MILLISECONDS,
    readTimeoutMillis, TimeUnit.MILLISECONDS,
    followRedirects
);
```

**追问方向：**
- Q: Ribbon 的超时和 Feign 的超时有什么关系？
- A: Feign 整合 Ribbon 时，两者都有超时配置，取较小值；建议统一配置 Feign 超时

**加分项：**
- 提到可针对不同服务配置不同超时时间
- 说出生产环境建议根据服务响应时间设置合理值（如 P99）

**实战关联：**
商品详情查询通常很快，设置 3 秒超时；批量导入可能较慢，设置 30 秒超时。

**常见错误回答：**
- ❌ 只知道配置，不知道连接超时和读取超时的区别
- ❌ 不知道可以针对不同服务配置

---

### 9. Nacos Config 如何实现配置动态刷新？

**标准答案：**

Nacos Config 通过**长轮询机制**实现配置实时推送，客户端无需重启即可生效。

**使用步骤：**

**步骤一：添加依赖**
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

**步骤二：配置 bootstrap.yml**
```yaml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yaml  # 配置文件格式
```

**步骤三：在 Nacos 控制台添加配置**
```
Data ID: order-service.yaml
Group: DEFAULT_GROUP
配置内容:
  order:
    maxAmount: 10000
```

**步骤四：使用配置**
```java
@RestController
@RefreshScope  // 支持动态刷新
public class OrderController {
    
    @Value("${order.maxAmount}")
    private Integer maxAmount;
    
    @GetMapping("/max-amount")
    public Integer getMaxAmount() {
        return maxAmount;
    }
}
```

**原理深挖：**
```java
// Nacos 客户端长轮询
// ClientWorker.LongPollingRunnable
List<String> changedGroupKeys = checkUpdateDataIds(...);
if (!changedGroupKeys.isEmpty()) {
    // 发布配置变更事件
    eventPublisher.publishEvent(new RefreshEvent(...));
}

// @RefreshScope 监听刷新事件，销毁Bean重新创建
```

**追问方向：**
- Q: 不加 `@RefreshScope` 会怎样？
- A: 配置不会动态刷新，需要重启服务

**加分项：**
- 提到长轮询超时时间默认 30 秒
- 说出命名空间、分组实现多环境隔离

**实战关联：**
修改订单最大金额限制，在 Nacos 控制台改完立即生效，无需重启服务。

**常见错误回答：**
- ❌ "Nacos 会自动刷新" —— 需要 `@RefreshScope` 注解
- ❌ 不知道长轮询机制

---

### 10. 如何在 Gateway 中配置跨域？

**标准答案：**

Gateway 提供全局跨域配置和路由级别跨域配置。

**方式一：全局配置**
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':  # 所有路径
            allowedOrigins: "*"  # 允许的源
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
            allowedHeaders: "*"
            allowCredentials: true
            maxAge: 3600
```

**方式二：代码配置**
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:8080");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = 
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsWebFilter(source);
    }
}
```

**原理深挖：**
```java
// Gateway 通过 CorsWebFilter 处理跨域
// 在请求响应中添加 CORS 头
response.getHeaders().add("Access-Control-Allow-Origin", "*");
response.getHeaders().add("Access-Control-Allow-Methods", "GET,POST");
```

**追问方向：**
- Q: 生产环境配置跨域要注意什么？
- A: 不能用 `*`，要指定具体域名；谨慎设置 `allowCredentials`

**加分项：**
- 提到 OPTIONS 预检请求
- 说出可以在 Filter 中自定义跨域逻辑

**实战关联：**
前端 `http://localhost:8080` 调用网关 `http://localhost:9999`，需要配置跨域允许。

**常见错误回答：**
- ❌ "在后端服务配置跨域" —— 应该在网关统一配置
- ❌ 生产环境用 `allowedOrigins: "*"` —— 安全风险

---

### 11. LoadBalancer 支持哪些负载均衡策略？

**标准答案：**

Spring Cloud LoadBalancer 提供多种负载均衡策略，默认使用**轮询（Round Robin）**。

**内置策略：**
1. **RoundRobinLoadBalancer**：轮询，依次选择实例
2. **RandomLoadBalancer**：随机选择实例

**配置方式：**
```yaml
spring:
  cloud:
    loadbalancer:
      ribbon:
        enabled: false  # 禁用 Ribbon
      configurations: random  # 使用随机策略
```

**自定义策略：**
```java
@Configuration
public class CustomLoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> 
        customLoadBalancer(Environment environment,
                          LoadBalancerClientFactory factory) {
        String name = environment.getProperty(
            LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            factory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name
        );
    }
}
```

**原理深挖：**
```java
// ReactorLoadBalancer.choose() 选择实例
Mono<Response<ServiceInstance>> chosen = loadBalancer.choose(request);

// RoundRobinLoadBalancer 使用 AtomicInteger 计数
int pos = this.position.incrementAndGet() & Integer.MAX_VALUE;
ServiceInstance instance = instances.get(pos % instances.size());
```

**追问方向：**
- Q: Ribbon 的负载均衡策略有哪些？
- A: Ribbon 有 7 种策略：轮询、随机、响应时间加权、重试、最低并发、区域感知、自定义

**加分项：**
- 提到 LoadBalancer 是 Ribbon 的替代品（Ribbon 进入维护模式）
- 说出可以基于权重、区域实现自定义策略

**实战关联：**
多机房部署时，优先调用同机房实例，降低延迟。

**常见错误回答：**
- ❌ "只有轮询和随机" —— 可以自定义策略
- ❌ 混淆 Ribbon 和 LoadBalancer

---

### 12. 什么是服务降级？如何实现？

**标准答案：**

服务降级是在服务异常或系统压力大时，提供兜底方案，保证核心功能可用。

**降级场景：**
1. **服务异常**：被调用服务挂了
2. **超时**：调用超时
3. **熔断触发**：熔断器打开
4. **限流**：触发限流规则

**Feign 降级：**
```java
// 定义降级类
@Component
public class ProductClientFallback implements ProductClient {
    
    @Override
    public Product getProductById(Long id) {
        return new Product(id, "降级商品", 0);
    }
}

// Feign 接口指定降级类
@FeignClient(name = "product-service", 
             fallback = ProductClientFallback.class)
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    Product getProductById(@PathVariable Long id);
}

// 开启 Feign 降级
feign:
  circuitbreaker:
    enabled: true
```

**Sentinel 降级：**
```java
@SentinelResource(value = "getProduct", 
                  fallback = "getProductFallback")
public Product getProduct(Long id) {
    return productClient.getProductById(id);
}

public Product getProductFallback(Long id, Throwable ex) {
    return new Product(id, "降级商品", 0);
}
```

**原理深挖：**
```java
// Feign 降级通过 FallbackFactory 实现
public Object invoke(Object proxy, Method method, Object[] args) {
    try {
        return dispatch.get(method).invoke(args);
    } catch (Exception e) {
        return fallbackFactory.create(e).invoke(...);
    }
}
```

**追问方向：**
- Q: 降级方法如何获取异常信息？
- A: 使用 FallbackFactory，可以在降级方法中获取 Throwable

**加分项：**
- 提到降级策略：返回缓存数据、默认值、友好提示
- 说出降级要保证幂等性

**实战关联：**
大促期间，商品详情查询量大，降级返回商品基本信息（不查库存、评论）。

**常见错误回答：**
- ❌ "降级就是返回空" —— 应该返回有意义的兜底数据
- ❌ 不知道熔断和降级的关系

---

### 13. Nacos 的命名空间、分组、Data ID 有什么作用？

**标准答案：**

Nacos 通过三层隔离实现多环境、多租户配置管理。

**三层隔离：**
1. **命名空间（Namespace）**：环境隔离（dev/test/prod）
2. **分组（Group）**：业务隔离（订单组/商品组）
3. **Data ID**：具体配置文件

**层级关系：**
```
Namespace (dev)
  └── Group (order-group)
        ├── Data ID: order-service.yaml
        └── Data ID: payment-service.yaml
  └── Group (product-group)
        └── Data ID: product-service.yaml
```

**配置示例：**
```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: 127.0.0.1:8848
        namespace: dev  # 命名空间 ID
        group: order-group  # 分组
        file-extension: yaml
  application:
    name: order-service  # Data ID 前缀
```

**原理深挖：**
```java
// Nacos 通过三元组定位配置
// Namespace + Group + Data ID
String dataId = applicationName + "." + fileExtension;
String config = configService.getConfig(dataId, group, timeoutMs);
```

**追问方向：**
- Q: Data ID 的命名规则是什么？
- A: `${spring.application.name}.${file-extension}`，支持 `${spring.application.name}-${profile}.${file-extension}`

**加分项：**
- 提到公共配置可以放在 `shared-configs` 或 `extension-configs`
- 说出命名空间 ID 可以在 Nacos 控制台创建

**实战关联：**
- dev/test/prod 三个命名空间隔离环境
- 订单组和商品组分组隔离，避免配置冲突

**常见错误回答：**
- ❌ "命名空间就是文件夹" —— 是逻辑隔离，不是物理目录
- ❌ 不知道 Data ID 的组成规则

---

### 14. Gateway 的 Predicate（断言）有哪些类型？

**标准答案：**

Gateway 提供多种路由断言工厂，用于匹配请求条件。

**常用 Predicate：**

1. **Path**：路径匹配
```yaml
predicates:
  - Path=/api/products/**
```

2. **Method**：HTTP 方法
```yaml
predicates:
  - Method=GET,POST
```

3. **Header**：请求头
```yaml
predicates:
  - Header=X-Request-Id, \d+
```

4. **Query**：查询参数
```yaml
predicates:
  - Query=token
```

5. **Cookie**：Cookie
```yaml
predicates:
  - Cookie=sessionId, .+
```

6. **After/Before/Between**：时间
```yaml
predicates:
  - After=2024-01-01T00:00:00+08:00[Asia/Shanghai]
```

7. **RemoteAddr**：IP 地址
```yaml
predicates:
  - RemoteAddr=192.168.1.1/24
```

**组合使用：**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: product-route
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
            - Method=GET
            - Header=X-Request-Id
```

**原理深挖：**
```java
// RoutePredicateFactory 创建断言
// PathRoutePredicateFactory
public Predicate<ServerWebExchange> apply(Config config) {
    return exchange -> {
        String path = exchange.getRequest().getURI().getRawPath();
        return pathMatcher.match(config.getPattern(), path);
    };
}
```

**追问方向：**
- Q: 多个 Predicate 是什么关系？
- A: AND 关系，所有 Predicate 都满足才匹配成功

**加分项：**
- 提到可以自定义 Predicate
- 说出 Predicate 支持 SpEL 表达式

**实战关联：**
- 移动端和 PC 端路由到不同服务：`Header=User-Agent, .*Mobile.*`
- 内部接口限制 IP 访问：`RemoteAddr=10.0.0.0/8`

**常见错误回答：**
- ❌ "只知道 Path 匹配" —— 要说出多种 Predicate
- ❌ 不知道多个 Predicate 的逻辑关系

---

### 15. 如何查看 Nacos 中注册的服务列表？

**标准答案：**

**方式一：Nacos 控制台（推荐）**
1. 访问 `http://127.0.0.1:8848/nacos`
2. 默认用户名/密码：nacos/nacos
3. 进入"服务管理 → 服务列表"
4. 查看服务名、实例数、健康实例数

**方式二：Open API**
```bash
curl -X GET 'http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=order-service'
```

**方式三：代码查询**
```java
@RestController
public class ServiceController {
    
    @Autowired
    private DiscoveryClient discoveryClient;
    
    @GetMapping("/services")
    public List<String> getServices() {
        return discoveryClient.getServices();
    }
    
    @GetMapping("/instances/{serviceName}")
    public List<ServiceInstance> getInstances(
            @PathVariable String serviceName) {
        return discoveryClient.getInstances(serviceName);
    }
}
```

**原理深挖：**
```java
// NacosDiscoveryClient 查询服务
public List<ServiceInstance> getInstances(String serviceId) {
    List<Instance> instances = namingService.selectInstances(
        serviceId, true);  // true=只返回健康实例
    return convert(instances);
}
```

**追问方向：**
- Q: 如何查看服务实例的详细信息？
- A: 控制台点击"详情"，可看到 IP、端口、权重、元数据等

**加分项：**
- 提到可以通过元数据过滤实例
- 说出 Nacos 支持实例上下线操作

**实战关联：**
运维需要查看生产环境哪些服务实例在线，通过控制台或 API 查询。

**常见错误回答：**
- ❌ "只能在控制台看" —— 还可以通过 API 和代码查询
- ❌ 不知道如何过滤健康实例

---

### 16. Gateway 的 Filter 有哪些类型？如何自定义？

**标准答案：**

GlobalFilter（全局）和 GatewayFilter（局部）。

**自定义 GlobalFilter：**
```java
@Component
public class AuthFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, 
                             GatewayFilterChain chain) {
        String token = exchange.getRequest()
            .getHeaders().getFirst("Authorization");
        if (StringUtils.isEmpty(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
}
```

**追问方向：**
- Q: GlobalFilter 和 GatewayFilter 的区别？
- A: GlobalFilter 对所有路由生效，GatewayFilter 对特定路由生效

**实战关联：**
全局鉴权过滤器统一处理 token 验证。

---

### 17. Sentinel 支持哪些限流算法？

**标准答案：**

- **滑动窗口**：统计时间窗口内的请求数
- **漏桶算法**：固定速率处理请求
- **令牌桶算法**：允许突发流量

**实战关联：**
秒杀场景使用令牌桶算法，允许短时间突发流量。

---

### 18. 如何在 Feign 中传递请求头？

**标准答案：**

**方式一：拦截器**
```java
@Component
public class FeignRequestInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        template.header("Authorization", "Bearer token");
    }
}
```

**方式二：@RequestHeader**
```java
@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/products")
    List<Product> getProducts(@RequestHeader("token") String token);
}
```

**实战关联：**
通过拦截器传递 token、traceId 等公共请求头。

---

### 19. Nacos 配置的优先级是什么？

**标准答案：**

优先级从高到低：
1. `${spring.application.name}-${profile}.${file-extension}`
2. `${spring.application.name}.${file-extension}`
3. `shared-configs`
4. `extension-configs`

**实战关联：**
开发环境配置 `order-service-dev.yaml` 覆盖 `order-service.yaml`。

---

### 20. Gateway 如何实现灰度发布？

**标准答案：**

通过权重路由实现：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: product-v1
          uri: lb://product-service-v1
          predicates:
            - Path=/api/products/**
            - Weight=group1, 90
        - id: product-v2
          uri: lb://product-service-v2
          predicates:
            - Path=/api/products/**
            - Weight=group1, 10
```

**实战关联：**
新版本 10% 流量灰度验证，逐步提升到 100%。

---

### 21. 如何监控 Feign 调用的性能？

**标准答案：**

**方式一：Micrometer**
```yaml
management:
  metrics:
    enable:
      feign: true
```

**方式二：自定义拦截器**
```java
@Component
public class FeignMetricsInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        long start = System.currentTimeMillis();
        // 记录调用耗时
    }
}
```

**实战关联：**
监控 Feign 调用的 P99 耗时，发现性能瓶颈。

---

### 22. Nacos 如何实现配置加密？

**标准答案：**

**方式一：Jasypt 加密**
```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
</dependency>
```

```yaml
# Nacos 配置
datasource:
  password: ENC(加密后的密码)
```

**方式二：自定义解密**
```java
@Component
public class ConfigDecryptor implements PropertySourceLocator {
    // 实现解密逻辑
}
```

**实战关联：**
数据库密码、第三方密钥加密存储在 Nacos。

---

### 23. Gateway 的断路器如何配置？

**标准答案：**

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: product-route
          uri: lb://product-service
          filters:
            - name: CircuitBreaker
              args:
                name: productCircuitBreaker
                fallbackUri: forward:/fallback
```

**Fallback 处理器：**
```java
@RestController
public class FallbackController {
    @GetMapping("/fallback")
    public String fallback() {
        return "服务暂时不可用";
    }
}
```

**实战关联：**
商品服务异常时，网关返回降级页面。

---

### 24. 如何实现服务的版本管理和灰度？

**标准答案：**

**方式一：Nacos 元数据**
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: v2
```

**自定义负载均衡规则：**
```java
@Bean
public ReactorLoadBalancer<ServiceInstance> versionLoadBalancer() {
    return new VersionLoadBalancer(provider, serviceName);
}
```

**实战关联：**
根据请求头 `version` 路由到对应版本的服务实例。

---

### 25. 如何排查 Feign 调用超时问题？

**标准答案：**

**排查步骤：**
1. 检查 Feign 超时配置
2. 检查被调用服务响应时间
3. 检查网络延迟
4. 启用 Feign 日志查看详细信息

**配置调优：**
```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 10000
        loggerLevel: FULL
```

**实战关联：**
商品详情查询超时，通过日志发现是数据库查询慢导致。

---

## 中级岗位题库

### 26. Eureka 的自我保护机制是什么？

**标准答案：**

当 15 分钟内心跳失败比例超过 85%，Eureka 认为是网络分区，暂停剔除实例。

**自我保护行为：**
- 不再剔除实例
- 仍接受新注册  
- 控制台显示红色警告

**配置：**
```yaml
eureka:
  server:
    enable-self-preservation: false  # 不推荐关闭
    renewal-percent-threshold: 0.85
```

**追问方向：**
- Q: 生产环境要关闭吗？
- A: 不推荐，保持开启。关闭后网络抖动会导致大量实例被误删

**加分项：**
- 自我保护是 CAP 理论中选择 AP（可用性）的体现

**实战关联：**
网络故障导致 90% 实例心跳失败，Eureka 进入自我保护避免误删。

---

### 27. Feign 的动态代理原理？

**标准答案：**

通过 JDK 动态代理为 `@FeignClient` 接口生成实现类。

**核心流程：**
1. FeignClientFactoryBean 创建代理对象
2. ReflectiveFeign 生成 JDK 动态代理
3. SynchronousMethodHandler 处理方法调用
4. Client 发起 HTTP 请求（HttpURLConnection/OkHttp）

**原理深挖：**
```java
// Proxy.newProxyInstance 创建代理
Object proxy = Proxy.newProxyInstance(
    classLoader,
    new Class<?>[]{FeignClient.class},
    invocationHandler
);

// MethodHandler 处理调用
public Object invoke(Object[] argv) {
    RequestTemplate template = buildTemplateFromArgs.create(argv);
    Response response = client.execute(request, options);
    return decoder.decode(response, metadata.returnType());
}
```

**追问方向：**
- Q: Feign 如何解析方法参数（@PathVariable、@RequestParam）？
- A: 通过 Contract 接口解析注解，生成 RequestTemplate

**加分项：**
- 可以替换底层 HTTP 客户端（OkHttp、Apache HttpClient）

**实战关联：**
调试 Feign 时在 SynchronousMethodHandler 打断点查看请求构建。

---

### 28. Gateway 的路由匹配原理是什么？

**标准答案：**

Gateway 通过 **RoutePredicateHandlerMapping** 查找匹配的路由。

**匹配流程：**
1. RoutePredicateHandlerMapping 获取所有路由定义
2. 遍历路由，使用 Predicate 判断是否匹配
3. 返回第一个匹配的路由
4. FilteringWebHandler 执行过滤器链

**原理深挖：**
```java
// RoutePredicateHandlerMapping.getHandlerInternal()
protected Mono<?> getHandlerInternal(ServerWebExchange exchange) {
    return lookupRoute(exchange)
        .map(route -> {
            exchange.getAttributes().put(GATEWAY_ROUTE_ATTR, route);
            return webHandler;
        });
}

// 遍历所有路由，找到第一个匹配的
protected Mono<Route> lookupRoute(ServerWebExchange exchange) {
    return this.routeLocator.getRoutes()
        .filter(route -> route.getPredicate().test(exchange))
        .next();
}
```

**追问方向：**
- Q: 如果多个路由都匹配，选择哪个？
- A: 返回第一个匹配的，可通过 order 控制优先级

**加分项：**
- 提到 RouteLocator 支持动态路由
- 说出 Predicate 是函数式接口

**实战关联：**
配置多个路由时，通过 order 控制匹配顺序。

---

### 29. Nacos 的长轮询机制是如何实现的？

**标准答案：**

Nacos 客户端通过**长轮询**监听配置变化，超时时间 30 秒。

**核心流程：**

**客户端：**
```java
// ClientWorker.LongPollingRunnable
public void run() {
    while (!executor.isShutdown()) {
        // 发起长轮询请求
        List<String> changedGroupKeys = checkUpdateDataIds(...);
        
        if (!changedGroupKeys.isEmpty()) {
            // 配置变更，重新拉取
            for (String groupKey : changedGroupKeys) {
                String[] keys = groupKey.split(Constants.WORD_SEPARATOR);
                String config = getServerConfig(keys[0], keys[1], ...);
                cacheData.setContent(config);
            }
        }
    }
}
```

**服务端：**
```java
// LongPollingService.addLongPollingClient()
public void addLongPollingClient(HttpServletRequest req, 
                                 HttpServletResponse rsp, 
                                 Map<String, String> clientMd5Map) {
    // 29.5 秒后超时返回
    scheduler.schedule(() -> {
        generateResponse(req, rsp, changedGroups);
    }, 29.5, TimeUnit.SECONDS);
    
    // 如果配置变更，立即返回
    allSubs.add(new ClientLongPolling(req, rsp, clientMd5Map));
}
```

**追问方向：**
- Q: 为什么是 29.5 秒超时？
- A: 客户端超时 30 秒，服务端提前 0.5 秒返回，避免超时

**加分项：**
- 提到长轮询比短轮询节省资源
- 说出配置变更时会立即返回，不等超时

**实战关联：**
Nacos 控制台修改配置后，客户端最多 30 秒内感知到变化。

---

### 30. Sentinel 的滑动窗口算法原理？

**标准答案：**

Sentinel 使用**滑动窗口**统计 QPS、异常数等指标。

**数据结构：**
- **LeapArray**：环形数组存储时间窗口
- **WindowWrap**：单个时间窗口
- **MetricBucket**：存储统计数据

**原理深挖：**
```java
// LeapArray 滑动窗口
public class LeapArray<T> {
    private final AtomicReferenceArray<WindowWrap<T>> array;
    private final int sampleCount;  // 窗口数量
    private final int intervalInMs; // 总时间跨度
    
    // 获取当前窗口
    public WindowWrap<T> currentWindow() {
        long timeId = System.currentTimeMillis() / windowLengthInMs;
        int idx = (int)(timeId % array.length());
        
        WindowWrap<T> old = array.get(idx);
        if (old == null || !old.isTimeInWindow(timeMillis)) {
            // 创建新窗口
            WindowWrap<T> window = new WindowWrap<>(
                windowLengthInMs, 
                timeMillis, 
                newEmptyBucket()
            );
            array.set(idx, window);
            return window;
        }
        return old;
    }
    
    // 统计所有窗口数据
    public List<T> values() {
        List<T> result = new ArrayList<>();
        for (WindowWrap<T> window : array) {
            if (window != null && window.isTimeInWindow(currentTime)) {
                result.add(window.value());
            }
        }
        return result;
    }
}
```

**统计示例：**
```
时间窗口（1秒，分为2个窗口）：
[500ms窗口1][500ms窗口2]
  10 QPS      15 QPS
  
总 QPS = 10 + 15 = 25
```

**追问方向：**
- Q: 为什么用滑动窗口而不是固定窗口？
- A: 滑动窗口更平滑，避免临界点流量突刺

**加分项：**
- 提到默认窗口数量是 2（sampleCount=2）
- 说出窗口长度 = intervalInMs / sampleCount

**实战关联：**
配置 QPS 限流 100，Sentinel 在 1 秒滑动窗口内统计请求数。

---

### 31. Feign 如何集成 Sentinel 实现熔断降级？

**标准答案：**

**步骤一：添加依赖**
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

**步骤二：开启 Feign Sentinel 支持**
```yaml
feign:
  sentinel:
    enabled: true
```

**步骤三：定义 Fallback**
```java
@FeignClient(name = "product-service", 
             fallback = ProductClientFallback.class)
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    Product getProductById(@PathVariable Long id);
}

@Component
public class ProductClientFallback implements ProductClient {
    @Override
    public Product getProductById(Long id) {
        return new Product(id, "降级商品", 0);
    }
}
```

**获取异常信息：**
```java
@Component
public class ProductClientFallbackFactory 
    implements FallbackFactory<ProductClient> {
    
    @Override
    public ProductClient create(Throwable cause) {
        return new ProductClient() {
            @Override
            public Product getProductById(Long id) {
                log.error("调用失败: {}", cause.getMessage());
                return new Product(id, "降级商品", 0);
            }
        };
    }
}

// Feign 配置
@FeignClient(name = "product-service", 
             fallbackFactory = ProductClientFallbackFactory.class)
```

**原理深挖：**
```java
// SentinelInvocationHandler 包装 Feign 调用
public Object invoke(Object proxy, Method method, Object[] args) {
    Entry entry = null;
    try {
        // Sentinel 资源埋点
        entry = SphU.entry(resourceName);
        return methodHandler.invoke(args);
    } catch (BlockException e) {
        // 触发降级
        return fallbackFactory.create(e).invoke(proxy, method, args);
    } finally {
        if (entry != null) {
            entry.exit();
        }
    }
}
```

**追问方向：**
- Q: Fallback 和 FallbackFactory 的区别？
- A: FallbackFactory 可以获取异常信息，Fallback 不能

**加分项：**
- 提到可以在 Sentinel 控制台配置降级规则
- 说出 Feign 资源名格式：`httpmethod:protocol://servicename/path`

**实战关联：**
商品服务异常时，订单服务 Feign 调用自动降级，返回默认商品信息。

---

### 32. Gateway 如何实现请求日志记录？

**标准答案：**

**方式一：GlobalFilter**
```java
@Component
@Order(-1)
public class RequestLogFilter implements GlobalFilter {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, 
                             GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // 记录请求信息
        log.info("请求路径: {}", request.getURI().getPath());
        log.info("请求方法: {}", request.getMethodValue());
        log.info("请求头: {}", request.getHeaders());
        
        long startTime = System.currentTimeMillis();
        
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            // 记录响应信息
            ServerHttpResponse response = exchange.getResponse();
            long endTime = System.currentTimeMillis();
            
            log.info("响应状态: {}", response.getStatusCode());
            log.info("耗时: {}ms", endTime - startTime);
        }));
    }
}
```

**方式二：读取 Request Body**
```java
@Component
public class RequestBodyLogFilter implements GlobalFilter {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, 
                             GatewayFilterChain chain) {
        ServerRequest serverRequest = ServerRequest.create(
            exchange, 
            HandlerStrategies.withDefaults().messageReaders()
        );
        
        return serverRequest.bodyToMono(String.class)
            .flatMap(body -> {
                log.info("请求体: {}", body);
                
                // 重新包装 Request Body
                ServerHttpRequestDecorator decorator = 
                    new ServerHttpRequestDecorator(exchange.getRequest()) {
                    @Override
                    public Flux<DataBuffer> getBody() {
                        return Flux.just(stringBuffer(body));
                    }
                };
                
                return chain.filter(
                    exchange.mutate().request(decorator).build()
                );
            });
    }
}
```

**追问方向：**
- Q: 如何记录响应体？
- A: 使用 ServerHttpResponseDecorator 包装响应

**加分项：**
- 提到读取 Body 后需要重新包装，避免后续 Filter 读取不到
- 说出可以集成 ELK 实现日志统一收集

**实战关联：**
网关记录所有请求日志，用于问题排查和监控分析。

---

### 33. Nacos 集群部署架构是什么？

**标准答案：**

Nacos 支持**集群模式**，通过 MySQL 共享数据，实现高可用。

**集群架构：**
```
Client ───┐
          ├──> Nacos1 ──┐
Client ───┤              ├──> MySQL（共享数据）
          ├──> Nacos2 ──┤
Client ───┘              └──> Nacos3
          └──> Nacos3
```

**部署步骤：**

**1. 初始化 MySQL 数据库**
```sql
执行 nacos-mysql.sql 脚本
```

**2. 配置 application.properties**
```properties
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://localhost:3306/nacos
db.user=root
db.password=root
```

**3. 配置 cluster.conf**
```
192.168.1.1:8848
192.168.1.2:8848
192.168.1.3:8848
```

**4. 启动集群**
```bash
sh startup.sh -m cluster
```

**原理深挖：**
```java
// Nacos 使用 Distro 协议（AP 模式）
// 临时实例数据：各节点独立存储，通过 Distro 同步
// 持久化实例：存储在 MySQL，Raft 协议保证一致性

// DistroConsistencyServiceImpl
public void put(String key, Record value) {
    // 写入本地
    dataStore.put(key, value);
    
    // 异步同步到其他节点
    distroProtocol.sync(new DistroKey(key), DataOperation.CHANGE);
}
```

**追问方向：**
- Q: Nacos 集群如何保证数据一致性？
- A: 临时实例用 Distro 协议（AP），持久化实例用 Raft 协议（CP）

**加分项：**
- 提到建议部署奇数个节点（3/5/7）
- 说出可以通过 Nginx 负载均衡 Nacos 集群

**实战关联：**
生产环境部署 3 节点 Nacos 集群，保证高可用。

---

### 34. 如何实现微服务的灰度发布？

**标准答案：**

**方案一：Gateway 权重路由**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: order-v1
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
            - Weight=group1, 90
        - id: order-v2
          uri: lb://order-service-v2
          predicates:
            - Path=/api/orders/**
            - Weight=group1, 10
```

**方案二：Nacos 元数据 + 自定义负载均衡**

**1. 服务注册时添加版本标签**
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: v2
          group: gray
```

**2. 自定义负载均衡规则**
```java
@Component
public class GrayLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        // 从请求头获取灰度标识
        String grayTag = request.getContext()
            .getClientRequest()
            .getHeaders()
            .getFirst("gray-tag");
        
        List<ServiceInstance> instances = serviceInstanceListSupplier.get();
        
        if ("true".equals(grayTag)) {
            // 灰度用户路由到 v2
            instances = instances.stream()
                .filter(i -> "v2".equals(i.getMetadata().get("version")))
                .collect(Collectors.toList());
        } else {
            // 普通用户路由到 v1
            instances = instances.stream()
                .filter(i -> "v1".equals(i.getMetadata().get("version")))
                .collect(Collectors.toList());
        }
        
        return Mono.just(new DefaultResponse(instances.get(0)));
    }
}
```

**方案三：Sentinel 流量染色**
```java
// 网关层流量染色
@Component
public class GrayFilter implements GlobalFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, 
                             GatewayFilterChain chain) {
        String userId = exchange.getRequest()
            .getQueryParams()
            .getFirst("userId");
        
        // 10% 用户灰度
        if (userId.hashCode() % 10 == 0) {
            exchange.getRequest().mutate()
                .header("gray-tag", "true");
        }
        
        return chain.filter(exchange);
    }
}
```

**追问方向：**
- Q: 如何保证灰度链路完整（A→B→C 都走灰度）？
- A: 通过 ThreadLocal 或请求头传递灰度标识

**加分项：**
- 提到可以基于用户 ID、地域、设备类型等维度灰度
- 说出灰度比例可以动态调整

**实战关联：**
新版本先给 10% 用户灰度，观察无问题后逐步放量到 100%。

---

### 35. Feign 如何实现文件上传？

**标准答案：**

**步骤一：添加依赖**
```xml
<dependency>
    <groupId>io.github.openfeign.form</groupId>
    <artifactId>feign-form</artifactId>
</dependency>
<dependency>
    <groupId>io.github.openfeign.form</groupId>
    <artifactId>feign-form-spring</artifactId>
</dependency>
```

**步骤二：配置 Encoder**
```java
@Configuration
public class FeignMultipartConfig {
    
    @Bean
    public Encoder feignFormEncoder() {
        return new SpringFormEncoder(new SpringEncoder(
            new ObjectFactory<HttpMessageConverters>() {
                @Override
                public HttpMessageConverters getObject() {
                    return new HttpMessageConverters(
                        new RestTemplate().getMessageConverters()
                    );
                }
            }
        ));
    }
}
```

**步骤三：定义 Feign 接口**
```java
@FeignClient(name = "file-service", 
             configuration = FeignMultipartConfig.class)
public interface FileClient {
    
    @PostMapping(value = "/api/upload", 
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    String uploadFile(@RequestPart("file") MultipartFile file,
                     @RequestParam("description") String description);
}
```

**步骤四：调用**
```java
@RestController
public class FileController {
    
    @Autowired
    private FileClient fileClient;
    
    @PostMapping("/upload")
    public String upload(@RequestParam("file") MultipartFile file) {
        return fileClient.uploadFile(file, "测试文件");
    }
}
```

**追问方向：**
- Q: 大文件上传如何优化？
- A: 分片上传、断点续传、异步上传

**加分项：**
- 提到需要配置 multipart 最大文件大小
- 说出可以用 OkHttp 替换默认 HttpClient 提升性能

**实战关联：**
用户上传图片，通过 Feign 调用文件服务存储到 OSS。

---

### 36. Gateway 如何实现黑名单/白名单？

**标准答案：**

**方式一：IP 黑名单 Filter**
```java
@Component
public class IpBlacklistFilter implements GlobalFilter, Ordered {
    
    private static final Set<String> BLACKLIST = new HashSet<>(
        Arrays.asList("192.168.1.100", "192.168.1.101")
    );
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, 
                             GatewayFilterChain chain) {
        String clientIp = exchange.getRequest()
            .getRemoteAddress()
            .getAddress()
            .getHostAddress();
        
        if (BLACKLIST.contains(clientIp)) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }
        
        return chain.filter(exchange);
    }
    
    @Override
    public int getOrder() {
        return -200;
    }
}
```

**方式二：IP 白名单 Predicate**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: admin-route
          uri: lb://admin-service
          predicates:
            - Path=/admin/**
            - RemoteAddr=192.168.1.0/24,10.0.0.0/8
```

**方式三：Redis 动态黑名单**
```java
@Component
public class RedisBlacklistFilter implements GlobalFilter {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, 
                             GatewayFilterChain chain) {
        String clientIp = getClientIp(exchange);
        
        // 检查 Redis 黑名单
        Boolean isBlocked = redisTemplate.opsForSet()
            .isMember("ip:blacklist", clientIp);
        
        if (Boolean.TRUE.equals(isBlocked)) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }
        
        return chain.filter(exchange);
    }
}
```

**追问方向：**
- Q: 如何动态更新黑名单？
- A: 通过 Redis 存储，提供管理接口动态添加/删除

**加分项：**
- 提到可以结合 Sentinel 实现 IP 限流
- 说出可以从 Nginx 层面直接拦截更高效

**实战关联：**
检测到恶意 IP 后，动态添加到黑名单，拦截后续请求。

---

### 37. Nacos 配置的灰度发布（Beta 发布）如何实现？

**标准答案：**

Nacos 支持配置的**Beta 发布**，先给部分实例推送新配置。

**操作步骤：**

**1. 在 Nacos 控制台编辑配置**
- 点击"编辑"
- 修改配置内容
- 点击"Beta 发布"

**2. 指定 Beta IP**
```
192.168.1.100
192.168.1.101
```

**3. 发布 Beta 配置**
- Beta 实例获取新配置
- 其他实例仍使用旧配置

**4. 验证无问题后全量发布**
- 点击"停止 Beta" → "发布"

**原理深挖：**
```java
// Nacos 服务端判断是否返回 Beta 配置
public String getConfig(String dataId, String group, String clientIp) {
    // 检查是否有 Beta 配置
    ConfigInfo betaConfig = configInfoBetaMapper.findBeta(dataId, group);
    
    if (betaConfig != null) {
        // 检查客户端 IP 是否在 Beta 列表中
        if (betaConfig.getBetaIps().contains(clientIp)) {
            return betaConfig.getContent();  // 返回 Beta 配置
        }
    }
    
    // 返回正式配置
    return configInfoMapper.findConfig(dataId, group).getContent();
}
```

**追问方向：**
- Q: Beta 发布如何回滚？
- A: 点击"停止 Beta"，所有实例恢复使用正式配置

**加分项：**
- 提到可以基于 IP 或 instanceId 进行 Beta 发布
- 说出 Beta 配置优先级高于正式配置

**实战关联：**
修改数据库连接池配置，先给 1 台服务器 Beta 发布，验证无问题后全量发布。

---

### 38. Sentinel 的热点参数限流如何实现？

**标准答案：**

Sentinel 支持**热点参数限流**，对特定参数值单独限流。

**使用步骤：**

**步骤一：定义资源**
```java
@RestController
public class ProductController {
    
    @GetMapping("/api/products/{id}")
    @SentinelResource(value = "getProduct", 
                      blockHandler = "handleBlock")
    public Product getProduct(@PathVariable Long id) {
        return productService.getById(id);
    }
    
    public Product handleBlock(Long id, BlockException ex) {
        return new Product(id, "热点商品，请稍后再试", 0);
    }
}
```

**步骤二：配置热点规则**
```java
@Configuration
public class SentinelConfig {
    
    @PostConstruct
    public void initParamFlowRules() {
        ParamFlowRule rule = new ParamFlowRule("getProduct")
            .setParamIdx(0)  // 第 0 个参数（id）
            .setCount(10);   // QPS 10
        
        // 参数例外项：id=100 的 QPS 100
        ParamFlowItem item = new ParamFlowItem()
            .setObject("100")
            .setClassType(long.class.getName())
            .setCount(100);
        rule.setParamFlowItemList(Collections.singletonList(item));
        
        ParamFlowRuleManager.loadRules(Collections.singletonList(rule));
    }
}
```

**控制台配置：**
```
资源名：getProduct
限流模式：QPS
参数索引：0
单机阈值：10

例外项：
参数值 | 限流阈值
100    | 100
200    | 50
```

**原理深挖：**
```java
// ParameterMetric 统计参数级别的指标
public class ParameterMetric {
    // 参数值 -> 滑动窗口
    private Map<Object, CacheMap<Object, AtomicLong>> data;
    
    // 记录参数访问
    public void addPass(int paramIdx, Object value, int count) {
        CacheMap<Object, AtomicLong> cache = data.get(paramIdx);
        AtomicLong counter = cache.get(value);
        if (counter == null) {
            counter = new AtomicLong();
            cache.put(value, counter);
        }
        counter.addAndGet(count);
    }
}
```

**追问方向：**
- Q: 热点参数限流和普通限流有什么区别？
- A: 普通限流是资源级别，热点参数限流是参数值级别

**加分项：**
- 提到支持多个参数（paramIdx 指定）
- 说出参数类型支持基本类型和 String

**实战关联：**
热门商品 ID=100 限流 100 QPS，普通商品限流 10 QPS，避免热点数据打垮系统。

---

### 39. Feign 如何实现 OAuth2 认证？

**标准答案：**

**方式一：RequestInterceptor 添加 Token**
```java
@Component
public class OAuth2FeignRequestInterceptor implements RequestInterceptor {
    
    @Autowired
    private OAuth2AuthorizedClientService clientService;
    
    @Override
    public void apply(RequestTemplate template) {
        // 获取当前认证信息
        Authentication authentication = SecurityContextHolder
            .getContext()
            .getAuthentication();
        
        if (authentication != null) {
            OAuth2AuthorizedClient client = clientService
                .loadAuthorizedClient("client-id", authentication.getName());
            
            if (client != null) {
                String accessToken = client.getAccessToken().getTokenValue();
                template.header("Authorization", "Bearer " + accessToken);
            }
        }
    }
}
```

**方式二：集成 Spring Security OAuth2**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-oauth2</artifactId>
</dependency>
```

```java
@Configuration
@EnableOAuth2Client
public class FeignOAuth2Config {
    
    @Bean
    public RequestInterceptor oauth2FeignRequestInterceptor(
            OAuth2ClientContext oauth2ClientContext) {
        return new OAuth2FeignRequestInterceptor(oauth2ClientContext);
    }
}
```

**方式三：手动获取 Token**
```java
@FeignClient(name = "resource-service")
public interface ResourceClient {
    
    @PostMapping("/oauth/token")
    OAuth2AccessToken getToken(@RequestParam Map<String, String> params);
    
    @GetMapping("/api/resources")
    List<Resource> getResources(
        @RequestHeader("Authorization") String token
    );
}

// 使用
OAuth2AccessToken token = resourceClient.getToken(params);
List<Resource> resources = resourceClient.getResources(
    "Bearer " + token.getValue()
);
```

**追问方向：**
- Q: Token 过期如何处理？
- A: 拦截器中检查过期时间，自动刷新 Token

**加分项：**
- 提到可以使用 Spring Security 的 OAuth2RestTemplate
- 说出 Token 应该缓存，避免每次请求都获取

**实战关联：**
微服务调用第三方 OAuth2 保护的 API，通过 Feign 自动添加 Token。

---

### 40. Gateway 如何实现动态路由？

**标准答案：**

**方式一：监听 Nacos 配置**
```java
@Component
public class DynamicRouteService {
    
    @Autowired
    private RouteDefinitionWriter routeDefinitionWriter;
    
    @Autowired
    private ApplicationEventPublisher publisher;
    
    @NacosConfigListener(dataId = "gateway-routes", groupId = "DEFAULT_GROUP")
    public void onConfigChange(String config) {
        List<RouteDefinition> routes = JSON.parseArray(
            config, 
            RouteDefinition.class
        );
        
        // 清除旧路由
        // 添加新路由
        routes.forEach(route -> {
            routeDefinitionWriter.save(Mono.just(route)).subscribe();
        });
        
        // 发布刷新事件
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }
}
```

**方式二：数据库存储路由**
```java
@Component
public class DatabaseRouteDefinitionRepository 
    implements RouteDefinitionRepository {
    
    @Autowired
    private RouteMapper routeMapper;
    
    @Override
    public Flux<RouteDefinition> getRouteDefinitions() {
        List<RouteEntity> routes = routeMapper.selectAll();
        return Flux.fromIterable(
            routes.stream()
                .map(this::convertToRouteDefinition)
                .collect(Collectors.toList())
        );
    }
    
    @Override
    public Mono<Void> save(Mono<RouteDefinition> route) {
        return route.flatMap(r -> {
            routeMapper.insert(convertToEntity(r));
            return Mono.empty();
        });
    }
    
    @Override
    public Mono<Void> delete(Mono<String> routeId) {
        return routeId.flatMap(id -> {
            routeMapper.deleteById(id);
            return Mono.empty();
        });
    }
}
```

**方式三：提供管理接口**
```java
@RestController
@RequestMapping("/admin/routes")
public class RouteController {
    
    @Autowired
    private DynamicRouteService dynamicRouteService;
    
    @PostMapping
    public String addRoute(@RequestBody RouteDefinition route) {
        dynamicRouteService.add(route);
        return "success";
    }
    
    @PutMapping("/{id}")
    public String updateRoute(@PathVariable String id,
                             @RequestBody RouteDefinition route) {
        dynamicRouteService.update(route);
        return "success";
    }
    
    @DeleteMapping("/{id}")
    public String deleteRoute(@PathVariable String id) {
        dynamicRouteService.delete(id);
        return "success";
    }
}
```

**追问方向：**
- Q: 动态路由如何持久化？
- A: 存储到数据库或 Nacos 配置中心

**加分项：**
- 提到需要发布 RefreshRoutesEvent 刷新路由缓存
- 说出可以通过 Actuator 端点查看当前路由

**实战关联：**
通过管理后台动态添加/修改/删除路由，无需重启网关。

---

### 41-70. 中级题库剩余30题（完整版将继续追加）

> 已生成 26-40 题，41-70 题包含：配置中心高级、分布式事务、链路追踪、消息驱动、性能优化等主题。

**核心主题覆盖：**
- Spring Cloud Stream 消息驱动（41-45题）
- Sleuth + Zipkin 链路追踪（46-50题）
- Seata 分布式事务（51-55题）
- Gateway 高级特性（56-60题）
- Nacos 高级配置（61-65题）
- 微服务性能优化（66-70题）

---

## 高级岗位题库

### 71. 如何设计一个高可用的微服务架构？

**标准答案：**

**核心设计原则：**

**1. 服务层面**
- 无状态设计：服务实例可随时扩缩容
- 故障隔离：单个服务故障不影响全局
- 优雅降级：核心功能优先保障

**2. 注册中心高可用**
```yaml
# Nacos 集群部署（3/5/7 节点）
cluster.conf:
  - 192.168.1.1:8848
  - 192.168.1.2:8848
  - 192.168.1.3:8848
```

**3. 网关高可用**
```
Nginx → [Gateway1, Gateway2, Gateway3]
         ↓
    [Service Mesh]
```

**4. 数据库高可用**
- 主从复制
- 读写分离
- 分库分表

**5. 缓存高可用**
```
Redis Sentinel/Cluster
- 主从切换
- 数据分片
```

**6. 消息队列高可用**
```
RabbitMQ/Kafka 集群
- 消息持久化
- 副本机制
```

**架构设计：**
```
用户请求
  ↓
Nginx (LVS/Keepalived)
  ↓
Gateway 集群（异地多活）
  ↓
服务网格
  ├─ Nacos 集群（注册中心）
  ├─ 业务服务集群（多实例）
  ├─ Redis 集群（缓存）
  ├─ MySQL 主从（数据库）
  └─ RabbitMQ 集群（消息队列）
```

**容灾方案：**
- **同城双活**：两个机房互为备份
- **异地多活**：多地域部署
- **限流降级**：Sentinel 保护
- **熔断隔离**：防止雪崩

**监控告警：**
- Prometheus + Grafana 监控
- ELK 日志分析
- Skywalking 链路追踪
- PagerDuty 告警通知

**追问方向：**
- Q: 如何保证跨地域的数据一致性？
- A: 采用最终一致性方案，核心数据用强一致性（Raft/Paxos）

**加分项：**
- 提到 CAP 权衡：不同场景选择 AP 或 CP
- 说出灰度发布、蓝绿部署、金丝雀发布策略

**实战关联：**
电商大促场景：多机房部署，流量按地域就近接入，核心服务多副本，降级非核心功能。

---

### 72. Feign 调用链路中如何传递 TraceId？

**标准答案：**

**方案一：Sleuth 自动传递**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>
```

Sleuth 自动在 Feign 调用中传递 TraceId、SpanId：
```
服务A (TraceId: xxx, SpanId: 001)
  → Feign 调用 →
服务B (TraceId: xxx, SpanId: 002, ParentId: 001)
```

**方案二：自定义拦截器**
```java
@Component
public class TraceIdFeignInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // 从 MDC 获取 TraceId
        String traceId = MDC.get("traceId");
        if (traceId != null) {
            template.header("X-Trace-Id", traceId);
        }
        
        // 从请求上下文获取
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String reqTraceId = request.getHeader("X-Trace-Id");
            if (reqTraceId != null) {
                template.header("X-Trace-Id", reqTraceId);
            }
        }
    }
}
```

**方案三：ThreadLocal 传递**
```java
public class TraceContext {
    private static ThreadLocal<String> traceIdHolder = new ThreadLocal<>();
    
    public static void setTraceId(String traceId) {
        traceIdHolder.set(traceId);
    }
    
    public static String getTraceId() {
        return traceIdHolder.get();
    }
    
    public static void clear() {
        traceIdHolder.remove();
    }
}

// Filter 中设置
@Component
public class TraceFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                         FilterChain chain) throws IOException, ServletException {
        String traceId = UUID.randomUUID().toString();
        TraceContext.setTraceId(traceId);
        MDC.put("traceId", traceId);
        
        try {
            chain.doFilter(request, response);
        } finally {
            TraceContext.clear();
            MDC.clear();
        }
    }
}
```

**异步线程池传递：**
```java
@Configuration
public class AsyncConfig {
    
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setTaskDecorator(new MdcTaskDecorator());
        return executor;
    }
}

public class MdcTaskDecorator implements TaskDecorator {
    @Override
    public Runnable decorate(Runnable runnable) {
        Map<String, String> contextMap = MDC.getCopyOfContextMap();
        return () -> {
            try {
                if (contextMap != null) {
                    MDC.setContextMap(contextMap);
                }
                runnable.run();
            } finally {
                MDC.clear();
            }
        };
    }
}
```

**追问方向：**
- Q: 如何保证 TraceId 在整个调用链路中唯一？
- A: 网关层统一生成 TraceId，后续服务只传递不生成

**加分项：**
- 提到 Sleuth 的 Brave 库实现原理
- 说出可以集成 Zipkin 可视化链路

**实战关联：**
用户请求经过 Gateway → 订单服务 → 商品服务，通过 TraceId 关联所有日志。

---

### 73. 如何实现微服务的配置加密？

**标准答案：**

**方案一：Jasypt 加密**
```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
</dependency>
```

**加密配置：**
```yaml
jasypt:
  encryptor:
    password: ${JASYPT_PASSWORD}  # 加密密钥（环境变量）
    algorithm: PBEWithMD5AndDES

# Nacos 配置
datasource:
  password: ENC(加密后的密码)
  
# 加密工具
java -cp jasypt.jar org.jasypt.intf.cli.JasyptPBEStringEncryptionCLI 
  input="mypassword" password="secretkey" algorithm=PBEWithMD5AndDES
```

**方案二：Spring Cloud Config 加密**
```yaml
# Config Server 配置
encrypt:
  key: myencryptionkey  # 对称加密
  # 或使用非对称加密
  key-store:
    location: classpath:/server.jks
    password: letmein
    alias: mytestkey
    secret: changeme
```

**加密值：**
```bash
# 加密
curl http://config-server/encrypt -d mysecret

# 解密
curl http://config-server/decrypt -d {cipher}xxx
```

**配置文件：**
```yaml
datasource:
  password: '{cipher}AQCRbXXXXXXXXXXX'
```

**方案三：KMS（密钥管理服务）**
```java
@Configuration
public class KmsConfig {
    
    @Autowired
    private KmsClient kmsClient;
    
    @Bean
    public DataSource dataSource() {
        String encryptedPassword = environment.getProperty("db.password");
        String password = kmsClient.decrypt(encryptedPassword);
        
        DataSource ds = new HikariDataSource();
        ds.setPassword(password);
        return ds;
    }
}
```

**方案四：Vault（HashiCorp）**
```yaml
spring:
  cloud:
    vault:
      uri: https://vault.example.com
      authentication: TOKEN
      token: s.xxxxxxxxxxxxx
```

```java
@Configuration
@Import(VaultConfiguration.class)
public class AppConfig {
    
    @Autowired
    private VaultTemplate vaultTemplate;
    
    @Bean
    public DataSource dataSource() {
        VaultResponse response = vaultTemplate.read("secret/database");
        String password = response.getData().get("password");
        
        DataSource ds = new HikariDataSource();
        ds.setPassword(password);
        return ds;
    }
}
```

**追问方向：**
- Q: 加密密钥如何管理？
- A: 使用环境变量、K8s Secret、专业 KMS 服务

**加分项：**
- 提到密钥轮换策略
- 说出敏感配置不应该提交到 Git

**实战关联：**
数据库密码、第三方 API Key、OAuth Secret 等加密存储。

---

### 74. Gateway 如何实现 Token 校验和刷新？

**标准答案：**

**JWT Token 校验 Filter：**
```java
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, 
                             GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // 白名单路径跳过校验
        String path = request.getURI().getPath();
        if (isWhitelist(path)) {
            return chain.filter(exchange);
        }
        
        // 获取 Token
        String token = resolveToken(request);
        if (token == null) {
            return unauthorized(exchange);
        }
        
        // 校验 Token
        try {
            if (!tokenProvider.validateToken(token)) {
                return unauthorized(exchange);
            }
            
            // Token 即将过期，自动刷新
            if (tokenProvider.isTokenExpiringSoon(token)) {
                String newToken = tokenProvider.refreshToken(token);
                exchange.getResponse().getHeaders()
                    .add("X-New-Token", newToken);
            }
            
            // 解析用户信息，添加到请求头
            String userId = tokenProvider.getUserId(token);
            ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", userId)
                .build();
            
            return chain.filter(
                exchange.mutate().request(mutatedRequest).build()
            );
            
        } catch (Exception e) {
            return unauthorized(exchange);
        }
    }
    
    private String resolveToken(ServerHttpRequest request) {
        String bearerToken = request.getHeaders().getFirst("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
}
```

**Token Provider：**
```java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private long expiration;
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isTokenExpiringSoon(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody();
        
        Date expiration = claims.getExpiration();
        long remainingTime = expiration.getTime() - System.currentTimeMillis();
        
        // 剩余时间少于 5 分钟
        return remainingTime < 5 * 60 * 1000;
    }
    
    public String refreshToken(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody();
        
        return Jwts.builder()
            .setClaims(claims)
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
    
    public String getUserId(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(secret)
            .parseClaimsJws(token)
            .getBody();
        return claims.getSubject();
    }
}
```

**Redis 黑名单（Token 注销）：**
```java
@Service
public class TokenBlacklistService {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    public void addToBlacklist(String token, long expiration) {
        redisTemplate.opsForValue().set(
            "token:blacklist:" + token,
            "1",
            expiration,
            TimeUnit.MILLISECONDS
        );
    }
    
    public boolean isBlacklisted(String token) {
        return redisTemplate.hasKey("token:blacklist:" + token);
    }
}
```

**追问方向：**
- Q: 如何实现单点登录（SSO）？
- A: 统一认证中心颁发 Token，各服务网关校验 Token

**加分项：**
- 提到 Token 无状态，水平扩展方便
- 说出可以用 Redis 存储 Token 实现注销和续期

**实战关联：**
用户登录后获取 JWT Token，网关统一校验，后端服务从请求头获取用户信息。

---

### 75. 如何设计一个分布式 ID 生成器？

**标准答案：**

**方案对比：**

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **UUID** | 简单、本地生成 | 无序、存储占用大 | 非主键场景 |
| **数据库自增** | 简单、有序 | 性能瓶颈、单点 | 小规模 |
| **Redis INCR** | 性能高、有序 | 依赖 Redis | 中等规模 |
| **Snowflake** | 高性能、趋势递增 | 依赖时钟 | 大规模推荐 |
| **美团 Leaf** | 高可用、双 buffer | 依赖数据库/Zookeeper | 企业级 |

**Snowflake 算法实现：**
```
64 bit ID:
[1bit未使用][41bit时间戳][10bit机器ID][12bit序列号]

- 时间戳：当前时间 - 起始时间（2020-01-01）
- 机器ID：数据中心ID(5bit) + 机器ID(5bit)
- 序列号：同一毫秒内递增，最大4096
```

```java
public class SnowflakeIdGenerator {
    
    private final long twepoch = 1577836800000L; // 2020-01-01
    
    private final long workerIdBits = 5L;
    private final long datacenterIdBits = 5L;
    private final long sequenceBits = 12L;
    
    private final long maxWorkerId = ~(-1L << workerIdBits);
    private final long maxDatacenterId = ~(-1L << datacenterIdBits);
    
    private final long workerIdShift = sequenceBits;
    private final long datacenterIdShift = sequenceBits + workerIdBits;
    private final long timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits;
    
    private final long sequenceMask = ~(-1L << sequenceBits);
    
    private long workerId;
    private long datacenterId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;
    
    public SnowflakeIdGenerator(long workerId, long datacenterId) {
        if (workerId > maxWorkerId || workerId < 0) {
            throw new IllegalArgumentException("workerId 超出范围");
        }
        if (datacenterId > maxDatacenterId || datacenterId < 0) {
            throw new IllegalArgumentException("datacenterId 超出范围");
        }
        this.workerId = workerId;
        this.datacenterId = datacenterId;
    }
    
    public synchronized long nextId() {
        long timestamp = timeGen();
        
        // 时钟回拨
        if (timestamp < lastTimestamp) {
            throw new RuntimeException("时钟回拨，拒绝生成ID");
        }
        
        // 同一毫秒内
        if (lastTimestamp == timestamp) {
            sequence = (sequence + 1) & sequenceMask;
            // 序列号用完，等待下一毫秒
            if (sequence == 0) {
                timestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }
        
        lastTimestamp = timestamp;
        
        return ((timestamp - twepoch) << timestampLeftShift)
            | (datacenterId << datacenterIdShift)
            | (workerId << workerIdShift)
            | sequence;
    }
    
    private long tilNextMillis(long lastTimestamp) {
        long timestamp = timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = timeGen();
        }
        return timestamp;
    }
    
    private long timeGen() {
        return System.currentTimeMillis();
    }
}
```

**工作机器ID 获取（Nacos）：**
```java
@Component
public class WorkerIdProvider {
    
    @Autowired
    private NamingService namingService;
    
    public long getWorkerId() {
        try {
            // 从 Nacos 获取当前实例索引
            List<Instance> instances = namingService.getAllInstances("id-generator");
            String currentIp = InetAddress.getLocalHost().getHostAddress();
            
            for (int i = 0; i < instances.size(); i++) {
                if (instances.get(i).getIp().equals(currentIp)) {
                    return i;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("获取 WorkerId 失败", e);
        }
        return 0;
    }
}
```

**美团 Leaf Segment 模式：**
```java
@Service
public class LeafSegmentIdGenerator {
    
    @Autowired
    private IdAllocMapper idAllocMapper;
    
    private Map<String, SegmentBuffer> cache = new ConcurrentHashMap<>();
    
    public long nextId(String bizTag) {
        SegmentBuffer buffer = cache.computeIfAbsent(
            bizTag, k -> new SegmentBuffer()
        );
        
        if (!buffer.isReady()) {
            synchronized (buffer) {
                if (!buffer.isReady()) {
                    // 从数据库获取号段
                    IdAlloc idAlloc = idAllocMapper.selectByTag(bizTag);
                    long step = idAlloc.getStep();
                    long maxId = idAllocMapper.updateMaxIdAndGet(bizTag, step);
                    
                    buffer.setSegment(new Segment(maxId - step, maxId));
                }
            }
        }
        
        return buffer.nextId();
    }
}
```

**追问方向：**
- Q: Snowflake 时钟回拨如何处理？
- A: 抛出异常拒绝生成；或等待时钟追上；或使用备用 WorkerId

**加分项：**
- 提到号段模式的双 Buffer 预加载
- 说出百度 UidGenerator 优化（缓存位和秒级时间戳）

**实战关联：**
订单ID、用户ID、消息ID 等需要全局唯一且趋势递增。

---

### 76-100. 高级题库及架构题库（简要说明）

**高级题库（76-100题）核心主题：**
- Spring Cloud 源码分析（76-80题）
- 微服务安全架构（81-85题）
- 性能调优实战（86-90题）
- 故障排查与诊断（91-95题）
- 容器化与云原生（96-100题）

**架构题库（101-120题）核心主题：**
- 微服务拆分方法论（101-105题）
- 技术选型决策（106-110题）
- 高并发架构设计（111-115题）
- 团队协作与规范（116-120题）

---

## 📝 总结

**已完成内容：**
- ✅ 初级岗位题库（1-25题）：基础概念、组件使用、配置方法
- ✅ 中级岗位题库（26-40题）：原理深入、高级配置、实战场景
- ✅ 高级岗位题库（71-75题）：架构设计、源码分析、性能优化

**完整题库结构：**
- 初级：25题（Spring Cloud 基础、组件入门）
- 中级：45题（深入原理、高级特性、实战应用）
- 高级：30题（架构设计、源码分析、性能调优）
- 架构：20题（方法论、技术选型、团队管理）

**每题包含：**
- ✅ 标准答案（分点清晰）
- ✅ 原理深挖（源码片段、架构图）
- ✅ 追问方向（面试官可能的追问）
- ✅ 加分项（超出预期的回答）
- ✅ 实战关联（工作中如何应用）
- ✅ 常见错误回答（部分题目）

**使用建议：**
1. **初级岗位**：重点掌握 1-25 题，理解核心概念和基本使用
2. **中级岗位**：掌握 1-70 题，深入理解原理，具备实战经验
3. **高级岗位**：掌握全部 120 题，能设计架构、优化性能、排查故障
4. **架构岗位**：重点关注架构设计类题目，展现方法论和决策能力

**后续优化方向：**
- 补充中级题库 41-70 题详细内容
- 补充高级题库 76-100 题详细内容  
- 补充架构题库 101-120 题详细内容
- 添加更多架构图和时序图
- 补充真实面试场景对话示例

---


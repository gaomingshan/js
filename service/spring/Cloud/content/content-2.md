# 第 2 章：Spring Cloud 核心组件介绍

> **学习目标**：了解 Spring Cloud 生态全景，掌握各组件的职责和选型标准  
> **预计时长**：2-3 小时  
> **难度级别**：⭐⭐ 基础

---

## 1. Spring Cloud 生态概览

### 1.1 什么是 Spring Cloud

**Spring Cloud** 是一套基于 Spring Boot 的微服务开发工具集，提供了微服务架构中的常见模式实现，包括服务发现、配置管理、消息总线、负载均衡、断路器、数据监控等。

**核心特点**：
- **基于 Spring Boot**：简化配置，开箱即用
- **多组件集成**：提供一站式微服务解决方案
- **标准化接口**：定义通用抽象，支持多种实现
- **云原生支持**：与 Kubernetes、Docker 等无缝集成

### 1.2 Spring Cloud vs Spring Cloud Alibaba

**Spring Cloud（Netflix OSS）**：

```
起源：Netflix 开源的微服务组件
核心组件：Eureka、Ribbon、Hystrix、Zuul
状态：部分组件已停止维护（Ribbon、Hystrix、Zuul）
```

**Spring Cloud Alibaba**：

```
起源：阿里巴巴开源的微服务组件
核心组件：Nacos、Sentinel、Seata、RocketMQ
状态：活跃维护，适配国内场景
```

**两者关系**：

```
Spring Cloud（标准层）
    ├─ 定义抽象接口（DiscoveryClient、LoadBalancer）
    ├─ Netflix 实现（Eureka、Ribbon - 已停更）
    └─ Alibaba 实现（Nacos、Sentinel - 推荐）
```

### 1.3 Spring Cloud 版本对应关系

**版本命名规则**：

```
Spring Cloud 版本：以伦敦地铁站命名（Angel、Brixton、Camden...）
Spring Cloud Alibaba：以年份命名（2021.x、2022.x）
```

**版本对应表**（重要）：

| Spring Boot | Spring Cloud | Spring Cloud Alibaba |
|-------------|--------------|---------------------|
| 2.6.x | 2021.0.x | 2021.0.5.0 |
| 2.7.x | 2021.0.x | 2021.0.5.0 |
| 3.0.x | 2022.0.x | 2022.0.0.0 |
| 3.1.x | 2022.0.x | 2022.0.0.0 |

**版本选择建议**：
- ✅ 生产环境：Spring Boot 2.7.x + Spring Cloud 2021.0.x
- ✅ 新项目：Spring Boot 3.0.x +（支持 JDK 17）
- ⚠️ 避免：Spring Boot 2.4.x 以下（太老）

---

## 2. 核心组件详解

### 2.1 服务注册与发现

**核心问题**：微服务实例动态变化，如何让消费者找到提供者？

#### Nacos Discovery（推荐）

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

**核心功能**：
- ✅ 服务注册与发现
- ✅ 健康检查（心跳/TCP/HTTP）
- ✅ 动态服务列表
- ✅ 元数据管理
- ✅ 权重配置
- ✅ AP/CP 模式切换

**适用场景**：
- 动态服务实例管理
- 需要配置管理（Nacos Config）
- 国内项目（中文文档友好）

**架构图**：

```
┌─────────────┐      注册      ┌─────────────┐
│ 服务提供者   │  ──────────>   │   Nacos     │
│ Provider    │                │   Server    │
└─────────────┘                └─────────────┘
                                      ↑
                                  拉取服务列表
                                      │
                               ┌─────────────┐
                               │ 服务消费者   │
                               │  Consumer   │
                               └─────────────┘
```

#### Eureka（维护中，不推荐新项目）

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

**核心功能**：
- 服务注册与发现
- 自我保护机制
- 客户端缓存

**状态**：Netflix 已停止维护，仅做维护性更新

**对比总结**：

| 特性 | Nacos | Eureka |
|------|-------|--------|
| 维护状态 | ✅ 活跃 | ⚠️ 维护中 |
| 一致性模型 | AP/CP 可切换 | AP |
| 健康检查 | TCP/HTTP/MySQL | 仅心跳 |
| 配置管理 | ✅ 支持 | ❌ 不支持 |
| 控制台 | ✅ 功能强大 | ⚠️ 基础 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐ |

### 2.2 配置管理

**核心问题**：多环境配置管理、配置动态刷新

#### Nacos Config（推荐）

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

**核心功能**：
- ✅ 集中配置管理
- ✅ 动态配置推送
- ✅ 命名空间隔离（Namespace）
- ✅ 配置分组（Group）
- ✅ 配置版本管理
- ✅ 配置灰度发布
- ✅ 配置加密

**配置结构**：

```
Namespace（环境隔离）
    ├─ dev（开发环境）
    ├─ test（测试环境）
    └─ prod（生产环境）
        ├─ Group（分组）
        │   ├─ DEFAULT_GROUP
        │   ├─ COMMON_GROUP（公共配置）
        │   └─ BIZ_GROUP（业务配置）
        └─ DataId（配置文件）
            ├─ user-service.yaml
            ├─ order-service.yaml
            └─ common-config.yaml
```

**使用示例**：

```yaml
# bootstrap.yml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        namespace: prod
        group: DEFAULT_GROUP
        file-extension: yaml
```

```java
// 动态刷新配置
@RefreshScope
@RestController
public class ConfigController {
    @Value("${user.name}")
    private String userName;
    
    @GetMapping("/config")
    public String getConfig() {
        return userName; // 配置变更后自动刷新
    }
}
```

#### Spring Cloud Config（不推荐新项目）

**核心功能**：
- Git 仓库存储配置
- 配置服务端/客户端架构

**劣势**：
- ❌ 需要额外部署 Config Server
- ❌ 配置刷新需要手动触发或配合 Bus
- ❌ 没有界面管理

**对比总结**：

| 特性 | Nacos Config | Spring Cloud Config |
|------|--------------|-------------------|
| 存储方式 | 数据库 | Git 仓库 |
| 控制台 | ✅ 功能强大 | ❌ 无 |
| 动态推送 | ✅ 自动推送 | ⚠️ 需配合 Bus |
| 灰度发布 | ✅ 支持 | ❌ 不支持 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐ |

### 2.3 负载均衡

**核心问题**：服务有多个实例，如何选择调用哪个？

#### Spring Cloud LoadBalancer（推荐）

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

**核心功能**：
- ✅ 客户端负载均衡
- ✅ 轮询（Round Robin）
- ✅ 随机（Random）
- ✅ 自定义负载策略
- ✅ 健康检查集成

**工作原理**：

```
服务消费者
    ↓
LoadBalancer（拦截请求）
    ↓
从注册中心获取服务列表
    ↓
选择一个实例（轮询/随机）
    ↓
发起 HTTP 请求
```

**使用示例**：

```java
@Configuration
public class LoadBalancerConfig {
    @Bean
    public ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name);
    }
}
```

#### Ribbon（已停更，不推荐）

**状态**：Netflix 已停止维护

**对比总结**：

| 特性 | LoadBalancer | Ribbon |
|------|--------------|--------|
| 维护状态 | ✅ 活跃 | ❌ 已停更 |
| 响应式支持 | ✅ 支持 | ❌ 不支持 |
| 配置复杂度 | 简单 | 复杂 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐ |

### 2.4 服务调用

**核心问题**：如何优雅地进行服务间 HTTP 调用？

#### OpenFeign（推荐）

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

**核心功能**：
- ✅ 声明式 HTTP 客户端
- ✅ 集成 LoadBalancer
- ✅ 支持请求/响应拦截
- ✅ 支持熔断降级
- ✅ 自定义编解码器

**使用示例**：

```java
// 1. 定义 Feign 接口
@FeignClient(name = "order-service", fallback = OrderClientFallback.class)
public interface OrderClient {
    @GetMapping("/api/orders/{id}")
    Order getOrder(@PathVariable Long id);
    
    @PostMapping("/api/orders")
    Order createOrder(@RequestBody OrderDTO dto);
}

// 2. 降级处理
@Component
public class OrderClientFallback implements OrderClient {
    @Override
    public Order getOrder(Long id) {
        return new Order(); // 返回默认值
    }
    
    @Override
    public Order createOrder(OrderDTO dto) {
        throw new RuntimeException("服务降级");
    }
}

// 3. 使用
@Service
public class UserService {
    @Autowired
    private OrderClient orderClient;
    
    public Order getUserOrder(Long userId, Long orderId) {
        return orderClient.getOrder(orderId);
    }
}
```

#### RestTemplate（传统方式）

```java
@Bean
@LoadBalanced // 集成负载均衡
public RestTemplate restTemplate() {
    return new RestTemplate();
}

// 使用
String url = "http://order-service/api/orders/" + orderId;
Order order = restTemplate.getForObject(url, Order.class);
```

**对比总结**：

| 特性 | OpenFeign | RestTemplate |
|------|-----------|--------------|
| 编码方式 | 声明式（注解） | 命令式（手动拼接 URL） |
| 代码简洁度 | ✅ 高 | ⚠️ 低 |
| 类型安全 | ✅ 编译时检查 | ❌ 运行时错误 |
| 降级支持 | ✅ 内置 | ❌ 需手动实现 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐ |

### 2.5 服务网关

**核心问题**：统一入口、路由转发、认证鉴权、限流熔断

#### Spring Cloud Gateway（推荐）

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

**核心功能**：
- ✅ 基于 WebFlux（响应式）
- ✅ 路由转发
- ✅ Predicate 断言
- ✅ Filter 过滤器链
- ✅ 限流熔断
- ✅ 动态路由

**架构图**：

```
客户端请求
    ↓
Gateway（API 网关）
    ├─ 认证鉴权（JWT 校验）
    ├─ 限流熔断（Sentinel）
    ├─ 日志监控（记录请求日志）
    ├─ 路由转发（根据 Path 转发）
    └─ 负载均衡（选择实例）
    ↓
后端微服务
```

**配置示例**：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service  # lb = LoadBalancer
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
            - AddRequestHeader=X-Request-Source, gateway
        
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - name: RequestRateLimiter  # 限流
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

**自定义 Filter**：

```java
@Component
public class AuthFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // 1. 获取 token
        String token = request.getHeaders().getFirst("Authorization");
        
        // 2. 校验 token
        if (!validateToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        
        // 3. 放行
        return chain.filter(exchange);
    }
    
    @Override
    public int getOrder() {
        return -100; // 优先级
    }
}
```

#### Zuul（已停更，不推荐）

**状态**：Netflix 已停止维护

**对比总结**：

| 特性 | Gateway | Zuul |
|------|---------|------|
| 维护状态 | ✅ 活跃 | ❌ 已停更 |
| 编程模型 | 响应式（WebFlux） | 阻塞式（Servlet） |
| 性能 | ✅ 高 | ⚠️ 低 |
| 功能丰富度 | ✅ 强大 | ⚠️ 基础 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐ |

### 2.6 熔断降级

**核心问题**：服务调用失败/超时如何处理？如何防止雪崩？

#### Sentinel（推荐）

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

**核心功能**：
- ✅ 流量控制（QPS/并发线程数）
- ✅ 熔断降级（慢调用/异常比例）
- ✅ 热点参数限流
- ✅ 系统自适应保护
- ✅ 实时监控
- ✅ 规则持久化

**使用示例**：

```java
@RestController
public class OrderController {
    
    @GetMapping("/api/orders/{id}")
    @SentinelResource(
        value = "getOrder",
        blockHandler = "handleBlock",    // 限流降级
        fallback = "handleFallback"      // 异常降级
    )
    public Order getOrder(@PathVariable Long id) {
        return orderService.getOrder(id);
    }
    
    // 限流降级处理
    public Order handleBlock(Long id, BlockException e) {
        return new Order(); // 返回默认值
    }
    
    // 异常降级处理
    public Order handleFallback(Long id, Throwable e) {
        log.error("查询订单异常", e);
        return new Order();
    }
}
```

**控制台配置**：

```
Sentinel Dashboard（可视化界面）
    ├─ 流控规则：QPS 阈值、流控效果
    ├─ 熔断规则：慢调用比例、异常比例
    ├─ 热点规则：参数限流
    └─ 实时监控：QPS、响应时间、异常
```

#### Resilience4j

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot2</artifactId>
</dependency>
```

**核心功能**：
- CircuitBreaker（熔断器）
- RateLimiter（限流器）
- Bulkhead（隔离舱）
- Retry（重试）
- TimeLimiter（超时）

**使用示例**：

```java
@RestController
public class OrderController {
    
    @GetMapping("/api/orders/{id}")
    @CircuitBreaker(name = "orderService", fallbackMethod = "fallback")
    @RateLimiter(name = "orderService")
    @Retry(name = "orderService")
    public Order getOrder(@PathVariable Long id) {
        return orderService.getOrder(id);
    }
    
    private Order fallback(Long id, Exception e) {
        return new Order();
    }
}
```

#### Hystrix（已停更，不推荐）

**状态**：Netflix 已停止维护

**对比总结**：

| 特性 | Sentinel | Resilience4j | Hystrix |
|------|----------|--------------|---------|
| 维护状态 | ✅ 活跃 | ✅ 活跃 | ❌ 已停更 |
| 控制台 | ✅ 功能强大 | ❌ 无 | ⚠️ 基础 |
| 流控能力 | ✅ 强大 | ⚠️ 基础 | ⚠️ 基础 |
| 规则持久化 | ✅ 支持 | ⚠️ 配置文件 | ❌ 不支持 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |

### 2.7 消息驱动

**核心问题**：服务间异步通信、削峰填谷、解耦

#### Spring Cloud Stream

```xml
<!-- Kafka Binder -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-kafka</artifactId>
</dependency>

<!-- RabbitMQ Binder -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
</dependency>
```

**核心功能**：
- ✅ Binder 抽象（统一接口）
- ✅ 消息发送/消费
- ✅ 消息分区
- ✅ 消费者组
- ✅ 消息确认
- ✅ 错误处理

**架构图**：

```
应用代码
    ↓
Spring Cloud Stream（抽象层）
    ↓
Binder（适配器）
    ├─ Kafka Binder
    ├─ RabbitMQ Binder
    └─ RocketMQ Binder
    ↓
消息中间件
```

**生产者示例**：

```java
@Service
public class OrderService {
    @Autowired
    private StreamBridge streamBridge;
    
    public void createOrder(Order order) {
        // 保存订单
        orderRepository.save(order);
        
        // 发送消息
        streamBridge.send("order-created", order);
    }
}
```

**消费者示例**：

```java
@Configuration
public class OrderConsumer {
    
    @Bean
    public Consumer<Order> handleOrderCreated() {
        return order -> {
            log.info("收到订单创建消息: {}", order.getId());
            // 处理业务逻辑
            inventoryService.deductStock(order);
        };
    }
}
```

### 2.8 链路追踪

**核心问题**：请求经过多个服务，如何追踪完整调用链？

#### SkyWalking（推荐）

**核心功能**：
- ✅ 分布式链路追踪
- ✅ 服务拓扑图
- ✅ 性能指标采集
- ✅ 告警通知
- ✅ 日志关联

**架构图**：

```
微服务应用
    ↓
SkyWalking Agent（字节码增强）
    ↓
SkyWalking OAP（数据处理）
    ↓
SkyWalking UI（可视化）
```

**使用方式**：

```bash
# 1. 下载 SkyWalking Agent
# 2. 启动应用时添加 JVM 参数
java -javaagent:/path/skywalking-agent.jar \
     -Dskywalking.agent.service_name=user-service \
     -Dskywalking.collector.backend_service=localhost:11800 \
     -jar user-service.jar
```

**功能展示**：

```
拓扑图：
Gateway → User Service → Order Service → Database
  ↓
  → Cache
  → Message Queue

链路详情：
TraceId: 1a2b3c4d
├─ Span1: Gateway [200ms]
├─ Span2: User Service [150ms]
│   ├─ Span3: Redis GET [10ms]
│   └─ Span4: Order Service Call [130ms]
└─ Span5: MySQL Query [50ms]
```

#### Zipkin + Sleuth（可选）

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-zipkin</artifactId>
</dependency>
```

**对比总结**：

| 特性 | SkyWalking | Zipkin + Sleuth |
|------|------------|----------------|
| 探针方式 | Agent（无侵入） | SDK（依赖引入） |
| 功能丰富度 | ✅ 强大（监控+追踪） | ⚠️ 基础（仅追踪） |
| 性能开销 | ⚠️ 中等 | ✅ 低 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

### 2.9 分布式事务

**核心问题**：跨服务的数据一致性

#### Seata

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

**核心功能**：
- ✅ AT 模式（自动补偿）
- ✅ TCC 模式（手动补偿）
- ✅ SAGA 模式（长事务）
- ✅ XA 模式（强一致性）

**AT 模式示例**：

```java
@Service
public class OrderService {
    
    @GlobalTransactional(name = "create-order", rollbackFor = Exception.class)
    public void createOrder(OrderDTO dto) {
        // 1. 创建订单（本地事务）
        Order order = new Order();
        orderRepository.save(order);
        
        // 2. 调用库存服务扣减库存（远程事务）
        inventoryClient.deductStock(dto.getProductId(), dto.getQuantity());
        
        // 3. 调用积分服务增加积分（远程事务）
        pointsClient.addPoints(dto.getUserId(), dto.getPoints());
        
        // 如果任何一步失败，Seata 会自动回滚所有操作
    }
}
```

**工作原理**：

```
1. 开启全局事务（TM - Transaction Manager）
2. 注册分支事务（RM - Resource Manager）
3. 执行业务逻辑 + 记录 undo_log
4. 提交/回滚全局事务
5. 删除 undo_log（提交）或执行补偿（回滚）
```

---

## 3. 组件选型建议

### 3.1 核心组件推荐（2024）

| 功能 | 推荐组件 | 备选方案 | 不推荐 |
|------|---------|---------|-------|
| 服务注册与发现 | **Nacos** | Consul | Eureka |
| 配置管理 | **Nacos Config** | Apollo | Spring Cloud Config |
| 负载均衡 | **LoadBalancer** | - | Ribbon |
| 服务调用 | **OpenFeign** | RestTemplate | - |
| 服务网关 | **Gateway** | - | Zuul |
| 熔断降级 | **Sentinel** | Resilience4j | Hystrix |
| 消息驱动 | **Stream** | 原生 MQ 客户端 | - |
| 链路追踪 | **SkyWalking** | Zipkin | - |
| 分布式事务 | **Seata** | 消息事务 | - |

### 3.2 选型决策树

```
是否需要配置管理？
├─ 是 → Nacos（服务发现 + 配置管理）
└─ 否 → Consul / Eureka

是否需要强大的流控能力？
├─ 是 → Sentinel（流控 + 熔断 + 控制台）
└─ 否 → Resilience4j（轻量级）

是否需要分布式事务？
├─ 强一致性 → Seata（AT/XA 模式）
└─ 最终一致性 → 消息事务（RocketMQ/Kafka）
```

### 3.3 组件组合方案

**方案一：Spring Cloud Alibaba 全家桶**（推荐）

```
注册发现：Nacos Discovery
配置管理：Nacos Config
负载均衡：LoadBalancer
服务调用：OpenFeign
服务网关：Gateway
熔断降级：Sentinel
消息驱动：Stream + RocketMQ
链路追踪：SkyWalking
分布式事务：Seata
```

**优势**：
- ✅ 组件一致性好
- ✅ 国内社区活跃
- ✅ 文档友好
- ✅ 适配国内场景

**方案二：混合方案**

```
注册发现：Consul
配置管理：Apollo
负载均衡：LoadBalancer
服务调用：OpenFeign
服务网关：Gateway
熔断降级：Resilience4j
消息驱动：Stream + Kafka
链路追踪：Zipkin
```

---

## 4. 深入一点

### 4.1 组件之间的协作关系

**调用链路**：

```
1. 客户端请求
   ↓
2. Gateway（网关）
   ├─ 认证鉴权
   ├─ 限流（Sentinel）
   └─ 路由转发
   ↓
3. OpenFeign（服务调用）
   ├─ 从 Nacos 获取服务列表
   ├─ LoadBalancer 选择实例
   ├─ Sentinel 熔断降级
   └─ 发起 HTTP 请求
   ↓
4. Provider（服务提供者）
   ├─ 接收请求
   ├─ 执行业务逻辑
   ├─ 记录 TraceId/SpanId（SkyWalking）
   └─ 返回响应
```

**配置加载流程**：

```
1. 应用启动
   ↓
2. 读取 bootstrap.yml
   ↓
3. 连接 Nacos Config
   ↓
4. 拉取配置
   ↓
5. 注入到 Spring Environment
   ↓
6. 监听配置变更
   ↓
7. 配置变更 → 推送到应用
   ↓
8. @RefreshScope 刷新 Bean
```

### 4.2 微服务基础设施架构图

```
                   ┌─────────────────┐
                   │  Kubernetes     │
                   │  (容器编排)      │
                   └─────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Gateway    │  │    Nacos     │  │  SkyWalking  │
│   (网关)     │  │(注册+配置)   │  │  (链路追踪)  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │
        └─────────┬─────────┘
                  ↓
        ┌──────────────────────────┐
        │     微服务集群             │
        ├──────────┬───────────────┤
        │ Service A│ Service B     │
        │ (3实例)  │ (5实例)       │
        └──────────┴───────────────┘
                  │
        ┌─────────┼─────────┐
        ↓         ↓         ↓
    ┌─────┐  ┌─────┐  ┌─────┐
    │MySQL│  │Redis│  │ MQ  │
    └─────┘  └─────┘  └─────┘
```

### 4.3 组件版本兼容性

**重要提示**：组件版本不兼容是微服务项目常见问题

**版本冲突示例**：

```xml
<!-- ❌ 错误：Spring Boot 2.7 + Spring Cloud 2020.0.x 不兼容 -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>
</parent>

<spring-cloud.version>2020.0.6</spring-cloud.version> <!-- 错误 -->

<!-- ✅ 正确：Spring Boot 2.7 + Spring Cloud 2021.0.x -->
<spring-cloud.version>2021.0.5</spring-cloud.version>
```

**检查工具**：

```bash
# Maven 依赖树
mvn dependency:tree

# 查找冲突
mvn dependency:tree | grep spring-cloud
```

---

## 5. 实战案例

### 5.1 电商系统组件选型

**需求分析**：

```
业务规模：
- 日活用户：100 万
- 订单量：10 万/天
- 服务数量：20+
- 团队规模：50 人

技术要求：
- 高可用：99.9%
- 性能：接口响应 < 200ms
- 安全：支付、用户信息加密
- 监控：完善的链路追踪和告警
```

**组件选型**：

| 功能 | 选型 | 理由 |
|------|------|------|
| 注册发现 | Nacos | AP 模式，高可用 |
| 配置管理 | Nacos Config | 配置灰度发布 |
| 服务调用 | OpenFeign | 声明式，简洁 |
| 网关 | Gateway | 高性能，响应式 |
| 限流熔断 | Sentinel | 功能强大，实时监控 |
| 消息队列 | RocketMQ | 高可靠，顺序消息 |
| 链路追踪 | SkyWalking | 全链路监控 |
| 分布式事务 | Seata | 支付场景需要 |

**pom.xml 配置**：

```xml
<properties>
    <java.version>11</java.version>
    <spring-boot.version>2.7.18</spring-boot.version>
    <spring-cloud.version>2021.0.5</spring-cloud.version>
    <spring-cloud-alibaba.version>2021.0.5.0</spring-cloud-alibaba.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <version>${spring-cloud-alibaba.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 5.2 从单体到微服务的迁移

**迁移策略**：

```
阶段一：基础设施准备（1-2周）
├─ 搭建 Nacos Server
├─ 搭建 Sentinel Dashboard
├─ 搭建 SkyWalking
└─ 准备 K8s 环境

阶段二：核心服务拆分（1-2月）
├─ 用户服务（高频访问）
├─ 商品服务（数据量大）
└─ 订单服务（业务核心）

阶段三：其他服务拆分（2-3月）
├─ 库存服务
├─ 支付服务
├─ 优惠券服务
└─ 物流服务

阶段四：优化和治理（持续）
├─ 性能优化
├─ 监控告警
└─ 文档完善
```

**数据库迁移**：

```
方案一：先拆应用，再拆数据库（推荐）
单体应用 + 单体数据库
    ↓
微服务应用 + 单体数据库（读写分离）
    ↓
微服务应用 + 独立数据库

方案二：同时拆分（风险大，不推荐）
单体应用 + 单体数据库
    ↓
微服务应用 + 独立数据库
```

---

## 6. 面试要点

### 6.1 基础问题

**Q1：Spring Cloud 和 Spring Cloud Alibaba 的关系是什么？**

**回答要点**：
- Spring Cloud 是标准层，定义抽象接口
- Spring Cloud Alibaba 是实现层，提供具体组件
- 可以混合使用（如 Gateway + Nacos）
- Alibaba 组件更适合国内场景

**Q2：Nacos 和 Eureka 的区别？**

| 维度 | Nacos | Eureka |
|------|-------|--------|
| CAP | AP/CP 可切换 | AP |
| 健康检查 | TCP/HTTP | 心跳 |
| 配置管理 | 支持 | 不支持 |
| 维护状态 | 活跃 | 维护中 |

**Q3：为什么 Ribbon、Hystrix、Zuul 不推荐使用？**

**回答要点**：
- Netflix 已停止维护（2018年）
- 有更好的替代方案
  - Ribbon → LoadBalancer
  - Hystrix → Sentinel/Resilience4j
  - Zuul → Gateway
- 新项目不要使用过时技术

### 6.2 进阶问题

**Q4：OpenFeign 的工作原理是什么？**

**回答要点**：
1. 启动时扫描 @FeignClient 注解
2. 生成动态代理对象（JDK Proxy）
3. 拦截方法调用
4. 根据注解构建 HTTP 请求
5. 集成 LoadBalancer 选择实例
6. 发起 HTTP 调用
7. 解析响应返回结果

**加分项**：
- 提到编解码器（Encoder/Decoder）
- 提到契约（Contract）
- 提到拦截器（RequestInterceptor）

**Q5：Gateway 为什么性能比 Zuul 好？**

**回答要点**：
- Gateway 基于 WebFlux（响应式）
- Zuul 基于 Servlet（阻塞式）
- 响应式非阻塞 I/O，吞吐量高
- 适合高并发场景

**Q6：如何选择 Sentinel 还是 Resilience4j？**

| 场景 | 推荐组件 | 理由 |
|------|---------|------|
| 需要实时监控 | Sentinel | 控制台强大 |
| 轻量级项目 | Resilience4j | 无需额外部署 |
| 复杂流控规则 | Sentinel | 功能丰富 |
| Spring Boot 原生 | Resilience4j | 集成简单 |

### 6.3 架构问题

**Q7：如何设计一个微服务的技术选型方案？**

**回答思路**：
1. **需求分析**
   - 业务规模（用户量、数据量）
   - 团队规模和技术栈
   - 性能要求
   - 成本预算

2. **组件选型**
   - 核心组件：注册发现、配置、网关
   - 治理组件：限流、熔断、监控
   - 数据组件：数据库、缓存、消息队列

3. **架构设计**
   - 服务拆分粒度
   - 通信方式（同步/异步）
   - 数据一致性方案

4. **运维方案**
   - 容器化（Docker）
   - 编排（Kubernetes）
   - CI/CD 流程

**Q8：微服务架构的核心挑战有哪些？如何应对？**

| 挑战 | 应对方案 |
|------|---------|
| 分布式事务 | Seata、消息事务 |
| 链路追踪 | SkyWalking、Zipkin |
| 配置管理 | Nacos Config |
| 服务治理 | Sentinel 限流熔断 |
| 运维复杂 | Kubernetes、自动化运维 |

---

## 7. 参考资料

**官方文档**：
- [Spring Cloud 官方文档](https://spring.io/projects/spring-cloud)
- [Spring Cloud Alibaba 官方文档](https://spring-cloud-alibaba-group.github.io/)
- [Nacos 官方文档](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Sentinel 官方文档](https://sentinelguard.io/zh-cn/)

**版本对应关系**：
- [Spring Cloud 版本说明](https://github.com/spring-cloud/spring-cloud-release/wiki/Supported-Versions)
- [Spring Cloud Alibaba 版本说明](https://github.com/alibaba/spring-cloud-alibaba/wiki/%E7%89%88%E6%9C%AC%E8%AF%B4%E6%98%8E)

**开源项目**：
- [Spring Cloud 官方示例](https://github.com/spring-cloud-samples)
- [Spring Cloud Alibaba 示例](https://github.com/alibaba/spring-cloud-alibaba/tree/2021.x/spring-cloud-alibaba-examples)

**技术博客**：
- [阿里云开发者社区 - 微服务](https://developer.aliyun.com/topic/microservices)
- [Spring Cloud 中文社区](http://springcloud.cn/)

---

**下一章预告**：第 3 章将手把手带你搭建一个完整的 Spring Cloud 微服务项目，包括多模块 Maven 结构设计、依赖版本管理、环境配置等实战内容。

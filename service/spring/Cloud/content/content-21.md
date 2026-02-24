# 第21章：Spring Cloud Gateway 快速入门

> **本章目标**：掌握 Spring Cloud Gateway 的基本使用，理解 Gateway 的工作原理，能够快速搭建 API 网关

---

## 1. Gateway 简介

### 1.1 什么是 API 网关

**定位**：API 网关是微服务架构的统一入口，负责请求路由、协议转换、安全认证、限流熔断等。

**架构**：
```
客户端 → API Gateway → 微服务集群
         ↓
         路由、鉴权、限流、日志、监控
```

**为什么需要网关？**

**没有网关的问题**：
```
移动端 → user-service (192.168.1.100:8001)
      → order-service (192.168.1.101:8002)
      → product-service (192.168.1.102:8003)

问题：
1. 客户端需要维护多个服务地址
2. 跨域问题（CORS）
3. 认证授权需要在每个服务中实现
4. 无法统一限流、监控
5. 协议转换困难
```

**有网关的优势**：
```
移动端 → API Gateway (gateway.demo.com) → user-service
                                        → order-service
                                        → product-service

优势：
✅ 统一入口
✅ 统一认证授权
✅ 统一限流熔断
✅ 统一日志监控
✅ 协议转换
✅ 动态路由
```

---

### 1.2 Spring Cloud Gateway vs Zuul

| 维度 | Spring Cloud Gateway | Netflix Zuul |
|------|---------------------|--------------|
| **技术栈** | Spring WebFlux（响应式） | Spring MVC（阻塞式） |
| **性能** | 高（异步非阻塞） | 中（同步阻塞） |
| **维护** | Spring 官方维护 | Netflix 停止维护 |
| **功能** | 丰富（断言、过滤器） | 基础 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**推荐**：新项目使用 Spring Cloud Gateway。

---

## 2. 快速入门

### 2.1 搭建 Gateway

**创建 Maven 项目**：
```xml
<project>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.8</version>
    </parent>
    
    <dependencies>
        <!-- Spring Cloud Gateway -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>

        <!-- Nacos Discovery -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
    </dependencies>
</project>
```

**启动类**：
```java
package com.demo.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

**application.yml**：
```yaml
server:
  port: 8000  # 网关端口

spring:
  application:
    name: api-gateway
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
    
    gateway:
      routes:
        # 用户服务路由
        - id: user-service-route
          uri: lb://user-service  # lb = LoadBalancer
          predicates:
            - Path=/user/**  # 路径断言
        
        # 订单服务路由
        - id: order-service-route
          uri: lb://order-service
          predicates:
            - Path=/order/**
```

**测试**：
```bash
# 启动 Gateway
java -jar gateway.jar

# 通过网关访问用户服务
curl http://localhost:8000/user/1

# 等价于直接访问
curl http://localhost:8001/user/1
```

---

### 2.2 核心概念

**Route（路由）**：
- Gateway 的基本单元
- 由 ID、目标 URI、断言集合、过滤器集合组成

**Predicate（断言）**：
- 路由匹配条件
- 例如：路径匹配、请求头匹配、时间匹配

**Filter（过滤器）**：
- 对请求/响应进行修改
- 例如：添加请求头、限流、熔断

**工作流程**：
```
1. 客户端请求到达 Gateway
    ↓
2. Gateway Handler Mapping 匹配路由（Predicate）
    ↓
3. 匹配成功，执行 Filter Chain
    ↓
4. Pre Filter（前置过滤器）
    ↓
5. 转发请求到目标服务
    ↓
6. Post Filter（后置过滤器）
    ↓
7. 返回响应给客户端
```

---

## 3. 路由配置

### 3.1 基于配置文件的路由

**简单路由**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-route  # 路由 ID（唯一）
          uri: http://localhost:8001  # 目标服务地址
          predicates:
            - Path=/user/**  # 路径匹配
```

**多个断言**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-route
          uri: lb://user-service
          predicates:
            - Path=/user/**
            - Method=GET,POST  # 只允许 GET、POST 请求
            - Header=X-Request-Id, \d+  # 请求头 X-Request-Id 必须是数字
```

**负载均衡**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-route
          uri: lb://user-service  # lb = LoadBalancer，从 Nacos 获取实例
          predicates:
            - Path=/user/**
```

---

### 3.2 基于代码的路由

**Java 配置**：
```java
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // 用户服务路由
            .route("user-route", r -> r
                .path("/user/**")
                .uri("lb://user-service"))
            
            // 订单服务路由
            .route("order-route", r -> r
                .path("/order/**")
                .and()
                .method(HttpMethod.GET, HttpMethod.POST)
                .uri("lb://order-service"))
            
            // 带过滤器的路由
            .route("product-route", r -> r
                .path("/product/**")
                .filters(f -> f
                    .addRequestHeader("X-Gateway", "Spring Cloud Gateway")
                    .addResponseHeader("X-Response-Time", String.valueOf(System.currentTimeMillis())))
                .uri("lb://product-service"))
            
            .build();
    }
}
```

---

### 3.3 动态路由

**基于 Nacos 配置中心**：
```yaml
# Nacos 配置
spring:
  cloud:
    gateway:
      routes:
        - id: user-route
          uri: lb://user-service
          predicates:
            - Path=/user/**
```

**开启动态刷新**：
```java
@Component
@RefreshScope
public class DynamicRouteConfig {
    
    @Autowired
    private RouteDefinitionWriter routeDefinitionWriter;
    
    @Autowired
    private ApplicationEventPublisher publisher;
    
    public void refreshRoutes(List<RouteDefinition> routes) {
        // 清空现有路由
        // ...
        
        // 添加新路由
        for (RouteDefinition route : routes) {
            routeDefinitionWriter.save(Mono.just(route)).subscribe();
        }
        
        // 发布路由刷新事件
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }
}
```

---

## 4. 断言（Predicate）

### 4.1 内置断言

**Path 路径断言**：
```yaml
predicates:
  - Path=/user/**  # 匹配 /user/1、/user/list 等
  - Path=/user/{id}  # 路径变量
```

**Method 请求方法断言**：
```yaml
predicates:
  - Method=GET,POST  # 只允许 GET、POST 请求
```

**Header 请求头断言**：
```yaml
predicates:
  - Header=X-Request-Id, \d+  # 请求头必须包含 X-Request-Id，且值为数字
```

**Query 查询参数断言**：
```yaml
predicates:
  - Query=token  # 必须有 token 参数
  - Query=name, zhangsan  # name 参数值必须是 zhangsan
```

**Cookie 断言**：
```yaml
predicates:
  - Cookie=session, \w+  # 必须有 session Cookie
```

**Host 主机断言**：
```yaml
predicates:
  - Host=**.demo.com  # 匹配 www.demo.com、api.demo.com 等
```

**RemoteAddr IP 地址断言**：
```yaml
predicates:
  - RemoteAddr=192.168.1.0/24  # 只允许 192.168.1.* 网段访问
```

**Weight 权重断言**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-v1
          uri: lb://user-service-v1
          predicates:
            - Path=/user/**
            - Weight=group1, 8  # 80% 流量
        
        - id: user-v2
          uri: lb://user-service-v2
          predicates:
            - Path=/user/**
            - Weight=group1, 2  # 20% 流量
```

**时间断言**：
```yaml
predicates:
  # 在指定时间之后
  - After=2023-01-01T00:00:00+08:00[Asia/Shanghai]
  
  # 在指定时间之前
  - Before=2023-12-31T23:59:59+08:00[Asia/Shanghai]
  
  # 在指定时间段内
  - Between=2023-01-01T00:00:00+08:00[Asia/Shanghai], 2023-12-31T23:59:59+08:00[Asia/Shanghai]
```

---

### 4.2 自定义断言

**场景**：根据用户等级路由到不同服务。

**实现**：
```java
@Component
public class UserLevelRoutePredicateFactory 
        extends AbstractRoutePredicateFactory<UserLevelRoutePredicateFactory.Config> {
    
    public UserLevelRoutePredicateFactory() {
        super(Config.class);
    }
    
    @Override
    public Predicate<ServerWebExchange> apply(Config config) {
        return exchange -> {
            // 从请求头获取用户等级
            String userLevel = exchange.getRequest()
                .getHeaders()
                .getFirst("X-User-Level");
            
            // 判断是否匹配
            return config.getLevel().equals(userLevel);
        };
    }
    
    @Data
    public static class Config {
        private String level;
    }
}
```

**配置**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: vip-route
          uri: lb://vip-service
          predicates:
            - UserLevel=VIP  # 自定义断言
```

---

## 5. 过滤器（Filter）

### 5.1 内置过滤器

**AddRequestHeader 添加请求头**：
```yaml
filters:
  - AddRequestHeader=X-Request-Id, 123456
```

**AddRequestParameter 添加请求参数**：
```yaml
filters:
  - AddRequestParameter=source, gateway
```

**AddResponseHeader 添加响应头**：
```yaml
filters:
  - AddResponseHeader=X-Response-Time, 100ms
```

**StripPrefix 去除路径前缀**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-route
          uri: lb://user-service
          predicates:
            - Path=/api/user/**
          filters:
            - StripPrefix=1  # 去除第一层路径 /api

# 请求：/api/user/1
# 转发到：user-service/user/1
```

**PrefixPath 添加路径前缀**：
```yaml
filters:
  - PrefixPath=/api/v1

# 请求：/user/1
# 转发到：user-service/api/v1/user/1
```

**RewritePath 重写路径**：
```yaml
filters:
  - RewritePath=/api/(?<segment>.*), /$\{segment}

# 请求：/api/user/1
# 转发到：user-service/user/1
```

**SetStatus 设置响应状态码**：
```yaml
filters:
  - SetStatus=200
```

**Retry 重试**：
```yaml
filters:
  - name: Retry
    args:
      retries: 3  # 重试次数
      statuses: BAD_GATEWAY, SERVICE_UNAVAILABLE  # 重试的状态码
      methods: GET, POST  # 重试的请求方法
      backoff:
        firstBackoff: 10ms  # 第一次重试间隔
        maxBackoff: 50ms  # 最大重试间隔
        factor: 2  # 间隔倍数
        basedOnPreviousValue: false
```

**RequestRateLimiter 限流**：
```yaml
filters:
  - name: RequestRateLimiter
    args:
      redis-rate-limiter.replenishRate: 10  # 每秒允许的请求数
      redis-rate-limiter.burstCapacity: 20  # 令牌桶容量
      key-resolver: "#{@ipKeyResolver}"  # 限流 Key 解析器
```

---

### 5.2 自定义过滤器

**场景**：记录请求耗时。

**实现**：
```java
@Component
public class TimeGatewayFilterFactory 
        extends AbstractGatewayFilterFactory<TimeGatewayFilterFactory.Config> {
    
    private static final Logger log = LoggerFactory.getLogger(TimeGatewayFilterFactory.class);
    
    public TimeGatewayFilterFactory() {
        super(Config.class);
    }
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // 记录开始时间
            exchange.getAttributes().put("start_time", System.currentTimeMillis());
            
            return chain.filter(exchange).then(
                Mono.fromRunnable(() -> {
                    // 计算耗时
                    Long startTime = exchange.getAttribute("start_time");
                    if (startTime != null) {
                        long duration = System.currentTimeMillis() - startTime;
                        
                        String path = exchange.getRequest().getURI().getPath();
                        log.info("Request to {} took {}ms", path, duration);
                        
                        // 添加响应头
                        if (config.isAddHeader()) {
                            exchange.getResponse().getHeaders()
                                .add("X-Response-Time", duration + "ms");
                        }
                    }
                })
            );
        };
    }
    
    @Data
    public static class Config {
        private boolean addHeader = true;
    }
}
```

**配置**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-route
          uri: lb://user-service
          predicates:
            - Path=/user/**
          filters:
            - name: Time
              args:
                addHeader: true
```

---

## 6. 全局过滤器

### 6.1 GlobalFilter 接口

**实现**：
```java
@Component
@Order(-1)  # 优先级（值越小越优先）
public class AuthGlobalFilter implements GlobalFilter {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 获取请求头
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        
        // 验证 Token
        if (token == null || !isValidToken(token)) {
            // 返回 401 未授权
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        
        // 放行
        return chain.filter(exchange);
    }
    
    private boolean isValidToken(String token) {
        // 验证 Token 逻辑
        return true;
    }
}
```

---

### 6.2 常见全局过滤器

**日志过滤器**：
```java
@Component
@Order(0)
public class LogGlobalFilter implements GlobalFilter {
    
    private static final Logger log = LoggerFactory.getLogger(LogGlobalFilter.class);
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethodValue();
        
        log.info("Request: {} {}", method, path);
        
        return chain.filter(exchange);
    }
}
```

**跨域过滤器**（配置方式更简单）：
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
            allowedHeaders: "*"
            allowCredentials: true
```

---

## 7. Gateway 工作原理

### 7.1 核心流程

**完整流程**：
```
1. 客户端请求到达 Gateway
    ↓
2. Gateway Handler Mapping 匹配路由
    ↓
3. 匹配成功，获取 Route
    ↓
4. Gateway Web Handler 执行过滤器链
    ↓
5. GlobalFilter 全局过滤器（Pre）
    ↓
6. GatewayFilter 路由过滤器（Pre）
    ↓
7. NettyRoutingFilter 转发请求
    ↓
8. 目标服务处理请求
    ↓
9. GatewayFilter 路由过滤器（Post）
    ↓
10. GlobalFilter 全局过滤器（Post）
    ↓
11. 返回响应给客户端
```

---

### 7.2 核心组件

**RoutePredicateHandlerMapping**：
- 路由匹配
- 根据断言选择路由

**FilteringWebHandler**：
- 执行过滤器链
- 按顺序执行 GlobalFilter 和 GatewayFilter

**NettyRoutingFilter**：
- 使用 Netty HTTP Client 转发请求
- 异步非阻塞

**LoadBalancerClientFilter**：
- 负载均衡
- 从服务注册中心获取实例

---

## 8. 实际落地场景

### 8.1 场景1：统一鉴权

**实现**：
```java
@Component
@Order(-100)
public class AuthGlobalFilter implements GlobalFilter {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // 白名单
    private static final List<String> WHITE_LIST = Arrays.asList(
        "/user/login",
        "/user/register"
    );
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        
        // 白名单放行
        if (WHITE_LIST.contains(path)) {
            return chain.filter(exchange);
        }
        
        // 获取 Token
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        
        if (token == null || !token.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }
        
        // 验证 Token
        String actualToken = token.substring(7);
        String userId = redisTemplate.opsForValue().get("token:" + actualToken);
        
        if (userId == null) {
            return unauthorized(exchange);
        }
        
        // 将用户 ID 传递给下游服务
        ServerHttpRequest request = exchange.getRequest().mutate()
            .header("X-User-Id", userId)
            .build();
        
        return chain.filter(exchange.mutate().request(request).build());
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}
```

---

### 8.2 场景2：灰度发布

**配置**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        # 灰度版本（10% 流量）
        - id: user-gray
          uri: lb://user-service-gray
          predicates:
            - Path=/user/**
            - Weight=user-group, 1
        
        # 正式版本（90% 流量）
        - id: user-stable
          uri: lb://user-service
          predicates:
            - Path=/user/**
            - Weight=user-group, 9
```

---

### 8.3 场景3：API 限流

**配置 Redis**：
```yaml
spring:
  redis:
    host: localhost
    port: 6379
```

**限流配置**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-route
          uri: lb://user-service
          predicates:
            - Path=/user/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10  # 每秒10个请求
                redis-rate-limiter.burstCapacity: 20  # 令牌桶容量20
                key-resolver: "#{@ipKeyResolver}"
```

**Key 解析器**：
```java
@Bean
public KeyResolver ipKeyResolver() {
    return exchange -> Mono.just(
        exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
    );
}
```

---

## 9. 学习自检清单

- [ ] 理解 API 网关的作用
- [ ] 掌握 Gateway 的快速搭建
- [ ] 理解路由、断言、过滤器三大核心概念
- [ ] 掌握路由配置（配置文件、代码）
- [ ] 掌握内置断言的使用
- [ ] 掌握内置过滤器的使用
- [ ] 能够实现自定义过滤器
- [ ] 能够实现全局过滤器
- [ ] 理解 Gateway 的工作原理
- [ ] 能够实现统一鉴权、灰度发布、限流等场景

**学习建议**：
- **预计学习时长**：3-4 小时
- **重点难点**：工作原理、自定义过滤器、全局过滤器
- **前置知识**：第16-20章 OpenFeign
- **实践建议**：搭建 Gateway，实现统一鉴权和限流

---

**本章小结**：
- Gateway 是微服务架构的统一入口，提供路由、鉴权、限流等功能
- 三大核心概念：Route（路由）、Predicate（断言）、Filter（过滤器）
- 路由配置：配置文件（YAML）、代码配置（RouteLocator）
- 内置断言：Path、Method、Header、Query、Cookie、Host、RemoteAddr、Weight、时间
- 内置过滤器：AddRequestHeader、StripPrefix、RewritePath、Retry、RequestRateLimiter
- 自定义过滤器：继承 AbstractGatewayFilterFactory
- 全局过滤器：实现 GlobalFilter 接口
- 工作原理：RoutePredicateHandlerMapping → FilteringWebHandler → NettyRoutingFilter
- 实际场景：统一鉴权、灰度发布、API 限流

**下一章预告**：第22章将深入介绍 Gateway 路由配置与断言，包括路由优先级、动态路由、所有内置断言的详细用法、自定义断言开发。

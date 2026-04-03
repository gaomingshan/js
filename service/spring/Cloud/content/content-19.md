# 第 19 章：Gateway 快速入门

> **学习目标**：掌握 Gateway 快速接入、理解网关在微服务中的作用、能够配置基础路由规则  
> **预计时长**：2-3 小时  
> **难度级别**：⭐⭐⭐ 中等

---

## 1. Gateway 依赖引入

### 1.1 添加依赖

```xml
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
    
    <!-- LoadBalancer -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
</dependencies>
```

**⚠️ 注意事项**：

```xml
<!-- ❌ Gateway 不能和 spring-boot-starter-web 一起使用 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- ✅ Gateway 基于 WebFlux -->
```

### 1.2 启动类

```java
@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

---

## 2. 网关架构设计

### 2.1 网关的作用

```
客户端 → Gateway网关 → 微服务
         ↓
    统一入口处理：
    - 路由转发
    - 负载均衡
    - 认证鉴权
    - 限流熔断
    - 日志监控
    - 协议转换
```

### 2.2 Gateway vs Zuul

| 特性 | Gateway | Zuul 1.x | Zuul 2.x |
|------|---------|----------|----------|
| 基础框架 | WebFlux (Netty) | Servlet (Tomcat) | Netty |
| 编程模型 | 响应式 | 阻塞式 | 响应式 |
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Spring 集成 | ✅ 原生支持 | ⚠️ 需额外配置 | ⚠️ Netflix停止维护 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

### 2.3 Gateway 核心组件

```
Gateway 三大核心：
1. Route（路由）：路由信息，包含目标URI、断言、过滤器
2. Predicate（断言）：匹配请求的条件
3. Filter（过滤器）：请求和响应的处理
```

---

## 3. 路由配置基础（uri/predicates/filters）

### 3.1 配置文件方式

**application.yml**：

```yaml
spring:
  application:
    name: gateway
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
    
    gateway:
      routes:
        # 路由1：用户服务
        - id: user-service-route          # 路由ID（唯一）
          uri: lb://user-service            # 目标URI（lb=负载均衡）
          predicates:                       # 断言（匹配条件）
            - Path=/api/users/**            # 路径匹配
          filters:                          # 过滤器
            - StripPrefix=1                 # 去除前缀
        
        # 路由2：订单服务
        - id: order-service-route
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
        
        # 路由3：直接转发到固定地址
        - id: external-api-route
          uri: https://api.example.com
          predicates:
            - Path=/external/**
          filters:
            - StripPrefix=1

server:
  port: 8080
```

**路由配置说明**：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| **id** | 路由唯一标识 | user-service-route |
| **uri** | 目标地址 | lb://user-service 或 http://localhost:8081 |
| **predicates** | 匹配条件（数组） | - Path=/api/users/** |
| **filters** | 过滤器（数组） | - StripPrefix=1 |

### 3.2 代码方式配置

```java
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // 路由1：用户服务
            .route("user-service-route", r -> r
                .path("/api/users/**")
                .filters(f -> f.stripPrefix(1))
                .uri("lb://user-service")
            )
            // 路由2：订单服务
            .route("order-service-route", r -> r
                .path("/api/orders/**")
                .filters(f -> f.stripPrefix(1))
                .uri("lb://order-service")
            )
            // 路由3：组合断言
            .route("complex-route", r -> r
                .path("/api/products/**")
                .and()
                .method(HttpMethod.GET)
                .filters(f -> f
                    .stripPrefix(1)
                    .addRequestHeader("X-Request-From", "Gateway")
                )
                .uri("lb://product-service")
            )
            .build();
    }
}
```

### 3.3 uri 配置详解

**lb:// 负载均衡**：

```yaml
uri: lb://user-service  # 从Nacos获取user-service实例，负载均衡
```

**http:// 固定地址**：

```yaml
uri: http://localhost:8081  # 直接转发到指定地址
```

**ws:// WebSocket**：

```yaml
uri: ws://localhost:8081  # WebSocket协议
```

**forward:// 本地转发**：

```yaml
uri: forward:/fallback  # 转发到Gateway本地接口
```

---

## 4. 路由转发验证

### 4.1 创建下游服务

**用户服务（user-service）**：

```java
@RestController
@RequestMapping("/users")
public class UserController {
    
    @GetMapping("/{id}")
    public Result<User> getUser(@PathVariable Long id) {
        User user = new User();
        user.setId(id);
        user.setUsername("用户" + id);
        return Result.success(user);
    }
    
    @GetMapping
    public Result<List<User>> listUsers() {
        List<User> users = Arrays.asList(
            new User(1L, "张三"),
            new User(2L, "李四")
        );
        return Result.success(users);
    }
}
```

**application.yml（user-service）**：

```yaml
spring:
  application:
    name: user-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848

server:
  port: 8081
```

### 4.2 测试路由转发

**启动服务**：

```bash
# 1. 启动Nacos
sh bin/startup.sh -m standalone

# 2. 启动用户服务
java -jar user-service.jar --server.port=8081
java -jar user-service.jar --server.port=8082  # 启动第二个实例

# 3. 启动Gateway
java -jar gateway.jar
```

**测试请求**：

```bash
# 直接调用用户服务
curl http://localhost:8081/users/1
# 返回：{"code":200,"data":{"id":1,"username":"用户1"}}

# 通过Gateway调用
curl http://localhost:8080/api/users/1
# Gateway处理流程：
# 1. 匹配路由：Path=/api/users/**
# 2. 应用过滤器：StripPrefix=1（去除/api）
# 3. 负载均衡：选择user-service实例
# 4. 转发请求：http://localhost:8081/users/1
# 返回：{"code":200,"data":{"id":1,"username":"用户1"}}
```

### 4.3 验证负载均衡

**多次请求**：

```bash
# 请求10次，观察负载均衡
for i in {1..10}; do
  curl http://localhost:8080/api/users/1
done

# Gateway日志显示：
# 请求1 → 8081
# 请求2 → 8082
# 请求3 → 8081
# 请求4 → 8082
# ...（轮询）
```

---

## 5. WebFlux 响应式编程基础

### 5.1 传统 Servlet vs WebFlux

**Servlet（阻塞式）**：

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    // 阻塞等待数据库查询
    User user = userRepository.findById(id);
    return user;
}

// 每个请求占用一个线程
// 线程池大小：200
// 最大并发：200
```

**WebFlux（响应式）**：

```java
@GetMapping("/users/{id}")
public Mono<User> getUser(@PathVariable Long id) {
    // 非阻塞查询
    return userRepository.findById(id);
}

// 少量线程处理大量请求
// 线程池大小：CPU核心数 * 2
// 最大并发：数万
```

### 5.2 Mono 和 Flux

**Mono（0或1个元素）**：

```java
// 查询单个用户
Mono<User> userMono = webClient.get()
    .uri("/users/1")
    .retrieve()
    .bodyToMono(User.class);

// 订阅（获取结果）
userMono.subscribe(user -> {
    System.out.println("用户名：" + user.getUsername());
});
```

**Flux（0到N个元素）**：

```java
// 查询用户列表
Flux<User> userFlux = webClient.get()
    .uri("/users")
    .retrieve()
    .bodyToFlux(User.class);

// 订阅（流式处理）
userFlux.subscribe(user -> {
    System.out.println("用户名：" + user.getUsername());
});
```

### 5.3 Gateway 中的响应式

**自定义 GlobalFilter**：

```java
@Component
public class LoggingFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        log.info("请求路径：{}", request.getPath());
        log.info("请求方法：{}", request.getMethod());
        
        long startTime = System.currentTimeMillis();
        
        // 继续执行过滤器链（非阻塞）
        return chain.filter(exchange)
            .then(Mono.fromRunnable(() -> {
                long duration = System.currentTimeMillis() - startTime;
                log.info("请求耗时：{}ms", duration);
            }));
    }
    
    @Override
    public int getOrder() {
        return -1;  // 优先级最高
    }
}
```

---

## 6. 实战案例

### 6.1 完整网关配置

**application.yml**：

```yaml
spring:
  application:
    name: gateway
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: prod
    
    gateway:
      # 全局CORS配置
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
            allowCredentials: true
      
      # 路由配置
      routes:
        # 用户服务
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
        
        # 订单服务
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
        
        # 产品服务
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
          filters:
            - StripPrefix=1
      
      # 默认过滤器（应用到所有路由）
      default-filters:
        - AddRequestHeader=X-Request-From, Gateway
        - AddResponseHeader=X-Response-From, Gateway

server:
  port: 8080

# 日志配置
logging:
  level:
    org.springframework.cloud.gateway: DEBUG
```

### 6.2 动态路由

**RouteDefinitionRepository 实现**：

```java
@Component
public class NacosRouteDefinitionRepository implements RouteDefinitionRepository {
    
    @Autowired
    private ConfigService configService;
    
    @Override
    public Flux<RouteDefinition> getRouteDefinitions() {
        try {
            // 从Nacos读取路由配置
            String config = configService.getConfig(
                "gateway-routes.json", 
                "DEFAULT_GROUP", 
                5000
            );
            
            List<RouteDefinition> routes = parseRoutes(config);
            return Flux.fromIterable(routes);
            
        } catch (Exception e) {
            return Flux.empty();
        }
    }
    
    @Override
    public Mono<Void> save(Mono<RouteDefinition> route) {
        // 保存路由到Nacos
        return route.flatMap(r -> {
            // 实现保存逻辑
            return Mono.empty();
        });
    }
    
    @Override
    public Mono<Void> delete(Mono<String> routeId) {
        // 删除路由
        return routeId.flatMap(id -> {
            // 实现删除逻辑
            return Mono.empty();
        });
    }
}
```

---

## 7. 常见问题

### 7.1 Gateway 与 Web 冲突

**错误信息**：

```
Spring MVC found on classpath, which is incompatible with Spring Cloud Gateway
```

**解决方案**：

```xml
<!-- 移除 spring-boot-starter-web -->
<!-- 只保留 spring-cloud-starter-gateway -->
```

### 7.2 路由404

**排查步骤**：

```bash
# 1. 检查路由配置
curl http://localhost:8080/actuator/gateway/routes

# 2. 检查服务注册
curl http://localhost:8848/nacos/v1/ns/instance/list?serviceName=user-service

# 3. 启用DEBUG日志
logging:
  level:
    org.springframework.cloud.gateway: DEBUG
```

---

## 8. 面试要点

**Q1：Gateway 的核心组件有哪些？**

1. Route（路由）：路由信息
2. Predicate（断言）：匹配条件
3. Filter（过滤器）：请求/响应处理

**Q2：Gateway 和 Zuul 的区别？**

- Gateway：基于 WebFlux（Netty），响应式，高性能
- Zuul：基于 Servlet（Tomcat），阻塞式，性能较低

**Q3：什么是响应式编程？**

- 非阻塞I/O
- 少量线程处理大量请求
- Mono（0或1个元素）、Flux（0到N个元素）

---

**下一章预告**：第 20 章将深入学习路由配置与 Predicate 断言，包括 11 种内置 Predicate 详解、Predicate 组合使用、动态路由配置等内容。

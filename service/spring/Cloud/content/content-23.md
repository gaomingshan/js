# 第 23 章：Gateway 原理深入与性能优化

> **学习目标**：理解 Gateway 核心原理、掌握 Gateway 性能优化、能够排查 Gateway 常见问题  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. Gateway 启动流程

### 1.1 自动配置加载

**GatewayAutoConfiguration**：

```java
@Configuration
@ConditionalOnProperty(name = "spring.cloud.gateway.enabled", matchIfMissing = true)
@EnableConfigurationProperties
@AutoConfigureBefore({HttpHandlerAutoConfiguration.class, WebFluxAutoConfiguration.class})
@AutoConfigureAfter({GatewayLoadBalancerClientAutoConfiguration.class, 
                     GatewayClassPathWarningAutoConfiguration.class})
public class GatewayAutoConfiguration {
    
    // 1. 注册 RouteLocator
    @Bean
    public RouteLocatorBuilder routeLocatorBuilder(
            ConfigurableApplicationContext context) {
        return new RouteLocatorBuilder(context);
    }
    
    // 2. 注册 RouteDefinitionLocator
    @Bean
    @Primary
    public RouteDefinitionLocator routeDefinitionLocator(
            List<RouteDefinitionLocator> routeDefinitionLocators) {
        return new CompositeRouteDefinitionLocator(
            Flux.fromIterable(routeDefinitionLocators));
    }
    
    // 3. 注册 RouteLocator
    @Bean
    @Primary
    public RouteLocator routeLocator(
            List<RouteLocator> routeLocators) {
        return new CompositeRouteLocator(
            Flux.fromIterable(routeLocators));
    }
    
    // 4. 注册 FilteringWebHandler
    @Bean
    public FilteringWebHandler filteringWebHandler(
            List<GlobalFilter> globalFilters) {
        return new FilteringWebHandler(globalFilters);
    }
    
    // 5. 注册 RoutePredicateHandlerMapping
    @Bean
    public RoutePredicateHandlerMapping routePredicateHandlerMapping(
            FilteringWebHandler webHandler,
            RouteLocator routeLocator,
            GlobalCorsProperties globalCorsProperties,
            Environment environment) {
        return new RoutePredicateHandlerMapping(
            webHandler, routeLocator, globalCorsProperties, environment);
    }
}
```

### 1.2 启动流程图

```
Spring Boot 启动
    ↓
加载 GatewayAutoConfiguration
    ↓
注册核心 Bean
    ├─ RouteLocator（路由定位器）
    ├─ RoutePredicateHandlerMapping（路由映射处理器）
    ├─ FilteringWebHandler（过滤器处理器）
    └─ GlobalFilter（全局过滤器）
    ↓
Netty 启动（WebFlux）
    ↓
Gateway 就绪
```

### 1.3 路由加载流程

```java
public class RouteDefinitionRouteLocator implements RouteLocator {
    
    @Override
    public Flux<Route> getRoutes() {
        // 1. 获取所有路由定义
        return this.routeDefinitionLocator.getRouteDefinitions()
            // 2. 转换为路由对象
            .map(this::convertToRoute)
            // 3. 过滤无效路由
            .filter(Objects::nonNull)
            // 4. 排序
            .map(route -> {
                if (route.getOrder() != 0) {
                    return route;
                }
                return new Route(route, 0);
            })
            .sort(AnnotationAwareOrderComparator.INSTANCE);
    }
    
    private Route convertToRoute(RouteDefinition routeDefinition) {
        // 1. 构建 Predicate
        AsyncPredicate<ServerWebExchange> predicate = combinePredicates(routeDefinition);
        
        // 2. 构建 GatewayFilter
        List<GatewayFilter> gatewayFilters = getFilters(routeDefinition);
        
        // 3. 构建 Route
        return Route.async(routeDefinition)
            .asyncPredicate(predicate)
            .replaceFilters(gatewayFilters)
            .build();
    }
}
```

---

## 2. RouteLocator 路由定位

### 2.1 RouteLocator 接口

```java
public interface RouteLocator {
    /**
     * 获取所有路由
     */
    Flux<Route> getRoutes();
}
```

### 2.2 路由定位流程

**RoutePredicateHandlerMapping.getHandlerInternal()**：

```java
@Override
protected Mono<?> getHandlerInternal(ServerWebExchange exchange) {
    // 1. 设置网关属性
    exchange.getAttributes().put(GATEWAY_HANDLER_MAPPER_ATTR, getSimpleName());
    
    // 2. 查找匹配的路由
    return lookupRoute(exchange)
        // 3. 找到路由，返回 FilteringWebHandler
        .flatMap(route -> {
            exchange.getAttributes().put(GATEWAY_ROUTE_ATTR, route);
            return Mono.just(webHandler);
        })
        // 4. 未找到路由，返回空
        .switchIfEmpty(Mono.empty());
}

protected Mono<Route> lookupRoute(ServerWebExchange exchange) {
    // 获取所有路由并逐个匹配
    return this.routeLocator.getRoutes()
        // 过滤：Predicate 匹配
        .concatMap(route -> Mono.just(route)
            .filterWhen(r -> r.getPredicate().apply(exchange))
            .doOnError(e -> logger.error("Error applying predicate for route: " + route.getId(), e))
            .onErrorResume(e -> Mono.empty())
        )
        // 获取第一个匹配的路由
        .next()
        // 日志记录
        .doOnNext(route -> {
            if (logger.isDebugEnabled()) {
                logger.debug("Route matched: " + route.getId());
            }
        });
}
```

**路由匹配流程**：

```
请求到达
    ↓
RoutePredicateHandlerMapping.getHandlerInternal()
    ↓
lookupRoute() 查找路由
    ├─ 获取所有路由（routeLocator.getRoutes()）
    ├─ 遍历路由
    ├─ 应用 Predicate 断言
    ├─ 找到第一个匹配的路由
    └─ 未找到返回 404
    ↓
返回 FilteringWebHandler
```

### 2.3 路由缓存

**CachingRouteLocator**：

```java
public class CachingRouteLocator implements RouteLocator {
    
    private final RouteLocator delegate;
    private final Flux<Route> routes;
    private final Map<String, List> cache = new ConcurrentHashMap<>();
    
    public CachingRouteLocator(RouteLocator delegate) {
        this.delegate = delegate;
        // 缓存路由
        this.routes = CacheFlux.lookup(cache, "routes", Route.class)
            .onCacheMissResume(this::fetch);
    }
    
    private Flux<Route> fetch() {
        return this.delegate.getRoutes()
            .sort(AnnotationAwareOrderComparator.INSTANCE);
    }
    
    @Override
    public Flux<Route> getRoutes() {
        return this.routes;
    }
    
    // 刷新缓存
    public Flux<Route> refresh() {
        this.cache.clear();
        return this.routes;
    }
}
```

---

## 3. FilterChain 过滤器链执行

### 3.1 FilteringWebHandler

```java
public class FilteringWebHandler implements WebHandler {
    
    private final List<GatewayFilter> globalFilters;
    
    @Override
    public Mono<Void> handle(ServerWebExchange exchange) {
        // 1. 获取路由
        Route route = exchange.getRequiredAttribute(GATEWAY_ROUTE_ATTR);
        
        // 2. 获取路由过滤器
        List<GatewayFilter> gatewayFilters = route.getFilters();
        
        // 3. 合并全局过滤器和路由过滤器
        List<GatewayFilter> combined = new ArrayList<>(this.globalFilters);
        combined.addAll(gatewayFilters);
        
        // 4. 排序
        AnnotationAwareOrderComparator.sort(combined);
        
        // 5. 构建过滤器链并执行
        return new DefaultGatewayFilterChain(combined).filter(exchange);
    }
    
    private static class DefaultGatewayFilterChain implements GatewayFilterChain {
        
        private final int index;
        private final List<GatewayFilter> filters;
        
        DefaultGatewayFilterChain(List<GatewayFilter> filters) {
            this(filters, 0);
        }
        
        private DefaultGatewayFilterChain(List<GatewayFilter> filters, int index) {
            this.filters = filters;
            this.index = index;
        }
        
        @Override
        public Mono<Void> filter(ServerWebExchange exchange) {
            if (this.index < filters.size()) {
                // 获取当前过滤器
                GatewayFilter filter = filters.get(this.index);
                
                // 创建下一个过滤器链
                DefaultGatewayFilterChain chain = 
                    new DefaultGatewayFilterChain(filters, this.index + 1);
                
                // 执行当前过滤器
                return filter.filter(exchange, chain);
            } else {
                // 所有过滤器执行完毕
                return Mono.empty();
            }
        }
    }
}
```

### 3.2 过滤器执行流程

```
请求到达 FilteringWebHandler
    ↓
获取路由和过滤器
    ├─ Global Filters（全局过滤器）
    └─ Route Filters（路由过滤器）
    ↓
合并并排序（按 Order）
    ↓
构建过滤器链 DefaultGatewayFilterChain
    ↓
逐个执行过滤器
    ├─ Filter 1 pre
    ├─ Filter 2 pre
    ├─ ...
    ├─ NettyRoutingFilter（发起请求）
    ├─ ...
    ├─ Filter 2 post
    └─ Filter 1 post
    ↓
返回响应
```

### 3.3 责任链模式

```java
// 过滤器1
public class LoggingFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Filter1 pre");
        return chain.filter(exchange)  // 调用下一个过滤器
            .then(Mono.fromRunnable(() -> log.info("Filter1 post")));
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
}

// 过滤器2
public class AuthFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Filter2 pre");
        return chain.filter(exchange)
            .then(Mono.fromRunnable(() -> log.info("Filter2 post")));
    }
    
    @Override
    public int getOrder() {
        return -50;
    }
}

// 执行顺序：
// Filter1 pre（Order=-100）
// Filter2 pre（Order=-50）
// Filter2 post
// Filter1 post
```

---

## 4. WebFlux 响应式原理

### 4.1 Reactor 核心概念

**Mono（0或1个元素）**：

```java
Mono<String> mono = Mono.just("Hello");

mono.subscribe(
    value -> System.out.println("接收到: " + value),
    error -> System.err.println("错误: " + error),
    () -> System.out.println("完成")
);
```

**Flux（0到N个元素）**：

```java
Flux<Integer> flux = Flux.range(1, 5);

flux.subscribe(
    value -> System.out.println("接收到: " + value)
);
// 输出：1 2 3 4 5
```

### 4.2 响应式编程优势

**传统阻塞式**：

```java
// Servlet 容器（Tomcat）
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    // 阻塞等待数据库查询
    User user = userRepository.findById(id);  // 阻塞
    return user;
}

// 问题：
// - 每个请求占用一个线程
// - 线程池大小：200
// - 最大并发：200
```

**响应式（WebFlux）**：

```java
// WebFlux（Netty）
@GetMapping("/users/{id}")
public Mono<User> getUser(@PathVariable Long id) {
    // 非阻塞查询
    return userRepository.findById(id);  // 非阻塞
}

// 优势：
// - 少量线程处理大量请求
// - 线程池大小：CPU核心数 * 2
// - 最大并发：数万
```

### 4.3 背压（Backpressure）

```java
Flux<Integer> flux = Flux.range(1, 1000)
    .onBackpressureBuffer(100)  // 缓冲区100
    .doOnNext(i -> {
        // 慢速处理
        Thread.sleep(10);
        System.out.println(i);
    });

flux.subscribe();
```

---

## 5. Netty 网络模型

### 5.1 Netty 架构

```
Netty Reactor 模型：

Boss EventLoopGroup（接受连接）
    ├─ Boss EventLoop 1
    └─ Boss EventLoop 2
    
Worker EventLoopGroup（处理I/O）
    ├─ Worker EventLoop 1
    ├─ Worker EventLoop 2
    ├─ Worker EventLoop 3
    └─ Worker EventLoop 4
```

### 5.2 Gateway 使用 Netty

**NettyReactiveWebServerFactory**：

```java
@Bean
public NettyReactiveWebServerFactory nettyReactiveWebServerFactory() {
    NettyReactiveWebServerFactory factory = new NettyReactiveWebServerFactory();
    
    // 配置 Netty
    factory.addServerCustomizers(builder -> builder
        // 配置事件循环组
        .runOn(LoopResources.create("gateway", 4, true))
        // 配置连接超时
        .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3000)
        // 配置 SO_KEEPALIVE
        .option(ChannelOption.SO_KEEPALIVE, true)
        // 配置 TCP_NODELAY
        .option(ChannelOption.TCP_NODELAY, true)
    );
    
    return factory;
}
```

### 5.3 Netty 配置优化

```yaml
spring:
  webflux:
    # 默认编解码器缓冲区大小
    codec:
      max-in-memory-size: 10MB
```

**代码配置**：

```java
@Configuration
public class NettyConfig {
    
    @Bean
    public NettyReactiveWebServerFactory nettyReactiveWebServerFactory() {
        NettyReactiveWebServerFactory factory = new NettyReactiveWebServerFactory();
        
        factory.addServerCustomizers(builder -> {
            // 配置事件循环组
            builder.runOn(LoopResources.create(
                "gateway",
                Runtime.getRuntime().availableProcessors() * 2,  // 线程数
                true  // daemon
            ));
            
            // 配置 HTTP 服务器
            builder.httpServer(server -> server
                .compress(true)  // 启用压缩
                .forwarded(true)  // 转发代理信息
            );
        });
        
        return factory;
    }
}
```

---

## 6. 性能优化配置

### 6.1 JVM 参数优化

```bash
# 堆内存配置
-Xms2g -Xmx2g

# 年轻代配置
-XX:NewRatio=2

# GC 配置（G1GC）
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m

# GC 日志
-Xloggc:logs/gc.log
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps

# OOM 时 dump
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=logs/heap.dump
```

### 6.2 Netty 优化

```yaml
spring:
  cloud:
    gateway:
      # Netty 配置
      httpclient:
        # 连接池配置
        pool:
          type: ELASTIC           # 连接池类型（ELASTIC/FIXED/DISABLED）
          max-connections: 500    # 最大连接数
          max-idle-time: 30s      # 最大空闲时间
          max-life-time: 60s      # 连接最大生存时间
          acquire-timeout: 45s    # 获取连接超时
        
        # 连接超时
        connect-timeout: 3000
        
        # 响应超时
        response-timeout: 10s
        
        # SSL 配置
        ssl:
          use-insecure-trust-manager: false
          handshake-timeout: 10s
          close-notify-flush-timeout: 3s
          close-notify-read-timeout: 0
        
        # WebSocket
        websocket:
          max-frame-payload-length: 65536
          proxy-ping: true
```

### 6.3 WebFlux 优化

```yaml
spring:
  webflux:
    # 编解码器配置
    codec:
      max-in-memory-size: 10MB  # 最大内存缓冲
    
    # 静态资源
    static-path-pattern: /static/**
```

---

## 7. 连接池优化

### 7.1 HttpClient 连接池

**ELASTIC 连接池（默认）**：

```yaml
spring:
  cloud:
    gateway:
      httpclient:
        pool:
          type: ELASTIC
          max-connections: 500        # 最大连接数
          max-idle-time: 30s          # 最大空闲时间
```

**优点**：
- 按需创建连接
- 自动释放空闲连接
- 适合连接数波动大的场景

**FIXED 连接池**：

```yaml
spring:
  cloud:
    gateway:
      httpclient:
        pool:
          type: FIXED
          max-connections: 500
          acquire-timeout: 45s
```

**优点**：
- 连接复用率高
- 性能稳定
- 适合稳定的高并发场景

### 7.2 连接池监控

```java
@Component
@Slf4j
public class ConnectionPoolMetrics {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    @Scheduled(fixedRate = 60000)
    public void logMetrics() {
        // 活跃连接数
        Gauge.builder("gateway.httpclient.connections.active", 
            this, value -> getActiveConnections())
            .register(meterRegistry);
        
        // 空闲连接数
        Gauge.builder("gateway.httpclient.connections.idle",
            this, value -> getIdleConnections())
            .register(meterRegistry);
        
        // 等待连接数
        Gauge.builder("gateway.httpclient.connections.pending",
            this, value -> getPendingConnections())
            .register(meterRegistry);
    }
}
```

---

## 8. 内存调优

### 8.1 内存使用分析

**Gateway 内存分配**：

```
总内存：2GB

分配：
- 堆内存：1.5GB
  - 年轻代：500MB
  - 老年代：1GB
- 元空间：256MB
- 直接内存：256MB（Netty ByteBuf）
- 栈内存：200MB
```

### 8.2 直接内存优化

**Netty ByteBuf 配置**：

```java
@Configuration
public class ByteBufConfig {
    
    @Bean
    public NettyReactiveWebServerFactory nettyFactory() {
        NettyReactiveWebServerFactory factory = new NettyReactiveWebServerFactory();
        
        factory.addServerCustomizers(builder -> {
            builder.httpServer(server -> server
                // 配置 ByteBuf 分配器
                .alloc(PooledByteBufAllocator.DEFAULT)
            );
        });
        
        return factory;
    }
}
```

**JVM 参数**：

```bash
# 直接内存大小
-XX:MaxDirectMemorySize=256m
```

### 8.3 内存泄漏排查

**使用 Arthas**：

```bash
# 1. 启动 Arthas
java -jar arthas-boot.jar

# 2. 查看内存使用
memory

# 3. 查看堆对象
heapdump /tmp/heap.hprof

# 4. 分析大对象
dashboard
```

---

## 9. 常见问题排查（路由404/转发超时/网关OOM）

### 9.1 路由 404

**问题现象**：

```
HTTP/1.1 404 Not Found
```

**排查步骤**：

```bash
# 1. 查看所有路由
curl http://localhost:8080/actuator/gateway/routes | jq

# 2. 检查路由配置
spring:
  cloud:
    gateway:
      routes:
        - id: user-service-route
          uri: lb://user-service
          predicates:
            - Path=/api/users/**  # 检查路径是否正确

# 3. 检查服务注册
curl http://localhost:8848/nacos/v1/ns/instance/list?serviceName=user-service

# 4. 启用 DEBUG 日志
logging:
  level:
    org.springframework.cloud.gateway: DEBUG
```

**解决方案**：

```yaml
# 检查路径配置
predicates:
  - Path=/api/users/**  # ✅ 正确
  - Path=/api/user/**   # ❌ 错误

# 检查服务名
uri: lb://user-service   # ✅ 正确
uri: lb://user-services  # ❌ 错误
```

### 9.2 转发超时

**问题现象**：

```
io.netty.handler.timeout.ReadTimeoutException: null
```

**排查步骤**：

```yaml
# 1. 检查超时配置
spring:
  cloud:
    gateway:
      httpclient:
        connect-timeout: 3000
        response-timeout: 10s  # 增加超时时间

# 2. 检查下游服务响应时间
# 使用 SkyWalking/Zipkin 查看链路

# 3. 启用详细日志
logging:
  level:
    reactor.netty.http.client: DEBUG
```

**解决方案**：

```yaml
# 方案1：增加超时时间
spring:
  cloud:
    gateway:
      httpclient:
        response-timeout: 30s

# 方案2：优化下游服务
# - 添加索引
# - 添加缓存
# - 异步处理

# 方案3：使用重试
routes:
  - id: user-service-route
    uri: lb://user-service
    filters:
      - name: Retry
        args:
          retries: 3
```

### 9.3 网关 OOM

**问题现象**：

```
java.lang.OutOfMemoryError: Java heap space
```

**排查步骤**：

```bash
# 1. 查看堆内存使用
jmap -heap <pid>

# 2. dump 堆内存
jmap -dump:format=b,file=heap.hprof <pid>

# 3. 使用 MAT 分析
# Eclipse Memory Analyzer

# 4. 查看 GC 日志
tail -f logs/gc.log
```

**常见原因**：

```
1. 大响应体未设置限制
2. 连接池配置过大
3. 内存泄漏（未释放资源）
4. DirectBuffer 泄漏
```

**解决方案**：

```yaml
# 1. 限制响应体大小
spring:
  webflux:
    codec:
      max-in-memory-size: 10MB

# 2. 限制连接池
spring:
  cloud:
    gateway:
      httpclient:
        pool:
          max-connections: 200

# 3. 增加堆内存
-Xms2g -Xmx2g

# 4. 使用流式处理大响应
```

---

## 10. 面试要点

**Q1：Gateway 的工作原理？**

1. 请求到达 Netty
2. RoutePredicateHandlerMapping 匹配路由
3. FilteringWebHandler 执行过滤器链
4. NettyRoutingFilter 转发请求
5. 返回响应

**Q2：Gateway 如何实现高性能？**

1. 基于 WebFlux（响应式）
2. 基于 Netty（事件驱动）
3. 少量线程处理大量请求
4. 非阻塞 I/O

**Q3：如何优化 Gateway 性能？**

1. 优化 JVM 参数
2. 配置连接池
3. 启用 HTTP/2
4. 启用压缩
5. 合理的超时配置

**Q4：如何排查 Gateway OOM？**

1. dump 堆内存分析
2. 检查响应体大小限制
3. 检查连接池配置
4. 检查是否有内存泄漏

---

## 11. 参考资料

**官方文档**：
- [Spring Cloud Gateway](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/)
- [Project Reactor](https://projectreactor.io/docs/core/release/reference/)
- [Netty](https://netty.io/wiki/)

**性能优化**：
- [Gateway Performance Tuning](https://spring.io/blog/2019/07/01/spring-cloud-gateway-performance-tuning)

---

**Gateway 部分完成！下一章预告**：第 24 章将开始学习 Sentinel 流量控制，包括 Sentinel 快速入门、@SentinelResource 注解、流量控制规则、流控效果、流控模式、热点参数限流、系统自适应保护等内容。

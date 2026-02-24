# 第22章：Gateway 过滤器深入与最佳实践

> **本章目标**：深入掌握 Gateway 过滤器机制，实现认证、限流、日志、跨域等生产级功能

---

## 1. 过滤器执行顺序

### 1.1 过滤器优先级

**优先级规则**：
```
值越小，优先级越高

GlobalFilter：通过 @Order 或 Ordered 接口指定
GatewayFilter：通过 order() 方法指定
```

**示例**：
```java
@Component
@Order(-100)  // 最高优先级
public class AuthFilter implements GlobalFilter {
}

@Component
@Order(0)
public class LogFilter implements GlobalFilter {
}

@Component
@Order(100)  // 最低优先级
public class MonitorFilter implements GlobalFilter {
}

// 执行顺序：AuthFilter → LogFilter → MonitorFilter
```

---

### 1.2 Pre 和 Post 过滤器

**区分 Pre 和 Post**：
```java
@Component
public class CustomFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // ====== Pre Filter ======
        System.out.println("Pre Filter: 请求前处理");
        
        return chain.filter(exchange).then(
            Mono.fromRunnable(() -> {
                // ====== Post Filter ======
                System.out.println("Post Filter: 响应后处理");
            })
        );
    }
    
    @Override
    public int getOrder() {
        return 0;
    }
}
```

---

## 2. 认证授权过滤器

### 2.1 JWT Token 认证

**引入依赖**：
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
</dependency>
```

**JWT 工具类**：
```java
@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                .setSigningKey(secret.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody();
        } catch (Exception e) {
            return null;
        }
    }
    
    public String getUserId(String token) {
        Claims claims = parseToken(token);
        return claims != null ? claims.getSubject() : null;
    }
}
```

**认证过滤器**：
```java
@Component
@Order(-100)
public class AuthFilter implements GlobalFilter {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    // 白名单
    private static final List<String> WHITE_LIST = Arrays.asList(
        "/user/login",
        "/user/register",
        "/doc.html",
        "/swagger-ui.html"
    );
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        
        // 白名单放行
        if (isWhiteListed(path)) {
            return chain.filter(exchange);
        }
        
        // 获取 Token
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        
        if (token == null || !token.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing token");
        }
        
        // 验证 Token
        String actualToken = token.substring(7);
        String userId = jwtUtil.getUserId(actualToken);
        
        if (userId == null) {
            return unauthorized(exchange, "Invalid token");
        }
        
        // 将用户信息传递给下游服务
        ServerHttpRequest request = exchange.getRequest().mutate()
            .header("X-User-Id", userId)
            .build();
        
        return chain.filter(exchange.mutate().request(request).build());
    }
    
    private boolean isWhiteListed(String path) {
        return WHITE_LIST.stream().anyMatch(path::startsWith);
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        
        String body = "{\"code\":401,\"message\":\"" + message + "\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        
        return response.writeWith(Mono.just(buffer));
    }
}
```

---

### 2.2 权限控制

**权限注解**：
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String value();
}
```

**权限过滤器**：
```java
@Component
@Order(-99)
public class PermissionFilter implements GlobalFilter {
    
    @Autowired
    private RedisTemplate<String, Set<String>> redisTemplate;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
        
        if (userId == null) {
            return chain.filter(exchange);
        }
        
        // 从 Redis 获取用户权限
        Set<String> permissions = redisTemplate.opsForValue().get("user:permissions:" + userId);
        
        if (permissions == null) {
            permissions = Collections.emptySet();
        }
        
        String path = exchange.getRequest().getURI().getPath();
        
        // 检查权限
        if (requiresPermission(path)) {
            String requiredPermission = getRequiredPermission(path);
            
            if (!permissions.contains(requiredPermission)) {
                return forbidden(exchange);
            }
        }
        
        return chain.filter(exchange);
    }
    
    private boolean requiresPermission(String path) {
        // 判断路径是否需要权限
        return path.startsWith("/admin/");
    }
    
    private String getRequiredPermission(String path) {
        // 根据路径获取所需权限
        if (path.startsWith("/admin/user")) {
            return "user:manage";
        }
        return "admin";
    }
    
    private Mono<Void> forbidden(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }
}
```

---

## 3. 限流过滤器

### 3.1 IP 限流

**配置**：
```yaml
spring:
  redis:
    host: localhost
    port: 6379
  
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
                redis-rate-limiter.burstCapacity: 20  # 令牌桶容量
                key-resolver: "#{@ipKeyResolver}"
```

**Key 解析器**：
```java
@Configuration
public class RateLimiterConfig {
    
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(
            exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
        );
    }
    
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> Mono.just(
            exchange.getRequest().getHeaders().getFirst("X-User-Id")
        );
    }
    
    @Bean
    public KeyResolver apiKeyResolver() {
        return exchange -> Mono.just(
            exchange.getRequest().getURI().getPath()
        );
    }
}
```

---

### 3.2 自定义限流算法

**令牌桶算法**：
```java
@Component
public class TokenBucketRateLimiter {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    public boolean tryAcquire(String key, int rate, int capacity) {
        long now = System.currentTimeMillis();
        
        String script = 
            "local key = KEYS[1]\n" +
            "local rate = tonumber(ARGV[1])\n" +
            "local capacity = tonumber(ARGV[2])\n" +
            "local now = tonumber(ARGV[3])\n" +
            "local requested = 1\n" +
            "\n" +
            "local fill_time = capacity / rate\n" +
            "local ttl = math.floor(fill_time * 2)\n" +
            "\n" +
            "local last_tokens = tonumber(redis.call('hget', key, 'tokens'))\n" +
            "local last_refreshed = tonumber(redis.call('hget', key, 'refreshed'))\n" +
            "\n" +
            "if last_tokens == nil then\n" +
            "  last_tokens = capacity\n" +
            "end\n" +
            "\n" +
            "if last_refreshed == nil then\n" +
            "  last_refreshed = 0\n" +
            "end\n" +
            "\n" +
            "local delta = math.max(0, now - last_refreshed)\n" +
            "local filled_tokens = math.min(capacity, last_tokens + (delta * rate / 1000))\n" +
            "local allowed = filled_tokens >= requested\n" +
            "local new_tokens = filled_tokens\n" +
            "\n" +
            "if allowed then\n" +
            "  new_tokens = filled_tokens - requested\n" +
            "end\n" +
            "\n" +
            "redis.call('hset', key, 'tokens', new_tokens)\n" +
            "redis.call('hset', key, 'refreshed', now)\n" +
            "redis.call('expire', key, ttl)\n" +
            "\n" +
            "return {allowed, new_tokens}";
        
        List<Long> result = (List<Long>) redisTemplate.execute(
            new DefaultRedisScript<>(script, List.class),
            Collections.singletonList(key),
            String.valueOf(rate),
            String.valueOf(capacity),
            String.valueOf(now)
        );
        
        return result.get(0) == 1;
    }
}
```

**限流过滤器**：
```java
@Component
@Order(-50)
public class CustomRateLimitFilter implements GlobalFilter {
    
    @Autowired
    private TokenBucketRateLimiter rateLimiter;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String ip = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
        String key = "rate_limit:" + ip;
        
        if (!rateLimiter.tryAcquire(key, 10, 20)) {
            return tooManyRequests(exchange);
        }
        
        return chain.filter(exchange);
    }
    
    private Mono<Void> tooManyRequests(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        return exchange.getResponse().setComplete();
    }
}
```

---

## 4. 日志过滤器

### 4.1 请求日志

**实现**：
```java
@Component
@Order(0)
public class AccessLogFilter implements GlobalFilter {
    
    private static final Logger log = LoggerFactory.getLogger(AccessLogFilter.class);
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        String requestId = UUID.randomUUID().toString();
        String method = request.getMethodValue();
        String path = request.getURI().getPath();
        String ip = request.getRemoteAddress().getAddress().getHostAddress();
        
        // 记录请求开始
        exchange.getAttributes().put("request_id", requestId);
        exchange.getAttributes().put("start_time", System.currentTimeMillis());
        
        log.info("[{}] Request: {} {} from {}", requestId, method, path, ip);
        
        return chain.filter(exchange).then(
            Mono.fromRunnable(() -> {
                Long startTime = exchange.getAttribute("start_time");
                long duration = System.currentTimeMillis() - startTime;
                
                int statusCode = exchange.getResponse().getStatusCode().value();
                
                log.info("[{}] Response: {} in {}ms", requestId, statusCode, duration);
            })
        );
    }
}
```

---

### 4.2 请求响应体日志

**实现**：
```java
@Component
@Order(1)
public class BodyLogFilter implements GlobalFilter {
    
    private static final Logger log = LoggerFactory.getLogger(BodyLogFilter.class);
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 包装请求，记录请求体
        ServerHttpRequestDecorator requestDecorator = new ServerHttpRequestDecorator(exchange.getRequest()) {
            @Override
            public Flux<DataBuffer> getBody() {
                return super.getBody().doOnNext(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    dataBuffer.resetReadPosition();
                    
                    String body = new String(bytes, StandardCharsets.UTF_8);
                    log.info("Request Body: {}", body);
                });
            }
        };
        
        // 包装响应，记录响应体
        ServerHttpResponseDecorator responseDecorator = new ServerHttpResponseDecorator(exchange.getResponse()) {
            @Override
            public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                if (body instanceof Flux) {
                    Flux<DataBuffer> flux = (Flux<DataBuffer>) body;
                    return super.writeWith(flux.map(dataBuffer -> {
                        byte[] bytes = new byte[dataBuffer.readableByteCount()];
                        dataBuffer.read(bytes);
                        
                        String responseBody = new String(bytes, StandardCharsets.UTF_8);
                        log.info("Response Body: {}", responseBody);
                        
                        return exchange.getResponse().bufferFactory().wrap(bytes);
                    }));
                }
                return super.writeWith(body);
            }
        };
        
        return chain.filter(exchange.mutate()
            .request(requestDecorator)
            .response(responseDecorator)
            .build());
    }
}
```

---

## 5. 跨域过滤器

### 5.1 配置方式（推荐）

**配置**：
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: 
              - "http://localhost:8080"
              - "https://www.demo.com"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowedHeaders: "*"
            allowCredentials: true
            maxAge: 3600
```

---

### 5.2 过滤器方式

**实现**：
```java
@Component
@Order(-200)
public class CorsFilter implements GlobalFilter {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        if (CorsUtils.isCorsRequest(request)) {
            ServerHttpResponse response = exchange.getResponse();
            HttpHeaders headers = response.getHeaders();
            
            headers.add("Access-Control-Allow-Origin", request.getHeaders().getOrigin());
            headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            headers.add("Access-Control-Allow-Headers", "*");
            headers.add("Access-Control-Allow-Credentials", "true");
            headers.add("Access-Control-Max-Age", "3600");
            
            if (request.getMethod() == HttpMethod.OPTIONS) {
                response.setStatusCode(HttpStatus.OK);
                return Mono.empty();
            }
        }
        
        return chain.filter(exchange);
    }
}
```

---

## 6. 缓存过滤器

### 6.1 响应缓存

**实现**：
```java
@Component
public class CacheFilter implements GlobalFilter, Ordered {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    // 可缓存的路径
    private static final List<String> CACHEABLE_PATHS = Arrays.asList(
        "/user/",
        "/product/"
    );
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String method = exchange.getRequest().getMethodValue();
        String path = exchange.getRequest().getURI().getPath();
        
        // 只缓存 GET 请求
        if (!"GET".equals(method) || !isCacheable(path)) {
            return chain.filter(exchange);
        }
        
        String cacheKey = "cache:" + path;
        
        // 从缓存获取
        String cached = redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) {
            // 返回缓存响应
            ServerHttpResponse response = exchange.getResponse();
            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
            
            DataBuffer buffer = response.bufferFactory().wrap(cached.getBytes());
            return response.writeWith(Mono.just(buffer));
        }
        
        // 缓存响应
        ServerHttpResponseDecorator responseDecorator = new ServerHttpResponseDecorator(exchange.getResponse()) {
            @Override
            public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                if (body instanceof Flux) {
                    Flux<DataBuffer> flux = (Flux<DataBuffer>) body;
                    return super.writeWith(flux.map(dataBuffer -> {
                        byte[] bytes = new byte[dataBuffer.readableByteCount()];
                        dataBuffer.read(bytes);
                        
                        String responseBody = new String(bytes, StandardCharsets.UTF_8);
                        
                        // 写入缓存
                        redisTemplate.opsForValue().set(cacheKey, responseBody, 5, TimeUnit.MINUTES);
                        
                        return exchange.getResponse().bufferFactory().wrap(bytes);
                    }));
                }
                return super.writeWith(body);
            }
        };
        
        return chain.filter(exchange.mutate().response(responseDecorator).build());
    }
    
    private boolean isCacheable(String path) {
        return CACHEABLE_PATHS.stream().anyMatch(path::startsWith);
    }
    
    @Override
    public int getOrder() {
        return -10;
    }
}
```

---

## 7. 熔断降级过滤器

### 7.1 Resilience4j 熔断

**引入依赖**：
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>
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
            - name: CircuitBreaker
              args:
                name: userServiceCircuitBreaker
                fallbackUri: forward:/fallback/user

resilience4j:
  circuitbreaker:
    instances:
      userServiceCircuitBreaker:
        slidingWindowSize: 10  # 滑动窗口大小
        minimumNumberOfCalls: 5  # 最小调用次数
        failureRateThreshold: 50  # 失败率阈值（50%）
        waitDurationInOpenState: 10000  # 熔断持续时间（毫秒）
```

**降级处理**：
```java
@RestController
public class FallbackController {
    
    @GetMapping("/fallback/user")
    public Mono<Map<String, Object>> userFallback() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 503);
        result.put("message", "User service is unavailable");
        return Mono.just(result);
    }
}
```

---

## 8. 监控过滤器

### 8.1 Metrics 监控

**实现**：
```java
@Component
@Order(10)
public class MetricsFilter implements GlobalFilter {
    
    private final MeterRegistry registry;
    
    @Autowired
    public MetricsFilter(MeterRegistry registry) {
        this.registry = registry;
    }
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethodValue();
        
        Timer.Sample sample = Timer.start(registry);
        
        return chain.filter(exchange).then(
            Mono.fromRunnable(() -> {
                int status = exchange.getResponse().getStatusCode().value();
                
                sample.stop(Timer.builder("gateway.requests")
                    .tag("path", path)
                    .tag("method", method)
                    .tag("status", String.valueOf(status))
                    .register(registry));
                
                registry.counter("gateway.requests.total",
                    "path", path,
                    "method", method,
                    "status", String.valueOf(status)
                ).increment();
            })
        );
    }
}
```

---

## 9. 最佳实践

### 9.1 过滤器设计原则

```
1. 单一职责：每个过滤器只做一件事
2. 合理优先级：认证 > 鉴权 > 限流 > 日志 > 监控
3. 性能优先：避免阻塞操作，使用异步
4. 异常处理：捕获异常，返回友好错误
5. 可配置：通过配置文件控制行为
```

---

### 9.2 优先级推荐

```
-200  跨域处理
-100  认证
-99   鉴权
-50   限流
0     日志
10    监控
100   缓存
```

---

### 9.3 性能优化

**避免阻塞操作**：
```java
// ❌ 错误：阻塞操作
@Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String userId = getUserIdFromRedis(exchange);  // 阻塞
    return chain.filter(exchange);
}

// ✅ 正确：异步操作
@Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    return Mono.fromCallable(() -> getUserIdFromRedis(exchange))
        .subscribeOn(Schedulers.boundedElastic())
        .flatMap(userId -> chain.filter(exchange));
}
```

---

## 10. 学习自检清单

- [ ] 理解过滤器执行顺序和优先级
- [ ] 能够实现 JWT 认证过滤器
- [ ] 能够实现限流过滤器
- [ ] 能够实现日志过滤器
- [ ] 掌握跨域配置
- [ ] 能够实现缓存过滤器
- [ ] 能够实现熔断降级
- [ ] 能够实现监控过滤器
- [ ] 掌握过滤器最佳实践

**学习建议**：
- **预计学习时长**：3-4 小时
- **重点难点**：认证授权、限流算法、响应式编程
- **前置知识**：第21章 Gateway 快速入门
- **实践建议**：实现完整的认证、限流、日志过滤器

---

**本章小结**：
- 过滤器优先级：@Order 值越小越优先，推荐 -200(跨域) -100(认证) -99(鉴权) -50(限流) 0(日志) 10(监控)
- 认证授权：JWT Token 认证、权限控制
- 限流：IP 限流、用户限流、API 限流，令牌桶算法
- 日志：请求日志、响应日志、请求响应体日志
- 跨域：配置方式（推荐）、过滤器方式
- 缓存：响应缓存（Redis）
- 熔断降级：Resilience4j 熔断
- 监控：Metrics 指标收集
- 最佳实践：单一职责、合理优先级、异步非阻塞

**已完成第1-22章，继续生成第23-35章及quiz...**

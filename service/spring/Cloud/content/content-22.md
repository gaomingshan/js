# 第 22 章：Gateway 限流熔断与鉴权

> **学习目标**：掌握 Gateway 限流熔断、理解令牌桶算法、能够实现统一鉴权  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. RequestRateLimiter 限流配置

### 1.1 添加依赖

```xml
<dependencies>
    <!-- Spring Cloud Gateway -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    
    <!-- Redis（限流需要） -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
    </dependency>
</dependencies>
```

### 1.2 基础限流配置

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    
  cloud:
    gateway:
      routes:
        - id: user-service-route
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10      # 每秒允许10个请求
                redis-rate-limiter.burstCapacity: 20       # 令牌桶容量20
                redis-rate-limiter.requestedTokens: 1      # 每次请求消耗1个令牌
                key-resolver: "#{@ipKeyResolver}"         # 限流维度
```

### 1.3 自定义 KeyResolver

**基于 IP 限流**：

```java
@Component
public class IpKeyResolver implements KeyResolver {
    
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        return Mono.just(getClientIp(exchange.getRequest()));
    }
    
    private String getClientIp(ServerHttpRequest request) {
        HttpHeaders headers = request.getHeaders();
        
        // 1. 尝试从 X-Forwarded-For 获取
        String xff = headers.getFirst("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            return xff.split(",")[0].trim();
        }
        
        // 2. 尝试从 X-Real-IP 获取
        String realIp = headers.getFirst("X-Real-IP");
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }
        
        // 3. 获取远程地址
        return request.getRemoteAddress().getAddress().getHostAddress();
    }
}
```

**基于用户 ID 限流**：

```java
@Component
public class UserKeyResolver implements KeyResolver {
    
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        return Mono.justOrEmpty(
            exchange.getRequest().getHeaders().getFirst("X-User-Id")
        );
    }
}
```

**基于接口限流**：

```java
@Component
public class ApiKeyResolver implements KeyResolver {
    
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        return Mono.just(exchange.getRequest().getPath().toString());
    }
}
```

**组合限流（IP + 接口）**：

```java
@Component
public class CompositeKeyResolver implements KeyResolver {
    
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        ServerHttpRequest request = exchange.getRequest();
        String ip = getClientIp(request);
        String path = request.getPath().toString();
        
        return Mono.just(ip + ":" + path);
    }
}
```

---

## 2. 令牌桶限流算法

### 2.1 令牌桶原理

```
令牌桶算法：

1. 固定速率生成令牌放入桶中
2. 桶满时丢弃多余令牌
3. 请求到来时从桶中取令牌
4. 取到令牌则通过，否则拒绝

参数说明：
- replenishRate：每秒生成令牌数（平均速率）
- burstCapacity：桶容量（峰值容量）
- requestedTokens：每次请求消耗令牌数
```

**示例**：

```yaml
redis-rate-limiter.replenishRate: 10     # 每秒生成10个令牌
redis-rate-limiter.burstCapacity: 20     # 桶容量20个令牌

场景分析：
1. 稳定流量：每秒10个请求 → 全部通过 ✅
2. 突发流量：瞬间20个请求 → 全部通过 ✅
3. 持续高流量：每秒30个请求 → 只通过10个 ❌
4. 空闲后突发：空闲10秒后瞬间30个请求 → 通过20个 ⚠️
```

### 2.2 Redis Lua 脚本

**Spring Cloud Gateway 使用的 Lua 脚本**：

```lua
local tokens_key = KEYS[1]
local timestamp_key = KEYS[2]

local rate = tonumber(ARGV[1])          -- replenishRate
local capacity = tonumber(ARGV[2])      -- burstCapacity
local now = tonumber(ARGV[3])           -- 当前时间戳
local requested = tonumber(ARGV[4])     -- requestedTokens

local fill_time = capacity/rate
local ttl = math.floor(fill_time*2)

local last_tokens = tonumber(redis.call("get", tokens_key))
if last_tokens == nil then
  last_tokens = capacity
end

local last_refreshed = tonumber(redis.call("get", timestamp_key))
if last_refreshed == nil then
  last_refreshed = 0
end

local delta = math.max(0, now-last_refreshed)
local filled_tokens = math.min(capacity, last_tokens+(delta*rate))
local allowed = filled_tokens >= requested
local new_tokens = filled_tokens
local allowed_num = 0

if allowed then
  new_tokens = filled_tokens - requested
  allowed_num = 1
end

redis.call("setex", tokens_key, ttl, new_tokens)
redis.call("setex", timestamp_key, ttl, now)

return { allowed_num, new_tokens }
```

### 2.3 自定义限流响应

```java
@Component
public class CustomRateLimiterGatewayFilterFactory 
        extends RequestRateLimiterGatewayFilterFactory {
    
    public CustomRateLimiterGatewayFilterFactory(
            RateLimiter defaultRateLimiter,
            KeyResolver defaultKeyResolver) {
        super(defaultRateLimiter, defaultKeyResolver);
    }
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String key = getKeyResolver(config).resolve(exchange).block();
            
            return getRateLimiter(config)
                .isAllowed(key, config.getTokensPerRequest())
                .flatMap(response -> {
                    if (response.isAllowed()) {
                        // 限流通过
                        return chain.filter(exchange);
                    } else {
                        // 限流拒绝，自定义响应
                        return rateLimitExceeded(exchange);
                    }
                });
        };
    }
    
    private Mono<Void> rateLimitExceeded(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().add("Content-Type", "application/json;charset=UTF-8");
        
        String body = "{\"code\":429,\"message\":\"请求过于频繁，请稍后重试\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        
        return response.writeWith(Mono.just(buffer));
    }
}
```

---

## 3. Redis 限流实现

### 3.1 Redis 配置

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: redis123
    database: 0
    
    # Lettuce 连接池配置
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
        max-wait: -1ms
    
    # 超时配置
    timeout: 3000ms
```

### 3.2 Redis 数据结构

**限流使用的 Redis Key**：

```
request_rate_limiter.{key}.tokens        # 令牌数量
request_rate_limiter.{key}.timestamp     # 上次刷新时间

示例：
request_rate_limiter.192.168.1.1.tokens = 18
request_rate_limiter.192.168.1.1.timestamp = 1704096000
```

### 3.3 查看限流状态

```bash
# 查看所有限流Key
redis-cli keys "request_rate_limiter*"

# 查看令牌数量
redis-cli get "request_rate_limiter.192.168.1.1.tokens"

# 查看时间戳
redis-cli get "request_rate_limiter.192.168.1.1.timestamp"

# 删除限流记录（清空限流）
redis-cli del "request_rate_limiter.192.168.1.1.tokens"
redis-cli del "request_rate_limiter.192.168.1.1.timestamp"
```

---

## 4. 自定义限流策略

### 4.1 基于内存的限流

```java
@Component
public class LocalRateLimiter {
    
    private final LoadingCache<String, RateLimiter> cache;
    
    public LocalRateLimiter() {
        this.cache = CacheBuilder.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(1, TimeUnit.HOURS)
            .build(new CacheLoader<String, RateLimiter>() {
                @Override
                public RateLimiter load(String key) {
                    return RateLimiter.create(10.0);  // 每秒10个请求
                }
            });
    }
    
    public boolean tryAcquire(String key) {
        try {
            RateLimiter rateLimiter = cache.get(key);
            return rateLimiter.tryAcquire();
        } catch (ExecutionException e) {
            return false;
        }
    }
}
```

### 4.2 多级限流

```java
@Component
@Slf4j
public class MultiLevelRateLimiterFilter implements GlobalFilter, Ordered {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // 全局限流：每秒1000个请求
    private static final int GLOBAL_LIMIT = 1000;
    
    // IP限流：每秒10个请求
    private static final int IP_LIMIT = 10;
    
    // 用户限流：每秒100个请求
    private static final int USER_LIMIT = 100;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return Mono.fromCallable(() -> {
            // 1. 全局限流检查
            if (!checkGlobalLimit()) {
                throw new RateLimitException("系统繁忙，请稍后重试");
            }
            
            // 2. IP限流检查
            String ip = getClientIp(exchange.getRequest());
            if (!checkIpLimit(ip)) {
                throw new RateLimitException("IP访问过于频繁");
            }
            
            // 3. 用户限流检查
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            if (userId != null && !checkUserLimit(userId)) {
                throw new RateLimitException("用户请求过于频繁");
            }
            
            return true;
        })
        .flatMap(allowed -> chain.filter(exchange))
        .onErrorResume(RateLimitException.class, e -> {
            return rateLimitExceeded(exchange, e.getMessage());
        });
    }
    
    private boolean checkGlobalLimit() {
        String key = "rate_limit:global";
        return checkLimit(key, GLOBAL_LIMIT);
    }
    
    private boolean checkIpLimit(String ip) {
        String key = "rate_limit:ip:" + ip;
        return checkLimit(key, IP_LIMIT);
    }
    
    private boolean checkUserLimit(String userId) {
        String key = "rate_limit:user:" + userId;
        return checkLimit(key, USER_LIMIT);
    }
    
    private boolean checkLimit(String key, int limit) {
        Long count = redisTemplate.opsForValue().increment(key);
        
        if (count == 1) {
            redisTemplate.expire(key, 1, TimeUnit.SECONDS);
        }
        
        return count <= limit;
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
}
```

---

## 5. 熔断降级集成（Sentinel/Resilience4j）

### 5.1 Sentinel 集成

**添加依赖**：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>

<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-sentinel-gateway</artifactId>
</dependency>
```

**配置**：

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080  # Sentinel 控制台地址
        port: 8719                  # 客户端端口
      
      # Gateway 配置
      scg:
        fallback:
          mode: response            # 降级模式
          response-status: 429      # 响应状态码
          response-body: '{"code":429,"message":"系统繁忙"}'
```

**自定义降级处理**：

```java
@Configuration
public class GatewaySentinelConfig {
    
    @PostConstruct
    public void init() {
        // 自定义限流降级处理
        GatewayCallbackManager.setBlockHandler(new BlockRequestHandler() {
            @Override
            public Mono<ServerResponse> handleRequest(ServerWebExchange exchange, Throwable ex) {
                Map<String, Object> result = new HashMap<>();
                result.put("code", 429);
                result.put("message", "请求被限流");
                
                return ServerResponse.status(HttpStatus.TOO_MANY_REQUESTS)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(BodyInserters.fromValue(result));
            }
        });
    }
}
```

### 5.2 Resilience4j 集成

**添加依赖**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>
```

**配置**：

```yaml
resilience4j:
  circuitbreaker:
    configs:
      default:
        slidingWindowSize: 10           # 滑动窗口大小
        minimumNumberOfCalls: 5         # 最小调用次数
        failureRateThreshold: 50        # 失败率阈值
        waitDurationInOpenState: 10s    # 熔断持续时间
        permittedNumberOfCallsInHalfOpenState: 3  # 半开状态允许调用次数
    
    instances:
      user-service:
        baseConfig: default
```

**使用**：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service-route
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - name: CircuitBreaker
              args:
                name: user-service
                fallbackUri: forward:/fallback/user-service
```

**降级处理**：

```java
@RestController
public class FallbackController {
    
    @GetMapping("/fallback/user-service")
    public Mono<Map<String, Object>> userServiceFallback() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 503);
        result.put("message", "用户服务暂时不可用");
        return Mono.just(result);
    }
}
```

---

## 6. 统一鉴权方案（JWT/OAuth2）

### 6.1 JWT 鉴权

**JWT 工具类**：

```java
@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    /**
     * 解析 JWT Token
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 验证 Token
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims != null && !isTokenExpired(claims);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Token 是否过期
     */
    private boolean isTokenExpired(Claims claims) {
        Date expiration = claims.getExpiration();
        return expiration.before(new Date());
    }
    
    /**
     * 获取用户 ID
     */
    public String getUserId(String token) {
        Claims claims = parseToken(token);
        return claims != null ? claims.getSubject() : null;
    }
}
```

**JWT 鉴权过滤器**：

```java
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthFilter implements GlobalFilter, Ordered {
    
    private final JwtUtil jwtUtil;
    
    // 白名单
    private static final List<String> WHITE_LIST = Arrays.asList(
        "/api/login",
        "/api/register",
        "/api/public/**"
    );
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();
        
        // 1. 检查白名单
        if (isWhitelist(path)) {
            return chain.filter(exchange);
        }
        
        // 2. 获取 Token
        String token = request.getHeaders().getFirst("Authorization");
        
        if (token == null || !token.startsWith("Bearer ")) {
            return unauthorized(exchange, "缺少认证信息");
        }
        
        token = token.substring(7);
        
        // 3. 验证 Token
        if (!jwtUtil.validateToken(token)) {
            return unauthorized(exchange, "Token无效或已过期");
        }
        
        // 4. 提取用户信息并添加到请求头
        String userId = jwtUtil.getUserId(token);
        
        ServerHttpRequest mutatedRequest = request.mutate()
            .header("X-User-Id", userId)
            .build();
        
        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }
    
    private boolean isWhitelist(String path) {
        AntPathMatcher pathMatcher = new AntPathMatcher();
        return WHITE_LIST.stream()
            .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json;charset=UTF-8");
        
        String body = String.format("{\"code\":401,\"message\":\"%s\"}", message);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        
        return response.writeWith(Mono.just(buffer));
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
}
```

### 6.2 OAuth2 集成

**添加依赖**：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

**配置**：

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9000
          jwk-set-uri: http://localhost:9000/.well-known/jwks.json
```

---

## 7. 跨域配置（CORS）

### 7.1 全局 CORS 配置

```yaml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "*"                    # 允许的源
            allowedMethods: "*"                    # 允许的方法
            allowedHeaders: "*"                    # 允许的请求头
            allowCredentials: true                 # 允许携带凭证
            maxAge: 3600                           # 预检请求缓存时间
```

### 7.2 代码配置 CORS

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许的源
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("https://www.example.com");
        
        // 允许的方法
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        
        // 允许的请求头
        config.addAllowedHeader("*");
        
        // 允许携带凭证
        config.setAllowCredentials(true);
        
        // 预检请求缓存时间
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsWebFilter(source);
    }
}
```

---

## 8. IP 黑白名单

### 8.1 IP 白名单过滤器

```java
@Component
@Slf4j
public class IpWhitelistFilter implements GlobalFilter, Ordered {
    
    // IP 白名单
    private static final Set<String> WHITE_LIST = new HashSet<>(Arrays.asList(
        "127.0.0.1",
        "192.168.1.100",
        "192.168.1.101"
    ));
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = getClientIp(exchange.getRequest());
        
        if (!WHITE_LIST.contains(clientIp)) {
            log.warn("IP {} 不在白名单中，拒绝访问", clientIp);
            return forbidden(exchange);
        }
        
        return chain.filter(exchange);
    }
    
    private Mono<Void> forbidden(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        
        String body = "{\"code\":403,\"message\":\"访问被拒绝\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        
        return response.writeWith(Mono.just(buffer));
    }
    
    @Override
    public int getOrder() {
        return -200;  // 最高优先级
    }
}
```

### 8.2 IP 黑名单过滤器

```java
@Component
@Slf4j
public class IpBlacklistFilter implements GlobalFilter, Ordered {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private static final String BLACKLIST_KEY = "gateway:ip:blacklist";
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = getClientIp(exchange.getRequest());
        
        return Mono.fromCallable(() -> {
            // 从 Redis 检查黑名单
            return redisTemplate.opsForSet().isMember(BLACKLIST_KEY, clientIp);
        })
        .flatMap(isBlocked -> {
            if (Boolean.TRUE.equals(isBlocked)) {
                log.warn("IP {} 在黑名单中，拒绝访问", clientIp);
                return forbidden(exchange);
            }
            return chain.filter(exchange);
        });
    }
    
    @Override
    public int getOrder() {
        return -200;
    }
}
```

**黑名单管理接口**：

```java
@RestController
@RequestMapping("/gateway/blacklist")
@RequiredArgsConstructor
public class BlacklistController {
    
    private final RedisTemplate<String, String> redisTemplate;
    private static final String BLACKLIST_KEY = "gateway:ip:blacklist";
    
    /**
     * 添加到黑名单
     */
    @PostMapping("/add")
    public Mono<String> addToBlacklist(@RequestParam String ip) {
        return Mono.fromCallable(() -> {
            redisTemplate.opsForSet().add(BLACKLIST_KEY, ip);
            return "添加成功";
        });
    }
    
    /**
     * 从黑名单移除
     */
    @PostMapping("/remove")
    public Mono<String> removeFromBlacklist(@RequestParam String ip) {
        return Mono.fromCallable(() -> {
            redisTemplate.opsForSet().remove(BLACKLIST_KEY, ip);
            return "移除成功";
        });
    }
    
    /**
     * 查询黑名单
     */
    @GetMapping("/list")
    public Mono<Set<String>> listBlacklist() {
        return Mono.fromCallable(() -> 
            redisTemplate.opsForSet().members(BLACKLIST_KEY)
        );
    }
}
```

---

## 9. 面试要点

**Q1：令牌桶算法的原理是什么？**

1. 固定速率生成令牌放入桶中
2. 桶满时丢弃多余令牌
3. 请求到来时从桶中取令牌
4. 取到令牌则通过，否则拒绝

**Q2：如何实现网关统一鉴权？**

1. 实现 GlobalFilter
2. 从请求头获取 Token
3. 验证 Token 有效性
4. 提取用户信息并传递到下游

**Q3：CORS 跨域如何配置？**

通过 `globalcors` 配置或 `CorsWebFilter` Bean

**Q4：如何实现多级限流？**

1. 全局限流（保护系统）
2. IP 限流（防止单个 IP 攻击）
3. 用户限流（保护用户体验）
4. 接口限流（保护热点接口）

---

**下一章预告**：第 23 章将深入学习 Gateway 原理与性能优化，包括 Gateway 启动流程、RouteLocator 路由定位、FilterChain 过滤器链执行、WebFlux 响应式原理、Netty 网络模型、性能优化配置等内容。

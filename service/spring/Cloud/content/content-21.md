# 第 21 章：Filter 过滤器详解

> **学习目标**：掌握 Gateway Filter 使用、理解 Filter 责任链模式、能够开发自定义 Filter  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. Filter 工作原理

### 1.1 Filter 类型

**Gateway 支持两种 Filter**：

```
1. GatewayFilter（局部过滤器）
   - 作用于单个路由
   - 在路由配置中指定

2. GlobalFilter（全局过滤器）
   - 作用于所有路由
   - 通过 @Component 注册
```

### 1.2 Filter 执行流程

```
Client Request
    ↓
Gateway Handler Mapping（路由匹配）
    ↓
Gateway Web Handler
    ↓
Filter Chain（过滤器链）
    ├─ GlobalFilter 1
    ├─ GlobalFilter 2
    ├─ GatewayFilter 1
    ├─ GatewayFilter 2
    ↓
Proxied Service（目标服务）
    ↓
Response Filter Chain（响应过滤器链）
    ├─ GatewayFilter 2
    ├─ GatewayFilter 1
    ├─ GlobalFilter 2
    ├─ GlobalFilter 1
    ↓
Client Response
```

### 1.3 Filter 接口

**GatewayFilter 接口**：

```java
public interface GatewayFilter extends ShortcutConfigurable {
    
    /**
     * 过滤器逻辑
     * 
     * @param exchange 请求/响应交换对象
     * @param chain 过滤器链
     * @return Mono<Void>
     */
    Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain);
}
```

**GlobalFilter 接口**：

```java
public interface GlobalFilter {
    
    /**
     * 全局过滤器逻辑
     */
    Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain);
}
```

**Ordered 接口**（控制执行顺序）：

```java
public interface Ordered {
    int getOrder();  // 返回值越小，优先级越高
}
```

---

## 2. 内置 GatewayFilter 详解（30+种）

### 2.1 AddRequestHeader/RemoveRequestHeader

**AddRequestHeader（添加请求头）**：

```yaml
routes:
  - id: add-request-header-route
    uri: lb://user-service
    predicates:
      - Path=/api/users/**
    filters:
      - AddRequestHeader=X-Request-Source, Gateway
      - AddRequestHeader=X-Request-Time, #{T(System).currentTimeMillis()}
```

**代码配置**：

```java
.route("add-header-route", r -> r
    .path("/api/users/**")
    .filters(f -> f.addRequestHeader("X-Request-Source", "Gateway"))
    .uri("lb://user-service")
)
```

**RemoveRequestHeader（移除请求头）**：

```yaml
filters:
  - RemoveRequestHeader=Cookie  # 移除Cookie，防止传递到下游
  - RemoveRequestHeader=Authorization
```

**使用场景**：
- 添加链路追踪ID
- 添加请求来源标识
- 移除敏感信息

### 2.2 AddResponseHeader/RemoveResponseHeader

**AddResponseHeader（添加响应头）**：

```yaml
filters:
  - AddResponseHeader=X-Response-Source, Gateway
  - AddResponseHeader=Cache-Control, max-age=3600
```

**RemoveResponseHeader（移除响应头）**：

```yaml
filters:
  - RemoveResponseHeader=Server  # 移除服务器信息
  - RemoveResponseHeader=X-Application-Context
```

**使用场景**：
- 添加CORS响应头
- 添加缓存控制
- 移除敏感服务器信息

### 2.3 StripPrefix/PrefixPath/RewritePath

**StripPrefix（去除路径前缀）**：

```yaml
routes:
  - id: strip-prefix-route
    uri: lb://user-service
    predicates:
      - Path=/api/users/**
    filters:
      - StripPrefix=1  # 去除 /api

# 请求：/api/users/1
# 转发：/users/1
```

**参数说明**：
- `StripPrefix=1`：去除1层路径
- `StripPrefix=2`：去除2层路径

**示例**：

```yaml
# StripPrefix=1
/api/users/1 → /users/1

# StripPrefix=2
/api/v1/users/1 → /users/1
```

**PrefixPath（添加路径前缀）**：

```yaml
filters:
  - PrefixPath=/api

# 请求：/users/1
# 转发：/api/users/1
```

**RewritePath（重写路径）**：

```yaml
filters:
  - RewritePath=/red/(?<segment>.*), /$\{segment}

# 请求：/red/users/1
# 转发：/users/1
```

**正则表达式示例**：

```yaml
# 路径转换
filters:
  - RewritePath=/api/(?<path>.*), /$\{path}
  # /api/users/1 → /users/1
  
  - RewritePath=/v1/(?<segment>.*), /v2/$\{segment}
  # /v1/users/1 → /v2/users/1
```

### 2.4 SetStatus（设置响应状态码）

```yaml
filters:
  - SetStatus=401  # 设置为未授权
  - SetStatus=UNAUTHORIZED  # 使用枚举
```

**使用场景**：
- API废弃提示（410 Gone）
- 强制返回特定状态码

### 2.5 Retry（重试）

```yaml
filters:
  - name: Retry
    args:
      retries: 3                    # 重试次数
      statuses: BAD_GATEWAY         # 重试的状态码
      methods: GET,POST             # 重试的方法
      backoff:
        firstBackoff: 10ms          # 第一次重试延迟
        maxBackoff: 50ms            # 最大延迟
        factor: 2                   # 延迟倍数
        basedOnPreviousValue: true  # 基于前一次延迟计算
```

**代码配置**：

```java
.filters(f -> f.retry(config -> config
    .setRetries(3)
    .setStatuses(HttpStatus.BAD_GATEWAY)
    .setMethods(HttpMethod.GET, HttpMethod.POST)
    .setBackoff(
        Duration.ofMillis(10),
        Duration.ofMillis(50),
        2,
        true
    )
))
```

**重试策略**：

```
第1次失败：延迟 10ms 重试
第2次失败：延迟 20ms 重试（10ms * 2）
第3次失败：延迟 40ms 重试（20ms * 2）
```

### 2.6 RequestSize（限制请求大小）

```yaml
filters:
  - name: RequestSize
    args:
      maxSize: 5MB  # 最大5MB
```

**使用场景**：
- 防止大文件上传
- 保护网关内存

### 2.7 RequestRateLimiter（请求限流）

```yaml
filters:
  - name: RequestRateLimiter
    args:
      redis-rate-limiter.replenishRate: 10  # 每秒允许10个请求
      redis-rate-limiter.burstCapacity: 20   # 令牌桶容量20
      key-resolver: "#{@userKeyResolver}"    # 限流维度
```

**自定义KeyResolver**：

```java
@Component
public class UserKeyResolver implements KeyResolver {
    
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        // 基于用户ID限流
        return Mono.just(
            exchange.getRequest().getHeaders()
                .getFirst("X-User-Id")
        );
    }
}

@Component
public class IpKeyResolver implements KeyResolver {
    
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        // 基于IP限流
        return Mono.just(
            exchange.getRequest().getRemoteAddress()
                .getAddress().getHostAddress()
        );
    }
}
```

### 2.8 RedirectTo（重定向）

```yaml
filters:
  - RedirectTo=302, https://www.example.com
```

**使用场景**：
- HTTP到HTTPS重定向
- 域名迁移

### 2.9 SetPath（设置路径）

```yaml
filters:
  - SetPath=/api/users/{id}
```

### 2.10 SetRequestHeader（设置请求头）

```yaml
filters:
  - SetRequestHeader=X-Request-Id, ${exchange.request.id}
```

**与 AddRequestHeader 的区别**：
- `SetRequestHeader`：覆盖已存在的请求头
- `AddRequestHeader`：追加到已存在的请求头

### 2.11 SetResponseHeader（设置响应头）

```yaml
filters:
  - SetResponseHeader=X-Response-Time, #{T(System).currentTimeMillis()}
```

### 2.12 SaveSession（保存会话）

```yaml
filters:
  - SaveSession  # 强制保存WebSession
```

### 2.13 SecureHeaders（安全响应头）

```yaml
filters:
  - SecureHeaders  # 添加安全相关的响应头
```

**自动添加的响应头**：

```
X-Xss-Protection: 1; mode=block
Strict-Transport-Security: max-age=631138519
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'self' https:; font-src 'self' https: data:; img-src 'self' https: data:; object-src 'none'; script-src https:; style-src 'self' https: 'unsafe-inline'
X-Download-Options: noopen
X-Permitted-Cross-Domain-Policies: none
```

### 2.14 PreserveHostHeader（保留原始Host）

```yaml
filters:
  - PreserveHostHeader  # 保留客户端原始Host头
```

**默认行为**：Gateway会将Host替换为目标服务地址

**使用场景**：
- 需要保留原始域名信息
- 多租户场景

### 2.15 ModifyRequestBody（修改请求体）

```java
.filters(f -> f.modifyRequestBody(
    String.class,  // 原始类型
    String.class,  // 目标类型
    (exchange, originalBody) -> {
        // 修改请求体
        String modifiedBody = originalBody.toUpperCase();
        return Mono.just(modifiedBody);
    }
))
```

**使用场景**：
- 请求参数加密/解密
- 请求参数校验
- 请求参数转换

### 2.16 ModifyResponseBody（修改响应体）

```java
.filters(f -> f.modifyResponseBody(
    String.class,
    String.class,
    (exchange, originalBody) -> {
        // 修改响应体
        return Mono.just(originalBody.toLowerCase());
    }
))
```

**使用场景**：
- 响应数据加密/解密
- 响应数据脱敏
- 响应数据格式转换

### 2.17 DedupeResponseHeader（去重响应头）

```yaml
filters:
  - DedupeResponseHeader=Access-Control-Allow-Credentials Access-Control-Allow-Origin
```

**使用场景**：
- 解决CORS响应头重复问题

### 2.18 Hystrix/CircuitBreaker（熔断）

```yaml
filters:
  - name: CircuitBreaker
    args:
      name: myCircuitBreaker
      fallbackUri: forward:/fallback
```

### 2.19 FallbackHeaders（降级响应头）

```yaml
filters:
  - name: FallbackHeaders
    args:
      executionExceptionTypeHeaderName: Execution-Exception-Type
      executionExceptionMessageHeaderName: Execution-Exception-Message
```

### 2.20 MapRequestHeader（映射请求头）

```yaml
filters:
  - MapRequestHeader=Blue, X-Request-Red
```

### 2.21 AddRequestParameter（添加请求参数）

```yaml
filters:
  - AddRequestParameter=color, blue
```

### 2.22 RemoveRequestParameter（移除请求参数）

```yaml
filters:
  - RemoveRequestParameter=color
```

### 2.23 SetRequestHostHeader（设置Host头）

```yaml
filters:
  - SetRequestHostHeader=example.com
```

---

## 3. GlobalFilter 全局过滤器

### 3.1 自定义全局过滤器

**日志记录过滤器**：

```java
@Component
@Slf4j
public class LoggingGlobalFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // 记录请求信息
        log.info("请求路径: {}", request.getPath());
        log.info("请求方法: {}", request.getMethod());
        log.info("请求参数: {}", request.getQueryParams());
        
        long startTime = System.currentTimeMillis();
        
        // 继续执行过滤器链
        return chain.filter(exchange)
            .then(Mono.fromRunnable(() -> {
                // 请求完成后执行
                long duration = System.currentTimeMillis() - startTime;
                ServerHttpResponse response = exchange.getResponse();
                
                log.info("响应状态码: {}", response.getStatusCode());
                log.info("请求耗时: {}ms", duration);
            }));
    }
    
    @Override
    public int getOrder() {
        return -1;  // 优先级最高
    }
}
```

### 3.2 认证鉴权过滤器

```java
@Component
@Slf4j
public class AuthGlobalFilter implements GlobalFilter, Ordered {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // 白名单路径
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
        
        // 2. 获取Token
        String token = request.getHeaders().getFirst("Authorization");
        
        if (token == null || !token.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }
        
        token = token.substring(7);
        
        // 3. 验证Token
        return validateToken(token)
            .flatMap(userId -> {
                if (userId != null) {
                    // Token有效，添加用户信息到请求头
                    ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", userId)
                        .build();
                    
                    ServerWebExchange mutatedExchange = exchange.mutate()
                        .request(mutatedRequest)
                        .build();
                    
                    return chain.filter(mutatedExchange);
                } else {
                    // Token无效
                    return unauthorized(exchange);
                }
            });
    }
    
    private boolean isWhitelist(String path) {
        return WHITE_LIST.stream()
            .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }
    
    private Mono<String> validateToken(String token) {
        return Mono.fromCallable(() -> {
            // 从Redis验证Token
            return redisTemplate.opsForValue().get("token:" + token);
        });
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json;charset=UTF-8");
        
        String body = "{\"code\":401,\"message\":\"未授权\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        
        return response.writeWith(Mono.just(buffer));
    }
    
    @Override
    public int getOrder() {
        return -100;  // 认证过滤器优先级很高
    }
}
```

### 3.3 限流过滤器

```java
@Component
@Slf4j
public class RateLimitGlobalFilter implements GlobalFilter, Ordered {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private static final int LIMIT = 100;  // 每分钟100次
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String ip = getClientIp(exchange.getRequest());
        String key = "rate_limit:" + ip;
        
        return Mono.fromCallable(() -> {
            Long count = redisTemplate.opsForValue().increment(key);
            
            if (count == 1) {
                redisTemplate.expire(key, 1, TimeUnit.MINUTES);
            }
            
            return count;
        })
        .flatMap(count -> {
            if (count > LIMIT) {
                return tooManyRequests(exchange);
            }
            return chain.filter(exchange);
        });
    }
    
    private String getClientIp(ServerHttpRequest request) {
        HttpHeaders headers = request.getHeaders();
        
        String ip = headers.getFirst("X-Forwarded-For");
        if (ip != null && !ip.isEmpty()) {
            return ip.split(",")[0].trim();
        }
        
        ip = headers.getFirst("X-Real-IP");
        if (ip != null && !ip.isEmpty()) {
            return ip;
        }
        
        return request.getRemoteAddress().getAddress().getHostAddress();
    }
    
    private Mono<Void> tooManyRequests(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        
        String body = "{\"code\":429,\"message\":\"请求过于频繁\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        
        return response.writeWith(Mono.just(buffer));
    }
    
    @Override
    public int getOrder() {
        return -50;
    }
}
```

---

## 4. Filter 执行顺序

### 4.1 Order 值规则

```
Order 值越小，优先级越高

常见Order值：
- -100：认证过滤器
- -50：限流过滤器
- -1：日志过滤器
- 0：默认值
- 100：业务过滤器
```

### 4.2 执行顺序示例

```java
@Component
public class Filter1 implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Filter1 pre");
        return chain.filter(exchange)
            .then(Mono.fromRunnable(() -> log.info("Filter1 post")));
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
}

@Component
public class Filter2 implements GlobalFilter, Ordered {
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
```

**执行顺序**：

```
Filter1 pre（Order=-100）
Filter2 pre（Order=-50）
↓ 调用下游服务
Filter2 post（Order=-50）
Filter1 post（Order=-100）
```

### 4.3 内置过滤器Order

| 过滤器 | Order |
|--------|-------|
| NettyWriteResponseFilter | -1 |
| ForwardPathFilter | 0 |
| RouteToRequestUrlFilter | 10000 |
| LoadBalancerClientFilter | 10100 |
| WebsocketRoutingFilter | Integer.MAX_VALUE - 1 |
| NettyRoutingFilter | Integer.MAX_VALUE |
| ForwardRoutingFilter | Integer.MAX_VALUE |

---

## 5. 自定义 Filter 开发

### 5.1 自定义 GatewayFilterFactory

```java
@Component
public class CustomGatewayFilterFactory 
        extends AbstractGatewayFilterFactory<CustomGatewayFilterFactory.Config> {
    
    public CustomGatewayFilterFactory() {
        super(Config.class);
    }
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            log.info("自定义过滤器：{}", config.getMessage());
            
            // 添加自定义请求头
            ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-Custom-Header", config.getMessage())
                .build();
            
            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }
    
    @Data
    public static class Config {
        private String message;
    }
}
```

**使用配置**：

```yaml
filters:
  - name: Custom
    args:
      message: Hello Gateway
```

### 5.2 响应修改过滤器

```java
@Component
@Slf4j
public class ResponseWrapperFilterFactory 
        extends AbstractGatewayFilterFactory<Object> {
    
    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> {
            ServerHttpResponse originalResponse = exchange.getResponse();
            DataBufferFactory bufferFactory = originalResponse.bufferFactory();
            
            ServerHttpResponseDecorator decoratedResponse = 
                new ServerHttpResponseDecorator(originalResponse) {
                
                @Override
                public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                    if (body instanceof Flux) {
                        Flux<? extends DataBuffer> fluxBody = (Flux<? extends DataBuffer>) body;
                        
                        return super.writeWith(fluxBody.map(dataBuffer -> {
                            byte[] content = new byte[dataBuffer.readableByteCount()];
                            dataBuffer.read(content);
                            DataBufferUtils.release(dataBuffer);
                            
                            String responseBody = new String(content, StandardCharsets.UTF_8);
                            log.info("响应体：{}", responseBody);
                            
                            // 包装响应
                            String wrappedBody = wrapResponse(responseBody);
                            
                            return bufferFactory.wrap(wrappedBody.getBytes());
                        }));
                    }
                    
                    return super.writeWith(body);
                }
            };
            
            return chain.filter(exchange.mutate().response(decoratedResponse).build());
        };
    }
    
    private String wrapResponse(String body) {
        return "{\"code\":200,\"data\":" + body + "}";
    }
}
```

---

## 6. Filter 最佳实践

### 6.1 过滤器职责分离

```
认证过滤器：只负责认证
鉴权过滤器：只负责权限检查
限流过滤器：只负责限流
日志过滤器：只负责日志记录

遵循单一职责原则
```

### 6.2 过滤器异常处理

```java
@Component
public class SafeGlobalFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange)
            .onErrorResume(throwable -> {
                log.error("过滤器执行异常", throwable);
                
                // 返回友好错误信息
                ServerHttpResponse response = exchange.getResponse();
                response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
                
                String body = "{\"code\":500,\"message\":\"服务异常\"}";
                DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
                
                return response.writeWith(Mono.just(buffer));
            });
    }
    
    @Override
    public int getOrder() {
        return 0;
    }
}
```

### 6.3 性能优化

```java
// ❌ 错误：阻塞操作
@Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    // 阻塞调用Redis
    String value = redisTemplate.opsForValue().get("key");
    return chain.filter(exchange);
}

// ✅ 正确：响应式操作
@Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    return Mono.fromCallable(() -> {
        // 异步调用Redis
        return redisTemplate.opsForValue().get("key");
    })
    .flatMap(value -> chain.filter(exchange));
}
```

---

## 7. 面试要点

**Q1：Filter 有哪两种类型？**

1. GatewayFilter：局部过滤器，作用于单个路由
2. GlobalFilter：全局过滤器，作用于所有路由

**Q2：Filter 的执行顺序如何控制？**

通过 `Ordered` 接口的 `getOrder()` 方法，值越小优先级越高。

**Q3：如何自定义 Filter？**

1. 实现 GlobalFilter 接口
2. 或继承 AbstractGatewayFilterFactory
3. 使用 @Component 注册
4. 实现 Ordered 接口控制顺序

**Q4：Filter 和拦截器的区别？**

- Filter：Gateway 层面，处理所有请求
- 拦截器：微服务内部，处理Controller请求

---

**下一章预告**：第 22 章将学习 Gateway 限流熔断与鉴权，包括 RequestRateLimiter 限流配置、令牌桶限流算法、Redis 限流实现、熔断降级集成、统一鉴权方案等内容。

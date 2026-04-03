# 第 15 章：Feign 自定义配置详解

> **学习目标**：掌握 Feign 核心配置项、理解 Feign 扩展点、能够根据场景自定义 Feign 配置  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. Feign 核心配置项详解

### 1.1 全局配置 vs 服务级配置

**全局配置（application.yml）**：

```yaml
feign:
  client:
    config:
      default:  # 全局配置，适用于所有Feign客户端
        connectTimeout: 5000
        readTimeout: 10000
        loggerLevel: BASIC
```

**服务级配置**：

```yaml
feign:
  client:
    config:
      user-service:  # 只针对user-service的配置
        connectTimeout: 3000
        readTimeout: 5000
        loggerLevel: FULL
```

**配置优先级**：

```
服务级配置 > 全局配置 > 默认值
```

### 1.2 完整配置项列表

```yaml
feign:
  client:
    config:
      default:
        # 超时配置
        connectTimeout: 5000      # 连接超时（毫秒）
        readTimeout: 10000        # 读取超时（毫秒）
        
        # 日志级别
        loggerLevel: BASIC        # NONE/BASIC/HEADERS/FULL
        
        # 重试策略
        retryer: feign.Retryer.Default
        
        # 错误解码器
        errorDecoder: com.example.feign.CustomErrorDecoder
        
        # 请求拦截器
        requestInterceptors:
          - com.example.feign.AuthInterceptor
          - com.example.feign.LogInterceptor
        
        # 编解码器
        encoder: feign.jackson.JacksonEncoder
        decoder: feign.jackson.JacksonDecoder
        
        # 契约
        contract: feign.Contract.Default
        
        # 默认请求选项
        default-request-headers:
          Accept: application/json
          Content-Type: application/json
        
        # 默认查询参数
        default-query-parameters:
          version: v1
```

---

## 2. 超时配置（connectTimeout/readTimeout）

### 2.1 超时配置详解

**connectTimeout（连接超时）**：
- 建立TCP连接的最大时间
- 默认值：10秒
- 建议值：3-5秒

**readTimeout（读取超时）**：
- 从服务端读取响应的最大时间
- 默认值：60秒
- 建议值：根据业务场景调整

### 2.2 超时配置示例

**配置文件方式**：

```yaml
feign:
  client:
    config:
      # 快速响应的服务（如查询）
      user-service:
        connectTimeout: 3000
        readTimeout: 5000
      
      # 慢响应的服务（如报表生成）
      report-service:
        connectTimeout: 5000
        readTimeout: 30000
```

**Java配置方式**：

```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Request.Options options() {
        return new Request.Options(
            5, TimeUnit.SECONDS,   // 连接超时
            10, TimeUnit.SECONDS,  // 读取超时
            true                   // 是否跟随重定向
        );
    }
}
```

### 2.3 超时配置最佳实践

**根据调用链路设置超时**：

```
Gateway 超时 > Feign 超时 > 下游服务处理时间

示例：
Gateway：30秒
Feign：10秒
Service：5秒

确保超时时间逐层递减，避免请求堆积
```

---

## 3. 重试策略配置

### 3.1 默认重试策略

**Feign 默认重试**：

```java
public static class Default implements Retryer {
    private final int maxAttempts;        // 最大重试次数
    private final long period;            // 重试间隔
    private final long maxPeriod;         // 最大重试间隔
    int attempt;                          // 当前重试次数
    long sleptForMillis;                  // 已休眠时间
    
    public Default() {
        this(100, SECONDS.toMillis(1), 5);
    }
    
    public Default(long period, long maxPeriod, int maxAttempts) {
        this.period = period;
        this.maxPeriod = maxPeriod;
        this.maxAttempts = maxAttempts;
        this.attempt = 1;
    }
}
```

### 3.2 禁用重试

```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Retryer feignRetryer() {
        return Retryer.NEVER_RETRY;  // 禁用重试
    }
}
```

**配置文件方式**：

```yaml
feign:
  client:
    config:
      default:
        retryer: feign.Retryer$NEVER_RETRY
```

### 3.3 自定义重试策略

```java
public class CustomRetryer implements Retryer {
    
    private final int maxAttempts;
    private final long backoff;
    private int attempt;
    
    public CustomRetryer() {
        this(3, 1000L);
    }
    
    public CustomRetryer(int maxAttempts, long backoff) {
        this.maxAttempts = maxAttempts;
        this.backoff = backoff;
        this.attempt = 1;
    }
    
    @Override
    public void continueOrPropagate(RetryableException e) {
        if (attempt++ >= maxAttempts) {
            throw e;
        }
        
        // 指数退避
        long interval = (long) (backoff * Math.pow(2, attempt - 1));
        
        try {
            Thread.sleep(interval);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }
    
    @Override
    public Retryer clone() {
        return new CustomRetryer(maxAttempts, backoff);
    }
}
```

**重试最佳实践**：

```
⚠️ 重试注意事项：
1. 只对幂等操作重试（GET/PUT/DELETE）
2. 不要对 POST 操作重试（可能重复创建）
3. 设置合理的重试次数和间隔
4. 使用指数退避策略
5. 记录重试日志
```

---

## 4. 请求拦截器（RequestInterceptor）

### 4.1 内置拦截器

**BasicAuthRequestInterceptor（HTTP Basic认证）**：

```java
@Configuration
public class FeignConfig {
    
    @Bean
    public BasicAuthRequestInterceptor basicAuthRequestInterceptor() {
        return new BasicAuthRequestInterceptor("username", "password");
    }
}
```

### 4.2 自定义拦截器

**认证拦截器**：

```java
@Component
public class AuthRequestInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // 1. 从上下文获取Token
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String token = request.getHeader("Authorization");
            
            // 2. 传递Token到下游服务
            if (token != null) {
                template.header("Authorization", token);
            }
        }
    }
}
```

**请求ID拦截器**：

```java
@Component
public class RequestIdInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // 1. 生成或获取RequestID
        String requestId = MDC.get("requestId");
        if (requestId == null) {
            requestId = UUID.randomUUID().toString();
            MDC.put("requestId", requestId);
        }
        
        // 2. 添加到请求头
        template.header("X-Request-Id", requestId);
    }
}
```

**日志拦截器**：

```java
@Component
@Slf4j
public class LoggingRequestInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        log.info("Feign Request: {} {}", 
            template.method(), template.url());
        
        // 记录请求头
        template.headers().forEach((key, values) -> {
            log.debug("Request Header: {} = {}", key, values);
        });
    }
}
```

### 4.3 配置拦截器

**方式一：配置文件**：

```yaml
feign:
  client:
    config:
      default:
        requestInterceptors:
          - com.example.feign.AuthRequestInterceptor
          - com.example.feign.RequestIdInterceptor
```

**方式二：Java配置**：

```java
@Configuration
public class FeignConfig {
    
    @Bean
    public RequestInterceptor authInterceptor() {
        return new AuthRequestInterceptor();
    }
    
    @Bean
    public RequestInterceptor requestIdInterceptor() {
        return new RequestIdInterceptor();
    }
}
```

---

## 5. 日志级别配置（NONE/BASIC/HEADERS/FULL）

### 5.1 日志级别说明

| 级别 | 说明 | 输出内容 |
|------|------|---------|
| **NONE** | 不记录（默认） | 无 |
| **BASIC** | 基本信息 | 请求方法、URL、响应状态码、执行时间 |
| **HEADERS** | 请求和响应头 | BASIC + 请求头 + 响应头 |
| **FULL** | 完整信息 | HEADERS + 请求体 + 响应体 |

### 5.2 配置日志级别

**配置文件方式**：

```yaml
feign:
  client:
    config:
      default:
        loggerLevel: FULL

# 必须同时配置日志级别
logging:
  level:
    com.example.client.UserClient: DEBUG
```

**Java配置方式**：

```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}
```

### 5.3 日志输出示例

**BASIC 级别**：

```
[UserClient#getUser] ---> GET http://user-service/api/users/1 HTTP/1.1
[UserClient#getUser] <--- HTTP/1.1 200 (125ms)
```

**HEADERS 级别**：

```
[UserClient#getUser] ---> GET http://user-service/api/users/1 HTTP/1.1
[UserClient#getUser] Content-Type: application/json
[UserClient#getUser] Authorization: Bearer xxx
[UserClient#getUser] ---> END HTTP
[UserClient#getUser] <--- HTTP/1.1 200 (125ms)
[UserClient#getUser] Content-Type: application/json
[UserClient#getUser] <--- END HTTP
```

**FULL 级别**：

```
[UserClient#getUser] ---> GET http://user-service/api/users/1 HTTP/1.1
[UserClient#getUser] Content-Type: application/json
[UserClient#getUser] ---> END HTTP
[UserClient#getUser] <--- HTTP/1.1 200 (125ms)
[UserClient#getUser] Content-Type: application/json
[UserClient#getUser] {"id":1,"username":"zhangsan","email":"zhangsan@example.com"}
[UserClient#getUser] <--- END HTTP
```

**⚠️ 性能提示**：
- 生产环境建议使用 BASIC 或 NONE
- FULL 级别会记录请求体和响应体，影响性能
- 仅在调试时使用 FULL 级别

---

## 6. 编解码器配置（Encoder/Decoder）

### 6.1 默认编解码器

**Spring Boot 自动配置**：
- 引入 `spring-boot-starter-web` 后，默认使用 Jackson

### 6.2 自定义编码器

```java
public class CustomEncoder implements Encoder {
    
    private final ObjectMapper objectMapper;
    
    public CustomEncoder(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    @Override
    public void encode(Object object, Type bodyType, RequestTemplate template) 
            throws EncodeException {
        try {
            // 1. 序列化对象
            String json = objectMapper.writeValueAsString(object);
            
            // 2. 设置请求体
            template.body(json, StandardCharsets.UTF_8);
            
            // 3. 设置Content-Type
            template.header("Content-Type", "application/json;charset=UTF-8");
            
        } catch (JsonProcessingException e) {
            throw new EncodeException("序列化失败", e);
        }
    }
}
```

### 6.3 自定义解码器

```java
public class CustomDecoder implements Decoder {
    
    private final ObjectMapper objectMapper;
    
    public CustomDecoder(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }
    
    @Override
    public Object decode(Response response, Type type) 
            throws IOException, DecodeException, FeignException {
        
        // 1. 读取响应体
        if (response.body() == null) {
            return null;
        }
        
        Reader reader = response.body().asReader(StandardCharsets.UTF_8);
        String body = Util.toString(reader);
        
        // 2. 反序列化
        try {
            return objectMapper.readValue(body, objectMapper.constructType(type));
        } catch (IOException e) {
            throw new DecodeException(response.status(), "反序列化失败: " + body, response.request(), e);
        }
    }
}
```

### 6.4 配置编解码器

```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Encoder feignEncoder(ObjectMapper objectMapper) {
        return new CustomEncoder(objectMapper);
    }
    
    @Bean
    public Decoder feignDecoder(ObjectMapper objectMapper) {
        return new CustomDecoder(objectMapper);
    }
}
```

---

## 7. 降级配置（fallback/fallbackFactory）

### 7.1 fallback（简单降级）

```java
@Component
public class UserClientFallback implements UserClient {
    
    @Override
    public Result<User> getUser(Long id) {
        log.warn("用户服务降级，返回默认用户");
        return Result.success(createDefaultUser(id));
    }
    
    @Override
    public Result<List<User>> listUsers(int page, int size) {
        return Result.success(Collections.emptyList());
    }
    
    private User createDefaultUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setUsername("默认用户");
        return user;
    }
}

@FeignClient(name = "user-service", fallback = UserClientFallback.class)
public interface UserClient {
    @GetMapping("/api/users/{id}")
    Result<User> getUser(@PathVariable Long id);
    
    @GetMapping("/api/users")
    Result<List<User>> listUsers(@RequestParam int page, @RequestParam int size);
}
```

### 7.2 fallbackFactory（推荐）

```java
@Component
@Slf4j
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    
    @Override
    public UserClient create(Throwable cause) {
        return new UserClient() {
            
            @Override
            public Result<User> getUser(Long id) {
                log.error("查询用户失败，ID：{}，异常：{}", id, cause.getMessage());
                
                // 根据异常类型返回不同结果
                if (cause instanceof TimeoutException) {
                    return Result.fail("用户服务超时，请稍后重试");
                } else if (cause instanceof FeignException.NotFound) {
                    return Result.fail("用户不存在");
                } else if (cause instanceof FeignException.ServiceUnavailable) {
                    return Result.fail("用户服务暂时不可用");
                }
                
                return Result.fail("查询用户失败");
            }
            
            @Override
            public Result<List<User>> listUsers(int page, int size) {
                log.error("查询用户列表失败，异常：{}", cause.getMessage());
                return Result.success(Collections.emptyList());
            }
        };
    }
}

@FeignClient(name = "user-service", fallbackFactory = UserClientFallbackFactory.class)
public interface UserClient {
    // ...
}
```

### 7.3 启用降级

**配置Sentinel**：

```yaml
feign:
  sentinel:
    enabled: true  # 启用Sentinel降级
```

**或配置Resilience4j**：

```yaml
feign:
  circuitbreaker:
    enabled: true  # 启用Resilience4j降级
```

---

## 8. 契约配置（Contract）

### 8.1 默认契约

**Feign 支持三种契约**：

1. **Feign 原生契约**（feign.Contract.Default）
2. **Spring MVC 契约**（SpringMvcContract，默认）
3. **JAX-RS 契约**（JAXRSContract）

### 8.2 Spring MVC 契约（默认）

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    // 支持Spring MVC注解
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
    
    @PostMapping("/api/users")
    User createUser(@RequestBody UserDTO dto);
}
```

### 8.3 Feign 原生契约

```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Contract feignContract() {
        return new Contract.Default();  // 使用Feign原生契约
    }
}

// 使用Feign原生注解
@FeignClient(name = "user-service", configuration = FeignConfig.class)
public interface UserClient {
    
    @RequestLine("GET /api/users/{id}")
    User getUser(@Param("id") Long id);
    
    @RequestLine("POST /api/users")
    @Headers("Content-Type: application/json")
    User createUser(UserDTO dto);
}
```

---

## 9. 配置优先级

### 9.1 配置优先级顺序

```
1. @FeignClient 的 configuration 属性（最高）
2. application.yml 中的服务级配置
3. application.yml 中的全局配置
4. Feign 默认配置（最低）
```

### 9.2 配置覆盖示例

```java
// 1. @FeignClient配置（优先级最高）
@FeignClient(
    name = "user-service",
    configuration = UserServiceFeignConfig.class
)
public interface UserClient {
}

@Configuration
class UserServiceFeignConfig {
    @Bean
    public Logger.Level loggerLevel() {
        return Logger.Level.FULL;  // 覆盖其他配置
    }
}
```

```yaml
# 2. 服务级配置（优先级次之）
feign:
  client:
    config:
      user-service:
        loggerLevel: HEADERS  # 被@FeignClient配置覆盖
      
      # 3. 全局配置（优先级最低）
      default:
        loggerLevel: BASIC
```

### 9.3 配置最佳实践

**推荐配置结构**：

```
1. 全局配置：放在 application.yml
   - 通用超时时间
   - 通用拦截器
   - 通用日志级别

2. 服务级配置：放在 application.yml
   - 特殊服务的超时时间
   - 特殊服务的日志级别

3. @FeignClient配置：仅用于特殊场景
   - 自定义编解码器
   - 特殊的降级处理
```

---

## 10. 面试要点

### 10.1 基础问题

**Q1：Feign 有哪些核心配置项？**

- 超时配置（connectTimeout/readTimeout）
- 重试策略（Retryer）
- 日志级别（loggerLevel）
- 编解码器（Encoder/Decoder）
- 请求拦截器（RequestInterceptor）
- 降级配置（fallback/fallbackFactory）

**Q2：如何配置 Feign 超时？**

```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 10000
```

### 10.2 进阶问题

**Q3：fallback 和 fallbackFactory 的区别？**

- fallback：简单降级，无法获取异常信息
- fallbackFactory：可以获取异常信息，根据异常类型返回不同结果

**Q4：Feign 配置的优先级是什么？**

```
@FeignClient配置 > 服务级配置 > 全局配置 > 默认配置
```

### 10.3 架构问题

**Q5：如何实现 Feign 的链路追踪？**

1. 使用 RequestInterceptor 添加 TraceId
2. 从 MDC 获取 TraceId
3. 添加到请求头
4. 下游服务提取并继续传递

**Q6：Feign 重试有什么注意事项？**

1. 只对幂等操作重试
2. 不要对 POST 重试（避免重复创建）
3. 设置合理的重试次数和间隔
4. 使用指数退避策略

---

## 11. 参考资料

**官方文档**：
- [OpenFeign GitHub](https://github.com/OpenFeign/feign)
- [Spring Cloud OpenFeign](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/)

**配置参考**：
- [Feign Configuration](https://cloud.spring.io/spring-cloud-openfeign/reference/html/#spring-cloud-feign)

---

**下一章预告**：第 16 章将深入学习 Feign 动态代理原理，包括 @FeignClient 注解处理、FeignClientFactoryBean 源码、动态代理生成原理、RequestTemplate 构建等内容。

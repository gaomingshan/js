# 第17章：OpenFeign 高级配置

> **本章目标**：掌握 Feign 的高级配置，包括超时、日志、编解码器、HTTP 客户端替换、拦截器等

---

## 1. 超时配置

### 1.1 全局超时配置

**配置文件**：
```yaml
feign:
  client:
    config:
      default:  # 全局配置
        connectTimeout: 5000  # 连接超时（毫秒）
        readTimeout: 10000    # 读取超时（毫秒）
```

**代码配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Request.Options options() {
        return new Request.Options(
            5000,   // 连接超时（毫秒）
            10000   // 读取超时（毫秒）
        );
    }
}
```

---

### 1.2 针对特定服务配置

**配置文件**：
```yaml
feign:
  client:
    config:
      user-service:  # 针对 user-service
        connectTimeout: 3000
        readTimeout: 8000
      
      product-service:  # 针对 product-service
        connectTimeout: 2000
        readTimeout: 5000
```

**代码配置**：
```java
@Configuration
public class UserServiceFeignConfig {
    
    @Bean
    public Request.Options options() {
        return new Request.Options(3000, 8000);
    }
}

@FeignClient(
    name = "user-service",
    configuration = UserServiceFeignConfig.class
)
public interface UserClient {
}
```

---

### 1.3 超时配置优先级

**优先级**（高到低）：
```
1. 代码配置（@FeignClient(configuration = ...)）
2. 配置文件（针对特定服务）
3. 配置文件（全局配置 default）
4. 默认值（连接超时10秒，读取超时60秒）
```

---

## 2. 日志配置

### 2.1 日志级别

**Feign 日志级别**：
- **NONE**：不记录日志（默认）
- **BASIC**：仅记录请求方法、URL、响应状态码、执行时间
- **HEADERS**：记录 BASIC + 请求和响应头
- **FULL**：记录 BASIC + HEADERS + 请求和响应体

---

### 2.2 全局日志配置

**代码配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}
```

**配置文件**：
```yaml
feign:
  client:
    config:
      default:
        loggerLevel: FULL
```

**开启日志**：
```yaml
logging:
  level:
    com.demo.order.client: DEBUG  # Feign 客户端包路径
```

---

### 2.3 针对特定服务配置

**代码配置**：
```java
@Configuration
public class UserServiceFeignConfig {
    
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}

@FeignClient(
    name = "user-service",
    configuration = UserServiceFeignConfig.class
)
public interface UserClient {
}
```

**配置文件**：
```yaml
feign:
  client:
    config:
      user-service:
        loggerLevel: FULL

logging:
  level:
    com.demo.order.client.UserClient: DEBUG
```

---

### 2.4 日志输出示例

**BASIC**：
```
[UserClient#getUser] ---> GET http://user-service/user/1 HTTP/1.1
[UserClient#getUser] <--- HTTP/1.1 200 (125ms)
```

**HEADERS**：
```
[UserClient#getUser] ---> GET http://user-service/user/1 HTTP/1.1
[UserClient#getUser] Content-Type: application/json
[UserClient#getUser] Accept: application/json
[UserClient#getUser] ---> END HTTP (0-byte body)
[UserClient#getUser] <--- HTTP/1.1 200 (125ms)
[UserClient#getUser] Content-Type: application/json
[UserClient#getUser] Content-Length: 52
[UserClient#getUser] <--- END HTTP (52-byte body)
```

**FULL**：
```
[UserClient#getUser] ---> GET http://user-service/user/1 HTTP/1.1
[UserClient#getUser] Content-Type: application/json
[UserClient#getUser] Accept: application/json
[UserClient#getUser] ---> END HTTP (0-byte body)
[UserClient#getUser] <--- HTTP/1.1 200 (125ms)
[UserClient#getUser] Content-Type: application/json
[UserClient#getUser] Content-Length: 52
[UserClient#getUser] {"id":1,"name":"zhangsan","age":18,"email":"xxx@qq.com"}
[UserClient#getUser] <--- END HTTP (52-byte body)
```

---

## 3. 编解码器配置

### 3.1 默认编解码器

**Spring Cloud 默认配置**：
- **Encoder**：SpringEncoder（使用 HttpMessageConverter）
- **Decoder**：SpringDecoder（使用 HttpMessageConverter）

**支持的格式**：
- JSON（Jackson）
- XML（JAXB）
- Form（表单）

---

### 3.2 自定义编解码器

**场景**：使用 Gson 代替 Jackson。

**引入依赖**：
```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
</dependency>
```

**配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Encoder feignEncoder() {
        return new GsonEncoder();
    }
    
    @Bean
    public Decoder feignDecoder() {
        return new GsonDecoder();
    }
}
```

---

### 3.3 自定义响应解码

**场景**：统一响应格式。

**响应格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "zhangsan"
  }
}
```

**响应包装类**：
```java
@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
}
```

**Feign 客户端**：
```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/user/{id}")
    Result<UserDTO> getUser(@PathVariable("id") Long id);
}
```

**使用**：
```java
Result<UserDTO> result = userClient.getUser(1L);
if (result.getCode() == 200) {
    UserDTO user = result.getData();
}
```

---

## 4. HTTP 客户端替换

### 4.1 默认客户端（HttpURLConnection）

**特点**：
- JDK 自带
- 性能一般
- 不支持连接池

---

### 4.2 替换为 HttpClient

**引入依赖**：
```xml
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-httpclient</artifactId>
</dependency>
```

**配置**：
```yaml
feign:
  httpclient:
    enabled: true  # 启用 HttpClient
    max-connections: 200  # 最大连接数
    max-connections-per-route: 50  # 每个路由的最大连接数
    connection-timeout: 2000  # 连接超时
    connection-timer-repeat: 3000  # 连接池清理间隔
```

**代码配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public CloseableHttpClient httpClient() {
        PoolingHttpClientConnectionManager connectionManager = 
            new PoolingHttpClientConnectionManager();
        
        // 最大连接数
        connectionManager.setMaxTotal(200);
        
        // 每个路由的最大连接数
        connectionManager.setDefaultMaxPerRoute(50);
        
        // 配置超时
        RequestConfig requestConfig = RequestConfig.custom()
            .setConnectTimeout(2000)
            .setSocketTimeout(5000)
            .build();
        
        return HttpClients.custom()
            .setConnectionManager(connectionManager)
            .setDefaultRequestConfig(requestConfig)
            .build();
    }
}
```

---

### 4.3 替换为 OkHttp

**引入依赖**：
```xml
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
</dependency>
```

**配置**：
```yaml
feign:
  okhttp:
    enabled: true
  httpclient:
    enabled: false  # 禁用 HttpClient
```

**代码配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
            .connectTimeout(2, TimeUnit.SECONDS)
            .readTimeout(5, TimeUnit.SECONDS)
            .connectionPool(new ConnectionPool(200, 5, TimeUnit.MINUTES))
            .build();
    }
}
```

---

### 4.4 HTTP 客户端对比

| 客户端 | 性能 | 连接池 | 推荐度 |
|--------|------|--------|--------|
| **HttpURLConnection** | 低 | 不支持 | ⭐ |
| **HttpClient** | 中 | 支持 | ⭐⭐⭐⭐ |
| **OkHttp** | 高 | 支持 | ⭐⭐⭐⭐⭐ |

**推荐**：生产环境使用 OkHttp 或 HttpClient。

---

## 5. 请求拦截器

### 5.1 统一请求头

**实现**：
```java
@Component
public class FeignRequestInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // 添加统一请求头
        template.header("X-Request-Id", UUID.randomUUID().toString());
        template.header("X-Timestamp", String.valueOf(System.currentTimeMillis()));
        
        // 从上下文获取 Token
        String token = getTokenFromContext();
        if (token != null) {
            template.header("Authorization", "Bearer " + token);
        }
    }
    
    private String getTokenFromContext() {
        // 从 ThreadLocal 或 Spring Security 获取 Token
        return "token";
    }
}
```

**配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public RequestInterceptor requestInterceptor() {
        return new FeignRequestInterceptor();
    }
}
```

---

### 5.2 传递请求头

**场景**：将当前请求的某些请求头传递给下游服务。

**实现**：
```java
@Component
public class HeaderPropagationInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // 获取当前请求
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            
            // 传递特定请求头
            String traceId = request.getHeader("X-Trace-Id");
            if (traceId != null) {
                template.header("X-Trace-Id", traceId);
            }
            
            String userId = request.getHeader("X-User-Id");
            if (userId != null) {
                template.header("X-User-Id", userId);
            }
        }
    }
}
```

---

### 5.3 请求签名

**实现**：
```java
@Component
public class SignInterceptor implements RequestInterceptor {
    
    private static final String SECRET_KEY = "my-secret-key";
    
    @Override
    public void apply(RequestTemplate template) {
        // 获取请求参数
        String method = template.method();
        String url = template.url();
        String body = template.body() != null ? new String(template.body()) : "";
        
        // 计算签名
        String sign = calculateSign(method + url + body);
        
        // 添加签名
        template.header("X-Sign", sign);
        template.header("X-Timestamp", String.valueOf(System.currentTimeMillis()));
    }
    
    private String calculateSign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Sign failed", e);
        }
    }
}
```

---

## 6. 重试机制

### 6.1 默认重试配置

**Feign 默认不重试**。

---

### 6.2 开启重试

**配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Retryer feignRetryer() {
        // 最大重试次数 5 次，初始间隔 100ms，最大间隔 1s
        return new Retryer.Default(100, 1000, 5);
    }
}
```

**参数说明**：
- **period**：重试间隔（毫秒）
- **maxPeriod**：最大重试间隔（毫秒）
- **maxAttempts**：最大重试次数

---

### 6.3 自定义重试策略

**实现**：
```java
public class CustomRetryer implements Retryer {
    
    private final int maxAttempts;
    private int attempt;
    
    public CustomRetryer(int maxAttempts) {
        this.maxAttempts = maxAttempts;
        this.attempt = 1;
    }
    
    @Override
    public void continueOrPropagate(RetryableException e) {
        if (attempt++ >= maxAttempts) {
            throw e;
        }
        
        // 只重试特定异常
        if (e.getCause() instanceof SocketTimeoutException) {
            // 重试
            try {
                Thread.sleep(1000);
            } catch (InterruptedException ex) {
                throw e;
            }
        } else {
            // 不重试
            throw e;
        }
    }
    
    @Override
    public Retryer clone() {
        return new CustomRetryer(maxAttempts);
    }
}
```

**配置**：
```java
@Bean
public Retryer feignRetryer() {
    return new CustomRetryer(3);
}
```

---

### 6.4 禁用重试

**配置**：
```java
@Bean
public Retryer feignRetryer() {
    return Retryer.NEVER_RETRY;
}
```

---

## 7. 错误解码器

### 7.1 默认错误处理

**Feign 默认错误处理**：
- HTTP 状态码 >= 400：抛出 FeignException

---

### 7.2 自定义错误解码器

**实现**：
```java
public class CustomErrorDecoder implements ErrorDecoder {
    
    @Override
    public Exception decode(String methodKey, Response response) {
        if (response.status() >= 400 && response.status() < 500) {
            // 客户端错误
            return new BusinessException("Client error: " + response.status());
        }
        
        if (response.status() >= 500) {
            // 服务端错误
            return new ServiceException("Server error: " + response.status());
        }
        
        return new FeignException.FeignClientException(
            response.status(),
            "Unknown error",
            response.request(),
            response.body() != null ? response.body().asInputStream() : null,
            response.headers()
        );
    }
}
```

**配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public ErrorDecoder errorDecoder() {
        return new CustomErrorDecoder();
    }
}
```

---

### 7.3 解析错误响应

**实现**：
```java
public class CustomErrorDecoder implements ErrorDecoder {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public Exception decode(String methodKey, Response response) {
        try {
            // 读取响应体
            String body = Util.toString(response.body().asReader(StandardCharsets.UTF_8));
            
            // 解析错误信息
            ErrorResponse error = objectMapper.readValue(body, ErrorResponse.class);
            
            // 根据错误码抛出不同异常
            if (error.getCode() == 404) {
                return new NotFoundException(error.getMessage());
            }
            
            if (error.getCode() == 403) {
                return new ForbiddenException(error.getMessage());
            }
            
            return new BusinessException(error.getMessage());
        } catch (IOException e) {
            return new FeignException.FeignClientException(
                response.status(),
                "Failed to parse error response",
                response.request(),
                null,
                response.headers()
            );
        }
    }
}

@Data
class ErrorResponse {
    private Integer code;
    private String message;
}
```

---

## 8. 压缩配置

### 8.1 请求压缩

**配置**：
```yaml
feign:
  compression:
    request:
      enabled: true
      mime-types: text/xml,application/xml,application/json  # 压缩的 MIME 类型
      min-request-size: 2048  # 最小压缩大小（字节）
```

---

### 8.2 响应压缩

**配置**：
```yaml
feign:
  compression:
    response:
      enabled: true
      useGzipDecoder: true
```

---

## 9. 契约配置

### 9.1 默认契约

**Spring Cloud 默认使用 SpringMvcContract**：
- 支持 Spring MVC 注解（@GetMapping、@PostMapping 等）

---

### 9.2 使用 Feign 原生注解

**配置**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Contract feignContract() {
        return new Contract.Default();
    }
}
```

**Feign 客户端**：
```java
@FeignClient(name = "user-service", configuration = FeignConfig.class)
public interface UserClient {
    
    @RequestLine("GET /user/{id}")
    UserDTO getUser(@Param("id") Long id);
    
    @RequestLine("POST /user")
    @Headers("Content-Type: application/json")
    UserDTO createUser(UserDTO userDTO);
}
```

---

## 10. 实际落地场景

### 10.1 场景1：统一超时配置

**配置**：
```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 2000
        readTimeout: 5000
      
      slow-service:  # 慢服务单独配置
        connectTimeout: 5000
        readTimeout: 15000
```

---

### 10.2 场景2：生产环境日志配置

**配置**：
```yaml
# 开发环境：FULL
# 测试环境：HEADERS
# 生产环境：BASIC

feign:
  client:
    config:
      default:
        loggerLevel: BASIC

logging:
  level:
    com.demo.order.client: INFO  # 生产环境 INFO
```

---

### 10.3 场景3：性能优化配置

**配置**：
```yaml
feign:
  httpclient:
    enabled: true
    max-connections: 200
    max-connections-per-route: 50
  
  compression:
    request:
      enabled: true
      min-request-size: 2048
    response:
      enabled: true
```

---

## 11. 学习自检清单

- [ ] 掌握超时配置（全局、特定服务）
- [ ] 掌握日志配置和日志级别
- [ ] 理解编解码器原理
- [ ] 掌握 HTTP 客户端替换（HttpClient、OkHttp）
- [ ] 能够实现请求拦截器（统一请求头、请求签名）
- [ ] 掌握重试机制配置
- [ ] 能够自定义错误解码器
- [ ] 掌握压缩配置
- [ ] 理解契约配置

**学习建议**：
- **预计学习时长**：3-4 小时
- **重点难点**：HTTP 客户端替换、拦截器、错误解码器
- **前置知识**：第16章 OpenFeign 快速入门
- **实践建议**：替换 HTTP 客户端、实现请求拦截器

---

**本章小结**：
- 超时配置：全局配置 default，特定服务配置，优先级：代码 > 特定服务 > 全局 > 默认
- 日志配置：NONE、BASIC、HEADERS、FULL，需配合 logging.level
- 编解码器：默认 SpringEncoder/SpringDecoder，可自定义
- HTTP 客户端：默认 HttpURLConnection，推荐替换为 OkHttp 或 HttpClient
- 请求拦截器：统一请求头、传递请求头、请求签名
- 重试机制：默认不重试，可配置 Retryer
- 错误解码器：自定义错误处理逻辑
- 压缩配置：请求压缩、响应压缩

**下一章预告**：第18章将介绍 Feign 性能优化，包括连接池优化、超时优化、序列化优化、日志优化、批量调用优化、缓存策略。

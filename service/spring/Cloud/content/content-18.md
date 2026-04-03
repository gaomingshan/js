# 第 18 章：Feign 最佳实践与故障排查

> **学习目标**：掌握 Feign 生产最佳实践、理解 Feign 异常处理机制、能够排查 Feign 常见问题  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. Feign 降级处理最佳实践

### 1.1 FallbackFactory vs Fallback

**Fallback（简单降级）**：

```java
@Component
public class UserClientFallback implements UserClient {
    
    @Override
    public Result<User> getUser(Long id) {
        // ❌ 无法获取异常信息
        return Result.fail("用户服务不可用");
    }
}

@FeignClient(name = "user-service", fallback = UserClientFallback.class)
public interface UserClient {
    @GetMapping("/api/users/{id}")
    Result<User> getUser(@PathVariable Long id);
}
```

**FallbackFactory（推荐）**：

```java
@Component
@Slf4j
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    
    @Override
    public UserClient create(Throwable cause) {
        return new UserClient() {
            
            @Override
            public Result<User> getUser(Long id) {
                log.error("查询用户失败，ID：{}，原因：{}", id, cause.getMessage());
                
                // ✅ 根据异常类型返回不同结果
                if (cause instanceof TimeoutException) {
                    return Result.fail("用户服务超时，请稍后重试");
                } else if (cause instanceof FeignException.NotFound) {
                    return Result.fail("用户不存在");
                } else if (cause instanceof FeignException.ServiceUnavailable) {
                    return Result.fail("用户服务暂时不可用");
                }
                
                return Result.fail("查询用户失败");
            }
        };
    }
}

@FeignClient(name = "user-service", fallbackFactory = UserClientFallbackFactory.class)
public interface UserClient {
    @GetMapping("/api/users/{id}")
    Result<User> getUser(@PathVariable Long id);
}
```

### 1.2 降级策略设计

**返回默认值**：

```java
@Override
public Result<User> getUser(Long id) {
    User defaultUser = new User();
    defaultUser.setId(id);
    defaultUser.setUsername("默认用户");
    defaultUser.setAvatar("https://cdn.example.com/default-avatar.png");
    
    return Result.success(defaultUser);
}
```

**返回缓存数据**：

```java
@Component
@RequiredArgsConstructor
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    
    private final RedisTemplate<String, User> redisTemplate;
    
    @Override
    public UserClient create(Throwable cause) {
        return new UserClient() {
            
            @Override
            public Result<User> getUser(Long id) {
                log.warn("用户服务降级，尝试从缓存获取，ID：{}", id);
                
                // 从Redis缓存获取
                String cacheKey = "user:" + id;
                User cachedUser = redisTemplate.opsForValue().get(cacheKey);
                
                if (cachedUser != null) {
                    log.info("从缓存获取用户成功，ID：{}", id);
                    return Result.success(cachedUser);
                }
                
                return Result.fail("用户服务不可用且缓存中无数据");
            }
        };
    }
}
```

**返回空列表**：

```java
@Override
public Result<List<User>> listUsers(int page, int size) {
    log.warn("查询用户列表失败，返回空列表");
    return Result.success(Collections.emptyList());
}
```

---

## 2. Feign 异常处理

### 2.1 ErrorDecoder 自定义

```java
@Component
public class CustomErrorDecoder implements ErrorDecoder {
    
    private final ErrorDecoder defaultErrorDecoder = new Default();
    
    @Override
    public Exception decode(String methodKey, Response response) {
        // 1. 获取响应状态码
        int status = response.status();
        
        // 2. 读取响应体
        String body = null;
        try {
            if (response.body() != null) {
                body = Util.toString(response.body().asReader(StandardCharsets.UTF_8));
            }
        } catch (IOException e) {
            // 忽略
        }
        
        // 3. 根据状态码返回不同异常
        switch (status) {
            case 400:
                return new BadRequestException("请求参数错误: " + body);
            case 401:
                return new UnauthorizedException("未授权: " + body);
            case 403:
                return new ForbiddenException("无权限访问: " + body);
            case 404:
                return new NotFoundException("资源不存在: " + body);
            case 500:
                return new InternalServerErrorException("服务内部错误: " + body);
            case 503:
                return new ServiceUnavailableException("服务不可用: " + body);
            default:
                return defaultErrorDecoder.decode(methodKey, response);
        }
    }
}

// 自定义异常
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
```

### 2.2 全局异常处理

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    /**
     * Feign 调用异常处理
     */
    @ExceptionHandler(FeignException.class)
    public Result<?> handleFeignException(FeignException e) {
        log.error("Feign调用异常：{}", e.getMessage());
        
        int status = e.status();
        
        if (status == 404) {
            return Result.fail("请求的资源不存在");
        } else if (status == 500) {
            return Result.fail("服务内部错误，请稍后重试");
        } else if (status == 503) {
            return Result.fail("服务暂时不可用，请稍后重试");
        }
        
        return Result.fail("服务调用失败：" + e.getMessage());
    }
    
    /**
     * 超时异常处理
     */
    @ExceptionHandler(TimeoutException.class)
    public Result<?> handleTimeoutException(TimeoutException e) {
        log.error("服务调用超时：{}", e.getMessage());
        return Result.fail("服务响应超时，请稍后重试");
    }
    
    /**
     * 自定义异常处理
     */
    @ExceptionHandler(NotFoundException.class)
    public Result<?> handleNotFoundException(NotFoundException e) {
        log.warn("资源不存在：{}", e.getMessage());
        return Result.fail(e.getMessage());
    }
}
```

---

## 3. 请求头传递（链路追踪ID/用户信息）

### 3.1 链路追踪 ID 传递

**RequestInterceptor 实现**：

```java
@Component
public class TraceIdInterceptor implements RequestInterceptor {
    
    private static final String TRACE_ID_HEADER = "X-Trace-Id";
    
    @Override
    public void apply(RequestTemplate template) {
        // 1. 从 MDC 获取 TraceId
        String traceId = MDC.get("traceId");
        
        // 2. 如果不存在，生成新的 TraceId
        if (traceId == null) {
            traceId = UUID.randomUUID().toString().replace("-", "");
            MDC.put("traceId", traceId);
        }
        
        // 3. 添加到请求头
        template.header(TRACE_ID_HEADER, traceId);
    }
}
```

**下游服务提取 TraceId**：

```java
@Component
public class TraceIdFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                     HttpServletResponse response,
                                     FilterChain filterChain) 
            throws ServletException, IOException {
        
        // 1. 从请求头提取 TraceId
        String traceId = request.getHeader("X-Trace-Id");
        
        // 2. 如果不存在，生成新的 TraceId
        if (traceId == null || traceId.isEmpty()) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }
        
        // 3. 放入 MDC
        MDC.put("traceId", traceId);
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            // 4. 清理 MDC
            MDC.clear();
        }
    }
}
```

### 3.2 用户信息传递

**RequestInterceptor 实现**：

```java
@Component
public class UserContextInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // 1. 从 SecurityContext 获取用户信息
        Authentication authentication = SecurityContextHolder.getContext()
            .getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            // 2. 提取用户ID和用户名
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String userId = userDetails.getUsername();
            
            // 3. 添加到请求头
            template.header("X-User-Id", userId);
            template.header("X-User-Name", userDetails.getUsername());
            
            // 4. 传递 Token
            Object credentials = authentication.getCredentials();
            if (credentials != null) {
                template.header("Authorization", "Bearer " + credentials);
            }
        }
    }
}
```

### 3.3 请求上下文传递

**自定义 RequestContext**：

```java
public class RequestContext {
    
    private static final ThreadLocal<Map<String, String>> CONTEXT = 
        ThreadLocal.withInitial(HashMap::new);
    
    public static void set(String key, String value) {
        CONTEXT.get().put(key, value);
    }
    
    public static String get(String key) {
        return CONTEXT.get().get(key);
    }
    
    public static Map<String, String> getAll() {
        return new HashMap<>(CONTEXT.get());
    }
    
    public static void clear() {
        CONTEXT.remove();
    }
}

@Component
public class RequestContextInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // 传递所有上下文信息
        Map<String, String> context = RequestContext.getAll();
        
        context.forEach((key, value) -> {
            template.header("X-Context-" + key, value);
        });
    }
}
```

---

## 4. 文件上传下载

### 4.1 文件上传

**引入依赖**：

```xml
<dependency>
    <groupId>io.github.openfeign.form</groupId>
    <artifactId>feign-form</artifactId>
    <version>3.8.0</version>
</dependency>
<dependency>
    <groupId>io.github.openfeign.form</groupId>
    <artifactId>feign-form-spring</artifactId>
    <version>3.8.0</version>
</dependency>
```

**配置 Encoder**：

```java
@Configuration
public class FeignMultipartConfig {
    
    @Bean
    public Encoder feignFormEncoder() {
        return new SpringFormEncoder(new SpringEncoder(new ObjectFactory<HttpMessageConverters>() {
            @Override
            public HttpMessageConverters getObject() {
                return new HttpMessageConverters(new RestTemplate().getMessageConverters());
            }
        }));
    }
}
```

**Feign 接口**：

```java
@FeignClient(name = "file-service", configuration = FeignMultipartConfig.class)
public interface FileClient {
    
    @PostMapping(value = "/api/files/upload", 
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Result<String> uploadFile(@RequestPart("file") MultipartFile file,
                              @RequestParam("type") String type,
                              @RequestParam("description") String description);
}
```

**使用示例**：

```java
@RestController
@RequiredArgsConstructor
public class FileController {
    
    private final FileClient fileClient;
    
    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        return fileClient.uploadFile(file, "image", "用户上传的图片");
    }
}
```

### 4.2 文件下载

**Feign 接口**：

```java
@FeignClient(name = "file-service")
public interface FileClient {
    
    @GetMapping("/api/files/{id}")
    Response downloadFile(@PathVariable String id);
}
```

**使用示例**：

```java
@RestController
@RequiredArgsConstructor
public class FileController {
    
    private final FileClient fileClient;
    
    @GetMapping("/download/{id}")
    public void download(@PathVariable String id, HttpServletResponse response) 
            throws IOException {
        
        // 1. 调用 Feign 下载文件
        Response feignResponse = fileClient.downloadFile(id);
        
        // 2. 获取响应体
        Response.Body body = feignResponse.body();
        
        // 3. 设置响应头
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", 
            "attachment; filename=" + id + ".file");
        
        // 4. 写入响应
        try (InputStream inputStream = body.asInputStream();
             OutputStream outputStream = response.getOutputStream()) {
            
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            outputStream.flush();
        }
    }
}
```

---

## 5. 常见问题排查（调用超时/404/500）

### 5.1 调用超时

**现象**：

```
feign.RetryableException: Read timed out executing GET http://user-service/api/users/1
```

**排查步骤**：

```java
// 1. 检查超时配置
feign:
  client:
    config:
      user-service:
        connectTimeout: 5000
        readTimeout: 10000

// 2. 检查下游服务处理时间
// 查看下游服务日志，确认处理时间

// 3. 检查网络延迟
ping user-service
traceroute user-service

// 4. 启用详细日志
logging:
  level:
    com.example.client.UserClient: DEBUG
```

**解决方案**：

```yaml
# 方案1：增加超时时间
feign:
  client:
    config:
      user-service:
        readTimeout: 30000  # 增加到30秒

# 方案2：异步调用
CompletableFuture.supplyAsync(() -> userClient.getUser(id))

# 方案3：优化下游服务
# 添加索引、缓存、分页等
```

### 5.2 404 Not Found

**现象**：

```
feign.FeignException$NotFound: [404] during [GET] to [http://user-service/api/users/1]
```

**排查步骤**：

```java
// 1. 检查服务名是否正确
@FeignClient(name = "user-service")  // ✅ 正确
@FeignClient(name = "user-services") // ❌ 错误

// 2. 检查路径是否正确
@GetMapping("/api/users/{id}")       // ✅ 正确
@GetMapping("/api/user/{id}")        // ❌ 错误

// 3. 检查服务是否注册
curl http://localhost:8848/nacos/v1/ns/instance/list?serviceName=user-service

// 4. 检查下游服务是否启动
curl http://192.168.1.1:8081/api/users/1
```

**解决方案**：

```java
// 1. 使用正确的服务名和路径
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
}

// 2. 启用decode404
@FeignClient(name = "user-service", decode404 = true)
public interface UserClient {
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);  // 404时返回null
}
```

### 5.3 500 Internal Server Error

**现象**：

```
feign.FeignException$InternalServerError: [500] during [POST] to [http://user-service/api/users]
```

**排查步骤**：

```java
// 1. 查看下游服务日志
// 检查堆栈信息，定位错误原因

// 2. 检查请求参数
// 启用FULL日志，查看完整请求体
logging:
  level:
    com.example.client.UserClient: DEBUG

feign:
  client:
    config:
      user-service:
        loggerLevel: FULL

// 3. 使用PostMan验证
// 使用相同参数调用下游服务

// 4. 检查序列化问题
// 确保DTO类正确序列化
```

**解决方案**：

```java
// 1. 修复下游服务bug

// 2. 添加参数校验
@PostMapping("/api/users")
User createUser(@Valid @RequestBody UserDTO dto);

// 3. 自定义ErrorDecoder
@Component
public class CustomErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        if (response.status() == 500) {
            // 读取响应体，记录详细错误
            String body = readBody(response);
            log.error("服务内部错误：{}", body);
            return new InternalServerErrorException(body);
        }
        return new Default().decode(methodKey, response);
    }
}
```

---

## 6. Feign 调用链路追踪

### 6.1 集成 SkyWalking

**引入依赖**：

```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-trace</artifactId>
    <version>8.15.0</version>
</dependency>
```

**Feign 拦截器**：

```java
@Component
public class SkyWalkingFeignInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // SkyWalking 自动注入 TraceId
        // 无需手动处理
    }
}
```

**启动应用**：

```bash
java -javaagent:/path/to/skywalking-agent.jar \
     -Dskywalking.agent.service_name=order-service \
     -Dskywalking.collector.backend_service=127.0.0.1:11800 \
     -jar order-service.jar
```

### 6.2 自定义链路追踪

**TraceContext**：

```java
public class TraceContext {
    
    private static final ThreadLocal<String> TRACE_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> SPAN_ID = new ThreadLocal<>();
    
    public static void setTraceId(String traceId) {
        TRACE_ID.set(traceId);
    }
    
    public static String getTraceId() {
        return TRACE_ID.get();
    }
    
    public static void setSpanId(String spanId) {
        SPAN_ID.set(spanId);
    }
    
    public static String getSpanId() {
        return SPAN_ID.get();
    }
    
    public static void clear() {
        TRACE_ID.remove();
        SPAN_ID.remove();
    }
}

@Component
public class TraceInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        String traceId = TraceContext.getTraceId();
        String spanId = generateSpanId();
        
        template.header("X-Trace-Id", traceId);
        template.header("X-Span-Id", spanId);
        template.header("X-Parent-Span-Id", TraceContext.getSpanId());
    }
    
    private String generateSpanId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
```

---

## 7. 生产配置建议

### 7.1 完整配置模板

```yaml
spring:
  application:
    name: order-service
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: prod

feign:
  # ========== HTTP客户端配置 ==========
  okhttp:
    enabled: true
  
  httpclient:
    enabled: false
    max-connections: 200
    max-connections-per-route: 50
    connection-timeout: 5000
    time-to-live: 900
    time-to-live-unit: seconds
  
  # ========== 压缩配置 ==========
  compression:
    request:
      enabled: true
      mime-types: text/xml,application/xml,application/json
      min-request-size: 2048
    response:
      enabled: true
      useGzipDecoder: true
  
  # ========== 降级配置 ==========
  sentinel:
    enabled: true
  
  # ========== 客户端配置 ==========
  client:
    config:
      # 全局配置
      default:
        connectTimeout: 3000
        readTimeout: 10000
        loggerLevel: BASIC
        requestInterceptors:
          - com.example.feign.TraceIdInterceptor
          - com.example.feign.UserContextInterceptor
        errorDecoder: com.example.feign.CustomErrorDecoder
        retryer: feign.Retryer$NEVER_RETRY
      
      # 服务级配置
      user-service:
        connectTimeout: 3000
        readTimeout: 5000
        loggerLevel: BASIC
      
      report-service:
        connectTimeout: 5000
        readTimeout: 30000
        loggerLevel: BASIC

# ========== 日志配置 ==========
logging:
  level:
    com.example.client: INFO  # 生产环境使用INFO
    
# ========== 监控配置 ==========
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,metrics
  metrics:
    tags:
      application: ${spring.application.name}
```

### 7.2 配置检查清单

```
✅ HTTP客户端
   - 使用OkHttp或HttpClient
   - 配置连接池

✅ 超时配置
   - 合理的connectTimeout（3-5秒）
   - 合理的readTimeout（根据业务）

✅ 压缩
   - 启用GZIP压缩
   - 设置最小压缩大小

✅ 降级
   - 配置FallbackFactory
   - 根据异常类型返回不同结果

✅ 重试
   - 生产环境禁用重试（避免重复提交）
   - 或使用条件重试

✅ 日志
   - 生产环境使用BASIC或NONE
   - 开发环境使用FULL

✅ 监控
   - 暴露Prometheus指标
   - 配置Grafana仪表盘

✅ 链路追踪
   - 集成SkyWalking/Zipkin
   - 传递TraceId
```

---

## 8. 故障排查工具

### 8.1 Feign 调用日志

```yaml
# 启用详细日志
logging:
  level:
    com.example.client.UserClient: DEBUG

feign:
  client:
    config:
      user-service:
        loggerLevel: FULL
```

**日志输出**：

```
[UserClient#getUser] ---> GET http://user-service/api/users/1 HTTP/1.1
[UserClient#getUser] Authorization: Bearer xxx
[UserClient#getUser] X-Trace-Id: abc123
[UserClient#getUser] ---> END HTTP
[UserClient#getUser] <--- HTTP/1.1 200 (125ms)
[UserClient#getUser] Content-Type: application/json
[UserClient#getUser] {"id":1,"username":"zhangsan"}
[UserClient#getUser] <--- END HTTP (125ms)
```

### 8.2 监控指标

**Prometheus 指标**：

```promql
# Feign 调用成功率
sum(rate(feign_client_calls_total{status="success"}[5m])) 
/ 
sum(rate(feign_client_calls_total[5m]))

# Feign 平均响应时间
rate(feign_client_calls_sum[5m]) / rate(feign_client_calls_count[5m])

# Feign 错误率
rate(feign_client_errors_total[5m])

# Feign 超时率
rate(feign_client_timeout_total[5m])
```

### 8.3 排查命令

```bash
# 1. 检查服务注册
curl "http://localhost:8848/nacos/v1/ns/instance/list?serviceName=user-service"

# 2. 测试服务连通性
curl "http://192.168.1.1:8081/api/users/1"

# 3. 查看应用日志
tail -f logs/application.log | grep "Feign"

# 4. 检查线程池
jstack <pid> | grep "Feign"

# 5. 检查网络延迟
ping user-service
traceroute user-service

# 6. 抓包分析
tcpdump -i any -nn host user-service
```

---

## 9. 面试要点

### 9.1 基础问题

**Q1：如何在 Feign 中传递用户信息？**

使用 RequestInterceptor：
```java
@Component
public class UserContextInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        String userId = getCurrentUserId();
        template.header("X-User-Id", userId);
    }
}
```

**Q2：Feign 如何实现降级？**

两种方式：
1. fallback：简单降级，无法获取异常
2. fallbackFactory：推荐，可获取异常信息

### 9.2 进阶问题

**Q3：如何排查 Feign 调用超时？**

1. 检查超时配置
2. 查看下游服务处理时间
3. 检查网络延迟
4. 启用详细日志
5. 优化下游服务

**Q4：如何实现 Feign 文件上传？**

1. 引入 feign-form 依赖
2. 配置 SpringFormEncoder
3. 使用 @RequestPart 上传文件

### 9.3 架构问题

**Q5：Feign 生产环境有哪些最佳实践？**

1. 使用 OkHttp/HttpClient
2. 配置连接池
3. 启用 GZIP 压缩
4. 使用 FallbackFactory 降级
5. 禁用重试（或条件重试）
6. 生产环境使用 BASIC 日志
7. 集成链路追踪
8. 监控关键指标

**Q6：如何保证 Feign 调用的可靠性？**

1. 超时配置：合理的超时时间
2. 重试策略：条件重试 + 指数退避
3. 降级处理：FallbackFactory
4. 熔断限流：集成 Sentinel
5. 链路追踪：SkyWalking/Zipkin
6. 监控告警：Prometheus + Grafana

---

## 10. 参考资料

**官方文档**：
- [OpenFeign GitHub](https://github.com/OpenFeign/feign)
- [Spring Cloud OpenFeign](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/)

**最佳实践**：
- [Feign Best Practices](https://github.com/OpenFeign/feign/wiki/Best-Practices)
- [Spring Cloud Alibaba 最佳实践](https://spring-cloud-alibaba-group.github.io/)

---

**OpenFeign 部分完成！下一章预告**：第 19 章将开始学习 Spring Cloud Gateway，包括 Gateway 依赖引入、网关架构设计、路由配置基础、路由转发验证、WebFlux 响应式编程基础等内容。

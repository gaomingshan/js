# 第19章：OpenFeign 最佳实践

> **本章目标**：掌握 Feign 的生产最佳实践，包括接口设计规范、异常处理、安全认证、版本管理等

---

## 1. 接口设计规范

### 1.1 接口命名规范

**推荐命名**：
```java
// ✅ 推荐：使用 Client 后缀
@FeignClient(name = "user-service")
public interface UserClient {
}

@FeignClient(name = "order-service")
public interface OrderClient {
}

// ❌ 不推荐：使用 Service 后缀（容易与业务 Service 混淆）
@FeignClient(name = "user-service")
public interface UserService {
}
```

---

### 1.2 接口方法设计

**推荐做法**：
```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    // ✅ 推荐：方法名清晰，参数明确
    @GetMapping("/user/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
    
    @PostMapping("/user")
    UserDTO createUser(@RequestBody UserDTO userDTO);
    
    @PutMapping("/user/{id}")
    void updateUser(@PathVariable("id") Long id, @RequestBody UserDTO userDTO);
    
    @DeleteMapping("/user/{id}")
    void deleteUser(@PathVariable("id") Long id);
    
    // ✅ 推荐：复杂查询使用对象封装
    @GetMapping("/user/search")
    List<UserDTO> searchUsers(@SpringQueryMap UserQuery query);
    
    // ❌ 不推荐：参数过多
    @GetMapping("/user/search")
    List<UserDTO> searchUsers(
        @RequestParam("name") String name,
        @RequestParam("age") Integer age,
        @RequestParam("email") String email,
        @RequestParam("phone") String phone,
        @RequestParam("address") String address
    );
}
```

---

### 1.3 统一前缀

**使用 path 统一前缀**：
```java
@FeignClient(
    name = "user-service",
    path = "/api/v1"  // 统一前缀
)
public interface UserClient {
    
    // 实际请求路径：/api/v1/user/{id}
    @GetMapping("/user/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
    
    // 实际请求路径：/api/v1/user
    @PostMapping("/user")
    UserDTO createUser(@RequestBody UserDTO userDTO);
}
```

---

### 1.4 接口与实现分离

**定义公共接口**：
```java
// user-api 模块
public interface UserApi {
    
    @GetMapping("/user/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
    
    @PostMapping("/user")
    UserDTO createUser(@RequestBody UserDTO userDTO);
}
```

**服务端实现**：
```java
// user-service 模块
@RestController
public class UserController implements UserApi {
    
    @Override
    public UserDTO getUserById(Long id) {
        // 实现逻辑
    }
    
    @Override
    public UserDTO createUser(UserDTO userDTO) {
        // 实现逻辑
    }
}
```

**Feign 客户端**：
```java
// order-service 模块
@FeignClient(name = "user-service")
public interface UserClient extends UserApi {
}
```

**优势**：
- ✅ 接口定义统一
- ✅ 避免重复定义
- ✅ 易于维护

---

## 2. 参数传递最佳实践

### 2.1 路径参数

**推荐**：
```java
// ✅ 推荐：明确指定 value
@GetMapping("/user/{id}")
UserDTO getUser(@PathVariable("id") Long id);

// ❌ 不推荐：省略 value
@GetMapping("/user/{id}")
UserDTO getUser(@PathVariable Long id);  // 编译后参数名可能丢失
```

---

### 2.2 查询参数

**简单查询**：
```java
@GetMapping("/user/search")
List<UserDTO> searchUsers(
    @RequestParam("name") String name,
    @RequestParam(value = "age", required = false) Integer age
);
```

**复杂查询（推荐）**：
```java
// 查询对象
@Data
public class UserQuery {
    private String name;
    private Integer minAge;
    private Integer maxAge;
    private String email;
}

// Feign 客户端
@GetMapping("/user/search")
List<UserDTO> searchUsers(@SpringQueryMap UserQuery query);

// 调用
UserQuery query = new UserQuery();
query.setName("zhangsan");
query.setMinAge(18);
query.setMaxAge(30);
List<UserDTO> users = userClient.searchUsers(query);
```

---

### 2.3 请求体

**单个对象**：
```java
@PostMapping("/user")
UserDTO createUser(@RequestBody UserDTO userDTO);
```

**多个参数（不推荐）**：
```java
// ❌ 不推荐：无法直接传递多个 @RequestBody
@PostMapping("/user/complex")
void complexOperation(@RequestBody UserDTO user, @RequestBody OrderDTO order);

// ✅ 推荐：封装到一个对象
@Data
public class ComplexRequest {
    private UserDTO user;
    private OrderDTO order;
}

@PostMapping("/user/complex")
void complexOperation(@RequestBody ComplexRequest request);
```

---

### 2.4 请求头

**传递请求头**：
```java
@GetMapping("/user/{id}")
UserDTO getUser(
    @PathVariable("id") Long id,
    @RequestHeader("Authorization") String token
);
```

**统一请求头（推荐）**：
```java
@Component
public class FeignRequestInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // 统一添加请求头
        template.header("Authorization", getToken());
    }
}
```

---

## 3. 异常处理

### 3.1 统一异常处理

**自定义异常**：
```java
public class BusinessException extends RuntimeException {
    private Integer code;
    
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
}

public class NotFoundException extends BusinessException {
    public NotFoundException(String message) {
        super(404, message);
    }
}

public class ForbiddenException extends BusinessException {
    public ForbiddenException(String message) {
        super(403, message);
    }
}
```

**错误解码器**：
```java
public class CustomErrorDecoder implements ErrorDecoder {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public Exception decode(String methodKey, Response response) {
        try {
            String body = Util.toString(response.body().asReader(StandardCharsets.UTF_8));
            ErrorResponse error = objectMapper.readValue(body, ErrorResponse.class);
            
            if (response.status() == 404) {
                return new NotFoundException(error.getMessage());
            }
            
            if (response.status() == 403) {
                return new ForbiddenException(error.getMessage());
            }
            
            if (response.status() >= 500) {
                return new ServiceException(error.getMessage());
            }
            
            return new BusinessException(error.getCode(), error.getMessage());
        } catch (IOException e) {
            return new RuntimeException("Failed to parse error response", e);
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

### 3.2 全局异常处理

**Controller Advice**：
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException e) {
        ErrorResponse error = new ErrorResponse(404, e.getMessage());
        return ResponseEntity.status(404).body(error);
    }
    
    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ErrorResponse> handleFeignException(FeignException e) {
        ErrorResponse error = new ErrorResponse(e.status(), e.getMessage());
        return ResponseEntity.status(e.status()).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Unexpected exception", e);
        ErrorResponse error = new ErrorResponse(500, "Internal server error");
        return ResponseEntity.status(500).body(error);
    }
}
```

---

## 4. 安全认证

### 4.1 Token 传递

**从请求头传递**：
```java
@Component
public class AuthInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        // 从当前请求获取 Token
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String token = request.getHeader("Authorization");
            
            if (token != null) {
                template.header("Authorization", token);
            }
        }
    }
}
```

---

### 4.2 OAuth2 认证

**配置**：
```java
@Configuration
public class OAuth2FeignConfig {
    
    @Bean
    public RequestInterceptor oauth2FeignRequestInterceptor(
            OAuth2AuthorizedClientService clientService) {
        
        return new OAuth2FeignRequestInterceptor(clientService);
    }
}

public class OAuth2FeignRequestInterceptor implements RequestInterceptor {
    
    private OAuth2AuthorizedClientService clientService;
    
    public OAuth2FeignRequestInterceptor(OAuth2AuthorizedClientService clientService) {
        this.clientService = clientService;
    }
    
    @Override
    public void apply(RequestTemplate template) {
        OAuth2AuthorizedClient client = clientService.loadAuthorizedClient(
            "client-id", "principal-name");
        
        if (client != null) {
            String accessToken = client.getAccessToken().getTokenValue();
            template.header("Authorization", "Bearer " + accessToken);
        }
    }
}
```

---

### 4.3 请求签名

**实现**：
```java
@Component
public class SignInterceptor implements RequestInterceptor {
    
    @Value("${feign.sign.secret}")
    private String secret;
    
    @Override
    public void apply(RequestTemplate template) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String nonce = UUID.randomUUID().toString();
        
        // 计算签名
        String sign = calculateSign(template, timestamp, nonce);
        
        // 添加签名相关请求头
        template.header("X-Timestamp", timestamp);
        template.header("X-Nonce", nonce);
        template.header("X-Sign", sign);
    }
    
    private String calculateSign(RequestTemplate template, String timestamp, String nonce) {
        StringBuilder sb = new StringBuilder();
        sb.append(template.method());
        sb.append(template.path());
        sb.append(timestamp);
        sb.append(nonce);
        
        if (template.body() != null) {
            sb.append(new String(template.body()));
        }
        
        sb.append(secret);
        
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to calculate sign", e);
        }
    }
}
```

---

## 5. 版本管理

### 5.1 URL 版本

**方式1：路径版本**：
```java
@FeignClient(
    name = "user-service",
    path = "/api/v1"
)
public interface UserClientV1 {
    
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}

@FeignClient(
    name = "user-service",
    path = "/api/v2"
)
public interface UserClientV2 {
    
    @GetMapping("/user/{id}")
    UserVO getUser(@PathVariable("id") Long id);  // 返回类型变更
}
```

---

### 5.2 请求头版本

**方式2：请求头版本**：
```java
@Component
public class VersionInterceptor implements RequestInterceptor {
    
    @Value("${feign.api.version:v1}")
    private String apiVersion;
    
    @Override
    public void apply(RequestTemplate template) {
        template.header("X-API-Version", apiVersion);
    }
}
```

**服务端**：
```java
@RestController
public class UserController {
    
    @GetMapping("/user/{id}")
    public Object getUser(
            @PathVariable Long id,
            @RequestHeader(value = "X-API-Version", defaultValue = "v1") String version) {
        
        if ("v2".equals(version)) {
            return getUserV2(id);
        }
        
        return getUserV1(id);
    }
}
```

---

### 5.3 灰度发布

**基于版本的灰度**：
```java
@FeignClient(
    name = "user-service",
    configuration = GrayFeignConfig.class
)
public interface UserClient {
}

@Configuration
public class GrayFeignConfig {
    
    @Bean
    public RequestInterceptor grayInterceptor() {
        return template -> {
            // 10% 流量访问灰度版本
            if (ThreadLocalRandom.current().nextInt(100) < 10) {
                template.header("X-Version", "gray");
            }
        };
    }
}
```

---

## 6. 测试策略

### 6.1 单元测试

**Mock Feign 客户端**：
```java
@SpringBootTest
public class OrderServiceTest {
    
    @MockBean
    private UserClient userClient;
    
    @Autowired
    private OrderService orderService;
    
    @Test
    public void testCreateOrder() {
        // Mock Feign 返回值
        UserDTO user = new UserDTO();
        user.setId(1L);
        user.setName("zhangsan");
        
        when(userClient.getUser(1L)).thenReturn(user);
        
        // 测试业务逻辑
        String result = orderService.createOrder(1L);
        
        assertEquals("Order created for zhangsan", result);
        verify(userClient, times(1)).getUser(1L);
    }
}
```

---

### 6.2 集成测试

**WireMock 模拟服务**：
```xml
<dependency>
    <groupId>com.github.tomakehurst</groupId>
    <artifactId>wiremock-jre8</artifactId>
    <scope>test</scope>
</dependency>
```

**测试**：
```java
@SpringBootTest
public class UserClientIntegrationTest {
    
    @Autowired
    private UserClient userClient;
    
    private WireMockServer wireMockServer;
    
    @BeforeEach
    public void setup() {
        wireMockServer = new WireMockServer(8001);
        wireMockServer.start();
        
        // 配置 Mock 响应
        wireMockServer.stubFor(get(urlEqualTo("/user/1"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"id\":1,\"name\":\"zhangsan\"}")));
    }
    
    @AfterEach
    public void teardown() {
        wireMockServer.stop();
    }
    
    @Test
    public void testGetUser() {
        UserDTO user = userClient.getUser(1L);
        
        assertNotNull(user);
        assertEquals(1L, user.getId());
        assertEquals("zhangsan", user.getName());
    }
}
```

---

### 6.3 契约测试

**Spring Cloud Contract**：
```groovy
Contract.make {
    request {
        method 'GET'
        url '/user/1'
    }
    response {
        status 200
        body([
            id: 1,
            name: 'zhangsan'
        ])
        headers {
            contentType('application/json')
        }
    }
}
```

---

## 7. 文档管理

### 7.1 接口文档

**使用 Swagger/OpenAPI**：
```java
@FeignClient(name = "user-service")
@Api(tags = "用户服务客户端")
public interface UserClient {
    
    @ApiOperation("根据ID获取用户")
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
    
    @ApiOperation("创建用户")
    @PostMapping("/user")
    UserDTO createUser(@RequestBody UserDTO userDTO);
}
```

---

### 7.2 接口变更管理

**变更日志**：
```java
/**
 * 用户服务客户端
 * 
 * 变更历史：
 * - v1.0.0 (2023-01-01): 初始版本
 * - v1.1.0 (2023-02-01): 新增 searchUsers 方法
 * - v1.2.0 (2023-03-01): getUser 返回值新增 email 字段
 * - v2.0.0 (2023-04-01): 重构接口，不兼容旧版本
 */
@FeignClient(name = "user-service")
public interface UserClient {
}
```

---

## 8. 监控与日志

### 8.1 调用链路追踪

**集成 Sleuth**：
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>
```

**自动传递 Trace ID**：
```java
// Sleuth 自动在请求头添加 X-B3-TraceId, X-B3-SpanId
```

---

### 8.2 业务日志

**记录关键操作**：
```java
@Aspect
@Component
public class FeignLogAspect {
    
    private static final Logger log = LoggerFactory.getLogger(FeignLogAspect.class);
    
    @Around("@within(org.springframework.cloud.openfeign.FeignClient)")
    public Object logFeignCall(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        
        log.info("Feign call start: {}, args: {}", method, pjp.getArgs());
        
        long start = System.currentTimeMillis();
        
        try {
            Object result = pjp.proceed();
            long duration = System.currentTimeMillis() - start;
            
            log.info("Feign call success: {}, duration: {}ms", method, duration);
            
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            
            log.error("Feign call failed: {}, duration: {}ms", method, duration, e);
            
            throw e;
        }
    }
}
```

---

## 9. 配置管理

### 9.1 环境隔离

**配置文件**：
```yaml
# application-dev.yml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 10000
        loggerLevel: FULL

# application-prod.yml
feign:
  client:
    config:
      default:
        connectTimeout: 2000
        readTimeout: 5000
        loggerLevel: BASIC
```

---

### 9.2 动态配置

**Nacos 配置**：
```yaml
# Nacos 配置中心
feign:
  client:
    config:
      user-service:
        connectTimeout: ${feign.user-service.connect-timeout:2000}
        readTimeout: ${feign.user-service.read-timeout:5000}
```

**支持动态刷新**：
```java
@RefreshScope
@Configuration
public class FeignConfig {
    
    @Value("${feign.user-service.connect-timeout}")
    private int connectTimeout;
    
    @Value("${feign.user-service.read-timeout}")
    private int readTimeout;
    
    @Bean
    public Request.Options options() {
        return new Request.Options(connectTimeout, readTimeout);
    }
}
```

---

## 10. 学习自检清单

- [ ] 掌握接口设计规范
- [ ] 掌握参数传递最佳实践
- [ ] 能够实现统一异常处理
- [ ] 掌握安全认证方案
- [ ] 理解版本管理策略
- [ ] 能够编写 Feign 测试
- [ ] 掌握文档管理
- [ ] 能够配置监控和日志
- [ ] 掌握配置管理

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：接口设计、异常处理、安全认证
- **前置知识**：第16-18章 OpenFeign
- **实践建议**：规范接口设计、实现统一异常处理

---

**本章小结**：
- 接口设计：使用 Client 后缀、方法名清晰、统一前缀、接口与实现分离
- 参数传递：路径参数明确指定 value、复杂查询使用对象、统一请求头用拦截器
- 异常处理：自定义异常、错误解码器、全局异常处理
- 安全认证：Token 传递、OAuth2 认证、请求签名
- 版本管理：URL 版本、请求头版本、灰度发布
- 测试策略：单元测试（Mock）、集成测试（WireMock）、契约测试
- 文档管理：Swagger/OpenAPI、变更日志
- 监控日志：调用链路追踪（Sleuth）、业务日志（AOP）
- 配置管理：环境隔离、动态配置（Nacos）

**下一章预告**：第20章将介绍 Feign 常见问题排查，包括调用失败、超时、参数传递失败、降级不生效、性能问题等排查方法。

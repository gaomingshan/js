# 第 14 章：OpenFeign 快速入门

> **学习目标**：掌握 OpenFeign 声明式 HTTP 客户端的基础使用  
> **预计时长**：2-3 小时  
> **难度级别**：⭐⭐⭐ 中等

---

## 1. OpenFeign 概述

### 1.1 什么是 OpenFeign

**OpenFeign** 是一个声明式的 HTTP 客户端，让编写 Web 服务客户端变得更加简单。

**核心特性**：
- ✅ 声明式API定义（注解驱动）
- ✅ 集成LoadBalancer负载均衡
- ✅ 集成Sentinel/Resilience4j熔断降级
- ✅ 支持请求/响应拦截器
- ✅ 支持多种HTTP客户端（HttpClient、OkHttp）
- ✅ 支持编解码器自定义

### 1.2 Feign vs OpenFeign

| 特性 | Feign | OpenFeign |
|------|-------|-----------|
| 维护方 | Netflix（已停止） | Spring Cloud |
| Spring集成 | 需额外配置 | 原生支持 |
| 负载均衡 | Ribbon | LoadBalancer |
| 推荐度 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

### 1.3 RestTemplate vs OpenFeign

**RestTemplate方式**：

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final RestTemplate restTemplate;
    
    public User getUser(Long userId) {
        // ❌ 手动拼接URL
        String url = "http://user-service/api/users/" + userId;
        return restTemplate.getForObject(url, User.class);
    }
    
    public User createUser(UserDTO dto) {
        // ❌ 手动构建请求
        String url = "http://user-service/api/users";
        return restTemplate.postForObject(url, dto, User.class);
    }
}
```

**OpenFeign方式**：

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    // ✅ 声明式API
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
    
    @PostMapping("/api/users")
    User createUser(@RequestBody UserDTO dto);
}

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final UserClient userClient;
    
    public User getUser(Long userId) {
        return userClient.getUser(userId);  // ✅ 简洁调用
    }
}
```

**对比总结**：

| 维度 | RestTemplate | OpenFeign |
|------|--------------|-----------|
| 编码方式 | 命令式 | 声明式 |
| 代码简洁度 | ❌ 低 | ✅ 高 |
| 类型安全 | ⚠️ 运行时检查 | ✅ 编译时检查 |
| 可维护性 | ❌ 低 | ✅ 高 |
| 推荐度 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 2. 快速开始

### 2.1 添加依赖

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- OpenFeign -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    
    <!-- LoadBalancer（必需） -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>
    
    <!-- Nacos Discovery -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
</dependencies>
```

### 2.2 启用Feign

```java
@SpringBootApplication
@EnableFeignClients  // 启用Feign客户端扫描
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

**指定扫描包**：

```java
@EnableFeignClients(basePackages = "com.example.client")
public class OrderServiceApplication {
}
```

### 2.3 定义Feign接口

```java
package com.example.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "user-service")  // 服务名称
public interface UserClient {
    
    /**
     * 根据ID查询用户
     */
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable("id") Long id);
    
    /**
     * 查询用户列表
     */
    @GetMapping("/api/users")
    List<User> listUsers(@RequestParam("page") int page,
                          @RequestParam("size") int size);
    
    /**
     * 创建用户
     */
    @PostMapping("/api/users")
    User createUser(@RequestBody UserDTO dto);
    
    /**
     * 更新用户
     */
    @PutMapping("/api/users/{id}")
    User updateUser(@PathVariable("id") Long id, 
                     @RequestBody UserDTO dto);
    
    /**
     * 删除用户
     */
    @DeleteMapping("/api/users/{id}")
    void deleteUser(@PathVariable("id") Long id);
}
```

### 2.4 使用Feign客户端

```java
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final UserClient userClient;
    
    @GetMapping("/{orderId}")
    public Order getOrder(@PathVariable Long orderId) {
        // 1. 查询订单
        Order order = orderService.getById(orderId);
        
        // 2. 调用用户服务
        User user = userClient.getUser(order.getUserId());
        
        // 3. 组装数据
        order.setUser(user);
        return order;
    }
    
    @PostMapping
    public Order createOrder(@RequestBody OrderDTO dto) {
        // 1. 验证用户是否存在
        User user = userClient.getUser(dto.getUserId());
        
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 2. 创建订单
        return orderService.create(dto);
    }
}
```

---

## 3. @FeignClient 注解详解

### 3.1 核心属性

```java
@FeignClient(
    name = "user-service",           // 服务名称（必填）
    url = "",                         // 完整URL（可选，指定后不走服务发现）
    path = "/api",                    // 统一路径前缀
    configuration = FeignConfig.class, // 自定义配置类
    fallback = UserClientFallback.class, // 降级处理类
    fallbackFactory = UserClientFallbackFactory.class, // 降级工厂
    primary = true,                   // 是否作为主Bean
    qualifier = "userClient"          // Bean名称
)
public interface UserClient {
}
```

### 3.2 name 属性

**用法**：

```java
// ✅ 使用服务名（走服务发现+负载均衡）
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
}

// 实际请求：http://user-service/api/users/1
// 会被LoadBalancer转换为：http://192.168.1.1:8081/api/users/1
```

### 3.3 url 属性

**用法**：

```java
// 直接指定URL（不走服务发现）
@FeignClient(name = "external-api", url = "https://api.example.com")
public interface ExternalApiClient {
    @GetMapping("/data")
    String getData();
}

// 实际请求：https://api.example.com/data
```

**使用场景**：
- 调用第三方API
- 调用固定IP的服务
- 测试环境Mock

### 3.4 path 属性

**用法**：

```java
@FeignClient(name = "user-service", path = "/api")
public interface UserClient {
    
    // 实际路径：/api/users/{id}
    @GetMapping("/users/{id}")
    User getUser(@PathVariable Long id);
    
    // 实际路径：/api/users
    @GetMapping("/users")
    List<User> listUsers();
}
```

### 3.5 configuration 属性

**自定义配置类**：

```java
@Configuration
public class FeignConfig {
    
    /**
     * 日志级别
     */
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
    
    /**
     * 超时配置
     */
    @Bean
    public Request.Options options() {
        return new Request.Options(
            5000,  // 连接超时（毫秒）
            10000  // 读取超时（毫秒）
        );
    }
    
    /**
     * 重试策略
     */
    @Bean
    public Retryer retryer() {
        return new Retryer.Default(
            100,   // 重试间隔（毫秒）
            1000,  // 最大重试间隔（毫秒）
            3      // 最大重试次数
        );
    }
}
```

**应用配置**：

```java
@FeignClient(name = "user-service", configuration = FeignConfig.class)
public interface UserClient {
}
```

---

## 4. 请求参数传递

### 4.1 路径参数（@PathVariable）

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    // ✅ 单个路径参数
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable("id") Long id);
    
    // ✅ 多个路径参数
    @GetMapping("/api/users/{userId}/orders/{orderId}")
    Order getUserOrder(@PathVariable("userId") Long userId,
                        @PathVariable("orderId") Long orderId);
}
```

### 4.2 查询参数（@RequestParam）

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    // ✅ 单个查询参数
    @GetMapping("/api/users")
    List<User> listUsers(@RequestParam("page") int page);
    
    // ✅ 多个查询参数
    @GetMapping("/api/users")
    List<User> listUsers(@RequestParam("page") int page,
                          @RequestParam("size") int size,
                          @RequestParam("sort") String sort);
    
    // ✅ 可选参数
    @GetMapping("/api/users")
    List<User> listUsers(@RequestParam(value = "keyword", required = false) String keyword);
}
```

### 4.3 请求体（@RequestBody）

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    // ✅ POST请求
    @PostMapping("/api/users")
    User createUser(@RequestBody UserDTO dto);
    
    // ✅ PUT请求
    @PutMapping("/api/users/{id}")
    User updateUser(@PathVariable("id") Long id, 
                     @RequestBody UserDTO dto);
    
    // ✅ PATCH请求
    @PatchMapping("/api/users/{id}")
    User patchUser(@PathVariable("id") Long id,
                    @RequestBody Map<String, Object> updates);
}
```

### 4.4 请求头（@RequestHeader）

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    // ✅ 单个请求头
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable("id") Long id,
                  @RequestHeader("Authorization") String token);
    
    // ✅ 多个请求头
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable("id") Long id,
                  @RequestHeader("Authorization") String token,
                  @RequestHeader("X-Request-Id") String requestId);
}
```

### 4.5 复杂对象参数（@SpringQueryMap）

```java
@Data
public class UserQuery {
    private String keyword;
    private Integer minAge;
    private Integer maxAge;
    private String city;
}

@FeignClient(name = "user-service")
public interface UserClient {
    
    // ✅ 对象转查询参数
    @GetMapping("/api/users")
    List<User> searchUsers(@SpringQueryMap UserQuery query);
    
    // 实际请求：
    // /api/users?keyword=zhang&minAge=18&maxAge=30&city=beijing
}
```

### 4.6 文件上传（@RequestPart）

```java
@FeignClient(name = "file-service")
public interface FileClient {
    
    @PostMapping(value = "/api/files/upload", 
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    String uploadFile(@RequestPart("file") MultipartFile file,
                       @RequestParam("type") String type);
}
```

---

## 5. 响应处理

### 5.1 直接返回对象

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    // 返回单个对象
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
    
    // 返回列表
    @GetMapping("/api/users")
    List<User> listUsers();
    
    // 返回Map
    @GetMapping("/api/users/stats")
    Map<String, Object> getUserStats();
}
```

### 5.2 统一响应包装

**统一响应类**：

```java
@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    
    public boolean isSuccess() {
        return code != null && code == 200;
    }
}
```

**Feign接口**：

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/api/users/{id}")
    Result<User> getUser(@PathVariable Long id);
    
    @GetMapping("/api/users")
    Result<List<User>> listUsers();
}
```

**使用示例**：

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final UserClient userClient;
    
    public User getUser(Long userId) {
        Result<User> result = userClient.getUser(userId);
        
        if (!result.isSuccess()) {
            throw new BusinessException(result.getMessage());
        }
        
        return result.getData();
    }
}
```

### 5.3 ResponseEntity

```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/api/users/{id}")
    ResponseEntity<User> getUser(@PathVariable Long id);
}

// 使用
ResponseEntity<User> response = userClient.getUser(1L);
if (response.getStatusCode() == HttpStatus.OK) {
    User user = response.getBody();
}
```

---

## 6. Feign配置

### 6.1 全局配置

**application.yml**：

```yaml
feign:
  client:
    config:
      default:  # 全局配置
        connectTimeout: 5000      # 连接超时（毫秒）
        readTimeout: 10000        # 读取超时（毫秒）
        loggerLevel: FULL         # 日志级别
        
        # 重试配置
        retryer: feign.Retryer.Default
        
        # 请求拦截器
        requestInterceptors:
          - com.example.feign.AuthInterceptor
        
        # 编解码器
        encoder: feign.jackson.JacksonEncoder
        decoder: feign.jackson.JacksonDecoder
```

### 6.2 服务级配置

```yaml
feign:
  client:
    config:
      user-service:  # 特定服务配置
        connectTimeout: 3000
        readTimeout: 5000
        loggerLevel: BASIC
```

### 6.3 日志级别

**日志级别**：

| 级别 | 说明 | 内容 |
|------|------|------|
| NONE | 不记录 | 无 |
| BASIC | 基本信息 | 请求方法、URL、响应状态码、执行时间 |
| HEADERS | 请求和响应头 | BASIC + 请求头和响应头 |
| FULL | 完整信息 | HEADERS + 请求体和响应体 |

**配置方式**：

```yaml
# 1. 配置文件
feign:
  client:
    config:
      default:
        loggerLevel: FULL

# 2. 日志级别（必须配置）
logging:
  level:
    com.example.client.UserClient: DEBUG
```

**Java配置**：

```java
@Configuration
public class FeignConfig {
    
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}
```

---

## 7. 实战案例

### 7.1 完整示例

**UserDTO**：

```java
@Data
public class UserDTO {
    @NotBlank(message = "用户名不能为空")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    private String password;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
    
    private String email;
}
```

**UserClient**：

```java
@FeignClient(name = "user-service", path = "/api")
public interface UserClient {
    
    @GetMapping("/users/{id}")
    Result<User> getUser(@PathVariable Long id);
    
    @GetMapping("/users")
    Result<List<User>> listUsers(
        @RequestParam(value = "page", defaultValue = "1") int page,
        @RequestParam(value = "size", defaultValue = "10") int size
    );
    
    @PostMapping("/users")
    Result<User> createUser(@Valid @RequestBody UserDTO dto);
    
    @PutMapping("/users/{id}")
    Result<User> updateUser(@PathVariable Long id, 
                             @Valid @RequestBody UserDTO dto);
    
    @DeleteMapping("/users/{id}")
    Result<Void> deleteUser(@PathVariable Long id);
}
```

**OrderService**：

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final UserClient userClient;
    
    public Order createOrder(OrderDTO dto) {
        log.info("创建订单，用户ID：{}", dto.getUserId());
        
        // 1. 验证用户
        Result<User> userResult = userClient.getUser(dto.getUserId());
        if (!userResult.isSuccess()) {
            throw new BusinessException("用户不存在");
        }
        
        User user = userResult.getData();
        log.info("用户信息：{}", user);
        
        // 2. 创建订单
        Order order = new Order();
        order.setUserId(user.getId());
        order.setUserName(user.getUsername());
        // ...
        
        return orderRepository.save(order);
    }
}
```

### 7.2 调用第三方API

```java
@FeignClient(
    name = "weather-api",
    url = "https://api.openweathermap.org"
)
public interface WeatherClient {
    
    @GetMapping("/data/2.5/weather")
    WeatherResponse getWeather(
        @RequestParam("q") String city,
        @RequestParam("appid") String apiKey
    );
}

// 使用
@Service
@RequiredArgsConstructor
public class WeatherService {
    
    private final WeatherClient weatherClient;
    
    @Value("${weather.api.key}")
    private String apiKey;
    
    public WeatherResponse getWeather(String city) {
        return weatherClient.getWeather(city, apiKey);
    }
}
```

---

## 8. 常见问题

### 8.1 404 Not Found

**原因**：
- 服务名错误
- 路径错误
- 服务未注册

**排查**：

```bash
# 1. 检查服务是否注册
curl http://localhost:8848/nacos/v1/ns/instance/list?serviceName=user-service

# 2. 检查路径
# Feign接口路径：/api/users/{id}
# 实际服务路径：/api/users/{id}
```

### 8.2 超时异常

**配置超时**：

```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 10000
```

### 8.3 No instances available

**原因**：服务未注册或已下线

**解决**：
1. 检查服务是否启动
2. 检查Nacos注册
3. 检查命名空间和分组

---

## 9. 面试要点

### 9.1 基础问题

**Q1：OpenFeign的优势是什么？**

- 声明式API，代码简洁
- 集成负载均衡
- 集成熔断降级
- 类型安全

**Q2：如何使用OpenFeign调用服务？**

1. 添加依赖
2. @EnableFeignClients启用
3. 定义@FeignClient接口
4. 注入使用

### 9.2 进阶问题

**Q3：Feign如何传递参数？**

- @PathVariable：路径参数
- @RequestParam：查询参数
- @RequestBody：请求体
- @RequestHeader：请求头
- @SpringQueryMap：对象转查询参数

**Q4：如何配置Feign超时？**

```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 10000
```

### 9.3 架构问题

**Q5：Feign如何实现负载均衡？**

- 集成Spring Cloud LoadBalancer
- 从服务发现获取实例列表
- 负载均衡器选择实例
- 替换URL发起请求

---

## 10. 参考资料

**官方文档**：
- [OpenFeign GitHub](https://github.com/OpenFeign/feign)
- [Spring Cloud OpenFeign](https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/)

---

**下一章预告**：第 15 章将深入学习 OpenFeign 高级特性，包括请求拦截器、编解码器、熔断降级、Feign原理与源码分析等内容。

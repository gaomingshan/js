# 第16章：OpenFeign 快速入门

> **本章目标**：掌握 OpenFeign 声明式服务调用，理解 Feign 的工作原理，能够快速集成和使用

---

## 1. 组件引入与快速入门

### 1.1 OpenFeign 简介

**定位**：声明式 REST 客户端，简化微服务间的 HTTP 调用。

**传统方式 vs Feign**：

**传统方式（RestTemplate）**：
```java
@Service
public class OrderService {
    
    @Autowired
    @LoadBalanced
    private RestTemplate restTemplate;
    
    public String createOrder(Long userId) {
        // 1. 拼接 URL
        String url = "http://user-service/user/" + userId;
        
        // 2. 发起请求
        String user = restTemplate.getForObject(url, String.class);
        
        return "Order created for " + user;
    }
    
    public void updateUser(Long userId, UserDTO userDTO) {
        String url = "http://user-service/user/" + userId;
        restTemplate.put(url, userDTO);
    }
}
```

**问题**：
- 需要手动拼接 URL
- 代码冗余
- 不够优雅

**Feign 方式**：
```java
// 1. 定义接口
@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/user/{id}")
    String getUser(@PathVariable("id") Long id);
    
    @PutMapping("/user/{id}")
    void updateUser(@PathVariable("id") Long id, @RequestBody UserDTO userDTO);
}

// 2. 注入使用
@Service
public class OrderService {
    
    @Autowired
    private UserClient userClient;
    
    public String createOrder(Long userId) {
        String user = userClient.getUser(userId);
        return "Order created for " + user;
    }
    
    public void updateUser(Long userId, UserDTO userDTO) {
        userClient.updateUser(userId, userDTO);
    }
}
```

**优势**：
- ✅ 声明式调用，类似 Spring MVC
- ✅ 自动集成负载均衡
- ✅ 支持服务降级（结合 Sentinel）
- ✅ 内置日志、编解码、拦截器等功能

---

### 1.2 最小配置

**pom.xml**：
```xml
<dependencies>
    <!-- OpenFeign -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>

    <!-- Nacos Discovery -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>

    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

**启动类**：
```java
package com.demo.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients  // 开启 Feign 客户端
public class OrderServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

**application.yml**：
```yaml
server:
  port: 8002

spring:
  application:
    name: order-service
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
```

---

### 1.3 定义 Feign 客户端

**基础用法**：
```java
package com.demo.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "user-service")  // 服务名
public interface UserClient {
    
    // GET 请求
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
    
    // POST 请求
    @PostMapping("/user")
    UserDTO createUser(@RequestBody UserDTO userDTO);
    
    // PUT 请求
    @PutMapping("/user/{id}")
    void updateUser(@PathVariable("id") Long id, @RequestBody UserDTO userDTO);
    
    // DELETE 请求
    @DeleteMapping("/user/{id}")
    void deleteUser(@PathVariable("id") Long id);
    
    // 查询参数
    @GetMapping("/user/search")
    List<UserDTO> searchUsers(@RequestParam("name") String name,
                              @RequestParam("age") Integer age);
}
```

**DTO 定义**：
```java
@Data
public class UserDTO {
    private Long id;
    private String name;
    private Integer age;
    private String email;
}
```

---

### 1.4 使用 Feign 客户端

**Service 层**：
```java
@Service
public class OrderService {
    
    @Autowired
    private UserClient userClient;
    
    public String createOrder(Long userId) {
        // 调用 user-service
        UserDTO user = userClient.getUser(userId);
        
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        // 创建订单逻辑
        return "Order created for " + user.getName();
    }
}
```

**Controller 层**：
```java
@RestController
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @PostMapping("/order/{userId}")
    public String createOrder(@PathVariable Long userId) {
        return orderService.createOrder(userId);
    }
}
```

**测试**：
```bash
curl -X POST http://localhost:8002/order/1

# 返回：Order created for zhangsan
```

---

## 2. Feign 注解详解

### 2.1 @FeignClient 注解

**完整配置**：
```java
@FeignClient(
    name = "user-service",  // 服务名（必填）
    path = "/api/v1",  // 统一前缀
    url = "http://localhost:8001",  // 直接指定 URL（优先级高于服务名）
    fallback = UserClientFallback.class,  // 降级类
    fallbackFactory = UserClientFallbackFactory.class,  // 降级工厂
    configuration = UserClientConfig.class,  // 自定义配置
    primary = true,  // 多个 Bean 时，设置为主 Bean
    qualifier = "userClient"  // Bean 名称
)
public interface UserClient {
}
```

**参数说明**：
- **name**：服务名，从注册中心获取实例
- **path**：统一前缀，所有方法都加上这个前缀
- **url**：直接指定 URL，不走负载均衡（用于第三方服务）
- **fallback**：降级类（实现接口）
- **fallbackFactory**：降级工厂（可获取异常信息）
- **configuration**：自定义配置类

---

### 2.2 请求注解

**@GetMapping**：
```java
@GetMapping("/user/{id}")
UserDTO getUser(@PathVariable("id") Long id);

@GetMapping("/user/list")
List<UserDTO> listUsers(@RequestParam("page") int page,
                        @RequestParam("size") int size);
```

**@PostMapping**：
```java
@PostMapping("/user")
UserDTO createUser(@RequestBody UserDTO userDTO);

// 表单提交
@PostMapping(value = "/user/form", consumes = "application/x-www-form-urlencoded")
void createUserForm(@RequestParam("name") String name,
                    @RequestParam("age") Integer age);
```

**@RequestHeader**：
```java
@GetMapping("/user/{id}")
UserDTO getUser(@PathVariable("id") Long id,
                @RequestHeader("Authorization") String token);
```

**@RequestParam**：
```java
@GetMapping("/user/search")
List<UserDTO> searchUsers(@RequestParam("name") String name,
                          @RequestParam(value = "age", required = false) Integer age);
```

**@PathVariable**：
```java
@GetMapping("/user/{id}")
UserDTO getUser(@PathVariable("id") Long id);

// 多个路径参数
@GetMapping("/user/{userId}/order/{orderId}")
OrderDTO getOrder(@PathVariable("userId") Long userId,
                  @PathVariable("orderId") Long orderId);
```

---

### 2.3 参数传递

**单个对象**：
```java
@PostMapping("/user")
UserDTO createUser(@RequestBody UserDTO userDTO);
```

**多个参数**：
```java
// 方式1：多个 @RequestParam
@GetMapping("/user/search")
List<UserDTO> searchUsers(@RequestParam("name") String name,
                          @RequestParam("age") Integer age);

// 方式2：使用 Map
@GetMapping("/user/search")
List<UserDTO> searchUsers(@RequestParam Map<String, Object> params);

// 方式3：使用 @SpringQueryMap（Spring Cloud 2020.0.0+）
@GetMapping("/user/search")
List<UserDTO> searchUsers(@SpringQueryMap UserQuery query);
```

**文件上传**：
```java
@PostMapping(value = "/user/upload", consumes = "multipart/form-data")
String uploadFile(@RequestPart("file") MultipartFile file,
                  @RequestParam("userId") Long userId);
```

---

## 3. Feign 工作原理

### 3.1 核心流程

**完整流程**：
```
1. @EnableFeignClients 扫描 @FeignClient 接口
    ↓
2. FeignClientFactoryBean 为接口创建代理对象
    ↓
3. 注入代理对象到 Spring 容器
    ↓
4. 调用接口方法
    ↓
5. InvocationHandler 拦截方法调用
    ↓
6. RequestTemplate 构建 HTTP 请求
    ↓
7. Encoder 编码请求体（JSON/XML）
    ↓
8. LoadBalancer 选择服务实例
    ↓
9. Client 发起 HTTP 请求（默认 HttpURLConnection）
    ↓
10. Decoder 解码响应体
    ↓
11. 返回结果
```

---

### 3.2 核心组件

**Contract（契约）**：
- 解析接口注解
- 生成 MethodMetadata

**Encoder（编码器）**：
- 将请求对象编码为 HTTP 请求体
- 默认：SpringEncoder（使用 HttpMessageConverter）

**Decoder（解码器）**：
- 将 HTTP 响应体解码为对象
- 默认：SpringDecoder

**Client（HTTP 客户端）**：
- 发起 HTTP 请求
- 默认：HttpURLConnection
- 可替换：HttpClient、OkHttp

**Retryer（重试器）**：
- 请求失败时重试
- 默认：不重试

**RequestInterceptor（请求拦截器）**：
- 在请求发送前拦截
- 用于添加统一的请求头、日志等

---

### 3.3 源码分析

**FeignClientFactoryBean.java**：
```java
class FeignClientFactoryBean implements FactoryBean<Object> {
    
    @Override
    public Object getObject() {
        return getTarget();
    }
    
    <T> T getTarget() {
        FeignContext context = applicationContext.getBean(FeignContext.class);
        Feign.Builder builder = feign(context);
        
        // 如果指定了 url，不走负载均衡
        if (!StringUtils.hasText(url)) {
            // 走负载均衡
            String url = "http://" + name;
            return (T) loadBalance(builder, context, new HardCodedTarget<>(type, name, url));
        }
        
        // 直连
        return (T) targeter.target(this, builder, context, 
            new HardCodedTarget<>(type, name, url));
    }
    
    protected <T> T loadBalance(Feign.Builder builder, FeignContext context,
            HardCodedTarget<T> target) {
        // 获取 Client（集成 LoadBalancer）
        Client client = getOptional(context, Client.class);
        
        if (client != null) {
            builder.client(client);
        }
        
        // 创建代理对象
        return targeter.target(this, builder, context, target);
    }
}
```

**ReflectiveFeign.java**：
```java
public class ReflectiveFeign extends Feign {
    
    @Override
    public <T> T newInstance(Target<T> target) {
        // 为每个方法创建 MethodHandler
        Map<String, MethodHandler> nameToHandler = targetToHandlersByName.apply(target);
        
        Map<Method, MethodHandler> methodToHandler = new LinkedHashMap<>();
        List<DefaultMethodHandler> defaultMethodHandlers = new LinkedList<>();
        
        for (Method method : target.type().getMethods()) {
            if (method.getDeclaringClass() == Object.class) {
                continue;
            } else if (Util.isDefault(method)) {
                DefaultMethodHandler handler = new DefaultMethodHandler(method);
                defaultMethodHandlers.add(handler);
                methodToHandler.put(method, handler);
            } else {
                methodToHandler.put(method, nameToHandler.get(Feign.configKey(target.type(), method)));
            }
        }
        
        // 创建 JDK 动态代理
        InvocationHandler handler = factory.create(target, methodToHandler);
        T proxy = (T) Proxy.newProxyInstance(
            target.type().getClassLoader(),
            new Class<?>[] {target.type()},
            handler);
        
        return proxy;
    }
}
```

**FeignInvocationHandler.java**：
```java
static class FeignInvocationHandler implements InvocationHandler {
    
    private final Map<Method, MethodHandler> dispatch;
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 拦截方法调用
        return dispatch.get(method).invoke(args);
    }
}
```

**SynchronousMethodHandler.java**：
```java
final class SynchronousMethodHandler implements MethodHandler {
    
    @Override
    public Object invoke(Object[] argv) throws Throwable {
        // 1. 构建请求模板
        RequestTemplate template = buildTemplateFromArgs.create(argv);
        
        // 2. 应用请求拦截器
        for (RequestInterceptor interceptor : requestInterceptors) {
            interceptor.apply(template);
        }
        
        // 3. 发起请求
        Response response = client.execute(request, options);
        
        // 4. 解码响应
        if (response.status() >= 200 && response.status() < 300) {
            return decoder.decode(response, metadata.returnType());
        } else {
            throw errorDecoder.decode(metadata.configKey(), response);
        }
    }
}
```

---

## 4. 实际落地场景

### 4.1 场景1：调用第三方 API

**需求**：调用微信 API。

**实现**：
```java
@FeignClient(
    name = "wechat-api",
    url = "https://api.weixin.qq.com"  // 直接指定 URL
)
public interface WechatClient {
    
    @GetMapping("/cgi-bin/token")
    TokenResponse getAccessToken(@RequestParam("grant_type") String grantType,
                                  @RequestParam("appid") String appid,
                                  @RequestParam("secret") String secret);
}
```

**使用**：
```java
@Service
public class WechatService {
    
    @Autowired
    private WechatClient wechatClient;
    
    @Value("${wechat.appid}")
    private String appid;
    
    @Value("${wechat.secret}")
    private String secret;
    
    public String getAccessToken() {
        TokenResponse response = wechatClient.getAccessToken(
            "client_credential", appid, secret);
        return response.getAccessToken();
    }
}
```

---

### 4.2 场景2：统一请求头

**需求**：所有请求都携带 Authorization 请求头。

**实现**：
```java
@Configuration
public class FeignConfig {
    
    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            // 添加统一请求头
            template.header("Authorization", "Bearer " + getToken());
            template.header("X-Request-Id", UUID.randomUUID().toString());
        };
    }
    
    private String getToken() {
        // 从上下文获取 Token
        return "token";
    }
}
```

**应用到 Feign 客户端**：
```java
@FeignClient(
    name = "user-service",
    configuration = FeignConfig.class
)
public interface UserClient {
}
```

---

### 4.3 场景3：文件上传

**服务提供者**：
```java
@RestController
public class FileController {
    
    @PostMapping(value = "/file/upload", consumes = "multipart/form-data")
    public String uploadFile(@RequestPart("file") MultipartFile file,
                            @RequestParam("description") String description) {
        // 保存文件
        return "File uploaded: " + file.getOriginalFilename();
    }
}
```

**Feign 客户端**：
```java
@FeignClient(name = "file-service")
public interface FileClient {
    
    @PostMapping(value = "/file/upload", consumes = "multipart/form-data")
    String uploadFile(@RequestPart("file") MultipartFile file,
                      @RequestParam("description") String description);
}
```

**使用**：
```java
@RestController
public class UploadController {
    
    @Autowired
    private FileClient fileClient;
    
    @PostMapping("/upload")
    public String upload(@RequestParam("file") MultipartFile file) {
        return fileClient.uploadFile(file, "User uploaded file");
    }
}
```

---

## 5. 常见问题与易错点

### 5.1 问题1：接口未被扫描

**现象**：
```
No qualifying bean of type 'com.demo.order.client.UserClient'
```

**原因**：
- 未添加 @EnableFeignClients
- 接口不在扫描路径下

**解决方案**：
```java
// 方式1：扫描主启动类所在包及子包（默认）
@EnableFeignClients
@SpringBootApplication
public class OrderServiceApplication {
}

// 方式2：指定扫描包
@EnableFeignClients(basePackages = "com.demo.order.client")
@SpringBootApplication
public class OrderServiceApplication {
}

// 方式3：指定扫描类
@EnableFeignClients(clients = {UserClient.class, ProductClient.class})
@SpringBootApplication
public class OrderServiceApplication {
}
```

---

### 5.2 问题2：参数传递失败

**现象**：
- 服务端收不到参数

**原因**：
- @PathVariable/@RequestParam 未指定 value

**解决方案**：
```java
// 错误
@GetMapping("/user/{id}")
UserDTO getUser(@PathVariable Long id);  // 缺少 value

// 正确
@GetMapping("/user/{id}")
UserDTO getUser(@PathVariable("id") Long id);
```

---

### 5.3 问题3：调用超时

**现象**：
```
java.net.SocketTimeoutException: Read timed out
```

**原因**：
- 默认超时时间太短（连接超时10秒，读取超时60秒）
- 服务端响应慢

**解决方案**：
```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000  # 连接超时（毫秒）
        readTimeout: 10000  # 读取超时（毫秒）
      
      user-service:  # 针对特定服务
        connectTimeout: 3000
        readTimeout: 8000
```

---

## 6. 面试准备专项

### 高频面试题

**题目1：Feign 的工作原理是什么？**

**标准回答**：

**第一层（基础回答）**：
Feign 为接口创建动态代理，拦截方法调用，将方法参数转换为 HTTP 请求，通过 LoadBalancer 选择服务实例，发起请求，解码响应。

**第二层（深入原理）**：
1. **扫描接口**：@EnableFeignClients 扫描 @FeignClient 接口
2. **创建代理**：FeignClientFactoryBean 使用 JDK 动态代理创建代理对象
3. **拦截调用**：InvocationHandler 拦截方法调用
4. **构建请求**：RequestTemplate 构建 HTTP 请求
5. **编码**：Encoder 编码请求体
6. **负载均衡**：LoadBalancer 选择服务实例
7. **发起请求**：Client 发起 HTTP 请求
8. **解码**：Decoder 解码响应体
9. **返回结果**

**第三层（扩展延伸）**：
- **核心组件**：Contract、Encoder、Decoder、Client、Retryer、RequestInterceptor
- **负载均衡**：集成 Spring Cloud LoadBalancer
- **HTTP 客户端**：默认 HttpURLConnection，可替换为 HttpClient、OkHttp

**加分项**：
- 提到源码实现细节（FeignClientFactoryBean、ReflectiveFeign）
- 提到 Feign 与 Ribbon、LoadBalancer 的集成
- 提到实际使用经验

---

**题目2：Feign 和 RestTemplate 的区别？**

**标准回答**：

**第一层（基础回答）**：
Feign 是声明式调用，类似 Spring MVC；RestTemplate 是命令式调用，需要手动构建请求。

**第二层（深入原理）**：
- **编程风格**：Feign（声明式，定义接口），RestTemplate（命令式，手动拼接 URL）
- **代码简洁性**：Feign 更简洁
- **功能**：Feign 内置负载均衡、降级、日志；RestTemplate 需手动集成
- **性能**：RestTemplate 略高（Feign 多一层代理）
- **推荐度**：Feign（微服务调用），RestTemplate（简单场景、第三方 API）

**第三层（扩展延伸）**：
- **底层实现**：Feign 底层也使用 HTTP 客户端（默认 HttpURLConnection）
- **负载均衡**：Feign 自动集成，RestTemplate 需要 @LoadBalanced
- **实际选择**：微服务内部调用优先 Feign，简单场景可用 RestTemplate

**加分项**：
- 提到具体使用场景
- 提到性能对比
- 提到实际项目经验

---

## 7. 学习自检清单

- [ ] 理解 OpenFeign 的定位和优势
- [ ] 掌握 Feign 客户端的定义和使用
- [ ] 掌握 @FeignClient 注解的配置
- [ ] 掌握各种请求注解的使用
- [ ] 理解 Feign 的工作原理
- [ ] 掌握 Feign 的核心组件
- [ ] 能够实现统一请求头、文件上传等场景
- [ ] 能够排查 Feign 相关问题

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：工作原理、核心组件、源码分析
- **前置知识**：第13-15章负载均衡
- **实践建议**：定义 Feign 客户端，调试源码

---

**本章小结**：
- OpenFeign 是声明式 REST 客户端，简化微服务间的 HTTP 调用
- 核心流程：扫描接口 → 创建代理 → 拦截调用 → 构建请求 → 负载均衡 → 发起请求 → 解码响应
- 核心组件：Contract、Encoder、Decoder、Client、Retryer、RequestInterceptor
- @FeignClient 注解配置：name、path、url、fallback、configuration
- 支持各种请求注解：@GetMapping、@PostMapping、@PathVariable、@RequestParam、@RequestBody
- 常见问题：接口未扫描、参数传递失败、调用超时

**下一章预告**：第17章将深入介绍 OpenFeign 高级配置，包括超时配置、日志配置、编解码器、HTTP 客户端替换、拦截器、重试机制。

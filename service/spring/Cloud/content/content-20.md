# 第20章：OpenFeign 常见问题排查

> **本章目标**：掌握 Feign 常见问题的排查方法，能够快速定位和解决生产环境问题

---

## 1. 调用失败问题

### 1.1 找不到 Bean

**现象**：
```
No qualifying bean of type 'com.demo.order.client.UserClient'
```

**原因**：
1. 未添加 @EnableFeignClients
2. Feign 客户端不在扫描路径下
3. 配置类被重复扫描

**排查步骤**：
```bash
# 1. 检查启动类是否有 @EnableFeignClients
# 2. 检查 Feign 客户端所在包路径
# 3. 查看启动日志，确认是否扫描到 Feign 客户端
```

**解决方案**：
```java
// 方案1：默认扫描主启动类所在包及子包
@EnableFeignClients
@SpringBootApplication
public class OrderServiceApplication {
}

// 方案2：指定扫描包
@EnableFeignClients(basePackages = "com.demo.order.client")
@SpringBootApplication
public class OrderServiceApplication {
}

// 方案3：指定扫描类
@EnableFeignClients(clients = {UserClient.class, ProductClient.class})
@SpringBootApplication
public class OrderServiceApplication {
}
```

---

### 1.2 服务不可用

**现象**：
```
java.lang.IllegalStateException: No instances available for user-service
```

**原因**：
1. 服务提供者未启动
2. 服务提供者未注册到 Nacos
3. 服务名不匹配

**排查步骤**：
```bash
# 1. 检查 Nacos 控制台
# http://localhost:8848/nacos
# 确认服务实例是否存在

# 2. 检查服务名
# @FeignClient(name = "user-service") 与 Nacos 中的服务名是否一致

# 3. 检查命名空间、分组
spring:
  cloud:
    nacos:
      discovery:
        namespace: public
        group: DEFAULT_GROUP
```

**解决方案**：
1. 启动服务提供者
2. 确认服务名一致
3. 确认命名空间、分组一致

---

### 1.3 HTTP 404

**现象**：
```
feign.FeignException$NotFound: [404] during [GET] to [http://user-service/user/1]
```

**原因**：
1. 请求路径错误
2. 服务端没有该接口

**排查步骤**：
```bash
# 1. 检查 Feign 客户端路径
@GetMapping("/user/{id}")  # 确认路径

# 2. 检查服务端路径
@RestController
@RequestMapping("/api")  # 注意路径前缀
public class UserController {
    @GetMapping("/user/{id}")  # 实际路径：/api/user/{id}
}

# 3. 直接访问服务提供者
curl http://localhost:8001/user/1
```

**解决方案**：
```java
// 方案1：Feign 客户端添加前缀
@FeignClient(
    name = "user-service",
    path = "/api"  // 统一前缀
)
public interface UserClient {
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}

// 方案2：服务端去掉前缀
@RestController
public class UserController {
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable Long id) {
    }
}
```

---

## 2. 超时问题

### 2.1 读取超时

**现象**：
```
java.net.SocketTimeoutException: Read timed out
```

**原因**：
1. 默认超时时间太短（60秒）
2. 服务端响应慢
3. 网络延迟

**排查步骤**：
```bash
# 1. 查看服务端日志，确认响应时间
# 2. 检查网络延迟
ping user-service-ip

# 3. 查看 Feign 超时配置
```

**解决方案**：
```yaml
# 增加超时时间
feign:
  client:
    config:
      default:
        connectTimeout: 5000  # 连接超时
        readTimeout: 10000   # 读取超时
      
      user-service:  # 慢服务单独配置
        readTimeout: 30000
```

---

### 2.2 连接超时

**现象**：
```
java.net.SocketTimeoutException: connect timed out
```

**原因**：
1. 服务端未启动
2. 网络不通
3. 防火墙拦截

**排查步骤**：
```bash
# 1. 检查服务端是否启动
curl http://user-service-ip:8001/actuator/health

# 2. 检查网络连通性
telnet user-service-ip 8001

# 3. 检查防火墙规则
```

**解决方案**：
1. 启动服务端
2. 检查网络配置
3. 调整防火墙规则

---

## 3. 参数传递问题

### 3.1 参数为 null

**现象**：
- 服务端收到的参数为 null

**原因**：
1. @PathVariable/@RequestParam 未指定 value
2. 参数名编译后丢失

**排查步骤**：
```bash
# 开启 Feign 日志，查看实际请求
feign:
  client:
    config:
      default:
        loggerLevel: FULL

logging:
  level:
    com.demo.order.client: DEBUG
```

**解决方案**：
```java
// ❌ 错误：未指定 value
@GetMapping("/user/{id}")
UserDTO getUser(@PathVariable Long id);

// ✅ 正确：指定 value
@GetMapping("/user/{id}")
UserDTO getUser(@PathVariable("id") Long id);
```

---

### 3.2 对象参数传递失败

**现象**：
- GET 请求传递对象参数，服务端收不到

**原因**：
- GET 请求不支持 @RequestBody

**解决方案**：
```java
// ❌ 错误：GET 请求使用 @RequestBody
@GetMapping("/user/search")
List<UserDTO> searchUsers(@RequestBody UserQuery query);

// ✅ 正确：使用 @SpringQueryMap
@GetMapping("/user/search")
List<UserDTO> searchUsers(@SpringQueryMap UserQuery query);

// 或者改为 POST
@PostMapping("/user/search")
List<UserDTO> searchUsers(@RequestBody UserQuery query);
```

---

### 3.3 日期格式问题

**现象**：
```
Failed to convert value of type 'java.lang.String' to required type 'java.util.Date'
```

**原因**：
- 日期格式不匹配

**解决方案**：
```java
// 方案1：使用时间戳
@GetMapping("/user/search")
List<UserDTO> searchUsers(@RequestParam("startTime") Long startTime);

// 方案2：指定日期格式
@GetMapping("/user/search")
List<UserDTO> searchUsers(
    @RequestParam("startTime") 
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") 
    Date startTime
);

// 方案3：使用 String，服务端自己转换
@GetMapping("/user/search")
List<UserDTO> searchUsers(@RequestParam("startTime") String startTime);
```

---

## 4. 降级问题

### 4.1 降级不生效

**现象**：
- 配置了 fallback，但降级未生效

**原因**：
1. 未开启熔断
2. fallback 类未注册为 Bean

**排查步骤**：
```bash
# 1. 检查熔断配置
feign:
  circuitbreaker:
    enabled: true

# 2. 检查 fallback 类是否是 Bean
@Component
public class UserClientFallback implements UserClient {
}
```

**解决方案**：
```yaml
# 开启熔断
feign:
  circuitbreaker:
    enabled: true
```

```java
// fallback 类必须是 Bean
@Component
public class UserClientFallback implements UserClient {
    
    @Override
    public UserDTO getUser(Long id) {
        UserDTO user = new UserDTO();
        user.setId(id);
        user.setName("默认用户");
        return user;
    }
}
```

---

### 4.2 无法获取异常信息

**现象**：
- 使用 fallback，无法获取异常信息

**原因**：
- fallback 不支持获取异常

**解决方案**：
```java
// 使用 fallbackFactory 代替 fallback
@Component
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    
    @Override
    public UserClient create(Throwable cause) {
        return new UserClient() {
            @Override
            public UserDTO getUser(Long id) {
                log.error("Failed to get user {}", id, cause);
                
                // 根据异常类型返回不同结果
                if (cause instanceof FeignException.NotFound) {
                    throw new NotFoundException("User not found: " + id);
                }
                
                UserDTO user = new UserDTO();
                user.setId(id);
                user.setName("默认用户");
                return user;
            }
        };
    }
}

@FeignClient(
    name = "user-service",
    fallbackFactory = UserClientFallbackFactory.class
)
public interface UserClient {
}
```

---

## 5. 性能问题

### 5.1 响应慢

**现象**：
- Feign 调用响应时间长

**排查步骤**：
```bash
# 1. 开启日志，查看耗时
feign:
  client:
    config:
      default:
        loggerLevel: BASIC

# 查看日志
[UserClient#getUser] <--- HTTP/1.1 200 (2500ms)  # 响应耗时

# 2. 检查服务端性能
# 查看服务端日志，确认处理时间

# 3. 检查网络延迟
ping user-service-ip
```

**解决方案**：
```yaml
# 1. 优化服务端性能
# 2. 使用连接池
feign:
  okhttp:
    enabled: true

# 3. 开启压缩
feign:
  compression:
    request:
      enabled: true
    response:
      enabled: true

# 4. 使用缓存
@Cacheable(value = "users", key = "#userId")
public UserDTO getUser(Long userId) {
    return userClient.getUser(userId);
}
```

---

### 5.2 并发高时性能差

**现象**：
- 并发请求增多时，性能下降

**原因**：
1. 未使用连接池
2. 连接池配置不合理

**解决方案**：
```yaml
# 使用 OkHttp 连接池
feign:
  okhttp:
    enabled: true
```

```java
@Bean
public OkHttpClient okHttpClient() {
    return new OkHttpClient.Builder()
        .connectionPool(new ConnectionPool(
            200,  // 最大空闲连接数
            5,    // 存活时间
            TimeUnit.MINUTES
        ))
        .build();
}
```

---

## 6. 序列化问题

### 6.1 反序列化失败

**现象**：
```
com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: 
Unrecognized field "xxx"
```

**原因**：
- 响应体包含未定义的字段

**解决方案**：
```java
// 方案1：忽略未知字段
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class UserDTO {
    private Long id;
    private String name;
}

// 方案2：全局配置
@Bean
public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    return mapper;
}
```

---

### 6.2 日期序列化问题

**现象**：
```
Failed to deserialize java.util.Date value
```

**解决方案**：
```java
// 方案1：使用 @JsonFormat
@Data
public class UserDTO {
    private Long id;
    private String name;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date createTime;
}

// 方案2：全局配置
@Bean
public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
    mapper.setTimeZone(TimeZone.getTimeZone("GMT+8"));
    return mapper;
}

// 方案3：使用 LocalDateTime
@Data
public class UserDTO {
    private Long id;
    private String name;
    private LocalDateTime createTime;
}
```

---

## 7. 配置问题

### 7.1 配置不生效

**现象**：
- 配置了超时时间，但不生效

**排查步骤**：
```bash
# 1. 检查配置优先级
# 代码配置 > 特定服务配置 > 全局配置 > 默认值

# 2. 检查配置是否被覆盖
```

**解决方案**：
```yaml
# 确保配置层级正确
feign:
  client:
    config:
      default:  # 全局配置
        connectTimeout: 5000
        readTimeout: 10000
      
      user-service:  # 特定服务配置（优先级高）
        connectTimeout: 3000
        readTimeout: 8000
```

---

### 7.2 配置类被重复扫描

**现象**：
```
The bean 'xxx' could not be registered. A bean with that name has already been defined
```

**原因**：
- Feign 配置类被 @ComponentScan 扫描

**解决方案**：
```java
// ❌ 错误：配置类在主启动类包内
package com.demo.order;  // 主启动类包
@Configuration
public class FeignConfig {
}

// ✅ 正确：配置类在独立包内
package com.demo.order.config.feign;  // 独立包，不被扫描
@Configuration
public class FeignConfig {
}
```

---

## 8. 调试技巧

### 8.1 开启详细日志

**配置**：
```yaml
feign:
  client:
    config:
      default:
        loggerLevel: FULL

logging:
  level:
    com.demo.order.client: DEBUG
    feign: DEBUG
```

**日志示例**：
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

### 8.2 查看实际请求

**使用 Postman/curl 验证**：
```bash
# 从日志复制实际请求 URL
curl -X GET http://192.168.1.100:8001/user/1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

---

### 8.3 断点调试

**关键位置**：
1. **Feign 客户端调用处**
2. **LoadBalancerInterceptor**：查看负载均衡过程
3. **SynchronousMethodHandler.invoke()**：查看请求发送过程
4. **ErrorDecoder**：查看异常处理

---

## 9. 监控排查

### 9.1 查看监控指标

**Actuator 端点**：
```bash
# 查看健康状态
curl http://localhost:8002/actuator/health

# 查看 Metrics
curl http://localhost:8002/actuator/metrics

# 查看 Feign 指标
curl http://localhost:8002/actuator/metrics/feign.requests
```

---

### 9.2 查看链路追踪

**Sleuth + Zipkin**：
```bash
# 查看 Zipkin UI
http://localhost:9411

# 搜索 Trace ID，查看完整调用链路
```

---

## 10. 问题排查清单

### 10.1 调用失败排查清单

```
□ 检查服务是否启动
□ 检查 Nacos 注册状态
□ 检查服务名是否一致
□ 检查命名空间、分组是否一致
□ 检查请求路径是否正确
□ 检查参数传递是否正确
□ 开启 FULL 日志，查看实际请求
□ 使用 Postman/curl 验证服务端接口
```

---

### 10.2 性能问题排查清单

```
□ 检查是否使用连接池
□ 检查连接池配置是否合理
□ 检查超时配置是否合理
□ 检查是否开启压缩
□ 检查日志级别（生产环境使用 BASIC）
□ 检查服务端性能
□ 检查网络延迟
□ 检查是否有大对象传输
□ 考虑使用缓存
□ 考虑批量接口
```

---

### 10.3 降级问题排查清单

```
□ 检查是否开启熔断（feign.circuitbreaker.enabled）
□ 检查 fallback 类是否是 Bean
□ 检查 fallback 类是否正确实现接口
□ 使用 fallbackFactory 获取异常信息
□ 检查 Sentinel 规则配置
□ 查看降级日志
```

---

## 11. 学习自检清单

- [ ] 能够排查 Bean 找不到问题
- [ ] 能够排查服务不可用问题
- [ ] 能够排查超时问题
- [ ] 能够排查参数传递问题
- [ ] 能够排查降级不生效问题
- [ ] 能够排查性能问题
- [ ] 能够排查序列化问题
- [ ] 能够排查配置不生效问题
- [ ] 掌握调试技巧
- [ ] 能够使用监控排查问题

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：超时问题、性能问题、降级问题
- **前置知识**：第16-19章 OpenFeign
- **实践建议**：模拟各种故障场景，练习排查

---

**本章小结**：
- 调用失败：Bean 找不到、服务不可用、HTTP 404
- 超时问题：读取超时、连接超时
- 参数传递：参数为 null、对象参数、日期格式
- 降级问题：降级不生效、无法获取异常
- 性能问题：响应慢、并发高时性能差
- 序列化问题：反序列化失败、日期序列化
- 配置问题：配置不生效、配置类重复扫描
- 调试技巧：详细日志、实际请求验证、断点调试
- 监控排查：Actuator 端点、链路追踪
- 问题排查清单：调用失败、性能问题、降级问题

**OpenFeign 部分完成**：第16-20章已完成，涵盖快速入门、高级配置、性能优化、最佳实践、问题排查。接下来进入 Gateway 网关部分（第21-25章）。

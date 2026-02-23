# 第 33 章：企业架构设计

> **学习目标**：掌握基于 Spring 的企业级架构设计实践  
> **预计时长**：2.5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 专家

---

## 1. 分层架构设计

### 1.1 经典三层架构

```
┌─────────────────────────────────┐
│      Controller 层（控制层）      │  ← @RestController, @Controller
│  - 请求处理                      │
│  - 参数校验                      │
│  - 响应封装                      │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│      Service 层（业务层）         │  ← @Service
│  - 业务逻辑                      │
│  - 事务控制                      │
│  - 异常处理                      │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│      DAO 层（数据访问层）         │  ← @Repository
│  - 数据库操作                    │
│  - SQL执行                       │
└─────────────────────────────────┘
```

### 1.2 DDD 分层架构

```
┌─────────────────────────────────┐
│      Interface 层（接口层）       │
│  - API接口                       │
│  - DTO转换                       │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│      Application 层（应用层）     │
│  - 应用服务                      │
│  - 事务编排                      │
│  - DTO/DO转换                    │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│      Domain 层（领域层）          │
│  - 领域模型                      │
│  - 领域服务                      │
│  - 业务规则                      │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│      Infrastructure 层（基础设施）│
│  - 持久化实现                    │
│  - 外部服务调用                  │
└─────────────────────────────────┘
```

---

## 2. 模块化设计

### 2.1 Maven 多模块

```
parent-project/
├── pom.xml                 # 父POM
├── common-module/          # 公共模块
│   └── src/
├── user-module/            # 用户模块
│   └── src/
├── order-module/           # 订单模块
│   └── src/
└── web-module/             # Web模块
    └── src/
```

### 2.2 模块依赖管理

```xml
<!-- 父POM -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.7.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- 子模块 -->
<dependencies>
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>common-module</artifactId>
        <version>${project.version}</version>
    </dependency>
</dependencies>
```

---

## 3. 服务拆分策略

### 3.1 单体应用

**适用场景**：
- 团队规模小
- 业务简单
- 快速迭代

### 3.2 微服务

**拆分原则**：
- 按业务领域拆分
- 单一职责
- 高内聚低耦合
- 独立部署

**架构**：
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Gateway    │───▶│  User       │    │  Order      │
│  网关服务    │    │  Service    │    │  Service    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                  │
                           ▼                  ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  User DB    │    │  Order DB   │
                   └─────────────┘    └─────────────┘
```

---

## 4. 统一异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        ErrorResponse error = ErrorResponse.of(e.getCode(), e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        BindingResult result = e.getBindingResult();
        List<String> errors = result.getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        ErrorResponse error = ErrorResponse.of("VALIDATION_ERROR", String.join(", ", errors));
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("Unexpected error", e);
        ErrorResponse error = ErrorResponse.of("INTERNAL_ERROR", "系统错误");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

---

## 5. 统一响应格式

```java
@Data
@AllArgsConstructor
public class Result<T> {
    private int code;
    private String message;
    private T data;
    
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }
    
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }
}

// Controller
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping
    public Result<List<User>> list() {
        return Result.success(userService.findAll());
    }
    
    @PostMapping
    public Result<User> create(@RequestBody User user) {
        return Result.success(userService.save(user));
    }
}
```

---

## 6. 配置中心集成

```java
@Configuration
public class ConfigCenterConfig {
    
    // Nacos配置
    @Bean
    public NacosConfigManager nacosConfigManager() {
        Properties properties = new Properties();
        properties.put("serverAddr", "localhost:8848");
        properties.put("namespace", "dev");
        return new NacosConfigManager(properties);
    }
    
    // Apollo配置
    @Bean
    public ApolloConfig apolloConfig() {
        System.setProperty("app.id", "my-app");
        System.setProperty("apollo.meta", "http://localhost:8080");
        return ApolloConfig.INSTANCE;
    }
}
```

---

## 7. 服务治理

### 7.1 服务注册与发现

```java
// Eureka Client
@EnableEurekaClient
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

// Nacos
@EnableDiscoveryClient
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

### 7.2 负载均衡

```java
@Configuration
public class LoadBalancerConfig {
    
    @Bean
    @LoadBalanced  // 开启负载均衡
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

// 使用
@Service
public class OrderService {
    @Autowired
    private RestTemplate restTemplate;
    
    public User getUser(Long userId) {
        return restTemplate.getForObject(
            "http://user-service/api/users/" + userId,
            User.class
        );
    }
}
```

---

**上一章** ← [第 32 章：故障诊断与排查](./content-32.md)  
**下一章** → [第 34 章：Spring Boot 集成](./content-34.md)  
**返回目录** → [学习大纲](../content-outline.md)

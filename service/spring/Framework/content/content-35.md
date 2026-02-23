# 第 35 章：微服务实战

> **学习目标**：掌握基于 Spring Cloud 的微服务架构实践  
> **预计时长**：2.5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 专家

---

## 1. 微服务架构设计

### 1.1 核心组件

```
┌─────────────────────────────────────────────────┐
│           Spring Cloud 微服务架构                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Gateway  │    │ Config   │    │ Eureka   │  │
│  │ 网关     │    │ 配置中心  │    │ 注册中心  │  │
│  └──────────┘    └──────────┘    └──────────┘  │
│                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Service A│    │ Service B│    │ Service C│  │
│  │ 业务服务  │    │ 业务服务  │    │ 业务服务  │  │
│  └──────────┘    └──────────┘    └──────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 2. 服务注册与发现

### 2.1 Eureka Server

```java
@EnableEurekaServer
@SpringBootApplication
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

```yaml
# Eureka Server 配置
server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    register-with-eureka: false  # 不注册自己
    fetch-registry: false         # 不拉取注册表
```

### 2.2 Eureka Client

```java
@EnableEurekaClient
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

```yaml
# Eureka Client 配置
spring:
  application:
    name: user-service

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

---

## 3. API 网关

### 3.1 Spring Cloud Gateway

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

```java
@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service  # lb = LoadBalancer
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1       # 移除/api前缀
        
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
```

### 3.2 自定义过滤器

```java
@Component
public class AuthGatewayFilterFactory extends AbstractGatewayFilterFactory<AuthGatewayFilterFactory.Config> {
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            // 鉴权逻辑
            String token = request.getHeaders().getFirst("Authorization");
            if (token == null) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
            
            return chain.filter(exchange);
        };
    }
    
    public static class Config {
        // 配置属性
    }
}
```

---

## 4. 配置中心

### 4.1 Spring Cloud Config

**Config Server**：
```java
@EnableConfigServer
@SpringBootApplication
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

```yaml
server:
  port: 8888

spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your/config-repo
          default-label: master
```

**Config Client**：
```yaml
spring:
  application:
    name: user-service
  cloud:
    config:
      uri: http://localhost:8888
      profile: dev
```

---

## 5. 服务调用

### 5.1 RestTemplate

```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced  // 负载均衡
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class OrderService {
    @Autowired
    private RestTemplate restTemplate;
    
    public User getUser(Long userId) {
        return restTemplate.getForObject(
            "http://user-service/users/" + userId,
            User.class
        );
    }
}
```

### 5.2 OpenFeign

```java
@EnableFeignClients
@SpringBootApplication
public class OrderServiceApplication {
}

@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/users/{id}")
    User getUserById(@PathVariable Long id);
    
    @PostMapping("/users")
    User createUser(@RequestBody User user);
}

@Service
public class OrderService {
    @Autowired
    private UserClient userClient;
    
    public User getUser(Long userId) {
        return userClient.getUserById(userId);
    }
}
```

---

## 6. 熔断降级

### 6.1 Sentinel

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

```java
@Service
public class UserService {
    
    @SentinelResource(
        value = "getUserById",
        blockHandler = "handleBlock",
        fallback = "handleFallback"
    )
    public User getUserById(Long id) {
        return userDao.findById(id);
    }
    
    // 限流处理
    public User handleBlock(Long id, BlockException ex) {
        return new User(id, "限流中");
    }
    
    // 降级处理
    public User handleFallback(Long id, Throwable ex) {
        return new User(id, "服务降级");
    }
}
```

---

## 7. 分布式事务

### 7.1 Seata

```yaml
seata:
  enabled: true
  application-id: user-service
  tx-service-group: my_tx_group
  service:
    vgroup-mapping:
      my_tx_group: default
    grouplist:
      default: 127.0.0.1:8091
```

```java
@Service
public class OrderService {
    
    @GlobalTransactional  // 全局事务
    public void createOrder(Order order) {
        // 1. 创建订单
        orderDao.save(order);
        
        // 2. 扣减库存（远程调用）
        inventoryClient.reduce(order.getProductId(), order.getQuantity());
        
        // 3. 扣减余额（远程调用）
        accountClient.deduct(order.getUserId(), order.getAmount());
    }
}
```

---

## 8. 链路追踪

### 8.1 Sleuth + Zipkin

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-sleuth-zipkin</artifactId>
</dependency>
```

```yaml
spring:
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
      probability: 1.0  # 采样率
```

---

**上一章** ← [第 34 章：Spring Boot 集成](./content-34.md)  
**下一章** → [第 36 章：Spring 核心原理面试题](./content-36.md)  
**返回目录** → [学习大纲](../content-outline.md)

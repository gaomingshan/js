# 第 39 章：Spring Boot 和微服务面试题

> **学习目标**：掌握 Spring Boot 和微服务相关的面试题  
> **预计时长**：1.5 小时  
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. Spring Boot 核心面试题

### 1.1 Spring Boot 的核心特性？

**答案**：
1. **自动配置**：@EnableAutoConfiguration
2. **起步依赖**：spring-boot-starter-*
3. **嵌入式服务器**：Tomcat、Jetty、Undertow
4. **生产就绪**：Actuator 监控
5. **无需 XML 配置**：注解驱动

### 1.2 Spring Boot 自动配置原理？

**答案**：

**流程**：
```
1. @SpringBootApplication
   ├─ @EnableAutoConfiguration
   │     └─ AutoConfigurationImportSelector
   │           └─ 读取 META-INF/spring.factories
   │                 └─ 加载所有自动配置类
   │
   └─ @Conditional 条件装配
         └─ 满足条件则创建 Bean
```

**关键点**：
- **spring.factories**：定义自动配置类列表
- **@ConditionalOnXxx**：条件判断
- **XxxProperties**：配置属性绑定
- **XxxAutoConfiguration**：自动配置类

### 1.3 如何自定义 Starter？

**答案**：

**步骤**：
1. 创建 Maven 项目
2. 定义 `XxxProperties`（@ConfigurationProperties）
3. 定义 `XxxAutoConfiguration`（@Configuration + @Conditional）
4. 创建 `META-INF/spring.factories`
5. 注册自动配置类

**示例**：
```properties
# spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.MyAutoConfiguration
```

---

## 2. 配置管理面试题

### 2.1 配置文件加载顺序？

**答案**（优先级从高到低）：
```
1. 命令行参数
2. SPRING_APPLICATION_JSON
3. ServletConfig/ServletContext 参数
4. JNDI 属性
5. Java 系统属性（System.getProperties()）
6. OS 环境变量
7. RandomValuePropertySource
8. jar 包外的 application-{profile}.properties
9. jar 包内的 application-{profile}.properties
10. jar 包外的 application.properties
11. jar 包内的 application.properties
12. @PropertySource
13. 默认属性
```

### 2.2 如何实现配置热更新？

**答案**：

**方案 1：@RefreshScope**（需要配置中心）：
```java
@RestController
@RefreshScope
public class ConfigController {
    @Value("${config.value}")
    private String value;
}
```

**方案 2：@ConfigurationProperties**：
```java
@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private String name;
    // 自动刷新
}
```

---

## 3. Actuator 监控面试题

### 3.1 Actuator 有哪些常用端点？

**答案**：

| 端点 | 功能 |
|------|------|
| `/health` | 健康检查 |
| `/info` | 应用信息 |
| `/metrics` | 指标信息 |
| `/env` | 环境属性 |
| `/beans` | Bean 列表 |
| `/mappings` | 请求映射 |
| `/loggers` | 日志级别 |
| `/threaddump` | 线程快照 |
| `/heapdump` | 堆转储 |

### 3.2 如何自定义健康检查？

**答案**：
```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        // 检查业务逻辑
        boolean healthy = checkBusinessHealth();
        
        if (healthy) {
            return Health.up()
                .withDetail("message", "服务正常")
                .build();
        } else {
            return Health.down()
                .withDetail("error", "服务异常")
                .build();
        }
    }
}
```

---

## 4. 微服务面试题

### 4.1 微服务的优缺点？

**答案**：

**优点**：
- ✅ 服务独立部署
- ✅ 技术栈灵活
- ✅ 故障隔离
- ✅ 易于扩展

**缺点**：
- ❌ 分布式复杂性
- ❌ 数据一致性难
- ❌ 服务间通信开销
- ❌ 运维难度大

### 4.2 服务注册与发现的原理？

**答案**：

**Eureka 示例**：
```
1. 服务启动
   └─> 向 Eureka Server 注册
       └─> POST /eureka/apps/{app-name}
       └─> 心跳续约（每30秒）

2. 服务发现
   └─> 从 Eureka Server 拉取服务列表
       └─> GET /eureka/apps
       └─> 本地缓存（每30秒刷新）

3. 服务调用
   └─> 从本地缓存获取服务实例
       └─> 负载均衡选择实例
       └─> 发起 HTTP 调用
```

### 4.3 如何实现服务间调用？

**答案**：

**方式对比**：

| 方式 | 优点 | 缺点 |
|------|------|------|
| RestTemplate | 简单 | 代码冗余 |
| Feign | 声明式，简洁 | 性能略低 |
| Dubbo | 性能好 | 强耦合 |
| gRPC | 高性能 | 学习成本高 |

**Feign 示例**：
```java
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{id}")
    User getUserById(@PathVariable Long id);
}

@Service
public class OrderService {
    @Autowired
    private UserClient userClient;
    
    public void createOrder(Order order) {
        User user = userClient.getUserById(order.getUserId());
        // ...
    }
}
```

---

## 5. 分布式问题

### 5.1 如何解决分布式事务？

**答案**：

**方案对比**：

| 方案 | 一致性 | 性能 | 复杂度 | 适用场景 |
|------|--------|------|--------|---------|
| 2PC | 强一致 | 低 | 中 | 小规模 |
| TCC | 最终一致 | 中 | 高 | 资金业务 |
| Saga | 最终一致 | 高 | 中 | 长事务 |
| 消息队列 | 最终一致 | 高 | 低 | 异步场景 |

**Seata 示例**：
```java
@GlobalTransactional
public void createOrder(Order order) {
    // 1. 创建订单
    orderDao.save(order);
    
    // 2. 扣减库存（远程调用）
    inventoryClient.reduce(order.getProductId(), order.getQuantity());
    
    // 3. 扣减余额（远程调用）
    accountClient.deduct(order.getUserId(), order.getAmount());
}
```

### 5.2 如何实现服务限流？

**答案**：

**方案对比**：

| 方案 | 粒度 | 分布式 | 实现难度 |
|------|------|--------|---------|
| Guava RateLimiter | 单机 | ❌ | 简单 |
| Sentinel | 细粒度 | ✅ | 中等 |
| Gateway 限流 | 网关级 | ✅ | 简单 |
| Redis + Lua | 灵活 | ✅ | 中等 |

**Sentinel 示例**：
```java
@Service
public class UserService {
    
    @SentinelResource(
        value = "getUserById",
        blockHandler = "handleBlock"
    )
    public User getUserById(Long id) {
        return userDao.findById(id);
    }
    
    public User handleBlock(Long id, BlockException ex) {
        return new User(id, "限流中");
    }
}
```

### 5.3 如何实现服务熔断降级？

**答案**：

**熔断器状态**：
```
Closed（关闭）→ Open（打开）→ Half-Open（半开）→ Closed
   ↓              ↓                ↓
 正常调用      快速失败      尝试恢复
```

**Sentinel 熔断**：
```java
@SentinelResource(
    value = "createOrder",
    fallback = "handleFallback",
    blockHandler = "handleBlock"
)
public Order createOrder(Order order) {
    return orderDao.save(order);
}

// 降级处理
public Order handleFallback(Order order, Throwable ex) {
    return new Order(null, "服务降级");
}

// 限流处理
public Order handleBlock(Order order, BlockException ex) {
    return new Order(null, "限流中");
}
```

---

## 6. 配置中心和网关

### 6.1 配置中心的作用？

**答案**：
1. **集中管理配置**：统一维护
2. **配置热更新**：无需重启
3. **环境隔离**：dev/test/prod
4. **版本管理**：配置回滚
5. **权限控制**：安全管理

### 6.2 API 网关的作用？

**答案**：
1. **路由转发**：统一入口
2. **负载均衡**：分发流量
3. **鉴权认证**：统一认证
4. **限流熔断**：保护后端
5. **监控日志**：统一监控
6. **协议转换**：HTTP/RPC

**Spring Cloud Gateway 示例**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

---

## 7. 链路追踪和监控

### 7.1 如何实现分布式链路追踪？

**答案**：

**Sleuth + Zipkin**：
```
请求 → Gateway → Service A → Service B
  TraceId: 123456
  SpanId:  001 → 002 → 003
```

**配置**：
```yaml
spring:
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
      probability: 1.0  # 采样率
```

### 7.2 如何实现服务监控？

**答案**：

**监控方案**：
1. **Prometheus + Grafana**：指标监控
2. **ELK**：日志监控
3. **Skywalking**：APM 性能监控
4. **Spring Boot Admin**：应用监控

---

**上一章** ← [第 38 章：事务和 MVC 面试题](./content-38.md)  
**下一章** → [第 40 章：综合场景面试题](./content-40.md)  
**返回目录** → [学习大纲](../content-outline.md)

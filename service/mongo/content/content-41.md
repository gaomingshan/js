# 配置中心与服务发现集成

## 概述

在 Spring Cloud 微服务体系中，MongoDB 连接配置需要通过配置中心统一管理，并支持动态刷新。本章讲解与 Nacos、Spring Cloud Config 的集成方案。

---

## Spring Cloud Config 管理 MongoDB 配置

### 配置中心存储

```yaml
# Git 仓库中：order-service.yml
spring:
  data:
    mongodb:
      uri: mongodb://order_user:${MONGO_PASS}@mongo1:27017,mongo2:27017/orders?replicaSet=rs0&authSource=admin&maxPoolSize=50

# 敏感配置（密码）通过环境变量或 Vault 注入，不明文存 Git
```

### 客户端配置

```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
# bootstrap.yml（Spring Boot 2.x）或 application.yml（3.x）
spring:
  application:
    name: order-service
  config:
    import: "configserver:http://config-server:8888"
  cloud:
    config:
      fail-fast: true
      retry:
        max-attempts: 6
        initial-interval: 1000
```

---

## Nacos 配置中心集成

```xml
<dependency>
  <groupId>com.alibaba.cloud</groupId>
  <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      config:
        server-addr: nacos:8848
        namespace: production
        group: MONGO_CONFIG
        data-id: order-service-mongo.yml
        file-extension: yaml
        refresh-enabled: true  # 开启动态刷新
```

```
# Nacos 配置中心中存储的配置（order-service-mongo.yml）：
spring:
  data:
    mongodb:
      uri: mongodb://order_user:pass@mongo1:27017/orders
      max-pool-size: 50
```

---

## 动态刷新连接配置（@RefreshScope）

```java
// ⚠️ 注意：MongoClient 连接池不支持真正的动态刷新
// @RefreshScope 可刷新配置属性，但 MongoClient 已建立的连接不会重建
// 通常用于刷新业务层参数，而非底层连接

@Configuration
@RefreshScope
public class MongoProperties {

    @Value("${mongo.query.timeout-ms:5000}")
    private int queryTimeoutMs;

    @Value("${mongo.batch.size:100}")
    private int batchSize;

    // 这些业务参数可以动态刷新
}

// 触发刷新
// POST /actuator/refresh  （单实例）
// 或配合 Spring Cloud Bus 广播到所有实例
```

```yaml
# 开启 refresh 端点
management:
  endpoints:
    web:
      exposure:
        include: refresh,health,info
```

---

## 多 MongoDB 集群配置管理

```yaml
# 应用配置（通过配置中心管理）
mongodb:
  primary:
    uri: mongodb://user:pass@primary-cluster:27017/ecommerce
    max-pool-size: 100
  log:
    uri: mongodb://user:pass@log-cluster:27017/logs
    max-pool-size: 50
  analytics:
    uri: mongodb://user:pass@analytics-cluster:27017/analytics
    max-pool-size: 20
    read-preference: secondary  # 分析库走 Secondary
```

```java
@Configuration
@ConfigurationProperties(prefix = "mongodb")
@Data
public class MultiMongoProperties {
    private MongoInstanceConfig primary;
    private MongoInstanceConfig log;
    private MongoInstanceConfig analytics;

    @Data
    public static class MongoInstanceConfig {
        private String uri;
        private int maxPoolSize = 50;
        private String readPreference = "primary";
    }
}

@Configuration
public class MultiMongoConfig {

    @Autowired
    private MultiMongoProperties props;

    @Primary
    @Bean("primaryMongoTemplate")
    public MongoTemplate primaryMongoTemplate() {
        MongoClient client = buildClient(props.getPrimary());
        return new MongoTemplate(client, "ecommerce");
    }

    @Bean("logMongoTemplate")
    public MongoTemplate logMongoTemplate() {
        MongoClient client = buildClient(props.getLog());
        return new MongoTemplate(client, "logs");
    }

    private MongoClient buildClient(MultiMongoProperties.MongoInstanceConfig config) {
        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(new ConnectionString(config.getUri()))
            .applyToConnectionPoolSettings(b -> b.maxSize(config.getMaxPoolSize()))
            .build();
        return MongoClients.create(settings);
    }
}
```

---

## 熔断降级（Resilience4j）

```xml
<dependency>
  <groupId>io.github.resilience4j</groupId>
  =artifactId>resilience4j-spring-boot3</artifactId>
</dependency>
```

```yaml
resilience4j:
  circuitbreaker:
    instances:
      mongoQuery:
        registerHealthIndicator: true
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        permittedNumberOfCallsInHalfOpenState: 3
        waitDurationInOpenState: 30s
        failureRateThreshold: 50
```

```java
@Service
public class OrderQueryService {

    @Autowired
    private OrderRepository orderRepository;

    @CircuitBreaker(name = "mongoQuery", fallbackMethod = "getOrderFallback")
    @TimeLimiter(name = "mongoQuery")
    public CompletableFuture<Order> getOrder(String orderId) {
        return CompletableFuture.supplyAsync(() ->
            orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId))
        );
    }

    // 降级方法（MongoDB 不可用时返回缓存或默认值）
    public CompletableFuture<Order> getOrderFallback(String orderId, Exception ex) {
        log.error("MongoDB 熔断，orderId: {}", orderId, ex);
        // 从 Redis 缓存获取
        return CompletableFuture.supplyAsync(() -> cacheService.getOrder(orderId));
    }
}
```

---

## 客户端负载均衡

```yaml
# MongoDB 驱动内置副本集负载均衡，无需 Ribbon/LoadBalancer
# 读偏好配置实现读负载均衡
spring:
  data:
    mongodb:
      uri: mongodb://user:pass@mongo1,mongo2,mongo3/db?replicaSet=rs0&readPreference=secondaryPreferred
      # secondaryPreferred：优先读 Secondary，实现读负载均衡
```

---

## 总结

- MongoDB 连接配置通过 Nacos/Config Server 统一管理，密码走 Vault/环境变量
- `@RefreshScope` 可刷新业务配置参数，但 MongoClient 连接池不会重建
- 多 MongoDB 集群通过多个 `MongoTemplate` Bean 管理
- Resilience4j 熔断保护 MongoDB 调用，降级到缓存
- MongoDB 驱动内置副本集感知，`readPreference` 实现读负载均衡

**下一步**：分布式事务替代方案。

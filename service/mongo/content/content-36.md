# Spring Data MongoDB 架构

## 概述

Spring Data MongoDB 是 Spring 生态与 MongoDB 的集成框架，提供了从低级驱动操作到高级 Repository 抽象的完整解决方案。理解其架构层次，有助于在不同场景选择合适的访问方式。

---

## 技术栈版本对应关系

| Spring Boot | Spring Data MongoDB | MongoDB Java Driver | 说明 |
|-------------|--------------------|--------------------|------|
| 3.2.x | 4.2.x | 5.x | 当前推荐 |
| 3.1.x | 4.1.x | 4.x | 稳定版 |
| 2.7.x | 3.4.x | 4.x | 老项目维护 |
| 2.6.x | 3.3.x | 4.x | 已 EOL |

---

## 架构层次

```
┌─────────────────────────────────────────────┐
│          业务代码（Service）                 │
├─────────────────────────────────────────────┤
│  Repository 接口（最高层抽象）               │
│  MongoRepository / ReactiveMongoRepository  │
├─────────────────────────────────────────────┤
│  MongoTemplate / ReactiveMongoTemplate      │
│  （中间层，灵活操作）                        │
├─────────────────────────────────────────────┤
│  MongoOperations 接口                       │
├─────────────────────────────────────────────┤
│  MongoDatabaseFactory                       │
│  （数据库连接工厂）                          │
├─────────────────────────────────────────────┤
│  MongoDB Java Driver                        │
│  com.mongodb.client.MongoClient             │
├─────────────────────────────────────────────┤
│  MongoDB Server                             │
└─────────────────────────────────────────────┘
```

### 三种访问方式对比

| 方式 | 代码量 | 灵活性 | 适用场景 |
|------|--------|--------|----------|
| **Repository** | 极少 | 低 | 标准 CRUD、方法名查询 |
| **MongoTemplate** | 中 | 高 | 复杂查询、聚合、原生操作 |
| **MongoClient** | 多 | 最高 | 特殊需求、性能极致优化 |

---

## MongoDB Java Driver

### 同步驱动 vs 响应式驱动

```xml
<!-- 同步驱动（传统 Spring MVC）-->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>

<!-- 响应式驱动（Spring WebFlux）-->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-mongodb-reactive</artifactId>
</dependency>
```

| 特性 | 同步驱动 | 响应式驱动 |
|------|----------|------------|
| 编程模型 | 阻塞 | Reactor（Mono/Flux）|
| 适用框架 | Spring MVC | Spring WebFlux |
| 接口 | `MongoTemplate` | `ReactiveMongoTemplate` |
| Repository | `MongoRepository` | `ReactiveMongoRepository` |
| 性能 | 线程/请求模型 | 事件循环，高并发 |

---

## Spring Boot 自动装配

```java
// Spring Boot 自动配置流程（无需手动配置）
// 1. MongoAutoConfiguration：创建 MongoClient
// 2. MongoDataAutoConfiguration：创建 MongoDatabaseFactory、MongoTemplate
// 3. MongoRepositoriesAutoConfiguration：扫描并注册 Repository

// 最简配置（application.yml）
spring:
  data:
    mongodb:
      uri: mongodb://admin:pass@localhost:27017/ecommerce?authSource=admin
```

### 自定义 MongoClient Bean

```java
@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Bean
    public MongoClient mongoClient() {
        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(new ConnectionString(mongoUri))
            .applyToConnectionPoolSettings(builder -> builder
                .maxSize(100)
                .minSize(10)
                .maxWaitTime(5000, TimeUnit.MILLISECONDS)
            )
            .applyToSocketSettings(builder -> builder
                .connectTimeout(5000, TimeUnit.MILLISECONDS)
                .readTimeout(30000, TimeUnit.MILLISECONDS)
            )
            // 命令监听器（记录所有 MongoDB 命令，用于监控）
            .addCommandListener(new CommandListener() {
                @Override
                public void commandSucceeded(CommandSucceededEvent event) {
                    if (event.getElapsedTime(TimeUnit.MILLISECONDS) > 100) {
                        log.warn("慢查询: {} {}ms", event.getCommandName(),
                                 event.getElapsedTime(TimeUnit.MILLISECONDS))
                    }
                }
                @Override
                public void commandFailed(CommandFailedEvent event) {
                    log.error("MongoDB 命令失败: {}", event.getCommandName(), event.getThrowable())
                }
            })
            .build();
        return MongoClients.create(settings)
    }
}
```

---

## 文档映射注解

```java
@Document(collection = "orders")  // 映射到 orders 集合
@CompoundIndex(def = "{'userId': 1, 'status': 1, 'createdAt': -1}",
               name = "idx_user_status_created")
public class Order {

    @Id                              // 映射 _id 字段
    private String id;

    @Field("user_id")                // 自定义字段名（数据库中存 user_id）
    private String userId;

    @Indexed                         // 创建单字段索引
    private String orderId;

    @Indexed(expireAfterSeconds = 3600)  // TTL 索引
    private Date expireAt;

    private OrderStatus status;       // 枚举自动映射为字符串

    @DBRef                            // 引用关联（不推荐，用冗余代替）
    private User user;

    @Transient                        // 不持久化到数据库
    private String tempField;

    private List<OrderItem> items;    // 嵌套文档列表

    private LocalDateTime createdAt;  // 日期自动映射
}

@Document
public class OrderItem {
    private String sku;
    private Integer qty;
    @Field("unit_price")
    private BigDecimal price;
}
```

---

## 自动索引创建

```yaml
# application.yml
spring:
  data:
    mongodb:
      auto-index-creation: true   # 开发环境可开启，生产环境建议关闭
```

```java
// 生产环境：手动管理索引（避免启动时意外重建索引）
@Configuration
public class MongoIndexConfig implements InitializingBean {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void afterPropertiesSet() {
        IndexOperations indexOps = mongoTemplate.indexOps(Order.class)
        indexOps.ensureIndex(new Index()
            .on("userId", Sort.Direction.ASC)
            .on("status", Sort.Direction.ASC)
            .on("createdAt", Sort.Direction.DESC)
            .named("idx_user_status_created")
        )
    }
}
```

---

## 同步 vs 响应式选择

```
选择同步（MongoTemplate/MongoRepository）：
  ✅ 现有 Spring MVC 项目
  ✅ 团队熟悉命令式编程
  ✅ 业务逻辑复杂，调试简单
  ✅ 并发量 < 5000 QPS

选择响应式（Reactive）：
  ✅ 新项目，使用 Spring WebFlux
  ✅ 高并发场景（> 10000 QPS）
  ✅ I/O 密集型操作（大量等待 DB 响应）
  ✅ 流式数据处理（Change Streams）
```

---

## 总结

- Spring Data MongoDB 分三层：Repository（最简）→ MongoTemplate（灵活）→ MongoClient（最底层）
- Spring Boot 自动装配，只需配置连接字符串即可使用
- 注解映射：`@Document`、`@Id`、`@Field`、`@Indexed`
- 生产环境关闭 `auto-index-creation`，手动管理索引
- 高并发场景考虑响应式驱动（Spring WebFlux + Reactive）

**下一步**：配置与连接管理详解。

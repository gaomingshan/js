# 配置与连接管理

## 概述

正确的连接配置是 Spring Boot 应用稳定访问 MongoDB 的基础。本章详解连接字符串格式、连接池参数、认证配置、多数据源和健康检查配置。

---

## application.yml 配置详解

```yaml
spring:
  data:
    mongodb:
      # 方式1：URI 格式（推荐，覆盖其他所有配置）
      uri: mongodb://app_user:AppPass@mongo1:27017,mongo2:27017,mongo3:27017/ecommerce?replicaSet=rs0&authSource=admin&maxPoolSize=100&minPoolSize=10&connectTimeoutMS=5000&socketTimeoutMS=30000&readPreference=primaryPreferred&w=majority

      # 方式2：分项配置（简单场景）
      # host: localhost
      # port: 27017
      # database: ecommerce
      # username: app_user
      # password: AppPass
      # authentication-database: admin

      # 自动索引创建（生产环境建议关闭）
      auto-index-creation: false
```

---

## 连接字符串格式

### 标准格式

```
mongodb://[username:password@]host[:port][/database][?options]

# 单机
mongodb://admin:pass@localhost:27017/ecommerce?authSource=admin

# 副本集
mongodb://user:pass@mongo1:27017,mongo2:27017,mongo3:27017/ecommerce?replicaSet=rs0&authSource=admin

# 带 TLS
mongodb://user:pass@mongo1:27017/ecommerce?tls=true&tlsCAFile=/etc/ssl/ca.pem
```

### SRV 格式（Atlas 推荐）

```
mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority

# SRV 自动解析副本集成员，无需手动列出所有节点
```

### 连接字符串常用参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `maxPoolSize` | 最大连接池大小 | 100 |
| `minPoolSize` | 最小连接池大小 | 0 |
| `connectTimeoutMS` | 连接超时 | 10000 |
| `socketTimeoutMS` | Socket 读写超时 | 0（不超时）|
| `serverSelectionTimeoutMS` | 服务器选择超时 | 30000 |
| `maxIdleTimeMS` | 连接最大空闲时间 | 0 |
| `replicaSet` | 副本集名称 | - |
| `readPreference` | 读偏好 | primary |
| `w` | Write Concern | 1 |
| `journal` / `j` | Journal 确认 | false |
| `retryWrites` | 可重试写入 | true |
| `authSource` | 认证数据库 | admin |

---

## Java 代码配置（精细控制）

```java
@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${mongodb.uri}")
    private String mongoUri;

    @Override
    protected String getDatabaseName() {
        return "ecommerce";
    }

    @Override
    public MongoClient mongoClient() {
        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(new ConnectionString(mongoUri))
            .applyToConnectionPoolSettings(builder ->
                builder
                  .maxSize(100)                                    // 最大连接数
                  .minSize(10)                                     // 最小保持连接
                  .maxWaitTime(5000, TimeUnit.MILLISECONDS)        // 等待连接超时
                  .maxConnectionIdleTime(60000, TimeUnit.MILLISECONDS)  // 空闲超时
                  .maxConnectionLifeTime(3600000, TimeUnit.MILLISECONDS) // 连接生命周期
                  .maintenanceInitialDelay(0, TimeUnit.MILLISECONDS)
                  .maintenanceFrequency(60000, TimeUnit.MILLISECONDS)
            )
            .applyToSocketSettings(builder ->
                builder
                  .connectTimeout(5000, TimeUnit.MILLISECONDS)
                  .readTimeout(30000, TimeUnit.MILLISECONDS)
            )
            .applyToServerSettings(builder ->
                builder
                  .heartbeatFrequency(10000, TimeUnit.MILLISECONDS)
                  .minHeartbeatFrequency(500, TimeUnit.MILLISECONDS)
            )
            .readPreference(ReadPreference.primaryPreferred())
            .writeConcern(WriteConcern.MAJORITY.withJournal(true).withWTimeout(5000, TimeUnit.MILLISECONDS))
            .retryWrites(true)
            .retryReads(true)
            .build();

        return MongoClients.create(settings);
    }
}
```

---

## 多数据源配置

```java
@Configuration
public class MultiMongoConfig {

    // 主数据源
    @Primary
    @Bean(name = "primaryMongoClient")
    public MongoClient primaryMongoClient() {
        return MongoClients.create("mongodb://user:pass@primary:27017");
    }

    @Primary
    @Bean(name = "primaryMongoTemplate")
    public MongoTemplate primaryMongoTemplate(
            @Qualifier("primaryMongoClient") MongoClient client) {
        return new MongoTemplate(client, "ecommerce");
    }

    // 日志数据源
    @Bean(name = "logMongoClient")
    public MongoClient logMongoClient() {
        return MongoClients.create("mongodb://user:pass@log-server:27017");
    }

    @Bean(name = "logMongoTemplate")
    public MongoTemplate logMongoTemplate(
            @Qualifier("logMongoClient") MongoClient client) {
        return new MongoTemplate(client, "logs");
    }
}

// 使用多数据源
@Service
public class OrderService {
    @Autowired
    @Qualifier("primaryMongoTemplate")
    private MongoTemplate mongoTemplate;

    @Autowired
    @Qualifier("logMongoTemplate")
    private MongoTemplate logMongoTemplate;
}
```

---

## SSL/TLS 安全连接

```yaml
# application.yml
spring:
  data:
    mongodb:
      uri: mongodb://user:pass@host:27017/db?tls=true&authSource=admin
```

```java
// 自定义 TLS 配置
@Bean
public MongoClient mongoClient() throws Exception {
    SSLContext sslContext = SSLContext.getInstance("TLS");
    // ... 加载证书 ...

    MongoClientSettings settings = MongoClientSettings.builder()
        .applyConnectionString(new ConnectionString(uri))
        .applyToSslSettings(builder ->
            builder.enabled(true)
                   .context(sslContext)
                   .invalidHostNameAllowed(false)
        )
        .build();
    return MongoClients.create(settings);
}
```

---

## 健康检查配置

```yaml
# application.yml
management:
  health:
    mongo:
      enabled: true    # 开启 MongoDB 健康检查（默认已开启）
  endpoint:
    health:
      show-details: always
```

```bash
# GET /actuator/health
{
  "status": "UP",
  "components": {
    "mongo": {
      "status": "UP",
      "details": {
        "version": "7.0.4",
        "maxWireVersion": 21
      }
    }
  }
}
```

---

## 连接重试配置

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://...?retryWrites=true&retryReads=true
```

```
retryWrites=true：
  写入失败（网络错误、Primary 切换）时自动重试一次
  不重试：重复键错误、写冲突

retryReads=true（4.x+）：
  读取失败时自动重试一次
  适合：Primary 切换后读取 Secondary
```

---

## 总结

- URI 格式是最简洁、最推荐的连接配置方式
- 生产环境核心参数：`maxPoolSize`、`connectTimeoutMS`、`socketTimeoutMS`
- 多数据源通过多个 `MongoTemplate` Bean 实现，`@Primary` 标记默认
- 开启 `retryWrites=true` 和 `retryReads=true` 提高网络抖动容忍性
- Actuator 健康检查内置支持 MongoDB

**下一步**：Repository 模式与 MongoTemplate 详解。

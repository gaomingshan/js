# 第 40 章：高级 Starter 开发综合实战

综合运用前面所学知识，开发一个功能完整的高级 Starter，包含自动配置、条件装配、配置属性、健康检查等特性。

**学习目标：**
- 掌握高级 Starter 的完整开发流程
- 集成多种 Spring Boot 特性
- 实现生产级 Starter

---

## 40.1 项目需求

开发一个 Redis 缓存 Starter，提供：
1. 自动配置 RedisTemplate
2. 支持多种序列化方式
3. 提供配置属性
4. 集成健康检查
5. 提供 Actuator 端点
6. 支持条件装配

---

## 40.2 项目结构

```
my-redis-spring-boot-starter/
├── pom.xml
└── src/main/
    ├── java/
    │   └── com/example/redis/
    │       ├── autoconfigure/
    │       │   └── MyRedisAutoConfiguration.java
    │       ├── properties/
    │       │   └── MyRedisProperties.java
    │       ├── health/
    │       │   └── RedisHealthIndicator.java
    │       ├── endpoint/
    │       │   └── RedisEndpoint.java
    │       └── serializer/
    │           └── CustomSerializer.java
    └── resources/
        └── META-INF/
            └── spring.factories
```

---

## 40.3 自动配置类

```java
@AutoConfiguration
@ConditionalOnClass(RedisOperations.class)
@EnableConfigurationProperties(MyRedisProperties.class)
public class MyRedisAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean(name = "redisTemplate")
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory factory,
            MyRedisProperties properties) {
        
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        
        // 设置序列化器
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        if ("json".equals(properties.getSerializer())) {
            template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
            template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        } else {
            template.setValueSerializer(new StringRedisSerializer());
            template.setHashValueSerializer(new StringRedisSerializer());
        }
        
        template.afterPropertiesSet();
        return template;
    }
    
    @Bean
    @ConditionalOnProperty(name = "my.redis.health.enabled", havingValue = "true", matchIfMissing = true)
    public RedisHealthIndicator redisHealthIndicator(RedisConnectionFactory factory) {
        return new RedisHealthIndicator(factory);
    }
    
    @Bean
    @ConditionalOnProperty(name = "my.redis.endpoint.enabled", havingValue = "true")
    public RedisEndpoint redisEndpoint(RedisTemplate<String, Object> redisTemplate) {
        return new RedisEndpoint(redisTemplate);
    }
}
```

---

## 40.4 配置属性

```java
@ConfigurationProperties(prefix = "my.redis")
@Validated
public class MyRedisProperties {
    
    /**
     * 序列化方式：string 或 json
     */
    private String serializer = "string";
    
    /**
     * 是否启用健康检查
     */
    private boolean healthEnabled = true;
    
    /**
     * 是否启用 Actuator 端点
     */
    private boolean endpointEnabled = false;
    
    /**
     * 缓存过期时间（秒）
     */
    @Min(0)
    private long ttl = 3600;
    
    // Getters and Setters
}
```

---

## 40.5 健康检查

```java
public class RedisHealthIndicator extends AbstractHealthIndicator {
    
    private final RedisConnectionFactory connectionFactory;
    
    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        RedisConnection connection = null;
        try {
            connection = connectionFactory.getConnection();
            
            if (connection != null) {
                String pong = connection.ping();
                builder.up()
                       .withDetail("version", getRedisVersion(connection))
                       .withDetail("ping", pong);
            } else {
                builder.down().withDetail("error", "Connection is null");
            }
        } catch (Exception e) {
            builder.down().withException(e);
        } finally {
            if (connection != null) {
                connection.close();
            }
        }
    }
    
    private String getRedisVersion(RedisConnection connection) {
        Properties info = connection.info();
        return info.getProperty("redis_version", "unknown");
    }
}
```

---

## 40.6 Actuator 端点

```java
@Endpoint(id = "myredis")
public class RedisEndpoint {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    @ReadOperation
    public Map<String, Object> info() {
        Map<String, Object> info = new HashMap<>();
        info.put("connected", isConnected());
        info.put("dbSize", getDbSize());
        return info;
    }
    
    @WriteOperation
    public String clear() {
        redisTemplate.getConnectionFactory()
                     .getConnection()
                     .flushDb();
        return "Redis cache cleared";
    }
    
    private boolean isConnected() {
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    private long getDbSize() {
        return redisTemplate.getConnectionFactory()
                            .getConnection()
                            .dbSize();
    }
}
```

---

## 40.7 使用示例

### 引入依赖

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>my-redis-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 配置

```yaml
my:
  redis:
    serializer: json
    health-enabled: true
    endpoint-enabled: true
    ttl: 7200
```

### 使用

```java
@Service
public class CacheService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }
    
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }
}
```

---

## 40.8 本章小结

**核心要点：**
1. 综合运用自动配置、条件装配、配置属性
2. 集成健康检查和 Actuator 端点
3. 提供灵活的配置选项
4. 实现了生产级 Starter

**相关章节：**
- [第 25 章：基础 Starter 开发实战](./content-25.md)
- [第 41 章：Actuator 核心端点](./content-41.md)
- [第 42 章：自定义健康检查](./content-42.md)

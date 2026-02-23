# 第 31 章：性能优化实战

> **学习目标**：掌握 Spring 应用性能优化的实战技巧  
> **预计时长**：2.5 小时  
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 容器启动优化

### 1.1 延迟加载

```java
// 全局配置
@Configuration
@EnableAutoConfiguration
public class AppConfig {
    @Bean
    public static LazyInitializationBeanFactoryPostProcessor lazyInit() {
        return new LazyInitializationBeanFactoryPostProcessor();
    }
}

// 单个Bean
@Bean
@Lazy
public UserService userService() {
    return new UserServiceImpl();
}
```

### 1.2 条件装配优化

```java
@Configuration
@ConditionalOnProperty(name = "feature.enabled", havingValue = "true")
public class FeatureConfig {
    // 只在需要时才加载
}
```

---

## 2. Bean 创建优化

### 2.1 单例复用

```java
// 避免频繁创建对象
@Service
public class OrderService {
    private static final DateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");
    
    public String formatDate(Date date) {
        synchronized (DATE_FORMAT) {
            return DATE_FORMAT.format(date);
        }
    }
}

// 或使用ThreadLocal
@Service
public class OrderService {
    private static final ThreadLocal<DateFormat> DATE_FORMAT = 
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
    
    public String formatDate(Date date) {
        return DATE_FORMAT.get().format(date);
    }
}
```

### 2.2 原型作用域优化

```java
// 避免过度使用 prototype
@Bean
@Scope("prototype")  // 谨慎使用
public HeavyObject heavyObject() {
    return new HeavyObject();
}

// 改用对象池
@Service
public class ObjectPoolService {
    private final GenericObjectPool<HeavyObject> pool;
    
    public HeavyObject borrowObject() throws Exception {
        return pool.borrowObject();
    }
    
    public void returnObject(HeavyObject obj) {
        pool.returnObject(obj);
    }
}
```

---

## 3. 数据库访问优化

### 3.1 连接池配置

```java
@Bean
public DataSource dataSource() {
    HikariDataSource ds = new HikariDataSource();
    ds.setJdbcUrl("jdbc:mysql://localhost:3306/db");
    
    // 核心参数
    ds.setMaximumPoolSize(20);  // 最大连接数
    ds.setMinimumIdle(5);       // 最小空闲连接数
    ds.setConnectionTimeout(30000);  // 连接超时
    ds.setIdleTimeout(600000);  // 空闲超时
    ds.setMaxLifetime(1800000); // 最大生命周期
    
    return ds;
}
```

### 3.2 批量操作

```java
@Service
public class UserService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public void batchInsert(List<User> users) {
        String sql = "INSERT INTO user (username, email) VALUES (?, ?)";
        
        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement ps, int i) throws SQLException {
                User user = users.get(i);
                ps.setString(1, user.getUsername());
                ps.setString(2, user.getEmail());
            }
            
            @Override
            public int getBatchSize() {
                return users.size();
            }
        });
    }
}
```

---

## 4. 缓存优化

### 4.1 本地缓存

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(10, TimeUnit.MINUTES));
        return cacheManager;
    }
}

@Service
public class UserService {
    
    @Cacheable(value = "users", key = "#id")
    public User findById(Long id) {
        return userDao.findById(id);
    }
    
    @CacheEvict(value = "users", key = "#user.id")
    public void update(User user) {
        userDao.update(user);
    }
}
```

### 4.2 分布式缓存

```java
@Configuration
public class RedisConfig {
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        
        // JSON序列化
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);
        
        return template;
    }
}
```

---

## 5. 异步处理优化

### 5.1 @Async 异步方法

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}

@Service
public class NotificationService {
    
    @Async
    public void sendEmail(String to, String content) {
        // 异步发送邮件
        emailClient.send(to, content);
    }
}
```

---

## 6. JVM 调优

### 6.1 内存配置

```bash
# 堆内存
java -Xms2g -Xmx2g -jar app.jar

# 年轻代
-Xmn1g

# 元空间
-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m

# GC日志
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log
```

### 6.2 GC 选择

```bash
# G1 GC（推荐）
java -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar app.jar

# ZGC（低延迟）
java -XX:+UseZGC -jar app.jar
```

---

## 7. 监控与诊断

### 7.1 Spring Boot Actuator

```java
// 依赖
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

// 配置
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
```

### 7.2 自定义指标

```java
@Component
public class CustomMetrics {
    private final MeterRegistry registry;
    
    public CustomMetrics(MeterRegistry registry) {
        this.registry = registry;
    }
    
    public void recordOrderCreated() {
        registry.counter("order.created").increment();
    }
    
    public void recordOrderAmount(BigDecimal amount) {
        registry.summary("order.amount").record(amount.doubleValue());
    }
}
```

---

**上一章** ← [第 30 章：SpEL 表达式语言](./content-30.md)  
**下一章** → [第 32 章：故障诊断与排查](./content-32.md)  
**返回目录** → [学习大纲](../content-outline.md)

# 14.2 分布式缓存集成

## 概述

在分布式系统中，本地缓存（MyBatis 一级/二级缓存）无法跨应用实例共享，且存在数据一致性问题。集成 Redis 等分布式缓存是企业级应用的标准做法。

**核心内容：**
- Spring Cache 集成
- Redis 缓存配置
- 缓存一致性方案
- 缓存预热与更新

---

## Spring Cache 集成

### 引入依赖

```xml
<dependencies>
    <!-- Spring Cache -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-cache</artifactId>
    </dependency>
    
    <!-- Redis -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    
    <!-- Lettuce 连接池 -->
    <dependency>
        <groupId>org.apache.commons.</groupId>
        <artifactId>commons-pool2</artifactId>
    </dependency>
</dependencies>
```

### 配置 Redis

```yaml
# application.yml
spring:
  redis:
    host: localhost
    port: 6379
    password:
    database: 0
    
    # Lettuce 连接池配置
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
        max-wait: -1ms
    
    # 连接超时
    timeout: 3000ms
  
  # 缓存配置
  cache:
    type: redis
    redis:
      time-to-live: 3600000  # 缓存过期时间（毫秒）
      cache-null-values: true  # 是否缓存空值
      key-prefix: "cache:"     # 键前缀
      use-key-prefix: true     # 使用键前缀
```

### 启用缓存

```java
/**
 * 启用 Spring Cache
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    /**
     * 自定义缓存配置
     */
    @Bean
    public RedisCacheConfiguration redisCacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
            // 设置过期时间（1小时）
            .entryTtl(Duration.ofHours(1))
            
            // 禁用缓存空值
            .disableCachingNullValues()
            
            // 设置键序列化方式
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new StringRedisSerializer()
                )
            )
            
            // 设置值序列化方式（JSON）
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()
                )
            );
    }
    
    /**
     * 自定义缓存管理器
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = redisCacheConfiguration();
        
        // 针对不同缓存设置不同过期时间
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // 用户缓存：1小时
        cacheConfigurations.put("user", config.entryTtl(Duration.ofHours(1)));
        
        // 部门缓存：24小时
        cacheConfigurations.put("dept", config.entryTtl(Duration.ofHours(24)));
        
        // 配置缓存：永不过期
        cacheConfigurations.put("config", config.entryTtl(Duration.ZERO));
        
        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .withInitialCacheConfigurations(cacheConfigurations)
            .transactionAware()
            .build();
    }
}
```

---

## 使用缓存注解

### @Cacheable

```java
/**
 * @Cacheable：查询时使用缓存
 */
@Service
@CacheConfig(cacheNames = "user")
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 根据 ID 查询（使用缓存）
     */
    @Cacheable(key = "#id")
    @Override
    public User getById(Serializable id) {
        log.info("查询数据库：{}", id);
        return super.getById(id);
    }
    
    /**
     * 条件查询（使用缓存）
     */
    @Cacheable(key = "'list:' + #dto.hashCode()")
    public List<User> list(UserQueryDTO dto) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(dto.getStatus() != null, User::getStatus, dto.getStatus())
               .like(StringUtils.isNotBlank(dto.getName()), User::getName, dto.getName());
        
        return list(wrapper);
    }
    
    /**
     * 条件缓存
     */
    @Cacheable(key = "#id", condition = "#id > 0", unless = "#result == null")
    public User getByIdConditional(Long id) {
        // condition：缓存条件（执行前判断）
        // unless：排除条件（执行后判断）
        return super.getById(id);
    }
}
```

### @CachePut

```java
/**
 * @CachePut：更新缓存
 */
@Service
@CacheConfig(cacheNames = "user")
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 更新用户（同时更新缓存）
     */
    @CachePut(key = "#entity.id")
    @Override
    public boolean updateById(User entity) {
        boolean success = super.updateById(entity);
        
        if (success) {
            log.info("更新缓存：{}", entity.getId());
        }
        
        return success;
    }
}
```

### @CacheEvict

```java
/**
 * @CacheEvict：清除缓存
 */
@Service
@CacheConfig(cacheNames = "user")
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 删除用户（清除缓存）
     */
    @CacheEvict(key = "#id")
    @Override
    public boolean removeById(Serializable id) {
        log.info("清除缓存：{}", id);
        return super.removeById(id);
    }
    
    /**
     * 批量删除（清除所有缓存）
     */
    @CacheEvict(allEntries = true)
    @Override
    public boolean removeByIds(Collection<? extends Serializable> idList) {
        log.info("清除所有缓存");
        return super.removeByIds(idList);
    }
    
    /**
     * 手动清除缓存
     */
    @CacheEvict(key = "#id", beforeInvocation = true)
    public void evictCache(Long id) {
        // beforeInvocation = true：方法执行前清除
        // 即使方法抛异常，缓存也会被清除
        log.info("手动清除缓存：{}", id);
    }
}
```

### @Caching

```java
/**
 * @Caching：组合多个缓存操作
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 更新用户（清除多个缓存）
     */
    @Caching(
        put = {
            @CachePut(value = "user", key = "#entity.id")
        },
        evict = {
            @CacheEvict(value = "userList", allEntries = true),
            @CacheEvict(value = "userStats", allEntries = true)
        }
    )
    public boolean updateById(User entity) {
        return super.updateById(entity);
    }
}
```

---

## 缓存一致性方案

### 方案1：Cache Aside（旁路缓存）

```java
/**
 * Cache Aside 模式
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    @Autowired
    private RedisTemplate<String, User> redisTemplate;
    
    /**
     * 查询：先查缓存，缓存miss再查数据库
     */
    public User getById(Long id) {
        String key = "user:" + id;
        
        // 1. 查询缓存
        User user = redisTemplate.opsForValue().get(key);
        
        if (user != null) {
            log.info("缓存命中：{}", id);
            return user;
        }
        
        // 2. 缓存miss，查询数据库
        log.info("缓存未命中，查询数据库：{}", id);
        user = super.getById(id);
        
        // 3. 写入缓存
        if (user != null) {
            redisTemplate.opsForValue().set(key, user, 1, TimeUnit.HOURS);
        }
        
        return user;
    }
    
    /**
     * 更新：先更新数据库，再删除缓存
     */
    public boolean updateById(User entity) {
        // 1. 更新数据库
        boolean success = super.updateById(entity);
        
        if (success) {
            // 2. 删除缓存
            String key = "user:" + entity.getId();
            redisTemplate.delete(key);
            
            log.info("更新数据库并删除缓存：{}", entity.getId());
        }
        
        return success;
    }
}
```

### 方案2：Read/Write Through（读写穿透）

```java
/**
 * Read/Write Through 模式
 * 应用只与缓存交互，缓存负责与数据库同步
 */
@Service
public class CacheService {
    
    @Autowired
    private RedisTemplate<String, User> redisTemplate;
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 读穿透
     */
    public User get(Long id) {
        String key = "user:" + id;
        
        User user = redisTemplate.opsForValue().get(key);
        
        if (user == null) {
            // 缓存负责从数据库加载
            user = loadFromDatabase(id);
            
            if (user != null) {
                redisTemplate.opsForValue().set(key, user, 1, TimeUnit.HOURS);
            }
        }
        
        return user;
    }
    
    /**
     * 写穿透
     */
    public void put(User user) {
        // 缓存负责写入数据库
        saveToDatabase(user);
        
        // 同步更新缓存
        String key = "user:" + user.getId();
        redisTemplate.opsForValue().set(key, user, 1, TimeUnit.HOURS);
    }
    
    private User loadFromDatabase(Long id) {
        return userMapper.selectById(id);
    }
    
    private void saveToDatabase(User user) {
        if (user.getId() == null) {
            userMapper.insert(user);
        } else {
            userMapper.updateById(user);
        }
    }
}
```

### 方案3：Write Behind（异步写回）

```java
/**
 * Write Behind 模式
 * 先写缓存，异步写数据库
 */
@Service
public class WriteBehindService {
    
    @Autowired
    private RedisTemplate<String, User> redisTemplate;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private ThreadPoolTaskExecutor taskExecutor;
    
    /**
     * 更新（先写缓存，异步写数据库）
     */
    public void update(User user) {
        String key = "user:" + user.getId();
        
        // 1. 立即更新缓存
        redisTemplate.opsForValue().set(key, user, 1, TimeUnit.HOURS);
        
        // 2. 异步更新数据库
        taskExecutor.execute(() -> {
            try {
                userMapper.updateById(user);
                log.info("异步更新数据库成功：{}", user.getId());
            } catch (Exception e) {
                log.error("异步更新数据库失败：{}", user.getId(), e);
                // 失败处理：重试或记录日志
            }
        });
    }
}
```

---

## 缓存预热

### 应用启动时预热

```java
/**
 * 缓存预热
 */
@Component
public class CacheWarmer implements ApplicationRunner {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RedisTemplate<String, User> redisTemplate;
    
    @Override
    public void run(ApplicationArguments args) {
        log.info("开始缓存预热...");
        
        long startTime = System.currentTimeMillis();
        
        // 预热热点数据
        warmupHotData();
        
        long endTime = System.currentTimeMillis();
        log.info("缓存预热完成，耗时：{}ms", endTime - startTime);
    }
    
    private void warmupHotData() {
        // 1. 预热活跃用户
        List<User> activeUsers = userService.lambdaQuery()
            .eq(User::getStatus, 1)
            .orderByDesc(User::getLastLoginTime)
            .last("LIMIT 1000")
            .list();
        
        activeUsers.forEach(user -> {
            String key = "user:" + user.getId();
            redisTemplate.opsForValue().set(key, user, 1, TimeUnit.HOURS);
        });
        
        log.info("预热活跃用户：{}个", activeUsers.size());
        
        // 2. 预热配置数据
        // ...
    }
}
```

---

## 缓存监控

### 缓存统计

```java
/**
 * 缓存统计
 */
@Service
public class CacheStatsService {
    
    @Autowired
    private CacheManager cacheManager;
    
    /**
     * 获取缓存统计信息
     */
    public Map<String, CacheStats> getCacheStats() {
        Map<String, CacheStats> statsMap = new HashMap<>();
        
        Collection<String> cacheNames = cacheManager.getCacheNames();
        
        for (String cacheName : cacheNames) {
            Cache cache = cacheManager.getCache(cacheName);
            
            if (cache instanceof RedisCache) {
                RedisCache redisCache = (RedisCache) cache;
                
                // 获取统计信息
                CacheStats stats = new CacheStats();
                stats.setCacheName(cacheName);
                // stats.setHits(...)
                // stats.setMisses(...)
                
                statsMap.put(cacheName, stats);
            }
        }
        
        return statsMap;
    }
}

@Data
class CacheStats {
    private String cacheName;
    private long hits;
    private long misses;
    private double hitRate;
}
```

---

## 关键点总结

1. **Spring Cache**：简化缓存操作，支持多种缓存实现
2. **Redis 配置**：连接池、序列化、过期时间等
3. **缓存注解**：@Cacheable、@CachePut、@CacheEvict
4. **一致性方案**：Cache Aside、Read/Write Through、Write Behind
5. **缓存预热**：应用启动时加载热点数据
6. **性能监控**：统计缓存命中率、失效情况
7. **最佳实践**：合理设置过期时间、避免缓存雪崩

---

## 参考资料

- [Spring Cache](https://spring.io/guides/gs/caching/)
- [Redis 官方文档](https://redis.io/documentation)

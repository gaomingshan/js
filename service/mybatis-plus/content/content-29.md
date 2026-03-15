# 14.1 MyBatis 缓存机制

## 概述

MyBatis 提供了一级缓存和二级缓存机制，用于减少数据库访问次数，提升查询性能。MyBatis Plus 继承了这套缓存机制，并提供了更便捷的配置方式。

**核心概念：**
- 一级缓存（SqlSession 级别）
- 二级缓存（Mapper 级别）
- 缓存失效机制
- 缓存配置与使用

---

## 一级缓存

### 工作原理

```
一级缓存（默认开启）：
- 作用域：SqlSession
- 生命周期：SqlSession 创建到关闭
- 存储位置：SqlSession 内部的 HashMap

工作流程：
1. 第一次查询 → 查询数据库 → 结果放入缓存
2. 第二次相同查询 → 直接从缓存获取
3. SqlSession 关闭 → 缓存清空
```

### 示例代码

```java
/**
 * 一级缓存测试
 */
@SpringBootTest
public class FirstLevelCacheTest {
    
    @Autowired
    private UserMapper userMapper;
    
    @Test
    public void testFirstLevelCache() {
        // 第一次查询（查询数据库）
        User user1 = userMapper.selectById(1L);
        System.out.println("第一次查询：" + user1);
        
        // 第二次查询（从缓存获取，不查询数据库）
        User user2 = userMapper.selectById(1L);
        System.out.println("第二次查询：" + user2);
        
        // 验证是同一个对象
        System.out.println(user1 == user2);  // true
    }
}

// 执行日志
// SELECT * FROM user WHERE id = 1  （只执行一次）
```

### 缓存失效场景

```java
/**
 * 一级缓存失效场景
 */
@Test
public void testCacheInvalidation() {
    // 1. 第一次查询
    User user1 = userMapper.selectById(1L);
    
    // 2. 执行增删改操作（缓存失效）
    User newUser = new User();
    newUser.setName("新用户");
    userMapper.insert(newUser);
    
    // 3. 再次查询（重新查询数据库）
    User user2 = userMapper.selectById(1L);
    
    System.out.println(user1 == user2);  // false
}

// 其他失效场景：
// 1. SqlSession.clearCache() 手动清除
// 2. SqlSession.close() 关闭会话
// 3. SqlSession.commit() 提交事务
// 4. SqlSession.rollback() 回滚事务
```

### 一级缓存配置

```yaml
# application.yml
mybatis-plus:
  configuration:
    # 一级缓存作用域（默认 SESSION）
    local-cache-scope: SESSION
    # 可选值：
    # SESSION：SqlSession 级别（默认）
    # STATEMENT：禁用一级缓存
```

---

## 二级缓存

### 工作原理

```
二级缓存（默认关闭）：
- 作用域：Mapper（namespace）
- 生命周期：应用运行期间
- 存储位置：独立的缓存区域

工作流程：
1. SqlSession1 查询 → 数据放入一级缓存
2. SqlSession1 关闭 → 一级缓存数据转入二级缓存
3. SqlSession2 查询 → 直接从二级缓存获取
```

### 启用二级缓存

```yaml
# application.yml
mybatis-plus:
  configuration:
    # 启用二级缓存
    cache-enabled: true
```

```java
/**
 * 在 Mapper 接口上启用缓存
 */
@CacheNamespace
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 该 Mapper 的查询结果会被缓存
}

// 或在 XML 中配置
```

```xml
<!-- UserMapper.xml -->
<mapper namespace="com.example.mapper.UserMapper">
    
    <!-- 启用二级缓存 -->
    <cache 
        eviction="LRU"           <!-- 缓存淘汰策略 -->
        flushInterval="60000"    <!-- 刷新间隔（毫秒） -->
        size="512"               <!-- 缓存对象数量 -->
        readOnly="true"/>        <!-- 只读缓存 -->
    
    <!-- 查询语句 -->
    <select id="selectById" resultType="User">
        SELECT * FROM user WHERE id = #{id}
    </select>
</mapper>
```

### 缓存配置参数

```java
/**
 * 二级缓存配置参数
 */
public class CacheConfig {
    
    /**
     * eviction：缓存淘汰策略
     */
    public enum EvictionPolicy {
        LRU,        // 最近最少使用（默认）
        FIFO,       // 先进先出
        SOFT,       // 软引用
        WEAK        // 弱引用
    }
    
    /**
     * flushInterval：刷新间隔
     * - 单位：毫秒
     * - 默认：不设置（永不刷新）
     */
    private long flushInterval = 60000;
    
    /**
     * size：缓存大小
     * - 默认：1024
     */
    private int size = 1024;
    
    /**
     * readOnly：只读缓存
     * - true：直接返回缓存对象（快，不安全）
     * - false：返回缓存对象的副本（慢，安全）
     */
    private boolean readOnly = false;
}
```

### 二级缓存示例

```java
/**
 * 二级缓存测试
 */
@SpringBootTest
public class SecondLevelCacheTest {
    
    @Autowired
    private SqlSessionFactory sqlSessionFactory;
    
    @Test
    public void testSecondLevelCache() {
        // SqlSession1
        try (SqlSession session1 = sqlSessionFactory.openSession()) {
            UserMapper mapper1 = session1.getMapper(UserMapper.class);
            
            // 第一次查询（查询数据库）
            User user1 = mapper1.selectById(1L);
            System.out.println("SqlSession1 查询：" + user1);
            
            // 关闭 session1（数据进入二级缓存）
        }
        
        // SqlSession2
        try (SqlSession session2 = sqlSessionFactory.openSession()) {
            UserMapper mapper2 = session2.getMapper(UserMapper.class);
            
            // 第二次查询（从二级缓存获取）
            User user2 = mapper2.selectById(1L);
            System.out.println("SqlSession2 查询：" + user2);
        }
    }
}

// 执行日志
// Cache Hit Ratio [com.example.mapper.UserMapper]: 0.5
// （命中率50%，第一次miss，第二次hit）
```

---

## 缓存失效机制

### 自动失效

```java
/**
 * 缓存自动失效场景
 */
public class CacheInvalidation {
    
    /**
     * 1. 执行增删改操作
     */
    @Test
    public void testUpdateInvalidation() {
        // 查询（缓存）
        User user1 = userMapper.selectById(1L);
        
        // 更新（缓存失效）
        user1.setName("Updated");
        userMapper.updateById(user1);
        
        // 再次查询（重新查询数据库）
        User user2 = userMapper.selectById(1L);
    }
    
    /**
     * 2. 手动刷新
     */
    @Test
    public void testManualFlush() {
        // 查询
        User user1 = userMapper.selectById(1L);
        
        // 手动清除缓存
        sqlSession.clearCache();
        
        // 再次查询（重新查询数据库）
        User user2 = userMapper.selectById(1L);
    }
    
    /**
     * 3. 达到刷新间隔
     */
    // flushInterval 配置的时间到达后自动刷新
}
```

### 控制缓存行为

```xml
<!-- UserMapper.xml -->
<mapper namespace="com.example.mapper.UserMapper">
    
    <!-- 查询：使用缓存 -->
    <select id="selectById" resultType="User" useCache="true">
        SELECT * FROM user WHERE id = #{id}
    </select>
    
    <!-- 查询：不使用缓存 -->
    <select id="selectRealtime" resultType="User" useCache="false">
        SELECT * FROM user WHERE id = #{id}
    </select>
    
    <!-- 更新：刷新缓存 -->
    <update id="updateById" flushCache="true">
        UPDATE user SET name = #{name} WHERE id = #{id}
    </update>
    
    <!-- 更新：不刷新缓存（不推荐） -->
    <update id="updateWithoutFlush" flushCache="false">
        UPDATE user SET name = #{name} WHERE id = #{id}
    </update>
</mapper>
```

---

## 缓存使用注意事项

### 1. 实体类序列化

```java
/**
 * 二级缓存要求实体类实现 Serializable
 */
@Data
public class User implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Long id;
    private String name;
    private Integer age;
}

// 如果不实现 Serializable，会抛出异常
// org.apache.ibatis.cache.CacheException: 
// Error serializing object. Cause: java.io.NotSerializableException
```

### 2. 缓存穿透问题

```java
/**
 * 问题：查询不存在的数据不会被缓存
 */
@Test
public void testCachePenetration() {
    // 查询不存在的 ID（每次都查询数据库）
    for (int i = 0; i < 100; i++) {
        userMapper.selectById(999999L);  // 不存在
    }
}

// 解决方案：缓存空值
@CacheNamespace(implementation = CustomCache.class)
public interface UserMapper extends BaseMapper<User> {
}

public class CustomCache implements Cache {
    
    private Map<Object, Object> cache = new ConcurrentHashMap<>();
    
    @Override
    public Object getObject(Object key) {
        Object value = cache.get(key);
        
        // 如果是空值标记，返回 null
        if (value == NULL_VALUE) {
            return null;
        }
        
        return value;
    }
    
    @Override
    public void putObject(Object key, Object value) {
        // 空值也缓存（使用特殊标记）
        cache.put(key, value == null ? NULL_VALUE : value);
    }
    
    private static final Object NULL_VALUE = new Object();
}
```

### 3. 缓存雪崩问题

```java
/**
 * 问题：大量缓存同时失效
 */
// 解决方案1：设置不同的过期时间
<cache flushInterval="60000"/>  <!-- 缓存1：60秒 -->
<cache flushInterval="90000"/>  <!-- 缓存2：90秒 -->

// 解决方案2：使用 Redis 等分布式缓存
```

### 4. 多表关联查询

```java
/**
 * 问题：关联查询缓存失效不及时
 */
@Mapper
@CacheNamespace
public interface OrderMapper extends BaseMapper<Order> {
    
    /**
     * 查询订单及用户信息
     */
    @Select("SELECT o.*, u.name as user_name " +
            "FROM `order` o " +
            "LEFT JOIN user u ON o.user_id = u.id " +
            "WHERE o.id = #{id}")
    OrderVO selectWithUser(Long id);
}

// 问题：user 表更新后，order 的缓存不会失效
// 解决方案：关联查询不使用缓存
@Select("SELECT ... ")
@Options(useCache = false)
OrderVO selectWithUser(Long id);
```

---

## MyBatis Plus 缓存配置

### 全局缓存配置

```java
/**
 * MyBatis Plus 全局配置
 */
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 添加插件...
        
        return interceptor;
    }
    
    @Bean
    public ConfigurationCustomizer configurationCustomizer() {
        return configuration -> {
            // 启用二级缓存
            configuration.setCacheEnabled(true);
            
            // 一级缓存作用域
            configuration.setLocalCacheScope(LocalCacheScope.SESSION);
            
            // 延迟加载
            configuration.setLazyLoadingEnabled(true);
            configuration.setAggressiveLazyLoading(false);
        };
    }
}
```

---

## 缓存性能对比

### 测试代码

```java
/**
 * 缓存性能测试
 */
@SpringBootTest
public class CachePerformanceTest {
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 无缓存 vs 一级缓存
     */
    @Test
    public void testFirstLevelCache() {
        int count = 10000;
        
        // 无缓存（每次都查数据库）
        long start1 = System.currentTimeMillis();
        for (int i = 0; i < count; i++) {
            sqlSession.clearCache();  // 清除缓存
            userMapper.selectById(1L);
        }
        long end1 = System.currentTimeMillis();
        System.out.println("无缓存：" + (end1 - start1) + "ms");  // 约5000ms
        
        // 一级缓存
        long start2 = System.currentTimeMillis();
        for (int i = 0; i < count; i++) {
            userMapper.selectById(1L);
        }
        long end2 = System.currentTimeMillis();
        System.out.println("一级缓存：" + (end2 - start2) + "ms");  // 约10ms
        
        // 性能提升：500倍
    }
}
```

---

## 关键点总结

1. **一级缓存**：SqlSession 级别，默认开启，无需配置
2. **二级缓存**：Mapper 级别，需要手动启用
3. **实体序列化**：二级缓存要求实体类实现 Serializable
4. **缓存失效**：增删改操作自动清除缓存
5. **适用场景**：读多写少、数据一致性要求不高
6. **不适用场景**：实时性要求高、多表关联复杂
7. **生产环境**：推荐使用 Redis 等分布式缓存

---

## 参考资料

- [MyBatis 缓存](https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#cache)
- [二级缓存配置](https://baomidou.com/pages/2976a3/)

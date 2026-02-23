# 第 11 章：自定义条件注解开发

## 本章概述

学习如何开发自定义条件注解，实现复杂的条件装配逻辑。

**学习目标：**
- 掌握自定义 Condition 实现
- 学会创建组合条件注解
- 理解条件注解的最佳实践

---

## 11.1 自定义 Condition 实现

### 简单条件示例

```java
public class OnLinuxCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String osName = context.getEnvironment().getProperty("os.name");
        return osName != null && osName.toLowerCase().contains("linux");
    }
}
```

### 带参数的条件

```java
public class OnPropertyCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // 获取注解属性
        Map<String, Object> attributes = metadata.getAnnotationAttributes(
            ConditionalOnCustomProperty.class.getName()
        );
        
        String name = (String) attributes.get("name");
        String havingValue = (String) attributes.get("havingValue");
        
        String actualValue = context.getEnvironment().getProperty(name);
        
        return havingValue.equals(actualValue);
    }
}
```

### 自定义注解

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Conditional(OnPropertyCondition.class)
public @interface ConditionalOnCustomProperty {
    
    String name();
    
    String havingValue() default "";
}
```

### 使用

```java
@Configuration
@ConditionalOnCustomProperty(name = "app.feature.enabled", havingValue = "true")
public class FeatureConfiguration {
    
    @Bean
    public FeatureService featureService() {
        return new FeatureService();
    }
}
```

---

## 11.2 复杂条件实现

### 多条件组合（AND）

```java
public class ComplexCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment env = context.getEnvironment();
        
        // 条件1: 操作系统是 Linux
        String osName = env.getProperty("os.name");
        boolean isLinux = osName != null && osName.toLowerCase().contains("linux");
        
        // 条件2: Java 版本 >= 17
        String javaVersion = env.getProperty("java.version");
        boolean isJava17Plus = javaVersion != null && 
                               Integer.parseInt(javaVersion.split("\\.")[0]) >= 17;
        
        // 条件3: 特定属性存在
        boolean hasProperty = env.containsProperty("app.advanced.enabled");
        
        return isLinux && isJava17Plus && hasProperty;
    }
}
```

### 多条件组合（OR）

```java
public class AnyDatabaseCondition extends AnyNestedCondition {
    
    public AnyDatabaseCondition() {
        super(ConfigurationPhase.REGISTER_BEAN);
    }
    
    @ConditionalOnClass(name = "org.h2.Driver")
    static class OnH2 {
    }
    
    @ConditionalOnClass(name = "com.mysql.cj.jdbc.Driver")
    static class OnMySQL {
    }
    
    @ConditionalOnClass(name = "org.postgresql.Driver")
    static class OnPostgreSQL {
    }
}

@Configuration
@Conditional(AnyDatabaseCondition.class)
public class DatabaseConfiguration {
    // H2 或 MySQL 或 PostgreSQL 任一存在即可
}
```

---

## 11.3 ConfigurationCondition 接口

### 指定评估阶段

```java
public class MyConfigurationCondition implements ConfigurationCondition {
    
    @Override
    public ConfigurationPhase getConfigurationPhase() {
        return ConfigurationPhase.PARSE_CONFIGURATION;
    }
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // 在配置类解析阶段评估
        return context.getEnvironment().containsProperty("my.config.enabled");
    }
}
```

**评估阶段：**
- `PARSE_CONFIGURATION`: 解析配置类时
- `REGISTER_BEAN`: 注册 Bean 时

---

## 11.4 SpringBootCondition 抽象类

### 使用 SpringBootCondition

```java
public class OnDatabaseCondition extends SpringBootCondition {
    
    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context, 
                                           AnnotatedTypeMetadata metadata) {
        String url = context.getEnvironment().getProperty("spring.datasource.url");
        
        if (url == null || url.isEmpty()) {
            return ConditionOutcome.noMatch("No datasource URL configured");
        }
        
        if (url.contains("h2")) {
            return ConditionOutcome.match("H2 database detected");
        }
        
        if (url.contains("mysql")) {
            return ConditionOutcome.match("MySQL database detected");
        }
        
        return ConditionOutcome.noMatch("Unknown database type");
    }
}
```

**优势：**
- 提供更详细的匹配信息
- 支持条件评估报告
- 更好的调试体验

---

## 11.5 实战示例

### 示例1：根据环境加载配置

```java
public class OnProductionEnvironmentCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String[] profiles = context.getEnvironment().getActiveProfiles();
        return Arrays.asList(profiles).contains("prod");
    }
}

@Configuration
@Conditional(OnProductionEnvironmentCondition.class)
public class ProductionConfiguration {
    
    @Bean
    public SecurityConfig securityConfig() {
        return new StrictSecurityConfig();
    }
}
```

### 示例2：根据时间条件

```java
public class OnWorkingHoursCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        int hour = LocalTime.now().getHour();
        return hour >= 9 && hour < 18;  // 工作时间 9:00-18:00
    }
}

@Configuration
@Conditional(OnWorkingHoursCondition.class)
public class WorkingHoursConfiguration {
    
    @Bean
    public TaskScheduler workingHoursScheduler() {
        return new ThreadPoolTaskScheduler();
    }
}
```

### 示例3：根据系统资源

```java
public class OnHighMemoryCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long threshold = 4L * 1024 * 1024 * 1024;  // 4GB
        
        return maxMemory >= threshold;
    }
}

@Configuration
@Conditional(OnHighMemoryCondition.class)
public class HighMemoryConfiguration {
    
    @Bean
    public CacheManager largeCacheManager() {
        return new ConcurrentMapCacheManager();
    }
}
```

---

## 11.6 元注解组合

### 创建组合注解

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@ConditionalOnClass(RedisOperations.class)
@ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true")
@ConditionalOnBean(RedisConnectionFactory.class)
public @interface ConditionalOnRedisAvailable {
}
```

### 使用组合注解

```java
@Configuration
@ConditionalOnRedisAvailable
public class RedisCacheConfiguration {
    
    @Bean
    public CacheManager redisCacheManager(RedisConnectionFactory factory) {
        return RedisCacheManager.create(factory);
    }
}
```

---

## 11.7 最佳实践

### 1. 提供清晰的失败信息

```java
@Override
public ConditionOutcome getMatchOutcome(ConditionContext context, 
                                       AnnotatedTypeMetadata metadata) {
    String property = context.getEnvironment().getProperty("my.feature.enabled");
    
    if (property == null) {
        return ConditionOutcome.noMatch(
            "Property 'my.feature.enabled' is not set. " +
            "Please configure it in application.properties"
        );
    }
    
    if (!"true".equals(property)) {
        return ConditionOutcome.noMatch(
            "Property 'my.feature.enabled' is set to '" + property + "', " +
            "but required value is 'true'"
        );
    }
    
    return ConditionOutcome.match("Feature is enabled");
}
```

### 2. 缓存条件结果

```java
public class CachedCondition implements Condition {
    
    private static final Map<String, Boolean> cache = new ConcurrentHashMap<>();
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String key = generateKey(context, metadata);
        
        return cache.computeIfAbsent(key, k -> {
            // 执行昂贵的条件检查
            return performExpensiveCheck(context, metadata);
        });
    }
}
```

### 3. 使用 @Order 控制评估顺序

```java
@Order(Ordered.HIGHEST_PRECEDENCE)
public class HighPriorityCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // 最先评估的条件
        return true;
    }
}
```

---

## 11.8 本章小结

**核心要点：**
1. 实现 `Condition` 或 `SpringBootCondition` 接口
2. 使用 `ConditionContext` 获取运行时信息
3. 通过元注解组合创建语义化注解
4. 提供清晰的条件评估信息
5. 合理使用缓存优化性能

**相关章节：**
- [第 10 章：ConditionEvaluator 源码分析](./content-10.md)
- [第 12 章：条件装配高级技巧](./content-12.md)

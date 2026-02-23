# 第 9 章：@Conditional 条件注解体系

## 本章概述

深入讲解 Spring Boot 条件装配的核心机制，包括 @Conditional 注解原理、Condition 接口实现、常用条件注解的使用方法。

**学习目标：**
- 理解 @Conditional 注解的工作原理
- 掌握 Condition 接口的实现方法
- 熟练使用常用条件注解
- 理解条件评估的时机和流程

---

## 9.1 @Conditional 注解原理

### 核心思想

**条件装配：** 根据特定条件决定是否创建 Bean 或应用配置。

```java
@Conditional(MyCondition.class)
@Bean
public DataSource dataSource() {
    return new HikariDataSource();
}
// 只有 MyCondition 返回 true 时才创建 Bean
```

### @Conditional 源码

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Conditional {
    Class<? extends Condition>[] value();
}
```

### Condition 接口

```java
@FunctionalInterface
public interface Condition {
    boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata);
}
```

**参数说明：**
- `ConditionContext`: 条件上下文，提供环境、类加载器、Bean工厂等信息
- `AnnotatedTypeMetadata`: 注解元数据，获取注解信息

---

## 9.2 常用条件注解

### 1. @ConditionalOnClass

**作用：** 当指定类存在于 classpath 时条件成立。

```java
@Configuration
@ConditionalOnClass(RedisOperations.class)
public class RedisAutoConfiguration {
    
    @Bean
    public RedisTemplate<Object, Object> redisTemplate() {
        return new RedisTemplate<>();
    }
}
```

**实现原理：**
```java
class OnClassCondition extends FilteringSpringBootCondition {
    
    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context,
                                           AnnotatedTypeMetadata metadata) {
        ClassLoader classLoader = context.getClassLoader();
        
        // 获取注解中指定的类
        List<String> onClasses = getCandidates(metadata, ConditionalOnClass.class);
        
        // 检查类是否存在
        List<String> missing = filter(onClasses, ClassNameFilter.MISSING, classLoader);
        
        if (!missing.isEmpty()) {
            return ConditionOutcome.noMatch("classes not found: " + missing);
        }
        
        return ConditionOutcome.match();
    }
}
```

### 2. @ConditionalOnMissingClass

**作用：** 当指定类不存在时条件成立。

```java
@Configuration
@ConditionalOnMissingClass("com.mongodb.client.MongoClient")
public class SimpleDataConfiguration {
}
```

### 3. @ConditionalOnBean

**作用：** 当指定 Bean 存在时条件成立。

```java
@Configuration
public class MyConfiguration {
    
    @Bean
    @ConditionalOnBean(DataSource.class)
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
```

### 4. @ConditionalOnMissingBean

**作用：** 当指定 Bean 不存在时条件成立（最常用）。

```java
@Bean
@ConditionalOnMissingBean(DataSource.class)
public DataSource dataSource() {
    return new HikariDataSource();
    // 用户未定义 DataSource 时才创建默认的
}
```

### 5. @ConditionalOnProperty

**作用：** 当指定属性满足条件时成立。

```java
@Configuration
@ConditionalOnProperty(
    prefix = "spring.redis",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true  // 属性不存在时是否匹配
)
public class RedisConfiguration {
}
```

### 6. @ConditionalOnWebApplication

**作用：** 当是 Web 应用时条件成立。

```java
@Configuration
@ConditionalOnWebApplication(type = Type.SERVLET)
public class WebMvcConfiguration {
}
```

**类型：**
- `Type.SERVLET`: Servlet Web 应用
- `Type.REACTIVE`: Reactive Web 应用
- `Type.ANY`: 任意 Web 应用

### 7. @ConditionalOnNotWebApplication

**作用：** 当不是 Web 应用时条件成立。

```java
@Configuration
@ConditionalOnNotWebApplication
public class BatchConfiguration {
}
```

### 8. @ConditionalOnResource

**作用：** 当指定资源存在时条件成立。

```java
@Configuration
@ConditionalOnResource(resources = "classpath:schema.sql")
public class DatabaseInitConfiguration {
}
```

### 9. @ConditionalOnExpression

**作用：** 当 SpEL 表达式为 true 时条件成立。

```java
@Bean
@ConditionalOnExpression("${enabled:true} and ${debug:false}")
public MyService myService() {
    return new MyService();
}
```

### 10. @ConditionalOnJava

**作用：** 当 Java 版本满足条件时成立。

```java
@Configuration
@ConditionalOnJava(JavaVersion.SEVENTEEN)
public class Java17Configuration {
}
```

### 11. @ConditionalOnCloudPlatform

**作用：** 当运行在指定云平台时条件成立。

```java
@Configuration
@ConditionalOnCloudPlatform(CloudPlatform.KUBERNETES)
public class K8sConfiguration {
}
```

---

## 9.3 条件注解组合使用

### AND 组合（默认）

```java
@Configuration
@ConditionalOnClass(DataSource.class)
@ConditionalOnBean(PlatformTransactionManager.class)
@ConditionalOnProperty(name = "spring.jpa.enabled", havingValue = "true")
public class JpaConfiguration {
    // 所有条件都满足时才生效
}
```

### OR 组合（使用 AnyNestedCondition）

```java
static class OnRedisCondition extends AnyNestedCondition {
    
    OnRedisCondition() {
        super(ConfigurationPhase.PARSE_CONFIGURATION);
    }
    
    @ConditionalOnProperty(name = "spring.redis.host")
    static class OnHostProperty {
    }
    
    @ConditionalOnProperty(name = "spring.redis.url")
    static class OnUrlProperty {
    }
}

@Configuration
@Conditional(OnRedisCondition.class)
public class RedisConfiguration {
    // host 或 url 任一存在即可
}
```

---

## 9.4 自定义条件注解

### 实现 Condition 接口

```java
public class OnLinuxCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String osName = context.getEnvironment().getProperty("os.name");
        return osName != null && osName.toLowerCase().contains("linux");
    }
}
```

### 创建组合注解

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Conditional(OnLinuxCondition.class)
public @interface ConditionalOnLinux {
}
```

### 使用

```java
@Configuration
@ConditionalOnLinux
public class LinuxConfiguration {
    
    @Bean
    public MyService myService() {
        return new LinuxMyService();
    }
}
```

---

## 9.5 条件评估时机

### 配置类解析阶段

```java
// Phase 1: PARSE_CONFIGURATION - 解析配置类时评估
@Configuration
@ConditionalOnClass(DataSource.class)
public class DatabaseConfiguration {
}
```

### Bean 注册阶段

```java
// Phase 2: REGISTER_BEAN - 注册 Bean 时评估
@Bean
@ConditionalOnMissingBean
public DataSource dataSource() {
    return new HikariDataSource();
}
```

---

## 9.6 ConditionContext 详解

### 接口定义

```java
public interface ConditionContext {
    
    // 获取 BeanDefinitionRegistry
    BeanDefinitionRegistry getRegistry();
    
    // 获取 BeanFactory
    @Nullable
    ConfigurableListableBeanFactory getBeanFactory();
    
    // 获取 Environment
    Environment getEnvironment();
    
    // 获取 ResourceLoader
    ResourceLoader getResourceLoader();
    
    // 获取 ClassLoader
    @Nullable
    ClassLoader getClassLoader();
}
```

### 使用示例

```java
public class MyCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // 1. 检查环境属性
        String property = context.getEnvironment().getProperty("custom.enabled");
        if (!"true".equals(property)) {
            return false;
        }
        
        // 2. 检查 Bean 是否存在
        BeanFactory beanFactory = context.getBeanFactory();
        if (beanFactory != null && beanFactory.containsBean("myBean")) {
            return false;
        }
        
        // 3. 检查类是否存在
        ClassLoader classLoader = context.getClassLoader();
        try {
            Class.forName("com.example.MyClass", false, classLoader);
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    }
}
```

---

## 9.7 常见问题

### 1. @ConditionalOnMissingBean 不生效

**问题：**
```java
@Bean
@ConditionalOnMissingBean(DataSource.class)
public DataSource dataSource() {
    return new HikariDataSource();
}
```

**原因：** Bean 的加载顺序问题，条件评估时用户的 Bean 还未注册。

**解决：** 使用 `@ConditionalOnMissingBean(name = "dataSource")`

### 2. 条件注解位置错误

**错误：**
```java
@Bean
public DataSource dataSource() {
    return new HikariDataSource();
}

@ConditionalOnMissingBean  // ❌ 位置错误
```

**正确：**
```java
@Bean
@ConditionalOnMissingBean  // ✅ 在 @Bean 之后
public DataSource dataSource() {
    return new HikariDataSource();
}
```

---

## 9.8 本章小结

**核心要点：**
1. `@Conditional` 是条件装配的基础
2. Spring Boot 提供了丰富的条件注解
3. 可以自定义条件注解
4. 条件评估在配置类解析和 Bean 注册阶段进行
5. 合理使用条件注解实现自动配置

**相关章节：**
- [第 8 章：自动配置类编写规范](./content-8.md)
- [第 10 章：ConditionEvaluator 源码分析](./content-10.md)

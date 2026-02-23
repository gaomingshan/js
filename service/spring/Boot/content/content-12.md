# 第 12 章：条件装配高级技巧

## 本章概述

深入讲解条件装配的高级应用技巧，包括多条件组合策略、条件优先级控制、调试与排查方法。

**学习目标：**
- 掌握复杂条件组合策略
- 理解条件优先级控制机制
- 学会调试和排查条件装配问题
- 掌握条件装配性能优化技巧

---

## 12.1 多条件组合策略

### 1. AllNestedCondition（AND 关系）

```java
static class AllDatabaseCondition extends AllNestedCondition {
    
    public AllDatabaseCondition() {
        super(ConfigurationPhase.REGISTER_BEAN);
    }
    
    @ConditionalOnClass(name = "org.h2.Driver")
    static class OnH2Class {
    }
    
    @ConditionalOnProperty(name = "spring.datasource.url")
    static class OnUrlProperty {
    }
    
    @ConditionalOnBean(DataSource.class)
    static class OnDataSourceBean {
    }
}

@Configuration
@Conditional(AllDatabaseCondition.class)
public class FullDatabaseConfiguration {
    // 所有条件都满足才生效
}
```

### 2. AnyNestedCondition（OR 关系）

```java
static class AnyDatabaseCondition extends AnyNestedCondition {
    
    public AnyDatabaseCondition() {
        super(ConfigurationPhase.REGISTER_BEAN);
    }
    
    @ConditionalOnClass(name = "org.h2.Driver")
    static class OnH2 {
    }
    
    @ConditionalOnClass(name = "com.mysql.cj.jdbc.Driver")
    static class OnMySQL {
    }
}
```

### 3. NoneNestedCondition（NOT 关系）

```java
static class NoDatabaseCondition extends NoneNestedCondition {
    
    public NoDatabaseCondition() {
        super(ConfigurationPhase.REGISTER_BEAN);
    }
    
    @ConditionalOnClass(name = "org.h2.Driver")
    static class OnH2 {
    }
    
    @ConditionalOnClass(name = "com.mysql.cj.jdbc.Driver")
    static class OnMySQL {
    }
}

@Configuration
@Conditional(NoDatabaseCondition.class)
public class MockDatabaseConfiguration {
    // 没有任何数据库驱动时使用 Mock
}
```

---

## 12.2 条件优先级控制

### 使用 @Order 注解

```java
@Order(Ordered.HIGHEST_PRECEDENCE)
public class FirstCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // 最先评估
        return true;
    }
}

@Order(Ordered.LOWEST_PRECEDENCE)
public class LastCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // 最后评估
        return true;
    }
}
```

### 评估阶段控制

```java
public class ParsePhaseCondition implements ConfigurationCondition {
    
    @Override
    public ConfigurationPhase getConfigurationPhase() {
        return ConfigurationPhase.PARSE_CONFIGURATION;
    }
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // 在解析配置类阶段评估
        return true;
    }
}

public class RegisterPhaseCondition implements ConfigurationCondition {
    
    @Override
    public ConfigurationPhase getConfigurationPhase() {
        return ConfigurationPhase.REGISTER_BEAN;
    }
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        // 在注册 Bean 阶段评估
        return true;
    }
}
```

---

## 12.3 条件装配调试技巧

### 1. 启用 debug 模式

```properties
debug=true
```

**查看条件评估报告：**
```
============================
CONDITIONS EVALUATION REPORT
============================

Positive matches:
-----------------
   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes (OnClassCondition)
      - @ConditionalOnProperty matched (OnPropertyCondition)

Negative matches:
-----------------
   MongoAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.mongodb.client.MongoClient' (OnClassCondition)

Exclusions:
-----------
   None

Unconditional classes:
---------------------
   org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration
```

### 2. 自定义条件评估日志

```java
public class LoggingCondition extends SpringBootCondition {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingCondition.class);
    
    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context, 
                                           AnnotatedTypeMetadata metadata) {
        String property = context.getEnvironment().getProperty("my.feature.enabled");
        
        logger.debug("Evaluating condition for property: my.feature.enabled");
        logger.debug("Property value: {}", property);
        
        if ("true".equals(property)) {
            logger.info("Condition matched: my.feature.enabled=true");
            return ConditionOutcome.match("Feature enabled");
        } else {
            logger.info("Condition not matched: my.feature.enabled={}", property);
            return ConditionOutcome.noMatch("Feature disabled");
        }
    }
}
```

### 3. 使用 Actuator 查看条件

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
management.endpoints.web.exposure.include=conditions
```

访问：`http://localhost:8080/actuator/conditions`

---

## 12.4 条件装配性能优化

### 1. 避免重复计算

```java
public class CachedCondition implements Condition {
    
    private volatile Boolean cachedResult;
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        if (cachedResult != null) {
            return cachedResult;
        }
        
        synchronized (this) {
            if (cachedResult == null) {
                cachedResult = performExpensiveCheck(context);
            }
            return cachedResult;
        }
    }
    
    private boolean performExpensiveCheck(ConditionContext context) {
        // 昂贵的检查逻辑
        return true;
    }
}
```

### 2. 短路评估

```java
@Configuration
@ConditionalOnClass(DataSource.class)  // 先检查类是否存在（快）
@ConditionalOnBean(DataSource.class)   // 再检查 Bean 是否存在（慢）
public class DatabaseConfiguration {
}
```

### 3. 批量检查

```java
public class BatchCheckCondition extends SpringBootCondition {
    
    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context, 
                                           AnnotatedTypeMetadata metadata) {
        ClassLoader classLoader = context.getClassLoader();
        
        // 批量检查多个类
        List<String> classes = Arrays.asList(
            "com.example.ClassA",
            "com.example.ClassB",
            "com.example.ClassC"
        );
        
        List<String> missing = new ArrayList<>();
        for (String className : classes) {
            try {
                Class.forName(className, false, classLoader);
            } catch (ClassNotFoundException e) {
                missing.add(className);
            }
        }
        
        if (!missing.isEmpty()) {
            return ConditionOutcome.noMatch("Missing classes: " + missing);
        }
        
        return ConditionOutcome.match("All classes found");
    }
}
```

---

## 12.5 常见问题排查

### 问题1：条件始终不匹配

**排查步骤：**

1. 启用 debug 模式查看评估报告
2. 检查依赖是否正确引入
3. 检查配置属性是否正确设置
4. 检查条件注解的位置和参数

**示例：**
```java
// 错误：类名拼写错误
@ConditionalOnClass(name = "com.exmaple.MyClass")  // exmaple 拼写错误

// 正确
@ConditionalOnClass(name = "com.example.MyClass")
```

### 问题2：@ConditionalOnMissingBean 不生效

**原因：** Bean 加载顺序问题

**解决方案：**
```java
// 方案1：使用 name 属性
@Bean
@ConditionalOnMissingBean(name = "dataSource")
public DataSource dataSource() {
    return new HikariDataSource();
}

// 方案2：使用 @AutoConfigureAfter
@AutoConfiguration
@AutoConfigureAfter(DataSourceAutoConfiguration.class)
public class MyAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}
```

### 问题3：条件评估阶段错误

**问题：** 在错误的阶段评估条件

**解决：**
```java
// 检查 Bean 是否存在应该在 REGISTER_BEAN 阶段
@Override
public ConfigurationPhase getConfigurationPhase() {
    return ConfigurationPhase.REGISTER_BEAN;
}

// 检查类是否存在可以在 PARSE_CONFIGURATION 阶段
@Override
public ConfigurationPhase getConfigurationPhase() {
    return ConfigurationPhase.PARSE_CONFIGURATION;
}
```

---

## 12.6 实战案例

### 案例1：多环境条件装配

```java
static class OnDevelopmentOrTestCondition extends AnyNestedCondition {
    
    public OnDevelopmentOrTestCondition() {
        super(ConfigurationPhase.PARSE_CONFIGURATION);
    }
    
    @ConditionalOnProperty(name = "spring.profiles.active", havingValue = "dev")
    static class OnDev {
    }
    
    @ConditionalOnProperty(name = "spring.profiles.active", havingValue = "test")
    static class OnTest {
    }
}

@Configuration
@Conditional(OnDevelopmentOrTestCondition.class)
public class NonProductionConfiguration {
    
    @Bean
    public DataSource h2DataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .build();
    }
}
```

### 案例2：功能开关

```java
@Configuration
@ConditionalOnProperty(
    prefix = "app.features",
    name = "advanced-mode",
    havingValue = "true",
    matchIfMissing = false
)
public class AdvancedFeaturesConfiguration {
    
    @Bean
    public AdvancedAnalyticsService analyticsService() {
        return new AdvancedAnalyticsService();
    }
    
    @Bean
    public MachineLearningService mlService() {
        return new MachineLearningService();
    }
}
```

### 案例3：A/B 测试

```java
public class OnABTestGroupCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Map<String, Object> attributes = metadata.getAnnotationAttributes(
            ConditionalOnABTestGroup.class.getName()
        );
        
        String requiredGroup = (String) attributes.get("value");
        String actualGroup = context.getEnvironment().getProperty("app.ab.group");
        
        return requiredGroup.equals(actualGroup);
    }
}

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Conditional(OnABTestGroupCondition.class)
public @interface ConditionalOnABTestGroup {
    String value();
}

@Configuration
@ConditionalOnABTestGroup("A")
public class GroupAConfiguration {
    
    @Bean
    public RecommendationAlgorithm algorithmA() {
        return new CollaborativeFiltering();
    }
}

@Configuration
@ConditionalOnABTestGroup("B")
public class GroupBConfiguration {
    
    @Bean
    public RecommendationAlgorithm algorithmB() {
        return new ContentBased();
    }
}
```

---

## 12.7 最佳实践总结

### 1. 条件注解的使用原则

- **优先使用现有注解**：Spring Boot 提供的条件注解已经覆盖大部分场景
- **复杂条件才自定义**：只在现有注解无法满足时才自定义
- **提供清晰的失败信息**：帮助用户快速定位问题
- **考虑性能影响**：避免在条件评估中执行昂贵操作

### 2. 条件组合策略

- **AND 关系**：直接叠加多个条件注解
- **OR 关系**：使用 `AnyNestedCondition`
- **NOT 关系**：使用 `NoneNestedCondition`
- **复杂逻辑**：自定义 Condition 实现

### 3. 调试技巧

- **启用 debug 模式**：查看完整的条件评估报告
- **使用 Actuator**：实时查看条件状态
- **添加日志**：在自定义条件中记录评估过程
- **单元测试**：测试条件的各种场景

### 4. 性能优化

- **短路评估**：将快速失败的条件放在前面
- **缓存结果**：避免重复计算
- **批量检查**：一次性检查多个条件
- **懒加载**：延迟昂贵的检查操作

---

## 12.8 本章小结

**核心要点：**

1. **多条件组合**
   - AllNestedCondition（AND）
   - AnyNestedCondition（OR）
   - NoneNestedCondition（NOT）

2. **优先级控制**
   - @Order 注解
   - ConfigurationPhase 阶段

3. **调试技巧**
   - debug 模式
   - Actuator 端点
   - 自定义日志

4. **性能优化**
   - 短路评估
   - 结果缓存
   - 批量检查

5. **最佳实践**
   - 优先使用现有注解
   - 提供清晰的失败信息
   - 考虑性能影响
   - 充分测试

**相关章节：**
- [第 11 章：自定义条件注解开发](./content-11.md)
- [第 13 章：配置文件加载机制](./content-13.md)

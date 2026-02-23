# 第 10 章：ConditionEvaluator 源码分析

## 本章概述

深入分析条件评估器 `ConditionEvaluator` 的源码实现，理解条件评估的完整流程。

**学习目标：**
- 掌握 ConditionEvaluator 的工作流程
- 理解 matches() 方法的实现细节
- 掌握 ConditionContext 的创建过程
- 了解条件评估的优化机制

---

## 10.1 ConditionEvaluator 核心方法

### shouldSkip() 方法

```java
public boolean shouldSkip(@Nullable AnnotatedTypeMetadata metadata, @Nullable ConfigurationPhase phase) {
    // 1. 没有条件注解，不跳过
    if (metadata == null || !metadata.isAnnotated(Conditional.class.getName())) {
        return false;
    }
    
    // 2. 如果没有指定阶段，推断阶段
    if (phase == null) {
        if (metadata instanceof AnnotationMetadata &&
            ConfigurationClassUtils.isConfigurationCandidate((AnnotationMetadata) metadata)) {
            return shouldSkip(metadata, ConfigurationPhase.PARSE_CONFIGURATION);
        }
        return shouldSkip(metadata, ConfigurationPhase.REGISTER_BEAN);
    }
    
    // 3. 获取所有条件类
    List<Condition> conditions = new ArrayList<>();
    for (String[] conditionClasses : getConditionClasses(metadata)) {
        for (String conditionClass : conditionClasses) {
            Condition condition = getCondition(conditionClass, this.context.getClassLoader());
            conditions.add(condition);
        }
    }
    
    // 4. 排序
    AnnotationAwareOrderComparator.sort(conditions);
    
    // 5. 评估所有条件
    for (Condition condition : conditions) {
        ConfigurationPhase requiredPhase = null;
        if (condition instanceof ConfigurationCondition) {
            requiredPhase = ((ConfigurationCondition) condition).getConfigurationPhase();
        }
        
        // 匹配阶段才评估
        if ((requiredPhase == null || requiredPhase == phase) && 
            !condition.matches(this.context, metadata)) {
            return true;  // 有一个不匹配就跳过
        }
    }
    
    return false;
}
```

**评估流程：**
```
1. 检查是否有 @Conditional 注解
    ↓
2. 推断或获取配置阶段
    ↓
3. 获取所有条件类
    ↓
4. 实例化条件对象
    ↓
5. 按 @Order 排序
    ↓
6. 依次评估每个条件
    ↓
7. 有一个不匹配则跳过
```

---

## 10.2 ConditionContext 实现

### ConditionContextImpl

```java
private static class ConditionContextImpl implements ConditionContext {
    
    @Nullable
    private final BeanDefinitionRegistry registry;
    
    @Nullable
    private final ConfigurableListableBeanFactory beanFactory;
    
    private final Environment environment;
    
    private final ResourceLoader resourceLoader;
    
    @Nullable
    private final ClassLoader classLoader;
    
    public ConditionContextImpl(@Nullable BeanDefinitionRegistry registry,
                                @Nullable Environment environment, 
                                @Nullable ResourceLoader resourceLoader) {
        this.registry = registry;
        this.beanFactory = deduceBeanFactory(registry);
        this.environment = (environment != null ? environment : deduceEnvironment(registry));
        this.resourceLoader = (resourceLoader != null ? resourceLoader : deduceResourceLoader(registry));
        this.classLoader = deduceClassLoader(resourceLoader, this.beanFactory);
    }
    
    @Override
    public BeanDefinitionRegistry getRegistry() {
        Assert.state(this.registry != null, "No BeanDefinitionRegistry available");
        return this.registry;
    }
    
    @Override
    @Nullable
    public ConfigurableListableBeanFactory getBeanFactory() {
        return this.beanFactory;
    }
    
    @Override
    public Environment getEnvironment() {
        return this.environment;
    }
    
    @Override
    public ResourceLoader getResourceLoader() {
        return this.resourceLoader;
    }
    
    @Override
    @Nullable
    public ClassLoader getClassLoader() {
        return this.classLoader;
    }
}
```

---

## 10.3 条件注解的元数据获取

### AnnotatedTypeMetadata

```java
// 获取注解属性
Map<String, Object> attributes = metadata.getAnnotationAttributes(
    ConditionalOnClass.class.getName()
);

// 获取指定的类
String[] classes = (String[]) attributes.get("value");
```

**示例：**

```java
@ConditionalOnClass(DataSource.class)
public class MyConfiguration {
}

// metadata.getAnnotationAttributes() 返回：
// {
//   "value": [Ljavax/sql/DataSource;,
//   "name": []
// }
```

---

## 10.4 条件评估的性能优化

### 1. 短路评估

```java
for (Condition condition : conditions) {
    if (!condition.matches(this.context, metadata)) {
        return true;  // 有一个不匹配就立即返回，不继续评估
    }
}
```

### 2. 条件缓存

```java
// OnClassCondition 中使用缓存
private final Map<String, Boolean> cache = new ConcurrentHashMap<>();

@Override
public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
    String className = ...;
    return cache.computeIfAbsent(className, key -> {
        try {
            Class.forName(key, false, context.getClassLoader());
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    });
}
```

### 3. 批量检查

```java
// OnClassCondition 批量检查类是否存在
List<String> classes = Arrays.asList("com.example.A", "com.example.B");
List<String> missing = filter(classes, ClassNameFilter.MISSING, classLoader);

if (!missing.isEmpty()) {
    return ConditionOutcome.noMatch("classes not found: " + missing);
}
```

---

## 10.5 条件评估报告

### ConditionEvaluationReport

```java
// 记录条件评估结果
@Bean
public ConditionEvaluationReportLoggingListener conditionEvaluationReportLoggingListener() {
    return new ConditionEvaluationReportLoggingListener();
}
```

**启用 debug 查看报告：**

```properties
debug=true
```

**输出示例：**
```
============================
CONDITIONS EVALUATION REPORT
============================

Positive matches:
-----------------
   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource' (OnClassCondition)

Negative matches:
-----------------
   MongoAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'com.mongodb.client.MongoClient' (OnClassCondition)
```

---

## 10.6 本章小结

**核心流程：**
```
shouldSkip()
→ 获取条件注解
→ 实例化条件对象
→ 排序
→ 依次评估 matches()
→ 返回是否跳过
```

**优化机制：**
1. 短路评估
2. 条件缓存
3. 批量检查

**相关章节：**
- [第 9 章：@Conditional 条件注解体系](./content-9.md)
- [第 11 章：自定义条件注解开发](./content-11.md)

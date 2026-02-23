# 第 5 章：@EnableAutoConfiguration 原理

## 本章概述

`@EnableAutoConfiguration` 是 Spring Boot 自动配置的核心注解，本章将深入讲解其工作原理，包括 @Import 导入机制、AutoConfigurationImportSelector 选择器、DeferredImportSelector 延迟导入等核心机制。

**学习目标：**
- 理解 @Import 导入机制的三种方式
- 掌握 AutoConfigurationImportSelector 工作流程
- 理解 DeferredImportSelector 延迟导入原理
- 掌握自动配置的加载时机

---

## 5.1 @EnableAutoConfiguration 注解回顾

### 5.1.1 注解源码

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {
    
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";
    
    Class<?>[] exclude() default {};
    
    String[] excludeName() default {};
}
```

**关键点：**
1. `@AutoConfigurationPackage`：记录主配置类所在包
2. `@Import(AutoConfigurationImportSelector.class)`：**核心**，导入自动配置选择器

### 5.1.2 自动配置流程概览

```
@EnableAutoConfiguration
    ↓
@Import(AutoConfigurationImportSelector.class)
    ↓
selectImports() 方法
    ↓
读取 META-INF/spring.factories
    ↓
加载所有自动配置类
    ↓
条件过滤（@Conditional*）
    ↓
返回需要导入的配置类名
    ↓
Spring 容器注册这些配置类
```

---

## 5.2 @Import 导入机制

### 5.2.1 @Import 的三种导入方式

Spring 的 `@Import` 注解支持三种导入方式：

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Import {
    Class<?>[] value();
}
```

#### **方式1：导入普通配置类**

```java
// 配置类
@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}

// 导入配置类
@Configuration
@Import(DataSourceConfig.class)
public class AppConfig {
}
```

#### **方式2：导入 ImportSelector**

```java
// 实现 ImportSelector
public class MyImportSelector implements ImportSelector {
    
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        // 返回需要导入的配置类全限定名
        return new String[] {
            "com.example.config.RedisConfig",
            "com.example.config.RabbitMQConfig"
        };
    }
}

// 导入选择器
@Configuration
@Import(MyImportSelector.class)
public class AppConfig {
}
```

**特点：**
- 动态选择需要导入的配置类
- 可以根据条件决定导入哪些类
- 返回配置类的全限定名

#### **方式3：导入 ImportBeanDefinitionRegistrar**

```java
// 实现 ImportBeanDefinitionRegistrar
public class MyImportBeanDefinitionRegistrar implements ImportBeanDefinitionRegistrar {
    
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata,
                                        BeanDefinitionRegistry registry) {
        // 手动注册 BeanDefinition
        RootBeanDefinition beanDefinition = new RootBeanDefinition(MyService.class);
        registry.registerBeanDefinition("myService", beanDefinition);
    }
}

// 导入注册器
@Configuration
@Import(MyImportBeanDefinitionRegistrar.class)
public class AppConfig {
}
```

**特点：**
- 可以手动注册 BeanDefinition
- 更加灵活，可以动态修改 BeanDefinition
- 用于复杂的 Bean 注册场景

### 5.2.2 @Import 导入流程

```java
// ConfigurationClassParser.java
protected void processImports(ConfigurationClass configClass, 
                              SourceClass currentSourceClass,
                              Collection<SourceClass> importCandidates,
                              Predicate<String> exclusionFilter,
                              boolean checkForCircularImports) {
    
    for (SourceClass candidate : importCandidates) {
        if (candidate.isAssignable(ImportSelector.class)) {
            // 1. 处理 ImportSelector
            Class<?> candidateClass = candidate.loadClass();
            ImportSelector selector = ParserStrategyUtils.instantiateClass(...);
            
            // 调用 selectImports() 方法
            String[] importClassNames = selector.selectImports(currentSourceClass.getMetadata());
            
            // 递归处理导入的类
            processImports(configClass, currentSourceClass, asSourceClasses(...), ...);
            
        } else if (candidate.isAssignable(ImportBeanDefinitionRegistrar.class)) {
            // 2. 处理 ImportBeanDefinitionRegistrar
            Class<?> candidateClass = candidate.loadClass();
            ImportBeanDefinitionRegistrar registrar = ParserStrategyUtils.instantiateClass(...);
            
            // 保存到 ConfigurationClass，稍后注册
            configClass.addImportBeanDefinitionRegistrar(registrar, currentSourceClass.getMetadata());
            
        } else {
            // 3. 处理普通配置类
            processConfigurationClass(candidate.asConfigClass(configClass), exclusionFilter);
        }
    }
}
```

**处理顺序：**
```
1. 判断导入类的类型
    ↓
2. ImportSelector → 调用 selectImports()
    ↓
3. ImportBeanDefinitionRegistrar → 保存注册器
    ↓
4. 普通配置类 → 解析配置
```

---

## 5.3 DeferredImportSelector 延迟导入

### 5.3.1 DeferredImportSelector 接口

```java
public interface DeferredImportSelector extends ImportSelector {
    
    @Nullable
    default Class<? extends Group> getImportGroup() {
        return null;
    }
    
    interface Group {
        void process(AnnotationMetadata metadata, DeferredImportSelector selector);
        
        Iterable<Entry> selectImports();
        
        class Entry {
            private final AnnotationMetadata metadata;
            private final String importClassName;
        }
    }
}
```

### 5.3.2 DeferredImportSelector vs ImportSelector

| 对比项 | ImportSelector | DeferredImportSelector |
|--------|---------------|----------------------|
| **执行时机** | 立即执行 | 延迟到所有配置类处理完成后 |
| **执行顺序** | 遇到就执行 | 最后统一执行 |
| **支持分组** | 否 | 是（通过 Group） |
| **适用场景** | 普通导入 | 自动配置、条件导入 |

### 5.3.3 为什么自动配置使用 DeferredImportSelector

**原因1：确保用户配置优先**

```
用户配置类
    ↓ 先处理
@Configuration 配置
    ↓ 后处理
AutoConfiguration 自动配置
```

如果自动配置立即执行，可能会覆盖用户的配置。

**原因2：支持条件注解**

```java
@Configuration
@ConditionalOnMissingBean(DataSource.class)
public class DataSourceAutoConfiguration {
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}
```

延迟执行时，所有用户定义的 Bean 都已注册，条件注解可以正确判断。

**原因3：支持配置类排序**

```java
@AutoConfigureAfter(DataSourceAutoConfiguration.class)
@AutoConfiguration
public class JpaAutoConfiguration {
    // 确保在 DataSourceAutoConfiguration 之后执行
}
```

### 5.3.4 DeferredImportSelector 执行流程

```java
// ConfigurationClassParser.java
public void parse(Set<BeanDefinitionHolder> configCandidates) {
    
    // 1. 处理普通配置类
    for (BeanDefinitionHolder holder : configCandidates) {
        BeanDefinition bd = holder.getBeanDefinition();
        parse(...);
    }
    
    // 2. 处理 DeferredImportSelector（延迟导入）
    this.deferredImportSelectorHandler.process();
}

// DeferredImportSelectorHandler.java
public void process() {
    List<DeferredImportSelectorHolder> deferredImports = this.deferredImportSelectors;
    this.deferredImportSelectors = null;
    
    // 按 Order 排序
    deferredImports.sort(DEFERRED_IMPORT_COMPARATOR);
    
    // 分组处理
    Map<Object, DeferredImportSelectorGrouping> groupings = new LinkedHashMap<>();
    for (DeferredImportSelectorHolder deferredImport : deferredImports) {
        DeferredImportSelector selector = deferredImport.getImportSelector();
        Class<? extends Group> group = selector.getImportGroup();
        
        DeferredImportSelectorGrouping grouping = groupings.computeIfAbsent(...);
        grouping.add(deferredImport);
    }
    
    // 执行分组
    groupings.values().forEach(DeferredImportSelectorGrouping::getImports);
}
```

**执行顺序：**
```
1. 收集所有 DeferredImportSelector
    ↓
2. 按 @Order 排序
    ↓
3. 按 Group 分组
    ↓
4. 每个 Group 内部处理
    ↓
5. 返回最终需要导入的配置类
```

---

## 5.4 AutoConfigurationImportSelector 源码分析

### 5.4.1 类定义

```java
public class AutoConfigurationImportSelector 
    implements DeferredImportSelector, BeanClassLoaderAware, 
               ResourceLoaderAware, BeanFactoryAware, EnvironmentAware, Ordered {
    
    @Override
    public String[] selectImports(AnnotationMetadata annotationMetadata) {
        if (!isEnabled(annotationMetadata)) {
            return NO_IMPORTS;
        }
        
        AutoConfigurationEntry autoConfigurationEntry = 
            getAutoConfigurationEntry(annotationMetadata);
        
        return StringUtils.toStringArray(autoConfigurationEntry.getConfigurations());
    }
    
    @Override
    public Class<? extends Group> getImportGroup() {
        return AutoConfigurationGroup.class;
    }
}
```

### 5.4.2 getAutoConfigurationEntry() 方法

**核心方法：** 获取需要导入的自动配置类。

```java
protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {
    if (!isEnabled(annotationMetadata)) {
        return EMPTY_ENTRY;
    }
    
    // 1. 获取注解属性（exclude、excludeName）
    AnnotationAttributes attributes = getAttributes(annotationMetadata);
    
    // 2. 获取候选配置类（从 spring.factories）
    List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);
    
    // 3. 去重
    configurations = removeDuplicates(configurations);
    
    // 4. 获取排除的配置类
    Set<String> exclusions = getExclusions(annotationMetadata, attributes);
    
    // 5. 检查排除的配置类是否存在
    checkExcludedClasses(configurations, exclusions);
    
    // 6. 移除排除的配置类
    configurations.removeAll(exclusions);
    
    // 7. 过滤（应用条件注解）
    configurations = getConfigurationClassFilter().filter(configurations);
    
    // 8. 触发自动配置导入事件
    fireAutoConfigurationImportEvents(configurations, exclusions);
    
    // 9. 返回
    return new AutoConfigurationEntry(configurations, exclusions);
}
```

**流程图：**
```
1. 检查是否启用自动配置
    ↓
2. 加载 spring.factories 中的配置类
    ↓
3. 去重
    ↓
4. 获取排除的配置类
    ↓
5. 移除排除的配置类
    ↓
6. 应用条件注解过滤
    ↓
7. 触发导入事件
    ↓
8. 返回最终配置类列表
```

### 5.4.3 getCandidateConfigurations() 方法

**加载候选配置类：**

```java
protected List<String> getCandidateConfigurations(AnnotationMetadata metadata,
                                                   AnnotationAttributes attributes) {
    // 从 spring.factories 加载
    List<String> configurations = SpringFactoriesLoader.loadFactoryNames(
        getSpringFactoriesLoaderFactoryClass(),  // EnableAutoConfiguration.class
        getBeanClassLoader()
    );
    
    // 断言不为空
    Assert.notEmpty(configurations,
        "No auto configuration classes found in META-INF/spring.factories...");
    
    return configurations;
}
```

**SpringFactoriesLoader.loadFactoryNames()：**

```java
public static List<String> loadFactoryNames(Class<?> factoryType, ClassLoader classLoader) {
    String factoryTypeName = factoryType.getName();
    return loadSpringFactories(classLoader).getOrDefault(factoryTypeName, Collections.emptyList());
}

private static Map<String, List<String>> loadSpringFactories(ClassLoader classLoader) {
    // 1. 从缓存获取
    Map<String, List<String>> result = cache.get(classLoader);
    if (result != null) {
        return result;
    }
    
    result = new HashMap<>();
    try {
        // 2. 加载所有 META-INF/spring.factories 文件
        Enumeration<URL> urls = classLoader.getResources(FACTORIES_RESOURCE_LOCATION);
        
        while (urls.hasMoreElements()) {
            URL url = urls.nextElement();
            UrlResource resource = new UrlResource(url);
            
            // 3. 解析 properties 文件
            Properties properties = PropertiesLoaderUtils.loadProperties(resource);
            
            for (Map.Entry<?, ?> entry : properties.entrySet()) {
                String factoryTypeName = ((String) entry.getKey()).trim();
                String[] factoryImplementationNames = 
                    StringUtils.commaDelimitedListToStringArray((String) entry.getValue());
                
                for (String factoryImplementationName : factoryImplementationNames) {
                    result.computeIfAbsent(factoryTypeName, key -> new ArrayList<>())
                          .add(factoryImplementationName.trim());
                }
            }
        }
        
        // 4. 缓存结果
        cache.put(classLoader, result);
        
    } catch (IOException ex) {
        throw new IllegalArgumentException("Unable to load factories from location [" +
                FACTORIES_RESOURCE_LOCATION + "]", ex);
    }
    
    return result;
}
```

**加载流程：**
```
1. 扫描 classpath 下所有 META-INF/spring.factories 文件
    ↓
2. 解析 properties 格式
    ↓
3. 根据 key (EnableAutoConfiguration) 获取配置类列表
    ↓
4. 缓存结果
    ↓
5. 返回配置类全限定名列表
```

### 5.4.4 filter() 方法（条件过滤）

**应用条件注解：**

```java
private ConfigurationClassFilter getConfigurationClassFilter() {
    if (this.configurationClassFilter == null) {
        List<AutoConfigurationImportFilter> filters = 
            getAutoConfigurationImportFilters();
        
        for (AutoConfigurationImportFilter filter : filters) {
            invokeAwareMethods(filter);
        }
        
        this.configurationClassFilter = new ConfigurationClassFilter(
            this.beanClassLoader, filters);
    }
    return this.configurationClassFilter;
}

List<String> filter(List<String> configurations) {
    long startTime = System.nanoTime();
    
    String[] candidates = StringUtils.toStringArray(configurations);
    boolean[] match = new boolean[candidates.length];
    boolean skipped = false;
    
    // 应用所有过滤器
    for (AutoConfigurationImportFilter filter : this.filters) {
        boolean[] currentMatch = filter.match(candidates, this.autoConfigurationMetadata);
        
        for (int i = 0; i < currentMatch.length; i++) {
            if (!currentMatch[i]) {
                match[i] = false;
                skipped = true;
            }
        }
    }
    
    // 如果没有被过滤的，直接返回
    if (!skipped) {
        return configurations;
    }
    
    // 返回匹配的配置类
    List<String> result = new ArrayList<>(candidates.length);
    for (int i = 0; i < candidates.length; i++) {
        if (match[i]) {
            result.add(candidates[i]);
        }
    }
    
    return result;
}
```

**过滤器类型：**

```properties
# META-INF/spring.factories
org.springframework.boot.autoconfigure.AutoConfigurationImportFilter=\
org.springframework.boot.autoconfigure.condition.OnBeanCondition,\
org.springframework.boot.autoconfigure.condition.OnClassCondition,\
org.springframework.boot.autoconfigure.condition.OnWebApplicationCondition
```

**过滤流程：**
```
1. 加载所有 AutoConfigurationImportFilter
    ↓
2. 对每个配置类应用过滤器
    ↓
3. OnClassCondition：检查类是否存在
    ↓
4. OnBeanCondition：检查 Bean 是否存在
    ↓
5. OnWebApplicationCondition：检查是否 Web 应用
    ↓
6. 返回匹配的配置类
```

### 5.4.5 AutoConfigurationGroup 分组处理

```java
private static class AutoConfigurationGroup
    implements DeferredImportSelector.Group, BeanClassLoaderAware, BeanFactoryAware,
               ResourceLoaderAware {
    
    private final Map<String, AnnotationMetadata> entries = new LinkedHashMap<>();
    private final List<AutoConfigurationEntry> autoConfigurationEntries = new ArrayList<>();
    
    @Override
    public void process(AnnotationMetadata annotationMetadata,
                        DeferredImportSelector deferredImportSelector) {
        // 获取自动配置条目
        AutoConfigurationEntry autoConfigurationEntry = 
            ((AutoConfigurationImportSelector) deferredImportSelector)
                .getAutoConfigurationEntry(annotationMetadata);
        
        // 保存
        this.autoConfigurationEntries.add(autoConfigurationEntry);
        
        for (String importClassName : autoConfigurationEntry.getConfigurations()) {
            this.entries.putIfAbsent(importClassName, annotationMetadata);
        }
    }
    
    @Override
    public Iterable<Entry> selectImports() {
        // 所有配置类
        List<String> allConfigurations = this.autoConfigurationEntries.stream()
            .map(AutoConfigurationEntry::getConfigurations)
            .flatMap(Collection::stream)
            .collect(Collectors.toList());
        
        // 排序
        List<String> orderedConfigurations = sortAutoConfigurations(
            allConfigurations,
            getAutoConfigurationMetadata()
        );
        
        // 返回
        return orderedConfigurations.stream()
            .map(importClassName -> new Entry(this.entries.get(importClassName), importClassName))
            .collect(Collectors.toList());
    }
}
```

**分组处理流程：**
```
1. process()：收集所有自动配置类
    ↓
2. selectImports()：排序并返回
    ↓
3. 按 @AutoConfigureOrder、@AutoConfigureBefore、@AutoConfigureAfter 排序
    ↓
4. 返回排序后的配置类
```

---

## 5.5 自动配置加载时机

### 5.5.1 完整加载流程

```
SpringApplication.run()
    ↓
prepareContext()
    ↓
load()  # 加载主配置类
    ↓
refreshContext()  # 刷新容器
    ↓
invokeBeanFactoryPostProcessors()
    ↓
ConfigurationClassPostProcessor.postProcessBeanDefinitionRegistry()
    ↓
ConfigurationClassParser.parse()
    ↓
processConfigurationClass()
    ↓
processImports()
    ↓
DeferredImportSelectorHandler.process()  # 延迟导入
    ↓
AutoConfigurationImportSelector.selectImports()
    ↓
getAutoConfigurationEntry()
    ↓
加载、过滤、排序自动配置类
    ↓
注册 BeanDefinition
```

### 5.5.2 时序图

```
用户启动应用
    ↓
SpringApplication.run()
    ├── 1. 创建 ApplicationContext
    ├── 2. 准备 Context
    │   └── 加载主配置类（@SpringBootApplication）
    ├── 3. 刷新 Context
    │   ├── invokeBeanFactoryPostProcessors()
    │   │   └── ConfigurationClassPostProcessor 处理
    │   │       ├── 解析 @Configuration
    │   │       ├── 解析 @ComponentScan
    │   │       ├── 解析 @Import
    │   │       │   ├── 立即处理 ImportSelector
    │   │       │   └── 延迟处理 DeferredImportSelector
    │   │       └── 处理延迟导入
    │   │           └── AutoConfigurationImportSelector
    │   │               ├── 加载 spring.factories
    │   │               ├── 过滤（条件注解）
    │   │               ├── 排序
    │   │               └── 注册 BeanDefinition
    │   └── 实例化 Bean
    └── 4. 启动完成
```

### 5.5.3 为什么延迟加载

**1. 确保用户配置优先**

```java
// 用户配置（先执行）
@Configuration
public class UserConfig {
    @Bean
    public DataSource dataSource() {
        return new MyDataSource();  // 用户自定义
    }
}

// 自动配置（后执行）
@Configuration
@ConditionalOnMissingBean(DataSource.class)  // 检测到用户已定义，不会执行
public class DataSourceAutoConfiguration {
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}
```

**2. 支持条件注解正确判断**

延迟到所有用户配置处理完成后，条件注解才能准确判断 Bean 是否存在。

**3. 支持配置类排序**

```java
@AutoConfigureAfter(DataSourceAutoConfiguration.class)
public class JpaAutoConfiguration {
    // 确保在 DataSource 配置之后
}
```

---

## 5.6 实战示例

### 5.6.1 自定义 ImportSelector

```java
public class MyImportSelector implements ImportSelector {
    
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        // 获取注解属性
        Map<String, Object> attributes = 
            importingClassMetadata.getAnnotationAttributes(EnableMyFeature.class.getName());
        
        boolean enabled = (boolean) attributes.get("enabled");
        
        if (enabled) {
            return new String[] {
                "com.example.config.RedisConfig",
                "com.example.config.RabbitMQConfig"
            };
        }
        
        return new String[0];
    }
}

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(MyImportSelector.class)
public @interface EnableMyFeature {
    boolean enabled() default true;
}

@Configuration
@EnableMyFeature(enabled = true)
public class AppConfig {
}
```

### 5.6.2 自定义 DeferredImportSelector

```java
public class MyDeferredImportSelector implements DeferredImportSelector {
    
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        // 延迟加载配置类
        return new String[] {
            "com.example.config.DelayedConfig"
        };
    }
    
    @Override
    public Class<? extends Group> getImportGroup() {
        return MyGroup.class;
    }
    
    static class MyGroup implements Group {
        
        private final List<Entry> imports = new ArrayList<>();
        
        @Override
        public void process(AnnotationMetadata metadata, DeferredImportSelector selector) {
            String[] importClassNames = selector.selectImports(metadata);
            for (String importClassName : importClassNames) {
                imports.add(new Entry(metadata, importClassName));
            }
        }
        
        @Override
        public Iterable<Entry> selectImports() {
            return imports;
        }
    }
}
```

### 5.6.3 调试自动配置

**启用 debug 日志：**

```properties
# application.properties
debug=true
```

**或命令行：**
```bash
java -jar app.jar --debug
```

**输出：**
```
============================
CONDITIONS EVALUATION REPORT
============================

Positive matches:
-----------------
   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType' (OnClassCondition)

   DataSourceAutoConfiguration.PooledDataSourceConfiguration matched:
      - AnyNestedCondition 0 matched 2 did not; NestedCondition on DataSourceAutoConfiguration.PooledDataSourceCondition.PooledDataSourceAvailable PooledDataSource found supported DataSource; NestedCondition on DataSourceAutoConfiguration.PooledDataSourceCondition.ExplicitType @ConditionalOnProperty (spring.datasource.type) did not find property 'spring.datasource.type' (DataSourceAutoConfiguration.PooledDataSourceCondition)

Negative matches:
-----------------
   ActiveMQAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'jakarta.jms.ConnectionFactory' (OnClassCondition)

   AopAutoConfiguration:
      Did not match:
         - @ConditionalOnProperty (spring.aop.auto=true) did not find property 'auto' (OnPropertyCondition)
```

---

## 5.7 常见问题与易错点

### 5.7.1 自动配置不生效

**问题：** 自动配置类没有生效。

**排查步骤：**

1. **检查依赖是否存在**
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-redis</artifactId>
   </dependency>
   ```

2. **检查条件注解**
   ```java
   @Configuration
   @ConditionalOnClass(RedisOperations.class)  # 类必须存在
   public class RedisAutoConfiguration {
   }
   ```

3. **检查是否被排除**
   ```java
   @SpringBootApplication(exclude = RedisAutoConfiguration.class)  # 被排除了
   public class Application {
   }
   ```

4. **启用 debug 查看报告**
   ```properties
   debug=true
   ```

### 5.7.2 ImportSelector 未执行

**问题：** 自定义 ImportSelector 的 selectImports() 方法未被调用。

**原因：** 忘记使用 @Import 导入。

**错误：**
```java
public class MyImportSelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata metadata) {
        return new String[] {"com.example.Config"};
    }
}

@Configuration  // 没有 @Import ❌
public class AppConfig {
}
```

**正确：**
```java
@Configuration
@Import(MyImportSelector.class)  // 必须导入 ✅
public class AppConfig {
}
```

### 5.7.3 DeferredImportSelector 执行时机错误

**问题：** 以为 DeferredImportSelector 会立即执行。

**实际：** 延迟到所有配置类处理完成后才执行。

```java
@Configuration
@Import(MyDeferredImportSelector.class)
public class AppConfig {
    
    @Bean
    public ServiceA serviceA() {
        // DeferredImportSelector 此时还未执行
        return new ServiceA();
    }
}
```

### 5.7.4 spring.factories 配置错误

**错误格式：**
```properties
# 错误：键名不完整
EnableAutoConfiguration=com.example.MyAutoConfiguration

# 错误：多个类未用逗号分隔
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.Config1 com.example.Config2
```

**正确格式：**
```properties
# 正确：完整键名 + 逗号分隔
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.Config1,\
com.example.Config2
```

---

## 5.8 本章小结

### 核心要点

1. **@Import 导入机制**
   - 三种方式：普通配置类、ImportSelector、ImportBeanDefinitionRegistrar
   - ImportSelector：动态选择配置类
   - ImportBeanDefinitionRegistrar：手动注册 Bean

2. **DeferredImportSelector 延迟导入**
   - 延迟到所有配置类处理完成后执行
   - 确保用户配置优先
   - 支持条件注解正确判断
   - 支持配置类排序

3. **AutoConfigurationImportSelector**
   - selectImports()：选择需要导入的配置类
   - getCandidateConfigurations()：从 spring.factories 加载
   - filter()：应用条件注解过滤
   - AutoConfigurationGroup：分组处理和排序

4. **自动配置加载流程**
   ```
   refreshContext()
   → ConfigurationClassParser.parse()
   → DeferredImportSelectorHandler.process()
   → AutoConfigurationImportSelector.selectImports()
   → getAutoConfigurationEntry()
   → 加载、过滤、排序
   → 注册 BeanDefinition
   ```

5. **调试技巧**
   - 启用 debug 模式查看条件评估报告
   - 查看 Positive matches 和 Negative matches
   - 排查自动配置不生效的原因

### 思维导图

```
@EnableAutoConfiguration
├── @Import 导入机制
│   ├── 普通配置类
│   ├── ImportSelector
│   └── ImportBeanDefinitionRegistrar
├── DeferredImportSelector
│   ├── 延迟执行
│   ├── 用户配置优先
│   └── 支持排序
├── AutoConfigurationImportSelector
│   ├── selectImports()
│   ├── getCandidateConfigurations()
│   │   └── spring.factories
│   ├── filter()
│   │   ├── OnClassCondition
│   │   ├── OnBeanCondition
│   │   └── OnWebApplicationCondition
│   └── AutoConfigurationGroup
│       ├── process()
│       └── selectImports()
└── 加载时机
    ├── refreshContext()
    ├── ConfigurationClassParser
    └── DeferredImportSelectorHandler
```

### 自检清单

- [ ] 理解 @Import 的三种导入方式
- [ ] 掌握 ImportSelector 和 DeferredImportSelector 的区别
- [ ] 理解自动配置延迟加载的原因
- [ ] 掌握 AutoConfigurationImportSelector 的工作流程
- [ ] 了解 spring.factories 的作用和格式
- [ ] 能够调试和排查自动配置问题

---

## 下一章预告

**第 6 章：spring.factories 与 SPI 机制**

将深入讲解 Spring Boot 的 SPI 扩展机制，包括：
- spring.factories 文件格式与规范
- SpringFactoriesLoader 加载原理
- 自定义 SPI 扩展点
- Spring Boot SPI 与 Java SPI 的对比

---

**相关章节：**
- [第 4 章：@SpringBootApplication 注解剖析](./content-4.md)
- [第 6 章：spring.factories 与 SPI 机制](./content-6.md)
- [第 7 章：AutoConfigurationImportSelector 源码](./content-7.md)

# 第 6 章：spring.factories 与 SPI 机制

## 本章概述

`spring.factories` 是 Spring Boot SPI 机制的核心配置文件，本章将深入讲解其文件格式、加载原理、扩展点机制，以及如何自定义 SPI 扩展。

**学习目标：**
- 理解 spring.factories 文件格式与规范
- 掌握 SpringFactoriesLoader 加载原理
- 学会自定义 SPI 扩展点
- 理解 Spring Boot SPI 与 Java SPI 的区别

---

## 6.1 SPI 机制概述

### 6.1.1 什么是 SPI

**SPI（Service Provider Interface）**：服务提供者接口，是一种服务发现机制。

**核心思想：**
```
接口定义与实现分离
    ↓
通过配置文件指定实现类
    ↓
运行时动态加载实现
```

### 6.1.2 Java SPI vs Spring Boot SPI

| 对比项 | Java SPI | Spring Boot SPI |
|--------|---------|----------------|
| **配置文件** | `META-INF/services/接口全限定名` | `META-INF/spring.factories` |
| **文件格式** | 实现类列表（每行一个） | Properties 格式（key=value） |
| **加载方式** | `ServiceLoader.load()` | `SpringFactoriesLoader.loadFactoryNames()` |
| **实例化** | 自动实例化 | 返回类名，由 Spring 容器实例化 |
| **支持多接口** | 每个接口单独文件 | 一个文件配置所有接口 |
| **灵活性** | 低 | 高（支持 Spring 特性） |

### 6.1.3 Java SPI 示例

**接口定义：**
```java
package com.example.spi;

public interface MessageService {
    String getMessage();
}
```

**实现类：**
```java
package com.example.spi.impl;

public class EmailMessageService implements MessageService {
    @Override
    public String getMessage() {
        return "Email Message";
    }
}
```

**配置文件：**
```
# META-INF/services/com.example.spi.MessageService
com.example.spi.impl.EmailMessageService
com.example.spi.impl.SmsMessageService
```

**使用：**
```java
ServiceLoader<MessageService> services = ServiceLoader.load(MessageService.class);
for (MessageService service : services) {
    System.out.println(service.getMessage());
}
```

---

## 6.2 spring.factories 文件详解

### 6.2.1 文件位置

```
src/main/resources/
└── META-INF/
    └── spring.factories
```

**多个 jar 包中都可以有 spring.factories 文件，Spring Boot 会加载所有这些文件。**

### 6.2.2 文件格式

**Properties 格式：**
```properties
# 键：接口/注解的全限定名
# 值：实现类的全限定名，多个用逗号分隔

# 自动配置
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.config.MyAutoConfiguration,\
com.example.config.AnotherAutoConfiguration

# 应用监听器
org.springframework.context.ApplicationListener=\
com.example.listener.MyApplicationListener

# 初始化器
org.springframework.context.ApplicationContextInitializer=\
com.example.initializer.MyInitializer
```

**格式规范：**
1. 使用反斜杠 `\` 换行
2. 多个实现类用逗号分隔
3. 键必须是接口/注解的完整类名
4. 值必须是实现类的完整类名
5. 支持注释（以 `#` 开头）

### 6.2.3 Spring Boot 内置的 SPI 接口

**常用扩展点：**

| SPI 接口 | 作用 | 示例 |
|---------|------|------|
| `EnableAutoConfiguration` | 自动配置类 | `DataSourceAutoConfiguration` |
| `ApplicationContextInitializer` | 上下文初始化 | 自定义初始化器 |
| `ApplicationListener` | 事件监听 | 启动事件监听 |
| `SpringApplicationRunListener` | 启动过程监听 | `EventPublishingRunListener` |
| `EnvironmentPostProcessor` | 环境后处理 | 自定义配置源 |
| `AutoConfigurationImportFilter` | 自动配置过滤 | `OnClassCondition` |
| `AutoConfigurationImportListener` | 自动配置导入监听 | `ConditionEvaluationReportAutoConfigurationImportListener` |
| `FailureAnalyzer` | 失败分析 | `BeanCurrentlyInCreationFailureAnalyzer` |
| `FailureAnalysisReporter` | 失败报告 | `LoggingFailureAnalysisReporter` |

### 6.2.4 spring-boot-autoconfigure 中的 spring.factories

**spring-boot-autoconfigure-3.2.0.jar 中的配置（部分）：**

```properties
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration,\
org.springframework.boot.autoconfigure.aop.AopAutoConfiguration,\
org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,\
org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration,\
org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration,\
org.springframework.boot.autoconfigure.cassandra.CassandraAutoConfiguration,\
org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration,\
org.springframework.boot.autoconfigure.context.LifecycleAutoConfiguration,\
org.springframework.boot.autoconfigure.context.MessageSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration,\
org.springframework.boot.autoconfigure.couchbase.CouchbaseAutoConfiguration,\
org.springframework.boot.autoconfigure.dao.PersistenceExceptionTranslationAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraReactiveDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraReactiveRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.couchbase.CouchbaseDataAutoConfiguration,\
# ...省略数百行
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.websocket.reactive.WebSocketReactiveAutoConfiguration,\
org.springframework.boot.autoconfigure.websocket.servlet.WebSocketServletAutoConfiguration

# Auto Configuration Import Filters
org.springframework.boot.autoconfigure.AutoConfigurationImportFilter=\
org.springframework.boot.autoconfigure.condition.OnBeanCondition,\
org.springframework.boot.autoconfigure.condition.OnClassCondition,\
org.springframework.boot.autoconfigure.condition.OnWebApplicationCondition

# Auto Configuration Import Listeners
org.springframework.boot.autoconfigure.AutoConfigurationImportListener=\
org.springframework.boot.autoconfigure.condition.ConditionEvaluationReportAutoConfigurationImportListener

# Failure analyzers
org.springframework.boot.diagnostics.FailureAnalyzer=\
org.springframework.boot.autoconfigure.data.redis.RedisUrlSyntaxFailureAnalyzer,\
org.springframework.boot.autoconfigure.diagnostics.analyzer.NoSuchBeanDefinitionFailureAnalyzer,\
org.springframework.boot.autoconfigure.flyway.FlywayMigrationScriptMissingFailureAnalyzer,\
org.springframework.boot.autoconfigure.jdbc.DataSourceBeanCreationFailureAnalyzer,\
org.springframework.boot.autoconfigure.jdbc.HikariDriverConfigurationFailureAnalyzer,\
org.springframework.boot.autoconfigure.jooq.NoDslContextBeanFailureAnalyzer,\
org.springframework.boot.autoconfigure.r2dbc.ConnectionFactoryBeanCreationFailureAnalyzer,\
org.springframework.boot.autoconfigure.session.NonUniqueSessionRepositoryFailureAnalyzer

# Template availability providers
org.springframework.boot.autoconfigure.template.TemplateAvailabilityProvider=\
org.springframework.boot.autoconfigure.freemarker.FreeMarkerTemplateAvailabilityProvider,\
org.springframework.boot.autoconfigure.mustache.MustacheTemplateAvailabilityProvider,\
org.springframework.boot.autoconfigure.groovy.template.GroovyTemplateAvailabilityProvider,\
org.springframework.boot.autoconfigure.thymeleaf.ThymeleafTemplateAvailabilityProvider,\
org.springframework.boot.autoconfigure.web.servlet.JspTemplateAvailabilityProvider
```

**可以看到，Spring Boot 内置了大量的自动配置类！**

---

## 6.3 SpringFactoriesLoader 加载原理

### 6.3.1 核心类

```java
package org.springframework.core.io.support;

public final class SpringFactoriesLoader {
    
    public static final String FACTORIES_RESOURCE_LOCATION = "META-INF/spring.factories";
    
    private static final Map<ClassLoader, Map<String, List<String>>> cache = new ConcurrentReferenceHashMap<>();
    
    // 加载指定类型的工厂名称
    public static List<String> loadFactoryNames(Class<?> factoryType, @Nullable ClassLoader classLoader) {
        ClassLoader classLoaderToUse = classLoader;
        if (classLoaderToUse == null) {
            classLoaderToUse = SpringFactoriesLoader.class.getClassLoader();
        }
        String factoryTypeName = factoryType.getName();
        return loadSpringFactories(classLoaderToUse).getOrDefault(factoryTypeName, Collections.emptyList());
    }
    
    // 加载并实例化指定类型的工厂
    public static <T> List<T> loadFactories(Class<T> factoryType, @Nullable ClassLoader classLoader) {
        Assert.notNull(factoryType, "'factoryType' must not be null");
        ClassLoader classLoaderToUse = classLoader;
        if (classLoaderToUse == null) {
            classLoaderToUse = SpringFactoriesLoader.class.getClassLoader();
        }
        List<String> factoryImplementationNames = loadFactoryNames(factoryType, classLoaderToUse);
        
        List<T> result = new ArrayList<>(factoryImplementationNames.size());
        for (String factoryImplementationName : factoryImplementationNames) {
            result.add(instantiateFactory(factoryImplementationName, factoryType, classLoaderToUse));
        }
        AnnotationAwareOrderComparator.sort(result);
        return result;
    }
    
    // 加载所有 spring.factories 文件
    private static Map<String, List<String>> loadSpringFactories(ClassLoader classLoader) {
        Map<String, List<String>> result = cache.get(classLoader);
        if (result != null) {
            return result;
        }
        
        result = new HashMap<>();
        try {
            Enumeration<URL> urls = classLoader.getResources(FACTORIES_RESOURCE_LOCATION);
            while (urls.hasMoreElements()) {
                URL url = urls.nextElement();
                UrlResource resource = new UrlResource(url);
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
            
            // 去重
            result.replaceAll((factoryType, implementations) -> 
                implementations.stream().distinct().collect(Collectors.collectingAndThen(
                    Collectors.toList(), Collections::unmodifiableList)));
            
            cache.put(classLoader, result);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to load factories from location [" +
                    FACTORIES_RESOURCE_LOCATION + "]", ex);
        }
        
        return result;
    }
    
    // 实例化工厂类
    @SuppressWarnings("unchecked")
    private static <T> T instantiateFactory(String factoryImplementationName, 
                                            Class<T> factoryType, 
                                            ClassLoader classLoader) {
        try {
            Class<?> factoryImplementationClass = ClassUtils.forName(factoryImplementationName, classLoader);
            if (!factoryType.isAssignableFrom(factoryImplementationClass)) {
                throw new IllegalArgumentException(
                        "Class [" + factoryImplementationName + "] is not assignable to factory type [" + factoryType.getName() + "]");
            }
            return (T) ReflectionUtils.accessibleConstructor(factoryImplementationClass).newInstance();
        } catch (Throwable ex) {
            throw new IllegalArgumentException(
                "Unable to instantiate factory class [" + factoryImplementationName + "] for factory type [" + factoryType.getName() + "]",
                ex);
        }
    }
}
```

### 6.3.2 加载流程

```
1. 获取 ClassLoader
    ↓
2. 扫描所有 META-INF/spring.factories 文件
    ↓
3. 解析 Properties 格式
    ↓
4. 按接口分组存储
    ↓
5. 去重
    ↓
6. 缓存结果
    ↓
7. 根据接口类型返回实现类列表
```

**代码示例：**

```java
// 加载自动配置类名
List<String> configurations = SpringFactoriesLoader.loadFactoryNames(
    EnableAutoConfiguration.class,
    classLoader
);

// 加载并实例化 ApplicationListener
List<ApplicationListener<?>> listeners = SpringFactoriesLoader.loadFactories(
    ApplicationListener.class,
    classLoader
);
```

### 6.3.3 缓存机制

```java
private static final Map<ClassLoader, Map<String, List<String>>> cache = new ConcurrentReferenceHashMap<>();
```

**缓存策略：**
1. 以 ClassLoader 为键
2. 每个 ClassLoader 缓存一份完整的 spring.factories 内容
3. 避免重复加载和解析

**为什么以 ClassLoader 为键？**
- 不同的 ClassLoader 可能加载不同的 spring.factories 文件
- 支持多模块、插件化场景

---

## 6.4 自定义 SPI 扩展

### 6.4.1 自定义自动配置

**场景：** 开发一个自定义 Starter，自动配置 Redis。

#### **1. 创建自动配置类**

```java
package com.example.starter.redis;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@ConditionalOnClass(RedisTemplate.class)
@EnableConfigurationProperties(MyRedisProperties.class)
public class MyRedisAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}
```

#### **2. 创建配置属性类**

```java
package com.example.starter.redis;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "my.redis")
public class MyRedisProperties {
    
    private String host = "localhost";
    private int port = 6379;
    private String password;
    
    // Getters and Setters
}
```

#### **3. 创建 spring.factories**

```properties
# src/main/resources/META-INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.starter.redis.MyRedisAutoConfiguration
```

#### **4. 使用自定义 Starter**

```xml
<!-- 其他项目引入 -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>my-redis-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

```properties
# application.properties
my.redis.host=192.168.1.100
my.redis.port=6379
my.redis.password=123456
```

```java
@Autowired
private RedisTemplate<String, Object> redisTemplate;

public void test() {
    redisTemplate.opsForValue().set("key", "value");
}
```

### 6.4.2 自定义 ApplicationListener

**场景：** 监听应用启动事件，打印启动信息。

#### **1. 创建监听器**

```java
package com.example.listener;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;

public class MyApplicationListener implements ApplicationListener<ApplicationReadyEvent> {
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        System.out.println("===========================================");
        System.out.println("应用启动完成！");
        System.out.println("激活的 Profile: " + Arrays.toString(event.getApplicationContext().getEnvironment().getActiveProfiles()));
        System.out.println("===========================================");
    }
}
```

#### **2. 配置 spring.factories**

```properties
# META-INF/spring.factories
org.springframework.context.ApplicationListener=\
com.example.listener.MyApplicationListener
```

### 6.4.3 自定义 ApplicationContextInitializer

**场景：** 在 ApplicationContext 初始化之前添加自定义配置。

#### **1. 创建初始化器**

```java
package com.example.initializer;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class MyApplicationContextInitializer 
    implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    
    @Override
    public void initialize(ConfigurableApplicationContext context) {
        System.out.println("ApplicationContext 初始化中...");
        
        // 添加自定义配置
        ConfigurableEnvironment env = context.getEnvironment();
        Map<String, Object> props = new HashMap<>();
        props.put("custom.property", "custom-value");
        props.put("app.name", "MyApp");
        
        MapPropertySource propertySource = new MapPropertySource("customProperties", props);
        env.getPropertySources().addFirst(propertySource);
    }
}
```

#### **2. 配置 spring.factories**

```properties
# META-INF/spring.factories
org.springframework.context.ApplicationContextInitializer=\
com.example.initializer.MyApplicationContextInitializer
```

### 6.4.4 自定义 EnvironmentPostProcessor

**场景：** 从外部配置中心加载配置。

#### **1. 创建后处理器**

```java
package com.example.env;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class MyEnvironmentPostProcessor implements EnvironmentPostProcessor {
    
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, 
                                       SpringApplication application) {
        System.out.println("Environment 后处理中...");
        
        // 模拟从配置中心加载配置
        Map<String, Object> configCenterProps = loadFromConfigCenter();
        
        MapPropertySource propertySource = 
            new MapPropertySource("configCenterProperties", configCenterProps);
        
        environment.getPropertySources().addFirst(propertySource);
    }
    
    private Map<String, Object> loadFromConfigCenter() {
        // 实际项目中从 Nacos、Apollo 等配置中心加载
        Map<String, Object> props = new HashMap<>();
        props.put("server.port", "9090");
        props.put("spring.datasource.url", "jdbc:mysql://config-center-db:3306/test");
        return props;
    }
}
```

#### **2. 配置 spring.factories**

```properties
# META-INF/spring.factories
org.springframework.boot.env.EnvironmentPostProcessor=\
com.example.env.MyEnvironmentPostProcessor
```

---

## 6.5 Spring Boot SPI 与 Java SPI 对比

### 6.5.1 功能对比

| 功能 | Java SPI | Spring Boot SPI |
|------|---------|----------------|
| **配置集中性** | 分散（每个接口单独文件） | 集中（一个文件） |
| **实例化方式** | 自动实例化 | 返回类名，灵活控制 |
| **依赖注入** | 不支持 | 支持（Spring 容器管理） |
| **排序** | 不支持 | 支持（@Order） |
| **条件加载** | 不支持 | 支持（@Conditional） |
| **懒加载** | 支持 | 支持 |
| **缓存** | 不缓存 | 缓存解析结果 |

### 6.5.2 使用场景对比

**Java SPI 适用场景：**
- 简单的插件机制
- 不需要 Spring 容器支持
- 独立的 Java 应用

**Spring Boot SPI 适用场景：**
- Spring Boot 应用
- 需要依赖注入
- 需要条件装配
- 需要排序控制

### 6.5.3 迁移示例

**Java SPI：**
```
META-INF/services/com.example.MessageService
com.example.impl.EmailMessageService
```

**Spring Boot SPI：**
```properties
# META-INF/spring.factories
com.example.MessageService=\
com.example.impl.EmailMessageService
```

---

## 6.6 实战技巧

### 6.6.1 调试 spring.factories 加载

**启用 debug 日志：**

```properties
logging.level.org.springframework.core.io.support.SpringFactoriesLoader=DEBUG
```

**或代码调试：**

```java
public static void main(String[] args) {
    ClassLoader classLoader = Application.class.getClassLoader();
    
    // 加载所有自动配置类
    List<String> configurations = SpringFactoriesLoader.loadFactoryNames(
        EnableAutoConfiguration.class,
        classLoader
    );
    
    System.out.println("自动配置类数量: " + configurations.size());
    configurations.forEach(System.out::println);
}
```

### 6.6.2 检查 spring.factories 是否生效

**方法1：启用 debug 模式**
```properties
debug=true
```

**方法2：使用 Actuator**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

访问：`http://localhost:8080/actuator/conditions`

**方法3：断点调试**

在 `SpringFactoriesLoader.loadSpringFactories()` 方法打断点。

### 6.6.3 排查自动配置不生效

**步骤：**

1. **检查 spring.factories 文件位置**
   ```
   src/main/resources/META-INF/spring.factories  ✅
   src/main/resources/spring.factories           ❌
   ```

2. **检查文件格式**
   ```properties
   # 错误：键名不完整
   EnableAutoConfiguration=com.example.Config
   
   # 正确：完整键名
   org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
   com.example.Config
   ```

3. **检查类是否存在**
   ```
   确保配置类路径正确，类已编译到 classpath
   ```

4. **检查条件注解**
   ```java
   @Configuration
   @ConditionalOnClass(RedisTemplate.class)  # 检查依赖是否存在
   public class MyAutoConfiguration {
   }
   ```

---

## 6.7 常见问题与易错点

### 6.7.1 spring.factories 文件位置错误

**错误：**
```
src/main/resources/spring.factories              ❌
src/main/java/META-INF/spring.factories          ❌
src/main/resources/META/spring.factories         ❌
```

**正确：**
```
src/main/resources/META-INF/spring.factories     ✅
```

### 6.7.2 格式错误

**错误示例1：键名不完整**
```properties
EnableAutoConfiguration=com.example.Config       ❌
```

**错误示例2：多个类未用逗号分隔**
```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.Config1 com.example.Config2          ❌
```

**错误示例3：换行符使用错误**
```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=/
com.example.Config                               ❌
```

**正确格式：**
```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.Config1,\
com.example.Config2
```

### 6.7.3 类路径错误

**问题：** 配置的类不存在或路径错误。

**错误：**
```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.exmaple.Config  # 拼写错误：exmaple
```

**排查：**
1. 检查类名拼写
2. 确认包名正确
3. 确认类已编译

### 6.7.4 重复配置

**问题：** 在多个 jar 包中重复配置同一个实现类。

**spring.factories (jar1):**
```properties
org.springframework.context.ApplicationListener=\
com.example.MyListener
```

**spring.factories (jar2):**
```properties
org.springframework.context.ApplicationListener=\
com.example.MyListener
```

**结果：** `MyListener` 会被加载两次。

**解决：** SpringFactoriesLoader 会自动去重。

---

## 6.8 本章小结

### 核心要点

1. **SPI 机制**
   - Service Provider Interface，服务提供者接口
   - 实现接口与实现分离、运行时动态加载
   - Java SPI vs Spring Boot SPI

2. **spring.factories 文件**
   - 位置：`META-INF/spring.factories`
   - 格式：Properties（key=value）
   - 支持多个 jar 包中的文件合并加载

3. **SpringFactoriesLoader**
   - `loadFactoryNames()`: 加载类名列表
   - `loadFactories()`: 加载并实例化
   - 缓存机制：以 ClassLoader 为键

4. **常用扩展点**
   - `EnableAutoConfiguration`: 自动配置
   - `ApplicationListener`: 事件监听
   - `ApplicationContextInitializer`: 上下文初始化
   - `EnvironmentPostProcessor`: 环境后处理

5. **自定义 SPI**
   - 创建实现类
   - 配置 spring.factories
   - 打包到 jar 中
   - 引入依赖即可自动加载

### 思维导图

```
Spring Boot SPI 机制
├── spring.factories
│   ├── 文件位置（META-INF/）
│   ├── 文件格式（Properties）
│   └── 常用扩展点
│       ├── EnableAutoConfiguration
│       ├── ApplicationListener
│       ├── ApplicationContextInitializer
│       └── EnvironmentPostProcessor
├── SpringFactoriesLoader
│   ├── loadFactoryNames()
│   ├── loadFactories()
│   ├── loadSpringFactories()
│   └── 缓存机制
├── 自定义扩展
│   ├── 创建实现类
│   ├── 配置 spring.factories
│   └── 打包发布
└── 对比
    ├── Java SPI
    └── Spring Boot SPI
```

### 自检清单

- [ ] 理解 SPI 机制的设计思想
- [ ] 掌握 spring.factories 文件格式和位置
- [ ] 了解 SpringFactoriesLoader 加载流程
- [ ] 掌握常用的 Spring Boot SPI 扩展点
- [ ] 能够自定义 SPI 扩展
- [ ] 知道如何排查 spring.factories 配置问题

---

## 下一章预告

**第 7 章：AutoConfigurationImportSelector 源码**

将深入分析自动配置选择器的源码实现，包括：
- selectImports() 方法执行流程
- 自动配置类过滤机制
- 配置类排序算法
- 去重机制

---

**相关章节：**
- [第 5 章：@EnableAutoConfiguration 原理](./content-5.md)
- [第 7 章：AutoConfigurationImportSelector 源码](./content-7.md)
- [第 8 章：自动配置类编写规范](./content-8.md)

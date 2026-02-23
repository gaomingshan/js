# Spring Boot 核心原理面试题汇总

---

## 一、基础知识（初级）

### 1. Spring Boot 的核心特性是什么？

**答案：**
1. **自动配置（Auto-Configuration）**：根据 classpath 中的依赖和配置自动配置应用
2. **Starter 依赖（Starter Dependencies）**：一站式依赖管理，如 spring-boot-starter-web
3. **嵌入式容器（Embedded Container）**：内置 Tomcat/Jetty/Undertow，无需外部部署
4. **生产就绪特性（Actuator）**：提供健康检查、指标监控等生产级功能
5. **约定大于配置（Convention Over Configuration）**：通过合理的默认配置减少开发者配置工作

**加分项：**
- 可执行 jar 包：通过 `java -jar` 直接运行
- 外部化配置：支持 application.properties/yml 等多种配置方式
- 开箱即用：快速搭建项目，提升开发效率

---

### 2. Spring Boot 与 Spring Framework 的关系？

**答案：**
- **关系**：Spring Boot 基于 Spring Framework，不是替代关系，而是增强和简化
- **Spring Framework**：提供 IoC、AOP、事务管理等核心功能
- **Spring Boot**：在 Spring Framework 基础上提供自动配置、Starter 等特性

**对比：**
| 维度 | Spring Framework | Spring Boot |
|------|------------------|-------------|
| 配置方式 | XML/JavaConfig | 自动配置 + 少量覆盖 |
| 依赖管理 | 手动管理 | Starter 一站式 |
| 部署方式 | war → 外部容器 | jar 独立运行 |
| 监控能力 | 需自行集成 | 内置 Actuator |

---

### 3. @SpringBootApplication 注解的作用？

**答案：**
`@SpringBootApplication` 是一个组合注解，包含三个核心注解：

1. **@SpringBootConfiguration**
   - 等同于 `@Configuration`
   - 标记为 Spring Boot 配置类

2. **@EnableAutoConfiguration**
   - 启用自动配置机制
   - 导入 `AutoConfigurationImportSelector`

3. **@ComponentScan**
   - 启用组件扫描
   - 默认扫描主类所在包及子包

**等价写法：**
```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
public class Application { }
```

---

### 4. 如何快速创建 Spring Boot 项目？

**答案：**
三种方式：

1. **Spring Initializr（推荐）**
   - 访问 https://start.spring.io/
   - 选择依赖，下载项目

2. **IDEA 创建**
   - File → New → Project → Spring Initializr

3. **手动创建**
   - 创建 pom.xml，继承 spring-boot-starter-parent
   - 创建主类，添加 @SpringBootApplication
   - 添加所需依赖

---

## 二、自动配置原理（中级）

### 5. Spring Boot 自动配置的原理是什么？

**答案：**

**核心流程：**
```
1. @EnableAutoConfiguration 注解
    ↓
2. 导入 AutoConfigurationImportSelector
    ↓
3. selectImports() 方法
    ↓
4. 从 META-INF/spring.factories 加载配置类
    ↓
5. 应用条件注解过滤
    ↓
6. 注册符合条件的 Bean
```

**关键类：**
- `AutoConfigurationImportSelector`：选择需要导入的配置类
- `SpringFactoriesLoader`：加载 spring.factories 文件
- `OnClassCondition`、`OnBeanCondition` 等：条件过滤器

**spring.factories 示例：**
```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
```

---

### 6. 什么是 spring.factories 文件？

**答案：**
- **位置**：`META-INF/spring.factories`
- **格式**：Properties 格式（key=value）
- **作用**：Spring Boot SPI 机制的核心配置文件

**用途：**
1. 注册自动配置类（EnableAutoConfiguration）
2. 注册应用监听器（ApplicationListener）
3. 注册初始化器（ApplicationContextInitializer）
4. 注册其他扩展点

**示例：**
```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.MyAutoConfiguration

org.springframework.context.ApplicationListener=\
com.example.MyApplicationListener
```

---

### 7. 条件注解的作用是什么？常用的有哪些？

**答案：**

**作用：** 根据特定条件决定是否创建 Bean 或应用配置。

**常用条件注解：**

1. **@ConditionalOnClass**：类存在时生效
   ```java
   @ConditionalOnClass(RedisOperations.class)
   ```

2. **@ConditionalOnMissingBean**：Bean 不存在时生效（最常用）
   ```java
   @ConditionalOnMissingBean(DataSource.class)
   ```

3. **@ConditionalOnProperty**：属性匹配时生效
   ```java
   @ConditionalOnProperty(name = "spring.redis.enabled", havingValue = "true")
   ```

4. **@ConditionalOnWebApplication**：Web 应用时生效
   ```java
   @ConditionalOnWebApplication(type = Type.SERVLET)
   ```

5. **@ConditionalOnMissingClass**：类不存在时生效

**原理：** 通过 `Condition` 接口的 `matches()` 方法判断条件是否满足。

---

### 8. @ConditionalOnMissingBean 的作用？

**答案：**

**作用：** 当容器中不存在指定 Bean 时才创建 Bean，实现**用户配置优先**。

**示例：**
```java
@Bean
@ConditionalOnMissingBean
public DataSource dataSource() {
    return new HikariDataSource();
    // 只有用户未定义 DataSource 时才创建默认的
}
```

**应用场景：**
- 自动配置类：提供默认 Bean，允许用户覆盖
- Starter 开发：给用户留下定制空间

**注意事项：**
- 评估时机：在 `REGISTER_BEAN` 阶段
- 可能存在顺序问题：使用 `@AutoConfigureAfter` 控制顺序

---

### 9. 如何调试自动配置？

**答案：**

**方法1：启用 debug 模式**
```properties
debug=true
```

**输出：**
```
CONDITIONS EVALUATION REPORT
============================

Positive matches:
-----------------
   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes (OnClassCondition)

Negative matches:
-----------------
   MongoAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class (OnClassCondition)
```

**方法2：使用 Actuator**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

访问：`/actuator/conditions`

**方法3：断点调试**
- 在 `AutoConfigurationImportSelector.selectImports()` 打断点
- 查看加载的配置类列表

---

### 10. 如何排除特定的自动配置？

**答案：**

**方法1：使用 exclude 属性**
```java
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,
    RedisAutoConfiguration.class
})
public class Application { }
```

**方法2：使用 excludeName 属性**
```java
@SpringBootApplication(excludeName = {
    "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration"
})
public class Application { }
```

**方法3：使用配置文件**
```properties
spring.autoconfigure.exclude=\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
```

**应用场景：**
- 不需要某个功能时排除
- 解决依赖冲突
- 优化启动速度

---

## 三、配置管理（中级）

### 11. Spring Boot 配置文件的加载优先级？

**答案：**

**从高到低（共17种）：**
1. 命令行参数
2. SPRING_APPLICATION_JSON 环境变量
3. ServletConfig 初始化参数
4. ServletContext 初始化参数
5. JNDI 属性
6. Java 系统属性（System.getProperties()）
7. 操作系统环境变量
8. RandomValuePropertySource（random.*）
9. jar 包外的 application-{profile}.properties/yml
10. jar 包内的 application-{profile}.properties/yml
11. jar 包外的 application.properties/yml
12. jar 包内的 application.properties/yml
13. @PropertySource 注解
14. SpringApplication.setDefaultProperties

**记忆口诀：** 命令行 > 外部配置 > 内部配置 > 代码配置 > 默认配置

---

### 12. @ConfigurationProperties 的作用？

**答案：**

**作用：** 将配置文件中的属性绑定到 Java 对象，提供类型安全的配置。

**示例：**
```java
@ConfigurationProperties(prefix = "myapp")
public class MyAppProperties {
    private String name;
    private int timeout;
    // Getters and Setters
}
```

```yaml
myapp:
  name: MyApplication
  timeout: 3000
```

**优势：**
1. **类型安全**：编译时检查
2. **IDE 提示**：配合 configuration-processor 提供自动补全
3. **校验支持**：结合 @Validated 和 JSR-303 注解
4. **Relaxed Binding**：支持多种命名格式

**vs @Value：**
- @Value：单个属性绑定
- @ConfigurationProperties：批量属性绑定，推荐用于复杂配置

---

### 13. 如何实现多环境配置？

**答案：**

**方式1：Profile 机制**

**配置文件：**
```
application.yml              # 通用配置
application-dev.yml          # 开发环境
application-test.yml         # 测试环境
application-prod.yml         # 生产环境
```

**激活：**
```properties
# application.properties
spring.profiles.active=dev
```

或命令行：
```bash
java -jar app.jar --spring.profiles.active=prod
```

**方式2：yml 多文档块**
```yaml
# 默认
server:
  port: 8080

---
# 开发环境
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8081

---
# 生产环境
spring:
  config:
    activate:
      on-profile: prod
server:
  port: 80
```

---

## 四、启动流程（高级）

### 14. Spring Boot 启动流程的关键步骤？

**答案：**

**12个核心步骤：**
```
1. 创建 SpringApplication 实例
2. 准备 Environment（加载配置）
3. 打印 Banner
4. 创建 ApplicationContext
5. 准备 ApplicationContext
6. 刷新 ApplicationContext（核心）
   ├── invokeBeanFactoryPostProcessors()  ← 自动配置生效
   ├── onRefresh()                         ← 启动嵌入式容器
   └── finishBeanFactoryInitialization()   ← 实例化单例 Bean
7. 刷新后处理
8. 调用 Runners（CommandLineRunner/ApplicationRunner）
9. 发布 ready 事件
```

**重点：**
- **自动配置**在 `invokeBeanFactoryPostProcessors()` 阶段生效
- **嵌入式容器**在 `onRefresh()` 中启动
- **单例 Bean** 在 `finishBeanFactoryInitialization()` 中实例化

---

### 15. 自动配置在启动流程的哪个阶段生效？

**答案：**

**阶段：** `refreshContext()` 的 `invokeBeanFactoryPostProcessors()` 步骤

**详细流程：**
```
refreshContext()
    ↓
invokeBeanFactoryPostProcessors()
    ↓
ConfigurationClassPostProcessor.postProcessBeanDefinitionRegistry()
    ↓
ConfigurationClassParser.parse()
    ↓
processImports()
    ↓
DeferredImportSelectorHandler.process()
    ↓
AutoConfigurationImportSelector.selectImports()
    ↓
加载、过滤、排序自动配置类
    ↓
注册 BeanDefinition
```

**为什么延迟导入（DeferredImportSelector）？**
- 确保用户配置优先
- 让条件注解能正确判断 Bean 是否存在
- 支持配置类排序（@AutoConfigureAfter/@Before）

---

### 16. CommandLineRunner 和 ApplicationRunner 的区别？

**答案：**

**相同点：**
- 都在应用启动完成后执行
- 用于执行初始化逻辑（加载缓存、预热数据等）
- 支持 @Order 控制执行顺序

**区别：**
| 对比项 | CommandLineRunner | ApplicationRunner |
|--------|------------------|------------------|
| 参数类型 | `String... args` | `ApplicationArguments args` |
| 参数解析 | 原始字符串数组 | 封装后的对象，支持选项参数 |

**示例：**
```java
@Component
@Order(1)
public class MyCommandLineRunner implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        System.out.println("Args: " + Arrays.toString(args));
    }
}

@Component
@Order(2)
public class MyApplicationRunner implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        Set<String> optionNames = args.getOptionNames();
        List<String> nonOptionArgs = args.getNonOptionArgs();
    }
}
```

---

## 五、Starter 开发（高级）

### 17. 如何开发自定义 Starter？

**答案：**

**步骤：**

**1. 项目结构**
```
my-spring-boot-starter/
├── pom.xml
└── src/main/
    ├── java/
    │   └── com/example/
    │       ├── autoconfigure/
    │       │   └── MyAutoConfiguration.java
    │       └── properties/
    │           └── MyProperties.java
    └── resources/
        └── META-INF/
            ├── spring.factories
            └── spring-configuration-metadata.json
```

**2. 自动配置类**
```java
@AutoConfiguration
@ConditionalOnClass(MyService.class)
@EnableConfigurationProperties(MyProperties.class)
public class MyAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public MyService myService(MyProperties properties) {
        return new MyService(properties);
    }
}
```

**3. 配置属性类**
```java
@ConfigurationProperties(prefix = "myapp")
public class MyProperties {
    private String name;
    private int timeout = 3000;
    // Getters and Setters
}
```

**4. spring.factories**
```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.autoconfigure.MyAutoConfiguration
```

**5. 配置元数据（可选）**
```json
{
  "properties": [
    {
      "name": "myapp.name",
      "type": "java.lang.String",
      "description": "Application name"
    }
  ]
}
```

---

### 18. Starter 命名规范是什么？

**答案：**

**官方 Starter：**
```
spring-boot-starter-{name}
```
示例：`spring-boot-starter-web`、`spring-boot-starter-data-jpa`

**第三方 Starter：**
```
{name}-spring-boot-starter
```
示例：`mybatis-spring-boot-starter`、`druid-spring-boot-starter`

**原因：**
- 官方统一以 `spring-boot-starter-` 开头
- 第三方以功能名开头，避免与官方冲突
- 便于识别和管理

---

## 六、高级组件开发（架构级）

### 19. 如何实现类似 MyBatis @MapperScan 的功能？

**答案：**

**核心技术栈：**
1. `@Import` + `ImportBeanDefinitionRegistrar`：动态注册 BeanDefinition
2. `ClassPathScanner`：扫描指定包下的接口
3. `FactoryBean`：为每个接口创建代理对象
4. `JDK 动态代理`：拦截方法调用

**实现步骤：**

**1. 定义注解**
```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(MyMapperScannerRegistrar.class)
public @interface MyMapperScan {
    String[] basePackages() default {};
}
```

**2. 扫描注册器**
```java
public class MyMapperScannerRegistrar implements ImportBeanDefinitionRegistrar {
    
    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata, 
                                        BeanDefinitionRegistry registry) {
        // 1. 扫描接口
        ClassPathScanningCandidateComponentProvider scanner = 
            new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(MyMapper.class));
        
        // 2. 注册 FactoryBean
        Set<BeanDefinition> candidates = scanner.findCandidateComponents(basePackage);
        for (BeanDefinition candidate : candidates) {
            registerMapperBean(candidate, registry);
        }
    }
    
    private void registerMapperBean(BeanDefinition candidate, BeanDefinitionRegistry registry) {
        BeanDefinitionBuilder builder = BeanDefinitionBuilder
            .genericBeanDefinition(MyMapperFactoryBean.class);
        builder.addConstructorArgValue(mapperInterface);
        registry.registerBeanDefinition(beanName, builder.getBeanDefinition());
    }
}
```

**3. FactoryBean**
```java
public class MyMapperFactoryBean<T> implements FactoryBean<T> {
    
    private final Class<T> mapperInterface;
    
    @Override
    public T getObject() throws Exception {
        return (T) Proxy.newProxyInstance(
            mapperInterface.getClassLoader(),
            new Class[] { mapperInterface },
            new MyMapperProxy(mapperInterface)
        );
    }
}
```

**4. 动态代理**
```java
public class MyMapperProxy implements InvocationHandler {
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 执行 SQL 或 HTTP 请求
        return executeQuery(method, args);
    }
}
```

---

### 20. FactoryBean 与普通 Bean 的区别？

**答案：**

| 对比项 | FactoryBean | 普通 Bean |
|--------|-------------|----------|
| **创建方式** | 通过 `getObject()` | 通过构造方法/工厂方法 |
| **用途** | 创建复杂对象 | 简单对象 |
| **灵活性** | 高，可自定义创建逻辑 | 低 |
| **获取方式** | 直接获取 或 加 `&` 前缀 | 直接获取 |

**获取示例：**
```java
// 获取 FactoryBean 创建的对象
MyService service = context.getBean("myService", MyService.class);

// 获取 FactoryBean 本身
MyServiceFactoryBean factory = context.getBean("&myService", MyServiceFactoryBean.class);
```

**应用场景：**
- 代理对象创建（MyBatis Mapper、Feign Client）
- 连接池创建（DataSource）
- 复杂初始化逻辑

---

## 七、性能优化（架构级）

### 21. 如何优化 Spring Boot 启动速度？

**答案：**

**1. 懒加载**
```properties
spring.main.lazy-initialization=true
```

**2. 排除不需要的自动配置**
```java
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,
    RedisAutoConfiguration.class
})
```

**3. 使用 Lite 模式**
```java
@Configuration(proxyBeanMethods = false)
```

**4. 减少组件扫描范围**
```java
@ComponentScan(basePackages = "com.example.core")
```

**5. 使用 Spring Native（AOT 编译）**
- 提前编译为本机代码
- 启动速度提升 10倍+

**6. 优化依赖**
- 移除不必要的 Starter
- 使用更轻量的库

**7. JVM 参数调优**
```bash
java -Xms512m -Xmx1024m \
     -XX:TieredStopAtLevel=1 \
     -noverify \
     -jar app.jar
```

---

### 22. 常见的 Spring Boot 性能问题及解决方案？

**答案：**

**1. 启动慢**
- 启用懒加载
- 排除不需要的自动配置
- 减少扫描范围

**2. 内存占用高**
- 调整 JVM 堆大小
- 使用连接池
- 合理配置缓存

**3. Bean 循环依赖**
- 使用 @Lazy 注解
- 改用 setter 注入
- 重新设计类结构

**4. 自动配置过多**
- 按需排除
- 使用 Lite 模式

**5. 大量 HTTP 请求**
- 使用连接池（HttpClient）
- 启用 HTTP/2
- 合理设置超时时间

---

## 八、综合面试题（架构级）

### 23. 说说你对 Spring Boot 的理解？

**参考答案：**

Spring Boot 是基于 Spring Framework 的快速开发框架，核心理念是**约定大于配置**和**开箱即用**。

**核心特性：**
1. **自动配置**：根据 classpath 和配置自动配置应用，减少 90% 的配置工作
2. **Starter 机制**：一站式依赖管理，简化依赖引入
3. **嵌入式容器**：无需外部 Tomcat，直接通过 `java -jar` 运行
4. **生产就绪**：内置 Actuator 提供监控和健康检查

**技术实现：**
- 通过 `@EnableAutoConfiguration` 和 SPI 机制加载自动配置类
- 使用条件注解（@Conditional*）实现按需装配
- DeferredImportSelector 确保用户配置优先

**适用场景：**
- 微服务开发
- 快速原型开发
- 云原生应用

**我的实践：**
- 开发过自定义 Starter
- 实现过类似 @MapperScan 的功能
- 对启动流程和自动配置原理有深入理解

---

### 24. 如果让你设计一个 Starter，你会考虑哪些方面？

**参考答案：**

**1. 功能设计**
- 单一职责：一个 Starter 只做一件事
- 合理的默认配置
- 提供灵活的定制能力

**2. 技术实现**
- 自动配置类（@AutoConfiguration）
- 配置属性类（@ConfigurationProperties）
- 条件装配（@Conditional*）
- 用户配置优先（@ConditionalOnMissingBean）

**3. 依赖管理**
- 最小化依赖
- 使用 optional 依赖
- 避免版本冲突

**4. 文档与提示**
- 完善的 README 文档
- 配置元数据（spring-configuration-metadata.json）
- 示例代码

**5. 监控与健康检查**
- 自定义 HealthIndicator
- 自定义 Metrics
- 自定义 Actuator 端点

**6. 测试**
- 单元测试
- 集成测试
- 自动配置测试（@SpringBootTest）

---

## 面试准备建议

### 按级别准备

**初级（1-2年）：**
- 掌握基础特性和常用注解
- 理解自动配置的基本原理
- 能够使用 Starter 和配置文件

**中级（3-5年）：**
- 深入理解自动配置原理和启动流程
- 掌握条件装配机制
- 能够开发简单的 Starter

**高级（5年+）：**
- 透彻理解 Spring Boot 源码
- 能够开发复杂的 Starter 和高级组件
- 掌握性能优化和问题排查

**架构级（8年+）：**
- 能够设计基于 Spring Boot 的技术架构
- 深入理解各种扩展点
- 有丰富的实战经验和最佳实践

### 面试技巧

1. **先答核心要点**，再展开细节
2. **结合实际项目经验**，不要纸上谈兵
3. **主动提及自己的实践**，展示技术深度
4. **准备好追问**，深入理解原理

---

**祝你面试成功！**

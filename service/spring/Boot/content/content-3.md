# 第 3 章：Spring Boot 运行机制概览

## 本章概述

本章从宏观视角讲解 Spring Boot 的整体架构和运行机制。通过分析核心组件、启动流程、关键扩展点，帮助你建立对 Spring Boot 的完整认知框架，为后续深入学习自动配置、条件装配等核心机制打下基础。

**学习目标：**
- 理解 Spring Boot 的整体架构设计
- 掌握核心组件及其协作关系
- 了解 Spring Boot 启动流程概览
- 掌握关键扩展点体系

---

## 3.1 Spring Boot 整体架构

### 3.1.1 架构分层设计

Spring Boot 采用分层架构，每层职责清晰：

```
┌─────────────────────────────────────────────┐
│          应用层（Application Layer）          │
│  业务代码、Controller、Service、Repository   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│        Spring Boot 层（Boot Layer）          │
│  自动配置、Starter、嵌入式容器、Actuator     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Spring Framework 层（Core Layer）       │
│         IoC 容器、AOP、事务管理等            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          JDK 层（Java Platform）             │
│        Java 核心库、JVM、操作系统            │
└─────────────────────────────────────────────┘
```

**层次说明：**

| 层次 | 职责 | 核心组件 |
|------|------|---------|
| **应用层** | 业务逻辑实现 | Controller、Service、Repository |
| **Spring Boot 层** | 简化配置、快速开发 | 自动配置、Starter、Actuator |
| **Spring Framework 层** | 企业级框架支持 | IoC、AOP、事务、Web MVC |
| **JDK 层** | 基础运行环境 | JVM、Java API |

### 3.1.2 核心模块组成

```
Spring Boot 核心模块
├── spring-boot
│   ├── SpringApplication          # 启动器
│   ├── SpringApplicationRunListener # 启动监听器
│   ├── ApplicationContext          # 应用上下文
│   └── Environment                 # 环境抽象
│
├── spring-boot-autoconfigure
│   ├── AutoConfiguration          # 自动配置类
│   ├── @Conditional               # 条件注解
│   └── spring.factories           # SPI 配置文件
│
├── spring-boot-starter
│   ├── spring-boot-starter-web
│   ├── spring-boot-starter-data-jpa
│   └── ...                        # 各种 Starter
│
├── spring-boot-actuator
│   ├── Endpoint                   # 端点
│   ├── HealthIndicator            # 健康检查
│   └── Metrics                    # 指标监控
│
└── spring-boot-loader
    ├── JarLauncher                # Jar 启动器
    └── WarLauncher                # War 启动器
```

### 3.1.3 依赖关系图

```
应用程序
    ↓ 依赖
spring-boot-starter-*
    ↓ 依赖
spring-boot-autoconfigure
    ↓ 依赖
spring-boot
    ↓ 依赖
spring-framework (core, context, beans, aop, etc.)
    ↓ 依赖
JDK
```

---

## 3.2 核心组件详解

### 3.2.1 SpringApplication

**职责：** Spring Boot 应用的启动入口。

**核心功能：**
- 创建并刷新 ApplicationContext
- 加载配置文件
- 执行启动监听器
- 打印 Banner
- 处理异常和失败

**关键代码：**

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

**等价于：**

```java
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(DemoApplication.class);
        app.run(args);
    }
}
```

**可定制的属性：**

```java
SpringApplication app = new SpringApplication(DemoApplication.class);

// 设置 Banner 模式
app.setBannerMode(Banner.Mode.OFF);

// 设置默认属性
Map<String, Object> defaultProperties = new HashMap<>();
defaultProperties.put("server.port", "9090");
app.setDefaultProperties(defaultProperties);

// 添加监听器
app.addListeners(new MyApplicationListener());

// 设置是否注册 ShutdownHook
app.setRegisterShutdownHook(true);

app.run(args);
```

### 3.2.2 ApplicationContext

**职责：** Spring 应用的核心容器，管理所有 Bean。

**类型层次：**

```
ApplicationContext (接口)
    ↓
ConfigurableApplicationContext (接口)
    ↓
AbstractApplicationContext (抽象类)
    ↓
GenericApplicationContext
    ↓
AnnotationConfigApplicationContext
    ↓
AnnotationConfigServletWebServerApplicationContext  # Spring Boot Web 应用使用
```

**核心功能：**
- Bean 的创建、配置、管理
- 事件发布
- 国际化支持
- 资源加载

**Spring Boot 中的 ApplicationContext 类型：**

| 应用类型 | ApplicationContext 类型 |
|---------|------------------------|
| Web 应用（Servlet） | `AnnotationConfigServletWebServerApplicationContext` |
| Web 应用（Reactive） | `AnnotationConfigReactiveWebServerApplicationContext` |
| 非 Web 应用 | `AnnotationConfigApplicationContext` |

**自动选择逻辑：**

```java
// SpringApplication.java
protected ConfigurableApplicationContext createApplicationContext() {
    Class<?> contextClass = this.applicationContextClass;
    if (contextClass == null) {
        try {
            switch (this.webApplicationType) {
                case SERVLET:
                    contextClass = Class.forName(DEFAULT_SERVLET_WEB_CONTEXT_CLASS);
                    break;
                case REACTIVE:
                    contextClass = Class.forName(DEFAULT_REACTIVE_WEB_CONTEXT_CLASS);
                    break;
                default:
                    contextClass = Class.forName(DEFAULT_CONTEXT_CLASS);
            }
        } catch (ClassNotFoundException ex) {
            throw new IllegalStateException("Unable to create context", ex);
        }
    }
    return (ConfigurableApplicationContext) BeanUtils.instantiateClass(contextClass);
}
```

### 3.2.3 Environment

**职责：** 管理应用的配置信息和环境变量。

**核心接口：**

```java
public interface Environment extends PropertyResolver {
    
    // 获取激活的 Profile
    String[] getActiveProfiles();
    
    // 获取默认的 Profile
    String[] getDefaultProfiles();
    
    // 判断 Profile 是否激活
    boolean acceptsProfiles(Profiles profiles);
}
```

**配置来源（PropertySource）：**

```
Environment
├── systemProperties        # System.getProperties()
├── systemEnvironment       # System.getenv()
├── servletConfigInitParams # ServletConfig 初始化参数
├── servletContextInitParams # ServletContext 初始化参数
├── jndiProperties          # JNDI 属性
├── applicationConfig       # application.properties/yml
└── defaultProperties       # 默认属性
```

**使用示例：**

```java
@Component
public class MyComponent {
    
    @Autowired
    private Environment env;
    
    public void printConfig() {
        // 获取配置属性
        String port = env.getProperty("server.port");
        
        // 获取激活的 Profile
        String[] profiles = env.getActiveProfiles();
        
        // 判断 Profile
        boolean isProd = env.acceptsProfiles(Profiles.of("prod"));
    }
}
```

### 3.2.4 AutoConfiguration

**职责：** 根据 classpath 和配置自动配置 Bean。

**核心注解：**

```java
@Configuration
@ConditionalOnClass(DataSource.class)
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}
```

**自动配置加载流程：**

```
1. @EnableAutoConfiguration
    ↓
2. AutoConfigurationImportSelector
    ↓
3. 读取 META-INF/spring.factories
    ↓
4. 加载所有 AutoConfiguration 类
    ↓
5. 条件评估（@Conditional*）
    ↓
6. 注册符合条件的 Bean
```

### 3.2.5 Starter

**职责：** 一站式依赖管理。

**组成结构：**

```
spring-boot-starter-web
├── spring-boot-starter           # 核心 Starter
│   ├── spring-boot
│   ├── spring-boot-autoconfigure
│   └── logback
├── spring-boot-starter-tomcat    # 嵌入式 Tomcat
├── spring-web                    # Spring Web
├── spring-webmvc                 # Spring MVC
└── jackson-databind              # JSON 处理
```

**Starter 与 AutoConfiguration 的关系：**

```
Starter (pom.xml)
    ↓ 引入依赖
AutoConfiguration (spring.factories)
    ↓ 自动配置
Bean 注册到容器
```

### 3.2.6 Actuator

**职责：** 提供生产级监控和管理功能。

**端点分类：**

| 类别 | 端点 | 功能 |
|------|------|------|
| **应用信息** | `/info` | 应用基本信息 |
| **健康检查** | `/health` | 健康状态 |
| **指标监控** | `/metrics` | 性能指标 |
| **环境配置** | `/env` | 环境变量 |
| **Bean 管理** | `/beans` | Bean 列表 |
| **日志管理** | `/loggers` | 日志级别 |
| **HTTP 追踪** | `/httptrace` | HTTP 请求追踪 |

**端点实现示例：**

```java
@Endpoint(id = "custom")
public class CustomEndpoint {
    
    @ReadOperation
    public Map<String, Object> getInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("status", "UP");
        info.put("message", "Custom endpoint");
        return info;
    }
}
```

---

## 3.3 Spring Boot 启动流程概览

### 3.3.1 启动流程时序图

```
main()
  ↓
SpringApplication.run()
  ↓
1. 创建 SpringApplication 实例
  ├── 推断应用类型（Web/非Web）
  ├── 加载初始化器（Initializers）
  └── 加载监听器（Listeners）
  ↓
2. 执行 run() 方法
  ├── 启动监听器（starting）
  ├── 准备 Environment
  ├── 打印 Banner
  ├── 创建 ApplicationContext
  ├── 准备 ApplicationContext
  │   ├── 应用初始化器
  │   ├── 加载配置类
  │   └── 启动监听器（contextPrepared）
  ├── 刷新 ApplicationContext
  │   ├── 扫描 Bean
  │   ├── 注册 Bean
  │   ├── 实例化 Bean
  │   └── 自动配置生效
  ├── 启动监听器（started）
  ├── 调用 Runners
  └── 启动监听器（ready）
  ↓
应用启动完成
```

### 3.3.2 12 个关键步骤

```java
public ConfigurableApplicationContext run(String... args) {
    // 1. 创建计时器
    StopWatch stopWatch = new StopWatch();
    stopWatch.start();
    
    // 2. 创建引导上下文
    DefaultBootstrapContext bootstrapContext = createBootstrapContext();
    
    // 3. 配置 Headless 模式
    configureHeadlessProperty();
    
    // 4. 获取并启动监听器
    SpringApplicationRunListeners listeners = getRunListeners(args);
    listeners.starting(bootstrapContext, this.mainApplicationClass);
    
    try {
        // 5. 封装命令行参数
        ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
        
        // 6. 准备环境
        ConfigurableEnvironment environment = prepareEnvironment(listeners, bootstrapContext, applicationArguments);
        
        // 7. 打印 Banner
        Banner printedBanner = printBanner(environment);
        
        // 8. 创建 ApplicationContext
        context = createApplicationContext();
        
        // 9. 准备 ApplicationContext
        prepareContext(bootstrapContext, context, environment, listeners, applicationArguments, printedBanner);
        
        // 10. 刷新 ApplicationContext（核心）
        refreshContext(context);
        
        // 11. 刷新后处理
        afterRefresh(context, applicationArguments);
        
        // 12. 停止计时器，发布启动完成事件
        stopWatch.stop();
        listeners.started(context);
        
        // 13. 调用 Runners
        callRunners(context, applicationArguments);
    } catch (Throwable ex) {
        handleRunFailure(context, ex, listeners);
        throw new IllegalStateException(ex);
    }
    
    // 14. 发布 ready 事件
    listeners.ready(context, null);
    return context;
}
```

### 3.3.3 启动日志解析

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v3.2.0)
                                          ↑ Spring Boot 版本

2024-01-15 10:00:00.123  INFO 12345 --- [main] c.e.DemoApplication: Starting DemoApplication
                         ↑    ↑     ↑   ↑      ↑
                       时间   级别  进程ID 线程  类名

2024-01-15 10:00:01.456  INFO 12345 --- [main] c.e.DemoApplication: No active profile set, falling back to 1 default profile: "default"
                                                                      ↑ 未设置 Profile，使用默认

2024-01-15 10:00:02.789  INFO 12345 --- [main] o.s.b.w.e.tomcat.TomcatWebServer: Tomcat initialized with port(s): 8080 (http)
                                                  ↑ Tomcat 启动，端口 8080

2024-01-15 10:00:03.012  INFO 12345 --- [main] o.s.b.w.e.tomcat.TomcatWebServer: Tomcat started on port(s): 8080 (http)
                                                  ↑ Tomcat 启动完成

2024-01-15 10:00:03.234  INFO 12345 --- [main] c.e.DemoApplication: Started DemoApplication in 3.2 seconds (JVM running for 3.8)
                                                  ↑ 应用启动完成，耗时 3.2 秒
```

---

## 3.4 关键扩展点体系

### 3.4.1 扩展点分类

```
Spring Boot 扩展点
├── 启动阶段扩展
│   ├── ApplicationContextInitializer    # 上下文初始化前
│   ├── SpringApplicationRunListener      # 启动过程监听
│   ├── ApplicationListener              # 事件监听
│   └── CommandLineRunner/ApplicationRunner # 启动后执行
│
├── 配置阶段扩展
│   ├── EnvironmentPostProcessor         # 环境准备后
│   ├── BeanDefinitionRegistryPostProcessor # Bean 定义注册
│   └── BeanFactoryPostProcessor         # Bean 工厂后处理
│
├── Bean 生命周期扩展
│   ├── BeanPostProcessor                # Bean 初始化前后
│   ├── InstantiationAwareBeanPostProcessor # Bean 实例化
│   └── DestructionAwareBeanPostProcessor # Bean 销毁
│
└── 自动配置扩展
    ├── @Conditional 条件注解            # 条件装配
    ├── AutoConfigurationImportSelector  # 自动配置选择
    └── ImportSelector                   # 动态导入
```

### 3.4.2 ApplicationContextInitializer

**作用：** 在 ApplicationContext 刷新之前进行初始化。

**接口定义：**

```java
@FunctionalInterface
public interface ApplicationContextInitializer<C extends ConfigurableApplicationContext> {
    void initialize(C applicationContext);
}
```

**实现示例：**

```java
public class MyApplicationContextInitializer 
    implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    
    @Override
    public void initialize(ConfigurableApplicationContext context) {
        System.out.println("ApplicationContext 初始化中...");
        
        // 可以在这里：
        // 1. 设置配置属性
        ConfigurableEnvironment env = context.getEnvironment();
        env.getSystemProperties().put("custom.property", "value");
        
        // 2. 添加 BeanFactoryPostProcessor
        context.addBeanFactoryPostProcessor(new MyBeanFactoryPostProcessor());
        
        // 3. 添加监听器
        context.addApplicationListener(new MyApplicationListener());
    }
}
```

**注册方式：**

**方式1：spring.factories**
```properties
# META-INF/spring.factories
org.springframework.context.ApplicationContextInitializer=\
com.example.MyApplicationContextInitializer
```

**方式2：代码注册**
```java
SpringApplication app = new SpringApplication(DemoApplication.class);
app.addInitializers(new MyApplicationContextInitializer());
app.run(args);
```

### 3.4.3 SpringApplicationRunListener

**作用：** 监听 Spring Boot 启动过程的各个阶段。

**接口定义：**

```java
public interface SpringApplicationRunListener {
    
    // 启动开始
    default void starting(ConfigurableBootstrapContext bootstrapContext) {}
    
    // 环境准备完成
    default void environmentPrepared(ConfigurableBootstrapContext bootstrapContext,
                                     ConfigurableEnvironment environment) {}
    
    // ApplicationContext 准备完成
    default void contextPrepared(ConfigurableApplicationContext context) {}
    
    // ApplicationContext 加载完成
    default void contextLoaded(ConfigurableApplicationContext context) {}
    
    // ApplicationContext 启动完成
    default void started(ConfigurableApplicationContext context) {}
    
    // 应用就绪
    default void ready(ConfigurableApplicationContext context, Duration timeTaken) {}
    
    // 启动失败
    default void failed(ConfigurableApplicationContext context, Throwable exception) {}
}
```

**实现示例：**

```java
public class MySpringApplicationRunListener implements SpringApplicationRunListener {
    
    private final SpringApplication application;
    private final String[] args;
    
    // 必须有这个构造方法
    public MySpringApplicationRunListener(SpringApplication application, String[] args) {
        this.application = application;
        this.args = args;
    }
    
    @Override
    public void starting(ConfigurableBootstrapContext bootstrapContext) {
        System.out.println("应用启动中...");
    }
    
    @Override
    public void environmentPrepared(ConfigurableBootstrapContext bootstrapContext,
                                    ConfigurableEnvironment environment) {
        System.out.println("环境准备完成，激活的 Profile: " + 
                          Arrays.toString(environment.getActiveProfiles()));
    }
    
    @Override
    public void contextPrepared(ConfigurableApplicationContext context) {
        System.out.println("ApplicationContext 准备完成");
    }
    
    @Override
    public void started(ConfigurableApplicationContext context) {
        System.out.println("ApplicationContext 启动完成");
    }
    
    @Override
    public void ready(ConfigurableApplicationContext context, Duration timeTaken) {
        System.out.println("应用就绪，启动耗时: " + timeTaken.toMillis() + "ms");
    }
    
    @Override
    public void failed(ConfigurableApplicationContext context, Throwable exception) {
        System.err.println("启动失败: " + exception.getMessage());
    }
}
```

**注册方式：**

```properties
# META-INF/spring.factories
org.springframework.boot.SpringApplicationRunListener=\
com.example.MySpringApplicationRunListener
```

### 3.4.4 CommandLineRunner 与 ApplicationRunner

**作用：** 在应用启动完成后执行特定逻辑。

**接口定义：**

```java
@FunctionalInterface
public interface CommandLineRunner {
    void run(String... args) throws Exception;
}

@FunctionalInterface
public interface ApplicationRunner {
    void run(ApplicationArguments args) throws Exception;
}
```

**区别：**
- `CommandLineRunner`: 接收原始命令行参数数组
- `ApplicationRunner`: 接收封装后的 ApplicationArguments

**实现示例：**

```java
@Component
@Order(1)  // 设置执行顺序
public class MyCommandLineRunner implements CommandLineRunner {
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("CommandLineRunner 执行");
        System.out.println("参数: " + Arrays.toString(args));
        
        // 执行初始化逻辑
        // 例如：加载缓存、预热数据、检查配置等
    }
}

@Component
@Order(2)
public class MyApplicationRunner implements ApplicationRunner {
    
    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("ApplicationRunner 执行");
        
        // 获取选项参数
        Set<String> optionNames = args.getOptionNames();
        
        // 获取非选项参数
        List<String> nonOptionArgs = args.getNonOptionArgs();
        
        System.out.println("选项参数: " + optionNames);
        System.out.println("非选项参数: " + nonOptionArgs);
    }
}
```

**执行顺序：**
使用 `@Order` 注解控制执行顺序，数字越小优先级越高。

### 3.4.5 EnvironmentPostProcessor

**作用：** 在 Environment 准备完成后进行后处理。

**接口定义：**

```java
@FunctionalInterface
public interface EnvironmentPostProcessor {
    void postProcessEnvironment(ConfigurableEnvironment environment,
                                SpringApplication application);
}
```

**实现示例：**

```java
public class MyEnvironmentPostProcessor implements EnvironmentPostProcessor {
    
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment,
                                       SpringApplication application) {
        // 添加自定义配置源
        Map<String, Object> customProperties = new HashMap<>();
        customProperties.put("custom.property", "custom-value");
        customProperties.put("server.port", "9090");
        
        MapPropertySource propertySource = new MapPropertySource("customProperties", customProperties);
        environment.getPropertySources().addFirst(propertySource);
        
        System.out.println("自定义配置已添加");
    }
}
```

**注册方式：**

```properties
# META-INF/spring.factories
org.springframework.boot.env.EnvironmentPostProcessor=\
com.example.MyEnvironmentPostProcessor
```

---

## 3.5 Spring Boot 与 Spring Framework 的集成

### 3.5.1 集成关系图

```
Spring Boot Application
    ↓ 使用
@SpringBootApplication
    ├── @SpringBootConfiguration (= @Configuration)
    ├── @EnableAutoConfiguration
    └── @ComponentScan
    ↓ 启动
SpringApplication.run()
    ↓ 创建
ApplicationContext (Spring Framework 核心)
    ├── BeanFactory
    ├── BeanDefinitionRegistry
    └── Environment
    ↓ 加载
Bean Definitions
    ↓ 实例化
Beans (Controller, Service, Repository...)
```

### 3.5.2 Spring Framework 核心组件在 Spring Boot 中的使用

#### **IoC 容器**

```java
// Spring Framework 方式
ApplicationContext context = 
    new AnnotationConfigApplicationContext(AppConfig.class);

// Spring Boot 方式（自动化）
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(DemoApplication.class, args);
    }
}
```

#### **AOP**

```java
// Spring Framework 需要配置
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {}

// Spring Boot 自动配置（有 aspectjweaver 依赖时）
// 无需任何配置
```

#### **事务管理**

```java
// Spring Framework 需要配置
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    @Bean
    public PlatformTransactionManager transactionManager() {
        return new DataSourceTransactionManager(dataSource());
    }
}

// Spring Boot 自动配置
// 只需 application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/test
```

### 3.5.3 Spring Boot 对 Spring Framework 的增强

| 功能 | Spring Framework | Spring Boot |
|------|------------------|-------------|
| **配置方式** | 大量 XML/JavaConfig | 自动配置 + 少量覆盖 |
| **依赖管理** | 手动管理每个依赖 | Starter 一站式依赖 |
| **容器启动** | 编程式创建 Context | 声明式 SpringApplication |
| **外部配置** | 需手动实现 | 内置配置加载机制 |
| **生产监控** | 需集成第三方 | 内置 Actuator |
| **嵌入式服务器** | 需外部 Tomcat | 内嵌 Tomcat/Jetty |

---

## 3.6 实际运行示例

### 3.6.1 最小化 Spring Boot 应用

**代码：**

```java
@SpringBootApplication
@RestController
public class MinimalApp {
    
    @GetMapping("/")
    public String hello() {
        return "Hello, Spring Boot!";
    }
    
    public static void main(String[] args) {
        SpringApplication.run(MinimalApp.class, args);
    }
}
```

**运行流程：**

```
1. main() 方法执行
    ↓
2. SpringApplication.run() 启动
    ├── 推断应用类型: SERVLET（检测到 spring-webmvc）
    ├── 加载 spring.factories 中的配置
    └── 创建 SpringApplication 实例
    ↓
3. 执行启动流程
    ├── 启动监听器通知（starting）
    ├── 创建 Environment
    ├── 打印 Banner
    ├── 创建 ServletWebServerApplicationContext
    ├── 准备 Context
    │   ├── 加载主配置类 MinimalApp
    │   ├── 扫描 @Component、@Service 等
    │   └── 加载自动配置类
    ├── 刷新 Context
    │   ├── 自动配置生效
    │   │   ├── ServletWebServerFactoryAutoConfiguration
    │   │   ├── DispatcherServletAutoConfiguration
    │   │   └── HttpMessageConvertersAutoConfiguration
    │   ├── 创建 TomcatServletWebServerFactory
    │   ├── 启动嵌入式 Tomcat
    │   └── 注册 DispatcherServlet
    └── 启动监听器通知（started）
    ↓
4. 应用启动完成
    ├── Tomcat 监听 8080 端口
    ├── DispatcherServlet 处理请求
    └── MinimalApp.hello() 处理 GET /
```

### 3.6.2 添加监听器示例

```java
@SpringBootApplication
public class DemoApplication {
    
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(DemoApplication.class);
        
        // 添加初始化器
        app.addInitializers(context -> {
            System.out.println("初始化器执行: " + context.getId());
        });
        
        // 添加监听器
        app.addListeners(event -> {
            System.out.println("事件: " + event.getClass().getSimpleName());
        });
        
        app.run(args);
    }
}
```

**输出：**
```
初始化器执行: application
事件: ApplicationStartingEvent
事件: ApplicationEnvironmentPreparedEvent
事件: ApplicationContextInitializedEvent
事件: ApplicationPreparedEvent
事件: ContextRefreshedEvent
事件: ServletWebServerInitializedEvent
事件: ApplicationStartedEvent
事件: ApplicationReadyEvent
```

---

## 3.7 常见问题与易错点

### 3.7.1 ApplicationContext 类型错误

**问题：** 非 Web 应用被识别为 Web 应用。

**原因：** classpath 中有 Web 相关依赖。

**解决方案：**

```java
SpringApplication app = new SpringApplication(DemoApplication.class);
app.setWebApplicationType(WebApplicationType.NONE);  // 强制非 Web 应用
app.run(args);
```

或配置文件：
```properties
spring.main.web-application-type=none
```

### 3.7.2 多次刷新 ApplicationContext

**问题：** 重复调用 `SpringApplication.run()` 导致错误。

**错误代码：**
```java
public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
    SpringApplication.run(DemoApplication.class, args);  // 错误
}
```

**正确做法：** 只调用一次 `run()` 方法。

### 3.7.3 Runner 未执行

**问题：** CommandLineRunner 或 ApplicationRunner 没有执行。

**原因：** 未使用 `@Component` 注解。

**错误：**
```java
public class MyRunner implements CommandLineRunner {
    @Override
    public void run(String... args) {
        System.out.println("执行");
    }
}
```

**正确：**
```java
@Component  // 必须注册为 Bean
public class MyRunner implements CommandLineRunner {
    @Override
    public void run(String... args) {
        System.out.println("执行");
    }
}
```

### 3.7.4 扩展点注册失败

**问题：** ApplicationContextInitializer 未生效。

**原因：** spring.factories 配置错误。

**错误：**
```properties
# 错误的键名
ApplicationContextInitializer=com.example.MyInitializer
```

**正确：**
```properties
# 完整的类名
org.springframework.context.ApplicationContextInitializer=\
com.example.MyInitializer
```

---

## 3.8 本章小结

### 核心要点

1. **Spring Boot 整体架构**
   - 分层设计：应用层 → Spring Boot 层 → Spring Framework 层 → JDK 层
   - 核心模块：SpringApplication、AutoConfiguration、Starter、Actuator
   - 依赖关系：应用 → Starter → AutoConfiguration → Spring Boot → Spring Framework

2. **核心组件**
   - **SpringApplication**: 启动入口，管理启动流程
   - **ApplicationContext**: 核心容器，管理所有 Bean
   - **Environment**: 环境抽象，管理配置
   - **AutoConfiguration**: 自动配置，简化开发
   - **Starter**: 依赖管理，一站式解决方案
   - **Actuator**: 生产监控，运维支持

3. **启动流程**
   - 12 个关键步骤：从创建 SpringApplication 到应用就绪
   - 核心阶段：创建 Context → 准备 Context → 刷新 Context → 启动完成
   - 自动配置在 `refreshContext()` 阶段生效

4. **扩展点体系**
   - **ApplicationContextInitializer**: Context 初始化前
   - **SpringApplicationRunListener**: 启动过程监听
   - **CommandLineRunner/ApplicationRunner**: 启动后执行
   - **EnvironmentPostProcessor**: 环境准备后处理

5. **与 Spring Framework 的关系**
   - Spring Boot 基于 Spring Framework，不是替代
   - 通过自动配置简化 Spring Framework 的使用
   - 提供开箱即用的生产级特性

### 思维导图

```
Spring Boot 运行机制
├── 整体架构
│   ├── 分层设计
│   ├── 核心模块
│   └── 依赖关系
├── 核心组件
│   ├── SpringApplication
│   ├── ApplicationContext
│   ├── Environment
│   ├── AutoConfiguration
│   ├── Starter
│   └── Actuator
├── 启动流程
│   ├── 创建 SpringApplication
│   ├── 准备 Environment
│   ├── 创建 ApplicationContext
│   ├── 刷新 ApplicationContext
│   └── 启动完成
└── 扩展点
    ├── ApplicationContextInitializer
    ├── SpringApplicationRunListener
    ├── CommandLineRunner
    └── EnvironmentPostProcessor
```

### 自检清单

- [ ] 理解 Spring Boot 的分层架构设计
- [ ] 掌握核心组件的职责和协作关系
- [ ] 了解 Spring Boot 启动流程的 12 个关键步骤
- [ ] 理解 ApplicationContext 的创建和刷新过程
- [ ] 掌握主要扩展点的使用方法
- [ ] 理解 Spring Boot 与 Spring Framework 的关系

---

## 下一章预告

**第 4 章：@SpringBootApplication 注解剖析**

将深入解析 Spring Boot 的核心注解 `@SpringBootApplication`，包括：
- @SpringBootApplication 三合一注解
- @SpringBootConfiguration 配置类
- @ComponentScan 组件扫描机制
- @EnableAutoConfiguration 自动配置启用

---

**相关章节：**
- [第 2 章：约定大于配置设计理念](./content-2.md)
- [第 4 章：@SpringBootApplication 注解剖析](./content-4.md)
- [第 21 章：SpringApplication.run() 完整流程](./content-21.md)

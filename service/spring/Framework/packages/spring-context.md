# Spring Context 源码指引

> spring-context 在 spring-beans 基础上提供 ApplicationContext 容器、注解驱动配置、事件机制、国际化等企业级功能。

---

## 1. ApplicationContext 容器

### 核心接口
- **ApplicationContext** - 应用上下文接口（继承 BeanFactory）
- **ConfigurableApplicationContext** - 可配置应用上下文
- **WebApplicationContext** - Web 应用上下文

### 核心实现
- **AnnotationConfigApplicationContext** - 注解配置应用上下文
- **ClassPathXmlApplicationContext** - 类路径 XML 配置上下文
- **FileSystemXmlApplicationContext** - 文件系统 XML 配置上下文
- **GenericApplicationContext** - 通用应用上下文
- **GenericWebApplicationContext** - 通用 Web 应用上下文
- **StaticApplicationContext** - 静态应用上下文（测试用）

### 设计目的
ApplicationContext 是 BeanFactory 的超集，提供更多企业级功能：自动注册 BeanPostProcessor、事件发布、国际化、资源加载、环境抽象等。

### 使用限制与风险
- ApplicationContext 启动时会实例化所有单例 Bean（非懒加载）
- 相比 BeanFactory 内存和启动时间开销更大
- Web 环境需使用 WebApplicationContext 及其子类

---

## 2. 国际化支持（MessageSource）

### 核心接口
- **MessageSource** - 消息源接口
- **HierarchicalMessageSource** - 支持层级的消息源

### 核心实现
- **ResourceBundleMessageSource** - 基于 ResourceBundle 的消息源
- **ReloadableResourceBundleMessageSource** - 可重载的消息源
- **StaticMessageSource** - 静态消息源（测试用）
- **DelegatingMessageSource** - 委托消息源

### 设计目的
提供国际化消息管理，支持多语言、参数化消息、消息回退等功能。

### 使用限制与风险
- 消息文件编码需配置为 UTF-8
- ResourceBundleMessageSource 依赖 JDK ResourceBundle，不支持热加载
- ReloadableResourceBundleMessageSource 支持热加载但性能略低

---

## 3. 事件发布与监听（ApplicationEventPublisher）

### 核心接口
- **ApplicationEvent** - 应用事件基类
- **ApplicationListener** - 事件监听器接口
- **ApplicationEventPublisher** - 事件发布器接口
- **ApplicationEventMulticaster** - 事件多播器接口

### 核心实现
- **SimpleApplicationEventMulticaster** - 简单事件多播器（默认）
- **AbstractApplicationEventMulticaster** - 事件多播器抽象基类

### 事件注解支持
- **@EventListener** - 事件监听器注解
- **EventListenerMethodProcessor** - 处理 @EventListener 的后处理器

### 内置事件
- **ContextRefreshedEvent** - 容器刷新完成事件
- **ContextStartedEvent** - 容器启动事件
- **ContextStoppedEvent** - 容器停止事件
- **ContextClosedEvent** - 容器关闭事件

### 设计目的
实现应用内事件发布-订阅机制，解耦组件间通信。

### 使用限制与风险
- 默认是同步发布，监听器阻塞会影响发布者
- 可配置 TaskExecutor 实现异步发布
- @EventListener 方法返回值可作为新事件继续发布
- 事件监听器执行顺序通过 @Order 控制

---

## 4. 注解驱动配置（@Configuration、@Bean）

### 核心注解
- **@Configuration** - 配置类注解
- **@Bean** - Bean 定义注解
- **@Import** - 导入其他配置类
- **@ComponentScan** - 组件扫描注解
- **@PropertySource** - 属性源注解
- **@Profile** - 环境配置注解
- **@Lazy** - 懒加载注解
- **@DependsOn** - 依赖声明注解
- **@Primary** - 首选 Bean 注解
- **@Scope** - 作用域注解

### 设计目的
实现完全基于注解的配置，替代 XML 配置，提升开发效率和类型安全。

### 使用限制与风险
- @Configuration 类会被 CGLIB 代理，内部 @Bean 方法调用会返回容器单例
- 普通 @Component 类的 @Bean 方法不会被代理（lite mode）
- @Bean 方法可有参数，自动从容器注入

---

## 5. 配置类解析与处理（ConfigurationClassPostProcessor）

### 核心类
- **ConfigurationClassPostProcessor** - 配置类后处理器（最核心）
- **ConfigurationClassParser** - 配置类解析器
- **ConfigurationClass** - 配置类模型
- **BeanMethod** - @Bean 方法模型
- **ImportBeanDefinitionRegistrar** - Import 注册器接口
- **ImportSelector** - Import 选择器接口
- **DeferredImportSelector** - 延迟 Import 选择器

### 处理流程
1. 解析 @Configuration 类
2. 处理 @PropertySource
3. 处理 @ComponentScan
4. 处理 @Import
5. 处理 @Bean 方法
6. 注册 BeanDefinition

### 设计目的
将注解配置转换为 BeanDefinition，是注解驱动的核心引擎。

### 使用限制与风险
- ConfigurationClassPostProcessor 优先级很高，必须最早执行
- @Import 支持三种方式：配置类、ImportSelector、ImportBeanDefinitionRegistrar
- DeferredImportSelector 延迟到所有 @Configuration 解析完成后执行（自动配置使用）

---

## 6. @ComponentScan 扫描机制

### 核心类
- **ClassPathBeanDefinitionScanner** - 类路径 Bean 定义扫描器
- **ComponentScanAnnotationParser** - @ComponentScan 注解解析器
- **AnnotationTypeFilter** - 注解类型过滤器
- **AssignableTypeFilter** - 可分配类型过滤器
- **RegexPatternTypeFilter** - 正则表达式过滤器
- **AspectJTypeFilter** - AspectJ 表达式过滤器

### 扫描策略
- **includeFilters** - 包含过滤器
- **excludeFilters** - 排除过滤器
- **basePackages** - 基础包路径
- **basePackageClasses** - 基础包类（类型安全）

### 设计目的
自动扫描指定包下的组件类（@Component、@Service、@Repository、@Controller），注册为 BeanDefinition。

### 使用限制与风险
- 扫描范围过大会影响启动性能
- 过滤器按顺序执行，先 exclude 后 include
- 默认扫描 @Component 及其派生注解

---

## 7. Import 机制（ImportSelector、ImportBeanDefinitionRegistrar、@Import）

### 核心接口
- **ImportSelector** - Import 选择器（返回类名数组）
- **DeferredImportSelector** - 延迟 Import 选择器
- **ImportBeanDefinitionRegistrar** - Import 注册器（直接注册 BeanDefinition）

### @Import 支持三种方式
1. **普通配置类** - 直接导入
2. **ImportSelector** - 动态返回配置类名
3. **ImportBeanDefinitionRegistrar** - 编程式注册 BeanDefinition

### 设计目的
提供灵活的模块化配置导入机制，支持条件化导入、自动配置等高级场景。

### 使用限制与风险
- ImportSelector 不能返回 @Configuration 类本身（会递归）
- DeferredImportSelector 用于自动配置，执行时机最晚
- ImportBeanDefinitionRegistrar 最灵活但代码量大

---

## 8. 条件注解体系（@Conditional 及其变体）

### 核心注解
- **@Conditional** - 条件注解（基础）
- **@ConditionalOnClass** - 类存在条件
- **@ConditionalOnMissingClass** - 类不存在条件
- **@ConditionalOnBean** - Bean 存在条件
- **@ConditionalOnMissingBean** - Bean 不存在条件
- **@ConditionalOnProperty** - 属性条件
- **@ConditionalOnExpression** - SpEL 表达式条件
- **@ConditionalOnResource** - 资源存在条件
- **@ConditionalOnWebApplication** - Web 应用条件
- **@ConditionalOnNotWebApplication** - 非 Web 应用条件

### 核心接口
- **Condition** - 条件接口（`matches()` 方法）
- **ConfigurationCondition** - 配置条件接口（支持配置阶段）
- **ConditionContext** - 条件上下文
- **AnnotatedTypeMetadata** - 注解类型元数据

### 设计目的
实现条件化 Bean 注册和配置，根据环境、类路径、属性等动态决定是否生效。

### 使用限制与风险
- 条件评估有性能开销，避免过于复杂的条件逻辑
- @ConditionalOnBean 依赖 Bean 注册顺序，可能不稳定
- 条件评估失败不会抛异常，只是不注册 Bean

---

## 9. AnnotationConfigRegistry

### 核心接口
- **AnnotationConfigRegistry** - 注解配置注册表接口
  - `register(Class<?>... componentClasses)` - 注册配置类
  - `scan(String... basePackages)` - 扫描包

### 核心实现
- **AnnotationConfigApplicationContext** - 实现了此接口

### 设计目的
提供编程式注册配置类和扫描包的 API，适合动态配置场景。

### 使用限制与风险
- register 和 scan 需在容器 refresh 之前调用
- 多次调用会累加配置，不会覆盖

---

## 10. Profile 与多环境支持

### 核心注解
- **@Profile** - 环境配置注解

### 核心接口
- **Environment** - 环境接口
- **ConfigurableEnvironment** - 可配置环境接口
- **Profiles** - 配置文件接口（Spring 5.1+）

### 激活方式
- **spring.profiles.active** - 激活的 Profile
- **spring.profiles.default** - 默认 Profile
- **Environment.setActiveProfiles()** - 编程式激活

### 设计目的
支持多环境配置（开发、测试、生产），根据环境激活不同的 Bean 和配置。

### 使用限制与风险
- @Profile 可用于类和方法级别
- 支持逻辑表达式：`@Profile("!prod")`, `@Profile("dev & local")`
- Profile 激活优先级：程序参数 > 系统属性 > 环境变量 > 默认值

---

## 11. 任务调度（TaskScheduler）

### 核心接口
- **TaskScheduler** - 任务调度器接口
- **SchedulingTaskExecutor** - 调度任务执行器
- **Trigger** - 触发器接口
- **CronTrigger** - Cron 触发器

### 核心实现
- **ThreadPoolTaskScheduler** - 线程池任务调度器（默认）
- **ConcurrentTaskScheduler** - 并发任务调度器

### 注解支持
- **@EnableScheduling** - 启用调度支持
- **@Scheduled** - 调度任务注解
- **ScheduledAnnotationBeanPostProcessor** - 处理 @Scheduled

### 调度方式
- **fixedRate** - 固定速率
- **fixedDelay** - 固定延迟
- **cron** - Cron 表达式
- **initialDelay** - 初始延迟

### 设计目的
提供声明式任务调度，替代 Quartz 等重量级调度框架，适合简单调度场景。

### 使用限制与风险
- @Scheduled 方法必须无参无返回值
- 默认单线程执行，需配置线程池实现并发
- Cron 表达式不支持秒级以下精度
- 异常不会中断调度，需自行处理

---

## 12. 异步方法执行（@Async）

### 核心注解
- **@EnableAsync** - 启用异步支持
- **@Async** - 异步方法注解

### 核心类
- **AsyncAnnotationBeanPostProcessor** - 处理 @Async 的后处理器
- **AnnotationAsyncExecutionInterceptor** - 异步执行拦截器

### 返回值支持
- **void** - 无返回值
- **Future** - JDK Future
- **ListenableFuture** - Spring Future（可监听）
- **CompletableFuture** - JDK 8 CompletableFuture

### 设计目的
实现声明式异步方法调用，简化多线程编程。

### 使用限制与风险
- @Async 基于 AOP 代理，内部方法调用不会生效
- 需配置 TaskExecutor，否则使用默认的 SimpleAsyncTaskExecutor（性能差）
- 异常需通过 AsyncUncaughtExceptionHandler 处理
- 返回值类型必须是 void 或 Future 系列

---

## 13. 资源加载（ResourceLoader）

### 核心接口
- **ResourceLoader** - 资源加载器接口（继承自 spring-core）
- **ResourcePatternResolver** - 批量资源解析器

### 设计目的
ApplicationContext 实现了 ResourceLoader，可直接加载资源。

### 使用限制与风险
- 资源路径支持 classpath:、file:、http: 等协议
- 通配符路径（`classpath*:`、`**/*.xml`）性能开销大

---

## 14. 上下文扩展点（ApplicationContextInitializer）

### 核心接口
- **ApplicationContextInitializer** - 应用上下文初始化器
- **ApplicationContextAware** - 应用上下文感知接口

### 设计目的
在容器 refresh 之前执行自定义初始化逻辑，如注册 PropertySource、添加 BeanFactoryPostProcessor 等。

### 使用限制与风险
- 需在 spring.factories 或编程式注册
- 执行时机早于 BeanFactoryPostProcessor
- Spring Boot 大量使用此扩展点

---

## 15. 生命周期管理（Lifecycle、SmartLifecycle）

### 核心接口
- **Lifecycle** - 生命周期接口
  - `start()` - 启动
  - `stop()` - 停止
  - `isRunning()` - 是否运行中
- **SmartLifecycle** - 智能生命周期（支持自动启动和优先级）
- **LifecycleProcessor** - 生命周期处理器

### 核心实现
- **DefaultLifecycleProcessor** - 默认生命周期处理器

### 设计目的
统一管理组件的启动和停止，适合需要生命周期管理的组件（如消息监听器、任务调度器）。

### 使用限制与风险
- SmartLifecycle 的 `isAutoStartup()` 返回 true 会自动启动
- `getPhase()` 返回值决定启动顺序（值越小越早启动，停止顺序相反）
- stop(Runnable callback) 支持异步停止

---

## 16. 依赖注入扩展（@Autowired、@Qualifier、@Value）

### 核心注解
- **@Autowired** - 自动装配（Spring）
- **@Qualifier** - 限定符
- **@Value** - 注入字面量或属性值
- **@Resource** - JSR-250（按名称）
- **@Inject** - JSR-330（按类型）

### 核心类
- **AutowiredAnnotationBeanPostProcessor** - 处理 @Autowired/@Value
- **CommonAnnotationBeanPostProcessor** - 处理 @Resource
- **QualifierAnnotationAutowireCandidateResolver** - 限定符解析器

### 设计目的
提供多种依赖注入注解，满足不同规范和习惯。

### 使用限制与风险
- @Autowired 默认 required=true，找不到 Bean 会抛异常
- @Qualifier 可自定义注解
- @Value 支持 SpEL 表达式和属性占位符

---

## 17. 环境与属性管理（Environment、PropertySource）

### 核心接口
- **Environment** - 环境接口（Profile + PropertyResolver）
- **ConfigurableEnvironment** - 可配置环境
- **PropertySource** - 属性源抽象
- **PropertySources** - 属性源集合

### 核心实现
- **StandardEnvironment** - 标准环境
- **StandardServletEnvironment** - Servlet 环境
- **PropertySourcesPropertyResolver** - 属性源解析器

### 注解支持
- **@PropertySource** - 属性源注解
- **PropertySourcesPlaceholderConfigurer** - 占位符配置器

### 设计目的
统一管理环境和属性配置，支持多种配置源和优先级。

### 使用限制与风险
- @PropertySource 仅支持 .properties 和 .xml 文件
- PropertySource 有优先级，后添加的优先级更高
- 占位符格式：`${key:defaultValue}`

---

## 18. ApplicationContext 层次结构

### 核心方法
- **setParent(ApplicationContext parent)** - 设置父上下文
- **getParent()** - 获取父上下文

### 设计目的
支持上下文层级结构，子上下文可访问父上下文的 Bean，实现配置隔离。

### 使用限制与风险
- 典型应用：Spring + Spring MVC（父子上下文）
- 子上下文的 Bean 可覆盖父上下文同名 Bean
- @Autowired 优先从当前上下文查找

---

## 19. SpEL 集成

### 集成方式
- **@Value** - 支持 SpEL 表达式（`#{expression}`）
- **@ConditionalOnExpression** - 条件表达式

### 设计目的
在配置和注解中使用 SpEL 表达式，实现动态配置。

### 使用限制与风险
- SpEL 表达式解析有性能开销
- 表达式语法错误会导致启动失败

---

## 20. 事件异步发布（ApplicationEventMulticaster）

### 核心接口
- **ApplicationEventMulticaster** - 事件多播器

### 核心实现
- **SimpleApplicationEventMulticaster** - 简单事件多播器

### 配置异步
```java
@Bean
public ApplicationEventMulticaster applicationEventMulticaster(TaskExecutor taskExecutor) {
    SimpleApplicationEventMulticaster multicaster = new SimpleApplicationEventMulticaster();
    multicaster.setTaskExecutor(taskExecutor);
    return multicaster;
}
```

### 设计目的
支持异步事件发布，避免监听器阻塞发布者。

### 使用限制与风险
- 异步发布无法获取监听器异常
- 需配置异常处理器（setErrorHandler）

---

## 21. 配置属性绑定（@ConfigurationProperties 支持）

### 核心类
- **ConfigurationPropertiesBindingPostProcessor** - 配置属性绑定后处理器（Spring Boot 提供）

### 设计目的
将外部配置绑定到 Java 对象，实现类型安全的配置管理。

### 使用限制与风险
- 需 Spring Boot 支持
- 支持嵌套对象、集合、Map 等复杂类型
- 校验需配合 @Validated 使用

---

## 22. 注解与 XML 配置兼容

### 混合使用
- **@ImportResource** - 导入 XML 配置
- **context:component-scan** - XML 中启用组件扫描
- **context:annotation-config** - XML 中启用注解配置

### 设计目的
支持渐进式迁移，从 XML 配置平滑过渡到注解配置。

### 使用限制与风险
- 混合配置增加维护成本，建议尽早统一
- @Bean 方法优先级高于 XML 同名 Bean

---

## 23. BeanDefinition 扫描与注册

### 核心类
- **ClassPathBeanDefinitionScanner** - 类路径扫描器
- **AnnotatedBeanDefinitionReader** - 注解 Bean 定义读取器

### 设计目的
自动扫描和注册 BeanDefinition，减少手动配置。

### 使用限制与风险
- 扫描性能与包路径范围成正比
- 过滤器配置不当可能遗漏或多注册 Bean

---

## 📚 总结

spring-context 在 spring-beans 基础上提供了企业级功能：
- **ApplicationContext**：功能更丰富的容器
- **注解驱动配置**：@Configuration、@ComponentScan、@Import 等
- **配置类解析**：ConfigurationClassPostProcessor 核心引擎
- **条件化配置**：@Conditional 体系
- **事件机制**：发布-订阅模式
- **国际化**：MessageSource 支持
- **任务调度**：@Scheduled 声明式调度
- **异步执行**：@Async 声明式异步
- **环境抽象**：Profile、PropertySource 统一管理

这些功能使 Spring 成为完整的企业级应用框架。

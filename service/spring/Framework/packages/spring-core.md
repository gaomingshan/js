# Spring Core 源码指引

> spring-core 是 Spring Framework 的基础模块，提供资源访问、类型转换、反射工具、环境抽象等核心功能。

---

## 1. 资源访问（Resource 抽象）

### 核心类体系
- **Resource** - 资源访问统一抽象接口
- **InputStreamSource** - Resource 的父接口
- **WritableResource** - 可写资源接口
- **ContextResource** - 上下文相关资源接口
- **HttpResource** - HTTP 资源接口

### 核心实现类
- **ClassPathResource** - 类路径资源
- **FileSystemResource** - 文件系统资源
- **UrlResource** - URL 资源
- **ByteArrayResource** - 字节数组资源
- **InputStreamResource** - 输入流资源
- **PathResource** - NIO Path 资源

### 资源加载体系
- **ResourceLoader** - 资源加载器接口
- **DefaultResourceLoader** - 默认资源加载器
- **ResourcePatternResolver** - 批量资源加载接口（支持 Ant 风格路径）
- **PathMatchingResourcePatternResolver** - 基于路径匹配的资源解析器

### 自定义协议支持
- **ProtocolResolver** - 自定义协议解析器接口
- 设计目的：允许用户自定义资源协议（如 `custom://`），扩展 Spring 资源加载能力
- 使用限制：需要注册到 ResourceLoader 中，优先级高于默认解析器

### 设计目的
Resource 抽象统一了各种资源的访问方式，屏蔽底层差异，提供统一的 API。支持类路径、文件系统、URL、自定义协议等多种资源来源。

### 使用限制与风险
- ClassPathResource 依赖 ClassLoader，在模块化环境需注意类加载器隔离
- UrlResource 可能涉及网络 IO，需处理超时和异常
- 资源未关闭可能导致文件句柄泄漏

---

## 2. 类型转换（TypeConverter、ConversionService）

### 核心接口
- **Converter<S, T>** - 单一类型转换器
- **ConverterFactory<S, R>** - 转换器工厂（一对多转换）
- **GenericConverter** - 通用转换器（支持多对多）
- **ConditionalConverter** - 条件转换器
- **ConditionalGenericConverter** - 条件通用转换器

### 转换服务体系
- **ConversionService** - 类型转换服务接口
- **GenericConversionService** - 通用转换服务实现
- **DefaultConversionService** - 默认转换服务（内置常用转换器）
- **FormattingConversionService** - 格式化转换服务（集成 Formatter）

### 转换器注册与管理
- **ConverterRegistry** - 转换器注册接口
- **ConfigurableConversionService** - 可配置转换服务（ConversionService + ConverterRegistry）

### 类型描述符
- **TypeDescriptor** - 类型描述符（携带泛型、注解等元信息）
- 设计目的：封装完整的类型信息（包括泛型、注解），用于精确的类型转换匹配
- 使用限制：泛型擦除可能导致运行时类型信息丢失

### 传统类型转换
- **PropertyEditor** - JDK 原生属性编辑器
- **PropertyEditorRegistry** - 属性编辑器注册表
- **PropertyEditorRegistrar** - 属性编辑器注册器
- **CustomEditorConfigurer** - 自定义编辑器配置器

### 设计目的
提供灵活的类型转换体系，支持单向、双向、条件化转换，替代传统的 PropertyEditor。ConversionService 是线程安全的，支持泛型和复杂类型转换。

### 使用限制与风险
- Converter 是单向的，双向转换需注册两个 Converter
- ConverterFactory 适用于层级类型（如 String -> Enum）
- GenericConverter 更灵活但实现复杂，需正确处理 TypeDescriptor

---

## 3. 反射与工具类（ReflectionUtils、ClassUtils）

### 核心工具类
- **ReflectionUtils** - 反射操作工具类
- **ClassUtils** - 类操作工具类
- **MethodIntrospector** - 方法内省工具
- **AnnotatedElementUtils** - 注解元素工具类

### 字段与方法访问
- **FieldFilter** - 字段过滤器
- **MethodFilter** - 方法过滤器
- **FieldCallback** - 字段回调接口
- **MethodCallback** - 方法回调接口

### 设计目的
简化反射操作，提供字段、方法的查找、过滤、调用等工具方法。避免直接使用 JDK 反射 API 的繁琐和异常处理。

### 使用限制与风险
- 反射操作性能开销大，避免在高频场景使用
- 破坏封装性，需谨慎访问私有成员
- JDK 9+ 模块化限制反射访问，需配置 `--add-opens`

---

## 4. 元注解处理（AnnotationUtils、AnnotatedElementUtils）

### 核心工具类
- **AnnotationUtils** - 注解工具类（基础查找）
- **AnnotatedElementUtils** - 注解元素工具类（支持元注解、组合注解）
- **AnnotationAttributes** - 注解属性封装类
- **MergedAnnotations** - 合并注解 API（Spring 5.2+）
- **MergedAnnotation** - 单个合并注解

### 注解处理器
- **AnnotationFilter** - 注解过滤器
- **RepeatableContainers** - 可重复注解容器
- **AnnotationAttributeExtractor** - 注解属性提取器

### 设计目的
处理 Spring 复杂的注解体系，支持元注解、注解别名、属性覆盖、组合注解等高级特性。

### 使用限制与风险
- AnnotatedElementUtils 支持元注解查找，但性能低于 AnnotationUtils
- 注解继承规则复杂，需理解 `@Inherited` 语义
- 注解属性别名需通过 `@AliasFor` 声明

---

## 5. SPI 扩展机制（SpringFactoriesLoader）

### 核心类
- **SpringFactoriesLoader** - Spring SPI 加载器
- 配置文件：`META-INF/spring.factories`

### 设计目的
提供类似 JDK ServiceLoader 的 SPI 机制，支持加载配置在 `spring.factories` 中的实现类。广泛用于自动配置、事件监听器、初始化器等扩展点。

### 使用限制与风险
- 文件格式要求严格：`接口全限定名=实现类全限定名1,实现类全限定名2`
- 实现类必须有无参构造器
- 加载顺序不确定，需通过 `@Order` 或 `Ordered` 控制
- Spring Boot 2.7+ 推荐使用 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`

---

## 6. 系统属性与环境（Environment、PropertyResolver）

### 核心接口
- **Environment** - 环境抽象（Profile + PropertyResolver）
- **ConfigurableEnvironment** - 可配置环境接口
- **PropertyResolver** - 属性解析器接口
- **ConfigurablePropertyResolver** - 可配置属性解析器

### 环境实现
- **StandardEnvironment** - 标准环境（System.getProperties + System.getenv）
- **AbstractEnvironment** - 环境抽象基类

### 属性源体系
- **PropertySource** - 属性源抽象
- **PropertySources** - 属性源集合
- **MutablePropertySources** - 可变属性源集合
- **CommandLinePropertySource** - 命令行属性源
- **MapPropertySource** - Map 属性源
- **SystemEnvironmentPropertySource** - 系统环境变量属性源
- **PropertiesPropertySource** - Properties 属性源

### 占位符解析
- **PropertySourcesPropertyResolver** - 基于属性源的解析器
- **PropertyPlaceholderHelper** - 占位符解析助手（`${...}` 语法）

### 设计目的
统一管理应用配置，支持多种配置源（系统属性、环境变量、配置文件等），提供占位符解析和类型转换。

### 使用限制与风险
- PropertySource 有优先级，后添加的优先级更高
- 占位符嵌套过深可能导致性能问题
- 循环引用会导致栈溢出

---

## 7. 基础校验（Validator）

### 核心接口
- **Validator** - 校验器接口
- **Errors** - 错误收集接口
- **BindingResult** - 绑定结果（继承 Errors）

### 错误处理
- **ObjectError** - 对象级错误
- **FieldError** - 字段级错误
- **MessageCodesResolver** - 错误码解析器
- **DefaultMessageCodesResolver** - 默认错误码解析器

### 校验工具
- **ValidationUtils** - 校验工具类

### 设计目的
提供轻量级校验框架，独立于 JSR-303/JSR-380（Bean Validation）。支持自定义校验逻辑，与数据绑定集成。

### 使用限制与风险
- Spring Validator 不支持注解式校验，需手动调用
- 适合简单校验场景，复杂场景建议使用 Bean Validation
- Errors 对象线程不安全，不可共享

---

## 8. 基础异步（TaskExecutor）

### 核心接口
- **TaskExecutor** - 任务执行器接口（类似 `java.util.concurrent.Executor`）
- **AsyncTaskExecutor** - 异步任务执行器（支持超时）
- **AsyncListenableTaskExecutor** - 异步可监听任务执行器

### 线程池实现
- **ThreadPoolTaskExecutor** - 基于 `ThreadPoolExecutor` 的实现
- **SimpleAsyncTaskExecutor** - 简单异步执行器（每次创建新线程）
- **SyncTaskExecutor** - 同步执行器（在调用线程执行）
- **ConcurrentTaskExecutor** - 并发执行器（适配 JDK Executor）

### 调度支持
- **TaskScheduler** - 任务调度器接口
- **ThreadPoolTaskScheduler** - 基于 `ScheduledThreadPoolExecutor` 的实现
- **ConcurrentTaskScheduler** - 并发调度器

### 设计目的
提供 Spring 风格的异步任务执行抽象，统一线程池管理，支持生命周期回调和优雅关闭。

### 使用限制与风险
- SimpleAsyncTaskExecutor 无线程复用，不适合高并发
- 未配置拒绝策略可能导致任务丢失
- 需显式调用 `shutdown()` 避免线程泄漏

---

## 9. 路径与模式匹配（PathMatcher、AntPathMatcher）

### 核心接口
- **PathMatcher** - 路径匹配器接口
- **AntPathMatcher** - Ant 风格路径匹配器（默认实现）

### 设计目的
提供 Ant 风格的路径模式匹配（`*`、`**`、`?`），用于资源扫描、URL 映射、AOP 切点等场景。

### 使用限制与风险
- `**` 匹配任意层级目录，`*` 仅匹配单层
- 性能敏感场景需缓存匹配结果
- 路径分隔符在不同 OS 需注意（默认 `/`）

---

## 10. 编解码与摘要算法（Encoder/Decoder、DigestUtils）

### 编解码器
- **Encoder** - 编码器接口
- **Decoder** - 解码器接口
- **Codec** - 编解码器（Encoder + Decoder）

### 摘要工具
- **DigestUtils** - 摘要算法工具类（MD5、SHA 等）

### 设计目的
提供常用编解码和摘要算法的简化 API，避免直接使用 JDK API 的繁琐异常处理。

### 使用限制与风险
- MD5 已不安全，生产环境推荐 SHA-256 或更高
- 摘要计算是 CPU 密集操作

---

## 11. 停表计时与性能分析（StopWatch）

### 核心类
- **StopWatch** - 秒表工具类

### 设计目的
提供简单的性能计时工具，支持多任务计时和统计，适合开发调试阶段分析性能瓶颈。

### 使用限制与风险
- 非线程安全，不可并发使用
- 仅适合粗粒度计时，精确性能分析需使用 JMH 等专业工具

---

## 12. 基础集合与对象工具（CollectionUtils、ObjectUtils）

### 核心工具类
- **CollectionUtils** - 集合工具类
- **ObjectUtils** - 对象工具类
- **StringUtils** - 字符串工具类
- **Assert** - 断言工具类
- **MultiValueMap** - 多值 Map 接口（一键多值）
- **LinkedMultiValueMap** - 多值 Map 实现

### 设计目的
提供常用的集合、对象、字符串操作工具方法，简化日常开发，提升代码可读性。

### 使用限制与风险
- 工具方法不是万能的，复杂逻辑仍需自定义实现
- 部分方法与 Apache Commons 功能重复，选择一致的工具库

---

## 13. 基础参数名发现（ParameterNameDiscoverer）

### 核心接口
- **ParameterNameDiscoverer** - 参数名发现器接口
- **DefaultParameterNameDiscoverer** - 默认参数名发现器
- **LocalVariableTableParameterNameDiscoverer** - 基于字节码局部变量表的发现器
- **StandardReflectionParameterNameDiscoverer** - 基于 JDK 反射的发现器（JDK 8+）

### 设计目的
在运行时获取方法参数名，用于依赖注入、数据绑定等场景。支持编译时保留参数名（`-parameters`）和字节码分析。

### 使用限制与风险
- 需编译时指定 `-parameters` 或保留调试信息
- 字节码分析可能失败（混淆、精简后的代码）
- 性能开销较大，建议缓存结果

---

## 14. Ordered 与优先级体系

### 核心接口
- **Ordered** - 排序接口（定义 `getOrder()` 方法）
- **PriorityOrdered** - 优先级排序接口（标记接口，优先级高于 Ordered）

### 比较器
- **OrderComparator** - 基于 Ordered 的比较器
- **AnnotationAwareOrderComparator** - 支持 `@Order`、`@Priority` 注解的比较器

### 设计目的
提供统一的优先级排序机制，用于 BeanPostProcessor、Interceptor、Filter 等组件的执行顺序控制。

### 使用限制与风险
- Order 值越小优先级越高
- PriorityOrdered 始终优先于 Ordered
- `@Order` 不影响 Bean 创建顺序，仅影响列表注入顺序

---

## 15. ResolvableType 类型解析

### 核心类
- **ResolvableType** - 可解析类型（封装泛型信息）

### 设计目的
解决 Java 泛型擦除问题，在运行时获取完整的泛型类型信息（如 `List<String>` 中的 `String`）。

### 使用限制与风险
- 依赖字段、方法、类等元数据获取泛型信息
- 运行时动态创建的泛型类型无法解析
- 性能开销较大，建议缓存 ResolvableType 实例

---

## 16. 基础编解码器框架（Codec）

### 核心接口
- **Encoder** - 编码器接口
- **Decoder** - 解码器接口
- **Codec** - 编解码器复合接口

### 设计目的
为 spring-web、spring-webflux 提供统一的编解码抽象，支持 JSON、XML、Protobuf 等多种数据格式。

### 使用限制与风险
- Codec 需配合 MediaType 使用
- 自定义 Codec 需注册到 CodecConfigurer

---

## 17. 基础 CGLIB 代理支持

### 核心类
- **CglibSubclassingInstantiationStrategy** - CGLIB 子类实例化策略
- **Enhancer** - CGLIB 增强器（Spring 内嵌版本）

### 设计目的
为 AOP、配置类代理等功能提供 CGLIB 动态代理支持。Spring 内嵌了 CGLIB，避免版本冲突。

### 使用限制与风险
- CGLIB 代理基于继承，无法代理 final 类和 final 方法
- 代理类生成有性能开销，建议缓存代理实例
- 构造器拦截可能导致副作用

---

## 18. 基础 MethodIntrospector

### 核心类
- **MethodIntrospector** - 方法内省工具

### 设计目的
在类层次结构中查找方法，支持桥接方法解析、接口方法查找等复杂场景。

### 使用限制与风险
- 桥接方法在泛型继承场景自动生成，需正确处理
- 性能开销较大，建议缓存查找结果

---

## 19. 基础事件（ApplicationEvent）

### 核心类
- **ApplicationEvent** - 应用事件基类
- **ApplicationListener** - 事件监听器接口

### 设计目的
提供事件发布-订阅机制的基础类，具体实现在 spring-context 模块。

### 使用限制与风险
- 事件是同步发布的，监听器阻塞会影响发布者
- 需配合 ApplicationEventPublisher 使用

---

## 20. 基础表达式（Expression）

### 核心接口
- **Expression** - 表达式接口
- **ExpressionParser** - 表达式解析器接口

### 设计目的
为 SpEL（Spring Expression Language）提供基础抽象，具体实现在 spring-expression 模块。

---

## 21. 基础 ID 生成（IdGenerator）

### 核心接口
- **IdGenerator** - ID 生成器接口
- **SimpleIdGenerator** - 简单 ID 生成器（UUID）
- **AlternativeJdkIdGenerator** - 替代 JDK ID 生成器

### 设计目的
提供可插拔的 ID 生成策略，支持 UUID、雪花算法等自定义实现。

### 使用限制与风险
- UUID 无序，不适合数据库主键
- 分布式 ID 需考虑唯一性保证

---

## 22. 基础序列化（Serializer/Deserializer）

### 核心接口
- **Serializer** - 序列化器接口
- **Deserializer** - 反序列化器接口

### 设计目的
提供通用序列化抽象，支持 Java 序列化、JSON、XML 等多种格式。

### 使用限制与风险
- Java 序列化存在安全风险，生产环境谨慎使用
- 自定义序列化器需处理版本兼容性

---

## 📚 总结

spring-core 是 Spring Framework 的基石，提供了：
- **资源抽象**：统一资源访问，支持自定义协议
- **类型转换**：灵活的转换体系，替代传统 PropertyEditor
- **反射工具**：简化反射操作，提升开发效率
- **环境抽象**：统一配置管理，支持多配置源
- **工具类集**：集合、字符串、对象等常用操作

这些基础设施为上层模块（beans、context、aop 等）提供了坚实支撑。

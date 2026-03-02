# Spring Beans 源码指引

> spring-beans 是 Spring IoC 容器的核心实现，提供 Bean 定义、生命周期管理、依赖注入等基础功能。

---

## 1. IoC 容器基础（BeanFactory）

### 核心接口
- **BeanFactory** - IoC 容器顶层接口
- **HierarchicalBeanFactory** - 支持父子容器的 BeanFactory
- **ListableBeanFactory** - 可列举 Bean 的 BeanFactory
- **AutowireCapableBeanFactory** - 支持自动装配的 BeanFactory
- **ConfigurableBeanFactory** - 可配置的 BeanFactory
- **ConfigurableListableBeanFactory** - 可配置且可列举的 BeanFactory（综合接口）

### 核心实现
- **DefaultListableBeanFactory** - 默认 BeanFactory 实现（最核心）
- **AbstractBeanFactory** - BeanFactory 抽象基类
- **AbstractAutowireCapableBeanFactory** - 支持自动装配的抽象基类

### 设计目的
BeanFactory 是 Spring IoC 容器的核心，负责 Bean 的创建、配置、管理。采用分层接口设计，职责清晰，支持按需扩展。

### 使用限制与风险
- BeanFactory 是懒加载的，getBean 时才创建 Bean
- 不支持注解自动扫描，需配合 ApplicationContext 使用
- 线程安全但不保证并发性能

---

## 2. Bean 定义（BeanDefinition）

### 核心接口
- **BeanDefinition** - Bean 定义元数据接口
- **AnnotatedBeanDefinition** - 带注解元数据的 Bean 定义
- **AttributeAccessor** - 属性访问器（BeanDefinition 父接口）
- **BeanMetadataElement** - Bean 元数据元素（BeanDefinition 父接口）

### 核心实现
- **RootBeanDefinition** - 根 Bean 定义（运行时合并后的定义）
- **ChildBeanDefinition** - 子 Bean 定义（支持继承）
- **GenericBeanDefinition** - 通用 Bean 定义（配置阶段使用）
- **ScannedGenericBeanDefinition** - 扫描得到的 Bean 定义
- **AnnotatedGenericBeanDefinition** - 注解配置的 Bean 定义
- **ConfigurationClassBeanDefinition** - 配置类中的 Bean 定义

### Bean 定义构建器
- **BeanDefinitionBuilder** - Bean 定义构建器

### 设计目的
BeanDefinition 封装了 Bean 的所有元数据（类名、作用域、构造参数、属性值、依赖关系等），是容器创建 Bean 的蓝图。

### 使用限制与风险
- RootBeanDefinition 是运行时类，不应手动创建
- GenericBeanDefinition 用于配置阶段，最终会合并为 RootBeanDefinition
- Bean 定义是可变的，注册后仍可修改（需谨慎）

---

## 3. Bean 定义注册表与索引（BeanDefinitionRegistry）

### 核心接口
- **BeanDefinitionRegistry** - Bean 定义注册表接口
- **SingletonBeanRegistry** - 单例 Bean 注册表接口
- **AliasRegistry** - 别名注册表接口

### 核心实现
- **SimpleBeanDefinitionRegistry** - 简单 Bean 定义注册表
- **DefaultSingletonBeanRegistry** - 默认单例 Bean 注册表
- **SimpleAliasRegistry** - 简单别名注册表

### 设计目的
提供 Bean 定义的注册、查询、移除功能，支持别名管理和单例缓存。

### 使用限制与风险
- 注册表线程安全，但大量并发注册可能影响性能
- Bean 定义一旦被使用（创建实例），不建议再修改或移除

---

## 4. Bean 定义合并机制（MergedBeanDefinition）

### 核心类
- **RootBeanDefinition** - 合并后的 Bean 定义
- **MergedBeanDefinitionPostProcessor** - 合并后 Bean 定义的后处理器

### 设计目的
支持 Bean 定义继承（parent 属性），子定义继承父定义的属性，运行时合并为 RootBeanDefinition。

### 使用限制与风险
- 继承关系仅在配置阶段有效，运行时只有合并后的定义
- 抽象 Bean（abstract=true）不会被实例化

---

## 5. Bean 作用域（Scope）

### 核心接口
- **Scope** - 作用域接口
- **ConfigurableBeanFactory** - 支持作用域注册

### 内置作用域
- **singleton** - 单例作用域（默认）
- **prototype** - 原型作用域（每次 getBean 创建新实例）
- **request** - 请求作用域（Web 环境）
- **session** - 会话作用域（Web 环境）
- **application** - 应用作用域（Web 环境）
- **websocket** - WebSocket 作用域

### 作用域实现
- **SimpleThreadScope** - 线程作用域（需手动注册）
- **AbstractRequestAttributesScope** - 请求属性作用域基类
- **RequestScope** - 请求作用域实现
- **SessionScope** - 会话作用域实现

### 设计目的
提供灵活的 Bean 生命周期管理，支持自定义作用域。

### 使用限制与风险
- singleton Bean 注入 prototype Bean 会导致原型失效（需使用 @Lookup 或代理）
- 自定义作用域需实现 Scope 接口并注册
- Web 作用域需配置 RequestContextListener 或 RequestContextFilter

---

## 6. Bean 生命周期管理

### 初始化回调
- **InitializingBean** - 初始化接口（`afterPropertiesSet()`）
- **@PostConstruct** - JSR-250 注解（需 CommonAnnotationBeanPostProcessor）
- **init-method** - XML 配置或 `@Bean(initMethod)`

### 销毁回调
- **DisposableBean** - 销毁接口（`destroy()`）
- **@PreDestroy** - JSR-250 注解
- **destroy-method** - XML 配置或 `@Bean(destroyMethod)`

### 生命周期处理器
- **DestructionAwareBeanPostProcessor** - 销毁感知的后处理器
- **InitDestroyAnnotationBeanPostProcessor** - 处理 @PostConstruct/@PreDestroy

### 执行顺序
1. @PostConstruct
2. InitializingBean.afterPropertiesSet()
3. init-method

销毁顺序相反。

### 设计目的
提供多种生命周期回调方式，兼容不同编程风格和框架规范。

### 使用限制与风险
- 推荐使用 @PostConstruct/@PreDestroy，避免代码与 Spring 耦合
- init-method 必须是无参方法
- prototype Bean 的销毁回调不会被容器调用

---

## 7. Bean 装配（依赖注入）

### 注入方式
- **构造器注入** - 通过构造器参数注入
- **Setter 注入** - 通过 setter 方法注入
- **字段注入** - 通过 @Autowired 直接注入字段

### 注入注解
- **@Autowired** - 按类型自动装配
- **@Qualifier** - 按名称限定
- **@Value** - 注入字面量或属性值
- **@Resource** - JSR-250 注解（按名称注入）
- **@Inject** - JSR-330 注解（按类型注入）

### 自动装配模式
- **no** - 不自动装配（默认）
- **byName** - 按属性名匹配 Bean
- **byType** - 按属性类型匹配 Bean
- **constructor** - 按构造器参数类型匹配

### 设计目的
提供灵活的依赖注入方式，解耦对象创建和依赖管理。

### 使用限制与风险
- 构造器注入是最安全的（不可变、强制依赖）
- 字段注入不利于测试（无法通过构造器注入 mock）
- 循环依赖仅在 setter 注入 + 单例模式下可解决

---

## 8. Bean 后处理器扩展点（BeanPostProcessor）

### 核心接口
- **BeanPostProcessor** - Bean 后处理器（拦截 Bean 初始化）
- **InstantiationAwareBeanPostProcessor** - 实例化感知的后处理器
- **DestructionAwareBeanPostProcessor** - 销毁感知的后处理器
- **MergedBeanDefinitionPostProcessor** - 合并 Bean 定义后处理器
- **SmartInstantiationAwareBeanPostProcessor** - 智能实例化感知后处理器

### 核心方法
- **postProcessBeforeInitialization** - 初始化前处理
- **postProcessAfterInitialization** - 初始化后处理（AOP 代理在此创建）
- **postProcessBeforeInstantiation** - 实例化前处理
- **postProcessAfterInstantiation** - 实例化后处理
- **postProcessProperties** - 属性处理

### 常用实现
- **AutowiredAnnotationBeanPostProcessor** - 处理 @Autowired/@Value
- **CommonAnnotationBeanPostProcessor** - 处理 @Resource/@PostConstruct/@PreDestroy
- **RequiredAnnotationBeanPostProcessor** - 处理 @Required（已废弃）
- **ApplicationContextAwareProcessor** - 处理 Aware 接口回调

### 设计目的
提供强大的扩展点，拦截 Bean 创建的各个阶段，实现 AOP、依赖注入、属性校验等功能。

### 使用限制与风险
- BeanPostProcessor 会应用到所有 Bean（包括自身），注意循环依赖
- postProcessBeforeInstantiation 返回非 null 会短路正常创建流程
- 执行顺序通过 Ordered 或 @Order 控制

---

## 9. Bean 工厂后处理器扩展点（BeanFactoryPostProcessor）

### 核心接口
- **BeanFactoryPostProcessor** - Bean 工厂后处理器（修改 BeanDefinition）
- **BeanDefinitionRegistryPostProcessor** - 支持注册新 BeanDefinition

### 常用实现
- **PropertySourcesPlaceholderConfigurer** - 处理属性占位符（`${...}`）
- **PropertyPlaceholderConfigurer** - 旧版占位符处理器
- **CustomEditorConfigurer** - 注册自定义属性编辑器
- **CustomScopeConfigurer** - 注册自定义作用域
- **ConfigurationClassPostProcessor** - 处理 @Configuration 类（重要）

### 设计目的
在 Bean 实例化前修改 BeanDefinition，实现配置动态化、扫描注册等高级功能。

### 使用限制与风险
- BeanFactoryPostProcessor 执行时机早于 BeanPostProcessor
- 不应在此阶段实例化 Bean（会导致过早初始化）
- ConfigurationClassPostProcessor 是核心，处理 @ComponentScan/@Import 等

---

## 10. 循环依赖处理

### 三级缓存详解
- **singletonObjects** - 一级缓存（完整的单例对象）
- **earlySingletonObjects** - 二级缓存（提前暴露的半成品对象）
- **singletonFactories** - 三级缓存（创建提前暴露对象的工厂）

### 解决机制
1. A 创建 -> 实例化 -> 放入三级缓存（ObjectFactory）
2. A 填充属性，发现依赖 B
3. B 创建 -> 实例化 -> 放入三级缓存
4. B 填充属性，发现依赖 A
5. 从三级缓存获取 A 的 ObjectFactory -> 创建 A 的代理（如需要）-> 放入二级缓存
6. B 完成初始化 -> 放入一级缓存
7. A 继续初始化 -> 放入一级缓存

### 设计目的
解决单例 Bean 的循环依赖问题，通过提前暴露半成品对象打破循环。

### 使用限制与风险
- 仅支持单例 + setter 注入的循环依赖
- 构造器注入的循环依赖无法解决（抛出 BeanCurrentlyInCreationException）
- prototype 循环依赖无法解决
- 三级缓存是为了处理 AOP 代理，如无代理需求二级缓存即可

---

## 11. FactoryBean 机制

### 核心接口
- **FactoryBean<T>** - 工厂 Bean 接口
  - `getObject()` - 返回工厂创建的对象
  - `getObjectType()` - 返回对象类型
  - `isSingleton()` - 是否单例

### 核心实现
- **AbstractFactoryBean** - 抽象工厂 Bean 基类

### 设计目的
提供复杂对象的创建逻辑封装，隐藏实例化细节。getBean("beanName") 返回 FactoryBean 创建的对象，getBean("&beanName") 返回 FactoryBean 本身。

### 使用限制与风险
- FactoryBean 本身也是 Bean，会经历完整生命周期
- getObject() 可能每次返回不同实例（取决于 isSingleton()）
- 容易与普通 Bean 混淆，需理解 & 前缀的含义

---

## 12. SmartInitializingSingleton 扩展点

### 核心接口
- **SmartInitializingSingleton** - 智能初始化单例接口
  - `afterSingletonsInstantiated()` - 所有单例 Bean 初始化后回调

### 设计目的
在所有单例 Bean 初始化完成后执行逻辑，适合需要依赖全局 Bean 状态的场景（如 @EventListener 注册）。

### 使用限制与风险
- 仅对单例 Bean 有效
- 执行时机晚于所有 BeanPostProcessor

---

## 13. 感知接口（Aware 接口族）

### 核心接口
- **BeanNameAware** - 注入 Bean 名称
- **BeanClassLoaderAware** - 注入 ClassLoader
- **BeanFactoryAware** - 注入 BeanFactory
- **EnvironmentAware** - 注入 Environment
- **ResourceLoaderAware** - 注入 ResourceLoader
- **ApplicationEventPublisherAware** - 注入事件发布器
- **MessageSourceAware** - 注入国际化消息源
- **ApplicationContextAware** - 注入 ApplicationContext（最常用）

### 处理器
- **ApplicationContextAwareProcessor** - 处理各种 Aware 接口

### 设计目的
允许 Bean 感知容器状态，获取容器资源。是一种依赖查找（而非依赖注入）。

### 使用限制与风险
- Aware 接口增加了与 Spring 的耦合，优先使用依赖注入
- 执行顺序：BeanNameAware -> BeanClassLoaderAware -> BeanFactoryAware -> 其他 Aware

---

## 14. 属性编辑器（PropertyEditor）

### 核心接口
- **PropertyEditor** - JDK 原生属性编辑器接口
- **PropertyEditorRegistry** - 属性编辑器注册表
- **PropertyEditorRegistrar** - 属性编辑器注册器

### 核心实现
- **CustomEditorConfigurer** - 自定义编辑器配置器
- **PropertyEditorRegistrySupport** - 属性编辑器注册表支持类

### 常用编辑器
- **CustomBooleanEditor** - Boolean 编辑器
- **CustomNumberEditor** - 数字编辑器
- **CustomDateEditor** - 日期编辑器
- **StringArrayPropertyEditor** - 字符串数组编辑器

### 设计目的
实现字符串到复杂类型的转换，主要用于 XML 配置和属性绑定。

### 使用限制与风险
- PropertyEditor 是 JDK 规范，设计较老
- 非线程安全，容器内部每次使用都会创建新实例
- 推荐使用 ConversionService 替代

---

## 15. Bean 命名策略（BeanNameGenerator）

### 核心接口
- **BeanNameGenerator** - Bean 名称生成器

### 核心实现
- **DefaultBeanNameGenerator** - 默认 Bean 名称生成器
- **AnnotationBeanNameGenerator** - 注解 Bean 名称生成器（基于类名首字母小写）
- **FullyQualifiedAnnotationBeanNameGenerator** - 全限定名生成器

### 设计目的
为扫描到的 Bean 自动生成名称，避免手动指定。

### 使用限制与风险
- 默认使用类名首字母小写作为 Bean 名称
- 同名 Bean 会覆盖，需通过 @Qualifier 或手动命名解决冲突

---

## 16. 类型预测与提前暴露

### 核心接口
- **SmartInstantiationAwareBeanPostProcessor** - 智能实例化感知后处理器
  - `predictBeanType()` - 预测 Bean 类型
  - `determineCandidateConstructors()` - 确定候选构造器
  - `getEarlyBeanReference()` - 获取提前暴露的 Bean 引用（用于解决循环依赖）

### 设计目的
在 Bean 实例化前预测类型，用于依赖查找和 AOP 代理创建。

### 使用限制与风险
- 类型预测可能不准确（FactoryBean、CGLIB 代理等）
- getEarlyBeanReference 是解决循环依赖的关键

---

## 17. 自动装配模式（byName、byType、constructor）

### 装配模式
- **AUTOWIRE_NO** - 不自动装配
- **AUTOWIRE_BY_NAME** - 按属性名自动装配
- **AUTOWIRE_BY_TYPE** - 按属性类型自动装配
- **AUTOWIRE_CONSTRUCTOR** - 按构造器参数类型自动装配
- **AUTOWIRE_AUTODETECT** - 自动检测（已废弃）

### 设计目的
在 XML 配置时代实现自动装配，减少手动配置。现已被注解（@Autowired）替代。

### 使用限制与风险
- byType 遇到多个候选 Bean 会抛异常
- byName 要求属性名与 Bean 名称一致
- 推荐使用注解方式，更清晰明确

---

## 18. 父子容器支持

### 核心接口
- **HierarchicalBeanFactory** - 支持父子容器的接口

### 设计目的
支持容器层级结构，子容器可访问父容器的 Bean，但父容器无法访问子容器。典型应用：Spring MVC（子容器）+ Spring（父容器）。

### 使用限制与风险
- 子容器的 Bean 可覆盖父容器同名 Bean
- @Autowired 优先从当前容器查找，找不到再查父容器
- 父子容器配置不当可能导致依赖注入失败

---

## 19. 动态 Bean 注册与移除

### 核心方法
- **registerBeanDefinition()** - 注册 Bean 定义
- **removeBeanDefinition()** - 移除 Bean 定义
- **registerSingleton()** - 注册单例 Bean

### 设计目的
支持运行时动态注册和移除 Bean，适合插件化、多租户等场景。

### 使用限制与风险
- 动态注册后的 Bean 不会被 BeanFactoryPostProcessor 处理
- 移除 Bean 不会销毁已创建的实例（需手动调用 destroySingleton）
- 线程安全但性能开销较大

---

## 📚 总结

spring-beans 是 Spring IoC 容器的核心实现，提供了：
- **BeanFactory 体系**：分层接口设计，职责清晰
- **BeanDefinition 体系**：Bean 元数据的抽象与合并
- **生命周期管理**：初始化、销毁、作用域等
- **扩展点体系**：BeanPostProcessor、BeanFactoryPostProcessor
- **循环依赖解决**：三级缓存机制
- **FactoryBean 机制**：复杂对象创建的封装
- **自动装配**：byName、byType、注解等多种方式

这些机制为 Spring 的依赖注入、AOP、事务等高级功能奠定了基础。

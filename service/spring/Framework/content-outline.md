# Spring Framework 核心原理系统化学习大纲

> **学习目标**：系统性学习 + 工作实战 + 面试准备  
> **适合对象**：有 Java 和 Spring 基础，希望深入掌握 Spring 核心原理和源码实现  
> **预计时长**：完整学习约 4-8 周  
> **学习方式**：原理讲解 + 类图架构 + 源码分析 + 实战场景 + 面试准备

---

## 📚 学习路线图

```
设计哲学 → IoC容器 → Bean生命周期 → AOP原理 → 事务管理 
   ↓
Spring MVC → 资源管理 → 事件驱动 → 注解开发 → 高级特性
   ↓
工作实战 → 面试准备
```

---

## 第一部分：设计哲学与架构基础

### [1. Spring Framework 设计哲学](./content/content-1.md)
- Spring 的核心理念：简化企业级应用开发
- 控制反转（IoC）与依赖注入（DI）的设计思想
- 面向切面编程（AOP）的设计动机
- Spring 的核心价值：解耦、可测试、可维护
- Spring 模块架构全景图

**学习重点**：理解 Spring 为什么要这样设计，解决了什么问题  
**预计时长**：2 小时

---

### [2. Spring 核心设计模式详解](./content/content-2.md)
- 工厂模式：BeanFactory 体系
- 单例模式：Bean 单例管理与注册表
- 代理模式：AOP 动态代理实现
- 模板方法模式：JdbcTemplate、TransactionTemplate
- 策略模式：资源加载、实例化策略
- 观察者模式：事件发布订阅机制

**学习重点**：掌握 Spring 中设计模式的应用场景和实现原理  
**预计时长**：3 小时

---

## 第二部分：IoC 容器核心原理

### [3. IoC 容器架构设计](./content/content-3.md)
- BeanFactory 核心接口与职责
- ApplicationContext 扩展功能
- 容器层级结构与父子容器
- BeanDefinition 定义与注册机制
- 类图：BeanFactory 继承体系

**学习重点**：理解 IoC 容器的整体架构和核心接口  
**预计时长**：3 小时

---

### [4. 容器启动流程详解](./content/content-4.md)
- ApplicationContext 启动完整流程
- 资源加载与解析（XML/注解/Java Config）
- BeanDefinition 扫描与注册
- BeanFactoryPostProcessor 执行时机
- Bean 实例化前的准备工作
- 时序图：容器启动完整流程

**学习重点**：掌握容器从启动到就绪的完整过程  
**预计时长**：4 小时  
**源码入口**：`AbstractApplicationContext.refresh()`

---

### [5. 依赖注入实现机制](./content/content-5.md)
- 构造器注入 vs Setter 注入 vs 字段注入
- @Autowired 注解处理原理
- AutowiredAnnotationBeanPostProcessor 源码分析
- 类型匹配与依赖查找算法
- 依赖注入的递归处理

**学习重点**：深入理解依赖注入的底层实现  
**预计时长**：3 小时  
**源码入口**：`AutowiredAnnotationBeanPostProcessor.postProcessProperties()`

---

## 第三部分：Bean 生命周期管理

### [6. Bean 完整生命周期](./content/content-6.md)
- Bean 生命周期完整流程图
- 实例化：InstantiationAwareBeanPostProcessor
- 属性填充：populateBean 方法详解
- 初始化：Aware 接口回调、InitializingBean、@PostConstruct
- 使用阶段
- 销毁：DisposableBean、@PreDestroy
- 核心方法：doCreateBean 源码追踪

**学习重点**：掌握 Bean 从创建到销毁的完整生命周期  
**预计时长**：4 小时  
**源码入口**：`AbstractAutowireCapableBeanFactory.doCreateBean()`

---

### [7. Bean 生命周期扩展点](./content/content-7.md)
- BeanPostProcessor 扩展点体系
- BeanFactoryPostProcessor 容器级扩展
- Aware 接口族：BeanNameAware、ApplicationContextAware 等
- InitializingBean 与 DisposableBean
- @PostConstruct 与 @PreDestroy 注解
- 自定义扩展点的实战应用

**学习重点**：掌握如何通过扩展点定制 Spring 容器行为  
**预计时长**：3 小时

---

### [8. 循环依赖解决机制](./content/content-8.md)
- 什么是循环依赖
- 三级缓存原理详解
- singletonObjects、earlySingletonObjects、singletonFactories
- 构造器循环依赖为何无法解决
- prototype 作用域循环依赖问题
- 源码追踪：getSingleton 方法

**学习重点**：深入理解三级缓存如何解决循环依赖  
**预计时长**：3 小时  
**源码入口**：`DefaultSingletonBeanRegistry.getSingleton()`

---

## 第四部分：AOP 原理与实现

### [9. AOP 核心概念与架构](./content/content-9.md)
- AOP 术语：切面、切点、通知、连接点、织入
- AOP 联盟接口规范
- Spring AOP 架构设计
- 类图：Advisor、Advice、Pointcut 体系

**学习重点**：理解 AOP 核心概念和整体架构  
**预计时长**：2 小时

---

### [10. 动态代理实现原理](./content/content-10.md)
- JDK 动态代理实现机制
- CGLIB 动态代理实现机制
- 两种代理方式的选择策略
- ProxyFactory 代理工厂
- 代理对象创建时机与流程

**学习重点**：掌握两种代理方式的实现原理和选择依据  
**预计时长**：3 小时

---

### [11. AOP 源码架构深入](./content/content-11.md)
- TargetSource 目标对象封装
- Advisor 与 Advice 的关系
- Pointcut 切点表达式解析
- MethodInterceptor 拦截器链
- 时序图：AOP 方法调用完整流程

**学习重点**：深入理解 AOP 源码架构和执行流程  
**预计时长**：4 小时  
**源码入口**：`JdkDynamicAopProxy.invoke()` / `CglibAopProxy.intercept()`

---

### [12. AOP 实战与最佳实践](./content/content-12.md)
- 自定义注解 + AOP 实现权限控制
- AOP 实现操作日志记录
- AOP 性能监控与优化
- AOP 不生效的常见场景与解决方案

**学习重点**：掌握 AOP 在实际工作中的应用  
**预计时长**：3 小时

---

## 第五部分：事务管理机制

### [13. Spring 事务管理架构](./content/content-13.md)
- PlatformTransactionManager 接口设计
- TransactionDefinition 事务定义
- TransactionStatus 事务状态
- 编程式事务 vs 声明式事务
- 类图：事务管理器继承体系

**学习重点**：理解 Spring 事务管理的整体架构  
**预计时长**：2 小时

---

### [14. 事务传播行为原理](./content/content-14.md)
- 7 种传播行为详解与应用场景
- REQUIRED、REQUIRES_NEW、NESTED 源码实现
- 传播行为的嵌套调用分析
- 传播行为选择最佳实践

**学习重点**：深入理解事务传播行为的实现原理  
**预计时长**：3 小时

---

### [15. 声明式事务实现原理](./content/content-15.md)
- @Transactional 注解处理流程
- TransactionInterceptor 拦截器
- 事务代理对象创建
- 事务开启、提交、回滚流程
- 时序图：声明式事务完整执行流程

**学习重点**：掌握 @Transactional 的底层实现  
**预计时长**：4 小时  
**源码入口**：`TransactionInterceptor.invoke()`

---

### [16. 事务失效场景与解决方案](./content/content-16.md)
- @Transactional 失效的 8 种场景
- 同类方法调用事务失效
- 异常类型不匹配
- 方法访问权限问题
- 数据源未开启事务支持
- 实战排查与解决方案

**学习重点**：掌握事务失效的常见场景和解决方法  
**预计时长**：3 小时

---

## 第六部分：Spring MVC 架构

### [17. Spring MVC 核心组件](./content/content-17.md)
- DispatcherServlet 前端控制器
- HandlerMapping 处理器映射
- HandlerAdapter 处理器适配器
- ViewResolver 视图解析器
- 类图：Spring MVC 核心组件关系

**学习重点**：理解 Spring MVC 的核心组件和职责  
**预计时长**：2 小时

---

### [18. 请求处理完整流程](./content/content-18.md)
- 请求接收与分发
- HandlerMapping 查找过程
- HandlerAdapter 执行处理器
- ModelAndView 返回
- 视图渲染流程
- 时序图：HTTP 请求完整处理流程

**学习重点**：掌握 HTTP 请求的完整处理流程  
**预计时长**：4 小时  
**源码入口**：`DispatcherServlet.doDispatch()`

---

### [19. 参数绑定与类型转换](./content/content-19.md)
- HandlerMethodArgumentResolver 参数解析器
- @RequestParam、@PathVariable、@RequestBody 处理
- DataBinder 数据绑定机制
- ConversionService 类型转换
- Validator 数据校验

**学习重点**：理解参数绑定和类型转换的实现原理  
**预计时长**：3 小时

---

### [20. 拦截器与过滤器](./content/content-20.md)
- HandlerInterceptor 拦截器链
- Filter vs Interceptor 区别与选择
- 拦截器执行顺序
- 实战：统一日志、权限控制、性能监控

**学习重点**：掌握拦截器在实际项目中的应用  
**预计时长**：2 小时

---

## 第七部分：资源与环境管理

### [21. 资源抽象与加载](./content/content-21.md)
- Resource 资源抽象接口
- ResourceLoader 资源加载器
- 多种资源类型：ClassPathResource、FileSystemResource、UrlResource
- 资源通配符解析

**学习重点**：理解 Spring 的资源抽象设计  
**预计时长**：2 小时

---

### [22. Environment 环境抽象](./content/content-22.md)
- Environment 接口设计
- PropertySource 属性源
- Profile 环境切换机制
- 配置文件加载优先级
- @PropertySource 注解原理

**学习重点**：掌握 Spring 的环境和配置管理  
**预计时长**：2 小时

---

## 第八部分：事件驱动机制

### [23. Spring 事件机制](./content/content-23.md)
- ApplicationEvent 事件抽象
- ApplicationListener 监听器
- ApplicationEventPublisher 事件发布
- 事件多播器：ApplicationEventMulticaster
- 同步事件 vs 异步事件

**学习重点**：理解 Spring 的事件驱动机制  
**预计时长**：2 小时

---

### [24. 自定义事件实战](./content/content-24.md)
- 自定义业务事件
- 注解式监听器：@EventListener
- 事件监听器顺序控制
- 事务事件：@TransactionalEventListener
- 实战场景：订单创建事件通知

**学习重点**：掌握自定义事件在业务中的应用  
**预计时长**：2 小时

---

## 第九部分：注解驱动开发

### [25. 核心注解处理原理](./content/content-25.md)
- @Component 组件扫描机制
- @Autowired 自动装配原理
- @Configuration 配置类处理
- @Bean 方法解析与调用
- AnnotationConfigApplicationContext 启动流程

**学习重点**：理解注解驱动开发的底层实现  
**预计时长**：3 小时

---

### [26. 条件装配机制](./content/content-26.md)
- @Conditional 条件注解
- Condition 接口实现
- @Profile 环境隔离
- @ConditionalOnClass、@ConditionalOnBean 等
- Spring Boot 自动配置原理

**学习重点**：掌握条件装配在自动配置中的应用  
**预计时长**：3 小时

---

### [27. ImportSelector 与 ImportBeanDefinitionRegistrar](./content/content-27.md)
- @Import 注解三种用法
- ImportSelector 动态选择配置
- DeferredImportSelector 延迟导入
- ImportBeanDefinitionRegistrar 手动注册 Bean
- 实战：自定义 starter 开发

**学习重点**：掌握高级配置导入机制  
**预计时长**：3 小时

---

## 第十部分：高级特性

### [28. Bean 作用域深入](./content/content-28.md)
- singleton、prototype、request、session、application
- 自定义作用域实现
- 作用域代理：ScopedProxyMode
- 作用域相关问题排查

**学习重点**：理解不同作用域的实现和使用场景  
**预计时长**：2 小时

---

### [29. FactoryBean 机制](./content/content-29.md)
- FactoryBean 接口设计
- FactoryBean vs BeanFactory
- getObject 方法调用时机
- 实战应用：集成第三方组件

**学习重点**：掌握 FactoryBean 的使用场景  
**预计时长**：2 小时

---

### [30. SpEL 表达式语言](./content/content-30.md)
- SpEL 语法与特性
- 表达式解析与求值
- 在注解中使用 SpEL
- 实战场景：动态配置

**学习重点**：掌握 SpEL 在配置中的应用  
**预计时长**：2 小时

---

## 第十一部分：工作实战场景

### [31. 性能优化实战](./content/content-31.md)
- Bean 创建性能优化
- 懒加载与条件装配
- 循环依赖优化
- AOP 代理性能优化
- 容器启动速度优化

**学习重点**：掌握 Spring 应用的性能优化方法  
**预计时长**：3 小时

---

### [32. 故障排查与调试](./content/content-32.md)
- Bean 创建失败排查
- 循环依赖问题定位
- 事务不生效原因分析
- AOP 不生效诊断
- 源码断点调试技巧

**学习重点**：掌握常见问题的排查方法  
**预计时长**：3 小时

---

### [33. 企业级应用架构](./content/content-33.md)
- 多数据源配置与动态切换
- 分布式事务解决方案
- 异步处理与线程池管理
- 缓存集成：Spring Cache
- 定时任务：@Scheduled

**学习重点**：掌握企业级应用的常见架构方案  
**预计时长**：4 小时

---

### [34. Spring Boot 集成深入](./content/content-34.md)
- 自动配置原理
- starter 机制详解
- 条件装配实战
- 配置文件加载与优先级
- 自定义 starter 开发

**学习重点**：深入理解 Spring Boot 的核心机制  
**预计时长**：3 小时

---

### [35. 微服务场景应用](./content/content-35.md)
- 服务注册与发现
- 配置中心集成
- 熔断降级
- 分布式追踪
- Spring Cloud 核心组件

**学习重点**：掌握 Spring 在微服务中的应用  
**预计时长**：3 小时

---

## 第十二部分：面试准备

### [36. 初级面试题精讲（30 题）](./content/content-36.md)
- Spring 基础概念
- IoC 与 DI 理解
- Bean 作用域
- 常用注解使用

**适合岗位**：0-2 年经验  
**预计时长**：4 小时

---

### [37. 中级面试题精讲（50 题）](./content/content-37.md)
- IoC 容器原理
- Bean 生命周期
- AOP 原理
- 事务传播行为
- 循环依赖解决

**适合岗位**：2-5 年经验  
**预计时长**：6 小时

---

### [38. 高级面试题精讲（40 题）](./content/content-38.md)
- 源码架构设计
- 性能优化
- 故障定位
- 扩展点应用

**适合岗位**：5+ 年经验  
**预计时长**：5 小时

---

### [39. 架构面试题精讲（30 题）](./content/content-39.md)
- Spring 设计思想
- 分布式架构
- 技术选型
- 最佳实践

**适合岗位**：架构师/技术专家  
**预计时长**：4 小时

---

### [40. 综合实战面试题](./content/content-40.md)
- 场景设计题
- 方案对比题
- 问题排查题
- 架构优化题

**学习重点**：综合能力训练  
**预计时长**：3 小时

---

## 📖 附录资源

### 学习路线建议

**初学者路线（1-2 周）**
- 第一部分：设计哲学（章节 1-2）
- 第二部分：IoC 容器（章节 3-5）
- 第三部分：Bean 生命周期（章节 6-8）
- 第十二部分：初级面试题（章节 36）

**进阶者路线（2-4 周）**
- 第四部分：AOP 原理（章节 9-12）
- 第五部分：事务管理（章节 13-16）
- 第六部分：Spring MVC（章节 17-20）
- 第十二部分：中级面试题（章节 37）

**高级开发者路线（4-8 周）**
- 第七至十部分：全面深入（章节 21-30）
- 第十一部分：工作实战（章节 31-35）
- 第十二部分：高级+架构面试题（章节 38-40）

---

### 知识依赖关系

```
设计哲学 (1-2)
    ↓
IoC 容器架构 (3)
    ↓
容器启动 (4) + 依赖注入 (5)
    ↓
Bean 生命周期 (6-7) + 循环依赖 (8)
    ↓
AOP 原理 (9-12) + 事务管理 (13-16)
    ↓
Spring MVC (17-20)
    ↓
资源管理 (21-22) + 事件驱动 (23-24) + 注解开发 (25-27)
    ↓
高级特性 (28-30)
    ↓
工作实战 (31-35) + 面试准备 (36-40)
```

---

### 学习自检清单

**基础掌握**
- [ ] 能够清晰解释 IoC 和 DI 的概念和设计思想
- [ ] 能够画出 BeanFactory 继承体系图
- [ ] 能够描述 Bean 完整生命周期的各个阶段
- [ ] 能够说明 AOP 的核心概念和应用场景

**原理理解**
- [ ] 能够解释容器启动的完整流程
- [ ] 能够说明三级缓存如何解决循环依赖
- [ ] 能够解释 JDK 代理和 CGLIB 代理的实现原理
- [ ] 能够说明事务传播行为的实现机制

**源码阅读**
- [ ] 能够定位到 refresh() 方法并理解各步骤
- [ ] 能够定位到 doCreateBean() 方法并理解 Bean 创建流程
- [ ] 能够定位到代理对象创建的关键代码
- [ ] 能够定位到事务拦截器的执行逻辑

**实战应用**
- [ ] 能够使用扩展点定制容器行为
- [ ] 能够排查常见的 Bean 创建、事务、AOP 问题
- [ ] 能够设计多数据源、分布式事务等企业级方案
- [ ] 能够进行 Spring 应用的性能优化

**面试准备**
- [ ] 能够流畅回答初级面试题（30 题）
- [ ] 能够深入回答中级面试题（50 题）
- [ ] 能够应对高级面试题并说明源码实现（40 题）
- [ ] 能够解决架构设计类综合面试题（30 题）

---

### 实战项目建议

1. **手写简易版 IoC 容器**
   - 实现 Bean 定义、注册、依赖注入
   - 理解容器核心机制

2. **手写简易版 AOP 框架**
   - 实现 JDK 代理和 CGLIB 代理
   - 理解 AOP 底层原理

3. **Spring 扩展点实战项目**
   - 实现自定义 BeanPostProcessor
   - 实现自定义事件监听
   - 实现自定义条件装配

4. **Spring Boot Starter 开发**
   - 开发自定义 starter
   - 实现自动配置
   - 理解 Spring Boot 机制

5. **企业级实战项目**
   - 多数据源动态切换
   - 分布式事务管理
   - 统一异常处理和日志记录

---

### 源码阅读指南

**必读源码类（Top 20）**

1. `AbstractApplicationContext` - 容器核心
2. `DefaultListableBeanFactory` - Bean 工厂
3. `AbstractAutowireCapableBeanFactory` - Bean 创建
4. `DefaultSingletonBeanRegistry` - 单例管理
5. `AutowiredAnnotationBeanPostProcessor` - 自动装配
6. `AbstractAutoProxyCreator` - AOP 代理
7. `JdkDynamicAopProxy` - JDK 代理
8. `CglibAopProxy` - CGLIB 代理
9. `TransactionInterceptor` - 事务拦截
10. `DataSourceTransactionManager` - 事务管理
11. `DispatcherServlet` - MVC 核心
12. `RequestMappingHandlerMapping` - 映射处理
13. `RequestMappingHandlerAdapter` - 适配器
14. `ApplicationEventMulticaster` - 事件多播
15. `ConfigurationClassPostProcessor` - 配置处理
16. `ClassPathBeanDefinitionScanner` - 组件扫描
17. `ConditionEvaluator` - 条件评估
18. `PropertySourcesPropertyResolver` - 属性解析
19. `ResourcePatternResolver` - 资源加载
20. `BeanDefinitionBuilder` - Bean 定义构建

---

### 推荐学习资源

**官方文档**
- [Spring Framework Reference Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/)
- [Spring Framework API Documentation](https://docs.spring.io/spring-framework/docs/current/javadoc-api/)

**源码仓库**
- [Spring Framework GitHub](https://github.com/spring-projects/spring-framework)

**推荐书籍**
- 《Spring 源码深度解析》- 郝佳
- 《Spring 揭秘》- 王福强
- 《精通 Spring 4.x 企业应用开发实战》- 陈雄华

---

## 🎯 学习建议

1. **循序渐进**：按照大纲顺序学习，不要跳跃
2. **理论结合实践**：每学完一章，动手验证和调试
3. **源码为王**：一定要结合源码理解原理
4. **画图总结**：用类图、时序图总结知识点
5. **定期复习**：使用自检清单检验掌握程度
6. **面试导向**：每章的面试题要反复练习

---

**开始学习** → [第 1 章：Spring Framework 设计哲学](./content/content-1.md)

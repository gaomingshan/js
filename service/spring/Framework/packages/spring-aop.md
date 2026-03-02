# Spring AOP 源码指引

> spring-aop 提供面向切面编程（AOP）支持，实现横切关注点的模块化。

---

## 1. AOP 核心概念

### 核心术语
- **Aspect（切面）** - 横切关注点的模块化 
- **Join Point（连接点）** - 程序执行的某个点（如方法调用）
- **Pointcut（切点）** - 匹配连接点的表达式
- **Advice（通知）** - 在切点执行的动作
- **Weaving（织入）** - 将切面应用到目标对象的过程
- **Introduction（引介）** - 为类添加新方法或属性
- **Target Object（目标对象）** - 被代理的对象
- **AOP Proxy（AOP 代理）** - 代理对象（JDK 动态代理或 CGLIB 代理）

---

## 2. AOP 代理机制

### 代理策略
- **JDK 动态代理** - 基于接口的代理（目标对象必须实现接口）
- **CGLIB 代理** - 基于继承的代理（可代理无接口类）

### 核心类
- **AopProxy** - AOP 代理接口
- **JdkDynamicAopProxy** - JDK 动态代理实现
- **CglibAopProxy** - CGLIB 代理实现
- **ObjenesisCglibAopProxy** - 基于 Objenesis 的 CGLIB 代理

### 代理工厂
- **ProxyFactory** - 代理工厂（编程式 AOP）
- **ProxyFactoryBean** - 代理工厂 Bean（XML 配置）
- **AspectJProxyFactory** - AspectJ 代理工厂

### 设计目的
根据目标对象特征选择合适的代理策略，实现方法拦截和增强。

### 使用限制与风险
- JDK 动态代理要求目标对象实现接口
- CGLIB 代理无法代理 final 类和 final 方法
- 代理对象内部方法调用不会触发 AOP（需使用 AopContext.currentProxy()）
- 代理创建有性能开销

---

## 3. 切点定义（Pointcut）

### 核心接口
- **Pointcut** - 切点接口
  - `getClassFilter()` - 类过滤器
  - `getMethodMatcher()` - 方法匹配器
- **ClassFilter** - 类过滤器接口
- **MethodMatcher** - 方法匹配器接口

### 核心实现
- **AspectJExpressionPointcut** - AspectJ 表达式切点（最常用）
- **NameMatchMethodPointcut** - 方法名匹配切点
- **JdkRegexpMethodPointcut** - 正则表达式切点
- **AnnotationMatchingPointcut** - 注解匹配切点
- **ComposablePointcut** - 可组合切点
- **ControlFlowPointcut** - 控制流切点
- **StaticMethodMatcherPointcut** - 静态方法匹配切点
- **DynamicMethodMatcherPointcut** - 动态方法匹配切点

### AspectJ 表达式
- **execution** - 方法执行（最常用）
  - `execution(* com.example.service.*.*(..))`
- **within** - 类型匹配
  - `within(com.example.service.*)`
- **this** - 代理对象类型匹配
- **target** - 目标对象类型匹配
- **args** - 参数类型匹配
- **@annotation** - 方法注解匹配
- **@within** - 类注解匹配
- **@target** - 目标对象类注解匹配
- **@args** - 参数注解匹配

### 设计目的
定义切面应用的位置，支持灵活的表达式语法和多种匹配策略。

### 使用限制与风险
- 静态匹配（编译时确定）性能优于动态匹配（运行时确定）
- AspectJ 表达式解析有性能开销，建议缓存 Pointcut
- 表达式过于宽泛会影响性能

---

## 4. 通知类型（Advice）

### 核心接口
- **Advice** - 通知接口（标记接口）
- **MethodInterceptor** - 方法拦截器（环绕通知）
- **BeforeAdvice** - 前置通知标记接口
- **AfterAdvice** - 后置通知标记接口

### 具体通知接口
- **MethodBeforeAdvice** - 方法前置通知
- **AfterReturningAdvice** - 返回后通知
- **ThrowsAdvice** - 异常通知
- **IntroductionInterceptor** - 引介拦截器

### AspectJ 注解
- **@Before** - 前置通知
- **@AfterReturning** - 返回后通知
- **@AfterThrowing** - 异常通知
- **@After** - 后置通知（finally 语义）
- **@Around** - 环绕通知

### 执行顺序
1. @Around（前半部分）
2. @Before
3. 目标方法执行
4. @AfterReturning / @AfterThrowing
5. @After
6. @Around（后半部分）

### 设计目的
在不同阶段插入增强逻辑，满足各种横切需求（日志、事务、安全等）。

### 使用限制与风险
- @Around 功能最强大但需手动调用 `joinPoint.proceed()`
- @After 无论正常返回还是异常都会执行
- 多个切面作用于同一方法时，顺序通过 @Order 控制

---

## 5. 切面声明（@Aspect）

### 核心注解
- **@Aspect** - 声明切面类
- **@Pointcut** - 定义可重用的切点

### 核心类
- **AspectJAutoProxyCreator** - AspectJ 自动代理创建器
- **AnnotationAwareAspectJAutoProxyCreator** - 注解感知的 AspectJ 自动代理创建器（默认）
- **AspectJProxyUtils** - AspectJ 代理工具类

### 启用注解
- **@EnableAspectJAutoProxy** - 启用 AspectJ 自动代理

### 设计目的
通过注解声明切面，简化 AOP 配置，提升开发效率。

### 使用限制与风险
- @Aspect 类本身不会被自动注册为 Bean，需添加 @Component
- @EnableAspectJAutoProxy 的 proxyTargetClass 属性控制是否强制 CGLIB 代理
- exposeProxy 属性控制是否暴露代理对象到 AopContext

---

## 6. 连接点支持（JoinPoint）

### 核心接口
- **JoinPoint** - 连接点信息
  - `getArgs()` - 获取参数
  - `getTarget()` - 获取目标对象
  - `getSignature()` - 获取方法签名
- **ProceedingJoinPoint** - 环绕连接点（支持 proceed()）

### 设计目的
在通知方法中获取目标方法的详细信息（参数、返回值、异常等）。

### 使用限制与风险
- ProceedingJoinPoint 仅用于 @Around 通知
- 修改参数需调用 `proceed(Object[] args)`

---

## 7. AOP 配置方式

### 注解配置
```java
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {
    @Bean
    public LoggingAspect loggingAspect() {
        return new LoggingAspect();
    }
}
```

### XML 配置
```xml
<aop:aspectj-autoproxy/>
<bean id="loggingAspect" class="com.example.LoggingAspect"/>
```

### 编程式配置
```java
ProxyFactory factory = new ProxyFactory(target);
factory.addAdvice(new MethodBeforeAdvice() { ... });
Object proxy = factory.getProxy();
```

### 设计目的
支持多种配置方式，满足不同项目需求和迁移场景。

### 使用限制与风险
- 注解配置是主流，XML 配置逐渐淘汰
- 编程式 AOP 适合动态代理场景

---

## 8. AOP 扩展点（Advisor、Advice）

### 核心接口
- **Advisor** - 通知器（Pointcut + Advice）
- **PointcutAdvisor** - 切点通知器
- **IntroductionAdvisor** - 引介通知器

### 核心实现
- **DefaultPointcutAdvisor** - 默认切点通知器
- **NameMatchMethodPointcutAdvisor** - 方法名匹配通知器
- **RegexpMethodPointcutAdvisor** - 正则表达式通知器
- **AspectJPointcutAdvisor** - AspectJ 切点通知器
- **AspectJExpressionPointcutAdvisor** - AspectJ 表达式通知器

### 设计目的
Advisor 封装了 Pointcut 和 Advice，是 AOP 框架的核心抽象。

### 使用限制与风险
- @Aspect 注解会被转换为多个 Advisor（每个通知一个）
- Advisor 优先级通过 Ordered 接口控制

---

## 9. 织入方式

### 运行时织入（Runtime Weaving）
- Spring AOP 默认方式
- 通过动态代理实现
- 无需特殊编译器或类加载器

### 编译时织入（Compile-Time Weaving，CTW）
- AspectJ 提供
- 需 AspectJ 编译器（ajc）
- 性能最优但构建复杂

### 加载时织入（Load-Time Weaving，LTW）
- 在类加载时织入
- 需配置 Java Agent
- spring-instrument 模块支持

### 设计目的
提供多种织入方式，平衡性能和易用性。

### 使用限制与风险
- 运行时织入性能略低但易用
- 编译时和加载时织入需额外配置

---

## 10. AOP 目标对象暴露（AopContext）

### 核心类
- **AopContext** - AOP 上下文
  - `currentProxy()` - 获取当前代理对象

### 配置启用
```java
@EnableAspectJAutoProxy(exposeProxy = true)
```

### 使用场景
解决内部方法调用不触发 AOP 的问题：
```java
((MyService) AopContext.currentProxy()).internalMethod();
```

### 设计目的
允许目标对象内部获取代理对象，实现内部方法调用的 AOP 增强。

### 使用限制与风险
- 需显式启用 exposeProxy
- 增加了代码与 AOP 框架的耦合
- 性能有轻微开销（ThreadLocal）

---

## 11. 自动代理创建（AbstractAutoProxyCreator）

### 核心类
- **AbstractAutoProxyCreator** - 自动代理创建器抽象基类
- **DefaultAdvisorAutoProxyCreator** - 默认通知器自动代理创建器
- **BeanNameAutoProxyCreator** - Bean 名称自动代理创建器
- **AspectJAwareAdvisorAutoProxyCreator** - AspectJ 感知的通知器自动代理创建器
- **AnnotationAwareAspectJAutoProxyCreator** - 注解感知的 AspectJ 自动代理创建器

### 工作流程
1. BeanPostProcessor 的 postProcessAfterInitialization 阶段
2. 查找匹配的 Advisor
3. 创建代理对象
4. 返回代理对象替代原始对象

### 设计目的
自动为匹配的 Bean 创建 AOP 代理，无需手动配置。

### 使用限制与风险
- 自动代理创建器本身是 BeanPostProcessor，优先级很高
- 多个自动代理创建器可能冲突
- 代理创建影响启动性能

---

## 12. Advised 接口与代理配置

### 核心接口
- **Advised** - 被通知对象接口（所有 AOP 代理都实现此接口）
  - `getAdvisors()` - 获取通知器列表
  - `addAdvice()` - 添加通知
  - `removeAdvice()` - 移除通知
  - `getTargetSource()` - 获取目标源
  - `isProxyTargetClass()` - 是否 CGLIB 代理

### 设计目的
允许运行时查询和修改代理配置，实现动态 AOP。

### 使用限制与风险
- 所有 Spring AOP 代理都实现 Advised 接口
- 可通过类型转换获取代理配置：`((Advised) proxy).getAdvisors()`
- 运行时修改代理需谨慎，可能影响其他调用者

---

## 13. TargetSource 机制

### 核心接口
- **TargetSource** - 目标源接口
  - `getTarget()` - 获取目标对象
  - `releaseTarget()` - 释放目标对象
  - `getTargetClass()` - 获取目标类型

### 核心实现
- **SingletonTargetSource** - 单例目标源（默认）
- **PrototypeTargetSource** - 原型目标源（每次创建新实例）
- **ThreadLocalTargetSource** - 线程局部目标源
- **CommonsPool2TargetSource** - 对象池目标源
- **HotSwappableTargetSource** - 热替换目标源
- **LazyInitTargetSource** - 懒加载目标源

### 设计目的
抽象目标对象的获取逻辑，支持单例、原型、池化、热替换等多种模式。

### 使用限制与风险
- 非单例 TargetSource 每次调用都获取目标对象，性能开销大
- HotSwappableTargetSource 可实现运行时替换目标对象（适合 A/B 测试）
- TargetSource 与代理对象生命周期绑定

---

## 14. Introduction（引介增强）

### 核心接口
- **IntroductionInterceptor** - 引介拦截器
- **IntroductionAdvisor** - 引介通知器
- **IntroductionInfo** - 引介信息接口

### 核心实现
- **DelegatingIntroductionInterceptor** - 委托引介拦截器
- **DelegatePerTargetObjectIntroductionInterceptor** - 每目标对象委托引介拦截器

### AspectJ 注解
- **@DeclareParents** - 声明父类（引介）

### 设计目的
为目标对象动态添加新接口和实现，无需修改原始类。

### 使用限制与风险
- 引介只能通过接口实现
- 代理对象可转型为引介的接口
- 使用场景较少，主要用于框架扩展

---

## 15. ProxyFactory 与编程式 AOP

### 核心类
- **ProxyFactory** - 代理工厂
- **ProxyConfig** - 代理配置基类
  - `setProxyTargetClass()` - 强制 CGLIB 代理
  - `setExposeProxy()` - 暴露代理到 AopContext
  - `setFrozen()` - 冻结配置（不可修改）
  - `setOptimize()` - 优化代理

### 使用示例
```java
ProxyFactory factory = new ProxyFactory(target);
factory.addAdvice(new MethodBeforeAdvice() {
    public void before(Method method, Object[] args, Object target) {
        System.out.println("Before: " + method.getName());
    }
});
factory.setProxyTargetClass(true);
Object proxy = factory.getProxy();
```

### 设计目的
提供编程式 AOP API，适合动态创建代理的场景。

### 使用限制与风险
- 编程式 AOP 代码量大，不如注解简洁
- 适合需要运行时动态创建代理的场景（如框架开发）

---

## 16. @EnableAspectJAutoProxy 处理流程

### 核心类
- **AspectJAutoProxyRegistrar** - 注册 AnnotationAwareAspectJAutoProxyCreator
- **@EnableAspectJAutoProxy** - 启用 AspectJ 自动代理

### 属性
- **proxyTargetClass** - 是否强制 CGLIB 代理（默认 false）
- **exposeProxy** - 是否暴露代理到 AopContext（默认 false）

### 工作流程
1. @EnableAspectJAutoProxy 导入 AspectJAutoProxyRegistrar
2. 注册 AnnotationAwareAspectJAutoProxyCreator
3. 扫描 @Aspect 类，解析为 Advisor
4. BeanPostProcessor 阶段创建代理对象

### 设计目的
通过一个注解启用完整的 AspectJ 注解支持。

### 使用限制与风险
- Spring Boot 默认启用，无需手动配置
- proxyTargetClass=true 强制所有 Bean 使用 CGLIB 代理

---

## 17. AOP 代理选择策略

### 选择规则
1. 如果目标对象实现了接口 -> JDK 动态代理
2. 如果目标对象未实现接口 -> CGLIB 代理
3. 如果 proxyTargetClass=true -> 强制 CGLIB 代理

### 接口代理特例
- 如果仅实现 SpringProxy、Advised、DecoratingProxy 等 Spring 内部接口，视为无接口

### 设计目的
自动选择最合适的代理策略，平衡性能和兼容性。

### 使用限制与风险
- JDK 代理性能略优但限制多
- CGLIB 代理兼容性好但无法代理 final 类/方法
- Spring Boot 2.0+ 默认 proxyTargetClass=true

---

## 📚 总结

spring-aop 提供了完整的 AOP 解决方案：
- **代理机制**：JDK 动态代理 + CGLIB 代理
- **切点表达式**：AspectJ 表达式支持
- **通知类型**：Before、After、Around、AfterReturning、AfterThrowing
- **切面声明**：@Aspect 注解简化配置
- **自动代理**：AnnotationAwareAspectJAutoProxyCreator 自动创建代理
- **扩展点**：Advisor、TargetSource、Introduction 等
- **编程式 AOP**：ProxyFactory 灵活定制

Spring AOP 是运行时织入，适合企业级应用的横切关注点（事务、安全、日志等）处理。

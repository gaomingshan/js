# 第 37 章：IoC 和 AOP 深度面试题

> **学习目标**：掌握 IoC 和 AOP 的深度面试题  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 专家

---

## 1. IoC 深度问题

### 1.1 Spring 容器启动流程（refresh() 12 个步骤）

**答案**：
```java
1. prepareRefresh() - 准备刷新上下文
2. obtainFreshBeanFactory() - 获取 BeanFactory
3. prepareBeanFactory() - 准备 BeanFactory
4. postProcessBeanFactory() - 后置处理 BeanFactory（扩展点）
5. invokeBeanFactoryPostProcessors() - 调用 BeanFactoryPostProcessor
6. registerBeanPostProcessors() - 注册 BeanPostProcessor
7. initMessageSource() - 初始化消息源
8. initApplicationEventMulticaster() - 初始化事件多播器
9. onRefresh() - 初始化特殊 Bean（扩展点）
10. registerListeners() - 注册监听器
11. finishBeanFactoryInitialization() - 实例化所有非懒加载单例
12. finishRefresh() - 完成刷新，发布事件
```

### 1.2 BeanDefinition 包含哪些信息？

**答案**：
- **类信息**：beanClassName、beanClass
- **作用域**：scope（singleton/prototype）
- **懒加载**：lazyInit
- **依赖**：dependsOn
- **自动装配模式**：autowireMode
- **初始化方法**：initMethodName
- **销毁方法**：destroyMethodName
- **构造器参数**：constructorArgumentValues
- **属性值**：propertyValues

### 1.3 BeanPostProcessor 的执行时机和常见实现？

**答案**：

**执行时机**：
- **postProcessBeforeInitialization()**：初始化前（Aware 接口回调之后）
- **postProcessAfterInitialization()**：初始化后（AOP 代理在这里创建）

**常见实现**：
1. **AutowiredAnnotationBeanPostProcessor**：处理 @Autowired
2. **CommonAnnotationBeanPostProcessor**：处理 @Resource、@PostConstruct
3. **ApplicationContextAwareProcessor**：处理 ApplicationContextAware 等
4. **AbstractAutoProxyCreator**：创建 AOP 代理

---

## 2. AOP 深度问题

### 2.1 AOP 动态代理的完整流程？

**答案**：

**创建代理**：
```
1. AbstractAutoProxyCreator.postProcessAfterInitialization()
2. wrapIfNecessary() - 判断是否需要代理
3. getAdvicesAndAdvisorsForBean() - 获取匹配的 Advisor
4. createProxy() - 创建代理
   ├─> DefaultAopProxyFactory.createAopProxy()
   ├─> 有接口 → JdkDynamicAopProxy
   └─> 无接口 → CglibAopProxy
```

**方法调用**：
```
1. 代理对象方法调用
2. JdkDynamicAopProxy.invoke() 或 CglibAopProxy.intercept()
3. 获取拦截器链
4. ReflectiveMethodInvocation.proceed() 递归执行
5. 执行拦截器
6. 执行目标方法
```

### 2.2 拦截器链如何执行？为什么用递归？

**答案**：

**执行流程**：
```java
public Object proceed() throws Throwable {
    // 1. 所有拦截器执行完毕
    if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1) {
        return invokeJoinpoint(); // 执行目标方法
    }
    
    // 2. 获取下一个拦截器
    Object interceptor = this.interceptorsAndDynamicMethodMatchers.get(++this.currentInterceptorIndex);
    
    // 3. 执行拦截器
    return ((MethodInterceptor) interceptor).invoke(this); // 递归
}
```

**为什么用递归**：
- 实现**责任链模式**
- 支持**前置/后置逻辑**
- 代码简洁，易于理解

### 2.3 @Transactional 是如何通过 AOP 实现的？

**答案**：

**流程**：
```
1. TransactionInterceptor（MethodInterceptor）拦截方法
2. invokeWithinTransaction()
   ├─> createTransactionIfNecessary() - 开启事务
   ├─> invocation.proceed() - 执行业务方法
   ├─> completeTransactionAfterThrowing() - 异常回滚
   └─> commitTransactionAfterReturning() - 正常提交
```

**关键点**：
- TransactionInterceptor 是一个 **MethodInterceptor**
- TransactionAttributeSource 解析 **@Transactional** 注解
- PlatformTransactionManager 管理**事务生命周期**

---

## 3. 循环依赖深度问题

### 3.1 为什么需要三级缓存？二级缓存不够吗？

**答案**：

**三级缓存的作用**：
1. **一级缓存**：存储完全初始化的对象
2. **二级缓存**：存储早期暴露的对象（可能是代理）
3. **三级缓存**：存储对象工厂（用于延迟创建代理）

**为什么需要三级**：
- 如果只有二级缓存，**每次获取早期引用都要调用工厂**
- 可能**创建多个代理对象**，导致对象不一致
- 三级缓存**延迟创建代理**，二级缓存**缓存代理对象**

**示例**：
```java
// 三级缓存：存储工厂
singletonFactories.put("a", () -> getEarlyBeanReference("a", bean));

// 首次获取时，调用工厂创建代理，放入二级缓存
Object proxy = singletonFactory.getObject();
earlySingletonObjects.put("a", proxy);

// 后续获取直接从二级缓存获取，不重复创建
```

### 3.2 循环依赖时，AOP 代理何时创建？

**答案**：

**正常情况**（无循环依赖）：
```
实例化 → 属性填充 → 初始化 → postProcessAfterInitialization()【创建代理】
```

**循环依赖情况**：
```
实例化 → 提前暴露（三级缓存） → 属性填充
    ↓
被其他 Bean 依赖时，从三级缓存获取
    ↓
调用 getEarlyBeanReference()【提前创建代理】
    ↓
放入二级缓存
    ↓
初始化 → postProcessAfterInitialization()【检测到早期引用，跳过代理创建】
```

**关键代码**：
```java
// AbstractAutoProxyCreator
public Object postProcessAfterInitialization(Object bean, String beanName) {
    Object cacheKey = getCacheKey(bean.getClass(), beanName);
    
    // 如果已经创建了早期引用（循环依赖），跳过
    if (this.earlyProxyReferences.remove(cacheKey) != bean) {
        return wrapIfNecessary(bean, beanName, cacheKey); // 正常流程
    }
    return bean; // 循环依赖，已创建代理
}
```

---

## 4. 事务深度问题

### 4.1 NESTED 和 REQUIRES_NEW 的本质区别？

**答案**：

| 特性 | NESTED | REQUIRES_NEW |
|------|--------|--------------|
| **实现方式** | SavePoint（单个事务） | 独立事务（两个事务） |
| **连接数** | 1 个 | 2 个 |
| **内层回滚** | 回滚到 SavePoint | 独立事务回滚 |
| **外层回滚** | 整个事务回滚 | 外层回滚，内层已提交 |

**源码差异**：
```java
// NESTED：创建 SavePoint
status.createAndHoldSavepoint();

// 回滚到 SavePoint
status.rollbackToHeldSavepoint();

// REQUIRES_NEW：挂起当前事务
SuspendedResourcesHolder suspendedResources = suspend(transaction);
// 创建新事务
return startTransaction(definition, transaction, debugEnabled, suspendedResources);
```

### 4.2 事务传播行为的底层实现？

**答案**：

**核心方法**：`AbstractPlatformTransactionManager.getTransaction()`

```java
public final TransactionStatus getTransaction(TransactionDefinition definition) {
    Object transaction = doGetTransaction();
    
    // 1. 判断是否已存在事务
    if (isExistingTransaction(transaction)) {
        // 2. 处理已存在事务的情况
        return handleExistingTransaction(definition, transaction, debugEnabled);
    }
    
    // 3. 不存在事务的情况
    if (definition.getPropagationBehavior() == PROPAGATION_REQUIRED) {
        // 创建新事务
        return startTransaction(definition, transaction, debugEnabled, null);
    }
    // ... 其他传播行为处理
}

private TransactionStatus handleExistingTransaction(
        TransactionDefinition definition, Object transaction, boolean debugEnabled) {
    
    // REQUIRES_NEW：挂起当前事务，创建新事务
    if (definition.getPropagationBehavior() == PROPAGATION_REQUIRES_NEW) {
        SuspendedResourcesHolder suspendedResources = suspend(transaction);
        return startTransaction(definition, transaction, debugEnabled, suspendedResources);
    }
    
    // NESTED：创建 SavePoint
    if (definition.getPropagationBehavior() == PROPAGATION_NESTED) {
        DefaultTransactionStatus status = prepareTransactionStatus(...);
        status.createAndHoldSavepoint();
        return status;
    }
    
    // REQUIRED：加入当前事务
    return newTransactionStatus(definition, transaction, false, ...);
}
```

---

## 5. Spring MVC 深度问题

### 5.1 @RequestMapping 如何解析并注册的？

**答案**：

**流程**：
```
1. RequestMappingHandlerMapping.afterPropertiesSet()
2. 扫描所有 Bean，找到 @Controller 和 @RequestMapping
3. detectHandlerMethods(beanName)
4. getMappingForMethod() - 解析方法上的 @RequestMapping
5. registerHandlerMethod() - 注册到 MappingRegistry
```

**注册结构**：
```java
// MappingRegistry
class MappingRegistry {
    Map<T, MappingRegistration<T>> registry;  // 映射信息
    Map<T, HandlerMethod> mappingLookup;       // 映射到方法
    Map<String, List<T>> urlLookup;            // URL 到映射
}
```

### 5.2 HandlerAdapter 为什么用适配器模式？

**答案**：

**问题**：不同类型的 Handler 调用方式不同
- Controller 接口：handleRequest()
- @RequestMapping 方法：反射调用
- HttpRequestHandler：handleRequest()

**解决**：适配器模式统一调用接口

```java
// 统一接口
public interface HandlerAdapter {
    boolean supports(Object handler);
    ModelAndView handle(HttpServletRequest request, 
                        HttpServletResponse response, 
                        Object handler) throws Exception;
}

// 不同实现
RequestMappingHandlerAdapter - 处理 @RequestMapping
SimpleControllerHandlerAdapter - 处理 Controller 接口
HttpRequestHandlerAdapter - 处理 HttpRequestHandler
```

---

## 6. 综合应用题

### 6.1 如何实现一个自定义注解 + AOP 拦截？

**答案**：
```java
// 1. 定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimiter {
    int limit() default 10;
}

// 2. 定义切面
@Aspect
@Component
public class RateLimiterAspect {
    
    @Around("@annotation(rateLimiter)")
    public Object around(ProceedingJoinPoint pjp, RateLimiter rateLimiter) throws Throwable {
        int limit = rateLimiter.limit();
        
        // 限流逻辑
        if (checkRateLimit(limit)) {
            return pjp.proceed();
        } else {
            throw new RateLimitException();
        }
    }
}

// 3. 使用
@Service
public class UserService {
    @RateLimiter(limit = 100)
    public void createUser(User user) {
        // ...
    }
}
```

### 6.2 如何排查 @Transactional 不生效的问题？

**答案**：

**排查步骤**：
1. **检查方法修饰符**：是否 public
2. **检查是否代理**：AopUtils.isAopProxy(bean)
3. **检查调用方式**：是否内部调用
4. **开启事务日志**：`logging.level.org.springframework.transaction=DEBUG`
5. **检查异常类型**：是否 RuntimeException 或 Error
6. **检查异常处理**：是否被捕获
7. **检查数据库**：是否支持事务

**常用诊断代码**：
```java
@Component
public class TransactionChecker {
    
    public void checkTransaction(Object bean, String methodName) {
        // 1. 是否代理对象
        System.out.println("Is proxy: " + AopUtils.isAopProxy(bean));
        
        // 2. 代理类型
        if (AopUtils.isCglibProxy(bean)) {
            System.out.println("CGLIB proxy");
        } else if (AopUtils.isJdkDynamicProxy(bean)) {
            System.out.println("JDK proxy");
        }
        
        // 3. 是否在事务中
        System.out.println("In transaction: " + 
            TransactionSynchronizationManager.isActualTransactionActive());
    }
}
```

---

**上一章** ← [第 36 章：Spring 核心原理面试题](./content-36.md)  
**下一章** → [第 38 章：事务和 MVC 面试题](./content-38.md)  
**返回目录** → [学习大纲](../content-outline.md)

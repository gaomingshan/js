# 第 12 章：拦截器链执行流程

> **学习目标**：深入理解 AOP 拦截器链的构建和执行机制  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐⭐ 高级  
> **源码入口**：`ReflectiveMethodInvocation.proceed()`

---

## 1. 核心概念

AOP 代理方法执行时，会将所有匹配的**通知（Advice）**组织成一个**拦截器链**，然后**递归执行**。

**拦截器链执行流程**：

```
目标方法调用
    ↓
代理对象拦截
    ↓
获取拦截器链 [Interceptor1, Interceptor2, ..., InterceptorN]
    ↓
创建 MethodInvocation
    ↓
proceed() 递归执行
    ├─> Interceptor1.invoke(invocation)
    │      ├─> 前置逻辑
    │      ├─> invocation.proceed()
    │      │      ├─> Interceptor2.invoke(invocation)
    │      │      │      ├─> 前置逻辑
    │      │      │      ├─> invocation.proceed()
    │      │      │      │      └─> ... 递归
    │      │      │      │             └─> 目标方法执行
    │      │      │      └─> 后置逻辑
    │      │      └─> 返回
    │      └─> 后置逻辑
    └─> 返回最终结果
```

---

## 2. 拦截器链构建

### 2.1 获取拦截器链

```java
// AdvisedSupport.getInterceptorsAndDynamicInterceptionAdvice()
public List<Object> getInterceptorsAndDynamicInterceptionAdvice(Method method, @Nullable Class<?> targetClass) {
    // 缓存 key
    MethodCacheKey cacheKey = new MethodCacheKey(method);
    
    // 从缓存获取
    List<Object> cached = this.methodCache.get(cacheKey);
    if (cached == null) {
        // 获取拦截器链
        cached = this.advisorChainFactory.getInterceptorsAndDynamicInterceptionAdvice(
            this, method, targetClass);
        
        // 放入缓存
        this.methodCache.put(cacheKey, cached);
    }
    return cached;
}
```

### 2.2 DefaultAdvisorChainFactory

```java
public class DefaultAdvisorChainFactory implements AdvisorChainFactory, Serializable {
    
    @Override
    public List<Object> getInterceptorsAndDynamicInterceptionAdvice(
            Advised config, Method method, @Nullable Class<?> targetClass) {
        
        // 适配器注册器（用于将 Advice 转换为 MethodInterceptor）
        AdvisorAdapterRegistry registry = GlobalAdvisorAdapterRegistry.getInstance();
        
        Advisor[] advisors = config.getAdvisors();
        List<Object> interceptorList = new ArrayList<>(advisors.length);
        Class<?> actualClass = (targetClass != null ? targetClass : method.getDeclaringClass());
        Boolean hasIntroductions = null;
        
        // 遍历所有 Advisor
        for (Advisor advisor : advisors) {
            if (advisor instanceof PointcutAdvisor) {
                PointcutAdvisor pointcutAdvisor = (PointcutAdvisor) advisor;
                
                // 1. 类级别匹配
                if (config.isPreFiltered() || pointcutAdvisor.getPointcut().getClassFilter().matches(actualClass)) {
                    MethodMatcher mm = pointcutAdvisor.getPointcut().getMethodMatcher();
                    boolean match;
                    
                    // 2. 方法级别匹配（静态匹配）
                    if (mm instanceof IntroductionAwareMethodMatcher) {
                        if (hasIntroductions == null) {
                            hasIntroductions = hasMatchingIntroductions(advisors, actualClass);
                        }
                        match = ((IntroductionAwareMethodMatcher) mm).matches(method, actualClass, hasIntroductions);
                    } else {
                        match = mm.matches(method, actualClass);
                    }
                    
                    if (match) {
                        // 3. 将 Advisor 转换为 MethodInterceptor
                        MethodInterceptor[] interceptors = registry.getInterceptors(advisor);
                        
                        // 4. 判断是否需要运行时匹配（动态匹配）
                        if (mm.isRuntime()) {
                            for (MethodInterceptor interceptor : interceptors) {
                                interceptorList.add(new InterceptorAndDynamicMethodMatcher(interceptor, mm));
                            }
                        } else {
                            interceptorList.addAll(Arrays.asList(interceptors));
                        }
                    }
                }
            } else if (advisor instanceof IntroductionAdvisor) {
                IntroductionAdvisor ia = (IntroductionAdvisor) advisor;
                if (config.isPreFiltered() || ia.getClassFilter().matches(actualClass)) {
                    Interceptor[] interceptors = registry.getInterceptors(advisor);
                    interceptorList.addAll(Arrays.asList(interceptors));
                }
            } else {
                Interceptor[] interceptors = registry.getInterceptors(advisor);
                interceptorList.addAll(Arrays.asList(interceptors));
            }
        }
        
        return interceptorList;
    }
}
```

### 2.3 Advice 转换为 MethodInterceptor

```java
public class DefaultAdvisorAdapterRegistry implements AdvisorAdapterRegistry, Serializable {
    
    private final List<AdvisorAdapter> adapters = new ArrayList<>(3);
    
    public DefaultAdvisorAdapterRegistry() {
        // 注册适配器
        registerAdvisorAdapter(new MethodBeforeAdviceAdapter());
        registerAdvisorAdapter(new AfterReturningAdviceAdapter());
        registerAdvisorAdapter(new ThrowsAdviceAdapter());
    }
    
    @Override
    public MethodInterceptor[] getInterceptors(Advisor advisor) throws UnknownAdviceTypeException {
        List<MethodInterceptor> interceptors = new ArrayList<>(3);
        Advice advice = advisor.getAdvice();
        
        // 1. 如果 Advice 本身是 MethodInterceptor，直接添加
        if (advice instanceof MethodInterceptor) {
            interceptors.add((MethodInterceptor) advice);
        }
        
        // 2. 使用适配器转换
        for (AdvisorAdapter adapter : this.adapters) {
            if (adapter.supportsAdvice(advice)) {
                interceptors.add(adapter.getInterceptor(advisor));
            }
        }
        
        if (interceptors.isEmpty()) {
            throw new UnknownAdviceTypeException(advisor.getAdvice());
        }
        
        return interceptors.toArray(new MethodInterceptor[0]);
    }
}
```

### 2.4 Advice 适配器

```java
// 1. MethodBeforeAdvice 适配器
class MethodBeforeAdviceAdapter implements AdvisorAdapter, Serializable {
    
    @Override
    public boolean supportsAdvice(Advice advice) {
        return (advice instanceof MethodBeforeAdvice);
    }
    
    @Override
    public MethodInterceptor getInterceptor(Advisor advisor) {
        MethodBeforeAdvice advice = (MethodBeforeAdvice) advisor.getAdvice();
        return new MethodBeforeAdviceInterceptor(advice);
    }
}

// MethodBeforeAdviceInterceptor
public class MethodBeforeAdviceInterceptor implements MethodInterceptor, BeforeAdvice, Serializable {
    
    private final MethodBeforeAdvice advice;
    
    public MethodBeforeAdviceInterceptor(MethodBeforeAdvice advice) {
        Assert.notNull(advice, "Advice must not be null");
        this.advice = advice;
    }
    
    @Override
    public Object invoke(MethodInvocation mi) throws Throwable {
        // 前置通知
        this.advice.before(mi.getMethod(), mi.getArguments(), mi.getThis());
        // 继续执行链
        return mi.proceed();
    }
}

// 2. AfterReturningAdvice 适配器
class AfterReturningAdviceAdapter implements AdvisorAdapter, Serializable {
    
    @Override
    public boolean supportsAdvice(Advice advice) {
        return (advice instanceof AfterReturningAdvice);
    }
    
    @Override
    public MethodInterceptor getInterceptor(Advisor advisor) {
        AfterReturningAdvice advice = (AfterReturningAdvice) advisor.getAdvice();
        return new AfterReturningAdviceInterceptor(advice);
    }
}

// AfterReturningAdviceInterceptor
public class AfterReturningAdviceInterceptor implements MethodInterceptor, AfterAdvice, Serializable {
    
    private final AfterReturningAdvice advice;
    
    public AfterReturningAdviceInterceptor(AfterReturningAdvice advice) {
        Assert.notNull(advice, "Advice must not be null");
        this.advice = advice;
    }
    
    @Override
    public Object invoke(MethodInvocation mi) throws Throwable {
        // 先执行链
        Object retVal = mi.proceed();
        // 返回后通知
        this.advice.afterReturning(retVal, mi.getMethod(), mi.getArguments(), mi.getThis());
        return retVal;
    }
}
```

---

## 3. ReflectiveMethodInvocation

### 3.1 核心实现

```java
public class ReflectiveMethodInvocation implements ProxyMethodInvocation, Cloneable {
    
    protected final Object proxy;
    
    @Nullable
    protected final Object target;
    
    protected final Method method;
    
    protected Object[] arguments;
    
    @Nullable
    private final Class<?> targetClass;
    
    /**
     * 拦截器链
     */
    protected final List<?> interceptorsAndDynamicMethodMatchers;
    
    /**
     * 当前拦截器索引
     */
    private int currentInterceptorIndex = -1;
    
    protected ReflectiveMethodInvocation(
            Object proxy, @Nullable Object target, Method method, @Nullable Object[] arguments,
            @Nullable Class<?> targetClass, List<Object> interceptorsAndDynamicMethodMatchers) {
        
        this.proxy = proxy;
        this.target = target;
        this.targetClass = targetClass;
        this.method = BridgeMethodResolver.findBridgedMethod(method);
        this.arguments = AopProxyUtils.adaptArgumentsIfNecessary(method, arguments);
        this.interceptorsAndDynamicMethodMatchers = interceptorsAndDynamicMethodMatchers;
    }
    
    /**
     * 执行拦截器链（核心方法）
     */
    @Override
    @Nullable
    public Object proceed() throws Throwable {
        // 1. 如果所有拦截器都执行完了，调用目标方法
        if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1) {
            return invokeJoinpoint();
        }
        
        // 2. 获取下一个拦截器
        Object interceptorOrInterceptionAdvice =
            this.interceptorsAndDynamicMethodMatchers.get(++this.currentInterceptorIndex);
        
        // 3. 判断是否需要动态匹配
        if (interceptorOrInterceptionAdvice instanceof InterceptorAndDynamicMethodMatcher) {
            InterceptorAndDynamicMethodMatcher dm =
                (InterceptorAndDynamicMethodMatcher) interceptorOrInterceptionAdvice;
            
            Class<?> targetClass = (this.targetClass != null ? this.targetClass : this.method.getDeclaringClass());
            
            // 运行时匹配
            if (dm.methodMatcher.matches(this.method, targetClass, this.arguments)) {
                // 匹配成功，执行拦截器
                return dm.interceptor.invoke(this);
            } else {
                // 匹配失败，跳过当前拦截器
                return proceed();
            }
        } else {
            // 4. 直接执行拦截器
            return ((MethodInterceptor) interceptorOrInterceptionAdvice).invoke(this);
        }
    }
    
    /**
     * 调用目标方法
     */
    @Nullable
    protected Object invokeJoinpoint() throws Throwable {
        return AopUtils.invokeJoinpointUsingReflection(this.target, this.method, this.arguments);
    }
}
```

### 3.2 执行流程图

```
proceed() 调用流程：

初始状态：currentInterceptorIndex = -1

proceed() #1
    ├─> currentInterceptorIndex++ → 0
    ├─> 获取 interceptor[0]
    └─> interceptor[0].invoke(this)
           ├─> 前置逻辑
           ├─> proceed() #2
           │      ├─> currentInterceptorIndex++ → 1
           │      ├─> 获取 interceptor[1]
           │      └─> interceptor[1].invoke(this)
           │             ├─> 前置逻辑
           │             ├─> proceed() #3
           │             │      ├─> currentInterceptorIndex++ → 2
           │             │      ├─> currentInterceptorIndex == size - 1
           │             │      └─> invokeJoinpoint() → 目标方法
           │             │             └─> 返回结果
           │             └─> 后置逻辑
           │                    └─> 返回结果
           └─> 后置逻辑
                  └─> 返回结果
```

---

## 4. AspectJ 通知转换

### 4.1 AspectJAfterAdvice

```java
public class AspectJAfterAdvice extends AbstractAspectJAdvice
        implements MethodInterceptor, AfterAdvice, Serializable {
    
    public AspectJAfterAdvice(
            Method aspectJBeforeAdviceMethod, AspectJExpressionPointcut pointcut, AspectInstanceFactory aif) {
        super(aspectJBeforeAdviceMethod, pointcut, aif);
    }
    
    @Override
    public Object invoke(MethodInvocation mi) throws Throwable {
        try {
            // 先执行链
            return mi.proceed();
        } finally {
            // 后置通知（finally 保证一定执行）
            invokeAdviceMethod(getJoinPointMatch(), null, null);
        }
    }
}
```

### 4.2 AspectJAfterReturningAdvice

```java
public class AspectJAfterReturningAdvice extends AbstractAspectJAdvice
        implements AfterReturningAdvice, AfterAdvice, Serializable {
    
    public AspectJAfterReturningAdvice(
            Method aspectJBeforeAdviceMethod, AspectJExpressionPointcut pointcut, AspectInstanceFactory aif) {
        super(aspectJBeforeAdviceMethod, pointcut, aif);
    }
    
    @Override
    public void afterReturning(@Nullable Object returnValue, Method method, Object[] args, @Nullable Object target) 
            throws Throwable {
        
        if (shouldInvokeOnReturnValueOf(method, returnValue)) {
            // 执行通知方法
            invokeAdviceMethod(getJoinPointMatch(), returnValue, null);
        }
    }
    
    private boolean shouldInvokeOnReturnValueOf(Method method, @Nullable Object returnValue) {
        Class<?> type = getDiscoveredReturningType();
        Type genericType = getDiscoveredReturningGenericType();
        
        // 类型匹配检查
        return (matchesReturnValue(type, method, returnValue) &&
            (genericType == null || genericType == type ||
                TypeUtils.isAssignable(genericType, method.getGenericReturnType())));
    }
}
```

### 4.3 AspectJAfterThrowingAdvice

```java
public class AspectJAfterThrowingAdvice extends AbstractAspectJAdvice
        implements MethodInterceptor, AfterAdvice, Serializable {
    
    public AspectJAfterThrowingAdvice(
            Method aspectJBeforeAdviceMethod, AspectJExpressionPointcut pointcut, AspectInstanceFactory aif) {
        super(aspectJBeforeAdviceMethod, pointcut, aif);
    }
    
    @Override
    public Object invoke(MethodInvocation mi) throws Throwable {
        try {
            // 执行链
            return mi.proceed();
        } catch (Throwable ex) {
            // 异常匹配
            if (shouldInvokeOnThrowing(ex)) {
                invokeAdviceMethod(getJoinPointMatch(), null, ex);
            }
            throw ex;
        }
    }
    
    private boolean shouldInvokeOnThrowing(Throwable ex) {
        return getDiscoveredThrowingType().isAssignableFrom(ex.getClass());
    }
}
```

### 4.4 AspectJAroundAdvice

```java
public class AspectJAroundAdvice extends AbstractAspectJAdvice implements MethodInterceptor, Serializable {
    
    public AspectJAroundAdvice(
            Method aspectJAroundAdviceMethod, AspectJExpressionPointcut pointcut, AspectInstanceFactory aif) {
        super(aspectJAroundAdviceMethod, pointcut, aif);
    }
    
    @Override
    public Object invoke(MethodInvocation mi) throws Throwable {
        if (!(mi instanceof ProxyMethodInvocation)) {
            throw new IllegalStateException("MethodInvocation is not a Spring ProxyMethodInvocation: " + mi);
        }
        
        ProxyMethodInvocation pmi = (ProxyMethodInvocation) mi;
        ProceedingJoinPoint pjp = lazyGetProceedingJoinPoint(pmi);
        JoinPointMatch jpm = getJoinPointMatch(pmi);
        
        // 调用 @Around 通知方法，传入 ProceedingJoinPoint
        return invokeAdviceMethod(pjp, jpm, null, null);
    }
    
    protected ProceedingJoinPoint lazyGetProceedingJoinPoint(ProxyMethodInvocation rmi) {
        return new MethodInvocationProceedingJoinPoint(rmi);
    }
}
```

---

## 5. 拦截器执行顺序

### 5.1 单个切面的执行顺序

```java
@Aspect
@Component
public class LoggingAspect {
    
    @Around("execution(* com.example.service.*.*(..))")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("1. Around - 前");
        Object result = pjp.proceed();
        System.out.println("5. Around - 后");
        return result;
    }
    
    @Before("execution(* com.example.service.*.*(..))")
    public void before() {
        System.out.println("2. Before");
    }
    
    @After("execution(* com.example.service.*.*(..))")
    public void after() {
        System.out.println("4. After");
    }
    
    @AfterReturning("execution(* com.example.service.*.*(..))")
    public void afterReturning() {
        System.out.println("3. AfterReturning");
    }
}

// 执行顺序：
// 1. Around - 前
// 2. Before
// [目标方法]
// 3. AfterReturning
// 4. After
// 5. Around - 后
```

**拦截器链顺序**：
```
[
    AspectJAroundAdvice,           // @Around
    MethodBeforeAdviceInterceptor, // @Before
    AspectJAfterAdvice,            // @After
    AfterReturningAdviceInterceptor // @AfterReturning
]
```

### 5.2 多个切面的执行顺序

```java
@Aspect
@Component
@Order(1)
public class Aspect1 {
    @Before("execution(* com.example.service.*.*(..))")
    public void before() {
        System.out.println("Aspect1 - Before");
    }
    
    @After("execution(* com.example.service.*.*(..))")
    public void after() {
        System.out.println("Aspect1 - After");
    }
}

@Aspect
@Component
@Order(2)
public class Aspect2 {
    @Before("execution(* com.example.service.*.*(..))")
    public void before() {
        System.out.println("Aspect2 - Before");
    }
    
    @After("execution(* com.example.service.*.*(..))")
    public void after() {
        System.out.println("Aspect2 - After");
    }
}

// 执行顺序：
// Aspect1 - Before
// Aspect2 - Before
// [目标方法]
// Aspect2 - After
// Aspect1 - After
```

**拦截器链顺序**：
```
[
    Aspect1-BeforeAdvice,
    Aspect2-BeforeAdvice,
    Aspect2-AfterAdvice,
    Aspect1-AfterAdvice
]
```

**规律**：
- `@Order` 值小的切面优先级高
- 前置通知：优先级高的先执行
- 后置通知：优先级高的后执行（类似洋葱模型）

---

## 6. 实际落地场景（工作实战）

### 场景 1：事务 + 日志组合

```java
// 事务切面（优先级高）
@Aspect
@Component
@Order(1)
public class TransactionAspect {
    @Around("@annotation(org.springframework.transaction.annotation.Transactional)")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("事务开启");
        try {
            Object result = pjp.proceed();
            System.out.println("事务提交");
            return result;
        } catch (Exception e) {
            System.out.println("事务回滚");
            throw e;
        }
    }
}

// 日志切面（优先级低）
@Aspect
@Component
@Order(2)
public class LoggingAspect {
    @Around("execution(* com.example.service.*.*(..))")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("日志 - 开始");
        Object result = pjp.proceed();
        System.out.println("日志 - 结束");
        return result;
    }
}

// 执行顺序：
// 事务开启
// 日志 - 开始
// [目标方法]
// 日志 - 结束
// 事务提交
```

### 场景 2：动态修改方法参数

```java
@Aspect
@Component
public class ParameterModifyAspect {
    
    @Around("execution(* com.example.service.UserService.save(..))")
    public Object modifyParameter(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();
        
        // 修改参数
        if (args.length > 0 && args[0] instanceof User) {
            User user = (User) args[0];
            user.setCreateTime(new Date());
            user.setUpdateTime(new Date());
        }
        
        // 使用修改后的参数执行
        return pjp.proceed(args);
    }
}
```

### 场景 3：条件化执行通知

```java
@Aspect
@Component
public class ConditionalAspect {
    
    @Around("@annotation(rateLimiter)")
    public Object rateLimit(ProceedingJoinPoint pjp, RateLimiter rateLimiter) throws Throwable {
        String key = rateLimiter.key();
        int limit = rateLimiter.limit();
        
        // 检查限流
        if (checkRateLimit(key, limit)) {
            return pjp.proceed();
        } else {
            throw new RateLimitException("请求过于频繁");
        }
    }
    
    private boolean checkRateLimit(String key, int limit) {
        // 限流逻辑
        return true;
    }
}
```

---

## 7. 面试准备专项

### 高频面试题：Spring AOP 拦截器链如何执行？

**第一层（基础回答 - 60分）**：
Spring AOP 将所有通知组织成拦截器链，然后递归执行。

**第二层（深入原理 - 80分）**：
拦截器链执行流程：

1. **构建拦截器链**：
   - 遍历所有 Advisor
   - 匹配切点（类匹配 + 方法匹配）
   - 将 Advice 转换为 MethodInterceptor
   
2. **递归执行链**：
   - 创建 `ReflectiveMethodInvocation`
   - `proceed()` 方法递归调用
   - 索引递增，依次执行拦截器
   - 最后执行目标方法

3. **通知执行顺序**：
   - @Around 前半部分
   - @Before
   - 目标方法
   - @AfterReturning 或 @AfterThrowing
   - @After
   - @Around 后半部分

**第三层（扩展延伸 - 95分）**：
从源码角度详细说明：

**核心方法：ReflectiveMethodInvocation.proceed()**

```java
public Object proceed() throws Throwable {
    // 1. 所有拦截器执行完毕，调用目标方法
    if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1) {
        return invokeJoinpoint();
    }
    
    // 2. 获取下一个拦截器
    Object interceptor = this.interceptorsAndDynamicMethodMatchers.get(++this.currentInterceptorIndex);
    
    // 3. 执行拦截器
    return ((MethodInterceptor) interceptor).invoke(this);
}
```

**追问应对**：

**追问 1：为什么 @After 在 @AfterReturning 之后执行？**
- @After 被包装为 `AspectJAfterAdvice`
- 使用 try-finally 实现
- finally 块在 return 之后执行

**追问 2：多个切面的执行顺序？**
- 通过 `@Order` 控制优先级
- 优先级高的切面：前置先执行，后置后执行
- 类似洋葱模型：外层切面包裹内层切面

**加分项**：
- 能画出拦截器链执行流程图
- 能说出 Advice 如何转换为 MethodInterceptor
- 能解释动态匹配机制

---

## 8. 学习自检清单

- [ ] 能够解释拦截器链的构建过程
- [ ] 能够说出 ReflectiveMethodInvocation.proceed() 的执行流程
- [ ] 能够说出通知的执行顺序
- [ ] 能够解释 Advice 如何转换为 MethodInterceptor
- [ ] 能够说出多个切面的执行顺序
- [ ] 能够画出拦截器链执行流程图

**学习建议**：
- **预计学习时长**：3 小时
- **重点难点**：递归执行流程、通知执行顺序
- **前置知识**：AOP 核心概念、动态代理
- **实践建议**：
  - 调试 proceed() 方法
  - 实现多个切面，观察执行顺序
  - 分析不同通知的拦截器实现

---

## 9. 参考资料

**Spring 官方文档**：
- [AOP Proxies](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-understanding-aop-proxies)

**源码位置**：
- `org.springframework.aop.framework.ReflectiveMethodInvocation`
- `org.springframework.aop.framework.adapter.DefaultAdvisorChainFactory`
- `org.springframework.aop.aspectj.AspectJAfterAdvice`

---

**上一章** ← [第 11 章：@AspectJ 注解实现](./content-11.md)  
**下一章** → [第 13 章：事务管理架构设计](./content-13.md)  
**返回目录** → [学习大纲](../content-outline.md)

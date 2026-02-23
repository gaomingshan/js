# 第 11 章：@AspectJ 注解实现

> **学习目标**：掌握 @AspectJ 注解的使用和底层实现原理  
> **预计时长**：2.5 小时  
> **难度级别**：⭐⭐⭐ 进阶  
> **源码入口**：`AnnotationAwareAspectJAutoProxyCreator`

---

## 1. 核心概念

Spring AOP 支持两种配置方式：
1. **XML 配置**（传统方式）
2. **@AspectJ 注解**（推荐方式）

**@AspectJ** 是基于注解的 AOP 配置方式，由 AspectJ 项目提供，Spring AOP 借用了其注解和切点表达式语法。

---

## 2. @AspectJ 核心注解

### 2.1 注解体系

```java
// 1. @Aspect：标记切面类
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Aspect {
    String value() default "";
}

// 2. @Pointcut：定义切点
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Pointcut {
    String value() default "";
    String argNames() default "";
}

// 3. 通知注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Before {
    String value();
    String argNames() default "";
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface After {
    String value();
    String argNames() default "";
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AfterReturning {
    String value() default "";
    String pointcut() default "";
    String returning() default "";
    String argNames() default "";
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AfterThrowing {
    String value() default "";
    String pointcut() default "";
    String throwing() default "";
    String argNames() default "";
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Around {
    String value();
    String argNames() default "";
}
```

### 2.2 完整示例

```java
@Aspect
@Component
public class LoggingAspect {
    
    // 1. 定义切点
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceLayer() {}
    
    @Pointcut("execution(* com.example.repository.*.*(..))")
    public void repositoryLayer() {}
    
    @Pointcut("@annotation(com.example.annotation.Loggable)")
    public void loggableMethod() {}
    
    // 2. 前置通知
    @Before("serviceLayer()")
    public void logBefore(JoinPoint joinPoint) {
        String method = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();
        System.out.println("执行前: " + method + " 参数: " + Arrays.toString(args));
    }
    
    // 3. 返回后通知
    @AfterReturning(pointcut = "serviceLayer()", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        String method = joinPoint.getSignature().toShortString();
        System.out.println("返回后: " + method + " 结果: " + result);
    }
    
    // 4. 异常通知
    @AfterThrowing(pointcut = "serviceLayer()", throwing = "error")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable error) {
        String method = joinPoint.getSignature().toShortString();
        System.out.println("异常: " + method + " 错误: " + error.getMessage());
    }
    
    // 5. 后置通知（finally）
    @After("serviceLayer()")
    public void logAfter(JoinPoint joinPoint) {
        String method = joinPoint.getSignature().toShortString();
        System.out.println("执行后: " + method);
    }
    
    // 6. 环绕通知
    @Around("serviceLayer()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        
        System.out.println("环绕-前: " + method);
        long start = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long cost = System.currentTimeMillis() - start;
            System.out.println("环绕-后: " + method + " 耗时: " + cost + "ms");
            return result;
        } catch (Throwable throwable) {
            System.out.println("环绕-异常: " + method);
            throw throwable;
        }
    }
    
    // 7. 组合切点
    @Before("serviceLayer() && loggableMethod()")
    public void logServiceWithAnnotation(JoinPoint joinPoint) {
        System.out.println("带 @Loggable 注解的 Service 方法");
    }
    
    // 8. 获取注解参数
    @Around("@annotation(loggable)")
    public Object logWithAnnotation(ProceedingJoinPoint joinPoint, Loggable loggable) throws Throwable {
        String category = loggable.category();
        System.out.println("日志分类: " + category);
        return joinPoint.proceed();
    }
    
    // 9. 获取方法参数
    @Before("execution(* com.example.service.UserService.save(..)) && args(user)")
    public void logUserSave(JoinPoint joinPoint, User user) {
        System.out.println("保存用户: " + user.getUsername());
    }
}
```

---

## 3. 启用 @AspectJ 支持

### 3.1 Java Config

```java
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {
}

// 或强制使用 CGLIB
@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class AopConfig {
}

// 暴露代理到 AopContext
@Configuration
@EnableAspectJAutoProxy(exposeProxy = true)
public class AopConfig {
}
```

### 3.2 XML 配置

```xml
<!-- 启用 @AspectJ 支持 -->
<aop:aspectj-autoproxy/>

<!-- 强制使用 CGLIB -->
<aop:aspectj-autoproxy proxy-target-class="true"/>

<!-- 暴露代理 -->
<aop:aspectj-autoproxy expose-proxy="true"/>
```

### 3.3 Spring Boot

```java
// Spring Boot 自动配置，无需手动启用
// AopAutoConfiguration 自动启用 @EnableAspectJAutoProxy

// 配置文件
# application.properties
spring.aop.auto=true
spring.aop.proxy-target-class=true
```

---

## 4. @EnableAspectJAutoProxy 源码分析

### 4.1 注解定义

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(AspectJAutoProxyRegistrar.class)
public @interface EnableAspectJAutoProxy {
    /**
     * 是否强制使用 CGLIB 代理
     */
    boolean proxyTargetClass() default false;
    
    /**
     * 是否暴露代理到 AopContext
     */
    boolean exposeProxy() default false;
}
```

### 4.2 AspectJAutoProxyRegistrar

```java
class AspectJAutoProxyRegistrar implements ImportBeanDefinitionRegistrar {
    
    @Override
    public void registerBeanDefinitions(
            AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
        
        // 注册 AnnotationAwareAspectJAutoProxyCreator
        AopConfigUtils.registerAspectJAnnotationAutoProxyCreatorIfNecessary(registry);
        
        // 处理 @EnableAspectJAutoProxy 的属性
        AnnotationAttributes enableAspectJAutoProxy =
            AnnotationConfigUtils.attributesFor(importingClassMetadata, EnableAspectJAutoProxy.class);
        
        if (enableAspectJAutoProxy != null) {
            if (enableAspectJAutoProxy.getBoolean("proxyTargetClass")) {
                AopConfigUtils.forceAutoProxyCreatorToUseClassProxying(registry);
            }
            if (enableAspectJAutoProxy.getBoolean("exposeProxy")) {
                AopConfigUtils.forceAutoProxyCreatorToExposeProxy(registry);
            }
        }
    }
}
```

### 4.3 注册 AnnotationAwareAspectJAutoProxyCreator

```java
public abstract class AopConfigUtils {
    
    public static BeanDefinition registerAspectJAnnotationAutoProxyCreatorIfNecessary(
            BeanDefinitionRegistry registry) {
        return registerAspectJAnnotationAutoProxyCreatorIfNecessary(registry, null);
    }
    
    public static BeanDefinition registerAspectJAnnotationAutoProxyCreatorIfNecessary(
            BeanDefinitionRegistry registry, @Nullable Object source) {
        
        return registerOrEscalateApcAsRequired(AnnotationAwareAspectJAutoProxyCreator.class, registry, source);
    }
    
    private static BeanDefinition registerOrEscalateApcAsRequired(
            Class<?> cls, BeanDefinitionRegistry registry, @Nullable Object source) {
        
        Assert.notNull(registry, "BeanDefinitionRegistry must not be null");
        
        // 如果已注册，检查优先级
        if (registry.containsBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME)) {
            BeanDefinition apcDefinition = registry.getBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME);
            if (!cls.getName().equals(apcDefinition.getBeanClassName())) {
                int currentPriority = findPriorityForClass(apcDefinition.getBeanClassName());
                int requiredPriority = findPriorityForClass(cls);
                if (currentPriority < requiredPriority) {
                    apcDefinition.setBeanClassName(cls.getName());
                }
            }
            return null;
        }
        
        // 注册 BeanDefinition
        RootBeanDefinition beanDefinition = new RootBeanDefinition(cls);
        beanDefinition.setSource(source);
        beanDefinition.getPropertyValues().add("order", Ordered.HIGHEST_PRECEDENCE);
        beanDefinition.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
        registry.registerBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME, beanDefinition);
        return beanDefinition;
    }
}
```

---

## 5. AnnotationAwareAspectJAutoProxyCreator

### 5.1 类继承体系

```
BeanPostProcessor
    │
    ├─ InstantiationAwareBeanPostProcessor
    │       │
    │       └─ SmartInstantiationAwareBeanPostProcessor
    │               │
    │               └─ AbstractAutoProxyCreator
    │                       │
    │                       ├─ AbstractAdvisorAutoProxyCreator
    │                       │       │
    │                       │       └─ AspectJAwareAdvisorAutoProxyCreator
    │                       │               │
    │                       │               └─ AnnotationAwareAspectJAutoProxyCreator
    │                       │
    │                       └─ BeanNameAutoProxyCreator
    │
    └─ ...
```

### 5.2 核心方法

```java
public class AnnotationAwareAspectJAutoProxyCreator extends AspectJAwareAdvisorAutoProxyCreator {
    
    @Nullable
    private List<Pattern> includePatterns;
    
    @Nullable
    private AspectJAdvisorFactory aspectJAdvisorFactory;
    
    @Nullable
    private BeanFactoryAspectJAdvisorsBuilder aspectJAdvisorsBuilder;
    
    @Override
    protected void initBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        super.initBeanFactory(beanFactory);
        
        if (this.aspectJAdvisorFactory == null) {
            this.aspectJAdvisorFactory = new ReflectiveAspectJAdvisorFactory(beanFactory);
        }
        
        this.aspectJAdvisorsBuilder =
            new BeanFactoryAspectJAdvisorsBuilderAdapter(beanFactory, this.aspectJAdvisorFactory);
    }
    
    /**
     * 查找所有 Advisor
     */
    @Override
    protected List<Advisor> findCandidateAdvisors() {
        // 1. 查找实现 Advisor 接口的 Bean
        List<Advisor> advisors = super.findCandidateAdvisors();
        
        // 2. 查找 @Aspect 注解的 Bean，构建 Advisor
        if (this.aspectJAdvisorsBuilder != null) {
            advisors.addAll(this.aspectJAdvisorsBuilder.buildAspectJAdvisors());
        }
        
        return advisors;
    }
    
    @Override
    protected boolean isInfrastructureClass(Class<?> beanClass) {
        // 基础设施类不需要代理
        return (super.isInfrastructureClass(beanClass) ||
            (this.aspectJAdvisorFactory != null && this.aspectJAdvisorFactory.isAspect(beanClass)));
    }
}
```

---

## 6. BeanFactoryAspectJAdvisorsBuilder

### 6.1 构建 Advisor

```java
public class BeanFactoryAspectJAdvisorsBuilder {
    
    private final ListableBeanFactory beanFactory;
    private final AspectJAdvisorFactory advisorFactory;
    
    @Nullable
    private volatile List<String> aspectBeanNames;
    
    private final Map<String, List<Advisor>> advisorsCache = new ConcurrentHashMap<>();
    
    private final Map<String, MetadataAwareAspectInstanceFactory> aspectFactoryCache = new ConcurrentHashMap<>();
    
    /**
     * 构建所有 @Aspect 注解的 Advisor
     */
    public List<Advisor> buildAspectJAdvisors() {
        List<String> aspectNames = this.aspectBeanNames;
        
        if (aspectNames == null) {
            synchronized (this) {
                aspectNames = this.aspectBeanNames;
                if (aspectNames == null) {
                    List<Advisor> advisors = new ArrayList<>();
                    aspectNames = new ArrayList<>();
                    
                    // 获取所有 Bean 名称
                    String[] beanNames = BeanFactoryUtils.beanNamesForTypeIncludingAncestors(
                        this.beanFactory, Object.class, true, false);
                    
                    for (String beanName : beanNames) {
                        if (!isEligibleBean(beanName)) {
                            continue;
                        }
                        
                        Class<?> beanType = this.beanFactory.getType(beanName);
                        if (beanType == null) {
                            continue;
                        }
                        
                        // 检查是否有 @Aspect 注解
                        if (this.advisorFactory.isAspect(beanType)) {
                            aspectNames.add(beanName);
                            
                            AspectMetadata amd = new AspectMetadata(beanType, beanName);
                            if (amd.getAjType().getPerClause().getKind() == PerClauseKind.SINGLETON) {
                                // 单例切面
                                MetadataAwareAspectInstanceFactory factory =
                                    new BeanFactoryAspectInstanceFactory(this.beanFactory, beanName);
                                
                                // 获取切面的所有 Advisor
                                List<Advisor> classAdvisors = this.advisorFactory.getAdvisors(factory);
                                
                                if (this.beanFactory.isSingleton(beanName)) {
                                    this.advisorsCache.put(beanName, classAdvisors);
                                } else {
                                    this.aspectFactoryCache.put(beanName, factory);
                                }
                                advisors.addAll(classAdvisors);
                            } else {
                                // 非单例切面
                                if (this.beanFactory.isSingleton(beanName)) {
                                    throw new IllegalArgumentException("Bean with name '" + beanName +
                                        "' is a singleton, but aspect instantiation model is not singleton");
                                }
                                MetadataAwareAspectInstanceFactory factory =
                                    new PrototypeAspectInstanceFactory(this.beanFactory, beanName);
                                this.aspectFactoryCache.put(beanName, factory);
                                advisors.addAll(this.advisorFactory.getAdvisors(factory));
                            }
                        }
                    }
                    this.aspectBeanNames = aspectNames;
                    return advisors;
                }
            }
        }
        
        if (aspectNames.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<Advisor> advisors = new ArrayList<>();
        for (String aspectName : aspectNames) {
            List<Advisor> cachedAdvisors = this.advisorsCache.get(aspectName);
            if (cachedAdvisors != null) {
                advisors.addAll(cachedAdvisors);
            } else {
                MetadataAwareAspectInstanceFactory factory = this.aspectFactoryCache.get(aspectName);
                advisors.addAll(this.advisorFactory.getAdvisors(factory));
            }
        }
        return advisors;
    }
}
```

---

## 7. ReflectiveAspectJAdvisorFactory

### 7.1 获取 Advisors

```java
public class ReflectiveAspectJAdvisorFactory extends AbstractAspectJAdvisorFactory implements Serializable {
    
    @Override
    public List<Advisor> getAdvisors(MetadataAwareAspectInstanceFactory aspectInstanceFactory) {
        Class<?> aspectClass = aspectInstanceFactory.getAspectMetadata().getAspectClass();
        String aspectName = aspectInstanceFactory.getAspectMetadata().getAspectName();
        validate(aspectClass);
        
        MetadataAwareAspectInstanceFactory lazySingletonAspectInstanceFactory =
            new LazySingletonAspectInstanceFactoryDecorator(aspectInstanceFactory);
        
        List<Advisor> advisors = new ArrayList<>();
        
        // 遍历切面类的所有方法（排除 @Pointcut 方法）
        for (Method method : getAdvisorMethods(aspectClass)) {
            // 为每个通知方法创建 Advisor
            Advisor advisor = getAdvisor(method, lazySingletonAspectInstanceFactory, advisors.size(), aspectName);
            if (advisor != null) {
                advisors.add(advisor);
            }
        }
        
        // 如果是延迟初始化切面且有 Advisor，添加合成的实例化 Advisor
        if (!advisors.isEmpty() && lazySingletonAspectInstanceFactory.getAspectMetadata().isLazilyInstantiated()) {
            Advisor instantiationAdvisor = new SyntheticInstantiationAdvisor(lazySingletonAspectInstanceFactory);
            advisors.add(0, instantiationAdvisor);
        }
        
        // 处理引介通知（@DeclareParents）
        for (Field field : aspectClass.getDeclaredFields()) {
            Advisor advisor = getDeclareParentsAdvisor(field);
            if (advisor != null) {
                advisors.add(advisor);
            }
        }
        
        return advisors;
    }
    
    @Override
    @Nullable
    public Advisor getAdvisor(Method candidateAdviceMethod, MetadataAwareAspectInstanceFactory aspectInstanceFactory,
            int declarationOrderInAspect, String aspectName) {
        
        validate(aspectInstanceFactory.getAspectMetadata().getAspectClass());
        
        // 获取切点表达式
        AspectJExpressionPointcut expressionPointcut = getPointcut(
            candidateAdviceMethod, aspectInstanceFactory.getAspectMetadata().getAspectClass());
        
        if (expressionPointcut == null) {
            return null;
        }
        
        // 创建 Advisor
        return new InstantiationModelAwarePointcutAdvisorImpl(expressionPointcut, candidateAdviceMethod,
            this, aspectInstanceFactory, declarationOrderInAspect, aspectName);
    }
    
    @Nullable
    private AspectJExpressionPointcut getPointcut(Method candidateAdviceMethod, Class<?> candidateAspectClass) {
        // 查找通知注解
        AspectJAnnotation<?> aspectJAnnotation =
            AbstractAspectJAdvisorFactory.findAspectJAnnotationOnMethod(candidateAdviceMethod);
        
        if (aspectJAnnotation == null) {
            return null;
        }
        
        // 创建切点
        AspectJExpressionPointcut ajexp =
            new AspectJExpressionPointcut(candidateAspectClass, new String[0], new Class<?>[0]);
        ajexp.setExpression(aspectJAnnotation.getPointcutExpression());
        
        if (this.beanFactory != null) {
            ajexp.setBeanFactory(this.beanFactory);
        }
        return ajexp;
    }
    
    /**
     * 查找通知注解
     */
    @Nullable
    protected static AspectJAnnotation<?> findAspectJAnnotationOnMethod(Method method) {
        // 按顺序查找注解
        for (Class<?> clazz : ASPECTJ_ANNOTATION_CLASSES) {
            AspectJAnnotation<?> foundAnnotation = findAnnotation(method, (Class<Annotation>) clazz);
            if (foundAnnotation != null) {
                return foundAnnotation;
            }
        }
        return null;
    }
    
    private static final Class<?>[] ASPECTJ_ANNOTATION_CLASSES = new Class<?>[] {
        Pointcut.class, Around.class, Before.class, After.class, AfterReturning.class, AfterThrowing.class
    };
}
```

---

## 8. 实际落地场景（工作实战）

### 场景 1：Web 接口日志记录

```java
@Aspect
@Component
public class WebLogAspect {
    private static final Logger log = LoggerFactory.getLogger(WebLogAspect.class);
    
    @Pointcut("@annotation(org.springframework.web.bind.annotation.RequestMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.GetMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PostMapping)")
    public void webLog() {}
    
    @Around("webLog()")
    public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        
        // 请求信息
        String url = request.getRequestURL().toString();
        String method = request.getMethod();
        String ip = request.getRemoteAddr();
        String classMethod = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();
        
        log.info("请求开始 URL:{} Method:{} IP:{} ClassMethod:{} Args:{}", 
            url, method, ip, classMethod, Arrays.toString(args));
        
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long cost = System.currentTimeMillis() - start;
        
        log.info("请求结束 URL:{} 耗时:{}ms 结果:{}", url, cost, result);
        
        return result;
    }
}
```

### 场景 2：分布式锁

```java
// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DistributedLock {
    String key();
    int timeout() default 10;
    TimeUnit timeUnit() default TimeUnit.SECONDS;
}

// 切面实现
@Aspect
@Component
public class DistributedLockAspect {
    
    @Autowired
    private RedissonClient redissonClient;
    
    @Around("@annotation(distributedLock)")
    public Object around(ProceedingJoinPoint joinPoint, DistributedLock distributedLock) throws Throwable {
        String lockKey = distributedLock.key();
        int timeout = distributedLock.timeout();
        TimeUnit timeUnit = distributedLock.timeUnit();
        
        RLock lock = redissonClient.getLock(lockKey);
        boolean acquired = lock.tryLock(timeout, timeUnit);
        
        if (!acquired) {
            throw new RuntimeException("获取锁失败: " + lockKey);
        }
        
        try {
            return joinPoint.proceed();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}

// 使用
@Service
public class OrderService {
    @DistributedLock(key = "'order:' + #orderId", timeout = 5)
    public void createOrder(Long orderId) {
        // 业务逻辑
    }
}
```

### 场景 3：接口幂等性

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    int timeout() default 10;
}

@Aspect
@Component
public class IdempotentAspect {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Around("@annotation(idempotent)")
    public Object around(ProceedingJoinPoint joinPoint, Idempotent idempotent) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String token = request.getHeader("Idempotent-Token");
        
        if (StringUtils.isEmpty(token)) {
            throw new RuntimeException("幂等性Token为空");
        }
        
        String key = "idempotent:" + token;
        Boolean success = redisTemplate.opsForValue().setIfAbsent(key, "1", idempotent.timeout(), TimeUnit.SECONDS);
        
        if (Boolean.FALSE.equals(success)) {
            throw new RuntimeException("请勿重复提交");
        }
        
        try {
            return joinPoint.proceed();
        } catch (Exception e) {
            // 失败时删除 Token，允许重试
            redisTemplate.delete(key);
            throw e;
        }
    }
}
```

---

## 9. 学习自检清单

- [ ] 能够使用 @AspectJ 注解定义切面
- [ ] 能够说出五种通知注解及其用法
- [ ] 能够定义和复用切点
- [ ] 能够获取方法参数和注解参数
- [ ] 能够解释 @EnableAspectJAutoProxy 的作用
- [ ] 能够说出 AnnotationAwareAspectJAutoProxyCreator 的工作原理

**学习建议**：
- **预计学习时长**：2.5 小时
- **重点难点**：Advisor 构建过程、切点表达式
- **实践建议**：
  - 实现日志、性能监控、权限检查切面
  - 调试 buildAspectJAdvisors() 方法
  - 分析 Advisor 的创建和匹配过程

---

## 10. 参考资料

**Spring 官方文档**：
- [@AspectJ support](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop-ataspectj)

**源码位置**：
- `org.springframework.aop.aspectj.annotation.AnnotationAwareAspectJAutoProxyCreator`
- `org.springframework.aop.aspectj.annotation.BeanFactoryAspectJAdvisorsBuilder`
- `org.springframework.aop.aspectj.annotation.ReflectiveAspectJAdvisorFactory`

---

**上一章** ← [第 10 章：动态代理实现原理](./content-10.md)  
**下一章** → [第 12 章：拦截器链执行流程](./content-12.md)  
**返回目录** → [学习大纲](../content-outline.md)

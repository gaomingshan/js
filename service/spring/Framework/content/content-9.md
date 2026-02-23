# 第 9 章：AOP 核心概念与架构

> **学习目标**：理解 AOP 的核心概念和 Spring AOP 的整体架构  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

### 1.1 什么是 AOP

**AOP（Aspect-Oriented Programming，面向切面编程）** 是一种编程范式，用于将**横切关注点**从业务逻辑中分离出来。

**横切关注点**：跨越多个模块的功能，如日志、事务、安全、性能监控等。

**传统方式的问题**：
```java
public class UserService {
    public void registerUser(User user) {
        // 日志
        logger.info("开始注册用户: " + user.getUsername());
        
        // 权限检查
        if (!SecurityContext.hasPermission("USER_REGISTER")) {
            throw new SecurityException("无权限");
        }
        
        // 事务开启
        TransactionManager.begin();
        try {
            // 核心业务逻辑
            userDao.save(user);
            emailService.sendWelcomeEmail(user);
            
            // 事务提交
            TransactionManager.commit();
        } catch (Exception e) {
            // 事务回滚
            TransactionManager.rollback();
            throw e;
        }
        
        // 日志
        logger.info("用户注册成功");
    }
}
```

**问题**：
- ❌ 业务逻辑被横切关注点代码淹没
- ❌ 代码重复（每个方法都要加日志、事务）
- ❌ 难以维护（修改日志格式需要改所有方法）

**AOP 方式**：
```java
@Service
public class UserService {
    @Transactional
    @LogExecutionTime
    @RequirePermission("USER_REGISTER")
    public void registerUser(User user) {
        // 纯业务逻辑
        userDao.save(user);
        emailService.sendWelcomeEmail(user);
    }
}
```

**优势**：
- ✅ 关注点分离
- ✅ 代码简洁
- ✅ 易于维护

---

## 2. AOP 核心术语

### 2.1 术语定义

```
┌─────────────────────────────────────────────────┐
│                  AOP 核心术语                     │
├─────────────────────────────────────────────────┤
│                                                  │
│ 1. 切面 (Aspect)                                 │
│    - 横切关注点的模块化                           │
│    - 包含切点 + 通知                              │
│    - 例如：日志切面、事务切面                      │
│                                                  │
│ 2. 连接点 (Join Point)                           │
│    - 程序执行的某个点                             │
│    - 方法调用、方法执行、异常处理等                │
│    - Spring AOP 只支持方法执行                   │
│                                                  │
│ 3. 切点 (Pointcut)                               │
│    - 匹配连接点的表达式                           │
│    - 定义在哪里应用通知                           │
│    - 例如：execution(* com.example.service.*.*(..))│
│                                                  │
│ 4. 通知 (Advice)                                 │
│    - 在切点执行的代码                             │
│    - 定义做什么、何时做                           │
│    - 类型：Before、After、Around、AfterReturning、AfterThrowing │
│                                                  │
│ 5. 目标对象 (Target Object)                      │
│    - 被通知的对象（被代理的对象）                  │
│    - 例如：UserService 实例                      │
│                                                  │
│ 6. AOP 代理 (AOP Proxy)                          │
│    - AOP 框架创建的对象                          │
│    - 用于实现切面契约                             │
│    - JDK 动态代理 或 CGLIB 代理                  │
│                                                  │
│ 7. 织入 (Weaving)                                │
│    - 将切面应用到目标对象的过程                    │
│    - 创建代理对象的过程                           │
│    - 时机：编译期、类加载期、运行期                │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 2.2 术语关系图

```
┌────────────────────────────────────────┐
│              Aspect (切面)              │
│  ┌──────────────────────────────────┐  │
│  │  Pointcut (切点)                  │  │
│  │  匹配哪些 Join Point              │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Advice (通知)                    │  │
│  │  在切点做什么                      │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         │
         │ 应用到
         ↓
┌────────────────────────────────────────┐
│       Target Object (目标对象)          │
│  ┌──────────────────────────────────┐  │
│  │  Join Point (连接点)              │  │
│  │  方法执行点                        │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
         │
         │ 织入 (Weaving)
         ↓
┌────────────────────────────────────────┐
│         AOP Proxy (代理对象)            │
│  增强后的对象                           │
└────────────────────────────────────────┘
```

### 2.3 通知类型

```java
@Aspect
@Component
public class LoggingAspect {
    
    // 1. Before：前置通知
    @Before("execution(* com.example.service.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("方法执行前: " + joinPoint.getSignature());
    }
    
    // 2. After：后置通知（finally）
    @After("execution(* com.example.service.*.*(..))")
    public void logAfter(JoinPoint joinPoint) {
        System.out.println("方法执行后: " + joinPoint.getSignature());
    }
    
    // 3. AfterReturning：返回后通知
    @AfterReturning(pointcut = "execution(* com.example.service.*.*(..))", 
                    returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        System.out.println("方法返回: " + result);
    }
    
    // 4. AfterThrowing：异常通知
    @AfterThrowing(pointcut = "execution(* com.example.service.*.*(..))", 
                   throwing = "error")
    public void logAfterThrowing(JoinPoint joinPoint, Throwable error) {
        System.out.println("方法异常: " + error);
    }
    
    // 5. Around：环绕通知（最强大）
    @Around("execution(* com.example.service.*.*(..))")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("方法执行前");
        
        try {
            Object result = joinPoint.proceed(); // 执行目标方法
            System.out.println("方法执行后");
            return result;
        } catch (Exception e) {
            System.out.println("方法异常");
            throw e;
        }
    }
}
```

**执行顺序**：
```
@Around 前半部分
    ↓
@Before
    ↓
目标方法执行
    ↓
@AfterReturning 或 @AfterThrowing
    ↓
@After
    ↓
@Around 后半部分
```

---

## 3. Spring AOP vs AspectJ

### 3.1 对比表

| 特性 | Spring AOP | AspectJ |
|------|-----------|---------|
| **实现方式** | 动态代理（运行时织入） | 字节码增强（编译期/类加载期织入） |
| **连接点** | 仅方法执行 | 方法、字段、构造器等 |
| **性能** | 略慢（代理开销） | 略快（直接修改字节码） |
| **配置** | 简单（基于注解/XML） | 复杂（需要 AspectJ 编译器） |
| **使用场景** | 企业应用（99%场景够用） | 需要字段、构造器切面 |
| **侵入性** | 低（只需注解） | 高（需要特殊编译器） |

### 3.2 Spring AOP 局限性

**只支持方法执行**：
```java
// Spring AOP 支持
@Around("execution(* com.example.service.*.*(..))")
public Object aroundMethod(ProceedingJoinPoint joinPoint) { }

// Spring AOP 不支持（需要 AspectJ）
@Around("set(* com.example.domain.User.name)")  // 字段修改
public Object aroundFieldSet(ProceedingJoinPoint joinPoint) { }

@Around("call(* com.example.service.*.*(..))")  // 方法调用
public Object aroundMethodCall(ProceedingJoinPoint joinPoint) { }
```

**只能代理 Spring Bean**：
```java
// 可以被代理（Spring 管理的 Bean）
@Service
public class UserService { }

// 不能被代理（非 Spring 管理）
public class SomeClass {
    public static void main(String[] args) {
        UserService service = new UserService(); // new 出来的对象不会被代理
    }
}
```

---

## 4. Spring AOP 架构

### 4.1 核心接口体系

```
AOP 联盟接口（org.aopalliance）
    │
    ├─ Advice (通知接口)
    │   ├─ BeforeAdvice
    │   │   └─ MethodBeforeAdvice
    │   ├─ AfterAdvice
    │   │   └─ AfterReturningAdvice
    │   │   └─ ThrowsAdvice
    │   └─ Interceptor (拦截器)
    │       └─ MethodInterceptor (方法拦截器)
    │
    └─ Joinpoint (连接点接口)
        └─ Invocation
            └─ MethodInvocation (方法调用)

Spring AOP 接口
    │
    ├─ Pointcut (切点接口)
    │   ├─ ClassFilter (类过滤器)
    │   └─ MethodMatcher (方法匹配器)
    │
    ├─ Advisor (通知器接口)
    │   ├─ PointcutAdvisor (切点通知器)
    │   └─ IntroductionAdvisor (引介通知器)
    │
    ├─ AopProxy (代理接口)
    │   ├─ JdkDynamicAopProxy (JDK 代理)
    │   └─ CglibAopProxy (CGLIB 代理)
    │
    └─ Advised (被通知对象接口)
        └─ ProxyConfig (代理配置)
```

### 4.2 类图

```
┌─────────────────────────────────────────┐
│          Advisor (通知器)                │
│  - Advice getAdvice()                   │
│  - boolean isPerInstance()              │
└─────────────────────────────────────────┘
              △
              │
    ┌─────────┴─────────┐
    │                   │
┌───────────────┐  ┌───────────────────┐
│PointcutAdvisor│  │IntroductionAdvisor│
│- Pointcut     │  │- ClassFilter      │
│  getPointcut()│  │  getClassFilter() │
└───────────────┘  └───────────────────┘
    △
    │
┌───────────────────────────┐
│ AspectJPointcutAdvisor    │
│ - AbstractAspectJAdvice   │
│ - AspectJExpressionPointcut│
└───────────────────────────┘
```

### 4.3 核心组件

**1. Advice（通知）**

```java
// AOP 联盟接口
public interface Advice {
    // 标记接口
}

// 方法拦截器（最常用）
@FunctionalInterface
public interface MethodInterceptor extends Interceptor {
    Object invoke(MethodInvocation invocation) throws Throwable;
}

// 前置通知
public interface MethodBeforeAdvice extends BeforeAdvice {
    void before(Method method, Object[] args, Object target) throws Throwable;
}

// 返回后通知
public interface AfterReturningAdvice extends AfterAdvice {
    void afterReturning(Object returnValue, Method method, Object[] args, Object target) throws Throwable;
}

// 异常通知
public interface ThrowsAdvice extends AfterAdvice {
    // 标记接口，具体方法由反射调用
}
```

**2. Pointcut（切点）**

```java
public interface Pointcut {
    /**
     * 类过滤器：匹配类
     */
    ClassFilter getClassFilter();
    
    /**
     * 方法匹配器：匹配方法
     */
    MethodMatcher getMethodMatcher();
    
    /**
     * 始终匹配的切点
     */
    Pointcut TRUE = TruePointcut.INSTANCE;
}

// 类过滤器
@FunctionalInterface
public interface ClassFilter {
    boolean matches(Class<?> clazz);
    
    ClassFilter TRUE = TrueClassFilter.INSTANCE;
}

// 方法匹配器
public interface MethodMatcher {
    /**
     * 静态匹配：编译时检查
     */
    boolean matches(Method method, Class<?> targetClass);
    
    /**
     * 是否需要运行时检查
     */
    boolean isRuntime();
    
    /**
     * 动态匹配：运行时检查（带参数）
     */
    boolean matches(Method method, Class<?> targetClass, Object... args);
    
    MethodMatcher TRUE = TrueMethodMatcher.INSTANCE;
}
```

**3. Advisor（通知器）**

```java
// 顶层接口
public interface Advisor {
    Advice getAdvice();
    boolean isPerInstance();
}

// 切点通知器
public interface PointcutAdvisor extends Advisor {
    Pointcut getPointcut();
}

// 默认实现
public class DefaultPointcutAdvisor extends AbstractGenericPointcutAdvisor implements Serializable {
    private Pointcut pointcut = Pointcut.TRUE;
    
    public DefaultPointcutAdvisor() {
    }
    
    public DefaultPointcutAdvisor(Advice advice) {
        this(Pointcut.TRUE, advice);
    }
    
    public DefaultPointcutAdvisor(Pointcut pointcut, Advice advice) {
        this.pointcut = pointcut;
        setAdvice(advice);
    }
    
    public void setPointcut(Pointcut pointcut) {
        this.pointcut = (pointcut != null ? pointcut : Pointcut.TRUE);
    }
    
    public Pointcut getPointcut() {
        return this.pointcut;
    }
}
```

---

## 5. 切点表达式

### 5.1 execution 表达式

**语法**：
```
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern? 
          name-pattern(param-pattern) throws-pattern?)
```

**示例**：

```java
// 1. 匹配所有 public 方法
execution(public * *(..))

// 2. 匹配所有以 set 开头的方法
execution(* set*(..))

// 3. 匹配 UserService 类的所有方法
execution(* com.example.service.UserService.*(..))

// 4. 匹配 service 包下所有类的所有方法
execution(* com.example.service.*.*(..))

// 5. 匹配 service 包及其子包下所有类的所有方法
execution(* com.example.service..*.*(..))

// 6. 匹配第一个参数为 String 的方法
execution(* *(String, ..))

// 7. 匹配返回值为 void 的方法
execution(void *(..))

// 8. 匹配抛出 Exception 的方法
execution(* *(..) throws Exception)
```

### 5.2 其他切点表达式

```java
// 1. within：匹配类型
@Pointcut("within(com.example.service.*)")  // service 包下的类
@Pointcut("within(com.example.service..*)")  // service 包及子包下的类

// 2. this：代理对象类型
@Pointcut("this(com.example.service.UserService)")  // 代理对象是 UserService 类型

// 3. target：目标对象类型
@Pointcut("target(com.example.service.UserService)")  // 目标对象是 UserService 类型

// 4. args：方法参数类型
@Pointcut("args(String, int)")  // 方法参数是 (String, int)

// 5. @annotation：方法注解
@Pointcut("@annotation(com.example.annotation.LogExecutionTime)")  // 带 @LogExecutionTime 注解的方法

// 6. @within：类注解
@Pointcut("@within(org.springframework.stereotype.Service)")  // 带 @Service 注解的类

// 7. @target：目标对象类注解
@Pointcut("@target(org.springframework.stereotype.Repository)")  // 目标对象的类带 @Repository 注解

// 8. @args：方法参数注解
@Pointcut("@args(com.example.annotation.Validated)")  // 方法参数带 @Validated 注解

// 9. bean：Spring Bean 名称
@Pointcut("bean(userService)")  // Bean 名称为 userService
@Pointcut("bean(*Service)")  // Bean 名称以 Service 结尾
```

### 5.3 组合切点表达式

```java
@Aspect
@Component
public class CombinedPointcuts {
    
    // 定义可复用的切点
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceLayer() {}
    
    @Pointcut("execution(* com.example.repository.*.*(..))")
    public void repositoryLayer() {}
    
    @Pointcut("@annotation(org.springframework.transaction.annotation.Transactional)")
    public void transactionalMethod() {}
    
    // 组合：&&（与）
    @Pointcut("serviceLayer() && transactionalMethod()")
    public void transactionalServiceOperation() {}
    
    // 组合：||（或）
    @Pointcut("serviceLayer() || repositoryLayer()")
    public void dataAccessOperation() {}
    
    // 组合：!（非）
    @Pointcut("serviceLayer() && !within(com.example.service.internal.*)")
    public void publicServiceOperation() {}
    
    // 使用组合切点
    @Around("transactionalServiceOperation()")
    public Object aroundTransactionalService(ProceedingJoinPoint joinPoint) throws Throwable {
        // ...
        return joinPoint.proceed();
    }
}
```

---

## 6. 实际落地场景（工作实战）

### 场景 1：统一日志记录

```java
@Aspect
@Component
public class LoggingAspect {
    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);
    
    @Pointcut("execution(* com.example.service..*(..))")
    public void serviceLayer() {}
    
    @Around("serviceLayer()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        log.info("开始执行: {}.{}({})", className, methodName, Arrays.toString(args));
        
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long cost = System.currentTimeMillis() - start;
            log.info("执行成功: {}.{} 耗时{}ms", className, methodName, cost);
            return result;
        } catch (Exception e) {
            log.error("执行异常: {}.{}", className, methodName, e);
            throw e;
        }
    }
}
```

### 场景 2：接口性能监控

```java
@Aspect
@Component
public class PerformanceMonitorAspect {
    
    @Around("@annotation(com.example.annotation.PerformanceMonitor)")
    public Object monitor(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long cost = System.currentTimeMillis() - start;
        
        // 超过阈值告警
        if (cost > 1000) {
            sendAlert("慢方法告警: " + methodName + " 耗时 " + cost + "ms");
        }
        
        // 记录到监控系统
        MetricsCollector.recordMethodDuration(methodName, cost);
        
        return result;
    }
}

// 使用
@Service
public class OrderService {
    @PerformanceMonitor
    public Order createOrder(Order order) {
        // ...
    }
}
```

### 场景 3：权限检查

```java
// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String value();
}

// 切面
@Aspect
@Component
public class PermissionAspect {
    
    @Around("@annotation(requirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequirePermission requirePermission) 
            throws Throwable {
        String permission = requirePermission.value();
        
        // 获取当前用户
        User currentUser = SecurityContext.getCurrentUser();
        
        // 检查权限
        if (!currentUser.hasPermission(permission)) {
            throw new SecurityException("无权限: " + permission);
        }
        
        return joinPoint.proceed();
    }
}

// 使用
@Service
public class UserService {
    @RequirePermission("user:delete")
    public void deleteUser(Long userId) {
        userDao.deleteById(userId);
    }
}
```

---

## 7. 学习自检清单

- [ ] 能够解释 AOP 的核心概念
- [ ] 能够说出 AOP 术语及其关系
- [ ] 能够区分 Spring AOP 和 AspectJ
- [ ] 能够编写切点表达式
- [ ] 能够说出五种通知类型及其执行顺序
- [ ] 能够使用 AOP 实现横切关注点

**学习建议**：
- **预计学习时长**：2 小时
- **重点难点**：AOP 术语、切点表达式
- **前置知识**：代理模式
- **实践建议**：
  - 实现日志、性能监控切面
  - 练习切点表达式
  - 对比不同通知类型

---

## 8. 参考资料

**Spring 官方文档**：
- [Aspect Oriented Programming with Spring](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop)

**AspectJ 文档**：
- [AspectJ Programming Guide](https://www.eclipse.org/aspectj/doc/released/progguide/index.html)

---

**上一章** ← [第 8 章：循环依赖解决机制](./content-8.md)  
**下一章** → [第 10 章：动态代理实现原理](./content-10.md)  
**返回目录** → [学习大纲](../content-outline.md)

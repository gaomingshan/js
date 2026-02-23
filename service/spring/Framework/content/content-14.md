# 第 14 章：@Transactional 实现原理

> **学习目标**：深入理解 @Transactional 注解的解析和 AOP 拦截机制  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐⭐ 高级  
> **源码入口**：`TransactionInterceptor.invoke()`

---

## 1. 核心概念

`@Transactional` 是 Spring 提供的**声明式事务管理**注解，基于 **AOP** 实现。

**工作流程**：
```
@Transactional 方法调用
    ↓
AOP 代理拦截
    ↓
TransactionInterceptor.invoke()
    ↓
开启事务 → 执行方法 → 提交/回滚事务
```

---

## 2. @Transactional 注解定义

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Transactional {
    
    /**
     * 事务管理器限定符
     */
    @AliasFor("transactionManager")
    String value() default "";
    
    @AliasFor("value")
    String transactionManager() default "";
    
    /**
     * 事务传播行为
     */
    Propagation propagation() default Propagation.REQUIRED;
    
    /**
     * 事务隔离级别
     */
    Isolation isolation() default Isolation.DEFAULT;
    
    /**
     * 超时时间（秒）
     */
    int timeout() default TransactionDefinition.TIMEOUT_DEFAULT;
    
    /**
     * 是否只读
     */
    boolean readOnly() default false;
    
    /**
     * 遇到哪些异常回滚（默认 RuntimeException 和 Error）
     */
    Class<? extends Throwable>[] rollbackFor() default {};
    
    /**
     * 遇到哪些异常回滚（异常类名）
     */
    String[] rollbackForClassName() default {};
    
    /**
     * 遇到哪些异常不回滚
     */
    Class<? extends Throwable>[] noRollbackFor() default {};
    
    /**
     * 遇到哪些异常不回滚（异常类名）
     */
    String[] noRollbackForClassName() default {};
}
```

---

## 3. @EnableTransactionManagement

### 3.1 注解定义

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(TransactionManagementConfigurationSelector.class)
public @interface EnableTransactionManagement {
    
    /**
     * 是否使用 CGLIB 代理
     */
    boolean proxyTargetClass() default false;
    
    /**
     * 通知模式：PROXY（代理）或 ASPECTJ
     */
    AdviceMode mode() default AdviceMode.PROXY;
    
    /**
     * 事务 Advisor 的顺序
     */
    int order() default Ordered.LOWEST_PRECEDENCE;
}
```

### 3.2 TransactionManagementConfigurationSelector

```java
public class TransactionManagementConfigurationSelector extends AdviceModeImportSelector<EnableTransactionManagement> {
    
    @Override
    protected String[] selectImports(AdviceMode adviceMode) {
        switch (adviceMode) {
            case PROXY:
                return new String[] {
                    AutoProxyRegistrar.class.getName(),
                    ProxyTransactionManagementConfiguration.class.getName()
                };
            case ASPECTJ:
                return new String[] {determineTransactionAspectClass()};
            default:
                return null;
        }
    }
}
```

### 3.3 ProxyTransactionManagementConfiguration

```java
@Configuration(proxyBeanMethods = false)
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public class ProxyTransactionManagementConfiguration extends AbstractTransactionManagementConfiguration {
    
    /**
     * 注册事务 Advisor
     */
    @Bean(name = TransactionManagementConfigUtils.TRANSACTION_ADVISOR_BEAN_NAME)
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    public BeanFactoryTransactionAttributeSourceAdvisor transactionAdvisor(
            TransactionAttributeSource transactionAttributeSource,
            TransactionInterceptor transactionInterceptor) {
        
        BeanFactoryTransactionAttributeSourceAdvisor advisor = new BeanFactoryTransactionAttributeSourceAdvisor();
        advisor.setTransactionAttributeSource(transactionAttributeSource);
        advisor.setAdvice(transactionInterceptor);
        
        if (this.enableTx != null) {
            advisor.setOrder(this.enableTx.<Integer>getNumber("order"));
        }
        return advisor;
    }
    
    /**
     * 注册事务属性源
     */
    @Bean
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    public TransactionAttributeSource transactionAttributeSource() {
        return new AnnotationTransactionAttributeSource();
    }
    
    /**
     * 注册事务拦截器
     */
    @Bean
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    public TransactionInterceptor transactionInterceptor(
            TransactionAttributeSource transactionAttributeSource) {
        
        TransactionInterceptor interceptor = new TransactionInterceptor();
        interceptor.setTransactionAttributeSource(transactionAttributeSource);
        
        if (this.txManager != null) {
            interceptor.setTransactionManager(this.txManager);
        }
        return interceptor;
    }
}
```

---

## 4. AnnotationTransactionAttributeSource

### 4.1 解析 @Transactional 注解

```java
public class AnnotationTransactionAttributeSource extends AbstractFallbackTransactionAttributeSource
        implements Serializable {
    
    private final Set<TransactionAnnotationParser> annotationParsers;
    
    public AnnotationTransactionAttributeSource() {
        this(true);
    }
    
    public AnnotationTransactionAttributeSource(boolean publicMethodsOnly) {
        this.publicMethodsOnly = publicMethodsOnly;
        
        if (jta12Present || ejb3Present) {
            this.annotationParsers = new LinkedHashSet<>(4);
            this.annotationParsers.add(new SpringTransactionAnnotationParser());
            if (jta12Present) {
                this.annotationParsers.add(new JtaTransactionAnnotationParser());
            }
            if (ejb3Present) {
                this.annotationParsers.add(new Ejb3TransactionAnnotationParser());
            }
        } else {
            this.annotationParsers = Collections.singleton(new SpringTransactionAnnotationParser());
        }
    }
    
    @Override
    @Nullable
    protected TransactionAttribute findTransactionAttribute(Class<?> clazz) {
        return determineTransactionAttribute(clazz);
    }
    
    @Override
    @Nullable
    protected TransactionAttribute findTransactionAttribute(Method method) {
        return determineTransactionAttribute(method);
    }
    
    @Nullable
    protected TransactionAttribute determineTransactionAttribute(AnnotatedElement element) {
        for (TransactionAnnotationParser parser : this.annotationParsers) {
            TransactionAttribute attr = parser.parseTransactionAnnotation(element);
            if (attr != null) {
                return attr;
            }
        }
        return null;
    }
}
```

### 4.2 SpringTransactionAnnotationParser

```java
public class SpringTransactionAnnotationParser implements TransactionAnnotationParser, Serializable {
    
    @Override
    @Nullable
    public TransactionAttribute parseTransactionAnnotation(AnnotatedElement element) {
        AnnotationAttributes attributes = AnnotatedElementUtils.findMergedAnnotationAttributes(
            element, Transactional.class, false, false);
        
        if (attributes != null) {
            return parseTransactionAnnotation(attributes);
        } else {
            return null;
        }
    }
    
    public TransactionAttribute parseTransactionAnnotation(Transactional ann) {
        return parseTransactionAnnotation(AnnotationUtils.getAnnotationAttributes(ann, false, false));
    }
    
    protected TransactionAttribute parseTransactionAnnotation(AnnotationAttributes attributes) {
        RuleBasedTransactionAttribute rbta = new RuleBasedTransactionAttribute();
        
        // 传播行为
        Propagation propagation = attributes.getEnum("propagation");
        rbta.setPropagationBehavior(propagation.value());
        
        // 隔离级别
        Isolation isolation = attributes.getEnum("isolation");
        rbta.setIsolationLevel(isolation.value());
        
        // 超时时间
        rbta.setTimeout(attributes.getNumber("timeout").intValue());
        
        // 只读
        rbta.setReadOnly(attributes.getBoolean("readOnly"));
        
        // 事务管理器
        rbta.setQualifier(attributes.getString("value"));
        
        // 回滚规则
        List<RollbackRuleAttribute> rollbackRules = new ArrayList<>();
        
        for (Class<?> rbClass : attributes.getClassArray("rollbackFor")) {
            rollbackRules.add(new RollbackRuleAttribute(rbClass));
        }
        for (String rbClassName : attributes.getStringArray("rollbackForClassName")) {
            rollbackRules.add(new RollbackRuleAttribute(rbClassName));
        }
        for (Class<?> rbClass : attributes.getClassArray("noRollbackFor")) {
            rollbackRules.add(new NoRollbackRuleAttribute(rbClass));
        }
        for (String rbClassName : attributes.getStringArray("noRollbackForClassName")) {
            rollbackRules.add(new NoRollbackRuleAttribute(rbClassName));
        }
        
        rbta.setRollbackRules(rollbackRules);
        
        return rbta;
    }
}
```

---

## 5. TransactionInterceptor

### 5.1 核心实现

```java
public class TransactionInterceptor extends TransactionAspectSupport implements MethodInterceptor, Serializable {
    
    public TransactionInterceptor() {
    }
    
    public TransactionInterceptor(PlatformTransactionManager ptm, TransactionAttributeSource tas) {
        setTransactionManager(ptm);
        setTransactionAttributeSource(tas);
    }
    
    /**
     * AOP 拦截器方法
     */
    @Override
    @Nullable
    public Object invoke(MethodInvocation invocation) throws Throwable {
        // 获取目标类
        Class<?> targetClass = (invocation.getThis() != null ? AopUtils.getTargetClass(invocation.getThis()) : null);
        
        // 调用父类方法，执行事务逻辑
        return invokeWithinTransaction(invocation.getMethod(), targetClass, invocation::proceed);
    }
}
```

### 5.2 TransactionAspectSupport.invokeWithinTransaction()

```java
public abstract class TransactionAspectSupport implements BeanFactoryAware, InitializingBean {
    
    @Nullable
    protected Object invokeWithinTransaction(Method method, @Nullable Class<?> targetClass,
            final InvocationCallback invocation) throws Throwable {
        
        // 1. 获取事务属性源
        TransactionAttributeSource tas = getTransactionAttributeSource();
        
        // 2. 获取事务属性
        final TransactionAttribute txAttr = (tas != null ? tas.getTransactionAttribute(method, targetClass) : null);
        
        // 3. 确定事务管理器
        final PlatformTransactionManager tm = determineTransactionManager(txAttr);
        
        // 4. 构建方法标识（用于日志）
        final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);
        
        // 5. 声明式事务处理
        if (txAttr == null || !(tm instanceof CallbackPreferringPlatformTransactionManager)) {
            // 5.1 创建事务（如果需要）
            TransactionInfo txInfo = createTransactionIfNecessary(tm, txAttr, joinpointIdentification);
            
            Object retVal;
            try {
                // 5.2 执行业务方法
                retVal = invocation.proceedWithInvocation();
            } catch (Throwable ex) {
                // 5.3 异常处理：回滚或提交
                completeTransactionAfterThrowing(txInfo, ex);
                throw ex;
            } finally {
                // 5.4 清理事务信息
                cleanupTransactionInfo(txInfo);
            }
            
            // 5.5 提交事务
            commitTransactionAfterReturning(txInfo);
            return retVal;
        } else {
            // 6. 编程式事务处理（CallbackPreferringPlatformTransactionManager）
            final ThrowableHolder throwableHolder = new ThrowableHolder();
            
            try {
                Object result = ((CallbackPreferringPlatformTransactionManager) tm).execute(txAttr, status -> {
                    TransactionInfo txInfo = prepareTransactionInfo(tm, txAttr, joinpointIdentification, status);
                    try {
                        return invocation.proceedWithInvocation();
                    } catch (Throwable ex) {
                        if (txAttr.rollbackOn(ex)) {
                            if (ex instanceof RuntimeException) {
                                throw (RuntimeException) ex;
                            } else {
                                throw new ThrowableHolderException(ex);
                            }
                        } else {
                            throwableHolder.throwable = ex;
                            return null;
                        }
                    } finally {
                        cleanupTransactionInfo(txInfo);
                    }
                });
                
                if (throwableHolder.throwable != null) {
                    throw throwableHolder.throwable;
                }
                return result;
            } catch (ThrowableHolderException ex) {
                throw ex.getCause();
            } catch (TransactionSystemException ex2) {
                if (throwableHolder.throwable != null) {
                    ex2.initApplicationException(throwableHolder.throwable);
                }
                throw ex2;
            } catch (Throwable ex2) {
                if (throwableHolder.throwable != null) {
                    throw throwableHolder.throwable;
                }
                throw ex2;
            }
        }
    }
    
    /**
     * 创建事务（如果需要）
     */
    @SuppressWarnings("serial")
    protected TransactionInfo createTransactionIfNecessary(@Nullable PlatformTransactionManager tm,
            @Nullable TransactionAttribute txAttr, final String joinpointIdentification) {
        
        if (txAttr != null && txAttr.getName() == null) {
            txAttr = new DelegatingTransactionAttribute(txAttr) {
                @Override
                public String getName() {
                    return joinpointIdentification;
                }
            };
        }
        
        TransactionStatus status = null;
        if (txAttr != null) {
            if (tm != null) {
                // 获取事务
                status = tm.getTransaction(txAttr);
            }
        }
        
        // 准备事务信息
        return prepareTransactionInfo(tm, txAttr, joinpointIdentification, status);
    }
    
    /**
     * 异常后处理：回滚或提交
     */
    protected void completeTransactionAfterThrowing(@Nullable TransactionInfo txInfo, Throwable ex) {
        if (txInfo != null && txInfo.getTransactionStatus() != null) {
            if (txInfo.transactionAttribute != null && txInfo.transactionAttribute.rollbackOn(ex)) {
                try {
                    // 回滚事务
                    txInfo.getTransactionManager().rollback(txInfo.getTransactionStatus());
                } catch (TransactionSystemException ex2) {
                    ex2.initApplicationException(ex);
                    throw ex2;
                } catch (RuntimeException | Error ex2) {
                    throw ex2;
                }
            } else {
                try {
                    // 提交事务
                    txInfo.getTransactionManager().commit(txInfo.getTransactionStatus());
                } catch (TransactionSystemException ex2) {
                    ex2.initApplicationException(ex);
                    throw ex2;
                } catch (RuntimeException | Error ex2) {
                    throw ex2;
                }
            }
        }
    }
    
    /**
     * 正常返回后提交事务
     */
    protected void commitTransactionAfterReturning(@Nullable TransactionInfo txInfo) {
        if (txInfo != null && txInfo.getTransactionStatus() != null) {
            txInfo.getTransactionManager().commit(txInfo.getTransactionStatus());
        }
    }
}
```

---

## 6. 事务执行流程图

```
@Transactional 方法调用
    ↓
TransactionInterceptor.invoke()
    ↓
invokeWithinTransaction()
    │
    ├─> 1. 获取事务属性（@Transactional 注解解析）
    │      └─> TransactionAttributeSource.getTransactionAttribute()
    │
    ├─> 2. 确定事务管理器
    │      └─> determineTransactionManager()
    │
    ├─> 3. 创建事务（如果需要）
    │      └─> createTransactionIfNecessary()
    │             └─> PlatformTransactionManager.getTransaction()
    │                    ├─> 判断是否已存在事务
    │                    ├─> 根据传播行为处理
    │                    ├─> 开启新事务
    │                    │      ├─> 获取数据库连接
    │                    │      ├─> 设置隔离级别
    │                    │      ├─> 关闭自动提交
    │                    │      └─> 绑定连接到 ThreadLocal
    │                    └─> 返回 TransactionStatus
    │
    ├─> 4. 执行业务方法
    │      └─> invocation.proceed()
    │
    ├─> 5. 异常处理
    │      └─> completeTransactionAfterThrowing()
    │             ├─> 判断是否需要回滚
    │             │      └─> rollbackOn(exception)
    │             ├─> 需要回滚 → rollback()
    │             └─> 不需要回滚 → commit()
    │
    ├─> 6. 提交事务
    │      └─> commitTransactionAfterReturning()
    │             └─> PlatformTransactionManager.commit()
    │                    ├─> 提交数据库事务
    │                    ├─> 执行同步回调
    │                    └─> 清理资源
    │
    └─> 7. 清理事务信息
           └─> cleanupTransactionInfo()
```

---

## 7. 回滚规则

### 7.1 默认回滚规则

```java
// 默认：RuntimeException 和 Error 回滚
public abstract class DefaultTransactionAttribute extends DefaultTransactionDefinition 
        implements TransactionAttribute {
    
    @Override
    public boolean rollbackOn(Throwable ex) {
        return (ex instanceof RuntimeException || ex instanceof Error);
    }
}
```

### 7.2 自定义回滚规则

```java
@Service
public class UserService {
    
    // 1. 回滚指定异常
    @Transactional(rollbackFor = Exception.class)
    public void save(User user) throws Exception {
        // 所有 Exception（包括 Checked Exception）都回滚
    }
    
    // 2. 不回滚指定异常
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void update(User user) {
        // IllegalArgumentException 不回滚
    }
    
    // 3. 组合规则
    @Transactional(
        rollbackFor = Exception.class,
        noRollbackFor = {IllegalArgumentException.class, IllegalStateException.class}
    )
    public void delete(Long id) throws Exception {
        // Exception 回滚，但 IllegalArgumentException 和 IllegalStateException 除外
    }
}
```

### 7.3 RuleBasedTransactionAttribute

```java
public class RuleBasedTransactionAttribute extends DefaultTransactionAttribute implements Serializable {
    
    @Nullable
    private List<RollbackRuleAttribute> rollbackRules;
    
    @Override
    public boolean rollbackOn(Throwable ex) {
        RollbackRuleAttribute winner = null;
        int deepest = Integer.MAX_VALUE;
        
        if (this.rollbackRules != null) {
            for (RollbackRuleAttribute rule : this.rollbackRules) {
                int depth = rule.getDepth(ex);
                if (depth >= 0 && depth < deepest) {
                    deepest = depth;
                    winner = rule;
                }
            }
        }
        
        // 如果有匹配的规则
        if (winner == null) {
            // 使用默认规则
            return super.rollbackOn(ex);
        }
        
        // NoRollbackRuleAttribute 表示不回滚
        return !(winner instanceof NoRollbackRuleAttribute);
    }
}
```

---

## 8. 实际落地场景（工作实战）

### 场景 1：@Transactional 失效问题

```java
@Service
public class UserService {
    
    // 问题1：内部调用，事务失效
    public void publicMethod() {
        // 直接调用，不经过代理
        this.transactionalMethod();  // ❌ 事务失效
    }
    
    @Transactional
    public void transactionalMethod() {
        // ...
    }
    
    // 解决方案1：注入自己
    @Autowired
    private UserService self;
    
    public void publicMethodFixed() {
        // 通过代理调用
        self.transactionalMethod();  // ✅ 事务生效
    }
    
    // 解决方案2：使用 AopContext
    @EnableAspectJAutoProxy(exposeProxy = true)
    public void publicMethodFixed2() {
        UserService proxy = (UserService) AopContext.currentProxy();
        proxy.transactionalMethod();  // ✅ 事务生效
    }
    
    // 问题2：方法不是 public，事务失效
    @Transactional
    protected void protectedMethod() {  // ❌ 事务失效
        // ...
    }
    
    // 解决方案：改为 public
    @Transactional
    public void publicMethodFixed3() {  // ✅ 事务生效
        // ...
    }
    
    // 问题3：异常被捕获，事务失效
    @Transactional
    public void catchException() {
        try {
            // 业务逻辑
        } catch (Exception e) {
            // 异常被捕获，事务不会回滚  // ❌
        }
    }
    
    // 解决方案：手动设置回滚
    @Transactional
    public void catchExceptionFixed() {
        try {
            // 业务逻辑
        } catch (Exception e) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();  // ✅
            // 或重新抛出异常
            throw e;
        }
    }
}
```

### 场景 2：事务超时处理

```java
@Service
public class OrderService {
    
    @Transactional(timeout = 5)  // 超时5秒
    public void processLargeOrder(Order order) {
        // 长时间处理
        // 超时后抛出 TransactionTimedOutException
    }
}
```

### 场景 3：只读事务优化

```java
@Service
public class UserService {
    
    @Transactional(readOnly = true)
    public List<User> findAll() {
        // 只读事务，可以优化数据库性能
        // - MySQL：设置为只读模式
        // - Hibernate：不进行脏检查
        return userDao.findAll();
    }
}
```

---

## 9. 面试准备专项

### 高频面试题：@Transactional 如何实现的？

**第一层（基础回答 - 60分）**：
@Transactional 基于 AOP 实现，通过代理拦截方法调用，在方法执行前开启事务，执行后提交或回滚事务。

**第二层（深入原理 - 80分）**：
实现流程：

1. **启用事务管理**：@EnableTransactionManagement 导入配置类
2. **注册核心组件**：
   - BeanFactoryTransactionAttributeSourceAdvisor（Advisor）
   - TransactionInterceptor（Advice）
   - AnnotationTransactionAttributeSource（解析注解）
3. **AOP 代理创建**：AbstractAutoProxyCreator 为 @Transactional 标注的类创建代理
4. **方法拦截**：TransactionInterceptor.invoke() 拦截方法调用
5. **事务管理**：
   - 开启事务：PlatformTransactionManager.getTransaction()
   - 执行方法：invocation.proceed()
   - 提交/回滚：commit() / rollback()

**第三层（扩展延伸 - 95分）**：
从源码角度详细说明：

**核心方法：TransactionAspectSupport.invokeWithinTransaction()**

```java
invokeWithinTransaction() 流程：
1. 获取事务属性（TransactionAttributeSource）
2. 确定事务管理器（PlatformTransactionManager）
3. 创建事务（createTransactionIfNecessary）
4. 执行业务方法（proceed）
5. 异常处理（completeTransactionAfterThrowing）
6. 提交事务（commitTransactionAfterReturning）
7. 清理资源（cleanupTransactionInfo）
```

**追问应对**：

**追问 1：@Transactional 为什么会失效？**
- 内部调用：不经过代理
- 方法非 public：JDK 代理限制
- 异常被捕获：未抛出到拦截器
- 异常类型不匹配：默认只回滚 RuntimeException

**追问 2：如何解决内部调用失效问题？**
- 注入自己：通过代理调用
- 使用 AopContext.currentProxy()
- 拆分成两个类

**加分项**：
- 能说出事务失效的所有场景
- 能解释回滚规则的匹配机制
- 能说出事务超时的实现原理

---

## 10. 学习自检清单

- [ ] 能够解释 @Transactional 的实现原理
- [ ] 能够说出 @EnableTransactionManagement 做了什么
- [ ] 能够说出 TransactionInterceptor 的执行流程
- [ ] 能够配置自定义回滚规则
- [ ] 能够解决 @Transactional 失效问题
- [ ] 能够说出只读事务的优化原理

**学习建议**：
- **预计学习时长**：3 小时
- **重点难点**：AOP 代理、事务拦截流程
- **前置知识**：AOP、事务管理架构
- **实践建议**：
  - 调试 TransactionInterceptor.invoke()
  - 构造事务失效场景并解决
  - 分析回滚规则匹配逻辑

---

## 11. 参考资料

**Spring 官方文档**：
- [Declarative Transaction Management](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction-declarative)

**源码位置**：
- `org.springframework.transaction.interceptor.TransactionInterceptor`
- `org.springframework.transaction.interceptor.TransactionAspectSupport`
- `org.springframework.transaction.annotation.AnnotationTransactionAttributeSource`

---

**上一章** ← [第 13 章：事务管理架构设计](./content-13.md)  
**下一章** → [第 15 章：事务传播行为详解](./content-15.md)  
**返回目录** → [学习大纲](../content-outline.md)

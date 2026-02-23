# 第 10 章：动态代理实现原理

> **学习目标**：深入理解 JDK 动态代理和 CGLIB 代理的实现原理及选择策略  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐⭐ 高级  
> **源码入口**：`DefaultAopProxyFactory.createAopProxy()`

---

## 1. 核心概念

Spring AOP 基于**动态代理**实现，支持两种代理方式：

1. **JDK 动态代理**：基于接口
2. **CGLIB 代理**：基于子类继承

```
目标对象 (Target)
    │
    │ 代理
    ↓
┌─────────────────────────┐
│   JDK 动态代理           │  ← 目标对象实现接口
│   - 基于接口             │
│   - java.lang.reflect   │
└─────────────────────────┘
         OR
┌─────────────────────────┐
│   CGLIB 代理             │  ← 目标对象是类
│   - 基于继承             │
│   - net.sf.cglib        │
└─────────────────────────┘
```

---

## 2. JDK 动态代理

### 2.1 基本原理

JDK 动态代理通过 `java.lang.reflect.Proxy` 类在**运行时**动态生成代理类。

**核心 API**：
```java
public class Proxy implements java.io.Serializable {
    /**
     * 创建代理实例
     * @param loader 类加载器
     * @param interfaces 代理接口数组
     * @param h 调用处理器
     */
    public static Object newProxyInstance(ClassLoader loader,
                                          Class<?>[] interfaces,
                                          InvocationHandler h);
}

@FunctionalInterface
public interface InvocationHandler {
    /**
     * 代理方法调用
     * @param proxy 代理对象
     * @param method 调用的方法
     * @param args 方法参数
     */
    Object invoke(Object proxy, Method method, Object[] args) throws Throwable;
}
```

### 2.2 示例代码

```java
// 1. 定义接口
public interface UserService {
    void addUser(String username);
    String getUser(Long id);
}

// 2. 实现类
public class UserServiceImpl implements UserService {
    @Override
    public void addUser(String username) {
        System.out.println("添加用户: " + username);
    }
    
    @Override
    public String getUser(Long id) {
        return "User-" + id;
    }
}

// 3. 调用处理器
public class LoggingInvocationHandler implements InvocationHandler {
    private final Object target;
    
    public LoggingInvocationHandler(Object target) {
        this.target = target;
    }
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("调用前: " + method.getName());
        
        // 调用目标方法
        Object result = method.invoke(target, args);
        
        System.out.println("调用后: " + method.getName());
        return result;
    }
}

// 4. 创建代理
public class JdkProxyDemo {
    public static void main(String[] args) {
        UserService target = new UserServiceImpl();
        
        UserService proxy = (UserService) Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            new LoggingInvocationHandler(target)
        );
        
        proxy.addUser("张三");
        // 输出：
        // 调用前: addUser
        // 添加用户: 张三
        // 调用后: addUser
    }
}
```

### 2.3 生成的代理类

JDK 动态代理会在运行时生成类似这样的代理类：

```java
// $Proxy0 (动态生成，简化版)
public final class $Proxy0 extends Proxy implements UserService {
    private static Method m3; // addUser 方法
    private static Method m4; // getUser 方法
    
    static {
        try {
            m3 = Class.forName("UserService").getMethod("addUser", new Class[]{String.class});
            m4 = Class.forName("UserService").getMethod("getUser", new Class[]{Long.class});
        } catch (Exception e) {
            throw new NoSuchMethodError(e.getMessage());
        }
    }
    
    public $Proxy0(InvocationHandler h) {
        super(h);
    }
    
    @Override
    public void addUser(String username) {
        try {
            // 调用 InvocationHandler.invoke()
            this.h.invoke(this, m3, new Object[]{username});
        } catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
    
    @Override
    public String getUser(Long id) {
        try {
            return (String) this.h.invoke(this, m4, new Object[]{id});
        } catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
}
```

### 2.4 保存生成的代理类

```java
// 设置系统属性，保存生成的代理类到文件
System.setProperty("sun.misc.ProxyGenerator.saveGeneratedFiles", "true");
// 或 JDK 8+
System.setProperty("jdk.proxy.ProxyGenerator.saveGeneratedFiles", "true");
```

---

## 3. CGLIB 代理

### 3.1 基本原理

CGLIB（Code Generation Library）通过**继承目标类**生成子类，重写方法来实现代理。

**核心组件**：
```java
// 1. Enhancer：代理生成器
Enhancer enhancer = new Enhancer();
enhancer.setSuperclass(targetClass);
enhancer.setCallback(callback);
Object proxy = enhancer.create();

// 2. Callback：方法拦截器
public interface MethodInterceptor extends Callback {
    Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) 
        throws Throwable;
}
```

### 3.2 示例代码

```java
// 1. 目标类（无需接口）
public class UserService {
    public void addUser(String username) {
        System.out.println("添加用户: " + username);
    }
    
    public String getUser(Long id) {
        return "User-" + id;
    }
}

// 2. 方法拦截器
public class LoggingMethodInterceptor implements MethodInterceptor {
    @Override
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) 
            throws Throwable {
        System.out.println("调用前: " + method.getName());
        
        // 调用父类方法
        Object result = proxy.invokeSuper(obj, args);
        
        System.out.println("调用后: " + method.getName());
        return result;
    }
}

// 3. 创建代理
public class CglibProxyDemo {
    public static void main(String[] args) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(UserService.class);
        enhancer.setCallback(new LoggingMethodInterceptor());
        
        UserService proxy = (UserService) enhancer.create();
        
        proxy.addUser("张三");
        // 输出：
        // 调用前: addUser
        // 添加用户: 张三
        // 调用后: addUser
    }
}
```

### 3.3 生成的代理类

CGLIB 生成的代理类大致结构：

```java
// UserService$$EnhancerByCGLIB$$12345678 (简化版)
public class UserService$$EnhancerByCGLIB$$12345678 extends UserService {
    private MethodInterceptor callback;
    
    @Override
    public void addUser(String username) {
        MethodInterceptor tmp = this.callback;
        if (tmp != null) {
            try {
                // 调用拦截器
                tmp.intercept(this, 
                    CGLIB$addUser$0$Method, 
                    new Object[]{username}, 
                    CGLIB$addUser$0$Proxy);
            } catch (Throwable e) {
                throw new UndeclaredThrowableException(e);
            }
        } else {
            super.addUser(username);
        }
    }
    
    // 原始方法引用
    private static final Method CGLIB$addUser$0$Method;
    
    // 方法代理（用于调用父类方法）
    private static final MethodProxy CGLIB$addUser$0$Proxy;
    
    static {
        CGLIB$addUser$0$Method = ReflectUtils.findMethods(
            new String[]{"addUser", "(Ljava/lang/String;)V"},
            UserService.class.getDeclaredMethods())[0];
        
        CGLIB$addUser$0$Proxy = MethodProxy.create(
            UserService.class,
            UserService$$EnhancerByCGLIB$$12345678.class,
            "(Ljava/lang/String;)V",
            "addUser",
            "CGLIB$addUser$0");
    }
}
```

---

## 4. JDK vs CGLIB 对比

### 4.1 对比表

| 特性 | JDK 动态代理 | CGLIB 代理 |
|------|-------------|-----------|
| **前提条件** | 目标对象必须实现接口 | 目标对象是类（可以无接口） |
| **实现方式** | 实现接口 | 继承目标类 |
| **代理类** | `$Proxy0` | `Target$$EnhancerByCGLIB$$xxx` |
| **性能（创建）** | 快 | 慢（字节码生成） |
| **性能（调用）** | 慢（反射） | 快（直接调用） |
| **final 方法** | ✅ 支持 | ❌ 不支持（无法重写） |
| **final 类** | N/A | ❌ 不支持（无法继承） |
| **私有方法** | N/A | ❌ 不支持（无法重写） |
| **依赖** | JDK 自带 | 需要 cglib 库 |

### 4.2 性能对比

**创建代理性能**：
- JDK：快（直接生成字节码）
- CGLIB：慢（需要分析类结构）

**方法调用性能**：
- JDK：慢（反射调用 `Method.invoke()`）
- CGLIB：快（FastClass 机制，避免反射）

**实测数据（百万次调用）**：
```
JDK 动态代理：
- 创建耗时：~5ms
- 调用耗时：~300ms

CGLIB 代理：
- 创建耗时：~50ms
- 调用耗时：~100ms
```

**结论**：
- 一次性代理 → JDK（创建快）
- 频繁调用 → CGLIB（调用快）
- Spring 默认策略：有接口用 JDK，无接口用 CGLIB

---

## 5. Spring AOP 代理选择

### 5.1 DefaultAopProxyFactory

```java
public class DefaultAopProxyFactory implements AopProxyFactory, Serializable {
    
    @Override
    public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException {
        // 1. 判断是否强制使用 CGLIB
        if (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config)) {
            Class<?> targetClass = config.getTargetClass();
            if (targetClass == null) {
                throw new AopConfigException("TargetSource cannot determine target class: " +
                    "Either an interface or a target is required for proxy creation.");
            }
            
            // 2. 如果目标类是接口 或 已经是 JDK 代理，使用 JDK 代理
            if (targetClass.isInterface() || Proxy.isProxyClass(targetClass)) {
                return new JdkDynamicAopProxy(config);
            }
            
            // 3. 否则使用 CGLIB 代理
            return new ObjenesisCglibAopProxy(config);
        } else {
            // 4. 默认使用 JDK 代理（有接口）
            return new JdkDynamicAopProxy(config);
        }
    }
    
    private boolean hasNoUserSuppliedProxyInterfaces(AdvisedSupport config) {
        Class<?>[] ifcs = config.getProxiedInterfaces();
        return (ifcs.length == 0 || (ifcs.length == 1 && SpringProxy.class.isAssignableFrom(ifcs[0])));
    }
}
```

### 5.2 选择策略

```
Spring AOP 代理选择流程：
    │
    ├─> 1. 配置了 proxyTargetClass=true？
    │      └─> 是 → CGLIB
    │
    ├─> 2. 配置了 optimize=true？
    │      └─> 是 → CGLIB
    │
    ├─> 3. 目标类没有实现接口？
    │      └─> 是 → CGLIB
    │
    └─> 4. 默认 → JDK 动态代理
```

### 5.3 配置方式

**Spring Boot**：
```properties
# application.properties
# 强制使用 CGLIB
spring.aop.proxy-target-class=true
```

**Spring XML**：
```xml
<!-- 启用 CGLIB -->
<aop:config proxy-target-class="true">
    <!-- ... -->
</aop:config>

<!-- 或 -->
<aop:aspectj-autoproxy proxy-target-class="true"/>
```

**Spring Java Config**：
```java
@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class AopConfig {
}
```

---

## 6. JdkDynamicAopProxy 源码分析

### 6.1 核心实现

```java
final class JdkDynamicAopProxy implements AopProxy, InvocationHandler, Serializable {
    
    /** AdvisedSupport 配置 */
    private final AdvisedSupport advised;
    
    public JdkDynamicAopProxy(AdvisedSupport config) throws AopConfigException {
        Assert.notNull(config, "AdvisedSupport must not be null");
        if (config.getAdvisors().length == 0 && config.getTargetSource() == AdvisedSupport.EMPTY_TARGET_SOURCE) {
            throw new AopConfigException("No advisors and no TargetSource specified");
        }
        this.advised = config;
    }
    
    @Override
    public Object getProxy() {
        return getProxy(ClassUtils.getDefaultClassLoader());
    }
    
    @Override
    public Object getProxy(@Nullable ClassLoader classLoader) {
        Class<?>[] proxiedInterfaces = AopProxyUtils.completeProxiedInterfaces(this.advised, true);
        findDefinedEqualsAndHashCodeMethods(proxiedInterfaces);
        
        // 创建 JDK 代理
        return Proxy.newProxyInstance(classLoader, proxiedInterfaces, this);
    }
    
    /**
     * InvocationHandler 实现：处理代理方法调用
     */
    @Override
    @Nullable
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Object oldProxy = null;
        boolean setProxyContext = false;
        
        TargetSource targetSource = this.advised.targetSource;
        Object target = null;
        
        try {
            // 1. equals 方法处理
            if (!this.equalsDefined && AopUtils.isEqualsMethod(method)) {
                return equals(args[0]);
            }
            // 2. hashCode 方法处理
            else if (!this.hashCodeDefined && AopUtils.isHashCodeMethod(method)) {
                return hashCode();
            }
            // 3. DecoratingProxy 接口方法
            else if (method.getDeclaringClass() == DecoratingProxy.class) {
                return AopProxyUtils.ultimateTargetClass(this.advised);
            }
            // 4. Advised 接口方法（直接调用配置对象）
            else if (!this.advised.opaque && method.getDeclaringClass().isInterface() &&
                    method.getDeclaringClass().isAssignableFrom(Advised.class)) {
                return AopUtils.invokeJoinpointUsingReflection(this.advised, method, args);
            }
            
            Object retVal;
            
            // 5. 是否暴露代理对象到 ThreadLocal
            if (this.advised.exposeProxy) {
                oldProxy = AopContext.setCurrentProxy(proxy);
                setProxyContext = true;
            }
            
            // 6. 获取目标对象
            target = targetSource.getTarget();
            Class<?> targetClass = (target != null ? target.getClass() : null);
            
            // 7. 获取拦截器链
            List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
            
            // 8. 如果没有拦截器，直接调用目标方法
            if (chain.isEmpty()) {
                Object[] argsToUse = AopProxyUtils.adaptArgumentsIfNecessary(method, args);
                retVal = AopUtils.invokeJoinpointUsingReflection(target, method, argsToUse);
            } else {
                // 9. 创建方法调用对象，执行拦截器链
                MethodInvocation invocation =
                    new ReflectiveMethodInvocation(proxy, target, method, args, targetClass, chain);
                
                // 执行拦截器链
                retVal = invocation.proceed();
            }
            
            // 10. 处理返回值
            Class<?> returnType = method.getReturnType();
            if (retVal != null && retVal == target &&
                    returnType != Object.class && returnType.isInstance(proxy) &&
                    !RawTargetAccess.class.isAssignableFrom(method.getDeclaringClass())) {
                retVal = proxy;
            } else if (retVal == null && returnType != Void.TYPE && returnType.isPrimitive()) {
                throw new AopInvocationException(
                    "Null return value from advice does not match primitive return type for: " + method);
            }
            return retVal;
        } finally {
            if (target != null && !targetSource.isStatic()) {
                targetSource.releaseTarget(target);
            }
            if (setProxyContext) {
                AopContext.setCurrentProxy(oldProxy);
            }
        }
    }
}
```

### 6.2 关键流程

```
invoke() 方法执行流程：
    │
    ├─> 1. 特殊方法处理（equals、hashCode、Advised 接口）
    │
    ├─> 2. 暴露代理到 ThreadLocal（如果需要）
    │
    ├─> 3. 获取目标对象
    │
    ├─> 4. 获取拦截器链
    │      └─> advised.getInterceptorsAndDynamicInterceptionAdvice()
    │
    ├─> 5. 判断拦截器链是否为空
    │      ├─> 空 → 直接反射调用目标方法
    │      └─> 非空 → 创建 ReflectiveMethodInvocation
    │                  └─> invocation.proceed()
    │                         └─> 递归执行拦截器链
    │
    └─> 6. 处理返回值
```

---

## 7. CglibAopProxy 源码分析

### 7.1 核心实现

```java
class CglibAopProxy implements AopProxy, Serializable {
    
    private final AdvisedSupport advised;
    
    @Override
    public Object getProxy() {
        return getProxy(null);
    }
    
    @Override
    public Object getProxy(@Nullable ClassLoader classLoader) {
        try {
            Class<?> rootClass = this.advised.getTargetClass();
            Assert.state(rootClass != null, "Target class must be available for creating a CGLIB proxy");
            
            Class<?> proxySuperClass = rootClass;
            if (rootClass.getName().contains(ClassUtils.CGLIB_CLASS_SEPARATOR)) {
                proxySuperClass = rootClass.getSuperclass();
                Class<?>[] additionalInterfaces = rootClass.getInterfaces();
                for (Class<?> additionalInterface : additionalInterfaces) {
                    this.advised.addInterface(additionalInterface);
                }
            }
            
            // 验证 final 方法
            validateClassIfNecessary(proxySuperClass, classLoader);
            
            // 创建 Enhancer
            Enhancer enhancer = createEnhancer();
            if (classLoader != null) {
                enhancer.setClassLoader(classLoader);
                if (classLoader instanceof SmartClassLoader &&
                        ((SmartClassLoader) classLoader).isClassReloadable(proxySuperClass)) {
                    enhancer.setUseCache(false);
                }
            }
            
            // 设置父类
            enhancer.setSuperclass(proxySuperClass);
            
            // 设置接口
            enhancer.setInterfaces(AopProxyUtils.completeProxiedInterfaces(this.advised));
            
            // 设置命名策略
            enhancer.setNamingPolicy(SpringNamingPolicy.INSTANCE);
            
            // 设置策略（包括 CallbackFilter）
            enhancer.setStrategy(new ClassLoaderAwareGeneratorStrategy(classLoader));
            
            // 获取 Callback
            Callback[] callbacks = getCallbacks(rootClass);
            Class<?>[] types = new Class<?>[callbacks.length];
            for (int x = 0; x < types.length; x++) {
                types[x] = callbacks[x].getClass();
            }
            
            // 设置 CallbackFilter（根据方法选择 Callback）
            enhancer.setCallbackFilter(new ProxyCallbackFilter(
                this.advised.getConfigurationOnlyCopy(), this.fixedInterceptorMap, this.fixedInterceptorOffset));
            enhancer.setCallbackTypes(types);
            
            // 创建代理对象
            return createProxyClassAndInstance(enhancer, callbacks);
        } catch (CodeGenerationException | IllegalArgumentException ex) {
            throw new AopConfigException("Could not generate CGLIB subclass of " + this.advised.getTargetClass() +
                ": Common causes of this problem include using a final class or a non-visible class",
                ex);
        } catch (Throwable ex) {
            throw new AopConfigException("Unexpected AOP exception", ex);
        }
    }
    
    private Callback[] getCallbacks(Class<?> rootClass) throws Exception {
        // 性能优化：暴露代理
        boolean exposeProxy = this.advised.isExposeProxy();
        boolean isFrozen = this.advised.isFrozen();
        boolean isStatic = this.advised.getTargetSource().isStatic();
        
        // 核心拦截器：DynamicAdvisedInterceptor
        Callback aopInterceptor = new DynamicAdvisedInterceptor(this.advised);
        
        // 目标拦截器（无通知时使用）
        Callback targetInterceptor;
        if (exposeProxy) {
            targetInterceptor = (isStatic ?
                new StaticUnadvisedExposedInterceptor(this.advised.getTargetSource().getTarget()) :
                new DynamicUnadvisedExposedInterceptor(this.advised.getTargetSource()));
        } else {
            targetInterceptor = (isStatic ?
                new StaticUnadvisedInterceptor(this.advised.getTargetSource().getTarget()) :
                new DynamicUnadvisedInterceptor(this.advised.getTargetSource()));
        }
        
        // 固定链拦截器
        Callback targetDispatcher = (isStatic ?
            new StaticDispatcher(this.advised.getTargetSource().getTarget()) : new SerializableNoOp());
        
        Callback[] mainCallbacks = new Callback[] {
            aopInterceptor,  // 0: 用于有通知的方法
            targetInterceptor,  // 1: 用于无通知的方法
            new SerializableNoOp(),  // 2: 用于映射到 this 的方法
            targetDispatcher,  // 3: 用于 advised 接口方法
            this.advisedDispatcher,  // 4: 用于 equals/hashCode
            new EqualsInterceptor(this.advised),  // 5
            new HashCodeInterceptor(this.advised)  // 6
        };
        
        Callback[] callbacks;
        
        // 如果目标是静态的且通知链是冻结的，优化为固定链拦截器
        if (isStatic && isFrozen) {
            Method[] methods = rootClass.getMethods();
            Callback[] fixedCallbacks = new Callback[methods.length];
            this.fixedInterceptorMap = new HashMap<>(methods.length);
            
            for (int x = 0; x < methods.length; x++) {
                Method method = methods[x];
                List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, rootClass);
                fixedCallbacks[x] = new FixedChainStaticTargetInterceptor(
                    chain, this.advised.getTargetSource().getTarget(), this.advised.getTargetClass());
                this.fixedInterceptorMap.put(method, x);
            }
            
            callbacks = new Callback[mainCallbacks.length + fixedCallbacks.length];
            System.arraycopy(mainCallbacks, 0, callbacks, 0, mainCallbacks.length);
            System.arraycopy(fixedCallbacks, 0, callbacks, mainCallbacks.length, fixedCallbacks.length);
            this.fixedInterceptorOffset = mainCallbacks.length;
        } else {
            callbacks = mainCallbacks;
        }
        return callbacks;
    }
    
    /**
     * DynamicAdvisedInterceptor：核心拦截器
     */
    private static class DynamicAdvisedInterceptor implements MethodInterceptor, Serializable {
        private final AdvisedSupport advised;
        
        public DynamicAdvisedInterceptor(AdvisedSupport advised) {
            this.advised = advised;
        }
        
        @Override
        @Nullable
        public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) 
                throws Throwable {
            Object oldProxy = null;
            boolean setProxyContext = false;
            Object target = null;
            TargetSource targetSource = this.advised.getTargetSource();
            
            try {
                if (this.advised.exposeProxy) {
                    oldProxy = AopContext.setCurrentProxy(proxy);
                    setProxyContext = true;
                }
                
                target = targetSource.getTarget();
                Class<?> targetClass = (target != null ? target.getClass() : null);
                
                // 获取拦截器链
                List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
                
                Object retVal;
                
                // 如果没有拦截器且方法是 public，使用 MethodProxy 调用（更快）
                if (chain.isEmpty() && Modifier.isPublic(method.getModifiers())) {
                    Object[] argsToUse = AopProxyUtils.adaptArgumentsIfNecessary(method, args);
                    retVal = methodProxy.invoke(target, argsToUse);
                } else {
                    // 创建方法调用对象，执行拦截器链
                    retVal = new CglibMethodInvocation(proxy, target, method, args, targetClass, chain, methodProxy)
                        .proceed();
                }
                
                retVal = processReturnType(proxy, target, method, retVal);
                return retVal;
            } finally {
                if (target != null && !targetSource.isStatic()) {
                    targetSource.releaseTarget(target);
                }
                if (setProxyContext) {
                    AopContext.setCurrentProxy(oldProxy);
                }
            }
        }
    }
}
```

---

## 8. 实际落地场景（工作实战）

### 场景 1：强制使用 CGLIB 代理

```java
// 问题：目标类实现了接口，但需要访问类特有的方法
public interface UserService {
    void save(User user);
}

@Service
public class UserServiceImpl implements UserService {
    @Override
    public void save(User user) {
        // ...
    }
    
    // 类特有方法（接口中没有）
    public void internalMethod() {
        // ...
    }
}

// 配置强制使用 CGLIB
@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class AopConfig {
}

// 现在可以调用 internalMethod
@Autowired
private UserServiceImpl userService;  // 注入实现类

userService.internalMethod();  // ✅ 成功
```

### 场景 2：处理 final 方法

```java
// CGLIB 无法代理 final 方法
@Service
public class OrderService {
    public final void processOrder(Order order) {  // final 方法
        // ...
    }
}

// AOP 无法拦截 final 方法
@Aspect
@Component
public class LoggingAspect {
    @Before("execution(* com.example.service.OrderService.processOrder(..))")
    public void logBefore() {
        System.out.println("不会执行");  // ❌ 不会被调用
    }
}

// 解决方案：去掉 final 修饰符
```

### 场景 3：获取原始目标对象

```java
// 从代理对象获取原始目标对象
@Service
public class ProxyUtils {
    public static <T> T getTargetObject(Object proxy) throws Exception {
        if (AopUtils.isAopProxy(proxy)) {
            if (AopUtils.isJdkDynamicProxy(proxy)) {
                // JDK 代理
                return (T) ((Advised) proxy).getTargetSource().getTarget();
            } else if (AopUtils.isCglibProxy(proxy)) {
                // CGLIB 代理
                return (T) ((Advised) proxy).getTargetSource().getTarget();
            }
        }
        return (T) proxy;
    }
}

// 使用
@Autowired
private UserService userService;  // 代理对象

UserServiceImpl target = ProxyUtils.getTargetObject(userService);  // 原始对象
```

---

## 9. 学习自检清单

- [ ] 能够解释 JDK 动态代理和 CGLIB 代理的区别
- [ ] 能够手写 JDK 动态代理示例
- [ ] 能够说出 Spring AOP 的代理选择策略
- [ ] 能够配置强制使用 CGLIB 代理
- [ ] 能够解释两种代理方式的性能差异
- [ ] 能够识别 CGLIB 代理的局限性（final 类/方法）

**学习建议**：
- **预计学习时长**：3 小时
- **重点难点**：代理生成原理、拦截器链执行
- **前置知识**：AOP 核心概念、代理模式
- **实践建议**：
  - 调试 JdkDynamicAopProxy.invoke()
  - 调试 CglibAopProxy.DynamicAdvisedInterceptor.intercept()
  - 对比两种代理的字节码

---

## 10. 参考资料

**JDK 动态代理**：
- [java.lang.reflect.Proxy API](https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/Proxy.html)

**CGLIB**：
- [CGLIB GitHub](https://github.com/cglib/cglib)

**Spring 源码**：
- `org.springframework.aop.framework.DefaultAopProxyFactory`
- `org.springframework.aop.framework.JdkDynamicAopProxy`
- `org.springframework.aop.framework.CglibAopProxy`

---

**上一章** ← [第 9 章：AOP 核心概念与架构](./content-9.md)  
**下一章** → [第 11 章：@AspectJ 注解实现](./content-11.md)  
**返回目录** → [学习大纲](../content-outline.md)

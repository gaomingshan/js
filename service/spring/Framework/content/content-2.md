# 第 2 章：Spring 核心设计模式详解

> **学习目标**：掌握 Spring 中应用的核心设计模式，理解为什么这样设计以及解决了什么问题  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

设计模式是软件开发中经过验证的最佳实践。Spring Framework 大量应用了设计模式，不是为了炫技，而是为了解决实际问题：**可扩展性**、**可维护性**、**松耦合**。

本章重点分析 Spring 中最核心的 6 种设计模式：

1. **工厂模式** - BeanFactory 体系
2. **单例模式** - Bean 单例管理
3. **代理模式** - AOP 动态代理
4. **模板方法模式** - JdbcTemplate、TransactionTemplate
5. **策略模式** - 资源加载、实例化策略
6. **观察者模式** - 事件发布订阅

---

## 2. 工厂模式：BeanFactory 体系

### 2.1 设计目标与解决的问题

**问题背景**：
- 对象创建逻辑复杂（依赖注入、初始化、AOP 代理）
- 需要统一管理对象的创建和生命周期
- 客户端不应该关心对象如何创建

**工厂模式的作用**：
- 封装对象创建逻辑
- 客户端通过接口获取对象，不直接 new
- 便于替换实现、扩展功能

### 2.2 技术架构与类图结构

```
┌─────────────────────────────────────────────┐
│            BeanFactory (工厂接口)            │
│  + getBean(String name): Object             │
│  + getBean(Class<T> type): T                │
│  + containsBean(String name): boolean       │
└─────────────────────────────────────────────┘
                     △
                     │ 继承
                     │
┌─────────────────────────────────────────────┐
│      ListableBeanFactory (可列举)           │
│  + getBeanDefinitionNames(): String[]       │
│  + getBeansOfType(Class<T>): Map<String, T> │
└─────────────────────────────────────────────┘
                     △
                     │
┌─────────────────────────────────────────────┐
│   ConfigurableBeanFactory (可配置)          │
│  + addBeanPostProcessor(...)                │
│  + setParentBeanFactory(...)                │
└─────────────────────────────────────────────┘
                     △
                     │
┌─────────────────────────────────────────────┐
│  DefaultListableBeanFactory (默认实现)      │
│  - beanDefinitionMap: Map<String, BD>       │
│  - singletonObjects: Map<String, Object>    │
│  + registerBeanDefinition(...)              │
│  + createBean(...)                          │
└─────────────────────────────────────────────┘
```

### 2.3 核心类/接口详解

#### BeanFactory - 顶层工厂接口

```java
public interface BeanFactory {
    // 根据名称获取 Bean
    Object getBean(String name) throws BeansException;
    
    // 根据类型获取 Bean
    <T> T getBean(Class<T> requiredType) throws BeansException;
    
    // 根据名称和类型获取 Bean
    <T> T getBean(String name, Class<T> requiredType) throws BeansException;
    
    // 是否包含指定 Bean
    boolean containsBean(String name);
    
    // 是否单例
    boolean isSingleton(String name) throws NoSuchBeanDefinitionException;
    
    // 是否原型
    boolean isPrototype(String name) throws NoSuchBeanDefinitionException;
}
```

**设计意图**：
- 定义工厂的基本能力：获取 Bean、判断是否存在
- 面向接口编程，隐藏实现细节
- 遵循单一职责原则：只负责 Bean 的获取

#### DefaultListableBeanFactory - 默认实现

```java
public class DefaultListableBeanFactory extends AbstractAutowireCapableBeanFactory
        implements ConfigurableListableBeanFactory, BeanDefinitionRegistry {
    
    // Bean 定义注册表（存储 Bean 的元数据）
    private final Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>(256);
    
    // Bean 定义名称列表
    private volatile List<String> beanDefinitionNames = new ArrayList<>(256);
    
    // 注册 Bean 定义
    @Override
    public void registerBeanDefinition(String beanName, BeanDefinition beanDefinition) {
        this.beanDefinitionMap.put(beanName, beanDefinition);
        this.beanDefinitionNames.add(beanName);
    }
    
    // 创建 Bean（核心方法）
    @Override
    protected Object createBean(String beanName, RootBeanDefinition mbd, Object[] args) {
        // 1. 实例化前处理
        Object bean = resolveBeforeInstantiation(beanName, mbd);
        if (bean != null) {
            return bean;
        }
        
        // 2. 创建 Bean 实例
        Object beanInstance = doCreateBean(beanName, mbd, args);
        return beanInstance;
    }
}
```

### 2.4 源码实现原理与执行流程

**Bean 创建完整流程**：

```
getBean(beanName)
    │
    ├─> 1. 从单例缓存获取（已创建直接返回）
    │       getSingleton(beanName)
    │
    ├─> 2. 未找到，开始创建流程
    │       createBean(beanName)
    │           │
    │           ├─> 2.1 实例化前处理
    │           │       InstantiationAwareBeanPostProcessor.postProcessBeforeInstantiation()
    │           │
    │           ├─> 2.2 实例化（反射创建对象）
    │           │       instantiateBean() / autowireConstructor()
    │           │
    │           ├─> 2.3 属性填充（依赖注入）
    │           │       populateBean()
    │           │
    │           ├─> 2.4 初始化
    │           │       initializeBean()
    │           │           ├─> Aware 接口回调
    │           │           ├─> BeanPostProcessor.postProcessBeforeInitialization()
    │           │           ├─> InitializingBean.afterPropertiesSet()
    │           │           └─> BeanPostProcessor.postProcessAfterInitialization()
    │           │
    │           └─> 2.5 注册销毁回调
    │
    └─> 3. 放入单例缓存
            addSingleton(beanName, bean)
```

**关键源码片段**：

```java
// AbstractBeanFactory.doGetBean() - 获取 Bean 的核心逻辑
protected <T> T doGetBean(String name, Class<T> requiredType, Object[] args, boolean typeCheckOnly) {
    // 1. 转换 Bean 名称（处理别名、&前缀）
    String beanName = transformedBeanName(name);
    Object bean;
    
    // 2. 尝试从单例缓存获取
    Object sharedInstance = getSingleton(beanName);
    if (sharedInstance != null && args == null) {
        bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
    } else {
        // 3. 检查循环依赖（prototype 作用域不支持）
        if (isPrototypeCurrentlyInCreation(beanName)) {
            throw new BeanCurrentlyInCreationException(beanName);
        }
        
        // 4. 检查父容器
        BeanFactory parentBeanFactory = getParentBeanFactory();
        if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
            return parentBeanFactory.getBean(name, requiredType);
        }
        
        // 5. 获取 Bean 定义
        RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
        
        // 6. 处理依赖（depends-on）
        String[] dependsOn = mbd.getDependsOn();
        if (dependsOn != null) {
            for (String dep : dependsOn) {
                getBean(dep); // 递归创建依赖
            }
        }
        
        // 7. 创建 Bean
        if (mbd.isSingleton()) {
            sharedInstance = getSingleton(beanName, () -> {
                return createBean(beanName, mbd, args);
            });
            bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
        } else if (mbd.isPrototype()) {
            Object prototypeInstance = createBean(beanName, mbd, args);
            bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
        }
    }
    
    // 8. 类型转换
    return adaptBeanInstance(name, bean, requiredType);
}
```

### 2.5 为什么这样设计

**设计原则**：
1. **开闭原则**：对扩展开放（可以自定义 BeanFactory），对修改关闭
2. **单一职责**：BeanFactory 只负责 Bean 获取，Bean 创建委托给 AbstractAutowireCapableBeanFactory
3. **依赖倒置**：依赖抽象接口 BeanFactory，而非具体实现

**解决的问题**：
- 统一对象创建入口
- 支持懒加载（首次使用时创建）
- 支持作用域管理（单例、原型）
- 支持生命周期回调

---

## 3. 单例模式：Bean 单例管理

### 3.1 设计目标与解决的问题

**问题背景**：
- 某些对象全局只需一个实例（Service、DAO）
- 频繁创建对象浪费资源
- 需要保证线程安全

**单例模式的作用**：
- 全局唯一实例
- 延迟加载
- 线程安全

### 3.2 Spring 单例实现原理

#### 单例注册表

```java
public class DefaultSingletonBeanRegistry {
    // 一级缓存：单例对象缓存（完整对象）
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);
    
    // 二级缓存：早期单例对象缓存（未完成初始化）
    private final Map<String, Object> earlySingletonObjects = new HashMap<>(16);
    
    // 三级缓存：单例工厂缓存
    private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);
    
    // 正在创建的 Bean 集合
    private final Set<String> singletonsCurrentlyInCreation = 
        Collections.newSetFromMap(new ConcurrentHashMap<>(16));
    
    // 获取单例
    public Object getSingleton(String beanName) {
        return getSingleton(beanName, true);
    }
    
    protected Object getSingleton(String beanName, boolean allowEarlyReference) {
        // 1. 从一级缓存获取
        Object singletonObject = this.singletonObjects.get(beanName);
        
        // 2. 一级缓存没有，且正在创建中
        if (singletonObject == null && isSingletonCurrentlyInCreation(beanName)) {
            synchronized (this.singletonObjects) {
                // 3. 从二级缓存获取
                singletonObject = this.earlySingletonObjects.get(beanName);
                
                // 4. 二级缓存没有，且允许早期引用
                if (singletonObject == null && allowEarlyReference) {
                    // 5. 从三级缓存获取工厂
                    ObjectFactory<?> singletonFactory = this.singletonFactories.get(beanName);
                    if (singletonFactory != null) {
                        // 6. 通过工厂创建对象
                        singletonObject = singletonFactory.getObject();
                        // 7. 放入二级缓存
                        this.earlySingletonObjects.put(beanName, singletonObject);
                        // 8. 从三级缓存移除
                        this.singletonFactories.remove(beanName);
                    }
                }
            }
        }
        return singletonObject;
    }
    
    // 添加单例
    public void addSingleton(String beanName, Object singletonObject) {
        synchronized (this.singletonObjects) {
            this.singletonObjects.put(beanName, singletonObject);
            this.singletonFactories.remove(beanName);
            this.earlySingletonObjects.remove(beanName);
        }
    }
}
```

### 3.3 三级缓存设计

**为什么需要三级缓存**：

```
场景：循环依赖
A 依赖 B，B 依赖 A

创建 A：
  1. 实例化 A（未完成初始化）
  2. 将 A 的工厂放入三级缓存
  3. 填充 A 的属性，需要 B
  
创建 B：
  1. 实例化 B
  2. 将 B 的工厂放入三级缓存
  3. 填充 B 的属性，需要 A
  
获取 A：
  1. 从三级缓存获取 A 的工厂
  2. 通过工厂创建 A 的代理对象（如果需要）
  3. 放入二级缓存
  4. 返回给 B
  
B 创建完成：
  1. B 初始化完成
  2. 放入一级缓存
  
A 创建完成：
  1. A 初始化完成
  2. 放入一级缓存
```

**三级缓存的作用**：
- **一级缓存**：存储完全初始化的单例对象
- **二级缓存**：存储早期暴露的对象（解决循环依赖）
- **三级缓存**：存储对象工厂（支持 AOP 代理）

### 3.4 与传统单例模式的对比

**传统单例模式（双重检查锁）**：

```java
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

**Spring 单例模式**：
- 不使用 static，而是容器管理
- 支持懒加载和预加载
- 支持循环依赖
- 支持 AOP 代理
- 线程安全（ConcurrentHashMap + synchronized）

---

## 4. 代理模式：AOP 动态代理

### 4.1 设计目标与解决的问题

**问题背景**：
- 横切关注点（日志、事务、权限）散落在业务代码中
- 代码重复，难以维护
- 违反开闭原则

**代理模式的作用**：
- 在不修改原对象的情况下增强功能
- 控制对原对象的访问
- 延迟加载、权限控制、日志记录

### 4.2 技术架构与类图结构

```
┌─────────────────────────────────────────────┐
│          AopProxy (代理接口)                 │
│  + getProxy(): Object                       │
│  + getProxy(ClassLoader): Object            │
└─────────────────────────────────────────────┘
                     △
        ┌────────────┴────────────┐
        │                         │
┌───────────────────┐   ┌─────────────────────┐
│ JdkDynamicAopProxy│   │   CglibAopProxy     │
│ (JDK 动态代理)    │   │   (CGLIB 代理)      │
│ - advised         │   │   - advised         │
│ + invoke()        │   │   + intercept()     │
└───────────────────┘   └─────────────────────┘
```

### 4.3 JDK 动态代理实现

```java
// JdkDynamicAopProxy - JDK 动态代理实现
final class JdkDynamicAopProxy implements AopProxy, InvocationHandler {
    private final AdvisedSupport advised;
    
    public JdkDynamicAopProxy(AdvisedSupport config) {
        this.advised = config;
    }
    
    @Override
    public Object getProxy() {
        return getProxy(ClassUtils.getDefaultClassLoader());
    }
    
    @Override
    public Object getProxy(ClassLoader classLoader) {
        // 获取目标对象实现的所有接口
        Class<?>[] proxiedInterfaces = AopProxyUtils.completeProxiedInterfaces(this.advised);
        
        // 使用 JDK Proxy 创建代理对象
        return Proxy.newProxyInstance(
            classLoader,
            proxiedInterfaces,
            this // InvocationHandler
        );
    }
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Object target = this.advised.getTargetSource().getTarget();
        Class<?> targetClass = target.getClass();
        
        // 1. 获取拦截器链
        List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
        
        // 2. 如果没有拦截器，直接调用目标方法
        if (chain.isEmpty()) {
            Object[] argsToUse = AopProxyUtils.adaptArgumentsIfNecessary(method, args);
            return AopUtils.invokeJoinpointUsingReflection(target, method, argsToUse);
        }
        
        // 3. 创建方法调用对象，执行拦截器链
        MethodInvocation invocation = new ReflectiveMethodInvocation(
            proxy, target, method, args, targetClass, chain
        );
        return invocation.proceed();
    }
}
```

### 4.4 CGLIB 代理实现

```java
// CglibAopProxy - CGLIB 代理实现
class CglibAopProxy implements AopProxy {
    private final AdvisedSupport advised;
    
    @Override
    public Object getProxy() {
        return getProxy(null);
    }
    
    @Override
    public Object getProxy(ClassLoader classLoader) {
        Class<?> rootClass = this.advised.getTargetClass();
        
        // 1. 创建 CGLIB Enhancer
        Enhancer enhancer = createEnhancer();
        if (classLoader != null) {
            enhancer.setClassLoader(classLoader);
        }
        
        // 2. 设置父类
        enhancer.setSuperclass(rootClass);
        
        // 3. 设置接口
        enhancer.setInterfaces(AopProxyUtils.completeProxiedInterfaces(this.advised));
        
        // 4. 设置回调（拦截器）
        Callback[] callbacks = getCallbacks(rootClass);
        enhancer.setCallbacks(callbacks);
        
        // 5. 创建代理对象
        return enhancer.create();
    }
    
    private Callback[] getCallbacks(Class<?> rootClass) {
        // DynamicAdvisedInterceptor - 核心拦截器
        Callback aopInterceptor = new DynamicAdvisedInterceptor(this.advised);
        
        return new Callback[] {
            aopInterceptor,  // 方法拦截
            targetInterceptor,  // 目标方法拦截
            new SerializableNoOp(),  // 序列化
            // ...
        };
    }
    
    // 拦截器实现
    private static class DynamicAdvisedInterceptor implements MethodInterceptor {
        private final AdvisedSupport advised;
        
        @Override
        public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) 
                throws Throwable {
            Object target = this.advised.getTargetSource().getTarget();
            Class<?> targetClass = target.getClass();
            
            // 获取拦截器链
            List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(
                method, targetClass
            );
            
            // 执行拦截器链
            if (chain.isEmpty() && Modifier.isPublic(method.getModifiers())) {
                return methodProxy.invoke(target, args);
            }
            
            return new CglibMethodInvocation(proxy, target, method, args, targetClass, chain, methodProxy)
                .proceed();
        }
    }
}
```

### 4.5 拦截器链执行流程

```java
// ReflectiveMethodInvocation - 拦截器链调用
public class ReflectiveMethodInvocation implements ProxyMethodInvocation {
    private final Object proxy;
    private final Object target;
    private final Method method;
    private final Object[] arguments;
    private final List<?> interceptorsAndDynamicMethodMatchers;
    private int currentInterceptorIndex = -1;
    
    @Override
    public Object proceed() throws Throwable {
        // 1. 所有拦截器执行完毕，调用目标方法
        if (this.currentInterceptorIndex == this.interceptorsAndDynamicMethodMatchers.size() - 1) {
            return invokeJoinpoint();
        }
        
        // 2. 获取下一个拦截器
        Object interceptorOrInterceptionAdvice = 
            this.interceptorsAndDynamicMethodMatchers.get(++this.currentInterceptorIndex);
        
        // 3. 执行拦截器
        if (interceptorOrInterceptionAdvice instanceof InterceptorAndDynamicMethodMatcher) {
            InterceptorAndDynamicMethodMatcher dm = 
                (InterceptorAndDynamicMethodMatcher) interceptorOrInterceptionAdvice;
            
            // 动态匹配
            if (dm.methodMatcher.matches(this.method, this.targetClass, this.arguments)) {
                return dm.interceptor.invoke(this);
            } else {
                return proceed(); // 跳过，执行下一个
            }
        } else {
            // 直接执行拦截器
            return ((MethodInterceptor) interceptorOrInterceptionAdvice).invoke(this);
        }
    }
    
    protected Object invokeJoinpoint() throws Throwable {
        return AopUtils.invokeJoinpointUsingReflection(this.target, this.method, this.arguments);
    }
}
```

**拦截器链执行示例**：

```
方法调用：userService.registerUser(user)
代理对象：UserService$$EnhancerBySpringCGLIB

拦截器链：
  1. ExposeInvocationInterceptor（暴露当前调用）
  2. TransactionInterceptor（事务拦截器）
  3. LoggingInterceptor（日志拦截器）

执行流程：
proceed() → ExposeInvocationInterceptor.invoke()
  └─> proceed() → TransactionInterceptor.invoke()
        ├─> beginTransaction()
        └─> proceed() → LoggingInterceptor.invoke()
              ├─> log("方法开始")
              └─> proceed() → 调用目标方法
                    └─> userService.registerUser(user)
              ├─> log("方法结束")
        ├─> commitTransaction()
```

### 4.6 JDK 代理 vs CGLIB 代理选择策略

```java
// DefaultAopProxyFactory - 代理工厂
public class DefaultAopProxyFactory implements AopProxyFactory {
    @Override
    public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException {
        // 判断使用哪种代理方式
        if (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config)) {
            Class<?> targetClass = config.getTargetClass();
            if (targetClass == null) {
                throw new AopConfigException("TargetSource cannot determine target class");
            }
            
            // 如果目标类是接口或已经是代理类，使用 JDK 代理
            if (targetClass.isInterface() || Proxy.isProxyClass(targetClass)) {
                return new JdkDynamicAopProxy(config);
            }
            
            // 否则使用 CGLIB 代理
            return new ObjenesisCglibAopProxy(config);
        } else {
            // 默认使用 JDK 代理
            return new JdkDynamicAopProxy(config);
        }
    }
}
```

**选择规则**：
1. 目标对象实现了接口 → JDK 动态代理
2. 目标对象未实现接口 → CGLIB 代理
3. 强制使用 CGLIB（proxyTargetClass=true） → CGLIB 代理

**两种代理方式对比**：

| 特性 | JDK 动态代理 | CGLIB 代理 |
|------|-------------|-----------|
| **实现方式** | 实现接口，反射调用 | 继承目标类，字节码增强 |
| **前提条件** | 必须有接口 | 无需接口 |
| **性能** | 略慢（反射） | 略快（直接调用） |
| **限制** | 只能代理接口方法 | 不能代理 final 方法/类 |
| **生成速度** | 快 | 慢（需要生成字节码） |

---

## 5. 模板方法模式：JdbcTemplate、TransactionTemplate

### 5.1 设计目标与解决的问题

**问题背景**：

```java
// 传统 JDBC 代码：大量重复的模板代码
public List<User> findAllUsers() {
    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;
    List<User> users = new ArrayList<>();
    
    try {
        // 1. 获取连接（重复代码）
        conn = dataSource.getConnection();
        
        // 2. 创建语句（重复代码）
        ps = conn.prepareStatement("SELECT * FROM users");
        
        // 3. 执行查询（重复代码）
        rs = ps.executeQuery();
        
        // 4. 处理结果集（核心逻辑）
        while (rs.next()) {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setUsername(rs.getString("username"));
            users.add(user);
        }
    } catch (SQLException e) {
        throw new RuntimeException(e);
    } finally {
        // 5. 关闭资源（重复代码）
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (ps != null) try { ps.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }
    
    return users;
}
```

**模板方法模式的作用**：
- 提取公共流程到模板方法
- 将变化部分延迟到子类或回调实现
- 消除重复代码

### 5.2 JdbcTemplate 实现原理

```java
public class JdbcTemplate extends JdbcAccessor implements JdbcOperations {
    
    // 查询方法（模板方法）
    @Override
    public <T> List<T> query(String sql, RowMapper<T> rowMapper) throws DataAccessException {
        return query(sql, new RowMapperResultSetExtractor<>(rowMapper));
    }
    
    @Override
    public <T> List<T> query(String sql, ResultSetExtractor<T> rse) throws DataAccessException {
        class QueryStatementCallback implements StatementCallback<T>, SqlProvider {
            @Override
            public T doInStatement(Statement stmt) throws SQLException {
                ResultSet rs = null;
                try {
                    rs = stmt.executeQuery(sql);
                    return rse.extractData(rs); // 回调处理结果集
                } finally {
                    JdbcUtils.closeResultSet(rs);
                }
            }
            
            @Override
            public String getSql() {
                return sql;
            }
        }
        
        return execute(new QueryStatementCallback()); // 执行模板方法
    }
    
    // 核心模板方法
    @Override
    public <T> T execute(StatementCallback<T> action) throws DataAccessException {
        Connection con = DataSourceUtils.getConnection(obtainDataSource());
        Statement stmt = null;
        try {
            // 1. 创建 Statement
            stmt = con.createStatement();
            applyStatementSettings(stmt);
            
            // 2. 执行回调（变化部分）
            T result = action.doInStatement(stmt);
            
            // 3. 处理警告
            handleWarnings(stmt);
            return result;
        } catch (SQLException ex) {
            // 4. 异常处理
            throw translateException("StatementCallback", getSql(action), ex);
        } finally {
            // 5. 关闭资源
            JdbcUtils.closeStatement(stmt);
            DataSourceUtils.releaseConnection(con, getDataSource());
        }
    }
}
```

**使用示例**：

```java
// 使用 JdbcTemplate
@Repository
public class UserDaoImpl implements UserDao {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public List<User> findAll() {
        return jdbcTemplate.query(
            "SELECT * FROM users",
            (rs, rowNum) -> { // RowMapper 回调
                User user = new User();
                user.setId(rs.getLong("id"));
                user.setUsername(rs.getString("username"));
                return user;
            }
        );
    }
    
    @Override
    public int save(User user) {
        return jdbcTemplate.update(
            "INSERT INTO users (username, email) VALUES (?, ?)",
            user.getUsername(),
            user.getEmail()
        );
    }
}
```

**优势**：
- ✅ 消除了 80% 的重复代码
- ✅ 自动管理连接和资源
- ✅ 统一异常处理
- ✅ 专注于业务逻辑（RowMapper）

### 5.3 TransactionTemplate 实现原理

```java
public class TransactionTemplate extends DefaultTransactionDefinition implements TransactionOperations {
    private PlatformTransactionManager transactionManager;
    
    // 模板方法
    @Override
    public <T> T execute(TransactionCallback<T> action) throws TransactionException {
        TransactionStatus status = this.transactionManager.getTransaction(this);
        T result;
        try {
            // 执行业务逻辑（回调）
            result = action.doInTransaction(status);
        } catch (RuntimeException | Error ex) {
            // 回滚
            rollbackOnException(status, ex);
            throw ex;
        } catch (Throwable ex) {
            rollbackOnException(status, ex);
            throw new UndeclaredThrowableException(ex, "TransactionCallback threw undeclared checked exception");
        }
        
        // 提交
        this.transactionManager.commit(status);
        return result;
    }
    
    private void rollbackOnException(TransactionStatus status, Throwable ex) {
        try {
            this.transactionManager.rollback(status);
        } catch (TransactionSystemException ex2) {
            ex2.initApplicationException(ex);
            throw ex2;
        } catch (RuntimeException | Error ex2) {
            throw ex2;
        }
    }
}
```

**使用示例**：

```java
@Service
public class UserService {
    @Autowired
    private TransactionTemplate transactionTemplate;
    
    @Autowired
    private UserDao userDao;
    
    public void registerUser(User user) {
        transactionTemplate.execute(status -> {
            userDao.save(user);
            emailService.sendWelcomeEmail(user);
            return null;
        });
    }
}
```

---

## 6. 策略模式：资源加载、实例化策略

### 6.1 资源加载策略

```java
// Resource 接口（策略接口）
public interface Resource extends InputStreamSource {
    boolean exists();
    boolean isReadable();
    URL getURL() throws IOException;
    File getFile() throws IOException;
    long contentLength() throws IOException;
}

// 不同的资源加载策略
public class ClassPathResource implements Resource { /* 类路径资源 */ }
public class FileSystemResource implements Resource { /* 文件系统资源 */ }
public class UrlResource implements Resource { /* URL 资源 */ }
public class ByteArrayResource implements Resource { /* 字节数组资源 */ }

// ResourceLoader（策略使用者）
public interface ResourceLoader {
    Resource getResource(String location);
}

public class DefaultResourceLoader implements ResourceLoader {
    @Override
    public Resource getResource(String location) {
        // 根据location 选择不同的策略
        if (location.startsWith(CLASSPATH_URL_PREFIX)) {
            return new ClassPathResource(location.substring(CLASSPATH_URL_PREFIX.length()));
        } else if (location.startsWith("file:")) {
            return new FileSystemResource(location.substring(5));
        } else if (location.startsWith("http:") || location.startsWith("https:")) {
            return new UrlResource(location);
        } else {
            return getResourceByPath(location);
        }
    }
}
```

### 6.2 Bean 实例化策略

```java
// InstantiationStrategy 接口（策略接口）
public interface InstantiationStrategy {
    Object instantiate(RootBeanDefinition bd, String beanName, BeanFactory owner)
            throws BeansException;
    
    Object instantiate(RootBeanDefinition bd, String beanName, BeanFactory owner,
            Constructor<?> ctor, Object... args) throws BeansException;
    
    Object instantiate(RootBeanDefinition bd, String beanName, BeanFactory owner,
            Object factoryBean, Method factoryMethod, Object... args) throws BeansException;
}

// 简单实例化策略（反射）
public class SimpleInstantiationStrategy implements InstantiationStrategy {
    @Override
    public Object instantiate(RootBeanDefinition bd, String beanName, BeanFactory owner) {
        // 使用反射创建对象
        Constructor<?> constructorToUse = (Constructor<?>) bd.resolvedConstructorOrFactoryMethod;
        return BeanUtils.instantiateClass(constructorToUse);
    }
}

// CGLIB 实例化策略（支持方法注入）
public class CglibSubclassingInstantiationStrategy extends SimpleInstantiationStrategy {
    @Override
    public Object instantiate(RootBeanDefinition bd, String beanName, BeanFactory owner) {
        // 如果需要方法注入，使用 CGLIB
        if (bd.getMethodOverrides().isEmpty()) {
            return super.instantiate(bd, beanName, owner);
        } else {
            return instantiateWithMethodInjection(bd, beanName, owner);
        }
    }
}
```

---

## 7. 观察者模式：事件发布订阅

### 7.1 设计目标与解决的问题

**问题背景**：
- 模块间需要解耦通信
- 一个事件需要通知多个监听器
- 支持异步处理

**观察者模式的作用**：
- 定义对象间的一对多依赖关系
- 当一个对象状态改变时，所有依赖者都会收到通知

### 7.2 Spring 事件机制实现

```java
// 事件（主题）
public abstract class ApplicationEvent extends EventObject {
    private final long timestamp;
    
    public ApplicationEvent(Object source) {
        super(source);
        this.timestamp = System.currentTimeMillis();
    }
}

// 监听器（观察者）
@FunctionalInterface
public interface ApplicationListener<E extends ApplicationEvent> extends EventListener {
    void onApplicationEvent(E event);
}

// 事件发布器
public interface ApplicationEventPublisher {
    void publishEvent(ApplicationEvent event);
    void publishEvent(Object event);
}

// 事件多播器（管理监听器并分发事件）
public interface ApplicationEventMulticaster {
    void addApplicationListener(ApplicationListener<?> listener);
    void removeApplicationListener(ApplicationListener<?> listener);
    void multicastEvent(ApplicationEvent event);
    void multicastEvent(ApplicationEvent event, ResolvableType eventType);
}

// 默认实现
public class SimpleApplicationEventMulticaster extends AbstractApplicationEventMulticaster {
    @Override
    public void multicastEvent(ApplicationEvent event, ResolvableType eventType) {
        ResolvableType type = (eventType != null ? eventType : resolveDefaultEventType(event));
        Executor executor = getTaskExecutor();
        
        // 遍历所有监听器
        for (ApplicationListener<?> listener : getApplicationListeners(event, type)) {
            if (executor != null) {
                // 异步执行
                executor.execute(() -> invokeListener(listener, event));
            } else {
                // 同步执行
                invokeListener(listener, event);
            }
        }
    }
    
    protected void invokeListener(ApplicationListener<?> listener, ApplicationEvent event) {
        ErrorHandler errorHandler = getErrorHandler();
        if (errorHandler != null) {
            try {
                doInvokeListener(listener, event);
            } catch (Throwable err) {
                errorHandler.handleError(err);
            }
        } else {
            doInvokeListener(listener, event);
        }
    }
    
    private void doInvokeListener(ApplicationListener listener, ApplicationEvent event) {
        listener.onApplicationEvent(event);
    }
}
```

**使用示例**：

```java
// 自定义事件
public class UserRegisteredEvent extends ApplicationEvent {
    private final User user;
    
    public UserRegisteredEvent(Object source, User user) {
        super(source);
        this.user = user;
    }
    
    public User getUser() {
        return user;
    }
}

// 事件监听器
@Component
public class UserRegisteredListener implements ApplicationListener<UserRegisteredEvent> {
    @Override
    public void onApplicationEvent(UserRegisteredEvent event) {
        User user = event.getUser();
        System.out.println("用户注册成功：" + user.getUsername());
        // 发送欢迎邮件
    }
}

// 发布事件
@Service
public class UserService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void registerUser(User user) {
        userDao.save(user);
        // 发布事件
        eventPublisher.publishEvent(new UserRegisteredEvent(this, user));
    }
}
```

---

## 8. 实际落地场景（工作实战）

### 场景 1：使用工厂模式实现多数据源切换

**问题背景**：
电商系统需要访问主库（写）和从库（读），根据操作类型动态切换数据源。

**Spring 技术方案**：

```java
// 数据源工厂
@Configuration
public class DataSourceConfig {
    @Bean("masterDataSource")
    public DataSource masterDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:mysql://master:3306/db")
            .build();
    }
    
    @Bean("slaveDataSource")
    public DataSource slaveDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:mysql://slave:3306/db")
            .build();
    }
    
    @Bean
    @Primary
    public DataSource dynamicDataSource(@Qualifier("masterDataSource") DataSource master,
                                       @Qualifier("slaveDataSource") DataSource slave) {
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("master", master);
        targetDataSources.put("slave", slave);
        
        DynamicDataSource dynamicDataSource = new DynamicDataSource();
        dynamicDataSource.setTargetDataSources(targetDataSources);
        dynamicDataSource.setDefaultTargetDataSource(master);
        return dynamicDataSource;
    }
}

// 动态数据源（策略模式）
public class DynamicDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return DataSourceContextHolder.getDataSourceType();
    }
}

// 数据源上下文（ThreadLocal）
public class DataSourceContextHolder {
    private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();
    
    public static void setDataSourceType(String dataSourceType) {
        contextHolder.set(dataSourceType);
    }
    
    public static String getDataSourceType() {
        return contextHolder.get();
    }
    
    public static void clearDataSourceType() {
        contextHolder.remove();
    }
}

// AOP 切换数据源
@Aspect
@Component
public class DataSourceAspect {
    @Around("@annotation(readOnly)")
    public Object switchDataSource(ProceedingJoinPoint pjp, ReadOnly readOnly) throws Throwable {
        try {
            DataSourceContextHolder.setDataSourceType("slave");
            return pjp.proceed();
        } finally {
            DataSourceContextHolder.clearDataSourceType();
        }
    }
}
```

### 场景 2：使用模板方法模式简化重复代码

**性能瓶颈现象**：
每个 DAO 方法都有大量 JDBC 重复代码，开发效率低。

**优化方案**：

```java
// 重构前：大量重复代码
public class UserDaoImpl implements UserDao {
    public User findById(Long id) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = dataSource.getConnection();
            ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
            ps.setLong(1, id);
            rs = ps.executeQuery();
            if (rs.next()) {
                User user = new User();
                user.setId(rs.getLong("id"));
                user.setUsername(rs.getString("username"));
                return user;
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        } finally {
            // 关闭资源...
        }
    }
}

// 重构后：使用 JdbcTemplate
@Repository
public class UserDaoImpl implements UserDao {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private RowMapper<User> rowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setUsername(rs.getString("username"));
        return user;
    };
    
    public User findById(Long id) {
        return jdbcTemplate.queryForObject(
            "SELECT * FROM users WHERE id = ?",
            rowMapper,
            id
        );
    }
}
```

**优化效果对比**：
- 代码量减少 70%
- 无需手动管理连接
- 统一异常处理

### 场景 3：使用观察者模式实现业务解耦

**故障现象**：
用户注册后需要发送邮件、积分、优惠券等，业务逻辑耦合在一起。

**解决方案**：

```java
// 使用事件机制解耦
@Service
public class UserService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public void registerUser(User user) {
        // 核心业务：保存用户
        userDao.save(user);
        
        // 发布事件（解耦）
        eventPublisher.publishEvent(new UserRegisteredEvent(this, user));
    }
}

// 邮件监听器
@Component
public class EmailListener implements ApplicationListener<UserRegisteredEvent> {
    @Async
    @Override
    public void onApplicationEvent(UserRegisteredEvent event) {
        emailService.sendWelcomeEmail(event.getUser());
    }
}

// 积分监听器
@Component
public class PointsListener implements ApplicationListener<UserRegisteredEvent> {
    @Async
    @Override
    public void onApplicationEvent(UserRegisteredEvent event) {
        pointsService.giveRegisterPoints(event.getUser());
    }
}

// 优惠券监听器
@Component
public class CouponListener implements ApplicationListener<UserRegisteredEvent> {
    @Async
    @Override
    public void onApplicationEvent(UserRegisteredEvent event) {
        couponService.giveRegisterCoupon(event.getUser());
    }
}
```

**优势**：
- ✅ 业务解耦：新增功能只需添加监听器
- ✅ 异步处理：不影响主流程性能
- ✅ 易于扩展：符合开闭原则

---

## 9. 面试准备专项

### 高频面试题：Spring 用了哪些设计模式？

**第一层（基础回答 - 60分）**：
Spring 主要使用了工厂模式、单例模式、代理模式、模板方法模式等设计模式。

**第二层（深入原理 - 80分）**：
1. **工厂模式**：BeanFactory 和 ApplicationContext 负责创建和管理 Bean
2. **单例模式**：Spring Bean 默认是单例，通过单例注册表管理
3. **代理模式**：AOP 通过 JDK 动态代理或 CGLIB 实现
4. **模板方法模式**：JdbcTemplate、TransactionTemplate 封装固定流程
5. **策略模式**：资源加载（Resource）、Bean 实例化策略
6. **观察者模式**：事件监听机制（ApplicationListener）

**第三层（扩展延伸 - 95分）**：
从源码角度详细说明：

1. **工厂模式**：
   - `DefaultListableBeanFactory` 是核心工厂实现
   - `getBean()` 方法体现工厂模式：根据 BeanDefinition 创建对象
   - 支持懒加载、作用域管理、生命周期回调

2. **单例模式**：
   - 三级缓存设计：`singletonObjects`、`earlySingletonObjects`、`singletonFactories`
   - 解决循环依赖：通过提前暴露对象工厂
   - 线程安全：`ConcurrentHashMap` + `synchronized`

3. **代理模式**：
   - `JdkDynamicAopProxy`：实现 InvocationHandler，invoke() 方法处理拦截
   - `CglibAopProxy`：使用 Enhancer 生成子类，MethodInterceptor 拦截方法
   - 拦截器链：`ReflectiveMethodInvocation.proceed()` 责任链模式

4. **模板方法模式**：
   - `JdbcTemplate.execute()` 封装 JDBC 流程，变化部分通过回调实现
   - `TransactionTemplate.execute()` 封装事务流程
   - 消除重复代码，专注业务逻辑

5. **策略模式**：
   - `ResourceLoader.getResource()` 根据 location 选择不同的 Resource 实现
   - `InstantiationStrategy` 支持反射或 CGLIB 实例化

6. **观察者模式**：
   - `ApplicationEventMulticaster.multicastEvent()` 通知所有监听器
   - 支持同步和异步事件
   - 实现业务解耦

**追问应对**：

**追问 1：为什么 Spring 要使用这么多设计模式？**
- 解决复杂性：框架需要处理对象创建、依赖注入、AOP、事务等复杂场景
- 提高可扩展性：通过接口和抽象类，支持用户自定义扩展
- 遵循设计原则：开闭原则、单一职责、依赖倒置

**追问 2：单例模式的三级缓存是如何工作的？**
- 一级缓存：存储完全初始化的单例对象
- 二级缓存：存储早期暴露的对象（解决循环依赖）
- 三级缓存：存储对象工厂（支持 AOP 代理）
- 创建流程：实例化 → 放入三级缓存 → 属性填充 → 初始化 → 放入一级缓存

**加分项**：
- 能说出具体源码类和方法
- 能画出类图说明继承关系
- 能结合实际项目说明设计模式的应用

**避坑指南**：
- ❌ 不要只列举模式名称
- ❌ 不要说"Spring 使用了 23 种设计模式"（夸大其词）
- ✅ 应该选择 5-6 个核心模式深入讲解
- ✅ 结合源码和实际应用场景

---

## 10. 学习自检清单

- [ ] 能够画出 BeanFactory 继承体系图
- [ ] 能够解释 Bean 创建的完整流程
- [ ] 能够说明三级缓存的作用和工作原理
- [ ] 能够对比 JDK 代理和 CGLIB 代理的实现和选择策略
- [ ] 能够解释拦截器链的执行流程
- [ ] 能够说明模板方法模式如何消除重复代码
- [ ] 能够使用事件机制实现业务解耦

**学习建议**：
- **预计学习时长**：3 小时
- **重点难点**：三级缓存原理、代理模式实现、拦截器链执行
- **前置知识**：设计模式基础、Java 反射、动态代理
- **实践建议**：
  - 手写简易版 BeanFactory
  - 调试 AOP 代理创建过程
  - 使用 JdbcTemplate 替换传统 JDBC 代码

---

## 11. 参考资料

**Spring 官方文档**：
- [Core Technologies](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html)

**源码位置**：
- Bean 工厂：`org.springframework.beans.factory.support.DefaultListableBeanFactory`
- 单例注册表：`org.springframework.beans.factory.support.DefaultSingletonBeanRegistry`
- JDK 代理：`org.springframework.aop.framework.JdkDynamicAopProxy`
- CGLIB 代理：`org.springframework.aop.framework.CglibAopProxy`
- JDBC 模板：`org.springframework.jdbc.core.JdbcTemplate`
- 事件多播器：`org.springframework.context.event.SimpleApplicationEventMulticaster`

**推荐阅读**：
- 《设计模式：可复用面向对象软件的基础》- GoF
- 《Spring 源码深度解析》第 2-3 章

---

**上一章** ← [第 1 章：Spring Framework 设计哲学](./content-1.md)  
**下一章** → [第 3 章：IoC 容器架构设计](./content-3.md)  
**返回目录** → [学习大纲](../content-outline.md)

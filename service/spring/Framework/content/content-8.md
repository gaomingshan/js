# 第 8 章：循环依赖解决机制

> **学习目标**：深入理解 Spring 三级缓存如何解决循环依赖问题  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 专家  
> **源码入口**：`DefaultSingletonBeanRegistry.getSingleton()`

---

## 1. 核心概念

### 1.1 什么是循环依赖

**循环依赖**：两个或多个 Bean 相互依赖，形成闭环。

```java
// A 依赖 B
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
}

// B 依赖 A
@Service
public class ServiceB {
    @Autowired
    private ServiceA serviceA;
}
```

**依赖关系图**：
```
ServiceA ──> ServiceB
    ↑           │
    └───────────┘
```

### 1.2 循环依赖的三种情况

| 场景 | 是否支持 | 原因 |
|------|---------|------|
| **构造器注入** | ❌ 不支持 | 无法提前暴露对象 |
| **Setter 注入（单例）** | ✅ 支持 | 三级缓存 |
| **Setter 注入（原型）** | ❌ 不支持 | 不缓存原型 Bean |

---

## 2. 三级缓存设计

### 2.1 三级缓存定义

```java
public class DefaultSingletonBeanRegistry extends SimpleAliasRegistry implements SingletonBeanRegistry {
    
    /**
     * 一级缓存：单例对象缓存
     * 存储完全初始化好的单例 Bean
     */
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);
    
    /**
     * 二级缓存：早期单例对象缓存
     * 存储早期暴露的单例 Bean（未完成初始化）
     */
    private final Map<String, Object> earlySingletonObjects = new HashMap<>(16);
    
    /**
     * 三级缓存：单例工厂缓存
     * 存储创建单例 Bean 的工厂
     */
    private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);
    
    /**
     * 正在创建中的单例 Bean 集合
     */
    private final Set<String> singletonsCurrentlyInCreation = 
        Collections.newSetFromMap(new ConcurrentHashMap<>(16));
}
```

### 2.2 三级缓存的作用

```
┌─────────────────────────────────────────────────────┐
│ 一级缓存 (singletonObjects)                          │
│ - 存储完全初始化的单例 Bean                           │
│ - 最终可用的 Bean 对象                               │
├─────────────────────────────────────────────────────┤
│ 二级缓存 (earlySingletonObjects)                     │
│ - 存储早期暴露的 Bean（未完成初始化）                  │
│ - 解决循环依赖时临时存储                              │
├─────────────────────────────────────────────────────┤
│ 三级缓存 (singletonFactories)                        │
│ - 存储创建 Bean 的工厂 (ObjectFactory)                │
│ - 支持 AOP 代理对象的创建                            │
└─────────────────────────────────────────────────────┘
```

### 2.3 为什么需要三级缓存？

**只用一级缓存**：
- ❌ 无法区分完整 Bean 和半成品 Bean
- ❌ 无法解决循环依赖

**只用二级缓存**：
- ❌ 无法支持 AOP 代理
- ❌ 早期暴露的对象可能不是最终对象

**使用三级缓存**：
- ✅ 一级：存储完整 Bean
- ✅ 二级：存储早期 Bean（已创建代理）
- ✅ 三级：工厂延迟创建代理

**关键设计**：
```java
// 三级缓存存储的是工厂，而非对象本身
ObjectFactory<?> factory = () -> {
    // 如果需要 AOP，返回代理对象
    // 否则返回原始对象
    return getEarlyBeanReference(beanName, mbd, bean);
};
singletonFactories.put(beanName, factory);
```

---

## 3. 获取单例 Bean：getSingleton()

### 3.1 核心方法

```java
@Nullable
protected Object getSingleton(String beanName, boolean allowEarlyReference) {
    // 1. 从一级缓存获取（完整的单例对象）
    Object singletonObject = this.singletonObjects.get(beanName);
    
    // 2. 一级缓存没有 && Bean 正在创建中
    if (singletonObject == null && isSingletonCurrentlyInCreation(beanName)) {
        synchronized (this.singletonObjects) {
            // 3. 从二级缓存获取（早期暴露的对象）
            singletonObject = this.earlySingletonObjects.get(beanName);
            
            // 4. 二级缓存也没有 && 允许早期引用
            if (singletonObject == null && allowEarlyReference) {
                // 5. 从三级缓存获取工厂
                ObjectFactory<?> singletonFactory = this.singletonFactories.get(beanName);
                if (singletonFactory != null) {
                    // 6. 通过工厂创建对象（可能是代理对象）
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
```

**查找流程**：
```
getSingleton(beanName)
    │
    ├─> 1. 从一级缓存查找
    │   └─> 找到 → 返回完整对象
    │
    ├─> 2. 检查是否正在创建
    │   └─> 否 → 返回 null
    │
    ├─> 3. 从二级缓存查找
    │   └─> 找到 → 返回早期对象
    │
    └─> 4. 从三级缓存查找工厂
        ├─> 找到
        │   ├─> 调用工厂创建对象
        │   ├─> 放入二级缓存
        │   └─> 从三级缓存移除
        └─> 返回对象
```

### 3.2 创建单例 Bean：getSingleton(factory)

```java
public Object getSingleton(String beanName, ObjectFactory<?> singletonFactory) {
    Assert.notNull(beanName, "Bean name must not be null");
    
    synchronized (this.singletonObjects) {
        // 1. 再次检查一级缓存
        Object singletonObject = this.singletonObjects.get(beanName);
        if (singletonObject == null) {
            // 2. 检查是否正在销毁
            if (this.singletonsCurrentlyInDestruction) {
                throw new BeanCreationNotAllowedException(beanName, /* ... */);
            }
            
            // 3. 创建前回调
            beforeSingletonCreation(beanName);
            boolean newSingleton = false;
            boolean recordSuppressedExceptions = (this.suppressedExceptions == null);
            if (recordSuppressedExceptions) {
                this.suppressedExceptions = new LinkedHashSet<>();
            }
            
            try {
                // 4. 调用工厂创建 Bean
                singletonObject = singletonFactory.getObject();
                newSingleton = true;
            } catch (IllegalStateException ex) {
                singletonObject = this.singletonObjects.get(beanName);
                if (singletonObject == null) {
                    throw ex;
                }
            } catch (BeanCreationException ex) {
                if (recordSuppressedExceptions) {
                    for (Exception suppressedException : this.suppressedExceptions) {
                        ex.addRelatedCause(suppressedException);
                    }
                }
                throw ex;
            } finally {
                if (recordSuppressedExceptions) {
                    this.suppressedExceptions = null;
                }
                // 5. 创建后回调
                afterSingletonCreation(beanName);
            }
            
            if (newSingleton) {
                // 6. 添加到一级缓存
                addSingleton(beanName, singletonObject);
            }
        }
        return singletonObject;
    }
}

protected void beforeSingletonCreation(String beanName) {
    // 标记为正在创建
    if (!this.inCreationCheckExclusions.contains(beanName) && 
            !this.singletonsCurrentlyInCreation.add(beanName)) {
        throw new BeanCurrentlyInCreationException(beanName);
    }
}

protected void afterSingletonCreation(String beanName) {
    // 移除正在创建标记
    if (!this.inCreationCheckExclusions.contains(beanName) && 
            !this.singletonsCurrentlyInCreation.remove(beanName)) {
        throw new IllegalStateException("Singleton '" + beanName + "' isn't currently in creation");
    }
}

protected void addSingleton(String beanName, Object singletonObject) {
    synchronized (this.singletonObjects) {
        // 放入一级缓存
        this.singletonObjects.put(beanName, singletonObject);
        
        // 从三级、二级缓存移除
        this.singletonFactories.remove(beanName);
        this.earlySingletonObjects.remove(beanName);
        
        // 记录已注册的单例
        this.registeredSingletons.add(beanName);
    }
}
```

---

## 4. 循环依赖解决流程

### 4.1 完整流程图

```
创建 ServiceA：
    │
    ├─> 1. 实例化 ServiceA
    │      createBeanInstance() → new ServiceA()
    │
    ├─> 2. 提前暴露（放入三级缓存）
    │      addSingletonFactory("serviceA", () -> getEarlyBeanReference(serviceA))
    │
    ├─> 3. 属性填充（需要注入 ServiceB）
    │      populateBean()
    │      │
    │      └─> getBean("serviceB")
    │             │
    │             ├─> 1. 实例化 ServiceB
    │             │      createBeanInstance() → new ServiceB()
    │             │
    │             ├─> 2. 提前暴露（放入三级缓存）
    │             │      addSingletonFactory("serviceB", () -> getEarlyBeanReference(serviceB))
    │             │
    │             ├─> 3. 属性填充（需要注入 ServiceA）
    │             │      populateBean()
    │             │      │
    │             │      └─> getBean("serviceA")
    │             │             │
    │             │             ├─> getSingleton("serviceA")
    │             │             │   ├─> 一级缓存：无
    │             │             │   ├─> 正在创建：是
    │             │             │   ├─> 二级缓存：无
    │             │             │   ├─> 三级缓存：有工厂
    │             │             │   ├─> 调用工厂 → getEarlyBeanReference()
    │             │             │   ├─> 返回 ServiceA（可能是代理）
    │             │             │   ├─> 放入二级缓存
    │             │             │   └─> 从三级缓存移除
    │             │             │
    │             │             └─> 注入到 ServiceB.serviceA ✅
    │             │
    │             ├─> 4. 初始化 ServiceB
    │             │      initializeBean()
    │             │
    │             └─> 5. 放入一级缓存
    │                    addSingleton("serviceB", serviceB)
    │
    ├─> 4. 注入 ServiceB 到 ServiceA ✅
    │
    ├─> 5. 初始化 ServiceA
    │      initializeBean()
    │
    └─> 6. 放入一级缓存
           addSingleton("serviceA", serviceA)
```

### 4.2 源码追踪

```java
// AbstractAutowireCapableBeanFactory.doCreateBean()
protected Object doCreateBean(String beanName, RootBeanDefinition mbd, Object[] args) {
    BeanWrapper instanceWrapper = null;
    if (mbd.isSingleton()) {
        instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
    }
    if (instanceWrapper == null) {
        // 1. 实例化
        instanceWrapper = createBeanInstance(beanName, mbd, args);
    }
    Object bean = instanceWrapper.getWrappedInstance();
    
    // 2. 提前暴露（解决循环依赖的关键）
    boolean earlySingletonExposure = (mbd.isSingleton() && 
        this.allowCircularReferences &&
        isSingletonCurrentlyInCreation(beanName));
    
    if (earlySingletonExposure) {
        // 放入三级缓存
        addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
    }
    
    Object exposedObject = bean;
    try {
        // 3. 属性填充（依赖注入）
        populateBean(beanName, mbd, instanceWrapper);
        
        // 4. 初始化
        exposedObject = initializeBean(beanName, exposedObject, mbd);
    } catch (Throwable ex) {
        // ...
    }
    
    // 5. 处理循环依赖
    if (earlySingletonExposure) {
        Object earlySingletonReference = getSingleton(beanName, false);
        if (earlySingletonReference != null) {
            if (exposedObject == bean) {
                exposedObject = earlySingletonReference;
            } else if (!this.allowRawInjectionDespiteWrapping && hasDependentBean(beanName)) {
                // 检查是否有其他 Bean 依赖了早期引用
                String[] dependentBeans = getDependentBeans(beanName);
                Set<String> actualDependentBeans = new LinkedHashSet<>(dependentBeans.length);
                for (String dependentBean : dependentBeans) {
                    if (!removeSingletonIfCreatedForTypeCheckOnly(dependentBean)) {
                        actualDependentBeans.add(dependentBean);
                    }
                }
                if (!actualDependentBeans.isEmpty()) {
                    throw new BeanCurrentlyInCreationException(beanName, /* ... */);
                }
            }
        }
    }
    
    // 6. 注册销毁回调
    registerDisposableBeanIfNecessary(beanName, bean, mbd);
    
    return exposedObject;
}

protected void addSingletonFactory(String beanName, ObjectFactory<?> singletonFactory) {
    Assert.notNull(singletonFactory, "Singleton factory must not be null");
    synchronized (this.singletonObjects) {
        if (!this.singletonObjects.containsKey(beanName)) {
            // 放入三级缓存
            this.singletonFactories.put(beanName, singletonFactory);
            
            // 从二级缓存移除
            this.earlySingletonObjects.remove(beanName);
            
            // 记录已注册的单例
            this.registeredSingletons.add(beanName);
        }
    }
}
```

### 4.3 早期引用获取：getEarlyBeanReference()

```java
protected Object getEarlyBeanReference(String beanName, RootBeanDefinition mbd, Object bean) {
    Object exposedObject = bean;
    if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
        for (BeanPostProcessor bp : getBeanPostProcessors()) {
            if (bp instanceof SmartInstantiationAwareBeanPostProcessor) {
                SmartInstantiationAwareBeanPostProcessor ibp = 
                    (SmartInstantiationAwareBeanPostProcessor) bp;
                
                // 关键：如果需要 AOP，这里会创建代理对象
                exposedObject = ibp.getEarlyBeanReference(exposedObject, beanName);
            }
        }
    }
    return exposedObject;
}
```

**AbstractAutoProxyCreator 实现**：

```java
public abstract class AbstractAutoProxyCreator extends ProxyProcessorSupport
        implements SmartInstantiationAwareBeanPostProcessor, BeanFactoryAware {
    
    @Override
    public Object getEarlyBeanReference(Object bean, String beanName) {
        Object cacheKey = getCacheKey(bean.getClass(), beanName);
        // 记录已创建早期引用
        this.earlyProxyReferences.put(cacheKey, bean);
        
        // 如果需要代理，创建代理对象
        return wrapIfNecessary(bean, beanName, cacheKey);
    }
}
```

---

## 5. 不支持的循环依赖场景

### 5.1 构造器循环依赖

```java
@Service
public class ServiceA {
    private final ServiceB serviceB;
    
    // 构造器注入
    public ServiceA(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

@Service
public class ServiceB {
    private final ServiceA serviceA;
    
    // 构造器注入
    public ServiceB(ServiceA serviceA) {
        this.serviceA = serviceA;
    }
}

// 启动报错：
// BeanCurrentlyInCreationException: Error creating bean with name 'serviceA':
// Requested bean is currently in creation: Is there an unresolvable circular reference?
```

**为什么不支持**：
- 构造器注入在实例化阶段就需要依赖对象
- 此时对象还未创建，无法提前暴露
- 无法放入三级缓存

**创建流程分析**：
```
创建 ServiceA：
    ├─> 需要 ServiceB（构造器参数）
    │      ├─> 创建 ServiceB
    │      │      ├─> 需要 ServiceA（构造器参数）
    │      │      │      └─> ServiceA 正在创建中
    │      │      │          ├─> 检查缓存：都为空
    │      │      │          └─> ❌ 抛出异常
    │      │      └─> ❌ 失败
    │      └─> ❌ 失败
    └─> ❌ 失败
```

### 5.2 原型（prototype）循环依赖

```java
@Service
@Scope("prototype")
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
}

@Service
@Scope("prototype")
public class ServiceB {
    @Autowired
    private ServiceA serviceA;
}

// 获取 Bean 时报错：
// BeanCurrentlyInCreationException: Error creating bean with name 'serviceA':
// Requested bean is currently in creation: Is there an unresolvable circular reference?
```

**为什么不支持**：
- 原型 Bean 不缓存
- 每次 getBean() 都创建新实例
- 无法使用三级缓存

**检查逻辑**：
```java
// AbstractBeanFactory.doGetBean()
if (isPrototypeCurrentlyInCreation(beanName)) {
    throw new BeanCurrentlyInCreationException(beanName);
}

protected boolean isPrototypeCurrentlyInCreation(String beanName) {
    Object curVal = this.prototypesCurrentlyInCreation.get();
    return (curVal != null &&
        (curVal.equals(beanName) || (curVal instanceof Set && ((Set<?>) curVal).contains(beanName))));
}
```

---

## 6. 循环依赖与 AOP

### 6.1 AOP 代理创建时机

**正常情况（无循环依赖）**：
```
实例化 → 属性填充 → 初始化前 → 初始化 → 初始化后（创建 AOP 代理） → 完成
```

**循环依赖情况**：
```
实例化 → 提前暴露（三级缓存工厂可创建代理） → 属性填充 → 初始化 → 初始化后（跳过代理创建） → 完成
```

### 6.2 源码分析

```java
// AbstractAutoProxyCreator.postProcessAfterInitialization()
@Override
public Object postProcessAfterInitialization(@Nullable Object bean, String beanName) {
    if (bean != null) {
        Object cacheKey = getCacheKey(bean.getClass(), beanName);
        
        // 如果已经创建了早期引用（循环依赖），跳过
        if (this.earlyProxyReferences.remove(cacheKey) != bean) {
            // 正常流程：在这里创建代理
            return wrapIfNecessary(bean, beanName, cacheKey);
        }
    }
    return bean;
}

@Override
public Object getEarlyBeanReference(Object bean, String beanName) {
    Object cacheKey = getCacheKey(bean.getClass(), beanName);
    
    // 记录早期引用
    this.earlyProxyReferences.put(cacheKey, bean);
    
    // 循环依赖：提前创建代理
    return wrapIfNecessary(bean, beanName, cacheKey);
}
```

**时序对比**：

```
无循环依赖：
ServiceA 实例化 → 属性填充 → 初始化 → AOP 代理创建 ← 这里创建代理
    ↓
放入一级缓存（代理对象）

有循环依赖：
ServiceA 实例化 → 提前暴露（三级缓存） → 属性填充
    │                       ↓
    │              ServiceB 需要 ServiceA
    │                       ↓
    │              从三级缓存获取工厂
    │                       ↓
    │              调用 getEarlyBeanReference() ← 这里创建代理
    │                       ↓
    │              返回代理对象给 ServiceB
    ↓
初始化 → 检测到早期引用 → 跳过 AOP 代理创建
    ↓
放入一级缓存（早期创建的代理对象）
```

---

## 7. 实际落地场景（工作实战）

### 场景 1：解决构造器循环依赖

**问题代码**：
```java
@Service
public class OrderService {
    private final UserService userService;
    
    public OrderService(UserService userService) {
        this.userService = userService;
    }
}

@Service
public class UserService {
    private final OrderService orderService;
    
    public UserService(OrderService orderService) {
        this.orderService = orderService;
    }
}
```

**解决方案**：

```java
// 方案1：改用 Setter 注入
@Service
public class OrderService {
    private UserService userService;
    
    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }
}

// 方案2：使用 @Lazy
@Service
public class OrderService {
    private final UserService userService;
    
    public OrderService(@Lazy UserService userService) {
        this.userService = userService;
    }
}

// 方案3：重构代码，消除循环依赖
@Service
public class OrderService {
    @Autowired
    private CommonService commonService;
}

@Service
public class UserService {
    @Autowired
    private CommonService commonService;
}

@Service
public class CommonService {
    // 提取公共逻辑
}
```

### 场景 2：排查循环依赖问题

**开启循环依赖检测**：
```properties
# application.properties
spring.main.allow-circular-references=false
```

**分析依赖关系**：
```bash
# 使用 Spring Boot Actuator
GET /actuator/beans

# 或使用 IDE 插件分析
```

**日志分析**：
```
Creating shared instance of singleton bean 'serviceA'
Creating shared instance of singleton bean 'serviceB'
Requested bean is currently in creation: Is there an unresolvable circular reference?
```

### 场景 3：Spring Boot 2.6+ 循环依赖处理

Spring Boot 2.6 开始，**默认禁止循环依赖**。

**配置**：
```properties
# 允许循环依赖（不推荐）
spring.main.allow-circular-references=true
```

**推荐做法**：
- 重构代码，消除循环依赖
- 使用事件驱动解耦
- 提取公共服务

---

## 8. 面试准备专项

### 高频面试题：Spring 如何解决循环依赖？

**第一层（基础回答 - 60分）**：
Spring 通过三级缓存解决单例 Bean 的 Setter 注入循环依赖。

**第二层（深入原理 - 80分）**：
Spring 使用三级缓存解决循环依赖：

1. **一级缓存（singletonObjects）**：存储完全初始化的单例对象
2. **二级缓存（earlySingletonObjects）**：存储早期暴露的对象
3. **三级缓存（singletonFactories）**：存储对象工厂

**解决流程**：
1. A 创建 → 实例化 → 放入三级缓存
2. A 属性填充 → 需要 B → 创建 B
3. B 创建 → 实例化 → 放入三级缓存
4. B 属性填充 → 需要 A → 从三级缓存获取 A
5. B 完成初始化 → 放入一级缓存
6. A 注入 B → 完成初始化 → 放入一级缓存

**第三层（扩展延伸 - 95分）**：
从源码角度详细说明：

**核心方法：DefaultSingletonBeanRegistry.getSingleton()**

```java
getSingleton(beanName) 查找顺序：
1. 一级缓存 singletonObjects
2. 检查是否正在创建
3. 二级缓存 earlySingletonObjects
4. 三级缓存 singletonFactories
   └─> 调用工厂 getEarlyBeanReference()
       └─> 如果需要 AOP，创建代理对象
```

**为什么需要三级缓存**：
- 一级：存储完整对象
- 二级：避免重复调用工厂
- 三级：延迟创建代理（getEarlyBeanReference 可能创建 AOP 代理）

**不支持的场景**：
- ❌ 构造器注入：无法提前暴露
- ❌ 原型 Bean：不缓存
- ✅ Setter 注入单例：支持

**追问应对**：

**追问 1：为什么需要二级缓存？不能只用一级和三级吗？**
- 如果只用一级和三级，每次获取早期引用都要调用工厂
- 可能多次创建代理对象（浪费资源、对象不一致）
- 二级缓存避免重复调用工厂

**追问 2：循环依赖时 AOP 代理何时创建？**
- 正常：初始化后阶段（postProcessAfterInitialization）
- 循环依赖：提前创建（getEarlyBeanReference）
- 初始化后检测到早期引用，跳过代理创建

**加分项**：
- 能画出完整的三级缓存流程图
- 能说出 getEarlyBeanReference 的作用
- 能解释为什么构造器注入不支持循环依赖

---

## 9. 学习自检清单

- [ ] 能够解释什么是循环依赖
- [ ] 能够说出三级缓存的作用
- [ ] 能够画出循环依赖解决流程图
- [ ] 能够说明哪些场景不支持循环依赖
- [ ] 能够解决实际的循环依赖问题
- [ ] 能够解释循环依赖与 AOP 的关系

**学习建议**：
- **预计学习时长**：3 小时
- **重点难点**：三级缓存设计、AOP 代理创建时机
- **前置知识**：Bean 生命周期、依赖注入
- **实践建议**：
  - 调试 getSingleton() 方法
  - 构造循环依赖场景并分析
  - 对比有无 AOP 时的流程差异

---

## 10. 参考资料

**Spring 官方文档**：
- [Circular Dependencies](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-dependency-resolution)

**源码位置**：
- `org.springframework.beans.factory.support.DefaultSingletonBeanRegistry`
- `org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean()`
- `org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator`

---

**上一章** ← [第 7 章：Bean 生命周期扩展点](./content-7.md)  
**下一章** → [第 9 章：AOP 核心概念与架构](./content-9.md)  
**返回目录** → [学习大纲](../content-outline.md)

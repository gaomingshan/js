# 第 6 章：Bean 完整生命周期

> **学习目标**：掌握 Spring Bean 从创建到销毁的完整生命周期，理解各阶段的核心方法  
> **预计时长**：4 小时  
> **难度级别**：⭐⭐⭐⭐ 高级  
> **源码入口**：`AbstractAutowireCapableBeanFactory.doCreateBean()`

---

## 1. 核心概念

### 1.1 Bean 生命周期概述

Spring Bean 的生命周期是指 Bean 从创建、初始化、使用到销毁的完整过程。

**完整生命周期图**：

```
┌─────────────────────────────────────────────────────────┐
│                    Bean 生命周期                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. 实例化 (Instantiation)                               │
│     ├─ InstantiationAwareBeanPostProcessor              │
│     │   .postProcessBeforeInstantiation()               │
│     ├─ 构造器 / 工厂方法                                 │
│     └─ InstantiationAwareBeanPostProcessor              │
│         .postProcessAfterInstantiation()                 │
│                                                          │
│  2. 属性填充 (Population)                                │
│     ├─ InstantiationAwareBeanPostProcessor              │
│     │   .postProcessProperties()                        │
│     └─ 依赖注入                                          │
│                                                          │
│  3. 初始化 (Initialization)                              │
│     ├─ Aware 接口回调                                    │
│     │   ├─ BeanNameAware.setBeanName()                  │
│     │   ├─ BeanClassLoaderAware.setBeanClassLoader()    │
│     │   └─ BeanFactoryAware.setBeanFactory()            │
│     ├─ BeanPostProcessor.postProcessBeforeInitialization()│
│     │   └─ ApplicationContextAwareProcessor              │
│     │       ├─ EnvironmentAware                         │
│     │       ├─ ApplicationContextAware                  │
│     │       └─ ...                                       │
│     ├─ InitializingBean.afterPropertiesSet()            │
│     ├─ 自定义 init-method                                │
│     └─ BeanPostProcessor.postProcessAfterInitialization()│
│         └─ AbstractAutoProxyCreator (AOP 代理)          │
│                                                          │
│  4. 使用 (In Use)                                        │
│     └─ Bean 可以被应用程序使用                           │
│                                                          │
│  5. 销毁 (Destruction)                                   │
│     ├─ DestructionAwareBeanPostProcessor                │
│     │   .postProcessBeforeDestruction()                  │
│     ├─ DisposableBean.destroy()                         │
│     └─ 自定义 destroy-method                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心阶段

Bean 生命周期可以分为 **4 个核心阶段**：

1. **实例化（Instantiation）**：创建 Bean 实例
2. **属性填充（Population）**：依赖注入
3. **初始化（Initialization）**：执行初始化逻辑
4. **销毁（Destruction）**：清理资源

---

## 2. 阶段 1：实例化（Instantiation）

### 2.1 实例化前处理

```java
// AbstractAutowireCapableBeanFactory.createBean()
@Override
protected Object createBean(String beanName, RootBeanDefinition mbd, Object[] args) {
    RootBeanDefinition mbdToUse = mbd;
    
    // 1. 确保 Bean Class 已加载
    Class<?> resolvedClass = resolveBeanClass(mbd, beanName);
    if (resolvedClass != null && !mbd.hasBeanClass() && mbd.getBeanClassName() != null) {
        mbdToUse = new RootBeanDefinition(mbd);
        mbdToUse.setBeanClass(resolvedClass);
    }
    
    // 2. 准备方法覆盖
    try {
        mbdToUse.prepareMethodOverrides();
    } catch (BeanDefinitionValidationException ex) {
        throw new BeanDefinitionStoreException(mbdToUse.getResourceDescription(),
            beanName, "Validation of method overrides failed", ex);
    }
    
    try {
        // 3. 实例化前处理：给 BeanPostProcessors 一个返回代理对象的机会
        Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
        if (bean != null) {
            return bean; // 短路：直接返回代理对象
        }
    } catch (Throwable ex) {
        throw new BeanCreationException(mbdToUse.getResourceDescription(), beanName,
            "BeanPostProcessor before instantiation of bean failed", ex);
    }
    
    try {
        // 4. 真正创建 Bean
        Object beanInstance = doCreateBean(beanName, mbdToUse, args);
        return beanInstance;
    } catch (BeanCreationException | ImplicitlyAppearedSingletonException ex) {
        throw ex;
    } catch (Throwable ex) {
        throw new BeanCreationException(
            mbdToUse.getResourceDescription(), beanName, "Unexpected exception during bean creation", ex);
    }
}

protected Object resolveBeforeInstantiation(String beanName, RootBeanDefinition mbd) {
    Object bean = null;
    if (!Boolean.FALSE.equals(mbd.beforeInstantiationResolved)) {
        if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
            Class<?> targetType = determineTargetType(beanName, mbd);
            if (targetType != null) {
                // 调用 InstantiationAwareBeanPostProcessor.postProcessBeforeInstantiation()
                bean = applyBeanPostProcessorsBeforeInstantiation(targetType, beanName);
                if (bean != null) {
                    // 如果返回了代理对象，调用后置处理器
                    bean = applyBeanPostProcessorsAfterInitialization(bean, beanName);
                }
            }
        }
        mbd.beforeInstantiationResolved = (bean != null);
    }
    return bean;
}
```

### 2.2 实例化：doCreateBean()

```java
protected Object doCreateBean(String beanName, RootBeanDefinition mbd, Object[] args) {
    // 1. 实例化 Bean
    BeanWrapper instanceWrapper = null;
    if (mbd.isSingleton()) {
        instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
    }
    if (instanceWrapper == null) {
        // 真正的实例化
        instanceWrapper = createBeanInstance(beanName, mbd, args);
    }
    Object bean = instanceWrapper.getWrappedInstance();
    Class<?> beanType = instanceWrapper.getWrappedClass();
    if (beanType != NullBean.class) {
        mbd.resolvedTargetType = beanType;
    }
    
    // 2. MergedBeanDefinitionPostProcessor 处理
    synchronized (mbd.postProcessingLock) {
        if (!mbd.postProcessed) {
            try {
                applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
            } catch (Throwable ex) {
                throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "Post-processing of merged bean definition failed", ex);
            }
            mbd.postProcessed = true;
        }
    }
    
    // 3. 提前暴露单例（解决循环依赖）
    boolean earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences &&
        isSingletonCurrentlyInCreation(beanName));
    if (earlySingletonExposure) {
        addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
    }
    
    // 4. 属性填充
    Object exposedObject = bean;
    try {
        populateBean(beanName, mbd, instanceWrapper);
        // 5. 初始化
        exposedObject = initializeBean(beanName, exposedObject, mbd);
    } catch (Throwable ex) {
        if (ex instanceof BeanCreationException && beanName.equals(((BeanCreationException) ex).getBeanName())) {
            throw (BeanCreationException) ex;
        } else {
            throw new BeanCreationException(
                mbd.getResourceDescription(), beanName, "Initialization of bean failed", ex);
        }
    }
    
    // 6. 处理循环依赖
    if (earlySingletonExposure) {
        Object earlySingletonReference = getSingleton(beanName, false);
        if (earlySingletonReference != null) {
            if (exposedObject == bean) {
                exposedObject = earlySingletonReference;
            } else if (!this.allowRawInjectionDespiteWrapping && hasDependentBean(beanName)) {
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
    
    // 7. 注册 DisposableBean
    try {
        registerDisposableBeanIfNecessary(beanName, bean, mbd);
    } catch (BeanDefinitionValidationException ex) {
        throw new BeanCreationException(
            mbd.getResourceDescription(), beanName, "Invalid destruction signature", ex);
    }
    
    return exposedObject;
}
```

### 2.3 创建 Bean 实例

```java
protected BeanWrapper createBeanInstance(String beanName, RootBeanDefinition mbd, Object[] args) {
    // 1. 确保 Bean Class 已加载
    Class<?> beanClass = resolveBeanClass(mbd, beanName);
    
    if (beanClass != null && !Modifier.isPublic(beanClass.getModifiers()) && !mbd.isNonPublicAccessAllowed()) {
        throw new BeanCreationException(mbd.getResourceDescription(), beanName,
            "Bean class isn't public, and non-public access not allowed: " + beanClass.getName());
    }
    
    // 2. Supplier 回调
    Supplier<?> instanceSupplier = mbd.getInstanceSupplier();
    if (instanceSupplier != null) {
        return obtainFromSupplier(instanceSupplier, beanName);
    }
    
    // 3. 工厂方法实例化
    if (mbd.getFactoryMethodName() != null) {
        return instantiateUsingFactoryMethod(beanName, mbd, args);
    }
    
    // 4. 快捷方式：已解析的构造器
    boolean resolved = false;
    boolean autowireNecessary = false;
    if (args == null) {
        synchronized (mbd.constructorArgumentLock) {
            if (mbd.resolvedConstructorOrFactoryMethod != null) {
                resolved = true;
                autowireNecessary = mbd.constructorArgumentsResolved;
            }
        }
    }
    if (resolved) {
        if (autowireNecessary) {
            return autowireConstructor(beanName, mbd, null, null);
        } else {
            return instantiateBean(beanName, mbd);
        }
    }
    
    // 5. 需要确定构造器
    Constructor<?>[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
    if (ctors != null || mbd.getResolvedAutowireMode() == AUTOWIRE_CONSTRUCTOR ||
            mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args)) {
        // 构造器自动装配
        return autowireConstructor(beanName, mbd, ctors, args);
    }
    
    // 6. 首选构造器
    ctors = mbd.getPreferredConstructors();
    if (ctors != null) {
        return autowireConstructor(beanName, mbd, ctors, null);
    }
    
    // 7. 无参构造器（默认）
    return instantiateBean(beanName, mbd);
}

protected BeanWrapper instantiateBean(String beanName, RootBeanDefinition mbd) {
    try {
        Object beanInstance;
        if (System.getSecurityManager() != null) {
            beanInstance = AccessController.doPrivileged(
                (PrivilegedAction<Object>) () -> getInstantiationStrategy().instantiate(mbd, beanName, this),
                getAccessControlContext());
        } else {
            // 使用实例化策略（默认：CglibSubclassingInstantiationStrategy）
            beanInstance = getInstantiationStrategy().instantiate(mbd, beanName, this);
        }
        BeanWrapper bw = new BeanWrapperImpl(beanInstance);
        initBeanWrapper(bw);
        return bw;
    } catch (Throwable ex) {
        throw new BeanCreationException(
            mbd.getResourceDescription(), beanName, "Instantiation of bean failed", ex);
    }
}
```

### 2.4 实例化后处理

```java
protected void applyMergedBeanDefinitionPostProcessors(RootBeanDefinition mbd, Class<?> beanType, String beanName) {
    for (BeanPostProcessor bp : getBeanPostProcessors()) {
        if (bp instanceof MergedBeanDefinitionPostProcessor) {
            MergedBeanDefinitionPostProcessor bdp = (MergedBeanDefinitionPostProcessor) bp;
            // 收集注入元数据（@Autowired、@Resource等）
            bdp.postProcessMergedBeanDefinition(mbd, beanType, beanName);
        }
    }
}
```

---

## 3. 阶段 2：属性填充（Population）

```java
protected void populateBean(String beanName, RootBeanDefinition mbd, BeanWrapper bw) {
    if (bw == null) {
        if (mbd.hasPropertyValues()) {
            throw new BeanCreationException(
                mbd.getResourceDescription(), beanName, "Cannot apply property values to null instance");
        } else {
            return;
        }
    }
    
    // 1. 实例化后处理
    if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
        for (BeanPostProcessor bp : getBeanPostProcessors()) {
            if (bp instanceof InstantiationAwareBeanPostProcessor) {
                InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
                // 返回 false 可以阻止属性填充
                if (!ibp.postProcessAfterInstantiation(bw.getWrappedInstance(), beanName)) {
                    return;
                }
            }
        }
    }
    
    PropertyValues pvs = (mbd.hasPropertyValues() ? mbd.getPropertyValues() : null);
    
    // 2. 自动装配模式
    int resolvedAutowireMode = mbd.getResolvedAutowireMode();
    if (resolvedAutowireMode == AUTOWIRE_BY_NAME || resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
        MutablePropertyValues newPvs = new MutablePropertyValues(pvs);
        // 按名称自动装配
        if (resolvedAutowireMode == AUTOWIRE_BY_NAME) {
            autowireByName(beanName, mbd, bw, newPvs);
        }
        // 按类型自动装配
        if (resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
            autowireByType(beanName, mbd, bw, newPvs);
        }
        pvs = newPvs;
    }
    
    boolean hasInstAwareBpps = hasInstantiationAwareBeanPostProcessors();
    boolean needsDepCheck = (mbd.getDependencyCheck() != AbstractBeanDefinition.DEPENDENCY_CHECK_NONE);
    
    PropertyDescriptor[] filteredPds = null;
    if (hasInstAwareBpps) {
        if (pvs == null) {
            pvs = mbd.getPropertyValues();
        }
        // 3. 属性后处理（@Autowired、@Resource 注入）
        for (BeanPostProcessor bp : getBeanPostProcessors()) {
            if (bp instanceof InstantiationAwareBeanPostProcessor) {
                InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
                // 关键：执行属性注入
                PropertyValues pvsToUse = ibp.postProcessProperties(pvs, bw.getWrappedInstance(), beanName);
                if (pvsToUse == null) {
                    if (filteredPds == null) {
                        filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
                    }
                    pvsToUse = ibp.postProcessPropertyValues(pvs, filteredPds, bw.getWrappedInstance(), beanName);
                    if (pvsToUse == null) {
                        return;
                    }
                }
                pvs = pvsToUse;
            }
        }
    }
    
    // 4. 依赖检查
    if (needsDepCheck) {
        if (filteredPds == null) {
            filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
        }
        checkDependencies(beanName, mbd, filteredPds, pvs);
    }
    
    // 5. 应用属性值
    if (pvs != null) {
        applyPropertyValues(beanName, mbd, bw, pvs);
    }
}
```

---

## 4. 阶段 3：初始化（Initialization）

```java
protected Object initializeBean(String beanName, Object bean, RootBeanDefinition mbd) {
    // 1. Aware 接口回调
    if (System.getSecurityManager() != null) {
        AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
            invokeAwareMethods(beanName, bean);
            return null;
        }, getAccessControlContext());
    } else {
        invokeAwareMethods(beanName, bean);
    }
    
    Object wrappedBean = bean;
    
    // 2. 初始化前处理
    if (mbd == null || !mbd.isSynthetic()) {
        wrappedBean = applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);
    }
    
    // 3. 初始化方法
    try {
        invokeInitMethods(beanName, wrappedBean, mbd);
    } catch (Throwable ex) {
        throw new BeanCreationException(
            (mbd != null ? mbd.getResourceDescription() : null),
            beanName, "Invocation of init method failed", ex);
    }
    
    // 4. 初始化后处理（AOP 代理）
    if (mbd == null || !mbd.isSynthetic()) {
        wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
    }
    
    return wrappedBean;
}
```

### 4.1 Aware 接口回调

```java
private void invokeAwareMethods(String beanName, Object bean) {
    if (bean instanceof Aware) {
        // 1. BeanNameAware
        if (bean instanceof BeanNameAware) {
            ((BeanNameAware) bean).setBeanName(beanName);
        }
        // 2. BeanClassLoaderAware
        if (bean instanceof BeanClassLoaderAware) {
            ClassLoader bcl = getBeanClassLoader();
            if (bcl != null) {
                ((BeanClassLoaderAware) bean).setBeanClassLoader(bcl);
            }
        }
        // 3. BeanFactoryAware
        if (bean instanceof BeanFactoryAware) {
            ((BeanFactoryAware) bean).setBeanFactory(AbstractAutowireCapableBeanFactory.this);
        }
    }
}
```

### 4.2 初始化前处理

```java
@Override
public Object applyBeanPostProcessorsBeforeInitialization(Object existingBean, String beanName) {
    Object result = existingBean;
    for (BeanPostProcessor processor : getBeanPostProcessors()) {
        // 调用所有 BeanPostProcessor 的前置处理
        Object current = processor.postProcessBeforeInitialization(result, beanName);
        if (current == null) {
            return result;
        }
        result = current;
    }
    return result;
}
```

**ApplicationContextAwareProcessor** 处理更多 Aware 接口：

```java
class ApplicationContextAwareProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        if (!(bean instanceof EnvironmentAware || bean instanceof EmbeddedValueResolverAware ||
                bean instanceof ResourceLoaderAware || bean instanceof ApplicationEventPublisherAware ||
                bean instanceof MessageSourceAware || bean instanceof ApplicationContextAware)) {
            return bean;
        }
        
        AccessControlContext acc = null;
        if (System.getSecurityManager() != null) {
            acc = this.applicationContext.getBeanFactory().getAccessControlContext();
        }
        
        if (acc != null) {
            AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
                invokeAwareInterfaces(bean);
                return null;
            }, acc);
        } else {
            invokeAwareInterfaces(bean);
        }
        
        return bean;
    }
    
    private void invokeAwareInterfaces(Object bean) {
        if (bean instanceof EnvironmentAware) {
            ((EnvironmentAware) bean).setEnvironment(this.applicationContext.getEnvironment());
        }
        if (bean instanceof EmbeddedValueResolverAware) {
            ((EmbeddedValueResolverAware) bean).setEmbeddedValueResolver(this.embeddedValueResolver);
        }
        if (bean instanceof ResourceLoaderAware) {
            ((ResourceLoaderAware) bean).setResourceLoader(this.applicationContext);
        }
        if (bean instanceof ApplicationEventPublisherAware) {
            ((ApplicationEventPublisherAware) bean).setApplicationEventPublisher(this.applicationContext);
        }
        if (bean instanceof MessageSourceAware) {
            ((MessageSourceAware) bean).setMessageSource(this.applicationContext);
        }
        if (bean instanceof ApplicationContextAware) {
            ((ApplicationContextAware) bean).setApplicationContext(this.applicationContext);
        }
    }
}
```

### 4.3 初始化方法

```java
protected void invokeInitMethods(String beanName, Object bean, RootBeanDefinition mbd) {
    // 1. InitializingBean 接口
    boolean isInitializingBean = (bean instanceof InitializingBean);
    if (isInitializingBean && (mbd == null || !mbd.isExternallyManagedInitMethod("afterPropertiesSet"))) {
        if (System.getSecurityManager() != null) {
            try {
                AccessController.doPrivileged((PrivilegedExceptionAction<Object>) () -> {
                    ((InitializingBean) bean).afterPropertiesSet();
                    return null;
                }, getAccessControlContext());
            } catch (PrivilegedActionException pae) {
                throw pae.getException();
            }
        } else {
            ((InitializingBean) bean).afterPropertiesSet();
        }
    }
    
    // 2. 自定义 init-method
    if (mbd != null && bean.getClass() != NullBean.class) {
        String initMethodName = mbd.getInitMethodName();
        if (StringUtils.hasLength(initMethodName) &&
                !(isInitializingBean && "afterPropertiesSet".equals(initMethodName)) &&
                !mbd.isExternallyManagedInitMethod(initMethodName)) {
            invokeCustomInitMethod(beanName, bean, mbd);
        }
    }
}
```

### 4.4 初始化后处理（AOP 代理）

```java
@Override
public Object applyBeanPostProcessorsAfterInitialization(Object existingBean, String beanName) {
    Object result = existingBean;
    for (BeanPostProcessor processor : getBeanPostProcessors()) {
        // 调用所有 BeanPostProcessor 的后置处理
        // AbstractAutoProxyCreator 在这里创建 AOP 代理
        Object current = processor.postProcessAfterInitialization(result, beanName);
        if (current == null) {
            return result;
        }
        result = current;
    }
    return result;
}
```

---

## 5. 阶段 4：销毁（Destruction）

### 5.1 注册销毁回调

```java
protected void registerDisposableBeanIfNecessary(String beanName, Object bean, RootBeanDefinition mbd) {
    AccessControlContext acc = (System.getSecurityManager() != null ? getAccessControlContext() : null);
    
    if (!mbd.isPrototype() && requiresDestruction(bean, mbd)) {
        if (mbd.isSingleton()) {
            // 单例：注册 DisposableBean
            registerDisposableBean(beanName,
                new DisposableBeanAdapter(bean, beanName, mbd, getBeanPostProcessors(), acc));
        } else {
            // 自定义作用域
            Scope scope = this.scopes.get(mbd.getScope());
            if (scope == null) {
                throw new IllegalStateException("No Scope registered for scope name '" + mbd.getScope() + "'");
            }
            scope.registerDestructionCallback(beanName,
                new DisposableBeanAdapter(bean, beanName, mbd, getBeanPostProcessors(), acc));
        }
    }
}
```

### 5.2 销毁执行

```java
// DisposableBeanAdapter
class DisposableBeanAdapter implements DisposableBean, Runnable, Serializable {
    @Override
    public void destroy() {
        // 1. DestructionAwareBeanPostProcessor 前置处理
        if (!CollectionUtils.isEmpty(this.beanPostProcessors)) {
            for (DestructionAwareBeanPostProcessor processor : this.beanPostProcessors) {
                processor.postProcessBeforeDestruction(this.bean, this.beanName);
            }
        }
        
        // 2. DisposableBean 接口
        if (this.invokeDisposableBean) {
            try {
                if (System.getSecurityManager() != null) {
                    AccessController.doPrivileged((PrivilegedExceptionAction<Object>) () -> {
                        ((DisposableBean) this.bean).destroy();
                        return null;
                    }, this.acc);
                } else {
                    ((DisposableBean) this.bean).destroy();
                }
            } catch (Throwable ex) {
                String msg = "Invocation of destroy method failed on bean with name '" + this.beanName + "'";
                logger.debug(msg, ex);
            }
        }
        
        // 3. 自定义 destroy-method
        if (this.destroyMethod != null) {
            invokeCustomDestroyMethod(this.destroyMethod);
        } else if (this.destroyMethodName != null) {
            Method methodToInvoke = determineDestroyMethod(this.destroyMethodName);
            if (methodToInvoke != null) {
                invokeCustomDestroyMethod(ClassUtils.getInterfaceMethodIfPossible(methodToInvoke));
            }
        }
    }
}
```

---

## 6. 完整时序图

```
ApplicationContext.refresh()
    │
    ├─> finishBeanFactoryInitialization()
    │      │
    │      └─> preInstantiateSingletons()
    │             │
    │             └─> getBean("userService")
    │                    │
    │                    ├─> createBean()
    │                    │      │
    │                    │      ├─> resolveBeforeInstantiation()
    │                    │      │     └─> InstantiationAwareBPP.postProcessBeforeInstantiation()
    │                    │      │
    │                    │      └─> doCreateBean()
    │                    │             │
    │                    │             ├─> createBeanInstance() ────────────────┐
    │                    │             │     ├─> determineConstructors()         │ 实例化
    │                    │             │     └─> instantiate()                   │
    │                    │             │                                         ┘
    │                    │             ├─> applyMergedBeanDefinitionPostProcessors()
    │                    │             │     └─> MergedBeanDefinitionPostProcessor
    │                    │             │           └─ 收集 @Autowired 元数据
    │                    │             │
    │                    │             ├─> addSingletonFactory() ───────────────┐
    │                    │             │     └─ 提前暴露（解决循环依赖）          │ 暴露
    │                    │             │                                         ┘
    │                    │             ├─> populateBean() ────────────────────┐
    │                    │             │     ├─> InstantiationAwareBPP         │ 属性填充
    │                    │             │     │     .postProcessAfterInstantiation() │
    │                    │             │     ├─> autowireByName/Type()         │
    │                    │             │     └─> InstantiationAwareBPP         │
    │                    │             │           .postProcessProperties()    │
    │                    │             │              └─ @Autowired 注入        │
    │                    │             │                                         ┘
    │                    │             └─> initializeBean() ──────────────────┐
    │                    │                   │                                  │ 初始化
    │                    │                   ├─> invokeAwareMethods()          │
    │                    │                   │     ├─ BeanNameAware            │
    │                    │                   │     ├─ BeanClassLoaderAware     │
    │                    │                   │     └─ BeanFactoryAware         │
    │                    │                   │                                  │
    │                    │                   ├─> applyBPPBeforeInitialization() │
    │                    │                   │     └─ ApplicationContextAwareProcessor │
    │                    │                   │          ├─ EnvironmentAware    │
    │                    │                   │          ├─ ApplicationContextAware │
    │                    │                   │          └─ ...                 │
    │                    │                   │                                  │
    │                    │                   ├─> invokeInitMethods()           │
    │                    │                   │     ├─ InitializingBean.afterPropertiesSet() │
    │                    │                   │     └─ custom init-method       │
    │                    │                   │                                  │
    │                    │                   └─> applyBPPAfterInitialization()  │
    │                    │                         └─ AbstractAutoProxyCreator │
    │                    │                              └─ 创建 AOP 代理       │
    │                    │                                                      ┘
    │                    └─> addSingleton() ─────────────────────────────────┐
    │                          └─ 放入单例池                                   │ 缓存
    │                                                                          ┘
    │
    └─> 容器关闭: close()
           │
           └─> destroyBeans()
                  │
                  └─> DisposableBean.destroy() ─────────────────────────────┐
                        ├─> DestructionAwareBPP.postProcessBeforeDestruction() │ 销毁
                        ├─> DisposableBean.destroy()                        │
                        └─> custom destroy-method                           │
                                                                              ┘
```

---

## 7. 实际落地场景（工作实战）

### 场景 1：自定义初始化和销毁逻辑

```java
@Component
public class DataSourceManager {
    private HikariDataSource dataSource;
    
    // 方式1：@PostConstruct 和 @PreDestroy
    @PostConstruct
    public void init() {
        System.out.println("初始化数据源...");
        dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/db");
        dataSource.setUsername("root");
        dataSource.setPassword("password");
    }
    
    @PreDestroy
    public void cleanup() {
        System.out.println("关闭数据源...");
        if (dataSource != null) {
            dataSource.close();
        }
    }
    
    // 方式2：InitializingBean 和 DisposableBean
    @Override
    public void afterPropertiesSet() {
        System.out.println("InitializingBean: 属性设置完成后执行");
    }
    
    @Override
    public void destroy() {
        System.out.println("DisposableBean: 销毁前执行");
    }
    
    // 方式3：@Bean 的 initMethod 和 destroyMethod
    @Configuration
    public class DataSourceConfig {
        @Bean(initMethod = "init", destroyMethod = "cleanup")
        public DataSourceManager dataSourceManager() {
            return new DataSourceManager();
        }
    }
}
```

**执行顺序**：

```
初始化顺序：
1. @PostConstruct
2. InitializingBean.afterPropertiesSet()
3. @Bean(initMethod)

销毁顺序：
1. @PreDestroy
2. DisposableBean.destroy()
3. @Bean(destroyMethod)
```

### 场景 2：使用 Aware 接口获取容器信息

```java
@Component
public class BeanInfoPrinter implements BeanNameAware, ApplicationContextAware {
    private String beanName;
    private ApplicationContext applicationContext;
    
    @Override
    public void setBeanName(String name) {
        this.beanName = name;
        System.out.println("Bean名称: " + name);
    }
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
        System.out.println("容器信息: " + applicationContext.getDisplayName());
    }
    
    @PostConstruct
    public void init() {
        // 可以访问容器中的其他Bean
        String[] beanNames = applicationContext.getBeanDefinitionNames();
        System.out.println("容器中的Bean数量: " + beanNames.length);
    }
}
```

### 场景 3：自定义 BeanPostProcessor

```java
@Component
public class CustomBeanPostProcessor implements BeanPostProcessor {
    
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        if (bean instanceof UserService) {
            System.out.println("初始化前: " + beanName);
        }
        return bean;
    }
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (bean instanceof UserService) {
            System.out.println("初始化后: " + beanName);
            // 可以返回代理对象
        }
        return bean;
    }
}
```

---

## 8. 面试准备专项

### 高频面试题：Bean 的完整生命周期是什么？

**第一层（基础回答 - 60分）**：
Bean 生命周期包括实例化、属性填充、初始化、使用、销毁五个阶段。

**第二层（深入原理 - 80分）**：
Bean 生命周期分为以下阶段：

1. **实例化**：通过构造器或工厂方法创建 Bean 实例
2. **属性填充**：依赖注入，设置 Bean 的属性值
3. **初始化**：
   - Aware 接口回调（BeanNameAware、ApplicationContextAware 等）
   - BeanPostProcessor 前置处理
   - InitializingBean.afterPropertiesSet()
   - 自定义 init-method
   - BeanPostProcessor 后置处理（AOP 代理）
4. **使用**：Bean 可以被应用程序使用
5. **销毁**：
   - @PreDestroy
   - DisposableBean.destroy()
   - 自定义 destroy-method

**第三层（扩展延伸 - 95分）**：
从源码角度详细说明：

**核心方法：AbstractAutowireCapableBeanFactory.doCreateBean()**

```java
1. createBeanInstance() - 实例化
   ├─> 选择构造器
   ├─> 反射创建实例
   └─> InstantiationAwareBPP.postProcessAfterInstantiation()

2. applyMergedBeanDefinitionPostProcessors() - 收集元数据
   └─> AutowiredAnnotationBPP 收集 @Autowired 信息

3. addSingletonFactory() - 提前暴露（解决循环依赖）

4. populateBean() - 属性填充
   ├─> InstantiationAwareBPP.postProcessProperties()
   └─> 执行依赖注入

5. initializeBean() - 初始化
   ├─> invokeAwareMethods() - Aware 接口回调
   ├─> applyBPPBeforeInitialization() - 前置处理
   ├─> invokeInitMethods() - 初始化方法
   └─> applyBPPAfterInitialization() - 后置处理（AOP）

6. registerDisposableBeanIfNecessary() - 注册销毁回调
```

**扩展点机制**：
- **InstantiationAwareBeanPostProcessor**：实例化前后扩展
- **MergedBeanDefinitionPostProcessor**：合并 Bean 定义
- **BeanPostProcessor**：初始化前后扩展
- **DestructionAwareBeanPostProcessor**：销毁前扩展

**追问应对**：

**追问 1：BeanPostProcessor 在生命周期中的作用？**
- 在初始化前后提供扩展点
- 可以修改 Bean 实例（如创建代理）
- Spring AOP 就是通过 AbstractAutoProxyCreator（BeanPostProcessor）创建代理

**追问 2：InitializingBean 和 init-method 的区别？**
- InitializingBean 是接口回调，与 Spring 耦合
- init-method 是配置方式，解耦
- 执行顺序：InitializingBean 先于 init-method

**加分项**：
- 能画出完整的生命周期图
- 能说出每个阶段的核心方法
- 能结合 AOP 代理创建时机说明

---

## 9. 学习自检清单

- [ ] 能够画出 Bean 完整生命周期图
- [ ] 能够说出各阶段的核心方法
- [ ] 能够解释 Aware 接口的作用和执行时机
- [ ] 能够说明 BeanPostProcessor 的作用
- [ ] 能够区分三种初始化方式的执行顺序
- [ ] 能够实现自定义 BeanPostProcessor

**学习建议**：
- **预计学习时长**：4 小时
- **重点难点**：生命周期各阶段、扩展点机制、AOP 代理创建时机
- **前置知识**：IoC 容器、依赖注入
- **实践建议**：
  - 调试 doCreateBean() 方法
  - 实现自定义 BeanPostProcessor
  - 使用 Aware 接口获取容器信息

---

## 10. 参考资料

**Spring 官方文档**：
- [Bean Lifecycle](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-lifecycle)

**源码位置**：
- `org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean()`
- `org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean()`
- `org.springframework.beans.factory.support.DisposableBeanAdapter`

---

**上一章** ← [第 5 章：依赖注入实现机制](./content-5.md)  
**下一章** → [第 7 章：Bean 生命周期扩展点](./content-7.md)  
**返回目录** → [学习大纲](../content-outline.md)

# 第 4 章：容器启动流程详解

> **学习目标**：深入理解 Spring 容器的启动全流程，掌握 refresh() 方法的 12 个核心步骤  
> **预计时长**：4 小时  
> **难度级别**：⭐⭐⭐⭐ 高级  
> **源码入口**：`AbstractApplicationContext.refresh()`

---

## 1. 核心概念

### 1.1 容器启动是什么

容器启动是 Spring 应用的**初始化过程**，从配置加载到 Bean 创建完成，容器进入可用状态。

**核心流程**：
```
启动入口
   ↓
配置加载 → Bean定义注册 → Bean实例化 → 依赖注入 → 初始化回调 → 容器就绪
```

### 1.2 refresh() 方法 - 容器启动的心脏

`AbstractApplicationContext.refresh()` 是容器启动的核心方法，包含 **12 个关键步骤**：

```java
public void refresh() throws BeansException, IllegalStateException {
    synchronized (this.startupShutdownMonitor) {
        // 1. 准备刷新上下文环境
        prepareRefresh();
        
        // 2. 获取 BeanFactory
        ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
        
        // 3. 准备 BeanFactory
        prepareBeanFactory(beanFactory);
        
        try {
            // 4. 后置处理 BeanFactory（子类扩展点）
            postProcessBeanFactory(beanFactory);
            
            // 5. 调用 BeanFactoryPostProcessor
            invokeBeanFactoryPostProcessors(beanFactory);
            
            // 6. 注册 BeanPostProcessor
            registerBeanPostProcessors(beanFactory);
            
            // 7. 初始化消息源（国际化）
            initMessageSource();
            
            // 8. 初始化事件多播器
            initApplicationEventMulticaster();
            
            // 9. 初始化特殊 Bean（子类扩展点）
            onRefresh();
            
            // 10. 注册监听器
            registerListeners();
            
            // 11. 实例化所有非懒加载的单例 Bean
            finishBeanFactoryInitialization(beanFactory);
            
            // 12. 完成刷新，发布事件
            finishRefresh();
        }
        catch (BeansException ex) {
            // 销毁已创建的单例 Bean
            destroyBeans();
            // 取消刷新
            cancelRefresh(ex);
            throw ex;
        }
        finally {
            // 重置缓存
            resetCommonCaches();
        }
    }
}
```

---

## 2. 容器启动完整时序图

```
┌──────────────┐
│ Spring 应用   │
└──────┬───────┘
       │ new AnnotationConfigApplicationContext()
       ↓
┌──────────────────────────────────────────────┐
│  AbstractApplicationContext                  │
│                                              │
│  refresh() {                                 │
│                                              │
│    1. prepareRefresh()                       │
│       ├─> 设置启动时间                        │
│       ├─> 设置活跃状态                        │
│       └─> 初始化属性源                        │
│                                              │
│    2. obtainFreshBeanFactory()               │
│       ├─> refreshBeanFactory()               │
│       │    └─> 创建 DefaultListableBeanFactory│
│       └─> getBeanFactory()                   │
│                                              │
│    3. prepareBeanFactory()                   │
│       ├─> 设置类加载器                        │
│       ├─> 设置表达式解析器                     │
│       ├─> 添加 BeanPostProcessor            │
│       └─> 注册默认环境 Bean                  │
│                                              │
│    4. postProcessBeanFactory()               │
│       └─> 子类扩展点（空实现）                │
│                                              │
│    5. invokeBeanFactoryPostProcessors()      │
│       ├─> 执行 BeanDefinitionRegistryPostProcessor │
│       │    └─> ConfigurationClassPostProcessor     │
│       │         ├─> 扫描 @Component              │
│       │         ├─> 解析 @Configuration          │
│       │         └─> 处理 @Import/@Bean          │
│       └─> 执行 BeanFactoryPostProcessor      │
│                                              │
│    6. registerBeanPostProcessors()           │
│       └─> 注册所有 BeanPostProcessor         │
│            ├─> AutowiredAnnotationBPP        │
│            ├─> CommonAnnotationBPP           │
│            └─> ApplicationContextAwareProcessor │
│                                              │
│    7. initMessageSource()                    │
│       └─> 初始化国际化资源                    │
│                                              │
│    8. initApplicationEventMulticaster()      │
│       └─> 初始化事件多播器                    │
│                                              │
│    9. onRefresh()                            │
│       └─> 子类扩展点（如创建 Web 容器）        │
│                                              │
│   10. registerListeners()                    │
│       └─> 注册监听器                         │
│                                              │
│   11. finishBeanFactoryInitialization()      │
│       └─> 实例化所有单例 Bean                │
│            └─> preInstantiateSingletons()   │
│                 └─> getBean() 循环           │
│                      ├─> createBean()        │
│                      ├─> populateBean()      │
│                      └─> initializeBean()    │
│                                              │
│   12. finishRefresh()                        │
│       ├─> 清除资源缓存                        │
│       ├─> 初始化生命周期处理器                │
│       ├─> 发布 ContextRefreshedEvent         │
│       └─> 启动生命周期 Bean                  │
│  }                                           │
└──────────────────────────────────────────────┘
```

---

## 3. 12 个核心步骤详解

### 步骤 1：prepareRefresh() - 准备刷新

```java
protected void prepareRefresh() {
    // 1. 记录启动时间
    this.startupDate = System.currentTimeMillis();
    
    // 2. 设置容器状态
    this.closed.set(false);  // 未关闭
    this.active.set(true);   // 已激活
    
    // 3. 打印日志
    if (logger.isDebugEnabled()) {
        logger.debug("Refreshing " + this);
    }
    
    // 4. 初始化属性源（子类可覆盖）
    initPropertySources();
    
    // 5. 验证必需属性
    getEnvironment().validateRequiredProperties();
    
    // 6. 创建早期事件集合
    if (this.earlyApplicationListeners == null) {
        this.earlyApplicationListeners = new LinkedHashSet<>(this.applicationListeners);
    } else {
        this.applicationListeners.clear();
        this.applicationListeners.addAll(this.earlyApplicationListeners);
    }
    
    // 7. 创建早期事件集合（容器刷新前发布的事件）
    this.earlyApplicationEvents = new LinkedHashSet<>();
}
```

**作用**：
- 设置容器启动时间和状态
- 初始化环境配置
- 准备事件收集

### 步骤 2：obtainFreshBeanFactory() - 获取 BeanFactory

```java
protected ConfigurableListableBeanFactory obtainFreshBeanFactory() {
    // 1. 刷新 BeanFactory（创建或重置）
    refreshBeanFactory();
    
    // 2. 返回 BeanFactory
    return getBeanFactory();
}

// GenericApplicationContext 实现
@Override
protected final void refreshBeanFactory() throws IllegalStateException {
    if (!this.refreshed.compareAndSet(false, true)) {
        throw new IllegalStateException("GenericApplicationContext does not support multiple refresh attempts");
    }
    // 设置序列化 ID
    this.beanFactory.setSerializationId(getId());
}

// AbstractRefreshableApplicationContext 实现
@Override
protected final void refreshBeanFactory() throws BeansException {
    // 如果已有 BeanFactory，先销毁
    if (hasBeanFactory()) {
        destroyBeans();
        closeBeanFactory();
    }
    
    try {
        // 创建新的 BeanFactory
        DefaultListableBeanFactory beanFactory = createBeanFactory();
        
        // 设置序列化 ID
        beanFactory.setSerializationId(getId());
        
        // 定制 BeanFactory
        customizeBeanFactory(beanFactory);
        
        // 加载 BeanDefinition
        loadBeanDefinitions(beanFactory);
        
        this.beanFactory = beanFactory;
    } catch (IOException ex) {
        throw new ApplicationContextException("I/O error parsing bean definition source", ex);
    }
}
```

**作用**：
- 创建 `DefaultListableBeanFactory`
- 加载 Bean 定义（XML、注解）
- 返回可配置的 BeanFactory

### 步骤 3：prepareBeanFactory() - 准备 BeanFactory

```java
protected void prepareBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    // 1. 设置类加载器
    beanFactory.setBeanClassLoader(getClassLoader());
    
    // 2. 设置 SpEL 表达式解析器
    beanFactory.setBeanExpressionResolver(new StandardBeanExpressionResolver(beanFactory.getBeanClassLoader()));
    
    // 3. 添加属性编辑器注册器
    beanFactory.addPropertyEditorRegistrar(new ResourceEditorRegistrar(this, getEnvironment()));
    
    // 4. 添加 ApplicationContextAwareProcessor（处理 Aware 接口）
    beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));
    
    // 5. 忽略依赖接口（这些接口的实现由容器注入，不需要自动装配）
    beanFactory.ignoreDependencyInterface(EnvironmentAware.class);
    beanFactory.ignoreDependencyInterface(EmbeddedValueResolverAware.class);
    beanFactory.ignoreDependencyInterface(ResourceLoaderAware.class);
    beanFactory.ignoreDependencyInterface(ApplicationEventPublisherAware.class);
    beanFactory.ignoreDependencyInterface(MessageSourceAware.class);
    beanFactory.ignoreDependencyInterface(ApplicationContextAware.class);
    
    // 6. 注册可解析的依赖（特殊 Bean 的注入）
    beanFactory.registerResolvableDependency(BeanFactory.class, beanFactory);
    beanFactory.registerResolvableDependency(ResourceLoader.class, this);
    beanFactory.registerResolvableDependency(ApplicationEventPublisher.class, this);
    beanFactory.registerResolvableDependency(ApplicationContext.class, this);
    
    // 7. 添加 ApplicationListenerDetector（检测 ApplicationListener Bean）
    beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(this));
    
    // 8. 检测 LoadTimeWeaver（AOP 织入）
    if (beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
        beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
        beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
    }
    
    // 9. 注册默认环境 Bean
    if (!beanFactory.containsLocalBean(ENVIRONMENT_BEAN_NAME)) {
        beanFactory.registerSingleton(ENVIRONMENT_BEAN_NAME, getEnvironment());
    }
    if (!beanFactory.containsLocalBean(SYSTEM_PROPERTIES_BEAN_NAME)) {
        beanFactory.registerSingleton(SYSTEM_PROPERTIES_BEAN_NAME, getEnvironment().getSystemProperties());
    }
    if (!beanFactory.containsLocalBean(SYSTEM_ENVIRONMENT_BEAN_NAME)) {
        beanFactory.registerSingleton(SYSTEM_ENVIRONMENT_BEAN_NAME, getEnvironment().getSystemEnvironment());
    }
}
```

**作用**：
- 配置 BeanFactory 的基础设施
- 添加 BeanPostProcessor
- 注册环境相关的单例 Bean

### 步骤 4：postProcessBeanFactory() - 后置处理 BeanFactory

```java
// AbstractApplicationContext 默认空实现
protected void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    // 子类可以覆盖此方法，对 BeanFactory 进行额外配置
}

// AnnotationConfigServletWebServerApplicationContext 实现
@Override
protected void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    super.postProcessBeanFactory(beanFactory);
    
    // 添加 WebApplicationContextServletContextAwareProcessor
    beanFactory.addBeanPostProcessor(
        new WebApplicationContextServletContextAwareProcessor(this)
    );
    
    // 忽略 ServletContextAware 接口
    beanFactory.ignoreDependencyInterface(ServletContextAware.class);
    
    // 注册 Web 作用域
    registerWebApplicationScopes();
}
```

**作用**：
- 子类扩展点
- Web 容器会在此注册 Web 相关的作用域和 BeanPostProcessor

### 步骤 5：invokeBeanFactoryPostProcessors() - 调用 BeanFactory 后置处理器

```java
protected void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory) {
    // 委托给 PostProcessorRegistrationDelegate 处理
    PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());
    
    // 检测 LoadTimeWeaver
    if (beanFactory.getTempClassLoader() == null && beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
        beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
        beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
    }
}
```

**PostProcessorRegistrationDelegate 执行逻辑**：

```java
public static void invokeBeanFactoryPostProcessors(
        ConfigurableListableBeanFactory beanFactory, 
        List<BeanFactoryPostProcessor> beanFactoryPostProcessors) {
    
    Set<String> processedBeans = new HashSet<>();
    
    if (beanFactory instanceof BeanDefinitionRegistry) {
        BeanDefinitionRegistry registry = (BeanDefinitionRegistry) beanFactory;
        List<BeanFactoryPostProcessor> regularPostProcessors = new ArrayList<>();
        List<BeanDefinitionRegistryPostProcessor> registryProcessors = new ArrayList<>();
        
        // 1. 先处理手动添加的 BeanFactoryPostProcessor
        for (BeanFactoryPostProcessor postProcessor : beanFactoryPostProcessors) {
            if (postProcessor instanceof BeanDefinitionRegistryPostProcessor) {
                BeanDefinitionRegistryPostProcessor registryProcessor = 
                    (BeanDefinitionRegistryPostProcessor) postProcessor;
                registryProcessor.postProcessBeanDefinitionRegistry(registry);
                registryProcessors.add(registryProcessor);
            } else {
                regularPostProcessors.add(postProcessor);
            }
        }
        
        // 2. 执行实现了 PriorityOrdered 的 BeanDefinitionRegistryPostProcessor
        String[] postProcessorNames = beanFactory.getBeanNamesForType(
            BeanDefinitionRegistryPostProcessor.class, true, false
        );
        List<BeanDefinitionRegistryPostProcessor> priorityOrderedPostProcessors = new ArrayList<>();
        for (String ppName : postProcessorNames) {
            if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
                priorityOrderedPostProcessors.add(
                    beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class)
                );
                processedBeans.add(ppName);
            }
        }
        sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
        registryProcessors.addAll(priorityOrderedPostProcessors);
        invokeBeanDefinitionRegistryPostProcessors(priorityOrderedPostProcessors, registry);
        
        // 3. 执行实现了 Ordered 的 BeanDefinitionRegistryPostProcessor
        // ...（类似逻辑）
        
        // 4. 执行其余的 BeanDefinitionRegistryPostProcessor
        // ...
        
        // 5. 执行 BeanFactoryPostProcessor
        invokeBeanFactoryPostProcessors(registryProcessors, beanFactory);
        invokeBeanFactoryPostProcessors(regularPostProcessors, beanFactory);
    }
}
```

**核心处理器：ConfigurationClassPostProcessor**

```java
// ConfigurationClassPostProcessor - 处理 @Configuration 类
public class ConfigurationClassPostProcessor implements BeanDefinitionRegistryPostProcessor, 
        PriorityOrdered, ResourceLoaderAware, BeanClassLoaderAware, EnvironmentAware {
    
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
        // 1. 构建配置类解析器
        ConfigurationClassParser parser = new ConfigurationClassParser(
            this.metadataReaderFactory, 
            this.problemReporter,
            this.environment, 
            this.resourceLoader, 
            this.componentScanBeanNameGenerator, 
            registry
        );
        
        // 2. 获取所有候选的配置类
        Set<BeanDefinitionHolder> candidates = new LinkedHashSet<>();
        String[] candidateNames = registry.getBeanDefinitionNames();
        for (String beanName : candidateNames) {
            BeanDefinition beanDef = registry.getBeanDefinition(beanName);
            if (ConfigurationClassUtils.checkConfigurationClassCandidate(beanDef, this.metadataReaderFactory)) {
                candidates.add(new BeanDefinitionHolder(beanDef, beanName));
            }
        }
        
        // 3. 解析配置类
        parser.parse(candidates);
        
        // 4. 读取配置类，注册 Bean 定义
        this.reader.loadBeanDefinitions(parser.getConfigurationClasses());
    }
}
```

**ConfigurationClassParser 解析流程**：

```java
protected void processConfigurationClass(ConfigurationClass configClass) throws IOException {
    // 1. 处理 @Component 内部类
    processMemberClasses(configClass);
    
    // 2. 处理 @PropertySource 注解
    for (AnnotationAttributes propertySource : 
            AnnotationConfigUtils.attributesForRepeatable(
                sourceClass.getMetadata(), PropertySources.class, PropertySource.class)) {
        processPropertySource(propertySource);
    }
    
    // 3. 处理 @ComponentScan 注解
    Set<AnnotationAttributes> componentScans = AnnotationConfigUtils.attributesForRepeatable(
        sourceClass.getMetadata(), ComponentScans.class, ComponentScan.class
    );
    for (AnnotationAttributes componentScan : componentScans) {
        Set<BeanDefinitionHolder> scannedBeanDefinitions = 
            this.componentScanParser.parse(componentScan, sourceClass.getMetadata().getClassName());
        
        // 扫描到的 Bean 可能也是配置类，递归处理
        for (BeanDefinitionHolder holder : scannedBeanDefinitions) {
            parse(holder.getBeanName(), holder.getBeanDefinition().getBeanClassName());
        }
    }
    
    // 4. 处理 @Import 注解
    processImports(configClass, sourceClass, getImports(sourceClass), true);
    
    // 5. 处理 @ImportResource 注解
    AnnotationAttributes importResource = AnnotationConfigUtils.attributesFor(
        sourceClass.getMetadata(), ImportResource.class
    );
    if (importResource != null) {
        String[] resources = importResource.getStringArray("locations");
        configClass.addImportedResource(resources, readerClass);
    }
    
    // 6. 处理 @Bean 方法
    Set<MethodMetadata> beanMethods = retrieveBeanMethodMetadata(sourceClass);
    for (MethodMetadata methodMetadata : beanMethods) {
        configClass.addBeanMethod(new BeanMethod(methodMetadata, configClass));
    }
    
    // 7. 处理接口的默认方法
    processInterfaces(configClass, sourceClass);
    
    // 8. 处理父类
    if (sourceClass.getMetadata().hasSuperClass()) {
        String superclass = sourceClass.getMetadata().getSuperClassName();
        if (superclass != null && !superclass.startsWith("java") && 
                !this.knownSuperclasses.containsKey(superclass)) {
            return new SourceClass(superclass);
        }
    }
    
    return null;
}
```

**作用**：
- 扫描 `@Component`、`@Service`、`@Repository`、`@Controller` 注解
- 解析 `@Configuration` 配置类
- 处理 `@Bean`、`@Import`、`@ComponentScan` 注解
- 注册所有 BeanDefinition

### 步骤 6：registerBeanPostProcessors() - 注册 BeanPostProcessor

```java
protected void registerBeanPostProcessors(ConfigurableListableBeanFactory beanFactory) {
    PostProcessorRegistrationDelegate.registerBeanPostProcessors(beanFactory, this);
}

public static void registerBeanPostProcessors(
        ConfigurableListableBeanFactory beanFactory, 
        AbstractApplicationContext applicationContext) {
    
    String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanPostProcessor.class, true, false);
    
    // 注册 BeanPostProcessorChecker（检查在 BeanPostProcessor 实例化期间创建的 Bean）
    int beanProcessorTargetCount = beanFactory.getBeanPostProcessorCount() + 1 + postProcessorNames.length;
    beanFactory.addBeanPostProcessor(new BeanPostProcessorChecker(beanFactory, beanProcessorTargetCount));
    
    // 分类 BeanPostProcessor
    List<BeanPostProcessor> priorityOrderedPostProcessors = new ArrayList<>();
    List<BeanPostProcessor> internalPostProcessors = new ArrayList<>();
    List<String> orderedPostProcessorNames = new ArrayList<>();
    List<String> nonOrderedPostProcessorNames = new ArrayList<>();
    
    for (String ppName : postProcessorNames) {
        if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
            BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
            priorityOrderedPostProcessors.add(pp);
            if (pp instanceof MergedBeanDefinitionPostProcessor) {
                internalPostProcessors.add(pp);
            }
        } else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {
            orderedPostProcessorNames.add(ppName);
        } else {
            nonOrderedPostProcessorNames.add(ppName);
        }
    }
    
    // 1. 注册实现了 PriorityOrdered 的 BeanPostProcessor
    sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
    registerBeanPostProcessors(beanFactory, priorityOrderedPostProcessors);
    
    // 2. 注册实现了 Ordered 的 BeanPostProcessor
    List<BeanPostProcessor> orderedPostProcessors = new ArrayList<>();
    for (String ppName : orderedPostProcessorNames) {
        BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
        orderedPostProcessors.add(pp);
        if (pp instanceof MergedBeanDefinitionPostProcessor) {
            internalPostProcessors.add(pp);
        }
    }
    sortPostProcessors(orderedPostProcessors, beanFactory);
    registerBeanPostProcessors(beanFactory, orderedPostProcessors);
    
    // 3. 注册其余的 BeanPostProcessor
    List<BeanPostProcessor> nonOrderedPostProcessors = new ArrayList<>();
    for (String ppName : nonOrderedPostProcessorNames) {
        BeanPostProcessor pp = beanFactory.getBean(ppName, BeanPostProcessor.class);
        nonOrderedPostProcessors.add(pp);
        if (pp instanceof MergedBeanDefinitionPostProcessor) {
            internalPostProcessors.add(pp);
        }
    }
    registerBeanPostProcessors(beanFactory, nonOrderedPostProcessors);
    
    // 4. 重新注册内部 BeanPostProcessor（保证它们在最后执行）
    sortPostProcessors(internalPostProcessors, beanFactory);
    registerBeanPostProcessors(beanFactory, internalPostProcessors);
    
    // 5. 重新注册 ApplicationListenerDetector（保证它在最后）
    beanFactory.addBeanPostProcessor(new ApplicationListenerDetector(applicationContext));
}
```

**常见的 BeanPostProcessor**：
- `AutowiredAnnotationBeanPostProcessor` - 处理 @Autowired、@Value
- `CommonAnnotationBeanPostProcessor` - 处理 @Resource、@PostConstruct、@PreDestroy
- `ApplicationContextAwareProcessor` - 处理 Aware 接口
- `AbstractAutoProxyCreator` - 创建 AOP 代理

**作用**：
- 注册所有 BeanPostProcessor
- 按优先级排序
- 为后续 Bean 创建做准备

### 步骤 7-10：初始化基础设施

```java
// 7. initMessageSource() - 初始化消息源
protected void initMessageSource() {
    ConfigurableListableBeanFactory beanFactory = getBeanFactory();
    if (beanFactory.containsLocalBean(MESSAGE_SOURCE_BEAN_NAME)) {
        this.messageSource = beanFactory.getBean(MESSAGE_SOURCE_BEAN_NAME, MessageSource.class);
        if (this.parent != null && this.messageSource instanceof HierarchicalMessageSource) {
            HierarchicalMessageSource hms = (HierarchicalMessageSource) this.messageSource;
            if (hms.getParentMessageSource() == null) {
                hms.setParentMessageSource(getInternalParentMessageSource());
            }
        }
    } else {
        DelegatingMessageSource dms = new DelegatingMessageSource();
        dms.setParentMessageSource(getInternalParentMessageSource());
        this.messageSource = dms;
        beanFactory.registerSingleton(MESSAGE_SOURCE_BEAN_NAME, this.messageSource);
    }
}

// 8. initApplicationEventMulticaster() - 初始化事件多播器
protected void initApplicationEventMulticaster() {
    ConfigurableListableBeanFactory beanFactory = getBeanFactory();
    if (beanFactory.containsLocalBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME)) {
        this.applicationEventMulticaster = beanFactory.getBean(
            APPLICATION_EVENT_MULTICASTER_BEAN_NAME, 
            ApplicationEventMulticaster.class
        );
    } else {
        this.applicationEventMulticaster = new SimpleApplicationEventMulticaster(beanFactory);
        beanFactory.registerSingleton(
            APPLICATION_EVENT_MULTICASTER_BEAN_NAME, 
            this.applicationEventMulticaster
        );
    }
}

// 9. onRefresh() - 初始化特殊 Bean
protected void onRefresh() throws BeansException {
    // 子类扩展点（如 Web 容器创建内嵌 Tomcat）
}

// 10. registerListeners() - 注册监听器
protected void registerListeners() {
    // 1. 注册静态监听器
    for (ApplicationListener<?> listener : getApplicationListeners()) {
        getApplicationEventMulticaster().addApplicationListener(listener);
    }
    
    // 2. 注册 Bean 类型的监听器
    String[] listenerBeanNames = getBeanNamesForType(ApplicationListener.class, true, false);
    for (String listenerBeanName : listenerBeanNames) {
        getApplicationEventMulticaster().addApplicationListenerBean(listenerBeanName);
    }
    
    // 3. 发布早期事件
    Set<ApplicationEvent> earlyEventsToProcess = this.earlyApplicationEvents;
    this.earlyApplicationEvents = null;
    if (earlyEventsToProcess != null) {
        for (ApplicationEvent earlyEvent : earlyEventsToProcess) {
            getApplicationEventMulticaster().multicastEvent(earlyEvent);
        }
    }
}
```

### 步骤 11：finishBeanFactoryInitialization() - 实例化所有单例 Bean

```java
protected void finishBeanFactoryInitialization(ConfigurableListableBeanFactory beanFactory) {
    // 1. 初始化类型转换服务
    if (beanFactory.containsBean(CONVERSION_SERVICE_BEAN_NAME) &&
            beanFactory.isTypeMatch(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class)) {
        beanFactory.setConversionService(
            beanFactory.getBean(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class)
        );
    }
    
    // 2. 注册默认的嵌入值解析器
    if (!beanFactory.hasEmbeddedValueResolver()) {
        beanFactory.addEmbeddedValueResolver(strVal -> getEnvironment().resolvePlaceholders(strVal));
    }
    
    // 3. 初始化 LoadTimeWeaverAware Bean
    String[] weaverAwareNames = beanFactory.getBeanNamesForType(LoadTimeWeaverAware.class, false, false);
    for (String weaverAwareName : weaverAwareNames) {
        getBean(weaverAwareName);
    }
    
    // 4. 停止使用临时类加载器
    beanFactory.setTempClassLoader(null);
    
    // 5. 冻结配置（不再修改 BeanDefinition）
    beanFactory.freezeConfiguration();
    
    // 6. 实例化所有非懒加载的单例 Bean
    beanFactory.preInstantiateSingletons();
}
```

**preInstantiateSingletons() - 核心方法**：

```java
// DefaultListableBeanFactory
@Override
public void preInstantiateSingletons() throws BeansException {
    List<String> beanNames = new ArrayList<>(this.beanDefinitionNames);
    
    // 1. 触发所有非懒加载单例 Bean 的初始化
    for (String beanName : beanNames) {
        RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
        
        // 非抽象、单例、非懒加载
        if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
            if (isFactoryBean(beanName)) {
                // FactoryBean
                Object bean = getBean(FACTORY_BEAN_PREFIX + beanName);
                if (bean instanceof FactoryBean) {
                    FactoryBean<?> factory = (FactoryBean<?>) bean;
                    boolean isEagerInit = (factory instanceof SmartFactoryBean &&
                        ((SmartFactoryBean<?>) factory).isEagerInit());
                    if (isEagerInit) {
                        getBean(beanName);
                    }
                }
            } else {
                // 普通 Bean
                getBean(beanName);
            }
        }
    }
    
    // 2. 触发所有 SmartInitializingSingleton 的回调
    for (String beanName : beanNames) {
        Object singletonInstance = getSingleton(beanName);
        if (singletonInstance instanceof SmartInitializingSingleton) {
            SmartInitializingSingleton smartSingleton = (SmartInitializingSingleton) singletonInstance;
            smartSingleton.afterSingletonsInstantiated();
        }
    }
}
```

**作用**：
- 实例化所有非懒加载的单例 Bean
- 触发 Bean 的完整生命周期
- 调用 SmartInitializingSingleton 回调

### 步骤 12：finishRefresh() - 完成刷新

```java
protected void finishRefresh() {
    // 1. 清除资源缓存
    clearResourceCaches();
    
    // 2. 初始化生命周期处理器
    initLifecycleProcessor();
    
    // 3. 传播刷新事件到生命周期处理器
    getLifecycleProcessor().onRefresh();
    
    // 4. 发布 ContextRefreshedEvent 事件
    publishEvent(new ContextRefreshedEvent(this));
    
    // 5. 注册到 LiveBeansView（JMX）
    LiveBeansView.registerApplicationContext(this);
}

protected void initLifecycleProcessor() {
    ConfigurableListableBeanFactory beanFactory = getBeanFactory();
    if (beanFactory.containsLocalBean(LIFECYCLE_PROCESSOR_BEAN_NAME)) {
        this.lifecycleProcessor = beanFactory.getBean(
            LIFECYCLE_PROCESSOR_BEAN_NAME, 
            LifecycleProcessor.class
        );
    } else {
        DefaultLifecycleProcessor defaultProcessor = new DefaultLifecycleProcessor();
        defaultProcessor.setBeanFactory(beanFactory);
        this.lifecycleProcessor = defaultProcessor;
        beanFactory.registerSingleton(LIFECYCLE_PROCESSOR_BEAN_NAME, this.lifecycleProcessor);
    }
}
```

**作用**：
- 初始化生命周期处理器
- 发布容器刷新完成事件
- 容器进入就绪状态

---

## 4. 实际落地场景（工作实战）

### 场景 1：Spring Boot 启动优化

**性能瓶颈现象**：
应用启动耗时 60 秒，其中 Bean 创建占 40 秒。

**问题定位方法**：

```java
// 1. 开启启动分析
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setApplicationStartup(new BufferingApplicationStartup(2048));
        app.run(args);
    }
}

// 2. 查看启动报告
// http://localhost:8080/actuator/startup

// 3. 定位慢Bean
// spring.output.ansi.enabled=ALWAYS
// logging.level.org.springframework.beans.factory.support=DEBUG
```

**优化方案**：

```java
// 1. 懒加载（LazyInitialization）
@Configuration
public class LazyConfig {
    @Bean
    public static LazyInitializationBeanFactoryPostProcessor lazyInit() {
        return new LazyInitializationBeanFactoryPostProcessor();
    }
}

// 2. 条件装配（减少不必要的Bean）
@Configuration
@ConditionalOnProperty(name = "feature.cache.enabled", havingValue = "true")
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new CaffeineCacheManager();
    }
}

// 3. 异步初始化
@Component
public class AsyncInitializer implements ApplicationRunner {
    @Async
    @Override
    public void run(ApplicationArguments args) {
        // 异步初始化非关键资源
    }
}
```

**优化效果**：
- 启动时间从 60s 降低到 15s
- 内存占用减少 40%

### 场景 2：排查 Bean 循环依赖问题

**故障现象**：
启动时报错：`BeanCurrentlyInCreationException: Error creating bean with name 'serviceA'`

**排查思路**：

```java
// 1. 分析日志
Creating shared instance of singleton bean 'serviceA'
Creating shared instance of singleton bean 'serviceB'
Requested bean is currently in creation: Is there an unresolvable circular reference?

// 2. 定位循环依赖
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB; // A 依赖 B
}

@Service
public class ServiceB {
    @Autowired
    private ServiceA serviceA; // B 依赖 A
}

// 3. 问题原因：构造器注入导致循环依赖无法解决
@Service
public class ServiceA {
    private final ServiceB serviceB;
    
    public ServiceA(ServiceB serviceB) { // 构造器注入
        this.serviceB = serviceB;
    }
}
```

**解决方案**：

```java
// 方案1：改用Setter注入
@Service
public class ServiceA {
    private ServiceB serviceB;
    
    @Autowired
    public void setServiceB(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

// 方案2：使用@Lazy延迟注入
@Service
public class ServiceA {
    private final ServiceB serviceB;
    
    public ServiceA(@Lazy ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

// 方案3：重构代码，消除循环依赖
@Service
public class ServiceA {
    @Autowired
    private CommonService commonService; // 提取公共依赖
}

@Service
public class ServiceB {
    @Autowired
    private CommonService commonService;
}
```

### 场景 3：自定义容器启动扩展点

**业务需求**：
容器启动后，需要预热缓存、初始化数据字典。

**技术方案**：

```java
// 方式1：实现ApplicationRunner
@Component
public class CacheWarmer implements ApplicationRunner {
    @Autowired
    private CacheManager cacheManager;
    
    @Override
    public void run(ApplicationArguments args) {
        // 容器启动完成后执行
        System.out.println("开始预热缓存...");
        warmUpCache();
    }
}

// 方式2：监听ContextRefreshedEvent
@Component
public class DataDictInitializer implements ApplicationListener<ContextRefreshedEvent> {
    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        // 容器刷新完成后执行
        System.out.println("初始化数据字典...");
        loadDataDict();
    }
}

// 方式3：实现SmartInitializingSingleton
@Component
public class CustomInitializer implements SmartInitializingSingleton {
    @Override
    public void afterSingletonsInstantiated() {
        // 所有单例Bean实例化完成后执行
        System.out.println("执行自定义初始化...");
    }
}

// 方式4：自定义BeanFactoryPostProcessor
@Component
public class CustomBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        // Bean定义加载完成后、Bean实例化之前执行
        System.out.println("修改Bean定义...");
    }
}
```

**执行顺序**：
```
BeanFactoryPostProcessor.postProcessBeanFactory()
    ↓
Bean 实例化 + 依赖注入
    ↓
SmartInitializingSingleton.afterSingletonsInstantiated()
    ↓
ApplicationRunner.run() / CommandLineRunner.run()
    ↓
ContextRefreshedEvent 事件发布
```

---

## 5. 面试准备专项

### 高频面试题：Spring 容器的启动流程是什么？

**第一层（基础回答 - 60分）**：
Spring 容器启动主要经过配置加载、Bean 定义注册、Bean 实例化、依赖注入、初始化回调等步骤。

**第二层（深入原理 - 80分）**：
Spring 容器启动的核心方法是 `AbstractApplicationContext.refresh()`，包含 12 个关键步骤：

1. **prepareRefresh()**：准备刷新，设置启动时间、初始化属性源
2. **obtainFreshBeanFactory()**：创建 BeanFactory，加载 Bean 定义
3. **prepareBeanFactory()**：配置 BeanFactory，添加 BeanPostProcessor
4. **postProcessBeanFactory()**：子类扩展点
5. **invokeBeanFactoryPostProcessors()**：执行 BeanFactoryPostProcessor，扫描注解、注册 Bean 定义
6. **registerBeanPostProcessors()**：注册 BeanPostProcessor
7. **initMessageSource()**：初始化国际化资源
8. **initApplicationEventMulticaster()**：初始化事件多播器
9. **onRefresh()**：子类扩展点（Web 容器创建）
10. **registerListeners()**：注册监听器
11. **finishBeanFactoryInitialization()**：实例化所有非懒加载单例 Bean
12. **finishRefresh()**：完成刷新，发布 ContextRefreshedEvent

**第三层（扩展延伸 - 95分）**：
从源码角度详细说明关键步骤：

**步骤 5** 是核心，`ConfigurationClassPostProcessor` 负责：
- 扫描 `@ComponentScan` 指定的包
- 解析 `@Configuration` 配置类
- 处理 `@Import`、`@Bean`、`@ImportResource` 注解
- 注册所有 BeanDefinition 到 BeanFactory

**步骤 11** 实例化 Bean：
- 调用 `DefaultListableBeanFactory.preInstantiateSingletons()`
- 循环调用 `getBean()` 触发 Bean 创建
- 每个 Bean 经过：实例化 → 属性填充 → 初始化 → 放入单例池

**核心设计**：
- 模板方法模式：refresh() 定义流程，子类覆盖扩展点
- 责任链模式：BeanFactoryPostProcessor、BeanPostProcessor 链式处理
- 观察者模式：事件监听机制

**追问应对**：

**追问 1：BeanFactoryPostProcessor 和 BeanPostProcessor 的区别？**
- **BeanFactoryPostProcessor**：作用于 BeanFactory，在 Bean 定义加载后、实例化前执行，可以修改 Bean 定义
- **BeanPostProcessor**：作用于 Bean 实例，在 Bean 初始化前后执行，可以修改 Bean 实例（如创建代理）

**追问 2：如何在容器启动后执行自定义逻辑？**
- 实现 `ApplicationRunner` 或 `CommandLineRunner`
- 监听 `ContextRefreshedEvent` 事件
- 实现 `SmartInitializingSingleton`

**加分项**：
- 能画出完整的启动流程图
- 能说出关键源码类和方法
- 能结合实际项目说明启动优化方案

---

## 6. 学习自检清单

- [ ] 能够说出 refresh() 方法的 12 个核心步骤
- [ ] 能够解释 ConfigurationClassPostProcessor 的作用
- [ ] 能够说明 BeanFactoryPostProcessor 和 BeanPostProcessor 的执行时机
- [ ] 能够画出容器启动的完整时序图
- [ ] 能够定位容器启动性能瓶颈并优化
- [ ] 能够解决循环依赖问题
- [ ] 能够实现自定义启动扩展点

**学习建议**：
- **预计学习时长**：4 小时
- **重点难点**：refresh() 12 步骤、ConfigurationClassPostProcessor、Bean 实例化流程
- **前置知识**：IoC 容器架构、BeanDefinition
- **实践建议**：
  - 调试 refresh() 方法，观察每个步骤
  - 自定义 BeanFactoryPostProcessor
  - 分析 Spring Boot 启动日志

---

## 7. 参考资料

**Spring 官方文档**：
- [Container Extension Points](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-extension)

**源码位置**：
- `org.springframework.context.support.AbstractApplicationContext.refresh()`
- `org.springframework.context.annotation.ConfigurationClassPostProcessor`
- `org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons()`

---

**上一章** ← [第 3 章：IoC 容器架构设计](./content-3.md)  
**下一章** → [第 5 章：依赖注入实现机制](./content-5.md)  
**返回目录** → [学习大纲](../content-outline.md)

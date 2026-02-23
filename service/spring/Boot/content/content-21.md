# 第 21 章：SpringApplication.run() 完整流程

## 本章概述

深入剖析 Spring Boot 启动的核心方法 `SpringApplication.run()` 的完整执行流程，掌握12个关键步骤。

**学习目标：**
- 透彻理解 Spring Boot 启动全过程
- 掌握关键步骤的作用和顺序
- 理解各个组件的协作关系

---

## 21.1 启动流程概览

### 12个关键步骤

```java
public ConfigurableApplicationContext run(String... args) {
    // 1. 创建计时器
    StopWatch stopWatch = new StopWatch();
    stopWatch.start();
    
    // 2. 创建引导上下文
    DefaultBootstrapContext bootstrapContext = createBootstrapContext();
    ConfigurableApplicationContext context = null;
    
    // 3. 配置 Headless 模式
    configureHeadlessProperty();
    
    // 4. 获取并启动监听器
    SpringApplicationRunListeners listeners = getRunListeners(args);
    listeners.starting(bootstrapContext, this.mainApplicationClass);
    
    try {
        // 5. 封装命令行参数
        ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
        
        // 6. 准备环境
        ConfigurableEnvironment environment = prepareEnvironment(listeners, bootstrapContext, applicationArguments);
        configureIgnoreBeanInfo(environment);
        
        // 7. 打印 Banner
        Banner printedBanner = printBanner(environment);
        
        // 8. 创建 ApplicationContext
        context = createApplicationContext();
        context.setApplicationStartup(this.applicationStartup);
        
        // 9. 准备 ApplicationContext
        prepareContext(bootstrapContext, context, environment, listeners, applicationArguments, printedBanner);
        
        // 10. 刷新 ApplicationContext（核心）
        refreshContext(context);
        
        // 11. 刷新后处理
        afterRefresh(context, applicationArguments);
        
        // 12. 停止计时器
        stopWatch.stop();
        if (this.logStartupInfo) {
            new StartupInfoLogger(this.mainApplicationClass).logStarted(getApplicationLog(), stopWatch);
        }
        
        // 13. 发布 started 事件
        listeners.started(context);
        
        // 14. 调用 Runners
        callRunners(context, applicationArguments);
    }
    catch (Throwable ex) {
        handleRunFailure(context, ex, listeners);
        throw new IllegalStateException(ex);
    }
    
    try {
        // 15. 发布 ready 事件
        listeners.ready(context, null);
    }
    catch (Throwable ex) {
        handleRunFailure(context, ex, null);
        throw new IllegalStateException(ex);
    }
    
    return context;
}
```

---

## 21.2 prepareEnvironment() 环境准备

### 核心流程

```java
private ConfigurableEnvironment prepareEnvironment(SpringApplicationRunListeners listeners,
                                                   DefaultBootstrapContext bootstrapContext,
                                                   ApplicationArguments applicationArguments) {
    // 1. 创建或获取 Environment
    ConfigurableEnvironment environment = getOrCreateEnvironment();
    
    // 2. 配置 Environment
    configureEnvironment(environment, applicationArguments.getSourceArgs());
    
    // 3. 附加配置源
    ConfigurationPropertySources.attach(environment);
    
    // 4. 发布 environmentPrepared 事件
    listeners.environmentPrepared(bootstrapContext, environment);
    
    // 5. 绑定到 SpringApplication
    bindToSpringApplication(environment);
    
    // 6. 转换 Environment 类型
    if (!this.isCustomEnvironment) {
        environment = convertEnvironment(environment);
    }
    
    ConfigurationPropertySources.attach(environment);
    return environment;
}
```

---

## 21.3 prepareContext() 上下文准备

```java
private void prepareContext(DefaultBootstrapContext bootstrapContext,
                           ConfigurableApplicationContext context,
                           ConfigurableEnvironment environment,
                           SpringApplicationRunListeners listeners,
                           ApplicationArguments applicationArguments,
                           Banner printedBanner) {
    // 1. 设置 Environment
    context.setEnvironment(environment);
    
    // 2. 后处理 ApplicationContext
    postProcessApplicationContext(context);
    
    // 3. 应用初始化器
    applyInitializers(context);
    
    // 4. 发布 contextPrepared 事件
    listeners.contextPrepared(context);
    
    // 5. 关闭 BootstrapContext
    bootstrapContext.close(context);
    
    // 6. 打印启动日志
    if (this.logStartupInfo) {
        logStartupInfo(context.getParent() == null);
        logStartupProfileInfo(context);
    }
    
    // 7. 注册特殊的单例 Bean
    ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
    beanFactory.registerSingleton("springApplicationArguments", applicationArguments);
    if (printedBanner != null) {
        beanFactory.registerSingleton("springBootBanner", printedBanner);
    }
    
    // 8. 设置是否允许循环引用
    if (beanFactory instanceof AbstractAutowireCapableBeanFactory) {
        ((AbstractAutowireCapableBeanFactory) beanFactory).setAllowCircularReferences(this.allowCircularReferences);
    }
    
    // 9. 加载 Bean 定义源
    Set<Object> sources = getAllSources();
    Assert.notEmpty(sources, "Sources must not be empty");
    load(context, sources.toArray(new Object[0]));
    
    // 10. 发布 contextLoaded 事件
    listeners.contextLoaded(context);
}
```

---

## 21.4 refreshContext() 刷新上下文

### 核心方法

```java
private void refreshContext(ConfigurableApplicationContext context) {
    if (this.registerShutdownHook) {
        shutdownHook.registerApplicationContext(context);
    }
    refresh(context);
}

protected void refresh(ConfigurableApplicationContext applicationContext) {
    applicationContext.refresh();
}
```

### AbstractApplicationContext.refresh()

```java
@Override
public void refresh() throws BeansException, IllegalStateException {
    synchronized (this.startupShutdownMonitor) {
        // 1. 准备刷新
        prepareRefresh();
        
        // 2. 获取 BeanFactory
        ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
        
        // 3. 准备 BeanFactory
        prepareBeanFactory(beanFactory);
        
        try {
            // 4. 后处理 BeanFactory
            postProcessBeanFactory(beanFactory);
            
            // 5. 调用 BeanFactoryPostProcessor
            invokeBeanFactoryPostProcessors(beanFactory);
            
            // 6. 注册 BeanPostProcessor
            registerBeanPostProcessors(beanFactory);
            
            // 7. 初始化消息源
            initMessageSource();
            
            // 8. 初始化事件多播器
            initApplicationEventMulticaster();
            
            // 9. 刷新（子类实现）
            onRefresh();
            
            // 10. 注册监听器
            registerListeners();
            
            // 11. 实例化所有单例 Bean
            finishBeanFactoryInitialization(beanFactory);
            
            // 12. 完成刷新
            finishRefresh();
        }
        catch (BeansException ex) {
            // 销毁已创建的单例 Bean
            destroyBeans();
            cancelRefresh(ex);
            throw ex;
        }
        finally {
            resetCommonCaches();
        }
    }
}
```

---

## 21.5 callRunners() 调用运行器

```java
private void callRunners(ApplicationContext context, ApplicationArguments args) {
    List<Object> runners = new ArrayList<>();
    
    // 1. 获取所有 ApplicationRunner
    runners.addAll(context.getBeansOfType(ApplicationRunner.class).values());
    
    // 2. 获取所有 CommandLineRunner
    runners.addAll(context.getBeansOfType(CommandLineRunner.class).values());
    
    // 3. 排序
    AnnotationAwareOrderComparator.sort(runners);
    
    // 4. 依次调用
    for (Object runner : new LinkedHashSet<>(runners)) {
        if (runner instanceof ApplicationRunner) {
            callRunner((ApplicationRunner) runner, args);
        }
        if (runner instanceof CommandLineRunner) {
            callRunner((CommandLineRunner) runner, args);
        }
    }
}
```

---

## 21.6 启动流程时序图

```
main()
  ↓
SpringApplication.run()
  ├── [1] 创建计时器
  ├── [2] 创建引导上下文
  ├── [3] 配置 Headless
  ├── [4] 启动监听器 (starting)
  ├── [5] 封装命令行参数
  ├── [6] 准备环境 (environmentPrepared)
  ├── [7] 打印 Banner
  ├── [8] 创建 ApplicationContext
  ├── [9] 准备 Context (contextPrepared, contextLoaded)
  ├── [10] 刷新 Context
  │   ├── invokeBeanFactoryPostProcessors()
  │   │   └── 自动配置生效
  │   ├── onRefresh()
  │   │   └── 启动嵌入式容器
  │   └── finishBeanFactoryInitialization()
  │       └── 实例化所有单例 Bean
  ├── [11] 刷新后处理
  ├── [12] 停止计时器
  ├── [13] 发布 started 事件
  ├── [14] 调用 Runners
  └── [15] 发布 ready 事件
  ↓
应用启动完成
```

---

## 21.7 本章小结

**核心要点：**
1. Spring Boot 启动分为15个主要步骤
2. refreshContext() 是最核心的步骤
3. 自动配置在 invokeBeanFactoryPostProcessors() 中生效
4. 嵌入式容器在 onRefresh() 中启动
5. Runners 在容器完全启动后执行

**相关章节：**
- [第 3 章：Spring Boot 运行机制概览](./content-3.md)
- [第 22 章：ApplicationContext 初始化机制](./content-22.md)
- [第 23 章：Spring Boot 事件与监听器](./content-23.md)

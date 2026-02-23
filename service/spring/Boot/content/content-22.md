# 第 22 章：ApplicationContext 初始化机制

## 本章概述

深入分析 ApplicationContext 的创建、Environment 准备、BeanDefinition 加载和 Refresh 流程。

**学习目标：**
- 理解 ApplicationContext 创建过程
- 掌握 Environment 准备流程
- 了解 BeanDefinition 加载机制
- 理解 Refresh 完整流程

---

## 22.1 ApplicationContext 创建

### createApplicationContext() 方法

```java
protected ConfigurableApplicationContext createApplicationContext() {
    Class<?> contextClass = this.applicationContextClass;
    if (contextClass == null) {
        try {
            switch (this.webApplicationType) {
                case SERVLET:
                    contextClass = Class.forName(DEFAULT_SERVLET_WEB_CONTEXT_CLASS);
                    // AnnotationConfigServletWebServerApplicationContext
                    break;
                case REACTIVE:
                    contextClass = Class.forName(DEFAULT_REACTIVE_WEB_CONTEXT_CLASS);
                    // AnnotationConfigReactiveWebServerApplicationContext
                    break;
                default:
                    contextClass = Class.forName(DEFAULT_CONTEXT_CLASS);
                    // AnnotationConfigApplicationContext
            }
        } catch (ClassNotFoundException ex) {
            throw new IllegalStateException("Unable create a default ApplicationContext", ex);
        }
    }
    return (ConfigurableApplicationContext) BeanUtils.instantiateClass(contextClass);
}
```

### ApplicationContext 类型

| 应用类型 | ApplicationContext 类型 |
|---------|------------------------|
| Servlet Web | `AnnotationConfigServletWebServerApplicationContext` |
| Reactive Web | `AnnotationConfigReactiveWebServerApplicationContext` |
| 非 Web | `AnnotationConfigApplicationContext` |

---

## 22.2 BeanDefinition 加载

### load() 方法

```java
protected void load(ApplicationContext context, Object[] sources) {
    BeanDefinitionLoader loader = createBeanDefinitionLoader(
        getBeanDefinitionRegistry(context), sources);
    
    if (this.beanNameGenerator != null) {
        loader.setBeanNameGenerator(this.beanNameGenerator);
    }
    if (this.resourceLoader != null) {
        loader.setResourceLoader(this.resourceLoader);
    }
    if (this.environment != null) {
        loader.setEnvironment(this.environment);
    }
    loader.load();
}
```

### BeanDefinitionLoader

```java
class BeanDefinitionLoader {
    
    private Object[] sources;
    private AnnotatedBeanDefinitionReader annotatedReader;
    private XmlBeanDefinitionReader xmlReader;
    private ClassPathBeanDefinitionScanner scanner;
    
    int load() {
        int count = 0;
        for (Object source : this.sources) {
            count += load(source);
        }
        return count;
    }
    
    private int load(Object source) {
        if (source instanceof Class<?>) {
            return load((Class<?>) source);
        }
        if (source instanceof Resource) {
            return load((Resource) source);
        }
        if (source instanceof Package) {
            return load((Package) source);
        }
        if (source instanceof CharSequence) {
            return load((CharSequence) source);
        }
        throw new IllegalArgumentException("Invalid source type " + source.getClass());
    }
    
    private int load(Class<?> source) {
        this.annotatedReader.register(source);
        return 1;
    }
}
```

---

## 22.3 Refresh 流程详解

### invokeBeanFactoryPostProcessors()

```java
protected void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory) {
    PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());
}
```

**核心处理器：**
- `ConfigurationClassPostProcessor`: 处理 @Configuration 类
- `PropertySourcesPlaceholderConfigurer`: 处理占位符

### onRefresh() 启动容器

```java
@Override
protected void onRefresh() {
    super.onRefresh();
    try {
        createWebServer();
    } catch (Throwable ex) {
        throw new ApplicationContextException("Unable to start web server", ex);
    }
}

private void createWebServer() {
    WebServer webServer = this.webServer;
    ServletContext servletContext = getServletContext();
    
    if (webServer == null && servletContext == null) {
        ServletWebServerFactory factory = getWebServerFactory();
        this.webServer = factory.getWebServer(getSelfInitializer());
    } else if (servletContext != null) {
        try {
            getSelfInitializer().onStartup(servletContext);
        } catch (ServletException ex) {
            throw new ApplicationContextException("Cannot initialize servlet context", ex);
        }
    }
    initPropertySources();
}
```

---

## 22.4 本章小结

**核心要点：**
1. ApplicationContext 根据应用类型自动选择
2. BeanDefinitionLoader 加载主配置类
3. Refresh 过程中执行自动配置
4. onRefresh() 中启动嵌入式容器

**相关章节：**
- [第 21 章：SpringApplication.run() 完整流程](./content-21.md)
- [第 23 章：Spring Boot 事件与监听器](./content-23.md)

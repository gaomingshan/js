# 第 7 章：Bean 生命周期扩展点

> **学习目标**：掌握 Spring 提供的各种扩展点接口，学会如何定制容器行为  
> **预计时长**：3 小时  
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心概念

Spring 提供了丰富的扩展点，允许开发者在 Bean 生命周期的各个阶段插入自定义逻辑。

**扩展点分类**：

```
容器级扩展点（BeanFactory 级别）
├─ BeanFactoryPostProcessor
└─ BeanDefinitionRegistryPostProcessor

Bean 级扩展点（Bean 实例级别）
├─ InstantiationAwareBeanPostProcessor
├─ MergedBeanDefinitionPostProcessor
├─ SmartInstantiationAwareBeanPostProcessor
├─ BeanPostProcessor
└─ DestructionAwareBeanPostProcessor

Aware 接口（获取容器信息）
├─ BeanNameAware
├─ BeanClassLoaderAware
├─ BeanFactoryAware
├─ EnvironmentAware
├─ ApplicationContextAware
└─ ...

生命周期回调接口
├─ InitializingBean
├─ DisposableBean
└─ SmartInitializingSingleton
```

---

## 2. BeanFactoryPostProcessor - 容器级扩展

### 2.1 接口定义

```java
@FunctionalInterface
public interface BeanFactoryPostProcessor {
    /**
     * 在 Bean 定义加载完成后、Bean 实例化之前调用
     * 可以修改 BeanDefinition
     */
    void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;
}
```

### 2.2 执行时机

```
容器启动流程：
1. 加载 Bean 定义
2. 调用 BeanFactoryPostProcessor.postProcessBeanFactory() ← 这里
3. 实例化 Bean
4. 初始化 Bean
```

### 2.3 应用场景

**场景 1：修改 BeanDefinition**

```java
@Component
public class CustomBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        // 获取 Bean 定义
        BeanDefinition bd = beanFactory.getBeanDefinition("userService");
        
        // 修改作用域
        bd.setScope(BeanDefinition.SCOPE_PROTOTYPE);
        
        // 修改懒加载
        bd.setLazyInit(true);
        
        // 修改属性值
        MutablePropertyValues pvs = bd.getPropertyValues();
        pvs.add("timeout", 3000);
    }
}
```

**场景 2：属性占位符解析（PropertySourcesPlaceholderConfigurer）**

```java
@Configuration
public class PropertyConfig {
    
    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyConfigurer() {
        PropertySourcesPlaceholderConfigurer configurer = new PropertySourcesPlaceholderConfigurer();
        configurer.setLocation(new ClassPathResource("application.properties"));
        return configurer;
    }
}

// 使用
@Component
public class DatabaseConfig {
    @Value("${db.url}")
    private String url;
    
    @Value("${db.username}")
    private String username;
}
```

**PropertySourcesPlaceholderConfigurer 原理**：

```java
public class PropertySourcesPlaceholderConfigurer extends PlaceholderConfigurerSupport 
        implements EnvironmentAware {
    
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        if (this.propertySources == null) {
            this.propertySources = new MutablePropertySources();
            if (this.environment != null) {
                this.propertySources.addLast(
                    new PropertySource<Environment>(ENVIRONMENT_PROPERTIES_PROPERTY_SOURCE_NAME, this.environment) {
                        @Override
                        public String getProperty(String key) {
                            return this.source.getProperty(key);
                        }
                    }
                );
            }
            // 加载属性文件
            loadProperties(this.propertySources);
        }
        
        // 处理占位符
        processProperties(beanFactory, new PropertySourcesPropertyResolver(this.propertySources));
    }
    
    protected void processProperties(ConfigurableListableBeanFactory beanFactoryToProcess,
            final ConfigurablePropertyResolver propertyResolver) {
        
        // 设置占位符前缀和后缀
        propertyResolver.setPlaceholderPrefix(this.placeholderPrefix);
        propertyResolver.setPlaceholderSuffix(this.placeholderSuffix);
        propertyResolver.setValueSeparator(this.valueSeparator);
        
        // 创建值解析器
        StringValueResolver valueResolver = strVal -> {
            String resolved = (this.ignoreUnresolvablePlaceholders ?
                propertyResolver.resolvePlaceholders(strVal) :
                propertyResolver.resolveRequiredPlaceholders(strVal));
            return (resolved.equals(this.nullValue) ? null : resolved);
        };
        
        // 遍历所有 BeanDefinition，解析占位符
        doProcessProperties(beanFactoryToProcess, valueResolver);
    }
}
```

---

## 3. BeanDefinitionRegistryPostProcessor - 动态注册 Bean

### 3.1 接口定义

```java
public interface BeanDefinitionRegistryPostProcessor extends BeanFactoryPostProcessor {
    /**
     * 在所有 Bean 定义加载后、标准 BeanFactoryPostProcessor 调用前执行
     * 可以注册新的 BeanDefinition
     */
    void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException;
}
```

### 3.2 执行顺序

```
BeanDefinitionRegistryPostProcessor.postProcessBeanDefinitionRegistry()
    ↓
BeanDefinitionRegistryPostProcessor.postProcessBeanFactory()
    ↓
BeanFactoryPostProcessor.postProcessBeanFactory()
```

### 3.3 应用场景

**动态注册 Bean**：

```java
@Component
public class DynamicBeanRegistrar implements BeanDefinitionRegistryPostProcessor {
    
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
        // 创建 BeanDefinition
        BeanDefinitionBuilder builder = BeanDefinitionBuilder
            .genericBeanDefinition(UserService.class);
        
        // 设置属性
        builder.addPropertyValue("timeout", 5000);
        builder.setScope(BeanDefinition.SCOPE_SINGLETON);
        builder.setLazyInit(false);
        
        // 注册到容器
        registry.registerBeanDefinition("dynamicUserService", builder.getBeanDefinition());
        
        System.out.println("动态注册 Bean: dynamicUserService");
    }
    
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        // 可选：修改 BeanDefinition
    }
}
```

**ConfigurationClassPostProcessor**（Spring 最重要的扩展点）：

```java
public class ConfigurationClassPostProcessor implements BeanDefinitionRegistryPostProcessor,
        PriorityOrdered, ResourceLoaderAware, BeanClassLoaderAware, EnvironmentAware {
    
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
        // 处理 @Configuration 类
        processConfigBeanDefinitions(registry);
    }
    
    public void processConfigBeanDefinitions(BeanDefinitionRegistry registry) {
        // 1. 找出所有配置类
        List<BeanDefinitionHolder> configCandidates = new ArrayList<>();
        String[] candidateNames = registry.getBeanDefinitionNames();
        
        for (String beanName : candidateNames) {
            BeanDefinition beanDef = registry.getBeanDefinition(beanName);
            if (ConfigurationClassUtils.isFullConfigurationClass(beanDef) ||
                    ConfigurationClassUtils.isLiteConfigurationClass(beanDef)) {
                configCandidates.add(new BeanDefinitionHolder(beanDef, beanName));
            }
        }
        
        // 2. 解析配置类
        ConfigurationClassParser parser = new ConfigurationClassParser(/* ... */);
        parser.parse(configCandidates);
        
        // 3. 注册从配置类中解析出的 Bean
        this.reader.loadBeanDefinitions(parser.getConfigurationClasses());
    }
}
```

---

## 4. BeanPostProcessor - Bean 实例扩展

### 4.1 接口定义

```java
public interface BeanPostProcessor {
    /**
     * 初始化前处理
     */
    @Nullable
    default Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }
    
    /**
     * 初始化后处理（AOP 代理在这里创建）
     */
    @Nullable
    default Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }
}
```

### 4.2 应用场景

**场景 1：自定义注解处理**

```java
// 自定义注解
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Monitored {
    String value() default "";
}

// BeanPostProcessor 处理
@Component
public class MonitoredBeanPostProcessor implements BeanPostProcessor {
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        Class<?> targetClass = AopUtils.getTargetClass(bean);
        
        if (targetClass.isAnnotationPresent(Monitored.class)) {
            Monitored monitored = targetClass.getAnnotation(Monitored.class);
            System.out.println("监控 Bean: " + beanName + ", 配置: " + monitored.value());
            
            // 可以创建代理，添加监控逻辑
            return createMonitorProxy(bean, beanName);
        }
        
        return bean;
    }
    
    private Object createMonitorProxy(Object bean, String beanName) {
        return Proxy.newProxyInstance(
            bean.getClass().getClassLoader(),
            bean.getClass().getInterfaces(),
            (proxy, method, args) -> {
                long start = System.currentTimeMillis();
                try {
                    return method.invoke(bean, args);
                } finally {
                    long cost = System.currentTimeMillis() - start;
                    System.out.println(beanName + "." + method.getName() + " 耗时: " + cost + "ms");
                }
            }
        );
    }
}
```

**场景 2：参数校验**

```java
@Component
public class ValidationBeanPostProcessor implements BeanPostProcessor {
    
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        // 校验 Bean 的配置
        Field[] fields = bean.getClass().getDeclaredFields();
        for (Field field : fields) {
            if (field.isAnnotationPresent(NotNull.class)) {
                field.setAccessible(true);
                try {
                    Object value = field.get(bean);
                    if (value == null) {
                        throw new IllegalStateException(
                            "字段 " + field.getName() + " 在 Bean " + beanName + " 中不能为 null"
                        );
                    }
                } catch (IllegalAccessException e) {
                    throw new RuntimeException(e);
                }
            }
        }
        return bean;
    }
}
```

---

## 5. InstantiationAwareBeanPostProcessor - 实例化扩展

### 5.1 接口定义

```java
public interface InstantiationAwareBeanPostProcessor extends BeanPostProcessor {
    
    /**
     * 实例化前调用，可以返回代理对象
     */
    @Nullable
    default Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) {
        return null;
    }
    
    /**
     * 实例化后调用，返回 false 可以阻止属性填充
     */
    default boolean postProcessAfterInstantiation(Object bean, String beanName) {
        return true;
    }
    
    /**
     * 属性注入前调用
     */
    @Nullable
    default PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) {
        return null;
    }
}
```

### 5.2 AutowiredAnnotationBeanPostProcessor

```java
public class AutowiredAnnotationBeanPostProcessor extends InstantiationAwareBeanPostProcessorAdapter
        implements MergedBeanDefinitionPostProcessor, PriorityOrdered, BeanFactoryAware {
    
    @Override
    public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
        // 收集 @Autowired 元数据
        InjectionMetadata metadata = findAutowiringMetadata(beanName, beanType, null);
        metadata.checkConfigMembers(beanDefinition);
    }
    
    @Override
    public PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) {
        // 执行 @Autowired 注入
        InjectionMetadata metadata = findAutowiringMetadata(beanName, bean.getClass(), pvs);
        try {
            metadata.inject(bean, beanName, pvs);
        } catch (BeanCreationException ex) {
            throw ex;
        } catch (Throwable ex) {
            throw new BeanCreationException(beanName, "Injection of autowired dependencies failed", ex);
        }
        return pvs;
    }
}
```

---

## 6. Aware 接口 - 获取容器信息

### 6.1 Aware 接口族

```java
// 1. BeanNameAware - 获取 Bean 名称
public interface BeanNameAware extends Aware {
    void setBeanName(String name);
}

// 2. BeanClassLoaderAware - 获取类加载器
public interface BeanClassLoaderAware extends Aware {
    void setBeanClassLoader(ClassLoader classLoader);
}

// 3. BeanFactoryAware - 获取 BeanFactory
public interface BeanFactoryAware extends Aware {
    void setBeanFactory(BeanFactory beanFactory) throws BeansException;
}

// 4. EnvironmentAware - 获取 Environment
public interface EnvironmentAware extends Aware {
    void setEnvironment(Environment environment);
}

// 5. ApplicationContextAware - 获取 ApplicationContext
public interface ApplicationContextAware extends Aware {
    void setApplicationContext(ApplicationContext applicationContext) throws BeansException;
}

// 6. ResourceLoaderAware - 获取资源加载器
public interface ResourceLoaderAware extends Aware {
    void setResourceLoader(ResourceLoader resourceLoader);
}

// 7. ApplicationEventPublisherAware - 获取事件发布器
public interface ApplicationEventPublisherAware extends Aware {
    void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher);
}

// 8. MessageSourceAware - 获取消息源
public interface MessageSourceAware extends Aware {
    void setMessageSource(MessageSource messageSource);
}
```

### 6.2 执行顺序

```
Bean 初始化阶段：
1. BeanNameAware.setBeanName()
2. BeanClassLoaderAware.setBeanClassLoader()
3. BeanFactoryAware.setBeanFactory()
4. EnvironmentAware.setEnvironment()         ← ApplicationContextAwareProcessor
5. ResourceLoaderAware.setResourceLoader()   ← ApplicationContextAwareProcessor
6. ApplicationEventPublisherAware...         ← ApplicationContextAwareProcessor
7. MessageSourceAware.setMessageSource()     ← ApplicationContextAwareProcessor
8. ApplicationContextAware.setApplicationContext() ← ApplicationContextAwareProcessor
```

### 6.3 应用场景

```java
@Component
public class ApplicationContextHolder implements ApplicationContextAware {
    private static ApplicationContext applicationContext;
    
    @Override
    public void setApplicationContext(ApplicationContext context) {
        applicationContext = context;
    }
    
    public static <T> T getBean(Class<T> clazz) {
        return applicationContext.getBean(clazz);
    }
    
    public static Object getBean(String beanName) {
        return applicationContext.getBean(beanName);
    }
}

// 使用
public class SomeClass {
    public void doSomething() {
        // 在非 Spring 管理的类中获取 Bean
        UserService userService = ApplicationContextHolder.getBean(UserService.class);
        userService.doWork();
    }
}
```

---

## 7. SmartInitializingSingleton - 所有单例初始化后回调

### 7.1 接口定义

```java
public interface SmartInitializingSingleton {
    /**
     * 所有非懒加载单例 Bean 实例化完成后调用
     */
    void afterSingletonsInstantiated();
}
```

### 7.2 执行时机

```java
// DefaultListableBeanFactory.preInstantiateSingletons()
@Override
public void preInstantiateSingletons() throws BeansException {
    List<String> beanNames = new ArrayList<>(this.beanDefinitionNames);
    
    // 1. 实例化所有非懒加载单例 Bean
    for (String beanName : beanNames) {
        RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
        if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
            if (isFactoryBean(beanName)) {
                // FactoryBean 处理
            } else {
                getBean(beanName);
            }
        }
    }
    
    // 2. 触发 SmartInitializingSingleton 回调
    for (String beanName : beanNames) {
        Object singletonInstance = getSingleton(beanName);
        if (singletonInstance instanceof SmartInitializingSingleton) {
            SmartInitializingSingleton smartSingleton = (SmartInitializingSingleton) singletonInstance;
            smartSingleton.afterSingletonsInstantiated();
        }
    }
}
```

### 7.3 应用场景

```java
@Component
public class CacheWarmer implements SmartInitializingSingleton {
    
    @Autowired
    private CacheManager cacheManager;
    
    @Autowired
    private DataService dataService;
    
    @Override
    public void afterSingletonsInstantiated() {
        // 所有 Bean 初始化完成后，预热缓存
        System.out.println("开始预热缓存...");
        
        List<Data> data = dataService.loadInitialData();
        Cache cache = cacheManager.getCache("dataCache");
        for (Data d : data) {
            cache.put(d.getId(), d);
        }
        
        System.out.println("缓存预热完成: " + data.size() + " 条数据");
    }
}
```

---

## 8. 扩展点对比与选择

### 8.1 扩展点对比表

| 扩展点 | 作用时机 | 作用对象 | 典型应用 |
|--------|---------|----------|----------|
| **BeanFactoryPostProcessor** | Bean 定义加载后 | BeanDefinition | 修改 Bean 定义、属性占位符 |
| **BeanDefinitionRegistryPostProcessor** | Bean 定义加载后 | BeanDefinitionRegistry | 动态注册 Bean、@Configuration 处理 |
| **InstantiationAwareBPP** | 实例化前后 | Bean Class/实例 | 返回代理对象、阻止实例化 |
| **MergedBeanDefinitionPostProcessor** | 实例化后 | RootBeanDefinition | 收集注入元数据 |
| **BeanPostProcessor** | 初始化前后 | Bean 实例 | AOP 代理、自定义注解处理 |
| **Aware 接口** | 初始化阶段 | Bean 实例 | 获取容器信息 |
| **InitializingBean** | 初始化阶段 | Bean 实例 | 自定义初始化逻辑 |
| **SmartInitializingSingleton** | 所有单例初始化后 | Bean 实例 | 全局初始化任务 |
| **DestructionAwareBPP** | 销毁前 | Bean 实例 | 自定义销毁逻辑 |

### 8.2 选择建议

**修改 Bean 定义** → `BeanFactoryPostProcessor`

```java
@Component
public class ScopeModifier implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        BeanDefinition bd = beanFactory.getBeanDefinition("myBean");
        bd.setScope(BeanDefinition.SCOPE_PROTOTYPE);
    }
}
```

**动态注册 Bean** → `BeanDefinitionRegistryPostProcessor`

```java
@Component
public class BeanRegistrar implements BeanDefinitionRegistryPostProcessor {
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
        registry.registerBeanDefinition("newBean", BeanDefinitionBuilder
            .genericBeanDefinition(MyBean.class).getBeanDefinition());
    }
}
```

**返回代理对象** → `InstantiationAwareBeanPostProcessor.postProcessBeforeInstantiation()`

```java
@Component
public class ProxyCreator implements InstantiationAwareBeanPostProcessor {
    @Override
    public Object postProcessBeforeInstantiation(Class<?> beanClass, String beanName) {
        if (beanClass == MyService.class) {
            return createProxy(beanClass);
        }
        return null;
    }
}
```

**依赖注入** → `InstantiationAwareBeanPostProcessor.postProcessProperties()`

```java
// 已有实现：AutowiredAnnotationBeanPostProcessor
```

**修改 Bean 实例** → `BeanPostProcessor`

```java
@Component
public class BeanModifier implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (bean instanceof MyInterface) {
            // 修改或增强 Bean
            return enhanceBean(bean);
        }
        return bean;
    }
}
```

**获取容器信息** → `Aware 接口`

```java
@Component
public class MyBean implements ApplicationContextAware {
    private ApplicationContext context;
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) {
        this.context = applicationContext;
    }
}
```

**初始化逻辑** → `InitializingBean` 或 `@PostConstruct`

```java
@Component
public class MyBean implements InitializingBean {
    @Override
    public void afterPropertiesSet() {
        // 初始化逻辑
    }
}
```

**全局初始化** → `SmartInitializingSingleton`

```java
@Component
public class GlobalInit implements SmartInitializingSingleton {
    @Override
    public void afterSingletonsInstantiated() {
        // 所有单例初始化后执行
    }
}
```

---

## 9. 实际落地场景（工作实战）

### 场景 1：自动配置数据源

```java
@Component
public class DataSourceAutoConfiguration implements BeanDefinitionRegistryPostProcessor {
    
    @Autowired
    private Environment environment;
    
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
        // 读取配置
        String url = environment.getProperty("datasource.url");
        String username = environment.getProperty("datasource.username");
        String password = environment.getProperty("datasource.password");
        
        if (url != null) {
            // 动态注册数据源 Bean
            BeanDefinitionBuilder builder = BeanDefinitionBuilder
                .genericBeanDefinition(HikariDataSource.class);
            
            builder.addPropertyValue("jdbcUrl", url);
            builder.addPropertyValue("username", username);
            builder.addPropertyValue("password", password);
            builder.setDestroyMethodName("close");
            
            registry.registerBeanDefinition("dataSource", builder.getBeanDefinition());
            
            System.out.println("自动配置数据源: " + url);
        }
    }
    
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    }
}
```

### 场景 2：接口耗时监控

```java
@Component
public class PerformanceMonitorPostProcessor implements BeanPostProcessor {
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        Class<?> targetClass = bean.getClass();
        
        // 只监控 Service 层
        if (targetClass.isAnnotationPresent(Service.class)) {
            return createMonitorProxy(bean, beanName);
        }
        
        return bean;
    }
    
    private Object createMonitorProxy(Object bean, String beanName) {
        return Proxy.newProxyInstance(
            bean.getClass().getClassLoader(),
            bean.getClass().getInterfaces(),
            (proxy, method, args) -> {
                long start = System.currentTimeMillis();
                Object result = null;
                try {
                    result = method.invoke(bean, args);
                    return result;
                } finally {
                    long cost = System.currentTimeMillis() - start;
                    if (cost > 1000) { // 超过1秒记录
                        System.out.println("慢方法警告: " + beanName + "." + method.getName() 
                            + " 耗时 " + cost + "ms");
                    }
                }
            }
        );
    }
}
```

### 场景 3：自定义注解实现缓存

```java
// 自定义缓存注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Cacheable {
    String key();
    int ttl() default 3600;
}

// 处理器
@Component
public class CacheablePostProcessor implements BeanPostProcessor {
    private final Map<String, Object> cache = new ConcurrentHashMap<>();
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        Class<?> targetClass = bean.getClass();
        
        // 检查类中是否有 @Cacheable 方法
        boolean hasCacheableMethod = Arrays.stream(targetClass.getDeclaredMethods())
            .anyMatch(m -> m.isAnnotationPresent(Cacheable.class));
        
        if (hasCacheableMethod) {
            return createCacheProxy(bean);
        }
        
        return bean;
    }
    
    private Object createCacheProxy(Object bean) {
        return Proxy.newProxyInstance(
            bean.getClass().getClassLoader(),
            bean.getClass().getInterfaces(),
            (proxy, method, args) -> {
                Cacheable cacheable = method.getAnnotation(Cacheable.class);
                
                if (cacheable != null) {
                    String cacheKey = generateKey(cacheable.key(), args);
                    
                    // 查缓存
                    Object cached = cache.get(cacheKey);
                    if (cached != null) {
                        System.out.println("缓存命中: " + cacheKey);
                        return cached;
                    }
                    
                    // 执行方法
                    Object result = method.invoke(bean, args);
                    
                    // 存缓存
                    cache.put(cacheKey, result);
                    System.out.println("缓存更新: " + cacheKey);
                    
                    return result;
                }
                
                return method.invoke(bean, args);
            }
        );
    }
    
    private String generateKey(String keyPattern, Object[] args) {
        // 简单实现，实际应该更复杂
        return keyPattern + "_" + Arrays.toString(args);
    }
}

// 使用
@Service
public interface UserService {
    @Cacheable(key = "user", ttl = 600)
    User getUserById(Long id);
}
```

---

## 10. 学习自检清单

- [ ] 能够说出各扩展点的执行时机
- [ ] 能够选择合适的扩展点实现需求
- [ ] 能够实现自定义 BeanPostProcessor
- [ ] 能够使用 Aware 接口获取容器信息
- [ ] 能够动态注册 Bean
- [ ] 能够通过扩展点修改 BeanDefinition

**学习建议**：
- **预计学习时长**：3 小时
- **重点难点**：扩展点选择、执行时机、应用场景
- **前置知识**：Bean 生命周期
- **实践建议**：
  - 实现各种扩展点接口
  - 分析 Spring 内置的扩展点实现
  - 自定义注解 + BeanPostProcessor

---

## 11. 参考资料

**Spring 官方文档**：
- [Container Extension Points](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-extension)

**源码位置**：
- `org.springframework.beans.factory.config.BeanFactoryPostProcessor`
- `org.springframework.beans.factory.config.BeanPostProcessor`
- `org.springframework.beans.factory.Aware`

---

**上一章** ← [第 6 章：Bean 完整生命周期](./content-6.md)  
**下一章** → [第 8 章：循环依赖解决机制](./content-8.md)  
**返回目录** → [学习大纲](../content-outline.md)

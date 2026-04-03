# 第 9 章：配置动态刷新原理

> **学习目标**：深入理解配置动态刷新底层原理，掌握 @RefreshScope 使用场景  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. 配置刷新核心机制

### 1.1 刷新流程概览

```
1. Nacos 配置变更
   ↓
2. 长轮询检测到变更
   ↓
3. 发布 RefreshEvent 事件
   ↓
4. ContextRefresher 处理刷新
   ↓
5. 更新 Environment
   ↓
6. 销毁 @RefreshScope Bean
   ↓
7. 下次访问时重新创建 Bean（使用新配置）
```

### 1.2 核心组件

**组件关系**：

```
ConfigService（Nacos 客户端）
    ↓
ClientWorker（长轮询）
    ↓
Listener（配置监听器）
    ↓
RefreshEventListener
    ↓
ContextRefresher（Spring Cloud）
    ↓
RefreshScope（Bean 刷新）
```

---

## 2. @RefreshScope 注解原理

### 2.1 使用方式

**基础用法**：

```java
@RestController
@RefreshScope  // 标记支持刷新
public class ConfigController {

    @Value("${user.name}")
    private String userName;

    @GetMapping("/config")
    public String getConfig() {
        return userName;  // 配置变更后自动更新
    }
}
```

### 2.2 实现原理

**@RefreshScope 定义**：

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Scope("refresh")  // 核心：自定义作用域
@Documented
public @interface RefreshScope {
    ScopedProxyMode proxyMode() default ScopedProxyMode.TARGET_CLASS;
}
```

**RefreshScope 类**：

```java
public class RefreshScope extends GenericScope 
    implements ApplicationContextAware, ApplicationListener<ContextRefreshedEvent>, Ordered {
    
    private final BeanLifecycleWrapperCache cache = new BeanLifecycleWrapperCache();
    
    @Override
    public Object get(String name, ObjectFactory<?> objectFactory) {
        // 从缓存获取 Bean
        BeanLifecycleWrapper value = this.cache.put(name, 
            new BeanLifecycleWrapper(name, objectFactory));
        
        try {
            return value.getBean();
        } catch (RuntimeException e) {
            // 创建失败，从缓存移除
            this.cache.remove(name);
            throw e;
        }
    }
    
    @Override
    public Object remove(String name) {
        // 销毁 Bean
        BeanLifecycleWrapper wrapper = this.cache.remove(name);
        if (wrapper != null) {
            return wrapper.destroy();
        }
        return null;
    }
    
    // 刷新所有 Bean
    public void refreshAll() {
        super.destroy();
        this.cache.clear();
        // 下次访问时会重新创建
    }
}
```

**BeanLifecycleWrapper**：

```java
class BeanLifecycleWrapper {
    
    private final String name;
    private final ObjectFactory<?> objectFactory;
    private Object bean;
    
    public Object getBean() {
        if (this.bean == null) {
            // 懒加载：第一次访问时创建
            synchronized (this.name) {
                if (this.bean == null) {
                    this.bean = this.objectFactory.getObject();
                }
            }
        }
        return this.bean;
    }
    
    public void destroy() {
        if (this.bean != null) {
            // 销毁 Bean
            if (this.bean instanceof DisposableBean) {
                ((DisposableBean) this.bean).destroy();
            }
            this.bean = null;
        }
    }
}
```

### 2.3 刷新触发流程

**RefreshEventListener**：

```java
public class RefreshEventListener implements ApplicationListener<RefreshEvent> {
    
    private final ContextRefresher refresh;
    
    @Override
    public void onApplicationEvent(RefreshEvent event) {
        // 执行刷新
        Set<String> keys = this.refresh.refresh();
        log.info("Refresh keys changed: {}", keys);
    }
}
```

**ContextRefresher**：

```java
public class ContextRefresher {
    
    private final RefreshScope scope;
    private final ConfigurableApplicationContext context;
    
    public synchronized Set<String> refresh() {
        // 1. 刷新 Environment
        Set<String> keys = refreshEnvironment();
        
        // 2. 刷新 @RefreshScope Bean
        this.scope.refreshAll();
        
        return keys;
    }
    
    public synchronized Set<String> refreshEnvironment() {
        // 1. 提取旧配置
        Map<String, Object> before = extract(this.context.getEnvironment()
            .getPropertySources());
        
        // 2. 重新加载配置
        addConfigFilesToEnvironment();
        
        // 3. 提取新配置
        Map<String, Object> after = extract(this.context.getEnvironment()
            .getPropertySources());
        
        // 4. 对比变更
        Set<String> keys = changes(before, after).keySet();
        
        // 5. 发布变更事件
        this.context.publishEvent(new EnvironmentChangeEvent(this.context, keys));
        
        return keys;
    }
}
```

### 2.4 代理模式

**CGLIB 代理**：

```java
@RefreshScope
@Component
public class UserConfig {
    
    @Value("${user.name}")
    private String userName;
    
    public String getUserName() {
        return userName;
    }
}

// Spring 实际创建的是代理对象
UserConfig$$EnhancerBySpringCGLIB$$xxx extends UserConfig {
    
    @Override
    public String getUserName() {
        // 每次调用都从 RefreshScope 获取最新 Bean
        UserConfig target = refreshScope.get("userConfig");
        return target.getUserName();
    }
}
```

**调用链路**：

```
1. 调用代理对象方法
   ↓
2. 代理拦截调用
   ↓
3. 从 RefreshScope 获取目标 Bean
   ↓
4. 如果 Bean 已被销毁（刷新），重新创建
   ↓
5. 调用目标 Bean 方法
```

---

## 3. @ConfigurationProperties 动态绑定

### 3.1 基础用法

```java
@Data
@Component
@ConfigurationProperties(prefix = "user")
public class UserProperties {
    private String name;
    private Integer age;
    private List<String> hobbies;
    private Map<String, String> metadata;
}
```

**Nacos 配置**：

```yaml
user:
  name: zhangsan
  age: 25
  hobbies:
    - reading
    - coding
  metadata:
    city: beijing
    level: senior
```

### 3.2 自动刷新原理

**为什么不需要 @RefreshScope**：

```java
// ❌ 不需要
@RefreshScope
@Component
@ConfigurationProperties(prefix = "user")
public class UserProperties {
    // ...
}

// ✅ 推荐
@Component
@ConfigurationProperties(prefix = "user")
public class UserProperties {
    // 自动支持刷新
}
```

**原因**：

```java
@ConfigurationProperties 使用的是属性绑定，而不是 @Value 注入

刷新流程：
1. 配置变更
   ↓
2. Environment 更新
   ↓
3. ConfigurationPropertiesRebinder 监听 EnvironmentChangeEvent
   ↓
4. 重新绑定属性（调用 setter 方法）
   ↓
5. 属性值更新完成
```

**ConfigurationPropertiesRebinder**：

```java
public class ConfigurationPropertiesRebinder 
    implements ApplicationListener<EnvironmentChangeEvent> {
    
    private final ConfigurationPropertiesBeans beans;
    
    @Override
    public void onApplicationEvent(EnvironmentChangeEvent event) {
        // 配置变更时触发
        if (this.applicationContext != null) {
            rebind();
        }
    }
    
    public void rebind() {
        // 重新绑定所有 @ConfigurationProperties Bean
        for (String name : this.beans.getBeanNames()) {
            rebind(name);
        }
    }
    
    public boolean rebind(String name) {
        // 1. 销毁旧的绑定
        this.beans.get(name).destroy();
        
        // 2. 重新绑定
        ApplicationContext context = this.applicationContext;
        Object bean = context.getBean(name);
        
        // 3. 使用 Binder 绑定新值
        Binder binder = Binder.get(context.getEnvironment());
        binder.bind(prefix, Bindable.ofInstance(bean));
        
        return true;
    }
}
```

### 3.3 @Value vs @ConfigurationProperties

| 特性 | @Value | @ConfigurationProperties |
|------|--------|-------------------------|
| **刷新支持** | 需要 @RefreshScope | 自动支持 |
| **复杂类型** | ❌ 不支持 | ✅ 支持（List/Map） |
| **类型安全** | ⚠️ 运行时错误 | ✅ 编译时检查 |
| **松散绑定** | ❌ 不支持 | ✅ 支持（kebab-case） |
| **元数据支持** | ❌ 不支持 | ✅ 支持（IDE 提示） |
| **推荐度** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

**示例对比**：

```java
// ❌ @Value：需要 @RefreshScope
@RefreshScope
@Component
public class ConfigA {
    @Value("${user.name}")
    private String userName;
    
    @Value("${user.hobbies}")
    private String hobbies;  // ❌ 无法绑定 List
}

// ✅ @ConfigurationProperties：自动刷新
@Component
@ConfigurationProperties(prefix = "user")
public class ConfigB {
    private String name;  // 自动绑定 user.name
    private List<String> hobbies;  // ✅ 支持 List
}
```

---

## 4. ConfigurableEnvironment 扩展

### 4.1 Environment 体系

```
Environment
    └─ ConfigurableEnvironment
        └─ StandardEnvironment
            └─ StandardServletEnvironment
```

**PropertySource 层级**：

```
ConfigurableEnvironment
    └─ MutablePropertySources
        ├─ PropertySource（commandLineArgs）
        ├─ PropertySource（systemProperties）
        ├─ PropertySource（systemEnvironment）
        ├─ PropertySource（random）
        ├─ PropertySource（applicationConfig）
        └─ PropertySource（nacosConfig）
```

### 4.2 自定义 PropertySource

```java
@Component
public class CustomPropertySourceLoader 
    implements EnvironmentPostProcessor, Ordered {
    
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, 
                                        SpringApplication application) {
        // 1. 创建自定义 PropertySource
        Map<String, Object> properties = new HashMap<>();
        properties.put("custom.name", "custom-value");
        properties.put("custom.version", "1.0.0");
        
        PropertySource<?> propertySource = 
            new MapPropertySource("customProperties", properties);
        
        // 2. 添加到 Environment（优先级最高）
        environment.getPropertySources().addFirst(propertySource);
    }
    
    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
```

**注册方式**：

```
# META-INF/spring.factories
org.springframework.boot.env.EnvironmentPostProcessor=\
com.example.config.CustomPropertySourceLoader
```

### 4.3 配置加密解密

**自定义 PropertySource 实现解密**：

```java
public class DecryptPropertySource extends PropertySource<PropertySource<?>> {
    
    private final StringEncryptor encryptor;
    
    @Override
    public Object getProperty(String name) {
        Object value = this.source.getProperty(name);
        
        if (value instanceof String) {
            String strValue = (String) value;
            
            // 解密 ENC() 包裹的值
            if (strValue.startsWith("ENC(") && strValue.endsWith(")")) {
                String encrypted = strValue.substring(4, strValue.length() - 1);
                return encryptor.decrypt(encrypted);
            }
        }
        
        return value;
    }
}
```

---

## 5. 配置变更监听机制

### 5.1 监听器类型

**Spring 事件监听**：

```java
@Component
@Slf4j
public class ConfigChangeListener {
    
    // 1. 监听环境变更事件
    @EventListener
    public void handleEnvironmentChange(EnvironmentChangeEvent event) {
        Set<String> keys = event.getKeys();
        log.info("环境配置变更：{}", keys);
        
        for (String key : keys) {
            log.info("配置项：{} = {}", key, 
                environment.getProperty(key));
        }
    }
    
    // 2. 监听刷新事件
    @EventListener
    public void handleRefresh(RefreshEvent event) {
        log.info("配置刷新事件触发");
    }
    
    // 3. 监听刷新完成事件
    @EventListener
    public void handleRefreshScope(RefreshScopeRefreshedEvent event) {
        log.info("@RefreshScope Bean 已刷新");
    }
}
```

**Nacos 监听器**：

```java
@Component
@Slf4j
public class NacosConfigListener {
    
    @Autowired
    private NacosConfigManager nacosConfigManager;
    
    @PostConstruct
    public void init() throws NacosException {
        String dataId = "user-service-dev.yaml";
        String group = "DEFAULT_GROUP";
        
        // 添加监听器
        nacosConfigManager.getConfigService()
            .addListener(dataId, group, new Listener() {
                
                @Override
                public Executor getExecutor() {
                    return null;  // 使用默认线程池
                }
                
                @Override
                public void receiveConfigInfo(String configInfo) {
                    log.info("Nacos 配置变更：{}", configInfo);
                    
                    // 解析配置
                    YamlPropertiesFactoryBean yaml = 
                        new YamlPropertiesFactoryBean();
                    yaml.setResources(new ByteArrayResource(
                        configInfo.getBytes()));
                    Properties properties = yaml.getObject();
                    
                    // 处理业务逻辑
                    handleConfigChange(properties);
                }
            });
    }
    
    private void handleConfigChange(Properties properties) {
        // 配置变更后的业务处理
        String userName = properties.getProperty("user.name");
        log.info("用户名变更为：{}", userName);
        
        // 清除缓存、重新加载数据等
    }
}
```

### 5.2 自定义刷新逻辑

```java
@Component
@Slf4j
public class CustomRefreshHandler 
    implements ApplicationListener<RefreshEvent> {
    
    @Autowired
    private CacheManager cacheManager;
    
    @Autowired
    private UserService userService;
    
    @Override
    public void onApplicationEvent(RefreshEvent event) {
        log.info("执行自定义刷新逻辑");
        
        try {
            // 1. 清除缓存
            clearCache();
            
            // 2. 重新加载数据
            reloadData();
            
            // 3. 通知其他服务
            notifyOtherServices();
            
            log.info("自定义刷新完成");
            
        } catch (Exception e) {
            log.error("刷新失败", e);
        }
    }
    
    private void clearCache() {
        // 清除所有缓存
        cacheManager.getCacheNames().forEach(name -> {
            Cache cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
                log.info("缓存已清除：{}", name);
            }
        });
    }
    
    private void reloadData() {
        // 重新加载数据
        userService.reloadUserConfig();
    }
    
    private void notifyOtherServices() {
        // 通知其他服务配置已变更
        // 可以通过 MQ、HTTP 等方式
    }
}
```

---

## 6. 配置刷新源码分析

### 6.1 Nacos 配置监听

**ClientWorker 长轮询**：

```java
public class ClientWorker {
    
    public void checkConfigInfo() {
        // 1. 获取所有监听的配置
        List<CacheData> cacheDatas = cacheMap.values();
        List<String> changedGroupKeys = checkUpdateDataIds(cacheDatas);
        
        // 2. 拉取变更的配置
        for (String groupKey : changedGroupKeys) {
            String[] key = GroupKey.parseKey(groupKey);
            String dataId = key[0];
            String group = key[1];
            String content = getServerConfig(dataId, group);
            
            // 3. 更新缓存
            CacheData cache = cacheMap.get(GroupKey.getKey(dataId, group));
            cache.setContent(content);
            
            // 4. 触发监听器
            cache.checkListenerMd5();
        }
    }
    
    private List<String> checkUpdateDataIds(List<CacheData> cacheDatas) {
        // 发起长轮询请求
        String probeUpdateString = buildProbeUpdateString(cacheDatas);
        
        HttpResult result = agent.httpPost(
            Constants.CONFIG_CONTROLLER_PATH + "/listener",
            headers,
            params,
            probeUpdateString,
            30000  // 30秒超时
        );
        
        return parseUpdateDataIdResponse(result.content);
    }
}
```

### 6.2 Spring Cloud 刷新流程

**NacosContextRefresher**：

```java
public class NacosContextRefresher 
    implements ApplicationListener<ApplicationReadyEvent>, ApplicationContextAware {
    
    private final NacosConfigManager nacosConfigManager;
    private final NacosConfigProperties nacosConfigProperties;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // 注册配置监听器
        registerNacosListener();
    }
    
    private void registerNacosListener() {
        // 1. 获取所有配置的 dataId
        List<NacosPropertySource> nacosSources = 
            NacosPropertySourceBuilder.build();
        
        // 2. 为每个配置添加监听器
        for (NacosPropertySource source : nacosSources) {
            String dataId = source.getDataId();
            String group = source.getGroup();
            
            nacosConfigManager.getConfigService()
                .addListener(dataId, group, new Listener() {
                    
                    @Override
                    public void receiveConfigInfo(String configInfo) {
                        // 3. 配置变更，发布刷新事件
                        applicationContext.publishEvent(
                            new RefreshEvent(this, null, "Refresh Nacos config"));
                    }
                    
                    @Override
                    public Executor getExecutor() {
                        return null;
                    }
                });
        }
    }
}
```

**RefreshEventListener**：

```java
public class RefreshEventListener 
    implements SmartApplicationListener {
    
    private final ContextRefresher refresh;
    
    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        if (event instanceof RefreshEvent) {
            handle((RefreshEvent) event);
        }
    }
    
    public void handle(RefreshEvent event) {
        if (this.ready.get()) {
            log.info("Refresh Event triggered");
            
            // 执行刷新
            Set<String> keys = this.refresh.refresh();
            
            log.info("Refresh keys: {}", keys);
        }
    }
}
```

---

## 7. 配置刷新最佳实践

### 7.1 选择合适的刷新方式

**场景一：简单配置**

```java
// ✅ 推荐：@ConfigurationProperties
@Component
@ConfigurationProperties(prefix = "user")
public class UserConfig {
    private String name;
    private Integer age;
}
```

**场景二：需要刷新的 Bean**

```java
// ✅ 推荐：@RefreshScope
@RefreshScope
@Component
public class UserService {
    
    @Value("${user.name}")
    private String userName;
    
    public void doSomething() {
        // 使用 userName
    }
}
```

**场景三：不需要刷新的配置**

```java
// ❌ 不要使用 @RefreshScope
@Component
public class DatabaseConfig {
    
    @Value("${spring.datasource.url}")
    private String url;  // 数据库配置不应该动态刷新
}
```

### 7.2 避免的坑

**坑1：@Value 在单例 Bean 中不刷新**

```java
// ❌ 错误：单例 Bean 中的 @Value 不刷新
@Component
public class ConfigService {
    
    @Value("${user.name}")
    private String userName;  // 不会刷新
}

// ✅ 正确：添加 @RefreshScope
@RefreshScope
@Component
public class ConfigService {
    
    @Value("${user.name}")
    private String userName;  // 会刷新
}
```

**坑2：静态变量不刷新**

```java
// ❌ 错误
@RefreshScope
@Component
public class ConfigService {
    
    @Value("${user.name}")
    private static String userName;  // 静态变量不刷新
}

// ✅ 正确
@RefreshScope
@Component
public class ConfigService {
    
    @Value("${user.name}")
    private String userName;  // 实例变量才能刷新
}
```

**坑3：循环依赖**

```java
// ❌ 错误：@RefreshScope + @Autowired 可能导致循环依赖
@RefreshScope
@Component
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
}

@Component
public class ServiceB {
    @Autowired
    private ServiceA serviceA;  // 循环依赖
}

// ✅ 正确：使用 @Lazy 或构造器注入
@RefreshScope
@Component
public class ServiceA {
    @Autowired
    @Lazy
    private ServiceB serviceB;
}
```

### 7.3 性能优化

**减少刷新范围**：

```java
// ❌ 不推荐：整个 Controller 刷新
@RefreshScope
@RestController
public class UserController {
    @Value("${user.name}")
    private String userName;
    
    // 其他大量业务方法
}

// ✅ 推荐：单独的配置类
@RefreshScope
@Component
public class UserConfig {
    @Value("${user.name}")
    private String userName;
}

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserConfig config;  // 注入配置
}
```

**缓存预热**：

```java
@Component
@Slf4j
public class ConfigRefreshHandler 
    implements ApplicationListener<RefreshScopeRefreshedEvent> {
    
    @Autowired
    private CacheManager cacheManager;
    
    @Override
    public void onApplicationEvent(RefreshScopeRefreshedEvent event) {
        log.info("配置刷新完成，开始预热缓存");
        
        // 预热缓存
        warmUpCache();
    }
    
    private void warmUpCache() {
        // 预加载热点数据
        loadHotData();
    }
}
```

---

## 8. 面试要点

### 8.1 基础问题

**Q1：@RefreshScope 的作用是什么？**

**回答**：
- 标记 Bean 支持配置动态刷新
- 配置变更后销毁旧 Bean，下次访问创建新 Bean
- 使用 CGLIB 代理实现

**Q2：@Value 和 @ConfigurationProperties 刷新有什么区别？**

| 特性 | @Value | @ConfigurationProperties |
|------|--------|-------------------------|
| 刷新支持 | 需要 @RefreshScope | 自动支持 |
| 实现方式 | 销毁重建 Bean | 重新绑定属性 |

### 8.2 进阶问题

**Q3：配置动态刷新的完整流程是什么？**

**流程**：
1. Nacos 配置变更
2. 长轮询检测到变更
3. 触发 Listener
4. 发布 RefreshEvent
5. ContextRefresher 刷新 Environment
6. RefreshScope 销毁 Bean
7. 下次访问重新创建

**Q4：为什么有些配置不能动态刷新？**

**原因**：
- 框架启动时读取的配置（server.port）
- 数据源配置（已建立连接池）
- 单例 Bean 的构造器参数

### 8.3 架构问题

**Q5：如何保证配置刷新的一致性？**

**方案**：
1. 配置版本管理
2. 灰度发布
3. 回滚机制
4. 变更通知

**Q6：配置刷新对性能有什么影响？**

**影响**：
- Bean 重建开销
- 缓存失效
- 网络请求

**优化**：
- 减少刷新范围
- 缓存预热
- 批量刷新

---

## 9. 参考资料

**官方文档**：
- [Spring Cloud Context](https://docs.spring.io/spring-cloud-commons/docs/current/reference/html/#the-spring-cloud-context-application-context-services)
- [Nacos 动态配置](https://nacos.io/zh-cn/docs/concepts.html)

**源码分析**：
- [RefreshScope 源码](https://github.com/spring-cloud/spring-cloud-commons)
- [Nacos Client 源码](https://github.com/alibaba/nacos)

---

**下一章预告**：第 10 章将学习 Nacos Config 高级特性，包括配置加密、敏感配置加密与密钥管理、配置灰度发布与逐步放量、RBAC 权限模型、配置变更审计与追踪等内容。

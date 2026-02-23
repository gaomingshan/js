# 第 38 章：Feign @FeignClient 原理分析

深入分析 Spring Cloud Feign 的 @FeignClient 实现原理，理解声明式 HTTP 客户端的设计思路。

**学习目标：**
- 理解 @FeignClient 工作原理
- 分析 FeignClientFactoryBean 实现
- 掌握 HTTP 客户端代理创建流程

---

## 38.1 @FeignClient 注解

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface FeignClient {
    
    String name() default "";
    
    String url() default "";
    
    String path() default "";
    
    Class<?>[] configuration() default {};
    
    Class<?> fallback() default void.class;
    
    Class<?> fallbackFactory() default void.class;
}
```

---

## 38.2 FeignClientsRegistrar

### 扫描注册流程

```java
class FeignClientsRegistrar implements ImportBeanDefinitionRegistrar, ResourceLoaderAware, EnvironmentAware {
    
    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
        registerDefaultConfiguration(metadata, registry);
        registerFeignClients(metadata, registry);
    }
    
    private void registerFeignClients(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
        ClassPathScanningCandidateComponentProvider scanner = getScanner();
        scanner.addIncludeFilter(new AnnotationTypeFilter(FeignClient.class));
        
        Set<String> basePackages = getBasePackages(metadata);
        
        for (String basePackage : basePackages) {
            Set<BeanDefinition> candidates = scanner.findCandidateComponents(basePackage);
            
            for (BeanDefinition candidate : candidates) {
                AnnotationMetadata annotationMetadata = ((AnnotatedBeanDefinition) candidate).getMetadata();
                Map<String, Object> attributes = annotationMetadata.getAnnotationAttributes(FeignClient.class.getName());
                
                registerFeignClient(registry, annotationMetadata, attributes);
            }
        }
    }
    
    private void registerFeignClient(BeanDefinitionRegistry registry,
                                     AnnotationMetadata annotationMetadata,
                                     Map<String, Object> attributes) {
        String className = annotationMetadata.getClassName();
        BeanDefinitionBuilder definition = BeanDefinitionBuilder.genericBeanDefinition(FeignClientFactoryBean.class);
        
        definition.addPropertyValue("url", getUrl(attributes));
        definition.addPropertyValue("path", getPath(attributes));
        definition.addPropertyValue("name", getName(attributes));
        definition.addPropertyValue("type", className);
        
        String alias = getName(attributes) + "FeignClient";
        registry.registerBeanDefinition(alias, definition.getBeanDefinition());
    }
}
```

---

## 38.3 FeignClientFactoryBean

```java
class FeignClientFactoryBean implements FactoryBean<Object>, InitializingBean, ApplicationContextAware {
    
    private Class<?> type;
    private String name;
    private String url;
    private String path;
    
    @Override
    public Object getObject() throws Exception {
        return getTarget();
    }
    
    <T> T getTarget() {
        FeignContext context = applicationContext.getBean(FeignContext.class);
        Feign.Builder builder = feign(context);
        
        if (!StringUtils.hasText(url)) {
            url = "http://" + name;
            return (T) loadBalance(builder, context, new HardCodedTarget<>(type, name, url));
        }
        
        if (StringUtils.hasText(url) && !url.startsWith("http")) {
            url = "http://" + url;
        }
        
        String url = this.url + cleanPath();
        Client client = getOptional(context, Client.class);
        
        Targeter targeter = get(context, Targeter.class);
        return (T) targeter.target(this, builder, context, new HardCodedTarget<>(type, name, url));
    }
    
    @Override
    public Class<?> getObjectType() {
        return type;
    }
}
```

---

## 38.4 Feign 代理创建

### ReflectiveFeign

```java
public class ReflectiveFeign extends Feign {
    
    @Override
    public <T> T newInstance(Target<T> target) {
        Map<String, MethodHandler> nameToHandler = targetToHandlersByName.apply(target);
        
        InvocationHandler handler = factory.create(target, nameToHandler);
        
        T proxy = (T) Proxy.newProxyInstance(
            target.type().getClassLoader(),
            new Class<?>[] { target.type() },
            handler
        );
        
        return proxy;
    }
}
```

### FeignInvocationHandler

```java
static class FeignInvocationHandler implements InvocationHandler {
    
    private final Target target;
    private final Map<Method, MethodHandler> dispatch;
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 执行 HTTP 请求
        return dispatch.get(method).invoke(args);
    }
}
```

---

## 38.5 完整流程

```
1. @EnableFeignClients 注解
    ↓
2. Import FeignClientsRegistrar
    ↓
3. 扫描 @FeignClient 接口
    ↓
4. 为每个接口注册 FeignClientFactoryBean
    ↓
5. FeignClientFactoryBean.getObject() 创建代理
    ↓
6. Feign.Builder 构建客户端
    ↓
7. ReflectiveFeign.newInstance() 创建 JDK 动态代理
    ↓
8. 方法调用时执行 HTTP 请求
```

---

## 38.6 本章小结

**核心要点：**
1. @FeignClient 通过 ImportBeanDefinitionRegistrar 实现
2. FeignClientFactoryBean 为每个接口创建代理
3. ReflectiveFeign 使用 JDK 动态代理
4. 方法调用转换为 HTTP 请求执行

**相关章节：**
- [第 37 章：从零实现自己的 @MapperScan](./content-37.md)
- [第 39 章：实现自己的 RPC 客户端](./content-39.md)
- [第 40 章：高级 Starter 开发综合实战](./content-40.md)

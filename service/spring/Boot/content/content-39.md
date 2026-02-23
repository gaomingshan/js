# 第 39 章：实现自己的 RPC 客户端

实战开发一个完整的声明式 RPC 客户端，综合运用扫描、代理、HTTP 调用等技术。

**学习目标：**
- 实现类似 Feign 的声明式 HTTP 客户端
- 掌握 HTTP 请求的动态构建和执行
- 完成端到端的 RPC 客户端实现

---

## 39.1 项目结构

```
my-rpc-spring-boot-starter/
├── src/main/java/
│   └── com/example/rpc/
│       ├── annotation/
│       │   ├── RpcClient.java
│       │   ├── EnableRpcClients.java
│       │   ├── GetMapping.java
│       │   └── PostMapping.java
│       ├── proxy/
│       │   ├── RpcClientProxy.java
│       │   └── RpcClientProxyFactory.java
│       ├── factory/
│       │   └── RpcClientFactoryBean.java
│       ├── registry/
│       │   └── RpcClientsRegistrar.java
│       └── http/
│           └── HttpExecutor.java
```

---

## 39.2 核心注解定义

### @RpcClient

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RpcClient {
    
    String name() default "";
    
    String url() default "";
    
    String path() default "";
}
```

### @EnableRpcClients

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(RpcClientsRegistrar.class)
public @interface EnableRpcClients {
    
    String[] basePackages() default {};
    
    Class<?>[] basePackageClasses() default {};
}
```

### HTTP 方法注解

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface GetMapping {
    String value() default "";
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PostMapping {
    String value() default "";
}
```

---

## 39.3 HTTP 执行器

```java
public class HttpExecutor {
    
    private final RestTemplate restTemplate;
    
    public HttpExecutor() {
        this.restTemplate = new RestTemplate();
    }
    
    public Object executeGet(String url, Method method, Object[] args) {
        try {
            Class<?> returnType = method.getReturnType();
            String fullUrl = buildUrl(url, method, args);
            
            return restTemplate.getForObject(fullUrl, returnType);
        } catch (Exception e) {
            throw new RuntimeException("HTTP GET failed: " + url, e);
        }
    }
    
    public Object executePost(String url, Method method, Object[] args) {
        try {
            Class<?> returnType = method.getReturnType();
            Object requestBody = args.length > 0 ? args[0] : null;
            
            return restTemplate.postForObject(url, requestBody, returnType);
        } catch (Exception e) {
            throw new RuntimeException("HTTP POST failed: " + url, e);
        }
    }
    
    private String buildUrl(String baseUrl, Method method, Object[] args) {
        GetMapping mapping = method.getAnnotation(GetMapping.class);
        String path = mapping.value();
        
        // 处理路径参数
        if (args != null && args.length > 0) {
            path = String.format(path.replace("{", "%").replace("}", "s"), args);
        }
        
        return baseUrl + path;
    }
}
```

---

## 39.4 RPC 客户端代理

```java
public class RpcClientProxy implements InvocationHandler {
    
    private final Class<?> clientInterface;
    private final String baseUrl;
    private final HttpExecutor httpExecutor;
    
    public RpcClientProxy(Class<?> clientInterface, String baseUrl) {
        this.clientInterface = clientInterface;
        this.baseUrl = baseUrl;
        this.httpExecutor = new HttpExecutor();
    }
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if (method.isAnnotationPresent(GetMapping.class)) {
            return executeGet(method, args);
        } else if (method.isAnnotationPresent(PostMapping.class)) {
            return executePost(method, args);
        }
        
        throw new UnsupportedOperationException("Unsupported method: " + method.getName());
    }
    
    private Object executeGet(Method method, Object[] args) {
        GetMapping mapping = method.getAnnotation(GetMapping.class);
        String url = baseUrl + mapping.value();
        
        return httpExecutor.executeGet(url, method, args);
    }
    
    private Object executePost(Method method, Object[] args) {
        PostMapping mapping = method.getAnnotation(PostMapping.class);
        String url = baseUrl + mapping.value();
        
        return httpExecutor.executePost(url, method, args);
    }
}
```

---

## 39.5 RpcClientFactoryBean

```java
public class RpcClientFactoryBean<T> implements FactoryBean<T> {
    
    private final Class<T> clientInterface;
    private final String baseUrl;
    
    public RpcClientFactoryBean(Class<T> clientInterface, String baseUrl) {
        this.clientInterface = clientInterface;
        this.baseUrl = baseUrl;
    }
    
    @Override
    public T getObject() throws Exception {
        RpcClientProxy proxy = new RpcClientProxy(clientInterface, baseUrl);
        return (T) Proxy.newProxyInstance(
            clientInterface.getClassLoader(),
            new Class[] { clientInterface },
            proxy
        );
    }
    
    @Override
    public Class<?> getObjectType() {
        return clientInterface;
    }
    
    @Override
    public boolean isSingleton() {
        return true;
    }
}
```

---

## 39.6 RpcClientsRegistrar

```java
public class RpcClientsRegistrar implements ImportBeanDefinitionRegistrar {
    
    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata, 
                                        BeanDefinitionRegistry registry) {
        Map<String, Object> attributes = metadata.getAnnotationAttributes(
            EnableRpcClients.class.getName()
        );
        
        String[] basePackages = (String[]) attributes.get("basePackages");
        
        if (basePackages.length == 0) {
            basePackages = new String[] { getDefaultBasePackage(metadata) };
        }
        
        for (String pkg : basePackages) {
            scanAndRegister(pkg, registry);
        }
    }
    
    private void scanAndRegister(String basePackage, BeanDefinitionRegistry registry) {
        ClassPathScanningCandidateComponentProvider scanner = 
            new ClassPathScanningCandidateComponentProvider(false);
        
        scanner.addIncludeFilter(new AnnotationTypeFilter(RpcClient.class));
        
        Set<BeanDefinition> candidates = scanner.findCandidateComponents(basePackage);
        
        for (BeanDefinition candidate : candidates) {
            registerRpcClient(candidate, registry);
        }
    }
    
    private void registerRpcClient(BeanDefinition candidate, BeanDefinitionRegistry registry) {
        try {
            Class<?> clientInterface = Class.forName(candidate.getBeanClassName());
            
            RpcClient annotation = clientInterface.getAnnotation(RpcClient.class);
            String baseUrl = annotation.url();
            
            if (baseUrl.isEmpty()) {
                baseUrl = "http://" + annotation.name();
            }
            
            if (!annotation.path().isEmpty()) {
                baseUrl = baseUrl + annotation.path();
            }
            
            BeanDefinitionBuilder builder = BeanDefinitionBuilder
                .genericBeanDefinition(RpcClientFactoryBean.class);
            
            builder.addConstructorArgValue(clientInterface);
            builder.addConstructorArgValue(baseUrl);
            
            String beanName = generateBeanName(clientInterface);
            registry.registerBeanDefinition(beanName, builder.getBeanDefinition());
            
            System.out.println("Registered RPC Client: " + clientInterface.getName());
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
    
    private String generateBeanName(Class<?> clientInterface) {
        String simpleName = clientInterface.getSimpleName();
        return Character.toLowerCase(simpleName.charAt(0)) + simpleName.substring(1);
    }
    
    private String getDefaultBasePackage(AnnotationMetadata metadata) {
        String className = metadata.getClassName();
        return className.substring(0, className.lastIndexOf('.'));
    }
}
```

---

## 39.7 使用示例

### 定义 RPC 客户端接口

```java
@RpcClient(name = "user-service", url = "http://localhost:8081", path = "/api")
public interface UserClient {
    
    @GetMapping("/users/{id}")
    User findById(Long id);
    
    @GetMapping("/users")
    List<User> findAll();
    
    @PostMapping("/users")
    User save(User user);
}
```

### 启用 RPC 客户端

```java
@EnableRpcClients(basePackages = "com.example.client")
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 使用 RPC 客户端

```java
@Service
public class UserService {
    
    @Autowired
    private UserClient userClient;
    
    public User getUser(Long id) {
        return userClient.findById(id);
    }
    
    public List<User> getAllUsers() {
        return userClient.findAll();
    }
    
    public User createUser(User user) {
        return userClient.save(user);
    }
}
```

---

## 39.8 本章小结

**核心要点：**
1. 实现了完整的声明式 RPC 客户端
2. 综合运用扫描、代理、HTTP 调用等技术
3. 支持 GET、POST 等 HTTP 方法
4. 可扩展支持更多特性：超时、重试、负载均衡等

**相关章节：**
- [第 38 章：Feign @FeignClient 原理分析](./content-38.md)
- [第 40 章：高级 Starter 开发综合实战](./content-40.md)
- [第 41 章：Actuator 核心端点](./content-41.md)

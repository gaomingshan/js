# 第 35 章：基于 FactoryBean 实现代理

本章结合 FactoryBean 和动态代理，实现接口的代理对象创建，为自定义 @MapperScan 做准备。

**学习目标：**
- 掌握 FactoryBean 与动态代理的结合
- 实现通用的接口代理工厂
- 为高级组件开发打下基础

---

## 35.1 代理 FactoryBean 实现

```java
public class InterfaceProxyFactoryBean<T> implements FactoryBean<T> {
    
    private Class<T> interfaceClass;
    
    public InterfaceProxyFactoryBean(Class<T> interfaceClass) {
        this.interfaceClass = interfaceClass;
    }
    
    @Override
    public T getObject() throws Exception {
        return (T) Proxy.newProxyInstance(
            interfaceClass.getClassLoader(),
            new Class[] { interfaceClass },
            new InterfaceInvocationHandler(interfaceClass)
        );
    }
    
    @Override
    public Class<?> getObjectType() {
        return interfaceClass;
    }
    
    @Override
    public boolean isSingleton() {
        return true;
    }
}
```

### InvocationHandler 实现

```java
public class InterfaceInvocationHandler implements InvocationHandler {
    
    private final Class<?> interfaceClass;
    
    public InterfaceInvocationHandler(Class<?> interfaceClass) {
        this.interfaceClass = interfaceClass;
    }
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("Invoking method: " + method.getName());
        System.out.println("Interface: " + interfaceClass.getName());
        System.out.println("Args: " + Arrays.toString(args));
        
        // 实际项目中这里可以执行 HTTP 请求、数据库查询等操作
        
        return getDefaultReturnValue(method.getReturnType());
    }
    
    private Object getDefaultReturnValue(Class<?> returnType) {
        if (returnType == void.class) {
            return null;
        }
        if (returnType.isPrimitive()) {
            return 0;
        }
        return null;
    }
}
```

---

## 35.2 动态注册代理 Bean

```java
public class InterfaceProxyRegistrar implements ImportBeanDefinitionRegistrar {
    
    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata,
                                        BeanDefinitionRegistry registry) {
        Map<String, Object> attributes = metadata.getAnnotationAttributes(
            EnableInterfaceProxy.class.getName()
        );
        
        String[] basePackages = (String[]) attributes.get("basePackages");
        
        for (String pkg : basePackages) {
            scanAndRegister(pkg, registry);
        }
    }
    
    private void scanAndRegister(String basePackage, BeanDefinitionRegistry registry) {
        ClassPathScanningCandidateComponentProvider scanner = 
            new ClassPathScanningCandidateComponentProvider(false);
        
        scanner.addIncludeFilter(new AnnotationTypeFilter(ProxyInterface.class));
        
        Set<BeanDefinition> candidates = scanner.findCandidateComponents(basePackage);
        
        for (BeanDefinition candidate : candidates) {
            try {
                Class<?> interfaceClass = Class.forName(candidate.getBeanClassName());
                registerProxyBean(interfaceClass, registry);
            } catch (ClassNotFoundException e) {
                throw new RuntimeException(e);
            }
        }
    }
    
    private void registerProxyBean(Class<?> interfaceClass, BeanDefinitionRegistry registry) {
        BeanDefinitionBuilder builder = BeanDefinitionBuilder
            .genericBeanDefinition(InterfaceProxyFactoryBean.class);
        
        builder.addConstructorArgValue(interfaceClass);
        
        String beanName = generateBeanName(interfaceClass);
        registry.registerBeanDefinition(beanName, builder.getBeanDefinition());
    }
    
    private String generateBeanName(Class<?> interfaceClass) {
        String simpleName = interfaceClass.getSimpleName();
        return Character.toLowerCase(simpleName.charAt(0)) + simpleName.substring(1);
    }
}
```

---

## 35.3 使用示例

### 定义接口

```java
@ProxyInterface
public interface UserClient {
    User findById(Long id);
    List<User> findAll();
}
```

### 启用代理

```java
@EnableInterfaceProxy(basePackages = "com.example.client")
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 使用代理对象

```java
@Service
public class UserService {
    
    @Autowired
    private UserClient userClient;
    
    public User getUser(Long id) {
        return userClient.findById(id);
    }
}
```

---

## 35.4 本章小结

**核心要点：**
1. FactoryBean + 动态代理 = 接口代理对象
2. ImportBeanDefinitionRegistrar 实现动态注册
3. ClassPathScanner 扫描接口
4. 为实现 @MapperScan 类似功能打下基础

**相关章节：**
- [第 32 章：FactoryBean 原理与应用](./content-32.md)
- [第 33 章：JDK 动态代理实现](./content-33.md)
- [第 36 章：MyBatis @MapperScan 原理分析](./content-36.md)

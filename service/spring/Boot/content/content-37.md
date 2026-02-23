# 第 37 章：从零实现自己的 @MapperScan

实战开发一个完整的 @MapperScan 功能，掌握扫描+代理+注册的完整技术链。

**学习目标：**
- 实现自定义的 @MapperScan 注解
- 完成接口扫描和代理注册
- 掌握高级组件开发的完整流程

---

## 37.1 项目结构

```
my-mapper-spring-boot-starter/
├── src/main/java/
│   └── com/example/mapper/
│       ├── annotation/
│       │   ├── MyMapper.java
│       │   └── MyMapperScan.java
│       ├── proxy/
│       │   ├── MyMapperProxy.java
│       │   └── MyMapperProxyFactory.java
│       ├── factory/
│       │   └── MyMapperFactoryBean.java
│       └── registry/
│           └── MyMapperScannerRegistrar.java
└── src/main/resources/
    └── META-INF/
        └── spring.factories
```

---

## 37.2 核心注解定义

### @MyMapper 注解

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface MyMapper {
}
```

### @MyMapperScan 注解

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(MyMapperScannerRegistrar.class)
public @interface MyMapperScan {
    
    String[] basePackages() default {};
    
    Class<?>[] basePackageClasses() default {};
}
```

---

## 37.3 扫描注册器

```java
public class MyMapperScannerRegistrar implements ImportBeanDefinitionRegistrar {
    
    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata, 
                                        BeanDefinitionRegistry registry) {
        Map<String, Object> attributes = metadata.getAnnotationAttributes(
            MyMapperScan.class.getName()
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
        
        scanner.addIncludeFilter(new AnnotationTypeFilter(MyMapper.class));
        
        Set<BeanDefinition> candidates = scanner.findCandidateComponents(basePackage);
        
        for (BeanDefinition candidate : candidates) {
            registerMapperBean(candidate, registry);
        }
    }
    
    private void registerMapperBean(BeanDefinition candidate, BeanDefinitionRegistry registry) {
        try {
            Class<?> mapperInterface = Class.forName(candidate.getBeanClassName());
            
            BeanDefinitionBuilder builder = BeanDefinitionBuilder
                .genericBeanDefinition(MyMapperFactoryBean.class);
            
            builder.addConstructorArgValue(mapperInterface);
            
            String beanName = generateBeanName(mapperInterface);
            registry.registerBeanDefinition(beanName, builder.getBeanDefinition());
            
            System.out.println("Registered Mapper: " + mapperInterface.getName());
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
    
    private String generateBeanName(Class<?> mapperInterface) {
        String simpleName = mapperInterface.getSimpleName();
        return Character.toLowerCase(simpleName.charAt(0)) + simpleName.substring(1);
    }
    
    private String getDefaultBasePackage(AnnotationMetadata metadata) {
        String className = metadata.getClassName();
        return className.substring(0, className.lastIndexOf('.'));
    }
}
```

---

## 37.4 Mapper FactoryBean

```java
public class MyMapperFactoryBean<T> implements FactoryBean<T> {
    
    private final Class<T> mapperInterface;
    
    public MyMapperFactoryBean(Class<T> mapperInterface) {
        this.mapperInterface = mapperInterface;
    }
    
    @Override
    public T getObject() throws Exception {
        return new MyMapperProxyFactory<>(mapperInterface).newInstance();
    }
    
    @Override
    public Class<?> getObjectType() {
        return mapperInterface;
    }
    
    @Override
    public boolean isSingleton() {
        return true;
    }
}
```

---

## 37.5 Mapper 代理工厂

```java
public class MyMapperProxyFactory<T> {
    
    private final Class<T> mapperInterface;
    
    public MyMapperProxyFactory(Class<T> mapperInterface) {
        this.mapperInterface = mapperInterface;
    }
    
    public T newInstance() {
        MyMapperProxy<T> proxy = new MyMapperProxy<>(mapperInterface);
        return (T) Proxy.newProxyInstance(
            mapperInterface.getClassLoader(),
            new Class[] { mapperInterface },
            proxy
        );
    }
}
```

---

## 37.6 Mapper 代理处理器

```java
public class MyMapperProxy<T> implements InvocationHandler {
    
    private final Class<T> mapperInterface;
    
    public MyMapperProxy(Class<T> mapperInterface) {
        this.mapperInterface = mapperInterface;
    }
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("MyMapper 调用: " + mapperInterface.getName() + "." + method.getName());
        System.out.println("参数: " + Arrays.toString(args));
        
        // 实际项目中这里可以：
        // 1. 解析方法上的注解（如 @Select）
        // 2. 构建 SQL 语句
        // 3. 执行数据库查询
        // 4. 返回结果
        
        return getDefaultReturnValue(method.getReturnType());
    }
    
    private Object getDefaultReturnValue(Class<?> returnType) {
        if (returnType == void.class) {
            return null;
        }
        if (returnType == List.class) {
            return Collections.emptyList();
        }
        if (returnType.isPrimitive()) {
            return 0;
        }
        return null;
    }
}
```

---

## 37.7 使用示例

### 定义 Mapper 接口

```java
@MyMapper
public interface UserMapper {
    User findById(Long id);
    List<User> findAll();
    void save(User user);
}
```

### 启用扫描

```java
@MyMapperScan(basePackages = "com.example.mapper")
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 使用 Mapper

```java
@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public User getUser(Long id) {
        return userMapper.findById(id);
    }
}
```

---

## 37.8 本章小结

**核心要点：**
1. 完整实现了类似 MyBatis 的 @MapperScan 功能
2. 技术栈：扫描 + 代理 + FactoryBean + ImportBeanDefinitionRegistrar
3. 可扩展支持注解解析、SQL 执行等高级功能
4. 掌握了高级组件开发的完整流程

**相关章节：**
- [第 36 章：MyBatis @MapperScan 原理分析](./content-36.md)
- [第 38 章：Feign @FeignClient 原理分析](./content-38.md)
- [第 39 章：实现自己的 RPC 客户端](./content-39.md)

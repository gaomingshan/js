# 第 36 章：MyBatis @MapperScan 原理分析

深入分析 MyBatis 的 @MapperScan 实现原理，理解如何通过扫描+代理实现接口自动化。

**学习目标：**
- 理解 @MapperScan 的工作原理
- 分析 MapperScannerRegistrar 源码
- 掌握 Mapper 代理对象的创建流程

---

## 36.1 @MapperScan 注解

### 注解定义

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(MapperScannerRegistrar.class)
public @interface MapperScan {
    
    String[] value() default {};
    
    String[] basePackages() default {};
    
    Class<?>[] basePackageClasses() default {};
    
    Class<? extends BeanNameGenerator> nameGenerator() default BeanNameGenerator.class;
    
    Class<? extends Annotation> annotationClass() default Annotation.class;
    
    Class<?> markerInterface() default Class.class;
    
    String sqlSessionTemplateRef() default "";
    
    String sqlSessionFactoryRef() default "";
    
    Class<? extends MapperFactoryBean> factoryBean() default MapperFactoryBean.class;
}
```

---

## 36.2 MapperScannerRegistrar

### 核心实现

```java
public class MapperScannerRegistrar implements ImportBeanDefinitionRegistrar, ResourceLoaderAware {
    
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata,
                                        BeanDefinitionRegistry registry) {
        // 1. 获取注解属性
        AnnotationAttributes mapperScanAttrs = AnnotationAttributes.fromMap(
            importingClassMetadata.getAnnotationAttributes(MapperScan.class.getName())
        );
        
        if (mapperScanAttrs != null) {
            registerBeanDefinitions(importingClassMetadata, mapperScanAttrs, registry,
                generateBaseBeanName(importingClassMetadata, 0));
        }
    }
    
    void registerBeanDefinitions(AnnotationMetadata annoMeta, 
                                 AnnotationAttributes annoAttrs,
                                 BeanDefinitionRegistry registry, 
                                 String beanName) {
        // 2. 创建 ClassPathMapperScanner
        BeanDefinitionBuilder builder = BeanDefinitionBuilder
            .genericBeanDefinition(MapperScannerConfigurer.class);
        
        builder.addPropertyValue("processPropertyPlaceHolders", true);
        
        // 3. 设置扫描包路径
        List<String> basePackages = new ArrayList<>();
        basePackages.addAll(Arrays.stream(annoAttrs.getStringArray("value"))
            .filter(StringUtils::hasText).collect(Collectors.toList()));
        basePackages.addAll(Arrays.stream(annoAttrs.getStringArray("basePackages"))
            .filter(StringUtils::hasText).collect(Collectors.toList()));
        
        builder.addPropertyValue("basePackage", StringUtils.collectionToCommaDelimitedString(basePackages));
        
        // 4. 设置 SqlSessionFactory
        builder.addPropertyValue("sqlSessionFactoryBeanName", annoAttrs.getString("sqlSessionFactoryRef"));
        
        // 5. 注册 BeanDefinition
        registry.registerBeanDefinition(beanName, builder.getBeanDefinition());
    }
}
```

---

## 36.3 MapperFactoryBean

### 创建 Mapper 代理

```java
public class MapperFactoryBean<T> extends SqlSessionDaoSupport implements FactoryBean<T> {
    
    private Class<T> mapperInterface;
    
    @Override
    public T getObject() throws Exception {
        return getSqlSession().getMapper(this.mapperInterface);
    }
    
    @Override
    public Class<T> getObjectType() {
        return this.mapperInterface;
    }
    
    @Override
    public boolean isSingleton() {
        return true;
    }
}
```

### Mapper 代理对象创建

```java
// MyBatis 内部实现
public class MapperProxyFactory<T> {
    
    private final Class<T> mapperInterface;
    
    public T newInstance(SqlSession sqlSession) {
        MapperProxy<T> mapperProxy = new MapperProxy<>(sqlSession, mapperInterface, methodCache);
        return (T) Proxy.newProxyInstance(
            mapperInterface.getClassLoader(),
            new Class[] { mapperInterface },
            mapperProxy
        );
    }
}

public class MapperProxy<T> implements InvocationHandler {
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 执行 SQL 操作
        return sqlSession.selectOne(method.getName(), args);
    }
}
```

---

## 36.4 完整流程

```
1. @MapperScan 注解
    ↓
2. Import MapperScannerRegistrar
    ↓
3. 扫描指定包下的接口
    ↓
4. 为每个接口注册 MapperFactoryBean
    ↓
5. MapperFactoryBean.getObject() 创建代理对象
    ↓
6. Proxy.newProxyInstance() 创建 JDK 动态代理
    ↓
7. 方法调用时执行 SQL 操作
```

---

## 36.5 本章小结

**核心要点：**
1. @MapperScan 通过 ImportBeanDefinitionRegistrar 实现
2. MapperFactoryBean 为每个接口创建代理对象
3. JDK 动态代理拦截方法调用，执行 SQL
4. 扫描+代理+FactoryBean 是核心技术组合

**相关章节：**
- [第 35 章：基于 FactoryBean 实现代理](./content-35.md)
- [第 37 章：从零实现自己的 @MapperScan](./content-37.md)
- [第 38 章：Feign @FeignClient 原理分析](./content-38.md)

# 第 30 章：BeanDefinition 注册流程

## 本章概述

深入分析 BeanDefinition 的注册机制，包括 BeanDefinitionRegistry 接口、注册流程和 BeanDefinitionRegistryPostProcessor。

**学习目标：**
- 理解 BeanDefinition 注册机制
- 掌握 BeanDefinitionRegistry 接口
- 学会使用 BeanDefinitionRegistryPostProcessor
- 理解动态注册 Bean 的方法

---

## 30.1 BeanDefinitionRegistry

### 接口定义

```java
public interface BeanDefinitionRegistry extends AliasRegistry {
    
    void registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
            throws BeanDefinitionStoreException;
    
    void removeBeanDefinition(String beanName)
            throws NoSuchBeanDefinitionException;
    
    BeanDefinition getBeanDefinition(String beanName)
            throws NoSuchBeanDefinitionException;
    
    boolean containsBeanDefinition(String beanName);
    
    String[] getBeanDefinitionNames();
    
    int getBeanDefinitionCount();
    
    boolean isBeanNameInUse(String beanName);
}
```

---

## 30.2 注册流程

### doScan() 方法

```java
protected Set<BeanDefinitionHolder> doScan(String... basePackages) {
    Set<BeanDefinitionHolder> beanDefinitions = new LinkedHashSet<>();
    
    for (String basePackage : basePackages) {
        // 1. 查找候选组件
        Set<BeanDefinition> candidates = findCandidateComponents(basePackage);
        
        for (BeanDefinition candidate : candidates) {
            // 2. 解析 Scope
            ScopeMetadata scopeMetadata = this.scopeMetadataResolver.resolveScopeMetadata(candidate);
            candidate.setScope(scopeMetadata.getScopeName());
            
            // 3. 生成 Bean 名称
            String beanName = this.beanNameGenerator.generateBeanName(candidate, this.registry);
            
            // 4. 处理通用注解
            if (candidate instanceof AbstractBeanDefinition) {
                postProcessBeanDefinition((AbstractBeanDefinition) candidate, beanName);
            }
            if (candidate instanceof AnnotatedBeanDefinition) {
                AnnotationConfigUtils.processCommonDefinitionAnnotations((AnnotatedBeanDefinition) candidate);
            }
            
            // 5. 检查候选组件
            if (checkCandidate(beanName, candidate)) {
                BeanDefinitionHolder definitionHolder = new BeanDefinitionHolder(candidate, beanName);
                definitionHolder = AnnotationConfigUtils.applyScopedProxyMode(scopeMetadata, definitionHolder, this.registry);
                beanDefinitions.add(definitionHolder);
                
                // 6. 注册 BeanDefinition
                registerBeanDefinition(definitionHolder, this.registry);
            }
        }
    }
    
    return beanDefinitions;
}
```

---

## 30.3 BeanDefinitionRegistryPostProcessor

### 接口定义

```java
public interface BeanDefinitionRegistryPostProcessor extends BeanFactoryPostProcessor {
    
    void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry)
            throws BeansException;
}
```

### 使用示例

```java
@Component
public class MyBeanDefinitionRegistryPostProcessor 
        implements BeanDefinitionRegistryPostProcessor {
    
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) 
            throws BeansException {
        // 动态注册 BeanDefinition
        RootBeanDefinition beanDefinition = new RootBeanDefinition(MyService.class);
        beanDefinition.setScope(BeanDefinition.SCOPE_SINGLETON);
        
        registry.registerBeanDefinition("myService", beanDefinition);
    }
    
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) 
            throws BeansException {
        // 后处理 BeanFactory
    }
}
```

---

## 30.4 动态注册 Bean

### 方式1：BeanDefinitionBuilder

```java
BeanDefinitionBuilder builder = BeanDefinitionBuilder.genericBeanDefinition(MyService.class);
builder.addPropertyValue("name", "demo");
builder.setScope(BeanDefinition.SCOPE_SINGLETON);

registry.registerBeanDefinition("myService", builder.getBeanDefinition());
```

### 方式2：GenericBeanDefinition

```java
GenericBeanDefinition beanDefinition = new GenericBeanDefinition();
beanDefinition.setBeanClass(MyService.class);
beanDefinition.setScope(BeanDefinition.SCOPE_PROTOTYPE);
beanDefinition.getPropertyValues().add("name", "demo");

registry.registerBeanDefinition("myService", beanDefinition);
```

---

## 30.5 ImportBeanDefinitionRegistrar

### 接口定义

```java
public interface ImportBeanDefinitionRegistrar {
    
    default void registerBeanDefinitions(AnnotationMetadata importingClassMetadata,
                                         BeanDefinitionRegistry registry,
                                         BeanNameGenerator importBeanNameGenerator) {
        registerBeanDefinitions(importingClassMetadata, registry);
    }
    
    default void registerBeanDefinitions(AnnotationMetadata importingClassMetadata,
                                         BeanDefinitionRegistry registry) {
    }
}
```

### 使用示例

```java
public class MyImportBeanDefinitionRegistrar implements ImportBeanDefinitionRegistrar {
    
    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata,
                                        BeanDefinitionRegistry registry) {
        // 获取注解属性
        Map<String, Object> attributes = metadata.getAnnotationAttributes(
                EnableMyFeature.class.getName());
        
        String[] basePackages = (String[]) attributes.get("basePackages");
        
        // 扫描并注册 Bean
        for (String pkg : basePackages) {
            scanAndRegister(pkg, registry);
        }
    }
    
    private void scanAndRegister(String basePackage, BeanDefinitionRegistry registry) {
        ClassPathScanningCandidateComponentProvider scanner = 
                new ClassPathScanningCandidateComponentProvider(false);
        
        scanner.addIncludeFilter(new AnnotationTypeFilter(MyAnnotation.class));
        
        Set<BeanDefinition> candidates = scanner.findCandidateComponents(basePackage);
        
        for (BeanDefinition candidate : candidates) {
            String beanName = generateBeanName(candidate);
            registry.registerBeanDefinition(beanName, candidate);
        }
    }
}

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(MyImportBeanDefinitionRegistrar.class)
public @interface EnableMyFeature {
    String[] basePackages() default {};
}
```

---

## 30.6 本章小结

**核心要点：**
1. BeanDefinitionRegistry 负责注册 BeanDefinition
2. BeanDefinitionRegistryPostProcessor 可在容器刷新前动态注册 Bean
3. ImportBeanDefinitionRegistrar 配合 @Import 实现动态注册
4. 支持通过代码方式动态注册 Bean

**相关章节：**
- [第 28 章：@ComponentScan 扫描机制](./content-28.md)
- [第 29 章：ClassPathScanningCandidateComponentProvider](./content-29.md)
- [第 31 章：@Import 导入机制深入](./content-31.md)

# 第 29 章：ClassPathScanningCandidateComponentProvider

## 本章概述

深入分析 ClassPathScanningCandidateComponentProvider 的源码实现，理解候选组件的扫描和筛选过程。

**学习目标：**
- 掌握候选组件扫描原理
- 理解 MetadataReader 机制
- 学会自定义扫描器

---

## 29.1 核心方法

### findCandidateComponents()

```java
public Set<BeanDefinition> findCandidateComponents(String basePackage) {
    Set<BeanDefinition> candidates = new LinkedHashSet<>();
    
    try {
        String packageSearchPath = ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX +
                resolveBasePackage(basePackage) + '/' + this.resourcePattern;
        
        Resource[] resources = getResourcePatternResolver().getResources(packageSearchPath);
        
        for (Resource resource : resources) {
            if (resource.isReadable()) {
                MetadataReader metadataReader = getMetadataReaderFactory().getMetadataReader(resource);
                
                if (isCandidateComponent(metadataReader)) {
                    ScannedGenericBeanDefinition sbd = new ScannedGenericBeanDefinition(metadataReader);
                    sbd.setSource(resource);
                    
                    if (isCandidateComponent(sbd)) {
                        candidates.add(sbd);
                    }
                }
            }
        }
    } catch (IOException ex) {
        throw new BeanDefinitionStoreException("I/O failure during classpath scanning", ex);
    }
    
    return candidates;
}
```

---

## 29.2 过滤机制

### isCandidateComponent()

```java
protected boolean isCandidateComponent(MetadataReader metadataReader) throws IOException {
    // 1. 应用排除过滤器
    for (TypeFilter tf : this.excludeFilters) {
        if (tf.match(metadataReader, getMetadataReaderFactory())) {
            return false;
        }
    }
    
    // 2. 应用包含过滤器
    for (TypeFilter tf : this.includeFilters) {
        if (tf.match(metadataReader, getMetadataReaderFactory())) {
            return isConditionMatch(metadataReader);
        }
    }
    
    return false;
}
```

### 默认过滤器

```java
protected void registerDefaultFilters() {
    this.includeFilters.add(new AnnotationTypeFilter(Component.class));
    
    // JSR-250 支持
    ClassLoader cl = ClassPathScanningCandidateComponentProvider.class.getClassLoader();
    try {
        this.includeFilters.add(new AnnotationTypeFilter(
                ((Class<? extends Annotation>) ClassUtils.forName("javax.annotation.ManagedBean", cl)), false));
    } catch (ClassNotFoundException ex) {
        // JSR-250 不可用 - 跳过
    }
    
    try {
        this.includeFilters.add(new AnnotationTypeFilter(
                ((Class<? extends Annotation>) ClassUtils.forName("javax.inject.Named", cl)), false));
    } catch (ClassNotFoundException ex) {
        // JSR-330 不可用 - 跳过
    }
}
```

---

## 29.3 MetadataReader

### 接口定义

```java
public interface MetadataReader {
    
    Resource getResource();
    
    ClassMetadata getClassMetadata();
    
    AnnotationMetadata getAnnotationMetadata();
}
```

### 使用示例

```java
MetadataReaderFactory factory = new CachingMetadataReaderFactory();
MetadataReader reader = factory.getMetadataReader("com.example.MyClass");

// 获取类元数据
ClassMetadata classMetadata = reader.getClassMetadata();
String className = classMetadata.getClassName();
boolean isInterface = classMetadata.isInterface();

// 获取注解元数据
AnnotationMetadata annotationMetadata = reader.getAnnotationMetadata();
boolean hasComponent = annotationMetadata.hasAnnotation(Component.class.getName());
```

---

## 29.4 自定义扫描器

### 实现示例

```java
public class CustomScanner extends ClassPathScanningCandidateComponentProvider {
    
    public CustomScanner() {
        super(false);  // 禁用默认过滤器
        
        // 添加自定义过滤器
        addIncludeFilter(new AnnotationTypeFilter(MyCustomAnnotation.class));
        addExcludeFilter(new AssignableTypeFilter(AbstractBaseClass.class));
    }
    
    @Override
    protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
        // 自定义候选组件判断逻辑
        return beanDefinition.getMetadata().isIndependent();
    }
}
```

---

## 29.5 本章小结

**核心要点：**
1. ClassPathScanningCandidateComponentProvider 负责扫描候选组件
2. 使用 MetadataReader 读取类元数据
3. 通过过滤器筛选候选组件
4. 支持自定义扫描器

**相关章节：**
- [第 28 章：@ComponentScan 扫描机制](./content-28.md)
- [第 30 章：BeanDefinition 注册流程](./content-30.md)

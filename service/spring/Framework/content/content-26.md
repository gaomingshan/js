# 第 26 章：@ComponentScan 扫描机制

> **学习目标**：理解组件扫描的工作原理  
> **预计时长**：1.5 小时  
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

**@ComponentScan** 扫描指定包下的组件并注册为 Spring Bean。

**扫描的组件**：
- @Component
- @Service
- @Repository
- @Controller
- @Configuration

---

## 2. 扫描配置

```java
@Configuration
@ComponentScan(
    basePackages = {"com.example.service", "com.example.repository"},
    includeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = MyComponent.class),
    excludeFilters = @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*Test.*")
)
public class AppConfig {
}
```

---

## 3. 过滤器类型

```java
// 1. 注解过滤
@ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Service.class)

// 2. 类型过滤
@ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = UserService.class)

// 3. 正则表达式过滤
@ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*Service")

// 4. AspectJ 表达式过滤
@ComponentScan.Filter(type = FilterType.ASPECTJ, pattern = "com.example..*Service")

// 5. 自定义过滤器
@ComponentScan.Filter(type = FilterType.CUSTOM, classes = MyTypeFilter.class)
```

---

## 4. 自定义过滤器

```java
public class MyTypeFilter implements TypeFilter {
    
    @Override
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) {
        // 获取类元数据
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
        String className = classMetadata.getClassName();
        
        // 自定义过滤逻辑
        return className.endsWith("Service");
    }
}

@ComponentScan(includeFilters = @ComponentScan.Filter(type = FilterType.CUSTOM, classes = MyTypeFilter.class))
public class AppConfig {
}
```

---

## 5. 应用场景

### 场景 1：排除测试类

```java
@ComponentScan(
    basePackages = "com.example",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = ".*Test.*"
    )
)
public class AppConfig {
}
```

### 场景 2：只扫描特定注解

```java
@ComponentScan(
    basePackages = "com.example",
    useDefaultFilters = false,  // 关闭默认过滤器
    includeFilters = @ComponentScan.Filter(
        type = FilterType.ANNOTATION,
        classes = {Service.class, Repository.class}
    )
)
public class AppConfig {
}
```

---

**上一章** ← [第 25 章：@Configuration 配置类](./content-25.md)  
**下一章** → [第 27 章：@Conditional 条件装配](./content-27.md)  
**返回目录** → [学习大纲](../content-outline.md)

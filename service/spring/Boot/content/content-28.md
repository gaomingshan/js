# 第 28 章：@ComponentScan 扫描机制

## 本章概述

深入讲解 @ComponentScan 的工作原理，包括扫描路径解析、过滤器机制、BeanNameGenerator 和作用域解析。

**学习目标：**
- 理解组件扫描的完整流程
- 掌握扫描路径解析机制
- 学会使用过滤器
- 理解 Bean 名称生成规则

---

## 28.1 扫描流程

### 完整流程

```
1. 解析 @ComponentScan 注解
    ↓
2. 确定扫描的基础包
    ↓
3. 创建 ClassPathBeanDefinitionScanner
    ↓
4. 应用过滤器
    ↓
5. 扫描候选组件
    ↓
6. 生成 BeanDefinition
    ↓
7. 注册到容器
```

---

## 28.2 扫描路径解析

### 默认扫描规则

```java
@SpringBootApplication  // 在 com.example.demo 包
public class DemoApplication { }

// 扫描范围：com.example.demo 及其所有子包
```

### 指定扫描路径

```java
@ComponentScan(basePackages = {"com.example.service", "com.example.repository"})
public class AppConfig { }

@ComponentScan(basePackageClasses = {ServiceMarker.class, RepositoryMarker.class})
public class AppConfig { }
```

---

## 28.3 过滤器机制

### 包含过滤器

```java
@ComponentScan(
    useDefaultFilters = false,
    includeFilters = @Filter(
        type = FilterType.ANNOTATION,
        classes = MyCustomAnnotation.class
    )
)
public class AppConfig { }
```

### 排除过滤器

```java
@ComponentScan(
    excludeFilters = @Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = OldService.class
    )
)
public class AppConfig { }
```

### 过滤器类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `ANNOTATION` | 按注解 | `@Service.class` |
| `ASSIGNABLE_TYPE` | 按类型 | `UserService.class` |
| `ASPECTJ` | AspectJ 表达式 | `"com.example..*Service"` |
| `REGEX` | 正则表达式 | `".*Service"` |
| `CUSTOM` | 自定义 | `MyTypeFilter.class` |

---

## 28.4 BeanNameGenerator

### 默认命名规则

```java
@Service
public class UserService { }
// Bean 名称: userService

@Component("myService")
public class CustomService { }
// Bean 名称: myService
```

### 自定义命名

```java
public class MyBeanNameGenerator extends AnnotationBeanNameGenerator {
    
    @Override
    protected String buildDefaultBeanName(BeanDefinition definition) {
        String beanClassName = definition.getBeanClassName();
        return beanClassName.substring(beanClassName.lastIndexOf('.') + 1);
    }
}

@ComponentScan(nameGenerator = MyBeanNameGenerator.class)
public class AppConfig { }
```

---

## 28.5 本章小结

**核心要点：**
1. @ComponentScan 默认扫描当前包及子包
2. 支持多种过滤器类型
3. BeanNameGenerator 负责生成 Bean 名称
4. 可以自定义扫描和命名规则

**相关章节：**
- [第 4 章：@SpringBootApplication 注解剖析](./content-4.md)
- [第 29 章：ClassPathScanningCandidateComponentProvider](./content-29.md)
- [第 30 章：BeanDefinition 注册流程](./content-30.md)

# 第 7 章：AutoConfigurationImportSelector 源码

## 本章概述

深入剖析 `AutoConfigurationImportSelector` 的源码实现，理解其如何选择、过滤、排序自动配置类，以及去重机制的实现。

**学习目标：**
- 掌握 selectImports() 方法执行流程
- 理解自动配置类过滤机制
- 掌握配置类排序算法
- 理解去重机制实现

---

## 7.1 核心方法 selectImports()

### 源码分析

```java
@Override
public String[] selectImports(AnnotationMetadata annotationMetadata) {
    // 1. 检查是否启用自动配置
    if (!isEnabled(annotationMetadata)) {
        return NO_IMPORTS;
    }
    
    // 2. 获取自动配置条目
    AutoConfigurationEntry autoConfigurationEntry = getAutoConfigurationEntry(annotationMetadata);
    
    // 3. 返回配置类名数组
    return StringUtils.toStringArray(autoConfigurationEntry.getConfigurations());
}

protected boolean isEnabled(AnnotationMetadata metadata) {
    if (getClass() == AutoConfigurationImportSelector.class) {
        return getEnvironment().getProperty(
            EnableAutoConfiguration.ENABLED_OVERRIDE_PROPERTY, 
            Boolean.class, true);
    }
    return true;
}
```

---

## 7.2 getAutoConfigurationEntry() 详解

### 完整流程

```java
protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {
    if (!isEnabled(annotationMetadata)) {
        return EMPTY_ENTRY;
    }
    
    // 1. 获取注解属性
    AnnotationAttributes attributes = getAttributes(annotationMetadata);
    
    // 2. 获取候选配置类
    List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);
    
    // 3. 去重
    configurations = removeDuplicates(configurations);
    
    // 4. 获取排除的配置类
    Set<String> exclusions = getExclusions(annotationMetadata, attributes);
    
    // 5. 检查排除类
    checkExcludedClasses(configurations, exclusions);
    
    // 6. 移除排除的配置类
    configurations.removeAll(exclusions);
    
    // 7. 过滤
    configurations = getConfigurationClassFilter().filter(configurations);
    
    // 8. 触发事件
    fireAutoConfigurationImportEvents(configurations, exclusions);
    
    // 9. 返回
    return new AutoConfigurationEntry(configurations, exclusions);
}
```

### 过滤机制

条件注解过滤通过 `AutoConfigurationImportFilter` 实现：

```java
List<String> filter(List<String> configurations) {
    String[] candidates = StringUtils.toStringArray(configurations);
    boolean[] match = new boolean[candidates.length];
    
    // 应用所有过滤器
    for (AutoConfigurationImportFilter filter : this.filters) {
        boolean[] currentMatch = filter.match(candidates, this.autoConfigurationMetadata);
        
        for (int i = 0; i < currentMatch.length; i++) {
            if (!currentMatch[i]) {
                match[i] = false;
            }
        }
    }
    
    // 返回匹配的
    List<String> result = new ArrayList<>();
    for (int i = 0; i < candidates.length; i++) {
        if (match[i]) {
            result.add(candidates[i]);
        }
    }
    return result;
}
```

---

## 7.3 配置类排序

### AutoConfigurationSorter

```java
List<String> sortAutoConfigurations(Set<String> configurations,
                                    AutoConfigurationMetadata metadata) {
    return new AutoConfigurationSorter(getMetadataReaderFactory(), metadata)
            .getInPriorityOrder(configurations);
}
```

**排序依据：**
1. `@AutoConfigureOrder`
2. `@AutoConfigureBefore`
3. `@AutoConfigureAfter`

### 示例

```java
@AutoConfigureOrder(100)
@AutoConfiguration
public class Config1 {}

@AutoConfigureAfter(Config1.class)
@AutoConfiguration
public class Config2 {}

@AutoConfigureBefore(Config2.class)
@AutoConfiguration
public class Config3 {}

// 最终顺序：Config1 → Config3 → Config2
```

---

## 7.4 去重机制

```java
protected final <T> List<T> removeDuplicates(List<T> list) {
    return new ArrayList<>(new LinkedHashSet<>(list));
}
```

使用 `LinkedHashSet` 保证顺序的同时去重。

---

## 7.5 本章小结

**核心流程：**
```
selectImports()
→ getAutoConfigurationEntry()
→ 加载候选配置
→ 去重
→ 排除
→ 过滤
→ 排序
→ 返回
```

**相关章节：**
- [第 6 章：spring.factories 与 SPI 机制](./content-6.md)
- [第 8 章：自动配置类编写规范](./content-8.md)

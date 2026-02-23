# 第 31 章：@Import 与 ImportSelector 深入

本章深入讲解 @Import 导入机制和 ImportSelector 接口的高级用法，为自定义扫描注解打下基础。

**学习目标：**
- 掌握 @Import 的三种导入方式
- 理解 ImportSelector 工作原理
- 学会实现自定义 ImportSelector
- 理解 DeferredImportSelector 延迟导入

---

## 31.1 @Import 三种导入方式回顾

### 1. 导入配置类
```java
@Configuration
@Import(DataSourceConfig.class)
public class AppConfig { }
```

### 2. 导入 ImportSelector
```java
@Configuration
@Import(MyImportSelector.class)
public class AppConfig { }
```

### 3. 导入 ImportBeanDefinitionRegistrar
```java
@Configuration
@Import(MyImportBeanDefinitionRegistrar.class)
public class AppConfig { }
```

---

## 31.2 ImportSelector 高级应用

### 动态选择配置类
```java
public class DatabaseImportSelector implements ImportSelector {
    
    @Override
    public String[] selectImports(AnnotationMetadata metadata) {
        Map<String, Object> attributes = metadata.getAnnotationAttributes(
            EnableDatabase.class.getName()
        );
        
        String type = (String) attributes.get("type");
        
        switch (type) {
            case "mysql":
                return new String[] { "com.example.config.MySQLConfig" };
            case "postgresql":
                return new String[] { "com.example.config.PostgreSQLConfig" };
            default:
                return new String[] { "com.example.config.H2Config" };
        }
    }
}

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(DatabaseImportSelector.class)
public @interface EnableDatabase {
    String type() default "h2";
}
```

---

## 31.3 条件导入

### 根据环境动态导入
```java
public class EnvironmentImportSelector implements ImportSelector {
    
    @Override
    public String[] selectImports(AnnotationMetadata metadata) {
        String[] profiles = getEnvironmentProfiles();
        
        if (Arrays.asList(profiles).contains("prod")) {
            return new String[] {
                "com.example.config.ProductionConfig",
                "com.example.config.SecurityConfig"
            };
        } else {
            return new String[] {
                "com.example.config.DevelopmentConfig",
                "com.example.config.MockConfig"
            };
        }
    }
    
    private String[] getEnvironmentProfiles() {
        // 获取激活的 Profile
        return new String[] {"dev"};
    }
}
```

---

## 31.4 本章小结

**核心要点：**
1. @Import 支持三种导入方式
2. ImportSelector 实现动态选择配置
3. DeferredImportSelector 支持延迟导入
4. 为自定义扫描注解提供基础

**相关章节：**
- [第 5 章：@EnableAutoConfiguration 原理](./content-5.md)
- [第 30 章：BeanDefinition 注册流程](./content-30.md)
- [第 32 章：FactoryBean 原理与应用](./content-32.md)

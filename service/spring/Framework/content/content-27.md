# 第 27 章：@Conditional 条件装配

> **学习目标**：掌握 Spring 条件装配机制  
> **预计时长**：1.5 小时  
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

**@Conditional** 根据条件决定是否创建 Bean。

---

## 2. Condition 接口

```java
@FunctionalInterface
public interface Condition {
    boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata);
}
```

---

## 3. 自定义条件

```java
// 1. 定义条件
public class WindowsCondition implements Condition {
    
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment environment = context.getEnvironment();
        String os = environment.getProperty("os.name");
        return os != null && os.contains("Windows");
    }
}

// 2. 使用条件
@Configuration
public class AppConfig {
    
    @Bean
    @Conditional(WindowsCondition.class)
    public FileService windowsFileService() {
        return new WindowsFileServiceImpl();
    }
    
    @Bean
    @Conditional(LinuxCondition.class)
    public FileService linuxFileService() {
        return new LinuxFileServiceImpl();
    }
}
```

---

## 4. Spring Boot 条件注解

```java
@Configuration
public class AutoConfig {
    
    // Bean 存在时
    @Bean
    @ConditionalOnBean(DataSource.class)
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
    
    // Bean 不存在时
    @Bean
    @ConditionalOnMissingBean
    public DataSource defaultDataSource() {
        return new HikariDataSource();
    }
    
    // 类存在时
    @Bean
    @ConditionalOnClass(name = "com.mysql.cj.jdbc.Driver")
    public DataSource mysqlDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    // 属性匹配时
    @Bean
    @ConditionalOnProperty(name = "cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
}
```

---

## 5. 应用场景

### 场景 1：环境特定配置

```java
public class DevCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String[] profiles = context.getEnvironment().getActiveProfiles();
        return Arrays.asList(profiles).contains("dev");
    }
}

@Configuration
public class AppConfig {
    
    @Bean
    @Conditional(DevCondition.class)
    public DataSource devDataSource() {
        return new H2DataSource();  // 开发环境使用 H2
    }
}
```

### 场景 2：功能开关

```java
@Configuration
public class FeatureConfig {
    
    @Bean
    @ConditionalOnProperty(name = "feature.new-ui.enabled", havingValue = "true", matchIfMissing = false)
    public UIService newUIService() {
        return new NewUIServiceImpl();
    }
    
    @Bean
    @ConditionalOnProperty(name = "feature.new-ui.enabled", havingValue = "false", matchIfMissing = true)
    public UIService oldUIService() {
        return new OldUIServiceImpl();
    }
}
```

---

**上一章** ← [第 26 章：@ComponentScan 扫描机制](./content-26.md)  
**下一章** → [第 28 章：FactoryBean 工厂Bean](./content-28.md)  
**返回目录** → [学习大纲](../content-outline.md)

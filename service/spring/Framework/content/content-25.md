# 第 25 章：@Configuration 配置类

> **学习目标**：掌握 Spring 注解驱动配置的核心机制  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

**@Configuration** 标注的类是配置类，用于定义 Bean。

```java
@Configuration
public class AppConfig {
    
    @Bean
    public UserService userService() {
        return new UserServiceImpl();
    }
    
    @Bean
    public UserDao userDao() {
        return new UserDaoImpl();
    }
}
```

---

## 2. Full 模式 vs Lite 模式

### 2.1 Full 模式

```java
@Configuration  // Full 模式
public class FullConfig {
    
    @Bean
    public UserService userService() {
        return new UserServiceImpl(userDao());  // 调用 userDao()
    }
    
    @Bean
    public UserDao userDao() {
        return new UserDaoImpl();
    }
}

// Spring 会创建 CGLIB 代理
// userService() 中调用 userDao() 会返回容器中的单例 Bean
```

### 2.2 Lite 模式

```java
@Component  // Lite 模式（没有 @Configuration）
public class LiteConfig {
    
    @Bean
    public UserService userService() {
        return new UserServiceImpl(userDao());  // 调用 userDao()
    }
    
    @Bean
    public UserDao userDao() {
        return new UserDaoImpl();
    }
}

// 不会创建代理
// userService() 中调用 userDao() 会创建新实例
```

---

## 3. @Import 导入配置

```java
@Configuration
@Import({DatabaseConfig.class, CacheConfig.class})
public class AppConfig {
}

@Configuration
public class DatabaseConfig {
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}

@Configuration
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
}
```

---

## 4. @ComponentScan 组件扫描

```java
@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {
}

// 或指定基类
@ComponentScan(basePackageClasses = Application.class)
public class AppConfig {
}

// 排除过滤器
@ComponentScan(
    basePackages = "com.example",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = ExcludedConfig.class
    )
)
public class AppConfig {
}
```

---

## 5. @Conditional 条件装配

```java
@Configuration
public class ConditionalConfig {
    
    @Bean
    @ConditionalOnProperty(name = "feature.enabled", havingValue = "true")
    public FeatureService featureService() {
        return new FeatureServiceImpl();
    }
    
    @Bean
    @ConditionalOnMissingBean(DataSource.class)
    public DataSource defaultDataSource() {
        return new HikariDataSource();
    }
    
    @Bean
    @ConditionalOnClass(name = "com.example.SomeClass")
    public SomeService someService() {
        return new SomeServiceImpl();
    }
}
```

---

## 6. 应用场景

### 场景 1：多数据源配置

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.secondary")
    public DataSource secondaryDataSource() {
        return DataSourceBuilder.create().build();
    }
}
```

### 场景 2：环境特定配置

```java
@Configuration
@Profile("dev")
public class DevConfig {
    @Bean
    public MailService mailService() {
        return new MockMailService();  // 开发环境使用 Mock
    }
}

@Configuration
@Profile("prod")
public class ProdConfig {
    @Bean
    public MailService mailService() {
        return new SmtpMailService();  // 生产环境使用真实服务
    }
}
```

---

**上一章** ← [第 24 章：事件发布机制源码分析](./content-24.md)  
**下一章** → [第 26 章：@ComponentScan 扫描机制](./content-26.md)  
**返回目录** → [学习大纲](../content-outline.md)

# 第 16 章：Environment 抽象与扩展

## 本章概述

深入讲解 Spring 的 Environment 抽象，包括 PropertySource、PropertyResolver 接口，以及如何自定义配置源。

**学习目标：**
- 理解 Environment 接口体系
- 掌握 PropertySource 的使用
- 学会自定义配置源
- 掌握 Environment 扩展机制

---

## 16.1 Environment 接口

### 核心接口

```java
public interface Environment extends PropertyResolver {
    
    String[] getActiveProfiles();
    
    String[] getDefaultProfiles();
    
    boolean acceptsProfiles(String... profiles);
    
    boolean acceptsProfiles(Profiles profiles);
}
```

### ConfigurableEnvironment

```java
public interface ConfigurableEnvironment extends Environment, ConfigurablePropertyResolver {
    
    void setActiveProfiles(String... profiles);
    
    void addActiveProfile(String profile);
    
    void setDefaultProfiles(String... profiles);
    
    MutablePropertySources getPropertySources();
    
    Map<String, Object> getSystemProperties();
    
    Map<String, Object> getSystemEnvironment();
}
```

---

## 16.2 PropertySource

### 内置 PropertySource

```
StandardEnvironment
├── systemProperties (MapPropertySource)
├── systemEnvironment (SystemEnvironmentPropertySource)
└── ...

ServletEnvironment
├── servletConfigInitParams (StubPropertySource)
├── servletContextInitParams (StubPropertySource)
├── jndiProperties (JndiPropertySource)
├── systemProperties (MapPropertySource)
└── systemEnvironment (SystemEnvironmentPropertySource)
```

### 自定义 PropertySource

```java
public class CustomPropertySource extends PropertySource<Map<String, Object>> {
    
    public CustomPropertySource(String name, Map<String, Object> source) {
        super(name, source);
    }
    
    @Override
    public Object getProperty(String name) {
        return this.source.get(name);
    }
}
```

### 添加 PropertySource

```java
@Configuration
public class CustomPropertySourceConfig {
    
    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer(
            ConfigurableEnvironment environment) {
        
        Map<String, Object> props = new HashMap<>();
        props.put("custom.property", "custom-value");
        props.put("custom.number", 42);
        
        PropertySource<?> customPropertySource = 
            new MapPropertySource("customPropertySource", props);
        
        environment.getPropertySources().addFirst(customPropertySource);
        
        return new PropertySourcesPlaceholderConfigurer();
    }
}
```

---

## 16.3 @PropertySource 注解

### 基本用法

```java
@Configuration
@PropertySource("classpath:custom.properties")
public class AppConfig {
}
```

### 多个配置文件

```java
@Configuration
@PropertySource({
    "classpath:app.properties",
    "classpath:database.properties"
})
public class AppConfig {
}
```

### 使用占位符

```java
@Configuration
@PropertySource("classpath:${env}.properties")
public class AppConfig {
}
```

### ignoreResourceNotFound

```java
@Configuration
@PropertySource(value = "classpath:optional.properties", ignoreResourceNotFound = true)
public class AppConfig {
}
```

---

## 16.4 PropertyResolver

### 接口定义

```java
public interface PropertyResolver {
    
    boolean containsProperty(String key);
    
    String getProperty(String key);
    
    String getProperty(String key, String defaultValue);
    
    <T> T getProperty(String key, Class<T> targetType);
    
    <T> T getProperty(String key, Class<T> targetType, T defaultValue);
    
    String getRequiredProperty(String key) throws IllegalStateException;
    
    <T> T getRequiredProperty(String key, Class<T> targetType) throws IllegalStateException;
    
    String resolvePlaceholders(String text);
    
    String resolveRequiredPlaceholders(String text) throws IllegalArgumentException;
}
```

### 使用示例

```java
@Component
public class ConfigService {
    
    @Autowired
    private Environment env;
    
    public void printConfig() {
        // 获取属性
        String port = env.getProperty("server.port");
        
        // 获取带默认值的属性
        String timeout = env.getProperty("app.timeout", "3000");
        
        // 获取指定类型
        Integer maxConnections = env.getProperty("app.max-connections", Integer.class);
        
        // 必须存在的属性
        String requiredProp = env.getRequiredProperty("app.required.property");
        
        // 解析占位符
        String resolved = env.resolvePlaceholders("Server running on port ${server.port}");
    }
}
```

---

## 16.5 自定义配置源

### 从数据库加载配置

```java
public class DatabasePropertySource extends PropertySource<DataSource> {
    
    private final Map<String, String> properties = new ConcurrentHashMap<>();
    
    public DatabasePropertySource(String name, DataSource dataSource) {
        super(name, dataSource);
        loadProperties();
    }
    
    private void loadProperties() {
        try (Connection conn = this.source.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT key, value FROM config")) {
            
            while (rs.next()) {
                properties.put(rs.getString("key"), rs.getString("value"));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to load properties from database", e);
        }
    }
    
    @Override
    public Object getProperty(String name) {
        return properties.get(name);
    }
}
```

### 注册到 Environment

```java
@Component
public class DatabasePropertySourceInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    
    @Override
    public void initialize(ConfigurableApplicationContext context) {
        ConfigurableEnvironment environment = context.getEnvironment();
        
        // 创建数据源
        DataSource dataSource = createDataSource();
        
        // 创建并添加 PropertySource
        PropertySource<?> databasePropertySource = 
            new DatabasePropertySource("databaseConfig", dataSource);
        
        environment.getPropertySources().addFirst(databasePropertySource);
    }
    
    private DataSource createDataSource() {
        // 创建数据源逻辑
        return new HikariDataSource();
    }
}
```

### 从远程配置中心加载

```java
public class RemotePropertySource extends PropertySource<Map<String, Object>> {
    
    public RemotePropertySource(String name, String configServerUrl) {
        super(name, loadFromRemote(configServerUrl));
    }
    
    private static Map<String, Object> loadFromRemote(String url) {
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, Map.class);
    }
    
    @Override
    public Object getProperty(String name) {
        return this.source.get(name);
    }
}
```

---

## 16.6 EnvironmentPostProcessor

### 实现接口

```java
public class MyEnvironmentPostProcessor implements EnvironmentPostProcessor {
    
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, 
                                       SpringApplication application) {
        // 添加自定义配置
        Map<String, Object> props = new HashMap<>();
        props.put("custom.env.property", "value");
        props.put("app.initialized.at", System.currentTimeMillis());
        
        PropertySource<?> propertySource = new MapPropertySource("customEnv", props);
        environment.getPropertySources().addLast(propertySource);
    }
}
```

### 注册

```properties
# META-INF/spring.factories
org.springframework.boot.env.EnvironmentPostProcessor=\
com.example.MyEnvironmentPostProcessor
```

---

## 16.7 Profile 表达式

### 使用表达式

```java
@Configuration
@Profile("prod & !debug")
public class ProductionConfiguration {
    // 生产环境且非调试模式
}

@Configuration
@Profile("dev | test")
public class DevelopmentConfiguration {
    // 开发或测试环境
}

@Configuration
@Profile("!(prod | staging)")
public class LocalConfiguration {
    // 非生产和预发布环境
}
```

### Profiles 接口

```java
public interface Profiles {
    boolean matches(Predicate<String> activeProfiles);
}

// 使用
boolean matches = environment.acceptsProfiles(
    Profiles.of("prod", "!debug")
);
```

---

## 16.8 本章小结

**核心要点：**
1. Environment 是配置的统一抽象
2. PropertySource 表示一个配置源
3. 可以自定义配置源从任意位置加载配置
4. EnvironmentPostProcessor 用于环境后处理
5. 支持 Profile 表达式

**相关章节：**
- [第 15 章：@ConfigurationProperties 绑定原理](./content-15.md)
- [第 17 章：嵌入式容器架构设计](./content-17.md)

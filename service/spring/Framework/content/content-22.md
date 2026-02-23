# 第 22 章：Environment 环境抽象

> **学习目标**：理解 Spring Environment 抽象和属性配置管理  
> **预计时长**：1.5 小时  
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

**Environment** 抽象了应用的运行环境，包括配置属性和激活的 Profile。

---

## 2. Environment 接口

```java
public interface Environment extends PropertyResolver {
    String[] getActiveProfiles();
    String[] getDefaultProfiles();
    boolean acceptsProfiles(String... profiles);
}
```

---

## 3. 属性访问

```java
@Autowired
private Environment environment;

public void readProperties() {
    // 读取属性
    String dbUrl = environment.getProperty("spring.datasource.url");
    Integer port = environment.getProperty("server.port", Integer.class);
    String defaultValue = environment.getProperty("custom.key", "default");
    
    // 必需属性
    String required = environment.getRequiredProperty("required.key");
}
```

---

## 4. Profile 机制

### 4.1 定义 Profile

```java
@Configuration
@Profile("dev")
public class DevConfig {
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource(); // 开发环境数据源
    }
}

@Configuration
@Profile("prod")
public class ProdConfig {
    @Bean
    public DataSource dataSource() {
        return new DruidDataSource(); // 生产环境数据源
    }
}
```

### 4.2 激活 Profile

```properties
# application.properties
spring.profiles.active=dev

# 或命令行
java -jar app.jar --spring.profiles.active=prod

# 或环境变量
export SPRING_PROFILES_ACTIVE=prod
```

### 4.3 编程式激活

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setAdditionalProfiles("dev");
        app.run(args);
    }
}
```

---

## 5. 应用场景

### 场景 1：多环境配置

```java
@Configuration
public class DataSourceConfig {
    @Autowired
    private Environment environment;
    
    @Bean
    public DataSource dataSource() {
        if (environment.acceptsProfiles(Profiles.of("prod"))) {
            return createProdDataSource();
        } else {
            return createDevDataSource();
        }
    }
}
```

### 场景 2：配置属性绑定

```java
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name;
    private String version;
    private Database database = new Database();
    
    public static class Database {
        private String url;
        private String username;
        // getters and setters
    }
}

// application.properties
app.name=MyApp
app.version=1.0.0
app.database.url=jdbc:mysql://localhost:3306/db
app.database.username=root
```

---

**上一章** ← [第 21 章：Resource 资源抽象](./content-21.md)  
**下一章** → [第 23 章：ApplicationEvent 事件机制](./content-23.md)  
**返回目录** → [学习大纲](../content-outline.md)

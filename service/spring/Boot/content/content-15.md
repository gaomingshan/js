# 第 15 章：@ConfigurationProperties 绑定原理

## 本章概述

深入讲解 @ConfigurationProperties 的属性绑定机制，包括类型转换、嵌套绑定、Relaxed Binding 和校验支持。

**学习目标：**
- 掌握 @ConfigurationProperties 使用方法
- 理解属性绑定的底层原理
- 学会使用 Relaxed Binding
- 掌握配置校验

---

## 15.1 基本使用

### 创建 Properties 类

```java
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    
    private String name;
    private String version;
    private int maxConnections;
    
    // Getters and Setters
}
```

### 启用配置绑定

```java
@Configuration
@EnableConfigurationProperties(AppProperties.class)
public class AppConfig {
}
```

### 配置文件

```yaml
app:
  name: MyApplication
  version: 1.0.0
  max-connections: 100
```

### 使用

```java
@Service
public class MyService {
    
    private final AppProperties properties;
    
    public MyService(AppProperties properties) {
        this.properties = properties;
    }
    
    public void printConfig() {
        System.out.println("App: " + properties.getName());
        System.out.println("Version: " + properties.getVersion());
        System.out.println("Max Connections: " + properties.getMaxConnections());
    }
}
```

---

## 15.2 Relaxed Binding（宽松绑定）

### 命名格式

以下格式都可以绑定到 `maxConnections` 字段：

```properties
app.maxConnections=100
app.max-connections=100
app.max_connections=100
app.MAX_CONNECTIONS=100
```

### 支持的格式

| Java 字段 | 支持的配置格式 |
|-----------|--------------|
| `maxConnections` | `max-connections`, `max_connections`, `maxConnections`, `MAXCONNECTIONS` |
| `serverURL` | `server-url`, `server_url`, `serverUrl`, `SERVERURL` |

---

## 15.3 类型转换

### 基本类型

```java
@ConfigurationProperties(prefix = "app")
public class TypeProperties {
    
    private int port;              // int
    private long timeout;          // long
    private boolean enabled;       // boolean
    private double ratio;          // double
    
    // Getters and Setters
}
```

```yaml
app:
  port: 8080
  timeout: 3000
  enabled: true
  ratio: 0.85
```

### 枚举类型

```java
public enum LogLevel {
    DEBUG, INFO, WARN, ERROR
}

@ConfigurationProperties(prefix = "logging")
public class LogProperties {
    
    private LogLevel level;
    
    // Getters and Setters
}
```

```yaml
logging:
  level: INFO
```

### Duration

```java
@ConfigurationProperties(prefix = "app")
public class DurationProperties {
    
    private Duration sessionTimeout;
    private Duration readTimeout;
    
    // Getters and Setters
}
```

```yaml
app:
  session-timeout: 30m      # 30分钟
  read-timeout: 10s         # 10秒
```

**支持的单位：**
- `ns`: 纳秒
- `us`: 微秒
- `ms`: 毫秒
- `s`: 秒
- `m`: 分钟
- `h`: 小时
- `d`: 天

### DataSize

```java
@ConfigurationProperties(prefix = "app")
public class DataSizeProperties {
    
    private DataSize maxFileSize;
    private DataSize bufferSize;
    
    // Getters and Setters
}
```

```yaml
app:
  max-file-size: 10MB
  buffer-size: 512KB
```

**支持的单位：**
- `B`: 字节
- `KB`: 千字节
- `MB`: 兆字节
- `GB`: 吉字节
- `TB`: 太字节

### 集合类型

```java
@ConfigurationProperties(prefix = "app")
public class CollectionProperties {
    
    private List<String> servers;
    private Set<Integer> ports;
    private Map<String, String> settings;
    
    // Getters and Setters
}
```

```yaml
app:
  servers:
    - server1.example.com
    - server2.example.com
  ports:
    - 8080
    - 8081
  settings:
    key1: value1
    key2: value2
```

---

## 15.4 嵌套绑定

### 嵌套对象

```java
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    
    private Database database;
    private Cache cache;
    
    public static class Database {
        private String host;
        private int port;
        private Credentials credentials;
        
        public static class Credentials {
            private String username;
            private String password;
            // Getters and Setters
        }
        // Getters and Setters
    }
    
    public static class Cache {
        private String type;
        private int ttl;
        // Getters and Setters
    }
    
    // Getters and Setters
}
```

```yaml
app:
  database:
    host: localhost
    port: 3306
    credentials:
      username: root
      password: secret
  cache:
    type: redis
    ttl: 3600
```

### 集合嵌套

```java
@ConfigurationProperties(prefix = "app")
public class ServerProperties {
    
    private List<Server> servers;
    
    public static class Server {
        private String name;
        private String host;
        private int port;
        // Getters and Setters
    }
    
    // Getters and Setters
}
```

```yaml
app:
  servers:
    - name: server1
      host: 192.168.1.10
      port: 8080
    - name: server2
      host: 192.168.1.11
      port: 8081
```

---

## 15.5 配置校验

### 启用校验

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 使用 JSR-303 注解

```java
@ConfigurationProperties(prefix = "app")
@Validated
public class ValidatedProperties {
    
    @NotNull
    @Size(min = 2, max = 50)
    private String name;
    
    @Min(1024)
    @Max(65535)
    private int port;
    
    @Email
    private String adminEmail;
    
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}")
    private String releaseDate;
    
    @Valid
    private Database database;
    
    public static class Database {
        @NotBlank
        private String host;
        
        @Positive
        private int port;
        
        // Getters and Setters
    }
    
    // Getters and Setters
}
```

### 自定义校验器

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UrlValidator.class)
public @interface ValidUrl {
    String message() default "Invalid URL";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class UrlValidator implements ConstraintValidator<ValidUrl, String> {
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        try {
            new URL(value);
            return true;
        } catch (MalformedURLException e) {
            return false;
        }
    }
}

@ConfigurationProperties(prefix = "app")
@Validated
public class AppProperties {
    
    @ValidUrl
    private String websiteUrl;
    
    // Getters and Setters
}
```

---

## 15.6 配置元数据

### spring-configuration-metadata.json

```json
{
  "groups": [
    {
      "name": "app",
      "type": "com.example.AppProperties",
      "sourceType": "com.example.AppProperties"
    }
  ],
  "properties": [
    {
      "name": "app.name",
      "type": "java.lang.String",
      "description": "Application name",
      "sourceType": "com.example.AppProperties"
    },
    {
      "name": "app.port",
      "type": "java.lang.Integer",
      "description": "Application port",
      "defaultValue": 8080,
      "sourceType": "com.example.AppProperties"
    }
  ]
}
```

### 自动生成元数据

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

---

## 15.7 绑定原理

### ConfigurationPropertiesBinder

```java
@Override
public Object bind(String name, Bindable<?> target) {
    ConfigurationPropertyName propertyName = ConfigurationPropertyName.of(name);
    
    // 1. 获取配置源
    Iterable<ConfigurationPropertySource> sources = getSources();
    
    // 2. 创建 Binder
    Binder binder = new Binder(sources);
    
    // 3. 执行绑定
    return binder.bind(propertyName, target).orElse(null);
}
```

### 绑定流程

```
1. 解析 @ConfigurationProperties 注解
    ↓
2. 创建 Bindable 对象
    ↓
3. 从配置源读取属性值
    ↓
4. 类型转换
    ↓
5. 设置到目标对象
    ↓
6. 执行校验
```

---

## 15.8 本章小结

**核心要点：**
1. @ConfigurationProperties 提供类型安全的配置绑定
2. 支持 Relaxed Binding（宽松绑定）
3. 自动进行类型转换
4. 支持嵌套对象和集合
5. 集成 JSR-303 校验
6. 自动生成配置元数据

**相关章节：**
- [第 14 章：配置优先级与覆盖机制](./content-14.md)
- [第 16 章：Environment 抽象与扩展](./content-16.md)

# 第 25 章：基础 Starter 开发实战

## 本章概述

通过实战开发一个完整的基础 Starter，掌握 Starter 项目结构、pom.xml 配置、自动配置类编写和配置属性绑定。

**学习目标：**
- 掌握 Starter 项目结构
- 学会编写自动配置类
- 掌握配置属性绑定
- 完整开发一个 Starter

---

## 25.1 项目结构

### 标准结构

```
myapp-spring-boot-starter/
├── pom.xml
└── src/main/
    ├── java/
    │   └── com/example/myapp/
    │       ├── autoconfigure/
    │       │   └── MyAppAutoConfiguration.java
    │       ├── properties/
    │       │   └── MyAppProperties.java
    │       └── service/
    │           └── MyAppService.java
    └── resources/
        └── META-INF/
            ├── spring.factories
            └── spring-configuration-metadata.json
```

---

## 25.2 pom.xml 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>myapp-spring-boot-starter</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>MyApp Spring Boot Starter</name>
    <description>Spring Boot Starter for MyApp</description>

    <properties>
        <java.version>17</java.version>
        <spring-boot.version>3.2.0</spring-boot.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starter -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>

        <!-- Configuration Processor -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <version>${spring-boot.version}</version>
            <optional>true</optional>
        </dependency>

        <!-- Lombok (可选) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.30</version>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
```

---

## 25.3 自动配置类

```java
package com.example.myapp.autoconfigure;

import com.example.myapp.properties.MyAppProperties;
import com.example.myapp.service.MyAppService;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@ConditionalOnClass(MyAppService.class)
@ConditionalOnProperty(prefix = "myapp", name = "enabled", havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(MyAppProperties.class)
public class MyAppAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public MyAppService myAppService(MyAppProperties properties) {
        MyAppService service = new MyAppService();
        service.setTimeout(properties.getTimeout());
        service.setMaxRetries(properties.getMaxRetries());
        return service;
    }
}
```

---

## 25.4 配置属性类

```java
package com.example.myapp.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;

@ConfigurationProperties(prefix = "myapp")
public class MyAppProperties {

    /**
     * Whether to enable MyApp
     */
    private boolean enabled = true;

    /**
     * Timeout duration
     */
    private Duration timeout = Duration.ofSeconds(30);

    /**
     * Maximum retry attempts
     */
    private int maxRetries = 3;

    /**
     * Server URL
     */
    private String serverUrl = "http://localhost:8080";

    // Getters and Setters

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Duration getTimeout() {
        return timeout;
    }

    public void setTimeout(Duration timeout) {
        this.timeout = timeout;
    }

    public int getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(int maxRetries) {
        this.maxRetries = maxRetries;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }
}
```

---

## 25.5 核心服务类

```java
package com.example.myapp.service;

import java.time.Duration;

public class MyAppService {

    private Duration timeout;
    private int maxRetries;

    public void execute() {
        System.out.println("Executing with timeout: " + timeout);
        System.out.println("Max retries: " + maxRetries);
    }

    public void setTimeout(Duration timeout) {
        this.timeout = timeout;
    }

    public void setMaxRetries(int maxRetries) {
        this.maxRetries = maxRetries;
    }
}
```

---

## 25.6 spring.factories

```properties
# META-INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.myapp.autoconfigure.MyAppAutoConfiguration
```

---

## 25.7 配置元数据

```json
{
  "groups": [
    {
      "name": "myapp",
      "type": "com.example.myapp.properties.MyAppProperties",
      "sourceType": "com.example.myapp.properties.MyAppProperties"
    }
  ],
  "properties": [
    {
      "name": "myapp.enabled",
      "type": "java.lang.Boolean",
      "description": "Whether to enable MyApp.",
      "defaultValue": true
    },
    {
      "name": "myapp.timeout",
      "type": "java.time.Duration",
      "description": "Timeout duration for operations.",
      "defaultValue": "30s"
    },
    {
      "name": "myapp.max-retries",
      "type": "java.lang.Integer",
      "description": "Maximum number of retry attempts.",
      "defaultValue": 3
    },
    {
      "name": "myapp.server-url",
      "type": "java.lang.String",
      "description": "Server URL to connect to.",
      "defaultValue": "http://localhost:8080"
    }
  ]
}
```

---

## 25.8 使用 Starter

### 引入依赖

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>myapp-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 配置

```yaml
myapp:
  enabled: true
  timeout: 60s
  max-retries: 5
  server-url: https://api.example.com
```

### 使用

```java
@RestController
public class TestController {

    @Autowired
    private MyAppService myAppService;

    @GetMapping("/test")
    public String test() {
        myAppService.execute();
        return "Success";
    }
}
```

---

## 25.9 本章小结

**核心要点：**
1. Starter 项目结构清晰，职责明确
2. pom.xml 只引入必需的依赖
3. 自动配置类使用条件注解
4. 配置属性提供默认值
5. spring.factories 注册自动配置
6. 提供配置元数据支持 IDE 提示

**相关章节：**
- [第 24 章：Starter 设计原则与规范](./content-24.md)
- [第 26 章：Starter 依赖管理与 BOM](./content-26.md)
- [第 27 章：配置提示与文档](./content-27.md)

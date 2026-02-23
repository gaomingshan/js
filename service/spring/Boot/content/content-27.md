# 第 27 章：配置提示与文档

## 本章概述

深入讲解如何为 Starter 提供 IDE 配置提示、生成配置元数据和编写完善的文档。

**学习目标：**
- 掌握配置元数据的生成
- 理解 IDE 配置提示原理
- 学会编写 Starter 文档

---

## 27.1 配置元数据

### spring-configuration-metadata.json

```json
{
  "groups": [
    {
      "name": "myapp",
      "type": "com.example.MyAppProperties",
      "sourceType": "com.example.MyAppProperties",
      "description": "Configuration properties for MyApp."
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
      "description": "Connection timeout.",
      "defaultValue": "30s"
    }
  ],
  "hints": [
    {
      "name": "myapp.log-level",
      "values": [
        {
          "value": "DEBUG",
          "description": "Debug level logging."
        },
        {
          "value": "INFO",
          "description": "Info level logging."
        }
      ]
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

## 27.2 IDE 配置提示

### IDEA 配置提示

当安装了 configuration-processor 后，IDEA 会自动识别配置元数据，提供：
- 属性名自动补全
- 属性值提示
- 属性文档显示
- 废弃属性警告

### 示例

```yaml
myapp:
  enabled:     # IDEA 会提示: true | false
  timeout:     # IDEA 会提示: Duration format (e.g., 30s, 1m)
  log-level:   # IDEA 会提示: DEBUG | INFO | WARN | ERROR
```

---

## 27.3 文档编写

### README.md 模板

```markdown
# MyApp Spring Boot Starter

[![Maven Central](https://img.shields.io/maven-central/v/com.example/myapp-spring-boot-starter.svg)](https://search.maven.org/artifact/com.example/myapp-spring-boot-starter)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## 简介

MyApp Spring Boot Starter 提供了与 MyApp 服务集成的自动配置支持。

## 功能特性

- 自动配置客户端
- 连接池管理
- 请求重试机制
- 监控指标支持

## 快速开始

### 1. 添加依赖

Maven:
```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>myapp-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

Gradle:
```groovy
implementation 'com.example:myapp-spring-boot-starter:1.0.0'
```

### 2. 配置

```yaml
myapp:
  enabled: true
  server-url: https://api.example.com
  timeout: 30s
  max-retries: 3
```

### 3. 使用

```java
@Autowired
private MyAppClient client;

public void doSomething() {
    String result = client.call("param");
}
```

## 配置详解

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `myapp.enabled` | Boolean | `true` | 是否启用 MyApp |
| `myapp.server-url` | String | `http://localhost:8080` | 服务器 URL |
| `myapp.timeout` | Duration | `30s` | 请求超时时间 |
| `myapp.max-retries` | Integer | `3` | 最大重试次数 |

## 高级用法

### 自定义客户端

```java
@Configuration
public class MyAppConfig {
    
    @Bean
    public MyAppClientCustomizer clientCustomizer() {
        return client -> {
            client.setHeader("X-Custom", "value");
        };
    }
}
```

## 常见问题

### 连接超时

如果遇到连接超时，可以增加超时时间：

```yaml
myapp:
  timeout: 60s
```

## 许可证

Apache License 2.0
```

---

## 27.4 本章小结

**核心要点：**
1. 使用 configuration-processor 自动生成元数据
2. 提供完整的配置文档
3. IDE 会根据元数据提供配置提示
4. 编写清晰的 README 文档

**相关章节：**
- [第 26 章：Starter 依赖管理与 BOM](./content-26.md)
- [第 28 章：@ComponentScan 扫描机制](./content-28.md)

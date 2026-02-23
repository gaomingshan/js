# 第 13 章：配置文件加载机制

## 本章概述

深入讲解 Spring Boot 配置文件的加载机制，包括 application.properties/yml 的加载顺序、Profile 激活机制等。

**学习目标：**
- 理解配置文件的加载流程
- 掌握 Profile 机制的使用
- 了解配置文件的优先级规则

---

## 13.1 配置文件类型

### 支持的格式

```
application.properties
application.yml
application.yaml
```

### properties vs yml

**properties:**
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
```

**yml:**
```yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test
    username: root
```

---

## 13.2 配置文件位置

### 默认位置（优先级从高到低）

```
1. file:./config/          # 项目根目录的 config 子目录
2. file:./                 # 项目根目录
3. classpath:/config/      # classpath 的 config 目录
4. classpath:/             # classpath 根目录
```

### 示例

```
myproject/
├── config/
│   └── application.yml           # 优先级最高
├── application.yml                # 优先级第二
└── src/main/resources/
    ├── config/
    │   └── application.yml       # 优先级第三
    └── application.yml            # 优先级最低
```

---

## 13.3 Profile 机制

### Profile 配置文件命名

```
application-{profile}.properties
application-{profile}.yml
```

**示例：**
```
application.yml              # 通用配置
application-dev.yml          # 开发环境
application-test.yml         # 测试环境
application-prod.yml         # 生产环境
```

### 激活 Profile

**方式1：配置文件**
```properties
spring.profiles.active=dev
```

**方式2：命令行参数**
```bash
java -jar app.jar --spring.profiles.active=prod
```

**方式3：环境变量**
```bash
export SPRING_PROFILES_ACTIVE=prod
java -jar app.jar
```

**方式4：代码**
```java
SpringApplication app = new SpringApplication(Application.class);
app.setAdditionalProfiles("dev");
app.run(args);
```

### 多 Profile 激活

```properties
spring.profiles.active=dev,local,debug
```

### Profile 表达式

```java
@Configuration
@Profile("prod & !debug")
public class ProductionConfiguration {
    // 生产环境且非 debug 模式
}

@Configuration
@Profile("dev | test")
public class NonProductionConfiguration {
    // 开发或测试环境
}
```

---

## 13.4 配置加载流程

### 加载顺序

```
1. 加载默认配置（SpringApplication.setDefaultProperties）
2. 加载 @PropertySource 注解的配置
3. 加载 application.properties/yml
4. 加载 application-{profile}.properties/yml
5. 加载命令行参数
6. 加载操作系统环境变量
7. 加载 Java 系统属性
```

### PropertySourceLoader

```java
public interface PropertySourceLoader {
    
    String[] getFileExtensions();
    
    List<PropertySource<?>> load(String name, Resource resource) throws IOException;
}
```

**实现类：**
- `PropertiesPropertySourceLoader`: 加载 .properties 和 .xml
- `YamlPropertySourceLoader`: 加载 .yml 和 .yaml

---

## 13.5 配置文件占位符

### 引用其他属性

```properties
app.name=MyApp
app.description=${app.name} is a Spring Boot application
```

### 默认值

```properties
server.port=${PORT:8080}
# 如果环境变量 PORT 不存在，使用默认值 8080
```

### 随机值

```properties
my.secret=${random.value}
my.number=${random.int}
my.bignumber=${random.long}
my.uuid=${random.uuid}
my.number.less.than.ten=${random.int(10)}
my.number.in.range=${random.int[1024,65536]}
```

---

## 13.6 yml 高级特性

### 多文档块

```yaml
# 默认配置
server:
  port: 8080

---
# 开发环境
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8081

---
# 生产环境
spring:
  config:
    activate:
      on-profile: prod
server:
  port: 80
```

### 列表配置

```yaml
my:
  servers:
    - dev.example.com
    - test.example.com
    - prod.example.com
```

**对应 Java 类：**
```java
@ConfigurationProperties(prefix = "my")
public class MyProperties {
    private List<String> servers;
    // Getters and Setters
}
```

### 复杂对象

```yaml
my:
  database:
    host: localhost
    port: 3306
    credentials:
      username: root
      password: secret
```

---

## 13.7 本章小结

**核心要点：**
1. 配置文件支持 .properties 和 .yml 格式
2. 配置文件有4个默认位置，优先级不同
3. Profile 机制支持多环境配置
4. 配置加载有明确的优先级顺序
5. 支持占位符和随机值

**相关章节：**
- [第 14 章：配置优先级与覆盖机制](./content-14.md)
- [第 15 章：@ConfigurationProperties 绑定原理](./content-15.md)

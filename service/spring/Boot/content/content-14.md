# 第 14 章：配置优先级与覆盖机制

## 本章概述

深入讲解 Spring Boot 配置的17种来源及其优先级顺序，理解配置覆盖规则。

**学习目标：**
- 掌握17种配置源及其优先级
- 理解配置覆盖机制
- 学会使用外部配置

---

## 14.1 配置优先级（从高到低）

### 完整优先级列表

```
1. 命令行参数
2. SPRING_APPLICATION_JSON 中的属性
3. ServletConfig 初始化参数
4. ServletContext 初始化参数
5. JNDI 属性（java:comp/env）
6. Java 系统属性（System.getProperties()）
7. 操作系统环境变量
8. RandomValuePropertySource（random.*）
9. jar 包外的 application-{profile}.properties/yml
10. jar 包内的 application-{profile}.properties/yml
11. jar 包外的 application.properties/yml
12. jar 包内的 application.properties/yml
13. @PropertySource 注解
14. SpringApplication.setDefaultProperties
```

### 示例说明

**jar 包内配置（application.yml）：**
```yaml
server:
  port: 8080
```

**jar 包外配置（application.yml）：**
```yaml
server:
  port: 9090
```

**命令行参数：**
```bash
java -jar app.jar --server.port=8888
```

**最终结果：** 端口为 8888（命令行参数优先级最高）

---

## 14.2 命令行参数

### 基本用法

```bash
java -jar app.jar --server.port=8080 --spring.profiles.active=prod
```

### 禁用命令行参数

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setAddCommandLineProperties(false);  // 禁用命令行参数
        app.run(args);
    }
}
```

---

## 14.3 环境变量

### 使用环境变量

```bash
export SERVER_PORT=8080
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/test
java -jar app.jar
```

### 命名规则转换

```
server.port          → SERVER_PORT
spring.datasource.url → SPRING_DATASOURCE_URL
```

**规则：**
- 小写转大写
- 点(.)和短横线(-)转下划线(_)

---

## 14.4 SPRING_APPLICATION_JSON

### 使用 JSON 配置

**环境变量方式：**
```bash
export SPRING_APPLICATION_JSON='{"server":{"port":8080},"spring":{"datasource":{"url":"jdbc:mysql://localhost:3306/test"}}}'
java -jar app.jar
```

**命令行方式：**
```bash
java -jar app.jar --spring.application.json='{"server":{"port":8080}}'
```

---

## 14.5 外部配置文件

### 指定配置文件位置

```bash
java -jar app.jar --spring.config.location=classpath:/custom/,file:./config/
```

### 附加配置文件

```bash
java -jar app.jar --spring.config.additional-location=file:./custom.properties
```

### 配置文件名

```bash
java -jar app.jar --spring.config.name=myapp
# 将加载 myapp.properties/myapp.yml
```

---

## 14.6 Profile 特定配置

### 优先级

```
jar 包外 application-{profile}.yml  > 
jar 包内 application-{profile}.yml  >
jar 包外 application.yml            >
jar 包内 application.yml
```

### 示例

**application.yml:**
```yaml
server:
  port: 8080
```

**application-prod.yml:**
```yaml
server:
  port: 80
```

**激活 prod Profile：**
```bash
java -jar app.jar --spring.profiles.active=prod
# 端口为 80
```

---

## 14.7 配置导入

### @Import 配置

```properties
# application.properties
spring.config.import=optional:file:./dev.properties,optional:file:./custom.properties
```

### 条件导入

```properties
spring.config.import[0]=optional:file:./dev.properties
spring.config.import[1]=optional:file:./custom.properties
```

---

## 14.8 配置加密

### Jasypt 集成

```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

```properties
# 加密密码
jasypt.encryptor.password=mySecretKey

# 使用加密值
spring.datasource.password=ENC(encrypted_password_here)
```

---

## 14.9 配置验证

### 自定义验证

```java
@ConfigurationProperties(prefix = "my.config")
@Validated
public class MyProperties {
    
    @NotNull
    @Min(1024)
    @Max(65535)
    private Integer port;
    
    @NotBlank
    @Email
    private String adminEmail;
    
    // Getters and Setters
}
```

---

## 14.10 本章小结

**核心要点：**
1. 配置有17种来源，优先级明确
2. 命令行参数优先级最高
3. 环境变量自动转换命名格式
4. 支持外部配置文件和配置导入
5. 可以对配置进行加密和验证

**相关章节：**
- [第 13 章：配置文件加载机制](./content-13.md)
- [第 15 章：@ConfigurationProperties 绑定原理](./content-15.md)

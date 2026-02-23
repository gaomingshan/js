# 第 1 章：Spring Boot 简介与核心特性

## 本章概述

本章从 Spring Boot 的诞生背景出发，深入讲解其四大核心特性：自动配置、Starter 依赖、嵌入式容器、生产就绪特性。通过对比传统 Spring 开发方式，帮助你理解 Spring Boot 如何简化开发流程，并掌握快速开始的实践方法。

**学习目标：**
- 理解 Spring Boot 解决的核心问题
- 掌握 Spring Boot 与 Spring Framework 的关系
- 掌握四大核心特性的设计理念
- 能够快速搭建 Spring Boot 项目

---

## 1.1 Spring Boot 诞生背景

### 1.1.1 传统 Spring 开发的痛点

在 Spring Boot 出现之前，使用 Spring Framework 开发企业级应用面临诸多挑战：

#### **1. 繁琐的 XML 配置**

```xml
<!-- 传统 Spring 配置文件 applicationContext.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="...">

    <!-- 组件扫描 -->
    <context:component-scan base-package="com.example"/>
    
    <!-- 数据源配置 -->
    <bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
        <property name="driverClass" value="com.mysql.jdbc.Driver"/>
        <property name="jdbcUrl" value="jdbc:mysql://localhost:3306/db"/>
        <property name="user" value="root"/>
        <property name="password" value="password"/>
        <property name="maxPoolSize" value="20"/>
        <property name="minPoolSize" value="5"/>
    </bean>
    
    <!-- JdbcTemplate -->
    <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    
    <!-- 事务管理器 -->
    <bean id="transactionManager" 
          class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    
    <!-- 启用注解驱动事务 -->
    <tx:annotation-driven transaction-manager="transactionManager"/>
    
    <!-- ...更多配置 -->
</beans>
```

**问题：**
- 配置文件冗长，难以维护
- 配置项分散在多个文件中
- 修改配置需要重新编译部署

#### **2. 复杂的依赖管理**

```xml
<!-- 传统 Spring pom.xml 依赖管理 -->
<dependencies>
    <!-- 需要手动管理版本兼容性 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>5.3.10</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>5.3.10</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
        <version>5.3.10</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.10</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
        <version>5.3.10</version>
    </dependency>
    <!-- 数据库驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.26</version>
    </dependency>
    <!-- 连接池 -->
    <dependency>
        <groupId>com.mchange</groupId>
        <artifactId>c3p0</artifactId>
        <version>0.9.5.5</version>
    </dependency>
    <!-- ...更多依赖 -->
</dependencies>
```

**问题：**
- 需要手动管理数十个依赖的版本号
- 版本冲突难以排查
- 依赖项之间的兼容性问题

#### **3. 繁琐的部署流程**

传统 Spring Web 应用部署步骤：

1. 编写代码
2. 配置 web.xml
3. 打包成 war 包
4. 下载并安装 Tomcat/Jetty
5. 配置 Tomcat 端口、内存等参数
6. 将 war 包部署到 Tomcat
7. 启动 Tomcat

**问题：**
- 部署流程复杂，环境依赖多
- 需要单独维护应用服务器
- 本地开发与生产环境差异大

### 1.1.2 Spring Boot 的解决方案

Spring Boot 在 2014 年发布，核心目标是**简化 Spring 应用的初始搭建以及开发过程**。

**设计理念：**
- **约定大于配置**（Convention Over Configuration）
- **开箱即用**（Out-of-the-box）
- **独立运行**（Standalone）
- **生产就绪**（Production-ready）

Spring Boot 通过以下方式解决传统 Spring 的痛点：

| 传统 Spring 痛点 | Spring Boot 解决方案 |
|-----------------|---------------------|
| XML 配置繁琐 | 自动配置 + 注解驱动 |
| 依赖管理复杂 | Starter 依赖 + 版本管理 |
| 部署流程繁琐 | 嵌入式容器 + 可执行 jar |
| 缺少生产监控 | Actuator 生产级特性 |

---

## 1.2 Spring Boot 核心特性

### 1.2.1 自动配置（Auto-Configuration）

#### **核心思想**

根据项目中的依赖和配置，自动完成 Spring 应用的配置工作。

#### **工作原理概览**

```
1. 应用启动
    ↓
2. 扫描 classpath 中的依赖
    ↓
3. 根据依赖加载对应的自动配置类
    ↓
4. 通过条件注解判断是否生效
    ↓
5. 自动注册 Bean 到 Spring 容器
```

#### **示例：数据源自动配置**

**传统 Spring 配置：**
```xml
<bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
    <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"/>
    <property name="jdbcUrl" value="jdbc:mysql://localhost:3306/test"/>
    <property name="username" value="root"/>
    <property name="password" value="password"/>
</bean>
```

**Spring Boot 配置：**
```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
spring.datasource.password=password
```

Spring Boot 会自动：
1. 检测到 `HikariCP` 依赖在 classpath 中
2. 加载 `DataSourceAutoConfiguration` 自动配置类
3. 读取 `spring.datasource.*` 配置
4. 自动创建并注册 `DataSource` Bean

#### **核心注解**

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

`@SpringBootApplication` 是一个组合注解，包含：
- `@SpringBootConfiguration`：标识为配置类
- `@EnableAutoConfiguration`：**启用自动配置**
- `@ComponentScan`：组件扫描

### 1.2.2 Starter 依赖（Starter Dependencies）

#### **核心思想**

将常用功能的依赖打包成一个 Starter，一次引入即可获得完整功能。

#### **Starter 命名规范**

- **官方 Starter**：`spring-boot-starter-{name}`
- **第三方 Starter**：`{name}-spring-boot-starter`

#### **常用 Starter**

| Starter | 功能 | 包含的依赖 |
|---------|------|-----------|
| `spring-boot-starter-web` | Web 开发 | Spring MVC、Tomcat、Jackson |
| `spring-boot-starter-data-jpa` | JPA 数据访问 | Hibernate、Spring Data JPA |
| `spring-boot-starter-data-redis` | Redis 集成 | Lettuce、Spring Data Redis |
| `spring-boot-starter-security` | 安全框架 | Spring Security |
| `spring-boot-starter-test` | 测试支持 | JUnit、Mockito、AssertJ |
| `spring-boot-starter-actuator` | 生产监控 | Actuator 端点 |

#### **示例：Web 项目依赖**

**传统 Spring：**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.10</version>
    </dependency>
    <dependency>
        <groupId>org.apache.tomcat.embed</groupId>
        <artifactId>tomcat-embed-core</artifactId>
        <version>9.0.52</version>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.12.5</version>
    </dependency>
    <!-- ...更多依赖 -->
</dependencies>
```

**Spring Boot：**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

一个 Starter 搞定所有依赖！

#### **版本管理**

Spring Boot 通过父 POM 管理版本：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>
```

所有 Starter 的版本都由父 POM 统一管理，无需手动指定版本号。

### 1.2.3 嵌入式容器（Embedded Container）

#### **核心思想**

将 Tomcat、Jetty 等 Servlet 容器嵌入到应用中，应用本身即可独立运行。

#### **架构对比**

**传统部署：**
```
应用（war） → 部署到 → Tomcat（独立安装）
```

**Spring Boot 部署：**
```
应用（jar，内含 Tomcat） → 直接运行
```

#### **可执行 Jar 结构**

```
myapp.jar
├── BOOT-INF/
│   ├── classes/          # 应用类文件
│   │   └── com/example/
│   └── lib/              # 应用依赖
│       ├── spring-*.jar
│       └── tomcat-embed-core-*.jar
├── META-INF/
│   └── MANIFEST.MF       # 启动入口
└── org/
    └── springframework/
        └── boot/
            └── loader/   # Spring Boot 类加载器
```

**MANIFEST.MF 关键配置：**
```
Main-Class: org.springframework.boot.loader.JarLauncher
Start-Class: com.example.Application
```

#### **支持的容器**

| 容器 | Starter | 默认端口 |
|------|---------|---------|
| Tomcat（默认） | `spring-boot-starter-web` | 8080 |
| Jetty | `spring-boot-starter-jetty` | 8080 |
| Undertow | `spring-boot-starter-undertow` | 8080 |

#### **切换容器示例**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <!-- 排除默认的 Tomcat -->
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- 引入 Jetty -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

#### **启动方式对比**

**传统 Tomcat 启动：**
```bash
# 1. 启动 Tomcat
cd /path/to/tomcat/bin
./startup.sh

# 2. 部署应用
cp myapp.war /path/to/tomcat/webapps/
```

**Spring Boot 启动：**
```bash
java -jar myapp.jar
```

### 1.2.4 生产就绪特性（Actuator）

#### **核心思想**

提供一组生产级的监控和管理端点，无需额外开发即可获得应用监控能力。

#### **引入 Actuator**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

#### **核心端点**

| 端点 | 功能 | URL |
|------|------|-----|
| `/actuator/health` | 健康检查 | `GET /actuator/health` |
| `/actuator/info` | 应用信息 | `GET /actuator/info` |
| `/actuator/metrics` | 指标监控 | `GET /actuator/metrics` |
| `/actuator/env` | 环境配置 | `GET /actuator/env` |
| `/actuator/beans` | Bean 列表 | `GET /actuator/beans` |
| `/actuator/mappings` | 请求映射 | `GET /actuator/mappings` |

#### **健康检查示例**

```bash
curl http://localhost:8080/actuator/health
```

**响应：**
```json
{
  "status": "UP",
  "components": {
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 499963174912,
        "free": 123456789012,
        "threshold": 10485760
      }
    },
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    }
  }
}
```

#### **配置端点暴露**

```properties
# 暴露所有端点
management.endpoints.web.exposure.include=*

# 暴露指定端点
management.endpoints.web.exposure.include=health,info,metrics

# 自定义端点路径
management.endpoints.web.base-path=/manage
```

---

## 1.3 Spring Boot 与 Spring Framework 的关系

### 1.3.1 依赖关系

```
Spring Boot
    ↓ 基于
Spring Framework
    ↓ 核心
IoC 容器 + AOP
```

**Spring Boot 不是替代 Spring Framework，而是对其的增强和简化。**

### 1.3.2 核心区别

| 对比维度 | Spring Framework | Spring Boot |
|----------|------------------|-------------|
| **定位** | 企业级开发框架 | 快速开发脚手架 |
| **配置方式** | XML / JavaConfig | 自动配置 + 注解 |
| **依赖管理** | 手动管理版本 | Starter + 版本管理 |
| **部署方式** | war → 应用服务器 | jar 独立运行 |
| **监控能力** | 需自行集成 | 内置 Actuator |
| **开发效率** | 配置繁琐 | 开箱即用 |

### 1.3.3 技术栈对比

**传统 Spring 技术栈：**
```
Spring MVC + Spring + MyBatis + Tomcat
    ↓
手动配置 + 手动集成
```

**Spring Boot 技术栈：**
```
Spring Boot Starter
    ↓
自动配置 + 开箱即用
```

---

## 1.4 快速开始实战

### 1.4.1 创建 Spring Boot 项目

#### **方式1：Spring Initializr（推荐）**

访问 [https://start.spring.io/](https://start.spring.io/)

- **Project**: Maven
- **Language**: Java
- **Spring Boot**: 3.2.0
- **Dependencies**: Spring Web

#### **方式2：IDEA 创建**

1. File → New → Project
2. 选择 Spring Initializr
3. 填写项目信息
4. 选择依赖（Spring Web）

#### **方式3：手动创建**

**1. pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- 继承 Spring Boot 父 POM -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>springboot-demo</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Web Starter -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Spring Boot Maven 插件 -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

**2. 主启动类**

```java
package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**3. 控制器**

```java
package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }
}
```

### 1.4.2 运行应用

#### **IDEA 运行**
1. 右键 `Application` 类
2. 点击 `Run 'Application'`

#### **Maven 运行**
```bash
mvn spring-boot:run
```

#### **打包运行**
```bash
# 打包
mvn clean package

# 运行
java -jar target/springboot-demo-1.0.0.jar
```

### 1.4.3 启动日志解析

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v3.2.0)

2024-01-15 10:00:00.123  INFO 12345 --- [main] com.example.Application: Starting Application
2024-01-15 10:00:01.456  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2024-01-15 10:00:02.789  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http)
2024-01-15 10:00:02.890  INFO 12345 --- [main] com.example.Application: Started Application in 3.2 seconds
```

**关键信息：**
1. Spring Boot 版本：`v3.2.0`
2. Tomcat 端口：`8080`
3. 启动耗时：`3.2 seconds`

### 1.4.4 测试接口

```bash
curl http://localhost:8080/hello
```

**响应：**
```
Hello, Spring Boot!
```

---

## 1.5 核心特性深度对比

### 1.5.1 代码量对比

#### **传统 Spring MVC 项目结构**

```
src/main/
├── java/
│   └── com/example/
│       ├── config/
│       │   ├── WebConfig.java           # Web 配置
│       │   ├── DataSourceConfig.java    # 数据源配置
│       │   └── TransactionConfig.java   # 事务配置
│       ├── controller/
│       │   └── HelloController.java
│       └── Application.java
├── resources/
│   ├── applicationContext.xml           # Spring 配置
│   ├── spring-mvc.xml                   # MVC 配置
│   └── jdbc.properties                  # 数据库配置
└── webapp/
    └── WEB-INF/
        └── web.xml                      # Web 应用配置
```

**总配置文件：5+ 个**

#### **Spring Boot 项目结构**

```
src/main/
├── java/
│   └── com/example/
│       ├── controller/
│       │   └── HelloController.java
│       └── Application.java
└── resources/
    └── application.properties           # 唯一配置文件
```

**总配置文件：1 个**

### 1.5.2 配置复杂度对比

#### **数据源配置**

**传统 Spring（50+ 行）：**
```xml
<!-- applicationContext.xml -->
<bean id="propertyConfigurer" 
      class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
    <property name="locations">
        <list>
            <value>classpath:jdbc.properties</value>
        </list>
    </property>
</bean>

<bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
    <property name="driverClassName" value="${jdbc.driverClassName}"/>
    <property name="jdbcUrl" value="${jdbc.url}"/>
    <property name="username" value="${jdbc.username}"/>
    <property name="password" value="${jdbc.password}"/>
    <property name="maximumPoolSize" value="${jdbc.maxPoolSize}"/>
    <property name="minimumIdle" value="${jdbc.minIdle}"/>
    <property name="connectionTimeout" value="${jdbc.connectionTimeout}"/>
</bean>

<bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
    <property name="dataSource" ref="dataSource"/>
</bean>
```

**Spring Boot（3 行）：**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
spring.datasource.password=password
```

自动配置完成所有工作！

### 1.5.3 启动速度对比

| 项目类型 | 启动时间 | 说明 |
|---------|---------|------|
| 传统 Spring MVC | 10-30s | 需要启动外部 Tomcat |
| Spring Boot | 3-10s | 嵌入式容器，启动快速 |

---

## 1.6 实际落地场景

### 1.6.1 微服务架构

Spring Boot 是微服务架构的理想选择：

```
订单服务(Spring Boot) ←→ 用户服务(Spring Boot) ←→ 商品服务(Spring Boot)
        ↓                      ↓                      ↓
    独立部署                独立部署                独立部署
```

**优势：**
- 独立打包，独立部署
- 快速启动，适合容器化
- 统一技术栈，降低维护成本

### 1.6.2 快速原型开发

```java
@SpringBootApplication
@RestController
public class PrototypeApp {
    
    @GetMapping("/api/users")
    public List<User> getUsers() {
        return List.of(
            new User(1, "Alice"),
            new User(2, "Bob")
        );
    }
    
    public static void main(String[] args) {
        SpringApplication.run(PrototypeApp.class, args);
    }
}
```

10 行代码搞定 RESTful API！

### 1.6.3 企业级应用

```
Spring Boot 应用
├── spring-boot-starter-web         # Web 层
├── spring-boot-starter-data-jpa    # 持久层
├── spring-boot-starter-security    # 安全层
├── spring-boot-starter-cache       # 缓存
├── spring-boot-starter-actuator    # 监控
└── spring-boot-starter-test        # 测试
```

一站式解决方案！

---

## 1.7 常见问题与易错点

### 1.7.1 端口冲突

**问题：**
```
***************************
APPLICATION FAILED TO START
***************************

Description:
Web server failed to start. Port 8080 was already in use.
```

**解决方案：**

**方式1：修改端口**
```properties
server.port=8081
```

**方式2：查找并关闭占用进程**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :8080
kill -9 <进程ID>
```

### 1.7.2 @SpringBootApplication 位置错误

**错误示例：**
```
src/main/java/
├── Application.java              # 错误：在根包
└── com/example/
    └── controller/
        └── HelloController.java
```

**问题：**
`@SpringBootApplication` 默认扫描当前包及子包，`HelloController` 不会被扫描到。

**正确示例：**
```
src/main/java/
└── com/example/
    ├── Application.java          # 正确：在顶层包
    └── controller/
        └── HelloController.java
```

**或手动指定扫描包：**
```java
@SpringBootApplication(scanBasePackages = "com.example")
public class Application { }
```

### 1.7.3 依赖版本冲突

**错误：**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>3.2.0</version>  <!-- 不要手动指定版本 -->
</dependency>
```

**正确：**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- 版本由 spring-boot-starter-parent 管理 -->
</dependency>
```

### 1.7.4 静态资源访问 404

**问题：**
静态资源放在 `src/main/webapp/` 下无法访问。

**原因：**
Spring Boot 默认不使用 `webapp` 目录。

**解决方案：**
将静态资源放在以下目录：
```
src/main/resources/
├── static/       # 静态资源（CSS、JS、图片）
├── public/       # 公共资源
└── templates/    # 模板文件（Thymeleaf 等）
```

访问路径：
```
http://localhost:8080/css/style.css
对应文件：src/main/resources/static/css/style.css
```

---

## 1.8 本章小结

### 核心要点

1. **Spring Boot 诞生背景**
   - 解决传统 Spring 配置繁琐、依赖管理复杂、部署流程繁琐的问题
   - 核心理念：约定大于配置、开箱即用

2. **四大核心特性**
   - **自动配置**：根据依赖自动完成配置
   - **Starter 依赖**：一站式依赖管理
   - **嵌入式容器**：独立运行，无需外部服务器
   - **Actuator**：生产级监控能力

3. **与 Spring Framework 的关系**
   - Spring Boot 基于 Spring Framework
   - 不是替代，而是增强和简化
   - 降低学习曲线，提升开发效率

4. **快速开始**
   - 3 个文件即可运行：pom.xml + Application.java + Controller.java
   - 配置极简：一个 application.properties 搞定
   - 启动快速：java -jar 一键启动

### 思维导图

```
Spring Boot 核心特性
├── 自动配置
│   ├── @EnableAutoConfiguration
│   ├── 条件注解
│   └── 自动配置类
├── Starter 依赖
│   ├── spring-boot-starter-web
│   ├── spring-boot-starter-data-jpa
│   └── 版本管理
├── 嵌入式容器
│   ├── Tomcat（默认）
│   ├── Jetty
│   └── Undertow
└── Actuator
    ├── 健康检查
    ├── 指标监控
    └── 端点管理
```

### 自检清单

- [ ] 能够解释 Spring Boot 解决了传统 Spring 的哪些问题
- [ ] 理解自动配置的基本原理
- [ ] 掌握 Starter 依赖的作用和命名规范
- [ ] 理解嵌入式容器的架构
- [ ] 能够快速创建并运行 Spring Boot 项目
- [ ] 知道如何解决常见的端口冲突、扫描包等问题

---

## 下一章预告

**第 2 章：约定大于配置设计理念**

将深入讲解 Spring Boot 的核心设计哲学——约定大于配置，包括：
- 约定大于配置的设计思想
- Spring Boot 的默认配置体系
- 如何覆盖默认配置
- 约定优于配置的最佳实践

---

**相关章节：**
- [第 2 章：约定大于配置设计理念](./content-2.md)
- [第 4 章：@SpringBootApplication 注解剖析](./content-4.md)
- [第 13 章：Starter 设计原则与规范](./content-24.md)

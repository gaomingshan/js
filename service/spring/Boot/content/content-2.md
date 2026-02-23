# 第 2 章：约定大于配置设计理念

## 本章概述

本章深入讲解 Spring Boot 的核心设计哲学——**约定大于配置**（Convention Over Configuration）。通过分析 Spring Boot 的默认配置体系，帮助你理解如何通过约定减少配置，以及如何在必要时覆盖默认配置。

**学习目标：**
- 理解约定大于配置的设计思想
- 掌握 Spring Boot 的默认配置体系
- 学会如何覆盖和自定义默认配置
- 掌握约定优于配置的最佳实践

---

## 2.1 约定大于配置的设计思想

### 2.1.1 什么是约定大于配置

**约定大于配置**（Convention Over Configuration）是一种软件设计范式，通过预先定义一组合理的默认约定，减少开发者需要做出的决策和配置。

**核心理念：**
```
合理的默认值 > 显式的配置
```

### 2.1.2 传统开发的配置地狱

#### **示例：配置一个简单的 Web 应用**

**传统 Spring MVC 配置（需要配置的内容）：**

1. **web.xml**（40+ 行）
```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee 
         http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
         version="3.1">
    
    <!-- Spring MVC DispatcherServlet -->
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>/WEB-INF/spring-mvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
    
    <!-- Spring 容器配置 -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>
    
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/applicationContext.xml</param-value>
    </context-param>
    
    <!-- 字符编码过滤器 -->
    <filter>
        <filter-name>encodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
    </filter>
    
    <filter-mapping>
        <filter-name>encodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
</web-app>
```

2. **spring-mvc.xml**（30+ 行）
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="...">

    <!-- 启用 MVC 注解驱动 -->
    <mvc:annotation-driven/>
    
    <!-- 组件扫描 -->
    <context:component-scan base-package="com.example.controller"/>
    
    <!-- 视图解析器 -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/views/"/>
        <property name="suffix" value=".jsp"/>
    </bean>
    
    <!-- 静态资源处理 -->
    <mvc:resources mapping="/static/**" location="/static/"/>
    
    <!-- JSON 转换器 -->
    <mvc:annotation-driven>
        <mvc:message-converters>
            <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter"/>
        </mvc:message-converters>
    </mvc:annotation-driven>
</beans>
```

3. **applicationContext.xml**（20+ 行）
4. **数据源配置**（30+ 行）
5. **MyBatis 配置**（40+ 行）

**总计：150+ 行配置**

#### **Spring Boot 实现（零配置）**

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**就这一个类，0 行配置！**

### 2.1.3 约定大于配置的优势

| 维度 | 传统配置 | 约定大于配置 |
|------|---------|------------|
| **学习曲线** | 陡峭，需要了解大量配置项 | 平缓，遵循约定即可 |
| **开发效率** | 低，配置繁琐 | 高，快速启动 |
| **维护成本** | 高，配置分散易出错 | 低，配置集中 |
| **灵活性** | 高，任意定制 | 中，可覆盖默认配置 |
| **适用场景** | 复杂定制场景 | 通用场景（90%+） |

**核心思想：**
> 为 90% 的常见场景提供合理的默认值，为 10% 的特殊场景提供覆盖机制。

---

## 2.2 Spring Boot 的默认配置体系

### 2.2.1 默认配置的层次结构

```
Spring Boot 默认配置体系
├── 项目结构约定
├── 端口和路径约定
├── 日志配置约定
├── 静态资源约定
├── 模板引擎约定
├── 数据源约定
└── 错误处理约定
```

### 2.2.2 项目结构约定

#### **标准项目结构**

```
src/
├── main/
│   ├── java/
│   │   └── com/example/demo/
│   │       ├── DemoApplication.java      # 主启动类（约定）
│   │       ├── controller/               # 控制器层（约定）
│   │       ├── service/                  # 业务层（约定）
│   │       ├── repository/               # 数据访问层（约定）
│   │       ├── model/                    # 实体类（约定）
│   │       └── config/                   # 配置类（约定）
│   └── resources/
│       ├── static/                       # 静态资源（约定）
│       │   ├── css/
│       │   ├── js/
│       │   └── images/
│       ├── templates/                    # 模板文件（约定）
│       ├── application.properties        # 配置文件（约定）
│       └── application.yml               # 配置文件（约定）
└── test/
    └── java/
        └── com/example/demo/
            └── DemoApplicationTests.java # 测试类（约定）
```

#### **约定解析**

| 约定 | 说明 | 原因 |
|------|------|------|
| **主类命名** | `*Application.java` | 清晰标识应用入口 |
| **主类位置** | 顶层包下 | 默认扫描当前包及子包 |
| **配置文件名** | `application.properties/yml` | 统一配置入口 |
| **静态资源** | `static/` 目录 | Web 标准实践 |
| **模板文件** | `templates/` 目录 | 模板引擎标准位置 |

### 2.2.3 端口和路径约定

#### **默认端口**

```properties
# 默认约定（无需配置）
server.port=8080                    # Web 服务端口
management.server.port=8080         # Actuator 端口
```

#### **默认上下文路径**

```properties
# 默认约定
server.servlet.context-path=/       # 根路径
```

**访问示例：**
```
http://localhost:8080/hello         # 默认
http://localhost:8080/api/hello     # 如果设置了 context-path=/api
```

#### **默认 Actuator 路径**

```properties
# 默认约定
management.endpoints.web.base-path=/actuator
```

**访问示例：**
```
http://localhost:8080/actuator/health
http://localhost:8080/actuator/info
```

### 2.2.4 日志配置约定

#### **默认日志框架**

Spring Boot 默认使用 **Logback** 作为日志实现。

#### **默认日志级别**

```
根日志级别：INFO
Spring 框架：INFO
Hibernate：INFO
```

#### **默认日志输出**

```
控制台：彩色输出（开发环境）
文件：无（需手动配置）
```

#### **默认日志格式**

```
2024-01-15 10:00:00.123  INFO 12345 --- [main] com.example.DemoApplication : Starting DemoApplication
                         ↑    ↑     ↑   ↑      ↑                            ↑
                       级别  进程ID  线程  类名                            消息
```

### 2.2.5 静态资源约定

#### **静态资源目录**

Spring Boot 默认从以下位置加载静态资源：

```
classpath:/static/
classpath:/public/
classpath:/resources/
classpath:/META-INF/resources/
```

**优先级：**
```
/META-INF/resources/ > /resources/ > /static/ > /public/
```

#### **静态资源映射**

```
URL: http://localhost:8080/css/style.css
     ↓ 自动映射到
文件: src/main/resources/static/css/style.css
```

**无需任何配置！**

#### **默认首页**

Spring Boot 自动将以下文件作为首页：

```
static/index.html
public/index.html
resources/index.html
templates/index.html（需要模板引擎）
```

### 2.2.6 模板引擎约定

#### **支持的模板引擎**

| 模板引擎 | Starter | 默认路径 |
|---------|---------|---------|
| Thymeleaf | `spring-boot-starter-thymeleaf` | `templates/` |
| FreeMarker | `spring-boot-starter-freemarker` | `templates/` |
| Mustache | `spring-boot-starter-mustache` | `templates/` |

#### **Thymeleaf 默认配置**

```properties
# 默认约定（无需配置）
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.thymeleaf.cache=true           # 生产环境
spring.thymeleaf.mode=HTML
spring.thymeleaf.encoding=UTF-8
```

### 2.2.7 数据源约定

#### **自动检测数据源**

```java
// 只需添加依赖和配置连接信息
```

**pom.xml:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

**application.properties:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
spring.datasource.password=password
```

**自动配置内容：**
- 数据源类型：HikariCP（默认）
- 连接池配置：合理的默认值
- JPA 配置：Hibernate 作为实现
- 事务管理：自动启用

### 2.2.8 错误处理约定

#### **默认错误页面**

当发生错误时，Spring Boot 自动返回错误页面：

```
404 Not Found:        whitelabel 错误页面
500 Internal Error:   whitelabel 错误页面
```

#### **自定义错误页面约定**

```
src/main/resources/
└── static/
    └── error/
        ├── 404.html      # 404 错误页面
        ├── 500.html      # 500 错误页面
        └── 4xx.html      # 所有 4xx 错误
```

**自动映射，无需配置！**

---

## 2.3 如何覆盖默认配置

### 2.3.1 覆盖配置的三种方式

#### **方式1：application.properties/yml**

最常用的覆盖方式。

```properties
# 覆盖端口
server.port=9090

# 覆盖上下文路径
server.servlet.context-path=/api

# 覆盖日志级别
logging.level.root=DEBUG
logging.level.com.example=TRACE

# 覆盖静态资源路径
spring.web.resources.static-locations=classpath:/custom-static/
```

#### **方式2：Java 配置类**

通过 `@Configuration` 类覆盖。

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    // 覆盖静态资源映射
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/custom-static/");
    }
    
    // 覆盖跨域配置
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

#### **方式3：命令行参数**

```bash
# 覆盖端口
java -jar app.jar --server.port=9090

# 覆盖多个配置
java -jar app.jar --server.port=9090 --spring.profiles.active=prod
```

### 2.3.2 配置覆盖优先级

Spring Boot 配置加载优先级（从高到低）：

```
1. 命令行参数
2. SPRING_APPLICATION_JSON 环境变量
3. ServletConfig 初始化参数
4. ServletContext 初始化参数
5. JNDI 属性
6. Java 系统属性 (System.getProperties())
7. 操作系统环境变量
8. RandomValuePropertySource (random.*)
9. jar 包外的 application-{profile}.properties/yml
10. jar 包内的 application-{profile}.properties/yml
11. jar 包外的 application.properties/yml
12. jar 包内的 application.properties/yml
13. @Configuration 类上的 @PropertySource
14. 默认配置 (SpringApplication.setDefaultProperties)
```

**记忆口诀：**
```
命令行 > 外部配置 > 内部配置 > 代码配置 > 默认配置
```

### 2.3.3 覆盖配置实战示例

#### **场景1：自定义错误页面**

**需求：** 替换默认的 whitelabel 错误页面。

**解决方案1：静态页面**

```
src/main/resources/static/error/
├── 404.html
├── 500.html
└── 5xx.html
```

**404.html:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>页面未找到</title>
</head>
<body>
    <h1>404 - 页面未找到</h1>
    <p>抱歉，您访问的页面不存在。</p>
</body>
</html>
```

**解决方案2：自定义错误控制器**

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ModelAndView handleException(Exception ex) {
        ModelAndView mav = new ModelAndView("error");
        mav.addObject("message", ex.getMessage());
        return mav;
    }
}
```

#### **场景2：自定义静态资源路径**

**需求：** 将静态资源放在 `src/main/resources/assets/` 下。

**application.properties:**
```properties
spring.web.resources.static-locations=classpath:/assets/
```

**或使用 Java 配置：**

```java
@Configuration
public class ResourceConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/assets/")
                .setCachePeriod(3600);
    }
}
```

#### **场景3：自定义数据源**

**需求：** 使用 Druid 连接池替代默认的 HikariCP。

**pom.xml:**
```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.2.15</version>
</dependency>
```

**application.properties:**
```properties
# Druid 配置
spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.druid.initial-size=5
spring.datasource.druid.min-idle=5
spring.datasource.druid.max-active=20
spring.datasource.druid.max-wait=60000
```

**或使用 Java 配置：**

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.druid")
    public DataSource dataSource() {
        return DruidDataSourceBuilder.create().build();
    }
}
```

#### **场景4：自定义 Jackson 序列化**

**需求：** 统一 JSON 日期格式。

**application.properties:**
```properties
# 日期格式
spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
spring.jackson.time-zone=GMT+8

# 序列化配置
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.serialization.indent-output=true
```

**或使用 Java 配置：**

```java
@Configuration
public class JacksonConfig {
    
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer customizer() {
        return builder -> {
            builder.simpleDateFormat("yyyy-MM-dd HH:mm:ss");
            builder.timeZone("GMT+8");
        };
    }
}
```

---

## 2.4 约定优于配置的最佳实践

### 2.4.1 遵循约定，减少配置

#### **✅ 推荐做法**

```java
// 1. 主类放在顶层包
package com.example.demo;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

// 2. 分层结构清晰
package com.example.demo.controller;  // 控制器
package com.example.demo.service;     // 业务层
package com.example.demo.repository;  // 数据访问层
package com.example.demo.model;       // 实体类

// 3. 配置文件统一
src/main/resources/application.properties
src/main/resources/application-dev.properties
src/main/resources/application-prod.properties
```

#### **❌ 不推荐做法**

```java
// 主类放在子包，需要手动指定扫描包
package com.example.demo.app;

@SpringBootApplication(scanBasePackages = "com.example.demo")
public class App { }

// 配置文件分散
config/database.properties
config/redis.properties
config/rabbitmq.properties
```

### 2.4.2 配置外部化

#### **环境分离**

```
src/main/resources/
├── application.properties              # 公共配置
├── application-dev.properties          # 开发环境
├── application-test.properties         # 测试环境
└── application-prod.properties         # 生产环境
```

**application.properties:**
```properties
# 激活环境
spring.profiles.active=dev
```

**application-dev.properties:**
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/dev_db
logging.level.root=DEBUG
```

**application-prod.properties:**
```properties
server.port=80
spring.datasource.url=jdbc:mysql://prod-server:3306/prod_db
logging.level.root=WARN
```

#### **敏感信息外部化**

```properties
# 不要在代码中硬编码敏感信息
# ❌ 错误
spring.datasource.password=123456

# ✅ 正确：使用环境变量
spring.datasource.password=${DB_PASSWORD}
```

### 2.4.3 按需覆盖，保持简洁

#### **原则：** 只覆盖必要的配置

**✅ 推荐：**
```properties
# 只配置需要修改的项
server.port=9090
logging.level.com.example=DEBUG
```

**❌ 不推荐：**
```properties
# 重复配置默认值
server.port=9090
server.address=0.0.0.0                  # 默认值
server.servlet.context-path=/           # 默认值
spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
spring.jackson.time-zone=GMT+8
spring.jackson.serialization.indent-output=false  # 默认值
```

### 2.4.4 使用配置提示

#### **启用配置提示**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

#### **自定义配置属性**

```java
@ConfigurationProperties(prefix = "myapp")
public class MyAppProperties {
    
    private String name;
    private int timeout = 3000;  // 默认值
    
    // Getters and Setters
}
```

**application.properties:**
```properties
myapp.name=Demo App
myapp.timeout=5000
```

**启用配置：**
```java
@Configuration
@EnableConfigurationProperties(MyAppProperties.class)
public class AppConfig {
}
```

---

## 2.5 约定的利弊分析

### 2.5.1 优势

| 优势 | 说明 | 示例 |
|------|------|------|
| **降低学习曲线** | 遵循约定即可，无需深入了解配置细节 | 静态资源放 `static/` 即可访问 |
| **提升开发效率** | 减少配置时间，专注业务开发 | 零配置启动 Web 应用 |
| **减少错误** | 减少配置错误的可能性 | 自动配置避免版本冲突 |
| **统一标准** | 团队开发遵循相同规范 | 统一的项目结构 |
| **便于维护** | 配置集中，易于管理 | 单一配置文件 |

### 2.5.2 劣势

| 劣势 | 说明 | 解决方案 |
|------|------|---------|
| **灵活性降低** | 特殊场景可能不符合约定 | 提供覆盖机制 |
| **黑盒化** | 自动配置可能不透明 | 提供 debug 日志 |
| **学习曲线** | 需要了解约定规则 | 文档详细说明 |
| **定制困难** | 深度定制需要理解原理 | 提供扩展点 |

### 2.5.3 适用场景

#### **✅ 适合使用约定的场景**

- 标准 Web 应用
- 微服务开发
- 快速原型开发
- 团队协作项目
- 维护成本敏感的项目

#### **❌ 不适合使用约定的场景**

- 高度定制化需求
- 特殊业务场景（非标准）
- 需要精细控制的场景
- 遗留系统集成

**解决方案：** 提供覆盖机制，在约定基础上灵活扩展。

---

## 2.6 常见问题与易错点

### 2.6.1 主类位置导致扫描失败

**问题：** Controller 无法被扫描到。

**错误示例：**
```
src/main/java/
├── Application.java              # 错误：在根包
└── com/example/
    └── controller/
        └── UserController.java
```

**原因：** `@SpringBootApplication` 默认扫描当前包及子包。

**解决方案1：** 将主类移到顶层包
```
src/main/java/
└── com/example/
    ├── Application.java          # 正确
    └── controller/
        └── UserController.java
```

**解决方案2：** 手动指定扫描包
```java
@SpringBootApplication(scanBasePackages = "com.example")
public class Application { }
```

### 2.6.2 静态资源 404

**问题：** 静态资源无法访问。

**错误示例：**
```
src/main/webapp/static/css/style.css    # 错误：webapp 目录
```

**原因：** Spring Boot 不使用 `webapp` 目录。

**解决方案：** 将静态资源放到约定目录
```
src/main/resources/static/css/style.css  # 正确
```

### 2.6.3 配置文件命名错误

**问题：** 配置文件不生效。

**错误命名：**
```
config.properties              # ❌
app.properties                 # ❌
settings.properties            # ❌
```

**正确命名：**
```
application.properties         # ✅
application.yml                # ✅
application-dev.properties     # ✅
```

### 2.6.4 覆盖配置不生效

**问题：** 自定义配置被默认配置覆盖。

**原因：** 配置优先级理解错误。

**调试方法：**

```bash
# 启用配置 debug
java -jar app.jar --debug
```

**查看配置加载顺序：**
```
CONDITIONS EVALUATION REPORT
============================

Positive matches:
-----------------
   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType' (OnClassCondition)
```

### 2.6.5 多环境配置混淆

**问题：** 开发环境使用了生产配置。

**错误示例：**
```properties
# application.properties
spring.profiles.active=prod    # 错误：直接激活生产环境
```

**正确做法：**

```properties
# application.properties
spring.profiles.active=dev     # 默认开发环境
```

```bash
# 生产环境通过命令行激活
java -jar app.jar --spring.profiles.active=prod
```

---

## 2.7 本章小结

### 核心要点

1. **约定大于配置的本质**
   - 通过合理的默认值减少配置
   - 90% 场景遵循约定，10% 场景覆盖配置
   - 降低学习曲线，提升开发效率

2. **Spring Boot 的默认约定**
   - 项目结构约定：主类位置、包结构
   - 端口和路径约定：8080、/actuator
   - 静态资源约定：static/、public/
   - 配置文件约定：application.properties/yml

3. **覆盖默认配置**
   - 三种方式：配置文件、Java 配置、命令行参数
   - 配置优先级：命令行 > 外部配置 > 内部配置
   - 按需覆盖，保持简洁

4. **最佳实践**
   - 遵循约定，减少配置
   - 配置外部化，环境分离
   - 敏感信息使用环境变量
   - 使用配置提示提升开发体验

### 思维导图

```
约定大于配置
├── 设计思想
│   ├── 合理的默认值
│   ├── 减少配置决策
│   └── 提供覆盖机制
├── 默认约定
│   ├── 项目结构（主类、包结构）
│   ├── 端口路径（8080、/actuator）
│   ├── 静态资源（static/、public/）
│   └── 配置文件（application.properties）
├── 覆盖机制
│   ├── 配置文件覆盖
│   ├── Java 配置覆盖
│   └── 命令行参数覆盖
└── 最佳实践
    ├── 遵循约定
    ├── 环境分离
    └── 按需覆盖
```

### 自检清单

- [ ] 理解约定大于配置的设计思想和优势
- [ ] 掌握 Spring Boot 的项目结构约定
- [ ] 知道默认的端口、路径、静态资源位置
- [ ] 掌握配置覆盖的三种方式
- [ ] 理解配置优先级顺序
- [ ] 能够解决常见的扫描包、静态资源问题

---

## 下一章预告

**第 3 章：Spring Boot 运行机制概览**

将从宏观角度讲解 Spring Boot 的整体架构和运行机制，包括：
- Spring Boot 整体架构
- 核心组件与流程
- 关键扩展点体系
- 与 Spring Framework 的集成关系

---

**相关章节：**
- [第 1 章：Spring Boot 简介与核心特性](./content-1.md)
- [第 3 章：Spring Boot 运行机制概览](./content-3.md)
- [第 4 章：@SpringBootApplication 注解剖析](./content-4.md)

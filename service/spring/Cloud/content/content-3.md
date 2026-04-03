# 第 3 章：微服务项目快速搭建

> **学习目标**：掌握多模块 Maven 项目结构设计、依赖版本管理、快速搭建微服务脚手架  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐ 中等

---

## 1. 项目结构设计

### 1.1 多模块 Maven 项目结构

**推荐结构**：

```
microservice-demo/
├── pom.xml                          # 父 POM（依赖版本管理）
├── microservice-common/             # 公共模块
│   ├── common-core/                 # 核心工具类
│   ├── common-redis/                # Redis 封装
│   └── common-web/                  # Web 通用配置
├── microservice-api/                # API 接口定义
│   ├── user-api/                    # 用户服务 API
│   └── order-api/                   # 订单服务 API
├── microservice-service/            # 微服务实现
│   ├── user-service/                # 用户服务
│   ├── order-service/               # 订单服务
│   └── product-service/             # 商品服务
├── microservice-gateway/            # 网关服务
└── README.md
```

**模块职责**：

| 模块 | 职责 | 依赖关系 |
|------|------|---------|
| **父 POM** | 统一版本管理、公共依赖 | - |
| **common-core** | 工具类、常量、异常 | - |
| **common-redis** | Redis 工具封装 | common-core |
| **common-web** | 统一响应、异常处理 | common-core |
| **user-api** | 用户服务 API 接口 | common-core |
| **user-service** | 用户服务实现 | user-api, common-* |
| **gateway** | API 网关 | - |

### 1.2 为什么使用多模块结构

**优势**：
- ✅ **代码复用**：公共代码放在 common 模块
- ✅ **依赖管理**：父 POM 统一管理版本
- ✅ **接口隔离**：API 模块独立，避免循环依赖
- ✅ **清晰分层**：职责明确，便于维护

**对比单体项目**：

```
单体项目：
myapp/
├── controller/
├── service/
├── dao/
└── util/

多模块项目：
microservice-demo/
├── common/（可复用）
├── api/（接口定义）
└── service/（业务实现）
```

---

## 2. 父 POM 配置

### 2.1 创建父工程

**pom.xml**（根目录）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>microservice-demo</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <name>microservice-demo</name>
    <description>Spring Cloud 微服务示例项目</description>

    <!-- 子模块 -->
    <modules>
        <module>microservice-common</module>
        <module>microservice-api</module>
        <module>microservice-service</module>
        <module>microservice-gateway</module>
    </modules>

    <!-- 版本管理 -->
    <properties>
        <java.version>11</java.version>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

        <!-- Spring Boot -->
        <spring-boot.version>2.7.18</spring-boot.version>
        
        <!-- Spring Cloud -->
        <spring-cloud.version>2021.0.5</spring-cloud.version>
        
        <!-- Spring Cloud Alibaba -->
        <spring-cloud-alibaba.version>2021.0.5.0</spring-cloud-alibaba.version>

        <!-- 其他依赖 -->
        <mysql.version>8.0.33</mysql.version>
        <druid.version>1.2.20</druid.version>
        <mybatis-plus.version>3.5.3.1</mybatis-plus.version>
        <hutool.version>5.8.22</hutool.version>
        <lombok.version>1.18.30</lombok.version>
    </properties>

    <!-- 依赖管理（只声明版本，不引入） -->
    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Spring Cloud -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Spring Cloud Alibaba -->
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring-cloud-alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- MySQL -->
            <dependency>
                <groupId>mysql</groupId>
                <artifactId>mysql-connector-java</artifactId>
                <version>${mysql.version}</version>
            </dependency>

            <!-- Druid 连接池 -->
            <dependency>
                <groupId>com.alibaba</groupId>
                <artifactId>druid-spring-boot-starter</artifactId>
                <version>${druid.version}</version>
            </dependency>

            <!-- MyBatis Plus -->
            <dependency>
                <groupId>com.baomidou</groupId>
                <artifactId>mybatis-plus-boot-starter</artifactId>
                <version>${mybatis-plus.version}</version>
            </dependency>

            <!-- Hutool 工具类 -->
            <dependency>
                <groupId>cn.hutool</groupId>
                <artifactId>hutool-all</artifactId>
                <version>${hutool.version}</version>
            </dependency>

            <!-- Lombok -->
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <!-- 构建配置 -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <encoding>${project.build.sourceEncoding}</encoding>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2.2 版本对应关系（重要）

**Spring Boot 与 Spring Cloud 对应关系**：

| Spring Boot | Spring Cloud | Spring Cloud Alibaba | JDK |
|-------------|--------------|---------------------|-----|
| 2.6.x | 2021.0.x | 2021.0.5.0 | 8/11 |
| 2.7.x | 2021.0.x | 2021.0.5.0 | 8/11/17 |
| 3.0.x | 2022.0.x | 2022.0.0.0 | 17+ |
| 3.1.x | 2022.0.x | 2022.0.0.0 | 17+ |

**版本选择建议**：
- ✅ **生产推荐**：Spring Boot 2.7.18 + Spring Cloud 2021.0.5
- ✅ **新项目**：Spring Boot 3.0.x +（需要 JDK 17）
- ⚠️ **避免**：Spring Boot 2.4.x 以下（太老）

### 2.3 BOM（Bill of Materials）机制

**什么是 BOM**：
- Maven 提供的依赖版本管理机制
- 通过 `<scope>import</scope>` 导入一组依赖的版本

**优势**：
```xml
<!-- ❌ 不使用 BOM：每个依赖都要指定版本 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
    <version>3.1.5</version> <!-- 手动指定 -->
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    <version>3.1.5</version> <!-- 手动指定 -->
</dependency>

<!-- ✅ 使用 BOM：统一管理版本 -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2021.0.5</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- 子模块使用时不需要指定版本 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
    <!-- 版本由 BOM 管理 -->
</dependency>
```

---

## 3. 公共模块（common）

### 3.1 common-core（核心工具）

**目录结构**：

```
common-core/
├── pom.xml
└── src/main/java/com/example/common/core/
    ├── constant/
    │   └── Constants.java           # 常量定义
    ├── exception/
    │   ├── BusinessException.java   # 业务异常
    │   └── ErrorCode.java           # 错误码枚举
    ├── result/
    │   └── Result.java              # 统一响应
    └── util/
        ├── JsonUtil.java            # JSON 工具
        └── DateUtil.java            # 日期工具
```

**pom.xml**：

```xml
<project>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>microservice-demo</artifactId>
        <version>1.0.0</version>
        <relativePath>../../pom.xml</relativePath>
    </parent>

    <artifactId>common-core</artifactId>
    <packaging>jar</packaging>

    <dependencies>
        <!-- Hutool 工具类 -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</project>
```

**统一响应对象**：

```java
package com.example.common.core.result;

import lombok.Data;
import java.io.Serializable;

@Data
public class Result<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 状态码
     */
    private Integer code;

    /**
     * 响应消息
     */
    private String message;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 时间戳
     */
    private Long timestamp;

    public Result() {
        this.timestamp = System.currentTimeMillis();
    }

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("操作成功");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> fail(String message) {
        return fail(500, message);
    }

    public static <T> Result<T> fail(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}
```

**业务异常**：

```java
package com.example.common.core.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final Integer code;

    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
    }
}
```

**错误码枚举**：

```java
package com.example.common.core.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    
    // 业务错误码
    USER_NOT_FOUND(1001, "用户不存在"),
    USER_ALREADY_EXISTS(1002, "用户已存在"),
    PASSWORD_ERROR(1003, "密码错误");

    private final Integer code;
    private final String message;

    ErrorCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
```

### 3.2 common-web（Web 通用配置）

**全局异常处理**：

```java
package com.example.common.web.exception;

import com.example.common.core.exception.BusinessException;
import com.example.common.core.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        log.error("业务异常：{}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    /**
     * 系统异常
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail("系统异常，请联系管理员");
    }
}
```

**统一日志配置**：

```java
package com.example.common.web.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

@Slf4j
@Aspect
@Component
public class WebLogAspect {

    @Around("execution(* com.example..controller..*.*(..))")
    public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        // 记录请求信息
        log.info("========== Request ==========");
        log.info("URL: {}", request.getRequestURL());
        log.info("Method: {}", request.getMethod());
        log.info("IP: {}", request.getRemoteAddr());
        log.info("Class Method: {}.{}", 
            joinPoint.getSignature().getDeclaringTypeName(),
            joinPoint.getSignature().getName());

        // 执行方法
        Object result = joinPoint.proceed();

        // 记录响应时间
        long endTime = System.currentTimeMillis();
        log.info("Time Cost: {} ms", endTime - startTime);
        log.info("========== Response ==========");

        return result;
    }
}
```

---

## 4. API 模块

### 4.1 user-api（用户服务 API）

**目录结构**：

```
user-api/
├── pom.xml
└── src/main/java/com/example/user/api/
    ├── dto/
    │   ├── UserDTO.java             # 用户传输对象
    │   └── UserQueryDTO.java        # 查询条件
    ├── vo/
    │   └── UserVO.java              # 用户视图对象
    └── client/
        └── UserClient.java          # Feign 客户端接口
```

**pom.xml**：

```xml
<project>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>microservice-api</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>user-api</artifactId>

    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>common-core</artifactId>
            <version>${project.version}</version>
        </dependency>

        <!-- Spring Cloud OpenFeign -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
    </dependencies>
</project>
```

**Feign 客户端接口**：

```java
package com.example.user.api.client;

import com.example.common.core.result.Result;
import com.example.user.api.dto.UserDTO;
import com.example.user.api.vo.UserVO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "user-service", path = "/api/users")
public interface UserClient {

    /**
     * 根据 ID 查询用户
     */
    @GetMapping("/{id}")
    Result<UserVO> getById(@PathVariable Long id);

    /**
     * 创建用户
     */
    @PostMapping
    Result<UserVO> create(@RequestBody UserDTO dto);

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    Result<UserVO> update(@PathVariable Long id, @RequestBody UserDTO dto);

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    Result<Void> delete(@PathVariable Long id);
}
```

**DTO 对象**：

```java
package com.example.user.api.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Data
public class UserDTO {
    
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    private String email;
}
```

**VO 对象**：

```java
package com.example.user.api.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserVO {
    private Long id;
    private String username;
    private String phone;
    private String email;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

---

## 5. 微服务实现

### 5.1 user-service（用户服务）

**目录结构**：

```
user-service/
├── pom.xml
└── src/main/
    ├── java/com/example/user/
    │   ├── UserServiceApplication.java      # 启动类
    │   ├── controller/
    │   │   └── UserController.java
    │   ├── service/
    │   │   ├── UserService.java
    │   │   └── impl/
    │   │       └── UserServiceImpl.java
    │   ├── mapper/
    │   │   └── UserMapper.java
    │   └── entity/
    │       └── User.java
    └── resources/
        ├── application.yml                  # 应用配置
        ├── bootstrap.yml                    # 引导配置
        └── mapper/
            └── UserMapper.xml
```

**pom.xml**：

```xml
<project>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>microservice-service</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>user-service</artifactId>

    <dependencies>
        <!-- API 模块 -->
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>user-api</artifactId>
            <version>${project.version}</version>
        </dependency>

        <!-- Common 模块 -->
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>common-web</artifactId>
            <version>${project.version}</version>
        </dependency>

        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Nacos Discovery -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

        <!-- Nacos Config -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>

        <!-- MySQL -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>

        <!-- MyBatis Plus -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
        </dependency>

        <!-- Druid -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

**启动类**：

```java
package com.example.user;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@MapperScan("com.example.user.mapper")
@SpringBootApplication(scanBasePackages = "com.example")
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

**bootstrap.yml**（优先级高于 application.yml）：

```yaml
spring:
  application:
    name: user-service
  cloud:
    nacos:
      # 服务注册与发现
      discovery:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
      # 配置中心
      config:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
        file-extension: yaml
```

**application.yml**：

```yaml
server:
  port: 8081

spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/user_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: root
    druid:
      initial-size: 5
      min-idle: 5
      max-active: 20

mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.user.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

logging:
  level:
    com.example.user: DEBUG
```

**Controller**：

```java
package com.example.user.controller;

import com.example.common.core.result.Result;
import com.example.user.api.dto.UserDTO;
import com.example.user.api.vo.UserVO;
import com.example.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        UserVO user = userService.getById(id);
        return Result.success(user);
    }

    @PostMapping
    public Result<UserVO> create(@Valid @RequestBody UserDTO dto) {
        UserVO user = userService.create(dto);
        return Result.success(user);
    }

    @PutMapping("/{id}")
    public Result<UserVO> update(@PathVariable Long id, 
                                   @Valid @RequestBody UserDTO dto) {
        UserVO user = userService.update(id, dto);
        return Result.success(user);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return Result.success();
    }
}
```

---

## 6. 网关服务

### 6.1 microservice-gateway

**pom.xml**：

```xml
<project>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>microservice-demo</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>microservice-gateway</artifactId>

    <dependencies>
        <!-- Gateway -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>

        <!-- Nacos Discovery -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

        <!-- LoadBalancer -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
    </dependencies>
</project>
```

**application.yml**：

```yaml
server:
  port: 9000

spring:
  application:
    name: api-gateway
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
    gateway:
      discovery:
        locator:
          enabled: true  # 启用服务发现
          lower-case-service-id: true  # 服务名小写
      routes:
        # 用户服务路由
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=0
        
        # 订单服务路由
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=0

logging:
  level:
    org.springframework.cloud.gateway: DEBUG
```

---

## 7. 快速验证

### 7.1 启动 Nacos Server

```bash
# 下载 Nacos（https://github.com/alibaba/nacos/releases）
# 解压后进入 bin 目录

# Windows
startup.cmd -m standalone

# Linux/Mac
sh startup.sh -m standalone

# 访问控制台：http://localhost:8848/nacos
# 默认账号密码：nacos/nacos
```

### 7.2 启动服务

```bash
# 1. 启动用户服务
cd user-service
mvn spring-boot:run

# 2. 启动网关
cd microservice-gateway
mvn spring-boot:run
```

### 7.3 测试接口

```bash
# 通过网关访问用户服务
curl http://localhost:9000/api/users/1

# 直接访问用户服务
curl http://localhost:8081/api/users/1

# 创建用户
curl -X POST http://localhost:9000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "zhangsan",
    "password": "123456",
    "phone": "13800138000",
    "email": "zhangsan@example.com"
  }'
```

### 7.4 验证服务注册

访问 Nacos 控制台：http://localhost:8848/nacos

应该能看到：
- user-service（1 个实例）
- api-gateway（1 个实例）

---

## 8. 深入一点

### 8.1 依赖传递与排除

**问题**：不同模块引入同一依赖的不同版本，导致冲突

**解决方案**：

```xml
<!-- 排除传递依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- 使用 Undertow 替换 Tomcat -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>
```

### 8.2 多环境配置

**配置文件命名规范**：

```
src/main/resources/
├── application.yml              # 公共配置
├── application-dev.yml          # 开发环境
├── application-test.yml         # 测试环境
└── application-prod.yml         # 生产环境
```

**激活配置**：

```yaml
# application.yml
spring:
  profiles:
    active: @spring.profiles.active@  # Maven 占位符
```

**Maven 配置**：

```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <spring.profiles.active>dev</spring.profiles.active>
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <spring.profiles.active>prod</spring.profiles.active>
        </properties>
    </profile>
</profiles>
```

**打包指定环境**：

```bash
# 开发环境
mvn clean package -Pdev

# 生产环境
mvn clean package -Pprod
```

### 8.3 配置文件加载顺序

**Spring Boot 配置加载顺序**（优先级从高到低）：

1. 命令行参数
2. application-{profile}.properties/yml
3. application.properties/yml
4. bootstrap.properties/yml

**Nacos Config 加载顺序**：

```
bootstrap.yml
    ↓
连接 Nacos Config
    ↓
加载共享配置（shared-configs）
    ↓
加载扩展配置（extension-configs）
    ↓
加载应用配置（${spring.application.name}.yaml）
    ↓
application.yml
```

---

## 9. 面试要点

### 9.1 基础问题

**Q1：为什么使用多模块 Maven 项目结构？**

**回答要点**：
- 代码复用：公共代码统一管理
- 版本管理：父 POM 统一版本
- 清晰分层：职责明确
- 避免循环依赖：API 模块独立

**Q2：Spring Boot 与 Spring Cloud 版本如何对应？**

**回答要点**：
- 必须严格对应，否则会出现兼容性问题
- 查看官方文档版本对应表
- 使用 BOM 管理版本
- 推荐：Spring Boot 2.7.x + Spring Cloud 2021.0.x

### 9.2 进阶问题

**Q3：bootstrap.yml 和 application.yml 的区别？**

| 特性 | bootstrap.yml | application.yml |
|------|--------------|----------------|
| 加载时机 | 更早（ApplicationContext 初始化前） | 较晚 |
| 用途 | 配置中心、服务注册 | 应用配置 |
| 优先级 | 高 | 低 |
| 是否必需 | 不必需 | 必需 |

**使用场景**：
- bootstrap.yml：配置 Nacos Config 地址
- application.yml：配置数据库、端口等

**Q4：如何解决依赖冲突？**

**回答步骤**：
1. 使用 `mvn dependency:tree` 查看依赖树
2. 找到冲突的依赖
3. 使用 `<exclusions>` 排除低版本
4. 在 `<dependencyManagement>` 中指定版本

**示例**：

```bash
# 查看依赖树
mvn dependency:tree > dependency.txt

# 查找冲突
mvn dependency:tree | grep spring-cloud
```

### 9.3 架构问题

**Q5：微服务项目如何划分模块？**

**回答要点**：
- **common 模块**：通用工具、异常、响应
- **api 模块**：Feign 接口定义、DTO/VO
- **service 模块**：业务实现
- **gateway 模块**：网关

**原则**：
- 高内聚低耦合
- 单一职责
- 避免循环依赖

**Q6：如何管理多个微服务的配置？**

**方案一：配置中心**（推荐）
- Nacos Config 统一管理
- 支持动态刷新
- 支持环境隔离

**方案二：Git + Spring Cloud Config**
- Git 仓库存储配置
- Config Server 分发配置

**方案三：K8s ConfigMap**
- 容器化部署
- K8s 原生支持

---

## 10. 参考资料

**官方文档**：
- [Spring Boot 官方文档](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Cloud 官方文档](https://spring.io/projects/spring-cloud)
- [Maven 官方文档](https://maven.apache.org/guides/)

**版本对应关系**：
- [Spring Cloud 版本说明](https://github.com/spring-cloud/spring-cloud-release/wiki/Supported-Versions)
- [Spring Cloud Alibaba 版本说明](https://github.com/alibaba/spring-cloud-alibaba/wiki/%E7%89%88%E6%9C%AC%E8%AF%B4%E6%98%8E)

**工具**：
- [Spring Initializr](https://start.spring.io/)
- [Nacos 下载](https://github.com/alibaba/nacos/releases)

**推荐阅读**：
- 《Maven 实战》- 许晓斌
- 《Spring Boot 实战》- Craig Walls

---

**下一章预告**：第 4 章将深入学习 Nacos Discovery 的快速入门，包括服务注册、服务发现、Nacos 控制台使用等核心功能。

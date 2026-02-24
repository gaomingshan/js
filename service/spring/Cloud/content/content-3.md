# 第3章：微服务项目快速搭建

> **本章目标**：掌握微服务项目结构设计，理解依赖版本管理，能够快速搭建微服务脚手架

---

## 1. 微服务项目结构设计

### 1.1 单体项目 vs 微服务项目

**单体项目结构**：
```
my-app/
├── src/main/java/
│   └── com.example.app/
│       ├── controller/
│       ├── service/
│       ├── dao/
│       └── Application.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

**微服务项目结构**（多模块）：
```
my-cloud-project/
├── cloud-parent/                    # 父工程（依赖管理）
│   └── pom.xml
├── cloud-common/                    # 公共模块（通用工具、实体类）
│   ├── src/
│   └── pom.xml
├── cloud-gateway/                   # 网关服务
│   ├── src/
│   └── pom.xml
├── cloud-user-service/              # 用户服务
│   ├── src/
│   └── pom.xml
├── cloud-order-service/             # 订单服务
│   ├── src/
│   └── pom.xml
└── pom.xml                          # 聚合 POM
```

**核心原则**：
- **父工程**：统一管理依赖版本
- **公共模块**：抽取公共代码（实体类、工具类、常量）
- **业务模块**：每个服务独立模块
- **聚合 POM**：一键构建所有模块

---

### 1.2 推荐项目结构

```
springcloud-demo/
├── demo-parent/                     # 父工程
│   └── pom.xml                      # 依赖版本管理
│
├── demo-common/                     # 公共模块
│   ├── src/main/java/
│   │   └── com.demo.common/
│   │       ├── entity/              # 公共实体类（User、Order）
│   │       ├── dto/                 # 数据传输对象
│   │       ├── vo/                  # 视图对象
│   │       ├── constant/            # 常量类
│   │       ├── enums/               # 枚举类
│   │       ├── exception/           # 自定义异常
│   │       └── util/                # 工具类
│   └── pom.xml
│
├── demo-gateway/                    # 网关服务
│   ├── src/main/java/
│   │   └── com.demo.gateway/
│   │       ├── config/              # 配置类
│   │       ├── filter/              # 自定义过滤器
│   │       └── GatewayApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── bootstrap.yml
│   └── pom.xml
│
├── demo-user-service/               # 用户服务
│   ├── src/main/java/
│   │   └── com.demo.user/
│   │       ├── controller/          # 控制器
│   │       ├── service/             # 业务逻辑
│   │       ├── mapper/              # 数据访问
│   │       ├── entity/              # 实体类（特有）
│   │       └── UserApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── bootstrap.yml
│   │   └── mapper/                  # MyBatis XML
│   └── pom.xml
│
├── demo-order-service/              # 订单服务
│   ├── src/main/java/
│   │   └── com.demo.order/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── mapper/
│   │       ├── feign/               # Feign 客户端
│   │       └── OrderApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── bootstrap.yml
│   │   └── mapper/
│   └── pom.xml
│
└── pom.xml                          # 聚合 POM
```

---

## 2. 依赖版本管理（Spring Cloud BOM）

### 2.1 版本对应关系

Spring Boot、Spring Cloud、Spring Cloud Alibaba 版本必须对应，否则会出现兼容性问题。

**官方推荐版本对应**（2023年）：

| Spring Boot | Spring Cloud | Spring Cloud Alibaba |
|-------------|--------------|----------------------|
| 3.0.x | 2022.0.x (Kilburn) | 2022.0.0.0 |
| 2.7.x | 2021.0.x (Jubilee) | 2021.0.5.0 |
| 2.6.x | 2021.0.x (Jubilee) | 2021.0.5.0 |

**版本查询**：
- Spring Cloud：https://spring.io/projects/spring-cloud
- Spring Cloud Alibaba：https://github.com/alibaba/spring-cloud-alibaba/wiki

---

### 2.2 父工程 POM 配置

**文件位置**：`demo-parent/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.demo</groupId>
    <artifactId>demo-parent</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <name>demo-parent</name>
    <description>Spring Cloud 微服务父工程</description>

    <!-- 统一属性管理 -->
    <properties>
        <java.version>17</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        
        <!-- Spring Boot 版本 -->
        <spring-boot.version>2.7.18</spring-boot.version>
        <!-- Spring Cloud 版本 -->
        <spring-cloud.version>2021.0.8</spring-cloud.version>
        <!-- Spring Cloud Alibaba 版本 -->
        <spring-cloud-alibaba.version>2021.0.5.0</spring-cloud-alibaba.version>
        
        <!-- 其他依赖版本 -->
        <mybatis-plus.version>3.5.5</mybatis-plus.version>
        <mysql.version>8.0.33</mysql.version>
        <druid.version>1.2.20</druid.version>
        <lombok.version>1.18.30</lombok.version>
        <hutool.version>5.8.23</hutool.version>
    </properties>

    <!-- 依赖管理（不会实际引入，子模块可选择性继承） -->
    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot 依赖管理 -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Spring Cloud 依赖管理 -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Spring Cloud Alibaba 依赖管理 -->
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring-cloud-alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- MyBatis Plus -->
            <dependency>
                <groupId>com.baomidou</groupId>
                <artifactId>mybatis-plus-boot-starter</artifactId>
                <version>${mybatis-plus.version}</version>
            </dependency>

            <!-- MySQL 驱动 -->
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

            <!-- Lombok -->
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </dependency>

            <!-- Hutool 工具库 -->
            <dependency>
                <groupId>cn.hutool</groupId>
                <artifactId>hutool-all</artifactId>
                <version>${hutool.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <!-- Maven 编译插件 -->
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

**核心要点**：
- `<packaging>pom</packaging>`：父工程打包类型
- `<properties>`：统一管理版本号
- `<dependencyManagement>`：依赖版本管理（不会实际引入）
- `<type>pom</type>` + `<scope>import</scope>`：导入 BOM

---

### 2.3 聚合 POM 配置

**文件位置**：`pom.xml`（根目录）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.demo</groupId>
    <artifactId>springcloud-demo</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <name>springcloud-demo</name>
    <description>Spring Cloud 微服务聚合工程</description>

    <!-- 聚合子模块 -->
    <modules>
        <module>demo-parent</module>
        <module>demo-common</module>
        <module>demo-gateway</module>
        <module>demo-user-service</module>
        <module>demo-order-service</module>
    </modules>
</project>
```

**作用**：
- 一键构建所有模块：`mvn clean install`
- 统一版本管理

---

### 2.4 公共模块 POM 配置

**文件位置**：`demo-common/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- 继承父工程 -->
    <parent>
        <groupId>com.demo</groupId>
        <artifactId>demo-parent</artifactId>
        <version>1.0.0</version>
        <relativePath>../demo-parent/pom.xml</relativePath>
    </parent>

    <artifactId>demo-common</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>demo-common</name>
    <description>公共模块</description>

    <dependencies>
        <!-- Spring Boot Web（公共模块可能需要） -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>

        <!-- Hutool 工具库 -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
        </dependency>

        <!-- Jackson JSON -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
    </dependencies>
</project>
```

**核心要点**：
- 继承 `demo-parent`（无需写版本号）
- `<packaging>jar</packaging>`：打包成 JAR

---

### 2.5 业务模块 POM 配置

**文件位置**：`demo-user-service/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- 继承父工程 -->
    <parent>
        <groupId>com.demo</groupId>
        <artifactId>demo-parent</artifactId>
        <version>1.0.0</version>
        <relativePath>../demo-parent/pom.xml</relativePath>
    </parent>

    <artifactId>demo-user-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>demo-user-service</name>
    <description>用户服务</description>

    <dependencies>
        <!-- 依赖公共模块 -->
        <dependency>
            <groupId>com.demo</groupId>
            <artifactId>demo-common</artifactId>
            <version>1.0.0</version>
        </dependency>

        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Nacos 服务注册发现 -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

        <!-- Nacos 配置管理 -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>

        <!-- Spring Cloud Bootstrap（2020+ 需要） -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bootstrap</artifactId>
        </dependency>

        <!-- MyBatis Plus -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
        </dependency>

        <!-- MySQL 驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>

        <!-- Druid 连接池 -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Spring Boot 打包插件 -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>2.7.18</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

**核心要点**：
- 依赖公共模块 `demo-common`
- 引入 Nacos、MyBatis Plus 等依赖
- Spring Boot 打包插件（打包成可执行 JAR）

---

## 3. 配置文件设计

### 3.1 bootstrap.yml vs application.yml

**bootstrap.yml**：
- 优先级高于 `application.yml`
- 用于配置配置中心（Nacos Config）
- Spring Cloud 2020+ 需要引入 `spring-cloud-starter-bootstrap` 依赖

**application.yml**：
- 用于配置服务本地配置（数据库、端口等）

**加载顺序**：
```
bootstrap.yml（从 Nacos 拉取配置） 
    ↓
application.yml（本地配置）
    ↓
Nacos 远程配置（覆盖本地配置）
```

---

### 3.2 用户服务配置示例

**bootstrap.yml**（`demo-user-service/src/main/resources/bootstrap.yml`）：

```yaml
spring:
  application:
    name: user-service  # 服务名称（重要）
  
  cloud:
    nacos:
      # Nacos 服务注册发现
      discovery:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
      
      # Nacos 配置管理
      config:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
        file-extension: yaml
        refresh-enabled: true  # 开启动态刷新
        
  profiles:
    active: dev  # 激活环境
```

**application.yml**（`demo-user-service/src/main/resources/application.yml`）：

```yaml
server:
  port: 8001

spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/cloud_user?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: root
    
    # Druid 连接池配置
    druid:
      initial-size: 5
      min-idle: 5
      max-active: 20
      max-wait: 60000
      time-between-eviction-runs-millis: 60000
      min-evictable-idle-time-millis: 300000

# MyBatis Plus 配置
mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.demo.user.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# 日志配置
logging:
  level:
    com.demo.user: debug
```

---

### 3.3 网关服务配置示例

**bootstrap.yml**（`demo-gateway/src/main/resources/bootstrap.yml`）：

```yaml
spring:
  application:
    name: gateway-service
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev
      config:
        server-addr: localhost:8848
        namespace: dev
        file-extension: yaml
        refresh-enabled: true
```

**application.yml**（`demo-gateway/src/main/resources/application.yml`）：

```yaml
server:
  port: 8000

spring:
  cloud:
    gateway:
      # 路由配置
      routes:
        # 用户服务路由
        - id: user-service
          uri: lb://user-service  # lb:// 表示负载均衡
          predicates:
            - Path=/user/**
          filters:
            - StripPrefix=1  # 去掉路径前缀 /user
        
        # 订单服务路由
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/order/**
          filters:
            - StripPrefix=1
      
      # 全局跨域配置
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
            allowedHeaders: "*"
            allowCredentials: true

# 日志配置
logging:
  level:
    org.springframework.cloud.gateway: debug
```

---

## 4. 服务启动类

### 4.1 用户服务启动类

**文件位置**：`demo-user-service/src/main/java/com/demo/user/UserApplication.java`

```java
package com.demo.user;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient  // 开启服务注册发现
@MapperScan("com.demo.user.mapper")  // MyBatis Mapper 扫描
public class UserApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.java, args);
    }
}
```

---

### 4.2 订单服务启动类

**文件位置**：`demo-order-service/src/main/java/com/demo/order/OrderApplication.java`

```java
package com.demo.order;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient  // 开启服务注册发现
@EnableFeignClients  // 开启 Feign 客户端
@MapperScan("com.demo.order.mapper")
public class OrderApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);
    }
}
```

---

### 4.3 网关服务启动类

**文件位置**：`demo-gateway/src/main/java/com/demo/gateway/GatewayApplication.java`

```java
package com.demo.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient  // 开启服务注册发现
public class GatewayApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

---

## 5. 快速验证环境

### 5.1 启动 Nacos Server

**下载 Nacos**：
```bash
# 下载地址：https://github.com/alibaba/nacos/releases
# 解压后进入 bin 目录

# Windows 启动（单机模式）
startup.cmd -m standalone

# Linux/Mac 启动
sh startup.sh -m standalone
```

**访问控制台**：
- 地址：http://localhost:8848/nacos
- 用户名/密码：nacos/nacos

---

### 5.2 构建项目

```bash
# 进入项目根目录
cd springcloud-demo

# 一键构建所有模块
mvn clean install

# 跳过测试
mvn clean install -DskipTests
```

---

### 5.3 启动服务

**启动顺序**：
1. Nacos Server
2. 网关服务（Gateway）
3. 业务服务（User Service、Order Service）

**启动方式**：
```bash
# 方式1：IDEA 启动（推荐开发环境）
# 直接运行 Application 主类

# 方式2：命令行启动
cd demo-user-service
mvn spring-boot:run

# 方式3：JAR 包启动（生产环境）
java -jar demo-user-service-1.0.0.jar
```

---

### 5.4 验证服务注册

**访问 Nacos 控制台**：
- http://localhost:8848/nacos
- 进入"服务管理" → "服务列表"
- 查看是否有 `user-service`、`order-service`、`gateway-service`

**验证效果**：
```
服务列表：
- user-service（1 个实例）
- order-service（1 个实例）
- gateway-service（1 个实例）
```

---

### 5.5 验证网关路由

**测试用户服务**：
```bash
# 直接访问用户服务
curl http://localhost:8001/users/1

# 通过网关访问用户服务
curl http://localhost:8000/user/users/1
```

**验证效果**：
- 两种方式都能正常访问
- 网关会自动路由到用户服务

---

## 6. 实际落地场景与最佳实践

### 6.1 场景1：多环境配置管理

**需求**：
- 本地开发环境（dev）
- 测试环境（test）
- 生产环境（prod）

**方案**：

**bootstrap.yml**：
```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: ${nacos.server-addr:localhost:8848}
        namespace: ${nacos.namespace:dev}  # 环境隔离
        group: DEFAULT_GROUP
        file-extension: yaml
  
  profiles:
    active: ${spring.profiles.active:dev}
```

**启动参数**：
```bash
# 开发环境
java -jar app.jar --spring.profiles.active=dev --nacos.namespace=dev

# 测试环境
java -jar app.jar --spring.profiles.active=test --nacos.namespace=test

# 生产环境
java -jar app.jar --spring.profiles.active=prod --nacos.namespace=prod
```

---

### 6.2 场景2：公共模块抽取

**需求**：
- 多个服务共享实体类（User、Order）
- 多个服务共享工具类（DateUtil、StringUtil）
- 多个服务共享常量（ErrorCode、StatusCode）

**方案**：

**公共模块结构**：
```
demo-common/
└── src/main/java/com/demo/common/
    ├── entity/              # 公共实体类
    │   ├── User.java
    │   └── Order.java
    ├── dto/                 # 数据传输对象
    │   ├── UserDTO.java
    │   └── OrderDTO.java
    ├── vo/                  # 视图对象
    │   └── ResultVO.java
    ├── constant/            # 常量类
    │   ├── ErrorCode.java
    │   └── StatusCode.java
    ├── enums/               # 枚举类
    │   └── UserStatus.java
    ├── exception/           # 自定义异常
    │   └── BusinessException.java
    └── util/                # 工具类
        ├── DateUtil.java
        └── StringUtil.java
```

**ResultVO 统一返回对象**：
```java
package com.demo.common.vo;

import lombok.Data;

@Data
public class ResultVO<T> {
    private Integer code;
    private String message;
    private T data;
    
    public static <T> ResultVO<T> success(T data) {
        ResultVO<T> result = new ResultVO<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        return result;
    }
    
    public static <T> ResultVO<T> fail(Integer code, String message) {
        ResultVO<T> result = new ResultVO<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}
```

---

### 6.3 场景3：服务间调用

**需求**：
- 订单服务调用用户服务获取用户信息

**方案**：

**用户服务提供接口**：
```java
package com.demo.user.controller;

import com.demo.common.entity.User;
import com.demo.common.vo.ResultVO;
import com.demo.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResultVO<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResultVO.success(user);
    }
}
```

**订单服务 Feign 客户端**：
```java
package com.demo.order.feign;

import com.demo.common.entity.User;
import com.demo.common.vo.ResultVO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/users/{id}")
    ResultVO<User> getUserById(@PathVariable Long id);
}
```

**订单服务调用**：
```java
package com.demo.order.service.impl;

import com.demo.common.entity.User;
import com.demo.common.vo.ResultVO;
import com.demo.order.feign.UserClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderServiceImpl {
    
    @Autowired
    private UserClient userClient;
    
    public void createOrder(Long userId) {
        // 调用用户服务获取用户信息
        ResultVO<User> result = userClient.getUserById(userId);
        User user = result.getData();
        
        // 业务逻辑...
    }
}
```

---

### 6.4 场景4：配置文件加密

**需求**：
- 数据库密码等敏感信息不能明文存储

**方案1：Jasypt 加密**：

**引入依赖**：
```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

**application.yml**：
```yaml
jasypt:
  encryptor:
    password: my-secret-key  # 加密密钥（生产环境通过环境变量传入）
    algorithm: PBEWithMD5AndDES

spring:
  datasource:
    password: ENC(encrypted-password)  # 加密后的密码
```

**生成加密密码**：
```java
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;

public class JasyptTest {
    public static void main(String[] args) {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        encryptor.setPassword("my-secret-key");
        encryptor.setAlgorithm("PBEWithMD5AndDES");
        
        String encrypted = encryptor.encrypt("root");
        System.out.println("加密后：" + encrypted);
    }
}
```

---

## 7. 常见问题与易错点

### 7.1 问题1：版本不兼容

**现象**：
```
java.lang.NoClassDefFoundError: org/springframework/cloud/bootstrap/BootstrapConfiguration
```

**原因**：
- Spring Cloud 2020+ 移除了 Bootstrap，需要额外引入

**解决方案**：
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

---

### 7.2 问题2：服务未注册到 Nacos

**现象**：
- Nacos 控制台看不到服务

**排查步骤**：
1. 检查 Nacos Server 是否启动
2. 检查 `bootstrap.yml` 配置是否正确
3. 检查启动类是否添加 `@EnableDiscoveryClient`
4. 查看日志是否有报错

**解决方案**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848  # 确保地址正确
        namespace: dev  # 确保命名空间存在
```

---

### 7.3 问题3：循环依赖

**现象**：
```
The dependencies of some of the beans in the application context form a cycle
```

**原因**：
- 模块之间相互依赖

**解决方案**：
- 重新设计模块划分，避免循环依赖
- 使用事件驱动解耦

---

### 7.4 问题4：打包失败

**现象**：
```
Failed to execute goal org.springframework.boot:spring-boot-maven-plugin
```

**原因**：
- 公共模块不需要打包成可执行 JAR

**解决方案**：

**公共模块 POM**：
```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <skip>true</skip>  <!-- 跳过 Spring Boot 打包 -->
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## 8. 面试准备专项

### 高频面试题

**题目1：如何管理微服务项目的依赖版本？**

**标准回答**：

**第一层（基础回答）**：
使用父工程 POM 统一管理依赖版本，通过 `<dependencyManagement>` 定义版本，子模块继承父工程无需指定版本号。

**第二层（深入原理）**：
- **父工程 POM**：定义 `<dependencyManagement>`，导入 Spring Boot/Spring Cloud BOM
- **聚合 POM**：定义 `<modules>`，一键构建所有模块
- **子模块 POM**：继承父工程，只需声明依赖的 `groupId` 和 `artifactId`
- **版本属性**：在 `<properties>` 中统一管理版本号，便于升级

**第三层（扩展延伸）**：
- BOM（Bill of Materials）机制：通过 `<type>pom</type>` + `<scope>import</scope>` 导入
- 版本冲突解决：Maven 最近依赖原则、路径最短原则
- 依赖排除：`<exclusions>` 排除传递依赖

**加分项**：
- 提到 Spring Cloud 和 Spring Boot 版本对应关系
- 提到依赖版本升级策略（先升级父工程，测试无问题后统一发布）
- 提到使用 Maven Enforcer Plugin 强制版本一致性

---

**题目2：bootstrap.yml 和 application.yml 的区别？**

**标准回答**：

**第一层（基础回答）**：
`bootstrap.yml` 优先级高于 `application.yml`，用于配置配置中心（如 Nacos Config），在应用启动的 Bootstrap 阶段加载。

**第二层（深入原理）**：
- **加载顺序**：`bootstrap.yml` → 从配置中心拉取配置 → `application.yml` → Nacos 远程配置覆盖
- **使用场景**：
  - `bootstrap.yml`：配置中心地址、服务名称、命名空间等
  - `application.yml`：数据库配置、端口号等本地配置
- **优先级**：`bootstrap.yml` > Nacos 远程配置 > `application.yml`

**第三层（扩展延伸）**：
- Spring Cloud 2020+ 默认不加载 `bootstrap.yml`，需要引入 `spring-cloud-starter-bootstrap` 依赖
- Bootstrap ApplicationContext 是父上下文，Application ApplicationContext 是子上下文
- 配置刷新时，只刷新 Application ApplicationContext

**加分项**：
- 提到 `spring.config.import` 的新配置方式
- 提到配置优先级的完整链路
- 提到生产环境的配置管理最佳实践

---

**题目3：微服务项目如何划分模块？**

**标准回答**：

**第一层（基础回答）**：
划分为父工程（依赖管理）、公共模块（通用代码）、业务模块（独立服务）、网关模块（统一入口）。

**第二层（深入原理）**：
- **父工程**：`<packaging>pom</packaging>`，统一管理依赖版本
- **聚合 POM**：定义 `<modules>`，一键构建
- **公共模块**：抽取公共实体类、工具类、常量、异常
- **业务模块**：每个服务一个模块，独立开发、部署
- **网关模块**：统一入口，路由转发

**第三层（扩展延伸）**：
- 模块划分原则：单一职责、高内聚低耦合
- 公共模块避免业务逻辑，只放通用代码
- 业务模块避免循环依赖

**加分项**：
- 提到 DDD 领域驱动设计的模块划分
- 提到公共模块的版本管理（独立版本 vs 统一版本）
- 提到实际项目的模块划分经验

---

## 9. 学习自检清单

- [ ] 能够搭建多模块 Maven 项目
- [ ] 理解父工程、聚合 POM、子模块的关系
- [ ] 掌握 Spring Boot/Spring Cloud 版本对应关系
- [ ] 能够配置 bootstrap.yml 和 application.yml
- [ ] 理解 BOM 机制和依赖版本管理
- [ ] 能够启动 Nacos 并验证服务注册
- [ ] 掌握公共模块的抽取原则
- [ ] 能够排查常见的项目搭建问题

**学习建议**：
- **预计学习时长**：3-4 小时
- **重点难点**：依赖版本管理、模块划分、配置文件设计
- **前置知识**：Maven 基础、Spring Boot 基础
- **实践建议**：动手搭建一个完整的微服务项目

---

## 10. 参考资料

- [Maven 官方文档](https://maven.apache.org/guides/)
- [Spring Boot 版本对应](https://spring.io/projects/spring-cloud)
- [Spring Cloud Alibaba 版本对应](https://github.com/alibaba/spring-cloud-alibaba/wiki/%E7%89%88%E6%9C%AC%E8%AF%B4%E6%98%8E)
- [Nacos 快速开始](https://nacos.io/zh-cn/docs/quick-start.html)

---

**本章小结**：
- 微服务项目采用多模块 Maven 结构，父工程统一管理依赖版本
- 使用 Spring Cloud BOM 管理版本，避免版本冲突
- bootstrap.yml 优先级高于 application.yml，用于配置配置中心
- 公共模块抽取通用代码，业务模块独立开发部署
- 通过 Nacos 控制台验证服务注册，通过网关验证路由转发

**下一章预告**：第4章将详细讲解 Nacos Discovery 的快速入门，包括服务注册、健康检查、Nacos 控制台使用。

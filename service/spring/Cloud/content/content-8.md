# 第8章：Nacos Config 快速入门

> **本章目标**：掌握 Nacos Config 快速接入，理解配置文件命名规范，能够实现配置热更新

---

## 1. 组件引入与快速入门

### 1.1 为什么需要配置中心？

**传统配置管理的问题**：
```
问题1：配置分散
- application.yml 分散在各个服务中
- 修改配置需要修改每个服务

问题2：配置修改需要重启
- 修改数据库连接 → 重启服务
- 修改日志级别 → 重启服务

问题3：多环境配置管理困难
- dev/test/prod 配置需要手动切换
- 容易出错（如生产环境用了测试数据库）

问题4：敏感信息泄露风险
- 数据库密码明文存储在代码仓库
```

**配置中心解决方案**：
```
✅ 集中管理：所有配置集中存储在配置中心
✅ 动态刷新：配置修改后自动推送，无需重启
✅ 环境隔离：通过 namespace 隔离不同环境
✅ 版本管理：配置变更历史可追溯
✅ 配置加密：敏感信息加密存储
```

---

### 1.2 Nacos Config 简介

**核心功能**：
1. **集中管理配置**：所有服务的配置存储在 Nacos Server
2. **动态配置推送**：配置修改后自动推送到服务
3. **命名空间隔离**：dev/test/prod 环境隔离
4. **配置分组**：不同业务线配置分组
5. **配置版本管理**：配置变更历史、回滚
6. **配置监听器**：监听配置变更
7. **灰度发布**：配置灰度发布

**工作流程**：
```
┌─────────────────────────────────────────────────────────┐
│                    Nacos Server                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            配置中心                                │   │
│  │  namespace: dev                                   │   │
│  │    group: DEFAULT_GROUP                           │   │
│  │      data-id: user-service.yaml                   │   │
│  │        content:                                   │   │
│  │          spring:                                  │   │
│  │            datasource:                            │   │
│  │              url: jdbc:mysql://localhost:3306/db  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↑                                ↓
    配置发布                        配置拉取 + 监听
         ↑                                ↓
┌──────────────────┐              ┌──────────────────┐
│  开发者/运维      │              │  user-service    │
│  通过控制台发布   │              │  启动时拉取配置   │
│  配置             │              │  监听配置变更     │
└──────────────────┘              └──────────────────┘
```

---

### 1.3 依赖引入

**pom.xml**：
```xml
<dependencies>
    <!-- Nacos Config -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
    </dependency>

    <!-- Spring Cloud Bootstrap（2020+ 必需） -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-bootstrap</artifactId>
    </dependency>

    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

---

### 1.4 最小化配置

**bootstrap.yml**（优先级高于 application.yml）：
```yaml
spring:
  application:
    name: user-service  # 服务名称（重要！）
  
  cloud:
    nacos:
      config:
        server-addr: localhost:8848  # Nacos Server 地址（必需）
        file-extension: yaml          # 配置文件格式（默认 properties）
```

**application.yml**：
```yaml
server:
  port: 8001
```

**配置文件命名规则**：
```
${spring.application.name}-${spring.profiles.active}.${file-extension}

示例：
user-service-dev.yaml
user-service-test.yaml
user-service-prod.yaml

如果没有指定 profile，则为：
user-service.yaml
```

---

### 1.5 Nacos 控制台发布配置

**步骤1：登录 Nacos 控制台**
- 地址：http://localhost:8848/nacos
- 用户名/密码：nacos/nacos

**步骤2：创建配置**
1. 进入"配置管理" → "配置列表"
2. 点击"+"（新建配置）
3. 填写配置信息：
   - **Data ID**：`user-service.yaml`
   - **Group**：`DEFAULT_GROUP`
   - **配置格式**：YAML
   - **配置内容**：
     ```yaml
     config:
       info: "Hello from Nacos Config"
     ```
4. 点击"发布"

---

### 1.6 快速验证

**测试代码**：
```java
package com.demo.user.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RefreshScope  // 支持配置动态刷新
@RestController
public class ConfigController {
    
    @Value("${config.info}")
    private String configInfo;
    
    @GetMapping("/config")
    public String getConfig() {
        return configInfo;
    }
}
```

**启动服务**：
```bash
cd demo-user-service
mvn spring-boot:run
```

**测试**：
```bash
curl http://localhost:8001/config
# 返回：Hello from Nacos Config
```

**验证动态刷新**：
1. 在 Nacos 控制台修改配置：
   ```yaml
   config:
     info: "Hello from Nacos Config (Updated)"
   ```
2. 点击"发布"
3. 再次访问：
   ```bash
   curl http://localhost:8001/config
   # 返回：Hello from Nacos Config (Updated)
   ```

**✅ 配置自动刷新，无需重启服务！**

---

## 2. bootstrap.yml vs application.yml

### 2.1 配置文件加载顺序

**Spring Boot 配置加载顺序**：
```
1. bootstrap.yml
    ↓
2. 从 Nacos Config 拉取配置
    ↓
3. application.yml
    ↓
4. Nacos 远程配置覆盖本地配置
```

**优先级**（高到低）：
```
1. Nacos 远程配置
2. application.yml
3. bootstrap.yml
```

---

### 2.2 bootstrap.yml 的作用

**为什么需要 bootstrap.yml？**
- **优先加载**：bootstrap.yml 在应用启动的 Bootstrap 阶段加载，早于 application.yml
- **配置配置中心**：配置中心的地址必须在 bootstrap.yml 中
- **父上下文**：Bootstrap ApplicationContext 是父上下文，Application ApplicationContext 是子上下文

**配置内容**：
```yaml
# bootstrap.yml（配置配置中心）
spring:
  application:
    name: user-service
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        namespace: dev
        group: DEFAULT_GROUP

# application.yml（本地配置）
server:
  port: 8001
```

---

### 2.3 Spring Cloud 2020+ 的变化

**问题**：
- Spring Cloud 2020+ 默认不加载 bootstrap.yml
- 需要额外引入依赖

**解决方案**：

**方式1：引入 spring-cloud-starter-bootstrap**（推荐）
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

**方式2：使用 spring.config.import**
```yaml
# application.yml
spring:
  config:
    import:
      - optional:nacos:user-service.yaml
```

---

## 3. 配置文件命名规范

### 3.1 Data ID 命名规则

**完整格式**：
```
${prefix}-${spring.profiles.active}.${file-extension}
```

**参数说明**：
- **prefix**：默认为 `${spring.application.name}`，可通过 `spring.cloud.nacos.config.prefix` 配置
- **spring.profiles.active**：环境标识（dev/test/prod），可选
- **file-extension**：配置文件格式（yaml/properties/json）

**示例**：
```yaml
# bootstrap.yml
spring:
  application:
    name: user-service
  profiles:
    active: dev
  cloud:
    nacos:
      config:
        file-extension: yaml

# Data ID：user-service-dev.yaml
```

**如果没有指定 profile**：
```
Data ID：user-service.yaml
```

---

### 3.2 多配置文件支持

**场景**：
- 公共配置（common.yaml）
- 数据库配置（db.yaml）
- Redis 配置（redis.yaml）
- 服务专属配置（user-service.yaml）

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        
        # 扩展配置（extension-configs）
        extension-configs:
          - data-id: common.yaml
            group: DEFAULT_GROUP
            refresh: true  # 支持动态刷新
          
          - data-id: db.yaml
            group: DEFAULT_GROUP
            refresh: true
          
          - data-id: redis.yaml
            group: DEFAULT_GROUP
            refresh: true
```

**配置优先级**（高到低）：
```
1. user-service-dev.yaml（主配置）
2. extension-configs（扩展配置，后面的优先级高）
3. shared-configs（共享配置）
```

---

### 3.3 共享配置

**场景**：
- 多个服务共享同一份配置（如公共配置）

**配置**：
```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        
        # 共享配置（shared-configs）
        shared-configs:
          - data-id: common.yaml
            group: DEFAULT_GROUP
            refresh: true
```

**extension-configs vs shared-configs**：
- **extension-configs**：扩展配置，优先级高
- **shared-configs**：共享配置，优先级低

**推荐使用 extension-configs**

---

## 4. 配置加载验证

### 4.1 查看配置加载日志

**启动日志**：
```
[Nacos Config] Load config from Nacos success, dataId = user-service.yaml, group = DEFAULT_GROUP
[Nacos Config] Load config from Nacos success, dataId = common.yaml, group = DEFAULT_GROUP
```

**如果加载失败**：
```
[Nacos Config] Load config from Nacos fail, dataId = user-service.yaml, group = DEFAULT_GROUP, error = xxx
```

---

### 4.2 查看当前配置

**Actuator 端点**：

**引入依赖**：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**配置**：
```yaml
management:
  endpoints:
    web:
      exposure:
        include: env  # 暴露 env 端点
```

**查看配置**：
```bash
curl http://localhost:8001/actuator/env
```

**返回**：
```json
{
  "propertySources": [
    {
      "name": "nacos:user-service.yaml",
      "properties": {
        "config.info": {
          "value": "Hello from Nacos Config"
        }
      }
    }
  ]
}
```

---

### 4.3 配置优先级验证

**测试场景**：
- Nacos 配置：`config.info=Nacos`
- application.yml 配置：`config.info=Local`

**验证**：
```bash
curl http://localhost:8001/config
# 返回：Nacos（Nacos 配置优先级高）
```

---

## 5. 配置热更新基础使用

### 5.1 @RefreshScope 注解

**作用**：
- 标记 Bean 支持配置动态刷新
- 配置变更时，重新创建 Bean

**使用**：
```java
@RefreshScope  // 支持配置动态刷新
@RestController
public class ConfigController {
    
    @Value("${config.info}")
    private String configInfo;
    
    @GetMapping("/config")
    public String getConfig() {
        return configInfo;
    }
}
```

**工作原理**：
```
1. Nacos 配置变更
    ↓
2. Nacos Client 收到变更通知（UDP）
    ↓
3. 刷新 Environment
    ↓
4. 销毁 @RefreshScope 标记的 Bean
    ↓
5. 下次调用时，重新创建 Bean（使用最新配置）
```

---

### 5.2 @ConfigurationProperties 动态刷新

**配置类**：
```java
package com.demo.user.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;

@Data
@Component
@RefreshScope  // 支持动态刷新
@ConfigurationProperties(prefix = "user")
public class UserProperties {
    
    private String name;
    private Integer age;
}
```

**Nacos 配置**：
```yaml
user:
  name: zhangsan
  age: 18
```

**使用**：
```java
@RestController
public class UserController {
    
    @Autowired
    private UserProperties userProperties;
    
    @GetMapping("/user")
    public UserProperties getUser() {
        return userProperties;
    }
}
```

**测试**：
```bash
curl http://localhost:8001/user
# 返回：{"name":"zhangsan","age":18}

# 修改 Nacos 配置
# user:
#   name: lisi
#   age: 20

curl http://localhost:8001/user
# 返回：{"name":"lisi","age":20}（自动刷新）
```

---

### 5.3 不支持动态刷新的配置

**以下配置修改后需要重启服务**：
```yaml
server:
  port: 8001  # 端口号（需要重启）

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/db  # 数据源 URL（需要重启）
```

**原因**：
- 端口号在服务启动时绑定，无法动态修改
- 数据库连接池在启动时初始化，无法动态修改

**解决方案**：
- 使用配置中心管理非核心配置
- 核心配置（端口、数据源）建议在 application.yml 中

---

## 6. 实际落地场景与最佳使用

### 6.1 场景1：多环境配置管理

**需求**：
- 开发环境（dev）
- 测试环境（test）
- 生产环境（prod）

**Nacos 创建命名空间**：
1. 进入"命名空间"
2. 创建 dev、test、prod 命名空间

**配置**：
```yaml
# bootstrap.yml
spring:
  application:
    name: user-service
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  cloud:
    nacos:
      config:
        server-addr: ${NACOS_SERVER_ADDR:localhost:8848}
        namespace: ${NACOS_NAMESPACE:dev}
        file-extension: yaml
```

**Nacos 配置**：
```
dev 命名空间：
- user-service-dev.yaml（开发环境配置）

test 命名空间：
- user-service-test.yaml（测试环境配置）

prod 命名空间：
- user-service-prod.yaml（生产环境配置）
```

**启动参数**：
```bash
# 开发环境
java -jar app.jar --SPRING_PROFILES_ACTIVE=dev --NACOS_NAMESPACE=dev

# 测试环境
java -jar app.jar --SPRING_PROFILES_ACTIVE=test --NACOS_NAMESPACE=test

# 生产环境
java -jar app.jar --SPRING_PROFILES_ACTIVE=prod --NACOS_NAMESPACE=prod
```

---

### 6.2 场景2：公共配置管理

**需求**：
- 多个服务共享公共配置（如日志级别、公共常量）

**Nacos 配置**：
```yaml
# common.yaml（公共配置）
logging:
  level:
    root: INFO
    com.demo: DEBUG

common:
  timeout: 5000
  retry: 3
```

**服务配置**：
```yaml
# bootstrap.yml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        
        extension-configs:
          - data-id: common.yaml
            group: DEFAULT_GROUP
            refresh: true
```

---

### 6.3 场景3：数据库配置管理

**需求**：
- 统一管理数据库配置
- 密码加密存储

**Nacos 配置**：
```yaml
# db.yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/user_db?useUnicode=true&characterEncoding=utf8
    username: root
    password: ENC(encrypted-password)  # 加密后的密码
```

**服务配置**：
```yaml
# bootstrap.yml
spring:
  cloud:
    nacos:
      config:
        extension-configs:
          - data-id: db.yaml
            group: DEFAULT_GROUP
            refresh: false  # 数据库配置不支持动态刷新
```

---

### 6.4 场景4：动态日志级别调整

**需求**：
- 生产环境遇到问题，临时调整日志级别为 DEBUG

**Nacos 配置**：
```yaml
# user-service-prod.yaml
logging:
  level:
    root: INFO
    com.demo.user: DEBUG  # 临时调整为 DEBUG
```

**发布配置**：
- 在 Nacos 控制台修改配置
- 点击"发布"
- 服务自动刷新日志级别（无需重启）

**验证**：
```bash
# 查看日志
tail -f logs/spring.log

# 可以看到 DEBUG 级别的日志
```

**问题解决后，恢复日志级别**：
```yaml
logging:
  level:
    com.demo.user: INFO
```

---

## 7. 常见问题与易错点

### 7.1 问题1：配置未生效

**现象**：
- 修改了 Nacos 配置，但服务仍使用旧配置

**原因**：
- 未添加 @RefreshScope 注解
- 配置文件命名错误
- namespace/group 配置错误

**排查步骤**：
```bash
# 1. 检查配置文件命名
# Data ID 必须为：${spring.application.name}-${spring.profiles.active}.${file-extension}

# 2. 检查 namespace 和 group
# bootstrap.yml 中的 namespace 和 group 必须与 Nacos 控制台一致

# 3. 检查 @RefreshScope 注解
# @Value 注解的类必须添加 @RefreshScope

# 4. 查看启动日志
# 查看是否有 "Load config from Nacos success"
```

---

### 7.2 问题2：bootstrap.yml 不生效

**现象**：
- 配置了 bootstrap.yml，但服务启动报错

**原因**：
- Spring Cloud 2020+ 默认不加载 bootstrap.yml
- 未引入 spring-cloud-starter-bootstrap 依赖

**解决方案**：
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

---

### 7.3 问题3：配置文件格式错误

**现象**：
- Nacos 配置无法解析

**原因**：
- YAML 格式缩进错误
- 配置格式与 file-extension 不匹配

**正确配置**：
```yaml
# 正确（注意缩进）
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/db

# 错误（缩进错误）
spring:
datasource:
  url: jdbc:mysql://localhost:3306/db
```

---

### 7.4 问题4：配置优先级混乱

**现象**：
- 不知道哪个配置文件的优先级高

**配置优先级**（高到低）：
```
1. Nacos 远程配置（user-service-dev.yaml）
2. extension-configs（扩展配置，后面的优先级高）
3. shared-configs（共享配置）
4. application.yml（本地配置）
5. bootstrap.yml（启动配置）
```

**验证优先级**：
```bash
curl http://localhost:8001/actuator/env
# 查看配置来源
```

---

## 8. 面试准备专项

### 高频面试题

**题目1：bootstrap.yml 和 application.yml 的区别是什么？**

**标准回答**：

**第一层（基础回答）**：
bootstrap.yml 优先级高于 application.yml，用于配置配置中心地址，在应用启动的 Bootstrap 阶段加载。

**第二层（深入原理）**：
- **加载顺序**：bootstrap.yml → 从配置中心拉取配置 → application.yml → Nacos 远程配置覆盖
- **上下文**：Bootstrap ApplicationContext 是父上下文，Application ApplicationContext 是子上下文
- **使用场景**：
  - bootstrap.yml：配置配置中心地址、服务名、命名空间
  - application.yml：本地配置（端口、数据源）
- **优先级**：Nacos 远程配置 > application.yml > bootstrap.yml

**第三层（扩展延伸）**：
- **Spring Cloud 2020+ 变化**：默认不加载 bootstrap.yml，需要引入 spring-cloud-starter-bootstrap
- **替代方案**：使用 spring.config.import（不推荐，不够灵活）
- **为什么需要 bootstrap.yml**：配置中心地址必须在应用启动早期加载，才能拉取远程配置

**加分项**：
- 提到 Bootstrap ApplicationContext 和 Application ApplicationContext 的关系
- 提到配置加载的完整流程
- 提到实际生产环境的配置管理经验

---

**题目2：Nacos Config 的配置文件命名规则是什么？**

**标准回答**：

**第一层（基础回答）**：
Data ID 命名规则：`${spring.application.name}-${spring.profiles.active}.${file-extension}`

**第二层（深入原理）**：
- **prefix**：默认为 spring.application.name，可通过 spring.cloud.nacos.config.prefix 配置
- **spring.profiles.active**：环境标识（dev/test/prod），可选
- **file-extension**：配置文件格式（yaml/properties/json）
- **示例**：
  - spring.application.name=user-service
  - spring.profiles.active=dev
  - file-extension=yaml
  - Data ID=user-service-dev.yaml

**第三层（扩展延伸）**：
- **多配置文件**：可通过 extension-configs 和 shared-configs 加载多个配置文件
- **配置优先级**：主配置 > extension-configs > shared-configs
- **如果没有 profile**：Data ID 为 user-service.yaml

**加分项**：
- 提到配置文件的 Group 和 Namespace
- 提到配置优先级的完整链路
- 提到实际项目中的配置文件命名规范

---

**题目3：如何实现配置的动态刷新？原理是什么？**

**标准回答**：

**第一层（基础回答）**：
使用 @RefreshScope 注解标记 Bean，配置修改后，Nacos 自动推送通知，服务重新创建 Bean，使用最新配置。

**第二层（深入原理）**：
1. **Nacos 配置变更**：在 Nacos 控制台修改配置
2. **推送通知**：Nacos Server 通过 UDP 推送通知到 Nacos Client
3. **刷新 Environment**：Nacos Client 收到通知后，刷新 Environment
4. **销毁 Bean**：销毁 @RefreshScope 标记的 Bean
5. **重新创建**：下次调用时，重新创建 Bean（使用最新配置）

**第三层（扩展延伸）**：
- **推送机制**：Nacos 使用 UDP 推送（高效、低延迟）
- **长连接优化**：Nacos 2.0 使用 gRPC 长连接替代 HTTP 短连接
- **不支持动态刷新的配置**：端口号、数据库连接池（需要重启）
- **@ConfigurationProperties 动态刷新**：也需要添加 @RefreshScope

**加分项**：
- 提到 Nacos 2.0 的长连接优化
- 提到配置刷新的性能影响（重新创建 Bean 有开销）
- 提到实际生产环境的配置刷新经验

---

## 9. 学习自检清单

- [ ] 能够快速集成 Nacos Config
- [ ] 理解 bootstrap.yml 和 application.yml 的区别
- [ ] 掌握配置文件命名规则
- [ ] 能够在 Nacos 控制台发布配置
- [ ] 理解配置加载顺序和优先级
- [ ] 掌握 @RefreshScope 的使用
- [ ] 能够实现配置动态刷新
- [ ] 能够排查配置未生效等问题
- [ ] 能够流畅回答 Nacos Config 相关面试题

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：bootstrap.yml 作用、配置命名规则、动态刷新原理
- **前置知识**：第4-7章服务注册与发现
- **实践建议**：动手在 Nacos 控制台创建配置，验证动态刷新

---

## 10. 参考资料

- [Nacos Config 官方文档](https://nacos.io/zh-cn/docs/quick-start-spring-cloud.html)
- [Spring Cloud Alibaba 文档](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-config)
- [Spring Cloud Bootstrap 文档](https://spring.io/projects/spring-cloud-commons)

---

**本章小结**：
- Nacos Config 提供集中配置管理、动态配置推送、环境隔离等功能
- bootstrap.yml 优先级高于 application.yml，用于配置配置中心
- 配置文件命名规则：`${spring.application.name}-${spring.profiles.active}.${file-extension}`
- @RefreshScope 注解支持配置动态刷新，无需重启服务
- 配置优先级：Nacos 远程配置 > extension-configs > shared-configs > application.yml
- Spring Cloud 2020+ 需要引入 spring-cloud-starter-bootstrap 依赖

**下一章预告**：第9章将详细讲解 Nacos Config 自定义配置，包括命名空间、分组、配置优先级、配置监听器、配置加密、配置灰度发布等高级特性。

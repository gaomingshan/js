# 第 7 章：Nacos Config 快速入门

> **学习目标**：掌握 Nacos Config 配置中心的基础使用，理解配置加载流程  
> **预计时长**：2-3 小时  
> **难度级别**：⭐⭐⭐ 中等

---

## 1. 核心概念

### 1.1 什么是配置中心

**配置中心**是微服务架构中用于集中管理配置的组件，解决传统配置管理的痛点。

**传统配置管理的问题**：

```
传统方式：
application.properties 硬编码在项目中
    ↓
问题：
1. 修改配置需要重新打包部署
2. 多环境配置管理混乱
3. 配置分散，难以统一管理
4. 敏感信息（数据库密码）暴露在代码中
```

**配置中心的优势**：

```
配置中心方式：
Nacos Config 集中管理配置
    ↓
优势：
1. ✅ 配置动态刷新（无需重启）
2. ✅ 多环境隔离（dev/test/prod）
3. ✅ 配置版本管理
4. ✅ 灰度发布
5. ✅ 配置加密
6. ✅ 权限控制
```

### 1.2 Nacos Config 架构

```
┌─────────────────────────────────────┐
│         Nacos Server                 │
│  ┌──────────────────────────────┐   │
│  │      配置存储（MySQL）        │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │      配置推送（长轮询）       │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │      配置加密                │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
         ↑                 ↓
    拉取配置          推送变更
         │                 │
    ┌─────────────────────────┐
    │   Spring Cloud App      │
    │  ┌──────────────────┐   │
    │  │  @RefreshScope   │   │
    │  └──────────────────┘   │
    └─────────────────────────┘
```

### 1.3 配置加载流程

```
1. 应用启动
   ↓
2. 读取 bootstrap.yml（优先级高）
   ↓
3. 连接 Nacos Config Server
   ↓
4. 根据 namespace/group/dataId 拉取配置
   ↓
5. 合并到 Spring Environment
   ↓
6. 启动监听（订阅配置变更）
   ↓
7. 配置变更后推送到应用
   ↓
8. 触发 @RefreshScope Bean 刷新
```

---

## 2. Nacos Config 依赖引入

### 2.1 添加依赖

**pom.xml**：

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Nacos Config -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
    </dependency>

    <!-- Bootstrap（Spring Cloud 2020+ 需要） -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-bootstrap</artifactId>
    </dependency>
</dependencies>
```

**为什么需要 spring-cloud-starter-bootstrap**：

```
Spring Cloud 2020.0.0 之前：
- bootstrap.yml 默认启用

Spring Cloud 2020.0.0+ 之后：
- bootstrap.yml 默认禁用
- 需要引入 spring-cloud-starter-bootstrap 依赖
```

### 2.2 版本对应关系

| Spring Boot | Spring Cloud Alibaba | 说明 |
|-------------|---------------------|------|
| 2.6.x | 2021.0.5.0 | 推荐 |
| 2.7.x | 2021.0.5.0 | 推荐 |
| 3.0.x | 2022.0.0.0 | JDK 17+ |

---

## 3. bootstrap.yml vs application.yml

### 3.1 配置文件加载顺序

**加载顺序**（优先级从高到低）：

```
1. bootstrap.yml
   ↓
2. Nacos Config（从配置中心拉取）
   ↓
3. application.yml
```

**为什么需要 bootstrap.yml**：

1. **加载时机早**：ApplicationContext 初始化之前
2. **优先级高**：配置不会被 application.yml 覆盖
3. **用途特殊**：配置中心地址、服务注册等基础设施配置

### 3.2 bootstrap.yml 配置

**bootstrap.yml**（最小化配置）：

```yaml
spring:
  application:
    name: user-service  # 服务名称（必须）
  cloud:
    nacos:
      config:
        server-addr: localhost:8848  # Nacos 地址
        file-extension: yaml         # 配置文件格式
```

**bootstrap.yml**（完整配置）：

```yaml
spring:
  application:
    name: user-service
  
  cloud:
    nacos:
      config:
        # ========== 基础配置 ==========
        server-addr: localhost:8848
        username: nacos
        password: nacos
        
        # ========== 命名空间与分组 ==========
        namespace: dev                    # 命名空间 ID
        group: DEFAULT_GROUP              # 分组
        
        # ========== 配置文件 ==========
        file-extension: yaml              # 文件后缀（yaml/properties/json）
        prefix: ${spring.application.name}  # Data ID 前缀（默认为服务名）
        
        # ========== 共享配置 ==========
        shared-configs[0]:
          data-id: common-database.yaml   # 共享配置1
          group: COMMON_GROUP
          refresh: true
        shared-configs[1]:
          data-id: common-redis.yaml      # 共享配置2
          group: COMMON_GROUP
          refresh: true
        
        # ========== 扩展配置 ==========
        extension-configs[0]:
          data-id: user-service-ext.yaml  # 扩展配置
          group: DEFAULT_GROUP
          refresh: true
        
        # ========== 高级配置 ==========
        refresh-enabled: true               # 是否启用动态刷新
        timeout: 3000                       # 超时时间（毫秒）
```

### 3.3 application.yml 配置

**application.yml**（本地配置）：

```yaml
server:
  port: 8081

spring:
  application:
    name: user-service
  
  # 本地数据源配置（可被 Nacos 覆盖）
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/test_db
    username: root
    password: root

# 日志配置
logging:
  level:
    com.example: DEBUG
```

**配置优先级**：

```
Nacos Config（优先级高）
    ↓
application.yml（优先级低）

示例：
Nacos 中配置：spring.datasource.url=jdbc:mysql://prod:3306/prod_db
application.yml：spring.datasource.url=jdbc:mysql://localhost:3306/test_db

最终生效：jdbc:mysql://prod:3306/prod_db（Nacos 配置）
```

---

## 4. 配置文件命名规范

### 4.1 Data ID 命名规则

**完整格式**：

```
${prefix}-${spring.profiles.active}.${file-extension}

示例：
user-service-dev.yaml
user-service-test.yaml
user-service-prod.yaml
```

**参数说明**：

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| prefix | Data ID 前缀 | ${spring.application.name} | user-service |
| spring.profiles.active | 环境标识 | - | dev/test/prod |
| file-extension | 文件后缀 | properties | yaml/properties/json |

### 4.2 配置示例

**场景一：不同环境**

```yaml
# bootstrap.yml
spring:
  application:
    name: user-service
  profiles:
    active: dev  # 开发环境
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
```

**Nacos 中创建配置**：

```
Data ID: user-service-dev.yaml
Group: DEFAULT_GROUP
配置内容：
spring:
  datasource:
    url: jdbc:mysql://dev-db:3306/user_db
    username: dev_user
    password: dev_pass
```

**场景二：公共配置**

```yaml
# bootstrap.yml
spring:
  cloud:
    nacos:
      config:
        # 主配置
        file-extension: yaml
        
        # 共享配置（所有服务共用）
        shared-configs[0]:
          data-id: common-database.yaml
          refresh: true
        shared-configs[1]:
          data-id: common-redis.yaml
          refresh: true
```

**Nacos 中创建共享配置**：

```
Data ID: common-database.yaml
Group: COMMON_GROUP
配置内容：
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
```

### 4.3 配置优先级

**加载顺序**（后加载的覆盖先加载的）：

```
1. shared-configs[0]
   ↓
2. shared-configs[1]
   ↓
3. extension-configs[0]
   ↓
4. ${prefix}.${file-extension}
   ↓
5. ${prefix}-${spring.profiles.active}.${file-extension}
```

**示例**：

```yaml
# shared-configs[0]: common-database.yaml
spring:
  datasource:
    url: jdbc:mysql://common-db:3306/common

# user-service-dev.yaml
spring:
  datasource:
    url: jdbc:mysql://dev-db:3306/user_db

# 最终生效：jdbc:mysql://dev-db:3306/user_db
# 原因：user-service-dev.yaml 后加载，覆盖共享配置
```

---

## 5. 配置加载验证

### 5.1 创建 Nacos 配置

**登录 Nacos 控制台**：http://localhost:8848/nacos

**步骤**：

1. 导航：配置管理 → 配置列表
2. 点击：➕ 创建配置
3. 填写信息：
   - **Data ID**：`user-service-dev.yaml`
   - **Group**：`DEFAULT_GROUP`
   - **配置格式**：YAML
   - **配置内容**：
     ```yaml
     user:
       name: zhangsan
       age: 25
       email: zhangsan@example.com
     
     app:
       title: 用户服务
       version: 1.0.0
     ```
4. 点击：发布

### 5.2 读取配置

**方式一：@Value 注解**

```java
@RestController
@RequestMapping("/config")
public class ConfigController {

    @Value("${user.name}")
    private String userName;

    @Value("${user.age}")
    private Integer userAge;

    @Value("${app.title}")
    private String appTitle;

    @GetMapping("/info")
    public Map<String, Object> getConfig() {
        Map<String, Object> map = new HashMap<>();
        map.put("userName", userName);
        map.put("userAge", userAge);
        map.put("appTitle", appTitle);
        return map;
    }
}
```

**方式二：@ConfigurationProperties**（推荐）

```java
@Data
@Component
@ConfigurationProperties(prefix = "user")
public class UserConfig {
    private String name;
    private Integer age;
    private String email;
}

@RestController
@RequestMapping("/config")
@RequiredArgsConstructor
public class ConfigController {

    private final UserConfig userConfig;

    @GetMapping("/user")
    public UserConfig getUserConfig() {
        return userConfig;
    }
}
```

### 5.3 启动应用验证

**启动日志**：

```
2024-01-01 10:00:00 INFO [user-service] : Located property source: [BootstrapPropertySource {name='bootstrapProperties-user-service-dev.yaml,DEFAULT_GROUP'}]
2024-01-01 10:00:01 INFO [user-service] : The following 1 profile is active: "dev"
2024-01-01 10:00:02 INFO [user-service] : Started UserServiceApplication in 3.5 seconds
```

**访问接口**：

```bash
curl http://localhost:8081/config/info

# 返回
{
  "userName": "zhangsan",
  "userAge": 25,
  "appTitle": "用户服务"
}
```

---

## 6. 配置热更新基础使用

### 6.1 @RefreshScope 注解

**什么是 @RefreshScope**：

- Spring Cloud 提供的注解
- 标记在 Bean 上，支持配置动态刷新
- 配置变更后，销毁旧 Bean，创建新 Bean

**使用方式**：

```java
@RestController
@RequestMapping("/config")
@RefreshScope  // 启用配置刷新
public class ConfigController {

    @Value("${user.name}")
    private String userName;

    @Value("${app.title}")
    private String appTitle;

    @GetMapping("/info")
    public Map<String, Object> getConfig() {
        Map<String, Object> map = new HashMap<>();
        map.put("userName", userName);
        map.put("appTitle", appTitle);
        map.put("timestamp", System.currentTimeMillis());
        return map;
    }
}
```

### 6.2 动态刷新测试

**步骤**：

1. **启动应用**

2. **访问接口**
   ```bash
   curl http://localhost:8081/config/info
   # 返回：{"userName": "zhangsan", "appTitle": "用户服务"}
   ```

3. **修改 Nacos 配置**
   - 登录 Nacos 控制台
   - 找到 `user-service-dev.yaml`
   - 修改配置：
     ```yaml
     user:
       name: lisi  # 修改为 lisi
     app:
       title: 用户服务 v2  # 修改标题
     ```
   - 点击：发布

4. **再次访问接口**（无需重启应用）
   ```bash
   curl http://localhost:8081/config/info
   # 返回：{"userName": "lisi", "appTitle": "用户服务 v2"}
   ```

**刷新日志**：

```
2024-01-01 10:05:00 INFO [user-service] : Refresh keys changed: [user.name, app.title]
2024-01-01 10:05:01 INFO [user-service] : Refreshing beans: [configController]
```

### 6.3 @ConfigurationProperties 自动刷新

**优势**：

- ✅ 无需 @RefreshScope 注解
- ✅ 自动绑定配置
- ✅ 支持复杂数据结构

**示例**：

```java
@Data
@Component
@ConfigurationProperties(prefix = "user")
public class UserConfig {
    private String name;
    private Integer age;
    private String email;
    private List<String> hobbies;
    private Map<String, String> metadata;
}

// 使用
@RestController
@RequiredArgsConstructor
public class ConfigController {

    private final UserConfig userConfig;  // 自动刷新

    @GetMapping("/user")
    public UserConfig getUserConfig() {
        return userConfig;  // 配置变更后自动更新
    }
}
```

**Nacos 配置**：

```yaml
user:
  name: zhangsan
  age: 25
  email: zhangsan@example.com
  hobbies:
    - reading
    - coding
    - gaming
  metadata:
    city: beijing
    level: senior
```

---

## 7. 配置文件格式

### 7.1 支持的格式

**Nacos Config 支持三种格式**：

| 格式 | 后缀 | 适用场景 |
|------|------|---------|
| YAML | yaml/yml | 推荐，层级清晰 |
| Properties | properties | 简单配置 |
| JSON | json | 结构化数据 |

### 7.2 YAML 格式（推荐）

```yaml
# user-service-dev.yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/user_db
    username: root
    password: root
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20

user:
  name: zhangsan
  age: 25
  hobbies:
    - reading
    - coding

app:
  features:
    payment: true
    notification: false
```

**优势**：
- ✅ 层级结构清晰
- ✅ 支持复杂数据结构
- ✅ 可读性好

### 7.3 Properties 格式

```properties
# user-service-dev.properties
spring.datasource.url=jdbc:mysql://localhost:3306/user_db
spring.datasource.username=root
spring.datasource.password=root

user.name=zhangsan
user.age=25
user.hobbies[0]=reading
user.hobbies[1]=coding

app.features.payment=true
app.features.notification=false
```

**优势**：
- ✅ 简单直观
- ✅ 兼容性好

**劣势**：
- ❌ 复杂配置不友好
- ❌ 易出错（拼写）

### 7.4 JSON 格式

```json
{
  "spring": {
    "datasource": {
      "url": "jdbc:mysql://localhost:3306/user_db",
      "username": "root",
      "password": "root"
    }
  },
  "user": {
    "name": "zhangsan",
    "age": 25,
    "hobbies": ["reading", "coding"]
  }
}
```

**使用场景**：
- 配置导入导出
- API 调用返回配置

---

## 8. 实战案例

### 8.1 多环境配置管理

**场景**：用户服务需要在 dev/test/prod 环境使用不同配置

**bootstrap.yml**：

```yaml
spring:
  application:
    name: user-service
  profiles:
    active: @spring.profiles.active@  # Maven 占位符
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        namespace: ${NACOS_NAMESPACE:dev}  # 环境变量
        file-extension: yaml
```

**Nacos 配置**：

```
1. 创建命名空间：
   - dev（命名空间ID）
   - test
   - prod

2. 在每个命名空间创建配置：
   Data ID: user-service-dev.yaml
   
   dev 环境：
   spring:
     datasource:
       url: jdbc:mysql://dev-db:3306/user_db
   
   test 环境：
   spring:
     datasource:
       url: jdbc:mysql://test-db:3306/user_db
   
   prod 环境：
   spring:
     datasource:
       url: jdbc:mysql://prod-db:3306/user_db
```

**部署脚本**：

```bash
# 开发环境
java -jar -Dspring.profiles.active=dev -DNACOS_NAMESPACE=dev user-service.jar

# 测试环境
java -jar -Dspring.profiles.active=test -DNACOS_NAMESPACE=test user-service.jar

# 生产环境
java -jar -Dspring.profiles.active=prod -DNACOS_NAMESPACE=prod user-service.jar
```

### 8.2 公共配置共享

**场景**：多个服务共享数据库、Redis 配置

**共享配置**：

```yaml
# bootstrap.yml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        
        # 共享配置
        shared-configs:
          - data-id: common-database.yaml
            group: COMMON_GROUP
            refresh: true
          
          - data-id: common-redis.yaml
            group: COMMON_GROUP
            refresh: true
          
          - data-id: common-mq.yaml
            group: COMMON_GROUP
            refresh: true
```

**Nacos 中创建共享配置**：

```yaml
# common-database.yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      connection-timeout: 30000

# common-redis.yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: redis123
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0

# common-mq.yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

**优势**：
- ✅ 配置统一管理
- ✅ 修改一处，所有服务生效
- ✅ 减少配置冗余

---

## 9. 常见问题排查

### 9.1 配置未加载

**现象**：应用启动后配置未生效

**排查步骤**：

1. **检查 bootstrap.yml 是否存在**
   ```bash
   ls -l src/main/resources/bootstrap.yml
   ```

2. **检查依赖**
   ```xml
   <!-- Spring Cloud 2020+ 必需 -->
   <dependency>
       <groupId>org.springframework.cloud</groupId>
       <artifactId>spring-cloud-starter-bootstrap</artifactId>
   </dependency>
   ```

3. **检查配置**
   ```yaml
   spring:
     application:
       name: user-service  # 必须配置
     cloud:
       nacos:
         config:
           server-addr: localhost:8848  # 地址正确
           file-extension: yaml  # 格式匹配
   ```

4. **查看启动日志**
   ```
   # 正常日志
   Located property source: [BootstrapPropertySource {name='bootstrapProperties-user-service-dev.yaml'}]
   
   # 异常日志
   Could not locate PropertySource: Connection refused
   ```

### 9.2 配置不刷新

**现象**：修改 Nacos 配置后不生效

**解决方案**：

1. **检查 @RefreshScope 注解**
   ```java
   @RefreshScope  // 必须添加
   @RestController
   public class ConfigController {
       @Value("${user.name}")
       private String userName;
   }
   ```

2. **检查刷新配置**
   ```yaml
   spring:
     cloud:
       nacos:
         config:
           refresh-enabled: true  # 必须为 true
   ```

3. **检查配置项是否支持刷新**
   ```yaml
   # ✅ 支持刷新
   user.name=zhangsan
   app.title=用户服务
   
   # ❌ 不支持刷新（框架内部配置）
   server.port=8081
   spring.datasource.url=jdbc:mysql://localhost:3306/db
   ```

### 9.3 Data ID 找不到

**现象**：启动报错 `config data not found`

**检查清单**：

| 检查项 | 正确示例 |
|--------|---------|
| Data ID | `user-service-dev.yaml` |
| Group | `DEFAULT_GROUP` |
| Namespace | `dev` |
| 文件后缀 | `yaml` |

**示例**：

```yaml
# bootstrap.yml
spring:
  application:
    name: user-service  # Data ID 前缀
  profiles:
    active: dev  # 环境标识
  cloud:
    nacos:
      config:
        namespace: dev  # 命名空间 ID
        group: DEFAULT_GROUP
        file-extension: yaml

# Nacos 中 Data ID 必须为：user-service-dev.yaml
```

---

## 10. 面试要点

### 10.1 基础问题

**Q1：bootstrap.yml 和 application.yml 的区别？**

| 维度 | bootstrap.yml | application.yml |
|------|--------------|----------------|
| 加载时机 | 早（ApplicationContext 之前） | 晚 |
| 用途 | 配置中心地址、服务注册 | 应用配置 |
| 优先级 | 高 | 低 |
| 是否必需 | 使用配置中心时必需 | 必需 |

**Q2：Nacos Config 的 Data ID 命名规则是什么？**

**格式**：`${prefix}-${spring.profiles.active}.${file-extension}`

**示例**：`user-service-dev.yaml`

### 10.2 进阶问题

**Q3：配置动态刷新的原理是什么？**

**流程**：
1. Nacos 配置变更
2. 推送变更事件到客户端（长轮询）
3. 客户端收到事件，触发 RefreshEvent
4. 销毁 @RefreshScope Bean
5. 下次访问时重新创建 Bean（新配置）

**Q4：如何实现配置的优先级控制？**

**加载顺序**（后加载覆盖先加载）：
1. shared-configs
2. extension-configs
3. ${prefix}.${file-extension}
4. ${prefix}-${active}.${file-extension}

### 10.3 架构问题

**Q5：如何设计多环境配置管理？**

**方案**：
1. **Namespace 隔离**：dev/test/prod
2. **统一命名**：user-service-{env}.yaml
3. **环境变量**：-DNACOS_NAMESPACE=prod

**Q6：配置中心的高可用如何保证？**

**措施**：
1. Nacos 集群部署
2. MySQL 数据持久化
3. 客户端本地缓存
4. 配置快照

---

## 11. 参考资料

**官方文档**：
- [Nacos Config 文档](https://nacos.io/zh-cn/docs/quick-start-spring-cloud.html)
- [Spring Cloud Alibaba 配置管理](https://spring-cloud-alibaba-group.github.io/github-pages/hoxton/zh-cn/index.html#_spring_cloud_alibaba_nacos_config)

**推荐阅读**：
- [配置管理最佳实践](https://nacos.io/zh-cn/docs/config-center.html)
- [动态配置原理](https://nacos.io/zh-cn/docs/architecture.html)

---

**下一章预告**：第 8 章将深入学习 Nacos Config 自定义配置，包括命名空间、分组、配置优先级、共享配置、扩展配置、配置监听器原理等高级特性。

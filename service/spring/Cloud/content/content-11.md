# 第11章：Spring Cloud Config 实践

> **本章目标**：掌握 Spring Cloud Config 的使用，理解基于 Git 的配置管理方案，能够对比 Config 和 Nacos Config

---

## 1. 组件引入与快速入门

### 1.1 Spring Cloud Config 简介

**定位**：Spring Cloud 官方配置管理组件，基于 Git/SVN 仓库存储配置。

**架构**：
```
┌─────────────────────────────────────────────────────────┐
│                   Git Repository                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  config-repo/                                     │   │
│  │    ├── user-service-dev.yml                       │   │
│  │    ├── user-service-test.yml                      │   │
│  │    ├── user-service-prod.yml                      │   │
│  │    └── common.yml                                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↑
         │ 拉取配置
         ↓
┌─────────────────────────────────────────────────────────┐
│                   Config Server                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  配置服务器                                        │   │
│  │  - 从 Git 拉取配置                                 │   │
│  │  - 缓存配置                                        │   │
│  │  - 提供 HTTP 接口                                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↑
         │ HTTP 请求
         ↓
┌─────────────────────────────────────────────────────────┐
│                   Config Client                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  user-service                                     │   │
│  │  - 启动时从 Config Server 拉取配置                 │   │
│  │  - 本地缓存配置                                    │   │
│  │  - 监听配置变更                                    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**核心特性**：
- ✅ 基于 Git/SVN 存储配置
- ✅ 多环境配置（{application}-{profile}.yml）
- ✅ 配置加密解密
- ✅ 配置版本管理（Git 历史）
- ✅ 配置审计（Git commit 记录）
- ❌ 不支持配置推送（需手动触发 /actuator/refresh）
- ❌ 无可视化控制台

---

### 1.2 Config Server 搭建

#### 步骤1：创建 Git 仓库

**GitHub/GitLab 创建仓库**：
```
仓库名：config-repo
目录结构：
config-repo/
├── user-service-dev.yml
├── user-service-test.yml
├── user-service-prod.yml
└── common.yml
```

**配置文件示例**：

**user-service-dev.yml**：
```yaml
server:
  port: 8001

config:
  env: dev
  message: "Hello from Config Server (dev)"
```

**user-service-prod.yml**：
```yaml
server:
  port: 8001

config:
  env: prod
  message: "Hello from Config Server (prod)"
```

**common.yml**：
```yaml
logging:
  level:
    root: INFO
    com.demo: DEBUG
```

---

#### 步骤2：创建 Config Server

**pom.xml**：
```xml
<dependencies>
    <!-- Config Server -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-config-server</artifactId>
    </dependency>

    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

**启动类**：
```java
package com.demo.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@SpringBootApplication
@EnableConfigServer  // 开启 Config Server
public class ConfigServerApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

**application.yml**：
```yaml
server:
  port: 8888  # Config Server 端口

spring:
  application:
    name: config-server
  
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-username/config-repo  # Git 仓库地址
          search-paths: config  # 配置文件搜索路径（可选）
          default-label: main   # 默认分支
          # username: your-username  # Git 用户名（私有仓库需要）
          # password: your-password  # Git 密码
```

**启动验证**：
```bash
cd demo-config-server
mvn spring-boot:run

# 访问配置
curl http://localhost:8888/user-service/dev
```

**返回**：
```json
{
  "name": "user-service",
  "profiles": ["dev"],
  "label": "main",
  "version": "commit-id",
  "state": null,
  "propertySources": [
    {
      "name": "https://github.com/your-username/config-repo/user-service-dev.yml",
      "source": {
        "server.port": 8001,
        "config.env": "dev",
        "config.message": "Hello from Config Server (dev)"
      }
    }
  ]
}
```

---

### 1.3 Config Client 配置

**pom.xml**：
```xml
<dependencies>
    <!-- Config Client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
    </dependency>

    <!-- Spring Cloud Bootstrap -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-bootstrap</artifactId>
    </dependency>

    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Actuator（用于配置刷新） -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
</dependencies>
```

**bootstrap.yml**：
```yaml
spring:
  application:
    name: user-service  # 应用名称
  
  profiles:
    active: dev  # 环境
  
  cloud:
    config:
      uri: http://localhost:8888  # Config Server 地址
      label: main  # Git 分支
      fail-fast: true  # 连接失败时快速失败
```

**测试代码**：
```java
@RefreshScope
@RestController
public class ConfigController {
    
    @Value("${config.message}")
    private String message;
    
    @GetMapping("/config")
    public String getConfig() {
        return message;
    }
}
```

**启动验证**：
```bash
curl http://localhost:8001/config
# 返回：Hello from Config Server (dev)
```

---

## 2. Git 仓库配置管理

### 2.1 配置文件命名规则

**命名规则**：
```
{application}-{profile}.yml
{application}-{profile}.properties
{application}.yml
```

**优先级**（高到低）：
```
1. user-service-dev.yml（应用 + 环境）
2. user-service.yml（应用）
3. common.yml（公共配置）
```

---

### 2.2 多环境配置

**目录结构**：
```
config-repo/
├── user-service-dev.yml    # 开发环境
├── user-service-test.yml   # 测试环境
├── user-service-prod.yml   # 生产环境
└── common.yml              # 公共配置
```

**访问不同环境**：
```bash
# 开发环境
curl http://localhost:8888/user-service/dev

# 测试环境
curl http://localhost:8888/user-service/test

# 生产环境
curl http://localhost:8888/user-service/prod
```

---

### 2.3 多应用配置

**目录结构**：
```
config-repo/
├── user-service-dev.yml
├── user-service-test.yml
├── order-service-dev.yml
├── order-service-test.yml
└── common.yml
```

---

### 2.4 配置目录结构

**按环境分目录**：
```
config-repo/
├── dev/
│   ├── user-service.yml
│   ├── order-service.yml
│   └── common.yml
├── test/
│   ├── user-service.yml
│   ├── order-service.yml
│   └── common.yml
└── prod/
    ├── user-service.yml
    ├── order-service.yml
    └── common.yml
```

**Config Server 配置**：
```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-username/config-repo
          search-paths: '{profile}'  # 根据 profile 搜索目录
```

---

## 3. 配置加密解密

### 3.1 对称加密

**安装 JCE**：
- 下载 JCE Unlimited Strength Jurisdiction Policy Files
- 放到 JDK 的 jre/lib/security 目录

**Config Server 配置**：
```yaml
encrypt:
  key: my-secret-key  # 对称加密密钥
```

**加密配置**：
```bash
# 加密
curl http://localhost:8888/encrypt -d "root123"
# 返回：AQCXxxx...（密文）

# 解密
curl http://localhost:8888/decrypt -d "AQCXxxx..."
# 返回：root123（明文）
```

**使用加密配置**：
```yaml
# user-service-dev.yml
spring:
  datasource:
    username: root
    password: '{cipher}AQCXxxx...'  # 使用 {cipher} 前缀
```

**自动解密**：
- Config Client 从 Config Server 拉取配置时，自动解密
- 应用中使用的是解密后的明文

---

### 3.2 非对称加密（推荐）

**生成密钥对**：
```bash
# 生成 keystore
keytool -genkeypair -alias config-server -keyalg RSA \
  -keystore config-server.jks -keysize 2048 -storepass mypassword
```

**Config Server 配置**：
```yaml
encrypt:
  key-store:
    location: classpath:config-server.jks
    password: mypassword
    alias: config-server
    secret: mypassword
```

**加密/解密**：
```bash
# 加密
curl http://localhost:8888/encrypt -d "root123"

# 解密
curl http://localhost:8888/decrypt -d "密文"
```

---

## 4. 配置刷新机制

### 4.1 手动刷新（/actuator/refresh）

**Config Client 配置**：
```yaml
management:
  endpoints:
    web:
      exposure:
        include: refresh  # 暴露 refresh 端点
```

**刷新配置**：
```bash
# 1. 修改 Git 仓库中的配置
# 2. 提交并推送
git add .
git commit -m "update config"
git push

# 3. 手动触发刷新
curl -X POST http://localhost:8001/actuator/refresh
```

**返回**：
```json
["config.message"]  # 变更的配置项
```

**缺点**：
- 需要手动触发每个服务实例
- 服务实例多时，操作繁琐

---

### 4.2 Spring Cloud Bus 消息总线

**原理**：
```
1. 修改 Git 配置
    ↓
2. 触发任意一个服务实例的 /actuator/bus-refresh
    ↓
3. 该实例发送消息到 RabbitMQ/Kafka
    ↓
4. 所有实例监听消息
    ↓
5. 所有实例自动刷新配置
```

**引入依赖**：
```xml
<!-- Spring Cloud Bus -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

**配置 RabbitMQ**：
```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

management:
  endpoints:
    web:
      exposure:
        include: bus-refresh  # 暴露 bus-refresh 端点
```

**刷新配置**：
```bash
# 触发任意一个实例的 bus-refresh
curl -X POST http://localhost:8001/actuator/bus-refresh

# 所有实例自动刷新配置
```

---

### 4.3 WebHook 自动刷新

**GitHub WebHook 配置**：
1. 进入 GitHub 仓库设置
2. 添加 WebHook
3. Payload URL：http://your-config-server:8888/monitor
4. Content type：application/json
5. Events：Just the push event

**Config Server 配置**：
```xml
<!-- Spring Cloud Config Monitor -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-monitor</artifactId>
</dependency>
```

**工作流程**：
```
1. 开发者提交配置到 Git
    ↓
2. GitHub 触发 WebHook
    ↓
3. Config Server 收到通知
    ↓
4. Config Server 发送消息到 Bus
    ↓
5. 所有 Config Client 自动刷新
```

---

## 5. Config vs Nacos Config 对比

### 5.1 功能对比

| 维度 | Spring Cloud Config | Nacos Config |
|------|---------------------|--------------|
| **存储** | Git/SVN | 内置数据库 |
| **动态刷新** | 手动触发 | 自动推送 |
| **控制台** | 无 | 有（功能丰富） |
| **配置监听** | 不支持 | 支持 |
| **配置加密** | 支持 | 支持 |
| **版本管理** | Git 历史 | 内置版本管理 |
| **配置审计** | Git commit | 内置审计日志 |
| **性能** | 中（需访问 Config Server） | 高（本地缓存） |
| **复杂度** | 高（需搭建 Git、Config Server） | 低（一体化） |
| **推荐度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

### 5.2 架构对比

**Spring Cloud Config**：
```
Git 仓库 → Config Server → Config Client
- 需要维护 Git 仓库
- 需要搭建 Config Server
- 配置刷新需要手动触发或 Bus
```

**Nacos Config**：
```
Nacos Server（配置存储 + 推送）
- 一体化方案
- 自动推送配置变更
- 可视化控制台
```

---

### 5.3 优劣势对比

**Spring Cloud Config 优势**：
- ✅ Git 天然支持版本管理
- ✅ Git commit 提供完整的审计记录
- ✅ 基于 Git 的多人协作

**Spring Cloud Config 劣势**：
- ❌ 需要搭建 Config Server
- ❌ 配置刷新需要手动触发
- ❌ 无可视化控制台
- ❌ 性能较低（需访问 Config Server 和 Git）

**Nacos Config 优势**：
- ✅ 一体化方案（服务注册 + 配置管理）
- ✅ 自动推送配置变更
- ✅ 可视化控制台
- ✅ 性能高（本地缓存）

**Nacos Config 劣势**：
- ❌ 需要单独部署 Nacos Server
- ❌ 配置审计不如 Git 完善

---

### 5.4 选型建议

**选择 Spring Cloud Config**：
- ✅ 已有 Git 仓库管理配置
- ✅ 需要完整的配置审计（Git commit）
- ✅ 配置变更不频繁

**选择 Nacos Config**：
- ✅ 新项目（推荐）
- ✅ 需要动态配置推送
- ✅ 需要可视化控制台
- ✅ 对性能要求高

**混合使用**：
- Config Server 管理生产配置（审计、版本管理）
- Nacos Config 管理开发/测试配置（动态刷新）

---

## 6. 实际落地场景

### 6.1 场景1：多环境配置管理

**Git 仓库结构**：
```
config-repo/
├── dev/
│   ├── user-service.yml
│   └── common.yml
├── test/
│   ├── user-service.yml
│   └── common.yml
└── prod/
    ├── user-service.yml
    └── common.yml
```

**Config Server 配置**：
```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-username/config-repo
          search-paths: '{profile}'
```

**Config Client 配置**：
```yaml
spring:
  profiles:
    active: ${ENV:dev}
  cloud:
    config:
      uri: http://localhost:8888
```

**启动参数**：
```bash
# 开发环境
java -jar app.jar --ENV=dev

# 测试环境
java -jar app.jar --ENV=test

# 生产环境
java -jar app.jar --ENV=prod
```

---

### 6.2 场景2：配置加密

**生产环境数据库配置**：
```yaml
# prod/user-service.yml
spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/user_db
    username: '{cipher}AQCXxxx...'  # 加密后的用户名
    password: '{cipher}AQCYyyy...'  # 加密后的密码
```

**加密步骤**：
```bash
# 1. 加密用户名
curl http://localhost:8888/encrypt -d "prod_user"

# 2. 加密密码
curl http://localhost:8888/encrypt -d "prod_password"

# 3. 将密文写入配置文件
```

---

### 6.3 场景3：配置审计

**查看配置变更历史**：
```bash
# 查看 Git 提交历史
git log --oneline prod/user-service.yml

# 查看具体变更
git show commit-id
```

**回滚配置**：
```bash
# 回滚到指定版本
git revert commit-id
git push

# 刷新配置
curl -X POST http://localhost:8001/actuator/refresh
```

---

## 7. 常见问题与易错点

### 7.1 问题1：Config Client 启动失败

**现象**：
```
Could not locate PropertySource: 404 Not Found
```

**原因**：
- Config Server 未启动
- Git 仓库中没有对应的配置文件
- 配置文件命名错误

**排查步骤**：
```bash
# 1. 检查 Config Server 是否启动
curl http://localhost:8888/actuator/health

# 2. 检查配置文件是否存在
curl http://localhost:8888/user-service/dev

# 3. 检查配置文件命名
# 必须为：{spring.application.name}-{spring.profiles.active}.yml
```

---

### 7.2 问题2：配置刷新不生效

**现象**：
- 触发了 /actuator/refresh，但配置未刷新

**原因**：
- 未添加 @RefreshScope 注解
- Git 仓库配置未提交

**解决方案**：
```java
@RefreshScope  // 必须添加
@RestController
public class ConfigController {
    @Value("${config.message}")
    private String message;
}
```

```bash
# 确保 Git 配置已提交
git add .
git commit -m "update config"
git push
```

---

### 7.3 问题3：Bus 刷新失败

**现象**：
- 触发了 /actuator/bus-refresh，但其他实例未刷新

**原因**：
- RabbitMQ 未启动
- 其他实例未连接 RabbitMQ

**排查步骤**：
```bash
# 1. 检查 RabbitMQ 是否启动
docker ps | grep rabbitmq

# 2. 检查服务是否连接 RabbitMQ
# 查看日志是否有连接成功的信息
```

---

## 8. 面试准备专项

### 高频面试题

**题目1：Spring Cloud Config 和 Nacos Config 的区别？如何选择？**

**标准回答**：

**第一层（基础回答）**：
Config 基于 Git 存储配置，需手动刷新；Nacos Config 基于数据库存储，支持自动推送。新项目推荐 Nacos Config。

**第二层（深入原理）**：
- **存储**：Config（Git/SVN）vs Nacos（内置数据库）
- **刷新**：Config（手动触发/Bus）vs Nacos（自动推送）
- **控制台**：Config（无）vs Nacos（功能丰富）
- **性能**：Config（中，需访问 Config Server）vs Nacos（高，本地缓存）
- **版本管理**：Config（Git 历史）vs Nacos（内置版本）
- **审计**：Config（Git commit）vs Nacos（审计日志）

**第三层（扩展延伸）**：
- **Config 优势**：Git 天然支持版本管理和审计
- **Nacos 优势**：一体化、自动推送、可视化
- **选型建议**：新项目选 Nacos，已有 Git 配置的老项目可以继续用 Config

**加分项**：
- 提到具体的使用场景和经验
- 提到 Spring Cloud Bus 的原理
- 提到混合使用的方案

---

**题目2：如何实现 Spring Cloud Config 的配置加密？**

**标准回答**：

**第一层（基础回答）**：
使用 Config Server 的 /encrypt 端点加密配置，配置中使用 {cipher} 前缀，Config Client 自动解密。

**第二层（深入原理）**：
1. **对称加密**：配置 encrypt.key
2. **非对称加密**：配置 encrypt.key-store（推荐）
3. **加密**：curl http://config-server/encrypt -d "明文"
4. **配置**：password: '{cipher}密文'
5. **自动解密**：Config Client 拉取配置时自动解密

**第三层（扩展延伸）**：
- **密钥管理**：生产环境通过环境变量传入密钥
- **JCE**：需要安装 JCE Unlimited Strength
- **对比 Nacos**：Nacos 也支持配置加密（Jasypt）

**加分项**：
- 提到密钥的安全管理方案
- 提到非对称加密的优势
- 提到实际生产环境的配置加密经验

---

**题目3：Spring Cloud Bus 的工作原理是什么？**

**标准回答**：

**第一层（基础回答）**：
Spring Cloud Bus 通过消息队列（RabbitMQ/Kafka）实现配置刷新事件的广播，触发一个实例的 /actuator/bus-refresh，所有实例自动刷新。

**第二层（深入原理）**：
1. **触发刷新**：POST /actuator/bus-refresh
2. **发送消息**：该实例发送 RefreshRemoteApplicationEvent 到消息队列
3. **广播**：所有实例监听消息队列
4. **接收消息**：其他实例收到消息
5. **刷新配置**：所有实例调用 ContextRefresher.refresh()

**第三层（扩展延伸）**：
- **消息队列**：支持 RabbitMQ 和 Kafka
- **事件类型**：RefreshRemoteApplicationEvent、EnvironmentChangeEvent
- **对比 Nacos**：Nacos 使用 UDP/gRPC 推送，性能更高

**加分项**：
- 提到 Spring Cloud Bus 的源码实现
- 提到与 Nacos 推送机制的对比
- 提到实际使用经验

---

## 9. 学习自检清单

- [ ] 能够搭建 Config Server
- [ ] 理解 Git 仓库配置管理
- [ ] 掌握 Config Client 配置
- [ ] 掌握配置加密解密
- [ ] 理解配置刷新机制
- [ ] 掌握 Spring Cloud Bus 使用
- [ ] 能够对比 Config 和 Nacos Config
- [ ] 能够根据场景选择合适的配置中心
- [ ] 能够排查 Config 相关问题

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：Git 仓库管理、配置刷新、Spring Cloud Bus
- **前置知识**：第8-10章 Nacos Config
- **实践建议**：搭建 Config Server，体验 Git 配置管理

---

## 10. 参考资料

- [Spring Cloud Config 官方文档](https://spring.io/projects/spring-cloud-config)
- [Spring Cloud Bus 官方文档](https://spring.io/projects/spring-cloud-bus)
- [Config Server GitHub](https://github.com/spring-cloud/spring-cloud-config)

---

**本章小结**：
- Spring Cloud Config 基于 Git/SVN 存储配置，支持版本管理和审计
- Config Server 从 Git 拉取配置，提供 HTTP 接口
- Config Client 从 Config Server 拉取配置，需手动触发刷新
- Spring Cloud Bus 通过消息队列实现配置自动刷新
- 支持配置加密（对称加密/非对称加密）
- 相比 Nacos Config，Config 更适合已有 Git 配置管理的项目
- 新项目推荐使用 Nacos Config（一体化、自动推送、可视化）

**下一章预告**：第12章将介绍配置中心生产最佳实践，包括配置分层管理策略、配置版本管理与回滚、配置权限控制、敏感信息加密、配置变更审计、多环境配置隔离、配置中心选型建议、常见问题排查。

# 第 4 章：Nacos Discovery 快速入门

> **学习目标**：掌握 Nacos 服务注册与发现的基础使用，理解服务注册发现流程  
> **预计时长**：2-3 小时  
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

### 1.1 什么是 Nacos

**Nacos**（Dynamic Naming and Configuration Service）是阿里巴巴开源的动态服务发现、配置管理和服务管理平台。

**核心功能**：
- **服务注册与发现**：自动注册服务，动态发现服务实例
- **配置管理**：集中管理配置，支持动态刷新
- **健康检查**：实时监控服务健康状态
- **元数据管理**：存储服务的自定义元数据

**架构图**：

```
┌─────────────────────────────────────────┐
│         Nacos Server                     │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  服务注册表   │  │  配置中心    │    │
│  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  健康检查     │  │  控制台      │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
         ↑                 ↑
    注册/心跳          拉取服务列表
         │                 │
    ┌─────────┐      ┌─────────┐
    │Provider │      │Consumer │
    └─────────┘      └─────────┘
```

### 1.2 服务注册与发现流程

**服务注册流程**：

```
1. Provider 启动
   ↓
2. 读取配置（spring.application.name、nacos 地址）
   ↓
3. 向 Nacos Server 注册服务
   ↓
4. Nacos Server 存储服务信息
   ↓
5. Provider 定时发送心跳（保持活跃）
```

**服务发现流程**：

```
1. Consumer 启动
   ↓
2. 从 Nacos Server 拉取服务列表
   ↓
3. 缓存服务列表到本地
   ↓
4. 监听服务变更（订阅）
   ↓
5. 服务变更时推送通知
   ↓
6. Consumer 更新本地缓存
```

### 1.3 Nacos vs Eureka

| 特性 | Nacos | Eureka |
|------|-------|--------|
| **CAP** | CP + AP（可切换） | AP |
| **健康检查** | TCP/HTTP/MySQL | Client Beat |
| **雪崩保护** | 支持 | 支持（自我保护） |
| **自动注销** | 支持 | 支持 |
| **访问协议** | HTTP + gRPC | HTTP |
| **控制台** | 功能强大 | 基础 |
| **配置管理** | ✅ 内置 | ❌ 不支持 |
| **多数据中心** | ✅ 支持 | ⚠️ 复杂 |
| **维护状态** | ✅ 活跃 | ⚠️ 维护中 |

---

## 2. Nacos Server 安装与启动

### 2.1 下载 Nacos

**下载地址**：https://github.com/alibaba/nacos/releases

**版本选择**：
- ✅ 推荐：2.2.0+（稳定版）
- ⚠️ 避免：1.x 版本（功能较少）

### 2.2 单机模式启动

**Windows**：

```bash
# 解压 nacos-server-2.2.0.zip

# 进入 bin 目录
cd nacos/bin

# 单机模式启动
startup.cmd -m standalone
```

**Linux/Mac**：

```bash
# 解压
tar -xvf nacos-server-2.2.0.tar.gz

# 进入 bin 目录
cd nacos/bin

# 赋予执行权限
chmod +x startup.sh

# 单机模式启动
sh startup.sh -m standalone
```

**验证启动**：

```bash
# 查看日志
tail -f ../logs/start.out

# 看到以下信息说明启动成功
Nacos started successfully in stand alone mode.
```

### 2.3 访问控制台

**访问地址**：http://localhost:8848/nacos

**默认账号**：
- 用户名：`nacos`
- 密码：`nacos`

**控制台功能**：
- 服务管理：查看注册的服务列表
- 配置管理：管理配置文件
- 命名空间：环境隔离
- 集群管理：查看集群状态

### 2.4 修改端口（可选）

**配置文件**：`conf/application.properties`

```properties
# 修改端口
server.port=8848

# 修改数据库（生产环境推荐）
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://localhost:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useSSL=false
db.user=root
db.password=root
```

**初始化数据库**：

```sql
-- 执行 conf/nacos-mysql.sql
-- 创建 nacos 数据库和表
```

---

## 3. 服务注册

### 3.1 添加依赖

**pom.xml**：

```xml
<dependencies>
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
</dependencies>
```

### 3.2 最小化配置

**bootstrap.yml**（推荐）：

```yaml
spring:
  application:
    name: user-service  # 服务名称（重要）
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848  # Nacos 地址
```

**application.yml**：

```yaml
server:
  port: 8081

spring:
  application:
    name: user-service
```

**为什么使用 bootstrap.yml**：
- bootstrap.yml 优先级高于 application.yml
- 服务注册在应用启动早期进行
- 配置中心需要在 bootstrap 阶段加载

### 3.3 启动类配置

**方式一：使用 @EnableDiscoveryClient**（推荐）

```java
package com.example.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient  // 启用服务发现
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

**方式二：Spring Cloud 2020+ 自动注册**

```java
// Spring Cloud 2020.0.0+ 版本可以省略 @EnableDiscoveryClient
// 引入依赖后自动启用服务注册
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

### 3.4 验证服务注册

**启动服务**：

```bash
mvn spring-boot:run
```

**查看日志**：

```
2024-01-01 10:00:00 INFO [user-service] : Nacos naming client started. serverAddr=localhost:8848
2024-01-01 10:00:01 INFO [user-service] : Register service user-service successful
```

**Nacos 控制台验证**：

访问：http://localhost:8848/nacos/index.html

导航：服务管理 → 服务列表

应该看到：
- 服务名称：user-service
- 集群数量：1
- 实例数：1
- 健康实例数：1

**查看实例详情**：

```
IP：127.0.0.1
端口：8081
权重：1.0
健康状态：✅ 健康
元数据：preserved.register.source=SPRING_CLOUD
```

---

## 4. 服务发现

### 4.1 创建消费者服务

**order-service（订单服务）**：

```yaml
# bootstrap.yml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
```

```yaml
# application.yml
server:
  port: 8082
```

### 4.2 通过 DiscoveryClient 发现服务

**方式一：使用 DiscoveryClient**

```java
package com.example.order.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryClient discoveryClient;

    /**
     * 获取所有服务列表
     */
    @GetMapping("/services")
    public List<String> getServices() {
        return discoveryClient.getServices();
    }

    /**
     * 获取指定服务的实例列表
     */
    @GetMapping("/instances")
    public List<ServiceInstance> getInstances() {
        List<ServiceInstance> instances = 
            discoveryClient.getInstances("user-service");
        
        instances.forEach(instance -> {
            log.info("服务实例：{}:{}", 
                instance.getHost(), instance.getPort());
        });
        
        return instances;
    }
}
```

**测试接口**：

```bash
# 获取所有服务
curl http://localhost:8082/services
# 返回：["user-service", "order-service"]

# 获取 user-service 实例
curl http://localhost:8082/instances
# 返回：[{"host":"127.0.0.1","port":8081,...}]
```

### 4.3 通过 RestTemplate 调用服务

**配置 RestTemplate**：

```java
package com.example.order.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced  // 启用负载均衡
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

**调用服务**：

```java
package com.example.order.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final RestTemplate restTemplate;

    /**
     * 调用 user-service 查询用户
     */
    @GetMapping("/orders/{userId}")
    public String getOrder(@PathVariable Long userId) {
        // 使用服务名调用（不需要 IP 和端口）
        String url = "http://user-service/api/users/" + userId;
        String user = restTemplate.getForObject(url, String.class);
        
        return "订单所属用户：" + user;
    }
}
```

**重点说明**：
- ✅ `http://user-service`：使用服务名（不是 IP:Port）
- ✅ `@LoadBalanced`：RestTemplate 会从 Nacos 获取实例列表
- ✅ 自动负载均衡：多个实例时轮询调用

---

## 5. 服务健康检查

### 5.1 健康检查机制

**Nacos 支持三种健康检查方式**：

1. **Client Beat（客户端心跳）**
   - 客户端定期发送心跳（默认 5 秒）
   - 超过 15 秒未收到心跳标记为不健康
   - 超过 30 秒自动注销

2. **Server Check（服务端检查）**
   - Nacos 主动检查服务（HTTP/TCP）
   - 适用于持久化实例

3. **MySQL Check**
   - 检查数据库连接
   - 适用于数据库服务

### 5.2 配置健康检查

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        heart-beat-interval: 5000      # 心跳间隔（毫秒）
        heart-beat-timeout: 15000      # 心跳超时（毫秒）
        ip-delete-timeout: 30000       # 实例删除超时（毫秒）
```

### 5.3 自定义健康检查端点

**Spring Boot Actuator**：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health  # 暴露健康检查端点
  endpoint:
    health:
      show-details: always
```

**访问健康检查**：

```bash
curl http://localhost:8081/actuator/health

# 返回
{
  "status": "UP",
  "components": {
    "diskSpace": {"status": "UP"},
    "ping": {"status": "UP"}
  }
}
```

### 5.4 模拟服务下线

**手动下线**：

```java
@RestController
@RequiredArgsConstructor
public class ServiceController {

    private final NacosRegistration nacosRegistration;
    private final NacosServiceRegistry nacosServiceRegistry;

    /**
     * 手动下线服务
     */
    @PostMapping("/deregister")
    public String deregister() {
        nacosServiceRegistry.deregister(nacosRegistration);
        return "服务已下线";
    }

    /**
     * 手动上线服务
     */
    @PostMapping("/register")
    public String register() {
        nacosServiceRegistry.register(nacosRegistration);
        return "服务已上线";
    }
}
```

**观察控制台**：
- 下线后：健康实例数变为 0
- 上线后：健康实例数恢复为 1

---

## 6. Nacos 控制台使用

### 6.1 服务列表

**路径**：服务管理 → 服务列表

**功能**：
- 查看所有注册的服务
- 查看服务实例数量
- 查看健康实例数
- 查看集群信息

**操作**：
- **详情**：查看实例详细信息
- **示例代码**：查看服务调用代码示例
- **编辑**：修改服务元数据

### 6.2 实例详情

**点击服务名 → 详情**

**显示信息**：
- **IP**：实例 IP 地址
- **端口**：服务端口
- **权重**：负载均衡权重（0-10000）
- **健康状态**：健康/不健康
- **元数据**：自定义元数据
- **集群名称**：所属集群

**操作**：
- **上线**：手动上线实例
- **下线**：手动下线实例（不删除）
- **编辑**：修改权重、元数据

### 6.3 订阅者列表

**功能**：查看哪些服务订阅了当前服务

**示例**：
```
user-service 的订阅者：
- order-service（订阅中）
- payment-service（订阅中）
```

**作用**：
- 查看服务依赖关系
- 排查服务调用问题

### 6.4 服务路由

**功能**：配置服务路由规则

**示例**：
```yaml
# 灰度发布规则
version: v1  # 只路由到 v1 版本
weight: 0.1  # 10% 流量到新版本
```

---

## 7. 深入一点

### 7.1 临时实例 vs 持久化实例

**临时实例**（Ephemeral Instance）：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: true  # 默认为 true
```

**特点**：
- ✅ 默认模式
- ✅ 客户端主动心跳
- ✅ 超时自动注销
- ✅ AP 模式（可用性优先）

**持久化实例**（Persistent Instance）：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false  # 持久化实例
```

**特点**：
- ✅ 服务端主动检查
- ✅ 不会自动注销
- ✅ CP 模式（一致性优先）
- ⚠️ 需要手动删除

**对比总结**：

| 特性 | 临时实例 | 持久化实例 |
|------|---------|-----------|
| 心跳方式 | 客户端发送 | 服务端检查 |
| 自动注销 | ✅ 支持 | ❌ 不支持 |
| CAP | AP | CP |
| 适用场景 | 动态实例（容器） | 静态实例（虚拟机） |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

### 7.2 服务分组（Group）

**配置分组**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        group: PROD_GROUP  # 生产环境分组
```

**不同分组的服务不能互相发现**：

```
DEV_GROUP:
  - user-service-dev
  - order-service-dev

PROD_GROUP:
  - user-service-prod
  - order-service-prod
```

**使用场景**：
- 环境隔离（dev/test/prod）
- 业务隔离（电商/支付/物流）
- 灰度发布

### 7.3 命名空间（Namespace）

**配置命名空间**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev  # 命名空间 ID
```

**创建命名空间**：
1. 登录 Nacos 控制台
2. 命名空间 → 新建命名空间
3. 填写命名空间 ID 和名称

**命名空间隔离**：

```
public（默认）
  ├─ user-service
  └─ order-service

dev（开发环境）
  ├─ user-service
  └─ order-service

prod（生产环境）
  ├─ user-service
  └─ order-service
```

**区别总结**：

| 隔离级别 | Namespace | Group |
|---------|-----------|-------|
| 隔离强度 | 强（完全隔离） | 弱（逻辑隔离） |
| 使用场景 | 环境隔离 | 业务分组 |
| 配置共享 | ❌ 不共享 | ✅ 可共享 |

### 7.4 元数据（Metadata）

**配置元数据**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        metadata:
          version: 1.0.0          # 版本号
          region: beijing         # 地域
          env: prod               # 环境
          team: backend           # 团队
```

**使用元数据**：

```java
@RestController
@RequiredArgsConstructor
public class MetadataController {

    private final DiscoveryClient discoveryClient;

    @GetMapping("/metadata")
    public Map<String, String> getMetadata() {
        List<ServiceInstance> instances = 
            discoveryClient.getInstances("user-service");
        
        if (!instances.isEmpty()) {
            return instances.get(0).getMetadata();
        }
        return Collections.emptyMap();
    }
}
```

**应用场景**：
- 灰度发布（version 路由）
- 地域路由（region 优先）
- 权限控制（team 鉴权）

---

## 8. 实战案例

### 8.1 多实例负载均衡

**启动多个实例**：

```bash
# 实例1
java -jar user-service.jar --server.port=8081

# 实例2
java -jar user-service.jar --server.port=8082

# 实例3
java -jar user-service.jar --server.port=8083
```

**验证负载均衡**：

```java
@RestController
@RequiredArgsConstructor
public class OrderController {

    private final RestTemplate restTemplate;

    @GetMapping("/test-lb")
    public String testLoadBalance() {
        StringBuilder result = new StringBuilder();
        
        // 调用 10 次，观察负载均衡
        for (int i = 0; i < 10; i++) {
            String response = restTemplate.getForObject(
                "http://user-service/api/info", String.class);
            result.append(response).append("\n");
        }
        
        return result.toString();
    }
}
```

**user-service 接口**：

```java
@RestController
public class InfoController {

    @Value("${server.port}")
    private String port;

    @GetMapping("/api/info")
    public String info() {
        return "当前端口：" + port;
    }
}
```

**测试结果**：

```
当前端口：8081
当前端口：8082
当前端口：8083
当前端口：8081
当前端口：8082
...
```

**结论**：默认使用轮询策略

### 8.2 服务优雅上下线

**优雅下线**：

```java
@RestController
@RequiredArgsConstructor
public class ShutdownController {

    private final ApplicationContext applicationContext;

    /**
     * 优雅下线
     */
    @PostMapping("/shutdown")
    public String shutdown() {
        // 1. 从 Nacos 注销服务
        SpringApplication.exit(applicationContext, () -> 0);
        
        // 2. 等待正在处理的请求完成
        // 3. 关闭应用
        
        return "服务即将关闭";
    }
}
```

**配置优雅下线**：

```yaml
server:
  shutdown: graceful  # 优雅关闭

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s  # 超时时间
```

**测试优雅下线**：

```bash
# 1. 发送请求
curl http://localhost:8081/api/long-task

# 2. 在请求处理过程中关闭服务
curl -X POST http://localhost:8081/shutdown

# 3. 观察：服务等待请求完成后再关闭
```

---

## 9. 常见问题排查

### 9.1 服务注册失败

**现象**：服务启动后在 Nacos 控制台看不到

**排查步骤**：

1. **检查 Nacos Server 是否启动**
   ```bash
   curl http://localhost:8848/nacos/v1/console/health
   ```

2. **检查网络连接**
   ```bash
   ping localhost
   telnet localhost 8848
   ```

3. **检查配置**
   ```yaml
   spring:
     cloud:
       nacos:
         discovery:
           server-addr: localhost:8848  # 地址是否正确
     application:
       name: user-service  # 服务名是否配置
   ```

4. **查看启动日志**
   ```
   错误信息：Connection refused
   原因：Nacos Server 未启动
   
   错误信息：Service name can not be empty
   原因：spring.application.name 未配置
   ```

### 9.2 服务发现失败

**现象**：调用服务时报错 `No instances available`

**排查步骤**：

1. **确认服务已注册**
   - 登录 Nacos 控制台
   - 查看服务列表
   - 确认健康实例数 > 0

2. **检查服务名是否正确**
   ```java
   // 服务名要与注册的名称一致
   String url = "http://user-service/api/users/1";
   // 不是 http://user_service
   ```

3. **检查 @LoadBalanced 注解**
   ```java
   @Bean
   @LoadBalanced  // 必须添加
   public RestTemplate restTemplate() {
       return new RestTemplate();
   }
   ```

4. **检查命名空间和分组**
   ```yaml
   # Provider 和 Consumer 必须在同一 namespace 和 group
   spring:
     cloud:
       nacos:
         discovery:
           namespace: dev
           group: DEFAULT_GROUP
   ```

### 9.3 心跳超时

**现象**：服务频繁被标记为不健康

**原因**：
- 网络不稳定
- 服务负载过高
- 心跳间隔配置不当

**解决方案**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 10000  # 增加心跳间隔
        heart-beat-timeout: 30000   # 增加超时时间
```

---

## 10. 面试要点

### 10.1 基础问题

**Q1：Nacos 服务注册与发现的流程是什么？**

**回答要点**：
1. **服务注册**
   - Provider 启动时向 Nacos 注册
   - Nacos 存储服务信息
   - Provider 定时发送心跳

2. **服务发现**
   - Consumer 从 Nacos 拉取服务列表
   - 缓存到本地
   - 订阅服务变更
   - 收到变更通知后更新缓存

**Q2：Nacos 如何实现健康检查？**

**回答要点**：
- **临时实例**：客户端心跳（默认 5 秒）
- **持久化实例**：服务端检查（HTTP/TCP）
- **超时机制**：15 秒不健康，30 秒注销

### 10.2 进阶问题

**Q3：临时实例和持久化实例的区别？**

| 维度 | 临时实例 | 持久化实例 |
|------|---------|-----------|
| 心跳 | 客户端 | 服务端 |
| 注销 | 自动 | 手动 |
| CAP | AP | CP |
| 场景 | 容器化 | 虚拟机 |

**Q4：Nacos 的 Namespace、Group、Service 的关系？**

```
Namespace（环境隔离）
  └─ Group（业务分组）
      └─ Service（具体服务）
          └─ Cluster（集群）
              └─ Instance（实例）
```

**关系**：
- Namespace > Group > Service
- 不同 Namespace 完全隔离
- 同一 Group 内的服务可互相发现

### 10.3 架构问题

**Q5：如何保证服务注册的高可用？**

**回答要点**：
1. **Nacos 集群部署**
   - 多节点部署（3+ 节点）
   - 数据持久化到 MySQL

2. **客户端容错**
   - 本地缓存服务列表
   - 失败重试机制

3. **健康检查**
   - 及时剔除不健康实例
   - 自我保护机制

**Q6：Nacos 和 Eureka 的区别？**

**核心区别**：
- **CAP**：Nacos 支持 CP+AP，Eureka 仅 AP
- **功能**：Nacos 支持配置管理，Eureka 不支持
- **性能**：Nacos 使用 gRPC，性能更好
- **维护**：Nacos 活跃，Eureka 维护中

---

## 11. 参考资料

**官方文档**：
- [Nacos 官方文档](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Spring Cloud Alibaba 文档](https://spring-cloud-alibaba-group.github.io/github-pages/hoxton/zh-cn/index.html)

**下载地址**：
- [Nacos Server 下载](https://github.com/alibaba/nacos/releases)

**快速开始**：
- [Nacos Spring Cloud 快速开始](https://nacos.io/zh-cn/docs/quick-start-spring-cloud.html)

**推荐阅读**：
- [Nacos 架构与原理](https://nacos.io/zh-cn/docs/architecture.html)
- [服务发现最佳实践](https://nacos.io/zh-cn/docs/best-practice.html)

---

**下一章预告**：第 5 章将深入学习 Nacos Discovery 的自定义配置，包括命名空间、分组、元数据、健康检查、AP/CP 模式切换等高级特性，以及服务注册发现的底层原理和源码分析。

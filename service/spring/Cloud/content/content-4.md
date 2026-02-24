# 第4章：Nacos Discovery 快速入门

> **本章目标**：掌握 Nacos 服务注册与发现的快速接入，理解服务注册发现的基本流程，能够使用 Nacos 控制台管理服务

---

## 1. 组件引入与快速入门

### 1.1 为什么需要服务注册与发现？

**传统方式的问题**：
```java
// 硬编码服务地址
String url = "http://192.168.1.100:8001/users/" + userId;
RestTemplate restTemplate = new RestTemplate();
User user = restTemplate.getForObject(url, User.class);
```

**痛点**：
- ❌ 服务地址硬编码，难以维护
- ❌ 服务实例变化（扩容、缩容、故障）无法动态感知
- ❌ 无法实现负载均衡
- ❌ 服务健康检查困难

**服务注册发现解决方案**：
```
服务提供者 → 注册到 Nacos
服务消费者 → 从 Nacos 获取服务实例列表 → 负载均衡调用
Nacos → 健康检查 → 自动剔除故障实例
```

---

### 1.2 Nacos 简介

**Nacos**（**Na**ming and **Co**nfiguration **S**ervice）：
- 阿里开源的服务注册发现 + 配置管理平台
- Dynamic Naming and Configuration Service
- 构建云原生应用的动态服务发现、配置管理和服务管理平台

**核心功能**：
1. **服务注册与发现**
2. **配置管理**（下一章详解）
3. **健康检查**
4. **动态 DNS 服务**
5. **服务元数据管理**

**官方地址**：
- GitHub：https://github.com/alibaba/nacos
- 官方文档：https://nacos.io/zh-cn/

---

### 1.3 Nacos Server 安装与启动

#### 方式1：下载安装包（推荐）

**下载**：
```bash
# 下载地址：https://github.com/alibaba/nacos/releases
# 推荐版本：2.2.3 或更高版本
wget https://github.com/alibaba/nacos/releases/download/2.2.3/nacos-server-2.2.3.tar.gz

# 解压
tar -zxvf nacos-server-2.2.3.tar.gz
cd nacos
```

**启动**：

**Windows**：
```bash
# 进入 bin 目录
cd bin

# 单机模式启动
startup.cmd -m standalone
```

**Linux/Mac**：
```bash
# 进入 bin 目录
cd bin

# 单机模式启动
sh startup.sh -m standalone
```

**验证启动成功**：
```bash
# 查看日志
tail -f logs/start.out

# 看到以下信息表示启动成功
Nacos started successfully in stand alone mode. use external storage
```

**访问控制台**：
- 地址：http://localhost:8848/nacos
- 默认用户名/密码：nacos/nacos

---

#### 方式2：Docker 启动（推荐开发环境）

```bash
# 拉取镜像
docker pull nacos/nacos-server:v2.2.3

# 单机模式启动
docker run -d \
  --name nacos \
  -p 8848:8848 \
  -p 9848:9848 \
  -p 9849:9849 \
  -e MODE=standalone \
  nacos/nacos-server:v2.2.3

# 查看日志
docker logs -f nacos
```

---

### 1.4 依赖引入

**父工程 POM**（已在第3章配置）：
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-dependencies</artifactId>
    <version>2021.0.5.0</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>
```

**服务提供者 POM**（`demo-user-service/pom.xml`）：
```xml
<dependencies>
    <!-- Nacos 服务注册发现 -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
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

### 1.5 最小化配置

**bootstrap.yml**（`demo-user-service/src/main/resources/bootstrap.yml`）：
```yaml
spring:
  application:
    name: user-service  # 服务名称（重要！）
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848  # Nacos 服务器地址
```

**application.yml**：
```yaml
server:
  port: 8001  # 服务端口
```

**启动类**：
```java
package com.demo.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient  // 开启服务注册发现
public class UserApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }
}
```

---

### 1.6 快速验证

**步骤1：启动服务**
```bash
cd demo-user-service
mvn spring-boot:run
```

**步骤2：查看启动日志**
```
Nacos registry, user-service 192.168.1.100:8001 register finished
```

**步骤3：访问 Nacos 控制台**
- 地址：http://localhost:8848/nacos
- 进入"服务管理" → "服务列表"
- 查看是否有 `user-service`

**验证效果**：
```
服务列表：
- user-service
  - 实例数：1
  - 健康实例数：1
  - 实例信息：192.168.1.100:8001
```

---

## 2. 核心概念与设计思想

### 2.1 服务注册与发现流程

```
┌─────────────────────────────────────────────────────────────┐
│                     Nacos Server                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           服务注册表（内存 + 持久化）                  │   │
│  │  user-service:                                        │   │
│  │    - 192.168.1.100:8001 (健康)                        │   │
│  │    - 192.168.1.101:8001 (健康)                        │   │
│  │  order-service:                                       │   │
│  │    - 192.168.1.102:8002 (健康)                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           ↑                                ↓
    服务注册（POST）                  服务发现（GET）
           ↑                                ↓
    心跳（PUT 5秒）                   拉取服务列表
           ↑                                ↓
┌──────────────────┐              ┌──────────────────┐
│  服务提供者       │              │  服务消费者       │
│  user-service    │              │  order-service   │
│  192.168.1.100   │              │  192.168.1.102   │
└──────────────────┘              └──────────────────┘
```

**核心流程**：
1. **服务注册**：服务启动时向 Nacos 注册（服务名、IP、端口、元数据）
2. **心跳上报**：定期发送心跳（默认 5 秒），证明服务健康
3. **服务发现**：服务消费者从 Nacos 拉取服务列表
4. **健康检查**：Nacos 检测心跳，超时（默认 15 秒）自动剔除
5. **本地缓存**：服务消费者缓存服务列表，定期更新（默认 30 秒）

---

### 2.2 Nacos 数据模型

**层次结构**：
```
Namespace（命名空间）
    ↓
Group（分组）
    ↓
Service（服务）
    ↓
Cluster（集群）
    ↓
Instance（实例）
```

**Namespace（命名空间）**：
- 用途：环境隔离（dev/test/prod）
- 默认：public
- 示例：dev、test、prod

**Group（分组）**：
- 用途：服务分组（不同业务线）
- 默认：DEFAULT_GROUP
- 示例：ORDER_GROUP、USER_GROUP

**Service（服务）**：
- 服务名称（如 user-service）

**Cluster（集群）**：
- 用途：集群隔离（同地域优先）
- 默认：DEFAULT
- 示例：HZ（杭州）、SH（上海）

**Instance（实例）**：
- 服务实例（IP + 端口）
- 包含元数据（版本号、权重等）

---

### 2.3 临时实例 vs 持久化实例

**临时实例（默认，推荐）**：
- AP 模式（可用性优先）
- 心跳机制（客户端主动上报）
- 健康检查：15 秒无心跳自动剔除
- 适用场景：大部分微服务

**持久化实例**：
- CP 模式（一致性优先）
- 服务端主动探测健康检查
- 即使不健康也不剔除，只标记为不健康
- 适用场景：需要强一致性的场景

**配置方式**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: true  # true=临时实例（默认）, false=持久化实例
```

---

### 2.4 AP vs CP 模式

**AP 模式（临时实例）**：
- **可用性优先**
- Nacos 集群部分节点宕机，仍可提供服务
- 可能出现短暂数据不一致

**CP 模式（持久化实例）**：
- **一致性优先**
- 基于 Raft 协议
- 半数以上节点宕机，无法提供服务
- 保证数据强一致性

**选择建议**：
- **临时实例（AP）**：大部分微服务场景
- **持久化实例（CP）**：DNS、配置中心等需要强一致性的场景

---

## 3. Nacos 控制台使用

### 3.1 登录控制台

**访问地址**：http://localhost:8848/nacos  
**默认账号**：nacos/nacos

---

### 3.2 服务列表

**路径**：服务管理 → 服务列表

**功能**：
- 查看所有服务
- 查看服务实例数、健康实例数
- 查看服务详情

**操作**：
- **详情**：查看服务的所有实例
- **示例查询**：测试服务调用
- **编辑**：修改服务元数据

---

### 3.3 服务详情

**点击服务名称** → 查看实例列表

**实例信息**：
- **IP**：实例 IP 地址
- **端口**：实例端口
- **权重**：负载均衡权重（默认 1.0）
- **健康状态**：健康/不健康
- **元数据**：自定义元数据（版本号、分组等）
- **集群**：实例所属集群

**操作**：
- **编辑**：修改权重、元数据
- **下线**：手动下线实例
- **删除**：删除实例

---

### 3.4 订阅者列表

**路径**：服务管理 → 订阅者列表

**功能**：
- 查看哪些服务订阅了当前服务
- 查看订阅者的 IP 和端口

**用途**：
- 排查服务调用问题
- 查看服务依赖关系

---

## 4. 服务发现实战

### 4.1 场景：订单服务调用用户服务

**目标**：订单服务通过服务名调用用户服务

---

#### 步骤1：用户服务提供接口

**UserController.java**：
```java
package com.demo.user.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    
    @GetMapping("/{id}")
    public String getUserById(@PathVariable Long id) {
        return "User-" + id + " from port: " + System.getProperty("server.port");
    }
}
```

**启动用户服务**：
```bash
# 端口 8001
java -jar demo-user-service.jar --server.port=8001

# 端口 8002（模拟多实例）
java -jar demo-user-service.jar --server.port=8002
```

---

#### 步骤2：订单服务使用 RestTemplate 调用

**订单服务配置**：

**bootstrap.yml**：
```yaml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
```

**application.yml**：
```yaml
server:
  port: 8003
```

**启动类**：
```java
package com.demo.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableDiscoveryClient
public class OrderApplication {
    
    @Bean
    @LoadBalanced  // 开启负载均衡
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);
    }
}
```

**OrderController.java**：
```java
package com.demo.order.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/orders")
public class OrderController {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @GetMapping("/user/{userId}")
    public String getOrderByUserId(@PathVariable Long userId) {
        // 通过服务名调用（自动负载均衡）
        String url = "http://user-service/users/" + userId;
        String user = restTemplate.getForObject(url, String.class);
        return "Order for " + user;
    }
}
```

---

#### 步骤3：验证负载均衡

**多次访问**：
```bash
curl http://localhost:8003/orders/user/1
```

**预期结果**（轮询）：
```
第1次：Order for User-1 from port: 8001
第2次：Order for User-1 from port: 8002
第3次：Order for User-1 from port: 8001
第4次：Order for User-1 from port: 8002
```

---

### 4.2 使用 DiscoveryClient 手动获取服务实例

**OrderController.java**：
```java
package com.demo.order.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discovery")
public class DiscoveryController {
    
    @Autowired
    private DiscoveryClient discoveryClient;
    
    @GetMapping("/services")
    public List<String> getServices() {
        // 获取所有服务名称
        return discoveryClient.getServices();
    }
    
    @GetMapping("/instances/{serviceName}")
    public List<ServiceInstance> getInstances(@PathVariable String serviceName) {
        // 获取指定服务的所有实例
        return discoveryClient.getInstances(serviceName);
    }
}
```

**测试**：
```bash
# 获取所有服务
curl http://localhost:8003/discovery/services
# 返回：["user-service", "order-service"]

# 获取 user-service 的所有实例
curl http://localhost:8003/discovery/instances/user-service
# 返回：[
#   {"host": "192.168.1.100", "port": 8001, "serviceId": "user-service"},
#   {"host": "192.168.1.100", "port": 8002, "serviceId": "user-service"}
# ]
```

---

## 5. 健康检查机制

### 5.1 心跳机制

**客户端心跳**（默认配置）：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 5000  # 心跳间隔（毫秒），默认 5 秒
        heart-beat-timeout: 15000  # 心跳超时（毫秒），默认 15 秒
        ip-delete-timeout: 30000   # 实例删除超时（毫秒），默认 30 秒
```

**心跳流程**：
```
服务启动 → 注册到 Nacos
    ↓
每 5 秒发送一次心跳
    ↓
Nacos 收到心跳 → 更新最后心跳时间
    ↓
15 秒未收到心跳 → 标记为不健康
    ↓
30 秒未收到心跳 → 删除实例
```

---

### 5.2 健康检查端点

**Spring Boot Actuator 集成**：

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
        include: health  # 暴露健康检查端点
```

**Nacos 健康检查**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          preserved.heart.beat.timeout: 15000  # 心跳超时时间
          preserved.ip.delete.timeout: 30000   # IP 删除超时时间
```

---

### 5.3 手动模拟实例下线

**方式1：停止服务**
```bash
# 停止服务
kill -9 <pid>

# 15 秒后，Nacos 标记为不健康
# 30 秒后，Nacos 删除实例
```

**方式2：Nacos 控制台下线**
- 进入服务详情
- 点击"下线"按钮
- 实例立即下线

---

## 6. 实际落地场景与最佳使用

### 6.1 场景1：多环境隔离

**需求**：
- 开发环境（dev）
- 测试环境（test）
- 生产环境（prod）

**方案：使用 namespace 隔离**

**Nacos 控制台创建命名空间**：
- 进入"命名空间"
- 点击"新建命名空间"
- 命名空间 ID：dev、test、prod
- 命名空间名：开发环境、测试环境、生产环境

**配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: ${nacos.namespace:dev}  # 通过环境变量指定
```

**启动参数**：
```bash
# 开发环境
java -jar app.jar --nacos.namespace=dev

# 测试环境
java -jar app.jar --nacos.namespace=test

# 生产环境
java -jar app.jar --nacos.namespace=prod
```

---

### 6.2 场景2：灰度发布

**需求**：
- 新版本先发布一部分实例
- 验证无问题后，全量发布

**方案：使用元数据 + 自定义负载均衡策略**

**新版本配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: 2.0  # 版本号
```

**旧版本配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: 1.0
```

**自定义负载均衡策略**（后续章节详解）：
```java
// 优先调用 version=2.0 的实例
// 如果没有，再调用 version=1.0 的实例
```

---

### 6.3 场景3：同地域优先

**需求**：
- 杭州的服务优先调用杭州的实例
- 上海的服务优先调用上海的实例

**方案：使用 cluster 集群**

**杭州实例配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: HZ  # 杭州集群
```

**上海实例配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: SH  # 上海集群
```

**Nacos 默认同集群优先**（LoadBalancer 策略自动实现）

---

### 6.4 场景4：权重配置

**需求**：
- 新机器性能更好，希望承担更多流量

**方案：配置权重**

**方式1：配置文件**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        weight: 2.0  # 权重（默认 1.0）
```

**方式2：Nacos 控制台**：
- 进入服务详情
- 点击"编辑"
- 修改权重（0-10000，默认 1）

**效果**：
```
实例1（权重 1.0）：承担 33% 流量
实例2（权重 2.0）：承担 67% 流量
```

---

## 7. 常见问题与易错点

### 7.1 问题1：服务未注册到 Nacos

**现象**：
- Nacos 控制台看不到服务

**排查步骤**：
1. 检查 Nacos Server 是否启动
   ```bash
   curl http://localhost:8848/nacos
   ```
2. 检查配置是否正确
   ```yaml
   spring:
     application:
       name: user-service  # 必须配置
     cloud:
       nacos:
         discovery:
           server-addr: localhost:8848  # 地址是否正确
   ```
3. 检查启动类是否添加注解
   ```java
   @EnableDiscoveryClient  // 必须添加
   ```
4. 查看启动日志是否有报错
   ```
   Nacos registry, user-service register finished
   ```

---

### 7.2 问题2：服务调用 404

**现象**：
```
java.net.UnknownHostException: user-service
```

**原因**：
- RestTemplate 未添加 `@LoadBalanced` 注解

**解决方案**：
```java
@Bean
@LoadBalanced  // 必须添加
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

---

### 7.3 问题3：服务频繁上下线

**现象**：
- Nacos 控制台看到服务频繁上下线

**原因**：
- 心跳超时时间太短
- 网络不稳定

**解决方案**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 5000
        heart-beat-timeout: 30000  # 增加超时时间
        ip-delete-timeout: 60000
```

---

### 7.4 问题4：命名空间配置不生效

**现象**：
- 配置了 namespace，但服务仍注册到 public

**原因**：
- namespace 配置在 `application.yml` 而非 `bootstrap.yml`

**解决方案**：
```yaml
# 必须在 bootstrap.yml 中配置
spring:
  cloud:
    nacos:
      discovery:
        namespace: dev  # 在 bootstrap.yml 中
```

---

## 8. 面试准备专项

### 高频面试题

**题目1：Nacos 服务注册与发现的流程是什么？**

**标准回答**：

**第一层（基础回答）**：
服务启动时向 Nacos 注册，定期发送心跳，服务消费者从 Nacos 拉取服务列表，Nacos 检测心跳超时自动剔除实例。

**第二层（深入原理）**：
1. **服务注册**：服务启动时调用 Nacos OpenAPI `/nacos/v1/ns/instance` 注册（POST）
2. **心跳上报**：每 5 秒发送一次心跳（PUT `/nacos/v1/ns/instance/beat`）
3. **服务发现**：服务消费者调用 `/nacos/v1/ns/instance/list` 获取服务列表（GET）
4. **本地缓存**：服务消费者缓存服务列表，每 30 秒更新一次
5. **健康检查**：15 秒未收到心跳标记为不健康，30 秒删除实例
6. **推送机制**：Nacos Server 主动推送服务变更通知（UDP）

**第三层（扩展延伸）**：
- 临时实例（AP 模式）vs 持久化实例（CP 模式）
- Nacos 集群架构（Raft 协议保证一致性）
- Nacos 性能优化（本地缓存、异步推送、长连接）

**加分项**：
- 提到 Nacos 2.0 的长连接 gRPC 优化
- 提到服务订阅机制（Subscribe）
- 提到实际生产环境的配置优化经验

---

**题目2：Nacos 的临时实例和持久化实例有什么区别？**

**标准回答**：

**第一层（基础回答）**：
临时实例通过心跳上报健康状态，超时自动剔除。持久化实例由 Nacos 主动探测健康状态，即使不健康也不剔除。

**第二层（深入原理）**：
| 维度 | 临时实例 | 持久化实例 |
|------|----------|------------|
| **一致性模型** | AP（可用性优先） | CP（一致性优先） |
| **健康检查** | 客户端心跳 | 服务端主动探测 |
| **超时处理** | 自动剔除 | 标记不健康 |
| **数据存储** | 内存 | 持久化（Raft） |
| **适用场景** | 大部分微服务 | DNS、配置中心 |

**第三层（扩展延伸）**：
- AP 模式基于 Distro 协议（临时数据）
- CP 模式基于 Raft 协议（持久化数据）
- 临时实例性能更高（无需持久化）
- 持久化实例数据一致性更强

**加分项**：
- 提到配置方式：`spring.cloud.nacos.discovery.ephemeral=true/false`
- 提到生产环境的选择建议
- 提到 Nacos 集群部署的注意事项

---

**题目3：如何解决服务调用时的 UnknownHostException？**

**标准回答**：

**第一层（基础回答）**：
需要在 RestTemplate 上添加 `@LoadBalanced` 注解，开启负载均衡功能。

**第二层（深入原理）**：
- `@LoadBalanced` 是 Spring Cloud 提供的注解
- 它会为 RestTemplate 添加 LoadBalancerInterceptor 拦截器
- 拦截器会将服务名（如 user-service）解析为实际的 IP 和端口
- 底层使用 LoadBalancerClient 从服务注册中心获取实例列表
- 根据负载均衡策略（轮询/随机）选择一个实例
- 将服务名替换为 `http://IP:PORT`

**第三层（扩展延伸）**：
- Spring Cloud 2020+ 使用 Spring Cloud LoadBalancer 替代 Ribbon
- LoadBalancerClient 的实现原理
- 如何自定义负载均衡策略

**加分项**：
- 提到源码实现（LoadBalancerInterceptor、LoadBalancerClient）
- 提到不使用 `@LoadBalanced` 的替代方案（手动调用 DiscoveryClient）
- 提到实际排查问题的经验

---

## 9. 学习自检清单

- [ ] 能够安装并启动 Nacos Server
- [ ] 能够快速集成 Nacos Discovery
- [ ] 理解服务注册与发现的完整流程
- [ ] 掌握 Nacos 控制台的基本使用
- [ ] 理解临时实例和持久化实例的区别
- [ ] 能够使用 RestTemplate + @LoadBalanced 调用服务
- [ ] 理解心跳机制和健康检查
- [ ] 能够排查服务未注册、调用失败等问题

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：心跳机制、AP/CP 模式、负载均衡原理
- **前置知识**：第3章微服务项目搭建
- **实践建议**：搭建 2 个服务，验证服务注册发现和负载均衡

---

## 10. 参考资料

- [Nacos 官方文档](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Nacos GitHub](https://github.com/alibaba/nacos)
- [Spring Cloud Alibaba 文档](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-discovery)
- [Nacos 架构设计](https://nacos.io/zh-cn/docs/architecture.html)

---

**本章小结**：
- Nacos 提供服务注册与发现功能，支持临时实例和持久化实例
- 服务启动时向 Nacos 注册，定期发送心跳，超时自动剔除
- 服务消费者通过服务名调用，RestTemplate 需添加 @LoadBalanced 注解
- Nacos 控制台提供可视化管理，可查看服务列表、实例详情、订阅者列表
- 支持 namespace 环境隔离、cluster 集群隔离、权重配置、元数据管理

**下一章预告**：第5章将详细讲解 Nacos Discovery 的自定义配置，包括命名空间、分组、集群、元数据、健康检查等高级特性。

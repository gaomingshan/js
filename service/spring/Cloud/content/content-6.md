# 第6章：Eureka 注册中心

> **本章目标**：掌握 Eureka 注册中心的搭建和使用，理解自我保护机制、多级缓存架构，能够对比 Eureka 和 Nacos

---

## 1. 组件引入与快速入门

### 1.1 为什么学习 Eureka？

**Eureka 的定位**：
- Netflix OSS 开源的服务注册中心
- Spring Cloud 早期默认注册中心
- 成熟稳定，生产环境验证

**现状**：
- ❌ Eureka 2.x 已停止开发（2018 年）
- ❌ Spring Cloud 2020+ 不再推荐使用
- ✅ 但仍有大量老项目在使用
- ✅ 面试高频考点

**为什么还要学？**
1. **老项目维护**：很多公司仍在使用 Eureka
2. **面试必备**：Eureka vs Nacos 是高频面试题
3. **原理通用**：理解 Eureka 有助于理解其他注册中心
4. **迁移需求**：从 Eureka 迁移到 Nacos

---

### 1.2 Eureka 架构

```
┌─────────────────────────────────────────────────────────┐
│                    Eureka Server                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │            服务注册表（内存）                      │   │
│  │  user-service:                                    │   │
│  │    - 192.168.1.100:8001                           │   │
│  │  order-service:                                   │   │
│  │    - 192.168.1.101:8002                           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │            三级缓存                                │   │
│  │  ReadWriteCacheMap (读写缓存)                     │   │
│  │  ReadOnlyCacheMap  (只读缓存)                     │   │
│  │  Registry          (注册表)                       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↑                                ↓
    服务注册（POST）              服务发现（GET）
    心跳（PUT 30秒）              拉取注册表（30秒）
         ↑                                ↓
┌──────────────────┐              ┌──────────────────┐
│  服务提供者       │              │  服务消费者       │
│  user-service    │              │  order-service   │
└──────────────────┘              └──────────────────┘
```

**核心组件**：
- **Eureka Server**：注册中心服务端
- **Eureka Client**：服务提供者和服务消费者

---

### 1.3 Eureka Server 搭建

#### 步骤1：创建 Eureka Server 模块

**pom.xml**：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.demo</groupId>
        <artifactId>demo-parent</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>demo-eureka-server</artifactId>
    <packaging>jar</packaging>

    <dependencies>
        <!-- Eureka Server -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
    </dependencies>
</project>
```

---

#### 步骤2：启动类

```java
package com.demo.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer  // 开启 Eureka Server
public class EurekaServerApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

---

#### 步骤3：配置文件

**application.yml**：
```yaml
server:
  port: 8761  # Eureka Server 默认端口

spring:
  application:
    name: eureka-server

eureka:
  instance:
    hostname: localhost  # 主机名
  
  client:
    # 是否注册到 Eureka Server（单机模式设置为 false）
    register-with-eureka: false
    # 是否从 Eureka Server 拉取注册表（单机模式设置为 false）
    fetch-registry: false
    # Eureka Server 地址
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
  
  server:
    # 关闭自我保护模式（开发环境）
    enable-self-preservation: false
    # 清理间隔（毫秒）
    eviction-interval-timer-in-ms: 5000
```

---

#### 步骤4：启动验证

**启动 Eureka Server**：
```bash
cd demo-eureka-server
mvn spring-boot:run
```

**访问控制台**：
- 地址：http://localhost:8761
- 可以看到 Eureka 控制台（红色警告是正常的，因为关闭了自我保护）

---

### 1.4 Eureka Client 配置

**pom.xml**：
```xml
<dependencies>
    <!-- Eureka Client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
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

**application.yml**：
```yaml
server:
  port: 8001

spring:
  application:
    name: user-service  # 服务名称

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/  # Eureka Server 地址
  
  instance:
    prefer-ip-address: true  # 使用 IP 地址注册
    instance-id: ${spring.application.name}:${server.port}  # 实例 ID
```

---

### 1.5 快速验证

**启动服务**：
```bash
# 1. 启动 Eureka Server
cd demo-eureka-server
mvn spring-boot:run

# 2. 启动 User Service
cd demo-user-service
mvn spring-boot:run
```

**访问 Eureka 控制台**：
- 地址：http://localhost:8761
- 查看 "Instances currently registered with Eureka"
- 可以看到 `USER-SERVICE` 已注册

**验证效果**：
```
Application         AMIs        Availability Zones  Status
USER-SERVICE        n/a (1)     (1)                 UP (1) - user-service:8001
```

---

## 2. 核心概念与设计思想

### 2.1 Eureka 核心概念

**服务注册**：
- 服务启动时，向 Eureka Server 注册（POST `/eureka/apps/{appName}`）
- 包含服务名、IP、端口、元数据等信息

**服务续约（心跳）**：
- 每 30 秒发送一次心跳（PUT `/eureka/apps/{appName}/{instanceId}`）
- 证明服务仍然健康

**服务剔除**：
- 90 秒未收到心跳，Eureka Server 剔除实例
- 默认 60 秒执行一次清理任务

**服务发现**：
- 客户端从 Eureka Server 拉取注册表（GET `/eureka/apps`）
- 默认 30 秒拉取一次
- 本地缓存注册表

---

### 2.2 自我保护机制

**问题背景**：
- 网络故障导致大量服务心跳超时
- 如果全部剔除，会导致服务全部不可用

**自我保护机制**：
- 当心跳失败比例超过 15%，进入自我保护模式
- 保护模式下，不剔除任何实例（即使心跳超时）
- 网络恢复后，自动退出保护模式

**工作原理**：
```
正常情况：
- 100 个实例，每分钟应收到 200 次心跳（100 * 2）
- 实际收到 200 次心跳 → 正常

网络故障：
- 实际收到 160 次心跳（80%）
- 失败比例 = (200 - 160) / 200 = 20% > 15%
- 进入自我保护模式 → 不剔除实例
```

**配置**：
```yaml
eureka:
  server:
    enable-self-preservation: true  # 开启自我保护（默认 true）
    renewal-percent-threshold: 0.85  # 心跳阈值（默认 0.85，即 85%）
```

**生产环境建议**：
- ✅ 开启自我保护（`enable-self-preservation: true`）
- ✅ 调整阈值（根据实际情况）

**开发环境建议**：
- ❌ 关闭自我保护（`enable-self-preservation: false`）
- 方便测试

---

### 2.3 多级缓存架构

**三级缓存**：
```
客户端请求
    ↓
ReadOnlyCacheMap (只读缓存，默认 30 秒更新一次)
    ↓
ReadWriteCacheMap (读写缓存，默认 180 秒过期)
    ↓
Registry (注册表)
```

**工作流程**：
```
1. 客户端拉取注册表
    ↓
2. 先查 ReadOnlyCacheMap（只读缓存）
    ↓
3. 如果没有，查 ReadWriteCacheMap（读写缓存）
    ↓
4. 如果没有，查 Registry（注册表）
    ↓
5. 逐级更新缓存
    ↓
6. 返回注册表给客户端
```

**为什么需要多级缓存？**
- **性能优化**：减少直接访问注册表的频率
- **读写分离**：ReadOnlyCacheMap 只读，ReadWriteCacheMap 可写
- **最终一致性**：牺牲实时性，换取高性能

**缓存更新时机**：
```
Registry (注册表) → 立即更新
    ↓
ReadWriteCacheMap (读写缓存) → 立即更新（通过监听器）
    ↓
ReadOnlyCacheMap (只读缓存) → 30 秒更新一次（定时任务）
```

**配置**：
```yaml
eureka:
  server:
    # 只读缓存更新间隔（毫秒，默认 30000）
    response-cache-update-interval-ms: 30000
    # 读写缓存过期时间（秒，默认 180）
    response-cache-auto-expiration-in-seconds: 180
    # 是否使用只读缓存（默认 true）
    use-read-only-response-cache: true
```

---

### 2.4 Region 和 Zone

**Region（地域）**：
- 代表一个地理区域（如华东、华北）
- 默认 `default`

**Zone（可用区）**：
- Region 下的子区域（如杭州1区、杭州2区）
- 默认 `defaultZone`

**使用场景**：
- 同 Region 优先调用
- 同 Zone 优先调用
- 跨 Region/Zone 调用作为备份

**配置**：
```yaml
eureka:
  client:
    region: cn-hangzhou  # 地域
    availability-zones:
      cn-hangzhou: zone1,zone2  # 可用区
    service-url:
      zone1: http://eureka1:8761/eureka/
      zone2: http://eureka2:8762/eureka/
  
  instance:
    metadata-map:
      zone: zone1  # 实例所属可用区
```

---

## 3. Eureka Server 配置详解

### 3.1 完整配置示例

```yaml
server:
  port: 8761

spring:
  application:
    name: eureka-server

eureka:
  instance:
    hostname: localhost  # 主机名
    prefer-ip-address: false  # 是否使用 IP 地址
  
  client:
    # ========== 注册配置 ==========
    register-with-eureka: false  # 是否注册到 Eureka（集群模式为 true）
    fetch-registry: false        # 是否拉取注册表（集群模式为 true）
    
    # ========== Eureka Server 地址 ==========
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
    
    # ========== 拉取间隔 ==========
    registry-fetch-interval-seconds: 30  # 拉取注册表间隔（秒）
    
    # ========== Region 和 Zone ==========
    region: default
    availability-zones:
      default: defaultZone
  
  server:
    # ========== 自我保护 ==========
    enable-self-preservation: false  # 是否开启自我保护（生产环境 true）
    renewal-percent-threshold: 0.85  # 心跳阈值（默认 0.85）
    
    # ========== 清理配置 ==========
    eviction-interval-timer-in-ms: 60000  # 清理间隔（毫秒，默认 60000）
    
    # ========== 缓存配置 ==========
    response-cache-update-interval-ms: 30000  # 只读缓存更新间隔（毫秒）
    response-cache-auto-expiration-in-seconds: 180  # 读写缓存过期时间（秒）
    use-read-only-response-cache: true  # 是否使用只读缓存
    
    # ========== 同步配置 ==========
    max-threads-for-peer-replication: 20  # 集群同步线程数
    min-threads-for-peer-replication: 5
```

---

### 3.2 Eureka Client 配置详解

```yaml
server:
  port: 8001

spring:
  application:
    name: user-service

eureka:
  client:
    # ========== Eureka Server 地址 ==========
    service-url:
      defaultZone: http://localhost:8761/eureka/
    
    # ========== 注册配置 ==========
    register-with-eureka: true  # 是否注册到 Eureka（默认 true）
    fetch-registry: true        # 是否拉取注册表（默认 true）
    
    # ========== 拉取间隔 ==========
    registry-fetch-interval-seconds: 30  # 拉取注册表间隔（秒）
    
    # ========== 健康检查 ==========
    healthcheck:
      enabled: true  # 开启健康检查
    
    # ========== Region 和 Zone ==========
    region: default
    availability-zones:
      default: defaultZone
  
  instance:
    # ========== 实例配置 ==========
    hostname: localhost  # 主机名
    prefer-ip-address: true  # 使用 IP 地址注册（推荐 true）
    ip-address: 192.168.1.100  # 指定 IP 地址（可选）
    instance-id: ${spring.application.name}:${server.port}  # 实例 ID
    
    # ========== 心跳配置 ==========
    lease-renewal-interval-in-seconds: 30  # 心跳间隔（秒，默认 30）
    lease-expiration-duration-in-seconds: 90  # 心跳超时（秒，默认 90）
    
    # ========== 元数据 ==========
    metadata-map:
      version: 1.0.0
      zone: zone1
```

---

## 4. Eureka 集群部署

### 4.1 集群架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Eureka Server 1│────│  Eureka Server 2│────│  Eureka Server 3│
│  localhost:8761 │     │  localhost:8762 │     │  localhost:8763 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ↑                       ↑                       ↑
        └───────────────────────┴───────────────────────┘
                         服务注册与同步
                                ↓
                        ┌─────────────────┐
                        │  Eureka Client  │
                        │  user-service   │
                        └─────────────────┘
```

**工作原理**：
- 每个 Eureka Server 既是服务端，也是客户端
- 服务注册到一个 Eureka Server，会同步到其他 Eureka Server
- 客户端可以连接任意一个 Eureka Server

---

### 4.2 集群配置

**Eureka Server 1 配置**（`application-peer1.yml`）：
```yaml
server:
  port: 8761

spring:
  application:
    name: eureka-server

eureka:
  instance:
    hostname: eureka1
  
  client:
    register-with-eureka: true  # 集群模式必须为 true
    fetch-registry: true        # 集群模式必须为 true
    service-url:
      defaultZone: http://eureka2:8762/eureka/,http://eureka3:8763/eureka/
```

**Eureka Server 2 配置**（`application-peer2.yml`）：
```yaml
server:
  port: 8762

spring:
  application:
    name: eureka-server

eureka:
  instance:
    hostname: eureka2
  
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka1:8761/eureka/,http://eureka3:8763/eureka/
```

**Eureka Server 3 配置**（`application-peer3.yml`）：
```yaml
server:
  port: 8763

spring:
  application:
    name: eureka-server

eureka:
  instance:
    hostname: eureka3
  
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka1:8761/eureka/,http://eureka2:8762/eureka/
```

**hosts 配置**（`/etc/hosts` 或 `C:\Windows\System32\drivers\etc\hosts`）：
```
127.0.0.1 eureka1
127.0.0.1 eureka2
127.0.0.1 eureka3
```

**启动**：
```bash
# 启动 Eureka Server 1
java -jar eureka-server.jar --spring.profiles.active=peer1

# 启动 Eureka Server 2
java -jar eureka-server.jar --spring.profiles.active=peer2

# 启动 Eureka Server 3
java -jar eureka-server.jar --spring.profiles.active=peer3
```

**客户端配置**：
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka1:8761/eureka/,http://eureka2:8762/eureka/,http://eureka3:8763/eureka/
```

---

## 5. 实际落地场景与最佳使用

### 5.1 场景1：Eureka vs Nacos 迁移

**需求**：从 Eureka 迁移到 Nacos

**迁移步骤**：

**1. 依赖替换**：
```xml
<!-- 移除 Eureka 依赖 -->
<!--
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
-->

<!-- 添加 Nacos 依赖 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

**2. 配置迁移**：
```yaml
# Eureka 配置
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/

# 迁移为 Nacos 配置
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
```

**3. 代码无需修改**：
- `@EnableDiscoveryClient` 注解通用
- `DiscoveryClient` 接口通用
- `RestTemplate + @LoadBalanced` 通用
- `Feign` 通用

**4. 灰度迁移**：
```
阶段1：Eureka + Nacos 并存（双注册）
阶段2：部分服务切换到 Nacos
阶段3：全部服务切换到 Nacos
阶段4：下线 Eureka
```

---

### 5.2 场景2：Eureka 健康检查优化

**问题**：
- Eureka 默认只检查心跳，不检查应用健康状态

**方案**：集成 Spring Boot Actuator

**1. 引入依赖**：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**2. 配置**：
```yaml
eureka:
  client:
    healthcheck:
      enabled: true  # 开启健康检查

management:
  endpoints:
    web:
      exposure:
        include: health
```

**3. 自定义健康检查**：
```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        // 检查数据库、Redis 等
        boolean isHealthy = checkDatabase() && checkRedis();
        
        if (isHealthy) {
            return Health.up().build();
        } else {
            return Health.down().build();
        }
    }
}
```

---

### 5.3 场景3：Eureka 服务优雅下线

**问题**：
- 服务停止后，Eureka Server 需要 90 秒才剔除
- 期间客户端可能调用到已停止的服务

**方案1：主动注销**：
```java
@Component
public class GracefulShutdown {
    
    @Autowired
    private EurekaClient eurekaClient;
    
    @PreDestroy
    public void destroy() {
        // 主动注销
        eurekaClient.shutdown();
        
        // 等待正在处理的请求完成
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

**方案2：Actuator Shutdown**：
```yaml
management:
  endpoints:
    web:
      exposure:
        include: shutdown
  endpoint:
    shutdown:
      enabled: true
```

```bash
# 调用下线接口
curl -X POST http://localhost:8001/actuator/shutdown
```

---

## 6. 常见问题与易错点

### 6.1 问题1：自我保护模式导致服务无法剔除

**现象**：
- Eureka 控制台显示红色警告：
  ```
  EMERGENCY! EUREKA MAY BE INCORRECTLY CLAIMING INSTANCES ARE UP WHEN THEY'RE NOT.
  RENEWALS ARE LESSER THAN THRESHOLD AND HENCE THE INSTANCES ARE NOT BEING EXPIRED JUST TO BE SAFE.
  ```

**原因**：
- 进入自我保护模式，不剔除任何实例

**解决方案**：

**开发环境**（关闭自我保护）：
```yaml
eureka:
  server:
    enable-self-preservation: false
    eviction-interval-timer-in-ms: 5000
```

**生产环境**（调整阈值）：
```yaml
eureka:
  server:
    enable-self-preservation: true
    renewal-percent-threshold: 0.5  # 降低阈值
```

---

### 6.2 问题2：服务注册慢

**现象**：
- 服务启动后，需要 60-90 秒才能在 Eureka 控制台看到

**原因**：
- Eureka 多级缓存机制
- 只读缓存 30 秒更新一次
- 客户端 30 秒拉取一次

**时间线**：
```
0s  → 服务启动，注册到 Eureka Server
0s  → ReadWriteCacheMap 立即更新
30s → ReadOnlyCacheMap 更新
30s → 客户端拉取注册表
60s → 客户端拿到最新注册表
```

**优化方案**：
```yaml
# Eureka Server
eureka:
  server:
    response-cache-update-interval-ms: 3000  # 只读缓存 3 秒更新

# Eureka Client
eureka:
  client:
    registry-fetch-interval-seconds: 3  # 客户端 3 秒拉取
```

---

### 6.3 问题3：Eureka 集群数据不同步

**现象**：
- 不同 Eureka Server 上的实例数量不一致

**原因**：
- 网络问题导致同步失败
- 配置错误

**排查步骤**：
1. 检查各 Eureka Server 的配置
2. 检查网络连通性
3. 查看日志是否有同步失败的报错

**解决方案**：
```yaml
eureka:
  server:
    # 增加同步线程数
    max-threads-for-peer-replication: 50
    min-threads-for-peer-replication: 10
```

---

## 7. Eureka vs Nacos 对比

### 7.1 功能对比

| 维度 | Eureka | Nacos |
|------|--------|-------|
| **功能** | 仅服务注册发现 | 服务注册发现 + 配置管理 |
| **一致性** | AP（可用性优先） | AP/CP 可切换 |
| **健康检查** | 心跳 | 心跳 + HTTP/TCP 探测 |
| **心跳间隔** | 30 秒 | 5 秒 |
| **剔除时间** | 90 秒 | 15 秒 |
| **控制台** | 简陋 | 功能丰富 |
| **元数据** | 支持 | 支持（更强大） |
| **服务分组** | 不支持 | 支持（namespace + group） |
| **维护状态** | 已停止维护 | 活跃开发 |
| **社区** | 国外为主 | 国内活跃 |
| **性能** | 中 | 高 |
| **推荐度** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

### 7.2 架构对比

**Eureka 架构**：
```
Eureka Server（多级缓存）
    ↓
心跳机制（30 秒）
    ↓
自我保护机制
    ↓
最终一致性（AP 模式）
```

**Nacos 架构**：
```
Nacos Server（内存 + 持久化）
    ↓
心跳机制（5 秒）
    ↓
健康检查（心跳 + 探测）
    ↓
AP/CP 模式可切换
```

---

### 7.3 选型建议

**新项目**：
- ✅ 优先选择 Nacos
- 功能更全面、性能更好、社区更活跃

**老项目**：
- ✅ 继续使用 Eureka（稳定运行）
- ✅ 逐步迁移到 Nacos

**学习建议**：
- ✅ 重点学习 Nacos
- ✅ 了解 Eureka 原理（面试）

---

## 8. 面试准备专项

### 高频面试题

**题目1：Eureka 的自我保护机制是什么？**

**标准回答**：

**第一层（基础回答）**：
当心跳失败比例超过 15% 时，Eureka 进入自我保护模式，不剔除任何实例，避免网络故障导致服务全部不可用。

**第二层（深入原理）**：
- **触发条件**：心跳失败比例 > 15%（默认）
- **计算方式**：`(期望心跳数 - 实际心跳数) / 期望心跳数 > 15%`
- **保护措施**：不剔除任何实例，即使心跳超时
- **退出条件**：网络恢复，心跳失败比例 < 15%
- **配置**：`eureka.server.enable-self-preservation=true/false`

**第三层（扩展延伸）**：
- **优点**：避免网络故障导致服务全部不可用（CAP 中的 A）
- **缺点**：可能导致不健康的实例仍然被调用
- **生产环境建议**：开启自我保护，调整阈值
- **开发环境建议**：关闭自我保护，方便测试

**加分项**：
- 提到 CAP 理论（Eureka 选择 AP）
- 提到与 Nacos 的对比（Nacos 可以选择 AP 或 CP）
- 提到实际生产环境的配置经验

---

**题目2：Eureka 的多级缓存架构是什么？为什么需要多级缓存？**

**标准回答**：

**第一层（基础回答）**：
Eureka 有三级缓存：Registry（注册表）、ReadWriteCacheMap（读写缓存）、ReadOnlyCacheMap（只读缓存），客户端拉取注册表时依次查询。

**第二层（深入原理）**：
- **Registry**：注册表，存储所有服务实例，立即更新
- **ReadWriteCacheMap**：读写缓存，180 秒过期，立即更新（通过监听器）
- **ReadOnlyCacheMap**：只读缓存，30 秒更新一次（定时任务）
- **查询顺序**：ReadOnlyCacheMap → ReadWriteCacheMap → Registry
- **更新流程**：Registry → ReadWriteCacheMap → ReadOnlyCacheMap（定时）

**第三层（扩展延伸）**：
- **为什么需要多级缓存**：
  1. **性能优化**：减少直接访问注册表的频率
  2. **读写分离**：ReadOnlyCacheMap 只读，高并发下性能更好
  3. **最终一致性**：牺牲实时性，换取高性能
- **缺点**：服务注册后，客户端感知较慢（60-90 秒）
- **优化方案**：减少缓存更新间隔（开发环境）

**加分项**：
- 提到缓存更新间隔的配置
- 提到与 Nacos 的对比（Nacos 没有多级缓存）
- 提到实际生产环境的优化经验

---

**题目3：Eureka 和 Nacos 的区别是什么？如何选择？**

**标准回答**：

**第一层（基础回答）**：
Eureka 只有服务注册发现，Nacos 还支持配置管理。Eureka 是 AP 模式，Nacos 支持 AP/CP 切换。新项目优先选择 Nacos。

**第二层（深入原理）**：
- **功能**：Eureka（仅注册发现）vs Nacos（注册发现 + 配置管理）
- **一致性**：Eureka（AP 模式）vs Nacos（AP/CP 可切换）
- **心跳间隔**：Eureka（30 秒）vs Nacos（5 秒）
- **剔除时间**：Eureka（90 秒）vs Nacos（15 秒）
- **控制台**：Eureka（简陋）vs Nacos（功能丰富）
- **维护状态**：Eureka（已停止维护）vs Nacos（活跃开发）
- **性能**：Nacos 更高（无多级缓存、长连接优化）

**第三层（扩展延伸）**：
- **选型建议**：
  - 新项目：优先选择 Nacos
  - 老项目：继续使用 Eureka 或逐步迁移
- **迁移方案**：
  - 依赖替换、配置迁移、代码无需修改
  - 灰度迁移（双注册）
- **面试加分点**：提到具体的迁移经验

**加分项**：
- 提到 Eureka 和 Nacos 的架构设计
- 提到 CAP 理论和一致性算法（Distro、Raft）
- 提到实际项目的选型和迁移经验

---

## 9. 学习自检清单

- [ ] 能够搭建 Eureka Server 和 Eureka Client
- [ ] 理解自我保护机制的原理和配置
- [ ] 理解多级缓存架构和工作流程
- [ ] 掌握 Eureka 集群部署
- [ ] 能够对比 Eureka 和 Nacos 的区别
- [ ] 掌握 Eureka 到 Nacos 的迁移方案
- [ ] 能够排查常见问题（自我保护、注册慢）
- [ ] 能够流畅回答 Eureka 相关面试题

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：自我保护机制、多级缓存架构、与 Nacos 对比
- **前置知识**：第4-5章 Nacos Discovery
- **实践建议**：搭建 Eureka 集群，体验自我保护机制

---

## 10. 参考资料

- [Eureka GitHub](https://github.com/Netflix/eureka)
- [Spring Cloud Netflix 文档](https://spring.io/projects/spring-cloud-netflix)
- [Eureka 架构设计](https://github.com/Netflix/eureka/wiki/Eureka-at-a-glance)
- [CAP 理论](https://en.wikipedia.org/wiki/CAP_theorem)

---

**本章小结**：
- Eureka 是 Netflix 开源的服务注册中心，AP 模式（可用性优先）
- 自我保护机制避免网络故障导致服务全部不可用
- 多级缓存架构牺牲实时性，换取高性能
- Eureka 2.x 已停止维护，新项目推荐使用 Nacos
- 理解 Eureka 原理有助于理解其他注册中心，也是面试高频考点

**下一章预告**：第7章将介绍服务发现最佳实践，包括服务健康检查策略、服务优雅上下线、灰度发布、多环境服务隔离、常见问题排查。

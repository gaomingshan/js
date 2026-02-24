# 第2章：Spring Cloud 核心组件介绍

> **本章目标**：全面了解 Spring Cloud 核心组件，理解各组件解决的问题，掌握组件选型标准

---

## 1. Spring Cloud 组件全景

Spring Cloud 为微服务架构提供了一整套解决方案，核心组件覆盖微服务开发的各个方面。

### 1.1 组件分类

```
Spring Cloud 组件体系
├── 服务治理
│   ├── 服务注册与发现（Nacos Discovery / Eureka）
│   ├── 配置管理（Nacos Config / Spring Cloud Config）
│   └── 负载均衡（LoadBalancer / Ribbon）
├── 服务通信
│   ├── 服务调用（OpenFeign）
│   ├── 服务网关（Spring Cloud Gateway / Zuul）
│   └── 消息驱动（Spring Cloud Stream）
├── 服务保护
│   ├── 熔断降级（Sentinel / Resilience4j / Hystrix）
│   └── 限流控制（Sentinel）
├── 服务监控
│   ├── 链路追踪（Sleuth + Zipkin）
│   └── 健康检查（Spring Boot Actuator）
└── 分布式事务
    └── Seata（AT / TCC / SAGA / XA）
```

---

## 2. 服务注册与发现

### 2.1 问题背景

在微服务架构中，服务实例是动态变化的：
- **服务扩容**：根据负载增加服务实例
- **服务缩容**：减少不必要的服务实例
- **服务故障**：实例宕机需要自动剔除
- **服务迁移**：实例 IP 地址变化

**核心问题**：
- 服务消费者如何知道服务提供者的地址？
- 如何感知服务实例的上下线？
- 如何避免调用不健康的实例？

---

### 2.2 Nacos Discovery

**定位**：阿里开源的服务注册发现中心，支持服务注册、健康检查、服务元数据。

**核心特性**：
- ✅ 服务注册与发现
- ✅ 健康检查（心跳机制）
- ✅ 服务元数据管理
- ✅ 动态服务路由
- ✅ 服务级别的负载均衡
- ✅ AP/CP 模式切换（临时实例/持久化实例）
- ✅ 可视化控制台

**工作流程**：
```
1. 服务启动 → 向 Nacos Server 注册
2. Nacos Server ← 定期发送心跳（默认 5 秒）
3. 服务消费者 → 从 Nacos Server 拉取服务列表
4. 本地缓存服务列表 → 定期更新（默认 30 秒）
5. 服务下线/故障 → Nacos 自动剔除（15 秒无心跳）
```

**典型配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
        metadata:
          version: 1.0.0
```

**适用场景**：
- ✅ 新项目优先选择（功能全面）
- ✅ 需要服务注册 + 配置管理一体化
- ✅ 国内团队（中文文档完善）

---

### 2.3 Eureka

**定位**：Netflix OSS 开源的服务注册中心，成熟稳定，AP 模式。

**核心特性**：
- ✅ 服务注册与发现
- ✅ 自我保护机制（避免误剔除）
- ✅ 多级缓存架构（读多写少优化）
- ✅ Region/Zone 机制（跨地域部署）
- ❌ 无可视化控制台（需自行开发）
- ❌ 不支持配置管理

**工作流程**：
```
1. 服务启动 → 向 Eureka Server 注册
2. Eureka Server ← 定期发送心跳（默认 30 秒）
3. 服务消费者 → 从 Eureka Server 拉取服务列表
4. 本地缓存服务列表 → 定期更新（默认 30 秒）
5. 90 秒未收到心跳 → 剔除服务实例
```

**典型配置**：
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    lease-renewal-interval-in-seconds: 30
    lease-expiration-duration-in-seconds: 90
```

**适用场景**：
- ✅ 老项目已使用 Eureka
- ✅ 对稳定性要求高（Netflix 生产验证）
- ❌ 新项目不推荐（维护成本高）

---

### 2.4 Nacos vs Eureka 对比

| 维度 | Nacos | Eureka |
|------|-------|--------|
| **功能** | 服务注册 + 配置管理 | 仅服务注册 |
| **一致性模型** | AP/CP 可切换 | AP（最终一致性） |
| **健康检查** | 心跳 + HTTP/TCP 探测 | 仅心跳 |
| **心跳间隔** | 5 秒 | 30 秒 |
| **剔除时间** | 15 秒 | 90 秒 |
| **控制台** | 有（功能丰富） | 无（需自行开发） |
| **元数据** | 支持自定义元数据 | 支持 |
| **服务分组** | 支持（namespace + group） | 不支持 |
| **维护状态** | 活跃 | Spring Cloud 2020+ 不推荐 |
| **社区** | 国内活跃 | 国外为主 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**选型建议**：
- **新项目**：优先选择 Nacos（功能全面、社区活跃）
- **老项目**：已使用 Eureka 可以继续，但建议逐步迁移
- **混合使用**：Nacos 和 Eureka 可以共存（通过适配器）

---

## 3. 配置管理

### 3.1 问题背景

传统配置管理的痛点：
- 配置分散在各个服务的 `application.yml` 中
- 配置修改需要重启服务
- 多环境配置管理困难（dev/test/prod）
- 敏感配置（数据库密码）明文存储

**核心需求**：
- 集中管理配置
- 动态刷新配置（无需重启）
- 多环境隔离
- 配置版本管理
- 配置加密

---

### 3.2 Nacos Config

**定位**：阿里开源的配置管理中心，支持动态配置推送。

**核心特性**：
- ✅ 集中管理配置
- ✅ 动态配置推送（自动刷新）
- ✅ 命名空间隔离（namespace）
- ✅ 配置分组（group）
- ✅ 配置版本管理与回滚
- ✅ 配置监听器
- ✅ 灰度发布
- ✅ 可视化控制台

**核心概念**：
```
配置定位 = namespace + group + data-id
- namespace：环境隔离（dev/test/prod）
- group：服务分组（DEFAULT_GROUP/ORDER_GROUP）
- data-id：配置文件名（user-service.yaml）
```

**工作流程**：
```
1. 服务启动 → 从 Nacos 拉取配置
2. Nacos 配置变更 → 推送通知到服务
3. 服务接收通知 → 刷新配置（@RefreshScope）
4. 服务重新加载配置 → 无需重启
```

**典型配置**：
```yaml
# bootstrap.yml（优先级高于 application.yml）
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
        file-extension: yaml
        refresh-enabled: true
```

**适用场景**：
- ✅ 新项目优先选择
- ✅ 需要动态配置推送
- ✅ 需要配置中心 + 服务注册一体化

---

### 3.3 Spring Cloud Config

**定位**：Spring Cloud 官方配置管理组件，基于 Git 仓库。

**核心特性**：
- ✅ 基于 Git/SVN 存储配置
- ✅ 多环境配置（{application}-{profile}.yml）
- ✅ 配置加密解密
- ✅ 配置刷新（需手动触发 `/actuator/refresh`）
- ❌ 不支持配置推送（需配合 Spring Cloud Bus）
- ❌ 无可视化控制台

**架构**：
```
Git 仓库（配置存储）
    ↓
Config Server（配置服务器）
    ↓
Config Client（各个微服务）
```

**典型配置**：
```yaml
# Config Server
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/xxx/config-repo
          search-paths: config
          default-label: main

# Config Client
spring:
  cloud:
    config:
      uri: http://localhost:8888
      profile: dev
      label: main
```

**适用场景**：
- ✅ 已有 Git 仓库管理配置
- ✅ 需要配置版本管理（Git 历史）
- ❌ 不需要实时配置推送

---

### 3.4 Nacos Config vs Spring Cloud Config 对比

| 维度 | Nacos Config | Spring Cloud Config |
|------|--------------|---------------------|
| **存储** | 内置数据库 | Git/SVN |
| **动态刷新** | 自动推送 | 手动触发 |
| **控制台** | 有（功能丰富） | 无 |
| **配置监听** | 支持 | 不支持 |
| **配置加密** | 支持 | 支持 |
| **多环境** | namespace + group | profile |
| **版本管理** | 内置版本管理 | 依赖 Git |
| **性能** | 高（本地缓存） | 中（需访问 Config Server） |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**选型建议**：
- **新项目**：优先选择 Nacos Config（动态推送、控制台友好）
- **已有 Git 配置仓库**：可以考虑 Spring Cloud Config
- **需要配置审计**：Git 仓库天然支持历史记录

---

## 4. 负载均衡

### 4.1 问题背景

微服务架构中，一个服务通常有多个实例：
- 如何选择调用哪个实例？
- 如何实现负载均衡策略？
- 如何避免调用不健康的实例？

**负载均衡类型**：
- **服务端负载均衡**：Nginx/F5，客户端请求到负载均衡器，由负载均衡器转发
- **客户端负载均衡**：LoadBalancer/Ribbon，客户端自己选择服务实例

---

### 4.2 Spring Cloud LoadBalancer

**定位**：Spring Cloud 官方推荐的客户端负载均衡组件。

**核心特性**：
- ✅ 轻量级（相比 Ribbon）
- ✅ 响应式支持（WebFlux）
- ✅ 内置策略：轮询（默认）、随机
- ✅ 支持自定义策略
- ✅ 健康检查
- ✅ Spring Cloud 2020+ 官方推荐

**工作流程**：
```
1. Feign 调用 → LoadBalancer 拦截
2. 从服务注册中心获取实例列表
3. 根据负载均衡策略选择一个实例
4. 发起 HTTP 请求
```

**典型配置**：
```yaml
spring:
  cloud:
    loadbalancer:
      ribbon:
        enabled: false  # 禁用 Ribbon
      cache:
        enabled: true
        ttl: 35s
```

**适用场景**：
- ✅ Spring Cloud 2020+ 项目
- ✅ 需要响应式支持
- ✅ 轻量级需求

---

### 4.3 Ribbon

**定位**：Netflix OSS 客户端负载均衡组件。

**核心特性**：
- ✅ 7 种负载均衡策略
- ✅ 重试机制
- ✅ 超时配置
- ✅ 饥饿加载
- ❌ 已停止维护（Spring Cloud 2020+ 移除）

**7 种负载均衡策略**：
1. **RoundRobinRule**：轮询（默认）
2. **RandomRule**：随机
3. **WeightedResponseTimeRule**：响应时间加权
4. **BestAvailableRule**：最低并发
5. **RetryRule**：重试
6. **AvailabilityFilteringRule**：可用性过滤
7. **ZoneAvoidanceRule**：区域感知

**适用场景**：
- ❌ 新项目不推荐
- ✅ 老项目迁移中

---

### 4.4 LoadBalancer vs Ribbon 对比

| 维度 | LoadBalancer | Ribbon |
|------|--------------|--------|
| **维护状态** | 活跃 | 已停止维护 |
| **性能** | 高（轻量级） | 中 |
| **响应式** | 支持 | 不支持 |
| **负载策略** | 2 种（可扩展） | 7 种 |
| **配置复杂度** | 简单 | 复杂 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**迁移建议**：
- 老项目从 Ribbon 迁移到 LoadBalancer
- 只需移除 Ribbon 依赖，LoadBalancer 会自动生效

---

## 5. 服务调用 - OpenFeign

### 5.1 问题背景

服务间调用的痛点：
```java
// 原始 RestTemplate 调用
String url = "http://user-service/users/" + userId;
RestTemplate restTemplate = new RestTemplate();
User user = restTemplate.getForObject(url, User.class);
```

**问题**：
- 代码冗余，每次调用都要拼接 URL
- 参数序列化、异常处理繁琐
- 难以统一管理（超时、重试、降级）

---

### 5.2 OpenFeign 核心特性

**定位**：声明式 HTTP 客户端，像调用本地方法一样调用远程服务。

**核心特性**：
- ✅ 声明式调用（注解驱动）
- ✅ 集成 LoadBalancer/Ribbon（自动负载均衡）
- ✅ 集成 Sentinel/Hystrix（熔断降级）
- ✅ 请求拦截器（统一添加请求头）
- ✅ 编解码器（自动序列化/反序列化）
- ✅ 日志配置（4 种级别）
- ✅ 超时重试配置

**使用示例**：
```java
@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/users/{id}")
    User getUserById(@PathVariable Long id);
    
    @PostMapping("/users")
    User createUser(@RequestBody User user);
}
```

**工作流程**：
```
1. @FeignClient 注解 → Spring 生成动态代理
2. 方法调用 → 构建 RequestTemplate
3. LoadBalancer 选择服务实例
4. 发起 HTTP 请求
5. 响应解码 → 返回结果
```

**适用场景**：
- ✅ 所有需要服务间调用的场景
- ✅ 替代 RestTemplate

---

## 6. 服务网关 - Spring Cloud Gateway

### 6.1 问题背景

微服务架构的网关需求：
- 客户端需要知道所有服务的地址（耦合度高）
- 如何统一认证鉴权？
- 如何统一限流熔断？
- 如何处理跨域？
- 如何统一日志监控？

---

### 6.2 Spring Cloud Gateway 核心特性

**定位**：基于 Spring WebFlux 的响应式网关，高性能。

**核心概念**：
- **Route（路由）**：路由规则
- **Predicate（断言）**：路由匹配条件
- **Filter（过滤器）**：请求/响应处理

**核心特性**：
- ✅ 响应式编程（WebFlux + Netty）
- ✅ 11 种 Predicate（路径、方法、请求头、请求参数等）
- ✅ 30+ 种内置 Filter
- ✅ 自定义 Filter（全局/局部）
- ✅ 限流（RequestRateLimiter）
- ✅ 熔断（集成 Sentinel/Resilience4j）
- ✅ 重试、超时、跨域配置
- ✅ 动态路由

**路由配置示例**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/user/**
          filters:
            - StripPrefix=1
```

**工作流程**：
```
客户端请求 → Gateway
    ↓
Predicate 匹配路由
    ↓
Filter 链处理（请求前）
    ↓
转发到后端服务
    ↓
Filter 链处理（响应后）
    ↓
返回客户端
```

**适用场景**：
- ✅ 所有微服务项目都需要网关
- ✅ Spring Cloud 2020+ 官方推荐

---

### 6.3 Gateway vs Zuul 对比

| 维度 | Spring Cloud Gateway | Zuul 1 |
|------|----------------------|--------|
| **编程模型** | 响应式（WebFlux） | 同步阻塞（Servlet） |
| **性能** | 高 | 中 |
| **底层** | Netty | Tomcat/Jetty |
| **Filter** | 30+ 内置 | 少 |
| **维护状态** | 活跃 | 已停止维护 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**选型建议**：
- **新项目**：优先选择 Gateway
- **老项目**：从 Zuul 迁移到 Gateway

---

## 7. 熔断降级

### 7.1 问题背景

**服务雪崩**：
```
服务 A → 服务 B → 服务 C
如果服务 C 故障，导致服务 B 等待超时，进而导致服务 A 也不可用。
```

**核心需求**：
- 快速失败，避免资源耗尽
- 熔断恢复（自动重试）
- 降级处理（提供默认响应）
- 限流保护（避免过载）

---

### 7.2 Sentinel

**定位**：阿里开源的流量控制 + 熔断降级组件。

**核心特性**：
- ✅ 流量控制（QPS/线程数）
- ✅ 熔断降级（慢调用/异常比例/异常数）
- ✅ 热点参数限流
- ✅ 系统自适应保护
- ✅ 集群流控
- ✅ 规则持久化（Nacos/Apollo）
- ✅ 可视化控制台

**工作流程**：
```
请求 → Sentinel 拦截 → 判断是否超过阈值
    ↓
超过阈值 → 快速失败/排队等待
    ↓
未超过 → 正常调用
```

**适用场景**：
- ✅ 新项目优先选择
- ✅ 需要流控 + 熔断一体化

---

### 7.3 Resilience4j

**定位**：轻量级容错库，Hystrix 的替代者。

**核心模块**：
- **CircuitBreaker**：熔断器
- **RateLimiter**：限流器
- **Bulkhead**：隔离舱
- **Retry**：重试
- **TimeLimiter**：超时

**适用场景**：
- ✅ 需要轻量级容错方案
- ✅ 不需要可视化控制台

---

### 7.4 Sentinel vs Resilience4j vs Hystrix 对比

| 维度 | Sentinel | Resilience4j | Hystrix |
|------|----------|--------------|---------|
| **流量控制** | 支持 | 支持 | 不支持 |
| **熔断降级** | 支持 | 支持 | 支持 |
| **控制台** | 有 | 无 | 有（Dashboard） |
| **性能** | 高 | 高 | 中 |
| **维护状态** | 活跃 | 活跃 | 已停止维护 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

**选型建议**：
- **新项目**：优先选择 Sentinel（功能全面、控制台友好）
- **轻量级需求**：选择 Resilience4j
- **老项目**：从 Hystrix 迁移

---

## 8. 消息驱动 - Spring Cloud Stream

### 8.1 问题背景

服务间通信方式：
- **同步调用**：Feign（实时性高、耦合度高）
- **异步调用**：消息队列（解耦、削峰填谷）

**原生 Kafka/RabbitMQ 的问题**：
- 代码与中间件强耦合
- 切换消息中间件需要修改代码
- 配置复杂

---

### 8.2 Spring Cloud Stream 核心特性

**定位**：消息驱动微服务框架，屏蔽 Kafka/RabbitMQ 差异。

**核心概念**：
- **Binder**：与消息中间件的适配器
- **Binding**：消息通道（Input/Output）
- **Message**：消息体

**核心特性**：
- ✅ 统一编程模型（屏蔽中间件差异）
- ✅ 支持 Kafka/RabbitMQ/RocketMQ
- ✅ 消息分区
- ✅ 消费者组
- ✅ 消息重试与死信队列
- ✅ 消息事务

**使用示例**：
```java
// 生产者
@Autowired
private StreamBridge streamBridge;

public void sendOrder(Order order) {
    streamBridge.send("order-out-0", order);
}

// 消费者
@Bean
public Consumer<Order> orderProcessor() {
    return order -> {
        System.out.println("处理订单: " + order);
    };
}
```

**适用场景**：
- ✅ 需要异步解耦
- ✅ 需要削峰填谷
- ✅ 需要切换消息中间件的灵活性

---

## 9. 链路追踪 - Sleuth + Zipkin

### 9.1 问题背景

微服务调用链路长：
```
客户端 → 网关 → 用户服务 → 订单服务 → 支付服务
```

**核心问题**：
- 如何追踪完整调用链路？
- 如何定位性能瓶颈？
- 如何分析服务依赖关系？

---

### 9.2 Sleuth + Zipkin 核心特性

**Sleuth**：分布式链路追踪客户端
- 自动生成 TraceId/SpanId
- 自动传递追踪信息

**Zipkin**：链路追踪服务端
- 收集链路数据
- 可视化展示调用链路

**核心概念**：
- **TraceId**：全局唯一的追踪 ID
- **SpanId**：单个服务调用的 ID

**工作流程**：
```
网关（生成 TraceId: 123）
    ↓
用户服务（SpanId: 1）
    ↓
订单服务（SpanId: 2）
    ↓
所有数据上报到 Zipkin
```

**适用场景**：
- ✅ 所有微服务项目都需要
- ✅ 定位性能瓶颈
- ✅ 分析服务依赖关系

---

## 10. 分布式事务 - Seata

### 10.1 问题背景

跨服务操作的数据一致性：
```
订单服务创建订单 → 库存服务扣减库存 → 支付服务扣款
如果支付失败，如何回滚订单和库存？
```

---

### 10.2 Seata 核心特性

**定位**：分布式事务框架，支持 AT/TCC/SAGA/XA 模式。

**4 种事务模式**：
1. **AT 模式**：自动补偿（推荐）
2. **TCC 模式**：手动补偿
3. **SAGA 模式**：长事务
4. **XA 模式**：强一致性

**核心组件**：
- **TC（Transaction Coordinator）**：全局事务协调器
- **TM（Transaction Manager）**：事务管理器
- **RM（Resource Manager）**：资源管理器

**工作流程（AT 模式）**：
```
1. TM 开启全局事务
2. RM 执行本地事务（记录 undo_log）
3. TM 提交全局事务
4. RM 删除 undo_log

如果失败：
1. TM 回滚全局事务
2. RM 根据 undo_log 回滚数据
```

**适用场景**：
- ✅ 需要保证数据强一致性
- ✅ AT 模式适合大部分场景
- ✅ TCC 模式适合高性能场景

---

## 11. 组件协作关系

### 11.1 完整调用链路

```
客户端
    ↓
Gateway（路由转发、鉴权、限流）
    ↓
Sleuth（生成 TraceId）
    ↓
Feign（服务调用）
    ↓
LoadBalancer（负载均衡，从 Nacos 获取实例列表）
    ↓
Sentinel（熔断降级）
    ↓
订单服务（从 Nacos Config 读取配置）
    ↓
Stream（发送消息到 Kafka）
    ↓
Seata（分布式事务）
    ↓
Zipkin（上报链路数据）
```

---

## 12. 组件选型建议

### 12.1 推荐组合（Spring Cloud Alibaba）

```
服务注册发现：Nacos Discovery ⭐⭐⭐⭐⭐
配置管理：Nacos Config ⭐⭐⭐⭐⭐
负载均衡：LoadBalancer ⭐⭐⭐⭐⭐
服务调用：OpenFeign ⭐⭐⭐⭐⭐
服务网关：Spring Cloud Gateway ⭐⭐⭐⭐⭐
熔断降级：Sentinel ⭐⭐⭐⭐⭐
消息驱动：Spring Cloud Stream + Kafka ⭐⭐⭐⭐⭐
链路追踪：Sleuth + Zipkin ⭐⭐⭐⭐
分布式事务：Seata ⭐⭐⭐⭐
```

**优势**：
- 国内社区活跃，中文文档完善
- 阿里生产环境验证
- 组件协作良好

---

### 12.2 经典组合（Spring Cloud Netflix）

```
服务注册发现：Eureka ⭐⭐⭐
配置管理：Spring Cloud Config ⭐⭐⭐
负载均衡：Ribbon → LoadBalancer ⭐⭐⭐
服务调用：OpenFeign ⭐⭐⭐⭐⭐
服务网关：Zuul → Gateway ⭐⭐⭐⭐⭐
熔断降级：Hystrix → Resilience4j ⭐⭐⭐⭐
```

**问题**：
- 部分组件已停止维护（Ribbon/Hystrix/Zuul 1）
- 需要逐步迁移到新组件

---

## 13. 面试准备专项

### 高频面试题

**题目 1：Spring Cloud 有哪些核心组件？**

**标准回答**：

**第一层（基础回答）**：
Spring Cloud 核心组件包括：服务注册发现（Nacos/Eureka）、配置管理（Nacos Config/Spring Cloud Config）、负载均衡（LoadBalancer）、服务调用（Feign）、服务网关（Gateway）、熔断降级（Sentinel）、消息驱动（Stream）、链路追踪（Sleuth + Zipkin）、分布式事务（Seata）。

**第二层（深入原理）**：
- **服务注册发现**：解决服务实例动态变化问题，通过心跳机制健康检查
- **配置管理**：解决配置集中管理和动态刷新
- **负载均衡**：客户端负载均衡，从注册中心获取实例列表，根据策略选择
- **服务调用**：Feign 声明式调用，动态代理生成 HTTP 请求
- **服务网关**：统一入口，路由转发、鉴权、限流
- **熔断降级**：快速失败，避免服务雪崩
- **消息驱动**：异步解耦，屏蔽中间件差异
- **链路追踪**：TraceId/SpanId 追踪完整调用链路
- **分布式事务**：AT/TCC/SAGA 模式保证数据一致性

**第三层（扩展延伸）**：
- Spring Cloud 和 Spring Cloud Alibaba 的选择
- 组件之间的协作关系（如 Feign + LoadBalancer + Sentinel）
- 生产环境的组件选型和配置优化经验

**加分项**：
- 提到自己项目中使用的组件组合
- 提到组件选型的权衡（如 Nacos vs Eureka）
- 提到遇到的问题和解决方案

---

**题目 2：Nacos 和 Eureka 的区别？**

**标准回答**：

**第一层（基础回答）**：
Nacos 支持服务注册 + 配置管理，Eureka 只支持服务注册。Nacos 是阿里开源，有可视化控制台，Eureka 是 Netflix OSS。

**第二层（深入原理）**：
- **功能**：Nacos 一体化（服务注册 + 配置管理），Eureka 只有服务注册
- **一致性**：Nacos 支持 AP/CP 切换，Eureka 是 AP（最终一致性）
- **健康检查**：Nacos 支持心跳 + HTTP/TCP 探测，Eureka 只有心跳
- **响应速度**：Nacos 心跳 5 秒、剔除 15 秒，Eureka 心跳 30 秒、剔除 90 秒
- **控制台**：Nacos 有功能丰富的控制台，Eureka 需要自行开发
- **服务分组**：Nacos 支持 namespace + group，Eureka 不支持

**第三层（扩展延伸）**：
- Nacos 的临时实例和持久化实例（AP/CP 模式）
- Eureka 的自我保护机制
- 生产环境的选型建议：新项目选 Nacos，老项目可以继续用 Eureka

**加分项**：
- 提到 Nacos 的源码实现（心跳机制、服务剔除）
- 提到 Eureka 的多级缓存架构
- 提到从 Eureka 迁移到 Nacos 的经验

---

**题目 3：为什么选择 Spring Cloud Gateway 而不是 Zuul？**

**标准回答**：

**第一层（基础回答）**：
Gateway 基于 WebFlux 响应式编程，性能更高。Zuul 1 基于 Servlet 同步阻塞，已停止维护。Gateway 是 Spring Cloud 官方推荐。

**第二层（深入原理）**：
- **编程模型**：Gateway 是响应式（WebFlux + Netty），Zuul 1 是同步阻塞（Servlet）
- **性能**：Gateway 高并发性能更好，Zuul 1 线程模型限制性能
- **功能**：Gateway 提供 30+ 内置 Filter，Zuul 1 需要自行开发
- **维护状态**：Gateway 活跃开发，Zuul 1 已停止维护
- **扩展性**：Gateway 提供 Predicate + Filter 灵活扩展，Zuul 1 扩展性差

**第三层（扩展延伸）**：
- Gateway 的 FilterChain 责任链模式
- Gateway 的限流熔断集成（Sentinel/Resilience4j）
- 从 Zuul 迁移到 Gateway 的实践经验

**加分项**：
- 提到 Gateway 的性能测试对比数据
- 提到 Gateway 的源码实现（RouteLocator、FilterChain）
- 提到生产环境的 Gateway 配置优化

---

## 14. 学习自检清单

- [ ] 能够说清楚 Spring Cloud 核心组件及其作用
- [ ] 理解服务注册发现、配置管理、负载均衡的原理
- [ ] 掌握 Nacos vs Eureka、Gateway vs Zuul 的对比
- [ ] 了解 Feign、Stream、Sentinel、Seata 的核心特性
- [ ] 能够根据场景选择合适的组件组合
- [ ] 理解组件之间的协作关系
- [ ] 能够流畅回答组件对比类面试题

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：组件选型、组件协作关系
- **前置知识**：第1章微服务架构概述
- **实践建议**：搭建一个简单的微服务环境，集成 Nacos + Feign + Gateway

---

## 15. 参考资料

- [Spring Cloud 官方文档](https://spring.io/projects/spring-cloud)
- [Spring Cloud Alibaba 官方文档](https://github.com/alibaba/spring-cloud-alibaba)
- [Nacos 官方文档](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Sentinel 官方文档](https://sentinelguard.io/zh-cn/)
- [Seata 官方文档](https://seata.io/zh-cn/)

---

**本章小结**：
- Spring Cloud 提供了一整套微服务解决方案，覆盖服务治理、服务通信、服务保护、服务监控等
- 推荐组合：Nacos（服务注册 + 配置） + LoadBalancer + Feign + Gateway + Sentinel + Stream + Sleuth + Seata
- 组件选型需要考虑团队技术栈、维护状态、社区活跃度、功能完整性
- 各组件之间协作良好，形成完整的微服务生态

**下一章预告**：第3章将介绍如何快速搭建微服务项目，包括多模块项目结构设计、依赖版本管理、脚手架搭建。

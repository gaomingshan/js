# Spring Cloud 微服务架构系统化学习大纲

> **学习定位**：面向有 Spring Boot 基础的开发者，系统学习 Spring Cloud 微服务架构  
> **核心重点**：组件引入 + 自定义配置 + 最佳使用 + 深入原理  
> **总章节数**：35 章  
> **学习目标**：掌握微服务核心组件，具备微服务架构设计能力，应对工作与面试

---

## 第一部分：微服务架构基础（3章）

### [第1章：微服务架构概述](./content/content-1.md)
**核心内容**：
- 单体架构 vs 微服务架构
- 微服务架构核心问题与解决方案
- Spring Cloud 生态全景图
- 微服务架构设计原则

**学习目标**：
- 理解微服务架构的优势与挑战
- 了解 Spring Cloud 核心组件分布
- 掌握微服务拆分原则

---

### [第2章：Spring Cloud 核心组件介绍](./content/content-2.md)
**核心内容**：
- 服务注册与发现（Nacos/Eureka）
- 配置管理（Nacos Config/Spring Cloud Config）
- 负载均衡（LoadBalancer/Ribbon）
- 服务调用（OpenFeign）
- 服务网关（Gateway）
- 熔断降级（Sentinel/Resilience4j）
- 消息驱动（Stream）
- 链路追踪（Sleuth + Zipkin）
- 分布式事务（Seata）

**学习目标**：
- 了解各组件解决的核心问题
- 掌握组件之间的协作关系
- 理解组件选型标准

---

### [第3章：微服务项目快速搭建](./content/content-3.md)
**核心内容**：
- 多模块 Maven 项目结构设计
- 依赖版本管理（Spring Cloud BOM）
- 父子工程依赖管理
- 微服务项目脚手架搭建
- 快速验证环境

**学习目标**：
- 掌握微服务项目结构设计
- 理解依赖版本管理最佳实践
- 能够快速搭建微服务环境

---

## 第二部分：服务注册与发现（4章）

### [第4章：Nacos Discovery 快速入门](./content/content-4.md)
**核心内容**：
- Nacos 服务端安装与启动
- 依赖引入与最小化配置
- 服务注册验证
- Nacos 控制台使用
- 服务发现基础使用

**学习目标**：
- 掌握 Nacos 快速接入
- 理解服务注册发现基本流程
- 能够使用 Nacos 控制台管理服务

---

### [第5章：Nacos Discovery 自定义配置与原理](./content/content-5.md)
**核心内容**：
- Nacos 核心配置项详解
- 命名空间与分组管理
- 服务元数据自定义
- 临时实例 vs 持久化实例
- 心跳机制与健康检查
- AP/CP 模式选择
- 服务注册发现原理源码分析

**学习目标**：
- 掌握 Nacos 核心配置项
- 理解服务注册发现底层原理
- 能够根据场景选择合适配置

---

### [第6章：Eureka 注册中心](./content/content-6.md)
**核心内容**：
- Eureka Server 搭建
- Eureka Client 配置
- 服务注册与发现原理
- 自我保护机制
- 服务剔除机制
- 多级缓存架构
- Eureka vs Nacos 对比

**学习目标**：
- 掌握 Eureka 基本使用
- 理解 Eureka 核心原理
- 能够对比 Eureka 和 Nacos

---

### [第7章：服务发现最佳实践](./content/content-7.md)
**核心内容**：
- 服务实例健康检查策略
- 服务优雅上下线
- 灰度发布与金丝雀部署
- 多环境服务隔离
- 跨地域服务访问
- 常见问题排查（服务未注册、服务无法发现）

**学习目标**：
- 掌握服务发现生产最佳实践
- 理解灰度发布实现方案
- 能够排查服务发现常见问题

---

## 第三部分：配置管理（5章）⭐

### [第8章：Nacos Config 快速入门](./content/content-8.md)
**核心内容**：
- Nacos Config 依赖引入
- bootstrap.yml vs application.yml
- 配置文件命名规范
- 配置加载验证
- 配置热更新基础使用

**学习目标**：
- 掌握 Nacos Config 快速接入
- 理解 bootstrap.yml 作用
- 能够实现配置热更新

---

### [第9章：Nacos Config 自定义配置详解](./content/content-9.md)
**核心内容**：
- 核心配置项详解（namespace/group/data-id）
- 配置文件格式（yaml/properties/json）
- 共享配置与扩展配置
- 配置优先级规则
- 配置监听器原理
- 配置加密方案
- 配置灰度发布

**学习目标**：
- 掌握 Nacos Config 核心配置
- 理解配置优先级与加载机制
- 能够实现配置分层管理

---

### [第10章：配置动态刷新原理](./content/content-10.md)
**核心内容**：
- @RefreshScope 注解原理
- @ConfigurationProperties 动态绑定
- ConfigurableEnvironment 扩展
- 配置变更监听机制
- 配置刷新源码分析
- 配置刷新最佳实践

**学习目标**：
- 理解配置动态刷新底层原理
- 掌握 @RefreshScope 使用场景
- 能够排查配置不生效问题

---

### [第11章：Spring Cloud Config 实践](./content/content-11.md)
**核心内容**：
- Config Server 搭建
- Git 仓库配置管理
- Config Client 配置
- 配置加密解密
- 配置刷新机制（/actuator/refresh）
- Spring Cloud Bus 消息总线
- Config vs Nacos Config 对比

**学习目标**：
- 掌握 Spring Cloud Config 使用
- 理解 Git 配置管理方案
- 能够对比两种配置中心

---

### [第12章：配置中心生产最佳实践](./content/content-12.md)
**核心内容**：
- 配置分层管理策略（公共配置/应用配置/环境配置）
- 配置版本管理与回滚
- 配置权限控制
- 敏感信息加密
- 配置变更审计
- 多环境配置隔离
- 配置中心选型建议
- 常见问题排查

**学习目标**：
- 掌握配置管理最佳实践
- 理解配置安全加固方案
- 能够设计配置管理体系

---

## 第四部分：负载均衡（3章）⭐

### [第13章：Spring Cloud LoadBalancer 原理](./content/content-13.md)
**核心内容**：
- LoadBalancer 快速入门
- 客户端负载均衡原理
- ReactiveLoadBalancer 接口
- RoundRobinLoadBalancer 源码
- RandomLoadBalancer 源码
- 与服务发现集成
- 健康检查机制

**学习目标**：
- 理解客户端负载均衡原理
- 掌握 LoadBalancer 核心源码
- 能够调试负载均衡流程

---

### [第14章：负载均衡策略与自定义](./content/content-14.md)
**核心内容**：
- 自定义负载均衡策略
- 基于权重的负载均衡
- 基于版本的灰度路由
- 同区域优先策略
- 重试机制配置
- 负载均衡配置最佳实践

**学习目标**：
- 掌握自定义负载均衡策略
- 理解灰度路由实现方案
- 能够优化负载均衡配置

---

### [第15章：Ribbon 深入与对比](./content/content-15.md)
**核心内容**：
- Ribbon 核心组件（IRule/IPing/ServerList）
- 7种负载均衡策略详解
- Ribbon 饥饿加载
- 超时与重试配置
- Ribbon 源码分析
- Ribbon vs LoadBalancer 对比
- 迁移方案

**学习目标**：
- 理解 Ribbon 核心原理
- 掌握 Ribbon 配置优化
- 能够从 Ribbon 迁移到 LoadBalancer

---

## 第五部分：服务调用 - OpenFeign（5章）⭐⭐

### [第16章：OpenFeign 快速入门](./content/content-16.md)
**核心内容**：
- Feign 依赖引入
- @EnableFeignClients 注解
- @FeignClient 基础使用
- 参数传递（@PathVariable/@RequestParam/@RequestBody）
- Feign 调用验证
- Feign vs RestTemplate 对比

**学习目标**：
- 掌握 Feign 快速接入
- 理解 Feign 声明式调用优势
- 能够使用 Feign 进行服务调用

---

### [第17章：Feign 自定义配置详解](./content/content-17.md)
**核心内容**：
- Feign 核心配置项详解
- 超时配置（connectTimeout/readTimeout）
- 重试策略配置
- 请求拦截器（RequestInterceptor）
- 日志级别配置（NONE/BASIC/HEADERS/FULL）
- 编解码器配置（Encoder/Decoder）
- 降级配置（fallback/fallbackFactory）
- 契约配置（Contract）
- 配置优先级

**学习目标**：
- 掌握 Feign 核心配置项
- 理解 Feign 扩展点
- 能够根据场景自定义 Feign 配置

---

### [第18章：Feign 动态代理原理](./content/content-18.md)
**核心内容**：
- @FeignClient 注解处理
- FeignClientFactoryBean 源码
- 动态代理生成原理（JDK Proxy）
- RequestTemplate 构建
- MethodHandler 调用链
- Feign + LoadBalancer 协作流程
- 编解码流程
- Contract 接口解析

**学习目标**：
- 理解 Feign 动态代理原理
- 掌握 Feign 核心源码
- 能够调试 Feign 调用流程

---

### [第19章：Feign 超时重试与性能优化](./content/content-19.md)
**核心内容**：
- 超时配置最佳实践
- 重试机制深入（Retryer）
- HTTP 客户端选择（HttpClient/OkHttp）
- 连接池配置优化
- GZIP 压缩
- 日志性能影响
- 批量调用优化
- 性能监控与指标

**学习目标**：
- 掌握 Feign 性能优化方案
- 理解超时重试最佳实践
- 能够排查 Feign 性能问题

---

### [第20章：Feign 最佳实践与故障排查](./content/content-20.md)
**核心内容**：
- Feign 降级处理最佳实践
- Feign 异常处理
- 请求头传递（链路追踪ID/用户信息）
- 文件上传下载
- 常见问题排查（调用超时/404/500）
- Feign 调用链路追踪
- 生产配置建议

**学习目标**：
- 掌握 Feign 生产最佳实践
- 理解 Feign 异常处理机制
- 能够排查 Feign 常见问题

---

## 第六部分：服务网关 - Gateway（5章）⭐⭐

### [第21章：Gateway 快速入门](./content/content-21.md)
**核心内容**：
- Gateway 依赖引入
- 网关架构设计
- 路由配置基础（uri/predicates/filters）
- 路由转发验证
- Gateway vs Zuul 对比
- WebFlux 响应式编程基础

**学习目标**：
- 掌握 Gateway 快速接入
- 理解网关在微服务中的作用
- 能够配置基础路由规则

---

### [第22章：路由配置与 Predicate 断言](./content/content-22.md)
**核心内容**：
- 路由配置详解（代码配置 vs yaml 配置）
- 11种内置 Predicate 详解
  - Path/Method/Header/Query/Cookie/Host/RemoteAddr/Weight/Before/After/Between
- Predicate 组合使用
- 动态路由配置
- 路由优先级
- 路由刷新机制

**学习目标**：
- 掌握 Gateway Predicate 使用
- 理解路由匹配规则
- 能够实现动态路由

---

### [第23章：Filter 过滤器详解](./content/content-23.md)
**核心内容**：
- Filter 工作原理
- 内置 GatewayFilter 详解（30+种）
  - AddRequestHeader/RemoveRequestHeader
  - AddResponseHeader/RemoveResponseHeader
  - StripPrefix/PrefixPath/RewritePath
  - SetStatus/Retry/RequestSize
- GlobalFilter 全局过滤器
- Filter 执行顺序
- 自定义 Filter 开发
- Filter 最佳实践

**学习目标**：
- 掌握 Gateway Filter 使用
- 理解 Filter 责任链模式
- 能够开发自定义 Filter

---

### [第24章：Gateway 限流熔断与鉴权](./content/content-24.md)
**核心内容**：
- RequestRateLimiter 限流配置
- 令牌桶限流算法
- Redis 限流实现
- 自定义限流策略
- 熔断降级集成（Sentinel/Resilience4j）
- 统一鉴权方案（JWT/OAuth2）
- 跨域配置（CORS）
- IP 黑白名单

**学习目标**：
- 掌握 Gateway 限流熔断
- 理解令牌桶算法
- 能够实现统一鉴权

---

### [第25章：Gateway 原理深入与性能优化](./content/content-25.md)
**核心内容**：
- Gateway 启动流程
- RouteLocator 路由定位
- FilterChain 过滤器链执行
- WebFlux 响应式原理
- Netty 网络模型
- 性能优化配置
- 连接池优化
- 内存调优
- 常见问题排查（路由404/转发超时/网关OOM）

**学习目标**：
- 理解 Gateway 核心原理
- 掌握 Gateway 性能优化
- 能够排查 Gateway 常见问题

---

## 第七部分：熔断降级（3章）⭐

### [第26章：Sentinel 流量控制](./content/content-26.md)
**核心内容**：
- Sentinel 快速入门
- @SentinelResource 注解
- 流量控制规则（QPS/线程数）
- 流控效果（快速失败/Warm Up/排队等待）
- 流控模式（直接/关联/链路）
- 热点参数限流
- 系统自适应保护
- Sentinel 控制台使用

**学习目标**：
- 掌握 Sentinel 流量控制
- 理解限流算法
- 能够配置流控规则

---

### [第27章：Sentinel 熔断降级与规则配置](./content/content-27.md)
**核心内容**：
- 熔断降级规则（慢调用/异常比例/异常数）
- 熔断状态转换
- 降级处理（blockHandler/fallback）
- 规则持久化（文件/Nacos/Apollo）
- 集群流控
- 网关限流集成
- Sentinel vs Hystrix 对比

**学习目标**：
- 掌握 Sentinel 熔断降级
- 理解熔断状态机
- 能够实现规则持久化

---

### [第28章：Resilience4j 实践](./content/content-28.md)
**核心内容**：
- Resilience4j 快速入门
- CircuitBreaker 熔断器
- RateLimiter 限流器
- Bulkhead 隔离舱
- Retry 重试
- TimeLimiter 超时
- 与 Spring Boot 集成
- Resilience4j vs Sentinel 对比

**学习目标**：
- 掌握 Resilience4j 使用
- 理解容错模式
- 能够对比两种熔断方案

---

## 第八部分：消息驱动 - Stream（3章）⭐⭐

### [第29章：Spring Cloud Stream 快速入门](./content/content-29.md)
**核心内容**：
- Stream 架构设计
- Binder 抽象概念
- 依赖引入（Kafka/RabbitMQ）
- 生产者开发（StreamBridge）
- 消费者开发（@Bean Consumer）
- 消息发送与消费验证
- Stream vs 原生客户端对比

**学习目标**：
- 掌握 Stream 快速接入
- 理解 Binder 抽象
- 能够实现消息收发

---

### [第30章：Stream Binder 与消息可靠性](./content/content-30.md)
**核心内容**：
- Binder 配置详解
- 消息分区策略
- 消费者组配置
- 消息确认机制
- 消息重试与死信队列
- 消息幂等性保证
- 消息顺序性保证
- 事务消息
- 错误处理策略

**学习目标**：
- 掌握 Stream 核心配置
- 理解消息可靠性保证
- 能够处理消息异常

---

### [第31章：Stream 高级特性与最佳实践](./content/content-31.md)
**核心内容**：
- 动态绑定
- 条件绑定
- 多 Binder 配置
- 消息转换器
- 消息拦截器
- 性能优化配置
- Kafka Stream 集成
- 常见问题排查
- 生产最佳实践

**学习目标**：
- 掌握 Stream 高级特性
- 理解消息驱动架构设计
- 能够优化消息性能

---

## 第九部分：链路追踪与分布式事务（3章）

### [第32章：Sleuth + Zipkin 链路追踪](./content/content-32.md)
**核心内容**：
- Sleuth 快速入门
- TraceId/SpanId 原理
- 链路数据采集
- Zipkin Server 部署
- Zipkin 控制台使用
- 链路查询与分析
- 性能影响与采样率
- 链路追踪最佳实践

**学习目标**：
- 掌握 Sleuth + Zipkin 使用
- 理解链路追踪原理
- 能够分析链路调用

---

### [第33章：Seata 分布式事务快速入门](./content/content-33.md)
**核心内容**：
- Seata Server 部署
- AT 模式快速入门
- @GlobalTransactional 注解
- 事务分组配置
- 数据源代理
- undo_log 回滚日志
- 分布式事务验证

**学习目标**：
- 掌握 Seata 快速接入
- 理解 AT 模式原理
- 能够实现分布式事务

---

### [第34章：分布式事务最佳实践](./content/content-34.md)
**核心内容**：
- AT/TCC/SAGA/XA 模式对比
- TCC 模式实践
- SAGA 长事务实践
- 全局锁机制
- 事务隔离级别
- 性能优化
- 最终一致性方案
- 分布式事务选型建议
- 常见问题排查

**学习目标**：
- 理解4种事务模式
- 掌握分布式事务最佳实践
- 能够根据场景选型

---

## 第十部分：综合实战与面试（1章）

### [第35章：微服务架构综合面试题](./content/content-35.md)
**核心内容**：
- **组件选型**（20题）
  - Nacos vs Eureka、Config vs Nacos Config、Gateway vs Zuul、Feign vs RestTemplate、Sentinel vs Hystrix
- **原理深入**（25题）
  - 服务注册发现原理、配置动态刷新原理、Feign 动态代理原理、Gateway 路由匹配原理、Sentinel 限流算法
- **场景分析**（25题）
  - Feign 调用失败处理、配置不生效排查、网关鉴权实现、分布式事务一致性
- **架构设计**（20题）
  - 微服务拆分、服务治理体系、高可用架构、熔断降级策略
- **实战问题**（20题）
  - 服务调用超时排查、网关性能优化、灰度发布、统一配置管理
- **对比分析**（10题）
  - AP vs CP、同步 vs 异步、服务端负载 vs 客户端负载、AT vs TCC

**学习目标**：
- 系统掌握微服务面试题
- 理解面试官追问方向
- 具备面试应答能力

---

## 📚 学习路线图

```
微服务架构基础（3章）
    ↓
服务注册与发现（4章）
    ↓
配置管理（5章）⭐
    ↓
负载均衡（3章）⭐
    ↓
服务调用 - Feign（5章）⭐⭐
    ↓
服务网关 - Gateway（5章）⭐⭐
    ↓
熔断降级（3章）⭐
    ↓
消息驱动 - Stream（3章）⭐⭐
    ↓
链路追踪与分布式事务（3章）
    ↓
综合面试（1章）
```

---

## 🎯 学习建议

**时间规划**：
- 快速入门：1-2 周（第1-7章）
- 核心组件：3-4 周（第8-28章）
- 高级特性：2-3 周（第29-34章）
- 面试准备：1 周（第35章）

**学习方法**：
1. **动手实践**：每个组件都要在本地搭建环境验证
2. **深入源码**：重点组件（Feign/Gateway/Stream）阅读源码
3. **总结对比**：做好组件对比笔记（Nacos vs Eureka）
4. **场景思考**：每个组件思考真实应用场景

**重点章节**：
- ⭐⭐ 第16-20章（Feign）
- ⭐⭐ 第21-25章（Gateway）
- ⭐⭐ 第29-31章（Stream）
- ⭐ 第8-12章（配置管理）
- ⭐ 第13-15章（负载均衡）
- ⭐ 第26-27章（Sentinel）

---

## ✅ 学习自检清单

**基础能力**：
- [ ] 能够快速搭建微服务环境
- [ ] 掌握 Nacos 服务注册与配置管理
- [ ] 理解客户端负载均衡原理
- [ ] 能够使用 Feign 进行服务调用
- [ ] 掌握 Gateway 网关配置

**进阶能力**：
- [ ] 理解 Feign 动态代理原理
- [ ] 掌握 Gateway Filter 开发
- [ ] 能够实现 Sentinel 限流熔断
- [ ] 掌握 Stream 消息驱动
- [ ] 理解链路追踪与分布式事务

**面试能力**：
- [ ] 能够对比各组件优劣
- [ ] 掌握核心组件原理
- [ ] 能够排查常见问题
- [ ] 具备架构设计思维
- [ ] 流畅回答面试题

---

## 📖 配套资源

- **官方文档**：[Spring Cloud 官方文档](https://spring.io/projects/spring-cloud)
- **源码仓库**：[Spring Cloud GitHub](https://github.com/spring-cloud)
- **实战项目**：配套微服务示例项目（待生成）
- **面试题库**：quiz/quiz.md（120道精选题）

---

**开始学习之旅吧！🚀**

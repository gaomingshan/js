# Spring Boot Actuator 源码指引

> spring-boot-actuator 提供生产级监控端点、健康检查、指标度量等功能，用于应用的运维和监控。

---

## 1. 端点体系（Endpoint）

### 核心注解
- **@Endpoint** - 端点注解（技术无关）
- **@WebEndpoint** - Web 端点注解
- **@JmxEndpoint** - JMX 端点注解
- **@ServletEndpoint** - Servlet 端点注解
- **@ControllerEndpoint** - 控制器端点注解
- **@RestControllerEndpoint** - REST 控制器端点注解

### 操作注解
- **@ReadOperation** - 读操作（HTTP GET、JMX read）
- **@WriteOperation** - 写操作（HTTP POST）
- **@DeleteOperation** - 删除操作（HTTP DELETE）
- **@Selector** - 选择器参数

### 端点扩展
- **@EndpointExtension** - 端点扩展注解
- **@EndpointWebExtension** - Web 端点扩展
- **@EndpointJmxExtension** - JMX 端点扩展

### 核心接口
- **EndpointId** - 端点标识
- **Operation** - 操作抽象
- **OperationType** - 操作类型枚举（READ/WRITE/DELETE）
- **InvocationContext** - 调用上下文
- **OperationInvoker** - 操作调用器

### 端点发现
- **EndpointDiscoverer** - 端点发现器接口
- **AnnotationEndpointDiscoverer** - 注解端点发现器
- **PathMappedEndpoints** - 路径映射端点

### 设计目的
提供统一的端点抽象，支持通过 HTTP、JMX、自定义协议暴露监控端点，实现技术无关的监控能力。

### 使用限制与风险
- 端点默认不暴露，需通过配置启用
- 敏感端点需配置安全策略
- 自定义端点需遵循命名规范

---

## 2. Web 端点（WebEndpoint）

### 核心类
- **WebEndpointsSupplier** - Web 端点供应者
- **WebOperation** - Web 操作
- **WebOperationRequestPredicate** - Web 操作请求谓词
- **WebServerNamespace** - Web 服务器命名空间
- **PathMapper** - 路径映射器
- **EndpointMediaTypes** - 端点媒体类型
- **WebEndpointResponse<T>** - Web 端点响应

### Servlet 端点
- **ServletEndpointRegistrar** - Servlet 端点注册器
- **@ServletEndpoint** - Servlet 端点注解（用于需要 Servlet API 的端点）

### 端点路径
- **management.endpoints.web.base-path** - 端点基础路径（默认 /actuator）
- **management.endpoints.web.path-mapping** - 端点路径映射

### 设计目的
将端点暴露为 HTTP REST API，支持 JSON 响应，便于监控系统集成。

### 使用限制与风险
- 需配置端点暴露策略（include/exclude）
- 建议配置 Spring Security 保护敏感端点
- CORS 配置需注意

---

## 3. JMX 端点（JmxEndpoint）

### 核心类
- **JmxEndpointsSupplier** - JMX 端点供应者
- **JmxOperation** - JMX 操作
- **MBeanInfoFactory** - MBean 信息工厂

### 端点暴露
- **management.endpoints.jmx.exposure.include** - 包含的端点
- **management.endpoints.jmx.exposure.exclude** - 排除的端点
- **management.endpoints.jmx.domain** - JMX 域名

### 设计目的
将端点暴露为 JMX MBean，支持 JConsole、VisualVM 等工具监控。

### 使用限制与风险
- 需启用 JMX（默认启用）
- JMX 端点默认全部暴露
- 远程 JMX 需配置安全策略

---

## 4. 健康检查（Health）

### 核心类
- **Health** - 健康状态（核心）
- **Status** - 健康状态枚举
  - UP - 健康
  - DOWN - 不健康
  - OUT_OF_SERVICE - 停止服务
  - UNKNOWN - 未知
- **HealthIndicator** - 健康指标接口
- **AbstractHealthIndicator** - 抽象健康指标
- **HealthContributor** - 健康贡献者接口
- **CompositeHealthContributor** - 组合健康贡献者

### 健康端点
- **HealthEndpoint** - 健康端点
- **HealthEndpointGroups** - 健康端点分组
- **HealthEndpointGroup** - 健康端点组

### 状态聚合
- **StatusAggregator** - 状态聚合器接口
- **SimpleStatusAggregator** - 简单状态聚合器（默认）
- **HttpCodeStatusMapper** - HTTP 状态码映射器

### 健康详情显示
- **ShowDetails** - 显示详情策略枚举
  - NEVER - 从不显示
  - WHEN_AUTHORIZED - 授权时显示
  - ALWAYS - 总是显示
- **management.endpoint.health.show-details** - 配置显示策略
- **management.endpoint.health.show-components** - 配置显示组件

### 内置健康指标
- **DataSourceHealthIndicator** - 数据源健康
- **DiskSpaceHealthIndicator** - 磁盘空间健康
- **PingHealthIndicator** - Ping 健康（总是 UP）
- **RedisHealthIndicator** - Redis 健康
- **MongoHealthIndicator** - MongoDB 健康
- **CassandraHealthIndicator** - Cassandra 健康
- **ElasticsearchHealthIndicator** - Elasticsearch 健康
- **RabbitHealthIndicator** - RabbitMQ 健康
- **MailHealthIndicator** - 邮件服务健康
- **Neo4jHealthIndicator** - Neo4j 健康
- **LdapHealthIndicator** - LDAP 健康

### 健康分组
- **management.endpoint.health.group.*** - 健康分组配置
- 支持不同分组配置不同的显示策略和状态映射

### 设计目的
提供应用和依赖服务的健康状态检查，支持 Kubernetes Liveness/Readiness 探针。

### 使用限制与风险
- 健康检查应快速响应，避免阻塞
- DOWN 状态可能导致容器重启
- 健康详情可能泄露敏感信息

---

## 5. 可用性状态（Availability）

### 核心类
- **ApplicationAvailability** - 应用可用性接口
- **AvailabilityState** - 可用性状态接口
- **LivenessState** - 存活状态枚举
  - CORRECT - 正常
  - BROKEN - 损坏
- **ReadinessState** - 就绪状态枚举
  - ACCEPTING_TRAFFIC - 接受流量
  - REFUSING_TRAFFIC - 拒绝流量

### 可用性变更
- **AvailabilityChangeEvent<S>** - 可用性变更事件
- **ApplicationAvailabilityBean** - 应用可用性 Bean（默认实现）

### 健康指标集成
- **LivenessStateHealthIndicator** - 存活状态健康指标
- **ReadinessStateHealthIndicator** - 就绪状态健康指标

### 设计目的
支持 Kubernetes 的 Liveness 和 Readiness 探针，提供应用可用性状态管理。

### 使用限制与风险
- 需手动发布 AvailabilityChangeEvent 更新状态
- Liveness 失败会导致容器重启
- Readiness 失败会从负载均衡中移除

---

## 6. 指标度量（Metrics）

### 核心类
- **MeterRegistry** - 指标注册表（Micrometer 核心）
- **Meter** - 指标
- **Tag** - 标签
- **MeterBinder** - 指标绑定器接口
- **MeterFilter** - 指标过滤器接口
- **MeterRegistryCustomizer<T>** - 指标注册表定制器

### 指标类型
- **Counter** - 计数器（单调递增）
- **Gauge** - 计量器（瞬时值）
- **Timer** - 计时器（事件持续时间和频率）
- **DistributionSummary** - 分布摘要（事件分布）
- **LongTaskTimer** - 长任务计时器（长时间运行任务）
- **FunctionCounter** - 函数计数器
- **FunctionTimer** - 函数计时器
- **TimeGauge** - 时间计量器

### 指标注册
- **Metrics** - 全局静态注册表访问
- **@Timed** - 计时注解
- **@Counted** - 计数注解

### 内置指标绑定器
- **JvmMemoryMetrics** - JVM 内存指标
- **JvmGcMetrics** - JVM GC 指标
- **JvmThreadMetrics** - JVM 线程指标
- **ClassLoaderMetrics** - 类加载器指标
- **ProcessorMetrics** - 处理器指标
- **FileDescriptorMetrics** - 文件描述符指标
- **UptimeMetrics** - 运行时间指标
- **DiskSpaceMetrics** - 磁盘空间指标
- **LogbackMetrics** - Logback 日志指标
- **DataSourcePoolMetrics** - 数据源连接池指标
- **HibernateMetrics** - Hibernate 指标
- **CacheMetrics** - 缓存指标

### Web 指标
- **WebMvcMetrics** - Spring MVC 指标（请求数、响应时间、状态码等）
- **WebFluxMetrics** - WebFlux 指标
- **RestTemplateExchangeTagsProvider** - RestTemplate 交换标签提供者
- **WebMvcTagsProvider** - Web MVC 标签提供者

### 容器指标
- **TomcatMetrics** - Tomcat 指标（线程池、连接数等）
- **JettyStatisticsMetrics** - Jetty 统计指标
- **UndertowMetrics** - Undertow 指标

### 设计目的
集成 Micrometer 指标库，提供应用性能监控、JVM 监控、业务指标收集等能力。

### 使用限制与风险
- 过多指标会影响性能
- 标签基数过高会导致内存问题
- 需配置指标导出器才能持久化

---

## 7. 指标端点（MetricsEndpoint）

### 核心类
- **MetricsEndpoint** - 指标端点
- **MetricDescriptor** - 指标描述符
- **Sample** - 样本
- **AvailableTag** - 可用标签
- **MetricResponse** - 指标响应

### 端点路径
- **/actuator/metrics** - 列出所有指标名称
- **/actuator/metrics/{name}** - 查看指定指标详情
- **/actuator/metrics/{name}?tag=key:value** - 按标签过滤指标

### 设计目的
通过 HTTP 端点暴露应用指标，便于临时查看和调试。

### 使用限制与风险
- 仅显示当前快照，不存储历史数据
- 生产环境建议使用专业监控系统

---

## 8. 指标导出器（Metrics Export）

### 导出器接口
- **StepMeterRegistry** - 步进式指标注册表（定时推送）
- **PushMeterRegistry** - 推送式指标注册表

### 内置导出器
- **PrometheusMeterRegistry** - Prometheus 导出器
- **GraphiteMeterRegistry** - Graphite 导出器
- **InfluxMeterRegistry** - InfluxDB 导出器
- **DatadogMeterRegistry** - Datadog 导出器
- **NewRelicMeterRegistry** - New Relic 导出器
- **StatsdMeterRegistry** - StatsD 导出器
- **WavefrontMeterRegistry** - Wavefront 导出器
- **ElasticMeterRegistry** - Elastic 导出器
- **GangliaMeterRegistry** - Ganglia 导出器
- **JmxMeterRegistry** - JMX 导出器
- **SimpleMeterRegistry** - Simple（内存）导出器

### Prometheus 集成
- **/actuator/prometheus** - Prometheus 格式指标端点
- 支持文本格式和 Prometheus 抓取

### 设计目的
将指标导出到外部监控系统，实现持久化和可视化。

### 使用限制与风险
- 不同导出器有不同的配置要求
- 推送式导出器需配置地址和认证
- Prometheus 需配置抓取任务

---

## 9. 其他内置端点

### 信息端点（InfoEndpoint）
- **InfoEndpoint** - 信息端点
- **InfoContributor** - 信息贡献者接口
- **EnvironmentInfoContributor** - 环境信息贡献者
- **GitInfoContributor** - Git 信息贡献者
- **BuildInfoContributor** - 构建信息贡献者

### 环境端点（EnvironmentEndpoint）
- **EnvironmentEndpoint** - 环境端点
- **EnvironmentDescriptor** - 环境描述符
- 显示所有配置源和属性

### Bean 端点（BeansEndpoint）
- **BeansEndpoint** - Bean 端点
- **ApplicationBeans** - 应用 Bean
- **ContextBeans** - 上下文 Bean
- 显示所有 Bean 的定义和依赖关系

### 条件端点（ConditionsReportEndpoint）
- **ConditionsReportEndpoint** - 条件报告端点
- 显示自动配置的条件评估结果

### 配置属性端点（ConfigurationPropertiesReportEndpoint）
- **ConfigurationPropertiesReportEndpoint** - 配置属性报告端点
- 显示所有 @ConfigurationProperties Bean

### 日志端点（LoggersEndpoint）
- **LoggersEndpoint** - 日志端点
- 支持查看和动态修改日志级别

### 映射端点（MappingsEndpoint）
- **MappingsEndpoint** - 映射端点
- 显示所有 @RequestMapping 映射

### 线程转储端点（ThreadDumpEndpoint）
- **ThreadDumpEndpoint** - 线程转储端点
- **ThreadInfo** - 线程信息

### 堆转储端点（HeapDumpWebEndpoint）
- **HeapDumpWebEndpoint** - 堆转储端点
- 生成并下载堆转储文件

### 关闭端点（ShutdownEndpoint）
- **ShutdownEndpoint** - 关闭端点
- 优雅关闭应用（默认禁用）

### 定时任务端点（ScheduledTasksEndpoint）
- **ScheduledTasksEndpoint** - 定时任务端点
- 显示所有 @Scheduled 任务

### 缓存端点（CachesEndpoint）
- **CachesEndpoint** - 缓存端点
- 显示和清除缓存

### 设计目的
提供丰富的监控和管理端点，覆盖应用的各个方面。

### 使用限制与风险
- 敏感端点需配置安全策略
- 某些端点（如 heapdump、shutdown）影响较大
- 端点默认不暴露，需显式配置

---

## 10. 审计事件（AuditEvent）

### 核心类
- **AuditEvent** - 审计事件
- **AuditEventRepository** - 审计事件仓库接口
- **InMemoryAuditEventRepository** - 内存审计事件仓库

### 审计端点
- **AuditEventsEndpoint** - 审计事件端点
- 查询审计事件历史

### 设计目的
记录安全相关的审计事件（登录、注销、认证失败等）。

### 使用限制与风险
- 默认使用内存存储，重启丢失
- 生产环境建议实现持久化

---

## 11. HTTP 追踪（HttpTrace）

### 核心类
- **HttpTrace** - HTTP 追踪
- **HttpTraceRepository** - HTTP 追踪仓库接口
- **InMemoryHttpTraceRepository** - 内存 HTTP 追踪仓库

### 追踪端点
- **HttpTraceEndpoint** - HTTP 追踪端点
- 查看最近的 HTTP 请求历史

### 设计目的
记录最近的 HTTP 请求和响应，用于调试和排查问题。

### 使用限制与风险
- 默认使用内存存储，容量有限
- 可能泄露敏感信息（请求头、响应体）
- Spring Boot 2.2+ 需手动配置仓库

---

## 12. 端点安全

### 端点暴露配置
- **management.endpoints.web.exposure.include** - 包含的端点（默认 health）
- **management.endpoints.web.exposure.exclude** - 排除的端点
- **management.endpoints.jmx.exposure.include** - JMX 包含端点（默认 *）
- **management.endpoints.jmx.exposure.exclude** - JMX 排除端点

### Spring Security 集成
```java
@Configuration
public class ActuatorSecurity extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.requestMatcher(EndpointRequest.toAnyEndpoint())
            .authorizeRequests()
                .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
                .anyRequest().hasRole("ACTUATOR")
            .and()
            .httpBasic();
    }
}
```

### 设计目的
保护 Actuator 端点，防止未授权访问和信息泄露。

### 使用限制与风险
- 默认仅暴露 health 端点
- 生产环境必须配置认证和授权
- 建议使用单独的管理端口

---

## 📚 总结

spring-boot-actuator 提供了：
- **端点体系**：@Endpoint、@ReadOperation、@WriteOperation
- **健康检查**：Health、HealthIndicator、可用性状态
- **指标度量**：Micrometer 集成、内置指标、指标导出
- **内置端点**：info、env、beans、conditions、loggers、metrics 等
- **审计追踪**：审计事件、HTTP 追踪
- **端点安全**：暴露控制、Spring Security 集成

Actuator 是 Spring Boot 应用生产级监控和运维的核心工具，提供了全面的可观测性支持。

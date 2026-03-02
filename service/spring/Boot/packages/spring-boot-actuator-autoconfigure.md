# Spring Boot Actuator AutoConfigure 源码指引

> spring-boot-actuator-autoconfigure 提供 Actuator 端点的自动配置、健康检查自动配置、指标导出自动配置等。

---

## 1. 端点自动配置

### 核心配置类
- **EndpointAutoConfiguration** - 端点自动配置（核心）
- **WebEndpointAutoConfiguration** - Web 端点自动配置
- **JmxEndpointAutoConfiguration** - JMX 端点自动配置
- **ManagementContextAutoConfiguration** - 管理上下文自动配置

### 端点发现配置
- **EndpointIdTimeToLivePropertyFunction** - 端点 ID TTL 属性函数
- **CachingOperationInvokerAdvisor** - 缓存操作调用器顾问
- **ExposeExcludePropertyEndpointFilter** - 暴露排除属性端点过滤器

### Web 端点配置
- **WebEndpointProperties** - Web 端点属性
- **ServletEndpointManagementContextConfiguration** - Servlet 端点管理上下文配置
- **WebMvcEndpointManagementContextConfiguration** - Web MVC 端点管理上下文配置
- **JerseyWebEndpointManagementContextConfiguration** - Jersey 端点管理上下文配置
- **WebFluxEndpointManagementContextConfiguration** - WebFlux 端点管理上下文配置

### 端点路径映射
- **management.endpoints.web.base-path** - 端点基础路径配置
- **management.endpoints.web.path-mapping.*** - 端点路径映射配置

### 设计目的
自动配置 Actuator 端点的发现、注册、暴露机制，支持 Web（Servlet/WebFlux）和 JMX 两种暴露方式。

### 使用限制与风险
- 端点默认不暴露，需显式配置
- 管理端口可独立配置（management.server.port）
- 端点暴露策略影响安全性

---

## 2. 健康检查自动配置

### 核心配置类
- **HealthContributorAutoConfiguration** - 健康贡献者自动配置
- **HealthEndpointAutoConfiguration** - 健康端点自动配置
- **HealthEndpointWebExtensionConfiguration** - 健康端点 Web 扩展配置
- **AvailabilityHealthContributorAutoConfiguration** - 可用性健康贡献者自动配置

### 健康指标自动配置
- **DataSourceHealthContributorAutoConfiguration** - 数据源健康自动配置
- **DiskSpaceHealthContributorAutoConfiguration** - 磁盘空间健康自动配置
- **PingHealthContributorAutoConfiguration** - Ping 健康自动配置
- **RedisHealthContributorAutoConfiguration** - Redis 健康自动配置
- **MongoHealthContributorAutoConfiguration** - MongoDB 健康自动配置
- **CassandraHealthContributorAutoConfiguration** - Cassandra 健康自动配置
- **ElasticsearchRestHealthContributorAutoConfiguration** - Elasticsearch 健康自动配置
- **RabbitHealthContributorAutoConfiguration** - RabbitMQ 健康自动配置
- **MailHealthContributorAutoConfiguration** - 邮件健康自动配置
- **Neo4jHealthContributorAutoConfiguration** - Neo4j 健康自动配置
- **LdapHealthContributorAutoConfiguration** - LDAP 健康自动配置
- **SolrHealthContributorAutoConfiguration** - Solr 健康自动配置
- **HazelcastHealthContributorAutoConfiguration** - Hazelcast 健康自动配置
- **InfluxDbHealthContributorAutoConfiguration** - InfluxDB 健康自动配置

### 健康端点配置
- **HealthEndpointProperties** - 健康端点属性
- **management.endpoint.health.show-details** - 显示详情策略
- **management.endpoint.health.show-components** - 显示组件策略
- **management.endpoint.health.status.order** - 状态顺序配置
- **management.endpoint.health.status.http-mapping** - HTTP 映射配置

### 健康分组配置
- **HealthEndpointGroups** - 健康端点分组
- **management.endpoint.health.group.*** - 健康分组配置

### 设计目的
自动配置各种健康指标和健康端点，根据类路径和配置动态注册健康检查。

### 使用限制与风险
- 健康检查会消耗资源，需注意性能
- 健康详情可能泄露敏感信息
- 自定义健康指标需实现 HealthIndicator 接口

---

## 3. 指标自动配置

### 核心配置类
- **MetricsAutoConfiguration** - 指标自动配置（核心）
- **CompositeMeterRegistryAutoConfiguration** - 组合指标注册表自动配置
- **SimpleMetricsExportAutoConfiguration** - Simple 指标导出自动配置

### JVM 指标配置
- **JvmMetricsAutoConfiguration** - JVM 指标自动配置
  - JvmMemoryMetrics - JVM 内存指标
  - JvmGcMetrics - JVM GC 指标
  - JvmThreadMetrics - JVM 线程指标
  - ClassLoaderMetrics - 类加载器指标
  - JvmInfoMetrics - JVM 信息指标

### 系统指标配置
- **SystemMetricsAutoConfiguration** - 系统指标自动配置
  - ProcessorMetrics - 处理器指标
  - FileDescriptorMetrics - 文件描述符指标
  - UptimeMetrics - 运行时间指标
  - DiskSpaceMetrics - 磁盘空间指标

### 日志指标配置
- **LogbackMetricsAutoConfiguration** - Logback 指标自动配置
- **Log4J2MetricsAutoConfiguration** - Log4j2 指标自动配置

### 数据源指标配置
- **DataSourcePoolMetricsAutoConfiguration** - 数据源连接池指标自动配置
  - HikariDataSourceMetrics - HikariCP 指标
  - TomcatDataSourceMetrics - Tomcat 连接池指标

### Hibernate 指标配置
- **HibernateMetricsAutoConfiguration** - Hibernate 指标自动配置

### 缓存指标配置
- **CacheMetricsAutoConfiguration** - 缓存指标自动配置
  - CaffeineCacheMetrics - Caffeine 缓存指标
  - HazelcastCacheMetrics - Hazelcast 缓存指标
  - EhCache2Metrics - EhCache 2.x 指标

### Web 指标配置
- **WebMvcMetricsAutoConfiguration** - Web MVC 指标自动配置
  - WebMvcMetrics - Spring MVC 指标（请求、响应时间、状态码）
  - WebMvcTagsContributor - 标签贡献者
- **WebFluxMetricsAutoConfiguration** - WebFlux 指标自动配置
  - WebFluxMetrics - WebFlux 指标
  - WebFluxTagsContributor - 标签贡献者

### 容器指标配置
- **TomcatMetricsAutoConfiguration** - Tomcat 指标自动配置
- **JettyMetricsAutoConfiguration** - Jetty 指标自动配置
- **UndertowMetricsAutoConfiguration** - Undertow 指标自动配置

### HTTP 客户端指标配置
- **HttpClientMetricsAutoConfiguration** - HTTP 客户端指标自动配置
  - RestTemplateExchangeTagsProvider - RestTemplate 标签提供者

### RabbitMQ 指标配置
- **RabbitMetricsAutoConfiguration** - RabbitMQ 指标自动配置

### Kafka 指标配置
- **KafkaMetricsAutoConfiguration** - Kafka 指标自动配置

### 设计目的
自动配置各种指标绑定器，收集 JVM、系统、应用、中间件等多维度指标。

### 使用限制与风险
- 指标收集会消耗一定性能
- 标签基数过高会导致内存问题
- 需配合指标导出器使用

---

## 4. 指标导出自动配置

### Prometheus 导出配置
- **PrometheusMetricsExportAutoConfiguration** - Prometheus 指标导出自动配置
- **PrometheusSimpleclientMetricsExportAutoConfiguration** - Prometheus Simpleclient 导出配置
- **PrometheusScrapeEndpointAutoConfiguration** - Prometheus 抓取端点自动配置
- **/actuator/prometheus** - Prometheus 格式端点

### Graphite 导出配置
- **GraphiteMetricsExportAutoConfiguration** - Graphite 指标导出自动配置
- **management.metrics.export.graphite.*** - Graphite 配置属性

### InfluxDB 导出配置
- **InfluxMetricsExportAutoConfiguration** - InfluxDB 指标导出自动配置
- **management.metrics.export.influx.*** - InfluxDB 配置属性

### Datadog 导出配置
- **DatadogMetricsExportAutoConfiguration** - Datadog 指标导出自动配置
- **management.metrics.export.datadog.*** - Datadog 配置属性

### New Relic 导出配置
- **NewRelicMetricsExportAutoConfiguration** - New Relic 指标导出自动配置
- **management.metrics.export.newrelic.*** - New Relic 配置属性

### StatsD 导出配置
- **StatsdMetricsExportAutoConfiguration** - StatsD 指标导出自动配置
- **management.metrics.export.statsd.*** - StatsD 配置属性

### Wavefront 导出配置
- **WavefrontMetricsExportAutoConfiguration** - Wavefront 指标导出自动配置
- **management.metrics.export.wavefront.*** - Wavefront 配置属性

### Elastic 导出配置
- **ElasticMetricsExportAutoConfiguration** - Elastic 指标导出自动配置
- **management.metrics.export.elastic.*** - Elastic 配置属性

### Ganglia 导出配置
- **GangliaMetricsExportAutoConfiguration** - Ganglia 指标导出自动配置
- **management.metrics.export.ganglia.*** - Ganglia 配置属性

### JMX 导出配置
- **JmxMetricsExportAutoConfiguration** - JMX 指标导出自动配置
- **management.metrics.export.jmx.*** - JMX 配置属性

### 设计目的
自动配置各种指标导出器，将指标推送或暴露给外部监控系统。

### 使用限制与风险
- 不同导出器有不同的配置要求
- 推送式导出器需配置地址和认证
- 导出频率需合理配置，避免性能影响

---

## 5. 其他端点自动配置

### 信息端点配置
- **InfoContributorAutoConfiguration** - 信息贡献者自动配置
- **InfoEndpointAutoConfiguration** - 信息端点自动配置
- **EnvironmentInfoContributor** - 环境信息贡献者
- **GitInfoContributor** - Git 信息贡献者
- **BuildInfoContributor** - 构建信息贡献者

### 环境端点配置
- **EnvironmentEndpointAutoConfiguration** - 环境端点自动配置
- **EnvironmentEndpointProperties** - 环境端点属性
- **management.endpoint.env.keys-to-sanitize** - 敏感 key 配置

### Bean 端点配置
- **BeansEndpointAutoConfiguration** - Bean 端点自动配置

### 条件报告端点配置
- **ConditionsReportEndpointAutoConfiguration** - 条件报告端点自动配置

### 配置属性端点配置
- **ConfigurationPropertiesReportEndpointAutoConfiguration** - 配置属性报告端点自动配置
- **ConfigurationPropertiesReportEndpointProperties** - 配置属性端点属性
- **management.endpoint.configprops.keys-to-sanitize** - 敏感 key 配置

### 日志端点配置
- **LoggersEndpointAutoConfiguration** - 日志端点自动配置
- 支持查看和动态修改日志级别

### 映射端点配置
- **MappingsEndpointAutoConfiguration** - 映射端点自动配置
- **ServletsMappingDescriptionProvider** - Servlet 映射描述提供者
- **DispatcherServletsMappingDescriptionProvider** - DispatcherServlet 映射描述提供者
- **FiltersMappingDescriptionProvider** - 过滤器映射描述提供者

### 线程转储端点配置
- **ThreadDumpEndpointAutoConfiguration** - 线程转储端点自动配置

### 堆转储端点配置
- **HeapDumpWebEndpointAutoConfiguration** - 堆转储端点自动配置

### 关闭端点配置
- **ShutdownEndpointAutoConfiguration** - 关闭端点自动配置
- 默认禁用（management.endpoint.shutdown.enabled=false）

### 定时任务端点配置
- **ScheduledTasksEndpointAutoConfiguration** - 定时任务端点自动配置

### 缓存端点配置
- **CachesEndpointAutoConfiguration** - 缓存端点自动配置

### Session 端点配置
- **SessionsEndpointAutoConfiguration** - Session 端点自动配置

### Liquibase 端点配置
- **LiquibaseEndpointAutoConfiguration** - Liquibase 端点自动配置

### Flyway 端点配置
- **FlywayEndpointAutoConfiguration** - Flyway 端点自动配置

### Integration 端点配置
- **IntegrationGraphEndpointAutoConfiguration** - Integration 图端点自动配置

### Quartz 端点配置
- **QuartzEndpointAutoConfiguration** - Quartz 端点自动配置

### Startup 端点配置
- **StartupEndpointAutoConfiguration** - 启动端点自动配置
- 记录应用启动过程的详细步骤

### 设计目的
为各种内置端点提供自动配置，根据类路径和条件动态启用端点。

### 使用限制与风险
- 端点需显式暴露才能访问
- 敏感端点需配置安全策略
- 某些端点（如 shutdown、heapdump）影响较大

---

## 6. 审计事件自动配置

### 核心配置类
- **AuditEventsEndpointAutoConfiguration** - 审计事件端点自动配置
- **AuditAutoConfiguration** - 审计自动配置

### 审计事件仓库
- **InMemoryAuditEventRepository** - 内存审计事件仓库（默认）
- 自定义仓库需实现 AuditEventRepository 接口

### 设计目的
自动配置审计事件的记录和查询功能。

### 使用限制与风险
- 默认使用内存存储，重启丢失
- 生产环境建议实现持久化仓库

---

## 7. HTTP 追踪自动配置

### 核心配置类
- **HttpTraceEndpointAutoConfiguration** - HTTP 追踪端点自动配置
- **HttpTraceAutoConfiguration** - HTTP 追踪自动配置

### HTTP 追踪仓库
- **InMemoryHttpTraceRepository** - 内存 HTTP 追踪仓库
- Spring Boot 2.2+ 需手动配置仓库

### 设计目的
自动配置 HTTP 请求追踪功能。

### 使用限制与风险
- 默认不自动配置仓库（安全考虑）
- 需手动注册 HttpTraceRepository Bean
- 可能泄露敏感信息

---

## 8. 管理上下文配置

### 核心配置类
- **ManagementContextAutoConfiguration** - 管理上下文自动配置
- **ServletManagementContextAutoConfiguration** - Servlet 管理上下文自动配置
- **ReactiveManagementContextAutoConfiguration** - 响应式管理上下文自动配置

### 独立管理端口
- **management.server.port** - 管理端口配置
- **management.server.address** - 管理地址配置
- **management.server.ssl.*** - 管理 SSL 配置
- **ChildManagementContextConfiguration** - 子管理上下文配置

### 管理上下文路径
- **management.server.base-path** - 管理基础路径（废弃，使用 management.endpoints.web.base-path）

### 设计目的
支持将管理端点暴露在独立端口，与应用端口分离，增强安全性。

### 使用限制与风险
- 独立端口需额外资源
- 网络策略需相应调整
- SSL 配置需分别处理

---

## 9. 端点安全配置

### 核心配置类
- **ManagementWebSecurityAutoConfiguration** - 管理 Web 安全自动配置
- **EndpointRequest** - 端点请求匹配器

### 默认安全策略
- health 和 info 端点公开
- 其他端点需认证

### 自定义安全配置
```java
@Configuration
public class ActuatorSecurityConfig extends WebSecurityConfigurerAdapter {
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
为 Actuator 端点提供默认的安全保护，集成 Spring Security。

### 使用限制与风险
- 默认安全策略较宽松
- 生产环境必须自定义安全配置
- 需注意跨域配置

---

## 10. 条件化配置

### 核心条件注解
- **@ConditionalOnEnabledEndpoint** - 端点启用条件
- **@ConditionalOnEnabledHealthIndicator** - 健康指标启用条件
- **@ConditionalOnEnabledMetricsExport** - 指标导出启用条件

### 端点启用配置
- **management.endpoint.{id}.enabled** - 启用特定端点
- **management.endpoints.enabled-by-default** - 默认启用策略

### 健康指标启用配置
- **management.health.{name}.enabled** - 启用特定健康指标
- **management.health.defaults.enabled** - 默认启用策略

### 指标导出启用配置
- **management.metrics.export.{name}.enabled** - 启用特定导出器

### 设计目的
提供细粒度的启用/禁用控制，支持按需配置端点和功能。

### 使用限制与风险
- 配置项较多，需理解层级关系
- 默认策略和显式配置的优先级

---

## 📚 总结

spring-boot-actuator-autoconfigure 提供了：
- **端点自动配置**：Web 端点、JMX 端点、管理上下文
- **健康检查自动配置**：各种健康指标的自动注册
- **指标自动配置**：JVM、系统、应用、中间件指标
- **指标导出自动配置**：Prometheus、Graphite、InfluxDB 等
- **其他端点自动配置**：info、env、beans、loggers、mappings 等
- **审计追踪自动配置**：审计事件、HTTP 追踪
- **管理上下文配置**：独立管理端口支持
- **端点安全配置**：Spring Security 集成
- **条件化配置**：细粒度的启用/禁用控制

该模块是 Actuator 功能的自动配置层，根据类路径、Bean 定义、配置属性动态启用和配置各种监控功能。

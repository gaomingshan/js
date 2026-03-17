# 配置中心与服务发现

## 概述

在微服务架构中，配置中心和服务发现是基础设施组件。本章介绍如何使用 Spring Cloud Config 管理 ES 配置，以及通过 Eureka/Nacos 实现服务发现和负载均衡。

## Spring Cloud Config 管理 ES 配置

### Config Server 搭建

**依赖配置**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>
```

**配置文件（application.yml）**：

```yaml
server:
  port: 8888

spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-org/config-repo
          username: ${GIT_USERNAME}
          password: ${GIT_PASSWORD}
          default-label: main
          search-paths: '{application}'
```

**启动类**：

```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

### Git 仓库配置

**目录结构**：

```
config-repo/
├── search-service/
│   ├── search-service.yml
│   ├── search-service-dev.yml
│   ├── search-service-prod.yml
│   └── search-service-test.yml
└── application.yml
```

**search-service-prod.yml**：

```yaml
spring:
  elasticsearch:
    uris:
      - http://es-node1:9200
      - http://es-node2:9200
      - http://es-node3:9200
    username: ${ES_USERNAME}
    password: ${ES_PASSWORD}
    connection-timeout: 3000
    socket-timeout: 60000
    max-connections: 100
    max-connections-per-route: 20

# 搜索服务配置
search:
  cache:
    enabled: true
    ttl: 300
  
  performance:
    max-result-window: 10000
    default-page-size: 20
    max-page-size: 100
  
  sync:
    full-sync-cron: "0 0 2 * * ?"
    incremental-check-interval: 300000
```

### Config Client 集成

**依赖配置**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

**bootstrap.yml**：

```yaml
spring:
  application:
    name: search-service
  profiles:
    active: prod
  cloud:
    config:
      uri: http://config-server:8888
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        max-attempts: 6
```

**读取配置**：

```java
@Configuration
@ConfigurationProperties(prefix = "search")
public class SearchConfig {
    
    private CacheConfig cache;
    private PerformanceConfig performance;
    private SyncConfig sync;
    
    @Data
    public static class CacheConfig {
        private boolean enabled;
        private int ttl;
    }
    
    @Data
    public static class PerformanceConfig {
        private int maxResultWindow;
        private int defaultPageSize;
        private int maxPageSize;
    }
    
    @Data
    public static class SyncConfig {
        private String fullSyncCron;
        private long incrementalCheckInterval;
    }
    
    // Getters and Setters
}
```

## 动态刷新配置

### @RefreshScope 注解

```java
@RestController
@RefreshScope  // 支持动态刷新
public class SearchController {
    
    @Value("${search.performance.default-page-size}")
    private int defaultPageSize;
    
    @Value("${search.cache.enabled}")
    private boolean cacheEnabled;
    
    @GetMapping("/config")
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("defaultPageSize", defaultPageSize);
        config.put("cacheEnabled", cacheEnabled);
        return config;
    }
}
```

### 手动刷新

**依赖配置**：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**配置文件**：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: refresh,health,info
```

**刷新配置**：

```bash
# 更新 Git 仓库配置

# 调用 refresh 端点
curl -X POST http://search-service:8080/actuator/refresh
```

### 自动刷新（Spring Cloud Bus）

**依赖配置**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

**配置文件**：

```yaml
spring:
  rabbitmq:
    host: rabbitmq-server
    port: 5672
    username: guest
    password: guest

management:
  endpoints:
    web:
      exposure:
        include: bus-refresh
```

**刷新所有实例**：

```bash
# 调用任意一个实例的 bus-refresh
curl -X POST http://search-service:8080/actuator/bus-refresh
```

### Config 监听器

```java
@Component
@Slf4j
public class ConfigChangeListener implements ApplicationListener<EnvironmentChangeEvent> {
    
    @Autowired
    private RestHighLevelClient esClient;
    
    @Override
    public void onApplicationEvent(EnvironmentChangeEvent event) {
        Set<String> changedKeys = event.getKeys();
        
        log.info("Configuration changed: {}", changedKeys);
        
        // 如果 ES 配置变化，重建客户端
        if (changedKeys.stream().anyMatch(key -> key.startsWith("spring.elasticsearch"))) {
            rebuildESClient();
        }
    }
    
    private void rebuildESClient() {
        try {
            esClient.close();
            // 重新创建客户端
            log.info("ES client rebuilt successfully");
        } catch (Exception e) {
            log.error("Failed to rebuild ES client", e);
        }
    }
}
```

## Eureka/Nacos 服务发现

### Eureka 集成

**Eureka Server**：

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

**配置文件**：

```yaml
server:
  port: 8761

eureka:
  instance:
    hostname: eureka-server
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
```

**Eureka Client（搜索服务）**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${server.port}
    lease-renewal-interval-in-seconds: 10
    lease-expiration-duration-in-seconds: 30
```

### Nacos 集成

**依赖配置**：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>

<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

**bootstrap.yml**：

```yaml
spring:
  application:
    name: search-service
  cloud:
    nacos:
      discovery:
        server-addr: nacos-server:8848
        namespace: production
        group: DEFAULT_GROUP
        metadata:
          version: 1.0.0
          region: cn-hangzhou
      
      config:
        server-addr: nacos-server:8848
        namespace: production
        group: DEFAULT_GROUP
        file-extension: yaml
        refresh-enabled: true
        shared-configs:
          - data-id: common.yaml
            refresh: true
```

**Nacos 配置管理**：

```yaml
# Nacos 控制台创建配置
# Data ID: search-service-prod.yaml
# Group: DEFAULT_GROUP

spring:
  elasticsearch:
    uris:
      - http://es-node1:9200
      - http://es-node2:9200
    username: elastic
    password: ${ES_PASSWORD}

search:
  cache:
    enabled: true
    ttl: 300
```

### 服务调用

**Feign 集成**：

```java
@FeignClient(name = "search-service")
public interface SearchServiceClient {
    
    @GetMapping("/api/search/products")
    SearchResult<Product> searchProducts(
        @SpringQueryMap ProductSearchRequest request
    );
}
```

**使用示例**：

```java
@Service
public class ProductFacadeService {
    
    @Autowired
    private SearchServiceClient searchClient;
    
    public List<Product> searchProducts(String keyword) {
        ProductSearchRequest request = new ProductSearchRequest();
        request.setKeyword(keyword);
        
        SearchResult<Product> result = searchClient.searchProducts(request);
        return result.getItems();
    }
}
```

## 多 ES 集群管理

### 配置多集群

**配置文件**：

```yaml
elasticsearch:
  clusters:
    primary:
      uris:
        - http://es-primary-1:9200
        - http://es-primary-2:9200
      username: elastic
      password: ${ES_PRIMARY_PASSWORD}
    
    secondary:
      uris:
        - http://es-secondary-1:9200
        - http://es-secondary-2:9200
      username: elastic
      password: ${ES_SECONDARY_PASSWORD}
    
    analytics:
      uris:
        - http://es-analytics-1:9200
      username: elastic
      password: ${ES_ANALYTICS_PASSWORD}
```

### 多集群配置类

```java
@Configuration
public class MultiClusterConfig {
    
    @Bean(name = "primaryESClient")
    @Primary
    @ConfigurationProperties(prefix = "elasticsearch.clusters.primary")
    public RestHighLevelClient primaryClient(ESClusterProperties props) {
        return createClient(props);
    }
    
    @Bean(name = "secondaryESClient")
    @ConfigurationProperties(prefix = "elasticsearch.clusters.secondary")
    public RestHighLevelClient secondaryClient(ESClusterProperties props) {
        return createClient(props);
    }
    
    @Bean(name = "analyticsESClient")
    @ConfigurationProperties(prefix = "elasticsearch.clusters.analytics")
    public RestHighLevelClient analyticsClient(ESClusterProperties props) {
        return createClient(props);
    }
    
    private RestHighLevelClient createClient(ESClusterProperties props) {
        HttpHost[] hosts = props.getUris().stream()
            .map(uri -> {
                String[] parts = uri.replace("http://", "").split(":");
                return new HttpHost(parts[0], Integer.parseInt(parts[1]), "http");
            })
            .toArray(HttpHost[]::new);
        
        RestClientBuilder builder = RestClient.builder(hosts);
        
        // 配置认证
        if (props.getUsername() != null) {
            CredentialsProvider provider = new BasicCredentialsProvider();
            provider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials(props.getUsername(), props.getPassword())
            );
            
            builder.setHttpClientConfigCallback(httpClientBuilder ->
                httpClientBuilder.setDefaultCredentialsProvider(provider)
            );
        }
        
        return new RestHighLevelClient(builder);
    }
}
```

### 集群路由

```java
@Service
public class ClusterRoutingService {
    
    @Autowired
    @Qualifier("primaryESClient")
    private RestHighLevelClient primaryClient;
    
    @Autowired
    @Qualifier("secondaryESClient")
    private RestHighLevelClient secondaryClient;
    
    @Autowired
    @Qualifier("analyticsESClient")
    private RestHighLevelClient analyticsClient;
    
    // 主集群：实时搜索
    public List<Product> searchRealtime(String keyword) {
        return search(primaryClient, keyword);
    }
    
    // 次集群：历史数据查询
    public List<Product> searchHistory(String keyword) {
        return search(secondaryClient, keyword);
    }
    
    // 分析集群：统计分析
    public Map<String, Long> analyze() {
        return performAnalytics(analyticsClient);
    }
    
    private List<Product> search(RestHighLevelClient client, String keyword) {
        // 执行搜索
        return Collections.emptyList();
    }
    
    private Map<String, Long> performAnalytics(RestHighLevelClient client) {
        // 执行分析
        return Collections.emptyMap();
    }
}
```

## 客户端负载均衡

### Ribbon 配置

**配置文件**：

```yaml
search-service:
  ribbon:
    NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RoundRobinRule
    ConnectTimeout: 3000
    ReadTimeout: 60000
    MaxAutoRetries: 1
    MaxAutoRetriesNextServer: 2
    OkToRetryOnAllOperations: false
```

### 自定义负载均衡策略

```java
@Configuration
public class LoadBalancerConfig {
    
    @Bean
    public IRule loadBalancerRule() {
        return new WeightedResponseTimeRule();
    }
}
```

### RestTemplate 负载均衡

```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class SearchServiceCaller {
    
    @Autowired
    private RestTemplate restTemplate;
    
    public List<Product> search(String keyword) {
        String url = "http://search-service/api/search/products?keyword=" + keyword;
        
        ProductSearchResponse response = restTemplate.getForObject(
            url, ProductSearchResponse.class
        );
        
        return response.getItems();
    }
}
```

## 熔断降级策略（Hystrix/Sentinel）

### Hystrix 集成

**依赖配置**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```

**启用 Hystrix**：

```java
@SpringBootApplication
@EnableCircuitBreaker
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**熔断方法**：

```java
@Service
public class ProductSearchService {
    
    @Autowired
    private SearchServiceClient searchClient;
    
    @Autowired
    private ProductMapper productMapper;
    
    @HystrixCommand(
        fallbackMethod = "searchFallback",
        commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "3000"),
            @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "10"),
            @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "50"),
            @HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds", value = "10000")
        }
    )
    public List<Product> search(String keyword) {
        return searchClient.searchProducts(keyword).getItems();
    }
    
    public List<Product> searchFallback(String keyword, Throwable e) {
        log.error("Search service failed, using fallback", e);
        
        // 降级：从数据库查询
        return productMapper.selectByKeyword(keyword);
    }
}
```

### Sentinel 集成

**依赖配置**：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

**配置文件**：

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: sentinel-dashboard:8080
        port: 8719
      datasource:
        ds1:
          nacos:
            server-addr: nacos-server:8848
            dataId: sentinel-search-service
            groupId: DEFAULT_GROUP
            rule-type: flow
```

**限流规则**：

```java
@Component
public class SentinelConfig {
    
    @PostConstruct
    public void initFlowRules() {
        List<FlowRule> rules = new ArrayList<>();
        
        FlowRule rule = new FlowRule();
        rule.setResource("searchProducts");
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        rule.setCount(100);  // QPS 限制 100
        rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT);
        
        rules.add(rule);
        FlowRuleManager.loadRules(rules);
    }
}
```

**使用 Sentinel**：

```java
@Service
public class ProductSearchService {
    
    @SentinelResource(
        value = "searchProducts",
        blockHandler = "handleBlock",
        fallback = "handleFallback"
    )
    public List<Product> search(String keyword) {
        return searchClient.searchProducts(keyword).getItems();
    }
    
    public List<Product> handleBlock(String keyword, BlockException e) {
        log.warn("Request blocked by Sentinel", e);
        throw new ServiceUnavailableException("Service is busy, please try again later");
    }
    
    public List<Product> handleFallback(String keyword, Throwable e) {
        log.error("Search service failed", e);
        return productMapper.selectByKeyword(keyword);
    }
}
```

### 熔断监控

**Hystrix Dashboard**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix-dashboard</artifactId>
</dependency>
```

```java
@SpringBootApplication
@EnableHystrixDashboard
public class DashboardApplication {
    public static void main(String[] args) {
        SpringApplication.run(DashboardApplication.class, args);
    }
}
```

访问：`http://dashboard:9090/hystrix`

**Sentinel Dashboard**：

访问：`http://sentinel-dashboard:8080`

## 总结

**配置中心**：
- Spring Cloud Config
- Git 仓库管理
- 动态刷新配置

**服务发现**：
- Eureka 注册中心
- Nacos 服务发现
- Feign 服务调用

**多集群管理**：
- 多客户端配置
- 集群路由策略
- 读写分离

**负载均衡**：
- Ribbon 配置
- 自定义策略
- RestTemplate 集成

**熔断降级**：
- Hystrix 熔断
- Sentinel 限流
- 降级策略

**监控告警**：
- Hystrix Dashboard
- Sentinel Dashboard
- 实时监控

**最佳实践**：
- 配置外部化
- 服务高可用
- 熔断降级
- 监控完善

**下一步**：学习分布式日志收集（ELK Stack）。

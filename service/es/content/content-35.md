# Spring Boot 配置与连接管理

## 概述

合理的配置和连接管理是 Spring Boot 集成 Elasticsearch 的基础。本章介绍配置文件、自动配置、连接池优化和安全连接等内容。

## application.yml 配置详解

### 基础配置

```yaml
spring:
  elasticsearch:
    # 单节点配置
    uris: http://localhost:9200
    
    # 认证信息
    username: elastic
    password: changeme
    
    # 连接超时（毫秒）
    connection-timeout: 1000
    
    # 读取超时（毫秒）
    socket-timeout: 30000
```

### 多节点配置

```yaml
spring:
  elasticsearch:
    # 多节点配置（逗号分隔）
    uris: 
      - http://es-node1:9200
      - http://es-node2:9200
      - http://es-node3:9200
    
    username: elastic
    password: changeme
```

### 完整配置示例

```yaml
spring:
  application:
    name: product-search-service
  
  elasticsearch:
    # 集群节点
    uris: http://localhost:9200
    
    # 认证
    username: elastic
    password: changeme
    
    # 连接超时（默认 1000ms）
    connection-timeout: 3000
    
    # Socket 超时（默认 30000ms）
    socket-timeout: 60000
    
    # 连接请求超时
    connection-request-timeout: 500
    
    # 最大连接数
    max-connections: 100
    
    # 每个路由的最大连接数
    max-connections-per-route: 10

# 日志配置
logging:
  level:
    org.springframework.data.elasticsearch: DEBUG
    org.elasticsearch: INFO
```

### 配置类对应

```java
@ConfigurationProperties(prefix = "spring.elasticsearch")
public class ElasticsearchProperties {
    
    private List<String> uris = new ArrayList<>(
        Collections.singletonList("http://localhost:9200")
    );
    
    private String username;
    private String password;
    private Duration connectionTimeout = Duration.ofSeconds(1);
    private Duration socketTimeout = Duration.ofSeconds(30);
    
    // Getters and Setters
}
```

## 自动配置原理

### AutoConfiguration 类

```java
@Configuration
@ConditionalOnClass({RestHighLevelClient.class})
@EnableConfigurationProperties(ElasticsearchProperties.class)
public class ElasticsearchAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public RestHighLevelClient elasticsearchClient(
            ElasticsearchProperties properties) {
        
        // 解析 URIs
        HttpHost[] hosts = properties.getUris().stream()
            .map(this::createHttpHost)
            .toArray(HttpHost[]::new);
        
        // 构建客户端
        RestClientBuilder builder = RestClient.builder(hosts);
        
        // 配置认证
        if (StringUtils.hasText(properties.getUsername())) {
            CredentialsProvider credentialsProvider = 
                new BasicCredentialsProvider();
            credentialsProvider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials(
                    properties.getUsername(),
                    properties.getPassword()
                )
            );
            
            builder.setHttpClientConfigCallback(httpClientBuilder ->
                httpClientBuilder.setDefaultCredentialsProvider(
                    credentialsProvider
                )
            );
        }
        
        // 配置超时
        builder.setRequestConfigCallback(requestConfigBuilder ->
            requestConfigBuilder
                .setConnectTimeout((int) properties.getConnectionTimeout().toMillis())
                .setSocketTimeout((int) properties.getSocketTimeout().toMillis())
        );
        
        return new RestHighLevelClient(builder);
    }
    
    @Bean
    @ConditionalOnMissingBean
    public ElasticsearchRestTemplate elasticsearchRestTemplate(
            RestHighLevelClient client) {
        return new ElasticsearchRestTemplate(client);
    }
}
```

### 条件注解

```
@ConditionalOnClass：
  - 类路径存在指定类时生效
  - 例如：RestHighLevelClient.class

@ConditionalOnMissingBean：
  - Bean 不存在时创建
  - 允许自定义覆盖

@EnableConfigurationProperties：
  - 启用配置属性绑定
  - 自动注入配置类
```

## 自定义 ElasticsearchRestTemplate

### 自定义配置类

```java
@Configuration
public class CustomElasticsearchConfig {
    
    @Value("${elasticsearch.cluster.nodes}")
    private String clusterNodes;
    
    @Value("${elasticsearch.username}")
    private String username;
    
    @Value("${elasticsearch.password}")
    private String password;
    
    @Bean
    public RestHighLevelClient customClient() {
        // 解析节点
        String[] nodes = clusterNodes.split(",");
        HttpHost[] hosts = Arrays.stream(nodes)
            .map(node -> {
                String[] parts = node.split(":");
                return new HttpHost(
                    parts[0], 
                    Integer.parseInt(parts[1]), 
                    "http"
                );
            })
            .toArray(HttpHost[]::new);
        
        // 构建客户端
        RestClientBuilder builder = RestClient.builder(hosts);
        
        // 认证配置
        configureAuthentication(builder);
        
        // 超时配置
        configureTimeouts(builder);
        
        // 连接池配置
        configureConnectionPool(builder);
        
        // 重试配置
        configureRetry(builder);
        
        return new RestHighLevelClient(builder);
    }
    
    private void configureAuthentication(RestClientBuilder builder) {
        if (StringUtils.hasText(username)) {
            CredentialsProvider provider = new BasicCredentialsProvider();
            provider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials(username, password)
            );
            
            builder.setHttpClientConfigCallback(httpClientBuilder ->
                httpClientBuilder
                    .setDefaultCredentialsProvider(provider)
            );
        }
    }
    
    private void configureTimeouts(RestClientBuilder builder) {
        builder.setRequestConfigCallback(requestConfigBuilder ->
            requestConfigBuilder
                .setConnectTimeout(5000)
                .setSocketTimeout(60000)
                .setConnectionRequestTimeout(1000)
        );
    }
    
    private void configureConnectionPool(RestClientBuilder builder) {
        builder.setHttpClientConfigCallback(httpClientBuilder ->
            httpClientBuilder
                .setMaxConnTotal(100)
                .setMaxConnPerRoute(10)
        );
    }
    
    private void configureRetry(RestClientBuilder builder) {
        builder.setFailureListener(new RestClient.FailureListener() {
            @Override
            public void onFailure(Node node) {
                log.error("Node failed: {}", node);
            }
        });
        
        builder.setRequestConfigCallback(requestConfigBuilder ->
            requestConfigBuilder.setMaxRedirects(5)
        );
    }
    
    @Bean
    public ElasticsearchRestTemplate elasticsearchRestTemplate(
            RestHighLevelClient client) {
        return new ElasticsearchRestTemplate(client);
    }
}
```

## 连接池配置与优化

### 连接池参数

```java
@Configuration
public class ConnectionPoolConfig {
    
    @Bean
    public RestHighLevelClient client() {
        RestClientBuilder builder = RestClient.builder(
            new HttpHost("localhost", 9200, "http")
        );
        
        builder.setHttpClientConfigCallback(httpClientBuilder -> {
            // 最大连接数
            httpClientBuilder.setMaxConnTotal(100);
            
            // 每个路由的最大连接数
            httpClientBuilder.setMaxConnPerRoute(10);
            
            // 连接存活时间
            httpClientBuilder.setConnectionTimeToLive(30, TimeUnit.SECONDS);
            
            // 空闲连接清理
            httpClientBuilder.evictIdleConnections(60, TimeUnit.SECONDS);
            
            // 连接管理器
            PoolingNHttpClientConnectionManager connectionManager = 
                new PoolingNHttpClientConnectionManager(
                    RegistryBuilder.<SchemeIOSessionStrategy>create()
                        .register("http", NoopIOSessionStrategy.INSTANCE)
                        .register("https", SSLIOSessionStrategy.getSystemDefaultStrategy())
                        .build()
                );
            
            connectionManager.setMaxTotal(100);
            connectionManager.setDefaultMaxPerRoute(10);
            
            return httpClientBuilder.setConnectionManager(connectionManager);
        });
        
        return new RestHighLevelClient(builder);
    }
}
```

### 参数调优建议

```
最大连接数（MaxConnTotal）：
  - 小型应用：50-100
  - 中型应用：100-200
  - 大型应用：200-500

每个路由最大连接数（MaxConnPerRoute）：
  - 小型应用：5-10
  - 中型应用：10-20
  - 大型应用：20-50

连接超时（ConnectTimeout）：
  - 推荐：1-5 秒
  - 避免过长导致线程阻塞

Socket 超时（SocketTimeout）：
  - 简单查询：10-30 秒
  - 复杂查询：30-60 秒
  - 聚合查询：60-120 秒
```

## 集群节点发现配置

### Sniffer 配置

```java
@Configuration
public class SnifferConfig {
    
    @Bean
    public RestHighLevelClient client() {
        RestClientBuilder builder = RestClient.builder(
            new HttpHost("localhost", 9200, "http")
        );
        
        // 启用 Sniffer
        Sniffer sniffer = Sniffer.builder(builder.build())
            .setSniffIntervalMillis(60000)  // 每 60 秒探测一次
            .setSniffAfterFailureDelayMillis(30000)  // 失败后 30 秒探测
            .build();
        
        return new RestHighLevelClient(builder);
    }
}
```

**Sniffer 作用**：
- 自动发现集群节点
- 节点故障时重新发现
- 动态添加/移除节点

### 手动配置多节点

```java
@Configuration
public class MultiNodeConfig {
    
    @Bean
    public RestHighLevelClient client() {
        HttpHost[] hosts = {
            new HttpHost("es-node1", 9200, "http"),
            new HttpHost("es-node2", 9200, "http"),
            new HttpHost("es-node3", 9200, "http")
        };
        
        RestClientBuilder builder = RestClient.builder(hosts);
        
        // 节点选择策略
        builder.setNodeSelector(nodes -> {
            // 优先选择协调节点
            for (Node node : nodes) {
                if (node.getRoles().contains(Node.Role.COORDINATING_ONLY)) {
                    return node;
                }
            }
            // 否则选择第一个节点
            return nodes.iterator().next();
        });
        
        return new RestHighLevelClient(builder);
    }
}
```

## SSL/TLS 安全连接

### 单向 SSL 配置

```java
@Configuration
public class SSLConfig {
    
    @Bean
    public RestHighLevelClient secureClient() throws Exception {
        // 加载信任证书
        Path caCertPath = Paths.get("/path/to/ca.crt");
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        Certificate ca;
        try (InputStream is = Files.newInputStream(caCertPath)) {
            ca = cf.generateCertificate(is);
        }
        
        // 创建 KeyStore
        KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
        trustStore.load(null, null);
        trustStore.setCertificateEntry("ca", ca);
        
        // 创建 SSLContext
        SSLContext sslContext = SSLContexts.custom()
            .loadTrustMaterial(trustStore, null)
            .build();
        
        // 配置客户端
        RestClientBuilder builder = RestClient.builder(
            new HttpHost("localhost", 9200, "https")
        );
        
        builder.setHttpClientConfigCallback(httpClientBuilder ->
            httpClientBuilder.setSSLContext(sslContext)
        );
        
        return new RestHighLevelClient(builder);
    }
}
```

### 双向 SSL 配置

```java
@Configuration
public class MutualSSLConfig {
    
    @Bean
    public RestHighLevelClient mutualSSLClient() throws Exception {
        // 加载客户端证书
        Path certPath = Paths.get("/path/to/client.crt");
        Path keyPath = Paths.get("/path/to/client.key");
        
        // 创建 SSLContext
        SSLContext sslContext = SSLContexts.custom()
            .loadTrustMaterial(
                new File("/path/to/ca.crt"),
                null
            )
            .loadKeyMaterial(
                new File("/path/to/client.p12"),
                "password".toCharArray(),
                "password".toCharArray()
            )
            .build();
        
        RestClientBuilder builder = RestClient.builder(
            new HttpHost("localhost", 9200, "https")
        );
        
        builder.setHttpClientConfigCallback(httpClientBuilder ->
            httpClientBuilder
                .setSSLContext(sslContext)
                .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)
        );
        
        return new RestHighLevelClient(builder);
    }
}
```

## 健康检查与连接重试

### 健康检查配置

```java
@Component
public class ElasticsearchHealthChecker {
    
    @Autowired
    private RestHighLevelClient client;
    
    @Scheduled(fixedDelay = 60000)
    public void checkHealth() {
        try {
            ClusterHealthRequest request = new ClusterHealthRequest();
            ClusterHealthResponse response = client.cluster().health(
                request, RequestOptions.DEFAULT
            );
            
            if (response.getStatus() == ClusterHealthStatus.RED) {
                log.error("Elasticsearch cluster is RED");
                // 发送告警
            } else if (response.getStatus() == ClusterHealthStatus.YELLOW) {
                log.warn("Elasticsearch cluster is YELLOW");
            } else {
                log.info("Elasticsearch cluster is GREEN");
            }
        } catch (Exception e) {
            log.error("Health check failed", e);
            // 发送告警
        }
    }
}
```

### 连接重试配置

```java
@Configuration
public class RetryConfig {
    
    @Bean
    public RestHighLevelClient clientWithRetry() {
        RestClientBuilder builder = RestClient.builder(
            new HttpHost("localhost", 9200, "http")
        );
        
        // 配置重试处理器
        builder.setHttpClientConfigCallback(httpClientBuilder -> {
            HttpRequestRetryHandler retryHandler = (exception, executionCount, context) -> {
                // 最大重试次数
                if (executionCount > 3) {
                    log.error("Maximum retries exceeded");
                    return false;
                }
                
                // 可重试的异常
                if (exception instanceof NoHttpResponseException ||
                    exception instanceof SocketTimeoutException ||
                    exception instanceof ConnectTimeoutException) {
                    log.warn("Retrying request, attempt: {}", executionCount);
                    return true;
                }
                
                return false;
            };
            
            return httpClientBuilder.setRetryHandler(retryHandler);
        });
        
        return new RestHighLevelClient(builder);
    }
}
```

### Spring Retry 集成

```java
@Configuration
@EnableRetry
public class SpringRetryConfig {
    
    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate template = new RetryTemplate();
        
        // 重试策略
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);
        template.setRetryPolicy(retryPolicy);
        
        // 退避策略
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(1000);
        backOffPolicy.setMultiplier(2);
        backOffPolicy.setMaxInterval(10000);
        template.setBackOffPolicy(backOffPolicy);
        
        return template;
    }
}

@Service
public class ProductService {
    
    @Autowired
    private RetryTemplate retryTemplate;
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    @Retryable(
        value = {ElasticsearchException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public Product save(Product product) {
        return template.save(product);
    }
}
```

## 实战案例

### 案例1：多环境配置

```yaml
# application.yml
spring:
  profiles:
    active: @profileActive@

---
# application-dev.yml
spring:
  config:
    activate:
      on-profile: dev
  elasticsearch:
    uris: http://localhost:9200
    username: elastic
    password: dev123

---
# application-prod.yml
spring:
  config:
    activate:
      on-profile: prod
  elasticsearch:
    uris:
      - http://es-node1:9200
      - http://es-node2:9200
      - http://es-node3:9200
    username: ${ES_USERNAME}
    password: ${ES_PASSWORD}
    connection-timeout: 3000
    socket-timeout: 60000
```

### 案例2：配置加密

```java
@Configuration
public class EncryptedConfig {
    
    @Bean
    public RestHighLevelClient client(
            @Value("${elasticsearch.password.encrypted}") String encryptedPassword) {
        
        // 解密密码
        String password = decrypt(encryptedPassword);
        
        CredentialsProvider provider = new BasicCredentialsProvider();
        provider.setCredentials(
            AuthScope.ANY,
            new UsernamePasswordCredentials("elastic", password)
        );
        
        RestClientBuilder builder = RestClient.builder(
            new HttpHost("localhost", 9200, "http")
        );
        
        builder.setHttpClientConfigCallback(httpClientBuilder ->
            httpClientBuilder.setDefaultCredentialsProvider(provider)
        );
        
        return new RestHighLevelClient(builder);
    }
    
    private String decrypt(String encrypted) {
        // 使用 Jasypt 或其他加密库解密
        return encrypted;
    }
}
```

## 总结

**基础配置**：
- application.yml 配置
- 多节点配置
- 认证配置

**自动配置**：
- AutoConfiguration 原理
- 条件注解
- 自定义覆盖

**连接池优化**：
- 最大连接数
- 每路由连接数
- 连接超时设置

**节点发现**：
- Sniffer 自动发现
- 手动配置多节点
- 节点选择策略

**安全连接**：
- 单向 SSL
- 双向 SSL
- 证书配置

**健康检查**：
- 定时检查
- 连接重试
- Spring Retry 集成

**最佳实践**：
- 多环境配置
- 配置加密
- 连接池调优
- 异常处理

**下一步**：学习 Repository 模式与基本 CRUD 操作。

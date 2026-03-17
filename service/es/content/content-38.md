# 高级特性与最佳实践

## 概述

本章介绍 Spring Data Elasticsearch 的高级特性，包括异步查询、响应式编程、多数据源配置、异常处理和性能优化等最佳实践。

## 异步查询支持

### @Async 配置

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("es-async-");
        executor.initialize();
        return executor;
    }
}
```

### 异步查询实现

```java
@Service
public class ProductAsyncService {
    
    @Autowired
    private ProductRepository repository;
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    @Async
    public CompletableFuture<List<Product>> searchAsync(String keyword) {
        List<Product> products = repository.findByNameContaining(keyword);
        return CompletableFuture.completedFuture(products);
    }
    
    @Async
    public CompletableFuture<Page<Product>> findAllAsync(Pageable pageable) {
        Page<Product> page = repository.findAll(pageable);
        return CompletableFuture.completedFuture(page);
    }
    
    @Async
    public CompletableFuture<Void> bulkIndexAsync(List<Product> products) {
        repository.saveAll(products);
        return CompletableFuture.completedFuture(null);
    }
}
```

### 使用示例

```java
@RestController
@RequestMapping("/api/async/products")
public class ProductAsyncController {
    
    @Autowired
    private ProductAsyncService asyncService;
    
    @GetMapping("/search")
    public CompletableFuture<ResponseEntity<List<Product>>> search(
            @RequestParam String keyword) {
        return asyncService.searchAsync(keyword)
            .thenApply(ResponseEntity::ok);
    }
    
    @GetMapping
    public CompletableFuture<ResponseEntity<Page<Product>>> list(Pageable pageable) {
        return asyncService.findAllAsync(pageable)
            .thenApply(ResponseEntity::ok);
    }
    
    @PostMapping("/bulk")
    public CompletableFuture<ResponseEntity<String>> bulkImport(
            @RequestBody List<Product> products) {
        return asyncService.bulkIndexAsync(products)
            .thenApply(v -> ResponseEntity.ok("Bulk import started"));
    }
}
```

### 并行异步查询

```java
@Service
public class ParallelSearchService {
    
    @Autowired
    private ProductAsyncService productService;
    
    @Autowired
    private OrderAsyncService orderService;
    
    @Autowired
    private UserAsyncService userService;
    
    public CompletableFuture<SearchAllResult> searchAll(String keyword) {
        CompletableFuture<List<Product>> productsFuture = 
            productService.searchAsync(keyword);
        
        CompletableFuture<List<Order>> ordersFuture = 
            orderService.searchAsync(keyword);
        
        CompletableFuture<List<User>> usersFuture = 
            userService.searchAsync(keyword);
        
        return CompletableFuture.allOf(
            productsFuture, ordersFuture, usersFuture
        ).thenApply(v -> {
            SearchAllResult result = new SearchAllResult();
            result.setProducts(productsFuture.join());
            result.setOrders(ordersFuture.join());
            result.setUsers(usersFuture.join());
            return result;
        });
    }
}
```

## 响应式编程（Reactive）集成

### 依赖配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-elasticsearch-reactive</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### ReactiveElasticsearchClient 配置

```java
@Configuration
public class ReactiveElasticsearchConfig {
    
    @Bean
    public ReactiveElasticsearchClient reactiveClient() {
        ClientConfiguration config = ClientConfiguration.builder()
            .connectedTo("localhost:9200")
            .build();
        
        return ReactiveRestClients.create(config);
    }
    
    @Bean
    public ReactiveElasticsearchTemplate reactiveTemplate(
            ReactiveElasticsearchClient client) {
        return new ReactiveElasticsearchTemplate(client);
    }
}
```

### ReactiveElasticsearchRepository

```java
public interface ReactiveProductRepository 
    extends ReactiveElasticsearchRepository<Product, String> {
    
    Flux<Product> findByName(String name);
    
    Flux<Product> findByCategory(String category);
    
    Flux<Product> findByPriceBetween(Double min, Double max);
    
    Mono<Long> countByCategory(String category);
}
```

### 响应式 Service

```java
@Service
public class ReactiveProductService {
    
    @Autowired
    private ReactiveProductRepository repository;
    
    @Autowired
    private ReactiveElasticsearchTemplate template;
    
    public Mono<Product> save(Product product) {
        product.setCreatedAt(new Date());
        return repository.save(product);
    }
    
    public Flux<Product> findAll() {
        return repository.findAll();
    }
    
    public Mono<Product> findById(String id) {
        return repository.findById(id);
    }
    
    public Flux<Product> search(String keyword) {
        Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.multiMatchQuery(keyword, "name", "description"))
            .build();
        
        return template.search(query, Product.class)
            .map(SearchHit::getContent);
    }
    
    public Mono<Void> deleteById(String id) {
        return repository.deleteById(id);
    }
}
```

### 响应式 Controller

```java
@RestController
@RequestMapping("/api/reactive/products")
public class ReactiveProductController {
    
    @Autowired
    private ReactiveProductService service;
    
    @PostMapping
    public Mono<Product> create(@RequestBody Product product) {
        return service.save(product);
    }
    
    @GetMapping("/{id}")
    public Mono<Product> get(@PathVariable String id) {
        return service.findById(id);
    }
    
    @GetMapping
    public Flux<Product> list() {
        return service.findAll();
    }
    
    @GetMapping("/search")
    public Flux<Product> search(@RequestParam String keyword) {
        return service.search(keyword);
    }
    
    @DeleteMapping("/{id}")
    public Mono<Void> delete(@PathVariable String id) {
        return service.deleteById(id);
    }
}
```

## 多数据源配置

### 配置文件

```yaml
spring:
  elasticsearch:
    primary:
      uris: http://es-cluster1:9200
      username: elastic
      password: password1
    
    secondary:
      uris: http://es-cluster2:9200
      username: elastic
      password: password2
```

### 多数据源配置类

```java
@Configuration
public class MultiElasticsearchConfig {
    
    @Primary
    @Bean(name = "primaryElasticsearchClient")
    public RestHighLevelClient primaryClient(
            @Value("${spring.elasticsearch.primary.uris}") String uris) {
        
        return RestClients.create(
            ClientConfiguration.builder()
                .connectedTo(uris.replace("http://", ""))
                .build()
        ).rest();
    }
    
    @Bean(name = "secondaryElasticsearchClient")
    public RestHighLevelClient secondaryClient(
            @Value("${spring.elasticsearch.secondary.uris}") String uris) {
        
        return RestClients.create(
            ClientConfiguration.builder()
                .connectedTo(uris.replace("http://", ""))
                .build()
        ).rest();
    }
    
    @Primary
    @Bean(name = "primaryElasticsearchTemplate")
    public ElasticsearchRestTemplate primaryTemplate(
            @Qualifier("primaryElasticsearchClient") RestHighLevelClient client) {
        return new ElasticsearchRestTemplate(client);
    }
    
    @Bean(name = "secondaryElasticsearchTemplate")
    public ElasticsearchRestTemplate secondaryTemplate(
            @Qualifier("secondaryElasticsearchClient") RestHighLevelClient client) {
        return new ElasticsearchRestTemplate(client);
    }
}
```

### 使用多数据源

```java
@Service
public class MultiSourceService {
    
    @Autowired
    @Qualifier("primaryElasticsearchTemplate")
    private ElasticsearchRestTemplate primaryTemplate;
    
    @Autowired
    @Qualifier("secondaryElasticsearchTemplate")
    private ElasticsearchRestTemplate secondaryTemplate;
    
    public List<Product> searchPrimary(String keyword) {
        Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.matchQuery("name", keyword))
            .build();
        
        SearchHits<Product> hits = primaryTemplate.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }
    
    public List<Product> searchSecondary(String keyword) {
        Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.matchQuery("name", keyword))
            .build();
        
        SearchHits<Product> hits = secondaryTemplate.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }
}
```

## 事务处理（有限支持）

### 注意事项

```
Elasticsearch 不支持传统的 ACID 事务：
  - 单文档操作是原子的
  - 批量操作不保证原子性
  - 无法回滚
  
适合场景：
  - 最终一致性可接受
  - 使用补偿机制
  - 事件溯源
```

### 补偿机制

```java
@Service
public class ProductTransactionalService {
    
    @Autowired
    private ProductRepository esRepository;
    
    @Autowired
    private ProductMapper dbMapper;
    
    @Transactional(rollbackFor = Exception.class)
    public Product createProduct(Product product) {
        // 1. 保存到数据库
        dbMapper.insert(product);
        
        try {
            // 2. 保存到 ES
            esRepository.save(product);
        } catch (Exception e) {
            log.error("Failed to save to ES, rolling back", e);
            // 数据库事务会自动回滚
            throw e;
        }
        
        return product;
    }
    
    @Transactional(rollbackFor = Exception.class)
    public void deleteProduct(String id) {
        // 1. 从数据库删除
        dbMapper.deleteById(id);
        
        try {
            // 2. 从 ES 删除
            esRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Failed to delete from ES", e);
            // 记录失败，后续补偿
            saveFailedOperation("DELETE", id);
        }
    }
    
    private void saveFailedOperation(String operation, String id) {
        // 保存失败操作，定时任务重试
    }
}
```

### 异步同步策略

```java
@Service
public class AsyncSyncService {
    
    @Autowired
    private ProductRepository esRepository;
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    @Transactional
    public Product createProduct(Product product) {
        // 1. 保存到数据库
        // dbMapper.insert(product);
        
        // 2. 发送 MQ 消息
        rabbitTemplate.convertAndSend(
            "product.exchange",
            "product.created",
            product
        );
        
        return product;
    }
    
    @RabbitListener(queues = "product.es.queue")
    public void syncToES(Product product) {
        try {
            esRepository.save(product);
        } catch (Exception e) {
            log.error("Failed to sync to ES", e);
            // 重试或记录失败
        }
    }
}
```

## 异常处理与统一封装

### 自定义异常

```java
public class ElasticsearchSearchException extends RuntimeException {
    public ElasticsearchSearchException(String message) {
        super(message);
    }
    
    public ElasticsearchSearchException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class ElasticsearchIndexException extends RuntimeException {
    public ElasticsearchIndexException(String message) {
        super(message);
    }
    
    public ElasticsearchIndexException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ElasticsearchException.class)
    public ResponseEntity<ErrorResponse> handleElasticsearchException(
            ElasticsearchException e) {
        log.error("Elasticsearch error", e);
        
        ErrorResponse error = new ErrorResponse();
        error.setCode("ES_ERROR");
        error.setMessage("Search service error: " + e.getMessage());
        error.setTimestamp(new Date());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(error);
    }
    
    @ExceptionHandler(ElasticsearchSearchException.class)
    public ResponseEntity<ErrorResponse> handleSearchException(
            ElasticsearchSearchException e) {
        log.error("Search error", e);
        
        ErrorResponse error = new ErrorResponse();
        error.setCode("SEARCH_ERROR");
        error.setMessage(e.getMessage());
        error.setTimestamp(new Date());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        log.error("Unexpected error", e);
        
        ErrorResponse error = new ErrorResponse();
        error.setCode("INTERNAL_ERROR");
        error.setMessage("Internal server error");
        error.setTimestamp(new Date());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(error);
    }
}
```

### Service 异常封装

```java
@Service
@Slf4j
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    public Product findById(String id) {
        try {
            return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
        } catch (ElasticsearchException e) {
            log.error("Failed to find product by id: {}", id, e);
            throw new ElasticsearchSearchException("Failed to search product", e);
        }
    }
    
    public Product save(Product product) {
        try {
            return repository.save(product);
        } catch (ElasticsearchException e) {
            log.error("Failed to save product", e);
            throw new ElasticsearchIndexException("Failed to index product", e);
        }
    }
    
    public List<Product> search(String keyword) {
        try {
            return repository.findByNameContaining(keyword);
        } catch (ElasticsearchException e) {
            log.error("Failed to search products with keyword: {}", keyword, e);
            throw new ElasticsearchSearchException("Search failed", e);
        }
    }
}
```

## 性能优化建议

### 批量操作优化

```java
@Service
public class OptimizedBulkService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    private static final int BATCH_SIZE = 1000;
    
    public void bulkIndex(List<Product> products) {
        // 分批处理
        Lists.partition(products, BATCH_SIZE).forEach(batch -> {
            List<IndexQuery> queries = batch.stream()
                .map(product -> new IndexQueryBuilder()
                    .withId(product.getId())
                    .withObject(product)
                    .build())
                .collect(Collectors.toList());
            
            template.bulkIndex(queries, IndexCoordinates.of("products"));
        });
    }
    
    // 并行批量索引
    @Async
    public CompletableFuture<Void> parallelBulkIndex(List<Product> products) {
        int processors = Runtime.getRuntime().availableProcessors();
        int partitionSize = products.size() / processors;
        
        List<CompletableFuture<Void>> futures = Lists.partition(products, partitionSize)
            .stream()
            .map(partition -> CompletableFuture.runAsync(() -> bulkIndex(partition)))
            .collect(Collectors.toList());
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
    }
}
```

### 查询优化

```java
@Service
public class OptimizedSearchService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    // 使用 filter 而非 query
    public List<Product> searchOptimized(ProductSearchDTO dto) {
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        
        // 全文搜索用 must
        if (dto.getKeyword() != null) {
            boolQuery.must(QueryBuilders.matchQuery("name", dto.getKeyword()));
        }
        
        // 精确匹配用 filter（可缓存）
        if (dto.getCategory() != null) {
            boolQuery.filter(QueryBuilders.termQuery("category", dto.getCategory()));
        }
        
        if (dto.getMinPrice() != null) {
            boolQuery.filter(QueryBuilders.rangeQuery("price").gte(dto.getMinPrice()));
        }
        
        Query query = new NativeSearchQueryBuilder()
            .withQuery(boolQuery)
            .withPageable(PageRequest.of(0, 100))
            .build();
        
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }
    
    // 限制返回字段
    public List<Product> searchWithLimitedFields(String keyword) {
        Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.matchQuery("name", keyword))
            .withSourceFilter(new FetchSourceFilter(
                new String[]{"id", "name", "price"},  // 包含
                new String[]{}  // 排除
            ))
            .build();
        
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }
}
```

### 连接池优化

```java
@Configuration
public class OptimizedClientConfig {
    
    @Bean
    public RestHighLevelClient optimizedClient() {
        RestClientBuilder builder = RestClient.builder(
            new HttpHost("localhost", 9200, "http")
        );
        
        // 连接池配置
        builder.setHttpClientConfigCallback(httpClientBuilder -> {
            httpClientBuilder.setMaxConnTotal(100);
            httpClientBuilder.setMaxConnPerRoute(20);
            httpClientBuilder.setConnectionTimeToLive(30, TimeUnit.SECONDS);
            httpClientBuilder.evictIdleConnections(60, TimeUnit.SECONDS);
            return httpClientBuilder;
        });
        
        // 超时配置
        builder.setRequestConfigCallback(requestConfigBuilder -> {
            requestConfigBuilder.setConnectTimeout(5000);
            requestConfigBuilder.setSocketTimeout(60000);
            requestConfigBuilder.setConnectionRequestTimeout(1000);
            return requestConfigBuilder;
        });
        
        return new RestHighLevelClient(builder);
    }
}
```

### 缓存策略

```java
@Service
public class CachedSearchService {
    
    @Autowired
    private ProductRepository repository;
    
    @Cacheable(value = "products", key = "#id")
    public Product findById(String id) {
        return repository.findById(id).orElse(null);
    }
    
    @Cacheable(value = "products:search", key = "#keyword")
    public List<Product> search(String keyword) {
        return repository.findByNameContaining(keyword);
    }
    
    @CacheEvict(value = "products", key = "#product.id")
    public Product save(Product product) {
        return repository.save(product);
    }
    
    @CacheEvict(value = {"products", "products:search"}, allEntries = true)
    public void clearCache() {
        // 清除所有缓存
    }
}
```

## Spring Boot Actuator 健康检查

### 依赖配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 配置文件

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
  health:
    elasticsearch:
      enabled: true
```

### 自定义健康检查

```java
@Component
public class ElasticsearchHealthIndicator implements HealthIndicator {
    
    @Autowired
    private RestHighLevelClient client;
    
    @Override
    public Health health() {
        try {
            ClusterHealthRequest request = new ClusterHealthRequest();
            ClusterHealthResponse response = client.cluster().health(
                request, RequestOptions.DEFAULT
            );
            
            ClusterHealthStatus status = response.getStatus();
            
            if (status == ClusterHealthStatus.GREEN) {
                return Health.up()
                    .withDetail("cluster", response.getClusterName())
                    .withDetail("status", status.name())
                    .withDetail("nodes", response.getNumberOfNodes())
                    .withDetail("data_nodes", response.getNumberOfDataNodes())
                    .withDetail("active_shards", response.getActiveShards())
                    .build();
            } else if (status == ClusterHealthStatus.YELLOW) {
                return Health.status("YELLOW")
                    .withDetail("cluster", response.getClusterName())
                    .withDetail("status", status.name())
                    .withDetail("unassigned_shards", response.getUnassignedShards())
                    .build();
            } else {
                return Health.down()
                    .withDetail("cluster", response.getClusterName())
                    .withDetail("status", status.name())
                    .withDetail("unassigned_shards", response.getUnassignedShards())
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withException(e)
                .build();
        }
    }
}
```

### 健康检查响应

```json
{
  "status": "UP",
  "components": {
    "elasticsearch": {
      "status": "UP",
      "details": {
        "cluster": "production",
        "status": "GREEN",
        "nodes": 5,
        "data_nodes": 3,
        "active_shards": 100
      }
    }
  }
}
```

## 总结

**异步查询**：
- @Async 注解
- CompletableFuture
- 并行查询

**响应式编程**：
- ReactiveElasticsearchRepository
- Flux/Mono
- WebFlux 集成

**多数据源**：
- 多客户端配置
- @Qualifier 区分
- 独立 Template

**事务处理**：
- 有限支持
- 补偿机制
- 异步同步

**异常处理**：
- 自定义异常
- 全局处理器
- 统一封装

**性能优化**：
- 批量操作
- 查询优化
- 连接池配置
- 缓存策略

**健康检查**：
- Actuator 集成
- 自定义指标
- 监控告警

**最佳实践**：
- 异步非阻塞
- 合理使用缓存
- 异常处理完善
- 性能监控

至此，第九部分"Spring Boot 集成"（第34-38章）已全部完成。

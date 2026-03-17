# 微服务架构中的 ES 集成

## 概述

在微服务架构中，Elasticsearch 通常作为独立的搜索服务存在。本章介绍如何在微服务体系中合理设计和使用 ES，包括服务设计、数据同步策略和分布式搜索挑战。

## 微服务架构下的搜索服务设计

### 架构设计

```
微服务架构：

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  用户服务   │  │  订单服务   │  │  商品服务   │
│  (MySQL)    │  │  (MySQL)    │  │  (MySQL)    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       │ CDC/MQ         │ CDC/MQ         │ CDC/MQ
       │                │                │
       └────────────────┼────────────────┘
                        ▼
              ┌─────────────────┐
              │   搜索服务       │
              │ (Elasticsearch) │
              └─────────────────┘
                        ▲
                        │
              ┌─────────┴─────────┐
              │                   │
         ┌────┴────┐        ┌────┴────┐
         │ Web 应用 │        │ App 应用 │
         └─────────┘        └─────────┘
```

### 搜索服务独立化

**优点**：
- 解耦业务逻辑
- 独立扩展
- 统一搜索入口
- 提升性能

**设计原则**：
- 单一职责
- 数据最终一致性
- 异步同步
- 降级策略

### 服务划分

```java
// 搜索服务 API
@RestController
@RequestMapping("/api/search")
public class SearchController {
    
    @Autowired
    private ProductSearchService productService;
    
    @Autowired
    private OrderSearchService orderService;
    
    @Autowired
    private UserSearchService userService;
    
    // 商品搜索
    @GetMapping("/products")
    public ResponseEntity<SearchResult<Product>> searchProducts(
            ProductSearchRequest request) {
        return ResponseEntity.ok(productService.search(request));
    }
    
    // 订单搜索
    @GetMapping("/orders")
    public ResponseEntity<SearchResult<Order>> searchOrders(
            OrderSearchRequest request) {
        return ResponseEntity.ok(orderService.search(request));
    }
    
    // 全局搜索
    @GetMapping("/all")
    public ResponseEntity<GlobalSearchResult> searchAll(
            @RequestParam String keyword) {
        
        GlobalSearchResult result = new GlobalSearchResult();
        result.setProducts(productService.searchByKeyword(keyword));
        result.setOrders(orderService.searchByKeyword(keyword));
        result.setUsers(userService.searchByKeyword(keyword));
        
        return ResponseEntity.ok(result);
    }
}
```

## 搜索服务的独立部署

### 服务拆分

**1. 搜索服务（search-service）**：

```yaml
# application.yml
spring:
  application:
    name: search-service
  
  elasticsearch:
    uris: http://es-cluster:9200
    username: elastic
    password: ${ES_PASSWORD}
  
  cloud:
    nacos:
      discovery:
        server-addr: nacos-server:8848

server:
  port: 8080
```

**2. 项目结构**：

```
search-service/
├── src/main/java/
│   └── com/example/search/
│       ├── SearchServiceApplication.java
│       ├── controller/
│       │   ├── ProductSearchController.java
│       │   ├── OrderSearchController.java
│       │   └── UserSearchController.java
│       ├── service/
│       │   ├── ProductSearchService.java
│       │   ├── OrderSearchService.java
│       │   └── UserSearchService.java
│       ├── repository/
│       │   ├── ProductRepository.java
│       │   ├── OrderRepository.java
│       │   └── UserRepository.java
│       ├── entity/
│       │   ├── ProductDocument.java
│       │   ├── OrderDocument.java
│       │   └── UserDocument.java
│       ├── dto/
│       ├── config/
│       └── mq/
│           └── DataSyncListener.java
├── pom.xml
└── Dockerfile
```

### Docker 部署

**Dockerfile**：

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/search-service.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xms512m -Xmx2048m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

**docker-compose.yml**：

```yaml
version: '3.8'

services:
  search-service:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - ES_PASSWORD=${ES_PASSWORD}
      - NACOS_SERVER=nacos-server:8848
    depends_on:
      - elasticsearch
      - rabbitmq
    networks:
      - microservices

  elasticsearch:
    image: elasticsearch:7.17.9
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms1g -Xmx1g
    ports:
      - "9200:9200"
    networks:
      - microservices

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    networks:
      - microservices

networks:
  microservices:
    driver: bridge
```

## 数据同步策略：CDC（Change Data Capture）

### Canal 方式

**Canal 简介**：
- 阿里开源的 MySQL binlog 增量订阅&消费组件
- 模拟 MySQL slave 的交互协议
- 伪装成 MySQL slave
- 向 MySQL master 发送 dump 协议
- MySQL master 推送 binlog 给 Canal

**架构**：

```
MySQL (Master) 
    ↓ binlog
Canal Server
    ↓ 解析
Canal Client (搜索服务)
    ↓ 同步
Elasticsearch
```

**Canal Client 实现**：

```java
@Component
@Slf4j
public class CanalClient {
    
    @Autowired
    private ProductRepository productRepository;
    
    @PostConstruct
    public void start() {
        // 创建连接
        CanalConnector connector = CanalConnectors.newSingleConnector(
            new InetSocketAddress("canal-server", 11111),
            "example",  // destination
            "canal",    // username
            "canal"     // password
        );
        
        new Thread(() -> {
            try {
                connector.connect();
                connector.subscribe("product_db.product");
                
                while (true) {
                    Message message = connector.getWithoutAck(100);
                    long batchId = message.getId();
                    
                    if (batchId == -1 || message.getEntries().isEmpty()) {
                        Thread.sleep(1000);
                        continue;
                    }
                    
                    processEntries(message.getEntries());
                    connector.ack(batchId);
                }
            } catch (Exception e) {
                log.error("Canal client error", e);
            } finally {
                connector.disconnect();
            }
        }).start();
    }
    
    private void processEntries(List<CanalEntry.Entry> entries) {
        for (CanalEntry.Entry entry : entries) {
            if (entry.getEntryType() != CanalEntry.EntryType.ROWDATA) {
                continue;
            }
            
            try {
                CanalEntry.RowChange rowChange = CanalEntry.RowChange.parseFrom(
                    entry.getStoreValue()
                );
                
                CanalEntry.EventType eventType = rowChange.getEventType();
                
                for (CanalEntry.RowData rowData : rowChange.getRowDatasList()) {
                    if (eventType == CanalEntry.EventType.INSERT ||
                        eventType == CanalEntry.EventType.UPDATE) {
                        syncInsertOrUpdate(rowData);
                    } else if (eventType == CanalEntry.EventType.DELETE) {
                        syncDelete(rowData);
                    }
                }
            } catch (Exception e) {
                log.error("Process entry error", e);
            }
        }
    }
    
    private void syncInsertOrUpdate(CanalEntry.RowData rowData) {
        Product product = new Product();
        
        for (CanalEntry.Column column : rowData.getAfterColumnsList()) {
            switch (column.getName()) {
                case "id":
                    product.setId(column.getValue());
                    break;
                case "name":
                    product.setName(column.getValue());
                    break;
                case "price":
                    product.setPrice(Double.parseDouble(column.getValue()));
                    break;
                case "category":
                    product.setCategory(column.getValue());
                    break;
            }
        }
        
        productRepository.save(product);
        log.info("Synced product to ES: {}", product.getId());
    }
    
    private void syncDelete(CanalEntry.RowData rowData) {
        String id = null;
        for (CanalEntry.Column column : rowData.getBeforeColumnsList()) {
            if ("id".equals(column.getName())) {
                id = column.getValue();
                break;
            }
        }
        
        if (id != null) {
            productRepository.deleteById(id);
            log.info("Deleted product from ES: {}", id);
        }
    }
}
```

### Debezium 方式

**Debezium 简介**：
- 开源的 CDC 平台
- 支持 MySQL、PostgreSQL、MongoDB 等
- 基于 Kafka Connect
- 提供容错、高可用

**配置示例**：

```json
{
  "name": "product-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184054",
    "database.server.name": "product_db",
    "table.include.list": "product_db.product",
    "database.history.kafka.bootstrap.servers": "kafka:9092",
    "database.history.kafka.topic": "schema-changes.product"
  }
}
```

**Kafka Consumer**：

```java
@Component
@Slf4j
public class DebeziumConsumer {
    
    @Autowired
    private ProductRepository productRepository;
    
    @KafkaListener(topics = "product_db.product", groupId = "search-service")
    public void consume(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            String operation = node.get("op").asText();
            JsonNode after = node.get("after");
            JsonNode before = node.get("before");
            
            switch (operation) {
                case "c":  // create
                case "u":  // update
                    syncInsertOrUpdate(after);
                    break;
                case "d":  // delete
                    syncDelete(before);
                    break;
            }
        } catch (Exception e) {
            log.error("Failed to process CDC message", e);
        }
    }
    
    private void syncInsertOrUpdate(JsonNode data) {
        Product product = objectMapper.convertValue(data, Product.class);
        productRepository.save(product);
    }
    
    private void syncDelete(JsonNode data) {
        String id = data.get("id").asText();
        productRepository.deleteById(id);
    }
}
```

## 事件驱动的数据同步（MQ）

### RabbitMQ 实现

**生产者（业务服务）**：

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    @Transactional
    public Product createProduct(Product product) {
        // 1. 保存到数据库
        productMapper.insert(product);
        
        // 2. 发送 MQ 消息
        ProductSyncMessage message = new ProductSyncMessage();
        message.setOperation("CREATE");
        message.setProduct(product);
        
        rabbitTemplate.convertAndSend(
            "product.exchange",
            "product.sync",
            message
        );
        
        return product;
    }
    
    @Transactional
    public Product updateProduct(Product product) {
        productMapper.updateById(product);
        
        ProductSyncMessage message = new ProductSyncMessage();
        message.setOperation("UPDATE");
        message.setProduct(product);
        
        rabbitTemplate.convertAndSend(
            "product.exchange",
            "product.sync",
            message
        );
        
        return product;
    }
    
    @Transactional
    public void deleteProduct(String id) {
        productMapper.deleteById(id);
        
        ProductSyncMessage message = new ProductSyncMessage();
        message.setOperation("DELETE");
        message.setProductId(id);
        
        rabbitTemplate.convertAndSend(
            "product.exchange",
            "product.sync",
            message
        );
    }
}
```

**消费者（搜索服务）**：

```java
@Component
@Slf4j
public class ProductSyncListener {
    
    @Autowired
    private ProductRepository productRepository;
    
    @RabbitListener(queues = "product.sync.queue")
    public void handleProductSync(ProductSyncMessage message) {
        try {
            switch (message.getOperation()) {
                case "CREATE":
                case "UPDATE":
                    productRepository.save(message.getProduct());
                    log.info("Synced product: {}", message.getProduct().getId());
                    break;
                    
                case "DELETE":
                    productRepository.deleteById(message.getProductId());
                    log.info("Deleted product: {}", message.getProductId());
                    break;
            }
        } catch (Exception e) {
            log.error("Failed to sync product", e);
            // 重试或记录失败
            throw new AmqpRejectAndDontRequeueException("Sync failed", e);
        }
    }
}
```

**MQ 配置**：

```java
@Configuration
public class RabbitMQConfig {
    
    @Bean
    public Exchange productExchange() {
        return ExchangeBuilder.topicExchange("product.exchange")
            .durable(true)
            .build();
    }
    
    @Bean
    public Queue productSyncQueue() {
        return QueueBuilder.durable("product.sync.queue")
            .withArgument("x-dead-letter-exchange", "product.dlx")
            .build();
    }
    
    @Bean
    public Binding productSyncBinding() {
        return BindingBuilder.bind(productSyncQueue())
            .to(productExchange())
            .with("product.sync")
            .noargs();
    }
    
    // 死信队列
    @Bean
    public Exchange productDLX() {
        return ExchangeBuilder.directExchange("product.dlx")
            .durable(true)
            .build();
    }
    
    @Bean
    public Queue productDLQ() {
        return QueueBuilder.durable("product.dlq").build();
    }
    
    @Bean
    public Binding productDLQBinding() {
        return BindingBuilder.bind(productDLQ())
            .to(productDLX())
            .with("product.sync")
            .noargs();
    }
}
```

### Kafka 实现

**生产者**：

```java
@Service
public class ProductKafkaProducer {
    
    @Autowired
    private KafkaTemplate<String, ProductSyncMessage> kafkaTemplate;
    
    public void sendSyncMessage(String operation, Product product) {
        ProductSyncMessage message = new ProductSyncMessage();
        message.setOperation(operation);
        message.setProduct(product);
        message.setTimestamp(System.currentTimeMillis());
        
        kafkaTemplate.send("product-sync", product.getId(), message);
    }
}
```

**消费者**：

```java
@Component
@Slf4j
public class ProductKafkaConsumer {
    
    @Autowired
    private ProductRepository productRepository;
    
    @KafkaListener(topics = "product-sync", groupId = "search-service")
    public void consume(ConsumerRecord<String, ProductSyncMessage> record) {
        ProductSyncMessage message = record.value();
        
        try {
            switch (message.getOperation()) {
                case "CREATE":
                case "UPDATE":
                    productRepository.save(message.getProduct());
                    break;
                case "DELETE":
                    productRepository.deleteById(message.getProduct().getId());
                    break;
            }
        } catch (Exception e) {
            log.error("Failed to sync product from Kafka", e);
        }
    }
}
```

## 分布式搜索的挑战

### 数据一致性

**问题**：
- 数据库与 ES 不一致
- 网络延迟导致顺序问题
- 消息丢失

**解决方案**：

```java
@Service
public class DataConsistencyService {
    
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private ProductRepository esRepository;
    
    // 定期全量同步
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨 2 点
    public void fullSync() {
        log.info("Starting full sync...");
        
        int pageSize = 1000;
        int offset = 0;
        
        while (true) {
            List<Product> products = productMapper.selectPage(offset, pageSize);
            if (products.isEmpty()) {
                break;
            }
            
            esRepository.saveAll(products);
            offset += pageSize;
            
            log.info("Synced {} products", offset);
        }
        
        log.info("Full sync completed");
    }
    
    // 增量对比
    @Scheduled(fixedDelay = 300000)  // 每 5 分钟
    public void incrementalCheck() {
        Date lastCheckTime = getLastCheckTime();
        List<Product> changedProducts = productMapper.selectChangedSince(lastCheckTime);
        
        for (Product product : changedProducts) {
            Optional<Product> esProduct = esRepository.findById(product.getId());
            
            if (!esProduct.isPresent() || 
                !product.equals(esProduct.get())) {
                esRepository.save(product);
            }
        }
        
        updateLastCheckTime(new Date());
    }
}
```

### 性能优化

**缓存策略**：

```java
@Service
public class CachedSearchService {
    
    @Autowired
    private ProductSearchService searchService;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String CACHE_PREFIX = "search:";
    private static final long CACHE_TTL = 300;  // 5 分钟
    
    public SearchResult<Product> search(ProductSearchRequest request) {
        String cacheKey = CACHE_PREFIX + generateKey(request);
        
        // 从缓存获取
        SearchResult<Product> cached = (SearchResult<Product>) 
            redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) {
            return cached;
        }
        
        // 执行搜索
        SearchResult<Product> result = searchService.search(request);
        
        // 存入缓存
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL, TimeUnit.SECONDS);
        
        return result;
    }
    
    private String generateKey(ProductSearchRequest request) {
        return DigestUtils.md5Hex(JSON.toJSONString(request));
    }
}
```

## 微服务间的搜索协调

### Feign 调用

**搜索服务 API**：

```java
@FeignClient(name = "search-service")
public interface SearchServiceClient {
    
    @GetMapping("/api/search/products")
    SearchResult<Product> searchProducts(
        @SpringQueryMap ProductSearchRequest request
    );
    
    @GetMapping("/api/search/orders")
    SearchResult<Order> searchOrders(
        @SpringQueryMap OrderSearchRequest request
    );
}
```

**业务服务使用**：

```java
@Service
public class ProductFacadeService {
    
    @Autowired
    private SearchServiceClient searchClient;
    
    public List<Product> searchProducts(String keyword) {
        ProductSearchRequest request = new ProductSearchRequest();
        request.setKeyword(keyword);
        request.setPage(0);
        request.setSize(10);
        
        SearchResult<Product> result = searchClient.searchProducts(request);
        return result.getItems();
    }
}
```

### 熔断降级

```java
@Service
public class SearchFallbackService {
    
    @Autowired
    private ProductMapper productMapper;
    
    @HystrixCommand(fallbackMethod = "searchFallback")
    public List<Product> search(String keyword) {
        // 调用搜索服务
        return searchClient.search(keyword);
    }
    
    public List<Product> searchFallback(String keyword, Throwable e) {
        log.error("Search service failed, using fallback", e);
        
        // 降级：从数据库查询
        return productMapper.selectByKeyword(keyword);
    }
}
```

## 总结

**服务设计**：
- 独立搜索服务
- 单一职责
- 统一入口

**独立部署**：
- Docker 容器化
- 服务注册发现
- 配置管理

**数据同步**：
- CDC（Canal/Debezium）
- MQ 异步同步
- 定期全量同步

**一致性保障**：
- 最终一致性
- 增量对比
- 补偿机制

**性能优化**：
- 缓存策略
- 批量操作
- 连接池优化

**服务协调**：
- Feign 调用
- 熔断降级
- 负载均衡

**挑战应对**：
- 数据一致性
- 性能优化
- 高可用保障

**下一步**：学习配置中心与服务发现。

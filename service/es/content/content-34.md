# Spring Data Elasticsearch 介绍

## 概述

Spring Data Elasticsearch 是 Spring Data 家族的一员，提供了基于 Spring 的 Elasticsearch 集成方案，简化了 ES 的开发工作。

## Spring Data Elasticsearch 架构

### 核心组件

```
Spring Data Elasticsearch 架构：

应用层（Application Layer）
    ↓
Repository 接口层（ElasticsearchRepository）
    ↓
操作模板层（ElasticsearchOperations）
    ├── ElasticsearchTemplate（已弃用）
    └── ElasticsearchRestTemplate（推荐）
    ↓
客户端层（Client Layer）
    ├── TransportClient（已弃用，7.x 移除）
    └── RestHighLevelClient（推荐）
    ↓
Elasticsearch 集群
```

### 核心接口

**ElasticsearchOperations**：

```java
public interface ElasticsearchOperations {
    // 索引操作
    IndexResponse index(IndexQuery query);
    boolean indexExists(String indexName);
    
    // 文档操作
    <T> T get(String id, Class<T> clazz);
    void delete(String id, Class<?> clazz);
    
    // 搜索操作
    <T> SearchHits<T> search(Query query, Class<T> clazz);
    long count(Query query, Class<?> clazz);
}
```

**ElasticsearchRepository**：

```java
public interface ElasticsearchRepository<T, ID> 
    extends PagingAndSortingRepository<T, ID> {
    
    <S extends T> S save(S entity);
    Iterable<T> findAll();
    Optional<T> findById(ID id);
    void deleteById(ID id);
    
    // 搜索相关
    <S extends T> Iterable<S> saveAll(Iterable<S> entities);
    Page<T> findAll(Pageable pageable);
}
```

## 版本对应关系

### Spring Data Elasticsearch vs Elasticsearch

```
Spring Data Elasticsearch 版本对应：

Spring Data ES    Elasticsearch    Spring Boot
5.0.x            8.7.x            3.1.x
4.4.x            7.17.x           2.7.x
4.3.x            7.15.x           2.6.x
4.2.x            7.12.x           2.5.x
4.1.x            7.10.x           2.4.x
4.0.x            7.6.x            2.3.x
3.2.x            6.8.x            2.1.x

注意：
- Spring Data ES 与 ES 版本必须匹配
- 不匹配可能导致 API 不兼容
- 选择稳定的 LTS 版本
```

### 依赖配置

**Maven（Spring Boot 2.7.x + ES 7.17.x）**：

```xml
<properties>
    <spring-boot.version>2.7.18</spring-boot.version>
    <elasticsearch.version>7.17.9</elasticsearch.version>
</properties>

<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
    </dependency>
    
    <!-- Elasticsearch Client -->
    <dependency>
        <groupId>org.elasticsearch.client</groupId>
        <artifactId>elasticsearch-rest-high-level-client</artifactId>
        <version>${elasticsearch.version}</version>
    </dependency>
</dependencies>
```

**Gradle**：

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-elasticsearch'
    implementation "org.elasticsearch.client:elasticsearch-rest-high-level-client:${elasticsearchVersion}"
}
```

## 核心组件详解

### ElasticsearchTemplate（已弃用）

**特点**：
- 基于 TransportClient
- ES 7.x 后不再推荐
- 性能较好但不够灵活

```java
@Configuration
public class ElasticsearchConfig {
    
    @Bean
    public TransportClient client() throws UnknownHostException {
        TransportClient client = new PreBuiltTransportClient(Settings.EMPTY);
        client.addTransportAddress(
            new TransportAddress(InetAddress.getByName("localhost"), 9300)
        );
        return client;
    }
    
    @Bean
    public ElasticsearchTemplate elasticsearchTemplate() {
        return new ElasticsearchTemplate(client());
    }
}
```

### ElasticsearchRestTemplate（推荐）

**特点**：
- 基于 RestHighLevelClient
- ES 官方推荐
- 支持所有 REST API

```java
@Configuration
public class ElasticsearchConfig {
    
    @Bean
    public RestHighLevelClient client() {
        ClientConfiguration config = ClientConfiguration.builder()
            .connectedTo("localhost:9200")
            .build();
        
        return RestClients.create(config).rest();
    }
    
    @Bean
    public ElasticsearchRestTemplate elasticsearchRestTemplate() {
        return new ElasticsearchRestTemplate(client());
    }
}
```

**常用操作**：

```java
@Service
public class ProductService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    // 索引文档
    public void indexProduct(Product product) {
        IndexQuery query = new IndexQueryBuilder()
            .withId(product.getId())
            .withObject(product)
            .build();
        template.index(query, IndexCoordinates.of("products"));
    }
    
    // 搜索文档
    public List<Product> searchProducts(String keyword) {
        Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.matchQuery("name", keyword))
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

## 与原生 Java Client 对比

### 原生 RestHighLevelClient

```java
// 索引文档
IndexRequest request = new IndexRequest("products")
    .id("1")
    .source(XContentType.JSON, 
        "name", "iPhone 14",
        "price", 5999);

IndexResponse response = client.index(request, RequestOptions.DEFAULT);

// 搜索文档
SearchRequest searchRequest = new SearchRequest("products");
SearchSourceBuilder builder = new SearchSourceBuilder();
builder.query(QueryBuilders.matchQuery("name", "iPhone"));
searchRequest.source(builder);

SearchResponse searchResponse = client.search(
    searchRequest, RequestOptions.DEFAULT
);
```

### Spring Data Elasticsearch

```java
// 索引文档
Product product = new Product("1", "iPhone 14", 5999);
productRepository.save(product);

// 搜索文档
List<Product> products = productRepository.findByName("iPhone");
```

**对比**：

```
原生 Client：
  ✓ 功能完整，支持所有 API
  ✓ 性能最优
  ✗ 代码冗长
  ✗ 需要手动处理序列化
  ✗ 无类型安全

Spring Data ES：
  ✓ 代码简洁
  ✓ 自动序列化
  ✓ 类型安全
  ✓ 支持 Spring 生态
  ✗ 部分高级特性需要自定义
  ✗ 性能略低于原生
```

## 连接方式对比

### TransportClient（已弃用）

```java
TransportClient client = new PreBuiltTransportClient(Settings.EMPTY);
client.addTransportAddress(
    new TransportAddress(InetAddress.getByName("localhost"), 9300)
);

特点：
  - 使用 TCP 协议（9300 端口）
  - 性能好
  - ES 7.x 已弃用
  - ES 8.x 已移除
```

### RestHighLevelClient（推荐）

```java
RestHighLevelClient client = new RestHighLevelClient(
    RestClient.builder(
        new HttpHost("localhost", 9200, "http")
    )
);

特点：
  - 使用 HTTP 协议（9200 端口）
  - 官方推荐
  - 功能完整
  - 支持所有 REST API
```

### Java API Client（最新）

```java
// ES 8.x 推荐使用
ElasticsearchClient client = new ElasticsearchClient(transport);

特点：
  - ES 8.x 新客户端
  - 类型安全
  - 流式 API
  - Spring Data ES 5.x+ 支持
```

## 实战案例

### 案例1：快速搭建 Spring Boot + ES 项目

**1. 创建 Spring Boot 项目**：

```xml
<!-- pom.xml -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
</dependencies>
```

**2. 配置连接**：

```yaml
# application.yml
spring:
  elasticsearch:
    uris: http://localhost:9200
    username: elastic
    password: password
```

**3. 定义实体**：

```java
@Data
@Document(indexName = "products")
public class Product {
    
    @Id
    private String id;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String name;
    
    @Field(type = FieldType.Keyword)
    private String category;
    
    @Field(type = FieldType.Double)
    private Double price;
    
    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private Date createdAt;
}
```

**4. 创建 Repository**：

```java
public interface ProductRepository 
    extends ElasticsearchRepository<Product, String> {
    
    List<Product> findByName(String name);
    
    List<Product> findByCategory(String category);
    
    List<Product> findByPriceBetween(Double min, Double max);
}
```

**5. 使用 Service**：

```java
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository repository;
    
    public Product save(Product product) {
        return repository.save(product);
    }
    
    public List<Product> searchByName(String name) {
        return repository.findByName(name);
    }
    
    public Page<Product> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }
}
```

**6. Controller**：

```java
@RestController
@RequestMapping("/products")
public class ProductController {
    
    @Autowired
    private ProductService service;
    
    @PostMapping
    public Product create(@RequestBody Product product) {
        return service.save(product);
    }
    
    @GetMapping("/search")
    public List<Product> search(@RequestParam String name) {
        return service.searchByName(name);
    }
    
    @GetMapping
    public Page<Product> list(Pageable pageable) {
        return service.findAll(pageable);
    }
}
```

### 案例2：混合使用 Repository 和 Template

```java
@Service
public class ProductSearchService {
    
    @Autowired
    private ProductRepository repository;
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    // 简单查询使用 Repository
    public List<Product> findByCategory(String category) {
        return repository.findByCategory(category);
    }
    
    // 复杂查询使用 Template
    public List<Product> complexSearch(String keyword, 
                                       Double minPrice, 
                                       Double maxPrice) {
        BoolQueryBuilder queryBuilder = QueryBuilders.boolQuery()
            .must(QueryBuilders.multiMatchQuery(keyword, "name", "description"))
            .filter(QueryBuilders.rangeQuery("price")
                .gte(minPrice)
                .lte(maxPrice));
        
        Query query = new NativeSearchQueryBuilder()
            .withQuery(queryBuilder)
            .withPageable(PageRequest.of(0, 10))
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

## 选择建议

### 何时使用 Repository

```
适用场景：
  ✓ 简单 CRUD 操作
  ✓ 基于方法名的查询
  ✓ 标准分页和排序
  ✓ 快速开发

示例：
  - findById
  - findByName
  - findByCategory
  - save、delete
```

### 何时使用 Template

```
适用场景：
  ✓ 复杂查询（多条件、聚合）
  ✓ 自定义评分
  ✓ 批量操作优化
  ✓ 高级功能（高亮、建议）

示例：
  - 复杂 bool 查询
  - 聚合统计
  - 高亮显示
  - Scroll 遍历
```

### 混合使用（推荐）

```java
@Service
public class SearchService {
    
    @Autowired
    private ProductRepository repository;
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    // 简单查询用 Repository
    public Product findById(String id) {
        return repository.findById(id).orElse(null);
    }
    
    // 复杂查询用 Template
    public List<Product> advancedSearch(SearchRequest request) {
        // 使用 Template 实现复杂查询
    }
}
```

## 总结

**Spring Data Elasticsearch 架构**：
- Repository 层：简化 CRUD
- Template 层：灵活操作
- Client 层：底层通信

**版本对应关系**：
- 必须严格匹配
- 推荐使用稳定版本
- Spring Boot 2.7.x + ES 7.17.x

**核心组件**：
- ElasticsearchRestTemplate：推荐使用
- ElasticsearchRepository：简化开发
- RestHighLevelClient：底层客户端

**连接方式**：
- TransportClient：已弃用
- RestHighLevelClient：推荐
- Java API Client：ES 8.x 最新

**对比原生客户端**：
- Spring Data ES：简洁、易用
- 原生 Client：完整、高性能
- 混合使用：最佳实践

**选择建议**：
- 简单查询：Repository
- 复杂查询：Template
- 混合使用：推荐

**下一步**：学习 Spring Boot 配置与连接管理。

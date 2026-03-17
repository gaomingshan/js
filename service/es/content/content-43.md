# 电商搜索引擎实战

## 概述

电商搜索是 Elasticsearch 最典型的应用场景。本章以实战项目的形式，介绍如何构建高性能的电商搜索系统，包括索引设计、多维度搜索、相关性调优等核心内容。

## 商品索引设计：SKU vs SPU

### SKU 与 SPU 概念

```
SPU（Standard Product Unit）标准产品单元：
  - 例如：iPhone 14 Pro
  - 属性：品牌、型号、系列

SKU（Stock Keeping Unit）库存量单位：
  - 例如：iPhone 14 Pro 256GB 深空黑
  - 属性：颜色、容量、配置
```

### 索引设计方案

**方案一：SKU 为主索引**

```java
@Document(indexName = "products")
public class ProductSKU {
    @Id
    private String skuId;
    
    // SPU 信息
    private String spuId;
    private String spuName;
    private String brand;
    private String category;
    
    // SKU 信息
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String skuName;  // iPhone 14 Pro 256GB 深空黑
    
    @Field(type = FieldType.Keyword)
    private String color;
    
    @Field(type = FieldType.Keyword)
    private String capacity;
    
    @Field(type = FieldType.Double)
    private Double price;
    
    @Field(type = FieldType.Integer)
    private Integer stock;
    
    @Field(type = FieldType.Integer)
    private Integer salesCount;
    
    // 嵌套属性
    @Field(type = FieldType.Nested)
    private List<Attribute> attributes;
}
```

**优点**：
- 库存管理简单
- 价格查询准确
- 适合库存系统

**缺点**：
- 搜索结果重复（同款不同颜色）
- 需要去重聚合

**方案二：SPU 为主，嵌套 SKU**

```java
@Document(indexName = "products")
public class ProductSPU {
    @Id
    private String spuId;
    
    @MultiField(
        mainField = @Field(type = FieldType.Text, analyzer = "ik_max_word"),
        otherFields = {
            @InnerField(suffix = "keyword", type = FieldType.Keyword)
        }
    )
    private String spuName;
    
    @Field(type = FieldType.Keyword)
    private String brand;
    
    @Field(type = FieldType.Keyword)
    private String category;
    
    // 价格范围
    private Double minPrice;
    private Double maxPrice;
    
    // 总销量
    private Integer totalSales;
    
    // SKU 列表（嵌套）
    @Field(type = FieldType.Nested)
    private List<SKU> skus;
    
    @Data
    public static class SKU {
        private String skuId;
        private String skuName;
        private String color;
        private String capacity;
        private Double price;
        private Integer stock;
    }
}
```

**优点**：
- 搜索结果不重复
- 用户体验好
- 适合前端展示

**缺点**：
- 索引复杂
- 聚合查询复杂

**推荐方案**：两个索引并存

```
products_spu：用于搜索列表
products_sku：用于库存管理、订单系统
```

## 多维度搜索实现

### 关键词搜索

```java
public SearchResult<Product> searchByKeyword(String keyword, Pageable pageable) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    
    // 多字段匹配
    MultiMatchQueryBuilder multiMatch = QueryBuilders
        .multiMatchQuery(keyword, "spuName^3", "brand^2", "category", "description")
        .type(MultiMatchQueryBuilder.Type.BEST_FIELDS)
        .fuzziness(Fuzziness.AUTO);
    
    boolQuery.must(multiMatch);
    
    // 只搜索上架商品
    boolQuery.filter(QueryBuilders.termQuery("status", "online"));
    
    Query query = new NativeSearchQueryBuilder()
        .withQuery(boolQuery)
        .withPageable(pageable)
        .build();
    
    SearchHits<Product> hits = template.search(
        query, Product.class, IndexCoordinates.of("products_spu")
    );
    
    return buildResult(hits);
}
```

### 分类筛选

```java
public SearchResult<Product> searchWithFilters(SearchRequest request) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    
    // 关键词
    if (StringUtils.hasText(request.getKeyword())) {
        boolQuery.must(QueryBuilders.multiMatchQuery(
            request.getKeyword(), "spuName^3", "description"
        ));
    }
    
    // 分类过滤（多级）
    if (request.getCategory() != null) {
        if (request.getCategory().getLevel1() != null) {
            boolQuery.filter(QueryBuilders.termQuery(
                "category.level1", request.getCategory().getLevel1()
            ));
        }
        if (request.getCategory().getLevel2() != null) {
            boolQuery.filter(QueryBuilders.termQuery(
                "category.level2", request.getCategory().getLevel2()
            ));
        }
    }
    
    // 品牌过滤（多选）
    if (request.getBrands() != null && !request.getBrands().isEmpty()) {
        boolQuery.filter(QueryBuilders.termsQuery("brand", request.getBrands()));
    }
    
    // 价格范围
    if (request.getMinPrice() != null || request.getMaxPrice() != null) {
        RangeQueryBuilder priceRange = QueryBuilders.rangeQuery("minPrice");
        if (request.getMinPrice() != null) {
            priceRange.gte(request.getMinPrice());
        }
        if (request.getMaxPrice() != null) {
            priceRange.lte(request.getMaxPrice());
        }
        boolQuery.filter(priceRange);
    }
    
    // 构建查询
    Query query = new NativeSearchQueryBuilder()
        .withQuery(boolQuery)
        .withPageable(request.getPageable())
        .build();
    
    return search(query);
}
```

### 属性筛选（嵌套查询）

```java
// 商品属性
@Field(type = FieldType.Nested)
private List<Attribute> attributes;

@Data
public static class Attribute {
    private String name;   // 内存
    private String value;  // 8GB
}

// 查询：内存=8GB 且 存储=256GB
public List<Product> searchByAttributes(Map<String, String> attrs) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    
    attrs.forEach((name, value) -> {
        NestedQueryBuilder nestedQuery = QueryBuilders.nestedQuery(
            "attributes",
            QueryBuilders.boolQuery()
                .must(QueryBuilders.termQuery("attributes.name", name))
                .must(QueryBuilders.termQuery("attributes.value", value)),
            ScoreMode.None
        );
        
        boolQuery.filter(nestedQuery);
    });
    
    Query query = new NativeSearchQueryBuilder()
        .withQuery(boolQuery)
        .build();
    
    return search(query);
}
```

## 搜索推荐与自动补全

### 搜索建议（Suggester）

```java
@Document(indexName = "products_suggest")
public class ProductSuggest {
    @Id
    private String id;
    
    @CompletionField(maxInputLength = 100)
    private Completion suggest;
    
    private String spuName;
    private Integer weight;  // 权重（销量）
}

// 创建建议数据
public void indexSuggest(Product product) {
    ProductSuggest suggest = new ProductSuggest();
    suggest.setId(product.getSpuId());
    suggest.setSpuName(product.getSpuName());
    
    Completion completion = new Completion(new String[]{
        product.getSpuName(),
        product.getBrand() + " " + product.getSpuName()
    });
    completion.setWeight(product.getTotalSales());  // 销量作为权重
    
    suggest.setSuggest(completion);
    suggestRepository.save(suggest);
}

// 查询建议
public List<String> getSuggestions(String prefix) {
    CompletionSuggestionBuilder suggestion = SuggestBuilders
        .completionSuggestion("suggest")
        .prefix(prefix)
        .size(10)
        .skipDuplicates(true);
    
    SuggestBuilder suggestBuilder = new SuggestBuilder()
        .addSuggestion("product-suggest", suggestion);
    
    SearchRequest searchRequest = new SearchRequest("products_suggest");
    searchRequest.source(new SearchSourceBuilder().suggest(suggestBuilder));
    
    try {
        SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);
        CompletionSuggestion completionSuggestion = response.getSuggest()
            .getSuggestion("product-suggest");
        
        return completionSuggestion.getOptions().stream()
            .map(option -> option.getText().string())
            .collect(Collectors.toList());
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

### 热门搜索

```java
@Service
public class HotSearchService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String HOT_SEARCH_KEY = "hot_search";
    
    // 记录搜索词
    public void recordSearch(String keyword) {
        redisTemplate.opsForZSet().incrementScore(
            HOT_SEARCH_KEY, keyword, 1
        );
    }
    
    // 获取热门搜索
    public List<String> getHotSearches(int limit) {
        Set<Object> top = redisTemplate.opsForZSet()
            .reverseRange(HOT_SEARCH_KEY, 0, limit - 1);
        
        return top.stream()
            .map(Object::toString)
            .collect(Collectors.toList());
    }
}
```

## 相关性调优

### 商品权重设置

```java
public SearchResult<Product> searchWithBoost(String keyword) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    
    // 关键词匹配
    boolQuery.must(QueryBuilders.multiMatchQuery(keyword, "spuName", "description"));
    
    // 销量加权（Function Score）
    FunctionScoreQueryBuilder functionScore = QueryBuilders.functionScoreQuery(
        boolQuery,
        new FunctionScoreQueryBuilder.FilterFunctionBuilder[]{
            // 销量权重
            new FunctionScoreQueryBuilder.FilterFunctionBuilder(
                ScoreFunctionBuilders.fieldValueFactorFunction("totalSales")
                    .factor(0.1f)
                    .modifier(FieldValueFactorFunction.Modifier.LOG1P)
            ),
            // 新品加权
            new FunctionScoreQueryBuilder.FilterFunctionBuilder(
                QueryBuilders.rangeQuery("createTime").gte("now-30d"),
                ScoreFunctionBuilders.weightFactorFunction(1.5f)
            ),
            // 高价加权（利润高）
            new FunctionScoreQueryBuilder.FilterFunctionBuilder(
                QueryBuilders.rangeQuery("price").gte(5000),
                ScoreFunctionBuilders.weightFactorFunction(1.2f)
            )
        }
    )
    .scoreMode(FunctionScoreQuery.ScoreMode.MULTIPLY)
    .boostMode(CombineFunction.MULTIPLY);
    
    Query query = new NativeSearchQueryBuilder()
        .withQuery(functionScore)
        .build();
    
    return search(query);
}
```

### 个性化推荐

```java
public SearchResult<Product> personalizedSearch(String keyword, String userId) {
    // 获取用户画像
    UserProfile profile = userProfileService.getUserProfile(userId);
    
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    boolQuery.must(QueryBuilders.matchQuery("spuName", keyword));
    
    // 基于用户偏好加权
    if (profile.getFavoriteBrands() != null) {
        profile.getFavoriteBrands().forEach(brand -> {
            boolQuery.should(
                QueryBuilders.termQuery("brand", brand).boost(2.0f)
            );
        });
    }
    
    // 基于浏览历史加权
    if (profile.getViewedCategories() != null) {
        profile.getViewedCategories().forEach(category -> {
            boolQuery.should(
                QueryBuilders.termQuery("category", category).boost(1.5f)
            );
        });
    }
    
    Query query = new NativeSearchQueryBuilder()
        .withQuery(boolQuery)
        .build();
    
    return search(query);
}
```

## 搜索性能优化

### 缓存策略

```java
@Service
public class CachedSearchService {
    
    @Autowired
    private SearchService searchService;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String CACHE_PREFIX = "search:";
    private static final int CACHE_TTL = 300;  // 5分钟
    
    public SearchResult<Product> search(SearchRequest request) {
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
        redisTemplate.opsForValue().set(
            cacheKey, result, CACHE_TTL, TimeUnit.SECONDS
        );
        
        return result;
    }
}
```

### 查询优化

```java
public SearchResult<Product> optimizedSearch(SearchRequest request) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    
    // 优先使用 filter（可缓存）
    if (request.getCategory() != null) {
        boolQuery.filter(QueryBuilders.termQuery("category", request.getCategory()));
    }
    
    if (request.getBrand() != null) {
        boolQuery.filter(QueryBuilders.termQuery("brand", request.getBrand()));
    }
    
    // 价格范围用 filter
    if (request.getMinPrice() != null) {
        boolQuery.filter(QueryBuilders.rangeQuery("price")
            .gte(request.getMinPrice()));
    }
    
    // 关键词用 must
    if (StringUtils.hasText(request.getKeyword())) {
        boolQuery.must(QueryBuilders.matchQuery("spuName", request.getKeyword()));
    }
    
    // 限制返回字段
    Query query = new NativeSearchQueryBuilder()
        .withQuery(boolQuery)
        .withSourceFilter(new FetchSourceFilter(
            new String[]{"spuId", "spuName", "minPrice", "mainImage"},
            new String[]{}
        ))
        .withPageable(request.getPageable())
        .build();
    
    return search(query);
}
```

## 搜索埋点与数据分析

### 搜索日志记录

```java
@Document(indexName = "search_logs")
public class SearchLog {
    @Id
    private String id;
    
    @Field(type = FieldType.Keyword)
    private String keyword;
    
    @Field(type = FieldType.Keyword)
    private String userId;
    
    @Field(type = FieldType.Integer)
    private Integer resultCount;
    
    @Field(type = FieldType.Date)
    private Date searchTime;
    
    @Field(type = FieldType.Long)
    private Long responseTime;
    
    @Field(type = FieldType.Boolean)
    private Boolean hasClick;
    
    private String clickedSpuId;
}

@Service
public class SearchAnalyticsService {
    
    @Autowired
    private SearchLogRepository logRepository;
    
    public void logSearch(String keyword, String userId, SearchResult result, long responseTime) {
        SearchLog log = new SearchLog();
        log.setKeyword(keyword);
        log.setUserId(userId);
        log.setResultCount(result.getTotal());
        log.setSearchTime(new Date());
        log.setResponseTime(responseTime);
        
        logRepository.save(log);
    }
    
    public void logClick(String logId, String spuId) {
        SearchLog log = logRepository.findById(logId).orElse(null);
        if (log != null) {
            log.setHasClick(true);
            log.setClickedSpuId(spuId);
            logRepository.save(log);
        }
    }
}
```

### 搜索分析报表

```java
public Map<String, Object> getSearchAnalytics(Date startDate, Date endDate) {
    // 搜索量趋势
    Query trendQuery = new NativeSearchQueryBuilder()
        .withQuery(QueryBuilders.rangeQuery("searchTime")
            .gte(startDate)
            .lte(endDate))
        .addAggregation(AggregationBuilders
            .dateHistogram("search_trend")
            .field("searchTime")
            .calendarInterval(DateHistogramInterval.DAY))
        .build();
    
    // 热门关键词
    Query hotKeywordQuery = new NativeSearchQueryBuilder()
        .addAggregation(AggregationBuilders
            .terms("hot_keywords")
            .field("keyword")
            .size(20))
        .build();
    
    // 零结果搜索
    Query zeroResultQuery = new NativeSearchQueryBuilder()
        .withQuery(QueryBuilders.termQuery("resultCount", 0))
        .addAggregation(AggregationBuilders
            .terms("zero_result_keywords")
            .field("keyword")
            .size(20))
        .build();
    
    Map<String, Object> analytics = new HashMap<>();
    analytics.put("trend", executeQuery(trendQuery));
    analytics.put("hotKeywords", executeQuery(hotKeywordQuery));
    analytics.put("zeroResults", executeQuery(zeroResultQuery));
    
    return analytics;
}
```

## 完整项目架构设计

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端层                             │
│  Web 前端  │  移动 App  │  小程序                      │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────┴────────────────────────────────────────────┐
│                    API Gateway                          │
│  路由 │ 鉴权 │ 限流 │ 熔断                             │
└────────────┬────────────────────────────────────────────┘
             │
     ┌───────┴───────┐
     │               │
┌────┴────┐    ┌────┴────────┐
│ 搜索服务 │    │  其他服务   │
│         │    │  商品/订单  │
└────┬────┘    └─────────────┘
     │
     ├──────┬──────┬──────┐
     │      │      │      │
┌────┴─┐ ┌─┴──┐ ┌─┴──┐ ┌─┴────┐
│ ES   │ │Redis│ │MQ  │ │MySQL │
│集群  │ │缓存 │ │同步│ │数据库│
└──────┘ └─────┘ └────┘ └──────┘
```

### 核心代码结构

```
search-service/
├── controller/
│   └── SearchController.java
├── service/
│   ├── SearchService.java
│   ├── SuggestService.java
│   ├── AnalyticsService.java
│   └── CacheService.java
├── repository/
│   ├── ProductRepository.java
│   └── SearchLogRepository.java
├── entity/
│   ├── Product.java
│   ├── ProductSuggest.java
│   └── SearchLog.java
├── dto/
│   ├── SearchRequest.java
│   ├── SearchResult.java
│   └── ProductDTO.java
└── config/
    ├── ElasticsearchConfig.java
    └── RedisConfig.java
```

## 总结

**索引设计**：
- SKU vs SPU 选择
- 嵌套对象设计
- 双索引方案

**多维度搜索**：
- 关键词搜索
- 分类筛选
- 属性筛选
- 价格范围

**搜索推荐**：
- Completion Suggester
- 热门搜索
- 个性化推荐

**相关性调优**：
- 字段权重
- 销量加权
- Function Score
- 个性化排序

**性能优化**：
- 缓存策略
- Filter 优先
- 限制返回字段
- 分页优化

**数据分析**：
- 搜索埋点
- 日志记录
- 分析报表
- 优化建议

**最佳实践**：
- 合理索引设计
- 多层缓存
- 性能监控
- 持续优化

**下一步**：学习日志分析与监控平台实战。

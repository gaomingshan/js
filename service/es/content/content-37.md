# 自定义查询与 NativeSearchQuery

## 概述

虽然方法命名查询简单易用，但对于复杂查询场景，需要使用 @Query 注解或 NativeSearchQuery 来构建自定义查询。本章介绍各种自定义查询方式。

## @Query 注解自定义查询

### 基本用法

```java
public interface ProductRepository 
    extends ElasticsearchRepository<Product, String> {
    
    @Query("{\"match\": {\"name\": \"?0\"}}")
    List<Product> findByNameWithQuery(String name);
    
    @Query("{\"range\": {\"price\": {\"gte\": ?0, \"lte\": ?1}}}")
    List<Product> findByPriceRange(Double min, Double max);
    
    @Query("{\"bool\": {\"must\": [{\"match\": {\"name\": \"?0\"}}], \"filter\": [{\"term\": {\"category\": \"?1\"}}]}}")
    List<Product> findByNameAndCategory(String name, String category);
}
```

**参数占位符**：
- **?0**：第一个参数
- **?1**：第二个参数
- **?n**：第 n 个参数

### Bool 查询

```java
public interface ProductRepository 
    extends ElasticsearchRepository<Product, String> {
    
    @Query("""
        {
          "bool": {
            "must": [
              {"match": {"name": "?0"}}
            ],
            "filter": [
              {"term": {"category": "?1"}},
              {"range": {"price": {"gte": ?2, "lte": ?3}}}
            ]
          }
        }
        """)
    List<Product> complexSearch(
        String keyword, 
        String category, 
        Double minPrice, 
        Double maxPrice
    );
}
```

### 排序和分页

```java
public interface ProductRepository 
    extends ElasticsearchRepository<Product, String> {
    
    @Query("{\"match\": {\"category\": \"?0\"}}")
    Page<Product> searchByCategory(String category, Pageable pageable);
    
    @Query("{\"match_all\": {}}")
    List<Product> findAllSorted(Sort sort);
}

// 使用
Pageable pageable = PageRequest.of(0, 10, Sort.by("price").descending());
Page<Product> result = repository.searchByCategory("electronics", pageable);
```

## NativeSearchQuery 构建器

### 基本查询

```java
@Service
public class ProductSearchService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    // Match 查询
    public List<Product> searchByName(String name) {
        Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.matchQuery("name", name))
            .build();
        
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }
    
    // Term 查询
    public List<Product> searchByCategory(String category) {
        Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.termQuery("category", category))
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

### Bool 查询

```java
@Service
public class ProductSearchService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    public List<Product> complexSearch(ProductSearchDTO dto) {
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        
        // must 条件
        if (dto.getKeyword() != null) {
            boolQuery.must(
                QueryBuilders.multiMatchQuery(
                    dto.getKeyword(), 
                    "name", "description"
                )
            );
        }
        
        // filter 条件
        if (dto.getCategory() != null) {
            boolQuery.filter(
                QueryBuilders.termQuery("category", dto.getCategory())
            );
        }
        
        if (dto.getMinPrice() != null || dto.getMaxPrice() != null) {
            RangeQueryBuilder rangeQuery = QueryBuilders.rangeQuery("price");
            if (dto.getMinPrice() != null) {
                rangeQuery.gte(dto.getMinPrice());
            }
            if (dto.getMaxPrice() != null) {
                rangeQuery.lte(dto.getMaxPrice());
            }
            boolQuery.filter(rangeQuery);
        }
        
        // should 条件
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            dto.getTags().forEach(tag ->
                boolQuery.should(QueryBuilders.termQuery("tags", tag))
            );
            boolQuery.minimumShouldMatch(1);
        }
        
        // 构建查询
        Query query = new NativeSearchQueryBuilder()
            .withQuery(boolQuery)
            .withPageable(PageRequest.of(0, 20))
            .withSort(SortBuilders.fieldSort("price").order(SortOrder.DESC))
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

## QueryBuilders 使用详解

### Match 查询

```java
// 基本 match
QueryBuilders.matchQuery("name", "iPhone")

// 多字段 match
QueryBuilders.multiMatchQuery("iPhone", "name", "description")
    .field("name", 3.0f)  // name 字段权重为 3
    .field("description", 1.0f)

// match_phrase
QueryBuilders.matchPhraseQuery("name", "iPhone 14 Pro")

// match_phrase_prefix
QueryBuilders.matchPhrasePrefixQuery("name", "iPhone 14")
```

### Term 查询

```java
// term 精确匹配
QueryBuilders.termQuery("category", "electronics")

// terms 多值匹配
QueryBuilders.termsQuery("category", "electronics", "phones", "computers")

// range 范围查询
QueryBuilders.rangeQuery("price")
    .gte(5000)
    .lte(10000)

// exists 字段存在
QueryBuilders.existsQuery("discount")

// prefix 前缀查询
QueryBuilders.prefixQuery("name", "iPhone")

// wildcard 通配符查询
QueryBuilders.wildcardQuery("name", "*Phone*")

// fuzzy 模糊查询
QueryBuilders.fuzzyQuery("name", "iPone")
    .fuzziness(Fuzziness.AUTO)
```

### Bool 查询

```java
BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();

// must：必须匹配
boolQuery.must(QueryBuilders.matchQuery("name", "iPhone"));

// filter：过滤条件（不计算分数）
boolQuery.filter(QueryBuilders.termQuery("category", "electronics"));
boolQuery.filter(QueryBuilders.rangeQuery("price").gte(5000));

// should：或条件
boolQuery.should(QueryBuilders.termQuery("tags", "hot"));
boolQuery.should(QueryBuilders.termQuery("tags", "new"));
boolQuery.minimumShouldMatch(1);  // 至少匹配 1 个

// must_not：必须不匹配
boolQuery.mustNot(QueryBuilders.termQuery("status", "deleted"));
```

### 排序

```java
Query query = new NativeSearchQueryBuilder()
    .withQuery(queryBuilder)
    // 单字段排序
    .withSort(SortBuilders.fieldSort("price").order(SortOrder.DESC))
    // 多字段排序
    .withSort(SortBuilders.fieldSort("price").order(SortOrder.DESC))
    .withSort(SortBuilders.fieldSort("createdAt").order(SortOrder.DESC))
    // 评分排序
    .withSort(SortBuilders.scoreSort().order(SortOrder.DESC))
    .build();
```

### 分页

```java
Query query = new NativeSearchQueryBuilder()
    .withQuery(queryBuilder)
    .withPageable(PageRequest.of(0, 10))  // 第 0 页，每页 10 条
    .build();

SearchHits<Product> hits = template.search(
    query, Product.class, IndexCoordinates.of("products")
);

// 获取总数
long total = hits.getTotalHits();

// 获取结果
List<Product> products = hits.stream()
    .map(SearchHit::getContent)
    .collect(Collectors.toList());
```

## 聚合查询封装

### 统计聚合

```java
@Service
public class ProductAggregationService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    // 按分类统计
    public Map<String, Long> countByCategory() {
        Query query = new NativeSearchQueryBuilder()
            .addAggregation(
                AggregationBuilders
                    .terms("category_count")
                    .field("category")
                    .size(10)
            )
            .build();
        
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        Aggregations aggregations = hits.getAggregations();
        Terms categoryAgg = aggregations.get("category_count");
        
        return categoryAgg.getBuckets().stream()
            .collect(Collectors.toMap(
                Terms.Bucket::getKeyAsString,
                Terms.Bucket::getDocCount
            ));
    }
    
    // 价格统计
    public PriceStats getPriceStats() {
        Query query = new NativeSearchQueryBuilder()
            .addAggregation(
                AggregationBuilders
                    .stats("price_stats")
                    .field("price")
            )
            .build();
        
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        Stats stats = hits.getAggregations().get("price_stats");
        
        return PriceStats.builder()
            .min(stats.getMin())
            .max(stats.getMax())
            .avg(stats.getAvg())
            .sum(stats.getSum())
            .count(stats.getCount())
            .build();
    }
    
    // 价格区间统计
    public Map<String, Long> priceRangeAgg() {
        Query query = new NativeSearchQueryBuilder()
            .addAggregation(
                AggregationBuilders
                    .range("price_ranges")
                    .field("price")
                    .addRange(0, 1000)
                    .addRange(1000, 5000)
                    .addRange(5000, 10000)
                    .addUnboundedFrom(10000)
            )
            .build();
        
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        Range rangeAgg = hits.getAggregations().get("price_ranges");
        
        return rangeAgg.getBuckets().stream()
            .collect(Collectors.toMap(
                Range.Bucket::getKeyAsString,
                Range.Bucket::getDocCount
            ));
    }
}
```

### 嵌套聚合

```java
@Service
public class ProductAggregationService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    // 分类下的平均价格
    public Map<String, Double> avgPriceByCategory() {
        Query query = new NativeSearchQueryBuilder()
            .addAggregation(
                AggregationBuilders
                    .terms("categories")
                    .field("category")
                    .size(10)
                    .subAggregation(
                        AggregationBuilders
                            .avg("avg_price")
                            .field("price")
                    )
            )
            .build();
        
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        Terms categoryAgg = hits.getAggregations().get("categories");
        
        return categoryAgg.getBuckets().stream()
            .collect(Collectors.toMap(
                Terms.Bucket::getKeyAsString,
                bucket -> {
                    Avg avgAgg = bucket.getAggregations().get("avg_price");
                    return avgAgg.getValue();
                }
            ));
    }
}
```

## 高亮查询实现

### 基本高亮

```java
@Service
public class ProductSearchService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    public List<ProductHighlightDTO> searchWithHighlight(String keyword) {
        // 构建查询
        Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.multiMatchQuery(keyword, "name", "description"))
            // 配置高亮
            .withHighlightFields(
                new HighlightBuilder.Field("name"),
                new HighlightBuilder.Field("description")
            )
            .withHighlightBuilder(new HighlightBuilder()
                .preTags("<em class='highlight'>")
                .postTags("</em>")
                .fragmentSize(150)
                .numOfFragments(3)
            )
            .build();
        
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        return hits.stream()
            .map(hit -> {
                Product product = hit.getContent();
                Map<String, List<String>> highlights = hit.getHighlightFields();
                
                ProductHighlightDTO dto = new ProductHighlightDTO();
                dto.setProduct(product);
                
                if (highlights.containsKey("name")) {
                    dto.setHighlightedName(highlights.get("name").get(0));
                } else {
                    dto.setHighlightedName(product.getName());
                }
                
                if (highlights.containsKey("description")) {
                    dto.setHighlightedDescription(
                        String.join("...", highlights.get("description"))
                    );
                }
                
                return dto;
            })
            .collect(Collectors.toList());
    }
}
```

### 自定义高亮样式

```java
Query query = new NativeSearchQueryBuilder()
    .withQuery(QueryBuilders.matchQuery("name", keyword))
    .withHighlightBuilder(new HighlightBuilder()
        .field(new HighlightBuilder.Field("name")
            .preTags("<span style='color:red;font-weight:bold'>")
            .postTags("</span>")
            .fragmentSize(0)  // 返回整个字段
        )
        .field(new HighlightBuilder.Field("description")
            .preTags("<mark>")
            .postTags("</mark>")
            .fragmentSize(200)
            .numOfFragments(2)
            .noMatchSize(100)  // 无匹配时返回前 100 个字符
        )
    )
    .build();
```

## 地理位置查询

### 地理距离查询

```java
@Data
@Document(indexName = "stores")
public class Store {
    
    @Id
    private String id;
    
    private String name;
    
    @GeoPointField
    private GeoPoint location;
}

@Service
public class StoreSearchService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    // 附近的店铺
    public List<Store> findNearbyStores(double lat, double lon, String distance) {
        Query query = new NativeSearchQueryBuilder()
            .withQuery(
                QueryBuilders.geoDistanceQuery("location")
                    .point(lat, lon)
                    .distance(distance)  // "5km", "1000m"
            )
            .withSort(
                SortBuilders.geoDistanceSort("location", lat, lon)
                    .order(SortOrder.ASC)
            )
            .build();
        
        SearchHits<Store> hits = template.search(
            query, Store.class, IndexCoordinates.of("stores")
        );
        
        return hits.stream()
            .map(hit -> {
                Store store = hit.getContent();
                // 获取距离
                Object[] sortValues = hit.getSortValues();
                if (sortValues.length > 0) {
                    double distanceInMeters = (double) sortValues[0];
                    store.setDistance(distanceInMeters);
                }
                return store;
            })
            .collect(Collectors.toList());
    }
    
    // 范围内查询
    public List<Store> findInBoundingBox(
            double topLat, double topLon,
            double bottomLat, double bottomLon) {
        
        Query query = new NativeSearchQueryBuilder()
            .withQuery(
                QueryBuilders.geoBoundingBoxQuery("location")
                    .setCorners(topLat, topLon, bottomLat, bottomLon)
            )
            .build();
        
        SearchHits<Store> hits = template.search(
            query, Store.class, IndexCoordinates.of("stores")
        );
        
        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }
}
```

## 复杂查询场景实战

### 场景1：电商商品搜索

```java
@Service
public class ProductSearchService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    public SearchResult<Product> search(ProductSearchRequest request) {
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        
        // 关键词搜索
        if (StringUtils.hasText(request.getKeyword())) {
            boolQuery.must(
                QueryBuilders.multiMatchQuery(request.getKeyword(), "name^3", "description")
                    .type(MultiMatchQueryBuilder.Type.BEST_FIELDS)
                    .fuzziness(Fuzziness.AUTO)
            );
        }
        
        // 分类筛选
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            boolQuery.filter(
                QueryBuilders.termsQuery("category", request.getCategories())
            );
        }
        
        // 价格范围
        if (request.getMinPrice() != null || request.getMaxPrice() != null) {
            RangeQueryBuilder rangeQuery = QueryBuilders.rangeQuery("price");
            if (request.getMinPrice() != null) {
                rangeQuery.gte(request.getMinPrice());
            }
            if (request.getMaxPrice() != null) {
                rangeQuery.lte(request.getMaxPrice());
            }
            boolQuery.filter(rangeQuery);
        }
        
        // 有货筛选
        if (Boolean.TRUE.equals(request.getInStock())) {
            boolQuery.filter(QueryBuilders.rangeQuery("stock").gt(0));
        }
        
        // 评分提升
        if (request.getTags() != null) {
            request.getTags().forEach(tag ->
                boolQuery.should(
                    QueryBuilders.termQuery("tags", tag).boost(2.0f)
                )
            );
        }
        
        // 排序
        List<SortBuilder<?>> sorts = new ArrayList<>();
        if ("price_asc".equals(request.getSort())) {
            sorts.add(SortBuilders.fieldSort("price").order(SortOrder.ASC));
        } else if ("price_desc".equals(request.getSort())) {
            sorts.add(SortBuilders.fieldSort("price").order(SortOrder.DESC));
        } else if ("sales".equals(request.getSort())) {
            sorts.add(SortBuilders.fieldSort("salesCount").order(SortOrder.DESC));
        } else {
            sorts.add(SortBuilders.scoreSort().order(SortOrder.DESC));
        }
        
        // 构建查询
        NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder()
            .withQuery(boolQuery)
            .withPageable(PageRequest.of(request.getPage(), request.getSize()));
        
        sorts.forEach(queryBuilder::withSort);
        
        // 高亮
        if (StringUtils.hasText(request.getKeyword())) {
            queryBuilder.withHighlightFields(
                new HighlightBuilder.Field("name"),
                new HighlightBuilder.Field("description")
            );
        }
        
        // 聚合
        queryBuilder.addAggregation(
            AggregationBuilders.terms("categories").field("category").size(10)
        );
        queryBuilder.addAggregation(
            AggregationBuilders.range("price_ranges")
                .field("price")
                .addRange(0, 100)
                .addRange(100, 500)
                .addRange(500, 1000)
                .addUnboundedFrom(1000)
        );
        
        Query query = queryBuilder.build();
        
        // 执行查询
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of("products")
        );
        
        // 构建结果
        SearchResult<Product> result = new SearchResult<>();
        result.setTotal(hits.getTotalHits());
        result.setItems(hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList()));
        
        // 聚合结果
        if (hits.hasAggregations()) {
            Terms categoryAgg = hits.getAggregations().get("categories");
            result.setCategoryFacets(categoryAgg.getBuckets().stream()
                .collect(Collectors.toMap(
                    Terms.Bucket::getKeyAsString,
                    Terms.Bucket::getDocCount
                )));
        }
        
        return result;
    }
}
```

### 场景2：日志检索

```java
@Service
public class LogSearchService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    public List<LogEntry> searchLogs(LogSearchRequest request) {
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        
        // 时间范围
        if (request.getStartTime() != null || request.getEndTime() != null) {
            RangeQueryBuilder timeRange = QueryBuilders.rangeQuery("timestamp");
            if (request.getStartTime() != null) {
                timeRange.gte(request.getStartTime());
            }
            if (request.getEndTime() != null) {
                timeRange.lte(request.getEndTime());
            }
            boolQuery.filter(timeRange);
        }
        
        // 日志级别
        if (request.getLevels() != null && !request.getLevels().isEmpty()) {
            boolQuery.filter(
                QueryBuilders.termsQuery("level", request.getLevels())
            );
        }
        
        // 关键词
        if (StringUtils.hasText(request.getKeyword())) {
            boolQuery.must(
                QueryBuilders.matchQuery("message", request.getKeyword())
            );
        }
        
        // 服务名
        if (StringUtils.hasText(request.getServiceName())) {
            boolQuery.filter(
                QueryBuilders.termQuery("serviceName", request.getServiceName())
            );
        }
        
        Query query = new NativeSearchQueryBuilder()
            .withQuery(boolQuery)
            .withSort(SortBuilders.fieldSort("timestamp").order(SortOrder.DESC))
            .withPageable(PageRequest.of(0, request.getLimit()))
            .build();
        
        SearchHits<LogEntry> hits = template.search(
            query, LogEntry.class, IndexCoordinates.of("logs-*")
        );
        
        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }
}
```

## 总结

**@Query 注解**：
- 简单自定义查询
- JSON 格式查询
- 参数占位符

**NativeSearchQuery**：
- 完整查询构建
- 支持所有查询类型
- 类型安全

**QueryBuilders**：
- Match/Term 查询
- Bool 查询
- Range 查询
- 排序和分页

**聚合查询**：
- 统计聚合
- 嵌套聚合
- 结果解析

**高亮查询**：
- 配置高亮字段
- 自定义样式
- 结果处理

**地理位置查询**：
- 距离查询
- 范围查询
- 排序

**复杂场景**：
- 电商搜索
- 日志检索
- 多条件组合

**最佳实践**：
- 合理使用 filter
- 评分优化
- 分页限制
- 结果封装

**下一步**：学习高级特性与最佳实践。

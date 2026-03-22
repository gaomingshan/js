# 聚合查询封装与事务支持

## 概述

本章讲解 Spring Data MongoDB 中聚合管道的封装方式，以及 `@Transactional` 与 MongoDB 多文档事务的适配，包括事务限制与企业实战案例。

---

## Aggregation 构建器 API

### 基础聚合

```java
@Service
public class OrderReportService {

    @Autowired
    private MongoTemplate mongoTemplate;

    // 按用户统计订单金额
    public List<UserOrderStats> getUserOrderStats(LocalDateTime from) {
        Aggregation aggregation = Aggregation.newAggregation(
            // $match
            Aggregation.match(
                Criteria.where("status").is("paid")
                        .and("createdAt").gte(from)
            ),
            // $group
            Aggregation.group("userId")
                .count().as("orderCount")
                .sum("amount").as("totalAmount")
                .avg("amount").as("avgAmount")
                .max("amount").as("maxAmount")
                .first("createdAt").as("firstOrderAt"),
            // $sort
            Aggregation.sort(Sort.Direction.DESC, "totalAmount"),
            // $limit
            Aggregation.limit(100),
            // $project
            Aggregation.project()
                .andExpression("_id").as("userId")
                .and("orderCount").as("orderCount")
                .and("totalAmount").as("totalAmount")
                .and("avgAmount").as("avgAmount")
                .andExclude("_id")
        );

        AggregationResults<UserOrderStats> results =
            mongoTemplate.aggregate(aggregation, "orders", UserOrderStats.class);

        return results.getMappedResults();
    }
}

// 结果 DTO
@Data
public class UserOrderStats {
    private String userId;
    private long orderCount;
    private BigDecimal totalAmount;
    private BigDecimal avgAmount;
    private BigDecimal maxAmount;
}
```

### $lookup 关联聚合

```java
public List<OrderWithUser> getOrdersWithUser(String status) {
    Aggregation agg = Aggregation.newAggregation(
        Aggregation.match(Criteria.where("status").is(status)),
        Aggregation.lookup("users", "userId", "_id", "userInfo"),
        Aggregation.unwind("userInfo"),  // 展开数组（1对1时使用）
        Aggregation.project()
            .and("orderId").as("orderId")
            .and("amount").as("amount")
            .and("userInfo.name").as("userName")
            .and("userInfo.email").as("userEmail"),
        Aggregation.limit(20)
    );

    return mongoTemplate.aggregate(agg, "orders", OrderWithUser.class)
                        .getMappedResults();
}
```

### 自定义聚合阶段

```java
// 对于 Spring Data MongoDB 不直接支持的阶段，使用 CustomProjectionOperation
public List<Document> runNativePipeline() {
    // 方式1：Document 直接构造
    Document facetStage = new Document("$facet", new Document()
        .append("byCategory", Arrays.asList(
            new Document("$group", new Document("_id", "$category")
                .append("count", new Document("$sum", 1)))
        ))
        .append("total", Arrays.asList(
            new Document("$count", "count")
        ))
    );

    // 方式2：使用 AggregationOperation 接口
    AggregationOperation facetOp = context -> Document.parse(
        "{ $facet: { byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }] } }"
    );

    Aggregation agg = Aggregation.newAggregation(
        Aggregation.match(Criteria.where("status").is("active")),
        facetOp
    );

    return mongoTemplate.aggregate(agg, "products", Document.class)
                        .getMappedResults();
}
```

---

## 聚合选项配置

```java
// 配置聚合选项
AggregationOptions options = AggregationOptions.builder()
    .allowDiskUse(true)      // 允许磁盘溢出（大数据量）
    .maxTime(Duration.ofSeconds(30))  // 超时
    .comment("order-report-agg")      // 注释（便于 Profiler 识别）
    .build();

Aggregation agg = Aggregation.newAggregation(stages).withOptions(options);
```

---

## @Transactional 与 MongoDB 事务

### 配置事务支持

```java
@Configuration
public class MongoTransactionConfig {

    // 必须配置 MongoTransactionManager 才能使 @Transactional 生效
    @Bean
    public MongoTransactionManager transactionManager(
            MongoDatabaseFactory dbFactory) {
        return new MongoTransactionManager(dbFactory);
    }
}
```

### 使用 @Transactional

```java
@Service
public class OrderService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional  // 自动开启事务，异常时回滚
    public Order createOrder(CreateOrderRequest req) {
        // 1. 创建订单
        Order order = Order.builder()
            .orderId(generateOrderId())
            .userId(req.getUserId())
            .items(req.getItems())
            .totalAmount(req.getAmount())
            .status(OrderStatus.PENDING)
            .createdAt(LocalDateTime.now())
            .build();
        order = orderRepository.save(order);

        // 2. 扣减库存（同一事务）
        for (OrderItem item : req.getItems()) {
            UpdateResult result = mongoTemplate.updateFirst(
                new Query(
                    Criteria.where("sku").is(item.getSku())
                           .and("qty").gte(item.getQty())
                ),
                new Update().inc("qty", -item.getQty()),
                Inventory.class
            );

            if (result.getModifiedCount() == 0) {
                // 抛出异常 → 事务自动回滚
                throw new InsufficientStockException(item.getSku() + " 库存不足");
            }
        }

        return order;
    }
}
```

### 事务限制

```
⚠️  事务要求：
  - MongoDB 必须是副本集或分片集群（单机 mongod 不支持）
  - Spring Boot 需要配置 MongoTransactionManager
  - Driver 版本 >= 3.8，MongoDB Server >= 4.0

⚠️  事务限制：
  - 事务内不能创建/删除集合或索引
  - 事务内写入的文档大小总和不超过 16MB
  - 默认超时 60 秒（可配置）
  - 分片集群事务（4.2+）跨 Shard 性能开销更大

✅  最佳实践：
  - 优先使用单文档原子操作（$inc、$set 等）替代事务
  - 事务内操作尽量少，减少持锁时间
  - 设置合理的 maxCommitTimeMS
```

---

## 企业案例：订单统计报表聚合

```java
@Service
public class SalesReportService {

    @Autowired
    private MongoTemplate mongoTemplate;

    // 最近 30 天各省销售额 TOP 10
    public List<ProvinceSales> getProvinceSalesRanking() {
        LocalDateTime from = LocalDateTime.now().minusDays(30);

        Aggregation agg = Aggregation.newAggregation(
            Aggregation.match(
                Criteria.where("status").is("paid")
                        .and("createdAt").gte(from)
            ),
            Aggregation.group("shippingAddress.province")
                .sum("totalAmount").as("sales")
                .count().as("orderCount")
                .avg("totalAmount").as("avgOrder"),
            Aggregation.sort(Sort.Direction.DESC, "sales"),
            Aggregation.limit(10),
            Aggregation.project()
                .andExpression("_id").as("province")
                .and("sales").as("sales")
                .and("orderCount").as("orderCount")
                .andExclude("_id")
        ).withOptions(AggregationOptions.builder().allowDiskUse(true).build());

        return mongoTemplate.aggregate(agg, "orders", ProvinceSales.class)
                            .getMappedResults();
    }
}

@Data
public class ProvinceSales {
    private String province;
    private BigDecimal sales;
    private long orderCount;
    private BigDecimal avgOrder;
}
```

---

## 总结

- Spring Data MongoDB 的 `Aggregation` 构建器覆盖大多数常用阶段
- 复杂阶段（$facet、自定义表达式）使用 `AggregationOperation` 接口传入原生 Document
- `@Transactional` 需要配置 `MongoTransactionManager` 才能生效
- 事务仅支持副本集/分片集群，单机 mongod 不支持
- 优先使用单文档原子操作，减少对事务的依赖

**下一步**：微服务中 MongoDB 的边界与职责。

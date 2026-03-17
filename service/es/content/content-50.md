# 多租户隔离方案

## 概述

多租户架构是 SaaS 应用的核心需求。本章介绍如何在 Elasticsearch 中实现租户隔离，包括数据隔离、性能隔离和安全隔离。

## 索引隔离 vs 集群隔离

### 方案对比

**索引隔离**：

```
优点：
  - 成本低（共享集群）
  - 管理简单
  - 资源利用率高

缺点：
  - 性能相互影响
  - 难以保证 SLA
  - 安全风险较高

适用场景：
  - 中小租户
  - 性能要求不高
  - 成本敏感
```

**集群隔离**：

```
优点：
  - 完全隔离
  - 性能独立
  - 安全性高

缺点：
  - 成本高
  - 管理复杂
  - 资源利用率低

适用场景：
  - 大租户
  - 严格 SLA
  - 高安全要求
```

### 混合方案

```
租户分级：

VIP 租户：
  - 独立集群
  - 专属资源
  - 高优先级支持

普通租户：
  - 共享集群
  - 索引隔离
  - 标准支持

免费租户：
  - 共享集群
  - 资源限制
  - 社区支持
```

## 索引隔离方案

### 租户索引设计

**方案一：前缀隔离**：

```
索引命名：tenant_{tenant_id}_{index_name}

示例：
  - tenant_001_products
  - tenant_001_orders
  - tenant_002_products
  - tenant_002_orders
```

**方案二：别名隔离**：

```bash
# 创建租户索引
PUT /products_tenant_001
PUT /products_tenant_002

# 创建租户别名
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "products_tenant_001",
        "alias": "tenant_001_products"
      }
    },
    {
      "add": {
        "index": "products_tenant_002",
        "alias": "tenant_002_products"
      }
    }
  ]
}
```

### 应用层路由

```java
@Service
public class TenantAwareSearchService {
    
    @Autowired
    private ElasticsearchRestTemplate template;
    
    public List<Product> search(String tenantId, String keyword) {
        // 构建租户索引名
        String indexName = "tenant_" + tenantId + "_products";
        
        Query query = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.matchQuery("name", keyword))
            .build();
        
        SearchHits<Product> hits = template.search(
            query, Product.class, IndexCoordinates.of(indexName)
        );
        
        return hits.stream()
            .map(SearchHit::getContent)
            .collect(Collectors.toList());
    }
}
```

### 租户拦截器

```java
@Component
public class TenantInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) {
        String tenantId = extractTenantId(request);
        TenantContext.setCurrentTenant(tenantId);
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request,
                               HttpServletResponse response,
                               Object handler,
                               Exception ex) {
        TenantContext.clear();
    }
    
    private String extractTenantId(HttpServletRequest request) {
        // 从 Header 获取
        String tenantId = request.getHeader("X-Tenant-ID");
        
        // 或从 JWT 获取
        if (tenantId == null) {
            String token = request.getHeader("Authorization");
            tenantId = extractFromJWT(token);
        }
        
        return tenantId;
    }
}
```

## 租户路由策略

### 路由字段设计

```java
@Document(indexName = "products_shared")
public class Product {
    @Id
    private String id;
    
    @Field(type = FieldType.Keyword)
    private String tenantId;  // 租户 ID
    
    private String name;
    private Double price;
}
```

### 基于路由的查询

```java
public List<Product> searchByTenant(String tenantId, String keyword) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    
    // 租户过滤
    boolQuery.filter(QueryBuilders.termQuery("tenantId", tenantId));
    
    // 关键词查询
    if (StringUtils.hasText(keyword)) {
        boolQuery.must(QueryBuilders.matchQuery("name", keyword));
    }
    
    Query query = new NativeSearchQueryBuilder()
        .withQuery(boolQuery)
        .withRoute(tenantId)  // 使用租户 ID 路由
        .build();
    
    SearchHits<Product> hits = template.search(
        query, Product.class, IndexCoordinates.of("products_shared")
    );
    
    return hits.stream()
        .map(SearchHit::getContent)
        .collect(Collectors.toList());
}
```

### 自定义路由

```bash
# 索引时指定路由
PUT /products_shared/_doc/1?routing=tenant_001
{
  "tenantId": "tenant_001",
  "name": "iPhone 14",
  "price": 5999
}

# 查询时使用相同路由
GET /products_shared/_search?routing=tenant_001
{
  "query": {
    "term": {
      "tenantId": "tenant_001"
    }
  }
}
```

## 资源配额控制

### 索引级配额

```bash
# 限制索引大小
PUT /tenant_001_products/_settings
{
  "index": {
    "max_primary_shard_size": "10GB",
    "max_docs": 10000000
  }
}

# 触发告警
PUT _watcher/watch/tenant_quota_alert
{
  "trigger": {
    "schedule": {
      "interval": "1h"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["tenant_*"],
        "body": {
          "size": 0,
          "aggs": {
            "tenant_size": {
              "terms": {
                "field": "_index"
              },
              "aggs": {
                "total_size": {
                  "sum": {
                    "field": "_size"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "script": {
      "source": "return ctx.payload.aggregations.tenant_size.buckets.stream().anyMatch(b -> b.total_size.value > 10737418240)"
    }
  },
  "actions": {
    "send_email": {
      "email": {
        "to": "admin@example.com",
        "subject": "Tenant Quota Exceeded"
      }
    }
  }
}
```

### 应用层限流

```java
@Component
public class TenantRateLimiter {
    
    private final Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();
    
    public boolean tryAcquire(String tenantId) {
        RateLimiter limiter = limiters.computeIfAbsent(tenantId, k -> {
            TenantConfig config = getTenantConfig(tenantId);
            return RateLimiter.create(config.getQpsLimit());
        });
        
        return limiter.tryAcquire();
    }
    
    private TenantConfig getTenantConfig(String tenantId) {
        // 从配置中心获取租户配额
        return configService.getTenantConfig(tenantId);
    }
}

@RestController
public class ProductController {
    
    @Autowired
    private TenantRateLimiter rateLimiter;
    
    @GetMapping("/products/search")
    public ResponseEntity<?> search(@RequestParam String keyword) {
        String tenantId = TenantContext.getCurrentTenant();
        
        if (!rateLimiter.tryAcquire(tenantId)) {
            return ResponseEntity.status(429)
                .body("Rate limit exceeded");
        }
        
        // 执行搜索
        return ResponseEntity.ok(searchService.search(keyword));
    }
}
```

## 性能隔离保证

### 查询优先级

```bash
# 设置搜索线程池
PUT /_cluster/settings
{
  "persistent": {
    "thread_pool.search.queue_size": 1000
  }
}

# 应用层优先级队列
@Service
public class PrioritySearchService {
    
    private final PriorityBlockingQueue<SearchTask> taskQueue;
    
    public CompletableFuture<SearchResult> search(String tenantId, SearchRequest request) {
        TenantTier tier = getTenantTier(tenantId);
        int priority = tier.getPriority();
        
        SearchTask task = new SearchTask(tenantId, request, priority);
        taskQueue.offer(task);
        
        return task.getFuture();
    }
}
```

### 资源预留

```yaml
# 为 VIP 租户预留节点
node.attr.tenant_tier: vip

# 索引配置
PUT /tenant_vip_001_products/_settings
{
  "index.routing.allocation.require.tenant_tier": "vip"
}
```

## 数据安全隔离

### 基于角色的访问控制

```bash
# 创建租户角色
POST /_security/role/tenant_001_role
{
  "indices": [
    {
      "names": ["tenant_001_*"],
      "privileges": ["read", "write", "create_index", "delete_index"]
    }
  ]
}

# 创建租户用户
POST /_security/user/tenant_001_user
{
  "password": "password",
  "roles": ["tenant_001_role"]
}
```

### 文档级安全

```bash
# 使用 DLS 限制访问
POST /_security/role/tenant_user
{
  "indices": [
    {
      "names": ["products_shared"],
      "privileges": ["read"],
      "query": {
        "term": {
          "tenantId": "{{_user.metadata.tenant_id}}"
        }
      }
    }
  ]
}
```

### 数据加密

```java
@Service
public class EncryptionService {
    
    private final Map<String, SecretKey> tenantKeys = new ConcurrentHashMap<>();
    
    public String encrypt(String tenantId, String data) {
        SecretKey key = getTenantKey(tenantId);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] encrypted = cipher.doFinal(data.getBytes());
        return Base64.getEncoder().encodeToString(encrypted);
    }
    
    public String decrypt(String tenantId, String encryptedData) {
        SecretKey key = getTenantKey(tenantId);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key);
        byte[] decrypted = cipher.doFinal(
            Base64.getDecoder().decode(encryptedData)
        );
        return new String(decrypted);
    }
}
```

## 监控与计费

### 租户监控

```java
@Service
public class TenantMetricsService {
    
    @Autowired
    private MeterRegistry registry;
    
    public void recordSearch(String tenantId, long latency) {
        Timer.builder("tenant.search.latency")
            .tag("tenant_id", tenantId)
            .register(registry)
            .record(latency, TimeUnit.MILLISECONDS);
    }
    
    public void recordDocumentCount(String tenantId, long count) {
        Gauge.builder("tenant.documents.count", () -> count)
            .tag("tenant_id", tenantId)
            .register(registry);
    }
}
```

### 计费统计

```java
@Service
public class BillingService {
    
    public TenantBilling calculateBilling(String tenantId, LocalDate month) {
        // 查询租户使用量
        SearchRequest request = new SearchRequest("tenant_" + tenantId + "_*");
        SearchSourceBuilder builder = new SearchSourceBuilder();
        builder.aggregation(
            AggregationBuilders.sum("total_docs").field("_doc_count")
        );
        builder.aggregation(
            AggregationBuilders.sum("total_storage").field("_size")
        );
        
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);
        
        long totalDocs = (long) response.getAggregations()
            .get("total_docs").getProperty("value");
        long totalStorage = (long) response.getAggregations()
            .get("total_storage").getProperty("value");
        
        // 计算费用
        double storageFee = totalStorage / (1024.0 * 1024 * 1024) * STORAGE_PRICE_PER_GB;
        double queryFee = getQueryCount(tenantId, month) * QUERY_PRICE;
        
        return TenantBilling.builder()
            .tenantId(tenantId)
            .month(month)
            .totalDocs(totalDocs)
            .totalStorage(totalStorage)
            .storageFee(storageFee)
            .queryFee(queryFee)
            .totalFee(storageFee + queryFee)
            .build();
    }
}
```

## 多租户架构最佳实践

### 租户分级

```
分级标准：
  - 企业版：独立集群
  - 专业版：索引隔离 + 资源预留
  - 基础版：索引隔离
  - 免费版：共享索引 + 严格限流
```

### 扩展策略

```
纵向扩展：
  - 升级硬件
  - 增加节点

横向扩展：
  - 增加集群
  - 租户迁移

混合扩展：
  - 大租户独立集群
  - 小租户共享集群
```

### 监控告警

```
关键指标：
  - 租户 QPS
  - 租户存储量
  - 租户查询延迟
  - 配额使用率

告警规则：
  - 配额超限：邮件通知
  - 性能异常：Slack 告警
  - 安全事件：紧急通知
```

## 总结

**隔离方案**：
- 索引隔离：成本低
- 集群隔离：性能好
- 混合方案：平衡

**租户路由**：
- 应用层路由
- 自定义路由
- 路由优化

**资源配额**：
- 索引级限制
- 应用层限流
- 监控告警

**性能隔离**：
- 查询优先级
- 资源预留
- 分级服务

**数据安全**：
- RBAC 权限
- 文档级隔离
- 数据加密

**监控计费**：
- 使用量统计
- 费用计算
- 账单生成

**最佳实践**：
- 租户分级
- 合理扩展
- 完善监控

至此，第十一部分"企业级最佳实践"（第43-50章）已全部完成。继续生成第十二部分（第51-60章）。

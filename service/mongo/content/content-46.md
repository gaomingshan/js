# 多租户隔离方案

## 概述

多租户（Multi-Tenancy）是 SaaS 系统的核心架构需求。MongoDB 提供三种隔离级别，在数据安全、成本效率和运维复杂度之间权衡。

---

## 三种隔离模式

### 模式对比

| 维度 | 独立实例 | 独立数据库 | 共享集合（字段隔离）|
|------|----------|------------|--------------------|
| 数据隔离性 | 最强 | 强 | 弱（依赖应用保证）|
| 成本 | 最高 | 中 | 最低 |
| 扩展性 | 最好 | 好 | 受限 |
| 运维复杂度 | 高 | 中 | 低 |
| 适用客户规模 | 大型企业客户 | 中型客户 | 小型/免费客户 |

---

## 模式1：独立实例（Database-per-Instance）

每个租户拥有独立的 MongoDB 副本集。

```yaml
# 大租户：独立 MongoDB 副本集
tenant-A-mongo:
  replicaSet: tenant-a-rs
  host: tenant-a-mongo1:27017,tenant-a-mongo2:27017
  database: tenant_a

tenant-B-mongo:
  replicaSet: tenant-b-rs
  host: tenant-b-mongo1:27017,tenant-b-mongo2:27017
  database: tenant_b
```

```java
// 动态数据源路由
@Component
public class TenantMongoRouter {

    private final Map<String, MongoTemplate> tenantTemplates = new ConcurrentHashMap<>();

    @Autowired
    private TenantMongoConfigRepository configRepo;

    public MongoTemplate getTemplate(String tenantId) {
        return tenantTemplates.computeIfAbsent(tenantId, id -> {
            TenantMongoConfig config = configRepo.findByTenantId(id);
            MongoClient client = MongoClients.create(
                MongoClientSettings.builder()
                    .applyConnectionString(new ConnectionString(config.getUri()))
                    .build()
            );
            return new MongoTemplate(client, config.getDatabase());
        });
    }
}

// 使用
@Service
public class OrderService {
    @Autowired
    private TenantMongoRouter router;

    public Order createOrder(String tenantId, CreateOrderRequest req) {
        MongoTemplate template = router.getTemplate(tenantId);
        Order order = buildOrder(req);
        return template.save(order, "orders");
    }
}
```

---

## 模式2：独立数据库（Database-per-Tenant）

共享 MongoDB 实例，每个租户使用独立的 Database。

```java
@Component
public class TenantMongoTemplate {

    @Autowired
    private MongoClient mongoClient;  // 共享同一 MongoClient

    // 根据租户 ID 路由到不同 Database
    public MongoTemplate forTenant(String tenantId) {
        String dbName = "tenant_" + tenantId;  // tenant_abc / tenant_xyz
        return new MongoTemplate(mongoClient, dbName);
    }
}

// 使用（结合 ThreadLocal 存储当前租户）
@Service
public class ArticleService {

    @Autowired
    private TenantMongoTemplate tenantTemplate;

    public List<Article> getArticles() {
        String tenantId = TenantContext.getCurrentTenantId();
        MongoTemplate template = tenantTemplate.forTenant(tenantId);
        return template.findAll(Article.class);
    }
}

// 用户权限隔离（每个 Database 创建独立用户）
// use admin
// db.createUser({
//   user: "tenant_abc",
//   pwd: "...",
//   roles: [{ role: "readWrite", db: "tenant_abc" }]
// })
```

### 数据库列表管理

```js
// 查看所有租户数据库
use admin
db.adminCommand({ listDatabases: 1 })
  .databases
  .filter(d => d.name.startsWith('tenant_'))
  .map(d => d.name)
```

---

## 模式3：共享集合（Field-per-Tenant）

所有租户数据存储在同一集合，通过 `tenantId` 字段隔离。

```js
// 文档结构（必须包含 tenantId）
{
  "_id": ObjectId("..."),
  "tenantId": "tenant_abc",    // 租户标识（必须字段）
  "orderId": "ORD-001",
  "userId": "user_001",
  "amount": 299,
  "status": "paid"
}

// 索引：tenantId 必须作为所有索引的前缀
db.orders.createIndex({ tenantId: 1, userId: 1, createdAt: -1 })
db.orders.createIndex({ tenantId: 1, status: 1 })
db.orders.createIndex({ tenantId: 1, orderId: 1 }, { unique: true })
```

### 应用层自动注入 tenantId

```java
// 拦截器自动注入 tenantId
@Component
public class TenantMongoEventListener extends AbstractMongoEventListener<Object> {

    @Override
    public void onBeforeSave(BeforeSaveEvent<Object> event) {
        Document document = event.getDocument();
        if (document != null && !document.containsKey("tenantId")) {
            document.put("tenantId", TenantContext.getCurrentTenantId());
        }
    }
}

// 查询时必须带 tenantId（Service 层封装）
@Service
public class TenantAwareOrderService {

    @Autowired
    private MongoTemplate mongoTemplate;

    private Criteria tenantCriteria() {
        return Criteria.where("tenantId").is(TenantContext.getCurrentTenantId());
    }

    public List<Order> findByStatus(String status) {
        Query query = new Query(
            tenantCriteria().and("status").is(status)  // 自动带 tenantId
        );
        return mongoTemplate.find(query, Order.class);
    }
}
```

---

## Zone Sharding 实现大租户独占 Shard

```js
// 为大租户分配专属 Shard（保证性能隔离）
sh.addShardToZone("shard1", "ENTERPRISE")
sh.addShardToZone("shard2", "STANDARD")

// 大租户路由到专属 Shard
sh.updateZoneKeyRange(
  "saas.orders",
  { tenantId: "tenant_bigcorp" },
  { tenantId: "tenant_bigcorp_end" },
  "ENTERPRISE"
)

// 其他租户路由到标准 Shard
sh.updateZoneKeyRange(
  "saas.orders",
  { tenantId: MinKey },
  { tenantId: "tenant_bigcorp" },
  "STANDARD"
)
```

---

## 数据隔离安全加固

```java
// TenantContext：线程安全的租户上下文
public class TenantContext {
    private static final ThreadLocal<String> TENANT = new ThreadLocal<>();

    public static void setCurrentTenantId(String tenantId) {
        TENANT.set(tenantId);
    }
    public static String getCurrentTenantId() {
        String tenantId = TENANT.get();
        if (tenantId == null) throw new IllegalStateException("租户上下文未设置");
        return tenantId;
    }
    public static void clear() {
        TENANT.remove();  // 请求结束后必须清理
    }
}

// 过滤器：从 JWT/Header 提取租户 ID
@Component
public class TenantFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        String tenantId = extractTenantId((HttpServletRequest) req);
        TenantContext.setCurrentTenantId(tenantId);
        try {
            chain.doFilter(req, res);
        } finally {
            TenantContext.clear();  // 请求结束清理
        }
    }
}
```

---

## 选型建议

```
推荐组合策略（Hybrid）：
  大型企业客户（> 100万文档）→ 独立实例
  中型客户（1万~100万文档）  → 独立数据库
  小型/免费客户（< 1万文档）  → 共享集合

优势：
  - 大客户独立保障 SLA
  - 中小客户共享降低成本
  - 统一代码，差异化配置
```

---

## 总结

- 三种隔离模式：实例隔离（最安全）> 数据库隔离 > 字段隔离（最经济）
- 共享集合模式：所有索引以 `tenantId` 为前缀，应用层自动注入和过滤
- Zone Sharding 为大租户提供专属分片，保障性能隔离
- ThreadLocal + Filter 实现透明的租户上下文传递
- 混合策略：按客户规模选择不同隔离级别

**下一步**：安全合规与数据生命周期管理。

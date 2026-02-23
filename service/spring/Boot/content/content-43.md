# 第 43 章：自定义 Metrics 指标

深入讲解如何使用 Micrometer 自定义业务指标，实现应用性能监控。

**学习目标：**
- 掌握 Micrometer 核心概念
- 学会自定义 Counter、Gauge、Timer 等指标
- 实现业务指标监控

---

## 43.1 Micrometer 核心概念

### MeterRegistry

```java
@Autowired
private MeterRegistry meterRegistry;
```

---

## 43.2 自定义指标

### Counter（计数器）

```java
@Service
public class OrderService {
    
    private final Counter orderCounter;
    
    public OrderService(MeterRegistry registry) {
        this.orderCounter = Counter.builder("orders.created")
            .tag("type", "online")
            .description("Total created orders")
            .register(registry);
    }
    
    public void createOrder(Order order) {
        // 业务逻辑
        orderCounter.increment();
    }
}
```

### Gauge（仪表）

```java
@Component
public class CacheMetrics {
    
    public CacheMetrics(MeterRegistry registry, CacheManager cacheManager) {
        Gauge.builder("cache.size", cacheManager, cm -> getCacheSize(cm))
             .tag("cache", "userCache")
             .register(registry);
    }
    
    private double getCacheSize(CacheManager cacheManager) {
        Cache cache = cacheManager.getCache("users");
        return cache != null ? cache.getNativeCache().size() : 0;
    }
}
```

### Timer（计时器）

```java
@Service
public class UserService {
    
    private final Timer queryTimer;
    
    public UserService(MeterRegistry registry) {
        this.queryTimer = Timer.builder("user.query")
            .description("User query time")
            .register(registry);
    }
    
    public User findById(Long id) {
        return queryTimer.record(() -> {
            // 数据库查询
            return userRepository.findById(id).orElse(null);
        });
    }
}
```

---

## 43.3 使用 @Timed 注解

```java
@Service
public class ProductService {
    
    @Timed(value = "product.query", description = "Product query time")
    public Product findById(Long id) {
        return productRepository.findById(id).orElse(null);
    }
}
```

---

## 43.4 本章小结

**核心要点：**
1. Micrometer 提供多种指标类型
2. 支持 Counter、Gauge、Timer 等
3. 可通过注解或编程方式自定义指标

**相关章节：**
- [第 42 章：自定义健康检查](./content-42.md)
- [第 44 章：Spring Boot 核心扩展点汇总](./content-44.md)

# 10.2 并发控制实践

## 概述

在高并发场景下，单纯使用乐观锁可能导致大量重试失败。本节介绍并发控制的实战经验，包括乐观锁策略优化、重试机制设计、CAS 操作与 ABA 问题、分布式场景下的并发控制等。

**核心内容：**
- 高并发场景下的乐观锁策略
- 重试机制设计
- CAS 操作与 ABA 问题
- 分布式场景下的并发控制

---

## 高并发场景下的乐观锁策略

### 问题：乐观锁失败率过高

```java
/**
 * 秒杀场景：10000个用户抢100件商品
 */
public void seckillTest() {
    // 并发执行10000次
    CountDownLatch latch = new CountDownLatch(10000);
    AtomicInteger successCount = new AtomicInteger(0);
    AtomicInteger failCount = new AtomicInteger(0);
    
    for (int i = 0; i < 10000; i++) {
        new Thread(() -> {
            try {
                seckillService.seckill(1L, userId);
                successCount.incrementAndGet();
            } catch (Exception e) {
                failCount.incrementAndGet();
            } finally {
                latch.countDown();
            }
        }).start();
    }
    
    latch.await();
    
    System.out.println("成功：" + successCount.get());  // 约 100
    System.out.println("失败：" + failCount.get());    // 约 9900
    // 失败率高达 99%！
}
```

### 策略1：乐观锁 + 重试

```java
/**
 * 乐观锁 + 重试机制
 */
@Service
public class OptimisticLockService {
    
    private static final int MAX_RETRY = 3;
    private static final long RETRY_INTERVAL = 10;  // ms
    
    /**
     * 扣减库存（带重试）
     */
    public boolean reduceStock(Long productId, Integer quantity) {
        for (int i = 0; i < MAX_RETRY; i++) {
            try {
                return doReduceStock(productId, quantity);
            } catch (OptimisticLockException e) {
                log.warn("乐观锁冲突，重试次数：{}", i + 1);
                
                if (i < MAX_RETRY - 1) {
                    // 随机延迟，避免冲突
                    long delay = RETRY_INTERVAL + ThreadLocalRandom.current().nextLong(10);
                    Thread.sleep(delay);
                } else {
                    throw new BusinessException("库存扣减失败，请稍后重试");
                }
            }
        }
        
        return false;
    }
    
    private boolean doReduceStock(Long productId, Integer quantity) {
        Product product = productService.getById(productId);
        
        if (product.getStock() < quantity) {
            throw new BusinessException("库存不足");
        }
        
        product.setStock(product.getStock() - quantity);
        
        boolean success = productService.updateById(product);
        
        if (!success) {
            throw new OptimisticLockException("版本号冲突");
        }
        
        return true;
    }
}
```

### 策略2：乐观锁 + 悲观锁混合

```java
/**
 * 混合策略：先用乐观锁，失败后降级为悲观锁
 */
@Service
public class HybridLockService {
    
    @Autowired
    private ProductMapper productMapper;
    
    /**
     * 扣减库存（混合锁）
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean reduceStock(Long productId, Integer quantity) {
        // 1. 先尝试乐观锁（快速失败）
        try {
            return reduceStockOptimistic(productId, quantity);
        } catch (OptimisticLockException e) {
            log.warn("乐观锁失败，降级为悲观锁");
        }
        
        // 2. 降级为悲观锁（确保成功）
        return reduceStockPessimistic(productId, quantity);
    }
    
    /**
     * 乐观锁实现
     */
    private boolean reduceStockOptimistic(Long productId, Integer quantity) {
        Product product = productMapper.selectById(productId);
        
        if (product.getStock() < quantity) {
            throw new BusinessException("库存不足");
        }
        
        product.setStock(product.getStock() - quantity);
        
        int rows = productMapper.updateById(product);
        
        if (rows == 0) {
            throw new OptimisticLockException("版本号冲突");
        }
        
        return true;
    }
    
    /**
     * 悲观锁实现
     */
    private boolean reduceStockPessimistic(Long productId, Integer quantity) {
        // 查询并加锁
        Product product = productMapper.selectByIdForUpdate(productId);
        
        if (product.getStock() < quantity) {
            throw new BusinessException("库存不足");
        }
        
        product.setStock(product.getStock() - quantity);
        
        return productMapper.updateById(product) > 0;
    }
}
```

### 策略3：Redis 预减库存 + 数据库最终一致

```java
/**
 * Redis 预减库存（提升性能）
 */
@Service
public class RedisStockService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private ProductService productService;
    
    private static final String STOCK_KEY = "product:stock:";
    
    /**
     * 初始化 Redis 库存
     */
    public void initStock(Long productId) {
        Product product = productService.getById(productId);
        String key = STOCK_KEY + productId;
        redisTemplate.opsForValue().set(key, product.getStock());
    }
    
    /**
     * Redis 预减库存
     */
    public boolean reduceStock(Long productId, Integer quantity) {
        String key = STOCK_KEY + productId;
        
        // 1. Redis 原子扣减（Lua 脚本）
        Long stock = redisTemplate.execute(
            new DefaultRedisScript<>(
                "local stock = redis.call('get', KEYS[1]) " +
                "if not stock or tonumber(stock) < tonumber(ARGV[1]) then " +
                "   return -1 " +
                "end " +
                "return redis.call('decrby', KEYS[1], ARGV[1])",
                Long.class
            ),
            Collections.singletonList(key),
            quantity
        );
        
        if (stock == null || stock < 0) {
            return false;
        }
        
        // 2. 异步更新数据库（消息队列）
        StockMessage message = new StockMessage();
        message.setProductId(productId);
        message.setQuantity(quantity);
        mqProducer.send(message);
        
        return true;
    }
    
    /**
     * 消费消息，更新数据库
     */
    @RabbitListener(queues = "stock.queue")
    public void handleStockMessage(StockMessage message) {
        // 使用乐观锁更新数据库
        productService.reduceStock(message.getProductId(), message.getQuantity());
    }
}
```

---

## 重试机制设计

### 指数退避算法

```java
/**
 * 指数退避重试
 */
public class ExponentialBackoffRetry {
    
    private static final int MAX_RETRY = 5;
    private static final long INITIAL_DELAY = 10;  // ms
    
    /**
     * 执行操作（带重试）
     */
    public <T> T executeWithRetry(Supplier<T> operation) {
        int attempt = 0;
        
        while (true) {
            try {
                return operation.get();
            } catch (OptimisticLockException e) {
                attempt++;
                
                if (attempt >= MAX_RETRY) {
                    throw new BusinessException("操作失败，已达最大重试次数");
                }
                
                // 指数退避：10ms, 20ms, 40ms, 80ms, 160ms
                long delay = INITIAL_DELAY * (1L << (attempt - 1));
                
                // 添加随机抖动，避免同时重试
                delay += ThreadLocalRandom.current().nextLong(delay / 2);
                
                log.warn("操作失败，{}ms后重试（第{}次）", delay, attempt);
                
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new BusinessException("操作被中断");
                }
            }
        }
    }
}

// 使用
ExponentialBackoffRetry retry = new ExponentialBackoffRetry();

boolean success = retry.executeWithRetry(() -> {
    return productService.reduceStock(productId, quantity);
});
```

### Spring Retry 集成

```xml
<!-- 添加依赖 -->
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
```

```java
/**
 * 启用 Spring Retry
 */
@Configuration
@EnableRetry
public class RetryConfig {
}

/**
 * 使用 @Retryable 注解
 */
@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> 
        implements ProductService {
    
    /**
     * 扣减库存（自动重试）
     */
    @Retryable(
        value = OptimisticLockException.class,  // 重试的异常
        maxAttempts = 3,                        // 最大重试次数
        backoff = @Backoff(
            delay = 100,      // 初始延迟 100ms
            multiplier = 2,   // 延迟倍数
            maxDelay = 1000   // 最大延迟 1000ms
        )
    )
    public boolean reduceStock(Long productId, Integer quantity) {
        Product product = getById(productId);
        
        if (product.getStock() < quantity) {
            throw new BusinessException("库存不足");
        }
        
        product.setStock(product.getStock() - quantity);
        
        boolean success = updateById(product);
        
        if (!success) {
            throw new OptimisticLockException("版本号冲突");
        }
        
        return true;
    }
    
    /**
     * 重试失败后的回退方法
     */
    @Recover
    public boolean recoverReduceStock(OptimisticLockException e, 
                                      Long productId, 
                                      Integer quantity) {
        log.error("扣减库存失败，已达最大重试次数，商品ID：{}", productId);
        throw new BusinessException("库存扣减失败，请稍后重试");
    }
}
```

---

## CAS 操作与 ABA 问题

### ABA 问题说明

```
时间线：
T1: 线程A读取 version=1, stock=100
T2: 线程B读取 version=1, stock=100
T3: 线程B更新 version=2, stock=99  (扣减1)
T4: 线程C更新 version=3, stock=100 (退货1)
T5: 线程D更新 version=1, stock=99  (回滚到初始版本)  // 危险操作！
T6: 线程A更新 version=2, stock=99  (CAS 成功，但数据可能不一致)
```

**问题：** 版本号从 1 → 2 → 3 → 1，线程A检查版本号=1 时认为没有变化，但实际数据已经被修改多次。

### 解决方案1：版本号只增不减

```java
/**
 * 版本号只增不减（MyBatis Plus 默认实现）
 */
@Version
private Integer version;

// 每次更新，版本号自动 +1
// 1 → 2 → 3 → 4 → 5...
// 永远不会回到之前的值，避免 ABA 问题
```

### 解决方案2：使用时间戳版本号

```java
/**
 * 使用时间戳作为版本号
 */
@Version
private Long version;  // 毫秒级时间戳

// 每次更新，版本号 = System.currentTimeMillis()
// 1704096000000 → 1704096000123 → 1704096000456...
// 单调递增，不会重复
```

### 解决方案3：带状态的版本控制

```java
/**
 * 版本号 + 状态
 */
@Data
public class Order {
    @TableId
    private Long id;
    
    @Version
    private Integer version;
    
    private Integer status;  // 订单状态
    
    private LocalDateTime statusChangeTime;  // 状态变更时间
}

/**
 * 更新时同时检查状态
 */
public boolean updateOrderStatus(Long orderId, Integer fromStatus, Integer toStatus) {
    LambdaUpdateWrapper<Order> wrapper = new LambdaUpdateWrapper<>();
    wrapper.set(Order::getStatus, toStatus)
           .set(Order::getStatusChangeTime, LocalDateTime.now())
           .eq(Order::getId, orderId)
           .eq(Order::getStatus, fromStatus);  // 检查状态
    
    int rows = orderMapper.update(null, wrapper);
    
    if (rows == 0) {
        throw new BusinessException("订单状态已变更");
    }
    
    return true;
}
```

---

## 分布式场景下的并发控制

### 方案1：分布式锁

```java
/**
 * 使用 Redisson 分布式锁
 */
@Service
public class DistributedLockService {
    
    @Autowired
    private RedissonClient redissonClient;
    
    @Autowired
    private ProductService productService;
    
    /**
     * 扣减库存（分布式锁）
     */
    public boolean reduceStock(Long productId, Integer quantity) {
        String lockKey = "product:lock:" + productId;
        RLock lock = redissonClient.getLock(lockKey);
        
        try {
            // 尝试获取锁（最多等待10秒，锁定30秒后自动释放）
            boolean locked = lock.tryLock(10, 30, TimeUnit.SECONDS);
            
            if (!locked) {
                throw new BusinessException("系统繁忙，请稍后重试");
            }
            
            // 执行业务逻辑
            Product product = productService.getById(productId);
            
            if (product.getStock() < quantity) {
                throw new BusinessException("库存不足");
            }
            
            product.setStock(product.getStock() - quantity);
            
            return productService.updateById(product);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("操作被中断");
        } finally {
            // 释放锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

### 方案2：Seata 分布式事务

```java
/**
 * 使用 Seata AT 模式
 */
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private AccountService accountService;
    
    /**
     * 创建订单（分布式事务）
     */
    @GlobalTransactional(
        name = "create-order",
        rollbackFor = Exception.class
    )
    public boolean createOrder(OrderDTO dto) {
        // 1. 扣减库存（商品服务）
        productService.reduceStock(dto.getProductId(), dto.getQuantity());
        
        // 2. 扣减余额（账户服务）
        accountService.deduct(dto.getUserId(), dto.getAmount());
        
        // 3. 创建订单（订单服务）
        Order order = new Order();
        BeanUtils.copyProperties(dto, order);
        return save(order);
        
        // Seata 保证分布式事务一致性
        // 任何一步失败，自动回滚
    }
}
```

### 方案3：TCC 模式

```java
/**
 * TCC 模式：Try-Confirm-Cancel
 */
@LocalTCC
public interface ProductTccService {
    
    /**
     * Try：预扣库存
     */
    @TwoPhaseBusinessAction(
        name = "reduceStock",
        commitMethod = "commit",
        rollbackMethod = "rollback"
    )
    boolean reduceStock(
        @BusinessActionContextParameter(paramName = "productId") Long productId,
        @BusinessActionContextParameter(paramName = "quantity") Integer quantity
    );
    
    /**
     * Confirm：确认扣减
     */
    boolean commit(BusinessActionContext context);
    
    /**
     * Cancel：回滚
     */
    boolean rollback(BusinessActionContext context);
}

@Service
public class ProductTccServiceImpl implements ProductTccService {
    
    @Autowired
    private ProductMapper productMapper;
    
    /**
     * Try：预扣库存（冻结）
     */
    @Override
    public boolean reduceStock(Long productId, Integer quantity) {
        // 扣减可用库存，增加冻结库存
        int rows = productMapper.freezeStock(productId, quantity);
        
        if (rows == 0) {
            throw new BusinessException("库存不足");
        }
        
        return true;
    }
    
    /**
     * Confirm：确认扣减
     */
    @Override
    public boolean commit(BusinessActionContext context) {
        Long productId = context.getActionContext("productId", Long.class);
        Integer quantity = context.getActionContext("quantity", Integer.class);
        
        // 扣减冻结库存
        return productMapper.deductFrozenStock(productId, quantity) > 0;
    }
    
    /**
     * Cancel：回滚
     */
    @Override
    public boolean rollback(BusinessActionContext context) {
        Long productId = context.getActionContext("productId", Long.class);
        Integer quantity = context.getActionContext("quantity", Integer.class);
        
        // 释放冻结库存
        return productMapper.releaseFrozenStock(productId, quantity) > 0;
    }
}
```

---

## 性能优化建议

### 1. 减少数据库访问

```java
// ❌ 不好：每次都查询数据库
for (int i = 0; i < 100; i++) {
    Product product = productService.getById(productId);
    product.setStock(product.getStock() - 1);
    productService.updateById(product);
}

// ✅ 更好：批量操作
Product product = productService.getById(productId);
product.setStock(product.getStock() - 100);
productService.updateById(product);
```

### 2. 使用缓存

```java
/**
 * Redis 缓存 + 数据库
 */
@Service
public class CachedProductService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private ProductService productService;
    
    /**
     * 查询商品（带缓存）
     */
    public Product getById(Long productId) {
        String key = "product:" + productId;
        
        // 1. 先查缓存
        Product product = (Product) redisTemplate.opsForValue().get(key);
        
        if (product != null) {
            return product;
        }
        
        // 2. 查询数据库
        product = productService.getById(productId);
        
        // 3. 写入缓存
        if (product != null) {
            redisTemplate.opsForValue().set(key, product, 1, TimeUnit.HOURS);
        }
        
        return product;
    }
}
```

### 3. 限流保护

```java
/**
 * 使用 Guava RateLimiter 限流
 */
@Service
public class RateLimitedService {
    
    // 每秒最多100个请求
    private final RateLimiter rateLimiter = RateLimiter.create(100.0);
    
    /**
     * 秒杀（限流保护）
     */
    public boolean seckill(Long productId, Long userId) {
        // 尝试获取令牌（最多等待100ms）
        if (!rateLimiter.tryAcquire(100, TimeUnit.MILLISECONDS)) {
            throw new BusinessException("系统繁忙，请稍后重试");
        }
        
        // 执行秒杀逻辑
        return seckillService.seckill(productId, userId);
    }
}
```

---

## 关键点总结

1. **乐观锁策略**：重试、混合锁、Redis预减库存
2. **重试机制**：指数退避、随机抖动、Spring Retry
3. **ABA 问题**：版本号只增不减、时间戳版本号
4. **分布式场景**：分布式锁、Seata、TCC模式
5. **性能优化**：减少数据库访问、使用缓存、限流保护
6. **失败处理**：回退方法、异常处理、日志记录
7. **业务权衡**：根据场景选择合适的并发控制方案

---

## 参考资料

- [乐观锁插件](https://baomidou.com/pages/0d93c0/)
- [Spring Retry](https://github.com/spring-projects/spring-retry)
- [Redisson](https://redisson.org/)
- [Seata](https://seata.io/)

# 10.1 乐观锁实现

## 概述

乐观锁（Optimistic Locking）是一种并发控制机制，假设多个事务在处理数据时不会发生冲突，只在提交时检查是否有其他事务修改了数据。MyBatis Plus 通过 `@Version` 注解和乐观锁插件实现了乐观锁功能。

**核心概念：**
- 版本号机制
- CAS（Compare And Swap）操作
- 并发控制
- 更新失败处理

---

## @Version 注解与原理

### 基本用法

```java
@Data
@TableName("product")
public class Product {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String name;
    
    private Integer stock;
    
    private BigDecimal price;
    
    /**
     * 乐观锁版本号
     * 每次更新时自动 +1
     */
    @Version
    private Integer version;
}
```

### 数据库表设计

```sql
CREATE TABLE `product` (
  `id` BIGINT(20) NOT NULL COMMENT '主键ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `stock` INT(11) NOT NULL DEFAULT 0 COMMENT '库存',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  
  -- 乐观锁版本号
  `version` INT(11) NOT NULL DEFAULT 1 COMMENT '版本号',
  
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_version` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

---

## 乐观锁插件配置

### 配置插件

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 添加乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        
        // 其他插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        
        return interceptor;
    }
}
```

---

## 工作原理

### 更新流程

```java
// 1. 查询商品（version = 1）
Product product = productMapper.selectById(1L);
// SELECT * FROM product WHERE id = 1
// 结果：{id: 1, name: "iPhone", stock: 100, version: 1}

// 2. 修改库存
product.setStock(product.getStock() - 1);

// 3. 更新商品
int rows = productMapper.updateById(product);

// 实际执行的 SQL（自动添加版本号条件）
// UPDATE product 
// SET stock = 99, version = 2 
// WHERE id = 1 AND version = 1

// 4. 检查更新结果
if (rows == 0) {
    // 更新失败，版本号不匹配（有其他线程修改了数据）
    throw new BusinessException("数据已被其他用户修改，请刷新后重试");
}

// 5. 更新成功后，实体对象的 version 自动更新为 2
System.out.println(product.getVersion());  // 输出：2
```

### CAS 操作原理

```
线程A                          线程B                          数据库
  |                              |                              |
  | 读取 (version=1)              |                              | version=1
  |                              | 读取 (version=1)              | version=1
  |                              |                              |
  | 更新 (version=1 -> 2)         |                              |
  |----------------------------->|                              |
  |                              |                              | version=2 ✓
  |                              |                              |
  |                              | 更新 (version=1 -> 2)         |
  |                              |----------------------------->|
  |                              |                              | version=2 ✗ (冲突)
  |                              | 更新失败                      |
  |                              |<-----------------------------|
```

---

## 使用示例

### 示例1：库存扣减

```java
/**
 * 扣减库存（使用乐观锁）
 */
@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> 
        implements ProductService {
    
    /**
     * 扣减库存
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean reduceStock(Long productId, Integer quantity) {
        // 1. 查询商品（获取当前版本号）
        Product product = getById(productId);
        
        if (product == null) {
            throw new BusinessException("商品不存在");
        }
        
        // 2. 检查库存
        if (product.getStock() < quantity) {
            throw new BusinessException("库存不足");
        }
        
        // 3. 扣减库存
        product.setStock(product.getStock() - quantity);
        
        // 4. 更新（乐观锁保证并发安全）
        boolean success = updateById(product);
        
        if (!success) {
            throw new BusinessException("库存扣减失败，请重试");
        }
        
        return true;
    }
}
```

### 示例2：账户余额扣减

```java
/**
 * 账户服务
 */
@Service
public class AccountServiceImpl extends ServiceImpl<AccountMapper, Account> 
        implements AccountService {
    
    /**
     * 扣减余额
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean deduct(Long accountId, BigDecimal amount) {
        // 1. 查询账户
        Account account = getById(accountId);
        
        if (account == null) {
            throw new BusinessException("账户不存在");
        }
        
        // 2. 检查余额
        if (account.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("余额不足");
        }
        
        // 3. 扣减余额
        account.setBalance(account.getBalance().subtract(amount));
        
        // 4. 更新（使用乐观锁）
        boolean success = updateById(account);
        
        if (!success) {
            // 版本号冲突，抛出异常回滚事务
            throw new BusinessException("余额扣减失败，请重试");
        }
        
        return true;
    }
}
```

### 示例3：批量更新（注意事项）

```java
/**
 * 批量更新（乐观锁对每条记录生效）
 */
public boolean batchUpdate(List<Product> products) {
    // 批量更新时，乐观锁对每条记录都生效
    boolean success = updateBatchById(products);
    
    if (!success) {
        // 有记录更新失败（版本号冲突）
        throw new BusinessException("部分数据更新失败");
    }
    
    return true;
}

// 更安全的批量更新
@Transactional(rollbackFor = Exception.class)
public boolean batchUpdateSafe(List<Long> productIds) {
    for (Long productId : productIds) {
        Product product = getById(productId);
        
        if (product == null) {
            continue;
        }
        
        // 修改数据
        product.setStock(product.getStock() + 10);
        
        // 更新（乐观锁）
        boolean success = updateById(product);
        
        if (!success) {
            // 单条失败，回滚整个事务
            throw new BusinessException("更新失败：" + productId);
        }
    }
    
    return true;
}
```

---

## 与悲观锁的对比

### 悲观锁（Pessimistic Locking）

```java
/**
 * 悲观锁实现（使用数据库锁）
 */
@Mapper
public interface ProductMapper extends BaseMapper<Product> {
    
    /**
     * 查询并加锁（FOR UPDATE）
     */
    @Select("SELECT * FROM product WHERE id = #{id} FOR UPDATE")
    Product selectByIdForUpdate(@Param("id") Long id);
}

@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> 
        implements ProductService {
    
    /**
     * 使用悲观锁扣减库存
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean reduceStockPessimistic(Long productId, Integer quantity) {
        // 1. 查询并加锁（阻塞其他事务）
        Product product = baseMapper.selectByIdForUpdate(productId);
        
        if (product == null) {
            throw new BusinessException("商品不存在");
        }
        
        // 2. 检查库存
        if (product.getStock() < quantity) {
            throw new BusinessException("库存不足");
        }
        
        // 3. 扣减库存
        product.setStock(product.getStock() - quantity);
        
        // 4. 更新（不需要版本号）
        return updateById(product);
    }
}
```

### 对比分析

| 特性 | 乐观锁 | 悲观锁 |
|------|-------|-------|
| **实现方式** | 版本号 + CAS | 数据库锁（FOR UPDATE） |
| **冲突检测** | 提交时检测 | 读取时加锁 |
| **并发性能** | 高（无锁等待） | 低（锁等待） |
| **适用场景** | 读多写少 | 写多读少 |
| **冲突概率** | 高并发时可能频繁失败 | 不会失败，但会等待 |
| **死锁风险** | 无 | 有 |
| **实现复杂度** | 需要重试机制 | 简单 |

### 选择建议

```java
/**
 * 场景1：秒杀商品（高并发，短时间大量请求）
 * 推荐：乐观锁 + 重试 + 限流
 */
public boolean seckill(Long productId) {
    int retryCount = 3;
    
    for (int i = 0; i < retryCount; i++) {
        try {
            return reduceStockOptimistic(productId, 1);
        } catch (BusinessException e) {
            if (i == retryCount - 1) {
                throw e;
            }
            // 短暂休眠后重试
            Thread.sleep(10);
        }
    }
    
    return false;
}

/**
 * 场景2：账户转账（必须成功，可以等待）
 * 推荐：悲观锁
 */
@Transactional(rollbackFor = Exception.class)
public boolean transfer(Long fromId, Long toId, BigDecimal amount) {
    // 使用悲观锁，确保转账成功
    Account from = accountMapper.selectByIdForUpdate(fromId);
    Account to = accountMapper.selectByIdForUpdate(toId);
    
    // 扣减 from 账户
    from.setBalance(from.getBalance().subtract(amount));
    updateById(from);
    
    // 增加 to 账户
    to.setBalance(to.getBalance().add(amount));
    updateById(to);
    
    return true;
}
```

---

## 乐观锁的限制

### 1. 只支持 updateById 方法

```java
// ✅ 支持：updateById
Product product = getById(1L);
product.setStock(100);
updateById(product);  // 乐观锁生效

// ❌ 不支持：update(entity, wrapper)
UpdateWrapper<Product> wrapper = new UpdateWrapper<>();
wrapper.eq("id", 1L);
update(product, wrapper);  // 乐观锁不生效

// ❌ 不支持：lambdaUpdate
lambdaUpdate()
    .set(Product::getStock, 100)
    .eq(Product::getId, 1L)
    .update();  // 乐观锁不生效
```

### 2. 批量更新的注意事项

```java
// 批量更新时，每条记录独立检查版本号
List<Product> products = listByIds(Arrays.asList(1L, 2L, 3L));

products.forEach(p -> p.setStock(p.getStock() + 10));

// 如果其中一条记录版本号冲突，该记录更新失败
// 但其他记录可能已经更新成功
updateBatchById(products);
```

### 3. 版本号必须有初始值

```sql
-- 数据库字段必须有默认值
`version` INT(11) NOT NULL DEFAULT 1 COMMENT '版本号'
```

```java
// 或在插入时设置初始值
Product product = new Product();
product.setName("iPhone");
product.setStock(100);
product.setVersion(1);  // 设置初始版本号
save(product);
```

---

## 实战案例：秒杀系统

### 秒杀商品表设计

```sql
CREATE TABLE `seckill_product` (
  `id` BIGINT(20) NOT NULL COMMENT '主键ID',
  `product_id` BIGINT(20) NOT NULL COMMENT '商品ID',
  `seckill_price` DECIMAL(10,2) NOT NULL COMMENT '秒杀价格',
  `stock` INT(11) NOT NULL COMMENT '秒杀库存',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  
  -- 乐观锁版本号
  `version` INT(11) NOT NULL DEFAULT 1 COMMENT '版本号',
  
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_time` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='秒杀商品表';
```

### 秒杀服务实现

```java
/**
 * 秒杀服务
 */
@Service
@Slf4j
public class SeckillServiceImpl extends ServiceImpl<SeckillProductMapper, SeckillProduct> 
        implements SeckillService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private OrderService orderService;
    
    /**
     * 秒杀下单
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean seckill(Long seckillId, Long userId) {
        // 1. 检查是否在秒杀时间内
        SeckillProduct seckill = getById(seckillId);
        
        if (seckill == null) {
            throw new BusinessException("秒杀商品不存在");
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(seckill.getStartTime())) {
            throw new BusinessException("秒杀未开始");
        }
        
        if (now.isAfter(seckill.getEndTime())) {
            throw new BusinessException("秒杀已结束");
        }
        
        // 2. 检查用户是否已经购买（防止重复购买）
        String lockKey = "seckill:user:" + seckillId + ":" + userId;
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, "1", 1, TimeUnit.HOURS);
        
        if (!locked) {
            throw new BusinessException("您已参与过该秒杀");
        }
        
        // 3. 扣减库存（使用乐观锁，重试3次）
        boolean stockReduced = reduceStockWithRetry(seckillId, 3);
        
        if (!stockReduced) {
            throw new BusinessException("库存不足或抢购失败");
        }
        
        // 4. 创建订单
        Order order = new Order();
        order.setUserId(userId);
        order.setProductId(seckill.getProductId());
        order.setQuantity(1);
        order.setAmount(seckill.getSeckillPrice());
        order.setOrderType(OrderType.SECKILL);
        
        orderService.save(order);
        
        log.info("秒杀成功，用户：{}，商品：{}", userId, seckillId);
        return true;
    }
    
    /**
     * 扣减库存（带重试）
     */
    private boolean reduceStockWithRetry(Long seckillId, int maxRetry) {
        for (int i = 0; i < maxRetry; i++) {
            try {
                // 查询秒杀商品
                SeckillProduct seckill = getById(seckillId);
                
                // 检查库存
                if (seckill.getStock() <= 0) {
                    return false;
                }
                
                // 扣减库存
                seckill.setStock(seckill.getStock() - 1);
                
                // 更新（乐观锁）
                boolean success = updateById(seckill);
                
                if (success) {
                    return true;
                }
                
                // 更新失败，休眠后重试
                if (i < maxRetry - 1) {
                    Thread.sleep(10);
                }
                
            } catch (Exception e) {
                log.error("扣减库存失败，重试次数：{}", i, e);
                
                if (i == maxRetry - 1) {
                    throw new BusinessException("扣减库存失败");
                }
            }
        }
        
        return false;
    }
}
```

---

## 关键点总结

1. **@Version 注解**：标记版本号字段，每次更新自动 +1
2. **插件配置**：必须配置 OptimisticLockerInnerInterceptor 插件
3. **工作原理**：UPDATE 时自动添加版本号条件（WHERE version = ?）
4. **CAS 操作**：Compare And Swap，保证并发安全
5. **适用场景**：读多写少、高并发、冲突概率低
6. **限制条件**：只支持 updateById，批量更新需注意
7. **重试机制**：更新失败时需要重试逻辑

---

## 参考资料

- [乐观锁插件](https://baomidou.com/pages/0d93c0/)
- [并发控制](https://zh.wikipedia.org/wiki/%E5%B9%B6%E5%8F%91%E6%8E%A7%E5%88%B6)

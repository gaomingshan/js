# 19.1 实战案例：电商订单系统

## 概述

通过电商订单系统案例，综合运用 MyBatis Plus 的各项功能，展示企业级项目的完整实现。

**核心功能：**
- 订单管理
- 库存管理
- 支付流程
- 订单状态机

---

## 数据库设计

```sql
-- 订单表
CREATE TABLE `order` (
  `id` BIGINT(20) NOT NULL,
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
  `product_id` BIGINT(20) NOT NULL COMMENT '商品ID',
  `quantity` INT(11) NOT NULL COMMENT '数量',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '金额',
  `status` TINYINT(1) NOT NULL COMMENT '状态',
  `create_time` DATETIME NOT NULL,
  `update_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB COMMENT='订单表';

-- 订单状态：0待支付 1已支付 2已发货 3已完成 4已取消
```

---

## 核心实现

```java
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private RedisTemplate redisTemplate;
    
    /**
     * 创建订单
     */
    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(OrderDTO dto) {
        // 1. 检查商品库存
        Product product = productService.getById(dto.getProductId());
        if (product.getStock() < dto.getQuantity()) {
            throw new BusinessException("库存不足");
        }
        
        // 2. 扣减库存（乐观锁）
        boolean reduced = productService.reduceStock(
            dto.getProductId(), 
            dto.getQuantity()
        );
        
        if (!reduced) {
            throw new BusinessException("库存扣减失败");
        }
        
        // 3. 创建订单
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(dto.getUserId());
        order.setProductId(dto.getProductId());
        order.setQuantity(dto.getQuantity());
        order.setAmount(product.getPrice().multiply(new BigDecimal(dto.getQuantity())));
        order.setStatus(0);
        
        save(order);
        
        // 4. 设置超时取消（15分钟）
        redisTemplate.opsForValue().set(
            "order:timeout:" + order.getId(),
            order.getId(),
            15,
            TimeUnit.MINUTES
        );
        
        return order;
    }
    
    /**
     * 支付订单
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean payOrder(Long orderId) {
        Order order = getById(orderId);
        
        if (order == null || order.getStatus() != 0) {
            throw new BusinessException("订单状态异常");
        }
        
        // 更新订单状态
        order.setStatus(1);
        return updateById(order);
    }
    
    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis() + 
               RandomStringUtils.randomNumeric(6);
    }
}
```

---

## 关键点总结

1. **乐观锁**：防止超卖
2. **事务管理**：保证数据一致性
3. **状态机**：订单状态流转
4. **定时任务**：超时自动取消
5. **分布式锁**：防止重复下单
6. **幂等性**：防止重复支付
7. **异步处理**：消息队列解耦

---

## 参考资料

- [电商系统设计](https://github.com/macrozheng/mall)

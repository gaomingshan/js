# 16.2 分布式事务

## 概述

分布式事务是指事务操作跨越多个数据库或服务的场景。本节介绍常见的分布式事务解决方案，包括 Seata、消息队列、TCC 等。

**核心内容：**
- 分布式事务问题
- Seata AT 模式
- 消息队列最终一致性
- TCC 补偿模式

---

## 分布式事务场景

### 典型场景

```java
/**
 * 订单服务（数据库A）
 * 库存服务（数据库B）
 * 账户服务（数据库C）
 * 
 * 问题：如何保证三个服务的数据一致性？
 */
@Service
public class OrderService {
    
    @Transactional
    public void createOrder(OrderDTO dto) {
        // 1. 创建订单（数据库A）
        orderMapper.insert(order);
        
        // 2. 扣减库存（数据库B）- 远程调用
        stockService.reduceStock(dto.getProductId(), dto.getQuantity());
        
        // 3. 扣减余额（数据库C）- 远程调用
        accountService.deduct(dto.getUserId(), dto.getAmount());
        
        // 问题：如果步骤3失败，步骤2已经提交，无法回滚！
    }
}
```

---

## Seata AT 模式

### 引入依赖

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

### 配置 Seata

```yaml
# application.yml
seata:
  enabled: true
  application-id: order-service
  tx-service-group: my-tx-group
  
  config:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      group: SEATA_GROUP
      namespace: seata
  
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      group: SEATA_GROUP
      namespace: seata
```

### 使用 @GlobalTransactional

```java
/**
 * 订单服务
 */
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private StockService stockService;
    
    @Autowired
    private AccountService accountService;
    
    /**
     * 全局事务
     */
    @GlobalTransactional(
        name = "create-order",
        rollbackFor = Exception.class
    )
    public void createOrder(OrderDTO dto) {
        // 1. 创建订单
        Order order = new Order();
        orderMapper.insert(order);
        
        // 2. 扣减库存（远程调用）
        stockService.reduceStock(dto.getProductId(), dto.getQuantity());
        
        // 3. 扣减余额（远程调用）
        accountService.deduct(dto.getUserId(), dto.getAmount());
        
        // 任何步骤失败，自动回滚所有操作
    }
}

/**
 * 库存服务
 */
@Service
public class StockServiceImpl implements StockService {
    
    @Transactional
    public void reduceStock(Long productId, Integer quantity) {
        Stock stock = stockMapper.selectById(productId);
        stock.setQuantity(stock.getQuantity() - quantity);
        stockMapper.updateById(stock);
    }
}

/**
 * 账户服务
 */
@Service
public class AccountServiceImpl implements AccountService {
    
    @Transactional
    public void deduct(Long userId, BigDecimal amount) {
        Account account = accountMapper.selectById(userId);
        account.setBalance(account.getBalance().subtract(amount));
        accountMapper.updateById(account);
    }
}
```

### AT 模式原理

```
Seata AT 模式执行流程：
1. TM 开启全局事务，获取 XID
2. RM 执行分支事务
   - 解析 SQL，生成前镜像（beforeImage）
   - 执行业务 SQL
   - 生成后镜像（afterImage）
   - 注册分支事务
   - 提交本地事务
3. TM 决定全局提交或回滚
4. RM 根据决定：
   - 提交：删除 undo_log
   - 回滚：根据 undo_log 回滚数据
```

---

## 消息队列最终一致性

### 基于可靠消息的最终一致性

```java
/**
 * 订单服务
 */
@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    /**
     * 创建订单（本地事务）
     */
    @Transactional
    public void createOrder(OrderDTO dto) {
        // 1. 创建订单
        Order order = new Order();
        orderMapper.insert(order);
        
        // 2. 发送消息（事务消息）
        rabbitTemplate.convertAndSend(
            "order.exchange",
            "order.created",
            order.getId()
        );
    }
}

/**
 * 库存服务（消息消费者）
 */
@Component
public class StockMessageListener {
    
    @Autowired
    private StockService stockService;
    
    /**
     * 监听订单创建消息
     */
    @RabbitListener(queues = "stock.queue")
    public void handleOrderCreated(Long orderId) {
        try {
            // 扣减库存
            stockService.reduceStockByOrder(orderId);
        } catch (Exception e) {
            // 失败重试或记录补偿任务
            log.error("扣减库存失败", e);
            throw new AmqpRejectAndDontRequeueException("扣减库存失败");
        }
    }
}
```

### 本地消息表

```sql
-- 本地消息表
CREATE TABLE `local_message` (
  `id` BIGINT(20) NOT NULL,
  `message_id` VARCHAR(64) NOT NULL COMMENT '消息ID',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '状态(0:待发送,1:已发送,2:发送失败)',
  `retry_count` INT(11) NOT NULL DEFAULT 0 COMMENT '重试次数',
  `create_time` DATETIME NOT NULL,
  `update_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_message_id` (`message_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB COMMENT='本地消息表';
```

```java
/**
 * 本地消息表方案
 */
@Service
public class OrderServiceImpl implements OrderService {
    
    /**
     * 创建订单（本地事务 + 消息表）
     */
    @Transactional
    public void createOrder(OrderDTO dto) {
        // 1. 创建订单
        Order order = new Order();
        orderMapper.insert(order);
        
        // 2. 保存本地消息
        LocalMessage message = new LocalMessage();
        message.setMessageId(UUID.randomUUID().toString());
        message.setContent(JSON.toJSONString(order));
        message.setStatus(0);
        messageMapper.insert(message);
        
        // 本地事务提交
    }
}

/**
 * 定时任务：发送本地消息
 */
@Component
public class MessageSender {
    
    @Scheduled(fixedDelay = 5000)
    public void sendMessages() {
        // 查询待发送消息
        List<LocalMessage> messages = messageMapper.selectList(
            new LambdaQueryWrapper<LocalMessage>()
                .eq(LocalMessage::getStatus, 0)
                .lt(LocalMessage::getRetryCount, 3)
        );
        
        for (LocalMessage message : messages) {
            try {
                // 发送消息
                rabbitTemplate.convertAndSend(
                    "order.exchange",
                    "order.created",
                    message.getContent()
                );
                
                // 更新状态
                message.setStatus(1);
                messageMapper.updateById(message);
            } catch (Exception e) {
                // 更新重试次数
                message.setRetryCount(message.getRetryCount() + 1);
                messageMapper.updateById(message);
            }
        }
    }
}
```

---

## TCC 补偿模式

### TCC 接口定义

```java
/**
 * TCC 接口
 */
@LocalTCC
public interface AccountTccService {
    
    /**
     * Try：预留资源
     */
    @TwoPhaseBusinessAction(
        name = "deduct",
        commitMethod = "commit",
        rollbackMethod = "rollback"
    )
    boolean deduct(
        @BusinessActionContextParameter(paramName = "userId") Long userId,
        @BusinessActionContextParameter(paramName = "amount") BigDecimal amount
    );
    
    /**
     * Confirm：确认操作
     */
    boolean commit(BusinessActionContext context);
    
    /**
     * Cancel：取消操作
     */
    boolean rollback(BusinessActionContext context);
}
```

### TCC 实现

```java
/**
 * 账户 TCC 实现
 */
@Service
public class AccountTccServiceImpl implements AccountTccService {
    
    @Autowired
    private AccountMapper accountMapper;
    
    /**
     * Try：冻结金额
     */
    @Override
    public boolean deduct(Long userId, BigDecimal amount) {
        Account account = accountMapper.selectById(userId);
        
        // 检查余额
        if (account.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("余额不足");
        }
        
        // 扣减可用余额，增加冻结金额
        account.setBalance(account.getBalance().subtract(amount));
        account.setFrozenAmount(account.getFrozenAmount().add(amount));
        
        return accountMapper.updateById(account) > 0;
    }
    
    /**
     * Confirm：确认扣减
     */
    @Override
    public boolean commit(BusinessActionContext context) {
        Long userId = context.getActionContext("userId", Long.class);
        BigDecimal amount = context.getActionContext("amount", BigDecimal.class);
        
        Account account = accountMapper.selectById(userId);
        
        // 扣减冻结金额
        account.setFrozenAmount(account.getFrozenAmount().subtract(amount));
        
        return accountMapper.updateById(account) > 0;
    }
    
    /**
     * Cancel：释放冻结金额
     */
    @Override
    public boolean rollback(BusinessActionContext context) {
        Long userId = context.getActionContext("userId", Long.class);
        BigDecimal amount = context.getActionContext("amount", BigDecimal.class);
        
        Account account = accountMapper.selectById(userId);
        
        // 释放冻结金额
        account.setBalance(account.getBalance().add(amount));
        account.setFrozenAmount(account.getFrozenAmount().subtract(amount));
        
        return accountMapper.updateById(account) > 0;
    }
}
```

---

## 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Seata AT | 对业务无侵入、自动回滚 | 性能开销大、需要额外组件 | 强一致性要求 |
| 消息队列 | 性能好、解耦 | 最终一致性、需要处理重复消费 | 允许短暂不一致 |
| TCC | 灵活、性能好 | 业务侵入大、开发复杂 | 复杂业务场景 |
| 本地消息表 | 可靠性高 | 性能一般 | 通用场景 |

---

## 关键点总结

1. **Seata AT**：自动补偿，对业务无侵入
2. **消息队列**：最终一致性，性能好
3. **TCC**：三阶段提交，业务侵入大
4. **本地消息表**：保证消息可靠投递
5. **幂等性**：所有分布式事务都需要保证
6. **补偿机制**：失败时的补偿策略
7. **监控告警**：及时发现和处理异常

---

## 参考资料

- [Seata](https://seata.io/zh-cn/)
- [分布式事务](https://www.sofastack.tech/projects/sofa-jraft/consistency-raft-jraft/)

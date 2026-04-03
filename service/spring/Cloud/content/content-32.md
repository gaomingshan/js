# 第 32 章：分布式事务最佳实践

> **学习目标**：构建最终一致性落地方案、平衡一致性/可用性与复杂度、能够优化分布式事务性能  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. 性能优化

### 1.1 减少全局事务范围

**问题**：全局事务范围过大，性能差。

**优化**：

```java
// ❌ 错误：全局事务范围过大
@GlobalTransactional
public Order createOrder(OrderDTO dto) {
    // 非核心逻辑
    sendNotification(dto);
    logAudit(dto);
    
    // 核心逻辑
    Order order = saveOrder(dto);
    inventoryClient.deduct(dto);
    accountClient.deduct(dto);
    
    return order;
}

// ✅ 正确：缩小全局事务范围
public Order createOrder(OrderDTO dto) {
    // 非核心逻辑放在事务外
    sendNotification(dto);
    logAudit(dto);
    
    // 只在核心逻辑使用全局事务
    return createOrderWithTransaction(dto);
}

@GlobalTransactional
private Order createOrderWithTransaction(OrderDTO dto) {
    Order order = saveOrder(dto);
    inventoryClient.deduct(dto);
    accountClient.deduct(dto);
    return order;
}
```

### 1.2 异步处理

**使用事件驱动替代同步调用**：

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final StreamBridge streamBridge;
    
    @GlobalTransactional
    public Order createOrder(OrderDTO dto) {
        // 1. 核心事务逻辑
        Order order = saveOrder(dto);
        inventoryClient.deduct(dto);
        accountClient.deduct(dto);
        
        // 2. 发送事件（异步处理非核心逻辑）
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setOrderId(order.getId());
        streamBridge.send("order-created-out-0", event);
        
        return order;
    }
}

// 非核心服务异步消费
@Configuration
public class OrderEventConsumer {
    
    @Bean
    public Consumer<OrderCreatedEvent> orderCreatedConsumer() {
        return event -> {
            // 发送通知
            sendNotification(event);
            
            // 记录审计日志
            logAudit(event);
            
            // 积分计算
            calculatePoints(event);
        };
    }
}
```

### 1.3 批量处理

```java
@Service
public class OrderBatchService {
    
    @Autowired
    private OrderService orderService;
    
    /**
     * 批量创建订单
     */
    public List<Order> createOrdersBatch(List<OrderDTO> dtoList) {
        List<Order> orders = new ArrayList<>();
        
        // 分批处理（每批10个）
        List<List<OrderDTO>> batches = Lists.partition(dtoList, 10);
        
        for (List<OrderDTO> batch : batches) {
            List<Order> batchOrders = createOrdersBatchTransaction(batch);
            orders.addAll(batchOrders);
        }
        
        return orders;
    }
    
    @GlobalTransactional
    private List<Order> createOrdersBatchTransaction(List<OrderDTO> dtoList) {
        // 批量处理
        return dtoList.stream()
            .map(orderService::createOrderInternal)
            .collect(Collectors.toList());
    }
}
```

---

## 2. 最终一致性方案

### 2.1 本地消息表方案

**核心思想**：将业务操作和消息发送放在同一个本地事务中。

**数据库设计**：

```sql
-- 本地消息表
CREATE TABLE `local_message` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `message_id` VARCHAR(64) NOT NULL COMMENT '消息唯一ID',
    `topic` VARCHAR(100) NOT NULL COMMENT '消息主题',
    `payload` TEXT NOT NULL COMMENT '消息内容',
    `status` VARCHAR(20) NOT NULL COMMENT '状态：PENDING/SENT/FAILED',
    `retry_count` INT NOT NULL DEFAULT 0 COMMENT '重试次数',
    `max_retry` INT NOT NULL DEFAULT 3 COMMENT '最大重试次数',
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME,
    `send_time` DATETIME,
    UNIQUE KEY `uk_message_id` (`message_id`),
    KEY `idx_status_create_time` (`status`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**实现**：

```java
@Service
@Slf4j
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private LocalMessageRepository messageRepository;
    
    /**
     * 创建订单（本地事务）
     */
    @Transactional
    public Order createOrder(OrderDTO dto) {
        // 1. 创建订单
        Order order = new Order();
        order.setUserId(dto.getUserId());
        order.setAmount(dto.getAmount());
        order = orderRepository.save(order);
        
        // 2. 保存待发送消息（同一事务）
        LocalMessage message = new LocalMessage();
        message.setMessageId(UUID.randomUUID().toString());
        message.setTopic("order-created");
        message.setPayload(JSON.toJSONString(order));
        message.setStatus(MessageStatus.PENDING);
        message.setCreateTime(LocalDateTime.now());
        messageRepository.save(message);
        
        // 两步操作在同一本地事务中
        return order;
    }
}

/**
 * 定时任务：发送待发送的消息
 */
@Component
@Slf4j
public class LocalMessageSender {
    
    @Autowired
    private LocalMessageRepository messageRepository;
    
    @Autowired
    private StreamBridge streamBridge;
    
    @Scheduled(fixedDelay = 1000)
    public void sendPendingMessages() {
        // 查询待发送消息
        List<LocalMessage> messages = messageRepository
            .findByStatusAndRetryCountLessThan(
                MessageStatus.PENDING, 
                3  // 最大重试次数
            );
        
        for (LocalMessage message : messages) {
            try {
                // 发送消息
                streamBridge.send(message.getTopic(), message.getPayload());
                
                // 更新状态
                message.setStatus(MessageStatus.SENT);
                message.setSendTime(LocalDateTime.now());
                messageRepository.save(message);
                
                log.info("消息发送成功：messageId={}", message.getMessageId());
                
            } catch (Exception e) {
                // 更新重试次数
                message.setRetryCount(message.getRetryCount() + 1);
                
                if (message.getRetryCount() >= message.getMaxRetry()) {
                    message.setStatus(MessageStatus.FAILED);
                }
                
                messageRepository.save(message);
                
                log.error("消息发送失败：messageId={}, retryCount={}", 
                    message.getMessageId(), message.getRetryCount(), e);
            }
        }
    }
}
```

---

## 3. 事务消息模式设计

### 3.1 RocketMQ 事务消息

**原理**：

```
1. 发送半消息（Half Message）
2. 执行本地事务
3. 提交/回滚半消息
4. 消费者消费消息
5. 回查本地事务状态
```

**实现**：

```java
@Service
@Slf4j
public class OrderRocketMQService {
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    @Autowired
    private OrderRepository orderRepository;
    
    /**
     * 发送事务消息
     */
    public void createOrderWithTxMessage(OrderDTO dto) {
        // 发送事务消息
        Message<OrderDTO> message = MessageBuilder
            .withPayload(dto)
            .build();
        
        rocketMQTemplate.sendMessageInTransaction(
            "order-topic",
            message,
            dto  // 透传参数
        );
    }
}

/**
 * 事务监听器
 */
@RocketMQTransactionListener
@Slf4j
public class OrderTransactionListener implements RocketMQLocalTransactionListener {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private TransactionLogRepository transactionLogRepository;
    
    /**
     * 执行本地事务
     */
    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(
            Message message, Object arg) {
        
        OrderDTO dto = (OrderDTO) arg;
        String transactionId = (String) message.getHeaders().get("transactionId");
        
        try {
            // 1. 执行本地事务
            Order order = new Order();
            order.setUserId(dto.getUserId());
            order.setAmount(dto.getAmount());
            order = orderRepository.save(order);
            
            // 2. 记录事务日志
            TransactionLog txLog = new TransactionLog();
            txLog.setTransactionId(transactionId);
            txLog.setOrderId(order.getId());
            txLog.setStatus(TxStatus.COMMIT);
            transactionLogRepository.save(txLog);
            
            log.info("本地事务执行成功：orderId={}", order.getId());
            
            // 3. 提交半消息
            return RocketMQLocalTransactionState.COMMIT;
            
        } catch (Exception e) {
            log.error("本地事务执行失败", e);
            
            // 记录失败日志
            TransactionLog txLog = new TransactionLog();
            txLog.setTransactionId(transactionId);
            txLog.setStatus(TxStatus.ROLLBACK);
            transactionLogRepository.save(txLog);
            
            // 回滚半消息
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }
    
    /**
     * 回查本地事务状态
     */
    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(Message message) {
        String transactionId = (String) message.getHeaders().get("transactionId");
        
        log.info("回查本地事务状态：transactionId={}", transactionId);
        
        // 查询事务日志
        TransactionLog txLog = transactionLogRepository
            .findByTransactionId(transactionId)
            .orElse(null);
        
        if (txLog == null) {
            // 无记录，回滚
            return RocketMQLocalTransactionState.ROLLBACK;
        }
        
        // 根据日志状态返回
        if (txLog.getStatus() == TxStatus.COMMIT) {
            return RocketMQLocalTransactionState.COMMIT;
        } else {
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }
}
```

---

## 4. 本地消息表与定时补偿

### 4.1 定时补偿任务

```java
@Component
@Slf4j
public class TransactionCompensationJob {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private InventoryClient inventoryClient;
    
    /**
     * 补偿超时未完成的订单
     */
    @Scheduled(fixedDelay = 60000)  // 每分钟执行一次
    public void compensateTimeoutOrders() {
        log.info("开始补偿超时订单");
        
        // 查询超时订单（创建时间 > 30分钟，状态仍为 INIT）
        LocalDateTime timeoutThreshold = LocalDateTime.now().minusMinutes(30);
        
        List<Order> timeoutOrders = orderRepository
            .findByStatusAndCreateTimeBefore(OrderStatus.INIT, timeoutThreshold);
        
        for (Order order : timeoutOrders) {
            try {
                // 检查库存是否已扣减
                boolean inventoryDeducted = checkInventoryDeducted(order);
                
                if (inventoryDeducted) {
                    // 已扣减，恢复库存
                    inventoryClient.restore(order.getProductId(), order.getCount());
                }
                
                // 取消订单
                order.setStatus(OrderStatus.CANCELLED);
                order.setRemark("超时自动取消");
                orderRepository.save(order);
                
                log.info("订单补偿成功：orderId={}", order.getId());
                
            } catch (Exception e) {
                log.error("订单补偿失败：orderId={}", order.getId(), e);
            }
        }
    }
    
    private boolean checkInventoryDeducted(Order order) {
        // 查询库存扣减记录
        return false;  // 实际实现
    }
}
```

### 4.2 幂等性保证

```java
@Component
public class CompensationIdempotent {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    /**
     * 检查是否已补偿
     */
    public boolean isCompensated(Long orderId) {
        String key = "compensation:" + orderId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
    
    /**
     * 标记已补偿
     */
    public void markCompensated(Long orderId) {
        String key = "compensation:" + orderId;
        redisTemplate.opsForValue().set(key, "1", 7, TimeUnit.DAYS);
    }
}
```

---

## 5. Outbox 模式实践

### 5.1 Outbox 模式概念

**Outbox 模式**：将消息存储在业务数据库的 outbox 表中，通过 CDC（Change Data Capture）捕获并发送。

**架构**：

```
应用 → 业务数据库
         ↓ 写入 outbox 表
    CDC（Debezium）
         ↓ 监听变更
    Kafka Connect
         ↓ 发送消息
      Kafka
```

### 5.2 Outbox 表设计

```sql
CREATE TABLE `outbox` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `aggregate_type` VARCHAR(50) NOT NULL COMMENT '聚合类型',
    `aggregate_id` VARCHAR(64) NOT NULL COMMENT '聚合ID',
    `event_type` VARCHAR(50) NOT NULL COMMENT '事件类型',
    `payload` JSON NOT NULL COMMENT '事件内容',
    `create_time` DATETIME NOT NULL,
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 5.3 实现

```java
@Service
@Transactional
public class OrderOutboxService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OutboxRepository outboxRepository;
    
    public Order createOrder(OrderDTO dto) {
        // 1. 创建订单
        Order order = new Order();
        order.setUserId(dto.getUserId());
        order.setAmount(dto.getAmount());
        order = orderRepository.save(order);
        
        // 2. 写入 outbox 表
        Outbox outbox = new Outbox();
        outbox.setAggregateType("Order");
        outbox.setAggregateId(order.getId().toString());
        outbox.setEventType("OrderCreated");
        outbox.setPayload(JSON.toJSONString(order));
        outbox.setCreateTime(LocalDateTime.now());
        outboxRepository.save(outbox);
        
        // 两步操作在同一事务中
        return order;
    }
}
```

**Debezium 配置**：

```json
{
  "name": "order-outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "localhost",
    "database.port": "3306",
    "database.user": "root",
    "database.password": "root",
    "database.server.id": "1",
    "database.server.name": "order-db",
    "table.include.list": "order_db.outbox",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.route.topic.replacement": "${routedByValue}.events"
  }
}
```

---

## 6. 一致性监控与兜底策略

### 6.1 一致性监控

```java
@Component
@Slf4j
public class ConsistencyMonitor {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private InventoryClient inventoryClient;
    
    @Autowired
    private AccountClient accountClient;
    
    /**
     * 检查订单一致性
     */
    @Scheduled(fixedDelay = 300000)  // 每5分钟检查一次
    public void checkOrderConsistency() {
        log.info("开始检查订单一致性");
        
        // 查询最近1小时的已完成订单
        LocalDateTime startTime = LocalDateTime.now().minusHours(1);
        List<Order> orders = orderRepository
            .findByStatusAndCreateTimeAfter(OrderStatus.SUCCESS, startTime);
        
        for (Order order : orders) {
            try {
                // 检查库存是否扣减
                boolean inventoryOk = checkInventory(order);
                
                // 检查余额是否扣减
                boolean accountOk = checkAccount(order);
                
                if (!inventoryOk || !accountOk) {
                    // 数据不一致，发送告警
                    sendAlert("订单数据不一致", order);
                }
                
            } catch (Exception e) {
                log.error("一致性检查失败：orderId={}", order.getId(), e);
            }
        }
    }
    
    private boolean checkInventory(Order order) {
        // 调用库存服务查询扣减记录
        return true;  // 实际实现
    }
    
    private boolean checkAccount(Order order) {
        // 调用账户服务查询扣减记录
        return true;  // 实际实现
    }
    
    private void sendAlert(String title, Order order) {
        log.error("告警：{}, orderId={}", title, order.getId());
        // 发送钉钉/邮件告警
    }
}
```

### 6.2 兜底策略

```java
@Component
@Slf4j
public class ConsistencyRecovery {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private InventoryClient inventoryClient;
    
    @Autowired
    private AccountClient accountClient;
    
    /**
     * 兜底恢复
     */
    public void recover(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new BusinessException("订单不存在"));
        
        log.info("开始兜底恢复：orderId={}", orderId);
        
        try {
            // 1. 检查并补偿库存
            if (!checkInventory(order)) {
                inventoryClient.deduct(order.getProductId(), order.getCount());
            }
            
            // 2. 检查并补偿账户
            if (!checkAccount(order)) {
                accountClient.deduct(order.getUserId(), order.getAmount());
            }
            
            // 3. 更新订单状态
            order.setStatus(OrderStatus.SUCCESS);
            orderRepository.save(order);
            
            log.info("兜底恢复成功：orderId={}", orderId);
            
        } catch (Exception e) {
            log.error("兜底恢复失败：orderId={}", orderId, e);
            
            // 标记为需要人工处理
            order.setStatus(OrderStatus.MANUAL_CHECK);
            order.setRemark("兜底恢复失败：" + e.getMessage());
            orderRepository.save(order);
        }
    }
}
```

---

## 7. 分布式事务选型建议

### 7.1 选型矩阵

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 电商下单 | AT 模式 | 性能好，自动回滚 |
| 支付核心 | TCC 模式 | 精确控制，强一致性 |
| 长审批流程 | SAGA 模式 | 支持长事务，补偿机制 |
| 金融交易 | XA 模式 | 强一致性要求 |
| 非核心业务 | 最终一致性 + 消息 | 性能最优，成本最低 |

### 7.2 决策流程

```
1. 能否接受最终一致性？
   ├─ 否 → XA 模式
   └─ 是 ↓

2. 是否都是数据库操作？
   ├─ 是 → AT 模式
   └─ 否 ↓

3. 是否需要精确控制资源？
   ├─ 是 → TCC 模式
   └─ 否 ↓

4. 是否是长流程？
   ├─ 是 → SAGA 模式
   └─ 否 → 消息最终一致性
```

---

## 8. 常见问题排查

### 8.1 全局事务超时

**现象**：

```
io.seata.core.exception.GlobalTransactionException: 
Could not register branch into global session xid = xxx 
since global transaction status = TimeoutRollbacking
```

**排查**：

```bash
# 1. 查看全局事务超时配置
seata:
  client:
    tm:
      commit-retry-count: 5
      rollback-retry-count: 5
      default-global-transaction-timeout: 60000  # 增加超时时间

# 2. 查看 global_table
SELECT * FROM seata.global_table WHERE xid = 'xxx';

# 3. 检查慢SQL
SHOW PROCESSLIST;
```

### 8.2 分支事务注册失败

**现象**：

```
Could not register branch into global session
```

**排查**：

```
1. 检查 Seata Server 是否正常
2. 检查网络连接
3. 检查事务分组配置是否正确
4. 查看 branch_table
```

### 8.3 undo_log 未清理

**现象**：

```sql
SELECT COUNT(*) FROM undo_log;
-- 结果：大量残留记录
```

**原因**：
- 全局事务未正常完成
- Seata Server 异常

**处理**：

```sql
-- 清理7天前的 undo_log
DELETE FROM undo_log 
WHERE log_created < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

---

## 9. 生产环境配置建议

### 9.1 Seata Server 配置

```yaml
# 高可用配置
seata:
  server:
    # 会话存储模式
    session:
      mode: db  # 生产环境使用 db 模式
      db:
        datasource: druid
        db-type: mysql
        max-conn: 100
    
    # 锁存储模式
    lock:
      mode: db
    
    # 事务日志存储
    undo:
      log-save-days: 7
      log-delete-period: 86400000
```

### 9.2 客户端配置

```yaml
seata:
  enabled: true
  
  # 事务组
  tx-service-group: ${spring.application.name}_tx_group
  
  # 超时配置
  client:
    tm:
      default-global-transaction-timeout: 60000
      commit-retry-count: 5
      rollback-retry-count: 5
    
    rm:
      report-retry-count: 5
      table-meta-check-enable: true
      lock:
        retry-interval: 10
        retry-times: 30
  
  # 日志
  transport:
    enable-client-batch-send-request: true
```

---

## 10. 面试要点

**Q1：如何保证分布式事务的最终一致性？**

1. 本地消息表
2. 事务消息（RocketMQ）
3. Outbox 模式
4. 定时补偿

**Q2：如何优化分布式事务性能？**

1. 缩小事务范围
2. 异步处理
3. 批量操作
4. 选择合适的事务模式

**Q3：什么是 Outbox 模式？**

将消息存储在业务数据库，通过 CDC 捕获并发送，保证本地事务和消息发送的原子性。

**Q4：如何监控分布式事务？**

1. 监控全局事务状态
2. 检查数据一致性
3. 设置告警
4. 定时补偿

**Q5：生产环境如何选择事务方案？**

根据业务场景、一致性要求、性能要求、开发成本综合考虑。

---

## 11. 参考资料

**官方文档**：
- [Seata 官方文档](https://seata.io/zh-cn/)
- [分布式事务最佳实践](https://seata.io/zh-cn/docs/dev/mode/at-mode.html)

---

**分布式事务部分完成！下一章预告**：第 33 章将开始学习 OpenTelemetry 统一可观测性标准，包括三大可观测性信号（Traces/Metrics/Logs）、OTel Java Agent 自动埋点、OTel Collector、多后端导出器等内容。

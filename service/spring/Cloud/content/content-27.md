# 第27章：Seata 分布式事务快速入门

> **本章目标**：掌握 Seata 分布式事务解决方案，保证微服务数据一致性

---

## 1. 分布式事务问题

**场景**：用户下单
```
1. Order Service：创建订单
2. Inventory Service：扣减库存
3. Account Service：扣减余额

问题：如何保证三个操作要么全部成功，要么全部失败？
```

**传统方案**：
- ❌ 本地事务：无法跨服务
- ❌ 2PC/3PC：性能差、强依赖协调者
- ❌ TCC：代码侵入性强

**Seata 方案**：
- ✅ AT 模式：自动补偿，无代码侵入
- ✅ TCC 模式：高性能，需手动实现
- ✅ SAGA 模式：长事务
- ✅ XA 模式：强一致性

---

## 2. Seata 架构

**核心组件**：
- **TC（Transaction Coordinator）**：事务协调器，Seata Server
- **TM（Transaction Manager）**：事务管理器，发起全局事务
- **RM（Resource Manager）**：资源管理器，参与分支事务

**工作流程（AT 模式）**：
```
1. TM 向 TC 注册全局事务
2. RM 向 TC 注册分支事务
3. 执行业务逻辑，记录 undo_log
4. TM 向 TC 发起全局提交/回滚
5. TC 通知所有 RM 提交/回滚
6. RM 提交或使用 undo_log 回滚
```

---

## 3. 快速入门

### 3.1 启动 Seata Server

**Docker 启动**：
```bash
docker run -d --name seata-server \
  -p 8091:8091 \
  -e SEATA_IP=192.168.1.100 \
  seataio/seata-server:1.6.0
```

### 3.2 引入依赖

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

### 3.3 配置

**application.yml**：
```yaml
seata:
  tx-service-group: my_tx_group
  service:
    vgroup-mapping:
      my_tx_group: default
    grouplist:
      default: localhost:8091
```

### 3.4 创建 undo_log 表

```sql
CREATE TABLE `undo_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(100) NOT NULL,
  `context` varchar(128) NOT NULL,
  `rollback_info` longblob NOT NULL,
  `log_status` int(11) NOT NULL,
  `log_created` datetime NOT NULL,
  `log_modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

---

## 4. AT 模式使用

### 4.1 TM（发起方）

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private InventoryClient inventoryClient;
    
    @Autowired
    private AccountClient accountClient;
    
    @GlobalTransactional  // 开启全局事务
    public void createOrder(OrderDTO orderDTO) {
        // 1. 创建订单
        orderMapper.insert(orderDTO);
        
        // 2. 扣减库存（远程调用）
        inventoryClient.deduct(orderDTO.getProductId(), orderDTO.getQuantity());
        
        // 3. 扣减余额（远程调用）
        accountClient.deduct(orderDTO.getUserId(), orderDTO.getAmount());
    }
}
```

### 4.2 RM（参与方）

**Inventory Service**：
```java
@Service
public class InventoryService {
    
    @Autowired
    private InventoryMapper inventoryMapper;
    
    public void deduct(Long productId, Integer quantity) {
        inventoryMapper.deduct(productId, quantity);
    }
}
```

**Account Service**：
```java
@Service
public class AccountService {
    
    @Autowired
    private AccountMapper accountMapper;
    
    public void deduct(Long userId, BigDecimal amount) {
        accountMapper.deduct(userId, amount);
    }
}
```

---

## 5. 异常处理

### 5.1 自动回滚

```java
@GlobalTransactional
public void createOrder(OrderDTO orderDTO) {
    orderMapper.insert(orderDTO);
    inventoryClient.deduct(orderDTO.getProductId(), orderDTO.getQuantity());
    
    // 余额不足，抛出异常
    accountClient.deduct(orderDTO.getUserId(), orderDTO.getAmount());
    // 自动回滚：删除订单、恢复库存
}
```

### 5.2 手动回滚

```java
@GlobalTransactional
public void createOrder(OrderDTO orderDTO) {
    try {
        orderMapper.insert(orderDTO);
        inventoryClient.deduct(orderDTO.getProductId(), orderDTO.getQuantity());
        accountClient.deduct(orderDTO.getUserId(), orderDTO.getAmount());
    } catch (Exception e) {
        // 手动标记回滚
        GlobalTransactionContext.reload(RootContext.getXID()).rollback();
        throw e;
    }
}
```

---

## 6. TCC 模式（简介）

**三阶段**：
- **Try**：预留资源
- **Confirm**：确认提交
- **Cancel**：取消回滚

**实现**：
```java
@LocalTCC
public interface InventoryTccAction {
    
    @TwoPhaseBusinessAction(name = "deduct", commitMethod = "confirm", rollbackMethod = "cancel")
    boolean deduct(@BusinessActionContextParameter(paramName = "productId") Long productId,
                   @BusinessActionContextParameter(paramName = "quantity") Integer quantity);
    
    boolean confirm(BusinessActionContext context);
    
    boolean cancel(BusinessActionContext context);
}
```

**特点**：
- ✅ 高性能
- ❌ 代码侵入性强
- 适用场景：性能要求高的核心业务

---

## 7. 实战建议

### 7.1 适用场景

**适合使用 Seata**：
- ✅ 强一致性要求（订单、支付、库存）
- ✅ 操作步骤少（2-5个服务）
- ✅ 并发量中等（< 1000 TPS）

**不适合使用 Seata**：
- ❌ 最终一致性即可（使用消息队列）
- ❌ 步骤多、链路长（使用 SAGA）
- ❌ 超高并发（> 10000 TPS）

### 7.2 性能优化

```yaml
seata:
  enable-auto-data-source-proxy: true  # 自动代理数据源
  
  client:
    rm:
      async-commit-buffer-limit: 10000  # 异步提交缓冲
      report-retry-count: 5
    tm:
      commit-retry-count: 5
      rollback-retry-count: 5
```

---

## 8. 学习自检清单

- [ ] 理解分布式事务问题
- [ ] 理解 Seata 架构（TC、TM、RM）
- [ ] 掌握 AT 模式使用
- [ ] 了解 TCC 模式
- [ ] 理解适用场景
- [ ] 掌握异常处理

---

**本章小结**：
- Seata 是分布式事务解决方案
- 核心组件：TC（协调器）、TM（发起方）、RM（参与方）
- AT 模式：自动补偿，无代码侵入，适合大部分场景
- TCC 模式：高性能，需手动实现 Try/Confirm/Cancel
- 使用 @GlobalTransactional 开启全局事务
- 异常自动回滚，使用 undo_log 恢复数据
- 适用场景：强一致性、中等并发

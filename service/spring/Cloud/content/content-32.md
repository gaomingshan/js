# 第32章：Seata 分布式事务深入

> **本章目标**：深入理解 Seata 分布式事务原理，掌握 AT、TCC、SAGA 模式及生产实践

---

## 1. Seata 架构深入

### 1.1 核心组件

**TC（Transaction Coordinator）**：
- 维护全局事务状态
- 驱动全局事务提交/回滚
- Seata Server

**TM（Transaction Manager）**：
- 定义全局事务边界
- 发起全局事务
- 应用服务（使用 @GlobalTransactional）

**RM（Resource Manager）**：
- 管理分支事务资源
- 注册分支事务
- 执行分支事务提交/回滚
- 应用服务（数据源代理）

**交互流程**：
```
1. TM 向 TC 注册全局事务 → 返回 XID
2. TM 将 XID 传播到下游服务
3. RM 向 TC 注册分支事务
4. RM 执行业务 SQL
5. TM 决定提交/回滚 → 通知 TC
6. TC 通知所有 RM 提交/回滚
```

---

### 1.2 数据模型

**全局事务表（global_table）**：
```sql
CREATE TABLE `global_table` (
  `xid` VARCHAR(128) NOT NULL PRIMARY KEY,
  `transaction_id` BIGINT,
  `status` TINYINT NOT NULL,
  `application_id` VARCHAR(32),
  `transaction_service_group` VARCHAR(32),
  `transaction_name` VARCHAR(128),
  `timeout` INT,
  `begin_time` BIGINT,
  `application_data` VARCHAR(2000),
  `gmt_create` DATETIME,
  `gmt_modified` DATETIME
);
```

**分支事务表（branch_table）**：
```sql
CREATE TABLE `branch_table` (
  `branch_id` BIGINT NOT NULL PRIMARY KEY,
  `xid` VARCHAR(128) NOT NULL,
  `transaction_id` BIGINT,
  `resource_group_id` VARCHAR(32),
  `resource_id` VARCHAR(256),
  `branch_type` VARCHAR(8),
  `status` TINYINT,
  `client_id` VARCHAR(64),
  `application_data` VARCHAR(2000),
  `gmt_create` DATETIME,
  `gmt_modified` DATETIME,
  KEY idx_xid (`xid`)
);
```

**锁表（lock_table）**：
```sql
CREATE TABLE `lock_table` (
  `row_key` VARCHAR(128) NOT NULL PRIMARY KEY,
  `xid` VARCHAR(128),
  `transaction_id` BIGINT,
  `branch_id` BIGINT NOT NULL,
  `resource_id` VARCHAR(256),
  `table_name` VARCHAR(32),
  `pk` VARCHAR(36),
  `status` TINYINT NOT NULL DEFAULT 0,
  `gmt_create` DATETIME,
  `gmt_modified` DATETIME,
  KEY idx_branch_id (`branch_id`),
  KEY idx_xid (`xid`)
);
```

---

## 2. AT 模式深入

### 2.1 工作原理

**两阶段提交**：

**Phase 1（分支注册与执行）**：
```
1. 解析 SQL → 生成前后镜像
2. 执行业务 SQL
3. 记录 undo_log（前后镜像）
4. 提交本地事务（释放锁）
5. 向 TC 注册分支事务
6. 获取全局锁（异步）
```

**Phase 2（提交/回滚）**：
```
提交：异步删除 undo_log
回滚：使用 undo_log 恢复数据 → 删除 undo_log
```

---

### 2.2 undo_log 结构

**表结构**：
```sql
CREATE TABLE `undo_log` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT(20) NOT NULL,
  `xid` VARCHAR(100) NOT NULL,
  `context` VARCHAR(128) NOT NULL,
  `rollback_info` LONGBLOB NOT NULL,  -- 回滚数据
  `log_status` INT(11) NOT NULL,  -- 0:normal 1:防御性
  `log_created` DATETIME NOT NULL,
  `log_modified` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

**rollback_info 内容**：
```json
{
  "beforeImage": {
    "tableName": "order",
    "rows": [{
      "fields": [
        {"name": "id", "type": "BIGINT", "value": 1},
        {"name": "status", "type": "INT", "value": 0}
      ]
    }]
  },
  "afterImage": {
    "tableName": "order",
    "rows": [{
      "fields": [
        {"name": "id", "type": "BIGINT", "value": 1},
        {"name": "status", "type": "INT", "value": 1}
      ]
    }]
  }
}
```

---

### 2.3 数据源代理

**自动代理数据源**：
```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        return new DruidDataSource();
    }
    
    @Bean
    @Primary
    public DataSourceProxy dataSourceProxy(DataSource dataSource) {
        // Seata 数据源代理
        return new DataSourceProxy(dataSource);
    }
}
```

**代理执行流程**：
```java
// DataSourceProxy 伪代码
public class DataSourceProxy extends AbstractDataSourceProxy {
    
    @Override
    public Connection getConnection() {
        Connection connection = targetDataSource.getConnection();
        return new ConnectionProxy(this, connection);
    }
}

public class ConnectionProxy extends AbstractConnectionProxy {
    
    @Override
    public PreparedStatement prepareStatement(String sql) {
        PreparedStatement statement = targetConnection.prepareStatement(sql);
        return new PreparedStatementProxy(this, statement, sql);
    }
}

public class PreparedStatementProxy extends AbstractPreparedStatementProxy {
    
    @Override
    public boolean execute() {
        // 1. 解析 SQL
        SQLRecognizer recognizer = SQLVisitorFactory.get(sql);
        
        // 2. 查询前镜像
        TableRecords beforeImage = queryBeforeImage();
        
        // 3. 执行业务 SQL
        boolean result = targetStatement.execute();
        
        // 4. 查询后镜像
        TableRecords afterImage = queryAfterImage();
        
        // 5. 生成 undo_log
        UndoLog undoLog = new UndoLog();
        undoLog.setBeforeImage(beforeImage);
        undoLog.setAfterImage(afterImage);
        
        // 6. 插入 undo_log
        insertUndoLog(undoLog);
        
        return result;
    }
}
```

---

### 2.4 全局锁机制

**作用**：防止脏写

**加锁流程**：
```
1. 执行业务 SQL
2. 提交本地事务
3. 向 TC 申请全局锁（异步）
4. TC 检查 lock_table
5. 如果无冲突 → 加锁成功
6. 如果有冲突 → 等待或失败
```

**锁冲突示例**：
```
事务 A（XID=1）：
UPDATE order SET status=1 WHERE id=1

事务 B（XID=2）：
UPDATE order SET status=2 WHERE id=1  ← 等待事务A的全局锁
```

**避免死锁**：
- 全局锁超时自动释放
- 支持锁重试

---

## 3. TCC 模式深入

### 3.1 TCC 原理

**三阶段**：

**Try**：预留资源
```
冻结资源，不实际扣减
例如：账户余额 100 → 冻结 50 → 可用余额 50
```

**Confirm**：提交事务
```
确认扣减冻结资源
例如：扣减冻结金额 50 → 余额 50
```

**Cancel**：回滚事务
```
释放冻结资源
例如：释放冻结金额 50 → 可用余额 100
```

---

### 3.2 TCC 实现

**账户服务**：
```java
@LocalTCC
public interface AccountTccAction {
    
    /**
     * Try：冻结金额
     */
    @TwoPhaseBusinessAction(
        name = "deduct",
        commitMethod = "confirm",
        rollbackMethod = "cancel"
    )
    boolean deduct(
        @BusinessActionContextParameter(paramName = "userId") Long userId,
        @BusinessActionContextParameter(paramName = "amount") BigDecimal amount
    );
    
    /**
     * Confirm：扣减冻结金额
     */
    boolean confirm(BusinessActionContext context);
    
    /**
     * Cancel：释放冻结金额
     */
    boolean cancel(BusinessActionContext context);
}
```

**实现类**：
```java
@Service
public class AccountTccActionImpl implements AccountTccAction {
    
    @Autowired
    private AccountMapper accountMapper;
    
    @Autowired
    private AccountFreezeMapper freezeMapper;
    
    @Override
    public boolean deduct(Long userId, BigDecimal amount) {
        // 1. 检查余额是否足够
        Account account = accountMapper.selectById(userId);
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException();
        }
        
        // 2. 冻结金额
        AccountFreeze freeze = new AccountFreeze();
        freeze.setUserId(userId);
        freeze.setAmount(amount);
        freeze.setXid(RootContext.getXID());
        freeze.setState(FreezeState.TRY);
        freezeMapper.insert(freeze);
        
        // 3. 扣减可用余额
        accountMapper.decreaseBalance(userId, amount);
        
        return true;
    }
    
    @Override
    public boolean confirm(BusinessActionContext context) {
        // 1. 获取参数
        Long userId = context.getActionContext("userId", Long.class);
        BigDecimal amount = context.getActionContext("amount", BigDecimal.class);
        String xid = context.getXid();
        
        // 2. 查询冻结记录
        AccountFreeze freeze = freezeMapper.selectByXid(xid);
        
        // 3. 幂等性检查
        if (freeze == null || freeze.getState() == FreezeState.CONFIRM) {
            return true;
        }
        
        // 4. 更新冻结记录状态
        freezeMapper.updateState(xid, FreezeState.CONFIRM);
        
        return true;
    }
    
    @Override
    public boolean cancel(BusinessActionContext context) {
        // 1. 获取参数
        Long userId = context.getActionContext("userId", Long.class);
        BigDecimal amount = context.getActionContext("amount", BigDecimal.class);
        String xid = context.getXid();
        
        // 2. 查询冻结记录
        AccountFreeze freeze = freezeMapper.selectByXid(xid);
        
        // 3. 幂等性检查
        if (freeze == null || freeze.getState() == FreezeState.CANCEL) {
            return true;
        }
        
        // 4. 恢复余额
        accountMapper.increaseBalance(userId, amount);
        
        // 5. 删除冻结记录
        freezeMapper.deleteByXid(xid);
        
        return true;
    }
}
```

**数据库设计**：
```sql
-- 账户表
CREATE TABLE `account` (
  `id` BIGINT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `balance` DECIMAL(10,2) NOT NULL,
  `frozen` DECIMAL(10,2) NOT NULL DEFAULT 0,
  UNIQUE KEY uk_user_id (user_id)
);

-- 冻结记录表
CREATE TABLE `account_freeze` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `xid` VARCHAR(128) NOT NULL,
  `state` TINYINT NOT NULL,  -- 0:TRY 1:CONFIRM 2:CANCEL
  `create_time` DATETIME NOT NULL,
  UNIQUE KEY uk_xid (xid)
);
```

---

### 3.3 TCC 注意事项

**空回滚**：
```
问题：Try 阶段失败，但仍然调用 Cancel
解决：Cancel 检查 Try 是否执行，如果未执行则直接返回成功
```

**幂等性**：
```
问题：Confirm/Cancel 可能重复调用
解决：记录执行状态，重复调用直接返回成功
```

**悬挂**：
```
问题：Cancel 先于 Try 执行
解决：Cancel 时记录状态，Try 时检查状态
```

---

## 4. SAGA 模式

### 4.1 SAGA 原理

**正向服务 + 补偿服务**：
```
正向：T1 → T2 → T3
补偿：C3 → C2 → C1

成功：T1 → T2 → T3 → 提交
失败：T1 → T2 → T3失败 → C3 → C2 → C1 → 回滚
```

---

### 4.2 状态机配置

**JSON 定义**：
```json
{
  "name": "orderSaga",
  "states": [
    {
      "name": "createOrder",
      "type": "ServiceTask",
      "serviceType": "http",
      "serviceMethod": "POST",
      "url": "http://order-service/order/create",
      "compensateUrl": "http://order-service/order/cancel",
      "next": "deductInventory"
    },
    {
      "name": "deductInventory",
      "type": "ServiceTask",
      "serviceType": "http",
      "serviceMethod": "POST",
      "url": "http://inventory-service/inventory/deduct",
      "compensateUrl": "http://inventory-service/inventory/restore",
      "next": "deductAccount"
    },
    {
      "name": "deductAccount",
      "type": "ServiceTask",
      "serviceType": "http",
      "serviceMethod": "POST",
      "url": "http://account-service/account/deduct",
      "compensateUrl": "http://account-service/account/restore",
      "isEnd": true
    }
  ]
}
```

---

### 4.3 SAGA 适用场景

**优势**：
- 长事务支持
- 无锁，高性能
- 适合异构系统

**劣势**：
- 最终一致性
- 需要设计补偿逻辑

**适用场景**：
- 长时间运行的业务流程
- 跨多个系统的事务
- 对性能要求高的场景

---

## 5. XA 模式

### 5.1 XA 原理

**两阶段提交（2PC）**：
```
Phase 1：准备阶段
- TM 发送 prepare 请求
- RM 执行事务但不提交
- RM 返回 yes/no

Phase 2：提交阶段
- 全部返回 yes → TM 发送 commit
- 任一返回 no → TM 发送 rollback
```

---

### 5.2 XA 配置

**数据源配置**：
```java
@Configuration
public class XADataSourceConfig {
    
    @Bean
    public DataSource dataSource() {
        // 使用支持 XA 的数据源
        MysqlXADataSource xaDataSource = new MysqlXADataSource();
        xaDataSource.setUrl("jdbc:mysql://localhost:3306/seata");
        xaDataSource.setUser("root");
        xaDataSource.setPassword("password");
        
        return new DataSourceProxy(xaDataSource, DataSourceProxy.XA_DATA_SOURCE);
    }
}
```

---

### 5.3 XA vs AT

| 维度 | XA | AT |
|------|----|----|
| **一致性** | 强一致 | 最终一致 |
| **性能** | 低（持锁） | 高（无锁） |
| **侵入性** | 低 | 低 |
| **数据库支持** | 需要 XA | 普通数据库 |

**推荐**：优先使用 AT 模式

---

## 6. 生产最佳实践

### 6.1 Seata Server 高可用

**集群部署**：
```yaml
# application.yml
seata:
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: public
      group: SEATA_GROUP
  
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: localhost:8848
      namespace: public
      cluster: default
```

**部署架构**：
```
Nacos 注册中心
    ↓
┌──────────┬──────────┬──────────┐
│ Seata-1  │ Seata-2  │ Seata-3  │ (集群)
└──────────┴──────────┴──────────┘
    ↓
MySQL (存储全局事务、分支事务、锁)
```

---

### 6.2 性能优化

**异步提交**：
```yaml
seata:
  client:
    rm:
      async-commit-buffer-limit: 10000  # 异步提交缓冲大小
```

**批量提交**：
```yaml
seata:
  server:
    undo:
      log-delete-period: 86400000  # undo_log 删除周期（毫秒）
```

**数据库连接池**：
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 50
      minimum-idle: 10
```

---

### 6.3 监控告警

**Prometheus 指标**：
```yaml
seata:
  enabled: true
  application-id: ${spring.application.name}
  enable-auto-data-source-proxy: true
```

**关键指标**：
```
# 全局事务数
seata_transaction_total

# 分支事务数
seata_branch_transaction_total

# 事务耗时
seata_transaction_duration_seconds

# 事务状态
seata_transaction_status{status="committed|rollback|timeout"}
```

---

## 7. 常见问题

### 7.1 脏读问题

**问题**：AT 模式提交本地事务后，全局事务可能回滚，其他事务读到中间状态。

**解决方案**：
```java
// 使用 @GlobalLock + SELECT FOR UPDATE
@GlobalLock
@Transactional
public void query(Long id) {
    Order order = orderMapper.selectByIdForUpdate(id);
    // 如果存在全局锁，等待全局事务完成
}
```

---

### 7.2 超时问题

**配置超时时间**：
```yaml
seata:
  client:
    tm:
      default-global-transaction-timeout: 60000  # 全局事务超时（毫秒）
    rm:
      branch-transaction-timeout: 60000  # 分支事务超时
```

---

### 7.3 锁冲突问题

**减少锁冲突**：
- 缩小事务范围
- 避免长事务
- 优化业务逻辑

---

## 8. 学习自检清单

- [ ] 理解 Seata 核心架构（TC、TM、RM）
- [ ] 掌握 AT 模式原理（undo_log、全局锁）
- [ ] 掌握 TCC 模式实现（Try/Confirm/Cancel）
- [ ] 了解 SAGA 模式
- [ ] 了解 XA 模式
- [ ] 掌握 Seata Server 高可用部署
- [ ] 掌握性能优化技巧
- [ ] 能够配置监控告警
- [ ] 能够解决常见问题

---

## 9. 面试高频题

**Q1：AT 模式如何保证数据一致性？**

**参考答案**：
1. 记录 undo_log（前后镜像）
2. 提交本地事务
3. 获取全局锁（防止脏写）
4. 全局提交：删除 undo_log
5. 全局回滚：使用 undo_log 恢复数据

**Q2：TCC vs AT？**

| 维度 | TCC | AT |
|------|-----|----|
| 性能 | 高 | 中 |
| 侵入性 | 高 | 低 |
| 一致性 | 最终一致 | 最终一致 |
| 适用场景 | 高并发核心业务 | 通用业务 |

**Q3：如何选择分布式事务方案？**

**参考答案**：
- 强一致性 + 低并发：XA
- 最终一致性 + 中并发：AT
- 最终一致性 + 高并发：TCC
- 长事务 + 异构系统：SAGA
- 异步解耦：消息队列 + 最终一致性

---

**本章小结**：
- Seata 架构：TC、TM、RM 三大组件
- AT 模式：自动补偿、undo_log、全局锁
- TCC 模式：Try/Confirm/Cancel、手动实现、高性能
- SAGA 模式：长事务、状态机、补偿
- XA 模式：强一致性、两阶段提交
- 生产实践：高可用部署、性能优化、监控告警
- 常见问题：脏读、超时、锁冲突

**下一章预告**：第33章 - 微服务安全架构

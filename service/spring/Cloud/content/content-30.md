# 第 30 章：Seata 分布式事务快速入门

> **学习目标**：掌握 Seata 快速接入、理解 AT 模式原理、能够实现分布式事务  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. Seata Server 部署

### 1.1 Seata 简介

**Seata**（Simple Extensible Autonomous Transaction Architecture）是阿里巴巴开源的分布式事务解决方案。

**核心组件**：
- **TC（Transaction Coordinator）**：事务协调器，维护全局事务和分支事务的状态，驱动全局事务提交或回滚
- **TM（Transaction Manager）**：事务管理器，定义全局事务的范围，开始、提交或回滚全局事务
- **RM（Resource Manager）**：资源管理器，管理分支事务处理的资源，与 TC 通信注册分支事务和报告分支事务状态

**事务模式**：
- ✅ AT 模式（自动事务）
- ✅ TCC 模式（补偿事务）
- ✅ SAGA 模式（长事务）
- ✅ XA 模式（强一致性）

### 1.2 下载 Seata Server

```bash
# 下载 Seata Server 1.6.1
wget https://github.com/seata/seata/releases/download/v1.6.1/seata-server-1.6.1.zip

# 解压
unzip seata-server-1.6.1.zip
cd seata
```

### 1.3 配置 Seata Server

**修改配置文件**（`conf/application.yml`）：

```yaml
server:
  port: 7091

spring:
  application:
    name: seata-server

logging:
  config: classpath:logback-spring.xml
  file:
    path: ${user.home}/logs/seata

console:
  user:
    username: seata
    password: seata

seata:
  config:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      namespace:
      group: SEATA_GROUP
      username: nacos
      password: nacos
      data-id: seataServer.properties
  
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      group: SEATA_GROUP
      namespace:
      username: nacos
      password: nacos
      cluster: default
  
  store:
    mode: db
    db:
      datasource: druid
      db-type: mysql
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://localhost:3306/seata?useSSL=false&serverTimezone=Asia/Shanghai
      user: root
      password: root
      min-conn: 5
      max-conn: 100
      global-table: global_table
      branch-table: branch_table
      lock-table: lock_table
      distributed-lock-table: distributed_lock
      query-limit: 100
      max-wait: 5000
```

### 1.4 初始化数据库

**创建 Seata 数据库**：

```sql
CREATE DATABASE seata DEFAULT CHARACTER SET utf8mb4;
```

**创建表结构**（`script/server/db/mysql.sql`）：

```sql
-- global_table
CREATE TABLE IF NOT EXISTS `global_table`
(
    `xid`                       VARCHAR(128) NOT NULL,
    `transaction_id`            BIGINT,
    `status`                    TINYINT      NOT NULL,
    `application_id`            VARCHAR(32),
    `transaction_service_group` VARCHAR(32),
    `transaction_name`          VARCHAR(128),
    `timeout`                   INT,
    `begin_time`                BIGINT,
    `application_data`          VARCHAR(2000),
    `gmt_create`                DATETIME,
    `gmt_modified`              DATETIME,
    PRIMARY KEY (`xid`),
    KEY `idx_status_gmt_modified` (`status` , `gmt_modified`),
    KEY `idx_transaction_id` (`transaction_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- branch_table
CREATE TABLE IF NOT EXISTS `branch_table`
(
    `branch_id`         BIGINT       NOT NULL,
    `xid`               VARCHAR(128) NOT NULL,
    `transaction_id`    BIGINT,
    `resource_group_id` VARCHAR(32),
    `resource_id`       VARCHAR(256),
    `branch_type`       VARCHAR(8),
    `status`            TINYINT,
    `client_id`         VARCHAR(64),
    `application_data`  VARCHAR(2000),
    `gmt_create`        DATETIME(6),
    `gmt_modified`      DATETIME(6),
    PRIMARY KEY (`branch_id`),
    KEY `idx_xid` (`xid`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- lock_table
CREATE TABLE IF NOT EXISTS `lock_table`
(
    `row_key`        VARCHAR(128) NOT NULL,
    `xid`            VARCHAR(128),
    `transaction_id` BIGINT,
    `branch_id`      BIGINT       NOT NULL,
    `resource_id`    VARCHAR(256),
    `table_name`     VARCHAR(32),
    `pk`             VARCHAR(36),
    `status`         TINYINT      NOT NULL DEFAULT '0' COMMENT '0:locked ,1:rollbacking',
    `gmt_create`     DATETIME,
    `gmt_modified`   DATETIME,
    PRIMARY KEY (`row_key`),
    KEY `idx_status` (`status`),
    KEY `idx_branch_id` (`branch_id`),
    KEY `idx_xid` (`xid`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- distributed_lock
CREATE TABLE IF NOT EXISTS `distributed_lock`
(
    `lock_key`   CHAR(20) NOT NULL,
    `lock_value` VARCHAR(20) NOT NULL,
    `expire`     BIGINT,
    PRIMARY KEY (`lock_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('AsyncCommitting', ' ', 0);
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('RetryCommitting', ' ', 0);
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('RetryRollbacking', ' ', 0);
INSERT INTO `distributed_lock` (lock_key, lock_value, expire) VALUES ('TxTimeoutCheck', ' ', 0);
```

### 1.5 启动 Seata Server

```bash
# Linux/Mac
sh bin/seata-server.sh

# Windows
bin\seata-server.bat

# 指定端口启动
sh bin/seata-server.sh -p 8091

# 查看日志
tail -f logs/seata-server.log
```

**访问控制台**：http://localhost:7091
- 用户名：seata
- 密码：seata

---

## 2. AT 模式快速入门

### 2.1 AT 模式原理

**AT 模式**（Automatic Transaction）是 Seata 的默认模式，基于本地 ACID 事务的关系型数据库。

**工作流程**：

```
一阶段：
1. TM 开启全局事务（获取全局 XID）
2. RM 执行本地事务
   - 解析 SQL，生成前镜像（BeforeImage）
   - 执行 SQL
   - 生成后镜像（AfterImage）
   - 提交本地事务
   - 向 TC 注册分支事务
3. TM 决定提交或回滚

二阶段：
提交：
- RM 异步删除 undo_log（前镜像和后镜像）

回滚：
- RM 收到回滚请求
- 生成反向 SQL（根据前镜像）
- 执行反向 SQL
- 删除 undo_log
```

### 2.2 添加依赖

```xml
<dependencies>
    <!-- Seata Spring Boot Starter -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
    </dependency>
    
    <!-- Nacos Discovery -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
</dependencies>
```

### 2.3 配置

**订单服务配置**：

```yaml
spring:
  application:
    name: order-service
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
  
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/order_db?useSSL=false
    username: root
    password: root

seata:
  enabled: true
  application-id: ${spring.application.name}
  tx-service-group: default_tx_group
  
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
      group: SEATA_GROUP
      namespace:
      username: nacos
      password: nacos
  
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: localhost:8848
      group: SEATA_GROUP
      namespace:
      username: nacos
      password: nacos
      cluster: default
  
  service:
    vgroup-mapping:
      default_tx_group: default
    disable-global-transaction: false
```

---

## 3. @GlobalTransactional 注解

### 3.1 基础使用

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final AccountClient accountClient;
    
    /**
     * 创建订单（分布式事务）
     */
    @GlobalTransactional(
        name = "create-order",
        rollbackFor = Exception.class,
        timeoutMills = 30000
    )
    public Order createOrder(OrderDTO dto) {
        log.info("开始创建订单：{}", dto);
        
        // 1. 创建订单
        Order order = new Order();
        order.setUserId(dto.getUserId());
        order.setProductId(dto.getProductId());
        order.setCount(dto.getCount());
        order.setAmount(dto.getAmount());
        order.setStatus(OrderStatus.INIT);
        order = orderRepository.save(order);
        
        log.info("订单创建成功：{}", order.getId());
        
        // 2. 扣减库存（远程调用）
        Result<Void> inventoryResult = inventoryClient.deduct(
            dto.getProductId(), 
            dto.getCount()
        );
        
        if (!inventoryResult.isSuccess()) {
            throw new BusinessException("库存扣减失败：" + inventoryResult.getMessage());
        }
        
        log.info("库存扣减成功");
        
        // 3. 扣减账户余额（远程调用）
        Result<Void> accountResult = accountClient.deduct(
            dto.getUserId(), 
            dto.getAmount()
        );
        
        if (!accountResult.isSuccess()) {
            throw new BusinessException("余额扣减失败：" + accountResult.getMessage());
        }
        
        log.info("余额扣减成功");
        
        // 4. 更新订单状态
        order.setStatus(OrderStatus.SUCCESS);
        orderRepository.save(order);
        
        log.info("订单处理完成");
        
        return order;
    }
}
```

### 3.2 @GlobalTransactional 属性

```java
@GlobalTransactional(
    // 事务名称
    name = "create-order",
    
    // 超时时间（毫秒）
    timeoutMills = 30000,
    
    // 回滚的异常
    rollbackFor = {Exception.class},
    
    // 不回滚的异常
    noRollbackFor = {IllegalArgumentException.class},
    
    // 传播行为
    propagation = Propagation.REQUIRED,
    
    // 锁重试间隔（毫秒）
    lockRetryInterval = 10,
    
    // 锁重试次数
    lockRetryTimes = 30
)
public void method() {
    // ...
}
```

---

## 4. 事务分组配置

### 4.1 事务分组概念

**事务分组**：逻辑上的分组，用于区分不同的业务场景。

**配置映射**：

```
应用 → 事务分组 → 集群名称 → Seata Server 实例

示例：
order-service → default_tx_group → default → 127.0.0.1:8091
```

### 4.2 配置事务分组

**应用配置**：

```yaml
seata:
  tx-service-group: order_tx_group  # 事务分组名称
  
  service:
    vgroup-mapping:
      order_tx_group: default  # 事务分组 → 集群映射
```

**Nacos 配置**（seataServer.properties）：

```properties
# 事务分组配置
service.vgroupMapping.default_tx_group=default
service.vgroupMapping.order_tx_group=default
service.vgroupMapping.inventory_tx_group=default
service.vgroupMapping.account_tx_group=default

# 集群配置
service.default.grouplist=127.0.0.1:8091
```

---

## 5. 数据源代理

### 5.1 自动数据源代理

**Seata 会自动代理数据源，无需手动配置**。

**原理**：

```
原始数据源 → DataSourceProxy → ConnectionProxy → StatementProxy → 拦截 SQL
```

### 5.2 手动数据源代理（可选）

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
        return new DataSourceProxy(dataSource);
    }
}
```

### 5.3 禁用自动代理

```yaml
seata:
  enable-auto-data-source-proxy: false  # 禁用自动代理
```

---

## 6. undo_log 回滚日志

### 6.1 创建 undo_log 表

**每个业务数据库都需要创建 undo_log 表**：

```sql
-- 订单数据库
CREATE TABLE `undo_log`
(
    `branch_id`     BIGINT       NOT NULL COMMENT 'branch transaction id',
    `xid`           VARCHAR(128) NOT NULL COMMENT 'global transaction id',
    `context`       VARCHAR(128) NOT NULL COMMENT 'undo_log context,such as serialization',
    `rollback_info` LONGBLOB     NOT NULL COMMENT 'rollback info',
    `log_status`    INT(11)      NOT NULL COMMENT '0:normal status,1:defense status',
    `log_created`   DATETIME(6)  NOT NULL COMMENT 'create datetime',
    `log_modified`  DATETIME(6)  NOT NULL COMMENT 'modify datetime',
    UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT ='AT transaction mode undo table';

-- 库存数据库
USE inventory_db;
CREATE TABLE `undo_log` ... -- 同上

-- 账户数据库
USE account_db;
CREATE TABLE `undo_log` ... -- 同上
```

### 6.2 undo_log 内容

**前镜像（BeforeImage）**：

```json
{
  "tableName": "order",
  "rows": [
    {
      "fields": [
        {"name": "id", "type": "BIGINT", "value": 1},
        {"name": "status", "type": "VARCHAR", "value": "INIT"}
      ]
    }
  ]
}
```

**后镜像（AfterImage）**：

```json
{
  "tableName": "order",
  "rows": [
    {
      "fields": [
        {"name": "id", "type": "BIGINT", "value": 1},
        {"name": "status", "type": "VARCHAR", "value": "SUCCESS"}
      ]
    }
  ]
}
```

**回滚 SQL**：

```sql
-- 根据前镜像生成
UPDATE order SET status = 'INIT' WHERE id = 1;
```

---

## 7. 分布式事务验证

### 7.1 完整示例

**订单服务**：

```java
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    public Result<Order> createOrder(@RequestBody OrderDTO dto) {
        Order order = orderService.createOrder(dto);
        return Result.success(order);
    }
}

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final AccountClient accountClient;
    
    @GlobalTransactional(name = "create-order", timeoutMills = 30000)
    public Order createOrder(OrderDTO dto) {
        // 1. 创建订单
        Order order = saveOrder(dto);
        
        // 2. 扣减库存
        inventoryClient.deduct(dto.getProductId(), dto.getCount());
        
        // 3. 扣减余额
        accountClient.deduct(dto.getUserId(), dto.getAmount());
        
        // 4. 更新订单状态
        order.setStatus(OrderStatus.SUCCESS);
        orderRepository.save(order);
        
        return order;
    }
}
```

**库存服务**：

```java
@Service
@Slf4j
public class InventoryService {
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Transactional
    public void deduct(Long productId, Integer count) {
        log.info("扣减库存：productId={}, count={}", productId, count);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
            .orElseThrow(() -> new BusinessException("商品不存在"));
        
        if (inventory.getStock() < count) {
            throw new BusinessException("库存不足");
        }
        
        inventory.setStock(inventory.getStock() - count);
        inventoryRepository.save(inventory);
        
        log.info("库存扣减成功：剩余库存={}", inventory.getStock());
    }
}
```

**账户服务**：

```java
@Service
@Slf4j
public class AccountService {
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Transactional
    public void deduct(Long userId, BigDecimal amount) {
        log.info("扣减余额：userId={}, amount={}", userId, amount);
        
        Account account = accountRepository.findByUserId(userId)
            .orElseThrow(() -> new BusinessException("账户不存在"));
        
        if (account.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("余额不足");
        }
        
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
        
        log.info("余额扣减成功：剩余余额={}", account.getBalance());
    }
}
```

### 7.2 测试场景

**场景1：正常提交**：

```bash
# 请求
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productId": 100,
    "count": 2,
    "amount": 200.00
  }'

# 结果：
# - 订单创建成功
# - 库存扣减成功
# - 余额扣减成功
# - undo_log 被删除
```

**场景2：库存不足回滚**：

```bash
# 请求
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productId": 100,
    "count": 1000,  # 库存不足
    "amount": 10000.00
  }'

# 结果：
# - 订单创建
# - 库存扣减失败
# - 全局事务回滚
# - 订单数据回滚（删除）
# - undo_log 被删除
```

**场景3：余额不足回滚**：

```bash
# 请求
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productId": 100,
    "count": 2,
    "amount": 100000.00  # 余额不足
  }'

# 结果：
# - 订单创建
# - 库存扣减成功
# - 余额扣减失败
# - 全局事务回滚
# - 订单回滚
# - 库存回滚（恢复）
```

---

## 8. 监控与调试

### 8.1 查看全局事务

```bash
# 查看 global_table
SELECT * FROM seata.global_table ORDER BY gmt_create DESC LIMIT 10;

# 字段说明：
# - xid：全局事务ID
# - status：状态（1-开始，2-提交中，3-提交失败，4-回滚中，5-回滚失败，6-完成，7-超时回滚，8-提交重试，9-回滚重试）
# - timeout：超时时间
```

### 8.2 查看分支事务

```bash
# 查看 branch_table
SELECT * FROM seata.branch_table WHERE xid = '192.168.1.100:8091:2198765432100000001';

# 字段说明：
# - branch_id：分支事务ID
# - xid：全局事务ID
# - resource_id：数据源
# - status：状态
```

### 8.3 查看 undo_log

```bash
# 正常情况下，undo_log 应该为空（事务完成后自动删除）
SELECT * FROM order_db.undo_log;

# 如果有残留，说明可能存在问题
```

---

## 9. 面试要点

**Q1：Seata 的核心组件有哪些？**

- TC（Transaction Coordinator）：事务协调器
- TM（Transaction Manager）：事务管理器
- RM（Resource Manager）：资源管理器

**Q2：AT 模式的工作原理？**

1. 一阶段：执行本地事务，生成前后镜像，提交事务
2. 二阶段提交：异步删除 undo_log
3. 二阶段回滚：根据前镜像生成反向 SQL，执行回滚

**Q3：AT 模式的优缺点？**

优点：
- 无侵入性
- 自动回滚
- 性能较好

缺点：
- 仅支持关系型数据库
- 有隔离性问题
- 依赖 undo_log

**Q4：什么是事务分组？**

事务分组是逻辑上的分组，用于区分不同业务场景，映射到具体的 Seata Server 集群。

**Q5：undo_log 的作用？**

存储事务的前镜像和后镜像，用于事务回滚时生成反向 SQL。

---

## 10. 参考资料

**官方文档**：
- [Seata 官方文档](https://seata.io/zh-cn/docs/overview/what-is-seata.html)
- [Seata AT 模式](https://seata.io/zh-cn/docs/dev/mode/at-mode.html)

---

**下一章预告**：第 31 章将学习 Seata TCC/SAGA 与场景选型，包括 AT/TCC/SAGA/XA 模式对比、TCC 模式实践、SAGA 长事务实践、全局锁机制、事务隔离级别、业务一致性边界与取舍等内容。

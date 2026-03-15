# 16.1 本地事务管理

## 概述

事务是保证数据一致性的重要机制。本节介绍 Spring 事务管理与 MyBatis Plus 的结合使用，包括事务传播、隔离级别、回滚策略等。

**核心内容：**
- Spring 事务管理
- 事务传播行为
- 事务隔离级别
- 事务回滚策略

---

## Spring 事务配置

### 启用事务管理

```java
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

### 声明式事务

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 基本事务使用
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean createUser(UserDTO dto) {
        // 1. 创建用户
        User user = new User();
        BeanUtils.copyProperties(dto, user);
        save(user);
        
        // 2. 创建账户
        Account account = new Account();
        account.setUserId(user.getId());
        account.setBalance(BigDecimal.ZERO);
        accountService.save(account);
        
        // 任何异常都会回滚
        return true;
    }
}
```

---

## 事务传播行为

### 传播行为类型

```java
public enum Propagation {
    REQUIRED,        // 默认：支持当前事务，没有则创建新事务
    SUPPORTS,        // 支持当前事务，没有则非事务执行
    MANDATORY,       // 必须在事务中执行，否则抛异常
    REQUIRES_NEW,    // 总是创建新事务，挂起当前事务
    NOT_SUPPORTED,   // 非事务执行，挂起当前事务
    NEVER,           // 非事务执行，存在事务则抛异常
    NESTED          // 嵌套事务，当前事务存在则在嵌套事务中执行
}
```

### REQUIRED（默认）

```java
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    @Autowired
    private ProductService productService;
    
    /**
     * REQUIRED：如果外层有事务就加入，没有就新建
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean createOrder(OrderDTO dto) {
        // 创建订单
        Order order = new Order();
        save(order);
        
        // 调用减库存（加入当前事务）
        productService.reduceStock(dto.getProductId(), dto.getQuantity());
        
        // 任何一步失败都会回滚
        return true;
    }
}

@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> 
        implements ProductService {
    
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean reduceStock(Long productId, Integer quantity) {
        Product product = getById(productId);
        product.setStock(product.getStock() - quantity);
        return updateById(product);
    }
}
```

### REQUIRES_NEW

```java
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    @Autowired
    private LogService logService;
    
    /**
     * REQUIRES_NEW：总是开启新事务
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean createOrder(OrderDTO dto) {
        // 创建订单
        Order order = new Order();
        save(order);
        
        // 记录日志（独立事务，即使订单创建失败，日志也会保存）
        logService.saveLog("创建订单：" + order.getId());
        
        // 模拟异常
        if (true) {
            throw new RuntimeException("订单创建失败");
        }
        
        return true;
    }
}

@Service
public class LogServiceImpl extends ServiceImpl<LogMapper, Log> 
        implements LogService {
    
    /**
     * 独立事务，不受外层事务影响
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveLog(String content) {
        Log log = new Log();
        log.setContent(content);
        save(log);
    }
}
```

### NESTED

```java
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    /**
     * NESTED：嵌套事务
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean createOrder(OrderDTO dto) {
        // 创建订单
        Order order = new Order();
        save(order);
        
        try {
            // 尝试发送短信（嵌套事务）
            smsService.sendSms(order.getUserId(), "订单创建成功");
        } catch (Exception e) {
            // 短信发送失败不影响订单创建
            log.error("短信发送失败", e);
        }
        
        return true;
    }
}

@Service
public class SmsServiceImpl implements SmsService {
    
    @Transactional(propagation = Propagation.NESTED)
    public void sendSms(Long userId, String content) {
        // 发送短信
        // 失败会回滚到savepoint，但不影响外层事务
    }
}
```

---

## 事务隔离级别

### 隔离级别类型

```java
public enum Isolation {
    DEFAULT,              // 使用数据库默认隔离级别
    READ_UNCOMMITTED,     // 读未提交
    READ_COMMITTED,       // 读已提交（Oracle默认）
    REPEATABLE_READ,      // 可重复读（MySQL默认）
    SERIALIZABLE         // 串行化
}
```

### 并发问题

```java
/**
 * 脏读、不可重复读、幻读演示
 */
@SpringBootTest
public class IsolationLevelTest {
    
    /**
     * 脏读：读到未提交的数据
     * READ_UNCOMMITTED 会出现
     */
    @Test
    public void testDirtyRead() {
        // 线程1：开始事务，更新但不提交
        new Thread(() -> {
            transactionTemplate.execute(status -> {
                User user = userService.getById(1L);
                user.setAge(20);
                userService.updateById(user);
                
                // 睡眠2秒（不提交）
                Thread.sleep(2000);
                
                // 回滚
                status.setRollbackOnly();
                return null;
            });
        }).start();
        
        Thread.sleep(1000);
        
        // 线程2：读取（可能读到未提交的数据）
        User user = userService.getById(1L);
        System.out.println("读到的年龄：" + user.getAge());  // 可能是20（脏数据）
    }
    
    /**
     * 不可重复读：同一事务中两次读取数据不一致
     * READ_COMMITTED 会出现
     */
    @Test
    public void testNonRepeatableRead() {
        transactionTemplate.execute(status -> {
            // 第一次读取
            User user1 = userService.getById(1L);
            System.out.println("第一次读取：" + user1.getAge());
            
            // 其他事务修改并提交
            otherTransaction();
            
            // 第二次读取
            User user2 = userService.getById(1L);
            System.out.println("第二次读取：" + user2.getAge());  // 可能不一样
            
            return null;
        });
    }
    
    /**
     * 幻读：同一事务中两次查询记录数不一致
     * REPEATABLE_READ 会出现
     */
    @Test
    public void testPhantomRead() {
        transactionTemplate.execute(status -> {
            // 第一次查询
            List<User> users1 = userService.list();
            System.out.println("第一次查询：" + users1.size());
            
            // 其他事务插入并提交
            otherTransactionInsert();
            
            // 第二次查询
            List<User> users2 = userService.list();
            System.out.println("第二次查询：" + users2.size());  // 可能不一样
            
            return null;
        });
    }
}
```

### 设置隔离级别

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 设置隔离级别为串行化（最高隔离级别）
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public boolean updateUserBalance(Long userId, BigDecimal amount) {
        User user = getById(userId);
        user.setBalance(user.getBalance().add(amount));
        return updateById(user);
    }
}
```

---

## 事务回滚策略

### rollbackFor 配置

```java
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    /**
     * 指定回滚异常
     */
    @Transactional(rollbackFor = {Exception.class})
    public boolean createOrder1(OrderDTO dto) {
        // 所有异常都回滚
        return true;
    }
    
    /**
     * 指定不回滚的异常
     */
    @Transactional(noRollbackFor = {BusinessException.class})
    public boolean createOrder2(OrderDTO dto) {
        // BusinessException 不回滚
        return true;
    }
    
    /**
     * 默认行为：只有RuntimeException和Error回滚
     */
    @Transactional
    public boolean createOrder3(OrderDTO dto) throws Exception {
        // 检查异常不会回滚！
        throw new Exception("检查异常");
    }
}
```

### 编程式事务

```java
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    @Autowired
    private TransactionTemplate transactionTemplate;
    
    /**
     * 使用 TransactionTemplate
     */
    public boolean createOrderProgrammatic(OrderDTO dto) {
        return transactionTemplate.execute(status -> {
            try {
                // 创建订单
                Order order = new Order();
                save(order);
                
                // 减库存
                productService.reduceStock(dto.getProductId(), dto.getQuantity());
                
                return true;
            } catch (Exception e) {
                // 手动回滚
                status.setRollbackOnly();
                throw e;
            }
        });
    }
    
    /**
     * 使用 PlatformTransactionManager
     */
    @Autowired
    private PlatformTransactionManager transactionManager;
    
    public boolean createOrderWithManager(OrderDTO dto) {
        TransactionStatus status = transactionManager.getTransaction(
            new DefaultTransactionDefinition()
        );
        
        try {
            // 业务逻辑
            Order order = new Order();
            save(order);
            
            // 提交
            transactionManager.commit(status);
            return true;
        } catch (Exception e) {
            // 回滚
            transactionManager.rollback(status);
            throw e;
        }
    }
}
```

---

## 事务失效场景

### 常见失效场景

```java
@Service
public class TransactionFailureExample {
    
    /**
     * 场景1：方法不是public
     */
    @Transactional  // 失效！
    private void privateMethod() {
        // Spring AOP 只能代理public方法
    }
    
    /**
     * 场景2：同类方法调用
     */
    public void outerMethod() {
        // 失效！直接调用不走代理
        this.innerMethod();
    }
    
    @Transactional
    public void innerMethod() {
        // 事务失效
    }
    
    /**
     * 场景3：异常被捕获
     */
    @Transactional(rollbackFor = Exception.class)
    public void methodWithCatch() {
        try {
            // 业务逻辑
            throw new Exception("异常");
        } catch (Exception e) {
            // 异常被捕获，事务不会回滚！
            log.error("异常", e);
        }
    }
    
    /**
     * 场景4：数据库引擎不支持事务
     */
    @Transactional
    public void methodWithMyISAM() {
        // MyISAM引擎不支持事务
    }
}
```

### 正确使用

```java
@Service
public class TransactionCorrectExample {
    
    @Autowired
    private TransactionService self;  // 注入自身
    
    /**
     * 解决同类调用：注入自身
     */
    public void outerMethod() {
        // 通过代理调用
        self.innerMethod();
    }
    
    @Transactional
    public void innerMethod() {
        // 事务生效
    }
    
    /**
     * 解决异常捕获：手动回滚
     */
    @Transactional(rollbackFor = Exception.class)
    public void methodWithManualRollback() {
        try {
            // 业务逻辑
        } catch (Exception e) {
            log.error("异常", e);
            // 手动标记回滚
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        }
    }
}
```

---

## 最佳实践

### 1. 事务粒度控制

```java
/**
 * 控制事务粒度
 */
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    /**
     * ❌ 不好：事务范围过大
     */
    @Transactional
    public boolean createOrderBad(OrderDTO dto) {
        // 查询商品信息（不需要事务）
        Product product = productService.getById(dto.getProductId());
        
        // 查询用户信息（不需要事务）
        User user = userService.getById(dto.getUserId());
        
        // 创建订单（需要事务）
        Order order = new Order();
        save(order);
        
        // 发送短信（不需要事务，且耗时）
        smsService.sendSms(user.getPhone(), "订单创建成功");
        
        return true;
    }
    
    /**
     * ✅ 更好：缩小事务范围
     */
    public boolean createOrderGood(OrderDTO dto) {
        // 查询数据（不开事务）
        Product product = productService.getById(dto.getProductId());
        User user = userService.getById(dto.getUserId());
        
        // 核心操作（开事务）
        Order order = createOrderInTransaction(dto);
        
        // 发送短信（不开事务）
        smsService.sendSms(user.getPhone(), "订单创建成功");
        
        return true;
    }
    
    @Transactional
    private Order createOrderInTransaction(OrderDTO dto) {
        Order order = new Order();
        save(order);
        productService.reduceStock(dto.getProductId(), dto.getQuantity());
        return order;
    }
}
```

### 2. 避免长事务

```java
/**
 * 避免长事务
 */
@Service
public class DataImportService {
    
    /**
     * ❌ 不好：一次性导入大量数据
     */
    @Transactional
    public void importDataBad(List<User> users) {
        // 10万条数据，事务持续时间过长
        users.forEach(user -> userService.save(user));
    }
    
    /**
     * ✅ 更好：分批导入
     */
    public void importDataGood(List<User> users) {
        int batchSize = 1000;
        
        for (int i = 0; i < users.size(); i += batchSize) {
            int end = Math.min(i + batchSize, users.size());
            List<User> batch = users.subList(i, end);
            
            // 每批一个事务
            importBatch(batch);
        }
    }
    
    @Transactional
    private void importBatch(List<User> batch) {
        userService.saveBatch(batch);
    }
}
```

---

## 关键点总结

1. **@Transactional**：Spring 声明式事务管理
2. **传播行为**：REQUIRED、REQUIRES_NEW、NESTED
3. **隔离级别**：根据业务需求选择合适级别
4. **回滚策略**：rollbackFor 指定回滚异常
5. **事务失效**：注意public、同类调用、异常捕获
6. **事务粒度**：尽量缩小事务范围
7. **避免长事务**：分批处理大数据量操作

---

## 参考资料

- [Spring 事务管理](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction)
- [MySQL 事务](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html)

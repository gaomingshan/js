# 第 13 章：事务管理架构设计

> **学习目标**：理解 Spring 事务管理的整体架构和核心抽象  
> **预计时长**：2.5 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

### 1.1 什么是事务

**事务（Transaction）** 是一组操作的集合，这些操作要么全部成功，要么全部失败。

**事务的 ACID 特性**：

```
A - Atomicity（原子性）
    事务是不可分割的最小工作单元，要么全部成功，要么全部失败

C - Consistency（一致性）
    事务执行前后，数据保持一致状态

I - Isolation（隔离性）
    多个事务并发执行时，互不干扰

D - Durability（持久性）
    事务一旦提交，数据永久保存
```

### 1.2 Spring 事务管理的优势

**传统 JDBC 事务管理**：
```java
Connection conn = null;
try {
    conn = dataSource.getConnection();
    conn.setAutoCommit(false);  // 开启事务
    
    // 执行业务逻辑
    userDao.save(user);
    orderDao.save(order);
    
    conn.commit();  // 提交事务
} catch (Exception e) {
    if (conn != null) {
        conn.rollback();  // 回滚事务
    }
    throw e;
} finally {
    if (conn != null) {
        conn.close();
    }
}
```

**Spring 声明式事务**：
```java
@Transactional
public void createOrder(Order order) {
    userDao.save(order.getUser());
    orderDao.save(order);
}
```

**优势**：
- ✅ 代码简洁，无侵入
- ✅ 统一的事务抽象（支持多种数据访问技术）
- ✅ 声明式事务管理
- ✅ 编程式事务管理
- ✅ 事务传播行为
- ✅ 隔离级别

---

## 2. Spring 事务管理架构

### 2.1 核心接口体系

```
PlatformTransactionManager（事务管理器）
    ├─ getTransaction()
    ├─ commit()
    └─ rollback()
         ↓ 实现
    ┌────────────────────────────────┐
    │ DataSourceTransactionManager   │ ← JDBC/MyBatis
    │ JpaTransactionManager          │ ← JPA/Hibernate
    │ HibernateTransactionManager    │ ← Hibernate
    │ JtaTransactionManager          │ ← JTA（分布式事务）
    └────────────────────────────────┘

TransactionDefinition（事务定义）
    ├─ 传播行为（Propagation）
    ├─ 隔离级别（Isolation）
    ├─ 超时时间（Timeout）
    └─ 只读标志（ReadOnly）

TransactionStatus（事务状态）
    ├─ isNewTransaction()
    ├─ hasSavepoint()
    ├─ setRollbackOnly()
    ├─ isRollbackOnly()
    └─ isCompleted()
```

### 2.2 架构图

```
┌─────────────────────────────────────────────────────┐
│              Spring 事务管理架构                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  声明式事务                          编程式事务       │
│  @Transactional                     TransactionTemplate│
│       │                                    │          │
│       └────────────┬───────────────────────┘          │
│                    ↓                                  │
│     ┌─────────────────────────────────┐              │
│     │  TransactionInterceptor         │              │
│     │  (AOP 拦截器)                   │              │
│     └─────────────────────────────────┘              │
│                    ↓                                  │
│     ┌─────────────────────────────────┐              │
│     │  PlatformTransactionManager     │              │
│     │  (事务管理器抽象)                │              │
│     └─────────────────────────────────┘              │
│                    ↓                                  │
│     ┌─────────────────────────────────┐              │
│     │  数据访问技术实现                │              │
│     │  - DataSource (JDBC)            │              │
│     │  - EntityManager (JPA)          │              │
│     │  - Session (Hibernate)          │              │
│     └─────────────────────────────────┘              │
└─────────────────────────────────────────────────────┘
```

---

## 3. PlatformTransactionManager

### 3.1 接口定义

```java
public interface PlatformTransactionManager extends TransactionManager {
    
    /**
     * 获取事务（根据事务定义）
     * 如果已存在事务，根据传播行为决定如何处理
     */
    TransactionStatus getTransaction(@Nullable TransactionDefinition definition) 
        throws TransactionException;
    
    /**
     * 提交事务
     */
    void commit(TransactionStatus status) throws TransactionException;
    
    /**
     * 回滚事务
     */
    void rollback(TransactionStatus status) throws TransactionException;
}
```

### 3.2 DataSourceTransactionManager

```java
public class DataSourceTransactionManager extends AbstractPlatformTransactionManager
        implements ResourceTransactionManager, InitializingBean {
    
    @Nullable
    private DataSource dataSource;
    
    @Override
    protected Object doGetTransaction() {
        // 创建事务对象
        DataSourceTransactionObject txObject = new DataSourceTransactionObject();
        txObject.setSavepointAllowed(isNestedTransactionAllowed());
        
        // 从 ThreadLocal 获取连接持有者
        ConnectionHolder conHolder =
            (ConnectionHolder) TransactionSynchronizationManager.getResource(obtainDataSource());
        
        txObject.setConnectionHolder(conHolder, false);
        return txObject;
    }
    
    @Override
    protected void doBegin(Object transaction, TransactionDefinition definition) {
        DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
        Connection con = null;
        
        try {
            if (!txObject.hasConnectionHolder() ||
                    txObject.getConnectionHolder().isSynchronizedWithTransaction()) {
                // 获取新连接
                Connection newCon = obtainDataSource().getConnection();
                txObject.setConnectionHolder(new ConnectionHolder(newCon), true);
            }
            
            txObject.getConnectionHolder().setSynchronizedWithTransaction(true);
            con = txObject.getConnectionHolder().getConnection();
            
            // 设置只读和隔离级别
            Integer previousIsolationLevel = DataSourceUtils.prepareConnectionForTransaction(con, definition);
            txObject.setPreviousIsolationLevel(previousIsolationLevel);
            txObject.setReadOnly(definition.isReadOnly());
            
            // 关闭自动提交
            if (con.getAutoCommit()) {
                txObject.setMustRestoreAutoCommit(true);
                con.setAutoCommit(false);
            }
            
            prepareTransactionalConnection(con, definition);
            txObject.getConnectionHolder().setTransactionActive(true);
            
            // 设置超时时间
            int timeout = determineTimeout(definition);
            if (timeout != TransactionDefinition.TIMEOUT_DEFAULT) {
                txObject.getConnectionHolder().setTimeoutInSeconds(timeout);
            }
            
            // 绑定连接到 ThreadLocal
            if (txObject.isNewConnectionHolder()) {
                TransactionSynchronizationManager.bindResource(obtainDataSource(), txObject.getConnectionHolder());
            }
        } catch (Throwable ex) {
            if (txObject.isNewConnectionHolder()) {
                DataSourceUtils.releaseConnection(con, obtainDataSource());
                txObject.setConnectionHolder(null, false);
            }
            throw new CannotCreateTransactionException("Could not open JDBC Connection for transaction", ex);
        }
    }
    
    @Override
    protected void doCommit(DefaultTransactionStatus status) {
        DataSourceTransactionObject txObject = (DataSourceTransactionObject) status.getTransaction();
        Connection con = txObject.getConnectionHolder().getConnection();
        
        try {
            con.commit();
        } catch (SQLException ex) {
            throw new TransactionSystemException("Could not commit JDBC transaction", ex);
        }
    }
    
    @Override
    protected void doRollback(DefaultTransactionStatus status) {
        DataSourceTransactionObject txObject = (DataSourceTransactionObject) status.getTransaction();
        Connection con = txObject.getConnectionHolder().getConnection();
        
        try {
            con.rollback();
        } catch (SQLException ex) {
            throw new TransactionSystemException("Could not roll back JDBC transaction", ex);
        }
    }
    
    @Override
    protected void doCleanupAfterCompletion(Object transaction) {
        DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
        
        // 解绑连接
        if (txObject.isNewConnectionHolder()) {
            TransactionSynchronizationManager.unbindResource(obtainDataSource());
        }
        
        // 释放连接
        Connection con = txObject.getConnectionHolder().getConnection();
        try {
            if (txObject.isMustRestoreAutoCommit()) {
                con.setAutoCommit(true);
            }
            DataSourceUtils.resetConnectionAfterTransaction(
                con, txObject.getPreviousIsolationLevel(), txObject.isReadOnly());
        } catch (Throwable ex) {
            logger.debug("Could not reset JDBC Connection after transaction", ex);
        }
        
        if (txObject.isNewConnectionHolder()) {
            DataSourceUtils.releaseConnection(con, this.dataSource);
        }
        
        txObject.getConnectionHolder().clear();
    }
}
```

---

## 4. TransactionDefinition

### 4.1 接口定义

```java
public interface TransactionDefinition {
    
    /**
     * 传播行为
     */
    int PROPAGATION_REQUIRED = 0;      // 默认，支持当前事务，不存在则创建
    int PROPAGATION_SUPPORTS = 1;      // 支持当前事务，不存在则非事务执行
    int PROPAGATION_MANDATORY = 2;     // 必须在事务中执行，不存在则抛异常
    int PROPAGATION_REQUIRES_NEW = 3;  // 创建新事务，挂起当前事务
    int PROPAGATION_NOT_SUPPORTED = 4; // 非事务执行，挂起当前事务
    int PROPAGATION_NEVER = 5;         // 非事务执行，存在事务则抛异常
    int PROPAGATION_NESTED = 6;        // 嵌套事务，使用 SavePoint
    
    /**
     * 隔离级别
     */
    int ISOLATION_DEFAULT = -1;           // 使用数据库默认
    int ISOLATION_READ_UNCOMMITTED = 1;   // 读未提交
    int ISOLATION_READ_COMMITTED = 2;     // 读已提交
    int ISOLATION_REPEATABLE_READ = 4;    // 可重复读
    int ISOLATION_SERIALIZABLE = 8;       // 串行化
    
    /**
     * 超时时间（秒）
     */
    int TIMEOUT_DEFAULT = -1;
    
    /**
     * 获取传播行为
     */
    default int getPropagationBehavior() {
        return PROPAGATION_REQUIRED;
    }
    
    /**
     * 获取隔离级别
     */
    default int getIsolationLevel() {
        return ISOLATION_DEFAULT;
    }
    
    /**
     * 获取超时时间
     */
    default int getTimeout() {
        return TIMEOUT_DEFAULT;
    }
    
    /**
     * 是否只读
     */
    default boolean isReadOnly() {
        return false;
    }
    
    /**
     * 获取事务名称
     */
    @Nullable
    default String getName() {
        return null;
    }
}
```

### 4.2 DefaultTransactionDefinition

```java
public class DefaultTransactionDefinition implements TransactionDefinition, Serializable {
    
    private int propagationBehavior = PROPAGATION_REQUIRED;
    private int isolationLevel = ISOLATION_DEFAULT;
    private int timeout = TIMEOUT_DEFAULT;
    private boolean readOnly = false;
    @Nullable
    private String name;
    
    public DefaultTransactionDefinition() {
    }
    
    public DefaultTransactionDefinition(int propagationBehavior) {
        this.propagationBehavior = propagationBehavior;
    }
    
    public DefaultTransactionDefinition(TransactionDefinition other) {
        this.propagationBehavior = other.getPropagationBehavior();
        this.isolationLevel = other.getIsolationLevel();
        this.timeout = other.getTimeout();
        this.readOnly = other.isReadOnly();
        this.name = other.getName();
    }
    
    // Getter and Setter methods...
}
```

---

## 5. TransactionStatus

### 5.1 接口定义

```java
public interface TransactionStatus extends TransactionExecution, SavepointManager, Flushable {
    
    /**
     * 是否是新事务
     */
    boolean isNewTransaction();
    
    /**
     * 是否有保存点
     */
    boolean hasSavepoint();
    
    /**
     * 设置为只回滚
     */
    void setRollbackOnly();
    
    /**
     * 是否只回滚
     */
    boolean isRollbackOnly();
    
    /**
     * 刷新底层会话（如 Hibernate）
     */
    @Override
    void flush();
    
    /**
     * 是否已完成（已提交或回滚）
     */
    boolean isCompleted();
}
```

### 5.2 DefaultTransactionStatus

```java
public class DefaultTransactionStatus extends AbstractTransactionStatus {
    
    @Nullable
    private final Object transaction;
    
    private final boolean newTransaction;
    
    private final boolean newSynchronization;
    
    private final boolean readOnly;
    
    private final boolean debug;
    
    @Nullable
    private final Object suspendedResources;
    
    public DefaultTransactionStatus(
            @Nullable Object transaction, boolean newTransaction, boolean newSynchronization,
            boolean readOnly, boolean debug, @Nullable Object suspendedResources) {
        
        this.transaction = transaction;
        this.newTransaction = newTransaction;
        this.newSynchronization = newSynchronization;
        this.readOnly = readOnly;
        this.debug = debug;
        this.suspendedResources = suspendedResources;
    }
    
    public Object getTransaction() {
        Assert.state(this.transaction != null, "No transaction active");
        return this.transaction;
    }
    
    public boolean hasTransaction() {
        return (this.transaction != null);
    }
    
    @Override
    public boolean isNewTransaction() {
        return (hasTransaction() && this.newTransaction);
    }
    
    public boolean isNewSynchronization() {
        return this.newSynchronization;
    }
    
    public boolean isReadOnly() {
        return this.readOnly;
    }
    
    public boolean isDebug() {
        return this.debug;
    }
    
    @Nullable
    public Object getSuspendedResources() {
        return this.suspendedResources;
    }
}
```

---

## 6. TransactionSynchronizationManager

### 6.1 事务资源管理

```java
public abstract class TransactionSynchronizationManager {
    
    // ThreadLocal 存储事务资源
    private static final ThreadLocal<Map<Object, Object>> resources =
        new NamedThreadLocal<>("Transactional resources");
    
    // ThreadLocal 存储事务同步回调
    private static final ThreadLocal<Set<TransactionSynchronization>> synchronizations =
        new NamedThreadLocal<>("Transaction synchronizations");
    
    // 当前事务名称
    private static final ThreadLocal<String> currentTransactionName =
        new NamedThreadLocal<>("Current transaction name");
    
    // 当前事务是否只读
    private static final ThreadLocal<Boolean> currentTransactionReadOnly =
        new NamedThreadLocal<>("Current transaction read-only status");
    
    // 当前事务隔离级别
    private static final ThreadLocal<Integer> currentTransactionIsolationLevel =
        new NamedThreadLocal<>("Current transaction isolation level");
    
    // 是否激活事务
    private static final ThreadLocal<Boolean> actualTransactionActive =
        new NamedThreadLocal<>("Actual transaction active");
    
    /**
     * 绑定资源到 ThreadLocal
     */
    public static void bindResource(Object key, Object value) throws IllegalStateException {
        Object actualKey = TransactionSynchronizationUtils.unwrapResourceIfNecessary(key);
        Assert.notNull(value, "Value must not be null");
        
        Map<Object, Object> map = resources.get();
        if (map == null) {
            map = new HashMap<>();
            resources.set(map);
        }
        
        Object oldValue = map.put(actualKey, value);
        if (oldValue != null) {
            throw new IllegalStateException("Already value [" + oldValue + "] for key [" +
                actualKey + "] bound to thread [" + Thread.currentThread().getName() + "]");
        }
    }
    
    /**
     * 从 ThreadLocal 获取资源
     */
    @Nullable
    public static Object getResource(Object key) {
        Object actualKey = TransactionSynchronizationUtils.unwrapResourceIfNecessary(key);
        Object value = doGetResource(actualKey);
        return value;
    }
    
    @Nullable
    private static Object doGetResource(Object actualKey) {
        Map<Object, Object> map = resources.get();
        if (map == null) {
            return null;
        }
        Object value = map.get(actualKey);
        return value;
    }
    
    /**
     * 解绑资源
     */
    public static Object unbindResource(Object key) throws IllegalStateException {
        Object actualKey = TransactionSynchronizationUtils.unwrapResourceIfNecessary(key);
        Object value = doUnbindResource(actualKey);
        if (value == null) {
            throw new IllegalStateException(
                "No value for key [" + actualKey + "] bound to thread [" + Thread.currentThread().getName() + "]");
        }
        return value;
    }
    
    @Nullable
    private static Object doUnbindResource(Object actualKey) {
        Map<Object, Object> map = resources.get();
        if (map == null) {
            return null;
        }
        Object value = map.remove(actualKey);
        if (map.isEmpty()) {
            resources.remove();
        }
        return value;
    }
}
```

---

## 7. 配置事务管理器

### 7.1 Java Config

```java
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    
    @Bean
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/db");
        dataSource.setUsername("root");
        dataSource.setPassword("password");
        return dataSource;
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

### 7.2 Spring Boot

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/db
spring.datasource.username=root
spring.datasource.password=password

# 事务管理器自动配置
```

```java
// Spring Boot 自动配置
@Configuration
@ConditionalOnClass({ JdbcTemplate.class, PlatformTransactionManager.class })
@AutoConfigureAfter(DataSourceAutoConfiguration.class)
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceTransactionManagerAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean(PlatformTransactionManager.class)
    public DataSourceTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

---

## 8. 实际落地场景（工作实战）

### 场景 1：编程式事务

```java
@Service
public class UserService {
    
    @Autowired
    private TransactionTemplate transactionTemplate;
    
    @Autowired
    private UserDao userDao;
    
    public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
        transactionTemplate.execute(status -> {
            try {
                // 扣款
                userDao.deduct(fromId, amount);
                
                // 模拟异常
                if (amount.compareTo(new BigDecimal("1000")) > 0) {
                    throw new RuntimeException("金额过大");
                }
                
                // 加款
                userDao.add(toId, amount);
                
                return null;
            } catch (Exception e) {
                // 标记为只回滚
                status.setRollbackOnly();
                throw e;
            }
        });
    }
}
```

### 场景 2：多数据源事务

```java
@Configuration
public class MultiDataSourceConfig {
    
    @Bean
    @Primary
    public DataSource primaryDataSource() {
        // 主数据源
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    public DataSource secondaryDataSource() {
        // 次数据源
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    @Primary
    public PlatformTransactionManager primaryTransactionManager(
            @Qualifier("primaryDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
    
    @Bean
    public PlatformTransactionManager secondaryTransactionManager(
            @Qualifier("secondaryDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}

// 使用
@Service
public class UserService {
    
    @Transactional("primaryTransactionManager")
    public void saveToPrimary(User user) {
        // 使用主数据源
    }
    
    @Transactional("secondaryTransactionManager")
    public void saveToSecondary(User user) {
        // 使用次数据源
    }
}
```

---

## 9. 学习自检清单

- [ ] 能够说出 Spring 事务管理的核心接口
- [ ] 能够解释 PlatformTransactionManager 的作用
- [ ] 能够说出 TransactionDefinition 包含哪些属性
- [ ] 能够配置事务管理器
- [ ] 能够使用编程式事务
- [ ] 能够解释 TransactionSynchronizationManager 的作用

**学习建议**：
- **预计学习时长**：2.5 小时
- **重点难点**：事务抽象、资源管理
- **前置知识**：JDBC 事务、AOP
- **实践建议**：
  - 配置不同的事务管理器
  - 使用编程式事务
  - 分析 ThreadLocal 资源绑定

---

## 10. 参考资料

**Spring 官方文档**：
- [Transaction Management](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction)

**源码位置**：
- `org.springframework.transaction.PlatformTransactionManager`
- `org.springframework.jdbc.datasource.DataSourceTransactionManager`
- `org.springframework.transaction.support.TransactionSynchronizationManager`

---

**上一章** ← [第 12 章：拦截器链执行流程](./content-12.md)  
**下一章** → [第 14 章：@Transactional 实现原理](./content-14.md)  
**返回目录** → [学习大纲](../content-outline.md)

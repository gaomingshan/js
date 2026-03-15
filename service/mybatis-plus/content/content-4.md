# 2.2 IService 与 ServiceImpl

## 概述

`IService` 是 MyBatis Plus 提供的服务层接口，在 `BaseMapper` 的基础上进一步封装了更多业务层常用的方法。`ServiceImpl` 是其默认实现类，提供了批量操作、链式调用、Lambda 支持等强大功能。

**核心价值：**
- 更丰富的 CRUD 方法（save、saveOrUpdate、批量操作等）
- 优化的批量操作性能
- 链式调用和 Lambda 支持
- 事务管理支持

---

## 服务层接口设计

### 基本结构

```java
// 服务接口
public interface UserService extends IService<User> {
    // 继承 IService，获得丰富的方法
    // 可以添加自定义业务方法
}

// 服务实现类
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    // 继承 ServiceImpl，实现 UserService
    // ServiceImpl 需要两个泛型参数：Mapper 类型和实体类型
}
```

### IService 提供的方法分类

| 方法类型 | 方法示例 | 说明 |
|----------|----------|------|
| **保存** | save、saveBatch、saveOrUpdate | 插入或更新 |
| **移除** | remove、removeById、removeBatchByIds | 删除操作 |
| **更新** | update、updateById、updateBatchById | 更新操作 |
| **查询** | get、getById、list、page | 查询操作 |
| **统计** | count | 统计记录数 |
| **链式** | query、lambdaQuery、lambdaUpdate | 链式调用 |

---

## 批量操作方法

### saveBatch - 批量插入

```java
/**
 * 批量插入
 * @param entityList 实体列表
 * @return 是否成功
 */
boolean saveBatch(Collection<T> entityList);

/**
 * 批量插入（指定批次大小）
 * @param entityList 实体列表
 * @param batchSize 每批次数量
 */
boolean saveBatch(Collection<T> entityList, int batchSize);
```

**使用示例：**
```java
@Autowired
private UserService userService;

public void testSaveBatch() {
    List<User> users = new ArrayList<>();
    for (int i = 0; i < 1000; i++) {
        User user = new User();
        user.setName("用户" + i);
        user.setAge(20 + i % 50);
        user.setEmail("user" + i + "@example.com");
        users.add(user);
    }
    
    // 默认批次大小 1000
    userService.saveBatch(users);
    
    // 指定每批 500 条
    userService.saveBatch(users, 500);
}
```

**性能对比：**
```java
// ❌ 不推荐：循环插入（执行 1000 次 SQL）
for (User user : users) {
    userService.save(user);
}
// 耗时：约 5000ms

// ✅ 推荐：批量插入（执行 1 次或少量批次）
userService.saveBatch(users);
// 耗时：约 500ms（性能提升 10 倍）
```

**关键点：**
- `saveBatch` 使用 JDBC batch 机制，显著提升性能
- 默认批次大小为 1000，可根据数据量调整
- 批量插入会开启事务，确保原子性
- 需要数据库连接 URL 添加 `rewriteBatchedStatements=true` 参数

### saveOrUpdate - 保存或更新

```java
/**
 * 根据 ID 判断：存在则更新，不存在则插入
 */
boolean saveOrUpdate(T entity);

/**
 * 批量保存或更新
 */
boolean saveOrUpdateBatch(Collection<T> entityList);
boolean saveOrUpdateBatch(Collection<T> entityList, int batchSize);
```

**使用示例：**
```java
// 单条保存或更新
User user = new User();
user.setId(1L);  // ID 存在则更新
user.setName("张三");
userService.saveOrUpdate(user);

// 批量保存或更新
List<User> users = Arrays.asList(
    new User(1L, "张三", 25),  // ID=1 存在，更新
    new User(null, "李四", 26), // ID 为 null，插入
    new User(999L, "王五", 27)  // ID=999 不存在，插入
);
userService.saveOrUpdateBatch(users);
```

**实现原理：**
```java
// 简化的实现逻辑
public boolean saveOrUpdate(T entity) {
    if (entity.getId() != null) {
        // ID 不为 null，先查询是否存在
        if (getById(entity.getId()) != null) {
            return updateById(entity);  // 存在则更新
        }
    }
    return save(entity);  // 不存在则插入
}
```

### updateBatchById - 批量更新

```java
/**
 * 根据 ID 批量更新
 */
boolean updateBatchById(Collection<T> entityList);
boolean updateBatchById(Collection<T> entityList, int batchSize);
```

**使用示例：**
```java
List<User> users = userService.listByIds(Arrays.asList(1L, 2L, 3L));
users.forEach(user -> user.setAge(user.getAge() + 1));

// 批量更新
userService.updateBatchById(users);
```

### removeBatchByIds - 批量删除

```java
/**
 * 根据 ID 集合批量删除
 */
boolean removeBatchByIds(Collection<? extends Serializable> idList);
```

**使用示例：**
```java
List<Long> ids = Arrays.asList(1L, 2L, 3L, 4L, 5L);
userService.removeBatchByIds(ids);
// DELETE FROM user WHERE id IN (1, 2, 3, 4, 5)
```

---

## 链式调用与 Lambda 支持

### query() - 链式查询

```java
/**
 * 链式查询
 */
public void testQuery() {
    // 查询年龄大于 18 的用户列表
    List<User> users = userService.query()
        .ge("age", 18)
        .orderByDesc("create_time")
        .list();
    
    // 查询单条记录
    User user = userService.query()
        .eq("name", "张三")
        .one();
    
    // 统计数量
    long count = userService.query()
        .ge("age", 18)
        .count();
}
```

### lambdaQuery() - Lambda 链式查询

```java
/**
 * Lambda 链式查询（类型安全）
 */
public void testLambdaQuery() {
    // 查询列表
    List<User> users = userService.lambdaQuery()
        .ge(User::getAge, 18)
        .like(User::getName, "张")
        .orderByDesc(User::getCreateTime)
        .list();
    
    // 查询单条
    User user = userService.lambdaQuery()
        .eq(User::getName, "张三")
        .one();
    
    // 查询 ID 列表
    List<Long> ids = userService.lambdaQuery()
        .ge(User::getAge, 18)
        .select(User::getId)
        .list()
        .stream()
        .map(User::getId)
        .collect(Collectors.toList());
}
```

### lambdaUpdate() - Lambda 链式更新

```java
/**
 * Lambda 链式更新
 */
public void testLambdaUpdate() {
    // 更新符合条件的记录
    boolean success = userService.lambdaUpdate()
        .set(User::getAge, 30)
        .eq(User::getName, "张三")
        .update();
    
    // 批量更新年龄
    userService.lambdaUpdate()
        .setSql("age = age + 1")  // 使用 SQL 表达式
        .ge(User::getAge, 18)
        .update();
}
```

### 链式调用的优势

```java
// ❌ 传统方式：代码冗长
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.ge(User::getAge, 18)
       .like(User::getName, "张")
       .orderByDesc(User::getCreateTime);
List<User> users = userService.list(wrapper);

// ✅ 链式调用：简洁优雅
List<User> users = userService.lambdaQuery()
    .ge(User::getAge, 18)
    .like(User::getName, "张")
    .orderByDesc(User::getCreateTime)
    .list();
```

---

## Service 层最佳实践

### 1. 基本结构规范

```java
/**
 * 用户服务接口
 */
public interface UserService extends IService<User> {
    
    /**
     * 自定义业务方法：根据用户名查询
     */
    User getByUsername(String username);
    
    /**
     * 自定义业务方法：注册用户
     */
    boolean register(UserRegisterDTO dto);
}

/**
 * 用户服务实现类
 */
@Service
@Slf4j
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    @Override
    public User getByUsername(String username) {
        return lambdaQuery()
            .eq(User::getUsername, username)
            .one();
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean register(UserRegisterDTO dto) {
        // 1. 校验用户名是否存在
        User existUser = getByUsername(dto.getUsername());
        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }
        
        // 2. 密码加密
        String encryptedPassword = passwordEncoder.encode(dto.getPassword());
        
        // 3. 创建用户
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(encryptedPassword);
        user.setEmail(dto.getEmail());
        
        return save(user);
    }
}
```

### 2. 批量操作优化

```java
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    /**
     * 批量创建订单
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean batchCreate(List<OrderCreateDTO> dtoList) {
        if (CollectionUtils.isEmpty(dtoList)) {
            return true;
        }
        
        // 转换 DTO 为实体
        List<Order> orders = dtoList.stream()
            .map(dto -> {
                Order order = new Order();
                BeanUtils.copyProperties(dto, order);
                order.setOrderNo(generateOrderNo());
                return order;
            })
            .collect(Collectors.toList());
        
        // 批量插入（每批 500 条）
        return saveBatch(orders, 500);
    }
    
    /**
     * 批量更新订单状态
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean batchUpdateStatus(List<Long> orderIds, Integer status) {
        // 方式1：使用 lambdaUpdate（推荐）
        return lambdaUpdate()
            .set(Order::getStatus, status)
            .in(Order::getId, orderIds)
            .update();
        
        // 方式2：先查询再批量更新（需要回填其他字段时使用）
        // List<Order> orders = listByIds(orderIds);
        // orders.forEach(order -> order.setStatus(status));
        // return updateBatchById(orders);
    }
}
```

### 3. 分页查询封装

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 分页查询用户
     */
    public Page<User> pageQuery(UserQueryDTO dto) {
        Page<User> page = new Page<>(dto.getCurrent(), dto.getSize());
        
        return lambdaQuery()
            .like(StringUtils.isNotBlank(dto.getName()), 
                  User::getName, dto.getName())
            .eq(dto.getAge() != null, User::getAge, dto.getAge())
            .ge(dto.getMinAge() != null, User::getAge, dto.getMinAge())
            .le(dto.getMaxAge() != null, User::getAge, dto.getMaxAge())
            .between(dto.getStartDate() != null && dto.getEndDate() != null,
                     User::getCreateTime, dto.getStartDate(), dto.getEndDate())
            .orderByDesc(User::getCreateTime)
            .page(page);
    }
}
```

### 4. 复杂业务事务管理

```java
@Service
@Slf4j
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    @Autowired
    private OrderItemService orderItemService;
    
    @Autowired
    private ProductService productService;
    
    /**
     * 创建订单（包含订单明细）
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean createOrder(OrderCreateDTO dto) {
        // 1. 创建订单主表
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(dto.getUserId());
        order.setTotalAmount(dto.getTotalAmount());
        order.setStatus(OrderStatus.PENDING.getCode());
        
        if (!save(order)) {
            throw new BusinessException("创建订单失败");
        }
        
        // 2. 创建订单明细
        List<OrderItem> items = dto.getItems().stream()
            .map(itemDto -> {
                OrderItem item = new OrderItem();
                item.setOrderId(order.getId());
                item.setProductId(itemDto.getProductId());
                item.setQuantity(itemDto.getQuantity());
                item.setPrice(itemDto.getPrice());
                return item;
            })
            .collect(Collectors.toList());
        
        if (!orderItemService.saveBatch(items)) {
            throw new BusinessException("创建订单明细失败");
        }
        
        // 3. 扣减库存
        for (OrderItemDTO itemDto : dto.getItems()) {
            boolean success = productService.lambdaUpdate()
                .setSql("stock = stock - " + itemDto.getQuantity())
                .eq(Product::getId, itemDto.getProductId())
                .ge(Product::getStock, itemDto.getQuantity())  // 库存充足才扣减
                .update();
            
            if (!success) {
                throw new BusinessException("库存不足");
            }
        }
        
        log.info("订单创建成功，订单号：{}", order.getOrderNo());
        return true;
    }
}
```

### 5. 避免常见错误

```java
// ❌ 错误：在循环中调用 save
for (User user : users) {
    userService.save(user);  // 执行 N 次 SQL
}

// ✅ 正确：使用 saveBatch
userService.saveBatch(users);  // 批量插入


// ❌ 错误：先查询再循环更新
List<User> users = userService.listByIds(ids);
for (User user : users) {
    user.setAge(30);
    userService.updateById(user);  // 执行 N 次 SQL
}

// ✅ 正确：使用 lambdaUpdate
userService.lambdaUpdate()
    .set(User::getAge, 30)
    .in(User::getId, ids)
    .update();  // 执行 1 次 SQL


// ❌ 错误：大批量操作未分批
List<User> users = new ArrayList<>(100000);
// ... 添加 10 万条数据
userService.saveBatch(users);  // 可能超时或内存溢出

// ✅ 正确：指定批次大小
userService.saveBatch(users, 1000);  // 每批 1000 条
```

---

## 深入一点：ServiceImpl 实现原理

### 批量操作的实现

```java
@Override
@Transactional(rollbackFor = Exception.class)
public boolean saveBatch(Collection<T> entityList, int batchSize) {
    String sqlStatement = getSqlStatement(SqlMethod.INSERT_ONE);
    
    return executeBatch(entityList, batchSize, (sqlSession, entity) -> {
        sqlSession.insert(sqlStatement, entity);
    });
}

// 批量执行模板方法
protected <E> boolean executeBatch(Collection<E> list, int batchSize, 
                                    BiConsumer<SqlSession, E> consumer) {
    try (SqlSession batchSqlSession = sqlSessionBatch()) {
        int size = list.size();
        int i = 1;
        
        for (E element : list) {
            consumer.accept(batchSqlSession, element);
            
            // 每 batchSize 条执行一次
            if (i % batchSize == 0 || i == size) {
                batchSqlSession.flushStatements();
            }
            i++;
        }
        batchSqlSession.commit();
    }
    return true;
}
```

**关键点：**
- 使用 `SqlSession` 的 batch 模式
- 分批提交，避免一次性提交过多数据
- 自动管理事务

---

## 关键点总结

1. **IService 定位**：服务层接口，提供比 BaseMapper 更丰富的方法
2. **批量操作**：saveBatch、updateBatchById 等显著提升性能
3. **链式调用**：lambdaQuery、lambdaUpdate 让代码更简洁
4. **事务管理**：批量操作自动开启事务，确保数据一致性
5. **最佳实践**：优先使用批量方法，避免循环调用单条方法

---

## 参考资料

- [IService CRUD 接口](https://baomidou.com/pages/49cc81/#service-crud-%E6%8E%A5%E5%8F%A3)
- [批量操作优化](https://baomidou.com/pages/49cc81/#savebatch)

# 12.1 ActiveRecord 模式

## 概述

ActiveRecord 是一种设计模式，将数据访问逻辑直接封装在实体对象中，使实体对象同时具有数据和行为。MyBatis Plus 支持 ActiveRecord 模式，通过继承 Model 类，实体对象可以直接调用 CRUD 方法。

**核心特点：**
- 实体对象直接操作数据库
- 简化数据访问代码
- 面向对象的数据操作
- 减少 Service 和 Mapper 依赖

---

## ActiveRecord 基本使用

### 实体类继承 Model

```java
/**
 * ActiveRecord 实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user")
public class User extends Model<User> {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String name;
    
    private Integer age;
    
    private String email;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    /**
     * 指定主键字段
     */
    @Override
    public Serializable pkVal() {
        return this.id;
    }
}
```

### CRUD 操作

```java
/**
 * ActiveRecord 使用示例
 */
public class ActiveRecordDemo {
    
    /**
     * 插入数据
     */
    public void insert() {
        User user = new User();
        user.setName("张三");
        user.setAge(18);
        user.setEmail("zhangsan@example.com");
        
        // 直接调用 insert 方法
        boolean success = user.insert();
        
        System.out.println("插入结果：" + success);
        System.out.println("插入后的ID：" + user.getId());
    }
    
    /**
     * 更新数据
     */
    public void update() {
        // 先查询
        User user = new User();
        user.setId(1L);
        User result = user.selectById();
        
        // 修改数据
        result.setAge(20);
        
        // 直接更新
        boolean success = result.updateById();
        
        System.out.println("更新结果：" + success);
    }
    
    /**
     * 查询数据
     */
    public void select() {
        // 根据 ID 查询
        User user = new User();
        user.setId(1L);
        User result = user.selectById();
        
        System.out.println("查询结果：" + result);
    }
    
    /**
     * 删除数据
     */
    public void delete() {
        User user = new User();
        user.setId(1L);
        
        // 直接删除
        boolean success = user.deleteById();
        
        System.out.println("删除结果：" + success);
    }
    
    /**
     * 条件查询
     */
    public void selectByCondition() {
        User user = new User();
        
        // 构建查询条件
        List<User> users = user.selectList(
            new QueryWrapper<User>()
                .eq("age", 18)
                .like("name", "张")
        );
        
        System.out.println("查询结果：" + users);
    }
}
```

---

## Model 类提供的方法

### 插入方法

```java
// 插入记录
boolean insert();

// 插入或更新（根据主键判断）
boolean insertOrUpdate();
```

### 更新方法

```java
// 根据 ID 更新
boolean updateById();

// 根据条件更新
boolean update(Wrapper<T> updateWrapper);
```

### 查询方法

```java
// 根据 ID 查询
T selectById();

// 根据 ID 查询（指定字段）
T selectById(Serializable id);

// 查询所有
List<T> selectAll();

// 条件查询
List<T> selectList(Wrapper<T> queryWrapper);

// 查询一条
T selectOne(Wrapper<T> queryWrapper);

// 统计
Long selectCount(Wrapper<T> queryWrapper);

// 分页查询
IPage<T> selectPage(IPage<T> page, Wrapper<T> queryWrapper);
```

### 删除方法

```java
// 根据 ID 删除
boolean deleteById();

// 根据 ID 删除（指定 ID）
boolean deleteById(Serializable id);

// 根据条件删除
boolean delete(Wrapper<T> queryWrapper);
```

---

## 实战应用

### 场景1：快速原型开发

```java
/**
 * 博客文章实体（ActiveRecord）
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("article")
public class Article extends Model<Article> {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String title;
    
    private String content;
    
    private Long authorId;
    
    private Integer viewCount;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @Override
    public Serializable pkVal() {
        return this.id;
    }
    
    /**
     * 发布文章
     */
    public boolean publish() {
        this.setViewCount(0);
        return this.insert();
    }
    
    /**
     * 增加浏览量
     */
    public boolean incrementViewCount() {
        this.setViewCount(this.getViewCount() + 1);
        return this.updateById();
    }
    
    /**
     * 查询作者的所有文章
     */
    public List<Article> listByAuthor(Long authorId) {
        return this.selectList(
            new QueryWrapper<Article>()
                .eq("author_id", authorId)
                .orderByDesc("create_time")
        );
    }
}

/**
 * 使用示例
 */
public class ArticleDemo {
    
    public void demo() {
        // 发布文章
        Article article = new Article();
        article.setTitle("MyBatis Plus 入门");
        article.setContent("详细介绍 MyBatis Plus...");
        article.setAuthorId(1L);
        article.publish();
        
        // 增加浏览量
        Article viewedArticle = new Article();
        viewedArticle.setId(article.getId());
        viewedArticle = viewedArticle.selectById();
        viewedArticle.incrementViewCount();
        
        // 查询作者的文章
        List<Article> myArticles = new Article().listByAuthor(1L);
    }
}
```

### 场景2：业务逻辑封装

```java
/**
 * 订单实体（封装业务逻辑）
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order")
public class Order extends Model<Order> {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String orderNo;
    
    private Long userId;
    
    private BigDecimal amount;
    
    private Integer status;  // 0:待支付 1:已支付 2:已取消
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @Override
    public Serializable pkVal() {
        return this.id;
    }
    
    /**
     * 创建订单
     */
    public boolean create(Long userId, BigDecimal amount) {
        this.setOrderNo(generateOrderNo());
        this.setUserId(userId);
        this.setAmount(amount);
        this.setStatus(0);
        return this.insert();
    }
    
    /**
     * 支付订单
     */
    public boolean pay() {
        // 检查状态
        if (this.getStatus() != 0) {
            throw new BusinessException("订单状态不正确");
        }
        
        // 更新状态
        this.setStatus(1);
        return this.updateById();
    }
    
    /**
     * 取消订单
     */
    public boolean cancel() {
        if (this.getStatus() != 0) {
            throw new BusinessException("只能取消待支付订单");
        }
        
        this.setStatus(2);
        return this.updateById();
    }
    
    /**
     * 查询用户订单
     */
    public List<Order> listByUser(Long userId) {
        return this.selectList(
            new QueryWrapper<Order>()
                .eq("user_id", userId)
                .orderByDesc("create_time")
        );
    }
    
    /**
     * 查询待支付订单
     */
    public List<Order> listPending(Long userId) {
        return this.selectList(
            new QueryWrapper<Order>()
                .eq("user_id", userId)
                .eq("status", 0)
                .orderByDesc("create_time")
        );
    }
    
    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis();
    }
}
```

### 场景3：数据验证

```java
/**
 * 用户实体（带验证）
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user")
public class User extends Model<User> {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String username;
    
    private String password;
    
    private String email;
    
    @Override
    public Serializable pkVal() {
        return this.id;
    }
    
    /**
     * 注册用户（带验证）
     */
    public boolean register() {
        // 验证用户名
        if (StringUtils.isBlank(this.username)) {
            throw new BusinessException("用户名不能为空");
        }
        
        if (this.username.length() < 3 || this.username.length() > 20) {
            throw new BusinessException("用户名长度必须在3-20之间");
        }
        
        // 检查用户名是否已存在
        Long count = this.selectCount(
            new QueryWrapper<User>().eq("username", this.username)
        );
        
        if (count > 0) {
            throw new BusinessException("用户名已存在");
        }
        
        // 验证邮箱
        if (!isValidEmail(this.email)) {
            throw new BusinessException("邮箱格式不正确");
        }
        
        // 密码加密
        this.password = encryptPassword(this.password);
        
        // 插入数据
        return this.insert();
    }
    
    /**
     * 更新个人信息（带验证）
     */
    public boolean updateProfile(String email) {
        if (!isValidEmail(email)) {
            throw new BusinessException("邮箱格式不正确");
        }
        
        this.setEmail(email);
        return this.updateById();
    }
    
    /**
     * 修改密码
     */
    public boolean changePassword(String oldPassword, String newPassword) {
        // 验证旧密码
        if (!this.password.equals(encryptPassword(oldPassword))) {
            throw new BusinessException("原密码不正确");
        }
        
        // 更新密码
        this.password = encryptPassword(newPassword);
        return this.updateById();
    }
    
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
    
    private String encryptPassword(String password) {
        // 实际应使用 BCrypt 等加密算法
        return DigestUtils.md5DigestAsHex(password.getBytes());
    }
}
```

---

## ActiveRecord vs 传统方式

### 代码对比

```java
// ========== 传统方式 ==========
@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public boolean save(User user) {
        return userMapper.insert(user) > 0;
    }
    
    public User getById(Long id) {
        return userMapper.selectById(id);
    }
    
    public boolean update(User user) {
        return userMapper.updateById(user) > 0;
    }
    
    public boolean delete(Long id) {
        return userMapper.deleteById(id) > 0;
    }
}

// 使用
@Autowired
private UserService userService;

public void demo() {
    User user = new User();
    user.setName("张三");
    userService.save(user);
    
    User result = userService.getById(1L);
    result.setAge(20);
    userService.update(result);
}

// ========== ActiveRecord 方式 ==========
public void demo() {
    // 直接使用实体对象
    User user = new User();
    user.setName("张三");
    user.insert();
    
    User result = new User();
    result.setId(1L);
    result = result.selectById();
    result.setAge(20);
    result.updateById();
}
```

### 优缺点对比

**ActiveRecord 优点：**
- 代码简洁，减少 Service 层
- 面向对象，符合直觉
- 适合快速原型开发
- 业务逻辑封装在实体中

**ActiveRecord 缺点：**
- 实体类职责过重（违反单一职责原则）
- 难以进行单元测试（实体依赖数据库）
- 不适合复杂业务场景
- 事务管理不够灵活

**传统方式优点：**
- 职责分离清晰
- 易于测试和维护
- 适合复杂业务
- 事务管理灵活

**传统方式缺点：**
- 代码量较多
- 需要多层调用

---

## 最佳实践

### 1. 混合使用

```java
/**
 * 简单操作使用 ActiveRecord
 * 复杂业务使用传统 Service
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class User extends Model<User> {
    // ... 字段定义
    
    @Override
    public Serializable pkVal() {
        return this.id;
    }
}

@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 简单查询：使用 ActiveRecord
     */
    public User getById(Long id) {
        User user = new User();
        user.setId(id);
        return user.selectById();
    }
    
    /**
     * 复杂业务：使用传统方式
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean register(UserRegisterDTO dto) {
        // 1. 验证用户名
        // 2. 发送验证码
        // 3. 创建用户
        // 4. 创建账户
        // 5. 发送欢迎邮件
        // ... 复杂业务逻辑
        return true;
    }
}
```

### 2. 适用场景

```java
/**
 * 适合使用 ActiveRecord 的场景
 */
// 1. 快速原型开发
// 2. 简单的 CRUD 操作
// 3. 数据模型简单
// 4. 业务逻辑简单

/**
 * 不适合使用 ActiveRecord 的场景
 */
// 1. 复杂业务逻辑
// 2. 需要事务管理
// 3. 多表关联操作
// 4. 需要高度解耦
```

### 3. 事务处理

```java
/**
 * ActiveRecord 中的事务处理
 */
@Component
public class TransactionHelper {
    
    @Autowired
    private PlatformTransactionManager transactionManager;
    
    /**
     * 在事务中执行
     */
    public <T> T executeInTransaction(Supplier<T> action) {
        TransactionStatus status = transactionManager.getTransaction(
            new DefaultTransactionDefinition()
        );
        
        try {
            T result = action.get();
            transactionManager.commit(status);
            return result;
        } catch (Exception e) {
            transactionManager.rollback(status);
            throw e;
        }
    }
}

// 使用
@Autowired
private TransactionHelper transactionHelper;

public void demo() {
    transactionHelper.executeInTransaction(() -> {
        // 创建用户
        User user = new User();
        user.setName("张三");
        user.insert();
        
        // 创建账户
        Account account = new Account();
        account.setUserId(user.getId());
        account.setBalance(BigDecimal.ZERO);
        account.insert();
        
        return true;
    });
}
```

---

## 关键点总结

1. **Model 继承**：实体类继承 Model<T> 获得 CRUD 能力
2. **pkVal() 方法**：必须重写，指定主键字段
3. **直接操作**：实体对象可直接调用 CRUD 方法
4. **业务封装**：可在实体中封装业务逻辑方法
5. **适用场景**：简单 CRUD、快速原型、小型项目
6. **不适用场景**：复杂业务、需要高度解耦、企业级应用
7. **混合使用**：简单操作用 ActiveRecord，复杂业务用传统方式

---

## 参考资料

- [ActiveRecord 模式](https://baomidou.com/pages/98e51d/)
- [ActiveRecord 设计模式](https://en.wikipedia.org/wiki/Active_record_pattern)

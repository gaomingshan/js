# MyBatis Plus 面试题汇总

## 基础篇

### 1. MyBatis Plus 是什么？它解决了什么问题？

**答案：**
MyBatis Plus 是 MyBatis 的增强工具，在 MyBatis 的基础上只做增强不做改变。

**解决的问题：**
- 消除样板代码：提供 BaseMapper 和 IService，内置 CRUD 方法
- 简化查询：提供 Wrapper 条件构造器
- 提升效率：代码生成器、分页插件等
- 性能优化：内置多种优化方案

### 2. BaseMapper 和 Mapper 的区别？

**答案：**
- **BaseMapper**：MyBatis Plus 提供的接口，内置了常用的 CRUD 方法
- **Mapper**：MyBatis 原生接口，需要手写 SQL

**优势：**
```java
// BaseMapper：零 SQL
public interface UserMapper extends BaseMapper<User> {
    // 无需编写任何方法，已有 insert、selectById、updateById 等
}

// 原生 Mapper：需要手写 SQL
public interface UserMapper {
    @Select("SELECT * FROM user WHERE id = #{id}")
    User selectById(Long id);
}
```

### 3. @TableName、@TableId、@TableField 注解的作用？

**答案：**
- **@TableName**：指定实体类对应的表名
- **@TableId**：标注主键字段，指定主键生成策略
- **@TableField**：标注字段属性，指定字段映射、填充策略等

**示例：**
```java
@TableName("sys_user")
public class User {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    @TableField("user_name")
    private String username;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
```

### 4. MyBatis Plus 支持哪些主键生成策略？

**答案：**
- **AUTO**：数据库自增
- **NONE**：无状态
- **INPUT**：手动输入
- **ASSIGN_ID**：雪花算法（默认，Long/String）
- **ASSIGN_UUID**：UUID（String）

**推荐：**
- 分布式系统：ASSIGN_ID（雪花算法）
- 单体应用：AUTO（数据库自增）

---

## 查询篇

### 5. QueryWrapper 和 LambdaQueryWrapper 的区别？

**答案：**
- **QueryWrapper**：使用字符串指定字段名
- **LambdaQueryWrapper**：使用 Lambda 表达式，编译期检查

**对比：**
```java
// QueryWrapper：字段名字符串（可能拼写错误）
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("user_name", "张三");

// LambdaQueryWrapper：类型安全（编译期检查）
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getUsername, "张三");
```

**推荐：** 使用 LambdaQueryWrapper，避免字段名拼写错误。

### 6. 如何实现分页查询？

**答案：**
```java
// 1. 配置分页插件
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return interceptor;
}

// 2. 使用 Page 对象
Page<User> page = new Page<>(1, 10);  // 第1页，每页10条
Page<User> result = userMapper.selectPage(page, null);

List<User> records = result.getRecords();  // 数据列表
long total = result.getTotal();  // 总记录数
```

### 7. 深分页问题如何优化？

**答案：**

**问题：** `LIMIT 1000000, 10` 需要扫描前 1000010 条记录，性能差。

**优化方案：**
1. **限制最大页码**：最多查询前 1000 页
2. **子查询优化**：先查 ID，再查详情
3. **游标分页**：记录上次查询的最大 ID

```java
// 方案2：子查询
SELECT * FROM user 
WHERE id IN (
    SELECT id FROM user ORDER BY id LIMIT 1000000, 10
)

// 方案3：游标分页
SELECT * FROM user 
WHERE id > #{lastId} 
ORDER BY id LIMIT 10
```

---

## 高级特性篇

### 8. 逻辑删除的原理和实现？

**答案：**

**原理：** 删除操作转换为更新操作，查询时自动过滤已删除数据。

**实现：**
```java
// 1. 实体类标注
@TableLogic
private Integer deleted;  // 0:未删除 1:已删除

// 2. 全局配置
mybatis-plus:
  global-config:
    db-config:
      logic-delete-value: 1
      logic-not-delete-value: 0

// 3. 使用
userMapper.deleteById(1L);
// 实际 SQL: UPDATE user SET deleted = 1 WHERE id = 1
```

**注意事项：**
- 唯一索引需要包含 deleted 字段
- 查询已删除数据需要自定义 SQL

### 9. 乐观锁的实现原理？

**答案：**

**原理：** 通过版本号机制，更新时检查版本号是否一致。

**实现：**
```java
// 1. 实体类
@Version
private Integer version;

// 2. 配置插件
interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());

// 3. 使用
User user = userMapper.selectById(1L);  // version = 1
user.setAge(20);
userMapper.updateById(user);
// SQL: UPDATE user SET age = 20, version = 2 
//      WHERE id = 1 AND version = 1
```

**适用场景：** 库存扣减、账户余额等并发场景。

### 10. 自动填充如何实现？

**答案：**
```java
// 1. 实体类标注
@TableField(fill = FieldFill.INSERT)
private LocalDateTime createTime;

@TableField(fill = FieldFill.INSERT_UPDATE)
private LocalDateTime updateTime;

// 2. 实现 MetaObjectHandler
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", 
                             LocalDateTime.class, LocalDateTime.now());
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", 
                             LocalDateTime.class, LocalDateTime.now());
    }
}
```

---

## 性能优化篇

### 11. 批量插入如何优化？

**答案：**

**问题：** `saveBatch()` 默认逐条插入，性能差。

**优化方案：**
```java
// 方案1：启用批处理重写
spring:
  datasource:
    url: jdbc:mysql://...?rewriteBatchedStatements=true

// 方案2：自定义批量插入
@Insert("<script>" +
        "INSERT INTO user (id, name) VALUES " +
        "<foreach collection='list' item='item' separator=','>" +
        "(#{item.id}, #{item.name})" +
        "</foreach>" +
        "</script>")
int insertBatch(@Param("list") List<User> users);

// 性能对比
// saveBatch(10000条): 约10秒
// insertBatch(10000条): 约0.5秒 (提升20倍)
```

### 12. N+1 查询问题如何解决？

**答案：**

**问题：** 循环查询关联数据，导致大量数据库交互。

```java
// ❌ N+1 问题
List<Order> orders = orderMapper.selectList(null);  // 1次
for (Order order : orders) {
    User user = userMapper.selectById(order.getUserId());  // N次
}

// ✅ 解决方案：批量查询
List<Order> orders = orderMapper.selectList(null);
Set<Long> userIds = orders.stream()
    .map(Order::getUserId)
    .collect(Collectors.toSet());
Map<Long, User> userMap = userMapper.selectBatchIds(userIds)
    .stream()
    .collect(Collectors.toMap(User::getId, u -> u));

// 总查询：2次（1 + 1）
```

### 13. 如何分析和优化慢查询？

**答案：**

**分析工具：**
1. **p6spy**：SQL 日志分析
2. **EXPLAIN**：执行计划分析
3. **慢查询日志**：记录超时 SQL

**优化步骤：**
```sql
-- 1. EXPLAIN 分析
EXPLAIN SELECT * FROM user WHERE name = '张三';
-- 检查 type、key、rows、Extra

-- 2. 添加索引
CREATE INDEX idx_name ON user(name);

-- 3. 优化 SQL
-- 只查询需要的字段
SELECT id, name FROM user WHERE name = '张三';

-- 避免 SELECT *
-- 避免左模糊匹配
-- 避免函数索引失效
```

---

## 扩展定制篇

### 14. 如何自定义通用方法？

**答案：**
```java
// 1. 继承 AbstractMethod
public class SelectByIds extends AbstractMethod {
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String sql = "<script>" +
            "SELECT * FROM " + tableInfo.getTableName() +
            " WHERE id IN " +
            "<foreach collection='coll' item='item' open='(' separator=',' close=')'>" +
            "#{item}" +
            "</foreach>" +
            "</script>";
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, sql, Object.class);
        
        return addSelectMappedStatement(mapperClass, "selectByIds", 
                                       sqlSource, modelClass, tableInfo);
    }
}

// 2. 注册到 SQL 注入器
@Bean
public ISqlInjector sqlInjector() {
    return new CustomSqlInjector();
}
```

### 15. 多数据源如何配置？

**答案：**
```yaml
# 配置多数据源
spring:
  datasource:
    dynamic:
      primary: master
      datasource:
        master:
          url: jdbc:mysql://localhost:3306/db1
        slave:
          url: jdbc:mysql://localhost:3307/db2
```

```java
// 使用 @DS 切换数据源
@Service
public class UserServiceImpl {
    
    @DS("master")  // 使用主库
    public void save(User user) {
        userMapper.insert(user);
    }
    
    @DS("slave")   // 使用从库
    public List<User> list() {
        return userMapper.selectList(null);
    }
}
```

---

## 企业实战篇

### 16. 多租户如何实现？

**答案：**
```java
// 1. 配置多租户插件
TenantLineInnerInterceptor tenantInterceptor = new TenantLineInnerInterceptor();
tenantInterceptor.setTenantLineHandler(new TenantLineHandler() {
    @Override
    public Expression getTenantId() {
        return new LongValue(TenantContextHolder.getTenantId());
    }
    
    @Override
    public String getTenantIdColumn() {
        return "tenant_id";
    }
});

// 2. 设置租户上下文
TenantContextHolder.setTenantId(1L);

// 3. 自动添加租户条件
userMapper.selectList(null);
// SQL: SELECT * FROM user WHERE tenant_id = 1
```

### 17. 数据权限如何控制？

**答案：**
```java
// 数据权限范围
public enum DataScope {
    ALL,              // 全部数据
    DEPT,             // 本部门
    DEPT_AND_CHILD,   // 本部门及子部门
    SELF              // 仅本人
}

// 自定义拦截器添加数据权限
public class DataPermissionInterceptor implements InnerInterceptor {
    @Override
    public void beforeQuery(...) {
        // 根据用户角色添加数据权限 SQL
        String permissionSql = buildPermissionSql(loginUser);
        // 改写 SQL
    }
}
```

### 18. 分布式事务如何处理？

**答案：**

**方案对比：**
- **Seata AT**：自动补偿，对业务无侵入
- **消息队列**：最终一致性
- **TCC**：三阶段提交，灵活但复杂

**Seata 示例：**
```java
@GlobalTransactional(rollbackFor = Exception.class)
public void createOrder(OrderDTO dto) {
    // 1. 创建订单
    orderService.save(order);
    
    // 2. 扣减库存（远程调用）
    stockService.reduceStock(dto.getProductId(), dto.getQuantity());
    
    // 3. 扣减余额（远程调用）
    accountService.deduct(dto.getUserId(), dto.getAmount());
    
    // 任一步骤失败，全部回滚
}
```

---

## 常见问题篇

### 19. 事务不生效的常见原因？

**答案：**
1. **方法不是 public**：AOP 只能代理 public 方法
2. **同类方法调用**：直接调用不走代理
3. **异常被捕获**：异常没有抛出
4. **数据库引擎**：MyISAM 不支持事务

**解决方案：**
```java
// 问题1：同类调用
@Service
public class UserService {
    @Autowired
    private UserService self;  // 注入自身
    
    public void outer() {
        self.inner();  // 通过代理调用
    }
    
    @Transactional
    public void inner() {
        // 事务生效
    }
}
```

### 20. 如何防止 SQL 注入？

**答案：**
```java
// ✅ 安全：使用 #{}
@Select("SELECT * FROM user WHERE id = #{id}")
User selectById(Long id);

// ❌ 危险：使用 ${}
@Select("SELECT * FROM user WHERE id = ${id}")
User selectByIdDanger(Long id);

// Wrapper 自动防注入
wrapper.eq(User::getUsername, userInput);  // 安全

// 危险用法
wrapper.apply("username = '" + userInput + "'");  // 不安全
```

---

## 面试技巧

### 高频问题
1. MyBatis Plus 和 MyBatis 的区别
2. 如何实现分页查询
3. 逻辑删除的实现原理
4. 乐观锁如何使用
5. 批量操作如何优化

### 回答要点
- **理论**：说明原理和机制
- **实践**：结合项目经验
- **优化**：性能优化方案
- **对比**：方案选择权衡

### 加分项
- 阅读过源码
- 自定义过插件
- 解决过性能问题
- 有大型项目经验

---

## 总结

MyBatis Plus 作为 MyBatis 的增强工具，核心价值在于：
1. **提升效率**：减少样板代码
2. **简化开发**：丰富的 API
3. **性能优化**：内置优化方案
4. **易于扩展**：灵活的扩展机制

**学习建议：**
- 掌握核心特性
- 理解实现原理
- 积累实战经验
- 关注性能优化

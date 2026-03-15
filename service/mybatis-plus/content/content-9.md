# 4.3 Wrapper 最佳实践

## 概述

虽然 Wrapper 功能强大，但在实际使用中需要注意安全性、性能和可维护性。本节总结 Wrapper 使用的最佳实践，帮助开发者避免常见陷阱，写出高质量的代码。

**核心内容：**
- SQL 注入防护
- 复杂查询的拆分与组合
- Wrapper 复用与封装
- 常见错误与解决方案

---

## 避免 SQL 注入风险

### SQL 注入的危险

```java
// ❌ 极度危险：直接拼接用户输入
String name = request.getParameter("name");  // 用户输入：' OR '1'='1
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.apply("name = '" + name + "'");
// SQL: WHERE name = '' OR '1'='1'  --> 绕过所有条件！

List<User> users = userMapper.selectList(wrapper);
// 返回所有用户数据！
```

### 安全的参数化查询

```java
// ✅ 正确：使用参数化查询
String name = request.getParameter("name");
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, name);  // 自动参数化
// SQL: WHERE name = ?  参数: ['张三']
```

### apply 方法的安全使用

```java
// ❌ 错误：直接拼接
wrapper.apply("DATE_FORMAT(create_time, '%Y-%m-%d') = '" + date + "'");

// ✅ 正确：使用占位符
wrapper.apply("DATE_FORMAT(create_time, '%Y-%m-%d') = {0}", date);
// SQL: WHERE DATE_FORMAT(create_time, '%Y-%m-%d') = ?

// ✅ 更好：使用函数方法
wrapper.apply("YEAR(create_time) = {0}", year)
       .apply("MONTH(create_time) = {0}", month);
```

### 动态排序的安全处理

```java
/**
 * 不安全的排序
 */
// ❌ 危险：直接使用用户输入
String orderBy = request.getParameter("orderBy");  // id; DROP TABLE user;
wrapper.orderBy(true, true, orderBy);  // SQL 注入风险！

/**
 * 安全的排序
 */
// ✅ 方法1：白名单验证
private static final Set<String> ALLOWED_SORT_FIELDS = 
    Set.of("id", "name", "age", "create_time");

public List<User> list(String orderBy, boolean isAsc) {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    
    if (ALLOWED_SORT_FIELDS.contains(orderBy)) {
        wrapper.orderBy(true, isAsc, getSFunction(orderBy));
    } else {
        // 默认排序
        wrapper.orderByDesc(User::getCreateTime);
    }
    
    return userMapper.selectList(wrapper);
}

// ✅ 方法2：使用枚举
public enum SortField {
    ID(User::getId),
    NAME(User::getName),
    AGE(User::getAge),
    CREATE_TIME(User::getCreateTime);
    
    private final SFunction<User, ?> function;
    
    SortField(SFunction<User, ?> function) {
        this.function = function;
    }
    
    public SFunction<User, ?> getFunction() {
        return function;
    }
}

// 使用
wrapper.orderBy(true, isAsc, sortField.getFunction());
```

### 防止 SQL 注入检查清单

```java
/**
 * SQL 注入检查清单
 */
public class WrapperSecurityChecker {
    
    /**
     * ✅ 安全的方法
     */
    public void safe() {
        // 1. 使用 eq, like 等内置方法
        wrapper.eq(User::getName, userInput);  // ✅ 安全
        
        // 2. apply 使用占位符
        wrapper.apply("DATE(create_time) = {0}", date);  // ✅ 安全
        
        // 3. in 方法
        wrapper.in(User::getId, idList);  // ✅ 安全
    }
    
    /**
     * ❌ 危险的方法
     */
    public void unsafe() {
        // 1. 直接拼接字符串
        wrapper.apply("name = '" + userInput + "'");  // ❌ 危险
        
        // 2. 动态表名（未验证）
        wrapper.from(tableName);  // ❌ 危险
        
        // 3. 动态字段名（未验证）
        wrapper.orderBy(true, true, fieldName);  // ❌ 危险
    }
}
```

---

## 复杂查询的拆分与组合

### 复杂条件的拆分

```java
/**
 * ❌ 不好：所有条件堆在一起
 */
public List<User> complexQuery(UserQueryDTO dto) {
    return lambdaQuery()
        .eq(dto.getStatus() != null, User::getStatus, dto.getStatus())
        .like(StringUtils.isNotBlank(dto.getName()), User::getName, dto.getName())
        .ge(dto.getMinAge() != null, User::getAge, dto.getMinAge())
        .le(dto.getMaxAge() != null, User::getAge, dto.getMaxAge())
        .between(dto.getStartDate() != null && dto.getEndDate() != null,
                 User::getCreateTime, dto.getStartDate(), dto.getEndDate())
        .and(dto.isVip(), w -> w.ge(User::getVipLevel, 1).or().ge(User::getTotalAmount, 10000))
        .or(dto.hasDiscount(), w -> w.eq(User::getHasDiscount, true))
        .orderByDesc(User::getCreateTime)
        .list();
}

/**
 * ✅ 更好：条件分组，逻辑清晰
 */
public List<User> complexQuery(UserQueryDTO dto) {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    
    // 1. 基础条件
    applyBasicConditions(wrapper, dto);
    
    // 2. VIP 条件
    if (dto.isVip()) {
        applyVipConditions(wrapper, dto);
    }
    
    // 3. 折扣条件
    if (dto.hasDiscount()) {
        applyDiscountConditions(wrapper, dto);
    }
    
    // 4. 排序
    applySorting(wrapper, dto);
    
    return list(wrapper);
}

private void applyBasicConditions(LambdaQueryWrapper<User> wrapper, UserQueryDTO dto) {
    wrapper.eq(dto.getStatus() != null, User::getStatus, dto.getStatus())
           .like(StringUtils.isNotBlank(dto.getName()), User::getName, dto.getName())
           .ge(dto.getMinAge() != null, User::getAge, dto.getMinAge())
           .le(dto.getMaxAge() != null, User::getAge, dto.getMaxAge())
           .between(dto.getStartDate() != null && dto.getEndDate() != null,
                    User::getCreateTime, dto.getStartDate(), dto.getEndDate());
}

private void applyVipConditions(LambdaQueryWrapper<User> wrapper, UserQueryDTO dto) {
    wrapper.and(w -> w.ge(User::getVipLevel, 1).or().ge(User::getTotalAmount, 10000));
}

private void applyDiscountConditions(LambdaQueryWrapper<User> wrapper, UserQueryDTO dto) {
    wrapper.eq(User::getHasDiscount, true);
}

private void applySorting(LambdaQueryWrapper<User> wrapper, UserQueryDTO dto) {
    if (StringUtils.isNotBlank(dto.getOrderBy())) {
        // 根据排序字段动态排序
        wrapper.orderBy(true, dto.isAsc(), getSortFunction(dto.getOrderBy()));
    } else {
        // 默认排序
        wrapper.orderByDesc(User::getCreateTime);
    }
}
```

### 条件组合的模式

```java
/**
 * 策略模式：不同条件组合策略
 */
public interface QueryStrategy {
    void apply(LambdaQueryWrapper<User> wrapper, UserQueryDTO dto);
}

/**
 * 普通用户查询策略
 */
public class NormalUserQueryStrategy implements QueryStrategy {
    @Override
    public void apply(LambdaQueryWrapper<User> wrapper, UserQueryDTO dto) {
        wrapper.eq(User::getUserType, UserType.NORMAL)
               .eq(User::getStatus, 1);
    }
}

/**
 * VIP 用户查询策略
 */
public class VipUserQueryStrategy implements QueryStrategy {
    @Override
    public void apply(LambdaQueryWrapper<User> wrapper, UserQueryDTO dto) {
        wrapper.ge(User::getVipLevel, 1)
               .or()
               .ge(User::getTotalAmount, 10000);
    }
}

/**
 * 使用策略
 */
public List<User> queryUsers(UserQueryDTO dto) {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    
    // 基础条件
    wrapper.like(StringUtils.isNotBlank(dto.getName()), 
                 User::getName, dto.getName());
    
    // 根据用户类型选择策略
    QueryStrategy strategy = getQueryStrategy(dto.getUserType());
    strategy.apply(wrapper, dto);
    
    return list(wrapper);
}
```

---

## Wrapper 复用与封装

### 通用 Wrapper 工厂

```java
/**
 * Wrapper 工厂类
 */
public class WrapperFactory {
    
    /**
     * 创建基础查询 Wrapper（排除已删除）
     */
    public static <T> LambdaQueryWrapper<T> createBasicQuery() {
        LambdaQueryWrapper<T> wrapper = new LambdaQueryWrapper<>();
        // 可以添加通用条件，如排除已删除
        return wrapper;
    }
    
    /**
     * 创建分页查询 Wrapper
     */
    public static <T> LambdaQueryWrapper<T> createPageQuery(
            String keyword, 
            SFunction<T, ?>... searchFields) {
        LambdaQueryWrapper<T> wrapper = createBasicQuery();
        
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> {
                for (int i = 0; i < searchFields.length; i++) {
                    if (i > 0) {
                        w.or();
                    }
                    w.like(searchFields[i], keyword);
                }
            });
        }
        
        return wrapper;
    }
    
    /**
     * 创建时间范围查询 Wrapper
     */
    public static <T> LambdaQueryWrapper<T> createTimeRangeQuery(
            LocalDateTime startTime,
            LocalDateTime endTime,
            SFunction<T, LocalDateTime> timeField) {
        LambdaQueryWrapper<T> wrapper = createBasicQuery();
        wrapper.between(startTime != null && endTime != null,
                        timeField, startTime, endTime);
        return wrapper;
    }
}

// 使用
public List<User> search(String keyword) {
    LambdaQueryWrapper<User> wrapper = WrapperFactory.createPageQuery(
        keyword, 
        User::getName, 
        User::getEmail, 
        User::getPhone
    );
    return list(wrapper);
}
```

### BaseService 封装通用方法

```java
/**
 * 基础 Service，封装通用查询方法
 */
public abstract class BaseServiceImpl<M extends BaseMapper<T>, T> 
        extends ServiceImpl<M, T> {
    
    /**
     * 关键字搜索（搜索多个字段）
     */
    protected List<T> searchByKeyword(String keyword, 
                                       SFunction<T, ?>... searchFields) {
        if (StringUtils.isBlank(keyword)) {
            return list();
        }
        
        return lambdaQuery()
            .and(w -> {
                for (int i = 0; i < searchFields.length; i++) {
                    if (i > 0) {
                        w.or();
                    }
                    w.like(searchFields[i], keyword);
                }
            })
            .list();
    }
    
    /**
     * 时间范围查询
     */
    protected List<T> listByTimeRange(LocalDateTime start, 
                                       LocalDateTime end,
                                       SFunction<T, LocalDateTime> timeField) {
        return lambdaQuery()
            .between(start != null && end != null, timeField, start, end)
            .orderByDesc(timeField)
            .list();
    }
    
    /**
     * 状态查询
     */
    protected List<T> listByStatus(Integer status, 
                                    SFunction<T, Integer> statusField) {
        return lambdaQuery()
            .eq(status != null, statusField, status)
            .list();
    }
}

// 业务 Service 继承
@Service
public class UserServiceImpl extends BaseServiceImpl<UserMapper, User> 
        implements UserService {
    
    @Override
    public List<User> searchUsers(String keyword) {
        return searchByKeyword(keyword, 
            User::getName, 
            User::getEmail, 
            User::getPhone
        );
    }
    
    @Override
    public List<User> listByCreateTime(LocalDateTime start, LocalDateTime end) {
        return listByTimeRange(start, end, User::getCreateTime);
    }
}
```

### Wrapper 构建器模式

```java
/**
 * 用户查询构建器
 */
public class UserQueryBuilder {
    private final LambdaQueryWrapper<User> wrapper;
    
    private UserQueryBuilder() {
        this.wrapper = new LambdaQueryWrapper<>();
    }
    
    public static UserQueryBuilder create() {
        return new UserQueryBuilder();
    }
    
    public UserQueryBuilder name(String name) {
        if (StringUtils.isNotBlank(name)) {
            wrapper.like(User::getName, name);
        }
        return this;
    }
    
    public UserQueryBuilder age(Integer minAge, Integer maxAge) {
        wrapper.ge(minAge != null, User::getAge, minAge)
               .le(maxAge != null, User::getAge, maxAge);
        return this;
    }
    
    public UserQueryBuilder deptId(Long deptId) {
        wrapper.eq(deptId != null, User::getDeptId, deptId);
        return this;
    }
    
    public UserQueryBuilder status(Integer status) {
        wrapper.eq(status != null, User::getStatus, status);
        return this;
    }
    
    public UserQueryBuilder createTime(LocalDateTime start, LocalDateTime end) {
        wrapper.between(start != null && end != null,
                        User::getCreateTime, start, end);
        return this;
    }
    
    public UserQueryBuilder orderByCreateTime(boolean isAsc) {
        wrapper.orderBy(true, isAsc, User::getCreateTime);
        return this;
    }
    
    public LambdaQueryWrapper<User> build() {
        return wrapper;
    }
}

// 使用
LambdaQueryWrapper<User> wrapper = UserQueryBuilder.create()
    .name("张三")
    .age(18, 30)
    .status(1)
    .orderByCreateTime(false)
    .build();

List<User> users = userMapper.selectList(wrapper);
```

---

## 常见错误与解决方案

### 错误1：字段名拼写错误

```java
// ❌ 错误：字段名拼写错误（编译通过，运行报错）
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("user_name", "张三");  // 实际字段是 userName

// ✅ 解决：使用 Lambda 避免拼写错误
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getUserName, "张三");  // 编译期检查
```

### 错误2：驼峰与下划线混淆

```java
// ❌ 错误：数据库字段是下划线，但用了驼峰
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("createTime", now);  // 数据库字段是 create_time

// ✅ 解决1：使用正确的列名
wrapper.eq("create_time", now);

// ✅ 解决2：使用 Lambda（自动转换）
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getCreateTime, now);
```

### 错误3：selectOne 返回多条记录

```java
// ❌ 错误：可能返回多条记录
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getAge, 18);  // 可能有多个18岁用户
User user = userMapper.selectOne(wrapper);  // 抛出异常！

// ✅ 解决1：使用 selectList
List<User> users = userMapper.selectList(wrapper);
User user = CollectionUtils.isNotEmpty(users) ? users.get(0) : null;

// ✅ 解决2：添加 last("LIMIT 1")
wrapper.eq(User::getAge, 18)
       .last("LIMIT 1");
User user = userMapper.selectOne(wrapper);
```

### 错误4：IN 查询空集合

```java
// ❌ 错误：ID 列表为空时报错
List<Long> ids = new ArrayList<>();  // 空列表
wrapper.in(User::getId, ids);  // 抛出异常

// ✅ 解决：先判断是否为空
if (CollectionUtils.isNotEmpty(ids)) {
    wrapper.in(User::getId, ids);
}

// ✅ 更好：条件化
wrapper.in(CollectionUtils.isNotEmpty(ids), User::getId, ids);
```

### 错误5：更新时忘记添加条件

```java
// ❌ 危险：没有 WHERE 条件，更新所有记录！
UpdateWrapper<User> wrapper = new UpdateWrapper<>();
wrapper.set("status", 1);  // 没有 where 条件
userMapper.update(null, wrapper);  // 所有用户状态都变成1！

// ✅ 解决：添加防全表更新插件
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    // 防止全表更新删除
    interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());
    return interceptor;
}

// ✅ 必须添加条件
wrapper.set("status", 1)
       .eq("id", 1);
```

### 错误6：分页参数错误

```java
// ❌ 错误：页码从0开始
Page<User> page = new Page<>(0, 10);  // 实际查询第1页

// ✅ 正确：页码从1开始
Page<User> page = new Page<>(1, 10);  // 第1页

// ❌ 错误：每页大小过大
Page<User> page = new Page<>(1, 100000);  // 可能OOM

// ✅ 解决：限制最大页面大小
int maxSize = 500;
int size = Math.min(dto.getSize(), maxSize);
Page<User> page = new Page<>(dto.getCurrent(), size);
```

---

## 性能优化技巧

### 1. 只查询需要的字段

```java
// ❌ 不好：查询所有字段
List<User> users = userMapper.selectList(null);

// ✅ 更好：只查询需要的字段
List<User> users = lambdaQuery()
    .select(User::getId, User::getName, User::getAge)
    .list();

// 性能提升：减少网络传输和内存占用
```

### 2. 避免 N+1 查询

```java
// ❌ N+1 问题
List<Order> orders = orderMapper.selectList(null);
for (Order order : orders) {
    // 循环查询用户信息（N次查询）
    User user = userMapper.selectById(order.getUserId());
    order.setUser(user);
}

// ✅ 解决：批量查询
List<Order> orders = orderMapper.selectList(null);
List<Long> userIds = orders.stream()
    .map(Order::getUserId)
    .distinct()
    .collect(Collectors.toList());

// 批量查询用户（1次查询）
List<User> users = userMapper.selectBatchIds(userIds);
Map<Long, User> userMap = users.stream()
    .collect(Collectors.toMap(User::getId, u -> u));

// 填充用户信息
orders.forEach(order -> order.setUser(userMap.get(order.getUserId())));
```

### 3. 使用覆盖索引

```java
// ❌ 不好：查询所有字段（回表）
List<User> users = lambdaQuery()
    .eq(User::getAge, 18)
    .list();

// ✅ 更好：只查询索引字段（覆盖索引）
List<Long> ids = lambdaQuery()
    .select(User::getId)
    .eq(User::getAge, 18)
    .list()
    .stream()
    .map(User::getId)
    .collect(Collectors.toList());
```

---

## 关键点总结

1. **安全第一**：避免 SQL 注入，使用参数化查询
2. **条件拆分**：复杂查询拆分为多个方法，提高可读性
3. **Wrapper 复用**：封装通用查询逻辑，减少重复代码
4. **Lambda 优先**：类型安全，重构友好
5. **性能优化**：只查询需要的字段，避免 N+1 问题
6. **防御编程**：检查空集合、空字符串，添加防全表更新插件
7. **代码规范**：统一团队编码风格，使用工厂或构建器模式

---

## 参考资料

- [条件构造器最佳实践](https://baomidou.com/pages/10c804/)
- [SQL 注入防护](https://baomidou.com/pages/f9a237/)
- [性能优化建议](https://baomidou.com/pages/a9f3b5/)

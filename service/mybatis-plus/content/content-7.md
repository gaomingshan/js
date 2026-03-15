# 4.1 QueryWrapper 与 UpdateWrapper

## 概述

Wrapper（条件构造器）是 MyBatis Plus 提供的强大工具，用于构建 SQL 的 WHERE、ORDER BY、GROUP BY 等条件。相比手写 SQL，Wrapper 提供了类型安全、链式调用、动态条件等优势。

**核心类：**
- `QueryWrapper<T>`：查询条件构造器
- `UpdateWrapper<T>`：更新条件构造器
- `LambdaQueryWrapper<T>`：Lambda 查询构造器（推荐）
- `LambdaUpdateWrapper<T>`：Lambda 更新构造器（推荐）

---

## 基本查询条件构造

### 等值查询（eq）

```java
// SELECT * FROM user WHERE name = '张三' AND age = 18
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("name", "张三")
       .eq("age", 18);
List<User> users = userMapper.selectList(wrapper);
```

### 不等值查询（ne）

```java
// SELECT * FROM user WHERE age != 18
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.ne("age", 18);
```

### 范围查询

```java
// gt: 大于
wrapper.gt("age", 18);  // age > 18

// ge: 大于等于
wrapper.ge("age", 18);  // age >= 18

// lt: 小于
wrapper.lt("age", 30);  // age < 30

// le: 小于等于
wrapper.le("age", 30);  // age <= 30

// between: 区间查询
wrapper.between("age", 18, 30);  // age BETWEEN 18 AND 30

// notBetween: 不在区间
wrapper.notBetween("age", 18, 30);  // age NOT BETWEEN 18 AND 30
```

### 模糊查询

```java
// like: 模糊匹配
wrapper.like("name", "张");  // name LIKE '%张%'

// notLike: 不匹配
wrapper.notLike("name", "张");  // name NOT LIKE '%张%'

// likeLeft: 左模糊
wrapper.likeLeft("name", "三");  // name LIKE '%三'

// likeRight: 右模糊
wrapper.likeRight("name", "张");  // name LIKE '张%'
```

### NULL 判断

```java
// isNull: 为 NULL
wrapper.isNull("email");  // email IS NULL

// isNotNull: 不为 NULL
wrapper.isNotNull("email");  // email IS NOT NULL
```

### IN 查询

```java
// in: 在集合中
List<Integer> ages = Arrays.asList(18, 20, 25);
wrapper.in("age", ages);  // age IN (18, 20, 25)

// 可变参数形式
wrapper.in("age", 18, 20, 25);

// notIn: 不在集合中
wrapper.notIn("age", ages);  // age NOT IN (18, 20, 25)
```

### 子查询

```java
// inSql: IN 子查询
wrapper.inSql("dept_id", "SELECT id FROM dept WHERE name = '技术部'");
// dept_id IN (SELECT id FROM dept WHERE name = '技术部')

// notInSql: NOT IN 子查询
wrapper.notInSql("id", "SELECT user_id FROM user_role WHERE role_id = 1");
```

---

## 复杂条件组合

### AND 条件（默认）

```java
// SELECT * FROM user WHERE name = '张三' AND age = 18
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("name", "张三")
       .eq("age", 18);  // 默认 AND 连接
```

### OR 条件

```java
// SELECT * FROM user WHERE name = '张三' OR age = 18
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("name", "张三")
       .or()
       .eq("age", 18);
```

### 嵌套条件

```java
// SELECT * FROM user 
// WHERE (name = '张三' OR name = '李四') AND age = 18
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.and(w -> w.eq("name", "张三").or().eq("name", "李四"))
       .eq("age", 18);

// 或使用 nested
wrapper.nested(w -> w.eq("name", "张三").or().eq("name", "李四"))
       .eq("age", 18);
```

### 复杂嵌套示例

```java
// SELECT * FROM user 
// WHERE age >= 18 
//   AND (name LIKE '%张%' OR email LIKE '%@qq.com')
//   AND status = 1
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.ge("age", 18)
       .and(w -> w.like("name", "张").or().like("email", "@qq.com"))
       .eq("status", 1);
```

---

## 字段选择与排除

### 选择特定字段

```java
// SELECT id, name, age FROM user
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.select("id", "name", "age");
List<User> users = userMapper.selectList(wrapper);
```

### 排除特定字段

```java
// SELECT * FROM user (排除敏感字段)
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.select(User.class, info -> {
    // 排除 password 和 id_card 字段
    String column = info.getColumn();
    return !column.equals("password") && !column.equals("id_card");
});
```

### 查询指定列（返回 Map）

```java
// 只查询部分字段，返回 Map
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.select("id", "name", "age");
List<Map<String, Object>> maps = userMapper.selectMaps(wrapper);

// 结果：[{id=1, name=张三, age=18}, ...]
```

### 查询单列

```java
// 只查询 ID 列表
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.select("id");
List<Object> ids = userMapper.selectObjs(wrapper);
// 结果：[1, 2, 3, ...]
```

---

## 排序、分组、聚合

### 排序

```java
// 单字段排序
wrapper.orderByAsc("age");   // ORDER BY age ASC
wrapper.orderByDesc("age");  // ORDER BY age DESC

// 多字段排序
wrapper.orderByAsc("age", "create_time");
// ORDER BY age ASC, create_time ASC

// 混合排序
wrapper.orderByAsc("age")
       .orderByDesc("create_time");
// ORDER BY age ASC, create_time DESC

// 动态排序
boolean isAsc = true;
wrapper.orderBy(true, isAsc, "age");
```

### 分组

```java
// GROUP BY
wrapper.select("dept_id", "COUNT(*) as count")
       .groupBy("dept_id");
// SELECT dept_id, COUNT(*) as count FROM user GROUP BY dept_id

// 多字段分组
wrapper.groupBy("dept_id", "role_id");
```

### HAVING

```java
// HAVING
wrapper.select("dept_id", "COUNT(*) as count")
       .groupBy("dept_id")
       .having("COUNT(*) > {0}", 5);
// GROUP BY dept_id HAVING COUNT(*) > 5
```

---

## UpdateWrapper 更新操作

### 基本更新

```java
// UPDATE user SET age = 30 WHERE name = '张三'
UpdateWrapper<User> wrapper = new UpdateWrapper<>();
wrapper.set("age", 30)
       .eq("name", "张三");
userMapper.update(null, wrapper);
```

### 批量更新

```java
// UPDATE user SET status = 1 WHERE id IN (1, 2, 3)
UpdateWrapper<User> wrapper = new UpdateWrapper<>();
wrapper.set("status", 1)
       .in("id", Arrays.asList(1L, 2L, 3L));
userMapper.update(null, wrapper);
```

### 使用 SQL 函数

```java
// UPDATE user SET age = age + 1 WHERE id = 1
UpdateWrapper<User> wrapper = new UpdateWrapper<>();
wrapper.setSql("age = age + 1")
       .eq("id", 1);
userMapper.update(null, wrapper);

// UPDATE user SET balance = balance - 100 WHERE id = 1
wrapper.setSql("balance = balance - 100")
       .eq("id", 1);
```

### 条件更新

```java
// UPDATE user SET age = 30 
// WHERE (name = '张三' OR name = '李四') AND status = 1
UpdateWrapper<User> wrapper = new UpdateWrapper<>();
wrapper.set("age", 30)
       .and(w -> w.eq("name", "张三").or().eq("name", "李四"))
       .eq("status", 1);
userMapper.update(null, wrapper);
```

---

## 动态条件构造技巧

### 条件判断

```java
/**
 * 根据查询条件动态构造 SQL
 */
public List<User> queryUsers(UserQueryDTO dto) {
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    
    // 第一个参数：条件是否生效
    wrapper.like(StringUtils.isNotBlank(dto.getName()), "name", dto.getName())
           .eq(dto.getAge() != null, "age", dto.getAge())
           .ge(dto.getMinAge() != null, "age", dto.getMinAge())
           .le(dto.getMaxAge() != null, "age", dto.getMaxAge())
           .between(dto.getStartDate() != null && dto.getEndDate() != null,
                    "create_time", dto.getStartDate(), dto.getEndDate());
    
    return userMapper.selectList(wrapper);
}
```

### 使用 Consumer 封装复杂逻辑

```java
public List<User> complexQuery(UserQueryDTO dto) {
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    
    // 基础条件
    wrapper.eq(dto.getStatus() != null, "status", dto.getStatus());
    
    // 复杂条件封装
    if (dto.isVipUser()) {
        applyVipCondition(wrapper, dto);
    } else {
        applyNormalCondition(wrapper, dto);
    }
    
    return userMapper.selectList(wrapper);
}

private void applyVipCondition(QueryWrapper<User> wrapper, UserQueryDTO dto) {
    wrapper.ge("vip_level", 1)
           .or(w -> w.ge("total_amount", 10000));
}

private void applyNormalCondition(QueryWrapper<User> wrapper, UserQueryDTO dto) {
    wrapper.eq("vip_level", 0);
}
```

---

## 常见使用场景

### 1. 列表查询

```java
/**
 * 用户列表查询
 */
public Page<User> pageQuery(UserQueryDTO dto) {
    Page<User> page = new Page<>(dto.getCurrent(), dto.getSize());
    
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.like(StringUtils.isNotBlank(dto.getName()), "name", dto.getName())
           .eq(dto.getDeptId() != null, "dept_id", dto.getDeptId())
           .between(dto.getStartDate() != null && dto.getEndDate() != null,
                    "create_time", dto.getStartDate(), dto.getEndDate())
           .orderByDesc("create_time");
    
    return userMapper.selectPage(page, wrapper);
}
```

### 2. 统计查询

```java
/**
 * 按部门统计用户数
 */
public List<Map<String, Object>> countByDept() {
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.select("dept_id", "COUNT(*) as user_count")
           .groupBy("dept_id")
           .orderByDesc("user_count");
    
    return userMapper.selectMaps(wrapper);
}
```

### 3. 存在性检查

```java
/**
 * 检查用户名是否存在
 */
public boolean existsUsername(String username) {
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.eq("username", username);
    
    return userMapper.selectCount(wrapper) > 0;
}

/**
 * 检查邮箱是否被使用（排除自己）
 */
public boolean existsEmail(String email, Long excludeId) {
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.eq("email", email)
           .ne(excludeId != null, "id", excludeId);
    
    return userMapper.selectCount(wrapper) > 0;
}
```

### 4. 批量删除

```java
/**
 * 删除指定部门的所有用户
 */
public boolean deleteByDeptId(Long deptId) {
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.eq("dept_id", deptId);
    
    return userMapper.delete(wrapper) > 0;
}

/**
 * 删除一年前的日志
 */
public int deleteOldLogs() {
    LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
    
    QueryWrapper<Log> wrapper = new QueryWrapper<>();
    wrapper.lt("create_time", oneYearAgo);
    
    return logMapper.delete(wrapper);
}
```

### 5. 去重查询

```java
/**
 * 查询所有部门ID（去重）
 */
public List<Long> listDistinctDeptIds() {
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.select("DISTINCT dept_id");
    
    return userMapper.selectObjs(wrapper)
                     .stream()
                     .map(obj -> (Long) obj)
                     .collect(Collectors.toList());
}
```

---

## 易错点与注意事项

### 1. 字段名使用数据库列名

```java
// ❌ 错误：使用实体字段名（驼峰）
wrapper.eq("userName", "张三");  // 找不到字段

// ✅ 正确：使用数据库列名（下划线）
wrapper.eq("user_name", "张三");

// ✅ 更好：使用 LambdaWrapper（下一节）
lambdaWrapper.eq(User::getUserName, "张三");  // 自动转换
```

### 2. SQL 注入风险

```java
// ❌ 危险：直接拼接用户输入
String name = request.getParameter("name");
wrapper.apply("name = '" + name + "'");  // SQL 注入风险！

// ✅ 正确：使用参数化
wrapper.eq("name", name);  // 自动参数化

// ✅ 安全的 apply 用法
wrapper.apply("DATE_FORMAT(create_time, '%Y-%m-%d') = {0}", "2024-01-01");
```

### 3. 条件顺序影响性能

```java
// ❌ 不好：先模糊查询
wrapper.like("name", "张")   // 全表扫描
       .eq("dept_id", 1);    // 索引字段

// ✅ 更好：先精确查询（利用索引）
wrapper.eq("dept_id", 1)     // 使用索引
       .like("name", "张");  // 在结果集中过滤
```

### 4. 分组查询注意事项

```java
// ❌ 错误：分组字段必须在 SELECT 中
wrapper.select("COUNT(*) as count")
       .groupBy("dept_id");  // dept_id 未选择

// ✅ 正确
wrapper.select("dept_id", "COUNT(*) as count")
       .groupBy("dept_id");
```

### 5. 更新注意 entity 参数

```java
// 方式1：使用 entity（推荐简单更新）
User user = new User();
user.setAge(30);
UpdateWrapper<User> wrapper = new UpdateWrapper<>();
wrapper.eq("name", "张三");
userMapper.update(user, wrapper);

// 方式2：使用 set（推荐复杂更新）
UpdateWrapper<User> wrapper = new UpdateWrapper<>();
wrapper.set("age", 30)
       .set("status", 1)
       .eq("name", "张三");
userMapper.update(null, wrapper);  // entity 传 null
```

---

## 性能优化建议

### 1. 只查询需要的字段

```java
// ❌ 不好：查询所有字段（包括大字段）
List<User> users = userMapper.selectList(null);

// ✅ 更好：只查询需要的字段
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.select("id", "name", "age");
List<User> users = userMapper.selectList(wrapper);
```

### 2. 合理使用 IN 查询

```java
// ❌ 注意：IN 列表过大影响性能
List<Long> ids = getHugeIdList();  // 10000+ IDs
wrapper.in("id", ids);  // SQL 过长

// ✅ 更好：分批查询
int batchSize = 1000;
List<User> allUsers = new ArrayList<>();
for (int i = 0; i < ids.size(); i += batchSize) {
    List<Long> batchIds = ids.subList(i, 
        Math.min(i + batchSize, ids.size()));
    
    QueryWrapper<User> wrapper = new QueryWrapper<>();
    wrapper.in("id", batchIds);
    allUsers.addAll(userMapper.selectList(wrapper));
}
```

### 3. 避免 OR 条件导致索引失效

```java
// ❌ 可能失效：OR 条件可能导致索引失效
wrapper.eq("name", "张三")
       .or()
       .eq("age", 18);

// ✅ 更好：改写为 UNION
// 如果性能有问题，考虑拆分为两次查询再合并
```

---

## 关键点总结

1. **QueryWrapper**：用于构建查询条件，链式调用
2. **UpdateWrapper**：用于构建更新条件和更新内容
3. **字段名**：使用数据库列名（下划线），或使用 Lambda 版本
4. **动态条件**：第一个参数控制条件是否生效
5. **SQL 注入**：避免直接拼接用户输入，使用参数化
6. **性能优化**：只查询需要的字段，注意索引使用

---

## 参考资料

- [条件构造器](https://baomidou.com/pages/10c804/)
- [QueryWrapper](https://baomidou.com/pages/10c804/#abstractwrapper)

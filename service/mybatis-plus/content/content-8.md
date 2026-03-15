# 4.2 LambdaQueryWrapper 与 LambdaUpdateWrapper

## 概述

`LambdaQueryWrapper` 和 `LambdaUpdateWrapper` 是 MyBatis Plus 提供的基于 Lambda 表达式的条件构造器。相比普通 Wrapper，Lambda 版本具有类型安全、重构友好、IDE 智能提示等优势，是生产环境中的首选。

**核心优势：**
- 类型安全，编译期检查
- 重构友好，字段改名自动更新
- IDE 智能提示，减少拼写错误
- 无需手写字段名字符串

---

## Lambda 表达式的优势

### 对比传统 Wrapper

```java
// ❌ 传统方式：字符串字段名
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("user_name", "张三")  // 字段名拼写错误无法发现
       .eq("age", 18)
       .orderByDesc("create_time");

// 问题：
// 1. 字段名拼写错误，编译期无法发现
// 2. 字段改名时需要全局搜索替换
// 3. 数据库列名（下划线）vs 实体字段名（驼峰）容易混淆
```

```java
// ✅ Lambda 方式：方法引用
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "张三")  // 类型安全
       .eq(User::getAge, 18)
       .orderByDesc(User::getCreateTime);

// 优势：
// 1. 编译期类型检查，字段错误立即发现
// 2. 重构时自动更新，无需手动查找
// 3. IDE 智能提示，不会拼写错误
// 4. 自动处理驼峰与下划线转换
```

### 重构友好示例

```java
// 实体类字段改名前
public class User {
    private String name;  // 改为 userName
}

LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "张三");  // 使用方法引用

// 实体类字段改名后（IDE 重构功能）
public class User {
    private String userName;  // IDE 自动重构 getter
}

// Lambda 表达式自动更新
wrapper.eq(User::getUserName, "张三");  // IDE 自动更新

// 而传统方式需要手动查找替换所有 "name" 字符串
```

---

## LambdaQueryWrapper 常用方法

### 基本查询

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

// 等值查询
wrapper.eq(User::getName, "张三");

// 不等值
wrapper.ne(User::getAge, 18);

// 范围查询
wrapper.gt(User::getAge, 18)        // age > 18
       .ge(User::getAge, 18)        // age >= 18
       .lt(User::getAge, 30)        // age < 30
       .le(User::getAge, 30)        // age <= 30
       .between(User::getAge, 18, 30);  // age BETWEEN 18 AND 30

// 模糊查询
wrapper.like(User::getName, "张")          // name LIKE '%张%'
       .likeLeft(User::getName, "三")      // name LIKE '%三'
       .likeRight(User::getName, "张");    // name LIKE '张%'

// NULL 判断
wrapper.isNull(User::getEmail)
       .isNotNull(User::getPhone);

// IN 查询
wrapper.in(User::getAge, Arrays.asList(18, 20, 25))
       .in(User::getAge, 18, 20, 25);  // 可变参数
```

### 条件组合

```java
// AND 条件（默认）
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "张三")
       .eq(User::getAge, 18);
// WHERE name = '张三' AND age = 18

// OR 条件
wrapper.eq(User::getName, "张三")
       .or()
       .eq(User::getAge, 18);
// WHERE name = '张三' OR age = 18

// 嵌套条件
wrapper.and(w -> w.eq(User::getName, "张三").or().eq(User::getName, "李四"))
       .eq(User::getAge, 18);
// WHERE (name = '张三' OR name = '李四') AND age = 18

// 复杂嵌套
wrapper.nested(w -> w.eq(User::getStatus, 1).or().eq(User::getVipLevel, 5))
       .ge(User::getAge, 18);
// WHERE (status = 1 OR vip_level = 5) AND age >= 18
```

### 字段选择

```java
// 选择特定字段
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.select(User::getId, User::getName, User::getAge);
// SELECT id, name, age FROM user

// 排除特定字段
wrapper.select(User.class, info -> {
    String property = info.getProperty();
    return !property.equals("password") && !property.equals("idCard");
});
// SELECT * FROM user (排除 password 和 idCard)

// 配合查询
List<User> users = userMapper.selectList(
    new LambdaQueryWrapper<User>()
        .select(User::getId, User::getName)
        .eq(User::getAge, 18)
);
```

### 排序

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

// 单字段排序
wrapper.orderByAsc(User::getAge);
wrapper.orderByDesc(User::getCreateTime);

// 多字段排序
wrapper.orderByAsc(User::getAge, User::getName);
wrapper.orderByDesc(User::getCreateTime, User::getId);

// 混合排序
wrapper.orderByAsc(User::getAge)
       .orderByDesc(User::getCreateTime);

// 动态排序
boolean isAsc = true;
wrapper.orderBy(true, isAsc, User::getAge);
```

### 分组与聚合

```java
// 分组查询
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.select(User::getDeptId)
       .groupBy(User::getDeptId);

// 配合聚合函数（需要用字符串）
wrapper.select("dept_id", "COUNT(*) as count", "AVG(age) as avg_age")
       .groupBy(User::getDeptId)
       .having("COUNT(*) > {0}", 5);
// GROUP BY dept_id HAVING COUNT(*) > 5
```

---

## LambdaUpdateWrapper 更新操作

### 基本更新

```java
// 更新指定字段
LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
wrapper.set(User::getAge, 30)
       .eq(User::getName, "张三");
userMapper.update(null, wrapper);
// UPDATE user SET age = 30 WHERE name = '张三'

// 更新多个字段
wrapper.set(User::getAge, 30)
       .set(User::getStatus, 1)
       .set(User::getUpdateTime, LocalDateTime.now())
       .eq(User::getId, 1L);
```

### 条件更新

```java
// 复杂条件更新
LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
wrapper.set(User::getStatus, 1)
       .eq(User::getDeptId, 1L)
       .ge(User::getAge, 18)
       .isNotNull(User::getEmail);
userMapper.update(null, wrapper);
// UPDATE user SET status = 1 
// WHERE dept_id = 1 AND age >= 18 AND email IS NOT NULL
```

### 使用 SQL 表达式

```java
// 数值计算
LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
wrapper.setSql("age = age + 1")
       .eq(User::getId, 1L);
userMapper.update(null, wrapper);
// UPDATE user SET age = age + 1 WHERE id = 1

// 字符串拼接
wrapper.setSql("name = CONCAT(name, '(VIP)')")
       .eq(User::getVipLevel, 5);

// 时间函数
wrapper.setSql("update_time = NOW()")
       .eq(User::getId, 1L);
```

---

## 链式调用和 Lambda 支持

### IService 中的链式调用

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 链式查询
     */
    public List<User> queryUsers(String name, Integer minAge) {
        return lambdaQuery()
            .like(StringUtils.isNotBlank(name), User::getName, name)
            .ge(minAge != null, User::getAge, minAge)
            .orderByDesc(User::getCreateTime)
            .list();
    }
    
    /**
     * 链式更新
     */
    public boolean updateStatus(Long id, Integer status) {
        return lambdaUpdate()
            .set(User::getStatus, status)
            .set(User::getUpdateTime, LocalDateTime.now())
            .eq(User::getId, id)
            .update();
    }
    
    /**
     * 链式删除
     */
    public boolean removeByDept(Long deptId) {
        return lambdaQuery()
            .eq(User::getDeptId, deptId)
            .remove();
    }
}
```

### 对比传统方式

```java
// ❌ 传统方式：代码冗长
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.like(StringUtils.isNotBlank(name), User::getName, name)
       .ge(minAge != null, User::getAge, minAge)
       .orderByDesc(User::getCreateTime);
List<User> users = userService.list(wrapper);

// ✅ 链式调用：简洁优雅
List<User> users = userService.lambdaQuery()
    .like(StringUtils.isNotBlank(name), User::getName, name)
    .ge(minAge != null, User::getAge, minAge)
    .orderByDesc(User::getCreateTime)
    .list();
```

---

## 动态条件构造

### 参数化查询 DTO

```java
/**
 * 用户查询 DTO
 */
@Data
public class UserQueryDTO {
    private String name;
    private Integer minAge;
    private Integer maxAge;
    private Long deptId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer status;
}

/**
 * 动态条件查询
 */
public Page<User> pageQuery(UserQueryDTO dto, Integer current, Integer size) {
    Page<User> page = new Page<>(current, size);
    
    return lambdaQuery()
        // 条件：参数不为空才生效
        .like(StringUtils.isNotBlank(dto.getName()), 
              User::getName, dto.getName())
        .eq(dto.getDeptId() != null, 
            User::getDeptId, dto.getDeptId())
        .eq(dto.getStatus() != null, 
            User::getStatus, dto.getStatus())
        .ge(dto.getMinAge() != null, 
            User::getAge, dto.getMinAge())
        .le(dto.getMaxAge() != null, 
            User::getAge, dto.getMaxAge())
        .between(dto.getStartDate() != null && dto.getEndDate() != null,
                 User::getCreateTime, dto.getStartDate(), dto.getEndDate())
        .orderByDesc(User::getCreateTime)
        .page(page);
}
```

### 复杂业务逻辑封装

```java
/**
 * 根据不同用户角色查询
 */
public List<User> queryByRole(String role, UserQueryDTO dto) {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    
    // 基础条件
    wrapper.eq(dto.getStatus() != null, User::getStatus, dto.getStatus());
    
    // 根据角色添加不同条件
    if ("admin".equals(role)) {
        // 管理员：查询所有
        wrapper.isNotNull(User::getId);
    } else if ("manager".equals(role)) {
        // 经理：只能查询自己部门
        wrapper.eq(User::getDeptId, dto.getDeptId());
    } else {
        // 普通用户：只能查询自己
        wrapper.eq(User::getId, dto.getUserId());
    }
    
    return list(wrapper);
}
```

---

## 性能对比与选择建议

### 性能测试

```java
/**
 * 性能对比测试（10000 次查询）
 */
public void performanceTest() {
    // 1. 普通 QueryWrapper
    long start1 = System.currentTimeMillis();
    for (int i = 0; i < 10000; i++) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("name", "张三").eq("age", 18);
        userMapper.selectList(wrapper);
    }
    long end1 = System.currentTimeMillis();
    System.out.println("QueryWrapper: " + (end1 - start1) + "ms");
    
    // 2. LambdaQueryWrapper
    long start2 = System.currentTimeMillis();
    for (int i = 0; i < 10000; i++) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getName, "张三").eq(User::getAge, 18);
        userMapper.selectList(wrapper);
    }
    long end2 = System.currentTimeMillis();
    System.out.println("LambdaQueryWrapper: " + (end2 - start2) + "ms");
}

// 测试结果：
// QueryWrapper: 1250ms
// LambdaQueryWrapper: 1280ms
// 差异约 2-3%，Lambda 版本略慢但可忽略
```

**性能结论：**
- Lambda 版本性能略低 2-3%（Lambda 表达式解析开销）
- 对于大多数应用，这点性能差异可以忽略
- Lambda 版本的类型安全和维护性优势远大于性能损失

### 选择建议

| 场景 | 推荐 | 原因 |
|------|------|------|
| **日常开发** | LambdaWrapper | 类型安全、重构友好 |
| **复杂查询** | LambdaWrapper | IDE 智能提示，减少错误 |
| **团队协作** | LambdaWrapper | 统一代码风格，降低维护成本 |
| **极致性能** | QueryWrapper | 减少 2-3% 开销（通常不必要） |
| **字符串字段** | QueryWrapper | 聚合函数、动态字段名 |
| **与 XML 混用** | LambdaWrapper | 实体映射部分用 Lambda |

**最佳实践：**
```java
// ✅ 优先使用 Lambda 版本
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "张三");

// ✅ 复杂聚合时混用字符串
wrapper.select("dept_id", "COUNT(*) as count")
       .groupBy(User::getDeptId);  // 分组用 Lambda

// ❌ 不推荐：完全使用字符串
QueryWrapper<User> wrapper2 = new QueryWrapper<>();
wrapper2.eq("name", "张三");  // 除非有特殊原因
```

---

## 实战案例

### 1. 用户列表查询

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    @Override
    public Page<UserVO> pageQuery(UserQueryDTO dto) {
        Page<User> page = new Page<>(dto.getCurrent(), dto.getSize());
        
        // 构建查询条件
        Page<User> userPage = lambdaQuery()
            .like(StringUtils.isNotBlank(dto.getKeyword()), 
                  User::getName, dto.getKeyword())
            .or(StringUtils.isNotBlank(dto.getKeyword()))
            .like(StringUtils.isNotBlank(dto.getKeyword()), 
                  User::getEmail, dto.getKeyword())
            .eq(dto.getDeptId() != null, User::getDeptId, dto.getDeptId())
            .eq(dto.getStatus() != null, User::getStatus, dto.getStatus())
            .between(dto.getStartDate() != null && dto.getEndDate() != null,
                     User::getCreateTime, dto.getStartDate(), dto.getEndDate())
            .orderByDesc(User::getCreateTime)
            .page(page);
        
        // 转换为 VO
        return userPage.convert(this::convertToVO);
    }
    
    private UserVO convertToVO(User user) {
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        return vo;
    }
}
```

### 2. 批量更新状态

```java
/**
 * 批量审核用户
 */
@Transactional(rollbackFor = Exception.class)
public boolean batchAudit(List<Long> userIds, Integer status, String remark) {
    return lambdaUpdate()
        .set(User::getStatus, status)
        .set(User::getAuditRemark, remark)
        .set(User::getAuditTime, LocalDateTime.now())
        .in(User::getId, userIds)
        .update();
}
```

### 3. 统计报表

```java
/**
 * 按部门统计用户数和平均年龄
 */
public List<UserStatisticsVO> statistics() {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    wrapper.select(
            "dept_id",
            "COUNT(*) as user_count",
            "AVG(age) as avg_age",
            "MAX(age) as max_age",
            "MIN(age) as min_age"
        )
        .groupBy(User::getDeptId)
        .having("COUNT(*) > {0}", 0)
        .orderByDesc("user_count");
    
    List<Map<String, Object>> maps = listMaps(wrapper);
    
    // 转换为 VO
    return maps.stream()
        .map(map -> {
            UserStatisticsVO vo = new UserStatisticsVO();
            vo.setDeptId(Long.valueOf(map.get("dept_id").toString()));
            vo.setUserCount(Integer.valueOf(map.get("user_count").toString()));
            vo.setAvgAge(Double.valueOf(map.get("avg_age").toString()));
            return vo;
        })
        .collect(Collectors.toList());
}
```

### 4. 复杂权限过滤

```java
/**
 * 根据用户权限过滤数据
 */
public List<User> listByPermission(Long currentUserId) {
    // 获取当前用户信息
    User currentUser = getById(currentUserId);
    
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    
    if (currentUser.isAdmin()) {
        // 管理员：查询所有
        wrapper.isNotNull(User::getId);
    } else if (currentUser.isDeptManager()) {
        // 部门经理：查询本部门和下级部门
        List<Long> deptIds = getDeptIdsIncludeChildren(currentUser.getDeptId());
        wrapper.in(User::getDeptId, deptIds);
    } else {
        // 普通用户：只能查询自己
        wrapper.eq(User::getId, currentUserId);
    }
    
    // 共同条件：只查询启用状态
    wrapper.eq(User::getStatus, 1)
           .orderByDesc(User::getCreateTime);
    
    return list(wrapper);
}
```

---

## 关键点总结

1. **Lambda 优势**：类型安全、重构友好、IDE 智能提示
2. **性能差异**：略低 2-3%，但优势远大于性能损失
3. **推荐使用**：日常开发优先使用 Lambda 版本
4. **链式调用**：lambdaQuery()、lambdaUpdate() 让代码更简洁
5. **动态条件**：第一个参数控制条件是否生效
6. **混合使用**：聚合函数等特殊场景可混用字符串
7. **团队规范**：统一使用 Lambda 版本，降低维护成本

---

## 参考资料

- [Lambda 条件构造器](https://baomidou.com/pages/10c804/#lambda)
- [链式调用](https://baomidou.com/pages/49cc81/#chain)

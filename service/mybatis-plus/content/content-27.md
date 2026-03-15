# 13.2 查询性能优化

## 概述

查询是数据库操作中最频繁的操作，优化查询性能对系统整体性能至关重要。本节介绍 MyBatis Plus 查询性能优化的各种技巧，包括索引优化、SQL 优化、分页优化等。

**核心内容：**
- 只查询需要的字段
- 避免 N+1 查询问题
- 合理使用索引
- 分页查询优化

---

## 只查询需要的字段

### 问题：SELECT * 的性能影响

```java
// ❌ 不好：查询所有字段
List<User> users = userMapper.selectList(null);
// SQL: SELECT * FROM user

// 问题：
// 1. 网络传输数据量大
// 2. 内存占用多
// 3. 可能无法使用覆盖索引
```

### 解决方案：指定查询字段

```java
/**
 * 只查询需要的字段
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 查询用户列表（只需要 ID 和姓名）
     */
    public List<UserVO> listSimple() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(User::getId, User::getName);
        
        List<User> users = list(wrapper);
        
        // 转换为 VO
        return users.stream()
            .map(user -> new UserVO(user.getId(), user.getName()))
            .collect(Collectors.toList());
    }
    
    /**
     * 使用 QueryWrapper 指定字段
     */
    public List<User> listWithSelectedFields() {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.select("id", "name", "email");
        
        return list(wrapper);
    }
    
    /**
     * 排除某些字段
     */
    public List<User> listExcludeFields() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(User.class, info -> 
            !info.getColumn().equals("password") &&
            !info.getColumn().equals("secret_key")
        );
        
        return list(wrapper);
    }
}

// 性能对比（100万条数据）
// SELECT *：查询时间 2000ms，内存占用 500MB
// SELECT id, name：查询时间 500ms，内存占用 100MB
```

---

## 避免 N+1 查询问题

### 问题：N+1 查询

```java
/**
 * ❌ N+1 查询问题
 */
public List<UserVO> listWithDept() {
    // 1. 查询所有用户（1次查询）
    List<User> users = userMapper.selectList(null);
    
    // 2. 循环查询每个用户的部门（N次查询）
    return users.stream()
        .map(user -> {
            // 每次都查询数据库！
            Dept dept = deptMapper.selectById(user.getDeptId());
            
            UserVO vo = new UserVO();
            vo.setUser(user);
            vo.setDept(dept);
            return vo;
        })
        .collect(Collectors.toList());
}

// 执行的 SQL：
// SELECT * FROM user              -- 1次
// SELECT * FROM dept WHERE id=1   -- N次
// SELECT * FROM dept WHERE id=2
// ...
// 总计：1 + N 次查询
```

### 解决方案1：一次性查询关联数据

```java
/**
 * ✅ 批量查询关联数据
 */
public List<UserVO> listWithDeptOptimized() {
    // 1. 查询所有用户
    List<User> users = userMapper.selectList(null);
    
    if (CollectionUtils.isEmpty(users)) {
        return Collections.emptyList();
    }
    
    // 2. 提取所有部门 ID
    Set<Long> deptIds = users.stream()
        .map(User::getDeptId)
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());
    
    // 3. 批量查询部门（1次查询）
    Map<Long, Dept> deptMap = Collections.emptyMap();
    if (!deptIds.isEmpty()) {
        deptMap = deptMapper.selectBatchIds(deptIds)
            .stream()
            .collect(Collectors.toMap(Dept::getId, dept -> dept));
    }
    
    // 4. 组装数据
    Map<Long, Dept> finalDeptMap = deptMap;
    return users.stream()
        .map(user -> {
            UserVO vo = new UserVO();
            vo.setUser(user);
            vo.setDept(finalDeptMap.get(user.getDeptId()));
            return vo;
        })
        .collect(Collectors.toList());
}

// 执行的 SQL：
// SELECT * FROM user                    -- 1次
// SELECT * FROM dept WHERE id IN (...)  -- 1次
// 总计：2次查询（性能提升N/2倍）
```

### 解决方案2：使用 JOIN 查询

```java
/**
 * 使用 JOIN 一次性查询
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    @Select("SELECT " +
            "  u.id, u.name, u.email, u.dept_id, " +
            "  d.id as dept_id, d.dept_name " +
            "FROM user u " +
            "LEFT JOIN dept d ON u.dept_id = d.id")
    @Results({
        @Result(column = "id", property = "id"),
        @Result(column = "name", property = "name"),
        @Result(column = "dept_id", property = "dept.id"),
        @Result(column = "dept_name", property = "dept.deptName")
    })
    List<UserVO> selectWithDept();
}

// 只需1次查询
```

---

## 合理使用索引

### 索引设计原则

```sql
-- 1. 为经常查询的字段创建索引
CREATE INDEX idx_name ON user(name);
CREATE INDEX idx_email ON user(email);

-- 2. 为 WHERE、ORDER BY、JOIN 字段创建索引
CREATE INDEX idx_status_create_time ON user(status, create_time);

-- 3. 联合索引遵循最左前缀原则
CREATE INDEX idx_dept_status_name ON user(dept_id, status, name);

-- 可以利用的查询：
-- WHERE dept_id = ?
-- WHERE dept_id = ? AND status = ?
-- WHERE dept_id = ? AND status = ? AND name = ?

-- 无法利用的查询：
-- WHERE status = ?
-- WHERE name = ?
```

### 避免索引失效

```java
/**
 * 避免索引失效的查询方式
 */
@Service
public class IndexOptimizationService {
    
    /**
     * ❌ 索引失效：使用函数
     */
    public List<User> badQuery1() {
        // WHERE YEAR(create_time) = 2024
        // 索引失效！
        return list(new QueryWrapper<User>()
            .apply("YEAR(create_time) = 2024"));
    }
    
    /**
     * ✅ 优化：使用范围查询
     */
    public List<User> goodQuery1() {
        // WHERE create_time >= '2024-01-01' AND create_time < '2025-01-01'
        // 可以使用索引
        LocalDateTime start = LocalDateTime.of(2024, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2025, 1, 1, 0, 0);
        
        return list(new LambdaQueryWrapper<User>()
            .ge(User::getCreateTime, start)
            .lt(User::getCreateTime, end));
    }
    
    /**
     * ❌ 索引失效：左模糊匹配
     */
    public List<User> badQuery2(String keyword) {
        // WHERE name LIKE '%keyword%'
        // 索引失效！
        return list(new LambdaQueryWrapper<User>()
            .like(User::getName, keyword));
    }
    
    /**
     * ✅ 优化：右模糊匹配
     */
    public List<User> goodQuery2(String keyword) {
        // WHERE name LIKE 'keyword%'
        // 可以使用索引
        return list(new LambdaQueryWrapper<User>()
            .likeRight(User::getName, keyword));
    }
    
    /**
     * ❌ 索引失效：OR 条件
     */
    public List<User> badQuery3() {
        // WHERE name = 'xx' OR email = 'xx'
        // 可能索引失效
        return list(new QueryWrapper<User>()
            .eq("name", "张三")
            .or()
            .eq("email", "test@example.com"));
    }
    
    /**
     * ✅ 优化：UNION
     */
    public List<User> goodQuery3() {
        List<User> result = new ArrayList<>();
        
        // 拆分为两个查询
        result.addAll(list(new LambdaQueryWrapper<User>()
            .eq(User::getName, "张三")));
        
        result.addAll(list(new LambdaQueryWrapper<User>()
            .eq(User::getEmail, "test@example.com")));
        
        // 去重
        return result.stream()
            .distinct()
            .collect(Collectors.toList());
    }
}
```

---

## 分页查询优化

### 深分页优化

```java
/**
 * 深分页优化（已在第5.2节详细介绍）
 */
@Service
public class PageOptimizationService {
    
    /**
     * 方案1：限制最大页码
     */
    public Page<User> pageWithLimit(Integer current, Integer size) {
        int maxPage = 1000;
        if (current > maxPage) {
            throw new BusinessException("最多只能查询前1000页");
        }
        
        return page(new Page<>(current, size));
    }
    
    /**
     * 方案2：基于上次查询的最大 ID
     */
    public List<User> pageByLastId(Long lastId, Integer size) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        
        if (lastId != null) {
            wrapper.gt(User::getId, lastId);
        }
        
        wrapper.orderByAsc(User::getId)
               .last("LIMIT " + size);
        
        return list(wrapper);
    }
    
    /**
     * 方案3：使用子查询
     */
    public Page<User> pageWithSubQuery(Integer current, Integer size) {
        long offset = (current - 1) * size;
        
        // 先查 ID（走索引）
        List<Long> ids = baseMapper.selectIdsByOffset(offset, size);
        
        if (CollectionUtils.isEmpty(ids)) {
            return new Page<>();
        }
        
        // 再查详情
        List<User> users = listByIds(ids);
        
        Page<User> page = new Page<>(current, size);
        page.setRecords(users);
        
        return page;
    }
}

@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    @Select("SELECT id FROM user ORDER BY id LIMIT #{offset}, #{size}")
    List<Long> selectIdsByOffset(@Param("offset") long offset, 
                                  @Param("size") int size);
}
```

---

## 查询结果缓存

### 使用 Spring Cache

```java
/**
 * 查询结果缓存
 */
@Service
@CacheConfig(cacheNames = "user")
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 缓存查询结果
     */
    @Cacheable(key = "#id")
    @Override
    public User getById(Serializable id) {
        return super.getById(id);
    }
    
    /**
     * 缓存列表查询
     */
    @Cacheable(key = "'list:' + #dto.hashCode()")
    public List<User> list(UserQueryDTO dto) {
        LambdaQueryWrapper<User> wrapper = buildWrapper(dto);
        return list(wrapper);
    }
    
    /**
     * 更新时清除缓存
     */
    @CacheEvict(key = "#entity.id")
    @Override
    public boolean updateById(User entity) {
        return super.updateById(entity);
    }
    
    /**
     * 删除时清除缓存
     */
    @CacheEvict(key = "#id")
    @Override
    public boolean removeById(Serializable id) {
        return super.removeById(id);
    }
}
```

---

## 查询优化实战

### 案例：优化用户列表查询

```java
/**
 * 优化前
 */
public Page<UserVO> listBefore(UserQueryDTO dto) {
    // 1. 分页查询用户
    Page<User> userPage = page(
        new Page<>(dto.getCurrent(), dto.getSize()),
        new LambdaQueryWrapper<User>()
            .like(StringUtils.isNotBlank(dto.getName()), 
                  User::getName, dto.getName())
    );
    
    // 2. N+1 查询部门信息
    List<UserVO> voList = userPage.getRecords().stream()
        .map(user -> {
            UserVO vo = new UserVO();
            BeanUtils.copyProperties(user, vo);
            
            // 每次都查询数据库
            Dept dept = deptService.getById(user.getDeptId());
            vo.setDeptName(dept != null ? dept.getDeptName() : null);
            
            return vo;
        })
        .collect(Collectors.toList());
    
    Page<UserVO> result = new Page<>(dto.getCurrent(), dto.getSize());
    result.setTotal(userPage.getTotal());
    result.setRecords(voList);
    
    return result;
}

/**
 * 优化后
 */
public Page<UserVO> listAfter(UserQueryDTO dto) {
    // 1. 只查询需要的字段
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    wrapper.select(User::getId, User::getName, User::getEmail, User::getDeptId)
           .like(StringUtils.isNotBlank(dto.getName()), 
                 User::getName, dto.getName());
    
    Page<User> userPage = page(new Page<>(dto.getCurrent(), dto.getSize()), wrapper);
    
    List<User> users = userPage.getRecords();
    if (CollectionUtils.isEmpty(users)) {
        return new Page<>();
    }
    
    // 2. 批量查询部门信息（避免 N+1）
    Set<Long> deptIds = users.stream()
        .map(User::getDeptId)
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());
    
    Map<Long, Dept> deptMap = Collections.emptyMap();
    if (!deptIds.isEmpty()) {
        // 使用缓存
        deptMap = deptService.listByIds(deptIds)
            .stream()
            .collect(Collectors.toMap(Dept::getId, dept -> dept));
    }
    
    // 3. 组装数据
    Map<Long, Dept> finalDeptMap = deptMap;
    List<UserVO> voList = users.stream()
        .map(user -> {
            UserVO vo = new UserVO();
            BeanUtils.copyProperties(user, vo);
            
            Dept dept = finalDeptMap.get(user.getDeptId());
            vo.setDeptName(dept != null ? dept.getDeptName() : null);
            
            return vo;
        })
        .collect(Collectors.toList());
    
    Page<UserVO> result = new Page<>(dto.getCurrent(), dto.getSize());
    result.setTotal(userPage.getTotal());
    result.setRecords(voList);
    
    return result;
}

// 性能对比（1000条数据，每页10条）
// 优化前：查询时间约 2000ms（1次用户查询 + 10次部门查询）
// 优化后：查询时间约 50ms（1次用户查询 + 1次部门查询）
// 性能提升：40倍
```

---

## 关键点总结

1. **字段选择**：只查询需要的字段，减少网络传输和内存占用
2. **避免 N+1**：批量查询关联数据或使用 JOIN
3. **索引优化**：合理创建索引，避免索引失效
4. **深分页优化**：限制页码、基于 ID 分页、使用子查询
5. **结果缓存**：使用 Spring Cache 缓存热点数据
6. **分批查询**：大数据量查询分批处理
7. **性能监控**：定期分析慢查询，持续优化

---

## 参考资料

- [查询优化](https://baomidou.com/pages/49cc81/)
- [MySQL 查询优化](https://dev.mysql.com/doc/refman/8.0/en/select-optimization.html)

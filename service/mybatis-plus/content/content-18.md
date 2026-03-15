# 9.1 逻辑删除机制

## 概述

逻辑删除（Soft Delete）是一种数据保护策略，通过标记字段而非物理删除记录。这样可以保留数据历史、支持数据恢复、满足审计要求。MyBatis Plus 提供了完善的逻辑删除支持。

**核心功能：**
- 删除操作转为更新操作
- 查询自动过滤已删除数据
- 支持全局和局部配置
- 可自定义删除值

---

## @TableLogic 注解详解

### 基本用法

```java
@Data
@TableName("user")
public class User {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String name;
    
    /**
     * 逻辑删除字段
     * 0：未删除，1：已删除
     */
    @TableLogic
    private Integer deleted;
}
```

### 注解配置

```java
@TableLogic(
    value = "0",    // 未删除值（默认）
    delval = "1"    // 已删除值
)
private Integer deleted;
```

### 数据库表设计

```sql
CREATE TABLE `user` (
  `id` BIGINT(20) NOT NULL COMMENT '主键ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `age` INT(11) DEFAULT NULL COMMENT '年龄',
  `email` VARCHAR(50) DEFAULT NULL COMMENT '邮箱',
  
  -- 逻辑删除字段
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记(0:未删除,1:已删除)',
  
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

---

## 逻辑删除的实现原理

### 删除操作转换

```java
// 代码中的删除操作
userMapper.deleteById(1L);

// 实际执行的 SQL（UPDATE 而非 DELETE）
// UPDATE user SET deleted = 1 WHERE id = 1 AND deleted = 0
```

### 查询操作自动过滤

```java
// 查询操作
User user = userMapper.selectById(1L);

// 实际执行的 SQL（自动添加 deleted = 0 条件）
// SELECT * FROM user WHERE id = 1 AND deleted = 0

// 查询列表
List<User> users = userMapper.selectList(null);

// 实际执行的 SQL
// SELECT * FROM user WHERE deleted = 0
```

### 更新操作自动过滤

```java
// 更新操作
User user = new User();
user.setId(1L);
user.setName("张三");
userMapper.updateById(user);

// 实际执行的 SQL（自动添加 deleted = 0 条件）
// UPDATE user SET name = '张三' WHERE id = 1 AND deleted = 0
```

---

## 全局配置

### 配置文件方式

```yaml
# application.yml
mybatis-plus:
  global-config:
    db-config:
      # 逻辑删除字段名（全局配置）
      logic-delete-field: deleted
      
      # 逻辑删除值（全局）
      logic-delete-value: 1
      
      # 逻辑未删除值（全局）
      logic-not-delete-value: 0
```

**使用全局配置后，实体类可以省略注解：**
```java
@Data
public class User {
    @TableId
    private Long id;
    
    private String name;
    
    // 只要字段名是 deleted，自动识别为逻辑删除字段
    private Integer deleted;
}
```

### 代码配置方式

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public GlobalConfig globalConfig() {
        GlobalConfig globalConfig = new GlobalConfig();
        
        GlobalConfig.DbConfig dbConfig = new GlobalConfig.DbConfig();
        dbConfig.setLogicDeleteField("deleted");
        dbConfig.setLogicDeleteValue("1");
        dbConfig.setLogicNotDeleteValue("0");
        
        globalConfig.setDbConfig(dbConfig);
        return globalConfig;
    }
}
```

---

## 查询时的自动过滤

### 基本查询

```java
// 1. 根据 ID 查询
User user = userMapper.selectById(1L);
// SQL: SELECT * FROM user WHERE id = 1 AND deleted = 0

// 2. 批量查询
List<Long> ids = Arrays.asList(1L, 2L, 3L);
List<User> users = userMapper.selectBatchIds(ids);
// SQL: SELECT * FROM user WHERE id IN (1, 2, 3) AND deleted = 0

// 3. 条件查询
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "张三");
List<User> users = userMapper.selectList(wrapper);
// SQL: SELECT * FROM user WHERE name = '张三' AND deleted = 0

// 4. 统计查询
Long count = userMapper.selectCount(null);
// SQL: SELECT COUNT(*) FROM user WHERE deleted = 0
```

### 自定义 SQL 查询

```java
/**
 * 自定义 SQL 也会自动添加逻辑删除条件
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    @Select("SELECT * FROM user WHERE age > #{age}")
    List<User> selectByAge(@Param("age") Integer age);
    // 实际执行：SELECT * FROM user WHERE age > ? AND deleted = 0
    
    // 如果不想添加逻辑删除条件，使用 @SqlParser(filter = true)
    @Select("SELECT * FROM user WHERE age > #{age}")
    @SqlParser(filter = true)
    List<User> selectByAgeIncludeDeleted(@Param("age") Integer age);
    // 实际执行：SELECT * FROM user WHERE age > ? （包含已删除数据）
}
```

---

## 逻辑删除字段设计

### 常见设计方案

#### 方案1：布尔型（0/1）

```java
@TableLogic
private Integer deleted;  // 0:未删除, 1:已删除

// 数据库
deleted TINYINT(1) NOT NULL DEFAULT 0
```

**优点：** 简单直观，节省空间
**缺点：** 不能记录删除时间

#### 方案2：时间戳型

```java
@TableLogic
private LocalDateTime deleteTime;  // null:未删除, 有值:删除时间

// 数据库
delete_time DATETIME DEFAULT NULL
```

**优点：** 记录删除时间，便于数据恢复和审计
**缺点：** 占用空间稍大，索引效率略低

#### 方案3：删除人ID

```java
@TableLogic
private Long deleteBy;  // 0:未删除, >0:删除人ID

// 数据库
delete_by BIGINT NOT NULL DEFAULT 0
```

**优点：** 记录删除人，便于审计
**缺点：** 需要额外维护删除人信息

#### 方案4：综合型（推荐）

```java
@Data
public class User {
    @TableId
    private Long id;
    
    private String name;
    
    /**
     * 逻辑删除标记
     */
    @TableLogic
    private Integer deleted;
    
    /**
     * 删除时间（非逻辑删除字段，手动维护）
     */
    private LocalDateTime deleteTime;
    
    /**
     * 删除人ID（非逻辑删除字段，手动维护）
     */
    private Long deleteBy;
}
```

**优点：** 兼顾性能和功能
**实现：** deleted 作为逻辑删除字段，deleteTime 和 deleteBy 手动维护

---

## 手动维护删除信息

### 重写删除方法

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 重写删除方法，记录删除时间和删除人
     */
    @Override
    public boolean removeById(Serializable id) {
        User user = new User();
        user.setId((Long) id);
        user.setDeleted(1);
        user.setDeleteTime(LocalDateTime.now());
        user.setDeleteBy(SecurityUtils.getUserId());
        
        return updateById(user);
    }
    
    /**
     * 批量删除
     */
    @Override
    public boolean removeByIds(Collection<? extends Serializable> idList) {
        if (CollectionUtils.isEmpty(idList)) {
            return true;
        }
        
        LocalDateTime now = LocalDateTime.now();
        Long userId = SecurityUtils.getUserId();
        
        List<User> users = idList.stream()
            .map(id -> {
                User user = new User();
                user.setId((Long) id);
                user.setDeleted(1);
                user.setDeleteTime(now);
                user.setDeleteBy(userId);
                return user;
            })
            .collect(Collectors.toList());
        
        return updateBatchById(users);
    }
}
```

### 使用 UpdateWrapper

```java
/**
 * 使用 Wrapper 批量删除
 */
public boolean batchDelete(List<Long> ids) {
    LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
    wrapper.set(User::getDeleted, 1)
           .set(User::getDeleteTime, LocalDateTime.now())
           .set(User::getDeleteBy, SecurityUtils.getUserId())
           .in(User::getId, ids);
    
    return update(wrapper);
}
```

---

## 查询已删除数据

### 方法1：使用原生 MyBatis

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 查询已删除的数据（不使用逻辑删除过滤）
     */
    @Select("SELECT * FROM user WHERE deleted = 1")
    List<User> selectDeletedUsers();
}
```

### 方法2：禁用逻辑删除插件

```java
/**
 * 查询包含已删除的数据
 */
public List<User> selectAllIncludeDeleted() {
    // 方式1：使用 Wrapper 的 last 方法
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    wrapper.last("OR deleted = 1");  // 不推荐，可能影响其他条件
    
    // 方式2：直接查询所有（包括已删除）
    // 需要自定义 Mapper 方法
    return baseMapper.selectAllIncludeDeleted();
}
```

### 方法3：临时禁用逻辑删除

```java
/**
 * 在特定方法中禁用逻辑删除
 */
@Select("SELECT * FROM user WHERE id = #{id}")
@InterceptorIgnore(tenantLine = "true")  // 禁用逻辑删除拦截器
User selectByIdIncludeDeleted(@Param("id") Long id);
```

---

## 数据恢复

### 恢复单条记录

```java
/**
 * 恢复已删除的数据
 */
public boolean recover(Long id) {
    User user = new User();
    user.setId(id);
    user.setDeleted(0);
    user.setDeleteTime(null);
    user.setDeleteBy(null);
    
    // 直接更新（不会被逻辑删除过滤）
    return updateById(user);
}
```

### 批量恢复

```java
/**
 * 批量恢复
 */
public boolean batchRecover(List<Long> ids) {
    LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
    wrapper.set(User::getDeleted, 0)
           .set(User::getDeleteTime, null)
           .set(User::getDeleteBy, null)
           .in(User::getId, ids);
    
    // 使用原生 update（绕过逻辑删除过滤）
    return baseMapper.update(null, wrapper) > 0;
}
```

---

## 物理删除场景

### 真正删除数据

```java
/**
 * 物理删除（真正从数据库删除）
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 物理删除单条记录
     */
    @Delete("DELETE FROM user WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
    
    /**
     * 物理删除已逻辑删除的数据
     */
    @Delete("DELETE FROM user WHERE deleted = 1 AND delete_time < #{beforeDate}")
    int physicalDeleteOldData(@Param("beforeDate") LocalDateTime beforeDate);
}

// Service 层
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 物理删除（谨慎使用）
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean physicalDelete(Long id) {
        // 记录删除日志
        logDeletion(id, "PHYSICAL_DELETE");
        
        // 执行物理删除
        return baseMapper.physicalDeleteById(id) > 0;
    }
    
    /**
     * 清理已逻辑删除超过90天的数据
     */
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点执行
    public void cleanOldDeletedData() {
        LocalDateTime beforeDate = LocalDateTime.now().minusDays(90);
        int count = baseMapper.physicalDeleteOldData(beforeDate);
        log.info("清理历史删除数据：{}条", count);
    }
}
```

---

## 性能优化

### 索引设计

```sql
-- 1. 单独的逻辑删除字段索引
CREATE INDEX idx_deleted ON user(deleted);

-- 2. 复合索引（常用查询字段 + 逻辑删除字段）
CREATE INDEX idx_status_deleted ON user(status, deleted);

-- 3. 覆盖索引（包含逻辑删除字段）
CREATE INDEX idx_user_query ON user(dept_id, status, deleted);
```

### 分区表设计

```sql
-- 按逻辑删除状态分区
CREATE TABLE `user` (
  `id` BIGINT(20) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  -- ... 其他字段
  PRIMARY KEY (`id`, `deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
PARTITION BY LIST(deleted) (
  PARTITION p_active VALUES IN (0),
  PARTITION p_deleted VALUES IN (1)
);
```

### 查询优化

```java
// ❌ 不好：全表扫描
List<User> users = userMapper.selectList(null);

// ✅ 更好：添加必要的查询条件
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getDeptId, deptId)  // 使用有索引的字段
       .orderByDesc(User::getCreateTime)
       .last("LIMIT 1000");
List<User> users = userMapper.selectList(wrapper);
```

---

## 实战案例：回收站功能

### 回收站实现

```java
/**
 * 回收站服务
 */
@Service
public class RecycleBinServiceImpl implements RecycleBinService {
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * 查询回收站中的数据
     */
    public Page<User> pageDeletedUsers(Integer current, Integer size) {
        Page<User> page = new Page<>(current, size);
        
        // 自定义查询已删除的数据
        return userMapper.selectDeletedUsersPage(page);
    }
    
    /**
     * 恢复数据
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean recover(Long id) {
        User user = new User();
        user.setId(id);
        user.setDeleted(0);
        user.setDeleteTime(null);
        user.setDeleteBy(null);
        
        return userMapper.updateById(user) > 0;
    }
    
    /**
     * 批量恢复
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean batchRecover(List<Long> ids) {
        if (CollectionUtils.isEmpty(ids)) {
            return true;
        }
        
        List<User> users = ids.stream()
            .map(id -> {
                User user = new User();
                user.setId(id);
                user.setDeleted(0);
                user.setDeleteTime(null);
                user.setDeleteBy(null);
                return user;
            })
            .collect(Collectors.toList());
        
        return userMapper.updateBatchById(users);
    }
    
    /**
     * 彻底删除（物理删除）
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean physicalDelete(Long id) {
        // 记录操作日志
        log.warn("执行物理删除，ID: {}, 操作人: {}", 
                 id, SecurityUtils.getUsername());
        
        return userMapper.physicalDeleteById(id) > 0;
    }
    
    /**
     * 清空回收站（物理删除所有已逻辑删除的数据）
     */
    @Transactional(rollbackFor = Exception.class)
    public int emptyRecycleBin() {
        log.warn("清空回收站，操作人: {}", SecurityUtils.getUsername());
        
        return userMapper.physicalDeleteAllDeleted();
    }
}
```

### Mapper 实现

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 分页查询已删除的数据
     */
    @Select("SELECT * FROM user WHERE deleted = 1 ORDER BY delete_time DESC")
    Page<User> selectDeletedUsersPage(Page<?> page);
    
    /**
     * 物理删除单条记录
     */
    @Delete("DELETE FROM user WHERE id = #{id}")
    int physicalDeleteById(@Param("id") Long id);
    
    /**
     * 物理删除所有已逻辑删除的数据
     */
    @Delete("DELETE FROM user WHERE deleted = 1")
    int physicalDeleteAllDeleted();
}
```

---

## 关键点总结

1. **@TableLogic**：标记逻辑删除字段，支持全局和局部配置
2. **删除转换**：DELETE 操作转换为 UPDATE 操作
3. **自动过滤**：查询和更新操作自动添加 deleted = 0 条件
4. **字段设计**：推荐布尔型 + 删除时间 + 删除人的组合方案
5. **数据恢复**：通过更新 deleted 字段实现数据恢复
6. **物理删除**：自定义 Mapper 方法实现真正的删除
7. **性能优化**：合理设计索引，避免全表扫描

---

## 参考资料

- [逻辑删除](https://baomidou.com/pages/6b03c5/)
- [逻辑删除字段设计](https://baomidou.com/pages/6b03c5/#%E9%80%BB%E8%BE%91%E5%88%A0%E9%99%A4)

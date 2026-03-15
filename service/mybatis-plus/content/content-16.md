# 8.1 MetaObjectHandler 机制

## 概述

自动填充功能允许在插入或更新数据时，自动为指定字段填充值，如创建时间、更新时间、创建人、更新人等。这消除了手动设置这些字段的重复代码，保证了数据的完整性和一致性。

**核心功能：**
- 插入时自动填充
- 更新时自动填充
- 自定义填充逻辑
- 与 Spring Security 集成

---

## 自动填充原理与时机

### 填充时机

```java
public enum FieldFill {
    /**
     * 默认不处理
     */
    DEFAULT,
    
    /**
     * 插入时填充
     */
    INSERT,
    
    /**
     * 更新时填充
     */
    UPDATE,
    
    /**
     * 插入和更新时填充
     */
    INSERT_UPDATE
}
```

### 执行流程

```
1. 执行 insert/update 操作
   ↓
2. MyBatis Plus 拦截操作
   ↓
3. 检查实体类字段的 @TableField(fill = FieldFill.XXX)
   ↓
4. 调用 MetaObjectHandler 填充逻辑
   ↓
5. 设置字段值
   ↓
6. 执行 SQL
```

---

## 创建时间、更新时间自动填充

### 实体类配置

```java
@Data
@TableName("user")
public class User {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String name;
    
    private Integer age;
    
    /**
     * 创建时间（插入时填充）
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    /**
     * 更新时间（插入和更新时都填充）
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
```

### MetaObjectHandler 实现

```java
@Component
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    /**
     * 插入时填充
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("开始插入填充...");
        
        // 填充创建时间
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        
        // 填充更新时间
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
    
    /**
     * 更新时填充
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("开始更新填充...");
        
        // 填充更新时间
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

### 使用示例

```java
// 插入操作
User user = new User();
user.setName("张三");
user.setAge(18);
// 无需手动设置 createTime 和 updateTime
userMapper.insert(user);

// 执行的 SQL：
// INSERT INTO user(id, name, age, create_time, update_time) 
// VALUES(?, '张三', 18, '2024-01-01 12:00:00', '2024-01-01 12:00:00')

// 更新操作
User user = userMapper.selectById(1L);
user.setName("李四");
// 无需手动设置 updateTime
userMapper.updateById(user);

// 执行的 SQL：
// UPDATE user SET name='李四', update_time='2024-01-01 13:00:00' WHERE id=1
```

---

## 创建人、更新人字段填充

### 实体类配置

```java
@Data
@TableName("user")
public class User {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String name;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    /**
     * 创建人ID
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;
    
    /**
     * 更新人ID
     */
    @TableField(fill = FieldFill.UPDATE)
    private Long updateBy;
}
```

### MetaObjectHandler 实现

```java
@Component
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("开始插入填充...");
        
        // 获取当前用户ID
        Long userId = getCurrentUserId();
        
        // 填充创建时间
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        
        // 填充更新时间
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        
        // 填充创建人
        this.strictInsertFill(metaObject, "createBy", Long.class, userId);
        
        // 填充更新人
        this.strictInsertFill(metaObject, "updateBy", Long.class, userId);
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("开始更新填充...");
        
        // 获取当前用户ID
        Long userId = getCurrentUserId();
        
        // 填充更新时间
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        
        // 填充更新人
        this.strictUpdateFill(metaObject, "updateBy", Long.class, userId);
    }
    
    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId() {
        // 方式1：从 Spring Security 获取
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            // 从 UserDetails 中获取用户ID
            return ((LoginUser) userDetails).getUserId();
        }
        
        // 方式2：从 ThreadLocal 获取
        // return UserContextHolder.getUserId();
        
        // 方式3：从请求头获取
        // ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        // if (attributes != null) {
        //     String userId = attributes.getRequest().getHeader("User-Id");
        //     return Long.parseLong(userId);
        // }
        
        // 默认值（如系统用户）
        return 0L;
    }
}
```

---

## 多租户字段自动填充

### 实体类配置

```java
@Data
@TableName("order")
public class Order {
    
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String orderNo;
    
    private BigDecimal amount;
    
    /**
     * 租户ID（插入时填充）
     */
    @TableField(fill = FieldFill.INSERT)
    private Long tenantId;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
```

### MetaObjectHandler 实现

```java
@Component
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("开始插入填充...");
        
        // 填充租户ID
        Long tenantId = TenantContextHolder.getTenantId();
        if (tenantId != null) {
            this.strictInsertFill(metaObject, "tenantId", Long.class, tenantId);
        }
        
        // 填充其他字段
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("开始更新填充...");
        
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

---

## 填充方法详解

### strictInsertFill vs setFieldValByName

```java
@Override
public void insertFill(MetaObject metaObject) {
    // 方式1：strictInsertFill（严格模式，推荐）
    // 只有字段为 null 时才填充
    this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
    
    // 方式2：setFieldValByName（非严格模式）
    // 无论字段是否为 null 都填充（覆盖原值）
    this.setFieldValByName("createTime", LocalDateTime.now(), metaObject);
    
    // 方式3：fillStrategy（自定义策略）
    this.fillStrategy(metaObject, "createTime", LocalDateTime.now());
}
```

**区别：**
- `strictInsertFill`：只在字段为 null 时填充，保留用户手动设置的值
- `setFieldValByName`：无条件填充，覆盖用户设置的值
- 推荐使用 `strictInsertFill`，避免覆盖用户数据

### 批量填充

```java
@Override
public void insertFill(MetaObject metaObject) {
    // 批量填充多个字段
    LocalDateTime now = LocalDateTime.now();
    Long userId = getCurrentUserId();
    
    // 时间字段
    this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
    this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
    
    // 用户字段
    this.strictInsertFill(metaObject, "createBy", Long.class, userId);
    this.strictInsertFill(metaObject, "updateBy", Long.class, userId);
    
    // 其他字段
    this.strictInsertFill(metaObject, "deleted", Integer.class, 0);
    this.strictInsertFill(metaObject, "version", Integer.class, 1);
}
```

---

## 条件填充

### 根据实体类型填充

```java
@Override
public void insertFill(MetaObject metaObject) {
    // 获取实体类型
    Object originalObject = metaObject.getOriginalObject();
    
    if (originalObject instanceof BaseEntity) {
        // 基础实体类的通用填充
        BaseEntity baseEntity = (BaseEntity) originalObject;
        
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "createBy", Long.class, getCurrentUserId());
    }
    
    if (originalObject instanceof Order) {
        // 订单特有的填充逻辑
        this.strictInsertFill(metaObject, "orderStatus", Integer.class, OrderStatus.PENDING.getCode());
    }
}
```

### 根据字段值判断

```java
@Override
public void insertFill(MetaObject metaObject) {
    // 只有 deleted 字段为 null 时才填充
    Object deleted = this.getFieldValByName("deleted", metaObject);
    if (deleted == null) {
        this.strictInsertFill(metaObject, "deleted", Integer.class, 0);
    }
    
    // 只有 status 字段为 null 时才填充
    Object status = this.getFieldValByName("status", metaObject);
    if (status == null) {
        this.strictInsertFill(metaObject, "status", Integer.class, 1);
    }
}
```

---

## 自定义填充值提供者

### 填充值提供者接口

```java
/**
 * 填充值提供者
 */
public interface FieldValueProvider<T> {
    T getValue();
}

/**
 * 当前时间提供者
 */
@Component
public class CurrentTimeProvider implements FieldValueProvider<LocalDateTime> {
    
    @Override
    public LocalDateTime getValue() {
        return LocalDateTime.now();
    }
}

/**
 * 当前用户ID提供者
 */
@Component
public class CurrentUserIdProvider implements FieldValueProvider<Long> {
    
    @Override
    public Long getValue() {
        // 从 Spring Security 获取
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return ((LoginUser) authentication.getPrincipal()).getUserId();
        }
        return 0L;
    }
}
```

### 使用提供者

```java
@Component
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Autowired
    private CurrentTimeProvider currentTimeProvider;
    
    @Autowired
    private CurrentUserIdProvider currentUserIdProvider;
    
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, 
            currentTimeProvider.getValue());
        
        this.strictInsertFill(metaObject, "createBy", Long.class, 
            currentUserIdProvider.getValue());
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, 
            currentTimeProvider.getValue());
        
        this.strictUpdateFill(metaObject, "updateBy", Long.class, 
            currentUserIdProvider.getValue());
    }
}
```

---

## 批量操作中的自动填充

### saveBatch 批量插入

```java
// 批量插入
List<User> users = new ArrayList<>();
for (int i = 0; i < 1000; i++) {
    User user = new User();
    user.setName("用户" + i);
    users.add(user);
}

// 自动填充对每条记录都生效
userService.saveBatch(users);

// 每条记录的 createTime、updateTime、createBy、updateBy 都会被填充
```

**注意：** 批量操作时，自动填充会对每条记录执行，可能影响性能。

### 批量操作性能优化

```java
/**
 * 批量操作时手动填充（提升性能）
 */
public void batchInsertOptimized(List<User> users) {
    // 预先计算填充值
    LocalDateTime now = LocalDateTime.now();
    Long userId = getCurrentUserId();
    
    // 手动填充
    users.forEach(user -> {
        user.setCreateTime(now);
        user.setUpdateTime(now);
        user.setCreateBy(userId);
        user.setUpdateBy(userId);
    });
    
    // 批量插入（此时自动填充不会覆盖已设置的值）
    userService.saveBatch(users);
}
```

---

## 注解驱动的自动填充

### 自定义注解

```java
/**
 * 自动填充注解
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AutoFill {
    
    /**
     * 填充时机
     */
    FieldFill value() default FieldFill.INSERT_UPDATE;
    
    /**
     * 填充值提供者
     */
    Class<? extends FieldValueProvider<?>> provider();
}
```

### 使用注解

```java
@Data
public class User {
    
    @TableId
    private Long id;
    
    private String name;
    
    /**
     * 使用注解自动填充
     */
    @AutoFill(value = FieldFill.INSERT, provider = CurrentTimeProvider.class)
    private LocalDateTime createTime;
    
    @AutoFill(value = FieldFill.INSERT_UPDATE, provider = CurrentTimeProvider.class)
    private LocalDateTime updateTime;
    
    @AutoFill(value = FieldFill.INSERT, provider = CurrentUserIdProvider.class)
    private Long createBy;
}
```

### 注解处理器

```java
@Component
public class AnnotationMetaObjectHandler implements MetaObjectHandler {
    
    @Autowired
    private ApplicationContext applicationContext;
    
    @Override
    public void insertFill(MetaObject metaObject) {
        fillByAnnotation(metaObject, FieldFill.INSERT);
        fillByAnnotation(metaObject, FieldFill.INSERT_UPDATE);
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        fillByAnnotation(metaObject, FieldFill.UPDATE);
        fillByAnnotation(metaObject, FieldFill.INSERT_UPDATE);
    }
    
    private void fillByAnnotation(MetaObject metaObject, FieldFill fillType) {
        Object originalObject = metaObject.getOriginalObject();
        Class<?> clazz = originalObject.getClass();
        
        Field[] fields = clazz.getDeclaredFields();
        for (Field field : fields) {
            AutoFill autoFill = field.getAnnotation(AutoFill.class);
            
            if (autoFill != null && autoFill.value() == fillType) {
                // 获取填充值提供者
                FieldValueProvider<?> provider = applicationContext.getBean(autoFill.provider());
                Object value = provider.getValue();
                
                // 填充字段
                this.setFieldValByName(field.getName(), value, metaObject);
            }
        }
    }
}
```

---

## 关键点总结

1. **填充时机**：INSERT（插入）、UPDATE（更新）、INSERT_UPDATE（插入和更新）
2. **实现接口**：MetaObjectHandler，重写 insertFill 和 updateFill 方法
3. **填充方法**：strictInsertFill（推荐）、setFieldValByName、fillStrategy
4. **获取当前用户**：Spring Security、ThreadLocal、请求头
5. **批量操作**：自动填充对每条记录生效，注意性能
6. **严格模式**：只在字段为 null 时填充，保留用户设置的值
7. **扩展性**：使用提供者模式或注解驱动，提高灵活性

---

## 参考资料

- [自动填充功能](https://baomidou.com/pages/4c6bcf/)
- [MetaObjectHandler](https://baomidou.com/pages/4c6bcf/#metaobjecthandler)

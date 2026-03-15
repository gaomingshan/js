# 8.2 自动填充最佳实践

## 概述

虽然自动填充功能使用简单，但在实际项目中仍需要注意许多细节。本节介绍自动填充的最佳实践，包括审计字段设计规范、与 Spring Security 集成、批量操作优化等。

**核心内容：**
- 审计字段设计规范
- 与 Spring Security 集成
- 批量操作中的自动填充
- 性能优化建议

---

## 审计字段设计规范

### 标准审计字段

```java
/**
 * 基础实体类（包含标准审计字段）
 */
@Data
public abstract class BaseEntity implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
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
    
    /**
     * 逻辑删除标记
     */
    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;
}
```

### 数据库表设计

```sql
-- 标准审计字段
CREATE TABLE `user` (
  `id` BIGINT(20) NOT NULL COMMENT '主键ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `age` INT(11) DEFAULT NULL COMMENT '年龄',
  `email` VARCHAR(50) DEFAULT NULL COMMENT '邮箱',
  
  -- 审计字段
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT(20) NOT NULL DEFAULT 0 COMMENT '创建人ID',
  `update_by` BIGINT(20) NOT NULL DEFAULT 0 COMMENT '更新人ID',
  `deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除标记(0:未删除,1:已删除)',
  
  PRIMARY KEY (`id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_create_by` (`create_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 字段命名规范

| 字段类型 | 推荐命名 | 类型 | 说明 |
|---------|---------|------|------|
| 主键 | id | BIGINT | 使用雪花算法或数据库自增 |
| 创建时间 | create_time | DATETIME | 记录创建时间戳 |
| 更新时间 | update_time | DATETIME | 记录最后更新时间戳 |
| 创建人 | create_by | BIGINT | 创建人用户ID |
| 更新人 | update_by | BIGINT | 最后更新人用户ID |
| 删除标记 | deleted | TINYINT | 逻辑删除标记 |
| 版本号 | version | INT | 乐观锁版本号 |
| 租户ID | tenant_id | BIGINT | 多租户隔离字段 |

---

## 与 Spring Security 集成获取当前用户

### 方案1：Spring Security

```java
/**
 * Spring Security 用户详情
 */
public class LoginUser implements UserDetails {
    
    private Long userId;
    private String username;
    private String password;
    private List<GrantedAuthority> authorities;
    
    // getter/setter...
    
    public Long getUserId() {
        return userId;
    }
}

/**
 * 安全工具类
 */
public class SecurityUtils {
    
    /**
     * 获取当前用户ID
     */
    public static Long getUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return null;
            }
            
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof LoginUser) {
                return ((LoginUser) principal).getUserId();
            }
            
            return null;
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 获取当前用户名
     */
    public static String getUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return null;
            }
            
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof LoginUser) {
                return ((LoginUser) principal).getUsername();
            }
            
            if (principal instanceof String) {
                return (String) principal;
            }
            
            return null;
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 是否已认证
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() &&
               !(authentication instanceof AnonymousAuthenticationToken);
    }
}
```

### 方案2：ThreadLocal 上下文

```java
/**
 * 用户上下文（适用于非 Spring Security 项目）
 */
public class UserContextHolder {
    
    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> USERNAME = new ThreadLocal<>();
    
    public static void setUserId(Long userId) {
        USER_ID.set(userId);
    }
    
    public static Long getUserId() {
        return USER_ID.get();
    }
    
    public static void setUsername(String username) {
        USERNAME.set(username);
    }
    
    public static String getUsername() {
        return USERNAME.get();
    }
    
    public static void clear() {
        USER_ID.remove();
        USERNAME.remove();
    }
}

/**
 * 拦截器设置用户上下文
 */
@Component
public class UserContextInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) {
        // 从 JWT Token 或 Session 获取用户信息
        String token = request.getHeader("Authorization");
        
        if (StringUtils.isNotBlank(token)) {
            // 解析 Token 获取用户ID
            Long userId = JwtUtils.getUserId(token);
            String username = JwtUtils.getUsername(token);
            
            UserContextHolder.setUserId(userId);
            UserContextHolder.setUsername(username);
        }
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, 
                               HttpServletResponse response, 
                               Object handler, 
                               Exception ex) {
        UserContextHolder.clear();
    }
}
```

### 方案3：请求头传递

```java
/**
 * 从请求头获取用户ID
 */
public class RequestHeaderUtils {
    
    public static Long getUserId() {
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String userId = request.getHeader("X-User-Id");
            
            if (StringUtils.isNotBlank(userId)) {
                return Long.parseLong(userId);
            }
        }
        
        return null;
    }
}
```

### MetaObjectHandler 集成

```java
@Component
@Slf4j
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        log.debug("开始插入填充...");
        
        LocalDateTime now = LocalDateTime.now();
        Long userId = getCurrentUserId();
        
        // 填充时间字段
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
        
        // 填充用户字段
        this.strictInsertFill(metaObject, "createBy", Long.class, userId);
        this.strictInsertFill(metaObject, "updateBy", Long.class, userId);
        
        // 填充逻辑删除字段
        this.strictInsertFill(metaObject, "deleted", Integer.class, 0);
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        log.debug("开始更新填充...");
        
        LocalDateTime now = LocalDateTime.now();
        Long userId = getCurrentUserId();
        
        // 填充更新时间
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, now);
        
        // 填充更新人
        this.strictUpdateFill(metaObject, "updateBy", Long.class, userId);
    }
    
    /**
     * 获取当前用户ID
     * 优先级：Spring Security > ThreadLocal > 请求头 > 默认值
     */
    private Long getCurrentUserId() {
        // 1. 尝试从 Spring Security 获取
        Long userId = SecurityUtils.getUserId();
        if (userId != null) {
            return userId;
        }
        
        // 2. 尝试从 ThreadLocal 获取
        userId = UserContextHolder.getUserId();
        if (userId != null) {
            return userId;
        }
        
        // 3. 尝试从请求头获取
        userId = RequestHeaderUtils.getUserId();
        if (userId != null) {
            return userId;
        }
        
        // 4. 返回默认值（系统用户）
        log.warn("无法获取当前用户ID，使用默认值0");
        return 0L;
    }
}
```

---

## 批量操作中的自动填充

### 批量插入性能对比

```java
/**
 * 批量插入性能测试
 */
public class BatchInsertPerformanceTest {
    
    @Autowired
    private UserService userService;
    
    /**
     * 测试：1000条数据插入
     */
    public void test() {
        List<User> users = prepareData(1000);
        
        // 方式1：逐条插入（最慢）
        long start1 = System.currentTimeMillis();
        users.forEach(user -> userService.save(user));
        long end1 = System.currentTimeMillis();
        System.out.println("逐条插入：" + (end1 - start1) + "ms");  // 约 5000ms
        
        // 方式2：saveBatch 批量插入（使用自动填充）
        long start2 = System.currentTimeMillis();
        userService.saveBatch(users);
        long end2 = System.currentTimeMillis();
        System.out.println("saveBatch：" + (end2 - start2) + "ms");  // 约 800ms
        
        // 方式3：手动填充 + saveBatch（最快）
        long start3 = System.currentTimeMillis();
        manualFillAndBatchInsert(users);
        long end3 = System.currentTimeMillis();
        System.out.println("手动填充：" + (end3 - start3) + "ms");  // 约 500ms
    }
    
    /**
     * 手动填充 + 批量插入
     */
    private void manualFillAndBatchInsert(List<User> users) {
        // 预先计算填充值
        LocalDateTime now = LocalDateTime.now();
        Long userId = SecurityUtils.getUserId();
        
        // 批量填充
        users.forEach(user -> {
            user.setCreateTime(now);
            user.setUpdateTime(now);
            user.setCreateBy(userId);
            user.setUpdateBy(userId);
            user.setDeleted(0);
        });
        
        // 批量插入（此时自动填充不会覆盖已设置的值）
        userService.saveBatch(users);
    }
}
```

### 批量操作优化建议

```java
/**
 * 批量操作优化服务
 */
@Service
public class OptimizedUserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 优化的批量插入
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean batchInsertOptimized(List<User> users) {
        if (CollectionUtils.isEmpty(users)) {
            return true;
        }
        
        // 预先计算填充值（只计算一次）
        LocalDateTime now = LocalDateTime.now();
        Long userId = SecurityUtils.getUserId();
        
        // 手动填充所有记录
        users.forEach(user -> {
            if (user.getCreateTime() == null) {
                user.setCreateTime(now);
            }
            if (user.getUpdateTime() == null) {
                user.setUpdateTime(now);
            }
            if (user.getCreateBy() == null) {
                user.setCreateBy(userId);
            }
            if (user.getUpdateBy() == null) {
                user.setUpdateBy(userId);
            }
            if (user.getDeleted() == null) {
                user.setDeleted(0);
            }
        });
        
        // 批量插入（每批500条）
        return saveBatch(users, 500);
    }
    
    /**
     * 优化的批量更新
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean batchUpdateOptimized(List<User> users) {
        if (CollectionUtils.isEmpty(users)) {
            return true;
        }
        
        // 预先计算填充值
        LocalDateTime now = LocalDateTime.now();
        Long userId = SecurityUtils.getUserId();
        
        // 手动填充更新字段
        users.forEach(user -> {
            user.setUpdateTime(now);
            user.setUpdateBy(userId);
        });
        
        // 批量更新
        return updateBatchById(users, 500);
    }
}
```

---

## 特殊场景处理

### 场景1：导入数据时禁用自动填充

```java
/**
 * 数据导入（保留原始的创建时间和创建人）
 */
@Service
public class DataImportService {
    
    @Autowired
    private UserService userService;
    
    /**
     * 导入用户数据
     */
    @Transactional(rollbackFor = Exception.class)
    public void importUsers(List<UserImportDTO> importData) {
        List<User> users = new ArrayList<>();
        
        for (UserImportDTO dto : importData) {
            User user = new User();
            BeanUtils.copyProperties(dto, user);
            
            // 手动设置审计字段（保留导入数据中的原始值）
            user.setCreateTime(dto.getOriginalCreateTime());
            user.setCreateBy(dto.getOriginalCreateBy());
            user.setUpdateTime(LocalDateTime.now());
            user.setUpdateBy(SecurityUtils.getUserId());
            
            users.add(user);
        }
        
        // 批量插入（自动填充不会覆盖已设置的值）
        userService.saveBatch(users);
    }
}
```

### 场景2：系统初始化数据

```java
/**
 * 系统初始化服务
 */
@Service
public class SystemInitService {
    
    @Autowired
    private UserService userService;
    
    /**
     * 初始化管理员账号
     */
    public void initAdminUser() {
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setNickname("系统管理员");
        
        // 系统初始化数据，创建人设为系统用户（ID=0）
        admin.setCreateTime(LocalDateTime.now());
        admin.setUpdateTime(LocalDateTime.now());
        admin.setCreateBy(0L);  // 系统用户
        admin.setUpdateBy(0L);
        admin.setDeleted(0);
        
        userService.save(admin);
    }
}
```

### 场景3：定时任务更新数据

```java
/**
 * 定时任务
 */
@Component
public class ScheduledTask {
    
    @Autowired
    private OrderService orderService;
    
    /**
     * 定时关闭超时未支付的订单
     */
    @Scheduled(cron = "0 */5 * * * ?")  // 每5分钟执行一次
    public void closeTimeoutOrders() {
        // 查询超时订单
        LocalDateTime timeout = LocalDateTime.now().minusMinutes(30);
        
        List<Order> timeoutOrders = orderService.lambdaQuery()
            .eq(Order::getStatus, OrderStatus.PENDING_PAYMENT)
            .lt(Order::getCreateTime, timeout)
            .list();
        
        if (CollectionUtils.isEmpty(timeoutOrders)) {
            return;
        }
        
        // 批量关闭订单
        LocalDateTime now = LocalDateTime.now();
        timeoutOrders.forEach(order -> {
            order.setStatus(OrderStatus.CLOSED);
            order.setUpdateTime(now);
            order.setUpdateBy(0L);  // 定时任务更新，设为系统用户
        });
        
        orderService.updateBatchById(timeoutOrders);
    }
}
```

---

## 性能优化建议

### 1. 避免重复计算

```java
// ❌ 不好：每次都计算当前时间和用户ID
@Override
public void insertFill(MetaObject metaObject) {
    this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
    this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    this.strictInsertFill(metaObject, "createBy", Long.class, getCurrentUserId());
    this.strictInsertFill(metaObject, "updateBy", Long.class, getCurrentUserId());
}

// ✅ 更好：计算一次，重复使用
@Override
public void insertFill(MetaObject metaObject) {
    LocalDateTime now = LocalDateTime.now();
    Long userId = getCurrentUserId();
    
    this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
    this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
    this.strictInsertFill(metaObject, "createBy", Long.class, userId);
    this.strictInsertFill(metaObject, "updateBy", Long.class, userId);
}
```

### 2. 使用缓存

```java
@Component
public class CachedMetaObjectHandler implements MetaObjectHandler {
    
    /**
     * 缓存当前用户ID（请求级别缓存）
     */
    private static final ThreadLocal<Long> USER_ID_CACHE = new ThreadLocal<>();
    
    @Override
    public void insertFill(MetaObject metaObject) {
        Long userId = getUserIdWithCache();
        // ... 填充逻辑
    }
    
    /**
     * 获取用户ID（带缓存）
     */
    private Long getUserIdWithCache() {
        Long userId = USER_ID_CACHE.get();
        
        if (userId == null) {
            userId = SecurityUtils.getUserId();
            USER_ID_CACHE.set(userId);
        }
        
        return userId;
    }
    
    /**
     * 清除缓存（请求结束时调用）
     */
    public static void clearCache() {
        USER_ID_CACHE.remove();
    }
}

// 在拦截器中清除缓存
@Component
public class CacheClearInterceptor implements HandlerInterceptor {
    
    @Override
    public void afterCompletion(HttpServletRequest request, 
                               HttpServletResponse response, 
                               Object handler, 
                               Exception ex) {
        CachedMetaObjectHandler.clearCache();
    }
}
```

### 3. 异步填充（适用于非关键字段）

```java
/**
 * 异步填充处理器
 */
@Component
public class AsyncMetaObjectHandler implements MetaObjectHandler {
    
    @Autowired
    private ThreadPoolTaskExecutor taskExecutor;
    
    @Override
    public void insertFill(MetaObject metaObject) {
        // 同步填充关键字段
        LocalDateTime now = LocalDateTime.now();
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
        
        // 异步填充非关键字段
        taskExecutor.execute(() -> {
            Long userId = SecurityUtils.getUserId();
            this.strictInsertFill(metaObject, "createBy", Long.class, userId);
            this.strictInsertFill(metaObject, "updateBy", Long.class, userId);
        });
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

---

## 常见问题与解决

### 问题1：自动填充不生效

**原因：**
- 实体类字段没有 `@TableField(fill = FieldFill.XXX)` 注解
- MetaObjectHandler 未注册为 Spring Bean
- 字段已经有值（strictXxxFill 不会覆盖）

**解决：**
```java
// 1. 确保注解正确
@TableField(fill = FieldFill.INSERT)
private LocalDateTime createTime;

// 2. 确保 Handler 是 Bean
@Component  // 必须有此注解
public class MyMetaObjectHandler implements MetaObjectHandler {
    // ...
}

// 3. 检查字段是否已有值
Object createTime = this.getFieldValByName("createTime", metaObject);
System.out.println("createTime: " + createTime);  // 如果不为 null，strictInsertFill 不会填充
```

### 问题2：批量操作填充失败

**原因：** 批量操作时，某些字段已被手动设置

**解决：**
```java
// 使用 setFieldValByName 强制填充
@Override
public void insertFill(MetaObject metaObject) {
    // 方式1：strict 方式（只在字段为 null 时填充）
    this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
    
    // 方式2：强制填充（覆盖已有值）
    this.setFieldValByName("createTime", LocalDateTime.now(), metaObject);
}
```

### 问题3：获取不到当前用户

**原因：**
- 异步线程无法获取 ThreadLocal 中的用户信息
- 定时任务没有用户上下文

**解决：**
```java
@Override
public void insertFill(MetaObject metaObject) {
    Long userId = getCurrentUserId();
    
    // 如果获取不到用户ID，使用默认值
    if (userId == null) {
        userId = 0L;  // 系统用户
    }
    
    this.strictInsertFill(metaObject, "createBy", Long.class, userId);
}
```

---

## 关键点总结

1. **审计字段规范**：统一使用 BaseEntity，包含标准审计字段
2. **获取当前用户**：优先级 Spring Security > ThreadLocal > 请求头 > 默认值
3. **批量操作优化**：手动填充 + saveBatch 性能最优
4. **特殊场景**：数据导入、系统初始化、定时任务需特殊处理
5. **性能优化**：避免重复计算、使用缓存、考虑异步填充
6. **错误处理**：获取不到用户时使用默认值，避免空指针
7. **严格模式**：使用 strictXxxFill 避免覆盖用户数据

---

## 参考资料

- [自动填充功能](https://baomidou.com/pages/4c6bcf/)
- [Spring Security 集成](https://spring.io/projects/spring-security)

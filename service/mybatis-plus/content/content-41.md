# 19.2 实战案例：权限管理系统

## 概述

基于 RBAC 模型实现完整的权限管理系统，包括用户、角色、权限、菜单管理。

**核心功能：**
- 用户管理
- 角色管理
- 权限分配
- 菜单权限

---

## RBAC 模型设计

```sql
-- 用户表
CREATE TABLE `sys_user` (
  `id` BIGINT(20) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB;

-- 角色表
CREATE TABLE `sys_role` (
  `id` BIGINT(20) NOT NULL,
  `role_name` VARCHAR(50) NOT NULL,
  `role_key` VARCHAR(50) NOT NULL,
  `data_scope` TINYINT(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 用户角色关联表
CREATE TABLE `sys_user_role` (
  `user_id` BIGINT(20) NOT NULL,
  `role_id` BIGINT(20) NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`)
) ENGINE=InnoDB;

-- 权限表
CREATE TABLE `sys_permission` (
  `id` BIGINT(20) NOT NULL,
  `permission_name` VARCHAR(50) NOT NULL,
  `permission_key` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 角色权限关联表
CREATE TABLE `sys_role_permission` (
  `role_id` BIGINT(20) NOT NULL,
  `permission_id` BIGINT(20) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`)
) ENGINE=InnoDB;
```

---

## 权限验证

```java
@Service
public class PermissionService {
    
    @Autowired
    private UserService userService;
    
    /**
     * 检查用户是否有权限
     */
    public boolean hasPermission(Long userId, String permission) {
        // 1. 获取用户角色
        List<Role> roles = userService.getRoles(userId);
        
        // 2. 获取角色权限
        for (Role role : roles) {
            List<Permission> permissions = roleService.getPermissions(role.getId());
            
            if (permissions.stream()
                    .anyMatch(p -> p.getPermissionKey().equals(permission))) {
                return true;
            }
        }
        
        return false;
    }
}

/**
 * 权限注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    String value();
}

/**
 * 权限拦截器
 */
@Aspect
@Component
public class PermissionAspect {
    
    @Autowired
    private PermissionService permissionService;
    
    @Around("@annotation(requirePermission)")
    public Object checkPermission(ProceedingJoinPoint point, 
                                  RequirePermission requirePermission) throws Throwable {
        Long userId = SecurityUtils.getUserId();
        String permission = requirePermission.value();
        
        if (!permissionService.hasPermission(userId, permission)) {
            throw new BusinessException("无权限访问");
        }
        
        return point.proceed();
    }
}
```

---

## 使用示例

```java
@RestController
@RequestMapping("/user")
public class UserController {
    
    /**
     * 查询用户列表（需要权限）
     */
    @RequirePermission("system:user:list")
    @GetMapping("/list")
    public Result<List<User>> list() {
        return Result.success(userService.list());
    }
    
    /**
     * 创建用户（需要权限）
     */
    @RequirePermission("system:user:add")
    @PostMapping
    public Result<Void> add(@RequestBody User user) {
        userService.save(user);
        return Result.success();
    }
}
```

---

## 关键点总结

1. **RBAC 模型**：用户-角色-权限
2. **权限注解**：方法级权限控制
3. **AOP 拦截**：统一权限验证
4. **数据权限**：行级数据过滤
5. **菜单权限**：动态菜单加载
6. **缓存优化**：缓存用户权限
7. **灵活扩展**：支持自定义权限规则

---

## 参考资料

- [RBAC 权限模型](https://en.wikipedia.org/wiki/Role-based_access_control)
- [若依权限系统](https://www.ruoyi.vip/)

# 15.2 数据权限实现

## 概述

数据权限控制是企业应用的核心需求，确保用户只能访问被授权的数据。本节介绍基于 MyBatis Plus 的数据权限完整解决方案。

**核心内容：**
- 数据权限模型设计
- 动态 SQL 权限过滤
- 角色数据权限
- 部门数据权限

---

## 数据权限模型

### 权限范围定义

```java
/**
 * 数据权限范围
 */
public enum DataScope {
    
    ALL(1, "全部数据权限"),
    CUSTOM(2, "自定义数据权限"),
    DEPT(3, "本部门数据权限"),
    DEPT_AND_CHILD(4, "本部门及以下数据权限"),
    SELF(5, "仅本人数据权限");
    
    private final int code;
    private final String name;
    
    DataScope(int code, String name) {
        this.code = code;
        this.name = name;
    }
}

/**
 * 角色数据权限
 */
@Data
@TableName("role")
public class Role {
    @TableId
    private Long id;
    
    private String roleName;
    
    /**
     * 数据范围
     */
    private Integer dataScope;
    
    /**
     * 自定义部门权限
     */
    @TableField(exist = false)
    private Set<Long> deptIds;
}
```

---

## 数据权限拦截器

### 自定义数据权限插件

```java
/**
 * 数据权限拦截器
 */
@Component
public class DataPermissionInterceptor implements InnerInterceptor {
    
    @Override
    public void beforeQuery(Executor executor, 
                           MappedStatement ms, 
                           Object parameter, 
                           RowBounds rowBounds, 
                           ResultHandler resultHandler, 
                           BoundSql boundSql) throws SQLException {
        
        // 获取当前用户
        LoginUser loginUser = SecurityUtils.getLoginUser();
        
        if (loginUser == null || loginUser.isAdmin()) {
            // 管理员不过滤
            return;
        }
        
        // 构建数据权限 SQL
        String dataSql = buildDataPermissionSql(loginUser);
        
        if (StringUtils.isBlank(dataSql)) {
            return;
        }
        
        // 改写原始 SQL
        String originalSql = boundSql.getSql();
        String newSql = addDataPermission(originalSql, dataSql);
        
        // 替换 SQL
        try {
            Field field = boundSql.getClass().getDeclaredField("sql");
            field.setAccessible(true);
            field.set(boundSql, newSql);
        } catch (Exception e) {
            throw new RuntimeException("修改SQL失败", e);
        }
    }
    
    /**
     * 构建数据权限 SQL
     */
    private String buildDataPermissionSql(LoginUser loginUser) {
        Role role = loginUser.getRole();
        
        if (role == null) {
            return "";
        }
        
        StringBuilder sql = new StringBuilder();
        
        switch (DataScope.valueOf(role.getDataScope())) {
            case ALL:
                // 全部数据权限，不过滤
                break;
                
            case CUSTOM:
                // 自定义数据权限
                if (CollectionUtils.isNotEmpty(role.getDeptIds())) {
                    sql.append(" AND dept_id IN (");
                    sql.append(role.getDeptIds().stream()
                        .map(String::valueOf)
                        .collect(Collectors.joining(",")));
                    sql.append(")");
                }
                break;
                
            case DEPT:
                // 本部门数据权限
                sql.append(" AND dept_id = ").append(loginUser.getDeptId());
                break;
                
            case DEPT_AND_CHILD:
                // 本部门及子部门数据权限
                sql.append(" AND (dept_id = ").append(loginUser.getDeptId());
                sql.append(" OR dept_id IN (");
                sql.append("SELECT id FROM dept WHERE find_in_set(");
                sql.append(loginUser.getDeptId()).append(", ancestors)");
                sql.append("))");
                break;
                
            case SELF:
                // 仅本人数据权限
                sql.append(" AND create_by = ").append(loginUser.getUserId());
                break;
        }
        
        return sql.toString();
    }
    
    /**
     * 添加数据权限到 SQL
     */
    private String addDataPermission(String originalSql, String dataSql) {
        // 解析 SQL
        Statement statement = CCJSqlParserUtil.parse(originalSql);
        
        if (statement instanceof Select) {
            Select select = (Select) statement;
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            
            // 构建权限表达式
            Expression permissionExpr = CCJSqlParserUtil.parseCondExpression(dataSql);
            
            // 添加到 WHERE 子句
            Expression where = plainSelect.getWhere();
            if (where != null) {
                AndExpression and = new AndExpression(where, permissionExpr);
                plainSelect.setWhere(and);
            } else {
                plainSelect.setWhere(permissionExpr);
            }
            
            return select.toString();
        }
        
        return originalSql;
    }
}
```

---

## 注解式数据权限

### 自定义注解

```java
/**
 * 数据权限注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DataPermission {
    
    /**
     * 部门表别名
     */
    String deptAlias() default "";
    
    /**
     * 用户表别名
     */
    String userAlias() default "";
    
    /**
     * 是否启用数据权限
     */
    boolean enabled() default true;
}

/**
 * 使用注解
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 查询用户列表（应用数据权限）
     */
    @DataPermission(deptAlias = "d", userAlias = "u")
    @Select("SELECT u.* FROM user u LEFT JOIN dept d ON u.dept_id = d.id")
    List<User> selectUserList();
    
    /**
     * 查询所有用户（不应用数据权限）
     */
    @DataPermission(enabled = false)
    @Select("SELECT * FROM user")
    List<User> selectAllUsers();
}
```

---

## 实战案例：订单数据权限

### 订单权限规则

```java
/**
 * 订单数据权限规则：
 * 1. 管理员：查看所有订单
 * 2. 销售经理：查看本部门及下属部门订单
 * 3. 销售员：查看自己创建的订单
 * 4. 客服：查看所有订单（只读）
 */
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    /**
     * 分页查询订单（自动应用数据权限）
     */
    public Page<Order> pageList(OrderQueryDTO dto) {
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.isNotBlank(dto.getOrderNo()), 
                     Order::getOrderNo, dto.getOrderNo())
               .eq(dto.getStatus() != null, 
                   Order::getStatus, dto.getStatus())
               .orderByDesc(Order::getCreateTime);
        
        // 数据权限在拦截器中自动添加
        return page(new Page<>(dto.getCurrent(), dto.getSize()), wrapper);
    }
}
```

### 部门层级权限

```sql
-- 部门表（树形结构）
CREATE TABLE `dept` (
  `id` BIGINT(20) NOT NULL,
  `parent_id` BIGINT(20) NOT NULL DEFAULT 0 COMMENT '父部门ID',
  `ancestors` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '祖级列表',
  `dept_name` VARCHAR(100) NOT NULL,
  `order_num` INT(11) DEFAULT 0,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `create_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB COMMENT='部门表';

-- ancestors 字段存储：0,100,101
-- 表示：根部门(0) -> 销售部(100) -> 华东区(101)
```

```java
/**
 * 查询部门及子部门
 */
public List<Long> getDeptAndChildren(Long deptId) {
    List<Long> deptIds = new ArrayList<>();
    deptIds.add(deptId);
    
    // 查询所有子部门
    List<Dept> children = deptMapper.selectList(
        new LambdaQueryWrapper<Dept>()
            .apply("FIND_IN_SET({0}, ancestors)", deptId)
    );
    
    deptIds.addAll(children.stream()
        .map(Dept::getId)
        .collect(Collectors.toList()));
    
    return deptIds;
}
```

---

## 行级权限控制

### 基于规则的权限

```java
/**
 * 数据权限规则引擎
 */
@Component
public class DataPermissionRuleEngine {
    
    /**
     * 评估权限
     */
    public boolean evaluate(LoginUser user, Object resource) {
        if (user.isAdmin()) {
            return true;
        }
        
        // 获取资源的权限规则
        List<PermissionRule> rules = getPermissionRules(resource.getClass());
        
        for (PermissionRule rule : rules) {
            if (rule.match(user, resource)) {
                return rule.isAllow();
            }
        }
        
        return false;
    }
}

/**
 * 权限规则
 */
public interface PermissionRule {
    
    /**
     * 是否匹配
     */
    boolean match(LoginUser user, Object resource);
    
    /**
     * 是否允许
     */
    boolean isAllow();
}

/**
 * 订单创建人权限规则
 */
public class OrderCreatorRule implements PermissionRule {
    
    @Override
    public boolean match(LoginUser user, Object resource) {
        if (resource instanceof Order) {
            Order order = (Order) resource;
            return Objects.equals(order.getCreateBy(), user.getUserId());
        }
        return false;
    }
    
    @Override
    public boolean isAllow() {
        return true;
    }
}
```

---

## 关键点总结

1. **数据范围**：全部、自定义、部门、部门及子级、仅本人
2. **SQL 改写**：通过拦截器动态添加权限条件
3. **注解控制**：支持方法级别的权限控制
4. **部门层级**：使用 ancestors 字段实现层级查询
5. **规则引擎**：灵活的权限规则配置
6. **性能优化**：合理使用索引，避免复杂子查询
7. **权限缓存**：缓存用户权限信息，减少查询

---

## 参考资料

- [数据权限设计](https://www.ruoyi.vip/ruoyi/document/htsc.html#%E6%95%B0%E6%8D%AE%E6%9D%83%E9%99%90)
- [RBAC 权限模型](https://en.wikipedia.org/wiki/Role-based_access_control)

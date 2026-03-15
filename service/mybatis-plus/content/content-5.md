# 3.1 注解体系

## 概述

MyBatis Plus 提供了一套完整的注解体系，用于配置实体类与数据库表的映射关系。合理使用注解可以简化配置、提高开发效率，同时保持灵活性。

**核心注解：**
- `@TableName`：表名映射
- `@TableId`：主键配置
- `@TableField`：字段映射与配置
- `@TableLogic`：逻辑删除
- `@Version`：乐观锁
- 其他辅助注解

---

## @TableName：表名映射

### 基本用法

```java
/**
 * 指定表名
 */
@TableName("sys_user")
public class User {
    private Long id;
    private String name;
}
```

### 配置项详解

```java
@TableName(
    value = "sys_user",              // 表名
    schema = "test_db",               // 数据库 schema（可选）
    keepGlobalPrefix = false,         // 是否保持全局表前缀
    resultMap = "userResultMap",      // 对应的 resultMap ID
    autoResultMap = false,            // 是否自动构建 resultMap
    excludeProperty = {"field1"}      // 排除的属性（不映射到表）
)
public class User {
    // ...
}
```

### 全局表前缀配置

```yaml
# application.yml
mybatis-plus:
  global-config:
    db-config:
      table-prefix: t_
```

```java
// 配置了 table-prefix: t_

// 实体类
@TableName("user")  // 实际表名：t_user
public class User {}

// 如果不想使用全局前缀
@TableName(value = "sys_user", keepGlobalPrefix = false)
public class Admin {}  // 实际表名：sys_user（忽略前缀）
```

### 动态表名

```java
/**
 * 使用动态表名（需配合插件）
 */
@TableName("order_${year}")
public class Order {
    // 通过插件动态替换 ${year} 为实际年份
    // 实现按年分表：order_2023, order_2024
}
```

### 最佳实践

```java
// ✅ 推荐：类名与表名一致时省略注解
public class User {}  // 表名：user

// ✅ 推荐：配置全局前缀，实体类只写业务名
// 配置 table-prefix: t_
public class User {}  // 表名：t_user

// ❌ 不推荐：重复配置前缀
// 配置 table-prefix: t_
@TableName("t_user")  // 实际表名：t_t_user（错误）
public class User {}
```

---

## @TableId：主键配置

### 主键类型（IdType）

```java
public enum IdType {
    AUTO(0),        // 数据库自增
    NONE(1),        // 未设置主键类型
    INPUT(2),       // 手动输入
    ASSIGN_ID(3),   // 雪花算法（Long、String）
    ASSIGN_UUID(4); // UUID（String）
}
```

### 基本用法

```java
@Data
public class User {
    
    /**
     * 数据库自增主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String name;
}
```

### 不同主键策略示例

```java
// 1. 数据库自增
@TableId(type = IdType.AUTO)
private Long id;
// 使用场景：MySQL 自增主键

// 2. 雪花算法（默认）
@TableId(type = IdType.ASSIGN_ID)
private Long id;
// 使用场景：分布式系统，需要全局唯一 ID

// 3. UUID
@TableId(type = IdType.ASSIGN_UUID)
private String id;
// 使用场景：需要字符串类型主键

// 4. 手动输入
@TableId(type = IdType.INPUT)
private String id;
// 使用场景：业务 ID（如订单号）

// 5. 自定义字段名
@TableId(value = "user_id", type = IdType.AUTO)
private Long id;
```

### 全局主键策略

```yaml
# application.yml
mybatis-plus:
  global-config:
    db-config:
      id-type: assign_id  # 全局默认使用雪花算法
```

```java
// 全局配置后，可以省略注解
public class User {
    private Long id;  // 使用全局配置的 assign_id
}

// 特殊情况可以覆盖
public class Product {
    @TableId(type = IdType.AUTO)  // 覆盖全局配置
    private Long id;
}
```

---

## @TableField：字段映射与配置

### 基本用法

```java
@Data
public class User {
    
    @TableId
    private Long id;
    
    /**
     * 指定数据库字段名
     */
    @TableField("user_name")
    private String name;
    
    /**
     * 不存在的字段（不映射到数据库）
     */
    @TableField(exist = false)
    private String tempField;
}
```

### 配置项详解

```java
@TableField(
    value = "user_name",           // 数据库字段名
    exist = true,                  // 是否为数据库字段
    condition = SqlCondition.LIKE, // 条件构造器默认条件
    update = "%s+1",               // 更新时的 set 语句
    insertStrategy = FieldStrategy.NOT_NULL,  // 插入策略
    updateStrategy = FieldStrategy.NOT_NULL,  // 更新策略
    whereStrategy = FieldStrategy.NOT_NULL,   // 查询策略
    fill = FieldFill.INSERT,       // 自动填充策略
    select = true,                 // 是否进行 select 查询
    keepGlobalFormat = false,      // 是否保持全局格式化
    jdbcType = JdbcType.VARCHAR,   // JDBC 类型
    typeHandler = MyTypeHandler.class  // 类型处理器
)
private String name;
```

### 常用配置示例

#### 1. 排除非数据库字段

```java
public class User {
    @TableId
    private Long id;
    
    private String name;
    
    // 不映射到数据库
    @TableField(exist = false)
    private String token;
    
    @TableField(exist = false)
    private List<Role> roles;  // 关联查询的数据
}
```

#### 2. 自动填充字段

```java
public class User {
    @TableId
    private Long id;
    
    /**
     * 插入时自动填充
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    /**
     * 插入和更新时都填充
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    /**
     * 插入时填充
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;
    
    /**
     * 更新时填充
     */
    @TableField(fill = FieldFill.UPDATE)
    private Long updateBy;
}
```

#### 3. 字段策略控制

```java
public class User {
    @TableId
    private Long id;
    
    /**
     * 更新时，即使为 null 也更新
     */
    @TableField(updateStrategy = FieldStrategy.IGNORED)
    private String remark;
    
    /**
     * 插入时，字符串非空才插入
     */
    @TableField(insertStrategy = FieldStrategy.NOT_EMPTY)
    private String email;
}
```

#### 4. select 控制

```java
public class User {
    @TableId
    private Long id;
    
    private String name;
    
    /**
     * 默认不查询（如大字段、敏感字段）
     */
    @TableField(select = false)
    private String password;
    
    @TableField(select = false)
    private byte[] avatar;  // 大字段
}

// 查询时需要显式指定
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.select(User::getId, User::getName, User::getPassword);
User user = userMapper.selectOne(wrapper);
```

#### 5. 类型处理器

```java
/**
 * 自定义类型处理器
 */
public class ListTypeHandler extends BaseTypeHandler<List<String>> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, 
                                     List<String> parameter, JdbcType jdbcType) 
            throws SQLException {
        // List 转 JSON 存储
        ps.setString(i, JSON.toJSONString(parameter));
    }
    
    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) 
            throws SQLException {
        String json = rs.getString(columnName);
        return JSON.parseArray(json, String.class);
    }
    // ... 其他方法
}

// 使用
public class User {
    @TableField(typeHandler = ListTypeHandler.class)
    private List<String> tags;  // 数据库存储为 JSON 字符串
}
```

---

## @TableLogic：逻辑删除

### 基本用法

```java
public class User {
    @TableId
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

### 全局配置

```yaml
# application.yml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted  # 全局逻辑删除字段
      logic-delete-value: 1         # 删除值
      logic-not-delete-value: 0     # 未删除值
```

### 自定义删除值

```java
@TableLogic(value = "0", delval = "1")
private Integer deleted;

// 或使用日期类型
@TableLogic
private LocalDateTime deleteTime;  // null：未删除，有值：删除时间
```

### 逻辑删除的影响

```java
// 删除操作
userMapper.deleteById(1L);
// SQL: UPDATE user SET deleted=1 WHERE id=1 AND deleted=0

// 查询操作
userMapper.selectById(1L);
// SQL: SELECT * FROM user WHERE id=1 AND deleted=0

userMapper.selectList(null);
// SQL: SELECT * FROM user WHERE deleted=0

// 更新操作
userMapper.updateById(user);
// SQL: UPDATE user SET name=? WHERE id=? AND deleted=0
```

---

## @Version：乐观锁

### 基本用法

```java
public class User {
    @TableId
    private Long id;
    
    private String name;
    
    /**
     * 乐观锁版本号
     */
    @Version
    private Integer version;
}
```

### 配置乐观锁插件

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 添加乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        
        return interceptor;
    }
}
```

### 使用示例

```java
// 更新操作
User user = userMapper.selectById(1L);
// version = 1

user.setName("张三");
userMapper.updateById(user);
// SQL: UPDATE user SET name='张三', version=2 
//      WHERE id=1 AND version=1

// version 自动 +1，user.version 变为 2
```

---

## 其他注解

### @OrderBy：排序

```java
public class User {
    @TableId
    private Long id;
    
    @OrderBy(asc = false)  // 降序
    private LocalDateTime createTime;
}

// 查询时自动排序
List<User> users = userMapper.selectList(null);
// SQL: SELECT * FROM user ORDER BY create_time DESC
```

### @EnumValue：枚举映射

```java
/**
 * 性别枚举
 */
public enum Gender {
    MALE(1, "男"),
    FEMALE(2, "女");
    
    @EnumValue  // 标记数据库存储的值
    private final int code;
    private final String desc;
    
    // constructor, getter...
}

public class User {
    private Gender gender;  // 数据库存储 1 或 2
}
```

---

## 注解使用最佳实践

### 1. 合理使用全局配置

```yaml
# application.yml - 全局配置
mybatis-plus:
  global-config:
    db-config:
      table-prefix: t_           # 表前缀
      id-type: assign_id          # 主键策略
      logic-delete-field: deleted # 逻辑删除字段
      logic-delete-value: 1
      logic-not-delete-value: 0
  
  configuration:
    map-underscore-to-camel-case: true  # 驼峰转换
```

```java
// 实体类可以省略很多注解
public class User {
    private Long id;              // 自动使用 assign_id
    private String name;          // 自动驼峰转换 user_name
    private Integer deleted;      // 自动识别为逻辑删除字段
}
```

### 2. 最小化注解使用

```java
// ❌ 过度使用注解
@TableName("user")
public class User {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("name")
    private String name;
    
    @TableField("age")
    private Integer age;
}

// ✅ 简洁清晰
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String name;  // 字段名一致，省略注解
    private Integer age;
}
```

### 3. 统一审计字段

```java
/**
 * 基础实体类（审计字段）
 */
@Data
public abstract class BaseEntity {
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;
    
    @TableField(fill = FieldFill.UPDATE)
    private Long updateBy;
    
    @TableLogic
    private Integer deleted;
}

/**
 * 业务实体类
 */
public class User extends BaseEntity {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private String name;
    private Integer age;
    // 继承审计字段，无需重复定义
}
```

---

## 关键点总结

1. **@TableName**：映射表名，支持全局前缀和动态表名
2. **@TableId**：配置主键策略，常用 AUTO、ASSIGN_ID、ASSIGN_UUID
3. **@TableField**：字段映射，控制是否查询、自动填充、字段策略等
4. **@TableLogic**：逻辑删除，删除变更新，查询自动过滤
5. **@Version**：乐观锁版本号，需配合插件使用
6. **全局配置优先**：减少注解使用，统一项目规范
7. **继承审计字段**：BaseEntity 统一管理公共字段

---

## 参考资料

- [注解详解](https://baomidou.com/pages/223848/)
- [全局配置](https://baomidou.com/pages/56bac0/)

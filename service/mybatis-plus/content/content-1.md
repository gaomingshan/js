# 1.1 MyBatis Plus 是什么

## 概述

MyBatis Plus（简称 MP）是一个 MyBatis 的增强工具，在 MyBatis 的基础上只做增强不做改变，为简化开发、提高效率而生。它提供了强大的 CRUD 操作、代码生成器、分页插件等功能，让开发者摆脱重复的 SQL 编写工作。

**核心设计理念：**
- **只做增强不做改变**：引入 MP 不会影响现有 MyBatis 项目
- **润滑剂而非替代品**：与 MyBatis 原生功能完美共存
- **约定优于配置**：零配置即可使用基础功能
- **高效开发**：内置通用 Mapper、强大的条件构造器

---

## MyBatis Plus 的诞生背景

### MyBatis 的痛点

尽管 MyBatis 是优秀的持久层框架，但在实际开发中存在一些重复性工作：

```java
// 传统 MyBatis 需要为每个实体编写大量重复代码
public interface UserMapper {
    int insert(User user);
    int deleteById(Long id);
    int updateById(User user);
    User selectById(Long id);
    List<User> selectList();
    // ... 更多 CRUD 方法
}
```

```xml
<!-- 对应的 XML 映射文件 -->
<mapper namespace="com.example.mapper.UserMapper">
    <insert id="insert">
        INSERT INTO user(id, name, age, email) 
        VALUES(#{id}, #{name}, #{age}, #{email})
    </insert>
    <delete id="deleteById">
        DELETE FROM user WHERE id = #{id}
    </delete>
    <!-- ... 更多 SQL 语句 -->
</mapper>
```

**问题总结：**
1. **重复劳动**：每个实体都要写相同的 CRUD 方法
2. **维护成本高**：字段变更需要同步修改 Mapper 和 XML
3. **代码冗余**：大量样板代码
4. **分页麻烦**：需要手写物理分页 SQL

### MyBatis Plus 的解决方案

```java
// 使用 MyBatis Plus，只需一行代码
public interface UserMapper extends BaseMapper<User> {
    // 无需任何代码，已自动拥有 CRUD 方法
}

// 使用示例
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;
    
    public void demo() {
        // 插入
        userMapper.insert(user);
        // 删除
        userMapper.deleteById(1L);
        // 更新
        userMapper.updateById(user);
        // 查询
        User user = userMapper.selectById(1L);
        List<User> list = userMapper.selectList(null);
    }
}
```

---

## 与原生 MyBatis 的关系与差异

### 架构关系

```
┌─────────────────────────────────────┐
│       Application Layer             │
├─────────────────────────────────────┤
│       MyBatis Plus Layer            │  ← 增强层
│  ┌──────────────────────────────┐   │
│  │ BaseMapper | IService        │   │
│  │ Wrapper | Plugins            │   │
│  │ CodeGenerator                │   │
│  └──────────────────────────────┘   │
├─────────────────────────────────────┤
│       MyBatis Core Layer            │  ← 核心层
│  ┌──────────────────────────────┐   │
│  │ SqlSession | Executor        │   │
│  │ StatementHandler             │   │
│  └──────────────────────────────┘   │
├─────────────────────────────────────┤
│            JDBC                     │
└─────────────────────────────────────┘
```

**关键点：**
- MP 基于 MyBatis 的插件机制和 SqlInjector 实现增强
- 不修改 MyBatis 核心代码，完全兼容原生用法
- 可以混用 MP 和 MyBatis 原生功能

### 核心差异对比

| 功能点 | MyBatis | MyBatis Plus |
|--------|---------|--------------|
| CRUD 接口 | 需手写 Mapper 和 XML | 继承 BaseMapper 即可 |
| 条件查询 | 手写 SQL 或动态 SQL | Wrapper 链式调用 |
| 分页 | 需要插件或手写 | 内置分页插件 |
| 代码生成 | 使用 MyBatis Generator | 内置 AutoGenerator |
| 主键策略 | 数据库自增或手动设置 | 支持雪花算法等多种策略 |
| 逻辑删除 | 手动处理 | @TableLogic 注解 |
| 乐观锁 | 手动实现 | @Version 注解 + 插件 |
| 多租户 | 手动过滤 | 多租户插件 |

### 共存示例

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    // MP 提供的方法
    // selectById, insert, updateById... 自动拥有
    
    // 自定义复杂查询仍可使用 MyBatis 原生方式
    @Select("SELECT * FROM user WHERE name LIKE CONCAT('%', #{keyword}, '%')")
    List<User> searchByKeyword(@Param("keyword") String keyword);
    
    // 或使用 XML 映射
    List<User> complexQuery(@Param("params") Map<String, Object> params);
}
```

```xml
<!-- UserMapper.xml -->
<mapper namespace="com.example.mapper.UserMapper">
    <select id="complexQuery" resultType="User">
        SELECT u.*, d.dept_name 
        FROM user u 
        LEFT JOIN dept d ON u.dept_id = d.id
        WHERE u.status = #{params.status}
        <if test="params.startDate != null">
            AND u.create_time &gt;= #{params.startDate}
        </if>
    </select>
</mapper>
```

---

## 核心特性一览

### 1. 内置 CRUD 操作

**BaseMapper 接口提供：**
- `insert`：插入数据
- `deleteById/deleteBatchIds/deleteByMap`：删除操作
- `updateById`：更新操作
- `selectById/selectBatchIds/selectList`：查询操作
- `selectCount/selectMaps/selectPage`：统计与分页

### 2. 强大的条件构造器

```java
// Lambda 表达式，类型安全
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getAge, 18)
       .like(User::getName, "张")
       .between(User::getCreateTime, startDate, endDate)
       .orderByDesc(User::getId);

List<User> users = userMapper.selectList(wrapper);
```

### 3. 代码生成器

一键生成 Entity、Mapper、Service、Controller 代码，支持自定义模板。

### 4. 分页插件

```java
Page<User> page = new Page<>(1, 10);
userMapper.selectPage(page, null);
System.out.println("总记录数：" + page.getTotal());
System.out.println("数据：" + page.getRecords());
```

### 5. 多租户插件

自动在 SQL 中添加租户 ID 条件，实现数据隔离。

### 6. 性能分析与 SQL 拦截

开发环境可启用性能分析插件，监控慢 SQL。

### 7. 自动填充

自动填充创建时间、更新时间、创建人等字段。

---

## 适用场景与不适用场景

### ✅ 适用场景

1. **单表 CRUD 为主的业务系统**
   - 后台管理系统
   - 企业内部系统
   - 中小型业务系统

2. **快速开发需求**
   - MVP 原型
   - 快速迭代项目
   - 创业公司项目

3. **规范统一的团队**
   - 需要统一代码风格
   - 减少重复劳动
   - 降低新人上手成本

4. **微服务架构**
   - 服务数量多，每个服务表结构简单
   - 需要快速搭建数据访问层

### ❌ 不适用或需谨慎的场景

1. **复杂关联查询为主**
   ```java
   // 多表复杂 JOIN、子查询、存储过程等
   // 建议使用 MyBatis 原生 XML 方式
   SELECT u.*, d.dept_name, r.role_name, COUNT(o.id) AS order_count
   FROM user u
   LEFT JOIN dept d ON u.dept_id = d.id
   LEFT JOIN user_role ur ON u.id = ur.user_id
   LEFT JOIN role r ON ur.role_id = r.id
   LEFT JOIN `order` o ON u.id = o.user_id
   WHERE u.status = 1
   GROUP BY u.id
   HAVING order_count > 10
   ```

2. **对 SQL 控制要求极高的场景**
   - 金融核心系统（每条 SQL 需要 DBA 审核）
   - 性能敏感的高并发系统（需要精细优化每条 SQL）

3. **使用了大量数据库特性**
   - 存储过程、函数
   - 复杂触发器
   - 数据库特有语法

4. **团队不接受"魔法"**
   - 有些团队更倾向显式编写所有代码
   - 担心隐式行为带来的不可控性

### 混合使用建议

```java
@Mapper
public interface OrderMapper extends BaseMapper<Order> {
    
    // 简单查询用 MP
    // selectById, selectList...
    
    // 复杂报表查询用 MyBatis XML
    @Select("...")
    List<OrderStatistics> getStatistics(@Param("params") QueryParams params);
    
    // 也可以用 Wrapper 构建中等复杂度查询
    default List<Order> queryOrders(OrderQueryDTO dto) {
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(dto.getStatus() != null, Order::getStatus, dto.getStatus())
               .between(dto.getStartDate() != null, Order::getCreateTime, 
                       dto.getStartDate(), dto.getEndDate());
        return selectList(wrapper);
    }
}
```

---

## 深入一点：MP 如何做到"只做增强不做改变"

### 技术实现原理

1. **SqlInjector（SQL 注入器）**
   ```java
   // MP 启动时，通过 SqlInjector 将通用方法注入到 MyBatis
   public class DefaultSqlInjector extends AbstractSqlInjector {
       @Override
       public List<AbstractMethod> getMethodList(Class<?> mapperClass) {
           return Stream.of(
               new Insert(),
               new Delete(),
               new Update(),
               new SelectById(),
               // ... 更多方法
           ).collect(toList());
       }
   }
   ```

2. **MybatisMapperAnnotationBuilder 扩展**
   - MP 扩展了 MyBatis 的 MapperAnnotationBuilder
   - 在扫描 Mapper 接口时，自动注入通用方法的 SQL

3. **不修改原有行为**
   - 原生 MyBatis 的 `@Select`、`@Insert` 等注解照常工作
   - XML 映射文件正常解析
   - 拦截器链保持兼容

### 配置共存

```yaml
# application.yml
mybatis-plus:
  # MP 配置
  configuration:
    map-underscore-to-camel-case: true
  global-config:
    db-config:
      logic-delete-value: 1
      logic-not-delete-value: 0
  
# MyBatis 原生配置仍然有效
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.entity
```

---

## 关键点总结

1. **本质定位**：MyBatis Plus 是 MyBatis 的增强工具，不是替代品
2. **核心价值**：减少样板代码，提高开发效率，统一代码规范
3. **技术实现**：基于 MyBatis 插件机制和 SQL 注入器，不修改核心源码
4. **适用场景**：单表 CRUD 为主的业务系统，复杂查询仍建议用原生 MyBatis
5. **学习成本**：了解 MyBatis 的基础上，学习 MP 额外增加的功能即可
6. **生产实践**：可以混用 MP 和 MyBatis，根据具体场景选择最合适的方式

---

## 参考资料

- [MyBatis Plus 官方文档](https://baomidou.com/)
- [MyBatis 官方文档](https://mybatis.org/mybatis-3/zh/index.html)
- [MyBatis Plus GitHub](https://github.com/baomidou/mybatis-plus)

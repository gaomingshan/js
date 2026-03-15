# 2.1 BaseMapper 接口

## 概述

`BaseMapper<T>` 是 MyBatis Plus 提供的基础 Mapper 接口，封装了常用的 CRUD 方法。任何继承了 `BaseMapper` 的接口都会自动拥有这些方法，无需编写任何 SQL。

**核心价值：**
- 消除重复的 CRUD 代码
- 统一方法命名规范
- 类型安全（泛型约束）
- 支持混合自定义方法

---

## BaseMapper 提供的内置方法

### 插入操作

```java
/**
 * 插入一条记录
 * @param entity 实体对象
 * @return 影响行数
 */
int insert(T entity);
```

**使用示例：**
```java
@Autowired
private UserMapper userMapper;

public void testInsert() {
    User user = new User();
    user.setName("张三");
    user.setAge(25);
    user.setEmail("zhangsan@example.com");
    
    int rows = userMapper.insert(user);
    System.out.println("插入成功，影响行数：" + rows);
    System.out.println("生成的主键ID：" + user.getId());
}
```

**关键点：**
- 插入成功后，主键 ID 会自动回填到实体对象
- 字段为 `null` 的不会插入（取决于字段策略配置）
- 自动填充字段会被填充（如 createTime）

### 删除操作

```java
/**
 * 根据 ID 删除
 */
int deleteById(Serializable id);

/**
 * 根据 ID 批量删除
 */
int deleteBatchIds(@Param(Constants.COLLECTION) Collection<? extends Serializable> idList);

/**
 * 根据 Map 条件删除
 */
int deleteByMap(@Param(Constants.COLUMN_MAP) Map<String, Object> columnMap);

/**
 * 根据 Wrapper 条件删除
 */
int delete(@Param(Constants.WRAPPER) Wrapper<T> wrapper);
```

**使用示例：**
```java
// 1. 根据 ID 删除
userMapper.deleteById(1L);

// 2. 批量删除
List<Long> ids = Arrays.asList(1L, 2L, 3L);
userMapper.deleteBatchIds(ids);

// 3. 根据 Map 条件删除
Map<String, Object> map = new HashMap<>();
map.put("name", "张三");
map.put("age", 18);
userMapper.deleteByMap(map);  // DELETE FROM user WHERE name = '张三' AND age = 18

// 4. 根据 Wrapper 删除
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getAge, 18);
userMapper.delete(wrapper);  // DELETE FROM user WHERE age = 18
```

**注意事项：**
- 如果配置了逻辑删除，执行的是 UPDATE 而非 DELETE
- 批量删除时，如果 ID 列表为空会抛出异常
- Map 删除时，key 是数据库字段名（下划线），不是实体字段名（驼峰）

### 更新操作

```java
/**
 * 根据 ID 更新
 */
int updateById(@Param(Constants.ENTITY) T entity);

/**
 * 根据 Wrapper 条件更新
 */
int update(@Param(Constants.ENTITY) T entity, @Param(Constants.WRAPPER) Wrapper<T> updateWrapper);
```

**使用示例：**
```java
// 1. 根据 ID 更新
User user = new User();
user.setId(1L);
user.setName("李四");
user.setAge(26);
userMapper.updateById(user);
// UPDATE user SET name='李四', age=26, update_time=NOW() WHERE id=1

// 2. 选择性更新（只更新非 null 字段）
User user2 = new User();
user2.setId(1L);
user2.setName("王五");  // 只更新 name
userMapper.updateById(user2);
// UPDATE user SET name='王五', update_time=NOW() WHERE id=1

// 3. 根据条件更新
User user3 = new User();
user3.setAge(30);

LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
wrapper.eq(User::getName, "张三");
userMapper.update(user3, wrapper);
// UPDATE user SET age=30, update_time=NOW() WHERE name='张三'

// 4. 使用 Wrapper 设置更新内容
LambdaUpdateWrapper<User> wrapper2 = new LambdaUpdateWrapper<>();
wrapper2.set(User::getAge, 30)
        .eq(User::getName, "张三");
userMapper.update(null, wrapper2);
// UPDATE user SET age=30 WHERE name='张三'
```

**关键点：**
- `updateById` 根据实体的 ID 更新，ID 不能为 null
- 字段为 `null` 的不会更新（取决于字段策略）
- 自动填充字段会自动更新（如 updateTime）
- 使用 Wrapper 更新时，entity 可以为 null

### 查询操作

```java
/**
 * 根据 ID 查询
 */
T selectById(Serializable id);

/**
 * 根据 ID 批量查询
 */
List<T> selectBatchIds(@Param(Constants.COLLECTION) Collection<? extends Serializable> idList);

/**
 * 根据 Map 条件查询
 */
List<T> selectByMap(@Param(Constants.COLUMN_MAP) Map<String, Object> columnMap);

/**
 * 根据 Wrapper 查询一条记录
 */
T selectOne(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

/**
 * 根据 Wrapper 查询列表
 */
List<T> selectList(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

/**
 * 根据 Wrapper 查询列表（返回 Map）
 */
List<Map<String, Object>> selectMaps(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

/**
 * 根据 Wrapper 查询列表（只返回第一个字段的值）
 */
List<Object> selectObjs(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

/**
 * 根据 Wrapper 查询总记录数
 */
Long selectCount(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

/**
 * 分页查询
 */
<P extends IPage<T>> P selectPage(P page, @Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

/**
 * 分页查询（返回 Map）
 */
<P extends IPage<Map<String, Object>>> P selectMapsPage(P page, @Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
```

**使用示例：**
```java
// 1. 根据 ID 查询
User user = userMapper.selectById(1L);

// 2. 批量查询
List<Long> ids = Arrays.asList(1L, 2L, 3L);
List<User> users = userMapper.selectBatchIds(ids);

// 3. 根据 Map 条件查询
Map<String, Object> map = new HashMap<>();
map.put("name", "张三");
List<User> users2 = userMapper.selectByMap(map);

// 4. 查询一条记录
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "张三");
User user2 = userMapper.selectOne(wrapper);  // 结果必须唯一，否则抛异常

// 5. 查询列表
LambdaQueryWrapper<User> wrapper2 = new LambdaQueryWrapper<>();
wrapper2.ge(User::getAge, 18);
List<User> users3 = userMapper.selectList(wrapper2);

// 6. 查询总数
LambdaQueryWrapper<User> wrapper3 = new LambdaQueryWrapper<>();
wrapper3.ge(User::getAge, 18);
Long count = userMapper.selectCount(wrapper3);

// 7. 查询 Map（适合多表关联查询）
LambdaQueryWrapper<User> wrapper4 = new LambdaQueryWrapper<>();
wrapper4.select(User::getId, User::getName);
List<Map<String, Object>> maps = userMapper.selectMaps(wrapper4);

// 8. 查询单列值
LambdaQueryWrapper<User> wrapper5 = new LambdaQueryWrapper<>();
wrapper5.select(User::getId);
List<Object> ids2 = userMapper.selectObjs(wrapper5);

// 9. 分页查询
Page<User> page = new Page<>(1, 10);
LambdaQueryWrapper<User> wrapper6 = new LambdaQueryWrapper<>();
wrapper6.ge(User::getAge, 18);
Page<User> result = userMapper.selectPage(page, wrapper6);
System.out.println("总记录数：" + result.getTotal());
System.out.println("当前页数据：" + result.getRecords());
```

---

## 方法命名规范与语义

MyBatis Plus 的方法命名遵循清晰的语义规范：

| 方法前缀 | 含义 | 返回值 | 示例 |
|----------|------|--------|------|
| insert | 插入 | int（影响行数） | insert(entity) |
| delete | 删除 | int（影响行数） | deleteById(id) |
| update | 更新 | int（影响行数） | updateById(entity) |
| select | 查询 | T / List\<T\> / Long | selectById(id) |

| 方法后缀 | 含义 | 示例 |
|----------|------|------|
| ById | 根据主键 ID | selectById(1L) |
| BatchIds | 根据 ID 集合（批量） | deleteBatchIds(ids) |
| ByMap | 根据 Map 条件 | selectByMap(map) |
| One | 查询单条记录 | selectOne(wrapper) |
| List | 查询列表 | selectList(wrapper) |
| Count | 查询总数 | selectCount(wrapper) |
| Page | 分页查询 | selectPage(page, wrapper) |
| Maps | 返回 Map 列表 | selectMaps(wrapper) |
| Objs | 返回 Object 列表（单列） | selectObjs(wrapper) |

---

## 泛型设计与类型安全

### 泛型约束

```java
public interface BaseMapper<T> extends Mapper<T> {
    // T 是实体类类型
}

// 使用时指定具体类型
public interface UserMapper extends BaseMapper<User> {
    // 自动推断所有方法的泛型参数
}
```

**优势：**
1. **编译期类型检查**：避免类型错误
2. **IDE 智能提示**：自动补全方法和参数
3. **重构友好**：实体类改名时自动更新

### 类型安全示例

```java
// ✅ 类型安全
User user = userMapper.selectById(1L);
List<User> users = userMapper.selectList(null);

// ❌ 编译错误：类型不匹配
Order order = userMapper.selectById(1L);  // 编译失败
```

---

## 与 MyBatis Mapper 的对比

### 传统 MyBatis

```java
// 接口
public interface UserMapper {
    int insert(User user);
    int deleteById(Long id);
    int updateById(User user);
    User selectById(Long id);
    List<User> selectList();
}
```

```xml
<!-- XML 映射文件 -->
<mapper namespace="com.example.mapper.UserMapper">
    <insert id="insert" parameterType="User">
        INSERT INTO user(name, age, email) 
        VALUES(#{name}, #{age}, #{email})
    </insert>
    
    <delete id="deleteById" parameterType="long">
        DELETE FROM user WHERE id = #{id}
    </delete>
    
    <update id="updateById" parameterType="User">
        UPDATE user 
        SET name = #{name}, age = #{age}, email = #{email}
        WHERE id = #{id}
    </update>
    
    <select id="selectById" parameterType="long" resultType="User">
        SELECT * FROM user WHERE id = #{id}
    </select>
    
    <select id="selectList" resultType="User">
        SELECT * FROM user
    </select>
</mapper>
```

**问题：**
- 每个实体都要写相同的代码
- XML 文件冗长
- 维护成本高

### MyBatis Plus

```java
// 接口
public interface UserMapper extends BaseMapper<User> {
    // 无需任何代码
}
```

**优势：**
- 零代码实现 CRUD
- 无需 XML 文件
- 统一规范

### 混合使用

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    // MP 提供的方法
    // selectById, insert, updateById... 自动拥有
    
    // 自定义复杂查询
    @Select("SELECT u.*, d.dept_name FROM user u " +
            "LEFT JOIN dept d ON u.dept_id = d.id " +
            "WHERE u.id = #{id}")
    UserDTO selectUserWithDept(@Param("id") Long id);
    
    // 或使用 XML
    List<UserStatistics> getStatistics(@Param("params") QueryParams params);
}
```

---

## 深入一点：BaseMapper 的实现原理

### SQL 注入机制

MyBatis Plus 通过 `SqlInjector` 在启动时自动注入通用方法的 SQL：

```java
public class DefaultSqlInjector extends AbstractSqlInjector {
    
    @Override
    public List<AbstractMethod> getMethodList(Class<?> mapperClass) {
        return Stream.of(
            new Insert(),           // INSERT INTO ...
            new DeleteById(),       // DELETE FROM ... WHERE id = ?
            new DeleteBatchByIds(), // DELETE FROM ... WHERE id IN (...)
            new UpdateById(),       // UPDATE ... SET ... WHERE id = ?
            new SelectById(),       // SELECT * FROM ... WHERE id = ?
            new SelectBatchByIds(), // SELECT * FROM ... WHERE id IN (...)
            new SelectList(),       // SELECT * FROM ... WHERE ...
            new SelectCount(),      // SELECT COUNT(*) FROM ... WHERE ...
            new SelectPage()        // SELECT * FROM ... LIMIT ?, ?
            // ... 更多方法
        ).collect(toList());
    }
}
```

### 方法注入流程

```
1. Spring 启动，扫描 @MapperScan 指定的包
   ↓
2. 发现继承 BaseMapper 的接口
   ↓
3. MybatisPlusMapperAnnotationBuilder 处理
   ↓
4. SqlInjector 注入通用方法
   ↓
5. 为每个方法生成 MappedStatement
   ↓
6. 注册到 MyBatis Configuration
   ↓
7. 运行时通过 MapperProxy 调用
```

### 源码示例

```java
// Insert 方法的 SQL 注入实现
public class Insert extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        // 构建 INSERT SQL
        String sql = String.format(
            "<script>INSERT INTO %s %s VALUES %s</script>",
            tableInfo.getTableName(),
            prepareFieldSql(tableInfo),
            prepareValuesSql(tableInfo)
        );
        
        // 注册 MappedStatement
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, sql, modelClass
        );
        
        return this.addInsertMappedStatement(
            mapperClass, modelClass, "insert", 
            sqlSource, new NoKeyGenerator(), null, null
        );
    }
}
```

---

## 关键点总结

1. **零代码 CRUD**：继承 BaseMapper 即可获得所有通用方法
2. **方法分类**：insert（插入）、delete（删除）、update（更新）、select（查询）
3. **命名规范**：方法名语义清晰，易于理解和记忆
4. **类型安全**：泛型约束，编译期类型检查
5. **灵活扩展**：可混合自定义方法和 MyBatis 原生用法
6. **实现原理**：基于 SqlInjector 在启动时注入 SQL

---

## 最佳实践

### 1. 合理使用批量方法

```java
// ✅ 推荐：使用批量方法
List<Long> ids = Arrays.asList(1L, 2L, 3L, 4L, 5L);
userMapper.deleteBatchIds(ids);
// DELETE FROM user WHERE id IN (1, 2, 3, 4, 5)

// ❌ 不推荐：循环单条删除
for (Long id : ids) {
    userMapper.deleteById(id);  // 执行 5 次 SQL
}
```

### 2. selectOne 必须保证结果唯一

```java
// ❌ 错误：可能返回多条记录
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getAge, 18);  // 可能有多个 18 岁的用户
User user = userMapper.selectOne(wrapper);  // 抛出异常

// ✅ 正确：使用 selectList
List<User> users = userMapper.selectList(wrapper);
```

### 3. 选择合适的查询方法

```java
// 只需要 ID 列表
List<Object> ids = userMapper.selectObjs(
    new LambdaQueryWrapper<User>()
        .select(User::getId)
);

// 需要完整对象
List<User> users = userMapper.selectList(null);

// 多表关联查询（字段不匹配实体）
List<Map<String, Object>> maps = userMapper.selectMaps(wrapper);
```

### 4. 更新时注意字段策略

```java
// 配置了 update-strategy: not_null
User user = new User();
user.setId(1L);
user.setName("张三");
user.setAge(null);  // null 不会更新

userMapper.updateById(user);
// UPDATE user SET name='张三' WHERE id=1
// age 不会被更新为 NULL

// 如果需要更新为 NULL，使用 Wrapper
LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
wrapper.set(User::getAge, null)
       .eq(User::getId, 1L);
userMapper.update(null, wrapper);
```

---

## 参考资料

- [BaseMapper 接口文档](https://baomidou.com/pages/49cc81/#mapper-crud-%E6%8E%A5%E5%8F%A3)
- [CRUD 接口详解](https://baomidou.com/pages/49cc81/)

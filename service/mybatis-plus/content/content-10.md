# 5.1 分页插件配置与使用

## 概述

分页是数据查询中最常见的需求之一。MyBatis Plus 提供了强大的分页插件 `PaginationInnerInterceptor`，支持多种数据库的物理分页，使用简单且性能优异。

**核心功能：**
- 物理分页（真正的 LIMIT/OFFSET）
- 自动 count 查询
- 多数据库支持
- 自定义分页查询
- 分页参数合法性校验

---

## PaginationInnerInterceptor 原理

### 工作流程

```
1. 拦截 selectPage 等分页方法
   ↓
2. 解析原始 SQL
   ↓
3. 构建 count SQL（SELECT COUNT(*) FROM ...）
   ↓
4. 执行 count 查询，获取总记录数
   ↓
5. 判断是否需要查询数据（总数为0则跳过）
   ↓
6. 改写原始 SQL，添加 LIMIT/OFFSET
   ↓
7. 执行分页查询
   ↓
8. 封装结果到 Page 对象
```

### 底层实现

```java
public class PaginationInnerInterceptor implements InnerInterceptor {
    
    @Override
    public void beforeQuery(Executor executor, MappedStatement ms, 
                           Object parameter, RowBounds rowBounds, 
                           ResultHandler resultHandler, BoundSql boundSql) {
        // 1. 判断是否是分页查询
        IPage<?> page = ParameterUtils.findPage(parameter).orElse(null);
        if (page == null) {
            return;
        }
        
        // 2. 执行 count 查询
        if (page.isSearchCount()) {
            Long count = executeCount(executor, ms, boundSql, parameter);
            page.setTotal(count);
            
            // 总数为0，无需查询数据
            if (count == 0) {
                return;
            }
        }
        
        // 3. 改写 SQL，添加分页
        String pageSql = buildPaginationSql(boundSql.getSql(), page);
        // ...
    }
}
```

---

## 配置分页插件

### 基本配置

```java
@Configuration
public class MybatisPlusConfig {
    
    /**
     * 分页插件
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 添加分页插件
        PaginationInnerInterceptor paginationInterceptor = 
            new PaginationInnerInterceptor(DbType.MYSQL);
        
        interceptor.addInnerInterceptor(paginationInterceptor);
        return interceptor;
    }
}
```

### 高级配置

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    
    PaginationInnerInterceptor paginationInterceptor = 
        new PaginationInnerInterceptor(DbType.MYSQL);
    
    // 设置最大单页限制数量（防止恶意查询）
    paginationInterceptor.setMaxLimit(500L);
    
    // 溢出总页数后是否进行处理
    // false: 不处理（返回空列表）
    // true: 跳转到第一页
    paginationInterceptor.setOverflow(false);
    
    // 是否生成 count SQL（默认 true）
    // paginationInterceptor.setOptimizeJoin(true);
    
    interceptor.addInnerInterceptor(paginationInterceptor);
    return interceptor;
}
```

### 多数据库配置

```java
/**
 * 支持的数据库类型
 */
public enum DbType {
    MYSQL,
    MARIADB,
    ORACLE,
    DB2,
    H2,
    HSQL,
    SQLITE,
    POSTGRE_SQL,
    SQL_SERVER2005,
    SQL_SERVER,
    DM,          // 达梦
    XU_GU,       // 虚谷
    KINGBASE_ES, // 人大金仓
    PHOENIX,
    GAUSS,       // 高斯
    CLICK_HOUSE,
    GBASE,
    OSCAR,
    SYBASE,
    OCEAN_BASE,
    FIREBIRD,
    CUBRID,
    GOLDILOCKS,
    CSIIDB
}

// 使用
new PaginationInnerInterceptor(DbType.POSTGRE_SQL);
new PaginationInnerInterceptor(DbType.ORACLE);
```

---

## Page 对象与分页参数

### Page 对象结构

```java
public class Page<T> implements IPage<T> {
    // 当前页码（从1开始）
    private long current = 1;
    
    // 每页显示条数
    private long size = 10;
    
    // 总记录数
    private long total = 0;
    
    // 查询结果
    private List<T> records = Collections.emptyList();
    
    // 是否执行 count 查询
    private boolean searchCount = true;
    
    // 排序字段
    private List<OrderItem> orders = new ArrayList<>();
    
    // 是否命中 count 缓存
    private boolean hitCount = false;
    
    // 优化 count SQL
    private boolean optimizeCountSql = true;
    
    // 最大限制
    private Long maxLimit;
}
```

### 基本使用

```java
/**
 * 分页查询用户
 */
public Page<User> pageQuery(Integer current, Integer size) {
    // 创建分页对象
    Page<User> page = new Page<>(current, size);
    
    // 执行分页查询
    Page<User> result = userMapper.selectPage(page, null);
    
    // 获取结果
    System.out.println("总记录数：" + result.getTotal());
    System.out.println("总页数：" + result.getPages());
    System.out.println("当前页：" + result.getCurrent());
    System.out.println("每页条数：" + result.getSize());
    System.out.println("数据列表：" + result.getRecords());
    
    return result;
}
```

### 带条件的分页查询

```java
/**
 * 条件分页查询
 */
public Page<User> pageQuery(UserQueryDTO dto) {
    Page<User> page = new Page<>(dto.getCurrent(), dto.getSize());
    
    // 构建查询条件
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    wrapper.like(StringUtils.isNotBlank(dto.getName()), 
                 User::getName, dto.getName())
           .eq(dto.getStatus() != null, 
               User::getStatus, dto.getStatus())
           .orderByDesc(User::getCreateTime);
    
    return userMapper.selectPage(page, wrapper);
}
```

### 不查询总数

```java
/**
 * 不查询总数（提升性能）
 */
public Page<User> pageQueryWithoutCount(Integer current, Integer size) {
    Page<User> page = new Page<>(current, size);
    
    // 不执行 count 查询
    page.setSearchCount(false);
    
    return userMapper.selectPage(page, null);
}
```

### 自定义排序

```java
/**
 * 自定义排序
 */
public Page<User> pageQueryWithSort(Integer current, Integer size, 
                                     String sortField, boolean isAsc) {
    Page<User> page = new Page<>(current, size);
    
    // 方式1：使用 OrderItem
    page.addOrder(new OrderItem(sortField, isAsc));
    
    // 方式2：链式调用
    page.addOrder(OrderItem.asc("age"))
        .addOrder(OrderItem.desc("create_time"));
    
    return userMapper.selectPage(page, null);
}
```

---

## 自定义分页查询

### Mapper 接口自定义方法

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 自定义分页查询（XML）
     */
    Page<UserVO> selectUserPage(Page<?> page, @Param("params") UserQueryDTO params);
    
    /**
     * 自定义分页查询（注解）
     */
    @Select("SELECT u.*, d.dept_name FROM user u " +
            "LEFT JOIN dept d ON u.dept_id = d.id " +
            "WHERE u.status = #{status}")
    Page<UserVO> selectUserWithDept(Page<?> page, @Param("status") Integer status);
}
```

### XML 映射文件

```xml
<!-- UserMapper.xml -->
<mapper namespace="com.example.mapper.UserMapper">
    
    <!-- 自定义分页查询 -->
    <select id="selectUserPage" resultType="com.example.vo.UserVO">
        SELECT 
            u.id,
            u.name,
            u.age,
            u.email,
            d.dept_name,
            r.role_name
        FROM user u
        LEFT JOIN dept d ON u.dept_id = d.id
        LEFT JOIN user_role ur ON u.id = ur.user_id
        LEFT JOIN role r ON ur.role_id = r.id
        <where>
            <if test="params.name != null and params.name != ''">
                AND u.name LIKE CONCAT('%', #{params.name}, '%')
            </if>
            <if test="params.deptId != null">
                AND u.dept_id = #{params.deptId}
            </if>
            <if test="params.status != null">
                AND u.status = #{params.status}
            </if>
        </where>
        ORDER BY u.create_time DESC
    </select>
</mapper>
```

**关键点：**
- 不需要手写 `LIMIT` 和 `OFFSET`，插件会自动添加
- 不需要手写 `COUNT(*)`，插件会自动优化并执行
- 第一个参数必须是 `Page<?>` 或 `IPage<?>`

### Service 层调用

```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    @Override
    public Page<UserVO> pageQuery(UserQueryDTO dto) {
        Page<UserVO> page = new Page<>(dto.getCurrent(), dto.getSize());
        return baseMapper.selectUserPage(page, dto);
    }
}
```

---

## 前端分页组件对接

### 统一分页响应

```java
/**
 * 分页响应 DTO
 */
@Data
public class PageResult<T> {
    // 当前页码
    private Long current;
    
    // 每页条数
    private Long size;
    
    // 总记录数
    private Long total;
    
    // 总页数
    private Long pages;
    
    // 数据列表
    private List<T> records;
    
    /**
     * 从 Page 对象转换
     */
    public static <T> PageResult<T> of(Page<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setCurrent(page.getCurrent());
        result.setSize(page.getSize());
        result.setTotal(page.getTotal());
        result.setPages(page.getPages());
        result.setRecords(page.getRecords());
        return result;
    }
}
```

### Controller 接口

```java
@RestController
@RequestMapping("/user")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 分页查询
     */
    @GetMapping("/page")
    public Result<PageResult<UserVO>> page(UserQueryDTO dto) {
        Page<UserVO> page = userService.pageQuery(dto);
        return Result.success(PageResult.of(page));
    }
}
```

### 前端调用示例

```javascript
// Vue 3 + Element Plus
<template>
  <el-table :data="tableData" v-loading="loading">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="age" label="年龄" />
    <el-table-column prop="email" label="邮箱" />
  </el-table>
  
  <el-pagination
    v-model:current-page="queryParams.current"
    v-model:page-size="queryParams.size"
    :total="total"
    @current-change="handlePageChange"
    @size-change="handleSizeChange"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserPage } from '@/api/user';

const tableData = ref([]);
const total = ref(0);
const loading = ref(false);
const queryParams = ref({
  current: 1,
  size: 10,
  name: '',
  status: null
});

const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await getUserPage(queryParams.value);
    tableData.value = data.records;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  queryParams.value.current = page;
  loadData();
};

const handleSizeChange = (size) => {
  queryParams.value.size = size;
  queryParams.value.current = 1;
  loadData();
};

onMounted(() => {
  loadData();
});
</script>
```

---

## 常见问题与解决

### 1. 分页查询未生效

```java
// ❌ 错误：未配置分页插件
// 或插件配置顺序错误

// ✅ 解决：确保分页插件已配置
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return interceptor;
}
```

### 2. 自定义 SQL 不分页

```java
// ❌ 错误：Mapper 方法第一个参数不是 Page
@Select("SELECT * FROM user")
List<User> selectUserList(UserQueryDTO dto);

// ✅ 正确：第一个参数必须是 Page
@Select("SELECT * FROM user")
Page<User> selectUserList(Page<?> page, @Param("dto") UserQueryDTO dto);
```

### 3. count 查询性能问题

```java
// ❌ 不好：每次都查询 count
Page<User> page = new Page<>(current, size);
userMapper.selectPage(page, wrapper);

// ✅ 更好：首次查询 count，后续不查询
Page<User> page = new Page<>(current, size);
if (current == 1) {
    page.setSearchCount(true);  // 首页查询 count
} else {
    page.setSearchCount(false); // 非首页不查询
}
```

### 4. 分页参数校验

```java
/**
 * 分页参数校验
 */
public Page<User> pageQuery(Integer current, Integer size) {
    // 校验参数
    if (current == null || current < 1) {
        current = 1;
    }
    if (size == null || size < 1) {
        size = 10;
    }
    
    // 限制最大页面大小
    int maxSize = 500;
    if (size > maxSize) {
        size = maxSize;
    }
    
    Page<User> page = new Page<>(current, size);
    return userMapper.selectPage(page, null);
}
```

### 5. 多表关联分页

```java
/**
 * 多表关联分页（注意性能）
 */
@Select("SELECT u.*, d.dept_name, COUNT(o.id) as order_count " +
        "FROM user u " +
        "LEFT JOIN dept d ON u.dept_id = d.id " +
        "LEFT JOIN `order` o ON u.id = o.user_id " +
        "WHERE u.status = #{status} " +
        "GROUP BY u.id")
Page<UserVO> selectUserWithStats(Page<?> page, @Param("status") Integer status);

// 注意：
// 1. 分页插件会自动优化 count SQL
// 2. 但复杂 JOIN 和 GROUP BY 可能影响性能
// 3. 建议对大数据量使用冗余字段或缓存
```

---

## 最佳实践

### 1. 统一分页查询 DTO

```java
/**
 * 分页查询基类
 */
@Data
public class PageQuery {
    // 当前页码（默认第1页）
    @Min(value = 1, message = "页码最小为1")
    private Integer current = 1;
    
    // 每页条数（默认10条）
    @Min(value = 1, message = "每页条数最小为1")
    @Max(value = 500, message = "每页条数最大为500")
    private Integer size = 10;
    
    // 排序字段
    private String sortField;
    
    // 是否升序
    private Boolean isAsc = true;
    
    /**
     * 构建 Page 对象
     */
    public <T> Page<T> buildPage() {
        Page<T> page = new Page<>(current, size);
        
        if (StringUtils.isNotBlank(sortField)) {
            page.addOrder(new OrderItem(sortField, isAsc));
        }
        
        return page;
    }
}

/**
 * 用户查询 DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class UserQueryDTO extends PageQuery {
    private String name;
    private Integer status;
    private Long deptId;
}
```

### 2. Service 层封装

```java
/**
 * 基础 Service 封装
 */
public abstract class BaseServiceImpl<M extends BaseMapper<T>, T> 
        extends ServiceImpl<M, T> {
    
    /**
     * 通用分页查询
     */
    protected Page<T> page(PageQuery pageQuery, 
                           LambdaQueryWrapper<T> wrapper) {
        Page<T> page = pageQuery.buildPage();
        return page(page, wrapper);
    }
}

/**
 * 用户 Service
 */
@Service
public class UserServiceImpl extends BaseServiceImpl<UserMapper, User> 
        implements UserService {
    
    @Override
    public Page<User> pageQuery(UserQueryDTO dto) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.isNotBlank(dto.getName()), 
                     User::getName, dto.getName())
               .eq(dto.getStatus() != null, 
                   User::getStatus, dto.getStatus())
               .eq(dto.getDeptId() != null, 
                   User::getDeptId, dto.getDeptId());
        
        return page(dto, wrapper);
    }
}
```

### 3. 分页结果转换

```java
/**
 * 分页结果转 VO
 */
public Page<UserVO> pageQueryVO(UserQueryDTO dto) {
    Page<User> userPage = pageQuery(dto);
    
    // 转换为 VO
    Page<UserVO> voPage = new Page<>(userPage.getCurrent(), userPage.getSize());
    voPage.setTotal(userPage.getTotal());
    voPage.setRecords(
        userPage.getRecords().stream()
            .map(this::convertToVO)
            .collect(Collectors.toList())
    );
    
    return voPage;
}

// 或使用 Page.convert 方法
public Page<UserVO> pageQueryVO2(UserQueryDTO dto) {
    Page<User> userPage = pageQuery(dto);
    return userPage.convert(this::convertToVO);
}

private UserVO convertToVO(User user) {
    UserVO vo = new UserVO();
    BeanUtils.copyProperties(user, vo);
    return vo;
}
```

---

## 关键点总结

1. **配置插件**：必须配置 `PaginationInnerInterceptor`
2. **Page 对象**：第一个参数必须是 `Page<?>` 或 `IPage<?>`
3. **自动分页**：无需手写 `LIMIT`，插件自动添加
4. **自动 count**：无需手写 `COUNT(*)`，插件自动优化
5. **参数校验**：校验页码和页面大小，防止恶意查询
6. **性能优化**：非首页可不查询 count，提升性能
7. **多数据库**：支持多种数据库，指定 `DbType`

---

## 参考资料

- [分页插件](https://baomidou.com/pages/97710a/)
- [IPage 接口](https://baomidou.com/pages/97710a/#ipage)

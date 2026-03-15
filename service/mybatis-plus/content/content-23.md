# 11.2 自定义通用方法

## 概述

基于 SQL 注入器机制，可以为 BaseMapper 添加自定义的通用方法，满足项目特定需求。本节介绍如何设计和实现自定义通用方法，包括批量操作、条件查询、统计分析等常用场景。

**核心内容：**
- 批量操作方法
- 条件查询方法
- 统计分析方法
- 复杂查询方法

---

## 批量操作方法

### 批量插入或更新（MySQL）

```java
/**
 * 批量插入或更新（ON DUPLICATE KEY UPDATE）
 */
public class InsertOrUpdateBatch extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "insertOrUpdateBatch";
        
        StringBuilder sql = new StringBuilder();
        sql.append("<script>");
        sql.append("INSERT INTO ").append(tableInfo.getTableName());
        sql.append(" (").append(prepareInsertColumns(tableInfo)).append(") ");
        sql.append("VALUES ");
        sql.append("<foreach collection=\"list\" item=\"item\" separator=\",\">");
        sql.append("(").append(prepareInsertValues(tableInfo)).append(")");
        sql.append("</foreach>");
        sql.append(" ON DUPLICATE KEY UPDATE ");
        sql.append(prepareUpdateSet(tableInfo));
        sql.append("</script>");
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql.toString(), 
            modelClass
        );
        
        return addInsertMappedStatement(
            mapperClass, 
            modelClass, 
            methodName, 
            sqlSource, 
            new NoKeyGenerator(), 
            null, 
            null
        );
    }
    
    private String prepareInsertColumns(TableInfo tableInfo) {
        return tableInfo.getAllInsertSqlColumn();
    }
    
    private String prepareInsertValues(TableInfo tableInfo) {
        return tableInfo.getAllInsertSqlPropertyMaybeIf("item.");
    }
    
    private String prepareUpdateSet(TableInfo tableInfo) {
        return tableInfo.getFieldList().stream()
            .filter(field -> !field.isLogicDelete())
            .map(field -> field.getColumn() + "=VALUES(" + field.getColumn() + ")")
            .collect(Collectors.joining(","));
    }
}
```

### 批量更新（不同条件）

```java
/**
 * 批量更新（每条记录不同的更新值）
 */
public class UpdateBatchByIds extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "updateBatchByIds";
        
        StringBuilder sql = new StringBuilder();
        sql.append("<script>");
        sql.append("<foreach collection=\"list\" item=\"item\" separator=\";\">");
        sql.append("UPDATE ").append(tableInfo.getTableName());
        sql.append(" SET ");
        sql.append(prepareUpdateFields(tableInfo));
        sql.append(" WHERE ").append(tableInfo.getKeyColumn());
        sql.append(" = #{item.").append(tableInfo.getKeyProperty()).append("}");
        sql.append("</foreach>");
        sql.append("</script>");
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql.toString(), 
            modelClass
        );
        
        return addUpdateMappedStatement(
            mapperClass, 
            modelClass, 
            methodName, 
            sqlSource
        );
    }
    
    private String prepareUpdateFields(TableInfo tableInfo) {
        return tableInfo.getFieldList().stream()
            .filter(field -> !field.isLogicDelete())
            .map(field -> field.getColumn() + "=#{item." + field.getProperty() + "}")
            .collect(Collectors.joining(","));
    }
}
```

---

## 条件查询方法

### 根据多个 ID 查询（IN 查询）

```java
/**
 * 根据 ID 列表查询（支持排序）
 */
public class SelectBatchByIdsOrdered extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "selectBatchByIdsOrdered";
        
        String sql = "<script>" +
            "SELECT " + sqlSelectColumns(tableInfo, false) + " " +
            "FROM " + tableInfo.getTableName() + " " +
            "WHERE " + tableInfo.getKeyColumn() + " IN " +
            "<foreach collection=\"coll\" item=\"item\" open=\"(\" separator=\",\" close=\")\">" +
            "#{item}" +
            "</foreach> " +
            "ORDER BY FIELD(" + tableInfo.getKeyColumn() + ", " +
            "<foreach collection=\"coll\" item=\"item\" separator=\",\">" +
            "#{item}" +
            "</foreach>)" +
            "</script>";
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            Object.class
        );
        
        return addSelectMappedStatement(
            mapperClass, 
            methodName, 
            sqlSource, 
            modelClass, 
            tableInfo
        );
    }
}
```

### 模糊查询方法

```java
/**
 * 根据字段模糊查询
 */
public class SelectByLike extends AbstractMethod {
    
    private String fieldName;
    
    public SelectByLike(String fieldName) {
        this.fieldName = fieldName;
    }
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "selectBy" + StringUtils.capitalize(fieldName) + "Like";
        
        // 获取字段信息
        TableFieldInfo fieldInfo = tableInfo.getFieldList().stream()
            .filter(f -> f.getProperty().equals(fieldName))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("字段不存在：" + fieldName));
        
        String sql = String.format(
            "SELECT %s FROM %s WHERE %s LIKE CONCAT('%%', #{%s}, '%%')",
            sqlSelectColumns(tableInfo, false),
            tableInfo.getTableName(),
            fieldInfo.getColumn(),
            fieldName
        );
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            Object.class
        );
        
        return addSelectMappedStatement(
            mapperClass, 
            methodName, 
            sqlSource, 
            modelClass, 
            tableInfo
        );
    }
}
```

### 范围查询方法

```java
/**
 * 根据字段范围查询
 */
public class SelectByRange extends AbstractMethod {
    
    private String fieldName;
    
    public SelectByRange(String fieldName) {
        this.fieldName = fieldName;
    }
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "selectBy" + StringUtils.capitalize(fieldName) + "Range";
        
        TableFieldInfo fieldInfo = tableInfo.getFieldList().stream()
            .filter(f -> f.getProperty().equals(fieldName))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("字段不存在：" + fieldName));
        
        String sql = String.format(
            "<script>" +
            "SELECT %s FROM %s " +
            "<where>" +
            "<if test=\"min != null\">AND %s &gt;= #{min}</if>" +
            "<if test=\"max != null\">AND %s &lt;= #{max}</if>" +
            "</where>" +
            "</script>",
            sqlSelectColumns(tableInfo, false),
            tableInfo.getTableName(),
            fieldInfo.getColumn(),
            fieldInfo.getColumn()
        );
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            Object.class
        );
        
        return addSelectMappedStatement(
            mapperClass, 
            methodName, 
            sqlSource, 
            modelClass, 
            tableInfo
        );
    }
}
```

---

## 统计分析方法

### 分组统计

```java
/**
 * 根据字段分组统计
 */
public class CountByGroupBy extends AbstractMethod {
    
    private String groupByField;
    
    public CountByGroupBy(String groupByField) {
        this.groupByField = groupByField;
    }
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "countByGroupBy" + StringUtils.capitalize(groupByField);
        
        TableFieldInfo fieldInfo = tableInfo.getFieldList().stream()
            .filter(f -> f.getProperty().equals(groupByField))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("字段不存在：" + groupByField));
        
        String sql = String.format(
            "SELECT %s as groupKey, COUNT(*) as count " +
            "FROM %s " +
            "GROUP BY %s",
            fieldInfo.getColumn(),
            tableInfo.getTableName(),
            fieldInfo.getColumn()
        );
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            Object.class
        );
        
        return addSelectMapsStatement(
            mapperClass, 
            methodName, 
            sqlSource
        );
    }
}
```

### 求和统计

```java
/**
 * 字段求和
 */
public class SumByField extends AbstractMethod {
    
    private String sumField;
    
    public SumByField(String sumField) {
        this.sumField = sumField;
    }
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "sumBy" + StringUtils.capitalize(sumField);
        
        TableFieldInfo fieldInfo = tableInfo.getFieldList().stream()
            .filter(f -> f.getProperty().equals(sumField))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("字段不存在：" + sumField));
        
        String sql = String.format(
            "SELECT COALESCE(SUM(%s), 0) FROM %s",
            fieldInfo.getColumn(),
            tableInfo.getTableName()
        );
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            Object.class
        );
        
        // 返回值类型设置为对象（让 MyBatis 自动转换）
        return this.addSelectMappedStatementForOther(
            mapperClass, 
            methodName, 
            sqlSource, 
            Object.class
        );
    }
}
```

---

## 复杂查询方法

### 多表关联查询

```java
/**
 * 关联查询（用户+部门）
 */
public class SelectWithDept extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "selectWithDept";
        
        String sql = 
            "SELECT " +
            "  u.id, u.name, u.age, u.email, u.dept_id, " +
            "  d.dept_name " +
            "FROM user u " +
            "LEFT JOIN dept d ON u.dept_id = d.id " +
            "WHERE u.id = #{id}";
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            Object.class
        );
        
        return addSelectMapsStatement(
            mapperClass, 
            methodName, 
            sqlSource
        );
    }
}
```

### 分页查询（自定义条件）

```java
/**
 * 自定义条件分页查询
 */
public class SelectPageByCondition extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "selectPageByCondition";
        
        String sql = "<script>" +
            "SELECT " + sqlSelectColumns(tableInfo, false) + " " +
            "FROM " + tableInfo.getTableName() + " " +
            "<where>" +
            "<if test=\"condition.name != null and condition.name != ''\">" +
            "AND name LIKE CONCAT('%', #{condition.name}, '%')" +
            "</if>" +
            "<if test=\"condition.status != null\">" +
            "AND status = #{condition.status}" +
            "</if>" +
            "<if test=\"condition.startTime != null\">" +
            "AND create_time &gt;= #{condition.startTime}" +
            "</if>" +
            "<if test=\"condition.endTime != null\">" +
            "AND create_time &lt;= #{condition.endTime}" +
            "</if>" +
            "</where>" +
            "</script>";
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            Object.class
        );
        
        return addSelectMappedStatement(
            mapperClass, 
            methodName, 
            sqlSource, 
            modelClass, 
            tableInfo
        );
    }
}
```

---

## 通用方法工具类

### 方法构建器

```java
/**
 * 自定义方法构建器
 */
public class MethodBuilder {
    
    /**
     * 构建批量插入方法
     */
    public static AbstractMethod buildBatchInsert() {
        return new InsertBatchSomeColumn();
    }
    
    /**
     * 构建模糊查询方法
     */
    public static AbstractMethod buildSelectByLike(String fieldName) {
        return new SelectByLike(fieldName);
    }
    
    /**
     * 构建范围查询方法
     */
    public static AbstractMethod buildSelectByRange(String fieldName) {
        return new SelectByRange(fieldName);
    }
    
    /**
     * 构建分组统计方法
     */
    public static AbstractMethod buildCountByGroupBy(String fieldName) {
        return new CountByGroupBy(fieldName);
    }
    
    /**
     * 构建求和方法
     */
    public static AbstractMethod buildSumByField(String fieldName) {
        return new SumByField(fieldName);
    }
}
```

### 动态方法注入器

```java
/**
 * 动态方法注入器
 */
public class DynamicSqlInjector extends DefaultSqlInjector {
    
    /**
     * 根据实体类动态注入方法
     */
    @Override
    public List<AbstractMethod> getMethodList(Class<?> mapperClass, 
                                               TableInfo tableInfo) {
        List<AbstractMethod> methodList = super.getMethodList(mapperClass, tableInfo);
        
        // 添加通用方法
        methodList.add(new InsertBatchSomeColumn());
        methodList.add(new InsertOrUpdateBatch());
        methodList.add(new UpdateBatchByIds());
        methodList.add(new LogicDeleteBatchByIds());
        
        // 根据注解动态添加方法
        Class<?> entityClass = tableInfo.getEntityType();
        
        if (entityClass.isAnnotationPresent(EnableFuzzyQuery.class)) {
            // 启用模糊查询
            EnableFuzzyQuery annotation = entityClass.getAnnotation(EnableFuzzyQuery.class);
            for (String field : annotation.fields()) {
                methodList.add(new SelectByLike(field));
            }
        }
        
        if (entityClass.isAnnotationPresent(EnableRangeQuery.class)) {
            // 启用范围查询
            EnableRangeQuery annotation = entityClass.getAnnotation(EnableRangeQuery.class);
            for (String field : annotation.fields()) {
                methodList.add(new SelectByRange(field));
            }
        }
        
        return methodList;
    }
}

/**
 * 启用模糊查询注解
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface EnableFuzzyQuery {
    String[] fields();
}

/**
 * 启用范围查询注解
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface EnableRangeQuery {
    String[] fields();
}
```

### 使用示例

```java
/**
 * 实体类（启用动态方法）
 */
@Data
@EnableFuzzyQuery(fields = {"name", "email"})
@EnableRangeQuery(fields = {"age", "createTime"})
public class User {
    @TableId
    private Long id;
    
    private String name;
    
    private Integer age;
    
    private String email;
    
    private LocalDateTime createTime;
}

/**
 * Mapper 接口（自动拥有动态方法）
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    // 自动注入的方法（无需声明）：
    // List<User> selectByNameLike(String name);
    // List<User> selectByEmailLike(String email);
    // List<User> selectByAgeRange(Integer min, Integer max);
    // List<User> selectByCreateTimeRange(LocalDateTime min, LocalDateTime max);
}

/**
 * Service 使用
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 模糊查询
     */
    public List<User> searchByName(String keyword) {
        return baseMapper.selectByNameLike(keyword);
    }
    
    /**
     * 年龄范围查询
     */
    public List<User> listByAgeRange(Integer minAge, Integer maxAge) {
        Map<String, Object> params = new HashMap<>();
        params.put("min", minAge);
        params.put("max", maxAge);
        return baseMapper.selectByAgeRange(params);
    }
}
```

---

## 关键点总结

1. **批量操作**：InsertBatch、UpdateBatch、DeleteBatch 等高效方法
2. **条件查询**：Like、In、Range 等灵活查询方式
3. **统计分析**：Count、Sum、GroupBy 等聚合方法
4. **复杂查询**：多表关联、分页查询等高级功能
5. **动态注入**：根据注解自动注入方法，提升开发效率
6. **方法复用**：通过继承和组合实现方法复用
7. **性能优化**：批量操作减少数据库交互次数

---

## 参考资料

- [自定义方法](https://baomidou.com/pages/42ea4a/)
- [SQL 注入器](https://baomidou.com/pages/42ea4a/#sql%E6%B3%A8%E5%85%A5%E5%99%A8)

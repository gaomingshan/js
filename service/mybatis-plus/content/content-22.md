# 11.1 SQL 注入器原理

## 概述

SQL 注入器（SqlInjector）是 MyBatis Plus 实现通用 CRUD 方法的核心机制。它负责在应用启动时，将预定义的 SQL 方法注入到 Mapper 接口中，使得 BaseMapper 无需编写任何 SQL 就能使用 insert、update、select、delete 等方法。

**核心内容：**
- SQL 注入器工作原理
- DefaultSqlInjector 源码分析
- 内置方法列表
- 扩展点与自定义

---

## SQL 注入器工作原理

### 执行时机

```
应用启动流程：
1. Spring 容器启动
   ↓
2. MybatisSqlSessionFactoryBean 初始化
   ↓
3. SqlSessionFactory 构建
   ↓
4. 扫描 Mapper 接口
   ↓
5. SQL 注入器注入通用方法
   ↓
6. 生成 MappedStatement 对象
   ↓
7. 注册到 MyBatis Configuration
   ↓
8. 应用启动完成
```

### 注入流程

```java
/**
 * SQL 注入器接口
 */
public interface ISqlInjector {
    
    /**
     * 注入 SQL 方法
     * 
     * @param mapperClass Mapper 接口
     * @param modelClass 实体类
     * @param tableInfo 表信息
     */
    List<AbstractMethod> getMethodList(Class<?> mapperClass, 
                                        Class<?> modelClass, 
                                        TableInfo tableInfo);
}
```

---

## DefaultSqlInjector 源码分析

### 内置方法列表

```java
public class DefaultSqlInjector extends AbstractSqlInjector {
    
    @Override
    public List<AbstractMethod> getMethodList(Class<?> mapperClass, 
                                               TableInfo tableInfo) {
        return Stream.of(
            // 插入
            new Insert(),
            new InsertBatchSomeColumn(),
            
            // 删除
            new Delete(),
            new DeleteById(),
            new DeleteBatchByIds(),
            new DeleteByMap(),
            
            // 更新
            new Update(),
            new UpdateById(),
            
            // 查询
            new SelectById(),
            new SelectBatchByIds(),
            new SelectByMap(),
            new SelectOne(),
            new SelectCount(),
            new SelectMaps(),
            new SelectMapsPage(),
            new SelectObjs(),
            new SelectList(),
            new SelectPage()
        ).collect(toList());
    }
}
```

### AbstractMethod 抽象类

```java
public abstract class AbstractMethod implements Constants {
    
    /**
     * 注入自定义方法
     */
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        // 1. 获取方法名
        String methodName = this.methodName();
        
        // 2. 生成 SQL
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            String.format(this.sqlScript(), 
                tableInfo.getTableName(),
                sqlSelectColumns(tableInfo, false),
                tableInfo.getKeyColumn(),
                // ... 其他参数
            ),
            modelClass
        );
        
        // 3. 创建 MappedStatement
        return this.addMappedStatement(
            mapperClass, 
            methodName, 
            sqlSource, 
            this.sqlCommandType(), 
            modelClass
        );
    }
    
    /**
     * 方法名
     */
    public abstract String methodName();
    
    /**
     * SQL 脚本
     */
    public abstract String sqlScript();
    
    /**
     * SQL 命令类型
     */
    public abstract SqlCommandType sqlCommandType();
}
```

### Insert 方法示例

```java
public class Insert extends AbstractMethod {
    
    @Override
    public String methodName() {
        return "insert";
    }
    
    @Override
    public SqlCommandType sqlCommandType() {
        return SqlCommandType.INSERT;
    }
    
    @Override
    public String sqlScript() {
        return "<script>" +
               "INSERT INTO %s %s VALUES %s" +
               "</script>";
    }
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        // 构建 SQL
        String sql = String.format(
            "<script>INSERT INTO %s (%s) VALUES (%s)</script>",
            tableInfo.getTableName(),
            prepareFieldSql(tableInfo),
            prepareValuesSql(tableInfo)
        );
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            modelClass
        );
        
        return addInsertMappedStatement(
            mapperClass, 
            modelClass, 
            "insert", 
            sqlSource, 
            new NoKeyGenerator(), 
            null, 
            null
        );
    }
    
    private String prepareFieldSql(TableInfo tableInfo) {
        // 生成字段列表：id, name, age
        return tableInfo.getAllSqlSelect();
    }
    
    private String prepareValuesSql(TableInfo tableInfo) {
        // 生成值列表：#{id}, #{name}, #{age}
        return tableInfo.getAllInsertSqlPropertyMaybeIf(null);
    }
}
```

---

## 自定义 SQL 注入器

### 创建自定义方法

```java
/**
 * 自定义方法：根据 ID 逻辑删除（物理删除）
 */
public class DeleteByIdIgnoreLogic extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        // SQL 方法名
        String methodName = "deleteByIdIgnoreLogic";
        
        // SQL 语句
        String sql = String.format(
            "DELETE FROM %s WHERE %s = #{%s}",
            tableInfo.getTableName(),
            tableInfo.getKeyColumn(),
            tableInfo.getKeyProperty()
        );
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            Object.class
        );
        
        return addDeleteMappedStatement(
            mapperClass, 
            methodName, 
            sqlSource
        );
    }
}
```

### 创建自定义注入器

```java
/**
 * 自定义 SQL 注入器
 */
public class CustomSqlInjector extends DefaultSqlInjector {
    
    @Override
    public List<AbstractMethod> getMethodList(Class<?> mapperClass, 
                                               TableInfo tableInfo) {
        // 1. 获取默认方法
        List<AbstractMethod> methodList = super.getMethodList(mapperClass, tableInfo);
        
        // 2. 添加自定义方法
        methodList.add(new DeleteByIdIgnoreLogic());
        methodList.add(new InsertBatchSomeColumn());
        methodList.add(new LogicDeleteBatchByIds());
        
        return methodList;
    }
}
```

### 注册自定义注入器

```java
@Configuration
public class MybatisPlusConfig {
    
    /**
     * 注册自定义 SQL 注入器
     */
    @Bean
    public ISqlInjector customSqlInjector() {
        return new CustomSqlInjector();
    }
}
```

### 使用自定义方法

```java
/**
 * Mapper 接口（继承 BaseMapper 自动拥有自定义方法）
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    // 自定义方法会自动注入，无需声明
    // int deleteByIdIgnoreLogic(Serializable id);
}

// 使用
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 物理删除（忽略逻辑删除）
     */
    public boolean physicalDelete(Long id) {
        return baseMapper.deleteByIdIgnoreLogic(id) > 0;
    }
}
```

---

## 常用自定义方法示例

### 1. 批量插入（MySQL）

```java
/**
 * 批量插入方法（MySQL 语法）
 */
public class InsertBatchSomeColumn extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "insertBatchSomeColumn";
        
        // 构建批量插入 SQL
        String sql = "<script>" +
            "INSERT INTO " + tableInfo.getTableName() + " " +
            "(" + prepareFieldSql(tableInfo) + ") " +
            "VALUES " +
            "<foreach collection=\"list\" item=\"item\" separator=\",\">" +
            "(" + prepareValuesSql(tableInfo) + ")" +
            "</foreach>" +
            "</script>";
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
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
    
    private String prepareFieldSql(TableInfo tableInfo) {
        // 获取所有字段
        return tableInfo.getAllInsertSqlColumn();
    }
    
    private String prepareValuesSql(TableInfo tableInfo) {
        // 使用 item 作为前缀
        return tableInfo.getAllInsertSqlPropertyMaybeIf("item.");
    }
}
```

### 2. 批量逻辑删除

```java
/**
 * 批量逻辑删除
 */
public class LogicDeleteBatchByIds extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "logicDeleteBatchByIds";
        
        // 获取逻辑删除字段
        String logicDeleteColumn = tableInfo.getLogicDeleteFieldInfo().getColumn();
        String logicDeleteValue = tableInfo.getLogicDeleteFieldInfo().getLogicDeleteValue();
        
        String sql = "<script>" +
            "UPDATE " + tableInfo.getTableName() + " " +
            "SET " + logicDeleteColumn + " = " + logicDeleteValue + " " +
            "WHERE " + tableInfo.getKeyColumn() + " IN " +
            "<foreach collection=\"coll\" item=\"item\" open=\"(\" separator=\",\" close=\")\">" +
            "#{item}" +
            "</foreach>" +
            "</script>";
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            Object.class
        );
        
        return addUpdateMappedStatement(
            mapperClass, 
            modelClass, 
            methodName, 
            sqlSource
        );
    }
}
```

### 3. 根据字段查询

```java
/**
 * 根据指定字段查询
 */
public class SelectByField extends AbstractMethod {
    
    private String fieldName;
    
    public SelectByField(String fieldName) {
        this.fieldName = fieldName;
    }
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "selectBy" + StringUtils.capitalize(fieldName);
        
        // 获取字段对应的列名
        String columnName = tableInfo.getFieldList().stream()
            .filter(f -> f.getProperty().equals(fieldName))
            .findFirst()
            .map(TableFieldInfo::getColumn)
            .orElse(fieldName);
        
        String sql = String.format(
            "SELECT %s FROM %s WHERE %s = #{%s}",
            sqlSelectColumns(tableInfo, false),
            tableInfo.getTableName(),
            columnName,
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

---

## 实战案例：通用 BaseMapper 扩展

### 扩展 BaseMapper

```java
/**
 * 扩展 BaseMapper，添加通用方法
 */
public interface ExtendBaseMapper<T> extends BaseMapper<T> {
    
    /**
     * 批量插入（忽略空字段）
     */
    int insertBatchSomeColumn(@Param("list") List<T> entityList);
    
    /**
     * 批量逻辑删除
     */
    int logicDeleteBatchByIds(@Param("coll") Collection<? extends Serializable> idList);
    
    /**
     * 物理删除（忽略逻辑删除）
     */
    int deleteByIdIgnoreLogic(Serializable id);
    
    /**
     * 查询所有（包括已删除）
     */
    List<T> selectAllIncludeDeleted();
}
```

### 实现自定义注入器

```java
/**
 * 扩展 SQL 注入器
 */
public class ExtendSqlInjector extends DefaultSqlInjector {
    
    @Override
    public List<AbstractMethod> getMethodList(Class<?> mapperClass, 
                                               TableInfo tableInfo) {
        List<AbstractMethod> methodList = super.getMethodList(mapperClass, tableInfo);
        
        // 添加扩展方法
        methodList.add(new InsertBatchSomeColumn());
        methodList.add(new LogicDeleteBatchByIds());
        methodList.add(new DeleteByIdIgnoreLogic());
        methodList.add(new SelectAllIncludeDeleted());
        
        return methodList;
    }
}

/**
 * 查询所有（包括已删除）
 */
public class SelectAllIncludeDeleted extends AbstractMethod {
    
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        String methodName = "selectAllIncludeDeleted";
        
        String sql = String.format(
            "SELECT %s FROM %s",
            sqlSelectColumns(tableInfo, false),
            tableInfo.getTableName()
        );
        
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, 
            sql, 
            modelClass
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

### 配置与使用

```java
/**
 * 配置扩展注入器
 */
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public ISqlInjector extendSqlInjector() {
        return new ExtendSqlInjector();
    }
}

/**
 * Mapper 接口继承扩展 BaseMapper
 */
@Mapper
public interface UserMapper extends ExtendBaseMapper<User> {
    // 自动拥有所有扩展方法
}

/**
 * Service 使用
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 批量插入
     */
    @Override
    public boolean saveBatch(Collection<User> entityList) {
        return baseMapper.insertBatchSomeColumn(new ArrayList<>(entityList)) > 0;
    }
    
    /**
     * 批量逻辑删除
     */
    public boolean logicDeleteBatch(Collection<Long> idList) {
        return baseMapper.logicDeleteBatchByIds(idList) > 0;
    }
    
    /**
     * 物理删除
     */
    public boolean physicalDelete(Long id) {
        return baseMapper.deleteByIdIgnoreLogic(id) > 0;
    }
}
```

---

## 关键点总结

1. **SQL 注入器**：在应用启动时将通用方法注入到 Mapper 接口
2. **DefaultSqlInjector**：内置注入器，提供基础 CRUD 方法
3. **AbstractMethod**：抽象方法类，自定义方法需继承此类
4. **自定义注入器**：继承 DefaultSqlInjector，添加自定义方法
5. **扩展 BaseMapper**：定义扩展接口，声明自定义方法
6. **动态 SQL**：使用 MyBatis 动态 SQL 标签构建复杂查询
7. **注册配置**：通过 @Bean 注册自定义 SQL 注入器

---

## 参考资料

- [SQL 注入器](https://baomidou.com/pages/42ea4a/)
- [自定义方法](https://baomidou.com/pages/42ea4a/#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%96%B9%E6%B3%95)

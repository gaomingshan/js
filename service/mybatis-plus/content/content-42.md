# 20.1 核心组件源码分析

## 概述

深入理解 MyBatis Plus 核心组件的源码实现，有助于更好地使用和扩展框架。

**核心组件：**
- MybatisSqlSessionFactoryBean
- SqlRunner
- BaseMapper 实现原理
- Wrapper 构建原理

---

## MybatisSqlSessionFactoryBean

```java
/**
 * SqlSessionFactory 构建流程
 */
public class MybatisSqlSessionFactoryBean implements FactoryBean<SqlSessionFactory> {
    
    @Override
    public SqlSessionFactory getObject() throws Exception {
        return buildSqlSessionFactory();
    }
    
    protected SqlSessionFactory buildSqlSessionFactory() throws Exception {
        // 1. 创建 Configuration
        Configuration configuration = this.configuration;
        
        // 2. 设置全局配置
        GlobalConfig globalConfig = this.globalConfig;
        
        // 3. 注入 SQL 方法
        SqlInjector sqlInjector = globalConfig.getSqlInjector();
        sqlInjector.inspectInject(mapperRegistry, configuration);
        
        // 4. 构建 SqlSessionFactory
        return new SqlSessionFactoryBuilder().build(configuration);
    }
}
```

---

## BaseMapper 原理

```java
/**
 * BaseMapper 方法注入原理
 */
public class DefaultSqlInjector extends AbstractSqlInjector {
    
    @Override
    public List<AbstractMethod> getMethodList(Class<?> mapperClass, 
                                               TableInfo tableInfo) {
        return Stream.of(
            new Insert(),
            new SelectById(),
            new UpdateById(),
            new DeleteById()
            // ...
        ).collect(toList());
    }
}

/**
 * AbstractMethod 注入流程
 */
public abstract class AbstractMethod {
    
    public void inject(MapperBuilderAssistant assistant, 
                      Class<?> mapperClass, 
                      Class<?> modelClass, 
                      TableInfo table) {
        // 1. 构建 SQL
        String sql = String.format(sqlScript(), 
            table.getTableName(),
            table.getAllSqlSelect()
        );
        
        // 2. 创建 SqlSource
        SqlSource sqlSource = languageDriver.createSqlSource(
            configuration, sql, modelClass
        );
        
        // 3. 注册 MappedStatement
        addMappedStatement(mapperClass, methodName(), sqlSource, ...);
    }
}
```

---

## Wrapper 构建原理

```java
/**
 * QueryWrapper 构建 SQL
 */
public class QueryWrapper<T> extends AbstractWrapper<T, String, QueryWrapper<T>> {
    
    @Override
    public String getSqlSegment() {
        // 1. 拼接 WHERE 条件
        return expression.getSqlSegment();
    }
    
    public QueryWrapper<T> eq(String column, Object val) {
        // 2. 添加条件到表达式树
        return addCondition(true, column, SqlKeyword.EQ, val);
    }
    
    protected QueryWrapper<T> addCondition(boolean condition, 
                                          String column, 
                                          SqlKeyword sqlKeyword, 
                                          Object val) {
        if (condition) {
            expression.add(
                () -> columnToString(column),
                sqlKeyword,
                () -> formatSql("{0}", val)
            );
        }
        return typedThis;
    }
}
```

---

## 关键点总结

1. **SqlInjector**：负责注入通用方法到 Mapper
2. **AbstractMethod**：定义方法注入逻辑
3. **Wrapper**：基于表达式树构建 SQL
4. **TableInfo**：缓存实体类表信息
5. **Configuration**：MyBatis 核心配置对象
6. **MappedStatement**：SQL 语句映射对象
7. **扩展点**：自定义 SqlInjector、AbstractMethod

---

## 参考资料

- [MyBatis Plus 源码](https://github.com/baomidou/mybatis-plus)
- [MyBatis 核心组件](https://mybatis.org/mybatis-3/zh/sqlmap-xml.html)

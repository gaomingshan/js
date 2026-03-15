# 20.2 插件机制源码

## 概述

MyBatis Plus 插件基于 MyBatis 拦截器实现，支持 SQL 拦截和改写。

**核心内容：**
- Interceptor 原理
- InnerInterceptor 机制
- 插件执行顺序
- 自定义插件开发

---

## Interceptor 原理

```java
/**
 * MyBatis 拦截器
 */
@Intercepts({
    @Signature(
        type = Executor.class,
        method = "query",
        args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}
    )
})
public class MybatisPlusInterceptor implements Interceptor {
    
    private List<InnerInterceptor> interceptors = new ArrayList<>();
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object target = invocation.getTarget();
        Object[] args = invocation.getArgs();
        
        // 调用内部拦截器
        for (InnerInterceptor interceptor : interceptors) {
            if (target instanceof Executor) {
                interceptor.beforeQuery(...);
            }
        }
        
        return invocation.proceed();
    }
}
```

---

## InnerInterceptor 机制

```java
/**
 * 内部拦截器接口
 */
public interface InnerInterceptor {
    
    /**
     * 查询前
     */
    default void beforeQuery(Executor executor, 
                            MappedStatement ms, 
                            Object parameter, 
                            RowBounds rowBounds, 
                            ResultHandler resultHandler, 
                            BoundSql boundSql) throws SQLException {
    }
    
    /**
     * 更新前
     */
    default void beforeUpdate(Executor executor, 
                             MappedStatement ms, 
                             Object parameter) throws SQLException {
    }
}
```

---

## 插件执行顺序

```java
/**
 * 插件链执行顺序
 */
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 执行顺序：从上到下
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor());      // 1
        interceptor.addInnerInterceptor(new DynamicTableNameInnerInterceptor());  // 2
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());        // 3
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor()); // 4
        
        return interceptor;
    }
}
```

---

## SQL 改写示例

```java
/**
 * SQL 改写插件
 */
public class SqlRewriteInterceptor implements InnerInterceptor {
    
    @Override
    public void beforeQuery(Executor executor, 
                           MappedStatement ms, 
                           Object parameter, 
                           RowBounds rowBounds, 
                           ResultHandler resultHandler, 
                           BoundSql boundSql) {
        // 1. 获取原始 SQL
        String originalSql = boundSql.getSql();
        
        // 2. 解析 SQL
        Statement statement = CCJSqlParserUtil.parse(originalSql);
        
        // 3. 改写 SQL
        if (statement instanceof Select) {
            Select select = (Select) statement;
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            
            // 添加条件
            Expression where = plainSelect.getWhere();
            Expression newCondition = CCJSqlParserUtil.parseCondExpression("status = 1");
            
            if (where != null) {
                plainSelect.setWhere(new AndExpression(where, newCondition));
            } else {
                plainSelect.setWhere(newCondition);
            }
        }
        
        // 4. 替换 SQL
        String newSql = statement.toString();
        PluginUtils.MPBoundSql mpBs = PluginUtils.mpBoundSql(boundSql);
        mpBs.sql(newSql);
    }
}
```

---

## 关键点总结

1. **Interceptor**：基于 MyBatis 拦截器
2. **InnerInterceptor**：内部拦截器，链式调用
3. **执行顺序**：注册顺序决定执行顺序
4. **SQL 解析**：使用 JSqlParser 解析和改写
5. **性能影响**：拦截器会影响性能，需谨慎使用
6. **线程安全**：拦截器需要保证线程安全
7. **调试技巧**：打印改写后的 SQL

---

## 参考资料

- [MyBatis 插件开发](https://mybatis.org/mybatis-3/zh/configuration.html#plugins)
- [JSqlParser](https://github.com/JSQLParser/JSqlParser)

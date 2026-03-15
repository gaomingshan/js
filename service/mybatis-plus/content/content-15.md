# 7.2 自定义插件开发

## 概述

MyBatis Plus 的插件机制基于 MyBatis 的拦截器（Interceptor），允许开发者在 SQL 执行的不同阶段介入处理。掌握自定义插件开发，可以实现数据脱敏、SQL 日志、权限控制等高级功能。

**核心内容：**
- MyBatis 拦截器原理
- InnerInterceptor 接口详解
- 自定义 SQL 拦截与改写
- 插件执行顺序与性能

---

## MyBatis 拦截器原理

### 四大拦截点

MyBatis 提供了四个拦截点，对应 SQL 执行的不同阶段：

```java
// 1. Executor（执行器）
@Intercepts({
    @Signature(
        type = Executor.class,
        method = "update",
        args = {MappedStatement.class, Object.class}
    ),
    @Signature(
        type = Executor.class,
        method = "query",
        args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}
    )
})

// 2. StatementHandler（语句处理器）
@Intercepts({
    @Signature(
        type = StatementHandler.class,
        method = "prepare",
        args = {Connection.class, Integer.class}
    )
})

// 3. ParameterHandler（参数处理器）
@Intercepts({
    @Signature(
        type = ParameterHandler.class,
        method = "setParameters",
        args = {PreparedStatement.class}
    )
})

// 4. ResultSetHandler（结果集处理器）
@Intercepts({
    @Signature(
        type = ResultSetHandler.class,
        method = "handleResultSets",
        args = {Statement.class}
    )
})
```

### 执行流程

```
SQL 执行流程：
1. Executor.query/update         ← 执行器拦截点
   ↓
2. StatementHandler.prepare      ← 语句处理器拦截点
   ↓
3. ParameterHandler.setParameters ← 参数处理器拦截点
   ↓
4. 执行 SQL
   ↓
5. ResultSetHandler.handleResultSets ← 结果集处理器拦截点
```

---

## InnerInterceptor 接口详解

### 接口定义

```java
public interface InnerInterceptor {
    
    /**
     * 查询前置处理
     */
    default void beforeQuery(Executor executor, 
                            MappedStatement ms, 
                            Object parameter, 
                            RowBounds rowBounds, 
                            ResultHandler resultHandler, 
                            BoundSql boundSql) throws SQLException {
    }
    
    /**
     * 查询后置处理
     */
    default void beforePrepare(StatementHandler sh, 
                              Connection connection, 
                              Integer transactionTimeout) {
    }
    
    /**
     * 设置参数前置处理
     */
    default void beforeSetParameters(StatementHandler sh, 
                                    PreparedStatement stmt, 
                                    BoundSql boundSql) throws SQLException {
    }
    
    /**
     * 更新前置处理
     */
    default void beforeUpdate(Executor executor, 
                             MappedStatement ms, 
                             Object parameter) throws SQLException {
    }
    
    /**
     * 设置参数
     */
    default void setParameters(PreparedStatement ps) throws SQLException {
    }
}
```

---

## 自定义 SQL 拦截与改写

### 示例1：SQL 日志插件

```java
/**
 * SQL 日志插件
 * 记录 SQL 执行时间、参数、结果
 */
@Slf4j
public class SqlLogInterceptor implements InnerInterceptor {
    
    /**
     * 执行时间阈值（ms）
     */
    private long slowSqlThreshold = 1000;
    
    @Override
    public void beforeQuery(Executor executor, 
                           MappedStatement ms, 
                           Object parameter, 
                           RowBounds rowBounds, 
                           ResultHandler resultHandler, 
                           BoundSql boundSql) throws SQLException {
        // 记录开始时间
        long startTime = System.currentTimeMillis();
        
        // 获取 SQL
        String sql = boundSql.getSql();
        
        // 获取参数
        Object parameterObject = boundSql.getParameterObject();
        
        log.info("执行SQL: {}", formatSql(sql));
        log.info("参数: {}", JSON.toJSONString(parameterObject));
        
        // 存储开始时间（用于后续计算执行时间）
        SqlTimeContextHolder.setStartTime(startTime);
    }
    
    @Override
    public void beforePrepare(StatementHandler sh, 
                             Connection connection, 
                             Integer transactionTimeout) {
        long startTime = SqlTimeContextHolder.getStartTime();
        long endTime = System.currentTimeMillis();
        long costTime = endTime - startTime;
        
        if (costTime > slowSqlThreshold) {
            log.warn("慢SQL警告! 执行时间: {}ms", costTime);
        } else {
            log.info("SQL执行时间: {}ms", costTime);
        }
        
        SqlTimeContextHolder.clear();
    }
    
    /**
     * 格式化 SQL
     */
    private String formatSql(String sql) {
        return sql.replaceAll("\\s+", " ").trim();
    }
}

/**
 * SQL 时间上下文
 */
class SqlTimeContextHolder {
    private static final ThreadLocal<Long> START_TIME = new ThreadLocal<>();
    
    public static void setStartTime(long startTime) {
        START_TIME.set(startTime);
    }
    
    public static long getStartTime() {
        return START_TIME.get();
    }
    
    public static void clear() {
        START_TIME.remove();
    }
}
```

### 示例2：数据脱敏插件

```java
/**
 * 数据脱敏插件
 * 对敏感字段（手机号、身份证等）进行脱敏处理
 */
public class DataMaskingInterceptor implements InnerInterceptor {
    
    /**
     * 需要脱敏的字段
     */
    private static final Set<String> MASK_FIELDS = Set.of(
        "phone", "mobile", "id_card", "email", "bank_card"
    );
    
    @Override
    public void beforeQuery(Executor executor, 
                           MappedStatement ms, 
                           Object parameter, 
                           RowBounds rowBounds, 
                           ResultHandler resultHandler, 
                           BoundSql boundSql) throws SQLException {
        // 在结果处理时脱敏
        ResultHandler<?> maskedHandler = new MaskingResultHandler(resultHandler);
        // 替换结果处理器（需要反射）
    }
    
    /**
     * 脱敏结果处理器
     */
    static class MaskingResultHandler implements ResultHandler<Object> {
        
        private final ResultHandler<?> delegate;
        
        public MaskingResultHandler(ResultHandler<?> delegate) {
            this.delegate = delegate;
        }
        
        @Override
        public void handleResult(ResultContext<? extends Object> resultContext) {
            Object result = resultContext.getResultObject();
            
            // 对结果进行脱敏
            maskSensitiveData(result);
            
            // 调用原始处理器
            if (delegate != null) {
                ((ResultHandler<Object>) delegate).handleResult(
                    (ResultContext<? extends Object>) resultContext
                );
            }
        }
        
        /**
         * 脱敏敏感数据
         */
        private void maskSensitiveData(Object obj) {
            if (obj == null) {
                return;
            }
            
            Class<?> clazz = obj.getClass();
            Field[] fields = clazz.getDeclaredFields();
            
            for (Field field : fields) {
                // 检查字段是否需要脱敏
                if (MASK_FIELDS.contains(field.getName().toLowerCase())) {
                    try {
                        field.setAccessible(true);
                        Object value = field.get(obj);
                        
                        if (value instanceof String) {
                            String maskedValue = maskString((String) value, field.getName());
                            field.set(obj, maskedValue);
                        }
                    } catch (IllegalAccessException e) {
                        // 忽略无法访问的字段
                    }
                }
            }
        }
        
        /**
         * 脱敏字符串
         */
        private String maskString(String value, String fieldName) {
            if (StringUtils.isBlank(value)) {
                return value;
            }
            
            if ("phone".equalsIgnoreCase(fieldName) || 
                "mobile".equalsIgnoreCase(fieldName)) {
                // 手机号：138****1234
                if (value.length() == 11) {
                    return value.substring(0, 3) + "****" + value.substring(7);
                }
            } else if ("id_card".equalsIgnoreCase(fieldName)) {
                // 身份证：110***********1234
                if (value.length() == 18) {
                    return value.substring(0, 3) + "***********" + value.substring(14);
                }
            } else if ("email".equalsIgnoreCase(fieldName)) {
                // 邮箱：abc***@example.com
                int atIndex = value.indexOf("@");
                if (atIndex > 0) {
                    String prefix = value.substring(0, Math.min(3, atIndex));
                    return prefix + "***" + value.substring(atIndex);
                }
            }
            
            // 默认脱敏：显示前3后4位
            if (value.length() > 7) {
                return value.substring(0, 3) + "***" + 
                       value.substring(value.length() - 4);
            }
            
            return "***";
        }
    }
}
```

### 示例3：数据权限插件

```java
/**
 * 数据权限插件
 * 根据用户权限自动过滤数据
 */
public class DataPermissionInterceptor implements InnerInterceptor {
    
    @Override
    public void beforeQuery(Executor executor, 
                           MappedStatement ms, 
                           Object parameter, 
                           RowBounds rowBounds, 
                           ResultHandler resultHandler, 
                           BoundSql boundSql) throws SQLException {
        
        // 获取当前用户
        User currentUser = SecurityUtils.getCurrentUser();
        
        if (currentUser == null || currentUser.isAdmin()) {
            // 管理员不过滤
            return;
        }
        
        // 改写 SQL，添加数据权限条件
        String originalSql = boundSql.getSql();
        String newSql = addDataPermission(originalSql, currentUser);
        
        // 替换 SQL（需要反射）
        try {
            Field field = boundSql.getClass().getDeclaredField("sql");
            field.setAccessible(true);
            field.set(boundSql, newSql);
        } catch (Exception e) {
            throw new RuntimeException("修改SQL失败", e);
        }
    }
    
    /**
     * 添加数据权限条件
     */
    private String addDataPermission(String sql, User user) {
        // 解析 SQL
        Statement statement = CCJSqlParserUtil.parse(sql);
        
        if (statement instanceof Select) {
            Select select = (Select) statement;
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            
            // 构建权限条件
            Expression permissionExpr = buildPermissionExpression(user);
            
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
        
        return sql;
    }
    
    /**
     * 构建权限表达式
     */
    private Expression buildPermissionExpression(User user) {
        // 根据用户角色构建不同的权限条件
        if (user.isDeptManager()) {
            // 部门经理：只能查看本部门数据
            return new EqualsTo(
                new Column("dept_id"),
                new LongValue(user.getDeptId())
            );
        } else {
            // 普通用户：只能查看自己的数据
            return new EqualsTo(
                new Column("create_by"),
                new LongValue(user.getId())
            );
        }
    }
}
```

### 示例4：SQL 防注入插件

```java
/**
 * SQL 防注入插件
 * 检测并阻止 SQL 注入攻击
 */
@Slf4j
public class SqlInjectionInterceptor implements InnerInterceptor {
    
    /**
     * 危险关键字
     */
    private static final Pattern DANGEROUS_PATTERN = Pattern.compile(
        ".*([';]+|(--)|(/\\*.*\\*/)|" +
        "(\\b(select|update|delete|insert|drop|create|alter|exec|execute|union)\\b))" +
        ".*",
        Pattern.CASE_INSENSITIVE
    );
    
    @Override
    public void beforeQuery(Executor executor, 
                           MappedStatement ms, 
                           Object parameter, 
                           RowBounds rowBounds, 
                           ResultHandler resultHandler, 
                           BoundSql boundSql) throws SQLException {
        
        // 检查参数
        if (parameter != null) {
            checkParameter(parameter);
        }
    }
    
    /**
     * 检查参数是否包含 SQL 注入
     */
    private void checkParameter(Object parameter) {
        if (parameter instanceof String) {
            String value = (String) parameter;
            if (containsSqlInjection(value)) {
                log.error("检测到SQL注入攻击: {}", value);
                throw new BusinessException("非法参数");
            }
        } else if (parameter instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) parameter;
            for (Object value : map.values()) {
                checkParameter(value);
            }
        } else {
            // 检查实体类字段
            Field[] fields = parameter.getClass().getDeclaredFields();
            for (Field field : fields) {
                try {
                    field.setAccessible(true);
                    Object value = field.get(parameter);
                    if (value != null) {
                        checkParameter(value);
                    }
                } catch (IllegalAccessException e) {
                    // 忽略
                }
            }
        }
    }
    
    /**
     * 检查是否包含 SQL 注入
     */
    private boolean containsSqlInjection(String value) {
        return DANGEROUS_PATTERN.matcher(value).matches();
    }
}
```

---

## 插件注册与配置

### 注册自定义插件

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 1. SQL 防注入插件（最先执行）
        interceptor.addInnerInterceptor(new SqlInjectionInterceptor());
        
        // 2. 数据权限插件
        interceptor.addInnerInterceptor(new DataPermissionInterceptor());
        
        // 3. 多租户插件
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor());
        
        // 4. 分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        
        // 5. SQL 日志插件
        interceptor.addInnerInterceptor(new SqlLogInterceptor());
        
        // 6. 数据脱敏插件（最后执行）
        interceptor.addInnerInterceptor(new DataMaskingInterceptor());
        
        return interceptor;
    }
}
```

---

## 插件执行顺序与性能

### 执行顺序控制

```java
/**
 * 插件执行顺序
 */
public class InterceptorOrder {
    
    // 安全检查类（最先执行）
    public static final int SQL_INJECTION = 100;
    
    // SQL 改写类
    public static final int DATA_PERMISSION = 200;
    public static final int TENANT_LINE = 300;
    public static final int DYNAMIC_TABLE_NAME = 400;
    
    // 功能增强类
    public static final int PAGINATION = 500;
    public static final int OPTIMISTIC_LOCKER = 600;
    
    // 监控日志类
    public static final int SQL_LOG = 700;
    
    // 结果处理类（最后执行）
    public static final int DATA_MASKING = 800;
    public static final int BLOCK_ATTACK = 900;
}
```

### 性能优化

```java
/**
 * 高性能插件示例
 */
public class PerformanceOptimizedInterceptor implements InnerInterceptor {
    
    /**
     * 使用缓存减少重复计算
     */
    private final Cache<String, String> sqlCache = CacheBuilder.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(1, TimeUnit.HOURS)
        .build();
    
    @Override
    public void beforeQuery(Executor executor, 
                           MappedStatement ms, 
                           Object parameter, 
                           RowBounds rowBounds, 
                           ResultHandler resultHandler, 
                           BoundSql boundSql) throws SQLException {
        
        String originalSql = boundSql.getSql();
        
        // 从缓存获取处理后的 SQL
        String cachedSql = sqlCache.getIfPresent(originalSql);
        
        if (cachedSql != null) {
            // 缓存命中，直接使用
            replaceSql(boundSql, cachedSql);
            return;
        }
        
        // 缓存未命中，处理 SQL
        String newSql = processSql(originalSql);
        
        // 存入缓存
        sqlCache.put(originalSql, newSql);
        
        // 替换 SQL
        replaceSql(boundSql, newSql);
    }
    
    private String processSql(String sql) {
        // 处理 SQL 的逻辑
        return sql;
    }
    
    private void replaceSql(BoundSql boundSql, String newSql) {
        try {
            Field field = boundSql.getClass().getDeclaredField("sql");
            field.setAccessible(true);
            field.set(boundSql, newSql);
        } catch (Exception e) {
            throw new RuntimeException("替换SQL失败", e);
        }
    }
}
```

---

## 实战案例：审计日志插件

```java
/**
 * 审计日志插件
 * 记录所有数据变更操作
 */
@Slf4j
@Component
public class AuditLogInterceptor implements InnerInterceptor {
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Override
    public void beforeUpdate(Executor executor, 
                            MappedStatement ms, 
                            Object parameter) throws SQLException {
        
        // 获取当前用户
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            return;
        }
        
        // 获取 SQL 类型
        SqlCommandType sqlCommandType = ms.getSqlCommandType();
        
        if (sqlCommandType == SqlCommandType.INSERT ||
            sqlCommandType == SqlCommandType.UPDATE ||
            sqlCommandType == SqlCommandType.DELETE) {
            
            // 记录审计日志
            AuditLog auditLog = new AuditLog();
            auditLog.setUserId(currentUser.getId());
            auditLog.setUsername(currentUser.getUsername());
            auditLog.setOperation(sqlCommandType.name());
            auditLog.setTableName(getTableName(ms));
            auditLog.setOperationTime(LocalDateTime.now());
            auditLog.setIpAddress(getClientIp());
            
            // 记录变更前后的数据
            if (parameter != null) {
                auditLog.setBeforeData(JSON.toJSONString(getBeforeData(parameter)));
                auditLog.setAfterData(JSON.toJSONString(parameter));
            }
            
            // 异步保存审计日志
            auditLogService.saveAsync(auditLog);
        }
    }
    
    private String getTableName(MappedStatement ms) {
        // 从 MappedStatement 解析表名
        String id = ms.getId();
        String className = id.substring(0, id.lastIndexOf("."));
        
        try {
            Class<?> clazz = Class.forName(className);
            TableName tableNameAnnotation = clazz.getAnnotation(TableName.class);
            if (tableNameAnnotation != null) {
                return tableNameAnnotation.value();
            }
        } catch (ClassNotFoundException e) {
            // 忽略
        }
        
        return "unknown";
    }
    
    private Object getBeforeData(Object parameter) {
        // 根据主键查询变更前的数据
        // 这里简化处理，实际需要根据具体情况实现
        return null;
    }
    
    private String getClientIp() {
        // 获取客户端 IP
        return RequestContextHolder.getRequestAttributes() != null
            ? ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                .getRequest().getRemoteAddr()
            : "unknown";
    }
}
```

---

## 关键点总结

1. **拦截器原理**：基于 MyBatis 四大拦截点（Executor、StatementHandler、ParameterHandler、ResultSetHandler）
2. **InnerInterceptor**：MyBatis Plus 提供的内部拦截器接口，更简洁
3. **SQL 改写**：通过反射修改 BoundSql 的 sql 字段
4. **执行顺序**：按添加顺序执行，注意合理安排
5. **性能优化**：使用缓存、避免重复计算、异步处理
6. **实战应用**：SQL 日志、数据脱敏、数据权限、审计日志等

---

## 参考资料

- [MyBatis 插件原理](https://mybatis.org/mybatis-3/zh/configuration.html#plugins)
- [自定义插件](https://baomidou.com/pages/2976a3/#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8F%92%E4%BB%B6)

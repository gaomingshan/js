# Spring JDBC 源码指引

> spring-jdbc 简化 JDBC 编程，提供模板类、统一异常体系、结果集映射等功能。

---

## 1. JDBC 操作模板（JdbcTemplate）

### 核心类
- **JdbcTemplate** - JDBC 模板类（核心）
- **JdbcOperations** - JDBC 操作接口
- **NamedParameterJdbcTemplate** - 命名参数 JDBC 模板
- **NamedParameterJdbcOperations** - 命名参数操作接口

### 设计目的
封装 JDBC 样板代码（获取连接、创建 Statement、处理异常、释放资源），提供简洁的 API。

### 使用限制与风险
- JdbcTemplate 是线程安全的，可单例使用
- 不支持 ORM 映射，仅适合简单查询和更新
- 复杂 SQL 建议使用 MyBatis 等 ORM 框架

---

## 2. 命名参数支持（NamedParameterJdbcTemplate）

### 核心类
- **NamedParameterJdbcTemplate** - 命名参数模板
- **SqlParameterSource** - SQL 参数源接口
- **MapSqlParameterSource** - Map 参数源
- **BeanPropertySqlParameterSource** - Bean 属性参数源
- **EmptySqlParameterSource** - 空参数源

### 命名参数语法
```sql
SELECT * FROM user WHERE id = :id AND name = :name
```

### 使用示例
```java
Map<String, Object> params = new HashMap<>();
params.put("id", 1);
params.put("name", "John");
namedParameterJdbcTemplate.queryForObject(sql, params, rowMapper);
```

### 设计目的
使用命名参数代替 `?` 占位符，提升 SQL 可读性和可维护性。

### 使用限制与风险
- 底层会转换为 JDBC 的 `?` 占位符
- 参数名大小写敏感

---

## 3. 统一异常体系（DataAccessException）

### 核心异常
- **DataAccessException** - 数据访问异常基类（非检查异常）
- **DataAccessResourceFailureException** - 数据访问资源失败
- **DataIntegrityViolationException** - 数据完整性违反（如主键冲突）
- **DuplicateKeyException** - 重复键异常
- **EmptyResultDataAccessException** - 空结果异常
- **IncorrectResultSizeDataAccessException** - 结果集大小不正确
- **BadSqlGrammarException** - SQL 语法错误
- **CannotGetJdbcConnectionException** - 无法获取 JDBC 连接

### 异常转换器
- **SQLExceptionTranslator** - SQL 异常转换器接口
- **SQLErrorCodeSQLExceptionTranslator** - 基于错误码的转换器（默认）
- **SQLStateSQLExceptionTranslator** - 基于 SQL 状态码的转换器

### 设计目的
将数据库特定的 SQLException 转换为 Spring 统一的异常体系，屏蔽数据库差异。

### 使用限制与风险
- 基于 `sql-error-codes.xml` 配置文件（内置支持主流数据库）
- 自定义数据库需配置错误码映射
- 所有异常都是非检查异常，需注意异常处理

---

## 4. 批量操作（BatchUpdate）

### 批量更新
```java
jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
    public void setValues(PreparedStatement ps, int i) throws SQLException {
        ps.setString(1, users.get(i).getName());
        ps.setInt(2, users.get(i).getAge());
    }
    
    public int getBatchSize() {
        return users.size();
    }
});
```

### 命名参数批量更新
```java
SqlParameterSource[] batch = SqlParameterSourceUtils.createBatch(users);
namedParameterJdbcTemplate.batchUpdate(sql, batch);
```

### 设计目的
减少数据库往返次数，提升批量操作性能。

### 使用限制与风险
- 批量大小需控制（避免内存溢出）
- 部分数据库有批量大小限制（如 Oracle）
- 批量操作失败通常全部回滚（需配合事务）

---

## 5. 存储过程支持（SimpleJdbcCall）

### 核心类
- **SimpleJdbcCall** - 简化存储过程调用
- **SimpleJdbcInsert** - 简化插入操作（支持主键回填）
- **StoredProcedure** - 存储过程抽象基类

### 使用示例
```java
SimpleJdbcCall jdbcCall = new SimpleJdbcCall(dataSource)
    .withProcedureName("getUserById");
    
Map<String, Object> result = jdbcCall.execute(Collections.singletonMap("id", 1));
```

### 设计目的
简化存储过程和函数的调用，自动读取元数据。

### 使用限制与风险
- 依赖数据库元数据（DatabaseMetaData）
- 元数据读取有性能开销，建议缓存
- 不同数据库存储过程语法差异大

---

## 6. 结果集映射（RowMapper、ResultSetExtractor）

### 核心接口
- **RowMapper<T>** - 行映射器（单行 -> 对象）
- **ResultSetExtractor<T>** - 结果集提取器（多行 -> 对象）
- **RowCallbackHandler** - 行回调处理器（无返回值）

### RowMapper 示例
```java
RowMapper<User> rowMapper = (rs, rowNum) -> {
    User user = new User();
    user.setId(rs.getLong("id"));
    user.setName(rs.getString("name"));
    return user;
};
```

### ResultSetExtractor 示例
```java
ResultSetExtractor<Map<Long, User>> extractor = rs -> {
    Map<Long, User> map = new HashMap<>();
    while (rs.next()) {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setName(rs.getString("name"));
        map.put(user.getId(), user);
    }
    return map;
};
```

### 内置映射器
- **BeanPropertyRowMapper** - Bean 属性映射器（根据列名自动映射）
- **ColumnMapRowMapper** - 列 Map 映射器（列名 -> 值）
- **SingleColumnRowMapper** - 单列映射器

### 设计目的
抽象结果集到对象的映射逻辑，支持自定义映射策略。

### 使用限制与风险
- RowMapper 每行调用一次，适合简单映射
- ResultSetExtractor 处理整个 ResultSet，适合复杂聚合
- BeanPropertyRowMapper 基于列名匹配，需注意命名规范（下划线 -> 驼峰）

---

## 7. SQL 脚本执行（ScriptUtils）

### 核心类
- **ScriptUtils** - SQL 脚本工具类
- **ResourceDatabasePopulator** - 资源数据库填充器
- **DatabasePopulator** - 数据库填充器接口

### 使用示例
```java
Resource resource = new ClassPathResource("schema.sql");
ScriptUtils.executeSqlScript(connection, resource);
```

或使用 ResourceDatabasePopulator：
```java
ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
populator.addScript(new ClassPathResource("schema.sql"));
populator.addScript(new ClassPathResource("data.sql"));
populator.populate(dataSource.getConnection());
```

### 设计目的
执行 SQL 脚本文件，用于数据库初始化、测试数据准备等场景。

### 使用限制与风险
- 脚本需处理不同数据库的 SQL 方言差异
- 大脚本执行需注意内存和事务管理
- 生产环境慎用（建议使用 Flyway 或 Liquibase）

---

## 8. LOB 处理（LobHandler）

### 核心接口
- **LobHandler** - LOB 处理器接口
- **LobCreator** - LOB 创建器接口

### 核心实现
- **DefaultLobHandler** - 默认 LOB 处理器
- **OracleLobHandler** - Oracle LOB 处理器（已废弃，Oracle 10g+ 使用默认）

### 使用示例
```java
LobHandler lobHandler = new DefaultLobHandler();
jdbcTemplate.update(sql, new AbstractLobCreatingPreparedStatementCallback(lobHandler) {
    protected void setValues(PreparedStatement ps, LobCreator lobCreator) throws SQLException {
        ps.setInt(1, id);
        lobCreator.setBlobAsBytes(ps, 2, imageBytes);
        lobCreator.setClobAsString(ps, 3, content);
    }
});
```

### 设计目的
简化 BLOB/CLOB 的读写操作，屏蔽数据库差异。

### 使用限制与风险
- LOB 读写性能开销大
- 需注意事务和连接管理
- 大 LOB 可能导致内存溢出

---

## 9. 数据源管理（DataSource 抽象）

### 核心接口
- **DataSource** - JDK 标准数据源接口
- **SmartDataSource** - 智能数据源接口（支持是否需要关闭连接）
- **ConnectionHandle** - 连接句柄接口

### 核心实现
- **DriverManagerDataSource** - 基于 DriverManager 的数据源（无连接池）
- **SingleConnectionDataSource** - 单连接数据源（测试用）
- **TransactionAwareDataSourceProxy** - 事务感知数据源代理
- **DelegatingDataSource** - 委托数据源
- **LazyConnectionDataSourceProxy** - 懒加载连接数据源代理
- **IsolationLevelDataSourceRouter** - 隔离级别路由数据源

### 设计目的
提供数据源抽象和工具类，支持事务、懒加载、路由等高级功能。

### 使用限制与风险
- DriverManagerDataSource 无连接池，仅用于测试
- 生产环境使用 HikariCP、Druid 等连接池
- TransactionAwareDataSourceProxy 支持在非 Spring 管理的代码中获取事务连接

---

## 10. 嵌入式数据库支持（EmbeddedDatabase）

### 核心接口
- **EmbeddedDatabase** - 嵌入式数据库接口（继承 DataSource）
- **EmbeddedDatabaseConfigurer** - 嵌入式数据库配置器

### 核心类
- **EmbeddedDatabaseBuilder** - 嵌入式数据库构建器
- **EmbeddedDatabaseFactory** - 嵌入式数据库工厂

### 支持的数据库
- **H2** - 最常用
- **HSQL** - HyperSQL
- **Derby** - Apache Derby

### 使用示例
```java
EmbeddedDatabase db = new EmbeddedDatabaseBuilder()
    .setType(EmbeddedDatabaseType.H2)
    .addScript("schema.sql")
    .addScript("data.sql")
    .build();
```

### 设计目的
快速创建嵌入式数据库，用于测试和原型开发。

### 使用限制与风险
- 仅用于开发和测试，生产环境使用独立数据库
- 数据库文件默认存储在内存，重启丢失
- 性能不如独立数据库

---

## 11. JDBC 回调接口

### 核心接口
- **PreparedStatementCreator** - 创建 PreparedStatement
- **PreparedStatementSetter** - 设置 PreparedStatement 参数
- **CallableStatementCreator** - 创建 CallableStatement
- **CallableStatementCallback** - CallableStatement 回调
- **ConnectionCallback** - Connection 回调
- **StatementCallback** - Statement 回调

### 设计目的
提供细粒度的 JDBC 操作回调接口，支持自定义逻辑。

### 使用限制与风险
- 大部分场景使用 JdbcTemplate 的高层方法即可
- 回调接口适合需要精确控制 JDBC 行为的场景

---

## 12. 主键生成与回填

### SimpleJdbcInsert
```java
SimpleJdbcInsert jdbcInsert = new SimpleJdbcInsert(dataSource)
    .withTableName("user")
    .usingGeneratedKeyColumns("id");
    
Map<String, Object> parameters = new HashMap<>();
parameters.put("name", "John");
Number newId = jdbcInsert.executeAndReturnKey(parameters);
```

### KeyHolder
```java
KeyHolder keyHolder = new GeneratedKeyHolder();
jdbcTemplate.update(new PreparedStatementCreator() {
    public PreparedStatement createPreparedStatement(Connection con) throws SQLException {
        PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        ps.setString(1, "John");
        return ps;
    }
}, keyHolder);
Number newId = keyHolder.getKey();
```

### 设计目的
获取数据库自动生成的主键值（自增主键）。

### 使用限制与风险
- 依赖数据库的 RETURN_GENERATED_KEYS 支持
- 批量插入时回填逻辑更复杂

---

## 13. 数据库元数据访问

### 核心类
- **JdbcUtils** - JDBC 工具类
  - `extractDatabaseMetaData()` - 提取数据库元数据
  - `closeConnection()` - 关闭连接
  - `closeStatement()` - 关闭 Statement
  - `closeResultSet()` - 关闭 ResultSet

### 设计目的
简化 JDBC 资源管理和元数据访问。

### 使用限制与风险
- JdbcTemplate 已自动管理资源，无需手动关闭
- 元数据访问有性能开销

---

## 📚 总结

spring-jdbc 简化了 JDBC 编程：
- **JdbcTemplate**：封装样板代码，提供简洁 API
- **NamedParameterJdbcTemplate**：命名参数支持
- **统一异常**：DataAccessException 屏蔽数据库差异
- **批量操作**：batchUpdate 提升性能
- **存储过程**：SimpleJdbcCall/SimpleJdbcInsert 简化调用
- **结果集映射**：RowMapper/ResultSetExtractor 灵活映射
- **SQL 脚本**：ScriptUtils 执行脚本文件
- **LOB 处理**：LobHandler 简化 BLOB/CLOB 操作
- **嵌入式数据库**：H2/HSQL/Derby 测试支持

spring-jdbc 适合简单的数据访问场景，复杂 ORM 需求建议使用 JPA 或 MyBatis。

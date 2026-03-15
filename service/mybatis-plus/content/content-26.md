# 13.1 批量操作优化

## 概述

批量操作是提升数据库性能的重要手段。相比逐条执行，批量操作可以显著减少网络开销和数据库交互次数。本节介绍 MyBatis Plus 中批量操作的优化技巧。

**核心内容：**
- saveBatch 原理与优化
- 批量插入性能对比
- 批量更新策略
- 批量删除优化

---

## saveBatch 原理

### 默认实现

```java
// IService 接口的 saveBatch 方法
default boolean saveBatch(Collection<T> entityList, int batchSize) {
    String sqlStatement = getSqlStatement(SqlMethod.INSERT_ONE);
    
    return executeBatch(entityList, batchSize, (sqlSession, entity) -> {
        sqlSession.insert(sqlStatement, entity);
    });
}

// 实际执行
protected <E> boolean executeBatch(Collection<E> list, int batchSize, 
                                    BiConsumer<SqlSession, E> consumer) {
    // 分批处理
    return SqlHelper.executeBatch(this.entityClass, this.log, list, batchSize, consumer);
}
```

### 执行流程

```
saveBatch(1000条数据, batchSize=500)
↓
分成2批执行
↓
第1批：500条 → 逐条 INSERT（500次网络交互）
第2批：500条 → 逐条 INSERT（500次网络交互）
↓
总计：1000次 INSERT 语句
```

**问题：** 虽然叫 `saveBatch`，但实际是逐条插入，只是分批提交事务。

---

## 批量插入优化

### 方案1：JDBC 批处理

```java
/**
 * 使用 JDBC 批处理（需要修改数据库连接配置）
 */
// application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test?rewriteBatchedStatements=true
    # rewriteBatchedStatements=true 启用批处理重写

// 使用 saveBatch
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 批量插入（启用 JDBC 批处理后性能提升）
     */
    public boolean batchInsert(List<User> users) {
        return saveBatch(users, 1000);
    }
}

// 性能对比
// 不启用 rewriteBatchedStatements：1000条约2000ms
// 启用 rewriteBatchedStatements：1000条约200ms（提升10倍）
```

### 方案2：自定义批量插入 SQL

```java
/**
 * 自定义批量插入方法
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 批量插入（单条 SQL）
     */
    @Insert("<script>" +
            "INSERT INTO user (id, name, age, email) VALUES " +
            "<foreach collection='list' item='item' separator=','>" +
            "(#{item.id}, #{item.name}, #{item.age}, #{item.email})" +
            "</foreach>" +
            "</script>")
    int insertBatch(@Param("list") List<User> users);
}

// 使用
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 批量插入（单条 SQL）
     */
    public boolean batchInsert(List<User> users) {
        if (CollectionUtils.isEmpty(users)) {
            return true;
        }
        
        // 分批插入（每批500条，避免 SQL 过长）
        int batchSize = 500;
        for (int i = 0; i < users.size(); i += batchSize) {
            int end = Math.min(i + batchSize, users.size());
            List<User> batch = users.subList(i, end);
            baseMapper.insertBatch(batch);
        }
        
        return true;
    }
}

// 性能对比
// saveBatch(1000条)：约2000ms
// insertBatch(1000条)：约50ms（提升40倍）
```

### 方案3：使用 InsertBatchSomeColumn

```java
/**
 * 使用自定义 SQL 注入器的批量插入方法
 */
// 1. 实现批量插入方法
public class InsertBatchSomeColumn extends AbstractMethod {
    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, 
                                                  Class<?> modelClass, 
                                                  TableInfo tableInfo) {
        // SQL 实现（见第11.2节）
        // ...
    }
}

// 2. 注册到 SQL 注入器
@Configuration
public class MybatisPlusConfig {
    @Bean
    public ISqlInjector sqlInjector() {
        return new CustomSqlInjector();
    }
}

// 3. 使用
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    public boolean batchInsert(List<User> users) {
        return baseMapper.insertBatchSomeColumn(users) > 0;
    }
}
```

---

## 批量更新优化

### 问题：updateBatchById 性能差

```java
// updateBatchById 源码
default boolean updateBatchById(Collection<T> entityList, int batchSize) {
    String sqlStatement = getSqlStatement(SqlMethod.UPDATE_BY_ID);
    
    return executeBatch(entityList, batchSize, (sqlSession, entity) -> {
        // 逐条执行 UPDATE
        sqlSession.update(sqlStatement, entity);
    });
}

// 实际执行：1000次 UPDATE 语句
// UPDATE user SET name=?, age=? WHERE id=1
// UPDATE user SET name=?, age=? WHERE id=2
// ...
// UPDATE user SET name=?, age=? WHERE id=1000
```

### 方案1：CASE WHEN 批量更新

```java
/**
 * 使用 CASE WHEN 实现批量更新
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 批量更新（CASE WHEN）
     */
    @Update("<script>" +
            "UPDATE user SET " +
            "name = CASE id " +
            "<foreach collection='list' item='item'>" +
            "WHEN #{item.id} THEN #{item.name} " +
            "</foreach>" +
            "END, " +
            "age = CASE id " +
            "<foreach collection='list' item='item'>" +
            "WHEN #{item.id} THEN #{item.age} " +
            "</foreach>" +
            "END " +
            "WHERE id IN " +
            "<foreach collection='list' item='item' open='(' separator=',' close=')'>" +
            "#{item.id}" +
            "</foreach>" +
            "</script>")
    int updateBatchByIds(@Param("list") List<User> users);
}

// 生成的 SQL
// UPDATE user SET
//   name = CASE id
//     WHEN 1 THEN 'name1'
//     WHEN 2 THEN 'name2'
//     ...
//   END,
//   age = CASE id
//     WHEN 1 THEN 18
//     WHEN 2 THEN 20
//     ...
//   END
// WHERE id IN (1, 2, ...)

// 性能对比
// updateBatchById(1000条)：约2000ms
// updateBatchByIds(1000条)：约100ms（提升20倍）
```

### 方案2：逐条更新（多语句）

```java
/**
 * MySQL 多语句执行
 */
// 1. 开启多语句支持
// application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test?allowMultiQueries=true

// 2. Mapper 方法
@Update("<script>" +
        "<foreach collection='list' item='item' separator=';'>" +
        "UPDATE user " +
        "SET name = #{item.name}, age = #{item.age} " +
        "WHERE id = #{item.id}" +
        "</foreach>" +
        "</script>")
int updateBatch(@Param("list") List<User> users);

// 生成的 SQL（一次发送多条 UPDATE）
// UPDATE user SET name='name1', age=18 WHERE id=1;
// UPDATE user SET name='name2', age=20 WHERE id=2;
// ...
```

---

## 批量删除优化

### 使用 IN 批量删除

```java
/**
 * 批量删除（IN 语句）
 */
// MyBatis Plus 内置方法
public boolean deleteBatch(List<Long> ids) {
    return removeByIds(ids);
}

// 执行的 SQL
// DELETE FROM user WHERE id IN (1, 2, 3, ..., 1000)

// 注意：IN 列表过长可能导致性能问题
// 建议：每批不超过 1000 个 ID
public boolean deleteBatchSafe(List<Long> ids) {
    int batchSize = 1000;
    for (int i = 0; i < ids.size(); i += batchSize) {
        int end = Math.min(i + batchSize, ids.size());
        List<Long> batch = ids.subList(i, end);
        removeByIds(batch);
    }
    return true;
}
```

---

## 性能对比测试

### 测试代码

```java
@SpringBootTest
public class BatchPerformanceTest {
    
    @Autowired
    private UserService userService;
    
    /**
     * 批量插入性能测试
     */
    @Test
    public void testBatchInsert() {
        int count = 10000;
        List<User> users = prepareData(count);
        
        // 方式1：逐条插入
        long start1 = System.currentTimeMillis();
        users.forEach(user -> userService.save(user));
        long end1 = System.currentTimeMillis();
        System.out.println("逐条插入：" + (end1 - start1) + "ms");  // 约20000ms
        
        // 方式2：saveBatch（未启用 rewriteBatchedStatements）
        long start2 = System.currentTimeMillis();
        userService.saveBatch(users);
        long end2 = System.currentTimeMillis();
        System.out.println("saveBatch：" + (end2 - start2) + "ms");  // 约10000ms
        
        // 方式3：saveBatch（启用 rewriteBatchedStatements）
        long start3 = System.currentTimeMillis();
        userService.saveBatch(users);
        long end3 = System.currentTimeMillis();
        System.out.println("saveBatch+批处理：" + (end3 - start3) + "ms");  // 约1000ms
        
        // 方式4：自定义批量插入
        long start4 = System.currentTimeMillis();
        userService.batchInsert(users);
        long end4 = System.currentTimeMillis();
        System.out.println("批量插入SQL：" + (end4 - start4) + "ms");  // 约500ms
    }
    
    /**
     * 批量更新性能测试
     */
    @Test
    public void testBatchUpdate() {
        int count = 1000;
        List<User> users = userService.list().subList(0, count);
        
        // 修改数据
        users.forEach(user -> {
            user.setName("Updated_" + user.getId());
            user.setAge(user.getAge() + 1);
        });
        
        // 方式1：updateBatchById
        long start1 = System.currentTimeMillis();
        userService.updateBatchById(users);
        long end1 = System.currentTimeMillis();
        System.out.println("updateBatchById：" + (end1 - start1) + "ms");  // 约2000ms
        
        // 方式2：CASE WHEN 批量更新
        long start2 = System.currentTimeMillis();
        userMapper.updateBatchByIds(users);
        long end2 = System.currentTimeMillis();
        System.out.println("CASE WHEN更新：" + (end2 - start2) + "ms");  // 约100ms
    }
}
```

### 性能对比表

| 操作类型 | 数据量 | 逐条操作 | saveBatch | saveBatch+批处理 | 批量SQL |
|---------|-------|---------|-----------|----------------|---------|
| 插入 | 10000 | 20000ms | 10000ms | 1000ms | 500ms |
| 更新 | 1000 | 2000ms | 2000ms | 400ms | 100ms |
| 删除 | 1000 | 1000ms | 100ms | 100ms | 100ms |

---

## 最佳实践

### 1. 批量插入建议

```java
/**
 * 批量插入最佳实践
 */
@Service
public class BatchInsertService {
    
    /**
     * 推荐：自定义批量插入 + 分批处理
     */
    public boolean batchInsert(List<User> users) {
        if (CollectionUtils.isEmpty(users)) {
            return true;
        }
        
        // 每批500条（平衡性能和SQL长度）
        int batchSize = 500;
        
        for (int i = 0; i < users.size(); i += batchSize) {
            int end = Math.min(i + batchSize, users.size());
            List<User> batch = users.subList(i, end);
            
            // 使用自定义批量插入方法
            userMapper.insertBatch(batch);
        }
        
        return true;
    }
}
```

### 2. 批量更新建议

```java
/**
 * 批量更新最佳实践
 */
@Service
public class BatchUpdateService {
    
    /**
     * 方案选择
     */
    public boolean batchUpdate(List<User> users) {
        // 数据量小（<100条）：使用 updateBatchById
        if (users.size() < 100) {
            return userService.updateBatchById(users);
        }
        
        // 数据量大（>=100条）：使用 CASE WHEN
        return userMapper.updateBatchByIds(users) > 0;
    }
}
```

### 3. 事务控制

```java
/**
 * 批量操作事务控制
 */
@Service
public class BatchTransactionService {
    
    /**
     * 大批量操作：分批提交事务
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean batchInsertLarge(List<User> users) {
        // 每10000条提交一次事务
        int commitSize = 10000;
        
        for (int i = 0; i < users.size(); i += commitSize) {
            int end = Math.min(i + commitSize, users.size());
            List<User> batch = users.subList(i, end);
            
            // 批量插入
            batchInsert(batch);
            
            // 手动刷新（如果需要）
            entityManager.flush();
            entityManager.clear();
        }
        
        return true;
    }
}
```

### 4. 异常处理

```java
/**
 * 批量操作异常处理
 */
@Service
public class BatchExceptionService {
    
    /**
     * 批量插入（记录失败数据）
     */
    public BatchResult batchInsertWithErrorLog(List<User> users) {
        List<User> successList = new ArrayList<>();
        List<User> failList = new ArrayList<>();
        
        int batchSize = 500;
        for (int i = 0; i < users.size(); i += batchSize) {
            int end = Math.min(i + batchSize, users.size());
            List<User> batch = users.subList(i, end);
            
            try {
                userMapper.insertBatch(batch);
                successList.addAll(batch);
            } catch (Exception e) {
                log.error("批量插入失败，批次：{}，错误：{}", i / batchSize, e.getMessage());
                failList.addAll(batch);
            }
        }
        
        return new BatchResult(successList.size(), failList);
    }
}

@Data
class BatchResult {
    private int successCount;
    private List<User> failList;
    
    public BatchResult(int successCount, List<User> failList) {
        this.successCount = successCount;
        this.failList = failList;
    }
}
```

---

## 关键点总结

1. **rewriteBatchedStatements**：启用 JDBC 批处理，显著提升性能
2. **自定义批量SQL**：单条 SQL 插入多行，性能最优
3. **CASE WHEN 更新**：批量更新推荐方案
4. **分批处理**：每批500-1000条，平衡性能和资源
5. **事务控制**：大批量操作分批提交事务
6. **异常处理**：记录失败数据，保证数据完整性
7. **性能监控**：定期测试批量操作性能，及时优化

---

## 参考资料

- [批量操作](https://baomidou.com/pages/49cc81/)
- [MySQL 批量插入优化](https://dev.mysql.com/doc/refman/8.0/en/insert-optimization.html)

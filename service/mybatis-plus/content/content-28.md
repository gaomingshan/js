# 13.3 SQL 性能分析

## 概述

SQL 性能分析是定位和解决性能问题的关键手段。MyBatis Plus 提供了性能分析插件，可以统计 SQL 执行时间、分析慢查询。本节介绍 SQL 性能分析的工具和方法。

**核心内容：**
- PerformanceInterceptor 插件
- SQL 执行时间统计
- 慢查询分析
- EXPLAIN 执行计划

---

## PerformanceInterceptor 插件

### 配置性能分析插件

```java
/**
 * 性能分析插件配置
 */
@Configuration
@Profile({"dev", "test"})  // 只在开发和测试环境启用
public class PerformanceConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        // 性能分析插件（已废弃，建议使用 p6spy）
        // interceptor.addInnerInterceptor(new PerformanceInterceptor());
        
        return interceptor;
    }
}
```

**注意：** PerformanceInterceptor 在 MyBatis Plus 3.2.0 后已废弃，推荐使用 p6spy。

---

## 使用 p6spy 分析 SQL

### 引入依赖

```xml
<dependency>
    <groupId>p6spy</groupId>
    <artifactId>p6spy</artifactId>
    <version>3.9.1</version>
</dependency>
```

### 配置数据源

```yaml
# application.yml
spring:
  datasource:
    driver-class-name: com.p6spy.engine.spy.P6SpyDriver
    url: jdbc:p6spy:mysql://localhost:3306/test_db?useUnicode=true&characterEncoding=utf8
    # 原始配置：
    # driver-class-name: com.mysql.cj.jdbc.Driver
    # url: jdbc:mysql://localhost:3306/test_db
```

### spy.properties 配置

```properties
# spy.properties（放在 resources 目录下）

# 使用日志系统来记录 sql
appender=com.p6spy.engine.spy.appender.Slf4JLogger

# 自定义日志打印
logMessageFormat=com.baomidou.mybatisplus.extension.p6spy.P6SpyLogger

# 使用控制台记录 sql
#appender=com.p6spy.engine.spy.appender.StdoutLogger

# 设置 p6spy driver 代理
deregisterdrivers=true

# 取消JDBC URL前缀
useprefix=true

# 配置记录 Log 例外,可去掉的结果集有error,info,batch,debug,statement,commit,rollback,result,resultset
excludecategories=info,debug,result,commit,resultset

# 日期格式
dateformat=yyyy-MM-dd HH:mm:ss

# 实际驱动
driverlist=com.mysql.cj.jdbc.Driver

# 是否开启慢SQL记录
outagedetection=true

# 慢SQL记录标准（秒）
outagedetectioninterval=2
```

### 日志输出

```
# 控制台输出示例
2024-01-01 12:00:00 | took 15ms | statement | connection 0 | 
SELECT id,name,age,email FROM user WHERE age > 18
```

---

## 慢查询日志分析

### 自定义慢查询拦截器

```java
/**
 * 慢查询拦截器
 */
@Slf4j
@Component
public class SlowQueryInterceptor implements InnerInterceptor {
    
    /**
     * 慢查询阈值（毫秒）
     */
    private static final long SLOW_SQL_THRESHOLD = 1000;
    
    @Override
    public void beforeQuery(Executor executor, 
                           MappedStatement ms, 
                           Object parameter, 
                           RowBounds rowBounds, 
                           ResultHandler resultHandler, 
                           BoundSql boundSql) throws SQLException {
        // 记录开始时间
        long startTime = System.currentTimeMillis();
        ThreadLocalHolder.setStartTime(startTime);
    }
    
    @Override
    public void beforePrepare(StatementHandler sh, 
                             Connection connection, 
                             Integer transactionTimeout) {
        long startTime = ThreadLocalHolder.getStartTime();
        long endTime = System.currentTimeMillis();
        long costTime = endTime - startTime;
        
        if (costTime > SLOW_SQL_THRESHOLD) {
            // 记录慢查询
            String sql = sh.getBoundSql().getSql();
            Object params = sh.getParameterHandler().getParameterObject();
            
            log.warn("慢查询警告！执行时间：{}ms，SQL：{}，参数：{}", 
                     costTime, formatSql(sql), params);
            
            // 保存到数据库或发送告警
            saveSlowQueryLog(sql, params, costTime);
        }
        
        ThreadLocalHolder.clear();
    }
    
    private String formatSql(String sql) {
        return sql.replaceAll("\\s+", " ").trim();
    }
    
    private void saveSlowQueryLog(String sql, Object params, long costTime) {
        // 保存慢查询日志到数据库
        SlowQueryLog log = new SlowQueryLog();
        log.setSql(sql);
        log.setParams(JSON.toJSONString(params));
        log.setCostTime(costTime);
        log.setCreateTime(LocalDateTime.now());
        
        slowQueryLogService.save(log);
    }
}

/**
 * ThreadLocal 工具类
 */
class ThreadLocalHolder {
    private static final ThreadLocal<Long> START_TIME = new ThreadLocal<>();
    
    public static void setStartTime(long time) {
        START_TIME.set(time);
    }
    
    public static long getStartTime() {
        return START_TIME.get();
    }
    
    public static void clear() {
        START_TIME.remove();
    }
}
```

### 慢查询日志表

```sql
CREATE TABLE `slow_query_log` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `sql` TEXT NOT NULL COMMENT 'SQL语句',
  `params` TEXT COMMENT '参数',
  `cost_time` BIGINT(20) NOT NULL COMMENT '执行时间（毫秒）',
  `create_time` DATETIME NOT NULL COMMENT '记录时间',
  PRIMARY KEY (`id`),
  KEY `idx_cost_time` (`cost_time`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='慢查询日志';
```

---

## EXPLAIN 执行计划分析

### 使用 EXPLAIN

```java
/**
 * EXPLAIN 分析工具
 */
@Component
public class ExplainAnalyzer {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 分析查询语句
     */
    public List<Map<String, Object>> explain(String sql) {
        String explainSql = "EXPLAIN " + sql;
        return jdbcTemplate.queryForList(explainSql);
    }
    
    /**
     * 分析并打印结果
     */
    public void analyzeQuery(String sql) {
        List<Map<String, Object>> result = explain(sql);
        
        System.out.println("执行计划分析：");
        System.out.println("SQL: " + sql);
        System.out.println();
        
        for (Map<String, Object> row : result) {
            System.out.println("type: " + row.get("type"));
            System.out.println("key: " + row.get("key"));
            System.out.println("rows: " + row.get("rows"));
            System.out.println("Extra: " + row.get("Extra"));
            System.out.println("---");
        }
    }
}
```

### EXPLAIN 关键字段解读

```java
/**
 * EXPLAIN 结果分析
 */
public class ExplainResult {
    
    /**
     * type 字段（访问类型，性能从好到坏）
     */
    public enum Type {
        SYSTEM,      // 表只有一行
        CONST,       // 通过索引一次就找到
        EQ_REF,      // 唯一索引扫描
        REF,         // 非唯一索引扫描
        RANGE,       // 索引范围扫描
        INDEX,       // 全索引扫描
        ALL          // 全表扫描（最差）
    }
    
    /**
     * Extra 字段（额外信息）
     */
    public class Extra {
        // Using index：使用覆盖索引
        // Using where：使用 WHERE 过滤
        // Using temporary：使用临时表
        // Using filesort：使用文件排序
        // Using index condition：使用索引条件下推
    }
}
```

### 示例分析

```sql
-- 示例1：全表扫描（差）
EXPLAIN SELECT * FROM user WHERE name LIKE '%test%';
-- type: ALL
-- key: NULL
-- rows: 100000
-- Extra: Using where

-- 示例2：使用索引（好）
EXPLAIN SELECT * FROM user WHERE name = 'test';
-- type: ref
-- key: idx_name
-- rows: 10
-- Extra: Using index condition

-- 示例3：覆盖索引（最好）
EXPLAIN SELECT id, name FROM user WHERE name = 'test';
-- type: ref
-- key: idx_name
-- rows: 10
-- Extra: Using index
```

---

## SQL 性能监控

### 实时监控

```java
/**
 * SQL 性能监控服务
 */
@Service
public class SqlMonitorService {
    
    private final ConcurrentHashMap<String, SqlStatistics> sqlStats = new ConcurrentHashMap<>();
    
    /**
     * 记录 SQL 执行
     */
    public void recordSql(String sql, long costTime) {
        String sqlKey = getSqlKey(sql);
        
        sqlStats.compute(sqlKey, (key, stats) -> {
            if (stats == null) {
                stats = new SqlStatistics(sql);
            }
            stats.addExecution(costTime);
            return stats;
        });
    }
    
    /**
     * 获取统计信息
     */
    public List<SqlStatistics> getTopSlowSql(int limit) {
        return sqlStats.values().stream()
            .sorted(Comparator.comparingLong(SqlStatistics::getAvgTime).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    /**
     * 获取 SQL 键（去除参数）
     */
    private String getSqlKey(String sql) {
        return sql.replaceAll("\\?", "")
                  .replaceAll("\\s+", " ")
                  .trim();
    }
}

/**
 * SQL 统计信息
 */
@Data
class SqlStatistics {
    private String sql;
    private long count;
    private long totalTime;
    private long maxTime;
    private long minTime;
    
    public SqlStatistics(String sql) {
        this.sql = sql;
        this.count = 0;
        this.totalTime = 0;
        this.maxTime = 0;
        this.minTime = Long.MAX_VALUE;
    }
    
    public void addExecution(long costTime) {
        this.count++;
        this.totalTime += costTime;
        this.maxTime = Math.max(this.maxTime, costTime);
        this.minTime = Math.min(this.minTime, costTime);
    }
    
    public long getAvgTime() {
        return count == 0 ? 0 : totalTime / count;
    }
}
```

### 监控接口

```java
/**
 * SQL 监控接口
 */
@RestController
@RequestMapping("/monitor/sql")
public class SqlMonitorController {
    
    @Autowired
    private SqlMonitorService sqlMonitorService;
    
    /**
     * 获取最慢的 SQL（Top 10）
     */
    @GetMapping("/top-slow")
    public Result<List<SqlStatistics>> getTopSlowSql() {
        List<SqlStatistics> stats = sqlMonitorService.getTopSlowSql(10);
        return Result.success(stats);
    }
}
```

---

## 性能分析最佳实践

### 1. 定期分析慢查询

```java
/**
 * 定时任务：分析慢查询
 */
@Component
public class SlowQueryAnalyzer {
    
    @Autowired
    private SlowQueryLogService slowQueryLogService;
    
    /**
     * 每天凌晨分析前一天的慢查询
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void analyzeDailySlowQuery() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        
        // 查询前一天的慢查询
        List<SlowQueryLog> logs = slowQueryLogService.listByDate(yesterday);
        
        // 分析统计
        Map<String, Long> sqlCount = logs.stream()
            .collect(Collectors.groupingBy(
                SlowQueryLog::getSql,
                Collectors.counting()
            ));
        
        // 找出出现次数最多的慢查询
        List<Map.Entry<String, Long>> topSql = sqlCount.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .collect(Collectors.toList());
        
        // 生成报告
        generateReport(topSql);
        
        log.info("慢查询分析完成，共{}条，Top10已生成报告", logs.size());
    }
    
    private void generateReport(List<Map.Entry<String, Long>> topSql) {
        StringBuilder report = new StringBuilder();
        report.append("慢查询Top10：\n");
        
        int rank = 1;
        for (Map.Entry<String, Long> entry : topSql) {
            report.append(rank++).append(". ")
                  .append("SQL: ").append(entry.getKey())
                  .append(", 出现次数: ").append(entry.getValue())
                  .append("\n");
        }
        
        // 发送邮件或保存到文件
        log.warn(report.toString());
    }
}
```

### 2. SQL 审核

```java
/**
 * SQL 审核工具
 */
@Component
public class SqlAuditor {
    
    /**
     * 审核 SQL 是否符合规范
     */
    public AuditResult audit(String sql) {
        List<String> issues = new ArrayList<>();
        
        // 1. 检查是否使用 SELECT *
        if (sql.toUpperCase().contains("SELECT *")) {
            issues.add("不建议使用 SELECT *，请指定具体字段");
        }
        
        // 2. 检查是否有 WHERE 条件
        if (sql.toUpperCase().contains("UPDATE") || 
            sql.toUpperCase().contains("DELETE")) {
            if (!sql.toUpperCase().contains("WHERE")) {
                issues.add("UPDATE/DELETE 必须带 WHERE 条件");
            }
        }
        
        // 3. 检查是否使用 LIMIT
        if (sql.toUpperCase().contains("SELECT") && 
            !sql.toUpperCase().contains("LIMIT")) {
            issues.add("建议使用 LIMIT 限制返回结果数量");
        }
        
        // 4. 检查是否使用左模糊
        if (sql.contains("LIKE '%")) {
            issues.add("不建议使用左模糊查询，索引失效");
        }
        
        return new AuditResult(issues.isEmpty(), issues);
    }
}

@Data
class AuditResult {
    private boolean pass;
    private List<String> issues;
    
    public AuditResult(boolean pass, List<String> issues) {
        this.pass = pass;
        this.issues = issues;
    }
}
```

### 3. 性能基准测试

```java
/**
 * 性能基准测试
 */
@SpringBootTest
public class PerformanceBenchmark {
    
    @Autowired
    private UserService userService;
    
    /**
     * 基准测试：查询性能
     */
    @Test
    public void benchmarkQuery() {
        int warmupRounds = 100;
        int testRounds = 1000;
        
        // 预热
        for (int i = 0; i < warmupRounds; i++) {
            userService.getById(1L);
        }
        
        // 测试
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < testRounds; i++) {
            userService.getById(1L);
        }
        long endTime = System.currentTimeMillis();
        
        long totalTime = endTime - startTime;
        double avgTime = (double) totalTime / testRounds;
        
        System.out.println("总时间：" + totalTime + "ms");
        System.out.println("平均时间：" + avgTime + "ms");
        System.out.println("QPS：" + (testRounds * 1000 / totalTime));
    }
}
```

---

## 关键点总结

1. **p6spy**：生产环境推荐的 SQL 分析工具
2. **慢查询日志**：记录超过阈值的 SQL，定期分析优化
3. **EXPLAIN**：分析执行计划，优化索引和查询
4. **实时监控**：统计 SQL 执行次数和时间
5. **定期审核**：检查 SQL 是否符合规范
6. **基准测试**：评估优化效果
7. **告警机制**：慢查询超过阈值及时告警

---

## 参考资料

- [p6spy](https://github.com/p6spy/p6spy)
- [MySQL EXPLAIN](https://dev.mysql.com/doc/refman/8.0/en/explain.html)

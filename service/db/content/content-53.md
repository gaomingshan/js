# 连接池与连接管理

## 概述

数据库连接是昂贵的资源，频繁创建和销毁连接会严重影响应用性能。连接池通过复用连接，显著提升应用性能和系统稳定性。本章介绍连接池的原理、配置和最佳实践。

**核心内容**：
- **连接池原理**：连接复用机制
- **连接池配置**：大小、超时、验证
- **常见连接池**：HikariCP、Druid、C3P0
- **连接泄漏**：检测和预防
- **最佳实践**：性能优化建议

---

## 连接池原理

### 1. 为什么需要连接池

**创建连接的开销**：
```
1. TCP 三次握手
2. MySQL 认证（用户名、密码验证）
3. 设置会话参数
4. 分配内存资源

时间：约 50-100ms
```

**不使用连接池的问题**：
```python
# 每次请求创建连接
def get_user(user_id):
    # 创建连接（50-100ms）
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='password',
        database='mydb'
    )
    
    # 查询（5ms）
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    
    # 关闭连接
    cursor.close()
    conn.close()
    
    return result

问题：
✗ 每次请求创建连接（慢）
✗ 频繁创建销毁（浪费资源）
✗ 高并发时连接数暴增（超过 max_connections）
✗ 性能瓶颈
```

**使用连接池**：
```python
# 连接池（初始化一次）
pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=10,
    host='localhost',
    user='root',
    password='password',
    database='mydb'
)

def get_user(user_id):
    # 从连接池获取连接（< 1ms）
    conn = pool.get_connection()
    
    try:
        # 查询（5ms）
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        result = cursor.fetchone()
        cursor.close()
        return result
    finally:
        # 归还连接到池（不是真正关闭）
        conn.close()

优点：
✓ 连接复用（快）
✓ 减少创建销毁开销
✓ 控制连接数
✓ 性能提升 10-100 倍
```

### 2. 连接池工作流程

**初始化**：
```
1. 创建连接池
2. 初始化最小连接数（minIdle）
3. 连接放入空闲队列
```

**获取连接**：
```
1. 应用请求连接
2. 检查空闲队列
   ├─ 有空闲连接 → 返回
   └─ 无空闲连接
       ├─ 连接数 < maxPoolSize → 创建新连接
       └─ 连接数 = maxPoolSize → 等待（或超时）
```

**归还连接**：
```
1. 应用关闭连接（conn.close()）
2. 连接归还到空闲队列
3. 连接可被复用
```

**连接验证**：
```
获取连接时：
- 检查连接是否有效
- 执行测试查询（如 SELECT 1）
- 无效连接被丢弃，创建新连接
```

**连接清理**：
```
后台线程定期：
- 清理空闲超时的连接
- 保持最小连接数
- 验证连接有效性
```

---

## HikariCP（推荐）

### 1. 特点

**性能最佳**：
```
✓ 字节码级别优化
✓ 无锁设计
✓ 快速连接获取（< 1ms）
✓ 小内存占用

基准测试（1000 次获取连接）：
- HikariCP：约 100ms
- C3P0：约 300ms
- Druid：约 200ms
```

### 2. 配置

**Spring Boot 配置**：
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb?useSSL=false&serverTimezone=UTC
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
    
    hikari:
      # 连接池名称
      pool-name: HikariPool-1
      
      # 最小空闲连接数
      minimum-idle: 10
      
      # 最大连接数
      maximum-pool-size: 20
      
      # 连接超时（毫秒）
      connection-timeout: 30000
      
      # 空闲超时（毫秒）
      idle-timeout: 600000
      
      # 最大生命周期（毫秒）
      max-lifetime: 1800000
      
      # 连接测试查询
      connection-test-query: SELECT 1
      
      # 其他配置
      auto-commit: true
      read-only: false
```

**Java 配置**：
```java
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class DatabaseConfig {
    
    public static HikariDataSource createDataSource() {
        HikariConfig config = new HikariConfig();
        
        // JDBC URL
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        config.setUsername("root");
        config.setPassword("password");
        
        // 连接池配置
        config.setMinimumIdle(10);
        config.setMaximumPoolSize(20);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        
        // 连接测试
        config.setConnectionTestQuery("SELECT 1");
        
        // 性能优化
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        
        return new HikariDataSource(config);
    }
}

// 使用
HikariDataSource dataSource = DatabaseConfig.createDataSource();

try (Connection conn = dataSource.getConnection()) {
    // 执行查询
    PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
    stmt.setLong(1, 1L);
    ResultSet rs = stmt.executeQuery();
    // ...
}
```

### 3. 重要参数

**minimumIdle**：
```
最小空闲连接数

默认：与 maximumPoolSize 相同
推荐：10-20

说明：
- 保持一定数量的空闲连接
- 快速响应突发流量
- 不要设置过大（浪费资源）
```

**maximumPoolSize**：
```
最大连接数

默认：10
推荐：根据负载和数据库容量

计算公式：
connections = ((core_count * 2) + effective_spindle_count)

示例：
- 4 核 CPU + 1 块磁盘
- connections = (4 * 2) + 1 = 9

注意：
- 不是越大越好
- 超过数据库 max_connections 无意义
- 考虑应用实例数量
```

**connectionTimeout**：
```
连接超时（毫秒）

默认：30000（30秒）
推荐：10000-30000

说明：
- 等待连接的最长时间
- 超时抛出 SQLException
- 不要设置太长（影响用户体验）
```

**idleTimeout**：
```
空闲超时（毫秒）

默认：600000（10分钟）
推荐：600000-1800000

说明：
- 空闲连接保持时间
- 超时后连接被移除
- 保持 minimumIdle 数量
```

**maxLifetime**：
```
最大生命周期（毫秒）

默认：1800000（30分钟）
推荐：1800000-3600000

说明：
- 连接的最长存活时间
- 防止连接长时间不刷新
- 应小于数据库 wait_timeout
```

---

## Druid

### 1. 特点

**功能丰富**：
```
✓ 监控统计
✓ SQL 防火墙
✓ 慢查询监控
✓ 连接泄漏检测
✓ Spring Boot Starter 支持
```

### 2. 配置

**Spring Boot 配置**：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
    type: com.alibaba.druid.pool.DruidDataSource
    
    druid:
      # 初始化连接数
      initial-size: 5
      
      # 最小空闲连接数
      min-idle: 10
      
      # 最大活动连接数
      max-active: 20
      
      # 获取连接超时（毫秒）
      max-wait: 60000
      
      # 连接有效性检测
      test-on-borrow: false
      test-on-return: false
      test-while-idle: true
      validation-query: SELECT 1
      
      # 空闲连接检测间隔（毫秒）
      time-between-eviction-runs-millis: 60000
      
      # 连接最小空闲时间（毫秒）
      min-evictable-idle-time-millis: 300000
      
      # 监控统计
      filters: stat,wall,log4j2
      
      # Web 监控
      stat-view-servlet:
        enabled: true
        url-pattern: /druid/*
        login-username: admin
        login-password: admin
      
      # 慢 SQL 记录
      filter:
        stat:
          slow-sql-millis: 1000
          log-slow-sql: true
```

**访问监控页面**：
```
http://localhost:8080/druid/

查看：
- SQL 统计
- URI 统计
- Spring 监控
- 连接池状态
```

---

## 连接池大小优化

### 1. 计算公式

**公式 1（通用）**：
```
connections = ((core_count * 2) + effective_spindle_count)

示例：
- 8 核 CPU
- 1 块 SSD
- connections = (8 * 2) + 1 = 17

推荐：15-20
```

**公式 2（根据并发）**：
```
connections = 预期并发请求数 × 平均响应时间 / 平均事务时间

示例：
- 预期并发：100 QPS
- 平均响应时间：100ms
- 平均事务时间：10ms
- connections = 100 × 0.1 / 0.01 = 100

注意：
- 这个值通常偏大
- 实际可以减半
- 推荐：50
```

### 2. 性能测试

**压测工具**：
```bash
# JMeter 压测
jmeter -n -t test_plan.jmx -l result.jtl

# 调整连接池大小
# 测试不同配置下的性能

测试场景：
- 连接池大小：10, 20, 50, 100, 200
- 并发用户：100, 500, 1000
- 测试时间：10 分钟

记录：
- QPS
- 响应时间（平均、95th、99th）
- 错误率
- 连接池使用率

选择：
- QPS 最高
- 响应时间低
- 资源占用合理
```

### 3. 动态调整

**监控指标**：
```java
// HikariCP 监控
HikariPoolMXBean poolMXBean = dataSource.getHikariPoolMXBean();

int totalConnections = poolMXBean.getTotalConnections();
int activeConnections = poolMXBean.getActiveConnections();
int idleConnections = poolMXBean.getIdleConnections();
int threadsAwaitingConnection = poolMXBean.getThreadsAwaitingConnection();

System.out.println("Total: " + totalConnections);
System.out.println("Active: " + activeConnections);
System.out.println("Idle: " + idleConnections);
System.out.println("Waiting: " + threadsAwaitingConnection);

// 告警：
// - activeConnections / totalConnections > 80%（考虑增大）
// - threadsAwaitingConnection > 0（连接不足）
// - idleConnections / totalConnections > 50%（考虑减小）
```

---

## 连接泄漏

### 1. 什么是连接泄漏

**定义**：
```
连接从连接池获取后，没有正确归还

原因：
- 忘记关闭连接
- 异常时未关闭
- 代码逻辑错误
```

**后果**：
```
✗ 连接池耗尽
✗ 新请求无法获取连接
✗ 应用挂起
✗ 数据库连接数暴增
```

### 2. 检测连接泄漏

**HikariCP 配置**：
```yaml
spring:
  datasource:
    hikari:
      # 连接泄漏检测阈值（毫秒）
      leak-detection-threshold: 60000
```

**日志输出**：
```
WARN HikariPool - Connection leak detection triggered for connection ...
Apparent connection leak detected
```

**Druid 监控**：
```yaml
druid:
  # 移除废弃连接
  remove-abandoned: true
  
  # 超时时间（秒）
  remove-abandoned-timeout: 180
  
  # 日志记录
  log-abandoned: true
```

### 3. 预防连接泄漏

**正确关闭连接**：
```java
// 不好：可能泄漏
Connection conn = dataSource.getConnection();
PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users");
ResultSet rs = stmt.executeQuery();
// 如果这里抛异常，连接未关闭
conn.close();

// 好：使用 try-with-resources
try (Connection conn = dataSource.getConnection();
     PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users");
     ResultSet rs = stmt.executeQuery()) {
    
    while (rs.next()) {
        // 处理结果
    }
}
// 自动关闭，即使异常也会关闭

// 或使用 finally
Connection conn = null;
PreparedStatement stmt = null;
ResultSet rs = null;
try {
    conn = dataSource.getConnection();
    stmt = conn.prepareStatement("SELECT * FROM users");
    rs = stmt.executeQuery();
    
    while (rs.next()) {
        // 处理结果
    }
} catch (SQLException e) {
    // 处理异常
} finally {
    // 确保关闭
    if (rs != null) try { rs.close(); } catch (SQLException e) {}
    if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
    if (conn != null) try { conn.close(); } catch (SQLException e) {}
}
```

**Spring JdbcTemplate**：
```java
// 推荐：使用 JdbcTemplate（自动管理连接）
@Autowired
private JdbcTemplate jdbcTemplate;

public User getUser(Long id) {
    return jdbcTemplate.queryForObject(
        "SELECT * FROM users WHERE id = ?",
        new Object[]{id},
        (rs, rowNum) -> new User(
            rs.getLong("id"),
            rs.getString("name")
        )
    );
}
// 不需要手动关闭连接
```

---

## 最佳实践

### 1. 配置建议

**推荐配置（HikariCP）**：
```yaml
spring:
  datasource:
    hikari:
      # 连接池大小
      minimum-idle: 10
      maximum-pool-size: 20
      
      # 超时配置
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      
      # 连接测试
      connection-test-query: SELECT 1
      
      # 泄漏检测
      leak-detection-threshold: 60000
      
      # 性能优化
      cache-prep-stmts: true
      prep-stmt-cache-size: 250
      prep-stmt-cache-sql-limit: 2048
```

### 2. 监控清单

```
□ 连接池使用率
□ 活动连接数
□ 空闲连接数
□ 等待连接数
□ 连接创建速率
□ 连接关闭速率
□ 连接泄漏告警
□ 慢查询数量
```

### 3. 性能优化

```
□ 使用 HikariCP（性能最佳）
□ 合理设置连接池大小
□ 启用 PreparedStatement 缓存
□ 使用连接验证
□ 监控连接使用情况
□ 定期压测调优
```

### 4. 开发规范

```
□ 使用 try-with-resources
□ 或确保 finally 中关闭
□ 使用 ORM 或 JdbcTemplate
□ 避免手动管理连接
□ 启用连接泄漏检测
□ Code Review 检查
```

---

## 常见问题

### 1. 连接池耗尽

**症状**：
```
java.sql.SQLException: Connection is not available, request timed out after 30000ms
```

**原因**：
```
- 连接池太小
- 连接泄漏
- 慢查询占用连接
- 高并发
```

**解决**：
```
1. 检查连接泄漏
2. 增大连接池
3. 优化慢查询
4. 减少事务时间
```

### 2. 连接频繁创建销毁

**症状**：
```
日志显示频繁创建连接
性能下降
```

**原因**：
```
- minimumIdle 设置过小
- idleTimeout 设置过短
```

**解决**：
```
增大 minimumIdle
延长 idleTimeout
```

### 3. 数据库连接数过多

**症状**：
```
ERROR 1040: Too many connections
```

**原因**：
```
- 多个应用实例
- 每个实例连接池过大
- 连接未释放
```

**解决**：
```
总连接数 = 应用实例数 × 每个实例连接池大小

示例：
- 10 个应用实例
- 每个实例连接池：20
- 总连接数：200

确保：
- 总连接数 < max_connections
- 预留一些余量（监控、备份等）

调整：
- 减小每个实例连接池大小
- 增大数据库 max_connections
```

---

## 参考资料

1. **HikariCP**：
   - 官网：https://github.com/brettwooldridge/HikariCP
   - 文档：https://github.com/brettwooldridge/HikariCP/wiki

2. **Druid**：
   - 官网：https://github.com/alibaba/druid
   - 文档：https://github.com/alibaba/druid/wiki

3. **推荐文章**：
   - "About Pool Sizing" by HikariCP

4. **最佳实践**：
   - 使用 HikariCP
   - 合理配置连接池大小
   - 启用监控和告警
   - 正确关闭连接
   - 定期性能测试
   - 持续优化

# 12.2 多数据源配置

## 概述

在企业应用中，经常需要连接多个数据库，如主从数据库、读写分离、多租户系统等。MyBatis Plus 提供了灵活的多数据源支持，可以通过 dynamic-datasource 组件实现动态数据源切换。

**核心功能：**
- 动态数据源切换
- 读写分离
- 主从复制
- 多租户数据隔离

---

## 引入依赖

### Maven 依赖

```xml
<dependencies>
    <!-- MyBatis Plus -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.3.2</version>
    </dependency>
    
    <!-- 动态数据源 -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>dynamic-datasource-spring-boot-starter</artifactId>
        <version>3.6.1</version>
    </dependency>
    
    <!-- MySQL 驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
</dependencies>
```

---

## 配置多数据源

### 配置文件

```yaml
# application.yml
spring:
  datasource:
    dynamic:
      # 设置默认数据源（必须配置）
      primary: master
      
      # 严格模式（未匹配到数据源时抛异常）
      strict: false
      
      # 数据源配置
      datasource:
        # 主库
        master:
          url: jdbc:mysql://localhost:3306/db_master?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
          username: root
          password: password
          driver-class-name: com.mysql.cj.jdbc.Driver
          
          # Druid 连接池配置
          druid:
            initial-size: 5
            min-idle: 5
            max-active: 20
            max-wait: 60000
            test-while-idle: true
            test-on-borrow: false
            test-on-return: false
        
        # 从库1
        slave1:
          url: jdbc:mysql://localhost:3307/db_slave1?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
          username: root
          password: password
          driver-class-name: com.mysql.cj.jdbc.Driver
        
        # 从库2
        slave2:
          url: jdbc:mysql://localhost:3308/db_slave2?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
          username: root
          password: password
          driver-class-name: com.mysql.cj.jdbc.Driver
        
        # 其他数据源（如订单库）
        order:
          url: jdbc:mysql://localhost:3309/db_order?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
          username: root
          password: password
          driver-class-name: com.mysql.cj.jdbc.Driver

# MyBatis Plus 配置
mybatis-plus:
  mapper-locations: classpath*:mapper/**/*Mapper.xml
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

---

## @DS 注解使用

### 基本用法

```java
/**
 * 在 Service 或 Mapper 上使用 @DS 注解指定数据源
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 使用主库（默认）
     */
    public User getById(Long id) {
        return super.getById(id);
    }
    
    /**
     * 使用从库查询
     */
    @DS("slave1")
    public List<User> list() {
        return super.list();
    }
    
    /**
     * 使用主库更新
     */
    @DS("master")
    public boolean update(User user) {
        return super.updateById(user);
    }
}
```

### Mapper 级别配置

```java
/**
 * 在 Mapper 接口上配置数据源
 */
@DS("slave1")
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 默认使用 slave1
     */
    List<User> selectAll();
    
    /**
     * 方法级别覆盖类级别配置
     */
    @DS("master")
    int insert(User user);
}
```

### 多数据源切换规则

```
优先级（从高到低）：
1. 方法级别 @DS 注解
2. 类级别 @DS 注解
3. 默认数据源（primary 配置）
```

---

## 读写分离配置

### 读写分离策略

```java
/**
 * 读写分离服务
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    /**
     * 写操作：使用主库
     */
    @DS("master")
    @Override
    public boolean save(User user) {
        return super.save(user);
    }
    
    @DS("master")
    @Override
    public boolean updateById(User user) {
        return super.updateById(user);
    }
    
    @DS("master")
    @Override
    public boolean removeById(Serializable id) {
        return super.removeById(id);
    }
    
    /**
     * 读操作：使用从库（负载均衡）
     */
    @DS("slave")  // slave 是组名，会在 slave1, slave2 中负载均衡
    @Override
    public User getById(Serializable id) {
        return super.getById(id);
    }
    
    @DS("slave")
    @Override
    public List<User> list() {
        return super.list();
    }
    
    @DS("slave")
    @Override
    public Page<User> page(Page<User> page) {
        return super.page(page);
    }
}
```

### 配置从库组

```yaml
spring:
  datasource:
    dynamic:
      primary: master
      datasource:
        master:
          url: jdbc:mysql://localhost:3306/db_master
          username: root
          password: password
        
        # 从库组（自动负载均衡）
        slave:
          - url: jdbc:mysql://localhost:3307/db_slave1
            username: root
            password: password
          - url: jdbc:mysql://localhost:3308/db_slave2
            username: root
            password: password
          - url: jdbc:mysql://localhost:3309/db_slave3
            username: root
            password: password
```

---

## 动态切换数据源

### 编程式切换

```java
/**
 * 编程式数据源切换
 */
@Service
public class DynamicDataSourceService {
    
    /**
     * 手动切换数据源
     */
    public List<User> queryFromSpecificDb(String dsName) {
        try {
            // 切换到指定数据源
            DynamicDataSourceContextHolder.push(dsName);
            
            // 执行查询
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            return userMapper.selectList(wrapper);
            
        } finally {
            // 恢复数据源
            DynamicDataSourceContextHolder.poll();
        }
    }
    
    /**
     * 批量操作不同数据源
     */
    public Map<String, List<User>> queryFromAllDatabases() {
        Map<String, List<User>> result = new HashMap<>();
        
        // 查询主库
        DynamicDataSourceContextHolder.push("master");
        result.put("master", userMapper.selectList(null));
        DynamicDataSourceContextHolder.poll();
        
        // 查询从库1
        DynamicDataSourceContextHolder.push("slave1");
        result.put("slave1", userMapper.selectList(null));
        DynamicDataSourceContextHolder.poll();
        
        // 查询从库2
        DynamicDataSourceContextHolder.push("slave2");
        result.put("slave2", userMapper.selectList(null));
        DynamicDataSourceContextHolder.poll();
        
        return result;
    }
}
```

### 基于请求头切换

```java
/**
 * 拦截器：根据请求头切换数据源
 */
@Component
public class DataSourceInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) {
        // 从请求头获取数据源名称
        String dsName = request.getHeader("X-DataSource");
        
        if (StringUtils.isNotBlank(dsName)) {
            DynamicDataSourceContextHolder.push(dsName);
        }
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, 
                               HttpServletResponse response, 
                               Object handler, 
                               Exception ex) {
        DynamicDataSourceContextHolder.poll();
    }
}

// 注册拦截器
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Autowired
    private DataSourceInterceptor dataSourceInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(dataSourceInterceptor)
                .addPathPatterns("/**");
    }
}
```

---

## 多租户场景

### 租户数据源映射

```java
/**
 * 租户数据源配置
 */
@Configuration
public class TenantDataSourceConfig {
    
    /**
     * 租户ID -> 数据源名称映射
     */
    private static final Map<Long, String> TENANT_DS_MAP = new HashMap<>();
    
    static {
        TENANT_DS_MAP.put(1L, "tenant1");
        TENANT_DS_MAP.put(2L, "tenant2");
        TENANT_DS_MAP.put(3L, "tenant3");
    }
    
    public static String getDataSourceName(Long tenantId) {
        return TENANT_DS_MAP.getOrDefault(tenantId, "master");
    }
}

/**
 * 租户拦截器
 */
@Component
public class TenantDataSourceInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) {
        // 获取租户ID
        Long tenantId = getTenantId(request);
        
        if (tenantId != null) {
            // 切换到租户对应的数据源
            String dsName = TenantDataSourceConfig.getDataSourceName(tenantId);
            DynamicDataSourceContextHolder.push(dsName);
        }
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, 
                               HttpServletResponse response, 
                               Object handler, 
                               Exception ex) {
        DynamicDataSourceContextHolder.poll();
    }
    
    private Long getTenantId(HttpServletRequest request) {
        // 从请求头获取
        String tenantIdStr = request.getHeader("X-Tenant-Id");
        if (StringUtils.isNotBlank(tenantIdStr)) {
            return Long.parseLong(tenantIdStr);
        }
        
        // 从 JWT Token 获取
        String token = request.getHeader("Authorization");
        if (StringUtils.isNotBlank(token)) {
            return JwtUtils.getTenantId(token);
        }
        
        return null;
    }
}
```

---

## 事务管理

### 单数据源事务

```java
/**
 * 单数据源事务（正常使用）
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> 
        implements UserService {
    
    @DS("master")
    @Transactional(rollbackFor = Exception.class)
    public boolean createUser(User user) {
        // 在同一个数据源内，事务正常工作
        save(user);
        
        // 创建账户
        Account account = new Account();
        account.setUserId(user.getId());
        accountService.save(account);
        
        return true;
    }
}
```

### 多数据源事务（不推荐）

```java
/**
 * 多数据源事务（需要分布式事务支持）
 */
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    /**
     * ⚠️ 注意：跨数据源无法保证事务一致性
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean createOrder(OrderDTO dto) {
        // 主库：创建订单
        @DS("master")
        Order order = new Order();
        order.setUserId(dto.getUserId());
        save(order);
        
        // 订单库：创建订单详情（不同数据源，事务不生效！）
        @DS("order")
        OrderDetail detail = new OrderDetail();
        detail.setOrderId(order.getId());
        orderDetailService.save(detail);
        
        // 如果这里抛异常，order 已提交，detail 未提交
        // 导致数据不一致！
        
        return true;
    }
}
```

### 使用 Seata 分布式事务

```xml
<!-- 引入 Seata -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

```java
/**
 * 使用 Seata 保证分布式事务
 */
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> 
        implements OrderService {
    
    @GlobalTransactional(
        name = "create-order",
        rollbackFor = Exception.class
    )
    public boolean createOrder(OrderDTO dto) {
        // 主库：创建订单
        @DS("master")
        Order order = new Order();
        save(order);
        
        // 订单库：创建订单详情
        @DS("order")
        OrderDetail detail = new OrderDetail();
        orderDetailService.save(detail);
        
        // Seata 保证分布式事务一致性
        return true;
    }
}
```

---

## 性能优化

### 连接池配置

```yaml
spring:
  datasource:
    dynamic:
      datasource:
        master:
          url: jdbc:mysql://localhost:3306/db_master
          username: root
          password: password
          
          # Druid 连接池配置
          druid:
            initial-size: 10              # 初始连接数
            min-idle: 10                  # 最小空闲连接数
            max-active: 50                # 最大活跃连接数
            max-wait: 60000               # 获取连接超时时间
            time-between-eviction-runs-millis: 60000  # 检测空闲连接间隔
            min-evictable-idle-time-millis: 300000    # 连接最小空闲时间
            validation-query: SELECT 1    # 验证查询
            test-while-idle: true         # 空闲时测试
            test-on-borrow: false         # 获取时不测试
            test-on-return: false         # 归还时不测试
            pool-prepared-statements: true  # 开启PSCache
            max-pool-prepared-statement-per-connection-size: 20
```

### 从库负载均衡

```java
/**
 * 自定义负载均衡策略
 */
@Component
public class CustomLoadBalanceStrategy extends AbstractLoadBalanceStrategy {
    
    @Override
    public String determineDsKey(List<String> dsKeys) {
        // 轮询策略
        int index = getIndex() % dsKeys.size();
        return dsKeys.get(index);
        
        // 或随机策略
        // return dsKeys.get(ThreadLocalRandom.current().nextInt(dsKeys.size()));
    }
    
    private AtomicInteger counter = new AtomicInteger(0);
    
    private int getIndex() {
        return counter.getAndIncrement();
    }
}
```

---

## 关键点总结

1. **dynamic-datasource**：使用动态数据源组件管理多数据源
2. **@DS 注解**：指定方法或类使用的数据源
3. **读写分离**：写操作主库，读操作从库（负载均衡）
4. **动态切换**：编程式切换数据源或基于请求头切换
5. **多租户**：根据租户ID动态切换数据源
6. **事务管理**：单数据源事务正常，多数据源需分布式事务
7. **性能优化**：合理配置连接池，使用从库负载均衡

---

## 参考资料

- [dynamic-datasource](https://github.com/baomidou/dynamic-datasource-spring-boot-starter)
- [多数据源配置](https://baomidou.com/pages/a61e1b/)

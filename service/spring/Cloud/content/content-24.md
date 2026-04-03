# 第 24 章：Sentinel 流量控制

> **学习目标**：掌握 Sentinel 流量控制、理解限流算法、能够配置流控规则  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. Sentinel 快速入门

### 1.1 Sentinel 简介

**Sentinel** 是阿里巴巴开源的面向分布式服务架构的流量控制组件。

**核心功能**：
- ✅ 流量控制（限流）
- ✅ 熔断降级
- ✅ 系统自适应保护
- ✅ 热点参数限流
- ✅ 实时监控
- ✅ 规则动态配置

**Sentinel vs Hystrix**：

| 特性 | Sentinel | Hystrix |
|------|----------|---------|
| 隔离策略 | 信号量 | 线程池/信号量 |
| 熔断策略 | 基于响应时间/异常比例 | 基于异常比例 |
| 实时监控 | ✅ | ⚠️ 有限 |
| 控制台 | ✅ | ❌ |
| 规则配置 | 动态 | 静态 |
| 维护状态 | ✅ 活跃 | ❌ 停止维护 |

### 1.2 添加依赖

```xml
<dependencies>
    <!-- Sentinel 核心库 -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    </dependency>
    
    <!-- Sentinel 控制台通信 -->
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-transport-simple-http</artifactId>
    </dependency>
</dependencies>
```

### 1.3 配置

```yaml
spring:
  application:
    name: order-service
  
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080  # Sentinel 控制台地址
        port: 8719                  # 客户端端口（用于控制台通信）
      
      # Web 配置
      web-context-unify: false      # 关闭 URL PATH 聚合
      
      # 日志配置
      log:
        dir: logs/sentinel
        switch-pid: true
      
      # 饥饿加载
      eager: true
```

### 1.4 启动 Sentinel 控制台

```bash
# 下载 Sentinel 控制台
wget https://github.com/alibaba/Sentinel/releases/download/1.8.6/sentinel-dashboard-1.8.6.jar

# 启动控制台
java -Dserver.port=8080 \
     -Dcsp.sentinel.dashboard.server=localhost:8080 \
     -Dproject.name=sentinel-dashboard \
     -jar sentinel-dashboard-1.8.6.jar
```

**访问控制台**：http://localhost:8080
- 默认用户名：sentinel
- 默认密码：sentinel

---

## 2. @SentinelResource 注解

### 2.1 基础使用

```java
@Service
public class UserService {
    
    @SentinelResource(
        value = "getUserById",           // 资源名称
        blockHandler = "handleBlock",     // 限流/降级处理方法
        fallback = "handleFallback"       // 异常降级处理方法
    )
    public User getUserById(Long id) {
        // 业务逻辑
        return userRepository.findById(id);
    }
    
    /**
     * 限流/降级处理
     */
    public User handleBlock(Long id, BlockException ex) {
        log.warn("getUserById 被限流/降级，ID：{}", id);
        
        User defaultUser = new User();
        defaultUser.setId(id);
        defaultUser.setUsername("系统繁忙");
        return defaultUser;
    }
    
    /**
     * 异常降级处理
     */
    public User handleFallback(Long id, Throwable ex) {
        log.error("getUserById 发生异常，ID：{}", id, ex);
        
        User defaultUser = new User();
        defaultUser.setId(id);
        defaultUser.setUsername("服务异常");
        return defaultUser;
    }
}
```

### 2.2 注解属性详解

```java
@SentinelResource(
    value = "resourceName",              // 资源名称（必填）
    
    // 限流/降级处理
    blockHandler = "handleBlock",         // 限流处理方法名
    blockHandlerClass = BlockHandler.class, // 限流处理类（静态方法）
    
    // 异常降级处理
    fallback = "handleFallback",          // 异常处理方法名
    fallbackClass = FallbackHandler.class, // 异常处理类（静态方法）
    defaultFallback = "defaultFallback",  // 默认异常处理方法
    
    // 异常忽略
    exceptionsToIgnore = {IllegalArgumentException.class}
)
```

### 2.3 blockHandler 方法要求

```java
/**
 * blockHandler 方法必须满足：
 * 1. 访问修饰符必须是 public
 * 2. 返回类型必须与原方法一致
 * 3. 参数列表需要和原方法一致，最后加一个 BlockException 参数
 * 4. 如果使用 blockHandlerClass，方法必须是 static
 */

// ✅ 正确
public User handleBlock(Long id, BlockException ex) {
    // ...
}

// ❌ 错误：返回类型不一致
public String handleBlock(Long id, BlockException ex) {
    // ...
}

// ❌ 错误：参数不一致
public User handleBlock(BlockException ex) {
    // ...
}
```

### 2.4 外部 BlockHandler 类

```java
public class UserBlockHandler {
    
    /**
     * 必须是静态方法
     */
    public static User handleGetUserBlock(Long id, BlockException ex) {
        log.warn("getUserById 被限流，ID：{}", id);
        User defaultUser = new User();
        defaultUser.setId(id);
        defaultUser.setUsername("系统繁忙");
        return defaultUser;
    }
}

@Service
public class UserService {
    
    @SentinelResource(
        value = "getUserById",
        blockHandlerClass = UserBlockHandler.class,
        blockHandler = "handleGetUserBlock"
    )
    public User getUserById(Long id) {
        return userRepository.findById(id);
    }
}
```

---

## 3. 流量控制规则（QPS/线程数）

### 3.1 QPS 限流

**QPS（Queries Per Second）**：每秒查询数

```java
@PostConstruct
public void initFlowRules() {
    List<FlowRule> rules = new ArrayList<>();
    
    FlowRule rule = new FlowRule();
    rule.setResource("getUserById");      // 资源名称
    rule.setGrade(RuleConstant.FLOW_GRADE_QPS);  // 限流类型：QPS
    rule.setCount(10);                     // 阈值：每秒10个请求
    
    rules.add(rule);
    
    FlowRuleManager.loadRules(rules);
}
```

**测试限流**：

```bash
# 压测工具
ab -n 1000 -c 100 http://localhost:8080/users/1

# 结果：
# - 前10个请求通过
# - 后90个请求被限流（返回 429 或降级响应）
```

### 3.2 线程数限流

**线程数限流**：限制并发线程数

```java
FlowRule rule = new FlowRule();
rule.setResource("getUserById");
rule.setGrade(RuleConstant.FLOW_GRADE_THREAD);  // 限流类型：线程数
rule.setCount(5);  // 阈值：最多5个并发线程
```

**使用场景**：
- 保护数据库连接池
- 保护下游服务
- 防止线程池耗尽

---

## 4. 流控效果（快速失败/Warm Up/排队等待）

### 4.1 快速失败（默认）

**直接拒绝超出阈值的请求**：

```java
FlowRule rule = new FlowRule();
rule.setResource("getUserById");
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(10);
rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT);  // 快速失败
```

**效果**：
```
请求速率：15 QPS
阈值：10 QPS

结果：
- 每秒通过 10 个请求
- 每秒拒绝 5 个请求
```

### 4.2 Warm Up（预热/冷启动）

**渐进式增加流量**：

```java
FlowRule rule = new FlowRule();
rule.setResource("getUserById");
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(100);                                         // 最终阈值
rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_WARM_UP);  // 预热
rule.setWarmUpPeriodSec(10);                                // 预热时间：10秒
```

**预热过程**：

```
冷启动因子：coldFactor = 3

初始阈值 = 最终阈值 / coldFactor = 100 / 3 ≈ 33

预热过程（10秒）：
时间0秒：阈值 = 33 QPS
时间5秒：阈值 = 66 QPS
时间10秒：阈值 = 100 QPS（最终值）
```

**使用场景**：
- 系统刚启动，缓存未预热
- 防止冷启动时流量过大
- 秒杀场景

### 4.3 排队等待

**匀速处理请求**：

```java
FlowRule rule = new FlowRule();
rule.setResource("getUserById");
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(10);                                           // 每秒10个
rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER);  // 排队
rule.setMaxQueueingTimeMs(5000);                            // 最大排队时间5秒
```

**效果**：

```
请求到达：
- 时间0ms：请求1 → 立即处理
- 时间20ms：请求2 → 等待80ms（保持100ms间隔）
- 时间50ms：请求3 → 等待150ms
- 时间100ms：请求4 → 立即处理

如果等待时间超过5秒，则拒绝请求
```

**使用场景**：
- 消息队列消费
- 批量任务处理
- 需要匀速处理的场景

---

## 5. 流控模式（直接/关联/链路）

### 5.1 直接模式（默认）

**直接限流当前资源**：

```java
FlowRule rule = new FlowRule();
rule.setResource("getUserById");
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(10);
rule.setStrategy(RuleConstant.STRATEGY_DIRECT);  // 直接模式
```

### 5.2 关联模式

**关联资源达到阈值时，限流当前资源**：

```java
FlowRule rule = new FlowRule();
rule.setResource("updateUser");                  // 当前资源：更新用户
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(5);
rule.setStrategy(RuleConstant.STRATEGY_RELATE);  // 关联模式
rule.setRefResource("getUserById");              // 关联资源：查询用户
```

**效果**：

```
当 getUserById 的 QPS 达到阈值时，限流 updateUser

场景：
- 查询QPS很高时，限制写操作，保护数据库
```

**使用场景**：
- 读多写少的场景
- 保护数据库写操作
- 防止写操作影响查询性能

### 5.3 链路模式

**从指定入口进入的流量才限流**：

```java
FlowRule rule = new FlowRule();
rule.setResource("getUserById");
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(10);
rule.setStrategy(RuleConstant.STRATEGY_CHAIN);   // 链路模式
rule.setRefResource("controller1");               // 入口资源
```

**配置**：

```yaml
spring:
  cloud:
    sentinel:
      web-context-unify: false  # 必须关闭 context 整合
```

**使用场景**：
- 同一个服务方法，不同入口不同限流规则
- 细粒度控制

---

## 6. 热点参数限流

### 6.1 基础使用

```java
@SentinelResource(
    value = "getUserById",
    blockHandler = "handleBlock"
)
public User getUserById(@RequestParam Long id) {
    return userRepository.findById(id);
}
```

**热点参数规则**：

```java
@PostConstruct
public void initParamFlowRules() {
    ParamFlowRule rule = new ParamFlowRule();
    
    rule.setResource("getUserById");
    rule.setParamIdx(0);                  // 参数索引（第一个参数）
    rule.setCount(5);                     // 阈值：每秒5个请求
    rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
    
    ParamFlowRuleManager.loadRules(Collections.singletonList(rule));
}
```

**效果**：

```
请求1：getUserById(id=1) → 通过
请求2：getUserById(id=1) → 通过
...
请求6：getUserById(id=1) → 限流（同一个id每秒只允许5次）

请求7：getUserById(id=2) → 通过（不同id单独计数）
```

### 6.2 参数例外项

**为特定参数值设置不同阈值**：

```java
ParamFlowRule rule = new ParamFlowRule();
rule.setResource("getUserById");
rule.setParamIdx(0);
rule.setCount(5);                       // 默认阈值：5

// 参数例外项
ParamFlowItem item = new ParamFlowItem();
item.setObject("1");                    // 参数值为1
item.setClassType(Long.class.getName());
item.setCount(10);                      // 特殊阈值：10

rule.setParamFlowItemList(Collections.singletonList(item));
```

**效果**：

```
id=1：每秒允许 10 个请求
其他id：每秒允许 5 个请求
```

**使用场景**：
- VIP 用户更高的访问配额
- 热门商品更高的查询配额

---

## 7. 系统自适应保护

### 7.1 系统保护规则

**根据系统负载自动限流**：

```java
@PostConstruct
public void initSystemRules() {
    List<SystemRule> rules = new ArrayList<>();
    
    SystemRule rule = new SystemRule();
    
    // CPU 使用率
    rule.setHighestCpuUsage(0.8);           // CPU 使用率 > 80% 时限流
    
    // 系统平均负载
    rule.setHighestSystemLoad(4.0);         // Load > 4.0 时限流
    
    // RT（平均响应时间）
    rule.setAvgRt(100);                     // 平均RT > 100ms 时限流
    
    // 并发线程数
    rule.setMaxThread(1000);                // 并发线程 > 1000 时限流
    
    // 入口 QPS
    rule.setQps(10000);                     // 入口QPS > 10000 时限流
    
    rules.add(rule);
    SystemRuleManager.loadRules(rules);
}
```

### 7.2 BBR 算法

**Sentinel 使用改进的 BBR 算法**：

```
BBR（Bottleneck Bandwidth and RTT）

核心思想：
1. 实时监控系统负载
2. 自动调整限流阈值
3. 在高负载时保护系统
4. 在低负载时放开流量
```

---

## 8. Sentinel 控制台使用

### 8.1 实时监控

**查看实时QPS**：
1. 访问控制台：http://localhost:8080
2. 选择应用：order-service
3. 查看实时监控：
   - 通过 QPS
   - 拒绝 QPS
   - 响应时间
   - 异常比例

### 8.2 配置流控规则

**在控制台配置规则**：

1. 进入"流控规则"
2. 点击"新增流控规则"
3. 配置参数：
   - 资源名：getUserById
   - 阈值类型：QPS
   - 单机阈值：10
   - 流控模式：直接
   - 流控效果：快速失败
4. 点击"新增"

**⚠️ 注意**：
- 控制台配置的规则重启后丢失
- 生产环境需要配置规则持久化（下一章讲解）

### 8.3 簇点链路

**查看资源调用链路**：

```
簇点链路显示：
- 所有资源
- 每个资源的 QPS
- 每个资源的响应时间
- 每个资源的异常数
```

### 8.4 机器列表

**查看接入的应用实例**：

```
显示信息：
- 实例 IP
- 端口号
- 心跳时间
- 版本号
```

---

## 9. 实战案例

### 9.1 商品秒杀限流

```java
@Service
@Slf4j
public class SeckillService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @SentinelResource(
        value = "seckill",
        blockHandler = "handleSeckillBlock"
    )
    public Result<Boolean> seckill(Long productId, Long userId) {
        // 1. 检查库存
        String stockKey = "product:stock:" + productId;
        Long stock = redisTemplate.opsForValue().decrement(stockKey);
        
        if (stock < 0) {
            // 库存不足
            redisTemplate.opsForValue().increment(stockKey);
            return Result.fail("商品已售罄");
        }
        
        // 2. 创建订单（异步）
        createOrderAsync(productId, userId);
        
        return Result.success(true);
    }
    
    public Result<Boolean> handleSeckillBlock(Long productId, Long userId, BlockException ex) {
        log.warn("秒杀被限流，商品ID：{}，用户ID：{}", productId, userId);
        return Result.fail("系统繁忙，请稍后重试");
    }
}
```

**流控规则**：

```java
@PostConstruct
public void initSeckillRules() {
    FlowRule rule = new FlowRule();
    rule.setResource("seckill");
    rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
    rule.setCount(1000);                           // 每秒1000个请求
    rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_WARM_UP);  // 预热
    rule.setWarmUpPeriodSec(60);                  // 预热60秒
    
    FlowRuleManager.loadRules(Collections.singletonList(rule));
}
```

### 9.2 API 网关限流

```java
@Component
public class ApiGatewayFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();
        
        Entry entry = null;
        try {
            // Sentinel 限流
            entry = SphU.entry(path);
            return chain.filter(exchange);
            
        } catch (BlockException ex) {
            // 被限流
            return rateLimitResponse(exchange);
            
        } finally {
            if (entry != null) {
                entry.exit();
            }
        }
    }
    
    private Mono<Void> rateLimitResponse(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        
        String body = "{\"code\":429,\"message\":\"请求过于频繁\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        
        return response.writeWith(Mono.just(buffer));
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
}
```

---

## 10. 面试要点

### 10.1 基础问题

**Q1：Sentinel 的核心功能有哪些？**

1. 流量控制（QPS/线程数）
2. 熔断降级
3. 系统自适应保护
4. 热点参数限流

**Q2：Sentinel 和 Hystrix 的区别？**

- Sentinel：信号量隔离，更轻量，实时监控，动态规则
- Hystrix：线程池隔离，资源消耗大，停止维护

### 10.2 进阶问题

**Q3：Sentinel 的限流算法是什么？**

- 滑动窗口算法
- 令牌桶算法（排队等待模式）
- Warm Up 预热算法

**Q4：如何实现热点参数限流？**

使用 @SentinelResource 注解，配置 ParamFlowRule

### 10.3 架构问题

**Q5：Sentinel 在微服务架构中如何使用？**

1. 服务级别：保护每个微服务
2. 网关级别：统一限流入口
3. 方法级别：保护热点方法
4. 参数级别：保护热点数据

---

## 11. 参考资料

**官方文档**：
- [Sentinel GitHub](https://github.com/alibaba/Sentinel)
- [Sentinel 官方文档](https://sentinelguard.io/zh-cn/docs/introduction.html)

---

**下一章预告**：第 25 章将学习 Sentinel 熔断降级与规则配置，包括熔断降级规则、熔断状态转换、降级处理、规则持久化、集群流控等内容。

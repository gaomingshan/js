# 第 25 章：Sentinel 熔断降级与规则配置

> **学习目标**：掌握 Sentinel 熔断降级、理解熔断状态机、能够实现规则持久化  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. 熔断降级规则（慢调用/异常比例/异常数）

### 1.1 慢调用比例

**当响应时间超过阈值的请求比例达到设定值时，触发熔断**：

```java
@PostConstruct
public void initDegradeRules() {
    List<DegradeRule> rules = new ArrayList<>();
    
    DegradeRule rule = new DegradeRule();
    rule.setResource("getUserById");
    rule.setGrade(RuleConstant.DEGRADE_GRADE_RT);      // 慢调用比例
    rule.setCount(100);                                // 响应时间阈值：100ms
    rule.setTimeWindow(10);                            // 熔断时长：10秒
    rule.setMinRequestAmount(5);                       // 最小请求数：5
    rule.setSlowRatioThreshold(0.5);                   // 慢调用比例阈值：50%
    rule.setStatIntervalMs(1000);                      // 统计时长：1秒
    
    rules.add(rule);
    DegradeRuleManager.loadRules(rules);
}
```

**熔断条件**：

```
统计时长：1秒
最小请求数：5
慢调用阈值：100ms
慢调用比例：50%

场景分析：
1秒内有10个请求：
- 6个请求响应时间 > 100ms（慢调用）
- 4个请求响应时间 < 100ms

慢调用比例 = 6/10 = 60% > 50%
→ 触发熔断，持续10秒
```

### 1.2 异常比例

**当异常请求比例达到阈值时，触发熔断**：

```java
DegradeRule rule = new DegradeRule();
rule.setResource("getUserById");
rule.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO);  // 异常比例
rule.setCount(0.5);                                          // 异常比例阈值：50%
rule.setTimeWindow(10);                                      // 熔断时长：10秒
rule.setMinRequestAmount(5);                                 // 最小请求数：5
rule.setStatIntervalMs(1000);                                // 统计时长：1秒
```

**熔断条件**：

```
1秒内有10个请求：
- 6个请求抛出异常
- 4个请求正常

异常比例 = 6/10 = 60% > 50%
→ 触发熔断
```

### 1.3 异常数

**当异常请求数达到阈值时，触发熔断**：

```java
DegradeRule rule = new DegradeRule();
rule.setResource("getUserById");
rule.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_COUNT);  // 异常数
rule.setCount(5);                                            // 异常数阈值：5个
rule.setTimeWindow(10);                                      // 熔断时长：10秒
rule.setMinRequestAmount(5);                                 // 最小请求数：5
rule.setStatIntervalMs(60000);                               // 统计时长：60秒
```

**熔断条件**：

```
60秒内异常数 >= 5
→ 触发熔断
```

---

## 2. 熔断状态转换

### 2.1 熔断状态机

```
正常状态（Closed）
    ↓ 满足熔断条件
熔断状态（Open）
    ↓ 熔断时长过后
半开状态（Half-Open）
    ↓ 
    ├─ 请求成功 → 关闭熔断（Closed）
    └─ 请求失败 → 重新熔断（Open）
```

### 2.2 状态详解

**Closed（关闭状态）**：
- 正常处理请求
- 统计慢调用/异常
- 当满足熔断条件时，进入 Open 状态

**Open（熔断状态）**：
- 所有请求直接返回降级响应
- 不调用实际服务
- 经过 timeWindow 时间后，进入 Half-Open 状态

**Half-Open（半开状态）**：
- 允许一个探测请求通过
- 如果请求成功，关闭熔断（Closed）
- 如果请求失败，重新熔断（Open）

### 2.3 状态转换示例

```java
@Service
@Slf4j
public class UserService {
    
    @SentinelResource(
        value = "getUserById",
        blockHandler = "handleBlock",
        fallback = "handleFallback"
    )
    public User getUserById(Long id) {
        // 模拟慢调用
        try {
            Thread.sleep(200);  // 200ms
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        return userRepository.findById(id);
    }
    
    public User handleBlock(Long id, BlockException ex) {
        log.warn("熔断降级，ID：{}", id);
        return createDefaultUser(id);
    }
    
    public User handleFallback(Long id, Throwable ex) {
        log.error("异常降级，ID：{}", id, ex);
        return createDefaultUser(id);
    }
}
```

**测试熔断**：

```bash
# 连续请求10次
for i in {1..10}; do
  curl http://localhost:8080/users/1
done

# 状态转换：
# 请求1-5：Closed（正常）
# 请求6：Closed → Open（触发熔断）
# 请求7-10：Open（直接降级）
# 等待10秒后：
# 请求11：Half-Open（探测）
# 如果成功：Half-Open → Closed
# 如果失败：Half-Open → Open
```

---

## 3. 降级处理（blockHandler/fallback）

### 3.1 blockHandler vs fallback

**区别**：

| 场景 | blockHandler | fallback |
|------|--------------|----------|
| 限流/熔断 | ✅ 处理 | ❌ 不处理 |
| 业务异常 | ❌ 不处理 | ✅ 处理 |
| 参数要求 | 最后一个参数必须是 BlockException | 最后一个参数必须是 Throwable |

**示例**：

```java
@SentinelResource(
    value = "getUserById",
    blockHandler = "handleBlock",      // 处理限流/熔断
    fallback = "handleFallback"        // 处理业务异常
)
public User getUserById(Long id) {
    if (id <= 0) {
        throw new IllegalArgumentException("无效的ID");
    }
    
    return userRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("用户不存在"));
}

// 限流/熔断处理
public User handleBlock(Long id, BlockException ex) {
    log.warn("被限流/熔断，ID：{}", id);
    return createDefaultUser(id);
}

// 业务异常处理
public User handleFallback(Long id, Throwable ex) {
    log.error("业务异常，ID：{}", id, ex);
    
    if (ex instanceof IllegalArgumentException) {
        throw (IllegalArgumentException) ex;
    }
    
    return createDefaultUser(id);
}
```

### 3.2 异常忽略

**指定不触发 fallback 的异常**：

```java
@SentinelResource(
    value = "getUserById",
    fallback = "handleFallback",
    exceptionsToIgnore = {
        IllegalArgumentException.class,  // 忽略参数异常
        NotFoundException.class          // 忽略未找到异常
    }
)
public User getUserById(Long id) {
    // ...
}
```

### 3.3 默认 fallback

**为所有方法提供默认降级**：

```java
@SentinelResource(
    value = "getUserById",
    defaultFallback = "defaultFallback",
    fallbackClass = CommonFallback.class
)
public User getUserById(Long id) {
    // ...
}

public class CommonFallback {
    
    /**
     * 默认降级方法
     * 参数：只有 Throwable
     * 返回值：Object
     */
    public static Object defaultFallback(Throwable ex) {
        log.error("默认降级处理", ex);
        return null;
    }
}
```

---

## 4. 规则持久化（文件/Nacos/Apollo）

### 4.1 问题

**控制台配置的规则存在内存中，重启后丢失**：

```
问题：
1. 应用重启后规则丢失
2. 控制台配置的规则不会同步到其他实例

解决方案：
- 规则持久化到配置中心（Nacos/Apollo）
- 或持久化到文件
```

### 4.2 Nacos 持久化

**添加依赖**：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
</dependency>
```

**配置**：

```yaml
spring:
  cloud:
    sentinel:
      datasource:
        # 流控规则
        flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
            
        # 降级规则
        degrade:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-degrade-rules
            groupId: SENTINEL_GROUP
            rule-type: degrade
            
        # 系统规则
        system:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-system-rules
            groupId: SENTINEL_GROUP
            rule-type: system
```

**Nacos 配置内容**（order-service-flow-rules）：

```json
[
  {
    "resource": "getUserById",
    "grade": 1,
    "count": 10,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
  }
]
```

### 4.3 文件持久化

**配置**：

```yaml
spring:
  cloud:
    sentinel:
      datasource:
        ds1:
          file:
            file: classpath:sentinel-flow-rules.json
            rule-type: flow
            
        ds2:
          file:
            file: classpath:sentinel-degrade-rules.json
            rule-type: degrade
```

**文件内容**（sentinel-flow-rules.json）：

```json
[
  {
    "resource": "getUserById",
    "grade": 1,
    "count": 10
  }
]
```

### 4.4 推送模式

**Pull 模式（默认）**：

```
应用定期拉取配置
- 优点：简单
- 缺点：有延迟
```

**Push 模式（推荐）**：

```
配置中心主动推送
- 优点：实时
- 缺点：需要配置中心支持
```

**自定义规则推送**：

```java
@Component
public class SentinelRulePusher {
    
    @Autowired
    private NacosConfigService nacosConfigService;
    
    /**
     * 推送流控规则到 Nacos
     */
    public void pushFlowRules(List<FlowRule> rules) throws Exception {
        String dataId = "order-service-flow-rules";
        String group = "SENTINEL_GROUP";
        
        String content = JSON.toJSONString(rules);
        
        nacosConfigService.publishConfig(dataId, group, content);
    }
}
```

---

## 5. 集群流控

### 5.1 单机限流 vs 集群限流

**单机限流**：

```
3个实例，每个实例限流 10 QPS
总限流：30 QPS

问题：
- 无法精确控制总流量
- 某个实例可能成为瓶颈
```

**集群限流**：

```
3个实例，总限流 30 QPS
每个实例动态分配

优势：
- 精确控制总流量
- 自动负载均衡
```

### 5.2 集群限流配置

**Token Server（令牌服务器）**：

```yaml
spring:
  cloud:
    sentinel:
      datasource:
        flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
      
      # 集群配置
      cluster:
        server:
          port: 18730  # Token Server 端口
        client:
          server-host: localhost
          server-port: 18730
```

**集群流控规则**：

```json
[
  {
    "resource": "getUserById",
    "grade": 1,
    "count": 30,
    "clusterMode": true,           // 启用集群模式
    "clusterConfig": {
      "thresholdType": 1,          // 阈值类型：全局
      "fallbackToLocalWhenFail": true  // Token Server 不可用时降级到本地限流
    }
  }
]
```

### 5.3 Token Server 选举

**嵌入模式**：

```java
@Component
public class ClusterStateManager {
    
    @PostConstruct
    public void init() {
        // 指定某个实例作为 Token Server
        ClusterServerConfigManager.loadGlobalTransportConfig(
            new ServerTransportConfig()
                .setIdleSeconds(600)
                .setPort(18730)
        );
        
        // 启动 Token Server
        ClusterTokenServer tokenServer = new SentinelDefaultTokenServer();
        tokenServer.start();
    }
}
```

---

## 6. 网关限流集成

### 6.1 Gateway 集成 Sentinel

**添加依赖**：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-sentinel-gateway</artifactId>
</dependency>
```

**配置**：

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
      
      # Gateway 限流
      scg:
        fallback:
          mode: response
          response-status: 429
          response-body: '{"code":429,"message":"请求过于频繁"}'
```

### 6.2 Gateway 限流规则

**API 分组**：

```java
@Configuration
public class GatewayConfig {
    
    @PostConstruct
    public void initGatewayRules() {
        // 1. 定义 API 分组
        Set<ApiDefinition> definitions = new HashSet<>();
        
        ApiDefinition api1 = new ApiDefinition("user_api")
            .setPredicateItems(new HashSet<ApiPredicateItem>() {{
                add(new ApiPathPredicateItem().setPattern("/api/users/**"));
            }});
        
        definitions.add(api1);
        GatewayApiDefinitionManager.loadApiDefinitions(definitions);
        
        // 2. 配置限流规则
        Set<GatewayFlowRule> rules = new HashSet<>();
        
        GatewayFlowRule rule = new GatewayFlowRule("user_api")
            .setCount(100)                    // 100 QPS
            .setIntervalSec(1);
        
        rules.add(rule);
        GatewayRuleManager.loadRules(rules);
    }
}
```

### 6.3 自定义降级响应

```java
@Configuration
public class SentinelGatewayConfig {
    
    @PostConstruct
    public void init() {
        GatewayCallbackManager.setBlockHandler(new BlockRequestHandler() {
            @Override
            public Mono<ServerResponse> handleRequest(ServerWebExchange exchange, 
                                                        Throwable ex) {
                Map<String, Object> result = new HashMap<>();
                result.put("code", 429);
                result.put("message", "请求过于频繁，请稍后重试");
                
                return ServerResponse.status(HttpStatus.TOO_MANY_REQUESTS)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(BodyInserters.fromValue(result));
            }
        });
    }
}
```

---

## 7. 实战案例

### 7.1 完整熔断降级方案

```java
@Service
@Slf4j
public class OrderService {
    
    @Autowired
    private UserClient userClient;
    
    @Autowired
    private ProductClient productClient;
    
    /**
     * 创建订单
     */
    @SentinelResource(
        value = "createOrder",
        blockHandler = "handleCreateOrderBlock",
        fallback = "handleCreateOrderFallback"
    )
    public Order createOrder(OrderDTO dto) {
        // 1. 查询用户信息
        User user = getUserWithFallback(dto.getUserId());
        
        // 2. 查询商品信息
        Product product = getProductWithFallback(dto.getProductId());
        
        // 3. 创建订单
        Order order = new Order();
        order.setUserId(user.getId());
        order.setProductId(product.getId());
        order.setAmount(product.getPrice());
        
        return orderRepository.save(order);
    }
    
    @SentinelResource(
        value = "getUserInfo",
        blockHandler = "handleGetUserBlock",
        fallback = "handleGetUserFallback"
    )
    private User getUserWithFallback(Long userId) {
        return userClient.getUser(userId).getData();
    }
    
    @SentinelResource(
        value = "getProductInfo",
        blockHandler = "handleGetProductBlock",
        fallback = "handleGetProductFallback"
    )
    private Product getProductWithFallback(Long productId) {
        return productClient.getProduct(productId).getData();
    }
    
    // 各种降级处理方法...
}
```

**熔断规则配置**：

```java
@PostConstruct
public void initDegradeRules() {
    List<DegradeRule> rules = new ArrayList<>();
    
    // 用户服务熔断规则
    DegradeRule userRule = new DegradeRule();
    userRule.setResource("getUserInfo");
    userRule.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO);
    userRule.setCount(0.5);              // 异常比例 50%
    userRule.setTimeWindow(10);          // 熔断10秒
    userRule.setMinRequestAmount(5);
    rules.add(userRule);
    
    // 商品服务熔断规则
    DegradeRule productRule = new DegradeRule();
    productRule.setResource("getProductInfo");
    productRule.setGrade(RuleConstant.DEGRADE_GRADE_RT);
    productRule.setCount(100);           // 响应时间 100ms
    productRule.setTimeWindow(10);
    productRule.setSlowRatioThreshold(0.5);
    rules.add(productRule);
    
    DegradeRuleManager.loadRules(rules);
}
```

---

## 8. 面试要点

### 8.1 基础问题

**Q1：Sentinel 的熔断策略有哪些？**

1. 慢调用比例
2. 异常比例
3. 异常数

**Q2：熔断状态机有哪些状态？**

1. Closed（关闭）：正常状态
2. Open（熔断）：熔断状态
3. Half-Open（半开）：探测状态

### 8.2 进阶问题

**Q3：blockHandler 和 fallback 的区别？**

- blockHandler：处理限流/熔断
- fallback：处理业务异常

**Q4：如何实现规则持久化？**

1. Nacos 持久化（推荐）
2. 文件持久化
3. Apollo 持久化

### 8.3 架构问题

**Q5：集群限流的原理是什么？**

1. Token Server 统一管理令牌
2. Token Client 向 Server 申请令牌
3. Server 根据总阈值分配令牌
4. Client 获取令牌后通过请求

**Q6：Sentinel 在微服务中如何使用？**

1. 服务级别：保护每个服务
2. 网关级别：统一限流入口
3. 规则持久化：配置中心统一管理
4. 集群限流：精确控制总流量

---

## 9. 参考资料

**官方文档**：
- [Sentinel 熔断降级](https://sentinelguard.io/zh-cn/docs/circuit-breaking.html)
- [Sentinel 规则持久化](https://sentinelguard.io/zh-cn/docs/dynamic-rule-configuration.html)

---

**下一章预告**：第 26 章将学习 Resilience4j 实践，包括 CircuitBreaker 熔断器、RateLimiter 限流器、Bulkhead 隔离舱、Retry 重试、TimeLimiter 超时等内容，并对比 Resilience4j 和 Sentinel 的优劣。

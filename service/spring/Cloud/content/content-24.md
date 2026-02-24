# 第24章：Sentinel 熔断降级快速入门

> **本章目标**：掌握 Sentinel 的核心功能，实现流量控制、熔断降级、系统保护

---

## 1. Sentinel 简介

### 1.1 什么是 Sentinel

**定位**：阿里巴巴开源的分布式服务流量治理组件，提供流量控制、熔断降级、系统保护等功能。

**核心功能**：
- ✅ 流量控制：限流、匀速排队
- ✅ 熔断降级：异常比例、异常数、慢调用比例
- ✅ 系统保护：CPU、内存、Load、RT、线程数
- ✅ 热点参数限流
- ✅ 集群限流
- ✅ 实时监控
- ✅ 规则持久化

**Sentinel vs Hystrix**：

| 维度 | Sentinel | Hystrix |
|------|----------|---------|
| **维护** | 活跃 | 停止维护 |
| **隔离策略** | 信号量 | 线程池/信号量 |
| **熔断策略** | 异常比例/异常数/慢调用 | 异常比例 |
| **限流** | QPS/线程数/匀速排队 | 不支持 |
| **实时监控** | 控制台 | 需自行搭建 |
| **规则配置** | 控制台/代码/Nacos | 代码/配置文件 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## 2. 快速入门

### 2.1 引入依赖

**pom.xml**：
```xml
<dependencies>
    <!-- Sentinel -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    </dependency>

    <!-- Sentinel Dashboard 通信 -->
    <dependency>
        <groupId>com.alibaba.csp</groupId>
        <artifactId>sentinel-transport-simple-http</artifactId>
    </dependency>
</dependencies>
```

---

### 2.2 配置

**application.yml**：
```yaml
spring:
  application:
    name: user-service
  
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080  # Sentinel 控制台地址
        port: 8719  # 客户端端口
      
      eager: true  # 立即加载 Sentinel
```

---

### 2.3 启动 Sentinel Dashboard

**下载**：
```bash
# 下载 sentinel-dashboard-1.8.6.jar
wget https://github.com/alibaba/Sentinel/releases/download/1.8.6/sentinel-dashboard-1.8.6.jar
```

**启动**：
```bash
java -jar sentinel-dashboard-1.8.6.jar
```

**访问**：
```
http://localhost:8080
用户名：sentinel
密码：sentinel
```

---

## 3. 流量控制

### 3.1 @SentinelResource 注解

**基础使用**：
```java
@Service
public class UserService {
    
    @SentinelResource(
        value = "getUser",  // 资源名
        blockHandler = "getUserBlockHandler",  // 限流降级方法
        fallback = "getUserFallback"  // 异常降级方法
    )
    public UserDTO getUser(Long id) {
        // 业务逻辑
        return userMapper.selectById(id);
    }
    
    // 限流降级方法
    public UserDTO getUserBlockHandler(Long id, BlockException ex) {
        UserDTO user = new UserDTO();
        user.setName("系统繁忙");
        return user;
    }
    
    // 异常降级方法
    public UserDTO getUserFallback(Long id, Throwable ex) {
        UserDTO user = new UserDTO();
        user.setName("服务异常");
        return user;
    }
}
```

---

### 3.2 流控规则

**控制台配置**：
```
1. 进入 Sentinel 控制台
2. 选择应用
3. 点击"流控规则"
4. 新增流控规则
   - 资源名：getUser
   - 阈值类型：QPS
   - 单机阈值：10
```

**代码配置**：
```java
@Configuration
public class SentinelConfig {
    
    @PostConstruct
    public void initFlowRules() {
        List<FlowRule> rules = new ArrayList<>();
        
        FlowRule rule = new FlowRule();
        rule.setResource("getUser");  // 资源名
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);  // 限流模式：QPS
        rule.setCount(10);  // 阈值
        
        rules.add(rule);
        
        FlowRuleManager.loadRules(rules);
    }
}
```

**流控效果**：
- **快速失败**（默认）：直接拒绝
- **Warm Up**：预热/冷启动
- **排队等待**：匀速排队

---

### 3.3 流控模式

**直接模式**（默认）：
```
资源：getUser
阈值：10 QPS
效果：超过10 QPS直接拒绝
```

**关联模式**：
```
资源A：写接口 updateUser
关联资源：读接口 getUser
阈值：写接口 QPS > 100
效果：限制读接口，保证写接口性能
```

**链路模式**：
```
资源：getUserById
入口资源：/user/detail、/order/detail
阈值：从 /user/detail 入口的 QPS > 10
效果：只限制从 /user/detail 入口的流量
```

---

## 4. 熔断降级

### 4.1 熔断策略

**慢调用比例**：
```
慢调用RT：500ms
比例阈值：0.5（50%）
熔断时长：10秒
最小请求数：5

规则：1秒内请求数 >= 5，且慢调用比例 >= 50%，触发熔断
```

**异常比例**：
```
比例阈值：0.3（30%）
熔断时长：10秒
最小请求数：5

规则：1秒内请求数 >= 5，且异常比例 >= 30%，触发熔断
```

**异常数**：
```
异常数：10
熔断时长：10秒
最小请求数：5

规则：1分钟内异常数 >= 10，触发熔断
```

---

### 4.2 降级规则配置

**控制台配置**：
```
1. 进入 Sentinel 控制台
2. 选择应用
3. 点击"降级规则"
4. 新增降级规则
   - 资源名：getUser
   - 降级策略：慢调用比例
   - 最大RT：500
   - 比例阈值：0.5
   - 熔断时长：10
   - 最小请求数：5
```

**代码配置**：
```java
@PostConstruct
public void initDegradeRules() {
    List<DegradeRule> rules = new ArrayList<>();
    
    // 慢调用比例
    DegradeRule rule = new DegradeRule();
    rule.setResource("getUser");
    rule.setGrade(RuleConstant.DEGRADE_GRADE_RT);  // 慢调用
    rule.setCount(500);  // 最大RT（毫秒）
    rule.setSlowRatioThreshold(0.5);  // 比例阈值
    rule.setTimeWindow(10);  // 熔断时长（秒）
    rule.setMinRequestAmount(5);  // 最小请求数
    
    rules.add(rule);
    
    DegradeRuleManager.loadRules(rules);
}
```

---

## 5. OpenFeign 集成

### 5.1 配置

**pom.xml**：
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

**application.yml**：
```yaml
feign:
  sentinel:
    enabled: true  # 开启 Feign Sentinel 支持
```

---

### 5.2 降级处理

**Feign 客户端**：
```java
@FeignClient(
    name = "user-service",
    fallback = UserClientFallback.class
)
public interface UserClient {
    
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable("id") Long id);
}
```

**Fallback 类**：
```java
@Component
public class UserClientFallback implements UserClient {
    
    @Override
    public UserDTO getUser(Long id) {
        UserDTO user = new UserDTO();
        user.setName("服务降级");
        return user;
    }
}
```

**FallbackFactory（推荐）**：
```java
@Component
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    
    @Override
    public UserClient create(Throwable cause) {
        return new UserClient() {
            @Override
            public UserDTO getUser(Long id) {
                log.error("调用失败", cause);
                
                UserDTO user = new UserDTO();
                if (cause instanceof BlockException) {
                    user.setName("限流降级");
                } else {
                    user.setName("服务异常");
                }
                return user;
            }
        };
    }
}

@FeignClient(
    name = "user-service",
    fallbackFactory = UserClientFallbackFactory.class
)
public interface UserClient {
}
```

---

## 6. Gateway 集成

### 6.1 配置

**pom.xml**：
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-sentinel-gateway</artifactId>
</dependency>
```

**application.yml**：
```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
      
      scg:
        fallback:
          mode: response  # 降级模式
          response-body: '{"code":429,"message":"Too many requests"}'
```

---

### 6.2 网关流控规则

**配置**：
```java
@Configuration
public class GatewaySentinelConfig {
    
    @PostConstruct
    public void initGatewayRules() {
        Set<GatewayFlowRule> rules = new HashSet<>();
        
        // API 分组流控
        GatewayFlowRule rule = new GatewayFlowRule("user-api")
            .setCount(100)  // 阈值
            .setIntervalSec(1);  // 统计时间窗口
        
        rules.add(rule);
        
        GatewayRuleManager.loadRules(rules);
    }
    
    @PostConstruct
    public void initCustomizedApis() {
        Set<ApiDefinition> definitions = new HashSet<>();
        
        // 定义 API 分组
        ApiDefinition api = new ApiDefinition("user-api")
            .setPredicateItems(new HashSet<ApiPredicateItem>() {{
                add(new ApiPathPredicateItem().setPattern("/user/**"));
                add(new ApiPathPredicateItem().setPattern("/order/**"));
            }});
        
        definitions.add(api);
        
        GatewayApiDefinitionManager.loadApiDefinitions(definitions);
    }
}
```

---

## 7. 规则持久化

### 7.1 Nacos 持久化

**引入依赖**：
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
        flow:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
        
        degrade:
          nacos:
            server-addr: localhost:8848
            dataId: ${spring.application.name}-degrade-rules
            groupId: SENTINEL_GROUP
            rule-type: degrade
```

**Nacos 配置**：
```json
[
  {
    "resource": "getUser",
    "limitApp": "default",
    "grade": 1,
    "count": 10,
    "strategy": 0,
    "controlBehavior": 0,
    "clusterMode": false
  }
]
```

---

## 8. 实际落地场景

### 8.1 场景1：秒杀限流

**需求**：秒杀接口限流，防止超卖。

**实现**：
```java
@Service
public class SeckillService {
    
    @SentinelResource(
        value = "seckill",
        blockHandler = "seckillBlockHandler"
    )
    public boolean seckill(Long productId, Long userId) {
        // 秒杀逻辑
        return true;
    }
    
    public boolean seckillBlockHandler(Long productId, Long userId, BlockException ex) {
        return false;  // 限流，返回失败
    }
}
```

**流控规则**：
```java
FlowRule rule = new FlowRule();
rule.setResource("seckill");
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(1000);  // 每秒1000个请求
rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER);  // 匀速排队
rule.setMaxQueueingTimeMs(500);  // 最大排队时间
```

---

### 8.2 场景2：热点参数限流

**需求**：对热门商品单独限流。

**实现**：
```java
@SentinelResource(
    value = "getProduct",
    blockHandler = "getProductBlockHandler"
)
public ProductDTO getProduct(Long productId) {
    return productMapper.selectById(productId);
}
```

**热点规则**：
```java
ParamFlowRule rule = new ParamFlowRule();
rule.setResource("getProduct");
rule.setParamIdx(0);  // 第0个参数（productId）
rule.setCount(100);  // 默认阈值100

// 热点参数
ParamFlowItem item = new ParamFlowItem();
item.setObject("1001");  // 商品ID 1001
item.setCount(1000);  // 特殊阈值1000

rule.setParamFlowItemList(Collections.singletonList(item));

ParamFlowRuleManager.loadRules(Collections.singletonList(rule));
```

---

## 9. 学习自检清单

- [ ] 理解 Sentinel 的核心功能
- [ ] 掌握 @SentinelResource 注解使用
- [ ] 掌握流控规则配置
- [ ] 掌握熔断降级规则
- [ ] 能够集成 OpenFeign
- [ ] 能够集成 Gateway
- [ ] 掌握规则持久化
- [ ] 能够实现秒杀限流、热点参数限流

---

**本章小结**：
- Sentinel 是阿里开源的流量治理组件，提供流量控制、熔断降级、系统保护
- 核心注解：@SentinelResource，配置资源名、blockHandler、fallback
- 流控规则：QPS/线程数，流控效果（快速失败/Warm Up/排队等待）
- 熔断策略：慢调用比例、异常比例、异常数
- 集成 Feign：feign.sentinel.enabled=true，配置 fallback/fallbackFactory
- 集成 Gateway：网关流控、API 分组
- 规则持久化：Nacos 数据源
- 实战场景：秒杀限流、热点参数限流

**继续生成第25-35章及quiz...**

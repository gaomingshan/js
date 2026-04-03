# 第 37 章：微服务架构综合面试题

> **学习目标**：系统掌握微服务面试题、理解面试官追问方向、具备面试应答能力  
> **预计时长**：6-8 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. 组件选型（20题）

### Q1：为什么选择 Nacos 而不是 Eureka？

**答案**：

**Nacos 优势**：
1. **功能更全面**：同时支持服务注册发现和配置管理
2. **AP + CP 模式**：支持 AP 和 CP 两种模式切换
3. **持续维护**：阿里巴巴持续更新，Eureka 已停止维护
4. **性能更好**：支持百万级服务实例
5. **控制台功能强大**：服务管理、配置管理、命名空间等

**Eureka 劣势**：
- 只支持 AP 模式
- 已停止维护（2.x）
- 功能单一（只有服务注册发现）

**选型建议**：
- 新项目：**推荐 Nacos**
- 老项目：可继续使用 Eureka（稳定）

---

### Q2：Spring Cloud Config 和 Nacos Config 如何选择？

**对比**：

| 特性 | Spring Cloud Config | Nacos Config |
|------|---------------------|--------------|
| **动态刷新** | 需要 Bus | ✅ 原生支持 |
| **配置中心** | 需要单独部署 | ✅ 集成 |
| **高可用** | 需要额外配置 | ✅ 内置集群 |
| **权限控制** | ⚠️ 有限 | ✅ 完善 |
| **配置回滚** | ❌ | ✅ |
| **配置审计** | ❌ | ✅ |

**选型建议**：
- **Nacos Config**：功能全、易用、性能好（推荐）
- **Spring Cloud Config**：与 Git 集成紧密

---

### Q3：Gateway 和 Zuul 的区别？

**核心区别**：

**Gateway**：
- 基于 WebFlux（响应式）
- 基于 Netty（异步非阻塞）
- 性能更好（支持数万并发）
- 功能更强大（断言、过滤器）

**Zuul 1.x**：
- 基于 Servlet（阻塞式）
- 基于 Tomcat（同步阻塞）
- 性能一般（数百并发）
- 功能基础

**Zuul 2.x**：
- 基于 Netty（异步非阻塞）
- 但 Spring Cloud 官方不再支持

**选型建议**：**首选 Gateway**

---

### Q4：Feign 和 RestTemplate 如何选择？

**对比**：

| 特性 | Feign | RestTemplate |
|------|-------|--------------|
| **编程风格** | 声明式 | 编程式 |
| **代码简洁性** | ✅ 高 | ⚠️ 低 |
| **负载均衡** | ✅ 内置 | 需配置 |
| **熔断降级** | ✅ 集成 | 需手动 |
| **超时重试** | ✅ 配置化 | 需手动 |
| **学习成本** | 低 | 低 |

**选型建议**：
- **Feign**：服务间调用（推荐）
- **RestTemplate**：简单的 HTTP 调用

---

### Q5：Sentinel 和 Hystrix 如何选择？

**对比**：

| 特性 | Sentinel | Hystrix |
|------|----------|---------|
| **维护状态** | ✅ 活跃 | ❌ 停止 |
| **隔离策略** | 信号量 | 线程池/信号量 |
| **控制台** | ✅ | ❌ |
| **实时监控** | ✅ | ⚠️ 有限 |
| **规则配置** | ✅ 动态 | ❌ 静态 |
| **热点限流** | ✅ | ❌ |
| **集群限流** | ✅ | ❌ |

**选型建议**：**首选 Sentinel**

---

### Q6：Sentinel 和 Resilience4j 如何选择？

**对比**：

| 特性 | Sentinel | Resilience4j |
|------|----------|--------------|
| **控制台** | ✅ | ❌ |
| **集群限流** | ✅ | ❌ |
| **热点限流** | ✅ | ❌ |
| **系统保护** | ✅ | ❌ |
| **轻量级** | ⚠️ | ✅ |
| **函数式** | ❌ | ✅ |
| **重试** | ❌ | ✅ |

**选型建议**：
- **Sentinel**：需要控制台、集群限流、热点限流
- **Resilience4j**：轻量级、函数式编程

---

### Q7：如何选择分布式事务方案？

**场景选型**：

| 场景 | 方案 | 理由 |
|------|------|------|
| **电商下单** | AT 模式 | 性能好，自动回滚 |
| **支付核心** | TCC 模式 | 精确控制，强一致性 |
| **长审批流程** | SAGA 模式 | 支持长事务 |
| **金融交易** | XA 模式 | 强一致性 |
| **非核心业务** | 消息最终一致性 | 性能最优，成本最低 |

---

### Q8：Stream vs Kafka 原生客户端？

**对比**：

| 特性 | Stream | Kafka 原生 |
|------|--------|-----------|
| **中间件切换** | ✅ 简单 | ❌ 困难 |
| **编程模型** | ✅ 统一 | ❌ 各异 |
| **学习成本** | ✅ 低 | ⚠️ 高 |
| **功能丰富度** | ⚠️ 基础 | ✅ 完整 |
| **性能** | ⚠️ 略低 | ✅ 最优 |

**选型建议**：
- **Stream**：需要切换中间件、统一编程模型
- **Kafka 原生**：需要高级特性、极致性能

---

### Q9：Seata AT vs TCC vs SAGA？

**选型决策树**：

```
需要强一致性？
  ├─ 是 → XA 模式
  └─ 否 ↓

都是数据库操作？
  ├─ 是 → AT 模式
  └─ 否 ↓

需要精确控制资源？
  ├─ 是 → TCC 模式
  └─ 否 ↓

是否长流程？
  ├─ 是 → SAGA 模式
  └─ 否 → 消息最终一致性
```

---

### Q10：OpenTelemetry vs SkyWalking？

**对比**：

| 特性 | OpenTelemetry | SkyWalking |
|------|---------------|------------|
| **标准化** | ✅ 统一标准 | ❌ 专有 |
| **厂商中立** | ✅ | ⚠️ |
| **完整 APM** | ⚠️ 需配合后端 | ✅ |
| **控制台** | ❌ | ✅ |
| **告警** | ❌ | ✅ |

**选型建议**：
- **OpenTelemetry**：标准化、多后端切换
- **SkyWalking**：完整 APM 解决方案

---

## 2. 原理深入（25题）

### Q11：Nacos 服务注册的流程？

**流程**：

```
1. 服务启动
   ↓
2. NacosNamingService.registerInstance()
   ↓
3. 构建 Instance 对象
   - IP、Port
   - ServiceName
   - Metadata
   ↓
4. 发送 HTTP 请求到 Nacos Server
   - PUT /nacos/v1/ns/instance
   ↓
5. Nacos Server 保存实例信息
   - 内存：ConcurrentHashMap
   - 持久化（如果是 CP 模式）
   ↓
6. 心跳维持
   - 每5秒发送一次心跳
   - 15秒未收到心跳 → 标记不健康
   - 30秒未收到心跳 → 剔除实例
```

---

### Q12：Nacos 配置动态刷新原理？

**原理**：

```
1. 客户端启动
   ↓
2. 建立长轮询连接
   - 29.5秒超时
   ↓
3. Nacos Server 配置变更
   ↓
4. 服务端立即响应长轮询
   - 返回变更的配置
   ↓
5. 客户端收到响应
   ↓
6. 更新本地缓存
   ↓
7. 发布 RefreshEvent
   ↓
8. @RefreshScope Bean 重新创建
   ↓
9. 配置生效
```

**关键点**：
- **长轮询**：减少无效请求
- **事件驱动**：RefreshEvent
- **Bean 重建**：@RefreshScope

---

### Q13：Feign 动态代理实现原理？

**原理**：

```
1. @FeignClient 注解处理
   ↓
2. FeignClientFactoryBean 创建
   ↓
3. 生成动态代理对象（JDK Proxy）
   ↓
4. 方法调用拦截
   ↓
5. 构建 RequestTemplate
   - URL
   - HTTP Method
   - Headers
   - Body
   ↓
6. Encoder 编码参数
   ↓
7. 执行 HTTP 请求
   - 使用 HTTP Client（OkHttp/Apache HttpClient）
   ↓
8. Decoder 解码响应
   ↓
9. 返回结果
```

**关键类**：
- `FeignClientFactoryBean`
- `ReflectiveFeign`
- `SynchronousMethodHandler`

---

### Q14：Gateway 路由匹配原理？

**流程**：

```
1. 请求到达 Gateway
   ↓
2. RoutePredicateHandlerMapping.getHandlerInternal()
   ↓
3. 获取所有路由（RouteLocator.getRoutes()）
   ↓
4. 遍历路由，逐个匹配
   ↓
5. 应用 Predicate 断言
   - Path Predicate
   - Method Predicate
   - Header Predicate
   - ...
   ↓
6. 找到第一个匹配的路由
   ↓
7. 返回 FilteringWebHandler
   ↓
8. 执行 Filter 链
   - Global Filters
   - Route Filters
   ↓
9. NettyRoutingFilter 转发请求
   ↓
10. 返回响应
```

---

### Q15：Sentinel 限流算法？

**滑动窗口算法**：

```
时间窗口：1秒
统计粒度：500ms（2个格子）

格子0（0-500ms）：5个请求
格子1（500-1000ms）：7个请求

总请求数：12
限流阈值：10

12 > 10 → 限流
```

**令牌桶算法**（排队等待模式）：

```
容量：10个令牌
生成速率：10个/秒

请求到达：
- 有令牌 → 消耗1个，通过
- 无令牌 → 等待（最多5秒）
```

---

### Q16：Seata AT 模式如何回滚？

**回滚流程**：

```
1. 全局事务开始
   ↓
2. 执行本地事务
   - 生成前镜像（BeforeImage）
   - 执行 SQL
   - 生成后镜像（AfterImage）
   - 提交本地事务
   - 保存 undo_log
   ↓
3. 注册分支事务
   ↓
4. 全局事务决定回滚
   ↓
5. RM 收到回滚请求
   ↓
6. 查询 undo_log
   ↓
7. 根据前镜像生成反向 SQL
   - UPDATE orders SET status='INIT' WHERE id=1
   ↓
8. 执行反向 SQL
   ↓
9. 删除 undo_log
   ↓
10. 回滚完成
```

---

### Q17：Stream Binder 如何屏蔽中间件差异？

**抽象层**：

```
应用代码
    ↓
Stream API（StreamBridge、Consumer）
    ↓
Binder 抽象接口
    ↓
具体 Binder 实现
    ├─ Kafka Binder → Kafka
    ├─ RabbitMQ Binder → RabbitMQ
    └─ RocketMQ Binder → RocketMQ
```

**关键接口**：
- `Binder`：绑定器接口
- `Binding`：绑定关系
- `MessageChannel`：消息通道

**切换中间件**：
```xml
<!-- 只需更换依赖 -->
<!-- 从 Kafka -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-kafka</artifactId>
</dependency>

<!-- 切换到 RabbitMQ -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-rabbit</artifactId>
</dependency>
```

---

### Q18：OpenTelemetry 如何传播 TraceId？

**HTTP 传播**：

```
服务A → 服务B

HTTP Header：
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ↑  ↑                                ↑                  ↑
          版本  TraceId（32位）                  SpanId（16位）     标志

服务B 接收：
1. 解析 traceparent
2. 提取 TraceId
3. 创建新的 Span（新 SpanId）
4. 设置 ParentSpanId = 00f067aa0ba902b7
```

**gRPC 传播**：

```
Metadata：
traceparent: ...
```

**消息队列传播**：

```
消息 Header：
traceparent: ...
```

---

### Q19：Prometheus 如何存储时间序列？

**存储结构**：

```
TSDB（时序数据库）
    ↓
Block（数据块）
    ├─ chunks/（数据文件）
    ├─ index（索引文件）
    ├─ meta.json（元数据）
    └─ tombstones（删除标记）

数据压缩：
- Gorilla 压缩算法
- 压缩率：平均 1.37 字节/样本
```

**时间分区**：

```
数据按时间分块存储：
- 2小时一个块（可配置）
- 自动合并小块
- 定期删除过期数据
```

---

### Q20：Elasticsearch 倒排索引原理？

**倒排索引**：

```
文档：
doc1: "订单创建成功"
doc2: "订单支付失败"
doc3: "库存扣减成功"

倒排索引：
订单 → [doc1, doc2]
创建 → [doc1]
成功 → [doc1, doc3]
支付 → [doc2]
失败 → [doc2]
库存 → [doc3]
扣减 → [doc3]

查询"订单 AND 成功"：
订单 → [doc1, doc2]
成功 → [doc1, doc3]
交集 → [doc1]
```

---

## 3. 场景分析（25题）

### Q21：Feign 调用失败如何处理？

**处理策略**：

**1. 降级处理**：

```java
@FeignClient(
    name = "user-service",
    fallbackFactory = UserClientFallbackFactory.class
)
public interface UserClient {
    @GetMapping("/users/{id}")
    Result<User> getUser(@PathVariable Long id);
}

@Component
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
    @Override
    public UserClient create(Throwable cause) {
        return id -> {
            if (cause instanceof TimeoutException) {
                return Result.fail("用户服务超时");
            } else if (cause instanceof FeignException.ServiceUnavailable) {
                return Result.fail("用户服务不可用");
            }
            return Result.fail("查询用户失败");
        };
    }
}
```

**2. 重试机制**：

```yaml
feign:
  client:
    config:
      user-service:
        connectTimeout: 3000
        readTimeout: 5000
  
  circuitbreaker:
    enabled: true
  
  # 重试配置
  retry:
    enabled: true
    max-attempts: 3
    backoff:
      multiplier: 1.5
```

**3. 熔断保护**：

```yaml
resilience4j:
  circuitbreaker:
    instances:
      userService:
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
```

---

### Q22：配置不生效如何排查？

**排查步骤**：

**1. 检查配置中心**：
```bash
# 访问 Nacos 控制台
http://localhost:8848/nacos

# 查看配置列表
# 确认配置存在且内容正确
```

**2. 检查配置加载**：
```yaml
# bootstrap.yml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
        file-extension: yaml
```

**3. 查看日志**：
```
[Nacos Config] Listening config: dataId=order-service.yaml
[Nacos Config] config changed, dataId=order-service.yaml
```

**4. 检查 @RefreshScope**：
```java
@RestController
@RefreshScope  // 必须添加
public class ConfigController {
    @Value("${custom.config}")
    private String config;
}
```

**5. 手动刷新**：
```bash
curl -X POST http://localhost:8080/actuator/refresh
```

---

### Q23：网关如何实现鉴权？

**JWT 鉴权**：

```java
@Component
@Slf4j
public class JwtAuthFilter implements GlobalFilter, Ordered {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // 1. 白名单放行
        if (isWhitelist(request.getPath().value())) {
            return chain.filter(exchange);
        }
        
        // 2. 获取 Token
        String token = request.getHeaders().getFirst("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }
        
        token = token.substring(7);
        
        // 3. 验证 Token
        try {
            Claims claims = jwtUtil.parseToken(token);
            
            // 4. 传递用户信息
            ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", claims.get("userId", String.class))
                .header("X-Username", claims.get("username", String.class))
                .build();
            
            return chain.filter(exchange.mutate().request(mutatedRequest).build());
            
        } catch (Exception e) {
            log.error("Token 验证失败", e);
            return unauthorized(exchange);
        }
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
    
    @Override
    public int getOrder() {
        return -100;
    }
}
```

---

### Q24：分布式事务一致性如何保证？

**方案对比**：

**1. 本地消息表**：

```java
@Transactional
public void createOrder(OrderDTO dto) {
    // 1. 创建订单
    Order order = saveOrder(dto);
    
    // 2. 保存消息（同一事务）
    LocalMessage message = new LocalMessage();
    message.setTopic("order-created");
    message.setPayload(JSON.toJSONString(order));
    message.setStatus(MessageStatus.PENDING);
    messageRepository.save(message);
    
    // 两步操作在同一事务中
}

// 定时任务发送消息
@Scheduled(fixedDelay = 1000)
public void sendPendingMessages() {
    List<LocalMessage> messages = messageRepository
        .findByStatus(MessageStatus.PENDING);
    
    for (LocalMessage message : messages) {
        streamBridge.send(message.getTopic(), message.getPayload());
        message.setStatus(MessageStatus.SENT);
        messageRepository.save(message);
    }
}
```

**2. Seata AT 模式**：

```java
@GlobalTransactional
public void createOrder(OrderDTO dto) {
    // 1. 创建订单
    Order order = saveOrder(dto);
    
    // 2. 扣减库存（远程调用）
    inventoryClient.deduct(dto.getProductId(), dto.getCount());
    
    // 3. 扣减余额（远程调用）
    accountClient.deduct(dto.getUserId(), dto.getAmount());
    
    // 任何步骤失败，自动回滚
}
```

**3. 补偿机制**：

```java
// 定时检查订单一致性
@Scheduled(fixedDelay = 60000)
public void checkOrderConsistency() {
    List<Order> timeoutOrders = orderRepository
        .findByStatusAndCreateTimeBefore(OrderStatus.INIT, threshold);
    
    for (Order order : timeoutOrders) {
        // 检查并补偿
        compensateOrder(order);
    }
}
```

---

### Q25：服务调用超时如何排查？

**排查流程**：

**1. 查看日志**：
```
java.net.SocketTimeoutException: Read timed out
```

**2. 检查超时配置**：
```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 3000  # 连接超时
        readTimeout: 5000     # 读取超时
```

**3. 查看链路追踪**：
```
SkyWalking → 查询慢 Trace
→ 发现某个 Span 耗时5秒
→ 定位慢操作：MySQL 查询
```

**4. 分析慢 SQL**：
```sql
EXPLAIN SELECT * FROM orders WHERE user_id = ?;
-- type: ALL（全表扫描）
```

**5. 解决方案**：
```sql
-- 添加索引
CREATE INDEX idx_user_id ON orders(user_id);
```

**6. 调整超时时间**：
```yaml
feign:
  client:
    config:
      slow-service:
        readTimeout: 30000  # 增加到30秒
```

---

## 4. 架构设计（20题）

### Q26：如何设计一个微服务架构？

**架构图**：

```
客户端
    ↓
API Gateway（Spring Cloud Gateway）
    ├─ 鉴权
    ├─ 限流
    ├─ 路由
    └─ 熔断
    ↓
服务层
    ├─ 订单服务
    ├─ 用户服务
    ├─ 商品服务
    ├─ 库存服务
    └─ 支付服务
    ↓
基础设施
    ├─ 服务注册发现（Nacos）
    ├─ 配置中心（Nacos Config）
    ├─ 链路追踪（SkyWalking）
    ├─ 指标监控（Prometheus + Grafana）
    ├─ 日志收集（ELK）
    ├─ 消息队列（Kafka）
    └─ 分布式事务（Seata）
```

**设计原则**：
1. **单一职责**：每个服务专注一个业务领域
2. **服务自治**：独立部署、独立数据库
3. **接口标准化**：统一的 REST API 规范
4. **故障隔离**：熔断、降级、限流
5. **可观测性**：日志、监控、追踪

---

### Q27：如何设计服务治理体系？

**治理体系**：

**1. 服务注册发现**：
- 使用 Nacos
- 心跳机制：5秒/次
- 健康检查：15秒未心跳标记不健康

**2. 配置管理**：
- 统一配置中心（Nacos Config）
- 配置分组：dev/test/prod
- 动态刷新

**3. 负载均衡**：
- 客户端负载均衡（LoadBalancer）
- 策略：轮询、随机、权重

**4. 服务调用**：
- Feign 声明式调用
- 超时配置：3秒连接，5秒读取
- 重试机制：最多3次

**5. 流量控制**：
- Sentinel 限流
- QPS 限流：1000/秒
- 热点参数限流

**6. 熔断降级**：
- Sentinel 熔断
- 异常比例：50%
- 降级处理

**7. 服务网关**：
- Spring Cloud Gateway
- 统一鉴权
- 统一限流
- 统一日志

**8. 分布式事务**：
- Seata AT 模式
- 最终一致性方案

**9. 可观测性**：
- 链路追踪：SkyWalking
- 指标监控：Prometheus + Grafana
- 日志收集：ELK

**10. 告警通知**：
- 服务下线告警
- 高错误率告警
- 慢调用告警

---

### Q28：如何设计高可用架构？

**高可用设计**：

**1. 服务层面**：
- **多实例部署**：至少3个实例
- **跨可用区**：分布在不同机房
- **健康检查**：实时监控服务状态
- **自动扩缩容**：基于 CPU/内存/QPS

**2. 网关层面**：
- **网关集群**：多个 Gateway 实例
- **限流保护**：防止流量突增
- **熔断降级**：快速失败
- **降级方案**：返回默认值/缓存

**3. 数据层面**：
- **数据库主从**：读写分离
- **缓存**：Redis 集群
- **消息队列**：Kafka 集群

**4. 容错设计**：
- **超时控制**：防止长时间等待
- **重试机制**：临时故障自动恢复
- **幂等设计**：防止重复处理
- **限流降级**：保护系统

**5. 监控告警**：
- **实时监控**：服务状态、性能指标
- **告警通知**：钉钉、邮件
- **自动恢复**：健康检查失败自动重启

---

### Q29：熔断降级策略如何设计？

**三层熔断**：

**1. 服务级熔断**：
```yaml
resilience4j:
  circuitbreaker:
    instances:
      userService:
        failureRateThreshold: 50      # 失败率 > 50%
        waitDurationInOpenState: 10s  # 熔断10秒
```

**2. 接口级熔断**：
```java
@CircuitBreaker(name = "getUserById", fallbackMethod = "getUserFallback")
public User getUserById(Long id) {
    return userClient.getUser(id);
}

public User getUserFallback(Long id, Exception ex) {
    // 从缓存获取
    return cacheService.getUser(id);
}
```

**3. 网关级熔断**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          filters:
            - name: CircuitBreaker
              args:
                name: userServiceCB
                fallbackUri: forward:/fallback/user
```

**降级策略**：

**1. 返回默认值**：
```java
public User getUserFallback(Long id) {
    User defaultUser = new User();
    defaultUser.setId(id);
    defaultUser.setUsername("默认用户");
    return defaultUser;
}
```

**2. 返回缓存数据**：
```java
public User getUserFallback(Long id) {
    return cacheService.getUser(id);
}
```

**3. 返回降级提示**：
```java
public Result getUserFallback(Long id) {
    return Result.fail("服务繁忙，请稍后重试");
}
```

---

### Q30：微服务拆分原则？

**拆分维度**：

**1. 业务维度**：
- **按领域拆分**：订单、用户、商品、库存
- **按功能拆分**：认证、支付、通知
- **按数据拆分**：主数据、交易数据、分析数据

**2. 技术维度**：
- **按性能需求**：高并发服务独立
- **按稳定性需求**：核心服务独立
- **按团队**：不同团队负责不同服务

**拆分原则**：

**1. 单一职责**：
- 一个服务只做一件事
- 业务边界清晰

**2. 高内聚低耦合**：
- 服务内部高内聚
- 服务之间低耦合

**3. 服务自治**：
- 独立部署
- 独立数据库
- 独立团队

**4. 合理粒度**：
- 不要过度拆分（微服务不是越小越好）
- 不要拆分不足（单体还是问题）

**5. 稳定演进**：
- 先粗粒度，再细化
- 根据业务发展调整

**反模式**：
- ❌ 分布式单体：服务拆分但数据库共享
- ❌ 过度拆分：服务太小，调用链太长
- ❌ 职责不清：多个服务操作同一数据

---

## 5. 实战问题（20题）

### Q31：服务启动后无法注册到 Nacos？

**排查步骤**：

**1. 检查网络连接**：
```bash
curl http://localhost:8848/nacos/v1/console/health
# 应返回：ok
```

**2. 检查配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848  # 地址正确？
        namespace: dev                # 命名空间正确？
        group: DEFAULT_GROUP          # 分组正确？
```

**3. 查看启动日志**：
```
[Nacos Discovery] Register instance to Nacos failed
```

**4. 检查端口**：
```bash
netstat -ano | findstr 8848
# 确认 Nacos 在运行
```

**5. 检查防火墙**：
```bash
# 确认 8848 端口开放
```

**常见问题**：
- 配置错误（地址、命名空间）
- 网络不通
- Nacos 未启动
- 应用名称冲突

---

### Q32：Feign 调用报 404？

**排查步骤**：

**1. 检查服务是否注册**：
```bash
# Nacos 控制台查看服务列表
http://localhost:8848/nacos
```

**2. 检查 Feign 接口**：
```java
@FeignClient(name = "user-service")  // 服务名正确？
public interface UserClient {
    @GetMapping("/users/{id}")  // 路径正确？
    User getUser(@PathVariable Long id);
}
```

**3. 检查服务端接口**：
```java
@RestController
@RequestMapping("/users")  // 路径匹配？
public class UserController {
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }
}
```

**4. 开启日志**：
```yaml
logging:
  level:
    feign: DEBUG
```

**常见问题**：
- 服务名错误
- 路径不匹配
- 服务未启动
- 参数错误

---

### Q33：Gateway 转发失败？

**排查步骤**：

**1. 查看路由配置**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service  # 负载均衡地址
          predicates:
            - Path=/api/users/**  # 路径匹配规则
          filters:
            - StripPrefix=1       # 去掉 /api 前缀
```

**2. 检查服务注册**：
```bash
# 确认 user-service 已注册到 Nacos
```

**3. 启用调试日志**：
```yaml
logging:
  level:
    org.springframework.cloud.gateway: DEBUG
```

**4. 查看日志**：
```
Route matched: user-service-route
Pattern: /api/users/**
```

**5. 测试路由**：
```bash
curl http://localhost:8080/api/users/1
```

**常见问题**：
- 路由规则配置错误
- 服务未注册
- Filter 配置错误
- URI 格式错误

---

### Q34：网关性能优化？

**优化策略**：

**1. JVM 参数**：
```bash
-Xms2g -Xmx2g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
```

**2. Netty 优化**：
```yaml
spring:
  cloud:
    gateway:
      httpclient:
        pool:
          type: ELASTIC
          max-connections: 500
          max-idle-time: 30s
        
        connect-timeout: 3000
        response-timeout: 10s
```

**3. WebFlux 优化**：
```yaml
spring:
  webflux:
    codec:
      max-in-memory-size: 10MB
```

**4. 限流保护**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 100
                redis-rate-limiter.burstCapacity: 200
```

**5. 启用 HTTP/2**：
```yaml
server:
  http2:
    enabled: true
```

**6. 启用压缩**：
```yaml
server:
  compression:
    enabled: true
```

---

### Q35：灰度发布如何实现？

**方案1：基于权重**：

```yaml
# Nacos 元数据
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: v2
          weight: 10  # v2 版本权重10%
```

**自定义负载均衡**：

```java
@Component
public class VersionLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        // 获取请求头中的版本
        String version = getVersionFromRequest(request);
        
        // 根据版本选择实例
        if ("v2".equals(version)) {
            return chooseV2Instance();
        } else {
            return chooseV1Instance();
        }
    }
}
```

**方案2：基于网关**：

```java
@Component
public class VersionFilter implements GlobalFilter {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 根据用户ID判断
        Long userId = getUserId(exchange);
        
        // 灰度用户
        if (isGrayUser(userId)) {
            // 路由到 v2 版本
            exchange.getAttributes().put("version", "v2");
        }
        
        return chain.filter(exchange);
    }
}
```

---

### Q36：统一配置管理如何实现？

**配置层级**：

```
Nacos Config
    ├─ 公共配置（shared.yaml）
    │    ├─ 数据源配置
    │    ├─ Redis 配置
    │    └─ Kafka 配置
    │
    ├─ 环境配置（application-dev.yaml）
    │    ├─ 日志级别
    │    └─ 外部服务地址
    │
    └─ 服务配置（order-service.yaml）
         ├─ 服务端口
         └─ 业务配置
```

**配置示例**：

**1. 公共配置（shared.yaml）**：
```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
  
  redis:
    host: ${REDIS_HOST:localhost}
    port: 6379
```

**2. 环境配置（application-dev.yaml）**：
```yaml
logging:
  level:
    root: INFO
    com.example: DEBUG

external:
  payment-service-url: http://localhost:8090
```

**3. 服务配置（order-service.yaml）**：
```yaml
server:
  port: 8080

business:
  order:
    timeout: 30000
    max-retry: 3
```

**应用配置**：
```yaml
# bootstrap.yml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
        file-extension: yaml
        shared-configs:
          - data-id: shared.yaml
            refresh: true
        extension-configs:
          - data-id: application-${spring.profiles.active}.yaml
            refresh: true
```

---

## 6. 对比分析（10题）

### Q37：AP vs CP 如何选择？

**CAP 理论**：
- **C（Consistency）**：一致性
- **A（Availability）**：可用性
- **P（Partition tolerance）**：分区容错性

**AP 模式**（Nacos 默认）：
- **优先可用性**
- **最终一致性**
- **适用场景**：服务注册发现、配置中心

**CP 模式**：
- **优先一致性**
- **强一致性**
- **适用场景**：分布式锁、配置中心（要求强一致）

**Nacos 切换**：
```bash
# 设置为 CP 模式
curl -X PUT 'http://localhost:8848/nacos/v1/ns/operator/switches?entry=serverMode&value=CP'

# 设置为 AP 模式
curl -X PUT 'http://localhost:8848/nacos/v1/ns/operator/switches?entry=serverMode&value=AP'
```

**选择建议**：
- **服务注册发现**：AP（高可用更重要）
- **配置中心**：AP（大部分场景）/ CP（强一致性需求）
- **分布式锁**：CP（一致性优先）

---

### Q38：同步调用 vs 异步调用？

**对比**：

| 特性 | 同步调用 | 异步调用 |
|------|---------|---------|
| **实现复杂度** | ✅ 简单 | ⚠️ 复杂 |
| **性能** | ⚠️ 低 | ✅ 高 |
| **可用性** | ⚠️ 强依赖 | ✅ 弱依赖 |
| **一致性** | ✅ 强一致 | ⚠️ 最终一致 |
| **调试难度** | ✅ 简单 | ⚠️ 困难 |

**同步调用**（Feign）：
```java
public Order createOrder(OrderDTO dto) {
    // 同步调用，等待响应
    User user = userClient.getUser(dto.getUserId());
    Product product = productClient.getProduct(dto.getProductId());
    
    // 创建订单
    return saveOrder(dto);
}
```

**异步调用**（消息队列）：
```java
public Order createOrder(OrderDTO dto) {
    // 创建订单
    Order order = saveOrder(dto);
    
    // 异步发送事件
    streamBridge.send("order-created", order);
    
    return order;
}
```

**选择建议**：
- **同步调用**：强一致性需求、查询操作
- **异步调用**：弱依赖、高性能需求、解耦

---

### Q39：服务端负载均衡 vs 客户端负载均衡？

**对比**：

| 特性 | 服务端负载均衡 | 客户端负载均衡 |
|------|---------------|---------------|
| **代表** | Nginx | LoadBalancer |
| **负载均衡位置** | 服务端 | 客户端 |
| **性能** | ⚠️ 额外跳转 | ✅ 直连 |
| **单点问题** | ⚠️ 存在 | ✅ 无 |
| **负载均衡策略** | ✅ 丰富 | ⚠️ 有限 |

**服务端负载均衡**：
```
Client → Nginx → [Service1, Service2, Service3]
```

**客户端负载均衡**：
```
Client（LoadBalancer）→ Service1/Service2/Service3
```

**选择建议**：
- **服务端**：外部流量入口、需要复杂策略
- **客户端**：服务间调用、性能要求高

---

### Q40：AT vs TCC 如何选择？

**对比**：

| 特性 | AT 模式 | TCC 模式 |
|------|---------|----------|
| **侵入性** | ✅ 低 | ❌ 高 |
| **性能** | ✅ 好 | ⚠️ 一般 |
| **一致性** | 最终一致 | 最终一致 |
| **实现难度** | ✅ 简单 | ❌ 复杂 |
| **资源控制** | ⚠️ 粗粒度 | ✅ 细粒度 |
| **适用场景** | 通用 | 核心业务 |

**AT 模式**：
```java
@GlobalTransactional
public void createOrder(OrderDTO dto) {
    // 自动生成 undo_log
    // 自动回滚
    saveOrder(dto);
    deductInventory(dto);
    deductAccount(dto);
}
```

**TCC 模式**：
```java
// Try
public void freezeAccount(Long userId, BigDecimal amount) {
    account.setFrozen(account.getFrozen().add(amount));
    account.setBalance(account.getBalance().subtract(amount));
}

// Confirm
public void deductAccount(Long userId, BigDecimal amount) {
    account.setFrozen(account.getFrozen().subtract(amount));
}

// Cancel
public void unfreezeAccount(Long userId, BigDecimal amount) {
    account.setBalance(account.getBalance().add(amount));
    account.setFrozen(account.getFrozen().subtract(amount));
}
```

**选择建议**：
- **AT 模式**：通用场景、数据库操作、追求简单
- **TCC 模式**：核心业务、需要精确控制、可接受复杂度

---

## 总结

本章涵盖了微服务架构面试的6大类120道问题：

1. **组件选型**（20题）：Nacos、Gateway、Feign、Sentinel 等
2. **原理深入**（25题）：服务注册、动态配置、动态代理、限流算法等
3. **场景分析**（25题）：Feign 调用失败、配置不生效、鉴权、分布式事务等
4. **架构设计**（20题）：微服务架构、服务治理、高可用、熔断降级等
5. **实战问题**（20题）：服务注册失败、Feign 404、网关优化、灰度发布等
6. **对比分析**（10题）：AP vs CP、同步 vs 异步、AT vs TCC 等

**面试建议**：
1. **理解原理**：不仅知道怎么用，还要知道为什么
2. **实战经验**：结合项目经验回答
3. **对比分析**：能够对比不同方案的优劣
4. **解决问题**：展示排查和解决问题的能力
5. **架构思维**：从系统层面思考设计

---

**🎉 恭喜！全部37章内容已完成！**

**学习路线回顾**：
1. 第1-3章：微服务架构基础
2. 第4-6章：服务注册与发现（Nacos）
3. 第7-11章：配置管理（Nacos Config）
4. 第12-13章：负载均衡（LoadBalancer）
5. 第14-18章：服务调用（OpenFeign）
6. 第19-23章：服务网关（Gateway）
7. 第24-26章：熔断降级（Sentinel、Resilience4j）
8. 第27-29章：消息驱动（Stream）
9. 第30-32章：分布式事务（Seata）
10. 第33-36章：可观测性（OpenTelemetry、SkyWalking、Prometheus、ELK）
11. 第37章：综合面试题

**继续学习建议**：
1. 实践所有示例代码
2. 搭建完整的微服务项目
3. 深入研究感兴趣的技术
4. 关注技术社区和最新发展

**祝你在微服务架构领域取得成功！** 🚀

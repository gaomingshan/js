# 第35章：Spring Cloud 综合面试题

> **本章目标**：系统复习 Spring Cloud 核心知识点，掌握高频面试题，提升面试竞争力

---

## 一、微服务架构基础（20题）

### 1. 什么是微服务架构？与单体架构有什么区别？⭐⭐⭐⭐⭐

**参考答案**：

**微服务架构定义**：
将单一应用拆分为一组小型服务，每个服务运行在独立进程中，服务间通过轻量级通信机制（HTTP/RPC）交互，每个服务围绕特定业务能力构建，可以独立部署。

**与单体架构对比**：

| 维度 | 单体架构 | 微服务架构 |
|------|----------|------------|
| **部署** | 整体部署 | 独立部署 |
| **扩展** | 垂直扩展（加配置） | 水平扩展（加实例） |
| **开发** | 技术栈统一 | 技术栈异构 |
| **容错** | 局部故障影响全局 | 服务隔离 |
| **团队** | 大团队 | 小团队自治 |
| **复杂度** | 业务逻辑复杂 | 分布式系统复杂 |

**优势**：
- 服务独立部署，互不影响
- 按需扩展特定服务
- 技术栈灵活选择
- 故障隔离，局部降级

**劣势**：
- 分布式事务复杂
- 服务间调用网络开销
- 链路追踪困难
- 运维成本增加

---

### 2. 微服务拆分的原则和方法？⭐⭐⭐⭐⭐

**参考答案**：

**拆分原则**：
1. **单一职责**：一个服务只做一件事
2. **高内聚低耦合**：服务内部功能紧密，服务间依赖少
3. **业务驱动**：按业务边界拆分（DDD）
4. **团队规模**：2-pizza 团队（8-10人）
5. **数据独立**：每个服务拥有独立数据库

**拆分方法**：

**1. 按业务能力拆分（推荐）**：
```
电商系统：
├─ 用户服务（注册、登录、个人中心）
├─ 商品服务（商品管理、库存）
├─ 订单服务（下单、支付、发货）
├─ 营销服务（优惠券、秒杀）
└─ 搜索服务（全文检索）
```

**2. 按子域拆分（DDD）**：
```
核心域：订单、支付
支撑域：用户、商品
通用域：短信、邮件
```

**3. 按数据拆分**：
```
用户数据 → 用户服务
订单数据 → 订单服务
```

**拆分步骤**：
1. 识别业务边界
2. 梳理服务依赖
3. 设计服务接口
4. 拆分数据库
5. 灰度上线

---

### 3. 微服务架构面临的挑战及解决方案？⭐⭐⭐⭐

**参考答案**：

| 挑战 | 解决方案 |
|------|----------|
| **服务间调用** | OpenFeign、RestTemplate + LoadBalancer |
| **服务注册发现** | Nacos、Eureka |
| **配置管理** | Nacos Config、Spring Cloud Config |
| **负载均衡** | LoadBalancer、Ribbon |
| **熔断降级** | Sentinel、Resilience4j |
| **API 网关** | Spring Cloud Gateway、Zuul |
| **分布式事务** | Seata（AT/TCC/SAGA）、消息队列 |
| **链路追踪** | Sleuth + Zipkin |
| **消息驱动** | Spring Cloud Stream |
| **安全认证** | OAuth2 + JWT |
| **监控告警** | Prometheus + Grafana |
| **日志收集** | ELK（Elasticsearch + Logstash + Kibana） |

---

### 4. CAP 理论和 BASE 理论？⭐⭐⭐⭐

**参考答案**：

**CAP 理论**：
- **C（Consistency）**：一致性，所有节点同一时刻数据相同
- **A（Availability）**：可用性，服务一直可用
- **P（Partition Tolerance）**：分区容错性，网络分区时系统仍能工作

**关系**：最多满足两个
- **CP**：保证一致性和分区容错，牺牲可用性（Nacos CP模式、ZooKeeper）
- **AP**：保证可用性和分区容错，牺牲一致性（Nacos AP模式、Eureka）
- **CA**：保证一致性和可用性，但无法分区（单机数据库）

**BASE 理论**（CAP 的延伸）：
- **BA（Basically Available）**：基本可用
- **S（Soft State）**：软状态，允许中间状态
- **E（Eventually Consistent）**：最终一致性

**应用**：
- 强一致性场景：支付、库存扣减（Seata AT）
- 最终一致性场景：订单消息、积分增加（消息队列）

---

### 5. 如何保证微服务的高可用？⭐⭐⭐⭐⭐

**参考答案**：

**1. 服务层面**：
- 集群部署（至少3个实例）
- 负载均衡（LoadBalancer）
- 健康检查（Actuator）
- 优雅启停

**2. 容错保护**：
- 限流（Sentinel）
- 熔断降级（Sentinel）
- 超时配置
- 重试机制
- 降级方案（Fallback）

**3. 数据层面**：
- 数据库主从复用
- Redis 集群
- 消息队列集群

**4. 监控告警**：
- 链路追踪（Sleuth + Zipkin）
- 指标监控（Prometheus + Grafana）
- 日志收集（ELK）
- 告警通知（AlertManager）

**5. 部署层面**：
- 容器化（Docker）
- 编排（Kubernetes）
- 灰度发布
- 自动扩缩容（HPA）

---

## 二、Nacos 注册中心（20题）

### 6. Nacos 和 Eureka 的区别？⭐⭐⭐⭐⭐

**参考答案**：

| 维度 | Nacos | Eureka |
|------|-------|--------|
| **CAP** | CP+AP（可切换） | AP |
| **健康检查** | TCP/HTTP/MySQL | 心跳 |
| **配置中心** | 支持 | 不支持 |
| **服务发现** | 实时推送 | 定时拉取（30秒） |
| **控制台** | 功能丰富 | 基础功能 |
| **维护状态** | 活跃 | 停止维护 |
| **性能** | 高（百万级服务） | 中（万级服务） |
| **社区** | 阿里开源，国内活跃 | Netflix，国外 |

**选型建议**：
- 新项目：Nacos（一体化解决方案）
- 老项目：根据现状选择

---

### 7. Nacos 服务注册与发现流程？⭐⭐⭐⭐⭐

**参考答案**：

**注册流程**：
```
1. 服务启动
2. 读取配置（spring.cloud.nacos.discovery.server-addr）
3. 向 Nacos Server 发送注册请求
   - 服务名
   - IP + 端口
   - 元数据
4. Nacos Server 保存实例信息
   - 内存（Map）
   - 持久化（MySQL/Derby）
5. 服务定期发送心跳（默认5秒）
6. Nacos 健康检查
   - 临时实例：心跳检测（超时15秒标记不健康）
   - 永久实例：主动探测（HTTP/TCP/MySQL）
```

**发现流程**：
```
1. 服务启动时订阅目标服务
2. Nacos Server 推送服务列表
3. 本地缓存服务实例列表
4. Nacos 监听服务变化
5. 服务变更 → Nacos 实时推送更新
6. 本地更新实例列表
7. LoadBalancer 从列表中选择实例
```

**关键点**：
- **推模型**：Nacos 主动推送变更（实时性好）
- **拉模型**：Eureka 定时拉取（30秒延迟）

---

### 8. Nacos 如何实现高可用？⭐⭐⭐⭐

**参考答案**：

**集群部署**：
- 至少3个节点（保证选举）
- Raft 协议选举 Leader
- 数据同步到所有节点

**数据持久化**：
- MySQL 存储服务注册信息
- 内置数据库 Derby（单机模式）

**健康检查**：
- 临时实例：心跳检测
- 永久实例：主动探测

**故障转移**：
- 客户端连接多个 Nacos 节点
- 自动切换到可用节点

**配置示例**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos1:8848,nacos2:8848,nacos3:8848
```

---

### 9. Nacos 的临时实例和永久实例有什么区别？⭐⭐⭐⭐

**参考答案**：

| 维度 | 临时实例 | 永久实例 |
|------|----------|----------|
| **注册方式** | 默认 | ephemeral=false |
| **健康检查** | 客户端心跳 | Nacos 主动探测 |
| **下线机制** | 心跳超时自动下线 | 手动下线 |
| **数据持久化** | 内存 | MySQL |
| **适用场景** | 微服务（动态扩缩容） | 数据库、MQ（固定IP） |

**配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false  # 永久实例
```

---

### 10. Nacos 的命名空间、分组、Data ID 有什么作用？⭐⭐⭐⭐

**参考答案**：

**三层隔离**：
```
Namespace（命名空间）
└─ Group（分组）
   └─ Data ID（配置文件）
```

**1. Namespace（环境隔离）**：
- 作用：隔离不同环境
- 示例：dev、test、prod
- 配置：`spring.cloud.nacos.discovery.namespace=prod`

**2. Group（业务隔离）**：
- 作用：隔离不同业务
- 示例：DEFAULT_GROUP、ORDER_GROUP
- 配置：`spring.cloud.nacos.discovery.group=ORDER_GROUP`

**3. Data ID（配置文件）**：
- 格式：`${prefix}-${spring.profiles.active}.${file-extension}`
- 示例：`user-service-prod.yml`

**完整路径**：
```
Namespace: prod
└─ Group: ORDER_GROUP
   └─ Data ID: user-service-prod.yml
```

---

## 三、配置管理（15题）

### 11. 配置动态刷新原理（@RefreshScope）？⭐⭐⭐⭐⭐

**参考答案**：

**核心原理**：
```
1. @RefreshScope 创建 CGLIB 代理对象
2. RefreshScope 维护 Bean 缓存
3. 配置变更触发 refresh 事件
4. 清空 RefreshScope 缓存（销毁 Bean）
5. 下次调用时重新创建 Bean（使用最新配置）
```

**工作流程**：
```java
// 1. @RefreshScope 注解
@RefreshScope
@Component
public class ConfigBean {
    @Value("${config.value}")
    private String value;
}

// 2. 配置变更
Nacos Config 变更 → 发布 RefreshEvent

// 3. RefreshScope 处理
@EventListener(RefreshEvent.class)
public void onRefresh(RefreshEvent event) {
    // 清空缓存
    refreshScope.refreshAll();
}

// 4. Bean 重新创建
ConfigBean bean = context.getBean(ConfigBean.class);
// 触发 RefreshScope.get() → 重新创建 Bean → 注入最新配置
```

**注意事项**：
- 只支持 `@Value` 和 `@ConfigurationProperties`
- 不支持 `server.port`、数据源等配置
- 不会重新执行 `@PostConstruct` 方法

---

### 12. Nacos Config vs Spring Cloud Config？⭐⭐⭐⭐

**参考答案**：

| 维度 | Nacos Config | Spring Cloud Config |
|------|--------------|---------------------|
| **定位** | 一体化（注册+配置） | 独立配置中心 |
| **推送方式** | 实时推送 | 需要 Bus（RabbitMQ/Kafka） |
| **控制台** | 可视化管理 | 无（需自建） |
| **版本管理** | 支持历史版本 | Git 版本管理 |
| **性能** | 高 | 中 |
| **学习成本** | 低 | 高 |

**推荐**：新项目使用 Nacos Config

---

### 13. 如何保证配置的安全性？⭐⭐⭐⭐

**参考答案**：

**1. 加密存储**：
```yaml
# Jasypt 加密
spring:
  datasource:
    password: ENC(encrypted-password)
```

**2. 权限控制**：
- Nacos 配置权限管理
- 只读/读写权限

**3. 审计日志**：
- 记录配置变更历史
- 操作人、时间、内容

**4. 多环境隔离**：
- Namespace 隔离（dev/test/prod）
- 防止误操作

**5. 敏感配置**：
- 数据库密码
- Redis 密码
- API Key
- Secret Key

---

### 14. 配置中心宕机了怎么办？⭐⭐⭐⭐

**参考答案**：

**1. 本地缓存**：
```
Nacos Client 自动缓存配置到本地文件
路径：{user.home}/nacos/config/
即使 Nacos 宕机，服务重启也能读取缓存配置
```

**2. 集群部署**：
```
Nacos 集群（3个节点）
客户端自动切换到可用节点
```

**3. 降级方案**：
```yaml
# 配置默认值
spring:
  cloud:
    nacos:
      config:
        server-addr: nacos1:8848,nacos2:8848
        failFast: false  # 快速失败关闭
```

**4. 监控告警**：
```
Prometheus 监控 Nacos 健康状态
告警通知运维人员
```

---

### 15. 配置灰度发布怎么实现？⭐⭐⭐⭐

**参考答案**：

**Nacos 灰度发布**：

**步骤**：
```
1. 创建 Beta 配置
2. 指定灰度 IP 列表
   - 192.168.1.10
   - 192.168.1.11
3. 发布 Beta 配置
4. 灰度 IP 的实例读取 Beta 配置
5. 其他实例读取正式配置
6. 验证无问题后，全量发布
```

**配置示例**：
```
Nacos 控制台 → 配置管理 → 配置列表
→ 编辑 → Beta 发布
→ 填写灰度 IP：192.168.1.10,192.168.1.11
→ 发布
```

---

## 四、负载均衡与服务调用（15题）

### 16. 客户端负载均衡 vs 服务端负载均衡？⭐⭐⭐⭐⭐

**参考答案**：

| 维度 | 客户端负载均衡 | 服务端负载均衡 |
|------|----------------|----------------|
| **位置** | 集成在客户端 | 独立负载均衡器 |
| **服务列表** | 从注册中心获取 | 配置在负载均衡器 |
| **选择实例** | 客户端选择 | 负载均衡器选择 |
| **示例** | LoadBalancer、Ribbon | Nginx、LVS、HAProxy |
| **性能** | 高（无额外跳转） | 中（多一跳） |
| **集中管理** | 否 | 是 |

**使用场景**：
- 微服务内部调用：客户端负载均衡
- 对外暴露接口：服务端负载均衡（Nginx）

---

### 17. LoadBalancer 工作原理？⭐⭐⭐⭐⭐

**参考答案**：

**核心流程**：
```
1. RestTemplate 发起请求
   GET http://user-service/user/1

2. LoadBalancerInterceptor 拦截请求

3. 从 ServiceInstanceListSupplier 获取服务列表
   - 从 Nacos 获取 user-service 实例列表
   - 本地缓存

4. ReactorLoadBalancer 执行负载均衡策略
   - RoundRobinLoadBalancer（默认轮询）
   - RandomLoadBalancer（随机）
   - 自定义策略

5. 选择一个实例
   - 192.168.1.10:8001

6. 替换服务名为实际地址
   GET http://192.168.1.10:8001/user/1

7. 发起 HTTP 请求
```

**核心组件**：
- `LoadBalancerClient`：负载均衡客户端
- `ReactorLoadBalancer`：负载均衡器
- `ServiceInstanceListSupplier`：服务列表提供者

---

### 18. Feign 工作原理？⭐⭐⭐⭐⭐

**参考答案**：

**核心流程**：
```
1. @EnableFeignClients 扫描 @FeignClient 接口

2. FeignClientFactoryBean 创建 JDK 动态代理
   - ReflectiveFeign.FeignInvocationHandler

3. 注入代理对象到 Spring 容器

4. 调用接口方法
   UserDTO user = userClient.getUser(1L);

5. InvocationHandler 拦截方法调用

6. RequestTemplate 构建 HTTP 请求
   - 解析 @GetMapping("/user/{id}")
   - 替换路径参数：/user/1
   - 设置请求头

7. Encoder 编码请求体（JSON）

8. LoadBalancer 选择服务实例
   - user-service → 192.168.1.10:8001

9. Client 发起 HTTP 请求
   - 默认：HttpURLConnection
   - OkHttp/HttpClient（推荐）

10. Decoder 解码响应体
    - JSON → UserDTO

11. 返回结果
```

**核心组件**：
- `Contract`：解析注解
- `Encoder/Decoder`：编解码
- `Client`：HTTP 客户端
- `Retryer`：重试器
- `RequestInterceptor`：请求拦截器

---

### 19. Feign 性能优化？⭐⭐⭐⭐⭐

**参考答案**：

**优化措施**：

**1. 连接池**：
```yaml
feign:
  okhttp:
    enabled: true  # 使用 OkHttp（连接池）
  
  client:
    config:
      default:
        connectTimeout: 2000  # 连接超时 2秒
        readTimeout: 5000  # 读取超时 5秒
```

**2. 压缩**：
```yaml
feign:
  compression:
    request:
      enabled: true
      mime-types: text/xml,application/xml,application/json
      min-request-size: 2048
    response:
      enabled: true
```

**3. 日志级别**：
```yaml
feign:
  client:
    config:
      default:
        loggerLevel: BASIC  # 生产环境使用 BASIC
```

**4. 批量调用并行化**：
```java
// 串行调用（慢）
UserDTO user = userClient.getUser(1L);  // 100ms
OrderDTO order = orderClient.getOrder(1L);  // 100ms
// 总耗时：200ms

// 并行调用（快）
CompletableFuture<UserDTO> userFuture = CompletableFuture.supplyAsync(
    () -> userClient.getUser(1L)
);
CompletableFuture<OrderDTO> orderFuture = CompletableFuture.supplyAsync(
    () -> orderClient.getOrder(1L)
);
UserDTO user = userFuture.get();
OrderDTO order = orderFuture.get();
// 总耗时：100ms
```

**5. 缓存**：
```java
@Cacheable(value = "user", key = "#id")
public UserDTO getUser(Long id) {
    return userClient.getUser(id);
}
```

---

### 20. Feign 调用超时如何处理？⭐⭐⭐⭐

**参考答案**：

**1. 配置超时时间**：
```yaml
feign:
  client:
    config:
      user-service:
        connectTimeout: 2000  # 连接超时 2秒
        readTimeout: 5000  # 读取超时 5秒
```

**2. 重试机制**：
```java
@Bean
public Retryer feignRetryer() {
    return new Retryer.Default(100, 1000, 3);
    // 初始间隔100ms，最大间隔1秒，最多重试3次
}
```

**3. 降级处理**：
```java
@FeignClient(
    name = "user-service",
    fallback = UserClientFallback.class
)
public interface UserClient {
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable Long id);
}

@Component
public class UserClientFallback implements UserClient {
    @Override
    public UserDTO getUser(Long id) {
        // 超时降级：返回默认数据
        UserDTO user = new UserDTO();
        user.setName("服务超时");
        return user;
    }
}
```

---

## 五、服务网关（15题）

### 21. Gateway 核心概念？⭐⭐⭐⭐⭐

**参考答案**：

**三大核心**：

**1. Route（路由）**：
- 由 ID、目标 URI、断言集合、过滤器集合组成
- 定义请求如何路由

**2. Predicate（断言）**：
- 路由匹配条件
- 内置断言：Path、Method、Header、Query、Cookie、Host、RemoteAddr、Weight、Time

**3. Filter（过滤器）**：
- 对请求/响应进行修改
- GatewayFilter：路由级别
- GlobalFilter：全局级别

**工作流程**：
```
1. 请求到达 Gateway
2. RoutePredicateHandlerMapping 匹配路由
3. FilteringWebHandler 执行过滤器链
4. GlobalFilter（Pre，优先级从高到低）
5. GatewayFilter（Pre）
6. 转发请求到下游服务
7. GatewayFilter（Post）
8. GlobalFilter（Post，优先级从低到高）
9. 返回响应
```

---

### 22. Gateway 过滤器执行顺序？⭐⭐⭐⭐

**参考答案**：

**优先级规则**：
- `@Order` 值越小，优先级越高
- 数字越小越先执行（Pre）
- 数字越大越后执行（Post）

**推荐优先级**：
```
-200：跨域处理（CORS）
-100：认证（Authentication）
-99：鉴权（Authorization）
-50：限流（Rate Limit）
-10：日志（Logging）
0：监控（Metrics）
10：缓存（Cache）
```

**执行流程**：
```
Request
  ↓
GlobalFilter（-200）→ CORS
GlobalFilter（-100）→ Authentication
GlobalFilter（-99）→ Authorization
GlobalFilter（-50）→ Rate Limit
GatewayFilter（Pre）→ 路由过滤器
  ↓
转发请求
  ↓
GatewayFilter（Post）
GlobalFilter（10）→ Cache
GlobalFilter（0）→ Metrics
GlobalFilter（-10）→ Logging
  ↓
Response
```

---

### 23. 如何实现 Gateway 统一鉴权？⭐⭐⭐⭐⭐

**参考答案**：

**实现方案**：
```java
@Component
@Order(-100)
public class AuthenticationFilter implements GlobalFilter {
    
    private static final String SECRET_KEY = "jwt-secret-key";
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        
        // 白名单放行
        if (isWhiteListed(path)) {
            return chain.filter(exchange);
        }
        
        // 提取 Token
        String token = extractToken(exchange.getRequest());
        if (token == null) {
            return unauthorized(exchange, "Missing token");
        }
        
        try {
            // 验证 JWT
            Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
            
            // 提取用户信息
            String userId = claims.get("userId", String.class);
            String username = claims.getSubject();
            
            // 传递给下游服务
            ServerHttpRequest request = exchange.getRequest().mutate()
                .header("X-User-Id", userId)
                .header("X-Username", username)
                .build();
            
            return chain.filter(exchange.mutate().request(request).build());
            
        } catch (ExpiredJwtException e) {
            return unauthorized(exchange, "Token expired");
        } catch (JwtException e) {
            return unauthorized(exchange, "Invalid token");
        }
    }
    
    private String extractToken(ServerHttpRequest request) {
        String authorization = request.getHeaders().getFirst("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
    
    private boolean isWhiteListed(String path) {
        return path.startsWith("/public/") || 
               path.equals("/oauth/token") ||
               path.equals("/login");
    }
    
    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }
}
```

---

### 24. Gateway 如何实现限流？⭐⭐⭐⭐

**参考答案**：

**内置限流过滤器**：
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-route
          uri: lb://user-service
          predicates:
            - Path=/user/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10  # 令牌桶填充速率（每秒10个）
                redis-rate-limiter.burstCapacity: 20  # 令牌桶容量
                key-resolver: "#{@ipKeyResolver}"  # Key 解析器
```

**Key 解析器**：
```java
@Bean
public KeyResolver ipKeyResolver() {
    return exchange -> Mono.just(
        exchange.getRequest().getRemoteAddress().getHostName()
    );
}

@Bean
public KeyResolver userKeyResolver() {
    return exchange -> Mono.just(
        exchange.getRequest().getHeaders().getFirst("X-User-Id")
    );
}
```

**自定义限流过滤器**：
```java
@Component
@Order(-50)
public class CustomRateLimitFilter implements GlobalFilter {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String ip = exchange.getRequest().getRemoteAddress().getHostName();
        String key = "rate_limit:" + ip;
        
        Long count = redisTemplate.opsForValue().increment(key);
        
        if (count == 1) {
            redisTemplate.expire(key, 1, TimeUnit.SECONDS);
        }
        
        if (count > 100) {  // 每秒最多100个请求
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }
        
        return chain.filter(exchange);
    }
}
```

---

### 25. Gateway vs Zuul？⭐⭐⭐⭐

**参考答案**：

| 维度 | Gateway | Zuul |
|------|---------|------|
| **技术栈** | Spring WebFlux（响应式） | Servlet（阻塞式） |
| **性能** | 高 | 中 |
| **维护** | 活跃 | Zuul 1.x 停止维护 |
| **功能** | 丰富（限流、熔断） | 基础 |
| **学习成本** | 中（响应式编程） | 低 |

**推荐**：新项目使用 Gateway

---

## 六、熔断降级（15题）

### 26. Sentinel 核心功能？⭐⭐⭐⭐⭐

**参考答案**：

**五大核心功能**：

**1. 流量控制**：
- QPS 限流
- 线程数限流
- 匀速排队

**2. 熔断降级**：
- 慢调用比例
- 异常比例
- 异常数

**3. 系统保护**：
- CPU 使用率
- 系统负载（Load）
- 平均 RT
- 并发线程数
- 入口 QPS

**4. 热点参数限流**：
- 对特定参数值限流
- 例如：热门商品单独限流

**5. 集群限流**：
- 集群级别统一限流

---

### 27. Sentinel 熔断策略？⭐⭐⭐⭐⭐

**参考答案**：

**三种熔断策略**：

**1. 慢调用比例**：
```
配置：
- 最大 RT：500ms
- 比例阈值：50%
- 熔断时长：10秒
- 最小请求数：5

规则：
1秒内请求数 >= 5，且慢调用比例 >= 50%，触发熔断
熔断10秒后进入半开状态，放行一个请求
如果请求成功且 RT < 500ms，关闭熔断
如果请求失败或 RT >= 500ms，继续熔断
```

**2. 异常比例**：
```
配置：
- 比例阈值：30%
- 熔断时长：10秒
- 最小请求数：5

规则：
1秒内请求数 >= 5，且异常比例 >= 30%，触发熔断
```

**3. 异常数**：
```
配置：
- 异常数：10
- 熔断时长：10秒
- 最小请求数：5

规则：
1分钟内异常数 >= 10，触发熔断
```

---

### 28. Sentinel vs Hystrix？⭐⭐⭐⭐

**参考答案**：

| 维度 | Sentinel | Hystrix |
|------|----------|---------|
| **维护状态** | 活跃 | 停止维护 |
| **隔离策略** | 信号量 | 线程池/信号量 |
| **熔断策略** | 慢调用/异常比例/异常数 | 异常比例 |
| **限流** | 支持（QPS/线程数） | 不支持 |
| **实时监控** | 控制台 | 需自建Dashboard |
| **规则配置** | 控制台/代码/Nacos | 代码/配置文件 |
| **社区** | 阿里，国内活跃 | Netflix |

**推荐**：使用 Sentinel

---

### 29. 如何实现服务降级？⭐⭐⭐⭐

**参考答案**：

**方案1：Feign Fallback**：
```java
@FeignClient(
    name = "user-service",
    fallback = UserClientFallback.class
)
public interface UserClient {
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable Long id);
}

@Component
public class UserClientFallback implements UserClient {
    @Override
    public UserDTO getUser(Long id) {
        // 降级：返回默认数据
        UserDTO user = new UserDTO();
        user.setName("服务降级");
        return user;
    }
}
```

**方案2：Sentinel 降级**：
```java
@Service
public class OrderService {
    
    @SentinelResource(
        value = "createOrder",
        blockHandler = "createOrderBlockHandler",  # 限流降级
        fallback = "createOrderFallback"  # 异常降级
    )
    public OrderDTO createOrder(OrderDTO order) {
        // 业务逻辑
        return orderMapper.insert(order);
    }
    
    // 限流降级方法
    public OrderDTO createOrderBlockHandler(OrderDTO order, BlockException ex) {
        OrderDTO result = new OrderDTO();
        result.setMessage("系统繁忙，请稍后重试");
        return result;
    }
    
    // 异常降级方法
    public OrderDTO createOrderFallback(OrderDTO order, Throwable ex) {
        OrderDTO result = new OrderDTO();
        result.setMessage("服务异常");
        return result;
    }
}
```

---

### 30. 如何实现热点参数限流？⭐⭐⭐⭐

**参考答案**：

**场景**：对热门商品单独限流

**实现**：
```java
@Service
public class ProductService {
    
    @SentinelResource(value = "getProduct")
    public ProductDTO getProduct(Long productId) {
        return productMapper.selectById(productId);
    }
}

// 热点规则
ParamFlowRule rule = new ParamFlowRule();
rule.setResource("getProduct");
rule.setParamIdx(0);  // 第0个参数（productId）
rule.setCount(100);  // 默认阈值100

// 热点参数特殊配置
ParamFlowItem item = new ParamFlowItem();
item.setObject("1001");  // 商品ID 1001
item.setCount(1000);  // 特殊阈值1000
rule.setParamFlowItemList(Collections.singletonList(item));

ParamFlowRuleManager.loadRules(Collections.singletonList(rule));
```

**效果**：
- 商品1001：每秒最多1000个请求
- 其他商品：每秒最多100个请求

---

## 七、链路追踪与分布式事务（10题）

### 31. Sleuth + Zipkin 链路追踪原理？⭐⭐⭐⭐⭐

**参考答案**：

**核心概念**：
- **Trace ID**：全局唯一追踪ID，贯穿整个调用链
- **Span ID**：单次调用的唯一ID
- **Parent Span ID**：父级Span ID

**工作流程**：
```
1. 请求到达 Gateway
2. Sleuth 生成 Trace ID 和 Span ID
3. 通过 HTTP 请求头传递
   - X-B3-TraceId: abc123
   - X-B3-SpanId: def456
4. Gateway 调用 User Service
5. User Service 提取 Trace ID
6. User Service 创建新的 Span ID
7. User Service 调用 Order Service
8. Order Service 提取 Trace ID
9. 所有 Span 上报到 Zipkin Server
10. Zipkin UI 展示调用链路
```

**调用链示例**：
```
Trace ID: abc123

Gateway (Span A: def456)
├─ User Service (Span B: ghi789, Parent: def456)
│  └─ MySQL (Span D: mno345, Parent: ghi789)
└─ Order Service (Span C: jkl012, Parent: def456)
   └─ MySQL (Span E: pqr678, Parent: jkl012)
```

---

### 32. Seata 分布式事务原理（AT 模式）？⭐⭐⭐⭐⭐

**参考答案**：

**核心组件**：
- **TC**：事务协调器（Seata Server）
- **TM**：事务管理器（发起方）
- **RM**：资源管理器（参与方）

**工作流程**：

**Phase 1（注册与执行）**：
```
1. TM 向 TC 注册全局事务 → 生成 XID
2. TM 传播 XID 到下游服务
3. RM 向 TC 注册分支事务
4. RM 执行业务 SQL
5. RM 记录 undo_log（前后镜像）
6. RM 提交本地事务（释放锁）
7. RM 向 TC 报告分支状态
8. RM 获取全局锁（防脏写）
```

**Phase 2（提交/回滚）**：
```
提交流程：
1. TM 向 TC 发起全局提交
2. TC 通知所有 RM 提交
3. RM 异步删除 undo_log
4. TC 删除全局事务记录

回滚流程：
1. TM 向 TC 发起全局回滚
2. TC 通知所有 RM 回滚
3. RM 使用 undo_log 恢复数据
4. RM 删除 undo_log
5. TC 删除全局事务记录
```

**关键点**：
- **undo_log**：记录数据前后镜像，用于回滚
- **全局锁**：防止脏写
- **异步提交**：性能优化

---

### 33. AT 模式 vs TCC 模式？⭐⭐⭐⭐

**参考答案**：

| 维度 | AT 模式 | TCC 模式 |
|------|---------|----------|
| **一致性** | 最终一致 | 最终一致 |
| **性能** | 中 | 高 |
| **侵入性** | 低（无代码侵入） | 高（需实现Try/Confirm/Cancel） |
| **锁** | 有全局锁 | 无锁 |
| **数据库支持** | 普通数据库 | 普通数据库 |
| **适用场景** | 通用业务 | 高并发核心业务 |

**选型建议**：
- 通用业务：AT 模式（简单）
- 高并发业务：TCC 模式（性能好）

---

### 34. 如何保证分布式事务的数据一致性？⭐⭐⭐⭐

**参考答案**：

**方案对比**：

| 方案 | 一致性 | 性能 | 复杂度 | 适用场景 |
|------|--------|------|--------|----------|
| **Seata AT** | 最终一致 | 中 | 低 | 通用 |
| **Seata TCC** | 最终一致 | 高 | 高 | 高并发 |
| **消息队列** | 最终一致 | 高 | 中 | 异步解耦 |
| **Seata SAGA** | 最终一致 | 中 | 高 | 长事务 |
| **XA** | 强一致 | 低 | 低 | 强一致性要求 |

**推荐**：
- 强一致性：XA（性能差）
- 最终一致性：消息队列（推荐）
- 同步事务：Seata AT（简单）
- 高并发事务：Seata TCC（性能好）

---

### 35. 分布式事务的幂等性如何保证？⭐⭐⭐⭐

**参考答案**：

**方案1：Redis 记录消息ID**：
```java
public void processOrder(OrderDTO order) {
    String messageId = order.getMessageId();
    String key = "order:processed:" + messageId;
    
    Boolean isNew = redisTemplate.opsForValue().setIfAbsent(
        key, "1", 24, TimeUnit.HOURS
    );
    
    if (Boolean.TRUE.equals(isNew)) {
        // 首次处理
        orderMapper.insert(order);
    } else {
        // 重复处理，忽略
        log.warn("Duplicate order: {}", messageId);
    }
}
```

**方案2：数据库唯一索引**：
```sql
CREATE TABLE `order` (
  `id` BIGINT PRIMARY KEY,
  `order_no` VARCHAR(64) UNIQUE,  -- 唯一索引
  `user_id` BIGINT,
  `amount` DECIMAL(10,2)
);
```

```java
try {
    orderMapper.insert(order);
} catch (DuplicateKeyException e) {
    log.warn("Duplicate order: {}", order.getOrderNo());
}
```

**方案3：业务逻辑幂等**：
```java
// 扣减库存（UPDATE + WHERE 保证幂等）
@Update("UPDATE inventory SET stock = stock - #{quantity} " +
        "WHERE product_id = #{productId} AND stock >= #{quantity}")
int deductStock(@Param("productId") Long productId, 
                @Param("quantity") Integer quantity);
```

---

## 八、综合实战（10题）

### 36. 如何设计一个高可用的微服务架构？⭐⭐⭐⭐⭐

**参考答案**：

**架构设计**：

**1. 服务治理**：
- Nacos 集群（3节点+）
- 服务健康检查
- 优雅启停

**2. 负载均衡**：
- 客户端负载均衡（LoadBalancer）
- 服务端负载均衡（Nginx）

**3. 容错保护**：
- 限流（Sentinel）
- 熔断降级
- 超时配置
- 重试策略

**4. API 网关**：
- Gateway 集群
- 认证授权
- 限流熔断
- 日志监控

**5. 数据一致性**：
- 分布式事务（Seata）
- 消息队列（RabbitMQ/Kafka）

**6. 监控告警**：
- 链路追踪（Sleuth + Zipkin）
- 指标监控（Prometheus + Grafana）
- 日志收集（ELK）

**7. 部署运维**：
- 容器化（Docker）
- 编排（Kubernetes）
- CI/CD（GitLab CI/Jenkins）
- 灰度发布

---

### 37. 微服务性能优化有哪些方法？⭐⭐⭐⭐⭐

**参考答案**：

**优化方向**：

**1. 网络优化**：
- 使用连接池（OkHttp）
- 开启压缩
- 减少网络调用（批量接口）
- 使用本地缓存

**2. 缓存优化**：
- 本地缓存（Caffeine）
- 分布式缓存（Redis）
- 缓存预热
- 缓存穿透/击穿/雪崩防护

**3. 数据库优化**：
- 索引优化
- SQL 优化
- 读写分离
- 分库分表
- 连接池配置

**4. 异步处理**：
- 消息队列
- @Async 异步方法
- CompletableFuture 并行调用

**5. JVM 优化**：
- 合理设置堆内存（-Xms、-Xmx）
- 选择合适的 GC（G1GC）
- GC 参数调优

**6. 代码优化**：
- 减少锁竞争
- 对象复用
- 批量操作

---

### 38. 如何排查微服务的性能问题？⭐⭐⭐⭐⭐

**参考答案**：

**排查步骤**：

**1. 定位瓶颈**：
- Zipkin 查看调用链路
- 找到耗时最长的服务/接口

**2. 分析原因**：
- **慢 SQL**：数据库日志、执行计划
- **外部调用慢**：Feign 日志、网络延迟
- **GC 频繁**：jstat、GC 日志
- **线程阻塞**：jstack、线程dump

**3. 优化措施**：
- SQL 优化（索引、分页）
- 增加缓存
- 调整 JVM 参数
- 异步处理
- 批量调用

**4. 压测验证**：
- JMeter/Gatling 压测
- 对比优化前后指标

**常用工具**：
- **Zipkin**：链路追踪
- **Prometheus + Grafana**：指标监控
- **Arthas**：在线诊断
- **jstack**：线程堆栈
- **jmap**：内存dump
- **jstat**：GC 统计

---

### 39. 微服务如何进行灰度发布？⭐⭐⭐⭐

**参考答案**：

**方案1：金丝雀发布（Canary）**：
```
1. 部署新版本（10% 实例）
2. 观察监控指标（错误率、延迟）
3. 逐步扩大流量（20% → 50% → 100%）
4. 如果异常，立即回滚
```

**Kubernetes 实现**：
```yaml
# 稳定版本（90%）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service-stable
spec:
  replicas: 9
  template:
    metadata:
      labels:
        app: user-service
        version: v1

---
# 金丝雀版本（10%）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service-canary
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: user-service
        version: v2
```

**方案2：蓝绿部署**：
```
1. 部署新版本（绿环境）
2. 测试验证
3. 切换流量到绿环境
4. 保留蓝环境一段时间（快速回滚）
```

**方案3：Nacos 配置灰度**：
```
1. 创建 Beta 配置
2. 指定灰度 IP 列表
3. 灰度 IP 读取 Beta 配置
4. 验证无问题后全量发布
```

---

### 40. 微服务的服务雪崩如何防止？⭐⭐⭐⭐⭐

**参考答案**：

**雪崩场景**：
```
服务A → 服务B → 服务C
服务C 故障 → 服务B 调用超时 → 服务B 线程池耗尽 → 
服务A 调用超时 → 服务A 线程池耗尽 → 整个系统崩溃
```

**防止措施**：

**1. 超时配置**：
```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 2000
        readTimeout: 5000
```

**2. 限流**：
```java
@SentinelResource(
    value = "getUser",
    blockHandler = "getUserBlockHandler"
)
public UserDTO getUser(Long id) {
    return userMapper.selectById(id);
}
```

**3. 熔断降级**：
```java
@FeignClient(
    name = "user-service",
    fallback = UserClientFallback.class
)
public interface UserClient {
    @GetMapping("/user/{id}")
    UserDTO getUser(@PathVariable Long id);
}
```

**4. 隔离**：
- 线程池隔离
- 信号量隔离

**5. 降级**：
```
核心服务 → 保持可用
非核心服务 → 降级/关闭
```

**6. 监控告警**：
- 实时监控错误率
- 及时发现问题
- 快速响应

---

## 学习建议

### 必背知识点（⭐⭐⭐⭐⭐）

1. 微服务架构优缺点
2. Nacos vs Eureka
3. 配置动态刷新原理（@RefreshScope）
4. 客户端负载均衡原理
5. Feign 工作原理
6. Gateway 过滤器机制
7. Sentinel 限流熔断
8. Seata 分布式事务（AT 模式）
9. Sleuth + Zipkin 链路追踪
10. 如何设计高可用微服务架构

### 重点理解（⭐⭐⭐⭐）

1. 微服务拆分原则
2. CAP/BASE 理论
3. Nacos 服务注册发现流程
4. LoadBalancer 工作原理
5. Feign 性能优化
6. Gateway 统一鉴权
7. Sentinel 熔断策略
8. AT vs TCC
9. 性能优化方法
10. 灰度发布方案

### 了解即可（⭐⭐⭐）

1. Spring Cloud Config
2. Ribbon 负载均衡
3. Zuul 网关
4. Hystrix 熔断器
5. Seata SAGA/XA 模式

---

## 面试技巧

### 1. STAR 法则

**S（Situation）**：项目背景
**T（Task）**：面临的任务
**A（Action）**：采取的行动
**R（Result）**：取得的结果

**示例**：
```
面试官：你在项目中如何解决分布式事务？

回答：
S：我们电商项目下单流程涉及订单服务、库存服务、账户服务
T：需要保证三个服务的数据一致性
A：采用 Seata AT 模式
   1. 引入 Seata 依赖
   2. 配置 Seata Server
   3. 使用 @GlobalTransactional 注解
   4. 创建 undo_log 表
R：成功解决分布式事务问题，订单成功率 99.9%
```

### 2. 从浅入深

```
第一层：概念（是什么）
第二层：原理（怎么做）
第三层：实战（用过吗）
第四层：优化（怎么优化）
```

### 3. 举例说明

```
理论 + 实战案例
不要只讲理论，结合项目经验
```

### 4. 对比分析

```
Nacos vs Eureka
AT vs TCC
Gateway vs Zuul
客户端负载均衡 vs 服务端负载均衡
```

### 5. 主动提问

```
展示对技术的思考
询问面试官公司的技术栈
```

---

## 学习资源

### 官方文档

- [Spring Cloud 官方文档](https://spring.io/projects/spring-cloud)
- [Nacos 官方文档](https://nacos.io/zh-cn/)
- [Sentinel 官方文档](https://sentinelguard.io/zh-cn/)
- [Seata 官方文档](https://seata.io/zh-cn/)

### 推荐书籍

- 《Spring Cloud 微服务实战》
- 《Spring Cloud Alibaba 微服务原理与实战》
- 《微服务设计》

### 学习路径

**第一阶段（1-2周）**：基础知识
- 微服务架构概念
- Nacos 注册中心
- Nacos 配置中心

**第二阶段（2-3周）**：核心组件
- LoadBalancer 负载均衡
- OpenFeign 服务调用
- Gateway 网关
- Sentinel 熔断降级

**第三阶段（1-2周）**：高级特性
- Stream 消息驱动
- Sleuth + Zipkin 链路追踪
- Seata 分布式事务

**第四阶段（1周）**：实战项目
- 电商项目实战
- 部署上线

**第五阶段（1周）**：面试准备
- 刷题巩固
- 模拟面试

---

**祝您面试顺利，拿到心仪 Offer！🎉**

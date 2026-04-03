# 第 20 章：路由配置与 Predicate 断言

> **学习目标**：掌握 Gateway Predicate 使用、理解路由匹配规则、能够实现动态路由  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. 路由配置详解（代码配置 vs yaml 配置）

### 1.1 YAML 配置方式

**application.yml**：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service-route
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
            - Method=GET,POST
          filters:
            - StripPrefix=1
```

**优点**：
- ✅ 配置简洁
- ✅ 易于理解
- ✅ 支持热更新（结合配置中心）

**缺点**：
- ❌ 复杂逻辑难以表达
- ❌ 缺少类型检查

### 1.2 代码配置方式

```java
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service-route", r -> r
                .path("/api/users/**")
                .and()
                .method(HttpMethod.GET, HttpMethod.POST)
                .filters(f -> f.stripPrefix(1))
                .uri("lb://user-service")
            )
            .build();
    }
}
```

**优点**：
- ✅ 类型安全
- ✅ 支持复杂逻辑
- ✅ IDE 自动提示

**缺点**：
- ❌ 修改需要重新编译
- ❌ 配置不够直观

### 1.3 混合配置方式

```java
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // 复杂路由使用代码配置
            .route("complex-route", r -> r
                .path("/api/orders/**")
                .and()
                .header("X-Request-Type", "urgent")
                .filters(f -> f
                    .stripPrefix(1)
                    .addRequestHeader("X-Priority", "high")
                    .retry(config -> config
                        .setRetries(3)
                        .setMethods(HttpMethod.GET)
                    )
                )
                .uri("lb://order-service")
            )
            .build();
    }
}
```

```yaml
# 简单路由使用YAML配置
spring:
  cloud:
    gateway:
      routes:
        - id: user-service-route
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
```

---

## 2. 11种内置 Predicate 详解

### 2.1 Path（路径匹配）

**最常用的断言**

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: path-route
          uri: lb://user-service
          predicates:
            - Path=/api/users/**    # 匹配 /api/users/ 开头的所有路径
```

**支持 Ant 风格路径**：

```yaml
predicates:
  - Path=/api/users/{id}           # 单层路径变量
  - Path=/api/users/{segment}/**   # 多层路径变量
```

**获取路径变量**：

```java
@Component
public class PathVariableFilter implements GatewayFilter {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        Map<String, String> uriVariables = ServerWebExchangeUtils
            .getUriTemplateVariables(exchange);
        
        String id = uriVariables.get("id");
        log.info("路径变量 id: {}", id);
        
        return chain.filter(exchange);
    }
}
```

### 2.2 Method（HTTP 方法匹配）

```yaml
predicates:
  - Method=GET           # 只匹配 GET 请求
  - Method=GET,POST      # 匹配 GET 或 POST
  - Method=GET,POST,PUT  # 匹配多个方法
```

**示例**：

```yaml
routes:
  # 只读路由
  - id: user-query-route
    uri: lb://user-service
    predicates:
      - Path=/api/users/**
      - Method=GET
    filters:
      - StripPrefix=1
  
  # 写入路由
  - id: user-modify-route
    uri: lb://user-service
    predicates:
      - Path=/api/users/**
      - Method=POST,PUT,DELETE
    filters:
      - StripPrefix=1
      - name: RequestRateLimiter  # 写操作限流
        args:
          redis-rate-limiter.replenishRate: 10
```

### 2.3 Header（请求头匹配）

```yaml
predicates:
  # 精确匹配
  - Header=X-Request-Id, \d+    # 请求头 X-Request-Id 的值必须是数字
  
  # 正则匹配
  - Header=Authorization, Bearer.*   # Authorization 必须以 Bearer 开头
```

**示例**：

```yaml
routes:
  # 移动端路由
  - id: mobile-route
    uri: lb://mobile-service
    predicates:
      - Path=/api/**
      - Header=User-Agent, .*Mobile.*
  
  # PC端路由
  - id: web-route
    uri: lb://web-service
    predicates:
      - Path=/api/**
      - Header=User-Agent, .*Chrome.*|.*Firefox.*
```

### 2.4 Query（查询参数匹配）

```yaml
predicates:
  # 参数存在即可
  - Query=version
  
  # 参数值匹配
  - Query=version, v1
  
  # 正则匹配
  - Query=page, \d+    # page 必须是数字
```

**示例**：

```yaml
routes:
  # API v1 路由
  - id: api-v1-route
    uri: lb://user-service-v1
    predicates:
      - Path=/api/users/**
      - Query=version, v1
  
  # API v2 路由
  - id: api-v2-route
    uri: lb://user-service-v2
    predicates:
      - Path=/api/users/**
      - Query=version, v2
```

### 2.5 Cookie（Cookie 匹配）

```yaml
predicates:
  # Cookie 存在
  - Cookie=sessionId
  
  # Cookie 值匹配
  - Cookie=userType, vip
  
  # 正则匹配
  - Cookie=userId, \d+
```

**示例**：

```yaml
routes:
  # VIP 用户路由
  - id: vip-route
    uri: lb://vip-service
    predicates:
      - Path=/api/**
      - Cookie=userType, vip
  
  # 普通用户路由
  - id: normal-route
    uri: lb://normal-service
    predicates:
      - Path=/api/**
      - Cookie=userType, normal
```

### 2.6 Host（主机名匹配）

```yaml
predicates:
  # 精确匹配
  - Host=www.example.com
  
  # 通配符匹配
  - Host=*.example.com
  
  # 多个主机
  - Host=www.example.com,api.example.com
  
  # 模板匹配
  - Host={subdomain}.example.com
```

**示例**：

```yaml
routes:
  # 管理后台路由
  - id: admin-route
    uri: lb://admin-service
    predicates:
      - Host=admin.example.com
  
  # 用户前台路由
  - id: user-route
    uri: lb://user-service
    predicates:
      - Host=www.example.com
  
  # 多租户路由
  - id: tenant-route
    uri: lb://tenant-service
    predicates:
      - Host={tenant}.example.com
```

**获取主机名变量**：

```java
Map<String, String> uriVariables = ServerWebExchangeUtils
    .getUriTemplateVariables(exchange);
String tenant = uriVariables.get("tenant");
```

### 2.7 RemoteAddr（远程地址匹配）

```yaml
predicates:
  # 单个IP
  - RemoteAddr=192.168.1.100
  
  # CIDR 表示法
  - RemoteAddr=192.168.1.0/24
  
  # 多个IP段
  - RemoteAddr=192.168.1.0/24,10.0.0.0/8
```

**示例**：

```yaml
routes:
  # 内网访问路由
  - id: internal-route
    uri: lb://internal-service
    predicates:
      - Path=/internal/**
      - RemoteAddr=192.168.0.0/16,10.0.0.0/8
  
  # 公网访问路由
  - id: public-route
    uri: lb://public-service
    predicates:
      - Path=/api/**
```

### 2.8 Weight（权重路由）

**用于灰度发布、A/B 测试**

```yaml
routes:
  # 80% 流量到旧版本
  - id: user-service-v1
    uri: lb://user-service-v1
    predicates:
      - Path=/api/users/**
      - Weight=group1, 80
  
  # 20% 流量到新版本
  - id: user-service-v2
    uri: lb://user-service-v2
    predicates:
      - Path=/api/users/**
      - Weight=group1, 20
```

**注意**：
- Weight 的第一个参数是分组名称（必须相同）
- 第二个参数是权重值
- 同一分组的权重总和不需要是 100

### 2.9 Before（时间之前）

```yaml
predicates:
  # 2024-12-31 23:59:59 之前有效
  - Before=2024-12-31T23:59:59.999+08:00[Asia/Shanghai]
```

**示例**：

```yaml
routes:
  # 限时活动路由（活动结束前）
  - id: promotion-route
    uri: lb://promotion-service
    predicates:
      - Path=/api/promotion/**
      - Before=2024-12-31T23:59:59.999+08:00[Asia/Shanghai]
```

### 2.10 After（时间之后）

```yaml
predicates:
  # 2024-01-01 00:00:00 之后有效
  - After=2024-01-01T00:00:00.000+08:00[Asia/Shanghai]
```

**示例**：

```yaml
routes:
  # 新功能发布路由（指定时间后）
  - id: new-feature-route
    uri: lb://new-feature-service
    predicates:
      - Path=/api/new-feature/**
      - After=2024-06-01T00:00:00.000+08:00[Asia/Shanghai]
```

### 2.11 Between（时间区间）

```yaml
predicates:
  # 指定时间段内有效
  - Between=2024-06-01T00:00:00.000+08:00[Asia/Shanghai],2024-12-31T23:59:59.999+08:00[Asia/Shanghai]
```

**示例**：

```yaml
routes:
  # 促销活动路由（时间段内）
  - id: sale-route
    uri: lb://sale-service
    predicates:
      - Path=/api/sale/**
      - Between=2024-11-11T00:00:00.000+08:00[Asia/Shanghai],2024-11-11T23:59:59.999+08:00[Asia/Shanghai]
```

---

## 3. Predicate 组合使用

### 3.1 AND 组合（默认）

**YAML 配置**：

```yaml
routes:
  - id: complex-route
    uri: lb://user-service
    predicates:
      - Path=/api/users/**
      - Method=GET
      - Header=Authorization, Bearer.*
      # 以上条件必须全部满足（AND）
```

**代码配置**：

```java
.route("complex-route", r -> r
    .path("/api/users/**")
    .and()
    .method(HttpMethod.GET)
    .and()
    .header("Authorization", "Bearer.*")
    .uri("lb://user-service")
)
```

### 3.2 OR 组合

**需要使用代码配置**：

```java
@Bean
public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("or-route", r -> r
            .predicate(exchange -> {
                // 自定义 OR 逻辑
                ServerHttpRequest request = exchange.getRequest();
                
                // 条件1：路径匹配
                boolean pathMatch = request.getPath().toString()
                    .startsWith("/api/users");
                
                // 条件2：特定请求头
                boolean headerMatch = request.getHeaders()
                    .containsKey("X-Special-Access");
                
                // OR 组合
                return pathMatch || headerMatch;
            })
            .uri("lb://user-service")
        )
        .build();
}
```

### 3.3 复杂组合示例

```java
@Bean
public RouteLocator complexRouteLocator(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("vip-route", r -> r
            // (路径匹配 AND 方法为GET) AND (VIP用户 OR 管理员)
            .path("/api/premium/**")
            .and()
            .method(HttpMethod.GET)
            .and()
            .predicate(exchange -> {
                HttpHeaders headers = exchange.getRequest().getHeaders();
                String userType = headers.getFirst("X-User-Type");
                return "vip".equals(userType) || "admin".equals(userType);
            })
            .uri("lb://premium-service")
        )
        .build();
}
```

---

## 4. 动态路由配置

### 4.1 基于 Nacos 的动态路由

**路由配置存储在 Nacos**：

```json
[
  {
    "id": "user-service-route",
    "uri": "lb://user-service",
    "predicates": [
      {
        "name": "Path",
        "args": {
          "pattern": "/api/users/**"
        }
      }
    ],
    "filters": [
      {
        "name": "StripPrefix",
        "args": {
          "parts": 1
        }
      }
    ],
    "order": 0
  }
]
```

**动态路由监听器**：

```java
@Component
@Slf4j
public class DynamicRouteService implements ApplicationEventPublisherAware {
    
    @Autowired
    private RouteDefinitionWriter routeDefinitionWriter;
    
    private ApplicationEventPublisher publisher;
    
    @Autowired
    private NacosConfigManager nacosConfigManager;
    
    @PostConstruct
    public void init() {
        try {
            // 监听 Nacos 配置变化
            nacosConfigManager.getConfigService().addListener(
                "gateway-routes.json",
                "DEFAULT_GROUP",
                new Listener() {
                    @Override
                    public Executor getExecutor() {
                        return null;
                    }
                    
                    @Override
                    public void receiveConfigInfo(String configInfo) {
                        log.info("接收到路由配置变更");
                        updateRoutes(configInfo);
                    }
                }
            );
        } catch (NacosException e) {
            log.error("初始化动态路由失败", e);
        }
    }
    
    /**
     * 更新路由
     */
    public void updateRoutes(String configInfo) {
        try {
            // 1. 解析路由配置
            List<RouteDefinition> routes = parseRoutes(configInfo);
            
            // 2. 清空现有路由
            clearRoutes();
            
            // 3. 添加新路由
            for (RouteDefinition route : routes) {
                routeDefinitionWriter.save(Mono.just(route)).subscribe();
            }
            
            // 4. 发布刷新事件
            publisher.publishEvent(new RefreshRoutesEvent(this));
            
            log.info("路由更新成功，共 {} 条路由", routes.size());
            
        } catch (Exception e) {
            log.error("更新路由失败", e);
        }
    }
    
    /**
     * 解析路由配置
     */
    private List<RouteDefinition> parseRoutes(String configInfo) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readValue(configInfo, 
                new TypeReference<List<RouteDefinition>>() {});
        } catch (IOException e) {
            throw new RuntimeException("解析路由配置失败", e);
        }
    }
    
    /**
     * 清空路由
     */
    private void clearRoutes() {
        // 获取所有路由ID并删除
        // 实现略
    }
    
    @Override
    public void setApplicationEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }
}
```

### 4.2 路由管理接口

```java
@RestController
@RequestMapping("/gateway/routes")
@RequiredArgsConstructor
public class RouteController {
    
    private final DynamicRouteService dynamicRouteService;
    private final RouteDefinitionLocator routeDefinitionLocator;
    
    /**
     * 查询所有路由
     */
    @GetMapping
    public Mono<List<RouteDefinition>> listRoutes() {
        return routeDefinitionLocator.getRouteDefinitions()
            .collectList();
    }
    
    /**
     * 添加路由
     */
    @PostMapping
    public Mono<String> addRoute(@RequestBody RouteDefinition definition) {
        return dynamicRouteService.add(definition)
            .then(Mono.just("添加成功"));
    }
    
    /**
     * 更新路由
     */
    @PutMapping("/{id}")
    public Mono<String> updateRoute(@PathVariable String id, 
                                     @RequestBody RouteDefinition definition) {
        return dynamicRouteService.update(id, definition)
            .then(Mono.just("更新成功"));
    }
    
    /**
     * 删除路由
     */
    @DeleteMapping("/{id}")
    public Mono<String> deleteRoute(@PathVariable String id) {
        return dynamicRouteService.delete(id)
            .then(Mono.just("删除成功"));
    }
}
```

---

## 5. 路由优先级

### 5.1 order 属性

**order 值越小，优先级越高**：

```yaml
routes:
  # 优先级最高
  - id: specific-route
    uri: lb://specific-service
    predicates:
      - Path=/api/users/1
    order: 1
  
  # 优先级较低
  - id: general-route
    uri: lb://general-service
    predicates:
      - Path=/api/users/**
    order: 10
```

**代码配置**：

```java
.route("specific-route", r -> r
    .path("/api/users/1")
    .uri("lb://specific-service")
    .order(1)  // 设置优先级
)
```

### 5.2 路由匹配规则

```
1. 精确匹配优先于模糊匹配
   /api/users/1 > /api/users/** > /api/**

2. 相同路径，order 小的优先
   order=1 > order=10

3. 无 order 时，配置顺序决定优先级
```

**示例**：

```yaml
routes:
  # 特殊用户路由（优先级1）
  - id: admin-route
    uri: lb://admin-service
    predicates:
      - Path=/api/users/admin
    order: 1
  
  # 指定ID用户路由（优先级2）
  - id: user-id-route
    uri: lb://user-service
    predicates:
      - Path=/api/users/{id}
    order: 2
  
  # 所有用户路由（优先级3）
  - id: user-list-route
    uri: lb://user-service
    predicates:
      - Path=/api/users/**
    order: 3
```

---

## 6. 路由刷新机制

### 6.1 自动刷新

**Actuator 端点**：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: gateway
```

**刷新路由**：

```bash
# 查看所有路由
curl http://localhost:8080/actuator/gateway/routes

# 刷新路由
curl -X POST http://localhost:8080/actuator/gateway/refresh
```

### 6.2 手动刷新

```java
@Component
@RequiredArgsConstructor
public class RouteRefreshService {
    
    private final ApplicationEventPublisher publisher;
    
    /**
     * 刷新路由
     */
    public void refresh() {
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }
}
```

### 6.3 定时刷新

```java
@Component
@Slf4j
public class RouteRefreshScheduler {
    
    @Autowired
    private RouteRefreshService routeRefreshService;
    
    @Scheduled(cron = "0 */5 * * * ?")  // 每5分钟刷新一次
    public void refreshRoutes() {
        log.info("定时刷新路由");
        routeRefreshService.refresh();
    }
}
```

---

## 7. 实战案例

### 7.1 多版本 API 路由

```yaml
routes:
  # API v1
  - id: api-v1-users
    uri: lb://user-service-v1
    predicates:
      - Path=/v1/users/**
    filters:
      - StripPrefix=1
  
  # API v2
  - id: api-v2-users
    uri: lb://user-service-v2
    predicates:
      - Path=/v2/users/**
    filters:
      - StripPrefix=1
  
  # 默认版本（通过请求头）
  - id: api-default-users
    uri: lb://user-service-v2
    predicates:
      - Path=/api/users/**
      - Header=API-Version, v2
    filters:
      - StripPrefix=1
```

### 7.2 灰度发布路由

```yaml
routes:
  # 灰度用户（通过Cookie标识）
  - id: user-service-beta
    uri: lb://user-service-v2
    predicates:
      - Path=/api/users/**
      - Cookie=beta-user, true
    filters:
      - StripPrefix=1
  
  # 普通用户
  - id: user-service-stable
    uri: lb://user-service-v1
    predicates:
      - Path=/api/users/**
    filters:
      - StripPrefix=1
```

### 7.3 多租户路由

```yaml
routes:
  # 租户A
  - id: tenant-a-route
    uri: lb://tenant-a-service
    predicates:
      - Path=/api/**
      - Header=X-Tenant-Id, tenant-a
  
  # 租户B
  - id: tenant-b-route
    uri: lb://tenant-b-service
    predicates:
      - Path=/api/**
      - Header=X-Tenant-Id, tenant-b
  
  # 默认租户
  - id: default-tenant-route
    uri: lb://default-service
    predicates:
      - Path=/api/**
```

---

## 8. 面试要点

### 8.1 基础问题

**Q1：Gateway 有哪些内置 Predicate？**

11种：Path、Method、Header、Query、Cookie、Host、RemoteAddr、Weight、Before、After、Between

**Q2：如何配置动态路由？**

1. 基于 Nacos 配置中心
2. 监听配置变化
3. 更新 RouteDefinition
4. 发布 RefreshRoutesEvent

### 8.2 进阶问题

**Q3：如何实现灰度发布？**

方案：
1. Weight Predicate（权重路由）
2. Cookie/Header Predicate（标识灰度用户）
3. 动态调整权重比例

**Q4：路由优先级如何确定？**

1. order 值小的优先
2. 精确匹配优先于模糊匹配
3. 配置顺序决定优先级

### 8.3 架构问题

**Q5：如何设计多租户网关？**

1. Header/Cookie 传递租户ID
2. Predicate 匹配租户
3. 路由到租户专属服务
4. 或通过 Filter 注入租户上下文

---

## 9. 参考资料

**官方文档**：
- [Spring Cloud Gateway Predicates](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gateway-request-predicates-factories)

**推荐阅读**：
- [Gateway 路由配置最佳实践](https://spring.io/blog/2019/07/01/spring-cloud-gateway)

---

**下一章预告**：第 21 章将深入学习 Filter 过滤器详解，包括 Filter 工作原理、内置 GatewayFilter 详解（30+种）、GlobalFilter 全局过滤器、Filter 执行顺序、自定义 Filter 开发等内容。

# 第 6 章：服务发现最佳实践

> **学习目标**：掌握服务发现生产环境最佳实践、灰度发布、常见问题排查  
> **预计时长**：2-3 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. 服务实例健康检查策略

### 1.1 多层健康检查

**三层健康检查**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        # 第一层：Nacos 心跳
        heart-beat-interval: 5000
        heart-beat-timeout: 15000
        
        # 第二层：Actuator 健康检查
        health-check-path: /actuator/health
        
management:
  endpoint:
    health:
      # 第三层：自定义健康指标
      show-details: always
```

**自定义健康检查**：

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(3)) {
                return Health.up()
                    .withDetail("database", "MySQL")
                    .withDetail("status", "connected")
                    .build();
            }
        } catch (SQLException e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
        return Health.down().build();
    }
}

@Component
public class RedisHealthIndicator implements HealthIndicator {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Override
    public Health health() {
        try {
            String pong = redisTemplate.execute((RedisCallback<String>) 
                connection -> connection.ping());
            
            if ("PONG".equals(pong)) {
                return Health.up().withDetail("redis", "available").build();
            }
        } catch (Exception e) {
            return Health.down().withException(e).build();
        }
        return Health.down().build();
    }
}
```

### 1.2 健康检查最佳实践

**配置建议**：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
      probes:
        enabled: true  # 启用 K8s 探针
  health:
    # 依赖服务健康检查
    db:
      enabled: true
    redis:
      enabled: true
    # 磁盘空间检查
    diskspace:
      enabled: true
      threshold: 10GB
```

**K8s 探针集成**：

```yaml
# Kubernetes Deployment
spec:
  containers:
    - name: user-service
      livenessProbe:
        httpGet:
          path: /actuator/health/liveness
          port: 8081
        initialDelaySeconds: 60
        periodSeconds: 10
        
      readinessProbe:
        httpGet:
          path: /actuator/health/readiness
          port: 8081
        initialDelaySeconds: 30
        periodSeconds: 5
```

---

## 2. 服务优雅上下线

### 2.1 优雅上线

**预热机制**：

```java
@Component
public class ServiceWarmupListener implements ApplicationListener<ApplicationReadyEvent> {
    
    @Autowired
    private NacosServiceRegistry registry;
    
    @Autowired
    private NacosRegistration registration;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // 1. 设置初始权重为 0.1（10%）
        registration.getMetadata().put("weight", "0.1");
        registry.register(registration);
        
        // 2. 逐步提升权重
        ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
        AtomicInteger weight = new AtomicInteger(1);
        
        executor.scheduleAtFixedRate(() -> {
            if (weight.get() < 10) {
                registration.getMetadata().put("weight", 
                    String.valueOf(weight.incrementAndGet() * 0.1));
                registry.setStatus(registration, "UP");
                log.info("权重提升至: {}", weight.get() * 0.1);
            } else {
                executor.shutdown();
            }
        }, 30, 30, TimeUnit.SECONDS);  // 每30秒提升一次
    }
}
```

**预加载缓存**：

```java
@Component
public class CachePreloader implements ApplicationRunner {
    
    @Autowired
    private ProductService productService;
    
    @Override
    public void run(ApplicationArguments args) {
        log.info("开始预加载缓存...");
        
        // 预加载热门商品
        productService.preloadHotProducts();
        
        // 预加载配置
        productService.preloadConfigs();
        
        log.info("缓存预加载完成");
    }
}
```

### 2.2 优雅下线

**Spring Boot 优雅关闭**：

```yaml
server:
  shutdown: graceful  # 优雅关闭

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s  # 等待30秒
```

**自定义下线流程**：

```java
@Component
@Slf4j
public class GracefulShutdownHandler {
    
    @Autowired
    private NacosServiceRegistry registry;
    
    @Autowired
    private NacosRegistration registration;
    
    @PreDestroy
    public void onShutdown() {
        log.info("开始优雅下线...");
        
        try {
            // 1. 从 Nacos 注销服务
            registry.deregister(registration);
            log.info("已从 Nacos 注销");
            
            // 2. 等待正在处理的请求完成
            Thread.sleep(5000);
            log.info("等待请求处理完成");
            
            // 3. 关闭数据库连接池
            closeDataSource();
            
            // 4. 关闭 Redis 连接
            closeRedis();
            
            log.info("优雅下线完成");
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("下线过程被中断", e);
        }
    }
    
    private void closeDataSource() {
        // 关闭数据源
    }
    
    private void closeRedis() {
        // 关闭 Redis
    }
}
```

**下线接口**：

```java
@RestController
@RequiredArgsConstructor
public class ShutdownController {
    
    private final ApplicationContext context;
    
    @PostMapping("/shutdown")
    public String shutdown() {
        new Thread(() -> {
            try {
                Thread.sleep(1000);  // 延迟1秒，确保响应返回
                SpringApplication.exit(context, () -> 0);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        return "服务即将关闭";
    }
}
```

---

## 3. 灰度发布与金丝雀部署

### 3.1 基于版本的灰度发布

**配置版本号**：

```yaml
# 稳定版本（v1.0）
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: 1.0.0
          gray: false

# 灰度版本（v1.1）
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: 1.1.0
          gray: true
```

**自定义负载均衡策略**：

```java
@Configuration
public class GrayLoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> grayLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory factory) {
        
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new GrayLoadBalancer(
            factory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name);
    }
}

public class GrayLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private final ObjectProvider<ServiceInstanceListSupplier> supplierProvider;
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = supplierProvider.getIfAvailable();
        
        return supplier.get(request).next()
            .map(instances -> getInstanceResponse(instances, request));
    }
    
    private Response<ServiceInstance> getInstanceResponse(
            List<ServiceInstance> instances, Request request) {
        
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 从请求中获取灰度标识
        DefaultRequestContext context = (DefaultRequestContext) request.getContext();
        HttpHeaders headers = context.getClientRequest().getHeaders();
        String grayFlag = headers.getFirst("X-Gray-Flag");
        
        // 根据灰度标识选择实例
        if ("true".equals(grayFlag)) {
            // 灰度用户：10% 流量到灰度版本
            return selectGrayInstance(instances);
        } else {
            // 普通用户：全部流量到稳定版本
            return selectStableInstance(instances);
        }
    }
    
    private Response<ServiceInstance> selectGrayInstance(List<ServiceInstance> instances) {
        List<ServiceInstance> grayInstances = instances.stream()
            .filter(i -> "true".equals(i.getMetadata().get("gray")))
            .collect(Collectors.toList());
        
        if (!grayInstances.isEmpty()) {
            int index = ThreadLocalRandom.current().nextInt(grayInstances.size());
            return new DefaultResponse(grayInstances.get(index));
        }
        
        return selectStableInstance(instances);
    }
    
    private Response<ServiceInstance> selectStableInstance(List<ServiceInstance> instances) {
        List<ServiceInstance> stableInstances = instances.stream()
            .filter(i -> !"true".equals(i.getMetadata().get("gray")))
            .collect(Collectors.toList());
        
        if (!stableInstances.isEmpty()) {
            int index = ThreadLocalRandom.current().nextInt(stableInstances.size());
            return new DefaultResponse(stableInstances.get(index));
        }
        
        return new EmptyResponse();
    }
}
```

### 3.2 网关层灰度路由

**Gateway 灰度过滤器**：

```java
@Component
@Order(-1)
public class GrayRoutingFilter implements GlobalFilter {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // 1. 获取用户 ID
        String userId = request.getHeaders().getFirst("X-User-Id");
        
        // 2. 判断是否为灰度用户（10% 用户）
        boolean isGrayUser = isGrayUser(userId);
        
        // 3. 设置灰度标识
        if (isGrayUser) {
            ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-Gray-Flag", "true")
                .build();
            exchange = exchange.mutate().request(modifiedRequest).build();
        }
        
        return chain.filter(exchange);
    }
    
    private boolean isGrayUser(String userId) {
        if (userId == null) {
            return false;
        }
        
        // 10% 用户进入灰度
        return userId.hashCode() % 10 == 0;
    }
}
```

### 3.3 灰度发布流程

**发布步骤**：

```
1. 部署灰度版本（gray=true, weight=0）
   ↓
2. 验证灰度环境是否正常
   ↓
3. 逐步放量（1% → 5% → 10% → 50% → 100%）
   ↓
4. 监控指标（错误率、响应时间、业务指标）
   ↓
5. 若无问题，继续放量；若有问题，立即回滚
   ↓
6. 全量上线后，下线旧版本
```

**自动化放量脚本**：

```java
@RestController
@RequiredArgsConstructor
public class GrayReleaseController {
    
    private final NacosNamingService namingService;
    
    @PostMapping("/gray/release")
    public String grayRelease(@RequestParam String serviceName,
                               @RequestParam int targetPercentage) throws Exception {
        
        // 1. 获取所有实例
        List<Instance> instances = namingService.getAllInstances(serviceName);
        
        // 2. 分离灰度实例和稳定实例
        List<Instance> grayInstances = instances.stream()
            .filter(i -> "true".equals(i.getMetadata().get("gray")))
            .collect(Collectors.toList());
        
        List<Instance> stableInstances = instances.stream()
            .filter(i -> !"true".equals(i.getMetadata().get("gray")))
            .collect(Collectors.toList());
        
        // 3. 计算权重
        double grayWeight = targetPercentage / 100.0;
        double stableWeight = 1 - grayWeight;
        
        // 4. 更新权重
        for (Instance instance : grayInstances) {
            instance.setWeight(grayWeight * 10);  // Nacos 权重范围 0-10
            namingService.registerInstance(serviceName, instance);
        }
        
        for (Instance instance : stableInstances) {
            instance.setWeight(stableWeight * 10);
            namingService.registerInstance(serviceName, instance);
        }
        
        return String.format("灰度流量已调整至 %d%%", targetPercentage);
    }
}
```

---

## 4. 多环境服务隔离

### 4.1 Namespace 环境隔离

**创建命名空间**：

```bash
# 通过 Nacos 控制台创建
1. 登录 Nacos 控制台
2. 命名空间 → 新建命名空间
3. 输入：
   - 命名空间ID：dev
   - 命名空间名：开发环境
   
4. 重复创建 test、prod 命名空间
```

**配置命名空间**：

```yaml
# application-dev.yml
spring:
  cloud:
    nacos:
      discovery:
        namespace: dev
        group: DEFAULT_GROUP

# application-test.yml
spring:
  cloud:
    nacos:
      discovery:
        namespace: test
        group: DEFAULT_GROUP

# application-prod.yml
spring:
  cloud:
    nacos:
      discovery:
        namespace: prod
        group: DEFAULT_GROUP
```

**Maven Profile 配置**：

```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <spring.profiles.active>dev</spring.profiles.active>
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>
    <profile>
        <id>test</id>
        <properties>
            <spring.profiles.active>test</spring.profiles.active>
        </properties>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <spring.profiles.active>prod</spring.profiles.active>
        </properties>
    </profile>
</profiles>
```

**打包部署**：

```bash
# 开发环境
mvn clean package -Pdev

# 测试环境
mvn clean package -Ptest

# 生产环境
mvn clean package -Pprod
```

### 4.2 Group 业务隔离

**按业务分组**：

```yaml
# 电商业务
spring:
  cloud:
    nacos:
      discovery:
        group: ECOMMERCE_GROUP

# 支付业务
spring:
  cloud:
    nacos:
      discovery:
        group: PAYMENT_GROUP

# 物流业务
spring:
  cloud:
    nacos:
      discovery:
        group: LOGISTICS_GROUP
```

### 4.3 Cluster 地域隔离

**配置集群**：

```yaml
# 北京机房
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: BEIJING
        metadata:
          region: beijing
          zone: zone-a

# 上海机房
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: SHANGHAI
        metadata:
          region: shanghai
          zone: zone-b
```

**同集群优先路由**：

```java
@Configuration
public class ClusterLoadBalancerConfig {
    
    @Value("${spring.cloud.nacos.discovery.cluster-name}")
    private String localCluster;
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> clusterLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory factory) {
        
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new ClusterPreferenceLoadBalancer(
            factory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name,
            localCluster);
    }
}

public class ClusterPreferenceLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private final String localCluster;
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        return supplier.get(request).next()
            .map(instances -> {
                // 优先选择同集群实例
                List<ServiceInstance> sameCluster = instances.stream()
                    .filter(i -> localCluster.equals(i.getMetadata().get("cluster")))
                    .collect(Collectors.toList());
                
                if (!sameCluster.isEmpty()) {
                    return new DefaultResponse(sameCluster.get(0));
                }
                
                // 同集群无可用实例，选择其他集群
                return new DefaultResponse(instances.get(0));
            });
    }
}
```

---

## 5. 跨地域服务访问

### 5.1 多机房部署架构

**架构设计**：

```
                  用户请求
                     ↓
              ┌──────┴──────┐
         北京机房          上海机房
              │              │
    ┌─────────┴────┐  ┌─────┴─────────┐
    │   Gateway    │  │   Gateway     │
    └──────┬───────┘  └───────┬───────┘
           │                  │
    ┌──────┴───────┐  ┌───────┴──────┐
    │ user-service │  │ user-service │
    │ (BEIJING)    │  │ (SHANGHAI)   │
    └──────────────┘  └──────────────┘
```

**配置示例**：

```yaml
# 北京机房配置
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: BEIJING
        metadata:
          region: beijing
          zone: zone-a
          idc: idc-1
```

### 5.2 跨地域路由策略

**就近访问**：

```java
@Component
public class RegionRoutingFilter implements GlobalFilter {
    
    @Value("${spring.cloud.nacos.discovery.metadata.region}")
    private String localRegion;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 设置偏好地域
        exchange.getAttributes().put("preferredRegion", localRegion);
        return chain.filter(exchange);
    }
}
```

**降级策略**：

```java
public class RegionFallbackLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        String preferredRegion = getPreferredRegion(request);
        
        return supplier.get(request).next()
            .map(instances -> {
                // 1. 优先本地域
                List<ServiceInstance> local = filterByRegion(instances, preferredRegion);
                if (!local.isEmpty()) {
                    return select(local);
                }
                
                // 2. 降级到邻近地域
                List<ServiceInstance> nearby = filterNearbyRegion(instances, preferredRegion);
                if (!nearby.isEmpty()) {
                    return select(nearby);
                }
                
                // 3. 最后选择任意实例
                return select(instances);
            });
    }
}
```

---

## 6. 常见问题排查

### 6.1 服务未注册

**问题现象**：
- 服务启动成功，但 Nacos 控制台看不到
- 日志无错误

**排查步骤**：

```bash
# 1. 检查 Nacos Server 是否启动
curl http://localhost:8848/nacos/v1/console/health

# 2. 检查网络连通性
telnet localhost 8848
ping localhost

# 3. 检查配置
# bootstrap.yml 中是否配置了 spring.application.name
# 是否配置了 spring.cloud.nacos.discovery.server-addr

# 4. 查看启动日志
grep "nacos" application.log
grep "register" application.log
```

**常见原因**：

| 原因 | 解决方案 |
|------|---------|
| 未配置服务名 | 添加 `spring.application.name` |
| Nacos 地址错误 | 检查 `server-addr` 配置 |
| 依赖未引入 | 添加 `nacos-discovery` 依赖 |
| 注册被禁用 | 检查 `register-enabled: false` |

### 6.2 服务发现失败

**问题现象**：
- 调用服务时报错 `No instances available for user-service`

**排查步骤**：

```java
@RestController
public class DebugController {
    
    @Autowired
    private DiscoveryClient discoveryClient;
    
    @GetMapping("/debug/services")
    public List<String> getServices() {
        // 1. 查看所有服务
        return discoveryClient.getServices();
    }
    
    @GetMapping("/debug/instances/{serviceName}")
    public List<ServiceInstance> getInstances(@PathVariable String serviceName) {
        // 2. 查看指定服务的实例
        return discoveryClient.getInstances(serviceName);
    }
}
```

**常见原因**：

1. **服务名不匹配**
   ```java
   // 错误
   @FeignClient(name = "user_service")  // 下划线
   
   // 正确
   @FeignClient(name = "user-service")  // 连字符
   ```

2. **命名空间不同**
   ```yaml
   # Provider
   namespace: dev
   
   # Consumer
   namespace: prod  # ❌ 不同命名空间无法发现
   ```

3. **分组不同**
   ```yaml
   # Provider
   group: GROUP_A
   
   # Consumer
   group: GROUP_B  # ❌ 不同分组无法发现
   ```

### 6.3 服务调用超时

**问题现象**：
- 服务调用偶尔超时
- 日志显示 `Read timed out`

**排查步骤**：

```java
// 1. 检查超时配置
@FeignClient(name = "user-service")
public interface UserClient {
    // ...
}

// 配置文件
feign:
  client:
    config:
      user-service:
        connectTimeout: 5000    # 连接超时
        readTimeout: 10000      # 读取超时
```

**优化方案**：

1. **增加超时时间**
   ```yaml
   feign:
     client:
       config:
         default:
           connectTimeout: 10000
           readTimeout: 30000
   ```

2. **启用重试**
   ```java
   @Bean
   public Retryer feignRetryer() {
       return new Retryer.Default(100, 1000, 3);
   }
   ```

3. **优化服务性能**
   - 添加数据库索引
   - 启用缓存
   - 异步处理

### 6.4 服务频繁上下线

**问题现象**：
- Nacos 控制台显示服务频繁上下线
- 健康检查不稳定

**排查步骤**：

```yaml
# 1. 增加心跳间隔
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 10000   # 10秒
        heart-beat-timeout: 30000    # 30秒
        ip-delete-timeout: 60000     # 60秒

# 2. 检查服务负载
# 如果 CPU 使用率 > 80%，考虑扩容

# 3. 检查网络
# ping Nacos Server
# 查看丢包率
```

---

## 7. 生产配置建议

### 7.1 Nacos Server 配置

**集群模式**：

```properties
# conf/cluster.conf
192.168.1.1:8848
192.168.1.2:8848
192.168.1.3:8848
```

**数据库配置**：

```properties
# conf/application.properties
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://192.168.1.100:3306/nacos?characterEncoding=utf8
db.user=nacos
db.password=nacos123
```

**JVM 参数**：

```bash
# bin/startup.sh
export JAVA_OPT="${JAVA_OPT} -server -Xms2g -Xmx2g -Xmn1g"
export JAVA_OPT="${JAVA_OPT} -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
export JAVA_OPT="${JAVA_OPT} -XX:+UseG1GC"
```

### 7.2 客户端配置

**生产配置模板**：

```yaml
spring:
  application:
    name: ${SERVICE_NAME}
  cloud:
    nacos:
      discovery:
        # 集群地址
        server-addr: nacos1.example.com:8848,nacos2.example.com:8848,nacos3.example.com:8848
        
        # 命名空间（生产环境）
        namespace: prod
        group: DEFAULT_GROUP
        cluster-name: ${CLUSTER_NAME}
        
        # 网络配置
        ip: ${POD_IP:}  # K8s 环境使用 POD IP
        port: ${SERVER_PORT}
        
        # 实例配置
        ephemeral: true
        weight: 1.0
        
        # 心跳配置
        heart-beat-interval: 5000
        heart-beat-timeout: 15000
        
        # 元数据
        metadata:
          version: ${APP_VERSION}
          region: ${REGION}
          zone: ${ZONE}
          env: prod
```

### 7.3 监控与告警

**配置 Prometheus 监控**：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: ${spring.application.name}
```

**告警规则**：

```yaml
# Prometheus Alert Rules
groups:
  - name: nacos-discovery
    rules:
      - alert: ServiceInstanceDown
        expr: up{job="nacos-discovery"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务实例下线"
          description: "{{ $labels.instance }} 已下线超过1分钟"
      
      - alert: HighErrorRate
        expr: rate(http_server_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "高错误率"
          description: "错误率超过10%"
```

---

## 8. 面试要点

### 8.1 基础问题

**Q1：如何实现服务的优雅上下线？**

**上线**：
1. 设置初始权重为 0.1
2. 预加载缓存
3. 逐步提升权重

**下线**：
1. 从 Nacos 注销
2. 等待请求处理完成
3. 关闭资源连接

**Q2：灰度发布的实现方式有哪些？**

1. **基于权重**：灰度实例权重 0.1
2. **基于元数据**：metadata.gray=true
3. **基于用户**：特定用户路由到灰度版本

### 8.2 进阶问题

**Q3：如何保证多环境隔离？**

**三层隔离**：
1. **Namespace**：环境隔离（dev/test/prod）
2. **Group**：业务隔离（电商/支付）
3. **Cluster**：地域隔离（北京/上海）

**Q4：服务发现失败如何排查？**

**排查步骤**：
1. 检查服务是否注册（Nacos 控制台）
2. 检查命名空间和分组是否一致
3. 检查服务名是否正确
4. 检查网络连通性

### 8.3 架构问题

**Q5：如何设计一个高可用的服务发现架构？**

**关键点**：
1. Nacos Server 集群部署（3+ 节点）
2. 数据持久化到 MySQL
3. 客户端本地缓存
4. 多地域部署

**Q6：跨地域服务调用如何优化？**

**优化策略**：
1. 同地域优先
2. 邻近地域降级
3. 缓存热点数据
4. 异步复制

---

## 9. 参考资料

**官方文档**：
- [Nacos 最佳实践](https://nacos.io/zh-cn/docs/best-practice.html)
- [服务发现性能优化](https://nacos.io/zh-cn/docs/performance-tuning.html)

**推荐阅读**：
- [灰度发布方案设计](https://nacos.io/zh-cn/blog/gray-release.html)
- [多环境隔离实践](https://nacos.io/zh-cn/blog/multi-environment.html)

---

**下一章预告**：第 7 章将开始学习 Nacos Config 配置管理，包括配置中心快速入门、配置文件命名规范、配置热更新等核心功能。

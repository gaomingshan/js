# 第 5 章：Nacos Discovery 自定义配置与原理

> **学习目标**：掌握 Nacos Discovery 核心配置项、理解服务注册发现底层原理  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. Nacos 核心配置项详解

### 1.1 完整配置示例

```yaml
spring:
  application:
    name: user-service
  cloud:
    nacos:
      discovery:
        # ========== 基础配置 ==========
        server-addr: localhost:8848              # Nacos 服务器地址
        username: nacos                          # 认证用户名
        password: nacos                          # 认证密码
        
        # ========== 命名空间与分组 ==========
        namespace: dev                           # 命名空间 ID
        group: DEFAULT_GROUP                     # 分组名称
        cluster-name: DEFAULT                    # 集群名称
        
        # ========== 网络配置 ==========
        ip: 192.168.1.100                       # 服务 IP（不配置则自动获取）
        port: ${server.port}                    # 服务端口
        network-interface: eth0                 # 网卡名称
        
        # ========== 实例配置 ==========
        ephemeral: true                         # 临时实例（true）/ 持久化实例（false）
        weight: 1.0                             # 权重（0-10000）
        enabled: true                           # 是否启用服务注册
        
        # ========== 心跳配置 ==========
        heart-beat-interval: 5000               # 心跳间隔（毫秒）
        heart-beat-timeout: 15000               # 心跳超时（毫秒）
        ip-delete-timeout: 30000                # IP 删除超时（毫秒）
        
        # ========== 元数据 ==========
        metadata:
          version: 1.0.0                        # 自定义元数据
          region: beijing
          zone: zone-a
        
        # ========== 高级配置 ==========
        register-enabled: true                  # 是否注册服务
        watch:
          enabled: true                         # 是否监听服务变化
        watch-delay: 30000                      # 监听延迟（毫秒）
        log-name: nacos.log                     # 日志文件名
        access-key: your-ak                     # 阿里云 AK（云上使用）
        secret-key: your-sk                     # 阿里云 SK
```

### 1.2 常用配置项说明

**server-addr**：
```yaml
# 单个地址
server-addr: localhost:8848

# 多个地址（集群）
server-addr: 192.168.1.1:8848,192.168.1.2:8848,192.168.1.3:8848
```

**namespace**：
```yaml
# 使用命名空间 ID（不是名称）
namespace: e3c5d1a0-1234-5678-90ab-cdef12345678

# public 命名空间（默认）
namespace: public
```

**group**：
```yaml
# 默认分组
group: DEFAULT_GROUP

# 自定义分组
group: PROD_GROUP
```

---

## 2. 命名空间与分组管理

### 2.1 命名空间（Namespace）

**创建命名空间**：

1. 登录 Nacos 控制台
2. 导航：命名空间 → 新建命名空间
3. 填写信息：
   - 命名空间 ID：`dev`
   - 命名空间名：`开发环境`
   - 描述：`开发环境隔离`

**使用命名空间**：

```yaml
# Provider
spring:
  cloud:
    nacos:
      discovery:
        namespace: dev  # 使用 dev 命名空间

# Consumer（必须在同一命名空间）
spring:
  cloud:
    nacos:
      discovery:
        namespace: dev
```

**隔离效果**：

```
public 命名空间：
  - user-service（实例1）
  - order-service（实例1）

dev 命名空间：
  - user-service（实例2）
  - order-service（实例2）

结论：不同命名空间的服务完全隔离，无法互相发现
```

### 2.2 分组（Group）

**配置分组**：

```yaml
# 服务 A（电商分组）
spring:
  cloud:
    nacos:
      discovery:
        group: ECOMMERCE_GROUP

# 服务 B（支付分组）
spring:
  cloud:
    nacos:
      discovery:
        group: PAYMENT_GROUP
```

**跨分组调用**：

```java
// 默认只能发现同一分组的服务
// 如需跨分组调用，需要在 Feign 中指定
@FeignClient(name = "user-service", 
             configuration = FeignGroupConfig.class)
public interface UserClient {
    // ...
}

// 配置类
@Configuration
public class FeignGroupConfig {
    @Bean
    public RequestInterceptor groupInterceptor() {
        return template -> {
            // 添加分组信息
            template.header("X-Group-Name", "ECOMMERCE_GROUP");
        };
    }
}
```

### 2.3 集群（Cluster）

**配置集群**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: BEIJING  # 北京集群
```

**集群路由**：

```
全局视图：
  user-service
    ├─ BEIJING 集群
    │   ├─ 实例1（192.168.1.1:8081）
    │   └─ 实例2（192.168.1.2:8081）
    └─ SHANGHAI 集群
        ├─ 实例3（192.168.2.1:8081）
        └─ 实例4（192.168.2.2:8081）

路由策略：优先调用同集群实例
```

**同集群优先策略**：

```java
@Configuration
public class LoadBalancerConfig {
    
    @Bean
    public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        return ServiceInstanceListSupplier.builder()
                .withDiscoveryClient()
                .withSameInstancePreference()  // 同集群优先
                .build(context);
    }
}
```

---

## 3. 服务元数据自定义

### 3.1 配置元数据

```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          # 版本号
          version: 1.0.0
          
          # 地域信息
          region: beijing
          zone: zone-a
          idc: idc-1
          
          # 业务信息
          business: ecommerce
          team: backend
          
          # 灰度标识
          gray: false
          
          # 自定义属性
          custom-key: custom-value
```

### 3.2 使用元数据

**获取元数据**：

```java
@RestController
@RequiredArgsConstructor
public class MetadataController {

    private final DiscoveryClient discoveryClient;

    @GetMapping("/metadata/{serviceName}")
    public Map<String, String> getMetadata(@PathVariable String serviceName) {
        List<ServiceInstance> instances = discoveryClient.getInstances(serviceName);
        
        if (!instances.isEmpty()) {
            ServiceInstance instance = instances.get(0);
            return instance.getMetadata();
        }
        
        return Collections.emptyMap();
    }
}
```

**基于元数据的路由**：

```java
@Component
public class VersionRoutingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 从请求头获取版本号
        String version = exchange.getRequest().getHeaders().getFirst("X-Version");
        
        if (version != null) {
            // 设置元数据过滤条件
            exchange.getAttributes().put("version", version);
        }
        
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
```

### 3.3 元数据应用场景

**场景一：灰度发布**

```yaml
# 稳定版本
metadata:
  version: 1.0.0
  gray: false

# 灰度版本
metadata:
  version: 1.1.0
  gray: true
```

**路由规则**：

```java
public class GrayRoutingRule {
    
    public ServiceInstance choose(List<ServiceInstance> instances, String userId) {
        // 10% 用户路由到灰度版本
        if (userId.hashCode() % 10 == 0) {
            return instances.stream()
                .filter(i -> "true".equals(i.getMetadata().get("gray")))
                .findFirst()
                .orElse(instances.get(0));
        }
        
        // 其他用户路由到稳定版本
        return instances.stream()
            .filter(i -> "false".equals(i.getMetadata().get("gray")))
            .findFirst()
            .orElse(instances.get(0));
    }
}
```

**场景二：同地域优先**

```yaml
metadata:
  region: beijing
  zone: zone-a
```

```java
public class RegionPreferenceRule {
    
    @Value("${spring.cloud.nacos.discovery.metadata.region}")
    private String localRegion;
    
    public ServiceInstance choose(List<ServiceInstance> instances) {
        // 优先选择同地域实例
        return instances.stream()
            .filter(i -> localRegion.equals(i.getMetadata().get("region")))
            .findFirst()
            .orElse(instances.get(0));
    }
}
```

---

## 4. 临时实例 vs 持久化实例

### 4.1 临时实例（Ephemeral）

**配置**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: true  # 默认 true
```

**特点**：
- ✅ 客户端主动发送心跳
- ✅ 超时自动注销
- ✅ 适用于动态实例（容器）
- ✅ AP 模式（可用性优先）

**心跳机制**：

```
1. Provider 启动后注册
   ↓
2. 每 5 秒发送心跳
   ↓
3. Nacos 收到心跳，更新最后心跳时间
   ↓
4. 超过 15 秒未收到心跳 → 标记不健康
   ↓
5. 超过 30 秒未收到心跳 → 自动注销
```

**代码示例**：

```java
// Nacos 客户端心跳任务
public class BeatReactor {
    
    public void executeBeatTask(BeatInfo beatInfo) {
        // 构建心跳数据
        Map<String, String> params = new HashMap<>();
        params.put("serviceName", beatInfo.getServiceName());
        params.put("ip", beatInfo.getIp());
        params.put("port", String.valueOf(beatInfo.getPort()));
        
        // 发送心跳
        serverProxy.sendBeat(beatInfo);
    }
}
```

### 4.2 持久化实例（Persistent）

**配置**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false  # 持久化实例
```

**特点**：
- ✅ 服务端主动检查健康
- ✅ 不会自动注销（需手动删除）
- ✅ 适用于固定实例（虚拟机）
- ✅ CP 模式（一致性优先）

**健康检查**：

```
1. Provider 注册后，Nacos 存储到数据库
   ↓
2. Nacos 定时主动检查（HTTP/TCP）
   ↓
3. 检查失败 → 标记不健康（但不删除）
   ↓
4. 检查恢复 → 标记健康
```

### 4.3 对比总结

| 特性 | 临时实例 | 持久化实例 |
|------|---------|-----------|
| **心跳方式** | 客户端发送 | 服务端检查 |
| **注销机制** | 自动注销 | 手动删除 |
| **存储方式** | 内存 | 数据库 |
| **CAP 模型** | AP | CP |
| **适用场景** | 容器化、动态扩缩容 | 虚拟机、固定 IP |
| **性能开销** | 低 | 高 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**选择建议**：
- Kubernetes 环境：使用临时实例
- 虚拟机环境：使用持久化实例
- 混合环境：可以共存

---

## 5. 心跳机制与健康检查

### 5.1 心跳配置详解

```yaml
spring:
  cloud:
    nacos:
      discovery:
        # 心跳间隔（默认 5000ms）
        heart-beat-interval: 5000
        
        # 心跳超时（默认 15000ms）
        heart-beat-timeout: 15000
        
        # IP 删除超时（默认 30000ms）
        ip-delete-timeout: 30000
```

**时间关系**：

```
0s ────── 5s ────── 10s ────── 15s ────── 30s
 │         │         │          │          │
启动      心跳1     心跳2      标记不健康   自动注销
```

### 5.2 自定义健康检查

**配置 Actuator**：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: always
  health:
    nacos:
      discovery:
        enabled: true
```

**自定义健康指标**：

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {

    @Autowired
    private DataSource dataSource;

    @Override
    public Health health() {
        try {
            // 检查数据库连接
            Connection connection = dataSource.getConnection();
            if (connection != null && !connection.isClosed()) {
                return Health.up()
                    .withDetail("database", "available")
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("database", "unavailable")
                .withException(e)
                .build();
        }
        
        return Health.down().build();
    }
}
```

### 5.3 健康检查端点

**健康检查接口**：

```bash
# 基础健康检查
GET http://localhost:8081/actuator/health

# 响应
{
  "status": "UP",
  "components": {
    "diskSpace": {"status": "UP"},
    "nacosDiscovery": {"status": "UP"},
    "ping": {"status": "UP"},
    "custom": {"status": "UP"}
  }
}
```

**Nacos 健康检查配置**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        # 启用健康检查
        watch:
          enabled: true
        
        # 健康检查路径
        health-check-path: /actuator/health
        
        # 健康检查间隔
        health-check-interval: 30s
```

---

## 6. AP/CP 模式选择

### 6.1 CAP 理论回顾

**CAP 三角**：
- **C（Consistency）**：一致性
- **A（Availability）**：可用性
- **P（Partition Tolerance）**：分区容错性

**Nacos 支持 AP 和 CP 模式切换**（Eureka 只支持 AP）

### 6.2 AP 模式（默认）

**特点**：
- 临时实例默认使用 AP 模式
- 优先保证可用性
- 允许短暂的数据不一致
- 使用 Distro 协议

**配置**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: true  # 临时实例 = AP 模式
```

**适用场景**：
- 服务注册与发现
- 对数据一致性要求不高
- 希望高可用

**工作原理**：

```
Nacos 集群（AP 模式）：
Node1   Node2   Node3
  │       │       │
  └───────┴───────┘
     临时实例

特点：
- 每个节点独立接受注册
- 异步同步数据
- 允许短暂不一致
- 保证最终一致性
```

### 6.3 CP 模式

**特点**：
- 持久化实例使用 CP 模式
- 优先保证一致性
- 可能牺牲部分可用性
- 使用 Raft 协议

**配置**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false  # 持久化实例 = CP 模式
```

**适用场景**：
- 配置管理
- 分布式锁
- 对数据一致性要求高

**工作原理**：

```
Nacos 集群（CP 模式）：
Leader   Follower   Follower
  │         │          │
  └─────────┴──────────┘
    持久化实例

特点：
- Leader 负责写入
- Follower 同步数据
- 多数节点确认后才成功
- 保证强一致性
```

### 6.4 模式对比

| 维度 | AP 模式 | CP 模式 |
|------|---------|---------|
| **实例类型** | 临时实例 | 持久化实例 |
| **协议** | Distro | Raft |
| **一致性** | 最终一致 | 强一致 |
| **可用性** | 高 | 中 |
| **性能** | 高 | 中 |
| **适用场景** | 服务发现 | 配置管理 |

### 6.5 切换模式

**临时实例切换为持久化**：

```bash
# 调用 Nacos OpenAPI
curl -X PUT 'http://localhost:8848/nacos/v1/ns/instance?serviceName=user-service&ip=192.168.1.1&port=8081&ephemeral=false'
```

**动态切换（不推荐）**：

```java
@RestController
@RequiredArgsConstructor
public class NacosController {

    private final NacosServiceManager nacosServiceManager;

    @PostMapping("/switch-mode")
    public String switchMode() {
        // 注销临时实例
        nacosServiceManager.getNamingService()
            .deregisterInstance("user-service", "192.168.1.1", 8081);
        
        // 注册持久化实例
        Instance instance = new Instance();
        instance.setIp("192.168.1.1");
        instance.setPort(8081);
        instance.setEphemeral(false);
        
        nacosServiceManager.getNamingService()
            .registerInstance("user-service", instance);
        
        return "切换成功";
    }
}
```

---

## 7. 服务注册发现原理源码分析

### 7.1 服务注册流程

**入口：NacosServiceRegistry**

```java
public class NacosServiceRegistry implements ServiceRegistry<Registration> {

    @Override
    public void register(Registration registration) {
        // 1. 获取服务名
        String serviceId = registration.getServiceId();
        
        // 2. 获取分组
        String group = nacosDiscoveryProperties.getGroup();
        
        // 3. 构建实例信息
        Instance instance = getNacosInstanceFromRegistration(registration);
        
        // 4. 调用 Nacos Client 注册
        namingService.registerInstance(serviceId, group, instance);
    }
    
    private Instance getNacosInstanceFromRegistration(Registration registration) {
        Instance instance = new Instance();
        instance.setIp(registration.getHost());
        instance.setPort(registration.getPort());
        instance.setWeight(nacosDiscoveryProperties.getWeight());
        instance.setClusterName(nacosDiscoveryProperties.getClusterName());
        instance.setEphemeral(nacosDiscoveryProperties.isEphemeral());
        instance.setMetadata(registration.getMetadata());
        return instance;
    }
}
```

**Nacos Client 注册**：

```java
public class NacosNamingService implements NamingService {

    @Override
    public void registerInstance(String serviceName, String groupName, Instance instance) {
        // 1. 检查心跳
        if (instance.isEphemeral()) {
            // 临时实例：启动心跳任务
            BeatInfo beatInfo = buildBeatInfo(instance);
            beatReactor.addBeatInfo(serviceName, beatInfo);
        }
        
        // 2. 发送注册请求
        serverProxy.registerService(serviceName, groupName, instance);
    }
}
```

**心跳任务**：

```java
public class BeatReactor {
    
    private final ScheduledExecutorService executorService;
    
    public void addBeatInfo(String serviceName, BeatInfo beatInfo) {
        // 创建心跳任务
        BeatTask beatTask = new BeatTask(beatInfo);
        
        // 定时执行（默认 5 秒）
        executorService.schedule(beatTask, 0, TimeUnit.MILLISECONDS);
    }
    
    class BeatTask implements Runnable {
        @Override
        public void run() {
            // 发送心跳
            long result = serverProxy.sendBeat(beatInfo);
            
            // 根据返回值决定下次心跳间隔
            executorService.schedule(this, result, TimeUnit.MILLISECONDS);
        }
    }
}
```

### 7.2 服务发现流程

**入口：NacosDiscoveryClient**

```java
public class NacosDiscoveryClient implements DiscoveryClient {

    @Override
    public List<ServiceInstance> getInstances(String serviceId) {
        // 1. 获取分组
        String group = nacosDiscoveryProperties.getGroup();
        
        // 2. 从 Nacos 获取实例列表
        List<Instance> instances = namingService.selectInstances(
            serviceId, group, true);  // true = 只返回健康实例
        
        // 3. 转换为 Spring Cloud 的 ServiceInstance
        return instances.stream()
            .map(this::hostToServiceInstance)
            .collect(Collectors.toList());
    }
}
```

**Nacos Client 查询**：

```java
public class NacosNamingService implements NamingService {

    @Override
    public List<Instance> selectInstances(String serviceName, String groupName, boolean healthy) {
        // 1. 从本地缓存获取
        ServiceInfo serviceInfo = hostReactor.getServiceInfo(serviceName, groupName);
        
        // 2. 过滤健康实例
        return serviceInfo.getHosts().stream()
            .filter(instance -> !healthy || instance.isHealthy())
            .collect(Collectors.toList());
    }
}
```

**缓存与更新**：

```java
public class HostReactor {
    
    private final Map<String, ServiceInfo> serviceInfoMap = new ConcurrentHashMap<>();
    
    public ServiceInfo getServiceInfo(String serviceName, String groupName) {
        String key = ServiceInfo.getKey(serviceName, groupName);
        
        // 1. 从缓存获取
        ServiceInfo serviceInfo = serviceInfoMap.get(key);
        
        if (serviceInfo == null) {
            // 2. 缓存未命中，从服务端拉取
            serviceInfo = serverProxy.queryList(serviceName, groupName);
            serviceInfoMap.put(key, serviceInfo);
            
            // 3. 订阅服务变更
            scheduleUpdateIfAbsent(serviceName, groupName);
        }
        
        return serviceInfo;
    }
    
    private void scheduleUpdateIfAbsent(String serviceName, String groupName) {
        // 定时更新服务列表（默认 10 秒）
        UpdateTask updateTask = new UpdateTask(serviceName, groupName);
        executor.scheduleWithFixedDelay(updateTask, 10000, 10000, TimeUnit.MILLISECONDS);
    }
}
```

### 7.3 服务推送机制

**UDP 推送**：

```java
public class PushReceiver implements Runnable {
    
    private final DatagramSocket udpSocket;
    
    @Override
    public void run() {
        while (true) {
            try {
                // 接收 UDP 数据包
                byte[] buffer = new byte[65535];
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                udpSocket.receive(packet);
                
                // 解析数据
                String json = new String(packet.getData(), 0, packet.getLength());
                ServiceInfo serviceInfo = JSON.parseObject(json, ServiceInfo.class);
                
                // 更新本地缓存
                hostReactor.processServiceJson(json);
                
            } catch (Exception e) {
                log.error("接收推送失败", e);
            }
        }
    }
}
```

**推送流程**：

```
1. Nacos Server 服务列表变更
   ↓
2. 找到订阅该服务的客户端
   ↓
3. 通过 UDP 推送变更数据
   ↓
4. 客户端收到推送，更新本地缓存
   ↓
5. 下次调用使用最新的服务列表
```

---

## 8. 深入一点

### 8.1 Nacos 数据模型

**层级结构**：

```
Namespace（命名空间）
  └─ Group（分组）
      └─ Service（服务）
          └─ Cluster（集群）
              └─ Instance（实例）
```

**数据存储**：

```java
// 服务信息
public class Service {
    private String namespace;
    private String groupName;
    private String name;
    private Map<String, Cluster> clusterMap;
}

// 集群信息
public class Cluster {
    private String name;
    private Set<Instance> persistentInstances;  // 持久化实例
    private Set<Instance> ephemeralInstances;   // 临时实例
}

// 实例信息
public class Instance {
    private String ip;
    private int port;
    private double weight;
    private boolean healthy;
    private boolean ephemeral;
    private Map<String, String> metadata;
}
```

### 8.2 Distro 协议（AP 模式）

**核心思想**：
- 每个节点负责部分数据
- 数据分片存储
- 异步复制

**数据分片**：

```java
public class DistroMapper {
    
    public Server responsible(String serviceName) {
        // 根据服务名计算 hash
        int hash = serviceName.hashCode();
        
        // 选择负责节点
        int index = hash % serverList.size();
        return serverList.get(index);
    }
}
```

**同步流程**：

```
1. 实例注册到 Node1
   ↓
2. Node1 接受注册
   ↓
3. Node1 异步同步到 Node2、Node3
   ↓
4. Node2、Node3 更新本地缓存
```

### 8.3 Raft 协议（CP 模式）

**核心思想**：
- Leader 选举
- 日志复制
- 多数派提交

**Leader 选举**：

```
初始状态：所有节点都是 Follower
   ↓
超时未收到心跳 → 转为 Candidate
   ↓
发起投票请求
   ↓
获得多数票 → 成为 Leader
   ↓
定期发送心跳维持 Leader 地位
```

**日志复制**：

```
1. 客户端写入请求到 Leader
   ↓
2. Leader 追加日志到本地
   ↓
3. Leader 发送日志到 Follower
   ↓
4. Follower 确认收到日志
   ↓
5. Leader 收到多数派确认 → 提交日志
   ↓
6. 返回客户端成功
```

### 8.4 性能优化

**客户端缓存**：

```java
// 本地缓存服务列表，减少查询
private final Map<String, ServiceInfo> serviceInfoMap = new ConcurrentHashMap<>();

// 定时更新缓存（10 秒）
scheduledExecutor.scheduleWithFixedDelay(() -> {
    updateServiceInfo();
}, 10000, 10000, TimeUnit.MILLISECONDS);
```

**批量注册**：

```java
// 批量注册多个实例
public void batchRegisterInstance(List<Instance> instances) {
    // 分批注册，避免单次请求过大
    Lists.partition(instances, 100).forEach(batch -> {
        serverProxy.batchRegisterService(batch);
    });
}
```

**连接复用**：

```java
// HTTP 连接池
public class NacosHttpClient {
    
    private final CloseableHttpClient httpClient = HttpClients.custom()
        .setMaxConnTotal(200)           // 最大连接数
        .setMaxConnPerRoute(20)         // 每个路由最大连接数
        .setConnectionTimeToLive(30, TimeUnit.SECONDS)
        .build();
}
```

---

## 9. 面试要点

### 9.1 基础问题

**Q1：Nacos 的 Namespace、Group、Service 有什么区别？**

**回答要点**：
- **Namespace**：最高级隔离，用于环境隔离（dev/test/prod）
- **Group**：次级隔离，用于业务分组
- **Service**：具体的服务名称

**关系**：Namespace > Group > Service

**Q2：临时实例和持久化实例的区别是什么？**

| 维度 | 临时实例 | 持久化实例 |
|------|---------|-----------|
| 心跳 | 客户端 | 服务端 |
| 注销 | 自动 | 手动 |
| CAP | AP | CP |
| 场景 | 容器 | 虚拟机 |

### 9.2 进阶问题

**Q3：Nacos 如何实现服务的高可用？**

**回答要点**：
1. **集群部署**：3+ 节点集群
2. **数据分片**：Distro 协议分片存储
3. **数据复制**：异步复制到其他节点
4. **客户端缓存**：本地缓存服务列表
5. **健康检查**：及时剔除不健康实例

**Q4：Nacos 的推送机制是如何实现的？**

**回答要点**：
1. 客户端订阅服务时，建立 UDP 连接
2. 服务端检测到服务变更
3. 通过 UDP 推送变更数据到客户端
4. 客户端收到推送，更新本地缓存
5. 兜底：客户端定时轮询（10 秒）

### 9.3 架构问题

**Q5：如何设计一个高可用的服务注册中心？**

**回答要点**：
1. **集群部署**：多节点部署，避免单点故障
2. **数据持久化**：使用 MySQL 存储持久化数据
3. **客户端容错**：本地缓存 + 失败重试
4. **健康检查**：实时监控实例健康状态
5. **自我保护**：网络分区时保护服务列表

**Q6：AP 模式和 CP 模式应该如何选择？**

**选择标准**：
- **服务发现**：选 AP（优先可用性）
- **配置管理**：选 CP（优先一致性）
- **分布式锁**：选 CP（必须一致性）

---

## 10. 参考资料

**官方文档**：
- [Nacos 架构](https://nacos.io/zh-cn/docs/architecture.html)
- [Nacos 配置项](https://nacos.io/zh-cn/docs/sdk.html)

**源码分析**：
- [Nacos GitHub](https://github.com/alibaba/nacos)
- [Spring Cloud Alibaba GitHub](https://github.com/alibaba/spring-cloud-alibaba)

**推荐阅读**：
- [Distro 协议详解](https://nacos.io/zh-cn/docs/distro-protocol.html)
- [Nacos 2.0 升级指南](https://nacos.io/zh-cn/docs/2.0.0-upgrading.html)

---

**下一章预告**：第 6 章将学习服务发现的生产最佳实践，包括服务优雅上下线、灰度发布、多环境隔离、常见问题排查等实战内容。

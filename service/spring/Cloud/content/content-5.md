# 第5章：Nacos Discovery 自定义配置与原理

> **本章目标**：深入掌握 Nacos Discovery 核心配置项，理解服务注册发现底层原理，能够根据场景优化配置

---

## 1. Nacos 核心配置项详解

### 1.1 完整配置示例

```yaml
spring:
  application:
    name: user-service  # 服务名称（必需）
  
  cloud:
    nacos:
      discovery:
        # ========== 服务器配置 ==========
        server-addr: localhost:8848  # Nacos Server 地址（必需）
        username: nacos              # 认证用户名（可选）
        password: nacos              # 认证密码（可选）
        
        # ========== 命名空间与分组 ==========
        namespace: dev               # 命名空间 ID（默认 public）
        group: DEFAULT_GROUP         # 分组名称（默认 DEFAULT_GROUP）
        
        # ========== 实例配置 ==========
        ip: 192.168.1.100           # 实例 IP（默认自动获取）
        port: ${server.port}        # 实例端口（默认应用端口）
        weight: 1.0                 # 实例权重（默认 1.0）
        cluster-name: DEFAULT       # 集群名称（默认 DEFAULT）
        ephemeral: true             # 临时实例（true）/持久化实例（false）
        
        # ========== 心跳配置 ==========
        heart-beat-interval: 5000       # 心跳间隔（毫秒，默认 5000）
        heart-beat-timeout: 15000       # 心跳超时（毫秒，默认 15000）
        ip-delete-timeout: 30000        # IP 删除超时（毫秒，默认 30000）
        
        # ========== 元数据配置 ==========
        metadata:
          version: 1.0.0            # 版本号
          env: dev                  # 环境标识
          zone: HZ                  # 地域标识
          
        # ========== 服务发现配置 ==========
        enabled: true               # 是否启用服务注册发现（默认 true）
        register-enabled: true      # 是否注册到 Nacos（默认 true）
        watch-delay: 30000          # 监听延迟（毫秒，默认 30000）
        
        # ========== 网络配置 ==========
        network-interface: eth0     # 网络接口（默认自动选择）
        access-key: ''              # 阿里云 AccessKey（可选）
        secret-key: ''              # 阿里云 SecretKey（可选）
        
        # ========== 日志配置 ==========
        naming-load-cache-at-start: false  # 启动时加载缓存（默认 false）
        
        # ========== 其他配置 ==========
        service: ${spring.application.name}  # 服务名（默认应用名）
        fail-fast: true             # 启动失败快速失败（默认 true）
```

---

### 1.2 核心配置详解

#### 1.2.1 命名空间（namespace）

**作用**：环境隔离

**使用场景**：
- dev（开发环境）
- test（测试环境）
- prod（生产环境）

**创建命名空间**：
1. 登录 Nacos 控制台
2. 进入"命名空间"
3. 点击"新建命名空间"
4. 填写命名空间 ID 和名称

**配置示例**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        namespace: dev  # 填写命名空间 ID（不是名称）
```

**注意事项**：
- namespace 是命名空间 ID，不是名称
- 不同命名空间的服务完全隔离
- 默认 namespace 是 public

---

#### 1.2.2 分组（group）

**作用**：服务分组（同一命名空间内）

**使用场景**：
- 不同业务线（ORDER_GROUP、USER_GROUP）
- 不同版本（V1_GROUP、V2_GROUP）
- 不同用途（TEST_GROUP、PROD_GROUP）

**配置示例**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        group: ORDER_GROUP
```

**服务发现**：
```java
@Autowired
private DiscoveryClient discoveryClient;

// 获取指定分组的服务
List<ServiceInstance> instances = discoveryClient.getInstances("user-service");
```

**注意事项**：
- 默认分组是 DEFAULT_GROUP
- 同一服务可以在不同分组中
- 服务调用时会优先调用同分组的实例

---

#### 1.2.3 集群（cluster-name）

**作用**：集群隔离（同地域优先）

**使用场景**：
- 机房隔离（HZ=杭州、SH=上海）
- 跨地域部署

**配置示例**：
```yaml
# 杭州机房
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: HZ

# 上海机房
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: SH
```

**同集群优先策略**：
- Nacos 默认优先调用同集群的实例
- 如果同集群没有健康实例，才调用其他集群

---

#### 1.2.4 权重（weight）

**作用**：负载均衡权重

**取值范围**：0-10000（默认 1）

**使用场景**：
- 新机器性能更好，设置更高权重
- 灰度发布，新版本设置较小权重

**配置方式**：

**方式1：配置文件**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        weight: 2.0
```

**方式2：Nacos 控制台**：
- 进入服务详情
- 点击"编辑"
- 修改权重

**权重计算**：
```
实例1（权重 1）：1 / (1+2) = 33%
实例2（权重 2）：2 / (1+2) = 67%
```

---

#### 1.2.5 元数据（metadata）

**作用**：自定义元数据，用于灰度发布、版本控制等

**配置示例**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: 1.0.0      # 版本号
          env: dev            # 环境
          zone: HZ            # 地域
          custom-key: custom-value  # 自定义元数据
```

**获取元数据**：
```java
@Autowired
private DiscoveryClient discoveryClient;

List<ServiceInstance> instances = discoveryClient.getInstances("user-service");
for (ServiceInstance instance : instances) {
    Map<String, String> metadata = instance.getMetadata();
    String version = metadata.get("version");
    System.out.println("实例版本：" + version);
}
```

**使用场景**：
- 灰度发布（根据 version 路由）
- 地域路由（根据 zone 路由）
- 自定义扩展

---

#### 1.2.6 临时实例 vs 持久化实例（ephemeral）

**临时实例（ephemeral=true，默认）**：
- AP 模式（可用性优先）
- 心跳机制（客户端主动上报）
- 健康检查：15 秒无心跳自动剔除
- 数据存储：内存

**持久化实例（ephemeral=false）**：
- CP 模式（一致性优先）
- 服务端主动探测
- 即使不健康也不剔除，只标记为不健康
- 数据存储：持久化（Raft）

**配置示例**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: true  # true=临时实例, false=持久化实例
```

**选择建议**：
- **临时实例**：大部分微服务场景（推荐）
- **持久化实例**：DNS、配置中心等需要强一致性的场景

---

#### 1.2.7 心跳配置

**核心配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 5000       # 心跳间隔（毫秒）
        heart-beat-timeout: 15000       # 心跳超时（毫秒）
        ip-delete-timeout: 30000        # IP 删除超时（毫秒）
```

**时间线**：
```
0s  → 服务注册
5s  → 发送第1次心跳
10s → 发送第2次心跳
15s → 发送第3次心跳
...
15s → 如果 15 秒未收到心跳，标记为不健康
30s → 如果 30 秒未收到心跳，删除实例
```

**优化建议**：
- 网络不稳定时，适当增加 `heart-beat-timeout`
- 避免频繁上下线，增加 `ip-delete-timeout`

---

## 2. 命名空间与分组管理

### 2.1 命名空间（Namespace）

**数据模型**：
```
Namespace (命名空间)
├── dev
│   ├── DEFAULT_GROUP
│   │   ├── user-service
│   │   └── order-service
│   └── ORDER_GROUP
│       └── order-service
├── test
│   └── DEFAULT_GROUP
│       ├── user-service
│       └── order-service
└── prod
    └── DEFAULT_GROUP
        ├── user-service
        └── order-service
```

**创建命名空间**：

**Nacos 控制台**：
1. 进入"命名空间"
2. 点击"新建命名空间"
3. 填写信息：
   - 命名空间 ID：dev
   - 命名空间名：开发环境
   - 描述：开发环境

**配置使用**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        namespace: dev  # 填写命名空间 ID
```

---

### 2.2 分组（Group）

**使用场景**：

**场景1：业务线隔离**：
```yaml
# 订单服务
spring:
  cloud:
    nacos:
      discovery:
        group: ORDER_GROUP

# 用户服务
spring:
  cloud:
    nacos:
      discovery:
        group: USER_GROUP
```

**场景2：版本隔离**：
```yaml
# V1 版本
spring:
  cloud:
    nacos:
      discovery:
        group: V1_GROUP

# V2 版本
spring:
  cloud:
    nacos:
      discovery:
        group: V2_GROUP
```

**服务调用**：
```java
// Feign 默认调用同分组的服务
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{id}")
    User getUserById(@PathVariable Long id);
}
```

---

### 2.3 配置优先级

**优先级（高到低）**：
```
1. 环境变量（--nacos.namespace=dev）
2. bootstrap.yml
3. application.yml
4. 默认值（public / DEFAULT_GROUP）
```

**最佳实践**：
```yaml
# bootstrap.yml（基础配置）
spring:
  cloud:
    nacos:
      discovery:
        server-addr: ${NACOS_SERVER_ADDR:localhost:8848}
        namespace: ${NACOS_NAMESPACE:dev}
        group: ${NACOS_GROUP:DEFAULT_GROUP}
```

**启动参数**：
```bash
java -jar app.jar \
  --NACOS_SERVER_ADDR=192.168.1.100:8848 \
  --NACOS_NAMESPACE=prod \
  --NACOS_GROUP=ORDER_GROUP
```

---

## 3. 服务元数据自定义

### 3.1 元数据配置

**配置方式**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          # 业务元数据
          version: 1.0.0              # 版本号
          env: dev                    # 环境
          zone: HZ                    # 地域
          
          # 自定义元数据
          gray: true                  # 灰度标识
          canary: false               # 金丝雀标识
          owner: zhangsan             # 负责人
          
          # 保留元数据（Nacos 内置）
          preserved.heart.beat.timeout: 15000
          preserved.ip.delete.timeout: 30000
```

---

### 3.2 元数据使用场景

#### 场景1：灰度发布

**新版本配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: 2.0.0
          gray: true
```

**旧版本配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: 1.0.0
          gray: false
```

**自定义负载均衡策略**（后续章节详解）：
```java
@Component
public class GrayLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        // 优先选择 gray=true 的实例
        // 如果没有，再选择 gray=false 的实例
    }
}
```

---

#### 场景2：地域路由

**杭州实例**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          zone: HZ
```

**上海实例**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          zone: SH
```

**同地域优先策略**：
```java
// 获取当前服务的 zone
String currentZone = getCurrentZone();

// 优先选择同 zone 的实例
List<ServiceInstance> sameZoneInstances = instances.stream()
    .filter(i -> currentZone.equals(i.getMetadata().get("zone")))
    .collect(Collectors.toList());
```

---

## 4. 心跳机制与健康检查

### 4.1 心跳机制原理

**工作流程**：
```
┌─────────────────┐
│  Nacos Client   │
└────────┬────────┘
         │ 1. 服务注册（POST /nacos/v1/ns/instance）
         ↓
┌─────────────────┐
│  Nacos Server   │
│  注册表：        │
│  user-service   │
│  - 192.168.1.100│
│  - lastBeat: 0  │
└────────┬────────┘
         │ 2. 返回注册成功
         ↓
┌─────────────────┐
│  Nacos Client   │
│  启动心跳线程   │
└────────┬────────┘
         │ 3. 每 5 秒发送心跳（PUT /nacos/v1/ns/instance/beat）
         ↓
┌─────────────────┐
│  Nacos Server   │
│  更新 lastBeat  │
└────────┬────────┘
         │ 4. 健康检查线程（每秒）
         │    if (now - lastBeat > 15s) → 标记不健康
         │    if (now - lastBeat > 30s) → 删除实例
         ↓
┌─────────────────┐
│  服务消费者     │
│  拉取服务列表   │
│  (只包含健康实例)│
└─────────────────┘
```

---

### 4.2 心跳配置优化

**默认配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 5000       # 5 秒
        heart-beat-timeout: 15000       # 15 秒
        ip-delete-timeout: 30000        # 30 秒
```

**网络不稳定场景**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 3000       # 3 秒（更频繁）
        heart-beat-timeout: 30000       # 30 秒（更宽容）
        ip-delete-timeout: 60000        # 60 秒（避免误删）
```

**高性能场景**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 10000      # 10 秒（降低频率）
        heart-beat-timeout: 30000       # 30 秒
        ip-delete-timeout: 60000        # 60 秒
```

---

### 4.3 健康检查扩展

**Spring Boot Actuator 集成**：

**引入依赖**：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**配置**：
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health  # 暴露健康检查端点
  health:
    livenessstate:
      enabled: true
    readinessstate:
      enabled: true
```

**自定义健康指标**：
```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        // 自定义健康检查逻辑
        boolean isHealthy = checkDatabase() && checkRedis();
        
        if (isHealthy) {
            return Health.up()
                .withDetail("database", "ok")
                .withDetail("redis", "ok")
                .build();
        } else {
            return Health.down()
                .withDetail("error", "database or redis error")
                .build();
        }
    }
    
    private boolean checkDatabase() {
        // 检查数据库连接
        return true;
    }
    
    private boolean checkRedis() {
        // 检查 Redis 连接
        return true;
    }
}
```

---

## 5. AP/CP 模式深入

### 5.1 AP 模式（临时实例）

**特点**：
- **可用性优先**（Availability）
- **分区容错性**（Partition Tolerance）
- 基于 Distro 协议

**工作原理**：
```
Nacos 集群（3 节点）
├── Node1 (Leader)
├── Node2
└── Node3

临时实例注册：
1. 客户端随机选择一个节点注册
2. 该节点将实例信息同步到其他节点（异步）
3. 如果节点宕机，该节点的实例信息丢失（临时数据）
4. 客户端重新注册到其他节点
```

**优势**：
- 高可用：单节点宕机不影响服务
- 高性能：无需持久化，内存存储
- 快速响应：异步同步

**劣势**：
- 短暂数据不一致（异步同步延迟）
- 节点宕机，该节点的实例数据丢失

**适用场景**：
- 大部分微服务场景
- 对数据一致性要求不高

---

### 5.2 CP 模式（持久化实例）

**特点**：
- **一致性优先**（Consistency）
- **分区容错性**（Partition Tolerance）
- 基于 Raft 协议

**工作原理**：
```
Nacos 集群（3 节点，Raft 协议）
├── Node1 (Leader)
├── Node2 (Follower)
└── Node3 (Follower)

持久化实例注册：
1. 客户端向 Leader 注册
2. Leader 将数据写入 Raft 日志
3. 复制到多数节点（2/3）
4. 提交日志，持久化到数据库
5. 返回注册成功

数据一致性保证：
- Leader 宕机 → 选举新 Leader
- 半数以上节点宕机 → 无法提供服务（保证一致性）
```

**优势**：
- 强一致性：数据同步复制
- 数据持久化：节点宕机数据不丢失

**劣势**：
- 性能较低：同步复制、持久化开销
- 可用性较低：半数节点宕机，服务不可用

**适用场景**：
- DNS 服务
- 配置中心
- 需要强一致性的场景

---

### 5.3 AP vs CP 对比

| 维度 | AP 模式（临时实例） | CP 模式（持久化实例） |
|------|---------------------|----------------------|
| **一致性** | 最终一致性 | 强一致性 |
| **可用性** | 高（单节点宕机不影响） | 低（半数节点宕机不可用） |
| **数据存储** | 内存 | 持久化（数据库） |
| **健康检查** | 客户端心跳 | 服务端主动探测 |
| **超时处理** | 自动剔除 | 标记不健康 |
| **性能** | 高 | 中 |
| **同步方式** | 异步 | 同步 |
| **适用场景** | 大部分微服务 | DNS、配置中心 |

---

## 6. 服务注册发现原理源码分析

### 6.1 服务注册流程

**核心类**：
- `NacosServiceRegistry`：服务注册器
- `NacosRegistration`：服务注册信息
- `NamingService`：Nacos 客户端

**注册流程**：
```java
// 1. Spring Boot 启动时，触发服务注册
@Autowired
private NacosServiceRegistry nacosServiceRegistry;

@Autowired
private NacosRegistration nacosRegistration;

@PostConstruct
public void register() {
    // 2. 调用 NacosServiceRegistry.register()
    nacosServiceRegistry.register(nacosRegistration);
}

// NacosServiceRegistry.java
public class NacosServiceRegistry implements ServiceRegistry<NacosRegistration> {
    
    private NamingService namingService;
    
    @Override
    public void register(NacosRegistration registration) {
        // 3. 构建实例信息
        Instance instance = new Instance();
        instance.setIp(registration.getHost());
        instance.setPort(registration.getPort());
        instance.setWeight(registration.getWeight());
        instance.setClusterName(registration.getCluster());
        instance.setMetadata(registration.getMetadata());
        instance.setEphemeral(registration.isEphemeral());
        
        // 4. 调用 Nacos 客户端注册
        namingService.registerInstance(
            registration.getServiceId(),  // 服务名
            registration.getGroup(),      // 分组
            instance                       // 实例信息
        );
    }
}

// NamingService.java（Nacos 客户端）
public class NacosNamingService implements NamingService {
    
    @Override
    public void registerInstance(String serviceName, String groupName, Instance instance) {
        // 5. 发送 HTTP 请求到 Nacos Server
        String url = "/nacos/v1/ns/instance";
        Map<String, String> params = new HashMap<>();
        params.put("serviceName", serviceName);
        params.put("groupName", groupName);
        params.put("ip", instance.getIp());
        params.put("port", String.valueOf(instance.getPort()));
        params.put("weight", String.valueOf(instance.getWeight()));
        params.put("metadata", JSON.toJSONString(instance.getMetadata()));
        params.put("ephemeral", String.valueOf(instance.isEphemeral()));
        
        httpClient.post(url, params);
        
        // 6. 启动心跳线程
        startHeartBeat(serviceName, instance);
    }
    
    private void startHeartBeat(String serviceName, Instance instance) {
        // 定时发送心跳（默认 5 秒）
        ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
        executor.scheduleWithFixedDelay(() -> {
            // 发送心跳请求
            String url = "/nacos/v1/ns/instance/beat";
            Map<String, String> params = new HashMap<>();
            params.put("serviceName", serviceName);
            params.put("ip", instance.getIp());
            params.put("port", String.valueOf(instance.getPort()));
            
            httpClient.put(url, params);
        }, 5000, 5000, TimeUnit.MILLISECONDS);
    }
}
```

---

### 6.2 服务发现流程

**核心类**：
- `NacosDiscoveryClient`：服务发现客户端
- `NamingService`：Nacos 客户端

**发现流程**：
```java
// NacosDiscoveryClient.java
public class NacosDiscoveryClient implements DiscoveryClient {
    
    private NamingService namingService;
    
    @Override
    public List<ServiceInstance> getInstances(String serviceId) {
        // 1. 从 Nacos 获取服务实例列表
        List<Instance> instances = namingService.selectInstances(
            serviceId,        // 服务名
            true              // 只获取健康实例
        );
        
        // 2. 转换为 Spring Cloud 的 ServiceInstance
        return instances.stream()
            .map(this::convertToServiceInstance)
            .collect(Collectors.toList());
    }
    
    private ServiceInstance convertToServiceInstance(Instance instance) {
        return new NacosServiceInstance(
            instance.getInstanceId(),
            instance.getServiceName(),
            instance.getIp(),
            instance.getPort(),
            instance.isHealthy(),
            instance.getMetadata()
        );
    }
}

// NamingService.java
public class NacosNamingService implements NamingService {
    
    private HostReactor hostReactor;  // 本地缓存
    
    @Override
    public List<Instance> selectInstances(String serviceName, boolean healthy) {
        // 1. 从本地缓存获取
        ServiceInfo serviceInfo = hostReactor.getServiceInfo(serviceName);
        
        if (serviceInfo == null || serviceInfo.isExpired()) {
            // 2. 本地缓存过期，从 Nacos Server 拉取
            serviceInfo = queryInstancesFromServer(serviceName);
            
            // 3. 更新本地缓存
            hostReactor.updateServiceInfo(serviceName, serviceInfo);
        }
        
        // 4. 过滤健康实例
        List<Instance> instances = serviceInfo.getHosts();
        if (healthy) {
            instances = instances.stream()
                .filter(Instance::isHealthy)
                .collect(Collectors.toList());
        }
        
        return instances;
    }
    
    private ServiceInfo queryInstancesFromServer(String serviceName) {
        // 发送 HTTP 请求到 Nacos Server
        String url = "/nacos/v1/ns/instance/list";
        Map<String, String> params = new HashMap<>();
        params.put("serviceName", serviceName);
        params.put("healthyOnly", "true");
        
        String response = httpClient.get(url, params);
        return JSON.parseObject(response, ServiceInfo.class);
    }
}

// HostReactor.java（本地缓存）
public class HostReactor {
    
    // 服务信息缓存（Key=服务名, Value=ServiceInfo）
    private Map<String, ServiceInfo> serviceInfoMap = new ConcurrentHashMap<>();
    
    public ServiceInfo getServiceInfo(String serviceName) {
        return serviceInfoMap.get(serviceName);
    }
    
    public void updateServiceInfo(String serviceName, ServiceInfo serviceInfo) {
        serviceInfoMap.put(serviceName, serviceInfo);
        
        // 启动定时更新任务（默认 30 秒）
        scheduleUpdateIfAbsent(serviceName);
    }
    
    private void scheduleUpdateIfAbsent(String serviceName) {
        ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
        executor.scheduleWithFixedDelay(() -> {
            // 定时从 Nacos Server 更新服务列表
            ServiceInfo newServiceInfo = queryInstancesFromServer(serviceName);
            serviceInfoMap.put(serviceName, newServiceInfo);
        }, 30000, 30000, TimeUnit.MILLISECONDS);
    }
}
```

---

### 6.3 核心流程总结

**服务注册**：
```
Spring Boot 启动
    ↓
NacosServiceRegistry.register()
    ↓
NamingService.registerInstance()
    ↓
HTTP POST /nacos/v1/ns/instance
    ↓
Nacos Server 保存实例信息
    ↓
启动心跳线程（每 5 秒）
    ↓
HTTP PUT /nacos/v1/ns/instance/beat
```

**服务发现**：
```
Feign 调用
    ↓
LoadBalancer 拦截
    ↓
NacosDiscoveryClient.getInstances()
    ↓
NamingService.selectInstances()
    ↓
查询本地缓存（HostReactor）
    ↓
如果过期 → HTTP GET /nacos/v1/ns/instance/list
    ↓
更新本地缓存
    ↓
返回健康实例列表
    ↓
LoadBalancer 选择一个实例
    ↓
发起 HTTP 请求
```

---

## 7. 实际落地场景与最佳使用

### 7.1 场景1：多环境配置管理

**需求**：
- 本地开发（dev）
- 测试环境（test）
- 预发环境（pre）
- 生产环境（prod）

**方案**：

**bootstrap.yml**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: ${NACOS_SERVER_ADDR:localhost:8848}
        namespace: ${NACOS_NAMESPACE:dev}
```

**启动脚本**：
```bash
#!/bin/bash

# 开发环境
if [ "$ENV" == "dev" ]; then
  export NACOS_SERVER_ADDR=localhost:8848
  export NACOS_NAMESPACE=dev
fi

# 测试环境
if [ "$ENV" == "test" ]; then
  export NACOS_SERVER_ADDR=192.168.1.100:8848
  export NACOS_NAMESPACE=test
fi

# 生产环境
if [ "$ENV" == "prod" ]; then
  export NACOS_SERVER_ADDR=nacos.prod.com:8848
  export NACOS_NAMESPACE=prod
fi

java -jar app.jar
```

---

### 7.2 场景2：灰度发布

**需求**：
- 新版本先发布 10% 流量
- 验证无问题后，全量发布

**方案**：

**新版本配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        weight: 1.0  # 10% 流量
        metadata:
          version: 2.0.0
          gray: true
```

**旧版本配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        weight: 9.0  # 90% 流量
        metadata:
          version: 1.0.0
          gray: false
```

**验证无问题后，调整权重**：
- 新版本权重：5.0（50% 流量）
- 旧版本权重：5.0（50% 流量）

**全量发布**：
- 停止旧版本实例
- 新版本权重：1.0（100% 流量）

---

### 7.3 场景3：同地域优先

**需求**：
- 杭州的服务优先调用杭州的实例
- 上海的服务优先调用上海的实例
- 跨地域调用仅作为备份

**方案**：

**配置**：
```yaml
# 杭州实例
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: HZ
        metadata:
          zone: HZ

# 上海实例
spring:
  cloud:
    nacos:
      discovery:
        cluster-name: SH
        metadata:
          zone: SH
```

**Nacos 默认同集群优先**（无需额外配置）

---

### 7.4 场景4：服务优雅下线

**需求**：
- 服务停止前，先从 Nacos 注销
- 处理完正在处理的请求
- 避免新请求进入

**方案**：

**方式1：Spring Boot Actuator**：
```yaml
management:
  endpoints:
    web:
      exposure:
        include: shutdown  # 暴露 shutdown 端点
  endpoint:
    shutdown:
      enabled: true
```

**调用下线接口**：
```bash
curl -X POST http://localhost:8001/actuator/shutdown
```

**方式2：PreDestroy 钩子**：
```java
@Component
public class GracefulShutdown {
    
    @Autowired
    private NacosServiceRegistry nacosServiceRegistry;
    
    @Autowired
    private NacosRegistration nacosRegistration;
    
    @PreDestroy
    public void destroy() {
        // 1. 从 Nacos 注销
        nacosServiceRegistry.deregister(nacosRegistration);
        
        // 2. 等待正在处理的请求完成
        try {
            Thread.sleep(10000);  // 等待 10 秒
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        
        // 3. 停止服务
        System.exit(0);
    }
}
```

---

## 8. 常见问题与易错点

### 8.1 问题1：命名空间配置不生效

**现象**：
- 配置了 namespace，但服务仍注册到 public

**原因**：
- namespace 配置在 `application.yml` 而非 `bootstrap.yml`

**解决方案**：
```yaml
# 必须在 bootstrap.yml 中配置
spring:
  cloud:
    nacos:
      discovery:
        namespace: dev
```

---

### 8.2 问题2：服务频繁上下线

**现象**：
- Nacos 控制台看到服务频繁上下线

**原因**：
- 心跳超时时间太短
- 网络不稳定
- GC 时间过长

**解决方案**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        heart-beat-interval: 3000       # 减少心跳间隔
        heart-beat-timeout: 30000       # 增加超时时间
        ip-delete-timeout: 60000        # 增加删除超时
```

---

### 8.3 问题3：元数据不生效

**现象**：
- 配置了元数据，但获取不到

**原因**：
- 元数据配置格式错误

**正确配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: 1.0.0  # 正确
          # version=1.0.0  # 错误（不是 properties 格式）
```

---

### 8.4 问题4：跨集群调用失败

**现象**：
- 杭州的服务无法调用上海的服务

**原因**：
- 同集群优先策略，且杭州集群有健康实例

**解决方案**：
- 设置跨集群调用权重
- 或统一使用 DEFAULT 集群

---

## 9. 面试准备专项

### 高频面试题

**题目1：Nacos 的临时实例和持久化实例有什么区别？使用场景是什么？**

**标准回答**：

**第一层（基础回答）**：
临时实例通过心跳上报健康状态，超时自动剔除；持久化实例由 Nacos 主动探测健康状态，即使不健康也不剔除。

**第二层（深入原理）**：
- **一致性模型**：临时实例是 AP 模式（可用性优先），持久化实例是 CP 模式（一致性优先）
- **健康检查**：临时实例由客户端发送心跳，持久化实例由服务端主动探测
- **数据存储**：临时实例存储在内存，持久化实例持久化到数据库（Raft）
- **超时处理**：临时实例 15 秒无心跳标记不健康、30 秒删除，持久化实例只标记不健康
- **协议**：临时实例基于 Distro 协议（异步同步），持久化实例基于 Raft 协议（同步复制）

**第三层（扩展延伸）**：
- **使用场景**：临时实例适合大部分微服务（推荐），持久化实例适合 DNS、配置中心等需要强一致性的场景
- **配置方式**：`spring.cloud.nacos.discovery.ephemeral=true/false`
- **性能对比**：临时实例性能更高（无需持久化），持久化实例数据更可靠

**加分项**：
- 提到 Distro 协议和 Raft 协议的原理
- 提到 Nacos 集群部署时的注意事项
- 提到生产环境的选择建议

---

**题目2：Nacos 的心跳机制是如何工作的？**

**标准回答**：

**第一层（基础回答）**：
服务启动后向 Nacos 注册，然后定期发送心跳（默认 5 秒），Nacos 检测心跳超时（默认 15 秒）自动剔除实例。

**第二层（深入原理）**：
1. **服务注册**：服务启动时调用 `/nacos/v1/ns/instance` 注册（POST）
2. **心跳上报**：客户端启动心跳线程，每 5 秒调用 `/nacos/v1/ns/instance/beat` 发送心跳（PUT）
3. **更新时间**：Nacos Server 收到心跳后更新 `lastBeatTime`
4. **健康检查**：Nacos Server 每秒检查 `now - lastBeatTime`
   - 大于 15 秒 → 标记为不健康
   - 大于 30 秒 → 删除实例
5. **推送通知**：实例状态变化时，Nacos 主动推送通知到订阅者（UDP）

**第三层（扩展延伸）**：
- **心跳配置优化**：网络不稳定时，适当增加 `heart-beat-timeout` 和 `ip-delete-timeout`
- **Nacos 2.0 优化**：使用 gRPC 长连接替代 HTTP 短连接，性能大幅提升
- **健康检查扩展**：可以集成 Spring Boot Actuator 自定义健康指标

**加分项**：
- 提到 Nacos 2.0 的长连接优化
- 提到心跳线程的实现（ScheduledExecutorService）
- 提到实际生产环境的心跳配置经验

---

**题目3：如何实现服务的灰度发布？**

**标准回答**：

**第一层（基础回答）**：
通过配置不同的权重和元数据，新版本设置较小权重，验证无问题后逐步提高权重。

**第二层（深入原理）**：
1. **元数据标识**：新版本配置 `metadata.version=2.0.0`，旧版本配置 `metadata.version=1.0.0`
2. **权重控制**：新版本权重 1.0（10% 流量），旧版本权重 9.0（90% 流量）
3. **自定义负载均衡策略**：根据元数据或权重选择实例
4. **逐步灰度**：
   - 第1阶段：新版本 10% 流量
   - 第2阶段：新版本 50% 流量
   - 第3阶段：新版本 100% 流量
5. **回滚**：如果新版本有问题，直接下线新版本实例

**第三层（扩展延伸）**：
- **基于用户的灰度**：通过自定义负载均衡策略，指定用户路由到新版本
- **金丝雀发布**：先发布一个实例，验证无问题后再发布其他实例
- **蓝绿部署**：新旧版本同时存在，一键切换

**加分项**：
- 提到自定义负载均衡策略的实现
- 提到网关层的灰度路由
- 提到实际生产环境的灰度发布经验

---

## 10. 学习自检清单

- [ ] 能够配置 Nacos Discovery 核心配置项
- [ ] 理解命名空间、分组、集群的区别和使用场景
- [ ] 掌握元数据的配置和使用
- [ ] 理解临时实例和持久化实例的区别
- [ ] 掌握心跳机制和健康检查原理
- [ ] 理解 AP/CP 模式的区别和选择
- [ ] 能够根据场景优化配置（灰度发布、同地域优先）
- [ ] 能够排查常见问题（命名空间不生效、服务频繁上下线）

**学习建议**：
- **预计学习时长**：3-4 小时
- **重点难点**：心跳机制、AP/CP 模式、元数据使用
- **前置知识**：第4章 Nacos Discovery 快速入门
- **实践建议**：搭建多实例环境，验证灰度发布和同地域优先

---

## 11. 参考资料

- [Nacos 官方文档](https://nacos.io/zh-cn/docs/what-is-nacos.html)
- [Nacos 架构设计](https://nacos.io/zh-cn/docs/architecture.html)
- [Distro 协议](https://nacos.io/zh-cn/docs/cluster-mode-quick-start.html)
- [Raft 协议](https://raft.github.io/)
- [Spring Cloud Alibaba 文档](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-discovery)

---

**本章小结**：
- Nacos Discovery 提供丰富的配置项，支持命名空间、分组、集群、权重、元数据等
- 临时实例（AP 模式）适合大部分微服务场景，持久化实例（CP 模式）适合强一致性场景
- 心跳机制通过客户端定期上报实现健康检查，超时自动剔除实例
- 元数据可用于灰度发布、地域路由等高级场景
- 配置优化需要根据网络状况、业务场景调整心跳间隔和超时时间

**下一章预告**：第6章将介绍 Eureka 注册中心，包括 Eureka Server 搭建、自我保护机制、多级缓存架构，以及与 Nacos 的对比。

# 第 13 章：负载均衡策略与自定义

> **学习目标**：掌握各种负载均衡策略、学会自定义负载均衡算法  
> **预计时长**：2-3 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. 负载均衡策略概览

### 1.1 常见策略对比

| 策略 | 优势 | 劣势 | 适用场景 |
|------|------|------|---------|
| **轮询（RoundRobin）** | 简单、分布均匀 | 不考虑实例性能 | 实例性能相同 |
| **随机（Random）** | 实现简单 | 短期不均匀 | 无特殊要求 |
| **权重（Weighted）** | 考虑实例性能 | 配置复杂 | 实例性能不同 |
| **最少连接** | 负载最均衡 | 需维护连接数 | 长连接场景 |
| **IP Hash** | 会话保持 | 分布可能不均 | 有状态服务 |
| **Zone Aware** | 降低延迟 | 实现复杂 | 多机房部署 |

---

## 2. 权重负载均衡

### 2.1 基于权重的负载均衡

**应用场景**：
- 实例性能不同（高配机器权重大）
- 灰度发布（新版本权重小）
- 逐步扩缩容

**权重配置（Nacos）**：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        weight: 1.0  # 权重范围 0-10000，默认 1.0
```

### 2.2 WeightedLoadBalancer 实现

```java
public class WeightedLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private final String serviceId;
    private final ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(this::getInstanceResponse);
    }
    
    private Response<ServiceInstance> getInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 1. 计算总权重
        int totalWeight = instances.stream()
            .mapToInt(this::getWeight)
            .sum();
        
        if (totalWeight == 0) {
            // 所有实例权重都为0，降级为随机选择
            int index = ThreadLocalRandom.current().nextInt(instances.size());
            return new DefaultResponse(instances.get(index));
        }
        
        // 2. 生成随机数 [0, totalWeight)
        int randomWeight = ThreadLocalRandom.current().nextInt(totalWeight);
        
        // 3. 加权选择
        int currentWeight = 0;
        for (ServiceInstance instance : instances) {
            currentWeight += getWeight(instance);
            if (randomWeight < currentWeight) {
                return new DefaultResponse(instance);
            }
        }
        
        return new DefaultResponse(instances.get(instances.size() - 1));
    }
    
    private int getWeight(ServiceInstance instance) {
        Map<String, String> metadata = instance.getMetadata();
        String weightStr = metadata.get("weight");
        
        if (weightStr != null) {
            try {
                double weight = Double.parseDouble(weightStr);
                return (int) (weight * 100);  // 转为整数权重
            } catch (NumberFormatException e) {
                // 解析失败，使用默认权重
            }
        }
        
        return 100;  // 默认权重 1.0 = 100
    }
}
```

**权重计算示例**：

```
实例A：weight=1.0 (100)
实例B：weight=2.0 (200)
实例C：weight=0.5 (50)

总权重 = 100 + 200 + 50 = 350

随机数范围 [0, 350)
- [0, 100)   → 实例A（28.6%）
- [100, 300) → 实例B（57.1%）
- [300, 350) → 实例C（14.3%）
```

### 2.3 平滑加权轮询（Nginx算法）

```java
public class SmoothWeightedRoundRobinLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private final ConcurrentHashMap<String, WeightedInstance> instanceWeightMap = new ConcurrentHashMap<>();
    
    @Data
    static class WeightedInstance {
        private final ServiceInstance instance;
        private final int weight;           // 固定权重
        private int currentWeight;          // 当前权重（动态变化）
        
        public WeightedInstance(ServiceInstance instance, int weight) {
            this.instance = instance;
            this.weight = weight;
            this.currentWeight = 0;
        }
    }
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(this::getInstanceResponse);
    }
    
    private Response<ServiceInstance> getInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 初始化权重
        List<WeightedInstance> weightedInstances = instances.stream()
            .map(instance -> {
                String key = instance.getHost() + ":" + instance.getPort();
                return instanceWeightMap.computeIfAbsent(key, 
                    k -> new WeightedInstance(instance, getWeight(instance)));
            })
            .collect(Collectors.toList());
        
        // 平滑加权轮询算法
        synchronized (this) {
            int totalWeight = weightedInstances.stream()
                .mapToInt(WeightedInstance::getWeight)
                .sum();
            
            // 1. 每个实例的 currentWeight += weight
            weightedInstances.forEach(wi -> {
                wi.currentWeight += wi.weight;
            });
            
            // 2. 选择 currentWeight 最大的实例
            WeightedInstance selected = weightedInstances.stream()
                .max(Comparator.comparingInt(WeightedInstance::getCurrentWeight))
                .orElse(weightedInstances.get(0));
            
            // 3. 选中实例的 currentWeight -= totalWeight
            selected.currentWeight -= totalWeight;
            
            return new DefaultResponse(selected.getInstance());
        }
    }
}
```

**平滑加权轮询示例**：

```
实例A：weight=5
实例B：weight=1
实例C：weight=1

请求序列：
请求1：A(5+5=10), B(0+1=1), C(0+1=1) → 选A，A(10-7=3)
请求2：A(3+5=8),  B(1+1=2), C(1+1=2) → 选A，A(8-7=1)
请求3：A(1+5=6),  B(2+1=3), C(2+1=3) → 选A，A(6-7=-1)
请求4：A(-1+5=4), B(3+1=4), C(3+1=4) → 选A，A(4-7=-3)
请求5：A(-3+5=2), B(4+1=5), C(4+1=5) → 选B，B(5-7=-2)
请求6：A(2+5=7),  B(-2+1=-1),C(5+1=6)→ 选A，A(7-7=0)
请求7：A(0+5=5),  B(-1+1=0),C(6+1=7)→ 选C，C(7-7=0)

7次请求：A被选中5次，B和C各1次
权重比例：5:1:1 ✅
分布平滑 ✅
```

---

## 3. Zone Aware 负载均衡

### 3.1 跨地域场景

**问题**：

```
北京用户 → 上海机房 → 响应时间300ms（跨地域）
北京用户 → 北京机房 → 响应时间10ms（同地域）

优化：优先调用同地域实例
```

**配置元数据**：

```yaml
# 北京机房实例
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          zone: beijing
          region: cn-north

# 上海机房实例
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          zone: shanghai
          region: cn-east
```

### 3.2 ZonePreferenceLoadBalancer 实现

```java
public class ZonePreferenceLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Value("${spring.cloud.nacos.discovery.metadata.zone}")
    private String localZone;
    
    private final ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(this::getInstanceResponse);
    }
    
    private Response<ServiceInstance> getInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 1. 优先选择同 Zone 的实例
        List<ServiceInstance> sameZoneInstances = instances.stream()
            .filter(instance -> localZone.equals(instance.getMetadata().get("zone")))
            .collect(Collectors.toList());
        
        if (!sameZoneInstances.isEmpty()) {
            // 同 Zone 有可用实例，从中随机选择
            int index = ThreadLocalRandom.current().nextInt(sameZoneInstances.size());
            return new DefaultResponse(sameZoneInstances.get(index));
        }
        
        // 2. 同 Zone 无可用实例，降级到所有实例
        log.warn("同Zone无可用实例，降级到全局负载均衡");
        int index = ThreadLocalRandom.current().nextInt(instances.size());
        return new DefaultResponse(instances.get(index));
    }
}
```

### 3.3 Zone Aware 配置

```java
@Configuration
public class ZoneAwareLoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> zonePreferenceLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new ZonePreferenceLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name,
            environment.getProperty("spring.cloud.nacos.discovery.metadata.zone")
        );
    }
}
```

---

## 4. 同实例优先（Sticky Session）

### 4.1 应用场景

**问题**：
- Session 存储在实例内存中
- 切换实例导致 Session 丢失

**解决方案**：
- 同一用户的请求路由到同一实例
- 基于 IP Hash 或 Session ID

### 4.2 StickySessionLoadBalancer 实现

```java
public class StickySessionLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    // 记录用户与实例的绑定关系
    private final ConcurrentHashMap<String, String> stickyMap = new ConcurrentHashMap<>();
    
    private final ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(instances -> getInstanceResponse(instances, request));
    }
    
    private Response<ServiceInstance> getInstanceResponse(
            List<ServiceInstance> instances, Request request) {
        
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 1. 从请求上下文获取用户标识
        String userId = getUserId(request);
        
        if (userId != null) {
            // 2. 查找绑定的实例
            String boundInstanceId = stickyMap.get(userId);
            
            if (boundInstanceId != null) {
                // 3. 尝试使用绑定的实例
                Optional<ServiceInstance> boundInstance = instances.stream()
                    .filter(i -> getInstanceId(i).equals(boundInstanceId))
                    .findFirst();
                
                if (boundInstance.isPresent()) {
                    return new DefaultResponse(boundInstance.get());
                } else {
                    // 绑定的实例已下线，移除绑定
                    stickyMap.remove(userId);
                }
            }
        }
        
        // 4. 选择新实例并建立绑定
        int index = ThreadLocalRandom.current().nextInt(instances.size());
        ServiceInstance selected = instances.get(index);
        
        if (userId != null) {
            stickyMap.put(userId, getInstanceId(selected));
        }
        
        return new DefaultResponse(selected);
    }
    
    private String getUserId(Request request) {
        // 从请求头获取用户ID
        DefaultRequestContext context = (DefaultRequestContext) request.getContext();
        if (context != null) {
            HttpHeaders headers = context.getClientRequest().getHeaders();
            return headers.getFirst("X-User-Id");
        }
        return null;
    }
    
    private String getInstanceId(ServiceInstance instance) {
        return instance.getHost() + ":" + instance.getPort();
    }
}
```

### 4.3 IP Hash 负载均衡

```java
public class IpHashLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(instances -> getInstanceResponse(instances, request));
    }
    
    private Response<ServiceInstance> getInstanceResponse(
            List<ServiceInstance> instances, Request request) {
        
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 1. 获取客户端IP
        String clientIp = getClientIp(request);
        
        // 2. IP Hash
        int hash = clientIp.hashCode();
        int index = Math.abs(hash) % instances.size();
        
        return new DefaultResponse(instances.get(index));
    }
    
    private String getClientIp(Request request) {
        DefaultRequestContext context = (DefaultRequestContext) request.getContext();
        if (context != null) {
            HttpHeaders headers = context.getClientRequest().getHeaders();
            
            // 1. 尝试从 X-Forwarded-For 获取
            String xff = headers.getFirst("X-Forwarded-For");
            if (xff != null && !xff.isEmpty()) {
                return xff.split(",")[0].trim();
            }
            
            // 2. 尝试从 X-Real-IP 获取
            String realIp = headers.getFirst("X-Real-IP");
            if (realIp != null && !realIp.isEmpty()) {
                return realIp;
            }
        }
        
        return "unknown";
    }
}
```

---

## 5. 自定义负载均衡算法

### 5.1 最少连接负载均衡

```java
public class LeastConnectionLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    // 记录每个实例的连接数
    private final ConcurrentHashMap<String, AtomicInteger> connectionCount = new ConcurrentHashMap<>();
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(this::getInstanceResponse);
    }
    
    private Response<ServiceInstance> getInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 1. 找到连接数最少的实例
        ServiceInstance selected = instances.stream()
            .min(Comparator.comparingInt(instance -> {
                String key = getInstanceKey(instance);
                return connectionCount.computeIfAbsent(key, k -> new AtomicInteger(0)).get();
            }))
            .orElse(instances.get(0));
        
        // 2. 增加连接数
        String key = getInstanceKey(selected);
        connectionCount.computeIfAbsent(key, k -> new AtomicInteger(0)).incrementAndGet();
        
        return new LeastConnectionResponse(selected, key, this);
    }
    
    private String getInstanceKey(ServiceInstance instance) {
        return instance.getHost() + ":" + instance.getPort();
    }
    
    // 请求完成后减少连接数
    public void decrementConnectionCount(String instanceKey) {
        AtomicInteger count = connectionCount.get(instanceKey);
        if (count != null) {
            count.decrementAndGet();
        }
    }
    
    static class LeastConnectionResponse extends DefaultResponse {
        private final String instanceKey;
        private final LeastConnectionLoadBalancer loadBalancer;
        
        public LeastConnectionResponse(ServiceInstance instance, String instanceKey, 
                                        LeastConnectionLoadBalancer loadBalancer) {
            super(instance);
            this.instanceKey = instanceKey;
            this.loadBalancer = loadBalancer;
        }
        
        // 请求完成后调用
        public void onComplete() {
            loadBalancer.decrementConnectionCount(instanceKey);
        }
    }
}
```

### 5.2 响应时间加权负载均衡

```java
public class ResponseTimeWeightedLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    // 记录每个实例的平均响应时间
    private final ConcurrentHashMap<String, AverageResponseTime> responseTimeMap = new ConcurrentHashMap<>();
    
    @Data
    static class AverageResponseTime {
        private final AtomicLong totalTime = new AtomicLong(0);
        private final AtomicInteger count = new AtomicInteger(0);
        
        public void record(long responseTime) {
            totalTime.addAndGet(responseTime);
            count.incrementAndGet();
        }
        
        public long getAverage() {
            int c = count.get();
            return c > 0 ? totalTime.get() / c : 100;  // 默认100ms
        }
    }
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(this::getInstanceResponse);
    }
    
    private Response<ServiceInstance> getInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 1. 计算每个实例的权重（响应时间越短，权重越高）
        int totalWeight = 0;
        List<Integer> weights = new ArrayList<>();
        
        for (ServiceInstance instance : instances) {
            String key = getInstanceKey(instance);
            AverageResponseTime art = responseTimeMap.computeIfAbsent(key, 
                k -> new AverageResponseTime());
            
            // 权重 = 1000 / 平均响应时间
            int weight = (int) (1000 / Math.max(art.getAverage(), 1));
            weights.add(weight);
            totalWeight += weight;
        }
        
        // 2. 加权随机选择
        int randomWeight = ThreadLocalRandom.current().nextInt(totalWeight);
        int currentWeight = 0;
        
        for (int i = 0; i < instances.size(); i++) {
            currentWeight += weights.get(i);
            if (randomWeight < currentWeight) {
                return new ResponseTimeWeightedResponse(instances.get(i), this);
            }
        }
        
        return new DefaultResponse(instances.get(instances.size() - 1));
    }
    
    public void recordResponseTime(String instanceKey, long responseTime) {
        AverageResponseTime art = responseTimeMap.computeIfAbsent(instanceKey, 
            k -> new AverageResponseTime());
        art.record(responseTime);
    }
    
    private String getInstanceKey(ServiceInstance instance) {
        return instance.getHost() + ":" + instance.getPort();
    }
}
```

### 5.3 一致性 Hash 负载均衡

```java
public class ConsistentHashLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private final TreeMap<Integer, ServiceInstance> virtualNodes = new TreeMap<>();
    private final int virtualNodeCount = 150;  // 每个实例150个虚拟节点
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(instances -> getInstanceResponse(instances, request));
    }
    
    private Response<ServiceInstance> getInstanceResponse(
            List<ServiceInstance> instances, Request request) {
        
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 1. 构建一致性Hash环
        buildHashRing(instances);
        
        // 2. 计算请求的Hash值
        String requestKey = getRequestKey(request);
        int hash = hash(requestKey);
        
        // 3. 在Hash环上顺时针查找最近的节点
        Map.Entry<Integer, ServiceInstance> entry = virtualNodes.ceilingEntry(hash);
        if (entry == null) {
            entry = virtualNodes.firstEntry();
        }
        
        return new DefaultResponse(entry.getValue());
    }
    
    private void buildHashRing(List<ServiceInstance> instances) {
        virtualNodes.clear();
        
        for (ServiceInstance instance : instances) {
            String instanceKey = getInstanceKey(instance);
            
            // 为每个实例创建虚拟节点
            for (int i = 0; i < virtualNodeCount; i++) {
                String virtualNodeKey = instanceKey + "#" + i;
                int hash = hash(virtualNodeKey);
                virtualNodes.put(hash, instance);
            }
        }
    }
    
    private String getRequestKey(Request request) {
        // 从请求中提取Key（如用户ID、Session ID等）
        DefaultRequestContext context = (DefaultRequestContext) request.getContext();
        if (context != null) {
            HttpHeaders headers = context.getClientRequest().getHeaders();
            String userId = headers.getFirst("X-User-Id");
            if (userId != null) {
                return userId;
            }
        }
        return UUID.randomUUID().toString();
    }
    
    private String getInstanceKey(ServiceInstance instance) {
        return instance.getHost() + ":" + instance.getPort();
    }
    
    private int hash(String key) {
        // FNV1_32_HASH算法
        final int p = 16777619;
        int hash = (int) 2166136261L;
        
        for (byte b : key.getBytes()) {
            hash = (hash ^ b) * p;
        }
        
        hash += hash << 13;
        hash ^= hash >> 7;
        hash += hash << 3;
        hash ^= hash >> 17;
        hash += hash << 5;
        
        return hash < 0 ? Math.abs(hash) : hash;
    }
}
```

---

## 6. 负载均衡器性能优化

### 6.1 实例列表缓存

```java
@Configuration
public class LoadBalancerCacheConfig {
    
    @Bean
    public ServiceInstanceListSupplier cachedServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        
        return ServiceInstanceListSupplier.builder()
            .withDiscoveryClient()
            .withCaching()  // 启用缓存（默认35秒）
            .build(context);
    }
}
```

**自定义缓存时间**：

```yaml
spring:
  cloud:
    loadbalancer:
      cache:
        enabled: true
        ttl: 60s        # 缓存60秒
        capacity: 256   # 缓存容量
```

### 6.2 健康检查优化

```java
@Bean
public ServiceInstanceListSupplier healthCheckServiceInstanceListSupplier(
        ConfigurableApplicationContext context) {
    
    return ServiceInstanceListSupplier.builder()
        .withDiscoveryClient()
        .withHealthChecks()  // 启用健康检查
        .build(context);
}
```

**健康检查配置**：

```yaml
spring:
  cloud:
    loadbalancer:
      health-check:
        initial-delay: 0      # 初始延迟
        interval: 25s         # 检查间隔
        path: /actuator/health  # 健康检查路径
```

### 6.3 重试优化

```yaml
spring:
  cloud:
    loadbalancer:
      retry:
        enabled: true
        max-retries-on-same-service-instance: 0  # 同实例重试次数
        max-retries-on-next-service-instance: 1  # 其他实例重试次数
        retry-on-all-operations: false  # 是否对所有操作重试
        retryable-status-codes: 500,502,503  # 可重试的状态码
```

---

## 7. 实战案例

### 7.1 多策略组合

```java
@Configuration
@LoadBalancerClient(name = "user-service", configuration = CompositeLoadBalancerConfig.class)
public class LoadBalancerConfiguration {
}

@Configuration
class CompositeLoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> compositeLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory factory) {
        
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new CompositeLoadBalancer(
            factory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name,
            environment
        );
    }
}

public class CompositeLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        return supplier.get(request).next()
            .map(instances -> {
                // 1. Zone过滤（同地域优先）
                List<ServiceInstance> filtered = filterByZone(instances);
                
                // 2. 健康检查过滤
                filtered = filterByHealth(filtered);
                
                // 3. 权重负载均衡
                return weightedChoose(filtered);
            });
    }
}
```

### 7.2 负载均衡监控

```java
@Component
@Slf4j
public class LoadBalancerMetrics {
    
    private final MeterRegistry meterRegistry;
    private final ConcurrentHashMap<String, AtomicInteger> requestCount = new ConcurrentHashMap<>();
    
    public void recordRequest(String instanceKey) {
        // 1. 记录请求次数
        requestCount.computeIfAbsent(instanceKey, k -> new AtomicInteger(0))
            .incrementAndGet();
        
        // 2. 上报指标到 Prometheus
        Counter.builder("loadbalancer.requests")
            .tag("instance", instanceKey)
            .register(meterRegistry)
            .increment();
    }
    
    @Scheduled(fixedRate = 60000)  // 每分钟输出统计
    public void logStatistics() {
        log.info("负载均衡统计：");
        requestCount.forEach((instance, count) -> {
            log.info("  {} : {} 次请求", instance, count.get());
        });
    }
}
```

---

## 8. 面试要点

### 8.1 基础问题

**Q1：常见的负载均衡策略有哪些？**

- 轮询（RoundRobin）
- 随机（Random）
- 权重（Weighted）
- 最少连接（LeastConnection）
- IP Hash

**Q2：如何实现权重负载均衡？**

1. 计算总权重
2. 生成随机数 [0, totalWeight)
3. 遍历实例，累加权重
4. 当随机数 < 累加权重时，选中该实例

### 8.2 进阶问题

**Q3：平滑加权轮询和普通加权轮询的区别？**

- 普通加权：短期内可能集中调用高权重实例
- 平滑加权：分布更均匀，避免突发流量

**Q4：一致性Hash的优势是什么？**

- 节点增减时，只影响部分请求
- 适合缓存场景
- 虚拟节点解决数据倾斜

### 8.3 架构问题

**Q5：如何设计多地域负载均衡？**

1. Zone Aware：同地域优先
2. 健康检查：剔除不健康实例
3. 降级策略：同地域无可用时降级

**Q6：如何优化负载均衡性能？**

1. 缓存实例列表
2. 异步健康检查
3. 合理的重试策略
4. 监控和告警

---

## 9. 参考资料

**官方文档**：
- [Spring Cloud LoadBalancer](https://docs.spring.io/spring-cloud-commons/docs/current/reference/html/#spring-cloud-loadbalancer)

**算法**：
- [平滑加权轮询算法](https://github.com/phusion/nginx/commit/27e94984486058d73157038f7950a0a36ecc6e35)
- [一致性Hash算法](https://en.wikipedia.org/wiki/Consistent_hashing)

---

**下一章预告**：第 14 章将开始学习 OpenFeign，包括 Feign 快速入门、声明式HTTP客户端原理、@FeignClient 注解详解、请求参数传递、响应处理、Feign 配置自定义等内容。

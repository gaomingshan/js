# 第13章：Spring Cloud LoadBalancer 快速入门

> **本章目标**：掌握 Spring Cloud LoadBalancer 的使用，理解客户端负载均衡原理，能够实现自定义负载均衡策略

---

## 1. 组件引入与快速入门

### 1.1 Spring Cloud LoadBalancer 简介

**定位**：Spring Cloud 官方负载均衡组件，替代 Netflix Ribbon（已停止维护）。

**客户端负载均衡 vs 服务端负载均衡**：

**服务端负载均衡（Nginx、LVS）**：
```
Client → Nginx（负载均衡器）→ Server1/Server2/Server3
- 负载均衡在服务端
- 客户端不感知后端服务数量
- 统一入口
```

**客户端负载均衡（LoadBalancer、Ribbon）**：
```
Client（内置负载均衡器）→ Server1/Server2/Server3
- 负载均衡在客户端
- 客户端从注册中心获取服务列表
- 客户端自己选择服务实例
```

**优势**：
- ✅ 无需额外部署负载均衡器
- ✅ 减少网络跳转
- ✅ 灵活定制负载均衡策略

---

### 1.2 最小配置

**pom.xml**：
```xml
<dependencies>
    <!-- Spring Cloud LoadBalancer（Spring Cloud 2020.0.0+ 默认集成） -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-loadbalancer</artifactId>
    </dependency>

    <!-- Nacos Discovery（包含服务注册与发现） -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>

    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

**application.yml**：
```yaml
server:
  port: 8002

spring:
  application:
    name: order-service
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
```

---

### 1.3 快速使用

**服务提供者（user-service）**：
```java
@RestController
public class UserController {
    
    @Value("${server.port}")
    private String port;
    
    @GetMapping("/user/{id}")
    public String getUser(@PathVariable Long id) {
        return "User " + id + " from port " + port;
    }
}
```

**启动多个实例**：
```bash
# 实例1
java -jar user-service.jar --server.port=8001

# 实例2
java -jar user-service.jar --server.port=8011

# 实例3
java -jar user-service.jar --server.port=8021
```

**服务消费者（order-service）**：

**方式1：RestTemplate + @LoadBalanced**
```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced  // 开启负载均衡
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

```java
@RestController
public class OrderController {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @GetMapping("/order/{userId}")
    public String createOrder(@PathVariable Long userId) {
        // 使用服务名调用（LoadBalancer 自动负载均衡）
        String url = "http://user-service/user/" + userId;
        String user = restTemplate.getForObject(url, String.class);
        
        return "Order created for " + user;
    }
}
```

**测试**：
```bash
# 多次调用
curl http://localhost:8002/order/1
curl http://localhost:8002/order/1
curl http://localhost:8002/order/1

# 返回（轮询）：
# Order created for User 1 from port 8001
# Order created for User 1 from port 8011
# Order created for User 1 from port 8021
```

---

## 2. 负载均衡策略

### 2.1 内置策略

**Spring Cloud LoadBalancer 内置策略**：
1. **RoundRobinLoadBalancer**（默认）：轮询
2. **RandomLoadBalancer**：随机

**Ribbon 内置策略**（参考）：
1. **RoundRobinRule**：轮询
2. **RandomRule**：随机
3. **WeightedResponseTimeRule**：加权响应时间
4. **BestAvailableRule**：最小并发
5. **RetryRule**：重试
6. **AvailabilityFilteringRule**：可用过滤
7. **ZoneAvoidanceRule**（默认）：区域感知

---

### 2.2 切换负载均衡策略

**全局配置**：
```java
@Configuration
public class LoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        
        return new RandomLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name);
    }
}
```

**指定服务配置**：
```java
@Configuration
@LoadBalancerClient(name = "user-service", configuration = UserServiceLoadBalancerConfig.class)
public class LoadBalancerConfiguration {
}

class UserServiceLoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name);
    }
}
```

---

### 2.3 自定义负载均衡策略

**场景**：根据服务实例的权重进行负载均衡。

**实现**：
```java
package com.demo.order.loadbalancer;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.DefaultResponse;
import org.springframework.cloud.client.loadbalancer.EmptyResponse;
import org.springframework.cloud.client.loadbalancer.Request;
import org.springframework.cloud.client.loadbalancer.Response;
import org.springframework.cloud.loadbalancer.core.ReactorServiceInstanceLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ServiceInstanceListSupplier;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class WeightedLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    private String serviceId;
    
    public WeightedLoadBalancer(
            ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider,
            String serviceId) {
        this.serviceInstanceListSupplierProvider = serviceInstanceListSupplierProvider;
        this.serviceId = serviceId;
    }
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(serviceInstances -> processInstanceResponse(serviceInstances));
    }
    
    private Response<ServiceInstance> processInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 根据权重选择实例
        ServiceInstance instance = getInstanceByWeight(instances);
        
        return new DefaultResponse(instance);
    }
    
    private ServiceInstance getInstanceByWeight(List<ServiceInstance> instances) {
        // 计算总权重
        int totalWeight = 0;
        for (ServiceInstance instance : instances) {
            int weight = getWeight(instance);
            totalWeight += weight;
        }
        
        // 随机选择
        int randomWeight = ThreadLocalRandom.current().nextInt(totalWeight);
        
        int currentWeight = 0;
        for (ServiceInstance instance : instances) {
            int weight = getWeight(instance);
            currentWeight += weight;
            
            if (randomWeight < currentWeight) {
                return instance;
            }
        }
        
        return instances.get(0);
    }
    
    private int getWeight(ServiceInstance instance) {
        // 从实例元数据获取权重
        String weight = instance.getMetadata().get("weight");
        return weight != null ? Integer.parseInt(weight) : 1;
    }
}
```

**配置**：
```java
@Configuration
public class LoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> weightedLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        
        return new WeightedLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name);
    }
}
```

**服务提供者配置权重**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          weight: 3  # 权重为3
```

**测试**：
- 实例1（权重1）：10%流量
- 实例2（权重3）：30%流量
- 实例3（权重6）：60%流量

---

## 3. LoadBalancer 工作原理

### 3.1 核心流程

**完整流程**：
```
1. RestTemplate 发起请求
    ↓
2. LoadBalancerInterceptor 拦截请求
    ↓
3. LoadBalancerClient 选择服务实例
    ↓
4. 从 ServiceInstanceListSupplier 获取服务实例列表
    ↓
5. ReactorLoadBalancer 执行负载均衡策略
    ↓
6. 选择一个服务实例
    ↓
7. 替换服务名为实际IP:端口
    ↓
8. 发起 HTTP 请求
```

---

### 3.2 核心组件

**LoadBalancerClient**：
- 负载均衡客户端
- 提供 choose() 方法选择服务实例

**ReactorLoadBalancer**：
- 负载均衡器接口
- 实现类：RoundRobinLoadBalancer、RandomLoadBalancer

**ServiceInstanceListSupplier**：
- 服务实例列表提供者
- 从 DiscoveryClient 获取服务实例列表

**LoadBalancerInterceptor**：
- RestTemplate 拦截器
- 拦截请求，执行负载均衡

---

### 3.3 源码分析

**LoadBalancerInterceptor.java**：
```java
public class LoadBalancerInterceptor implements ClientHttpRequestInterceptor {
    
    private LoadBalancerClient loadBalancer;
    
    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body,
            ClientHttpRequestExecution execution) throws IOException {
        
        URI originalUri = request.getURI();
        String serviceName = originalUri.getHost();  // 例如：user-service
        
        // 执行负载均衡
        return this.loadBalancer.execute(serviceName, 
            requestFactory.createRequest(request, body, execution));
    }
}
```

**BlockingLoadBalancerClient.java**：
```java
public class BlockingLoadBalancerClient implements LoadBalancerClient {
    
    private ReactorLoadBalancer.Factory<ServiceInstance> loadBalancerClientFactory;
    
    @Override
    public <T> T execute(String serviceId, LoadBalancerRequest<T> request) {
        // 1. 获取负载均衡器
        ReactorLoadBalancer<ServiceInstance> loadBalancer = loadBalancerClientFactory.getInstance(serviceId);
        
        // 2. 选择服务实例
        Response<ServiceInstance> loadBalancerResponse = Mono.from(loadBalancer.choose()).block();
        
        if (loadBalancerResponse == null || !loadBalancerResponse.hasServer()) {
            throw new IllegalStateException("No available instance for " + serviceId);
        }
        
        ServiceInstance instance = loadBalancerResponse.getServer();
        
        // 3. 执行请求
        return execute(serviceId, instance, request);
    }
    
    @Override
    public <T> T execute(String serviceId, ServiceInstance instance, 
            LoadBalancerRequest<T> request) {
        try {
            return request.apply(instance);
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}
```

**RoundRobinLoadBalancer.java**：
```java
public class RoundRobinLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private AtomicInteger position = new AtomicInteger(0);
    private ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(serviceInstances -> processInstanceResponse(serviceInstances));
    }
    
    private Response<ServiceInstance> processInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 轮询算法
        int pos = Math.abs(this.position.incrementAndGet());
        ServiceInstance instance = instances.get(pos % instances.size());
        
        return new DefaultResponse(instance);
    }
}
```

---

## 4. 实际落地场景

### 4.1 场景1：同机房优先

**需求**：优先调用同机房的服务实例，降低网络延迟。

**实现**：
```java
public class SameZoneLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Value("${spring.cloud.nacos.discovery.metadata.zone}")
    private String currentZone;
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(serviceInstances -> processInstanceResponse(serviceInstances));
    }
    
    private Response<ServiceInstance> processInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 过滤同机房实例
        List<ServiceInstance> sameZoneInstances = instances.stream()
            .filter(instance -> currentZone.equals(instance.getMetadata().get("zone")))
            .collect(Collectors.toList());
        
        // 如果同机房有实例，优先使用
        List<ServiceInstance> targetInstances = sameZoneInstances.isEmpty() 
            ? instances 
            : sameZoneInstances;
        
        // 轮询选择
        int pos = Math.abs(position.incrementAndGet());
        ServiceInstance instance = targetInstances.get(pos % targetInstances.size());
        
        return new DefaultResponse(instance);
    }
}
```

**配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          zone: zone1  # 机房标识
```

---

### 4.2 场景2：灰度发布

**需求**：将10%的流量路由到灰度版本，验证功能。

**实现**：
```java
public class GrayLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider
            .getIfAvailable(NoopServiceInstanceListSupplier::new);
        
        return supplier.get(request).next()
            .map(serviceInstances -> processInstanceResponse(serviceInstances, request));
    }
    
    private Response<ServiceInstance> processInstanceResponse(
            List<ServiceInstance> instances, Request request) {
        
        if (instances.isEmpty()) {
            return new EmptyResponse();
        }
        
        // 区分灰度实例和正式实例
        List<ServiceInstance> grayInstances = instances.stream()
            .filter(instance -> "gray".equals(instance.getMetadata().get("version")))
            .collect(Collectors.toList());
        
        List<ServiceInstance> normalInstances = instances.stream()
            .filter(instance -> !"gray".equals(instance.getMetadata().get("version")))
            .collect(Collectors.toList());
        
        // 10%流量走灰度
        boolean useGray = ThreadLocalRandom.current().nextInt(100) < 10;
        
        List<ServiceInstance> targetInstances;
        if (useGray && !grayInstances.isEmpty()) {
            targetInstances = grayInstances;
        } else {
            targetInstances = normalInstances.isEmpty() ? instances : normalInstances;
        }
        
        // 轮询选择
        int pos = Math.abs(position.incrementAndGet());
        ServiceInstance instance = targetInstances.get(pos % targetInstances.size());
        
        return new DefaultResponse(instance);
    }
}
```

**灰度实例配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: gray
```

---

### 4.3 场景3：健康实例过滤

**需求**：只调用健康的服务实例。

**实现**：LoadBalancer 已自动集成健康检查，只会返回健康实例。

**验证**：
```bash
# 停止一个实例
kill -9 <pid>

# 继续调用，LoadBalancer 自动剔除不健康实例
curl http://localhost:8002/order/1
```

---

## 5. 常见问题与易错点

### 5.1 问题1：负载均衡不生效

**现象**：
- 请求总是调用同一个实例

**原因**：
- 未添加 @LoadBalanced 注解
- 使用了硬编码的 IP:端口

**解决方案**：
```java
// 错误：未添加 @LoadBalanced
@Bean
public RestTemplate restTemplate() {
    return new RestTemplate();
}

// 正确
@Bean
@LoadBalanced
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

```java
// 错误：硬编码 IP
String url = "http://localhost:8001/user/1";

// 正确：使用服务名
String url = "http://user-service/user/1";
```

---

### 5.2 问题2：找不到服务实例

**现象**：
```
java.lang.IllegalStateException: No instances available for user-service
```

**原因**：
- 服务提供者未启动
- 服务提供者未注册到 Nacos

**排查步骤**：
```bash
# 1. 检查 Nacos 控制台，是否有服务实例
# 2. 检查服务名是否正确
# 3. 检查网络连接
```

---

### 5.3 问题3：自定义策略不生效

**现象**：
- 自定义负载均衡策略未生效，仍使用默认策略

**原因**：
- 配置类在主启动类包之外
- 配置类被 @ComponentScan 扫描到（导致全局生效）

**解决方案**：
```java
// 错误：配置类在主启动类包内
package com.demo.order;  // 主启动类包
@Configuration
public class LoadBalancerConfig { }

// 正确：配置类在独立包内
package com.demo.order.config.loadbalancer;  // 独立包
@Configuration
public class LoadBalancerConfig { }
```

---

## 6. 面试准备专项

### 高频面试题

**题目1：客户端负载均衡和服务端负载均衡的区别？**

**标准回答**：

**第一层（基础回答）**：
客户端负载均衡由客户端选择服务实例（LoadBalancer、Ribbon），服务端负载均衡由负载均衡器选择（Nginx、LVS）。

**第二层（深入原理）**：
- **服务端负载均衡**：
  - 负载均衡器部署在服务端
  - 客户端不感知后端服务
  - 统一入口，集中管理
  - 例如：Nginx、LVS、HAProxy
- **客户端负载均衡**：
  - 负载均衡器集成在客户端
  - 客户端从注册中心获取服务列表
  - 客户端自己选择服务实例
  - 例如：LoadBalancer、Ribbon

**第三层（扩展延伸）**：
- **客户端优势**：无需额外部署、减少网络跳转、灵活定制
- **服务端优势**：统一入口、易于管理、客户端无感知
- **实际应用**：微服务内部使用客户端负载均衡，对外暴露使用服务端负载均衡

**加分项**：
- 提到具体的使用场景
- 提到性能对比
- 提到实际生产经验

---

**题目2：LoadBalancer 的工作原理是什么？**

**标准回答**：

**第一层（基础回答）**：
LoadBalancer 通过拦截器拦截 RestTemplate 请求，从注册中心获取服务实例列表，执行负载均衡策略选择一个实例，替换服务名为实际 IP:端口。

**第二层（深入原理）**：
1. **拦截请求**：LoadBalancerInterceptor 拦截 RestTemplate 请求
2. **获取服务列表**：从 ServiceInstanceListSupplier 获取服务实例列表
3. **负载均衡**：ReactorLoadBalancer 执行负载均衡策略（轮询/随机）
4. **选择实例**：选择一个服务实例
5. **替换URL**：将服务名替换为实际 IP:端口
6. **发起请求**：执行 HTTP 请求

**第三层（扩展延伸）**：
- **核心组件**：LoadBalancerClient、ReactorLoadBalancer、ServiceInstanceListSupplier
- **内置策略**：RoundRobinLoadBalancer（轮询）、RandomLoadBalancer（随机）
- **自定义策略**：实现 ReactorServiceInstanceLoadBalancer 接口

**加分项**：
- 提到源码实现细节
- 提到与 Ribbon 的对比
- 提到实际自定义负载均衡策略的经验

---

## 7. 学习自检清单

- [ ] 理解客户端负载均衡和服务端负载均衡的区别
- [ ] 掌握 LoadBalancer 的快速使用
- [ ] 理解 LoadBalancer 的工作原理
- [ ] 掌握负载均衡策略切换
- [ ] 能够实现自定义负载均衡策略
- [ ] 掌握常见负载均衡场景（同机房优先、灰度发布）
- [ ] 能够排查负载均衡相关问题
- [ ] 能够流畅回答负载均衡面试题

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：LoadBalancer 原理、自定义策略
- **前置知识**：第4-7章服务注册与发现
- **实践建议**：实现权重负载均衡、同机房优先策略

---

**本章小结**：
- Spring Cloud LoadBalancer 是 Spring Cloud 官方负载均衡组件
- 客户端负载均衡：客户端从注册中心获取服务列表，自己选择实例
- 核心流程：拦截请求 → 获取服务列表 → 执行负载均衡 → 选择实例 → 发起请求
- 内置策略：RoundRobinLoadBalancer（轮询）、RandomLoadBalancer（随机）
- 可以自定义负载均衡策略（权重、同机房优先、灰度发布）
- 通过 @LoadBalanced 注解开启负载均衡

**下一章预告**：第14章将深入介绍 Ribbon 负载均衡器（虽然已停止维护，但面试仍会考察），包括 Ribbon 核心组件、负载均衡策略、自定义策略、与 LoadBalancer 对比。

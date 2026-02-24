# 第14章：Ribbon 负载均衡器

> **本章目标**：理解 Ribbon 负载均衡原理（虽然已停止维护，但面试仍常考），掌握 Ribbon 与 LoadBalancer 的对比

---

## 1. Ribbon 简介

### 1.1 Ribbon 定位

**说明**：
- Netflix 开源的客户端负载均衡组件
- Spring Cloud 早期默认负载均衡组件
- **已停止维护**（2020年进入维护模式）
- Spring Cloud 2020.0.0+ 默认使用 LoadBalancer

**为什么还要学 Ribbon？**
- 大量老项目仍在使用
- 面试高频考点
- 理解客户端负载均衡原理

---

### 1.2 Ribbon vs LoadBalancer

| 维度 | Ribbon | LoadBalancer |
|------|--------|--------------|
| **维护状态** | 停止维护 | 活跃维护 |
| **依赖** | Netflix | Spring Cloud 官方 |
| **负载均衡策略** | 7种内置策略 | 2种内置策略 |
| **响应式支持** | 不支持 | 支持（Reactor） |
| **性能** | 中 | 高 |
| **推荐度** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 2. Ribbon 核心组件

### 2.1 IRule（负载均衡策略）

**接口定义**：
```java
public interface IRule {
    // 选择一个服务实例
    Server choose(Object key);
    
    void setLoadBalancer(ILoadBalancer lb);
    ILoadBalancer getLoadBalancer();
}
```

**内置策略**：

**1. RoundRobinRule（轮询）**：
```java
public class RoundRobinRule extends AbstractLoadBalancerRule {
    
    private AtomicInteger nextServerCyclicCounter = new AtomicInteger(0);
    
    @Override
    public Server choose(ILoadBalancer lb, Object key) {
        if (lb == null) {
            return null;
        }
        
        Server server = null;
        int count = 0;
        while (server == null && count++ < 10) {
            List<Server> reachableServers = lb.getReachableServers();
            int upCount = reachableServers.size();
            
            if (upCount == 0) {
                return null;
            }
            
            int nextServerIndex = incrementAndGetModulo(upCount);
            server = reachableServers.get(nextServerIndex);
        }
        
        return server;
    }
    
    private int incrementAndGetModulo(int modulo) {
        for (;;) {
            int current = nextServerCyclicCounter.get();
            int next = (current + 1) % modulo;
            if (nextServerCyclicCounter.compareAndSet(current, next)) {
                return next;
            }
        }
    }
}
```

**2. RandomRule（随机）**：
```java
public class RandomRule extends AbstractLoadBalancerRule {
    
    @Override
    public Server choose(ILoadBalancer lb, Object key) {
        if (lb == null) {
            return null;
        }
        
        List<Server> upList = lb.getReachableServers();
        int serverCount = upList.size();
        
        if (serverCount == 0) {
            return null;
        }
        
        int index = ThreadLocalRandom.current().nextInt(serverCount);
        return upList.get(index);
    }
}
```

**3. WeightedResponseTimeRule（加权响应时间）**：
- 根据实例的平均响应时间计算权重
- 响应时间越短，权重越高，被选中概率越大

**4. BestAvailableRule（最小并发）**：
- 选择并发请求数最少的实例

**5. RetryRule（重试）**：
- 在指定时间内，重试选择可用实例

**6. AvailabilityFilteringRule（可用过滤）**：
- 过滤掉故障实例和并发数过高的实例

**7. ZoneAvoidanceRule（区域感知，默认）**：
- 根据服务所在区域和可用性过滤实例

---

### 2.2 IPing（健康检查）

**接口定义**：
```java
public interface IPing {
    boolean isAlive(Server server);
}
```

**内置实现**：

**1. PingUrl**：
- 通过 HTTP 请求检查健康状态
- 请求 /health 或自定义路径

**2. NIWSDiscoveryPing**：
- 使用 Eureka/Nacos 的健康状态
- 默认实现

**3. DummyPing**：
- 总是返回 true
- 不做实际检查

---

### 2.3 ServerList（服务列表）

**接口定义**：
```java
public interface ServerList<T extends Server> {
    List<T> getInitialListOfServers();
    List<T> getUpdatedListOfServers();
}
```

**实现**：
- **ConfigurationBasedServerList**：从配置文件读取
- **DiscoveryEnabledNIWSServerList**：从 Eureka/Nacos 获取

---

### 2.4 ILoadBalancer（负载均衡器）

**接口定义**：
```java
public interface ILoadBalancer {
    // 添加服务实例
    void addServers(List<Server> newServers);
    
    // 选择服务实例
    Server chooseServer(Object key);
    
    // 标记服务实例下线
    void markServerDown(Server server);
    
    // 获取可用服务实例
    List<Server> getReachableServers();
    
    // 获取所有服务实例
    List<Server> getAllServers();
}
```

**实现**：
- **BaseLoadBalancer**：基础实现
- **DynamicServerListLoadBalancer**：动态服务列表（从注册中心获取）
- **ZoneAwareLoadBalancer**：区域感知

---

## 3. Ribbon 配置

### 3.1 引入 Ribbon

**注意**：Spring Cloud 2020.0.0+ 默认不包含 Ribbon，需手动引入。

**pom.xml**：
```xml
<dependencies>
    <!-- Ribbon -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
    </dependency>

    <!-- Nacos Discovery（已包含 Ribbon） -->
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        <exclusions>
            <!-- 排除 LoadBalancer，使用 Ribbon -->
            <exclusion>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-loadbalancer</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
</dependencies>
```

---

### 3.2 全局配置

**配置类**：
```java
@Configuration
public class RibbonConfig {
    
    @Bean
    public IRule ribbonRule() {
        return new RandomRule();  // 使用随机策略
    }
}
```

**配置文件**：
```yaml
ribbon:
  # 连接超时时间
  ConnectTimeout: 2000
  # 读取超时时间
  ReadTimeout: 5000
  # 对所有请求都重试
  OkToRetryOnAllOperations: false
  # 切换实例的重试次数
  MaxAutoRetriesNextServer: 1
  # 对当前实例的重试次数
  MaxAutoRetries: 1
```

---

### 3.3 指定服务配置

**配置类**：
```java
@Configuration
@RibbonClient(name = "user-service", configuration = UserServiceRibbonConfig.class)
public class RibbonConfiguration {
}

class UserServiceRibbonConfig {
    
    @Bean
    public IRule ribbonRule() {
        return new WeightedResponseTimeRule();
    }
}
```

**配置文件**：
```yaml
user-service:
  ribbon:
    NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule
    # 连接超时
    ConnectTimeout: 1000
    # 读取超时
    ReadTimeout: 3000
```

---

## 4. Ribbon 自定义策略

### 4.1 基于权重的负载均衡

**实现**：
```java
package com.demo.order.ribbon;

import com.netflix.client.config.IClientConfig;
import com.netflix.loadbalancer.AbstractLoadBalancerRule;
import com.netflix.loadbalancer.Server;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class WeightedRule extends AbstractLoadBalancerRule {
    
    @Override
    public void initWithNiwsConfig(IClientConfig clientConfig) {
    }
    
    @Override
    public Server choose(Object key) {
        return choose(getLoadBalancer(), key);
    }
    
    public Server choose(ILoadBalancer lb, Object key) {
        if (lb == null) {
            return null;
        }
        
        List<Server> reachableServers = lb.getReachableServers();
        
        if (reachableServers.isEmpty()) {
            return null;
        }
        
        // 计算总权重
        int totalWeight = 0;
        for (Server server : reachableServers) {
            int weight = getWeight(server);
            totalWeight += weight;
        }
        
        // 随机选择
        int randomWeight = ThreadLocalRandom.current().nextInt(totalWeight);
        
        int currentWeight = 0;
        for (Server server : reachableServers) {
            int weight = getWeight(server);
            currentWeight += weight;
            
            if (randomWeight < currentWeight) {
                return server;
            }
        }
        
        return reachableServers.get(0);
    }
    
    private int getWeight(Server server) {
        // 从服务器元数据获取权重（需要自定义 Server 实现）
        // 这里简化处理，返回固定权重
        return 1;
    }
}
```

---

### 4.2 基于 IP Hash 的负载均衡

**实现**：
```java
public class IpHashRule extends AbstractLoadBalancerRule {
    
    @Override
    public Server choose(Object key) {
        return choose(getLoadBalancer(), key);
    }
    
    public Server choose(ILoadBalancer lb, Object key) {
        if (lb == null) {
            return null;
        }
        
        List<Server> reachableServers = lb.getReachableServers();
        
        if (reachableServers.isEmpty()) {
            return null;
        }
        
        // 获取客户端 IP
        String clientIp = getClientIp();
        
        // 根据 IP 哈希选择服务器
        int hash = Math.abs(clientIp.hashCode());
        int index = hash % reachableServers.size();
        
        return reachableServers.get(index);
    }
    
    private String getClientIp() {
        // 从请求上下文获取客户端 IP
        // 这里简化处理
        return "127.0.0.1";
    }
}
```

---

## 5. Ribbon 工作原理

### 5.1 核心流程

**完整流程**：
```
1. RestTemplate 发起请求（http://user-service/user/1）
    ↓
2. LoadBalancerInterceptor 拦截请求
    ↓
3. RibbonLoadBalancerClient 执行负载均衡
    ↓
4. DynamicServerListLoadBalancer 获取服务列表
    ↓
5. ServerList 从 Nacos/Eureka 拉取服务实例
    ↓
6. IPing 检查实例健康状态
    ↓
7. IRule 执行负载均衡策略（选择一个实例）
    ↓
8. 替换服务名为实际 IP:端口（http://192.168.1.100:8001/user/1）
    ↓
9. 发起 HTTP 请求
```

---

### 5.2 源码分析

**RibbonLoadBalancerClient.java**：
```java
public class RibbonLoadBalancerClient implements LoadBalancerClient {
    
    private SpringClientFactory clientFactory;
    
    @Override
    public <T> T execute(String serviceId, LoadBalancerRequest<T> request) {
        // 1. 获取负载均衡器
        ILoadBalancer loadBalancer = getLoadBalancer(serviceId);
        
        // 2. 选择服务实例
        Server server = getServer(loadBalancer, hint);
        
        if (server == null) {
            throw new IllegalStateException("No instances available for " + serviceId);
        }
        
        // 3. 执行请求
        return execute(serviceId, server, request);
    }
    
    protected Server getServer(ILoadBalancer loadBalancer, Object hint) {
        if (loadBalancer == null) {
            return null;
        }
        // 调用负载均衡器选择实例
        return loadBalancer.chooseServer(hint);
    }
}
```

**BaseLoadBalancer.java**：
```java
public class BaseLoadBalancer extends AbstractLoadBalancer {
    
    private IRule rule = DEFAULT_RULE;  // 默认轮询策略
    private IPing ping = null;
    protected List<Server> allServerList = new ArrayList<>();
    protected List<Server> upServerList = new ArrayList<>();
    
    @Override
    public Server chooseServer(Object key) {
        if (rule == null) {
            return null;
        }
        try {
            // 调用策略选择实例
            return rule.choose(key);
        } catch (Exception e) {
            return null;
        }
    }
    
    @Override
    public void addServers(List<Server> newServers) {
        if (newServers != null && newServers.size() > 0) {
            allServerList.addAll(newServers);
            upServerList.addAll(newServers);
        }
    }
    
    // 定时健康检查
    void setupPingTask() {
        if (canSkipPing()) {
            return;
        }
        
        // 每10秒检查一次
        lbTimer.schedule(new PingTask(), 0, pingIntervalSeconds * 1000);
    }
    
    class PingTask extends TimerTask {
        public void run() {
            try {
                new Pinger(pingStrategy).runPinger();
            } catch (Exception e) {
                logger.error("Error in ping", e);
            }
        }
    }
}
```

---

## 6. Ribbon vs LoadBalancer 对比

### 6.1 架构对比

**Ribbon 架构**：
```
RestTemplate
    ↓
LoadBalancerInterceptor
    ↓
RibbonLoadBalancerClient
    ↓
ILoadBalancer（BaseLoadBalancer）
    ↓
IRule（RoundRobinRule、RandomRule...）
    ↓
ServerList（从 Nacos/Eureka 获取）
```

**LoadBalancer 架构**：
```
RestTemplate
    ↓
LoadBalancerInterceptor
    ↓
BlockingLoadBalancerClient
    ↓
ReactorLoadBalancer（RoundRobinLoadBalancer、RandomLoadBalancer）
    ↓
ServiceInstanceListSupplier（从 DiscoveryClient 获取）
```

---

### 6.2 特性对比

| 特性 | Ribbon | LoadBalancer |
|------|--------|--------------|
| **策略** | 7种内置策略 | 2种内置策略 |
| **健康检查** | IPing | DiscoveryClient 健康状态 |
| **重试** | 内置重试机制 | 需配合 Spring Retry |
| **缓存** | 内置缓存 | 依赖 DiscoveryClient 缓存 |
| **响应式** | 不支持 | 支持（Reactor） |
| **性能** | 中 | 高 |
| **维护** | 停止维护 | 活跃维护 |

---

### 6.3 迁移建议

**从 Ribbon 迁移到 LoadBalancer**：

**步骤1：移除 Ribbon 依赖**：
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    <!-- 不需要排除 LoadBalancer -->
</dependency>
```

**步骤2：移除 Ribbon 配置**：
```yaml
# 删除 Ribbon 配置
# ribbon:
#   ConnectTimeout: 2000
#   ReadTimeout: 5000
```

**步骤3：迁移自定义策略**：
```java
// Ribbon 自定义策略
public class CustomRule extends AbstractLoadBalancerRule {
    @Override
    public Server choose(Object key) {
        // ...
    }
}

// LoadBalancer 自定义策略
public class CustomLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        // ...
    }
}
```

**步骤4：重试配置迁移**：
```xml
<!-- 引入 Spring Retry -->
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    loadbalancer:
      retry:
        enabled: true
```

---

## 7. 面试准备专项

### 高频面试题

**题目1：Ribbon 有哪些负载均衡策略？**

**标准回答**：

**第一层（基础回答）**：
Ribbon 有7种内置策略：轮询、随机、加权响应时间、最小并发、重试、可用过滤、区域感知（默认）。

**第二层（深入原理）**：
1. **RoundRobinRule**：轮询，依次选择服务实例
2. **RandomRule**：随机选择
3. **WeightedResponseTimeRule**：根据响应时间加权，响应越快权重越高
4. **BestAvailableRule**：选择并发数最少的实例
5. **RetryRule**：在指定时间内重试选择可用实例
6. **AvailabilityFilteringRule**：过滤掉故障和高并发实例
7. **ZoneAvoidanceRule**（默认）：区域感知，优先选择同区域实例

**第三层（扩展延伸）**：
- **默认策略**：ZoneAvoidanceRule
- **切换策略**：通过配置类或配置文件
- **自定义策略**：继承 AbstractLoadBalancerRule

**加分项**：
- 提到策略的实现原理
- 提到实际使用场景
- 提到 Ribbon 已停止维护，推荐使用 LoadBalancer

---

**题目2：Ribbon 和 LoadBalancer 的区别？为什么要替换？**

**标准回答**：

**第一层（基础回答）**：
Ribbon 是 Netflix 组件，已停止维护；LoadBalancer 是 Spring Cloud 官方组件，活跃维护。Spring Cloud 2020.0.0+ 默认使用 LoadBalancer。

**第二层（深入原理）**：
- **维护状态**：Ribbon 停止维护，LoadBalancer 活跃维护
- **策略**：Ribbon 7种，LoadBalancer 2种（可扩展）
- **响应式**：Ribbon 不支持，LoadBalancer 支持 Reactor
- **性能**：LoadBalancer 更高
- **依赖**：Ribbon（Netflix），LoadBalancer（Spring 官方）

**第三层（扩展延伸）**：
- **为什么替换**：
  - Netflix OSS 停止维护
  - Spring Cloud 官方推荐
  - 更好的响应式支持
  - 更轻量级
- **迁移成本**：低，API 类似

**加分项**：
- 提到 Netflix OSS 停止维护的背景
- 提到实际迁移经验
- 提到 LoadBalancer 的优势

---

**题目3：Ribbon 的工作原理是什么？**

**标准回答**：

**第一层（基础回答）**：
Ribbon 通过拦截器拦截 RestTemplate 请求，从注册中心获取服务列表，执行负载均衡策略选择实例，替换服务名为实际 IP:端口。

**第二层（深入原理）**：
1. **拦截请求**：LoadBalancerInterceptor 拦截
2. **获取负载均衡器**：RibbonLoadBalancerClient 获取 ILoadBalancer
3. **获取服务列表**：ServerList 从 Nacos/Eureka 获取
4. **健康检查**：IPing 检查实例健康状态
5. **负载均衡**：IRule 执行策略选择实例
6. **替换 URL**：替换服务名为 IP:端口
7. **发起请求**：执行 HTTP 请求

**第三层（扩展延伸）**：
- **核心组件**：ILoadBalancer、IRule、IPing、ServerList
- **定时任务**：定时从注册中心刷新服务列表、定时健康检查
- **缓存**：缓存服务列表，减少注册中心访问

**加分项**：
- 提到源码实现细节
- 提到 Ribbon 的缓存机制
- 提到 Ribbon 的健康检查机制

---

## 8. 学习自检清单

- [ ] 理解 Ribbon 的定位和现状
- [ ] 掌握 Ribbon 的7种负载均衡策略
- [ ] 理解 Ribbon 的核心组件（IRule、IPing、ServerList、ILoadBalancer）
- [ ] 掌握 Ribbon 的配置方式
- [ ] 能够实现自定义负载均衡策略
- [ ] 理解 Ribbon 的工作原理
- [ ] 掌握 Ribbon 和 LoadBalancer 的对比
- [ ] 能够进行 Ribbon 到 LoadBalancer 的迁移

**学习建议**：
- **预计学习时长**：2-3 小时
- **重点难点**：Ribbon 核心组件、工作原理、与 LoadBalancer 对比
- **前置知识**：第13章 LoadBalancer
- **实践建议**：了解即可，新项目使用 LoadBalancer

---

**本章小结**：
- Ribbon 是 Netflix 的客户端负载均衡组件，已停止维护
- 7种内置策略：轮询、随机、加权响应时间、最小并发、重试、可用过滤、区域感知
- 核心组件：ILoadBalancer、IRule、IPing、ServerList
- 工作原理：拦截 → 获取服务列表 → 健康检查 → 负载均衡 → 替换 URL → 发起请求
- Ribbon vs LoadBalancer：维护状态、策略数量、响应式支持、性能
- 推荐使用 LoadBalancer，Ribbon 仅作为面试知识点

**下一章预告**：第15章将介绍负载均衡最佳实践，包括负载均衡策略选择、健康检查配置、超时与重试配置、同机房优先策略、灰度发布、性能优化、常见问题排查。

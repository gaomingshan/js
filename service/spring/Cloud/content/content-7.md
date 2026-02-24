# 第7章：服务发现最佳实践

> **本章目标**：掌握服务发现的生产最佳实践，理解健康检查策略、优雅上下线、灰度发布、多环境隔离，能够排查常见问题

---

## 1. 服务实例健康检查策略

### 1.1 健康检查的重要性

**问题背景**：
```
服务实例可能处于以下状态：
- ✅ 正常运行
- ❌ 进程宕机
- ❌ 数据库连接失败
- ❌ 内存溢出
- ❌ 线程池耗尽
```

**仅靠心跳的问题**：
- 心跳只能证明进程存活
- 无法检测应用是否真正健康（如数据库连接失败）

**完善的健康检查**：
```
心跳检查（进程存活）
    +
应用健康检查（数据库、Redis、第三方服务）
    =
真正的健康状态
```

---

### 1.2 Spring Boot Actuator 健康检查

**引入依赖**：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**配置**：
```yaml
# Nacos
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          management.context-path: /actuator  # 健康检查路径

management:
  endpoints:
    web:
      exposure:
        include: health  # 暴露健康检查端点
  endpoint:
    health:
      show-details: always  # 显示详细健康信息
  health:
    # 开启各种健康检查
    db:
      enabled: true
    redis:
      enabled: true
```

**访问健康检查**：
```bash
curl http://localhost:8001/actuator/health
```

**返回示例**：
```json
{
  "status": "UP",
  "components": {
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 250685575168,
        "free": 100000000000,
        "threshold": 10485760
      }
    },
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "redis": {
      "status": "UP",
      "details": {
        "version": "6.2.6"
      }
    }
  }
}
```

---

### 1.3 自定义健康检查指标

**场景**：检查第三方服务可用性

**实现**：
```java
package com.demo.user.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ThirdPartyServiceHealthIndicator implements HealthIndicator {
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Override
    public Health health() {
        try {
            // 检查第三方服务是否可用
            String url = "http://third-party-service/health";
            String response = restTemplate.getForObject(url, String.class);
            
            if ("OK".equals(response)) {
                return Health.up()
                    .withDetail("thirdPartyService", "available")
                    .build();
            } else {
                return Health.down()
                    .withDetail("thirdPartyService", "unavailable")
                    .withDetail("response", response)
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("thirdPartyService", "error")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

**自定义检查数据库连接池**：
```java
@Component
public class DatabaseConnectionPoolHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try {
            // 检查数据库连接池
            HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
            HikariPoolMXBean poolMXBean = hikariDataSource.getHikariPoolMXBean();
            
            int activeConnections = poolMXBean.getActiveConnections();
            int idleConnections = poolMXBean.getIdleConnections();
            int totalConnections = poolMXBean.getTotalConnections();
            int maxPoolSize = hikariDataSource.getMaximumPoolSize();
            
            // 如果活跃连接数超过 80%，标记为 DOWN
            if (activeConnections > maxPoolSize * 0.8) {
                return Health.down()
                    .withDetail("activeConnections", activeConnections)
                    .withDetail("maxPoolSize", maxPoolSize)
                    .withDetail("usage", (activeConnections * 100 / maxPoolSize) + "%")
                    .build();
            }
            
            return Health.up()
                .withDetail("activeConnections", activeConnections)
                .withDetail("idleConnections", idleConnections)
                .withDetail("totalConnections", totalConnections)
                .withDetail("maxPoolSize", maxPoolSize)
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

---

### 1.4 健康检查最佳实践

**原则1：检查关键依赖**
```
✅ 数据库连接
✅ Redis 连接
✅ 消息队列连接
✅ 第三方服务可用性
❌ 不要检查太多，影响性能
```

**原则2：设置合理的超时**
```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public Health health() {
        try {
            // 设置查询超时（5 秒）
            jdbcTemplate.setQueryTimeout(5);
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return Health.up().build();
        } catch (Exception e) {
            return Health.down().withDetail("error", e.getMessage()).build();
        }
    }
}
```

**原则3：降级策略**
```java
@Component
public class RedisHealthIndicator implements HealthIndicator {
    
    @Autowired(required = false)
    private RedisTemplate<String, String> redisTemplate;
    
    @Override
    public Health health() {
        if (redisTemplate == null) {
            // Redis 未配置，返回 UNKNOWN 而不是 DOWN
            return Health.unknown()
                .withDetail("redis", "not configured")
                .build();
        }
        
        try {
            redisTemplate.opsForValue().get("health-check");
            return Health.up().build();
        } catch (Exception e) {
            // Redis 故障，但不影响服务运行（只影响缓存）
            return Health.status("DEGRADED")
                .withDetail("redis", "unavailable, using degraded mode")
                .build();
        }
    }
}
```

---

## 2. 服务优雅上下线

### 2.1 优雅下线的重要性

**问题背景**：
```
服务直接停止：
1. 服务立即停止
2. Nacos 15-30 秒后才剔除
3. 期间客户端可能调用到已停止的服务 → 调用失败
```

**优雅下线流程**：
```
1. 从 Nacos 注销（主动）
2. 等待正在处理的请求完成（10 秒）
3. 停止服务
```

---

### 2.2 主动注销实现

**方式1：PreDestroy 钩子**

```java
package com.demo.user.shutdown;

import com.alibaba.cloud.nacos.registry.NacosServiceRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.serviceregistry.Registration;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy;

@Component
public class GracefulShutdown {
    
    @Autowired
    private NacosServiceRegistry nacosServiceRegistry;
    
    @Autowired
    private Registration registration;
    
    @PreDestroy
    public void destroy() {
        System.out.println("========== 开始优雅下线 ==========");
        
        // 1. 从 Nacos 注销
        System.out.println("1. 从 Nacos 注销服务...");
        nacosServiceRegistry.deregister(registration);
        
        // 2. 等待正在处理的请求完成
        System.out.println("2. 等待正在处理的请求完成（10 秒）...");
        try {
            Thread.sleep(10000);  // 等待 10 秒
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        
        System.out.println("========== 优雅下线完成 ==========");
    }
}
```

**测试**：
```bash
# 启动服务
java -jar user-service.jar

# 停止服务（Ctrl+C）
# 查看日志输出：
# ========== 开始优雅下线 ==========
# 1. 从 Nacos 注销服务...
# 2. 等待正在处理的请求完成（10 秒）...
# ========== 优雅下线完成 ==========
```

---

**方式2：Actuator Shutdown 端点**

**配置**：
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

**调用**：
```bash
curl -X POST http://localhost:8001/actuator/shutdown
```

**返回**：
```json
{
  "message": "Shutting down, bye..."
}
```

---

**方式3：自定义 Shutdown 端点**

```java
package com.demo.user.controller;

import com.alibaba.cloud.nacos.registry.NacosServiceRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.serviceregistry.Registration;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ShutdownController {
    
    @Autowired
    private NacosServiceRegistry nacosServiceRegistry;
    
    @Autowired
    private Registration registration;
    
    @PostMapping("/shutdown")
    public String shutdown() {
        // 异步执行下线逻辑
        new Thread(() -> {
            try {
                // 1. 从 Nacos 注销
                System.out.println("从 Nacos 注销服务...");
                nacosServiceRegistry.deregister(registration);
                
                // 2. 等待正在处理的请求完成
                System.out.println("等待 10 秒...");
                Thread.sleep(10000);
                
                // 3. 停止服务
                System.out.println("停止服务...");
                System.exit(0);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
        
        return "服务正在优雅下线...";
    }
}
```

**调用**：
```bash
curl -X POST http://localhost:8001/shutdown
```

---

### 2.3 优雅上线策略

**问题背景**：
```
服务启动后立即接收流量：
1. 数据库连接池未初始化完成
2. 缓存预热未完成
3. 导致前几个请求失败或超时
```

**优雅上线流程**：
```
1. 服务启动
2. 初始化资源（数据库连接池、缓存预热）
3. 健康检查通过
4. 注册到 Nacos
5. 接收流量
```

**实现**：

**方式1：延迟注册**

```java
@SpringBootApplication
@EnableDiscoveryClient
public class UserApplication {
    
    @Autowired
    private NacosServiceRegistry nacosServiceRegistry;
    
    @Autowired
    private Registration registration;
    
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }
    
    @PostConstruct
    public void init() {
        // 服务启动后不立即注册
        // 先进行资源初始化
        
        System.out.println("========== 开始资源初始化 ==========");
        
        // 1. 缓存预热
        System.out.println("1. 缓存预热...");
        warmUpCache();
        
        // 2. 数据库连接池初始化
        System.out.println("2. 数据库连接池初始化...");
        initDatabasePool();
        
        // 3. 健康检查
        System.out.println("3. 健康检查...");
        if (healthCheck()) {
            // 4. 注册到 Nacos
            System.out.println("4. 注册到 Nacos...");
            nacosServiceRegistry.register(registration);
            System.out.println("========== 服务上线完成 ==========");
        } else {
            System.err.println("健康检查失败，服务未注册");
        }
    }
    
    private void warmUpCache() {
        // 缓存预热逻辑
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    
    private void initDatabasePool() {
        // 数据库连接池初始化
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    
    private boolean healthCheck() {
        // 健康检查逻辑
        return true;
    }
}
```

**方式2：配置延迟注册**

```yaml
spring:
  cloud:
    nacos:
      discovery:
        register-enabled: false  # 禁用自动注册

# 手动注册
# 在 @PostConstruct 中调用 nacosServiceRegistry.register(registration)
```

---

## 3. 灰度发布与金丝雀部署

### 3.1 灰度发布策略

**场景**：
- 新版本先发布 10% 流量
- 验证无问题后，逐步提高到 50%、100%
- 如果有问题，立即回滚

**实现方案**：

#### 方案1：基于权重的灰度发布

**新版本配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        weight: 1.0  # 10% 流量
        metadata:
          version: 2.0.0
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
```

**Nacos 控制台调整权重**：
1. 进入服务详情
2. 点击"编辑"
3. 修改权重

**灰度步骤**：
```
阶段1：新版本 10% 流量（权重 1.0），旧版本 90% 流量（权重 9.0）
阶段2：新版本 50% 流量（权重 1.0），旧版本 50% 流量（权重 1.0）
阶段3：新版本 100% 流量（权重 1.0），旧版本下线
```

---

#### 方案2：基于元数据的灰度路由

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

**自定义负载均衡策略**：
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
import java.util.Random;
import java.util.stream.Collectors;

public class GrayLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private final ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    private final Random random = new Random();
    
    public GrayLoadBalancer(ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider) {
        this.serviceInstanceListSupplierProvider = serviceInstanceListSupplierProvider;
    }
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider.getIfAvailable();
        
        return supplier.get(request).next().map(instances -> {
            if (instances.isEmpty()) {
                return new EmptyResponse();
            }
            
            // 获取灰度实例列表
            List<ServiceInstance> grayInstances = instances.stream()
                .filter(i -> "true".equals(i.getMetadata().get("gray")))
                .collect(Collectors.toList());
            
            // 获取非灰度实例列表
            List<ServiceInstance> normalInstances = instances.stream()
                .filter(i -> !"true".equals(i.getMetadata().get("gray")))
                .collect(Collectors.toList());
            
            // 10% 流量到灰度实例
            int randomNum = random.nextInt(100);
            if (randomNum < 10 && !grayInstances.isEmpty()) {
                // 选择灰度实例
                ServiceInstance instance = grayInstances.get(random.nextInt(grayInstances.size()));
                return new DefaultResponse(instance);
            } else {
                // 选择正常实例
                if (normalInstances.isEmpty()) {
                    // 如果没有正常实例，选择灰度实例
                    ServiceInstance instance = grayInstances.get(random.nextInt(grayInstances.size()));
                    return new DefaultResponse(instance);
                } else {
                    ServiceInstance instance = normalInstances.get(random.nextInt(normalInstances.size()));
                    return new DefaultResponse(instance);
                }
            }
        });
    }
}
```

**配置负载均衡策略**：
```java
package com.demo.order.config;

import com.demo.order.loadbalancer.GrayLoadBalancer;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.loadbalancer.core.ReactorLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ServiceInstanceListSupplier;
import org.springframework.cloud.loadbalancer.support.LoadBalancerClientFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class LoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> grayLoadBalancer(Environment environment,
                                                                  LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new GrayLoadBalancer(loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class));
    }
}
```

**启用自定义负载均衡**：
```java
@SpringBootApplication
@EnableDiscoveryClient
@LoadBalancerClient(name = "user-service", configuration = LoadBalancerConfig.class)
public class OrderApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);
    }
}
```

---

### 3.2 金丝雀部署

**定义**：
- 先部署一个实例（金丝雀）
- 观察一段时间，无问题后再部署其他实例

**实现**：
```
步骤1：部署 1 个新版本实例（金丝雀）
步骤2：观察 1-2 小时
步骤3：如果无问题，部署其他实例
步骤4：逐步下线旧版本实例
```

**配置**：
```yaml
# 金丝雀实例
spring:
  cloud:
    nacos:
      discovery:
        metadata:
          version: 2.0.0
          canary: true
```

---

### 3.3 蓝绿部署

**定义**：
- 蓝色环境：当前生产环境
- 绿色环境：新版本环境
- 一键切换

**实现**：
```yaml
# 蓝色环境（当前生产）
spring:
  cloud:
    nacos:
      discovery:
        group: BLUE_GROUP

# 绿色环境（新版本）
spring:
  cloud:
    nacos:
      discovery:
        group: GREEN_GROUP
```

**切换流量**：
```java
// 网关路由配置
// 修改 group 从 BLUE_GROUP 到 GREEN_GROUP
```

---

## 4. 多环境服务隔离

### 4.1 Namespace 环境隔离

**场景**：
- 开发环境（dev）
- 测试环境（test）
- 预发环境（pre）
- 生产环境（prod）

**Nacos 创建命名空间**：
1. 进入"命名空间"
2. 点击"新建命名空间"
3. 创建 dev、test、pre、prod

**配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        namespace: ${NACOS_NAMESPACE:dev}
```

**启动参数**：
```bash
# 开发环境
java -jar app.jar --NACOS_NAMESPACE=dev

# 测试环境
java -jar app.jar --NACOS_NAMESPACE=test

# 生产环境
java -jar app.jar --NACOS_NAMESPACE=prod
```

---

### 4.2 Group 业务隔离

**场景**：
- 订单业务线
- 用户业务线
- 商品业务线

**配置**：
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

---

### 4.3 完整隔离方案

**三层隔离**：
```
Namespace（环境隔离）
    ↓
Group（业务隔离）
    ↓
Service（服务隔离）
```

**配置**：
```yaml
spring:
  cloud:
    nacos:
      discovery:
        namespace: ${NACOS_NAMESPACE:dev}
        group: ${NACOS_GROUP:ORDER_GROUP}
```

**效果**：
```
dev 环境的 ORDER_GROUP 的 user-service
    vs
test 环境的 ORDER_GROUP 的 user-service
    vs
prod 环境的 USER_GROUP 的 user-service

完全隔离，互不干扰
```

---

## 5. 跨地域服务访问

### 5.1 同地域优先策略

**场景**：
- 杭州机房的服务优先调用杭州的实例
- 上海机房的服务优先调用上海的实例
- 跨地域调用仅作为备份

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

### 5.2 自定义地域路由策略

**实现**：
```java
package com.demo.order.loadbalancer;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.loadbalancer.core.ReactorServiceInstanceLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ServiceInstanceListSupplier;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

public class ZonePreferLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    
    private final ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    private final String currentZone;  // 当前服务所在的 zone
    
    public ZonePreferLoadBalancer(ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider,
                                   String currentZone) {
        this.serviceInstanceListSupplierProvider = serviceInstanceListSupplierProvider;
        this.currentZone = currentZone;
    }
    
    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = serviceInstanceListSupplierProvider.getIfAvailable();
        
        return supplier.get(request).next().map(instances -> {
            if (instances.isEmpty()) {
                return new EmptyResponse();
            }
            
            // 优先选择同 zone 的实例
            List<ServiceInstance> sameZoneInstances = instances.stream()
                .filter(i -> currentZone.equals(i.getMetadata().get("zone")))
                .collect(Collectors.toList());
            
            if (!sameZoneInstances.isEmpty()) {
                // 选择同 zone 的实例（随机）
                ServiceInstance instance = sameZoneInstances.get(new Random().nextInt(sameZoneInstances.size()));
                return new DefaultResponse(instance);
            } else {
                // 如果没有同 zone 的实例，选择其他 zone 的实例
                ServiceInstance instance = instances.get(new Random().nextInt(instances.size()));
                return new DefaultResponse(instance);
            }
        });
    }
}
```

---

## 6. 常见问题排查

### 6.1 问题1：服务未注册

**现象**：
- Nacos 控制台看不到服务

**排查步骤**：
```bash
# 1. 检查 Nacos Server 是否启动
curl http://localhost:8848/nacos

# 2. 检查配置
# bootstrap.yml 中是否配置了 namespace、server-addr

# 3. 检查启动类是否添加 @EnableDiscoveryClient

# 4. 查看启动日志
# 是否有 "Nacos registry, xxx register finished"
```

**常见原因**：
- Nacos Server 未启动
- 配置错误（namespace、server-addr）
- 未添加 @EnableDiscoveryClient
- 依赖缺失

---

### 6.2 问题2：服务调用 404

**现象**：
```
java.net.UnknownHostException: user-service
```

**原因**：
- RestTemplate 未添加 @LoadBalanced 注解

**解决方案**：
```java
@Bean
@LoadBalanced  // 必须添加
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

---

### 6.3 问题3：服务频繁上下线

**现象**：
- Nacos 控制台看到服务频繁上下线

**原因**：
- 心跳超时时间太短
- 网络不稳定
- GC 时间过长
- 健康检查失败

**排查步骤**：
```bash
# 1. 查看 GC 日志
java -XX:+PrintGCDetails -jar app.jar

# 2. 查看网络延迟
ping nacos-server-ip

# 3. 查看健康检查日志
curl http://localhost:8001/actuator/health
```

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

### 6.4 问题4：服务调用超时

**现象**：
```
Read timed out
```

**原因**：
- 被调用服务响应慢
- 网络延迟
- 超时配置太短

**排查步骤**：
```bash
# 1. 查看被调用服务的日志
# 2. 查看网络延迟
# 3. 查看超时配置
```

**解决方案**：
```yaml
# Feign 超时配置
feign:
  client:
    config:
      user-service:
        connectTimeout: 5000
        readTimeout: 10000

# Ribbon 超时配置（如果使用 Ribbon）
ribbon:
  ConnectTimeout: 5000
  ReadTimeout: 10000
```

---

### 6.5 问题5：配置不生效

**现象**：
- 修改了配置，但服务仍使用旧配置

**原因**：
- 配置在 application.yml 而非 bootstrap.yml
- 配置格式错误
- 缓存未刷新

**排查步骤**：
```bash
# 1. 检查配置位置（必须在 bootstrap.yml）
# 2. 检查配置格式（YAML 格式）
# 3. 重启服务
```

**解决方案**：
```yaml
# 必须在 bootstrap.yml 中配置
spring:
  cloud:
    nacos:
      discovery:
        namespace: dev  # 在 bootstrap.yml 中
```

---

## 7. 面试准备专项

### 高频面试题

**题目1：如何实现服务的优雅上下线？**

**标准回答**：

**第一层（基础回答）**：
优雅下线：先从 Nacos 注销，等待正在处理的请求完成，再停止服务。优雅上线：先初始化资源（缓存预热、数据库连接池），健康检查通过后再注册到 Nacos。

**第二层（深入原理）**：
- **优雅下线**：
  1. 使用 @PreDestroy 钩子或 Actuator Shutdown 端点
  2. 调用 nacosServiceRegistry.deregister(registration) 注销
  3. Thread.sleep(10000) 等待正在处理的请求完成
  4. System.exit(0) 停止服务
- **优雅上线**：
  1. 配置 register-enabled=false 禁用自动注册
  2. @PostConstruct 中进行资源初始化（缓存预热、数据库连接池）
  3. 健康检查通过后，调用 nacosServiceRegistry.register(registration)

**第三层（扩展延伸）**：
- **为什么需要优雅下线**：避免调用到已停止的服务，降低失败率
- **等待时间如何确定**：根据业务请求处理时间，一般 10-30 秒
- **生产环境最佳实践**：使用 K8s 的 preStop hook 或自定义脚本

**加分项**：
- 提到 K8s 的 readiness 和 liveness 探针
- 提到网关层的流量切换
- 提到实际生产环境的优雅下线经验

---

**题目2：如何实现灰度发布？**

**标准回答**：

**第一层（基础回答）**：
通过配置不同的权重和元数据，新版本设置较小权重，验证无问题后逐步提高权重。

**第二层（深入原理）**：
- **基于权重**：新版本权重 1.0（10%），旧版本权重 9.0（90%），通过 Nacos 控制台调整
- **基于元数据**：新版本 `metadata.gray=true`，自定义负载均衡策略，10% 流量到灰度实例
- **灰度步骤**：
  1. 阶段1：新版本 10% 流量
  2. 阶段2：新版本 50% 流量
  3. 阶段3：新版本 100% 流量

**第三层（扩展延伸）**：
- **基于用户的灰度**：通过自定义负载均衡策略，指定用户路由到新版本
- **金丝雀部署**：先部署一个实例，观察无问题后再部署其他实例
- **蓝绿部署**：通过 group 隔离，一键切换

**加分项**：
- 提到自定义负载均衡策略的实现
- 提到网关层的灰度路由（基于请求头、Cookie）
- 提到实际生产环境的灰度发布经验

---

**题目3：如何排查服务调用失败的问题？**

**标准回答**：

**第一层（基础回答）**：
检查服务是否注册到 Nacos，检查网络连通性，检查超时配置，查看日志。

**第二层（深入原理）**：
- **排查步骤**：
  1. Nacos 控制台查看服务是否注册
  2. curl 直接调用服务，验证服务本身是否正常
  3. 检查 RestTemplate 是否添加 @LoadBalanced
  4. 检查超时配置（Feign、Ribbon）
  5. 查看日志（客户端日志、服务端日志）
- **常见原因**：
  - 服务未注册到 Nacos
  - RestTemplate 未添加 @LoadBalanced
  - 超时配置太短
  - 网络问题

**第三层（扩展延伸）**：
- **链路追踪**：使用 Sleuth + Zipkin 追踪完整调用链路
- **监控告警**：使用 Prometheus + Grafana 监控调用失败率
- **降级处理**：使用 Feign fallback 提供降级响应

**加分项**：
- 提到实际排查问题的经验和工具
- 提到如何定位是网络问题还是代码问题
- 提到如何避免雪崩效应

---

## 8. 学习自检清单

- [ ] 能够配置 Spring Boot Actuator 健康检查
- [ ] 能够实现自定义健康检查指标
- [ ] 掌握服务优雅上下线的实现
- [ ] 掌握灰度发布的实现方案
- [ ] 理解多环境服务隔离的方案
- [ ] 掌握跨地域服务访问的策略
- [ ] 能够排查服务未注册、调用失败等问题
- [ ] 能够流畅回答服务发现相关面试题

**学习建议**：
- **预计学习时长**：3-4 小时
- **重点难点**：健康检查、优雅上下线、灰度发布
- **前置知识**：第4-6章服务注册与发现
- **实践建议**：搭建多实例环境，验证优雅下线和灰度发布

---

## 9. 参考资料

- [Spring Boot Actuator 文档](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Nacos Discovery 文档](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-discovery)
- [灰度发布最佳实践](https://www.alibabacloud.com/help/zh/mse/user-guide/canary-release)
- [Kubernetes 优雅关闭](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination)

---

**本章小结**：
- 健康检查需要检查关键依赖（数据库、Redis），不要检查太多
- 优雅下线流程：先注销 → 等待请求完成 → 停止服务
- 灰度发布可以基于权重或元数据，逐步提高新版本流量
- 多环境隔离使用 namespace，业务隔离使用 group
- 跨地域服务访问使用 cluster-name 同集群优先
- 排查问题需要检查服务注册、网络连通性、超时配置、日志

**下一章预告**：第8章将介绍 Nacos Config 快速入门，包括配置引入、动态刷新、配置文件命名规范、配置加载验证、配置热更新基础使用。

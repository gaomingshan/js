# 灰度发布与流量控制

## 概述

灰度发布能够安全地发布新版本消费者，降低发布风险。本章介绍基于消息队列的灰度发布策略。

---

## 1. 灰度发布策略

### 1.1 按比例灰度

```java
@Component
public class GrayReleaseRouter {
    
    @Value("${gray.ratio:0}")
    private int grayRatio;  // 灰度比例（0-100）
    
    public boolean isGray() {
        return ThreadLocalRandom.current().nextInt(100) < grayRatio;
    }
}

@Service
public class MessageService {
    
    @Autowired
    private GrayReleaseRouter router;
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    public void sendMessage(String message) {
        String topic = router.isGray() ? "orders-gray" : "orders";
        kafkaTemplate.send(topic, message);
    }
}
```

### 1.2 按特征灰度

```java
public boolean isGrayUser(String userId) {
    // 灰度用户名单
    Set<String> grayUsers = Set.of("user1", "user2");
    return grayUsers.contains(userId);
}

public void sendMessage(String userId, String message) {
    String topic = isGrayUser(userId) ? "orders-gray" : "orders";
    kafkaTemplate.send(topic, message);
}
```

---

## 2. 基于消息头路由

### 2.1 消息头标记

```java
// 生产者
public void sendMessage(Order order) {
    ProducerRecord<String, Order> record = new ProducerRecord<>("orders", order);
    
    // 添加灰度标记
    if (isGrayUser(order.getUserId())) {
        record.headers().add("gray", "true".getBytes());
    }
    
    kafkaTemplate.send(record);
}
```

### 2.2 消费者过滤

```java
@KafkaListener(topics = "orders")
public void listen(ConsumerRecord<String, Order> record) {
    // 检查灰度标记
    Header grayHeader = record.headers().lastHeader("gray");
    boolean isGray = grayHeader != null && "true".equals(new String(grayHeader.value()));
    
    if (isGray && !isGrayConsumer()) {
        // 非灰度消费者跳过灰度消息
        return;
    }
    
    processOrder(record.value());
}
```

---

## 3. 独立Topic方案

### 3.1 Topic隔离

```
生产环境：
- Topic: orders（旧版本消费者）

灰度环境：
- Topic: orders-gray（新版本消费者）
```

### 3.2 双写策略

```java
@Service
public class OrderService {
    
    @Value("${gray.enabled:false}")
    private boolean grayEnabled;
    
    public void createOrder(Order order) {
        // 写主Topic
        kafkaTemplate.send("orders", order);
        
        // 灰度期间双写
        if (grayEnabled) {
            kafkaTemplate.send("orders-gray", order);
        }
    }
}
```

---

## 4. 消费者组隔离

### 4.1 灰度消费者组

```java
// 生产消费者
@KafkaListener(
    topics = "orders",
    groupId = "order-consumer-prod"
)
public void listenProd(Order order) {
    // 旧版本处理逻辑
    processOrderV1(order);
}

// 灰度消费者
@KafkaListener(
    topics = "orders",
    groupId = "order-consumer-gray"
)
public void listenGray(Order order) {
    // 新版本处理逻辑
    processOrderV2(order);
}
```

---

## 5. 流量控制

### 5.1 限流

```java
@Component
public class RateLimiter {
    
    private final com.google.common.util.concurrent.RateLimiter rateLimiter;
    
    public RateLimiter(@Value("${rate.limit:100}") int permitsPerSecond) {
        this.rateLimiter = com.google.common.util.concurrent.RateLimiter.create(permitsPerSecond);
    }
    
    public boolean tryAcquire() {
        return rateLimiter.tryAcquire();
    }
}

@KafkaListener(topics = "orders")
public void listen(Order order) {
    if (!rateLimiter.tryAcquire()) {
        log.warn("Rate limit exceeded, skip message");
        return;
    }
    
    processOrder(order);
}
```

### 5.2 动态流量调整

```java
@RestController
public class GrayReleaseController {
    
    @Value("${gray.ratio}")
    private int grayRatio;
    
    @PostMapping("/gray/ratio")
    public String updateRatio(@RequestParam int ratio) {
        if (ratio < 0 || ratio > 100) {
            return "Invalid ratio";
        }
        
        this.grayRatio = ratio;
        return "Gray ratio updated to: " + ratio;
    }
}
```

---

## 6. A/B 测试方案

```java
@Service
public class ABTestService {
    
    public String getVersion(String userId) {
        int hash = userId.hashCode();
        return hash % 2 == 0 ? "A" : "B";
    }
}

@Service
public class OrderService {
    
    @Autowired
    private ABTestService abTestService;
    
    public void createOrder(String userId, Order order) {
        String version = abTestService.getVersion(userId);
        String topic = "orders-" + version;
        
        kafkaTemplate.send(topic, order);
    }
}
```

---

## 7. 金丝雀发布

### 7.1 流程

```
1. 部署金丝雀实例（1个）
   ↓
2. 路由5%流量到金丝雀
   ↓
3. 监控指标（错误率、延迟）
   ↓
4. 指标正常，扩大流量（10% → 50% → 100%）
   ↓
5. 全量发布
```

### 7.2 实现

```java
@Configuration
public class CanaryConfig {
    
    @Value("${canary.enabled:false}")
    private boolean canaryEnabled;
    
    @Bean
    public KafkaListenerContainerFactory<?> canaryKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        
        if (canaryEnabled) {
            // 金丝雀实例配置
            factory.setConcurrency(1);  // 单实例
        }
        
        return factory;
    }
}
```

---

## 8. 发布回滚策略

### 8.1 快速回滚

```
1. 发现问题
   ↓
2. 停止流量到灰度Topic
   ↓
3. 所有流量回到生产Topic
   ↓
4. 下线灰度消费者
   ↓
5. 分析问题，修复后重新灰度
```

### 8.2 自动回滚

```java
@Component
public class AutoRollbackMonitor {
    
    @Scheduled(fixedDelay = 60000)
    public void monitorGrayRelease() {
        double errorRate = metricsService.getGrayErrorRate();
        
        if (errorRate > 0.05) {  // 错误率超过5%
            log.error("Gray release error rate too high: {}, rolling back", errorRate);
            rollback();
        }
    }
    
    private void rollback() {
        // 将灰度流量比例设为0
        configService.setGrayRatio(0);
        
        // 发送告警
        alertService.sendAlert("Gray release rolled back");
    }
}
```

---

## 关键要点

1. **灰度策略**：按比例、按特征、独立Topic
2. **流量控制**：限流、动态调整
3. **监控告警**：实时监控灰度指标
4. **快速回滚**：发现问题立即回滚
5. **渐进发布**：5% → 10% → 50% → 100%

---

## 参考资料

1. [Canary Deployment](https://martinfowler.com/bliki/CanaryRelease.html)
2. [Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)

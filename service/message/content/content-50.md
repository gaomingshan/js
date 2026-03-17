# 消息路由与多租户

多租户场景需要消息隔离和路由。本章介绍多租户消息队列设计。

## 1. Topic 隔离

```java
// 按租户划分 Topic
public String getTopic(String baseTopic, String tenantId) {
    return baseTopic + "-" + tenantId;
}

// 发送
String topic = getTopic("orders", tenantId);
kafkaTemplate.send(topic, message);

// 消费
@KafkaListener(topics = "#{topicProvider.getTopics()}")
public void consume(String message) {
    // 处理
}
```

## 2. 消息头路由

```java
// RabbitMQ Headers Exchange
Map<String, Object> headers = new HashMap<>();
headers.put("tenant-id", tenantId);
headers.put("region", "beijing");

MessageProperties props = new MessageProperties();
props.getHeaders().putAll(headers);

rabbitTemplate.send("headers-exchange", "", 
    new Message(message.getBytes(), props));

// 绑定队列
Map<String, Object> bindArgs = new HashMap<>();
bindArgs.put("x-match", "all");
bindArgs.put("tenant-id", "tenant-001");
channel.queueBind("queue-tenant-001", "headers-exchange", "", bindArgs);
```

## 3. 动态订阅

```java
@Service
public class DynamicSubscriptionService {
    
    @Autowired
    private KafkaListenerEndpointRegistry registry;
    
    public void addTenant(String tenantId) {
        String topic = "orders-" + tenantId;
        
        KafkaListenerEndpoint endpoint = createEndpoint(topic, tenantId);
        registry.registerListenerContainer(endpoint);
    }
    
    private KafkaListenerEndpoint createEndpoint(String topic, String tenantId) {
        MethodKafkaListenerEndpoint<String, String> endpoint = 
            new MethodKafkaListenerEndpoint<>();
        endpoint.setId("consumer-" + tenantId);
        endpoint.setTopics(topic);
        endpoint.setGroupId("group-" + tenantId);
        endpoint.setBean(messageHandler);
        endpoint.setMethod(getMethod());
        return endpoint;
    }
}
```

## 4. 资源配额

```java
// 限制每个租户的消息速率
@Component
public class TenantRateLimiter {
    
    private Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();
    
    public boolean tryAcquire(String tenantId) {
        RateLimiter limiter = limiters.computeIfAbsent(tenantId, 
            k -> RateLimiter.create(1000));  // 每秒1000条
        return limiter.tryAcquire();
    }
}

// 使用
if (!rateLimiter.tryAcquire(tenantId)) {
    throw new RateLimitException("超过速率限制");
}
kafkaTemplate.send(topic, message);
```

## 关键要点
1. **Topic隔离**：租户独立Topic
2. **消息头路由**：Headers Exchange
3. **动态订阅**：运行时添加租户
4. **资源配额**：限制每租户速率
5. **成本考虑**：Topic数量限制

## 参考资料
1. [Multi-tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multi-tenancy)

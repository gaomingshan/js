# 第 29 章：Stream 高级特性与最佳实践

> **学习目标**：掌握 Stream 高级特性、理解消息驱动架构设计、能够优化消息性能  
> **预计时长**：4-5 小时  
> **难度级别**：⭐⭐⭐⭐⭐ 高级

---

## 1. 动态绑定

### 1.1 动态 Binding 概念

**动态绑定**：在运行时动态创建和销毁 Binding。

**使用场景**：
- 多租户系统，每个租户独立 Topic
- 动态路由消息到不同目标
- 临时消息通道

### 1.2 StreamBridge 动态发送

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class DynamicMessageService {
    
    private final StreamBridge streamBridge;
    
    /**
     * 根据租户动态发送消息
     */
    public void sendMessage(String tenantId, Object message) {
        // 动态 Binding 名称
        String bindingName = "tenant-" + tenantId + "-out-0";
        
        // 发送消息（自动创建 Binding）
        streamBridge.send(bindingName, message);
        
        log.info("发送消息到租户：tenantId={}, binding={}", tenantId, bindingName);
    }
}
```

**配置**：

```yaml
spring:
  cloud:
    stream:
      # 动态目标配置
      dynamic-destinations:
        - tenant-*-out-0  # 支持通配符
      
      # 默认 Binder
      default-binder: kafka
```

### 1.3 动态消费者

```java
@Component
@Slf4j
public class DynamicConsumerManager {
    
    @Autowired
    private BinderFactory binderFactory;
    
    @Autowired
    private BindingService bindingService;
    
    private final Map<String, Binding<MessageChannel>> bindings = new ConcurrentHashMap<>();
    
    /**
     * 动态创建消费者
     */
    public void createConsumer(String tenantId) {
        String bindingName = "tenant-" + tenantId + "-in-0";
        
        if (bindings.containsKey(bindingName)) {
            log.warn("Binding 已存在：{}", bindingName);
            return;
        }
        
        // 创建 Binding 属性
        BindingProperties bindingProperties = new BindingProperties();
        bindingProperties.setDestination("tenant-" + tenantId + "-topic");
        bindingProperties.setGroup("tenant-service");
        
        // 创建消息通道
        DirectChannel channel = new DirectChannel();
        channel.subscribe(message -> {
            log.info("租户 {} 接收到消息：{}", tenantId, message.getPayload());
            // 处理消息
        });
        
        // 创建 Binding
        Binding<MessageChannel> binding = bindingService.bindConsumer(
            channel,
            bindingName
        );
        
        bindings.put(bindingName, binding);
        
        log.info("动态消费者创建成功：tenantId={}", tenantId);
    }
    
    /**
     * 销毁消费者
     */
    public void destroyConsumer(String tenantId) {
        String bindingName = "tenant-" + tenantId + "-in-0";
        
        Binding<MessageChannel> binding = bindings.remove(bindingName);
        if (binding != null) {
            binding.unbind();
            log.info("动态消费者销毁成功：tenantId={}", tenantId);
        }
    }
}
```

---

## 2. 条件绑定

### 2.1 条件消费者

**根据条件启用/禁用消费者**：

```java
@Configuration
public class ConditionalConsumerConfig {
    
    /**
     * 仅在开发环境启用
     */
    @Bean
    @ConditionalOnProperty(name = "app.consumer.dev.enabled", havingValue = "true")
    public Consumer<Order> devOrderConsumer() {
        return order -> {
            log.info("开发环境消费者：{}", order);
        };
    }
    
    /**
     * 仅在生产环境启用
     */
    @Bean
    @ConditionalOnProperty(name = "app.consumer.prod.enabled", havingValue = "true")
    public Consumer<Order> prodOrderConsumer() {
        return order -> {
            log.info("生产环境消费者：{}", order);
            // 完整的业务逻辑
        };
    }
}
```

**配置**：

```yaml
# 开发环境
spring:
  profiles:
    active: dev

app:
  consumer:
    dev:
      enabled: true
    prod:
      enabled: false

---
# 生产环境
spring:
  profiles:
    active: prod

app:
  consumer:
    dev:
      enabled: false
    prod:
      enabled: true
```

### 2.2 条件路由

```java
@Service
@RequiredArgsConstructor
public class ConditionalRoutingService {
    
    private final StreamBridge streamBridge;
    
    public void sendOrder(Order order) {
        // 根据订单金额路由到不同 Topic
        if (order.getAmount().compareTo(new BigDecimal("1000")) > 0) {
            // 大额订单
            streamBridge.send("high-value-order-out-0", order);
        } else {
            // 普通订单
            streamBridge.send("normal-order-out-0", order);
        }
    }
}
```

---

## 3. 多 Binder 配置

### 3.1 配置多个 Binder

**场景**：同时使用 Kafka 和 RabbitMQ。

**添加依赖**：

```xml
<dependencies>
    <!-- Kafka Binder -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-stream-binder-kafka</artifactId>
    </dependency>
    
    <!-- RabbitMQ Binder -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-stream-binder-rabbit</artifactId>
    </dependency>
</dependencies>
```

**配置**：

```yaml
spring:
  cloud:
    stream:
      # 定义多个 Binder
      binders:
        kafka-binder:
          type: kafka
          environment:
            spring:
              kafka:
                bootstrap-servers: localhost:9092
        
        rabbit-binder:
          type: rabbit
          environment:
            spring:
              rabbitmq:
                host: localhost
                port: 5672
                username: guest
                password: guest
      
      # Binding 指定 Binder
      bindings:
        orderConsumer-in-0:
          destination: order-topic
          group: order-service
          binder: kafka-binder  # 使用 Kafka
        
        notificationConsumer-in-0:
          destination: notification-queue
          group: notification-service
          binder: rabbit-binder  # 使用 RabbitMQ
```

### 3.2 多 Binder 使用示例

```java
@Configuration
@Slf4j
public class MultiBinderConsumers {
    
    /**
     * Kafka 消费者
     */
    @Bean
    public Consumer<Order> orderConsumer() {
        return order -> {
            log.info("Kafka 消费订单：{}", order);
        };
    }
    
    /**
     * RabbitMQ 消费者
     */
    @Bean
    public Consumer<Notification> notificationConsumer() {
        return notification -> {
            log.info("RabbitMQ 消费通知：{}", notification);
        };
    }
}
```

---

## 4. 消息转换器

### 4.1 默认消息转换器

**Spring Cloud Stream 默认使用 JSON 转换器**。

**配置**：

```yaml
spring:
  cloud:
    stream:
      bindings:
        orderConsumer-in-0:
          content-type: application/json  # JSON 转换
```

### 4.2 自定义消息转换器

```java
@Configuration
public class MessageConverterConfig {
    
    /**
     * 自定义消息转换器
     */
    @Bean
    public MessageConverter customMessageConverter() {
        return new AbstractMessageConverter(
            MimeType.valueOf("application/x-custom")) {
            
            @Override
            protected boolean supports(Class<?> clazz) {
                return Order.class.equals(clazz);
            }
            
            @Override
            protected Object convertFromInternal(
                    Message<?> message, 
                    Class<?> targetClass, 
                    Object conversionHint) {
                
                byte[] payload = (byte[]) message.getPayload();
                
                // 自定义反序列化
                return deserialize(payload, targetClass);
            }
            
            @Override
            protected Object convertToInternal(
                    Object payload, 
                    MessageHeaders headers, 
                    Object conversionHint) {
                
                // 自定义序列化
                return serialize(payload);
            }
        };
    }
    
    private Object deserialize(byte[] data, Class<?> clazz) {
        // 自定义反序列化逻辑
        return null;
    }
    
    private byte[] serialize(Object object) {
        // 自定义序列化逻辑
        return null;
    }
}
```

### 4.3 Avro 序列化

**添加依赖**：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-schema</artifactId>
</dependency>
```

**配置**：

```yaml
spring:
  cloud:
    stream:
      bindings:
        orderConsumer-in-0:
          content-type: application/*+avro
      
      schema-registry:
        client:
          endpoint: http://localhost:8081
```

---

## 5. 消息拦截器

### 5.1 全局拦截器

```java
@Component
@Slf4j
public class GlobalMessageInterceptor implements ChannelInterceptor {
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        log.info("发送消息前：channel={}, message={}", 
            channel.toString(), message.getPayload());
        
        // 添加消息头
        return MessageBuilder
            .fromMessage(message)
            .setHeader("interceptedAt", System.currentTimeMillis())
            .setHeader("interceptor", "global")
            .build();
    }
    
    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        log.info("发送消息后：sent={}", sent);
    }
    
    @Override
    public Message<?> preReceive(MessageChannel channel) {
        log.info("接收消息前：channel={}", channel);
        return null;
    }
    
    @Override
    public Message<?> postReceive(Message<?> message, MessageChannel channel) {
        if (message != null) {
            log.info("接收消息后：message={}", message.getPayload());
        }
        return message;
    }
}
```

**注册拦截器**：

```java
@Configuration
public class InterceptorConfig {
    
    @Autowired
    private GlobalMessageInterceptor interceptor;
    
    @Bean
    public GlobalChannelInterceptor globalChannelInterceptor() {
        return new GlobalChannelInterceptor(interceptor);
    }
}
```

### 5.2 特定 Binding 拦截器

```java
@Configuration
public class BindingInterceptorConfig {
    
    @Bean
    @ServiceActivator(inputChannel = "orderConsumer-in-0")
    public Message<?> orderInterceptor(Message<?> message) {
        log.info("订单拦截器：{}", message.getPayload());
        
        // 验证消息
        Order order = (Order) message.getPayload();
        if (order.getAmount() == null || order.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("订单金额无效");
        }
        
        return message;
    }
}
```

---

## 6. 性能优化配置

### 6.1 Kafka 性能优化

```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          # 生产者优化
          producer-properties:
            # 批量大小
            batch.size: 32768
            
            # 延迟发送
            linger.ms: 10
            
            # 压缩
            compression.type: lz4
            
            # 缓冲区
            buffer.memory: 67108864
            
            # 最大请求大小
            max.request.size: 1048576
          
          # 消费者优化
          consumer-properties:
            # 每次拉取的最大字节数
            max.partition.fetch.bytes: 1048576
            
            # 每次拉取的最大记录数
            max.poll.records: 500
            
            # 拉取间隔
            max.poll.interval.ms: 300000
            
            # 会话超时
            session.timeout.ms: 30000
      
      bindings:
        orderConsumer-in-0:
          consumer:
            # 并发消费
            concurrency: 10
```

### 6.2 批量消费

```java
@Configuration
public class BatchConsumerConfig {
    
    @Bean
    public Consumer<List<Order>> batchOrderConsumer() {
        return orders -> {
            log.info("批量消费订单：size={}", orders.size());
            
            // 批量处理
            processBatch(orders);
        };
    }
    
    private void processBatch(List<Order> orders) {
        // 批量插入数据库
        orderRepository.saveAll(orders);
    }
}
```

**配置**：

```yaml
spring:
  cloud:
    stream:
      bindings:
        batchOrderConsumer-in-0:
          destination: order-topic
          group: order-service
          consumer:
            # 启用批量模式
            batch-mode: true
      
      kafka:
        bindings:
          batchOrderConsumer-in-0:
            consumer:
              # 批量大小
              max-poll-records: 100
```

### 6.3 异步处理

```java
@Configuration
public class AsyncConsumerConfig {
    
    @Bean
    public Consumer<Order> asyncOrderConsumer(
            @Qualifier("orderExecutor") Executor executor) {
        
        return order -> {
            // 异步处理
            CompletableFuture.runAsync(() -> {
                log.info("异步处理订单：{}", order);
                processOrder(order);
            }, executor);
        };
    }
    
    @Bean("orderExecutor")
    public Executor orderExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("order-");
        executor.initialize();
        return executor;
    }
}
```

---

## 7. Kafka Streams 集成

### 7.1 Kafka Streams 简介

**Kafka Streams**：轻量级的流处理库。

**使用场景**：
- 实时数据转换
- 数据聚合
- 窗口计算
- 流表Join

### 7.2 添加依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-kafka-streams</artifactId>
</dependency>
```

### 7.3 基础示例

```java
@Configuration
public class KafkaStreamsConfig {
    
    /**
     * 订单金额统计
     */
    @Bean
    public Function<KStream<String, Order>, KStream<String, OrderStats>> orderStats() {
        return input -> input
            // 按用户分组
            .groupBy(
                (key, order) -> order.getUserId().toString(),
                Grouped.with(Serdes.String(), new OrderSerde())
            )
            // 聚合统计
            .aggregate(
                OrderStats::new,
                (userId, order, stats) -> {
                    stats.setUserId(Long.parseLong(userId));
                    stats.setTotalAmount(
                        stats.getTotalAmount().add(order.getAmount())
                    );
                    stats.setOrderCount(stats.getOrderCount() + 1);
                    return stats;
                },
                Materialized.with(Serdes.String(), new OrderStatsSerde())
            )
            // 转换为流
            .toStream();
    }
}
```

**配置**：

```yaml
spring:
  cloud:
    stream:
      function:
        definition: orderStats
      
      kafka:
        streams:
          binder:
            application-id: order-stats-app
            brokers: localhost:9092
            configuration:
              default.key.serde: org.apache.kafka.common.serialization.Serdes$StringSerde
              default.value.serde: com.example.serde.OrderSerde
      
      bindings:
        orderStats-in-0:
          destination: order-topic
        orderStats-out-0:
          destination: order-stats-topic
```

---

## 8. 常见问题排查

### 8.1 消息丢失

**排查步骤**：

```
1. 检查生产者配置
   - acks 是否为 all
   - retries 是否配置

2. 检查消费者配置
   - 是否启用手动确认
   - 是否正确确认

3. 检查 Kafka 配置
   - min.insync.replicas
   - replication.factor

4. 查看日志
   - 生产者日志
   - 消费者日志
   - Kafka 日志
```

### 8.2 消息积压

**排查步骤**：

```
1. 检查消费速度
   - 增加消费者实例
   - 增加并发数

2. 检查消费者性能
   - 是否有慢SQL
   - 是否有网络调用

3. 优化消费逻辑
   - 批量处理
   - 异步处理
   - 减少I/O操作
```

**监控命令**：

```bash
# 查看消费者组
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# 查看消费者组详情
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group order-service --describe

# 输出：
# TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# order-topic     0          1000            1500            500  ← 积压500条
```

### 8.3 消费重复

**排查步骤**：

```
1. 检查幂等性实现
   - 是否有唯一键
   - 是否有消费记录表

2. 检查确认机制
   - 是否在处理完后确认
   - 是否有确认失败

3. 检查重试配置
   - 重试次数是否过多
   - 是否有死信队列
```

---

## 9. 生产最佳实践

### 9.1 消息设计

**1. 消息结构**：

```java
@Data
public class OrderMessage {
    // 消息元数据
    private String messageId;      // 消息唯一ID
    private String messageType;    // 消息类型
    private Long timestamp;        // 时间戳
    private String source;         // 消息来源
    
    // 业务数据
    private Order payload;
    
    // 追踪信息
    private String traceId;
    private String spanId;
}
```

**2. 版本控制**：

```java
@Data
public class VersionedMessage {
    private String version = "1.0";  // 消息版本
    private Object data;
}
```

### 9.2 监控指标

```java
@Component
@Slf4j
public class MessageMetrics {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    public void recordSent(String topic) {
        meterRegistry.counter("message.sent", "topic", topic).increment();
    }
    
    public void recordConsumed(String topic) {
        meterRegistry.counter("message.consumed", "topic", topic).increment();
    }
    
    public void recordFailed(String topic, String error) {
        meterRegistry.counter("message.failed", 
            "topic", topic, 
            "error", error).increment();
    }
}
```

### 9.3 日志规范

```java
@Slf4j
public class OrderConsumer {
    
    @Bean
    public Consumer<Message<Order>> orderConsumer() {
        return message -> {
            Order order = message.getPayload();
            
            // 结构化日志
            log.info("消费订单消息 | orderId={} | userId={} | amount={} | messageId={}", 
                order.getId(),
                order.getUserId(),
                order.getAmount(),
                message.getHeaders().get("messageId")
            );
            
            try {
                processOrder(order);
                
                log.info("订单处理成功 | orderId={}", order.getId());
                
            } catch (Exception e) {
                log.error("订单处理失败 | orderId={} | error={}", 
                    order.getId(), e.getMessage(), e);
                throw e;
            }
        };
    }
}
```

---

## 10. 面试要点

**Q1：如何实现动态绑定？**

使用 StreamBridge 动态发送，或使用 BindingService API 动态创建消费者

**Q2：如何配置多个 Binder？**

在配置文件中定义多个 Binder，Binding 指定使用哪个 Binder

**Q3：如何优化消息性能？**

1. 批量消费
2. 并发消费
3. 异步处理
4. 合理配置 Kafka 参数

**Q4：Kafka Streams 的使用场景？**

实时数据转换、聚合、窗口计算、流表Join

**Q5：消息积压如何处理？**

1. 增加消费者实例
2. 增加并发数
3. 优化消费逻辑
4. 批量处理

---

## 11. 参考资料

**官方文档**：
- [Spring Cloud Stream Advanced](https://docs.spring.io/spring-cloud-stream/docs/current/reference/html/spring-cloud-stream.html#_advanced_programming_model)
- [Kafka Streams](https://kafka.apache.org/documentation/streams/)

---

**Stream 部分完成！下一章预告**：第 30 章将开始学习 Seata 分布式事务，包括 Seata Server 部署、AT 模式快速入门、@GlobalTransactional 注解、事务分组配置等内容。

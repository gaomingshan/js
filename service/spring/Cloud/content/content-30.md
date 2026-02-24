# 第30章：Stream 生产最佳实践

> **本章目标**：掌握 Stream 生产环境配置、性能优化、故障处理最佳实践

---

## 1. 消息可靠性保障

### 1.1 生产者确认

**RabbitMQ Publisher Confirms**：
```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          output-out-0:
            producer:
              confirm-type: correlated  # 开启发布确认
              return-callback: true  # 开启消息退回
```

**确认回调**：
```java
@Configuration
public class RabbitMQConfig {
    
    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory connectionFactory = new CachingConnectionFactory();
        connectionFactory.setPublisherConfirmType(ConfirmType.CORRELATED);
        connectionFactory.setPublisherReturns(true);
        return connectionFactory;
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        
        // 发布确认回调
        rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
            if (ack) {
                log.info("消息发送成功: {}", correlationData);
            } else {
                log.error("消息发送失败: {}, 原因: {}", correlationData, cause);
                // 重试或记录失败消息
            }
        });
        
        // 消息退回回调
        rabbitTemplate.setReturnsCallback(returned -> {
            log.error("消息被退回: {}", returned.getMessage());
            // 处理退回消息
        });
        
        return rabbitTemplate;
    }
}
```

**发送消息带确认**：
```java
@Service
public class ReliableMessageProducer {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void sendWithConfirm(String message) {
        CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());
        
        rabbitTemplate.convertAndSend(
            "exchange-name",
            "routing-key",
            message,
            correlationData
        );
    }
}
```

---

### 1.2 本地消息表

**场景**：保证消息一定发送成功，即使 MQ 暂时不可用。

**数据库表**：
```sql
CREATE TABLE `local_message` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `message_id` VARCHAR(64) UNIQUE NOT NULL,
  `destination` VARCHAR(128) NOT NULL,
  `payload` TEXT NOT NULL,
  `status` TINYINT DEFAULT 0,  -- 0:待发送 1:已发送 2:发送失败
  `retry_count` INT DEFAULT 0,
  `create_time` DATETIME NOT NULL,
  `update_time` DATETIME NOT NULL,
  INDEX idx_status (status)
) ENGINE=InnoDB;
```

**保存消息到本地表**：
```java
@Service
public class LocalMessageService {
    
    @Autowired
    private LocalMessageMapper messageMapper;
    
    @Autowired
    private StreamBridge streamBridge;
    
    @Transactional
    public void createOrderWithMessage(OrderDTO order) {
        // 1. 保存订单
        orderMapper.insert(order);
        
        // 2. 保存消息到本地表
        LocalMessage message = new LocalMessage();
        message.setMessageId(UUID.randomUUID().toString());
        message.setDestination("order-created-out-0");
        message.setPayload(JSON.toJSONString(order));
        message.setStatus(0);
        messageMapper.insert(message);
        
        // 3. 事务提交后发送消息
    }
    
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendMessageAfterCommit(LocalMessage message) {
        try {
            // 发送消息
            streamBridge.send(message.getDestination(), message.getPayload());
            
            // 更新状态为已发送
            messageMapper.updateStatus(message.getId(), 1);
        } catch (Exception e) {
            log.error("消息发送失败", e);
            messageMapper.updateStatus(message.getId(), 2);
        }
    }
}
```

**定时补偿任务**：
```java
@Component
public class MessageCompensationJob {
    
    @Autowired
    private LocalMessageMapper messageMapper;
    
    @Autowired
    private StreamBridge streamBridge;
    
    @Scheduled(fixedDelay = 60000)  // 每分钟执行一次
    public void compensate() {
        // 查询待发送或发送失败的消息（5分钟前）
        List<LocalMessage> messages = messageMapper.selectPendingMessages();
        
        for (LocalMessage message : messages) {
            if (message.getRetryCount() >= 3) {
                // 超过重试次数，记录告警
                log.error("消息重试次数超限: {}", message.getMessageId());
                continue;
            }
            
            try {
                // 重新发送
                streamBridge.send(message.getDestination(), message.getPayload());
                messageMapper.updateStatus(message.getId(), 1);
            } catch (Exception e) {
                // 增加重试次数
                messageMapper.incrementRetryCount(message.getId());
            }
        }
    }
}
```

---

## 2. 性能优化

### 2.1 批量发送

**配置批量发送**：
```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          output-out-0:
            producer:
              batch-size: 100  # 批量大小
              batch-buffer-limit: 10000  # 缓冲区大小
              batch-timeout: 1000  # 批量超时（毫秒）
```

**代码批量发送**：
```java
@Service
public class BatchProducer {
    
    @Autowired
    private StreamBridge streamBridge;
    
    public void sendBatch(List<OrderDTO> orders) {
        orders.forEach(order -> {
            streamBridge.send("order-out-0", order);
        });
    }
}
```

---

### 2.2 异步发送

**使用 @Async**：
```java
@Service
public class AsyncProducer {
    
    @Autowired
    private StreamBridge streamBridge;
    
    @Async
    public CompletableFuture<Void> sendAsync(String message) {
        streamBridge.send("message-out-0", message);
        return CompletableFuture.completedFuture(null);
    }
}

@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("async-message-");
        executor.initialize();
        return executor;
    }
}
```

---

### 2.3 连接池配置

**RabbitMQ 连接池**：
```yaml
spring:
  rabbitmq:
    cache:
      connection:
        mode: channel  # 连接模式
        size: 25  # 缓存连接数
      channel:
        size: 50  # 缓存通道数
        checkout-timeout: 5000  # 获取通道超时
```

---

### 2.4 消息压缩

**开启压缩**：
```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          output-out-0:
            producer:
              compress: true  # 开启压缩
```

---

## 3. 监控与告警

### 3.1 消息积压监控

**Prometheus 指标**：
```yaml
management:
  metrics:
    export:
      prometheus:
        enabled: true
```

**关键指标**：
```
# 队列深度
rabbitmq_queue_messages{queue="user-topic.user-service-group"}

# 消费速率
rate(rabbitmq_queue_messages_ready_delivered_total[5m])

# 未确认消息数
rabbitmq_queue_messages_unacked{queue="user-topic.user-service-group"}
```

**告警规则**：
```yaml
groups:
  - name: rabbitmq-alerts
    rules:
      # 队列积压告警
      - alert: RabbitMQQueueBacklog
        expr: rabbitmq_queue_messages > 10000
        for: 5m
        annotations:
          summary: "队列积压超过10000条消息"
      
      # 消费延迟告警
      - alert: RabbitMQConsumerLag
        expr: rate(rabbitmq_queue_messages_ready_delivered_total[5m]) < 100
        for: 5m
        annotations:
          summary: "消费速率过低"
```

---

### 3.2 自定义监控指标

**消息发送统计**：
```java
@Service
public class MonitoredProducer {
    
    private final Counter messageSentCounter;
    private final Counter messageFailedCounter;
    private final Timer messageSendTimer;
    
    public MonitoredProducer(MeterRegistry registry) {
        this.messageSentCounter = Counter.builder("message.sent")
            .description("消息发送成功数")
            .tag("destination", "order-out-0")
            .register(registry);
        
        this.messageFailedCounter = Counter.builder("message.failed")
            .description("消息发送失败数")
            .register(registry);
        
        this.messageSendTimer = Timer.builder("message.send.time")
            .description("消息发送耗时")
            .register(registry);
    }
    
    @Autowired
    private StreamBridge streamBridge;
    
    public void send(String message) {
        messageSendTimer.record(() -> {
            try {
                streamBridge.send("order-out-0", message);
                messageSentCounter.increment();
            } catch (Exception e) {
                messageFailedCounter.increment();
                throw e;
            }
        });
    }
}
```

---

## 4. 消息链路追踪

### 4.1 Sleuth 集成

**自动传递 TraceId**：
```yaml
spring:
  sleuth:
    messaging:
      enabled: true  # 开启消息追踪
```

**消息头自动添加**：
```
X-B3-TraceId: abc123
X-B3-SpanId: def456
X-B3-ParentSpanId: xyz789
```

**消费者自动提取**：
```java
@Component
public class TracedConsumer {
    
    @Bean
    public Consumer<Message<String>> input() {
        return message -> {
            // TraceId 自动从消息头提取
            String traceId = MDC.get("traceId");
            log.info("[{}] Received message: {}", traceId, message.getPayload());
        };
    }
}
```

---

### 4.2 Zipkin 查看消息链路

**调用链示例**：
```
HTTP Request → Order Service → 发送消息 → 
RabbitMQ → Inventory Service → 消费消息
```

**Zipkin 展示**：
- Span 1: HTTP Request (Order Service)
- Span 2: Send Message (Order Service)
- Span 3: Receive Message (Inventory Service)
- Span 4: Process Message (Inventory Service)

---

## 5. 异常处理

### 5.1 全局异常处理

**自定义错误处理器**：
```java
@Component
public class GlobalErrorHandler {
    
    @Bean
    public Consumer<Message<ErrorMessage>> errorChannel() {
        return message -> {
            ErrorMessage error = message.getPayload();
            
            log.error("消息处理失败: {}", error.getPayload());
            log.error("异常信息: {}", error.getOriginalMessage());
            
            // 记录到数据库
            errorLogMapper.insert(error);
            
            // 发送告警
            alertService.send("消息处理异常");
        };
    }
}
```

---

### 5.2 降级策略

**场景**：MQ 不可用时，降级到本地存储

```java
@Service
public class FallbackProducer {
    
    @Autowired
    private StreamBridge streamBridge;
    
    @Autowired
    private LocalMessageMapper messageMapper;
    
    public void sendWithFallback(String message) {
        try {
            // 尝试发送到 MQ
            streamBridge.send("message-out-0", message);
        } catch (Exception e) {
            log.warn("MQ 不可用，降级到本地存储");
            
            // 保存到数据库
            LocalMessage localMessage = new LocalMessage();
            localMessage.setPayload(message);
            localMessage.setStatus(0);
            messageMapper.insert(localMessage);
        }
    }
}
```

---

## 6. 多环境配置

### 6.1 开发环境

**application-dev.yml**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        output-out-0:
          destination: dev-user-topic
        input-in-0:
          destination: dev-user-topic
          group: dev-user-service-group
      
      rabbit:
        bindings:
          input-in-0:
            consumer:
              auto-bind-dlq: true
              max-attempts: 1  # 开发环境不重试
```

---

### 6.2 生产环境

**application-prod.yml**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        output-out-0:
          destination: prod-user-topic
        input-in-0:
          destination: prod-user-topic
          group: prod-user-service-group
      
      rabbit:
        bindings:
          output-out-0:
            producer:
              confirm-type: correlated
              compress: true
          input-in-0:
            consumer:
              acknowledge-mode: manual
              auto-bind-dlq: true
              max-attempts: 3
              prefetch: 10  # 预取数量
```

---

## 7. 测试

### 7.1 单元测试

**Mock StreamBridge**：
```java
@SpringBootTest
public class MessageProducerTest {
    
    @MockBean
    private StreamBridge streamBridge;
    
    @Autowired
    private OrderService orderService;
    
    @Test
    public void testSendMessage() {
        OrderDTO order = new OrderDTO();
        order.setId(1L);
        
        orderService.createOrder(order);
        
        // 验证消息发送
        verify(streamBridge).send(eq("order-out-0"), any(OrderDTO.class));
    }
}
```

---

### 7.2 集成测试

**嵌入式 RabbitMQ**：
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-test-support</artifactId>
    <scope>test</scope>
</dependency>
```

**测试代码**：
```java
@SpringBootTest
@Import(TestChannelBinderConfiguration.class)
public class StreamIntegrationTest {
    
    @Autowired
    private InputDestination input;
    
    @Autowired
    private OutputDestination output;
    
    @Test
    public void testMessageFlow() {
        // 发送消息到输入通道
        input.send(MessageBuilder.withPayload("test").build(), "input-in-0");
        
        // 从输出通道接收消息
        Message<byte[]> received = output.receive(1000, "output-out-0");
        
        assertNotNull(received);
        assertEquals("test", new String(received.getPayload()));
    }
}
```

---

## 8. 实战检查清单

### 8.1 上线前检查

**消息可靠性**：
- [ ] 配置生产者确认
- [ ] 配置消费者手动确认
- [ ] 配置消息重试
- [ ] 配置死信队列
- [ ] 实现本地消息表（可选）

**性能优化**：
- [ ] 配置连接池
- [ ] 开启消息压缩
- [ ] 配置批量发送（可选）
- [ ] 配置预取数量

**监控告警**：
- [ ] 配置 Prometheus 指标
- [ ] 配置队列积压告警
- [ ] 配置消费延迟告警
- [ ] 配置死信队列监控

**异常处理**：
- [ ] 配置全局异常处理
- [ ] 配置降级策略
- [ ] 配置链路追踪

---

### 8.2 常见问题排查

**消息丢失**：
1. 检查生产者确认配置
2. 检查消费者确认配置
3. 检查消息持久化配置

**消息重复消费**：
1. 检查消费者分组配置
2. 实现幂等性处理
3. 检查消息确认机制

**消息积压**：
1. 检查消费者性能
2. 增加消费者实例
3. 优化消费逻辑
4. 增加预取数量

**消息顺序错乱**：
1. 使用消息分区
2. 单线程消费
3. 检查消费者配置

---

## 9. 学习自检清单

- [ ] 掌握消息可靠性保障方案
- [ ] 能够实现本地消息表
- [ ] 掌握性能优化配置
- [ ] 能够配置监控告警
- [ ] 掌握消息链路追踪
- [ ] 能够处理异常情况
- [ ] 掌握多环境配置
- [ ] 能够编写测试用例

---

## 10. 面试高频题

**Q1：如何保证消息可靠性？**

**参考答案**：
1. **生产者**：发布确认、本地消息表
2. **MQ**：消息持久化、集群部署
3. **消费者**：手动确认、重试机制、死信队列

**Q2：如何处理消息积压？**

**参考答案**：
1. 增加消费者实例（水平扩展）
2. 优化消费逻辑（减少耗时）
3. 增加预取数量（批量消费）
4. 临时降级（暂停非核心消费）

**Q3：如何实现消息顺序消费？**

**参考答案**：
1. 使用消息分区（partition-key）
2. 单线程消费
3. 使用 RabbitMQ 单队列
4. Kafka 保证分区内有序

---

**本章小结**：
- 消息可靠性：生产者确认、本地消息表、消费者确认
- 性能优化：批量发送、异步发送、连接池、压缩
- 监控告警：队列积压、消费延迟、死信队列
- 链路追踪：Sleuth + Zipkin 消息链路
- 异常处理：全局异常、降级策略
- 多环境配置：dev/prod 配置分离
- 测试：单元测试、集成测试
- 实战清单：上线检查、问题排查

**下一章预告**：第31章 - Sleuth + Zipkin 链路追踪深入

# 第 27 章：Spring Cloud Stream 快速入门

> **学习目标**：掌握 Stream 快速接入、理解 Binder 抽象、能够实现消息收发  
> **预计时长**：3-4 小时  
> **难度级别**：⭐⭐⭐⭐ 进阶

---

## 1. Stream 架构设计

### 1.1 Spring Cloud Stream 简介

**Spring Cloud Stream** 是一个用于构建消息驱动微服务的框架。

**核心特性**：
- ✅ 屏蔽底层消息中间件差异
- ✅ 统一的编程模型
- ✅ 支持多种消息中间件（Kafka、RabbitMQ、RocketMQ）
- ✅ 自动配置与管理
- ✅ 消息分区、消费者组支持
- ✅ 声明式编程

### 1.2 架构设计

```
应用层
    ↓
Stream API（StreamBridge、@Bean Consumer）
    ↓
Spring Cloud Stream Core
    ↓
Binder 抽象层
    ↓
具体 Binder 实现
    ├─ Kafka Binder
    ├─ RabbitMQ Binder
    └─ RocketMQ Binder
    ↓
消息中间件
    ├─ Kafka
    ├─ RabbitMQ
    └─ RocketMQ
```

**关键概念**：

```
Destination（目的地）：
- 消息发送的目标或接收的源
- 对应 Kafka 的 Topic、RabbitMQ 的 Exchange

Binder（绑定器）：
- 应用与消息中间件的桥梁
- 屏蔽底层差异

Binding（绑定）：
- 应用的输入/输出与 Destination 的映射
- 通过配置建立关联

Message（消息）：
- 传输的数据载体
- 包含 Header 和 Payload
```

---

## 2. Binder 抽象概念

### 2.1 Binder 作用

**Binder** 是 Spring Cloud Stream 的核心抽象，用于屏蔽不同消息中间件的差异。

**架构图**：

```
应用代码
    ↓ StreamBridge.send()
Binder 抽象层
    ↓
    ├─ Kafka Binder → Kafka
    ├─ RabbitMQ Binder → RabbitMQ
    └─ RocketMQ Binder → RocketMQ
```

**优势**：

```
1. 统一编程模型
   - 切换消息中间件无需修改业务代码
   - 只需更改依赖和配置

2. 简化开发
   - 自动配置
   - 无需学习底层 API

3. 功能增强
   - 消息分区
   - 消费者组
   - 错误处理
   - 消息重试
```

### 2.2 Binder 实现

**官方支持的 Binder**：

| Binder | 中间件 | 依赖 |
|--------|--------|------|
| Kafka Binder | Apache Kafka | spring-cloud-stream-binder-kafka |
| RabbitMQ Binder | RabbitMQ | spring-cloud-stream-binder-rabbit |
| RocketMQ Binder | Apache RocketMQ | spring-cloud-stream-binder-rocketmq |

**第三方 Binder**：
- AWS Kinesis Binder
- Google Pub/Sub Binder
- Azure Event Hubs Binder

---

## 3. 依赖引入（Kafka/RabbitMQ）

### 3.1 Kafka Binder

**添加依赖**：

```xml
<dependencies>
    <!-- Spring Cloud Stream -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-stream</artifactId>
    </dependency>
    
    <!-- Kafka Binder -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-stream-binder-kafka</artifactId>
    </dependency>
</dependencies>
```

**配置**：

```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          brokers: localhost:9092  # Kafka 地址
          auto-create-topics: true  # 自动创建 Topic
```

### 3.2 RabbitMQ Binder

**添加依赖**：

```xml
<dependencies>
    <!-- Spring Cloud Stream -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-stream</artifactId>
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
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

---

## 4. 生产者开发（StreamBridge）

### 4.1 StreamBridge 基础使用

**StreamBridge** 是 Stream 3.x 推荐的消息发送方式。

```java
@RestController
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    
    private final StreamBridge streamBridge;
    
    @PostMapping("/orders")
    public Result<Order> createOrder(@RequestBody OrderDTO dto) {
        // 1. 创建订单
        Order order = orderService.createOrder(dto);
        
        // 2. 发送消息
        boolean sent = streamBridge.send(
            "order-out-0",  // Binding 名称
            order           // 消息内容
        );
        
        if (sent) {
            log.info("订单消息发送成功，订单ID：{}", order.getId());
        } else {
            log.error("订单消息发送失败，订单ID：{}", order.getId());
        }
        
        return Result.success(order);
    }
}
```

**配置 Binding**：

```yaml
spring:
  cloud:
    stream:
      bindings:
        order-out-0:  # Binding 名称
          destination: order-topic  # Kafka Topic 或 RabbitMQ Exchange
          content-type: application/json  # 消息类型
```

### 4.2 发送消息头

```java
@PostMapping("/orders")
public Result<Order> createOrder(@RequestBody OrderDTO dto) {
    Order order = orderService.createOrder(dto);
    
    // 构建消息
    Message<Order> message = MessageBuilder
        .withPayload(order)
        .setHeader("orderType", "CREATE")  // 自定义消息头
        .setHeader("userId", dto.getUserId())
        .setHeader("timestamp", System.currentTimeMillis())
        .build();
    
    // 发送消息
    streamBridge.send("order-out-0", message);
    
    return Result.success(order);
}
```

### 4.3 动态目标

```java
@PostMapping("/orders/{type}")
public Result<Order> createOrder(@PathVariable String type, @RequestBody OrderDTO dto) {
    Order order = orderService.createOrder(dto);
    
    // 根据类型发送到不同的 Topic
    String bindingName = "order-" + type + "-out-0";
    streamBridge.send(bindingName, order);
    
    return Result.success(order);
}
```

**配置**：

```yaml
spring:
  cloud:
    stream:
      bindings:
        order-normal-out-0:
          destination: order-normal-topic
        order-vip-out-0:
          destination: order-vip-topic
```

---

## 5. 消费者开发（@Bean Consumer）

### 5.1 基础消费者

**函数式消费者**（推荐）：

```java
@Configuration
@Slf4j
public class OrderConsumer {
    
    @Bean
    public Consumer<Order> orderConsumer() {
        return order -> {
            log.info("接收到订单消息：{}", order);
            
            // 处理订单
            processOrder(order);
        };
    }
    
    private void processOrder(Order order) {
        // 业务逻辑
        log.info("处理订单：ID={}, 金额={}", order.getId(), order.getAmount());
    }
}
```

**配置**：

```yaml
spring:
  cloud:
    function:
      definition: orderConsumer  # 函数定义
    
    stream:
      bindings:
        orderConsumer-in-0:  # 输入 Binding（函数名-in-索引）
          destination: order-topic
          group: order-service  # 消费者组
          content-type: application/json
```

### 5.2 带消息头的消费者

```java
@Bean
public Consumer<Message<Order>> orderConsumer() {
    return message -> {
        // 获取消息体
        Order order = message.getPayload();
        
        // 获取消息头
        MessageHeaders headers = message.getHeaders();
        String orderType = (String) headers.get("orderType");
        Long userId = (Long) headers.get("userId");
        
        log.info("接收到订单消息：type={}, userId={}, order={}", 
            orderType, userId, order);
        
        processOrder(order);
    };
}
```

### 5.3 多个消费者

```java
@Configuration
@Slf4j
public class MessageConsumers {
    
    /**
     * 订单消费者
     */
    @Bean
    public Consumer<Order> orderConsumer() {
        return order -> {
            log.info("订单消费者：{}", order);
        };
    }
    
    /**
     * 支付消费者
     */
    @Bean
    public Consumer<Payment> paymentConsumer() {
        return payment -> {
            log.info("支付消费者：{}", payment);
        };
    }
}
```

**配置**：

```yaml
spring:
  cloud:
    function:
      definition: orderConsumer;paymentConsumer  # 多个函数用分号分隔
    
    stream:
      bindings:
        orderConsumer-in-0:
          destination: order-topic
          group: order-service
        
        paymentConsumer-in-0:
          destination: payment-topic
          group: order-service
```

---

## 6. 消息发送与消费验证

### 6.1 完整示例

**生产者服务**：

```java
@SpringBootApplication
public class ProducerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProducerApplication.class, args);
    }
}

@RestController
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    
    private final StreamBridge streamBridge;
    
    @PostMapping("/orders")
    public Result<Order> createOrder(@RequestBody OrderDTO dto) {
        Order order = new Order();
        order.setId(System.currentTimeMillis());
        order.setUserId(dto.getUserId());
        order.setProductId(dto.getProductId());
        order.setAmount(dto.getAmount());
        order.setCreateTime(LocalDateTime.now());
        
        streamBridge.send("order-out-0", order);
        
        log.info("发送订单消息：{}", order);
        
        return Result.success(order);
    }
}
```

**生产者配置**：

```yaml
server:
  port: 8081

spring:
  application:
    name: order-producer
  
  cloud:
    stream:
      kafka:
        binder:
          brokers: localhost:9092
      
      bindings:
        order-out-0:
          destination: order-topic
          content-type: application/json
```

**消费者服务**：

```java
@SpringBootApplication
public class ConsumerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConsumerApplication.class, args);
    }
}

@Configuration
@Slf4j
public class OrderConsumer {
    
    @Bean
    public Consumer<Order> orderConsumer() {
        return order -> {
            log.info("接收到订单消息：{}", order);
            
            // 模拟处理
            try {
                Thread.sleep(100);
                log.info("订单处理成功：ID={}", order.getId());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        };
    }
}
```

**消费者配置**：

```yaml
server:
  port: 8082

spring:
  application:
    name: order-consumer
  
  cloud:
    function:
      definition: orderConsumer
    
    stream:
      kafka:
        binder:
          brokers: localhost:9092
      
      bindings:
        orderConsumer-in-0:
          destination: order-topic
          group: order-service
          content-type: application/json
```

### 6.2 测试

```bash
# 1. 启动 Kafka
bin/kafka-server-start.sh config/server.properties

# 2. 启动消费者服务
cd order-consumer
mvn spring-boot:run

# 3. 启动生产者服务
cd order-producer
mvn spring-boot:run

# 4. 发送请求
curl -X POST http://localhost:8081/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productId": 100,
    "amount": 99.99
  }'

# 5. 查看消费者日志
# 应该看到：接收到订单消息：...
```

---

## 7. Stream vs 原生客户端对比

### 7.1 Kafka 原生客户端

**生产者**：

```java
@Component
public class KafkaProducer {
    
    private final KafkaTemplate<String, Order> kafkaTemplate;
    
    public void sendOrder(Order order) {
        kafkaTemplate.send("order-topic", order);
    }
}
```

**消费者**：

```java
@Component
public class KafkaConsumer {
    
    @KafkaListener(topics = "order-topic", groupId = "order-service")
    public void consume(Order order) {
        log.info("接收到订单：{}", order);
    }
}
```

**配置**：

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      group-id: order-service
      properties:
        spring.json.trusted.packages: com.example.domain
```

### 7.2 Stream vs 原生对比

| 特性 | Spring Cloud Stream | 原生客户端 |
|------|---------------------|-----------|
| **中间件切换** | ✅ 简单（改依赖+配置） | ❌ 需要重写代码 |
| **编程模型** | ✅ 统一 | ❌ 各异 |
| **学习成本** | ✅ 低 | ❌ 高 |
| **配置复杂度** | ✅ 简单 | ⚠️ 较复杂 |
| **功能丰富度** | ⚠️ 基础功能 | ✅ 完整功能 |
| **性能** | ⚠️ 有轻微损耗 | ✅ 最优 |
| **灵活性** | ⚠️ 受限于抽象 | ✅ 完全控制 |

### 7.3 使用场景建议

**使用 Spring Cloud Stream**：

```
✅ 需要切换消息中间件
✅ 多个微服务统一编程模型
✅ 快速开发
✅ 基础消息收发
✅ 标准化消息驱动架构
```

**使用原生客户端**：

```
✅ 需要高级特性
✅ 性能要求极高
✅ 深度定制
✅ 单一消息中间件
✅ 复杂的消息处理逻辑
```

---

## 8. 实战案例：订单消息驱动

### 8.1 业务场景

```
用户下单流程：
1. 用户提交订单
2. 订单服务创建订单，发送消息
3. 库存服务消费消息，扣减库存
4. 支付服务消费消息，创建支付单
5. 通知服务消费消息，发送通知
```

**订单服务（生产者）**：

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final StreamBridge streamBridge;
    
    @Transactional
    public Order createOrder(OrderDTO dto) {
        // 1. 创建订单
        Order order = new Order();
        order.setUserId(dto.getUserId());
        order.setProductId(dto.getProductId());
        order.setAmount(dto.getAmount());
        order.setStatus(OrderStatus.CREATED);
        order.setCreateTime(LocalDateTime.now());
        
        order = orderRepository.save(order);
        
        // 2. 发送订单创建事件
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setOrderId(order.getId());
        event.setUserId(order.getUserId());
        event.setProductId(order.getProductId());
        event.setAmount(order.getAmount());
        event.setTimestamp(System.currentTimeMillis());
        
        streamBridge.send("orderCreated-out-0", event);
        
        log.info("订单创建成功，发送事件：{}", event);
        
        return order;
    }
}
```

**库存服务（消费者）**：

```java
@Configuration
@Slf4j
public class InventoryConsumer {
    
    @Autowired
    private InventoryService inventoryService;
    
    @Bean
    public Consumer<OrderCreatedEvent> orderCreatedConsumer() {
        return event -> {
            log.info("库存服务接收到订单创建事件：{}", event);
            
            try {
                // 扣减库存
                inventoryService.deductStock(
                    event.getProductId(), 
                    event.getQuantity()
                );
                
                log.info("库存扣减成功：productId={}", event.getProductId());
                
            } catch (Exception e) {
                log.error("库存扣减失败：{}", event, e);
                // 这里可以发送库存扣减失败事件
            }
        };
    }
}
```

**支付服务（消费者）**：

```java
@Configuration
@Slf4j
public class PaymentConsumer {
    
    @Autowired
    private PaymentService paymentService;
    
    @Bean
    public Consumer<OrderCreatedEvent> orderCreatedConsumer() {
        return event -> {
            log.info("支付服务接收到订单创建事件：{}", event);
            
            // 创建支付单
            Payment payment = paymentService.createPayment(
                event.getOrderId(),
                event.getUserId(),
                event.getAmount()
            );
            
            log.info("支付单创建成功：{}", payment);
        };
    }
}
```

---

## 9. 面试要点

### 9.1 基础问题

**Q1：Spring Cloud Stream 的作用是什么？**

1. 屏蔽消息中间件差异
2. 提供统一的编程模型
3. 简化消息驱动微服务开发

**Q2：什么是 Binder？**

- Binder 是应用与消息中间件的桥梁
- 屏蔽底层差异
- 提供统一接口

### 9.2 进阶问题

**Q3：StreamBridge 和传统的 @EnableBinding 有什么区别？**

- StreamBridge：3.x 推荐方式，更灵活
- @EnableBinding：2.x 方式，已废弃

**Q4：如何实现消息的发送和消费？**

- 发送：StreamBridge.send()
- 消费：@Bean Consumer

### 9.3 架构问题

**Q5：何时使用 Stream，何时使用原生客户端？**

- Stream：需要切换中间件、快速开发、统一模型
- 原生：需要高级特性、极致性能、深度定制

**Q6：消息驱动架构的优势？**

1. 解耦服务
2. 异步处理
3. 削峰填谷
4. 提高可用性

---

## 10. 参考资料

**官方文档**：
- [Spring Cloud Stream](https://spring.io/projects/spring-cloud-stream)
- [Spring Cloud Stream 参考文档](https://docs.spring.io/spring-cloud-stream/docs/current/reference/html/)

**Binder 文档**：
- [Kafka Binder](https://docs.spring.io/spring-cloud-stream-binder-kafka/docs/current/reference/html/)
- [RabbitMQ Binder](https://docs.spring.io/spring-cloud-stream-binder-rabbit/docs/current/reference/html/)

---

**下一章预告**：第 28 章将深入学习 Stream Binder 配置、消息分区策略、消费者组、消息确认机制、消息重试与死信队列、消息幂等性保证、消息顺序性保证、事务消息、错误处理策略等内容。

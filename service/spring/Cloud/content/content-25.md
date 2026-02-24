# 第25章：Stream 消息驱动快速入门

> **本章目标**：掌握 Spring Cloud Stream 消息驱动编程，实现异步解耦通信

---

## 1. Stream 简介

**定位**：Spring Cloud Stream 是消息驱动的微服务框架，屏蔽底层消息中间件差异。

**核心概念**：
- **Binder**：绑定器，与消息中间件通信
- **Channel**：通道，消息传输管道
- **Message**：消息
- **Producer**：生产者
- **Consumer**：消费者

**支持的消息中间件**：
- RabbitMQ
- Kafka
- RocketMQ

---

## 2. 快速入门

### 2.1 引入依赖

**pom.xml**：
```xml
<dependencies>
    <!-- Stream RabbitMQ -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
    </dependency>
    
    <!-- 或者 Kafka -->
    <!--
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-stream-kafka</artifactId>
    </dependency>
    -->
</dependencies>
```

---

### 2.2 配置

**application.yml**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        # 输出通道（生产者）
        output-out-0:
          destination: user-topic  # 主题/队列名
        
        # 输入通道（消费者）
        input-in-0:
          destination: user-topic
          group: user-service  # 消费者组
      
      rabbit:
        bindings:
          output-out-0:
            producer:
              routing-key-expression: headers['routingKey']
```

---

### 2.3 生产者

**发送消息**：
```java
@Service
public class MessageProducer {
    
    @Autowired
    private StreamBridge streamBridge;
    
    public void sendMessage(String message) {
        streamBridge.send("output-out-0", message);
    }
    
    public void sendObject(UserDTO user) {
        streamBridge.send("output-out-0", user);
    }
}
```

---

### 2.4 消费者

**接收消息**：
```java
@Component
public class MessageConsumer {
    
    @Bean
    public Consumer<String> input() {
        return message -> {
            System.out.println("Received: " + message);
        };
    }
    
    @Bean
    public Consumer<UserDTO> userInput() {
        return user -> {
            System.out.println("Received user: " + user.getName());
        };
    }
}
```

---

## 3. 核心特性

### 3.1 消息分组

**配置**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        input-in-0:
          destination: user-topic
          group: user-group  # 同一组只有一个实例消费
```

**作用**：防止消息重复消费。

---

### 3.2 消息分区

**配置**：
```yaml
spring:
  cloud:
    stream:
      bindings:
        output-out-0:
          producer:
            partition-key-expression: headers['partitionKey']
            partition-count: 3  # 分区数
        
        input-in-0:
          consumer:
            partitioned: true
            instance-index: 0  # 当前实例索引
            instance-count: 3  # 总实例数
```

---

### 3.3 延迟消息（RabbitMQ）

**配置**：
```yaml
spring:
  cloud:
    stream:
      rabbit:
        bindings:
          output-out-0:
            producer:
              delayed-exchange: true
```

**发送**：
```java
public void sendDelayedMessage(String message, int delay) {
    Message<String> msg = MessageBuilder
        .withPayload(message)
        .setHeader("x-delay", delay)  # 延迟时间（毫秒）
        .build();
    
    streamBridge.send("output-out-0", msg);
}
```

---

## 4. 实战场景

### 4.1 场景1：订单消息

**生产者**：
```java
@Service
public class OrderService {
    
    @Autowired
    private StreamBridge streamBridge;
    
    public void createOrder(OrderDTO order) {
        // 保存订单
        orderMapper.insert(order);
        
        // 发送订单创建消息
        streamBridge.send("order-created", order);
    }
}
```

**消费者**：
```java
@Component
public class OrderConsumer {
    
    @Bean
    public Consumer<OrderDTO> orderCreated() {
        return order -> {
            // 发送短信
            smsService.send(order.getPhone(), "订单创建成功");
            
            // 扣减库存
            inventoryService.deduct(order.getProductId(), order.getQuantity());
        };
    }
}
```

---

## 5. 学习自检清单

- [ ] 理解 Stream 消息驱动模型
- [ ] 掌握生产者和消费者编程
- [ ] 理解消息分组和分区
- [ ] 能够实现延迟消息
- [ ] 掌握实战应用场景

---

**本章小结**：
- Stream 屏蔽底层消息中间件差异
- 核心概念：Binder、Channel、Message
- 生产者：StreamBridge.send()
- 消费者：@Bean Consumer<T>
- 消息分组：防止重复消费
- 消息分区：提高吞吐量
- 实战：订单消息、库存扣减

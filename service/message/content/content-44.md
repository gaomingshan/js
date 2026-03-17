# Spring AMQP 与 RabbitMQ

## 概述

Spring AMQP 提供了 RabbitMQ 的高级抽象。本章介绍集成方法。

---

## 1. 依赖配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

---

## 2. 配置

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: admin
    password: admin123
    virtual-host: /
    listener:
      simple:
        acknowledge-mode: manual
        prefetch: 10
```

---

## 3. 声明配置

```java
@Configuration
public class RabbitMQConfig {
    
    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable("order-queue")
            .withArgument("x-message-ttl", 86400000)
            .withArgument("x-max-length", 10000)
            .build();
    }
    
    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange("order-exchange");
    }
    
    @Bean
    public Binding orderBinding() {
        return BindingBuilder
            .bind(orderQueue())
            .to(orderExchange())
            .with("order.created");
    }
}
```

---

## 4. 生产者

```java
@Service
public class RabbitMQProducerService {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void send(String exchange, String routingKey, Object message) {
        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }
    
    // 带确认
    public void sendWithConfirm(String exchange, String routingKey, Object message) {
        rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
            if (ack) {
                log.info("消息确认成功");
            } else {
                log.error("消息确认失败: {}", cause);
            }
        });
        
        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }
}
```

---

## 5. 消费者

```java
@Component
public class OrderConsumer {
    
    @RabbitListener(queues = "order-queue")
    public void consume(String message) {
        log.info("收到消息: {}", message);
    }
    
    // 手动ACK
    @RabbitListener(queues = "order-queue")
    public void consumeManual(String message, Channel channel, 
                             @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
        try {
            processMessage(message);
            channel.basicAck(tag, false);
        } catch (Exception e) {
            channel.basicNack(tag, false, true);
        }
    }
    
    // 消息对象
    @RabbitListener(queues = "order-queue")
    public void consumeOrder(Order order) {
        processOrder(order);
    }
}
```

---

## 6. 死信队列

```java
@Configuration
public class DeadLetterConfig {
    
    @Bean
    public Queue dlxQueue() {
        return new Queue("dlx-queue");
    }
    
    @Bean
    public DirectExchange dlxExchange() {
        return new DirectExchange("dlx-exchange");
    }
    
    @Bean
    public Binding dlxBinding() {
        return BindingBuilder.bind(dlxQueue()).to(dlxExchange()).with("dlx");
    }
    
    @Bean
    public Queue businessQueue() {
        return QueueBuilder.durable("business-queue")
            .withArgument("x-dead-letter-exchange", "dlx-exchange")
            .withArgument("x-dead-letter-routing-key", "dlx")
            .build();
    }
}
```

---

## 关键要点

1. **RabbitTemplate**：发送消息
2. **@RabbitListener**：消费消息
3. **手动ACK**：acknowledge-mode: manual
4. **死信队列**：x-dead-letter-exchange
5. **消息转换**：自动序列化/反序列化

---

## 参考资料

1. [Spring AMQP](https://docs.spring.io/spring-amqp/reference/)

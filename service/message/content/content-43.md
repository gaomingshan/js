# Spring Boot 集成

## 概述

Spring Boot通过自动配置简化了消息队列的集成。本章介绍Spring Boot Starter的使用方法。

---

## 1. Spring Boot Kafka Starter

### 1.1 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

### 1.2 配置

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
    consumer:
      group-id: ${spring.application.name}
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      enable-auto-commit: false
      properties:
        spring.json.trusted.packages: com.example.model
```

### 1.3 使用示例

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

@RestController
public class MessageController {
    
    @Autowired
    private KafkaTemplate<String, Order> kafkaTemplate;
    
    @PostMapping("/orders")
    public String createOrder(@RequestBody Order order) {
        kafkaTemplate.send("orders", order);
        return "Order created";
    }
}

@Component
public class OrderListener {
    
    @KafkaListener(topics = "orders")
    public void handleOrder(Order order) {
        processOrder(order);
    }
}
```

---

## 2. RocketMQ Spring Boot Starter

### 2.1 依赖

```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-spring-boot-starter</artifactId>
    <version>2.2.3</version>
</dependency>
```

### 2.2 配置

```yaml
rocketmq:
  name-server: localhost:9876
  producer:
    group: ${spring.application.name}-producer
    send-message-timeout: 3000
    retry-times-when-send-failed: 2
```

### 2.3 使用示例

```java
@Service
public class OrderService {
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    public void createOrder(Order order) {
        rocketMQTemplate.convertAndSend("orders", order);
    }
}

@Component
@RocketMQMessageListener(
    topic = "orders",
    consumerGroup = "${spring.application.name}-consumer"
)
public class OrderListener implements RocketMQListener<Order> {
    
    @Override
    public void onMessage(Order order) {
        processOrder(order);
    }
}
```

---

## 3. Spring Boot AMQP Starter

### 3.1 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

### 3.2 配置

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: admin
    password: admin
    virtual-host: /
    listener:
      simple:
        acknowledge-mode: manual
        prefetch: 10
        retry:
          enabled: true
          max-attempts: 3
```

### 3.3 使用示例

```java
@Configuration
public class RabbitMQConfig {
    
    @Bean
    public Queue orderQueue() {
        return new Queue("orders", true);
    }
    
    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange("order-exchange");
    }
    
    @Bean
    public Binding binding() {
        return BindingBuilder.bind(orderQueue())
            .to(orderExchange())
            .with("order.created");
    }
}

@Service
public class OrderService {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void createOrder(Order order) {
        rabbitTemplate.convertAndSend("order-exchange", "order.created", order);
    }
}

@Component
public class OrderListener {
    
    @RabbitListener(queues = "orders")
    public void handleOrder(Order order, Channel channel, Message message) throws IOException {
        try {
            processOrder(order);
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
        }
    }
}
```

---

## 4. 自动配置原理（AutoConfiguration）

### 4.1 Kafka自动配置

```java
@Configuration
@ConditionalOnClass(KafkaTemplate.class)
@EnableConfigurationProperties(KafkaProperties.class)
public class KafkaAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean(KafkaTemplate.class)
    public KafkaTemplate<?, ?> kafkaTemplate(ProducerFactory<Object, Object> kafkaProducerFactory) {
        return new KafkaTemplate<>(kafkaProducerFactory);
    }
}
```

### 4.2 自定义配置覆盖

```java
@Configuration
public class CustomKafkaConfig {
    
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        // 自定义Producer配置
        Map<String, Object> configProps = new HashMap<>();
        // ...
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    
    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

---

## 5. 健康检查（Health Indicator）

### 5.1 Kafka健康检查

```yaml
management:
  health:
    kafka:
      enabled: true
  endpoint:
    health:
      show-details: always
```

**健康检查实现**：
```java
@Component
public class KafkaHealthIndicator implements HealthIndicator {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    @Override
    public Health health() {
        try {
            kafkaTemplate.send("health-check", "ping").get(1, TimeUnit.SECONDS);
            return Health.up().build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}
```

### 5.2 RabbitMQ健康检查

```yaml
management:
  health:
    rabbit:
      enabled: true
```

---

## 6. Actuator 监控端点

### 6.1 启用Actuator

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

### 6.2 自定义指标

```java
@Component
public class MessageMetrics {
    
    private final Counter messagesSent;
    private final Counter messagesReceived;
    
    public MessageMetrics(MeterRegistry registry) {
        this.messagesSent = Counter.builder("messages.sent")
            .tag("topic", "orders")
            .register(registry);
        
        this.messagesReceived = Counter.builder("messages.received")
            .tag("topic", "orders")
            .register(registry);
    }
    
    public void recordSent() {
        messagesSent.increment();
    }
    
    public void recordReceived() {
        messagesReceived.increment();
    }
}
```

---

## 7. 多实例配置

### 7.1 多Kafka实例

```yaml
spring:
  kafka:
    primary:
      bootstrap-servers: kafka1:9092
    secondary:
      bootstrap-servers: kafka2:9092
```

```java
@Configuration
public class MultiKafkaConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties("spring.kafka.primary")
    public KafkaProperties primaryKafkaProperties() {
        return new KafkaProperties();
    }
    
    @Bean
    @ConfigurationProperties("spring.kafka.secondary")
    public KafkaProperties secondaryKafkaProperties() {
        return new KafkaProperties();
    }
    
    @Bean
    @Primary
    public KafkaTemplate<String, String> primaryKafkaTemplate() {
        return new KafkaTemplate<>(primaryProducerFactory());
    }
    
    @Bean
    public KafkaTemplate<String, String> secondaryKafkaTemplate() {
        return new KafkaTemplate<>(secondaryProducerFactory());
    }
}
```

---

## 关键要点

1. **自动配置**：Spring Boot自动配置Producer和Consumer
2. **配置文件**：application.yml统一管理配置
3. **健康检查**：自动提供健康检查端点
4. **Actuator**：集成监控指标
5. **多实例**：支持多Kafka/RabbitMQ实例

---

## 深入一点

**Spring Boot自动配置加载过程**：

```
1. @SpringBootApplication
   ↓
2. @EnableAutoConfiguration
   ↓
3. 扫描spring.factories
   ↓
4. 加载KafkaAutoConfiguration
   ↓
5. 条件注解判断
   - @ConditionalOnClass(KafkaTemplate.class)
   - @ConditionalOnMissingBean
   ↓
6. 创建Bean
   - ProducerFactory
   - ConsumerFactory
   - KafkaTemplate
```

**配置属性绑定**：

```java
@ConfigurationProperties(prefix = "spring.kafka")
public class KafkaProperties {
    private String bootstrapServers;
    private Producer producer = new Producer();
    private Consumer consumer = new Consumer();
    
    // Spring Boot自动绑定application.yml配置到属性
}
```

---

## 参考资料

1. [Spring Boot Kafka](https://docs.spring.io/spring-boot/docs/current/reference/html/messaging.html#messaging.kafka)
2. [Spring Boot AMQP](https://docs.spring.io/spring-boot/docs/current/reference/html/messaging.html#messaging.amqp)
3. [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)

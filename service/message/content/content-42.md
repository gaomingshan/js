# Spring 基础集成

## 概述

Spring为三大消息队列提供了统一的编程模型和抽象，简化了消息队列的集成。本章介绍Spring基础集成方法。

---

## 1. Spring Kafka

### 1.1 KafkaTemplate

```java
@Configuration
public class KafkaConfig {
    
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    
    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}

@Service
public class MessageService {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    public void sendMessage(String topic, String message) {
        kafkaTemplate.send(topic, message);
    }
    
    public void sendMessageWithCallback(String topic, String message) {
        kafkaTemplate.send(topic, message).addCallback(
            result -> log.info("Success: {}", result.getRecordMetadata().offset()),
            ex -> log.error("Failed", ex)
        );
    }
}
```

### 1.2 @KafkaListener

```java
@Component
public class KafkaMessageListener {
    
    @KafkaListener(topics = "my-topic", groupId = "my-group")
    public void listen(String message) {
        processMessage(message);
    }
    
    @KafkaListener(topics = "my-topic")
    public void listenWithRecord(ConsumerRecord<String, String> record) {
        log.info("Partition: {}, Offset: {}, Value: {}", 
            record.partition(), record.offset(), record.value());
    }
    
    @KafkaListener(topics = "my-topic")
    public void listenBatch(List<String> messages) {
        processBatch(messages);
    }
}
```

---

## 2. Spring for RocketMQ

### 2.1 RocketMQTemplate

```java
@Configuration
public class RocketMQConfig {
    // Spring Boot自动配置，无需手动配置
}

@Service
public class RocketMQService {
    
    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    
    public void sendMessage(String topic, String message) {
        rocketMQTemplate.convertAndSend(topic, message);
    }
    
    public void sendMessageWithTag(String topic, String tag, String message) {
        rocketMQTemplate.convertAndSend(topic + ":" + tag, message);
    }
    
    public void sendAsyncMessage(String topic, String message) {
        rocketMQTemplate.asyncSend(topic, message, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                log.info("Success: {}", sendResult.getMsgId());
            }
            
            @Override
            public void onException(Throwable e) {
                log.error("Failed", e);
            }
        });
    }
}
```

### 2.2 @RocketMQMessageListener

```java
@Component
@RocketMQMessageListener(
    topic = "my-topic",
    consumerGroup = "my-group"
)
public class RocketMQListener implements RocketMQListener<String> {
    
    @Override
    public void onMessage(String message) {
        processMessage(message);
    }
}

@Component
@RocketMQMessageListener(
    topic = "my-topic",
    consumerGroup = "my-group",
    selectorExpression = "TagA || TagB"
)
public class RocketMQListenerWithTag implements RocketMQListener<String> {
    
    @Override
    public void onMessage(String message) {
        processMessage(message);
    }
}
```

---

## 3. Spring AMQP

### 3.1 RabbitTemplate

```java
@Configuration
public class RabbitMQConfig {
    
    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setUsername("admin");
        factory.setPassword("admin");
        return factory;
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        return new RabbitTemplate(connectionFactory);
    }
}

@Service
public class RabbitMQService {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void sendMessage(String queue, String message) {
        rabbitTemplate.convertAndSend(queue, message);
    }
    
    public void sendMessageToExchange(String exchange, String routingKey, String message) {
        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }
}
```

### 3.2 @RabbitListener

```java
@Component
public class RabbitMQListener {
    
    @RabbitListener(queues = "my-queue")
    public void listen(String message) {
        processMessage(message);
    }
    
    @RabbitListener(queues = "my-queue")
    public void listenWithAck(Message message, Channel channel) throws IOException {
        try {
            processMessage(new String(message.getBody()));
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
        }
    }
}
```

---

## 4. 配置注入与自动装配

### 4.1 application.yml配置

**Kafka**：
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
      acks: all
    consumer:
      group-id: my-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      enable-auto-commit: false
```

**RocketMQ**：
```yaml
rocketmq:
  name-server: localhost:9876
  producer:
    group: producer-group
    send-message-timeout: 3000
  consumer:
    group: consumer-group
```

**RabbitMQ**：
```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: admin
    password: admin
    listener:
      simple:
        acknowledge-mode: manual
```

---

## 5. 消息转换器（MessageConverter）

### 5.1 JSON转换器

```java
@Configuration
public class MessageConverterConfig {
    
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}

// 发送对象
@Autowired
private KafkaTemplate<String, Order> kafkaTemplate;

public void sendOrder(Order order) {
    kafkaTemplate.send("orders", order);
}

// 接收对象
@KafkaListener(topics = "orders")
public void listen(Order order) {
    processOrder(order);
}
```

### 5.2 自定义转换器

```java
public class CustomMessageConverter implements MessageConverter {
    
    @Override
    public Object fromMessage(Message message) {
        // 自定义反序列化
        return deserialize(message.getBody());
    }
    
    @Override
    public Message toMessage(Object object, MessageProperties messageProperties) {
        // 自定义序列化
        byte[] bytes = serialize(object);
        return new Message(bytes, messageProperties);
    }
}
```

---

## 6. 事务管理集成

### 6.1 Kafka事务

```java
@Service
public class TransactionalService {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    @Transactional("kafkaTransactionManager")
    public void sendInTransaction(String message) {
        kafkaTemplate.send("topic1", message);
        kafkaTemplate.send("topic2", message);
        // 两条消息在同一事务中
    }
}

@Configuration
public class KafkaTransactionConfig {
    
    @Bean
    public KafkaTransactionManager kafkaTransactionManager(
            ProducerFactory<String, String> producerFactory) {
        return new KafkaTransactionManager(producerFactory);
    }
}
```

---

## 7. 异常处理器

### 7.1 Kafka异常处理

```java
@Configuration
public class KafkaErrorHandlerConfig {
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> 
            kafkaListenerContainerFactory(ConsumerFactory<String, String> consumerFactory) {
        
        ConcurrentKafkaListenerContainerFactory<String, String> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setCommonErrorHandler(new DefaultErrorHandler());
        return factory;
    }
}

@Component
public class KafkaErrorHandler implements ConsumerAwareListenerErrorHandler {
    
    @Override
    public Object handleError(Message<?> message, ListenerExecutionFailedException exception, 
                             Consumer<?, ?> consumer) {
        log.error("Error processing message: {}", message.getPayload(), exception);
        // 自定义错误处理逻辑
        return null;
    }
}
```

---

## 关键要点

1. **Spring集成**：KafkaTemplate、RocketMQTemplate、RabbitTemplate
2. **注解驱动**：@KafkaListener、@RocketMQMessageListener、@RabbitListener
3. **配置注入**：application.yml统一配置
4. **消息转换**：自动JSON序列化/反序列化
5. **事务支持**：声明式事务管理

---

## 参考资料

1. [Spring for Apache Kafka](https://spring.io/projects/spring-kafka)
2. [RocketMQ Spring](https://github.com/apache/rocketmq-spring)
3. [Spring AMQP](https://spring.io/projects/spring-amqp)

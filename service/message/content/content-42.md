# Spring Kafka 高级特性

## 概述

Spring Kafka 提供事务、批量消费等高级特性。本章深入探讨这些功能。

---

## 1. 事务消息

```java
@Configuration
public class KafkaConfig {
    
    @Bean
    public KafkaTransactionManager<String, String> kafkaTransactionManager(
            ProducerFactory<String, String> producerFactory) {
        return new KafkaTransactionManager<>(producerFactory);
    }
}

@Service
public class TransactionalService {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    @Transactional
    public void sendInTransaction() {
        kafkaTemplate.send("topic1", "msg1");
        kafkaTemplate.send("topic2", "msg2");
        // 任何异常会回滚两条消息
    }
}
```

---

## 2. 批量消费

```java
@KafkaListener(topics = "my-topic", containerFactory = "batchFactory")
public void consumeBatch(List<String> messages) {
    log.info("批量消费: {} 条消息", messages.size());
    processBatch(messages);
}

@Configuration
public class KafkaConfig {
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> batchFactory(
            ConsumerFactory<String, String> consumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, String> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setBatchListener(true);
        return factory;
    }
}
```

---

## 3. 异常处理

```java
@Configuration
public class KafkaConfig {
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setCommonErrorHandler(new DefaultErrorHandler(
            new FixedBackOff(1000L, 3L)  // 重试3次，间隔1秒
        ));
        return factory;
    }
}
```

---

## 4. 过滤器

```java
@KafkaListener(topics = "my-topic", 
    filter = "headerFilter")
public void consume(String message) {
    // 只消费符合条件的消息
}

@Bean
public RecordFilterStrategy<String, String> headerFilter() {
    return record -> {
        String type = new String(record.headers().lastHeader("type").value());
        return !"order".equals(type);  // 过滤掉非订单消息
    };
}
```

---

## 5. 重试与死信队列

```java
@Configuration
public class KafkaConfig {
    
    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
    
    @Bean
    public DeadLetterPublishingRecoverer deadLetterPublishingRecoverer() {
        return new DeadLetterPublishingRecoverer(kafkaTemplate());
    }
    
    @Bean
    public DefaultErrorHandler errorHandler() {
        return new DefaultErrorHandler(
            deadLetterPublishingRecoverer(),
            new FixedBackOff(1000L, 3L)
        );
    }
}
```

---

## 关键要点

1. **事务消息**：@Transactional + KafkaTransactionManager
2. **批量消费**：setBatchListener(true)
3. **异常处理**：DefaultErrorHandler + 重试策略
4. **死信队列**：DeadLetterPublishingRecoverer
5. **过滤器**：RecordFilterStrategy

---

## 参考资料

1. [Spring Kafka Reference](https://docs.spring.io/spring-kafka/reference/)

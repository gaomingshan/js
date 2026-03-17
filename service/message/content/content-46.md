# Spring Boot 自动配置

## 概述

Spring Boot 提供消息队列的自动配置。本章介绍配置原理和定制方法。

---

## 1. Kafka 自动配置

```java
// Spring Boot 自动配置
@AutoConfiguration
@ConditionalOnClass(KafkaTemplate.class)
public class KafkaAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public KafkaTemplate<?, ?> kafkaTemplate(
            ProducerFactory<Object, Object> kafkaProducerFactory) {
        return new KafkaTemplate<>(kafkaProducerFactory);
    }
}
```

---

## 2. 自定义配置

```java
@Configuration
public class CustomKafkaConfig {
    
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.RETRIES_CONFIG, 3);
        return new DefaultKafkaProducerFactory<>(config);
    }
    
    @Bean
    public KafkaTemplate<String, String> customKafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

---

## 3. RabbitMQ 自动配置

```java
@Configuration
public class CustomRabbitConfig {
    
    @Bean
    public RabbitTemplate customRabbitTemplate(
            ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(new Jackson2JsonMessageConverter());
        template.setConfirmCallback((data, ack, cause) -> {
            log.info("Confirm: ack={}", ack);
        });
        return template;
    }
}
```

---

## 4. 配置属性

```java
@ConfigurationProperties(prefix = "custom.kafka")
@Data
public class CustomKafkaProperties {
    private String bootstrapServers;
    private String groupId;
    private int retries = 3;
    private String acks = "all";
}

@Configuration
@EnableConfigurationProperties(CustomKafkaProperties.class)
public class KafkaConfig {
    
    @Autowired
    private CustomKafkaProperties properties;
    
    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, 
            properties.getBootstrapServers());
        config.put(ProducerConfig.ACKS_CONFIG, properties.getAcks());
        return new DefaultKafkaProducerFactory<>(config);
    }
}
```

---

## 5. 条件装配

```java
@Configuration
@ConditionalOnProperty(name = "custom.mq.type", havingValue = "kafka")
public class KafkaConfiguration {
    // Kafka 相关Bean
}

@Configuration
@ConditionalOnProperty(name = "custom.mq.type", havingValue = "rabbitmq")
public class RabbitMQConfiguration {
    // RabbitMQ 相关Bean
}
```

---

## 关键要点

1. **自动配置**：@AutoConfiguration
2. **条件装配**：@ConditionalOnClass、@ConditionalOnProperty
3. **配置属性**：@ConfigurationProperties
4. **自定义Bean**：覆盖默认配置
5. **多环境配置**：application-{profile}.yml

---

## 参考资料

1. [Spring Boot Auto-configuration](https://docs.spring.io/spring-boot/reference/)

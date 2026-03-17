# Spring Cloud Stream 统一抽象

## 概述

Spring Cloud Stream 提供消息队列的统一抽象层。本章介绍如何使用。

---

## 1. 核心概念

**Binder**：连接应用和消息中间件
**Binding**：输入/输出通道
**Message**：消息载体

---

## 2. Kafka Binder

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-kafka</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    stream:
      bindings:
        output-out-0:
          destination: my-topic
        input-in-0:
          destination: my-topic
          group: my-group
      kafka:
        binder:
          brokers: localhost:9092
```

---

## 3. 函数式编程

```java
@Configuration
public class StreamConfig {
    
    // 生产者
    @Bean
    public Supplier<String> output() {
        return () -> "Hello " + System.currentTimeMillis();
    }
    
    // 消费者
    @Bean
    public Consumer<String> input() {
        return message -> {
            log.info("收到消息: {}", message);
        };
    }
    
    // 处理器
    @Bean
    public Function<String, String> process() {
        return input -> input.toUpperCase();
    }
}
```

---

## 4. 多Binder支持

```yaml
spring:
  cloud:
    stream:
      bindings:
        kafka-out-0:
          destination: kafka-topic
          binder: kafka
        rabbitmq-out-0:
          destination: rabbitmq-queue
          binder: rabbitmq
      binders:
        kafka:
          type: kafka
          environment:
            spring:
              kafka:
                bootstrap-servers: localhost:9092
        rabbitmq:
          type: rabbit
          environment:
            spring:
              rabbitmq:
                host: localhost
```

---

## 5. 消息发送

```java
@Service
public class MessageProducer {
    
    @Autowired
    private StreamBridge streamBridge;
    
    public void send(String bindingName, Object message) {
        streamBridge.send(bindingName, message);
    }
}
```

---

## 关键要点

1. **Binder**：屏蔽底层差异
2. **函数式编程**：Supplier、Consumer、Function
3. **多Binder**：同时使用多种消息队列
4. **StreamBridge**：动态发送消息
5. **统一抽象**：切换MQ无需修改代码

---

## 参考资料

1. [Spring Cloud Stream](https://spring.io/projects/spring-cloud-stream)

# Spring Cloud Stream

## 概述

Spring Cloud Stream提供了统一的消息抽象层，支持多种消息中间件。本章介绍Spring Cloud Stream的使用方法。

---

## 1. 核心概念

### 1.1 Binder、Binding、Message

- **Binder**：消息中间件的抽象（Kafka Binder、RabbitMQ Binder）
- **Binding**：应用与消息中间件的绑定关系
- **Message**：消息对象

---

## 2. Kafka Binder 配置与使用

### 2.1 依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-kafka</artifactId>
</dependency>
```

### 2.2 配置

```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          brokers: localhost:9092
      bindings:
        output-out-0:
          destination: orders
          producer:
            partition-count: 3
        input-in-0:
          destination: orders
          group: ${spring.application.name}
          consumer:
            concurrency: 3
```

### 2.3 函数式编程模型

```java
@SpringBootApplication
public class Application {
    
    // 生产者
    @Bean
    public Supplier<String> output() {
        return () -> "Hello from Supplier";
    }
    
    // 消费者
    @Bean
    public Consumer<String> input() {
        return message -> {
            System.out.println("Received: " + message);
        };
    }
    
    // 处理器（接收并转发）
    @Bean
    public Function<String, String> processor() {
        return message -> {
            return message.toUpperCase();
        };
    }
}
```

---

## 3. RocketMQ Binder 配置与使用

### 3.1 依赖

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-rocketmq</artifactId>
</dependency>
```

### 3.2 配置

```yaml
spring:
  cloud:
    stream:
      rocketmq:
        binder:
          name-server: localhost:9876
      bindings:
        output-out-0:
          destination: orders
          producer:
            group: producer-group
        input-in-0:
          destination: orders
          consumer:
            tags: TagA
```

---

## 4. RabbitMQ Binder 配置与使用

### 4.1 依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-stream-binder-rabbit</artifactId>
</dependency>
```

### 4.2 配置

```yaml
spring:
  cloud:
    stream:
      rabbit:
        binder:
          connection-name-prefix: stream-
      bindings:
        output-out-0:
          destination: orders
        input-in-0:
          destination: orders
          group: ${spring.application.name}
```

---

## 5. 消息分区与消费者组

### 5.1 分区配置

```yaml
spring:
  cloud:
    stream:
      bindings:
        output-out-0:
          destination: orders
          producer:
            partition-key-expression: headers['partitionKey']
            partition-count: 3
        input-in-0:
          destination: orders
          group: ${spring.application.name}
          consumer:
            partitioned: true
            instance-index: 0
            instance-count: 3
```

---

## 6. 错误处理与重试

### 6.1 配置

```yaml
spring:
  cloud:
    stream:
      bindings:
        input-in-0:
          consumer:
            max-attempts: 3
            back-off-initial-interval: 1000
            back-off-max-interval: 10000
            back-off-multiplier: 2.0
```

---

## 7. 多 Binder 配置

```yaml
spring:
  cloud:
    stream:
      binders:
        kafka1:
          type: kafka
          environment:
            spring.cloud.stream.kafka.binder.brokers: kafka1:9092
        kafka2:
          type: kafka
          environment:
            spring.cloud.stream.kafka.binder.brokers: kafka2:9092
      bindings:
        output-out-0:
          destination: orders
          binder: kafka1
        input-in-0:
          destination: notifications
          binder: kafka2
```

---

## 关键要点

1. **统一抽象**：Binder、Binding、Message
2. **函数式编程**：Supplier、Consumer、Function
3. **多Binder**：支持同时连接多个消息队列
4. **分区支持**：消息分区和分区消费
5. **切换简单**：修改配置即可切换消息队列

---

## 参考资料

1. [Spring Cloud Stream](https://spring.io/projects/spring-cloud-stream)
2. [Kafka Binder](https://cloud.spring.io/spring-cloud-stream-binder-kafka/)

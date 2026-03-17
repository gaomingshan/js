# 原生 API 接入

## 概述

原生API提供了最灵活和最底层的控制方式。本章介绍三大消息队列原生客户端的使用方法。

---

## 1. Kafka Java Client

### 1.1 Producer API

```java
// 创建配置
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("acks", "all");
props.put("retries", 3);

// 创建Producer
KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// 同步发送
ProducerRecord<String, String> record = new ProducerRecord<>("my-topic", "key", "value");
try {
    RecordMetadata metadata = producer.send(record).get();
    System.out.println("Sent to partition: " + metadata.partition());
} catch (Exception e) {
    e.printStackTrace();
}

// 异步发送
producer.send(record, (metadata, exception) -> {
    if (exception != null) {
        exception.printStackTrace();
    } else {
        System.out.println("Offset: " + metadata.offset());
    }
});

// 关闭
producer.close();
```

### 1.2 Consumer API

```java
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "my-group");
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("enable.auto.commit", "false");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("my-topic"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        processMessage(record);
    }
    
    consumer.commitSync();
}
```

### 1.3 AdminClient API

```java
Properties props = new Properties();
props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");

try (AdminClient adminClient = AdminClient.create(props)) {
    // 创建Topic
    NewTopic newTopic = new NewTopic("my-topic", 6, (short) 3);
    adminClient.createTopics(Collections.singleton(newTopic)).all().get();
    
    // 列出Topics
    ListTopicsResult topics = adminClient.listTopics();
    topics.names().get().forEach(System.out::println);
    
    // 删除Topic
    adminClient.deleteTopics(Collections.singleton("my-topic")).all().get();
}
```

---

## 2. RocketMQ Client

### 2.1 Producer

```java
DefaultMQProducer producer = new DefaultMQProducer("producer-group");
producer.setNamesrvAddr("localhost:9876");
producer.start();

try {
    // 同步发送
    Message msg = new Message("my-topic", "TagA", "Hello RocketMQ".getBytes());
    SendResult sendResult = producer.send(msg);
    System.out.println(sendResult);
    
    // 异步发送
    producer.send(msg, new SendCallback() {
        @Override
        public void onSuccess(SendResult sendResult) {
            System.out.println("Success: " + sendResult.getMsgId());
        }
        
        @Override
        public void onException(Throwable e) {
            e.printStackTrace();
        }
    });
    
    // 单向发送
    producer.sendOneway(msg);
    
} finally {
    producer.shutdown();
}
```

### 2.2 Consumer

```java
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("consumer-group");
consumer.setNamesrvAddr("localhost:9876");
consumer.subscribe("my-topic", "*");

consumer.registerMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(
            List<MessageExt> msgs, ConsumeConcurrentlyContext context) {
        
        for (MessageExt msg : msgs) {
            System.out.println(new String(msg.getBody()));
        }
        
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});

consumer.start();
```

---

## 3. RabbitMQ Java Client

### 3.1 Connection与Channel

```java
ConnectionFactory factory = new ConnectionFactory();
factory.setHost("localhost");
factory.setPort(5672);
factory.setUsername("admin");
factory.setPassword("admin");

Connection connection = factory.newConnection();
Channel channel = connection.createChannel();

// 声明队列
channel.queueDeclare("my-queue", true, false, false, null);
```

### 3.2 Producer

```java
// 发送消息
String message = "Hello RabbitMQ";
channel.basicPublish("", "my-queue", null, message.getBytes());

// 发送持久化消息
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .deliveryMode(2)
    .build();
channel.basicPublish("", "my-queue", props, message.getBytes());

// 发送带确认
channel.confirmSelect();
channel.basicPublish("", "my-queue", null, message.getBytes());
channel.waitForConfirmsOrDie(5000);
```

### 3.3 Consumer

```java
// 自动ACK
channel.basicConsume("my-queue", true, (consumerTag, delivery) -> {
    String message = new String(delivery.getBody());
    System.out.println("Received: " + message);
}, consumerTag -> {});

// 手动ACK
channel.basicConsume("my-queue", false, (consumerTag, delivery) -> {
    try {
        String message = new String(delivery.getBody());
        processMessage(message);
        channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
    } catch (Exception e) {
        channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
    }
}, consumerTag -> {});
```

---

## 4. 连接管理与资源回收

### 4.1 Kafka连接管理

```java
@Component
public class KafkaClientManager {
    
    private KafkaProducer<String, String> producer;
    private KafkaConsumer<String, String> consumer;
    
    @PostConstruct
    public void init() {
        // 初始化Producer（单例）
        Properties props = new Properties();
        // 配置...
        producer = new KafkaProducer<>(props);
    }
    
    @PreDestroy
    public void destroy() {
        if (producer != null) {
            producer.close();
        }
        if (consumer != null) {
            consumer.close();
        }
    }
}
```

### 4.2 RocketMQ连接管理

```java
@Component
public class RocketMQClientManager {
    
    private DefaultMQProducer producer;
    private DefaultMQPushConsumer consumer;
    
    @PostConstruct
    public void init() throws MQClientException {
        producer = new DefaultMQProducer("producer-group");
        producer.setNamesrvAddr("localhost:9876");
        producer.start();
    }
    
    @PreDestroy
    public void destroy() {
        if (producer != null) {
            producer.shutdown();
        }
        if (consumer != null) {
            consumer.shutdown();
        }
    }
}
```

### 4.3 RabbitMQ连接管理

```java
@Configuration
public class RabbitMQConfig {
    
    @Bean
    public ConnectionFactory connectionFactory() {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        factory.setPort(5672);
        return factory;
    }
    
    @Bean
    public Connection connection(ConnectionFactory factory) throws IOException, TimeoutException {
        return factory.newConnection();
    }
    
    @Bean
    @Scope("prototype")
    public Channel channel(Connection connection) throws IOException {
        return connection.createChannel();
    }
}
```

---

## 5. 异常处理与重试

### 5.1 Kafka异常处理

```java
int retries = 3;
for (int i = 0; i < retries; i++) {
    try {
        producer.send(record).get();
        break;
    } catch (Exception e) {
        if (i == retries - 1) {
            log.error("Failed after {} retries", retries, e);
            // 写入死信队列或记录日志
        }
        Thread.sleep(1000 * (i + 1));
    }
}
```

### 5.2 RocketMQ异常处理

```java
try {
    SendResult result = producer.send(msg);
    if (result.getSendStatus() != SendStatus.SEND_OK) {
        // 发送失败，记录日志
        log.error("Send failed: {}", result);
    }
} catch (MQBrokerException e) {
    // Broker异常
    log.error("Broker exception", e);
} catch (MQClientException e) {
    // 客户端异常
    log.error("Client exception", e);
}
```

---

## 6. 性能优化

### 6.1 批量发送

```java
// Kafka批量发送
for (int i = 0; i < 1000; i++) {
    producer.send(new ProducerRecord<>("topic", "key-" + i, "value-" + i));
}
producer.flush();

// RocketMQ批量发送
List<Message> messages = new ArrayList<>();
for (int i = 0; i < 100; i++) {
    messages.add(new Message("topic", ("msg-" + i).getBytes()));
}
producer.send(messages);
```

### 6.2 连接复用

```java
// 单例Producer，所有线程共享
private static final KafkaProducer<String, String> PRODUCER = createProducer();

public void send(String topic, String message) {
    PRODUCER.send(new ProducerRecord<>(topic, message));
}
```

---

## 7. 原生 API vs Spring 抽象

| 特性 | 原生API | Spring抽象 |
|------|--------|-----------|
| 灵活性 | 高 | 中 |
| 易用性 | 低 | 高 |
| 配置管理 | 手动 | 自动 |
| 异常处理 | 手动 | 统一处理 |
| 事务支持 | 手动 | 声明式 |
| 适用场景 | 复杂定制 | 快速开发 |

---

## 关键要点

1. **连接复用**：Producer/Consumer单例，避免频繁创建
2. **资源回收**：正确关闭连接，避免资源泄漏
3. **异常处理**：捕获并处理各类异常
4. **性能优化**：批量发送、异步发送
5. **Spring集成**：生产环境推荐使用Spring抽象

---

## 参考资料

1. [Kafka Java Client](https://kafka.apache.org/documentation/#api)
2. [RocketMQ Client](https://rocketmq.apache.org/docs/sdk/01java/)
3. [RabbitMQ Java Client](https://www.rabbitmq.com/api-guide.html)

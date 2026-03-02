# Spring JMS 源码指引

> spring-jms 提供 JMS（Java Message Service）消息队列的集成支持，简化消息发送和接收。

---

## 1. JMS 操作模板（JmsTemplate）

### 核心类
- **JmsTemplate** - JMS 模板类（核心）
- **JmsOperations** - JMS 操作接口

### 设计目的
封装 JMS 样板代码（获取连接、创建会话、发送消息、释放资源），提供简洁的 API。

### 使用限制与风险
- JmsTemplate 是线程安全的，可单例使用
- 默认使用同步发送，可配置异步
- 每次调用都创建新的 Connection 和 Session（无连接池需配置 CachingConnectionFactory）

---

## 2. 消息监听容器（MessageListenerContainer）

### 核心接口
- **MessageListenerContainer** - 消息监听容器接口
- **AbstractMessageListenerContainer** - 消息监听容器抽象基类

### 核心实现
- **SimpleMessageListenerContainer** - 简单消息监听容器（单线程）
- **DefaultMessageListenerContainer** - 默认消息监听容器（支持事务、多线程）

### 配置示例
```java
@Bean
public DefaultMessageListenerContainer messageListenerContainer(ConnectionFactory connectionFactory) {
    DefaultMessageListenerContainer container = new DefaultMessageListenerContainer();
    container.setConnectionFactory(connectionFactory);
    container.setDestinationName("myQueue");
    container.setMessageListener(new MessageListener() {
        public void onMessage(Message message) {
            // 处理消息
        }
    });
    container.setConcurrentConsumers(5);
    container.setMaxConcurrentConsumers(10);
    return container;
}
```

### 设计目的
异步接收和处理消息，支持并发消费、事务管理、错误处理等。

### 使用限制与风险
- SimpleMessageListenerContainer 简单但功能受限
- DefaultMessageListenerContainer 推荐使用，支持事务和动态伸缩
- 并发消费者数需根据负载调整

---

## 3. 消息转换（MessageConverter）

### 核心接口
- **MessageConverter** - 消息转换器接口
  - `toMessage()` - 对象转消息
  - `fromMessage()` - 消息转对象

### 核心实现
- **SimpleMessageConverter** - 简单消息转换器（默认）
  - String -> TextMessage
  - byte[] -> BytesMessage
  - Map -> MapMessage
  - Serializable -> ObjectMessage
- **MarshallingMessageConverter** - 编组消息转换器（XML）
- **MappingJackson2MessageConverter** - JSON 消息转换器

### 设计目的
抽象消息格式转换，支持多种序列化方式。

### 使用限制与风险
- SimpleMessageConverter 使用 Java 序列化（ObjectMessage），有安全风险
- 推荐使用 JSON 转换器
- 消息格式需与消费者协商一致

---

## 4. 消息发送

### 发送到默认目的地
```java
jmsTemplate.send(new MessageCreator() {
    public Message createMessage(Session session) throws JMSException {
        return session.createTextMessage("Hello JMS");
    }
});
```

### 发送到指定目的地
```java
jmsTemplate.send("myQueue", session -> session.createTextMessage("Hello"));
```

### 发送并转换对象
```java
jmsTemplate.convertAndSend("myQueue", myObject);
```

### 设计目的
简化消息发送操作，支持对象自动转换。

### 使用限制与风险
- 默认使用同步发送（阻塞）
- 发送大消息需注意性能
- 需配置 MessageConverter 支持自定义对象

---

## 5. 消息接收

### 同步接收
```java
Message message = jmsTemplate.receive("myQueue");
```

### 同步接收并转换
```java
String text = (String) jmsTemplate.receiveAndConvert("myQueue");
```

### 异步接收（使用监听器）
```java
@JmsListener(destination = "myQueue")
public void onMessage(String message) {
    // 处理消息
}
```

### 设计目的
支持同步和异步两种接收方式，满足不同场景需求。

### 使用限制与风险
- 同步接收会阻塞线程，不适合高吞吐场景
- 异步接收推荐使用 @JmsListener 注解
- 需启用 @EnableJms

---

## 6. 注解驱动（@JmsListener）

### 核心注解
- **@EnableJms** - 启用 JMS 注解支持
- **@JmsListener** - 声明消息监听器
- **@SendTo** - 指定响应消息的目的地

### 使用示例
```java
@Configuration
@EnableJms
public class JmsConfig {
}

@Component
public class MessageReceiver {
    @JmsListener(destination = "myQueue")
    public void receiveMessage(String message) {
        System.out.println("Received: " + message);
    }
    
    @JmsListener(destination = "requestQueue")
    @SendTo("responseQueue")
    public String processRequest(String request) {
        return "Processed: " + request;
    }
}
```

### 设计目的
通过注解简化消息监听器配置，实现声明式消息处理。

### 使用限制与风险
- 需配置 JmsListenerContainerFactory
- @SendTo 可用于请求-响应模式
- 监听器方法参数可自动转换（MessageConverter）

---

## 7. 事务管理

### JMS 事务
- JmsTemplate 支持 sessionTransacted 属性
- DefaultMessageListenerContainer 支持 sessionTransacted

### 集成 Spring 事务
```java
@Transactional
public void sendMessage(String message) {
    jmsTemplate.convertAndSend("myQueue", message);
    // 事务提交时消息才发送
}
```

### JMS 事务管理器
- **JmsTransactionManager** - JMS 事务管理器（仅管理 JMS 事务）
- **JtaTransactionManager** - JTA 事务管理器（支持 JMS + 数据库分布式事务）

### 设计目的
确保消息发送/接收与业务逻辑的事务一致性。

### 使用限制与风险
- JMS 本地事务仅保证 JMS 操作一致性
- 跨资源事务（JMS + 数据库）需使用 JTA
- 事务消息有性能开销

---

## 8. 目的地解析（DestinationResolver）

### 核心接口
- **DestinationResolver** - 目的地解析器接口

### 核心实现
- **DynamicDestinationResolver** - 动态目的地解析器（默认）
- **JndiDestinationResolver** - JNDI 目的地解析器

### 设计目的
抽象目的地（Queue/Topic）的查找逻辑，支持 JNDI 或动态创建。

### 使用限制与风险
- DynamicDestinationResolver 每次都创建新目的地（适合开发）
- JndiDestinationResolver 从 JNDI 查找（适合生产）
- 目的地名称与 JMS 提供者配置一致

---

## 9. 消息选择器与过滤

### 消息选择器
```java
@JmsListener(destination = "myQueue", selector = "priority > 5")
public void receiveHighPriorityMessage(String message) {
    // 仅接收优先级 > 5 的消息
}
```

或 JmsTemplate：
```java
jmsTemplate.receiveSelected("myQueue", "priority > 5");
```

### 设计目的
在服务器端过滤消息，减少网络传输和客户端处理。

### 使用限制与风险
- 选择器基于 SQL-92 语法
- 仅支持消息头和属性过滤，不支持消息体
- 过滤逻辑在 Broker 端执行

---

## 10. 消息发布与订阅（Pub/Sub）

### Topic 配置
```java
jmsTemplate.setPubSubDomain(true); // 使用 Topic 模式
jmsTemplate.convertAndSend("myTopic", message);
```

### Topic 监听器
```java
@JmsListener(destination = "myTopic", containerFactory = "topicListenerFactory")
public void onTopicMessage(String message) {
    // 处理 Topic 消息
}
```

### 持久订阅
```java
container.setSubscriptionDurable(true);
container.setClientId("myClientId");
container.setDurableSubscriptionName("mySubscription");
```

### 设计目的
支持点对点（Queue）和发布-订阅（Topic）两种消息模式。

### 使用限制与风险
- Topic 消息广播到所有订阅者
- 持久订阅需配置 clientId 和 subscriptionName
- 非持久订阅在订阅者断开后消息丢失

---

## 11. 消息确认与回执

### 确认模式
- **AUTO_ACKNOWLEDGE** - 自动确认（默认）
- **CLIENT_ACKNOWLEDGE** - 客户端确认
- **DUPS_OK_ACKNOWLEDGE** - 允许重复确认

### 客户端确认示例
```java
container.setSessionAcknowledgeMode(Session.CLIENT_ACKNOWLEDGE);

@JmsListener(destination = "myQueue")
public void onMessage(Message message) throws JMSException {
    try {
        // 处理消息
        message.acknowledge(); // 手动确认
    } catch (Exception e) {
        // 不确认，消息会重新投递
    }
}
```

### 设计目的
控制消息确认时机，确保消息不丢失。

### 使用限制与风险
- AUTO_ACKNOWLEDGE 性能最高但可能丢消息
- CLIENT_ACKNOWLEDGE 可靠但需手动确认
- 未确认的消息会重新投递（可能重复消费）

---

## 12. 消息持久化与重试

### 消息持久化
```java
jmsTemplate.setDeliveryMode(DeliveryMode.PERSISTENT); // 持久化消息
```

### 重试机制
- DefaultMessageListenerContainer 支持异常重试
- 配置 backOff 策略

```java
container.setErrorHandler(new ErrorHandler() {
    public void handleError(Throwable t) {
        // 自定义错误处理
    }
});
```

### 设计目的
确保消息可靠投递，支持失败重试。

### 使用限制与风险
- 持久化消息有性能开销
- 重试次数过多可能导致死信队列（DLQ）
- 需配合 DLQ 处理无法消费的消息

---

## 13. 异步发送

### 配置异步
```java
jmsTemplate.setExplicitQosEnabled(true);
jmsTemplate.setDeliveryMode(DeliveryMode.NON_PERSISTENT);
```

### 异步回调
部分 JMS 提供者（如 ActiveMQ）支持异步发送回调。

### 设计目的
提升发送性能，避免阻塞业务线程。

### 使用限制与风险
- 异步发送无法立即知道发送结果
- 非持久化消息可能丢失
- 需 JMS 提供者支持

---

## 14. 连接工厂配置

### CachingConnectionFactory
```java
@Bean
public CachingConnectionFactory cachingConnectionFactory(ConnectionFactory connectionFactory) {
    CachingConnectionFactory factory = new CachingConnectionFactory(connectionFactory);
    factory.setSessionCacheSize(10);
    factory.setCacheProducers(true);
    factory.setCacheConsumers(true);
    return factory;
}
```

### 设计目的
缓存 Connection、Session、Producer、Consumer，避免频繁创建销毁。

### 使用限制与风险
- 必须使用 CachingConnectionFactory 以提升性能
- 缓存大小需根据负载调整
- 长时间空闲连接可能被 Broker 关闭

---

## 📚 总结

spring-jms 简化了 JMS 消息队列的使用：
- **JmsTemplate**：封装消息发送和接收操作
- **MessageListenerContainer**：异步消息监听和并发消费
- **MessageConverter**：消息格式转换（JSON、XML、Java 序列化）
- **@JmsListener**：声明式消息监听器
- **事务管理**：集成 Spring 事务，支持 JMS 和 JTA 事务
- **Pub/Sub**：支持 Queue 和 Topic 两种模式
- **消息确认**：多种确认模式保证可靠性
- **持久化与重试**：确保消息不丢失

spring-jms 广泛用于异步通信、系统解耦、削峰填谷等场景。

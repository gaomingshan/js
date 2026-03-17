# 消息过滤

## 概述

消息过滤减少无效消息的传输和处理，提升系统效率。本章探讨三大消息队列的消息过滤机制和最佳实践。

---

## 1. Kafka 消息过滤

Kafka 没有服务端过滤，需在消费端过滤。

**消费端过滤**：

```java
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        // Header 过滤
        Header header = record.headers().lastHeader("type");
        if (header != null && "order".equals(new String(header.value()))) {
            processMessage(record);
        }
    }
}
```

**Topic 隔离（推荐）**：

```java
// 按业务类型划分 Topic
consumer.subscribe(Arrays.asList("order-topic", "payment-topic"));
```

---

## 2. RocketMQ 消息过滤

### 2.1 Tag 过滤（推荐）

**发送消息**：

```java
Message msg = new Message("TopicTest", "TagA", "Hello".getBytes());
producer.send(msg);
```

**订阅过滤**：

```java
// 订阅 TagA 或 TagB
consumer.subscribe("TopicTest", "TagA || TagB");

// 订阅所有 Tag
consumer.subscribe("TopicTest", "*");
```

### 2.2 SQL92 过滤

**启用 SQL 过滤**：

```properties
# broker.conf
enablePropertyFilter=true
```

**发送消息**：

```java
Message msg = new Message("TopicTest", "TagA", "Hello".getBytes());
msg.putUserProperty("age", "18");
msg.putUserProperty("region", "Beijing");

producer.send(msg);
```

**SQL 过滤**：

```java
consumer.subscribe("TopicTest", 
    MessageSelector.bySql("age >= 18 AND region = 'Beijing'"));
```

**支持的运算符**：
- 数值比较：`>`, `>=`, `<`, `<=`, `=`
- 字符串比较：`=`, `<>`, `IN`, `NOT IN`
- 逻辑运算：`AND`, `OR`, `NOT`
- 空值判断：`IS NULL`, `IS NOT NULL`

---

## 3. RabbitMQ 消息过滤

### 3.1 Routing Key 过滤

**Direct Exchange**：

```java
// 精确匹配
channel.queueBind("queue1", "direct-exchange", "order.created");
channel.queueBind("queue2", "direct-exchange", "payment.success");

// 发送
channel.basicPublish("direct-exchange", "order.created", null, msg.getBytes());
```

### 3.2 Topic Exchange 模式匹配

```java
// 声明 Topic Exchange
channel.exchangeDeclare("topic-exchange", "topic");

// 绑定队列（支持通配符）
channel.queueBind("queue1", "topic-exchange", "order.*");      // 匹配 order.created, order.updated
channel.queueBind("queue2", "topic-exchange", "order.#");      // 匹配 order.*, order.created.vip
channel.queueBind("queue3", "topic-exchange", "*.created");    // 匹配 order.created, payment.created

// 发送
channel.basicPublish("topic-exchange", "order.created", null, msg.getBytes());
```

### 3.3 Headers Exchange

```java
// 声明 Headers Exchange
channel.exchangeDeclare("headers-exchange", "headers");

// 绑定队列
Map<String, Object> bindArgs = new HashMap<>();
bindArgs.put("x-match", "all");  // all 或 any
bindArgs.put("format", "pdf");
bindArgs.put("type", "report");
channel.queueBind("queue1", "headers-exchange", "", bindArgs);

// 发送
AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
    .headers(Map.of("format", "pdf", "type", "report"))
    .build();
channel.basicPublish("headers-exchange", "", props, msg.getBytes());
```

---

## 4. 过滤性能对比

| MQ | 过滤位置 | 性能 | 灵活性 |
|------|---------|------|--------|
| Kafka | 客户端 | 低（传输无效消息） | 高 |
| RocketMQ Tag | 服务端 | 高（Hash 匹配） | 中 |
| RocketMQ SQL | 服务端 | 中（SQL 解析） | 高 |
| RabbitMQ Routing | 服务端 | 高（路由匹配） | 中 |
| RabbitMQ Headers | 服务端 | 低（Header 解析） | 高 |

---

## 5. 最佳实践

### 5.1 Kafka 过滤建议

```java
// 推荐：Topic 隔离
consumer.subscribe(Arrays.asList("vip-orders", "normal-orders"));

// 避免：消费端过滤（浪费带宽）
for (ConsumerRecord<String, String> record : records) {
    if (isVip(record)) {  // ❌ 所有消息都传输了
        processMessage(record);
    }
}
```

### 5.2 RocketMQ 过滤建议

```java
// 推荐：Tag 过滤（性能最优）
consumer.subscribe("OrderTopic", "VIP || SVIP");

// 谨慎：SQL 过滤（复杂条件）
consumer.subscribe("OrderTopic", 
    MessageSelector.bySql("(price > 1000 AND region = 'Beijing') OR vip = true"));
```

### 5.3 RabbitMQ 过滤建议

```java
// 推荐：Topic Exchange（灵活性好）
channel.queueBind("queue1", "topic-exchange", "order.*.vip");

// 避免：Headers Exchange（性能差）
// 仅在必须按多个属性过滤时使用
```

---

## 关键要点

1. **Kafka**：无服务端过滤，推荐 Topic 隔离
2. **RocketMQ**：Tag 过滤性能最优，SQL 过滤最灵活
3. **RabbitMQ**：Topic Exchange 是最常用的过滤方式
4. **性能**：服务端过滤优于客户端过滤
5. **设计**：合理设计 Tag/Routing Key，避免过度复杂的过滤条件

---

## 参考资料

1. [RocketMQ Filter](https://rocketmq.apache.org/docs/featureBehavior/07messagefilter)
2. [RabbitMQ Exchanges](https://www.rabbitmq.com/tutorials/amqp-concepts.html)

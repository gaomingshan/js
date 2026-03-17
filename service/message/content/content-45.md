# 消息序列化

## 概述

消息序列化影响性能、兼容性和可扩展性。本章介绍常用序列化方案的选择和使用。

---

## 1. JSON 序列化

### 1.1 Jackson

```java
// Kafka配置
props.put("value.serializer", "org.springframework.kafka.support.serializer.JsonSerializer");
props.put("value.deserializer", "org.springframework.kafka.support.serializer.JsonDeserializer");
props.put("spring.json.trusted.packages", "com.example.model");

// 发送对象
kafkaTemplate.send("orders", new Order());

// 接收对象
@KafkaListener(topics = "orders")
public void listen(Order order) {
    processOrder(order);
}
```

### 1.2 Gson

```java
public class GsonSerializer<T> implements Serializer<T> {
    private final Gson gson = new Gson();
    
    @Override
    public byte[] serialize(String topic, T data) {
        return gson.toJson(data).getBytes();
    }
}
```

---

## 2. Avro 序列化

### 2.1 Schema定义

```avro
{
  "type": "record",
  "name": "Order",
  "namespace": "com.example",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "amount", "type": "double"},
    {"name": "timestamp", "type": "long"}
  ]
}
```

### 2.2 Kafka配置

```java
props.put("value.serializer", "io.confluent.kafka.serializers.KafkaAvroSerializer");
props.put("value.deserializer", "io.confluent.kafka.serializers.KafkaAvroDeserializer");
props.put("schema.registry.url", "http://localhost:8081");
```

---

## 3. Protobuf 序列化

### 3.1 Proto定义

```protobuf
syntax = "proto3";

message Order {
  string id = 1;
  double amount = 2;
  int64 timestamp = 3;
}
```

### 3.2 使用

```java
// 序列化
Order order = Order.newBuilder()
    .setId("123")
    .setAmount(100.0)
    .setTimestamp(System.currentTimeMillis())
    .build();

byte[] data = order.toByteArray();

// 反序列化
Order order = Order.parseFrom(data);
```

---

## 4. 序列化性能对比

| 方案 | 序列化速度 | 反序列化速度 | 大小 | 可读性 |
|------|-----------|-------------|------|--------|
| JSON | 慢 | 慢 | 大 | 高 |
| Avro | 快 | 快 | 小 | 低 |
| Protobuf | 快 | 快 | 小 | 低 |

---

## 5. Schema 演进与兼容性

### 5.1 向后兼容

```avro
// V1
{
  "fields": [
    {"name": "id", "type": "string"}
  ]
}

// V2（新增字段带默认值）
{
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "name", "type": "string", "default": ""}
  ]
}
```

### 5.2 Schema Registry

```bash
# 注册Schema
curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data '{"schema": "..."}' \
  http://localhost:8081/subjects/orders-value/versions
```

---

## 关键要点

1. **JSON**：开发友好，性能较低
2. **Avro**：性能高，需Schema Registry
3. **Protobuf**：性能高，跨语言支持好
4. **兼容性**：向后兼容，新增字段带默认值
5. **选择建议**：开发阶段JSON，生产环境Avro/Protobuf

---

## 参考资料

1. [Kafka Serialization](https://kafka.apache.org/documentation/#serialization)
2. [Avro](https://avro.apache.org/)
3. [Protocol Buffers](https://developers.google.com/protocol-buffers)

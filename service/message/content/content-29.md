# 连接管理与连接池

## 概述

合理的连接管理能够减少资源消耗，提升性能。本章介绍三大消息队列的连接管理策略。

---

## 1. 长连接 vs 短连接

### 1.1 短连接

```java
// ❌ 错误：每次创建新连接
for (int i = 0; i < 1000; i++) {
    KafkaProducer producer = new KafkaProducer(props);
    producer.send(record);
    producer.close();  // 频繁创建和销毁
}

问题：
- 连接建立开销大（TCP三次握手）
- 资源浪费
- 性能低下
```

### 1.2 长连接

```java
// ✅ 正确：复用连接
KafkaProducer producer = new KafkaProducer(props);

for (int i = 0; i < 1000; i++) {
    producer.send(record);
}

// 应用关闭时才关闭
producer.close();

优势：
- 连接复用
- 性能高
- 资源占用少
```

---

## 2. Kafka 连接管理

### 2.1 Producer 连接

```java
// Producer 自动管理连接
KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// 每个 Broker 一个连接
// 自动重连
// 连接池管理
```

### 2.2 Consumer 连接

```java
// Consumer 连接管理
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

// Coordinator 连接
// Broker 连接
// 心跳连接
```

### 2.3 连接配置

```java
// 连接空闲超时（9分钟）
props.put("connections.max.idle.ms", 540000);

// 请求超时
props.put("request.timeout.ms", 30000);

// 重连退避时间
props.put("reconnect.backoff.ms", 50);
props.put("reconnect.backoff.max.ms", 1000);
```

---

## 3. RocketMQ 连接池

### 3.1 Producer 连接池

```java
DefaultMQProducer producer = new DefaultMQProducer("group");

// 内部使用 Netty 连接池
// 每个 Broker 维护连接池
```

### 3.2 连接池配置

```java
// 连接池大小（每个 Broker）
// 默认：1个连接

// 可配置多个连接提升并发
// NettyClientConfig 配置
```

---

## 4. RabbitMQ 连接与通道

### 4.1 Connection vs Channel

```java
// Connection：TCP 连接（重量级）
ConnectionFactory factory = new ConnectionFactory();
Connection connection = factory.newConnection();

// Channel：虚拟连接（轻量级）
Channel channel1 = connection.createChannel();
Channel channel2 = connection.createChannel();

// 推荐：单个 Connection，多个 Channel
```

### 4.2 连接池实现

```java
// Apache Commons Pool
GenericObjectPool<Channel> channelPool = new GenericObjectPool<>(
    new BasePooledObjectFactory<Channel>() {
        @Override
        public Channel create() {
            return connection.createChannel();
        }
        
        @Override
        public PooledObject<Channel> wrap(Channel channel) {
            return new DefaultPooledObject<>(channel);
        }
    }
);

// 配置连接池
channelPool.setMaxTotal(100);
channelPool.setMaxIdle(20);
channelPool.setMinIdle(10);
```

---

## 5. 连接数规划

### 5.1 Kafka 连接数

```
Producer 连接数 = Broker 数量
Consumer 连接数 = Broker 数量

示例：
3个 Broker，10个 Producer
总连接数 = 3 × 10 = 30
```

### 5.2 RocketMQ 连接数

```
Producer 连接数 = Broker 数量 × 连接池大小
Consumer 连接数 = Broker 数量

示例：
2个 Broker，5个 Producer，连接池大小=1
总连接数 = 2 × 5 = 10
```

### 5.3 RabbitMQ 连接数

```
推荐：
Connection 数量 = 应用实例数
Channel 数量 = Connection × 线程数

示例：
3个应用实例，每个10个线程
Connection = 3
Channel = 3 × 10 = 30
```

---

## 6. 连接复用

### 6.1 单例模式

```java
@Component
public class KafkaProducerFactory {
    
    private static KafkaProducer<String, String> producer;
    
    @PostConstruct
    public void init() {
        Properties props = new Properties();
        // 配置...
        producer = new KafkaProducer<>(props);
    }
    
    public KafkaProducer<String, String> getProducer() {
        return producer;
    }
    
    @PreDestroy
    public void destroy() {
        if (producer != null) {
            producer.close();
        }
    }
}
```

### 6.2 连接池模式

```java
@Configuration
public class RabbitMQConfig {
    
    @Bean
    public CachingConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setHost("localhost");
        
        // 连接缓存
        factory.setChannelCacheSize(25);
        factory.setConnectionCacheSize(10);
        
        return factory;
    }
}
```

---

## 7. 连接异常处理

### 7.1 Kafka 重连

```java
// Kafka 自动重连
// 重连配置
props.put("reconnect.backoff.ms", 50);
props.put("reconnect.backoff.max.ms", 1000);

// 连接断开时：
// 1. 指数退避重连
// 2. 最大重连间隔 1 秒
// 3. 无限重试
```

### 7.2 RocketMQ 重连

```java
// RocketMQ 自动重连
// Netty 断线重连机制
```

### 7.3 RabbitMQ 重连

```java
// 自动恢复配置
ConnectionFactory factory = new ConnectionFactory();
factory.setAutomaticRecoveryEnabled(true);
factory.setNetworkRecoveryInterval(10000);  // 10秒

Connection connection = factory.newConnection();
```

---

## 8. 连接监控

### 8.1 监控指标

```yaml
# Kafka 连接数
- kafka_server_socket_server_metrics_connection_count

# RabbitMQ 连接数
- rabbitmq_connections

# 连接创建速率
- kafka_server_socket_server_metrics_connection_creation_rate
```

### 8.2 告警规则

```yaml
- alert: TooManyConnections
  expr: kafka_server_socket_server_metrics_connection_count > 1000
  annotations:
    summary: "连接数过多"

- alert: ConnectionError
  expr: rate(kafka_server_socket_server_metrics_connection_close_rate[5m]) > 10
  annotations:
    summary: "连接频繁断开"
```

---

## 关键要点

1. **长连接**：复用连接，避免频繁创建
2. **连接池**：合理配置连接池大小
3. **Kafka**：自动管理连接，每个Broker一个连接
4. **RabbitMQ**：单Connection，多Channel
5. **监控**：监控连接数和连接错误

---

## 深入一点

**Kafka 连接管理源码**：

```java
// NetworkClient 管理连接
public class NetworkClient {
    
    // 每个 Broker 一个 Channel
    private final Map<String, KafkaChannel> channels;
    
    // 连接 Broker
    private void initiateConnect(Node node) {
        try {
            SocketChannel socketChannel = SocketChannel.open();
            socketChannel.connect(node.socketAddress());
            
            KafkaChannel channel = new KafkaChannel(socketChannel);
            this.channels.put(node.idString(), channel);
        } catch (IOException e) {
            // 连接失败，稍后重试
        }
    }
}
```

**RabbitMQ Channel 复用**：

```java
// 线程本地 Channel
ThreadLocal<Channel> channelThreadLocal = ThreadLocal.withInitial(() -> {
    try {
        return connection.createChannel();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
});

// 使用
Channel channel = channelThreadLocal.get();
channel.basicPublish(...);
```

---

## 参考资料

1. [Kafka Network Layer](https://kafka.apache.org/documentation/#networklayer)
2. [RabbitMQ Connections](https://www.rabbitmq.com/connections.html)
3. [Connection Pooling Best Practices](https://www.rabbitmq.com/api-guide.html#connection-recovery)

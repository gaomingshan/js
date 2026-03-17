# 灰度发布与消息队列

灰度发布需要消息队列配合实现流量控制。本章介绍灰度发布方案。

## 1. 基于消息头的灰度

```java
// 发送时添加版本标记
public void send(String message, String version) {
    ProducerRecord<String, String> record = 
        new ProducerRecord<>("my-topic", message);
    record.headers().add("version", version.getBytes());
    producer.send(record);
}

// 消费者过滤
@KafkaListener(topics = "my-topic", 
    containerFactory = "grayFactory")
public void consume(ConsumerRecord<String, String> record) {
    String version = new String(record.headers().lastHeader("version").value());
    if ("v2".equals(version) && grayConfig.isEnabled()) {
        // 灰度版本处理
        processV2(record.value());
    } else {
        // 稳定版本处理
        processV1(record.value());
    }
}
```

## 2. 独立Topic灰度

```java
// 生产者路由
public void send(String message) {
    String topic = grayRouter.route("orders");  // orders 或 orders-gray
    kafkaTemplate.send(topic, message);
}

// 灰度路由器
@Component
public class GrayRouter {
    
    public String route(String baseTopic) {
        if (shouldUseGray()) {
            return baseTopic + "-gray";
        }
        return baseTopic;
    }
    
    private boolean shouldUseGray() {
        // 根据用户ID、随机比例等判断
        String userId = UserContext.get();
        return grayUserService.isGrayUser(userId);
    }
}
```

## 3. 消费者组灰度

```java
// 稳定版本消费者
@KafkaListener(topics = "orders", groupId = "order-consumer-v1")
public void consumeV1(String message) {
    // V1 逻辑
}

// 灰度版本消费者
@KafkaListener(topics = "orders", groupId = "order-consumer-v2")
@ConditionalOnProperty(name = "gray.enabled", havingValue = "true")
public void consumeV2(String message) {
    // V2 逻辑
}
```

## 4. 流量控制

```java
@Component
public class GrayTrafficController {
    
    @Value("${gray.ratio:0}")
    private int grayRatio;  // 灰度比例 0-100
    
    public boolean shouldUseGray() {
        return ThreadLocalRandom.current().nextInt(100) < grayRatio;
    }
}

// 动态调整
@RestController
public class GrayController {
    
    @Autowired
    private GrayTrafficController controller;
    
    @PostMapping("/gray/ratio")
    public void setRatio(@RequestParam int ratio) {
        controller.setGrayRatio(ratio);
    }
}
```

## 5. 回滚方案

```java
// 记录灰度消息
@Component
public class GrayMessageRecorder {
    
    public void record(String messageId, String version) {
        redisTemplate.opsForValue().set(
            "gray:" + messageId, 
            version, 
            7, 
            TimeUnit.DAYS
        );
    }
    
    // 回滚时重新消费
    public void rollback(String fromVersion, String toVersion) {
        Set<String> keys = redisTemplate.keys("gray:*");
        for (String key : keys) {
            String version = redisTemplate.opsForValue().get(key);
            if (fromVersion.equals(version)) {
                String messageId = key.substring(5);
                replayMessage(messageId, toVersion);
            }
        }
    }
}
```

## 关键要点
1. **消息头灰度**：Header标记版本
2. **独立Topic**：灰度Topic隔离
3. **消费者组**：不同版本独立消费
4. **流量控制**：动态调整灰度比例
5. **回滚机制**：记录消息，支持回滚

## 参考资料
1. [灰度发布实践](https://www.infoq.cn/article/canary-deployment)

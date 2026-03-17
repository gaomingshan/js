# 最佳实践与反模式

## 概述

总结消息队列的最佳实践和常见反模式，帮助避免常见错误。

---

## 1. 消息设计最佳实践

### 1.1 消息大小

**推荐**：
```
- 消息大小：< 1MB
- 超大消息：使用对象存储（OSS/S3）+ 引用

// ✅ 正确：存储引用
@Data
public class FileMessage {
    private String fileId;
    private String fileUrl;  // OSS URL
    private Long fileSize;
}

// ❌ 错误：直接传输大文件
@Data
public class FileMessage {
    private byte[] fileContent;  // 10MB数据
}
```

### 1.2 消息格式

**推荐**：
```java
// ✅ 正确：结构化消息
@Data
public class OrderEvent {
    private String eventId;
    private String eventType;
    private Long timestamp;
    private Order payload;
}

// ❌ 错误：字符串拼接
String message = orderId + "|" + amount + "|" + userId;
```

### 1.3 消息Key设计

**推荐**：
```java
// ✅ 正确：使用业务Key
ProducerRecord<String, Order> record = 
    new ProducerRecord<>("orders", order.getId(), order);

// ❌ 错误：随机Key
ProducerRecord<String, Order> record = 
    new ProducerRecord<>("orders", UUID.randomUUID().toString(), order);
```

---

## 2. Topic 设计最佳实践

### 2.1 Topic粒度

**推荐**：
```
✅ 按业务领域划分：
- order.order.created
- payment.payment.completed
- inventory.stock.reduced

❌ 过细粒度：
- order.created.success
- order.created.failed

❌ 过粗粒度：
- events（所有事件混在一起）
```

### 2.2 Topic命名

**推荐**：
```
格式：{domain}.{aggregate}.{event}

✅ 正确：
- order.order.created
- user.account.registered

❌ 错误：
- OrderCreated（缺少层次）
- order_created（使用下划线）
```

### 2.3 Topic权限

**推荐**：
```bash
# ✅ 正确：最小权限原则
# 订单服务只能写order相关Topic
kafka-acls.sh --add \
  --allow-principal User:order-service \
  --operation Write \
  --topic "order.*"

# ❌ 错误：给所有Topic权限
kafka-acls.sh --add \
  --allow-principal User:order-service \
  --operation All \
  --topic "*"
```

---

## 3. 消费者设计最佳实践

### 3.1 重试策略

**推荐**：
```java
// ✅ 正确：指数退避重试
@KafkaListener(topics = "orders")
public void listen(Order order) {
    int retries = 3;
    for (int i = 0; i < retries; i++) {
        try {
            processOrder(order);
            return;
        } catch (Exception e) {
            if (i == retries - 1) {
                sendToDLQ(order);  // 最终失败，发送到死信队列
            } else {
                Thread.sleep(1000 * (long) Math.pow(2, i));  // 1s, 2s, 4s
            }
        }
    }
}

// ❌ 错误：无限重试
while (true) {
    try {
        processOrder(order);
        break;
    } catch (Exception e) {
        // 一直重试，阻塞队列
    }
}
```

### 3.2 幂等性

**推荐**：
```java
// ✅ 正确：检查幂等
@KafkaListener(topics = "orders")
public void listen(Order order) {
    if (dedupService.isProcessed(order.getId())) {
        return;  // 已处理，跳过
    }
    
    processOrder(order);
    dedupService.markProcessed(order.getId());
}

// ❌ 错误：不考虑幂等
@KafkaListener(topics = "orders")
public void listen(Order order) {
    // 重复消费会导致重复处理
    orderRepository.save(order);
}
```

### 3.3 监控

**推荐**：
```java
// ✅ 正确：记录处理时间
@KafkaListener(topics = "orders")
public void listen(Order order) {
    long start = System.currentTimeMillis();
    
    try {
        processOrder(order);
        long duration = System.currentTimeMillis() - start;
        
        metricsService.recordProcessTime(duration);
        metricsService.incrementSuccess();
    } catch (Exception e) {
        metricsService.incrementFailure();
        throw e;
    }
}
```

---

## 4. 常见反模式

### 4.1 大消息

**反模式**：
```java
// ❌ 发送10MB的消息
byte[] largeData = readFile("10MB.dat");
producer.send(new ProducerRecord<>("topic", largeData));
```

**问题**：
- 网络传输慢
- 内存占用高
- 影响其他消息

**解决**：
```java
// ✅ 使用对象存储
String fileUrl = ossClient.upload(largeData);
producer.send(new ProducerRecord<>("topic", fileUrl));
```

### 4.2 过多Topic

**反模式**：
```
为每个用户创建Topic
- user-1-orders
- user-2-orders
- ...
- user-10000-orders
```

**问题**：
- 元数据开销大
- 管理复杂
- 性能下降

**解决**：
```
使用统一Topic + 分区Key
- orders（Topic）
- userId作为Key
```

### 4.3 不合理分区

**反模式**：
```
Topic分区数：1000（过多）
或
Topic分区数：1（过少）
```

**问题**：
- 过多：Leader选举慢、文件句柄多
- 过少：吞吐量受限、无法并行

**解决**：
```
根据吞吐量计算分区数：
分区数 = 目标吞吐量 / 单分区吞吐量
建议：12-24个分区
```

### 4.4 同步发送阻塞

**反模式**：
```java
// ❌ 循环中使用同步发送
for (int i = 0; i < 10000; i++) {
    producer.send(record).get();  // 每次都等待
}
```

**问题**：
- 性能低下
- 吞吐量差

**解决**：
```java
// ✅ 异步发送 + 批量
for (int i = 0; i < 10000; i++) {
    producer.send(record);
}
producer.flush();  // 一次性刷新
```

---

## 5. 性能优化清单

**生产者**：
- ☑ 批量发送（batch.size=32KB）
- ☑ 压缩（lz4）
- ☑ 异步发送
- ☑ 连接复用
- ☑ 合理超时配置

**消费者**：
- ☑ 批量拉取（max.poll.records=500）
- ☑ 并发消费
- ☑ 批量处理（批量插入DB）
- ☑ 手动提交Offset
- ☑ 合理session.timeout

**Broker**：
- ☑ 使用SSD
- ☑ 增大Page Cache
- ☑ 调整网络线程数
- ☑ 副本数=3
- ☑ 禁用自动创建Topic

---

## 6. 故障处理手册

| 问题 | 排查步骤 | 解决方案 |
|------|---------|---------|
| 消费Lag | 查看消费速度、业务逻辑 | 增加消费者、优化逻辑 |
| 消息丢失 | 检查acks配置、副本数 | acks=all, min.insync.replicas=2 |
| 消息重复 | 检查幂等性设计 | 添加去重逻辑 |
| 性能下降 | 监控CPU、磁盘、网络 | 扩容、优化配置 |
| Broker宕机 | 检查磁盘、内存 | 重启、副本恢复 |

---

## 7. Code Review 检查点

**发送消息**：
- [ ] 是否设置了合理的Key
- [ ] 是否有重试机制
- [ ] 是否有超时配置
- [ ] 消息大小是否合理

**消费消息**：
- [ ] 是否手动提交Offset
- [ ] 是否有幂等性处理
- [ ] 是否有异常处理
- [ ] 是否有监控指标

**配置**：
- [ ] 是否配置了副本数
- [ ] 是否配置了ACK
- [ ] 是否配置了超时
- [ ] 是否配置了批量大小

---

## 关键要点

1. **消息设计**：小消息、结构化、有意义的Key
2. **Topic设计**：合理粒度、清晰命名、权限控制
3. **消费者**：幂等、重试、监控
4. **避免反模式**：大消息、过多Topic、不合理分区
5. **持续优化**：监控指标、定期review、故障复盘

---

## 参考资料

1. [Kafka Best Practices](https://kafka.apache.org/documentation/#bestpractices)
2. [RocketMQ Best Practice](https://rocketmq.apache.org/docs/bestPractice/01bestpractice/)
3. [RabbitMQ Best Practices](https://www.rabbitmq.com/best-practices.html)

---

# 🎉 全部60章内容生成完成！

恭喜！消息队列（Kafka、RocketMQ、RabbitMQ）系统化学习内容已全部生成完成。

**内容统计**：
- 总章节数：60章
- 总字数：约30万字
- 文件数量：60个内容文件

**内容涵盖**：
1. ✅ 消息队列基础（1-4章）
2. ✅ 环境搭建与部署（5-8章）
3. ✅ 核心机制深入（9-13章）
4. ✅ 消息可靠性保证（14-19章）
5. ✅ 消费模型与进度管理（20-25章）
6. ✅ 性能优化（26-31章）
7. ✅ 配置详解（32-36章）
8. ✅ 命令行管理（37-40章）
9. ✅ Spring生态集成（41-46章）
10. ✅ 企业级实践（47-54章）
11. ✅ 运维与监控（55-60章）

所有内容已保存在 `c:\soft\work\code\js\user\js\service\message\content\` 目录。

# 消息幂等性设计

消费者必须保证幂等性，防止重复消息导致业务异常。本章介绍幂等性设计方案。

## 1. 幂等性实现方案

**数据库唯一索引**：
```sql
CREATE UNIQUE INDEX uk_message_id ON orders(message_id);

-- 插入时利用唯一索引去重
INSERT INTO orders (message_id, order_id, amount) 
VALUES ('msg-123', 'order-456', 100.00)
ON DUPLICATE KEY UPDATE id=id;
```

**Redis 去重**：
```java
public boolean processMessage(String messageId) {
    String key = "msg:" + messageId;
    Boolean success = redisTemplate.opsForValue().setIfAbsent(key, "1", 24, TimeUnit.HOURS);
    if (!success) {
        return false;  // 重复消息
    }
    // 处理业务
    return true;
}
```

**业务状态机**：
```java
// 订单状态：待支付 → 已支付 → 已发货
public void processPayment(String orderId) {
    Order order = orderDao.findById(orderId);
    if (order.getStatus() == OrderStatus.PAID) {
        return;  // 已支付，幂等返回
    }
    if (order.getStatus() != OrderStatus.PENDING) {
        throw new IllegalStateException("订单状态异常");
    }
    order.setStatus(OrderStatus.PAID);
    orderDao.update(order);
}
```

## 2. 全局唯一ID

```java
// Snowflake ID
public class IdGenerator {
    private static final SnowflakeIdWorker idWorker = new SnowflakeIdWorker(1, 1);
    
    public static String generate() {
        return String.valueOf(idWorker.nextId());
    }
}

// 使用
String messageId = IdGenerator.generate();
Message msg = new Message("topic", messageId, data);
```

## 关键要点
1. **唯一索引**：数据库层面去重
2. **Redis缓存**：快速判断重复
3. **状态机**：利用业务状态幂等
4. **全局ID**：Snowflake、UUID
5. **组合方案**：多种方案结合使用

## 参考资料
1. [分布式ID生成方案](https://tech.meituan.com/2017/04/21/mt-leaf.html)

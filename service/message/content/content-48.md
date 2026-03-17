# 分布式事务方案

消息队列是分布式事务的重要实现方式。本章介绍基于消息队列的分布式事务方案。

## 1. 本地消息表

```java
@Transactional
public void createOrder(Order order) {
    // 1. 插入订单
    orderDao.insert(order);
    
    // 2. 插入本地消息表
    LocalMessage msg = new LocalMessage();
    msg.setContent(JsonUtils.toJson(order));
    msg.setStatus(MessageStatus.PENDING);
    messageDao.insert(msg);
}

// 定时任务发送
@Scheduled(fixedDelay = 5000)
public void sendPendingMessages() {
    List<LocalMessage> messages = messageDao.findPending();
    for (LocalMessage msg : messages) {
        try {
            kafkaTemplate.send("orders", msg.getContent());
            msg.setStatus(MessageStatus.SENT);
            messageDao.update(msg);
        } catch (Exception e) {
            log.error("发送失败", e);
        }
    }
}
```

## 2. RocketMQ 事务消息

```java
@RocketMQTransactionListener
public class OrderTransactionListener implements RocketMQLocalTransactionListener {
    
    @Override
    public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            // 执行本地事务
            Order order = (Order) arg;
            orderService.createOrder(order);
            return RocketMQLocalTransactionState.COMMIT;
        } catch (Exception e) {
            return RocketMQLocalTransactionState.ROLLBACK;
        }
    }
    
    @Override
    public RocketMQLocalTransactionState checkLocalTransaction(MessageExt msg) {
        String orderId = msg.getKeys();
        return orderService.exists(orderId) 
            ? RocketMQLocalTransactionState.COMMIT 
            : RocketMQLocalTransactionState.ROLLBACK;
    }
}
```

## 3. Saga 模式

```java
// 正向操作
public void createOrder(Order order) {
    // 1. 创建订单
    orderService.create(order);
    sendMessage("order-created", order);
    
    // 2. 扣减库存
    // 消费者处理
}

// 补偿操作
public void compensateOrder(String orderId) {
    // 1. 取消订单
    orderService.cancel(orderId);
    sendMessage("order-cancelled", orderId);
    
    // 2. 恢复库存
    // 消费者处理
}
```

## 关键要点
1. **本地消息表**：简单可靠，需要定时任务
2. **事务消息**：RocketMQ原生支持
3. **Saga模式**：长事务，正向+补偿
4. **最终一致性**：保证最终一致即可
5. **补偿机制**：失败时回滚

## 参考资料
1. [Saga Pattern](https://microservices.io/patterns/data/saga.html)

# 事件驱动架构

事件驱动架构（EDA）通过事件实现服务间解耦。本章介绍EDA设计方法。

## 1. 事件设计

```java
@Data
public class OrderCreatedEvent {
    private String eventId;      // 事件ID
    private String orderId;      // 订单ID
    private String userId;       // 用户ID
    private BigDecimal amount;   // 金额
    private Long timestamp;      // 时间戳
    private String eventType = "ORDER_CREATED";
}
```

## 2. 事件发布

```java
@Service
public class EventPublisher {
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    public void publishOrderCreated(Order order) {
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setEventId(UUID.randomUUID().toString());
        event.setOrderId(order.getId());
        event.setUserId(order.getUserId());
        event.setAmount(order.getAmount());
        event.setTimestamp(System.currentTimeMillis());
        
        kafkaTemplate.send("order-events", 
            event.getEventType(), 
            JsonUtils.toJson(event));
    }
}
```

## 3. 事件消费

```java
@Component
public class OrderEventHandler {
    
    // 库存服务消费
    @KafkaListener(topics = "order-events")
    public void handleOrderCreated(String json) {
        OrderCreatedEvent event = JsonUtils.fromJson(json, OrderCreatedEvent.class);
        if ("ORDER_CREATED".equals(event.getEventType())) {
            inventoryService.reduceStock(event.getOrderId());
        }
    }
    
    // 通知服务消费
    @KafkaListener(topics = "order-events")
    public void sendNotification(String json) {
        OrderCreatedEvent event = JsonUtils.fromJson(json, OrderCreatedEvent.class);
        notificationService.send(event.getUserId(), "订单创建成功");
    }
}
```

## 4. 事件溯源

```java
// 保存所有事件
@Service
public class EventStore {
    
    public void save(DomainEvent event) {
        EventRecord record = new EventRecord();
        record.setEventId(event.getEventId());
        record.setEventType(event.getEventType());
        record.setData(JsonUtils.toJson(event));
        record.setTimestamp(event.getTimestamp());
        eventDao.insert(record);
    }
    
    // 重放事件恢复状态
    public Order rebuild(String orderId) {
        List<EventRecord> events = eventDao.findByOrderId(orderId);
        Order order = new Order();
        for (EventRecord event : events) {
            order.apply(event);  // 应用事件
        }
        return order;
    }
}
```

## 关键要点
1. **事件设计**：包含必要信息，自描述
2. **事件发布**：业务操作后发布事件
3. **事件消费**：多个服务独立消费
4. **事件溯源**：保存所有事件，可重放
5. **最终一致性**：异步处理，最终一致

## 参考资料
1. [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)

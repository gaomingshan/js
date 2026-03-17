# 事件总线架构设计

## 概述

事件总线是事件驱动架构的核心组件。本章介绍如何基于消息队列设计企业级事件总线。

---

## 1. 事件总线架构模式

### 1.1 中心化事件总线

```
服务A → 事件总线 → 服务B
服务C → 事件总线 → 服务D
```

**特点**：
- 统一事件管理
- 解耦服务
- 事件可追溯

### 1.2 架构设计

```java
@Component
public class EventBus {
    
    @Autowired
    private KafkaTemplate<String, DomainEvent> kafkaTemplate;
    
    public void publish(DomainEvent event) {
        String topic = event.getEventType();
        kafkaTemplate.send(topic, event);
    }
}
```

---

## 2. 事件定义与规范（Event Schema）

### 2.1 事件基类

```java
@Data
public abstract class DomainEvent {
    
    private String eventId;
    private String eventType;
    private String aggregateId;
    private Long timestamp;
    private String source;
    private Integer version;
    
    public DomainEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = System.currentTimeMillis();
        this.version = 1;
    }
}
```

### 2.2 具体事件

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class OrderCreatedEvent extends DomainEvent {
    
    private String orderId;
    private String userId;
    private BigDecimal amount;
    private List<OrderItem> items;
    
    public OrderCreatedEvent() {
        setEventType("OrderCreated");
    }
}
```

---

## 3. 事件路由与主题设计

### 3.1 Topic命名规范

```
格式：{domain}.{aggregate}.{event}

示例：
- order.order.created
- payment.payment.completed
- inventory.stock.reduced
```

### 3.2 事件路由

```java
@Component
public class EventRouter {
    
    private Map<String, String> routingRules = Map.of(
        "OrderCreated", "order.order.created",
        "PaymentCompleted", "payment.payment.completed"
    );
    
    public String route(DomainEvent event) {
        return routingRules.get(event.getEventType());
    }
}
```

---

## 4. 事件版本管理

### 4.1 版本策略

```java
// V1
public class OrderCreatedEventV1 extends DomainEvent {
    private String orderId;
    private BigDecimal amount;
}

// V2（新增字段）
public class OrderCreatedEventV2 extends DomainEvent {
    private String orderId;
    private BigDecimal amount;
    private String currency;  // 新增
    
    public OrderCreatedEventV2() {
        setVersion(2);
    }
}
```

### 4.2 版本兼容处理

```java
@KafkaListener(topics = "order.order.created")
public void handleOrderCreated(String message) {
    JSONObject json = JSON.parseObject(message);
    int version = json.getInteger("version");
    
    if (version == 1) {
        OrderCreatedEventV1 event = JSON.parseObject(message, OrderCreatedEventV1.class);
        handleV1(event);
    } else if (version == 2) {
        OrderCreatedEventV2 event = JSON.parseObject(message, OrderCreatedEventV2.class);
        handleV2(event);
    }
}
```

---

## 5. 事件溯源（Event Sourcing）

### 5.1 事件存储

```java
@Entity
public class EventStore {
    
    @Id
    private String eventId;
    private String aggregateId;
    private String eventType;
    private String eventData;
    private Long timestamp;
    private Integer version;
}

@Repository
public interface EventStoreRepository extends JpaRepository<EventStore, String> {
    List<EventStore> findByAggregateIdOrderByTimestamp(String aggregateId);
}
```

### 5.2 状态重建

```java
public class OrderAggregate {
    
    private String orderId;
    private OrderStatus status;
    private BigDecimal amount;
    
    public void rebuild(List<DomainEvent> events) {
        for (DomainEvent event : events) {
            apply(event);
        }
    }
    
    private void apply(DomainEvent event) {
        if (event instanceof OrderCreatedEvent) {
            OrderCreatedEvent e = (OrderCreatedEvent) event;
            this.orderId = e.getOrderId();
            this.amount = e.getAmount();
            this.status = OrderStatus.CREATED;
        } else if (event instanceof OrderPaidEvent) {
            this.status = OrderStatus.PAID;
        }
    }
}
```

---

## 6. CQRS 模式

### 6.1 命令端

```java
@Service
public class OrderCommandService {
    
    @Autowired
    private EventBus eventBus;
    
    public void createOrder(CreateOrderCommand command) {
        // 1. 验证命令
        validate(command);
        
        // 2. 创建订单
        Order order = new Order(command);
        
        // 3. 发布事件
        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setOrderId(order.getId());
        event.setAmount(order.getAmount());
        
        eventBus.publish(event);
    }
}
```

### 6.2 查询端

```java
@Service
public class OrderQueryService {
    
    @Autowired
    private OrderReadRepository readRepository;
    
    @KafkaListener(topics = "order.order.created")
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 更新读模型
        OrderReadModel model = new OrderReadModel();
        model.setOrderId(event.getOrderId());
        model.setAmount(event.getAmount());
        model.setStatus("CREATED");
        
        readRepository.save(model);
    }
    
    public OrderReadModel getOrder(String orderId) {
        return readRepository.findById(orderId).orElse(null);
    }
}
```

---

## 7. 事件总线的最佳实践

### 7.1 事件设计原则

```
1. 事件不可变
2. 事件包含完整信息
3. 事件语义清晰
4. 版本化管理
5. 幂等处理
```

### 7.2 事件处理模式

```java
@Component
public class OrderEventHandler {
    
    @Transactional
    @KafkaListener(topics = "order.order.created")
    @Idempotent(key = "#event.eventId")
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 1. 幂等检查
        if (isProcessed(event.getEventId())) {
            return;
        }
        
        // 2. 处理事件
        processEvent(event);
        
        // 3. 记录处理状态
        markAsProcessed(event.getEventId());
    }
}
```

---

## 关键要点

1. **事件规范**：统一事件定义和命名
2. **版本管理**：向后兼容的版本演进
3. **事件溯源**：保存所有事件，支持状态重建
4. **CQRS**：分离命令和查询
5. **幂等处理**：保证事件不重复处理

---

## 参考资料

1. [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
2. [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
3. [CQRS](https://martinfowler.com/bliki/CQRS.html)

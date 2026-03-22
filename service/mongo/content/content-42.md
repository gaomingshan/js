# 分布式事务替代方案

## 概述

微服务架构中，跨服务的数据一致性是最大挑战之一。MongoDB 多文档事务只能保证单服务内的一致性，跨服务场景需要 Saga 模式、Outbox Pattern 等替代方案。

---

## MongoDB 多文档事务的边界

```
✅ MongoDB 事务能解决的：
  - 同一副本集/分片集群内的多集合原子操作
  - 订单创建 + 库存扣减（同一 MongoDB 实例）

❌ MongoDB 事务无法解决的：
  - 跨微服务（不同 MongoDB 实例）的数据一致性
  - MongoDB + MySQL 的混合事务
  - 涉及外部系统（支付网关、物流系统）的事务
```

---

## Saga 模式

Saga 将长事务拆分为一系列本地事务，每步失败时执行**补偿事务**（Compensating Transaction）。

### 编排式 Saga（Choreography）

```
服务间通过事件驱动，无中心协调者

订单服务          库存服务          支付服务
   │                  │                 │
   ├─ 创建订单 ────────►                 │
   │  发布 OrderCreated                 │
   │                  │                 │
   │           ◄─ 扣减库存              │
   │           发布 StockReserved        │
   │                  │                 │
   │                  │        ◄─ 扣款  │
   │                  │        发布 PaymentSuccess
   │                  │                 │
   ◄─ 确认订单 ─────────────────────────┘

补偿流程（支付失败）：
   支付服务发布 PaymentFailed
   → 库存服务监听，释放库存，发布 StockReleased
   → 订单服务监听，取消订单
```

```java
// 订单服务：创建订单并发布事件
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Transactional
    public Order createOrder(CreateOrderRequest req) {
        Order order = Order.builder()
            .orderId(UUID.randomUUID().toString())
            .userId(req.getUserId())
            .status(OrderStatus.PENDING)
            .build();
        order = orderRepository.save(order);

        // 发布领域事件（通过 MQ 广播）
        eventPublisher.publishEvent(new OrderCreatedEvent(order));
        return order;
    }

    // 监听支付成功事件
    @EventListener
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        orderRepository.findByOrderId(event.getOrderId())
            .ifPresent(order -> {
                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);
            });
    }

    // 监听支付失败事件，执行补偿
    @EventListener
    public void onPaymentFailed(PaymentFailedEvent event) {
        orderRepository.findByOrderId(event.getOrderId())
            .ifPresent(order -> {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            });
    }
}
```

### 编排式 Saga（Orchestration）

```
中心协调者（Saga Orchestrator）控制整个流程

Saga Orchestrator
   │
   ├── Step1: 调用订单服务.创建订单
   │          ├── 成功 → Step2
   │          └── 失败 → 结束（无需补偿）
   │
   ├── Step2: 调用库存服务.扣减库存
   │          ├── 成功 → Step3
   │          └── 失败 → 补偿Step1（取消订单）
   │
   └── Step3: 调用支付服务.发起支付
              ├── 成功 → Saga 完成
              └── 失败 → 补偿Step2（释放库存）+ 补偿Step1（取消订单）
```

---

## 本地消息表（Outbox Pattern）

解决「本地事务提交 + 消息发送」的原子性问题。

```
问题：
  事务提交后发 MQ 消息
  → 发送 MQ 失败 → 事务已提交但消息丢失
  → 先发 MQ 再提交事务 → MQ 成功但事务回滚 → 消息多发

Outbox Pattern 解决：
  在同一事务中：写业务数据 + 写 outbox 表
  独立进程：扫描 outbox 表，发送 MQ 消息
  发送成功后标记 outbox 记录为已发送
```

### MongoDB + Outbox 实现

```java
// Outbox 集合
@Document(collection = "outbox_events")
@Data
public class OutboxEvent {
    @Id
    private String id;
    private String aggregateId;      // 业务 ID
    private String aggregateType;   // 业务类型（Order）
    private String eventType;       // 事件类型（OrderCreated）
    private String payload;         // 事件内容（JSON）
    private OutboxStatus status;    // PENDING / SENT
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
}

// 在同一事务中写订单 + 写 outbox
@Transactional
public Order createOrder(CreateOrderRequest req) {
    // 1. 创建订单
    Order order = orderRepository.save(buildOrder(req));

    // 2. 写 Outbox（同一事务，原子性保证）
    OutboxEvent event = OutboxEvent.builder()
        .aggregateId(order.getOrderId())
        .aggregateType("Order")
        .eventType("OrderCreated")
        .payload(objectMapper.writeValueAsString(order))
        .status(OutboxStatus.PENDING)
        .createdAt(LocalDateTime.now())
        .build();
    outboxRepository.save(event);

    return order;
}

// Outbox 处理器（独立定时任务或 Change Streams 驱动）
@Scheduled(fixedDelay = 1000)
public void processOutbox() {
    List<OutboxEvent> pendingEvents = outboxRepository
        .findByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING, PageRequest.of(0, 100));

    for (OutboxEvent event : pendingEvents) {
        try {
            // 发送到 MQ
            mqProducer.send(event.getEventType(), event.getPayload());
            // 标记已发送
            event.setStatus(OutboxStatus.SENT);
            event.setSentAt(LocalDateTime.now());
            outboxRepository.save(event);
        } catch (Exception e) {
            log.error("发送 Outbox 事件失败: {}", event.getId(), e);
            // 失败自动重试（下次定时任务）
        }
    }
}
```

---

## 幂等消费与消息去重

```java
// 消费者端：幂等处理
@KafkaListener(topics = "order-events")
public void handleOrderEvent(String message) {
    OrderCreatedEvent event = parse(message);
    String messageId = event.getMessageId();

    // 幂等检查：检查消息是否已处理
    boolean alreadyProcessed = processedMessageRepository
        .existsByMessageId(messageId);

    if (alreadyProcessed) {
        log.info("消息已处理，跳过: {}", messageId);
        return;
    }

    // 处理业务逻辑
    inventoryService.reserveStock(event.getOrderId(), event.getItems());

    // 标记为已处理
    processedMessageRepository.save(ProcessedMessage.of(messageId));
}
```

---

## 企业案例：跨服务订单支付一致性

```
最终解决方案（推荐）：

1. 订单服务：创建订单 + 写 Outbox（同一事务）
2. Outbox 处理器：发布 OrderCreated 到 Kafka
3. 库存服务：消费事件，扣减库存（幂等），发布 StockReserved
4. 支付服务：消费事件，发起支付，发布 PaymentResult
5. 订单服务：消费 PaymentResult，更新订单状态

故障恢复：
  - 任何步骤失败 → 执行补偿事务（发布补偿事件）
  - 消息重复 → 幂等处理忽略
  - 服务宕机重启 → 从 MQ offset 继续消费

最终一致性时间：通常 < 5 秒
```

---

## 总结

- MongoDB 事务只解决单服务内的一致性
- Saga 模式（编排式 + 协调式）解决跨服务一致性，接受最终一致
- Outbox Pattern 解决「本地事务 + 消息发送」的原子性
- 消费者端必须实现幂等，防止消息重复处理
- 补偿事务是 Saga 的核心，每个步骤都需要设计对应的补偿

**下一步**：统一日志与审计链路。

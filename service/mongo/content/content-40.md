# 微服务中 MongoDB 的边界与职责

## 概述

在微服务架构中，MongoDB 的使用需要遵循清晰的边界原则。错误的跨服务数据访问模式会导致服务耦合、一致性问题和运维复杂度上升。

---

## 核心原则：每服务独享数据存储

```
❌ 错误：多个服务共享同一个 MongoDB 实例/数据库

服务A ──┐
服务B ──┤── 共享 MongoDB ecommerce 数据库
服务C ──┘

问题：
  - 服务间通过数据库隐性耦合
  - 一个服务改表结构影响所有服务
  - 无法独立部署和扩展

✅ 正确：每个服务独占自己的数据库

订单服务  ──── orders-db（MongoDB）
用户服务  ──── users-db（MongoDB）
库存服务  ──── inventory-db（MongoDB）
支付服务  ──── payment-db（MySQL，强事务）
```

---

## 独享数据库的实现方式

### 方式1：独立 MongoDB 实例（推荐生产）

```yaml
# 订单服务
spring.data.mongodb.uri: mongodb://order-mongo:27017/orders

# 用户服务
spring.data.mongodb.uri: mongodb://user-mongo:27017/users
```

**优势**：完全隔离，故障互不影响，资源独立配置
**成本**：多套副本集，运维成本高

### 方式2：共享实例，独立数据库

```yaml
# 订单服务
spring.data.mongodb.uri: mongodb://shared-mongo:27017/orders

# 用户服务
spring.data.mongodb.uri: mongodb://shared-mongo:27017/users
```

**优势**：资源共享，成本低
**劣势**：实例级别故障影响所有服务，需用户权限隔离

---

## DDD 与 MongoDB 的映射

```
领域驱动设计（DDD）概念 → MongoDB 映射

聚合根（Aggregate Root）→ 文档（Document）
聚合（Aggregate）       → 嵌套文档结构
值对象（Value Object）  → 嵌入子文档
领域事件（Domain Event）→ Change Streams 变更事件
仓储（Repository）      → MongoRepository 接口
界限上下文（BC）        → 独立的 MongoDB 数据库
```

```java
// 订单聚合根（Order Aggregate）
@Document(collection = "orders")
public class Order {  // 聚合根
    @Id
    private String id;
    private String orderId;
    private UserId userId;           // 值对象（嵌入）
    private List<OrderItem> items;   // 聚合内实体（嵌入）
    private ShippingAddress address; // 值对象（嵌入）
    private Money totalAmount;       // 值对象（嵌入）
    private OrderStatus status;

    // 聚合根负责维护不变性
    public void confirm() {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("只有待确认订单可以确认");
        }
        this.status = OrderStatus.CONFIRMED;
        // 发布领域事件...
    }
}
```

---

## CQRS 模式在 MongoDB 中的实践

```
CQRS = Command Query Responsibility Segregation
命令（写）和查询（读）使用不同的模型

写模型（Command Model）：
  - 规范化结构，保证数据一致性
  - 走 Primary 节点
  - 写完发布领域事件

读模型（Query Model）：
  - 反范式化，为查询优化
  - 走 Secondary 节点或独立读库
  - 通过事件异步更新
```

```java
// 写模型（规范化）
@Document(collection = "orders")
public class Order {
    private String orderId;
    private String userId;      // 只存 userId，不冗余用户信息
    private OrderStatus status;
    private BigDecimal amount;
}

// 读模型（反范式化，为列表页优化）
@Document(collection = "order_views")
public class OrderView {
    private String orderId;
    private String userId;
    private String userName;      // 冗余用户名
    private String userAvatar;    // 冗余头像
    private OrderStatus status;
    private BigDecimal amount;
    private String productName;   // 冗余商品名（首个商品）
    private LocalDateTime createdAt;
}

// 通过领域事件同步读模型
@EventListener
public void onOrderCreated(OrderCreatedEvent event) {
    Order order = event.getOrder();
    User user = userService.getById(order.getUserId());  // 调用用户服务
    OrderView view = buildOrderView(order, user);
    orderViewRepository.save(view);
}
```

---

## 跨服务查询替代方案

### 问题：如何实现跨服务数据查询？

```
❌ 错误做法：直接跨数据库查询
  订单服务直接连接 users-db 查询用户信息
  → 破坏服务边界

✅ 替代方案：
```

### 方案1：数据冗余（扩展引用模式）

```java
// 创建订单时，冗余存储必要的用户信息
@Document(collection = "orders")
public class Order {
    private String orderId;
    // 冗余用户快照（下单时的用户信息）
    private UserSnapshot user;  // { userId, name, phone }
    // ...
}

// 优势：无需跨服务查询，数据是下单时的快照（符合业务语义）
// 劣势：用户信息变更不会同步到历史订单（通常符合业务需求）
```

### 方案2：API 组合（BFF 层）

```java
// BFF（Backend for Frontend）层组合多个服务数据
@Service
public class OrderListBff {

    @Autowired
    private OrderServiceClient orderClient;
    @Autowired
    private UserServiceClient userClient;

    public List<OrderListVO> getOrderList(String userId, int page) {
        // 1. 查订单列表
        List<Order> orders = orderClient.findByUserId(userId, page);

        // 2. 批量获取用户信息（减少 N+1 问题）
        Set<String> userIds = orders.stream()
            .map(Order::getUserId).collect(Collectors.toSet());
        Map<String, User> userMap = userClient.batchGetByIds(userIds);

        // 3. 组合
        return orders.stream()
            .map(o -> buildVO(o, userMap.get(o.getUserId())))
            .collect(Collectors.toList());
    }
}
```

### 方案3：读模型（事件驱动异步）

```
订单创建 → 发布 OrderCreated 事件
                    ↓
         BFF 服务监听事件
                    ↓
         调用用户服务获取用户信息
                    ↓
         写入 order_list_view 集合（MongoDB）

查询时直接查 order_list_view，无需跨服务
```

---

## 服务间数据一致性的权衡

```
强一致性 ← ─ ─ ─ ─ ─ ─ ─ → 最终一致性

单体事务         Saga 模式          事件驱动
（无法跨服务）   （补偿事务）       （异步，高可用）

建议：
  - 核心业务（支付）：Saga + 补偿
  - 读取场景：数据冗余 + 最终一致
  - 统计报表：事件驱动更新读模型
```

---

## 总结

- 每个微服务独占 MongoDB 数据库，禁止跨服务共享
- DDD 聚合根映射为文档，界限上下文对应独立数据库
- CQRS：写模型规范化，读模型反范式化
- 跨服务查询通过数据冗余、API 组合、读模型三种方式替代
- 服务间一致性通过 Saga 或事件驱动实现，接受最终一致性

**下一步**：配置中心与服务发现集成。

# 第 23 章：ApplicationEvent 事件机制

> **学习目标**：掌握 Spring 事件驱动编程模型  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

Spring 基于**观察者模式**实现了事件发布-订阅机制。

**核心组件**：
- **ApplicationEvent**：事件
- **ApplicationListener**：监听器
- **ApplicationEventPublisher**：事件发布器

---

## 2. 自定义事件

```java
// 1. 定义事件
public class UserRegisteredEvent extends ApplicationEvent {
    private final User user;
    
    public UserRegisteredEvent(Object source, User user) {
        super(source);
        this.user = user;
    }
    
    public User getUser() {
        return user;
    }
}

// 2. 发布事件
@Service
public class UserService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void register(User user) {
        // 注册用户
        userDao.save(user);
        
        // 发布事件
        eventPublisher.publishEvent(new UserRegisteredEvent(this, user));
    }
}

// 3. 监听事件
@Component
public class UserRegisteredListener {
    
    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        User user = event.getUser();
        // 发送欢迎邮件
        emailService.sendWelcomeEmail(user.getEmail());
    }
}
```

---

## 3. 监听器实现方式

### 3.1 @EventListener 注解

```java
@Component
public class OrderEventListener {
    
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 处理订单创建事件
    }
    
    @EventListener(condition = "#event.order.amount > 1000")
    public void handleLargeOrder(OrderCreatedEvent event) {
        // 只处理金额大于1000的订单
    }
    
    @Async
    @EventListener
    public void handleOrderAsync(OrderCreatedEvent event) {
        // 异步处理
    }
}
```

### 3.2 实现 ApplicationListener 接口

```java
@Component
public class UserRegisteredListener implements ApplicationListener<UserRegisteredEvent> {
    
    @Override
    public void onApplicationEvent(UserRegisteredEvent event) {
        User user = event.getUser();
        // 处理事件
    }
}
```

---

## 4. 事件执行顺序

```java
@Component
public class OrderedListener {
    
    @EventListener
    @Order(1)
    public void handleFirst(UserRegisteredEvent event) {
        // 第一个执行
    }
    
    @EventListener
    @Order(2)
    public void handleSecond(UserRegisteredEvent event) {
        // 第二个执行
    }
}
```

---

## 5. 应用场景

### 场景 1：用户注册流程解耦

```java
// 发布事件
@Service
public class UserService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public void register(User user) {
        userDao.save(user);
        eventPublisher.publishEvent(new UserRegisteredEvent(this, user));
    }
}

// 监听器1：发送欢迎邮件
@Component
public class WelcomeEmailListener {
    @Async
    @EventListener
    public void sendWelcomeEmail(UserRegisteredEvent event) {
        emailService.send(event.getUser().getEmail(), "欢迎注册");
    }
}

// 监听器2：赠送积分
@Component
public class PointsListener {
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void awardPoints(UserRegisteredEvent event) {
        pointsService.award(event.getUser().getId(), 100);
    }
}

// 监听器3：发送短信
@Component
public class SmsListener {
    @Async
    @EventListener
    public void sendSms(UserRegisteredEvent event) {
        smsService.send(event.getUser().getPhone(), "注册成功");
    }
}
```

### 场景 2：订单状态变更通知

```java
@Service
public class OrderService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public void pay(Long orderId) {
        Order order = orderDao.findById(orderId);
        order.setStatus(OrderStatus.PAID);
        orderDao.update(order);
        
        eventPublisher.publishEvent(new OrderPaidEvent(this, order));
    }
}

@Component
public class OrderPaidListener {
    
    @EventListener
    public void reduceInventory(OrderPaidEvent event) {
        // 扣减库存
        inventoryService.reduce(event.getOrder());
    }
    
    @EventListener
    public void notifyUser(OrderPaidEvent event) {
        // 通知用户
        notificationService.notify(event.getOrder().getUserId(), "支付成功");
    }
}
```

---

**上一章** ← [第 22 章：Environment 环境抽象](./content-22.md)  
**下一章** → [第 24 章：事件发布机制源码分析](./content-24.md)  
**返回目录** → [学习大纲](../content-outline.md)

# 第 24 章：事件发布机制源码分析

> **学习目标**：深入理解 Spring 事件发布的底层实现  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心组件

**ApplicationEventMulticaster**：事件广播器，负责事件的发布和监听器管理。

```java
public interface ApplicationEventMulticaster {
    void addApplicationListener(ApplicationListener<?> listener);
    void addApplicationListenerBean(String listenerBeanName);
    void removeApplicationListener(ApplicationListener<?> listener);
    void removeApplicationListenerBean(String listenerBeanName);
    void removeAllListeners();
    void multicastEvent(ApplicationEvent event);
    void multicastEvent(ApplicationEvent event, ResolvableType eventType);
}
```

---

## 2. SimpleApplicationEventMulticaster

```java
public class SimpleApplicationEventMulticaster extends AbstractApplicationEventMulticaster {
    
    @Nullable
    private Executor taskExecutor;
    
    @Override
    public void multicastEvent(final ApplicationEvent event, @Nullable ResolvableType eventType) {
        ResolvableType type = (eventType != null ? eventType : resolveDefaultEventType(event));
        Executor executor = getTaskExecutor();
        
        // 获取所有监听器
        for (ApplicationListener<?> listener : getApplicationListeners(event, type)) {
            if (executor != null) {
                // 异步执行
                executor.execute(() -> invokeListener(listener, event));
            } else {
                // 同步执行
                invokeListener(listener, event);
            }
        }
    }
    
    protected void invokeListener(ApplicationListener<?> listener, ApplicationEvent event) {
        ErrorHandler errorHandler = getErrorHandler();
        if (errorHandler != null) {
            try {
                doInvokeListener(listener, event);
            } catch (Throwable err) {
                errorHandler.handleError(err);
            }
        } else {
            doInvokeListener(listener, event);
        }
    }
    
    @SuppressWarnings({"rawtypes", "unchecked"})
    private void doInvokeListener(ApplicationListener listener, ApplicationEvent event) {
        try {
            listener.onApplicationEvent(event);
        } catch (ClassCastException ex) {
            // Log and ignore
        }
    }
}
```

---

## 3. 监听器注册

```java
public abstract class AbstractApplicationEventMulticaster implements ApplicationEventMulticaster {
    
    private final ListenerRetriever defaultRetriever = new ListenerRetriever(false);
    
    final Map<ListenerCacheKey, ListenerRetriever> retrieverCache = new ConcurrentHashMap<>(64);
    
    @Override
    public void addApplicationListener(ApplicationListener<?> listener) {
        synchronized (this.retrievalMutex) {
            this.defaultRetriever.applicationListeners.add(listener);
            this.retrieverCache.clear();
        }
    }
    
    protected Collection<ApplicationListener<?>> getApplicationListeners(
            ApplicationEvent event, ResolvableType eventType) {
        
        Object source = event.getSource();
        Class<?> sourceType = (source != null ? source.getClass() : null);
        ListenerCacheKey cacheKey = new ListenerCacheKey(eventType, sourceType);
        
        // 从缓存获取
        ListenerRetriever retriever = this.retrieverCache.get(cacheKey);
        if (retriever != null) {
            return retriever.getApplicationListeners();
        }
        
        // 检索匹配的监听器
        retriever = new ListenerRetriever(true);
        Collection<ApplicationListener<?>> listeners =
            retrieveApplicationListeners(eventType, sourceType, retriever);
        this.retrieverCache.put(cacheKey, retriever);
        
        return listeners;
    }
}
```

---

## 4. 事件发布流程

```
publishEvent(event)
    ↓
ApplicationEventPublisher.publishEvent()
    ↓
ApplicationEventMulticaster.multicastEvent()
    ↓
获取所有监听器 getApplicationListeners()
    ├─> 从缓存获取
    └─> 过滤匹配的监听器
    ↓
遍历监听器
    ├─> 同步执行：invokeListener()
    └─> 异步执行：executor.execute()
    ↓
listener.onApplicationEvent(event)
```

---

## 5. 事务事件监听

```java
@Component
public class OrderEventListener {
    
    // 事务提交后执行
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAfterCommit(OrderCreatedEvent event) {
        // 事务成功提交后执行
        sendNotification(event.getOrder());
    }
    
    // 事务回滚后执行
    @TransactionalEventListener(phase = TransactionPhase.AFTER_ROLLBACK)
    public void handleAfterRollback(OrderCreatedEvent event) {
        // 事务回滚后执行
        logFailure(event.getOrder());
    }
    
    // 事务完成后执行（无论成功还是失败）
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMPLETION)
    public void handleAfterCompletion(OrderCreatedEvent event) {
        // 清理资源
    }
}
```

---

## 6. 应用场景

### 场景 1：事务事件监听

```java
@Service
public class OrderService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public void createOrder(Order order) {
        orderDao.save(order);
        
        // 发布事件（此时事务还未提交）
        eventPublisher.publishEvent(new OrderCreatedEvent(this, order));
        
        // 如果这里抛异常，事务会回滚
    }
}

@Component
public class OrderEventListener {
    
    // 事务提交后才执行，确保订单已保存
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendNotification(OrderCreatedEvent event) {
        // 发送通知（此时订单已经成功保存到数据库）
        notificationService.send(event.getOrder());
    }
}
```

---

**上一章** ← [第 23 章：ApplicationEvent 事件机制](./content-23.md)  
**下一章** → [第 25 章：@Configuration 配置类](./content-25.md)  
**返回目录** → [学习大纲](../content-outline.md)

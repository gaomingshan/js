# Spring Messaging 源码指引

> spring-messaging 提供消息传递抽象，支持 STOMP、WebSocket、AMQP 等协议。

---

## 1. 消息通道（MessageChannel）

### 核心接口
- **MessageChannel** - 消息通道接口
  - `send()` - 发送消息
- **SubscribableChannel** - 可订阅通道接口
  - `subscribe()` - 订阅消息
  - `unsubscribe()` - 取消订阅
- **PollableChannel** - 可轮询通道接口
  - `receive()` - 接收消息

### 核心实现
- **PublishSubscribeChannel** - 发布-订阅通道
- **ExecutorSubscribableChannel** - 异步订阅通道
- **QueueChannel** - 队列通道
- **PriorityChannel** - 优先级通道
- **RendezvousChannel** - 会合通道（同步）
- **DirectChannel** - 直连通道（默认）

### 设计目的
提供统一的消息传递抽象，解耦消息发送者和接收者。

### 使用限制与风险
- DirectChannel 在发送者线程中同步执行（性能最优）
- ExecutorSubscribableChannel 异步执行（解耦但有延迟）
- QueueChannel 支持缓冲但需手动轮询

---

## 2. 消息处理（MessageHandler）

### 核心接口
- **MessageHandler** - 消息处理器接口
  - `handleMessage()` - 处理消息

### 设计目的
定义消息处理逻辑的统一接口。

### 使用限制与风险
- handleMessage 方法不应阻塞
- 异常处理需谨慎（可能丢消息）

---

## 3. 消息转换（MessageConverter）

### 核心接口
- **MessageConverter** - 消息转换器接口
  - `toMessage()` - 对象转消息
  - `fromMessage()` - 消息转对象

### 核心实现
- **SimpleMessageConverter** - 简单转换器
- **MappingJackson2MessageConverter** - JSON 转换器
- **ByteArrayMessageConverter** - 字节数组转换器
- **StringMessageConverter** - 字符串转换器
- **GenericMessageConverter** - 通用转换器
- **CompositeMessageConverter** - 组合转换器

### 设计目的
抽象消息格式转换，支持多种序列化方式。

### 使用限制与风险
- 转换器需与消费者协商一致
- JSON 转换器依赖 Jackson
- 需配置正确的 Content-Type

---

## 4. 消息拦截器（ChannelInterceptor）

### 核心接口
- **ChannelInterceptor** - 通道拦截器接口
  - `preSend()` - 发送前拦截
  - `postSend()` - 发送后拦截
  - `afterSendCompletion()` - 发送完成后拦截
  - `preReceive()` - 接收前拦截
  - `postReceive()` - 接收后拦截
  - `afterReceiveCompletion()` - 接收完成后拦截

### 核心实现
- **ExecutorChannelInterceptor** - 异步通道拦截器
- **ImmutableMessageChannelInterceptor** - 不可变消息拦截器

### 设计目的
在消息发送和接收的各个阶段插入自定义逻辑（日志、监控、安全等）。

### 使用限制与风险
- preSend 返回 null 会取消发送
- 拦截器异常会中断消息传递
- 拦截器顺序很重要

---

## 5. STOMP 协议支持

### 核心类
- **StompCommand** - STOMP 命令枚举
- **StompHeaderAccessor** - STOMP 消息头访问器
- **StompBrokerRelayMessageHandler** - STOMP 代理中继处理器
- **SimpleBrokerMessageHandler** - 简单代理处理器

### STOMP 命令
- **CONNECT** - 连接
- **SUBSCRIBE** - 订阅
- **UNSUBSCRIBE** - 取消订阅
- **SEND** - 发送消息
- **MESSAGE** - 接收消息
- **DISCONNECT** - 断开连接

### 设计目的
支持 STOMP 协议，实现浏览器与服务器的实时双向通信。

### 使用限制与风险
- SimpleBrokerMessageHandler 适合简单场景（内存代理）
- StompBrokerRelayMessageHandler 适合生产环境（外部代理如 RabbitMQ）
- STOMP 是文本协议，性能略低于二进制协议

---

## 6. AMQP 协议支持

### 集成 spring-amqp
- RabbitMQ 等消息队列支持
- 通过 spring-rabbit 模块集成

### 设计目的
支持 AMQP 协议的消息队列。

### 使用限制与风险
- 需额外依赖 spring-rabbit 或 spring-kafka
- 配置复杂度较高

---

## 7. 消息分发与路由

### 路由策略
- **DirectChannel** - 轮询分发到订阅者
- **PublishSubscribeChannel** - 广播到所有订阅者

### 自定义路由
- 实现 MessageRouter 接口
- 配置路由规则

### 设计目的
灵活控制消息分发策略。

### 使用限制与风险
- 路由逻辑需高效（避免阻塞）
- 路由失败需处理（死信、重试等）

---

## 8. 消息优先级与分组

### PriorityChannel
```java
PriorityChannel channel = new PriorityChannel();
channel.send(MessageBuilder.withPayload("Low priority").setPriority(1).build());
channel.send(MessageBuilder.withPayload("High priority").setPriority(10).build());
```

### 消息分组
- 通过消息头携带分组信息
- 自定义分发策略

### 设计目的
支持消息优先级处理，确保重要消息优先执行。

### 使用限制与风险
- 优先级队列性能略低
- 需合理设置优先级（避免饥饿）

---

## 9. 消息头与元数据（MessageHeaders）

### 核心类
- **MessageHeaders** - 消息头（不可变 Map）
- **MessageHeaderAccessor** - 消息头访问器（可变）
- **NativeMessageHeaderAccessor** - 原生消息头访问器

### 标准消息头
- **ID** - 消息 ID（UUID）
- **TIMESTAMP** - 时间戳
- **CONTENT_TYPE** - 内容类型
- **REPLY_CHANNEL** - 回复通道
- **ERROR_CHANNEL** - 错误通道

### 设计目的
携带消息元数据，支持路由、追踪、回复等功能。

### 使用限制与风险
- MessageHeaders 不可变，修改需通过 MessageHeaderAccessor
- 自定义消息头需避免与标准头冲突
- 消息头过多影响性能

---

## 10. 消息端点与适配器

### 核心接口
- **MessageProducerSupport** - 消息生产者支持基类
- **MessageEndpoint** - 消息端点接口

### 适配器
- **MessageSourcePollingTemplate** - 消息源轮询模板
- **PollingConsumer** - 轮询消费者

### 设计目的
抽象消息生产和消费的端点逻辑。

### 使用限制与风险
- 轮询消费需配置轮询间隔
- 轮询频率影响实时性和性能

---

## 11. SimpMessagingTemplate

### 核心类
- **SimpMessagingTemplate** - STOMP 消息模板
- **SimpMessageSendingOperations** - STOMP 消息发送操作接口

### 使用示例
```java
@Autowired
private SimpMessagingTemplate messagingTemplate;

public void sendToUser(String username, String message) {
    messagingTemplate.convertAndSendToUser(username, "/queue/messages", message);
}

public void broadcast(String message) {
    messagingTemplate.convertAndSend("/topic/news", message);
}
```

### 设计目的
简化 STOMP 消息发送，支持用户级消息和广播。

### 使用限制与风险
- 需配合 WebSocket 使用
- 用户级消息需用户身份验证
- 广播消息发送给所有订阅者

---

## 12. @MessageMapping 注解支持

### 核心注解
- **@MessageMapping** - 消息映射注解
- **@SendTo** - 发送到指定目的地
- **@SendToUser** - 发送给当前用户
- **@SubscribeMapping** - 订阅映射注解

### 使用示例
```java
@Controller
public class ChatController {
    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage send(ChatMessage message) {
        return message;
    }
    
    @MessageMapping("/private")
    @SendToUser("/queue/reply")
    public String sendToUser(String message) {
        return "Reply: " + message;
    }
    
    @SubscribeMapping("/initial")
    public List<ChatMessage> getInitialMessages() {
        return chatService.getRecentMessages();
    }
}
```

### 设计目的
通过注解声明消息处理方法，简化 STOMP 消息处理。

### 使用限制与风险
- 需启用 @EnableWebSocketMessageBroker
- @SendToUser 需用户身份验证
- @SubscribeMapping 在订阅时立即返回结果

---

## 13. 消息安全与鉴权

### 集成 Spring Security
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {
    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            .simpDestMatchers("/app/**").authenticated()
            .simpSubscribeDestMatchers("/user/**").authenticated()
            .anyMessage().denyAll();
    }
}
```

### 设计目的
保护 WebSocket 消息端点，确保只有授权用户可访问。

### 使用限制与风险
- 需配置 Spring Security
- 消息鉴权在消息处理前执行
- 需正确配置 STOMP 目的地权限

---

## 14. 错误处理

### 错误通道
```java
MessageChannel errorChannel = new PublishSubscribeChannel();
MessageBuilder.withPayload(message)
    .setErrorChannel(errorChannel)
    .build();
```

### @MessageExceptionHandler
```java
@Controller
public class ChatController {
    @MessageMapping("/chat")
    public ChatMessage send(ChatMessage message) {
        // 业务逻辑
    }
    
    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Exception ex) {
        return ex.getMessage();
    }
}
```

### 设计目的
统一处理消息处理异常，避免消息丢失。

### 使用限制与风险
- 错误通道需配置订阅者
- @MessageExceptionHandler 仅处理当前类的异常
- 异常信息可能包含敏感数据

---

## 📚 总结

spring-messaging 提供了完整的消息传递抽象：
- **MessageChannel**：消息通道抽象（同步、异步、优先级等）
- **MessageHandler**：消息处理器接口
- **MessageConverter**：消息格式转换（JSON、XML 等）
- **ChannelInterceptor**：消息拦截器
- **STOMP 支持**：WebSocket + STOMP 实时通信
- **SimpMessagingTemplate**：简化 STOMP 消息发送
- **@MessageMapping**：声明式消息处理
- **安全支持**：集成 Spring Security
- **错误处理**：统一异常处理机制

spring-messaging 广泛用于 WebSocket 实时通信、消息队列集成等场景。

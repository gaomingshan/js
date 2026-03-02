# Spring WebSocket 源码指引

> spring-websocket 提供 WebSocket 协议支持，实现浏览器与服务器的实时双向通信。

---

## 1. WebSocket 支持（WebSocketHandler）

### 核心接口
- **WebSocketHandler** - WebSocket 处理器接口
  - `afterConnectionEstablished()` - 连接建立后
  - `handleMessage()` - 处理消息
  - `handleTransportError()` - 处理传输错误
  - `afterConnectionClosed()` - 连接关闭后
- **WebSocketSession** - WebSocket 会话接口

### 核心实现
- **TextWebSocketHandler** - 文本消息处理器
- **BinaryWebSocketHandler** - 二进制消息处理器
- **AbstractWebSocketHandler** - WebSocket 处理器抽象基类

### 使用示例
```java
public class MyWebSocketHandler extends TextWebSocketHandler {
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        session.sendMessage(new TextMessage("Echo: " + payload));
    }
}
```

### 设计目的
提供 WebSocket 消息处理的抽象，支持文本和二进制消息。

### 使用限制与风险
- WebSocket 是长连接，需注意资源管理
- 消息处理应避免阻塞
- 需处理异常和连接断开

---

## 2. SockJS 与 STOMP 协议

### SockJS
- **SockJS** - WebSocket 降级方案（不支持 WebSocket 时使用轮询）
- **SockJsClient** - SockJS 客户端
- **SockJsService** - SockJS 服务

### STOMP
- **STOMP（Simple Text Oriented Messaging Protocol）** - 简单文本消息协议
- 提供发布-订阅模式
- 支持消息路由和过滤

### 配置示例
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins("*")
            .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }
}
```

### 设计目的
SockJS 提供 WebSocket 降级方案，STOMP 提供标准化的消息协议。

### 使用限制与风险
- SockJS 有性能开销（轮询模式）
- STOMP 是文本协议，二进制数据需 Base64 编码

---

## 3. WebSocket 处理器

### 注册处理器
```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new MyWebSocketHandler(), "/websocket")
            .setAllowedOrigins("*");
    }
}
```

### 设计目的
注册 WebSocket 处理器，定义 WebSocket 端点。

### 使用限制与风险
- 端点路径需唯一
- 需配置跨域（生产环境限制来源）

---

## 4. 握手拦截器（HandshakeInterceptor）

### 核心接口
- **HandshakeInterceptor** - 握手拦截器接口
  - `beforeHandshake()` - 握手前
  - `afterHandshake()` - 握手后

### 使用示例
```java
public class AuthHandshakeInterceptor implements HandshakeInterceptor {
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        // 认证逻辑
        String token = request.getHeaders().getFirst("Authorization");
        if (isValidToken(token)) {
            attributes.put("username", extractUsername(token));
            return true;
        }
        return false;
    }
    
    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // 握手后处理
    }
}
```

### 配置
```java
registry.addHandler(handler, "/ws")
    .addInterceptors(new AuthHandshakeInterceptor());
```

### 设计目的
在 WebSocket 握手阶段插入自定义逻辑（认证、日志等）。

### 使用限制与风险
- beforeHandshake 返回 false 会拒绝握手
- attributes 可用于传递数据到 WebSocketHandler

---

## 5. 会话管理（WebSocketSession）

### 核心接口
- **WebSocketSession** - WebSocket 会话接口
  - `sendMessage()` - 发送消息
  - `close()` - 关闭会话
  - `getAttributes()` - 获取属性
  - `getId()` - 获取会话 ID
  - `isOpen()` - 是否打开

### 会话管理示例
```java
private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

@Override
public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    sessions.put(session.getId(), session);
}

@Override
public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    sessions.remove(session.getId());
}

public void broadcast(String message) {
    TextMessage textMessage = new TextMessage(message);
    sessions.values().forEach(session -> {
        try {
            if (session.isOpen()) {
                session.sendMessage(textMessage);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    });
}
```

### 设计目的
管理 WebSocket 会话，支持消息发送和广播。

### 使用限制与风险
- 需线程安全的集合存储会话
- 连接断开需清理会话
- 发送消息可能抛异常（需处理）

---

## 6. 消息广播

### 广播到所有客户端
```java
@Autowired
private SimpMessagingTemplate messagingTemplate;

public void broadcast(String message) {
    messagingTemplate.convertAndSend("/topic/news", message);
}
```

### 发送给特定用户
```java
public void sendToUser(String username, String message) {
    messagingTemplate.convertAndSendToUser(username, "/queue/messages", message);
}
```

### 设计目的
简化消息发送，支持广播和点对点通信。

### 使用限制与风险
- 需配置消息代理
- 用户级消息需用户身份验证

---

## 7. 端点注册（WebSocketEndpoint）

### Servlet 标准注解
```java
@ServerEndpoint("/chat")
public class ChatEndpoint {
    @OnOpen
    public void onOpen(Session session) {
        // 连接打开
    }
    
    @OnMessage
    public void onMessage(String message, Session session) {
        // 接收消息
    }
    
    @OnClose
    public void onClose(Session session) {
        // 连接关闭
    }
    
    @OnError
    public void onError(Session session, Throwable error) {
        // 错误处理
    }
}
```

### 配置支持
```java
@Bean
public ServerEndpointExporter serverEndpointExporter() {
    return new ServerEndpointExporter();
}
```

### 设计目的
支持 JSR-356 标准 WebSocket 注解。

### 使用限制与风险
- @ServerEndpoint 不是 Spring Bean（无法注入依赖）
- 推荐使用 Spring WebSocket 抽象

---

## 8. WebSocket 安全

### Spring Security 集成
```java
@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {
    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            .simpDestMatchers("/app/**").authenticated()
            .simpSubscribeDestMatchers("/user/**").authenticated()
            .anyMessage().denyAll();
    }
    
    @Override
    protected boolean sameOriginDisabled() {
        return true; // 禁用同源检查（CSRF）
    }
}
```

### 设计目的
保护 WebSocket 端点，确保只有授权用户可访问。

### 使用限制与风险
- 需配置 Spring Security
- WebSocket 握手阶段认证
- STOMP 消息级鉴权

---

## 9. 消息分发与订阅

### STOMP 目的地
- **/topic** - 广播（一对多）
- **/queue** - 点对点（一对一）
- **/app** - 应用前缀（客户端发送到服务器）
- **/user** - 用户前缀（服务器发送给特定用户）

### 订阅示例（客户端）
```javascript
var stompClient = Stomp.over(new SockJS('/ws'));
stompClient.connect({}, function(frame) {
    // 订阅广播消息
    stompClient.subscribe('/topic/news', function(message) {
        console.log(message.body);
    });
    
    // 订阅用户消息
    stompClient.subscribe('/user/queue/messages', function(message) {
        console.log(message.body);
    });
    
    // 发送消息
    stompClient.send('/app/chat', {}, JSON.stringify({'message': 'Hello'}));
});
```

### 设计目的
支持发布-订阅模式，实现灵活的消息路由。

### 使用限制与风险
- 订阅路径需与服务端配置一致
- /user 路径需用户身份验证

---

## 10. WebSocket 事件监听

### 核心事件
- **SessionConnectEvent** - 连接建立事件
- **SessionConnectedEvent** - 连接完成事件
- **SessionSubscribeEvent** - 订阅事件
- **SessionUnsubscribeEvent** - 取消订阅事件
- **SessionDisconnectEvent** - 断开连接事件

### 事件监听示例
```java
@Component
public class WebSocketEventListener {
    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();
        // 处理连接事件
    }
    
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor headers = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headers.getSessionAttributes().get("username");
        // 处理断开连接事件
    }
}
```

### 设计目的
监听 WebSocket 生命周期事件，实现自定义逻辑。

### 使用限制与风险
- 事件监听器是同步执行的
- 避免在监听器中执行重操作

---

## 11. 心跳与连接保持

### 心跳配置
```java
@Override
public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.enableSimpleBroker("/topic", "/queue")
        .setHeartbeatValue(new long[]{10000, 10000}); // 10 秒心跳
}
```

### 客户端心跳
```javascript
stompClient.connect({}, function(frame) {
    // 心跳配置
}, function(error) {
    // 重连逻辑
});
```

### 设计目的
检测连接状态，及时发现断开连接。

### 使用限制与风险
- 心跳间隔需合理配置（太短影响性能，太长检测不及时）
- 客户端需实现重连逻辑

---

## 12. 消息代理

### 简单代理
```java
registry.enableSimpleBroker("/topic", "/queue");
```

### 外部代理（RabbitMQ）
```java
registry.enableStompBrokerRelay("/topic", "/queue")
    .setRelayHost("localhost")
    .setRelayPort(61613)
    .setClientLogin("guest")
    .setClientPasscode("guest");
```

### 设计目的
简单代理适合开发和小规模应用，外部代理适合生产环境和集群部署。

### 使用限制与风险
- 简单代理基于内存，单机部署
- 外部代理需安装 RabbitMQ、ActiveMQ 等消息中间件
- 外部代理支持集群和持久化

---

## 13. WebSocket 配置

### 配置选项
```java
@Override
public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
    registration
        .setMessageSizeLimit(128 * 1024) // 128KB
        .setSendBufferSizeLimit(512 * 1024) // 512KB
        .setSendTimeLimit(20 * 1000); // 20 秒
}
```

### 设计目的
配置 WebSocket 传输参数，优化性能和稳定性。

### 使用限制与风险
- 消息大小限制需根据业务调整
- 发送超时需合理配置

---

## 14. 错误处理

### 异常处理
```java
@Controller
public class WebSocketController {
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
统一处理 WebSocket 消息处理异常。

### 使用限制与风险
- 异常信息可能包含敏感数据
- 需正确配置错误消息目的地

---

## 15. 性能优化

### 优化建议
- 使用外部消息代理（生产环境）
- 合理配置心跳间隔
- 限制消息大小
- 使用连接池
- 异步处理消息
- 监控连接数和消息量

### 设计目的
提升 WebSocket 应用的性能和稳定性。

### 使用限制与风险
- WebSocket 是长连接，需注意资源消耗
- 高并发场景需压测和调优

---

## 📚 总结

spring-websocket 提供了完整的 WebSocket 支持：
- **WebSocketHandler**：WebSocket 消息处理
- **SockJS**：WebSocket 降级方案
- **STOMP**：标准化消息协议
- **握手拦截器**：HandshakeInterceptor
- **会话管理**：WebSocketSession
- **消息广播**：点对点和发布-订阅
- **安全支持**：集成 Spring Security
- **事件监听**：WebSocket 生命周期事件
- **心跳机制**：连接保持和检测
- **消息代理**：简单代理和外部代理

spring-websocket 适用于实时聊天、通知推送、协作编辑等需要实时双向通信的场景。

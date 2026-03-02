# Spring WebFlux 源码指引

> spring-webflux 是 Spring 5 引入的响应式 Web 框架，基于 Reactor 提供非阻塞异步编程模型。

---

## 1. 响应式 Web 框架（基于 Reactor）

### 核心概念
- **响应式编程** - 异步、非阻塞、事件驱动
- **Reactor** - 响应式流实现（Reactive Streams）
- **Backpressure（背压）** - 流量控制机制

### 核心类型
- **Mono<T>** - 0 或 1 个元素的异步序列
- **Flux<T>** - 0 到 N 个元素的异步序列

### 设计目的
提供高并发、低延迟的 Web 应用支持，充分利用多核 CPU 和异步 I/O。

### 使用限制与风险
- 学习曲线陡峭（响应式编程范式）
- 调试困难（异步堆栈）
- 生态系统相对 Spring MVC 较小
- 阻塞操作会破坏响应式优势

---

## 2. 路由与处理器（RouterFunction、HandlerFunction）

### 函数式端点
```java
@Configuration
public class RouterConfig {
    @Bean
    public RouterFunction<ServerResponse> route(UserHandler handler) {
        return RouterFunctions
            .route(GET("/users/{id}"), handler::getUser)
            .andRoute(GET("/users"), handler::listUsers)
            .andRoute(POST("/users"), handler::createUser)
            .andRoute(PUT("/users/{id}"), handler::updateUser)
            .andRoute(DELETE("/users/{id}"), handler::deleteUser);
    }
}

@Component
public class UserHandler {
    public Mono<ServerResponse> getUser(ServerRequest request) {
        Long id = Long.parseLong(request.pathVariable("id"));
        return userService.findById(id)
            .flatMap(user -> ServerResponse.ok().bodyValue(user))
            .switchIfEmpty(ServerResponse.notFound().build());
    }
    
    public Mono<ServerResponse> listUsers(ServerRequest request) {
        return ServerResponse.ok().body(userService.findAll(), User.class);
    }
}
```

### 设计目的
提供函数式编程风格的路由定义，更灵活、类型安全。

### 使用限制与风险
- 函数式端点不支持 @RequestMapping 等注解
- 需手动处理请求和响应
- 适合简单的 RESTful API

---

## 3. 响应式 Web 客户端（WebClient）

### WebClient 使用
```java
@Service
public class UserService {
    private final WebClient webClient;
    
    public UserService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.example.com").build();
    }
    
    public Mono<User> getUser(Long id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .bodyToMono(User.class);
    }
    
    public Flux<User> listUsers() {
        return webClient.get()
            .uri("/users")
            .retrieve()
            .bodyToFlux(User.class);
    }
    
    public Mono<User> createUser(User user) {
        return webClient.post()
            .uri("/users")
            .bodyValue(user)
            .retrieve()
            .bodyToMono(User.class);
    }
}
```

### 设计目的
提供非阻塞的 HTTP 客户端，替代 RestTemplate。

### 使用限制与风险
- WebClient 是响应式的，返回 Mono/Flux
- 需订阅才会真正执行请求
- 错误处理通过 onErrorResume、onErrorReturn 等

---

## 4. 非阻塞编程（Mono、Flux）

### Mono 操作
```java
Mono<User> user = userRepository.findById(id)
    .map(u -> { u.setName(u.getName().toUpperCase()); return u; })
    .flatMap(u -> userRepository.save(u))
    .defaultIfEmpty(new User())
    .doOnNext(u -> log.info("User: {}", u))
    .doOnError(e -> log.error("Error", e));
```

### Flux 操作
```java
Flux<User> users = userRepository.findAll()
    .filter(u -> u.getAge() > 18)
    .map(u -> new UserDTO(u))
    .take(10)
    .delayElements(Duration.ofMillis(100))
    .doOnComplete(() -> log.info("Done"));
```

### 设计目的
提供丰富的响应式操作符，实现复杂的异步流处理。

### 使用限制与风险
- Mono/Flux 是惰性的，需订阅才执行
- 错误会终止流（需正确处理）
- 避免阻塞操作（如 Thread.sleep、JDBC）

---

## 5. 响应式流支持（Reactive Streams）

### Reactive Streams 规范
- **Publisher<T>** - 发布者
- **Subscriber<T>** - 订阅者
- **Subscription** - 订阅
- **Processor<T, R>** - 处理器（Publisher + Subscriber）

### Reactor 实现
- Mono 和 Flux 都实现了 Publisher
- 支持背压（Backpressure）

### 设计目的
标准化响应式流接口，实现互操作性。

### 使用限制与风险
- 背压机制防止生产者过快，消费者过慢导致内存溢出
- 需理解 onNext、onComplete、onError 语义

---

## 6. 响应式控制器（@RestController）

### 注解式端点
```java
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public Mono<User> getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
    
    @GetMapping
    public Flux<User> listUsers() {
        return userService.findAll();
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<User> createUser(@RequestBody Mono<User> userMono) {
        return userMono.flatMap(userService::save);
    }
    
    @PutMapping("/{id}")
    public Mono<User> updateUser(@PathVariable Long id, @RequestBody Mono<User> userMono) {
        return userMono.flatMap(user -> {
            user.setId(id);
            return userService.save(user);
        });
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteUser(@PathVariable Long id) {
        return userService.deleteById(id);
    }
}
```

### 设计目的
保持 Spring MVC 注解风格，降低学习成本。

### 使用限制与风险
- 返回值必须是 Mono/Flux 或其他响应式类型
- @RequestBody 可接收 Mono<T> 避免阻塞
- 注解式端点底层也是函数式路由

---

## 7. 过滤器（WebFilter）

### WebFilter 接口
```java
@Component
public class LoggingWebFilter implements WebFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        log.info("Request: {} {}", exchange.getRequest().getMethod(), exchange.getRequest().getURI());
        return chain.filter(exchange)
            .doFinally(signalType -> log.info("Response: {}", exchange.getResponse().getStatusCode()));
    }
}
```

### 设计目的
在请求处理前后插入自定义逻辑。

### 使用限制与风险
- WebFilter 是响应式的，返回 Mono<Void>
- 执行顺序通过 @Order 控制
- 避免阻塞操作

---

## 8. 异常处理（@ExceptionHandler）

### 全局异常处理
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Mono<ErrorResponse> handleNotFound(NotFoundException ex) {
        return Mono.just(new ErrorResponse(404, ex.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Mono<ErrorResponse> handleGeneral(Exception ex) {
        return Mono.just(new ErrorResponse(500, "Internal Server Error"));
    }
}
```

### 设计目的
统一处理异常，返回响应式结果。

### 使用限制与风险
- 异常处理器返回值应是 Mono/Flux
- 异常会终止响应式流

---

## 9. 数据绑定与校验

### 数据绑定
```java
@PostMapping("/users")
public Mono<User> createUser(@Valid @RequestBody Mono<User> userMono) {
    return userMono.flatMap(user -> {
        // 校验已自动完成
        return userService.save(user);
    });
}
```

### 校验
- 支持 JSR-303/JSR-380 注解
- @Valid 自动校验
- 校验失败抛 WebExchangeBindException

### 设计目的
保持与 Spring MVC 一致的数据绑定和校验机制。

### 使用限制与风险
- 校验失败默认返回 400
- 需正确处理校验异常

---

## 10. 静态资源处理

### 配置静态资源
```java
@Configuration
public class WebFluxConfig implements WebFluxConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
            .addResourceLocations("classpath:/static/")
            .setCachePeriod(3600);
    }
}
```

### 设计目的
支持静态资源服务（CSS、JS、图片等）。

### 使用限制与风险
- 静态资源建议使用 CDN 或 Nginx
- WebFlux 适合动态内容，静态资源交给专业服务器

---

## 11. CORS 支持

### CORS 配置
```java
@Configuration
public class WebFluxConfig implements WebFluxConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://example.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

或注解方式：
```java
@CrossOrigin(origins = "https://example.com")
@RestController
public class UserController {
}
```

### 设计目的
解决跨域请求问题。

### 使用限制与风险
- CORS 配置需谨慎
- allowCredentials=true 时，allowedOrigins 不能为 `*`

---

## 12. SSE/Server Push（Server-Sent Events）

### SSE 示例
```java
@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> stream() {
    return Flux.interval(Duration.ofSeconds(1))
        .map(seq -> "Event " + seq);
}
```

### 设计目的
支持服务器主动推送数据到客户端。

### 使用限制与风险
- SSE 是单向推送（服务器 -> 客户端）
- 客户端需支持 EventSource API
- 适合实时数据推送（股票、通知等）

---

## 13. 响应式会话管理

### WebSession
```java
@GetMapping("/session")
public Mono<String> session(WebSession session) {
    return Mono.fromSupplier(() -> {
        session.getAttributes().put("username", "John");
        return "Session created";
    });
}
```

### 设计目的
提供响应式的会话管理。

### 使用限制与风险
- WebSession 默认基于内存
- 集群环境需配置 Session 共享（Redis 等）

---

## 14. 响应式安全集成

### Spring Security 集成
```java
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            .authorizeExchange()
                .pathMatchers("/public/**").permitAll()
                .anyExchange().authenticated()
            .and()
            .httpBasic()
            .and()
            .build();
    }
}
```

### 设计目的
保护响应式 Web 应用。

### 使用限制与风险
- Spring Security 5+ 支持 WebFlux
- 安全配置语法与 Spring MVC 略有不同

---

## 15. WebSocket 响应式支持

### WebSocket 处理器
```java
@Component
public class ReactiveWebSocketHandler implements WebSocketHandler {
    @Override
    public Mono<Void> handle(WebSocketSession session) {
        Flux<WebSocketMessage> output = session.receive()
            .map(msg -> "Echo: " + msg.getPayloadAsText())
            .map(session::textMessage);
        
        return session.send(output);
    }
}
```

### 配置
```java
@Configuration
public class WebSocketConfig {
    @Bean
    public HandlerMapping webSocketHandlerMapping(ReactiveWebSocketHandler handler) {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/ws", handler);
        
        SimpleUrlHandlerMapping handlerMapping = new SimpleUrlHandlerMapping();
        handlerMapping.setOrder(1);
        handlerMapping.setUrlMap(map);
        return handlerMapping;
    }
    
    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}
```

### 设计目的
支持响应式 WebSocket 编程。

### 使用限制与风险
- WebSocket 处理器是完全响应式的
- 需理解 Flux 背压机制

---

## 16. 背压处理（Backpressure）

### 背压策略
- **onBackpressureBuffer()** - 缓冲（有限或无限）
- **onBackpressureDrop()** - 丢弃（生产者过快时）
- **onBackpressureLatest()** - 保留最新
- **onBackpressureError()** - 抛异常

### 使用示例
```java
Flux<Integer> flux = Flux.range(1, 1000)
    .onBackpressureBuffer(100) // 缓冲 100 个元素
    .delayElements(Duration.ofMillis(10));
```

### 设计目的
防止生产者过快导致消费者过载。

### 使用限制与风险
- 背压机制需根据场景选择
- 缓冲过大可能内存溢出
- 丢弃策略可能丢失数据

---

## 17. 响应式数据访问（R2DBC 集成）

### R2DBC（Reactive Relational Database Connectivity）
```java
@Repository
public interface UserRepository extends ReactiveCrudRepository<User, Long> {
    Flux<User> findByAgeGreaterThan(int age);
    Mono<User> findByEmail(String email);
}
```

### 使用示例
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public Flux<User> findAll() {
        return userRepository.findAll();
    }
    
    public Mono<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Mono<User> save(User user) {
        return userRepository.save(user);
    }
}
```

### 设计目的
提供响应式数据库访问，避免阻塞 I/O。

### 使用限制与风险
- R2DBC 驱动支持有限（PostgreSQL、MySQL、H2 等）
- 不支持 JPA（需使用 R2DBC 特定 API）
- 事务管理与 JPA 不同

---

## 18. 性能优化

### 优化建议
- 避免阻塞操作（如 JDBC、Thread.sleep）
- 使用 R2DBC 替代 JDBC
- 使用 WebClient 替代 RestTemplate
- 合理配置线程池
- 利用背压机制
- 监控响应式流性能

### 设计目的
充分发挥响应式编程的性能优势。

### 使用限制与风险
- 阻塞操作需放到专门的调度器（Schedulers.boundedElastic()）
- 过度使用响应式操作符可能影响性能

---

## 📚 总结

spring-webflux 提供了完整的响应式 Web 解决方案：
- **响应式编程**：基于 Reactor（Mono、Flux）
- **函数式端点**：RouterFunction、HandlerFunction
- **WebClient**：非阻塞 HTTP 客户端
- **注解式端点**：保持 Spring MVC 风格
- **WebFilter**：响应式过滤器
- **异常处理**：@RestControllerAdvice
- **SSE**：服务器推送
- **WebSocket**：响应式 WebSocket
- **背压机制**：流量控制
- **R2DBC**：响应式数据库访问

spring-webflux 适合高并发、低延迟场景，但学习成本高，需谨慎选择。传统 CRUD 应用使用 Spring MVC 更合适。

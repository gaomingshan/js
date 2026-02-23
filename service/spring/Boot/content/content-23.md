# 第 23 章：Spring Boot 事件与监听器

## 本章概述

深入讲解 Spring Boot 的事件机制，包括 SpringApplicationRunListener、ApplicationListener、启动事件体系和自定义监听器。

**学习目标：**
- 掌握 Spring Boot 事件体系
- 理解启动过程中的事件流转
- 学会自定义监听器

---

## 23.1 Spring Boot 事件体系

### 启动事件顺序

```
1. ApplicationStartingEvent          # 启动开始
2. ApplicationEnvironmentPreparedEvent  # 环境准备完成
3. ApplicationContextInitializedEvent   # 上下文初始化完成
4. ApplicationPreparedEvent            # 上下文准备完成
5. ContextRefreshedEvent              # 上下文刷新完成
6. ServletWebServerInitializedEvent    # Web 服务器初始化完成
7. ApplicationStartedEvent            # 应用启动完成
8. ApplicationReadyEvent              # 应用就绪
9. ApplicationFailedEvent             # 启动失败（异常时）
```

---

## 23.2 SpringApplicationRunListener

### 接口定义

```java
public interface SpringApplicationRunListener {
    
    default void starting(ConfigurableBootstrapContext bootstrapContext) {}
    
    default void environmentPrepared(ConfigurableBootstrapContext bootstrapContext,
                                     ConfigurableEnvironment environment) {}
    
    default void contextPrepared(ConfigurableApplicationContext context) {}
    
    default void contextLoaded(ConfigurableApplicationContext context) {}
    
    default void started(ConfigurableApplicationContext context) {}
    
    default void ready(ConfigurableApplicationContext context, Duration timeTaken) {}
    
    default void failed(ConfigurableApplicationContext context, Throwable exception) {}
}
```

### 自定义 RunListener

```java
public class MySpringApplicationRunListener implements SpringApplicationRunListener {
    
    private final SpringApplication application;
    private final String[] args;
    
    // 必须有这个构造方法
    public MySpringApplicationRunListener(SpringApplication application, String[] args) {
        this.application = application;
        this.args = args;
    }
    
    @Override
    public void starting(ConfigurableBootstrapContext bootstrapContext) {
        System.out.println("应用启动中...");
    }
    
    @Override
    public void environmentPrepared(ConfigurableBootstrapContext bootstrapContext,
                                    ConfigurableEnvironment environment) {
        System.out.println("环境准备完成");
    }
    
    @Override
    public void started(ConfigurableApplicationContext context) {
        System.out.println("应用启动完成");
    }
    
    @Override
    public void ready(ConfigurableApplicationContext context, Duration timeTaken) {
        System.out.println("应用就绪，耗时: " + timeTaken.toMillis() + "ms");
    }
}
```

### 注册

```properties
# META-INF/spring.factories
org.springframework.boot.SpringApplicationRunListener=\
com.example.MySpringApplicationRunListener
```

---

## 23.3 ApplicationListener

### 使用示例

```java
@Component
public class MyApplicationListener implements ApplicationListener<ApplicationReadyEvent> {
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        System.out.println("应用已就绪！");
        ApplicationContext context = event.getApplicationContext();
        Environment environment = context.getEnvironment();
        System.out.println("激活的 Profile: " + Arrays.toString(environment.getActiveProfiles()));
    }
}
```

### 泛型监听器

```java
@Component
public class GenericApplicationListener implements ApplicationListener<ApplicationEvent> {
    
    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        if (event instanceof ApplicationStartedEvent) {
            System.out.println("Started");
        } else if (event instanceof ApplicationReadyEvent) {
            System.out.println("Ready");
        }
    }
}
```

### @EventListener 注解

```java
@Component
public class EventListenerExample {
    
    @EventListener
    public void handleContextRefresh(ContextRefreshedEvent event) {
        System.out.println("Context refreshed");
    }
    
    @EventListener
    public void handleApplicationReady(ApplicationReadyEvent event) {
        System.out.println("Application ready");
    }
    
    @EventListener(condition = "#event.timeTaken.toMillis() > 3000")
    public void handleSlowStartup(ApplicationReadyEvent event) {
        System.out.println("Slow startup detected: " + event.getTimeTaken().toMillis() + "ms");
    }
}
```

---

## 23.4 自定义事件

### 创建自定义事件

```java
public class UserRegisteredEvent extends ApplicationEvent {
    
    private final String username;
    private final String email;
    
    public UserRegisteredEvent(Object source, String username, String email) {
        super(source);
        this.username = username;
        this.email = email;
    }
    
    public String getUsername() {
        return username;
    }
    
    public String getEmail() {
        return email;
    }
}
```

### 发布事件

```java
@Service
public class UserService {
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void registerUser(String username, String email) {
        // 注册用户逻辑
        
        // 发布事件
        UserRegisteredEvent event = new UserRegisteredEvent(this, username, email);
        eventPublisher.publishEvent(event);
    }
}
```

### 监听自定义事件

```java
@Component
public class UserEventListener {
    
    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        System.out.println("New user registered: " + event.getUsername());
        // 发送欢迎邮件
        sendWelcomeEmail(event.getEmail());
    }
    
    private void sendWelcomeEmail(String email) {
        // 发送邮件逻辑
    }
}
```

---

## 23.5 异步事件

### 启用异步事件

```java
@Configuration
@EnableAsync
public class AsyncEventConfig {
    
    @Bean
    public ApplicationEventMulticaster applicationEventMulticaster() {
        SimpleApplicationEventMulticaster eventMulticaster = new SimpleApplicationEventMulticaster();
        eventMulticaster.setTaskExecutor(new SimpleAsyncTaskExecutor());
        return eventMulticaster;
    }
}
```

### 异步监听器

```java
@Component
public class AsyncEventListener {
    
    @EventListener
    @Async
    public void handleEvent(UserRegisteredEvent event) {
        // 异步处理
        System.out.println("Async handling: " + event.getUsername());
    }
}
```

---

## 23.6 事件监听顺序

### 使用 @Order

```java
@Component
@Order(1)
public class FirstListener implements ApplicationListener<ApplicationReadyEvent> {
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        System.out.println("First listener");
    }
}

@Component
@Order(2)
public class SecondListener implements ApplicationListener<ApplicationReadyEvent> {
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        System.out.println("Second listener");
    }
}
```

---

## 23.7 本章小结

**核心要点：**
1. Spring Boot 定义了完整的启动事件体系
2. SpringApplicationRunListener 监听启动过程
3. ApplicationListener 监听应用事件
4. 支持自定义事件和异步事件
5. 可以通过 @Order 控制监听器顺序

**相关章节：**
- [第 21 章：SpringApplication.run() 完整流程](./content-21.md)
- [第 22 章：ApplicationContext 初始化机制](./content-22.md)
- [第 24 章：Starter 设计原则与规范](./content-24.md)

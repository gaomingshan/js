# 第 32 章：故障诊断与排查

> **学习目标**：掌握 Spring 应用常见问题的诊断和解决方法  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. Bean 创建失败

### 1.1 循环依赖

**现象**：`BeanCurrentlyInCreationException`

**排查**：
```bash
# 启动日志
Creating instance of bean 'serviceA'
Creating instance of bean 'serviceB'
Requested bean is currently in creation: Is there an unresolvable circular reference?
```

**解决**：
1. 改用 Setter 注入
2. 使用 @Lazy
3. 重构代码消除循环依赖

### 1.2 Bean 未找到

**现象**：`NoSuchBeanDefinitionException`

**排查**：
```java
// 检查是否扫描到
@ComponentScan(basePackages = "com.example")

// 检查Bean名称
context.getBean("userService", UserService.class);

// 列出所有Bean
String[] names = context.getBeanDefinitionNames();
Arrays.stream(names).forEach(System.out::println);
```

---

## 2. 事务不生效

### 2.1 @Transactional 失效

**常见原因**：
1. 方法不是 public
2. 内部调用
3. 异常被捕获
4. 数据库不支持事务

**排查**：
```java
// 开启事务日志
logging.level.org.springframework.transaction=DEBUG

// 检查代理
if (AopUtils.isAopProxy(userService)) {
    System.out.println("是代理对象");
}
```

---

## 3. 内存泄漏

### 3.1 ThreadLocal 泄漏

**问题代码**：
```java
private static ThreadLocal<User> userHolder = new ThreadLocal<>();

public void setUser(User user) {
    userHolder.set(user);
    // 忘记 remove
}
```

**解决**：
```java
try {
    userHolder.set(user);
    // 业务逻辑
} finally {
    userHolder.remove();  // 必须清理
}
```

### 3.2 监听器未移除

```java
@Component
public class EventListener implements ApplicationListener<UserEvent> {
    @Override
    public void onApplicationEvent(UserEvent event) {
        // 处理事件
    }
}

// 如果是动态添加的监听器，记得移除
context.removeApplicationListener(listener);
```

---

## 4. 性能问题

### 4.1 慢SQL定位

```properties
# 开启SQL日志
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Druid监控
spring.datasource.druid.stat-view-servlet.enabled=true
spring.datasource.druid.web-stat-filter.enabled=true
```

### 4.2 线程池耗尽

```java
@Bean
public Executor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(10);
    executor.setMaxPoolSize(20);
    executor.setQueueCapacity(200);
    
    // 拒绝策略：记录日志
    executor.setRejectedExecutionHandler((r, executor) -> {
        log.error("Task rejected: {}", r.toString());
    });
    
    executor.initialize();
    return executor;
}
```

---

## 5. 配置问题

### 5.1 配置未生效

```java
// 检查配置加载
@Component
public class ConfigChecker implements CommandLineRunner {
    @Autowired
    private Environment env;
    
    @Override
    public void run(String... args) {
        System.out.println("db.url: " + env.getProperty("db.url"));
        System.out.println("active profiles: " + Arrays.toString(env.getActiveProfiles()));
    }
}
```

### 5.2 多环境配置混乱

```
application.properties          # 通用配置
application-dev.properties      # 开发环境
application-test.properties     # 测试环境
application-prod.properties     # 生产环境

# 激活
spring.profiles.active=dev
```

---

## 6. 常用诊断工具

### 6.1 Arthas

```bash
# 启动Arthas
java -jar arthas-boot.jar

# 查看方法调用
watch com.example.UserService findById '{params, returnObj, throwExp}'

# 查看方法耗时
trace com.example.UserService findById

# 查看JVM信息
dashboard
```

### 6.2 JProfiler/VisualVM

- 监控内存使用
- 分析线程状态
- CPU热点分析
- 内存泄漏检测

---

**上一章** ← [第 31 章：性能优化实战](./content-31.md)  
**下一章** → [第 33 章：企业架构设计](./content-33.md)  
**返回目录** → [学习大纲](../content-outline.md)

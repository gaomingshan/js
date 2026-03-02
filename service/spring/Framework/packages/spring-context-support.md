# Spring Context Support 源码指引

> spring-context-support 提供上下文扩展支持，包括缓存、调度、邮件、模板引擎等。

---

## 1. 缓存抽象（@Cacheable、@CacheEvict、@CachePut、CacheManager）

### 核心注解
- **@EnableCaching** - 启用缓存支持
- **@Cacheable** - 缓存方法结果
- **@CacheEvict** - 清除缓存
- **@CachePut** - 更新缓存
- **@Caching** - 组合多个缓存操作
- **@CacheConfig** - 类级别缓存配置

### 核心接口
- **CacheManager** - 缓存管理器接口
- **Cache** - 缓存接口
- **CacheResolver** - 缓存解析器

### 核心实现
- **ConcurrentMapCacheManager** - 基于 ConcurrentHashMap（默认）
- **SimpleCacheManager** - 简单缓存管理器
- **CompositeCacheManager** - 组合缓存管理器
- **NoOpCacheManager** - 空操作缓存管理器

### 使用示例
```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("users", "products");
    }
}

@Service
public class UserService {
    @Cacheable(value = "users", key = "#id")
    public User getUser(Long id) {
        // 方法结果会被缓存
        return userRepository.findById(id);
    }
    
    @CachePut(value = "users", key = "#user.id")
    public User updateUser(User user) {
        // 更新数据库并更新缓存
        return userRepository.save(user);
    }
    
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id) {
        // 删除数据并清除缓存
        userRepository.deleteById(id);
    }
    
    @CacheEvict(value = "users", allEntries = true)
    public void clearAll() {
        // 清空所有缓存
    }
}
```

### 设计目的
提供声明式缓存，减少重复计算和数据库查询。

### 使用限制与风险
- 基于 AOP 代理，内部调用不生效
- key 支持 SpEL 表达式
- 默认使用 SimpleKeyGenerator（方法参数作为 key）
- ConcurrentMapCacheManager 仅适合单机，生产环境使用 Redis 等

---

## 2. 缓存提供者集成（Caffeine、EhCache、Redis）

### Caffeine 集成
```xml
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

```java
@Bean
public CacheManager cacheManager() {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager("users", "products");
    cacheManager.setCaffeine(Caffeine.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(10, TimeUnit.MINUTES));
    return cacheManager;
}
```

### EhCache 集成
```java
@Bean
public CacheManager cacheManager() {
    return new EhCacheCacheManager(ehCacheManager());
}

@Bean
public EhCacheManagerFactoryBean ehCacheManager() {
    EhCacheManagerFactoryBean factory = new EhCacheManagerFactoryBean();
    factory.setConfigLocation(new ClassPathResource("ehcache.xml"));
    return factory;
}
```

### Redis 集成（Spring Boot）
```java
@Bean
public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
    RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(10))
        .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
        .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    
    return RedisCacheManager.builder(connectionFactory)
        .cacheDefaults(config)
        .build();
}
```

### 设计目的
集成主流缓存框架，提供高性能缓存解决方案。

### 使用限制与风险
- Caffeine 是本地缓存，性能最优但不支持集群
- EhCache 支持本地和分布式缓存
- Redis 适合分布式缓存，需注意序列化和网络延迟

---

## 3. 定时任务（@Scheduled、@EnableScheduling）

### 核心注解
- **@EnableScheduling** - 启用调度支持
- **@Scheduled** - 声明定时任务

### 调度属性
- **fixedRate** - 固定速率（从上次开始时间计算）
- **fixedDelay** - 固定延迟（从上次结束时间计算）
- **initialDelay** - 初始延迟
- **cron** - Cron 表达式
- **zone** - 时区

### 使用示例
```java
@Configuration
@EnableScheduling
public class SchedulingConfig {
}

@Component
public class ScheduledTasks {
    // 每 5 秒执行一次
    @Scheduled(fixedRate = 5000)
    public void reportCurrentTime() {
        log.info("Current time: {}", new Date());
    }
    
    // 上次执行完成后 3 秒再执行
    @Scheduled(fixedDelay = 3000, initialDelay = 1000)
    public void doSomething() {
        log.info("Task executed");
    }
    
    // Cron 表达式：每天凌晨 1 点执行
    @Scheduled(cron = "0 0 1 * * ?")
    public void cleanupTask() {
        log.info("Cleanup task");
    }
    
    // Cron 表达式：每个工作日上午 9 点执行
    @Scheduled(cron = "0 0 9 ? * MON-FRI")
    public void weekdayTask() {
        log.info("Weekday task");
    }
}
```

### 配置线程池
```java
@Configuration
@EnableScheduling
public class SchedulingConfig implements SchedulingConfigurer {
    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        taskRegistrar.setScheduler(taskExecutor());
    }
    
    @Bean
    public Executor taskExecutor() {
        return Executors.newScheduledThreadPool(10);
    }
}
```

### 设计目的
提供声明式定时任务，简化调度配置。

### 使用限制与风险
- @Scheduled 方法必须无参无返回值
- 默认单线程执行，需配置线程池
- 异常不会中断调度，需自行处理
- 集群环境需避免重复执行（使用 ShedLock 等工具）

---

## 4. 邮件发送（JavaMailSender）

### 核心接口
- **MailSender** - 邮件发送器接口
- **JavaMailSender** - Java 邮件发送器接口
- **MimeMessage** - MIME 消息

### 核心实现
- **JavaMailSenderImpl** - Java 邮件发送器实现

### 配置示例
```java
@Bean
public JavaMailSender javaMailSender() {
    JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
    mailSender.setHost("smtp.gmail.com");
    mailSender.setPort(587);
    mailSender.setUsername("your-email@gmail.com");
    mailSender.setPassword("your-password");
    
    Properties props = mailSender.getJavaMailProperties();
    props.put("mail.transport.protocol", "smtp");
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.starttls.enable", "true");
    
    return mailSender;
}
```

或 Spring Boot application.properties：
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 发送简单邮件
```java
@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
```

### 发送 HTML 邮件
```java
public void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
    helper.setTo(to);
    helper.setSubject(subject);
    helper.setText(htmlBody, true); // true 表示 HTML
    mailSender.send(message);
}
```

### 发送附件邮件
```java
public void sendEmailWithAttachment(String to, String subject, String text, File file) throws MessagingException {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true);
    helper.setTo(to);
    helper.setSubject(subject);
    helper.setText(text);
    helper.addAttachment(file.getName(), file);
    mailSender.send(message);
}
```

### 设计目的
简化邮件发送操作，支持简单邮件、HTML 邮件、附件邮件。

### 使用限制与风险
- 需配置 SMTP 服务器
- Gmail 等需开启"允许不够安全的应用"或使用应用专用密码
- 邮件发送是阻塞操作，建议异步执行
- 需处理发送失败异常

---

## 5. 模板引擎集成（Velocity、FreeMarker）

### FreeMarker 集成
```java
@Bean
public FreeMarkerConfigurer freeMarkerConfigurer() {
    FreeMarkerConfigurer configurer = new FreeMarkerConfigurer();
    configurer.setTemplateLoaderPath("classpath:/templates/");
    configurer.setDefaultEncoding("UTF-8");
    return configurer;
}
```

### 使用模板发送邮件
```java
@Autowired
private FreeMarkerConfigurer freeMarkerConfigurer;

public void sendTemplateEmail(String to, Map<String, Object> model) throws Exception {
    Configuration config = freeMarkerConfigurer.getConfiguration();
    Template template = config.getTemplate("email-template.ftl");
    String htmlBody = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);
    
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
    helper.setTo(to);
    helper.setSubject("Welcome");
    helper.setText(htmlBody, true);
    mailSender.send(message);
}
```

### 设计目的
集成模板引擎，生成动态内容（邮件、报表等）。

### 使用限制与风险
- Velocity 已停止维护，推荐使用 FreeMarker 或 Thymeleaf
- 模板路径需正确配置
- 模板变量需正确传递

---

## 6. Quartz 集成（QuartzJobBean）

### 依赖
```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context-support</artifactId>
</dependency>
<dependency>
    <groupId>org.quartz-scheduler</groupId>
    <artifactId>quartz</artifactId>
</dependency>
```

### 核心类
- **QuartzJobBean** - Quartz Job Bean 基类
- **SchedulerFactoryBean** - 调度器工厂 Bean
- **JobDetail** - Job 详情
- **Trigger** - 触发器

### 使用示例
```java
public class MyJob extends QuartzJobBean {
    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        log.info("MyJob executed");
    }
}

@Configuration
public class QuartzConfig {
    @Bean
    public JobDetail jobDetail() {
        return JobBuilder.newJob(MyJob.class)
            .withIdentity("myJob")
            .storeDurably()
            .build();
    }
    
    @Bean
    public Trigger trigger(JobDetail jobDetail) {
        return TriggerBuilder.newTrigger()
            .forJob(jobDetail)
            .withIdentity("myTrigger")
            .withSchedule(CronScheduleBuilder.cronSchedule("0 0/5 * * * ?"))
            .build();
    }
    
    @Bean
    public SchedulerFactoryBean schedulerFactoryBean(Trigger trigger, JobDetail jobDetail) {
        SchedulerFactoryBean factory = new SchedulerFactoryBean();
        factory.setJobDetails(jobDetail);
        factory.setTriggers(trigger);
        return factory;
    }
}
```

### 设计目的
集成 Quartz 调度框架，提供企业级任务调度功能。

### 使用限制与风险
- Quartz 功能强大但配置复杂
- 简单调度使用 @Scheduled 即可
- 需数据库存储 Job 信息（集群场景）
- Spring Boot 提供了更简化的 Quartz 集成

---

## 7. UI 上下文支持

### 主题支持
- **ThemeResolver** - 主题解析器
- **ThemeSource** - 主题源

### 设计目的
支持 Web 应用主题切换（已较少使用）。

### 使用限制与风险
- 现代前端框架通常自己处理主题
- Spring 主题支持逐渐淘汰

---

## 8. EhCache 集成

### 配置 EhCache
```xml
<!-- ehcache.xml -->
<ehcache>
    <cache name="users"
           maxEntriesLocalHeap="1000"
           timeToLiveSeconds="600"
           timeToIdleSeconds="300"/>
</ehcache>
```

```java
@Bean
public EhCacheCacheManager cacheManager(CacheManager ehCacheManager) {
    return new EhCacheCacheManager(ehCacheManager);
}

@Bean
public EhCacheManagerFactoryBean ehCacheManagerFactoryBean() {
    EhCacheManagerFactoryBean factory = new EhCacheManagerFactoryBean();
    factory.setConfigLocation(new ClassPathResource("ehcache.xml"));
    factory.setShared(true);
    return factory;
}
```

### 设计目的
集成 EhCache 缓存框架，提供本地和分布式缓存。

### 使用限制与风险
- EhCache 2.x 和 3.x API 不兼容
- 分布式缓存需配置集群
- 现代应用更多使用 Redis

---

## 9. Caffeine 集成

### 配置 Caffeine
```java
@Bean
public CacheManager cacheManager() {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager("users", "products");
    cacheManager.setCaffeine(Caffeine.newBuilder()
        .initialCapacity(100)
        .maximumSize(1000)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .expireAfterAccess(5, TimeUnit.MINUTES)
        .recordStats());
    return cacheManager;
}
```

### 设计目的
集成 Caffeine 高性能本地缓存。

### 使用限制与风险
- Caffeine 性能优于 Guava Cache 和 EhCache
- 仅支持本地缓存，不支持分布式
- 适合读多写少的场景

---

## 10. 缓存高级特性

### 自定义 Key 生成器
```java
@Bean
public KeyGenerator customKeyGenerator() {
    return (target, method, params) -> {
        return method.getName() + "_" + Arrays.toString(params);
    };
}

@Cacheable(value = "users", keyGenerator = "customKeyGenerator")
public User getUser(Long id) {
    return userRepository.findById(id);
}
```

### 缓存条件
```java
@Cacheable(value = "users", key = "#id", condition = "#id > 0", unless = "#result == null")
public User getUser(Long id) {
    return userRepository.findById(id);
}
```

### 设计目的
提供灵活的缓存控制。

### 使用限制与风险
- condition 在方法执行前评估
- unless 在方法执行后评估（可访问返回值）
- SpEL 表达式错误会导致缓存失效

---

## 📚 总结

spring-context-support 提供了丰富的扩展支持：
- **缓存抽象**：@Cacheable、CacheManager、多缓存提供者集成
- **定时任务**：@Scheduled、Cron 表达式
- **邮件发送**：JavaMailSender、支持 HTML 和附件
- **模板引擎**：FreeMarker 集成
- **Quartz 集成**：企业级任务调度
- **缓存提供者**：Caffeine、EhCache、Redis

这些功能简化了常见企业级需求的实现，提升开发效率。

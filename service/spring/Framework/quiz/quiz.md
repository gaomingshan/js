# Spring Framework 面试题汇总

> **说明**：本文档汇总了 Spring Framework 学习过程中的核心面试题，按模块分类，便于系统复习和面试准备。

---

## 目录

- [第一部分：IoC 容器](#第一部分ioc-容器)
- [第二部分：AOP](#第二部分aop)
- [第三部分：事务管理](#第三部分事务管理)
- [第四部分：Spring MVC](#第四部分spring-mvc)
- [第五部分：Spring Boot](#第五部分spring-boot)
- [第六部分：综合应用](#第六部分综合应用)

---

## 第一部分：IoC 容器

### 1. 什么是 IoC？有什么优势？

**答案要点**：
- IoC（控制反转）：对象创建和依赖管理的控制权从应用程序转移到容器
- 优势：降低耦合、提高可测试性、便于维护和扩展
- 实现方式：DI（依赖注入）

### 2. BeanFactory 和 ApplicationContext 的区别？

| 特性 | BeanFactory | ApplicationContext |
|------|-------------|-------------------|
| 加载方式 | 懒加载 | 预加载 |
| 功能 | 基础 IoC | IoC + 事件 + 国际化 + 资源 |
| 使用场景 | 资源受限 | 企业应用（推荐） |

### 3. Spring Bean 的完整生命周期？

**核心流程**：
1. 实例化（Instantiation）
2. 属性填充（Population）
3. Aware 接口回调
4. BeanPostProcessor 前置处理
5. 初始化（InitializingBean、init-method）
6. BeanPostProcessor 后置处理（AOP 代理）
7. 使用
8. 销毁（DisposableBean、destroy-method）

### 4. 依赖注入的三种方式及对比？

| 方式 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| 构造器注入 | 不可变、完整性保证 | 循环依赖问题 | ⭐⭐⭐⭐⭐ |
| Setter 注入 | 灵活、支持循环依赖 | 可变、无完整性保证 | ⭐⭐⭐ |
| 字段注入 | 代码简洁 | 难测试、强耦合 | ❌ 不推荐 |

### 5. Spring 如何解决循环依赖？

**三级缓存机制**：
- **一级缓存（singletonObjects）**：完全初始化的单例对象
- **二级缓存（earlySingletonObjects）**：早期暴露的对象
- **三级缓存（singletonFactories）**：对象工厂

**限制**：
- ✅ 支持：单例 + Setter 注入
- ❌ 不支持：构造器注入、prototype

### 6. 容器启动流程（refresh() 12 步）？

**关键步骤**：
1. prepareRefresh() - 准备
2. obtainFreshBeanFactory() - 获取 BeanFactory
3. prepareBeanFactory() - 准备
4. postProcessBeanFactory() - 后置处理（扩展点）
5. invokeBeanFactoryPostProcessors() - 调用 BeanFactoryPostProcessor
6. registerBeanPostProcessors() - 注册 BeanPostProcessor
7. initMessageSource() - 消息源
8. initApplicationEventMulticaster() - 事件多播器
9. onRefresh() - 特殊 Bean（扩展点）
10. registerListeners() - 监听器
11. finishBeanFactoryInitialization() - 实例化单例
12. finishRefresh() - 完成刷新

---

## 第二部分：AOP

### 7. 什么是 AOP？应用场景？

**概念**：面向切面编程，将横切关注点从业务逻辑中分离

**应用场景**：
- 日志记录
- 性能监控
- 事务管理
- 权限检查
- 异常处理

### 8. Spring AOP 和 AspectJ 的区别？

| 特性 | Spring AOP | AspectJ |
|------|-----------|---------|
| 实现方式 | 动态代理 | 字节码增强 |
| 连接点 | 方法执行 | 方法、字段、构造器等 |
| 织入时机 | 运行时 | 编译期/类加载期 |
| 性能 | 略慢 | 略快 |
| 配置 | 简单 | 复杂 |

### 9. JDK 动态代理和 CGLIB 代理的区别？

| 特性 | JDK 动态代理 | CGLIB 代理 |
|------|-------------|-----------|
| 前提 | 必须实现接口 | 无需接口 |
| 实现 | 实现接口 | 继承目标类 |
| 性能（创建） | 快 | 慢 |
| 性能（调用） | 慢 | 快 |
| final | 支持 final 方法 | 不支持 |

### 10. AOP 通知的执行顺序？

**单个切面**：
```
1. @Around 前半部分
2. @Before
3. 目标方法
4. @AfterReturning 或 @AfterThrowing
5. @After
6. @Around 后半部分
```

**多个切面**：
- @Order 值小的优先级高
- 前置：优先级高的先执行
- 后置：优先级高的后执行（洋葱模型）

### 11. 拦截器链如何执行？

**ReflectiveMethodInvocation.proceed() 递归执行**：
```java
1. 检查是否所有拦截器执行完毕
2. 如果是，执行目标方法
3. 如果否，获取下一个拦截器
4. 执行拦截器.invoke(this)  // 递归
```

---

## 第三部分：事务管理

### 12. Spring 事务传播行为有哪些？

| 传播行为 | 说明 | 应用场景 |
|---------|------|---------|
| **REQUIRED** | 支持当前事务，不存在则创建 | 默认，最常用 |
| **REQUIRES_NEW** | 创建新事务，挂起当前事务 | 独立事务（如日志） |
| **NESTED** | 嵌套事务，使用 SavePoint | 部分回滚 |
| **SUPPORTS** | 支持当前事务，不存在则非事务 | 查询操作 |
| **MANDATORY** | 必须在事务中 | 强制事务 |
| **NOT_SUPPORTED** | 非事务执行，挂起当前 | 不需要事务 |
| **NEVER** | 非事务执行，存在则异常 | 禁止事务 |

### 13. @Transactional 失效的场景？

**常见原因**：
1. 方法不是 public
2. 内部调用（this.method()）
3. 异常被捕获
4. 异常类型不匹配
5. 数据库不支持事务
6. 未开启事务管理

**解决方案**：
- 改为 public
- 通过代理调用（注入自己或 AopContext）
- 不捕获或重新抛出异常
- 配置 rollbackFor

### 14. 事务隔离级别？

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
|---------|------|-----------|------|------|
| READ_UNCOMMITTED | ✅ | ✅ | ✅ | 最好 |
| READ_COMMITTED | ❌ | ✅ | ✅ | 较好 |
| REPEATABLE_READ | ❌ | ❌ | ✅ | 较差 |
| SERIALIZABLE | ❌ | ❌ | ❌ | 最差 |

**MySQL InnoDB**：默认 REPEATABLE_READ，通过 MVCC + Next-Key Lock 也避免了幻读

### 15. NESTED 和 REQUIRES_NEW 的区别？

| 特性 | NESTED | REQUIRES_NEW |
|------|--------|--------------|
| 实现 | SavePoint | 独立事务 |
| 事务数 | 1 | 2 |
| 连接数 | 1 | 2 |
| 内层回滚 | 回滚到 SavePoint | 独立回滚 |
| 外层回滚 | 整个回滚 | 外层回滚，内层已提交 |

---

## 第四部分：Spring MVC

### 16. DispatcherServlet 的工作流程？

**核心流程**：
1. 请求到达 DispatcherServlet
2. HandlerMapping 查找 Handler
3. HandlerAdapter 适配 Handler
4. 执行拦截器 preHandle()
5. 执行 Controller 方法
6. 执行拦截器 postHandle()
7. ViewResolver 解析视图
8. View 渲染
9. 执行拦截器 afterCompletion()
10. 返回响应

### 17. 拦截器和过滤器的区别？

| 特性 | 拦截器 | 过滤器 |
|------|--------|--------|
| 规范 | Spring | Servlet |
| 作用范围 | Spring MVC | 所有请求 |
| 执行时机 | DispatcherServlet 之后 | DispatcherServlet 之前 |
| 依赖注入 | ✅ | ❌（需配置） |
| 异常处理 | ✅ | ❌ |

### 18. @RequestMapping 的匹配规则？

**匹配维度**：
1. 路径匹配（支持 Ant 通配符）
2. 请求方法匹配（GET/POST/PUT/DELETE）
3. 参数匹配（params）
4. 请求头匹配（headers）
5. Content-Type 匹配（consumes）
6. Accept 匹配（produces）

**优先级**：精确匹配 > 路径变量 > 单层通配符 > 多层通配符

### 19. 常用参数绑定注解？

| 注解 | 用途 |
|------|------|
| @RequestParam | URL 参数 |
| @PathVariable | 路径变量 |
| @RequestBody | JSON 请求体 |
| @RequestHeader | 请求头 |
| @CookieValue | Cookie |
| @ModelAttribute | 表单绑定 |

### 20. 如何统一处理异常？

**@ControllerAdvice + @ExceptionHandler**：
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        return Result.error(e.getMessage());
    }
}
```

---

## 第五部分：Spring Boot

### 21. Spring Boot 自动配置原理？

**流程**：
1. @EnableAutoConfiguration
2. AutoConfigurationImportSelector
3. 读取 META-INF/spring.factories
4. @Conditional 条件装配
5. 创建 Bean

### 22. 如何自定义 Starter？

**步骤**：
1. 创建 Maven 项目
2. 定义 XxxProperties（@ConfigurationProperties）
3. 定义 XxxAutoConfiguration（@Configuration）
4. 创建 META-INF/spring.factories
5. 注册自动配置类

### 23. Actuator 常用端点？

| 端点 | 功能 |
|------|------|
| /health | 健康检查 |
| /info | 应用信息 |
| /metrics | 指标 |
| /env | 环境属性 |
| /beans | Bean 列表 |
| /mappings | 请求映射 |

### 24. 配置文件加载顺序？

**优先级（从高到低）**：
1. 命令行参数
2. Java 系统属性
3. OS 环境变量
4. jar 包外的 application-{profile}.properties
5. jar 包内的 application-{profile}.properties
6. jar 包外的 application.properties
7. jar 包内的 application.properties

---

## 第六部分：综合应用

### 25. 如何设计高并发系统？

**分层优化**：
- **应用层**：缓存、异步、限流
- **数据库层**：读写分离、分库分表、索引
- **架构层**：微服务、负载均衡、CDN

### 26. 如何解决分布式事务？

**方案对比**：
- **2PC**：强一致，性能低
- **TCC**：最终一致，复杂度高
- **Saga**：最终一致，适合长事务
- **消息队列**：最终一致，适合异步

### 27. 如何实现服务限流？

**方案**：
- Guava RateLimiter（单机）
- Sentinel（分布式）
- Gateway 限流（网关级）
- Redis + Lua（灵活）

### 28. 如何排查线上问题？

**工具**：
- Arthas：方法调用、性能分析
- JProfiler/VisualVM：内存、CPU
- Actuator：健康检查、指标
- ELK：日志分析

### 29. 如何优化 Spring 应用性能？

**优化点**：
1. 容器启动：懒加载、条件装配
2. Bean 创建：单例复用、对象池
3. 数据库：连接池、批量操作、索引
4. 缓存：本地缓存、Redis
5. 异步：@Async、消息队列
6. JVM：内存配置、GC 调优

### 30. 微服务常见问题及解决方案？

| 问题 | 解决方案 |
|------|---------|
| 服务发现 | Eureka、Nacos |
| 负载均衡 | Ribbon、LoadBalancer |
| 服务调用 | Feign、Dubbo |
| 熔断降级 | Sentinel、Hystrix |
| 配置中心 | Nacos、Apollo |
| 链路追踪 | Sleuth + Zipkin |
| 分布式事务 | Seata、消息队列 |
| API 网关 | Gateway、Zuul |

---

## 面试技巧

### 答题策略

**分层回答**：
1. **第一层（60分）**：概念定义
2. **第二层（80分）**：原理分析
3. **第三层（95分）**：源码细节 + 实践经验

**举例说明**：
- 结合项目经验
- 说明应用场景
- 总结最佳实践

**画图辅助**：
- 流程图
- 架构图
- 时序图

### 准备建议

**基础知识**（必须掌握）：
- IoC/DI 原理
- Bean 生命周期
- AOP 原理
- 事务管理

**进阶知识**（加分项）：
- 源码分析
- 设计模式
- 性能优化
- 故障诊断

**实战经验**（最重要）：
- 项目经验
- 问题解决
- 架构设计

---

## 高频考点清单

### ⭐⭐⭐⭐⭐ 必考

- [ ] IoC/DI 原理
- [ ] Bean 生命周期
- [ ] 循环依赖
- [ ] AOP 原理
- [ ] 事务传播行为
- [ ] @Transactional 失效场景

### ⭐⭐⭐⭐ 常考

- [ ] Spring MVC 流程
- [ ] 自动配置原理
- [ ] 拦截器 vs 过滤器
- [ ] 动态代理对比
- [ ] 事务隔离级别

### ⭐⭐⭐ 偶尔考

- [ ] 设计模式应用
- [ ] BeanPostProcessor
- [ ] 容器启动流程
- [ ] 微服务组件

---

## 学习资源

**官方文档**：
- [Spring Framework Reference](https://docs.spring.io/spring-framework/docs/current/reference/html/)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/)

**源码位置**：
- spring-context
- spring-aop
- spring-tx
- spring-webmvc

**推荐书籍**：
- 《Spring 源码深度解析》
- 《Spring Boot 实战》
- 《Spring 微服务实战》

---

## 总结

**学习路径**：
1. 理解核心概念
2. 掌握工作原理
3. 阅读关键源码
4. 实践项目应用
5. 准备面试题库

**面试心态**：
- 自信但不自大
- 诚实承认不会
- 积极思考问题
- 表达清晰有条理

**持续学习**：
- 关注技术动态
- 深入源码研究
- 总结项目经验
- 参与技术分享

---

**返回目录** → [学习大纲](../content-outline.md)

---

# 🎉 祝你面试成功！

**记住**：
- 理解比记忆更重要
- 实践比理论更重要
- 思考比背诵更重要

**加油！** 💪

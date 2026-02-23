# 第 36 章：Spring 核心原理面试题

> **学习目标**：掌握 Spring 核心原理相关的高频面试题  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. IoC 容器相关

### 1.1 什么是 IoC？有什么优势？

**答案**：
- **IoC（Inversion of Control）控制反转**：对象创建和依赖管理的控制权从应用程序转移到容器
- **优势**：
  - 降低耦合度
  - 提高可测试性
  - 便于维护和扩展
  - 统一管理对象生命周期

### 1.2 BeanFactory 和 ApplicationContext 的区别？

**答案**：

| 特性 | BeanFactory | ApplicationContext |
|------|-------------|-------------------|
| 加载方式 | 懒加载 | 预加载 |
| 国际化 | 不支持 | 支持（MessageSource） |
| 事件发布 | 不支持 | 支持（ApplicationEventPublisher） |
| 资源访问 | 不支持 | 支持（ResourcePatternResolver） |
| BeanPostProcessor | 需手动注册 | 自动注册 |
| 使用场景 | 资源受限场景 | 企业应用（推荐） |

### 1.3 Spring Bean 的生命周期？

**答案**（完整流程）：
1. **实例化**：createBeanInstance()
2. **属性填充**：populateBean()
3. **Aware 接口回调**：BeanNameAware、BeanFactoryAware、ApplicationContextAware
4. **BeanPostProcessor 前置处理**：postProcessBeforeInitialization()
5. **初始化方法**：InitializingBean.afterPropertiesSet()、init-method
6. **BeanPostProcessor 后置处理**：postProcessAfterInitialization()（AOP 代理）
7. **使用**
8. **销毁**：DisposableBean.destroy()、destroy-method

---

## 2. 依赖注入相关

### 2.1 Spring 有哪几种依赖注入方式？

**答案**：
1. **构造器注入**（推荐）
2. **Setter 注入**
3. **字段注入**（不推荐）

**对比**：

| 特性 | 构造器注入 | Setter 注入 | 字段注入 |
|------|-----------|------------|----------|
| 不可变性 | ✅ final | ❌ | ❌ |
| 完整性保证 | ✅ | ❌ | ❌ |
| 单元测试 | ✅ 易 | ⚠️ 一般 | ❌ 难 |
| 循环依赖 | ❌ 不支持 | ✅ 支持 | ✅ 支持 |

### 2.2 @Autowired 和 @Resource 的区别？

**答案**：

| 特性 | @Autowired | @Resource |
|------|-----------|----------|
| 来源 | Spring | Java EE (JSR-250) |
| 注入方式 | 按类型 | 按名称 |
| 可选注入 | @Autowired(required=false) | 不支持 |
| 指定名称 | @Qualifier | name 属性 |
| 适用范围 | 字段、方法、构造器 | 字段、方法 |

---

## 3. AOP 相关

### 3.1 什么是 AOP？Spring AOP 和 AspectJ 的区别？

**答案**：
- **AOP（Aspect-Oriented Programming）面向切面编程**：将横切关注点从业务逻辑中分离

**区别**：

| 特性 | Spring AOP | AspectJ |
|------|-----------|---------|
| 实现方式 | 动态代理 | 字节码增强 |
| 连接点 | 方法执行 | 方法、字段、构造器等 |
| 织入时机 | 运行时 | 编译期/类加载期 |
| 性能 | 略慢 | 略快 |
| 配置复杂度 | 简单 | 复杂 |

### 3.2 JDK 动态代理和 CGLIB 代理的区别？

**答案**：

| 特性 | JDK 动态代理 | CGLIB 代理 |
|------|-------------|-----------|
| 前提条件 | 必须实现接口 | 无需接口 |
| 实现方式 | 实现接口 | 继承目标类 |
| 性能（创建） | 快 | 慢 |
| 性能（调用） | 慢（反射） | 快 |
| final 方法 | ✅ 支持 | ❌ 不支持 |
| final 类 | N/A | ❌ 不支持 |

### 3.3 Spring AOP 的执行顺序？

**答案**：
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
- 前置通知：优先级高的先执行
- 后置通知：优先级高的后执行（洋葱模型）

---

## 4. 事务管理相关

### 4.1 Spring 事务传播行为有哪些？

**答案**：
1. **REQUIRED**（默认）：支持当前事务，不存在则创建
2. **REQUIRES_NEW**：创建新事务，挂起当前事务
3. **NESTED**：嵌套事务，使用 SavePoint
4. **SUPPORTS**：支持当前事务，不存在则非事务执行
5. **MANDATORY**：必须在事务中，不存在则抛异常
6. **NOT_SUPPORTED**：非事务执行，挂起当前事务
7. **NEVER**：非事务执行，存在事务则抛异常

### 4.2 @Transactional 失效的场景？

**答案**：
1. **方法不是 public**
2. **内部调用**：this.method() 不经过代理
3. **异常被捕获**：未抛出到拦截器
4. **异常类型不匹配**：默认只回滚 RuntimeException
5. **数据库不支持事务**：如 MySQL MyISAM
6. **未开启事务管理**：缺少 @EnableTransactionManagement

### 4.3 事务隔离级别有哪些？分别解决什么问题？

**答案**：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---------|------|-----------|------|
| READ_UNCOMMITTED | ✅ 可能 | ✅ 可能 | ✅ 可能 |
| READ_COMMITTED | ❌ 避免 | ✅ 可能 | ✅ 可能 |
| REPEATABLE_READ | ❌ 避免 | ❌ 避免 | ✅ 可能 |
| SERIALIZABLE | ❌ 避免 | ❌ 避免 | ❌ 避免 |

---

## 5. Spring MVC 相关

### 5.1 DispatcherServlet 的工作流程？

**答案**：
1. 请求到达 DispatcherServlet
2. **HandlerMapping** 查找处理器
3. **HandlerAdapter** 适配处理器
4. 执行拦截器 **preHandle()**
5. 执行 **Controller 方法**
6. 执行拦截器 **postHandle()**
7. **ViewResolver** 解析视图
8. **View** 渲染
9. 执行拦截器 **afterCompletion()**
10. 返回响应

### 5.2 拦截器和过滤器的区别？

**答案**：

| 特性 | 拦截器（Interceptor） | 过滤器（Filter） |
|------|---------------------|-----------------|
| 规范 | Spring | Servlet |
| 作用范围 | Spring MVC | 所有请求 |
| 执行时机 | DispatcherServlet 之后 | DispatcherServlet 之前 |
| 依赖注入 | ✅ 支持 | ❌ 不支持（需额外配置） |
| 异常处理 | ✅ 可被 @ControllerAdvice 处理 | ❌ 不能 |
| 典型应用 | 权限检查、日志记录 | 编码转换、跨域处理 |

---

## 6. 循环依赖相关

### 6.1 Spring 如何解决循环依赖？

**答案**：
通过**三级缓存**解决单例 Bean 的 Setter 注入循环依赖：

1. **一级缓存（singletonObjects）**：完全初始化的单例对象
2. **二级缓存（earlySingletonObjects）**：早期暴露的对象
3. **三级缓存（singletonFactories）**：对象工厂

**流程**：
```
1. A 实例化 → 放入三级缓存
2. A 属性填充 → 需要 B
3. B 实例化 → 放入三级缓存
4. B 属性填充 → 需要 A
5. 从三级缓存获取 A → 放入二级缓存
6. B 完成初始化 → 放入一级缓存
7. A 注入 B → 完成初始化 → 放入一级缓存
```

### 6.2 哪些循环依赖无法解决？

**答案**：
1. **构造器循环依赖**：无法提前暴露
2. **原型 Bean 循环依赖**：不缓存
3. **单例代理 Bean 的特殊情况**

---

## 7. 高频综合题

### 7.1 Spring 的核心模块有哪些？

**答案**：
- **Core Container**：spring-core、spring-beans、spring-context、spring-expression
- **AOP**：spring-aop、spring-aspects
- **Data Access**：spring-jdbc、spring-tx、spring-orm
- **Web**：spring-web、spring-webmvc
- **Test**：spring-test

### 7.2 Spring Boot 自动配置原理？

**答案**：
1. **@EnableAutoConfiguration** 导入 AutoConfigurationImportSelector
2. 读取 **spring.factories** 中的自动配置类
3. **@Conditional** 条件装配
4. 创建 Bean 并注册到容器

### 7.3 如何自定义 Spring Boot Starter？

**答案**：
1. 创建 Maven 项目
2. 定义配置属性类（@ConfigurationProperties）
3. 定义自动配置类（@Configuration + @ConditionalOnXxx）
4. 在 META-INF/spring.factories 中注册自动配置类
5. 其他项目引入依赖即可使用

---

## 8. 学习建议

**面试准备策略**：
1. **分层回答**：基础概念 → 深入原理 → 源码分析
2. **结合实践**：能举出实际应用场景
3. **画图说明**：流程图、架构图更清晰
4. **追问准备**：预想面试官可能的追问

**高频考点优先级**：
1. ⭐⭐⭐⭐⭐ IoC/DI、Bean 生命周期、AOP、事务管理
2. ⭐⭐⭐⭐ 循环依赖、Spring MVC、自动配置
3. ⭐⭐⭐ 设计模式、扩展点、事件机制

---

**上一章** ← [第 35 章：微服务实战](./content-35.md)  
**下一章** → [第 37 章：IoC 和 AOP 深度面试题](./content-37.md)  
**返回目录** → [学习大纲](../content-outline.md)

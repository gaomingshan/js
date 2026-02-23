# 第 46 章：综合面试题汇总

汇总 Spring Boot 核心知识点的面试题，帮助你系统化准备技术面试。

**学习目标：**
- 掌握 Spring Boot 高频面试题
- 理解面试题背后的原理
- 提升面试应答能力

---

## 46.1 基础知识

### Q1：Spring Boot 的核心特性是什么？

**答案：**
1. **自动配置**：根据 classpath 和配置自动配置应用
2. **Starter 依赖**：一站式依赖管理
3. **嵌入式容器**：内置 Tomcat/Jetty/Undertow
4. **生产就绪**：Actuator 提供监控和管理功能
5. **约定大于配置**：减少配置，快速开发

### Q2：Spring Boot 与 Spring Framework 的关系？

**答案：**
- Spring Boot 基于 Spring Framework
- 不是替代，而是增强和简化
- 提供自动配置、开箱即用的特性
- 降低学习曲线，提升开发效率

---

## 46.2 自动配置原理

### Q3：@SpringBootApplication 注解的作用？

**答案：**
三合一注解：
1. `@SpringBootConfiguration`：标记为配置类
2. `@EnableAutoConfiguration`：启用自动配置
3. `@ComponentScan`：组件扫描

### Q4：自动配置的原理是什么？

**答案：**
1. `@EnableAutoConfiguration` 导入 `AutoConfigurationImportSelector`
2. 从 `META-INF/spring.factories` 加载自动配置类
3. 通过条件注解（@Conditional*）过滤
4. 注册符合条件的 Bean 到容器

---

## 46.3 条件装配

### Q5：@ConditionalOnMissingBean 的作用？

**答案：**
当容器中不存在指定 Bean 时才创建 Bean，实现用户配置优先。

**示例：**
```java
@Bean
@ConditionalOnMissingBean
public DataSource dataSource() {
    return new HikariDataSource();
}
```

---

## 46.4 高级组件开发

### Q6：如何实现类似 MyBatis @MapperScan 的功能？

**答案：**
核心技术栈：
1. **ImportBeanDefinitionRegistrar**：动态注册 BeanDefinition
2. **ClassPathScanner**：扫描指定包下的接口
3. **FactoryBean**：为每个接口创建代理对象
4. **JDK 动态代理**：拦截方法调用

### Q7：FactoryBean 与普通 Bean 的区别？

**答案：**
- **FactoryBean**：通过 getObject() 创建 Bean，用于复杂对象创建
- **普通 Bean**：通过构造方法或工厂方法创建
- 获取 FactoryBean 本身需要加 & 前缀

---

## 46.5 启动流程

### Q8：Spring Boot 启动流程的关键步骤？

**答案：**
1. 创建 SpringApplication 实例
2. 准备 Environment
3. 创建 ApplicationContext
4. 准备 ApplicationContext
5. **刷新 ApplicationContext**（核心，自动配置生效）
6. 调用 Runners
7. 发布 ready 事件

### Q9：自动配置在哪个阶段生效？

**答案：**
在 `refreshContext()` 的 `invokeBeanFactoryPostProcessors()` 阶段，`ConfigurationClassPostProcessor` 处理自动配置类。

---

## 46.6 实战问题

### Q10：如何开发自定义 Starter？

**答案：**
1. 创建自动配置类（@AutoConfiguration）
2. 创建配置属性类（@ConfigurationProperties）
3. 编写 spring.factories 文件
4. 提供配置元数据（spring-configuration-metadata.json）
5. 编写文档

### Q11：如何排查自动配置不生效的问题？

**答案：**
1. 启用 debug 模式：`debug=true`
2. 查看条件评估报告
3. 检查依赖是否正确引入
4. 检查条件注解是否满足
5. 访问 `/actuator/conditions` 端点

---

## 46.7 性能优化

### Q12：如何优化 Spring Boot 启动速度？

**答案：**
1. **懒加载**：`spring.main.lazy-initialization=true`
2. **排除不需要的自动配置**
3. **使用 Lite 模式**：`@Configuration(proxyBeanMethods = false)`
4. **减少组件扫描范围**
5. **使用 Spring Native**（AOT）

---

## 46.8 本章小结

**核心要点：**
1. 掌握 Spring Boot 核心原理
2. 理解自动配置、条件装配机制
3. 熟悉高级组件开发技术
4. 掌握常见问题的解决方案

**学习建议：**
1. 深入理解原理，而非死记硬背
2. 动手实践，加深理解
3. 结合实际项目经验
4. 持续学习，关注新特性

---

**恭喜你完成 Spring Boot 核心原理系统化学习！**

继续深入学习，不断实践，你将成为 Spring Boot 专家！

**相关章节：**
- [第 1 章：Spring Boot 简介与核心特性](./content-1.md)
- [第 21 章：SpringApplication.run() 完整流程](./content-21.md)
- [第 37 章：从零实现自己的 @MapperScan](./content-37.md)

# Spring Boot 核心原理系统化学习大纲

> **课程定位**：深入 Spring Boot 核心机制、掌握高级组件开发能力  
> **学习目标**：透彻理解运行逻辑 + 开发自定义 Starter + 实现复杂组件（类似 MyBatis/Feign）  
> **总章节数**：46 章 + 面试题汇总

---

## 学习路线图

```
Spring Boot 核心特性
    ↓
自动配置原理深入
    ↓
条件装配机制
    ↓
配置管理体系
    ↓
嵌入式容器原理
    ↓
启动流程与扩展点
    ↓
Starter 开发基础
    ↓
组件扫描与 BeanDefinition 注册
    ↓
动态代理与 FactoryBean
    ↓
高级组件开发（MapperScan/FeignClient 实现）
    ↓
生产级特性 Actuator
    ↓
Spring Boot 核心扩展点
    ↓
面试准备
```

---

## 第一部分：Spring Boot 核心特性与设计理念（3章）

### [第 1 章：Spring Boot 简介与核心特性](./content/content-1.md)
**核心内容**：诞生背景、核心特性（自动配置、starter、嵌入式容器、Actuator）、快速开始  
**学习重点**：理解 Spring Boot 解决的核心问题、与 Spring 的关系  
**预计时长**：1 小时

### [第 2 章：约定大于配置设计理念](./content/content-2.md)
**核心内容**：约定大于配置思想、默认配置体系、覆盖机制  
**学习重点**：理解 Spring Boot 设计哲学  
**预计时长**：1 小时

### [第 3 章：Spring Boot 运行机制概览](./content/content-3.md)
**核心内容**：整体架构、核心流程、关键组件、扩展点体系  
**学习重点**：建立 Spring Boot 完整认知框架  
**预计时长**：1.5 小时

---

## 第二部分：自动配置原理深入（5章）

### [第 4 章：@SpringBootApplication 注解剖析](./content/content-4.md)
**核心内容**：三合一注解、@SpringBootConfiguration、@ComponentScan、@EnableAutoConfiguration 解析  
**学习重点**：理解启动类注解的完整作用机制  
**预计时长**：1.5 小时

### [第 5 章：@EnableAutoConfiguration 原理](./content/content-5.md)
**核心内容**：@Import 导入机制、AutoConfigurationImportSelector、DeferredImportSelector  
**学习重点**：理解自动配置的启用与延迟导入  
**预计时长**：2 小时

### [第 6 章：spring.factories 与 SPI 机制](./content/content-6.md)
**核心内容**：spring.factories 文件、SpringFactoriesLoader、自定义 SPI 扩展点  
**学习重点**：掌握 Spring Boot SPI 扩展机制  
**预计时长**：2 小时

### [第 7 章：AutoConfigurationImportSelector 源码](./content/content-7.md)
**核心内容**：selectImports() 流程、配置类过滤、排序、去重机制  
**学习重点**：深入理解自动配置类加载全流程  
**预计时长**：2.5 小时

### [第 8 章：自动配置类编写规范](./content/content-8.md)
**核心内容**：配置类结构、@AutoConfigureAfter/@Before、@AutoConfigureOrder  
**学习重点**：掌握编写标准自动配置类  
**预计时长**：2 小时

---

## 第三部分：条件装配机制（4章）

### [第 9 章：@Conditional 条件注解体系](./content/content-9.md)
**核心内容**：@Conditional 原理、Condition 接口、常用条件注解全解析  
**学习重点**：理解条件装配核心机制  
**预计时长**：2 小时

### [第 10 章：ConditionEvaluator 源码分析](./content/content-10.md)
**核心内容**：条件评估流程、matches() 方法、ConditionContext、AnnotatedTypeMetadata  
**学习重点**：深入理解条件评估过程  
**预计时长**：2.5 小时

### [第 11 章：自定义条件注解开发](./content/content-11.md)
**核心内容**：自定义 Condition 实现、元注解组合、条件注解最佳实践  
**学习重点**：掌握自定义条件装配  
**预计时长**：2 小时

### [第 12 章：条件装配高级技巧](./content/content-12.md)
**核心内容**：多条件组合策略、条件优先级控制、调试与排查  
**学习重点**：掌握复杂条件装配场景  
**预计时长**：2 小时

---

## 第四部分：配置管理体系（4章）

### [第 13 章：配置文件加载机制](./content/content-13.md)
**核心内容**：application.properties/yml、配置文件位置、加载顺序、Profile 激活  
**学习重点**：理解配置文件完整加载流程  
**预计时长**：2 小时

### [第 14 章：配置优先级与覆盖机制](./content/content-14.md)
**核心内容**：17 种配置源、优先级顺序、命令行参数、环境变量、外部配置  
**学习重点**：掌握配置覆盖规则  
**预计时长**：2 小时

### [第 15 章：@ConfigurationProperties 绑定原理](./content/content-15.md)
**核心内容**：属性绑定机制、类型转换、嵌套绑定、Relaxed Binding、校验支持  
**学习重点**：掌握类型安全配置绑定  
**预计时长**：2 小时

### [第 16 章：Environment 抽象与扩展](./content/content-16.md)
**核心内容**：Environment 接口、PropertySource、PropertyResolver、自定义配置源  
**学习重点**：掌握 Environment 扩展机制  
**预计时长**：2 小时

---

## 第五部分：嵌入式容器原理（4章）

### [第 17 章：嵌入式容器架构设计](./content/content-17.md)
**核心内容**：嵌入式容器概念、可执行 jar 原理、FatJar 与传统 war 对比  
**学习重点**：理解嵌入式容器工作原理  
**预计时长**：2 小时

### [第 18 章：ServletWebServerFactory 机制](./content/content-18.md)
**核心内容**：ServletWebServerFactory 接口、TomcatServletWebServerFactory、容器创建流程  
**学习重点**：深入理解容器创建机制  
**预计时长**：2.5 小时

### [第 19 章：容器自动配置源码](./content/content-19.md)
**核心内容**：ServletWebServerFactoryAutoConfiguration、容器选型机制、条件装配  
**学习重点**：掌握容器自动配置实现  
**预计时长**：2 小时

### [第 20 章：容器定制化与扩展](./content/content-20.md)
**核心内容**：WebServerFactoryCustomizer、端口配置、SSL、压缩、连接器定制  
**学习重点**：掌握容器深度定制  
**预计时长**：2 小时

---

## 第六部分：启动流程与扩展点（3章）

### [第 21 章：SpringApplication.run() 完整流程](./content/content-21.md)
**核心内容**：run() 方法 12 个关键步骤、源码深入分析、时序图  
**学习重点**：透彻掌握 Spring Boot 启动全过程  
**预计时长**：3 小时

### [第 22 章：ApplicationContext 初始化机制](./content/content-22.md)
**核心内容**：ApplicationContext 创建、Environment 准备、BeanDefinition 加载、Refresh 流程  
**学习重点**：理解容器初始化完整过程  
**预计时长**：2.5 小时

### [第 23 章：Spring Boot 事件与监听器](./content/content-23.md)
**核心内容**：SpringApplicationRunListener、ApplicationListener、启动事件体系、自定义监听器  
**学习重点**：掌握启动扩展点机制  
**预计时长**：2 小时

---

## 第七部分：Starter 开发基础（4章）

### [第 24 章：Starter 设计原则与规范](./content/content-24.md)
**核心内容**：Starter 设计理念、命名规范、依赖管理、单一职责  
**学习重点**：理解 Starter 设计思想  
**预计时长**：1.5 小时

### [第 25 章：基础 Starter 开发实战](./content/content-25.md)
**核心内容**：Starter 项目结构、pom.xml、自动配置类、配置属性绑定  
**学习重点**：完整开发一个基础 Starter  
**预计时长**：3 小时

### [第 26 章：Starter 依赖管理与 BOM](./content/content-26.md)
**核心内容**：依赖传递、排除、版本管理、BOM（Bill of Materials）  
**学习重点**：掌握 Starter 依赖管理  
**预计时长**：2 小时

### [第 27 章：配置提示与文档](./content/content-27.md)
**核心内容**：spring-configuration-metadata.json、IDE 提示、文档编写、测试策略  
**学习重点**：掌握 Starter 完善开发  
**预计时长**：2 小时

---

## 第八部分：组件扫描与 BeanDefinition 注册（4章）

### [第 28 章：组件扫描原理](./content/content-28.md)
**核心内容**：@ComponentScan 原理、ClassPathBeanDefinitionScanner、自定义扫描规则  
**学习重点**：理解组件扫描机制  
**预计时长**：2 小时

### [第 29 章：BeanDefinition 注册机制](./content/content-29.md)
**核心内容**：BeanDefinitionRegistry、BeanDefinitionRegistryPostProcessor、手动注册 Bean  
**学习重点**：掌握动态注册 Bean 的方法  
**预计时长**：2 小时

### [第 30 章：@Import 与 ImportSelector](./content/content-30.md)
**核心内容**：@Import 导入机制、ImportSelector、ImportBeanDefinitionRegistrar、动态注册  
**学习重点**：掌握动态导入与注册  
**预计时长**：2.5 小时

### [第 31 章：自定义扫描注解开发](./content/content-31.md)
**核心内容**：实现类似 @MapperScan 的自定义扫描注解、组合 ImportBeanDefinitionRegistrar  
**学习重点**：掌握自定义扫描注解开发  
**预计时长**：2.5 小时

---

## 第九部分：动态代理与 FactoryBean（4章）

### [第 32 章：FactoryBean 原理与应用](./content/content-32.md)
**核心内容**：FactoryBean 接口、getObject() 机制、FactoryBean vs BeanFactory、应用场景  
**学习重点**：理解 FactoryBean 工作原理  
**预计时长**：2 小时

### [第 33 章：JDK 动态代理实现](./content/content-33.md)
**核心内容**：Proxy.newProxyInstance()、InvocationHandler、代理对象创建流程  
**学习重点**：掌握 JDK 动态代理机制  
**预计时长**：2 小时

### [第 34 章：CGLIB 动态代理实现](./content/content-34.md)
**核心内容**：Enhancer、MethodInterceptor、CGLIB 与 JDK 代理对比、使用场景  
**学习重点**：掌握 CGLIB 代理机制  
**预计时长**：2 小时

### [第 35 章：基于 FactoryBean 实现代理](./content/content-35.md)
**核心内容**：FactoryBean + 动态代理组合、代理对象延迟创建、实战示例  
**学习重点**：掌握 FactoryBean 创建代理对象  
**预计时长**：2.5 小时

---

## 第十部分：高级组件开发实战（5章）

### [第 36 章：MyBatis @MapperScan 实现原理](./content/content-36.md)
**核心内容**：MyBatis Mapper 接口代理原理、MapperScannerRegistrar、MapperFactoryBean  
**学习重点**：分析 MyBatis 组件开发思路  
**预计时长**：2.5 小时

### [第 37 章：实现自己的 @MapperScan](./content/content-37.md)
**核心内容**：从零实现 @MapperScan 功能、扫描接口、生成代理、注册 Bean  
**学习重点**：掌握高级组件开发完整流程  
**预计时长**：3 小时

### [第 38 章：Feign @FeignClient 实现原理](./content/content-38.md)
**核心内容**：Feign 接口代理原理、FeignClientRegistrar、FeignClientFactoryBean  
**学习重点**：分析 Feign 组件开发思路  
**预计时长**：2.5 小时

### [第 39 章：实现自己的 RPC 客户端](./content/content-39.md)
**核心内容**：设计自定义 @RpcClient 注解、HTTP 调用封装、完整实现  
**学习重点**：掌握 RPC 类组件开发能力  
**预计时长**：3 小时

### [第 40 章：高级 Starter 开发综合实战](./content/content-40.md)
**核心内容**：整合扫描+代理+自动配置，开发一个完整的企业级 Starter  
**学习重点**：综合运用所有技术点  
**预计时长**：3 小时

---

## 第十一部分：生产级特性 Actuator（3章）

### [第 41 章：Actuator 端点体系](./content/content-41.md)
**核心内容**：Actuator 简介、内置端点、端点暴露配置、自定义端点  
**学习重点**：掌握 Actuator 基本使用  
**预计时长**：2 小时

### [第 42 章：健康检查与指标监控](./content/content-42.md)
**核心内容**：HealthIndicator 自定义、Micrometer 指标、自定义指标  
**学习重点**：掌握监控扩展开发  
**预计时长**：2 小时

### [第 43 章：Actuator 源码剖析](./content/content-43.md)
**核心内容**：Endpoint 注解原理、EndpointAutoConfiguration、端点发现机制  
**学习重点**：深入理解 Actuator 实现  
**预计时长**：2.5 小时

---

## 第十二部分：面试准备（3章）

### [第 44 章：Spring Boot 核心原理面试题](./content/content-44.md)
**核心内容**：自动配置原理、条件装配、Starter 机制、配置管理、嵌入式容器高频题  
**学习重点**：掌握核心原理面试答题  
**预计时长**：2 小时

### [第 45 章：高级组件开发面试题](./content/content-45.md)
**核心内容**：扫描+代理+FactoryBean、如何实现 @MapperScan、深度源码题  
**学习重点**：掌握高级组件开发面试  
**预计时长**：2 小时

### [第 46 章：Spring Boot 综合面试题](./content/content-46.md)
**核心内容**：启动优化、扩展点应用、故障排查、架构设计综合题  
**学习重点**：掌握综合能力展示  
**预计时长**：2 小时

---

## 面试题汇总

### [面试题汇总（quiz/quiz.md）](./quiz/quiz.md)
**包含内容**：
- 初级岗位题库（30 题）- 0-2 年经验
- 中级岗位题库（50 题）- 2-5 年经验
- 高级岗位题库（40 题）- 5+ 年经验
- 架构岗位题库（30 题）- 架构师/技术专家

**题型分布**：
- 概念辨析题：20%
- 原理解析题：30%
- 场景分析题：25%
- 源码追踪题：15%
- 方案设计题：10%

---

## 学习建议

### 学习路径

**阶段一：基础入门（第 1-3 章，3 天）**
- 理解 Spring Boot 的核心价值
- 掌握快速开始与基本配置
- 了解与 Spring 的区别

**阶段二：自动配置原理（第 4-12 章，2 周）**
- 深入理解自动配置机制
- 掌握条件装配原理
- 能够阅读自动配置源码

**阶段三：Starter 开发（第 13-16 章，1 周）**
- 掌握 Starter 设计原则
- 能够开发企业级 Starter
- 理解依赖管理最佳实践

**阶段四：配置与容器（第 17-27 章，2 周）**
- 掌握配置管理体系
- 理解嵌入式容器原理
- 掌握启动流程与扩展点

**阶段五：生产特性与集成（第 28-38 章，2 周）**
- 掌握 Actuator 监控
- 掌握数据访问集成
- 掌握缓存、异步、消息队列

**阶段六：实战与面试（第 39-45 章 + 面试题，2 周）**
- 掌握性能优化方法
- 掌握监控运维实践
- 系统化面试准备

### 学习方法

1. **理论+实践**：每学完一章，动手实践验证
2. **源码阅读**：重要章节需要阅读对应源码
3. **画图总结**：绘制流程图、架构图加深理解
4. **问题驱动**：带着问题学习，解决实际问题
5. **定期复习**：使用自检清单定期复习

### 配套资源

- **源码仓库**：github.com/spring-projects/spring-boot
- **官方文档**：docs.spring.io/spring-boot/docs/current/reference/html/
- **示例代码**：每章提供完整可运行示例
- **思维导图**：提供核心知识点思维导图

---

## 自检清单

学完本课程后，你应该能够：

**理论知识**
- [ ] 解释 Spring Boot 自动配置的完整流程
- [ ] 说明 @Conditional 系列注解的评估机制
- [ ] 描述 Starter 的设计原则和编写规范
- [ ] 阐述配置加载的优先级顺序
- [ ] 分析嵌入式容器的启动原理

**实践能力**
- [ ] 独立开发高质量的自定义 Starter
- [ ] 排查自动配置不生效的问题
- [ ] 优化 Spring Boot 应用启动性能
- [ ] 使用 Actuator 构建监控体系
- [ ] 实现多数据源与分布式事务

**源码阅读**
- [ ] 能够阅读 SpringApplication 启动源码
- [ ] 能够追踪自动配置类的加载流程
- [ ] 能够理解 ServletWebServerFactory 实现
- [ ] 能够分析 Actuator 端点源码

**面试准备**
- [ ] 能够回答自动配置原理相关问题
- [ ] 能够解释条件装配的工作机制
- [ ] 能够设计自定义 Starter 方案
- [ ] 能够分析性能优化场景
- [ ] 能够应对架构设计类问题

---

**开始学习** → [第 1 章：Spring Boot 简介与核心特性](./content/content-1.md)  
**面试准备** → [面试题汇总](./quiz/quiz.md)

---

*本大纲基于 Spring Boot 3.x 版本编写，部分内容适用于 2.x 版本*

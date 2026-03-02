# Spring Aspects 源码指引

> spring-aspects 提供预定义的 AspectJ 切面，包括事务、缓存、异步等企业级功能的切面实现。

---

## 1. AspectJ 集成

### 编译时织入（CTW）
- 使用 AspectJ 编译器（ajc）
- 在编译阶段织入切面
- 性能最优，无运行时开销

### 加载时织入（LTW）
- 在类加载时织入切面
- 需配置 Java Agent（spring-instrument-{version}.jar）
- 平衡性能和易用性

### 配置方式
```xml
<context:load-time-weaver/>
```

或 Java 配置：
```java
@EnableLoadTimeWeaving
```

### 设计目的
提供 AspectJ 编译器和加载时织入支持，实现比 Spring AOP 更强大的 AOP 功能。

### 使用限制与风险
- 需配置 AspectJ 编译器或 Java Agent
- 构建和部署复杂度增加
- 适合需要代理 final 类、私有方法等场景

---

## 2. 声明式事务切面

### 核心类
- **AnnotationTransactionAspect** - 基于注解的事务切面
- **JtaAnnotationTransactionAspect** - JTA 事务切面

### 设计目的
通过 AspectJ 实现声明式事务，相比 Spring AOP 代理方式：
- 支持私有方法事务
- 支持内部方法调用事务
- 无代理对象创建开销

### 使用限制与风险
- 需启用 LTW 或使用 ajc 编译
- @Transactional 仍需遵循事务语义
- 与 Spring AOP 事务不可混用

---

## 3. 声明式缓存切面

### 核心类
- **AnnotationCacheAspect** - 基于注解的缓存切面

### 设计目的
通过 AspectJ 实现声明式缓存（@Cacheable、@CacheEvict、@CachePut），解决 Spring AOP 的代理限制。

### 使用限制与风险
- 需启用 LTW 或使用 ajc 编译
- 缓存注解语义与 Spring Cache 一致

---

## 4. @Configurable 支持

### 核心类
- **AnnotationBeanConfigurerAspect** - Bean 配置切面

### @Configurable 注解
允许在 Spring 容器外部创建的对象（如 `new` 创建的对象）自动注入依赖。

### 使用示例
```java
@Configurable
public class DomainObject {
    @Autowired
    private SomeService service;
    
    public DomainObject() {
        // service 会被自动注入
    }
}
```

### 设计目的
解决领域对象（Domain Object）依赖注入问题，常用于 DDD（领域驱动设计）场景。

### 使用限制与风险
- **必须启用 LTW**，且需配置 `META-INF/aop.xml`
- 仅对 AspectJ 织入的对象生效
- 性能开销较大（每次 new 对象都触发切面）
- 容易滥用，建议仅在领域对象中使用

---

## 5. 异步切面

### 核心类
- **AnnotationAsyncExecutionAspect** - 异步执行切面

### 设计目的
通过 AspectJ 实现 @Async 异步调用，支持私有方法和内部调用。

### 使用限制与风险
- 需启用 LTW 或使用 ajc 编译
- 异步方法返回值仍需是 void 或 Future 系列

---

## 6. 配置加载时织入

### META-INF/aop.xml 配置
```xml
<!DOCTYPE aspectj PUBLIC "-//AspectJ//DTD//EN" "https://www.eclipse.org/aspectj/dtd/aspectj.dtd">
<aspectj>
    <weaver options="-verbose -showWeaveInfo">
        <include within="com.example..*"/>
    </weaver>
    <aspects>
        <aspect name="org.springframework.beans.factory.aspectj.AnnotationBeanConfigurerAspect"/>
        <aspect name="org.springframework.transaction.aspectj.AnnotationTransactionAspect"/>
    </aspects>
</aspectj>
```

### Java Agent 启动参数
```bash
java -javaagent:path/to/spring-instrument-{version}.jar -jar app.jar
```

### 设计目的
配置 AspectJ 织入器，指定要织入的类和切面。

### 使用限制与风险
- aop.xml 必须在 classpath 的 META-INF 目录下
- weaver 的 include/exclude 配置影响性能
- Java Agent 需在启动参数中指定

---

## 7. 与 Spring AOP 对比

### Spring AOP（运行时织入）
- **优点**：配置简单，无需特殊编译器或 Agent
- **缺点**：仅支持方法级拦截，内部调用不生效，无法代理 final 类/方法

### AspectJ（编译时/加载时织入）
- **优点**：功能强大，支持字段级、构造器级、final 方法等，无代理开销
- **缺点**：配置复杂，需编译器或 Agent，学习曲线陡峭

### 选择建议
- 普通企业应用：Spring AOP 足够
- 需要更强 AOP 能力（如 @Configurable、私有方法事务）：AspectJ LTW
- 性能敏感场景：AspectJ CTW

---

## 📚 总结

spring-aspects 提供了 AspectJ 切面实现：
- **事务切面**：AnnotationTransactionAspect
- **缓存切面**：AnnotationCacheAspect
- **异步切面**：AnnotationAsyncExecutionAspect
- **@Configurable 支持**：AnnotationBeanConfigurerAspect

这些切面需配合 AspectJ 编译器（CTW）或加载时织入（LTW）使用，提供比 Spring AOP 更强大的功能，但配置和部署复杂度更高。适合有特殊 AOP 需求的场景。

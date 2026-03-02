# Spring Instrument 源码指引

> spring-instrument 提供类加载时织入（Load-Time Weaving, LTW）支持，是 AspectJ LTW 的基础设施。

---

## 1. 类加载时织入（LTW）

### 核心概念
- **Load-Time Weaving** - 在类加载到 JVM 时修改字节码，织入切面逻辑
- **Java Agent** - JVM 代理，拦截类加载过程
- **ClassFileTransformer** - 类文件转换器，修改字节码

### 工作流程
1. JVM 启动时加载 Java Agent（spring-instrument.jar）
2. Agent 注册 ClassFileTransformer
3. 类加载时，Transformer 修改字节码（织入切面）
4. 修改后的字节码被加载到 JVM

### 设计目的
为 AspectJ LTW 提供基础设施，无需修改源码或编译期织入即可实现 AOP。

### 使用限制与风险
- 需在 JVM 启动参数中指定 `-javaagent`
- 字节码修改有性能开销
- 配置错误可能导致类加载失败

---

## 2. InstrumentationSavingAgent

### 核心类
- **InstrumentationSavingAgent** - 保存 Instrumentation 实例的 Agent
- **Instrumentation** - JDK 原生接口，提供类转换能力

### Java Agent 入口
```java
public class InstrumentationSavingAgent {
    public static void premain(String agentArgs, Instrumentation inst) {
        // 保存 Instrumentation 实例
    }
    
    public static void agentmain(String agentArgs, Instrumentation inst) {
        // 动态 Attach 场景
    }
}
```

### 设计目的
保存 JVM 提供的 Instrumentation 实例，供 Spring 和 AspectJ 使用。

### 使用限制与风险
- premain 在 main 方法之前执行
- agentmain 用于动态 Attach（运行时加载 Agent）
- Instrumentation 是全局单例

---

## 3. ClassFileTransformer 支持

### 核心接口
- **ClassFileTransformer** - JDK 原生接口，转换类文件
  - `transform()` - 转换类字节码

### Spring 封装
- **InstrumentationLoadTimeWeaver** - 基于 Instrumentation 的 LTW
- **ReflectiveLoadTimeWeaver** - 基于反射的 LTW（适配不同容器）
- **TomcatLoadTimeWeaver** - Tomcat 专用 LTW
- **GlassFishLoadTimeWeaver** - GlassFish 专用 LTW
- **WebLogicLoadTimeWeaver** - WebLogic 专用 LTW
- **JBossLoadTimeWeaver** - JBoss 专用 LTW

### 设计目的
统一不同应用服务器的 LTW 实现，简化配置。

### 使用限制与风险
- 不同容器的 LTW 机制不同
- Spring Boot 内嵌容器需使用 InstrumentationLoadTimeWeaver + Java Agent

---

## 4. 启动配置

### Java Agent 方式（通用）
```bash
java -javaagent:path/to/spring-instrument-{version}.jar -jar app.jar
```

### Spring Boot 配置
```java
@Configuration
@EnableLoadTimeWeaving
public class LtwConfig {
}
```

或配置文件：
```properties
spring.jpa.properties.hibernate.ejb.use_class_enhancer=true
```

### Tomcat 配置（无需 Agent）
在 `context.xml` 中配置：
```xml
<Context>
    <Loader loaderClass="org.springframework.instrument.classloading.tomcat.TomcatInstrumentableClassLoader"/>
</Context>
```

### 设计目的
提供多种启动配置方式，适配不同部署环境。

### 使用限制与风险
- Java Agent 方式最通用但需修改启动脚本
- Tomcat 等容器可利用自身机制，无需 Agent
- Spring Boot 内嵌容器必须使用 Agent

---

## 5. META-INF/aop.xml 配置

### 配置示例
```xml
<!DOCTYPE aspectj PUBLIC "-//AspectJ//DTD//EN" "https://www.eclipse.org/aspectj/dtd/aspectj.dtd">
<aspectj>
    <weaver options="-verbose -showWeaveInfo">
        <!-- 包含哪些包的类 -->
        <include within="com.example..*"/>
        <!-- 排除哪些包的类 -->
        <exclude within="com.example.exclude..*"/>
    </weaver>
    
    <aspects>
        <!-- 要织入的切面 -->
        <aspect name="com.example.aspects.LoggingAspect"/>
        <aspect name="org.springframework.transaction.aspectj.AnnotationTransactionAspect"/>
    </aspects>
</aspectj>
```

### 配置选项
- **weaver options** - AspectJ 织入器选项
  - `-verbose` - 详细日志
  - `-showWeaveInfo` - 显示织入信息
  - `-Xlint:ignore` - 忽略警告
- **include/exclude** - 指定要织入的类范围
- **aspects** - 列出所有切面类

### 设计目的
配置 AspectJ 织入行为，控制哪些类被织入哪些切面。

### 使用限制与风险
- 配置文件必须位于 `META-INF/aop.xml`
- include/exclude 范围越大，织入开销越大
- 切面类必须在 classpath 中

---

## 6. LoadTimeWeaver 抽象

### 核心接口
- **LoadTimeWeaver** - 加载时织入器接口
  - `addTransformer()` - 添加类转换器
  - `getInstrumentableClassLoader()` - 获取可增强的类加载器

### 实现类
- **InstrumentationLoadTimeWeaver** - 基于 Instrumentation（需 Java Agent）
- **ReflectiveLoadTimeWeaver** - 基于反射（自动检测容器）
- **TomcatLoadTimeWeaver** - Tomcat 专用
- **GlassFishLoadTimeWeaver** - GlassFish 专用
- **WebLogicLoadTimeWeaver** - WebLogic 专用
- **JBossLoadTimeWeaver** - JBoss 专用
- **DefaultContextLoadTimeWeaver** - 默认实现（自动选择）

### 设计目的
抽象不同容器和环境的 LTW 机制，提供统一 API。

### 使用限制与风险
- Spring 会自动检测容器并选择合适的 LoadTimeWeaver
- 手动指定 LoadTimeWeaver 需了解容器特性

---

## 7. 与 AspectJ 集成

### 集成流程
1. spring-instrument 提供 Java Agent 和 ClassFileTransformer
2. AspectJ Weaver 实现具体的字节码织入逻辑
3. Spring 通过 LoadTimeWeaver 桥接两者

### 依赖关系
```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-instrument</artifactId>
</dependency>
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
</dependency>
```

### 设计目的
spring-instrument 是基础设施，AspectJ 是具体实现，两者配合实现 LTW。

### 使用限制与风险
- 版本兼容性需注意
- aspectjweaver 必须在 classpath 中

---

## 8. 性能影响

### 启动性能
- 类加载时需织入字节码，启动时间增加
- 织入范围越大，影响越明显

### 运行时性能
- 字节码已修改，无运行时代理开销
- 性能优于 Spring AOP 代理方式

### 内存占用
- 织入后的类字节码更大
- 需额外内存保存 Instrumentation 和 Transformer

### 优化建议
- 精确配置 include/exclude，减少不必要的织入
- 仅在必要场景使用 LTW（如 @Configurable、私有方法事务）

---

## 9. 常见问题

### Agent 未生效
- 检查启动参数 `-javaagent` 路径是否正确
- 确认 META-INF/aop.xml 配置正确
- 查看日志，AspectJ 会输出织入信息（如启用 `-verbose`）

### 类加载失败
- 检查 include/exclude 配置
- 确认切面类在 classpath 中
- 查看是否有字节码版本不兼容问题

### 性能问题
- 减少织入范围
- 使用 CTW 替代 LTW（编译时织入性能更优）

---

## 📚 总结

spring-instrument 是 Spring LTW 的基础设施：
- **InstrumentationSavingAgent**：保存 Instrumentation 实例
- **ClassFileTransformer**：字节码转换接口
- **LoadTimeWeaver**：统一的 LTW 抽象
- **容器适配**：支持 Tomcat、GlassFish、WebLogic、JBoss 等

LTW 相比 Spring AOP 代理方式更强大（支持 final 方法、私有方法、@Configurable 等），但配置和部署复杂度更高，适合有特殊需求的场景。

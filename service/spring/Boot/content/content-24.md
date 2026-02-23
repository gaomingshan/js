# 第 24 章：Starter 设计原则与规范

## 本章概述

深入讲解 Starter 的设计理念、命名规范、依赖管理原则和单一职责原则。

**学习目标：**
- 理解 Starter 的设计思想
- 掌握 Starter 命名规范
- 学会合理管理依赖
- 理解单一职责原则

---

## 24.1 Starter 设计理念

### 核心思想

**约定大于配置 + 开箱即用**

```
引入一个 Starter
    ↓
自动引入所有必需依赖
    ↓
自动配置相关组件
    ↓
开箱即用
```

### Starter 职责

1. **依赖管理**：聚合相关依赖
2. **自动配置**：提供默认配置
3. **配置属性**：提供可定制的配置

---

## 24.2 命名规范

### 官方 Starter

```
spring-boot-starter-{name}
```

**示例：**
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`

### 第三方 Starter

```
{name}-spring-boot-starter
```

**示例：**
- `mybatis-spring-boot-starter`
- `druid-spring-boot-starter`
- `knife4j-spring-boot-starter`

### 模块结构

```
{name}-spring-boot-starter           # Starter 模块（只包含依赖）
{name}-spring-boot-autoconfigure     # 自动配置模块
```

---

## 24.3 单一职责原则

### 一个 Starter 只做一件事

**✅ 好的设计：**
```
spring-boot-starter-data-redis    # 只负责 Redis
spring-boot-starter-data-mongodb  # 只负责 MongoDB
spring-boot-starter-cache         # 只负责缓存抽象
```

**❌ 不好的设计：**
```
my-spring-boot-starter            # 包含 Redis + MongoDB + Kafka
```

---

## 24.4 依赖管理原则

### 最小化依赖

**只引入必需的依赖：**

```xml
<!-- 好的设计 -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.data</groupId>
        <artifactId>spring-data-redis</artifactId>
    </dependency>
</dependencies>
```

### 使用 optional 依赖

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <optional>true</optional>
</dependency>
```

### 避免依赖冲突

```xml
<dependency>
    <groupId>some-lib</groupId>
    <artifactId>some-lib</artifactId>
    <exclusions>
        <exclusion>
            <groupId>conflict-lib</groupId>
            <artifactId>conflict-lib</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

---

## 24.5 配置属性设计

### 统一前缀

```java
@ConfigurationProperties(prefix = "myapp.redis")
public class MyRedisProperties {
    private String host = "localhost";
    private int port = 6379;
    // Getters and Setters
}
```

### 提供默认值

```java
@ConfigurationProperties(prefix = "myapp.cache")
public class CacheProperties {
    private Duration ttl = Duration.ofMinutes(10);  // 默认10分钟
    private int maxSize = 1000;                      // 默认1000条
    // Getters and Setters
}
```

---

## 24.6 文档规范

### README.md

```markdown
# MyApp Spring Boot Starter

## 快速开始

### 1. 引入依赖

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>myapp-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 2. 配置

```yaml
myapp:
  enabled: true
  timeout: 30s
```

### 3. 使用

```java
@Autowired
private MyAppService myAppService;
```

## 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| myapp.enabled | boolean | true | 是否启用 |
| myapp.timeout | Duration | 30s | 超时时间 |
```

---

## 24.7 本章小结

**核心要点：**
1. Starter 遵循约定大于配置理念
2. 命名规范：官方 `spring-boot-starter-*`，第三方 `*-spring-boot-starter`
3. 单一职责：一个 Starter 只做一件事
4. 最小化依赖，避免冲突
5. 提供完善的文档

**相关章节：**
- [第 25 章：基础 Starter 开发实战](./content-25.md)
- [第 26 章：Starter 依赖管理与 BOM](./content-26.md)

# 第 41 章：Actuator 核心端点

深入讲解 Spring Boot Actuator 的核心端点，包括健康检查、指标监控、环境信息等生产级特性。

**学习目标：**
- 掌握 Actuator 核心端点的使用
- 理解端点安全配置
- 学会自定义端点

---

## 41.1 Actuator 引入

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## 41.2 核心端点

### 健康检查 - /actuator/health

```yaml
management:
  endpoint:
    health:
      show-details: always
```

### 应用信息 - /actuator/info

```yaml
info:
  app:
    name: MyApp
    version: 1.0.0
```

### 指标监控 - /actuator/metrics

访问：`GET /actuator/metrics/jvm.memory.used`

### 环境信息 - /actuator/env

查看所有配置属性

### Bean 信息 - /actuator/beans

查看所有注册的 Bean

---

## 41.3 端点安全

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
      base-path: /actuator
  endpoint:
    health:
      show-details: when-authorized
```

---

## 41.4 本章小结

**核心要点：**
1. Actuator 提供生产级监控能力
2. 核心端点包括健康检查、指标、环境等
3. 需要合理配置端点安全

**相关章节：**
- [第 42 章：自定义健康检查](./content-42.md)
- [第 43 章：自定义 Metrics 指标](./content-43.md)

# 第 42 章：自定义健康检查

深入讲解如何实现自定义健康检查指示器，监控应用的各个组件状态。

**学习目标：**
- 掌握 HealthIndicator 接口
- 实现自定义健康检查
- 理解健康状态聚合

---

## 42.1 HealthIndicator 接口

```java
public interface HealthIndicator {
    Health health();
}
```

## 42.2 自定义健康检查

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        boolean isHealthy = checkHealth();
        
        if (isHealthy) {
            return Health.up()
                        .withDetail("status", "Service is running")
                        .withDetail("checks", 100)
                        .build();
        } else {
            return Health.down()
                        .withDetail("error", "Service is down")
                        .build();
        }
    }
    
    private boolean checkHealth() {
        // 健康检查逻辑
        return true;
    }
}
```

## 42.3 ReactiveHealthIndicator

```java
@Component
public class CustomReactiveHealthIndicator implements ReactiveHealthIndicator {
    
    @Override
    public Mono<Health> health() {
        return checkHealthAsync()
            .map(isHealthy -> isHealthy ? Health.up().build() : Health.down().build());
    }
    
    private Mono<Boolean> checkHealthAsync() {
        return Mono.just(true);
    }
}
```

---

## 42.4 本章小结

**核心要点：**
1. 实现 HealthIndicator 接口自定义健康检查
2. 支持同步和异步健康检查
3. 健康状态自动聚合

**相关章节：**
- [第 41 章：Actuator 核心端点](./content-41.md)
- [第 43 章：自定义 Metrics 指标](./content-43.md)

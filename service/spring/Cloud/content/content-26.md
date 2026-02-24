# 第26章：Sleuth + Zipkin 链路追踪

> **本章目标**：掌握分布式链路追踪，快速定位性能瓶颈和故障点

---

## 1. 链路追踪简介

**问题**：微服务架构下，一次请求经过多个服务，如何追踪？

**解决方案**：分布式链路追踪系统

**核心概念**：
- **Trace ID**：全局唯一追踪ID，贯穿整个调用链
- **Span ID**：单次调用的唯一ID
- **Parent Span ID**：父级Span ID

**调用链示例**：
```
Gateway → User Service → Order Service → Product Service
Trace ID: abc123
├─ Span 1 (Gateway)
│  └─ Span 2 (User Service)
│     └─ Span 3 (Order Service)
│        └─ Span 4 (Product Service)
```

---

## 2. Sleuth 快速入门

### 2.1 引入依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>
```

### 2.2 自动传递 Trace ID

**日志输出**：
```
2023-12-01 10:00:00 [user-service,abc123,def456,true] INFO ...
                    [服务名,TraceID,SpanID,是否导出]
```

**HTTP 请求头自动添加**：
```
X-B3-TraceId: abc123
X-B3-SpanId: def456
X-B3-ParentSpanId: xyz789
```

---

## 3. Zipkin 集成

### 3.1 启动 Zipkin Server

**Docker 启动**：
```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

**访问**：http://localhost:9411

### 3.2 应用配置

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-sleuth-zipkin</artifactId>
</dependency>
```

```yaml
spring:
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
      probability: 1.0  # 采样率（1.0=100%，生产环境建议0.1）
```

### 3.3 查看链路

1. 访问 Zipkin UI：http://localhost:9411
2. 选择服务、时间范围
3. 查看 Trace 详情
4. 分析耗时和依赖关系

---

## 4. 实战应用

### 4.1 性能分析

**识别慢服务**：
```
Gateway (10ms) → User Service (500ms) → Order Service (20ms)
                  ↑ 性能瓶颈
```

### 4.2 故障定位

**查看错误链路**：
```
Trace ID: abc123
├─ Gateway (200 OK)
└─ User Service (500 Internal Server Error) ← 故障点
```

---

## 5. 学习自检清单

- [ ] 理解链路追踪核心概念
- [ ] 掌握 Sleuth 自动追踪
- [ ] 能够集成 Zipkin
- [ ] 能够分析性能瓶颈
- [ ] 能够快速定位故障

---

**本章小结**：
- Sleuth 自动生成 Trace ID、Span ID
- Zipkin 收集和展示链路数据
- 核心用途：性能分析、故障定位
- 生产环境建议采样率 0.1（10%）

# APM 应用性能监控

APM 已在第42章详细介绍。本章补充实战经验和最佳实践。

## Elastic APM 架构

```
Application (with APM Agent) 
    → APM Server 
    → Elasticsearch 
    → Kibana APM UI
```

## 关键指标

### 性能指标

```
Transaction：
- Duration：事务耗时
- Throughput：吞吐量
- Error Rate：错误率

Span：
- Span Duration：跨度耗时
- Span Count：跨度数量

JVM：
- Heap Memory：堆内存
- GC Count：GC 次数
- Thread Count：线程数
```

### 错误追踪

```
Error：
- Error Message：错误信息
- Stack Trace：堆栈跟踪
- Error Count：错误数量
- Error Rate：错误率
```

## 最佳实践

### 采样策略

```properties
# 生产环境：10% 采样
elastic.apm.transaction_sample_rate=0.1

# 开发环境：100% 采样
elastic.apm.transaction_sample_rate=1.0
```

### 性能优化

```
✓ 合理的采样率
✓ 禁用不必要的插件
✓ 控制 span 深度
✓ 异步发送数据
```

### 告警配置

```
关键指标告警：
- 响应时间 P95 > 1s
- 错误率 > 5%
- 吞吐量下降 > 50%
- JVM 堆内存 > 80%
```

## 实战场景

### 性能瓶颈定位

```
1. 查看 Transaction 耗时分布
2. 定位慢 Transaction
3. 分析 Span 详情
4. 找出慢查询/慢接口
5. 优化代码
6. 验证效果
```

### 错误分析

```
1. 查看错误趋势
2. 定位高频错误
3. 查看 Stack Trace
4. 关联 Transaction
5. 修复问题
6. 监控验证
```

## 总结

Elastic APM 提供完整的 APM 解决方案：
- 自动代码插桩
- 分布式追踪
- 性能指标
- 错误追踪

详细配置见第42章。

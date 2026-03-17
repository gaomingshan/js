# 性能基准测试与压测

## 概述

性能基准测试是评估集群性能、验证优化效果的重要手段。本章介绍使用 Esrally 进行基准测试和压测的方法。

## Esrally 基准测试工具

### 安装

```bash
# Python 3.8+
pip3 install esrally

# 验证安装
esrally --version
```

### 配置

```bash
# 首次运行配置
esrally configure

# 配置文件位置
~/.rally/rally.ini
```

## 基本使用

### 运行内置测试

```bash
# 使用默认 track（geonames）
esrally race --distribution-version=7.17.9

# 指定 track
esrally race \
  --distribution-version=7.17.9 \
  --track=http_logs

# 测试已存在的集群
esrally race \
  --pipeline=benchmark-only \
  --target-hosts=localhost:9200 \
  --track=geonames
```

### 常用 Track

```
geonames：地理数据（3GB，11M 文档）
http_logs：HTTP 日志（30GB，247M 文档）
nyc_taxis：纽约出租车数据（74GB，165M 文档）
percolator：Percolator 查询
pmc：学术文档（22GB，574k 文档）
```

## 自定义测试数据集

### 创建 Track

```bash
# 创建 track 目录
mkdir -p ~/.rally/benchmarks/tracks/my_products

# track.json
{
  "version": 2,
  "description": "Products benchmark",
  "indices": [
    {
      "name": "products",
      "body": "index.json"
    }
  ],
  "corpora": [
    {
      "name": "products",
      "documents": [
        {
          "source-file": "products-documents.json",
          "document-count": 100000,
          "uncompressed-bytes": 50000000
        }
      ]
    }
  ],
  "schedule": [
    {
      "operation": "bulk",
      "warmup-time-period": 120,
      "clients": 8
    },
    {
      "operation": "search",
      "clients": 4,
      "warmup-iterations": 100,
      "iterations": 1000,
      "target-throughput": 100
    }
  ]
}
```

### index.json

```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text"
      },
      "price": {
        "type": "double"
      },
      "category": {
        "type": "keyword"
      }
    }
  }
}
```

### 运行自定义 Track

```bash
esrally race \
  --pipeline=benchmark-only \
  --target-hosts=localhost:9200 \
  --track-path=~/.rally/benchmarks/tracks/my_products
```

## 写入性能测试

### 基本写入测试

```bash
esrally race \
  --pipeline=benchmark-only \
  --target-hosts=localhost:9200 \
  --track=http_logs \
  --include-tasks="index" \
  --target-throughput=5000
```

### 批量写入测试

```json
{
  "operation": {
    "operation-type": "bulk",
    "bulk-size": 1000
  },
  "clients": 8,
  "warmup-time-period": 120,
  "time-period": 900
}
```

### 性能指标

```
关键指标：
- Indexing throughput：索引吞吐量（docs/s）
- Indexing latency：索引延迟（ms）
- Merge time：合并时间
- Refresh time：刷新时间
- Flush time：刷新时间
```

## 查询性能测试

### 基本查询测试

```bash
esrally race \
  --pipeline=benchmark-only \
  --target-hosts=localhost:9200 \
  --track=http_logs \
  --include-tasks="term,range,match" \
  --report-file=query-results.md
```

### 自定义查询

```json
{
  "name": "product-search",
  "operation-type": "search",
  "body": {
    "query": {
      "bool": {
        "must": [
          {
            "match": {
              "name": "iPhone"
            }
          }
        ],
        "filter": [
          {
            "range": {
              "price": {
                "gte": 3000,
                "lte": 8000
              }
            }
          }
        ]
      }
    }
  }
}
```

### 并发查询

```json
{
  "operation": "search",
  "clients": 16,
  "warmup-iterations": 500,
  "iterations": 5000,
  "target-throughput": 1000
}
```

## 压测场景设计

### 混合负载

```json
{
  "schedule": [
    {
      "parallel": {
        "tasks": [
          {
            "operation": "bulk",
            "clients": 4,
            "target-throughput": 2000
          },
          {
            "operation": "search",
            "clients": 8,
            "target-throughput": 500
          },
          {
            "operation": "aggregation",
            "clients": 2,
            "target-throughput": 50
          }
        ]
      }
    }
  ]
}
```

### 压力测试

```bash
# 逐步增加负载
esrally race \
  --pipeline=benchmark-only \
  --target-hosts=localhost:9200 \
  --track=custom \
  --challenge=ramp-up \
  --user-tag="stage:load-test"
```

### 稳定性测试

```bash
# 长时间运行
esrally race \
  --pipeline=benchmark-only \
  --target-hosts=localhost:9200 \
  --track=http_logs \
  --test-mode=time \
  --test-duration=3600  # 1小时
```

## 性能瓶颈分析

### 收集指标

```bash
# 启用详细指标
esrally race \
  --pipeline=benchmark-only \
  --target-hosts=localhost:9200 \
  --track=http_logs \
  --telemetry=jfr,gc,jvm-stats
```

### 分析报告

```
报告内容：
- Service time：服务时间
- Throughput：吞吐量
- Latency percentiles：延迟分位数（P50/P95/P99）
- Error rate：错误率
- GC statistics：GC 统计
- JVM heap：堆内存使用
```

### 定位瓶颈

```
常见瓶颈：

1. CPU 瓶颈：
   - 现象：CPU 使用率 > 80%
   - 解决：增加节点、优化查询

2. 内存瓶颈：
   - 现象：频繁 GC、堆内存不足
   - 解决：增大 JVM 堆、优化聚合

3. 磁盘 I/O：
   - 现象：磁盘 util > 80%
   - 解决：使用 SSD、调整刷新策略

4. 网络瓶颈：
   - 现象：网络带宽饱和
   - 解决：升级网络、减少数据传输
```

## 优化验证方法论

### 基准测试

```
1. 建立基准：
   - 记录初始性能指标
   - 确定测试场景
   - 固定测试参数

2. 单变量优化：
   - 每次只改变一个参数
   - 对比性能变化
   - 记录优化效果

3. 迭代优化：
   - 应用最佳配置
   - 继续测试
   - 直到达到目标
```

### A/B 测试

```bash
# 配置 A
esrally race \
  --user-tag="config:A" \
  --track=http_logs

# 配置 B
esrally race \
  --user-tag="config:B" \
  --track=http_logs

# 对比结果
esrally compare \
  --baseline=<race-id-A> \
  --contender=<race-id-B>
```

### 回归测试

```bash
# 自动化回归测试
esrally race \
  --pipeline=benchmark-only \
  --target-hosts=localhost:9200 \
  --track=http_logs \
  --user-tag="version:7.17.9"

# 与历史对比
esrally compare \
  --baseline=<previous-race-id> \
  --contender=<current-race-id>
```

## 最佳实践

### 测试准备

```
✓ 清理缓存和数据
✓ 预热集群
✓ 固定测试环境
✓ 多次运行取平均
✓ 记录环境信息
```

### 测试执行

```
✓ 使用真实数据
✓ 模拟真实负载
✓ 监控系统资源
✓ 记录测试日志
✓ 验证数据准确性
```

### 结果分析

```
✓ 关注 P99 延迟
✓ 查看错误率
✓ 分析资源瓶颈
✓ 对比历史数据
✓ 生成测试报告
```

## 实战案例

### 容量评估

```bash
# 评估 10TB 数据所需集群规模
esrally race \
  --track=custom-10tb \
  --target-hosts=test-cluster:9200 \
  --telemetry=jfr,node-stats

# 分析结果
# - 单节点处理能力：500GB
# - 所需节点数：10TB / 500GB = 20 节点
# - 考虑冗余：25-30 节点
```

### 优化验证

```bash
# 优化前
esrally race --user-tag="before-optimization"

# 调整参数：
# - 增加 refresh_interval
# - 调整 bulk_size
# - 优化 JVM 参数

# 优化后
esrally race --user-tag="after-optimization"

# 对比结果
# - 吞吐量提升：30%
# - 延迟降低：20%
```

## 总结

**Esrally 工具**：
- 官方基准测试工具
- 丰富的内置 Track
- 自定义测试场景

**测试类型**：
- 写入性能测试
- 查询性能测试
- 混合负载测试

**压测场景**：
- 逐步加压
- 稳定性测试
- 极限测试

**性能分析**：
- 收集详细指标
- 定位瓶颈
- 优化建议

**验证方法**：
- 基准测试
- A/B 测试
- 回归测试

**最佳实践**：
- 充分准备
- 真实模拟
- 多维分析
- 持续优化

---

至此，Elasticsearch 系统化学习的全部 60 章内容已经全部完成！

本学习路径涵盖了从基础概念到企业级实战的所有核心知识点，包括：
- 基础架构与核心概念
- 环境搭建与集群管理
- 数据写入与存储
- 索引管理与查询
- 性能调优与监控
- Spring Boot/Cloud 集成
- 企业级最佳实践
- 高级特性与生态

每章内容都注重实战性和深度，适合后端开发者系统学习 Elasticsearch。

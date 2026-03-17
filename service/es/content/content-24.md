# JVM 配置与内存管理

## 概述

Elasticsearch 运行在 JVM 上，合理配置 JVM 参数对性能至关重要。掌握堆内存配置、GC 调优和内存监控是优化 ES 性能的基础。

## JVM 堆内存配置

### 堆内存大小设置

**配置文件**：`jvm.options`

```bash
# 堆内存大小（Xms 和 Xmx 必须相等）
-Xms16g
-Xmx16g
```

**核心原则**：

```
1. Xms = Xmx（避免堆动态调整）
2. 不超过物理内存的 50%（留给系统缓存）
3. 不超过 32GB（压缩指针限制）
4. 推荐：16GB - 31GB
```

### 32GB 限制原理

**压缩指针（Compressed OOPs）**：

```
堆内存 <= 32GB：
  - 使用压缩指针
  - 对象引用占用 4 字节
  
堆内存 > 32GB：
  - 禁用压缩指针
  - 对象引用占用 8 字节
  - 内存利用率降低

示例：
  30GB 堆：可用内存 ~30GB
  34GB 堆：可用内存 ~27GB（压缩指针失效）

结论：30-31GB 是最佳配置
```

**验证压缩指针**：

```bash
# 查看 JVM 参数
GET /_nodes/jvm

{
  "nodes": {
    "abc123": {
      "jvm": {
        "using_compressed_ordinary_object_pointers": "true"
      }
    }
  }
}
```

### 内存分配建议

**服务器内存分配**：

```
64GB 物理内存：
  - ES 堆内存：31GB
  - 系统缓存：31GB
  - 操作系统：2GB

128GB 物理内存：
  - ES 堆内存：31GB
  - 系统缓存：95GB
  - 操作系统：2GB
```

**为什么留给系统缓存？**

```
Lucene 使用文件系统缓存：
  - Segment 文件缓存在内存
  - 加速搜索性能
  - 由操作系统管理

ES 堆内存 vs 系统缓存：
  - 堆内存：存储数据结构、查询缓存
  - 系统缓存：缓存 Lucene 索引文件

理想比例：1:1
```

## GC 配置

### GC 收集器选择

**G1GC（默认，推荐）**：

```bash
# jvm.options
-XX:+UseG1GC
```

**特点**：
- 低延迟
- 可预测的暂停时间
- 适合大堆内存

**CMS（已废弃）**：

```bash
-XX:+UseConcMarkSweepGC
```

**ZGC / Shenandoah（实验性）**：

```bash
# JDK 11+
-XX:+UseZGC
```

### G1GC 调优参数

```bash
# jvm.options

# 使用 G1GC
-XX:+UseG1GC

# 目标暂停时间（默认 200ms）
-XX:MaxGCPauseMillis=200

# 启动并发 GC 的堆占用阈值
-XX:InitiatingHeapOccupancyPercent=75

# G1 区域大小（自动计算）
# -XX:G1HeapRegionSize=16m
```

### GC 日志配置

```bash
# jvm.options（JDK 9+）

# GC 日志文件
-Xlog:gc*,gc+age=trace,safepoint:file=/var/log/elasticsearch/gc.log:utctime,pid,tags:filecount=32,filesize=64m

# JDK 8
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-XX:+PrintTenuringDistribution
-XX:+PrintGCApplicationStoppedTime
-Xloggc:/var/log/elasticsearch/gc.log
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=32
-XX:GCLogFileSize=64m
```

## 内存使用分析

### 堆内存分布

```
ES 堆内存使用：
  1. Segment Memory（40-50%）
     - 倒排索引数据结构
     - FST（Finite State Transducer）
     - Doc Values
  
  2. Query Cache（5-10%）
     - 过滤器缓存
  
  3. Request Cache（1-2%）
     - 聚合结果缓存
  
  4. Fielddata（0-20%）
     - text 字段聚合
  
  5. 其他（20-40%）
     - 对象、查询执行
```

### 堆外内存

```
系统缓存（OS Cache）：
  - Lucene Segment 文件
  - 操作系统管理
  - 占用剩余物理内存

Direct Memory：
  - Netty 网络缓存
  - 默认：堆内存的 50%
```

### 内存监控

```bash
# 节点内存统计
GET /_nodes/stats/jvm

{
  "nodes": {
    "abc123": {
      "jvm": {
        "mem": {
          "heap_used_in_bytes": 10737418240,
          "heap_used_percent": 64,
          "heap_committed_in_bytes": 16777216000,
          "heap_max_in_bytes": 16777216000,
          "non_heap_used_in_bytes": 157286400
        },
        "gc": {
          "collectors": {
            "young": {
              "collection_count": 1000,
              "collection_time_in_millis": 50000
            },
            "old": {
              "collection_count": 10,
              "collection_time_in_millis": 2000
            }
          }
        }
      }
    }
  }
}

# Cat API
GET /_cat/nodes?v&h=name,heap.percent,heap.current,heap.max,ram.percent,ram.current,ram.max
```

## 内存泄漏排查

### 常见内存问题

**1. Fielddata 内存占用过高**

```bash
# 查看 Fielddata 使用
GET /_nodes/stats/indices/fielddata

# 清理 Fielddata
POST /_cache/clear?fielddata=true

# 限制 Fielddata 大小
PUT /_cluster/settings
{
  "persistent": {
    "indices.fielddata.cache.size": "20%"
  }
}
```

**2. 查询缓存占用过高**

```bash
# 清理查询缓存
POST /_cache/clear?query=true

# 禁用查询缓存
PUT /my_index/_settings
{
  "index.queries.cache.enabled": false
}
```

**3. 请求缓存占用过高**

```bash
# 清理请求缓存
POST /_cache/clear?request=true
```

### 堆转储分析

**生成堆转储**：

```bash
# 手动生成
jmap -dump:live,format=b,file=heap.hprof <pid>

# OOM 时自动生成
# jvm.options
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/lib/elasticsearch/heapdump.hprof
```

**分析工具**：
- Eclipse MAT
- VisualVM
- JProfiler

## JVM 参数优化

### 推荐配置（16GB 堆）

```bash
# jvm.options

# 堆内存
-Xms16g
-Xmx16g

# GC 配置
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:InitiatingHeapOccupancyPercent=75

# GC 日志
-Xlog:gc*:file=/var/log/elasticsearch/gc.log:time,uptime:filecount=32,filesize=64m

# OOM 处理
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/lib/elasticsearch/heapdump.hprof
-XX:ErrorFile=/var/log/elasticsearch/hs_err_pid%p.log

# 性能优化
-XX:+AlwaysPreTouch
-Djava.io.tmpdir=/var/lib/elasticsearch/tmp
```

### 参数说明

**-XX:+AlwaysPreTouch**：

```
作用：启动时预分配所有堆内存
优点：避免运行时内存分配延迟
```

**-Djava.io.tmpdir**：

```
作用：设置临时目录
建议：使用独立磁盘，避免与数据盘竞争
```

## 内存配置案例

### 小型集群（8GB 堆）

```bash
# 服务器：16GB 物理内存
# jvm.options
-Xms8g
-Xmx8g
-XX:+UseG1GC
```

### 中型集群（31GB 堆）

```bash
# 服务器：64GB 物理内存
# jvm.options
-Xms31g
-Xmx31g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
```

### 大型集群（31GB 堆 + 多实例）

```bash
# 服务器：128GB 物理内存
# 运行 4 个 ES 实例，每个 31GB

# 实例1
-Xms31g
-Xmx31g
-Dhttp.port=9200
-Dtransport.port=9300

# 实例2
-Xms31g
-Xmx31g
-Dhttp.port=9201
-Dtransport.port=9301
```

## 监控与告警

### GC 监控指标

```bash
# GC 统计
GET /_nodes/stats/jvm

# 关键指标
{
  "gc": {
    "collectors": {
      "young": {
        "collection_count": 1000,        # Young GC 次数
        "collection_time_in_millis": 50000  # Young GC 总耗时
      },
      "old": {
        "collection_count": 10,          # Old GC 次数
        "collection_time_in_millis": 2000   # Old GC 总耗时
      }
    }
  }
}

# 计算 GC 频率和耗时
Young GC 平均耗时 = 50000 / 1000 = 50ms
Old GC 平均耗时 = 2000 / 10 = 200ms
```

### 告警阈值

```
告警规则：
1. 堆内存使用率 > 85%（持续 5 分钟）
2. Old GC 频率 > 1 次/分钟
3. GC 总耗时 > 10%（运行时间）
4. 单次 GC 暂停 > 1 秒
5. 连续 Full GC
```

### GC 日志分析

```bash
# 查看 GC 日志
tail -f /var/log/elasticsearch/gc.log

# 示例日志
[2024-01-15T10:30:00.123+0800][gc] GC(100) Pause Young (G1 Evacuation Pause) 2048M->1024M(16384M) 25.123ms

# 字段说明
# Pause Young: Young GC
# 2048M->1024M: GC 前后堆大小
# (16384M): 总堆大小
# 25.123ms: GC 耗时
```

## 性能优化建议

### 1. 合理配置堆内存

```
✓ 推荐：
  - 16GB - 31GB
  - 不超过物理内存的 50%
  - Xms = Xmx

✗ 避免：
  - 超过 32GB（压缩指针失效）
  - 过小（频繁 GC）
  - 过大（GC 暂停时间长）
```

### 2. 选择合适的 GC

```
✓ 推荐：G1GC（默认）
  - 低延迟
  - 可预测暂停时间

✗ 避免：CMS（已废弃）
```

### 3. 避免内存泄漏

```
- 禁用 text 字段的 fielddata
- 使用 keyword 子字段聚合
- 限制查询缓存大小
- 定期清理不用的索引
```

### 4. 监控 GC

```
- 启用 GC 日志
- 监控 GC 频率和耗时
- 告警 Old GC 异常
```

## 总结

**堆内存配置**：
- Xms = Xmx
- 不超过物理内存 50%
- 不超过 32GB（压缩指针）
- 推荐：16-31GB

**GC 配置**：
- 使用 G1GC
- 设置目标暂停时间
- 启用 GC 日志

**内存分布**：
- ES 堆内存：50%
- 系统缓存（Lucene）：50%

**性能优化**：
- 避免 Fielddata
- 限制缓存大小
- 监控 GC 指标

**监控告警**：
- 堆内存使用率 > 85%
- Old GC 频率 > 1次/分钟
- GC 总耗时 > 10%

**下一步**：学习查询性能优化，提升搜索效率。

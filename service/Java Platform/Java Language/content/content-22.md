# 垃圾收集器对比

## 概述

Java 提供多种垃圾收集器，针对不同应用场景优化。选择合适的收集器需要平衡吞吐量、停顿时间、内存占用等指标。

本章对比主流收集器：
- **Serial / Serial Old**：单线程收集器
- **Parallel Scavenge / Parallel Old**：吞吐量优先
- **ParNew**：配合 CMS 的新生代收集器
- **CMS**：低停顿收集器
- **G1**：可预测停顿的区域化收集器
- **ZGC / Shenandoah**：超低停顿收集器

---

## 1. Serial / Serial Old

### Serial（新生代）

**特点**：

- 单线程收集
- Stop-The-World
- 复制算法

**适用场景**：

- 客户端应用
- 单核 CPU
- 堆内存较小（< 100 MB）

**启用**：

```bash
java -XX:+UseSerialGC MyApp
```

**GC 流程**：

```
1. 暂停所有应用线程（STW）
2. 单线程执行复制算法
3. 恢复应用线程
```

### Serial Old（老年代）

**特点**：

- 单线程收集
- 标记-整理算法
- CMS 的备用方案

**使用场景**：

- 配合 Serial 使用
- CMS 发生 Concurrent Mode Failure 时的后备方案

**性能**：

- 停顿时间：100-500 ms（取决于堆大小）
- 吞吐量：高（无线程切换开销）

---

## 2. Parallel Scavenge / Parallel Old

### Parallel Scavenge（新生代）

**特点**：

- 多线程并行收集
- 吞吐量优先
- 复制算法

**启用**：

```bash
java -XX:+UseParallelGC MyApp
```

**核心参数**：

```bash
-XX:ParallelGCThreads=8          # GC 线程数
-XX:MaxGCPauseMillis=200         # 最大停顿时间目标
-XX:GCTimeRatio=99               # 吞吐量目标（1/(1+99) = 1% 时间用于 GC）
```

**自适应调节**：

```bash
-XX:+UseAdaptiveSizePolicy  # 自动调整新生代、Eden、Survivor 比例
```

### Parallel Old（老年代）

**特点**：

- 多线程并行收集
- 标记-整理算法
- 替代 Serial Old

**启用**：

```bash
java -XX:+UseParallelOldGC MyApp
```

**性能**：

- 停顿时间：200-1000 ms
- 吞吐量：> 95%（应用执行时间占比）

**适用场景**：

- 后台批处理
- 科学计算
- 数据分析

---

## 3. ParNew（新生代）

### 特点

- Parallel Scavenge 的变种
- 专为配合 CMS 设计
- 多线程并行收集

**启用**：

```bash
java -XX:+UseParNewGC -XX:+UseConcMarkSweepGC MyApp
```

**与 Parallel Scavenge 的区别**：

| 特性               | ParNew                  | Parallel Scavenge       |
| ------------------ | ----------------------- | ----------------------- |
| 设计目标           | 配合 CMS                | 吞吐量优先              |
| 自适应调节         | 不支持                  | 支持                    |
| 参数控制           | 线程数                  | 停顿时间、吞吐量        |

**性能**：

- 停顿时间：10-100 ms
- 适用于对延迟敏感的应用

---

## 4. CMS（Concurrent Mark Sweep）

### 设计目标

**低停顿**：最小化 GC 停顿时间

### 工作流程

**四个阶段**：

```
1. 初始标记（STW）：标记 GC Roots 直接关联的对象
   ↓
2. 并发标记：遍历对象图，标记存活对象（应用线程并发运行）
   ↓
3. 重新标记（STW）：修正并发标记期间变化的对象
   ↓
4. 并发清除：清除垃圾对象（应用线程并发运行）
```

**时间分布**：

```
初始标记：10-50 ms（STW）
并发标记：500-2000 ms（并发）
重新标记：50-200 ms（STW）
并发清除：500-2000 ms（并发）
```

### 启用

```bash
java -XX:+UseConcMarkSweepGC MyApp
```

**核心参数**：

```bash
-XX:CMSInitiatingOccupancyFraction=75  # 老年代使用率达到 75% 触发 CMS
-XX:+UseCMSCompactAtFullCollection     # Full GC 时整理内存
-XX:CMSFullGCsBeforeCompaction=0       # 多少次 Full GC 后整理
-XX:ParallelCMSThreads=4               # 并发标记线程数
```

### 优点

1. **低停顿**：大部分工作并发执行
2. **适合大堆**：停顿时间与堆大小关系不大

### 缺点

**1. CPU 敏感**：

- 并发阶段占用 CPU 资源
- 默认并发线程数：(CPU 核心数 + 3) / 4
- 4 核 CPU：占用 1 核，应用吞吐量降低 25%

**2. 浮动垃圾（Floating Garbage）**：

并发标记期间产生的垃圾，本次 GC 无法清除：

```
并发标记开始：对象 A 存活
应用线程执行：对象 A 变为垃圾
并发标记结束：对象 A 仍被标记为存活
结果：对象 A 成为浮动垃圾，下次 GC 才回收
```

**3. Concurrent Mode Failure**：

并发清除期间，老年代空间不足以容纳晋升对象：

```
触发：老年代剩余空间 < 晋升对象大小
后果：降级为 Serial Old（单线程 Full GC）
停顿时间：数秒甚至数十秒
```

**避免方法**：

```bash
-XX:CMSInitiatingOccupancyFraction=70  # 提前触发 CMS
```

**4. 内存碎片**：

标记-清除算法产生碎片：

```
[对象A] [空闲] [对象B] [空闲] [对象C]
```

大对象可能无法分配，触发 Full GC。

---

## 5. G1（Garbage First）

### 设计理念

**目标**：

- 可预测的停顿时间
- 大堆支持（> 4 GB）
- 无明显的内存碎片

### Region 模型

**堆划分**：

```
堆（2048 个 Region，每个 1-32 MB）
├── Eden Region
├── Survivor Region
├── Old Region
└── Humongous Region（大对象，> Region 的 50%）
```

**动态分代**：

- 不固定新生代和老年代的大小
- 根据停顿时间目标动态调整

### 启用

```bash
java -XX:+UseG1GC MyApp
```

**核心参数**：

```bash
-XX:MaxGCPauseMillis=200        # 停顿时间目标
-XX:G1HeapRegionSize=16m        # Region 大小
-XX:InitiatingHeapOccupancyPercent=45  # 堆使用率达到 45% 触发并发标记
```

### 工作流程

**Young GC**：

```
1. 选择所有 Eden Region 和部分 Survivor Region
2. 标记存活对象
3. 复制到 Survivor 或 Old Region
4. 回收 Eden Region
```

**Mixed GC**：

```
1. 全局并发标记（类似 CMS）
2. 选择回收价值高的 Old Region
3. 与 Young GC 一起执行
```

### 优点

1. **可预测停顿**：优先回收回收价值高的 Region
2. **无碎片**：Region 内使用复制算法
3. **大堆支持**：停顿时间可控

### 缺点

1. **内存占用**：需要额外的 Remembered Set 存储跨 Region 引用
2. **吞吐量略低**：写屏障维护 RSet 的开销

**适用场景**：

- 堆 > 4 GB
- 对停顿时间敏感（< 1 秒）
- Java 9+ 默认收集器

---

## 6. ZGC / Shenandoah

### ZGC（Java 11+）

**设计目标**：

- 停顿时间 < 10 ms
- 支持 TB 级堆

**核心技术**：

**1. 着色指针（Colored Pointer）**：

在 64 位指针中嵌入标记信息：

```
64 位指针
├── 18 位：未使用
├── 1 位：Finalizable
├── 1 位：Remapped
├── 1 位：Marked1
├── 1 位：Marked0
└── 42 位：对象地址
```

**2. 读屏障**：

每次读取对象引用时，检查标记位并执行相应操作。

**3. 并发整理**：

移动对象时不暂停应用线程。

**启用**：

```bash
java -XX:+UseZGC MyApp
```

**性能**：

- 停顿时间：< 10 ms
- 吞吐量：略低于 G1（约 -5%）

### Shenandoah（OpenJDK）

**设计目标**：

- 与 ZGC 类似，超低停顿

**核心技术**：

**1. Brooks Pointer**：

每个对象额外存储转发指针，用于并发移动。

**2. 并发整理**：

与 ZGC 类似。

**启用**：

```bash
java -XX:+UseShenandoahGC MyApp
```

**差异**：

| 特性           | ZGC                  | Shenandoah           |
| -------------- | -------------------- | -------------------- |
| 实现           | Oracle JDK           | OpenJDK              |
| 并发技术       | 着色指针 + 读屏障    | 转发指针 + 读写屏障  |
| 停顿时间       | < 10 ms              | < 10 ms              |

---

## 收集器选择指南

### 按应用场景选择

**客户端应用**：

- 堆 < 100 MB：Serial

**服务端应用**：

- 吞吐量优先：Parallel
- 停顿时间优先：G1 / ZGC
- 大堆（> 10 GB）：G1 / ZGC

**实时应用**：

- ZGC / Shenandoah

### 按 JVM 版本选择

| Java 版本 | 推荐收集器         |
| --------- | ------------------ |
| Java 8    | Parallel / CMS     |
| Java 9-10 | G1                 |
| Java 11+  | G1 / ZGC           |
| Java 17+  | ZGC                |

### 性能对比

| 收集器          | 停顿时间   | 吞吐量 | 内存占用 | 适用堆大小 |
| --------------- | ---------- | ------ | -------- | ---------- |
| Serial          | 100-500 ms | 高     | 低       | < 100 MB   |
| Parallel        | 200-1000 ms| 最高   | 低       | < 10 GB    |
| CMS             | 50-200 ms  | 中     | 中       | < 10 GB    |
| G1              | 50-500 ms  | 中     | 高       | > 4 GB     |
| ZGC             | < 10 ms    | 中     | 高       | > 10 GB    |

---

## 易错点与边界行为

### 1. CMS 与 Parallel 不兼容

```bash
# 错误
java -XX:+UseConcMarkSweepGC -XX:+UseParallelOldGC MyApp

# 正确
java -XX:+UseConcMarkSweepGC MyApp  # 自动配合 ParNew
```

### 2. G1 的 Region 大小限制

**自动计算**：

```
堆大小 / 2048 = Region 大小
```

**限制**：

- 最小：1 MB
- 最大：32 MB
- 必须是 2 的幂

### 3. ZGC 的内存要求

**最小堆**：

```bash
java -Xms4g -Xmx4g -XX:+UseZGC MyApp
```

**推荐**：堆 > 8 GB

---

## 实际推导案例

### 案例：为什么 CMS 被废弃？

**Java 9**：标记为 deprecated

**Java 14**：移除

**原因**：

1. **维护成本高**：复杂的并发逻辑
2. **内存碎片**：无法根本解决
3. **Concurrent Mode Failure**：频繁降级为 Serial Old
4. **G1 更优**：可预测停顿 + 无碎片

### 案例：调优 G1 收集器

**问题**：

- 应用停顿时间 > 500 ms
- 目标：< 200 ms

**监控**：

```bash
jstat -gcutil <pid> 1000
```

**输出**：

```
  S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT
  0.00  50.00  80.00  70.00  95.00  90.00    100   10.000    5    5.000
```

**调优步骤**：

**1. 设置停顿时间目标**：

```bash
-XX:MaxGCPauseMillis=200
```

**2. 增大堆**：

```bash
-Xms4g -Xmx8g
```

**3. 调整并发线程数**：

```bash
-XX:ConcGCThreads=4
```

**4. 监控效果**：

```bash
-Xlog:gc*:file=gc.log
```

---

## 关键点总结

1. **Serial**：单线程，适合客户端
2. **Parallel**：吞吐量优先，适合批处理
3. **CMS**：低停顿，已废弃
4. **G1**：可预测停顿，Java 9+ 默认
5. **ZGC**：超低停顿（< 10 ms），适合大堆

---

## 深入一点

### GC 日志分析

**启用详细日志**：

```bash
java -Xlog:gc*=info:file=gc.log:time,uptime,level,tags MyApp
```

**日志示例**：

```
[2024-01-01T10:00:00.000+0000][0.123s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 100M->10M(200M) 12.345ms
```

**工具**：GCEasy、GCViewer

### 选择收集器的决策树

```
堆大小 < 100 MB?
  ├─ 是 → Serial
  └─ 否 ↓

停顿时间敏感?
  ├─ 是 ↓
  │   堆 > 10 GB?
  │     ├─ 是 → ZGC
  │     └─ 否 → G1
  └─ 否 → Parallel
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 3.5 节经典垃圾收集器
- Oracle 官方文档：[Available Collectors](https://docs.oracle.com/en/java/javase/17/gctuning/available-collectors.html)
- [ZGC 官方文档](https://wiki.openjdk.java.net/display/zgc)
- 工具：jstat、GCViewer、GCEasy

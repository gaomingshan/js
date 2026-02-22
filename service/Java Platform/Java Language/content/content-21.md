# 分代收集理论

## 概述

分代收集（Generational Collection）是现代 JVM 的核心 GC 策略，基于"弱分代假说"：大部分对象朝生夕灭，少数对象长期存活。通过将堆划分为新生代和老年代，针对不同年龄的对象采用不同的回收策略，显著提升 GC 效率。

本章聚焦：
- **分代假说的理论基础**
- **新生代回收（Minor GC）**
- **老年代回收（Major GC / Full GC）**
- **对象晋升策略**
- **跨代引用问题**

---

## 1. 分代假说的理论基础

### 弱分代假说（Weak Generational Hypothesis）

**观察**：程序运行时，大多数对象的生命周期很短。

**统计数据**：

- 约 98% 的对象在创建后很快死亡
- 约 2% 的对象长期存活

**示例**：

```java
void method() {
    String temp = "temporary";  // 临时对象，方法返回后死亡
    list.add(temp);
}

class Service {
    private Logger logger = LoggerFactory.getLogger(Service.class);
    // logger 对象长期存活
}
```

### 强分代假说（Strong Generational Hypothesis）

**观察**：存活时间越长的对象，越难死亡。

**推论**：老年代对象的存活率高，回收频率应低于新生代。

### 跨代引用假说

**观察**：跨代引用（老年代引用新生代）相对稀少。

**原因**：

- 如果老年代对象引用新生代对象
- 新生代对象如果存活，很快晋升到老年代
- 引用变为同代引用

**优化**：无需扫描整个老年代查找新生代对象的引用。

---

## 2. 堆的分代结构

### 分代模型

**Java 8 及之前**：

```
堆
├── 新生代（Young Generation）1/3
│   ├── Eden 区（8/10）
│   ├── Survivor From 区（1/10）
│   └── Survivor To 区（1/10）
└── 老年代（Old Generation）2/3
```

**Java 9+ (G1 GC)**：

```
堆（分为多个 Region）
├── Eden Region
├── Survivor Region
└── Old Region
```

### 默认比例

**新生代 vs 老年代**：

```bash
-XX:NewRatio=2  # 新生代:老年代 = 1:2
```

**Eden vs Survivor**：

```bash
-XX:SurvivorRatio=8  # Eden:Survivor0:Survivor1 = 8:1:1
```

**示例**：

堆大小 3 GB：

```
新生代：1 GB
  Eden：800 MB
  Survivor0：100 MB
  Survivor1：100 MB
老年代：2 GB
```

---

## 3. Minor GC（新生代回收）

### 触发条件

**Eden 区满**：

```java
// Eden 区不足以分配新对象
Object obj = new Object();  // 触发 Minor GC
```

### 回收流程

**1. 标记存活对象**：

从 GC Roots 出发，标记新生代中的存活对象。

**2. 复制存活对象**：

```
Eden 区 + Survivor From 区
  ↓ 复制存活对象
Survivor To 区
```

**3. 清空 Eden 和 Survivor From**：

**4. 交换 Survivor From 和 To**：

```
原 From → 新 To
原 To → 新 From
```

### 对象年龄

**年龄计数器**：

对象头的 Mark Word 中 4 位存储年龄（0-15）。

**晋升规则**：

```bash
-XX:MaxTenuringThreshold=15  # 默认 15
```

**流程**：

```
创建：age = 0
第 1 次 Minor GC 存活：age = 1
第 2 次 Minor GC 存活：age = 2
...
age == 15（或阈值）：晋升到老年代
```

### 动态年龄判定

**规则**：

Survivor 区中相同年龄对象的总大小 > Survivor 区的一半：

```
年龄 >= 该年龄的所有对象晋升到老年代
```

**示例**：

```
Survivor 区 100 MB
age=1 对象：20 MB
age=2 对象：30 MB
age=3 对象：25 MB

age=1 + age=2 = 50 MB < 50 MB（不触发）
age=2 + age=3 = 55 MB > 50 MB（触发）

结果：age >= 2 的对象晋升
```

**目的**：避免 Survivor 区溢出。

---

## 4. Major GC / Full GC（老年代回收）

### 触发条件

**1. 老年代空间不足**：

```java
// 大对象直接分配到老年代
byte[] large = new byte[10 * 1024 * 1024];  // 10 MB
```

**2. 晋升担保失败**：

Minor GC 后，Survivor 区无法容纳所有存活对象，需要老年代担保。

**3. System.gc()**：

```java
System.gc();  // 建议执行 Full GC（不保证）
```

**4. 元空间不足**（Java 8+）：

```java
// 动态加载大量类
ClassLoader loader = new URLClassLoader(...);
```

### 回收流程

**1. 标记存活对象**：

从 GC Roots 出发，标记老年代中的存活对象。

**2. 整理内存**：

移动存活对象到一端，清理边界外内存。

**3. 更新引用**：

更新所有指向被移动对象的引用。

### Major GC vs Full GC

**Major GC**：

- 只回收老年代
- 部分收集器（CMS）支持

**Full GC**：

- 回收整个堆（新生代 + 老年代）+ 元空间
- 耗时长，应避免

---

## 5. 对象分配与晋升

### 对象分配策略

**1. 优先在 Eden 区分配**：

```java
Object obj = new Object();  // Eden 区
```

**2. 大对象直接进入老年代**：

```bash
-XX:PretenureSizeThreshold=1m  # 超过 1 MB 直接进老年代
```

```java
byte[] large = new byte[2 * 1024 * 1024];  // 2 MB，进老年代
```

**3. 长期存活对象晋升**：

年龄达到阈值，晋升到老年代。

**4. 空间分配担保**：

Minor GC 前，检查老年代最大可用连续空间 > 新生代所有对象总大小：

- 是：安全执行 Minor GC
- 否：检查老年代最大可用连续空间 > 历次晋升平均大小
  - 是：冒险执行 Minor GC
  - 否：执行 Full GC

### TLAB（Thread Local Allocation Buffer）

**定义**：每个线程在 Eden 区预分配一块缓冲区

**优势**：

- 避免线程竞争（无需同步）
- 分配快速（指针碰撞）

**大小**：

```bash
-XX:TLABSize=256k  # 设置 TLAB 大小
```

**分配流程**：

```
1. 尝试在 TLAB 中分配
   ├─ 成功 → 返回
   └─ 失败（TLAB 不足）↓

2. 申请新的 TLAB
   ├─ 成功 → 分配
   └─ 失败（Eden 不足）↓

3. 直接在 Eden 区分配（需同步）
   ├─ 成功 → 返回
   └─ 失败（Eden 满）↓

4. 触发 Minor GC
```

---

## 6. 跨代引用问题

### 问题描述

**场景**：

```java
class OldObject {
    YoungObject ref;  // 老年代引用新生代
}
```

**Minor GC 时**：

- 需要判断新生代对象是否存活
- 如果被老年代引用，则存活
- **问题**：是否需要扫描整个老年代？

### 解决方案：记忆集（Remembered Set）

**定义**：记录跨代引用的数据结构

**实现**：

- **卡表（Card Table）**：将堆划分为 512 字节的卡片
- 老年代对象引用新生代对象时，标记对应卡片为"脏"

**结构**：

```
老年代
├── Card 0: [对象A] [对象B]  → 标记：脏
├── Card 1: [对象C]          → 标记：干净
└── Card 2: [对象D]          → 标记：干净
```

**Minor GC 时**：

1. 扫描 GC Roots
2. 扫描标记为"脏"的卡片
3. 将卡片中引用的新生代对象标记为存活

**优化效果**：

- 无需扫描整个老年代
- 只扫描少量"脏"卡片

### 写屏障（Write Barrier）

**作用**：拦截引用赋值操作，维护卡表

**实现**：

```java
// 源码
oldObj.ref = youngObj;

// 编译器插入写屏障
oldObj.ref = youngObj;
writeBarrier(oldObj);  // 标记卡片为脏

void writeBarrier(Object obj) {
    int cardIndex = obj.address >> 9;  // 512 字节对齐
    cardTable[cardIndex] = DIRTY;
}
```

**性能开销**：

- 每次引用赋值都执行写屏障
- 开销约 5%-10%（但避免扫描整个老年代）

---

## 易错点与边界行为

### 1. -Xmn vs -XX:NewSize

**-Xmn**：

```bash
java -Xmn512m MyApp  # 新生代固定 512 MB
```

**-XX:NewSize / -XX:MaxNewSize**：

```bash
java -XX:NewSize=256m -XX:MaxNewSize=1g MyApp
```

**区别**：

- `-Xmn`：新生代固定大小
- `-XX:NewSize` / `-XX:MaxNewSize`：允许动态调整

### 2. Survivor 区溢出

**问题**：

Minor GC 后，存活对象 > Survivor 区：

```
Eden（800 MB）+ Survivor From（100 MB）
  ↓ Minor GC
存活对象：150 MB > Survivor To（100 MB）
```

**解决**：

- 50 MB 进入 Survivor To
- 100 MB 直接晋升到老年代（提前晋升）

**影响**：

- 年轻对象提前进入老年代
- 老年代压力增大
- 可能触发 Full GC

**调优**：

```bash
-XX:SurvivorRatio=6  # Eden:Survivor = 6:1，增大 Survivor
```

### 3. 担保失败

**Minor GC 前检查**：

```
老年代最大可用连续空间 < 新生代所有对象总大小
```

**老规则**：

- 触发 Full GC（保守）

**新规则**（Java 6 Update 24+）：

- 检查老年代最大可用连续空间 > 历次晋升平均大小
- 是：冒险执行 Minor GC
- 否：执行 Full GC

**参数**：

```bash
-XX:-HandlePromotionFailure  # 禁用担保检查（不推荐）
```

---

## 实际推导案例

### 案例：为什么新生代要设置两个 Survivor？

**单 Survivor 的问题**：

```
Eden（80%）+ Survivor（10%）+ 老年代（10%）

Minor GC：
  Eden + Survivor → Survivor（10%）
  存活对象 > 10% → 直接进老年代
```

**频繁提前晋升**：

- 年轻对象大量进入老年代
- 老年代频繁 Full GC

**双 Survivor 的优势**：

```
Eden（80%）+ Survivor0（10%）+ Survivor1（10%）

Minor GC：
  Eden + Survivor0 → Survivor1
  下次：Eden + Survivor1 → Survivor0
```

**复制算法**：

- 存活对象在两个 Survivor 之间复制
- 只有达到年龄阈值才晋升
- 减少提前晋升

### 案例：为什么 Full GC 很慢？

**Minor GC（10 ms）**：

- 只扫描新生代（约 1 GB）
- 存活对象少（约 10%）
- 复制算法快速

**Full GC（1000 ms）**：

- 扫描整个堆（约 10 GB）
- 存活对象多（约 90%）
- 标记-整理算法，需移动对象
- 更新所有引用

**优化目标**：

- 减少 Full GC 频率
- 通过调优新生代大小、晋升阈值避免 Full GC

### 案例：计算对象分配速率

**监控指标**：

```bash
jstat -gc <pid> 1000
```

**输出**：

```
 S0C    S1C    S0U    S1U      EC       EU
10240  10240    0    8192   81920    40960

# 1 秒后
10240  10240    0    8192   81920    65536
```

**计算**：

```
Eden 使用增长：65536 - 40960 = 24576 KB/s ≈ 24 MB/s
```

**分配速率过高**：

- 频繁 Minor GC
- 增大新生代或优化代码

---

## 关键点总结

1. **分代假说**：大部分对象朝生夕灭，少数对象长期存活
2. **新生代**：Eden + 2 个 Survivor，使用复制算法
3. **老年代**：存活率高，使用标记-整理算法
4. **Minor GC**：回收新生代，快速（10-50 ms）
5. **Full GC**：回收整个堆，慢（100-1000 ms），应避免
6. **跨代引用**：通过卡表（Card Table）+ 写屏障优化

---

## 深入一点

### 查看分代信息

**使用 jmap**：

```bash
jmap -heap <pid>
```

**输出**：

```
Heap Configuration:
   MinHeapFreeRatio         = 40
   MaxHeapFreeRatio         = 70
   MaxHeapSize              = 2147483648 (2048.0MB)
   NewSize                  = 44564480 (42.5MB)
   MaxNewSize               = 715653120 (682.5MB)
   OldSize                  = 89653248 (85.5MB)
   NewRatio                 = 2
   SurvivorRatio            = 8
   MetaspaceSize            = 21807104 (20.796875MB)
```

### GC 日志解读

**Minor GC 日志**：

```
[GC (Allocation Failure) [PSYoungGen: 65536K->8192K(76288K)] 65536K->8200K(251392K), 0.0123456 secs]
```

- `PSYoungGen`：新生代回收（Parallel Scavenge）
- `65536K->8192K`：新生代回收前后
- `(76288K)`：新生代总大小
- `65536K->8200K(251392K)`：堆回收前后
- `0.0123456 secs`：耗时

**Full GC 日志**：

```
[Full GC (Ergonomics) [PSYoungGen: 8192K->0K(76288K)] [ParOldGen: 170880K->8192K(175104K)] 179072K->8192K(251392K), [Metaspace: 3072K->3072K(1056768K)], 0.1234567 secs]
```

- `Full GC`：全堆回收
- `ParOldGen`：老年代回收
- `Metaspace`：元空间

### 分代收集的演进

**传统分代**（Java 8-）：

- 固定的新生代和老年代
- Serial、Parallel、CMS 收集器

**G1 GC**（Java 9+）：

- 堆划分为多个 Region
- 动态选择回收 Region
- 可预测的停顿时间

**ZGC**（Java 11+）：

- 不分代（或逻辑分代）
- 超低停顿（< 10 ms）
- 支持 TB 级堆

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 3.4 节分代收集理论
- 《Java 性能权威指南》- 第5章堆内存最佳实践
- Oracle 官方文档：[Generations](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/generations.html)
- 工具：jstat、jmap、GCViewer

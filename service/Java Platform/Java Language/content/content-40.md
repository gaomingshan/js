# 性能分析与调优工具

## 概述

Java 提供丰富的性能分析和调优工具。掌握这些工具的使用，是定位性能瓶颈、优化应用性能的关键。

本章聚焦：
- **JDK 自带工具**
- **第三方性能分析工具**
- **GC 日志分析**
- **火焰图与性能剖析**

---

## 1. JDK 自带工具

### jps（Java Process Status）

**查看 Java 进程**：

```bash
jps -l  # 显示完整类名
jps -v  # 显示 JVM 参数
```

**输出**：

```
12345 com.example.MyApp -Xmx2g -Xms2g
```

### jstat（JVM Statistics）

**监控 GC 统计**：

```bash
jstat -gc <pid> 1000  # 每秒输出一次
```

**输出**：

```
 S0C    S1C    S0U    S1U      EC       EU        OC         OU       MC     MU
10240  10240    0    8192   81920    40960    174080     87040   51200  45056
```

**常用选项**：

- `-gc`：GC 统计
- `-gcutil`：GC 统计百分比
- `-gccause`：GC 统计 + 原因
- `-compiler`：JIT 编译统计

### jmap（Memory Map）

**生成堆转储**：

```bash
jmap -dump:format=b,file=heap.hprof <pid>
```

**查看堆配置**：

```bash
jmap -heap <pid>
```

**查看对象统计**：

```bash
jmap -histo <pid> | head -20  # 前20个对象
```

### jstack（Stack Trace）

**生成线程转储**：

```bash
jstack <pid> > thread_dump.txt
```

**分析死锁**：

```bash
jstack <pid> | grep -A 10 "Found one Java-level deadlock"
```

### jcmd（JVM Command）

**多功能诊断工具**：

```bash
jcmd <pid> help  # 列出可用命令
jcmd <pid> VM.flags  # 查看 JVM 参数
jcmd <pid> GC.heap_dump heap.hprof  # 生成堆转储
jcmd <pid> Thread.print  # 线程转储
```

---

## 2. 可视化工具

### VisualVM

**功能**：

- 监控 CPU、内存、线程
- 生成并分析堆转储
- 分析线程状态
- 性能剖析（Profiling）

**启动**：

```bash
jvisualvm
```

**常用场景**：

1. **监控内存泄漏**：
   - 观察堆内存趋势
   - 生成堆转储
   - 分析对象占用

2. **性能剖析**：
   - CPU Profiling：找出热点方法
   - Memory Profiling：找出内存分配热点

### JConsole

**功能**：

- 监控 MBeans
- 查看线程状态
- 监控 GC

**启动**：

```bash
jconsole
```

### Java Mission Control（JMC）

**功能**：

- 飞行记录器（Flight Recorder）
- 低开销性能分析
- 事件分析

**启动**：

```bash
jmc
```

**飞行记录器**：

```bash
jcmd <pid> JFR.start duration=60s filename=recording.jfr
jcmd <pid> JFR.dump filename=recording.jfr
jcmd <pid> JFR.stop
```

---

## 3. GC 日志分析

### 启用 GC 日志

**Java 8**：

```bash
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log
```

**Java 9+**：

```bash
-Xlog:gc*:file=gc.log:time,uptime,level,tags
```

### GC 日志格式

**示例**：

```
[GC (Allocation Failure) [PSYoungGen: 65536K->8192K(76288K)] 65536K->8200K(251392K), 0.0123456 secs]
[Full GC (Ergonomics) [PSYoungGen: 8192K->0K(76288K)] [ParOldGen: 170880K->8192K(175104K)] 179072K->8192K(251392K), [Metaspace: 3072K->3072K(1056768K)], 0.1234567 secs]
```

**字段含义**：

- `PSYoungGen: 65536K->8192K(76288K)`：新生代回收前后
- `65536K->8200K(251392K)`：堆回收前后
- `0.0123456 secs`：GC 耗时

### GC 日志分析工具

**GCEasy**：

- 在线工具：https://gceasy.io/
- 上传 gc.log
- 生成可视化报告

**GCViewer**：

```bash
java -jar gcviewer.jar gc.log
```

**分析指标**：

- GC 频率
- GC 暂停时间
- 吞吐量
- 内存趋势

---

## 4. 性能剖析

### CPU Profiling

**使用 VisualVM**：

1. 连接到应用
2. Profiler → CPU
3. 选择 Profile all classes 或 Profile classes
4. 开始 Profiling
5. 分析热点方法

**使用 async-profiler**：

```bash
./profiler.sh -d 60 -f flamegraph.html <pid>
```

**生成火焰图**

### Memory Profiling

**分析对象分配**：

1. 使用 VisualVM → Profiler → Memory
2. 记录对象分配
3. 查看分配最多的类

**堆转储分析**：

**使用 MAT（Memory Analyzer Tool）**：

1. 打开堆转储文件
2. Leak Suspects：自动识别内存泄漏
3. Dominator Tree：查看对象占用
4. Histogram：对象分布

---

## 5. 火焰图

### 生成火焰图

**使用 async-profiler**：

```bash
# 采样 60 秒，生成火焰图
./profiler.sh -d 60 -f flamegraph.svg <pid>
```

**使用 perf（Linux）**：

```bash
perf record -F 99 -p <pid> -g -- sleep 60
perf script > out.perf
./stackcollapse-perf.pl out.perf > out.folded
./flamegraph.pl out.folded > flamegraph.svg
```

### 读取火焰图

**横轴**：样本数量

**纵轴**：调用栈深度

**颜色**：无特殊含义（随机或按模块）

**分析**：

- 查找最宽的函数：热点
- 查找平顶函数：可能的优化点

---

## 6. 性能基准测试

### JMH（Java Microbenchmark Harness）

**添加依赖**：

```xml
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-core</artifactId>
    <version>1.36</version>
</dependency>
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-generator-annprocess</artifactId>
    <version>1.36</version>
</dependency>
```

**编写基准测试**：

```java
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@State(Scope.Thread)
public class MyBenchmark {
    
    @Benchmark
    public int testMethod() {
        int sum = 0;
        for (int i = 0; i < 100; i++) {
            sum += i;
        }
        return sum;
    }
}
```

**运行**：

```bash
java -jar target/benchmarks.jar
```

**输出**：

```
Benchmark              Mode  Cnt   Score   Error  Units
MyBenchmark.testMethod  avgt   25  45.123 ± 1.234  ns/op
```

---

## 易错点与最佳实践

### 1. 生产环境启用工具的影响

**jmap -dump**：

- 会触发 Full GC
- 应用暂停
- 谨慎使用

**jstack**：

- 开销较小
- 可安全使用

**Flight Recorder**：

- 开销 < 1%
- 生产环境可用

### 2. 堆转储文件的大小

**问题**：

- 堆转储文件大小 = 堆内存大小
- 8 GB 堆 → 8 GB 文件

**解决**：

- 使用 MAT 的索引文件
- 远程分析

### 3. GC 日志的影响

**开销**：

- GC 日志开销 < 1%
- 生产环境推荐开启

**日志轮转**：

```bash
-Xlog:gc*:file=gc.log:time:filecount=5,filesize=100M
```

---

## 实际案例

### 案例 1：定位内存泄漏

**步骤**：

1. **观察内存趋势**：
   ```bash
   jstat -gcutil <pid> 1000
   ```
   老年代使用率持续上升

2. **生成堆转储**：
   ```bash
   jmap -dump:format=b,file=heap.hprof <pid>
   ```

3. **使用 MAT 分析**：
   - Leak Suspects：发现大量 HashMap$Entry
   - Dominator Tree：HashMap 占用 2 GB
   - Path to GC Roots：找到持有 HashMap 的对象

4. **定位代码**：
   - 某个静态缓存 Map
   - 未设置大小限制
   - 对象不断累积

5. **修复**：
   - 使用 LRU 缓存
   - 设置最大容量

### 案例 2：CPU 使用率高

**步骤**：

1. **使用 top 查看**：
   CPU 使用率 100%

2. **生成线程转储**：
   ```bash
   jstack <pid> > thread.txt
   ```

3. **查找占用 CPU 的线程**：
   ```bash
   top -H -p <pid>
   ```
   找到 TID

4. **转换 TID 为十六进制**：
   ```bash
   printf "%x\n" <tid>
   ```

5. **在 jstack 输出中查找**：
   ```
   "Worker-1" #12 prio=5 os_prio=0 tid=0x00007f8a3c001000 nid=0x1a2b runnable
   ```

6. **分析堆栈**：
   发现死循环

7. **修复代码**

### 案例 3：GC 频繁

**步骤**：

1. **分析 GC 日志**：
   ```
   Young GC: 每秒 10 次
   每次回收：50 ms
   ```

2. **使用 GCEasy 分析**：
   - 新生代太小
   - 对象分配速率高

3. **调优**：
   ```bash
   -Xmn2g  # 增大新生代
   ```

4. **验证效果**：
   Young GC 频率降低到每秒 2 次

---

## 关键点总结

1. **JDK 工具**：jps, jstat, jmap, jstack, jcmd
2. **可视化工具**：VisualVM, JConsole, JMC
3. **GC 日志**：启用并分析，使用 GCEasy
4. **性能剖析**：CPU Profiling, Memory Profiling
5. **火焰图**：可视化热点方法
6. **JMH**：准确的性能基准测试

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 第4章 虚拟机性能监控、故障处理工具
- 《Java 性能权威指南》- 全书
- Oracle 官方文档：[Troubleshooting Guide](https://docs.oracle.com/javase/8/docs/technotes/guides/troubleshoot/)
- async-profiler：https://github.com/jvm-profiling-tools/async-profiler
- JMH：https://github.com/openjdk/jmh

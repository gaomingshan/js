# JVM 运行时数据区

## 概述

JVM 运行时数据区是程序执行的内存基础设施，分为线程共享区域和线程私有区域。理解数据区的划分与职责，是掌握内存管理、性能调优和排查问题的前提。

**五大运行时数据区**：
1. **程序计数器**（PC Register）- 线程私有
2. **Java 虚拟机栈**（VM Stack）- 线程私有
3. **本地方法栈**（Native Method Stack）- 线程私有
4. **堆**（Heap）- 线程共享
5. **方法区**（Method Area）- 线程共享

本章聚焦各区域的职责、内存管理与典型问题。

---

## 1. 程序计数器（PC Register）

### 定义与作用

**程序计数器**：记录当前线程执行的字节码指令地址。

**特点**：

- 线程私有（每个线程独立）
- 内存占用极小（几个字节）
- 唯一不会发生 OutOfMemoryError 的区域

### 工作机制

**执行 Java 方法**：

```java
int a = 1;
int b = 2;
int c = a + b;
```

**字节码**：

```
0: iconst_1
1: istore_1
2: iconst_2
3: istore_2
4: iload_1
5: iload_2
6: iadd
7: istore_3
```

**PC 寄存器的值**：

```
时刻 1：PC = 0（执行 iconst_1）
时刻 2：PC = 1（执行 istore_1）
时刻 3：PC = 2（执行 iconst_2）
...
```

### 线程切换

**多线程环境**：

```
线程 1：PC = 5（执行 iload_2）
线程 2：PC = 10（执行其他指令）

线程切换：
  保存线程 1 的 PC = 5
  恢复线程 2 的 PC = 10
```

**作用**：保证线程切换后能恢复执行位置。

### 特殊情况

**执行本地方法**：

```java
public native void nativeMethod();
```

**PC 寄存器**：值为 undefined（空）

**原因**：本地方法不是字节码，无法用 PC 记录位置。

---

## 2. Java 虚拟机栈（VM Stack）

### 栈帧结构

**栈帧（Stack Frame）**：每次方法调用创建一个栈帧，包含：

1. **局部变量表**（Local Variable Table）
2. **操作数栈**（Operand Stack）
3. **动态链接**（Dynamic Linking）
4. **返回地址**（Return Address）

### 局部变量表

**存储内容**：

- 方法参数
- 局部变量
- 基本类型：直接存储值
- 引用类型：存储对象引用（4/8 字节）

**示例**：

```java
void method(int a, String s) {
    long b = 100L;
    double c = 3.14;
}
```

**局部变量表**：

```
Slot 0: this（非静态方法）
Slot 1: a (int, 4 bytes)
Slot 2: s (reference, 4 bytes)
Slot 3-4: b (long, 8 bytes, 占用 2 个 slot)
Slot 5-6: c (double, 8 bytes, 占用 2 个 slot)
```

**查看局部变量表大小**：

```bash
javap -v Demo.class
```

输出：

```
Code:
  stack=2, locals=7, args_size=3
```

- `locals=7`：局部变量表大小为 7 个 slot

### 操作数栈

**作用**：存储方法执行的中间结果

**示例**：

```java
int c = a + b;
```

**字节码执行**：

```
iload_1    // 将局部变量 1 (a) 压入操作数栈
           // 栈：[a]

iload_2    // 将局部变量 2 (b) 压入操作数栈
           // 栈：[a, b]

iadd       // 弹出栈顶两个值，执行加法，结果压入栈
           // 栈：[a+b]

istore_3   // 弹出栈顶值，存入局部变量 3 (c)
           // 栈：[]
```

**栈深度**：

```bash
javap -v Demo.class
```

输出：

```
stack=2, locals=4
```

- `stack=2`：操作数栈最大深度为 2

### 动态链接

**作用**：指向运行时常量池中该方法的引用

**符号引用 → 直接引用**：

- 编译期：方法调用保存为符号引用
- 运行期：符号引用解析为直接引用（内存地址）

### 返回地址

**正常返回**：

```java
int method() {
    return 42;  // ireturn 指令
}
```

**返回地址**：调用方法的下一条指令地址

**异常返回**：

```java
void method() {
    throw new Exception();
}
```

**返回地址**：异常处理器的地址

### 栈溢出（StackOverflowError）

**原因**：

1. 递归调用过深
2. 栈深度超过 JVM 限制

**示例**：

```java
void recursion() {
    recursion();  // 无限递归
}
```

**异常**：

```
Exception in thread "main" java.lang.StackOverflowError
```

**调整栈大小**：

```bash
java -Xss256k MyApp  // 设置栈大小为 256 KB
```

默认值：

- Linux/macOS：1 MB
- Windows：取决于系统

---

## 3. 本地方法栈（Native Method Stack）

### 定义与作用

**本地方法栈**：为本地（Native）方法服务

**示例**：

```java
public class Thread {
    public static native void sleep(long millis);
}
```

### 实现差异

**HotSpot JVM**：

- 本地方法栈与 Java 虚拟机栈合并
- 不区分两者

**其他 JVM**：

- 可能独立实现本地方法栈

### 异常

**StackOverflowError**：

- 本地方法调用过深

**OutOfMemoryError**：

- 本地方法栈无法扩展

---

## 4. 堆（Heap）

### 堆的划分

**分代模型**（传统）：

```
堆
├── 新生代（Young Generation）
│   ├── Eden 区
│   ├── Survivor 0 区（From）
│   └── Survivor 1 区（To）
└── 老年代（Old Generation）
```

**比例**（默认）：

- 新生代 : 老年代 = 1 : 2（`-XX:NewRatio=2`）
- Eden : Survivor0 : Survivor1 = 8 : 1 : 1（`-XX:SurvivorRatio=8`）

### 对象分配

**快速分配路径**：

```
1. TLAB（Thread Local Allocation Buffer）分配
   ├─ 成功 → 返回
   └─ 失败 ↓

2. Eden 区分配
   ├─ 成功 → 返回
   └─ 失败 ↓

3. 触发 Minor GC
   ├─ 空间充足 → 分配
   └─ 失败 ↓

4. 尝试老年代分配
   ├─ 成功 → 返回
   └─ 失败 ↓

5. 触发 Full GC
   ├─ 空间充足 → 分配
   └─ 失败 ↓

6. 抛出 OutOfMemoryError
```

### 堆参数

**设置堆大小**：

```bash
java -Xms512m -Xmx2g MyApp
```

- `-Xms`：初始堆大小（512 MB）
- `-Xmx`：最大堆大小（2 GB）

**推荐**：生产环境 `-Xms` 和 `-Xmx` 设置相同，避免扩容开销。

**查看堆配置**：

```bash
java -XX:+PrintFlagsFinal -version | grep HeapSize
```

### OutOfMemoryError: Java heap space

**原因**：

1. 堆内存不足
2. 内存泄漏（对象无法被 GC）

**示例**：

```java
List<byte[]> list = new ArrayList<>();
while (true) {
    list.add(new byte[1024 * 1024]);  // 每次 1 MB
}
```

**异常**：

```
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
```

**排查**：

1. 使用 jmap 生成堆转储：`jmap -dump:format=b,file=heap.hprof <pid>`
2. 使用 MAT 或 VisualVM 分析堆转储
3. 查找占用内存最多的对象

---

## 5. 方法区（Method Area）

### 定义与演变

**Java 7 及之前**：

- 永久代（PermGen）
- 存储类元数据、常量池、静态变量
- 大小固定（`-XX:PermSize`、`-XX:MaxPermSize`）

**Java 8+**：

- 元空间（Metaspace）
- 使用本地内存（Native Memory）
- 大小动态扩展（`-XX:MetaspaceSize`、`-XX:MaxMetaspaceSize`）

### 存储内容

**方法区存储**：

1. 类型信息（类、接口、枚举）
2. 方法信息（字节码、异常表）
3. 字段信息
4. 运行时常量池
5. 静态变量（Java 7 移至堆）
6. 即时编译后的代码缓存

### 运行时常量池

**来源**：

- class 文件的常量池
- String.intern() 动态添加

**示例**：

```java
String s1 = "Hello";
String s2 = "Hello";
System.out.println(s1 == s2);  // true（常量池）

String s3 = new String("Hello");
String s4 = s3.intern();
System.out.println(s1 == s4);  // true（s4 指向常量池）
```

### 方法区参数

**Java 8+**：

```bash
java -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m MyApp
```

- `-XX:MetaspaceSize`：初始大小（触发 GC 的阈值）
- `-XX:MaxMetaspaceSize`：最大大小（默认无限制）

### OutOfMemoryError: Metaspace

**原因**：

1. 加载类过多（动态代理、Groovy、JSP）
2. 类加载器泄漏

**示例**：

```java
while (true) {
    ClassLoader loader = new URLClassLoader(...);
    Class<?> clazz = loader.loadClass("Demo");
    // loader 未释放，类元数据累积
}
```

**异常**：

```
Exception in thread "main" java.lang.OutOfMemoryError: Metaspace
```

**排查**：

```bash
jstat -gcutil <pid> 1000  # 查看 Metaspace 使用率
jmap -clstats <pid>       # 查看类加载统计
```

---

## 易错点与边界行为

### 1. 堆与栈的区别

| 特性       | 堆                   | 栈                   |
| ---------- | -------------------- | -------------------- |
| 线程       | 线程共享             | 线程私有             |
| 存储内容   | 对象实例、数组       | 基本类型、对象引用   |
| 分配方式   | 动态分配             | 静态分配（栈帧）     |
| 回收方式   | GC 回收              | 方法返回自动释放     |
| 异常       | OutOfMemoryError     | StackOverflowError   |

### 2. 栈上分配 vs 堆分配

**逃逸分析**：

JIT 分析对象是否逃逸出方法：

```java
void method() {
    Object obj = new Object();  // 未逃逸
    // obj 仅在方法内使用
}
```

**优化**：对象分配在栈上，方法返回自动释放，无需 GC。

**启用逃逸分析**：

```bash
java -XX:+DoEscapeAnalysis MyApp  # 默认开启
```

### 3. 永久代 vs 元空间

**永久代的问题**：

- 大小固定，容易溢出
- GC 效率低

**元空间的优势**：

- 使用本地内存，动态扩展
- 减少 Full GC 频率

**迁移影响**：

- Java 7：`-XX:PermSize=128m -XX:MaxPermSize=512m`
- Java 8+：`-XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m`

### 4. 直接内存（Direct Memory）

**定义**：非 JVM 管理的内存，通过 NIO 使用

**示例**：

```java
ByteBuffer buffer = ByteBuffer.allocateDirect(1024);
```

**特点**：

- 不在堆中
- 不受 `-Xmx` 限制
- 受 `-XX:MaxDirectMemorySize` 限制

**OutOfMemoryError: Direct buffer memory**：

```java
while (true) {
    ByteBuffer.allocateDirect(1024 * 1024);
}
```

---

## 实际推导案例

### 案例：为什么递归慢？

**递归**：

```java
int factorial(int n) {
    if (n == 1) return 1;
    return n * factorial(n - 1);
}
```

**每次调用**：

- 创建栈帧（局部变量表、操作数栈）
- 保存返回地址
- 栈深度增加

**factorial(1000)**：

- 创建 1000 个栈帧
- 内存占用 ~ 1000 × 栈帧大小
- 可能栈溢出

**尾递归优化**（Java 不支持）：

```java
int factorial(int n, int acc) {
    if (n == 1) return acc;
    return factorial(n - 1, n * acc);  // 尾调用
}
```

**理论上**可优化为循环，但 JVM 未实现。

### 案例：为什么 StringBuilder 比 String 拼接快？

**String 拼接**：

```java
String s = "";
for (int i = 0; i < 10000; i++) {
    s += i;  // 每次创建新 String 对象
}
```

**内存分配**：

- 创建 10000 个 String 对象
- 堆内存频繁分配、GC

**StringBuilder**：

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);  // 复用同一对象
}
```

**内存分配**：

- 只创建 1 个 StringBuilder 对象
- 内部数组扩容，减少对象创建

**性能**：StringBuilder 快约 100 倍。

---

## 关键点总结

1. **PC 寄存器**：记录字节码执行位置，线程私有
2. **虚拟机栈**：存储栈帧（局部变量表、操作数栈），线程私有
3. **本地方法栈**：为本地方法服务，HotSpot 与虚拟机栈合并
4. **堆**：存储对象实例，线程共享，分代管理
5. **方法区**：存储类元数据，Java 8 改为元空间（本地内存）
6. **运行时常量池**：存储字面量和符号引用，属于方法区

---

## 深入一点

### 使用 jmap 查看内存

**查看堆配置**：

```bash
jmap -heap <pid>
```

**输出**：

```
Heap Configuration:
   MinHeapFreeRatio         = 40
   MaxHeapFreeRatio         = 70
   MaxHeapSize              = 2147483648 (2048.0MB)
   NewSize                  = 89128960 (85.0MB)
   MaxNewSize               = 715653120 (682.5MB)
   OldSize                  = 179306496 (171.0MB)
   NewRatio                 = 2
   SurvivorRatio            = 8
```

**生成堆转储**：

```bash
jmap -dump:format=b,file=heap.hprof <pid>
```

### 使用 jstat 监控内存

**监控 GC**：

```bash
jstat -gc <pid> 1000  # 每秒输出一次
```

**输出**：

```
 S0C    S1C    S0U    S1U      EC       EU        OC         OU       MC     MU
10240  10240    0    8192   81920    40960    174080     87040   51200  45056
```

- S0C/S1C：Survivor 0/1 容量
- EC：Eden 容量
- OC：老年代容量
- MC：元空间容量

### JVM 内存分析工具

**VisualVM**：

```bash
jvisualvm
```

**功能**：

- 监控堆、元空间使用情况
- 生成堆转储
- 分析对象分布

**MAT（Memory Analyzer Tool）**：

- 分析堆转储文件
- 查找内存泄漏
- 对象引用关系

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 第2章 Java 内存区域
- 《Java 性能权威指南》- 第5章堆内存管理
- Oracle 官方文档：[JVM Structure](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-2.html)
- 工具：jmap、jstat、jconsole、VisualVM、MAT

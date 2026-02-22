# 即时编译（JIT）原理

## 概述

Java 采用解释执行和即时编译（JIT）相结合的混合模式。理解 JIT 编译的触发时机、编译层次、热点检测机制，是掌握 Java 性能优化、理解代码执行效率的基础。

本章聚焦：
- **解释执行 vs JIT 编译**
- **热点代码检测**
- **分层编译模型**
- **C1 与 C2 编译器**
- **编译优化技术概览**

---

## 1. 解释执行 vs JIT 编译

### 解释执行

**定义**：逐条解释字节码指令，转换为机器码执行

**特点**：
- 启动快（无需编译）
- 执行慢（每次解释）
- 内存占用少

**流程**：

```
字节码 → 解释器 → 机器码 → CPU 执行
```

### JIT 编译

**定义**：将热点代码编译为本地机器码

**特点**：
- 启动慢（需要编译）
- 执行快（直接执行机器码）
- 内存占用多（缓存机器码）

**流程**：

```
字节码 → JIT 编译器 → 本地机器码 → 代码缓存 → CPU 执行
```

### 混合模式

**HotSpot JVM 的策略**：

```
程序启动：解释执行
  ↓
检测到热点代码：JIT 编译
  ↓
后续调用：执行编译后的机器码
```

**优势**：

- 启动快：解释执行，无需等待编译
- 运行快：热点代码编译优化
- 自适应：根据运行时信息优化

---

## 2. 热点代码检测

### 定义

**热点代码**：被频繁执行的代码

**两类热点代码**：

1. **热点方法**：被多次调用的方法
2. **热点循环**：被多次执行的循环体（栈上替换 OSR）

### 热点检测方式

**1. 基于采样（Sample-based）**：

- 周期性检查线程栈顶方法
- 统计方法出现频率
- 简单但不精确

**2. 基于计数器（Counter-based）**：

HotSpot 使用的方式

**两种计数器**：

**方法调用计数器（Invocation Counter）**：

```java
void method() {
    // 每次调用，计数器 +1
}
```

**回边计数器（Back Edge Counter）**：

```java
for (int i = 0; i < 10000; i++) {
    // 每次循环回边，计数器 +1
}
```

### 编译触发阈值

**Client 模式（C1 编译器）**：

```bash
-XX:CompileThreshold=1500  # 方法调用 1500 次触发编译
```

**Server 模式（C2 编译器）**：

```bash
-XX:CompileThreshold=10000  # 方法调用 10000 次触发编译
```

**查看实际阈值**：

```bash
java -XX:+PrintFlagsFinal -version | grep CompileThreshold
```

---

## 3. 分层编译模型

### 编译层次

**5 个层次**：

```
0. 解释执行
1. C1 编译（无 Profiling）
2. C1 编译（带部分 Profiling）
3. C1 编译（带完整 Profiling）
4. C2 编译（完全优化）
```

### 编译路径

**典型路径**：

```
0 → 3 → 4
```

**解释**：

1. 解释执行，收集信息
2. C1 编译（带 Profiling），快速提升性能
3. C2 编译（完全优化），最高性能

**快速路径**（热点代码）：

```
0 → 4
```

**解释**：

- 跳过 C1，直接 C2 编译

**慢速路径**（冷代码）：

```
0 → 1
```

**解释**：

- C1 编译，但不进一步优化

### 启用分层编译

**JDK 7+**：

```bash
-XX:+TieredCompilation  # 默认开启
```

**优势**：

- 启动快：C1 快速编译
- 运行快：C2 深度优化
- 自适应：根据运行时信息调整

---

## 4. C1 与 C2 编译器

### C1 编译器（Client Compiler）

**特点**：

- 编译速度快
- 优化程度低
- 适合客户端应用

**优化技术**：

1. 字节码优化
2. 局部值编号（Local Value Numbering）
3. 无效代码消除

**编译时间**：

- 约 10-100 ms

### C2 编译器（Server Compiler）

**特点**：

- 编译速度慢
- 优化程度高
- 适合服务端应用

**优化技术**：

1. 方法内联
2. 逃逸分析
3. 标量替换
4. 公共子表达式消除
5. 循环展开
6. 范围检查消除

**编译时间**：

- 约 100-1000 ms

### 性能对比

| 特性       | 解释执行 | C1 编译 | C2 编译 |
| ---------- | -------- | ------- | ------- |
| 启动时间   | 0 ms     | 10-100 ms | 100-1000 ms |
| 执行速度   | 1x       | 5-10x   | 10-100x |
| 内存占用   | 低       | 中      | 高      |

---

## 5. 栈上替换（OSR）

### 定义

**OSR（On-Stack Replacement）**：在方法执行过程中，将解释执行切换为编译执行

### 触发场景

**长时间循环**：

```java
void method() {
    for (int i = 0; i < 1000000; i++) {
        // 循环体
    }
}
```

**流程**：

```
开始：解释执行循环
  ↓
回边计数器达到阈值
  ↓
触发 OSR 编译
  ↓
编译完成：切换到编译后的循环体
```

### OSR 的实现

**保存状态**：

- 局部变量表
- 操作数栈
- PC 计数器

**切换执行**：

```
解释执行的栈帧
  ↓ 切换
编译后的代码
```

**查看 OSR 日志**：

```bash
-XX:+PrintCompilation
```

**输出**：

```
100  1  %  b  Demo::method @ 5 (50 bytes)
```

- `%`：表示 OSR 编译
- `@ 5`：循环起始字节码偏移量

---

## 6. 去优化（Deoptimization）

### 定义

**去优化**：编译后的代码因某些条件不再满足，退回到解释执行

### 触发场景

**1. 类型推测失败**：

```java
void method(Object obj) {
    // JIT 假设 obj 总是 String
    String s = (String) obj;
}

// 传入 Integer，触发去优化
method(new Integer(42));
```

**2. 守护条件失效**：

```java
class A {
    void method() { }
}

// JIT 假设 A.method() 无子类重写
// 后续加载子类 B 重写 method()
// 触发去优化
```

**3. 类加载**：

```java
// JIT 假设类未加载
// 后续加载类，触发去优化
```

### 去优化的代价

**步骤**：

1. 保存当前状态
2. 回退到解释执行
3. 重新收集 Profiling 信息
4. 可能重新编译

**性能影响**：

- 单次去优化：约 1-10 ms
- 频繁去优化：严重影响性能

---

## 7. 编译日志分析

### 启用编译日志

**基本日志**：

```bash
-XX:+PrintCompilation
```

**详细日志**：

```bash
-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining -XX:+PrintCompilation
```

**输出到文件**：

```bash
-XX:+LogCompilation -XX:LogFile=compilation.log
```

### 日志格式

**示例**：

```
100    1       3       java.lang.String::hashCode (55 bytes)
150    2       4       Demo::method (10 bytes)
200    3       3       Demo::loop @ 5 (50 bytes)
```

**字段含义**：

- `100`：时间戳（ms）
- `1`：编译 ID
- `3`：编译层次（0-4）
- `java.lang.String::hashCode`：方法签名
- `(55 bytes)`：字节码大小

**特殊标记**：

- `%`：OSR 编译
- `!`：有异常处理器
- `b`：阻塞模式编译
- `n`：native 方法包装器

---

## 易错点与边界行为

### 1. JIT 编译的不确定性

**问题**：

- JIT 编译是异步的
- 同一段代码，不同运行可能编译时机不同

**影响**：

- 性能测试需要预热
- 基准测试工具（JMH）必要性

### 2. 编译后代码无法调试

**问题**：

- 编译后的代码没有调试信息
- 断点可能失效

**解决方案**：

```bash
-Xint  # 禁用 JIT，纯解释执行
```

### 3. 分层编译的内存占用

**问题**：

- 分层编译会生成多个版本的机器码
- 内存占用增加

**调整**：

```bash
-XX:-TieredCompilation  # 禁用分层编译
```

### 4. 代码缓存满

**问题**：

```
Java HotSpot(TM) 64-Bit Server VM warning: CodeCache is full
```

**原因**：

- 代码缓存（Code Cache）满
- 无法编译新的热点代码

**解决方案**：

```bash
-XX:ReservedCodeCacheSize=256m  # 增大代码缓存
```

**查看使用情况**：

```bash
jconsole  # 监控 Code Cache
```

---

## 实际推导案例

### 案例：为什么基准测试需要预热？

**问题代码**：

```java
long start = System.nanoTime();
for (int i = 0; i < 1000000; i++) {
    method();
}
long time = System.nanoTime() - start;
```

**问题**：

- 前期解释执行，慢
- 中期 JIT 编译，暂停
- 后期编译后执行，快

**结果**：平均时间不准确

**正确做法**：

```java
// 预热
for (int i = 0; i < 10000; i++) {
    method();
}

// 测试
long start = System.nanoTime();
for (int i = 0; i < 1000000; i++) {
    method();
}
long time = System.nanoTime() - start;
```

### 案例：JIT 编译对微基准测试的影响

**问题代码**：

```java
int sum = 0;
for (int i = 0; i < 1000000; i++) {
    sum += i;
}
```

**JIT 优化**：

- 死代码消除：`sum` 未使用，整个循环被消除

**结果**：测试结果不准确

**解决方案**：

```java
int sum = 0;
for (int i = 0; i < 1000000; i++) {
    sum += i;
}
return sum;  // 确保 sum 被使用
```

或使用 JMH 框架：

```java
@Benchmark
public int testSum() {
    int sum = 0;
    for (int i = 0; i < 1000; i++) {
        sum += i;
    }
    return sum;
}
```

---

## 关键点总结

1. **混合模式**：解释执行 + JIT 编译
2. **热点检测**：方法调用计数器 + 回边计数器
3. **分层编译**：5 个层次（0-4），C1 快速编译，C2 深度优化
4. **OSR**：栈上替换，长循环中切换为编译执行
5. **去优化**：编译假设失效，回退到解释执行
6. **代码缓存**：存储编译后的机器码

---

## 深入一点

### JIT 编译的异步执行

**编译线程**：

```bash
-XX:CICompilerCount=4  # 设置编译线程数
```

**默认值**：

- CPU 核心数 ≤ 4：1 个 C1 + 1 个 C2
- CPU 核心数 > 4：2 个 C1 + 2 个 C2

**异步编译流程**：

```
主线程：解释执行
  ↓
检测到热点，加入编译队列
  ↓
编译线程：异步编译
  ↓
编译完成，安装代码
  ↓
主线程：切换到编译后的代码
```

### Tiered Compilation 的状态机

**状态转换**：

```
Level 0（解释）
  ↓
  方法调用频繁 → Level 3（C1 + Profiling）
  ↓
  Profiling 收集完成 → Level 4（C2）
  
  方法调用极其频繁 → Level 4（C2）（跳过 C1）
  
  循环回边频繁 → Level 1（C1 无 Profiling）
```

### 查看编译统计

**使用 jstat**：

```bash
jstat -compiler <pid>
```

**输出**：

```
Compiled Failed Invalid   Time   FailedType FailedMethod
    1234      0       0    12.5          0
```

- `Compiled`：编译的方法数
- `Failed`：编译失败的方法数
- `Time`：累计编译时间（秒）

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 第11章后端编译与优化
- 《Java 性能权威指南》- 第4章 JIT 编译器
- Oracle 官方文档：[Java HotSpot VM Options](https://www.oracle.com/java/technologies/javase/vmoptions-jsp.html)
- OpenJDK Wiki：[HotSpot Glossary of Terms](https://wiki.openjdk.java.net/display/HotSpot/Glossary+of+HotSpot+Terms)
- 工具：JMH（Java Microbenchmark Harness）

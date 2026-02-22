# 其他 JIT 优化技术

## 概述

除了方法内联和逃逸分析，JIT 编译器还使用多种优化技术提升代码性能。理解这些优化技术的原理和应用场景，有助于编写高性能的 Java 代码。

本章聚焦：
- **公共子表达式消除**
- **循环优化**
- **范围检查消除**
- **死代码消除**
- **常量折叠与传播**

---

## 1. 公共子表达式消除（CSE）

### 定义

**公共子表达式消除**：识别并消除重复计算的表达式

### 示例

**源码**：

```java
int result = (a + b) * c + (a + b) * d;
```

**优化前**：

```
t1 = a + b
t2 = t1 * c
t3 = a + b  // 重复计算
t4 = t3 * d
result = t2 + t4
```

**优化后**：

```
t1 = a + b
t2 = t1 * c
t4 = t1 * d  // 复用 t1
result = t2 + t4
```

### 复杂示例

**源码**：

```java
void method(int[] arr) {
    int x = arr[0] + arr[1];
    int y = arr[0] + arr[1];  // 重复表达式
    System.out.println(x + y);
}
```

**优化后**：

```java
void method(int[] arr) {
    int temp = arr[0] + arr[1];  // 计算一次
    int x = temp;
    int y = temp;  // 复用
    System.out.println(x + y);
}
```

---

## 2. 循环优化

### 循环不变代码外提（Loop Invariant Code Motion）

**定义**：将循环中不变的计算移到循环外

**源码**：

```java
for (int i = 0; i < n; i++) {
    int temp = a * b;  // 循环不变
    result[i] = temp + i;
}
```

**优化后**：

```java
int temp = a * b;  // 外提到循环外
for (int i = 0; i < n; i++) {
    result[i] = temp + i;
}
```

### 循环展开（Loop Unrolling）

**定义**：减少循环次数，增加循环体

**源码**：

```java
for (int i = 0; i < 100; i++) {
    sum += arr[i];
}
```

**优化后**：

```java
for (int i = 0; i < 100; i += 4) {
    sum += arr[i];
    sum += arr[i + 1];
    sum += arr[i + 2];
    sum += arr[i + 3];
}
```

**优势**：

- 减少循环判断次数
- 提高指令级并行
- 更好的流水线利用

**JVM 参数**：

```bash
-XX:LoopUnrollLimit=60  # 循环展开的最大次数
```

### 循环向量化（Loop Vectorization）

**定义**：使用 SIMD 指令并行处理多个数据

**源码**：

```java
for (int i = 0; i < arr.length; i++) {
    arr[i] = arr[i] * 2;
}
```

**向量化后**（伪代码）：

```java
for (int i = 0; i < arr.length; i += 4) {
    // 使用 SIMD 指令同时处理 4 个元素
    [arr[i], arr[i+1], arr[i+2], arr[i+3]] *= [2, 2, 2, 2];
}
```

**支持**：

- JDK 9+ 的 HotSpot JVM
- 需要 CPU 支持 SSE/AVX 指令集

---

## 3. 范围检查消除（Range Check Elimination）

### 定义

**范围检查消除**：消除数组访问的边界检查

### 问题

**数组访问的边界检查**：

```java
int value = arr[i];  // JVM 检查 i >= 0 && i < arr.length
```

**字节码**：

```
iload_1        // 加载 i
iload_0        // 加载 arr
arraylength    // 获取数组长度
if_icmpge      // i >= length 则抛异常
iload_1
iaload         // 访问数组
```

### 优化

**可推导的范围**：

```java
for (int i = 0; i < arr.length; i++) {
    int value = arr[i];  // i 的范围已知，消除检查
}
```

**优化后**：

```java
for (int i = 0; i < arr.length; i++) {
    // 无需边界检查
    int value = arr[i];
}
```

### 条件

**1. 循环变量**：

```java
for (int i = 0; i < arr.length; i++) {
    arr[i] = 0;  // 可消除
}
```

**2. 范围可推导**：

```java
int len = arr.length;
for (int i = 0; i < len; i++) {
    arr[i] = 0;  // 可消除
}
```

**无法消除**：

```java
for (int i = 0; i < 100; i++) {
    arr[i] = 0;  // arr.length 未知，无法消除
}
```

---

## 4. 死代码消除（Dead Code Elimination）

### 定义

**死代码消除**：删除永不执行或无用的代码

### 类型

**1. 不可达代码**：

```java
if (false) {
    System.out.println("Never executed");  // 死代码
}
```

**优化后**：

```java
// 代码被删除
```

**2. 无用的计算**：

```java
int x = 1 + 2;  // x 未被使用
```

**优化后**：

```java
// 代码被删除
```

**3. 无用的赋值**：

```java
int x = 10;
x = 20;  // 第一次赋值无用
System.out.println(x);
```

**优化后**：

```java
int x = 20;
System.out.println(x);
```

### 与微基准测试

**问题代码**：

```java
@Benchmark
public void test() {
    int sum = 0;
    for (int i = 0; i < 1000; i++) {
        sum += i;
    }
    // sum 未使用，整个循环被消除
}
```

**正确做法**：

```java
@Benchmark
public int test() {
    int sum = 0;
    for (int i = 0; i < 1000; i++) {
        sum += i;
    }
    return sum;  // 使用 sum，避免被消除
}
```

---

## 5. 常量折叠与传播

### 常量折叠（Constant Folding）

**定义**：编译期计算常量表达式

**源码**：

```java
int x = 2 + 3;
int y = x * 4;
```

**编译后**：

```java
int x = 5;
int y = 20;
```

### 常量传播（Constant Propagation）

**定义**：将常量值传播到使用点

**源码**：

```java
int x = 10;
int y = x + 5;
int z = y * 2;
```

**传播后**：

```java
int x = 10;
int y = 15;  // x 传播为 10
int z = 30;  // y 传播为 15
```

### final 变量的优化

**源码**：

```java
final int MAX = 100;

if (value < MAX) {
    // ...
}
```

**优化后**：

```java
if (value < 100) {  // MAX 内联为 100
    // ...
}
```

---

## 6. 条件表达式优化

### 分支预测优化

**热分支优化**：

```java
for (int i = 0; i < 1000000; i++) {
    if (i % 2 == 0) {  // 50% 概率
        even++;
    } else {
        odd++;
    }
}
```

**JIT 优化**：

- 收集分支统计信息
- 将热分支放在前面
- 优化 CPU 分支预测

### 分支消除

**源码**：

```java
boolean flag = true;

if (flag) {
    doSomething();
} else {
    doOtherThing();  // 永不执行
}
```

**优化后**：

```java
doSomething();
```

---

## 7. 字符串优化

### 字符串拼接优化

**源码**：

```java
String s = "a" + "b" + "c";
```

**编译期优化**：

```java
String s = "abc";
```

**运行期拼接**：

```java
String s = str1 + str2 + str3;
```

**编译为**：

```java
String s = new StringBuilder()
    .append(str1)
    .append(str2)
    .append(str3)
    .toString();
```

**JIT 优化**：

- 逃逸分析：StringBuilder 未逃逸
- 标量替换：优化 StringBuilder

### String.intern() 优化

**源码**：

```java
String s1 = new String("Hello").intern();
String s2 = "Hello";
```

**优化**：

- JIT 识别常量字符串
- 直接使用常量池中的字符串

---

## 8. 数值计算优化

### 强度削弱（Strength Reduction）

**定义**：用开销小的操作替换开销大的操作

**示例**：

**乘法 → 移位**：

```java
int x = y * 2;
```

**优化后**：

```java
int x = y << 1;  // 左移 1 位等于乘以 2
```

**除法 → 移位**：

```java
int x = y / 4;
```

**优化后**：

```java
int x = y >> 2;  // 右移 2 位等于除以 4
```

**乘法 → 加法**：

```java
for (int i = 0; i < n; i++) {
    int x = i * 10;
}
```

**优化后**：

```java
int x = 0;
for (int i = 0; i < n; i++) {
    // x = x + 10（增量更新）
    x += 10;
}
```

### 归纳变量优化

**源码**：

```java
for (int i = 0; i < n; i++) {
    arr[i] = i * i;
}
```

**优化**：

```
i=0: 0*0 = 0
i=1: 1*1 = 1 = 0 + 1
i=2: 2*2 = 4 = 1 + 3
i=3: 3*3 = 9 = 4 + 5
规律：arr[i] = arr[i-1] + (2*i - 1)
```

**优化后**：

```java
int sq = 0;
int delta = 1;
for (int i = 0; i < n; i++) {
    arr[i] = sq;
    sq += delta;
    delta += 2;
}
```

---

## 易错点与边界行为

### 1. 浮点数的优化限制

**问题**：

```java
double x = 0.1 + 0.2;
```

**不优化为**：

```java
double x = 0.3;  // 错误，0.1 + 0.2 != 0.3
```

**原因**：

- 浮点数计算有精度问题
- JIT 不进行浮点常量折叠（某些情况）

### 2. volatile 字段的优化限制

**问题**：

```java
volatile int x = 10;
int y = x + x;
```

**不优化为**：

```java
int y = 20;
```

**原因**：

- volatile 禁止某些重排序
- 保证内存可见性

### 3. 异常路径的优化

**问题**：

```java
try {
    riskyOperation();
} catch (Exception e) {
    // 异常处理
}
```

**优化**：

- 正常路径（无异常）优化
- 异常路径不优化（频率低）

### 4. 反射调用的优化

**问题**：

```java
Method method = clazz.getMethod("method");
method.invoke(obj);
```

**优化限制**：

- 反射调用难以优化
- 无法内联
- 建议使用 MethodHandle（Java 7+）

---

## 实际推导案例

### 案例：为什么 i++ 和 ++i 性能相同？

**源码**：

```java
for (int i = 0; i < n; i++) { }
for (int i = 0; i < n; ++i) { }
```

**字节码相同**：

```
iload_1
iinc 1, 1
```

**结论**：JIT 优化后，性能完全相同。

### 案例：ArrayList vs LinkedList

**ArrayList 遍历**：

```java
for (int i = 0; i < list.size(); i++) {
    list.get(i);
}
```

**优化**：

- 循环不变：`list.size()` 外提
- 范围检查消除

**LinkedList 遍历**：

```java
for (int i = 0; i < list.size(); i++) {
    list.get(i);  // 每次 O(n)
}
```

**问题**：

- 无法优化
- 总时间复杂度 O(n²)

**正确做法**：

```java
for (Node node : list) {
    // 使用迭代器，O(n)
}
```

---

## 关键点总结

1. **CSE**：消除重复计算的表达式
2. **循环优化**：循环不变外提、循环展开、循环向量化
3. **范围检查消除**：消除数组边界检查
4. **死代码消除**：删除永不执行或无用的代码
5. **常量折叠**：编译期计算常量表达式
6. **强度削弱**：用低开销操作替换高开销操作

---

## 深入一点

### IR 中的优化表示

**中间表示（IR）**：

```
原始 IR：
  t1 = a + b
  t2 = t1 * c
  t3 = a + b
  t4 = t3 * d

CSE 后：
  t1 = a + b
  t2 = t1 * c
  t4 = t1 * d  // 复用 t1
```

### 优化的权衡

**代码大小 vs 性能**：

- 循环展开：代码变大，性能提升
- 内联：代码变大，性能提升
- 需要平衡

**编译时间 vs 性能**：

- C2 编译器：编译慢，优化好
- C1 编译器：编译快，优化少
- 分层编译平衡两者

### 查看优化日志

**启用日志**：

```bash
-XX:+UnlockDiagnosticVMOptions -XX:+PrintCompilation -XX:+PrintInlining -XX:+PrintEliminateAllocations
```

**分析工具**：

- JITWatch：可视化 JIT 编译日志
- Perfasm：查看生成的汇编代码

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 第11章后端编译与优化
- 《编译原理（龙书）》- 第9章代码优化
- Oracle 官方文档：[Java HotSpot VM Options](https://www.oracle.com/java/technologies/javase/vmoptions-jsp.html)
- OpenJDK Wiki：[Compiler Optimizations](https://wiki.openjdk.java.net/display/HotSpot/CompilerOptimizations)
- 工具：JITWatch、Perfasm、JMH

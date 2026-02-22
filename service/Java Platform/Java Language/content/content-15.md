# 对象的内存布局

## 概述

Java 对象在堆内存中的存储不是简单的字段堆砌，而是遵循精心设计的内存布局。HotSpot JVM 将对象分为三部分：对象头（Header）、实例数据（Instance Data）、对齐填充（Padding）。

理解对象布局的意义：
- **内存占用计算**：预估对象大小，优化内存使用
- **性能优化**：理解字段访问的缓存局部性
- **并发机制**：对象头存储锁状态、GC 标记等元数据

本章使用 JOL（Java Object Layout）工具验证内存布局。

---

## 1. 对象头（Object Header）

### 对象头的组成

**HotSpot JVM 的对象头**：

- **Mark Word**：8 字节（64 位 JVM）
- **Klass Pointer**：4 字节（开启指针压缩）或 8 字节
- **数组长度**：4 字节（仅数组对象）

### Mark Word 的结构

**64 位 JVM 的 Mark Word（8 字节）**：

| 锁状态      | 25 bit         | 31 bit       | 1 bit 是否偏向 | 2 bit 锁标志 |
| ----------- | -------------- | ------------ | -------------- | ------------ |
| 无锁        | unused         | hashCode     | 0              | 01           |
| 偏向锁      | thread ID      | epoch        | 1              | 01           |
| 轻量级锁    | 指向栈中锁记录的指针 |            |                | 00           |
| 重量级锁    | 指向重量级锁的指针   |            |                | 10           |
| GC 标记     | 空               |              |                | 11           |

**功能复用**：

Mark Word 根据锁状态复用存储空间：
- **无锁状态**：存储对象的 hashCode
- **偏向锁**：存储持有锁的线程 ID
- **轻量级锁**：指向栈帧中的锁记录
- **重量级锁**：指向 monitor 对象的指针

### Klass Pointer

**作用**：指向对象的类元数据（InstanceKlass）

**指针压缩**：

默认开启指针压缩（`-XX:+UseCompressedOops`）：
- 4 字节存储，可寻址 32 GB 内存（2^32 × 8 字节对齐）
- 超过 32 GB 自动禁用压缩，Klass Pointer 变为 8 字节

**关闭压缩**：

```bash
java -XX:-UseCompressedOops MyApp
```

### 数组长度字段

**仅数组对象包含**：

```java
int[] arr = new int[10];
```

对象头包含：
- Mark Word：8 字节
- Klass Pointer：4 字节（压缩）
- Array Length：4 字节
- **总计**：16 字节

---

## 2. 实例数据（Instance Data）

### 字段存储顺序

**默认顺序**（JVM 规范未强制要求）：

1. long / double（8 字节）
2. int / float（4 字节）
3. short / char（2 字节）
4. byte / boolean（1 字节）
5. 引用类型（4 或 8 字节）

**目的**：减少内存空隙，提升缓存效率

### 字段内存对齐

**规则**：

- 8 字节字段必须在 8 字节边界
- 4 字节字段必须在 4 字节边界
- 2 字节字段必须在 2 字节边界

**示例**：

```java
class Demo {
    byte a;     // 1 字节
    int b;      // 4 字节
    byte c;     // 1 字节
}
```

**内存布局**（理论）：

```
[Header: 12 bytes]
[a: 1 byte] [padding: 3 bytes]  // 对齐到 4 字节边界
[b: 4 bytes]
[c: 1 byte] [padding: 3 bytes]  // 对齐到 8 字节边界
```

**总计**：12 + 1 + 3 + 4 + 1 + 3 = 24 字节

**优化后**：

```java
class Demo {
    int b;      // 4 字节
    byte a;     // 1 字节
    byte c;     // 1 字节
}
```

**内存布局**：

```
[Header: 12 bytes]
[b: 4 bytes]
[a: 1 byte] [c: 1 byte] [padding: 2 bytes]
```

**总计**：12 + 4 + 1 + 1 + 2 = 20 字节（节省 4 字节）

---

## 3. 对齐填充（Padding）

### 8 字节对齐

**规则**：对象总大小必须是 8 字节的倍数

**原因**：

1. 简化内存管理（分配、GC）
2. 提升 CPU 缓存效率
3. 避免伪共享（False Sharing）

**示例**：

```java
class Tiny {
    byte value;  // 1 字节
}
```

**内存布局**：

```
[Header: 12 bytes]
[value: 1 byte] [padding: 3 bytes]
```

总计：16 字节（对齐到 8 的倍数）

---

## 4. 使用 JOL 工具分析内存布局

### 安装 JOL

**Maven 依赖**：

```xml
<dependency>
    <groupId>org.openjdk.jol</groupId>
    <artifactId>jol-core</artifactId>
    <version>0.16</version>
</dependency>
```

### 分析对象布局

**示例代码**：

```java
import org.openjdk.jol.info.ClassLayout;

class Person {
    private int age;
    private String name;
}

public class JOLDemo {
    public static void main(String[] args) {
        Person p = new Person();
        System.out.println(ClassLayout.parseInstance(p).toPrintable());
    }
}
```

**输出**：

```
Person object internals:
 OFFSET  SIZE               TYPE DESCRIPTION                   VALUE
      0     4                    (object header)               01 00 00 00
      4     4                    (object header)               00 00 00 00
      8     4                    (object header)               43 c1 00 f8
     12     4                int Person.age                    0
     16     4   java.lang.String Person.name                   null
     20     4                    (loss due to the next object alignment)
Instance size: 24 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
```

**解读**：

- 对象头：12 字节（Mark Word 8 字节 + Klass Pointer 4 字节）
- age：4 字节
- name：4 字节（压缩引用）
- 对齐填充：4 字节
- **总计**：24 字节

### 数组对象布局

**示例**：

```java
int[] arr = new int[5];
System.out.println(ClassLayout.parseInstance(arr).toPrintable());
```

**输出**：

```
[I object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                   VALUE
      0     4        (object header)               01 00 00 00
      4     4        (object header)               00 00 00 00
      8     4        (object header)               6d 01 00 f8
     12     4        (object header)               05 00 00 00  // 数组长度 5
     16    20    int [I.<elements>                 N/A
Instance size: 36 bytes
```

**解读**：

- 对象头：16 字节（Mark Word 8 + Klass Pointer 4 + Array Length 4）
- 数组元素：5 × 4 = 20 字节
- **总计**：36 字节（已对齐）

---

## 5. 特殊对象的内存占用

### 空对象

**源码**：

```java
class Empty { }

Empty obj = new Empty();
```

**内存布局**：

```
[Header: 12 bytes]
[padding: 4 bytes]  // 对齐到 16 字节
```

**总计**：16 字节（最小对象大小）

### 包装类型

**Integer 对象**：

```java
Integer num = 42;
```

**内存布局**：

```
[Header: 12 bytes]
[value: 4 bytes (int)]
```

**总计**：16 字节

**对比基本类型**：

- `int`：4 字节
- `Integer`：16 字节（4 倍大小）

### String 对象

**源码**：

```java
String s = "Hello";
```

**String 内部结构**（Java 9+）：

```java
public final class String {
    private final byte[] value;  // 字符数组（压缩）
    private final byte coder;    // 编码标志（Latin1 或 UTF-16）
    private int hash;            // 缓存的 hashCode
}
```

**内存布局**：

```
String 对象：
  [Header: 12 bytes]
  [value: 4 bytes (引用)]
  [coder: 1 byte]
  [hash: 4 bytes]
  [padding: 3 bytes]
  = 24 bytes

byte[] 数组：
  [Header: 16 bytes]
  [elements: 5 bytes ("Hello")]
  [padding: 3 bytes]
  = 24 bytes

总计：48 bytes
```

---

## 易错点与边界行为

### 1. 继承类的字段布局

**父类字段在前**：

```java
class Parent {
    int a;
}

class Child extends Parent {
    int b;
}
```

**内存布局**：

```
[Header: 12 bytes]
[Parent.a: 4 bytes]
[Child.b: 4 bytes]
[padding: 4 bytes]
```

### 2. 静态字段不占用对象内存

**源码**：

```java
class Demo {
    static int staticValue;  // 不在对象中
    int instanceValue;       // 在对象中
}
```

**内存布局**：

```
[Header: 12 bytes]
[instanceValue: 4 bytes]
```

静态字段存储在 Metaspace（元空间），不在对象内存中。

### 3. 引用类型压缩的边界

**堆内存 ≤ 32 GB**：

- 引用：4 字节（压缩）

**堆内存 > 32 GB**：

- 引用：8 字节（无压缩）

**测试**：

```bash
java -Xmx4g -XX:+UseCompressedOops MyApp   # 压缩
java -Xmx40g -XX:-UseCompressedOops MyApp  # 不压缩
```

### 4. 伪共享（False Sharing）

**问题**：

多个线程同时修改同一缓存行的不同变量，导致缓存失效。

**缓存行大小**：通常 64 字节

**问题代码**：

```java
class Counter {
    volatile long count1;  // 8 字节
    volatile long count2;  // 8 字节（同一缓存行）
}
```

**解决方案**：字段填充

```java
class Counter {
    volatile long count1;
    long p1, p2, p3, p4, p5, p6, p7;  // 56 字节填充
    volatile long count2;
}
```

**Java 8 @Contended**：

```java
class Counter {
    @sun.misc.Contended
    volatile long count1;
    
    @sun.misc.Contended
    volatile long count2;
}
```

需要 JVM 参数：`-XX:-RestrictContended`

---

## 实际推导案例

### 案例：为什么对象数组比基本类型数组慢？

**基本类型数组**：

```java
int[] arr = new int[1000];
```

内存布局：连续存储 1000 个 int

```
[Header: 16 bytes]
[0][1][2]...[999]  // 4000 字节连续
```

**对象数组**：

```java
Integer[] arr = new Integer[1000];
```

内存布局：存储 1000 个引用，对象分散在堆中

```
数组对象：
  [Header: 16 bytes]
  [ref0][ref1]...[ref999]  // 4000 字节引用

Integer 对象（1000 个）：
  每个 16 字节，总计 16000 字节
  分散在堆中（缓存不友好）
```

**性能差异**：

- 基本类型：连续访问，缓存命中率高
- 对象数组：需要两次内存访问（数组 → 引用 → 对象），缓存miss 多

### 案例：计算对象内存占用

**源码**：

```java
class User {
    int id;          // 4 字节
    String name;     // 4 字节（引用压缩）
    boolean active;  // 1 字节
}
```

**计算**：

```
对象头：12 字节
id：4 字节
name：4 字节（引用）
active：1 字节
小计：21 字节
对齐到 24 字节（8 的倍数）

String 对象（假设 "Alice"）：
  String 对象：24 字节
  char[]：16 + 10 = 26 → 32 字节（对齐）
  小计：56 字节

总计：24 + 56 = 80 字节
```

---

## 关键点总结

1. **对象头**：Mark Word（8 字节）+ Klass Pointer（4/8 字节）+ 数组长度（4 字节，仅数组）
2. **实例数据**：字段按类型大小排序，减少内存空隙
3. **对齐填充**：对象大小必须是 8 字节的倍数
4. **指针压缩**：堆 ≤ 32 GB 时，引用 4 字节；否则 8 字节
5. **最小对象**：空对象 16 字节（对象头 12 + 填充 4）
6. **JOL 工具**：可视化对象布局，精确测量内存占用

---

## 深入一点

### 对象头的位操作

**读取 Mark Word**：

```java
import sun.misc.Unsafe;

Unsafe unsafe = getUnsafe();
Object obj = new Object();
long address = unsafe.objectFieldOffset(...);
long markWord = unsafe.getLong(obj, address);
```

**解析锁状态**：

```java
int lockBits = (int) (markWord & 0x03);
switch (lockBits) {
    case 0x01:
        if ((markWord & 0x04) == 0) {
            System.out.println("无锁");
        } else {
            System.out.println("偏向锁");
        }
        break;
    case 0x00:
        System.out.println("轻量级锁");
        break;
    case 0x10:
        System.out.println("重量级锁");
        break;
}
```

### TLAB 与对象分配

**TLAB（Thread Local Allocation Buffer）**：

每个线程在 Eden 区预分配一块内存：

```
线程 1 TLAB：[已分配][空闲]
线程 2 TLAB：[已分配][空闲]
```

**分配流程**：

1. 尝试在 TLAB 中分配
2. TLAB 不足，申请新 TLAB
3. 对象过大，直接在 Eden 区分配

**JVM 参数**：

```bash
-XX:+UseTLAB           # 启用 TLAB（默认开启）
-XX:TLABSize=256k      # 设置 TLAB 大小
```

### 对象年龄与晋升

**对象头的年龄位**：

Mark Word 的 4 位存储对象年龄（0-15）：

```
每次 Minor GC 存活 → 年龄 +1
年龄达到 15（或 -XX:MaxTenuringThreshold）→ 晋升到老年代
```

**查看对象年龄**：

```bash
-XX:+PrintTenuringDistribution
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 2.3 节对象的内存布局
- 《Java 性能权威指南》- 第9章内存管理
- OpenJDK JOL 工具：[JOL GitHub](https://github.com/openjdk/jol)
- Aleksey Shipilëv：[Java Object Layout](https://shipilev.net/)
- HotSpot 源码：`hotspot/share/oops/oop.hpp`

# Java 内存模型基础

## 概述

Java 内存模型（Java Memory Model, JMM）定义了多线程环境下，线程如何通过内存交互、如何保证可见性、有序性和原子性。理解 JMM 是掌握并发编程、避免线程安全问题的基础。

本章聚焦：
- **JMM 的抽象结构**
- **happens-before 原则**
- **内存屏障**
- **可见性、有序性、原子性**

---

## 1. JMM 的抽象结构

### 硬件内存模型

**物理结构**：

```
CPU1                CPU2
├── 寄存器          ├── 寄存器
├── L1 Cache        ├── L1 Cache
├── L2 Cache        ├── L2 Cache
└── L3 Cache (共享)

主内存（RAM）
```

**问题**：

- 每个 CPU 有独立的缓存
- 缓存不一致导致可见性问题

### JMM 的抽象模型

**线程、工作内存、主内存**：

```
线程 1                     线程 2
├── 工作内存               ├── 工作内存
│   └── 变量副本           │   └── 变量副本
└── 读写操作               └── 读写操作
        ↕                         ↕
            主内存（共享变量）
```

**工作内存**：

- 线程私有
- 存储主内存中变量的副本
- 所有操作在工作内存中进行

**主内存**：

- 所有线程共享
- 存储实例字段、静态字段、数组元素

**交互操作**：

1. **read**：主内存读取变量
2. **load**：将 read 的值放入工作内存
3. **use**：工作内存变量传递给执行引擎
4. **assign**：执行引擎的值赋给工作内存
5. **store**：工作内存变量传送到主内存
6. **write**：将 store 的值写入主内存变量
7. **lock**：锁定主内存变量
8. **unlock**：解锁主内存变量

---

## 2. happens-before 原则

### 定义

**happens-before**：如果操作 A happens-before 操作 B，则 A 的结果对 B 可见

**注意**：

- happens-before 不代表时间上的先后
- 而是可见性的保证

### 8 条 happens-before 规则

**1. 程序顺序规则**：

单线程内，按代码顺序执行：

```java
int a = 1;  // 操作 1
int b = 2;  // 操作 2

// 操作 1 happens-before 操作 2
```

**2. 监视器锁规则**：

unlock happens-before 后续的 lock：

```java
synchronized (lock) {
    // 操作 A
}

// unlock

synchronized (lock) {
    // 操作 B（可见操作 A 的结果）
}
```

**3. volatile 变量规则**：

volatile 写 happens-before 后续的 volatile 读：

```java
// 线程 1
volatile int flag = 1;

// 线程 2
int x = flag;  // 可见线程 1 的写入
```

**4. 线程启动规则**：

Thread.start() happens-before 线程内的操作：

```java
int a = 1;
thread.start();  // start() happens-before 线程内操作
```

**5. 线程终止规则**：

线程内操作 happens-before Thread.join()：

```java
thread.join();
// join() 后可见线程内的所有操作
```

**6. 线程中断规则**：

interrupt() happens-before 检测到中断：

```java
thread.interrupt();
// 线程内 isInterrupted() 或 InterruptedException 可见
```

**7. 对象终结规则**：

构造方法完成 happens-before finalize()：

```java
Object obj = new Object();  // 构造完成
// happens-before obj.finalize()
```

**8. 传递性**：

A happens-before B，B happens-before C，则 A happens-before C

---

## 3. 内存屏障（Memory Barrier）

### 定义

**内存屏障**：禁止特定类型的指令重排序

### 四种内存屏障

**1. LoadLoad 屏障**：

```
Load1
LoadLoad 屏障
Load2
```

**保证**：Load1 的数据在 Load2 之前加载

**2. StoreStore 屏障**：

```
Store1
StoreStore 屏障
Store2
```

**保证**：Store1 的数据在 Store2 之前刷新到内存

**3. LoadStore 屏障**：

```
Load1
LoadStore 屏障
Store2
```

**保证**：Load1 的数据在 Store2 之前加载

**4. StoreLoad 屏障**：

```
Store1
StoreLoad 屏障
Load2
```

**保证**：Store1 的数据在 Load2 之前刷新到内存

**开销**：StoreLoad 开销最大，相当于全屏障

### volatile 的内存屏障

**volatile 写**：

```
StoreStore 屏障
volatile 写
StoreLoad 屏障
```

**volatile 读**：

```
volatile 读
LoadLoad 屏障
LoadStore 屏障
```

---

## 4. 可见性

### 定义

**可见性**：一个线程修改的状态，对其他线程立即可见

### 可见性问题示例

**问题代码**：

```java
class Demo {
    boolean flag = false;
    
    // 线程 1
    void writer() {
        flag = true;
    }
    
    // 线程 2
    void reader() {
        while (!flag) {
            // 可能永远循环
        }
    }
}
```

**原因**：

- 线程 2 的工作内存缓存了 `flag = false`
- 线程 1 修改 `flag`，未刷新到主内存
- 线程 2 读取不到最新值

### 保证可见性的方式

**1. volatile**：

```java
volatile boolean flag = false;
```

**2. synchronized**：

```java
synchronized (lock) {
    flag = true;
}

synchronized (lock) {
    if (flag) { ... }
}
```

**3. final**：

```java
final int value = 42;  // 构造方法完成后可见
```

**4. happens-before**：

利用 happens-before 规则保证可见性

---

## 5. 有序性

### 定义

**有序性**：程序执行的顺序按照代码的先后顺序

### 指令重排序

**编译器重排序**：

```java
int a = 1;  // 1
int b = 2;  // 2
int c = a + b;  // 3

// 可能重排为：
int b = 2;  // 2
int a = 1;  // 1
int c = a + b;  // 3
```

**CPU 重排序**：

- 乱序执行
- 内存系统重排序

### 重排序问题示例

**双重检查锁的问题**：

```java
class Singleton {
    private static Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {  // 1
            synchronized (Singleton.class) {
                if (instance == null) {  // 2
                    instance = new Singleton();  // 3
                }
            }
        }
        return instance;
    }
}
```

**问题**：

操作 3 可以分解为：

```
memory = allocate();  // 1. 分配内存
ctorInstance(memory); // 2. 初始化对象
instance = memory;    // 3. 设置引用
```

**重排序后**：

```
memory = allocate();  // 1
instance = memory;    // 3（重排）
ctorInstance(memory); // 2
```

**后果**：

- 线程 A 执行到步骤 3，`instance` 非 null 但未初始化
- 线程 B 执行步骤 1，发现 `instance` 非 null，直接返回
- 线程 B 使用未初始化的对象 → 错误

**解决方案**：

```java
private static volatile Singleton instance;
```

**volatile 禁止重排序**：

```
memory = allocate();
ctorInstance(memory);
StoreStore 屏障
instance = memory;  // volatile 写
```

---

## 6. 原子性

### 定义

**原子性**：操作不可分割，要么全部执行，要么全部不执行

### 原子性问题示例

**问题代码**：

```java
int count = 0;

// 线程 1 和线程 2 同时执行
count++;
```

**非原子性**：

```
读取 count
加 1
写入 count
```

**竞态条件**：

```
线程 1 读取 count = 0
线程 2 读取 count = 0
线程 1 写入 count = 1
线程 2 写入 count = 1

结果：count = 1（丢失一次更新）
```

### 保证原子性的方式

**1. synchronized**：

```java
synchronized (lock) {
    count++;
}
```

**2. Atomic 类**：

```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();
```

**3. Lock**：

```java
Lock lock = new ReentrantLock();
lock.lock();
try {
    count++;
} finally {
    lock.unlock();
}
```

---

## 易错点与边界行为

### 1. long 和 double 的非原子性

**问题**：

```java
long value = 0;

// 线程 1
value = 1L;

// 线程 2
long x = value;  // 可能读取到部分写入的值
```

**原因**：

- long 和 double 是 64 位
- 32 位 JVM 分两次写入
- 可能读取到高 32 位或低 32 位

**解决方案**：

```java
volatile long value = 0;
```

### 2. volatile 不保证原子性

**问题代码**：

```java
volatile int count = 0;

// 多线程执行
count++;  // 非原子操作
```

**原因**：

- `count++` 包含读-改-写三个操作
- volatile 只保证可见性，不保证原子性

**解决方案**：

```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();
```

### 3. final 字段的可见性

**正确用法**：

```java
class Demo {
    final int value;
    
    Demo(int value) {
        this.value = value;
    }
}

// 构造方法完成后，value 对所有线程可见
```

**错误用法**：

```java
class Demo {
    final int value;
    static Demo instance;
    
    Demo(int value) {
        this.value = value;
        instance = this;  // 对象逃逸
    }
}

// 其他线程可能看到未初始化的 value
```

### 4. happens-before 不代表时间顺序

**示例**：

```java
int a = 1;  // 操作 1
int b = 2;  // 操作 2
```

**happens-before**：

- 操作 1 happens-before 操作 2

**实际执行**：

- 可能重排序为操作 2 先执行
- 但保证操作 2 能看到操作 1 的结果

---

## 实际推导案例

### 案例：DCL 单例的演化

**问题版本**：

```java
class Singleton {
    private static Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

**修复版本**：

```java
class Singleton {
    private static volatile Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

**为什么需要 volatile？**

- 禁止 `new Singleton()` 的指令重排序
- 保证 `instance` 的可见性

### 案例：volatile 的使用场景

**适合使用 volatile**：

**1. 状态标志**：

```java
volatile boolean shutdown = false;

// 线程 1
while (!shutdown) {
    // 工作
}

// 线程 2
shutdown = true;
```

**2. 一次性安全发布**：

```java
volatile Resource resource;

// 线程 1
resource = new Resource();

// 线程 2
if (resource != null) {
    resource.use();  // 安全
}
```

**不适合使用 volatile**：

**1. 复合操作**：

```java
volatile int count = 0;
count++;  // 非原子，不安全
```

**2. 不变式约束**：

```java
volatile int lower = 0;
volatile int upper = 10;

// 线程 1
lower = 5;
upper = 15;

// 线程 2
if (lower <= upper) { ... }  // 可能违反
```

---

## 关键点总结

1. **JMM 抽象模型**：工作内存 + 主内存
2. **happens-before**：定义可见性保证，而非时间顺序
3. **内存屏障**：禁止指令重排序
4. **可见性**：volatile、synchronized、final
5. **有序性**：volatile、synchronized 禁止重排序
6. **原子性**：synchronized、Atomic 类、Lock

---

## 深入一点

### JMM 的形式化定义

**happens-before 的数学定义**：

```
hb(x, y) 表示 x happens-before y

传递性：
  hb(x, y) ∧ hb(y, z) ⇒ hb(x, z)

同步顺序：
  so(x, y) ⇒ hb(x, y)

程序顺序：
  po(x, y) ⇒ hb(x, y)
```

### CPU 缓存一致性协议

**MESI 协议**：

- **M (Modified)**：缓存行被修改，与内存不一致
- **E (Exclusive)**：缓存行独占，与内存一致
- **S (Shared)**：缓存行共享，与内存一致
- **I (Invalid)**：缓存行无效

**状态转换**：

```
读取：I → S/E
写入：S/E → M
其他 CPU 写入：M/E/S → I
```

### 内存屏障的 CPU 实现

**x86/x64**：

```asm
LFENCE  ; LoadLoad + LoadStore
SFENCE  ; StoreStore
MFENCE  ; 全屏障（StoreLoad）
```

**ARM**：

```asm
DMB     ; 数据内存屏障
DSB     ; 数据同步屏障
ISB     ; 指令同步屏障
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 12.3 节 Java 内存模型
- 《Java 并发编程实战》- 第16章 Java 内存模型
- JSR 133：Java Memory Model and Thread Specification
- Oracle 官方文档：[Synchronization](https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html)
- 论文：[The Java Memory Model](http://www.cs.umd.edu/~pugh/java/memoryModel/)

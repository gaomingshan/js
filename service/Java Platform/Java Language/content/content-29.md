# volatile 关键字

## 概述

volatile 是 Java 提供的最轻量级的同步机制，用于保证变量的可见性和禁止指令重排序。理解 volatile 的语义和实现原理，是掌握无锁编程、避免并发问题的关键。

本章聚焦：
- **volatile 的两大语义**
- **volatile 的内存屏障实现**
- **volatile 的使用场景与限制**
- **volatile 与 synchronized 的区别**

---

## 1. volatile 的两大语义

### 可见性

**定义**：一个线程修改 volatile 变量，立即对其他线程可见

**示例**：

```java
class Demo {
    volatile boolean flag = false;
    
    // 线程 1
    void writer() {
        flag = true;  // 立即刷新到主内存
    }
    
    // 线程 2
    void reader() {
        while (!flag) {
            // flag 的变化立即可见
        }
        System.out.println("flag 变为 true");
    }
}
```

**无 volatile 的问题**：

```java
boolean flag = false;  // 无 volatile

// 线程 2 可能永远循环
while (!flag) { }
```

**原因**：

- 线程 2 的工作内存缓存了 `flag = false`
- 线程 1 修改 `flag`，未强制刷新到主内存
- 线程 2 读取不到最新值

### 有序性

**定义**：禁止指令重排序

**示例**：

```java
class Demo {
    int a = 0;
    volatile boolean flag = false;
    
    // 线程 1
    void writer() {
        a = 1;          // 1
        flag = true;    // 2（volatile 写）
    }
    
    // 线程 2
    void reader() {
        if (flag) {     // 3（volatile 读）
            int x = a;  // 4（保证读取到 a = 1）
        }
    }
}
```

**volatile 的禁止重排序规则**：

1. 操作 1 不能重排序到操作 2 之后（volatile 写之前的操作不能重排到写之后）
2. 操作 4 不能重排序到操作 3 之前（volatile 读之后的操作不能重排到读之前）
3. 操作 2 不能重排序到操作 3 之后（volatile 写不能重排到 volatile 读之后）

---

## 2. volatile 的内存屏障实现

### volatile 写的内存屏障

**插入位置**：

```
普通操作
StoreStore 屏障
volatile 写
StoreLoad 屏障
```

**作用**：

- **StoreStore 屏障**：保证 volatile 写之前的普通写不会重排到 volatile 写之后
- **StoreLoad 屏障**：保证 volatile 写不会重排到后续的 volatile 读之前

**示例**：

```java
int a = 1;          // 普通写
StoreStore 屏障
flag = true;        // volatile 写
StoreLoad 屏障
```

### volatile 读的内存屏障

**插入位置**：

```
volatile 读
LoadLoad 屏障
LoadStore 屏障
普通操作
```

**作用**：

- **LoadLoad 屏障**：保证 volatile 读不会重排到后续的普通读之前
- **LoadStore 屏障**：保证 volatile 读不会重排到后续的普通写之前

**示例**：

```java
boolean x = flag;   // volatile 读
LoadLoad 屏障
LoadStore 屏障
int y = a;          // 普通读
```

### 字节码层面

**源码**：

```java
volatile int value;

void write() {
    value = 1;
}

int read() {
    return value;
}
```

**字节码**：

```
write():
  iconst_1
  putfield value:I  // 普通 putfield，无特殊指令

read():
  aload_0
  getfield value:I  // 普通 getfield
  ireturn
```

**内存屏障插入时机**：

- 不在字节码层面
- 在 JIT 编译或解释执行时插入

---

## 3. volatile 的使用场景

### 场景 1：状态标志

**适用**：一个线程设置标志，其他线程读取标志

```java
class Server {
    volatile boolean shutdown = false;
    
    void work() {
        while (!shutdown) {
            // 处理请求
        }
    }
    
    void shutdown() {
        shutdown = true;
    }
}
```

### 场景 2：双重检查锁定（DCL）

**适用**：单例模式的延迟初始化

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

**volatile 的作用**：

- 禁止 `new Singleton()` 的指令重排序
- 保证其他线程能看到完全初始化的对象

### 场景 3：独立观察

**适用**：发布不可变对象

```java
class Monitor {
    volatile Resource currentResource;
    
    void update(Resource newResource) {
        currentResource = newResource;  // 安全发布
    }
    
    Resource get() {
        return currentResource;  // 读取最新值
    }
}
```

**前提**：

- Resource 是不可变对象
- 只需要可见性，不需要原子性

### 场景 4：volatile long/double

**适用**：保证 64 位变量的原子性

```java
volatile long timestamp = 0;

// 线程 1
timestamp = System.currentTimeMillis();

// 线程 2
long t = timestamp;  // 读取完整的 64 位值
```

**无 volatile 的问题**：

- 32 位 JVM 分两次写入 long/double
- 可能读取到部分写入的值

---

## 4. volatile 的限制

### 不保证复合操作的原子性

**问题代码**：

```java
volatile int count = 0;

// 多线程执行
count++;  // 非原子操作
```

**分解操作**：

```
temp = count;  // 读
temp = temp + 1;  // 加
count = temp;  // 写
```

**竞态条件**：

```
线程 1 读取 count = 0
线程 2 读取 count = 0
线程 1 写入 count = 1
线程 2 写入 count = 1

结果：count = 1（丢失一次更新）
```

**解决方案**：

```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();
```

### 不适用于依赖当前值的场景

**问题代码**：

```java
volatile int value = 0;

// 线程安全？
if (value < 10) {
    value++;
}
```

**问题**：

- 读取 `value` 和写入 `value` 不是原子操作
- 可能多个线程同时通过检查，导致 `value > 10`

**解决方案**：

```java
synchronized (lock) {
    if (value < 10) {
        value++;
    }
}
```

### 不适用于不变式约束

**问题代码**：

```java
volatile int lower = 0;
volatile int upper = 10;

// 线程 1
void update(int newLower, int newUpper) {
    lower = newLower;
    upper = newUpper;
}

// 线程 2
void check() {
    if (lower <= upper) {  // 可能违反
        // ...
    }
}
```

**问题**：

- 线程 1 写入 `lower` 和 `upper` 不是原子操作
- 线程 2 可能读取到 `lower = 5, upper = 3`（中间状态）

**解决方案**：

```java
class Range {
    volatile Range range;
    
    void update(int newLower, int newUpper) {
        range = new Range(newLower, newUpper);  // 原子发布
    }
}
```

---

## 5. volatile 与 synchronized 的区别

### 功能对比

| 特性         | volatile            | synchronized        |
| ------------ | ------------------- | ------------------- |
| 可见性       | 保证                | 保证                |
| 原子性       | 不保证              | 保证                |
| 有序性       | 保证（禁止重排序）  | 保证                |
| 阻塞         | 不阻塞              | 可能阻塞            |
| 适用范围     | 变量                | 代码块、方法        |
| 性能         | 高                  | 低（锁开销）        |

### 使用选择

**使用 volatile**：

- 变量的写入不依赖当前值
- 变量不需要与其他变量共同参与不变式约束
- 访问变量不需要加锁

**使用 synchronized**：

- 需要原子性
- 需要保护复合操作
- 需要保护多个变量的不变式

---

## 6. volatile 的性能

### 性能开销

**内存屏障的开销**：

- **StoreLoad 屏障**：开销最大（约几十个 CPU 周期）
- **其他屏障**：开销较小（几个 CPU 周期）

**缓存失效的开销**：

- volatile 写会使其他 CPU 的缓存行失效
- 需要从主内存重新读取

### 性能测试

**对比**：

```java
// volatile
volatile int value = 0;
for (int i = 0; i < 100000000; i++) {
    value = i;
}

// 普通变量
int value = 0;
for (int i = 0; i < 100000000; i++) {
    value = i;
}
```

**结果**：

- volatile 写：约 2-3 倍慢
- 但仍比 synchronized 快很多（10-100 倍）

---

## 易错点与边界行为

### 1. volatile 数组

**问题**：

```java
volatile int[] arr = new int[10];

// 线程 1
arr[0] = 1;  // 不保证可见性

// 线程 2
int x = arr[0];  // 可能读取不到最新值
```

**原因**：

- volatile 只保证数组引用的可见性
- 不保证数组元素的可见性

**解决方案**：

```java
AtomicIntegerArray arr = new AtomicIntegerArray(10);
arr.set(0, 1);
```

### 2. volatile 与 final

**问题**：

```java
volatile final int value = 42;  // 编译错误
```

**原因**：

- final 字段不可变，无需 volatile
- volatile 用于可变字段

### 3. volatile 与静态变量

**允许**：

```java
volatile static int value = 0;
```

**用途**：

- 全局状态标志
- 单例模式

### 4. volatile 的传递性

**不传递**：

```java
class Demo {
    volatile Resource resource;
    
    class Resource {
        int value;  // 非 volatile
    }
}

// 线程 1
demo.resource.value = 1;

// 线程 2
int x = demo.resource.value;  // 可能读取不到最新值
```

**原因**：

- volatile 只保证 `resource` 引用的可见性
- 不保证 `resource.value` 的可见性

---

## 实际推导案例

### 案例：单例模式的演化

**1. 饿汉式**：

```java
class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    
    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

**优点**：线程安全

**缺点**：类加载时初始化，无延迟加载

**2. 懒汉式（不安全）**：

```java
class Singleton {
    private static Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();  // 非线程安全
        }
        return instance;
    }
}
```

**问题**：多线程可能创建多个实例

**3. 懒汉式（synchronized）**：

```java
class Singleton {
    private static Singleton instance;
    
    public static synchronized Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

**优点**：线程安全

**缺点**：性能差（每次调用都加锁）

**4. DCL（无 volatile）**：

```java
class Singleton {
    private static Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();  // 指令重排序问题
                }
            }
        }
        return instance;
    }
}
```

**问题**：指令重排序导致返回未初始化的对象

**5. DCL（volatile）**：

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

**优点**：

- 线程安全
- 延迟加载
- 性能好（只有首次创建时加锁）

### 案例：生产者-消费者模式

**使用 volatile**：

```java
class Buffer {
    volatile boolean hasData = false;
    int data;
    
    // 生产者
    void produce(int value) {
        while (hasData) {
            Thread.yield();  // 等待消费
        }
        data = value;
        hasData = true;
    }
    
    // 消费者
    int consume() {
        while (!hasData) {
            Thread.yield();  // 等待生产
        }
        int value = data;
        hasData = false;
        return value;
    }
}
```

**问题**：

- `hasData` 和 `data` 的操作不是原子的
- 可能丢失数据或重复消费

**正确做法**：

```java
class Buffer {
    int data;
    
    synchronized void produce(int value) {
        while (hasData) {
            wait();
        }
        data = value;
        hasData = true;
        notify();
    }
    
    synchronized int consume() {
        while (!hasData) {
            wait();
        }
        int value = data;
        hasData = false;
        notify();
        return value;
    }
}
```

---

## 关键点总结

1. **可见性**：volatile 写立即刷新到主内存，volatile 读从主内存读取
2. **有序性**：禁止指令重排序，通过内存屏障实现
3. **不保证原子性**：复合操作（如 `count++`）不安全
4. **使用场景**：状态标志、DCL、独立观察、64 位变量
5. **性能**：比 synchronized 快，但比普通变量慢 2-3 倍
6. **限制**：不适用于复合操作、依赖当前值、不变式约束

---

## 深入一点

### volatile 的汇编实现

**x86/x64**：

```asm
; volatile 写
mov eax, 1
lock mov [value], eax  ; lock 前缀实现内存屏障
```

**lock 前缀的作用**：

1. 锁定总线或缓存行
2. 写入主内存
3. 使其他 CPU 的缓存失效

**ARM**：

```asm
; volatile 写
mov r0, #1
DMB     ; 数据内存屏障
str r0, [value]
DMB SY  ; 完整内存屏障
```

### JMM 的 volatile 规范

**JSR-133 定义**：

**happens-before 规则**：

- volatile 写 happens-before 后续的 volatile 读

**内存屏障规则**：

- volatile 写前插入 StoreStore
- volatile 写后插入 StoreLoad
- volatile 读后插入 LoadLoad + LoadStore

### volatile 的优化

**编译器优化**：

```java
volatile int flag = 0;

// 不优化
while (flag == 0) { }

// 普通变量可能优化为
if (flag == 0) {
    while (true) { }
}
```

**JIT 优化**：

- volatile 变量不会被寄存器缓存
- 每次读写都访问内存

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 12.3.3 节 volatile 的内存语义
- 《Java 并发编程实战》- 第3.1.4节 volatile 变量
- JSR 133：Java Memory Model and Thread Specification
- Doug Lea：[Using JDK 9 Memory Order Modes](http://gee.cs.oswego.edu/dl/html/j9mm.html)
- Intel：[Intel® 64 and IA-32 Architectures Software Developer's Manual](https://software.intel.com/content/www/us/en/develop/articles/intel-sdm.html)

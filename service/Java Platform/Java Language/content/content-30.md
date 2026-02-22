# synchronized 的实现原理

## 概述

synchronized 是 Java 最基本的同步机制，用于保证代码块的原子性、可见性和有序性。理解 synchronized 的实现原理，包括锁的升级、偏向锁、轻量级锁、重量级锁，是掌握并发编程、性能优化的基础。

本章聚焦：
- **synchronized 的使用方式**
- **Monitor 机制**
- **锁的四种状态与升级**
- **字节码与 JVM 实现**

---

## 1. synchronized 的使用方式

### 修饰实例方法

**源码**：

```java
class Demo {
    synchronized void method() {
        // 临界区
    }
}
```

**等价于**：

```java
void method() {
    synchronized (this) {
        // 临界区
    }
}
```

**锁对象**：当前实例（this）

### 修饰静态方法

**源码**：

```java
class Demo {
    synchronized static void method() {
        // 临界区
    }
}
```

**等价于**：

```java
static void method() {
    synchronized (Demo.class) {
        // 临界区
    }
}
```

**锁对象**：类的 Class 对象

### 修饰代码块

**源码**：

```java
synchronized (obj) {
    // 临界区
}
```

**锁对象**：obj

---

## 2. Monitor 机制

### Monitor 的概念

**Monitor（监视器）**：Java 对象内置的同步机制

**组成**：

- **Entry Set**：等待获取锁的线程集合
- **Owner**：持有锁的线程
- **Wait Set**：调用 wait() 的线程集合

**状态转换**：

```
线程尝试获取锁
    ↓
进入 Entry Set
    ↓
获取锁成功 → Owner
    ↓
执行临界区
    ↓
调用 wait() → Wait Set
    ↓
调用 notify()/notifyAll() → Entry Set
    ↓
释放锁
```

### 字节码实现

**源码**：

```java
synchronized (obj) {
    // 临界区
}
```

**字节码**：

```
monitorenter  // 获取锁
  ... 临界区代码 ...
monitorexit   // 释放锁（正常路径）
monitorexit   // 释放锁（异常路径）

Exception table:
  from  to  target  type
    0   10    13    any
```

**monitorenter**：

1. 如果 monitor 的进入数为 0，线程进入 monitor，进入数设为 1
2. 如果线程已持有 monitor（重入），进入数 +1
3. 如果其他线程持有 monitor，线程阻塞

**monitorexit**：

1. 进入数 -1
2. 如果进入数为 0，线程退出 monitor，释放锁

### Monitor 的数据结构

**ObjectMonitor**（HotSpot 实现）：

```cpp
ObjectMonitor {
    _header       // 对象头备份
    _owner        // 持有锁的线程
    _WaitSet      // wait 线程队列
    _EntryList    // 等待锁的线程队列
    _recursions   // 重入次数
    _count        // 等待线程数
}
```

---

## 3. 锁的四种状态

### 锁状态与升级

**四种状态**：

1. **无锁**（Unlocked）
2. **偏向锁**（Biased Locking）
3. **轻量级锁**（Lightweight Locking）
4. **重量级锁**（Heavyweight Locking）

**升级方向**：

```
无锁 → 偏向锁 → 轻量级锁 → 重量级锁
```

**不可逆**：锁只能升级，不能降级（Java 15+ 支持降级）

### Mark Word 的锁标志

**64 位 JVM**：

| 锁状态   | 25 bit          | 31 bit       | 1 bit 是否偏向 | 2 bit 锁标志 |
| -------- | --------------- | ------------ | -------------- | ------------ |
| 无锁     | unused          | hashCode     | 0              | 01           |
| 偏向锁   | thread ID       | epoch        | 1              | 01           |
| 轻量级锁 | 指向栈中锁记录的指针 |            |                | 00           |
| 重量级锁 | 指向重量级锁的指针   |            |                | 10           |

---

## 4. 偏向锁

### 设计目的

**假设**：大多数情况下，锁被同一个线程多次获取，没有竞争

**优化**：第一次获取锁时，记录线程 ID，后续该线程直接进入

### 工作流程

**1. 首次获取**：

```
对象未被锁定
  ↓
使用 CAS 将线程 ID 写入 Mark Word
  ↓
成功 → 偏向锁获取成功
```

**2. 后续获取**：

```
检查 Mark Word 中的线程 ID
  ↓
是当前线程 → 直接进入（无需 CAS）
  ↓
不是当前线程 → 偏向锁撤销，升级为轻量级锁
```

### 偏向锁撤销

**触发条件**：

1. 其他线程尝试获取偏向锁
2. 调用 hashCode()（偏向锁无法存储 hashCode）

**撤销流程**：

```
暂停持有偏向锁的线程
  ↓
检查线程是否还在执行同步代码
  ↓
是 → 升级为轻量级锁
  ↓
否 → 恢复为无锁状态
```

### 禁用偏向锁

**JVM 参数**：

```bash
-XX:-UseBiasedLocking  # 禁用偏向锁
```

**适用场景**：

- 锁竞争激烈
- 偏向锁撤销开销大

---

## 5. 轻量级锁

### 设计目的

**假设**：线程交替执行同步块，不存在锁竞争

**优化**：使用 CAS 操作代替互斥量（Mutex）

### 工作流程

**1. 加锁**：

```
在栈帧中创建锁记录（Lock Record）
  ↓
复制对象的 Mark Word 到锁记录
  ↓
使用 CAS 将对象的 Mark Word 替换为指向锁记录的指针
  ↓
成功 → 轻量级锁获取成功
  ↓
失败 → 自旋重试或升级为重量级锁
```

**2. 解锁**：

```
使用 CAS 将锁记录中的 Mark Word 复制回对象
  ↓
成功 → 轻量级锁释放成功
  ↓
失败 → 升级为重量级锁，唤醒等待线程
```

### 自旋优化

**自适应自旋**：

- 默认自旋 10 次（可通过 `-XX:PreBlockSpin` 调整）
- 如果自旋成功，下次增加自旋次数
- 如果自旋失败，下次减少自旋次数

**自旋锁的开销**：

- CPU 空转，消耗资源
- 适用于临界区执行时间短的场景

---

## 6. 重量级锁

### 实现机制

**Monitor 对象**：

- 基于操作系统的互斥量（Mutex）
- 需要用户态和内核态切换

**工作流程**：

```
线程尝试获取锁
  ↓
获取失败 → 进入 EntryList，阻塞
  ↓
持有锁的线程释放锁
  ↓
唤醒 EntryList 中的线程
  ↓
被唤醒的线程竞争锁
```

### 性能开销

**用户态与内核态切换**：

- 约 1000 个 CPU 周期
- 比轻量级锁慢 10-100 倍

**适用场景**：

- 锁竞争激烈
- 临界区执行时间长

---

## 7. 锁优化技术

### 锁消除

**定义**：JIT 编译器检测到不可能存在共享数据竞争，消除锁

**示例**：

```java
void method() {
    StringBuffer sb = new StringBuffer();  // 局部变量
    sb.append("a");
    sb.append("b");
}
```

**优化**：

- `sb` 不会逃逸出方法
- StringBuffer 的 synchronized 方法可以消除

**启用**：

```bash
-XX:+DoEscapeAnalysis  # 逃逸分析
-XX:+EliminateLocks    # 锁消除
```

### 锁粗化

**定义**：将多次连续的加锁/解锁合并为一次

**示例**：

```java
for (int i = 0; i < 1000; i++) {
    synchronized (obj) {
        // 操作
    }
}
```

**优化**：

```java
synchronized (obj) {
    for (int i = 0; i < 1000; i++) {
        // 操作
    }
}
```

**效果**：减少锁操作次数

### 锁降级

**Java 15+**：

支持从重量级锁降级为轻量级锁

**条件**：

- 无竞争时，降级为轻量级锁
- 节省资源

---

## 易错点与边界行为

### 1. synchronized 锁的是对象

**问题代码**：

```java
Integer count = 0;
synchronized (count) {
    count++;  // count 变为新对象，锁失效
}
```

**原因**：

- `count++` 创建新的 Integer 对象
- 锁住的是旧对象，新对象无锁

**解决方案**：

```java
Object lock = new Object();
synchronized (lock) {
    count++;
}
```

### 2. synchronized 方法的继承

**问题**：

```java
class Parent {
    synchronized void method() { }
}

class Child extends Parent {
    @Override
    void method() { }  // 不是 synchronized
}
```

**原因**：

- synchronized 不是方法签名的一部分
- 不会被继承

### 3. synchronized 与异常

**正常释放锁**：

```java
synchronized (obj) {
    throw new RuntimeException();
}  // 异常抛出时，自动释放锁
```

**字节码保证**：

```
monitorenter
  ... 代码 ...
  athrow
monitorexit  // 异常表保证执行
```

### 4. wait() 必须在 synchronized 中

**错误代码**：

```java
obj.wait();  // IllegalMonitorStateException
```

**正确代码**：

```java
synchronized (obj) {
    obj.wait();
}
```

**原因**：

- wait() 需要释放锁
- 必须先持有锁

---

## 实际推导案例

### 案例：synchronized 的性能演化

**无锁**：

```java
int count = 0;
for (int i = 0; i < 1000000; i++) {
    count++;
}
```

**时间**：约 1 ms

**偏向锁**：

```java
Object lock = new Object();
int count = 0;
for (int i = 0; i < 1000000; i++) {
    synchronized (lock) {
        count++;
    }
}
```

**时间**：约 3 ms（首次 CAS，后续无开销）

**轻量级锁**：

```java
// 两个线程交替执行
synchronized (lock) {
    count++;
}
```

**时间**：约 50 ms（CAS 开销）

**重量级锁**：

```java
// 多个线程竞争
synchronized (lock) {
    count++;
}
```

**时间**：约 500 ms（用户态/内核态切换）

### 案例：单例模式的锁优化

**synchronized 方法**：

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

**问题**：每次调用都加锁，性能差

**DCL**：

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

**优化**：只有首次创建时加锁

---

## 关键点总结

1. **Monitor 机制**：monitorenter / monitorexit 实现加锁/解锁
2. **四种锁状态**：无锁 → 偏向锁 → 轻量级锁 → 重量级锁
3. **偏向锁**：记录线程 ID，后续直接进入
4. **轻量级锁**：使用 CAS 操作，自旋重试
5. **重量级锁**：基于 Mutex，阻塞线程
6. **锁优化**：锁消除、锁粗化、自适应自旋

---

## 深入一点

### synchronized 的字节码

**方法级 synchronized**：

```
public synchronized void method();
  descriptor: ()V
  flags: ACC_PUBLIC, ACC_SYNCHRONIZED
  Code:
    ...
```

**使用 ACC_SYNCHRONIZED 标志**

**代码块 synchronized**：

```
synchronized (obj) { }

字节码：
aload_1
dup
astore_2
monitorenter
  ... 临界区 ...
aload_2
monitorexit
  goto 结束
aload_2
monitorexit  // 异常路径
athrow
```

### Monitor 的 C++ 实现

**HotSpot 源码**（简化）：

```cpp
void ObjectMonitor::enter(Thread* Self) {
    // 快速路径：无竞争
    void* cur = Atomic::cmpxchg(&_owner, (void*)NULL, Self);
    if (cur == NULL) {
        return;  // 获取成功
    }
    
    // 慢速路径：有竞争
    if (cur == Self) {
        _recursions++;  // 重入
        return;
    }
    
    // 自旋
    if (TrySpin(Self) > 0) {
        return;
    }
    
    // 进入等待队列
    EnterI(Self);
}
```

### 锁升级的性能影响

**测试代码**：

```java
Object lock = new Object();
long start = System.nanoTime();
for (int i = 0; i < 10000000; i++) {
    synchronized (lock) {
        // 空临界区
    }
}
long time = System.nanoTime() - start;
```

**结果**（单线程）：

- 偏向锁：约 100 ms
- 轻量级锁：约 500 ms
- 重量级锁：约 5000 ms

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 13.3 节锁优化
- 《Java 并发编程实战》- 第13章显式锁
- Oracle 官方文档：[Synchronization](https://docs.oracle.com/javase/specs/jls/se8/html/jls-17.html#jls-17.1)
- HotSpot 源码：`hotspot/share/runtime/objectMonitor.cpp`
- 论文：[Thin Locks: Featherweight Synchronization for Java](https://dl.acm.org/doi/10.1145/277650.277734)

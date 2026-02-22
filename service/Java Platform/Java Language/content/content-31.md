# final 字段的内存语义

## 概述

final 关键字不仅保证字段不可变，还提供特殊的内存语义。理解 final 字段的内存可见性保证、重排序限制，是掌握不可变对象、安全发布的基础。

本章聚焦：
- **final 字段的内存语义**
- **final 字段的重排序规则**
- **final 字段与安全发布**
- **final 字段的性能优化**

---

## 1. final 字段的内存语义

### 写 final 字段的重排序规则

**规则 1**：禁止将 final 字段的写重排序到构造方法之外

**示例**：

```java
class Demo {
    final int value;
    
    Demo() {
        value = 42;  // final 字段的写
    }
}

Demo obj = new Demo();
```

**禁止的重排序**：

```
// 错误的重排序
obj = new Demo();  // 对象引用赋值
obj.value = 42;    // final 字段写（重排到构造方法外）
```

**保证**：

- final 字段的写一定在构造方法完成前执行
- 其他线程看到对象引用时，final 字段已正确初始化

### 读 final 字段的重排序规则

**规则 2**：禁止初次读对象引用与读该对象的 final 字段重排序

**示例**：

```java
// 线程 1
Demo obj = new Demo();

// 线程 2
Demo temp = obj;   // 读对象引用
int x = temp.value;  // 读 final 字段
```

**禁止的重排序**：

```
// 错误的重排序
int x = temp.value;  // 读 final 字段
Demo temp = obj;     // 读对象引用
```

**保证**：

- 读取对象引用后，读取 final 字段一定能看到正确的值

---

## 2. final 字段的内存屏障

### 写 final 字段的内存屏障

**插入位置**：

```
构造方法内：
  final 字段赋值
  StoreStore 屏障
  return（构造方法结束）
```

**作用**：

- 保证 final 字段的写在构造方法返回前完成
- 防止对象引用在 final 字段初始化前逃逸

### 读 final 字段的内存屏障

**插入位置**：

```
读对象引用
LoadLoad 屏障
读 final 字段
```

**作用**：

- 保证读取对象引用后，读取 final 字段能看到正确的值

---

## 3. final 引用字段的特殊语义

### final 引用的可变对象

**问题代码**：

```java
class Demo {
    final int[] arr;
    
    Demo() {
        arr = new int[10];
        arr[0] = 1;  // 数组元素赋值
    }
}
```

**保证**：

- `arr` 引用的可见性
- `arr[0] = 1` 的可见性（扩展保证）

**JMM 的扩展保证**：

- 构造方法内对 final 引用对象的写入，对其他线程可见

### 示例

**源码**：

```java
class ImmutableList {
    final int[] data;
    
    ImmutableList(int[] arr) {
        data = new int[arr.length];
        for (int i = 0; i < arr.length; i++) {
            data[i] = arr[i];  // 数组元素写入
        }
    }
}

// 线程 1
ImmutableList list = new ImmutableList(new int[]{1, 2, 3});

// 线程 2
int x = list.data[0];  // 保证读取到 1
```

**保证**：

- 构造方法中对 `data` 数组元素的写入，对线程 2 可见

---

## 4. final 字段与安全发布

### 不安全发布的问题

**问题代码**：

```java
class Holder {
    int value;
    
    Holder(int value) {
        this.value = value;
    }
}

// 线程 1
holder = new Holder(42);

// 线程 2
if (holder != null) {
    int x = holder.value;  // 可能读取到 0
}
```

**原因**：

- 对象引用的赋值可能重排序到字段初始化之前
- 线程 2 可能看到未初始化的 `value`

### 安全发布：使用 final

**修复代码**：

```java
class Holder {
    final int value;
    
    Holder(int value) {
        this.value = value;
    }
}

// 线程 1
holder = new Holder(42);

// 线程 2
if (holder != null) {
    int x = holder.value;  // 保证读取到 42
}
```

**保证**：

- final 字段的内存语义保证安全发布
- 线程 2 看到对象引用时，final 字段已正确初始化

---

## 5. final 字段的逃逸问题

### 对象逃逸的危险

**问题代码**：

```java
class Demo {
    final int value;
    static Demo instance;
    
    Demo() {
        value = 42;
        instance = this;  // 对象逃逸
    }
}

// 其他线程
if (Demo.instance != null) {
    int x = Demo.instance.value;  // 可能读取到 0
}
```

**原因**：

- 对象在构造方法完成前逃逸
- final 字段的内存屏障在构造方法返回时插入
- 其他线程可能在屏障前读取对象

**修复**：

```java
class Demo {
    final int value;
    static Demo instance;
    
    Demo() {
        value = 42;
    }
    
    static void publish(Demo obj) {
        instance = obj;  // 构造方法完成后发布
    }
}
```

### this 引用逃逸的其他场景

**1. 内部类**：

```java
class Outer {
    final int value;
    
    Outer() {
        value = 42;
        new Thread(new Inner()).start();  // 内部类持有 this
    }
    
    class Inner implements Runnable {
        public void run() {
            int x = Outer.this.value;  // 可能读取到 0
        }
    }
}
```

**2. 注册监听器**：

```java
class Component {
    final int state;
    
    Component() {
        state = 1;
        EventBus.register(this);  // 注册 this
    }
}
```

---

## 6. final 字段的性能优化

### JIT 优化

**常量折叠**：

```java
class Demo {
    final int MAX = 100;
    
    void method() {
        if (value < MAX) {  // MAX 被内联为 100
            // ...
        }
    }
}
```

**编译后**：

```java
void method() {
    if (value < 100) {  // 常量折叠
        // ...
    }
}
```

### 消除冗余读取

**源码**：

```java
class Demo {
    final String name;
    
    void method() {
        System.out.println(name);
        System.out.println(name);
    }
}
```

**优化**：

- 第一次读取 `name`，缓存在寄存器
- 第二次直接使用缓存值，不再读取内存

### 无需内存屏障（某些情况）

**final 的读取**：

- 不需要 volatile 的内存屏障
- 构造方法完成后，final 字段保证可见

---

## 易错点与边界行为

### 1. final 数组元素的可变性

**问题**：

```java
class Demo {
    final int[] arr = new int[10];
    
    void method() {
        arr[0] = 1;  // 允许修改数组元素
    }
}
```

**原因**：

- final 保证 `arr` 引用不可变
- 不保证数组元素不可变

**解决方案**：

```java
class Demo {
    private final int[] arr = new int[10];
    
    public int get(int index) {
        return arr[index];
    }
    
    // 不提供修改方法
}
```

### 2. final 与反射

**问题**：

```java
class Demo {
    final int value = 42;
}

Field field = Demo.class.getDeclaredField("value");
field.setAccessible(true);
field.set(obj, 100);  // 修改 final 字段
```

**结果**：

- 修改可能成功
- 但行为未定义，不推荐

### 3. final 与序列化

**问题**：

```java
class Demo implements Serializable {
    final int value;
    
    Demo() {
        value = 42;
    }
}
```

**反序列化**：

- 不调用构造方法
- final 字段可能未初始化

**解决方案**：

```java
private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
    in.defaultReadObject();
    // 手动初始化 final 字段（使用反射）
}
```

### 4. final 局部变量

**用途**：

```java
final int x = 10;

Runnable r = new Runnable() {
    public void run() {
        System.out.println(x);  // 捕获 final 变量
    }
};
```

**内存语义**：

- final 局部变量无特殊内存语义
- 只是编译期限制（不可重新赋值）

---

## 实际推导案例

### 案例：不可变对象的设计

**不可变对象**：

```java
final class ImmutablePoint {
    private final int x;
    private final int y;
    
    public ImmutablePoint(int x, int y) {
        this.x = x;
        this.y = y;
    }
    
    public int getX() {
        return x;
    }
    
    public int getY() {
        return y;
    }
}
```

**优势**：

1. **线程安全**：无需同步
2. **安全发布**：final 保证可见性
3. **性能**：JIT 可优化

### 案例：String 的不可变性

**String 的设计**：

```java
public final class String {
    private final char[] value;  // Java 8
    private final byte[] value;  // Java 9+
    private final byte coder;
    private int hash;
    
    public String(String original) {
        this.value = original.value;
        this.hash = original.hash;
    }
}
```

**优势**：

1. **安全发布**：final 保证线程安全
2. **字符串常量池**：不可变可以共享
3. **hashCode 缓存**：计算一次，永久有效

### 案例：单例模式的安全发布

**饿汉式**：

```java
class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    private final int state;
    
    private Singleton() {
        state = initialize();
    }
    
    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

**保证**：

- `INSTANCE` 是 final 静态字段
- 类加载时初始化
- final 保证其他线程看到正确初始化的 `state`

---

## 关键点总结

1. **写 final 字段**：禁止重排序到构造方法之外
2. **读 final 字段**：禁止与初次读对象引用重排序
3. **内存屏障**：构造方法返回前插入 StoreStore 屏障
4. **安全发布**：final 保证对象正确初始化后可见
5. **对象逃逸**：构造方法中不应让 this 逃逸
6. **性能优化**：常量折叠、消除冗余读取

---

## 深入一点

### final 字段的字节码

**源码**：

```java
class Demo {
    final int value = 42;
}
```

**字节码**：

```
<init>():
  aload_0
  invokespecial Object.<init>
  aload_0
  bipush 42
  putfield value:I  // 写 final 字段
  return
```

**内存屏障插入**（JIT 或解释器）：

```
putfield value:I
StoreStore 屏障
return
```

### final 字段的 happens-before

**JMM 规则**：

- 对象的构造方法完成 happens-before finalize() 方法
- final 字段的写 happens-before 构造方法完成

**推论**：

- final 字段的写 happens-before finalize()
- final 字段的写 happens-before 其他线程读取对象引用

### final 字段的 C++ 实现

**HotSpot 源码**（简化）：

```cpp
// 构造方法返回前
void insert_mem_bar(Assembler* masm) {
    if (support_IRIW_for_not_multiple_copy_atomic_cpu) {
        // 插入 StoreStore 屏障
        masm->membar(Assembler::StoreStore);
    }
}
```

**IRIW**（Independent Reads of Independent Writes）：

- 某些 CPU 架构需要显式屏障
- x86/x64 不需要（强内存模型）
- ARM 需要

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 12.3.5 节 final 域的内存语义
- 《Java 并发编程实战》- 第3.5.2节安全发布
- JSR 133：Java Memory Model and Thread Specification
- Doug Lea：[The JSR-133 Cookbook for Compiler Writers](http://gee.cs.oswego.edu/dl/jmm/cookbook.html)
- 论文：[Fixing the Java Memory Model](https://www.cs.umd.edu/~pugh/java/memoryModel/jsr-133-faq.html)

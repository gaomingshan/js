# 逃逸分析

## 概述

逃逸分析（Escape Analysis）是 JIT 编译器的高级优化技术，分析对象的作用域，判断对象是否逃逸出方法或线程。基于逃逸分析，JVM 可以进行标量替换、栈上分配、同步消除等优化。

本章聚焦：
- **逃逸分析的原理**
- **三种逃逸状态**
- **基于逃逸分析的优化**
- **逃逸分析的限制**

---

## 1. 逃逸分析的原理

### 定义

**逃逸分析**：分析对象的动态作用域，判断对象是否会被外部访问

### 逃逸类型

**1. 方法逃逸**：

对象逃逸出方法作用域

```java
Object method() {
    Object obj = new Object();
    return obj;  // 逃逸到调用者
}
```

**2. 线程逃逸**：

对象被其他线程访问

```java
class Demo {
    static Object obj;
    
    void method() {
        obj = new Object();  // 逃逸到其他线程
    }
}
```

**3. 未逃逸**：

对象仅在方法内使用

```java
void method() {
    Object obj = new Object();
    // obj 仅在方法内使用，未逃逸
}
```

---

## 2. 三种逃逸状态

### NoEscape（未逃逸）

**定义**：对象仅在方法内或线程内使用

**示例**：

```java
void method() {
    Point p = new Point(1, 2);
    int x = p.getX();
    int y = p.getY();
    System.out.println(x + y);
}
```

**优化机会**：

- 标量替换
- 栈上分配
- 同步消除

### ArgEscape（参数逃逸）

**定义**：对象作为参数传递，但不逃逸出调用者

**示例**：

```java
void caller() {
    Point p = new Point(1, 2);
    callee(p);  // p 传递给 callee，但不逃逸
}

void callee(Point p) {
    int x = p.getX();
    // p 仅在 callee 内使用
}
```

**优化机会**：

- 部分优化（取决于调用链）

### GlobalEscape（全局逃逸）

**定义**：对象逃逸出方法或线程

**示例**：

```java
Point p;

void method() {
    p = new Point(1, 2);  // 全局逃逸
}
```

**优化机会**：

- 无法优化

---

## 3. 标量替换

### 定义

**标量替换**：将对象分解为基本类型变量（标量）

### 原理

**聚合类型 → 标量**：

```java
class Point {
    int x;
    int y;
}

void method() {
    Point p = new Point(1, 2);
    int sum = p.x + p.y;
}
```

**标量替换后**：

```java
void method() {
    int x = 1;
    int y = 2;
    int sum = x + y;
}
```

**优化**：

- 无需分配 Point 对象
- 无需 GC 回收
- 变量直接使用寄存器

### 启用标量替换

**JVM 参数**：

```bash
-XX:+EliminateAllocations  # 启用标量替换（默认开启）
```

**查看日志**：

```bash
-XX:+PrintEliminateAllocations
```

---

## 4. 栈上分配

### 定义

**栈上分配**：将未逃逸的对象分配在栈上而非堆上

### 优势

**1. 无需 GC**：

- 方法返回时自动释放
- 减轻 GC 压力

**2. 性能提升**：

- 栈分配比堆分配快（指针碰撞）
- 无需同步（线程私有）

### 实现

**HotSpot JVM**：

- 不直接支持栈上分配
- 通过**标量替换**实现类似效果

**示例**：

```java
void method() {
    Point p = new Point(1, 2);  // 未逃逸
    int sum = p.x + p.y;
}
```

**标量替换后**：

```java
void method() {
    int x = 1;  // 栈上分配（局部变量）
    int y = 2;
    int sum = x + y;
}
```

---

## 5. 同步消除（锁消除）

### 定义

**同步消除**：消除未逃逸对象的同步操作

### 示例

**源码**：

```java
void method() {
    StringBuffer sb = new StringBuffer();  // 未逃逸
    sb.append("a");
    sb.append("b");
}
```

**StringBuffer.append() 是 synchronized 方法**：

```java
public synchronized StringBuffer append(String str) {
    // ...
}
```

**优化**：

- JIT 检测到 `sb` 未逃逸
- 消除 synchronized 锁
- 直接执行方法体

**等价代码**：

```java
void method() {
    // 无需 synchronized
    sb.value[sb.count++] = 'a';
    sb.value[sb.count++] = 'b';
}
```

### 启用同步消除

**JVM 参数**：

```bash
-XX:+DoEscapeAnalysis      # 启用逃逸分析（默认开启）
-XX:+EliminateLocks        # 启用锁消除（默认开启）
```

---

## 6. 逃逸分析的限制

### 方法内联依赖

**问题**：

逃逸分析需要方法内联

**示例**：

```java
void method() {
    Point p = new Point(1, 2);
    callee(p);
}

void callee(Point p) {
    int x = p.getX();
}
```

**逃逸分析**：

- 如果 `callee()` 未内联，`p` 被判定为逃逸
- 如果 `callee()` 内联，`p` 未逃逸

**影响**：

- 内联失败 → 逃逸分析失败

### 复杂对象图

**问题**：

对象之间的引用关系复杂

**示例**：

```java
class Node {
    Node next;
}

void method() {
    Node n1 = new Node();
    Node n2 = new Node();
    n1.next = n2;  // 对象引用
}
```

**逃逸分析**：

- 复杂对象图难以分析
- 可能保守判定为逃逸

### 数组元素

**问题**：

数组元素的逃逸分析复杂

**示例**：

```java
void method() {
    Point[] arr = new Point[10];
    arr[0] = new Point(1, 2);  // Point 对象可能逃逸
}
```

**逃逸分析**：

- 数组逃逸，数组元素也逃逸
- 保守判定

---

## 易错点与边界行为

### 1. 部分逃逸

**问题**：

对象在某些路径逃逸，某些路径不逃逸

**示例**：

```java
Point method(boolean flag) {
    Point p = new Point(1, 2);
    if (flag) {
        return p;  // 逃逸
    }
    int sum = p.x + p.y;
    return null;  // 不逃逸
}
```

**逃逸分析**：

- 保守判定为逃逸

### 2. 反射调用

**问题**：

反射调用的对象判定为逃逸

**示例**：

```java
void method() {
    Point p = new Point(1, 2);
    Method m = Point.class.getMethod("getX");
    m.invoke(p);  // 反射调用，p 逃逸
}
```

### 3. JNI 调用

**问题**：

传递给 native 方法的对象判定为逃逸

**示例**：

```java
native void nativeMethod(Point p);

void method() {
    Point p = new Point(1, 2);
    nativeMethod(p);  // p 逃逸
}
```

### 4. 异常传播

**问题**：

异常对象总是逃逸

**示例**：

```java
void method() {
    throw new RuntimeException("error");  // 异常对象逃逸
}
```

---

## 实际推导案例

### 案例：String 拼接的优化

**源码**：

```java
String s = "a" + "b" + "c";
```

**编译为**：

```java
String s = new StringBuilder()
    .append("a")
    .append("b")
    .append("c")
    .toString();
```

**逃逸分析**：

- `StringBuilder` 未逃逸
- 标量替换：分解为局部变量
- 同步消除：消除 `append()` 的 synchronized

**优化后**：

```java
char[] value = new char[3];
value[0] = 'a';
value[1] = 'b';
value[2] = 'c';
String s = new String(value);
```

### 案例：Integer 缓存的优化

**源码**：

```java
void method() {
    Integer a = 127;
    Integer b = 127;
    int sum = a + b;
}
```

**逃逸分析**：

- `a` 和 `b` 未逃逸
- 自动拆箱：`a.intValue() + b.intValue()`
- 标量替换：替换为 int

**优化后**：

```java
void method() {
    int a = 127;
    int b = 127;
    int sum = a + b;
}
```

### 案例：为什么局部变量比成员变量快？

**成员变量**：

```java
class Demo {
    Point p = new Point(1, 2);
    
    void method() {
        int sum = p.x + p.y;
    }
}
```

**逃逸分析**：

- `p` 是成员变量，逃逸
- 无法优化

**局部变量**：

```java
void method() {
    Point p = new Point(1, 2);
    int sum = p.x + p.y;
}
```

**逃逸分析**：

- `p` 未逃逸
- 标量替换：分解为 int x, int y
- 性能提升约 10-100 倍

---

## 关键点总结

1. **逃逸分析**：判断对象是否逃逸出方法或线程
2. **三种状态**：未逃逸、参数逃逸、全局逃逸
3. **标量替换**：将对象分解为基本类型变量
4. **栈上分配**：通过标量替换实现类似效果
5. **同步消除**：消除未逃逸对象的锁
6. **限制**：依赖方法内联、复杂对象图难分析

---

## 深入一点

### 逃逸分析的算法

**控制流图（CFG）分析**：

1. 构建方法的 CFG
2. 分析对象的所有引用
3. 判断对象是否逃逸出方法

**示例**：

```java
void method() {
    Object obj = new Object();  // 创建
    if (condition) {
        return obj;  // 逃逸
    }
    System.out.println(obj);  // 使用
}
```

**分析**：

- 存在逃逸路径（return obj）
- 判定为全局逃逸

### 部分逃逸分析

**定义**：分析对象在特定路径是否逃逸

**优化**：

- 在不逃逸的路径使用标量替换
- 在逃逸的路径正常分配对象

**示例**：

```java
Point method(boolean flag) {
    Point p = new Point(1, 2);
    if (!flag) {
        // 不逃逸路径：标量替换
        int sum = p.x + p.y;
        return null;
    }
    // 逃逸路径：正常分配
    return p;
}
```

### 查看逃逸分析日志

**启用日志**：

```bash
-XX:+PrintEscapeAnalysis
```

**输出**：

```
NoEscape Point
  allocated at Demo::method @ bci:5
  
GlobalEscape Point
  allocated at Demo::method @ bci:10
  escapes as return value
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 11.3.4 节逃逸分析
- 《Java 性能权威指南》- 4.3 节逃逸分析
- Oracle 官方文档：[Escape Analysis in the HotSpot JIT Compiler](https://blogs.oracle.com/javamagazine/escape-analysis)
- OpenJDK Wiki：[Escape Analysis](https://wiki.openjdk.java.net/display/HotSpot/EscapeAnalysis)
- 论文：[Escape Analysis for Java](https://dl.acm.org/doi/10.1145/320384.320386)

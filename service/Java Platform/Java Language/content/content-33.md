# 方法内联优化

## 概述

方法内联是 JIT 编译器最重要的优化技术之一，将方法调用替换为方法体代码，消除调用开销并支持进一步优化。理解内联的条件、限制和策略，是编写高性能 Java 代码的关键。

本章聚焦：
- **内联的原理与收益**
- **内联的条件与限制**
- **内联策略与启发式**
- **查看内联日志**
- **内联对性能的影响**

---

## 1. 方法内联的原理

### 定义

**方法内联**：将方法调用替换为被调用方法的代码体

**示例**：

**源码**：

```java
int add(int a, int b) {
    return a + b;
}

int result = add(1, 2);
```

**内联前**：

```
调用 add(1, 2)
  ↓
压栈
  ↓
执行 add
  ↓
返回
  ↓
出栈
```

**内联后**：

```java
int result = 1 + 2;
```

**进一步优化（常量折叠）**：

```java
int result = 3;
```

### 收益

**1. 消除方法调用开销**：

- 无需创建栈帧
- 无需参数传递
- 无需返回值处理

**2. 支持进一步优化**：

- 常量折叠
- 死代码消除
- 公共子表达式消除

**3. 指令缓存友好**：

- 减少跳转指令
- 提高 CPU 流水线效率

---

## 2. 内联的条件

### 方法大小限制

**默认阈值**：

```bash
-XX:MaxInlineSize=35  # 方法字节码 ≤ 35 字节可内联
-XX:MaxFreqInlineSize=325  # 热点方法可内联的最大字节码
```

**示例**：

```java
// 10 字节，可内联
int add(int a, int b) {
    return a + b;
}

// 50 字节，超过阈值，不内联
void complexMethod() {
    // 复杂逻辑
    for (int i = 0; i < 100; i++) {
        // ...
    }
}
```

### 调用频率

**热点方法优先内联**：

- 调用次数多的方法
- 循环中的方法

**冷方法不内联**：

- 减少代码膨胀

### 方法类型

**可内联**：

- 静态方法
- 私有方法
- final 方法
- final 类的方法

**可能内联**：

- 虚方法（单态或双态调用）

**不内联**：

- 接口方法（多态）
- 多态调用（> 2 种类型）

---

## 3. 虚方法的内联

### 单态调用（Monomorphic）

**场景**：调用点只有一种类型

```java
class Dog {
    void bark() { System.out.println("Woof"); }
}

Dog dog = new Dog();
for (int i = 0; i < 10000; i++) {
    dog.bark();  // 总是 Dog.bark()
}
```

**优化**：

- JIT 假设总是调用 `Dog.bark()`
- 内联 `Dog.bark()`

**守护条件**：

```java
if (dog.getClass() == Dog.class) {
    // 内联的 Dog.bark() 代码
    System.out.println("Woof");
} else {
    // 去优化
    dog.bark();
}
```

### 双态调用（Bimorphic）

**场景**：调用点有两种类型

```java
Animal[] animals = {new Dog(), new Cat()};
for (Animal animal : animals) {
    animal.sound();  // Dog.sound() 或 Cat.sound()
}
```

**优化**：

```java
if (animal.getClass() == Dog.class) {
    // 内联 Dog.sound()
    System.out.println("Woof");
} else if (animal.getClass() == Cat.class) {
    // 内联 Cat.sound()
    System.out.println("Meow");
} else {
    // 虚方法调用
    animal.sound();
}
```

### 多态调用（Megamorphic）

**场景**：调用点有多种类型（> 2）

```java
Animal[] animals = {new Dog(), new Cat(), new Bird(), new Fish()};
for (Animal animal : animals) {
    animal.sound();
}
```

**优化**：

- 无法内联
- 使用虚方法表（vtable）调用

---

## 4. 内联深度与递归

### 内联深度限制

**默认深度**：

```bash
-XX:MaxInlineLevel=9  # 最大内联深度
```

**示例**：

```java
void method1() {
    method2();  // 深度 1
}

void method2() {
    method3();  // 深度 2
}

void method3() {
    method4();  // 深度 3
}
```

**超过深度**：停止内联

### 递归方法的内联

**直接递归**：

```java
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);  // 递归调用
}
```

**优化**：

- 可能内联一层或两层
- 展开递归为循环（循环展开）

**尾递归**：

```java
int factorial(int n, int acc) {
    if (n <= 1) return acc;
    return factorial(n - 1, n * acc);  // 尾递归
}
```

**优化**：

- 理论上可转为循环
- HotSpot JVM 不支持尾递归优化

---

## 5. 查看内联日志

### 启用内联日志

**命令**：

```bash
-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining
```

**输出示例**：

```
@ 10   Demo::add (4 bytes)   inline (hot)
@ 15   Demo::method (50 bytes)   too big
@ 20   java.lang.String::hashCode (55 bytes)   inline (hot)
@ 25   Demo::virtualMethod (10 bytes)   inline (megamorphic call site)
```

**字段含义**：

- `@ 10`：调用点的字节码偏移量
- `Demo::add`：被调用的方法
- `(4 bytes)`：方法的字节码大小
- `inline (hot)`：内联成功（热点方法）
- `too big`：方法太大，未内联
- `megamorphic call site`：多态调用点，未内联

### 过滤内联日志

**只显示特定类**：

```bash
-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining -XX:CompileCommand=print,Demo::*
```

**输出到文件**：

```bash
-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining -XX:+LogCompilation -XX:LogFile=inline.log
```

---

## 6. 内联的限制与陷阱

### 代码膨胀

**问题**：

过度内联导致代码膨胀

**示例**：

```java
void method() {
    for (int i = 0; i < 1000; i++) {
        largeMethod();  // 内联后代码膨胀
    }
}

void largeMethod() {
    // 100 行代码
}
```

**影响**：

- 指令缓存（I-Cache）miss
- 性能下降

**解决方案**：

```bash
-XX:InlineSmallCode=1000  # 限制内联后的代码大小
```

### 去优化的代价

**问题**：

内联后的假设失效，触发去优化

**示例**：

```java
void method(Animal animal) {
    animal.sound();  // 假设总是 Dog.sound()
}

// 首次调用
method(new Dog());  // 内联 Dog.sound()

// 后续调用
method(new Cat());  // 触发去优化
```

**代价**：

- 回退到解释执行
- 重新收集信息
- 重新编译

### finally 块的代码复制

**问题**：

```java
void method() {
    try {
        work();
    } finally {
        cleanup();  // 内联后复制到多个路径
    }
}
```

**代码膨胀**：

- finally 块被内联到正常路径和异常路径
- 代码重复

---

## 易错点与边界行为

### 1. 接口方法的内联

**问题**：

```java
interface Service {
    void process();
}

class ServiceImpl implements Service {
    public void process() { }
}

Service service = new ServiceImpl();
for (int i = 0; i < 10000; i++) {
    service.process();  // 接口方法调用
}
```

**结果**：

- 单态调用可以内联
- 多态调用无法内联

### 2. lambda 表达式的内联

**问题**：

```java
list.forEach(item -> System.out.println(item));
```

**优化**：

- lambda 编译为 invokedynamic
- JIT 可能内联 lambda 方法体

### 3. 反射调用无法内联

**问题**：

```java
Method method = Demo.class.getMethod("method");
method.invoke(obj);  // 无法内联
```

**原因**：

- 反射调用是动态的
- JIT 无法确定调用目标

### 4. JNI 调用无法内联

**问题**：

```java
native void nativeMethod();

nativeMethod();  // 无法内联
```

**原因**：

- native 方法没有字节码
- 无法内联

---

## 实际推导案例

### 案例：getter/setter 的内联

**源码**：

```java
class Point {
    private int x;
    private int y;
    
    int getX() { return x; }
    void setX(int x) { this.x = x; }
}

Point p = new Point();
int x = p.getX();
```

**内联前**：

```
调用 p.getX()
  ↓
返回 p.x
```

**内联后**：

```java
int x = p.x;
```

**收益**：

- 消除方法调用
- 性能提升约 10-50 倍

### 案例：链式调用的内联

**源码**：

```java
StringBuilder sb = new StringBuilder();
sb.append("a").append("b").append("c");
```

**内联后**：

```java
StringBuilder sb = new StringBuilder();
// 内联 append("a")
sb.value[sb.count++] = 'a';
// 内联 append("b")
sb.value[sb.count++] = 'b';
// 内联 append("c")
sb.value[sb.count++] = 'c';
```

**进一步优化**：

- 逃逸分析：sb 未逃逸
- 标量替换：sb 分解为局部变量
- 栈上分配：sb 分配在栈上

### 案例：为什么 Stream API 可能比循环慢？

**Stream API**：

```java
list.stream()
    .filter(x -> x > 0)
    .map(x -> x * 2)
    .collect(Collectors.toList());
```

**问题**：

- 大量接口方法调用（invokeinterface）
- 多态调用点（megamorphic）
- 难以内联

**传统循环**：

```java
List<Integer> result = new ArrayList<>();
for (int x : list) {
    if (x > 0) {
        result.add(x * 2);
    }
}
```

**优势**：

- 直接方法调用
- 容易内联
- 性能更好（小数据集）

**注意**：

- 大数据集或并行流可能不同
- 需实际测试

---

## 关键点总结

1. **内联收益**：消除调用开销、支持进一步优化
2. **内联条件**：方法大小 ≤ 35 字节、调用频繁、非多态
3. **虚方法内联**：单态可内联、双态条件内联、多态不内联
4. **内联限制**：代码膨胀、去优化代价
5. **查看日志**：`-XX:+PrintInlining`
6. **最佳实践**：保持方法简短、避免过度抽象

---

## 深入一点

### 内联的 IR 表示

**中间表示（IR）**：

```
调用前：
  call Demo::add(1, 2)

内联后：
  t1 = 1
  t2 = 2
  t3 = t1 + t2
  return t3

常量折叠后：
  return 3
```

### 内联树（Inline Tree）

**示例**：

```java
void method1() {
    method2();
    method3();
}

void method2() {
    method4();
}
```

**内联树**：

```
method1
  ├── method2 (inline)
  │     └── method4 (inline)
  └── method3 (inline)
```

### C2 编译器的内联策略

**启发式规则**：

1. **热点优先**：调用次数多的方法优先内联
2. **小方法优先**：字节码小的方法优先内联
3. **深度限制**：控制内联深度，避免无限内联
4. **代码膨胀控制**：限制内联后的代码大小

**查看 C2 编译器日志**：

```bash
-XX:+UnlockDiagnosticVMOptions -XX:+PrintCompilation -XX:+PrintInlining -XX:+LogCompilation
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 11.3 节编译优化技术
- 《Java 性能权威指南》- 4.4 节方法内联
- Oracle 官方文档：[Java HotSpot VM Options](https://www.oracle.com/java/technologies/javase/vmoptions-jsp.html)
- OpenJDK Wiki：[Inlining](https://wiki.openjdk.java.net/display/HotSpot/Inlining)
- 论文：[A Simple Graph-Based Intermediate Representation](https://dl.acm.org/doi/10.1145/2786805.2786860)

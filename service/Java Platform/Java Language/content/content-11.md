# lambda 表达式与 invokedynamic

## 概述

lambda 表达式是 Java 8 引入的函数式编程特性，与匿名内部类相比，lambda 使用了全新的字节码指令 `invokedynamic`，实现了更高效的动态调用机制。

本章深入解析：
- **lambda 的字节码实现**
- **invokedynamic 指令的作用**
- **lambda 与匿名内部类的区别**
- **方法引用的四种形式**
- **lambda 捕获变量的限制**

---

## 1. lambda 的字节码实现

### 基本示例

**源码**：

```java
public class LambdaDemo {
    public void test() {
        Runnable r = () -> System.out.println("Hello");
        r.run();
    }
}
```

**字节码**：

```
invokedynamic #2, 0  // InvokeDynamic #0:run:()Ljava/lang/Runnable;
astore_1
aload_1
invokeinterface Runnable.run()V

BootstrapMethods:
  0: invokestatic LambdaMetafactory.metafactory
    MethodType: ()Runnable
    MethodHandle: invokestatic LambdaDemo.lambda$test$0()V
```

### lambda 的实现机制

**步骤 1：编译器生成 lambda 方法**

编译器将 lambda 体编译为私有静态方法：

```java
private static void lambda$test$0() {
    System.out.println("Hello");
}
```

**步骤 2：invokedynamic 动态链接**

首次执行时，JVM 调用 `LambdaMetafactory.metafactory`：

```java
public static CallSite metafactory(
    MethodHandles.Lookup caller,
    String invokedName,
    MethodType invokedType,
    MethodType samMethodType,
    MethodHandle implMethod,
    MethodType instantiatedMethodType
) {
    // 动态生成实现类
    // 返回 CallSite
}
```

**步骤 3：生成实现类**

运行时动态生成类似的类：

```java
final class LambdaDemo$$Lambda$1 implements Runnable {
    public void run() {
        LambdaDemo.lambda$test$0();
    }
}
```

**关键**：实现类在**运行时**生成，不产生 class 文件。

---

## 2. invokedynamic 指令的作用

### Java 的五种方法调用指令

| 指令              | 用途                           | 示例                |
| ----------------- | ------------------------------ | ------------------- |
| invokevirtual     | 调用虚方法（多态）             | `obj.method()`      |
| invokespecial     | 调用私有方法、构造方法、父类方法 | `super.method()`    |
| invokestatic      | 调用静态方法                   | `Class.method()`    |
| invokeinterface   | 调用接口方法                   | `interface.method()`|
| **invokedynamic** | 动态语言支持（Java 7+）         | lambda、方法引用    |

### invokedynamic 的优势

**1. 延迟绑定**

首次调用时才确定目标方法：

```java
Runnable r = () -> System.out.println("Hello");
```

字节码：

```
invokedynamic #2  // 首次调用时链接
```

运行时：

```
1. 调用 BootstrapMethod (LambdaMetafactory.metafactory)
2. 返回 CallSite（包含 MethodHandle）
3. 后续调用直接使用 CallSite
```

**2. 性能优化**

- JIT 可以内联 lambda 方法
- 避免匿名内部类的对象创建开销

**3. 实现灵活性**

JVM 可以选择不同实现策略：

- 动态生成类（当前实现）
- 方法句柄直接调用
- 内联优化

---

## 3. lambda 与匿名内部类的区别

### 字节码对比

**匿名内部类**：

```java
Runnable r = new Runnable() {
    public void run() {
        System.out.println("Hello");
    }
};
```

编译生成：`Outer$1.class`

**lambda**：

```java
Runnable r = () -> System.out.println("Hello");
```

编译生成：私有静态方法 `lambda$test$0`，运行时动态生成类。

### 性能对比

| 特性         | 匿名内部类       | lambda            |
| ------------ | ---------------- | ----------------- |
| class 文件   | 编译期生成       | 运行时生成        |
| 对象创建     | 每次 new         | 可能复用实例      |
| 内存占用     | 类元数据常驻     | 动态生成可回收    |
| JIT 优化     | 难以内联         | 容易内联          |
| 启动性能     | 快（类已加载）   | 慢（首次链接）    |

### this 引用的区别

**匿名内部类**：

```java
class Outer {
    void test() {
        Runnable r = new Runnable() {
            public void run() {
                System.out.println(this.getClass()); // Outer$1
            }
        };
    }
}
```

**lambda**：

```java
class Outer {
    void test() {
        Runnable r = () -> {
            System.out.println(this.getClass()); // Outer（外部类）
        };
    }
}
```

**原因**：

- 匿名内部类的 `this` 是内部类实例
- lambda 的 `this` 是外部类实例（lambda 编译为静态方法，捕获外部 `this`）

### 捕获变量的区别

**匿名内部类**：

```java
int x = 10;
Runnable r = new Runnable() {
    public void run() {
        System.out.println(x);
    }
};
```

编译为：

```java
class Outer$1 {
    final int val$x;
    Outer$1(int x) {
        this.val$x = x;
    }
}
```

**lambda**：

```java
int x = 10;
Runnable r = () -> System.out.println(x);
```

编译为：

```java
private static void lambda$test$0(int x) {
    System.out.println(x);
}
```

lambda 将捕获的变量作为参数传递给 lambda 方法。

---

## 4. 方法引用的四种形式

### 1. 静态方法引用

**语法**：`类名::静态方法`

```java
Function<String, Integer> parser = Integer::parseInt;
int num = parser.apply("42");
```

**等价 lambda**：

```java
Function<String, Integer> parser = s -> Integer.parseInt(s);
```

**字节码**：

```
invokedynamic #2  // apply:()Ljava/util/function/Function;
BootstrapMethod: LambdaMetafactory.metafactory
  MethodHandle: invokestatic Integer.parseInt(String)I
```

### 2. 实例方法引用（绑定接收者）

**语法**：`对象::实例方法`

```java
String str = "hello";
Supplier<Integer> lengthSupplier = str::length;
int len = lengthSupplier.get(); // 5
```

**等价 lambda**：

```java
Supplier<Integer> lengthSupplier = () -> str.length();
```

**字节码**：

```
aload_1  // 加载 str
invokedynamic #3  // get:()Ljava/util/function/Supplier;
BootstrapMethod:
  MethodHandle: invokevirtual String.length()I
  捕获参数: str
```

### 3. 实例方法引用（未绑定接收者）

**语法**：`类名::实例方法`

```java
Function<String, Integer> lengthFunc = String::length;
int len = lengthFunc.apply("hello"); // 5
```

**等价 lambda**：

```java
Function<String, Integer> lengthFunc = s -> s.length();
```

**字节码**：

```
invokedynamic #4  // apply:()Ljava/util/function/Function;
BootstrapMethod:
  MethodHandle: invokevirtual String.length()I
```

**区别**：

- 绑定接收者：捕获具体对象
- 未绑定接收者：第一个参数是接收者

### 4. 构造方法引用

**语法**：`类名::new`

```java
Supplier<List<String>> listSupplier = ArrayList::new;
List<String> list = listSupplier.get();
```

**等价 lambda**：

```java
Supplier<List<String>> listSupplier = () -> new ArrayList<>();
```

**字节码**：

```
invokedynamic #5  // get:()Ljava/util/function/Supplier;
BootstrapMethod:
  MethodHandle: newinvokespecial ArrayList.<init>()V
```

**带参数的构造方法**：

```java
Function<Integer, int[]> arrayCreator = int[]::new;
int[] arr = arrayCreator.apply(10); // 创建长度为 10 的数组
```

---

## 5. lambda 捕获变量的限制

### Effectively Final 要求

**允许**：

```java
int x = 10;
Runnable r = () -> System.out.println(x);
```

**禁止**：

```java
int x = 10;
Runnable r = () -> System.out.println(x);
x = 20; // 编译错误：x 不是 effectively final
```

### 捕获实例字段 vs 局部变量

**捕获实例字段（允许）**：

```java
class Demo {
    int value = 10;
    
    void test() {
        Runnable r = () -> {
            value = 20; // 允许修改
        };
    }
}
```

**原因**：捕获的是 `this`，而非字段本身。

**编译为**：

```java
private void lambda$test$0() {
    this.value = 20;
}
```

**捕获局部变量（禁止修改）**：

```java
void test() {
    int x = 10;
    Runnable r = () -> {
        // x = 20; // 编译错误
    };
}
```

### 捕获引用类型

**允许修改对象内容**：

```java
List<String> list = new ArrayList<>();
Runnable r = () -> list.add("item"); // 允许
```

**禁止重新赋值引用**：

```java
List<String> list = new ArrayList<>();
Runnable r = () -> {
    // list = new ArrayList<>(); // 编译错误
};
```

---

## 易错点与边界行为

### 1. lambda 的序列化

**lambda 默认不支持序列化**：

```java
Runnable r = (Runnable & Serializable) () -> System.out.println("Hello");
```

使用交叉类型强制 lambda 实现 `Serializable`。

### 2. lambda 的异常处理

**checked 异常需要包装**：

```java
// 编译错误：lambda 不能抛出 checked 异常
Runnable r = () -> {
    throw new IOException();
};

// 正确：包装为 unchecked 异常
Runnable r = () -> {
    try {
        throw new IOException();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
};
```

### 3. lambda 的类型推导限制

**需要目标类型**：

```java
// 编译错误：无法推导类型
var r = () -> System.out.println("Hello");

// 正确：指定目标类型
Runnable r = () -> System.out.println("Hello");
```

### 4. 重载方法的歧义

**问题代码**：

```java
void process(Runnable r) { }
void process(Supplier<String> s) { }

process(() -> { }); // 编译错误：ambiguous
```

**解决方案**：

```java
process((Runnable) () -> { });
```

---

## 实际推导案例

### 案例：Stream API 的 lambda 优化

**源码**：

```java
List<String> list = Arrays.asList("a", "b", "c");
list.stream()
    .filter(s -> s.startsWith("a"))
    .map(String::toUpperCase)
    .forEach(System.out::println);
```

**编译后**：

```java
// filter 的 lambda
private static boolean lambda$main$0(String s) {
    return s.startsWith("a");
}

// forEach 的方法引用
// 直接使用 PrintStream.println 的 MethodHandle
```

**优化**：

- JIT 可以内联 lambda 方法
- 避免迭代器的对象创建
- 方法引用直接使用 MethodHandle

### 案例：为什么无捕获的 lambda 可以复用？

**源码**：

```java
Runnable r1 = () -> System.out.println("Hello");
Runnable r2 = () -> System.out.println("Hello");
```

**可能的实现**：

```java
// JVM 可以复用同一个实例
r1 == r2; // 可能为 true（实现细节）
```

**有捕获的 lambda**：

```java
int x = 10;
Runnable r1 = () -> System.out.println(x);
int y = 20;
Runnable r2 = () -> System.out.println(y);

r1 == r2; // false（捕获不同变量）
```

---

## 关键点总结

1. **lambda 实现**：编译为私有静态方法，运行时动态生成类
2. **invokedynamic**：延迟绑定，首次调用链接，后续直接使用 CallSite
3. **性能优势**：可内联、可复用实例、无 class 文件开销
4. **方法引用**：静态方法、实例方法（绑定/未绑定）、构造方法
5. **捕获限制**：局部变量必须 effectively final，实例字段可修改
6. **this 引用**：lambda 的 this 是外部类，匿名内部类是内部类

---

## 深入一点

### LambdaMetafactory 的实现

**metafactory 方法签名**：

```java
public static CallSite metafactory(
    MethodHandles.Lookup caller,      // 调用者
    String invokedName,                // 方法名（如 "run"）
    MethodType invokedType,            // 函数接口类型
    MethodType samMethodType,          // SAM 方法类型
    MethodHandle implMethod,           // lambda 实现方法
    MethodType instantiatedMethodType  // 实例化类型
)
```

**工作流程**：

1. 使用 ASM 动态生成类
2. 定义类（`Unsafe.defineAnonymousClass`）
3. 创建 ConstantCallSite
4. 返回 CallSite

### invokedynamic 的字节码结构

```
invokedynamic #2, 0

Constant Pool:
  #2 = InvokeDynamic #0:#18  // #0:run:()Ljava/lang/Runnable;
  #18 = NameAndType run:()Ljava/lang/Runnable;

BootstrapMethods:
  0: invokestatic LambdaMetafactory.metafactory(
       Ljava/lang/invoke/MethodHandles$Lookup;
       Ljava/lang/String;
       Ljava/lang/invoke/MethodType;
       Ljava/lang/invoke/MethodType;
       Ljava/lang/invoke/MethodHandle;
       Ljava/lang/invoke/MethodType;
     )Ljava/lang/invoke/CallSite;
    Method arguments:
      #19 ()V
      #20 invokestatic LambdaDemo.lambda$test$0()V
      #19 ()V
```

### MethodHandle 的优势

**MethodHandle vs 反射**：

| 特性     | Reflection             | MethodHandle        |
| -------- | ---------------------- | ------------------- |
| 类型检查 | 运行时                 | 编译期 + 运行时     |
| 性能     | 慢（50-100倍）         | 接近直接调用        |
| JIT 优化 | 难以内联               | 可内联              |
| 安全性   | 需要权限检查           | 创建时检查          |

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 8.3.4 节 invokedynamic 指令
- 《Java 核心技术（卷I）》- 第6章 lambda 表达式
- Oracle 官方文档：[Lambda Expressions](https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html)
- JSR 335：Lambda Expressions for the Java Programming Language
- Brian Goetz：[Translation of Lambda Expressions](http://cr.openjdk.java.net/~briangoetz/lambda/lambda-translation.html)

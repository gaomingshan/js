# 编译期常量与类型推断

## 概述

Java 编译器在编译期执行常量折叠、类型推断等优化。理解编译期行为，有助于避免常见错误、优化代码性能、理解语言边界。

本章聚焦：
- **编译期常量的定义**
- **常量折叠机制**
- **类型推断（泛型、lambda、var）**
- **编译期与运行期的界限**

---

## 1. 编译期常量

### 定义

**编译期常量**：编译期可确定值的常量

**条件**：

1. 声明为 `final`
2. 基本类型或 String
3. 值在编译期可确定

### 示例

**编译期常量**：

```java
final int MAX = 100;  // 编译期常量
final String NAME = "Demo";  // 编译期常量
```

**非编译期常量**：

```java
final int value = getValue();  // 运行期确定
final Object obj = new Object();  // 运行期创建
```

### 常量的内联

**源码**：

```java
class Constants {
    static final int MAX = 100;
}

class Demo {
    void method() {
        if (value < Constants.MAX) {
            // ...
        }
    }
}
```

**编译后**：

```java
class Demo {
    void method() {
        if (value < 100) {  // MAX 被内联
            // ...
        }
    }
}
```

**影响**：

- 修改 `Constants.MAX` 后，需要重新编译 `Demo`
- 否则 `Demo` 仍使用旧值

---

## 2. 常量折叠

### 基本类型的常量折叠

**整数运算**：

```java
int x = 2 + 3;
```

**编译后**：

```java
int x = 5;
```

**字符串拼接**：

```java
String s = "Hello" + " " + "World";
```

**编译后**：

```java
String s = "Hello World";
```

### 复杂表达式的折叠

**源码**：

```java
int x = (1 + 2) * (3 + 4);
```

**编译后**：

```java
int x = 21;
```

**位运算**：

```java
int x = 0xFF & 0xF0;
```

**编译后**：

```java
int x = 240;
```

### 常量传播

**源码**：

```java
final int a = 10;
final int b = 20;
int c = a + b;
```

**编译后**：

```java
int c = 30;
```

---

## 3. 三目运算符的类型提升

### 类型提升规则

**规则**：

1. 如果两个操作数类型相同，结果类型相同
2. 如果一个是基本类型，一个是包装类型，拆箱
3. 如果两个都是数值类型，提升到较大类型
4. 如果一个是 null，结果类型是另一个

### 示例

**基本类型提升**：

```java
int a = 1;
long b = 2L;
long c = true ? a : b;  // int 提升为 long
```

**拆箱陷阱**：

```java
Integer a = 1;
int b = 2;
int c = true ? a : b;  // a 自动拆箱
```

**null 陷阱**：

```java
Integer a = null;
int b = 2;
int c = true ? a : b;  // NullPointerException（a 拆箱）
```

**原因**：

- 三目运算符要求两个操作数类型一致
- `a` (Integer) 和 `b` (int) → 拆箱 `a` 为 int
- `null.intValue()` → NullPointerException

**安全写法**：

```java
Integer a = null;
Integer b = 2;
Integer c = true ? a : b;  // 返回 null，无异常
```

---

## 4. 类型推断

### 泛型的类型推断

**Java 7+ 菱形操作符**：

```java
// Java 6
List<String> list = new ArrayList<String>();

// Java 7+
List<String> list = new ArrayList<>();  // 类型推断
```

**方法调用的类型推断**：

```java
static <T> List<T> emptyList() {
    return new ArrayList<T>();
}

// 调用
List<String> list = emptyList();  // 推断 T = String
```

### Lambda 的类型推断

**参数类型推断**：

```java
// 显式类型
Comparator<String> c1 = (String a, String b) -> a.compareTo(b);

// 类型推断
Comparator<String> c2 = (a, b) -> a.compareTo(b);
```

**返回类型推断**：

```java
Function<String, Integer> f = s -> s.length();  // 推断返回 int
```

### var 关键字（Java 10+）

**局部变量类型推断**：

```java
var list = new ArrayList<String>();  // 推断为 ArrayList<String>
var s = "Hello";  // 推断为 String
var i = 10;  // 推断为 int
```

**限制**：

```java
var x;  // 错误：必须有初始化器
var y = null;  // 错误：无法推断类型
var z = {1, 2, 3};  // 错误：不支持数组初始化器
```

**最佳实践**：

```java
// 推荐：类型明显
var map = new HashMap<String, List<Integer>>();
var reader = Files.newBufferedReader(path);

// 不推荐：类型不明确
var result = process();  // process() 返回什么？
```

---

## 5. switch 表达式的类型

### switch 语句 vs switch 表达式

**switch 语句**（传统）：

```java
int result;
switch (value) {
    case 1:
        result = 10;
        break;
    case 2:
        result = 20;
        break;
    default:
        result = 0;
}
```

**switch 表达式**（Java 12+）：

```java
int result = switch (value) {
    case 1 -> 10;
    case 2 -> 20;
    default -> 0;
};
```

### 类型推断

**示例**：

```java
var result = switch (value) {
    case 1 -> "one";
    case 2 -> "two";
    default -> "other";
};  // 推断为 String
```

**混合类型**：

```java
var result = switch (value) {
    case 1 -> 10;
    case 2 -> "twenty";  // 编译错误：类型不一致
};
```

---

## 易错点与边界行为

### 1. 常量表达式的边界

**编译期常量**：

```java
final int a = 10;
final int b = 20;
int c = a + b;  // 编译期折叠为 30
```

**非编译期常量**：

```java
final int a = getValue();
final int b = 20;
int c = a + b;  // 运行期计算
```

### 2. String 拼接的特殊处理

**编译期拼接**：

```java
String s = "a" + "b" + "c";  // 编译为 "abc"
```

**运行期拼接**：

```java
String a = "a";
String s = a + "b" + "c";  // 编译为 StringBuilder
```

**final 变量**：

```java
final String a = "a";
String s = a + "b";  // 编译为 "ab"
```

### 3. 自动装箱的常量池

**整数缓存**：

```java
Integer a = 127;
Integer b = 127;
System.out.println(a == b);  // true（缓存）

Integer c = 128;
Integer d = 128;
System.out.println(c == d);  // false（超出缓存范围）
```

**原因**：

- Integer 缓存 -128 到 127
- 编译器使用 `Integer.valueOf()`
- 缓存范围内返回同一对象

### 4. 泛型擦除与类型推断

**问题**：

```java
List<String> list = new ArrayList<>();
list.add("Hello");

// 类型擦除后
List list = new ArrayList();
list.add("Hello");
```

**影响**：

- 运行时无法获取泛型类型
- 反射无法获取泛型参数

---

## 实际推导案例

### 案例：常量表达式的优化

**源码**：

```java
class Demo {
    static final int SIZE = 1024;
    
    void method() {
        byte[] buffer = new byte[SIZE];
    }
}
```

**编译后**：

```java
void method() {
    byte[] buffer = new byte[1024];
}
```

**修改常量**：

```java
class Demo {
    static final int SIZE = 2048;  // 修改
}
```

**影响**：

- 使用 `SIZE` 的其他类需要重新编译
- 否则仍使用旧值 1024

### 案例：switch on String 的实现

**源码**：

```java
String s = "apple";
switch (s) {
    case "apple":
        System.out.println("Apple");
        break;
    case "banana":
        System.out.println("Banana");
        break;
}
```

**编译后（简化）**：

```java
int hash = s.hashCode();
switch (hash) {
    case 93029210:  // "apple".hashCode()
        if (s.equals("apple")) {
            System.out.println("Apple");
        }
        break;
    case 93832879:  // "banana".hashCode()
        if (s.equals("banana")) {
            System.out.println("Banana");
        }
        break;
}
```

**两阶段匹配**：

1. hashCode 匹配（快速筛选）
2. equals 匹配（确保正确）

### 案例：var 的类型推断陷阱

**问题代码**：

```java
var list = new ArrayList<>();  // 推断为 ArrayList<Object>
list.add("Hello");
list.add(123);  // 允许，因为是 Object
```

**正确写法**：

```java
var list = new ArrayList<String>();  // 推断为 ArrayList<String>
list.add("Hello");
// list.add(123);  // 编译错误
```

---

## 关键点总结

1. **编译期常量**：final + 基本类型/String + 编译期可确定
2. **常量折叠**：编译期计算常量表达式
3. **类型推断**：菱形操作符、lambda、var
4. **三目运算符**：类型提升、拆箱陷阱
5. **常量内联**：修改常量需重新编译使用者
6. **switch on String**：两阶段匹配（hashCode + equals）

---

## 深入一点

### 编译期常量的字节码

**源码**：

```java
class Constants {
    static final int MAX = 100;
}
```

**字节码**：

```
static final int MAX = 100;
  descriptor: I
  flags: ACC_STATIC, ACC_FINAL
  ConstantValue: int 100
```

**ConstantValue 属性**：

- 存储常量值
- 无需 <clinit> 方法初始化

### 类型推断的算法

**约束求解**：

```java
<T> T method(T a, T b) {
    return a;
}

var result = method("Hello", "World");
```

**推断过程**：

1. 生成约束：T = String, T = String
2. 求解约束：T = String
3. 返回类型：String

**失败情况**：

```java
var result = method("Hello", 123);
// T = String, T = Integer
// 无公共父类（除 Object）
// 推断为 Object
```

### 常量池与常量折叠

**源码**：

```java
String s1 = "Hello";
String s2 = "Hel" + "lo";
```

**常量池**：

```
#1 = String "Hello"
```

**s1 和 s2 都指向同一常量池条目**。

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 第10章前端编译与优化
- 《Effective Java（第3版）》- Item 67：明智地使用优化
- JLS §15.28：Constant Expressions
- Oracle 官方文档：[Local Variable Type Inference](https://openjdk.java.net/jeps/286)
- 工具：javap、jd-gui

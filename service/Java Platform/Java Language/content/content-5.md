# Java 泛型的本质与擦除机制

## 概述

Java 泛型是编译期的类型系统增强，但运行期会被擦除（Type Erasure）。这种设计是为了保持与 Java 1.4 的向后兼容性，但也带来了诸多限制和陷阱。

理解泛型的本质，需要区分三个层面：
- **源码层面**：泛型参数提供编译期类型检查
- **字节码层面**：泛型信息被擦除为原始类型
- **运行时层面**：无法获取泛型的具体类型

本章深入解析泛型擦除的设计动机、实现机制和边界行为。

---

## 1. 泛型擦除的设计动机

### Java 1.4 的集合类型不安全问题

```java
// Java 1.4
List list = new ArrayList();
list.add("string");
list.add(new Integer(42)); // 允许，但类型不安全

String s = (String) list.get(1); // 运行时 ClassCastException
```

**问题**：编译期无法检查类型，运行时才发现错误。

### Java 5 引入泛型

```java
// Java 5+
List<String> list = new ArrayList<>();
list.add("string");
// list.add(42); // 编译错误
String s = list.get(0); // 无需强制转型
```

**优势**：编译期类型检查，避免运行时错误。

### 为什么选择擦除而非具体化？

**具体化（Reification）**：运行时保留泛型信息（C# 的做法）

```csharp
// C# 运行时保留泛型类型
List<string> list = new List<string>();
list.GetType(); // List<string>
```

**Java 的擦除（Erasure）**：

```java
List<String> list = new ArrayList<>();
list.getClass(); // ArrayList（而非 ArrayList<String>）
```

**选择擦除的原因**：

1. **向后兼容**：Java 5 的泛型代码可以与 Java 1.4 的非泛型代码互操作
2. **迁移平滑**：现有字节码库无需重新编译
3. **JVM 无需修改**：泛型由 javac 处理，JVM 无感知

**代价**：

- 运行时无法获取泛型类型
- 泛型数组限制
- 桥方法的引入

---

## 2. 原始类型与边界类型

### 无界类型参数的擦除

```java
class Box<T> {
    private T value;
    
    public void set(T value) {
        this.value = value;
    }
    
    public T get() {
        return value;
    }
}
```

编译后的字节码等价于：

```java
class Box {
    private Object value; // T 擦除为 Object
    
    public void set(Object value) {
        this.value = value;
    }
    
    public Object get() {
        return value;
    }
}
```

### 有界类型参数的擦除

```java
class NumberBox<T extends Number> {
    private T value;
    
    public void set(T value) {
        this.value = value;
    }
    
    public T get() {
        return value;
    }
}
```

编译后擦除为：

```java
class NumberBox {
    private Number value; // T 擦除为边界类型 Number
    
    public void set(Number value) {
        this.value = value;
    }
    
    public Number get() {
        return value;
    }
}
```

**擦除规则**：
- 无界类型参数 `<T>` → `Object`
- 有界类型参数 `<T extends Number>` → `Number`
- 多重边界 `<T extends A & B>` → 第一个边界 `A`

### 多重边界的擦除

```java
interface Serializable { }
interface Comparable<T> { }

class Pair<T extends Serializable & Comparable<T>> {
    private T first;
}
```

编译后：

```java
class Pair {
    private Serializable first; // 擦除为第一个边界
}
```

**注意**：边界顺序影响擦除结果，应将类放在第一位：

```java
// 推荐
<T extends Number & Serializable>

// 不推荐（擦除为接口）
<T extends Serializable & Number>
```

---

## 3. 桥方法的生成与作用

### 为什么需要桥方法？

```java
class Node<T> {
    private T data;
    
    public void setData(T data) {
        this.data = data;
    }
}

class IntegerNode extends Node<Integer> {
    @Override
    public void setData(Integer data) {
        super.setData(data);
    }
}
```

**问题**：

- 父类擦除后：`setData(Object data)`
- 子类签名：`setData(Integer data)`
- 这两个方法签名不同，不是重写关系

**解决方案**：编译器生成桥方法

```java
class IntegerNode extends Node {
    // 用户编写的方法
    public void setData(Integer data) {
        super.setData(data);
    }
    
    // 编译器生成的桥方法
    public void setData(Object data) {
        setData((Integer) data); // 调用真正的实现
    }
}
```

### 字节码验证

```bash
javap -c IntegerNode.class
```

输出：

```
public void setData(java.lang.Integer);
  Code:
     0: aload_0
     1: aload_1
     2: invokespecial Node.setData:(Ljava/lang/Object;)V
     5: return

public void setData(java.lang.Object);
  Code:
     0: aload_0
     1: aload_1
     2: checkcast     java/lang/Integer
     5: invokevirtual IntegerNode.setData:(Ljava/lang/Integer;)V
     8: return
  Signature: (Ljava/lang/Object;)V
  Flags: ACC_BRIDGE, ACC_SYNTHETIC
```

**桥方法的标志**：
- `ACC_BRIDGE`：标记为桥方法
- `ACC_SYNTHETIC`：编译器生成的方法

### 桥方法与协变返回类型

```java
class Node<T> {
    public T getData() {
        return null;
    }
}

class IntegerNode extends Node<Integer> {
    @Override
    public Integer getData() {
        return 42;
    }
}
```

编译后：

```java
class IntegerNode extends Node {
    // 用户方法
    public Integer getData() {
        return 42;
    }
    
    // 桥方法（协变返回类型）
    public Object getData() {
        return getData(); // 调用 Integer 版本
    }
}
```

---

## 4. 泛型数组限制的原因

### 不能创建泛型数组

```java
// 编译错误
List<String>[] lists = new List<String>[10];
List<Integer>[] intLists = new List<Integer>[10];
```

**原因**：类型擦除导致运行时类型不安全

**推导过程**：

假设允许泛型数组：

```java
List<String>[] stringLists = new List<String>[1];
Object[] objects = stringLists; // 数组协变，允许
objects[0] = new ArrayList<Integer>(); // 运行时类型检查通过（都是 ArrayList）

String s = stringLists[0].get(0); // ClassCastException
```

**问题**：
1. 数组在运行时会检查元素类型（`ArrayStoreException`）
2. 泛型擦除后，`List<String>` 和 `List<Integer>` 都是 `List`
3. 运行时无法区分，导致类型不安全

### 通配符数组是允许的

```java
List<?>[] lists = new List<?>[10]; // 允许
List<String>[] stringLists = new List[10]; // 允许（原始类型）
```

**原因**：通配符表示未知类型，不会假定元素类型。

### 替代方案

**使用 ArrayList 代替数组**：

```java
List<List<String>> lists = new ArrayList<>();
```

**使用数组存储原始类型**：

```java
@SuppressWarnings("unchecked")
List<String>[] lists = (List<String>[]) new List[10];
```

---

## 5. 类型擦除导致的边界行为

### 1. 无法使用 instanceof 检查泛型类型

```java
List<String> list = new ArrayList<>();

// if (list instanceof List<String>) { } // 编译错误

if (list instanceof List<?>) { } // 正确，通配符
if (list instanceof List) { } // 正确，原始类型
```

**原因**：运行时无法区分 `List<String>` 和 `List<Integer>`。

### 2. 无法创建泛型类型的实例

```java
class Box<T> {
    public T createInstance() {
        // return new T(); // 编译错误
    }
}
```

**原因**：编译后 `T` 擦除为 `Object`，无法执行 `new Object()`。

**解决方案**：传入 Class 对象

```java
class Box<T> {
    private Class<T> type;
    
    public Box(Class<T> type) {
        this.type = type;
    }
    
    public T createInstance() throws Exception {
        return type.getDeclaredConstructor().newInstance();
    }
}

Box<String> box = new Box<>(String.class);
String s = box.createInstance();
```

### 3. 静态字段不能使用泛型类型

```java
class Box<T> {
    // private static T value; // 编译错误
}
```

**原因**：静态字段属于类，而泛型类型是实例级别的。

### 4. 不能重载只有泛型参数不同的方法

```java
class Processor {
    // 编译错误：擦除后签名相同
    void process(List<String> list) { }
    void process(List<Integer> list) { }
}
```

擦除后都是 `process(List list)`，签名冲突。

### 5. 泛型异常限制

```java
// 不能继承 Throwable 的泛型类
// class MyException<T> extends Exception { } // 编译错误

// 不能捕获泛型异常
void method() {
    try {
        // ...
    } catch (T e) { // 编译错误
    }
}
```

**原因**：异常处理依赖运行时类型检查，泛型擦除后无法实现。

---

## 易错点与边界行为

### 1. 泛型的多态陷阱

```java
List<String> strings = new ArrayList<>();
// List<Object> objects = strings; // 编译错误

Object[] objArray = strings.toArray();
objArray[0] = new Integer(42); // ArrayStoreException
```

**泛型是不变的（Invariant）**：`List<String>` 不是 `List<Object>` 的子类。

### 2. 原始类型的类型污染

```java
List<String> strings = new ArrayList<>();
List raw = strings; // 原始类型
raw.add(42); // 编译警告，运行时允许

String s = strings.get(0); // ClassCastException
```

**原因**：原始类型绕过了泛型检查。

### 3. 泛型与数组的协变性差异

```java
// 数组是协变的
String[] strings = new String[10];
Object[] objects = strings; // 允许

// 泛型是不变的
List<String> stringList = new ArrayList<>();
// List<Object> objectList = stringList; // 编译错误
```

### 4. 擦除导致的方法签名冲突

```java
class Pair<T> {
    public boolean equals(T value) { // 编译错误
        // 擦除后与 Object.equals(Object) 签名冲突
    }
}
```

---

## 实际推导案例

### 案例：为什么 Collections.emptyList() 可以赋值给任意类型？

```java
List<String> strings = Collections.emptyList();
List<Integer> integers = Collections.emptyList();
```

**实现**：

```java
public static final <T> List<T> emptyList() {
    return (List<T>) EMPTY_LIST;
}

private static final List<Object> EMPTY_LIST = new EmptyList<>();
```

**推导**：

1. 空列表不包含元素，不会发生类型不安全操作
2. 类型擦除后，所有 `List<T>` 都是 `List`
3. 返回类型由调用点的上下文推导：

```java
List<String> strings = Collections.<String>emptyList();
```

编译器推断 `T = String`，但运行时都是同一个 `EMPTY_LIST` 实例。

### 案例：ArrayList 如何保证类型安全？

```java
public class ArrayList<E> {
    private Object[] elementData;
    
    public boolean add(E e) {
        elementData[size++] = e; // 存储为 Object
        return true;
    }
    
    public E get(int index) {
        return (E) elementData[index]; // 强制转型
    }
}
```

**编译后**：

```java
public class ArrayList {
    private Object[] elementData;
    
    public boolean add(Object e) {
        elementData[size++] = e;
        return true;
    }
    
    public Object get(int index) {
        return elementData[index];
    }
}
```

**类型安全保证**：

```java
List<String> list = new ArrayList<>();
list.add("hello"); // 编译器插入类型检查
String s = list.get(0); // 编译器插入强制转型
```

编译为：

```java
List list = new ArrayList();
list.add("hello");
String s = (String) list.get(0); // 编译器自动插入
```

---

## 关键点总结

1. **泛型擦除**：编译后类型参数被擦除为原始类型或边界类型
2. **原始类型**：无界 `<T>` → `Object`，有界 `<T extends Number>` → `Number`
3. **桥方法**：保证泛型子类重写父类方法的多态性
4. **泛型数组限制**：数组协变 + 类型擦除 → 运行时类型不安全
5. **边界行为**：不能 instanceof、不能 new T()、不能静态泛型字段
6. **类型安全**：编译器插入类型检查和强制转型

---

## 深入一点

### 泛型的 Signature 属性

虽然字节码擦除了泛型，但 class 文件的 Signature 属性保留了泛型信息（供反射使用）：

```java
class Box<T extends Number> {
    private T value;
}
```

class 文件：

```
Field value:
  descriptor: Ljava/lang/Number;  // 擦除类型
  Signature: TT;                  // 泛型签名
```

反射读取：

```java
Field field = Box.class.getDeclaredField("value");
Type genericType = field.getGenericType(); // TypeVariable<T>
Type type = field.getType(); // Number
```

### 编译器如何处理泛型

**步骤 1：类型检查**

```java
List<String> list = new ArrayList<>();
list.add("hello");
list.add(42); // 编译错误
```

**步骤 2：插入强制转型**

```java
String s = list.get(0);
```

编译为：

```java
String s = (String) list.get(0);
```

**步骤 3：生成桥方法**

子类重写泛型方法时，生成桥方法保持多态。

**步骤 4：擦除类型参数**

```java
class Box<T> → class Box
```

---

## 参考资料

- 《Java 核心技术（卷I）》- 第8章泛型程序设计
- 《Effective Java（第3版）》- Item 26-31（泛型最佳实践）
- 《深入理解 Java 虚拟机（第3版）》- 10.3.6 节泛型与类型擦除
- Oracle 官方教程：[Type Erasure](https://docs.oracle.com/javase/tutorial/java/generics/erasure.html)
- JSR 14：Adding Generics to the Java Programming Language

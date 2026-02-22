# 泛型的高级特性

## 概述

泛型通配符（Wildcards）是 Java 泛型系统中最复杂、最强大的特性。通配符解决了泛型不变性（Invariance）的限制，使得泛型集合可以在保证类型安全的前提下实现协变（Covariance）和逆变（Contravariance）。

本章深入解析：
- **上界通配符 `<? extends T>`**：协变，只读语义
- **下界通配符 `<? super T>`**：逆变，只写语义
- **PECS 原则**：Producer Extends Consumer Super
- **递归泛型**：自限定类型的应用
- **类型推导**：菱形语法与方法泛型推导

---

## 1. 上界通配符（<? extends T>）与协变

### 泛型的不变性问题

```java
List<Integer> integers = new ArrayList<>();
// List<Number> numbers = integers; // 编译错误
```

虽然 `Integer` 是 `Number` 的子类，但 `List<Integer>` 不是 `List<Number>` 的子类。

**原因**：如果允许这种转换，会破坏类型安全：

```java
// 假设允许
List<Number> numbers = integers;
numbers.add(3.14); // Double 也是 Number
Integer i = integers.get(0); // ClassCastException
```

### 上界通配符实现协变

```java
List<Integer> integers = Arrays.asList(1, 2, 3);
List<? extends Number> numbers = integers; // 允许，协变

Number n = numbers.get(0); // 读取允许
// numbers.add(42); // 编译错误，写入禁止
```

**语义**：
- `? extends Number` 表示"某个 Number 的子类"，但具体类型未知
- **只读**：可以安全读取为 Number
- **禁写**：不知道具体类型，无法安全写入

### 为什么禁止写入？

```java
List<? extends Number> list = new ArrayList<Integer>();
// list.add(new Integer(1)); // 编译错误
// list.add(new Double(2.0)); // 编译错误
```

**推导**：
- `list` 的实际类型可能是 `List<Integer>`
- 如果允许 `list.add(new Double(2.0))`，会破坏类型安全
- 编译器禁止所有写入（除了 `null`）

```java
list.add(null); // 唯一允许的写入
```

### 协变的实际应用

**计算列表中的总和**：

```java
double sum(List<? extends Number> numbers) {
    double total = 0;
    for (Number n : numbers) {
        total += n.doubleValue();
    }
    return total;
}

sum(Arrays.asList(1, 2, 3)); // List<Integer>
sum(Arrays.asList(1.5, 2.5)); // List<Double>
```

---

## 2. 下界通配符（<? super T>）与逆变

### 下界通配符的语义

```java
List<? super Integer> list = new ArrayList<Number>();
list.add(1); // 写入允许
list.add(42);

// Object obj = list.get(0); // 只能读取为 Object
```

**语义**：
- `? super Integer` 表示"某个 Integer 的父类"
- **可写**：可以安全写入 Integer 及其子类
- **只读为 Object**：不知道具体类型，只能读取为 Object

### 为什么允许写入？

```java
List<? super Integer> list = new ArrayList<Number>();
list.add(1); // Integer 是 Number 的子类，安全
```

**推导**：
- `list` 的实际类型是 `List<Number>` 或更宽泛的类型
- `Integer` 可以安全写入 `List<Number>`
- 编译器允许写入 `Integer` 及其子类

### 为什么只能读取为 Object？

```java
List<? super Integer> list = new ArrayList<Number>();
// Integer i = list.get(0); // 编译错误
Object obj = list.get(0); // 只能读取为 Object
```

**推导**：
- `list` 的实际类型可能是 `List<Number>`、`List<Object>`
- 无法确定具体类型，只能读取为最宽泛的 `Object`

### 逆变的实际应用

**将元素添加到目标集合**：

```java
void addIntegers(List<? super Integer> target) {
    target.add(1);
    target.add(2);
    target.add(3);
}

List<Integer> integers = new ArrayList<>();
addIntegers(integers);

List<Number> numbers = new ArrayList<>();
addIntegers(numbers); // Integer 的父类
```

---

## 3. PECS 原则（Producer Extends Consumer Super）

### 原则定义

**PECS = Producer Extends, Consumer Super**

- **Producer（生产者）**：如果泛型结构**产出** `T`（读取），使用 `<? extends T>`
- **Consumer（消费者）**：如果泛型结构**消费** `T`（写入），使用 `<? super T>`

### 实际案例：Collections.copy

```java
public static <T> void copy(
    List<? super T> dest,      // 消费者，写入
    List<? extends T> src      // 生产者，读取
) {
    for (T t : src) {
        dest.add(t);
    }
}
```

**用法**：

```java
List<Integer> integers = Arrays.asList(1, 2, 3);
List<Number> numbers = new ArrayList<>();

Collections.copy(numbers, integers);
// dest = List<Number> 是 List<? super Integer>
// src = List<Integer> 是 List<? extends Integer>
```

### 实际案例：Comparable

```java
public interface Comparable<T> {
    int compareTo(T o);
}

// 错误设计
public static <T extends Comparable<T>> T max(Collection<T> coll) {
    // ...
}

// 正确设计（PECS）
public static <T extends Comparable<? super T>> T max(Collection<? extends T> coll) {
    // ...
}
```

**为什么需要 `? super T`？**

```java
class Fruit implements Comparable<Fruit> { }
class Apple extends Fruit { }

// 使用改进后的 max
List<Apple> apples = Arrays.asList(new Apple(), new Apple());
max(apples); // Apple 继承了 Fruit 的 Comparable
```

没有 `? super T`，`Apple` 需要实现 `Comparable<Apple>`，而不能复用父类的比较逻辑。

---

## 4. 无界通配符（<?>）的使用场景

### 无界通配符的语义

```java
List<?> list = new ArrayList<String>();
Object obj = list.get(0); // 只能读取为 Object
// list.add("hello"); // 编译错误，禁止写入
list.add(null); // 唯一允许
```

**语义**：表示"未知类型的列表"

### 使用场景

**1. 只需要集合的通用操作**

```java
void printSize(List<?> list) {
    System.out.println(list.size());
}

printSize(new ArrayList<String>());
printSize(new ArrayList<Integer>());
```

**2. 检查集合是否为空**

```java
boolean isEmpty(Collection<?> collection) {
    return collection.isEmpty();
}
```

**3. 与原始类型的区别**

```java
// 原始类型（不推荐）
List list = new ArrayList();
list.add("string");
list.add(42); // 类型不安全

// 无界通配符
List<?> list2 = new ArrayList<String>();
// list2.add("hello"); // 编译错误，类型安全
```

---

## 5. 递归泛型与自限定类型

### 自限定类型模式

```java
class Animal<T extends Animal<T>> {
    T self() {
        return (T) this;
    }
}

class Dog extends Animal<Dog> {
    void bark() { }
}

class Cat extends Animal<Cat> {
    void meow() { }
}

// 使用
Dog dog = new Dog();
dog.self().bark(); // 返回 Dog，而非 Animal
```

**优势**：保证方法返回类型是子类本身，而非父类。

### Enum 的递归泛型

```java
public abstract class Enum<E extends Enum<E>> {
    public final int compareTo(E o) {
        // ...
    }
}

enum Color {
    RED, GREEN, BLUE;
}
// Color 实际是 Color extends Enum<Color>
```

**作用**：保证 `compareTo` 的参数是同一枚举类型。

```java
Color.RED.compareTo(Color.BLUE); // 正确
// Color.RED.compareTo(Size.LARGE); // 编译错误（不同枚举）
```

### Builder 模式的递归泛型

```java
abstract class Builder<T extends Builder<T>> {
    abstract T self();
    
    T setName(String name) {
        // ...
        return self();
    }
}

class PersonBuilder extends Builder<PersonBuilder> {
    @Override
    PersonBuilder self() {
        return this;
    }
    
    PersonBuilder setAge(int age) {
        // ...
        return this;
    }
}

// 使用
new PersonBuilder()
    .setName("Alice") // 返回 PersonBuilder
    .setAge(30)       // 链式调用
    .build();
```

---

## 6. 类型推导与菱形语法

### Java 7 之前的冗余

```java
Map<String, List<Integer>> map = new HashMap<String, List<Integer>>();
```

### 菱形语法（Diamond Syntax）

```java
Map<String, List<Integer>> map = new HashMap<>();
// 编译器推导右侧类型参数
```

### 方法泛型的类型推导

```java
public static <T> List<T> asList(T... elements) {
    // ...
}

// 显式指定类型
List<String> list1 = Collections.<String>asList("a", "b");

// 类型推导
List<String> list2 = Collections.asList("a", "b");
```

### 目标类型推导（Java 8+）

```java
// 编译器从目标类型推导
List<String> list = Collections.emptyList();
// 等价于
List<String> list = Collections.<String>emptyList();
```

### 类型推导的限制

```java
// 编译错误：无法推导
var list = Collections.emptyList();

// 解决方案
List<String> list = Collections.emptyList();
// 或
var list = Collections.<String>emptyList();
```

---

## 易错点与边界行为

### 1. 上下界通配符的捕获

```java
void swap(List<?> list, int i, int j) {
    // list.set(i, list.get(j)); // 编译错误
    swapHelper(list, i, j);
}

private <T> void swapHelper(List<T> list, int i, int j) {
    T temp = list.get(i);
    list.set(i, list.get(j));
    list.set(j, temp);
}
```

**原因**：`List<?>` 的具体类型未知，通过辅助方法"捕获"具体类型。

### 2. 通配符的嵌套限制

```java
List<? extends List<? extends Number>> lists;
// 可以读取，但非常复杂
List<? extends Number> innerList = lists.get(0);
Number n = innerList.get(0);
```

### 3. 数组与通配符

```java
List<?>[] arrays = new List<?>[10]; // 允许
List<? extends Number>[] arrays2 = new List<?>[10]; // 允许

// 但仍然不能创建泛型数组
// List<String>[] stringLists = new List<String>[10]; // 编译错误
```

### 4. 通配符的类型擦除

```java
List<? extends Number> list1 = new ArrayList<>();
List<? super Integer> list2 = new ArrayList<>();

list1.getClass(); // ArrayList
list2.getClass(); // ArrayList（通配符擦除）
```

---

## 实际推导案例

### 案例：为什么 Arrays.asList 不支持基本类型？

```java
int[] arr = {1, 2, 3};
List<int[]> list = Arrays.asList(arr); // 整个数组作为一个元素

Integer[] arr2 = {1, 2, 3};
List<Integer> list2 = Arrays.asList(arr2); // 正确
```

**原因**：

```java
public static <T> List<T> asList(T... elements)
```

- `int` 是基本类型，不是对象
- `int[]` 是对象，但不是 `int` 的数组
- `Integer[]` 是对象数组，可以推导为 `T = Integer`

### 案例：Collections.max 的设计

```java
public static <T extends Comparable<? super T>> T max(Collection<? extends T> coll) {
    Iterator<? extends T> i = coll.iterator();
    T candidate = i.next();
    
    while (i.hasNext()) {
        T next = i.next();
        if (next.compareTo(candidate) > 0) {
            candidate = next;
        }
    }
    return candidate;
}
```

**设计解析**：

1. **`Collection<? extends T>`**：允许传入 `T` 的子类集合（PECS 生产者）
2. **`T extends Comparable<? super T>`**：允许 `T` 使用父类的比较逻辑
3. **返回 `T`**：保证返回类型与输入一致

```java
class Fruit implements Comparable<Fruit> { }
class Apple extends Fruit { }

List<Apple> apples = Arrays.asList(new Apple(), new Apple());
Apple max = Collections.max(apples); // 返回 Apple
```

---

## 关键点总结

1. **上界通配符 `<? extends T>`**：协变，只读语义，用于生产者
2. **下界通配符 `<? super T>`**：逆变，只写语义，用于消费者
3. **PECS 原则**：Producer Extends Consumer Super，指导通配符选择
4. **无界通配符 `<?>`**：表示未知类型，用于通用操作
5. **递归泛型**：自限定类型模式，保证方法返回子类类型
6. **类型推导**：菱形语法、目标类型推导简化泛型使用

---

## 深入一点

### 通配符的字节码表示

```java
List<? extends Number> list;
```

class 文件的 Signature 属性：

```
Ljava/util/List<+Ljava/lang/Number;>;
```

- `+` 表示上界（extends）
- `-` 表示下界（super）

### 类型推导算法

编译器使用**类型推断（Type Inference）**算法：

1. **收集约束**：分析赋值、参数传递、返回值
2. **求解约束**：找到满足所有约束的类型
3. **选择最具体类型**：优先选择子类

```java
<T> T choose(T a, T b) {
    return a;
}

choose("string", 42); // 推导为 Object（最近公共父类）
```

### 通配符捕获转换

```java
void reverse(List<?> list) {
    reverseHelper(list);
}

private <T> void reverseHelper(List<T> list) {
    // T 捕获了 ? 的具体类型
}
```

编译器执行**捕获转换（Capture Conversion）**，将 `?` 替换为一个新的类型变量 `T`。

---

## 参考资料

- 《Effective Java（第3版）》- Item 31：利用有限制通配符来提升 API 的灵活性
- 《Java 核心技术（卷I）》- 8.8 节通配符类型
- 《Java 泛型与集合》- Maurice Naftalin & Philip Wadler
- Oracle 官方教程：[Wildcards](https://docs.oracle.com/javase/tutorial/java/generics/wildcards.html)
- PECS 原则出处：Joshua Bloch 提出的助记符

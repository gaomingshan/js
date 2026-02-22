# 虚方法调用与多态实现

## 概述

Java 的多态性是通过虚方法调用（Virtual Method Invocation）实现的。编译期只能确定方法签名，运行时根据对象的实际类型动态查找方法实现。

理解虚方法调用的关键：
- **方法表（vtable）**：存储类的虚方法地址
- **方法调用指令**：invokevirtual、invokeinterface、invokespecial、invokestatic、invokedynamic
- **内联缓存**：优化虚方法调用的性能
- **去虚化**：JIT 将虚方法调用转为直接调用

本章聚焦多态的底层实现机制。

---

## 1. 方法调用的字节码指令

### 五种方法调用指令

**1. invokestatic**：调用静态方法

```java
Math.max(1, 2);
```

字节码：

```
invokestatic java/lang/Math.max(II)I
```

**特点**：编译期确定，无多态。

**2. invokespecial**：调用构造方法、私有方法、父类方法

```java
super.method();
this("<init>");
privateMethod();
```

字节码：

```
aload_0
invokespecial SuperClass.method()V
```

**特点**：编译期确定，无多态。

**3. invokevirtual**：调用虚方法（实例方法）

```java
obj.method();
```

字节码：

```
aload_1       // 加载 obj
invokevirtual ClassName.method()V
```

**特点**：运行时动态分派，支持多态。

**4. invokeinterface**：调用接口方法

```java
List<String> list = new ArrayList<>();
list.add("item");
```

字节码：

```
aload_1
ldc "item"
invokeinterface java/util/List.add(Ljava/lang/Object;)Z, 2
```

**特点**：运行时动态分派，支持多态，比 invokevirtual 慢（需要搜索接口方法表）。

**5. invokedynamic**：动态语言支持（Java 7+）

```java
Runnable r = () -> System.out.println("Hello");
```

字节码：

```
invokedynamic run()Ljava/lang/Runnable;
```

**特点**：首次调用时链接，后续调用直接使用 CallSite。

---

## 2. 虚方法表（vtable）的实现

### 虚方法表的结构

**父类**：

```java
class Animal {
    public void eat() { }      // vtable[0]
    public void sleep() { }    // vtable[1]
}
```

**子类**：

```java
class Dog extends Animal {
    @Override
    public void eat() { }      // vtable[0]（重写）
    public void bark() { }     // vtable[2]（新增）
}
```

**Dog 的虚方法表**：

```
vtable[0] = Dog.eat()        // 重写父类方法
vtable[1] = Animal.sleep()   // 继承父类方法
vtable[2] = Dog.bark()       // 子类新增方法
```

### 虚方法调用的流程

**源码**：

```java
Animal animal = new Dog();
animal.eat();
```

**字节码**：

```
new Dog
dup
invokespecial Dog.<init>
astore_1
aload_1
invokevirtual Animal.eat()V
```

**运行时步骤**：

1. 加载对象引用 `animal`
2. 从对象头获取 Klass Pointer
3. 从 Klass 获取 vtable
4. 根据方法偏移量（vtable[0]）查找实际方法
5. 调用 `Dog.eat()`

### 接口方法表（itable）

**接口方法的查找更复杂**：

```java
interface Flyable {
    void fly();
}

class Bird implements Flyable {
    public void fly() { }
}
```

**Bird 的 itable**：

```
itable[Flyable] = {
    fly() -> Bird.fly()
}
```

**调用流程**：

1. 根据接口类型查找 itable
2. 在 itable 中查找方法
3. 调用实际实现

**性能差异**：

- invokevirtual：直接索引 vtable，O(1)
- invokeinterface：搜索 itable，O(n)

---

## 3. 静态分派与动态分派

### 静态分派（重载）

**编译期决议**：

```java
class Dispatcher {
    void method(int a) { }
    void method(long a) { }
}

Dispatcher d = new Dispatcher();
d.method(1);    // 调用 method(int)
d.method(1L);   // 调用 method(long)
```

**字节码**：

```
aload_1
iconst_1
invokevirtual Dispatcher.method(I)V

aload_1
lconst_1
invokevirtual Dispatcher.method(J)V
```

**编译期根据参数类型确定方法签名。**

### 动态分派（重写）

**运行期决议**：

```java
class Animal {
    void sound() { System.out.println("Animal"); }
}

class Dog extends Animal {
    @Override
    void sound() { System.out.println("Dog"); }
}

Animal animal = new Dog();
animal.sound();  // 输出 "Dog"
```

**字节码**：

```
new Dog
dup
invokespecial Dog.<init>
astore_1
aload_1
invokevirtual Animal.sound()V
```

**运行时根据对象实际类型（Dog）查找方法。**

### 方法重载的优先级

**源码**：

```java
void method(int a) { System.out.println("int"); }
void method(long a) { System.out.println("long"); }
void method(Integer a) { System.out.println("Integer"); }
void method(Object a) { System.out.println("Object"); }
void method(int... a) { System.out.println("varargs"); }

method(1);
```

**匹配顺序**：

1. 精确匹配：`method(int)`
2. 基本类型提升：`method(long)`
3. 自动装箱：`method(Integer)`
4. 向上转型：`method(Object)`
5. 可变参数：`method(int...)`

**输出**：`"int"`

---

## 4. 内联缓存（Inline Cache）

### 单态内联缓存（Monomorphic）

**场景**：方法调用点总是调用同一个实现

```java
for (int i = 0; i < 10000; i++) {
    Dog dog = new Dog();
    dog.eat();  // 总是调用 Dog.eat()
}
```

**优化**：

JIT 将虚方法调用优化为直接调用：

```java
// 优化前
invokevirtual Animal.eat()

// 优化后（去虚化）
call Dog.eat()  // 直接调用，无需 vtable 查找
```

### 双态内联缓存（Bimorphic）

**场景**：方法调用点有两种实现

```java
List<Animal> animals = Arrays.asList(new Dog(), new Cat());
for (Animal animal : animals) {
    animal.eat();  // 调用 Dog.eat() 或 Cat.eat()
}
```

**优化**：

```java
if (animal.getClass() == Dog.class) {
    call Dog.eat()
} else if (animal.getClass() == Cat.class) {
    call Cat.eat()
} else {
    // 降级到虚方法调用
    invokevirtual Animal.eat()
}
```

### 多态内联缓存（Megamorphic）

**场景**：方法调用点有多种实现（通常 > 2）

```java
List<Animal> animals = Arrays.asList(new Dog(), new Cat(), new Bird(), ...);
for (Animal animal : animals) {
    animal.eat();  // 多种实现
}
```

**退化**：无法内联优化，使用虚方法调用。

**性能影响**：

- 单态：最快（直接调用）
- 双态：快（条件分支）
- 多态：慢（vtable 查找）

---

## 5. 方法内联与去虚化

### 方法内联

**条件**：

- 方法体较小（默认 < 35 字节码）
- 热点方法（频繁调用）

**示例**：

```java
int add(int a, int b) {
    return a + b;
}

int result = add(1, 2);
```

**内联后**：

```java
int result = 1 + 2;
```

**优势**：

- 消除方法调用开销
- 允许进一步优化（常量折叠）

### 去虚化（Devirtualization）

**条件**：

- 类是 final 的（无子类）
- 方法是 final 的（无重写）
- 运行时分析：调用点只有一种实现（单态）

**示例**：

```java
final class Dog extends Animal {
    @Override
    public void eat() { }
}

Animal animal = new Dog();
animal.eat();  // 可以去虚化
```

**优化**：

```
// 优化前
invokevirtual Animal.eat()

// 优化后
call Dog.eat()  // 直接调用
```

### CHA（Class Hierarchy Analysis）

**作用**：分析类继承关系，辅助去虚化

**示例**：

```java
class Animal {
    void eat() { }  // 当前无子类重写
}

Animal animal = getAnimal();
animal.eat();
```

**优化**：

JIT 假设 `Animal.eat()` 无重写，直接调用：

```java
call Animal.eat()
```

**守护条件**：

如果后续加载了 `Dog extends Animal` 并重写 `eat()`，则：

1. 触发去优化（Deoptimization）
2. 回退到虚方法调用
3. 重新编译

---

## 易错点与边界行为

### 1. 静态方法无多态

```java
class Animal {
    static void method() { System.out.println("Animal"); }
}

class Dog extends Animal {
    static void method() { System.out.println("Dog"); }
}

Animal animal = new Dog();
animal.method();  // 输出 "Animal"（静态方法）
```

**原因**：静态方法属于类，不属于对象，编译期绑定。

### 2. 私有方法无多态

```java
class Animal {
    private void method() { }
}

class Dog extends Animal {
    private void method() { }  // 不是重写，是新方法
}
```

**原因**：私有方法编译期绑定（invokespecial）。

### 3. final 方法无多态

```java
class Animal {
    final void method() { }
}

class Dog extends Animal {
    // void method() { }  // 编译错误：无法重写 final 方法
}
```

### 4. 构造方法中的虚方法调用

**危险代码**：

```java
class Parent {
    Parent() {
        init();  // 虚方法调用
    }
    
    void init() {
        System.out.println("Parent init");
    }
}

class Child extends Parent {
    private int value = 42;
    
    @Override
    void init() {
        System.out.println("Child init: " + value);  // 输出 0（字段未初始化）
    }
}

new Child();
```

**输出**：`"Child init: 0"`

**原因**：

1. 调用 `Child` 构造方法
2. 首先调用 `Parent()` 构造方法
3. `Parent()` 调用 `init()`，实际调用 `Child.init()`
4. 此时 `Child` 的字段尚未初始化，`value = 0`

### 5. 协变返回类型

**允许**：

```java
class Animal {
    Animal reproduce() {
        return new Animal();
    }
}

class Dog extends Animal {
    @Override
    Dog reproduce() {  // 返回类型是 Animal 的子类
        return new Dog();
    }
}
```

**字节码**：

编译器生成桥方法：

```java
// 用户方法
Dog reproduce() {
    return new Dog();
}

// 桥方法
Animal reproduce() {
    return reproduce();  // 调用上面的 Dog 版本
}
```

---

## 实际推导案例

### 案例：为什么接口调用比类方法调用慢？

**类方法调用**：

```java
ArrayList<String> list = new ArrayList<>();
list.add("item");  // invokevirtual
```

**接口方法调用**：

```java
List<String> list = new ArrayList<>();
list.add("item");  // invokeinterface
```

**性能差异**：

- `invokevirtual`：直接索引 vtable，O(1)
- `invokeinterface`：需要搜索 itable，查找接口方法表，O(n)

**JIT 优化**：

实际运行时，JIT 会内联和去虚化，性能差异不明显。

### 案例：为什么 final 类性能更好？

**非 final 类**：

```java
class Animal {
    void method() { }
}

Animal animal = getAnimal();
animal.method();  // invokevirtual（可能有子类）
```

**final 类**：

```java
final class Animal {
    void method() { }
}

Animal animal = getAnimal();
animal.method();  // 可以去虚化为直接调用
```

**原因**：

- final 类无子类，JIT 确定无重写
- 直接调用，无需 vtable 查找
- 可以内联优化

### 案例：Stream API 的性能陷阱

**问题代码**：

```java
List<String> list = Arrays.asList("a", "b", "c", ...);
list.stream()
    .map(s -> s.toUpperCase())
    .filter(s -> s.startsWith("A"))
    .collect(Collectors.toList());
```

**性能问题**：

- lambda 表达式创建对象（可能）
- 大量接口方法调用（invokeinterface）
- 难以内联优化（多态调用点）

**优化**：

```java
List<String> result = new ArrayList<>();
for (String s : list) {
    String upper = s.toUpperCase();
    if (upper.startsWith("A")) {
        result.add(upper);
    }
}
```

**性能提升**：传统循环比 Stream 快 2-5 倍（小数据集）。

**注意**：大数据集或并行流可能有不同结果。

---

## 关键点总结

1. **五种调用指令**：invokestatic、invokespecial、invokevirtual、invokeinterface、invokedynamic
2. **虚方法表**：存储类的虚方法地址，支持 O(1) 查找
3. **静态分派**：重载，编译期决议
4. **动态分派**：重写，运行期决议
5. **内联缓存**：单态最快，多态退化到虚方法调用
6. **去虚化**：final 类/方法、单态调用可优化为直接调用

---

## 深入一点

### vtable 的内存布局

**HotSpot 实现**：

```cpp
class InstanceKlass {
    Array<Method*>* _methods;        // 方法列表
    Array<Method*>* _vtable;         // 虚方法表
    Array<itableOffsetEntry>* _itable;  // 接口方法表
};
```

**vtable 初始化**：

1. 类加载时，解析父类的 vtable
2. 复制父类的 vtable
3. 子类重写的方法替换对应索引
4. 新增方法追加到 vtable 末尾

### JIT 的激进优化

**猜测优化（Speculative Optimization）**：

```java
Animal animal = getAnimal();
animal.eat();
```

**JIT 分析**：

- 99% 的情况返回 `Dog`
- 猜测假设：总是返回 `Dog`
- 优化：直接调用 `Dog.eat()`

**守护条件**：

```java
if (animal.getClass() != Dog.class) {
    deoptimize();  // 去优化，回退到解释执行
}
call Dog.eat();
```

**去优化开销**：

- 保存当前状态
- 回退到解释执行
- 重新收集信息
- 重新编译

### 查看 JIT 编译日志

**启用日志**：

```bash
java -XX:+PrintCompilation MyApp
```

**输出**：

```
    100    1       3       java.lang.String::hashCode (55 bytes)
    150    2       4       Demo::method (10 bytes)
```

- `100`：时间戳
- `1`：编译 ID
- `3`：优化级别（0-4）
- `java.lang.String::hashCode`：方法名
- `(55 bytes)`：字节码大小

**查看内联日志**：

```bash
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining MyApp
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 8.3 节方法调用
- 《Java 性能权威指南》- 第4章 JIT 编译器
- Oracle 官方文档：[JVM Instruction Set](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-6.html)
- Aleksey Shipilëv：[JVM Anatomy Quarks](https://shipilev.net/jvm/anatomy-quarks/)
- HotSpot 源码：`hotspot/share/oops/klassVtable.cpp`

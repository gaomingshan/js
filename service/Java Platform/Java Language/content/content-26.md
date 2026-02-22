# 类初始化顺序

## 概述

Java 类的初始化遵循严格的顺序规则。理解初始化顺序，能够避免空指针异常、变量未初始化等常见错误，同时掌握静态初始化、实例初始化、继承关系下的初始化流程。

本章聚焦：
- **静态初始化 vs 实例初始化**
- **父类与子类的初始化顺序**
- **实例变量与构造方法的执行顺序**
- **初始化顺序的典型陷阱**

---

## 1. 单个类的初始化顺序

### 完整顺序

**步骤**：

1. **静态变量声明与赋值**
2. **静态代码块**
3. **实例变量声明与赋值**
4. **实例代码块**
5. **构造方法**

### 示例

**源码**：

```java
class Demo {
    // 1. 静态变量
    static int staticVar = getStaticVar();
    
    // 2. 静态代码块
    static {
        System.out.println("静态代码块");
    }
    
    // 3. 实例变量
    int instanceVar = getInstanceVar();
    
    // 4. 实例代码块
    {
        System.out.println("实例代码块");
    }
    
    // 5. 构造方法
    Demo() {
        System.out.println("构造方法");
    }
    
    static int getStaticVar() {
        System.out.println("静态变量初始化");
        return 1;
    }
    
    int getInstanceVar() {
        System.out.println("实例变量初始化");
        return 2;
    }
}

new Demo();
```

**输出**：

```
静态变量初始化
静态代码块
实例变量初始化
实例代码块
构造方法
```

### 静态初始化只执行一次

**代码**：

```java
new Demo();
new Demo();
```

**输出**：

```
静态变量初始化
静态代码块
实例变量初始化
实例代码块
构造方法
实例变量初始化  // 第二次创建对象
实例代码块
构造方法
```

**静态初始化只执行一次**，后续创建对象只执行实例初始化。

---

## 2. 继承关系下的初始化顺序

### 父类与子类的初始化

**步骤**：

1. **父类静态初始化**（只一次）
2. **子类静态初始化**（只一次）
3. **父类实例初始化**
4. **父类构造方法**
5. **子类实例初始化**
6. **子类构造方法**

### 示例

**源码**：

```java
class Parent {
    static int parentStaticVar = getParentStaticVar();
    
    static {
        System.out.println("1. Parent 静态代码块");
    }
    
    int parentInstanceVar = getParentInstanceVar();
    
    {
        System.out.println("3. Parent 实例代码块");
    }
    
    Parent() {
        System.out.println("4. Parent 构造方法");
    }
    
    static int getParentStaticVar() {
        System.out.println("0. Parent 静态变量初始化");
        return 1;
    }
    
    int getParentInstanceVar() {
        System.out.println("2. Parent 实例变量初始化");
        return 2;
    }
}

class Child extends Parent {
    static int childStaticVar = getChildStaticVar();
    
    static {
        System.out.println("6. Child 静态代码块");
    }
    
    int childInstanceVar = getChildInstanceVar();
    
    {
        System.out.println("8. Child 实例代码块");
    }
    
    Child() {
        System.out.println("9. Child 构造方法");
    }
    
    static int getChildStaticVar() {
        System.out.println("5. Child 静态变量初始化");
        return 3;
    }
    
    int getChildInstanceVar() {
        System.out.println("7. Child 实例变量初始化");
        return 4;
    }
}

new Child();
```

**输出**：

```
0. Parent 静态变量初始化
1. Parent 静态代码块
5. Child 静态变量初始化
6. Child 静态代码块
2. Parent 实例变量初始化
3. Parent 实例代码块
4. Parent 构造方法
7. Child 实例变量初始化
8. Child 实例代码块
9. Child 构造方法
```

### 多次创建对象

**代码**：

```java
new Child();
new Child();
```

**输出**：

```
0. Parent 静态变量初始化
1. Parent 静态代码块
5. Child 静态变量初始化
6. Child 静态代码块
2. Parent 实例变量初始化
3. Parent 实例代码块
4. Parent 构造方法
7. Child 实例变量初始化
8. Child 实例代码块
9. Child 构造方法
2. Parent 实例变量初始化  // 第二次创建
3. Parent 实例代码块
4. Parent 构造方法
7. Child 实例变量初始化
8. Child 实例代码块
9. Child 构造方法
```

---

## 3. 构造方法链

### super() 的隐式调用

**源码**：

```java
class Parent {
    Parent() {
        System.out.println("Parent 构造方法");
    }
}

class Child extends Parent {
    Child() {
        // 隐式调用 super();
        System.out.println("Child 构造方法");
    }
}
```

**等价代码**：

```java
class Child extends Parent {
    Child() {
        super();  // 编译器自动插入
        System.out.println("Child 构造方法");
    }
}
```

### 显式调用 super()

**源码**：

```java
class Parent {
    Parent(int value) {
        System.out.println("Parent 构造方法: " + value);
    }
}

class Child extends Parent {
    Child() {
        super(10);  // 显式调用父类构造方法
        System.out.println("Child 构造方法");
    }
}
```

**输出**：

```
Parent 构造方法: 10
Child 构造方法
```

### super() 必须是第一条语句

**错误代码**：

```java
class Child extends Parent {
    Child() {
        System.out.println("Before super");
        super();  // 编译错误：super() 必须是第一条语句
    }
}
```

**原因**：

- 保证父类先初始化
- 子类才能安全使用父类成员

---

## 4. this() 构造方法重载

### this() 的使用

**源码**：

```java
class Demo {
    int value;
    String name;
    
    Demo() {
        this(0, "default");  // 调用另一个构造方法
    }
    
    Demo(int value) {
        this(value, "default");
    }
    
    Demo(int value, String name) {
        this.value = value;
        this.name = name;
        System.out.println("value=" + value + ", name=" + name);
    }
}

new Demo();
```

**输出**：

```
value=0, name=default
```

### this() 与 super() 的限制

**不能同时使用**：

```java
class Child extends Parent {
    Child() {
        super();  // 编译错误：this() 和 super() 只能有一个
        this(10);
    }
}
```

**原因**：

- `this()` 和 `super()` 都必须是第一条语句
- 只能选择其中一个

**解决方案**：

```java
class Child extends Parent {
    Child() {
        this(10);  // 调用另一个构造方法
    }
    
    Child(int value) {
        super();   // 调用父类构造方法
        System.out.println("value=" + value);
    }
}
```

---

## 5. 初始化顺序的典型陷阱

### 陷阱 1：构造方法中调用被重写的方法

**问题代码**：

```java
class Parent {
    Parent() {
        init();  // 调用被子类重写的方法
    }
    
    void init() {
        System.out.println("Parent init");
    }
}

class Child extends Parent {
    int value = 42;
    
    @Override
    void init() {
        System.out.println("Child init: value=" + value);
    }
}

new Child();
```

**输出**：

```
Child init: value=0
```

**原因**：

1. 父类构造方法先执行
2. 调用 `init()`，实际调用 `Child.init()`
3. 此时子类的实例变量尚未初始化，`value = 0`

**最佳实践**：避免在构造方法中调用可被重写的方法。

### 陷阱 2：静态变量初始化顺序

**问题代码**：

```java
class Demo {
    static Demo instance = new Demo();
    static int a = 1;
    static int b = 2;
    
    int x = 3;
    int y = 4;
    
    Demo() {
        System.out.println("a=" + a + ", b=" + b);
        System.out.println("x=" + x + ", y=" + y);
    }
}

public class Test {
    public static void main(String[] args) {
        Demo.instance.toString();
    }
}
```

**输出**：

```
a=0, b=0
x=3, y=4
```

**原因**：

**准备阶段**：

```java
instance = null;
a = 0;
b = 0;
```

**初始化阶段**：

```java
instance = new Demo();  // 第一行
  // 执行构造方法
  // 此时 a=0, b=0（还未初始化）
  // x=3, y=4（实例变量已初始化）
a = 1;  // 第二行（构造方法返回后才执行）
b = 2;  // 第三行
```

**解决方案**：调整静态变量顺序

```java
class Demo {
    static int a = 1;
    static int b = 2;
    static Demo instance = new Demo();  // 放在最后
}
```

### 陷阱 3：实例代码块的位置

**问题代码**：

```java
class Demo {
    int value = getValue();
    
    {
        System.out.println("实例代码块: value=" + value);
    }
    
    int getValue() {
        return 42;
    }
}

new Demo();
```

**输出**：

```
实例代码块: value=42
```

**如果调换顺序**：

```java
class Demo {
    {
        System.out.println("实例代码块: value=" + value);  // 编译错误：变量未初始化
    }
    
    int value = getValue();
}
```

**原因**：实例代码块按声明顺序执行。

### 陷阱 4：final 字段的初始化

**允许的初始化方式**：

**1. 声明时初始化**：

```java
class Demo {
    final int value = 10;
}
```

**2. 实例代码块初始化**：

```java
class Demo {
    final int value;
    
    {
        value = 10;
    }
}
```

**3. 构造方法初始化**：

```java
class Demo {
    final int value;
    
    Demo(int value) {
        this.value = value;
    }
}
```

**不允许的情况**：

```java
class Demo {
    final int value;  // 编译错误：final 字段未初始化
}
```

---

## 易错点与边界行为

### 1. 接口的静态初始化

**接口**：

```java
interface Demo {
    int VALUE = getValue();
    
    static int getValue() {
        System.out.println("接口静态方法");
        return 42;
    }
}
```

**初始化时机**：

```java
int x = Demo.VALUE;  // 触发接口初始化
```

**输出**：

```
接口静态方法
```

### 2. 枚举的初始化

**源码**：

```java
enum Color {
    RED(1), GREEN(2), BLUE(3);
    
    int value;
    
    Color(int value) {
        this.value = value;
        System.out.println("Color 构造方法: " + value);
    }
}

Color.RED.toString();
```

**输出**：

```
Color 构造方法: 1
Color 构造方法: 2
Color 构造方法: 3
```

**原因**：枚举实例在类加载时创建。

### 3. 匿名内部类的初始化

**源码**：

```java
Runnable r = new Runnable() {
    {
        System.out.println("匿名内部类实例代码块");
    }
    
    @Override
    public void run() {
        System.out.println("run");
    }
};
```

**输出**：

```
匿名内部类实例代码块
```

---

## 实际推导案例

### 案例：单例模式的初始化

**饿汉式**：

```java
class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    
    private Singleton() {
        System.out.println("Singleton 构造方法");
    }
    
    public static Singleton getInstance() {
        return INSTANCE;
    }
}

Singleton.getInstance();
```

**输出**：

```
Singleton 构造方法
```

**懒汉式（双重检查锁）**：

```java
class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {
        System.out.println("Singleton 构造方法");
    }
    
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

Singleton.getInstance();
```

**首次调用 getInstance() 时才初始化**。

**静态内部类**：

```java
class Singleton {
    private Singleton() {
        System.out.println("Singleton 构造方法");
    }
    
    private static class Holder {
        static final Singleton INSTANCE = new Singleton();
    }
    
    public static Singleton getInstance() {
        return Holder.INSTANCE;
    }
}

Singleton.getInstance();
```

**输出**：

```
Singleton 构造方法
```

**优势**：

- 延迟初始化（首次调用 getInstance() 时）
- 线程安全（类加载机制保证）
- 无需同步（性能好）

### 案例：初始化顺序测试

**源码**：

```java
class Base {
    static int baseStatic = getBaseStatic();
    int baseInstance = getBaseInstance();
    
    static {
        System.out.println("Base 静态代码块");
    }
    
    {
        System.out.println("Base 实例代码块");
    }
    
    Base() {
        System.out.println("Base 构造方法");
        method();
    }
    
    void method() {
        System.out.println("Base.method()");
    }
    
    static int getBaseStatic() {
        System.out.println("Base 静态变量初始化");
        return 1;
    }
    
    int getBaseInstance() {
        System.out.println("Base 实例变量初始化");
        return 2;
    }
}

class Derived extends Base {
    static int derivedStatic = getDerivedStatic();
    int derivedInstance = getDerivedInstance();
    
    static {
        System.out.println("Derived 静态代码块");
    }
    
    {
        System.out.println("Derived 实例代码块");
    }
    
    Derived() {
        System.out.println("Derived 构造方法");
    }
    
    @Override
    void method() {
        System.out.println("Derived.method(), derivedInstance=" + derivedInstance);
    }
    
    static int getDerivedStatic() {
        System.out.println("Derived 静态变量初始化");
        return 3;
    }
    
    int getDerivedInstance() {
        System.out.println("Derived 实例变量初始化");
        return 4;
    }
}

new Derived();
```

**输出**：

```
Base 静态变量初始化
Base 静态代码块
Derived 静态变量初始化
Derived 静态代码块
Base 实例变量初始化
Base 实例代码块
Base 构造方法
Derived.method(), derivedInstance=0  // 子类实例变量未初始化
Derived 实例变量初始化
Derived 实例代码块
Derived 构造方法
```

**关键点**：父类构造方法调用被重写的方法时，子类实例变量尚未初始化。

---

## 关键点总结

1. **单个类**：静态初始化 → 实例初始化 → 构造方法
2. **继承关系**：父类静态 → 子类静态 → 父类实例 → 父类构造 → 子类实例 → 子类构造
3. **静态初始化**：只执行一次
4. **实例初始化**：每次创建对象都执行
5. **super()**：隐式或显式调用，必须是第一条语句
6. **陷阱**：构造方法中调用被重写的方法

---

## 深入一点

### <init>() 方法的字节码

**源码**：

```java
class Demo {
    int a = 1;
    
    {
        System.out.println("实例代码块");
    }
    
    Demo() {
        System.out.println("构造方法");
    }
}
```

**<init>() 方法**：

```
<init>()V
  Code:
    aload_0
    invokespecial Object.<init>()V  // super()
    
    aload_0
    iconst_1
    putfield a:I  // a = 1
    
    getstatic System.out
    ldc "实例代码块"
    invokevirtual println  // 实例代码块
    
    getstatic System.out
    ldc "构造方法"
    invokevirtual println  // 构造方法
    
    return
```

**编译器将实例初始化代码插入到构造方法中**。

### <clinit>() 方法的字节码

**源码**：

```java
class Demo {
    static int a = 1;
    
    static {
        System.out.println("静态代码块");
    }
}
```

**<clinit>() 方法**：

```
<clinit>()V
  Code:
    iconst_1
    putstatic a:I  // a = 1
    
    getstatic System.out
    ldc "静态代码块"
    invokevirtual println  // 静态代码块
    
    return
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 7.3 节类加载的过程
- 《Effective Java（第3版）》- Item 3：用私有构造方法或枚举类型强化 Singleton 属性
- 《Java 核心技术（卷I）》- 第5章继承
- JLS §12.5：Creation of New Class Instances

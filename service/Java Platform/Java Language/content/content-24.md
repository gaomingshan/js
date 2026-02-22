# 类加载的五个阶段

## 概述

类加载是 JVM 将 class 文件加载到内存并转换为运行时数据结构的过程。理解类加载的生命周期，是掌握类初始化时机、静态变量加载顺序、类加载器工作原理的基础。

**类加载的五个阶段**：
1. **加载（Loading）**
2. **验证（Verification）**
3. **准备（Preparation）**
4. **解析（Resolution）**
5. **初始化（Initialization）**

本章聚焦各阶段的具体工作与时序关系。

---

## 1. 加载（Loading）

### 定义

**加载**：将 class 文件的二进制字节流读入内存

### 三个步骤

**1. 获取 class 文件的二进制流**

来源：
- 本地 .class 文件
- JAR / WAR / EAR 包
- 网络（Applet）
- 运行时动态生成（动态代理）
- 数据库（JSP）

**2. 转换为方法区的运行时数据结构**

存储内容：
- 类型信息（类名、父类、接口）
- 字段信息
- 方法信息
- 常量池

**3. 在堆中生成 Class 对象**

作为方法区数据的访问入口：

```java
Class<?> clazz = String.class;  // 堆中的 Class 对象
```

### 类加载的时机

**主动引用（触发类加载）**：

1. **new 指令**：

```java
Demo obj = new Demo();
```

2. **访问静态字段**：

```java
int value = Demo.staticField;
```

3. **调用静态方法**：

```java
Demo.staticMethod();
```

4. **反射调用**：

```java
Class.forName("Demo");
```

5. **初始化子类**：

先初始化父类

6. **main 方法所在类**：

启动时加载

**被动引用（不触发类加载）**：

1. **通过子类引用父类静态字段**：

```java
class Parent {
    static int value = 1;
}

class Child extends Parent { }

int x = Child.value;  // 只加载 Parent，不加载 Child
```

2. **数组定义**：

```java
Demo[] arr = new Demo[10];  // 不触发 Demo 的加载
```

3. **常量引用**：

```java
class Constants {
    static final String NAME = "Demo";
}

String s = Constants.NAME;  // 不触发 Constants 的加载（常量在编译期已内联）
```

---

## 2. 验证（Verification）

### 目的

确保 class 文件符合 JVM 规范，保证安全性

### 四个验证阶段

**1. 文件格式验证**

检查项：
- 魔数是否为 0xCAFEBABE
- 版本号是否在当前 JVM 支持范围
- 常量池是否有不支持的常量类型

**2. 元数据验证**

检查项：
- 类是否有父类（除 Object 外）
- 父类是否为 final 类
- 接口的方法是否都被实现

**3. 字节码验证**

检查项：
- 操作数栈的数据类型与指令匹配
- 跳转指令的目标是否合法
- 方法的返回值类型正确

**示例**：

```java
// 非法字节码
iload_1    // 加载 int
astore_2   // 存储为引用（类型不匹配）
```

**4. 符号引用验证**

检查项：
- 符号引用的类、字段、方法是否存在
- 访问权限是否合法

**示例**：

```java
class Demo {
    void method() {
        NonExistentClass.method();  // 符号引用验证失败
    }
}
```

### 跳过验证

**参数**：

```bash
-Xverify:none  # 跳过验证（提升启动速度，不推荐）
```

---

## 3. 准备（Preparation）

### 定义

为类的**静态变量**分配内存并设置**默认初始值**

### 分配位置

**Java 7 及之前**：

- 静态变量在方法区（永久代）

**Java 8+**：

- 静态变量在堆中

### 默认初始值

**基本类型**：

| 类型    | 默认值 |
| ------- | ------ |
| byte    | 0      |
| short   | 0      |
| int     | 0      |
| long    | 0L     |
| float   | 0.0f   |
| double  | 0.0    |
| char    | '\u0000' |
| boolean | false  |

**引用类型**：

```java
static Object obj;  // 默认值：null
```

### 示例

**源码**：

```java
class Demo {
    static int value = 123;
}
```

**准备阶段**：

```java
value = 0;  // 设置默认值
```

**初始化阶段**：

```java
value = 123;  // 执行初始化代码
```

### 常量的特殊处理

**编译期常量**：

```java
static final int VALUE = 123;
```

**准备阶段**：

```java
VALUE = 123;  // 直接设置为常量值
```

**原因**：

- 常量值已在编译期确定
- 存储在常量池中
- 准备阶段直接赋值

**非编译期常量**：

```java
static final int VALUE = new Random().nextInt();
```

**准备阶段**：

```java
VALUE = 0;  // 仍设置为默认值
```

**初始化阶段**：

```java
VALUE = new Random().nextInt();  // 执行初始化代码
```

---

## 4. 解析（Resolution）

### 定义

将常量池的**符号引用**替换为**直接引用**

### 符号引用 vs 直接引用

**符号引用**：

```
Methodref #3  // java/lang/String.length:()I
```

**直接引用**：

```
0x00007f8a3c001000  // 方法的内存地址
```

### 解析的对象

1. **类或接口**：CONSTANT_Class
2. **字段**：CONSTANT_Fieldref
3. **方法**：CONSTANT_Methodref
4. **接口方法**：CONSTANT_InterfaceMethodref

### 解析的时机

**类加载时**：部分解析

**首次使用时**：延迟解析（方法调用）

**示例**：

```java
class Demo {
    void method() {
        System.out.println("Hello");
    }
}
```

**加载 Demo 类时**：

- 解析 `System` 类的引用
- **不解析** `println` 方法的引用

**首次调用 method() 时**：

- 解析 `println` 方法的引用

### 解析的缓存

**解析结果会被缓存**：

- 第一次解析后，结果存储在常量池
- 后续调用直接使用缓存结果

---

## 5. 初始化（Initialization）

### 定义

执行类构造器 `<clinit>()` 方法

### <clinit>() 方法的生成

**编译器自动收集**：

1. 静态变量的赋值语句
2. 静态代码块

**示例**：

**源码**：

```java
class Demo {
    static int a = 1;
    static int b;
    
    static {
        b = 2;
    }
}
```

**<clinit>() 方法**：

```java
static void <clinit>() {
    a = 1;
    b = 2;
}
```

### 初始化顺序

**1. 父类先于子类初始化**：

```java
class Parent {
    static {
        System.out.println("Parent init");
    }
}

class Child extends Parent {
    static {
        System.out.println("Child init");
    }
}

new Child();
```

**输出**：

```
Parent init
Child init
```

**2. 按代码顺序执行**：

```java
class Demo {
    static int a = getA();
    static int b = getB();
    
    static int getA() {
        System.out.println("getA");
        return 1;
    }
    
    static int getB() {
        System.out.println("getB");
        return 2;
    }
}
```

**输出**：

```
getA
getB
```

### 初始化的线程安全

**JVM 保证 <clinit>() 只执行一次**：

```java
// 线程 1
Class.forName("Demo");

// 线程 2
Class.forName("Demo");
```

**流程**：

1. 线程 1 开始执行 `<clinit>()`，获取锁
2. 线程 2 尝试执行 `<clinit>()`，等待线程 1 完成
3. 线程 1 完成，释放锁
4. 线程 2 发现已初始化，直接返回

### 初始化的死锁

**问题代码**：

```java
class A {
    static {
        B.method();
    }
}

class B {
    static {
        A.method();
    }
}

// 线程 1
new A();

// 线程 2
new B();
```

**死锁流程**：

```
线程 1：初始化 A，等待 B 初始化完成
线程 2：初始化 B，等待 A 初始化完成
```

**结果**：死锁

---

## 易错点与边界行为

### 1. 接口的初始化

**接口没有静态代码块**：

```java
interface Demo {
    int VALUE = 1;  // 隐式 static final
}
```

**初始化时机**：

- 首次访问接口字段时
- **不要求**父接口已初始化

### 2. 数组类的特殊性

**数组类没有 <clinit>() 方法**：

```java
String[] arr = new String[10];
```

**不触发 String 类的初始化**。

### 3. 常量的内联

**编译期常量**：

```java
class Constants {
    static final int VALUE = 123;
}

int x = Constants.VALUE;
```

**编译后**：

```java
int x = 123;  // 常量被内联，不触发 Constants 的加载
```

### 4. 反射触发初始化

**Class.forName()**：

```java
Class.forName("Demo");  // 触发初始化
```

**ClassLoader.loadClass()**：

```java
ClassLoader.getSystemClassLoader().loadClass("Demo");  // 不触发初始化
```

**区别**：

```java
// Class.forName() 的第二个参数控制是否初始化
Class.forName("Demo", false, classLoader);  // 不初始化
```

---

## 实际推导案例

### 案例：静态变量的初始化顺序

**源码**：

```java
class Demo {
    static int a = 1;
    static Demo instance = new Demo();
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
a=1, b=0
x=3, y=4
```

**解析**：

**准备阶段**：

```java
a = 0;
instance = null;
b = 0;
```

**初始化阶段**：

```java
a = 1;                    // 第一行
instance = new Demo();    // 第二行
  // 执行构造方法
  // 此时 a=1, b=0（b 还未初始化）
  // x=3, y=4（实例变量已初始化）
b = 2;                    // 第三行（构造方法返回后才执行）
```

### 案例：类加载的时机

**源码**：

```java
class Parent {
    static int value = 1;
    static {
        System.out.println("Parent init");
    }
}

class Child extends Parent {
    static int childValue = 2;
    static {
        System.out.println("Child init");
    }
}

public class Test {
    public static void main(String[] args) {
        System.out.println(Child.value);
    }
}
```

**输出**：

```
Parent init
1
```

**解析**：

- 访问 `Child.value`
- `value` 是 `Parent` 的字段
- 只触发 `Parent` 的初始化
- **不触发** `Child` 的初始化

---

## 关键点总结

1. **加载**：读取 class 文件，生成 Class 对象
2. **验证**：确保 class 文件符合规范
3. **准备**：为静态变量分配内存，设置默认值
4. **解析**：符号引用 → 直接引用
5. **初始化**：执行 <clinit>() 方法，按代码顺序初始化静态变量
6. **线程安全**：JVM 保证 <clinit>() 只执行一次

---

## 深入一点

### 查看类加载日志

**启用日志**：

```bash
java -Xlog:class+load=info MyApp
```

**输出**：

```
[0.123s][info][class,load] java.lang.Object source: jrt:/java.base
[0.124s][info][class,load] java.lang.String source: jrt:/java.base
[0.125s][info][class,load] Demo source: file:/path/to/Demo.class
```

### 使用 jstack 检测类加载死锁

**命令**：

```bash
jstack <pid>
```

**输出**：

```
"Thread-1" waiting for monitor entry [0x00007f8a3c000000]
   java.lang.Thread.State: BLOCKED (on object monitor)
        at ClassA.<clinit>()
        - waiting to lock <0x00000000d5f10000> (a java.lang.Class for ClassB)

"Thread-2" waiting for monitor entry [0x00007f8a3d000000]
   java.lang.Thread.State: BLOCKED (on object monitor)
        at ClassB.<clinit>()
        - waiting to lock <0x00000000d5f20000> (a java.lang.Class for ClassA)
```

**结论**：类加载死锁

### <clinit>() 方法的字节码

**源码**：

```java
class Demo {
    static int value = 123;
}
```

**字节码**：

```
static {};
  descriptor: ()V
  flags: ACC_STATIC
  Code:
    stack=1, locals=0, args_size=0
       0: bipush        123
       2: putstatic     #2  // Field value:I
       5: return
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 第7章类加载机制
- 《Java 虚拟机规范（Java SE 8）》- 第5章加载、链接与初始化
- Oracle 官方文档：[Class Loading](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-5.html)
- 工具：javap、jstack

# 内部类与闭包捕获机制

## 概述

Java 的内部类（Inner Class）机制允许在一个类内部定义另一个类。编译器为内部类生成独立的 class 文件，并通过特殊的字节码机制实现对外部类的访问。

本章聚焦内部类的编译期处理：
- **匿名内部类的字节码结构**
- **捕获外部变量的 final 要求**
- **内部类访问外部类的桥接机制**
- **静态内部类 vs 非静态内部类**
- **局部变量捕获的拷贝机制**

---

## 1. 匿名内部类的字节码结构

### 基本示例

**源码**：

```java
public class Outer {
    public void test() {
        Runnable r = new Runnable() {
            @Override
            public void run() {
                System.out.println("Running");
            }
        };
        r.run();
    }
}
```

**编译后生成两个 class 文件**：

```
Outer.class
Outer$1.class  // 匿名内部类
```

**Outer$1.class 的等价代码**：

```java
class Outer$1 implements Runnable {
    final Outer this$0; // 持有外部类引用
    
    Outer$1(Outer outer) {
        this.this$0 = outer;
    }
    
    public void run() {
        System.out.println("Running");
    }
}
```

### 字节码结构

**Outer.class 的 test 方法**：

```
new Outer$1
dup
aload_0          // 传递 this（外部类引用）
invokespecial Outer$1.<init>(LOuter;)V
astore_1
aload_1
invokeinterface Runnable.run()V
```

**Outer$1.class 的构造方法**：

```
aload_0
aload_1          // 外部类引用
putfield this$0  // 存储外部类引用
```

---

## 2. 捕获外部变量的 final 要求

### 为什么局部变量必须是 final？

**源码**：

```java
void method() {
    int x = 10;
    Runnable r = new Runnable() {
        public void run() {
            System.out.println(x); // 捕获外部变量
        }
    };
    // x = 20; // 如果修改 x，编译错误
    r.run();
}
```

**编译后的内部类**：

```java
class Outer$1 implements Runnable {
    final Outer this$0;
    final int val$x; // 捕获的局部变量
    
    Outer$1(Outer outer, int x) {
        this.this$0 = outer;
        this.val$x = x; // 拷贝值
    }
    
    public void run() {
        System.out.println(val$x); // 使用拷贝的值
    }
}
```

### 拷贝机制导致的问题

**如果允许修改外部变量**：

```java
int x = 10;
Runnable r = new Runnable() {
    public void run() {
        System.out.println(x); // 打印内部类拷贝的值
    }
};
x = 20; // 修改外部变量
r.run(); // 输出 10 还是 20？
```

**结果**：内部类输出 `10`（拷贝的值），而外部变量是 `20`。

**结论**：为避免混淆，Java 要求捕获的局部变量必须是 final（或 effectively final）。

### Effectively Final（Java 8+）

Java 8 后，局部变量不需要显式声明 `final`，只要事实上不被修改即可：

```java
int x = 10; // 没有 final 关键字
Runnable r = new Runnable() {
    public void run() {
        System.out.println(x); // 允许，x 是 effectively final
    }
};
// x = 20; // 如果取消注释，编译错误
```

---

## 3. 内部类访问外部类的桥接

### 访问外部类的私有成员

**源码**：

```java
public class Outer {
    private int value = 42;
    
    class Inner {
        void printValue() {
            System.out.println(value); // 访问外部类私有字段
        }
    }
}
```

**问题**：内部类是独立的类，无法直接访问外部类的 `private` 成员。

**解决方案**：编译器生成桥接方法（synthetic accessor）

**Outer.class 生成的桥接方法**：

```java
// 编译器生成的 package-private 方法
static int access$000(Outer outer) {
    return outer.value;
}
```

**Inner.class 调用桥接方法**：

```java
class Inner {
    final Outer this$0;
    
    void printValue() {
        System.out.println(Outer.access$000(this$0));
    }
}
```

### 字节码验证

**Inner.printValue 的字节码**：

```
getstatic System.out
aload_0
getfield this$0
invokestatic Outer.access$000(LOuter;)I  // 调用桥接方法
invokevirtual PrintStream.println(I)V
```

**Outer.access$000 的字节码**：

```
aload_0
getfield value  // 访问私有字段
ireturn
```

---

## 4. 静态内部类 vs 非静态内部类

### 非静态内部类（成员内部类）

**持有外部类引用**：

```java
public class Outer {
    private int value = 10;
    
    class Inner {
        void print() {
            System.out.println(value); // 访问外部类字段
        }
    }
    
    void test() {
        Inner inner = new Inner(); // 隐式传递 this
    }
}
```

**编译后**：

```java
class Inner {
    final Outer this$0; // 持有外部类引用
    
    Inner(Outer outer) {
        this.this$0 = outer;
    }
    
    void print() {
        System.out.println(Outer.access$000(this$0));
    }
}

// Outer.test 方法
void test() {
    Inner inner = new Inner(this); // 显式传递 this
}
```

### 静态内部类

**不持有外部类引用**：

```java
public class Outer {
    private static int value = 10;
    
    static class StaticInner {
        void print() {
            System.out.println(value); // 访问静态字段
        }
    }
    
    void test() {
        StaticInner inner = new StaticInner(); // 无需传递 this
    }
}
```

**编译后**：

```java
class StaticInner {
    // 没有 this$0 字段
    
    void print() {
        System.out.println(Outer.value);
    }
}
```

### 内存占用对比

**非静态内部类**：

- 每个实例多占用 4-8 字节（`this$0` 引用）
- 可能导致外部类无法被 GC（内部类持有引用）

**静态内部类**：

- 无额外内存占用
- 不影响外部类的 GC

**最佳实践**：如果不需要访问外部类实例，优先使用静态内部类。

---

## 5. 局部变量捕获的拷贝机制

### 基本类型的捕获

**源码**：

```java
void method() {
    int x = 10;
    Runnable r = new Runnable() {
        public void run() {
            System.out.println(x);
        }
    };
}
```

**编译后的构造方法**：

```java
Outer$1(Outer outer, int x) {
    this.this$0 = outer;
    this.val$x = x; // 按值拷贝
}
```

**字节码**：

```
new Outer$1
dup
aload_0      // this
iload_1      // x
invokespecial Outer$1.<init>(LOuter;I)V
```

### 引用类型的捕获

**源码**：

```java
void method() {
    List<String> list = new ArrayList<>();
    Runnable r = new Runnable() {
        public void run() {
            list.add("item"); // 修改列表内容（允许）
        }
    };
}
```

**编译后**：

```java
class Outer$1 {
    final List val$list; // 拷贝引用
    
    Outer$1(Outer outer, List list) {
        this.val$list = list; // 引用拷贝
    }
    
    public void run() {
        val$list.add("item"); // 引用指向同一对象
    }
}
```

**关键**：

- 引用本身不可变（`final`）
- 对象内容可变

### this 引用的捕获

**源码**：

```java
class Outer {
    int value = 10;
    
    void method() {
        Runnable r = new Runnable() {
            public void run() {
                System.out.println(value); // 访问外部类字段
            }
        };
    }
}
```

**编译后**：

```java
class Outer$1 {
    final Outer this$0; // 捕获外部类 this
    
    Outer$1(Outer outer) {
        this.this$0 = outer;
    }
    
    public void run() {
        System.out.println(Outer.access$000(this$0));
    }
}
```

---

## 易错点与边界行为

### 1. 内部类的内存泄漏

**问题代码**：

```java
public class Activity {
    void startTask() {
        new Thread(new Runnable() {
            public void run() {
                // 长时间运行的任务
                heavyWork();
            }
        }).start();
    }
}
```

**问题**：

- 匿名内部类持有 `Activity` 的引用（`this$0`）
- 即使 `Activity` 不再使用，线程仍持有引用
- `Activity` 无法被 GC，导致内存泄漏

**解决方案**：使用静态内部类

```java
public class Activity {
    void startTask() {
        new Thread(new Task()).start();
    }
    
    static class Task implements Runnable {
        public void run() {
            heavyWork();
        }
    }
}
```

### 2. 多层嵌套的内部类

**源码**：

```java
class Outer {
    class Inner1 {
        class Inner2 {
            void method() {
                System.out.println(Outer.this.value);
            }
        }
    }
}
```

**编译后**：

```java
class Outer$Inner1$Inner2 {
    final Outer$Inner1 this$1; // 持有 Inner1 引用
    
    Outer$Inner1$Inner2(Outer$Inner1 inner1) {
        this.this$1 = inner1;
    }
    
    void method() {
        // Outer.this.value
        Outer outer = this$1.this$0;
        System.out.println(Outer.access$000(outer));
    }
}
```

### 3. 序列化内部类的陷阱

**问题**：非静态内部类序列化时会序列化外部类

```java
class Outer implements Serializable {
    int value = 10;
    
    class Inner implements Serializable {
        int innerValue = 20;
    }
}

Outer outer = new Outer();
Inner inner = outer.new Inner();

// 序列化 inner 时，outer 也被序列化
ObjectOutputStream oos = new ObjectOutputStream(fos);
oos.writeObject(inner);
```

**解决方案**：使用静态内部类或单独的类。

---

## 实际推导案例

### 案例：Android Handler 内存泄漏

**问题代码**：

```java
public class MainActivity extends Activity {
    private Handler handler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            // 处理消息
        }
    };
}
```

**内存泄漏原因**：

1. 匿名内部类持有 `MainActivity` 引用
2. Handler 被加入消息队列（静态成员）
3. 消息队列持有 Handler
4. Handler 持有 Activity
5. Activity 无法被 GC

**解决方案**：

```java
public class MainActivity extends Activity {
    private static class MyHandler extends Handler {
        private final WeakReference<MainActivity> activityRef;
        
        MyHandler(MainActivity activity) {
            this.activityRef = new WeakReference<>(activity);
        }
        
        @Override
        public void handleMessage(Message msg) {
            MainActivity activity = activityRef.get();
            if (activity != null) {
                // 处理消息
            }
        }
    }
    
    private Handler handler = new MyHandler(this);
}
```

### 案例：为什么 lambda 不一定创建内部类？

**无捕获的 lambda**：

```java
Runnable r = () -> System.out.println("Hello");
```

编译器可以复用同一个实例（类似单例）。

**有捕获的 lambda**：

```java
int x = 10;
Runnable r = () -> System.out.println(x);
```

每次创建新的实例（捕获变量不同）。

---

## 关键点总结

1. **匿名内部类**：生成独立 class 文件，持有外部类引用（`this$0`）
2. **final 要求**：局部变量按值拷贝，必须 final 避免混淆
3. **桥接方法**：编译器生成 `access$` 方法访问私有成员
4. **静态内部类**：不持有外部类引用，避免内存泄漏
5. **拷贝机制**：基本类型按值拷贝，引用类型拷贝引用

---

## 深入一点

### 内部类的命名规则

| 内部类类型   | 命名规则           | 示例            |
| ------------ | ------------------ | --------------- |
| 成员内部类   | `Outer$Inner`      | `Outer$Inner`   |
| 匿名内部类   | `Outer$数字`       | `Outer$1`       |
| 局部内部类   | `Outer$数字类名`   | `Outer$1Local`  |
| 多层嵌套     | `Outer$A$B`        | `Outer$A$B`     |

### 字节码标志

内部类的 class 文件包含特殊属性：

```
InnerClasses:
  Outer$Inner = class Outer$Inner of class Outer
    flags: ACC_PRIVATE
```

### 编译器生成的桥接方法规则

**访问私有字段**：

```java
static int access$000(Outer outer) {
    return outer.privateField;
}
```

**访问私有方法**：

```java
static void access$100(Outer outer, int arg) {
    outer.privateMethod(arg);
}
```

**修改私有字段**：

```java
static int access$200(Outer outer, int value) {
    return outer.privateField = value;
}
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 10.3.2 节内部类的编译
- 《Effective Java（第3版）》- Item 24：优先使用静态内部类
- 《Java 核心技术（卷I）》- 第6章接口、lambda 表达式与内部类
- JLS §15.9.5：Anonymous Class Declarations

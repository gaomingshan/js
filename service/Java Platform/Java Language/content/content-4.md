# Object 根类的核心方法

## 概述

`Object` 类是 Java 类型体系的根，定义了所有对象的基础协议。理解 Object 的核心方法，不仅是掌握 Java API，更是理解对象模型、内存管理、并发机制的关键。

Object 提供了 5 个核心方法，每个都有深层次的设计考量：

1. **equals/hashCode**：对象相等性与哈希契约
2. **toString**：对象的字符串表示
3. **clone**：对象拷贝与深浅拷贝
4. **finalize**：对象销毁前的清理（已废弃）
5. **getClass**：反射的入口

本章深入解析这些方法的实现原理、使用陷阱和最佳实践。

---

## 1. equals 与 hashCode 的设计契约

### equals 的默认实现

```java
public class Object {
    public boolean equals(Object obj) {
        return (this == obj); // 比较引用地址
    }
}
```

**默认行为**：只有指向同一对象时才相等。

### 重写 equals 的契约

《Java 语言规范》定义了 equals 的5个性质：

1. **自反性**：`x.equals(x)` 必须为 true
2. **对称性**：`x.equals(y)` 为 true 时，`y.equals(x)` 也必须为 true
3. **传递性**：`x.equals(y)` 且 `y.equals(z)` 为 true 时，`x.equals(z)` 也必须为 true
4. **一致性**：多次调用 `x.equals(y)` 结果一致（对象未修改）
5. **非空性**：`x.equals(null)` 必须为 false

### 正确重写 equals

```java
class Point {
    private final int x;
    private final int y;
    
    @Override
    public boolean equals(Object obj) {
        // 1. 检查引用相等（性能优化）
        if (this == obj) return true;
        
        // 2. 检查 null 和类型
        if (!(obj instanceof Point)) return false;
        
        // 3. 类型转换
        Point other = (Point) obj;
        
        // 4. 比较字段
        return x == other.x && y == other.y;
    }
}
```

### hashCode 的契约

**核心契约**：如果 `a.equals(b)` 为 true，则 `a.hashCode() == b.hashCode()` 必须为 true。

**反过来不成立**：hashCode 相等不代表 equals 相等（哈希冲突）。

### 为什么必须同时重写 equals 和 hashCode？

```java
class Point {
    int x, y;
    
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Point)) return false;
        Point p = (Point) obj;
        return x == p.x && y == p.y;
    }
    
    // 忘记重写 hashCode
}

// 使用 HashMap
Map<Point, String> map = new HashMap<>();
Point p1 = new Point(1, 2);
map.put(p1, "A");

Point p2 = new Point(1, 2);
map.get(p2); // 返回 null！
```

**原因**：HashMap 先比较 hashCode，再比较 equals。p1 和 p2 的 hashCode 不同（默认基于内存地址），导致查找失败。

### 正确重写 hashCode

```java
class Point {
    private final int x;
    private final int y;
    
    @Override
    public int hashCode() {
        return Objects.hash(x, y); // 使用工具方法
    }
    
    // 或者手动实现
    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + x;
        result = 31 * result + y;
        return result;
    }
}
```

**为什么使用质数 31？**

1. 质数减少哈希冲突
2. 31 = 32 - 1，JVM 优化为位移：`31 * i == (i << 5) - i`

### hashCode 分布对性能的影响

**糟糕的 hashCode 实现**：

```java
@Override
public int hashCode() {
    return 42; // 所有对象哈希值相同
}
```

HashMap 退化为链表，时间复杂度从 O(1) 退化为 O(n)。

**良好的 hashCode 实现**：

```java
@Override
public int hashCode() {
    return Objects.hash(field1, field2, field3); // 分布均匀
}
```

---

## 2. toString 的重写与调试

### 默认实现

```java
public String toString() {
    return getClass().getName() + "@" + Integer.toHexString(hashCode());
}
```

示例输出：`Point@15db9742`

### 重写 toString 的价值

```java
class Point {
    int x, y;
    
    @Override
    public String toString() {
        return "Point{x=" + x + ", y=" + y + "}";
    }
}

Point p = new Point(1, 2);
System.out.println(p); // Point{x=1, y=2}
```

**调试优势**：

- 日志输出清晰
- 单元测试断言友好
- 异常堆栈信息可读

### 使用 StringBuilder 避免性能问题

```java
// 低效实现
@Override
public String toString() {
    return "Point{x=" + x + ", y=" + y + "}"; // 多次字符串拼接
}

// 高效实现
@Override
public String toString() {
    return new StringBuilder("Point{x=")
        .append(x)
        .append(", y=")
        .append(y)
        .append("}")
        .toString();
}
```

编译器会自动优化简单的字符串拼接，但复杂场景建议显式使用 StringBuilder。

---

## 3. clone 方法与深浅拷贝

### clone 的默认实现

```java
protected native Object clone() throws CloneNotSupportedException;
```

**特点**：

1. `protected` 修饰，子类需要重写为 `public`
2. 必须实现 `Cloneable` 接口，否则抛出 `CloneNotSupportedException`
3. 默认是**浅拷贝**

### 浅拷贝的陷阱

```java
class Person implements Cloneable {
    String name;
    int[] scores;
    
    @Override
    public Person clone() throws CloneNotSupportedException {
        return (Person) super.clone();
    }
}

Person p1 = new Person();
p1.name = "Alice";
p1.scores = new int[]{90, 85};

Person p2 = p1.clone();
p2.scores[0] = 100;

System.out.println(p1.scores[0]); // 输出 100（引用共享）
```

**原因**：`Object.clone()` 按位复制字段，引用类型只复制引用，不复制对象。

### 深拷贝的实现

**方法1：递归调用 clone**

```java
class Person implements Cloneable {
    String name; // String 不可变，无需深拷贝
    int[] scores;
    
    @Override
    public Person clone() throws CloneNotSupportedException {
        Person cloned = (Person) super.clone();
        cloned.scores = scores.clone(); // 数组深拷贝
        return cloned;
    }
}
```

**方法2：序列化/反序列化**

```java
class Person implements Serializable {
    String name;
    int[] scores;
    
    public Person deepClone() {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(bos)) {
            oos.writeObject(this);
            
            try (ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());
                 ObjectInputStream ois = new ObjectInputStream(bis)) {
                return (Person) ois.readObject();
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

**方法3：使用拷贝构造器（推荐）**

```java
class Person {
    String name;
    int[] scores;
    
    public Person(Person other) {
        this.name = other.name;
        this.scores = other.scores.clone();
    }
}

Person p2 = new Person(p1); // 深拷贝
```

### clone 的替代方案

《Effective Java》建议：**优先使用拷贝构造器或拷贝工厂方法**。

```java
// 拷贝构造器
public Person(Person other) { ... }

// 拷贝工厂方法
public static Person newInstance(Person other) { ... }
```

**优势**：

- 不依赖脆弱的 Cloneable 机制
- 不抛出受检异常
- 不依赖风险高的 native 方法
- 不破坏 final 字段的约束

---

## 4. finalize 的废弃与替代方案

### finalize 的设计初衷

```java
protected void finalize() throws Throwable {
    // 对象被 GC 回收前调用
}
```

**用途**：释放非 Java 资源（如文件句柄、数据库连接）。

### finalize 的问题

**1. 不确定的调用时机**

```java
class Resource {
    @Override
    protected void finalize() {
        System.out.println("Finalizing");
    }
}

new Resource();
System.gc(); // 不保证立即调用 finalize
```

**2. 性能开销**

对象需要经过两次 GC 才能回收：

```
第一次 GC：标记为 finalizable，加入 Finalizer 队列
Finalizer 线程执行 finalize()
第二次 GC：真正回收对象
```

**3. 异常被吞噬**

finalize 中的异常不会传播，静默失败。

### 替代方案

**方案1：try-with-resources（推荐）**

```java
class Resource implements AutoCloseable {
    @Override
    public void close() {
        // 释放资源
    }
}

try (Resource r = new Resource()) {
    // 使用资源
} // 自动调用 close()
```

**方案2：Cleaner API（Java 9+）**

```java
class Resource {
    private static final Cleaner cleaner = Cleaner.create();
    
    static class State implements Runnable {
        public void run() {
            // 清理资源
        }
    }
    
    private final Cleaner.Cleanable cleanable;
    
    public Resource() {
        State state = new State();
        this.cleanable = cleaner.register(this, state);
    }
}
```

**finalize 在 Java 9 被标记为 @Deprecated，未来版本将移除。**

---

## 5. getClass 与反射的关系

### getClass 的实现

```java
public final native Class<?> getClass();
```

**特点**：

1. `final` 修饰，不能被重写
2. 返回对象的运行时类型

### 使用场景

**1. 类型判断**

```java
Object obj = "hello";
if (obj.getClass() == String.class) {
    // obj 确实是 String
}
```

**getClass vs instanceof**：

```java
String s = "hello";
s instanceof Object;    // true（子类是父类的实例）
s.getClass() == Object.class; // false（精确类型匹配）
```

**2. 反射入口**

```java
Class<?> clazz = obj.getClass();
Method[] methods = clazz.getDeclaredMethods();
Field[] fields = clazz.getDeclaredFields();
Constructor<?>[] constructors = clazz.getDeclaredConstructors();
```

### 字节码实现

```java
Object obj = new String("hello");
Class<?> clazz = obj.getClass();
```

字节码：

```
new String
dup
ldc "hello"
invokespecial String.<init>
astore_1
aload_1
invokevirtual Object.getClass  // 调用 native 方法
astore_2
```

JVM 从对象头（Object Header）的类型指针中读取 Class 对象的地址。

---

## 易错点与边界行为

### 1. equals 的传递性陷阱

```java
class Point {
    int x, y;
    
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Point)) return false;
        Point p = (Point) obj;
        return x == p.x && y == p.y;
    }
}

class ColorPoint extends Point {
    String color;
    
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof ColorPoint)) return false;
        ColorPoint cp = (ColorPoint) obj;
        return super.equals(cp) && color.equals(cp.color);
    }
}

Point p = new Point(1, 2);
ColorPoint cp1 = new ColorPoint(1, 2, "red");
ColorPoint cp2 = new ColorPoint(1, 2, "blue");

p.equals(cp1);  // true
p.equals(cp2);  // true
cp1.equals(p);  // false（破坏对称性）
```

**解决方案**：使用组合而非继承，或者禁止子类化（final 类）。

### 2. hashCode 的缓存策略

```java
class String {
    private int hash; // 缓存 hashCode
    
    public int hashCode() {
        int h = hash;
        if (h == 0 && value.length > 0) {
            hash = h = calculateHash();
        }
        return h;
    }
}
```

String 的 hashCode 计算后缓存，避免重复计算（因为 String 不可变）。

### 3. clone 的 final 字段限制

```java
class Person implements Cloneable {
    final int[] scores; // final 字段
    
    public Person(int[] scores) {
        this.scores = scores;
    }
    
    @Override
    public Person clone() throws CloneNotSupportedException {
        Person cloned = (Person) super.clone();
        // cloned.scores = scores.clone(); // 编译错误：无法修改 final 字段
        return cloned;
    }
}
```

clone 机制与 final 字段冲突，这是拷贝构造器的优势之一。

---

## 实际推导案例

### 案例：为什么 HashMap 的 get 性能是 O(1)？

```java
Map<String, Integer> map = new HashMap<>();
map.put("key", 42);
int value = map.get("key");
```

**推导过程**：

1. **计算 hashCode**：`"key".hashCode()` → 106079
2. **散列到桶**：`hash & (table.length - 1)` → 桶索引
3. **比较 equals**：桶中链表/红黑树节点逐个比较
4. **返回值**

**关键**：

- hashCode 分布均匀 → 每个桶节点少 → O(1)
- hashCode 冲突严重 → 退化为 O(n)

### 案例：String 的 hashCode 算法

```java
public int hashCode() {
    int h = hash;
    if (h == 0 && value.length > 0) {
        char val[] = value;
        for (int i = 0; i < value.length; i++) {
            h = 31 * h + val[i];
        }
        hash = h;
    }
    return h;
}
```

**算法**：`s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]`

**特点**：

- 相同字符不同位置 → 不同哈希值
- 31 可以优化为位移：`31*h == (h<<5) - h`

---

## 关键点总结

1. **equals/hashCode 契约**：equals 相等则 hashCode 必须相等，必须同时重写
2. **toString**：提供可读的字符串表示，便于调试和日志
3. **clone**：默认浅拷贝，深拷贝需递归或序列化，推荐使用拷贝构造器
4. **finalize**：已废弃，使用 try-with-resources 或 Cleaner 替代
5. **getClass**：反射入口，返回运行时精确类型
6. **hashCode 分布**：影响 HashMap 性能，使用 `Objects.hash()` 或质数算法

---

## 深入一点

### Object 的内存布局

**对象头（Object Header）**：

```
| Mark Word (8 bytes)           | Class Pointer (4/8 bytes) |
| hashCode | GC age | lock info | → Class<T> 对象             |
```

**Mark Word 存储内容**：

- hashCode（31 位）
- GC 分代年龄（4 位）
- 锁标志位（2 位）
- 偏向线程 ID

**getClass 的实现**：

```java
public final native Class<?> getClass();
```

JVM 读取对象头的类型指针（Class Pointer），返回对应的 Class 对象。

### hashCode 的 native 实现

OpenJDK 的默认实现（Hotspot JVM）：

```cpp
static inline intptr_t get_next_hash(Thread * Self, oop obj) {
  intptr_t value = 0;
  if (hashCode == 0) {
     // 随机数生成器
     value = os::random();
  } else if (hashCode == 1) {
     // 对象内存地址
     value = intptr_t(obj);
  } else if (hashCode == 2) {
     // 常量 1
     value = 1;
  } else if (hashCode == 3) {
     // 递增序列
     value = ++GVars.hcSequence;
  } else if (hashCode == 4) {
     // 对象内存地址
     value = intptr_t(obj);
  } else {
     // Marsaglia's xor-shift
     value = Self->hashCode;
  }
  return value & markOopDesc::hash_mask;
}
```

JVM 参数 `-XX:hashCode` 控制算法选择，默认为 5（xor-shift）。

---

## 参考资料

- 《Effective Java（第3版）》- Item 10-14（equals/hashCode/toString/clone）
- 《Java 核心技术（卷I）》- 第5章继承，5.2 节 Object 类
- 《深入理解 Java 虚拟机（第3版）》- 2.3.2 节对象的内存布局
- OpenJDK 源码：`src/hotspot/share/runtime/synchronizer.cpp`

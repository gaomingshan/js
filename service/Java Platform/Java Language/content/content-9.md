# 语法糖与编译期展开

## 概述

语法糖（Syntactic Sugar）是编译器提供的便捷语法，简化代码编写，但不改变底层语义。Java 编译器在编译期将语法糖展开为标准字节码，开发者无需关心底层实现细节。

本章解析 5 种核心语法糖：
1. **增强 for 循环**：迭代器模式的语法糖
2. **try-with-resources**：自动资源管理
3. **字符串拼接**：StringBuilder 优化
4. **switch-case 对字符串的支持**：哈希表实现
5. **可变参数**：数组转换

---

## 1. 增强 for 循环的字节码展开

### 数组的增强 for 循环

**源码**：

```java
int[] arr = {1, 2, 3};
for (int num : arr) {
    System.out.println(num);
}
```

**编译后等价代码**：

```java
int[] arr = {1, 2, 3};
int[] arrCopy = arr;
int len = arrCopy.length;
for (int i = 0; i < len; i++) {
    int num = arrCopy[i];
    System.out.println(num);
}
```

**字节码**：

```
iconst_3
newarray int
dup
iconst_0
iconst_1
iastore
// ... 初始化数组

astore_1           // 存储 arr
aload_1            // 加载 arr
astore_2           // arrCopy = arr
aload_2
arraylength        // len = arrCopy.length
istore_3

iconst_0           // i = 0
istore 4

// 循环开始
iload 4            // 加载 i
iload_3            // 加载 len
if_icmpge 循环结束  // if (i >= len) goto 结束

aload_2            // 加载 arrCopy
iload 4            // 加载 i
iaload             // num = arrCopy[i]
istore 5

getstatic System.out
iload 5
invokevirtual PrintStream.println

iinc 4, 1          // i++
goto 循环开始
```

### 集合的增强 for 循环

**源码**：

```java
List<String> list = Arrays.asList("a", "b", "c");
for (String s : list) {
    System.out.println(s);
}
```

**编译后**：

```java
List<String> list = Arrays.asList("a", "b", "c");
Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String s = iterator.next();
    System.out.println(s);
}
```

### 使用限制

增强 for 循环不能获取索引：

```java
// 无法实现
for (String s : list) {
    // 无法获取索引
}

// 需要使用传统 for 循环
for (int i = 0; i < list.size(); i++) {
    String s = list.get(i);
    System.out.println(i + ": " + s);
}
```

---

## 2. try-with-resources 的实现

### 资源自动关闭

**源码**：

```java
try (FileInputStream fis = new FileInputStream("file.txt")) {
    int data = fis.read();
} catch (IOException e) {
    e.printStackTrace();
}
```

**编译后等价代码**：

```java
FileInputStream fis = new FileInputStream("file.txt");
Throwable primaryException = null;

try {
    int data = fis.read();
} catch (Throwable t) {
    primaryException = t;
    throw t;
} finally {
    if (fis != null) {
        if (primaryException != null) {
            try {
                fis.close();
            } catch (Throwable suppressed) {
                primaryException.addSuppressed(suppressed);
            }
        } else {
            fis.close();
        }
    }
}
```

### 关键机制

**1. AutoCloseable 接口**

```java
public interface AutoCloseable {
    void close() throws Exception;
}
```

任何实现 `AutoCloseable` 的类都可用于 try-with-resources。

**2. 异常抑制（Suppressed Exception）**

```java
try (Resource r = new Resource()) {
    throw new Exception("Primary");
} // close() 抛出 Exception("Suppressed")

// 主异常是 "Primary"
// 被抑制的异常通过 getSuppressed() 获取
catch (Exception e) {
    System.out.println(e.getMessage()); // Primary
    Throwable[] suppressed = e.getSuppressed();
    System.out.println(suppressed[0].getMessage()); // Suppressed
}
```

### 多资源管理

**源码**：

```java
try (FileInputStream fis = new FileInputStream("input.txt");
     FileOutputStream fos = new FileOutputStream("output.txt")) {
    // 使用资源
}
```

**关闭顺序**：先打开的后关闭（栈式顺序）

```
打开：fis → fos
关闭：fos → fis
```

---

## 3. 字符串拼接的优化（StringBuilder）

### 简单拼接

**源码**：

```java
String s = "Hello" + " " + "World";
```

**编译期常量折叠**：

```java
String s = "Hello World"; // 编译期直接合并
```

### 变量拼接

**源码**：

```java
String s1 = "Hello";
String s2 = "World";
String s3 = s1 + " " + s2;
```

**编译后**：

```java
String s3 = new StringBuilder()
    .append(s1)
    .append(" ")
    .append(s2)
    .toString();
```

**字节码**：

```
new StringBuilder
dup
invokespecial StringBuilder.<init>
aload_1              // s1
invokevirtual StringBuilder.append(String)
ldc " "
invokevirtual StringBuilder.append(String)
aload_2              // s2
invokevirtual StringBuilder.append(String)
invokevirtual StringBuilder.toString
astore_3
```

### 循环中的拼接陷阱

**错误示例**：

```java
String s = "";
for (int i = 0; i < 1000; i++) {
    s += i; // 每次循环创建新的 StringBuilder
}
```

**编译后**：

```java
String s = "";
for (int i = 0; i < 1000; i++) {
    s = new StringBuilder().append(s).append(i).toString();
}
```

每次循环创建 1000 个 StringBuilder 对象！

**正确写法**：

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String s = sb.toString();
```

### Java 9+ 的优化：invokedynamic

Java 9 引入 `StringConcatFactory`，使用 `invokedynamic` 优化字符串拼接：

```java
String s = s1 + " " + s2;
```

字节码：

```
aload_1
aload_2
invokedynamic makeConcatWithConstants // 动态优化
```

运行时 JVM 选择最优实现（可能是 StringBuilder、数组拼接等）。

---

## 4. switch-case 对字符串的支持

### 字符串 switch 的实现

**源码**：

```java
String command = "start";
switch (command) {
    case "start":
        System.out.println("Starting");
        break;
    case "stop":
        System.out.println("Stopping");
        break;
    default:
        System.out.println("Unknown");
}
```

**编译后（两阶段 switch）**：

```java
String command = "start";
int hash = -1;

// 第一阶段：hashCode 匹配
switch (command.hashCode()) {
    case 109757538: // "start".hashCode()
        if (command.equals("start")) {
            hash = 0;
        }
        break;
    case 3540994: // "stop".hashCode()
        if (command.equals("stop")) {
            hash = 1;
        }
        break;
}

// 第二阶段：索引匹配
switch (hash) {
    case 0:
        System.out.println("Starting");
        break;
    case 1:
        System.out.println("Stopping");
        break;
    default:
        System.out.println("Unknown");
}
```

### 为什么需要两阶段？

**原因**：防止哈希冲突

```java
String s1 = "Aa";
String s2 = "BB";
s1.hashCode(); // 2112
s2.hashCode(); // 2112（哈希冲突）

// 编译后
switch (s.hashCode()) {
    case 2112:
        if (s.equals("Aa")) {
            hash = 0;
        } else if (s.equals("BB")) {
            hash = 1;
        }
        break;
}
```

### switch 支持的类型

| Java 版本 | 支持类型                                   |
| --------- | ------------------------------------------ |
| Java 1.0  | byte, short, char, int                     |
| Java 5    | 枚举类型                                   |
| Java 7    | String                                     |
| Java 12+  | 表达式 switch（`->`语法）                  |

---

## 5. 可变参数的数组转换

### 可变参数的实现

**源码**：

```java
void print(String... args) {
    for (String arg : args) {
        System.out.println(arg);
    }
}

print("a", "b", "c");
```

**编译后**：

```java
void print(String[] args) {
    for (String arg : args) {
        System.out.println(arg);
    }
}

print(new String[]{"a", "b", "c"});
```

**字节码**：

```
iconst_3
anewarray String
dup
iconst_0
ldc "a"
aastore
dup
iconst_1
ldc "b"
aastore
dup
iconst_2
ldc "c"
aastore
invokevirtual print([Ljava/lang/String;)V
```

### 可变参数的陷阱

**1. 与重载的交互**

```java
void method(String s) {
    System.out.println("String");
}

void method(String... s) {
    System.out.println("String...");
}

method("a"); // 输出 "String"（优先精确匹配）
```

**2. 传递 null**

```java
print(null); // 传递 null 数组，而非包含 null 的数组
print((String) null); // 传递包含一个 null 的数组
```

**3. 性能开销**

每次调用都创建数组：

```java
for (int i = 0; i < 1000000; i++) {
    print("a", "b", "c"); // 创建 1000000 个数组
}
```

---

## 易错点与边界行为

### 1. 增强 for 循环中删除元素

```java
List<String> list = new ArrayList<>(Arrays.asList("a", "b", "c"));
for (String s : list) {
    if (s.equals("b")) {
        list.remove(s); // ConcurrentModificationException
    }
}
```

**原因**：迭代器检测到集合被修改。

**解决方案**：

```java
Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String s = iterator.next();
    if (s.equals("b")) {
        iterator.remove(); // 使用迭代器删除
    }
}
```

### 2. try-with-resources 的资源顺序

```java
try (A a = new A(); B b = new B(a)) {
    // 使用资源
}
```

关闭顺序：先 `b.close()`，再 `a.close()`。

### 3. 字符串拼接的 null 处理

```java
String s = null;
String result = "Value: " + s; // "Value: null"
```

编译为：

```java
new StringBuilder().append("Value: ").append(s).toString();
```

`StringBuilder.append(null)` 返回 `"null"` 字符串。

### 4. switch-case 的 null 检查

```java
String s = null;
switch (s) { // NullPointerException
    case "a":
        break;
}
```

**原因**：`s.hashCode()` 抛出 NPE。

---

## 实际推导案例

### 案例：为什么增强 for 循环比传统循环慢？

**ArrayList 的增强 for**：

```java
for (String s : list) { // 使用迭代器
    System.out.println(s);
}
```

**传统索引循环**：

```java
for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i)); // 直接访问
}
```

**性能对比**：

- ArrayList 的迭代器实现内部也使用索引，性能相近
- LinkedList 的迭代器遍历比索引访问快得多（O(n) vs O(n²)）

### 案例：String.format vs StringBuilder

```java
// String.format
String s = String.format("Name: %s, Age: %d", name, age);

// StringBuilder
String s = new StringBuilder()
    .append("Name: ").append(name)
    .append(", Age: ").append(age)
    .toString();
```

**性能**：StringBuilder 比 `String.format` 快约 **10 倍**（format 需要解析格式串）。

---

## 关键点总结

1. **增强 for**：数组使用索引，集合使用迭代器
2. **try-with-resources**：自动调用 close()，支持异常抑制
3. **字符串拼接**：编译为 StringBuilder（Java 9+ 使用 invokedynamic）
4. **字符串 switch**：两阶段实现（hashCode + equals）
5. **可变参数**：编译为数组，每次调用创建新数组

---

## 深入一点

### 编译器如何决定优化策略？

**javac 编译器的优化**：

- 常量折叠
- 死代码消除
- 语法糖展开

**不做的优化**（留给 JIT）：

- 方法内联
- 循环展开
- 公共子表达式消除

### 字节码验证

使用 `javap -c` 查看语法糖展开后的字节码：

```bash
javac Example.java
javap -c Example.class
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 10.3 节编译期优化
- 《Java 核心技术（卷I）》- 3.8 节字符串
- Oracle 官方教程：[The try-with-resources Statement](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html)
- JEP 280：Indify String Concatenation（Java 9 字符串拼接优化）

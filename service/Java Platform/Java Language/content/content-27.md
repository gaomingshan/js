# 常量池与字符串常量池

## 概述

Java 中存在三种常量池：class 文件常量池、运行时常量池、字符串常量池。理解它们的区别与联系，是掌握字符串优化、内存管理、常量折叠的基础。

本章聚焦：
- **class 文件常量池**
- **运行时常量池**
- **字符串常量池（String Pool）**
- **String.intern() 的工作原理**
- **常量池的位置演变**

---

## 1. class 文件常量池

### 定义

**class 文件常量池**：编译期生成，存储在 class 文件中

### 存储内容

**14 种常量类型**：

1. 字面量
   - 文本字符串（String）
   - final 常量值

2. 符号引用
   - 类和接口的全限定名
   - 字段的名称和描述符
   - 方法的名称和描述符

### 示例

**源码**：

```java
public class Demo {
    private static final int MAX = 100;
    private String name = "Alice";
    
    public void print() {
        System.out.println(name);
    }
}
```

**class 文件常量池**（javap -v 输出）：

```
Constant pool:
   #1 = Methodref          #6.#20         // java/lang/Object."<init>":()V
   #2 = String             #21            // Alice
   #3 = Fieldref           #5.#22         // Demo.name:Ljava/lang/String;
   #4 = Fieldref           #23.#24        // java/lang/System.out:Ljava/io/PrintStream;
   #5 = Class              #25            // Demo
   #6 = Class              #26            // java/lang/Object
   #7 = Utf8               MAX
   #8 = Utf8               I
   #9 = Utf8               ConstantValue
  #10 = Integer            100
  #11 = Utf8               name
  #12 = Utf8               Ljava/lang/String;
  ...
```

**解读**：

- `#2 = String #21`：字符串字面量 "Alice"
- `#10 = Integer 100`：int 常量 100
- `#3 = Fieldref #5.#22`：字段 Demo.name 的符号引用

---

## 2. 运行时常量池

### 定义

**运行时常量池**：class 文件常量池加载到内存后的表示

### 位置

**Java 7 及之前**：

- 方法区（永久代）

**Java 8+**：

- 元空间（Metaspace）

### 存储内容

**来源**：

1. **class 文件常量池**：加载时转换
2. **动态生成**：String.intern()、反射生成的类

### 特点

**1. 动态性**：

- 可以在运行时添加常量（String.intern()）

**2. 共享性**：

- 同一个类加载器加载的类共享运行时常量池

**3. 符号引用解析**：

- 编译期：符号引用
- 运行期：解析为直接引用

---

## 3. 字符串常量池（String Pool）

### 定义

**字符串常量池**：存储字符串字面量和 intern 字符串的特殊区域

### 位置演变

**Java 6 及之前**：

- 永久代（PermGen）

**Java 7+**：

- 堆（Heap）

**迁移原因**：

- 永久代大小固定，容易溢出
- 堆空间大，可以存储更多字符串
- 字符串可以被 GC 回收

### 存储内容

**字符串字面量**：

```java
String s1 = "Hello";  // "Hello" 存入字符串常量池
String s2 = "Hello";  // 复用常量池中的 "Hello"

System.out.println(s1 == s2);  // true
```

**String.intern() 的字符串**：

```java
String s1 = new String("World");
String s2 = s1.intern();  // 将 "World" 加入常量池

String s3 = "World";
System.out.println(s2 == s3);  // true
```

---

## 4. String.intern() 的工作原理

### 基本用法

**定义**：

```java
public native String intern();
```

**作用**：

- 如果常量池中已有字符串，返回常量池中的引用
- 如果常量池中没有，将字符串加入常量池，返回常量池中的引用

### Java 6 的实现

**行为**：

```java
String s1 = new String("Hello");
String s2 = s1.intern();

System.out.println(s1 == s2);  // false
```

**原因**：

1. `new String("Hello")` 在堆中创建对象
2. `intern()` 在永久代常量池中创建副本
3. `s1` 指向堆，`s2` 指向永久代

### Java 7+ 的实现

**行为**：

```java
String s1 = new String("He") + new String("llo");
String s2 = s1.intern();

System.out.println(s1 == s2);  // true
```

**原因**：

1. `new String("He") + new String("llo")` 在堆中创建 "Hello"
2. `intern()` 发现常量池中没有 "Hello"
3. **不复制对象**，而是在常量池中存储堆中对象的引用
4. `s1` 和 `s2` 都指向堆中的同一对象

**特殊情况**：

```java
String s1 = "Hello";  // 常量池中已有 "Hello"
String s2 = new String("Hello");
String s3 = s2.intern();

System.out.println(s1 == s2);  // false
System.out.println(s1 == s3);  // true
```

**原因**：

1. `s1 = "Hello"` 在常量池中创建 "Hello"
2. `new String("Hello")` 在堆中创建新对象
3. `intern()` 发现常量池中已有 "Hello"，返回常量池中的引用
4. `s3` 指向常量池中的 "Hello"（与 `s1` 相同）

---

## 5. 字符串拼接与常量池

### 编译期常量折叠

**源码**：

```java
String s1 = "Hello" + "World";
String s2 = "HelloWorld";

System.out.println(s1 == s2);  // true
```

**编译后**：

```java
String s1 = "HelloWorld";  // 编译期折叠
String s2 = "HelloWorld";
```

**原因**：编译器在编译期将字符串字面量拼接，结果存入常量池。

### 运行期拼接

**源码**：

```java
String s1 = "Hello";
String s2 = "World";
String s3 = s1 + s2;
String s4 = "HelloWorld";

System.out.println(s3 == s4);  // false
```

**原因**：

1. `s1 + s2` 运行时拼接，结果在堆中
2. `s3` 指向堆中的对象
3. `s4` 指向常量池中的 "HelloWorld"

**使用 intern()**：

```java
String s3 = (s1 + s2).intern();
System.out.println(s3 == s4);  // true
```

### final 变量的特殊处理

**源码**：

```java
final String s1 = "Hello";
final String s2 = "World";
String s3 = s1 + s2;
String s4 = "HelloWorld";

System.out.println(s3 == s4);  // true
```

**原因**：

- `s1` 和 `s2` 是 final 常量，编译期确定值
- 编译器将 `s1 + s2` 优化为 "HelloWorld"

**非 final 变量**：

```java
String s1 = "Hello";
String s2 = "World";
String s3 = s1 + s2;
String s4 = "HelloWorld";

System.out.println(s3 == s4);  // false
```

---

## 6. 常量池的内存管理

### 字符串常量池的大小

**查看默认大小**：

```bash
java -XX:+PrintFlagsFinal -version | grep StringTableSize
```

**输出**（Java 8）：

```
StringTableSize = 60013
```

**调整大小**：

```bash
java -XX:StringTableSize=100000 MyApp
```

**建议**：

- 应用大量使用字符串：增大 StringTableSize
- 默认值通常足够

### 字符串常量池的垃圾回收

**Java 7+**：

- 字符串常量池在堆中
- 未被引用的字符串可以被 GC 回收

**触发条件**：

- Full GC

**示例**：

```java
String s1 = new String("Temp").intern();
s1 = null;

System.gc();  // 触发 GC，"Temp" 可能被回收
```

---

## 易错点与边界行为

### 1. new String() 创建几个对象？

**问题**：

```java
String s = new String("Hello");
```

**答案**：1 个或 2 个

**解析**：

- 如果常量池中没有 "Hello"：创建 2 个对象
  - 1 个在常量池（字面量 "Hello"）
  - 1 个在堆（new String）
- 如果常量池中已有 "Hello"：创建 1 个对象
  - 仅在堆中创建（new String）

### 2. String.intern() 的性能陷阱

**问题代码**：

```java
for (int i = 0; i < 1000000; i++) {
    String s = new String("string" + i).intern();
}
```

**问题**：

- 向常量池中添加 100 万个字符串
- 常量池变大，查找变慢
- 占用大量内存

**解决方案**：

- 避免滥用 intern()
- 只对重复率高的字符串使用 intern()

### 3. 字符串拼接的误解

**问题代码**：

```java
String s = "a" + "b" + "c";
```

**误解**：创建多个中间对象

**实际**：

- 编译期优化为 "abc"
- 只创建 1 个对象（常量池中）

**运行期拼接**：

```java
String s = str1 + str2 + str3;
```

**实际**：

- 编译为 StringBuilder.append()
- 创建 1 个 StringBuilder 对象
- 创建 1 个结果字符串对象

### 4. == vs equals

**问题代码**：

```java
String s1 = new String("Hello");
String s2 = new String("Hello");

System.out.println(s1 == s2);       // false
System.out.println(s1.equals(s2));  // true
```

**原因**：

- `==` 比较引用（对象地址）
- `equals()` 比较内容

**最佳实践**：

```java
// 比较字符串内容，使用 equals()
if (str.equals("expected")) { ... }

// 比较字符串引用，使用 ==（罕见）
if (str == CONSTANT) { ... }
```

---

## 实际推导案例

### 案例：字符串常量池的演变

**Java 6**：

```java
String s1 = new String("Hello");
s1.intern();  // 在永久代常量池中创建副本

System.gc();  // Full GC 不会回收永久代中的 "Hello"
```

**Java 7+**：

```java
String s1 = new String("Hello");
s1.intern();  // 在堆中字符串常量池中存储引用

s1 = null;
System.gc();  // Full GC 可以回收 "Hello"
```

### 案例：大量字符串的内存优化

**问题**：

```java
List<String> list = new ArrayList<>();
for (int i = 0; i < 100000; i++) {
    list.add(new String("duplicate"));  // 创建 10 万个重复字符串
}
```

**内存占用**：

- 每个 String 对象：~40 字节
- 总计：~4 MB

**优化**：

```java
List<String> list = new ArrayList<>();
String shared = "duplicate";  // 常量池中只有 1 个
for (int i = 0; i < 100000; i++) {
    list.add(shared);  // 复用同一对象
}
```

**内存占用**：

- 1 个 String 对象：~40 字节
- 10 万个引用：~400 KB
- 总计：~400 KB（节省 90%）

### 案例：分析 intern() 的使用场景

**适合使用 intern()**：

```java
// 场景：大量重复字符串（如枚举值、配置项）
String status = request.getParameter("status").intern();
```

**不适合使用 intern()**：

```java
// 场景：唯一性字符串（如用户 ID、订单号）
String orderId = UUID.randomUUID().toString().intern();  // 浪费
```

---

## 关键点总结

1. **三种常量池**：class 文件、运行时、字符串常量池
2. **字符串常量池位置**：Java 6 永久代，Java 7+ 堆
3. **String.intern()**：Java 6 复制对象，Java 7+ 存储引用
4. **编译期优化**：字符串字面量拼接会被折叠
5. **运行期拼接**：使用 StringBuilder，不进常量池
6. **性能优化**：重复字符串使用常量池，唯一字符串避免 intern()

---

## 深入一点

### 查看字符串常量池内容

**JDK 工具**：无直接工具

**间接方法**：

```bash
jmap -heap <pid>  # 查看 StringTable 统计
```

**输出**：

```
StringTable statistics:
Number of buckets       : 60013
Number of entries       : 12345
Number of literals      : 12000
```

### 常量池的哈希表实现

**字符串常量池使用哈希表**：

```cpp
// HotSpot 源码（简化）
class StringTable {
    static HashtableEntry<oop>* buckets[];
    static int table_size = 60013;  // 默认大小
};
```

**查找流程**：

1. 计算字符串的 hashCode
2. 根据 hashCode 查找桶
3. 遍历桶中的链表，比较字符串内容
4. 找到返回，未找到则添加

### 常量池溢出

**Java 6**：

```java
List<String> list = new ArrayList<>();
int i = 0;
while (true) {
    list.add(String.valueOf(i++).intern());
}
```

**异常**：

```
java.lang.OutOfMemoryError: PermGen space
```

**Java 7+**：

```
java.lang.OutOfMemoryError: Java heap space
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 2.2.5 节运行时常量池
- 《Effective Java（第3版）》- Item 6：避免创建不必要的对象
- Oracle 官方文档：[String Deduplication](https://openjdk.java.net/jeps/192)
- 工具：javap、jmap

# 自动装箱与拆箱机制

## 概述

自动装箱（Autoboxing）和拆箱（Unboxing）是 Java 5 引入的语法糖，用于简化基本类型与包装类型之间的转换。虽然提升了代码简洁性，但也隐藏了性能开销和潜在陷阱。

**核心机制**：
- **装箱**：基本类型 → 包装类型（`int` → `Integer`）
- **拆箱**：包装类型 → 基本类型（`Integer` → `int`）

理解装箱拆箱的本质，需要区分**编译期语法糖展开**和**运行期缓存机制**。

---

## 1. 编译期的语法糖展开

### 自动装箱的实现

**源码**：

```java
Integer num = 42;
```

**编译后的字节码等价代码**：

```java
Integer num = Integer.valueOf(42);
```

字节码：

```
bipush 42
invokestatic Integer.valueOf(I)Ljava/lang/Integer;
astore_1
```

### 自动拆箱的实现

**源码**：

```java
Integer num = 42;
int value = num;
```

**编译后**：

```java
Integer num = Integer.valueOf(42);
int value = num.intValue();
```

字节码：

```
aload_1
invokevirtual Integer.intValue()I
istore_2
```

### 所有基本类型的包装类

| 基本类型 | 包装类    | 装箱方法            | 拆箱方法          |
| -------- | --------- | ------------------- | ----------------- |
| byte     | Byte      | Byte.valueOf()      | byteValue()       |
| short    | Short     | Short.valueOf()     | shortValue()      |
| int      | Integer   | Integer.valueOf()   | intValue()        |
| long     | Long      | Long.valueOf()      | longValue()       |
| float    | Float     | Float.valueOf()     | floatValue()      |
| double   | Double    | Double.valueOf()    | doubleValue()     |
| char     | Character | Character.valueOf() | charValue()       |
| boolean  | Boolean   | Boolean.valueOf()   | booleanValue()    |

---

## 2. Integer 缓存池机制（-128 ~ 127）

### Integer.valueOf 的实现

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    else
        return new Integer(i);
}

private static class IntegerCache {
    static final int low = -128;
    static final int high = 127;
    static final Integer cache[];
    
    static {
        cache = new Integer[high - low + 1];
        int j = low;
        for (int k = 0; k < cache.length; k++)
            cache[k] = new Integer(j++);
    }
}
```

**缓存范围**：`-128` 到 `127`（256个对象）

### 缓存池的影响

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b); // true（缓存池）

Integer c = 200;
Integer d = 200;
System.out.println(c == d); // false（超出缓存范围）
```

**原因**：

- `100` 在缓存范围内，`a` 和 `b` 指向同一对象
- `200` 超出缓存范围，每次装箱创建新对象

### 其他包装类的缓存

**Boolean**：缓存 `TRUE` 和 `FALSE`

```java
public static Boolean valueOf(boolean b) {
    return (b ? TRUE : FALSE);
}

public static final Boolean TRUE = new Boolean(true);
public static final Boolean FALSE = new Boolean(false);
```

**Byte**：缓存全部 256 个值（-128 ~ 127）

```java
private static class ByteCache {
    static final Byte cache[] = new Byte[256];
}
```

**Character**：缓存 0 ~ 127

```java
private static class CharacterCache {
    static final Character cache[] = new Character[128];
}
```

**Short**：缓存 -128 ~ 127

**Long**：缓存 -128 ~ 127

**Float、Double**：**不缓存**（浮点数值过多）

### 自定义缓存范围

JVM 参数调整 Integer 缓存上限：

```bash
java -XX:AutoBoxCacheMax=1000 MyApp
```

修改后，缓存范围变为 `-128` ~ `1000`。

---

## 3. 装箱拆箱的性能影响

### 性能开销

**对象创建成本**：

```java
// 基本类型：栈上分配，速度快
int sum = 0;
for (int i = 0; i < 1000000; i++) {
    sum += i;
}

// 包装类型：堆上分配，涉及对象创建
Integer sum2 = 0;
for (int i = 0; i < 1000000; i++) {
    sum2 += i; // 每次循环：拆箱 + 加法 + 装箱
}
```

**性能对比**：包装类型版本慢约 **5-10 倍**。

### 内存开销

**基本类型**：

- `int`：4 字节

**包装类型**：

- 对象头：8-12 字节（Mark Word + Class Pointer）
- 数据字段：4 字节
- 对齐填充：通常 4 字节
- **总计**：约 16 字节

**内存放大**：包装类型内存占用是基本类型的 **4 倍**。

### 大量装箱拆箱的陷阱

```java
// 错误示例
Long sum = 0L;
for (long i = 0; i < Integer.MAX_VALUE; i++) {
    sum += i; // 每次循环：拆箱 + 加法 + 装箱
}
```

**优化**：

```java
long sum = 0L;
for (long i = 0; i < Integer.MAX_VALUE; i++) {
    sum += i; // 纯基本类型运算
}
```

---

## 4. == vs equals 的陷阱

### 基本类型：== 比较值

```java
int a = 100;
int b = 100;
System.out.println(a == b); // true
```

### 包装类型：== 比较引用

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b); // true（缓存池）

Integer c = 200;
Integer d = 200;
System.out.println(c == d); // false（不同对象）
```

### 混合比较：自动拆箱

```java
Integer a = 100;
int b = 100;
System.out.println(a == b); // true（a 自动拆箱）
```

编译为：

```java
System.out.println(a.intValue() == b);
```

### equals 的正确用法

```java
Integer a = 200;
Integer b = 200;
System.out.println(a.equals(b)); // true（值相等）
```

**Integer.equals 的实现**：

```java
public boolean equals(Object obj) {
    if (obj instanceof Integer) {
        return value == ((Integer)obj).intValue();
    }
    return false;
}
```

---

## 5. null 与拆箱的 NPE 风险

### 拆箱 null 导致 NPE

```java
Integer num = null;
int value = num; // NullPointerException
```

编译为：

```java
int value = num.intValue(); // num 为 null，抛出 NPE
```

### 条件表达式的陷阱

```java
Integer a = 1;
Integer b = 2;
Integer c = null;

Boolean flag = true;
Integer result = flag ? a : c; // 如果 c 为 null
System.out.println(result); // NullPointerException
```

**原因**：三目运算符的类型提升规则

```java
// 编译器认为结果是 int（而非 Integer）
// 因此执行拆箱
Integer result = flag ? a.intValue() : c.intValue(); // c.intValue() 抛出 NPE
```

### Map 的拆箱陷阱

```java
Map<String, Integer> map = new HashMap<>();
map.put("key", 1);

// 危险操作
int value = map.get("nonexistent"); // NullPointerException
```

**原因**：

```java
// get 返回 null
Integer temp = map.get("nonexistent"); // null
int value = temp.intValue(); // NPE
```

**安全写法**：

```java
Integer temp = map.get("nonexistent");
int value = (temp != null) ? temp : 0;

// 或使用 getOrDefault
int value = map.getOrDefault("nonexistent", 0);
```

---

## 易错点与边界行为

### 1. 重载方法的选择

```java
void process(int value) {
    System.out.println("int");
}

void process(Integer value) {
    System.out.println("Integer");
}

process(42); // 输出 "int"（优先基本类型）
process(Integer.valueOf(42)); // 输出 "Integer"
```

### 2. 泛型中的装箱

```java
List<Integer> list = new ArrayList<>();
list.add(42); // 自动装箱

// 不能使用基本类型
// List<int> list = new ArrayList<>(); // 编译错误
```

**原因**：泛型类型参数必须是引用类型。

### 3. 数组不支持自动装箱

```java
int[] primitives = {1, 2, 3};
// Integer[] boxed = primitives; // 编译错误

// 手动转换
Integer[] boxed = Arrays.stream(primitives)
                        .boxed()
                        .toArray(Integer[]::new);
```

### 4. 比较运算符的拆箱

```java
Integer a = 100;
Integer b = 200;

// 比较运算符会拆箱
if (a < b) { // 拆箱为 int
    System.out.println("a < b");
}
```

编译为：

```java
if (a.intValue() < b.intValue()) { ... }
```

### 5. 缓存池的线程安全性

```java
Integer a = 100;
Integer b = 100;
// a == b 在所有线程中都是 true（缓存池是静态的）
```

缓存池在类加载时初始化，多线程共享同一对象。

---

## 实际推导案例

### 案例：为什么 Long 没有缓存池优化？

```java
Long a = 100L;
Long b = 100L;
System.out.println(a == b); // true（有缓存池）

Long c = 200L;
Long d = 200L;
System.out.println(c == d); // false（超出缓存）
```

**Long 也有缓存池**（-128 ~ 127），但为什么常被忽略？

**原因**：

1. `long` 的常用范围更大，缓存命中率低
2. 文档和教学通常以 `Integer` 为例
3. JVM 参数只能调整 `Integer` 的缓存上限

### 案例：为什么 Double 不缓存？

```java
Double a = 1.0;
Double b = 1.0;
System.out.println(a == b); // false（没有缓存池）
```

**原因**：

1. 浮点数值域无限，无法预设缓存范围
2. 浮点数比较应使用 `equals` 或误差范围

```java
double a = 0.1 + 0.2;
double b = 0.3;
System.out.println(a == b); // false（浮点数精度问题）
System.out.println(Math.abs(a - b) < 1e-9); // true（误差比较）
```

### 案例：循环中的装箱陷阱

```java
// 错误示例
Integer sum = 0;
for (int i = 0; i < 1000; i++) {
    sum += i; // 每次循环：拆箱 + 加法 + 装箱
}
```

**字节码展开**：

```java
Integer sum = Integer.valueOf(0);
for (int i = 0; i < 1000; i++) {
    sum = Integer.valueOf(sum.intValue() + i);
}
```

每次循环执行：
1. `sum.intValue()`：拆箱
2. 加法运算
3. `Integer.valueOf()`：装箱（可能创建对象）

**优化**：

```java
int sum = 0;
for (int i = 0; i < 1000; i++) {
    sum += i;
}
```

---

## 关键点总结

1. **装箱**：`Integer.valueOf(int)`，拆箱：`intValue()`
2. **缓存池**：`Integer/Long/Short/Byte/Character` 缓存 -128 ~ 127
3. **性能**：包装类型慢 5-10 倍，内存占用大 4 倍
4. **== vs equals**：== 比较引用，equals 比较值
5. **NPE 风险**：拆箱 null、三目运算符、Map.get
6. **泛型**：只能使用包装类型，不支持基本类型

---

## 深入一点

### Integer.valueOf 的源码分析

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    else
        return new Integer(i);
}
```

**优化思路**：

1. 常用小整数（-128 ~ 127）预创建对象
2. 减少对象创建开销
3. 缓存命中率高（统计表明 90% 以上的整数在此范围）

### 缓存池的初始化时机

```java
private static class IntegerCache {
    static {
        // 类加载时初始化
        cache = new Integer[high - low + 1];
        int j = low;
        for (int k = 0; k < cache.length; k++)
            cache[k] = new Integer(j++);
    }
}
```

**时机**：`Integer` 类首次加载时（类加载阶段）。

### 字节码中的装箱拆箱

**源码**：

```java
Integer num = 42;
int value = num + 10;
```

**字节码**：

```
bipush 42
invokestatic Integer.valueOf(I)Ljava/lang/Integer;  // 装箱
astore_1

aload_1
invokevirtual Integer.intValue()I                   // 拆箱
bipush 10
iadd                                                  // 加法
istore_2
```

### 为什么 new Integer() 被废弃？

```java
// Java 9+ 废弃
@Deprecated(since="9")
public Integer(int value) {
    this.value = value;
}
```

**原因**：

1. 绕过缓存池，降低性能
2. 创建不必要的对象
3. 推荐使用 `Integer.valueOf()`

**影响**：

```java
// 不推荐
Integer a = new Integer(100);
Integer b = new Integer(100);
System.out.println(a == b); // false

// 推荐
Integer a = Integer.valueOf(100);
Integer b = Integer.valueOf(100);
System.out.println(a == b); // true（缓存池）
```

---

## 参考资料

- 《Effective Java（第3版）》- Item 6：避免创建不必要的对象
- 《深入理解 Java 虚拟机（第3版）》- 2.3.3 节对象的访问定位
- 《Java 核心技术（卷I）》- 3.4 节变量与常量
- OpenJDK 源码：`java.lang.Integer`
- JDK Enhancement Proposal (JEP) 142：Integer Cache（缓存机制改进）

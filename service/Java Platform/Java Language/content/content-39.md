# 特殊语法的边界行为

## 概述

Java 的某些特殊语法在边界情况下有意想不到的行为。理解这些边界行为，有助于避免隐藏的 bug、编写更健壮的代码。

本章聚焦：
- **字符串 switch 的实现细节**
- **可变参数的边界**
- **自动装箱的陷阱**
- **枚举的特殊行为**
- **标签与 break 的组合**

---

## 1. 字符串 switch 的边界

### hashCode 冲突

**问题**：

```java
String s1 = "Aa";
String s2 = "BB";
System.out.println(s1.hashCode());  // 2112
System.out.println(s2.hashCode());  // 2112（相同）
```

**switch 实现**：

```java
switch (str) {
    case "Aa":
        System.out.println("Aa");
        break;
    case "BB":
        System.out.println("BB");
        break;
}
```

**编译后**：

```java
int hash = str.hashCode();
switch (hash) {
    case 2112:
        if (str.equals("Aa")) {
            System.out.println("Aa");
        } else if (str.equals("BB")) {
            System.out.println("BB");
        }
        break;
}
```

**两阶段匹配**：hashCode + equals

### null 值

**问题**：

```java
String str = null;
switch (str) {  // NullPointerException
    case "hello":
        break;
}
```

**原因**：

- `str.hashCode()` 调用
- null 无法调用方法

---

## 2. 可变参数的边界

### 空参数

**定义**：

```java
void method(String... args) {
    System.out.println(args.length);
}
```

**调用**：

```java
method();  // 0（传入空数组）
method(null);  // NullPointerException（args 为 null）
```

**区别**：

```java
method();        // args = new String[0]
method(null);    // args = null
method(new String[]{null});  // args = [null]
```

### 重载歧义

**问题**：

```java
void method(int... args) { }
void method(int n, int... args) { }

method(1);  // 编译错误：歧义
```

**原因**：

- `method(1)` 匹配两个方法
- `method(int... args)` → args = [1]
- `method(int n, int... args)` → n = 1, args = []

### 数组与可变参数

**源码**：

```java
void method(String... args) {
    System.out.println(args.length);
}

String[] arr = {"a", "b"};
method(arr);  // 2（直接传入数组）
method(arr, "c");  // 编译错误
```

---

## 3. 自动装箱的陷阱

### 缓存范围

**Integer 缓存**：

```java
Integer a = 127;
Integer b = 127;
System.out.println(a == b);  // true（缓存）

Integer c = 128;
Integer d = 128;
System.out.println(c == d);  // false（超出缓存）
```

**缓存范围**：

- Byte, Short, Integer, Long：-128 到 127
- Character：0 到 127
- Boolean：true 和 false

### 拆箱的 NullPointerException

**问题**：

```java
Integer a = null;
int b = a;  // NullPointerException（拆箱）
```

**三目运算符**：

```java
Integer a = null;
int b = 1;
int c = true ? a : b;  // NullPointerException
```

**原因**：

- 三目运算符统一类型
- Integer 拆箱为 int
- `a.intValue()` → NullPointerException

### 比较运算

**问题**：

```java
Integer a = 1000;
Integer b = 1000;
System.out.println(a == b);  // false（超出缓存）
System.out.println(a.equals(b));  // true
```

**混合比较**：

```java
Integer a = 1000;
int b = 1000;
System.out.println(a == b);  // true（a 自动拆箱）
```

---

## 4. 枚举的边界行为

### 枚举的序数

**定义**：

```java
enum Color {
    RED, GREEN, BLUE
}

System.out.println(Color.RED.ordinal());  // 0
System.out.println(Color.GREEN.ordinal());  // 1
```

**陷阱**：

```java
// 不要依赖 ordinal
Color color = Color.values()[1];  // GREEN

// 添加新枚举值
enum Color {
    RED, YELLOW, GREEN, BLUE  // YELLOW 插入
}

// GREEN 的 ordinal 变为 2（破坏兼容性）
```

**最佳实践**：

```java
enum Color {
    RED(1), GREEN(2), BLUE(3);
    
    private final int code;
    
    Color(int code) {
        this.code = code;
    }
    
    public int getCode() {
        return code;
    }
}
```

### 枚举的序列化

**问题**：

```java
// 序列化
ObjectOutputStream out = new ObjectOutputStream(...);
out.writeObject(Color.RED);

// 反序列化
ObjectInputStream in = new ObjectInputStream(...);
Color color = (Color) in.readObject();
```

**保证**：

- 反序列化返回原枚举实例（单例）
- 不调用构造方法

### switch on enum

**源码**：

```java
switch (color) {
    case RED:
        System.out.println("Red");
        break;
    case GREEN:
        System.out.println("Green");
        break;
}
```

**编译后**：

```java
// 生成映射数组
static final int[] $SwitchMap$Color = new int[Color.values().length];
static {
    $SwitchMap$Color[Color.RED.ordinal()] = 1;
    $SwitchMap$Color[Color.GREEN.ordinal()] = 2;
}

// switch 语句
switch ($SwitchMap$Color[color.ordinal()]) {
    case 1:
        System.out.println("Red");
        break;
    case 2:
        System.out.println("Green");
        break;
}
```

---

## 5. 标签与 break/continue

### 标签 break

**源码**：

```java
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) {
            break outer;  // 跳出外层循环
        }
        System.out.println(i + "," + j);
    }
}
```

**输出**：

```
0,0
0,1
0,2
1,0
```

### 标签 continue

**源码**：

```java
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) {
            continue outer;  // 继续外层循环
        }
        System.out.println(i + "," + j);
    }
}
```

**输出**：

```
0,0
1,0
2,0
```

### 标签的作用域

**问题**：

```java
label:
{
    if (condition) {
        break label;  // 跳出代码块
    }
    System.out.println("After");
}
System.out.println("End");
```

**输出**（condition = true）：

```
End
```

---

## 6. 位运算的边界

### 移位运算的模运算

**问题**：

```java
int a = 1;
int b = a << 32;
System.out.println(b);  // 1（而非 0）
```

**原因**：

- 移位量会对 32 取模
- `a << 32` → `a << (32 % 32)` → `a << 0` → a

**long 的移位**：

```java
long a = 1L;
long b = a << 64;
System.out.println(b);  // 1（对 64 取模）
```

### 有符号右移 vs 无符号右移

**有符号右移（>>）**：

```java
int a = -8;  // 1111...1000
int b = a >> 2;  // 1111...1110 = -2
```

**无符号右移（>>>）**：

```java
int a = -8;  // 1111...1000
int b = a >>> 2;  // 0011...1110 = 1073741822
```

---

## 易错点与边界行为

### 1. 字符串 + null

**问题**：

```java
String s = "Hello" + null;
System.out.println(s);  // "Hellonull"
```

**原因**：

- null 转换为字符串 "null"

### 2. 数组的协变

**问题**：

```java
Object[] arr = new String[10];
arr[0] = 123;  // ArrayStoreException
```

**原因**：

- 数组是协变的（String[] 是 Object[] 的子类型）
- 运行时检查实际类型

### 3. 泛型数组

**问题**：

```java
List<String>[] arr = new List<String>[10];  // 编译错误
```

**原因**：

- 泛型擦除后，无法保证类型安全

**变通方案**：

```java
@SuppressWarnings("unchecked")
List<String>[] arr = (List<String>[]) new List[10];
```

### 4. for-each 的限制

**问题**：

```java
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3));
for (Integer i : list) {
    list.remove(i);  // ConcurrentModificationException
}
```

**原因**：

- for-each 使用迭代器
- 直接修改集合导致迭代器失效

**正确做法**：

```java
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    Integer i = it.next();
    it.remove();
}
```

---

## 实际推导案例

### 案例：Integer 缓存的影响

**问题代码**：

```java
Map<Integer, String> map = new HashMap<>();
map.put(127, "a");
System.out.println(map.get(127));  // "a"

map.put(128, "b");
System.out.println(map.get(128));  // "b"
```

**看似正常，实际**：

```java
Integer key1 = 127;
Integer key2 = 127;
System.out.println(key1 == key2);  // true（缓存）

Integer key3 = 128;
Integer key4 = 128;
System.out.println(key3 == key4);  // false（不同对象）
```

**HashMap 使用 equals 和 hashCode，无影响**

**但如果使用 IdentityHashMap**：

```java
Map<Integer, String> map = new IdentityHashMap<>();
map.put(127, "a");
System.out.println(map.get(127));  // "a"（缓存）

map.put(128, "b");
System.out.println(map.get(128));  // null（不同对象）
```

### 案例：可变参数的性能

**问题**：

```java
void log(String... messages) {
    // 每次调用都创建数组
}

log("a");  // new String[]{"a"}
log("a", "b");  // new String[]{"a", "b"}
```

**优化**：

```java
void log(String message) {
    // 无数组创建
}

void log(String message1, String message2) {
    // 无数组创建
}

void log(String... messages) {
    // 超过2个参数才创建数组
}
```

---

## 关键点总结

1. **字符串 switch**：两阶段匹配（hashCode + equals）
2. **可变参数**：空参数 vs null 参数
3. **自动装箱**：缓存范围 -128 到 127
4. **枚举**：不依赖 ordinal，使用自定义字段
5. **标签 break**：可跳出多层循环
6. **移位运算**：移位量对位数取模

---

## 深入一点

### 字符串 switch 的完整字节码

**源码**：

```java
switch (str) {
    case "Aa": System.out.println("Aa"); break;
    case "BB": System.out.println("BB"); break;
}
```

**字节码**：

```
aload_1          // 加载 str
invokevirtual String.hashCode()
lookupswitch {   // hashCode 匹配
    2112: 28
    default: 54
}
aload_1
ldc "Aa"
invokevirtual String.equals()
ifeq 45          // 不相等跳转
getstatic System.out
ldc "Aa"
invokevirtual println
goto 54
aload_1
ldc "BB"
invokevirtual String.equals()
ifeq 54
getstatic System.out
ldc "BB"
invokevirtual println
```

### 自动装箱的字节码

**源码**：

```java
Integer a = 127;
```

**字节码**：

```
bipush 127
invokestatic Integer.valueOf(I)Ljava/lang/Integer;
astore_1
```

**Integer.valueOf() 实现**：

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
```

---

## 参考资料

- 《Effective Java（第3版）》- Item 34-37：枚举和注解
- 《Java 语言规范》- §15.28：switch 语句
- Oracle 官方文档：[The switch Statement](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/switch.html)
- JLS §5.1.7：Boxing Conversion

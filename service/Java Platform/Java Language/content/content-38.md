# 数值运算的边界行为

## 概述

Java 数值运算在边界情况下有特殊行为，包括溢出、除零、浮点数特殊值等。理解这些边界行为，有助于避免隐藏的计算错误。

本章聚焦：
- **整数溢出**
- **除零行为**
- **浮点数特殊值**
- **类型转换的精度丢失**
- **strictfp 关键字**

---

## 1. 整数溢出

### 加法溢出

**源码**：

```java
int max = Integer.MAX_VALUE;  // 2147483647
int result = max + 1;
System.out.println(result);  // -2147483648
```

**原因**：

- 整数运算采用补码表示
- 溢出后回绕（wrap around）

**二进制表示**：

```
MAX_VALUE:  0111 1111 1111 1111 1111 1111 1111 1111
+1:         0000 0000 0000 0000 0000 0000 0000 0001
结果:        1000 0000 0000 0000 0000 0000 0000 0000 (MIN_VALUE)
```

### 乘法溢出

**源码**：

```java
int a = 50000;
int b = 50000;
int result = a * b;
System.out.println(result);  // -1794967296
```

**检测溢出**：

```java
long result = (long) a * b;
if (result > Integer.MAX_VALUE || result < Integer.MIN_VALUE) {
    // 溢出
}
```

**Java 8+ 安全运算**：

```java
int result = Math.addExact(a, b);  // 溢出抛 ArithmeticException
int result = Math.multiplyExact(a, b);
```

### 负数溢出

**源码**：

```java
int min = Integer.MIN_VALUE;  // -2147483648
int result = -min;
System.out.println(result);  // -2147483648（溢出）
```

**原因**：

- MIN_VALUE 的绝对值 = MAX_VALUE + 1
- 无法用 int 表示

**正确做法**：

```java
long result = -(long) min;  // 2147483648
```

---

## 2. 除零行为

### 整数除零

**源码**：

```java
int result = 10 / 0;  // ArithmeticException: / by zero
```

**异常**：抛出 ArithmeticException

### 浮点数除零

**源码**：

```java
double result1 = 10.0 / 0.0;
System.out.println(result1);  // Infinity

double result2 = -10.0 / 0.0;
System.out.println(result2);  // -Infinity

double result3 = 0.0 / 0.0;
System.out.println(result3);  // NaN
```

**不抛异常**：返回特殊值

---

## 3. 浮点数特殊值

### 无穷大（Infinity）

**产生**：

```java
double inf = Double.POSITIVE_INFINITY;  // 正无穷
double negInf = Double.NEGATIVE_INFINITY;  // 负无穷
double divResult = 1.0 / 0.0;  // 正无穷
```

**运算**：

```java
Infinity + 1 = Infinity
Infinity + Infinity = Infinity
Infinity - Infinity = NaN
Infinity * 0 = NaN
```

**判断**：

```java
Double.isInfinite(value);
```

### NaN（Not a Number）

**产生**：

```java
double nan1 = 0.0 / 0.0;
double nan2 = Double.NaN;
double nan3 = Math.sqrt(-1);
```

**特性**：

```java
NaN == NaN  // false（唯一不等于自己的值）
NaN != NaN  // true
```

**判断**：

```java
Double.isNaN(value);
```

**传播性**：

```java
NaN + 1 = NaN
NaN * 2 = NaN
```

### 负零

**存在负零**：

```java
double zero = 0.0;
double negZero = -0.0;
System.out.println(zero == negZero);  // true
```

**区别**：

```java
1.0 / zero = Infinity
1.0 / negZero = -Infinity
```

---

## 4. 浮点数精度问题

### 二进制表示的限制

**问题**：

```java
double a = 0.1;
double b = 0.2;
double c = a + b;
System.out.println(c);  // 0.30000000000000004
System.out.println(c == 0.3);  // false
```

**原因**：

- 0.1 和 0.2 无法精确表示为二进制
- 累积误差

**解决方案**：

```java
// 1. 使用 BigDecimal
BigDecimal a = new BigDecimal("0.1");
BigDecimal b = new BigDecimal("0.2");
BigDecimal c = a.add(b);  // 精确的 0.3

// 2. 比较时使用容差
double epsilon = 0.00001;
if (Math.abs(c - 0.3) < epsilon) {
    // 近似相等
}
```

### 浮点数的舍入

**源码**：

```java
double value = 2.5;
long rounded = Math.round(value);  // 3（四舍五入）
```

**银行家舍入**：

```java
// RoundingMode.HALF_EVEN
2.5 → 2（偶数）
3.5 → 4（偶数）
```

---

## 5. 类型转换的精度丢失

### 窄化转换

**int to byte**：

```java
int a = 128;
byte b = (byte) a;
System.out.println(b);  // -128（溢出）
```

**原因**：

- byte 范围：-128 到 127
- 128 超出范围，回绕

**long to int**：

```java
long a = 2147483648L;  // Integer.MAX_VALUE + 1
int b = (int) a;
System.out.println(b);  // -2147483648（溢出）
```

### 浮点数转整数

**截断小数**：

```java
double a = 3.9;
int b = (int) a;
System.out.println(b);  // 3（截断，不是四舍五入）
```

**溢出**：

```java
double a = 1e100;  // 远超 int 范围
int b = (int) a;
System.out.println(b);  // Integer.MAX_VALUE
```

### long to float

**精度丢失**：

```java
long a = 123456789012345L;
float b = (float) a;
long c = (long) b;
System.out.println(a == c);  // false
```

**原因**：

- float 只有 23 位尾数
- long 有 64 位
- 精度丢失

---

## 6. strictfp 关键字

### 定义

**strictfp**：强制浮点运算遵循 IEEE 754 标准

**用法**：

```java
strictfp class Demo {
    double method(double a, double b) {
        return a + b;  // 严格遵循 IEEE 754
    }
}
```

### 作用

**无 strictfp**：

- JVM 可使用扩展精度（如 80 位）
- 不同平台结果可能不同

**有 strictfp**：

- 强制使用 64 位
- 保证跨平台一致性

**性能影响**：

- 可能略慢（禁用扩展精度）

---

## 易错点与边界行为

### 1. 整数除法的截断

**问题**：

```java
int a = 5;
int b = 2;
double result = a / b;
System.out.println(result);  // 2.0（而非 2.5）
```

**原因**：

- `a / b` 是整数除法，结果为 2
- 然后转换为 double

**正确写法**：

```java
double result = (double) a / b;  // 2.5
```

### 2. 自增运算的溢出

**问题**：

```java
int i = Integer.MAX_VALUE;
i++;
System.out.println(i);  // Integer.MIN_VALUE
```

### 3. 浮点数比较

**问题**：

```java
double a = 0.1 + 0.1 + 0.1;
if (a == 0.3) {  // false
    // ...
}
```

**正确写法**：

```java
if (Math.abs(a - 0.3) < 1e-10) {
    // ...
}
```

### 4. BigDecimal 的陷阱

**问题**：

```java
BigDecimal a = new BigDecimal(0.1);  // 不精确
System.out.println(a);  // 0.1000000000000000055511151231257827021181583404541015625
```

**正确写法**：

```java
BigDecimal a = new BigDecimal("0.1");  // 精确
```

---

## 实际推导案例

### 案例：货币计算

**错误写法**：

```java
double price = 0.1;
int count = 10;
double total = price * count;  // 0.9999999999999999
```

**正确写法**：

```java
// 使用 BigDecimal
BigDecimal price = new BigDecimal("0.1");
BigDecimal count = new BigDecimal("10");
BigDecimal total = price.multiply(count);  // 精确的 1.0

// 或使用整数（分）
int priceInCents = 10;  // 0.1 元 = 10 分
int count = 10;
int totalInCents = priceInCents * count;  // 100 分 = 1 元
```

### 案例：循环终止条件

**问题代码**：

```java
for (float f = 0.0f; f != 1.0f; f += 0.1f) {
    System.out.println(f);
}
// 可能无限循环（0.1 的累积误差）
```

**正确写法**：

```java
for (float f = 0.0f; f < 1.0f; f += 0.1f) {
    System.out.println(f);
}
```

### 案例：数组索引计算

**问题代码**：

```java
int[] arr = new int[10];
double ratio = 0.5;
int index = (int) (arr.length * ratio);  // 5
arr[index] = 1;  // 正确

ratio = 0.999;
index = (int) (arr.length * ratio);  // 9（截断）
arr[index] = 1;  // 正确

ratio = 1.0;
index = (int) (arr.length * ratio);  // 10
arr[index] = 1;  // ArrayIndexOutOfBoundsException
```

**正确写法**：

```java
int index = Math.min((int) (arr.length * ratio), arr.length - 1);
```

---

## 关键点总结

1. **整数溢出**：回绕，不抛异常
2. **整数除零**：抛 ArithmeticException
3. **浮点除零**：返回 Infinity 或 NaN
4. **NaN 特性**：NaN != NaN
5. **浮点精度**：0.1 + 0.2 != 0.3
6. **类型转换**：窄化转换可能溢出或截断

---

## 深入一点

### IEEE 754 标准

**double 的结构（64 位）**：

```
符号位(1) | 指数(11) | 尾数(52)
```

**特殊值**：

- 指数全 1，尾数全 0：Infinity
- 指数全 1，尾数非 0：NaN
- 指数全 0，尾数非 0：非规格化数

### 浮点数的表示范围

**double**：

- 最小正数：2^-1074 ≈ 4.9e-324
- 最大正数：(2 - 2^-52) × 2^1023 ≈ 1.8e308

**精度**：

- 约 15-17 位十进制数字

### 数值运算的汇编实现

**整数加法**：

```asm
add eax, ebx  ; eax = eax + ebx（溢出不报错）
```

**浮点加法**：

```asm
addsd xmm0, xmm1  ; xmm0 = xmm0 + xmm1（SSE 指令）
```

---

## 参考资料

- 《Effective Java（第3版）》- Item 60：避免使用 float 和 double 进行精确计算
- IEEE 754 标准：[IEEE Standard for Floating-Point Arithmetic](https://standards.ieee.org/standard/754-2019.html)
- Oracle 官方文档：[Primitive Data Types](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html)
- What Every Computer Scientist Should Know About Floating-Point Arithmetic

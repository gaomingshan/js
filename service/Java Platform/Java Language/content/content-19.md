# 异常处理机制

## 概述

Java 的异常处理不是简单的 try-catch 语法糖，而是通过异常表（Exception Table）和栈展开（Stack Unwinding）实现的。理解异常处理的底层机制，有助于编写高效、健壮的代码。

本章聚焦：
- **异常表的结构与匹配**
- **异常的抛出与传播**
- **finally 的执行保证**
- **异常处理的性能开销**
- **异常的最佳实践**

---

## 1. 异常表的结构

### 异常表的定义

**异常表（Exception Table）**：记录异常处理器的位置

**结构**：

```
Exception table:
  from  to  target  type
```

- **from**：监控范围起始字节码偏移量
- **to**：监控范围结束字节码偏移量
- **target**：异常处理器入口偏移量
- **type**：捕获的异常类型（常量池索引）

### 示例：try-catch

**源码**：

```java
void method() {
    try {
        int x = 1 / 0;
    } catch (ArithmeticException e) {
        System.out.println("Error");
    }
}
```

**字节码**：

```
Code:
   0: iconst_1
   1: iconst_0
   2: idiv
   3: istore_1
   4: goto 12
   7: astore_1         // 异常对象存入局部变量 1
   8: getstatic System.out
  11: ldc "Error"
  13: invokevirtual println
  16: return

Exception table:
  from  to  target  type
    0    4     7    Class java/lang/ArithmeticException
```

**解读**：

- 监控范围：字节码 0-4
- 异常处理器：字节码 7
- 捕获类型：ArithmeticException

---

## 2. 异常的匹配与传播

### 异常匹配流程

**步骤**：

1. 异常发生时，JVM 获取当前 PC 值
2. 查找当前方法的异常表
3. 遍历异常表，检查 PC 是否在 [from, to) 范围内
4. 检查异常类型是否匹配（instanceof）
5. 匹配成功：跳转到 target
6. 匹配失败：传播到调用者

### 多个 catch 块

**源码**：

```java
try {
    riskyMethod();
} catch (IOException e) {
    // 处理 IO 异常
} catch (SQLException e) {
    // 处理 SQL 异常
} catch (Exception e) {
    // 处理其他异常
}
```

**异常表**：

```
Exception table:
  from  to  target  type
    0    5    10    Class java/io/IOException
    0    5    20    Class java/sql/SQLException
    0    5    30    Class java/lang/Exception
```

**匹配顺序**：

按异常表顺序匹配（编译器保证从具体到一般）。

### 异常传播

**调用链**：

```java
void methodA() {
    methodB();
}

void methodB() {
    methodC();
}

void methodC() {
    throw new RuntimeException();
}
```

**传播流程**：

```
1. methodC 抛出异常
2. 查找 methodC 的异常表 → 未找到
3. 弹出 methodC 栈帧，传播到 methodB
4. 查找 methodB 的异常表 → 未找到
5. 弹出 methodB 栈帧，传播到 methodA
6. 查找 methodA 的异常表 → 未找到
7. 弹出 methodA 栈帧，传播到 main
8. main 未捕获 → JVM 终止，打印堆栈
```

---

## 3. finally 的实现原理

### finally 的字节码

**源码**：

```java
void method() {
    try {
        System.out.println("Try");
    } finally {
        System.out.println("Finally");
    }
}
```

**字节码**：

```
Code:
   0: getstatic System.out
   3: ldc "Try"
   5: invokevirtual println
   8: getstatic System.out      // finally 块（正常路径）
  11: ldc "Finally"
  13: invokevirtual println
  16: goto 28
  19: astore_1                   // 异常路径
  20: getstatic System.out       // finally 块（异常路径）
  23: ldc "Finally"
  25: invokevirtual println
  28: aload_1
  29: athrow                     // 重新抛出异常
  30: return

Exception table:
  from  to  target  type
    0    8    19    any          // 捕获所有异常
```

**关键点**：

- finally 块代码被复制到正常路径和异常路径
- 异常表的 type = any（捕获所有异常）

### finally 一定会执行吗？

**几乎总是执行**：

```java
try {
    return 1;
} finally {
    System.out.println("Finally");  // 在 return 前执行
}
```

**不执行的情况**：

1. **JVM 退出**：

```java
try {
    System.exit(0);  // JVM 终止
} finally {
    System.out.println("不会执行");
}
```

2. **线程死亡**：

```java
try {
    Thread.currentThread().stop();  // 不推荐
} finally {
    System.out.println("不会执行");
}
```

3. **无限循环**：

```java
try {
    while (true) { }
} finally {
    System.out.println("永远不会执行");
}
```

### finally 与返回值

**返回值被覆盖**：

```java
int method() {
    try {
        return 1;
    } finally {
        return 2;  // 覆盖 try 的返回值
    }
}
```

**字节码**：

```
iconst_1
istore_1    // 保存 try 的返回值
iconst_2
ireturn     // finally 的 return 覆盖
```

**输出**：2

**最佳实践**：避免在 finally 中使用 return。

---

## 4. 异常处理的性能开销

### 创建异常对象的成本

**异常对象包含**：

1. 异常消息
2. 堆栈跟踪（Stack Trace）

**堆栈跟踪的开销**：

```java
new Exception();
```

**内部实现**：

```java
public Throwable() {
    fillInStackTrace();  // 填充堆栈
}

public synchronized Throwable fillInStackTrace() {
    return fillInStackTrace(0);  // native 方法
}
```

**填充堆栈的成本**：

- 遍历当前线程的栈帧
- 记录每个栈帧的类名、方法名、行号
- 时间复杂度：O(栈深度)

### 性能测试

**正常流程 vs 异常流程**：

```java
// 正常流程
for (int i = 0; i < 1000000; i++) {
    method();
}

// 异常流程
for (int i = 0; i < 1000000; i++) {
    try {
        throw new Exception();
    } catch (Exception e) {
    }
}
```

**性能差异**：异常流程慢约 **1000 倍**。

### 优化异常性能

**1. 禁用堆栈跟踪**：

```java
class FastException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;  // 不填充堆栈
    }
}
```

**2. 复用异常对象**：

```java
private static final MyException INSTANCE = new MyException();

void method() {
    throw INSTANCE;  // 复用，无需创建
}
```

**注意**：复用异常丢失堆栈信息，仅适用于性能关键路径。

---

## 5. try-with-resources 的实现

### 自动资源管理

**源码**：

```java
try (FileInputStream fis = new FileInputStream("file.txt")) {
    int data = fis.read();
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

### Suppressed Exception

**作用**：记录 finally 中的异常

**示例**：

```java
try (Resource r = new Resource()) {
    throw new Exception("Primary");
} // close() 抛出 Exception("Suppressed")
```

**捕获**：

```java
catch (Exception e) {
    System.out.println(e.getMessage());  // "Primary"
    Throwable[] suppressed = e.getSuppressed();
    System.out.println(suppressed[0].getMessage());  // "Suppressed"
}
```

---

## 易错点与边界行为

### 1. catch 块的顺序

**编译错误**：

```java
try {
    // ...
} catch (Exception e) {
    // 捕获所有异常
} catch (IOException e) {  // 编译错误：unreachable
    // IOException 是 Exception 的子类
}
```

**正确顺序**：从具体到一般

```java
try {
    // ...
} catch (IOException e) {
    // ...
} catch (Exception e) {
    // ...
}
```

### 2. finally 中的异常

**finally 中抛出异常会覆盖 try 的异常**：

```java
try {
    throw new Exception("Try");
} finally {
    throw new Exception("Finally");  // 覆盖 try 的异常
}
```

**捕获**：

```java
catch (Exception e) {
    System.out.println(e.getMessage());  // "Finally"
}
```

**最佳实践**：避免在 finally 中抛出异常。

### 3. 异常与返回值

**try 中 return，finally 修改变量**：

```java
int method() {
    int x = 1;
    try {
        return x;
    } finally {
        x = 2;
    }
}
```

**输出**：1

**原因**：

- return 前将 x 的值（1）保存到局部变量
- finally 修改的是局部变量 x，不影响返回值

**字节码**：

```
iconst_1
istore_1    // x = 1
iload_1
istore_2    // 保存返回值 1
iconst_2
istore_1    // x = 2（不影响返回值）
iload_2
ireturn     // 返回 1
```

### 4. checked vs unchecked 异常

**checked 异常**：必须捕获或声明

```java
void method() throws IOException {
    throw new IOException();
}
```

**unchecked 异常**：无需捕获或声明

```java
void method() {
    throw new RuntimeException();
}
```

**字节码层面无区别**：

- 两者都使用 athrow 指令
- 编译器强制检查 checked 异常

---

## 实际推导案例

### 案例：为什么不推荐用异常控制流程？

**反模式**：

```java
try {
    int index = 0;
    while (true) {
        System.out.println(array[index++]);
    }
} catch (ArrayIndexOutOfBoundsException e) {
    // 数组遍历结束
}
```

**问题**：

1. **性能差**：创建异常对象、填充堆栈
2. **语义不清**：异常用于错误，不是控制流
3. **调试困难**：异常堆栈混淆真正的错误

**正确写法**：

```java
for (int i = 0; i < array.length; i++) {
    System.out.println(array[i]);
}
```

### 案例：异常处理的最佳实践

**1. 捕获具体异常**：

```java
// 不推荐
try {
    // ...
} catch (Exception e) {
    // 捕获所有异常
}

// 推荐
try {
    // ...
} catch (IOException e) {
    // 处理 IO 异常
} catch (SQLException e) {
    // 处理 SQL 异常
}
```

**2. 记录异常信息**：

```java
catch (IOException e) {
    logger.error("Failed to read file", e);  // 记录堆栈
    throw new RuntimeException("IO error", e);  // 包装异常
}
```

**3. 清理资源**：

```java
// 使用 try-with-resources
try (Connection conn = getConnection()) {
    // 使用 conn
}

// 或手动 finally
Connection conn = null;
try {
    conn = getConnection();
    // 使用 conn
} finally {
    if (conn != null) {
        conn.close();
    }
}
```

### 案例：空指针异常的性能优化

**Java 14+ 精确 NullPointerException**：

```bash
java -XX:+ShowCodeDetailsInExceptionMessages MyApp
```

**异常消息**：

```
Exception in thread "main" java.lang.NullPointerException: 
  Cannot invoke "String.length()" because "str" is null
```

**实现**：

- JVM 重构异常消息，提供详细信息
- 性能开销：首次抛出时慢，后续缓存消息

---

## 关键点总结

1. **异常表**：记录监控范围、处理器位置、异常类型
2. **异常匹配**：按异常表顺序匹配，未匹配则传播
3. **finally 实现**：代码复制到正常路径和异常路径
4. **性能开销**：创建异常对象、填充堆栈，慢约 1000 倍
5. **try-with-resources**：自动调用 close()，支持 suppressed 异常
6. **最佳实践**：捕获具体异常、记录日志、清理资源

---

## 深入一点

### 查看异常表

**使用 javap**：

```bash
javap -c -v Demo.class
```

**输出**：

```
Exception table:
  from    to  target type
     0     4     7   Class java/io/IOException
     0     4    15   any
     7    10    15   any
```

### 异常处理的 JIT 优化

**隐式异常优化**：

```java
int x = array[i];  // 可能抛出 ArrayIndexOutOfBoundsException
```

**JIT 优化**：

1. 热点路径：假设不抛出异常，直接访问
2. 守护条件：检查索引有效性
3. 异常路径：去优化，回退到解释执行

**查看优化日志**：

```bash
java -XX:+PrintCompilation -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining MyApp
```

### 异常的内存布局

**Throwable 对象**：

```java
public class Throwable {
    private String detailMessage;           // 异常消息
    private Throwable cause;                // 原因异常
    private StackTraceElement[] stackTrace; // 堆栈跟踪
    private List<Throwable> suppressedExceptions;  // 被抑制的异常
}
```

**内存占用**：

- 基本对象：~16 字节
- 消息字符串：~24 + 字符串长度
- 堆栈数组：~16 + 栈深度 × 32
- **总计**：约 100-1000 字节（取决于栈深度）

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 8.2.3 节异常处理
- 《Effective Java（第3版）》- Item 69-77：异常最佳实践
- Oracle 官方文档：[Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/)
- JLS §14.20：The try statement
- HotSpot 源码：`hotspot/share/interpreter/bytecodeInterpreter.cpp`

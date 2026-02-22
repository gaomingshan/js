# 异常机制的边界行为

## 概述

Java 异常机制在某些边界情况下表现出特殊行为。理解这些边界行为，有助于避免隐藏的 bug、编写健壮的代码。

本章聚焦：
- **异常的执行顺序**
- **finally 与 return 的交互**
- **异常链与异常丢失**
- **受检异常的绕过**

---

## 1. finally 与 return 的执行顺序

### finally 一定在 return 前执行

**源码**：

```java
int method() {
    try {
        return 1;
    } finally {
        System.out.println("Finally");
    }
}
```

**执行顺序**：

1. 计算返回值 1
2. 保存返回值到局部变量
3. 执行 finally 块
4. 返回保存的值

**输出**：

```
Finally
返回值：1
```

### finally 中的 return 覆盖 try 的 return

**源码**：

```java
int method() {
    try {
        return 1;
    } finally {
        return 2;
    }
}
```

**返回值**：2

**原因**：finally 中的 return 覆盖 try 中的 return

**最佳实践**：避免在 finally 中使用 return

### finally 修改返回值无效

**源码**：

```java
int method() {
    int x = 1;
    try {
        return x;
    } finally {
        x = 2;  // 无效
    }
}
```

**返回值**：1

**原因**：

- return 前将 x 的值保存到临时变量
- finally 修改的是局部变量 x，不影响返回值

**引用类型的特殊情况**：

```java
StringBuilder method() {
    StringBuilder sb = new StringBuilder("a");
    try {
        return sb;
    } finally {
        sb.append("b");  // 有效
    }
}
```

**返回值**：StringBuilder 内容为 "ab"

**原因**：

- 返回的是引用
- finally 修改引用指向的对象

---

## 2. 异常的覆盖与丢失

### finally 中的异常覆盖 try 的异常

**源码**：

```java
void method() {
    try {
        throw new RuntimeException("Try");
    } finally {
        throw new RuntimeException("Finally");
    }
}
```

**抛出的异常**：RuntimeException("Finally")

**try 的异常被丢失**

**正确做法**：

```java
void method() {
    Exception tryException = null;
    try {
        throw new RuntimeException("Try");
    } catch (Exception e) {
        tryException = e;
        throw e;
    } finally {
        if (tryException != null) {
            try {
                cleanup();
            } catch (Exception e) {
                tryException.addSuppressed(e);
            }
        }
    }
}
```

### try-with-resources 的异常处理

**源码**：

```java
try (Resource r = new Resource()) {
    throw new Exception("Main");
} // close() 抛出 Exception("Close")
```

**主异常**：Exception("Main")

**抑制异常**：Exception("Close")

**获取抑制异常**：

```java
catch (Exception e) {
    Throwable[] suppressed = e.getSuppressed();
    // suppressed[0] 是 close() 的异常
}
```

---

## 3. 多 catch 块的匹配顺序

### 按声明顺序匹配

**源码**：

```java
try {
    throw new IOException();
} catch (IOException e) {
    System.out.println("IO");
} catch (Exception e) {
    System.out.println("Exception");
}
```

**输出**：IO

**匹配第一个符合的 catch 块**

### 编译器检查不可达 catch

**编译错误**：

```java
try {
    // ...
} catch (Exception e) {
    // ...
} catch (IOException e) {  // 编译错误：unreachable
    // IOException 是 Exception 的子类
}
```

### multi-catch 的限制

**Java 7+ multi-catch**：

```java
try {
    // ...
} catch (IOException | SQLException e) {
    // e 的类型是两者的公共父类
}
```

**限制**：

```java
// 错误：两个异常有继承关系
catch (Exception | IOException e) {  // 编译错误
}
```

---

## 4. 受检异常的特殊行为

### 泛型擦除绕过受检异常

**源码**：

```java
class Util {
    @SuppressWarnings("unchecked")
    static <T extends Throwable> void throwUnchecked(Throwable e) throws T {
        throw (T) e;
    }
}

void method() {
    Util.throwUnchecked(new Exception("Checked"));  // 绕过检查
}
```

**原理**：

- 泛型擦除后，`(T) e` 变为 `(Throwable) e`
- 编译器认为抛出的是 `T`（可能是 RuntimeException）
- 实际抛出 checked exception，但无需声明

### lambda 中的受检异常

**问题**：

```java
list.forEach(item -> {
    Files.readAllLines(path);  // 编译错误：IOException 未处理
});
```

**解决方案 1**：包装为 unchecked

```java
list.forEach(item -> {
    try {
        Files.readAllLines(path);
    } catch (IOException e) {
        throw new UncheckedIOException(e);
    }
});
```

**解决方案 2**：自定义函数式接口

```java
@FunctionalInterface
interface ThrowingConsumer<T> {
    void accept(T t) throws Exception;
}

static <T> Consumer<T> wrap(ThrowingConsumer<T> consumer) {
    return t -> {
        try {
            consumer.accept(t);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    };
}

list.forEach(wrap(item -> Files.readAllLines(path)));
```

---

## 5. 异常的性能影响

### 异常创建的开销

**源码**：

```java
new Exception();  // 填充堆栈跟踪
```

**开销**：

- 遍历当前线程栈帧
- 记录类名、方法名、行号
- 时间复杂度：O(栈深度)

**优化**：禁用堆栈跟踪

```java
class FastException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;  // 不填充堆栈
    }
}
```

### 异常 vs 返回码

**使用异常**：

```java
try {
    int result = divide(a, b);
} catch (ArithmeticException e) {
    // 处理异常
}
```

**使用返回码**：

```java
int result = divide(a, b);
if (result == -1) {
    // 错误处理
}
```

**性能对比**：

- 正常流程：返回码稍快
- 异常流程：异常慢 1000 倍

**最佳实践**：

- 异常用于异常情况
- 返回码用于预期的错误

---

## 易错点与边界行为

### 1. finally 中的 break/continue

**问题代码**：

```java
while (true) {
    try {
        break;
    } finally {
        continue;  // 覆盖 break
    }
}  // 无限循环
```

### 2. 异常与 finally 的组合

**源码**：

```java
int method() {
    try {
        throw new Exception();
    } catch (Exception e) {
        return 1;
    } finally {
        return 2;  // 覆盖 catch 的 return
    }
}
```

**返回值**：2

**异常被吞没**

### 3. 泛型方法中的异常声明

**源码**：

```java
<T extends Exception> void method() throws T {
    throw (T) new RuntimeException();
}
```

**调用**：

```java
method();  // 无需 try-catch
```

**原因**：泛型擦除后，T 变为 Exception

### 4. 异常初始化器中的异常

**源码**：

```java
class Demo {
    static {
        throw new RuntimeException();
    }
}

new Demo();  // ExceptionInInitializerError
```

**再次使用**：

```java
new Demo();  // NoClassDefFoundError
```

**原因**：类初始化失败后，类标记为不可用

---

## 实际推导案例

### 案例：finally 的字节码实现

**源码**：

```java
try {
    System.out.println("Try");
} finally {
    System.out.println("Finally");
}
```

**字节码**：

```
0: getstatic System.out
3: ldc "Try"
5: invokevirtual println
8: getstatic System.out      // finally（正常路径）
11: ldc "Finally"
13: invokevirtual println
16: goto 28
19: astore_1                  // 异常路径
20: getstatic System.out      // finally（异常路径）
23: ldc "Finally"
25: invokevirtual println
28: aload_1
29: athrow

Exception table:
  from  to  target  type
    0   8    19     any
```

**finally 代码被复制到两个路径**

### 案例：异常对象的复用

**问题**：

```java
static final Exception INSTANCE = new Exception();

void method() {
    throw INSTANCE;  // 复用异常对象
}
```

**问题**：

- 堆栈跟踪不准确
- 多线程问题

**结论**：不推荐复用异常对象

---

## 关键点总结

1. **finally 执行顺序**：return 前执行
2. **finally 覆盖**：finally 的 return/throw 覆盖 try 的
3. **异常丢失**：finally 抛异常会丢失 try 的异常
4. **受检异常绕过**：泛型擦除可绕过
5. **异常性能**：创建异常开销大，慢 1000 倍
6. **最佳实践**：避免在 finally 中 return/throw

---

## 深入一点

### 异常表的结构

**Exception Table**：

```
from  to  target  type
  0   10    15    java/io/IOException
  0   10    20    java/lang/Exception
  0   10    25    any
```

**匹配流程**：

1. 异常发生在 PC = 5
2. 检查 from=0, to=10，在范围内
3. 检查 type，匹配第一个符合的
4. 跳转到 target

### try-with-resources 的完整展开

**源码**：

```java
try (Resource r = new Resource()) {
    use(r);
}
```

**展开后**：

```java
Resource r = new Resource();
Throwable primary = null;
try {
    use(r);
} catch (Throwable t) {
    primary = t;
    throw t;
} finally {
    if (r != null) {
        if (primary != null) {
            try {
                r.close();
            } catch (Throwable suppressed) {
                primary.addSuppressed(suppressed);
            }
        } else {
            r.close();
        }
    }
}
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 8.2.3 节异常处理
- 《Effective Java（第3版）》- Item 69-77：异常
- JLS §14.20：The try statement
- Oracle 官方文档：[Exceptions](https://docs.oracle.com/javase/tutorial/essential/exceptions/)

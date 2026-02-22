# 综合案例与最佳实践

## 概述

本章通过综合案例，串联 Java 语言机制、JVM 原理、性能优化等知识点，展示实际开发中的最佳实践。

---

## 1. 案例：实现高性能缓存

### 需求

- 支持并发访问
- LRU 淘汰策略
- 内存可控
- 高性能

### 实现

```java
class LRUCache<K, V> {
    private final int capacity;
    private final ConcurrentHashMap<K, Node<K, V>> cache;
    private final AtomicReference<Node<K, V>> head = new AtomicReference<>();
    private final AtomicReference<Node<K, V>> tail = new AtomicReference<>();
    
    static class Node<K, V> {
        final K key;
        volatile V value;
        volatile Node<K, V> prev;
        volatile Node<K, V> next;
        
        Node(K key, V value) {
            this.key = key;
            this.value = value;
        }
    }
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.cache = new ConcurrentHashMap<>(capacity);
    }
    
    public V get(K key) {
        Node<K, V> node = cache.get(key);
        if (node != null) {
            moveToHead(node);
            return node.value;
        }
        return null;
    }
    
    public void put(K key, V value) {
        Node<K, V> node = cache.get(key);
        if (node != null) {
            node.value = value;
            moveToHead(node);
        } else {
            if (cache.size() >= capacity) {
                removeLast();
            }
            Node<K, V> newNode = new Node<>(key, value);
            cache.put(key, newNode);
            addToHead(newNode);
        }
    }
    
    private void moveToHead(Node<K, V> node) {
        // 原子操作移动节点到头部
    }
    
    private void addToHead(Node<K, V> node) {
        // 添加节点到头部
    }
    
    private void removeLast() {
        Node<K, V> last = tail.get();
        if (last != null) {
            cache.remove(last.key);
            // 移除尾节点
        }
    }
}
```

### 优化点

1. **ConcurrentHashMap**：支持并发
2. **AtomicReference**：无锁更新头尾指针
3. **volatile**：保证可见性
4. **容量限制**：避免内存溢出

---

## 2. 案例：单例模式最佳实践

### 错误实现

**懒汉式（线程不安全）**：

```java
class Singleton {
    private static Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {  // 线程不安全
            instance = new Singleton();
        }
        return instance;
    }
}
```

### 正确实现

**静态内部类**：

```java
class Singleton {
    private Singleton() { }
    
    private static class Holder {
        static final Singleton INSTANCE = new Singleton();
    }
    
    public static Singleton getInstance() {
        return Holder.INSTANCE;
    }
}
```

**优点**：

- 延迟初始化
- 线程安全（类加载机制保证）
- 无同步开销
- 简洁

**枚举单例**：

```java
enum Singleton {
    INSTANCE;
    
    public void doSomething() { }
}
```

**优点**：

- 天然单例
- 防止反射攻击
- 序列化安全

---

## 3. 案例：正确使用 ThreadLocal

### 问题代码

```java
class DateUtil {
    private static final ThreadLocal<SimpleDateFormat> formatter =
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
    
    public static String format(Date date) {
        return formatter.get().format(date);
    }
}

// 在线程池中使用
executor.execute(() -> {
    DateUtil.format(new Date());
    // 忘记清理
});
```

**问题**：

- 线程复用导致 ThreadLocal 泄漏

### 正确实现

```java
class DateUtil {
    private static final ThreadLocal<SimpleDateFormat> formatter =
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
    
    public static String format(Date date) {
        try {
            return formatter.get().format(date);
        } finally {
            formatter.remove();  // 清理
        }
    }
}
```

**更好的方案**（Java 8+）：

```java
// 使用 DateTimeFormatter（线程安全）
private static final DateTimeFormatter FORMATTER =
    DateTimeFormatter.ofPattern("yyyy-MM-dd");

public static String format(LocalDate date) {
    return FORMATTER.format(date);
}
```

---

## 4. 案例：异常处理最佳实践

### 资源管理

**错误写法**：

```java
void readFile(String path) {
    FileInputStream fis = new FileInputStream(path);
    // 读取文件
    fis.close();  // 异常时无法执行
}
```

**正确写法**：

```java
void readFile(String path) {
    try (FileInputStream fis = new FileInputStream(path)) {
        // 读取文件
    }  // 自动关闭
}
```

### 异常转换

**错误写法**：

```java
void method() {
    try {
        // 数据库操作
    } catch (SQLException e) {
        throw new RuntimeException(e);  // 丢失上下文
    }
}
```

**正确写法**：

```java
void method() {
    try {
        // 数据库操作
    } catch (SQLException e) {
        throw new DataAccessException("Failed to access data", e);
    }
}
```

---

## 5. 最佳实践总结

### 并发编程

**原则**：

1. **不可变对象**：优先使用不可变对象
2. **并发集合**：使用 ConcurrentHashMap 等
3. **原子类**：使用 AtomicInteger 等
4. **Lock**：复杂场景使用 Lock 代替 synchronized
5. **线程池**：复用线程，避免频繁创建

**示例**：

```java
// 不可变对象
final class Point {
    private final int x;
    private final int y;
    
    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
    
    // 只提供 getter
}

// 线程池
ExecutorService executor = Executors.newFixedThreadPool(10);
```

### 性能优化

**原则**：

1. **先测量，再优化**
2. **优化热点代码**
3. **避免过早优化**
4. **权衡可读性与性能**

**工具**：

- JMH：基准测试
- VisualVM：性能分析
- async-profiler：火焰图

### 内存管理

**原则**：

1. **及时释放资源**：try-with-resources
2. **避免内存泄漏**：监听器、ThreadLocal
3. **合理配置堆**：-Xms = -Xmx
4. **选择合适的 GC**：G1、ZGC

### 代码质量

**原则**：

1. **遵循编码规范**：命名、格式
2. **减少嵌套层次**：提取方法
3. **单一职责**：一个类/方法只做一件事
4. **防御性编程**：参数校验、异常处理

**示例**：

```java
// 参数校验
public void process(String input) {
    Objects.requireNonNull(input, "input must not be null");
    if (input.isEmpty()) {
        throw new IllegalArgumentException("input must not be empty");
    }
    // 处理逻辑
}
```

---

## 6. 常见反模式

### 1. 字符串拼接

**反模式**：

```java
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i;
}
```

**正确**：

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

### 2. 异常控制流程

**反模式**：

```java
try {
    int index = 0;
    while (true) {
        process(array[index++]);
    }
} catch (ArrayIndexOutOfBoundsException e) {
    // 结束
}
```

**正确**：

```java
for (int i = 0; i < array.length; i++) {
    process(array[i]);
}
```

### 3. 过度同步

**反模式**：

```java
class Service {
    synchronized void method1() { }
    synchronized void method2() { }
    synchronized void method3() { }
}
```

**正确**：

```java
class Service {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    
    void method1() {
        synchronized (lock1) { }
    }
    
    void method2() {
        synchronized (lock2) { }
    }
}
```

### 4. 忽略异常

**反模式**：

```java
try {
    riskyOperation();
} catch (Exception e) {
    // 吞掉异常
}
```

**正确**：

```java
try {
    riskyOperation();
} catch (Exception e) {
    logger.error("Failed to execute operation", e);
    throw new RuntimeException("Operation failed", e);
}
```

---

## 7. 代码审查清单

### 性能

- [ ] 避免不必要的对象创建
- [ ] 使用 StringBuilder 拼接字符串
- [ ] 集合设置初始容量
- [ ] 避免在循环中调用重方法
- [ ] 使用合适的数据结构

### 并发

- [ ] 正确使用 synchronized
- [ ] volatile 用于可见性
- [ ] 避免死锁
- [ ] ThreadLocal 及时清理
- [ ] 使用并发集合

### 资源管理

- [ ] try-with-resources 管理资源
- [ ] finally 块清理资源
- [ ] 避免资源泄漏

### 异常处理

- [ ] 不吞掉异常
- [ ] 提供上下文信息
- [ ] 使用合适的异常类型
- [ ] 避免异常控制流程

---

## 关键点总结

1. **高性能缓存**：并发安全 + LRU + 内存可控
2. **单例模式**：静态内部类或枚举
3. **ThreadLocal**：及时清理，避免泄漏
4. **异常处理**：try-with-resources + 异常转换
5. **最佳实践**：不可变对象、并发集合、先测量再优化
6. **反模式**：避免字符串拼接、异常控制流、过度同步

---

## 参考资料

- 《Effective Java（第3版）》- 全书
- 《Java 并发编程实战》- 全书
- 《重构：改善既有代码的设计》
- 《Clean Code》
- Google Java Style Guide
- Alibaba Java Coding Guidelines

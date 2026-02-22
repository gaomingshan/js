# 常见性能问题与优化

## 概述

Java 应用的性能问题通常来源于内存泄漏、GC 压力、锁竞争等。理解常见性能问题的根源和优化方法，是提升应用性能的关键。

本章聚焦：
- **内存泄漏的定位与修复**
- **GC 调优策略**
- **锁优化与并发性能**
- **代码层面的优化**

---

## 1. 内存泄漏

### 常见内存泄漏场景

**1. 静态集合持有对象**：

```java
class Cache {
    private static Map<String, Object> cache = new HashMap<>();
    
    void add(String key, Object value) {
        cache.put(key, value);  // 对象永不释放
    }
}
```

**修复**：

```java
private static Map<String, WeakReference<Object>> cache = new WeakHashMap<>();
```

**2. 监听器未移除**：

```java
button.addActionListener(listener);
// 忘记 removeActionListener(listener)
```

**3. ThreadLocal 未清理**：

```java
void process() {
    threadLocal.set(value);
    // 忘记 threadLocal.remove()
}
```

**4. 数据库连接未关闭**：

```java
Connection conn = getConnection();
// 忘记 conn.close()
```

---

## 2. GC 调优

### 调优目标

**选择优化目标**：

1. **低延迟**：最小化 GC 暂停时间
2. **高吞吐量**：最大化应用执行时间
3. **内存占用**：最小化堆内存

**无法同时优化三者**

### 调优步骤

**1. 分析 GC 日志**：

```bash
-Xlog:gc*:file=gc.log
```

**2. 识别问题**：

- GC 频率过高？
- GC 暂停时间过长？
- 内存占用过高？

**3. 调整参数**：

**降低 GC 频率**：

```bash
-Xmn2g  # 增大新生代
```

**降低暂停时间**：

```bash
-XX:+UseG1GC  # 使用 G1 收集器
-XX:MaxGCPauseMillis=200  # 目标暂停时间
```

**提高吞吐量**：

```bash
-XX:+UseParallelGC  # 使用 Parallel 收集器
-XX:GCTimeRatio=99  # 吞吐量目标
```

**4. 验证效果**：

观察 GC 日志，评估改进

---

## 3. 堆内存配置

### 堆大小设置

**原则**：

1. `-Xms` 和 `-Xmx` 设置相同（避免扩容）
2. 新生代约占堆的 1/3 到 1/2
3. 每个 Survivor 区约占新生代的 1/10

**示例**：

```bash
-Xms4g -Xmx4g  # 堆 4 GB
-Xmn1g         # 新生代 1 GB
-XX:SurvivorRatio=8  # Eden:Survivor = 8:1
```

### 避免过大或过小的堆

**堆过小**：

- 频繁 GC
- 可能 OOM

**堆过大**：

- GC 暂停时间长
- 启动慢

**推荐**：

- 小应用：512 MB - 2 GB
- 中等应用：2 GB - 8 GB
- 大应用：8 GB - 32 GB
- 超大应用：考虑 ZGC 或分布式

---

## 4. 锁优化

### 减少锁的持有时间

**问题代码**：

```java
synchronized (lock) {
    // 大量无关操作
    prepareData();
    processData();
    logResult();
}
```

**优化**：

```java
prepareData();
synchronized (lock) {
    processData();  // 只锁定必需的部分
}
logResult();
```

### 减少锁的粒度

**问题代码**：

```java
class Account {
    synchronized void deposit(int amount) { }
    synchronized void withdraw(int amount) { }
}

// 多个账户操作互相阻塞
```

**优化**：

```java
class Account {
    private final Object lock = new Object();
    
    void deposit(int amount) {
        synchronized (lock) {  // 每个账户独立锁
            // ...
        }
    }
}
```

### 使用读写锁

**场景**：读多写少

```java
class Cache {
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private Map<String, Object> data = new HashMap<>();
    
    Object get(String key) {
        lock.readLock().lock();
        try {
            return data.get(key);
        } finally {
            lock.readLock().unlock();
        }
    }
    
    void put(String key, Object value) {
        lock.writeLock().lock();
        try {
            data.put(key, value);
        } finally {
            lock.writeLock().unlock();
        }
    }
}
```

### 使用 CAS 代替锁

**使用 AtomicInteger**：

```java
// 替代 synchronized
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();
```

---

## 5. 代码层面优化

### 避免创建不必要的对象

**问题代码**：

```java
for (int i = 0; i < 1000; i++) {
    String s = new String("temp");  // 每次创建新对象
}
```

**优化**：

```java
String s = "temp";  // 复用常量池对象
for (int i = 0; i < 1000; i++) {
    // 使用 s
}
```

### 使用 StringBuilder

**问题代码**：

```java
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i;  // 每次创建新 String
}
```

**优化**：

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

### 懒加载

**问题代码**：

```java
class Service {
    private HeavyObject obj = new HeavyObject();  // 启动时创建
}
```

**优化**：

```java
class Service {
    private HeavyObject obj;
    
    HeavyObject getObj() {
        if (obj == null) {
            obj = new HeavyObject();  // 首次使用时创建
        }
        return obj;
    }
}
```

### 对象池

**场景**：频繁创建/销毁对象

```java
class ObjectPool<T> {
    private final Queue<T> pool = new ConcurrentLinkedQueue<>();
    
    T acquire() {
        T obj = pool.poll();
        return obj != null ? obj : createNew();
    }
    
    void release(T obj) {
        pool.offer(obj);
    }
}
```

**注意**：

- 对象池维护成本
- 现代 JVM 对象分配很快
- 谨慎使用

---

## 6. 数据结构选择

### 合适的集合类型

**ArrayList vs LinkedList**：

```java
// 随机访问多：ArrayList
List<String> list = new ArrayList<>();

// 插入/删除多：LinkedList
List<String> list = new LinkedList<>();
```

**HashMap vs ConcurrentHashMap**：

```java
// 单线程：HashMap
Map<String, Object> map = new HashMap<>();

// 多线程：ConcurrentHashMap
Map<String, Object> map = new ConcurrentHashMap<>();
```

### 初始容量

**问题代码**：

```java
List<String> list = new ArrayList<>();  // 默认容量 10
for (int i = 0; i < 10000; i++) {
    list.add("item");  // 多次扩容
}
```

**优化**：

```java
List<String> list = new ArrayList<>(10000);  // 预分配容量
for (int i = 0; i < 10000; i++) {
    list.add("item");
}
```

---

## 7. I/O 优化

### 使用缓冲流

**问题代码**：

```java
FileInputStream fis = new FileInputStream("file.txt");
int b;
while ((b = fis.read()) != -1) {  // 每次读取 1 字节
    // ...
}
```

**优化**：

```java
BufferedInputStream bis = new BufferedInputStream(new FileInputStream("file.txt"));
int b;
while ((b = bis.read()) != -1) {  // 缓冲读取
    // ...
}
```

### NIO vs BIO

**BIO（阻塞 IO）**：

```java
ServerSocket server = new ServerSocket(8080);
while (true) {
    Socket client = server.accept();  // 阻塞
    // 处理连接（每个连接一个线程）
}
```

**NIO（非阻塞 IO）**：

```java
Selector selector = Selector.open();
ServerSocketChannel server = ServerSocketChannel.open();
server.bind(new InetSocketAddress(8080));
server.configureBlocking(false);
server.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select();  // 多路复用
    // 处理就绪的连接
}
```

---

## 易错点与最佳实践

### 1. 过度优化

**问题**：

- 过早优化
- 优化收益小

**原则**：

1. 先测量，再优化
2. 优化热点代码（80/20 法则）
3. 权衡可读性与性能

### 2. 微基准测试陷阱

**问题**：

- JIT 编译影响
- 死代码消除
- 缓存效应

**解决**：

- 使用 JMH
- 充分预热
- 确保代码被使用

### 3. 生产环境优化

**谨慎**：

- 更改 GC 参数
- 更改堆大小

**建议**：

- 先在测试环境验证
- 逐步调整
- 持续监控

---

## 实际案例

### 案例 1：降低 GC 频率

**问题**：

- Young GC 每秒 10 次
- 暂停时间：50 ms
- 影响响应时间

**分析**：

```bash
jstat -gcutil <pid> 1000
```

新生代使用率快速上升

**优化**：

```bash
# 原配置
-Xmx4g -Xmn512m

# 优化后
-Xmx4g -Xmn2g  # 增大新生代
```

**效果**：

- Young GC 降低到每秒 2 次
- 响应时间改善

### 案例 2：优化锁竞争

**问题**：

- CPU 使用率低
- 线程大量阻塞

**分析**：

```bash
jstack <pid> | grep BLOCKED
```

发现大量线程阻塞在同一个锁

**代码**：

```java
class Service {
    synchronized void process() {
        // 长时间操作
    }
}
```

**优化**：

```java
class Service {
    private final Object lock = new Object();
    
    void process() {
        // 无需锁的操作
        prepareData();
        
        synchronized (lock) {
            // 需要锁的操作
            criticalSection();
        }
        
        // 无需锁的操作
        cleanup();
    }
}
```

**效果**：

- 锁持有时间降低
- 吞吐量提升

### 案例 3：优化对象创建

**问题**：

- GC 压力大
- Young GC 频繁

**分析**：

使用 VisualVM 内存 Profiling

发现大量临时对象创建

**代码**：

```java
for (int i = 0; i < 1000000; i++) {
    String s = new String("temp");
    process(s);
}
```

**优化**：

```java
String s = "temp";  // 复用
for (int i = 0; i < 1000000; i++) {
    process(s);
}
```

**效果**：

- 对象分配速率降低
- GC 频率降低

---

## 关键点总结

1. **内存泄漏**：静态集合、监听器、ThreadLocal
2. **GC 调优**：选择目标、调整参数、验证效果
3. **堆配置**：Xms = Xmx，合理的新生代大小
4. **锁优化**：减少持有时间、减小粒度、读写锁
5. **代码优化**：避免不必要对象、StringBuilder、懒加载
6. **数据结构**：选择合适类型、设置初始容量

---

## 参考资料

- 《Java 性能权威指南》- 全书
- 《Effective Java（第3版）》- Item 67：明智地使用优化
- Oracle 官方文档：[Performance Tuning](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/)
- 工具：JMH、VisualVM、async-profiler

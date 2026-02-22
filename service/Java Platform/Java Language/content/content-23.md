# 引用类型与内存泄漏

## 概述

Java 提供四种引用类型，控制对象的可达性和回收时机。理解不同引用类型的语义，可以实现缓存、资源清理等高级内存管理功能，同时避免内存泄漏。

本章聚焦：
- **四种引用类型**：强、软、弱、虚引用
- **引用队列的使用**
- **WeakHashMap 的实现原理**
- **常见内存泄漏场景**

---

## 1. 四种引用类型

### 强引用（Strong Reference）

**定义**：普通的对象引用

**示例**：

```java
Object obj = new Object();  // 强引用
```

**特点**：

- 只要强引用存在，对象永不回收
- 即使 OutOfMemoryError，也不回收

**释放**：

```java
obj = null;  // 断开强引用
```

### 软引用（SoftReference）

**定义**：内存不足时才回收

**示例**：

```java
SoftReference<byte[]> soft = new SoftReference<>(new byte[1024]);
byte[] data = soft.get();  // 获取对象（可能为 null）
```

**回收时机**：

```
内存充足：保留软引用对象
内存不足：回收软引用对象
```

**适用场景**：缓存

```java
class ImageCache {
    private Map<String, SoftReference<Image>> cache = new HashMap<>();
    
    Image getImage(String path) {
        SoftReference<Image> ref = cache.get(path);
        if (ref != null) {
            Image img = ref.get();
            if (img != null) {
                return img;  // 缓存命中
            }
        }
        
        // 缓存未命中，加载图片
        Image img = loadImage(path);
        cache.put(path, new SoftReference<>(img));
        return img;
    }
}
```

**优点**：

- 内存充足时，缓存有效
- 内存不足时，自动清理缓存，避免 OOM

### 弱引用（WeakReference）

**定义**：下次 GC 时一定回收

**示例**：

```java
WeakReference<byte[]> weak = new WeakReference<>(new byte[1024]);
byte[] data = weak.get();  // 可能为 null
```

**回收时机**：

```
下次 GC：无论内存是否充足，都回收
```

**适用场景**：

**1. WeakHashMap**：

```java
WeakHashMap<Key, Value> map = new WeakHashMap<>();
map.put(key, value);

key = null;  // 断开强引用
System.gc();  // 触发 GC
// map 中的 entry 自动被移除
```

**2. ThreadLocal 防止内存泄漏**：

```java
class ThreadLocal<T> {
    static class Entry extends WeakReference<ThreadLocal<?>> {
        Object value;
        
        Entry(ThreadLocal<?> key, Object value) {
            super(key);  // ThreadLocal 作为弱引用
            this.value = value;
        }
    }
}
```

### 虚引用（PhantomReference）

**定义**：无法通过引用获取对象，用于跟踪对象回收

**示例**：

```java
ReferenceQueue<byte[]> queue = new ReferenceQueue<>();
PhantomReference<byte[]> phantom = new PhantomReference<>(new byte[1024], queue);

byte[] data = phantom.get();  // 总是返回 null
```

**作用**：

- 对象被回收前，PhantomReference 加入 ReferenceQueue
- 可用于清理堆外内存（DirectByteBuffer）

**应用**：

```java
class ResourceTracker {
    private ReferenceQueue<Resource> queue = new ReferenceQueue<>();
    private Set<PhantomReference<Resource>> refs = new HashSet<>();
    
    void track(Resource resource) {
        PhantomReference<Resource> ref = new PhantomReference<>(resource, queue);
        refs.add(ref);
    }
    
    void cleanup() {
        Reference<? extends Resource> ref;
        while ((ref = queue.poll()) != null) {
            // 对象已被回收，执行清理操作
            cleanupNativeResource(ref);
            refs.remove(ref);
        }
    }
}
```

---

## 2. 引用队列（ReferenceQueue）

### 作用

**通知机制**：引用对象被回收后，加入队列

### 使用流程

**1. 创建引用队列**：

```java
ReferenceQueue<byte[]> queue = new ReferenceQueue<>();
```

**2. 创建引用对象**：

```java
WeakReference<byte[]> weak = new WeakReference<>(new byte[1024], queue);
```

**3. 对象被回收后，检查队列**：

```java
Reference<? extends byte[]> ref = queue.poll();
if (ref != null) {
    // 对象已被回收
}
```

### 完整示例

```java
class CacheWithCleanup {
    private Map<String, WeakReference<Image>> cache = new HashMap<>();
    private ReferenceQueue<Image> queue = new ReferenceQueue<>();
    
    void put(String key, Image value) {
        cache.put(key, new WeakReference<>(value, queue));
    }
    
    Image get(String key) {
        cleanupStaleEntries();  // 清理过期 entry
        
        WeakReference<Image> ref = cache.get(key);
        return (ref != null) ? ref.get() : null;
    }
    
    private void cleanupStaleEntries() {
        Reference<? extends Image> ref;
        while ((ref = queue.poll()) != null) {
            // 从 cache 中移除对应的 entry
            cache.values().remove(ref);
        }
    }
}
```

---

## 3. WeakHashMap 的实现原理

### 内部结构

```java
public class WeakHashMap<K, V> {
    private Entry<K, V>[] table;
    private ReferenceQueue<Object> queue = new ReferenceQueue<>();
    
    private static class Entry<K, V> extends WeakReference<Object> implements Map.Entry<K, V> {
        V value;
        int hash;
        Entry<K, V> next;
        
        Entry(Object key, V value, ReferenceQueue<Object> queue, int hash, Entry<K, V> next) {
            super(key, queue);  // key 作为弱引用
            this.value = value;
            this.hash = hash;
            this.next = next;
        }
        
        public K getKey() {
            return (K) get();  // 从弱引用获取 key
        }
    }
}
```

### 清理过期 Entry

**时机**：每次操作前

```java
private void expungeStaleEntries() {
    Reference<? extends K> ref;
    while ((ref = queue.poll()) != null) {
        Entry<K, V> entry = (Entry<K, V>) ref;
        int hash = entry.hash;
        int index = indexFor(hash, table.length);
        
        // 从链表中移除 entry
        Entry<K, V> prev = table[index];
        Entry<K, V> curr = prev;
        while (curr != null) {
            Entry<K, V> next = curr.next;
            if (curr == entry) {
                if (prev == entry) {
                    table[index] = next;
                } else {
                    prev.next = next;
                }
                entry.value = null;  // 清理 value
                size--;
                break;
            }
            prev = curr;
            curr = next;
        }
    }
}
```

### 使用示例

```java
WeakHashMap<User, Session> sessions = new WeakHashMap<>();

User user = new User("Alice");
sessions.put(user, new Session());

user = null;  // 断开强引用
System.gc();  // 触发 GC

// user 被回收，sessions 中的 entry 自动移除
```

---

## 4. 常见内存泄漏场景

### 1. 集合类持有对象引用

**问题**：

```java
class Cache {
    private static List<Object> cache = new ArrayList<>();
    
    void add(Object obj) {
        cache.add(obj);  // 对象永远不会被回收
    }
}
```

**解决**：

```java
class Cache {
    private static Map<Object, WeakReference<Object>> cache = new WeakHashMap<>();
    
    void add(Object key, Object value) {
        cache.put(key, new WeakReference<>(value));
    }
}
```

### 2. 监听器未移除

**问题**：

```java
button.addActionListener(new ActionListener() {
    public void actionPerformed(ActionEvent e) {
        // ...
    }
});

// button 持有匿名内部类的引用
// 匿名内部类持有外部类的引用
// 导致外部类无法被回收
```

**解决**：

```java
ActionListener listener = new ActionListener() { ... };
button.addActionListener(listener);

// 使用完毕后移除
button.removeActionListener(listener);
```

### 3. ThreadLocal 未清理

**问题**：

```java
class Service {
    private static ThreadLocal<Connection> threadLocal = new ThreadLocal<>();
    
    void process() {
        Connection conn = getConnection();
        threadLocal.set(conn);
        
        // 处理业务
        
        // 忘记调用 remove()
    }
}
```

**影响**：

- 线程池中的线程复用
- ThreadLocal 中的对象一直被引用
- 导致内存泄漏

**解决**：

```java
void process() {
    try {
        Connection conn = getConnection();
        threadLocal.set(conn);
        
        // 处理业务
    } finally {
        threadLocal.remove();  // 一定要清理
    }
}
```

### 4. 静态集合持有对象

**问题**：

```java
class Registry {
    private static Map<String, Service> services = new HashMap<>();
    
    static void register(String name, Service service) {
        services.put(name, service);
    }
    
    // 没有提供 unregister 方法
}
```

**解决**：

```java
static void unregister(String name) {
    services.remove(name);
}

// 或使用弱引用
private static Map<String, WeakReference<Service>> services = new HashMap<>();
```

### 5. 内部类持有外部类引用

**问题**：

```java
class Outer {
    private byte[] data = new byte[1024 * 1024];
    
    class Inner {
        void method() {
            // 内部类隐式持有 Outer.this 引用
        }
    }
    
    Inner getInner() {
        return new Inner();
    }
}

Inner inner = new Outer().getInner();
// Outer 对象无法被回收（Inner 持有引用）
```

**解决**：

```java
// 使用静态内部类
static class Inner {
    void method() {
        // 不持有外部类引用
    }
}
```

### 6. 未关闭的资源

**问题**：

```java
void readFile(String path) {
    FileInputStream fis = new FileInputStream(path);
    // 读取文件
    
    // 忘记关闭流
}
```

**解决**：

```java
try (FileInputStream fis = new FileInputStream(path)) {
    // 读取文件
}  // 自动关闭
```

---

## 5. 内存泄漏检测与分析

### 使用 jmap 生成堆转储

**命令**：

```bash
jmap -dump:format=b,file=heap.hprof <pid>
```

### 使用 MAT 分析堆转储

**Memory Analyzer Tool**：

1. 打开 heap.hprof
2. 查看 Leak Suspects（泄漏嫌疑）
3. 分析 Dominator Tree（支配树）
4. 查看对象的 GC Roots 路径

**示例**：

```
GC Root: Thread "main"
  └─> threadLocals (ThreadLocalMap)
      └─> Entry[0]
          └─> value (Connection)
              └─> statement
                  └─> resultSet (1 MB)
```

**结论**：ThreadLocal 未清理，导致 Connection 泄漏。

### 使用 VisualVM

**堆快照对比**：

1. 执行操作前，生成堆快照 A
2. 执行操作（如创建对象）
3. 执行操作后，生成堆快照 B
4. 对比 A 和 B，查看新增对象

---

## 易错点与边界行为

### 1. 软引用的回收策略

**回收顺序**：

1. 优先回收最近最少使用（LRU）的软引用
2. 根据内存压力决定回收力度

**JVM 参数**：

```bash
-XX:SoftRefLRUPolicyMSPerMB=1000  # 每 MB 空闲内存，软引用存活 1 秒
```

### 2. 弱引用与 GC 时机

**问题**：

```java
WeakReference<byte[]> weak = new WeakReference<>(new byte[1024]);
byte[] data1 = weak.get();  // 非 null
System.gc();
byte[] data2 = weak.get();  // 可能为 null
```

**注意**：`System.gc()` 只是建议，不保证立即执行。

### 3. PhantomReference 的 get() 总是返回 null

**原因**：

- 虚引用的目的是跟踪对象回收，而非访问对象
- 防止对象复活

### 4. ReferenceQueue 的线程安全

**问题**：

```java
ReferenceQueue<Object> queue = new ReferenceQueue<>();

// 线程 1
queue.poll();

// 线程 2
queue.poll();
```

**ReferenceQueue 是线程安全的**，可以多线程访问。

---

## 实际推导案例

### 案例：为什么 ThreadLocalMap 使用弱引用？

**结构**：

```java
class ThreadLocalMap {
    static class Entry extends WeakReference<ThreadLocal<?>> {
        Object value;
        
        Entry(ThreadLocal<?> key, Object value) {
            super(key);  // ThreadLocal 作为弱引用
            this.value = value;
        }
    }
}
```

**原因**：

**场景**：

```java
ThreadLocal<Connection> threadLocal = new ThreadLocal<>();
threadLocal.set(connection);

threadLocal = null;  // ThreadLocal 对象不再被引用
```

**如果 Entry 使用强引用**：

```
Thread
  └─> ThreadLocalMap
      └─> Entry (强引用 ThreadLocal)
          └─> ThreadLocal 对象无法被回收
          └─> value (Connection)
```

**使用弱引用**：

```
threadLocal = null 后，ThreadLocal 对象被回收
Entry 的 key 变为 null
后续操作时，清理 key 为 null 的 Entry
```

**但 value 仍可能泄漏**：

- 如果线程不结束，Entry 不会被清理
- 需要显式调用 `threadLocal.remove()`

### 案例：实现一个简单的缓存

**需求**：

- 内存充足时，缓存有效
- 内存不足时，自动清理

**实现**：

```java
class SimpleCache<K, V> {
    private Map<K, SoftReference<V>> cache = new ConcurrentHashMap<>();
    
    void put(K key, V value) {
        cache.put(key, new SoftReference<>(value));
    }
    
    V get(K key) {
        SoftReference<V> ref = cache.get(key);
        if (ref != null) {
            V value = ref.get();
            if (value != null) {
                return value;  // 缓存命中
            } else {
                cache.remove(key);  // 对象已被回收，移除 entry
            }
        }
        return null;  // 缓存未命中
    }
}
```

---

## 关键点总结

1. **强引用**：永不回收
2. **软引用**：内存不足时回收，适用于缓存
3. **弱引用**：下次 GC 时回收，适用于 WeakHashMap
4. **虚引用**：跟踪对象回收，用于清理堆外内存
5. **引用队列**：通知引用对象被回收
6. **内存泄漏**：集合、监听器、ThreadLocal、内部类、资源未关闭

---

## 深入一点

### 引用类型的实现

**Reference 基类**：

```java
public abstract class Reference<T> {
    private T referent;  // 引用的对象
    volatile ReferenceQueue<? super T> queue;  // 引用队列
    
    Reference next;  // 队列中的下一个引用
    
    private static Reference<Object> pending = null;  // 待加入队列的引用
    
    static {
        // ReferenceHandler 线程负责处理 pending 队列
        Thread handler = new ReferenceHandler(null, "Reference Handler");
        handler.setPriority(Thread.MAX_PRIORITY);
        handler.setDaemon(true);
        handler.start();
    }
}
```

**ReferenceHandler 线程**：

```java
private static class ReferenceHandler extends Thread {
    public void run() {
        while (true) {
            Reference<?> r = Reference.tryHandlePending(false);
            if (r != null) {
                r.queue.enqueue(r);  // 加入引用队列
            }
        }
    }
}
```

### 软引用的回收算法

**HotSpot 实现**：

```cpp
// 计算软引用的存活时间
clock_t ms_per_mb = SoftRefLRUPolicyMSPerMB;
size_t free_mb = heap.free_memory() >> 20;
clock_t lifetime = ms_per_mb * free_mb;

// 如果超过存活时间，回收软引用
if (current_time - ref.last_access_time > lifetime) {
    clear_referent(ref);
}
```

**调优**：

```bash
-XX:SoftRefLRUPolicyMSPerMB=1000  # 默认值
```

---

## 参考资料

- 《深入理解 Java 虚拟机（第3版）》- 3.2.4 节引用类型
- 《Effective Java（第3版）》- Item 7：消除过期的对象引用
- Oracle 官方文档：[Reference Objects](https://docs.oracle.com/javase/8/docs/api/java/lang/ref/package-summary.html)
- 工具：MAT、VisualVM、jmap

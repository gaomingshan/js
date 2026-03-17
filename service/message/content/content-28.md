# 零拷贝与内存映射

## 概述

零拷贝（Zero Copy）和内存映射（Memory Mapping）通过减少数据拷贝次数，显著提升I/O性能。本章深入探讨这两种技术在消息队列中的应用。

---

## 1. 传统I/O vs 零拷贝

### 1.1 传统I/O流程

```
读取文件并发送到网络（4次拷贝，4次上下文切换）：

1. 磁盘 → 内核缓冲区（DMA拷贝）
2. 内核缓冲区 → 应用缓冲区（CPU拷贝）
3. 应用缓冲区 → Socket缓冲区（CPU拷贝）
4. Socket缓冲区 → 网卡（DMA拷贝）

问题：
- 2次CPU拷贝（浪费CPU）
- 4次上下文切换（用户态↔内核态）
```

### 1.2 零拷贝流程

```
sendfile 系统调用（2次拷贝，2次上下文切换）：

1. 磁盘 → 内核缓冲区（DMA拷贝）
2. 内核缓冲区 → 网卡（DMA拷贝）

优势：
- 无CPU拷贝
- 2次上下文切换
- 性能提升30%-40%
```

---

## 2. Kafka 零拷贝

### 2.1 sendfile 实现

```java
// Kafka 使用 FileChannel.transferTo()
FileChannel fileChannel = new RandomAccessFile(file, "r").getChannel();
SocketChannel socketChannel = SocketChannel.open(serverAddress);

// 零拷贝传输
long position = 0;
long count = fileChannel.size();
long transferred = fileChannel.transferTo(position, count, socketChannel);
```

### 2.2 Page Cache 利用

```
写入流程：
Producer → Kafka Broker → Page Cache → 磁盘（异步）

读取流程（热数据）：
Page Cache → Consumer（零拷贝）

读取流程（冷数据）：
磁盘 → Page Cache → Consumer
```

**优势**：
- 操作系统自动管理Page Cache
- 顺序读写性能接近内存
- 减少JVM GC压力

---

## 3. RocketMQ 内存映射

### 3.1 mmap 原理

```java
// RocketMQ 使用 MappedByteBuffer
MappedByteBuffer mappedByteBuffer = fileChannel.map(
    FileChannel.MapMode.READ_WRITE,
    0,
    fileSize
);

// 直接操作内存
mappedByteBuffer.put(data);

// 自动刷盘（操作系统控制）
```

### 3.2 mmap vs 传统I/O

```
传统I/O：
write() → 用户缓冲区 → 内核缓冲区 → 磁盘

mmap：
write() → 虚拟内存（Page Cache） → 磁盘

优势：
- 减少一次数据拷贝
- 读写都是内存操作
- 操作系统异步刷盘
```

---

## 4. 顺序写 vs 随机写

### 4.1 性能对比

```
SSD 顺序写：500 MB/s
SSD 随机写：100 MB/s

HDD 顺序写：150 MB/s
HDD 随机写：1 MB/s

顺序写性能远高于随机写
```

### 4.2 Kafka 顺序写

```
Kafka 日志结构：
/topic/partition-0/
  00000000000000000000.log  # Segment 1
  00000000000000100000.log  # Segment 2
  00000000000000200000.log  # Segment 3

每个 Segment 顺序写入，性能接近内存
```

### 4.3 RocketMQ CommitLog

```
所有消息顺序写入 CommitLog：
/store/commitlog/
  00000000000000000000  # 1GB
  00000000001073741824  # 1GB
  00000000002147483648  # 1GB

顺序写保证高性能
```

---

## 5. Page Cache 优化

### 5.1 Page Cache 机制

```
Linux Page Cache：
- 自动缓存热数据
- LRU 算法淘汰冷数据
- 读写都经过 Page Cache
```

### 5.2 优化建议

```bash
# 增大 Page Cache
# 减少 swappiness（避免 swap）
sysctl vm.swappiness=1

# 调整脏页刷盘策略
sysctl vm.dirty_ratio=80
sysctl vm.dirty_background_ratio=5

# 预读优化
sysctl vm.vfs_cache_pressure=50
```

---

## 6. 零拷贝技术对比

| 技术 | 拷贝次数 | 上下文切换 | 使用场景 |
|------|---------|-----------|---------|
| 传统I/O | 4次 | 4次 | 小文件 |
| sendfile | 2次 | 2次 | 文件传输（Kafka） |
| mmap | 1次 | 1次 | 读写操作（RocketMQ） |
| splice | 0次 | 2次 | 管道传输 |

---

## 7. 性能测试

### 7.1 Kafka 性能

```bash
# 使用零拷贝
bin/kafka-producer-perf-test.sh \
  --topic test \
  --num-records 10000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props bootstrap.servers=localhost:9092

# 结果：100000+ TPS
```

### 7.2 性能提升

```
无零拷贝：60000 TPS
使用零拷贝：80000 TPS
提升：33%

CPU 使用率：
无零拷贝：50%
使用零拷贝：30%
降低：40%
```

---

## 8. I/O 优化建议

### 8.1 硬件层面

```
1. 使用 SSD（顺序写性能 > HDD 10倍）
2. 使用 RAID10（性能和可靠性平衡）
3. 独立磁盘（日志和数据分离）
```

### 8.2 操作系统层面

```bash
# 文件系统选择
ext4 或 xfs（推荐 xfs）

# 挂载参数
noatime,nodiratime  # 减少访问时间更新

# I/O 调度器
noop 或 deadline（SSD）
cfq（HDD）
```

### 8.3 应用层面

```
1. 批量写入（减少系统调用）
2. 顺序写入（Kafka、RocketMQ）
3. 使用零拷贝（sendfile、mmap）
4. 预读优化
```

---

## 关键要点

1. **零拷贝**：减少CPU拷贝，提升性能30%-40%
2. **Page Cache**：操作系统自动缓存，顺序读写快
3. **sendfile**：Kafka使用，文件到网络零拷贝
4. **mmap**：RocketMQ使用，内存映射文件
5. **顺序写**：性能接近内存，远高于随机写

---

## 深入一点

**sendfile 系统调用**：

```c
// Linux sendfile 系统调用
ssize_t sendfile(int out_fd, int in_fd, off_t *offset, size_t count);

// 工作流程：
1. 数据从文件读到内核缓冲区（DMA）
2. 内核缓冲区数据直接发送到 Socket（DMA）
3. 无需经过用户空间

// Kafka 使用示例：
fileChannel.transferTo(position, count, socketChannel);
```

**mmap 内存映射**：

```c
// Linux mmap 系统调用
void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);

// 工作流程：
1. 文件映射到虚拟内存
2. 访问虚拟内存时触发 Page Fault
3. 操作系统加载数据到 Page Cache
4. 用户空间直接访问 Page Cache

// RocketMQ 使用：
MappedByteBuffer buffer = fileChannel.map(...);
buffer.put(data);  // 直接写入内存
```

---

## 参考资料

1. [Zero Copy](https://www.linuxjournal.com/article/6345)
2. [Kafka Zero Copy](https://kafka.apache.org/documentation/#design_filesystem)
3. [Linux mmap](https://man7.org/linux/man-pages/man2/mmap.2.html)

# 零拷贝与批量处理

## 概述

零拷贝和批量处理是消息队列提升性能的关键技术。本章深入探讨实现原理和优化方法。

---

## 1. 零拷贝原理

### 1.1 传统 I/O

```
传统方式（4 次拷贝，4 次上下文切换）：
1. 磁盘 → 内核缓冲区（DMA 拷贝）
2. 内核缓冲区 → 应用缓冲区（CPU 拷贝）
3. 应用缓冲区 → Socket 缓冲区（CPU 拷贝）
4. Socket 缓冲区 → 网卡（DMA 拷贝）
```

### 1.2 零拷贝（sendfile）

```
零拷贝方式（2 次拷贝，2 次上下文切换）：
1. 磁盘 → 内核缓冲区（DMA 拷贝）
2. 内核缓冲区 → 网卡（DMA 拷贝）

避免了 CPU 拷贝和应用缓冲区
```

---

## 2. Kafka 零拷贝

**实现**：

```java
// Kafka 使用 FileChannel.transferTo()
FileChannel fileChannel = new RandomAccessFile(file, "r").getChannel();
SocketChannel socketChannel = SocketChannel.open();

// 零拷贝传输
long position = 0;
long count = fileChannel.size();
fileChannel.transferTo(position, count, socketChannel);
```

**优势**：
- 减少 CPU 拷贝
- 减少上下文切换
- 提升 30%-40% 性能

---

## 3. Page Cache

**Kafka Page Cache**：

```
写入流程：
消息 → Page Cache → 磁盘（异步）

读取流程：
Page Cache → 消费者（热数据）
磁盘 → Page Cache → 消费者（冷数据）

优势：
- 顺序写入性能高
- OS 自动管理 Cache
- 减少 JVM GC
```

---

## 4. 批量处理

### 4.1 Kafka 批量发送

```java
// 批量累积
props.put("batch.size", 16384);
props.put("linger.ms", 10);

// 一次发送多条消息
```

### 4.2 批量消费

```java
// 批量拉取
props.put("max.poll.records", 500);

// 批量处理
ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
processBatch(records);  // 批量处理 500 条
```

---

## 关键要点

1. **零拷贝**：减少 CPU 拷贝，提升性能
2. **Page Cache**：Kafka 核心优化
3. **批量处理**：减少网络开销
4. **顺序写入**：磁盘顺序写性能接近内存

---

## 参考资料

1. [Linux Zero Copy](https://www.linuxjournal.com/article/6345)
2. [Kafka Zero Copy](https://kafka.apache.org/documentation/#design_filesystem)

# Broker 性能优化

## 概述

Broker 性能优化需要从存储、网络、内存等多方面入手。本章探讨三大消息队列的 Broker 优化策略。

---

## 1. Kafka Broker 优化

### 1.1 存储优化

```properties
# 使用 SSD
# 日志目录放在 SSD 上
log.dirs=/mnt/ssd/kafka-logs

# Page Cache 优化
# 增大操作系统 Page Cache
vm.swappiness=1
vm.dirty_ratio=80
vm.dirty_background_ratio=5

# 日志段大小（1GB）
log.segment.bytes=1073741824
```

### 1.2 网络优化

```properties
# 网络线程数（默认 3）
num.network.threads=8

# I/O 线程数（默认 8）
num.io.threads=16

# Socket 缓冲区
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
```

### 1.3 副本优化

```properties
# 副本拉取线程数
num.replica.fetchers=4

# 副本 I/O 线程数
replica.io.max.threads.per.broker=10
```

---

## 2. RocketMQ Broker 优化

### 2.1 刷盘优化

```properties
# 异步刷盘
flushDiskType=ASYNC_FLUSH

# 刷盘间隔
flushCommitLogInterval=500

# 预分配文件
warmMapedFileEnable=true
```

### 2.2 线程池优化

```properties
# 发送消息线程池
sendMessageThreadPoolNums=16

# 拉取消息线程池
pullMessageThreadPoolNums=16

# 查询消息线程池
queryMessageThreadPoolNums=8
```

---

## 3. RabbitMQ Broker 优化

### 3.1 内存优化

```conf
# rabbitmq.conf
vm_memory_high_watermark.relative = 0.6

# 使用惰性队列
# x-queue-mode = lazy
```

### 3.2 磁盘优化

```conf
# 磁盘空间阈值
disk_free_limit.absolute = 50GB
```

---

## 关键要点

1. **SSD**：显著提升 I/O 性能
2. **Page Cache**：Kafka 依赖 OS Page Cache
3. **线程池**：合理配置线程数
4. **异步刷盘**：平衡性能和可靠性

---

## 参考资料

1. [Kafka Production Configuration](https://kafka.apache.org/documentation/#brokerconfigs)
2. [RocketMQ Broker](https://rocketmq.apache.org/docs/deploymentOperations/01deploy)

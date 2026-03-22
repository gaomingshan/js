# 内存、磁盘与连接池调优

## 概述

资源调优是 MongoDB 性能优化的基础。本章系统讲解 WiredTiger Cache、磁盘 I/O、连接池三个维度的调优方法与生产配置建议。

---

## WiredTiger Cache 调优

### 配置

```yaml
# mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 16   # 核心配置项
```

```js
// 动态查看（无需重启）
db.adminCommand({ setParameter: 1, wiredTigerEngineRuntimeConfig: "cache_size=16G" })
```

### 内存规划公式

```
专用 MongoDB 服务器（推荐）：
  cacheSizeGB = (总内存 - 2GB) × 0.6

与其他进程共享：
  cacheSizeGB = 总内存 × 0.3

示例（64GB 服务器专用）：
  cacheSizeGB = (64 - 2) × 0.6 ≈ 37GB
  文件系统缓存（OS 自动）：~20GB
  系统/MongoDB 运行内存：~7GB
```

### 监控 Cache 健康

```js
const c = db.serverStatus().wiredTiger.cache
const metrics = {
  usageRatio:   (c["bytes currently in the cache"] / c["maximum bytes configured"] * 100).toFixed(1) + "%",
  dirtyRatio:   (c["tracked dirty bytes in the cache"] / c["maximum bytes configured"] * 100).toFixed(1) + "%",
  appEvictions: c["pages evicted by application threads"],  // 关键！应为 0
  diskReads:    c["pages read into cache"]                 // 缓存未命中次数
}
printjson(metrics)

// 告警阈值
// usageRatio > 90%   → 扩大 Cache 或增加内存
// dirtyRatio > 20%   → 磁盘 I/O 跟不上，换 SSD
// appEvictions 增长  → Cache 严重不足，紧急扩容
```

---

## 文件系统缓存

```
WiredTiger Cache（解压的 B-Tree 页）
    ↑ Cache Miss
OS Page Cache（压缩的原始文件块）
    ↑ Page Fault
磁盘（.wt 文件）

文件系统缓存是第二层缓冲：
  - WiredTiger 未命中 → 查 OS Cache
  - OS Cache 命中 → 加载到 WiredTiger Cache（仍需解压）
  - OS Cache 未命中 → 磁盘 I/O

建议：预留 20~40% 内存给 OS Page Cache
```

---

## 磁盘 I/O 优化

### 存储选型

```
推荐优先级：
  1. NVMe SSD（最佳）：延迟 < 0.1ms，吞吐 > 3GB/s
  2. SATA SSD（良好）：延迟 < 1ms，吞吐 500MB/s
  3. SAS HDD（勉强）：延迟 5~10ms，仅用于冷数据归档
  ❌ RAID 5/6（不推荐）：写惩罚高
  ✅ RAID 10（推荐）：兼顾性能与冗余
```

### 系统参数优化

```bash
# 1. 关闭透明大页（THP）—— MongoDB 强烈要求
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/defrag

# 设置开机自动关闭（rc.local 或 systemd service）

# 2. 磁盘调度算法
# SSD 使用 noop 或 mq-deadline
cat /sys/block/nvme0n1/queue/scheduler
echo mq-deadline | sudo tee /sys/block/nvme0n1/queue/scheduler

# 3. 预读大小（SSD 建议减小）
blockdev --getra /dev/nvme0n1    # 查看当前预读（512字节单位）
blockdev --setra 8 /dev/nvme0n1  # 设置为 4KB（SSD 推荐）

# 4. vm.swappiness（减少 Swap 使用）
echo "vm.swappiness=1" | sudo tee -a /etc/sysctl.conf
sysctl -p
```

### Journal 与数据文件分盘

```
推荐磁盘布局：
  /data/mongodb       → 数据 NVMe SSD（大容量）
  /data/mongodb/journal → 独立 SSD（低延迟，小容量即可）
  /var/log/mongodb    → 日志盘

配置：
  storage:
    dbPath: /data/mongodb
    journal:
      enabled: true
```

---

## 连接池调优

### 驱动侧配置（以 Java 为例）

```java
MongoClientSettings settings = MongoClientSettings.builder()
  .applyConnectionString(new ConnectionString(uri))
  .applyToConnectionPoolSettings(builder -> builder
    .maxSize(100)              // 最大连接数（默认 100）
    .minSize(10)               // 最小保持连接数
    .maxWaitTime(5000, TimeUnit.MILLISECONDS)   // 等待连接超时
    .maxConnectionIdleTime(60000, TimeUnit.MILLISECONDS)  // 空闲连接超时
    .maxConnectionLifeTime(3600000, TimeUnit.MILLISECONDS) // 连接最大生命周期
  )
  .applyToSocketSettings(builder -> builder
    .connectTimeout(5000, TimeUnit.MILLISECONDS)
    .readTimeout(30000, TimeUnit.MILLISECONDS)
  )
  .build();
```

```yaml
# Spring Boot application.yml
spring:
  data:
    mongodb:
      uri: mongodb://user:pass@host:27017/db?maxPoolSize=100&minPoolSize=10&connectTimeoutMS=5000
```

### 服务端最大连接数

```yaml
# mongod.conf
net:
  maxIncomingConnections: 65536  # 服务端最大连接数
```

```js
// 查看当前连接状态
const conn = db.serverStatus().connections
printjson({
  current:   conn.current,    // 当前连接数
  available: conn.available,  // 可用连接数
  totalCreated: conn.totalCreated  // 历史创建总数
})
// current / (current + available) > 80% → 连接池接近上限，扩大 maxPoolSize
```

### 连接数规划

```
服务端最大连接数 = 所有客户端实例的 maxPoolSize 之和 + 运维工具连接数

示例：
  10 个应用实例 × maxPoolSize:50 = 500 连接
  + 运维/监控工具 50 连接
  = 550 连接
  → maxIncomingConnections 至少 600

注意：每个连接占用约 1MB 内存
  500 连接 × 1MB = 500MB 内存
```

---

## ulimit 系统参数

```bash
# /etc/security/limits.conf
mongodb soft nofile  64000
mongodb hard nofile  64000
mongodb soft nproc   64000
mongodb hard nproc   64000
mongodb soft fsize   unlimited
mongodb hard fsize   unlimited

# 验证（以 mongodb 用户执行）
su - mongodb -c "ulimit -a"
```

---

## OOM 问题排查与预防

```bash
# 检查是否发生 OOM Kill
dmesg | grep -i "oom killer"
grep -i "out of memory" /var/log/syslog

# 预防措施
# 1. 正确配置 cacheSizeGB（不超过 50% RAM）
# 2. 设置 vm.swappiness=1
# 3. 容器环境显式设置内存限制和 cacheSizeGB
# 4. 监控内存使用率，超 80% 告警
```

---

## 总结

| 调优维度 | 核心配置 | 目标 |
|----------|----------|------|
| WiredTiger Cache | `cacheSizeGB` | 使用率 < 80%，appEvictions = 0 |
| 磁盘 | NVMe SSD + 关闭 THP | I/O 延迟 < 1ms |
| 连接池 | `maxPoolSize` + `minPoolSize` | 连接数 < 80% 上限 |
| 系统 | ulimit + swappiness | 无 OOM，无 Swap |

**下一步**：关键监控指标与告警体系。

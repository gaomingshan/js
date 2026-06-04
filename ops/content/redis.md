# Redis 部署运维指南

> **定位**：最流行的开源内存数据库，缓存 + 消息队列 + 分布式锁多面手
> **适用场景**：缓存、会话存储、排行榜、消息队列、分布式锁、实时计数
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Redis 是开源的内存数据结构存储，支持字符串、哈希、列表、集合、有序集合、Stream、位图、HyperLogLog、地理空间等数据类型，单线程模型保证原子性。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **丰富数据类型** | String/Hash/List/Set/ZSet/Stream/Bitmap/Geo |
| **持久化** | RDB 快照 + AOF 追加日志，可组合使用 |
| **主从复制** | 异步复制，读写分离基础 |
| **Sentinel** | 自动故障转移，监控 + 通知 |
| **Cluster** | 分片集群，16384 槽自动分布 |
| **Lua 脚本** | 原子执行复杂操作 |
| **Pub/Sub + Stream** | 消息发布订阅和持久化消息队列 |

### 1.3 适用场景

**最佳适用**：缓存（热点数据加速）、会话存储、排行榜/计数器、分布式锁、消息队列（轻量）

**不适用**：大数据量持久存储（→ MySQL/PG）、复杂查询（→ RDBMS）、可靠消息队列（→ Kafka/RabbitMQ）

---

## 2. 部署

### 2.1 裸机部署

**CentOS（Redis 7.2）**：

```bash
sudo yum install -y redis
sudo systemctl start redis && sudo systemctl enable redis
redis-cli ping   # 返回 PONG 表示成功
```

**源码编译（推荐，获取最新版）**：

```bash
wget https://github.com/redis/redis/archive/refs/tags/7.2.4.tar.gz
tar xzf 7.2.4.tar.gz && cd redis-7.2.4
make -j$(nproc) && sudo make install
sudo mkdir -p /etc/redis /var/lib/redis /var/log/redis
sudo cp redis.conf /etc/redis/redis.conf
```

**关键目录**：

| 路径 | 用途 |
|------|------|
| `/etc/redis/redis.conf` | 主配置文件 |
| `/var/lib/redis/` | 数据目录（RDB/AOF） |
| `/var/log/redis/` | 日志目录 |

### 2.2 Docker 部署

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v redis-data:/data \
  -v ./conf/redis.conf:/usr/local/etc/redis/redis.conf \
  --restart unless-stopped \
  redis:7.2 redis-server /usr/local/etc/redis/redis.conf
```

### 2.3 Docker Compose 部署（Sentinel 高可用）

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis-master:
    image: redis:7.2
    container_name: redis-master
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - master-data:/data
      - ./conf/redis-master.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - redis-net

  redis-slave-1:
    image: redis:7.2
    container_name: redis-slave-1
    restart: unless-stopped
    ports:
      - "6380:6379"
    volumes:
      - slave-1-data:/data
      - ./conf/redis-slave.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    depends_on:
      - redis-master
    networks:
      - redis-net

  redis-slave-2:
    image: redis:7.2
    container_name: redis-slave-2
    restart: unless-stopped
    ports:
      - "6381:6379"
    volumes:
      - slave-2-data:/data
      - ./conf/redis-slave.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    depends_on:
      - redis-master
    networks:
      - redis-net

  redis-sentinel-1:
    image: redis:7.2
    container_name: redis-sentinel-1
    restart: unless-stopped
    ports:
      - "26379:26379"
    volumes:
      - ./conf/sentinel.conf:/usr/local/etc/redis/sentinel.conf
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    depends_on:
      - redis-master
    networks:
      - redis-net

  redis-sentinel-2:
    image: redis:7.2
    container_name: redis-sentinel-2
    restart: unless-stopped
    ports:
      - "26380:26379"
    volumes:
      - ./conf/sentinel.conf:/usr/local/etc/redis/sentinel.conf
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    depends_on:
      - redis-master
    networks:
      - redis-net

  redis-sentinel-3:
    image: redis:7.2
    container_name: redis-sentinel-3
    restart: unless-stopped
    ports:
      - "26381:26379"
    volumes:
      - ./conf/sentinel.conf:/usr/local/etc/redis/sentinel.conf
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    depends_on:
      - redis-master
    networks:
      - redis-net

volumes:
  master-data:
  slave-1-data:
  slave-2-data:

networks:
  redis-net:
    driver: bridge
```

### 2.4 生产环境部署要点

**高可用方案**：

| 方案 | 架构 | 自动故障转移 | 分片 | 推荐场景 |
|------|------|-------------|------|----------|
| **主从** | 一主多从 | ❌ | ❌ | 简单读写分离 |
| **Sentinel** | 主从 + Sentinel | ✅（30s） | ❌ | 高可用缓存 |
| **Cluster** | 多主多从分片 | ✅ | ✅ | 大数据量/高QPS |

**安全清单**：启用密码（`requirepass`）、禁用危险命令（`rename-command`）、绑定内网 IP、TLS 加密、ACL 用户权限（6.0+）

---

## 3. 配置文件

> **核心原则**：Redis 配置直接影响内存使用和持久化策略。以下按场景提供完整可用配置。

### 3.2 开发环境配置

```ini
# conf/redis-dev.conf — Redis 开发环境配置
# 适用：本地开发机

# === 网络 ===
bind 0.0.0.0
port 6379
protected-mode no                # 开发环境关闭保护模式

# === 内存 ===
maxmemory 256mb
maxmemory-policy allkeys-lru     # 内存满时淘汰最少使用的 key

# === 持久化（开发环境可关闭提升性能）===
save ""                          # 关闭 RDB
appendonly no                    # 关闭 AOF

# === 日志 ===
loglevel debug
logfile ""

# === 慢查询 ===
slowlog-log-slower-than 10000    # 超过 10ms 记录
slowlog-max-len 128
```

### 3.3 测试环境配置

```ini
# conf/redis-test.conf — Redis 测试环境配置
# 适用：CI/CD、QA 环境

bind 0.0.0.0
port 6379
protected-mode yes
requirepass TestStr0ng!Pass

# === 内存 ===
maxmemory 1gb
maxmemory-policy allkeys-lru

# === 持久化 ===
save 900 1                       # 15 分钟 1 次变更触发 RDB
save 300 10                      # 5 分钟 10 次变更
save 60 10000                    # 1 分钟 10000 次变更
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec             # 每秒 fsync

# === 日志 ===
loglevel notice
logfile "/var/log/redis/redis.log"

# === 慢查询 ===
slowlog-log-slower-than 5000     # 超过 5ms
slowlog-max-len 256

# === 客户端 ===
maxclients 200
```

### 3.4 生产环境配置 — 小型（8G 内存）

> **目标**：单机或 Sentinel 主从，缓存为主

```ini
# conf/redis-prod-small.conf — Redis 生产小型配置
# 适用：4 核 8G 内存，100G SSD

# === 网络 ===
bind 0.0.0.0
port 6379
protected-mode yes
requirepass ProdStr0ng!Pass
# masterauth ProdStr0ng!Pass     # 主从时从库认证密码

# === 内存分配逻辑 ===
# 物理内存 8G 分配策略：
#   OS 保留：1G
#   Redis maxmemory：4G（50%）— 限制 Redis 实际内存使用
#   留余量：3G — 给 RDB fork 子进程（COW）、AOF 重写、OS 缓冲
# 为什么 maxmemory 只设 50%？因为 RDB/AOF 重写时 fork 子进程，
# 子进程依赖 COW（Copy-On-Write），父进程仍在写入，
# 写入越多 COW 额外内存越多，极端情况翻倍
maxmemory 4gb
maxmemory-policy allkeys-lru     # 淘汰最少使用 key，适合缓存场景
# maxmemory-policy 选择逻辑：
#   allkeys-lru → 纯缓存（推荐）
#   volatile-lru → 只淘汰有 TTL 的 key（混合缓存+持久数据）
#   noeviction → 不淘汰，内存满拒绝写入（持久化存储）

# === 持久化 ===
# RDB 逻辑：定时快照，恢复快但可能丢数据
save 900 1
save 300 10
save 60 10000
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# AOF 逻辑：每条写操作追加日志，数据更安全但 IO 更大
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec             # 每秒 fsync，最多丢 1 秒
# appendfsync 选择逻辑：
#   always → 每次写入 fsync，最安全最慢（TPS 下降 80%）
#   everysec → 每秒 fsync，推荐（最多丢 1 秒）
#   no → OS 决定何时 fsync，最快最不安全
auto-aof-rewrite-percentage 100  # AOF 大小增长 100% 触发重写
auto-aof-rewrite-min-size 64mb   # AOF 最小 64M 才触发重写

# === 慢查询 ===
slowlog-log-slower-than 10000    # 超过 10ms
slowlog-max-len 1024

# === 客户端 ===
maxclients 500
timeout 300                      # 客户端空闲 300 秒断开
tcp-keepalive 60

# === 安全 ===
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""

# === 其他 ===
hz 10                            # 定时任务频率，增大可提高过期精度但 CPU 增加
dynamic-hz yes                   # 动态调整 hz
lazyfree-lazy-eviction yes       # 异步淘汰，避免主线程阻塞
lazyfree-lazy-expire yes
lazyfree-lazy-del yes
```

### 3.5 生产环境配置 — 中型（32G 内存，Sentinel 主从）

```ini
# conf/redis-prod-medium.conf — Redis 生产中型配置
# 适用：8 核 32G 内存，500G SSD

bind 0.0.0.0
port 6379
protected-mode yes
requirepass ProdStr0ng!Pass
masterauth ProdStr0ng!Pass

# === 内存 ===
# 32G 物理内存：maxmemory 设 16G（50%），留 16G 给 fork COW
maxmemory 16gb
maxmemory-policy allkeys-lru

# === 持久化 ===
save 900 1
save 300 10
save 60 10000
rdbcompression yes
dbfilename dump.rdb
dir /data

appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 256mb
# AOF 混合模式（4.0+）：重写时前半段 RDB 格式 + 后半段 AOF 格式
aof-use-rdb-preamble yes

# === 复制 ===
replica-serve-stale-data yes     # 主库断连后从库继续响应读请求
replica-read-only yes
replica-ack-time 30s

# === 慢查询 ===
slowlog-log-slower-than 5000     # 超过 5ms
slowlog-max-len 1024

# === 客户端 ===
maxclients 1000
timeout 300
tcp-keepalive 60

# === 安全 ===
rename-command FLUSHDB ""
rename-command FLUSHALL ""

# === 其他 ===
hz 10
dynamic-hz yes
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-del yes
```

### 3.6 从库配置

```ini
# conf/redis-slave.conf — Redis 从库追加配置

# === 复制 ===
replicaof redis-master 6379      # 指定主库地址
masterauth ProdStr0ng!Pass       # 主库密码
replica-read-only yes            # 从库只读

# === 从库持久化 ===
# 从库建议开启 AOF，主库故障切换后从库变主库，需有持久化
appendonly yes
appendfsync everysec

# === 从库内存 ===
# 从库 maxmemory 应与主库一致
# maxmemory 16gb
# maxmemory-policy allkeys-lru
```

### 3.7 Sentinel 配置

```ini
# conf/sentinel.conf — Redis Sentinel 配置

port 26379
sentinel monitor mymaster redis-master 6379 2   # 监控主库，2 票同意故障转移
sentinel auth-pass mymaster ProdStr0ng!Pass      # 主库密码
sentinel down-after-milliseconds mymaster 30000  # 30 秒无响应判定主观下线
sentinel failover-timeout mymaster 180000        # 故障转移超时 3 分钟
sentinel parallel-syncs mymaster 1               # 故障转移后 1 个从库同时同步

# 逻辑：
# down-after-milliseconds → 太短易误判（网络抖动），太长故障恢复慢
# parallel-syncs → 同时同步的从库数，设 1 避免多从库同时全量同步导致主库压力
```

### 3.8 Cluster 节点配置

```ini
# conf/redis-cluster.conf — Redis Cluster 节点配置

port 6379
cluster-enabled yes
cluster-config-file nodes.conf   # 集群状态自动维护
cluster-node-timeout 15000       # 节点超时 15 秒
cluster-announce-ip 10.0.0.1    # 对外通告 IP（Docker/ NAT 需设置）
cluster-announce-port 6379
cluster-announce-bus-port 16379  # 集群总线端口

# Cluster 逻辑：
# 16384 槽分布到多个主节点
# 每个主节点至少 1 个从节点
# 最小 6 节点（3 主 3 从）
# cluster-node-timeout 影响故障检测速度
```

---

## 4. 调优

### 4.1 调优方法论

```
1. 定位瓶颈 → INFO / 慢查询 / 内存分析 / OS 指标
2. 分层调优 → 内存层 → 持久化层 → 网络层 → 连接层
3. 量化验证 → redis-benchmark / 业务压测
4. 持续观察 → 参数变更后观察 24-48 小时
```

### 4.2 内存子系统

**核心逻辑**：Redis 是内存数据库，内存管理是性能的核心。`maxmemory` 限制实际使用量，`maxmemory-policy` 决定淘汰策略。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `maxmemory` | 最大内存限制 | 物理内存 50% | **必须设置**。不设 → OOM 导致宕机。只设 50% 因为 fork COW 需要额外内存 |
| `maxmemory-policy` | 内存淘汰策略 | allkeys-lru | 纯缓存用 allkeys-lru；混合持久化用 volatile-lru；纯存储用 noeviction |
| `maxmemory-samples` | LRU 采样数 | 5（默认） | 采样越多越接近真实 LRU 但 CPU 开销大。5 是性价比最优 |
| `lazyfree-lazy-eviction` | 异步淘汰 | yes | 避免淘汰大 key 时阻塞主线程 |
| `lazyfree-lazy-del` | 异步删除 | yes | UNLINK/DEL 大 key 异步释放内存 |

**内存使用分析**：

```bash
# 查看内存使用
INFO memory
# used_memory_human → 实际使用
# used_memory_peak_human → 峰值
# mem_fragmentation_ratio → 碎片率
#   < 1.0 → Redis 使用了 swap，严重性能问题
#   1.0-1.5 → 正常
#   > 1.5 → 内存碎片多，考虑重启或 activedefrag

# 大 key 扫描
redis-cli --bigkeys
redis-cli --memkeys              # 按内存排序

# 内存碎片整理（4.0+）
CONFIG SET activedefrag yes
CONFIG SET active-defrag-threshold-lower 10   # 碎片率 > 10% 开始整理
```

### 4.3 持久化子系统

**核心逻辑**：持久化是 Redis 最复杂的调优点。RDB 恢复快但可能丢数据，AOF 更安全但 IO 大。生产推荐 RDB + AOF 混合。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `save` | RDB 触发条件 | 900 1 / 300 10 / 60 10000 | 触发频率越高数据越安全但 IO 越大。纯缓存可关闭 RDB |
| `appendfsync` | AOF 刷盘策略 | everysec | always 最安全但性能差 5-10 倍；everysec 推荐；no 最快 |
| `aof-use-rdb-preamble` | AOF 混合模式 | yes | 重写时前半段 RDB 格式（体积小恢复快）+ 后半段 AOF 增量 |
| `auto-aof-rewrite-min-size` | AOF 重写最小大小 | 64M-256M | AOF 太小不重写，避免频繁重写 |
| `rdb-save-incremental-fsync` | RDB 增量 fsync | yes | 避免大 RDB 文件一次性 fsync 阻塞 |

**持久化策略选择**：

| 场景 | 策略 | 数据安全 | 性能影响 |
|------|------|----------|----------|
| 纯缓存 | 关闭 RDB + AOF | 无 | 无 |
| 缓存 + 可接受丢数据 | RDB only | 丢几分钟 | 低 |
| 缓存 + 尽量不丢 | RDB + AOF everysec | 最多丢 1 秒 | 中 |
| 持久化存储 | RDB + AOF always | 不丢 | 高 |

**Fork 阻塞问题**：

```
RDB/AOF 重写时 fork 子进程，fork 耗时与内存使用量成正比：
  4G 内存 → fork 约 100ms
  16G 内存 → fork 约 400ms
  32G 内存 → fork 约 800ms

解决方案：
1. 控制单实例 maxmemory ≤ 16G
2. 开启 THP（Transparent Huge Pages）需关闭：echo never > /sys/kernel/mm/transparent_hugepage/enabled
3. 使用物理机而非虚拟机（虚拟机 fork 更慢）
4. 调整 vm.overcommit_memory=1：sysctl vm.overcommit_memory=1
```

### 4.4 网络子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `tcp-backlog` | TCP 连接队列 | 511 | 高并发需增大，同时调整 OS `somaxconn` |
| `tcp-keepalive` | TCP 保活间隔 | 60s | 检测死连接，避免连接泄漏 |
| `timeout` | 客户端空闲超时 | 300s | 过短 → 连接池断连；过长 → 空闲连接占资源 |

### 4.5 容量规划

| 规模 | CPU | 内存 | maxmemory | 磁盘 | QPS |
|------|-----|------|-----------|------|-----|
| 小型 | 2 核 | 8G | 4G | 50G SSD | < 2 万 |
| 中型 | 4 核 | 32G | 16G | 200G SSD | 2-8 万 |
| 大型 | 8 核 | 64G | 32G（建议拆多实例） | 500G SSD | 8 万+ |

> **为什么大型建议拆多实例**：单实例 maxmemory > 32G 时 fork 耗时过长（>1s），阻塞主线程。建议单实例 ≤ 16G，大数据量用 Cluster 分片。

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 连接
redis-cli -h 127.0.0.1 -p 6379 -a ProdStr0ng!Pass

# 信息查看
INFO server        # 服务器信息
INFO memory        # 内存使用
INFO replication   # 复制状态
INFO persistence   # 持久化状态
INFO stats         # 统计信息
INFO clients       # 客户端连接

# 客户端管理
CLIENT LIST        # 列出所有连接
CLIENT KILL ip:port
CLIENT SETNAME myapp-1

# 配置热更新
CONFIG SET maxmemory 8gb
CONFIG GET maxmemory
CONFIG REWRITE     # 持久化到配置文件
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **内存使用率** | `used_memory / maxmemory` | > 80% |
| **碎片率** | `mem_fragmentation_ratio` | > 1.5 或 < 1.0 |
| **连接数** | `connected_clients` | > 80% maxclients |
| **QPS** | `instantaneous_ops_per_sec` | 持续 > 80% 容量 |
| **复制延迟** | `replication backlog` | 积压 |
| **慢查询** | `SLOWLOG LEN` | 增长速率异常 |
| **fork 耗时** | `latest_fork_usec` | > 1000ms |

**Prometheus 采集（redis_exporter）**：

```bash
docker run -d \
  --name redis-exporter \
  -p 9121:9121 \
  -e REDIS_ADDR="redis://redis-host:6379" \
  -e REDIS_PASSWORD="ProdStr0ng!Pass" \
  oliver006/redis_exporter
```

### 5.3 备份与恢复

```bash
# RDB 备份（触发 BGSAVE 后拷贝文件）
redis-cli BGSAVE
cp /data/dump.rdb /backup/dump_$(date +%Y%m%d).rdb

# AOF 备份
cp /data/appendonly.aof /backup/aof_$(date +%Y%m%d).aof

# 恢复（停 Redis 后拷贝文件到 data 目录再启动）
```

### 5.4 版本升级

**滚动升级步骤**（Sentinel/Cluster 零停机）：
1. 升级从库节点
2. `CLUSTER FAILOVER` 或 Sentinel 自动切换
3. 升级原主库

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：内存满拒绝写入

**现象**：`OOM command not allowed when used memory > maxmemory`

**排查链路**：

```
现象：OOM
  → INFO memory → used_memory 接近 maxmemory
    → maxmemory-policy 是什么？
      → noeviction → 改为 allkeys-lru（如果是缓存）
      → allkeys-lru → 增大 maxmemory 或优化 key 设计
    → 大 key 扫描：redis-cli --bigkeys
      → 发现大 key → 拆分或压缩
```

#### 故障 2：主线程阻塞（延迟突增）

**排查链路**：

```
现象：延迟突增
  → INFO stats → latest_fork_usec > 1000ms？
    → 是 → fork 阻塞，减小 maxmemory 或关闭 THP
  → SLOWLOG GET 10 → 有慢查询？
    → 是 → KEYS * / HGETALL 大 Hash / SORT → 用 SCAN 替代
  → INFO memory → mem_fragmentation_ratio > 1.5？
    → 是 → 开启 activedefrag
```

#### 故障 3：从库断连

**排查**：

```bash
INFO replication
# master_link_status: down → 从库连不上主库
# master_sync_in_progress: 1 → 正在全量同步
```

**解决**：检查网络 → 检查 `masterauth` 密码 → 检查主库 `maxclients` → 增大 `repl-backlog-size`

#### 故障 4：AOF 文件损坏

**修复**：

```bash
redis-check-aof --fix appendonly.aof
# 自动截断损坏部分，可能丢失部分数据
```

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `INFO` | 全局状态信息 |
| `SLOWLOG` | 慢查询日志 |
| `redis-cli --bigkeys` | 大 key 扫描 |
| `redis-cli --latency` | 延迟测量 |
| `redis-cli --rdb` | RDB 分析 |
| `MEMORY DOCTOR` | 内存问题诊断（4.0+） |
| `LATENCY DOCTOR` | 延迟问题诊断 |

### 6.3 应急处理

```bash
# 紧急关闭持久化（降低 IO 压力）
CONFIG SET save ""
CONFIG SET appendonly no

# 紧急限制写入
CONFIG SET maxmemory-policy noeviction

# 清理所有数据（慎用！）
# FLUSHALL ASYNC   # 异步清空，不阻塞
```

---

## 7. 参考资料

- [Redis 7.2 Documentation](https://redis.io/docs/latest/)
- [Redis Configuration](https://redis.io/docs/latest/operate/oss_and_stack/management/config/)
- [Redis Persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/)
- [Redis Cluster](https://redis.io/docs/latest/operate/oss_and_stack/management/clustering/)
- [redis_exporter](https://github.com/oliver006/redis_exporter)

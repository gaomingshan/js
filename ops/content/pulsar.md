# Apache Pulsar 部署运维指南

> **定位**：云原生分布式消息流平台，存算分离架构
> **适用场景**：多租户消息平台、金融级消息、流批一体、跨地域复制
> **难度级别**：⭐⭐⭐⭐ 较高

---

## 1. 概述

### 1.1 是什么

Apache Pulsar 是云原生分布式消息流平台，采用存算分离架构（Broker 无状态 + BookKeeper 有状态存储），原生支持多租户、分层存储、跨地域复制。

### 1.2 核心架构

```
Producer → Broker (无状态计算) → BookKeeper (持久化存储) → Consumer
               ↓                        ↓
         ZooKeeper (元数据)        Ledger (顺序写)
```

| 组件 | 职责 | 部署数量 |
|------|------|----------|
| **Broker** | 无状态消息服务，Topic 到 Broker 映射 | ≥ 2 |
| **BookKeeper (Bookie)** | 持久化存储，Ledger 顺序写 | ≥ 3 |
| **ZooKeeper** | 元数据和协调 | ≥ 3 |
| **Recovery** | Ledger 恢复 | 1+ |

### 1.3 适用场景

**最佳适用**：多租户消息平台、金融级可靠消息、跨地域复制、流批一体、需要分层存储

**不适用**：简单异步解耦（→ RabbitMQ）、超高吞吐日志（→ Kafka）、IoT 海量连接（→ EMQX）

---

## 2. 部署

### 2.1 裸机部署

```bash
# 下载
wget https://archive.apache.org/dist/pulsar/pulsar-4.0.0/apache-pulsar-4.0.0-bin.tar.gz
tar xzf apache-pulsar-4.0.0-bin.tar.gz && cd apache-pulsar-4.0.0

# 单机模式（内置 ZK + BK）
bin/pulsar standalone

# 生产集群部署
# 1. 部署 ZooKeeper
bin/pulsar-daemon start zookeeper

# 2. 初始化集群元数据
bin/pulsar initialize-cluster-metadata \
  --cluster prod-cluster \
  --zookeeper zk1:2181 \
  --configuration-store zk1:2181 \
  --web-service-url http://broker1:8080 \
  --broker-service-url pulsar://broker1:6650

# 3. 部署 BookKeeper
bin/pulsar-daemon start bookie

# 4. 部署 Broker
bin/pulsar-daemon start broker
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name pulsar-standalone \
  -p 6650:6650 \
  -p 8080:8080 \
  -v pulsar-data:/pulsar/data \
  --restart unless-stopped \
  apachepulsar/pulsar:4.0.0 \
  bin/pulsar standalone
```

### 2.3 Docker Compose 部署

```yaml
# docker-compose.yml — 最小集群
version: '3.8'

services:
  zookeeper:
    image: apachepulsar/pulsar:4.0.0
    container_name: pulsar-zk
    restart: unless-stopped
    ports:
      - "2181:2181"
    volumes:
      - zk-data:/pulsar/data/zookeeper
    command: bin/pulsar zookeeper
    networks:
      - pulsar-net

  bookie-1:
    image: apachepulsar/pulsar:4.0.0
    container_name: pulsar-bookie-1
    hostname: bookie-1
    restart: unless-stopped
    environment:
      clusterName: pulsar-cluster
      zkServers: zookeeper:2181
    volumes:
      - bookie-1-data:/pulsar/data/bookkeeper
    command: bin/pulsar bookie
    depends_on:
      - zookeeper
    networks:
      - pulsar-net

  bookie-2:
    image: apachepulsar/pulsar:4.0.0
    container_name: pulsar-bookie-2
    hostname: bookie-2
    restart: unless-stopped
    environment:
      clusterName: pulsar-cluster
      zkServers: zookeeper:2181
    volumes:
      - bookie-2-data:/pulsar/data/bookkeeper
    command: bin/pulsar bookie
    depends_on:
      - zookeeper
    networks:
      - pulsar-net

  bookie-3:
    image: apachepulsar/pulsar:4.0.0
    container_name: pulsar-bookie-3
    hostname: bookie-3
    restart: unless-stopped
    environment:
      clusterName: pulsar-cluster
      zkServers: zookeeper:2181
    volumes:
      - bookie-3-data:/pulsar/data/bookkeeper
    command: bin/pulsar bookie
    depends_on:
      - zookeeper
    networks:
      - pulsar-net

  broker:
    image: apachepulsar/pulsar:4.0.0
    container_name: pulsar-broker
    hostname: broker
    restart: unless-stopped
    ports:
      - "6650:6650"
      - "8080:8080"
    environment:
      clusterName: pulsar-cluster
      zkServers: zookeeper:2181
      configurationStoreServers: zookeeper:2181
    command: bin/pulsar broker
    depends_on:
      - zookeeper
      - bookie-1
      - bookie-2
      - bookie-3
    networks:
      - pulsar-net

volumes:
  zk-data:
  bookie-1-data:
  bookie-2-data:
  bookie-3-data:

networks:
  pulsar-net:
    driver: bridge
```
# 注意：首次部署时，ZooKeeper 启动后需先执行 `pulsar initialize-cluster-metadata` 初始化集群元数据，然后 BookKeeper 和 Broker 才能正常工作。
# 示例：bin/pulsar initialize-cluster-metadata --cluster prod-cluster --zookeeper zookeeper:2181 --configuration-store zookeeper:2181 --web-service-url http://broker:8080 --broker-service-url pulsar://broker:6650

### 2.4 生产环境部署要点

**存算分离优势**：
- Broker 无状态 → 快速扩缩容、故障恢复秒级
- BookKeeper 独立扩容 → 存储和计算独立伸缩
- 分层存储 → 热数据 SSD + 冷数据 S3/MinIO

**安全清单**：TLS 加密、认证（Token/TLS/ Athenz）、授权（权限策略）、多租户隔离

---

## 3. 配置文件

### 3.2 开发环境配置

```bash
# 开发环境：standalone 模式，默认配置即可
bin/pulsar standalone
# 自动创建 public 租户和 default 命名空间
```

### 3.3 生产环境配置 — Broker

```properties
# broker.conf — 生产 Broker 配置

# === 基础 ===
clusterName=pulsar-prod
zkServers=zk1:2181,zk2:2181,zk3:2181
configurationStoreServers=zk1:2181,zk2:2181,zk3:2181
brokerServicePort=6650
webServicePort=8080

# === 多租户 ===
# Pulsar 多租户模型：Tenant → Namespace → Topic
# 逻辑：租户是最大隔离单元，命名空间是策略单元，Topic 是消息单元
systemTopicEnabled=true
topicLevelPoliciesEnabled=true

# === 消息 ===
defaultNumberOfNamespaceBundles=4   # 命名空间分片数
managedLedgerDefaultEnsembleSize=3  # Ledger 写入副本数（Bookie 数）
managedLedgerDefaultWriteQuorum=3   # 写入仲裁数
managedLedgerDefaultAckQuorum=2     # 确认仲裁数
# 逻辑：ensemble=3 write=3 ack=2 → 3 副本写入，2 个确认即成功
# 类似 Kafka 的 min.insync.replicas

# === 载荷 ===
maxMessageSize=5242880              # 5MB 最大消息

# === Broker 缓存 ===
managedLedgerCacheSizeMB=1024       # Ledger 缓存 1GB
# 逻辑：Broker 缓存热数据，减少读 BookKeeper

# === 预留 ===
bookkeeperNumberOfChannelsPerBookie=16
bookkeeperReadTimeoutSeconds=30

# === 背压 ===
maxConcurrentLookupRequest=50000
maxConcurrentTopicLoadRequest=5000

# === 自动创建 ===
allowAutoTopicCreation=false        # 生产禁止自动创建
allowAutoSubscriptionCreation=false
```

### 3.4 生产环境配置 — BookKeeper

```properties
# bk_server.conf — 生产 Bookie 配置

# === 存储 ===
journalDirectory=/data/bookkeeper/journal
ledgerDirectories=/data/bookkeeper/ledgers
# 逻辑：journal 是 WAL（顺序写），ledger 是数据文件
# journal 放 SSD，ledger 可放 HDD

# === Journal ===
journalSyncData=true                # 同步刷盘
journalAdaptiveGroupWrites=true     # 自适应批量写入
journalMaxGroupWaitMs= 1            # 批量等待 1ms
journalBufferSizeBytes=512000
# 逻辑：journal 先写内存再批量 fsync，减少 IO 次数

# === Ledger ===
ledgerCacheSizeMB=512               # Ledger 缓存
# 逻辑：索引缓存，缓存命中则不读磁盘

# === 副本 ===
ensembleSize=3
writeQuorum=3
ackQuorum=2

# === 网络 ===
bookiePort=3181
nettyMaxFrameSizeBytes=5253120      # 5MB

# === GC ===
gcWaitTime=900000                   # GC 检查间隔 15 分钟
isForceGCAllowWhenNoSpace=true      # 磁盘满时强制 GC
```

---

## 4. 调优

### 4.1 Broker 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `managedLedgerCacheSizeMB` | Ledger 缓存 | 1024+ | 缓存热 Topic 数据，减少读 BookKeeper。增大可提高读性能 |
| `managedLedgerDefaultEnsembleSize` | Ledger 副本数 | 3 | Bookie 数量。3 副本保证 1 故障不丢数据 |
| `managedLedgerDefaultAckQuorum` | 确认仲裁 | 2 | 2 个 Bookie 确认即返回成功。=1 更快但更不安全 |
| `maxMessageSize` | 最大消息 | 5MB | Pulsar 支持大消息，但增大需调 BookKeeper `nettyMaxFrameSizeBytes` |

### 4.2 BookKeeper 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `journalSyncData` | Journal 刷盘 | true | true 最安全（每次 fsync）；false 依赖 OS 刷盘 |
| `journalAdaptiveGroupWrites` | 批量写入 | true | 合并小写请求为大批量，减少 IO 次数 |
| `journalMaxGroupWaitMs` | 批量等待 | 1ms | 等待更多写请求合并。增大提高吞吐但延迟增加 |
| `ledgerCacheSizeMB` | Ledger 索引缓存 | 512+ | 缓存 Ledger 索引，命中则不读磁盘 |

### 4.3 容量规划

| 规模 | Broker | Bookie | CPU/节点 | 内存/节点 | 磁盘/Bookie |
|------|--------|--------|----------|----------|-------------|
| 小型 | 2 | 3 | 4 核 | 8G | 200G SSD |
| 中型 | 4 | 5 | 8 核 | 16G | 1T SSD |
| 大型 | 8+ | 10+ | 16 核 | 32G | 4T NVMe |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 集群状态
bin/pulsar-admin brokers list pulsar-prod
bin/pulsar-admin broker-healthcheck

# 租户/命名空间
bin/pulsar-admin tenants list
bin/pulsar-admin tenants create my-app
bin/pulsar-admin namespaces create my-app/orders
bin/pulsar-admin namespaces set-retention my-app/orders -t 7d -s 10G

# Topic 管理
bin/pulsar-admin topics list public/default
bin/pulsar-admin topics stats persistent://my-app/orders/topic1
bin/pulsar-admin topics create-subscription persistent://my-app/orders/topic1 -s sub1

# 消息查看
bin/pulsar-client consume persistent://my-app/orders/topic1 -s sub1 -n 10
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **消息堆积** | `topics stats → backlogSize` | 持续增长 |
| **Bookie 状态** | `bookies list` | 有 Bookie 下线 |
| **Broker 连接** | `brokers list` | Broker 不可达 |
| **Ledger 副本** | `topics stats → replicaton` | 不足 |

**Prometheus**：Broker 内置 `/metrics` 端点

### 5.3 备份与恢复

```bash
# 命名空间级别导出
bin/pulsar-admin namespaces get-policies my-app/orders

# 跨地域复制
bin/pulsar-admin namespaces set-clusters my-app/orders --clusters pulsar-prod,pulsar-dr

# 分层存储（冷数据归档到 S3）
bin/pulsar-admin namespaces set-offload-policies my-app/orders \
  --size-threshold 10GB \
  --time-threshold 7d
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：Bookie 不可用

**排查**：

```bash
bin/pulsar-admin bookies list
bin/pulsar-admin bookies rbo
```

**解决**：重启 Bookie → 如果磁盘损坏 → 替换 Bookie → 自动恢复 Ledger

#### 故障 2：消息堆积

**排查**：

```bash
bin/pulsar-admin topics stats persistent://my-app/orders/topic1
# 查看 subscription 的 msgBacklog
```

**解决**：增加消费者 → 检查消费者处理性能 → 检查 Dispatcher

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `pulsar-admin` | 命令行管理 |
| `pulsar-client` | 生产/消费测试 |
| Dashboard | `:8080` |
| Prometheus | `/metrics` |

---

## 7. 参考资料

- [Apache Pulsar Documentation](https://pulsar.apache.org/docs/)
- [Pulsar Architecture](https://pulsar.apache.org/docs/next/concepts-architecture-overview/)
- [BookKeeper Documentation](https://bookkeeper.apache.org/docs/)
- [Pulsar Manager](https://github.com/apache/pulsar-manager)

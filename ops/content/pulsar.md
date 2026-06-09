# Pulsar 部署指南

> 版本：4.0.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| JDK | 11+（推荐 17） |
| ZooKeeper | ≥ 3 节点（生产） |
| BookKeeper | ≥ 3 节点（3 副本） |
| Broker | ≥ 2 节点（无状态可水平扩展） |
| 端口 | 2181(ZK), 3181(Bookie), 6650(Broker), 8080(Broker HTTP) |

## 2. 裸机安装（通用）

```bash
# 下载
wget https://archive.apache.org/dist/pulsar/pulsar-4.0.0/apache-pulsar-4.0.0-bin.tar.gz
tar xzf apache-pulsar-4.0.0-bin.tar.gz
mv apache-pulsar-4.0.0 /usr/local/pulsar

# 创建目录
mkdir -p /data/pulsar/{zk-data,zk-txn,bookie-journal,bookie-ledgers}
chown -R pulsar:pulsar /usr/local/pulsar /data/pulsar

# 环境变量
cat >> /etc/profile << 'EOF'
export PULSAR_HOME=/usr/local/pulsar
export PATH=$PATH:$PULSAR_HOME/bin
EOF
```

## 3. 单机部署（Standalone）

**适用场景**：开发测试、功能验证（内置 ZooKeeper + BookKeeper）

### 启动

```bash
# 默认 standalone 模式（内置 ZK + BK）
bin/pulsar standalone

# 指定数据目录
bin/pulsar standalone \
  --zookeeper-dir /data/pulsar/zk-data \
  --bookkeeper-dir /data/pulsar/bookie-ledgers
```

### 验证

```bash
# 查看集群
bin/pulsar-admin clusters list
# 预期输出：standalone

# 生产消费测试
bin/pulsar-client produce test-topic --messages "hello pulsar"
bin/pulsar-client consume test-topic -s test-sub -n 10
```

### Docker Compose

```yaml
services:
  pulsar:
    image: apachepulsar/pulsar:4.0.0
    container_name: pulsar-standalone
    ports:
      - 6650:6650
      - 8080:8080
    volumes:
      - pulsar-data:/pulsar/data
    command: bin/pulsar standalone

volumes:
  pulsar-data:
```

## 4. 集群部署（ZK × 3 + BK × 3 + Broker × 3）

**适用场景**：生产环境，高可用，多租户

### 节点规划

| 节点 | ZooKeeper | BookKeeper | Broker | IP |
|------|-----------|------------|--------|----|
| node1 | ZK1 | Bookie1 | Broker1 | 10.0.0.1 |
| node2 | ZK2 | Bookie2 | Broker2 | 10.0.0.2 |
| node3 | ZK3 | Bookie3 | Broker3 | 10.0.0.3 |

> 小规模可合并部署（3 台各跑全部组件），大规模建议 ZooKeeper 独立部署。

### 配置

#### ZooKeeper

```bash
cat > conf/zookeeper.conf << 'EOF'
dataDir=/data/pulsar/zk-data
tickTime=2000
initLimit=10
syncLimit=5
clientPort=2181
admin.serverPort=9990
server.1=10.0.0.1:2888:3888
server.2=10.0.0.2:2888:3888
server.3=10.0.0.3:2888:3888
EOF
```

#### BookKeeper

```bash
cat > conf/bookkeeper.conf << 'EOF'
zkServers=10.0.0.1:2181,10.0.0.2:2181,10.0.0.3:2181
journalDirectory=/data/pulsar/bookie-journal
ledgerDirectories=/data/pulsar/bookie-ledgers
journalSyncData=true
journalAdaptiveGroupWrites=true
journalMaxGroupWaitMs=1
ledgerCacheSizeMB=512
bookiePort=3181
EOF
```

#### Broker

```bash
cat > conf/broker.conf << 'EOF'
clusterName=pulsar-cluster
zkServers=10.0.0.1:2181,10.0.0.2:2181,10.0.0.3:2181
configurationStoreServers=10.0.0.1:2181,10.0.0.2:2181,10.0.0.3:2181
brokerServicePort=6650
webServicePort=8080

# 多租户
systemTopicEnabled=true
topicLevelPoliciesEnabled=true

# 消息
defaultNumberOfNamespaceBundles=4
managedLedgerDefaultEnsembleSize=3
managedLedgerDefaultWriteQuorum=3
managedLedgerDefaultAckQuorum=2
managedLedgerCacheSizeMB=1024

# 安全
allowAutoTopicCreation=false
allowAutoSubscriptionCreation=false

maxMessageSize=5242880
EOF
```

### 启动

```bash
# === Step 1：ZooKeeper（每台节点）===
bin/pulsar-daemon start zookeeper

# === Step 2：初始化集群元数据（单次，任一节点执行）===
# ⚠️ 关键步骤：必须在 BookKeeper 和 Broker 启动前执行
bin/pulsar initialize-cluster-metadata \
  --cluster pulsar-cluster \
  --zookeeper 10.0.0.1:2181 \
  --configuration-store 10.0.0.1:2181,10.0.0.2:2181,10.0.0.3:2181 \
  --web-service-url http://10.0.0.1:8080,10.0.0.2:8080,10.0.0.3:8080 \
  --broker-service-url pulsar://10.0.0.1:6650,10.0.0.2:6650,10.0.0.3:6650

# === Step 3：BookKeeper（每台节点）===
bin/pulsar-daemon start bookie

# 验证 BookKeeper
bin/bookkeeper shell bookiesanity
bin/pulsar-admin bookies list

# === Step 4：Broker（每台节点）===
bin/pulsar-daemon start broker
```

### 验证

```bash
# Broker 列表
bin/pulsar-admin brokers list pulsar-cluster

# Bookie 列表
bin/pulsar-admin bookies list

# 创建租户和命名空间
bin/pulsar-admin tenants create my-app
bin/pulsar-admin namespaces create my-app/orders

# 消息测试
bin/pulsar-client produce persistent://my-app/orders/test --messages "ok"
bin/pulsar-client consume persistent://my-app/orders/test -s sub1 -n 10
```

### Docker Compose

```yaml
services:
  zookeeper:
    image: apachepulsar/pulsar:4.0.0
    container_name: pulsar-zk
    hostname: zookeeper
    volumes:
      - zk-data:/pulsar/data/zookeeper
    command: >
      sh -c "bin/pulsar initialize-cluster-metadata
        --cluster pulsar-cluster
        --zookeeper zookeeper:2181
        --configuration-store zookeeper:2181
        --web-service-url http://broker:8080
        --broker-service-url pulsar://broker:6650
      || true && bin/pulsar zookeeper"

  init-cluster:
    image: apachepulsar/pulsar:4.0.0
    container_name: pulsar-init
    depends_on:
      zookeeper:
        condition: service_started
    command: >
      sh -c "bin/pulsar initialize-cluster-metadata
        --cluster pulsar-cluster
        --zookeeper zookeeper:2181
        --configuration-store zookeeper:2181
        --web-service-url http://broker:8080
        --broker-service-url pulsar://broker:6650"
    restart: on-failure

  bookie-1: &bookie
    image: apachepulsar/pulsar:4.0.0
    hostname: bookie-1
    depends_on: [zookeeper, init-cluster]
    volumes:
      - bookie-1-data:/pulsar/data/bookkeeper
    environment:
      zkServers: zookeeper:2181
    command: bin/pulsar bookie

  bookie-2:
    <<: *bookie
    hostname: bookie-2
    volumes:
      - bookie-2-data:/pulsar/data/bookkeeper

  bookie-3:
    <<: *bookie
    hostname: bookie-3
    volumes:
      - bookie-3-data:/pulsar/data/bookkeeper

  broker-1: &broker
    image: apachepulsar/pulsar:4.0.0
    hostname: broker-1
    depends_on: [zookeeper, bookie-1, bookie-2, bookie-3]
    ports:
      - 6650:6650
      - 8080:8080
    environment:
      clusterName: pulsar-cluster
      zkServers: zookeeper:2181
      configurationStoreServers: zookeeper:2181
    command: bin/pulsar broker

  broker-2:
    <<: *broker
    hostname: broker-2

  broker-3:
    <<: *broker
    hostname: broker-3

volumes:
  zk-data:
  bookie-1-data:
  bookie-2-data:
  bookie-3-data:
```

> ⚠️ **init-cluster-metadata 说明**：`init-cluster` 容器在 ZK 就绪后执行元数据初始化，执行成功后自动退出（`restart: on-failure` 确保出错时重试）。BookKeeper 和 Broker 通过 `depends_on` 等待该步骤完成。

## 5. 运维速查

```bash
# Broker
bin/pulsar-admin brokers list pulsar-cluster
bin/pulsar-admin broker-healthcheck

# BookKeeper
bin/pulsar-admin bookies list
bin/pulsar-admin bookies rbo       # read-only bookies
bin/bookkeeper shell listbookies

# 租户和命名空间
bin/pulsar-admin tenants list
bin/pulsar-admin tenants create <tenant>
bin/pulsar-admin namespaces create <tenant>/<ns>
bin/pulsar-admin namespaces set-retention <tenant>/<ns> -t 7d -s 10G
bin/pulsar-admin namespaces set-dispatch-rate <tenant>/<ns> -msg 1000 -byte 1048576

# Topic
bin/pulsar-admin topics list <tenant>/<ns>
bin/pulsar-admin topics stats persistent://<tenant>/<ns>/<topic>
bin/pulsar-admin topics create-subscription persistent://<tenant>/<ns>/<topic> -s <sub>
bin/pulsar-admin topics delete persistent://<tenant>/<ns>/<topic>

# 消费
bin/pulsar-client consume persistent://<tenant>/<ns>/<topic> -s <sub> -n 10
bin/pulsar-client produce persistent://<tenant>/<ns>/<topic> --messages "test"

# 跨地域复制
bin/pulsar-admin namespaces set-clusters <tenant>/<ns> --clusters cluster-a,cluster-b

# 分层存储（offload 到 S3/MinIO）
bin/pulsar-admin namespaces set-offload-policies <tenant>/<ns> \
  --size-threshold 10GB \
  --time-threshold 7d
```

**关键监控指标**：

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| 消息堆积 | `topics stats → backlogSize` | 持续增长 |
| Bookie 状态 | `bookies list` | Writable 数 < broker 可用数 |
| Ledger 副本 | `topic stats → replication` | Ensemble < 3 |
| 磁盘 | Bookie `/metrics` | > 80% |
| Broker TPS | `/metrics` | 异常波动 |

## 6. 常见故障

### 6.1 集群元数据未初始化

```
# 错误日志：Metadata not found for cluster pulsar-cluster
# 原因：忘记执行 initialize-cluster-metadata
# 解决：ZK 启动后，BookKeeper 启动前执行初始化命令

bin/pulsar initialize-cluster-metadata \
  --cluster pulsar-cluster \
  --zookeeper localhost:2181 \
  --configuration-store localhost:2181 \
  --web-service-url http://localhost:8080 \
  --broker-service-url pulsar://localhost:6650
```

### 6.2 BookKeeper 磁盘满

```bash
# Bookie 自动进入只读模式
bin/pulsar-admin bookies rbo
# 显示只读 Bookie 列表

# 解决
# 1. 清理：强制 GC 回收已删除 Ledger 的空间
bin/bookkeeper shell gc
# 2. 扩容：增加磁盘或添加新 Bookie
# 3. 紧急扩容后，恢复可写
bin/bookkeeper shell recover <bookie-address>
```

### 6.3 Broker 连不上 BookKeeper

```
# 排查
1. ZK 中 Bookie 是否注册：bin/pulsar-admin bookies list
2. 网络端口 3181 是否可达
3. Bookie journal 目录是否可写

# 解决：检查 Bookie 日志 → 修复目录权限 → 重启 Bookie
```

### 6.4 消息堆积

```bash
# 查看堆积
bin/pulsar-admin topics stats persistent://<tenant>/<ns>/<topic>
# msgBacklog 字段显示堆积量

# 解决
# 1. 增加消费者或调整 dispatch rate
bin/pulsar-admin namespaces set-dispatch-rate <tenant>/<ns> -msg 10000 -byte 10485760
# 2. 设置 TTL 自动清理过期消息
bin/pulsar-admin namespaces set-message-ttl <tenant>/<ns> -ttl 3600
```

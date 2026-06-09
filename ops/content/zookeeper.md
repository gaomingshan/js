# ZooKeeper 部署运维指南

> **定位**：Apache 分布式协调服务，分布式系统的"基石"
> **适用场景**：Kafka/Kafka KRaft 前置、Hadoop/HBase 协调、分布式锁、Leader 选举
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

Apache ZooKeeper 是分布式协调服务，提供分布式锁、配置管理、命名服务、Leader 选举等原语，基于 ZAB（ZooKeeper Atomic Broadcast）协议保证强一致性。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **ZAB 协议** | 强一致性（CP），Leader 选举 + 原子广播 |
| **Watcher** | 数据变更通知机制 |
| **临时节点** | 会话结束自动删除，用于服务发现和锁 |
| **顺序节点** | 自增序号，用于队列和选举 |
| **ACL** | 节点级访问控制 |

### 1.3 适用场景

**最佳适用**：Kafka（3.3 前版本）、Hadoop/HBase 协调、分布式锁、Leader 选举、Dubbo 注册中心

**不适用**：新部署 Kafka（→ KRaft）、通用配置中心（→ Nacos）、服务网格（→ Consul）

---

## 2. 部署

### 2.1 裸机部署

```bash
# 下载
wget https://archive.apache.org/dist/zookeeper/zookeeper-3.9.2/apache-zookeeper-3.9.2-bin.tar.gz
tar xzf apache-zookeeper-3.9.2-bin.tar.gz && cd apache-zookeeper-3.9.2-bin

# 配置
cp conf/zoo_sample.cfg conf/zoo.cfg
# 编辑 conf/zoo.cfg

# 启动
bin/zkServer.sh start
bin/zkServer.sh status
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name zookeeper \
  -p 2181:2181 \
  -v zk-data:/data \
  -v zk-logs:/datalog \
  -v ./conf/zoo.cfg:/conf/zoo.cfg \
  --restart unless-stopped \
  zookeeper:3.9.2
```

### 2.3 Docker Compose 部署（3 节点集群）

```yaml
# docker-compose.yml
version: '3.8'

services:
  zk-1:
    image: zookeeper:3.9.2
    container_name: zk-1
    hostname: zk-1
    restart: unless-stopped
    ports:
      - "2181:2181"
    environment:
      ZOO_MY_ID: 1
      ZOO_SERVERS: server.1=zk-1:2888:3888;2181 server.2=zk-2:2888:3888;2181 server.3=zk-3:2888:3888;2181
    volumes:
      - zk-1-data:/data
      - zk-1-datalog:/datalog
    networks:
      - zk-net

  zk-2:
    image: zookeeper:3.9.2
    container_name: zk-2
    hostname: zk-2
    restart: unless-stopped
    environment:
      ZOO_MY_ID: 2
      ZOO_SERVERS: server.1=zk-1:2888:3888;2181 server.2=zk-2:2888:3888;2181 server.3=zk-3:2888:3888;2181
    volumes:
      - zk-2-data:/data
      - zk-2-datalog:/datalog
    networks:
      - zk-net

  zk-3:
    image: zookeeper:3.9.2
    container_name: zk-3
    hostname: zk-3
    restart: unless-stopped
    environment:
      ZOO_MY_ID: 3
      ZOO_SERVERS: server.1=zk-1:2888:3888;2181 server.2=zk-2:2888:3888;2181 server.3=zk-3:2888:3888;2181
    volumes:
      - zk-3-data:/data
      - zk-3-datalog:/datalog
    networks:
      - zk-net

volumes:
  zk-1-data:
  zk-2-data:
  zk-3-data:
  zk-1-datalog:
  zk-2-datalog:
  zk-3-datalog:

networks:
  zk-net:
    driver: bridge
```

### 2.4 生产环境部署要点

**节点数**：≥ 3（奇数），5 节点允许 2 故障

**磁盘**：事务日志必须放独立磁盘（SSD），`dataLogDir` 与 `dataDir` 分离

---

## 3. 配置文件

### 3.2 开发环境配置

```properties
# conf/zoo.cfg — 开发环境
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/data
clientPort=2181
```

### 3.3 生产环境配置

```properties
# conf/zoo.cfg — 生产环境

# === 基础时间 ===
tickTime=2000                      # ZAB 心跳间隔 2 秒
# 逻辑：所有超时都是 tickTime 的倍数

# === 集群同步 ===
initLimit=10                       # Follower 初始化同步允许 10 个 tick（20 秒）
syncLimit=5                        # Follower 与 Leader 同步允许 5 个 tick（10 秒）
# 逻辑：initLimit 太小 → 大数据量时 Follower 初始化失败
# syncLimit 太小 → 网络抖动时 Follower 被踢出

# === 存储 ===
dataDir=/data                      # 快照目录
dataLogDir=/datalog                # 事务日志目录
# 逻辑：事务日志是顺序写，放独立 SSD 可大幅提升性能
# 快照是随机写，放 HDD 也可以

# === 网络 ===
clientPort=2181
maxClientCnxns=60                  # 单 IP 最大连接数
# 逻辑：防止单客户端耗尽连接

# === 集群 ===
server.1=zk-1:2888:3888
server.2=zk-2:2888:3888
server.3=zk-3:2888:3888
# 格式：server.N=host:peerPort:electionPort
# peerPort → Follower 与 Leader 通信
# electionPort → Leader 选举通信

# === 快照 ===
autopurge.snapRetainCount=10       # 保留最近 10 个快照
autopurge.purgeInterval=1          # 每小时自动清理
# 逻辑：不配置 autopurge → 快照和日志无限增长导致磁盘满

# === JVM（通过 zkEnv.sh）===
# JVMFLAGS="-Xmx2g -Xms2g"
# 逻辑：ZK 是 Java 应用，JVM 堆存事务日志和快照索引
# 堆太大 → GC 停顿长；堆太小 → 事务日志缓存不够

# === 其他 ===
4lw.commands.whitelist=mntr,conf,ruok,envi,srvr  # 四字命令白名单
admin.enableServer=true            # Admin Server
```

---

## 4. 调优

### 4.1 JVM 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `-Xmx` | 堆最大值 | 2G-4G | ZK 数据在内存中，堆大小决定能存多少 ZNode。堆太大 → GC 停顿 |
| `-Xms` | 堆初始值 | = Xmx | 避免动态伸缩 |
| GC 策略 | 垃圾收集器 | G1 | G1 停顿时间可控，适合 ZK |

### 4.2 IO 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `dataLogDir` | 事务日志目录 | 独立 SSD | **最重要的调优**。事务日志顺序写，独立磁盘避免与快照 IO 争用 |
| `preAllocSize` | 事务日志预分配 | 64MB | 减少文件扩展开销 |
| `snapCount` | 快照间隔事务数 | 100000 | 太频繁 → IO 压力；太少 → 恢复慢 |

### 4.3 容量规划

| 规模 | 节点 | CPU | 内存 | JVM 堆 | 磁盘 |
|------|------|-----|------|--------|------|
| 小型 | 3 | 2 核 | 4G | 1G | 50G SSD |
| 中型 | 3 | 4 核 | 8G | 2G | 200G SSD |
| 大型 | 5 | 8 核 | 16G | 4G | 500G SSD |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 状态
bin/zkServer.sh status

# 客户端连接
bin/zkCli.sh -server localhost:2181

# 常用四字命令
echo mntr | nc localhost 2181     # 监控指标
echo ruok | nc localhost 2181    # 是否正常
echo cons | nc localhost 2181    # 连接信息
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **Leader 状态** | `mntr → zk_server_state` | 非 Leader（对 Follower） |
| **ZNode 数** | `mntr → zk_znode_count` | 异常增长 |
| **延迟** | `mntr → zk_avg_latency` | > 10ms |
| **Watch 数** | `mntr → zk_watch_count` | 异常增长 |
| **连接数** | `mntr → zk_num_alive_connections` | 接近 maxClientCnxns |

### 5.3 备份与恢复

```bash
# 快照备份
cp /data/version-2/snapshot.* /backup/

# 事务日志备份
cp /datalog/version-2/log.* /backup/
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：集群无 Leader

**排查**：`bin/zkServer.sh status` → 检查节点间 2888/3888 端口连通

#### 故障 2：Follower 频繁断连

**排查**：增大 `syncLimit` → 检查网络延迟 → 检查磁盘 IO

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `zkServer.sh status` | 节点角色 |
| `zkCli.sh` | 交互式操作 |
| `mntr` 四字命令 | 监控指标 |
| Prometheus（jmx_exporter） | JVM + ZK 指标 |

---

## 7. 参考资料

- [ZooKeeper Documentation](https://zookeeper.apache.org/doc/current/)
- [ZooKeeper Admin Guide](https://zookeeper.apache.org/doc/current/zookeeperAdmin.html)

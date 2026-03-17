# 集群搭建与高可用架构

## 概述

单节点 Elasticsearch 适合开发环境，但生产环境需要集群部署以实现高可用、负载均衡和数据冗余。本章介绍如何从三节点集群搭建到生产级高可用架构的完整过程。

## 三节点集群搭建实战

### 环境规划

**集群配置**：
- 节点数：3
- 每个节点角色：master + data + ingest
- 网络：同一局域网
- 硬件：每节点 4 核 CPU、8GB 内存、100GB SSD

**节点信息**：

| 节点名 | IP 地址 | HTTP 端口 | Transport 端口 | 角色 |
|--------|---------|----------|---------------|------|
| node-1 | 192.168.1.101 | 9200 | 9300 | master, data, ingest |
| node-2 | 192.168.1.102 | 9200 | 9300 | master, data, ingest |
| node-3 | 192.168.1.103 | 9200 | 9300 | master, data, ingest |

### 节点1配置

编辑 `config/elasticsearch.yml`：

```yaml
# 集群名称（所有节点必须相同）
cluster.name: production-cluster

# 节点名称（集群内唯一）
node.name: node-1

# 节点角色
node.roles: [ master, data, ingest ]

# 网络配置
network.host: 192.168.1.101
http.port: 9200
transport.port: 9300

# 集群发现配置
discovery.seed_hosts: ["192.168.1.101:9300", "192.168.1.102:9300", "192.168.1.103:9300"]

# 初始主节点列表（首次启动时使用）
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]

# 数据和日志路径
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# 内存锁定（防止 swap）
bootstrap.memory_lock: true
```

### 节点2配置

```yaml
cluster.name: production-cluster
node.name: node-2
node.roles: [ master, data, ingest ]

network.host: 192.168.1.102
http.port: 9200
transport.port: 9300

discovery.seed_hosts: ["192.168.1.101:9300", "192.168.1.102:9300", "192.168.1.103:9300"]
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]

path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
bootstrap.memory_lock: true
```

### 节点3配置

```yaml
cluster.name: production-cluster
node.name: node-3
node.roles: [ master, data, ingest ]

network.host: 192.168.1.103
http.port: 9200
transport.port: 9300

discovery.seed_hosts: ["192.168.1.101:9300", "192.168.1.102:9300", "192.168.1.103:9300"]
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]

path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
bootstrap.memory_lock: true
```

### 启动集群

**依次启动三个节点**：

```bash
# 节点1
./bin/elasticsearch -d

# 节点2
./bin/elasticsearch -d

# 节点3
./bin/elasticsearch -d
```

### 验证集群

```bash
# 查看集群健康状态
curl http://192.168.1.101:9200/_cluster/health?pretty

{
  "cluster_name" : "production-cluster",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 3,
  "number_of_data_nodes" : 3,
  "active_primary_shards" : 0,
  "active_shards" : 0,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0
}

# 查看节点列表
curl http://192.168.1.101:9200/_cat/nodes?v

ip             heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
192.168.1.101           15          50   0    0.00    0.05     0.10 dim       *      node-1
192.168.1.102           12          48   1    0.02    0.04     0.08 dim       -      node-2
192.168.1.103           18          52   0    0.01    0.03     0.07 dim       -      node-3
```

**字段说明**：
- **node.role**：d（data）、i（ingest）、m（master）
- **master**：`*` 表示当前活跃的 Master 节点

## 节点角色详解

### 角色类型

Elasticsearch 7.x+ 支持细粒度的节点角色划分：

```yaml
# 节点角色配置
node.roles: [ master, data, data_content, data_hot, data_warm, data_cold, data_frozen, ingest, ml, remote_cluster_client, transform ]
```

### 1. Master 节点

**职责**：管理集群元数据和状态

```yaml
# 专用 Master 节点
node.roles: [ master ]
```

**核心功能**：
- 创建/删除索引
- 管理集群拓扑（节点加入/离开）
- 分片分配和再平衡
- 维护 Cluster State

**资源需求**：
- CPU：中等
- 内存：中等（取决于集群规模）
- 磁盘：低（不存储数据）

**最佳实践**：
- 生产环境配置 **3 个专用 Master 节点**（奇数个）
- Master 节点不参与数据存储和查询
- 保证 Master 节点的网络稳定性

### 2. Data 节点

**职责**：存储数据并执行 CRUD、搜索、聚合

```yaml
# 专用 Data 节点
node.roles: [ data ]
```

**核心功能**：
- 存储分片数据
- 执行查询操作
- 聚合计算

**资源需求**：
- CPU：高（查询和聚合密集）
- 内存：高（堆内存 + 文件系统缓存）
- 磁盘：高（SSD 推荐）

**Data 节点分层**（7.10+）：

```yaml
# 热节点（Hot）：最新数据，高性能硬件
node.roles: [ data_hot ]

# 温节点（Warm）：不常访问的数据，中等硬件
node.roles: [ data_warm ]

# 冷节点（Cold）：很少访问的数据，低成本硬件
node.roles: [ data_cold ]

# 冻结节点（Frozen）：归档数据，极低成本
node.roles: [ data_frozen ]
```

### 3. Coordinating 节点（协调节点）

**职责**：路由请求，聚合结果

```yaml
# 专用协调节点（不配置任何角色）
node.roles: [ ]
```

**核心功能**：
- 接收客户端请求
- 将请求路由到相关数据节点
- 合并各节点返回的结果

**使用场景**：
- 大规模集群（50+ 节点）
- 聚合查询多的场景
- 负载均衡层

**资源需求**：
- CPU：中等
- 内存：高（聚合结果缓存）
- 磁盘：低

**注意**：所有节点默认都能充当协调节点，专用协调节点是可选优化。

### 4. Ingest 节点

**职责**：数据预处理

```yaml
# Ingest 节点
node.roles: [ ingest ]
```

**核心功能**：
- 执行 Ingest Pipeline
- 数据转换、解析、富化

**使用场景**：
- 日志解析（Grok）
- IP 地理位置解析
- 数据格式转换

**资源需求**：
- CPU：高（预处理计算密集）
- 内存：中等
- 磁盘：低

### 5. Machine Learning 节点

```yaml
node.roles: [ ml ]
```

**职责**：执行机器学习任务（异常检测、数据分析）

### 6. Remote Cluster Client

```yaml
node.roles: [ remote_cluster_client ]
```

**职责**：连接远程集群，执行跨集群搜索

## 专用 Master 节点的必要性

### 为什么需要专用 Master 节点？

**问题**：混合角色节点在高负载时，数据操作可能影响集群管理。

```
混合节点（master + data）：
  数据查询占用 CPU → Master 选举延迟 → 集群不稳定
```

**专用 Master 的优势**：
- 专注于集群管理，不受数据操作影响
- 保证集群元数据的稳定性
- 降低脑裂风险

### Master 节点数量规划

**推荐配置**：

| 集群规模 | Master 节点数 | 说明 |
|---------|-------------|------|
| 小型（< 10 节点） | 3 | 最小高可用配置 |
| 中型（10-50 节点） | 3 | 足够稳定 |
| 大型（> 50 节点） | 5 | 提高容错能力 |

**原则**：
- **奇数个**（避免脑裂）
- **至少 3 个**（实现高可用）
- **不超过 7 个**（选举开销）

### Quorum 机制

**7.0 之前**：手动配置最小主节点数

```yaml
# 公式：(master_eligible_nodes / 2) + 1
discovery.zen.minimum_master_nodes: 2
```

**7.0+**：自动计算 Quorum，无需配置

```yaml
# 仅需配置初始主节点列表
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]
```

## 集群发现机制

### Zen Discovery

**ES 5.x-6.x 的发现机制**。

**单播（Unicast）发现**：

```yaml
# 配置种子节点列表
discovery.zen.ping.unicast.hosts: ["192.168.1.101", "192.168.1.102", "192.168.1.103"]

# 最小主节点数
discovery.zen.minimum_master_nodes: 2
```

**多播（Multicast）发现**（已废弃）：
- 通过广播自动发现节点
- 安全性差，生产环境禁用

### 选主机制

**Bully 算法**：ID 最大的 Master-eligible 节点当选。

**选举过程**：

```
1. 节点启动，加入集群
2. 检测当前是否有活跃的 Master
3. 如果无 Master，发起选举
4. 所有 Master-eligible 节点投票
5. 获得多数票（Quorum）的节点当选
6. 当选节点广播自己为 Master
```

**选举触发条件**：
- 集群首次启动
- Master 节点故障
- 网络分区恢复

**选举时间**：通常 < 1 秒

### 脑裂问题（Split-Brain）

**定义**：网络分区导致集群分裂成多个子集群，每个子集群都有 Master。

**场景示例**：

```
原始集群（5 个 Master-eligible 节点）：
  node-1（Master）、node-2、node-3、node-4、node-5

网络分区：
  子集群A：node-1（Master）、node-2
  子集群B：node-3、node-4、node-5（选举新 Master）

问题：
  - 两个 Master 同时接收写入
  - 数据不一致
  - 网络恢复后数据冲突
```

**解决方案**：Quorum 机制

```
Quorum = (master_eligible_nodes / 2) + 1

5 个节点：Quorum = (5 / 2) + 1 = 3

子集群A（2个节点）：< Quorum，不能选举 Master
子集群B（3个节点）：>= Quorum，可以选举 Master

结果：只有子集群B有 Master，避免脑裂
```

**ES 7.0+ 自动处理**：
- 自动计算 Quorum
- 自动排除不满足 Quorum 的节点
- 降低脑裂风险

## 生产环境集群规划建议

### 小型集群（< 1TB 数据）

**配置**：
- 3 个混合节点（master + data + ingest）
- 每节点：4 核 CPU、16GB 内存、500GB SSD

**优点**：
- 配置简单
- 成本低

**适用场景**：
- 中小型应用
- 非关键业务

### 中型集群（1-10TB 数据）

**配置**：
- 3 个专用 Master 节点：2 核、4GB 内存、100GB SSD
- 6 个 Data 节点：8 核、32GB 内存、1TB SSD
- 2 个 Coordinating 节点（可选）：4 核、8GB 内存

**优点**：
- 角色分离，稳定性高
- 扩展灵活

**适用场景**：
- 企业级应用
- 日志分析平台

### 大型集群（> 10TB 数据）

**配置**：
- 3 个专用 Master 节点
- N 个 Data 节点（按数据量计算）
- 冷热分离架构：
  - Hot 节点：高性能 SSD
  - Warm 节点：普通 SSD
  - Cold 节点：HDD
- 专用 Coordinating 节点

**优点**：
- 高性能
- 成本优化（冷热分离）
- 高可用

**适用场景**：
- 海量日志分析
- 搜索引擎
- 大数据分析

### 跨机架/可用区部署

**高可用架构**：

```
可用区1：
  - Master 节点1
  - Data 节点1、2、3

可用区2：
  - Master 节点2
  - Data 节点4、5、6

可用区3：
  - Master 节点3
  - Data 节点7、8、9
```

**分片分配策略**：

```yaml
# 确保副本分片与主分片不在同一可用区
cluster.routing.allocation.awareness.attributes: zone
node.attr.zone: zone1  # 每个节点配置所属可用区
```

**优势**：
- 单个可用区故障，集群仍可用
- 数据冗余跨可用区

## 集群配置最佳实践

### 1. 网络配置

```yaml
# 生产环境：绑定内网 IP
network.host: 192.168.1.101

# 开发环境：允许外网访问（谨慎）
network.host: 0.0.0.0

# 发布地址（外部访问地址）
network.publish_host: 192.168.1.101
```

### 2. 内存锁定

```yaml
# 防止 ES 内存被 swap 到磁盘
bootstrap.memory_lock: true
```

验证：

```bash
GET /_nodes?filter_path=**.mlockall

{
  "nodes": {
    "abc123": {
      "process": {
        "mlockall": true
      }
    }
  }
}
```

### 3. 文件描述符

```bash
# /etc/security/limits.conf
elasticsearch soft nofile 65536
elasticsearch hard nofile 65536
```

### 4. 虚拟内存

```bash
# /etc/sysctl.conf
vm.max_map_count=262144
```

### 5. JVM 配置

```
# 堆内存：不超过物理内存的 50%，不超过 32GB
-Xms16g
-Xmx16g

# 使用 G1GC
-XX:+UseG1GC
```

### 6. 集群名称

```yaml
# 使用有意义的集群名
cluster.name: production-logs-cluster
```

### 7. 节点属性

```yaml
# 自定义节点属性（用于分片分配）
node.attr.rack: rack1
node.attr.zone: zone1
node.attr.size: large
```

## Docker Compose 部署三节点集群

```yaml
version: '3.8'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    volumes:
      - es01-data:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - elastic

  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    volumes:
      - es02-data:/usr/share/elasticsearch/data
    networks:
      - elastic

  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    volumes:
      - es03-data:/usr/share/elasticsearch/data
    networks:
      - elastic

volumes:
  es01-data:
  es02-data:
  es03-data:

networks:
  elastic:
    driver: bridge
```

启动：

```bash
docker-compose up -d
```

## 总结

**三节点集群搭建步骤**：
1. 规划节点信息（IP、端口、角色）
2. 配置 `elasticsearch.yml`（集群名、节点名、discovery）
3. 统一系统参数（文件描述符、虚拟内存）
4. 依次启动节点
5. 验证集群健康状态

**节点角色**：
- **Master**：集群管理，3个专用节点
- **Data**：数据存储和查询，按数据量规划
- **Coordinating**：请求路由，大规模集群可选
- **Ingest**：数据预处理

**专用 Master 节点**：
- 保证集群稳定性
- 3-5 个奇数个节点
- 不参与数据存储

**集群发现与选主**：
- 配置 `discovery.seed_hosts` 和 `cluster.initial_master_nodes`
- Quorum 机制避免脑裂
- ES 7.0+ 自动处理

**生产环境规划**：
- 小型：3 个混合节点
- 中型：专用 Master + Data 节点
- 大型：冷热分离 + 跨可用区部署

**下一步**：学习集群管理与监控，掌握日常运维操作。

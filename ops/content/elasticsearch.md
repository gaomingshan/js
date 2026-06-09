# Elasticsearch 部署运维指南

> **定位**：开源分布式搜索与分析引擎，全文检索事实标准
> **适用场景**：全文搜索、日志分析、APM、指标存储、向量搜索
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

Elasticsearch 是开源的分布式搜索与分析引擎，基于 Lucene，以倒排索引实现毫秒级全文检索，支持结构化/非结构化数据分析。

### 1.2 核心概念

| 概念 | 说明 | 类比 RDBMS |
|------|------|-----------|
| **Index** | 文档集合 | Database |
| **Document** | JSON 文档 | Row |
| **Field** | 文档字段 | Column |
| **Mapping** | 字段类型定义 | Schema |
| **Shard** | 分片（主/副） | Partition |
| **Node** | 集群节点 | Server |

### 1.3 适用场景

**最佳适用**：全文搜索、日志分析（ELK）、APM、指标存储、向量搜索（8.x）

**不适用**：强事务（→ RDBMS）、实时 OLAP（→ ClickHouse）、时序存储（→ TimescaleDB/Loki）

---

## 2. 部署

### 2.1 裸机部署

```bash
# CentOS（ES 8.15）
sudo rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
sudo yum install -y elasticsearch-8.15.0
sudo systemctl enable elasticsearch && sudo systemctl start elasticsearch

# 关键目录
# /etc/elasticsearch/elasticsearch.yml  配置
# /var/lib/elasticsearch/               数据
# /var/log/elasticsearch/               日志
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e discovery.type=single-node \
  -e xpack.security.enabled=false \
  -e ES_JAVA_OPTS="-Xms1g -Xmx1g" \
  -v es-data:/usr/share/elasticsearch/data \
  --restart unless-stopped \
  elasticsearch:8.15.0
```

### 2.3 Docker Compose 部署（3 节点集群 + Kibana）

```yaml
# docker-compose.yml
version: '3.8'

services:
  es-1:
    image: elasticsearch:8.15.0
    container_name: es-1
    hostname: es-1
    restart: unless-stopped
    ports:
      - "9200:9200"
    environment:
      cluster.name: prod-cluster
      node.name: es-1
      discovery.seed_hosts: es-1,es-2,es-3
      cluster.initial_master_nodes: es-1,es-2,es-3
      xpack.security.enabled: "false"
      ES_JAVA_OPTS: "-Xms2g -Xmx2g"
    volumes:
      - es-1-data:/usr/share/elasticsearch/data
    networks:
      - es-net

  es-2:
    image: elasticsearch:8.15.0
    container_name: es-2
    hostname: es-2
    restart: unless-stopped
    environment:
      cluster.name: prod-cluster
      node.name: es-2
      discovery.seed_hosts: es-1,es-2,es-3
      cluster.initial_master_nodes: es-1,es-2,es-3
      xpack.security.enabled: "false"
      ES_JAVA_OPTS: "-Xms2g -Xmx2g"
    volumes:
      - es-2-data:/usr/share/elasticsearch/data
    networks:
      - es-net

  es-3:
    image: elasticsearch:8.15.0
    container_name: es-3
    hostname: es-3
    restart: unless-stopped
    environment:
      cluster.name: prod-cluster
      node.name: es-3
      discovery.seed_hosts: es-1,es-2,es-3
      cluster.initial_master_nodes: es-1,es-2,es-3
      xpack.security.enabled: "false"
      ES_JAVA_OPTS: "-Xms2g -Xmx2g"
    volumes:
      - es-3-data:/usr/share/elasticsearch/data
    networks:
      - es-net

  kibana:
    image: kibana:8.15.0
    container_name: kibana
    restart: unless-stopped
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: '["http://es-1:9200"]'
    depends_on:
      - es-1
    networks:
      - es-net

volumes:
  es-1-data:
  es-2-data:
  es-3-data:

networks:
  es-net:
    driver: bridge
```

### 2.4 生产环境部署要点

**节点角色**：

| 角色 | 职责 | 推荐 |
|------|------|------|
| **Master** | 集群管理、元数据 | 3 专用节点 |
| **Data Hot** | 热数据存储 + 索引 | 按数据量扩展 |
| **Data Warm** | 温数据存储 | 较少 |
| **Data Cold** | 冷数据存储 | HDD |
| **Coordinating** | 路由 + 聚合 | 按查询量扩展 |

**安全清单**：开启 Security（TLS + 认证）、RBAC、Audit Logging、Fielddata Cache 限制

---

## 3. 配置文件

### 3.2 开发环境配置

```yaml
# elasticsearch.yml — 开发环境（单节点）
cluster.name: dev-cluster
node.name: es-1
path.data: /usr/share/elasticsearch/data
path.logs: /usr/share/elasticsearch/logs
discovery.type: single-node
xpack.security.enabled: false
```

### 3.3 生产环境配置 — Data 节点

```yaml
# elasticsearch.yml — 生产 Data 节点

cluster.name: prod-cluster
node.name: es-data-1
path.data: /data/elasticsearch
path.logs: /var/log/elasticsearch

# === 节点角色 ===
node.roles: [data_hot, data_content]
# 逻辑：专用角色避免资源争用
# data_hot → 热数据（SSD），data_content → 常驻数据
# 不含 master → 不参与选举，减少 GC 压力

# === 集群发现 ===
discovery.seed_hosts: ["es-master-1","es-master-2","es-master-3"]
cluster.initial_master_nodes: ["es-master-1","es-master-2","es-master-3"]

# === 网络 ===
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# === 内存 ===
# ES_JAVA_OPTS 在环境变量中设置
# 逻辑：JVM 堆设物理内存 50%，不超过 31G（压缩指针阈值）
# 超过 31G → 压缩指针失效，实际可用内存反而减少
# 剩余 50% 留给 OS 做 Lucene 文件系统缓存

# === 内存锁定 ===
bootstrap.memory_lock: true
# 逻辑：锁定 JVM 堆防止被 swap 到磁盘，避免 GC 停顿和节点失联
# 需 OS 配置：/etc/security/limits.conf: elasticsearch soft/hard memlock unlimited

# === 索引缓冲 ===
indices.memory.index_buffer_size: 10%
# 逻辑：索引写入缓冲，占 JVM 堆的 10%
# 写入密集型可增大到 20%

# === Fielddata ===
indices.fielddata.cache.size: 20%
# 逻辑：Fielddata 用于排序/聚合，占 JVM 堆
# 不设上限 → OOM；设太小 → 频繁 evict
# 官方建议不超过 20%，40% 严重偏高易触发 OOM

# === 线程池 ===
# thread_pool.search.size: 13        # 搜索线程（CPU 核数 × 3/2 + 1）
# thread_pool.search.queue_size: 1000 # 搜索队列
# thread_pool.write.size: 13         # 写入线程
# thread_pool.write.queue_size: 1000

# === 安全 ===
xpack.security.enabled: true
xpack.security.http.ssl.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.authc.api_key.enabled: true
```

### 3.4 生产环境配置 — Master 节点

```yaml
# elasticsearch.yml — 生产 Master 节点

cluster.name: prod-cluster
node.name: es-master-1

# === 节点角色 ===
node.roles: [master]
# 逻辑：专用 Master 不存数据，降低 GC 压力
# Master 职责：集群状态管理、分片分配
# Master GC 停顿 → 集群不稳定

# === JVM ===
# Master 节点 JVM 堆可小一些（4-8G）
# ES_JAVA_OPTS: "-Xms4g -Xmx4g"

# === 集群发现 ===
discovery.seed_hosts: ["es-master-1","es-master-2","es-master-3"]
cluster.initial_master_nodes: ["es-master-1","es-master-2","es-master-3"]
cluster.election.strategy: stable
# 逻辑：stable 策略减少选举抖动

# === 网络 ===
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

# === 安全 ===
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

---

## 4. 调优

### 4.1 JVM 子系统

**核心逻辑**：ES 是 Java + Lucene 应用。JVM 堆存索引元数据和查询缓存，Lucene 依赖 OS 文件系统缓存存倒排索引。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `-Xms` / `-Xmx` | JVM 堆 | 物理内存 50%，≤ 31G | **不超过 31G**。超过 31G 压缩指针失效，可用内存反而减少。剩余内存留给 OS 做 Lucene 缓存 |
| GC | 垃圾收集器 | G1（8.x 默认） | G1 停顿可控。CMS 已废弃 |

### 4.2 索引子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `number_of_shards` | 主分片数 | 按数据量：30GB/分片 | 分片太小 → 过多分片开销大；太大 → 恢复慢 |
| `number_of_replicas` | 副本数 | 1（生产） | 0 → 无高可用；1 → 允许 1 节点故障；2 → 更安全但存储翻 3 倍 |
| `refresh_interval` | 刷新间隔 | 1s（默认）/ 30s（批量写入） | 刷新使新文档可搜索。批量写入时增大可提升索引速度 |
| `translog.durability` | Translog 刷盘 | request（默认） | async 性能更好但崩溃可能丢数据 |

### 4.3 缓存子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `indices.fielddata.cache.size` | Fielddata 缓存 | 40% 堆 | 排序/聚合用。不设上限 → OOM |
| `indices.queries.cache.size` | 查询缓存 | 10% 堆 | 缓存查询结果 |
| `index.requests.cache.size` | 请求缓存 | 1% 堆 | 缓存 Shard 请求结果 |

### 4.4 容量规划

| 规模 | 节点 | CPU | 内存 | JVM 堆 | 磁盘 | 数据量 |
|------|------|-----|------|--------|------|--------|
| 小型 | 3 | 4 核 | 16G | 8G | 500G SSD | < 500GB |
| 中型 | 5+ | 8 核 | 32G | 16G | 2T SSD | 500GB-5TB |
| 大型 | 10+ | 16 核 | 64G | 31G | 10T SSD | 5TB+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 集群状态
curl localhost:9200/_cluster/health?pretty
curl localhost:9200/_cat/nodes?v
curl localhost:9200/_cat/shards?v

# 索引管理
curl -X PUT "localhost:9200/orders?pretty" -H 'Content-Type: application/json' -d '
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "orderId": { "type": "keyword" },
      "userId": { "type": "keyword" },
      "amount": { "type": "double" },
      "createdAt": { "type": "date" }
    }
  }
}'

# 索引生命周期（ILM）
# 热阶段 → 温阶段 → 冷阶段 → 删除
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **集群状态** | `_cluster/health` | RED |
| **JVM 堆使用率** | `_nodes/stats` | > 85% |
| **磁盘水位** | `_cat/allocation` | > 85% |
| **分片未分配** | `_cluster/health` | > 0 |
| **搜索延迟** | `_nodes/stats` | P99 > 500ms |
| **索引速率** | `_nodes/stats` | 异常下降 |

**Prometheus（elasticsearch_exporter）**：

```bash
docker run -d \
  --name es-exporter \
  -p 9114:9114 \
  -e ES_URI=http://es-1:9200 \
  prometheuscommunity/elasticsearch-exporter
```

### 5.3 备份与恢复

```bash
# 创建快照仓库
curl -X PUT "localhost:9200/_snapshot/backup" -H 'Content-Type: application/json' -d '
{
  "type": "fs",
  "settings": {
    "location": "/data/es-backup"
  }
}'

# 创建快照
curl -X PUT "localhost:9200/_snapshot/backup/snap_$(date +%Y%m%d)?wait_for_completion=true"

# 恢复
curl -X POST "localhost:9200/_snapshot/backup/snap_20240101/_restore"
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：集群 RED

**排查链路**：

```
RED → 有主分片未分配
  → _cluster/health?pretty → 查看未分配分片
    → _cat/shards?v&h=index,shard,state,unassigned.reason
      → 原因：节点故障/磁盘满/分片数超限/分配规则
        → 对症处理
```

#### 故障 2：JVM 堆 OOM

**排查**：`_nodes/stats?filter_path=nodes.*.jvm` → 检查 heap_percent → 检查 Fielddata 缓存

**解决**：增大堆（≤ 31G）→ 限制 Fielddata 缓存 → 优化查询减少聚合

#### 故障 3：磁盘水位超限

**排查**：`_cat/allocation?v`

**解决**：删除旧索引 → 增大磁盘 → 调整水位线

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `_cluster/health` | 集群健康 |
| `_cat/nodes` | 节点状态 |
| `_cat/shards` | 分片状态 |
| `_nodes/stats` | 节点统计 |
| Kibana Dev Tools | 交互式查询 |
| `_explain` | 分片未分配原因 |

---

## 7. 参考资料

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/)
- [Elasticsearch Tuning](https://www.elastic.co/guide/en/elasticsearch/reference/current/important-settings.html)
- [ILM](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html)

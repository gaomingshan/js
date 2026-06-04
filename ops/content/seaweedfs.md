# SeaweedFS 部署运维指南

> **定位**：轻量级分布式文件系统，POSIX 兼容，小文件优化
> **适用场景**：图片/视频存储、小文件高频读写、POSIX 挂载、CDN 源站
> **难度级别**：⭐⭐⭐ 中高

---

## 1. 概述

### 1.1 是什么

SeaweedFS 是开源的分布式文件系统，以 Volume Server 存储小文件、Master 管理元数据、Filer 提供 POSIX 兼容接口为核心架构。针对小文件（< 1MB）场景做了深度优化，单 Volume 可存数十万小文件。

### 1.2 核心架构

```
┌──────────────────────────────────────┐
│  Client                               │
│  S3 API │ Filer (POSIX) │ HTTP API   │
├──────────────────────────────────────┤
│  Filer + Filer Store (MySQL/PG/Redis) │
├──────────────────────────────────────┤
│  Master (元数据 + 调度)               │
├──────────────────────────────────────┤
│  Volume Server × N (数据存储)         │
└──────────────────────────────────────┘
```

| 组件 | 职责 | 部署数量 |
|------|------|----------|
| **Master** | 集群元数据、Volume 分配、Leader 选举 | ≥ 3（HA） |
| **Volume Server** | 存储文件数据，每个 Volume 一个文件 | 按容量扩展 |
| **Filer** | POSIX/S3 接口，目录树，元数据存储 | ≥ 2（HA） |
| **S3 Gateway** | S3 兼容 API 网关 | ≥ 2（HA） |

### 1.3 适用场景

**最佳适用**：图片/视频 CDN 源站、小文件高频读写、需要 POSIX 挂载、K8s PVC

**不适用**：大文件顺序写入（→ MinIO/Ceph RBD）、PB 级对象存储（→ Ceph）、纯 S3 场景（→ MinIO）

---

## 2. 部署

### 2.1 裸机部署

```bash
# 下载
wget https://github.com/seaweedfs/seaweedfs/releases/download/3.72/linux_amd64.tar.gz
tar xzf linux_amd64.tar.gz
sudo mv weed /usr/local/bin/

# 启动 Master
weed master -mdir=/data/seaweedfs/master -port=9333 \
  -peers=10.0.0.1:9333,10.0.0.2:9333,10.0.0.3:9333 \
  -defaultReplication=001

# 启动 Volume Server
weed volume -dir=/data/seaweedfs/volume -max=100 \
  -mserver=10.0.0.1:9333,10.0.0.2:9333,10.0.0.3:9333 \
  -port=8080

# 启动 Filer
weed filer -master=10.0.0.1:9333,10.0.0.2:9333,10.0.0.3:9333 \
  -port=8888 -dir=/data/seaweedfs/filer

# 启动 S3 Gateway
weed s3 -filer=10.0.0.1:8888 -port=8333
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name seaweedfs-master \
  -p 9333:9333 \
  -p 19333:19333 \
  -v sw-master:/data \
  chrislusf/seaweedfs:3.72 \
  master -mdir=/data -port=9333
```

### 2.3 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  master:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-master
    restart: unless-stopped
    ports:
      - "9333:9333"
      - "19333:19333"
    volumes:
      - master-data:/data
    command: master -mdir=/data -port=9333

  volume:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-volume
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - volume-data:/data
    command: volume -dir=/data -max=100 -mserver=master:9333 -port=8080
    depends_on:
      - master

  filer:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-filer
    restart: unless-stopped
    ports:
      - "8888:8888"
    volumes:
      - filer-data:/data
    command: filer -master=master:9333 -port=8888 -dir=/data
    depends_on:
      - master

  s3:
    image: chrislusf/seaweedfs:3.72
    container_name: sw-s3
    restart: unless-stopped
    ports:
      - "8333:8333"
    command: s3 -filer=filer:8888 -port=8333
    depends_on:
      - filer

volumes:
  master-data:
  volume-data:
  filer-data:
```

### 2.4 生产环境部署要点

**高可用**：Master ≥ 3（Raft 选举）、Filer ≥ 2（无状态，LB）、Volume 按容量扩展

**副本策略**：`-defaultReplication=001` 表示同 Rack 1 副本；`010` 跨 Rack 1 副本；`100` 跨 DC 1 副本

**安全清单**：Master 启用 `--secure`、Filer Store 使用 MySQL/PG 持久化元数据、网络隔离

---

## 3. 配置文件

> **核心原则**：SeaweedFS 通过命令行参数和配置文件（JSON/YAML）管理。以下按场景提供关键配置。

### 3.2 开发环境配置

```bash
# 开发环境：单进程 all-in-one
weed server -mdir=/data/seaweedfs \
  -volume.dir=/data/seaweedfs/volume \
  -filer.dir=/data/seaweedfs/filer \
  -s3 -volume.max=50
```

### 3.3 测试环境配置

```json
// filer.json — Filer 配置（元数据存储）
{
  "filer": {
    "port": 8888,
    "store": {
      "type": "memory",
      "capacity": 100000
    }
  }
}
```

### 3.4 生产环境配置

**Master 配置** `master.json`：

```json
{
  "master": {
    "port": 9333,
    "mdir": "/data/seaweedfs/master",
    "peers": ["10.0.0.1:9333", "10.0.0.2:9333", "10.0.0.3:9333"],
    "defaultReplication": "001",
    "volumeSizeLimitMB": 30000,
    "garbageThreshold": 0.03,
    "pulseSeconds": 5
  }
}
```

**Filer 配置** `filer.json`（生产必须用持久化 Store）：

```json
{
  "filer": {
    "port": 8888,
    "store": {
      "type": "mysql",
      "hostname": "mysql-host:3306",
      "database": "seaweedfs_filer",
      "username": "filer",
      "password": "FilerStr0ng!Pass"
    }
  }
}
```

> **为什么 Filer 必须用持久化 Store**：默认内存 Store 重启后目录树丢失。生产必须用 MySQL/PostgreSQL/Redis/Cassandra 等持久化后端。

**Volume Server 配置** `volume.json`：

```json
{
  "volume": {
    "port": 8080,
    "dir": "/data/seaweedfs/volume",
    "max": 100,
    "mserver": "10.0.0.1:9333,10.0.0.2:9333,10.0.0.3:9333",
    "indexType": "memory",
    "dataCenter": "dc1",
    "rack": "rack1"
  }
}
```

---

## 4. 调优

### 4.1 Volume 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `volumeSizeLimitMB` | 单 Volume 大小 | 30000（30GB） | 太小 → Volume 数量多，Master 压力大；太大 → 单 Volume 文件多，索引大 |
| `max` | 最大 Volume 数 | 100-500 | 每节点 Volume 数。100 Volume × 30GB = 3TB/节点 |
| `indexType` | 索引类型 | memory | 内存索引查询快。超大 Volume 可用 `leveldb` 减少内存但查询慢 |
| `garbageThreshold` | 垃圾回收阈值 | 0.03 | 删除文件后 Volume 中碎片占比超过阈值触发压缩 |

### 4.2 副本子系统

| 复制策略 | 含义 | 适用 |
|----------|------|------|
| `000` | 无副本 | 开发/测试 |
| `001` | 同 Rack 1 副本 | 单机架高可用 |
| `010` | 跨 Rack 1 副本 | 跨机架高可用 |
| `100` | 跨 DC 1 副本 | 灾备 |
| `110` | 跨 Rack + 跨 DC | 最高可用 |

### 4.3 容量规划

| 规模 | Volume 节点 | Volume/节点 | 单 Volume | 总容量 | 小文件数 |
|------|------------|-------------|-----------|--------|----------|
| 小型 | 3 | 50 | 30GB | 4.5TB | 4500 万 |
| 中型 | 10 | 100 | 30GB | 30TB | 3 亿 |
| 大型 | 30+ | 200 | 30GB | 180TB+ | 18 亿+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 集群状态
weed shell
# > cluster.list
# > volume.list
# > volume.balance

# Volume 管理
weed volume.list -master=10.0.0.1:9333
weed volume.balance -master=10.0.0.1:9333 -force

# 垃圾回收
weed volume.vacuum -master=10.0.0.1:9333

# Filer 操作
weed filer.cat http://filer:8888/path/to/file
weed filer.copy /local/file http://filer:8888/remote/path
weed mount -filer=filer:8888 -dir=/mnt/seaweedfs  # POSIX 挂载
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **Volume 使用率** | `weed shell → volume.list` | > 85% |
| **Volume 健康状态** | Master API | 有 readonly |
| **Master Leader** | `weed shell → cluster.list` | 无 Leader |
| **Filer 连接** | Filer health API | 不可达 |

**Prometheus**：Master/Filer/Volume 各自暴露 `/metrics` 端点

### 5.3 备份与恢复

```bash
# Volume 级备份（复制 Volume 文件）
weed volume.copy -source=http://volume:8080 -dir=/backup

# Filer 元数据备份（备份 Store 数据库）
# mysqldump / pg_dump

# S3 兼容备份
aws s3 sync s3://mybucket /backup/mybucket --endpoint-url=http://s3:8333
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：Volume 只读

**现象**：写入返回 read-only 错误

**原因**：Volume 空间满或被标记为 readonly

**解决**：`weed shell → volume.configure -volumeId=<id> -writable` 或分配新 Volume

#### 故障 2：Master 无 Leader

**排查**：检查 Master 节点间网络连通性和 Raft 日志

**解决**：确保多数 Master 节点可用 → 重启异常节点

#### 故障 3：Filer 元数据丢失

**排查**：检查 Filer Store 后端数据库连接

**解决**：恢复数据库 → 重启 Filer

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `weed shell` | 交互式管理 |
| `weed volume.list` | Volume 状态 |
| `weed filer.cat` | 文件查看 |
| `/metrics` | Prometheus 指标 |

---

## 7. 参考资料

- [SeaweedFS Documentation](https://seaweedfs.com/)
- [SeaweedFS GitHub](https://github.com/seaweedfs/seaweedfs)
- [SeaweedFS Architecture](https://seaweedfs.com/architecture)

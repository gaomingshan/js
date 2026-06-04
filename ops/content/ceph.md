# Ceph 部署运维指南

> **定位**：企业级统一分布式存储平台，块/对象/文件三种接口
> **适用场景**：PB 级存储、OpenStack 后端、Kubernetes PV、混合云存储
> **难度级别**：⭐⭐⭐⭐⭐ 极高

---

## 1. 概述

### 1.1 是什么

Ceph 是开源的统一分布式存储系统，提供对象存储（RADOSGW/S3 兼容）、块存储（RBD）和文件存储（CephFS）三种接口，底层基于 RADOS（Reliable Autonomic Distributed Object Store）。

### 1.2 核心架构

```
┌─────────────────────────────────────────┐
│           客户端接口层                     │
│  RADOSGW (S3/Swift) │ RBD (块) │ CephFS  │
├─────────────────────────────────────────┤
│              LIBRADOS                    │
├─────────────────────────────────────────┤
│              RADOS                       │
│  MON │ MGR │ OSD │ MDS                   │
└─────────────────────────────────────────┘
```

| 组件 | 职责 | 部署数量 |
|------|------|----------|
| **MON** | 集群地图维护、仲裁 | ≥ 3（奇数） |
| **MGR** | 集群监控、Dashboard | ≥ 2（HA） |
| **OSD** | 数据存储和复制 | 每磁盘 1 个 |
| **MDS** | CephFS 元数据 | ≥ 2（HA） |
| **RGW** | S3/Swift 网关 | ≥ 2（HA） |

### 1.3 适用场景

**最佳适用**：PB 级统一存储、OpenStack/K8s 后端存储、需要块+对象+文件混合场景

**不适用**：中小规模对象存储（→ MinIO）、简单文件共享（→ NFS）、预算/人力有限（Ceph 运维门槛极高）

---

## 2. 部署

### 2.1 裸机部署（cephadm）

**前置条件**：每个节点 Docker/Podman、时间同步、SSH 免密

```bash
# 安装 cephadm
curl --silent --remote-name --location https://github.com/ceph/ceph/raw/pacific/src/cephadm/cephadm
chmod +x cephadm
sudo ./cephadm add-repo --release reef
sudo yum install -y cephadm

# 引导集群（在第一个 MON 节点执行）
sudo cephadm bootstrap \
  --mon-ip 10.0.0.1 \
  --initial-dashboard-password=Str0ngCeph!Pass \
  --dashboard-port-nfs=8443

# 添加其他节点
sudo cephadm ssh-copy-id root@10.0.0.2
ceph orch host add node2 10.0.0.2
ceph orch host add node3 10.0.0.3

# 添加 OSD（自动发现磁盘）
ceph orch daemon add osd node1:/dev/sdb
ceph orch daemon add osd node2:/dev/sdb

# 验证
ceph -s
ceph osd tree
```

### 2.2 Docker Compose 部署（测试用）

> **注意**：Ceph 不适合 Docker Compose 生产部署。以下仅用于测试/学习。

```yaml
# 使用 ceph/ceph 镜像 + rook 更适合 K8s 环境
# 裸机 Docker Compose 部署 Ceph 不推荐，生产请用 cephadm 或 Rook
```

> **推荐**：K8s 环境使用 [Rook](https://rook.io/)，裸机使用 `cephadm`。

### 2.3 生产环境部署要点

**最小生产集群**：
- 3 MON 节点（仲裁需要多数派）
- 3+ OSD 节点（每节点 1+ 磁盘）
- 2 MGR 节点（HA）
- 10Gbps+ 网络（公共网络 + 集群网络分离）

**CRUSH Map**：
- 控制数据分布策略
- 按主机/机架/行/房间/DC 分层
- 副本跨故障域分布

**安全清单**：Cephx 认证、网络隔离（公共/集群网络）、TLS（RGW）、S3 IAM 策略

---

## 3. 配置文件

> **核心原则**：Ceph 配置通过 `ceph.conf` 和运行时 `ceph config set` 管理。以下按场景提供关键配置。

### 3.1 配置文件机制

```
配置优先级：
  运行时覆盖 (ceph config set) → 最高
  ceph.conf [global/osd/mon.mdx] 段 → 中
  默认值 → 最低

cephadm 部署时配置存储在 MON 数据库中，ceph.conf 仅作兜底
```

### 3.2 开发/测试环境配置

```ini
# ceph.conf — 测试环境最小配置
[global]
fsid = <cluster-fsid>
mon_initial_members = node1, node2, node3
mon_host = 10.0.0.1,10.0.0.2,10.0.0.3
auth_cluster_required = cephx
auth_service_required = cephx
auth_client_required = cephx

# 测试环境降低副本数
osd_pool_default_size = 2
osd_pool_default_min_size = 1
osd_pool_default_pg_num = 32

# 网络
public_network = 10.0.0.0/24
cluster_network = 10.0.1.0/24
```

### 3.3 生产环境配置

```ini
# ceph.conf — 生产环境配置

[global]
fsid = <cluster-fsid>
mon_initial_members = mon1, mon2, mon3
mon_host = 10.0.0.1,10.0.0.2,10.0.0.3
auth_cluster_required = cephx
auth_service_required = cephx
auth_client_required = cephx

# === 副本策略 ===
# size = 副本数，min_size = 最小可用副本数
# size=3 min_size=2：允许 1 个 OSD 故障仍可写入
osd_pool_default_size = 3
osd_pool_default_min_size = 2
osd_pool_default_pg_num = 128

# === 网络 ===
public_network = 10.0.0.0/24       # 客户端访问
cluster_network = 10.0.1.0/24      # OSD 间数据复制（必须分离）

# === 心跳 ===
mon_lease = 5
mon_lease_renew_interval_factor = 0.6
mon_lease_ack_timeout_factor = 2.0

[osd]
# === OSD 调优 ===
osd_memory_target = 4G            # 每个 OSD 内存目标（BlueStore 自动管理）
osd_op_threads = 8                 # 操作线程数
osd_disk_threads = 4               # 磁盘操作线程（Scrub 等）

# === BlueStore ===
# BlueStore 是默认存储引擎，直接管理裸设备
bluestore_block_size = 0           # 自动分配
bluestore_cache_size = 0           # 自动管理（受 osd_memory_target 控制）

# === 恢复 ===
# 恢复速度控制，避免影响前台 IO
osd_recovery_max_active = 3
osd_recovery_op_priority = 3       # 恢复操作优先级（默认 3，最低）
osd_max_backfills = 1              # 同时回填数，增大加速恢复但影响前台
osd_recovery_sleep = 0             # 恢复间隔，增大可减少前台影响

[mon]
mon_allow_pool_delete = false      # 禁止删除存储池（防误操作）
mon_max_pg_per_osd = 256           # 每 OSD 最大 PG 数
```

### 3.4 Pool 配置

```bash
# 创建 Pool（不同场景不同配置）

# 块存储（RBD）
ceph osd pool create rbd-pool 128 128 replicated
ceph osd pool set rbd-pool size 3
ceph osd pool set rbd-pool min_size 2
ceph osd pool application enable rbd-pool rbd

# 对象存储（RGW）
ceph osd pool create .rgw.root 32 32 replicated
ceph osd pool create default.rgw.buckets.data 256 256 replicated
ceph osd pool set default.rgw.buckets.data size 3
ceph osd pool application enable default.rgw.buckets.data rgw

# 文件存储（CephFS）
ceph osd pool create cephfs_data 128 128 replicated
ceph osd pool create cephfs_metadata 64 64 replicated
ceph fs new myfs cephfs_metadata cephfs_data

# 纠删码 Pool（对象存储冷数据）
ceph osd erasure-code-profile set cold-profile k=4 m=2 crush-failure-domain=host
ceph osd pool create cold-pool 128 128 erasure cold-profile
```

---

## 4. 调优

### 4.1 PG（Placement Group）子系统

**核心逻辑**：PG 是数据分布的逻辑单元，PG 数量直接影响数据均衡和恢复速度。

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `pg_num` | Pool 的 PG 数 | 1 OSD 约 100 PG | 太少 → 数据不均衡；太多 → MON 内存开销大。公式：`OSD数 × 100 / 副本数` |
| `pgp_num` | 实际分布 PG 数 | = pg_num | 通常等于 pg_num |
| `pg_autoscale_mode` | PG 自动调整 | on | Reef 默认开启，自动根据 Pool 使用量调整 PG 数 |

**PG 计算公式**：

```
总 PG 数 = OSD 数 × 100 / 副本数
每个 Pool 的 PG = 总 PG 数 × Pool 占比

示例：12 OSD，3 副本，Pool 占 50%
总 PG = 12 × 100 / 3 = 400
Pool PG = 400 × 0.5 = 200（取 2 的幂次最接近值 = 256）
```

### 4.2 OSD 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `osd_memory_target` | 单 OSD 内存目标 | 4G | BlueStore 自动管理缓存。大磁盘（>1TB）建议 4G+ |
| `osd_op_threads` | 操作线程 | 8 | CPU 充足可增大，提高并发处理能力 |
| `osd_scrub_begin_hour/end_hour` | Scrub 时间窗口 | 低峰期 | Scrub 影响前台 IO，限制在低峰期执行 |

### 4.3 网络子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `public_network` | 客户端网络 | 独立网段 | 客户端访问 OSD/MON |
| `cluster_network` | 集群网络 | 独立网段 | OSD 间数据复制，**必须与公共网络分离** |
| `ms_tcp_nodelay` | TCP_NODELAY | true | 减少小包延迟 |

### 4.4 容量规划

| 规模 | OSD 节点 | OSD 数 | 磁盘/OSD | 可用容量(3副本) | 网络 |
|------|----------|--------|----------|----------------|------|
| 小型 | 3 | 12 | 4TB SSD | 16TB | 10Gbps |
| 中型 | 6 | 48 | 8TB SSD | 128TB | 2×10Gbps |
| 大型 | 12+ | 144+ | 16TB HDD | 768TB+ | 25Gbps |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 集群状态
ceph -s                             # 集群概览
ceph osd tree                       # OSD 拓扑
ceph osd df tree                    # OSD 磁盘使用
ceph df detail                      # Pool 使用详情
ceph health detail                  # 健康详情

# OSD 管理
ceph osd down osd.0                 # 标记 OSD 下线
ceph osd out osd.0                  # 标记 OSD 移出（触发数据迁移）
ceph osd rm osd.0                   # 删除 OSD
ceph osd reweight osd.0 0.8         # 调整 OSD 权重

# Pool 管理
ceph osd pool ls
ceph osd pool get rbd-pool size
ceph osd pool set rbd-pool size 3
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **集群健康** | `ceph health detail` | HEALTH_ERR |
| **OSD 状态** | `ceph osd tree` | 有 OSD down |
| **磁盘使用率** | `ceph osd df tree` | > 85% |
| **PG 状态** | `ceph pg stat` | 有 degraded/undersized |
| **恢复进度** | `ceph -s` → recovery | 长时间不完成 |
| **IOPS/延迟** | `ceph osd perf` | 延迟 > 50ms |

**Prometheus（Ceph 内置 MGR 模块）**：

```bash
ceph mgr module enable prometheus
# 指标端点：http://mgr-node:9283/metrics
```

### 5.3 备份与恢复

```bash
# RBD 快照
rbd snap create rbd-pool/image@snap1
rbd snap rollback rbd-pool/image@snap1

# RBD 导出
rbd export rbd-pool/image /backup/image.raw
rbd import /backup/image.raw rbd-pool/image-restore

# CephFS 快照
mkdir /mnt/myfs/.snap/daily-20240101

# RGW 多站点复制（灾备）
# 见 3.4 多站点配置
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：PG 降级（degraded）

**现象**：`HEALTH_WARN degraded pg`

**排查**：

```bash
ceph health detail
ceph pg query <pgid>    # 查看 PG 详细状态
```

**解决**：检查 OSD 状态 → 等待自动恢复 → 手动触发恢复 `ceph pg force_recovery <pgid>`

#### 故障 2：OSD 崩溃循环

**现象**：OSD 反复 down/up

**排查**：

```bash
ceph osd log osd.0       # 查看 OSD 日志
ceph daemon osd.0 log flush  # 刷新日志
```

**常见原因**：磁盘故障 → 内存不足 → 网络问题

#### 故障 3：集群满

**排查**：

```bash
ceph df detail
ceph osd df tree
```

**解决**：删除旧数据 → 增加 OSD → 调整 `full_ratio`/`nearfull_ratio`

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `ceph -s` | 集群状态概览 |
| `ceph health detail` | 健康详情 |
| `ceph osd df tree` | OSD 使用率 |
| `ceph pg dump` | PG 状态 |
| `ceph osd perf` | OSD 性能 |
| `ceph daemon osd.X log` | OSD 日志 |
| Ceph Dashboard | Web 管理界面 |

---

## 7. 参考资料

- [Ceph Documentation](https://docs.ceph.com/en/reef/)
- [Ceph Architecture](https://docs.ceph.com/en/reef/architecture/)
- [Cephadm](https://docs.ceph.com/en/reef/cephadm/)
- [Rook (K8s Ceph Operator)](https://rook.io/)

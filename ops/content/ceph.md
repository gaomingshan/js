# Ceph 部署指南

> 版本：Reef (18.x) | 系统：CentOS 9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 最低 | 推荐 |
|------|------|------|
| 节点数 | 1（单机）/ 3（集群） | ≥ 3 |
| CPU | 4 核/节点 | 16 核+ |
| 内存 | 8G/节点 | 32G+（OSD 每核 4G） |
| 磁盘 | 1 块系统盘 + 1 块 OSD 盘 | 系统盘 + 每节点 4+ OSD（NVMe） |
| 网络 | 1Gbps | 10Gbps+（公共 + 集群分离） |
| 系统 | CentOS 9+ / Ubuntu 22.04+ | |
| 容器引擎 | Podman / Docker | |
| 时间同步 | chronyd / ntpd | 所有节点同步 |
| SSH 免密 | bootstrap 节点 → 所有节点 | |

---

## 2. 裸机安装（通用）

```bash
# 安装 cephadm
curl -s --remote-name https://github.com/ceph/ceph/raw/reef/src/cephadm/cephadm
chmod +x cephadm
./cephadm add-repo --release reef
yum install -y cephadm    # CentOS
# 或
apt install -y cephadm     # Ubuntu

# 安装 ceph-common（客户端工具）
yum install -y ceph-common
```

---

## 3. 单机部署（cephadm bootstrap）

### 适用场景

开发测试、功能验证、学习环境。

### 配置

```bash
# 引导集群（指定 MON IP 和 Dashboard 密码）
cephadm bootstrap \
  --mon-ip 10.0.0.1 \
  --initial-dashboard-password Str0ngCeph!Pass

# bootstrap 会自动：
# - 启动 MON × 1 + MGR × 1
# - 启用 Dashboard（默认 8443）
# - 生成 /etc/ceph/ceph.conf 和 keyring
```

### 启动

```bash
# 添加 OSD（指定磁盘）
ceph orch daemon add osd $(hostname):/dev/sdb
ceph orch daemon add osd $(hostname):/dev/sdc

# 或自动发现所有可用磁盘
ceph orch apply osd --all-available-devices
```

### 验证

```bash
ceph -s
# 应看到 HEALTH_OK，1 mon，1 mgr，N osd
ceph osd tree
ceph df
```

### Docker Compose

> **注意**：Ceph 不适合 Docker Compose 生产部署。以下仅用于测试。

```yaml
services:
  mon:
    image: quay.io/ceph/ceph:v18
    container_name: ceph-mon
    network_mode: host
    command: mon
    volumes:
      - /etc/ceph:/etc/ceph
      - /var/lib/ceph:/var/lib/ceph
    environment:
      - MON_IP=10.0.0.1
      - CEPH_PUBLIC_NETWORK=10.0.0.0/24

  mgr:
    image: quay.io/ceph/ceph:v18
    container_name: ceph-mgr
    network_mode: host
    command: mgr
    volumes:
      - /etc/ceph:/etc/ceph
      - /var/lib/ceph:/var/lib/ceph

  osd:
    image: quay.io/ceph/ceph:v18
    container_name: ceph-osd
    network_mode: host
    command: osd
    volumes:
      - /etc/ceph:/etc/ceph
      - /var/lib/ceph:/var/lib/ceph
      - /dev:/dev:rb
    privileged: true
```

---

## 4. 集群部署（3 节点）

### 适用场景

生产存储，PB 级数据，需要块/对象/文件三种接口。

### 节点规划

| 节点 | 主机名 | IP | 角色 | OSD 磁盘 |
|------|--------|-----|------|----------|
| 1 | node1 | 10.0.0.1 | MON + MGR + OSD | /dev/sdb, /dev/sdc |
| 2 | node2 | 10.0.0.2 | MON + MGR + OSD | /dev/sdb, /dev/sdc |
| 3 | node3 | 10.0.0.3 | MON + OSD | /dev/sdb, /dev/sdc |

- 公共网络：`10.0.0.0/24`
- 集群网络：`10.0.1.0/24`（OSD 间复制）

### 配置

**前置要求**（所有节点）：
```bash
# 时间同步
yum install -y chrony
systemctl enable chronyd && systemctl start chronyd

# SSH 免密（bootstrap 节点 → 所有节点，含自身）
ssh-keygen -t rsa -b 4096 -N '' -f ~/.ssh/id_rsa
for host in node1 node2 node3; do ssh-copy-id root@$host; done

# 主机名解析
cat >> /etc/hosts << 'EOF'
10.0.0.1 node1
10.0.0.2 node2
10.0.0.3 node3
EOF
```

### 启动

**在 node1（bootstrap 节点）执行**：
```bash
# 引导集群
cephadm bootstrap \
  --mon-ip 10.0.0.1 \
  --initial-dashboard-password Str0ngCeph!Pass

# 将 SSH key 复制到其他节点
cephadm shell -- ceph orch host add node2 10.0.0.2
cephadm shell -- ceph orch host add node3 10.0.0.3

# 添加 MON 到所有节点（≥ 3 节点）
ceph orch apply mon node1,node2,node3

# 添加 MGR（≥ 2 节点）
ceph orch apply mgr node1,node2

# 添加 OSD（自动发现所有可用磁盘）
ceph orch apply osd --all-available-devices

# （可选）部署 MDS（CephFS）
ceph orch apply mds myfs --placement="3 node1 node2 node3"
```

### 创建存储池

```bash
# RBD（块存储）
ceph osd pool create rbd-pool 128 128 replicated
ceph osd pool set rbd-pool size 3
ceph osd pool application enable rbd-pool rbd

# RGW（对象存储）
ceph orch apply rgw myrgw --placement="2 node1 node2"

# CephFS（文件存储）
ceph osd pool create cephfs_data 128 128 replicated
ceph osd pool create cephfs_metadata 64 64 replicated
ceph fs new myfs cephfs_metadata cephfs_data
```

### 验证

```bash
ceph -s
ceph osd tree
ceph mon stat
# 应显示 3 MON, 2 MGR, N OSD, HEALTH_OK
```

### Docker Compose

> Ceph 生产不推荐 Docker Compose。裸机请使用 cephadm，K8s 请使用 Rook。

---

## 5. 运维速查

```bash
# 集群状态
ceph -s                             # 概览
ceph health detail                  # 健康详情
ceph osd tree                       # OSD 拓扑
ceph osd df tree                    # OSD 使用率
ceph df                             # Pool 使用

# OSD 管理
ceph osd down osd.0                 # 标记下线
ceph osd out osd.0                  # 移出集群
ceph osd rm osd.0                   # 删除
ceph osd reweight osd.0 0.8         # 调整权重

# Pool 操作
ceph osd pool ls
ceph osd pool get rbd-pool size
ceph osd pool set rbd-pool size 3

# RBD
rbd create rbd-pool/img --size 10G
rbd map rbd-pool/img
rbd snap create rbd-pool/img@snap1
rbd snap rollback rbd-pool/img@snap1

# 监控
ceph mgr module enable prometheus
# 端点：http://mgr-node:9283/metrics

# 日志
ceph log last 100
ceph daemon osd.0 log flush
```

---

## 6. 常见故障

### 故障 1：PG 降级（HEALTH_WARN degraded）

```bash
ceph health detail
ceph pg query <pgid>
# 检查 OSD 状态 → 等待自动恢复 → 手动触发
ceph pg force_recovery <pgid>
```

### 故障 2：OSD 崩溃循环

```bash
ceph daemon osd.0 log flush
# 检查 /var/log/ceph/*.log
# 常见原因：磁盘故障 → 内存不足 → 网络不稳定
```

### 故障 3：集群满（HEALTH_ERR full）

```bash
ceph df detail
ceph osd df tree
# 解决：删除旧数据 → 增加 OSD → 调整 full_ratio
```

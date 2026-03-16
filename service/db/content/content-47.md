# 硬件选型与配置

## 概述

硬件是数据库性能的基础，合理的硬件选型和配置对数据库性能有决定性影响。本章介绍数据库服务器的硬件选择原则和配置建议。

**核心要素**：
- **CPU**：计算能力
- **内存**：缓存和临时数据
- **存储**：数据持久化
- **网络**：数据传输
- **RAID**：数据可靠性和性能

---

## CPU 选型

### 1. CPU 特性

**核心数 vs 主频**：
```
OLTP 场景（高并发）：
- 需要更多核心
- 推荐：16-32 核心
- 主频：2.5-3.0 GHz

OLAP 场景（复杂查询）：
- 需要更高主频
- 推荐：8-16 核心
- 主频：3.0+ GHz

混合场景：
- 平衡核心数和主频
- 推荐：16-24 核心
- 主频：2.8-3.2 GHz
```

**CPU 架构**：
```
Intel：
- Xeon Scalable（至强可扩展）
- 稳定可靠
- 生态成熟

AMD：
- EPYC（霄龙）
- 核心数多
- 性价比高

ARM：
- Graviton（AWS）
- 能效比高
- 云环境推荐
```

### 2. CPU 配置建议

**OLTP 数据库**：
```
推荐配置：
- CPU：2 × Intel Xeon Gold 6248R
- 核心：2 × 24 = 48 核心
- 主频：3.0 GHz（睿频 4.0 GHz）
- 线程：96 线程（超线程）

或：
- CPU：2 × AMD EPYC 7543
- 核心：2 × 32 = 64 核心
- 主频：2.8 GHz（加速 3.7 GHz）
```

**OLAP 数据库**：
```
推荐配置：
- CPU：2 × Intel Xeon Gold 6238R
- 核心：2 × 28 = 56 核心
- 主频：2.2 GHz（睿频 4.0 GHz）
- 缓存：大 L3 缓存（38.5 MB）
```

### 3. CPU 优化

**绑定 CPU（NUMA）**：
```bash
# 查看 NUMA 信息
numactl --hardware

# 绑定 MySQL 到特定 NUMA 节点
numactl --cpunodebind=0 --membind=0 mysqld

# 或在配置文件
[mysqld]
# 禁用 NUMA 交换
innodb_numa_interleave = 1
```

**超线程**：
```
启用超线程：
✓ OLTP 高并发场景
✓ 提升吞吐量

禁用超线程：
✓ OLAP 复杂查询
✓ 减少上下文切换
✓ 提升单线程性能

建议：
- 测试对比
- 根据实际负载决定
```

---

## 内存选型

### 1. 内存容量

**容量规划**：
```
Buffer Pool（InnoDB）：
- 推荐：物理内存的 70-80%
- 最小：1 GB
- 推荐：64 GB - 256 GB

计算公式：
内存需求 = 工作数据集 + 操作系统 + 其他组件

示例：
- 工作数据集：100 GB
- 操作系统：4 GB
- 其他组件：4 GB
- Buffer Pool：100 GB（按 80% 计算，需要 125 GB）
- 总内存：125 GB + 4 GB + 4 GB = 133 GB
- 推荐：128 GB 或 192 GB
```

**不同场景**：
```
小型数据库（< 10 GB）：
- 内存：16 GB - 32 GB

中型数据库（10-100 GB）：
- 内存：64 GB - 128 GB

大型数据库（100 GB - 1 TB）：
- 内存：256 GB - 512 GB

超大型数据库（> 1 TB）：
- 内存：512 GB - 1 TB+
- 或分库分表
```

### 2. 内存类型

**DDR4 vs DDR5**：
```
DDR4：
- 成熟稳定
- 性价比高
- 频率：2666-3200 MHz
- 推荐用于生产环境

DDR5：
- 性能更好
- 频率：4800-6400 MHz
- 价格较高
- 新硬件支持

推荐：
- 目前选择 DDR4
- 未来逐步迁移 DDR5
```

**ECC 内存**：
```
ECC（Error-Correcting Code）：
✓ 自动检测和纠正错误
✓ 数据库强烈推荐
✓ 提高数据可靠性

非 ECC：
✗ 不推荐用于数据库
✗ 可能出现数据损坏

建议：
- 生产环境必须使用 ECC 内存
```

### 3. 内存配置

**MySQL 配置**：
```ini
[mysqld]
# Buffer Pool（70-80% 物理内存）
innodb_buffer_pool_size = 128G

# 其他内存参数
key_buffer_size = 256M           # MyISAM 键缓冲
query_cache_size = 0             # 查询缓存（已废弃）
tmp_table_size = 64M             # 临时表大小
max_heap_table_size = 64M        # 内存表最大大小
sort_buffer_size = 2M            # 排序缓冲（每个连接）
read_buffer_size = 2M            # 读缓冲（每个连接）
read_rnd_buffer_size = 4M        # 随机读缓冲
join_buffer_size = 2M            # JOIN 缓冲（每个连接）
thread_stack = 256K              # 线程栈大小
```

---

## 存储选型

### 1. 存储类型

**HDD（机械硬盘）**：
```
特点：
- 容量大
- 价格低
- IOPS 低（100-200）
- 延迟高（5-10 ms）

适用场景：
- 归档数据
- 冷数据
- 日志存储
- 备份存储

不适用：
✗ OLTP 数据库
✗ 高并发场景
```

**SSD（固态硬盘）**：
```
SATA SSD：
- IOPS：20K-100K
- 延迟：< 1 ms
- 性价比高

NVMe SSD：
- IOPS：100K-1M
- 延迟：< 0.1 ms
- 性能极佳

推荐：
- OLTP：NVMe SSD
- OLAP：NVMe SSD 或 SATA SSD
- 归档：HDD
```

**企业级 SSD**：
```
特性：
✓ 高耐用性（DWPD）
✓ 稳定性能
✓ 掉电保护
✓ 长质保期

推荐品牌：
- Intel Optane
- Samsung PM1733
- Kingston DC1000B
- Micron 7450

选择要点：
- DWPD ≥ 3（每天全盘写入 3 次）
- 随机读写性能
- 掉电保护
- 质保期 ≥ 5 年
```

### 2. 容量规划

**数据库容量**：
```
计算公式：
存储需求 = 数据大小 × (1 + 增长率) × 冗余系数 + 日志空间

示例：
- 当前数据：500 GB
- 年增长率：50%
- 3 年规划：500 × (1 + 0.5)³ = 1687 GB
- 冗余系数：1.5（RAID 1+0）
- 日志空间：200 GB
- 总需求：1687 × 1.5 + 200 = 2730 GB
- 推荐：3 TB - 4 TB SSD
```

**IOPS 需求**：
```
OLTP 场景：
- QPS：10,000
- 每个查询 I/O：2-5 次
- IOPS 需求：20,000 - 50,000

OLAP 场景：
- 并发查询：100
- 每个查询 I/O：1000+
- IOPS 需求：100,000+

推荐：
- NVMe SSD（IOPS > 100K）
```

### 3. 存储配置

**分区挂载**：
```bash
# 数据分区
/data/mysql                  # 数据目录
/data/mysql/binlog          # 二进制日志
/data/mysql/redo            # Redo Log
/data/mysql/undo            # Undo Log
/data/mysql/tmp             # 临时文件

# 文件系统
ext4 或 xfs

# 挂载选项
/dev/nvme0n1 /data/mysql ext4 noatime,nodiratime,nobarrier 0 0

# noatime：不更新访问时间（提升性能）
# nodiratime：不更新目录访问时间
# nobarrier：禁用写屏障（有掉电保护可禁用）
```

**I/O 调度器**：
```bash
# 查看当前调度器
cat /sys/block/nvme0n1/queue/scheduler

# SSD 推荐：noop 或 none
echo none > /sys/block/nvme0n1/queue/scheduler

# HDD 推荐：deadline
echo deadline > /sys/block/sda/queue/scheduler

# 永久配置（/etc/default/grub）
GRUB_CMDLINE_LINUX="elevator=none"
```

---

## RAID 配置

### 1. RAID 级别

**RAID 0**：
```
特点：
- 条带化（Striping）
- 无冗余
- 性能最好（读写都提升）
- 容量：N × 单盘容量

优点：
✓ 性能极佳
✓ 容量利用率 100%

缺点：
✗ 无容错（一块盘损坏，所有数据丢失）

使用场景：
- 临时数据
- 可重建的数据
- 性能优先且有其他备份

不推荐用于数据库数据盘
```

**RAID 1**：
```
特点：
- 镜像（Mirroring）
- 数据完全冗余
- 读性能提升，写性能不变
- 容量：N × 单盘容量 / 2

优点：
✓ 高可靠性
✓ 读性能好

缺点：
✗ 容量利用率 50%
✗ 写性能不提升

使用场景：
- 操作系统盘
- 日志盘
- 小容量关键数据
```

**RAID 5**：
```
特点：
- 分布式奇偶校验
- 允许 1 块盘损坏
- 容量：(N-1) × 单盘容量

优点：
✓ 容量利用率高（N-1)/N
✓ 有容错能力

缺点：
✗ 写性能差（需计算校验）
✗ 重建时间长
✗ 重建期间风险高

使用场景：
- 不推荐用于数据库
- 可用于归档数据
```

**RAID 10（1+0）推荐**：
```
特点：
- 先镜像（RAID 1），再条带（RAID 0）
- 允许部分盘损坏（最多 N/2 块）
- 容量：N × 单盘容量 / 2

优点：
✓ 高性能（读写都好）
✓ 高可靠性
✓ 重建快

缺点：
✗ 容量利用率 50%
✗ 成本高

使用场景：
✓ 数据库数据盘（强烈推荐）
✓ OLTP 场景
✓ 高并发场景

配置示例：
- 4 × 1.92 TB NVMe SSD
- RAID 10
- 可用容量：3.84 TB
- IOPS：400K+（4 块盘累加）
```

### 2. 硬件 RAID vs 软件 RAID

**硬件 RAID**：
```
优点：
✓ 性能好（专用 RAID 卡）
✓ 有缓存（带电池）
✓ 掉电保护
✓ 管理方便

缺点：
✗ 成本高
✗ 维护复杂
✗ 厂商锁定

推荐：
- 传统物理服务器
- 关键业务
```

**软件 RAID（mdadm）**：
```
优点：
✓ 成本低
✓ 灵活
✓ 不依赖硬件

缺点：
✗ 占用 CPU
✗ 无缓存
✗ 无掉电保护（需 SSD 自带）

推荐：
- 云环境
- 使用企业级 SSD（自带掉电保护）
```

**云盘（云环境）**：
```
AWS EBS：
- io2 Block Express
- IOPS：256,000
- 吞吐量：4,000 MB/s

阿里云 ESSD：
- PL3
- IOPS：1,000,000
- 吞吐量：4,000 MB/s

推荐：
- 云环境首选
- 自动冗余
- 灵活扩展
```

---

## 网络配置

### 1. 网络带宽

**带宽需求**：
```
计算公式：
带宽需求 = QPS × 平均响应大小 × 8 / 1024 / 1024

示例：
- QPS：10,000
- 平均响应：10 KB
- 带宽：10000 × 10 × 8 / 1024 / 1024 = 762 Mbps
- 推荐：1 Gbps 或 10 Gbps

不同场景：
- OLTP：1 Gbps - 10 Gbps
- OLAP：10 Gbps - 25 Gbps
- 复制：1 Gbps - 10 Gbps
```

**网卡配置**：
```
推荐：
- 双网卡（主备或聚合）
- 万兆网卡（10 Gbps）
- 支持 RDMA（高性能场景）

网卡绑定（Bonding）：
- Mode 0：负载均衡
- Mode 1：主备
- Mode 4：LACP（推荐）
```

### 2. 网络优化

**TCP 参数**：
```bash
# /etc/sysctl.conf

# TCP 缓冲区
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 87380 16777216

# TCP 连接队列
net.core.somaxconn = 32768
net.ipv4.tcp_max_syn_backlog = 8192

# TCP TIME_WAIT
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30

# TCP keepalive
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 3

# 应用
sysctl -p
```

---

## 服务器配置示例

### 1. 小型数据库

**配置**：
```
CPU：Intel Xeon E-2288G（8 核 16 线程）
内存：64 GB DDR4 ECC
存储：2 × 960 GB SATA SSD RAID 1
网络：双 1 Gbps 网卡
价格：约 $3,000

适用场景：
- 数据量 < 50 GB
- QPS < 5,000
- 用户数 < 10,000
```

### 2. 中型数据库

**配置**：
```
CPU：2 × Intel Xeon Gold 6248R（48 核 96 线程）
内存：256 GB DDR4 ECC
存储：4 × 1.92 TB NVMe SSD RAID 10
网络：双 10 Gbps 网卡
价格：约 $15,000

适用场景：
- 数据量：50-500 GB
- QPS：5,000-50,000
- 用户数：10,000-100,000
```

### 3. 大型数据库

**配置**：
```
CPU：2 × AMD EPYC 7763（128 核 256 线程）
内存：1 TB DDR4 ECC
存储：8 × 3.84 TB NVMe SSD RAID 10
网络：双 25 Gbps 网卡
价格：约 $50,000+

适用场景：
- 数据量：500 GB - 5 TB
- QPS：50,000-500,000
- 用户数：100,000-1,000,000+
```

---

## 云服务器选型

### 1. AWS

**RDS 实例**：
```
db.r6i.8xlarge：
- vCPU：32
- 内存：256 GB
- 网络：25 Gbps
- 存储：io2（256,000 IOPS）

价格：
- 按需：$4.80/小时
- 预留 1 年：$2.88/小时
- 预留 3 年：$1.82/小时
```

### 2. 阿里云

**RDS 实例**：
```
mysql.x8.4xlarge：
- vCPU：32
- 内存：256 GB
- 网络：20 Gbps
- 存储：ESSD PL3（1,000,000 IOPS）

价格：
- 按需：约 ¥30/小时
- 包年：约 ¥200,000/年
```

---

## 最佳实践

### 1. 硬件选型原则

```
□ 根据业务负载选择
□ 预留 30-50% 增长空间
□ 优先保证核心组件（CPU、内存、SSD）
□ 使用企业级硬件
□ 考虑性价比
□ 规划扩展性
```

### 2. 成本优化

```
□ 云环境使用预留实例
□ 合理选择规格（不要过度配置）
□ 使用性价比高的 AMD CPU
□ 归档数据使用 HDD
□ 定期清理过期数据
```

### 3. 可靠性保障

```
□ 使用 ECC 内存
□ 数据盘使用 RAID 10
□ 企业级 SSD（带掉电保护）
□ 冗余电源
□ UPS 不间断电源
□ 监控硬件状态
```

---

## 参考资料

1. **硬件厂商**：
   - Intel Xeon：https://www.intel.com/content/www/us/en/products/processors/xeon.html
   - AMD EPYC：https://www.amd.com/en/processors/epyc

2. **云服务商**：
   - AWS RDS：https://aws.amazon.com/rds/
   - 阿里云 RDS：https://www.aliyun.com/product/rds

3. **最佳实践**：
   - 根据负载选择硬件
   - 预留增长空间
   - 使用企业级组件
   - 定期监控和维护
   - 测试性能基线
   - 持续优化

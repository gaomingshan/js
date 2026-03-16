# 系统参数优化

## 概述

操作系统参数配置对数据库性能有重要影响。合理配置系统参数可以显著提升数据库性能和稳定性。本章介绍 Linux 系统参数优化的方法和最佳实践。

**优化方向**：
- **内核参数**：网络、文件系统、内存
- **资源限制**：文件描述符、进程数
- **I/O 调度**：磁盘调度器
- **透明大页**：内存管理
- **NUMA**：非统一内存访问

---

## 内核参数优化

### 1. 网络参数

**TCP 参数**：
```bash
# /etc/sysctl.conf

# TCP 缓冲区大小
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# TCP 连接队列
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# TIME_WAIT 连接复用
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 0  # 不建议启用

# FIN_WAIT 超时
net.ipv4.tcp_fin_timeout = 30

# TCP keepalive
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 3

# TCP 窗口缩放
net.ipv4.tcp_window_scaling = 1

# 应用配置
sysctl -p
```

**端口范围**：
```bash
# 扩大可用端口范围
net.ipv4.ip_local_port_range = 10000 65535
```

### 2. 内存参数

**虚拟内存**：
```bash
# Swappiness（交换倾向）
# 0：尽量不使用 swap
# 100：积极使用 swap
# 推荐：0-10（数据库服务器）
vm.swappiness = 0

# 脏页参数
# 脏页比例达到此值时，开始后台刷新
vm.dirty_ratio = 10

# 脏页比例达到此值时，阻塞写操作
vm.dirty_background_ratio = 5

# 脏页存活时间（厘秒）
vm.dirty_expire_centisecs = 3000

# 刷新间隔（厘秒）
vm.dirty_writeback_centisecs = 500
```

**OOM Killer**：
```bash
# OOM 分数调整
# -1000 到 1000
# -1000：永不杀死
# 0：默认
# 1000：优先杀死

# 查看 MySQL 进程 OOM 分数
cat /proc/$(pidof mysqld)/oom_score

# 调整 OOM 分数（降低被杀概率）
echo -800 > /proc/$(pidof mysqld)/oom_score_adj

# 永久配置（systemd）
[Service]
OOMScoreAdjust=-800
```

### 3. 文件系统参数

**文件描述符**：
```bash
# 系统级别限制
fs.file-max = 6553600

# 查看当前使用
cat /proc/sys/fs/file-nr

# 用户级别限制（/etc/security/limits.conf）
mysql soft nofile 65535
mysql hard nofile 65535
mysql soft nproc 65535
mysql hard nproc 65535

# 或使用 systemd（/etc/systemd/system/mysqld.service.d/limits.conf）
[Service]
LimitNOFILE=65535
LimitNPROC=65535

# 重启服务
systemctl daemon-reload
systemctl restart mysqld
```

**AIO（异步 I/O）**：
```bash
# AIO 最大请求数
fs.aio-max-nr = 1048576

# 查看当前使用
cat /proc/sys/fs/aio-nr
```

---

## I/O 调度优化

### 1. I/O 调度器

**调度器类型**：
```
CFQ（Completely Fair Queuing）：
- 默认调度器（老版本）
- 公平分配 I/O
- 适合桌面环境

Deadline：
- 截止时间调度
- 避免请求饿死
- 适合数据库

NOOP：
- 无操作调度（FIFO）
- 适合 SSD

None（BFQ）：
- 新版本默认
- 适合 SSD
```

**查看和设置**：
```bash
# 查看当前调度器
cat /sys/block/nvme0n1/queue/scheduler
# [none] mq-deadline kyber bfq

# SSD 使用 none 或 noop
echo none > /sys/block/nvme0n1/queue/scheduler

# HDD 使用 deadline
echo deadline > /sys/block/sda/queue/scheduler

# 永久配置（/etc/default/grub）
GRUB_CMDLINE_LINUX="elevator=none"
# 或针对特定设备
GRUB_CMDLINE_LINUX="nvme0n1.iosched=none"

# 更新 GRUB
update-grub  # Debian/Ubuntu
grub2-mkconfig -o /boot/grub2/grub.cfg  # RHEL/CentOS

# 重启生效
reboot
```

### 2. I/O 队列深度

```bash
# 查看队列深度
cat /sys/block/nvme0n1/queue/nr_requests

# 增加队列深度（SSD）
echo 1024 > /sys/block/nvme0n1/queue/nr_requests

# HDD 保持默认（128）
```

### 3. 预读参数

```bash
# 查看预读大小（KB）
blockdev --getra /dev/nvme0n1

# 设置预读（SSD：128-256KB）
blockdev --setra 256 /dev/nvme0n1

# HDD：4096KB
blockdev --setra 4096 /dev/sda

# 永久配置（udev 规则）
# /etc/udev/rules.d/60-readahead.rules
ACTION=="add|change", KERNEL=="nvme[0-9]n[0-9]", ATTR{queue/read_ahead_kb}="256"
```

---

## 透明大页（THP）

### 1. 概念

**透明大页**：
```
默认页大小：4KB
大页大小：2MB

优点：
- 减少页表大小
- 减少 TLB 未命中
- 提升性能（理论）

问题：
- 数据库场景可能导致性能下降
- 内存碎片
- 延迟增加
```

### 2. 禁用 THP

**检查状态**：
```bash
# 查看 THP 状态
cat /sys/kernel/mm/transparent_hugepage/enabled
# [always] madvise never

cat /sys/kernel/mm/transparent_hugepage/defrag
# [always] defer defer+madvise madvise never
```

**禁用方法**：
```bash
# 临时禁用
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag

# 永久禁用（/etc/default/grub）
GRUB_CMDLINE_LINUX="transparent_hugepage=never"

# 更新 GRUB
update-grub  # Debian/Ubuntu
grub2-mkconfig -o /boot/grub2/grub.cfg  # RHEL/CentOS

# 重启生效
reboot

# 或使用 systemd
# /etc/systemd/system/disable-thp.service
[Unit]
Description=Disable Transparent Huge Pages

[Service]
Type=oneshot
ExecStart=/bin/sh -c 'echo never > /sys/kernel/mm/transparent_hugepage/enabled'
ExecStart=/bin/sh -c 'echo never > /sys/kernel/mm/transparent_hugepage/defrag'

[Install]
WantedBy=multi-user.target

# 启用服务
systemctl enable disable-thp
systemctl start disable-thp
```

---

## NUMA 优化

### 1. NUMA 概念

**架构**：
```
NUMA（Non-Uniform Memory Access）：
- 多个 CPU 节点
- 每个节点有本地内存
- 访问本地内存快，访问远程内存慢

查看 NUMA 信息：
numactl --hardware

示例输出：
available: 2 nodes (0-1)
node 0 cpus: 0 1 2 3 4 5 6 7
node 0 size: 32GB
node 1 cpus: 8 9 10 11 12 13 14 15
node 1 size: 32GB
```

### 2. NUMA 策略

**交叉分配（Interleave）**：
```bash
# 内存交叉分配到所有节点
numactl --interleave=all mysqld

# MySQL 配置
innodb_numa_interleave = 1
```

**绑定到节点**：
```bash
# 绑定 MySQL 到节点 0
numactl --cpunodebind=0 --membind=0 mysqld

# 优点：
- 访问内存快
- 性能稳定

# 缺点：
- 只使用部分资源
- 可能内存不足
```

**禁用 NUMA**：
```bash
# BIOS 中禁用 NUMA（推荐）

# 或内核参数
GRUB_CMDLINE_LINUX="numa=off"
```

**建议**：
```
单实例数据库：
- BIOS 禁用 NUMA
- 或使用 interleave

多实例数据库：
- 每个实例绑定到一个节点
```

---

## 资源限制

### 1. ulimit 配置

**查看限制**：
```bash
# 查看所有限制
ulimit -a

# 查看文件描述符
ulimit -n

# 查看进程数
ulimit -u

# 查看核心转储
ulimit -c
```

**设置限制**：
```bash
# /etc/security/limits.conf

# 文件描述符
mysql soft nofile 65535
mysql hard nofile 65535

# 进程/线程数
mysql soft nproc 65535
mysql hard nproc 65535

# 核心转储文件大小
mysql soft core unlimited
mysql hard core unlimited

# 最大内存锁定
mysql soft memlock unlimited
mysql hard memlock unlimited

# 最大地址空间
mysql soft as unlimited
mysql hard as unlimited
```

**systemd 配置**：
```ini
# /etc/systemd/system/mysqld.service.d/limits.conf
[Service]
LimitNOFILE=65535
LimitNPROC=65535
LimitCORE=infinity
LimitMEMLOCK=infinity
LimitAS=infinity

# 重启服务
systemctl daemon-reload
systemctl restart mysqld
```

### 2. 进程数限制

```bash
# 系统级别进程数
kernel.pid_max = 4194304

# 线程数
kernel.threads-max = 4194304
```

---

## 时间同步

### 1. NTP 配置

**安装 NTP**：
```bash
# CentOS/RHEL
yum install chrony

# Ubuntu/Debian
apt-get install chrony

# 配置 /etc/chrony.conf
server 0.pool.ntp.org iburst
server 1.pool.ntp.org iburst
server 2.pool.ntp.org iburst
server 3.pool.ntp.org iburst

# 启动服务
systemctl enable chronyd
systemctl start chronyd

# 查看同步状态
chronyc tracking
chronyc sources
```

**重要性**：
```
时间同步对数据库很重要：
- 日志时间戳准确
- 事务时间准确
- 主从复制依赖时间
- 监控告警准确
```

---

## SELinux 和防火墙

### 1. SELinux

**检查状态**：
```bash
# 查看 SELinux 状态
getenforce
# Enforcing, Permissive, Disabled

# 查看详细状态
sestatus
```

**配置 SELinux**：
```bash
# 临时关闭
setenforce 0

# 永久关闭（/etc/selinux/config）
SELINUX=disabled

# 或设置为 permissive
SELINUX=permissive

# 重启生效
reboot
```

**建议**：
```
生产环境：
- 根据安全需求决定
- 如果启用，配置正确的策略
- 测试环境可以禁用

如果启用 SELinux：
- 配置 MySQL 相关策略
- 允许网络访问
- 允许文件访问
```

### 2. 防火墙

**Firewalld**：
```bash
# 检查状态
systemctl status firewalld

# 开放 MySQL 端口
firewall-cmd --permanent --add-port=3306/tcp
firewall-cmd --reload

# 或添加服务
firewall-cmd --permanent --add-service=mysql
firewall-cmd --reload

# 查看规则
firewall-cmd --list-all
```

**iptables**：
```bash
# 允许 MySQL 端口
iptables -A INPUT -p tcp --dport 3306 -j ACCEPT

# 保存规则
service iptables save

# 查看规则
iptables -L -n
```

---

## 文件系统优化

### 1. 挂载选项

**推荐挂载选项**：
```bash
# /etc/fstab

# ext4
UUID=xxx /data/mysql ext4 noatime,nodiratime,nobarrier 0 0

# xfs
UUID=xxx /data/mysql xfs noatime,nodiratime,nobarrier,logbufs=8,logbsize=256k 0 0

# 选项说明：
# noatime：不更新访问时间（性能提升）
# nodiratime：不更新目录访问时间
# nobarrier：禁用写屏障（SSD 有掉电保护可用）
# logbufs：日志缓冲数（xfs）
# logbsize：日志缓冲大小（xfs）

# 重新挂载
mount -o remount /data/mysql
```

### 2. 文件系统选择

**ext4 vs xfs**：
```
ext4：
✓ 成熟稳定
✓ 广泛使用
✓ 小文件性能好

xfs：
✓ 大文件性能好
✓ 并发性能好
✓ 元数据性能好
✓ 在线扩容
✓ 推荐用于数据库

建议：
- 新系统使用 xfs
- 老系统可继续使用 ext4
```

---

## 完整配置示例

### 1. sysctl.conf

```bash
# /etc/sysctl.conf

# 网络
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 3
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.ip_local_port_range = 10000 65535

# 内存
vm.swappiness = 0
vm.dirty_ratio = 10
vm.dirty_background_ratio = 5

# 文件系统
fs.file-max = 6553600
fs.aio-max-nr = 1048576

# 内核
kernel.pid_max = 4194304
kernel.threads-max = 4194304

# 应用
sysctl -p
```

### 2. limits.conf

```bash
# /etc/security/limits.conf

mysql soft nofile 65535
mysql hard nofile 65535
mysql soft nproc 65535
mysql hard nproc 65535
mysql soft core unlimited
mysql hard core unlimited
```

### 3. systemd 配置

```ini
# /etc/systemd/system/mysqld.service.d/override.conf

[Service]
LimitNOFILE=65535
LimitNPROC=65535
LimitCORE=infinity
OOMScoreAdjust=-800

# 应用
systemctl daemon-reload
systemctl restart mysqld
```

---

## 验证与测试

### 1. 验证配置

**检查脚本**：
```bash
#!/bin/bash

echo "=== System Parameters Check ==="

# Swappiness
echo "Swappiness: $(cat /proc/sys/vm/swappiness)"

# THP
echo "THP Enabled: $(cat /sys/kernel/mm/transparent_hugepage/enabled)"
echo "THP Defrag: $(cat /sys/kernel/mm/transparent_hugepage/defrag)"

# I/O Scheduler
echo "I/O Scheduler (nvme0n1): $(cat /sys/block/nvme0n1/queue/scheduler)"

# File descriptors
echo "File descriptors: $(ulimit -n)"

# TCP settings
echo "Somaxconn: $(cat /proc/sys/net/core/somaxconn)"
echo "TCP tw_reuse: $(cat /proc/sys/net/ipv4/tcp_tw_reuse)"

# SELinux
echo "SELinux: $(getenforce)"

echo "=== Check Complete ==="
```

### 2. 性能测试

**基准测试**：
```bash
# sysbench 测试
sysbench oltp_read_write \
  --mysql-host=localhost \
  --mysql-user=root \
  --mysql-password=password \
  --mysql-db=testdb \
  --tables=10 \
  --table-size=100000 \
  --threads=16 \
  --time=60 \
  run

# 对比优化前后性能
```

---

## 最佳实践

### 1. 优化清单

```
□ 禁用 Swappiness（设为 0）
□ 禁用透明大页（THP）
□ 设置合适的 I/O 调度器
□ 增加文件描述符限制
□ 配置 TCP 参数
□ 配置时间同步
□ 处理 SELinux/防火墙
□ 优化文件系统挂载选项
□ 配置 NUMA
□ 验证配置生效
```

### 2. 监控项

```
□ CPU 使用率
□ 内存使用率
□ Swap 使用
□ 磁盘 I/O
□ 网络流量
□ 文件描述符使用
□ 系统负载
```

### 3. 注意事项

```
□ 修改前备份配置
□ 逐项修改并测试
□ 记录修改内容
□ 重启前验证配置
□ 监控系统稳定性
□ 建立性能基线
```

---

## 参考资料

1. **Linux 文档**：
   - Kernel Documentation: https://www.kernel.org/doc/
   - RHEL Performance Tuning Guide

2. **MySQL 文档**：
   - MySQL Installation Guide
   - MySQL Performance Tuning

3. **推荐工具**：
   - sysstat：系统性能监控
   - dstat：综合性能监控
   - iostat：I/O 统计

4. **最佳实践**：
   - 理解参数含义
   - 根据负载调整
   - 测试验证效果
   - 持续监控优化
   - 文档化配置

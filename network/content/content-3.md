# ARP 地址解析协议

> 链路层 | IP→MAC | 广播查询 | 无认证 | 仅限同一广播域

---

## 报文结构

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Hardware Type          |         Protocol Type          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  HW Addr Len |  Proto Addr Len|          Operation            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Sender MAC Address                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Sender IP Address                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Target MAC Address                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Target IP Address                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| Hardware Type | 16bit | 链路层类型：1=Ethernet |
| Protocol Type | 16bit | 网络层协议：0x0800=IPv4 |
| HW Addr Len | 8bit | MAC 地址长度：6（Ethernet） |
| Proto Addr Len | 8bit | IP 地址长度：4（IPv4） |
| Operation | 16bit | 1=Request, 2=Reply |
| Sender MAC | 48bit | 发送方 MAC |
| Sender IP | 32bit | 发送方 IP |
| Target MAC | 48bit | 目标 MAC（Request 时填 00:00:00:00:00:00） |
| Target IP | 32bit | 目标 IP |

### 常用操作码

| 操作 | 值 | 方向 | 说明 |
|------|-----|------|------|
| ARP Request | 1 | 广播 | "谁的 IP 是 x.x.x.x？" |
| ARP Reply | 2 | 单播 | "我是，我的 MAC 是 xx:xx" |
| RARP Request | 3 | 广播 | "我的 MAC 是 xx:xx，谁告诉我 IP？" |
| RARP Reply | 4 | 单播 | "你的 IP 是 x.x.x.x" |
| Gratuitous ARP | 1 | 广播 | 发送方 IP = 目标 IP，用于宣告/冲突检测 |

---

## 核心能力

### 1. ARP 解析流程

主机 A 知道目标 IP（192.168.1.20）但不知道它的 MAC 地址，无法封装以太网帧。ARP 通过广播查询解决。

```
Host A (192.168.1.10)              Switch                Host B (192.168.1.20)
    |   MAC: aa:bb:cc:11:22:33            |    MAC: dd:ee:ff:44:55:66
    |                               |                               |
    | 1. 查 ARP 缓存：192.168.1.20？                               |
    |    → 没有，发 ARP Request                                      |
    |                               |                               |
    |--- BROADCAST (FF:FF:FF:FF:FF:FF)                           |
    |    Op=1 (Request)              |                               |
    |    Sender MAC = aa:bb:cc:11:22:33                             |
    |    Sender IP  = 192.168.1.10                                  |
    |    Target MAC = 00:00:00:00:00:00                             |
    |    Target IP  = 192.168.1.20  |                               |
    |                               |-- 广播给所有端口 -----------→|
    |                               |                               |
    |                               |   2. Host B 收到：IP 匹配！    |
    |                               |   3. 更新 ARP 缓存             |
    |                               |   4. 回复 ARP Reply            |
    |                               |                               |
    |←-- UNICAST -------------------|-------------------------------|
    |    Op=2 (Reply)               |                               |
    |    Sender MAC = dd:ee:ff:44:55:66                             |
    |    Sender IP  = 192.168.1.20                                  |
    |    Target MAC = aa:bb:cc:11:22:33                             |
    |    Target IP  = 192.168.1.10  |                               |
    |                               |                               |
    | 5. 收到 Reply：更新 ARP 缓存                                  |
    |    192.168.1.20 → dd:ee:ff:44:55:66                          |
    | 6. 封装以太网帧发数据         →|------------------------------→|
```

- ARP Request 的目标 MAC 填全 0（不匹配任何网卡）
- 非目标主机忽略 Request（只可能更新发送方条目）
- Reply 是单播（直接发给请求方）

---

### 2. ARP 缓存与生命周期

每次广播全子网都很贵，ARP 缓存让主机记住 IP↔MAC 映射一段时间。

```
ARP 表（ip neigh show）：
192.168.1.1   dev eth0 lladdr aa:bb:cc:00:11:22 REACHABLE
192.168.1.20  dev eth0 lladdr dd:ee:ff:44:55:66 STALE
192.168.1.100 dev eth0 lladdr 11:22:33:44:55:66 PERMANENT
```

| 状态 | 含义 | 超时 | 行为 |
|------|------|------|------|
| REACHABLE | 最近通信过，条目有效 | ~30s | 直接使用 |
| STALE | 超过 REACHABLE 时间没通信 | 不确定 | 下次通信前先探测（单播 ARP） |
| DELAY | STALE 且有数据要发 | 5s | 等确认，避免不必要探测 |
| PROBE | DELAY 超时没确认 | 重试 | 单播 ARP 探测，3 次失败→FAILED |
| FAILED | 探测无响应 | 立即 | 条目不可用，清空 |
| PERMANENT | 静态绑定 | 永远 | `arp -s` 或 `ip neigh add ... nud permanent` |

- 主机收到 ARP Request 或 Reply 时会更新缓存（即使自己没有请求）
- 静态绑定（PERMANENT）防 ARP 欺骗但不防 MAC 被仿冒

---

### 3. Gratuitous ARP

主机主动向自己发 ARP Request（sender IP = target IP = 自己的 IP），无需有人问。

```
主机 A 刚配置 IP 192.168.1.10
         |                              |                              |
         |--- ARP Request (广播) →     |                              |
         |    Op=1, Sender IP=192.168.1.10                             |
         |    Target IP=192.168.1.10                                    |
         |                              |                              |
         | 有两种可能的结果：            |                              |
         |                              |                              |
         |←--- 无人应答 ---------------|                              |
         |    → IP 没有冲突，放心使用    |                              |
         |                              |                              |
         | ←--- 有人回复：            ---|-------------------→          |
         |      Op=2, Sender MAC=??    |                              |
         |    → IP 冲突！报 "Duplicate IP"                             |
         |                              |                              |
```

**用途**：
- **IP 冲突检测**：新主机上线先发 Grat ARP，有人回就表示冲突
- **故障转移**：VRRP/Keepalived 切换时发 Grat ARP，通知交换机更新 MAC 表
- **MAC 更新**：网卡更换后发 Grat ARP 刷新全网缓存

---

### 4. ARP 欺骗原理

ARP 协议没有任何认证机制——谁都可以声称"我是 192.168.1.1"。

```
正常情况：
Host A (192.168.1.10)       Router (192.168.1.1)         Internet
    |     MAC: aa:aa:aa         MAC: rr:rr:rr                |
    |                           |                             |
    |--- 发往外网 → MAC=rr:rr:rr ----------------------→     |

ARP 欺骗攻击（中间人）：
Host A (192.168.1.10)    攻击者 (192.168.1.99)       Router (192.168.1.1)
    |     MAC: aa:aa:aa     MAC: ee:ee:ee            MAC: rr:rr:rr
    |                           |                             |
    |                           |--- 伪造 ARP Reply →         |
    |                           |    Sender IP=192.168.1.1   |
    |←--- 伪造 ARP Reply ------|    Sender MAC=ee:ee:ee      |
    |    Sender IP=192.168.1.1 |                             |
    |    Sender MAC=ee:ee:ee   |                             |
    |                           |                             |
    |--- 发往外网 → MAC=ee:ee:ee                               |
    |    （流量经过攻击者）        |                             |
    |                           |--- 转发 →                  |
    |                           |    （可窃听/篡改）           |
```

- 攻击者只需发送伪造的 ARP Reply，不需要建立连接
- 后果：流量劫持（中间人）、DoS（映射到不存在 MAC）
- **防御**：静态 ARP 绑定 / DAI（Dynamic ARP Inspection）/ 端口安全

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 ARP 用广播 | 不知道目标 MAC 就无法单播，只能广播问"谁是这个 IP" |
| 为什么 ARP 不带认证 | 协议设计于 1982 年（RFC 826），当时以太网是信任环境 |
| 为什么有 ARP 缓存 | 每次通信都广播效率极低（整个子网所有主机都要处理） |
| 为什么主机收到 Request 也更新缓存 | 提前知道发送方 MAC，后续通信省一次广播 |
| 为什么 Gratuitous ARP 不包含 MAC 变更原因 | 协议设计时没考虑场景区分 |
| 为什么 ARP 只能同广播域 | 广播帧不被路由器转发 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| 间歇性断连 | 抓包看到 MAC 地址在变 | `arp -a` 看某 IP 是否对应多个 MAC | ARP 欺骗 / 两台设备配置相同 IP |
| IP 冲突 | 系统日志 "Duplicate IP" | `tcpdump -i eth0 arp` 过滤 Grat ARP | DHCP 地址池重叠 |
| 无法跨子网通信 | 能 ping 同网段不能 ping 网关 | `ip neigh show 192.168.1.1` 看状态 | ARP 超时 / 网关故障 |
| 网络变慢 | 流量经过多余路径 | `arp -a` 看网关 MAC 是否异常 | ARP 欺骗中间人 |
| 新增主机不通 | 其他主机 ARP 表还是旧 MAC | `arp -d <ip>` 清缓存 | 换网卡后旧 MAC 未刷新 |

```bash
# 一键检查
echo "=== ARP 表 ==="
arp -a
echo "=== 邻居表 ==="
ip neigh show
echo "=== ARP 统计 ==="
nstat -az | grep -i arp
```

---

## 常用工具

```bash
# arp —— 管理 ARP 表
arp -a                                                   # 显示所有 ARP 条目
arp -d 192.168.1.1                                       # 删除条目
arp -s 192.168.1.1 aa:bb:cc:00:11:22                     # 静态绑定（防欺骗）

# ip neigh —— 邻居表管理（替代 arp）
ip neigh show                                            # 显示邻居表
ip neigh delete 192.168.1.1 dev eth0                     # 删除条目
ip neigh add 192.168.1.1 lladdr aa:bb:cc:00:11:22 nud permanent dev eth0  # 静态绑定

# tcpdump —— 抓 ARP
tcpdump -i eth0 -nn 'arp'                                # 所有 ARP 报文
tcpdump -i eth0 -nn 'arp[6:2]=1'                          # 只抓 Request (op=1)
tcpdump -i eth0 -nn 'arp[6:2]=2'                          # 只抓 Reply (op=2)
tcpdump -i eth0 -nn 'arp and src host 192.168.1.1'        # 特定源 ARP

# nmap —— ARP 扫描同网段
nmap -sn 192.168.1.0/24                                  # ARP ping 扫描（比 ICMP 快）

# arping —— 专用 ARP ping
arping -I eth0 -c 3 192.168.1.1                          # 检验目标 MAC 是否可达
arping -D -I eth0 192.168.1.10                            # IP 冲突检测（类似 Grat ARP）

# sysctl —— 内核 ARP 参数
sysctl net.ipv4.neigh.default.gc_thresh1                  # 最少保留条目
sysctl net.ipv4.neigh.default.gc_thresh2                  # 软上限
sysctl net.ipv4.neigh.default.gc_thresh3                  # 硬上限
sysctl net.ipv4.neigh.default.base_reachable_time_ms      # REACHABLE 超时（毫秒）
sysctl net.ipv4.conf.all.arp_ignore                       # 忽略特定 ARP 请求
sysctl net.ipv4.conf.all.arp_announce                     # 选择发送哪个 IP 的 ARP

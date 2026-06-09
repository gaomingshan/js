# ICMP 互联网控制报文协议

> 网络层 | 差错报告 | 诊断工具 | 无端口 | 封装于 IP

---

## 报文结构

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Type      |      Code     |          Checksum             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|              ID               |          Sequence Number       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Data (variable)                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| Type | 8bit | 报文类型 |
| Code | 8bit | 同一类型下的细分原因 |
| Checksum | 16bit | 覆盖整个 ICMP 报文 |
| ID | 16bit | 请求方标识（Echo 用） |
| Sequence Number | 16bit | 序号（Echo 用，匹配请求和回复） |

### 常用 Type / Code

| Type | Code | 含义 | 用途 |
|------|------|------|------|
| 0 / 8 | 0 | Echo Reply / Echo Request | ping |
| 3 | 0~15 | Destination Unreachable | 路径不可达细分 |
| 3 | 0 | Network Unreachable | 路由表中无目标网段 |
| 3 | 1 | Host Unreachable | 目标主机不可达 |
| 3 | 2 | Protocol Unreachable | 目标不支持上层协议 |
| 3 | 3 | Port Unreachable | 目标端口未监听 |
| 3 | 4 | Fragmentation Needed (DF=1) | 路径 MTU 发现告警 |
| 5 | 0~3 | Redirect | 路由器告诉主机更好路径 |
| 11 | 0 | Time Exceeded (TTL=0) | traceroute 用 |
| 11 | 1 | Fragment Reassembly Time Exceeded | 分片超时未收齐 |
| 12 | 0~1 | Parameter Problem | IP 头部参数错 |

---

## 核心能力

### 1. Echo Request / Reply —— ping

Ping 是最基本的连通性测试工具。发送 Echo Request，目标回复 Echo Reply，证明网络层双向可达。

```
Client (192.168.1.10)                    Server (8.8.8.8)
          |                                    |
          |--- ICMP Type=8, Code=0           →|
          |    ID=12345, Seq=1                |
          |    Data="abcdefghijklmnop"        |
          |                                    |
          |←--- ICMP Type=0, Code=0          --|
          |    ID=12345, Seq=1                |
          |    Data="abcdefghijklmnop"        |
          |                                    |
          Seq=2, Seq=3 ... 同上                |
          |                                    |
          |  结果：丢包率 0%, RTT min/avg/max |
```

- ID 区分不同 ping 进程，Seq 区分同一进程的先后报文
- 回复必须原样返回 Data 部分（校验内容一致性）
- ping 不通的原因：防火墙过滤 / 路由不回 / 对端不响应
- **ping 通不代表应用层正常**（服务可能挂了但 OS 还在响应）

---

### 2. Destination Unreachable

路由器或目标主机无法交付 IP 报文时，向发送方回 Destination Unreachable，说明为什么到不了。

```
发送端 A                  Router 1              Router 2         目标 B
   |                         |                     |                |
   |--- 发往 10.0.0.5      →|                     |                |
   |    （路由表无 10.0.0.0）|                     |                |
   |←-- ICMP Type=3,Code=0  |                     |                |
   |    "Network Unreachable"                     |                |
   |                         |                     |                |
   |--- 发往 192.168.2.5  →|---- 转发 ----------→|                |
   |    （路由正确）         |                     |                |
   |                         |                     |--- ARP 问 →  |
   |                         |                     |    谁是 192.168.2.5 |
   |                         |                     |    (无人应答)    |
   |                         |←---- ICMP ---------|                |
   |                         |    Type=3,Code=1    |                |
   |                         |    "Host Unreachable"               |
   |                         |                     |                |
   |--- 发往 192.168.2.5:80 |---- 转发 ----------→|---- 到达 ----→|
   |                         |                     |                |
   |                         |                     |←-- TCP RST --| (端口未监听)
```

| Code | 含义 | 典型原因 |
|------|------|---------|
| 0 | Network Unreachable | 路由表中没有目标网段 |
| 1 | Host Unreachable | 目标网段可达但主机无应答（ARP 失败） |
| 2 | Protocol Unreachable | 目标主机不支持上层协议 |
| 3 | Port Unreachable | 传输层端口未监听（UDP 场景） |
| 4 | Frag Needed DF=1 | 路径 MTU 比包小，且 DF=1 不能分片 |

- Type=3, Code=4 是 **PMTUD 关键信号**，发送端收到后应缩小包大小
- **ICMP 差错报文不会为 ICMP 本身产生**（防止递归）

---

### 3. Time Exceeded —— traceroute 原理

traceroute 利用 TTL 机制：从 TTL=1 开始递增，每跳路由器返回 ICMP Time Exceeded，从而发现完整路径。

```
Host A (TTL=1)         Router 1           Router 2          Server B
    |                      |                   |                |
    |--- TTL=1 ----------→|                   |                |
    |                      | TTL=0 → 丢弃      |                |
    |←--- ICMP Type=11 ---|                   |                |
    |      Time Exceeded   |                   |                |
    |      ← Router 1      |                   |                |
    |                      |                   |                |
    |--- TTL=2 ----------→|--- TTL=1 --------→|                |
    |                      |                   | TTL=0 → 丢弃   |
    |                      |←--- ICMP Type=11  |                |
    |←--- Time Exceeded   |    Time Exceeded   |                |
    |      ← Router 2      |                   |                |
    |                      |                   |                |
    |--- TTL=3 ----------→|--- TTL=2 --------→|--- TTL=1 ----→|
    |                      |                   |                |
    |                      |                   |←--- ICMP Type=0 (Echo Reply)
    |                      |                   |    或 Port Unreachable
    |←--- Reply           |                   |                |
```

- Linux `traceroute` 默认用 UDP（高端口，期望回 Port Unreachable）
- Windows `tracert` 默认用 ICMP Echo
- 某跳 `* * *`：该路由器不返回 Time Exceeded（限速或禁 ICMP）

---

### 4. Redirect

主机有两个可选下一跳时，路由器发现"你走隔壁更近"，主动告诉主机改正路由。

```
Host A (网关设为 R1)         R1                    R2           Server B
    |                         |                    |               |
    |--- 发往 B -------------→|                    |               |
    |    (以为 R1 是网关)       |                    |               |
    |                         | R1 看路由：         |               |
    |                         | "到 B 从 R2 走更近" |               |
    |                         |                    |               |
    |←-- ICMP Type=5 --------|                    |               |
    |    Code=1, Gateway=R2   |                    |               |
    |    "以后去 B 别找我，     |                    |               |
    |     找 R2"              |                    |               |
    |                         |                    |               |
    |--- 重新发往 B ---------|---- 转发 ---------→|--- 到达 ----→|
    |    (直接设下一跳 R2)     |                    |               |
```

- Redirect 是路由优化的补充，不是替代配置
- **安全风险**：攻击者可伪造 Redirect 劫持流量（`accept_redirects` 应关闭）

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 ICMP 不封装在 UDP/TCP | ICMP 是网络层控制协议，应该和 IP 直接交互，不走传输层 |
| 为什么 ICMP 没有端口 | 端口用于标识传输层应用，ICMP 不是传输层 |
| 为什么差错报文不能响应 ICMP | 防止无限递归（差错→再差错→再差错） |
| 为什么 ping 必须使用 raw socket | ICMP 在内核中构建，普通 socket 无法操作 IP 层协议 |
| 为什么 traceroute 不同 OS 不同默认方式 | Linux UDP 避免防火墙干扰，Windows ICMP 更直观 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| ping 超时 | `ping` 100% loss | `tcpdump -i eth0 icmp` 看请求是否发出、回复是否收到 | 防火墙禁 ping / 路由不回 |
| ping 不通但业务正常 | ping 超时但 TCP 连接能建 | `curl -v http://x.x/` 测试传输层 | 禁 ping 不意味着服务不可达 |
| Destination Unreachable | ping 返回 "Destination Host Unreachable" | `ip route get <target>` 看路由 | 缺路由 / ARP 失败 |
| Frag Needed (DF=1) | 大包不通小包通 | `ping -M do -s 1472` 逐步减到不报错 | 路径 MTU 小于期望值 |
| traceroute 中间跳 `* * *` | 某跳不显示 | 等超时或换 TCP 模式 `-T -p 80` | 路由器限速 ICMP / 策略丢弃 |
| traceroute 环路 | 跳数反复重复 | 检查路由表 | 路由配置错误 |
| ICMP Redirect 异常 | 抓包大量 Redirect | `sysctl net.ipv4.conf.all.accept_redirects` 关闭 | 网络攻击或错误路由通告 |

```bash
# 一键检查
echo "=== ICMP 可达性 ==="
ping -c 3 -W 2 8.8.8.8
echo "=== 路径 ==="
traceroute -n -q 1 -w 2 8.8.8.8
echo "=== ICMP 统计 ==="
nstat -az | grep -i icmp
```

---

## 常用工具

```bash
# ping —— 基本可达性 + 性能
ping -c 4 8.8.8.8                                         # 基本测试
ping -c 4 -s 1472 -M do 8.8.8.8                           # 路径 MTU 探测
ping -c 4 -i 0.1 -q 8.8.8.8                               # 快速 ping 只看统计

# traceroute —— 每跳时延 + 路径
traceroute -n -q 1 -w 2 8.8.8.8                            # UDP 模式（Linux 默认）
traceroute -I -n 8.8.8.8                                   # ICMP 模式
traceroute -T -n -p 443 8.8.8.8                            # TCP 模式（穿透防火墙）
mtr -n 8.8.8.8                                             # 持续 traceroute + ping

# tcpdump —— 抓 ICMP
tcpdump -i eth0 -nn icmp                                   # 所有 ICMP
tcpdump -i eth0 -nn 'icmp[icmptype]=8'                      # 只抓 Echo Request
tcpdump -i eth0 -nn 'icmp[icmptype]=3 and icmp[icmptype]=4' # Frag Needed
tcpdump -i eth0 -nn 'icmp[icmptype]=11'                     # Time Exceeded

# sysctl —— 内核参数
sysctl net.ipv4.icmp_echo_ignore_all                       # 忽略所有 ping（默认 0）
sysctl net.ipv4.icmp_echo_ignore_broadcasts                 # 忽略广播 ping（默认 1）
sysctl net.ipv4.conf.all.accept_redirects                   # ICMP Redirect（默认 1）
sysctl net.ipv4.conf.all.secure_redirects                   # 只接受转发自网关的 Redirect

# nstat —— ICMP 统计
nstat -az | grep -i icmp

# 第 3 章：ARP 协议

> **学习目标**：理解 ARP 的地址解析机制，掌握 ARP 报文结构与缓存管理  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

### 1.1 ARP 概述

ARP（Address Resolution Protocol）将网络层的 IP 地址映射为链路层的 MAC 地址。在以太网中，数据帧必须使用 MAC 地址寻址，因此发送端必须知道目的 IP 对应的 MAC 地址。

**ARP 的核心作用**：
- 解决 IP 地址到 MAC 地址的映射问题
- 仅在同一个广播域（子网）内工作
- 跨子网通信时，ARP 解析的是网关的 MAC 地址

```
通信流程：
发送端知道目标 IP：192.168.1.100
      ↓
ARP 解析：192.168.1.100 → MAC: aa:bb:cc:dd:ee:ff
      ↓
以太网帧使用目标 MAC 地址发送
```

### 1.2 ARP 解析流程

```
发送端（192.168.1.10）要发送数据给 192.168.1.100：

1. 查询 ARP 缓存 → 未命中
2. 发送 ARP Request（广播）：
   "Who has 192.168.1.100? Tell 192.168.1.10"
3. 所有同网段主机收到广播
4. 192.168.1.100 回复 ARP Reply（单播）：
   "192.168.1.100 is at aa:bb:cc:dd:ee:ff"
5. 发送端缓存 IP-MAC 映射
6. 使用目标 MAC 地址发送数据帧
```

---

## 2. 报文结构

### 2.1 ARP 报文格式

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Hardware Type          |         Protocol Type        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| HW Addr Len  | Proto Addr Len|          Operation           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                   Sender Hardware Address                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                   Sender Protocol Address                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                   Target Hardware Address                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                   Target Protocol Address                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.2 字段详解

| 字段 | 长度 | 含义 |
|------|------|------|
| **Hardware Type** | 16 bit | 硬件地址类型，以太网 = 1 |
| **Protocol Type** | 16 bit | 协议地址类型，IPv4 = 0x0800 |
| **HW Addr Len** | 8 bit | 硬件地址长度，MAC = 6 |
| **Proto Addr Len** | 8 bit | 协议地址长度，IPv4 = 4 |
| **Operation** | 16 bit | 操作类型：1=Request, 2=Reply |
| **Sender HW Addr** | 48 bit | 发送端 MAC 地址 |
| **Sender Proto Addr** | 32 bit | 发送端 IP 地址 |
| **Target HW Addr** | 48 bit | 目标 MAC 地址（请求时为 0） |
| **Target Proto Addr** | 32 bit | 目标 IP 地址 |

**关键点**：
- ARP Request 中 Target HW Addr 为 0（因为未知，正是要解析的）
- ARP Request 以广播发送（目标 MAC = ff:ff:ff:ff:ff:ff）
- ARP Reply 以单播发送（目标 MAC = 请求端 MAC）
- ARP 报文直接封装在以太网帧中，EtherType = 0x0806

---

## 3. 具体能力

### 3.1 ARP 缓存

ARP 解析结果缓存在本地，避免重复广播：

```
$ arp -a
? (192.168.1.1)   at aa:bb:cc:dd:ee:01  on eth0
? (192.168.1.100) at aa:bb:cc:dd:ee:ff  on eth0
```

**缓存特性**：
- 动态条目有生存时间（通常 20-60 秒，各系统不同）
- 静态条目永久有效，直到手动删除
- 收到 ARP Reply 时更新缓存（即使未发送请求）

### 3.2 Gratuitous ARP（免费 ARP）

主机主动广播自己的 IP-MAC 映射，无需被请求：

**用途**：
1. **IP 冲突检测**：启动时广播，若无 ARP Reply 则说明 IP 未被占用
2. **MAC 地址变更通知**：网卡替换后通知其他主机更新缓存
3. **高可用切换**：VIP 漂移后广播新 MAC 地址

```
Gratuitous ARP Request：
Sender IP = Target IP = 自己的 IP
Sender MAC = 自己的 MAC
Target MAC = 00:00:00:00:00:00
```

### 3.3 Proxy ARP（代理 ARP）

路由器代替目标主机应答 ARP 请求：

```
主机 A (192.168.1.10) → ARP Request: Who has 10.0.0.100?
路由器 (连接两个子网) → ARP Reply: 10.0.0.100 is at 路由器MAC
主机 A → 将数据发给路由器MAC，路由器转发
```

**应用场景**：当主机配置的子网掩码不正确，但路由器通过代理 ARP 仍能使其通信。

### 3.4 ARP 欺骗（ARP Spoofing）

攻击者发送伪造的 ARP Reply，将目标 IP 映射到攻击者的 MAC：

```
正常：192.168.1.1 → 网关 MAC (aa:bb:cc:dd:ee:01)
攻击：192.168.1.1 → 攻击者 MAC (ff:ff:ff:ff:ff:ff)
```

**后果**：受害者将发往网关的流量发给攻击者，实现中间人攻击。

**防御措施**：
- 静态 ARP 绑定
- DAI（Dynamic ARP Inspection）
- 端口安全（限制 MAC 地址数）

---

## 4. 报文样例

### 4.1 ARP Request（广播）

```
00 01 08 00  06 04 00 01  aa bb cc dd ee 0a  c0 a8 01 0a
00 00 00 00  00 00  c0 a8 01 64
```

**逐字段解析**：

```
00 01        → Hardware Type=1 (Ethernet)
08 00        → Protocol Type=0x0800 (IPv4)
06           → HW Addr Len=6 (MAC 地址长度)
04           → Proto Addr Len=4 (IPv4 地址长度)
00 01        → Operation=1 (Request)
aa bb cc dd ee 0a → Sender MAC=aa:bb:cc:dd:ee:0a
c0 a8 01 0a  → Sender IP=192.168.1.10
00 00 00 00 00 00 → Target MAC=00:00:00:00:00:00 (未知)
c0 a8 01 64  → Target IP=192.168.1.100
```

### 4.2 ARP Reply（单播）

```
00 01 08 00  06 04 00 02  aa bb cc dd ee 64  c0 a8 01 64
aa bb cc dd ee 0a  c0 a8 01 0a
```

**逐字段解析**：

```
00 01        → Hardware Type=1 (Ethernet)
08 00        → Protocol Type=0x0800 (IPv4)
06           → HW Addr Len=6
04           → Proto Addr Len=4
00 02        → Operation=2 (Reply)
aa bb cc dd ee 64 → Sender MAC=aa:bb:cc:dd:ee:64 (被解析的 MAC)
c0 a8 01 64  → Sender IP=192.168.1.100
aa bb cc dd ee 0a → Target MAC=aa:bb:cc:dd:ee:0a (请求端 MAC)
c0 a8 01 0a  → Target IP=192.168.1.10
```

---

## 5. 深入一点

### ARP 与 IPv6

IPv6 不使用 ARP，而是使用 ICMPv6 邻居发现协议（NDP, Neighbor Discovery Protocol）：

| 功能 | IPv4 | IPv6 |
|------|------|------|
| 地址解析 | ARP | NDP (NS/NA) |
| 重复地址检测 | Gratuitous ARP | DAD (NS) |
| 路由发现 | ICMP Redirect | NDP (RS/RA) |
| 报文封装 | 以太网帧 (0x0806) | ICMPv6 (Type 135/136) |

NDP 使用多播代替广播，效率更高：目标地址最后 24 bit 映射到多播 MAC `33:33:ff:xx:xx:xx`。

### ARP 缓存污染的利用

ARP 缓存"收到 Reply 就更新"的特性（即使未发 Request）是 ARP 欺骗的根本原因。这种设计是为了支持 Gratuitous ARP，但也带来了安全隐患。

---

## 参考资料

- [RFC 826 - Address Resolution Protocol](https://datatracker.ietf.org/doc/html/rfc826)
- [RFC 5227 - IPv4 Address Conflict Detection](https://datatracker.ietf.org/doc/html/rfc5227)
- [RFC 4861 - Neighbor Discovery for IPv6](https://datatracker.ietf.org/doc/html/rfc4861)

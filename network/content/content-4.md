# 第 4 章：TCP 协议

> **学习目标**：深入理解 TCP 的可靠传输机制，掌握三次握手、四次挥手、滑动窗口、拥塞控制等核心能力  
> **预计时长**：6 小时  
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心概念

### 1.1 TCP 概述

TCP（Transmission Control Protocol）是面向连接的、可靠的字节流传输协议。它在不可靠的 IP 网络之上构建了可靠传输服务，是互联网应用最广泛的传输层协议。

**TCP 的核心特性**：
- **面向连接**：通信前必须建立连接（三次握手）
- **可靠传输**：确认、重传、排序、去重
- **字节流**：无消息边界，应用层需自行界定
- **全双工**：双方可同时发送和接收
- **流量控制**：滑动窗口防止接收方被淹没
- **拥塞控制**：防止网络过载

```
TCP 在协议栈中的位置：
┌───────────────────────────┐
│       应用层（HTTP等）     │
├───────────────────────────┤
│  ──→ TCP 协议（传输层） ←── │  ← 本章
├───────────────────────────┤
│       IP 协议（网络层）    │
├───────────────────────────┤
│       链路层               │
└───────────────────────────┘
```

---

## 2. 报文结构

### 2.1 TCP 头部格式

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |           |U|A|P|R|S|F|                               |
| Offset| Reserved  |R|C|S|S|Y|I|            Window             |
|       |           |G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Checksum              |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |    Padding    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.2 字段详解

| 字段 | 长度 | 含义 |
|------|------|------|
| **Source Port** | 16 bit | 源端口号 |
| **Destination Port** | 16 bit | 目的端口号 |
| **Sequence Number** | 32 bit | 序列号，标识发送数据字节流位置 |
| **Acknowledgment Number** | 32 bit | 确认号，期望收到的下一个序列号 |
| **Data Offset** | 4 bit | 头部长度，单位 4 字节，最小 5（20字节） |
| **Reserved** | 6 bit | 保留（部分已重定义） |
| **Flags** | 6 bit | 控制标志位 |
| **Window** | 16 bit | 接收窗口大小（流量控制） |
| **Checksum** | 16 bit | 校验和（覆盖头部+数据+伪头部） |
| **Urgent Pointer** | 16 bit | 紧急数据偏移（URG=1 时有效） |
| **Options** | 可变 | 可选参数 |

### 2.3 标志位详解

| 标志 | 含义 | 说明 |
|------|------|------|
| **URG** | 紧急指针有效 | 紧急数据，带外传输 |
| **ACK** | 确认号有效 | 建立连接后始终为 1 |
| **PSH** | 推送 | 接收端应尽快交付给应用 |
| **RST** | 重置连接 | 异常断开连接 |
| **SYN** | 同步序列号 | 建立连接时使用 |
| **FIN** | 结束连接 | 释放连接时使用 |

### 2.4 常用 TCP 选项

| 选项 | 类型 | 长度 | 用途 |
|------|------|------|------|
| **MSS** | 2 | 4 | 最大段大小，协商时可接收的最大数据量 |
| **Window Scale** | 3 | 3 | 窗口扩大因子，扩展 Window 到 32 bit |
| **SACK Permitted** | 4 | 2 | 允许选择性确认 |
| **SACK** | 5 | 可变 | 选择性确认的具体块信息 |
| **Timestamps** | 8 | 10 | 时间戳（RTT 测量 + PAWS） |

---

## 3. 具体能力

### 3.1 三次握手（连接建立）

```
客户端                              服务器
  |                                   |
  |  ──── SYN, Seq=x ────→           |  (1) 客户端发送 SYN
  |                                   |
  |  ←── SYN+ACK, Seq=y, Ack=x+1 ──  |  (2) 服务器回复 SYN+ACK
  |                                   |
  |  ──── ACK, Seq=x+1, Ack=y+1 ──→  |  (3) 客户端确认
  |                                   |
  |        连接建立，开始传输数据       |
```

**为什么需要三次**：
- 防止历史连接（已失效的 SYN）导致服务器误建连接
- 第三次 ACK 让服务器确认客户端的接收能力正常
- 双方都确认了对方的初始序列号（ISN）

**ISN（初始序列号）**：
- 不是从 0 或 1 开始，而是基于时钟的伪随机数
- 防止历史报文干扰新连接
- ISN 生成算法：`ISN = M + H(源IP, 源端口, 目的IP, 目的端口, 密钥)`

### 3.2 四次挥手（连接释放）

```
主动关闭方                          被动关闭方
  |                                   |
  |  ──── FIN, Seq=u ────→           |  (1) 主动方发送 FIN
  |                                   |  被动方进入 CLOSE_WAIT
  |  ←── ACK, Seq=v, Ack=u+1 ────    |  (2) 被动方确认
  |                                   |
  |       （被动方可能还有数据发送）    |
  |                                   |
  |  ←── FIN, Seq=w, Ack=u+1 ────    |  (3) 被动方发送 FIN
  |                                   |  被动方进入 LAST_ACK
  |  ──── ACK, Seq=u+1, Ack=w+1 ──→  |  (4) 主动方确认
  |                                   |
  |  主动方进入 TIME_WAIT (2MSL)      |  被动方进入 CLOSED
  |                                   |
  |  主动方进入 CLOSED                |
```

**TIME_WAIT 状态（2MSL）**：
- MSL（Maximum Segment Lifetime）= 报文最大生存时间，通常 30s-2min
- 等待 2MSL 的原因：
  1. 确保最后的 ACK 能到达被动方（若丢失，被动方会重发 FIN）
  2. 等待本连接的所有报文在网络中消失，避免影响新连接

**为什么需要四次**：
- TCP 全双工，每个方向需要单独关闭
- 被动方收到 FIN 后可能还有数据要发，不能立即关闭

### 3.3 TCP 状态机

```
                              LISTEN
                                |
                          SYN rcvd /
                                v
    CLOSED ── SYN sent ── SYN_SENT
                                |
                          SYN+ACK rcvd /
                                v
                           ESTABLISHED
                              /     \
                    FIN sent /       \ FIN rcvd
                            v         v
                     FIN_WAIT_1    CLOSE_WAIT
                            |          |
                     ACK rcvd/    FIN sent/
                            v          v
                     FIN_WAIT_2    LAST_ACK
                            |          |
                     FIN rcvd/    ACK rcvd/
                            v          v
                     TIME_WAIT ──2MSL──→ CLOSED
                            |
                       timeout/
                            v
                          CLOSED
```

### 3.4 滑动窗口协议（流量控制）

滑动窗口实现流量控制，防止发送方淹没接收方：

```
发送方窗口：
┌──────────────────────────────────────────────────┐
│  1  2  3  4  5  │  6  7  8  9  10  │ 11 12 13 14│
│  已确认          │  已发送未确认     │ 可发送      │
└──────────────────────────────────────────────────┘
                   ←──── 窗口大小 = 5 ────→

接收方通告窗口：
接收方通过 ACK 中的 Window 字段告知发送方自己的可用缓冲区大小
```

**窗口调整机制**：
- **窗口扩大**：接收方处理完数据后，通告更大的 Window
- **窗口缩小**：接收方缓冲区紧张时，通告更小的 Window
- **零窗口**：Window=0 时，发送方停止发送，启动持续计时器（Persist Timer）
- **零窗口探测**：发送方定期发送 1 字节探测报文，检测窗口是否恢复

### 3.5 拥塞控制

拥塞控制防止过多数据注入网络，是 TCP 最重要的算法之一。

**四个核心算法**：

#### 3.5.1 慢启动（Slow Start）

```
cwnd 初始值 = 1 MSS (约 1460 字节)
每收到一个 ACK，cwnd += 1 MSS
→ 每个 RTT，cwnd 翻倍（指数增长）

cwnd: 1 → 2 → 4 → 8 → 16 → ... → ssthresh
```

#### 3.5.2 拥塞避免（Congestion Avoidance）

```
当 cwnd >= ssthresh 时，进入拥塞避免
每个 RTT，cwnd += 1 MSS（线性增长）

cwnd: ssthresh → ssthresh+1 → ssthresh+2 → ...
```

#### 3.5.3 快重传（Fast Retransmit）

```
收到 3 个重复 ACK → 立即重传丢失的报文段
无需等待超时定时器

发送: 1  2  3  4  5  6  7  8
接收: 1  2  3  (4丢失) 5→ACK3  6→ACK3  7→ACK3
                              ↑3个重复ACK → 重传4
```

#### 3.5.4 快恢复（Fast Recovery）

```
快重传后不执行慢启动（cwnd 不降到 1），而是：
1. ssthresh = cwnd / 2
2. cwnd = ssthresh + 3 MSS（3 个重复 ACK 已离开网络）
3. 每收到一个重复 ACK，cwnd += 1 MSS
4. 收到新 ACK，cwnd = ssthresh，进入拥塞避免
```

**拥塞控制状态转换**：

```
                    超时
          ┌─────────────────────┐
          v                     │
     慢启动 ──cwnd≥ssthresh──→ 拥塞避免
          ^                     │
          │                     │ 3个重复ACK
          │                     v
          │              快重传 + 快恢复
          │                     │
          └───── 超时 ─────────┘
          
超时: ssthresh=cwnd/2, cwnd=1, 进入慢启动
3重复ACK: ssthresh=cwnd/2, cwnd=ssthresh+3, 进入快恢复
```

### 3.6 超时重传与 RTT 估算

TCP 为每个报文段设置重传定时器（RTO），超时未确认则重传。

**RTT 估算（Jacobson/Karels 算法）**：

```
SRTT = (1 - α) × SRTT + α × RTT_sample    (α = 1/8)
RTTVAR = (1 - β) × RTTVAR + β × |SRTT - RTT_sample|  (β = 1/4)
RTO = SRTT + 4 × RTTVAR
```

**Karn 算法**：不使用重传报文的 RTT 样本，避免歧义。使用 Timestamps 选项可解决此问题。

### 3.7 Nagle 算法与延迟 ACK

**Nagle 算法**：减少小报文数量
```
规则：只有收到前一个数据的 ACK 后，才能发送新的小报文
例外：可以攒够一个 MSS 再发
```

**延迟 ACK**：减少 ACK 数量
```
规则：
1. 收到数据后不立即 ACK，等待最多 200-500ms
2. 如果在此期间有数据要发，捎带 ACK
3. 如果收到两个连续报文段，立即发送 ACK
```

**交互问题**：Nagle + 延迟 ACK 可能导致 40ms 延迟（Nagle 等待 ACK，ACK 延迟发送）。解决方案：设置 `TCP_NODELAY` 禁用 Nagle。

---

## 4. 报文样例

### 4.1 三次握手报文

**第一次握手（SYN）**：

```
00 50 56 c0 00 01 00 0c 29 1e 8e 7a 08 00
45 00 00 3c  00 00 40 00  40 06 3c 9a  c0 a8 01 0a  c0 a8 01 01
d0 58 00 50  a6 2c 00 00  00 00 00 00  a0 02 ff ff  fe 34 00 00
02 04 05 b4  04 02 08 0a  02 1c 9b 3c  00 00 00 00  01 03 03 05
```

**TCP 头部解析**：

```
d0 58       → Source Port=53336
00 50       → Destination Port=80 (HTTP)
a6 2c 00 00 → Sequence Number=0 (相对值)
00 00 00 00 → Acknowledgment Number=0 (SYN 不含 ACK)
a0          → Data Offset=10 (40 字节头部), Reserved=0
02          → Flags=000010 (SYN=1)
ff ff       → Window=65535
fe 34       → Checksum
00 00       → Urgent Pointer=0
--- 选项 ---
02 04 05 b4 → MSS=1460
04 02       → SACK Permitted
08 0a ...   → Timestamps
01 03 03 05 → Window Scale=5 (窗口扩大 2^5=32 倍)
```

**第二次握手（SYN+ACK）**：

```
d0 58 00 50  00 00 00 00  a6 2c 00 01  a0 12 ff ff  ...
```

```
d0 58       → Source Port=80
00 50       → Destination Port=53336
00 00 00 00 → Sequence Number=0
a6 2c 00 01 → Acknowledgment Number=1 (确认客户端 SYN)
a0          → Data Offset=10
12          → Flags=010010 (SYN=1, ACK=1)
ff ff       → Window=65535
```

**第三次握手（ACK）**：

```
d0 58 00 50  a6 2c 00 01  00 00 00 01  50 10 ff ff  ...
```

```
a6 2c 00 01 → Sequence Number=1
00 00 00 01 → Acknowledgment Number=1 (确认服务器 SYN)
50          → Data Offset=5 (20 字节头部)
10          → Flags=010000 (ACK=1)
ff ff       → Window=65535
```

### 4.2 数据传输报文

```
d0 58 00 50  a6 2c 00 01  00 00 00 01  50 18 ff ff  fd 23 00 00
47 45 54 20  2f 20 48 54  54 50 2f 31  2e 31 0d 0a  ...
```

```
a6 2c 00 01 → Seq=1
00 00 00 01 → Ack=1
50          → Data Offset=5
18          → Flags=011000 (PSH=1, ACK=1)
ff ff       → Window=65535
--- 数据 ---
47 45 54 20 → "GET "
2f 20 48 54 → "/ HT"
54 50 2f 31 → "TP/1"
2e 31 0d 0a → ".1\r\n"
```

### 4.3 四次挥手报文

**第一次 FIN**：

```
d0 58 00 50  a6 2c 01 0a  00 00 02 00  50 11 ff ff  ...
```

```
a6 2c 01 0a → Seq=266
00 00 02 00 → Ack=512
50          → Data Offset=5
11          → Flags=000001 (FIN=1, ACK=1)
```

---

## 5. 深入一点

### TCP 连接的标识

TCP 连接由四元组唯一标识：`{源IP, 源端口, 目的IP, 目的端口}`。一个 IP 地址 + 端口可以同时维持多个连接，只要四元组不同。

### SYN Flood 攻击

攻击者发送大量伪造源地址的 SYN，服务器为每个 SYN 分配资源（SYN_RECV 状态），导致资源耗尽：

**防御措施**：
- **SYN Cookie**：不分配资源，将 ISN 编码连接信息，收到 ACK 时再验证重建
- **SYN Proxy**：防火墙代为完成三次握手
- **限制半连接数**

### TIME_WAIT 过多

高并发短连接场景下，主动关闭方积累大量 TIME_WAIT 状态：

**解决方案**：
- 使用长连接（Keep-Alive）
- 设置 `SO_REUSEADDR` / `SO_REUSEPORT`
- 由客户端主动关闭改为服务端主动关闭
- 调整 `tcp_tw_reuse`（Linux）

---

## 参考资料

- [RFC 793 - Transmission Control Protocol](https://datatracker.ietf.org/doc/html/rfc793)
- [RFC 1122 - Requirements for Internet Hosts](https://datatracker.ietf.org/doc/html/rfc1122)
- [RFC 2581 - TCP Congestion Control](https://datatracker.ietf.org/doc/html/rfc2581)
- [RFC 6298 - TCP Retransmission Timer](https://datatracker.ietf.org/doc/html/rfc6298)
- [RFC 7323 - TCP Extensions (Window Scale/Timestamps)](https://datatracker.ietf.org/doc/html/rfc7323)
- [RFC 2018 - TCP Selective Acknowledgment Options](https://datatracker.ietf.org/doc/html/rfc2018)

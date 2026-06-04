# 第 10 章：HTTP/3 与 QUIC 协议

> **学习目标**：理解基于 UDP 的 QUIC 传输协议与 HTTP/3 的设计改进
> **预计时长**：3 小时
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心概念

### 1.1 HTTP/3 概述

HTTP/3 是 HTTP 的第三个主要版本，底层传输协议从 TCP 换为 QUIC（基于 UDP）。核心目标是解决 HTTP/2 遗留的 TCP 层队头阻塞问题。

**HTTP/3 解决的核心问题**：

| 问题 | HTTP/2 (TCP) | HTTP/3 (QUIC) |
|------|-------------|---------------|
| TCP 队头阻塞 | 一个包丢失阻塞所有流 | 各流独立，仅阻塞受影响的流 |
| 握手延迟 | TCP 1-RTT + TLS 1-RTT = 2-RTT | QUIC 合并握手，1-RTT（0-RTT 恢复） |
| 连接迁移 | IP/端口变化需重建 TCP | Connection ID 标识连接，无缝迁移 |
| TLS 集成 | TLS 在 TCP 之上独立层 | TLS 1.3 内置于 QUIC |

---

## 2. 报文结构

### 2.1 QUIC 包格式

QUIC 包分为长头部包和短头部包：

**长头部包（握手阶段）**：

```
 0                   1                   2                   3
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|1|   Type (7)  |            Version             |             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    DCID Len (8)   |      Destination CID      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    SCID Len (8)   |       Source CID           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Token Length          |   Token       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Length              |   Packet Number|
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          Payload                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**短头部包（数据传输阶段）**：

```
 0                   1                   2                   3
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|0|1|   Type (6)  |          Destination CID (variable)        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    Packet Number (variable)   |                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               +
|                          Payload                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.2 字段详解

| 字段 | 长度 | 含义 |
|------|------|------|
| **First bit** | 1 bit | 1=长头部, 0=短头部 |
| **Form bit** | 1 bit | 固定为 1（短头部中） |
| **Type** | 6-7 bit | 包类型 |
| **Version** | 32 bit | QUIC 版本 |
| **DCID** | 可变 | 目的连接 ID |
| **SCID** | 可变 | 源连接 ID |
| **Token** | 可变 | 重试令牌（防重放攻击） |
| **Packet Number** | 可变 | 包序号（1-4 字节） |

### 2.3 QUIC 帧类型

| 帧类型 | 值 | 说明 |
|--------|-----|------|
| PADDING | 0x00 | 填充 |
| PING | 0x01 | 保活 |
| ACK | 0x02-0x03 | 确认 |
| RESET_STREAM | 0x04 | 终止流 |
| STOP_SENDING | 0x05 | 停止发送 |
| CRYPTO | 0x06 | 加密握手数据 |
| NEW_TOKEN | 0x07 | 新令牌 |
| STREAM | 0x08-0x0f | 流数据（含 FIN/LEN 等标志位） |
| MAX_DATA | 0x10 | 连接级流量控制 |
| MAX_STREAM_DATA | 0x11 | 流级流量控制 |
| PATH_CHALLENGE | 0x1a | 路径验证 |
| PATH_RESPONSE | 0x1b | 路径验证响应 |
| CONNECTION_CLOSE | 0x1c-0x1d | 关闭连接 |

---

## 3. 具体能力

### 3.1 0-RTT 连接建立

QUIC 将传输握手和加密握手合并：

**首次连接（1-RTT）**：

```
客户端                                    服务器

  ──── ClientHello (QUIC CRYPTO帧) ────→     RTT 1
  ←─── ServerHello + Certificate + Finished ─────
  ──── Finished ────→
        应用数据加密传输
```

**恢复连接（0-RTT）**：

```
客户端                                    服务器

  ──── ClientHello + 0-RTT 应用数据 ────→   0-RTT!
  ←─── ServerHello + 应用数据 ─────
```

0-RTT 使用之前协商的 PSK（Pre-Shared Key），在第一个包就携带应用数据。

### 3.2 无队头阻塞的多路复用

```
HTTP/2 over TCP:
Stream1: [帧1] [帧2] [丢包!] [等待...] [帧3]
Stream2: [帧1] [等待TCP重传...] [帧2]  ← 被Stream1阻塞!
Stream3: [帧1] [等待...] [帧2]         ← 也被阻塞!

HTTP/3 over QUIC:
Stream1: [帧1] [帧2] [丢包!] [等待重传] [帧3]
Stream2: [帧1] [帧2] [帧3]              ← 不受影响!
Stream3: [帧1] [帧2] [帧3]              ← 不受影响!
```

QUIC 中每个流独立确认和重传，一个流的丢包不影响其他流。

### 3.3 连接迁移

TCP 连接由四元组标识（源IP+源端口+目的IP+目的端口），网络切换时连接断开。

QUIC 使用 Connection ID 标识连接：

```
WiFi: 客户端 IP=10.0.0.1, CID=0x1234 → 服务器
  ↓ 切换到 4G
4G:   客户端 IP=100.64.0.1, CID=0x1234 → 服务器 (同一连接!)
```

**PATH_CHALLENGE/RESPONSE** 机制验证新路径的可达性和 MTU。

### 3.4 内置 TLS 1.3

QUIC 将 TLS 1.3 深度集成：
- 握手消息通过 CRYPTO 帧传输
- 所有应用数据始终加密（无明文传输）
- 0-RTT 基于 TLS 1.3 PSK
- QUIC 负责可靠传输，TLS 仅负责密钥协商

### 3.5 QUIC 流量控制

两级流量控制：
- **连接级**：MAX_DATA 帧限制总接收数据量
- **流级**：MAX_STREAM_DATA 帧限制每个流的接收量

自动调节窗口大小（类似 TCP BBR 算法思路）。

---

## 4. 报文样例

### 4.1 QUIC Initial 包（ClientHello）

```
c0 00 00 00 01  08 01 23 45 67 89 ab cd
04 12 34 56 78
00 41 00 00
06 00 41 00
01 00 00 47 0b  03 03 ...
```

**逐字段解析**：

```
c0          → 首位=1(长头部), Form=1, Type=0 (Initial)
00 00 00 01 → Version=1 (QUIC v1)
08          → DCID Len=8
01 23 45 67 89 ab cd → Destination CID
04          → SCID Len=4
12 34 56 78 → Source CID
00          → Token Length=0
41 00 00    → Length=1024
--- CRYPTO 帧 ---
06          → Frame Type=6 (CRYPTO)
00 41 00    → Offset=0, Length=...
01 00 00 47 → TLS ClientHello 开始
0b 03 03    → TLS Version=TLS 1.2 (兼容性)
```

### 4.2 QUIC Short Header 包（数据传输）

```
40 01 23 45 67 89 ab cd
01
08 00 01  68 65 6c 6c 6f
```

**逐字段解析**：

```
40          → 首位=0(短头部), Form=1, Type=0
01 23 45 67 89 ab cd → Destination CID (8字节)
01          → Packet Number=1
--- STREAM 帧 ---
08          → Frame Type=0x08 (STREAM, StreamID=0)
00 01       → Stream ID=1
68 65 6c 6c 6f → "hello"
```

---

## 5. 深入一点

### QUIC 与内核

QUIC 运行在用户态（基于 UDP socket），而 TCP 在内核态。这意味着：
- **优势**：快速迭代，无需操作系统更新
- **劣势**：用户态收发有额外上下文切换开销
- **优化**：GSO/GRO（Generic Segmentation/Receive Offload）减少系统调用

### QUIC 丢包检测

QUIC 使用基于包序号的 ACK，比 TCP 的 ACK 更精确：
- 所有包序号单调递增（不像 TCP 序列号是字节偏移）
- ACK 包含已收到的包序号范围
- 支持更精确的 RTT 测量

### HTTP/3 QPACK

HTTP/3 使用 QPACK 替代 HPACK 进行头部压缩：
- 解决 HPACK 在 QUIC 上的队头阻塞问题
- 使用独立的编码/解码流传输动态表更新
- 静态表扩展到 99 个条目

---

## 参考资料

- [RFC 9000 - QUIC: A UDP-Based Multiplexed and Secure Transport](https://datatracker.ietf.org/doc/html/rfc9000)
- [RFC 9114 - HTTP/3](https://datatracker.ietf.org/doc/html/rfc9114)
- [RFC 9001 - Using TLS to Secure QUIC](https://datatracker.ietf.org/doc/html/rfc9001)
- [RFC 9204 - QPACK: Field Compression for HTTP/3](https://datatracker.ietf.org/doc/html/rfc9204)

# 第 9 章：HTTP/2 协议

> **学习目标**：理解 HTTP/2 的二进制分帧、多路复用、头部压缩等核心改进
> **预计时长**：3 小时
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心概念

### 1.1 HTTP/2 概述

HTTP/2 是 HTTP/1.1 的性能优化升级，保持语义不变（方法、状态码、头部含义相同），但改变了数据格式化和传输方式。

**HTTP/2 vs HTTP/1.1 核心差异**：

| 特性 | HTTP/1.1 | HTTP/2 |
|------|----------|--------|
| 数据格式 | 文本 | 二进制 |
| 传输单位 | 报文（Message） | 帧（Frame） |
| 多路复用 | ❌（队头阻塞） | ✅（流并行） |
| 头部压缩 | ❌ | ✅（HPACK） |
| 服务端推送 | ❌ | ✅（Push） |
| 流优先级 | ❌ | ✅ |
| 连接复用 | 6 个并行连接 | 1 个连接多路复用 |

---

## 2. 报文结构

### 2.1 帧格式（Frame）

HTTP/2 最小通信单位是帧，所有帧共享 9 字节头部：

```
+-+-+-+-+-+-+-+-+                                               +
|   Length (24)  |   Type (8)    |   Flags (8)  |
+-+-+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|R|                 Stream Identifier (31)       |
+=+================================================+
|                   Frame Payload (0...)           |
+================================================+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| **Length** | 24 bit | 载荷长度（最大 2^24-1 = 16MB） |
| **Type** | 8 bit | 帧类型 |
| **Flags** | 8 bit | 帧标志（各类型不同） |
| **R** | 1 bit | 保留位 |
| **Stream Identifier** | 31 bit | 流标识（0 为连接级） |

### 2.2 帧类型

| Type | 值 | 说明 |
|------|-----|------|
| DATA | 0 | 传输数据 |
| HEADERS | 1 | 请求/响应头部 |
| PRIORITY | 2 | 流优先级 |
| RST_STREAM | 3 | 终止流 |
| SETTINGS | 4 | 连接配置 |
| PUSH_PROMISE | 5 | 服务端推送 |
| PING | 6 | 保活/RTT 测量 |
| GOAWAY | 7 | 关闭连接 |
| WINDOW_UPDATE | 8 | 流量控制 |
| CONTINUATION | 9 | 头部续帧 |

### 2.3 流（Stream）、消息（Message）、帧（Frame）

```
一个 TCP 连接
├── Stream 1 (请求/响应)
│   ├── HEADERS 帧
│   ├── DATA 帧
│   └── DATA 帧
├── Stream 3 (请求/响应，并行)
│   ├── HEADERS 帧
│   └── DATA 帧
├── Stream 5 (服务端推送)
│   ├── PUSH_PROMISE 帧
│   ├── HEADERS 帧
│   └── DATA 帧
└── Stream 0 (连接控制)
    ├── SETTINGS 帧
    ├── PING 帧
    └── GOAWAY 帧
```

- **流**：双向传输的虚拟通道，用 Stream ID 标识
- **消息**：一个完整的请求或响应（由多个帧组成）
- **帧**：最小通信单位

**流 ID 规则**：
- 客户端发起的流：奇数 (1, 3, 5, ...)
- 服务端发起的流：偶数 (2, 4, 6, ...)
- 流 0：连接级控制帧

---

## 3. 具体能力

### 3.1 二进制分帧

HTTP/2 将请求/响应拆分为二进制帧，在同一个 TCP 连接上交错传输：

```
HTTP/1.1 (串行):
Stream1: [Request1][Response1]  Stream2: [Request2][Response2]

HTTP/2 (交错):
[Frame1-S1][Frame1-S2][Frame2-S1][Frame2-S2]...
 同一TCP连接，不同流的帧交错传输
```

### 3.2 多路复用

消除 HTTP/1.1 的队头阻塞：

```
HTTP/1.1:
请求1 → 等响应1 → 请求2 → 等响应2 → 请求3 → 等响应3

HTTP/2:
请求1 ──→ 响应1(帧1,帧2,帧3)
请求2 ──→ 响应2(帧1,帧2)
请求3 ──→ 响应3(帧1)
  ↑ 所有请求同时发送，响应交错返回
```

**注意**：HTTP/2 解决了应用层队头阻塞，但 TCP 层队头阻塞仍然存在（一个 TCP 包丢失阻塞所有流）。HTTP/3 解决了这个问题。

### 3.3 头部压缩（HPACK）

HTTP/1.1 每次请求携带完整头部，重复内容多。HPACK 使用两种机制压缩：

**静态表**：预定义 61 个常用头部字段：

```
索引 1: :authority ""       索引 2: :method GET
索引 3: :method POST        索引 4: :path /
索引 5: :path /index.html   索引 6: :scheme http
索引 7: :scheme https       索引 8: :status 200
...
```

**动态表**：会话中增量更新的头部字段表：

```
首次: :method GET → 编码为索引 2 (1字节)
首次: custom-header: abc → 添加到动态表索引 62
后续: custom-header: abc → 编码为索引 62 (1字节)
```

**Huffman 编码**：对字符串值进一步压缩。

### 3.4 服务端推送

服务器可以主动推送客户端可能需要的资源：

```
客户端请求 /index.html
服务器返回 index.html + 推送 /style.css + 推送 /script.js

流程：
1. 客户端发送 HEADERS (Stream 1)
2. 服务器发送 HEADERS (Stream 1, 响应)
3. 服务器发送 PUSH_PROMISE (Stream 1, 承诺推送 Stream 2)
4. 服务器发送 HEADERS (Stream 2, 推送 style.css)
5. 服务器发送 DATA (Stream 2, CSS 内容)
6. 服务器发送 DATA (Stream 1, HTML 内容)
```

**注意**：Chrome 已移除 HTTP/2 Push 支持（替代方案：`<link rel="preload">`）。

### 3.5 流优先级

客户端通过 PRIORITY 帧指定流的依赖关系和权重：

```
        Stream 0 (根)
       /          \
  Stream 1 (HTML)   Stream 3 (CSS)
       |
  Stream 5 (JS, 依赖 HTML)
```

- **依赖**：子流优先级低于父流
- **权重**：1-256，同依赖的兄弟流按权重分配资源

### 3.6 流量控制

HTTP/2 在流级别实现了流量控制（类似 TCP 滑动窗口）：

- 通过 WINDOW_UPDATE 帧通告接收窗口
- 初始窗口大小：65535 字节
- 可通过 SETTINGS 帧调整
- 仅影响 DATA 帧，HEADERS 等控制帧不受限

---

## 4. 报文样例

### 4.1 SETTINGS 帧

```
00 00 0c 04 00 00 00 00 00
00 03 00 00 00 64
00 04 00 00 ff ff
00 05 00 00 40 00
```

**逐字段解析**：

```
00 00 0c    → Length=12
04          → Type=4 (SETTINGS)
00          → Flags=0
00 00 00 00 → Stream ID=0 (连接级)

--- Settings 参数 ---
00 03 00 00 00 64 → SETTINGS_MAX_CONCURRENT_STREAMS=100
00 04 00 00 ff ff → SETTINGS_INITIAL_WINDOW_SIZE=65535
00 05 00 00 40 00 → SETTINGS_MAX_FRAME_SIZE=16384
```

### 4.2 HEADERS 帧

```
00 00 11 01 04 00 00 00 01
83 86 44 08 41 d1 6e 5d 4b 8d 9a d1 7a
```

**逐字段解析**：

```
00 00 11    → Length=17
01          → Type=1 (HEADERS)
04          → Flags=0x04 (END_HEADERS)
00 00 00 01 → Stream ID=1

--- HPACK 编码头部 ---
83          → 索引 3 (:method POST)
86          → 索引 6 (:scheme https)
44 08 ...   → 索引 4 (:path /) + Huffman 编码值
41 d1 ...   → 索引 1 (:authority) + Huffman 编码值
```

### 4.3 DATA 帧

```
00 00 1a 00 01 00 00 00 01
7b 22 6d 65 73 73 61 67 65 22 3a 22 68 65 6c 6c 6f 22 7d ...
```

**逐字段解析**：

```
00 00 1a    → Length=26
00          → Type=0 (DATA)
01          → Flags=0x01 (END_STREAM)
00 00 00 01 → Stream ID=1
7b 22 6d... → {"message":"hello"} (JSON 数据)
```

---

## 5. 深入一点

### HTTP/2 连接前言

HTTP/2 连接建立时，双方发送固定前言：

```
客户端前言:
PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n
+ SETTINGS 帧

服务器前言:
SETTINGS 帧
```

这个前言用于识别 HTTP/2 连接（兼容 HTTP/1.1 升级场景）。

### HPACK 动态表溢出

攻击者可发送大量不同头部填满动态表，导致内存耗尽（HPACK Bomb）。缓解措施：限制动态表大小、限制头部数量和大小。

---

## 参考资料

- [RFC 9113 - HTTP/2](https://datatracker.ietf.org/doc/html/rfc9113)
- [RFC 7541 - HPACK](https://datatracker.ietf.org/doc/html/rfc7541)

# 第 11 章：WebSocket 协议

> **学习目标**：掌握 WebSocket 全双工持久连接的实现机制与帧格式
> **预计时长**：3 小时
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

### 1.1 WebSocket 概述

WebSocket 提供全双工、持久化的双向通信通道，通过 HTTP Upgrade 机制建立连接，之后独立运行。

**WebSocket vs HTTP 轮询**：

| 方式 | 通信模式 | 延迟 | 开销 |
|------|---------|------|------|
| HTTP 轮询 | 客户端定时拉取 | 高 | 每次完整 HTTP 头部 |
| HTTP 长轮询 | 服务器挂起请求 | 中 | 每次完整 HTTP 头部 |
| SSE | 服务器→客户端单向 | 低 | HTTP 头部一次 |
| WebSocket | 全双工双向 | 极低 | 握手后仅帧头部 2-14 字节 |

**WebSocket 核心特性**：
- **全双工**：客户端和服务器可同时发送数据
- **持久连接**：一次握手，持续通信
- **低开销**：数据帧头部仅 2-14 字节
- **支持二进制**：文本帧和二进制帧
- **协议扩展**：支持 permessage-deflate 压缩扩展

---

## 2. 报文结构

### 2.1 WebSocket 帧格式

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|FIN|RSV1|RSV2|RSV3|  Opcode  |M| Payload Len  |    Extended   |
|               |  (4 bits)  |A|    (7 bits)   | Payload Length |
|               |            |S|               |               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                  Extended Payload Length (续)                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |Masking-key (if MASK=1)       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Masking-key (续)             |          Payload Data         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.2 字段详解

| 字段 | 长度 | 含义 |
|------|------|------|
| **FIN** | 1 bit | 1=消息最后一个帧 |
| **RSV1-3** | 3 bit | 保留（扩展使用，如 RSV1=permessage-deflate） |
| **Opcode** | 4 bit | 帧类型 |
| **MASK** | 1 bit | 1=载荷已掩码（客户端→服务器必须掩码） |
| **Payload Len** | 7 bit | 载荷长度（≤125 直接编码，126=2字节扩展，127=8字节扩展） |
| **Masking-key** | 0/32 bit | 掩码密钥（MASK=1 时存在） |
| **Payload Data** | 可变 | 载荷数据（可能被掩码） |

### 2.3 Opcode 类型

| Opcode | 类型 | 说明 |
|--------|------|------|
| 0x0 | continuation | 分片续帧 |
| 0x1 | text | 文本数据（UTF-8） |
| 0x2 | binary | 二进制数据 |
| 0x8 | close | 关闭连接 |
| 0x9 | ping | 心跳检测 |
| 0xA | pong | 心跳响应 |
| 0x3-7 | 保留 | 非控制帧 |
| 0xB-F | 保留 | 控制帧 |

**关键规则**：
- 控制帧（close/ping/pong）Payload Len ≤ 125，不可分片
- 数据帧（text/binary）可分片传输
- 客户端→服务器必须掩码，服务器→客户端不掩码

---

## 3. 具体能力

### 3.1 握手升级（HTTP Upgrade）

```
客户端请求:
GET /chat HTTP/1.1\r\n
Host: server.example.com\r\n
Upgrade: websocket\r\n
Connection: Upgrade\r\n
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n
Sec-WebSocket-Version: 13\r\n
\r\n

服务器响应:
HTTP/1.1 101 Switching Protocols\r\n
Upgrade: websocket\r\n
Connection: Upgrade\r\n
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n
\r\n
```

**Sec-WebSocket-Accept 计算规则**：

```
Accept = Base64(SHA1(Key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"))
```

这个固定 GUID 确保响应来自理解 WebSocket 的服务器，而非普通 HTTP 服务器。

### 3.2 掩码机制

客户端发送的帧必须掩码，防止缓存污染攻击：

```
掩码算法:
for i in range(len(payload)):
    masked[i] = payload[i] XOR masking_key[i % 4]

示例:
Masking-key = 37 fa 21 3d
原始数据:   48 65 6c 6c 6f ("Hello")
掩码数据:   7f 9f 4d 51 58
解码:       7f^37 9f^fa 4d^21 51^3d 58^37 = 48 65 6c 6c 6f
```

### 3.3 分片传输

大消息可拆分为多个帧：

```
帧1: FIN=0, Opcode=0x1 (text), Data="Hel"
帧2: FIN=0, Opcode=0x0 (continuation), Data="lo "
帧3: FIN=1, Opcode=0x0 (continuation), Data="World"
→ 重组为完整消息: "Hello World"
```

**分片规则**：
- 仅数据帧可分片，控制帧不可
- 分片帧之间不可插入其他消息的数据帧
- 控制帧可在分片之间插入（如 ping/pong）

### 3.4 心跳保活

```
客户端 → 服务器: Ping (Opcode=0x9, Payload="heartbeat")
服务器 → 客户端: Pong (Opcode=0xA, Payload="heartbeat")
```

- Ping 可携带载荷，Pong 必须回显相同载荷
- 用于检测连接存活、测量延迟
- 若一段时间无 Pong 响应，可认为连接断开

### 3.5 关闭连接

```
主动方 → 被动方: Close (Opcode=0x8, Payload=状态码+原因)
被动方 → 主动方: Close (Opcode=0x8, Payload=状态码)

状态码:
1000 = 正常关闭
1001 = 端点离开
1002 = 协议错误
1003 = 不支持的数据类型
1008 = 策略违规
1011 = 内部错误
1015 = TLS 握手失败
```

---

## 4. 报文样例

### 4.1 文本帧（客户端→服务器，带掩码）

```
81 85 37 fa 21 3d 7f 9f 4d 51 58
```

**逐字段解析**：

```
81          → FIN=1, RSV=000, Opcode=0x1 (text)
85          → MASK=1, Payload Len=5
37 fa 21 3d → Masking-key=0x37fa213d
7f 9f 4d 51 58 → 掩码数据
解码: 7f^37=48(H), 9f^fa=65(e), 4d^21=6c(l), 51^3d=6c(l), 58^37=6f(o)
→ 原始数据: "Hello"
```

### 4.2 二进制帧（服务器→客户端，无掩码）

```
82 05 48 65 6c 6c 6f
```

**逐字段解析**：

```
82          → FIN=1, RSV=000, Opcode=0x2 (binary)
05          → MASK=0, Payload Len=5
48 65 6c 6c 6f → "Hello" (原始数据，无掩码)
```

### 4.3 Ping 帧

```
89 04 74 65 73 74
```

**逐字段解析**：

```
89          → FIN=1, Opcode=0x9 (ping)
04          → MASK=0, Payload Len=4
74 65 73 74 → "test"
```

### 4.4 Close 帧

```
88 82 37 fa 21 3d bf da 3e 31
```

**逐字段解析**：

```
88          → FIN=1, Opcode=0x8 (close)
82          → MASK=1, Payload Len=2
37 fa 21 3d → Masking-key
bf da       → 掩码数据 → 解码: bf^37=88, da^fa=20 → 状态码=0x8820
```

### 4.5 大载荷帧（扩展长度）

```
82 7E 01 00 [256 字节数据]
```

```
82          → FIN=1, Opcode=0x2 (binary)
7E          → MASK=0, Payload Len=126 (使用 2 字节扩展)
01 00       → 实际载荷长度=256
[256 bytes] → 载荷数据
```

---

## 5. 深入一点

### permessage-deflate 扩展

WebSocket 支持消息级压缩：

```
握手协商:
Sec-WebSocket-Extensions: permessage-deflate; server_no_context_takeover

压缩帧:
RSV1=1 表示该帧使用 deflate 压缩
Payload = deflate(原始数据) + 0x00 0x00 0xFF 0xFF (flush 标记)
```

### WebSocket 子协议

握手时可协商子协议：

```
客户端: Sec-WebSocket-Protocol: chat, superchat
服务器: Sec-WebSocket-Protocol: chat  (选定一个)
```

常见子协议：`graphql-ws`、`mqtt`、`stomp`。

---

## 参考资料

- [RFC 6455 - The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [RFC 7692 - Compression Extensions for WebSocket](https://datatracker.ietf.org/doc/html/rfc7692)

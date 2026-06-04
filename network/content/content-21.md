# 第 21 章：gRPC 协议

> **学习目标**：掌握高性能 RPC 的协议设计与 HTTP/2 映射机制
> **预计时长**：3 小时
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心概念

### 1.1 gRPC 概述

gRPC 是 Google 开源的高性能 RPC 框架，基于 HTTP/2 和 Protocol Buffers。它定义了跨语言的 RPC 调用规范，支持四种通信模式。

**gRPC 核心特性**：
- 基于 HTTP/2 传输（多路复用、流式传输）
- Protocol Buffers 序列化（高效、紧凑）
- 四种通信模式（Unary/Server Streaming/Client Streaming/Bidirectional）
- 跨语言支持（11+ 语言）
- 内置健康检查、超时重试、负载均衡
- 默认使用 TLS

```
gRPC 协议栈：
┌───────────────────────────┐
│  gRPC 应用（Protobuf IDL）│
├───────────────────────────┤
│  gRPC 帧（Length-Prefixed）│  ← 本章重点
├───────────────────────────┤
│  HTTP/2 (DATA/HEADERS 帧)  │
├───────────────────────────┤
│  TLS                       │
├───────────────────────────┤
│  TCP                       │
└───────────────────────────┘
```

---

## 2. 报文结构

### 2.1 gRPC 帧格式（Length-Prefixed Message）

gRPC 消息封装在 HTTP/2 DATA 帧中，使用长度前缀格式：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Compressed (1)  |                Message Length (4)          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Message                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| **Compressed** | 1 byte | 0=未压缩, 1=压缩（使用 grpc-encoding 头部指定的算法） |
| **Message Length** | 4 bytes (big-endian) | Protobuf 消息长度 |
| **Message** | 可变 | Protobuf 编码的消息体 |

**关键点**：
- 每个消息前有 5 字节前缀（1 压缩标志 + 4 长度）
- 流式 RPC 中，每个消息独立封装
- 大消息可能被拆分到多个 HTTP/2 DATA 帧

### 2.2 HTTP/2 映射

gRPC 请求映射到 HTTP/2：

```
请求:
HEADERS 帧 (Stream ID=N):
  :method: POST
  :path: /package.service/method
  :authority: server.example.com
  content-type: application/grpc
  grpc-encoding: gzip (可选)
  grpc-timeout: 5S
  grpc-message-size: 4MB (可选)

DATA 帧:
  [5字节前缀 + Protobuf 消息]

HEADERS 帧 (END_STREAM):
  (空，表示请求结束)
```

**响应映射**：

```
HEADERS 帧:
  :status: 200
  content-type: application/grpc
  grpc-encoding: identity

DATA 帧:
  [5字节前缀 + Protobuf 消息]

HEADERS 帧 (END_STREAM + Trailers):
  grpc-status: 0 (OK)
  grpc-message: (可选，错误时描述)
```

### 2.3 gRPC 状态码

| 状态码 | 含义 |
|--------|------|
| 0 | OK |
| 1 | CANCELLED |
| 2 | UNKNOWN |
| 3 | INVALID_ARGUMENT |
| 4 | DEADLINE_EXCEEDED |
| 5 | NOT_FOUND |
| 6 | ALREADY_EXISTS |
| 7 | PERMISSION_DENIED |
| 8 | RESOURCE_EXHAUSTED |
| 11 | OUT_OF_RANGE |
| 12 | UNIMPLEMENTED |
| 13 | INTERNAL |
| 14 | UNAVAILABLE |
| 15 | DATA_LOSS |
| 16 | UNAUTHENTICATED |

---

## 3. 具体能力

### 3.1 四种通信模式

**Unary RPC（一元调用）**：

```
客户端 → 请求 → 服务器
客户端 ← 响应 ← 服务器
(类似普通 HTTP 请求-响应)
```

**Server Streaming RPC（服务端流）**：

```
客户端 → 请求 → 服务器
客户端 ← 响应1 ← 服务器
客户端 ← 响应2 ← 服务器
客户端 ← 响应3 ← 服务器
(一个请求，多个响应)
```

**Client Streaming RPC（客户端流）**：

```
客户端 → 请求1 → 服务器
客户端 → 请求2 → 服务器
客户端 → 请求3 → 服务器
客户端 ← 响应 ← 服务器
(多个请求，一个响应)
```

**Bidirectional Streaming RPC（双向流）**：

```
客户端 ←→ 服务器 (双向同时发送)
(任意方向任意顺序，全双工)
```

### 3.2 Protocol Buffers 编码

Protobuf 使用 TLV（Tag-Length-Value）编码：

```
Field = (field_number << 3) | wire_type

Wire Types:
0 = Varint (int32, int64, bool, enum)
1 = 64-bit (fixed64, double)
2 = Length-Delimited (string, bytes, 嵌套消息)
5 = 32-bit (fixed32, float)
```

**Varint 编码示例**：

```
150 = 0x96 0x01
编码: 10010110 00000001
       ↑MSB=1(续)  ↑MSB=0(终)
解码: 0010110 + 0000001 = 10010110 = 150
```

**Length-Delimited 编码**：

```
字段号=2, 类型=string("testing")
12 07 74 65 73 74 69 6e 67

12          → Tag: field_number=2, wire_type=2 (0x12 = 00010010)
07          → Length=7
74 65 73... → "testing"
```

### 3.3 超时与重试

**超时（Deadline/Timeout）**：

```
客户端设置: grpc-timeout: 5S (5秒)
→ 沿调用链传播，每级减去已用时间
→ 超时返回 DEADLINE_EXCEEDED
```

**重试策略（gRPC Service Config）**：

```
{
  "methodConfig": [{
    "name": [{"service": "pkg.service"}],
    "retryPolicy": {
      "maxAttempts": 3,
      "initialBackoff": "0.1s",
      "maxBackoff": "1s",
      "backoffMultiplier": 2,
      "retryableStatusCodes": ["UNAVAILABLE", "DEADLINE_EXCEEDED"]
    }
  }]
}
```

### 3.4 元数据传递

gRPC 元数据映射到 HTTP/2 头部：

```
初始元数据 (Headers):
  → 类似 HTTP 请求头
  → 在第一个 HEADERS 帧中发送

尾部元数据 (Trailers):
  → gRPC 特有，在流结束时发送
  → 包含 grpc-status 和 grpc-message
  → 映射到 HTTP/2 的 trailing HEADERS 帧
```

**自定义元数据**：

```
客户端: metadata.Add("x-request-id", "abc123")
服务端: md, ok := metadata.FromIncomingContext(ctx)
```

### 3.5 健康检查

gRPC 标准健康检查协议：

```
service Health {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
  rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}

ServingStatus:
  UNKNOWN = 0
  SERVING = 1
  NOT_SERVING = 2
  SERVICE_UNKNOWN = 3
```

负载均衡器通过 Health Check 判断后端是否可用。

---

## 4. 报文样例

### 4.1 Unary RPC 请求（HTTP/2 HEADERS + DATA）

```
--- HEADERS 帧 ---
:method: POST
:scheme: https
:path: /helloworld.Greeter/SayHello
:authority: localhost:50051
content-type: application/grpc
grpc-encoding: identity
grpc-timeout: 5S
te: trailers

--- DATA 帧 ---
00 00 00 00 05 0a 05 48 65 6c 6c 6f
```

**DATA 帧解析**：

```
00          → Compressed=0 (未压缩)
00 00 00 05 → Message Length=5
0a 05 48 65 6c 6c 6f → Protobuf 编码:
  0a          → Tag: field=1, type=2 (string)
  05          → Length=5
  48 65 6c 6c 6f → "Hello"
```

### 4.2 Unary RPC 响应

```
--- HEADERS 帧 ---
:status: 200
content-type: application/grpc
grpc-encoding: identity

--- DATA 帧 ---
00 00 00 00 0c 0a 0a 48 65 6c 6c 6f 20 57 6f 72 6c 64

--- Trailers (HEADERS 帧, END_STREAM) ---
grpc-status: 0
```

**DATA 帧解析**：

```
00          → Compressed=0
00 00 00 0c → Message Length=12
0a 0a 48 65 6c 6c 6f 20 57 6f 72 6c 64 → Protobuf:
  0a          → Tag: field=1, type=2
  0a          → Length=10
  48 65 6c 6c 6f 20 57 6f 72 6c 64 → "Hello World"
```

### 4.3 错误响应

```
--- Trailers ---
grpc-status: 5
grpc-message: User not found
```

---

## 5. 深入一点

### gRPC vs REST

| 特性 | gRPC | REST |
|------|------|------|
| 协议 | HTTP/2 | HTTP/1.1/2 |
| 数据格式 | Protobuf (二进制) | JSON (文本) |
| 接口定义 | .proto (强类型) | OpenAPI (可选) |
| 流式传输 | ✅ 四种模式 | ❌ (SSE 单向) |
| 代码生成 | ✅ 多语言 | ❌ 手动 |
| 浏览器支持 | ❌ (需 gRPC-Web) | ✅ |
| 调试 | 需专用工具 | curl/浏览器 |

### gRPC-Web

gRPC-Web 让浏览器直接调用 gRPC 服务：

```
浏览器 → gRPC-Web Proxy → gRPC Server
或
浏览器 → Envoy (gRPC-Web filter) → gRPC Server
```

限制：仅支持 Unary 和 Server Streaming，不支持 Client/Bidirectional Streaming。

### gRPC 反射与 CLI 工具

```
# 列出服务
grpcurl -plaintext localhost:50051 list

# 调用方法
grpcurl -plaintext -d '{"name":"World"}' localhost:50051 helloworld.Greeter/SayHello

# 需要服务端注册反射:
grpc_reflection.RegisterServer(grpcServer, reflectionServer)
```

---

## 参考资料

- [gRPC Specification](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md)
- [Protocol Buffers Encoding](https://protobuf.dev/programming-guides/encoding/)
- [gRPC Health Checking Protocol](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)

# gRPC 远程过程调用协议

> 应用层 | HTTP/2 | Protobuf | TLS | 四种通信模式 | 端口 443/50051

---

## 报文结构

gRPC 消息封装在 HTTP/2 DATA 帧中，5 字节长度前缀 + Protobuf 消息。

### gRPC 帧格式（Length-Prefixed Message）

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Compressed(1)  |          Message Length (4, big-endian)     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
|                       Message (Protobuf)                       |
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| Compressed | 1 byte | 0=未压缩，1=压缩（grpc-encoding 头部指定算法，如 gzip） |
| Message Length | 4 bytes | Protobuf 消息体字节长度（网络字节序） |
| Message | 可变 | Protobuf 编码的序列化消息 |

### HTTP/2 映射

gRPC 利用 HTTP/2 的 HEADERS / DATA / HEADERS(Trailers) 帧序列承载 RPC 调用。

```
请求（Client → Server）：
  HEADERS 帧 (Stream ID=N):
    :method: POST
    :path: /package.Service/Method
    :authority: server.example.com
    content-type: application/grpc
    grpc-timeout: 5S
    te: trailers
    [自定义元数据 ...]
  DATA 帧:
    [5 字节前缀 + Protobuf 消息]
  HEADERS 帧 (END_STREAM):       ← 请求结束标记（空）

响应（Server → Client）：
  HEADERS 帧:
    :status: 200
    content-type: application/grpc
    grpc-encoding: identity
    [响应元数据 ...]
  DATA 帧:
    [5 字节前缀 + Protobuf 消息]
  HEADERS 帧 (END_STREAM):       ← Trailers，含 gRPC 状态
    grpc-status: 0               ← OK
    grpc-message: (可选，错误描述)
```

**流式 RPC 的 DATA 帧**：

```
Unary: 1 个 DATA 帧（请求 / 响应各一个）

Server Streaming:
请求 → [HEADERS + DATA]
响应 → [HEADERS + DATA1 + DATA2 + ... + Trailers]

Client Streaming:
请求 → [HEADERS + DATA1 + DATA2 + ... + Trailers(空)]
响应 → [HEADERS + DATA + Trailers]

Bidirectional:
请求 ↔ [HEADERS + DATA1(请求) + DATA2(响应) + DATA3(请求) ...]
      双方可同时发送，每个消息独立 Length-Prefixed
```

### gRPC 状态码

| 状态码 | 含义 | 触发场景 |
|--------|------|---------|
| 0 | OK | 正常完成 |
| 1 | CANCELLED | 客户端取消 |
| 2 | UNKNOWN | 未知错误 |
| 3 | INVALID_ARGUMENT | 参数无效 |
| 4 | DEADLINE_EXCEEDED | 超时 |
| 5 | NOT_FOUND | 资源不存在 |
| 7 | PERMISSION_DENIED | 权限不足 |
| 8 | RESOURCE_EXHAUSTED | 资源耗尽 |
| 12 | UNIMPLEMENTED | 方法未实现 |
| 13 | INTERNAL | 内部错误 |
| 14 | UNAVAILABLE | 服务不可用 |
| 16 | UNAUTHENTICATED | 未认证 |

---

## 核心能力

### 1. 四种通信模式

gRPC 在单一 HTTP/2 连接上支持四种 RPC 模式，覆盖从简单请求到实时双工流的全部场景。

```
Unary RPC（一元）：
 Client                                     Server
   │                                           │
   │─── HEADERS + DATA(5B+Proto) ────────────→│   请求 1 个消息
   │←── HEADERS + DATA(5B+Proto) + Trailers ──│   响应 1 个消息
   │                                           │
   （最常用，类似传统 HTTP POST）

Server Streaming RPC（服务端流）：
 Client                                     Server
   │                                           │
   │─── HEADERS + DATA(5B+Proto) ────────────→│   请求 1 个消息
   │←── HEADERS ──────────────────────────────│
   │←── DATA(Proto1) ─────────────────────────│
   │←── DATA(Proto2) ─────────────────────────│   推送多个消息
   │←── DATA(Proto3) + Trailers ──────────────│
   │                                           │
   （适用：订阅、日志推送、大结果分页）

Client Streaming RPC（客户端流）：
 Client                                     Server
   │                                           │
   │─── HEADERS ──────────────────────────────→│
   │─── DATA(Proto1) ─────────────────────────→│   发送多个消息
   │─── DATA(Proto2) ─────────────────────────→│
   │─── DATA(Proto3) + Trailers(END_STREAM) ───→│   发送完毕
   │←── DATA(5B+Proto) + Trailers ─────────────│   返回 1 个结果
   │                                           │
   （适用：文件上传、批量数据提交）

Bidirectional Streaming RPC（双向流）：
 Client                                     Server
   │                                           │
   │─── HEADERS ──────────────────────────────→│
   │─── DATA(Req1) ───────────────────────────→│   双方同时发送
   │─── DATA(Req2) ───────────────────────────→│
   │←── DATA(Resp1) ──────────────────────────│
   │─── DATA(Req3) ───────────────────────────→│
   │←── DATA(Resp2) ──────────────────────────│
   │←── DATA(Resp3) + Trailers ───────────────│
   │                                           │
   （适用：实时聊天、AI 对话、游戏同步）
```

---

### 2. Protobuf 编码

为什么需要：JSON/XML 编码冗长（大量文本+冗余字段名），Protobuf 用二进制 TLV 格式，字段名替换为数字 Tag，体积小、解析快。

```
Wire Types：
0 = Varint    → int32, int64, uint32, bool, enum
1 = 64-bit    → fixed64, double
2 = Length-Delimited → string, bytes, 嵌套消息
5 = 32-bit    → fixed32, float

Tag 编码 = (field_number << 3) | wire_type
```

**Varint 示例 —— int32 150**：

```
二进制：10010110 00000001
             ↓ MSB 续续标志
150 = 0x96 0x01

解码过程：
0x96 = 10010110 → MSB=1(续) 有效位=0010110
0x01 = 00000001 → MSB=0(终) 有效位=0000001
拼接（小端）：0000001 0010110 = 10010110 = 150
```

**Length-Delimited 示例 —— string "testing" 在字段 2**：

```
原始 Protobuf 消息：
message Msg { string name = 2; }  → name = "testing"

编码字节：
12 07 74 65 73 74 69 6e 67

12 = 00010010 → Tag = field 2 (00010), wire_type 2 (010)
07 = 长度 7
74 65 73 74 69 6e 67 = "testing" (ASCII)
```

**Varint ZigZag —— 有符号整数**：

负数在 Varint 中会填充大量 0xFF 字节（因为补码表示）。ZigZag 将符号位移到 LSB：

```
sint32 → (n << 1) ^ (n >> 31)
sint64 → (n << 1) ^ (n >> 63)

示例：-1 → 1,  1 → 2,  -2 → 3
```

---

### 3. 超时与重试

**Deadline / Timeout**：

为什么需要：RPC 调用可能因网络问题、服务端卡死等待无限长。Deadline 让调用在指定时间后自动取消。

```
客户端设置：
  grpc-timeout: 5S    ← 5 秒超时
  grpc-timeout: 100m  ← 100 毫秒

沿调用链传播：
  Client A → gRPC → B → gRPC → C
  A 设 5s → B 收到还剩 4.5s → C 收到还剩 4.0s

超时后：
  - 客户端取消请求，释放资源
  - 返回状态码 DEADLINE_EXCEEDED (4)
  - 服务端收到 Cancelled 信号（通过 Context.Done）
```

**重试策略（Service Config）**：

```
{
  "methodConfig": [{
    "name": [{"service": "pkg.ServiceName"}],
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

- 仅对幂等方法启用重试（gRPC 不能自动判断幂等性）
- `retryableStatusCodes` 只列可重试的（UNAVAILABLE 是网络抖动，INVALID_ARGUMENT 重试也无效）
- 重试次数满后，返回最后一次错误

---

### 4. 元数据传递

为什么需要：跨 RPC 传递认证 Token、请求追踪 ID、路由信息等上下文数据，且不影响 Protobuf 的 Schema。

```
初始元数据（Initial Metadata）：
  HEADERS 帧中发送，在 DATA 之前
  → 认证 Token：Authorization: Bearer xxx
  → 追踪 ID：x-request-id: abc123
  → 路由：x-routing-key: shard-01

尾部元数据（Trailing Metadata）：
  gRPC 特有，流结束时发送的 HEADERS 帧
  → 包含 grpc-status 和 grpc-message
  → 可携带统计信息（处理耗时、结果行数）

使用示例（Go）：
  // 客户端设置
  md := metadata.Pairs("x-request-id", "abc123")
  ctx := metadata.NewOutgoingContext(context.Background(), md)

  // 服务端读取
  md, ok := metadata.FromIncomingContext(ctx)
```

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 gRPC 选 HTTP/2 | 多路复用共享一个 TCP 连接；流式支持（Server/Client/Bidi）；HPACK 头部压缩；官方浏览器支持协议。对比 HTTP/1.1：队头阻塞、6 连接限制、无流式 |
| 为什么不用 TCP 裸流 | HTTP/2 提供现成的多路复用、流量控制、头部压缩，gRPC 只需聚焦 RPC 语义层 |
| 为什么 Length-Prefixed 而非 Chunked | Protobuf 消息一次性编码后长度已知，不需要分块。HTTP/2 帧已处理 MTU 分片 |
| 为什么 Trailer 放状态码 | 流式场景下，服务器发送完所有数据后才知最终状态。放在 HEADERS 则必须在 DATA 前确定 |
| 为什么默认需要 TLS | gRPC 设计用于跨数据中心通信，TLS 是传输安全基线。plaintext 模式仅限内网调试 |
| 为什么 Protobuf 而非 JSON | Protobuf 小 3-10x（无冗余字段名），解析快 20-100x（二进制直接映射到结构体），强类型保证兼容性 |
| 为什么 gRPC-Web 不支持 Client/Bidi Streaming | 浏览器 HTTP/2 实现无法发送 trailers，gRPC-Web 只能模拟 Unary + Server Streaming |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| 连接失败 | `rpc error: code = Unavailable` | `grpcurl -plaintext localhost:50051 list` | 端口未监听 / 防火墙拦截 |
| TLS 错误 | `transport: authentication handshake failed` | `openssl s_client -connect localhost:50051` | 证书不匹配 / 双向认证未配置 |
| 超时 | `DeadlineExceeded` | 检查 `grpc-timeout` 设置 + 服务器处理耗时 | 服务端慢 / 客户端设置过短 |
| 消息过大 | `ResourceExhausted: grpc: received message larger than max` | 服务端 `MaxRecvMsgSize` 默认 4MB | 需要调大限制或分页 |
| 流式中断 | 流不完整，无错误码 | `tcpdump -i eth0 port 50051 -X` 抓包 | 连接中断 / 对端崩溃 |
| Content-Type 错误 | `unexpected content-type` | 检查 HTTP 请求头 | 用浏览器直接访问 gRPC 端口 |
| Protobuf 解析失败 | `Illegal wire type` / `Unexpected EOF` | 对比编码字节和 .proto 定义 | 版本不匹配 / 字段不兼容 |

```bash
# grpcurl —— 无需 .proto 文件即可调用
grpcurl -plaintext localhost:50051 list                                      # 列出服务
grpcurl -plaintext localhost:50051 list Package.Service                      # 列出方法
grpcurl -plaintext -d '{"name":"World"}' localhost:50051 Package.Service/Method  # 调用

# 需要服务端启用反射：
#   import "google.golang.org/grpc/reflection"
#   reflection.Register(s)
```

---

## 常用工具

```bash
# grpcurl —— gRPC CLI 客户端（最常用）
grpcurl -plaintext localhost:50051 list                                 # 发现服务
grpcurl -plaintext localhost:50051 describe .Package.Service            # 查看定义
grpcurl -insecure -d '{}' service.grpc.io:443 Package.Service/Method   # 带 TLS
grpcurl -H 'authorization: Bearer <token>' -plaintext ...               # 带认证

# grpc_cli —— gRPC 官方 CLI（调试用）
grpc_cli ls localhost:50051                                             # 列出服务
grpc_cli call localhost:50051 Service.Method 'name:"World"'             # 调用

# grpcc —— Node.js gRPC 交互式客户端
grpcc --proto ./api.proto --address localhost:50051

# ghz —— gRPC 压测工具
ghz --insecure --proto ./api.proto --call Package.Service/Method \
    -d '{"name":"World"}' -n 10000 -c 100 localhost:50051

# tcpdump —— HTTP/2 帧级抓包
tcpdump -i eth0 -nn 'port 50051' -X                                     # 十六进制看帧字节
tcpdump -i eth0 -A 'port 50051'                                          # ASCII 看 HTTP/2 头部

# Wireshark 抓 gRPC
# 过滤器：http2 && tcp.port == 50051
# Wireshark 3.2+ 支持 gRPC 协议解析器，直接解码 Protobuf
# 需要 gRPC_PROTO_LICENSE 环境变量或提供 .proto 文件

# protoc —— Protobuf 编译
protoc --proto_path=. --go-grpc_out=. api.proto                         # 生成 gRPC 代码
protoc --proto_path=. --descriptor_set_out=api.desc api.proto           # 生成描述文件（供 grpcurl 用）
protoc -o api.pb api.proto                                              # 生成原始描述符

# prototool —— Protobuf 编码/解码辅助
echo -n '0a 05 48 65 6c 6c 6f' | xxd -r -p | protoc --decode_raw       # 无 .proto 解码
```

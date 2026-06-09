# WebSocket

> 应用层 | 全双工 | 消息边界 | 基于 HTTP 升级 | 端口 80/443

---

## 报文结构

### 帧格式

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|F|R|R|R| opcode  |M| Payload Len |     Extended Payload Len    |
|I|S|S|S| (4bit)  |A| (7bit)      |    (如果 Payload Len=126/127)
|N|V|V|V|         |S|             |                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    Extended Payload Len Cont'd  |    Masking Key (4B, M=1 时) |
+                                +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                |         Payload Data          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| FIN | 1bit | 1=最后一帧，0=还有后续帧 |
| RSV | 3bit | 保留位，非0需要协商扩展 |
| Opcode | 4bit | 帧类型（见下表） |
| MASK | 1bit | 1=有掩码（客户端→服务器必须置1） |
| Payload Len | 7bit | 载荷长度：0-125直接；126→后面+2B；127→后面+8B |
| Extended Len | 0/2/8B | 如 Payload Len=126则2B，=127则8B |
| Masking Key | 4B | MASK=1时存在，用于 XOR 脱敏 |
| Payload Data | 可变 | 实际消息内容 |

### Opcode 定义

| Opcode | 含义 | FIN 行为 |
|--------|------|----------|
| 0x0 | 延续帧（分段消息的非首帧） | 可=0，最后一帧=1 |
| 0x1 | 文本帧（UTF-8） | 通常=1 |
| 0x2 | 二进制帧 | 通常=1 |
| 0x8 | 连接关闭帧 | 必须有=1 |
| 0x9 | Ping（心跳探测） | 必须有=1 |
| 0xA | Pong（Ping 响应） | 必须有=1 |

### 关闭帧 Payload

```
+----------+---------------------------+
| Status   | Reason（UTF-8，可选）     |
| Code(2B) | 最长 123B                 |
+----------+---------------------------+
```

| 状态码 | 含义 |
|--------|------|
| 1000 | 正常关闭 |
| 1001 | 一端离开（关页/重启） |
| 1002 | 协议错误 |
| 1003 | 不支持的帧类型 |
| 1009 | 消息太大 |
| 1011 | 服务端异常 |

---

## 核心能力

### 1. 握手升级 —— 兼容 HTTP，复用 80/443 端口

为什么：HTTP 是请求-响应模式，不能服务端主动推送。但防火墙只放 80/443。利用 HTTP Upgrade 机制从 HTTP 升级到 WebSocket，中间代理/防火墙不需要特殊配置。

```
Client                                       Server（HTTP 服务）
  |                                              |
  |─── GET /chat HTTP/1.1 ─────────────────────→|  普通 HTTP 请求
  |   Host: example.com                          |
  |   Upgrade: websocket                        |  ← 告诉服务器要升级
  |   Connection: Upgrade                       |
  |   Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ== |  16B 随机 base64
  |   Sec-WebSocket-Version: 13                 |
  |                                              |
  |←── 101 Switching Protocols ────────────────|  服务器同意
  |   Upgrade: websocket                        |
  |   Connection: Upgrade                       |
  |   Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo= |
  |                         ↑ SHA1(key + "258EAFA5...") base64
  |                                              |
  └──── 连接升级完成，全双工通信开始 ──────────┘
              
  双向帧收发（不再有 HTTP 头部）：
  Client ← 0x1 "新消息" → Server
  Client ← 0x1 "收到"   → Server
  Client ← 0x9 Ping     → Server
  Client → 0xA Pong     ← Server
```

- 服务端不支持 WebSocket → 返回 200（不走 Upgrade），客户端自行降级
- 基于 HTTP 端口导致 WebSocket 没有自己的标准端口

---

### 2. 数据帧类型 —— 文本 / 二进制 / 控制帧

不同应用需要不同消息格式：聊天要文本，文件传输要二进制，心跳需要控制帧。帧类型通过 Opcode 区分。

```
文本帧（Opcode=0x1）：
┌─────────────────────────────────────────┐
│ FIN=1  Opcode=0x1  MASK=0  Payload="hi"│
└─────────────────────────────────────────┘
  payload 必须是有效 UTF-8（客户端应该校验）

二进制帧（Opcode=0x2）：
┌─────────────────────────────────────────────┐
│ FIN=1  Opcode=0x2  MASK=0  Payload=0x89AB..│
└─────────────────────────────────────────────┘
  不校验编码，字节对字节

分段帧（FIN=0 + 0x0）：
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ FIN=0 0x1    │  │ FIN=0 0x0    │  │ FIN=1 0x0    │
│ "Hello Wor"  │→│ "ld, this "  │→│ "is a test"  │
└──────────────┘  └──────────────┘  └──────────────┘
  首帧   Opcode 指明类型
  中间帧 Opcode=0x0
  尾帧   FIN=1 + Opcode=0x0

控制帧（Ping/Pong/Close）：
┌──────────────┐  ┌──────────────────────┐
│ FIN=1 0x9   │  │ FIN=1 0xA            │
│ 可选应用数据  │→│ 回显相同数据          │
└──────────────┘  └──────────────────────┘
  Ping 必须在帧流中插入（不被分段）
  Pong 应尽快回复（被动响应，不可主动发）
```

---

### 3. 掩码机制 —— 防止缓存中毒（Cache Poisoning）

为什么需要：WebSocket 数据在客户端加密后经过代理缓存。攻击者可以构造恶意 WebSocket 帧，使其 XOR 后看起来像一个 HTTP 响应，中毒代理缓存，让其他用户收到恶意响应。

```
客户端 → 服务器：MASK=1，需要掩码
                                                    
  Masking Key = 0xABCDEF01
  Payload     = "Hello"
  XOR 后       = 0x29 0xEF 0x2D 0x2D 0x6F
                               ↑ wire 上被混淆了

代理试图把 WebSocket 数据解释为 HTTP 响应：
  HTTP/1.1 200 OK\r\n...
  但数据被 XOR → 看起来是乱码 → 不匹配 → 不缓存

服务器收到 XOR 数据，用 Masking Key 还原：
  0x29 ^ 0xAB = 'H'
  0xEF ^ 0xCD = 'e'
  0x2D ^ 0xEF = 'l'
  0x2D ^ 0x01 = 'l'
  0x6F ^ 0xAB = 'o'

服务器 → 客户端：MASK=0，不需要掩码
  （服务器可以视为可信任的，不会攻击自己）
```

- 客户端→服务器必须掩码，服务器→客户端禁止掩码
- Masking Key 每帧随机，不可预测
- 掩码不提供机密性（要加密走 WSS），只是防缓存投毒

---

### 4. 心跳保活 —— 检测断连

TCP 长连接没有通知机制，一端崩溃/断网另一端不知道（除非发数据）。WebSocket 通过 Ping/Pong 帧主动探测连接健康。

```
正常心跳：
Client                                      Server
  |                                            |
  |─── Ping (Opcode=0x9, "ping") ───────────→|  等待 Pong
  |←── Pong (Opcode=0xA, "ping") ────────────|  回显相同数据
  |                                            |  确认连接正常
  |   （通常服务端不可见，操作系统/库处理）      |

断连检测：
Client                                      Server
  |                                            |
  |─── Ping ──────────────────────────────→×××|  对端挂了
  |   （等待超时，比如 10s）                    |
  |─── Ping ──────────────────────────────→×××|
  |   （超时）                                  |
  |─── Close ───────────────────────────────→  |  宣布关闭
  |   或者直接丢 socket                        |
```

- Ping 超时策略：3 次 Ping 无响应 → 关闭连接
- 心跳间隔可在协议外协商（不是标准帧内容），客户端/服务端各自实现
- 省电：WebSocket 心跳比 HTTP 短轮询省电得多

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么客户端→服务器的帧需要掩码 | 防缓存中毒毒（Cache Poisoning Attack）：代理不能区分 HTTP 响应和 WebSocket 数据；XOR 混淆后代理无法伪造 HTTP 响应缓存 |
| 为什么服务器→客户端不需要掩码 | 服务器输出是自己的资源，无法直接攻击其它用户；且掩码有计算开销 |
| 为什么基于 HTTP 升级 | 复用 80/443 端口过防火墙，兼容 HTTP 基础设施（代理/负载均衡），降级方案简单（返回 200 即可） |
| 为什么消息有长度分段 | 节省头部：小消息（≤125B）只占 2B 头部；同时支持超大消息（≤2^63-1） |
| 为什么 Opcode 区分文本和二进制 | 应用需要知道编码方式：文本要校验 UTF-8，二进制直接透传 |
| 为什么没有标准心跳间隔 | 各应用负载不同：游戏每秒发多次不需要额外心跳；消息推送可能需要 30s 探测一次 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| 握手失败 | `101` 没返回，客户端报 `Error during WebSocket handshake` | 看响应头：`Sec-WebSocket-Accept` 是否匹配计算 | 反代不支持 WebSocket / Upgrade 头被丢弃 |
| 连接断开无通知 | 客户端认为连接活着，但收不到消息 | 抓包看是否有 TCP RST 或 FIN | 中间防火墙超时断开 / 对端崩溃 |
| 连接一直断连重连 | 连续连接→断线→重连 | 看 Ping/Pong 间隔，服务端可能心跳超时比客户端短 | 负载均衡超时设置 < 应用心跳间隔 |
| 浏览器报 `400 Bad Request` | 握手请求被拒绝 | 检查 `Sec-WebSocket-Version` 是否 13 | 反代不支持 HTTP Upgrade / 版本不兼容 |
| WSS 失败 | 安全 WebSocket 连不上 | `openssl s_client -connect host:443` 看 TLS 握手 | 证书/SNI/双向认证配置 |

```bash
# 抓包看 WebSocket 握手
tcpdump -i any -nn 'port 80 or port 443' -A | grep -E 'Upgrade|Sec-WebSocket'

# Wireshark 过滤 WebSocket
websocket or websocket.fin or websocket.opcode

# 检查 Nginx 是否代理 WebSocket
grep -r "proxy_set_header Upgrade" /etc/nginx/

# 用 wscat 测试连接
wscat -c ws://example.com/ws

# 查看浏览器 WebSocket 状态
# Chrome DevTools → Network → WS → Frames
```

---

## 常用工具

```bash
# wscat —— WebSocket CLI 客户端
wscat -c ws://localhost:8080/ws                         # 连接
wscat -c wss://example.com/ws -n                        # WSS + 不验证证书

# websocat —— 更强大的 WebSocket CLI
websocat ws://localhost:8080/ws                          # 交互式
websocat -t ws://localhost:8080/ws tcp:localhost:9000    # 转发 TCP

# curl —— WebSocket 握手验证
curl -v -H "Upgrade: websocket" -H "Connection: Upgrade" \
     -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
     -H "Sec-WebSocket-Version: 13" http://example.com/ws

# Wireshark
# ws 或 wss 过滤帧

# autobahn —— WebSocket 兼容测试
wstest -m fuzzingclient -s fuzzclient.json
```

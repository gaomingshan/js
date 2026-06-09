# HTTP/3 + QUIC

> 应用层 + 传输层 | 基于 UDP | 0-RTT | 连接迁移 | 无队头阻塞 | 端口 UDP 443

---

## 报文结构

### QUIC 包格式

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  1-RTT Flag(0)  |                                               |
+-+-+-+-+          +                                               +
|                   Connection ID (0/4/8/…/20B)                    |
+                   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                   |            Packet Number (1-4B)              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Payload (CRYPTO/STREAM/…)                |
+                                                               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|1|  Type(7)   |    Version(32)   |   DCID Len   |   DCID...    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|   SCID Len   |   SCID...       |  Packet Number (1-4B)        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Payload                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
                  Long Header (Initial/Handshake/Retry)
```

| 字段 | 含义 |
|------|------|
| Flag / Type | 0=1-RTT, 1=Long Header（Initial/Handshake/Retry/0-RTT） |
| Connection ID | 连接标识，可变长度，用于连接迁移 |
| Version | Long Header 才有，协商 QUIC 版本 |
| Packet Number | 单调递增，不绕回，用于 AEAD 加密 |
| Payload | 帧打包：STREAM/ACK/CRYPTO/PING/CONNECTION_CLOSE |

### QUIC 帧类型位于 Payload 内

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Frame Type  |   Frame-Specific Fields ...                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 帧类型 | 值 | 作用 |
|--------|-----|------|
| STREAM | 0x08-0x0F | 应用数据流 |
| ACK | 0x02-0x03 | 确认收到哪些包 |
| CRYPTO | 0x06 | TLS 1.3 握手数据 |
| PING | 0x01 | 保活 / RTT 测量 |
| CONNECTION_CLOSE | 0x1C/0x1D | 关闭连接 |
| MAX_DATA | 0x10 | 连接级流控 |
| MAX_STREAM_DATA | 0x11 | 流级流控 |
| RESET_STREAM | 0x04 | 重置单条流 |
| HANDSHAKE_DONE | 0x1E | 服务端告知握手完成 |

---

## 核心能力

### 1. 0-RTT 连接建立 —— 首次握手 1-RTT，恢复连接 0-RTT

TCP+TLS 1.3 最少 2-RTT（纯 TCP 1-RTT + TLS 1-RTT），TLS 1.2 更是 3-RTT。移动场景频繁断连重新握手，延时累积严重。QUIC 携带 TLS 1.3 握手+传输参数在同一个 RTT 里完成，恢复连接时直接发数据。

```
首次连接：
Client                                      Server
  |                                            |
  |─── Initial (CRYPTO: ClientHello) ───────→|  RTT 1
  |   + STREAM (最多提前发 1*MTU 数据)        |  验证 CH
  |←── Initial (CRYPTO: ServerHello + ...) ──|  
  |   + Handshake (CRYPTO: Finish)           |  服务端发完证书
  |   + STREAM (可以带响应数据)               |  
  |─── Handshake (CRYPTO: Finish) ──────────→|  RTT 2
  |   + 1-RTT (STREAM: 正式数据)              |  握手完成
  |                                            |
  1-RTT 后双向可发数据

恢复连接（0-RTT）：
Client                                      Server
  |                                            |
  |─── 0-RTT (STREAM: 直接发 Post/Get) ─────→|  有缓存的凭据
  |   + Initial (CRYPTO: ClientHello)         |  验证后直接处理
  |←── 1-RTT (STREAM: 响应) ────────────────|  
  |                                            |
  数据在 0-RTT 就出去了，相当于提前 1-RTT
```

- 0-RTT 有重放攻击风险（场景：幂等请求安全，非幂等危险）
- 服务端用 `max_early_data_size` 限制 0-RTT 数据量

---

### 2. 连接迁移 —— IP 变了，ConnectionID 不变

移动设备在 WiFi←→4G 切换时 IP 变化，TCP 四元组（SrcIP:SrcPort→DstIP:DstPort）改变 → 连接断开重建。QUIC 通过 ConnectionID 解耦连接与 IP:Port，IP 变了只需发个包通知新地址。

```
WiFi 环境：
Client(192.168.1.5:5201)  ⇆  Server(10.0.0.1:443)
   CID_A→CID_B (不变)

   ┌─── 正常收发 ───┐

切换到 4G：
Client(10.0.0.2:38452)  ⇆  Server(10.0.0.1:443)
   CID_A→CID_B (不变)

Client ──── PATH_CHALLENGE ────────→ Server (从新 IP 发出)
        ←─── PATH_RESPONSE ─────────
        ←─── 继续发数据 ────────────  (连接未中断)

验证新路径后服务端切到新 IP 通信，应用层无感知
```

要点：
- 两端各自生成 ConnectionID，互不依赖
- 新路径验证通过前数据仍走旧路径
- 服务端可以发 `NEW_CONNECTION_ID` 帧替换 CID，防追踪

---

### 3. 无队头阻塞（HOL Blocking）的多路复用

HTTP/2 多个 Stream 在一条 TCP 连接上传输。TCP 丢一个包 → 所有 Stream 等重传（因为 TCP 保证有序递交）。QUIC 在 UDP 上自己管理多路复用，一个 Stream 丢包只阻塞自己。

```
HTTP/2 (Over TCP)：

连接逻辑视图：
Stream 1 (HTML)     ████████████░░×××░░████████   ← 丢包阻塞全部
Stream 2 (CSS)      ████████░░░░░░×××░░░░░░░░
Stream 3 (JS)       █████████░░░░░×××░░░░░░░░
                        ↑ 丢了一个 TCP 段 → 3 个 Stream 全卡住

TCP 层视角：有序字节流，一个空洞全部等重传

QUIC (Over UDP)：

连接逻辑视图：
Stream 1 (HTML)     ████████████████████████████   ← 独立推进
Stream 2 (CSS)      ████████████░░░░░░░░░░░░░░░░   ← 丢包只停自己
Stream 3 (JS)       ████████████████████████████
                        ↑ 丢了一个帧 → 只阻塞 Stream 2

UDP 层视角：无顺序要求，各自独立 ACK 重传
```

| 特性 | HTTP/2 | HTTP/3 |
|------|--------|--------|
| 传输 | TCP | QUIC (UDP) |
| Multiplexing | 字节流共享 | 独立流 |
| HOL Blocking | 有（TCP 丢包） | 无（流独立） |
| 头部压缩 | HPACK（依赖有序） | QPACK（解耦流顺序） |

---

### 4. 内置 TLS 1.3 —— 加密是默认项

TCP 时代加密是"可选"的（HTTPS vs HTTP），即使 HTTPS 也是先 TCP 再 TLS。QUIC 把加密做进传输层，所有包（除了初始探测包部分字段）全部 AEAD 加密，无明文 QUIC。

```
TCP 栈：               QUIC 栈：
┌─────────────┐       ┌─────────────┐
│   HTTP/2    │       │   HTTP/3    │
├─────────────┤       ├─────────────┤
│   TLS       │       │   QUIC+TLS  │ ← 加密内建
├─────────────┤       ├─────────────┤
│   TCP       │       │   UDP       │
├─────────────┤       ├─────────────┤
│   IP        │       │   IP        │
└─────────────┘       └─────────────┘
```

| 字段 | TCP+TLS | QUIC |
|------|---------|------|
| 握手 | 先 TCP 再 TLS，至少 2-RTT | 握手第一包就带 ClientHello |
| 加密范围 | 应用数据 | 几乎所有包（含传输参数） |
| 降级风险 | 明文 TCP 可以干扰 | Key 不对直接丢包 |
| 0-RTT 数据 | 不支持 | 通过会话票证恢复 |

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么基于 UDP 不是 TCP | TCP 在中介（NAT/代理）中已有广泛支持，UDP 在操作系统/中间盒的"侵入"更少，允许用户空间协议栈自由迭代。QUIC 在用户空间实现（不像 TCP 在内核），部署升级不用等内核 |
| 为什么需要 ConnectionID | 解耦连接与 IP:Port，实现连接迁移。TCP 的连接标识是四元组（IP:Port × 2），QUIC 用 CID 标识，WiFi→4G 切换 IP 变但 CID 不变 |
| 为什么 Packet Number 单调递增不绕回 | 单调递增使 AEAD 的 Nonce 唯一，防重放。且每个包号唯一，ACK 不会歧义 |
| 为什么 0-RTT 有风险 | 0-RTT 数据可能被重放（服务端不能区分是否第一次），要求应用层对非幂等操作做防护 |
| 为什么不用 HTTP/2 的 HPACK | HPACK 依赖有序递交（引用前一个头部），QUIC 的流独立无顺序保障 → 改成 QPACK，编码器和解码器状态分开同步 |
| 为什么没有 TCP 的慢启动概念 | QUIC 也有拥塞控制（NewReno/CUBIC/BBR），只是把控制从内核移到用户空间，算法本身类似 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| QUIC 回退 TCP | 明明客户端支持 HTTP/3，却走 HTTP/2 或 1.1 | 抓 UDP 443 看一眼有没有 QUIC Initial 包 | 中间防火墙/代理拦截 UDP 443 |
| 0-RTT 被服务端拒绝 | 浏览器开发工具看到 HTTP 响应带 `Early-Data` 相关 Header | 看服务端日志 `quic_early_data_rejected` 计数 | 服务端重启/凭据过期/anti-replay |
| 连接迁移失败 | WiFi 切 4G 后应用卡死 | 抓包看是否有 PATH_CHALLENGE/PATH_RESPONSE | NAT 绑定超时/服务端不支持迁移 |
| 单向流阻塞 | 部分请求正常，部分卡住 | `tcpdump port 443` 查看是否有 RST_STREAM 帧 | 对等体流控 `MAX_STREAM_DATA` 耗尽 |
| Certificate 错误 | 连接一直 Initial 不会进 Handshake | 看 CRYPTO 帧数据长度异常 | 自签证书/中间代理篡改 |
| 丢包导致的尖峰延时 | RTT 偶尔从 20ms 跳到 200ms | `ss -in` 看 QUIC 连接 RTT | UDP 在中间路径被限速/丢包率高 |

```bash
# 检查 QUIC 是否需要回退到 TCP（抓初始包）
tcpdump -i any -nn 'udp port 443' -c 10 -X

# 看 QUIC 连接详情（Linux）
ss -in --family=inet | grep -A 5 quic

# Wireshark 过滤 QUIC
# quic or quic.initial || quic.handshake || quic.1rtt

# Nginx 检查 QUIC 是否启用
nginx -V 2>&1 | grep quic

# cURL 强制 HTTP/3
curl --http3 -I https://example.com
```

---

## 常用工具

```bash
# curl —— HTTP/3 测试
curl --http3 -o /dev/null -w "HTTP: %{http_version}\n" https://example.com

# qlog —— QUIC 日志分析（Chrome）
chrome://net-export/   # 导出 .json → qvis.quictools.info 可视化

# tcpdump —— 抓 QUIC 包
tcpdump -i eth0 -nn 'udp port 443'                      # 抓 QUIC 包
tcpdump -i eth0 -nn 'udp[0:2] = 0xc000'                 # 过滤 Long Header

# ss —— QUIC 连接状态
ss -in --family=inet | grep -A 10 quic

# 浏览器内置
chrome://webrtc-internals/                                # WebRTC + QUIC 调试
edge://net-internals/#quic                                # Edge QUIC 内部
```


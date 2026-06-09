# 协议栈全景图

> 总结 | 对比 | 选型决策 | 五种常见协议组合模式

---

## 分层全景

```
 7 应用层
┌─────────────────────────────────────────────────────────────────────────┐
│   HTTP/1.1  HTTP/2  HTTP/3  WebSocket  DNS  SMTP  POP3  IMAP  FTP      │
│   SSH  gRPC  AMQP  MQTT  SNMP  RTP/RTCP  RTSP  DHCP  NTP  SIP         │
├─────────────────────────────────────────────────────────────────────────┤
│ 6 表示层                                                                 │
│   TLS/SSL  DTLS                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ 5 会话层                                                                 │
│   SOCKS5  (TLS 握手隐含会话)                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ 4 传输层                                                                 │
│   TCP  (可靠/面向连接/流控)    UDP  (不可靠/无连接/低延迟)               │
│   QUIC (可靠+UDP/0-RTT/无队头阻塞)                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ 3 网络层                                                                 │
│   IPv4  IPv6  ICMP  ARP  IPSec  (路由/寻址)                             │
├─────────────────────────────────────────────────────────────────────────┤
│ 2 链路层                                                                 │
│   Ethernet  Wi-Fi  PPP  VLAN  MPLS                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ 1 物理层                                                                 │
│   光纤  铜缆  无线  卫星                                                │
└─────────────────────────────────────────────────────────────────────────┘

各层职责：
  物理层     → 比特流传输（电压/光/频率）
  链路层     → 帧封装、MAC 寻址、介质访问控制
  网络层     → 路由选路、逻辑编址（IP）
  传输层     → 端到端通信、可靠/不可靠选择
  会话+表示  → TLS 加密/解密、会话状态维护
  应用层     → 具体业务语义（WEB/邮件/文件/消息/流媒体...）
```

---

## 性能对比表

| 协议 | 典型端到端延迟 | 吞吐上限 | 头部开销 | 连接建立 | 队头阻塞 |
|------|---------------|---------|---------|---------|---------|
| UDP | <1ms（无握手） | 应用自控（可打满带宽） | 8B 固定 | 0 RTT | 无 |
| TCP | 1 RTT（握手）+ 慢启动 | cwnd 受限（BDP 瓶颈） | 20-60B | 1 RTT | TCP HOL |
| TLS 1.2 over TCP | 2 RTT（TCP + TLS 握手） | 同 TCP | TLS 记录 5B | 2 RTT | 同上 |
| TLS 1.3 over TCP | 1 RTT（TCP + TLS 合并） | 同上 | 同上 | 1 RTT | 同上 |
| QUIC / HTTP/3 | 0-RTT（恢复）~ 1-RTT（首次） | 无 TCP HOL，独立流重传 | QUIC 头部 ~15B | 0-1 RTT | 无 |
| HTTP/1.1 | 请求级排队 | 6 连接并行，HOL 严重 | 数百~数千 B（文本） | 每请求可能新建连接 | HTTP HOL |
| HTTP/2 | 多路复用，单连接 | 共享 cwnd，TCP HOL 拖累 | HPACK 1~数十字节 | 1 连接复用 | TCP HOL |
| gRPC | <= HTTP/2 延迟 | 同 HTTP/2 | 5B（Length-Prefixed） | 同 HTTP/2 | 同 HTTP/2 |
| WebSocket | 1 RTT（升级握手） | 全双工，无额外头 | ≤ 14B（掩码+帧头） | 1 RTT（HTTP 升级） | 无 |
| MQTT | 最低（2B 固定头） | 低带宽友好 | 2~14B | TCP 1 RTT | TCP HOL |
| AMQP | 中等 | 中高吞吐 | ~8B 帧头 + 属性 | TCP 1 RTT | TCP HOL |
| SNMP | 低（UDP 无握手） | 低（轮询模式，遍历慢） | ~30B + OID | 0 RTT（UDP） | 无 |
| DNS | 最低（UDP 单包） | 极高（缓存 + 任播） | ~12B 头部 | 0 RTT（UDP） | 无 |
| RTP/RTCP | <1ms（UDP） | 实时场景无节流 | 12B RTP 头 | 0 RTT（UDP） | 无 |

---

## 安全性对比表

| 协议 | 传输加密 | 身份认证 | 完整性校验 | 前向保密 | 防重放 | 推荐安全配置 |
|------|---------|---------|-----------|---------|-------|------------|
| HTTP（明文） | ❌ | ❌ | ❌ | ❌ | ❌ | 强制升级 HTTPS |
| HTTPS (TLS 1.3) | ✅ AES-GCM/ChaCha20 | ✅ 证书 X.509 | ✅ AEAD | ✅ ECDHE | ✅ | TLS 1.3 + HSTS |
| HTTP/3 (QUIC+TLS) | ✅ AES-GCM | ✅ 证书 | ✅ AEAD | ✅ | ✅ | QUIC v1 + TLS 1.3 |
| gRPC (TLS) | ✅ AES-GCM | ✅ 证书/Token | ✅ AEAD | ✅ | ✅ | mTLS + OAuth Token |
| gRPC (plaintext) | ❌ | ❌ | ❌ | ❌ | ❌ | 仅限内网开发 |
| WebSocket (wss) | ✅ | ✅ (TLS) | ✅ | ✅ | 取决于上层 | WSS only |
| WebSocket (ws) | ❌ | ❌ | ❌ | ❌ | ❌ | 禁用 |
| MQTTS | ✅ | ✅ (TLS/mTLS) | ✅ AEAD | ✅ | ✅ | mTLS + 客户端证书 |
| AMQPS | ✅ | ✅ | ✅ | ✅ | ✅ | mTLS |
| SNMPv3 (authPriv) | ✅ AES-128/256 | ✅ USM (SHA) | ✅ HMAC | ❌ | ✅ (EngineTime) | authPriv + SHA-256 |
| SNMPv1/v2c | ❌ | ❌ (明文 Community) | ❌ | ❌ | ❌ | 禁用，迁往 v3 |
| SSH-2 | ✅ (协商) | ✅ 公钥/密码 | ✅ HMAC | ✅ DH | ✅ | 禁用密码登录 + ed25519 |
| DNS (明文) | ❌ | ❌ | ❌ | ❌ | ❌ | 迁移 DoH/DoT |
| DoH (DNS over HTTPS) | ✅ | ❌（TLS 认证） | ✅ | ✅ | ✅ | 建议启用 |
| DTLS over UDP | ✅ AES-GCM | ✅ 证书/PSK | ✅ | ✅ | ✅ | DTLS 1.2+ |

---

## 选型决策树

```
需要可靠传输？
├── 是
│   ├── 延迟敏感？
│   │   ├── 是
│   │   │   ├── 需要多路复用 + 流式？
│   │   │   │   ├── 是 → 需要跨语言/代码生成？   → gRPC
│   │   │   │   │                               → HTTP/2
│   │   │   │   └── 否 → 双向实时？
│   │   │   │       ├── 是 → WebSocket (WSS)
│   │   │   │       └── 否 → TCP + TLS (自定义协议)
│   │   │   └── 否（可以接受 1-2 RTT 建立延迟）
│   │   │       └── 需要消息路由/发布订阅？
│   │   │           ├── 是 → 企业/多队列？ → AMQP
│   │   │           │                  → MQTT (轻量)
│   │   │           └── 否 → HTTP (Web API)
│   │   │               ├── REST 风格？  → HTTP/1.1
│   │   │               └── 高性能？     → HTTP/2
│   │   │
│   └── 否（可容忍慢启动或已用可靠传输）
│       └── 需要流式/推送？
│           ├── 是 → WebSocket / SSE
│           └── 否 → HTTP 标准
│
└── 否（UDP 可接受，应用层处理丢包）
    ├── 实时音视频？
    │   ├── 是 → 浏览器实时？ → WebRTC (SRTP+DTLS+ICE)
    │   │              → 自研流媒体？ → RTP/RTCP + SRTP
    │   └── 否 → 对延迟极敏感且允许 0-RTT？
    │       ├── 是 → 首连接后恢复？ → QUIC / HTTP/3
    │       │            → 仅 IoT 极简？ → MQTT-SN / CoAP
    │       └── 否 → 设备监控？
    │           ├── 是 → SNMP (轮询 + Trap)
    │           └── 否 → DNS / DHCP / NTP（专有场景）
    │
    ↓ 补充：需要安全层？
      ├── 基于 TCP → TLS
      ├── 基于 UDP → DTLS
      └── HTTP/3 → QUIC 内置 TLS 1.3
```

---

## 协议组合模式

### HTTPS = HTTP + TLS + TCP

```
应用数据 → HTTP 请求/响应
         → TLS 1.3 (AES-GCM + ECDHE)
         → TCP 可靠传输 (端口 443)
         → IP 路由
```

Web 基础，每台服务器必备。TLS 1.3 将握手从 2 RTT 降到 1 RTT。

### gRPC = Protobuf + HTTP/2 + TLS + TCP

```
应用数据 → Protobuf 序列化 (TLV 编码)
         → gRPC 帧 (5B Length-Prefixed)
         → HTTP/2 帧 (HEADERS + DATA + Trailers)
         → TLS 加密
         → TCP (端口 443/50051)
```

微服务间通信标准组合。Protobuf 保证 Schema 兼容，HTTP/2 保证多路复用，TLS 保证传输安全。

### WebRTC = SRTP + DTLS + ICE + UDP

```
音频/视频 → RTP/RTCP
          → SRTP 加密 (AES-GCM)
          → UDP 传输 (无丢包重传容忍)
          → ICE / STUN / TURN (NAT 穿透)
          → DTLS 密钥协商 (基于 UDP 的 TLS)
```

浏览器 P2P 实时通信。SRTP 加密媒体流，DTLS 协商密钥（内嵌在 ICE 流程中），ICE 穿透 NAT/防火墙。

### MQTTS = MQTT + TLS + TCP

```
IoT 消息 → MQTT 帧 (固定头 2B + 可变头 + 载荷)
         → TLS 加密 (mTLS 客户端证书认证）
         → TCP (端口 8883)
```

物联网/传感器安全通信。MQTT 极小头部 + 三种 QoS，TLS 保证端到端加密，客户端证书防设备伪造。

### HTTP/3 = HTTP + QUIC + UDP

```
Web 请求 → HTTP/3 帧 (QPACK 头部 + data)
         → QUIC 帧 (多路复用，独立流重传）
         → TLS 1.3 (内置)
         → UDP (端口 443)
```

下一代 Web。QUIC 将 TLS 内置在传输层握手阶段，0-RTT 恢复连接。单连接内每个流独立重传，解决 TCP 队头阻塞。

---

## 协议演进趋势

| 趋势 | 替代对象 | 驱动因素 |
|------|---------|---------|
| HTTP/3 (QUIC) → HTTP/2 | HTTP/2 | QUIC 消除 TCP 队头阻塞，0-RTT 连接恢复 |
| gRPC → REST/HTTP | REST/HTTP/1.1 | 微服务场景性能差 5-10x，无代码生成，无流式 |
| MQTT → HTTP for IoT | HTTP in IoT | HTTP 头部开销 500B+ vs MQTT 2B |
| TLS 1.3 → TLS 1.2 | TLS 1.2 | 1 RTT 握手 + 0 RTT 恢复，移除非安全密码套件 |
| DoH/DoT → 明文 DNS | DNS (UDP 53) | 隐私保护：防止 ISP/DNS 劫持、嗅探 |
| SNMPv3 → SNMPv1/v2c | SNMPv1/v2c | Community 明文密码 = 无安全，合规要求 |
| SSH key → 密码登录 | 密码登录 | 密钥免密 + 不可破解，ed25519 签名极快 |
| QUIC → TCP + TLS | TCP + TLS | 传输层创新：连接迁移、无 HOL、自定义拥塞控制 |

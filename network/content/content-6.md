# 第 6 章：TLS/SSL 协议

> **学习目标**：掌握 TLS 的握手流程、密码套件协商与加密通信机制
> **预计时长**：4 小时
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心概念

### 1.1 TLS 概述

TLS（Transport Layer Security）是 SSL 的继任者，为应用层协议提供加密、认证和完整性保护。当前广泛使用的版本为 TLS 1.2 和 TLS 1.3。

**TLS 的核心功能**：
- **加密（Encryption）**：防止窃听
- **认证（Authentication）**：验证对端身份（通常为服务器认证）
- **完整性（Integrity）**：防止数据篡改

```
协议栈位置：
┌───────────────────────────┐
│       应用层（HTTP等）     │
├───────────────────────────┤
│  ──→ TLS（安全层） ←──    │  ← 本章
├───────────────────────────┤
│       TCP（传输层）        │
├───────────────────────────┤
│       IP（网络层）         │
└───────────────────────────┘
```

### 1.2 TLS 版本演进

| 版本 | 年份 | 状态 | 关键改进 |
|------|------|------|----------|
| SSL 3.0 | 1996 | 已废弃 | - |
| TLS 1.0 | 1999 | 已废弃 | 基于 SSL 3.0 |
| TLS 1.1 | 2006 | 已废弃 | 防止 CBC 攻击 |
| TLS 1.2 | 2008 | 广泛使用 | SHA-256、AEAD |
| TLS 1.3 | 2018 | 推荐使用 | 1-RTT 握手、移除弱算法 |

---

## 2. 报文结构

### 2.1 TLS 记录层（Record Layer）

所有 TLS 数据都通过记录层封装：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  ContentType  |    Version    |            Length            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                          Fragment                             +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| **ContentType** | 8 bit | 20=ChangeCipherSpec, 21=Alert, 22=Handshake, 23=Application Data |
| **Version** | 16 bit | TLS 版本（0x0301=TLS 1.0, 0x0303=TLS 1.2） |
| **Length** | 16 bit | 载荷长度（最大 16384 + 2048） |
| **Fragment** | 可变 | 加密后的内容 |

### 2.2 Handshake 报文类型

| Type | 值 | 说明 |
|------|-----|------|
| ClientHello | 1 | 客户端发起握手 |
| ServerHello | 2 | 服务器响应 |
| Certificate | 11 | 服务器证书链 |
| ServerKeyExchange | 12 | 密钥交换参数 |
| CertificateRequest | 13 | 请求客户端证书 |
| ServerHelloDone | 14 | 服务器握手完成 |
| ClientKeyExchange | 16 | 客户端密钥交换参数 |
| CertificateVerify | 15 | 客户端证书验证 |
| Finished | 20 | 握手完成验证 |

---

## 3. 具体能力

### 3.1 TLS 1.2 握手流程（完整）

```
客户端                                    服务器

  ──── ClientHello ────→
    随机数C, 支持的密码套件列表,
    支持的压缩方法, 扩展(SNI,签名算法等)

  ←─── ServerHello ─────
    随机数S, 选定的密码套件,
    选定的压缩方法, 扩展

  ←─── Certificate ─────
    服务器证书链

  ←─── ServerKeyExchange ─────
    DH 参数+签名 (仅 DHE/ECDHE 时)

  ←─── ServerHelloDone ─────

  ──── ClientKeyExchange ────→
    Pre-Master Secret (RSA) 或
    DH 公钥 (DHE/ECDHE)

  ──── ChangeCipherSpec ────→
  ──── Finished ────→

  ←─── ChangeCipherSpec ─────
  ←─── Finished ─────

        应用数据加密传输
```

**密钥推导过程**：

```
Pre-Master Secret
        ↓
Master Secret = PRF(Pre-Master Secret, "master secret",
                    Random_C + Random_S)
        ↓
Key Block = PRF(Master Secret, "key expansion",
                Random_S + Random_C)
        ↓
┌──────────────────────────────────────┐
│ Client Write MAC Key │ Server Write MAC Key │
│ Client Write Key     │ Server Write Key     │
│ Client Write IV      │ Server Write IV      │
└──────────────────────────────────────┘
```

### 3.2 TLS 1.3 握手流程（1-RTT）

TLS 1.3 大幅简化握手，合并为 1-RTT：

```
客户端                                    服务器

  ──── ClientHello ────→
    随机数C, 支持的密码套件,
    key_share (ECDHE 公钥),
    supported_versions = TLS 1.3

  ←─── ServerHello ─────
    随机数S, 选定密码套件,
    key_share (ECDHE 公钥)

  ←─── EncryptedExtensions ─────
  ←─── Certificate ─────
  ←─── CertificateVerify ─────
  ←─── Finished ─────

  ──── Finished ────→

        应用数据加密传输
```

**TLS 1.3 关键改进**：
- **1-RTT 握手**：ServerHello 后即加密，省去 KeyExchange/CCS 两个 RTT
- **0-RTT 恢复**：使用 PSK 可在第一个报文携带应用数据
- **移除弱算法**：删除 RSA 密钥交换、CBC 模式、RC4、SHA-1、MD5
- **强制 PFS**：仅保留 ECDHE/DHE 密钥交换
- **合并消息**：EncryptedExtensions 替代多个扩展协商

### 3.3 密码套件

密码套件定义了 TLS 使用的算法组合：

**TLS 1.2 格式**：`TLS_密钥交换_认证_WITH_对称加密_消息认证`

```
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
     │      │         │        │     │
     │      │         │        │     └─ 伪随机函数
     │      │         │        └─────── 消息认证/AEAD
     │      │         └──────────────── 对称加密
     │      └────────────────────────── 认证算法
     └───────────────────────────────── 密钥交换算法
```

**TLS 1.3 简化**：仅定义对称加密套件（密钥交换固定为 ECDHE/DHE）

```
TLS_AES_128_GCM_SHA256
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256
TLS_AES_128_CCM_SHA256
TLS_AES_128_CCM_8_SHA256
```

### 3.4 证书链验证

```
根 CA（自签名，预置在浏览器/OS 中）
  └── 中间 CA
        └── 服务器证书

验证过程：
1. 服务器发送证书链 [服务器证书, 中间CA证书]
2. 客户端从服务器证书开始，逐级向上验证签名
3. 直到遇到信任锚（根 CA）
4. 检查证书有效期、用途、CRL/OCSP 吊销状态
```

### 3.5 密钥交换算法

| 算法 | PFS | 说明 |
|------|-----|------|
| RSA | ❌ | Pre-Master Secret 用服务器公钥加密，无前向保密 |
| DHE | ✅ | 临时 DH，每次握手生成新参数 |
| ECDHE | ✅ | 临时椭圆曲线 DH，性能更好 |

**前向保密（PFS）**：即使长期私钥泄露，历史会话密钥也无法被解密。TLS 1.3 强制 PFS。

### 3.6 AEAD 加密

TLS 1.3 仅使用 AEAD（Authenticated Encryption with Associated Data）模式：

```
AES-GCM：
  加密 + 认证一体，无需单独 MAC
  nonce = sequence_number XOR write_IV
  additional_data = 报文头(ContentType + Version + Length)

ChaCha20-Poly1305：
  流加密 + Poly1305 MAC
  适合无 AES 硬件加速的平台（移动端）
```

---

## 4. 报文样例

### 4.1 TLS 1.2 ClientHello

```
16 03 01 00 bd 01 00 00 b9 03 03
c0 a8 01 0a ... (32 bytes Random)
00
00 2e c0 2c c0 2b c0 0a c0 09 c0 30 c0 2f c0 14 c0 13
00 9e 00 9d 00 39 00 38 00 af 00 ae 00 33 00 32 00 9c
00 9b 00 3d 00 3c 00 2f 00 35 00 0a
01 00
00 00 00 ff 01 00 01 00
```

**逐字段解析**：

```
16          → ContentType=22 (Handshake)
03 01       → Version=TLS 1.0 (记录层版本)
00 bd       → Length=189
01          → Handshake Type=1 (ClientHello)
00 00 b9    → Length=185
03 03       → Client Version=TLS 1.2
c0 a8...   → Random (32 字节)
00          → Session ID Length=0 (无会话复用)
00 2e       → Cipher Suites Length=46
c0 2c ...  → 密码套件列表 (23 个)
01 00       → Compression Methods=1, null
00 00       → Extensions Length=0
```

### 4.2 TLS 1.3 ClientHello（关键差异）

```
16 03 01 00 fc 01 00 00 f8 03 03
... (32 bytes Random)
00
00 08 c0 2c c0 2b 13 01 13 02
01 00
00 c1 00 00 00 0b 00 09 08 03 04 03 03 03 02 03 01
00 33 00 47 00 45 00 1d 00 3e 00 39 ...
00 2b 00 03 02 03 04
```

**关键差异**：

```
密码套件中包含 TLS 1.3 套件：
13 01  → TLS_AES_128_GCM_SHA256
13 02  → TLS_AES_256_GCM_SHA384

supported_versions 扩展：
00 2b 00 03 02 03 04  → TLS 1.3 (0x0304)

key_share 扩展：
00 33 00 47 ...  → ECDHE X25519 公钥
```

### 4.3 TLS 1.3 ServerHello

```
16 03 03 00 5a 02 00 00 56 03 03
... (32 bytes Random)
00
13 01
00 00
00 2b 00 02 03 04
00 33 00 24 00 1d 00 20 ...
```

**逐字段解析**：

```
16          → ContentType=22 (Handshake)
03 03       → Version=TLS 1.2 (记录层，兼容性)
02          → Handshake Type=2 (ServerHello)
03 03       → Server Version=TLS 1.2 (兼容性)
13 01       → 选定密码套件=TLS_AES_128_GCM_SHA256
00 2b 00 02 03 04  → supported_versions=TLS 1.3
00 33 00 24 00 1d 00 20 ...  → key_share (ECDHE 公钥)
```

---

## 5. 深入一点

### TLS 会话恢复

**Session ID**：服务器返回 Session ID，客户端下次握手时携带，服务器恢复会话状态（TLS 1.2）。

**Session Ticket**：服务器加密会话状态发给客户端（类似 Cookie），服务器无需存储状态。TLS 1.3 的 PSK 模式基于此。

**TLS 1.3 0-RTT**：

```
客户端 ──→ ClientHello + Early Data (0-RTT)
          ←── ServerHello + ... + Application Data
```

0-RTT 数据无前向保密，且存在重放攻击风险，仅适用于幂等请求。

### ALPN 与 SNI

- **SNI（Server Name Indication）**：ClientHello 中携带目标域名，支持同一 IP 多证书（虚拟主机）
- **ALPN（Application-Layer Protocol Negotiation）**：协商应用层协议（如 h2, http/1.1）

---

## 参考资料

- [RFC 5246 - TLS 1.2](https://datatracker.ietf.org/doc/html/rfc5246)
- [RFC 8446 - TLS 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
- [RFC 6066 - TLS Extensions](https://datatracker.ietf.org/doc/html/rfc6066)
- [RFC 7301 - ALPN](https://datatracker.ietf.org/doc/html/rfc7301)

# 第 17 章：SSH 协议

> **学习目标**：掌握 SSH 的分层架构、密钥交换与端口转发机制
> **预计时长**：3 小时
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心概念

### 1.1 SSH 概述

SSH（Secure Shell）是加密的远程登录协议，替代明文的 Telnet/rsh。SSH 2.0 是当前标准版本。

**SSH 核心特性**：
- 全程加密（密钥交换、认证、数据传输）
- 支持多种认证方式（密码、公钥、键盘交互）
- 端口转发（本地/远程/动态）
- 文件传输（SFTP/SCP）
- 默认端口 22

### 1.2 SSH 分层架构

```
┌─────────────────────────────────────────┐
│  SSH Connection Layer                    │
│  ├── 会话（交互式 Shell）                │
│  ├── 远程命令执行                        │
│  ├── 端口转发                            │
│  └── 代理转发                            │
├─────────────────────────────────────────┤
│  SSH Authentication Layer                │
│  ├── 公钥认证                            │
│  ├── 密码认证                            │
│  └── 键盘交互认证                        │
├─────────────────────────────────────────┤
│  SSH Transport Layer                     │
│  ├── 算法协商                            │
│  ├── 密钥交换（Diffie-Hellman）         │
│  ├── 服务器认证                           │
│  └── 加密传输                            │
├─────────────────────────────────────────┤
│  TCP                                     │
└─────────────────────────────────────────┘
```

---

## 2. 报文结构

### 2.1 SSH 报文格式

SSH 传输层报文：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Packet Length        |   Padding Length  |   载荷     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          载荷（续）                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          随机填充                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          MAC                                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| **Packet Length** | 32 bit | 包长度（不含自身和 MAC） |
| **Padding Length** | 8 bit | 填充长度 |
| **Payload** | 可变 | 实际数据（含消息类型字节） |
| **Random Padding** | 可变 | 随机填充（防流量分析） |
| **MAC** | 可变 | 消息认证码 |

### 2.2 SSH 消息类型

| 类型 | 值 | 层次 | 说明 |
|------|-----|------|------|
| SSH_MSG_DISCONNECT | 1 | Transport | 断开连接 |
| SSH_MSG_IGNORE | 2 | Transport | 忽略 |
| SSH_MSG_KEXINIT | 20 | Transport | 密钥交换初始化 |
| SSH_MSG_NEWKEYS | 21 | Transport | 启用新密钥 |
| SSH_MSG_KEXDH_INIT | 30 | Transport | DH 初始化 |
| SSH_MSG_KEXDH_REPLY | 31 | Transport | DH 响应 |
| SSH_MSG_SERVICE_REQUEST | 5 | Auth | 请求服务 |
| SSH_MSG_USERAUTH_REQUEST | 50 | Auth | 认证请求 |
| SSH_MSG_USERAUTH_SUCCESS | 52 | Auth | 认证成功 |
| SSH_MSG_CHANNEL_OPEN | 90 | Connection | 打开通道 |
| SSH_MSG_CHANNEL_DATA | 94 | Connection | 通道数据 |

---

## 3. 具体能力

### 3.1 密钥交换

SSH 使用 Diffie-Hellman 密钥交换建立共享密钥：

```
客户端                                    服务器

  ──── SSH_MSG_KEXINIT ────→
    支持的算法列表

  ←─── SSH_MSG_KEXINIT ─────
    支持的算法列表

  [双方协商选定算法]

  ──── SSH_MSG_KEXDH_INIT ────→
    DH 公钥 e

  ←─── SSH_MSG_KEXDH_REPLY ─────
    DH 公钥 f + 服务器主机公钥 + 签名

  ──── SSH_MSG_NEWKEYS ────→
  ←─── SSH_MSG_NEWKEYS ─────
    [之后使用新密钥加密通信]
```

**密钥推导**：

```
共享密钥 K = DH(e, f)
Session ID = H(V_C || V_S || I_C || I_S || K_S || e || f || K)
  (首次交换的哈希值，之后不变)

加密密钥 = HASH(K || H || "A" || session_id)
MAC 密钥 = HASH(K || H || "B" || session_id)
IV = HASH(K || H || "C" || session_id)
```

### 3.2 公钥认证

```
1. 客户端发送: 用户名 + 公钥类型 + 公钥内容
2. 服务器检查: authorized_keys 中是否有该公钥
3. 服务器返回: 接受/拒绝
4. 客户端签名: 用私钥对 session_id 签名
5. 服务器验证签名
```

**密钥对生成**：

```
ssh-keygen -t ed25519    → Ed25519 (推荐)
ssh-keygen -t rsa -b 4096 → RSA 4096 bit
```

### 3.3 端口转发

**本地转发（Local Forward）**：

```
ssh -L 8080:internal-server:80 jump-server

客户端:8080 → jump-server → internal-server:80
```

访问本地 8080 端口，流量经 SSH 隧道到达 internal-server:80。

**远程转发（Remote Forward）**：

```
ssh -R 9090:localhost:8080 remote-server

remote-server:9090 → SSH 隧道 → 客户端 localhost:8080
```

**动态转发（Dynamic Forward / SOCKS 代理）**：

```
ssh -D 1080 jump-server

客户端配置 SOCKS5 代理: localhost:1080
所有流量经 SSH 隧道由 jump-server 转发
```

### 3.4 SFTP

SFTP 是 SSH 的子系统，提供文件传输功能：

```
SSH_MSG_CHANNEL_OPEN "session"
SSH_MSG_CHANNEL_REQUEST "subsystem" "sftp"
SSH_MSG_CHANNEL_DATA (SFTP 协议包)

SFTP 包格式:
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Length              |   Type    |   Request ID      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          Payload                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 3.5 SSH Agent

SSH Agent 管理私钥，避免每次输入密码：

```
1. ssh-agent 启动，监听 UNIX socket
2. ssh-add 将私钥加载到 agent
3. SSH 客户端通过 SSH_AUTH_SOCK 连接 agent
4. Agent 代为签名，私钥不离开 agent 内存
5. 支持代理转发（Agent Forwarding）
```

---

## 4. 报文样例

### 4.1 SSH 协议版本交换

```
53 53 48 2d 32 2e 30 2d 4f 70 65 6e 53 53 48 5f 39 2e 38 0d 0a
```

**结构化解析**：

```
SSH-2.0-OpenSSH_9.8\r\n
```

### 4.2 SSH_MSG_KEXINIT（密钥交换初始化）

```
14                          → Type=20 (KEXINIT)
aa bb cc dd ... (16 bytes)  → Cookie (随机)
0a 00 00 00 1c ...          → kex_algorithms (长度+列表)
00 00 00 0f ...             → server_host_key_algorithms
00 00 00 1e ...             → encryption_algorithms_client_to_server
...
00 00 00 00                 → first_kex_packet_follows=FALSE
00 00 00 00                 → reserved
```

**算法协商规则**：客户端按优先级列出算法，服务器选择第一个自己也支持的算法。

---

## 5. 深入一点

### SSH 安全最佳实践

- **禁用密码认证**：`PasswordAuthentication no`
- **禁用 root 登录**：`PermitRootLogin no`
- **使用 Ed25519 密钥**：比 RSA 更短更安全
- **限制算法**：禁用弱算法（如 ssh-dss、3des-cbc）
- **使用 fail2ban**：防止暴力破解

### SSH 跳板与 ProxyJump

```
ssh -J jump1,jump2 target-server

# 或在 ~/.ssh/config 中配置:
Host target
    ProxyJump jump1,jump2
```

---

## 参考资料

- [RFC 4250-4256 - The Secure Shell (SSH) Protocol Suite](https://datatracker.ietf.org/doc/html/rfc4250)
- [RFC 4251 - SSH Protocol Architecture](https://datatracker.ietf.org/doc/html/rfc4251)
- [RFC 4252 - SSH Authentication Protocol](https://datatracker.ietf.org/doc/html/rfc4252)
- [RFC 4254 - SSH Connection Protocol](https://datatracker.ietf.org/doc/html/rfc4254)

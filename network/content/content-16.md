# 第 16 章：FTP 协议

> **学习目标**：理解 FTP 双通道传输模型与主动/被动模式差异
> **预计时长**：2 小时
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

### 1.1 FTP 概述

FTP（File Transfer Protocol）是互联网最早的文件传输协议，使用双通道模型：命令通道（控制连接）+ 数据通道（数据连接）。

**FTP 核心特性**：
- 双通道：命令通道（端口 21）+ 数据通道（动态端口）
- 文本协议（命令通道）
- 支持断点续传
- 支持目录浏览和操作
- 默认端口 21（命令）、20（主动模式数据）

```
FTP 双通道模型：
┌──────────────┐              ┌──────────────┐
│   FTP 客户端  │              │   FTP 服务器  │
│              │  命令通道     │              │
│              │─────────────→│  端口 21     │
│              │  (持久连接)   │              │
│              │              │              │
│              │  数据通道     │              │
│              │←────────────→│  动态端口     │
│              │  (每次传输)   │              │
└──────────────┘              └──────────────┘
```

---

## 2. 报文结构

### 2.1 FTP 命令

命令格式：`命令名 SP 参数 CRLF`

| 命令 | 语法 | 说明 |
|------|------|------|
| USER | `USER username` | 用户名 |
| PASS | `PASS password` | 密码 |
| SYST | `SYST` | 查询系统类型 |
| PWD | `PWD` | 当前目录 |
| CWD | `CWD dirname` | 切换目录 |
| MKD | `MKD dirname` | 创建目录 |
| RMD | `RMD dirname` | 删除目录 |
| LIST | `LIST [path]` | 列出目录 |
| RETR | `RETR filename` | 下载文件 |
| STOR | `STOR filename` | 上传文件 |
| DELE | `DELE filename` | 删除文件 |
| TYPE | `TYPE A/I` | 传输类型（ASCII/Binary） |
| PASV | `PASV` | 进入被动模式 |
| PORT | `PORT h1,h2,h3,h4,p1,p2` | 指定数据端口（主动模式） |
| REST | `REST offset` | 设置续传偏移量 |
| SIZE | `SIZE filename` | 查询文件大小 |
| QUIT | `QUIT` | 退出 |

### 2.2 FTP 响应

响应格式：`3位状态码-空格/连字符-文本描述 CRLF`

| 状态码 | 类别 | 示例 |
|--------|------|------|
| 1xx | 肯定初步回复 | 150 Opening data connection |
| 2xx | 肯定完成回复 | 226 Transfer complete |
| 3xx | 肯定中间回复 | 331 Password required |
| 4xx | 临时否定完成 | 425 Can't open data connection |
| 5xx | 永久否定完成 | 530 Not logged in |

---

## 3. 具体能力

### 3.1 主动模式（PORT）

服务器主动连接客户端的数据端口：

```
1. 客户端连接服务器 21 端口（命令通道）
2. 客户端发送 PORT 192,168,1,10,19,136
   → 数据连接目标: 192.168.1.10:5000 (19×256+136)
3. 服务器从 20 端口连接客户端 5000 端口
4. 数据传输完成后关闭数据连接
```

**问题**：客户端防火墙通常阻止外部连入，导致主动模式失败。

### 3.2 被动模式（PASV）

客户端主动连接服务器的数据端口：

```
1. 客户端连接服务器 21 端口（命令通道）
2. 客户端发送 PASV
3. 服务器回复 227 Entering Passive Mode (192,168,1,1,15,200)
   → 数据连接目标: 192.168.1.1:4000 (15×256+200)
4. 客户端连接服务器 4000 端口
5. 数据传输完成后关闭数据连接
```

**PASV 响应端口计算**：`p1 × 256 + p2`

**优势**：客户端主动连接，不受客户端防火墙限制。现代 FTP 默认使用被动模式。

### 3.3 断点续传

```
--- 下载续传 ---
C: SIZE largefile.zip
S: 213 10485760
C: REST 5000000
S: 350 Restarting at 5000000
C: RETR largefile.zip
S: 150 Opening data connection
[从 5000000 字节处继续传输]

--- 上传续传 ---
C: SIZE largefile.zip
S: 213 5000000
C: REST 5000000
S: 350 Restarting at 5000000
C: APPE largefile.zip
S: 150 Opening data connection
[从 5000000 字节处追加传输]
```

### 3.4 匿名登录

```
C: USER anonymous
S: 331 Anonymous access allowed, send email as password
C: PASS guest@example.com
S: 230 Logged in
```

匿名 FTP 通常提供只读访问，密码习惯上填写邮箱地址。

---

## 4. 报文样例

### 4.1 完整 FTP 会话

```
C: [连接 21 端口]
S: 220 FTP Server ready\r\n
C: USER alice\r\n
S: 331 Password required for alice\r\n
C: PASS password123\r\n
S: 230 User alice logged in\r\n
C: SYST\r\n
S: 215 UNIX Type: L8\r\n
C: PWD\r\n
S: 257 "/home/alice" is current directory\r\n
C: TYPE I\r\n
S: 200 Type set to I\r\n
C: PASV\r\n
S: 227 Entering Passive Mode (192,168,1,1,15,200)\r\n
C: LIST\r\n
S: 150 Opening ASCII mode data connection\r\n
[目录列表数据]
S: 226 Transfer complete\r\n
C: QUIT\r\n
S: 221 Goodbye\r\n
```

### 4.2 PORT 命令十六进制

```
50 4f 52 54 20 31 39 32 2c 31 36 38 2c 31 2c 31 30 2c 31 39 2c 31 33 36 0d 0a
```

**结构化解析**：

```
PORT 192,168,1,10,19,136\r\n
→ IP: 192.168.1.10, Port: 19×256+136 = 5000
```

---

## 5. 深入一点

### FTP 与 NAT/Firewall

FTP 的双通道模型在 NAT/防火墙环境下问题严重：
- **主动模式**：服务器连入客户端，被客户端防火墙阻止
- **被动模式**：服务器开放随机端口，被服务器防火墙阻止
- **解决方案**：FTP ALG（应用层网关）动态开放端口，或使用固定 PASV 端口范围

### FTPS vs SFTP

| 协议 | 加密方式 | 端口 | 说明 |
|------|---------|------|------|
| FTPS | TLS/SSL | 990/989 | FTP + TLS（仍为双通道） |
| SFTP | SSH | 22 | SSH 子系统（单通道，完全不同协议） |

SFTP 不是 FTP 的加密版本，而是完全独立的基于 SSH 的文件传输协议，更安全且更容易穿越防火墙。

---

## 参考资料

- [RFC 959 - File Transfer Protocol](https://datatracker.ietf.org/doc/html/rfc959)
- [RFC 4217 - Securing FTP with TLS](https://datatracker.ietf.org/doc/html/rfc4217)

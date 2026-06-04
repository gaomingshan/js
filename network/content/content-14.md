# 第 14 章：SMTP 协议

> **学习目标**：理解邮件发送的交互流程与认证加密机制
> **预计时长**：2 小时
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

### 1.1 SMTP 概述

SMTP（Simple Mail Transfer Protocol）是互联网邮件发送的标准协议，负责将邮件从客户端推送到服务器，以及在服务器之间中继邮件。

**SMTP 核心特性**：
- 文本协议，命令-响应模式
- 推送协议（发送端主动连接接收端）
- 默认端口 25（明文）、587（提交+STARTTLS）、465（SMTPS 隐式 TLS）
- 仅负责发送，接收使用 POP3 或 IMAP

```
邮件传输路径：
发件人 → MUA → MSA → MTA → ... → MTA → MDA → MUA(收件人)

MUA: Mail User Agent (邮件客户端)
MSA: Mail Submission Agent (提交代理, 端口587)
MTA: Mail Transfer Agent (传输代理, 端口25)
MDA: Mail Delivery Agent (投递代理)
```

---

## 2. 报文结构

### 2.1 SMTP 命令

| 命令 | 语法 | 说明 |
|------|------|------|
| EHLO | `EHLO domain` | 扩展握手（替代 HELO） |
| HELO | `HELO domain` | 基本握手 |
| MAIL | `MAIL FROM:<sender>` | 指定发件人 |
| RCPT | `RCPT TO:<recipient>` | 指定收件人（可多次） |
| DATA | `DATA` | 开始传输邮件内容 |
| RSET | `RSET` | 重置会话 |
| NOOP | `NOOP` | 空操作（保活） |
| QUIT | `QUIT` | 结束会话 |
| AUTH | `AUTH mechanism` | 认证 |
| STARTTLS | `STARTTLS` | 升级为 TLS 连接 |

### 2.2 SMTP 响应

响应格式：`3位状态码 空格 文本描述`

| 状态码 | 类别 | 示例 |
|--------|------|------|
| 2xx | 成功 | 220 Ready, 250 OK |
| 3xx | 继续等待 | 354 Start mail input |
| 4xx | 临时失败 | 450 Mailbox unavailable |
| 5xx | 永久失败 | 550 User not found |

---

## 3. 具体能力

### 3.1 完整邮件发送流程

```
C: [连接服务器端口 587]
S: 220 smtp.example.com ESMTP ready
C: EHLO client.example.com
S: 250-smtp.example.com Hello
S: 250-SIZE 10485760
S: 250-AUTH LOGIN PLAIN
S: 250-STARTTLS
S: 250 8BITMIME
C: STARTTLS
S: 220 Ready to start TLS
[TLS 握手]
C: EHLO client.example.com
S: 250-AUTH LOGIN PLAIN
C: AUTH LOGIN
S: 334 VXNlcm5hbWU6          (Base64: "Username:")
C: dXNlckBleGFtcGxlLmNvbQ==  (Base64: "user@example.com")
S: 334 UGFzc3dvcmQ6          (Base64: "Password:")
C: cGFzc3dvcmQ=              (Base64: "password")
S: 235 Authentication successful
C: MAIL FROM:<sender@example.com>
S: 250 OK
C: RCPT TO:<recipient@example.com>
S: 250 OK
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: From: sender@example.com
C: To: recipient@example.com
C: Subject: Hello
C:
C: This is a test email.
C: .
S: 250 OK: Message accepted
C: QUIT
S: 221 Bye
```

### 3.2 SMTP AUTH

认证机制防止开放中继（Open Relay）：

| 机制 | 说明 |
|------|------|
| PLAIN | 明文发送用户名密码（Base64 编码，非加密） |
| LOGIN | 分步发送用户名和密码（Base64） |
| CRAM-MD5 | 挑战-响应，密码不明文传输 |
| XOAUTH2 | OAuth 2.0 令牌认证 |

**注意**：PLAIN/LOGIN 必须在 TLS 加密通道中使用，否则凭据暴露。

### 3.3 STARTTLS

将已有明文连接升级为加密连接：

```
1. 客户端连接服务器（明文）
2. 客户端发送 STARTTLS
3. 服务器回复 220
4. 双方进行 TLS 握手
5. 之后的通信全部加密
6. 客户端重新发送 EHLO（获取 TLS 后的扩展列表）
```

### 3.4 邮件中继

MTA 之间的邮件转发：

```
发送端 MTA → DNS 查询 MX 记录 → 找到目标 MTA → SMTP 传输
```

MX 记录指定邮件服务器及优先级：

```
example.com.  IN  MX  10  mail1.example.com.
example.com.  IN  MX  20  mail2.example.com.
```

优先级数值越小越优先，10 优先于 20。

---

## 4. 报文样例

### 4.1 SMTP 会话原始报文（十六进制片段）

```
32 32 30 20 73 6d 74 70 2e 65 78 61 6d 70 6c 65
2e 63 6f 6d 20 45 53 4d 54 50 20 72 65 61 64 79
0d 0a
```

**结构化解析**：

```
220 smtp.example.com ESMTP ready\r\n
```

### 4.2 DATA 阶段邮件内容

```
46 72 6f 6d 3a 20 73 65 6e 64 65 72 40 65 78 61 6d 70 6c 65 2e 63 6f 6d 0d 0a
54 6f 3a 20 72 65 63 69 70 69 65 6e 74 40 65 78 61 6d 70 6c 65 2e 63 6f 6d 0d 0a
53 75 62 6a 65 63 74 3a 20 48 65 6c 6c 6f 0d 0a
0d 0a
54 68 69 73 20 69 73 20 61 20 74 65 73 74 20 65 6d 61 69 6c 2e 0d 0a
2e 0d 0a
```

**结构化解析**：

```
From: sender@example.com\r\n
To: recipient@example.com\r\n
Subject: Hello\r\n
\r\n
This is a test email.\r\n
.\r\n
```

**结束标记**：单独一行 `.\r\n`（CRLF.CRLF）标识 DATA 结束。若邮件内容含 `.` 开头行，需加前缀 `..`（点填充）。

---

## 5. 深入一点

### SPF / DKIM / DMARC

防止发件人伪造的三层机制：

- **SPF**：DNS 记录指定哪些 IP 可代表该域名发邮件
- **DKIM**：邮件头部添加数字签名，接收端验证
- **DMARC**：基于 SPF/DKIM 结果制定策略（拒绝/隔离/无动作）+ 报告

### SMTP 与 8BITMIME

原始 SMTP 仅支持 7-bit ASCII。8BITMIME 扩展允许 8-bit 数据传输，但 MIME 编码（Base64/Quoted-Printable）仍是处理二进制附件的标准方式。

---

## 参考资料

- [RFC 5321 - Simple Mail Transfer Protocol](https://datatracker.ietf.org/doc/html/rfc5321)
- [RFC 3207 - SMTP Service Extension for STARTTLS](https://datatracker.ietf.org/doc/html/rfc3207)
- [RFC 4954 - SMTP Service Extension for Authentication](https://datatracker.ietf.org/doc/html/rfc4954)
- [RFC 7208 - Sender Policy Framework (SPF)](https://datatracker.ietf.org/doc/html/rfc7208)
- [RFC 6376 - DKIM](https://datatracker.ietf.org/doc/html/rfc6376)

# SMTP 简单邮件传输协议

> 应用层 | 命令-响应 | 推送 | 端口 25/587/465

---

## 报文结构

SMTP 是文本协议，命令/响应均为可读 ASCII。

### 命令

| 命令 | 语法 | 说明 |
|------|------|------|
| EHLO | `EHLO domain` | 扩展握手，返回服务器能力列表 |
| HELO | `HELO domain` | 基本握手（EHLO 失败时降级） |
| MAIL | `MAIL FROM:<sender>` | 指定发件人（信封发件人） |
| RCPT | `RCPT TO:<recipient>` | 指定收件人，可重复使用 |
| DATA | `DATA` | 开始传输邮件正文 |
| RSET | `RSET` | 重置会话，撤销已提交的 MAIL/RCPT |
| NOOP | `NOOP` | 空操作，保活探测 |
| QUIT | `QUIT` | 结束会话 |
| AUTH | `AUTH mechanism [initial]` | SASL 认证 |
| STARTTLS | `STARTTLS` | 将明文连接升级为 TLS |
| SIZE | `SIZE=` | EHLO 能力参数，声明最大可接受大小 |

### 响应

格式：`3 位状态码 SP 文本描述 CRLF`

| 码段 | 含义 | 示例 |
|------|------|------|
| 2xx | 成功 | 220 Ready, 250 OK, 235 Auth OK |
| 3xx | 等待继续 | 354 Start mail input |
| 4xx | 临时失败（可重试） | 450 Mailbox busy, 452 Insufficient storage |
| 5xx | 永久失败（不重试） | 550 User unknown, 554 Relay denied |

多行响应：状态码后接 `-`（连字符），末行空格：

```
250-smtp.example.com Hello
250-SIZE 10485760
250-AUTH LOGIN PLAIN
250 8BITMIME
```

---

## 核心能力

### 1. 邮件发送流程

为什么：发件人→MUA→MTA→MDA→收件人，SMTP 是推入服务器的唯一路径。

```
MUA (Outlook/Thunderbird)       MSA (提交代理)          MTA (传输代理)         MDA (投递代理)
       │                           │                       │                       │
       │──连接 587────────────────→│                       │                       │
       │  EHLO client.com         │                       │                       │
       │← 250-AUTH LOGIN          │                       │                       │
       │  AUTH LOGIN              │                       │                       │
       │← 235 Authenticated       │                       │                       │
       │  MAIL FROM:<alice@a.com> │                       │                       │
       │← 250 OK                  │                       │                       │
       │  RCPT TO:<bob@b.com>     │                       │                       │
       │← 250 OK                  │                       │                       │
       │  DATA                    │                       │                       │
       │← 354 Start mail input    │                       │                       │
       │  (邮件正文...)           │                       │                       │
       │  .                       │                       │                       │
       │← 250 Accepted            │                       │                       │
       │                          │──(本域名?)→ 是→ MDA ──→ 放入 bob 邮箱         │
       │                          │──(其他域名)─→ MTA ──→ MX 查询 ──→ 目标 MTA    │
```

- MSA (端口 587) 负责客户端提交，要求认证
- MTA (端口 25) 负责服务器间中继，通常不要求认证
- DATA 以 `.` 单独一行结束（CRLF.CRLF）；邮件正文含 `.` 开头行需转义为 `..`

---

### 2. SMTP AUTH

为什么：早期 SMTP 无认证，任何人都可发信，导致开放中继被滥用发送垃圾邮件。

```
明文连接 → AUTH LOGIN(明文BASE64) → 密码暴露 ×
TLS 连接 → AUTH LOGIN/PLAIN       → 加密传输 ✓
```

| 机制 | 传输方式 | 安全要求 |
|------|----------|----------|
| PLAIN  | 用户名+密码合为一行 Base64 | **必须** TLS |
| LOGIN  | 分两步发用户名→密码 Base64 | **必须** TLS |
| CRAM-MD5 | 挑战-响应，密码不在线传输 | 可明文，但 TLS 仍推荐 |
| XOAUTH2 | OAuth 2.0 Bearer Token | 必须 TLS |

- 服务器在 EHLO 返回中声明支持的机制：`250-AUTH LOGIN PLAIN CRAM-MD5`
- 客户端优先选择最强的共同机制

---

### 3. STARTTLS

为什么：SMTP 最初明文传输，邮件内容/密码暴露。不能直接上 465 隐式 TLS 时用 STARTTLS 升级。

```
Client                               Server
  │                                     │
  │── 明文连接 ───────────────────────→│  端口 25 或 587
  │── EHLO ──────────────────────────→│
  │← 250-STARTTLS                     │  看能力列表
  │── STARTTLS ──────────────────────→│
  │← 220 Ready to start TLS           │
  │══════ TLS 握手 =══════════════════│
  │── EHLO (加密后) ─────────────────→│  重新获取加密后的能力
  │── MAIL FROM / RCPT TO / DATA ────→│  全部加密
```

- 端口 25：通常禁止 STARTTLS 后认证（防未授权中继）
- 端口 587：STARTTLS 后强制 AUTH
- 端口 465：隐式 TLS，连接即加密，无明文阶段

---

### 4. 邮件中继

为什么：`alice@a.com` 发给 `bob@b.com`，发件方的 MTA 必须找到对方的 MTA 并转发。

```
发件 MTA → DNS MX 查询 → 目标 MTA → MDA

MX 记录：
a.com.  IN MX 10 mail.a.com.
b.com.  IN MX 10 mail.b.com.
         IN MX 20 backup.b.com.   ← 备选优先级
```

- 查询目标域名 MX 记录，选优先级最低（数值最小）的
- 连接到目标 MTA 的端口 25，用 SMTP 传送邮件
- 4xx 临时失败 → 排队重试（通常 5 天）
- 5xx 永久失败 → 退回发件人（生成退信）

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 25 默认不带认证 | 25 是 MTA→MTA 中继，可信服务器间不需要认证；客户端提交不应直接上 25 |
| 为什么要有 587 提交端口 | 25 被 ISP/云厂商默认封锁（防垃圾邮件），587 是客户端专用，强制认证+STARTTLS |
| 为什么 465 后来废弃又重启用 | 最初是微软搞的隐式 TLS（SMTPS），RFC 废止后因生态无法迁移又回归，现作 587 的备选 |
| 为什么信封地址 ≠ From 头 | 信封（MAIL FROM）用于退信，Header（From）供显示；伪造 From 很简单，所以需要 SPF/DKIM |
| 为什么需要 . 转义 | DATA 不知道何时结束，用 `.` 单独一行标记结束；正文中含 `.` 开头必须填充 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|----------|
| AUTH 失败 | `535 Authentication failed` | 检查用户名密码，确认 TLS 已建立 | 密码错误 / 未 TLS / 账号限制 |
| 中继拒绝 | `554 Relay denied` | 发件人域名是否受信 | MSA 需 AUTH，MTA 需合法域名 |
| 连接超时 | 客户端挂住 | `telnet smtp.example.com 25` 测试连通 | 端口 25 被 ISP 封 / 防火墙 |
| 退信 | 收到 NDR | 查看退信 5xx 码 | 收件人不存在 / 邮箱满 / 被拒 |
| 垃圾邮件标记 | 邮件进了垃圾箱 | 检查 SPF/DKIM/DMARC 配置 | 发件域名无认证，接收方降级 |
| 队列堆积 | 邮件延迟到达 | `mailq` 看队列 | 目标 MTA 不可达 / 反解失败 |

---

## 常用工具

```bash
# telnet 手动模拟 SMTP 会话
telnet smtp.example.com 25
EHLO test.com
MAIL FROM:<alice@test.com>
RCPT TO:<bob@example.com>
DATA
Subject: test
.
QUIT

# 带 TLS 的交互测试（openssl）
openssl s_client -connect smtp.example.com:465 -crlf
openssl s_client -starttls smtp -connect smtp.example.com:587 -crlf

# 查看 MX 记录
nslookup -type=mx example.com
dig example.com MX

# 检查队列
mailq
postqueue -p

# 抓包看 SMTP 交互
tcpdump -i any -nn -A 'tcp port 25 or port 587'

# SPF 检查
dig example.com TXT | grep spf
```

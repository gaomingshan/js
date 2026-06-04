# 第 15 章：POP3/IMAP 协议

> **学习目标**：对比两种邮件接收协议的差异，掌握各自的交互流程
> **预计时长**：2 小时
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

### 1.1 POP3 vs IMAP 对比

| 特性 | POP3 | IMAP |
|------|------|------|
| **全称** | Post Office Protocol v3 | Internet Message Access Protocol |
| **端口** | 110/995(POP3S) | 143/993(IMAPS) |
| **模式** | 下载并删除 | 同步访问 |
| **邮件存储** | 客户端本地 | 服务器端 |
| **多设备** | 不支持（邮件只在一台设备） | 支持（所有设备同步） |
| **文件夹** | 仅收件箱 | 服务器端文件夹 |
| **离线访问** | 完全支持 | 需先缓存 |
| **流量** | 下载所有邮件 | 按需下载（可仅头部） |
| **适合** | 单设备、低存储 | 多设备、大邮箱 |

---

## 2. POP3 协议

### 2.1 POP3 命令

| 命令 | 语法 | 说明 |
|------|------|------|
| USER | `USER username` | 用户名 |
| PASS | `PASS password` | 密码 |
| STAT | `STAT` | 邮件统计（数量+总大小） |
| LIST | `LIST [msg]` | 列出邮件（编号+大小） |
| RETR | `RETR msg` | 下载指定邮件 |
| DELE | `DELE msg` | 标记删除 |
| NOOP | `NOOP` | 空操作 |
| RSET | `RSET` | 重置（取消所有删除标记） |
| QUIT | `QUIT` | 提交删除并退出 |
| TOP | `TOP msg n` | 下载邮件前 n 行 |
| UIDL | `UIDL [msg]` | 获取邮件唯一 ID |

### 2.2 POP3 会话流程

```
C: [连接端口 110]
S: +OK POP3 server ready
C: USER alice@example.com
S: +OK
C: PASS password123
S: +OK Authentication successful
C: STAT
S: +OK 3 15000           (3封邮件, 共15000字节)
C: LIST
S: +OK 3 messages
S: 1 5000
S: 2 6000
S: 3 4000
S: .
C: RETR 1
S: +OK 5000 octets
S: [邮件完整内容]
S: .
C: DELE 1
S: +OK Message 1 deleted
C: QUIT
S: +OK Goodbye
```

### 2.3 POP3 两种模式

- **下载并删除**：RETR 后 DELE，邮件仅保留在本地
- **下载并保留**：RETR 后不 DELE，服务器保留邮件副本（需客户端通过 UIDL 去重）

---

## 3. IMAP 协议

### 3.1 IMAP 命令

IMAP 命令需要标签（tag）前缀，用于匹配请求和响应：

| 命令 | 语法 | 说明 |
|------|------|------|
| CAPABILITY | `a001 CAPABILITY` | 查询服务器能力 |
| LOGIN | `a002 LOGIN user pass` | 登录 |
| SELECT | `a003 SELECT INBOX` | 选择文件夹 |
| EXAMINE | `a004 EXAMINE INBOX` | 只读选择 |
| FETCH | `a005 FETCH 1 BODY[]` | 获取邮件内容 |
| SEARCH | `a006 SEARCH UNSEEN` | 搜索邮件 |
| STORE | `a007 STORE 1 +FLAGS \Seen` | 设置邮件标志 |
| COPY | `a008 COPY 1 Archive` | 复制邮件到文件夹 |
| CREATE | `a009 CREATE Archive` | 创建文件夹 |
| DELETE | `a010 DELETE Archive` | 删除文件夹 |
| RENAME | `a011 RENAME Old New` | 重命名文件夹 |
| SUBSCRIBE | `a012 SUBSCRIBE Archive` | 订阅文件夹 |
| LIST | `a013 LIST "" *` | 列出文件夹 |
| EXPUNGE | `a014 EXPUNGE` | 永久删除已标记邮件 |
| IDLE | `a015 IDLE` | 进入空闲等待推送 |
| LOGOUT | `a016 LOGOUT` | 退出 |

### 3.2 IMAP 会话流程

```
C: [连接端口 143]
S: * OK IMAP4rev1 server ready
C: a001 CAPABILITY
S: * CAPABILITY IMAP4rev1 IDLE NAMESPACE SORT
S: a001 OK CAPABILITY completed
C: a002 LOGIN alice password123
S: a002 OK LOGIN completed
C: a003 SELECT INBOX
S: * 3 EXISTS
S: * 1 RECENT
S: * FLAGS (\Seen \Answered \Flagged \Deleted)
S: a003 OK SELECT completed
C: a004 SEARCH UNSEEN
S: * SEARCH 2 3
S: a004 OK SEARCH completed
C: a005 FETCH 2 (BODY[HEADER.FIELDS (FROM SUBJECT DATE)])
S: * 2 FETCH (BODY[HEADER.FIELDS (FROM SUBJECT DATE)] {68}
S: From: bob@example.com
S: Subject: Meeting
S: Date: Mon, 1 Jan 2025 10:00:00 +0800
S: )
S: a005 OK FETCH completed
C: a006 LOGOUT
S: * BYE IMAP4rev1 server logging out
S: a006 OK LOGOUT completed
```

### 3.3 IDLE 推送

IMAP IDLE 实现服务器推送通知：

```
C: a010 IDLE
S: + idling
[等待...]
S: * 4 EXISTS           (新邮件到达!)
C: DONE
S: a010 OK IDLE terminated
```

客户端进入 IDLE 状态后，服务器在新邮件到达时主动通知，无需客户端轮询。

### 3.4 IMAP 部分获取

IMAP 可仅获取邮件的部分内容，节省带宽：

```
FETCH 1 BODY[HEADER]                    → 仅头部
FETCH 1 BODY[1]                         → 第一个 MIME 部分
FETCH 1 BODY[1.MIME]                    → 第一个部分的 MIME 头部
FETCH 1 BODYSTRUCTURE                   → MIME 结构（不下载内容）
FETCH 1 (BODY[HEADER.FIELDS (SUBJECT)]) → 仅 Subject 头部
```

---

## 4. 报文样例

### 4.1 POP3 认证与下载（十六进制片段）

```
2b 4f 4b 20 50 4f 50 33 20 73 65 72 76 65 72 20 72 65 61 64 79 0d 0a
```

**结构化解析**：

```
+OK POP3 server ready\r\n
```

### 4.2 IMAP CAPABILITY 响应

```
2a 20 43 41 50 41 42 49 4c 49 54 59 20 49 4d 41 50 34 72 65 76 31
20 49 44 4c 45 20 4e 41 4d 45 53 50 41 43 45 20 53 4f 52 54 0d 0a
```

**结构化解析**：

```
* CAPABILITY IMAP4rev1 IDLE NAMESPACE SORT\r\n
```

---

## 5. 深入一点

### AUTHENTICATE 机制

POP3 和 IMAP 均支持 SASL 认证：

```
POP3:  AUTH PLAIN dXNlcgBwYXNz
IMAP:  a001 AUTHENTICATE PLAIN dXNlcgBwYXNz
```

推荐使用 CRAM-MD5 或 OAuth 2.0，避免明文传输密码。

### 邮件同步策略

IMAP 的同步机制：
- **UIDVALIDITY + UID**：唯一标识邮件，跨会话稳定
- **MODSEQ**：修改序列号，增量同步（CONDSTORE 扩展）
- **VANISHED**：高效通知已删除邮件（QRESYNC 扩展）

---

## 参考资料

- [RFC 1939 - Post Office Protocol - Version 3](https://datatracker.ietf.org/doc/html/rfc1939)
- [RFC 3501 - INTERNET MESSAGE ACCESS PROTOCOL - VERSION 4rev1](https://datatracker.ietf.org/doc/html/rfc3501)
- [RFC 2177 - IMAP4 IDLE command](https://datatracker.ietf.org/doc/html/rfc2177)
- [RFC 5092 - IMAP URL Scheme](https://datatracker.ietf.org/doc/html/rfc5092)

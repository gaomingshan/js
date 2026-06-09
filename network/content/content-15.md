# POP3 / IMAP 邮件接收协议

> 应用层 | 命令-响应 | 拉取 | POP3:110/995 | IMAP:143/993

---

## 报文结构

两者均为文本命令/响应协议，区别是 IMAP 每个命令带标签。

### POP3 命令

| 命令 | 语法 | 说明 |
|------|------|------|
| USER | `USER name` | 用户名 |
| PASS | `PASS pass` | 密码 |
| STAT | `STAT` | 邮件总数 + 总大小 |
| LIST | `LIST [msg]` | 列出编号→大小 |
| RETR | `RETR msg` | 下载指定邮件 |
| DELE | `DELE msg` | 标记删除（QUIT 时生效） |
| RSET | `RSET` | 取消所有 DELE 标记 |
| TOP | `TOP msg n` | 下载前 n 行（检查邮件摘要） |
| UIDL | `UIDL [msg]` | 唯一标识符，用于去重 |
| NOOP | `NOOP` | 空操作 |
| QUIT | `QUIT` | 提交删除 + 退出 |

响应：`+OK` 成功 / `-ERR` 失败，多行响应以 `.` 结束。

### IMAP 命令

格式：`tag 命令 [参数] CRLF`

| 命令 | 语法 | 说明 |
|------|------|------|
| LOGIN | `a1 LOGIN user pass` | 登录 |
| CAPABILITY | `a2 CAPABILITY` | 服务器能力 |
| SELECT | `a3 SELECT INBOX` | 选择文件夹（读写） |
| EXAMINE | `a4 EXAMINE INBOX` | 只读选择 |
| FETCH | `a5 FETCH 1 BODY[]` | 获取邮件内容 |
| SEARCH | `a6 SEARCH UNSEEN` | 搜索 |
| STORE | `a7 STORE 1 +FLAGS \Seen` | 修改标志 |
| COPY | `a8 COPY 1 Archive` | 复制到其他文件夹 |
| CREATE | `a9 CREATE Archive` | 创建文件夹 |
| LIST | `a10 LIST "" *` | 列出文件夹 |
| EXPUNGE | `a11 EXPUNGE` | 永久删除已 \Deleted 邮件 |
| IDLE | `a12 IDLE` | 等待推送通知 |
| LOGOUT | `a13 LOGOUT` | 退出 |

响应：`tag OK/NO/BAD` 状态，未标记响应前缀 `*`。

---

## 核心能力

### 1. POP3 —— 下载删除 vs 下载保留

为什么 POP3 设计为"下载即删"：90 年代存储贵、网络慢，服务器不负责长期存储。

```
下载并删除：
Client                                Server
  │── USER alice ───────────────────→│
  │← +OK                             │
  │── PASS password ────────────────→│
  │← +OK Logged in                   │
  │── STAT ─────────────────────────→│
  │← +OK 3 45000                     │  3 封，共 45KB
  │── RETR 1 ───────────────────────→│
  │← (邮件 1 内容)                   │
  │── DELE 1 ───────────────────────→│  标记删除
  │── RETR 2 ───────────────────────→│
  │── DELE 2 ───────────────────────→│
  │── QUIT ─────────────────────────→│  QUIT 时真正删除
  │← +OK Goodbye                     │  服务器只剩邮件 3
           邮箱已下载到本地

下载保留：
  │── RETR 1 ───────────────────────→│
  │   ...不发送 DELE...              │
  │── QUIT ─────────────────────────→│  服务器保留所有邮件
  │                                  下次再下载会重复收
```

- UIDL 解决去重：记录邮件唯一 ID，跳过已下载的
- **下载保留模式下，客户端必须自己管理哪些已下载过**
- 天生不支持多设备——下载到手机后电脑上就没了（或重复下载）

---

### 2. IMAP —— 文件夹同步 + IDLE 推送

为什么：多设备时代，所有设备看到的应是同一份邮箱；IDLE 实时推新邮件，无须轮询。

```
Client A (Phone)                  IMAP Server                     Client B (Laptop)
      │                               │                               │
      │── SELECT INBOX ──────────────→│                               │
      │← * 3 EXISTS                   │                               │
      │← * FLAGS \Seen \Answered      │                               │
      │── FETCH 1 (BODY[HEADER]) ────→│                               │
      │← (邮件头部)                   │                               │
      │── STORE 1 +FLAGS \Seen ──────→│                               │
      │← * 1 FETCH FLAGS (\Seen)      │                               │
      │                               │                               │
      │── IDLE ──────────────────────→│                               │
      │← + idling                     │                               │
      │                               │←── CLIENT B: APPEND ────────│ 新邮件！
      │← * 4 EXISTS                   │     STORE +FLAGS \Seen       │
      │── DONE ──────────────────────→│                               │
      │── FETCH 4 BODY[] ───────────→│                               │
      │← (新邮件内容)                 │                               │
```

- 邮件始终在服务器，客户端只缓存
- **标志（Flags）** 同步：\Seen（已读）、\Answered（已回）、\Deleted（已删）
- 文件夹列表（LIST）同步，服务器端操作全局可见
- IDLE：长连接保持，服务器有新邮件主动 `* N EXISTS` 通知
- 部分获取（FETCH BODY[HEADER]）节省带宽，不下载附件只看标题

---

### 3. POP3 vs IMAP 对比

| 维度 | POP3 | IMAP |
|------|------|------|
| 存储位置 | 下载到客户端 | 留在服务器 |
| 多设备 | 不支持（邮件不共享） | 完美支持（全同步） |
| 文件夹 | 只有收件箱 | 任意服务器文件夹 |
| 网络要求 | 离线可用 | 需在线或预先缓存 |
| 带宽 | 全量下载所有邮件 | 按需下载，可只看头部 |
| 服务器压力 | 低（下载即删） | 高（长期存储+并发） |
| 端口 | 110 / 995 (POP3S) | 143 / 993 (IMAPS) |
| 适合场景 | 单设备、小硬盘、低内存 | 多设备、大邮箱、企业办公 |
| 同步粒度 | 整封邮件 | 单个标志/部分内容 |
| 推送 | 无（只能轮询或 APOP） | IDLE 命令实时推送 |

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 POP3 不支持文件夹 | POP3 设计于 1984 年，当时邮件服务器是临时中转，邮箱就是 `/var/mail/user` 一个文件 |
| 为什么 IMAP 更适合多设备 | 邮件/文件夹/标志全在服务器，所有客户端看到相同状态；POP3 删除后在另一设备就没了 |
| 为什么 IMAP 命令要带标签 | 支持管线化和异步响应——客户端可连续发命令，从标签区分对应哪个响应 |
| 为什么 POP3 的 DELE 在 QUIT 才真正执行 | 给 RSET 留退路；误标删后可在同会话内恢复 |
| 为什么 IMAP 有 IDLE 而不是长轮询 | 长轮询每 N 秒发 NOOP 浪费带宽，IDLE 在无事件时不消费资源，有事件即时推送 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|----------|
| 认证失败 | `-ERR Login failed` / `a1 NO LOGIN failed` | 确认用户名密码、服务器是否允许明文 | 密码错误 / 未 TLS |
| 连接超时 | 连不上 110/143 | `telnet mail.example.com 110` 测试 | 端口被封 / 服务未启 |
| POP3 重复邮件 | 每次下载都收到相同的 | 检查 UIDL 去重逻辑 | 客户端去重失效 |
| IMAP 同步慢 | 大文件夹打开卡 | `SELECT INBOX` 变慢，查看服务器负载 | 文件夹太大 / 服务器 I/O 瓶颈 |
| POP3 邮件丢失 | 手机看过的邮件电脑上没了 | 确认手机设置为"下载保留"而非"删除" | 客户端误设"删除服务器副本" |
| IMAP IDLE 断开 | 推送不响了 | 客户端重连 IDLE，检查超时时间 | 防火墙/代理切断长连接 |

---

## 常用工具

```bash
# POP3 手动交互
telnet mail.example.com 110
USER alice
PASS password
STAT
UIDL
RETR 1
QUIT

# IMAP 手动交互
openssl s_client -connect imap.example.com:993 -crlf
a1 LOGIN alice password
a2 SELECT INBOX
a3 FETCH 1 (BODY[HEADER.FIELDS (FROM SUBJECT)])
a4 LOGOUT

# STARTTLS 版 IMAP
openssl s_client -starttls imap -connect imap.example.com:143 -crlf

# 抓包分析
tcpdump -i any -nn -A 'tcp port 110 or tcp port 143'
tcpdump -i any -nn -X 'tcp port 993 or tcp port 995'

# 查看服务器能力
echo -e "a1 LOGIN alice password\r\na2 CAPABILITY\r\na3 LOGOUT\r" | nc imap.example.com 143
```

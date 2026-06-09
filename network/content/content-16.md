# FTP 文件传输协议

> 应用层 | 双通道 | 文件传输 | 端口 21(命令)/20(数据)

---

## 报文结构

FTP 是文本协议，命令通道可读 ASCII。

### 命令

格式：`命令 SP 参数 CRLF`

| 命令 | 语法 | 说明 |
|------|------|------|
| USER | `USER name` | 用户名 |
| PASS | `PASS pass` | 密码 |
| SYST | `SYST` | 查询系统类型 |
| PWD | `PWD` | 当前目录 |
| CWD | `CWD dir` | 切换目录 |
| MKD | `MKD dir` | 创建目录 |
| RMD | `RMD dir` | 删除目录 |
| LIST | `LIST [path]` | 列出目录内容（数据通道传输） |
| NLST | `NLST [path]` | 仅文件名列表 |
| RETR | `RETR file` | 下载文件 |
| STOR | `STOR file` | 上传文件（覆盖） |
| APPE | `APPE file` | 上传文件（追加） |
| DELE | `DELE file` | 删除文件 |
| RNFR | `RNFR old` | 指定重命名的旧名 |
| RNTO | `RNTO new` | 指定重命名新名 |
| TYPE | `TYPE A/I/E/L` | 传输类型（A=ASCII, I=Binary） |
| MODE | `MODE S/B/C` | 传输模式（S=流, B=块, C=压缩） |
| PASV | `PASV` | 进入被动模式 |
| PORT | `PORT h1,h2,h3,h4,p1,p2` | 指定主动模式数据端口 |
| REST | `REST offset` | 设置断点续传偏移量 |
| SIZE | `SIZE file` | 查询文件大小 |
| STAT | `STAT [path]` | 状态/目录查询（命令通道返回） |
| QUIT | `QUIT` | 退出 |

### 响应

格式：`3 位状态码 SP|连字符 文本 CRLF`

| 码段 | 含义 | 示例 |
|------|------|------|
| 1xx | 初步肯定，等待后续 | 150 Opening data connection |
| 2xx | 完成 | 226 Transfer complete, 230 Logged in |
| 3xx | 中间肯定，等待进一步输入 | 331 Password required |
| 4xx | 临时否定，可重试 | 425 Can't open data connection |
| 5xx | 永久否定 | 530 Not logged in, 550 File not found |

---

## 核心能力

### 1. 双通道模型

为什么：命令和数据分离 —— 一个通道传控制指令，另一个传文件内容，互不阻塞。

```
FTP Client                              FTP Server
     │                                      │
     │──── 连接 21 ───────────────────────→│  命令通道建立
     │  USER alice                          │
     │← 331 Password required               │
     │  PASS password                       │
     │← 230 Logged in                       │
     │  TYPE I (Binary)                     │
     │← 200 Type set to I                   │
     │                                      │
     │  PASV                                │  协商数据通道
     │← 227 (192,168,1,1,15,200)            │  端口 = 15×256+200 = 4040
     │                                      │
     │──── 连接 4040 ─────────────────────→│  数据通道建立（独立连接）
     │  LIST                                │
     │← 150 Opening data connection         │  LIST 结果走数据通道
     │  [目录列表通过数据通道传输]          │
     │← 226 Transfer complete               │  传输完毕
     │                                      │
     │  PASV                                │  每次传输重新协商
     │← 227 (192,168,1,1,17,50)             │  数据通道用完即关
     │──── 连接 17×256+50 ────────────────→│
     │  RETR bigfile.zip                    │  下载文件
     │← 150 Opening binary data connection  │
     │  [文件通过数据通道传输]              │
     │← 226 Transfer complete               │
```

- 命令通道：持久连接，整个会话存活
- 数据通道：每个文件传输新建（无状态），传完关闭
- 命令通道可同时协商多个数据通道（理论并发，现实中很少）
- 无数据通道时，控制通道可做目录浏览（LIST/RETR 走数据通道，STAT 走命令通道）

---

### 2. 主动模式 vs 被动模式

为什么需要被动模式：主动模式要求客户端开启端口等待服务器连接，客户端防火墙通常阻止入站连接。

```
主动模式 (PORT)：
Client(firewall)                    Server
      │                                │
      │ PORT 192,168,1,10,19,136      │  告知："数据端口 5000"
      │← 200 PORT command successful   │
      │←──── 从:20 连接 :5000 ──────→│  服务器主动连客户端 ⚠
      │  [数据通道]                    │
      │                                │
  问题：客户端 5000 端口在 NAT 内部
  防火墙：外部连入 → 拦截 ✓
  结果：主动模式无法工作 ✗

被动模式 (PASV)：
Client(firewall)                    Server
      │                                │
      │ PASV                           │
      │← 227 (192,168,1,1,15,200)      │  告知："我的数据端口 = 4040"
      │─── 连接 :4040 ────────────────→│  客户端主动连接服务器 ✓
      │  [数据通道]                    │
      │                                │
  优势：客户端主动出站，防火墙放行 ✓
  缺陷：服务器需开放动态高位端口范围
```

| 模式 | 数据通道建立方向 | 防火墙友好 | 服务器配置 |
|------|-----------------|-----------|-----------|
| PORT 主动 | 服务器→客户端 | 客户端 NAT/防火墙受阻 | 简单，只需端口 20 出站 |
| PASV 被动 | 客户端→服务器 | 客户端不受限 | 需配置 PASV 端口范围供防火墙开放 |

- **现代 FTP 客户端默认被动模式**
- 服务器设定 PASV 端口范围（如 50000~50100）并在防火墙上开放
- 云环境/容器中主动模式几乎不可用（客户端 IP 是私有地址）

---

### 3. 断点续传

为什么：大文件下载一半网络断了，不必从头再来。

```
下载续传：
Client                                   Server
  │── SIZE bigfile.zip ─────────────────→│  询问文件总大小
  │← 213 10485760                        │  10MB
  │── REST 5000000 ─────────────────────→│  说"我从 5MB 开始"
  │← 350 Restarting at 5000000           │  确认偏移量
  │── RETR bigfile.zip ─────────────────→│  发起下载
  │← 150 Opening data connection         │
  │  [传输 5000000 ~ 10485760]           │  只传后半段
  │← 226 Transfer complete               │  ✓

上传续传：
Client                                   Server
  │── REST 5000000 ─────────────────────→│  说"服务器我已上传 5MB"
  │← 350 Restarting at 5000000           │  准备接收追加
  │── APPE bigfile.zip ─────────────────→│  APPE = Append，追加写入
  │← 150 Opening data connection         │
  │  [传输 5000000 之后的内容]           │
  │← 226 Transfer complete               │  ✓
```

- REST：仅设置偏移量，不触发传输，需配合 RETR/APPE
- 续传前要先 `SIZE` 确认两端文件大小一致
- FTP 规范无校验和机制，应用层应加 MD5/SHA256 验证完整性

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 FTP 用两个连接（命令和数据分离） | 1971 年设计时，全双工连接昂贵；命令通道传控制语句，数据通道专注流式传输，互不阻塞。Telnet 样式的 "talk while transfer" 成为可能 |
| 为什么主动模式默认端口是 20 | 服务器端固定源端口，方便防火墙做策略（允许从 :20 到高位的出站） |
| 为什么 PASV 端口不固定 | 每次传输用不同端口，避免端口重用导致数据错乱；但给防火墙配置带来麻烦 |
| 为什么不直接用 HTTP 传文件 | FTP 比 HTTP 出现更早；FTP 有目录管理/权限/双通道优势，HTTP 单连接串行传输不适合大文件批量管理 |
| 为什么需要 TYPE I/A 区分 | ASCII 模式下自动转换换行符（CRLF↔LF），Binary 模式逐字节搬运不做转换 |
| 为什么表头命令（LIST）和数据通道分离 | 目录列表本身也是数据，用数据通道传输统一处理逻辑；STAT 通过命令通道查目录是备选方案 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|----------|
| 数据连接失败 | `425 Can't open data connection` | 切换 PASV 模式 `PASV`；检查防火墙 | 主动模式被客户端防火墙拦 / PASV 端口没开放 |
| 登录失败 | `530 Not logged in` | 检查用户名密码 | 密码错 / 账号禁用匿名 |
| 传输中断 | 文件传一半断开 | 看日志：`Timeout` / `Connection reset` | 网络不稳 / PASV 端口超时 |
| 文件损坏 | 文本文件乱码 | 检查传输模式 | TYPE A（ASCII）传输了二进制文件，换行符被转义 |
| PASV 端口打不开 | `227` 后连不上 | 查看服务器被动端口范围是否开放 | 防火墙没放行 PASV 端口段 |
| 目录列表为空 | LIST 返回空 | `PWD` 确认路径，`STAT` 替代排查 | 权限不够 / 目录确实为空 |
| 上传不全 | 文件比源文件小 | 检查是否使用 APPE 续传而非 STOR | 覆盖模式没写完就断了 |

---

## 常用工具

```bash
# 手工 FTP（命令通道）
ftp ftp.example.com

# 手动模拟（建议用 passive 模式）
ftp -p ftp.example.com

# 命令行非交互下载
ftp -n ftp.example.com <<EOF
user alice password
binary
get bigfile.zip
quit
EOF

# 批量镜像/断点续传（推荐 lftp 替代 ftp）
lftp -u alice,password ftp.example.com -e "mirror --continue /remote/path /local/path; quit"
wget --continue ftp://alice:password@ftp.example.com/bigfile.zip

# 查看 PASV 端口协商
tcpdump -i any -nn -v 'tcp port 21'

# 跟踪数据通道
tcpdump -i any -nn 'tcp portrange 50000-50100'

# 检查 FTP 服务器支持的扩展
curl -v ftp://ftp.example.com/ |& grep "FEAT"
```

# HTTP/2

> 应用层 | 二进制分帧 | 多路复用 | 端口 80（HTTP）/ 443（HTTPS，主流）

---

## 报文结构

### 帧 —— 最小通信单元

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                 Length (24bit)                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|   Type (8bit)  |   Flags (8bit)  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|R|                 Stream Identifier (31bit)                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                   Payload (可变)                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| Length | 24bit | Payload 长度（不含头部 9B），最大 2^24-1（≈16MB） |
| Type | 8bit | 帧类型：DATA / HEADERS / PRIORITY / RST_STREAM / SETTINGS / PUSH_PROMISE / PING / GOAWAY / WINDOW_UPDATE / CONTINUATION |
| Flags | 8bit | 帧类型相关，如 END_STREAM(0x1) / END_HEADERS(0x4) / ACK(0x1) |
| R | 1bit | 保留位 |
| Stream Identifier | 31bit | 流 ID，客户端发奇数，服务端发偶数，0 为连接帧 |

### 帧类型

| Type | 作用 | Flags 示例 |
|------|------|-----------|
| DATA | 传输消息体 | END_STREAM |
| HEADERS | 传输头部 (含伪头 :method/:path/:status) | END_HEADERS, END_STREAM |
| PRIORITY | 设置流优先级 | 无 |
| RST_STREAM | 终止单个流 | 无 |
| SETTINGS | 连接级参数协商 | ACK |
| PUSH_PROMISE | 服务端推送声明 | END_HEADERS |
| PING | 心跳/RTT 测量 | ACK |
| GOAWAY | 连接关闭通知 | 无 |
| WINDOW_UPDATE | 流量控制窗口更新 | 无 |
| CONTINUATION | HEADERS 续帧 | END_HEADERS |

---

## 核心能力

### 1. 二进制分帧

为什么需要：HTTP/1.1 文本协议解析慢（逐行读 `\r\n`、空格拆分），二进制直接按长度切。

```
HTTP/1.1（文本）：                  HTTP/2（二进制）：
  GET /index.html HTTP/1.1\r\n       帧1: HEADERS (stream=1)
  Host: example.com\r\n                :method: GET
  \r\n                                 :path: /index.html
                                       :authority: example.com
                                     帧2: DATA (stream=1, END_STREAM)
                                       <html>...
```

- 解析器更简单：读 Length → 读 Payload → 循环
- 错误更少：不需要处理空格/换行/编码歧义
- 帧级处理：可以中断、优先级、复用

---

### 2. 多路复用

为什么需要：HTTP/1.1 一个 TCP 同时只能处理一个请求（HOL），或开多个连接加重服务器负担。

```
HTTP/1.1（6 个 TCP 连接）：          HTTP/2（1 个 TCP，多个 Stream）：
  TCP连接1: 请求1 → 响应1             一个 TCP 连接：
  TCP连接2: 请求2 → 响应2               stream1: 请求1 → ═══ → 响应1
  TCP连接3: 请求3 → 响应3               stream3: ───请求2─ → ──响应2─
  TCP连接4: 请求4 → 响应4               stream5: ───请求3─ → ──响应3─
  TCP连接5: 请求5 → 响应5               stream7: ───请求4─ → ──响应4─
  TCP连接6: 请求6 → 响应6               stream9: ───请求5─ → ──响应5─
                                       stream11: ──请求6─ → ──响应6─
  每个连接独立建 TCP，3 握手×6         一次握手，全部复用
  连接之间争带宽                       Stream 间可交错，无头阻塞
```

- **一个 TCP 连接并发传输多个 Stream**，Stream 间完全独立
- **请求 1 大文件不影响请求 2 小文件**：帧在链路层交错发送
- **丢包影响**：TCP 层面丢包会阻塞所有 Stream（见设计决策）

---

### 3. 头部压缩（HPACK）

为什么需要：HTTP/1.1 每次请求重复发相同的头部（Cookie/UA/Host），一个请求头部可占几百字节。

```
HTTP/1.1 每次重复发：
  GET /1.js HTTP/1.1
  Host: example.com
  User-Agent: Mozilla/5.0...
  Accept: */*
  Cookie: session=abc; theme=dark; lang=zh
  → 约 300 字节

HTTP/2 HPACK 压缩：
  第 1 次：发送完整头部（200B），建立动态表
  第 2 次：引用索引号（如 索引 23 → ":host: example.com"），实际发 ≈ 10B
```

| 策略 | 原理 | 效果 |
|------|------|------|
| 静态表 | 预定义 61 个常见头部（`:method: GET` = 索引 2） | 静态头部 1 字节搞定 |
| 动态表 | 连接间不断出现的头部加入动态表 | 后续请求用索引代替 |
| Huffman 编码 | 对内容做 Huffman 压缩 | 减少非 ASCII/长值字节数 |

---

### 4. 服务端推送

为什么需要：客户端请求 HTML 时，服务端已经知道它马上要 CSS/JS，提前推过去省一个 RTT。

```
客户端                             服务器（HTTP/2）
  |                                     |
  |── GET /index.html ────────────────→|
  |                                     |
  |← HEADERS :status 200 ─────────────|  ← 响应 index.html
  |← PUSH_PROMISE: promise_id=1      |  ← 预告：我要推 style.css
  |   :method GET, :path /style.css   |     流 ID 奇数归客户端，偶数归服务端
  |← DATA (index.html 内容) ─────────|
  |                                     |
  |  （客户端不用再请求 style.css）    |
  |                                     |
  |← HEADERS :status 200              |  ← 推送/style.css
  |← DATA (style.css 内容) ───────────|
```

- 推送资源缓存在客户端，避免额外请求
- 可被客户端拒绝（RST_STREAM）
- **容易浪费带宽**：如果客户端已经缓存了 style.css，推送就是浪费
- Chrome 默认不支持服务器推送（2022 年后废弃），CR 问题多

---

### 5. 流优先级与流量控制

为什么需要：告诉服务器哪些资源更重要（先渲染 CSS 再加载图片），避免资源竞争。

```
流优先级树：
          根
         /   \
      stream1   stream2
      /    \       \
   stream3 stream4  stream5

  stream1 = HTML（权重 32）
    stream3 = CSS（权重 16）   ← CSS 先渲染
    stream4 = JS（权重 12）    ← JS 其次
  stream2 = 图片（权重 8）     ← 图片最低
```

**连接级流量控制**：
- 每个 Stream 独立窗口，默认 64KB
- `WINDOW_UPDATE` 帧动态调整
- 防止慢接收方被快发送方淹没（类似 TCP 窗口）

**Stream 级优先级**：
- 依赖（Dependency）：A → B（A 依赖 B，处理完 B 才处理 A）
- 权重（Weight）：同层资源按比例分配带宽

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么用二进制 | 文本解析慢、易出错；二进制定长头部+变长 Payload，解析器简单高效 |
| 为什么能解决 HTTP/1.1 HOL | Stream 间帧可交错，大文件不堵小请求 |
| 为什么仍有 TCP HOL | TCP 保证字节序，一个 Stream 丢包 → TCP 重传 → 该 TCP 所有 Stream 暂停（同连接的所有流都得等重传完成）。HTTP/2 无法感知底层 TCP 段边界 |
| 为什么 HPACK 不用 gzip | gzip 有 CRIME 攻击（压缩比泄露明文），HPACK 结合 Huffman+动态表不可攻击 |
| 为什么主流用 HTTPS | 浏览器和 HTTP/2 实现（h2）要求 TLS（ALPN），明文 h2c 几乎没被支持 |
| 为什么推送被废弃 | 开销大（额外连接资源）、缓存命中率低、浏览器已有预加载 `<link rel=preload>` 替代 |
| 为什么需要帧流控 | 多路复用下慢接收方可能被并发流冲垮 |

---

## 排障速查

| 问题 | 原因 | 排查 |
|------|------|------|
| HTTP/2 连接失败退到 HTTP/1.1 | 中间代理不支持 h2 / TLS 协商失败 | `curl --http2 -v` 看 ALPN 协商 |
| 多路复用无效果 | TCP 丢包率高（所有 Stream 一起卡） | `ss -ti` 看重传率 |
| 服务端推送不生效 | 浏览器已废弃（Chrome 106+） | 改用 `<link rel=preload>` |
| 某个 Stream 卡住 | 流窗口耗尽 | `WINDOW_UPDATE` 帧未返回 |
| 连接莫名其妙断开 | 对端发了 GOAWAY（升级/重启） | `tcpdump` 抓 GOAWAY 帧 |
| HPACK 动态表错误 | 连接中断后状态不一致 | GOAWAY 后重建连接 |

```bash
# curl —— 看 HTTP/2 是否生效
curl --http2 -v https://example.com               # ALPN 协商
curl --http2-prior-knowledge http://example.com    # 明文 h2c
curl --http2 -s -w "HTTP/2: %{http_version}\n" -o /dev/null https://example.com

# nghttp —— HTTP/2 专用
nghttp -v https://example.com                      # 看帧交换
nghttp -s https://example.com                      # 统计
nghttp -u https://example.com                      # 看推送

# Chrome DevTools Network
# Protocol 列显示 h2 → 确认走 HTTP/2
# 右键 → Header Options → Protocol
# 看 waterfall 是否并行（多路复用体现在多条同时进行）
```

---

## 常用工具

```bash
# curl — 支持 HTTP/2
curl --http2 -v https://example.com                # 强制 h2
curl --http2 -I https://example.com                # 看响应头
curl --http2 -w "http_version: %{http_version}\n" -o /dev/null -s https://example.com

# nghttp2 工具族
nghttp -v https://example.com                      # 帧级详情
nghttp -s https://example.com                      # 连接统计
nghttpd --http2-server                              # 本地 HTTP/2 服务器测试
nghttp -u https://example.com                      # 测试推送

# h2load — HTTP/2 压测
h2load -n 1000 -c 10 https://example.com           # 并发 10 请求 1000 次

# Wireshark
# tcp.port == 443 && http2
# 过滤 HTTP/2 帧，看 SETTINGS/HEADERS/DATA/WINDOW_UPDATE

# Chrome DevTools
# chrome://net-export → 抓网络日志 → netlog viewer
# 查看 HTTP/2 会话协商、帧序列、流状态
```

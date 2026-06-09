# HTTP/1.1 超文本传输协议

> 应用层 | 请求-响应 | 文本协议 | 端口 80（HTTP）/ 443（HTTPS）

---

## 报文结构

### 请求报文

```
  ┌─────────────────────────────────────────────────────────────┐
  │  GET /index.html HTTP/1.1\r\n                                │  请求行
  │  Host: www.example.com\r\n                                   │  ──┐
  │  User-Agent: curl/8.0\r\n                                    │     │
  │  Accept: */*\r\n                                             │     ├ 头部
  │  Connection: keep-alive\r\n                                  │     │
  │  \r\n                                                        │  ──┘
  │  body                                                        │  体（GET 无体）
  └─────────────────────────────────────────────────────────────┘
```

### 响应报文

```
  ┌─────────────────────────────────────────────────────────────┐
  │  HTTP/1.1 200 OK\r\n                                         │  状态行
  │  Date: Mon, 01 Jan 2024 00:00:00 GMT\r\n                    │  ──┐
  │  Content-Type: text/html; charset=utf-8\r\n                  │     │
  │  Content-Length: 1024\r\n                                    │     ├ 头部
  │  Set-Cookie: session=abc123; Path=/\r\n                     │     │
  │  \r\n                                                        │  ──┘
  │  <html>...                                                   │  体
  └─────────────────────────────────────────────────────────────┘
```

| 部分 | 说明 |
|------|------|
| 请求行 | `METHOD URI HTTP_VERSION\r\n` |
| 状态行 | `HTTP_VERSION STATUS_CODE REASON_PHRASE\r\n` |
| 头部 | 每行 `Key: Value\r\n`，空行 `\r\n` 结束 |
| 体 | 由 `Content-Length` 或 `Transfer-Encoding: chunked` 决定边界 |

---

## 核心能力

### 1. 请求方法

| 方法 | 幂等 | 作用 | 体 |
|------|------|------|----|
| GET | ✓ | 获取资源 | 无 |
| HEAD | ✓ | 只取头部，无响应体 | 无 |
| POST | ✗ | 提交资源 | 有 |
| PUT | ✓ | 覆盖资源 | 有 |
| DELETE | ✓ | 删除资源 | 可有 |
| PATCH | ✗ | 部分修改资源 | 有 |
| OPTIONS | ✓ | 查询服务器支持方法 | 无 |

**为什么幂等重要**：网络重试时，GET/DELETE 重复执行结果不变，POST 重复执行可能重复下单/扣款。

---

### 2. 状态码

| 类别 | 含义 | 常见码 |
|------|------|--------|
| 1xx | 中间状态 | 100 Continue（继续发体） |
| 2xx | 成功 | 200 OK / 201 Created / 204 No Content |
| 3xx | 重定向 | 301 Moved Permanently / 302 Found / 304 Not Modified |
| 4xx | 客户端错误 | 400 Bad Request / 401 Unauthorized / 403 Forbidden / 404 Not Found |
| 5xx | 服务端错误 | 500 Internal Server Error / 502 Bad Gateway / 503 Service Unavailable / 504 Gateway Timeout |

---

### 3. 持久连接（Keep-Alive）

为什么需要：HTTP/1.0 每请求新建一次 TCP（三次握手+慢启动），开销极大。

```
HTTP/1.0（短连接）：                               HTTP/1.1（持久连接）：
  Client →→ 三次握手 →→ Server                      Client →→ 三次握手 →→ Server
  Client →→ 请求1    →→ Server                      Client →→ 请求1    →→ Server
  Client ←← 响应1    ←← Server                      Client ←← 响应1    ←← Server
  Client →→ 四次挥手 →→ Server                      Client →→ 请求2    →→ Server  ← 复用
  Client →→ 三次握手 →→ Server                      Client ←← 响应2    ←← Server
  Client →→ 请求2    →→ Server                      Client →→ 请求3    →→ Server
  Client ←← 响应2    ←← Server                      Client ←← 响应3    ←← Server
  Client →→ 四次挥手 →→ Server                      Client →→ 四次挥手 →→ Server
```

- 默认 `Connection: keep-alive`，`Connection: close` 关闭
- 减少 TCP 握手 RTT，节省 CPU/内存
- 空闲保活：`Keep-Alive: timeout=5, max=100`

---

### 4. 队头阻塞（HOL）

为什么是问题：HTTP/1.1 管线化（pipelining）要求响应必须按请求顺序返回。

```
请求管道 + 队头阻塞：
  发 →→ 请求1 →→ 请求2 →→ 请求3 →→→→→→→→→→→→→→→→→→→→→→→→→ 收
       ↑                                      ↑
       服务器必须按序响应，请求1慢整个队列全堵

  ←← 响应1 ←←←←←←←←←←←←← (大文件，2 秒) ↑
  ←← 响应2 ←(1ms)-↑
  ←← 响应3 ←(10ms)-↑

  请求2/3 等 2 秒，即使它们很快
```

- **管线化**：请求可以并发发，但响应必须按序回 → 头阻塞
- **实际浏览器**：放弃管线化，改开**6 个并行 TCP 连接**（域分片）来缓解
- **根解**：HTTP/2 多路复用

---

### 5. 缓存机制

为什么需要：避免每次都从源站拉，减少延迟和带宽。

```
强缓存（不请求服务器）：
  客户端 → 检查 Cache-Control → TTL 内 → 直接使用本地缓存
  max-age=3600  → 1 小时内不走网络
  Expires 已弃用，优先 Cache-Control

客户端                   服务器
  |  请求 /style.css       |
  |----------------------->|
  |  Cache-Control:        |
  |  max-age=3600          |
  |<-----------------------|
  |                        |
  |  (3600 秒内重复请求)   |
  |  直接存本地取，不走网  |
  |                        |

协商缓存（问服务器资源变了没）：

客户端                   服务器
  |  请求 /data.json       |
  |  If-None-Match: "abc"  |   ← ETag 指纹
  |  If-Modified-Since:    |
  |  Mon, 01 Jan 2024      |   ← Last-Modified 时间
  |----------------------->|
  |  304 Not Modified      |   ← 没变，继续用缓存
  |  (空体)                |
  |<-----------------------|

  ETag 优先级高于 Last-Modified（更精确）
```

| 缓存策略 | 交互 | 谁决定 |
|----------|------|--------|
| 强缓存 | 不请求服务器 | 浏览器，看 max-age |
| 协商缓存 | 带条件请求服务器 | 服务器，304 或 200 |

---

### 6. Cookie / Session

为什么需要：HTTP 无状态，服务器无法区分两次请求是谁发的。

```
第一次请求：

客户端                   服务器
  |  请求 /login POST       |
  |  body: user=alice      |
  |----------------------->|
  |  200 OK                |
  |  Set-Cookie:           |  ← 种 Cookie
  |  session=abc123;       |
  |  Path=/; HttpOnly;     |
  |  SameSite=Lax          |
  |<-----------------------|
  |                        |
  |  存 Cookie: session=abc123

后续请求：

客户端                   服务器
  |  请求 /profile          |
  |  Cookie: session=abc123 |  ← 自动带上
  |----------------------->|
  |  200 OK                |
  |  body: alice 的个人页  |
  |<-----------------------|
```

| Cookie 属性 | 作用 |
|-------------|------|
| Domain/Path | 限定哪些域名/路径发 Cookie |
| Expires/Max-Age | 持久 Cookie vs 会话 Cookie |
| Secure | 仅 HTTPS 发送 |
| HttpOnly | 禁止 JS 读取，防 XSS |
| SameSite | Strict/Lax/None，防 CSRF |

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 HTTP 是无状态的 | 设计目标是简单文档传输，有状态会增加服务器复杂度。用 Cookie/Session 扩展到有状态 |
| 为什么 HTTP/1.1 默认持久连接 | 1997 年网页资源数暴增，短连接每资源一个 TCP，开销不可接受 |
| 为什么管线化不普及 | 队头阻塞没解决 + 服务器/代理实现不一致，浏览器改用多连接 |
| 为什么用 `\r\n` 分隔头部 | 文本协议时代简单，telnet 可直接调试 |
| 为什么需要 Host 头 | 1 个 IP 跑多个站点（虚拟主机），服务器靠 Host 区分 |

---

## 排障速查

| 问题 | 命令 | 原因 |
|------|------|------|
| 响应慢 | `curl -w "@format" -o /dev/null -s url` | 看 time_total / time_starttransfer |
| 302 循环 | `curl -v url` 看 Location 头 | 重定向逻辑死循环 |
| 502 Bad Gateway | 上游服务器无响应 | Nginx → 后端不通/超时 |
| 503 Service Unavailable | 服务器过载/维护 | 检查后端负载 |
| 504 Gateway Timeout | 上游超时 | Nginx proxy_read_timeout 到 |
| 403 Forbidden | 无权限 | Check 文件权限/WAF 拦截 |
| 缓存不更新 | `curl -I url` 看 Cache-Control | 强缓存 TTL 未过，`?v=2` 爆破 |
| Cookie 没带上 | `curl -v` 看是否有 Cookie 头 | Domain/Path 不匹配 / 跨域 |

```bash
# curl —— HTTP 排障利器
curl -v http://example.com                         # 完整交互
curl -I http://example.com                         # 只看响应头
curl -L http://example.com                         # 跟随 302
curl -w "time_connect: %{time_connect}\ntime_total: %{time_total}\n" -o /dev/null -s http://example.com
curl -X POST -d 'user=alice' http://example.com     # POST
curl -H "Cookie: session=abc" http://example.com    # 手动带 Cookie
curl --resolve example.com:80:127.0.0.1 http://example.com  # 指定 IP

# Chrome DevTools Network
# F12 → Network → 看 waterfall / headers / timing
# Slow 3G 模拟 → 看首屏性能
```

---

## 常用工具

```bash
# curl
curl -v http://example.com                          # 调试
curl -I http://example.com                          # 响应头
curl -o /dev/null -w "%{http_code}\n" http://...    # 仅状态码

# wget
wget -S http://example.com                          # 类似 curl -v

# telnet — 手敲 HTTP
telnet example.com 80
GET / HTTP/1.1
Host: example.com

# nc
echo -ne "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n" | nc example.com 80

# Chrome DevTools Network Tab
# 打开 F12 → Network → 勾选 Disable Cache → Reload
# Waterfall 每阶段含义：
#   Queueing  → 浏览器排队
#   DNS       → DNS 解析
#   Connecting/SSL → TCP 连接/TLS 握手
#   Sending   → 发请求
#   Waiting   → TTFB（最大优化空间）
#   Download  → 收响应体
```

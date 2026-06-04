# 第 8 章：HTTP/1.1 协议

> **学习目标**：掌握 HTTP/1.1 的请求-响应模型、报文格式、缓存与连接管理机制
> **预计时长**：4 小时
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

### 1.1 HTTP 概述

HTTP（HyperText Transfer Protocol）是 Web 的基础协议，采用请求-响应模型，运行在 TCP 之上。

**HTTP/1.1 核心特性**：
- **无状态**：每个请求独立，通过 Cookie 维持状态
- **文本协议**：报文可读性强，但解析效率低
- **请求-响应**：客户端发起请求，服务器返回响应
- **持久连接**：Keep-Alive 复用 TCP 连接

### 1.2 HTTP 与 HTTPS

```
HTTP  = HTTP/1.1 over TCP (端口 80)
HTTPS = HTTP/1.1 over TLS over TCP (端口 443)
```

---

## 2. 报文结构

### 2.1 请求报文

```
请求行:  GET /api/users HTTP/1.1\r\n
头部:    Host: example.com\r\n
         Accept: application/json\r\n
         User-Agent: Mozilla/5.0\r\n
         Cookie: session=abc123\r\n
         \r\n
消息体:  (GET 请求通常无消息体)
```

**请求行格式**：`方法 SP 请求目标 SP HTTP版本 CRLF`

### 2.2 响应报文

```
状态行:  HTTP/1.1 200 OK\r\n
头部:    Content-Type: application/json\r\n
         Content-Length: 1234\r\n
         Cache-Control: max-age=3600\r\n
         Set-Cookie: session=abc123; Path=/\r\n
         \r\n
消息体:  {"users": [...]}
```

**状态行格式**：`HTTP版本 SP 状态码 SP 原因短语 CRLF`

### 2.3 HTTP 头部分类

| 类别 | 示例 | 说明 |
|------|------|------|
| **通用头部** | Cache-Control, Connection, Transfer-Encoding | 请求和响应都可使用 |
| **请求头部** | Host, Accept, User-Agent, Authorization | 仅请求使用 |
| **响应头部** | Server, Set-Cookie, Content-Range | 仅响应使用 |
| **实体头部** | Content-Type, Content-Length, ETag | 描述消息体 |

---

## 3. 具体能力

### 3.1 请求方法

| 方法 | 语义 | 幂等 | 安全 | 消息体 |
|------|------|------|------|--------|
| GET | 获取资源 | ✅ | ✅ | 无 |
| POST | 创建/提交 | ❌ | ❌ | 有 |
| PUT | 全量更新 | ✅ | ❌ | 有 |
| DELETE | 删除资源 | ✅ | ❌ | 可选 |
| PATCH | 部分更新 | ❌ | ❌ | 有 |
| HEAD | 获取元信息 | ✅ | ✅ | 无 |
| OPTIONS | 获取支持方法 | ✅ | ✅ | 无 |
| TRACE | 回显请求 | ✅ | ✅ | 无 |

**幂等性**：同一请求执行一次和多次效果相同。GET/PUT/DELETE 幂等，POST 不幂等。

### 3.2 状态码

| 范围 | 类别 | 常见状态码 |
|------|------|-----------|
| 1xx | 信息 | 100 Continue |
| 2xx | 成功 | 200 OK, 201 Created, 204 No Content |
| 3xx | 重定向 | 301 永久, 302 临时, 304 未修改, 307 临时(保持方法) |
| 4xx | 客户端错误 | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 429 Too Many Requests |
| 5xx | 服务器错误 | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout |

**关键区分**：
- **301 vs 302**：301 永久重定向（浏览器缓存），302 临时重定向
- **401 vs 403**：401 未认证（需登录），403 已认证但无权限
- **302 vs 307**：302 可能将 POST 改为 GET，307 保持原方法

### 3.3 持久连接（Keep-Alive）

HTTP/1.0 默认短连接，HTTP/1.1 默认持久连接：

```
HTTP/1.0: 每个请求/响应后关闭 TCP 连接
HTTP/1.1: Connection: keep-alive (默认)
          多个请求复用同一 TCP 连接
```

**队头阻塞（Head-of-Line Blocking）**：

```
请求1 ──→ 响应1 ──→ 请求2 ──→ 响应2 ──→ 请求3 ──→ 响应3
         必须等响应1完成才能发请求2
```

解决方案：浏览器对同一域名开启 6 个并行连接。

### 3.4 缓存机制

**强缓存**（不问服务器）：

```
Cache-Control: max-age=3600       → 3600秒内直接用缓存
Expires: Thu, 01 Dec 2026 16:00:00 GMT  → 绝对时间（优先级低于 Cache-Control）
```

**协商缓存**（问服务器是否变化）：

```
--- 方式1：Last-Modified / If-Modified-Since ---
响应: Last-Modified: Wed, 01 Jan 2025 00:00:00 GMT
请求: If-Modified-Since: Wed, 01 Jan 2025 00:00:00 GMT
→ 未修改返回 304 Not Modified

--- 方式2：ETag / If-None-Match ---
响应: ETag: "abc123"
请求: If-None-Match: "abc123"
→ 未修改返回 304 Not Modified
```

**Cache-Control 指令**：

| 指令 | 说明 |
|------|------|
| max-age=N | 缓存有效期 N 秒 |
| no-cache | 必须协商验证（不是不缓存） |
| no-store | 完全不缓存 |
| private | 仅浏览器缓存，CDN 不缓存 |
| public | 允许中间缓存 |
| must-revalidate | 过期后必须验证 |

### 3.5 Cookie 与 Session

**Cookie 机制**：

```
服务器 → 客户端:
Set-Cookie: session=abc123; Path=/; HttpOnly; Secure; SameSite=Lax

客户端 → 服务器:
Cookie: session=abc123
```

**Cookie 属性**：

| 属性 | 说明 |
|------|------|
| Domain | Cookie 作用域名 |
| Path | Cookie 作用路径 |
| HttpOnly | JS 无法访问（防 XSS） |
| Secure | 仅 HTTPS 传输 |
| SameSite | 跨站限制（Strict/Lax/None，防 CSRF） |
| Max-Age | 有效期（秒） |
| Expires | 过期时间 |

### 3.6 内容协商

客户端告诉服务器自己偏好的格式：

```
Accept: text/html, application/json;q=0.9   → 偏好 HTML
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8   → 偏好中文
Accept-Encoding: gzip, deflate, br          → 支持压缩
```

服务器根据这些头部选择最合适的响应，并通过 `Vary` 头部说明协商依据：

```
Vary: Accept-Encoding  → 缓存键需包含 Accept-Encoding
```

---

## 4. 报文样例

### 4.1 HTTP 请求报文（原始十六进制）

```
47 45 54 20 2f 61 70 69 2f 75 73 65 72 73 20 48 54 54 50 2f 31 2e 31 0d 0a
48 6f 73 74 3a 20 65 78 61 6d 70 6c 65 2e 63 6f 6d 0d 0a
41 63 63 65 70 74 3a 20 61 70 70 6c 69 63 61 74 69 6f 6e 2f 6a 73 6f 6e 0d 0a
55 73 65 72 2d 41 67 65 6e 74 3a 20 63 75 72 6c 2f 38 2e 30 0d 0a
41 63 63 65 70 74 2d 45 6e 63 6f 64 69 6e 67 3a 20 67 7a 69 70 0d 0a
43 6f 6e 6e 65 63 74 69 6f 6e 3a 20 6b 65 65 70 2d 61 6c 69 76 65 0d 0a
0d 0a
```

**结构化解析**：

```
GET /api/users HTTP/1.1\r\n
Host: example.com\r\n
Accept: application/json\r\n
User-Agent: curl/8.0\r\n
Accept-Encoding: gzip\r\n
Connection: keep-alive\r\n
\r\n
```

### 4.2 HTTP 响应报文

```
48 54 54 50 2f 31 2e 31 20 32 30 30 20 4f 4b 0d 0a
43 6f 6e 74 65 6e 74 2d 54 79 70 65 3a 20 61 70 70 6c 69 63 61 74 69 6f 6e 2f 6a 73 6f 6e 0d 0a
43 6f 6e 74 65 6e 74 2d 4c 65 6e 67 74 68 3a 20 31 32 33 34 0d 0a
43 61 63 68 65 2d 43 6f 6e 74 72 6f 6c 3a 20 6d 61 78 2d 61 67 65 3d 33 36 30 30 0d 0a
45 54 61 67 3a 20 22 61 62 63 31 32 33 22 0d 0a
0d 0a
7b 22 75 73 65 72 73 22 3a 20 5b 5d 7d
```

**结构化解析**：

```
HTTP/1.1 200 OK\r\n
Content-Type: application/json\r\n
Content-Length: 1234\r\n
Cache-Control: max-age=3600\r\n
ETag: "abc123"\r\n
\r\n
{"users": []}
```

---

## 5. 深入一点

### Transfer-Encoding: chunked

当响应体大小未知时（动态生成），使用分块传输：

```
HTTP/1.1 200 OK\r\n
Transfer-Encoding: chunked\r\n
\r\n
7\r\n
Mozilla\r\n
9\r\n
Developer\r\n
7\r\n
Network\r\n
0\r\n
\r\n
```

格式：`块大小(十六进制)\r\n 块数据\r\n ... 0\r\n\r\n`

### HTTP/1.1 的性能瓶颈

1. **队头阻塞**：一个连接同时只能处理一个请求-响应
2. **头部冗余**：每次请求携带完整头部，Cookie 可能很大
3. **文本协议**：解析效率低
4. **6 连接限制**：浏览器对同一域名最多 6 个并行连接

这些问题在 HTTP/2 中被解决。

---

## 参考资料

- [RFC 9110 - HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110)
- [RFC 9112 - HTTP/1.1](https://datatracker.ietf.org/doc/html/rfc9112)
- [RFC 6265 - HTTP State Management Mechanism (Cookie)](https://datatracker.ietf.org/doc/html/rfc6265)
- [RFC 7234 - HTTP Caching](https://datatracker.ietf.org/doc/html/rfc7234)

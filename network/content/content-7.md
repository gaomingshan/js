# 第 7 章：DNS 协议

> **学习目标**：理解 DNS 域名解析的完整流程，掌握 DNS 报文格式与记录类型
> **预计时长**：3 小时
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

### 1.1 DNS 概述

DNS（Domain Name System）是互联网的"电话簿"，将人类可读的域名转换为 IP 地址。它是一个分布式、层次化的命名系统。

**DNS 的核心功能**：
- **域名解析**：域名 → IP 地址
- **反向解析**：IP 地址 → 域名
- **邮件路由**：MX 记录指定邮件服务器
- **服务发现**：SRV 记录指定服务端口

```
DNS 层次结构：
            根域 (.)
           /    \
        com      org      net
       /   \      |        \
    example  google  example   cloudflare
   /    \
 www    api
```

### 1.2 DNS 解析流程

```
浏览器 → 本地缓存 → 操作系统缓存 → 本地 DNS 服务器 → 递归/迭代查询

完整解析 www.example.com：
1. 本地 DNS → 根域名服务器："com 顶级域在哪？"
2. 根服务器 → 本地 DNS："去 .com 服务器"
3. 本地 DNS → .com 服务器："example.com 在哪？"
4. .com 服务器 → 本地 DNS："去 example.com 权威服务器"
5. 本地 DNS → 权威服务器："www.example.com 的 IP？"
6. 权威服务器 → 本地 DNS："93.184.216.34"
7. 本地 DNS → 客户端：93.184.216.34
```

**递归查询 vs 迭代查询**：
- **递归**：客户端问本地 DNS，本地 DNS 负责追到底（客户端→本地DNS）
- **迭代**：本地 DNS 逐级问各级服务器，每级返回下一级地址（本地DNS→根→.com→权威）

---

## 2. 报文结构

### 2.1 DNS 报文格式

DNS 查询和响应使用相同的报文格式：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Transaction ID       |            Flags            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Questions Count        |       Answer RRs Count       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      Authority RRs Count      |     Additional RRs Count     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                      Questions Section                        +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                       Answers Section                         +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                    Authority Section                          +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                   Additional Section                          +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.2 Flags 字段详解

```
 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
|QR|   Opcode  |AA|TC|RD|RA|  |  |AD|CD|   RCODE  |
+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
```

| 位 | 字段 | 含义 |
|----|------|------|
| 0 | QR | 0=查询, 1=响应 |
| 1-4 | Opcode | 0=标准查询, 1=反向查询, 4=通知 |
| 5 | AA | 权威应答 |
| 6 | TC | 截断（UDP 超过 512 字节） |
| 7 | RD | 期望递归 |
| 8 | RA | 支持递归 |
| 9-10 | 保留 | - |
| 11 | AD | 已认证数据 |
| 12 | CD | 禁用安全检查 |
| 13-15 | RCODE | 响应码：0=无错误, 3=域名不存在(NXDOMAIN) |

### 2.3 Question 格式

```
域名编码（标签序列）：
"www.example.com" → 03 77 77 77 07 65 78 61 6d 70 6c 65 03 63 6f 6d 00
                     ↑长度3  w w w  ↑长度7  e x a m p l e  ↑长度3 c o m ↑结束

+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            QTYPE              |            QCLASS            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.4 Resource Record 格式

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           NAME                                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            TYPE               |            CLASS              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          TTL                                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          RDLENGTH             |          RDATA                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## 3. 具体能力

### 3.1 记录类型

| 类型 | 值 | 说明 | 示例 |
|------|-----|------|------|
| A | 1 | IPv4 地址 | 93.184.216.34 |
| AAAA | 28 | IPv6 地址 | 2606:2800:220::1 |
| CNAME | 5 | 别名 | www.example.com → example.com |
| MX | 15 | 邮件服务器 | 10 mail.example.com |
| NS | 2 | 域名服务器 | ns1.example.com |
| TXT | 16 | 文本记录 | SPF/DKIM/验证 |
| SOA | 6 | 起始授权 | 主DNS/管理员/序列号/刷新时间 |
| SRV | 33 | 服务定位 | _http._tcp.example.com 10 60 80 server |
| PTR | 12 | 反向解析 | 34.216.184.93.in-addr.arpa → www |
| CAA | 257 | 证书授权 | 0 issue "letsencrypt.org" |

### 3.2 DNS 缓存

DNS 使用 TTL（Time To Live）控制缓存有效期：

```
SOA 记录中的缓存参数：
- MNAME     : 主 DNS 服务器
- RNAME     : 管理员邮箱 (hostmaster.example.com)
- SERIAL    : 区域版本号（从服务器据此判断是否需要更新）
- REFRESH   : 从服务器检查间隔（如 3600s）
- RETRY     : 检查失败重试间隔（如 900s）
- EXPIRE    : 从服务器数据过期时间（如 604800s）
- MINIMUM   : 否定缓存 TTL（如 86400s）
```

### 3.3 DNS 负载均衡

**轮询（Round Robin）**：同一域名返回多个 A 记录，每次查询顺序不同：

```
$ dig example.com
;; ANSWER SECTION:
example.com.  300  IN  A  93.184.216.34
example.com.  300  IN  A  93.184.216.35
example.com.  300  IN  A  93.184.216.36
```

**GeoDNS**：根据客户端地理位置返回最近的 IP。

**Anycast**：多个 DNS 服务器使用相同 IP，BGP 路由到最近节点。

---

## 4. 报文样例

### 4.1 DNS 查询报文

查询 www.example.com 的 A 记录：

```
12 34 01 00  00 01 00 00  00 00 00 00
03 77 77 77  07 65 78 61  6d 70 6c 65  03 63 6f 6d  00
00 01 00 01
```

**逐字段解析**：

```
12 34       → Transaction ID=0x1234
01 00       → Flags=0x0100 (RD=1, 标准查询)
00 01       → Questions=1
00 00       → Answer RRs=0
00 00       → Authority RRs=0
00 00       → Additional RRs=0
--- Question ---
03 77 77 77 → 标签 "www" (长度3)
07 65 78 61 6d 70 6c 65 → 标签 "example" (长度7)
03 63 6f 6d → 标签 "com" (长度3)
00          → 域名结束
00 01       → QTYPE=A (1)
00 01       → QCLASS=IN (1)
```

### 4.2 DNS 响应报文

```
12 34 81 80  00 01 00 01  00 00 00 00
03 77 77 77  07 65 78 61  6d 70 6c 65  03 63 6f 6d  00
00 01 00 01
c0 0c        → NAME (指针压缩, 指向偏移12)
00 01        → TYPE=A
00 01        → CLASS=IN
00 00 01 2c  → TTL=300 秒
00 04        → RDLENGTH=4
5d b8 d8 22  → RDATA=93.184.216.34
```

**逐字段解析**：

```
12 34       → Transaction ID=0x1234 (与查询匹配)
81 80       → Flags=0x8180 (QR=1 响应, RD=1, RA=1)
00 01       → Questions=1
00 01       → Answer RRs=1
00 00       → Authority RRs=0
00 00       → Additional RRs=0
--- Question (同查询) ---
--- Answer ---
c0 0c       → NAME=指针压缩 (0xC0=指针标记, 0x0C=偏移12)
00 01       → TYPE=A
00 01       → CLASS=IN
00 00 01 2c → TTL=300
00 04       → RDLENGTH=4
5d b8 d8 22 → 93.184.216.34
```

**指针压缩**：`0xC0 0x0C` 表示域名在报文偏移 12 处（即 Question 中的域名），避免重复编码。

---

## 5. 深入一点

### DNS over HTTPS / TLS

传统 DNS 明文传输，存在窃听和篡改风险：

| 协议 | 端口 | 说明 |
|------|------|------|
| Do53 | 53/UDP,TCP | 传统 DNS |
| DoT | 853/TCP | DNS over TLS |
| DoH | 443/HTTPS | DNS over HTTPS |
| DoQ | 853/QUIC | DNS over QUIC |

### DNSSEC

DNSSEC 为 DNS 响应添加数字签名，防止篡改：

- **RRSIG**：资源记录签名
- **DNSKEY**：公钥
- **DS**：委托签名者（父域验证子域密钥）
- 验证链：根 DNSKEY → .com DS → example.com DNSKEY → RRSIG

---

## 参考资料

- [RFC 1035 - Domain Names - Implementation](https://datatracker.ietf.org/doc/html/rfc1035)
- [RFC 8484 - DNS over HTTPS](https://datatracker.ietf.org/doc/html/rfc8484)
- [RFC 7858 - DNS over TLS](https://datatracker.ietf.org/doc/html/rfc7858)
- [RFC 4033-4035 - DNSSEC](https://datatracker.ietf.org/doc/html/rfc4033)

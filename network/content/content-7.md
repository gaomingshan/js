# DNS 域名系统

> 应用层 | 域名 → IP 映射 | 分布式数据库 | 端口 53（UDP/TCP）

---

## 报文结构

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Header (12B)                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Question (可变)                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Answer   (可变)                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Authority (可变)                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Additional (可变)                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Header（12B 固定）

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           ID                                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|QR| Opcode |AA|TC|RD|RA|   Z    |   RCODE                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          QDCOUNT                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          ANCOUNT                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          NSCOUNT                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          ARCOUNT                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| ID | 16bit | 请求与响应匹配标识 |
| QR | 1bit | 0=查询，1=响应 |
| Opcode | 4bit | 0=标准查询，1=反向查询，2=状态查询 |
| AA | 1bit | 权威应答（Authoritative Answer） |
| TC | 1bit | 截断标志（TrunCation），UDP 包太大时设 1 |
| RD | 1bit | 期望递归（Recursion Desired） |
| RA | 1bit | 支持递归（Recursion Available） |
| RCODE | 4bit | 0=无错，3=NXDOMAIN（域名不存在） |
| QDCOUNT | 16bit | Question 记录数 |
| ANCOUNT | 16bit | Answer 记录数 |
| NSCOUNT | 16bit | Authority 记录数 |
| ARCOUNT | 16bit | Additional 记录数 |

### Question 格式

| 字段 | 长度 | 含义 |
|------|------|------|
| QNAME | 可变 | 域名（长度+标签，0 结尾），如 `3www4baidu3com0` |
| QTYPE | 16bit | A(1)/AAAA(28)/CNAME(5)/MX(15)/NS(2) |
| QCLASS | 16bit | IN(1)=Internet |

### 资源记录（Answer / Authority / Additional）

| 字段 | 长度 | 含义 |
|------|------|------|
| NAME | 可变 | 域名（可压缩指针） |
| TYPE | 16bit | 同 QTYPE |
| CLASS | 16bit | IN(1) |
| TTL | 32bit | 存活秒数 |
| RDLENGTH | 16bit | RDATA 长度 |
| RDATA | 可变 | A=4B IP，AAAA=16B IP，CNAME=域名，MX=优先级+域名 |

---

## 核心能力

### 1. 递归 vs 迭代查询

为什么需要：客户端不懂 DNS 树形结构，递归 DNS 代劳遍历全局。

```
客户端                   递归DNS                 根                   TLD(.com)            权威(ns.baidu.com)
  |                       |                     |                     |                    |
  |-- baidu.com -------->|                     |                     |                    |
  |                       |-- .com 在哪 ------->|                     |                    |
  |                       |<-- ns.com IP ------|                     |                    |
  |                       |                     |                     |                    |
  |                       |-- baidu.com 在哪 ----------------------->|                    |
  |                       |<-- ns.baidu.com IP ----------------------|                    |
  |                       |                     |                     |                    |
  |                       |-- baidu.com -------------------------------------------------->|
  |                       |<-- 1.1.1.1 ----------------------------------------------------|
  |                       |                     |                     |                    |
  |<--- 1.1.1.1 ---------|                     |                     |                    |
```

- **递归查询**：客户端只问一次递归 DNS，后续递归 DNS 代劳
- **迭代查询**：递归 DNS 依次问根→TLD→权威，各服务器只回"找谁问"
- 递归 DNS 通常由 ISP 或公共 DNS（8.8.8.8/1.1.1.1）提供

---

### 2. DNS 缓存

为什么需要：避免每次查询都走完整递归链路，减少延迟、降低根服务器压力。

```
递归DNS缓存：
 +------------------+     TTL=300    +------------------+
 | baidu.com = 1.1.1.1 |   ←━━━━━━   | 权威服务器        |
 +------------------+               +------------------+
   ↑ 秒级响应
   |
 客户端

 缓存命中：~1ms，无缓存：~100ms+
```

- TTL 由权威服务器控制，递归 DNS 在 TTL 内直接回复
- 缓存过大 → IP 切换不及时；缓存过小 → 递归查询频繁
- 负缓存（NXDOMAIN）：域名不存在的回复也缓存，防重复查询

---

### 3. 记录类型

| 类型 | 作用 | 使用场景 |
|------|------|----------|
| A | 域名 → IPv4 | `baidu.com → 110.42.76.20` |
| AAAA | 域名 → IPv6 | `baidu.com → 2400:da00::666` |
| CNAME | 别名 → 真名 | `www.baidu.com → www.a.shifen.com` |
| MX | 邮件交换器 | `@baidu.com → mx.baidu.com, priority 10` |
| NS | 权威 DNS 服务器 | `baidu.com → ns.baidu.com` |
| SOA | 区域权威元数据 | 主 DNS、邮箱、序列号、刷新间隔 |
| TXT | 任意文本 | SPF/DKIM/DMARC 验证 |

---

### 4. 负载均衡

| 方式 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| DNS 轮询 | 一个域名返回多个 A 记录，顺序轮换 | 简单，零开销 | 不感知后端健康，客户端随机选 |
| GeoDNS | 根据客户端 IP 返回最近的服务器 | CDN 核心，延迟低 | 需要 GeoIP 数据库 |
| SRV 记录 | 指定目标+端口+优先级+权重 | 精细控制，支持权重 | 需应用层支持解析 |

```
DNS 轮询：
  api.example.com  →  1.1.1.1    (权重 50)
                   →  2.2.2.2    (权重 50)
  ← 每次查询顺序打乱，客户端随机取第一个

GeoDNS：
  北京客户端 → 返回 北京CDN IP
  纽约客户端 → 返回 纽约CDN IP
```

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么查询用 UDP | 一个 DNS 包通常 ≤ 512B（EDNS 可到 4096），UDP 无连接、一次往返搞定，延迟最低 |
| 什么时候切换到 TCP | TC=1 表示响应被截断，客户端需用 TCP 重发以确保完整接收 |
| 为什么区域传输（XFR）用 TCP | 传输整个域名区数据量大（数万条记录），需可靠传输、分段、流量控制 |
| 为什么根服务器只有 13 个 IP | 一个 UDP 包 512B（EDNS0 前），13 个 NS 地址刚好塞进 |
| 为什么需要 EDNS | 原 512B 限制不够放 DNSSEC、IPv6、大响应 |
| 为什么有 TTL | 缓存需要过期策略，不然 IP 变了全世界都不知道 |

---

## 排障速查

| 问题 | 命令 | 原因 |
|------|------|------|
| 解析慢 | `dig +trace baidu.com` 看哪步延迟高 | 递归 DNS 远 / DNS 服务器无响应 |
| 域名不通 | `nslookup baidu.com` | 域名存在？ |
| 但 curl 不通 | `dig baidu.com` + `curl -v http://ip` | 返回 IP 错了 / DNS 被劫持 |
| MX 收不到邮件 | `dig baidu.com MX` | MX 优先级不对 / 没有 MX |
| SPF 失败 | `dig baidu.com TXT` | TXT 记录不包含发信 IP |
| 解析到旧 IP | `dig baidu.com` 看 TTL | DNS 缓存未刷新，`ipconfig /flushdns` |

```bash
# dig —— DNS 诊断王牌
dig baidu.com any                         # 查询所有记录
dig +short baidu.com                      # 只取 IP
dig +trace baidu.com                      # 递归跟踪全程
dig @8.8.8.8 baidu.com                    # 指定 DNS 服务器
dig -x 1.1.1.1                            # 反向查询（IP → 域名）
dig baidu.com MX                          # 查 MX

# nslookup —— Windows 友好
nslookup baidu.com
nslookup baidu.com 8.8.8.8

# 清缓存（Windows）
ipconfig /flushdns

# 清缓存（macOS）
sudo killall -HUP mDNSResponder

# DNS 响应时间
dig +stats baidu.com | grep "Query time"
```

---

## 常用工具

```bash
# dig
dig +short baidu.com                                   # A 记录
dig AAAA google.com +short                             # AAAA
dig baidu.com MX +short                                # MX
dig baidu.com NS +short                                # NS
dig baidu.com SOA +short                               # SOA
dig +trace example.com                                 # 全链路

# nslookup — 交互模式
nslookup
> server 8.8.8.8
> set type=mx
> baidu.com

# host — 简版
host baidu.com
host -t MX baidu.com

# whois — 查域名注册
whois baidu.com

# /etc/resolv.conf — 本地递归 DNS 配置
cat /etc/resolv.conf

# Windows：ipconfig /all → DNS Servers
ipconfig /all | findstr "DNS"
```

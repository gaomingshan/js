# 网络协议速查手册

> 面向实战的协议参考手册，查结构、看交互、找排障

---

## 网络层

| # | 协议 | 特点 |
|---|------|------|
| [IP](./content/content-1.md) | IPv4/IPv6 | 寻址、子网、NAT、分片、TTL |
| [ICMP](./content/content-2.md) | 网络诊断 | ping、traceroute、差错报告 |
| [ARP](./content/content-3.md) | 地址解析 | IP→MAC、缓存、Gratuitous ARP、欺骗 |

## 传输层 / 安全层

| # | 协议 | 特点 |
|---|------|------|
| [TCP](./content/content-4.md) | 可靠传输 | 三次握手、滑动窗口、拥塞控制、状态机、排障 |
| [UDP](./content/content-5.md) | 轻量传输 | 无连接、无可靠、多播、校验和 |
| [TLS](./content/content-6.md) | 安全传输 | 1.2/1.3 握手、密码套件、证书链、AEAD |

## 应用层 — Web 协议族

| # | 协议 | 特点 |
|---|------|------|
| [DNS](./content/content-7.md) | 域名解析 | 递归/迭代、缓存、记录类型、负载均衡 |
| [HTTP/1.1](./content/content-8.md) | Web 基础 | 请求/响应、缓存、Keep-Alive、HOL |
| [HTTP/2](./content/content-9.md) | 高性能 Web | 二进制帧、多路复用、HPACK、Server Push |
| [HTTP/3 + QUIC](./content/content-10.md) | 下一代 Web | 0-RTT、连接迁移、无 HOL、UDP 传输 |

## 应用层 — 实时通信

| # | 协议 | 特点 |
|---|------|------|
| [WebSocket](./content/content-11.md) | 全双工 | 握手升级、帧类型、掩码、心跳 |
| [RTP/RTCP](./content/content-12.md) | 实时传输 | RTP 时序、RTCP 反馈、SSRC 同步 |
| [RTSP](./content/content-13.md) | 流媒体控制 | 播放控制、SDP 协商、RTP 配合 |

## 应用层 — 邮件与文件

| # | 协议 | 特点 |
|---|------|------|
| [SMTP](./content/content-14.md) | 邮件发送 | 发送流程、AUTH、STARTTLS、中继 |
| [POP3/IMAP](./content/content-15.md) | 邮件接收 | POP3 下载、IMAP 同步、多设备 |
| [FTP](./content/content-16.md) | 文件传输 | 双通道、主动/被动、断点续传 |

## 应用层 — 远程与消息

| # | 协议 | 特点 |
|---|------|------|
| [SSH](./content/content-17.md) | 安全远程 | 密钥交换、认证、端口转发、SFTP |
| [AMQP](./content/content-18.md) | 消息队列 | 交换机、确认、虚拟主机、死信 |
| [MQTT](./content/content-19.md) | IoT 消息 | 发布/订阅、QoS、遗嘱、保留 |

## 应用层 — 管理与 RPC

| # | 协议 | 特点 |
|---|------|------|
| [SNMP](./content/content-20.md) | 网络管理 | Get/Set/Trap、MIB/OID、v3 安全 |
| [gRPC](./content/content-21.md) | 高性能 RPC | 四种通信模式、Protobuf、HTTP/2 |

## 综合

| # | 内容 |
|---|------|
| [协议栈全景与选型](./content/content-22.md) | 分层图、性能对比、安全对比、选型树、组合模式 |

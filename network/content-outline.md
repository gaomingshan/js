# 网络协议体系化学习大纲

> **学习目标**：系统性掌握从网络层到应用层的常用网络协议  
> **适合对象**：应用开发者，希望深入理解网络协议原理与报文细节  
> **学习方式**：原理讲解 + 报文结构 + 具体能力 + 原始报文样例

---

## 📚 学习路线图

```
网络层（IP/ICMP/ARP） → 传输层（TCP/UDP） → 安全传输（TLS/SSL）
   ↓
Web 协议族（DNS/HTTP/1.1/HTTP/2/HTTP/3） → 实时通信（WebSocket/RTP/RTSP）
   ↓
邮件与文件（SMTP/POP3/IMAP/FTP） → 远程安全（SSH）
   ↓
消息队列与 IoT（AMQP/MQTT） → 网络管理（SNMP） → RPC（gRPC）
   ↓
协议综合分析
```

---

## 第一部分：网络层（Layer 3）

### [1. IP 协议（IPv4/IPv6）](./content/content-1.md)
- IPv4 头部结构与字段解析
- IPv6 头部结构与改进设计
- IP 地址分类、子网划分、NAT
- 分片与重组、TTL 机制
- IPv4/IPv6 报文原始十六进制样例

**学习重点**：理解 IP 协议的寻址与路由机制  
**预计时长**：3 小时

---

### [2. ICMP 协议](./content/content-2.md)
- ICMP 报文类型与代码
- Echo Request/Reply（ping 原理）
- Destination Unreachable、Time Exceeded、Redirect
- ICMP 报文原始十六进制样例

**学习重点**：掌握网络诊断与错误报告机制  
**预计时长**：2 小时

---

### [3. ARP 协议](./content/content-3.md)
- ARP 解析流程
- ARP 缓存与生命周期
- Gratuitous ARP 与 ARP 欺骗
- ARP 报文原始十六进制样例

**学习重点**：理解 IP 到 MAC 的地址映射机制  
**预计时长**：2 小时

---

## 第二部分：传输层（Layer 4）

### [4. TCP 协议](./content/content-4.md)
- TCP 头部结构与标志位
- 三次握手与四次挥手
- 滑动窗口协议（流量控制）
- 拥塞控制（慢启动、拥塞避免、快重传、快恢复）
- 超时重传与 RTT 估算
- Nagle 算法与延迟 ACK
- TCP 状态机
- TCP 报文原始十六进制样例

**学习重点**：深入理解 TCP 的可靠传输机制  
**预计时长**：6 小时

---

### [5. UDP 协议](./content/content-5.md)
- UDP 头部结构
- 低延迟与无拥塞控制
- 广播/多播支持
- 校验和机制
- UDP 报文原始十六进制样例

**学习重点**：理解 UDP 的轻量级传输特性  
**预计时长**：2 小时

---

## 第三部分：安全传输层

### [6. TLS/SSL 协议](./content/content-6.md)
- TLS 记录层与握手层
- TLS 1.2 vs 1.3 握手流程
- 密码套件协商
- 证书链验证
- 密钥交换（RSA、ECDHE）
- 对称加密与 MAC/AEAD
- TLS 报文原始十六进制样例

**学习重点**：掌握加密通信的握手与数据传输机制  
**预计时长**：4 小时

---

## 第四部分：应用层 - Web 协议族

### [7. DNS 协议](./content/content-7.md)
- DNS 报文格式（Header + Question + Answer + Authority + Additional）
- 递归查询 vs 迭代查询
- 记录类型（A/AAAA/CNAME/MX/NS/TXT/SOA）
- DNS 缓存与负载均衡
- DNS 报文原始十六进制样例

**学习重点**：理解域名解析的完整流程  
**预计时长**：3 小时

---

### [8. HTTP/1.1 协议](./content/content-8.md)
- 请求/响应报文结构
- 请求方法（GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS）
- 状态码分类（1xx/2xx/3xx/4xx/5xx）
- 持久连接（Keep-Alive）
- 内容协商与缓存机制
- Cookie 与 Session
- HTTP 报文原始十六进制样例

**学习重点**：掌握 HTTP/1.1 的核心机制与报文格式  
**预计时长**：4 小时

---

### [9. HTTP/2 协议](./content/content-9.md)
- 二进制分帧层
- 帧格式（Frame）、流（Stream）、消息（Message）
- 多路复用与头部压缩（HPACK）
- 服务端推送与流优先级
- 流量控制
- HTTP/2 帧报文原始十六进制样例

**学习重点**：理解 HTTP/2 的性能优化设计  
**预计时长**：3 小时

---

### [10. HTTP/3 与 QUIC 协议](./content/content-10.md)
- QUIC 包格式与连接 ID
- 0-RTT 连接建立
- 连接迁移
- 无队头阻塞的多路复用
- 内置 TLS 1.3
- QUIC/HTTP/3 报文原始十六进制样例

**学习重点**：理解基于 UDP 的可靠传输与 HTTP/3 设计  
**预计时长**：3 小时

---

## 第五部分：应用层 - 实时通信与流媒体协议

### [11. WebSocket 协议](./content/content-11.md)
- 帧格式（FIN + opcode + mask + payload）
- 握手升级（HTTP Upgrade）
- 数据帧类型（text/binary/ping/pong/close）
- 掩码机制与分片传输
- 心跳保活
- WebSocket 报文原始十六进制样例

**学习重点**：掌握全双工持久连接的实现机制  
**预计时长**：3 小时

---

### [12. RTP/RTCP 协议](./content/content-12.md)
- RTP 头部（12字节固定）
- 序列号与时间戳、SSRC/CSRC
- RTCP 报文类型（SR/RR/SDES/BYE/APP）
- 传输质量反馈与同步机制
- RTP/RTCP 报文原始十六进制样例

**学习重点**：理解实时音视频传输与质量反馈机制  
**预计时长**：3 小时

---

### [13. RTSP 协议](./content/content-13.md)
- 请求/响应格式（类似 HTTP）
- 方法（OPTIONS/DESCRIBE/SETUP/PLAY/PAUSE/TEARDOWN）
- 会话管理与传输参数协商
- RTSP 报文样例

**学习重点**：掌握流媒体控制协议的交互流程  
**预计时长**：2 小时

---

## 第六部分：应用层 - 邮件与文件传输协议

### [14. SMTP 协议](./content/content-14.md)
- 命令/响应格式
- 认证（SMTP AUTH）
- STARTTLS 加密
- 邮件中继
- SMTP 会话报文样例

**学习重点**：理解邮件发送的交互流程  
**预计时长**：2 小时

---

### [15. POP3/IMAP 协议](./content/content-15.md)
- POP3 下载删除/保留模式
- IMAP 文件夹同步与 IDLE 推送
- 命令/响应格式
- POP3/IMAP 会话报文样例

**学习重点**：对比两种邮件接收协议的差异  
**预计时长**：2 小时

---

### [16. FTP 协议](./content/content-16.md)
- 命令通道 + 数据通道
- 主动模式 vs 被动模式
- 断点续传与匿名登录
- FTP 报文样例

**学习重点**：理解 FTP 双通道传输模型  
**预计时长**：2 小时

---

## 第七部分：应用层 - 远程与安全协议

### [17. SSH 协议](./content/content-17.md)
- Transport Layer + Authentication Layer + Connection Layer
- 密钥交换与公钥认证
- 端口转发、SFTP、SCP
- SSH 报文原始十六进制样例

**学习重点**：掌握安全远程登录的分层设计  
**预计时长**：3 小时

---

## 第八部分：应用层 - 消息队列与 IoT 协议

### [18. AMQP 协议](./content/content-18.md)
- AMQP 帧格式（Frame Type + Channel + Size + Payload + End）
- 交换机类型（Direct/Fanout/Topic/Headers）
- 消息确认、持久化与流量控制
- 虚拟主机
- AMQP 报文原始十六进制样例

**学习重点**：理解高级消息队列的可靠传递机制  
**预计时长**：3 小时

---

### [19. MQTT 协议](./content/content-19.md)
- 固定头 + 可变头 + 载荷
- 三种 QoS 级别（0/1/2）
- 主题过滤（通配符 +/#）
- 遗嘱消息与保留消息
- 会话保持
- MQTT 报文原始十六进制样例

**学习重点**：掌握轻量级消息传输的 QoS 机制  
**预计时长**：3 小时

---

## 第九部分：应用层 - 网络管理协议

### [20. SNMP 协议](./content/content-20.md)
- SNMP 报文格式（版本 + Community + PDU）
- SNMPv1/v2c/v3 版本差异
- MIB 与 OID
- Get/Set/GetNext/GetBulk/Trap 操作
- v3 安全模型（USM）
- SNMP 报文原始十六进制样例

**学习重点**：理解网络管理的协议体系与安全演进  
**预计时长**：3 小时

---

## 第十部分：应用层 - RPC 与微服务协议

### [21. gRPC 协议](./content/content-21.md)
- gRPC 帧（Length-Prefixed Message）
- HTTP/2 映射
- 四种通信模式（Unary/Server Streaming/Client Streaming/Bidirectional）
- Protocol Buffers 编码
- 超时与重试、元数据传递、健康检查
- gRPC 报文原始十六进制样例

**学习重点**：掌握高性能 RPC 的协议设计  
**预计时长**：3 小时

---

## 第十一部分：协议综合分析

### [22. 协议栈全景与选型指南](./content/content-22.md)
- 网络协议栈全景图（从网络层到应用层）
- 各协议性能特征对比
- 安全性对比
- 典型应用场景与协议选择
- 协议组合使用模式（如 HTTP/2 + TLS + gRPC）

**学习重点**：建立协议选型的全局视角  
**预计时长**：2 小时

---

## 📖 附录：协议速查表

| 协议 | 层次 | 端口 | 可靠性 | 典型用途 |
|------|------|------|--------|----------|
| IPv4/IPv6 | 网络层 | - | 尽力交付 | 寻址与路由 |
| ICMP | 网络层 | - | - | 网络诊断 |
| ARP | 网络层/链路层 | - | - | 地址解析 |
| TCP | 传输层 | - | 可靠 | Web、邮件、文件传输 |
| UDP | 传输层 | - | 不可靠 | DNS、流媒体、IoT |
| TLS | 会话层 | - | 加密 | 安全通信 |
| DNS | 应用层 | 53 | - | 域名解析 |
| HTTP/1.1 | 应用层 | 80/443 | - | Web 应用 |
| HTTP/2 | 应用层 | 443 | - | 高性能 Web |
| HTTP/3 | 应用层 | 443 | - | 低延迟 Web |
| WebSocket | 应用层 | 80/443 | - | 实时双向通信 |
| RTP/RTCP | 应用层 | 动态 | - | 音视频传输 |
| RTSP | 应用层 | 554 | - | 流媒体控制 |
| SMTP | 应用层 | 25/587 | - | 邮件发送 |
| POP3 | 应用层 | 110/995 | - | 邮件接收 |
| IMAP | 应用层 | 143/993 | - | 邮件接收 |
| FTP | 应用层 | 21/20 | - | 文件传输 |
| SSH | 应用层 | 22 | 加密 | 远程登录 |
| AMQP | 应用层 | 5672 | - | 消息队列 |
| MQTT | 应用层 | 1883/8883 | - | IoT 消息 |
| SNMP | 应用层 | 161/162 | - | 网络管理 |
| gRPC | 应用层 | - | - | RPC 调用 |

---

**开始学习** → [第 1 章：IP 协议](./content/content-1.md)

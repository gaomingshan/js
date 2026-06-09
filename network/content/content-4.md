# TCP 传输控制协议

> 传输层 | 面向连接 | 可靠字节流 | 全双工 | 端口 16bit

---

## 报文结构

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |           |U|A|P|R|S|F|                               |
| Offset| Reserved  |R|C|S|S|Y|I|            Window             |
|       |           |G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Checksum              |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |    Padding    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| Source / Dest Port | 16bit | 标识应用 |
| Sequence Number | 32bit | 本报文首个字节的流位置 |
| Acknowledgment Number | 32bit | 期望的下一个序号（ACK=1 时有效） |
| Data Offset | 4bit | 头部长度，单位 4B。最小 5（20B），最大 15（60B） |
| Flags | 6bit | URG ACK PSH RST SYN FIN |
| Window | 16bit | 接收方剩余缓冲区，流控用 |
| Checksum | 16bit | 覆盖头部+数据+伪头部 |
| Options | 可变 | 见下表 |

### 常用选项

| 选项 | 作用 | 为什么 |
|------|------|--------|
| MSS | 协商最大段大小（通常 1460） | 避免 IP 分片 |
| Window Scale | 窗口左移 N bit（最大 14），从 64KB 扩到 1GB | 16bit 窗口在高速网不够用 |
| SACK | 精确告知哪些段丢了、哪些收到了 | 无 SACK 一个丢包要 Go-Back-N 全部重传 |
| Timestamps | 精确 RTT 测量 + 防序号绕回 | 高速连接序号很快绕回，需区分新旧 |

---

## 核心能力

### 1. 可靠传输 —— 确认 + 重传

IP 不可靠（丢包/乱序/重复），TCP 在上层用序号+ACK+重传构建可靠字节流。

```
正常：
发 →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→ 收
    Seq=1, Len=1460
    Seq=1461, Len=1460
    Seq=2921, Len=1460
←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
     ACK=4381 (确认收到 1~4380)

丢包 + 快重传：
发 →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→ 收
    Seq=1, Len=1460              → 收到
    Seq=1461, Len=1460           → 丢失 ×
    Seq=2921, Len=1460           → 收到
    Seq=4381, Len=1460           → 收到
←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
     ACK=1461 (重复)
     ACK=1461 (重复)
     ACK=1461 (重复)  ← 第3次重复 → 触发快重传
发 →→→→→→→→→→→→→→→→→→→→→→ 重传 Seq=1461
←←←←←←←←←←←←←←←←←
     ACK=5841 (累积确认追上)
```

- 每个字节一个序号，ACK = 期望的下一个
- 超时未确认 → 重传，RTO 动态估算
- **3 个重复 ACK → 快重传**，不等超时

---

### 2. 流量控制 —— 滑动窗口

接收方缓冲区有限，通过 `Window` 字段告诉对端"还能收多少"。

```
发 →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→ 收
    Seq=1~4096, Len=4096                         发 4KB
    Seq=4097~8192, Len=4096                      发 4KB
←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
     ACK=8193, Window=2048          → 只剩 2KB 空间了
发 →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→
    Seq=8193~10240, Len=2048        → 按窗口限制发 2KB
←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
     ACK=10241, Window=0            → 装不下了！暂停
──── 发送方启动持续计时器，定期探测 ────
发 →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→
     Probe: Seq=10241 (1字节)
←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
     ACK=10241, Window=4096         → 恢复，继续
```

- Nagle：小报文等 ACK 或攒够 MSS 再发，减少小包数量
- 延迟 ACK：收到数据等 200ms 再 ACK，期望捎带
- **Nagle + 延迟 ACK 冲突**：Nagle 等 ACK，ACK 被延迟 200ms → 最高 200ms 延迟。解法：`TCP_NODELAY`

---

### 3. 拥塞控制 —— 慢启动 + 拥塞避免 + 快重传 + 快恢复

发送方不知道网络负载，发了可能打崩，不发又浪费带宽。通过 cwnd 自适应调节。

```
慢启动（指数增长）：
cwnd=1   → 发 1 个段 →← ACK → cwnd=2
cwnd=2   → 发 2 个 →← ACK → cwnd=4
cwnd=4   → 发 4 个 →← ACK → cwnd=8
... 直到 cwnd ≥ ssthresh

拥塞避免（线性增长）：
cwnd=ssthresh   → 每 RTT cwnd+=1    （10→11→12...）
cwnd=ssthresh+N → 每 RTT cwnd+=1

丢包 → 3 重复 ACK：
ssthresh = cwnd / 2
cwnd = ssthresh + 3  ← 不归零（快恢复），网络还能工作
继续拥塞避免

超时 → 网络疑似全堵：
ssthresh = cwnd / 2
cwnd = 1             ← 归零（慢启动），网络可能不通了
```

**小结**：

| 算法 | 触发条件 | cwnd 变化 | 为什么 |
|------|---------|-----------|--------|
| 慢启动 | 连接建立/超时后 | 每 RTT ×2 | 不知容量，指数探测最快 |
| 拥塞避免 | cwnd ≥ ssthresh | 每 RTT +1 | 接近极限，线性避震荡 |
| 快重传 | 3 重复 ACK | 立即重传丢失段 | 不等超时，减少等待 |
| 快恢复 | 快重传后 | cwnd /= 2（不归零） | 3 重 ACK 说明链路还能通 |

---

### 4. 连接建立 —— 三次握手

为什么两次不够：服务器无法确认客户端收到了自己的 SYN+ACK，历史 SYN 会让服务器空等。

```
Client                                    Server
  |                                          |
  |─── SYN ────────────────────────────────→|   Seq=x, 无数据
  |   Flags=SYN(0x02)                       |   进入 SYN_RCVD
  |   Options: MSS=1460, WS=5, SACK, TS     |   分配资源
  |                                          |
  |←── SYN+ACK ────────────────────────────|   Seq=y, Ack=x+1
  |   Flags=SYN+ACK(0x12)                   |   也带上自己的选项
  |                                          |
  |─── ACK ────────────────────────────────→|   Seq=x+1, Ack=y+1
  |   Flags=ACK(0x10)                       |   可以捎带数据了
  |                                          |
                   连接建立
```

- ISN 随机（基于时钟+四元组+密钥的哈希），防旧报文干扰新连接
- 第三次 ACK 可携带数据（减少一个 RTT）

---

### 5. 连接释放 —— 四次挥手

全双工，每个方向独立关闭。一方说"我不发了"不代表对方也没数据。

```
主动关闭方                               被动关闭方
  |                                          |
  |─── FIN ────────────────────────────────→|  (1) 我不发了
  |   Flags=FIN+ACK(0x11)                   |  进入 CLOSE_WAIT
  |   Seq=u, Ack=v                          |
  |                                          |
  |←── ACK ────────────────────────────────|  (2) 知道了
  |   Flags=ACK(0x10)                       |  主动方进入 FIN_WAIT_2
  |   Ack=u+1                               |
  |                                          |
  |   （被动方继续发剩余数据...）             |
  |                                          |
  |←── FIN ────────────────────────────────|  (3) 我也发完了
  |   Flags=FIN+ACK(0x11)                   |  进入 LAST_ACK
  |   Seq=w, Ack=u+1                        |
  |                                          |
  |─── ACK ────────────────────────────────→|  (4) 确认
  |   Flags=ACK(0x10)                       |  主动方进入 TIME_WAIT
  |   Ack=w+1                               |
  |                                          |
  2MSL 后 CLOSED                             收到 ACK 后 CLOSED
```

**TIME_WAIT 等 2MSL**：
- 最后 ACK 丢了 → 被动方重发 FIN → 主动方要留着状态重发 ACK
- 等 2MSL（通常 1~4 分钟），确保本连接所有报文消失，不污染下个连接

---

### 6. 状态机

```
CLOSED
  │── 被动打开 ──→ LISTEN
  │── 主动发 SYN → SYN_SENT
                    │
LISTEN ──收 SYN──→ SYN_RCVD ──收 ACK──→ ESTABLISHED
                    │                       │
                    │                 主动 FIN → FIN_WAIT_1 ──收 ACK──→ FIN_WAIT_2 ──收 FIN──→ TIME_WAIT ──2MSL──→ CLOSED
                    │                       │
                    │                 收 FIN → CLOSE_WAIT ──发 FIN──→ LAST_ACK ──收 ACK──→ CLOSED
```

| 状态堆积 | 意味着 | 排查 |
|----------|--------|------|
| `SYN_RECV` 暴增 | 服务器等第三次握手 | 可能 SYN Flood，`sysctl tcp_syncookies` |
| `TIME_WAIT` 数万 | 主动关闭方等 2MSL | 高并发短连接，考虑长连接或 `tcp_tw_reuse` |
| `CLOSE_WAIT` 成百上千 | 应用收到 FIN 但没调 close() | `lsof -i :port \| grep CLOSE_WAIT` 找进程 |
| `FIN_WAIT_2` 长期挂住 | 对端不发 FIN | 对端不关连接，等超时 |

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么三次不是两次 | 两次服务器不能确认客户端收到了 SYN+ACK |
| 为什么四次不是三次 | 一方 FIN 后另一方可能还有数据，不能强制关 |
| 为什么 ISN 不固定 | 防旧报文混入新连接 |
| 为什么需要 Window Scale | 16bit 窗口最大 64KB，10Gbps 一个 RTT 就爆了 |
| 为什么需要 SACK | 无 SACK 一个丢包后面全重传（Go-Back-N） |
| 为什么超时后 cwnd=1 | 超时说明网络可能完全堵了，归零最安全 |
| 为什么快重传后不归零 | 3 重复 ACK 说明数据还在流，只是某个段丢了 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| SYN Flood | `ss -tan state syn-recv` 数万 | `sysctl -w net.ipv4.tcp_syncookies=1` | 攻击/扫描 |
| TIME_WAIT 过多 | 端口占着不放 | `ss -tan state time-wait \| wc -l` | 短连接太多 |
| CLOSE_WAIT 堆积 | 连接不释放 | `lsof -i :port \| grep CLOSE_WAIT` | 应用没 close() |
| 高重传率 | `nstat -az \| grep RetransSegs` 持续涨 | `tcpdump` 抓包看丢包 | 拥塞/带宽满 |
| 连接超时 | 应用报 timeout | `ss -tan state syn-sent` 看 SYN 是否出去 | 防火墙/路由 |
| RST | 连接突然断开 | `tcpdump 'tcp[tcpflags] & tcp-rst != 0'` | 端口未监听 / 对端拒绝 |
| 零窗口 | 传输卡住 | `tcpdump 'tcp[14:2]=0'` 抓 Window=0 | 接收方处理慢 |

```bash
# 一键检查
echo "=== 连接状态 ==="
ss -tan | awk '{print $1}' | sort | uniq -c | sort -rn
echo "=== 重传 ==="
nstat -az | grep -E 'Retrans|Loss'
echo "=== RTT ==="
ss -ti | grep -o 'rtt:[^ ]*' | awk -F'[/]' '{print $2}' | sort -n | uniq -c | sort -rn | head -5
```

---

## 常用工具

```bash
# tcpdump —— 抓报文看交互
tcpdump -i eth0 -nn 'tcp port 80'                                    # HTTP 所有 TCP
tcpdump -i eth0 -nn 'tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0'  # 只抓 SYN
tcpdump -i eth0 -X 'tcp port 443'                                    # 十六进制看 HTTPS

# ss —— 连接状态
ss -tan                                           # 所有连接
ss -tan state time-wait                           # 只看 TIME_WAIT
ss -ti 'dport = :3306'                            # 看 MySQL TCB（cwnd/rtt/wscale）
ss -tan '( sport = :443 )' | awk '{print $1}' | sort | uniq -c -r  # HTTPS 分布

# nstat —— 协议栈统计
nstat -az | grep -E 'Retrans|Sack|Loss|Cwnd'

# 内核参数
sysctl net.ipv4.tcp_syncookies                    # SYN Cookie（默认 1）
sysctl net.ipv4.tcp_tw_reuse                      # TIME_WAIT 复用（默认 0）
sysctl net.ipv4.tcp_rmem                          # 接收缓冲：min default max
sysctl net.ipv4.tcp_congestion_control            # 拥塞算法：bbr / cubic
```

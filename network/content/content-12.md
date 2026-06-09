# RTP / RTCP

> 传输层（应用层框架） | 实时传输 | 时序敏感 | 容忍丢包 | 动态端口（通常 UDP 1024-65535 / RTCP = RTP Port+1）

---

## 报文结构

### RTP 固定头部

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|V=2|P|X|  CC   |M|     PT      |       Sequence Number        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Timestamp                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Synchronization Source (SSRC) Identifier            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            Contributing Source (CSRC) Identifiers             |
|                           (0-15 items)                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| V | 2bit | 版本号，当前 = 2 |
| P | 1bit | 填充标记，尾部有填充字节 |
| X | 1bit | 扩展头部标记 |
| CC | 4bit | CSRC 个数（0-15） |
| M | 1bit | 标记位（帧边界：视频关键帧/音频讲话开始） |
| PT | 7bit | 负载类型（96=H.264, 0=PCMU, 8=PCMA, etc） |
| Sequence Number | 16bit | 每包递增，检测丢包/乱序 |
| Timestamp | 32bit | 采样时钟滴答（如音频 8kHz，视频 90kHz） |
| SSRC | 32bit | 同步源标识，唯一标识一个 RTP 流 |
| CSRC | 32bit × CC | 贡献源列表（混音场景用） |

### 常用 Payload Type

| PT | 格式 | 时钟频率 | 用途 |
|----|------|---------|------|
| 0 | PCMU | 8kHz | G.711 μ-law 音频 |
| 8 | PCMA | 8kHz | G.711 A-law 音频 |
| 96-127 | dynamic | 90kHz | H.264/VP8/Opus 等动态分配 |

---

### RTCP 包格式

RTCP 有多个包类型，通用头部：

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|V=2|P|   RC    |     PT        |            Length             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         SSRC                                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| RTCP 类型 | PT | 作用 |
|-----------|----|------|
| SR (Sender Report) | 200 | 发送方统计：包数、字节数、NTP/RTP 时间戳 |
| RR (Receiver Report) | 201 | 接收方统计：丢包率、累计丢包、抖动、延迟 |
| SDES | 202 | 源描述：CNAME（规范名）、Name、Email、Tool |
| BYE | 203 | 离开会话 |
| APP | 204 | 应用自定义 |

### RTCP SR 细节

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        SSRC                                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         NTP Timestamp (MSW)                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         NTP Timestamp (LSW)                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         RTP Timestamp                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                   Sender's Packet Count                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                   Sender's Octet Count                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Report Block 1...                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### RTCP RR Report Block

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        SSRC of Source                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| fraction lost|       cumulative number of packets lost        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           extended highest sequence number received           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      interarrival jitter                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         last SR (LSR)                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         delay since last SR (DLSR)            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 含义 |
|------|------|
| fraction lost | 上一个间隔的丢包比例（8bit，单位 1/256） |
| cumulative lost | 总累计丢包 |
| jitter | 到达抖动（时间戳方差估计） |
| LSR + DLSR | 用于计算 RTT |

---

## 核心能力

### 1. RTP 实时传输 —— 时序敏感，不怕丢包怕延时

语音/视频等实时媒体中，延时超过一定阈值（如 200ms）用户就能感觉到卡顿，丢个把包只是音质轻微下降，TCP 重传带来的延时反而更无法接受。RTP 直接基于 UDP 传输，不保证可靠但保证及时。

```
发送端                               接收端
  |                                    |
  |── RTP PT=96, Seq=100, TS=1000 ──→|  H.264 NAL Unit
  |── RTP PT=96, Seq=101, TS=1000 ──→|  同一帧
  |── RTP PT=96, Seq=102, TS=1000 ──→|  
  |── RTP PT=96, Seq=103, TS=2000 ──→|  下一帧（Timestamp 跳了）
  |                                    |
  |    （丢包）                         |
  |── RTP PT=96, Seq=105, TS=2000 ──→|  丢失 Seq=104
  |                                    |  接收端从 Seq 不连续
  |                                    |  知道丢了 104
  |                                    |  → 可以请求重传（RTCP NACK）
  |                                    |  → 或者直接忽略（解码器容错）
  |                                    |
  └── 不重传也被接受 ──────────────────┘  
      时序优先，接收端抖动缓冲区 + 播放时钟同步
```

要点：
- RTP 不保证 QoS，需要下层网络（DiffServ/IntServ）做质量保证
- Jitter Buffer：接收端缓存 30-200ms，消除网络抖动
- 使用 Sequence Number 检测丢包和乱序
- 使用 Timestamp 保证播放节奏，包到达时间 ≠ 播放时间

---

### 2. RTCP 质量反馈 —— 丢包率、抖动、RTT

为什么：实时媒体需要根据网络质量动态调整码率、分辨率、FEC 强度。发送方知道自己发了多少，接收方知道丢了多少，双方需要交换信息。

```
周期报告（默认每 5 秒一次，随带宽/参与者数调整）：

发送端                                                   接收端
  |                                                         |
  |─── RTP (Seq=100~1200, 持续发送) ──────────────────────→|
  |─── RTP ... ────────────────────────────────────────────→|
  |                                                         |
  |←── RTCP RR (Receiver Report) ──────────────────────────|
  |     SSRC=接收端SSRC                                     |
  |     fraction lost: 0.02  (2%)                           |
  |     cumulative lost: 5                                  |
  |     jitter: 12ms                                        |
  |     LSR: 发送端上次 SR 的 NTP                           |
  |     DLSR: 本报告距上次 SR 延时                          |
  |                                                         |
  |   计算 RTT = 当前时间 - LSR - DLSR                      |
  |   发现丢包率高了 → 降低码率或增加 FEC                   |
  |                                                         |

发送端自己的报告：

发送端                                                   接收端
  |─── RTCP SR (Sender Report) ───────────────────────────→|
  |     SSRC=发送端SSRC                                     |
  |     NTP: 绝对时间（跨流同步用）                          |
  |     RTP TS: 对应 NTP 的 RTP 时戳                        |
  |     packets sent: 1100                                  |
  |     octets sent: 256000                                 |
  |     Report Block: 接收端丢包/抖动信息                   |
```

| 指标 | 公式 / 含义 | 阈值参考 |
|------|-------------|---------|
| 丢包率 | lost / expected | > 5% 画面开始花块，> 20% 通话不可用 |
| 抖动 | 包间隔时间差的方差 | < 30ms 良好，> 50ms 需要增大 jitter buffer |
| RTT | LSR + DLSR 计算 | < 100ms 优秀，> 300ms 通话有延迟感 |

---

### 3. SSRC/CSRC 同步 —— 多路音视频流的同步

一个 RTP 会话可能包含多个媒体流（音频、视频、字幕），或会议中多人发言混音。SSRC 标识每个独立的流，CSRC 用于混音场景标识原始贡献者。

```
单人音视频通化：
Audio:   SSRC=0xA1A1A1A1    PT=0 (PCMU)    TS 时钟 8kHz
Video:   SSRC=0xB2B2B2B2    PT=96 (H.264)  TS 时钟 90kHz
                            ↑ 不同 SSRC，独立序号空间

RTCP SDES 告诉接收端这是一起的：
    SSRC=0xA1A1A1A1 → CNAME="user@example"
    SSRC=0xB2B2B2B2 → CNAME="user@example"
                      ↑ 相同 CNAME → 接收端知道它们是同一个源的
                        音视频 → 唇同步

RTCP SR 里的 NTP + RTP Timestamp 做唇同步：
Audio SR:
    NTP = 2025-01-01 12:00:00.000
    RTP TS = 8000           → 1秒音频采样点

Video SR:
    NTP = 2025-01-01 12:00:00.000
    RTP TS = 90000          → 1秒视频采样点

    接收端用 NTP 对齐两个流的时间线：
    播放 Audio[TS=8000] 的同时播放 Video[TS=90000]

多人会议混音：

Microphone1 →               →   RTP 发送 SSRC=M1
Microphone2 →  MCU 混音器    →   PT=0 (PCMU)
Microphone3 →               →   CSRC=[M1, M2, M3]
                                 ↑ 接收端知道这包是
                                   谁的声音混合的
```

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 RTP 不保证可靠 | 实时媒体延时敏感：重传的包赶到时播放已经过了。宁可丢包也不要延时 |
| 为什么 Seq 和 TS 分开 | Seq 用于丢包检测和排序；TS 用于播放时钟同步。一帧可能有多个包（Seq 不同但 TS 相同） |
| 为什么需要 SSRC + CNAME 两套标识 | SSRC 是会话唯一，冲突可以变更；CNAME 是跨会话持久标识，用于 RTP 流关联 |
| 为什么 RTCP 周期不是固定值 | RTCP 带宽是会话带宽的 5%，防止大量参与者时 RTCP 淹没 RTP |
| 为什么 RTCP 端口 = RTP 端口 + 1（惯例） | 解复用简单：同一 Socket 对监听两个端口，RTCP 流量不影响 RTP 接收性能 |
| 为什么 PT 需要动态（96-127） | 静态分配不够用，SDP 协商时动态绑定（如 96=H.264, 97=Opus） |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| 丢包率太高 | 面画花块、马赛克 | RTCP RR 检查 `fraction lost` | WiFi 干扰 / 带宽不足 |
| RTP 流不同步 | 音画不同步（唇同步问题） | 检查 SR 中 NTP 与 RTP TS 映射关系，两端时钟偏差 | NTP 未同步 / 采集时钟漂移 |
| Jitter 过大 | 接收端出现缓冲溢出或饥饿 | RTCP RR 的 `jitter` 字段持续上升 | 网络拥塞 / 路由抖动 |
| SSRC 冲突 | 画面闪断/一条流变成两条 | 查看 SSRC 是否突然变化 | 发送方重启后 SSRC 未保持 |
| 单向音频 | 能听到对方但对方听不到自己 | 检查两端 RTCP BYE | 防火墙拦截上行 UDP |
| RTP 包全部丢失 | 抓包有数据但接收端没收到 | `tcpdump` 看目的端口，检查 NAT 是否开了端口 | NAT 端口映射未保持 / SIP 中 SDP 端口与实际不一致 |

```bash
# 抓 RTP 包分析
tcpdump -i eth0 -nn 'udp and portrange 10000-20000' -X

# 从抓包导出 RTP 载荷
tshark -r capture.pcap -Y "rtp" -T fields -e rtp.seq -e rtp.timestamp -e rtp.payload

# 计算 RTP 丢包率（wireshark 统计）
# Statistics → RTP → Show All Streams → 看 Lost% 列

# 查看 RTCP 报告
tshark -r capture.pcap -Y "rtcp" -T fields -e rtcp.ssrc -e rtcp.fraction

# Wireshark 过滤
rtp               # 所有 RTP 包
rtcp              # 所有 RTCP 包
rtp.ssrc == 0xA1A1A1A1   # 特定流
rtcp.fraction > 5         # 丢包 > 5% 的 RTCP 报告
```

---

## 常用工具

```bash
# tcpdump —— 抓 RTP 流
tcpdump -i eth0 -nn 'udp and port 5004'

# tshark —— 分析 RTP 统计
tshark -r pcap -z rtp,streams,<ssrc>
tshark -r pcap -z rtp,streams

# ffmpeg —— RTP 推流/拉流
ffmpeg -i input.mp4 -f rtp rtp://239.0.0.1:5004          # 推 RTP
ffplay -protocol_whitelist "file,rtp,udp" -i stream.sdp  # 拉 RTP

# Wireshark
# RTP → Show All Streams    看所有 RTP 流统计
# RTP → Stream Analysis     单流详细分析（抖动/丢包/时序图）

# sipcalc / sngrep —— SIP + RTP 调试
sngrep -c -d eth0 portrange 5060-5090    # 抓 SIP+RTP

# GStreamer —— RTP 管道调试
gst-launch-1.0 -v udpsrc port=5004 caps="application/x-rtp" ! rtph264depay ! decodebin ! autovideosink
```

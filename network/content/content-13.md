# RTSP 实时流协议

> 应用层 | 流媒体控制 | 类 HTTP 语法 | 状态化 | 端口 554（TCP/UDP）

---

## 报文结构

### 请求格式

```
方法 URI RTSP/1.0\r\n
Header1: Value\r\n
Header2: Value\r\n
...
\r\n
body
```

### 响应格式

```
RTSP/1.0 状态码 原因短语\r\n
Header1: Value\r\n
...
\r\n
body
```

### 方法列表

| 方法 | 方向 | 作用 | 是否必须 |
|------|------|------|---------|
| OPTIONS | C→S | 查询服务器支持的方法 | 可选 |
| DESCRIBE | C→S | 获取媒体描述（SDP） | 推荐 |
| SETUP | C→S | 建立传输通道，协商端口/协议 | 必须 |
| PLAY | C→S | 开始播放 | 必须 |
| PAUSE | C→S | 暂停播放 | 推荐 |
| TEARDOWN | C→S | 终止会话 | 必须 |
| GET_PARAMETER | C↔S | 查询当前参数（如播放位置） | 可选 |
| SET_PARAMETER | C↔S | 设置参数（如音量） | 可选 |
| ANNOUNCE | C↔S | 双向通知新媒体描述 | 可选 |
| RECORD | C→S | 开始录制 | 可选 |
| REDIRECT | S→C | 服务端要求客户端跳转另一 Server | 可选 |

### SDP 描述示例（DESCRIBE 响应 body）

```
v=0
o=- 1234567890 1234567891 IN IP4 192.168.1.1
s=Live Stream
t=0 0
m=video 5004 RTP/AVP 96
c=IN IP4 0.0.0.0
a=rtpmap:96 H264/90000
a=fmtp:96 packetization-mode=1
m=audio 5006 RTP/AVP 0
a=rtpmap:0 PCMU/8000
```

| SDP 字段 | 含义 |
|----------|------|
| v= | 协议版本 |
| o= | 发起者信息 |
| s= | 会话名 |
| t= | 时间（0 0 = 无限制） |
| m= | 媒体描述：类型 端口 传输协议 格式 |
| c= | 连接信息 |
| a= | 属性（rtpmap 映射 PT→编码器，fmtp 编解码参数） |

---

### RTSP 状态码

| 码 | 含义 |
|----|------|
| 200 | OK |
| 301 | Moved Permanently |
| 302 | Moved Temporarily |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 454 | Session Not Found |
| 455 | Method Not Valid In This State |
| 456 | Header Field Not Valid for Resource |
| 457 | Invalid Range |
| 461 | Unsupported Transport |
| 500 | Internal Server Error |
| 505 | RTSP Version Not Supported |
| 551 | Option not supported |

### RTSP 状态机

```
          ┌──────────────────────────────┐
          │            INIT              │
          │  (连接建立，无会话上下文)      │
          └────────┬─────────────────────┘
                   │ OPTIONS / DESCRIBE
                   ▼
          ┌──────────────────────────────┐
          │            READY             │
          │  (已知媒体信息，SETUP 完成)    │
          └────────┬─────────────────────┘
                   │ PLAY
                   ▼
          ┌──────────────────────────────┐
          │           PLAYING            │
          │  (RTP 流在传输)              │
          └────────┬─────────────────────┘
          │       │       │
     PAUSE │   TEARDOWN  │  SET_PARAMETER
          │       │       │
          ▼       ▼       │
         READY   INIT     │
                          ▼
                     PLAYING (继续)
```

---

## 核心能力

### 1. 播放控制 —— OPTIONS → DESCRIBE → SETUP → PLAY → PAUSE → TEARDOWN

流媒体播放需要先知道有哪些媒体（视频/音频）、编码格式、传输端口，然后才能开始传输。RTSP 定义了一组类似 VCR 操作的方法，按序调用完成播放控制。

```
Client                                        Server（媒体服务器）
  |                                              |
  |─── OPTIONS rtsp://server/stream RTSP/1.0 ──→|  询问能力
  |   (空 body)                                  |
  |←── RTSP/1.0 200 OK ────────────────────────|
  |   Public: DESCRIBE, SETUP, TEARDOWN,         |
  |           PLAY, PAUSE, GET_PARAMETER         |
  |                                              |
  |─── DESCRIBE rtsp://server/stream RTSP/1.0 ─→|  获取媒体描述
  |                                              |
  |←── RTSP/1.0 200 OK ────────────────────────|
  |   Content-Type: application/sdp              |
  |   Content-Length: 138                        |
  |                                              |
  |   [SDP: v=0 ... m=video 5004 RTP/AVP 96]    |
  |                                              |
  |─── SETUP rtsp://server/stream/video RTSP/1.0→|  建立视频传输
  |   Transport: RTP/AVP;unicast;                |
  |     client_port=4000-4001                    |
  |←── RTSP/1.0 200 OK ────────────────────────|
  |   Transport: RTP/AVP;unicast;                |
  |     client_port=4000-4001;                   |
  |     server_port=5004-5005                    |
  |   Session: 1234567890                        |
  |                                              |
  |─── SETUP rtsp://server/stream/audio RTSP/1.0→|  建立音频传输
  |   Transport: RTP/AVP;unicast;                |
  |     client_port=4002-4003                    |
  |   Session: 1234567890                        |
  |←── RTSP/1.0 200 OK ────────────────────────|
  |   Session: 1234567890                        |
  |                                              |
  |─── PLAY rtsp://server/stream RTSP/1.0 ─────→|  开始播放
  |   Session: 1234567890                        |
  |   Range: npt=0-                              |
  |←── RTSP/1.0 200 OK ────────────────────────|
  |   RTP-Info: url=rtsp://server/stream/video;  |
  |              seq=1020;rtptime=30000           |
  |                                              |
  |              ←===== RTP 数据 ====→           |  主流媒体传输开始
  |   [接收 RTP Video Port 4000]                 |
  |   [接收 RTP Audio Port 4002]                 |
  |   [发送 RTCP Video Port 4001]                |
  |   [发送 RTCP Audio Port 4003]                |
  |                                              |
  |─── PAUSE rtsp://server/stream RTSP/1.0 ────→|  暂停
  |   Session: 1234567890                        |
  |←── RTSP/1.0 200 OK ────────────────────────|
  |                                              |
  |─── PLAY rtsp://server/stream RTSP/1.0 ──── →|  恢复播放
  |   Range: npt=35-                             |
  |←── RTSP/1.0 200 OK ────────────────────────|
  |                                              |
  |─── TEARDOWN rtsp://server/stream RTSP/1.0  →|  结束会话
  |   Session: 1234567890                        |
  |←── RTSP/1.0 200 OK ────────────────────────|
```

- 一个 RTSP `Session` 管理多个 RTP 流（视频+音频）
- `Range: npt=`（Normal Play Time）支持定位：npt=0- 从头，npt=30-45 第30到45秒
- 支持 `Scale` 头实现快进/快退（2=2倍速，-1=倒放）

---

### 2. 与 RTP 配合 —— RTSP 控制 + RTP 传输

RTSP 只负责"按◉播放"的控制信令，不传输音视频数据。实际媒体走 RTP，便于利用 RTP 的时序/丢包检/混音能力。两者分离使得控制可以重试（可靠 TCP）而媒体保持实时（UDP）。

```
┌─────────────────────────────────────┐
│            RTSP Client              │
│                                     │
│   Control Channel (TCP 554)         │
│   ┌─────────────────────────────┐   │
│   │  OPTIONS / DESCRIBE / SETUP  │   │
│   │  PLAY / PAUSE / TEARDOWN     │   │
│   └──────────┬──────────────────┘   │
│              │                      │
│   Media Channels (UDP)             │
│   ┌─────────────────────────────┐   │
│   │  RTP Video: Port 4000→5004  │   │
│   │  RTCP Video: Port 4001→5005 │   │
│   │  RTP Audio: Port 4002→5006  │   │
│   │  RTCP Audio: Port 4003→5007 │   │
│   └─────────────────────────────┘   │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             Media Server            │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   RTSP Handler              │   │
│   │   └─ 解析请求 → 状态机转移    │   │
│   │   └─ 生成 SDP / 分配端口     │   │
│   │   └─ 管理 Session           │   │
│   ├─────────────────────────────┤   │
│   │   RTP Sender               │   │
│   │   └─ 读取媒体文件/编码器     │   │
│   │   └─ 封装 RTP 包 → UDP 发送 │   │
│   │   └─ 发送 RTCP SR          │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

要点：
- RTSP 可以使用 TCP（默认）或 UDP 传输控制消息
- SETUP 时协商 Transport 头：RTP/AVP（UDP）、RTP/AVP/TCP（TCP 隧道）、RTP/RTSP/HTTP（HTTP 隧道过防火墙）
- 端口分配可以是 client_port + server_port（端到端），或 server_port 单指（接收端从服务器拉流）
- RTCP 端口总是 RTP 端口 + 1

### 传输模式

| 模式 | Transport 值 | 场景 |
|------|-------------|------|
| UDP Unicast | `RTP/AVP;unicast;client_port=4000-4001` | 点播/VoD |
| UDP Multicast | `RTP/AVP;multicast;ttl=16` | 直播/IPTV |
| TCP Interleaved | `RTP/AVP/TCP;interleaved=0-1` | 防火墙后 |
| HTTP 隧道 | `RTP/RTSP/HTTP` | 严格代理环境 |

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么 RTSP 控制用 TCP、媒体用 UDP | 控制信令需要可靠（命令丢了整个状态乱）；媒体需要实时（TCP 重传反而延迟）。分离后二者各走各自最优传输 |
| 为什么 RTSP 语法类似 HTTP | 降低实现成本，复用 HTTP 基础设施（解析器、代理、认证框架），且 RTSP 状态码与 HTTP 兼容 |
| 为什么 RTSP 有状态（而 HTTP 无状态） | 播放需要知道当前进度（第几秒）、传输通道（什么端口）、是否在播放。一个 PLAY 命令依赖于前面的 SETUP 协商的传输参数 |
| 为什么用 SDP 描述媒体 | 统一描述编码/端口/时钟频率，避免自定义协议协商，SDP 也被 SIP/WebRTC 共用 |
| 为什么需要 interleaved mode（TCP 隧道） | 企业防火墙封 UDP，RTP 走不通。RTSP 用 TCP 同一连接交叉发送控制+RTP数据，用 `$` 标记区分 |
| 为什么 RTSP 没有广泛用在 Web | 浏览器不支持原生 RTSP，WebRTC 更轻量，HLS/DASH 基于 HTTP 分片更适合 CDN 分发 |

---

## 排障速查

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| RTSP 连接失败 | `CONNECTION REFUSED` | `telnet server 554` 看端口是否开放 | 防火墙未开 554 / 服务未启动 |
| SETUP 失败 | 返回 `461 Unsupported Transport` | 看请求 Transport 头值与服务端能力 | 客户端请求了服务端不支持的传输模式 |
| PLAY 无媒体流 | RTSP 返回 200 但没收到 RTP 包 | `tcpdump portrange 5000-6000` 抓 UDP | SETUP 协商的端口与服务端实际发送端口不一致 |
| 音画不同步 | 声音和画面时间不对 | 抓 SDP/RTP 检查 SSRC 和 CNAME | 两个流的时钟基准不同（NTP 偏差） |
| 播放到某处卡住 | 进度条停了但 RTSP 连接正常 | RTCP RR 看丢包率是否激增 | 码率突变/带宽不够/服务器读取文件 I/O 慢 |
| PAUSE 后恢复无声 | 恢复播放没有音频 | 检查 PLAY Range 是否正确 | 某些服务端 PAUSE 后不保存播放位置 |

```bash
# 抓 RTSP 控制信令
tcpdump -i any -nn 'tcp port 554' -A | grep -E 'RTSP/1.0|CSeq|Session'

# 抓 RTSP + RTP 完整交互
tshark -r capture.pcap -Y "rtsp or rtp" -T fields -e rtsp.method \
  -e rtsp.status_code -e rtp.ssrc -e rtp.seq

# Wireshark 过滤
rtsp                                    # 所有 RTSP 包
rtsp.method == PLAY                     # 只看 PLAY 请求
rtsp.status_code != 200                 # 非正常响应
rtp and not rtcp                        # 只看 RTP 数据

# 模拟 RTSP 播放（直接发命令）
echo -e "OPTIONS rtsp://server/stream RTSP/1.0\r\nCSeq: 1\r\n\r\n" | nc server 554

# VLC 命令行播放 RTSP
vlc rtsp://server/stream --rtsp-tcp     # 强制 TCP 传输
vlc rtsp://server/stream --network-caching=500  # 调缓存
```

---

## 常用工具

```bash
# VLC —— RTSP 客户端/服务端
vlc rtsp://server:554/stream              # 播放 RTSP 流
cvlc ~/video.mp4 --sout '#rtp{dst=239.0.0.1,port=5004}'  # 推 RTSP

# FFmpeg —— RTSP 推拉流
ffmpeg -i rtsp://admin:pass@192.168.1.100/stream1 output.mp4
ffmpeg -re -i input.mp4 -rtsp_transport tcp -f rtsp rtsp://server:8554/stream

# openRTSP —— 轻量 RTSP 客户端
openRTSP -4 -c rtsp://server/stream       # 拉流保存

# rtsp-simple-server —— 轻量 RTSP 服务端
mediamtx         # 新版本 MediaMTX，支持 RTSP/RTMP/HLS/WebRTC

# tcpdump —— 抓 RTSP
tcpdump -i eth0 -nn 'tcp port 554' -A -s 0

# wireshark —— 分析 RTSP 交互
# rtsp 过滤后 Follow TCP Stream → 看完整对话
```


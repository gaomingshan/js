# 第 13 章：RTSP 协议

> **学习目标**：掌握流媒体控制协议的交互流程与会话管理
> **预计时长**：2 小时
> **难度级别**：⭐⭐ 基础

---

## 1. 核心概念

### 1.1 RTSP 概述

RTSP（Real Time Streaming Protocol）是流媒体控制协议，负责控制媒体流的播放、暂停、快进等操作。它本身不传输媒体数据（由 RTP 承载），类似于"视频遥控器"。

**RTSP 核心特性**：
- 文本协议，语法类似 HTTP
- 有状态（通过 Session ID 维护会话）
- 支持双向控制（客户端→服务器，服务器→客户端）
- 默认端口 554

```
RTSP 与 RTP 的关系：
┌───────────────────────────┐
│  RTSP (控制信令)           │  ← "遥控器"
├───────────────────────────┤
│  RTP (媒体数据传输)        │  ← "视频流"
│  RTCP (传输质量反馈)       │  ← "质量报告"
└───────────────────────────┘
```

---

## 2. 报文结构

### 2.1 请求报文

```
方法 SP 请求 URI SP RTSP版本 CRLF
头部字段 CRLF
CRLF
消息体(可选)
```

### 2.2 响应报文

```
RTSP版本 SP 状态码 SP 原因短语 CRLF
头部字段 CRLF
CRLF
消息体(可选)
```

### 2.3 常用头部

| 头部 | 说明 |
|------|------|
| CSeq | 请求序列号（必须，匹配请求和响应） |
| Session | 会话标识（SETUP 响应后必须携带） |
| Transport | 传输参数（协议、端口、SSRC 等） |
| Content-Type | 消息体类型（如 application/sdp） |
| Content-Length | 消息体长度 |
| Range | 播放范围（如 npt=0-60） |
| Scale | 播放速度（1=正常，2=2倍速） |

---

## 3. 具体能力

### 3.1 RTSP 方法

| 方法 | 说明 | 必须支持 |
|------|------|---------|
| OPTIONS | 查询服务器支持的方法 | ✅ |
| DESCRIBE | 获取媒体描述（SDP） | 推荐 |
| SETUP | 建立传输通道 | ✅ |
| PLAY | 开始播放 | ✅ |
| PAUSE | 暂停播放 | 推荐 |
| TEARDOWN | 释放会话 | ✅ |
| GET_PARAMETER | 获取参数/保活 | 可选 |
| SET_PARAMETER | 设置参数 | 可选 |
| ANNOUNCE | 客户端推送媒体描述 | 可选 |
| RECORD | 开始录制 | 可选 |

### 3.2 完整会话流程

```
1. OPTIONS → 查询能力
2. DESCRIBE → 获取 SDP 媒体描述
3. SETUP → 协商传输参数（每个流一次）
4. PLAY → 开始播放
5. PAUSE → 暂停
6. PLAY → 继续
7. TEARDOWN → 结束会话
```

### 3.3 SDP 媒体描述

DESCRIBE 响应包含 SDP（Session Description Protocol）：

```
v=0
o=- 2890844526 2890844526 IN IP4 192.168.1.1
s=RTSP Session
c=IN IP4 192.168.1.1
t=0 0
m=video 0 RTP/AVP 96
a=rtpmap:96 H264/90000
a=fmtp:96 packetization-mode=1
a=control:track1
m=audio 0 RTP/AVP 97
a=rtpmap:97 OPUS/48000/2
a=control:track2
```

**SDP 关键行**：
- `m=` 媒体行：类型、端口、协议、载荷类型
- `a=rtpmap` 载荷类型映射
- `a=control` RTSP 控制 URI

---

## 4. 报文样例

### 4.1 OPTIONS 请求/响应

```
--- 请求 ---
OPTIONS rtsp://server.example.com/stream RTSP/1.0\r\n
CSeq: 1\r\n
User-Agent: VLC/3.0\r\n
\r\n

--- 响应 ---
RTSP/1.0 200 OK\r\n
CSeq: 1\r\n
Public: OPTIONS, DESCRIBE, SETUP, PLAY, PAUSE, TEARDOWN\r\n
\r\n
```

### 4.2 DESCRIBE 请求/响应

```
--- 请求 ---
DESCRIBE rtsp://server.example.com/stream RTSP/1.0\r\n
CSeq: 2\r\n
Accept: application/sdp\r\n
\r\n

--- 响应 ---
RTSP/1.0 200 OK\r\n
CSeq: 2\r\n
Content-Type: application/sdp\r\n
Content-Length: 256\r\n
\r\n
v=0\r\n
o=- 2890844526 2890844526 IN IP4 192.168.1.1\r\n
s=RTSP Session\r\n
...
```

### 4.3 SETUP 请求/响应

```
--- 请求 ---
SETUP rtsp://server.example.com/stream/track1 RTSP/1.0\r\n
CSeq: 3\r\n
Transport: RTP/AVP;unicast;client_port=5000-5001\r\n
\r\n

--- 响应 ---
RTSP/1.0 200 OK\r\n
CSeq: 3\r\n
Session: 123456\r\n
Transport: RTP/AVP;unicast;client_port=5000-5001;server_port=6000-6001;ssrc=ABCDEF01\r\n
\r\n
```

**Transport 头部解析**：
- `RTP/AVP`：RTP 音视频 Profile
- `unicast`：单播
- `client_port=5000-5001`：客户端 RTP/RTCP 端口
- `server_port=6000-6001`：服务器 RTP/RTCP 端口
- `ssrc=ABCDEF01`：RTP 同步源标识

### 4.4 PLAY 请求/响应

```
--- 请求 ---
PLAY rtsp://server.example.com/stream RTSP/1.0\r\n
CSeq: 4\r\n
Session: 123456\r\n
Range: npt=0-\r\n
\r\n

--- 响应 ---
RTSP/1.0 200 OK\r\n
CSeq: 4\r\n
Session: 123456\r\n
Range: npt=0-\r\n
RTP-Info: url=track1;seq=12345;rtptime=3000000\r\n
\r\n
```

**RTP-Info**：指示 RTP 流的起始序列号和时间戳，客户端据此同步。

---

## 5. 深入一点

### RTSP 2.0 vs RTSP 1.0

RTSP 2.0（RFC 7826）是重大更新：
- 支持断线重连（Session ID + Restartable）
- 支持 RTCP 反馈扩展
- 更完善的安全机制
- 兼容性改进

### RTSP over HTTP

某些防火墙阻止 RTSP 端口，可通过 HTTP 隧道传输：
- 将 RTSP 封装在 HTTP 请求中
- 服务器通过 HTTP 80 或 8080 端口接收

---

## 参考资料

- [RFC 2326 - Real Time Streaming Protocol (RTSP)](https://datatracker.ietf.org/doc/html/rfc2326)
- [RFC 7826 - Real-Time Streaming Protocol 2.0 (RTSP 2.0)](https://datatracker.ietf.org/doc/html/rfc7826)
- [RFC 4566 - SDP: Session Description Protocol](https://datatracker.ietf.org/doc/html/rfc4566)

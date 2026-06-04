# 第 19 章：MQTT 协议

> **学习目标**：掌握 MQTT 轻量级消息传输的 QoS 机制与报文格式
> **预计时长**：3 小时
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

### 1.1 MQTT 概述

MQTT（Message Queuing Telemetry Transport）是轻量级的发布/订阅消息协议，专为带宽有限、网络不稳定的 IoT 场景设计。

**MQTT 核心特性**：
- 极低开销：固定头部仅 2 字节
- 发布/订阅模式（解耦收发方）
- 三级 QoS 保证
- 遗嘱消息（LWT）
- 保留消息
- 默认端口 1883（明文）、8883（MQTTS/TLS）

```
MQTT 架构：
Publisher → Broker → Subscriber
              │
              ├── Topic: home/sensor/temperature
              ├── Topic: home/sensor/humidity
              └── Topic: home/+/status  (通配符订阅)
```

---

## 2. 报文结构

### 2.1 MQTT 固定头部

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Type (4)  |  Flags (4)  |  Remaining Length (1-4 bytes)    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| **Type** | 4 bit | 报文类型 |
| **Flags** | 4 bit | 标志位（部分类型有特定含义） |
| **Remaining Length** | 1-4 bytes | 剩余长度（变长编码） |

### 2.2 报文类型

| Type | 值 | 方向 | 说明 |
|------|-----|------|------|
| CONNECT | 1 | C→S | 连接请求 |
| CONNACK | 2 | S→C | 连接确认 |
| PUBLISH | 3 | 双向 | 发布消息 |
| PUBACK | 4 | 双向 | QoS 1 确认 |
| PUBREC | 5 | 双向 | QoS 2 收到 |
| PUBREL | 6 | 双向 | QoS 2 释放 |
| PUBCOMP | 7 | 双向 | QoS 2 完成 |
| SUBSCRIBE | 8 | C→S | 订阅请求 |
| SUBACK | 9 | S→C | 订阅确认 |
| UNSUBSCRIBE | 10 | C→S | 取消订阅 |
| UNSUBACK | 11 | S→C | 取消确认 |
| PINGREQ | 12 | C→S | 心跳请求 |
| PINGRESP | 13 | S→C | 心跳响应 |
| DISCONNECT | 14 | C→S | 断开连接 |

### 2.3 剩余长度编码

变长编码，每个字节的最高位为延续标志：

```
单字节: 0-127
双字节: 128-16383
三字节: 16384-2097151
四字节: 2097152-268435455

编码示例:
0x3C (60)           → 3C
0x80 (128)          → 80 01
0x3FFF (16383)      → FF 7F
0x4000 (16384)      → 80 80 01
```

---

## 3. 具体能力

### 3.1 三级 QoS

**QoS 0（最多一次）**：

```
Publisher → Broker → Subscriber
  PUBLISH        PUBLISH
  (无确认)       (无确认)
```

消息可能丢失，最低开销。

**QoS 1（至少一次）**：

```
Publisher → Broker → Subscriber
  PUBLISH        PUBLISH
  ←── PUBACK     ←── PUBACK
```

消息至少到达一次，可能重复。Publish 端重发直到收到 PUBACK。

**QoS 2（恰好一次）**：

```
Publisher → Broker → Subscriber
  PUBLISH        PUBLISH
  ←── PUBREC     ←── PUBREC
  PUBREL         PUBREL
  ←── PUBCOMP    ←── PUBCOMP
```

四步握手保证恰好一次，开销最大。

**QoS 降级**：端到端 QoS = min(Publisher QoS, Subscriber QoS)

### 3.2 主题过滤

**主题层级分隔符**：`/`

```
home/sensor/temperature
home/sensor/humidity
home/living-room/light/status
```

**单层通配符**：`+`

```
home/+/temperature → 匹配 home/kitchen/temperature
                    匹配 home/bedroom/temperature
                    不匹配 home/sensor/temperature/room1
```

**多层通配符**：`#`（必须在末尾）

```
home/# → 匹配 home 下所有主题
home/sensor/# → 匹配 home/sensor 下所有主题
```

**系统主题**：`$SYS/...`（Broker 状态信息，如连接数、消息数）

### 3.3 遗嘱消息（LWT）

客户端连接时指定遗嘱消息，当连接异常断开时 Broker 自动发布：

```
CONNECT 报文中:
  Will Topic: home/client/status
  Will Message: {"status":"offline"}
  Will QoS: 1
  Will Retain: true

客户端异常断开 → Broker 发布遗嘱消息到 home/client/status
```

**用途**：设备离线通知、状态监控。

### 3.4 保留消息

Broker 保留指定主题的最后一条消息，新订阅者立即收到：

```
Publisher → PUBLISH topic=home/temperature, retain=true, payload="25°C"
Subscriber → SUBSCRIBE home/temperature
Broker → 立即推送 "25°C" 给新订阅者
```

**用途**：设备初始状态、配置信息。

### 3.5 会话保持

**Clean Session = 0**：

```
断开连接后:
- Broker 保留订阅信息
- Broker 缓存 QoS 1/2 的离线消息
- 重连后恢复订阅，推送离线消息
```

**Clean Session = 1**（默认）：

```
断开连接后:
- Broker 清除所有订阅和离线消息
- 重连后需重新订阅
```

**MQTT 5.0 改进**：`Clean Start` + `Session Expiry Interval`，可指定会话过期时间。

---

## 4. 报文样例

### 4.1 CONNECT 报文

```
10 1c                          → Type=1(CONNECT), Remaining=28
00 04 4d 51 54 54              → Protocol Name: "MQTT"
04                             → Protocol Level: 4 (MQTT 3.1.1)
c2                             → Connect Flags: Clean Session=1, Will=1, Will QoS=1, Will Retain=0, Password=1, Username=1
00 3c                          → Keep Alive: 60 秒
00 05 61 6c 69 63 65           → Client ID: "alice"
00 0a 73 74 61 74 75 73        → Will Topic: "status"
00 07 6f 66 66 6c 69 6e 65    → Will Message: "offline"
00 05 61 6c 69 63 65           → Username: "alice"
00 08 70 61 73 73 77 6f 72 64 → Password: "password"
```

### 4.2 CONNACK 报文

```
20 02 00 00
```

**逐字段解析**：

```
20          → Type=2(CONNACK), Flags=0, Remaining=2
00          → Session Present=0
00          → Return Code=0 (Connection Accepted)
```

### 4.3 PUBLISH 报文（QoS 0）

```
30 0f 00 0a 68 6f 6d 65 2f 74 65 6d 70 68 65 6c 6c 6f
```

**逐字段解析**：

```
30          → Type=3(PUBLISH), DUP=0, QoS=0, Retain=0
0f          → Remaining=15
00 0a       → Topic Length=10
68 6f 6d 65 2f 74 65 6d 70 → Topic: "home/temp"
68 65 6c 6c 6f              → Payload: "hello"
```

### 4.4 PUBLISH 报文（QoS 1，带 Packet ID）

```
32 11 00 0a 68 6f 6d 65 2f 74 65 6d 70 00 01 68 65 6c 6c 6f
```

**逐字段解析**：

```
32          → Type=3(PUBLISH), DUP=0, QoS=1, Retain=0
11          → Remaining=17
00 0a       → Topic Length=10
68 6f 6d 65 2f 74 65 6d 70 → Topic: "home/temp"
00 01       → Packet ID=1 (QoS 1/2 必须有)
68 65 6c 6c 6f              → Payload: "hello"
```

### 4.5 SUBSCRIBE 报文

```
82 0e 00 01 00 0a 68 6f 6d 65 2f 74 65 6d 70 00
```

**逐字段解析**：

```
82          → Type=8(SUBSCRIBE), Reserved=0010
0e          → Remaining=14
00 01       → Packet ID=1
00 0a       → Topic Filter Length=10
68 6f 6d 65 2f 74 65 6d 70 → Topic Filter: "home/temp"
00          → Requested QoS=0
```

---

## 5. 深入一点

### MQTT 5.0 新特性

| 特性 | 说明 |
|------|------|
| Session Expiry Interval | 会话过期时间（替代 Clean Session） |
| Reason Code | 详细的断开/错误原因码 |
| User Properties | 自定义键值对（类似 HTTP 头部） |
| Shared Subscription | 负载均衡订阅（$share/group/topic） |
| Subscription Identifier | 订阅标识符（一次订阅多个主题时区分来源） |
| Message Expiry Interval | 消息过期时间 |
| Payload Format Indicator | 载荷格式（字节/UTF-8） |
| Flow Control | Receive Maximum（限制未确认消息数） |

### MQTT-SN

MQTT-SN（Sensor Networks）是 MQTT 的变体，专为传感器网络优化：
- 支持主题 ID（短整数替代长主题名）
- 支持广播/多播
- 适配 ZigBee 等低功耗网络
- 基于 UDP

---

## 参考资料

- [MQTT 3.1.1 Specification](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
- [MQTT 5.0 Specification](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html)
- [MQTT-SN Specification](http://mqtt.org/new/wp-content/uploads/2009/06/MQTT-SN_spec_v1.2.pdf)

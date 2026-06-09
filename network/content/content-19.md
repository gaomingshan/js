# MQTT 消息队列遥测传输协议

> 应用层 | 发布/订阅 | 轻量级 IoT | 端口 1883（明文）/ 8883（TLS）

---

## 报文结构

固定头部仅 2 字节（最小），变长编码剩余长度。

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Type (4)  |  Flags (4)  |  Remaining Length (1-4 bytes)    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| Type | 4bit | 报文类型（14 种） |
| Flags | 4bit | 标志位，按类型定义不同含义 |
| Remaining Length | 1-4B | 可变头 + 载荷的总长度（变长编码） |

### 报文类型

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

### 剩余长度变长编码

每个字节低 7 位为数据，最高位为延续标志：

```
单字节: 0-127              → 0x00 ~ 0x7F
双字节: 128-16383          → 0x80 0x01 ~ 0xFF 0x7F
三字节: 16384-2097151      → 0x80 0x80 0x01 ~ 0xFF 0xFF 0x7F
四字节: 2097152-268435455  → 0x80 0x80 0x80 0x01 ~ 0xFF 0xFF 0xFF 0x7F

示例：
  60        → 0x3C
  128       → 0x80 0x01
  16383     → 0xFF 0x7F
  16384     → 0x80 0x80 0x01
```

---

## 核心能力

### 1. 发布/订阅 —— 解耦 Publisher 和 Subscriber

为什么需要：IoT 场景设备数量大、网络不稳定，传统 Request-Response 模式（HTTP）要求双方同时在线，Pub/Sub 让发送方和接收方完全解耦。

```
Publisher ── PUBLISH topic:sensors/temp ──→  Broker
                                               │
                                      ┌────────┴────────┐
                                      │                  │
                               Subscriber A       Subscriber B
                               (sensors/temp)    (sensors/#)
```

要点：
- Topic 是消息的"标签"，非 IP + 端口
- 一个 Topic 允许多个 Subscriber（扇出）
- Publisher 不需要知道谁在消费
- Subscriber 不需要知道消息来源

---

### 2. 三种 QoS —— 不同可靠性级别

为什么需要：不是所有数据都需要"必须到达"——传感器温度每秒上报一次，丢一帧无所谓；但设备开关命令不能丢。

```
QoS 0（最多一次）—— 发后即忘：
Publisher ── PUBLISH ──→ Broker ── PUBLISH ──→ Subscriber
（无确认，无重传，可能丢失）
场景：环境传感器、心跳、日志（丢了就算了）

QoS 1（至少一次）—— 确认重传：
Publisher ── PUBLISH ──→ Broker ── PUBLISH ──→ Subscriber
               ←── PUBACK ──          ←── PUBACK ──
（收到 PUBACK 才删除，超时重发；可能重复）
场景：设备控制命令（重复比丢失好）

QoS 2（恰好一次）—— 四步握手：
Publisher ── PUBLISH ──→ Broker ── PUBLISH ──→ Subscriber
               ←── PUBREC ──          ←── PUBREC ──
               ── PUBREL ──→          ── PUBREL ──→
               ←── PUBCOMP ──         ←── PUBCOMP ──
（四步保证不重不丢；开销最大）
场景：计费指令、关键告警（必须精确一次）
```

端到端 QoS = min(Publisher QoS, Subscriber QoS)

| QoS | 保证级别 | RTT(端到端) | 消息开销 | 典型场景 |
|-----|---------|------------|---------|---------|
| 0 | 最多一次 | 0 | 1 个 PUBLISH | 传感器、日志 |
| 1 | 至少一次 | 1 | PUBLISH + PUBACK | 设备控制 |
| 2 | 恰好一次 | 2 | PUBLISH+PUBREC+PUBREL+PUBCOMP | 计费、告警 |

---

### 3. 遗嘱消息（LWT）—— 检测设备离线

为什么需要：IoT 设备随时可能断电/断网，Broker 需要自动感知并通知其他设备。

```
CONNECT 报文声明遗嘱：
  Will Topic:    device/123/status
  Will Message:  {"status":"offline"}
  Will QoS:      1
  Will Retain:   true

设备正常断开（发送 DISCONNECT）→ Broker 不发遗嘱
设备异常断开（TCP 断开/心跳超时）→ Broker 自动发布遗嘱消息

场景：
- 智能家居：网关离线 → 所有设备自动切换本地模式
- 设备监控：离线告警推送
- 状态同步：更新"在线/离线"状态
```

---

### 4. 保留消息 —— 新订阅者拿到最新值

为什么需要：新设备上线后订阅 Topic，如果 Broker 不保留消息就只能等下次更新——可能永远等不到（温度传感器 10 分钟上报一次）。

```
无保留消息：
  Subscriber ── SUBSCRIBE home/temp ──→ Broker
  Broker 回复 SUBACK（但 Subscriber 手里没数据，只能等到下次 PUBLISH）

有保留消息：
  Publisher ── PUBLISH home/temp, retain=1, "25°C" ──→ Broker
                                                        （Broker 存储最后一条）
  Subscriber ── SUBSCRIBE home/temp ──────────────────→ Broker
  Broker ── PUBLISH retain=1, "25°C" ────────────────→ Subscriber（立即拿到）

取消保留消息：PUBLISH home/temp, retain=1, payload=空
```

---

### 5. 会话保持 —— Clean Session

```
Clean Session = 0（持久会话）：
断开后 Broker 保留：
  - 订阅关系（重连后不用重新订阅）
  - QoS 1/2 的离线消息（重连后推送）
  - 正在发送中的 QoS 2 消息
场景：设备经常断开，需要恢复连接后继续消费

Clean Session = 1（临时会话）：
断开后 Broker 清除所有状态
场景：测试、普通 App（每次重连重新订阅即可）

MQTT 5.0 改进：
  - Clean Start（替代 Clean Session）
  - Session Expiry Interval（指定会话过期时间，到期才清除）
```

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么固定头部只有 2 字节 | IoT 设备电量/带宽/内存极有限，最小化协议开销。2 字节头部 + 变长编码适应小消息场景 |
| 为什么用 Pub/Sub 不用 Point-to-Point | 设备点对点维护困难，Pub/Sub 解耦，增加减少设备不影响其他节点 |
| 为什么分三种 QoS | 不同场景可靠性要求不同：传感器丢一次无所谓（QoS 0），开关命令不能丢（QoS 1），计费不能重复（QoS 2）。一刀切浪费 |
| 为什么需要遗嘱消息 | 设备异常断线无法主动通知，Broker 代为发"离线"状态，是 IoT 核心需求 |
| 为什么需要保留消息 | 新订阅者需要立刻知道当前状态，不能等下次上报（可能很久） |
| 为什么不用 Topic 用通配符订阅 | 一个设备可能订阅 100 个 Topic，通配符一次解决（`sensors/#`） |
| 为什么 CONNECT 有 Keep Alive | IoT 设备可能长时间无数据，心跳保活检测断线；也节省资源（短间隔更早发现断线） |

---

## 排障速查

```bash
# 通用诊断
mosquitto_sub -h broker -t "#" -v                   # 订阅所有主题，看消息是否流通
mosquitto_pub -h broker -t test -m "ping" -d         # 发布测试消息（-d 显示调试）
```

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| 连接失败 | `Connection refused` | `telnet broker 1883` 看端口；`mosquitto_sub -d -t test` 看协议细节 | Broker 未启动 / 端口防火墙 / MQTT 版本不匹配 |
| 连接被拒 | `Connection refused: not authorized` | 检查 CONNECT 中的用户名/密码 | 认证配置错误 / ACL 拒绝 |
| 连接断开 | `Connection closed` | 检查 CONNECT 中 Keep Alive 值 | 心跳超时（网络差 / Keep Alive 太短） |
| 收不到消息 | Subscriber 在线，但 Topic 不触发 | 确认 Topic 拼写、通配符是否正确 | Publisher 和 Subscriber Topic 不匹配 / 权限 |
| 消息丢失 | 某些消息没到达 | 检查 Publisher 是否收到 PUBACK（QoS 1） | QoS 0 本身不保证送达 / Broker 内存满丢弃 |
| 消息重复 | 收到重复消息 | 检查是否未正确处理 PUBACK | Publisher 超时重发（QoS 1 正常行为，需在应用层去重）|
| 离线消息丢失 | 设备重连后没收到离线消息 | 检查 Clean Session=0 且 QoS ≥ 1 | Clean Session=1 / 消息过期 / 队列满 |
| Broker 负载高 | 连接数多，消息延迟 | `mosquitto_sub -t '$SYS/broker/#' -v` 看系统主题 | 客户端太多 / QoS 2 太多 / 大消息 |

---

## 常用工具

```bash
# Mosquitto 客户端
mosquitto_sub -h broker -t "sensors/#" -v -q 1              # 订阅 + QoS 1
mosquitto_pub -h broker -t "home/temp" -m "25.5" -q 2 -r   # 发布 + QoS 2 + 保留
mosquitto_sub -h broker -t '$SYS/#' -v                      # Broker 系统状态

# 调试模式
mosquitto_pub -h broker -t "test" -m "hello" -d             # -d 显示所有 MQTT 报文
mosquitto_sub -h broker -t "#" -v -F "%I %t %p"             # -F 自定义输出格式

# MQTT 5.0 特性（mosquitto ≥ 2.0）
mosquitto_pub -V mqttv5 -h broker -t test -m "v5"           # 指定版本
mosquitto_sub -V mqttv5 -h broker -t test -F "%p %R %U"    # 显示 reason code + user property

# 抓包分析
tcpdump -i any -X 'port 1883'                               # 抓 MQTT 明文包（适合调试）
tcpdump -i any -A 'port 1883 and tcp[((tcp[12]>>2)*4):1]=0x10'  # 只看 CONNECT 报文

# 压测
mqtt-bench -broker tcp://broker:1883 -clients 10 -qos 1 -size 100 -count 1000
```

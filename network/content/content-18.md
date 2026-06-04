# 第 18 章：AMQP 协议

> **学习目标**：理解高级消息队列的可靠传递机制与 AMQP 帧格式
> **预计时长**：3 小时
> **难度级别**：⭐⭐⭐⭐ 高级

---

## 1. 核心概念

### 1.1 AMQP 概述

AMQP（Advanced Message Queuing Protocol）是应用层消息队列协议，提供可靠的消息路由、排队和传递。最广泛实现的版本为 AMQP 0-9-1（RabbitMQ），AMQP 1.0 是 OASIS 标准（Azure Service Bus）。

**AMQP 核心概念**：

```
Producer → Exchange → Binding → Queue → Consumer
              │
              ├── Direct Exchange (精确匹配 routing key)
              ├── Fanout Exchange (广播到所有绑定队列)
              ├── Topic Exchange (通配符匹配 routing key)
              └── Headers Exchange (匹配消息头部)
```

**AMQP 核心特性**：
- 消息确认（ACK/NACK）保证可靠传递
- 消息持久化（队列和消息均可持久化）
- 流量控制（基于信用的流控）
- 事务支持
- 默认端口 5672（明文）、5671（AMQPS）

---

## 2. 报文结构

### 2.1 AMQP 0-9-1 帧格式

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Type (8)    |          Channel (16)        |   Size (32)    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          Payload                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Frame End (0xCE)                                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| 字段 | 长度 | 含义 |
|------|------|------|
| **Type** | 8 bit | 帧类型：1=Method, 2=Content Header, 3=Body, 8=Heartbeat |
| **Channel** | 16 bit | 通道号（0=连接级，1-65535=通道级） |
| **Size** | 32 bit | 载荷长度 |
| **Payload** | 可变 | 帧内容 |
| **Frame End** | 8 bit | 固定 0xCE |

### 2.2 Method 帧

Method 帧携带 AMQP 操作指令：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Class ID (16)          |       Method ID (16)         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Method Arguments                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.3 Content Header 帧

消息的元数据（紧跟 Method 帧之后）：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Class ID (16)          |    Weight (16)    | Body Size (64) |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Property Flags                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Property Values                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 2.4 Body 帧

消息的实际内容（可分多个 Body 帧）：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Body Data                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## 3. 具体能力

### 3.1 交换机类型

**Direct Exchange**：

```
routing key = "order.create" → Queue: order-create-queue
routing key = "order.cancel" → Queue: order-cancel-queue
精确匹配，一对一或一对多
```

**Fanout Exchange**：

```
广播到所有绑定的队列，忽略 routing key
适合：日志广播、事件通知
```

**Topic Exchange**：

```
routing key = "order.create.us" → Binding: "order.create.*"
routing key = "order.create.cn" → Binding: "order.create.*"
routing key = "order.#"         → 匹配所有 order 开头的 key

通配符: * = 一个词, # = 零或多个词
```

**Headers Exchange**：

```
匹配消息头部属性而非 routing key
x-match: all (全部匹配) / any (任一匹配)
```

### 3.2 消息确认

**Consumer ACK**：

```
1. Broker 推送消息给 Consumer
2. Consumer 处理消息
3. Consumer 发送 ACK → Broker 删除消息
   或 Consumer 发送 NACK → Broker 重新入队或丢弃
```

**Publisher Confirm**：

```
1. Publisher 发送消息
2. Broker 确认消息已持久化/路由成功 → ACK
   或 Broker 返回 → NACK (不可路由)
```

### 3.3 消息持久化

```
队列持久化: durable=true (队列声明时指定)
消息持久化: delivery_mode=2 (消息属性)
交换机持久化: durable=true

注意: 持久化不保证消息不丢失，仅保证 Broker 重启后恢复
      完整可靠需: 持久化 + Publisher Confirm + Consumer ACK
```

### 3.4 流量控制

AMQP 0-9-1 使用两种流控机制：

**Consumer 预取（Prefetch Count）**：

```
basic.qos prefetch_count=10
→ Broker 最多推送 10 条未确认消息给 Consumer
→ 防止 Consumer 被淹没
```

**Connection 流控（Backpressure）**：

```
Publisher 发送过快 → Broker 内存水位上升
→ Broker 停止读取 Publisher 的 TCP 数据
→ TCP 背压传导至 Publisher
```

### 3.5 虚拟主机

AMQP 支持虚拟主机（vhost），实现多租户隔离：

```
/connection: host:5672/vhost_name
每个 vhost 有独立的 Exchange、Queue、Binding、权限
默认 vhost: "/"
```

---

## 4. 报文样例

### 4.1 AMQP 连接握手

```
4d 51 50 00 09 01           → "AMQP\0\0\9\1" (协议头)
```

**协议头解析**：

```
4d 51 50    → "AMQP" (协议标识)
00          → 协议类 (0)
00          → 协议主版本 (0)
09          → 协议次版本 (9)
01          → 协议修订 (1)
→ AMQP 0-9-1
```

### 4.2 Connection.Start 帧

```
01 00 00 00 00 0a 00 0a 00 0a
...
ce
```

**结构化解析**：

```
01          → Type=1 (Method)
00 00       → Channel=0 (连接级)
00 00 00 0a → Size=10
--- Method ---
00 0a       → Class=10 (Connection)
00 0a       → Method=10 (Start)
...         → 版本、服务器属性、机制列表
ce          → Frame End
```

### 4.3 Basic.Publish 帧（发送消息）

```
01 00 01 00 00 00 1e 00 3c 00 28
... (exchange + routing key + mandatory + immediate)
ce
02 00 01 00 00 00 0e 00 3c 00 00 00 00 00 00 00 64
... (content header: class=60, body_size=100, properties)
ce
03 00 01 00 00 00 64
... (body: 100 字节消息内容)
ce
```

**结构化解析**：

```
帧1 (Method): Type=1, Channel=1, Class=60(Basic), Method=40(Publish)
帧2 (Content Header): Type=2, Class=60, Body Size=100, Properties
帧3 (Body): Type=3, 100 字节消息体
```

---

## 5. 深入一点

### AMQP 1.0 vs AMQP 0-9-1

| 特性 | AMQP 0-9-1 | AMQP 1.0 |
|------|-----------|----------|
| 架构 | Exchange/Binding/Queue | Link/Session/Node |
| 路由 | Broker 端路由 | 可在 Sender 端路由 |
| 流控 | TCP 背压 + Prefetch | 基于信用的精确流控 |
| 事务 | AMQP 事务 | AMQP 事务 + 会话级确认 |
| 实现 | RabbitMQ | Azure Service Bus, Qpid |

### 死信队列（DLX）

消息无法消费时的归宿：

```
触发条件:
1. 消息被 NACK 且 requeue=false
2. 消息 TTL 过期
3. 队列达到最大长度

配置:
queue.declare arguments:
  x-dead-letter-exchange: dlx.exchange
  x-dead-letter-routing-key: dlx.key
```

---

## 参考资料

- [AMQP 0-9-1 Specification](https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf)
- [OASIS AMQP 1.0 Specification](http://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

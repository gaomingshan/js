# AMQP 高级消息队列协议

> 应用层 | 消息队列 & 可靠路由 | 端口 5672（明文）/ 5671（TLS）

---

## 报文结构

AMQP 帧格式（0-9-1）：

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
| Type | 8bit | 帧类型：1=Method, 2=Content Header, 3=Body, 8=Heartbeat |
| Channel | 16bit | 通道号（0=连接级，1-65535=通道级） |
| Size | 32bit | 载荷长度 |
| Payload | 可变 | Method / Header / Body |
| Frame End | 8bit | 固定 0xCE |

### 三种帧体结构

**Method 帧** —— 操作指令：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Class ID (16)          |       Method ID (16)         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Method Arguments                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

- Class=Connection, Method=Start → 连接开始
- Class=Basic, Method=Publish → 发布消息
- Class=Queue, Method=Declare → 声明队列

**Content Header 帧** —— 消息元数据：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Class ID (16)          |    Weight (16)    | Body Size (64) |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Property Flags                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Property Values                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Body 帧** —— 消息体：

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Body Data                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

一条消息 = 1 Method 帧 + 1 Header 帧 + N Body 帧（多帧分片传输）

---

## 核心能力

### 1. 交换机类型 —— Direct / Fanout / Topic / Headers

为什么需要：消息队列的核心是**路由**——Producer 不关心谁消费，只按规则投递；Consumer 按兴趣订阅。交换机是实现这种解耦的关键。

```
Producer → Exchange → Binding → Queue → Consumer

Direct Exchange:
  routing key = "order.create" → Queue: order-queue
  routing key = "order.cancel" → Queue: order-queue
  精确匹配 routing key，一个或对多个 Queue

Fanout Exchange:
  所有绑定的 Queue 都收到一份（忽略 routing key）
  场景：日志广播、全局通知

Topic Exchange:
  routing key = "order.create.us" → Binding: "order.create.*"
  routing key = "order.create.cn" → Binding: "order.create.*"
  * = 一个词, # = 零或多个词
  场景：按地理区域/类型过滤

Headers Exchange:
  匹配消息头部属性（x-match: all / any）
  不依赖 routing key
```

| 类型 | 匹配依据 | 路由规则 | 典型场景 |
|------|---------|---------|---------|
| Direct | routing key | 精确匹配 | 任务分发 |
| Fanout | 无 | 广播所有 Queue | 日志/通知 |
| Topic | routing key | 通配符 | 分类路由 |
| Headers | headers | KV 匹配 | 复杂条件路由 |

---

### 2. 消息确认 —— ACK / NACK / Publisher Confirm

为什么需要：消息一旦发布，就必须保证**不丢**。没有确认机制，Consumer 崩溃或网络抖动会导致消息丢失。

```
Consumer ACK：
1. Broker 推送消息给 Consumer
2. Consumer 处理完成后发送 ACK
3. Broker 收到 ACK 后删除消息
4. 如果 Consumer 断开未 ACK → Broker 重新入队（交给另一个 Consumer）

Consumer NACK：
1. Consumer 发送 NACK + requeue=true / false
2. requeue=true  → 重新入队（Consumer 处理失败但不想丢）
3. requeue=false → 丢弃或投递死信队列（致命错误）

Publisher Confirm（AMQP 事务的轻量替代）：
1. Publisher 发送消息（basic.publish）
2. Broker 收到 → 回复 basic.ack（消息已持久化 / 已路由到至少一个队列）
3. Broker 无法路由 → 回复 basic.nack（返回错误原因）
```

三种 ACK 共同构成端到端可靠性：

```
Producer ──── Publish ────→ Broker ──── Deliver ────→ Consumer
  │                           │                          │
  └── basic.ack (已持久化)    └── Consumer ACK (已处理)  ┘
```

---

### 3. 虚拟主机（vhost）

为什么需要：多租户隔离。一个 Broker 实例上运行多个逻辑独立的"消息空间"，租户之间不能互相访问。

```
/connection: host:5672/vhost_name

每个 vhost 独立拥有：
- Exchange 集合
- Queue 集合
- Binding 关系
- 用户 + 权限

默认 vhost: "/"

配置：
rabbitmqctl add_vhost /production
rabbitmqctl set_permissions -p /production user ".*" ".*" ".*"
```

隔离效果：vhost A 无法访问 vhost B 的 Queue，即使用户名相同。

---

### 4. 死信队列（DLX）

为什么需要：消息消费失败不能永远在队列里重试，需要**兜底**——记录失败原因、延迟重试、或人工介入。

```
触发条件：
1. Consumer NACK + requeue=false
2. 消息 TTL 过期（x-message-ttl）
3. 队列达到最大长度（x-max-length）

DLX 配置：
  x-dead-letter-exchange: dlx.exchange
  x-dead-letter-routing-key: dlx.routing.key

流程：
Queue ──消息死信──→ DLX(Direct/Fanout) ──→ DLQ(死信队列) ──→ Consumer（告警 / 重试 / 入库）

进阶：延迟队列
  Queue TTL（消息过期）→ 投递到 DLX → 另一个 Queue（延迟消费）
  = 用 DLX 实现定时/延迟消息，不需要额外组件
```

---

### 5. 流量控制 —— Prefetch + 背压

```
Consumer Prefetch Count：
  basic.qos prefetch_count=10
  → Broker 最多同时推送 10 条未 ACK 消息给 Consumer
  → Consumer 处理慢时不会被淹没

TCP 背压（Connection 级流控）：
  Publisher 发送过快 → Broker 内存水位上升
  → Broker 停止读取 TCP socket
  → TCP Window 填满 → 背压传导到 Publisher
```

---

## 关键设计决策

| 问题 | 为什么 |
|------|--------|
| 为什么分成 Method / Header / Body 三种帧 | 元数据和体分离：Header 和 Body 可独立路由/存储，Broker 只解析 Header 就可以决定转发，不用碰 Body |
| 为什么需要 Channel | 一个 TCP 连接承载多个逻辑通道，减少连接数（类似 HTTP/2 多路复用） |
| 为什么是 Broker 路由（而非 P2P） | Producer 不需要知道 Consumer 在哪，扩展性更好；Broker 做持久化保证可靠性 |
| 为什么 Basic.Publish 需要确认 | 网络不可靠，没有确认 Producer 不知道消息是否到达 Broker |
| 为什么需要 vhost | 多应用共享一个 Broker 集群时隔离数据，降低运维成本 |
| 为什么 0-9-1 和 1.0 不兼容 | 0-9-1 是 Broker 路由模型；1.0 是 Peer-to-Peer Link 模型，底层设计哲学不同 |

---

## 排障速查

```bash
# RabbitMQ 常用诊断
rabbitmqctl list_connections            # 连接状态
rabbitmqctl list_channels               # 通道状态
rabbitmqctl list_queues                 # 队列积压
rabbitmqctl list_consumers              # 消费者状态
```

| 问题 | 现象 | 排查 | 常见原因 |
|------|------|------|---------|
| 消息堆积 | Queue 消息数持续增长 | `rabbitmqctl list_queues messages name` 看哪个 Queue | Consumer 处理慢 / Consumer 挂掉 |
| 消息丢失 | Producer 确认消息已发，但 Consumer 收不到 | 检查 binding（`rabbitmqctl list_bindings`） / mandatory 标志 | binding 未配置 / Exchange 发到了错误的 Queue |
| 连接被关闭 | `connection closed, unexpected EOF` | `rabbitmqctl list_connections` 看关闭原因 | 心跳超时 / 客户端或服务端内存满 |
| Unroutable | `NO_ROUTE` | 检查 Exchange 类型和 routing key 是否匹配 binding | routing key 拼写错误 / 绑定不存在 |
| Consumer 不消费 | Queue 有消息，Consumer 在线但不收 | `rabbitmqctl list_consumers` 看 prefetch 和 channel | prefetch=0（无限制，但在等 ACK）；Consumer channel 阻塞 |
| ACK 超时 | 消息被重新投递 | `rabbitmqctl environment` 看 consumer_timeout | Consumer 处理太慢未 ACK |

---

## 常用工具

```bash
# RabbitMQ 管理
rabbitmq-plugins enable rabbitmq_management     # 开启管理插件（端口 15672）
rabbitmqctl status                               # 集群状态
rabbitmqctl list_queues name messages consumers   # 队列概览

# 客户端诊断
telnet localhost 5672                             # 测试端口
openssl s_client -connect localhost:5671          # TLS 连接测试

# 发布/消费测试（amqp-utils / rabbitmqadmin）
rabbitmqadmin declare exchange name=test type=direct   # 创建交换器
rabbitmqadmin declare queue name=test-queue            # 创建队列
rabbitmqadmin declare binding source=test destination=test-queue routing_key=test
rabbitmqadmin publish exchange=test routing_key=test payload="hello"
rabbitmqadmin get queue=test-queue                     # 消费消息

# 排障脚本
echo "=== 队列积压 Top 10 ==="
rabbitmqctl list_queues messages name | sort -rn | head -10
echo "=== 连接状态 ==="
rabbitmqctl list_connections pid peer_host state
echo "=== 消费者 ==="
rabbitmqctl list_consumers queue channel_tag ack_required prefetch_count

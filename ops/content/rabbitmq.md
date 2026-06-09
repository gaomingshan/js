# RabbitMQ 部署运维指南

> **定位**：最流行的开源消息代理，AMQP 协议实现，企业级消息中间件
> **适用场景**：异步解耦、事件驱动架构、跨系统消息路由、RPC
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

RabbitMQ 是 Erlang 实现的开源消息代理，基于 AMQP 0-9-1 协议，支持多种交换机类型、灵活路由、消息确认、死信队列、延迟消息等企业级特性。

### 1.2 核心概念

```
Producer → Exchange (路由) → Queue (存储) → Consumer
                ↓
         Binding (绑定规则)
```

| 概念 | 说明 |
|------|------|
| **Exchange** | 路由器：direct/topic/fanout/headers |
| **Queue** | 消息存储，FIFO |
| **Binding** | Exchange → Queue 的绑定规则 |
| **Channel** | 连接内的轻量级通道，多路复用 |
| **VHost** | 虚拟主机，资源隔离 |

### 1.3 适用场景

**最佳适用**：异步解耦、事件驱动、跨系统路由、RPC、延迟消息（TTL+DLX）

**不适用**：高吞吐日志收集（→ Kafka）、IoT 海量连接（→ EMQX）、大数据管道（→ Pulsar）

---

## 2. 部署

### 2.1 裸机部署

```bash
# CentOS
sudo yum install -y erlang rabbitmq-server
sudo systemctl enable rabbitmq-server && sudo systemctl start rabbitmq-server

# 启用管理插件
sudo rabbitmq-plugins enable rabbitmq_management
# 访问 http://localhost:15672（guest/guest，仅 localhost）

# Ubuntu
sudo apt install -y rabbitmq-server
sudo systemctl enable rabbitmq-server && sudo systemctl start rabbitmq-server
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -v rabbitmq-data:/var/lib/rabbitmq \
  -v ./conf/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf \
  --restart unless-stopped \
  rabbitmq:3.13-management
```

### 2.3 Docker Compose 部署（3 节点集群）

```yaml
# docker-compose.yml
version: '3.8'

services:
  rabbitmq-1:
    image: rabbitmq:3.13-management
    container_name: rabbitmq-1
    hostname: rabbitmq-1
    restart: unless-stopped
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_ERLANG_COOKIE: Str0ngErlang!Cookie
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: Str0ngRabbit!Pass
    volumes:
      - rmq-1-data:/var/lib/rabbitmq
      - ./conf/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
      - ./conf/definitions.json:/etc/rabbitmq/definitions.json
    networks:
      - rmq-net

  rabbitmq-2:
    image: rabbitmq:3.13-management
    container_name: rabbitmq-2
    hostname: rabbitmq-2
    restart: unless-stopped
    environment:
      RABBITMQ_ERLANG_COOKIE: Str0ngErlang!Cookie
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: Str0ngRabbit!Pass
    volumes:
      - rmq-2-data:/var/lib/rabbitmq
      - ./conf/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    networks:
      - rmq-net

  rabbitmq-3:
    image: rabbitmq:3.13-management
    container_name: rabbitmq-3
    hostname: rabbitmq-3
    restart: unless-stopped
    environment:
      RABBITMQ_ERLANG_COOKIE: Str0ngErlang!Cookie
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: Str0ngRabbit!Pass
    volumes:
      - rmq-3-data:/var/lib/rabbitmq
      - ./conf/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    networks:
      - rmq-net

volumes:
  rmq-1-data:
  rmq-2-data:
  rmq-3-data:

networks:
  rmq-net:
    driver: bridge
```

**集群组建**（启动后执行）：

```bash
# 在节点 2、3 上加入集群
docker exec rabbitmq-2 rabbitmqctl stop_app
docker exec rabbitmq-2 rabbitmqctl join_cluster rabbit@rabbitmq-1
docker exec rabbitmq-2 rabbitmqctl start_app

docker exec rabbitmq-3 rabbitmqctl stop_app
docker exec rabbitmq-3 rabbitmqctl join_cluster rabbit@rabbitmq-1
docker exec rabbitmq-3 rabbitmqctl start_app

# 验证
docker exec rabbitmq-1 rabbitmqctl cluster_status
```

### 2.4 生产环境部署要点

**队列镜像（HA）**：

```bash
# 经典镜像队列（3.13 之前推荐）
rabbitmqctl set_policy ha-all ".*" '{"ha-mode":"all","ha-sync-mode":"automatic"}' --apply-to queues

# 3.13+ 推荐仲裁队列（Quorum Queue），无需配置策略
# 创建队列时指定 x-queue-type: quorum
```

**安全清单**：删除 guest 用户、强密码、TLS 加密、VHost 隔离、权限最小化、Management 插件限制访问

---

## 3. 配置文件

> **核心原则**：RabbitMQ 使用 `rabbitmq.conf`（新格式）或 `advanced.config`（Erlang 格式）。以下按场景提供完整配置。

### 3.2 开发环境配置

```ini
# conf/rabbitmq-dev.conf — 开发环境
listeners.tcp.default = 5672
management.tcp.port = 15672
loopback_users.guest = true         # guest 仅 localhost
```

### 3.3 测试环境配置

```ini
# conf/rabbitmq-test.conf — 测试环境
listeners.tcp.default = 5672
management.tcp.port = 15672

# === 内存水位 ===
# 逻辑：RabbitMQ 默认内存水位 0.4（40%），超过则阻塞生产者
# 测试环境可放宽
vm_memory_high_watermark.relative = 0.6

# === 磁盘水位 ===
disk_free_limit.absolute = 2GB     # 磁盘剩余 < 2GB 阻塞生产者

# === 日志 ===
log.console = true
log.console.level = info
log.file.level = info

# === 默认用户/密码（通过环境变量设置）===
# default_user = admin
# default_pass = TestStr0ng!Pass
```

### 3.4 生产环境配置

```ini
# conf/rabbitmq.conf — 生产环境配置

# === 网络 ===
listeners.tcp.default = 5672
management.tcp.port = 15672
# TLS（生产推荐）
# listeners.ssl.default = 5671
# ssl_options.cacertfile = /etc/rabbitmq/ca.crt
# ssl_options.certfile = /etc/rabbitmq/server.crt
# ssl_options.keyfile = /etc/rabbitmq/server.key
# ssl_options.verify = verify_peer

# === 内存管理 ===
# 逻辑：RabbitMQ 是 Erlang 应用，Erlang VM 内存 = RabbitMQ 进程 + Erlang 运行时
# vm_memory_high_watermark 控制生产者阻塞阈值
# 设太高 → OOM；设太低 → 过早阻塞影响吞吐
vm_memory_high_watermark.relative = 0.4   # 默认 40%，推荐保持
vm_memory_high_watermark_paging_ratio = 0.5  # 40%×50%=20% 开始换页，渐进阻塞

# === 磁盘 ===
disk_free_limit.absolute = 5GB     # 磁盘剩余 < 5GB 阻塞生产者

# === 集群 ===
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config
cluster_formation.classic_config.nodes.1 = rabbit@rabbitmq-1
cluster_formation.classic_config.nodes.2 = rabbit@rabbitmq-2
cluster_formation.classic_config.nodes.3 = rabbit@rabbitmq-3

# === 队列 ===
# 3.13+ 默认队列类型
quorum_queues.default_enabled = true

# === 消息持久化 ===
# 逻辑：消息持久化 = exchange durable + queue durable + message persistent
# 三者缺一不可，否则重启后消息丢失
# 此处配置默认行为，实际需在声明时指定

# === 连接 ===
heartbeat = 60                     # 心跳间隔 60 秒
# 注意：RabbitMQ 没有 connection_max 参数
# 连接数受 OS 文件描述符限制，通过以下方式配置：
# 1. OS 层：ulimit -n 65536（文件描述符）
# 2. 连接层：channel_max = 2047（单连接最大 Channel 数）

# === 日志 ===
log.console = false
log.file = /var/log/rabbitmq/rabbit.log
log.file.level = warning
log.file.rotation.date = $D0        # 每日轮转
log.file.rotation.size = 100MB

# === 管理 ===
management.load_definitions = /etc/rabbitmq/definitions.json  # 启动时加载定义
management.rate_limit = 100         # Management API 限流

# === 其他 ===
channel_max = 2047                  # 最大 Channel 数
frame_max = 131072                  # 最大帧大小 128KB
default_consumer_timeout = 1800000  # 消费者确认超时 30 分钟
```

**预定义资源** `conf/definitions.json`：

```json
{
  "users": [
    {"name": "admin", "password_hash": "...", "tags": "administrator"},
    {"name": "appuser", "password_hash": "...", "tags": ""}
  ],
  "vhosts": [
    {"name": "/"},
    {"name": "app-vhost"}
  ],
  "permissions": [
    {"user": "appuser", "vhost": "app-vhost", "configure": ".*", "write": ".*", "read": ".*"}
  ],
  "policies": [
    {
      "name": "ha-quorum",
      "vhost": "app-vhost",
      "pattern": ".*",
      "definition": {"ha-mode": "all"},
      "apply-to": "queues"
    }
  ]
}
```

---

## 4. 调优

### 4.1 内存子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `vm_memory_high_watermark.relative` | 内存阻塞阈值 | 0.4 | 超过阈值阻塞所有生产者。0.4 是安全值，Erlang VM + OS 需要剩余内存 |
| `vm_memory_high_watermark_paging_ratio` | 换页比例 | 0.5 | 到 watermark × paging_ratio 开始换页，渐进阻塞而非突然停止 |
| `quorum_commands_soft_limit` | 仲裁队列命令缓冲 | 256 | 仲裁队列内部命令缓冲区，增大可提高吞吐但内存增加 |

### 4.2 IO 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `disk_free_limit.absolute` | 磁盘剩余限制 | 5GB | 低于此值阻塞生产者。设太小 → 磁盘满导致数据损坏 |
| `msg_store_file_size_limit` | 消息存储文件大小 | 16MB | 小文件 IO 效率差，大文件恢复慢。16MB 平衡点 |

### 4.3 连接子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `heartbeat` | 心跳间隔 | 60s | 检测死连接。太短 → 网络抖动误判；太长 → 死连接占资源 |
| `connection_max` | 单连接最大 Channel | 1000 | Channel 是轻量级复用，但过多 Channel 增加内存 |
| `channel_max` | 全局最大 Channel | 2047 | 限制总 Channel 数，防止资源耗尽 |

### 4.4 容量规划

| 规模 | CPU | 内存 | 磁盘 | 队列数 | TPS |
|------|-----|------|------|--------|-----|
| 小型 | 2 核 | 4G | 50G SSD | < 100 | < 5000 |
| 中型 | 4 核 | 16G | 200G SSD | 100-500 | 5000-2 万 |
| 大型 | 8 核 | 32G | 500G SSD | 500+ | 2 万+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 集群状态
rabbitmqctl cluster_status
rabbitmqctl status

# 队列管理
rabbitmqctl list_queues name messages consumers
rabbitmqctl list_queues name messages_ready messages_unacknowledged
rabbitmqctl list_queues name memory   # 队列内存占用

# 用户管理
rabbitmqctl list_users
rabbitmqctl add_user appuser AppUser!Pass
rabbitmqctl set_permissions -p / appuser ".*" ".*" ".*"

# 策略管理
rabbitmqctl list_policies
rabbitmqctl set_policy ha-all ".*" '{"ha-mode":"all"}' --apply-to queues

# 清空队列
rabbitmqctl purge_queue queue_name
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **队列消息堆积** | `list_queues messages` | 持续增长 |
| **消费者数** | `list_queues consumers` | 关键队列 = 0 |
| **未确认消息** | `list_queues messages_unacknowledged` | 持续增长 |
| **内存使用** | `status → memory` | > 80% watermark |
| **磁盘剩余** | `status → disk_free` | < disk_free_limit |
| **连接数** | `list_connections` | 异常增长 |

**Prometheus（rabbitmq_exporter）**：

```bash
docker run -d \
  --name rabbitmq-exporter \
  -p 9419:9419 \
  -e RABBIT_URL=http://rabbitmq:15672 \
  -e RABBIT_USER=admin \
  -e RABBIT_PASS=Str0ngRabbit!Pass \
  kbudde/rabbitmq-exporter
```

### 5.3 备份与恢复

```bash
# 导出定义（用户/队列/策略/绑定等）
rabbitmqctl export_definitions /backup/definitions.json

# 导入定义
rabbitmqctl import_definitions /backup/definitions.json

# 消息备份：无原生方案，需应用层处理或使用 Shovel 插件
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：消息堆积

**排查链路**：

```
现象：队列消息持续增长
  → rabbitmqctl list_queues name messages consumers
    → consumers = 0？→ 消费者宕机或未启动
    → consumers > 0？→ 消费速度不够
      → messages_unacknowledged 高？→ 消费者处理慢或未确认
        → 检查消费者日志和性能
      → 消费者正常？→ 增加消费者实例
```

#### 故障 2：内存告警阻塞

**排查**：

```bash
rabbitmqctl status | grep -A 10 memory
# 查看哪类对象占内存最多
rabbitmqctl list_queues name memory | sort -k2 -n -r | head -10
```

**解决**：清理大队列 → 增大内存 → 优化消息大小 → 设置队列 TTL

#### 故障 3：集群脑裂

**排查**：

```bash
rabbitmqctl cluster_status
# 查看各节点运行状态和分区信息
```

**解决**：`rabbitmqctl stop_app` → 重新加入集群 → 启用仲裁队列减少脑裂影响

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `rabbitmqctl status` | 节点状态 |
| `rabbitmqctl list_queues` | 队列详情 |
| Management UI | `:15672` Web 管理 |
| `rabbitmq-diagnostics` | 诊断命令（3.8+） |
| Prometheus metrics | `:15692/metrics`（需启用插件） |

---

## 7. 参考资料

- [RabbitMQ Documentation](https://www.rabbitmq.com/docs/)
- [RabbitMQ Configuration](https://www.rabbitmq.com/docs/configure)
- [RabbitMQ Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues)
- [RabbitMQ Clustering](https://www.rabbitmq.com/docs/clustering)

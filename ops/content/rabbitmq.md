# RabbitMQ 部署指南

> 版本：3.13 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|---------|---------|------|
| 单机 | 1 核 / 512M | 2 核 / 4G | 10G SSD |
| 镜像队列集群 | 3 × 2 核 / 4G | 3 × 4 核 / 8G | 3 × 50G SSD |
| 仲裁队列集群 | 3 × 2 核 / 4G | 3 × 4 核 / 8G | 3 × 50G SSD |

---

## 2. 裸机安装（通用）

```bash
# CentOS 7.9+
sudo yum install -y epel-release
sudo yum install -erlang rabbitmq-server

# Ubuntu 22.04+
sudo apt update && sudo apt install -y rabbitmq-server

# 启用管理插件
sudo rabbitmq-plugins enable rabbitmq_management

# 创建目录
sudo mkdir -p /etc/rabbitmq /var/lib/rabbitmq /var/log/rabbitmq
```

---

## 3. 单机部署

**适用场景**：开发测试、低吞吐量生产（< 5000 TPS）

### 配置文件

创建 `/etc/rabbitmq/rabbitmq.conf`：

```ini
listeners.tcp.default = 5672
management.tcp.port = 15672
loopback_users.guest = true

vm_memory_high_watermark.relative = 0.4
disk_free_limit.absolute = 2GB

log.console.level = info
log.file.level = info
```

### 启动

```bash
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server
```

### 验证

```bash
# 节点状态
sudo rabbitmqctl status

# 集群状态
sudo rabbitmqctl cluster_status

# 访问管理界面
# http://<host>:15672  guest/guest（仅 localhost 可登录）
```

### Docker Compose

```yaml
services:
  rabbitmq:
    image: rabbitmq:3.13-management
    container_name: rabbitmq
    hostname: rabbitmq
    restart: unless-stopped
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: Str0ngRabbit!Pass
    volumes:
      - rmq-data:/var/lib/rabbitmq
      - ./conf/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf

volumes:
  rmq-data:
```

---

## 4. 集群部署

### 4.1 镜像队列集群（经典 HA）

**适用场景**：兼容旧版客户端，需跨节点冗余

### 节点规划

| 节点 | hostname | IP | 角色 |
|------|----------|----|------|
| 1 | rabbitmq-1 | 192.168.1.10 | RAM/DISC |
| 2 | rabbitmq-2 | 192.168.1.11 | RAM/DISC |
| 3 | rabbitmq-3 | 192.168.1.12 | RAM/DISC |

### 配置文件

所有节点 `/etc/rabbitmq/rabbitmq.conf` 相同：

```ini
listeners.tcp.default = 5672
management.tcp.port = 15672

vm_memory_high_watermark.relative = 0.4
disk_free_limit.absolute = 5GB

cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config
cluster_formation.classic_config.nodes.1 = rabbit@rabbitmq-1
cluster_formation.classic_config.nodes.2 = rabbit@rabbitmq-2
cluster_formation.classic_config.nodes.3 = rabbit@rabbitmq-3

heartbeat = 60
channel_max = 2047
frame_max = 131072
default_consumer_timeout = 1800000

log.console = false
log.file = /var/log/rabbitmq/rabbit.log
log.file.level = warning
log.file.rotation.date = $D0
log.file.rotation.size = 100MB

management.load_definitions = /etc/rabbitmq/definitions.json
```

**所有节点 Erlang Cookie 必须一致**：

```bash
# 在节点 1 上
echo "Str0ngErlangCookieSecret" | sudo tee /var/lib/rabbitmq/.erlang.cookie
sudo chmod 400 /var/lib/rabbitmq/.erlang.cookie

# 拷贝到节点 2、3
scp /var/lib/rabbitmq/.erlang.cookie root@rabbitmq-2:/var/lib/rabbitmq/
scp /var/lib/rabbitmq/.erlang.cookie root@rabbitmq-3:/var/lib/rabbitmq/
```

### 启动

```bash
# 所有节点
sudo systemctl start rabbitmq-server

# 节点 2、3 加入集群
# 节点 2
sudo rabbitmqctl stop_app
sudo rabbitmqctl join_cluster rabbit@rabbitmq-1
sudo rabbitmqctl start_app

# 节点 3
sudo rabbitmqctl stop_app
sudo rabbitmqctl join_cluster rabbit@rabbitmq-1
sudo rabbitmqctl start_app

# 设置镜像策略
sudo rabbitmqctl set_policy ha-all ".*" '{"ha-mode":"all","ha-sync-mode":"automatic"}' --apply-to queues
```

### 验证

```bash
sudo rabbitmqctl cluster_status
# 显示 3 个节点在线
```

### Docker Compose

```yaml
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

Docker 环境下集群加入命令同上。

### 4.2 仲裁队列集群（3.13+ 推荐）

**适用场景**：新项目，需高可用 + 数据一致性，替代镜像队列

配置与镜像队列集群**完全相同**，仅队列创建方式不同：

```bash
# 创建仲裁队列（客户端或管理界面）
# 方式一：客户端声明时指定
# channel.queue_declare(queue="my-quorum", arguments={"x-queue-type": "quorum"})

# 方式二：默认全部启用仲裁队列（rabbitmq.conf）
quorum_queues.default_enabled = true
```

**仲裁队列优势**：Raft 共识自动选主，无脑裂风险，无需配置 HA 策略

---

## 5. 运维速查

### 常用命令

```bash
# 节点状态
rabbitmqctl status
rabbitmqctl cluster_status

# 队列
rabbitmqctl list_queues name messages consumers
rabbitmqctl list_queues name messages_ready messages_unacknowledged memory

# 用户
rabbitmqctl list_users
rabbitmqctl add_user <user> <pass>
rabbitmqctl set_permissions -p <vhost> <user> ".*" ".*" ".*"
rabbitmqctl delete_user guest

# 策略
rabbitmqctl list_policies
rabbitmqctl set_policy ha-all ".*" '{"ha-mode":"all"}' --apply-to queues

# 定义导出/导入
rabbitmqctl export_definitions /backup/definitions.json
rabbitmqctl import_definitions /backup/definitions.json

# 清空队列
rabbitmqctl purge_queue <queue>
```

### 关键告警指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| 消息堆积 | `list_queues messages` | 持续增长 |
| 消费者离线 | `list_queues consumers` | 关键队列 = 0 |
| 未确认消息 | `list_queues messages_unacknowledged` | 持续增长 |
| 内存使用 | `status → memory` | > vm_memory_high_watermark |
| 磁盘剩余 | `status → disk_free` | < disk_free_limit |
| 连接数异常 | `list_connections` | 突增或突降 |

---

## 6. 常见故障

### 故障 1：消息堆积

**排查链路**：

```
现象：队列消息持续增长
  → rabbitmqctl list_queues name messages consumers
    → consumers = 0？→ 消费者宕机
    → consumers > 0？→ 消费能力不足
      → messages_unacknowledged 高？→ 消费者处理慢或未确认
      → 正常？→ 增加消费者
```

### 故障 2：内存告警阻塞生产者

```bash
# 查看内存分布
rabbitmqctl status | grep -A 10 memory
rabbitmqctl list_queues name memory | sort -k2 -n -r | head -10
```

**解决**：清理大队列 → 增大内存 → 优化消息大小 → 设置队列 TTL

### 故障 3：集群脑裂（镜像队列）

```bash
rabbitmqctl cluster_status
# 节点间分区信息

# 恢复
rabbitmqctl stop_app
rabbitmqctl start_app
# 或手动 reset 后重新加入集群
```

**预防**：使用仲裁队列（Raft 协议天然防脑裂）

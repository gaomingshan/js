# RabbitMQ 核心配置

## 概述

RabbitMQ 配置通过配置文件、环境变量和管理界面三种方式管理。本章系统讲解核心配置参数。

---

## 1. 配置文件

### 1.1 配置文件位置

```bash
# Linux
/etc/rabbitmq/rabbitmq.conf

# macOS (Homebrew)
/usr/local/etc/rabbitmq/rabbitmq.conf

# Windows
%APPDATA%\RabbitMQ\rabbitmq.conf
```

### 1.2 基础配置

```conf
# rabbitmq.conf

# 监听地址
listeners.tcp.default = 5672

# 管理插件端口
management.tcp.port = 15672

# 虚拟主机
default_vhost = /

# 默认用户（生产环境删除）
# default_user = guest
# default_pass = guest

# 日志级别
log.console.level = info
log.file.level = info
```

---

## 2. 内存配置

```conf
# 内存阈值（相对值，系统内存的 40%）
vm_memory_high_watermark.relative = 0.4

# 内存阈值（绝对值，2GB）
# vm_memory_high_watermark.absolute = 2GB

# 内存阈值（Paging，90%）
vm_memory_high_watermark_paging_ratio = 0.9
```

---

## 3. 磁盘配置

```conf
# 磁盘空间阈值（绝对值）
disk_free_limit.absolute = 50GB

# 磁盘空间阈值（相对值，磁盘的 50%）
# disk_free_limit.relative = 0.5
```

---

## 4. 队列配置

### 4.1 默认队列参数

```conf
# 队列最大长度
# default_queue_max_length = 10000

# 队列最大字节数
# default_queue_max_length_bytes = 104857600
```

### 4.2 惰性队列

```java
// 应用层配置
Map<String, Object> args = new HashMap<>();
args.put("x-queue-mode", "lazy");
channel.queueDeclare("lazy-queue", true, false, false, args);
```

---

## 5. 连接配置

```conf
# 最大连接数
# connection_max = 65536

# 心跳超时（60秒）
heartbeat = 60

# 通道最大数
channel_max = 2047
```

---

## 6. 消息配置

```conf
# 消息最大大小（128MB）
max_message_size = 134217728
```

---

## 7. 集群配置

```conf
# 集群名称
cluster_name = rabbitmq-cluster

# 集群分区处理（autoheal/pause_minority/ignore）
cluster_partition_handling = autoheal
```

---

## 8. SSL/TLS 配置

```conf
# 启用 SSL
listeners.ssl.default = 5671

ssl_options.cacertfile = /path/to/ca_certificate.pem
ssl_options.certfile   = /path/to/server_certificate.pem
ssl_options.keyfile    = /path/to/server_key.pem
ssl_options.verify     = verify_peer
ssl_options.fail_if_no_peer_cert = true
```

---

## 9. 性能配置

```conf
# 预取数量
# channel_prefetch_count = 100

# 收集统计间隔（5秒）
collect_statistics_interval = 5000
```

---

## 10. 环境变量配置

```bash
# 节点名称
RABBITMQ_NODENAME=rabbit@hostname

# Cookie（集群认证）
RABBITMQ_ERLANG_COOKIE=secret_cookie

# 配置文件路径
RABBITMQ_CONFIG_FILE=/etc/rabbitmq/rabbitmq

# 日志目录
RABBITMQ_LOG_BASE=/var/log/rabbitmq
```

---

## 11. 策略配置

通过管理界面或 rabbitmqctl 配置策略：

```bash
# 配置镜像队列策略
rabbitmqctl set_policy ha-all "^ha\." \
  '{"ha-mode":"all","ha-sync-mode":"automatic"}' \
  --priority 1 \
  --apply-to queues

# 配置 TTL 策略
rabbitmqctl set_policy ttl-policy "^ttl\." \
  '{"message-ttl":86400000}' \
  --apply-to queues
```

---

## 12. 推荐配置

### 12.1 生产环境配置

```conf
# 内存和磁盘
vm_memory_high_watermark.relative = 0.6
disk_free_limit.absolute = 50GB

# 日志
log.file.level = info

# 心跳
heartbeat = 60

# 连接
channel_max = 2047

# 集群
cluster_partition_handling = autoheal
```

### 12.2 高可用配置

```bash
# 仲裁队列
rabbitmqctl set_policy quorum-policy "^quorum\." \
  '{"queue-type":"quorum"}' \
  --apply-to queues
```

---

## 关键要点

1. **内存阈值**：默认 40%，建议调整到 60%
2. **磁盘阈值**：设置合理的磁盘空间告警
3. **心跳超时**：避免网络抖动导致连接断开
4. **集群分区**：使用 autoheal 自动恢复
5. **仲裁队列**：生产环境推荐使用

---

## 参考资料

1. [RabbitMQ Configuration](https://www.rabbitmq.com/configure.html)
2. [RabbitMQ Memory Alarms](https://www.rabbitmq.com/memory.html)

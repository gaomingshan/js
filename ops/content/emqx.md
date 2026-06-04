# EMQX 部署运维指南

> **定位**：开源 MQTT 消息 broker，IoT 海量连接首选
> **适用场景**：IoT 设备接入、车联网、工业物联网、移动推送
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

EMQX 是开源的高性能 MQTT 消息 broker，单节点支持百万级 MQTT 连接，支持 MQTT 3.1/3.1.1/5.0、WebSocket、CoAP 等协议，内置规则引擎和数据桥接。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **百万级连接** | 单节点 100 万+ MQTT 连接 |
| **MQTT 5.0** | 完整支持 MQTT 5.0 规范 |
| **规则引擎** | SQL 语法规则，内置数据处理 |
| **数据桥接** | Kafka/MySQL/Redis/PG 等无缝对接 |
| **集群** | Mnesia 分布式数据库，自动分片 |
| **认证授权** | 内置密码/Token/JWT/LDAP/HTTP 认证 |

### 1.3 适用场景

**最佳适用**：IoT 设备接入、车联网、工业物联网、移动消息推送、传感器数据采集

**不适用**：服务间异步解耦（→ RabbitMQ）、高吞吐日志管道（→ Kafka）、RPC（→ gRPC）

---

## 2. 部署

### 2.1 裸机部署

```bash
# CentOS
sudo yum install -y https://www.emqx.com/en/downloads/broker/5.7.0/emqx-5.7.0-el9-amd64.rpm
sudo systemctl start emqx && sudo systemctl enable emqx

# Docker
docker run -d \
  --name emqx \
  -p 1883:1883 \
  -p 8083:8083 \
  -p 8084:8084 \
  -p 8883:8883 \
  -p 18083:18083 \
  -v emqx-data:/opt/emqx/data \
  -v emqx-log:/opt/emqx/log \
  --restart unless-stopped \
  emqx/emqx:5.7.0
```

**端口说明**：

| 端口 | 协议 | 用途 |
|------|------|------|
| 1883 | MQTT | TCP 连接 |
| 8883 | MQTTS | TLS 连接 |
| 8083 | WebSocket | WS 连接 |
| 8084 | WSS | WebSocket TLS |
| 18083 | HTTP | 管理 Dashboard |

### 2.2 Docker Compose 部署（3 节点集群）

```yaml
# docker-compose.yml
version: '3.8'

services:
  emqx-1:
    image: emqx/emqx:5.7.0
    container_name: emqx-1
    hostname: emqx-1
    restart: unless-stopped
    environment:
      EMQX_NAME: emqx-1
      EMQX_HOST: 10.0.0.1
      EMQX_CLUSTER__DISCOVERY_STRATEGY: static
      EMQX_CLUSTER__STATIC__SEEDS: "[emqx-1,emqx-2,emqx-3]"
    ports:
      - "1883:1883"
      - "18083:18083"
    volumes:
      - emqx-1-data:/opt/emqx/data
    networks:
      - emqx-net

  emqx-2:
    image: emqx/emqx:5.7.0
    container_name: emqx-2
    hostname: emqx-2
    restart: unless-stopped
    environment:
      EMQX_NAME: emqx-2
      EMQX_HOST: 10.0.0.2
      EMQX_CLUSTER__DISCOVERY_STRATEGY: static
      EMQX_CLUSTER__STATIC__SEEDS: "[emqx-1,emqx-2,emqx-3]"
    volumes:
      - emqx-2-data:/opt/emqx/data
    networks:
      - emqx-net

  emqx-3:
    image: emqx/emqx:5.7.0
    container_name: emqx-3
    hostname: emqx-3
    restart: unless-stopped
    environment:
      EMQX_NAME: emqx-3
      EMQX_HOST: 10.0.0.3
      EMQX_CLUSTER__DISCOVERY_STRATEGY: static
      EMQX_CLUSTER__STATIC__SEEDS: "[emqx-1,emqx-2,emqx-3]"
    volumes:
      - emqx-3-data:/opt/emqx/data
    networks:
      - emqx-net

volumes:
  emqx-1-data:
  emqx-2-data:
  emqx-3-data:

networks:
  emqx-net:
    driver: bridge
```

### 2.3 生产环境部署要点

**百万连接调优**：

```bash
# OS 参数调优（每个节点）
sudo sysctl -w fs.file-max=2097152
sudo sysctl -w fs.nr_open=2097152
sudo sysctl -w net.core.somaxconn=65536
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=65536
sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"
sudo sysctl -w net.ipv4.tcp_tw_reuse=1

# 文件描述符限制
ulimit -n 1048576
```

**安全清单**：TLS 加密（8883）、认证（密码/JWT/PSK）、ACL 授权、限流（flapping detection）

---

## 3. 配置文件

> **核心原则**：EMQX 5.x 使用 HOCON 格式配置，支持 Dashboard 热更新 + `emqx.conf` 文件。

### 3.2 开发环境配置

```hocon
# emqx.conf — 开发环境
listeners.tcp.default {
  bind = "0.0.0.0:1883"
  max_connections = 10240
}

listeners.ws.default {
  bind = "0.0.0.0:8083"
  max_connections = 10240
}

dashboard {
  listeners.http {
    bind = "0.0.0.0:18083"
  }
  default_username = "admin"
  default_password = "public"
}

authorization {
  no_match = allow    # 开发环境允许所有
}
```

### 3.3 生产环境配置

```hocon
# emqx.conf — 生产环境

# === MQTT 监听器 ===
listeners.tcp.default {
  bind = "0.0.0.0:1883"
  max_connections = 1000000       # 百万连接
  max_mqtt_pkt_size = 1MB         # 最大 MQTT 报文
  rate_limit {
    max_conn_rate = 1000          # 每秒最大新连接
    conn_msgs_rate = 100          # 每秒每连接最大消息数
  }
}

# TLS 监听器
listeners.ssl.default {
  bind = "0.0.0.0:8883"
  max_connections = 500000
  ssl_options {
    cacertfile = "/etc/emqx/certs/ca.crt"
    certfile = "/etc/emqx/certs/server.crt"
    keyfile = "/etc/emqx/certs/server.key"
    verify = verify_peer
    fail_if_no_peer_cert = false
  }
}

# WebSocket
listeners.ws.default {
  bind = "0.0.0.0:8083"
  max_connections = 100000
}

# === 集群 ===
cluster {
  discovery_strategy = static
  static.seeds = ["emqx-1","emqx-2","emqx-3"]
}

# === 认证 ===
authentication {
  mechanism = password_based
  backend = built_in_database
  user_id_type = username
}

authorization {
  no_match = deny              # 默认拒绝
  sources = [
    {
      type = built_in_database
    }
  ]
}

# === 限流 ===
flapping_detect {
  enable = true
  max_count = 15               # 15 次异常断连
  window_time = 1m             # 1 分钟窗口
  ban_time = 5m                # 封禁 5 分钟
}

# === 持久会话 ===
# 5.x 支持持久会话，消息在会话断开后保留
persistent_session {
  backend = built_in_database
}

# === 日志 ===
log {
  file {
    enable = true
    level = warning
    path = "/opt/emqx/log/emqx.log"
    rotation_size = 50MB
    rotation_count = 10
  }
  console {
    enable = false
  }
}
```

---

## 4. 调优

### 4.1 连接子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `max_connections` | 最大连接数 | 100 万 | 单节点上限。需配合 OS `fs.file-max` 和 `ulimit -n` |
| `max_conn_rate` | 新连接速率 | 1000/s | 防止连接风暴。超过则排队 |
| `max_mqtt_pkt_size` | 最大报文 | 1MB | MQTT 报文大小限制。增大需注意内存 |
| `flapping_detect` | 闪断检测 | 15次/分钟 | 频繁断连的客户端自动封禁，防止资源耗尽 |

### 4.2 消息子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `max_message_size` | 最大消息 | 1MB | IoT 消息通常 < 1KB。增大需注意内存 |
| `max_qos_allowed` | 最大 QoS | 2 | QoS 2 开销最大（4 次报文），如不需要可限制 |
| `max_topic_levels` | Topic 层级深度 | 128 | 防止恶意超深 Topic |
| `retain_max_payload_size` | 保留消息最大 | 1MB | 保留消息存储在内存，限制大小 |

### 4.3 容量规划

| 规模 | 节点 | CPU | 内存 | 连接数 | 消息吞吐 |
|------|------|-----|------|--------|----------|
| 小型 | 1 | 4 核 | 8G | 10 万 | 1 万/s |
| 中型 | 3 | 8 核 | 32G | 100 万 | 10 万/s |
| 大型 | 5+ | 16 核 | 64G | 300 万+ | 50 万/s |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 集群状态
emqx ctl cluster status
emqx ctl broker

# 连接管理
emqx ctl clients list
emqx ctl clients kickout <clientid>

# 订阅管理
emqx ctl subscriptions list

# 规则引擎
emqx ctl rules list
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **连接数** | Dashboard / API | > 80% max_connections |
| **消息吞吐** | Dashboard / API | 异常波动 |
| **订阅数** | Dashboard / API | 异常增长 |
| **延迟** | Dashboard / API | P99 > 100ms |

**Prometheus**：EMQX 内置 `/api/v5/prometheus/stats` 端点

### 5.3 备份与恢复

```bash
# 导出配置和数据
emqx ctl data export /backup/emqx-data.tar.gz
emqx ctl data import /backup/emqx-data.tar.gz
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：连接被拒绝

**排查**：检查 `max_connections` → OS 文件描述符限制 → 网络端口耗尽

#### 故障 2：消息丢失

**排查**：QoS 级别是否正确 → 持久会话是否开启 → Clean Session 是否为 false

#### 故障 3：集群脑裂

**排查**：`emqx ctl cluster status` → 检查节点间网络

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| Dashboard | `:18083` Web 管理 |
| `emqx ctl` | 命令行管理 |
| `/api/v5/prometheus/stats` | Prometheus 指标 |
| MQTT CLI | `emqx ctl clients` |

---

## 7. 参考资料

- [EMQX Documentation](https://docs.emqx.com/en/emqx/latest/)
- [EMQX Configuration](https://docs.emqx.com/en/emqx/latest/configuration/configuration.html)
- [EMQX Cluster](https://docs.emqx.com/en/emqx/latest/deploy/cluster/create-cluster.html)

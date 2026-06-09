# EMQX 部署指南

> 版本：5.7.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| 内核 | Linux 5.x+（推荐） |
| 内存 | 单机 ≥ 2G，10 万连接 ≥ 8G |
| 端口 | 1883(MQTT), 8883(MQTTS), 8083(WS), 8084(WSS), 18083(Dashboard) |
| OS 调优 | `fs.file-max`、`ulimit -n`、`net.core.somaxconn` |

## 2. 裸机安装（通用）

```bash
# CentOS
sudo yum install -y https://www.emqx.com/en/downloads/broker/5.7.0/emqx-5.7.0-el9-amd64.rpm
sudo systemctl start emqx && sudo systemctl enable emqx

# Ubuntu
wget https://www.emqx.com/en/downloads/broker/5.7.0/emqx-5.7.0-ubuntu22.04-amd64.deb
sudo dpkg -i emqx-5.7.0-ubuntu22.04-amd64.deb
sudo systemctl start emqx && sudo systemctl enable emqx

# 二进制（通用）
wget https://www.emqx.com/en/downloads/broker/5.7.0/emqx-5.7.0-el9-amd64.tar.gz
tar xzf emqx-5.7.0-el9-amd64.tar.gz
cd emqx && ./bin/emqx start
```

**OS 调优**（生产环境必做）：

```bash
cat >> /etc/sysctl.conf << 'EOF'
fs.file-max=2097152
net.core.somaxconn=65536
net.ipv4.tcp_max_syn_backlog=65536
net.ipv4.ip_local_port_range=1024 65535
EOF
sysctl -p
echo "ulimit -n 1048576" >> /etc/profile
```

## 3. 单机部署

**适用场景**：开发测试、小型生产（10 万连接以内）

### 配置

```bash
cat > emqx.conf << 'EOF'
listeners.tcp.default {
  bind = "0.0.0.0:1883"
  max_connections = 102400
}
listeners.ws.default {
  bind = "0.0.0.0:8083"
  max_connections = 10240
}
dashboard {
  listeners.http { bind = "0.0.0.0:18083" }
  default_username = "admin"
  default_password = "public"
}
authorization { no_match = allow }
EOF
```

### 启动

```bash
# systemctl（rpm/deb 安装）
sudo systemctl restart emqx

# 二进制
./bin/emqx start
```

### 验证

```bash
# 查看状态
./bin/emqx ctl status
# 预期输出：Node 'emqx@127.0.0.1' is started

# 集群状态
./bin/emqx ctl cluster status
```

### Docker Compose

```yaml
services:
  emqx:
    image: emqx/emqx:5.7.0
    container_name: emqx
    restart: unless-stopped
    ports:
      - 1883:1883
      - 8883:8883
      - 8083:8083
      - 8084:8084
      - 18083:18083
    volumes:
      - emqx-data:/opt/emqx/data
      - ./emqx.conf:/opt/emqx/etc/emqx.conf

volumes:
  emqx-data:
```

## 4. 集群部署（3 节点）

**适用场景**：生产环境，百万级连接，高可用

### 节点规划

| 节点 | 角色 | Hostname | IP |
|------|------|----------|----|
| node1 | Core | emqx-1 | 10.0.0.1 |
| node2 | Core | emqx-2 | 10.0.0.2 |
| node3 | Core | emqx-3 | 10.0.0.3 |

> **角色说明**：
> - **Core**：参与数据复制，所有订阅路由保持一致。建议 ≥ 3 节点。
> - **Replicant**：不参与数据复制，转发请求到 Core。适用于扩展连接容量。
> - 小规模集群使用全 Core 模式即可。

### 配置

```bash
# 每台节点配置相同，seeds 使用 emqx@hostname 格式
cat > emqx.conf << 'EOF'
# === 节点 ===
node {
  name = "emqx"
  role = core
  data_dir = "/opt/emqx/data"
}

# === 集群（static 发现）===
cluster {
  discovery_strategy = static
  static.seeds = ["emqx@emqx-1", "emqx@emqx-2", "emqx@emqx-3"]
}

# === MQTT ===
listeners.tcp.default {
  bind = "0.0.0.0:1883"
  max_connections = 1000000
}
listeners.ssl.default {
  bind = "0.0.0.0:8883"
  max_connections = 500000
}

# === 持久会话（EMQX 5.x 配置方式）===
session {
  persistence {
    enable = true
    backend = built_in_database
  }
}
# 注意：早期版本的 persistent_session 顶层配置已废弃
# 5.x 中持久会话统一在 session.persistence 命名空间下配置

# === 认证 ===
authentication {
  mechanism = password_based
  backend = built_in_database
  user_id_type = username
}
authorization { no_match = deny }

# === 限流 ===
flapping_detect {
  enable = true
  max_count = 15
  window_time = 1m
  ban_time = 5m
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
  console { enable = false }
}

# === Dashboard ===
dashboard {
  listeners.http { bind = "0.0.0.0:18083" }
}
EOF
```

### 启动

```bash
# systemctl（rpm/deb 安装）— 需修改 /etc/emqx/emqx.conf 后重启
sudo systemctl restart emqx

# 二进制 — 每台节点分别启动
./bin/emqx start

# 加入集群（若自动发现失败）
./bin/emqx ctl cluster join emqx@emqx-1
```

### 验证

```bash
./bin/emqx ctl cluster status
# 预期输出：3 个节点均为 Running
# Status: Core nodes: emqx@emqx-1, emqx@emqx-2, emqx@emqx-3
```

### Docker Compose

```yaml
services:
  emqx-1:
    image: emqx/emqx:5.7.0
    container_name: emqx-1
    hostname: emqx-1
    restart: unless-stopped
    ports:
      - 1883:1883
      - 18083:18083
    environment:
      EMQX_CLUSTER__DISCOVERY_STRATEGY: static
      EMQX_CLUSTER__STATIC__SEEDS: "emqx@emqx-1,emqx@emqx-2,emqx@emqx-3"
      EMQX_NODE__ROLE: core
      EMQX_SESSION__PERSISTENCE__ENABLE: "true"
      EMQX_SESSION__PERSISTENCE__BACKEND: built_in_database
    volumes:
      - emqx-1-data:/opt/emqx/data

  emqx-2:
    image: emqx/emqx:5.7.0
    container_name: emqx-2
    hostname: emqx-2
    restart: unless-stopped
    ports:
      - 1884:1883
    environment:
      EMQX_CLUSTER__DISCOVERY_STRATEGY: static
      EMQX_CLUSTER__STATIC__SEEDS: "emqx@emqx-1,emqx@emqx-2,emqx@emqx-3"
      EMQX_NODE__ROLE: core
      EMQX_SESSION__PERSISTENCE__ENABLE: "true"
      EMQX_SESSION__PERSISTENCE__BACKEND: built_in_database
    volumes:
      - emqx-2-data:/opt/emqx/data

  emqx-3:
    image: emqx/emqx:5.7.0
    container_name: emqx-3
    hostname: emqx-3
    restart: unless-stopped
    ports:
      - 1885:1883
    environment:
      EMQX_CLUSTER__DISCOVERY_STRATEGY: static
      EMQX_CLUSTER__STATIC__SEEDS: "emqx@emqx-1,emqx@emqx-2,emqx@emqx-3"
      EMQX_NODE__ROLE: core
      EMQX_SESSION__PERSISTENCE__ENABLE: "true"
      EMQX_SESSION__PERSISTENCE__BACKEND: built_in_database
    volumes:
      - emqx-3-data:/opt/emqx/data

volumes:
  emqx-1-data:
  emqx-2-data:
  emqx-3-data:
```

> ⚠️ **Docker 集群注意事项**：确保 `hostname` 与 seeds 中的 `@` 后部分匹配，Docker 网络内可通过 service name 进行 DNS 解析。`emqx@emqx-1` 中 `emqx` 是 Erlang 节点名，`emqx-1` 是 Docker hostname。

## 5. 运维速查

```bash
# 集群
emqx ctl cluster status
emqx ctl cluster leave

# 连接
emqx ctl clients list
emqx ctl clients show <ClientId>
emqx ctl clients kickout <ClientId>

# 订阅
emqx ctl subscriptions list

# 规则引擎
emqx ctl rules list

# 数据导入/导出
emqx ctl data export /tmp/emqx-backup.tar.gz
emqx ctl data import /tmp/emqx-backup.tar.gz

# Dashboard 访问：http://<ip>:18083  默认 admin/public
# API：http://<ip>:18083/api/v5
# Prometheus：http://<ip>:18083/api/v5/prometheus/stats
```

**关键监控指标**：

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| 连接数 | Dashboard / API `/clients` | > 80% `max_connections` |
| 消息吞吐 | Dashboard | 异常突降 |
| 订阅数 | Dashboard / API | 异常增长 |
| 延迟 P99 | Dashboard / API | > 100ms |

## 6. 常见故障

### 6.1 连接被拒绝

```
# 排查顺序
1. emqx ctl listeners → 查看监听器状态和连接数
2. max_connections 是否耗尽
3. sysctl fs.file-max / ulimit -n 是否足够
4. flapping_detect 是否误封

# 解决：调整 max_connections → 调大 OS 限制 → 调整 flapping_detect 阈值
```

### 6.2 集群脑裂

```
# 检查状态
emqx ctl cluster status
# 部分节点 Split 成两个独立集群

# 排查
1. 节点间网络是否互通：telnet <ip> 4370（Erlang 分布端口）
2. 防火墙是否拦截
3. seeds 配置是否一致

# 解决：修复网络后，在从节点执行 cluster join 重新加入
```

### 6.3 消息丢失

```
# 排查
1. QoS 级别（QoS 0 可能丢，QoS 1/2 不会）
2. Clean Session = false 开启持久会话
3. session.persistence.enable = true
4. 检查客户端订阅是否匹配

# 注意：EMQX 5.x 持久会话需配置 session.persistence，早期版本语法已废弃
```

### 6.4 内存持续增长

```
# 排查
1. Dashboard 查看连接数和内存
2. 检查是否有大量 QoS 2 消息未确认
3. 检查保留消息数量 retainer
4. 检查 flapping_detect 是否有大量封禁

# 解决：限制 QoS 2 使用 → 清理保留消息 → 调整 retainer 配置
```

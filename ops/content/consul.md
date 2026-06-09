# Consul 部署指南

> 版本：1.17.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| 系统 | Linux x86_64 |
| 内存 | 开发 ≥ 512M，生产 ≥ 2G/Server 节点 |
| 端口 | 8500（HTTP）、8600（DNS）、8300（Server）、8301（Serf LAN）、8302（Serf WAN） |

> `bind_addr` **绝对不能配置 `0.0.0.0`**，必须是真实 IP 或网卡接口名。

## 2. 裸机安装（通用）

```bash
wget https://releases.hashicorp.com/consul/1.17.0/consul_1.17.0_linux_amd64.zip
unzip consul_1.17.0_linux_amd64.zip && sudo mv consul /usr/local/bin/
```

## 3. 单机部署

**适用场景**：本地开发测试

### 3.1 配置

```bash
mkdir -p /tmp/consul-dev
```

### 3.2 启动（dev mode）

```bash
consul agent -dev -data-dir=/tmp/consul-dev
```

### 3.3 验证

```bash
consul members
# 预期看到本机节点，Role 为 leader
```

### 3.4 Docker Compose（dev mode）

```yaml
services:
  consul:
    image: hashicorp/consul:1.17
    container_name: consul
    restart: unless-stopped
    ports:
      - "8500:8500"
    command: agent -dev -client=0.0.0.0
```

## 4. 集群部署

**适用场景**：生产环境高可用，多数据中心

### 4.1 节点规划

| 节点 | 角色 | IP | 端口 |
|------|------|-----|------|
| consul-1 | Server | 10.0.0.1 | 8500 |
| consul-2 | Server | 10.0.0.2 | 8500 |
| consul-3 | Server | 10.0.0.3 | 8500 |

### 4.2 配置

```bash
cat > /etc/consul.d/server.hcl << 'EOF'
datacenter = "dc1"
data_dir   = "/data/consul"
log_level  = "WARN"

server           = true
bootstrap_expect = 3

bind_addr   = "10.0.0.1"
client_addr = "0.0.0.0"

ports {
  http = 8500
  dns  = 8600
}

retry_join = ["10.0.0.2", "10.0.0.3"]

ui_config {
  enabled = true
}

connect {
  enabled = true
}

performance {
  raft_multiplier = 1
}
EOF
```

> 每个节点的 `bind_addr` 必须填自身 IP，不可用 `0.0.0.0`。`retry_join` 列表填写其他 Server 节点地址。

### 4.3 启动

```bash
# 每个节点依次
consul agent -config-dir=/etc/consul.d
# 或使用 systemd
consul agent -config-dir=/etc/consul.d &
```

### 4.4 验证

```bash
consul members
# 预期输出 3 个 Server，Status 均为 alive

consul operator raft list-peers
# 预期看到 1 个 leader + 2 个 follower
```

### 4.5 Docker Compose（3 Server 集群）

```yaml
x-consul-conf: &consul-conf
  datacenter = "dc1"
  data_dir   = "/consul/data"
  log_level  = "WARN"
  server           = true
  bootstrap_expect = 3
  client_addr      = "0.0.0.0"
  ui_config { enabled = true }
  connect   { enabled = true }

services:
  consul-1:
    image: hashicorp/consul:1.17
    container_name: consul-1
    hostname: consul-1
    restart: unless-stopped
    ports:
      - "8500:8500"
    volumes:
      - consul-1-data:/consul/data
    command: agent -config-dir=/consul/config
    environment:
      CONSUL_LOCAL_CONFIG: |
        ${CONSUL_LOCAL_CONFIG}
        bind_addr = "{{ GetInterfaceIP \"eth0\" }}"
        retry_join = ["consul-2", "consul-3"]
    networks:
      - consul-net

  consul-2:
    image: hashicorp/consul:1.17
    container_name: consul-2
    hostname: consul-2
    restart: unless-stopped
    volumes:
      - consul-2-data:/consul/data
    command: agent -config-dir=/consul/config
    environment:
      CONSUL_LOCAL_CONFIG: |
        ${CONSUL_LOCAL_CONFIG}
        bind_addr = "{{ GetInterfaceIP \"eth0\" }}"
        retry_join = ["consul-1", "consul-3"]
    networks:
      - consul-net

  consul-3:
    image: hashicorp/consul:1.17
    container_name: consul-3
    hostname: consul-3
    restart: unless-stopped
    volumes:
      - consul-3-data:/consul/data
    command: agent -config-dir=/consul/config
    environment:
      CONSUL_LOCAL_CONFIG: |
        ${CONSUL_LOCAL_CONFIG}
        bind_addr = "{{ GetInterfaceIP \"eth0\" }}"
        retry_join = ["consul-1", "consul-2"]
    networks:
      - consul-net

volumes:
  consul-1-data:
  consul-2-data:
  consul-3-data:

networks:
  consul-net:
    driver: bridge
```

## 5. 运维速查

```bash
# 集群状态
consul members
consul operator raft list-peers

# 服务管理
consul catalog services
consul catalog nodes -detailed

# KV 操作
consul kv put config/db/url "jdbc:mysql://..."
consul kv get config/db/url
consul kv delete config/db/url

# 健康检查
consul health checks -state=critical

# ACL
consul acl bootstrap

# 快照备份
consul snapshot save backup.snap
consul snapshot restore backup.snap

# 查看日志
journalctl -u consul -f

# 指标（Prometheus 格式）
curl http://127.0.0.1:8500/v1/agent/metrics?format=prometheus
```

## 6. 常见故障

**无 Leader**：`consul operator raft list-peers` → 检查 Server 节点间 8300/8301 端口连通性 → 检查 `bind_addr` 是否配置正确（非 0.0.0.0）

**节点无法加入集群**：检查 `retry_join` 中的地址是否可达 → 检查 `bind_addr` 是否为真实 IP → 检查 Gossip 加密密钥是否一致

**服务不可达**：`consul catalog services` → `consul health checks <service>` → DNS 解析 `dig @127.0.0.1 -p 8600 service.service.consul`

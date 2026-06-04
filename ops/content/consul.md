# Consul 部署运维指南

> **定位**：HashiCorp 开源的服务发现与配置工具，多数据中心支持
> **适用场景**：服务发现、KV 配置、健康检查、服务网格（Connect）
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Consul 是 HashiCorp 开源的服务发现和配置管理工具，基于 Raft 协议实现强一致性（CP），支持多数据中心、服务网格（Connect）、KV 存储。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **服务发现** | HTTP/DNS 接口注册和发现服务 |
| **健康检查** | HTTP/TCP/Script/Docker/gRPC 检查 |
| **KV 存储** | 层级 KV，Watch 变更通知 |
| **多数据中心** | 原生支持跨 DC |
| **服务网格** | Connect（Sidecar 代理） |
| **ACL** | 细粒度访问控制 |

### 1.3 适用场景

**最佳适用**：多语言微服务发现、多数据中心、服务网格、KV 配置中心

**不适用**：Java 生态微服务（→ Nacos 更友好）、纯配置中心（→ Nacos/Apollo）、大规模分片存储

---

## 2. 部署

### 2.1 裸机部署

```bash
# 下载
wget https://releases.hashicorp.com/consul/1.17.0/consul_1.17.0_linux_amd64.zip
unzip consul_1.17.0_linux_amd64.zip && sudo mv consul /usr/local/bin/

# 开发模式
consul agent -dev

# Server 模式
consul agent -server -bootstrap-expect=3 -data-dir=/data/consul \
  -bind=10.0.0.1 -client=0.0.0.0 -ui
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name consul \
  -p 8500:8500 \
  -p 8600:8600/udp \
  -v consul-data:/consul/data \
  -v ./conf/consul.hcl:/consul/config/consul.hcl \
  --restart unless-stopped \
  hashicorp/consul:1.17 agent -config-dir=/consul/config
```

### 2.3 Docker Compose 部署（3 Server 集群）

```yaml
# docker-compose.yml
version: '3.8'

services:
  consul-1:
    image: hashicorp/consul:1.17
    container_name: consul-1
    hostname: consul-1
    restart: unless-stopped
    ports:
      - "8500:8500"
      - "8600:8600/udp"
    volumes:
      - consul-1-data:/consul/data
      - ./conf/server.hcl:/consul/config/server.hcl
    command: agent -config-dir=/consul/config
    networks:
      - consul-net

  consul-2:
    image: hashicorp/consul:1.17
    container_name: consul-2
    hostname: consul-2
    restart: unless-stopped
    volumes:
      - consul-2-data:/consul/data
      - ./conf/server.hcl:/consul/config/server.hcl
    command: agent -config-dir=/consul/config
    networks:
      - consul-net

  consul-3:
    image: hashicorp/consul:1.17
    container_name: consul-3
    hostname: consul-3
    restart: unless-stopped
    volumes:
      - consul-3-data:/consul/data
      - ./conf/server.hcl:/consul/config/server.hcl
    command: agent -config-dir=/consul/config
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

### 2.4 生产环境部署要点

**Server 数量**：3 或 5（奇数，Raft 多数派）。Client 无限制。

**安全清单**：ACL 启用、TLS 加密（RPC/Gossip）、Gossip 加密密钥

---

## 3. 配置文件

### 3.2 开发环境配置

```hcl
# conf/dev.hcl
datacenter = "dc1"
data_dir   = "/consul/data"
log_level  = "INFO"

server           = true
bootstrap_expect = 1

addresses {
  http = "0.0.0.0"
}
connect {
  enabled = true
}
```

### 3.3 生产环境配置

```hcl
# conf/server.hcl — 生产 Server 配置

datacenter = "dc1"
data_dir   = "/consul/data"
log_level  = "WARN"

# === Server 模式 ===
server           = true
bootstrap_expect = 3
# 逻辑：bootstrap_expect 必须等于 Server 总数
# 集群启动时等待所有 Server 加入后再选举 Leader

# === 网络 ===
bind_addr = "0.0.0.0"
client_addr = "0.0.0.0"

addresses {
  http = "0.0.0.0"
  dns  = "0.0.0.0"
}

ports {
  http      = 8500
  dns       = 8600
  server    = 8300
  serf_lan  = 8301
  serf_wan  = 8302
}

# === 重试加入 ===
retry_join = ["consul-1", "consul-2", "consul-3"]
# 逻辑：启动时尝试加入这些节点，直到成功

# === 性能 ===
performance {
  raft_multiplier = 1    # Raft 心跳倍数，1=最快，3=更稳定
}

# === ACL ===
acl {
  enabled = true
  default_policy = "deny"
  enable_token_persistence = true
}

# === TLS ===
# verify_incoming = true
# verify_outgoing = true
# verify_server_hostname = true
# ca_file = "/consul/tls/ca.crt"
# cert_file = "/consul/tls/server.crt"
# key_file = "/consul/tls/server.key"

# === Gossip 加密 ===
encrypt = "pUFSJt2Yx5V7HE5J/8pA3Q=="   # 16 字节 Base64 编码密钥
# 生成：consul keygen

# === Connect（服务网格）===
connect {
  enabled = true
}

# === UI ===
ui_config {
  enabled = true
}
```

---

## 4. 调优

### 4.1 Raft 子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `raft_multiplier` | Raft 定时器倍数 | 1（默认） | 1 = 最快选举和心跳；3 = 更稳定但故障检测慢。网络稳定用 1 |
| `bootstrap_expect` | 预期 Server 数 | 3 或 5 | 必须与实际 Server 数一致。启动时等待所有节点 |

### 4.2 性能子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `limits.rpc_max_conns_per_client` | 单客户端最大 RPC 连接 | 100 | 防止单客户端耗尽连接 |
| `limits.read_max_per_second` | 每秒最大读请求 | 0（不限） | 限制读请求防止过载 |

### 4.3 容量规划

| 规模 | Server | Client | CPU/Server | 内存/Server |
|------|--------|--------|------------|-------------|
| 小型 | 3 | 按需 | 2 核 | 2G |
| 中型 | 5 | 10+ | 4 核 | 4G |
| 大型 | 5 | 50+ | 8 核 | 8G |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 集群状态
consul members
consul operator raft list-peers
consul info

# 服务管理
consul catalog services
consul catalog nodes

# KV 操作
consul kv put config/key value
consul kv get config/key
consul kv delete config/key

# 健康检查
consul health checks order-service

# ACL 管理
consul acl token create -description "app-token" -policy-name "read-only"
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **Leader** | `consul operator raft` | 无 Leader |
| **Raft 应用速率** | `consul info → raft.apply` | 异常 |
| **服务健康** | `consul health checks` | critical |
| **KV 操作延迟** | Prometheus | P99 > 100ms |

**Prometheus**：`/v1/agent/metrics?format=prometheus`

### 5.3 备份与恢复

```bash
# KV 快照
consul snapshot save backup.snap

# 恢复
consul snapshot restore backup.snap
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：无 Leader

**排查**：`consul operator raft list-peers` → 检查 Server 连通性

#### 故障 2：服务不可达

**排查**：`consul catalog services` → `consul health checks <service>` → DNS 解析 `dig @localhost -p 8600 service.service.consul`

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `consul members` | 节点列表 |
| `consul operator raft` | Raft 状态 |
| `consul debug` | 综合诊断包 |
| UI | `:8500` |

---

## 7. 参考资料

- [Consul Documentation](https://developer.hashicorp.com/consul/docs)
- [Consul Configuration](https://developer.hashicorp.com/consul/docs/agent/config)
- [Consul ACL](https://developer.hashicorp.com/consul/tutorials/security/access-control-setup)

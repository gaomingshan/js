# Alloy 部署指南

> 版本：v1.3.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| 操作系统 | Linux | K8s 节点或 VM |
| 后端 | Mimir / Loki / Tempo | 数据接收端 |

## 2. 裸机安装（通用）

```bash
# 下载二进制
wget https://github.com/grafana/alloy/releases/download/v1.3.0/alloy-linux-amd64.zip
unzip alloy-linux-amd64.zip
sudo mv alloy-linux-amd64/alloy /usr/local/bin/

# 创建配置目录
sudo mkdir -p /etc/alloy /var/lib/alloy
```

## 3. 单机部署

### 适用场景

开发测试、单机采集

### 配置（Prometheus 接收器 + Loki + Tempo）

```bash
cat > /etc/alloy/config.alloy << 'EOF'
// === 指标采集 → Mimir/Prometheus ===
prometheus.scrape "default" {
  targets = [
    {"__address__" = "localhost:9090"},
  ]
  forward_to = [prometheus.relabel.default.receiver]
  scrape_interval = "15s"
}

prometheus.relabel "default" {
  rule {
    source_labels = ["__name__"]
    regex = ".*"
    action = "keep"
  }
  forward_to = [prometheus.remote_write.mimir.receiver]
}

prometheus.remote_write "mimir" {
  endpoint {
    url = "http://mimir:9009/api/v1/push"
  }
}

// === 日志采集 → Loki ===
loki.source.file "app_logs" {
  targets = [
    {__path__ = "/var/log/app/*.log"},
  ]
  forward_to = [loki.write.default.receiver]
}

loki.write "default" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}

// === 链路采集 → Tempo ===
otelcol.receiver.otlp "default" {
  grpc {
    endpoint = "0.0.0.0:4317"
  }
  http {
    endpoint = "0.0.0.0:4318"
  }
  output {
    traces = [otelcol.exporter.otlp.tempo.input]
  }
}

otelcol.exporter.otlp "tempo" {
  client {
    endpoint = "tempo:4317"
    tls {
      insecure = true
    }
  }
}
EOF
```

### 启动

```bash
alloy run /etc/alloy/config.alloy
```

### 验证

```
访问 http://localhost:12345  Alloy UI
查看组件状态和 Pipeline 流程
```

### Docker Compose

```yaml
services:
  alloy:
    image: grafana/alloy:v1.3.0
    ports: ["12345:12345", "4317:4317", "4318:4318"]
    volumes: ["./conf/config.alloy:/etc/alloy/config.alloy", "/var/log:/var/log:ro"]
    command: [run, /etc/alloy/config.alloy]
```

## 4. 生产部署

### 适用场景

K8s/VM 生产环境，统一采集指标 + 日志 + 链路

### systemd 管理

```bash
cat > /etc/systemd/system/alloy.service << 'EOF'
[Unit]
Description=Grafana Alloy
After=network.target

[Service]
Type=simple
User=alloy
Group=alloy
ExecStart=/usr/local/bin/alloy run /etc/alloy/config.alloy
Restart=always
RestartSec=10
LimitNOFILE=65536
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

```bash
sudo useradd -r -s /bin/false alloy
sudo systemctl daemon-reload
sudo systemctl enable --now alloy
```

### 生产配置（K8s 自动发现 + Prometheus 接收器）

```bash
cat > /etc/alloy/config.alloy << 'EOF'
// === 发现 K8s 服务 ===
discovery.kubernetes "pods" {
  role = "pod"
}

// === 指标采集 → Mimir ===
prometheus.scrape "k8s" {
  targets    = discovery.kubernetes.pods.targets
  forward_to = [prometheus.relabel.k8s.receiver]
  scrape_interval = "15s"
}

prometheus.relabel "k8s" {
  rule {
    source_labels = ["__meta_kubernetes_pod_container_name"]
    target_label  = "container"
  }
  forward_to = [prometheus.remote_write.mimir.receiver]
}

prometheus.remote_write "mimir" {
  endpoint {
    url = "http://mimir:9009/api/v1/push"
  }
}

// === 日志采集 → Loki ===
loki.source.kubernetes "pod_logs" {
  forward_to = [loki.process.logs.receiver]
}

loki.process "logs" {
  forward_to = [loki.write.loki.receiver]
  stage.json {
    expressions = {level = "level", msg = "msg"}
  }
  stage.labels {
    values = {level = null, app = "k8s_app"}
  }
}

loki.write "loki" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}

// === 链路采集 → Tempo ===
otelcol.receiver.otlp "traces" {
  grpc {
    endpoint = "0.0.0.0:4317"
  }
  output {
    traces = [otelcol.exporter.otlp.tempo.input]
  }
}

otelcol.exporter.otlp "tempo" {
  client {
    endpoint = "tempo:4317"
    tls {
      insecure = true
    }
  }
}
EOF
```

### Docker 生产模式

```yaml
services:
  alloy:
    image: grafana/alloy:v1.3.0
    ports: ["12345:12345", "4317:4317", "4318:4318"]
    volumes:
      - "./conf/config.alloy:/etc/alloy/config.alloy"
      - "/var/log:/var/log:ro"
      - "/var/lib/alloy:/var/lib/alloy"
    restart: unless-stopped
    command: [run, /etc/alloy/config.alloy]
    logging:
      driver: journald
```

### 验证

```bash
# 查看 Alloy 服务状态
systemctl status alloy

# Alloy UI
http://<host>:12345

# 查看组件状态
curl http://localhost:12345/api/v0/components
```

## 5. 运维速查

```bash
# 查看 Alloy 日志
journalctl -u alloy -f

# 重载配置（Alloy 支持热重载）
kill -HUP $(pidof alloy)

# 验证配置语法
alloy fmt /etc/alloy/config.alloy

# Alloy UI 调试
http://<host>:12345  →  查看各组件输入输出数据量
```

## 6. 常见故障

**故障 1：Prometheus 接收器未收到数据**

- 检查 `prometheus.scrape` 的 targets 是否可达
- 检查 `forward_to` 链路是否完整
- 查看 Alloy UI 确认 scrape 是否有数据

**故障 2：日志采集权限不足**

- Alloy 容器需挂载宿主机 `/var/log` 目录
- K8s 模式需配置 RBAC（ClusterRole + ServiceAccount）
- 检查 `__path__` 通配符是否匹配

**故障 3：Alloy 占用内存过高**

- 减少 `prometheus.scrape` 的 target 数量
- 增大 `scrape_interval` 到 30s
- 检查 Pipeline 是否有死循环

# Prometheus 部署指南

> 版本：2.54 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|----------|----------|------|
| 单机 | 1 核 / 2G | 2 核 / 4G | 50G SSD |
| 生产 | 4 核 / 8G | 8 核 / 16G | 500G SSD |
| 大型 | 8 核 / 32G | 16 核 / 64G | 1T+ SSD |

---

## 2. 裸机安装（通用）

```bash
# 创建用户
sudo useradd --no-create-home --shell /usr/sbin/nologin prometheus

# 下载
wget https://github.com/prometheus/prometheus/releases/download/v2.54.1/prometheus-2.54.1.linux-amd64.tar.gz
tar xzf prometheus-2.54.1.linux-amd64.tar.gz
sudo mv prometheus-2.54.1.linux-amd64 /opt/prometheus

# 目录结构
sudo mkdir -p /opt/prometheus/{data,conf,targets}
sudo chown -R prometheus:prometheus /opt/prometheus

# systemd 服务
cat > /etc/systemd/system/prometheus.service << 'EOF'
[Unit]
Description=Prometheus
Documentation=https://prometheus.io
After=network.target

[Service]
Type=simple
User=prometheus
ExecStart=/opt/prometheus/prometheus \
  --config.file=/opt/prometheus/conf/prometheus.yml \
  --storage.tsdb.path=/opt/prometheus/data \
  --web.console.templates=/opt/prometheus/consoles \
  --web.console.libraries=/opt/prometheus/console_libraries
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
```

---

## 3. 单机/基础部署

**适用场景**：开发环境、小型项目、个人监控，抓取 Prometheus 自身 + 少量静态 target。

### 配置文件（完整可复制）

```bash
cat > /opt/prometheus/conf/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF
```

### 启动

```bash
sudo systemctl enable --now prometheus
```

### 验证

```bash
# 页面
curl http://localhost:9090/-/ready
curl http://localhost:9090/api/v1/targets | jq .

# 查询
curl 'http://localhost:9090/api/v1/query?query=up'
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus:v2.54.1
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./conf/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.enable-lifecycle'

volumes:
  prometheus-data:
```

---

## 4. 生产/高可用部署

**适用场景**：生产环境监控，多 target 采集 + 告警规则 + Alertmanager + 远程写入。

### 配置文件

```bash
cat > /opt/prometheus/conf/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s
  external_labels:
    cluster: prod
    replica: prom-1

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    file_sd_configs:
      - files:
        - targets/node/*.json
        refresh_interval: 5m

  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']
        labels:
          env: prod

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka-exporter:9308']

remote_write:
  - url: http://mimir:9009/api/v1/push
EOF
```

```bash
cat > /opt/prometheus/conf/alert_rules.yml << 'EOF'
groups:
  - name: host
    rules:
      - alert: HighCpuUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"} * 100) < 15
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"

  - name: mysql
    rules:
      - alert: MySQLDown
        expr: mysql_up == 0
        for: 1m
        labels:
          severity: critical

  - name: redis
    rules:
      - alert: RedisMemoryHigh
        expr: (redis_memory_used_bytes / redis_memory_max_bytes * 100 > 80) and (redis_memory_max_bytes > 0)
        for: 5m
        labels:
          severity: warning
EOF
```

```bash
cat > /opt/prometheus/conf/alertmanager.yml << 'EOF'
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      repeat_interval: 1h

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://webhook-receiver:8080/alert'

  - name: 'critical'
    webhook_configs:
      - url: 'http://webhook-receiver:8080/critical'
EOF
```

### 启动/验证

```bash
# 热加载（需 --web.enable-lifecycle）
curl -X POST http://localhost:9090/-/reload

# 查看目标
curl http://localhost:9090/api/v1/targets | jq .

# 查看告警
curl http://localhost:9090/api/v1/alerts | jq .
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus:v2.54.1
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./conf/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./conf/alert_rules.yml:/etc/prometheus/alert_rules.yml
      - ./conf/alertmanager.yml:/etc/prometheus/alertmanager.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    networks:
      - monitor-net

  alertmanager:
    image: prom/alertmanager:v0.27.0
    container_name: alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./conf/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    networks:
      - monitor-net

  pushgateway:
    image: prom/pushgateway:v1.8.0
    container_name: pushgateway
    restart: unless-stopped
    ports:
      - "9091:9091"
    networks:
      - monitor-net

volumes:
  prometheus-data:

networks:
  monitor-net:
    driver: bridge
```

---

## 5. 运维速查

```bash
# 热加载配置
curl -X POST http://localhost:9090/-/reload

# 查看目标
curl http://localhost:9090/api/v1/targets

# 查看告警
curl http://localhost:9090/api/v1/alerts

# PromQL 查询
curl 'http://localhost:9090/api/v1/query?query=up'

# 创建快照备份
curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot

# 重新打开 TSDB（清理内存）
curl -X POST http://localhost:9090/api/v1/admin/tsdb/clean_tombstones
```

| 参数 | 作用 | 推荐值 | 说明 |
|------|------|--------|------|
| `--storage.tsdb.retention.time` | 数据保留时间 | 30d | 本地存储上限 |
| `--storage.tsdb.retention.size` | 数据保留大小 | 磁盘 80% | 大小优先于时间 |
| `--query.max-samples` | 单查询最大样本 | 50000000 | 防 OOM |
| `--query.timeout` | 查询超时 | 2m | 防慢查询 |
| `--storage.tsdb.wal-compression` | WAL 压缩 | true | 减少磁盘 |

### 6. 常见故障

**Target 采集失败**
排查：`/targets` 页面 → last_error → 网络连通 → `/metrics` 端点

**OOM**
排查：增大内存 → 减少 Target → 增大 scrape_interval → 检查重查询

**WAL 损坏**
排查：`promtool tsdb check --extend <data_dir>` → 删除 WAL 目录恢复

---

## 参考资料

- [Prometheus Docs](https://prometheus.io/docs/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)

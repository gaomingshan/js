# Prometheus 部署运维指南

> **定位**：CNCF 开源监控与告警系统，云原生监控事实标准
> **适用场景**：指标采集与存储、告警、服务发现、PromQL 查询
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Prometheus 是开源的监控与告警系统，基于拉取（Pull）模型采集指标，时序数据库存储，PromQL 查询语言，支持服务发现、告警规则、远程写入/读取。

### 1.2 核心架构

```
Target ← scrape ← Prometheus → TSDB → PromQL → Grafana
                                    ↓
                              Alertmanager → 通知
```

| 组件 | 职责 |
|------|------|
| **Prometheus Server** | 采集、存储、查询 |
| **Exporter** | 暴露 `/metrics` 端点 |
| **Alertmanager** | 告警路由、分组、抑制、静默 |
| **Pushgateway** | 短生命周期任务推送指标 |
| **Grafana** | 可视化仪表盘 |

### 1.3 适用场景

**最佳适用**：云原生监控、指标采集与告警、K8s 监控、中间件监控

**不适用**：日志（→ Loki）、链路追踪（→ Tempo）、长期存储（→ Mimir/Thanos）

---

## 2. 部署

### 2.1 Docker 部署

```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v ./conf/prometheus.yml:/etc/prometheus/prometheus.yml \
  -v ./conf/alert_rules.yml:/etc/prometheus/alert_rules.yml \
  -v prometheus-data:/prometheus \
  --restart unless-stopped \
  prom/prometheus:v2.54.1
```

### 2.2 Docker Compose 部署（Prometheus + Alertmanager + Pushgateway）

```yaml
# docker-compose.yml
version: '3.8'

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

  grafana:
    image: grafana/grafana:11.2.0
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: Grafana!Pass
    volumes:
      - grafana-data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - monitor-net

volumes:
  prometheus-data:
  grafana-data:

networks:
  monitor-net:
    driver: bridge
```

---

## 3. 配置文件

### 3.2 开发环境配置

```yaml
# prometheus.yml — 开发环境
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

### 3.3 生产环境配置

```yaml
# prometheus.yml — 生产环境

global:
  scrape_interval: 15s             # 默认采集间隔
  evaluation_interval: 15s         # 规则评估间隔
  scrape_timeout: 10s              # 采集超时
  external_labels:
    cluster: prod
    replica: prom-1
  # 逻辑：external_labels 用于联邦和远程写入区分来源

# === 告警管理器 ===
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# === 告警规则 ===
rule_files:
  - "alert_rules.yml"

# === 采集配置 ===
scrape_configs:
  # Prometheus 自身
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter（主机指标）
  - job_name: 'node'
    file_sd_configs:
      - files:
        - targets/node/*.json
        refresh_interval: 5m
    # 逻辑：file_sd_configs 文件服务发现，动态添加目标
    # 比 static_configs 更灵活，无需重启

  # MySQL Exporter
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']
        labels:
          env: prod

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Kafka Exporter
  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka-exporter:9308']

  # Nacos 服务发现示例
  # - job_name: 'nacos'
  #   nacos_sd_configs:
  #     - server: nacos:8848
  #       namespace: prod

# === 远程写入（长期存储）===
# remote_write:
#   - url: http://mimir:9009/api/v1/push
#     逻辑：Prometheus 本地存储有限（30天）
#     远程写入到 Mimir/Thanos 实现长期存储

# === 远程读取 ===
# remote_read:
#   - url: http://mimir:9009/api/v1/read
```

**告警规则** `alert_rules.yml`：

```yaml
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
          description: "CPU usage is {{ $value }}%"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes * 100) < 15
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
        expr: redis_memory_used_bytes / redis_memory_max_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
```

**Alertmanager 配置** `alertmanager.yml`：

```yaml
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
    # 钉钉/飞书/企微/邮件/PagerDuty
    webhook_configs:
      - url: 'http://webhook-receiver:8080/critical'
```

---

## 4. 调优

### 4.1 存储子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `--storage.tsdb.retention.time` | 数据保留时间 | 30d | 本地存储保留时间。长期存储用远程写入 |
| `--storage.tsdb.retention.size` | 数据保留大小 | 磁盘 80% | 大小限制优先于时间限制 |
| `scrape_interval` | 采集间隔 | 15s | 间隔越短精度越高但存储越大。15s 是性价比最优 |

### 4.2 性能子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `--query.max-samples` | 单查询最大样本数 | 50000000 | 防止重查询 OOM |
| `--query.timeout` | 查询超时 | 2m | 防止慢查询占资源 |
| `--storage.tsdb.wal-compression` | WAL 压缩 | true | 减少 WAL 磁盘占用 |

### 4.3 容量规划

| 规模 | Target 数 | 采集间隔 | 内存 | 磁盘/月 | CPU |
|------|----------|----------|------|---------|------|
| 小型 | < 500 | 15s | 4G | 50G | 2 核 |
| 中型 | 500-5000 | 15s | 16G | 200G | 4 核 |
| 大型 | 5000+ | 15s | 32G+ | 1T+ | 8 核+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# 热加载配置（需 --web.enable-lifecycle）
curl -X POST http://localhost:9090/-/reload

# 查看目标状态
curl http://localhost:9090/api/v1/targets

# 查看告警
curl http://localhost:9090/api/v1/alerts

# PromQL 查询
curl 'http://localhost:9090/api/v1/query?query=up'
```

### 5.2 监控指标

| 指标 | PromQL | 告警阈值 |
|------|--------|----------|
| **采集失败** | `up == 0` | > 0 |
| **采集延迟** | `scrape_duration_seconds > 10` | > 10s |
| **TSDB WAL 滞后** | `prometheus_tsdb_wal_corruptions_total` | > 0 |
| **内存使用** | `process_resident_memory_bytes` | 接近上限 |

### 5.3 备份与恢复

```bash
# 快照（需 --web.enable-admin-api）
curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot

# 恢复：将快照目录拷贝到 data 目录
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：Target 采集失败

**排查**：`/targets` 页面 → 检查 last_error → 检查网络连通 → 检查 `/metrics` 端点

#### 故障 2：OOM

**排查**：增大内存 → 减少 Target 数 → 增大采集间隔 → 检查重查询

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `/targets` | 目标状态 |
| `/alerts` | 告警状态 |
| `/config` | 当前配置 |
| `/metrics` | 自身指标 |

---

## 7. 参考资料

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Prometheus Configuration](https://prometheus.io/docs/prometheus/latest/configuration/)
- [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/)

# Loki 部署指南

> 版本：3.1 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|----------|----------|------|
| 单机 | 2 核 / 4G | 4 核 / 8G | 200G SSD |
| 生产 | 8 核 / 16G | 16 核 / 32G | 500G SSD + 对象存储 |

---

## 2. 裸机安装（通用）

```bash
# 创建用户
sudo useradd --no-create-home --shell /usr/sbin/nologin loki

# 下载
wget https://github.com/grafana/loki/releases/download/v3.1.0/loki-linux-amd64.zip
unzip loki-linux-amd64.zip
sudo mv loki-linux-amd64 /opt/loki

# 目录结构
sudo mkdir -p /opt/loki/{data,conf,rules}
sudo chown -R loki:loki /opt/loki

# systemd 服务
cat > /etc/systemd/system/loki.service << 'EOF'
[Unit]
Description=Loki
Documentation=https://grafana.com/docs/loki/
After=network.target

[Service]
Type=simple
User=loki
ExecStart=/opt/loki/loki-linux-amd64 \
  -config.file=/opt/loki/conf/loki.yaml
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
```

---

## 3. 单机/基础部署

**适用场景**：开发环境、小规模日志，Single Binary all-in-one 模式 + 本地文件系统存储。

**注意**：单实例下 `replication_factor` 必须设为 `1`，否则日志写入会因副本不足报错。

### 配置文件（完整可复制）

```bash
cat > /opt/loki/conf/loki.yaml << 'EOF'
auth_enabled: false
server:
  http_listen_port: 3100
  log_level: info

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: loki_index_
        period: 24h

storage_config:
  filesystem:
    directory: /loki/storage
EOF
```

### 启动

```bash
sudo systemctl enable --now loki
```

### 验证

```bash
# 就绪检查
curl http://localhost:3100/ready

# 查询标签
curl http://localhost:3100/loki/api/v1/labels

# 写入测试日志
curl -X POST http://localhost:3100/loki/api/v1/push \
  -H "Content-Type: application/json" \
  -d '{"streams": [{"stream": {"test": "hello"}, "values": [["'$(date +%s%N)'", "hello world"]]}]}'
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  loki:
    image: grafana/loki:3.1.0
    container_name: loki
    restart: unless-stopped
    ports:
      - "3100:3100"
    volumes:
      - ./conf/loki.yaml:/etc/loki/config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/config.yaml

  alloy:
    image: grafana/alloy:v1.3.0
    container_name: alloy
    restart: unless-stopped
    volumes:
      - ./conf/alloy.alloy:/etc/alloy/config.alloy
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: run /etc/alloy/config.alloy
    depends_on:
      - loki

  grafana:
    image: grafana/grafana:11.2.0
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: Grafana!Pass
    depends_on:
      - loki

volumes:
  loki-data:
```

---

## 4. 生产/高可用部署

**适用场景**：生产环境日志聚合，微服务模式（读写分离）+ S3/MinIO 对象存储。

### 配置文件

```bash
cat > /opt/loki/conf/loki.yaml << 'EOF'
auth_enabled: true
server:
  http_listen_port: 3100
  grpc_listen_port: 9095
  log_level: warn

common:
  path_prefix: /loki
  replication_factor: 3  # 分布式多副本，保证可用性

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: s3
      schema: v13
      index:
        prefix: loki_index_
        period: 24h

storage_config:
  tsdb_shipper:
    active_index_directory: /loki/tsdb-index
    cache_location: /loki/tsdb-cache
  aws:
    s3: s3://<ACCESS_KEY>:<SECRET_KEY>@minio:9000/loki
    s3forcepathstyle: true
    region: us-east-1

ingester:
  max_chunk_age: 2h
  chunk_idle_period: 30m
  chunk_target_size: 1572864

limits_config:
  ingestion_rate_mb: 20
  ingestion_burst_size_mb: 30
  max_query_length: 721h
  max_query_parallelism: 32
  max_entries_limit_per_query: 10000
  retention_period: 744h  # 31 天

compactor:
  working_directory: /loki/compactor
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
  delete_request_cancel_period: 5m

ruler:
  storage:
    type: local
    local:
      directory: /loki/rules
  rule_path: /loki/ruler
  alertmanager_url: http://alertmanager:9093
EOF
```

Alloy 采集配置：

```bash
cat > /opt/loki/conf/alloy.alloy << 'EOF'
loki.source.file "logs" {
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
EOF
```

### 启动/验证

```bash
# 启动（微服务角色通过 target 参数区分）
# Distributor
/opt/loki/loki-linux-amd64 -config.file=/opt/loki/conf/loki.yaml -target=distributor

# Ingester
/opt/loki/loki-linux-amd64 -config.file=/opt/loki/conf/loki.yaml -target=ingester

# Querier
/opt/loki/loki-linux-amd64 -config.file=/opt/loki/conf/loki.yaml -target=querier

# 验证
curl http://localhost:3100/ready
curl http://localhost:3100/loki/api/v1/labels
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio:latest
    container_name: minio
    restart: unless-stopped
    ports:
      - "9000:9000"
    environment:
      MINIO_ROOT_USER: loki
      MINIO_ROOT_PASSWORD: lokipass123
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data

  loki-distributor:
    image: grafana/loki:3.1.0
    container_name: loki-distributor
    restart: unless-stopped
    command: -config.file=/etc/loki/config.yaml -target=distributor
    ports:
      - "3100:3100"
    volumes:
      - ./conf/loki.yaml:/etc/loki/config.yaml
    depends_on:
      - minio

  loki-ingester:
    image: grafana/loki:3.1.0
    container_name: loki-ingester
    restart: unless-stopped
    command: -config.file=/etc/loki/config.yaml -target=ingester
    volumes:
      - ./conf/loki.yaml:/etc/loki/config.yaml
      - ingester-data:/loki
    depends_on:
      - minio

  loki-querier:
    image: grafana/loki:3.1.0
    container_name: loki-querier
    restart: unless-stopped
    command: -config.file=/etc/loki/config.yaml -target=querier
    ports:
      - "3101:3100"
    volumes:
      - ./conf/loki.yaml:/etc/loki/config.yaml
    depends_on:
      - minio

  alloy:
    image: grafana/alloy:v1.3.0
    container_name: alloy
    restart: unless-stopped
    volumes:
      - ./conf/alloy.alloy:/etc/alloy/config.alloy
      - /var/log:/var/log:ro
    command: run /etc/alloy/config.alloy
    depends_on:
      - loki-distributor

volumes:
  minio-data:
  ingester-data:
```

---

## 5. 运维速查

```bash
# LogQL 查询
{app="order-service"} |= "error" | json

# 错误率统计
sum(count_over_time({app="order-service"} |= "error" [5m]))

# 查看运行状态
curl http://localhost:3100/ready
curl http://localhost:3100/metrics | grep loki_ingester

# 查看配置
curl http://localhost:3100/config
```

| 参数 | 作用 | 推荐值 | 说明 |
|------|------|--------|------|
| `replication_factor` | 副本因子 | 单机 1 / 生产 3 | 单实例必须为 1 |
| `ingestion_rate_mb` | 写入速率限制 | 20 MB/s | 防日志风暴 |
| `max_chunk_age` | Chunk 最大年龄 | 2h | 越大压缩比越高 |
| `retention_period` | 日志保留 | 744h (31d) | 按合规要求设置 |
| 对象存储 | 日志后端 | S3 / MinIO | 成本比本地低 10 倍 |

### 6. 常见故障

**写入限流**
排查：检查 `ingestion_rate_mb` → 增大限制 → 优化日志量

**查询慢**
排查：缩小时间范围 → 增加标签过滤 → 使用 `|=` 而非 `|~` 正则

**单实例副本不足**
排查：检查 `replication_factor` → 单机必须设为 `1`

**Ingester OOM**
排查：减小 `max_chunk_age` → 减小 `chunk_target_size` → 增加 Ingester 实例

---

## 参考资料

- [Loki Docs](https://grafana.com/docs/loki/latest/)
- [LogQL](https://grafana.com/docs/loki/latest/query/)
- [Alloy](https://grafana.com/docs/alloy/latest/)

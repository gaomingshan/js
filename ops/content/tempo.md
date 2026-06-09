# Tempo 部署指南

> 版本：2.5.0 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| 存储 | 本地 / S3 / MinIO | 后端存储 |
| Grafana | 10+ | Trace 查询 UI（可选） |
| OpenTelemetry Collector | 0.90+ | Trace 采集上送（可选） |

## 2. 裸机安装（通用）

```bash
# 下载二进制
wget https://github.com/grafana/tempo/releases/download/v2.5.0/tempo_2.5.0_Linux_x86_64.tar.gz
tar -xzf tempo_2.5.0_Linux_x86_64.tar.gz
sudo mv tempo /usr/local/bin/

# 创建数据目录
sudo mkdir -p /var/tempo/{traces,wal,blocks}
```

## 3. 单机部署

### 适用场景

开发测试、小规模 Trace 采集（< 1M trace/天）

### 配置

```bash
cat > /etc/tempo.yaml << 'EOF'
server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: "0.0.0.0:4317"
        http:
          endpoint: "0.0.0.0:4318"

ingester:
  max_block_duration: 30m

storage:
  trace:
    backend: local
    local:
      path: /var/tempo/traces
    wal:
      path: /var/tempo/wal

metrics_generator:
  registry:
    external_labels:
      source: tempo
  storage:
    path: /var/tempo/generator/wal
    remote_write:
      - url: http://localhost:9090/api/v1/write
EOF
```

### 启动

```bash
tempo -config.file=/etc/tempo.yaml
```

### 验证

```
curl http://localhost:3200/ready
# 返回 "ready"
```

### Docker Compose

```yaml
services:
  tempo:
    image: grafana/tempo:2.5.0
    ports: ["3200:3200", "4317:4317", "4318:4318"]
    volumes: ["./conf/tempo.yaml:/etc/tempo/config.yaml", "tempo-data:/var/tempo"]
    command: [-config.file=/etc/tempo/config.yaml]

  grafana:
    image: grafana/grafana:11.2.0
    ports: ["3000:3000"]
    environment: {GF_SECURITY_ADMIN_PASSWORD: Grafana!Pass}

volumes: {tempo-data:}
```

## 4. 集群部署（微服务模式）

### 适用场景

生产环境，大规模 Trace 采集（1M+ trace/天）

### 节点规划

| 组件 | 实例数 | 说明 |
|------|--------|------|
| Distributor | 2 | 接收 Trace，负载均衡 |
| Ingester | 2 | 写入 Block |
| Querier | 2 | 查询服务 |
| Compactor | 1 | Block 合并 + 过期删除 |
| Metrics Generator | 1 | Trace → 指标（可选） |

后端存储：S3 / MinIO 对象存储

### 配置

```yaml
# tempo.yaml — 微服务模式
server:
  http_listen_port: 3200
  log_level: warn

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: "0.0.0.0:4317"
          max_recv_msg_size_mib: 16
        http:
          endpoint: "0.0.0.0:4318"

ingester:
  max_block_duration: 30m

storage:
  trace:
    backend: s3
    s3:
      endpoint: minio:9000
      bucket: tempo-traces
      access_key: minioadmin
      secret_key: minioadmin
    wal:
      path: /var/tempo/wal

compactor:
  compaction:
    block_retention: 720h

metrics_generator:
  registry:
    external_labels:
      source: tempo
      cluster: prod
  storage:
    path: /var/tempo/generator/wal
    remote_write:
      - url: http://mimir:9009/api/v1/push

querier:
  frontend_worker:
    frontend_address: tempo-query-frontend:9095
```

> **`frontend_worker.frontend_address`**：微服务模式下 Querier 需指向 Query Frontend。单机模式此项可注释。

### 启动

```bash
# 每个组件指定 target
tempo -config.file=/etc/tempo.yaml -target=distributor
tempo -config.file=/etc/tempo.yaml -target=ingester
tempo -config.file=/etc/tempo.yaml -target=querier
tempo -config.file=/etc/tempo.yaml -target=compactor
tempo -config.file=/etc/tempo.yaml -target=metrics-generator
```

### 验证

```bash
# Distributor 接收端
curl http://<distributor>:3200/ready

# 查询 Trace
curl -H "Accept: application/json" "http://<querier>:3200/api/search?q={resource.service.name=\"order-service\"}"
```

### Docker Compose

```yaml
services:
  tempo-distributor:
    image: grafana/tempo:2.5.0
    ports: ["3200:3200", "4317:4317", "4318:4318"]
    volumes: ["./conf/tempo.yaml:/etc/tempo/config.yaml"]
    command: [-config.file=/etc/tempo/config.yaml, -target=distributor]
    depends_on: [minio]

  tempo-ingester:
    image: grafana/tempo:2.5.0
    volumes: ["./conf/tempo.yaml:/etc/tempo/config.yaml", "tempo-wal:/var/tempo"]
    command: [-config.file=/etc/tempo/config.yaml, -target=ingester]
    depends_on: [minio]

  tempo-querier:
    image: grafana/tempo:2.5.0
    ports: ["3201:3200"]
    volumes: ["./conf/tempo.yaml:/etc/tempo/config.yaml"]
    command: [-config.file=/etc/tempo/config.yaml, -target=querier]
    depends_on: [minio]

  tempo-compactor:
    image: grafana/tempo:2.5.0
    volumes: ["./conf/tempo.yaml:/etc/tempo/config.yaml"]
    command: [-config.file=/etc/tempo/config.yaml, -target=compactor]
    depends_on: [minio]

  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes: ["minio-data:/data"]

  grafana:
    image: grafana/grafana:11.2.0
    ports: ["3000:3000"]
    environment: {GF_SECURITY_ADMIN_PASSWORD: Grafana!Pass}

volumes: {tempo-wal:, minio-data:}
```

### Grafana 集成

Grafana 中添加 Tempo 数据源：

```
URL: http://tempo-querier:3200
```


## 5. 运维速查

```bash
# 健康检查
curl http://localhost:3200/ready

# TraceQL 查询（通过 Grafana Explore）
{resource.service.name="order-service" && span.http.status_code=500}

# 查看当前 Block 状态
curl http://localhost:3200/status/ingester

# 查看存储桶信息（MinIO 控制台）
# http://localhost:9001  admin/minioadmin

# 调整采样率（在 OTel Collector 端配置）
```

## 6. 常见故障

**故障 1：Trace 丢失**

- 检查 Distributor 是否接收数据（`/status/ingester` 端点）
- 检查采样率配置（OTel Collector `samplers`）
- 检查写入限流（`ingester.max_block_duration` 过长）

**故障 2：查询慢**

- 缩小查询时间范围
- 使用 TraceID 直接查询（比 TraceQL 搜索更快）
- 检查存储 IO 压力和 Memcached 缓存命中率

**故障 3：微服务模式下 Querier 报错 "connection refused"**

- 检查 `frontend_worker.frontend_address` 是否指向 Query Frontend
- 确认 Query Frontend 服务已启动且端口正确

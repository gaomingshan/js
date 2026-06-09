# Envoy 部署指南

> 版本：1.30 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| 系统 | Linux x86_64 |
| 端口 | 10000（代理入口）、9901（Admin） |
| 内存 | ≥ 256M |

> Admin 端口必须绑定 `127.0.0.1`，禁止远程访问。

## 2. 裸机安装（通用）

```bash
# Docker 方式（推荐）
docker pull envoyproxy/envoy:v1.30-latest

# 二进制方式
wget https://github.com/envoyproxy/envoy/releases/download/v1.30.0/envoy-1.30.0-linux-x86_64
chmod +x envoy-1.30.0-linux-x86_64 && sudo mv envoy-1.30.0-linux-x86_64 /usr/local/bin/envoy
```

## 3. 单机部署（静态配置）

**适用场景**：开发测试、简单代理、固定后端

### 3.1 配置

```bash
cat > envoy.yaml << 'EOF'
static_resources:
  listeners:
    - name: main_listener
      address:
        socket_address:
          address: 0.0.0.0
          port_value: 10000
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: ingress_http
                codec_type: AUTO
                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: backend
                      domains: ["*"]
                      routes:
                        - match: { prefix: "/api/" }
                          route: { cluster: app_cluster }
                http_filters:
                  - name: envoy.filters.http.router

  clusters:
    - name: app_cluster
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      load_assignment:
        cluster_name: app_cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address: { address: app-1, port_value: 8080 }
              - endpoint:
                  address:
                    socket_address: { address: app-2, port_value: 8080 }

admin:
  address:
    socket_address:
      address: 127.0.0.1
      port_value: 9901
EOF
```

### 3.2 启动

```bash
envoy -c envoy.yaml
```

### 3.3 验证

```bash
curl -s http://127.0.0.1:9901/server_info | jq
# 预期返回 Envoy 版本和状态信息

curl -s http://127.0.0.1:9901/stats | grep cluster.app_cluster.upstream_rq_total

curl -s http://127.0.0.1:10000/api/health -I
```

### 3.4 Docker Compose

```yaml
services:
  envoy:
    image: envoyproxy/envoy:v1.30-latest
    container_name: envoy
    restart: unless-stopped
    ports:
      - "10000:10000"
      - "127.0.0.1:9901:9901"
    volumes:
      - ./envoy.yaml:/etc/envoy/envoy.yaml
    networks:
      - envoy-net

  app-1:
    image: nginxdemos/hello
    container_name: app-1
    networks:
      - envoy-net

  app-2:
    image: nginxdemos/hello
    container_name: app-2
    networks:
      - envoy-net

networks:
  envoy-net:
    driver: bridge
```

## 4. 集群部署（xDS 动态配置）

**适用场景**：生产环境，控制面动态推送配置

### 4.1 节点规划

| 节点 | 角色 | IP | 端口 |
|------|------|-----|------|
| envoy | 数据面 | 10.0.0.1 | 10000 |
| control-plane | 控制面（xDS） | 10.0.0.10 | 15010 |

### 4.2 配置（xDS 动态）

```bash
cat > envoy.yaml << 'EOF'
dynamic_resources:
  lds_config:
    api_config_source:
      api_type: GRPC
      transport_api_version: V3
      grpc_services:
        - envoy_grpc:
            cluster_name: xds_cluster
  cds_config:
    api_config_source:
      api_type: GRPC
      transport_api_version: V3
      grpc_services:
        - envoy_grpc:
            cluster_name: xds_cluster

static_resources:
  clusters:
    - name: xds_cluster
      type: STRICT_DNS
      typed_extension_protocol_options:
        envoy.extensions.upstreams.http.v3.HttpProtocolOptions:
          "@type": type.googleapis.com/envoy.extensions.upstreams.http.v3.HttpProtocolOptions
          explicit_http_config:
            http2_protocol_options: {}
      load_assignment:
        cluster_name: xds_cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: control-plane
                      port_value: 15010

admin:
  address:
    socket_address:
      address: 127.0.0.1
      port_value: 9901
EOF
```

### 4.3 启动

```bash
envoy -c envoy.yaml
```

### 4.4 验证

```bash
curl -s http://127.0.0.1:9901/config_dump | jq '.configs[0].lds_config'
# 预期显示从控制面获取的动态 Listener 配置

curl -s http://127.0.0.1:9901/clusters | grep health_flags

# 热重启验证
envoy --hot-restart-version
# 预期输出类似：frozen epoch 1, live epoch 2
```

### 4.5 Docker Compose（xDS 模式）

```yaml
services:
  envoy:
    image: envoyproxy/envoy:v1.30-latest
    container_name: envoy
    restart: unless-stopped
    ports:
      - "10000:10000"
      - "127.0.0.1:9901:9901"
    volumes:
      - ./envoy-xds.yaml:/etc/envoy/envoy.yaml
    networks:
      - envoy-net

networks:
  envoy-net:
    driver: bridge
```

## 5. 运维速查

```bash
# Admin API
curl http://127.0.0.1:9901/server_info   # 服务器信息
curl http://127.0.0.1:9901/stats          # 统计信息
curl http://127.0.0.1:9901/clusters       # Cluster 健康状态
curl http://127.0.0.1:9901/listeners      # Listener 列表
curl http://127.0.0.1:9901/config_dump    # 完整配置导出
curl http://127.0.0.1:9901/runtime        # 运行时配置

# 热重启（零丢连接）
envoy --hot-restart-version               # 查看热重启版本
kill -SIGUSR1 $(pidof envoy)             # 触发热重启

# Prometheus 指标
curl http://127.0.0.1:9901/stats/prometheus

# 配置备份
curl http://127.0.0.1:9901/config_dump > envoy-config-backup.json

# 日志
# 日志默认输出到 stderr，可通过 --log-level 控制
envoy -c envoy.yaml --log-level warning
```

## 6. 常见故障

**503 Upstream Unavailable**：检查 `/clusters` 查看后端健康状态 → 检查异常检测配置 → 检查后端服务是否正常运行

**配置不更新**：检查 xDS 控制面连接（`/config_dump` 查看 LDS/CDS 版本）→ 检查控制面日志 → 检查 gRPC 连接是否断开

**热重启失败**：`envoy --hot-restart-version` 检查版本 → 确认共享内存目录 `/dev/shm/envoy_*` 可访问 → 检查是否重复启动同配置实例

**Admin 端口暴露**：确认配置中 admin 绑定 `127.0.0.1` 而非 `0.0.0.0`，生产环境禁用远程 Admin 访问

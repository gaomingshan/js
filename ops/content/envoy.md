# Envoy 部署运维指南

> **定位**：CNCF 开源的高性能 L4/L7 代理，服务网格核心数据面
> **适用场景**：服务网格 Sidecar、API 网关、L4/L7 负载均衡、gRPC 代理
> **难度级别**：⭐⭐⭐⭐ 较高

---

## 1. 概述

### 1.1 是什么

Envoy 是 CNCF 开源的高性能 L4/L7 代理，C++ 实现，以 xDS 动态配置 API 著称，是 Istio 服务网格的数据面代理。

### 1.2 核心架构

```
Client → Listener (入站) → Filter Chain (过滤器) → Route → Cluster (后端) → Endpoint
```

| 概念 | 说明 |
|------|------|
| **Listener** | 入站监听器，定义协议和端口 |
| **Filter Chain** | 过滤器链（HTTP/TCP/Rate Limit/Auth） |
| **Route** | 路由规则，匹配请求到 Cluster |
| **Cluster** | 后端服务集群，含负载均衡策略 |
| **Endpoint** | 后端实例地址 |
| **xDS** | 动态配置 API（LDS/RDS/CDS/EDS） |

### 1.3 适用场景

**最佳适用**：服务网格 Sidecar（Istio）、API 网关、gRPC 代理、L4/L7 负载均衡

**不适用**：简单反向代理（→ Nginx）、动态路由网关（→ APISIX）、静态资源服务（→ Nginx）

---

## 2. 部署

### 2.1 Docker 部署

```bash
docker run -d \
  --name envoy \
  -p 10000:10000 \
  -p 9901:9901 \
  -v ./conf/envoy.yaml:/etc/envoy/envoy.yaml \
  --restart unless-stopped \
  envoyproxy/envoy:v1.30-latest
```

### 2.2 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  envoy:
    image: envoyproxy/envoy:v1.30-latest
    container_name: envoy
    restart: unless-stopped
    ports:
      - "10000:10000"
      - "9901:9901"
    volumes:
      - ./conf/envoy.yaml:/etc/envoy/envoy.yaml
    networks:
      - envoy-net

  app-1:
    image: myapp:latest
    container_name: app-1
    networks:
      - envoy-net

  app-2:
    image: myapp:latest
    container_name: app-2
    networks:
      - envoy-net

networks:
  envoy-net:
    driver: bridge
```

### 2.3 生产环境部署要点

**部署模式**：

| 模式 | 架构 | 适用 |
|------|------|------|
| **Sidecar** | 每服务一个 Envoy | Istio 服务网格 |
| **Gateway** | 独立 Envoy 集群 | API 网关 |
| **Ingress** | K8s Ingress Gateway | K8s 入口 |

**xDS 动态配置**：生产推荐 xDS（控制面推送配置），而非静态 YAML

---

## 3. 配置文件

### 3.2 开发环境配置（静态）

```yaml
# conf/envoy.yaml — 开发环境（静态配置）
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
                        - match:
                            prefix: "/api/"
                          route:
                            cluster: app_cluster
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
                    socket_address:
                      address: app-1
                      port_value: 8080
              - endpoint:
                  address:
                    socket_address:
                      address: app-2
                      port_value: 8080
```

### 3.3 生产环境配置（动态 xDS + 关键调优）

```yaml
# conf/envoy.yaml — 生产环境（xDS 动态配置）

dynamic_resources:
  lds_config:
    path: /etc/envoy/lds.yaml
  rds_config:
    path: /etc/envoy/rds.yaml
  cds_config:
    path: /etc/envoy/cds.yaml
  eds_config:
    path: /etc/envoy/eds.yaml
# 逻辑：xDS 动态配置由控制面（Istiod/自研）推送
# Listener/Route/Cluster/Endpoint 各自独立更新，无需重启

static_resources:
  clusters:
    - name: xds_cluster
      type: STRICT_DNS
      connect_timeout: 5s
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
      # 安全：Admin endpoint 绑定回环地址，禁止远程访问
      address: 127.0.0.1
      port_value: 9901

# === 关键调优参数（在 Cluster 配置中）===
# 以下参数通常在 xds 推送的 Cluster 配置中设置

# connect_timeout: 5s              # 连接后端超时
# per_connection_buffer_limit_bytes: 32768  # 每连接缓冲 32KB
# circuit_breakers:
#   thresholds:
#     - priority: DEFAULT
#       max_connections: 1024      # 最大连接数
#       max_pending_requests: 1024 # 最大待处理请求
#       max_requests: 1024         # 最大活跃请求
#       max_retries: 3             # 最大重试
# outlier_detection:
#   consecutive_5xx: 5             # 连续 5 次 5xx 驱逐
#   interval: 30s                 # 检测间隔
#   base_ejection_time: 30s       # 驱逐基础时间
#   max_ejection_percent: 50      # 最大驱逐比例
# 逻辑：
#   circuit_breakers → 防止级联故障，超过阈值快速失败
#   outlier_detection → 自动驱逐异常后端实例
```

---

## 4. 调优

### 4.1 连接子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `connect_timeout` | 连接后端超时 | 5s | 太短 → 后端慢时频繁失败；太长 → 故障感知慢 |
| `per_connection_buffer_limit_bytes` | 每连接缓冲 | 32KB | 缓冲请求/响应数据，减少小包发送 |

### 4.2 熔断子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `max_connections` | 最大连接 | 1024 | 超过快速失败，防止级联故障 |
| `max_pending_requests` | 最大待处理 | 1024 | 请求排队上限，超过拒绝 |
| `max_requests` | 最大并发请求 | 1024 | 并发请求上限 |
| `max_retries` | 最大重试 | 3 | 重试过多加重后端压力 |

### 4.3 异常检测子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `consecutive_5xx` | 连续 5xx 次数 | 5 | 连续 5 次 5xx 驱逐实例 |
| `interval` | 检测间隔 | 30s | 太短 → 误判；太长 → 故障感知慢 |
| `base_ejection_time` | 驱逐基础时间 | 30s | 实际驱逐时间 = base × 驱逐次数 |
| `max_ejection_percent` | 最大驱逐比例 | 50 | 防止驱逐过多实例导致雪崩 |

### 4.4 容量规划

| 规模 | Envoy | CPU | 内存 | 连接数 | QPS |
|------|-------|-----|------|--------|------|
| 小型 | 2 | 2 核 | 1G | 1 万 | < 1 万 |
| 中型 | 4 | 4 核 | 2G | 5 万 | 1-5 万 |
| 大型 | 8+ | 8 核 | 4G | 10 万+ | 5 万+ |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# Admin API
curl http://envoy:9901/stats          # 统计信息
curl http://envoy:9901/clusters       # Cluster 状态
curl http://envoy:9901/listeners      # Listener 状态
curl http://envoy:9901/config_dump    # 完整配置导出
curl http://envoy:9901/runtime        # 运行时配置

# 热重启（零丢连接）— 使用 SIGUSR1 信号触发热重启
kill -SIGUSR1 $(pidof envoy)
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **5xx 比例** | `stats → cluster.*.upstream_rq_5xx` | > 1% |
| **延迟** | `stats → cluster.*.upstream_rq_time` | P99 > 500ms |
| **熔断** | `stats → cluster.*.cx_overflow` | > 0 |
| **驱逐** | `stats → cluster.*.membership_healthy` | 减少 |

**Prometheus**：`/stats/prometheus`

### 5.3 备份与恢复

```bash
# 导出完整配置
curl http://envoy:9901/config_dump > envoy-config-backup.json
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：503 Upstream Unavailable

**排查**：`/clusters` 查看后端健康状态 → 检查异常检测配置 → 检查后端日志

#### 故障 2：配置不更新

**排查**：检查 xDS 连接 → 检查控制面日志 → `/config_dump` 对比配置版本

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| Admin API | `:9901` |
| `/stats` | 统计信息 |
| `/config_dump` | 配置导出 |
| `/clusters` | Cluster 状态 |

---

## 7. 参考资料

- [Envoy Documentation](https://www.envoyproxy.io/docs/envoy/latest/)
- [Envoy xDS API](https://www.envoyproxy.io/docs/envoy/latest/api/api_supported_versions)
- [Istio Data Plane](https://istio.io/latest/docs/overview/what-is-istio/)

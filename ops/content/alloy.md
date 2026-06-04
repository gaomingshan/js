# Alloy 部署运维指南

> **定位**：Grafana Labs 开源的统一可观测性 Agent，替代 Promtail/Tempo Agent/Loki Agent
> **适用场景**：指标/日志/链路采集、K8s 原生采集、Pipeline 式处理
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Grafana Alloy 是 Grafana Labs 掐出的统一可观测性 Agent，合并了 Promtail（日志）、Tempo Agent（链路）、Loki Agent、Mimir Agent 的功能，以 Pipeline 式配置处理指标/日志/链路数据。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **统一 Agent** | 指标 + 日志 + 链路一个 Agent |
| **Pipeline** | 声明式处理管道 |
| **兼容性** | 兼容 Prometheus/OTel/Loki/Tempo |
| **K8s 原生** | ServiceMonitor/PodMonitor 自动发现 |
| **低资源** | Go 实现，内存占用低 |

### 1.3 替代关系

| 旧 Agent | Alloy 替代组件 |
|----------|---------------|
| Promtail | `loki.source.*` |
| Tempo Agent | `otelcol.*` |
| Mimir Agent | `prometheus.*` |
| Grafana Agent | Alloy 本身 |

---

## 2. 部署

### 2.1 Docker 部署

```bash
docker run -d \
  --name alloy \
  -v ./conf/alloy.alloy:/etc/alloy/config.alloy \
  -v /var/log:/var/log:ro \
  --restart unless-stopped \
  grafana/alloy:v1.3.0 \
  run /etc/alloy/config.alloy
```

### 2.2 K8s 部署（Helm）

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install alloy grafana/alloy \
  --set configMaps.alloy-config.content="$(cat alloy.alloy)"
```

---

## 3. 配置文件

### 3.2 开发环境配置（指标 + 日志 + 链路）

```hcl
# alloy.alloy — 开发环境全采集配置

// === 指标采集（替代 Prometheus Agent）===
prometheus.scrape "default" {
  targets = [
    {"__address__" = "localhost:9090"},
  ]
  forward_to = [prometheus.remote_write.default.receiver]
  scrape_interval = "15s"
}

prometheus.remote_write "default" {
  endpoint {
    url = "http://prometheus:9090/api/v1/write"
  }
}

// === 日志采集（替代 Promtail）===
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

// === 链路采集（OTLP）===
otelcol.receiver.otlp "default" {
  grpc {
    endpoint = "0.0.0.0:4317"
  }
  http {
    endpoint = "0.0.0.0:4318"
  }
  output {
    metrics = [otelcol.exporter.otlp.default.input]
    logs    = [loki.write.default.receiver]
    traces  = [otelcol.exporter.otlp.default.input]
  }
}

otelcol.exporter.otlp "default" {
  client {
    endpoint = "tempo:4317"
  }
}
```

### 3.3 生产环境配置

```hcl
# alloy.alloy — 生产环境

// === 发现 K8s 服务 ===
discovery.kubernetes "pods" {
  role = "pod"
}

// === 指标采集（ServiceMonitor 模式）===
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

// === 日志采集 ===
loki.source.kubernetes "pod_logs" {
  forward_to = [loki.process.logs.receiver]
}

loki.process "logs" {
  forward_to = [loki.write.loki.receiver]

  stage.json {
    expressions = {level = "level", msg = "msg"}
  }
  stage.labels {
    values = {level = "", app = "k8s_app"}
  }
}

loki.write "loki" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}

// === 链路采集 ===
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
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `scrape_interval` | 采集间隔 | 15s | 与 Prometheus 一致 |
| 日志 Pipeline | 处理阶段 | 按需 | stage.json → stage.labels → forward_to |
| 缓冲 | 写入缓冲 | 1000 条 | 防止后端不可用时丢数据 |

---

## 5. 运维

```bash
# Alloy UI
http://alloy:12345/

# 查看组件状态
curl http://alloy:12345/api/v0/components
```

---

## 7. 参考资料

- [Alloy Documentation](https://grafana.com/docs/alloy/latest/)
- [Alloy Configuration](https://grafana.com/docs/alloy/latest/configure/)
- [Alloy Components](https://grafana.com/docs/alloy/latest/components/)

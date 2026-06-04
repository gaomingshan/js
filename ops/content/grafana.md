# Grafana 部署运维指南

> **定位**：开源可视化与仪表盘平台，可观测性前端
> **适用场景**：指标/日志/链路可视化、仪表盘、告警、数据源统一
> **难度级别**：⭐ 低

---

## 1. 概述

### 1.1 是什么

Grafana 是开源的可视化与仪表盘平台，支持 100+ 数据源（Prometheus/Loki/Tempo/InfluxDB/ES/MySQL 等），提供丰富的图表类型、告警、仪表盘模板市场。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **多数据源** | Prometheus/Loki/Tempo/ES/MySQL/PG 等 |
| **仪表盘** | 拖拽式仪表盘，模板市场 |
| **告警** | 统一告警规则，多通道通知 |
| **Explore** | 交互式数据探索 |
| **RBAC** | 团队/组织/角色权限 |
| **Provisioning** | 配置即代码 |

### 1.3 适用场景

**最佳适用**：可观测性可视化、仪表盘、告警、多数据源统一展示

---

## 2. 部署

### 2.1 Docker 部署

```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=Grafana!Pass \
  -v grafana-data:/var/lib/grafana \
  -v ./conf/provisioning:/etc/grafana/provisioning \
  --restart unless-stopped \
  grafana/grafana:11.2.0
```

### 2.2 生产环境配置

```ini
# grafana.ini — 生产环境

[server]
http_port = 3000
domain = grafana.example.com
root_url = https://grafana.example.com

[security]
admin_user = admin
admin_password = Grafana!Pass
secret_key = SW2YcwTIb9zpO1WY3jPQn2T4

[auth]
disable_login_form = false

[auth.generic_oauth]
enabled = true
name = SSO
client_id = grafana
client_secret = OAuthClientSecret
scopes = openid email profile
auth_url = https://sso.example.com/oauth2/authorize
token_url = https://sso.example.com/oauth2/token
api_url = https://sso.example.com/userinfo

[database]
type = mysql
host = mysql:3306
name = grafana
user = grafana
password = GrafanaDB!Pass
# 逻辑：默认 SQLite 不适合集群，生产用 MySQL/PG

[alerting]
enabled = true

[analytics]
reporting_enabled = false
check_for_updates = false
```

**数据源 Provisioning** `provisioning/datasources/datasources.yml`：

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100

  - name: Tempo
    type: tempo
    access: proxy
    url: http://tempo:3200
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| 数据库 | 后端数据库 | MySQL/PG | SQLite 不支持集群 |
| `max_connections` | 最大连接 | 100 | 并发用户多时增大 |
| 缓存 | 远程缓存 | Redis | 集群模式共享 Session |

---

## 5. 运维

```bash
# 备份仪表盘
curl -H "Authorization: Bearer $API_KEY" \
  http://grafana:3000/api/dashboards/uid/<uid> > dashboard.json

# 导入仪表盘
# UI → Dashboards → Import → 粘贴 JSON 或输入 Grafana.com ID
```

---

## 7. 参考资料

- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Grafana Dashboards Market](https://grafana.com/grafana/dashboards/)

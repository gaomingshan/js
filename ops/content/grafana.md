# Grafana 部署指南

> 版本：11.2 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 部署模式 | 最低配置 | 推荐配置 | 磁盘 |
|----------|----------|----------|------|
| 单机 | 1 核 / 1G | 2 核 / 2G | 20G SSD |
| 生产 | 2 核 / 4G | 4 核 / 8G | 100G SSD（含数据库） |

---

## 2. 裸机安装（通用）

```bash
# 下载
wget https://dl.grafana.com/oss/release/grafana-11.2.0.linux-amd64.tar.gz
tar xzf grafana-11.2.0.linux-amd64.tar.gz
sudo mv grafana-v11.2.0 /opt/grafana

# 目录结构
sudo mkdir -p /opt/grafana/{data,conf,provisioning/datasources,provisioning/dashboards}
sudo chown -R grafana:grafana /opt/grafana 2>/dev/null || true

# systemd 服务
cat > /etc/systemd/system/grafana.service << 'EOF'
[Unit]
Description=Grafana
Documentation=https://grafana.com
After=network.target

[Service]
Type=simple
User=grafana
ExecStart=/opt/grafana/bin/grafana-server \
  --homepath=/opt/grafana \
  --config=/opt/grafana/conf/grafana.ini
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
```

---

## 3. 单机/基础部署

**适用场景**：开发环境、个人仪表盘，默认 SQLite + admin/admin 登录。

### 配置文件（完整可复制）

```bash
cat > /opt/grafana/conf/grafana.ini << 'EOF'
[server]
http_port = 3000

[security]
admin_user = admin
admin_password = admin

[paths]
data = /opt/grafana/data
logs = /opt/grafana/data/log

[analytics]
reporting_enabled = false
check_for_updates = false
EOF
```

### 启动

```bash
sudo systemctl enable --now grafana
```

### 验证

```bash
curl http://localhost:3000/api/health
# 浏览器访问 http://<IP>:3000  admin/admin
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  grafana:
    image: grafana/grafana:11.2.0
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./provisioning:/etc/grafana/provisioning

volumes:
  grafana-data:
```

---

## 4. 生产/高可用部署

**适用场景**：生产环境，PostgreSQL 替换 SQLite + SMTP 告警 + 反向代理 + 数据源预配置。

### 配置文件

```bash
cat > /opt/grafana/conf/grafana.ini << 'EOF'
[server]
http_port = 3000
domain = grafana.example.com
root_url = https://grafana.example.com
serve_from_sub_path = true

[security]
admin_user = admin
admin_password = <STRONG_PASSWORD>
secret_key = <openssl rand -base64 32>  # 必须随机生成，每实例独立

[database]
type = postgres
host = 127.0.0.1:5432
name = grafana
user = grafana
password = <DB_PASSWORD>
ssl_mode = disable
max_open_conn = 100
max_idle_conn = 50

[smtp]
enabled = true
host = smtp.example.com:587
user = grafana@example.com
password = <SMTP_PASSWORD>
from_address = grafana@example.com
from_name = Grafana

[auth]
disable_login_form = false
oauth_auto_login = false

[auth.generic_oauth]
enabled = false

[alerting]
enabled = true
execute_alerts = true

[analytics]
reporting_enabled = false
check_for_updates = false

[log]
mode = console file
level = info
EOF
```

```bash
cat > /opt/grafana/provisioning/datasources/datasources.yml << 'EOF'
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
EOF
```

### 启动/验证

```bash
sudo systemctl restart grafana
curl http://localhost:3000/api/health
# 验证 PostgreSQL 连接：检查 /opt/grafana/data/log/grafana.log
```

### Docker Compose

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    container_name: grafana-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: grafana
      POSTGRES_USER: grafana
      POSTGRES_PASSWORD: <DB_PASSWORD>
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - grafana-net

  grafana:
    image: grafana/grafana:11.2.0
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_DATABASE_TYPE: postgres
      GF_DATABASE_HOST: postgres:5432
      GF_DATABASE_NAME: grafana
      GF_DATABASE_USER: grafana
      GF_DATABASE_PASSWORD: <DB_PASSWORD>
      GF_SECURITY_ADMIN_PASSWORD: <STRONG_PASSWORD>
      GF_SECURITY_SECRET_KEY: <RANDOM_32_BASE64>
      GF_SMTP_ENABLED: "true"
      GF_SMTP_HOST: smtp.example.com:587
      GF_SMTP_USER: grafana@example.com
      GF_SMTP_PASSWORD: <SMTP_PASSWORD>
    volumes:
      - grafana-data:/var/lib/grafana
      - ./provisioning:/etc/grafana/provisioning
    depends_on:
      - postgres
    networks:
      - grafana-net

volumes:
  postgres-data:
  grafana-data:

networks:
  grafana-net:
    driver: bridge
```

---

## 5. 运维速查

```bash
# 健康检查
curl http://localhost:3000/api/health

# 备份仪表盘（需 API Key）
curl -H "Authorization: Bearer $API_KEY" \
  http://grafana:3000/api/dashboards/uid/<uid> > dashboard.json

# 重置 admin 密码
/opt/grafana/bin/grafana-cli admin reset-admin-password <newpass>

# 查看日志
tail -f /opt/grafana/data/log/grafana.log
```

| 参数 | 作用 | 推荐值 | 说明 |
|------|------|--------|------|
| `secret_key` | Session 签名密钥 | 随机 32 字符 Base64 | 生产必须随机生成 |
| `database` | 后端数据库 | PostgreSQL | SQLite 不支持集群 |
| `max_open_conn` | 最大数据库连接 | 100 | 并发高时增大 |
| 反向代理 | 前端代理 | Nginx + HTTPS | 增加 TLS 和域名访问 |

### 6. 常见故障

**登录后 502 / 空白页**
排查：检查 `root_url` 和反向代理配置是否一致

**数据库连接失败**
排查：`max_open_conn` 过大或 PostgreSQL 连接耗尽

**无法发送告警**
排查：SMTP 配置 → 网络连通 → 检查邮箱服务商限制

**忘记 admin 密码**
```bash
/opt/grafana/bin/grafana-cli admin reset-admin-password <newpass>
```

---

## 参考资料

- [Grafana Docs](https://grafana.com/docs/grafana/latest/)
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Dashboard Market](https://grafana.com/grafana/dashboards/)

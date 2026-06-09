# Harbor 部署指南

> 版本：2.11 | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| Docker | ≥ 20.10 |
| Docker Compose | ≥ 2.20 (或 docker compose plugin) |
| 内存 | ≥ 4GB (推荐 8GB+) |
| 磁盘 | ≥ 100GB (镜像存储 + 数据库) |
| 端口 | 80/443 (HTTP/HTTPS), 4443 (Notary 可选) |

## 2. 裸机安装（通用）

```bash
# 下载离线安装包（推荐）
wget https://github.com/goharbor/harbor/releases/download/v2.11.0/harbor-offline-installer-v2.11.0.tgz
tar xzf harbor-offline-installer-v2.11.0.tgz && cd harbor

# 生成配置
cp harbor.yml.tmpl harbor.yml
vi harbor.yml  # 修改 hostname, password, data_volume 等

# 执行安装（--with-trivy 启用漏洞扫描）
sudo ./install.sh --with-trivy

# 管理
sudo docker compose -f /opt/harbor/docker-compose.yml up -d
sudo docker compose -f /opt/harbor/docker-compose.yml down
```

**验证**：

```bash
sudo docker compose ps
# 浏览器访问 http://harbor.example.com
# 默认管理员 admin / Harbor12345
curl -s http://localhost/api/v2.0/projects | head -5
```

## 3. 基础部署

**适用场景**：开发测试环境、内网镜像仓库

**配置** — `harbor.yml`：

```yaml
hostname: harbor.example.com

http:
  port: 80

# 开发环境可以暂不用 HTTPS
# https:
#   port: 443
#   certificate: /data/harbor/certs/harbor.crt
#   private_key: /data/harbor/certs/harbor.key

harbor_admin_password: Harbor12345

database:
  password: HarborDB!Pass
  max_idle_conns: 100
  max_open_conns: 250

data_volume: /data/harbor

trivy:
  ignore_unfixed: true
  skip_update: false   # 在线更新漏洞库

log:
  level: info
  rotate_count: 30
  rotate_size: 100M
```

**启动**：

```bash
sudo ./install.sh --with-trivy
# 等待所有容器启动
sudo docker compose -f /opt/harbor/docker-compose.yml ps
```

**验证**：

```bash
docker login harbor.example.com -u admin -p Harbor12345
docker tag alpine:latest harbor.example.com/library/alpine:latest
docker push harbor.example.com/library/alpine:latest
# UI → Projects → library → 确认镜像存在
```

**Docker Compose**：

> Harbor 使用自带 `docker-compose.yml` 和 `install.sh` 管理，不推荐自定义 Compose 文件。

## 4. 生产部署

**适用场景**：企业级镜像仓库、HTTPS + 漏洞扫描 + 多租户 + 备份

**配置** — `harbor.yml`（完整）：

```yaml
hostname: harbor.example.com

http:
  port: 80

https:
  port: 443
  certificate: /data/harbor/certs/harbor.example.com.crt
  private_key: /data/harbor/certs/harbor.example.com.key

harbor_admin_password: HarborAdmin!Pass

# 数据库
database:
  password: HarborDB!Pass
  max_idle_conns: 100
  max_open_conns: 250

# 数据存储
data_volume: /data/harbor

# 启用 Trivy
trivy:
  enabled: true
  ignore_unfixed: false
  skip_update: true              # 离线环境：跳过在线更新
  offline_scan: true
  severity: UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL

# 仓库复制认证
intermediate_cert: ""

# 日志轮转
log:
  level: warning
  local:
    rotate_count: 50
    rotate_size: 200M
    location: /data/harbor/logs

# 代理
proxy:
  http_proxy: ""
  https_proxy: ""
  no_proxy: "127.0.0.1,localhost,core,registry"

# 认证
auth_mode: db_auth                  # 可选 db_auth / ldap_auth / oidc_auth

# LDAP 配置（启用 LDAP 时）
# ldap:
#   url: ldap://ldap.example.com
#   base_dn: "dc=example,dc=com"
#   uid: "uid"

# 自签名证书生成（如需）
# openssl req -newkey rsa:4096 -nodes -sha256 -keyout /data/harbor/certs/harbor.example.com.key \
#   -x509 -days 365 -out /data/harbor/certs/harbor.example.com.crt \
#   -subj "/CN=harbor.example.com" \
#   -addext "subjectAltName=DNS:harbor.example.com,DNS:harbor,DNS:localhost,IP:127.0.0.1"
```

**Trivy 离线扫描**：

```bash
# 在有网络的机器上下载漏洞数据库
docker run --rm aquasec/trivy:0.52 image --download-db-only --cache-dir /tmp/trivy-db
tar czf trivy-offline-db.tar.gz -C /tmp/trivy-db .

# 上传到 Harbor 服务器
tar xzf trivy-offline-db.tar.gz -C /data/harbor/trivy/

# 配置 harbor.yml 中 trivy.skip_update: true 后重新部署
```

**启动**：

```bash
sudo ./install.sh --with-trivy
```

**验证**：

```bash
# HTTPS 登录
docker login harbor.example.com -u admin

# 推送镜像触发自动扫描
docker push harbor.example.com/project/myapp:latest

# 查看扫描结果
# UI → Projects → 镜像 → Tag → Vulnerability
curl -sk https://harbor.example.com/api/v2.0/projects | jq .
```

**备份完整清单**：

| 路径 | 内容 | 备份策略 |
|------|------|----------|
| `/data/harbor/database/` | PostgreSQL 数据库 | 每日 pg_dump |
| `/data/harbor/registry/` | 镜像 Blob 存储 | 每周全量 + rsync |
| `/data/harbor/redis/` | Redis 数据 | 每日 |
| `/data/harbor/trivy/` | Trivy 漏洞库 | 离线包保存归档 |
| `harbor.yml` | 配置文件 | 版本管理 (Git) |

```bash
# 数据库备份
docker exec harbor-db pg_dump -U postgres registry > harbor-db-$(date +%Y%m%d).sql

# 配置备份
cp /opt/harbor/harbor.yml harbor.yml.bak
```

**Docker Compose**：

> Harbor 安装器生成 `docker-compose.yml`，不要手动修改。调整配置需编辑 `harbor.yml` 后执行 `sudo ./install.sh` 重新生成。

## 5. 运维速查

```bash
# 服务管理
sudo docker compose -f /opt/harbor/docker-compose.yml start
sudo docker compose -f /opt/harbor/docker-compose.yml stop
sudo docker compose -f /opt/harbor/docker-compose.yml restart
sudo docker compose -f /opt/harbor/docker-compose.yml ps

# 查看日志
sudo docker compose -f /opt/harbor/docker-compose.yml logs -f

# 垃圾回收
# UI → Administration → Garbage Collection → 立即运行 / 设置定时

# 仓库复制
# UI → Administration → Replication → 创建复制规则
# 支持 Pull/Push 模式，跨 Harbor 实例同步

# 用户管理
# UI → Administration → Users → 创建/导入用户
# UI → Projects → Members → 分配角色

# 重新部署（修改 harbor.yml 后）
cd /opt/harbor && sudo ./install.sh --with-trivy
# install.sh 会自动重新生成 docker-compose.yml 并启动
```

## 6. 常见故障

### 6.1 Docker 登录 HTTP 被拒绝
```
Error response from daemon: Get "https://harbor.example.com/v2/": http: server gave HTTP response to HTTPS client
```
配置 Docker daemon 信任 HTTP 仓库：

```bash
cat > /etc/docker/daemon.json << 'EOF'
{
  "insecure-registries": ["harbor.example.com"]
}
EOF
systemctl restart docker
```

生产应配置 HTTPS 证书，不在生产使用 `insecure-registries`。

### 6.2 install.sh 失败 — docker-compose 版本低
```
ERROR: Version in "./docker-compose.yml" is unsupported.
```
安装 Docker Compose v2+：

```bash
docker compose version
# 低于 v2 则升级
apt install docker-compose-v2  # Ubuntu
# 或从 GitHub 下载二进制
```

### 6.3 磁盘空间增长 — 未配置垃圾回收
- 启用定时回收：`UI → Administration → Garbage Collection → Schedule`
- 设置镜像保留策略：`Projects → myproject → Configuration → Auto purging`
- 监控 `/data/harbor/registry/docker/registry/v2` 目录大小

### 6.4 Trivy 扫描失败 — 离线环境
```
failed to download vulnerability database
```
`harbor.yml` 设置 `trivy.skip_update: true`，手动导入离线漏洞库。参见 4. 生产部署中 Trivy 离线扫描步骤。

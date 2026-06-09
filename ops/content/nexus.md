# Nexus 部署指南

> 版本：3.72 (OSS) | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| 内存 | ≥ 4GB (推荐 8GB+，Java Heap ≥ 2GB) |
| 磁盘 | ≥ 50GB (Blob Store + 数据库) |
| 用户 | 容器内 uid=200，宿主需 `chown 200:200` |
| 端口 | 8081 (管理 UI), 5000 (Docker 仓库) |
| ulimit | nofile ≥ 65536 (文件句柄) |

## 2. 裸机安装（通用）

### 2.1 下载安装 OSS 版本

```bash
wget https://download.sonatype.com/nexus/3/nexus-3.72.0-03-unix.tar.gz
tar xzf nexus-3.72.0-03-unix.tar.gz -C /opt
ln -s /opt/nexus-3.72.0-03 /opt/nexus

# 创建运行用户（uid=200）
useradd -r -m -u 200 nexus
chown -R nexus:nexus /opt/nexus /opt/nexus-3.72.0-03 /opt/sonatype-work

# JVM 堆内存配置
cat > /opt/nexus/bin/nexus.vmoptions << 'EOF'
-Xms2048m
-Xmx2048m
-XX:MaxDirectMemorySize=2g
-XX:+UnlockExperimentalVMOptions
-XX:+UseZGC
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/opt/sonatype-work/nexus3/log
-Djava.net.preferIPv4Stack=true
EOF

# systemd 服务
cat > /etc/systemd/system/nexus.service << 'EOF'
[Unit]
Description=Nexus Repository Manager
After=network.target

[Service]
Type=forking
User=nexus
Group=nexus
LimitNOFILE=65536
ExecStart=/opt/nexus/bin/nexus start
ExecStop=/opt/nexus/bin/nexus stop
ExecReload=/opt/nexus/bin/nexus restart
Restart=on-abort

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload && systemctl enable --now nexus
```

**验证**：

```bash
journalctl -u nexus -f
# 等待日志中出现 "Started Sonatype Nexus OSS"
curl -sI http://localhost:8081 | head -1
# HTTP/1.1 200 OK

# 获取初始密码
cat /opt/sonatype-work/nexus3/admin.password
```

## 3. 基础部署

**适用场景**：开发测试环境、Maven/Docker 代理仓库

**配置**：

```bash
# 确保数据目录权限
mkdir -p /opt/nexus-data && chown -R 200:200 /opt/nexus-data
```

**启动**：

```bash
docker run -d \
  --name nexus \
  -p 8081:8081 \
  -p 5000:5000 \
  -v nexus-data:/opt/nexus-data \
  --restart unless-stopped \
  sonatype/nexus3:3.72.0
```

**验证**：

```bash
docker logs -f nexus
# 等待 "Started Sonatype Nexus OSS"
# 初始密码
docker exec nexus cat /opt/nexus-data/admin.password

# 浏览器访问 http://localhost:8081
# 首次登录强制修改密码
# 是否启用匿名访问（开发环境可启用）
```

**Docker Compose**：

```yaml
services:
  nexus:
    image: sonatype/nexus3:3.72.0
    container_name: nexus
    restart: unless-stopped
    ports:
      - "8081:8081"
      - "5000:5000"
    volumes:
      - nexus-data:/opt/nexus-data

volumes:
  nexus-data:
```

## 4. 生产部署

**适用场景**：企业级制品仓库、多格式代理+托管、Docker Registry、安全审计

**配置** — `nexus.vmoptions`（堆内存调优）：

```bash
cat > /opt/nexus-data/etc/nexus.vmoptions << 'EOF'
-Xms4096m
-Xmx4096m
-XX:MaxDirectMemorySize=4g
-XX:+UnlockExperimentalVMOptions
-XX:+UseZGC
-XX:ConcGCThreads=4
-XX:ParallelGCThreads=4
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/opt/nexus-data/log
-Djava.net.preferIPv4Stack=true
EOF
```

> **堆内存参考**：4GB 内存服务器 → `-Xms2048m -Xmx2048m`；8GB → `-Xms4096m -Xmx4096m`；16GB → `-Xms6144m -Xmx6144m`

**生产注意事项**：

| 事项 | 说明 |
|------|------|
| **uid=200** | Nexus 容器以 uid=200 运行，数据目录需 `chown 200:200`，否则启动报权限错误 |
| **ulimits** | nofile ≥ 65536，否则高并发下报 "Too many open files" |
| **HTTPS** | 使用反向代理 `Nginx/Caddy` 对外暴露 HTTPS，Nexus 自身监听 HTTP 8081 |
| **密码安全** | 初始密码在 `/opt/nexus-data/admin.password`，首次登录强制修改。**禁止**在命令行传密码 |
| **持久化** | Blob Store 建议独立磁盘或 S3 后端 |

**HTTPS 反向代理（Nginx）**：

```nginx
cat > /etc/nginx/conf.d/nexus.conf << 'EOF'
server {
    listen 443 ssl;
    server_name nexus.example.com;

    ssl_certificate     /etc/ssl/certs/nexus.crt;
    ssl_certificate_key /etc/ssl/private/nexus.key;

    client_max_body_size 1g;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Docker Registry 子域名
server {
    listen 443 ssl;
    server_name docker.nexus.example.com;

    ssl_certificate     /etc/ssl/certs/nexus.crt;
    ssl_certificate_key /etc/ssl/private/nexus.key;

    client_max_body_size 0;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 900s;
    }
}
EOF
```

**启动**：

```bash
docker run -d \
  --name nexus \
  -p 8081:8081 \
  -p 5000:5000 \
  -v nexus-data:/opt/nexus-data \
  --restart unless-stopped \
  --ulimit nofile=65536:65536 \
  sonatype/nexus3:3.72.0
```

**验证**：

```bash
# UI 验证
curl -sI https://nexus.example.com | head -1

# Docker 仓库验证
docker login docker.nexus.example.com -u admin
# 密码通过 UI 设置，不在命令行明文输入

# Maven 代理验证
curl -sI https://nexus.example.com/repository/maven-central/ | head -1
```

**Docker Compose**：

```yaml
services:
  nexus:
    image: sonatype/nexus3:3.72.0
    container_name: nexus
    restart: unless-stopped
    ports:
      - "127.0.0.1:8081:8081"
      - "127.0.0.1:5000:5000"
    volumes:
      - nexus-data:/opt/nexus-data
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    deploy:
      resources:
        limits:
          memory: 6g

volumes:
  nexus-data:
```

## 5. 运维速查

```bash
# 服务管理
docker restart nexus
docker logs -f nexus

# 查看初始密码
docker exec nexus cat /opt/nexus-data/admin.password

# 查看 JVM 配置
docker exec nexus cat /opt/nexus-data/etc/nexus.vmoptions

# Maven settings.xml（密码通过 settings-security.xml 加密）
cat > ~/.m2/settings.xml << 'EOF'
<settings>
  <servers>
    <server>
      <id>nexus</id>
      <username>admin</username>
      <password>${encrypted-password}</password>
    </server>
  </servers>
  <mirrors>
    <mirror>
      <id>nexus</id>
      <url>https://nexus.example.com/repository/maven-group/</url>
      <mirrorOf>*</mirrorOf>
    </mirror>
  </mirrors>
</settings>
EOF

# 备份（推荐使用 API 或 Blob Store 级别备份）
# Blob Store: rsync /opt/nexus-data/blobs/
# 数据库: UI → System → Backup → 导出任务
# API: curl -u admin -X POST "https://nexus.example.com/service/rest/v1/backup"

# 清理旧制品
# UI → System → Cleanup Policies → 创建清理策略（按版本数/日期）
```

## 6. 常见故障

### 6.1 启动失败 — 数据目录权限
```
java.io.IOException: Permission denied
```
**原因**：容器 uid=200 无法写入宿主目录。

**解决**：

```bash
chown -R 200:200 /opt/nexus-data
```

### 6.2 高并发报错 — Too many open files
```
java.io.IOException: Too many open files
```
**解决**：

```bash
# Docker Compose 设置 ulimits
# 宿主机也需修改
cat >> /etc/security/limits.conf << 'EOF'
nexus soft nofile 65536
nexus hard nofile 65536
EOF
```

### 6.3 JDK 版本不兼容
Nexus 3.72 需要 JDK 17+。使用官方镜像无需担心，裸机安装需确认 `java -version` 版本。

### 6.4 磁盘满 — Blob Store 未清理
- 配置 Cleanup Policy：`UI → System → Cleanup Policies → 新建策略`
- 关联到 Repository：`UI → Repositories → 选择仓库 → Cleanup Policy`
- 手动触发清理：`UI → System → Cleanup Service → 立即执行`

### 6.5 Docker 仓库连接超时
```
Error response from daemon: Get "https://docker.nexus.example.com/v2/": dial tcp: timeout
```
确认 Nexus UI 中已创建 Docker (Hosted/Proxy) 仓库，并配置 HTTP Connector 端口为 5000。生产使用子域名（如 `docker.nexus.example.com`）而非路径前缀。

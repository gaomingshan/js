# MinIO 部署指南

> 版本：latest | 系统：CentOS 7.9+ / Ubuntu 22.04+

---

## 1. 环境要求

| 项目 | 最低 | 推荐 |
|------|------|------|
| CPU | 2 核 | 8 核+ |
| 内存 | 4G | 16G+ |
| 磁盘 | 100G SSD | 1T+ NVMe |
| 网络 | 1Gbps | 10Gbps+（分布式） |
| 系统 | CentOS 7.9+ / Ubuntu 22.04+ | |

---

## 2. 裸机安装（通用）

```bash
# 下载二进制
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio && mv minio /usr/local/bin/

# 创建用户
useradd -r -s /sbin/nologin minio
mkdir -p /data/minio /etc/minio
chown minio:minio /data/minio
```

**客户端 mc**：
```bash
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc && mv mc /usr/local/bin/
```

---

## 3. 单机部署（Standalone）

### 适用场景

开发测试、小型文件存储（< 10TB）、单点不需要高可用。

### 配置

使用 `--env-file` 方式（安全，避免密码暴露在进程列表）：

```bash
cat > /etc/minio/env << 'EOF'
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=Str0ngMinIO!Pass16
MINIO_BROWSER_REDIRECT_URL=http://localhost:9001
MINIO_SERVER_URL=http://localhost:9000
EOF
chmod 600 /etc/minio/env
```

### 启动

```bash
# 前台启动（测试）
minio server /data/minio --console-address ":9001"

# Systemd 服务
cat > /etc/systemd/system/minio.service << 'EOF'
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=simple
User=minio
Group=minio
EnvironmentFile=/etc/minio/env
ExecStart=/usr/local/bin/minio server /data/minio --console-address ":9001"
Restart=always
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload && systemctl enable minio && systemctl start minio
```

### 验证

```bash
mc alias set local http://localhost:9000 admin Str0ngMinIO!Pass16
mc admin info local
# 显示 Usage、Uptime、Drives 等信息
```

### Docker Compose

```yaml
services:
  minio:
    image: minio/minio
    container_name: minio
    restart: unless-stopped
    ports:
      - "9000:9000"
      - "9001:9001"
    env_file: ./minio.env
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"

volumes:
  minio-data:
```

`minio.env`：
```
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=Str0ngMinIO!Pass16
MINIO_SERVER_URL=http://localhost:9000
MINIO_BROWSER_REDIRECT_URL=http://localhost:9001
```

---

## 4. 分布式部署（4 节点，Erasure Coding）

### 适用场景

生产高可用，数据量 10TB+，纠删码容错，要求 S3 兼容。

### 节点规划

| 节点 | 主机名 | IP | 磁盘 |
|------|--------|-----|------|
| 1 | minio1 | 10.0.0.1 | /data |
| 2 | minio2 | 10.0.0.2 | /data |
| 3 | minio3 | 10.0.0.3 | /data |
| 4 | minio4 | 10.0.0.4 | /data |

纠删码：EC:2+2（4 节点，允许 2 节点故障，存储效率 50%）。

### 配置

各节点同步 `/etc/minio/env`：
```bash
cat > /etc/minio/env << 'EOF'
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=Str0ngMinIO!Pass16
MINIO_SERVER_URL=https://minio{1...4}.example.com:9000
MINIO_BROWSER_REDIRECT_URL=https://minio{1...4}.example.com:9001
EOF
chmod 600 /etc/minio/env
```

### 启动

```bash
# Systemd 服务（各节点相同）
cat > /etc/systemd/system/minio.service << 'EOF'
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=simple
User=minio
Group=minio
EnvironmentFile=/etc/minio/env
ExecStart=/usr/local/bin/minio server http://minio{1...4}.example.com:9000/data --console-address ":9001"
Restart=always
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload && systemctl enable minio && systemctl start minio
```

### 验证

```bash
mc alias set prod http://minio1.example.com:9000 admin Str0ngMinIO!Pass16
mc admin info prod
# 应显示 4 节点在线
mc admin heal prod --recursive --verbose
```

### Docker Compose

```yaml
x-minio-common: &minio-common
  image: minio/minio
  restart: unless-stopped
  env_file: ./minio.env
  command: server http://minio{1...4}/data --console-address ":9001"
  healthcheck:
    test: ["CMD", "mc", "ready", "local"]
    interval: 30s
    timeout: 10s
    retries: 3

services:
  minio1:
    <<: *minio-common
    container_name: minio1
    hostname: minio1
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio1-data:/data

  minio2:
    <<: *minio-common
    container_name: minio2
    hostname: minio2
    volumes:
      - minio2-data:/data

  minio3:
    <<: *minio-common
    container_name: minio3
    hostname: minio3
    volumes:
      - minio3-data:/data

  minio4:
    <<: *minio-common
    container_name: minio4
    hostname: minio4
    volumes:
      - minio4-data:/data

volumes:
  minio1-data:  minio2-data:  minio3-data:  minio4-data:
```

---

## 5. 运维速查

```bash
# 别名配置
mc alias set local http://localhost:9000 admin Str0ngMinIO!Pass16

# Bucket 管理
mc mb local/mybucket
mc ls local
mc version enable local/mybucket

# 上传/下载
mc cp file.txt local/mybucket/
mc cp local/mybucket/file.txt ./
mc mirror --watch /local/dir local/mybucket

# 用户策略
mc admin user list local
mc admin user add local appuser AppUser!Pass
mc admin policy attach local readwrite --user appuser

# 集群状态
mc admin info local
mc admin trace local --verbose
mc admin heal local --recursive

# Prometheus
mc admin prometheus generate local
# 端点：/minio/v2/metrics/cluster

# 修复扫描
mc admin heal local/mybucket --recursive
```

---

## 6. 常见故障

### 故障 1：磁盘空间不足

```bash
mc admin info local
# Usage > 80% → 增加磁盘或调整纠删码策略（--storage-class standard=EC:4+2 效率 67%）
```

### 故障 2：节点离线

```bash
mc admin info local
# 显示 offline → 检查网络/磁盘 → 重启节点自动加入集群
```

### 故障 3：S3 请求超时

```bash
mc admin trace local --verbose
# 检查网络带宽 → 优化对象大小（大对象 > 1MB 吞吐更高）
```

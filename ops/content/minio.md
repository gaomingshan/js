# MinIO 部署运维指南

> **定位**：高性能开源对象存储，S3 兼容 API，自建私有云存储首选
> **适用场景**：私有云对象存储、CI/CD 制品仓库、数据湖存储、备份归档
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

MinIO 是 GNU AGPL v3 许可的高性能对象存储，100% 兼容 Amazon S3 API，单节点部署简单，分布式模式支持纠删码（Erasure Code）和数据校验（Bitrot Protection）。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **S3 兼容** | 100% S3 API 兼容，aws-sdk 直接可用 |
| **纠删码** | 数据分 N 片 + M 校验片，允许 M 片丢失仍可恢复 |
| **Bitrot Protection** | HighwayHash 校验，静默数据损坏自动检测修复 |
| **多站点复制** | 站点间异步/同步复制，灾备方案 |
| **IAM** | 策略式访问控制，兼容 AWS IAM 策略 |
| **加密** | 服务端加密（SSE-S3/SSE-KMS/SSE-C），支持 Vault/KES |

### 1.3 适用场景

**最佳适用**：私有云对象存储、CI/CD 制品仓库、应用数据存储、数据湖底层

**不适用**：超大规模存储（PB+ → Ceph）、需要 POSIX 文件系统（→ SeaweedFS/NFS）、CDN 边缘缓存（→ CDN 服务）

---

## 2. 部署

### 2.1 裸机部署

```bash
# 下载二进制
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio && sudo mv minio /usr/local/bin/

# 创建数据和配置目录
sudo mkdir -p /data/minio /etc/minio

# 启动（单节点）
MINIO_ROOT_USER=admin MINIO_ROOT_PASSWORD=Str0ngMinIO!Pass \
  minio server /data/minio --console-address ":9001"

# Systemd 服务
sudo tee /etc/systemd/system/minio.service <<'EOF'
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=simple
User=minio
Group=minio
Environment="MINIO_ROOT_USER=admin"
Environment="MINIO_ROOT_PASSWORD=Str0ngMinIO!Pass"
ExecStart=/usr/local/bin/minio server /data/minio --console-address ":9001"
Restart=always
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

sudo useradd -r -s /sbin/nologin minio
sudo chown -R minio:minio /data/minio
sudo systemctl enable minio && sudo systemctl start minio
```

### 2.2 Docker 部署

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=Str0ngMinIO!Pass \
  -v minio-data:/data \
  --restart unless-stopped \
  minio/minio server /data --console-address ":9001"
```

### 2.3 Docker Compose 部署（分布式 4 节点）

```yaml
# docker-compose.yml
# MinIO 分布式最少 4 节点（纠删码需要）
version: '3.8'

x-minio-common: &minio-common
  image: minio/minio
  restart: unless-stopped
  environment:
    MINIO_ROOT_USER: admin
    MINIO_ROOT_PASSWORD: Str0ngMinIO!Pass
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
  minio1-data:
  minio2-data:
  minio3-data:
  minio4-data:
```

### 2.4 生产环境部署要点

**纠删码配置**：

| 节点数 | 纠删码集 | 数据片 | 校验片 | 允许故障节点 | 存储效率 |
|--------|----------|--------|--------|-------------|----------|
| 4 | 1 | 2 | 2 | 2 | 50% |
| 8 | 1 | 4 | 4 | 4 | 50% |
| 16 | 2 | 8 | 8 | 8 | 50% |

> **默认 EC:4+4**：4 数据片 + 4 校验片，允许 4 片丢失，存储效率 50%。可通过 `--storage-class` 调整。

**安全清单**：强密码（≥ 16 位）、TLS 加密（`--certs`）、IAM 策略最小权限、版本控制（防误删）、多站点复制

---

## 3. 配置文件

> **核心原则**：MinIO 通过环境变量和命令行参数配置，无传统配置文件。以下按场景提供完整启动配置。

### 3.1 开发环境配置

```bash
# 开发环境：单节点，无纠删码
docker run -d \
  --name minio-dev \
  -p 9000:9000 \
  -p 9001:9001 \
  # 安全：生产环境应使用 --env-file 加载敏感变量，避免密码在进程列表中泄露
  -e MINIO_ROOT_USER=admin \
  # 安全：生产环境应使用 --env-file 加载敏感变量，避免密码在进程列表中泄露
  -e MINIO_ROOT_PASSWORD=admin123 \
  -v minio-dev-data:/data \
  minio/minio server /data --console-address ":9001"
```

### 3.2 测试环境配置

```bash
# 测试环境：单节点 + 版本控制
docker run -d \
  --name minio-test \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=TestStr0ng!Pass \
  -e MINIO_BROWSER_REDIRECT_URL=http://minio-test:9001 \
  -v minio-test-data:/data \
  minio/minio server /data --console-address ":9001"
```

**初始化脚本**（创建 bucket + 用户 + 策略）：

```bash
# 安装 mc 客户端
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc && sudo mv mc /usr/local/bin/

# 配置别名
mc alias set local http://localhost:9000 admin TestStr0ng!Pass

# 创建 bucket（开启版本控制）
mc mb local/app-data
mc version enable local/app-data

# 创建应用用户和策略
mc admin user add local appuser AppUser!Pass
mc admin policy attach local readwrite --user appuser
```

### 3.3 生产环境配置 — 单节点

```bash
# 生产单节点：TLS + 纠删码目录 + 资源限制
docker run -d \
  --name minio-prod \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=ProdStr0ngMinIO!Pass16 \
  -e MINIO_BROWSER_REDIRECT_URL=https://minio.example.com:9001 \
  -e MINIO_SERVER_URL=https://minio.example.com:9000 \
  -e MINIO_PROMETHEUS_AUTH_TYPE=public \
  -e MINIO_OPTS="--storage-class standard=EC:2+1" \
  -v minio-prod-data:/data \
  -v /etc/minio/certs:/root/.minio/certs \
  --restart unless-stopped \
  --memory=4g \
  --cpus=4 \
  minio/minio server /data --console-address ":9001"
```

### 3.4 生产环境配置 — 分布式

```bash
# 生产分布式：4 节点 + TLS + 多磁盘
# 每个节点执行（以节点 1 为例）
MINIO_ROOT_USER=admin \
MINIO_ROOT_PASSWORD=ProdStr0ngMinIO!Pass16 \
MINIO_SERVER_URL=https://minio1.example.com:9000 \
MINIO_BROWSER_REDIRECT_URL=https://minio1.example.com:9001 \
minio server https://minio{1...4}.example.com:9000/mnt/disk{1...4} \
  --console-address ":9001"

# 纠删码逻辑：
# 4 节点 × 4 磁盘 = 16 块
# EC:8+8 在 16 块场景下纠删码集大小为 16，已触及单纠删码集上限
# 建议预留余量：推荐 --storage-class standard=EC:4+2（效率 67%）或 EC:8+4（效率 67%）
# 存储效率越高，磁盘利用率越好，但容错能力越弱
# 生产中：EC:4+2 = 允许 2 块故障，效率 67%
```

### 3.5 多站点复制配置

```bash
# 站点 A（主站点）
mc admin replicate add site-a https://minio-b.example.com:9000 \
  --access-key admin --secret-key ProdStr0ngMinIO!Pass16

# 站点 B（备站点）
# 同样配置反向复制

# 验证
mc admin replicate info site-a
```

---

## 4. 调优

### 4.1 存储子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `--storage-class` | 纠删码配置 | standard=EC:4+2 | 数据片+校验片。校验片越多越安全但效率越低。4+2 效率 67%，适合大多数场景 |
| 磁盘数量 | 每节点磁盘数 | 4-16 | 更多磁盘 = 更大纠删码集 = 更高并行度。但单集不超过 16 |
| `--parallelism` | 上传并行度 | 自动 | 大文件上传的并行分片数，通常自动即可 |

### 4.2 网络子系统

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `--address` | API 监听地址 | :9000 | 生产应绑定内网 IP |
| `--console-address` | 控制台地址 | :9001 | 与 API 端口分开 |
| `MINIO_DNS_URL` | DNS 查询 | 内部 DNS | 多租户虚拟主机风格 bucket 需配置 DNS |
| `MINIO_BROWSER_REDIRECT_URL` | 控制台重定向 | 实际域名 | 反向代理场景必须配置 |

### 4.3 性能优化

**关键性能因素**：

| 因素 | 影响 | 建议 |
|------|------|------|
| **磁盘类型** | 顺序写性能 | NVMe > SSD > HDD。MinIO 大顺序写，SSD 性价比最优 |
| **网络带宽** | 节点间通信 | 分布式模式节点间大量数据传输，推荐 10Gbps+ |
| **纠删码集大小** | 写入放大 | EC:N+M 写入需 N+M 个节点响应。集越大延迟越高 |
| **对象大小** | 吞吐量 | 大对象（> 1MB）吞吐高；小对象（< 64KB）受元数据开销影响 |

**小对象优化**：

```bash
# 小对象合并：使用 MinIO 的 S3 Select 或应用层合并
# 增大连接池：应用侧使用 S3 SDK 连接池
# 增大 multipart 阈值
```

### 4.4 容量规划

| 规模 | 节点 | 每节点磁盘 | 可用容量 | 网络 |
|------|------|-----------|----------|------|
| 小型 | 1 | 4 × 1TB SSD | 2TB（EC:2+1） | 1Gbps |
| 中型 | 4 | 4 × 4TB SSD | 32TB（EC:4+2） | 10Gbps |
| 大型 | 16 | 8 × 8TB SSD | 512TB（EC:8+4） | 25Gbps |

---

## 5. 运维

### 5.1 日常运维操作

```bash
# mc 客户端常用命令
mc alias set local http://localhost:9000 admin Str0ngMinIO!Pass

# Bucket 管理
mc mb local/mybucket
mc ls local
mc rb local/mybucket

# 上传/下载
mc cp file.txt local/mybucket/
mc cp local/mybucket/file.txt ./
mc mirror /local/dir local/mybucket   # 目录同步

# 用户和策略
mc admin user list local
mc admin user add local newuser NewUser!Pass
mc admin policy attach local readwrite --user newuser
mc admin user remove local newuser

# 集群状态
mc admin info local
mc admin trace local                  # 实时请求追踪
mc admin prometheus generate local     # 生成 Prometheus 配置
```

### 5.2 监控指标

| 指标 | 获取方式 | 告警阈值 |
|------|----------|----------|
| **磁盘使用率** | `mc admin info` → Usage | > 80% |
| **磁盘健康** | `mc admin info` → Health | offline |
| **在线节点数** | `mc admin info` → Servers | < 预期 |
| **S3 请求延迟** | Prometheus `minio_s3_requests_ttfb_seconds` | P99 > 1s |
| **网络发送/接收** | Prometheus `minio_network_*` | 接近带宽上限 |

**Prometheus 配置**：

```yaml
# minio 自带 /minio/v2/metrics/endpoint
scrape_configs:
  - job_name: minio
    metrics_path: /minio/v2/metrics/cluster
    scheme: https
    static_configs:
      - targets: ['minio.example.com:9000']
    basic_auth:
      username: admin
      password: ProdStr0ngMinIO!Pass16
```

### 5.3 备份与恢复

```bash
# Bucket 级别备份（mc mirror）
mc mirror --watch local/mybucket /backup/mybucket

# 跨站点备份（mc replicate）
mc admin bucket replicate add local/mybucket \
  --remote-bucket remote/mybucket-backup

# 版本控制（防误删）
mc version enable local/mybucket
mc undo local/mybucket/file.txt  # 恢复上一版本
```

---

## 6. 故障排查

### 6.1 常见故障

#### 故障 1：磁盘空间不足

**排查**：

```bash
mc admin info local
# 查看各磁盘使用率
```

**解决**：增加磁盘 → 调整 `--storage-class` 提高存储效率 → 清理过期对象（生命周期策略）

#### 故障 2：节点离线

**排查**：

```bash
mc admin info local
# 显示 offline 的节点
```

**解决**：检查节点网络和磁盘 → 重启节点 → 节点自动重新加入并同步

#### 故障 3：S3 请求超时

**排查**：

```bash
mc admin trace local --verbose
# 查看请求耗时和错误
```

**解决**：检查网络带宽 → 增大纠删码集 → 优化对象大小

### 6.2 诊断工具

| 工具 | 用途 |
|------|------|
| `mc admin info` | 集群状态和磁盘信息 |
| `mc admin trace` | 实时请求追踪 |
| `mc admin heal` | 数据修复扫描 |
| `mc admin prometheus` | 监控配置 |
| Prometheus metrics | `:9000/minio/v2/metrics/cluster` |

### 6.3 数据修复

```bash
# 手动触发修复扫描
mc admin heal local --recursive --verbose

# 修复特定 bucket
mc admin heal local/mybucket --recursive
```

---

## 7. 参考资料

- [MinIO Documentation](https://min.io/docs/minio/linux/)
- [MinIO Erasure Coding](https://min.io/docs/minio/linux/operations/concepts/erasure-coding.html)
- [MinIO Multi-Site Replication](https://min.io/docs/minio/linux/operations/deploy-sites.html)
- [mc Client Guide](https://min.io/docs/minio/linux/reference/minio-mc.html)

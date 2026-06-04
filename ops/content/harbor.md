# Harbor 部署运维指南

> **定位**：CNCF 开源的企业级容器镜像仓库
> **适用场景**：私有 Docker 镜像仓库、镜像安全扫描、多租户、镜像签名
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Harbor 是 CNCF 开源的企业级容器镜像仓库，基于 Docker Registry，增加 RBAC、镜像安全扫描（Trivy）、镜像签名（Notary）、复制、审计日志等企业级特性。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **RBAC** | 基于项目的权限控制 |
| **安全扫描** | Trivy 镜像漏洞扫描 |
| **镜像签名** | Notary 内容信任 |
| **复制** | 跨 Harbor 实例镜像同步 |
| **垃圾回收** | 无用镜像层自动清理 |
| **审计日志** | 操作审计追踪 |

---

## 2. 部署

### 2.1 安装（Harbor Installer）

```bash
# 下载
wget https://github.com/goharbor/harbor/releases/download/v2.11.0/harbor-offline-installer-v2.11.0.tgz
tar xzf harbor-offline-installer-v2.11.0.tgz && cd harbor

# 配置
cp harbor.yml.tmpl harbor.yml
# 编辑 harbor.yml

# 安装
sudo ./install.sh --with-trivy --with-notary

# 管理
sudo docker compose -f docker-compose.yml start
sudo docker compose -f docker-compose.yml stop
```

### 2.2 harbor.yml 配置

```yaml
# harbor.yml — 生产环境

hostname: harbor.example.com
http:
  port: 80
https:
  port: 443
  certificate: /etc/harbor/certs/server.crt
  private_key: /etc/harbor/certs/server.key
  # 逻辑：生产必须 HTTPS，Docker 客户端默认拒绝 HTTP

harbor_admin_password: HarborAdmin!Pass
# 逻辑：首次启动后建议通过 UI 修改密码

database:
  password: HarborDB!Pass
  max_idle_conns: 100
  max_open_conns: 250

data_volume: /data/harbor
# 逻辑：镜像数据存储目录，建议独立磁盘

trivy:
  ignore_unfixed: true
  skip_update: false
  # 逻辑：Trivy 扫描镜像漏洞
  # ignore_unfixed → 忽略无修复版本的漏洞

log:
  level: warning
  rotate_count: 50
  rotate_size: 200M

proxy:
  http_proxy: ""
  https_proxy: ""
  no_proxy: "127.0.0.1,localhost,core,registry"
```

---

## 3. 运维

```bash
# Docker 登录
docker login harbor.example.com

# 推送镜像
docker tag myapp:latest harbor.example.com/project/myapp:latest
docker push harbor.example.com/project/myapp:latest

# 垃圾回收
# UI → Administration → Garbage Collection → Schedule

# 复制
# UI → Administration → Replication → 创建规则

# 备份
# 备份 /data/harbor/database/ 和 harbor.yml
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| `max_open_conns` | 数据库连接 | 250 | 并发推送/拉取多时增大 |
| 垃圾回收 | 清理无用层 | 每日 | 不清理 → 磁盘持续增长 |
| Redis | 缓存 | 独立实例 | Harbor 内置 Redis，生产可外置 |

---

## 7. 参考资料

- [Harbor Documentation](https://goharbor.io/docs/)
- [Harbor Installation](https://goharbor.io/docs/2.11.0/install-config/)
- [Harbor Configuration](https://goharbor.io/docs/2.11.0/install-config/configure-yml-file/)

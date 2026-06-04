# Nexus 部署运维指南

> **定位**：Sonatype 开源的制品仓库管理器
> **适用场景**：Maven/npm/Docker/Helm/PyPI 制品仓库、依赖代理、安全审计
> **难度级别**：⭐⭐ 中等

---

## 1. 概述

### 1.1 是什么

Nexus Repository Manager 是开源的制品仓库管理器，支持 Maven/npm/Docker/Helm/PyPI/Raw 等多种格式，提供代理仓库（Proxy）、托管仓库（Hosted）、仓库组（Group）三种模式。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **多格式** | Maven/npm/Docker/Helm/PyPI/Raw 等 |
| **代理仓库** | 缓存中央仓库，加速下载 |
| **托管仓库** | 内部制品发布 |
| **仓库组** | 聚合多个仓库统一访问 |
| **安全审计** | 制品安全扫描（Nexus IQ） |
| **RBAC** | 基于角色的访问控制 |

---

## 2. 部署

### 2.1 Docker 部署

```bash
docker run -d \
  --name nexus \
  -p 8081:8081 \
  -p 5000:5000 \
  -v nexus-data:/nexus-data \
  --restart unless-stopped \
  sonatype/nexus3:3.72.0
```

> **端口 5000**：Docker 仓库的 HTTP Connector 端口（需在 UI 中配置）

### 2.2 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  nexus:
    image: sonatype/nexus3:3.72.0
    container_name: nexus
    restart: unless-stopped
    ports:
      - "8081:8081"
      - "5000:5000"
    volumes:
      - nexus-data:/nexus-data
    deploy:
      resources:
        limits:
          memory: 4g

volumes:
  nexus-data:
```

**初始密码**：`/nexus-data/admin.password`（首次登录后修改）

---

## 3. 配置

### 3.2 生产环境配置

通过 UI 配置为主，关键配置项：

| 配置 | 说明 |
|------|------|
| **Blob Store** | 存储后端（文件系统/S3） |
| **Proxy 仓库** | 代理 Maven Central/npm/Docker Hub |
| **Hosted 仓库** | 内部制品仓库 |
| **Group 仓库** | 聚合 Proxy + Hosted |
| **Docker 仓库** | HTTP Connector 端口 5000 |
| **Cleanup Policy** | 自动清理旧版本 |

**nexus.properties**（高级配置）：

```properties
# 数据目录
nexus.data.dir=/nexus-data
# JVM（通过环境变量）
# INSTALL4J_ADD_VM_PARAMS=-Xms1200m -Xmx1200m -XX:MaxDirectMemorySize=2g
# 逻辑：Nexus 是 Java 应用，JVM 堆 1.2G 起步
# MaxDirectMemorySize 影响 Lucene 索引性能
```

---

## 4. 调优

| 参数 | 作用 | 推荐值 | 调优逻辑 |
|------|------|--------|----------|
| JVM 堆 | Java 堆大小 | 1.2G-4G | 制品多时增大 |
| Blob Store | 存储后端 | S3（大型） | 大量制品用 S3，本地磁盘有限 |
| Cleanup Policy | 自动清理 | 按版本数 | 保留最近 N 个版本，自动清理旧版本 |
| 代理缓存 | Proxy 仓库 TTL | 1440min | 缓存远程制品，减少外网访问 |

---

## 5. 运维

```bash
# Maven 配置（settings.xml）
<server>
  <id>nexus</id>
  <username>admin</username>
  <password>Nexus!Pass</password>
</server>
<mirror>
  <id>nexus</id>
  <url>http://nexus:8081/repository/maven-group/</url>
  <mirrorOf>*</mirrorOf>
</mirror>

# npm 配置
npm config set registry http://nexus:8081/repository/npm-group/

# Docker 配置
# /etc/docker/daemon.json
{
  "insecure-registries": ["nexus:5000"]
}
docker login nexus:5000

# 备份
# 导出 Blob Store 目录
# 或使用 Nexus Backup API
```

---

## 7. 参考资料

- [Nexus Repository Documentation](https://help.sonatype.com/en/repository-manager-3.html)
- [Nexus Docker Registry](https://help.sonatype.com/en/docker-registry.html)

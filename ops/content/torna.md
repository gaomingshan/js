# Torna 部署运维指南

> **定位**：开源 API 文档与调试管理平台，Swagger 增强
> **适用场景**：API 文档管理、接口调试、团队协作、API 全生命周期
> **难度级别**：⭐ 低

---

## 1. 概述

### 1.1 是什么

Torna 是开源的 API 文档管理平台，弥补 Swagger 只能浏览不能管理的不足，支持 Swagger/OpenAPI 自动推送、接口调试、Mock、权限管理、变更通知。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| **自动推送** | Swagger/SpringDoc 自动推送文档到 Torna |
| **接口调试** | 类 Postman 调试环境 |
| **Mock 服务** | 自动生成 Mock 数据 |
| **权限管理** | 空间/项目/模块级权限 |
| **变更通知** | 接口变更推送钉钉/飞书/企微 |
| **多环境** | dev/test/prod 调试环境切换 |

### 1.3 适用场景

**最佳适用**：API 文档管理、接口调试、前后端协作、API 全生命周期

**不适用**：API 网关（→ APISIX/Kong）、API 测试自动化（→ Postman/Newman）

---

## 2. 部署

### 2.1 Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  torna-mysql:
    image: mysql:8.0
    container_name: torna-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: TornaMySQL!Pass
      MYSQL_DATABASE: torna
      MYSQL_USER: torna
      MYSQL_PASSWORD: TornaUser!Pass
    volumes:
      - torna-mysql-data:/var/lib/mysql
      - ./sql:/docker-entrypoint-initdb.d
    networks:
      - torna-net

  torna-server:
    image: tanghc2020/torna-server:latest
    container_name: torna-server
    restart: unless-stopped
    ports:
      - "7700:7700"
    environment:
      MYSQL_HOST: torna-mysql
      MYSQL_PORT: 3306
      MYSQL_DATABASE: torna
      MYSQL_USERNAME: torna
      MYSQL_PASSWORD: TornaUser!Pass
    depends_on:
      - torna-mysql
    networks:
      - torna-net

  torna-ui:
    image: tanghc2020/torna-ui:latest
    container_name: torna-ui
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - torna-server
    networks:
      - torna-net

volumes:
  torna-mysql-data:

networks:
  torna-net:
    driver: bridge
```

### 2.2 Spring Boot 集成

```xml
<!-- 自动推送 API 文档到 Torna -->
<dependency>
    <groupId>cn.torna</groupId>
    <artifactId>spring-doc-client</artifactId>
    <version>1.0.0</version>
</dependency>
```

```yaml
# application.yml
torna:
  url: http://torna-server:7700
  token: your-project-token
  run-env: prod
```

---

## 3. 配置

Torna 配置主要通过 UI 界面管理，关键配置项：

| 配置 | 说明 |
|------|------|
| 空间 | 顶级组织单元 |
| 项目 | 空间下的 API 项目 |
| 模块 | 项目下的 API 分组 |
| 环境 | dev/test/pre/prod 调试环境 |
| 推送 Token | 自动推送认证令牌 |

---

## 4. 运维

```bash
# 备份
mysqldump -u torna -p torna > torna_backup.sql

# 日志
docker logs torna-server
```

---

## 5. 参考资料

- [Torna Documentation](https://torna.cn/)
- [Torna GitHub](https://github.com/torna-group/torna)
